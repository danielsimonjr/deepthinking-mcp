/**
 * File-based Session Storage Implementation
 *
 * Stores sessions as JSON files in a directory structure:
 * - {baseDir}/sessions/{sessionId}.json
 * - {baseDir}/metadata/index.json (for fast listings)
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

/**
 * File-based session storage
 */
export class FileSessionStore implements SessionStorage {
  private baseDir: string;
  private sessionsDir: string;
  private metadataFile: string;
  private config: StorageConfig;
  private metadataCache: Map<string, SessionMetadata>;
  private initialized: boolean = false;

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

      // Load metadata index
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
   * Save a session to disk
   */
  async saveSession(session: ThinkingSession): Promise<void> {
    await this.ensureInitialized();

    try {
      const sessionPath = this.getSessionPath(session.id);

      // Prepare session for serialization (convert special types)
      const serializable = this.prepareForSerialization(session);

      // Serialize session
      const json = this.config.serialization?.prettyPrint
        ? JSON.stringify(serializable, null, 2)
        : JSON.stringify(serializable);

      // Write session file
      await fs.writeFile(sessionPath, json, 'utf-8');

      // Update metadata
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
   * Load a session from disk
   */
  async loadSession(sessionId: string): Promise<ThinkingSession | null> {
    await this.ensureInitialized();

    try {
      const sessionPath = this.getSessionPath(sessionId);

      // Check if file exists
      try {
        await fs.access(sessionPath);
      } catch {
        return null; // File doesn't exist
      }

      // Read and parse session
      const json = await fs.readFile(sessionPath, 'utf-8');
      const parsed = JSON.parse(json);

      // Restore special types
      const session = this.restoreFromSerialization(parsed) as ThinkingSession;

      logger.debug('Session loaded', { sessionId });
      return session;
    } catch (error) {
      logger.error('Failed to load session', error instanceof Error ? error : new Error(String(error)), { sessionId });
      return null;
    }
  }

  /**
   * Delete a session from disk
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      const sessionPath = this.getSessionPath(sessionId);

      // Check if file exists
      try {
        await fs.access(sessionPath);
      } catch {
        return false; // File doesn't exist
      }

      // Delete session file
      await fs.unlink(sessionPath);

      // Remove from metadata
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
   */
  async listSessions(): Promise<SessionMetadata[]> {
    await this.ensureInitialized();
    return Array.from(this.metadataCache.values());
  }

  /**
   * Check if a session exists
   */
  async exists(sessionId: string): Promise<boolean> {
    await this.ensureInitialized();
    return this.metadataCache.has(sessionId);
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    await this.ensureInitialized();

    const sessions = Array.from(this.metadataCache.values());
    const totalSessions = sessions.length;
    const totalThoughts = sessions.reduce((sum, s) => sum + s.thoughtCount, 0);

    // Calculate storage size
    let storageSize = 0;
    try {
      const files = await fs.readdir(this.sessionsDir);
      for (const file of files) {
        const filePath = path.join(this.sessionsDir, file);
        const stats = await fs.stat(filePath);
        storageSize += stats.size;
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
   * Update metadata cache and index
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
   * Load metadata index from disk
   */
  private async loadMetadataIndex(): Promise<void> {
    try {
      await fs.access(this.metadataFile);
      const json = await fs.readFile(this.metadataFile, 'utf-8');
      const parsed = JSON.parse(json) as any[];
      const metadata = parsed.map((item) =>
        this.restoreFromSerialization(item)
      ) as SessionMetadata[];

      this.metadataCache.clear();
      for (const meta of metadata) {
        this.metadataCache.set(meta.id, meta);
      }

      logger.debug('Metadata index loaded', {
        sessionCount: metadata.length,
      });
    } catch {
      // File doesn't exist yet - start with empty cache
      this.metadataCache.clear();
    }
  }

  /**
   * Save metadata index to disk
   */
  private async saveMetadataIndex(): Promise<void> {
    const metadata = Array.from(this.metadataCache.values());
    const serializable = metadata.map((item) => this.prepareForSerialization(item));
    const json = JSON.stringify(serializable, null, 2);

    await fs.writeFile(this.metadataFile, json, 'utf-8');
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
