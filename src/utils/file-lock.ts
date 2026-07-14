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

import { promises as fs } from "fs";
import * as path from "path";
import * as os from "os";
import { createLogger, LogLevel } from "./logger.js";

// Logger for file-lock operations
const logger = createLogger({ minLevel: LogLevel.WARN });

/**
 * Helper to log file deletion errors (except expected ENOENT)
 * ENOENT is expected when: lock already released, file cleaned by another process, or lock never existed
 * Other errors (EPERM, EACCES, etc.) indicate real problems that should be logged
 */
function handleUnlinkError(
  error: any,
  filePath: string,
  context: string,
): void {
  if (error && error.code !== "ENOENT") {
    logger.warn(`Failed to cleanup ${context}`, {
      path: filePath,
      code: error.code,
      message: error.message,
      pid: process.pid,
      instanceId: INSTANCE_ID,
    });
  }
}

/**
 * Lock file content structure
 */
interface LockInfo {
  pid: number;
  hostname: string;
  timestamp: number;
  type: "exclusive" | "shared";
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
  type?: "exclusive" | "shared";
}

const DEFAULT_OPTIONS: Required<LockOptions> = {
  timeout: 10000,
  retryInterval: 50,
  staleThreshold: 30000,
  type: "exclusive",
};

// Unique instance ID for this process
const INSTANCE_ID = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Monotonically increasing counter used to make per-attempt identifiers
// (temp file names, shared-lock file names) unique even when multiple
// concurrent async callers share the same process (and therefore the same
// INSTANCE_ID). Without this, concurrent same-process attempts collide on
// the same temp/lock file path and clobber each other (see nextAttemptId).
let attemptCounter = 0;

/**
 * Generate an identifier that is unique per acquisition *attempt*, not just
 * per process. `INSTANCE_ID` alone is NOT sufficient here: it is a single
 * constant shared by every concurrent async caller within this process, so
 * using it to name a temp file or shared-lock file causes concurrent
 * in-process attempts to collide on the exact same path.
 */
function nextAttemptId(): string {
  attemptCounter += 1;
  return `${INSTANCE_ID}-${attemptCounter}`;
}

/**
 * In-process mutual-exclusion queue, keyed by lock path.
 *
 * `acquireExclusiveLock` used to have NO mutual exclusion between concurrent
 * async callers in the same process: it treated a lock file whose
 * `instanceId` matched the process-wide `INSTANCE_ID` as already held by the
 * caller ("re-entrant") and granted access immediately — but every
 * concurrent caller in this process shares that same `INSTANCE_ID`, so the
 * first caller to write the lock file caused every OTHER concurrent caller
 * to be waved through too. That let concurrent writers race on
 * read-modify-write of the protected file with zero serialization, silently
 * dropping updates (e.g. FileSessionStore losing sessions from
 * metadata/index.json under concurrent saves).
 *
 * `runExclusiveInProcess` serializes same-process attempts to acquire a
 * given lock path: each attempt only starts once the previous same-process
 * attempt has finished (successfully or not), so at most one same-process
 * caller is ever inside the acquire-decide-write sequence for a given lock
 * path at a time. This is in ADDITION to the cross-process file lock, not a
 * replacement for it — cross-process callers still coordinate via the lock
 * file itself (staleness detection, etc.).
 */
const inProcessLockQueues = new Map<string, Promise<unknown>>();

function runExclusiveInProcess<T>(
  key: string,
  task: () => Promise<T>,
): Promise<T> {
  const previous = inProcessLockQueues.get(key) ?? Promise.resolve();
  // Run `task` after the previous same-key attempt settles, regardless of
  // whether it resolved or rejected — one attempt's failure/timeout must
  // never permanently block the next attempt's turn.
  const result = previous.then(task, task);
  // Track a version of the promise that never rejects, so a failed attempt
  // doesn't produce an unhandled rejection warning while still gating the
  // next attempt in the queue.
  const tracked = result.then(
    () => undefined,
    () => undefined,
  );
  inProcessLockQueues.set(key, tracked);
  // Best-effort cleanup: once this is the last queued attempt for this key,
  // remove the entry so the map doesn't grow without bound.
  void tracked.then(() => {
    if (inProcessLockQueues.get(key) === tracked) {
      inProcessLockQueues.delete(key);
    }
  });
  return result;
}

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
function createLockInfo(type: "exclusive" | "shared"): LockInfo {
  return {
    pid: process.pid,
    hostname: os.hostname(),
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
    const content = await fs.readFile(lockPath, "utf-8");
    return JSON.parse(content) as LockInfo;
  } catch {
    // Lock file doesn't exist or is unreadable - treat as unlocked
    // Expected when: no lock exists, lock was just released, file corrupted
    return null;
  }
}

