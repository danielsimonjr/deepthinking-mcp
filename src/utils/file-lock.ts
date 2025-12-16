/**
 * Cross-Process File Locking Utility
 *
 * Provides file-based locking for multi-instance MCP server support.
 * Uses .lock files with process ID and timestamp for stale lock detection.
 *
 * Features:
 * - Exclusive locks for writes
 * - Shared locks for reads (multiple readers allowed)
 * - Automatic stale lock detection and cleanup
 * - Retry with exponential backoff
 * - Cross-platform (Windows/Linux/Mac)
 */

import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * Lock file content structure
 */
interface LockInfo {
  pid: number;
  hostname: string;
  timestamp: number;
  type: 'exclusive' | 'shared';
  instanceId: string;
}

/**
 * Lock acquisition options
 */
export interface LockOptions {
  /** Maximum time to wait for lock (ms). Default: 10000 */
  timeout?: number;
  /** Time between retry attempts (ms). Default: 50 */
  retryInterval?: number;
  /** Maximum age before lock is considered stale (ms). Default: 30000 */
  staleThreshold?: number;
  /** Lock type: 'exclusive' for writes, 'shared' for reads. Default: 'exclusive' */
  type?: 'exclusive' | 'shared';
}

const DEFAULT_OPTIONS: Required<LockOptions> = {
  timeout: 10000,
  retryInterval: 50,
  staleThreshold: 30000,
  type: 'exclusive',
};

// Unique instance ID for this process
const INSTANCE_ID = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Get the lock file path for a given file
 */
function getLockPath(filePath: string): string {
  return `${filePath}.lock`;
}

/**
 * Get the shared lock directory path
 */
function getSharedLockDir(filePath: string): string {
  return `${filePath}.locks`;
}

/**
 * Create lock info object
 */
function createLockInfo(type: 'exclusive' | 'shared'): LockInfo {
  return {
    pid: process.pid,
    hostname: require('os').hostname(),
    timestamp: Date.now(),
    type,
    instanceId: INSTANCE_ID,
  };
}

/**
 * Check if a lock is stale (holder process may have crashed)
 */
function isLockStale(lockInfo: LockInfo, staleThreshold: number): boolean {
  const age = Date.now() - lockInfo.timestamp;
  return age > staleThreshold;
}

/**
 * Try to read lock info from a lock file
 */
async function readLockInfo(lockPath: string): Promise<LockInfo | null> {
  try {
    const content = await fs.readFile(lockPath, 'utf-8');
    return JSON.parse(content) as LockInfo;
  } catch {
    return null;
  }
}

/**
 * Write lock info to a lock file atomically
 */
