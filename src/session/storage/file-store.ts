/**
 * File-based Session Storage Implementation
 *
 * Stores sessions as JSON files in a directory structure:
 * - {baseDir}/sessions/{sessionId}.json
 * - {baseDir}/metadata/index.json (for fast listings)
 *
 * Supports multi-instance MCP servers via file locking:
 * - Exclusive locks for write operations
 * - Shared locks for read operations
 * - Automatic stale lock detection and cleanup
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { ThinkingSession, SessionMetadata } from '../../types/index.js';
import {
  SessionStorage,
  StorageStats,
  StorageConfig,
  DEFAULT_STORAGE_CONFIG,
} from './interface.js';
import { logger } from '../../utils/logger.js';
import { withLock, withSharedLock, type LockOptions } from '../../utils/file-lock.js';
import { validateSessionId } from '../../utils/sanitization.js';

/**
 * Default lock options for file operations
 */
const DEFAULT_LOCK_OPTIONS: LockOptions = {
  timeout: 10000,      // 10 seconds
  retryInterval: 50,   // 50ms between retries
  staleThreshold: 30000, // 30 seconds before lock is considered stale
};

/**
 * File-based session storage with multi-instance support
 */
export class FileSessionStore implements SessionStorage {
  private baseDir: string;
  private sessionsDir: string;
  private metadataFile: string;
  private config: StorageConfig;
  private metadataCache: Map<string, SessionMetadata>;
  private initialized: boolean = false;
  private lockOptions: LockOptions;

  /**
   * Create a new FileSessionStore
   *
   * @param baseDir - Base directory for session storage
   * @param config - Storage configuration options
   */
  constructor(baseDir: string, config?: Partial<StorageConfig>) {
    this.baseDir = baseDir;
    this.sessionsDir = path.join(baseDir, 'sessions');
    this.metadataFile = path.join(baseDir, 'metadata', 'index.json');
    this.config = { ...DEFAULT_STORAGE_CONFIG, ...config };
    this.metadataCache = new Map();
    this.lockOptions = { ...DEFAULT_LOCK_OPTIONS };
  }

  /**
   * Initialize storage directories
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Create directories
      await fs.mkdir(this.sessionsDir, { recursive: true });
      await fs.mkdir(path.dirname(this.metadataFile), { recursive: true });

      // Load metadata index (with shared lock for reading)
      await this.loadMetadataIndex();

      this.initialized = true;
      logger.info('FileSessionStore initialized', {
        baseDir: this.baseDir,
        config: this.config,
      });
    } catch (error) {
      logger.error('Failed to initialize FileSessionStore', error instanceof Error ? error : new Error(String(error)), {
        baseDir: this.baseDir,
      });
      throw error;
    }
  }

  /**
   * Save a session to disk (with exclusive lock)
   * Security: Validates session ID to prevent path traversal attacks
   */
  async saveSession(session: ThinkingSession): Promise<void> {
    await this.ensureInitialized();

    // Security: Validate session ID format (defense-in-depth)
    validateSessionId(session.id);

    const sessionPath = this.getSessionPath(session.id);

    try {
      // Use exclusive lock for writing session file
      await withLock(sessionPath, async () => {
        // Prepare session for serialization (convert special types)
        const serializable = this.prepareForSerialization(session);

        // Serialize session
        const json = this.config.serialization?.prettyPrint
          ? JSON.stringify(serializable, null, 2)
          : JSON.stringify(serializable);

        // Write session file
        await fs.writeFile(sessionPath, json, 'utf-8');
      }, this.lockOptions);

      // Update metadata (with exclusive lock on metadata file)
      await this.updateMetadata(session);

      logger.debug('Session saved', { sessionId: session.id, path: sessionPath });
    } catch (error) {
      logger.error('Failed to save session', error instanceof Error ? error : new Error(String(error)), {
        sessionId: session.id,
      });
      throw error;
    }
  }