/**
 * Write lock info to a lock file atomically
 */
async function writeLockInfo(
  lockPath: string,
  lockInfo: LockInfo,
): Promise<boolean> {
  // Unique PER ATTEMPT, not per process: two concurrent same-process
  // attempts must never share a temp path, or one attempt's cleanup
  // (`unlink` on EEXIST) can delete the temp file the other attempt is
  // still trying to `rename` — which surfaces as EPERM/ENOENT on Windows.
  const tempPath = `${lockPath}.${nextAttemptId()}.tmp`;
  try {
    // Write to temp file first
    await fs.writeFile(tempPath, JSON.stringify(lockInfo), { flag: "wx" });

    // Atomic rename
    await fs.rename(tempPath, lockPath);
    return true;
  } catch (error: any) {
    // Clean up temp file if it exists
    await fs
      .unlink(tempPath)
      .catch((err) => handleUnlinkError(err, tempPath, "temp lock file"));

    // EEXIST means another process created the lock
    // EPERM can happen on Windows during concurrent renames
    // ENOENT can happen if temp file was cleaned up by concurrent process
    if (
      error.code === "EEXIST" ||
      error.code === "EPERM" ||
      error.code === "ENOENT"
    ) {
      return false;
    }
    throw error;
  }
}

/**
 * Acquire an exclusive lock on a file
 *
 * Serialized per lock path via `runExclusiveInProcess` so that concurrent
 * same-process callers never both believe they hold the lock at once (see
 * the comment on `inProcessLockQueues` for the bug this fixes). The
 * cross-process file-lock protocol (staleness detection, atomic
 * write+rename) is unchanged and still governs coordination between
 * different processes/instances.
 */
async function acquireExclusiveLock(
  filePath: string,
  options: Required<LockOptions>,
): Promise<() => Promise<void>> {
  const lockPath = getLockPath(filePath);
  return runExclusiveInProcess(lockPath, () =>
    acquireExclusiveLockAttempt(filePath, lockPath, options),
  );
}