async function writeLockInfo(lockPath: string, lockInfo: LockInfo): Promise<boolean> {
  const tempPath = `${lockPath}.${INSTANCE_ID}.tmp`;
  try {
    // Write to temp file first
    await fs.writeFile(tempPath, JSON.stringify(lockInfo), { flag: 'wx' });

    // Atomic rename
    await fs.rename(tempPath, lockPath);
    return true;
  } catch (error: any) {
    // Clean up temp file if it exists
    try {
      await fs.unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }

    // EEXIST means another process created the lock
    // EPERM can happen on Windows during concurrent renames
    // ENOENT can happen if temp file was cleaned up by concurrent process
    if (error.code === 'EEXIST' || error.code === 'EPERM' || error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

/**
 * Acquire an exclusive lock on a file
 */
async function acquireExclusiveLock(
  filePath: string,
  options: Required<LockOptions>
): Promise<() => Promise<void>> {
  const lockPath = getLockPath(filePath);
  const sharedLockDir = getSharedLockDir(filePath);
  const startTime = Date.now();

  while (Date.now() - startTime < options.timeout) {
    // Check for existing exclusive lock
    const existingLock = await readLockInfo(lockPath);

    if (existingLock) {
      // Check if it's our own lock (re-entrant)
      if (existingLock.instanceId === INSTANCE_ID) {
        // Already hold the lock
        return async () => {
          await fs.unlink(lockPath).catch(() => {});
        };
      }

      // Check if stale
      if (isLockStale(existingLock, options.staleThreshold)) {
        // Remove stale lock
        await fs.unlink(lockPath).catch(() => {});
      } else {
        // Lock is held by another process, wait and retry
        await sleep(options.retryInterval);
        continue;
      }
    }

    // Check for shared locks
    try {
      const sharedLocks = await fs.readdir(sharedLockDir);
      const validSharedLocks = [];

      for (const lockFile of sharedLocks) {
        const sharedLockPath = path.join(sharedLockDir, lockFile);
        const sharedLockInfo = await readLockInfo(sharedLockPath);

        if (sharedLockInfo && !isLockStale(sharedLockInfo, options.staleThreshold)) {
          validSharedLocks.push(sharedLockInfo);
        } else {
          // Clean up stale shared lock
          await fs.unlink(sharedLockPath).catch(() => {});
        }
      }

      if (validSharedLocks.length > 0) {
        // Active shared locks exist, wait
        await sleep(options.retryInterval);
        continue;
      }
    } catch (error: any) {
      // Directory doesn't exist = no shared locks
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    // Try to acquire exclusive lock
    const lockInfo = createLockInfo('exclusive');
    if (await writeLockInfo(lockPath, lockInfo)) {
      // Successfully acquired lock
      return async () => {
        await fs.unlink(lockPath).catch(() => {});
      };
    }

    // Failed to acquire, retry
    await sleep(options.retryInterval);
  }

  throw new Error(`Timeout acquiring exclusive lock on ${filePath} after ${options.timeout}ms`);
}

/**
 * Acquire a shared lock on a file (allows multiple readers)
 */
async function acquireSharedLock(
  filePath: string,
  options: Required<LockOptions>
): Promise<() => Promise<void>> {
  const exclusiveLockPath = getLockPath(filePath);
  const sharedLockDir = getSharedLockDir(filePath);
  const sharedLockPath = path.join(sharedLockDir, `${INSTANCE_ID}.lock`);
  const startTime = Date.now();

  while (Date.now() - startTime < options.timeout) {
    // Check for existing exclusive lock
    const exclusiveLock = await readLockInfo(exclusiveLockPath);

    if (exclusiveLock) {
      if (isLockStale(exclusiveLock, options.staleThreshold)) {
        // Remove stale exclusive lock
        await fs.unlink(exclusiveLockPath).catch(() => {});
      } else {
        // Exclusive lock is held, wait
        await sleep(options.retryInterval);
        continue;
      }
    }

    // Create shared lock directory if needed
    await fs.mkdir(sharedLockDir, { recursive: true });

    // Create our shared lock
    const lockInfo = createLockInfo('shared');
    try {
      await fs.writeFile(sharedLockPath, JSON.stringify(lockInfo), { flag: 'wx' });

      // Double-check no exclusive lock was acquired while we were creating ours
      const recheck = await readLockInfo(exclusiveLockPath);
      if (recheck && !isLockStale(recheck, options.staleThreshold)) {
        // Exclusive lock appeared, release our shared lock and retry
        await fs.unlink(sharedLockPath).catch(() => {});
        await sleep(options.retryInterval);
        continue;
      }

      // Successfully acquired shared lock
      return async () => {
        await fs.unlink(sharedLockPath).catch(() => {});
        // Clean up empty shared lock directory
        try {
          const remaining = await fs.readdir(sharedLockDir);
          if (remaining.length === 0) {
            await fs.rmdir(sharedLockDir);
          }
        } catch {
          // Ignore cleanup errors
        }
      };
    } catch (error: any) {
      if (error.code === 'EEXIST') {
        // Our lock already exists (shouldn't happen but handle it)
        return async () => {
          await fs.unlink(sharedLockPath).catch(() => {});
        };
      }
      throw error;
    }
  }

  throw new Error(`Timeout acquiring shared lock on ${filePath} after ${options.timeout}ms`);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Acquire a lock on a file
 *
 * @param filePath - Path to the file to lock
 * @param options - Lock options
 * @returns A release function to call when done with the lock
 *
 * @example
 * ```typescript
 * // Exclusive lock for writing
 * const release = await acquireLock('./data/session.json', { type: 'exclusive' });
 * try {
 *   await fs.writeFile('./data/session.json', data);
 * } finally {
 *   await release();
 * }
 *
 * // Shared lock for reading
 * const release = await acquireLock('./data/session.json', { type: 'shared' });
 * try {
 *   const data = await fs.readFile('./data/session.json');
 * } finally {
 *   await release();
 * }
 * ```
 */
export async function acquireLock(
  filePath: string,
  options?: LockOptions
): Promise<() => Promise<void>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (opts.type === 'shared') {
    return acquireSharedLock(filePath, opts);
  }
  return acquireExclusiveLock(filePath, opts);
}

/**
 * Execute a function with an exclusive lock
 *
 * @param filePath - Path to the file to lock
 * @param fn - Function to execute while holding the lock
 * @param options - Lock options
 * @returns The result of the function
 */
export async function withLock<T>(
  filePath: string,
  fn: () => Promise<T>,
  options?: Omit<LockOptions, 'type'>
): Promise<T> {
  const release = await acquireLock(filePath, { ...options, type: 'exclusive' });
  try {
    return await fn();
  } finally {
    await release();
  }
}

/**
 * Execute a function with a shared (read) lock
 *
 * @param filePath - Path to the file to lock
 * @param fn - Function to execute while holding the lock
 * @param options - Lock options
 * @returns The result of the function
 */
export async function withSharedLock<T>(
  filePath: string,
  fn: () => Promise<T>,
  options?: Omit<LockOptions, 'type'>
): Promise<T> {
  const release = await acquireLock(filePath, { ...options, type: 'shared' });
  try {
    return await fn();
  } finally {
    await release();
  }
}

/**
 * Check if a file is currently locked
 *
 * @param filePath - Path to check
 * @param staleThreshold - Time in ms before lock is considered stale
 * @returns Lock status
 */
export async function isLocked(
  filePath: string,
  staleThreshold: number = DEFAULT_OPTIONS.staleThreshold
): Promise<{ locked: boolean; type?: 'exclusive' | 'shared'; holders?: number }> {
  const exclusiveLockPath = getLockPath(filePath);
  const sharedLockDir = getSharedLockDir(filePath);

  // Check exclusive lock
  const exclusiveLock = await readLockInfo(exclusiveLockPath);
  if (exclusiveLock && !isLockStale(exclusiveLock, staleThreshold)) {
    return { locked: true, type: 'exclusive', holders: 1 };
  }

  // Check shared locks
  try {
    const sharedLocks = await fs.readdir(sharedLockDir);
    let validCount = 0;

    for (const lockFile of sharedLocks) {
      const sharedLockPath = path.join(sharedLockDir, lockFile);
      const sharedLockInfo = await readLockInfo(sharedLockPath);

      if (sharedLockInfo && !isLockStale(sharedLockInfo, staleThreshold)) {
        validCount++;
      }
    }

    if (validCount > 0) {
      return { locked: true, type: 'shared', holders: validCount };
    }
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  return { locked: false };
}

/**
 * Force remove all locks on a file (use with caution!)
 *
 * @param filePath - Path to the file
 */
export async function forceUnlock(filePath: string): Promise<void> {
  const exclusiveLockPath = getLockPath(filePath);
  const sharedLockDir = getSharedLockDir(filePath);

  // Remove exclusive lock
  await fs.unlink(exclusiveLockPath).catch(() => {});

  // Remove all shared locks
  try {
    const sharedLocks = await fs.readdir(sharedLockDir);
    for (const lockFile of sharedLocks) {
      await fs.unlink(path.join(sharedLockDir, lockFile)).catch(() => {});
    }
    await fs.rmdir(sharedLockDir).catch(() => {});
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}