  /**
   * Load a session from disk (with shared lock)
   * Security: Validates session ID to prevent path traversal attacks
   */
  async loadSession(sessionId: string): Promise<ThinkingSession | null> {
    await this.ensureInitialized();

    // Security: Validate session ID format (defense-in-depth)
    validateSessionId(sessionId);

    const sessionPath = this.getSessionPath(sessionId);

    try {
      // Check if file exists
      try {
        await fs.access(sessionPath);
      } catch {
        // File access failed - session doesn't exist or was deleted
        // This is an expected condition for non-existent sessions
        return null;
      }

      // Use shared lock for reading (allows concurrent reads)
      const session = await withSharedLock(sessionPath, async () => {
        // Read and parse session
        const json = await fs.readFile(sessionPath, 'utf-8');
        const parsed = JSON.parse(json);

        // Restore special types
        return this.restoreFromSerialization(parsed) as ThinkingSession;
      }, this.lockOptions);

      logger.debug('Session loaded', { sessionId });
      return session;
    } catch (error) {
      logger.error('Failed to load session', error instanceof Error ? error : new Error(String(error)), { sessionId });
      return null;
    }
  }

  /**
   * Delete a session from disk (with exclusive lock)
   * Security: Validates session ID to prevent path traversal attacks
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    await this.ensureInitialized();

    // Security: Validate session ID format (defense-in-depth)
    validateSessionId(sessionId);

    const sessionPath = this.getSessionPath(sessionId);

    try {
      // Check if file exists
      try {
        await fs.access(sessionPath);
      } catch {
        // File access failed - session doesn't exist or was already deleted
        // Return false to indicate nothing was deleted
        return false;
      }

      // Use exclusive lock for deleting
      await withLock(sessionPath, async () => {
        // Delete session file
        await fs.unlink(sessionPath);
      }, this.lockOptions);

      // Remove from metadata (with exclusive lock on metadata file)
      this.metadataCache.delete(sessionId);
      await this.saveMetadataIndex();

      logger.info('Session deleted', { sessionId });
      return true;
    } catch (error) {
      logger.error('Failed to delete session', error instanceof Error ? error : new Error(String(error)), { sessionId });
      return false;
    }
  }

  /**
   * List all sessions (metadata only)
   * Refreshes from disk to get updates from other instances
   */
  async listSessions(): Promise<SessionMetadata[]> {
    await this.ensureInitialized();

    // Refresh metadata from disk to see changes from other instances
    await this.loadMetadataIndex();

    return Array.from(this.metadataCache.values());
  }