async function acquireExclusiveLockAttempt(
  filePath: string,
  lockPath: string,
  options: Required<LockOptions>,
): Promise<() => Promise<void>> {
  const sharedLockDir = getSharedLockDir(filePath);
  const startTime = Date.now();

  while (Date.now() - startTime < options.timeout) {
    // Check for existing exclusive lock
    const existingLock = await readLockInfo(lockPath);

    if (existingLock) {
      // NOTE: there is intentionally no "is this our own lock" re-entrant
      // short-circuit here. `instanceId` identifies a PROCESS, not a
      // logical caller — every concurrent async caller in this process
      // shares the same instanceId, so treating a same-instanceId lock as
      // "already held by me" would grant the lock to unrelated concurrent
      // callers too (the original bug). No call site in this codebase
      // relies on genuine re-entrancy (nested acquisition of the same lock
      // path within one logical call); if that's ever needed, it must be
      // keyed on a real per-attempt owner token, not the process-wide
      // instanceId.

      // Check if stale
      if (isLockStale(existingLock, options.staleThreshold)) {
        // Remove stale lock
        await fs
          .unlink(lockPath)
          .catch((err) =>
            handleUnlinkError(err, lockPath, "stale exclusive lock"),
          );
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

        if (
          sharedLockInfo &&
          !isLockStale(sharedLockInfo, options.staleThreshold)
        ) {
          validSharedLocks.push(sharedLockInfo);
        } else {
          // Clean up stale shared lock
          await fs
            .unlink(sharedLockPath)
            .catch((err) =>
              handleUnlinkError(err, sharedLockPath, "stale shared lock"),
            );
        }
      }

      if (validSharedLocks.length > 0) {
        // Active shared locks exist, wait
        await sleep(options.retryInterval);
        continue;
      }
    } catch (error: any) {
      // Directory doesn't exist = no shared locks
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    // Try to acquire exclusive lock
    const lockInfo = createLockInfo("exclusive");
    if (await writeLockInfo(lockPath, lockInfo)) {
      // Successfully acquired lock
      return async () => {
        await fs
          .unlink(lockPath)
          .catch((err) => handleUnlinkError(err, lockPath, "exclusive lock"));
      };
    }

    // Failed to acquire, retry
    await sleep(options.retryInterval);
  }

  throw new Error(
    `Timeout acquiring exclusive lock on ${filePath} after ${options.timeout}ms`,
  );
}

/**
 * Acquire a shared lock on a file (allows multiple readers)
 */
async function acquireSharedLock(
  filePath: string,
  options: Required<LockOptions>,
): Promise<() => Promise<void>> {
  const exclusiveLockPath = getLockPath(filePath);
  const sharedLockDir = getSharedLockDir(filePath);
  // Unique PER ATTEMPT (per call to acquireSharedLock), not per process:
  // otherwise concurrent same-process readers would all write to the exact
  // same shared-lock file, and one reader releasing (unlinking) its "shared"
  // lock would silently drop the others' too, letting an exclusive writer
  // sneak in while they're still reading.
  const sharedLockPath = path.join(sharedLockDir, `${nextAttemptId()}.lock`);
  const startTime = Date.now();

  while (Date.now() - startTime < options.timeout) {
    // Check for existing exclusive lock
    const exclusiveLock = await readLockInfo(exclusiveLockPath);

    if (exclusiveLock) {
      if (isLockStale(exclusiveLock, options.staleThreshold)) {
        // Remove stale exclusive lock
        await fs
          .unlink(exclusiveLockPath)
          .catch((err) =>
            handleUnlinkError(err, exclusiveLockPath, "stale exclusive lock"),
          );
      } else {
        // Exclusive lock is held, wait
        await sleep(options.retryInterval);
        continue;
      }
    }

    // Create shared lock directory if needed
    await fs.mkdir(sharedLockDir, { recursive: true });

    // Create our shared lock
    const lockInfo = createLockInfo("shared");
    try {
      await fs.writeFile(sharedLockPath, JSON.stringify(lockInfo), {
        flag: "wx",
      });

      // Double-check no exclusive lock was acquired while we were creating ours
      const recheck = await readLockInfo(exclusiveLockPath);
      if (recheck && !isLockStale(recheck, options.staleThreshold)) {
        // Exclusive lock appeared, release our shared lock and retry
        await fs
          .unlink(sharedLockPath)
          .catch((err) =>
            handleUnlinkError(err, sharedLockPath, "shared lock rollback"),
          );
        await sleep(options.retryInterval);
        continue;
      }

      // Successfully acquired shared lock
      return async () => {
        await fs
          .unlink(sharedLockPath)
          .catch((err) =>
            handleUnlinkError(err, sharedLockPath, "shared lock"),
          );
        // Clean up empty shared lock directory
        try {
          const remaining = await fs.readdir(sharedLockDir);
          if (remaining.length === 0) {
            await fs.rmdir(sharedLockDir);
          }
        } catch {
          // Directory cleanup is best-effort - may have concurrent readers adding locks
          // or may be deleted by another process releasing the last shared lock
        }
      };
    } catch (error: any) {
      if (error.code === "EEXIST") {
        // Our lock already exists (shouldn't happen but handle it)
        return async () => {
          await fs
            .unlink(sharedLockPath)
            .catch((err) =>
              handleUnlinkError(err, sharedLockPath, "existing shared lock"),
            );
        };
      }
      throw error;
    }
  }

  throw new Error(
    `Timeout acquiring shared lock on ${filePath} after ${options.timeout}ms`,
  );
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  options?: LockOptions,
): Promise<() => Promise<void>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (opts.type === "shared") {
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
  options?: Omit<LockOptions, "type">,
): Promise<T> {
  const release = await acquireLock(filePath, {
    ...options,
    type: "exclusive",
  });
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
  options?: Omit<LockOptions, "type">,
): Promise<T> {
  const release = await acquireLock(filePath, { ...options, type: "shared" });
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
  staleThreshold: number = DEFAULT_OPTIONS.staleThreshold,
): Promise<{
  locked: boolean;
  type?: "exclusive" | "shared";
  holders?: number;
}> {
  const exclusiveLockPath = getLockPath(filePath);
  const sharedLockDir = getSharedLockDir(filePath);

  // Check exclusive lock
  const exclusiveLock = await readLockInfo(exclusiveLockPath);
  if (exclusiveLock && !isLockStale(exclusiveLock, staleThreshold)) {
    return { locked: true, type: "exclusive", holders: 1 };
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
      return { locked: true, type: "shared", holders: validCount };
    }
  } catch (error: any) {
    if (error.code !== "ENOENT") {
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
  await fs
    .unlink(exclusiveLockPath)
    .catch((err) =>
      handleUnlinkError(err, exclusiveLockPath, "force unlock exclusive"),
    );

  // Remove all shared locks
  try {
    const sharedLocks = await fs.readdir(sharedLockDir);
    for (const lockFile of sharedLocks) {
      await fs
        .unlink(path.join(sharedLockDir, lockFile))
        .catch((err) =>
          handleUnlinkError(
            err,
            path.join(sharedLockDir, lockFile),
            "force unlock shared lock",
          ),
        );
    }
    await fs
      .rmdir(sharedLockDir)
      .catch((err) =>
        handleUnlinkError(err, sharedLockDir, "force unlock shared dir"),
      );
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}