  /**
   * Check if a session exists
   * Security: Validates session ID to prevent path traversal attacks
   */
  async exists(sessionId: string): Promise<boolean> {
    await this.ensureInitialized();

    // Security: Validate session ID format (defense-in-depth)
    validateSessionId(sessionId);

    // Refresh metadata to check for updates from other instances
    await this.loadMetadataIndex();

    return this.metadataCache.has(sessionId);
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    await this.ensureInitialized();

    // Refresh metadata
    await this.loadMetadataIndex();

    const sessions = Array.from(this.metadataCache.values());
    const totalSessions = sessions.length;
    const totalThoughts = sessions.reduce((sum, s) => sum + s.thoughtCount, 0);

    // Calculate storage size
    let storageSize = 0;
    try {
      const files = await fs.readdir(this.sessionsDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.sessionsDir, file);
          const stats = await fs.stat(filePath);
          storageSize += stats.size;
        }
      }
    } catch (error) {
      logger.warn('Failed to calculate storage size', { error });
    }

    const dates = sessions
      .map((s) => new Date(s.createdAt))
      .sort((a, b) => a.getTime() - b.getTime());

    const averageSessionSize = totalSessions > 0 ? storageSize / totalSessions : 0;

    // Determine storage health
    let storageHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (totalSessions > this.config.maxSessions * 0.9) {
      storageHealth = 'critical';
    } else if (totalSessions > this.config.maxSessions * 0.7) {
      storageHealth = 'warning';
    }

    return {
      totalSessions,
      totalThoughts,
      storageSize,
      oldestSession: dates[0],
      newestSession: dates[dates.length - 1],
      averageSessionSize,
      storageHealth,
    };
  }

  /**
   * Clean up old sessions
   */
  async cleanup(maxAgeMs: number): Promise<number> {
    await this.ensureInitialized();

    // Refresh metadata first
    await this.loadMetadataIndex();

    const now = Date.now();
    const sessions = Array.from(this.metadataCache.values());
    let cleanedCount = 0;

    for (const session of sessions) {
      const age = now - new Date(session.createdAt).getTime();
      if (age > maxAgeMs) {
        await this.deleteSession(session.id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info('Cleanup completed', {
        cleanedCount,
        maxAgeMs,
        remaining: sessions.length - cleanedCount,
      });
    }

    return cleanedCount;
  }

  /**
   * Close storage (no-op for file storage)
   */
  async close(): Promise<void> {
    logger.info('FileSessionStore closed');
    this.initialized = false;
  }

  /**
   * Get file path for a session
   */
  private getSessionPath(sessionId: string): string {
    return path.join(this.sessionsDir, `${sessionId}.json`);
  }

  /**
   * Update metadata cache and index (with exclusive lock)
   */
  private async updateMetadata(session: ThinkingSession): Promise<void> {
    const metadata: SessionMetadata = {
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      thoughtCount: session.thoughts.length,
      mode: session.mode,
      isComplete: session.isComplete,
    };

    this.metadataCache.set(session.id, metadata);
    await this.saveMetadataIndex();
  }

  /**
   * Load metadata index from disk (with shared lock)
   */
  private async loadMetadataIndex(): Promise<void> {
    try {
      await fs.access(this.metadataFile);

      // Use shared lock for reading metadata
      const metadata = await withSharedLock(this.metadataFile, async () => {
        const json = await fs.readFile(this.metadataFile, 'utf-8');
        const parsed = JSON.parse(json) as any[];
        return parsed.map((item) =>
          this.restoreFromSerialization(item)
        ) as SessionMetadata[];
      }, this.lockOptions);

      this.metadataCache.clear();
      for (const meta of metadata) {
        this.metadataCache.set(meta.id, meta);
      }

      logger.debug('Metadata index loaded', {
        sessionCount: metadata.length,
      });
    } catch {
      // Metadata file doesn't exist yet (first run) or is temporarily unavailable
      // Start with empty cache - it will be populated as sessions are created
      this.metadataCache.clear();
    }
  }

  /**
   * Save metadata index to disk (with exclusive lock)
   */
  private async saveMetadataIndex(): Promise<void> {
    // First, reload to merge with any changes from other instances
    try {
      await fs.access(this.metadataFile);
      const existingJson = await fs.readFile(this.metadataFile, 'utf-8');
      const existingParsed = JSON.parse(existingJson) as any[];
      const existingMetadata = existingParsed.map((item) =>
        this.restoreFromSerialization(item)
      ) as SessionMetadata[];

      // Merge: our cache takes precedence, but include items we don't have
      for (const meta of existingMetadata) {
        if (!this.metadataCache.has(meta.id)) {
          // Check if the session file still exists
          const sessionPath = this.getSessionPath(meta.id);
          try {
            await fs.access(sessionPath);
            this.metadataCache.set(meta.id, meta);
          } catch {
            // Session file no longer exists (deleted by another instance or cleanup)
            // Skip adding to cache to prevent stale references
          }
        }
      }
    } catch {
      // Metadata file doesn't exist yet (first run) - proceed with current cache
      // The file will be created when we write the metadata below
    }

    // Now save with exclusive lock
    await withLock(this.metadataFile, async () => {
      const metadata = Array.from(this.metadataCache.values());
      const serializable = metadata.map((item) => this.prepareForSerialization(item));
      const json = JSON.stringify(serializable, null, 2);

      await fs.writeFile(this.metadataFile, json, 'utf-8');
    }, this.lockOptions);
  }

  /**
   * Ensure storage is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Prepare an object for serialization by converting special types
   * Recursively processes the object tree to handle Date and Map objects
   */
  private prepareForSerialization(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Handle Date objects
    if (obj instanceof Date) {
      return {
        _type: 'Date',
        value: obj.toISOString(),
      };
    }

    // Handle Map objects
    if (obj instanceof Map) {
      return {
        _type: 'Map',
        value: Array.from(obj.entries()),
      };
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => this.prepareForSerialization(item));
    }

    // Handle plain objects
    if (typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.prepareForSerialization(value);
      }
      return result;
    }

    // Primitive types
    return obj;
  }

  /**
   * Restore an object from serialization by reconstructing special types
   * Recursively processes the object tree to restore Date and Map objects
   */
  private restoreFromSerialization(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Check for special type markers
    if (typeof obj === 'object' && obj._type) {
      if (obj._type === 'Date') {
        return new Date(obj.value);
      }
      if (obj._type === 'Map') {
        return new Map(obj.value);
      }
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => this.restoreFromSerialization(item));
    }

    // Handle plain objects
    if (typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.restoreFromSerialization(value);
      }
      return result;
    }

    // Primitive types
    return obj;
  }
}
