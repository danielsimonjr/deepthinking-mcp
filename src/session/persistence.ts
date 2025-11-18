/**
 * Session persistence layer
 *
 * Provides pluggable persistence for sessions to prevent data loss on server restart.
 * Supports file-based storage with potential for future database backends.
 */

import { ThinkingSession } from '../types/session.js';
import { getConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Session store interface for dependency injection
 */
export interface ISessionStore {
  /**
   * Save a session to persistent storage
   */
  save(session: ThinkingSession): Promise<void>;

  /**
   * Load a session from persistent storage
   */
  load(sessionId: string): Promise<ThinkingSession | null>;

  /**
   * Delete a session from persistent storage
   */
  delete(sessionId: string): Promise<void>;

  /**
   * List all session IDs in storage
   */
  list(): Promise<string[]>;

  /**
   * Check if a session exists in storage
   */
  exists(sessionId: string): Promise<boolean>;

  /**
   * Clear all sessions from storage
   */
  clear(): Promise<void>;
}

/**
 * In-memory session store (no persistence)
 */
export class InMemorySessionStore implements ISessionStore {
  private sessions: Map<string, ThinkingSession> = new Map();

  async save(session: ThinkingSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async load(sessionId: string): Promise<ThinkingSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async list(): Promise<string[]> {
    return Array.from(this.sessions.keys());
  }

  async exists(sessionId: string): Promise<boolean> {
    return this.sessions.has(sessionId);
  }

  async clear(): Promise<void> {
    this.sessions.clear();
  }
}

/**
 * File-based session store
 *
 * Stores each session as a JSON file in a directory
 */
export class FileSessionStore implements ISessionStore {
  private baseDir: string;

  constructor(baseDir?: string) {
    const config = getConfig();
    this.baseDir = baseDir || config.persistenceDir;
  }

  /**
   * Ensure the storage directory exists
   */
  private async ensureDir(): Promise<void> {
    if (!existsSync(this.baseDir)) {
      await fs.mkdir(this.baseDir, { recursive: true });
    }
  }

  /**
   * Get the file path for a session
   */
  private getFilePath(sessionId: string): string {
    // Sanitize session ID to prevent directory traversal
    const safeId = sessionId.replace(/[^a-zA-Z0-9-]/g, '');
    return join(this.baseDir, `${safeId}.json`);
  }

  /**
   * Serialize a session for storage
   *
   * Handles Date objects and Maps that don't serialize well to JSON
   */
  private serializeSession(session: ThinkingSession): string {
    const serializable = {
      ...session,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      thoughts: session.thoughts.map((thought) => ({
        ...thought,
        timestamp: thought.timestamp.toISOString(),
      })),
      metrics: {
        ...session.metrics,
        customMetrics: Array.from(session.metrics.customMetrics.entries()),
      },
    };

    return JSON.stringify(serializable, null, 2);
  }

  /**
   * Deserialize a session from storage
   *
   * Reconstructs Date objects and Maps
   */
  private deserializeSession(json: string): ThinkingSession {
    const parsed = JSON.parse(json);

    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      updatedAt: new Date(parsed.updatedAt),
      thoughts: parsed.thoughts.map((thought: any) => ({
        ...thought,
        timestamp: new Date(thought.timestamp),
      })),
      metrics: {
        ...parsed.metrics,
        customMetrics: new Map(parsed.metrics.customMetrics),
      },
    };
  }

  async save(session: ThinkingSession): Promise<void> {
    try {
      await this.ensureDir();
      const filePath = this.getFilePath(session.id);
      const json = this.serializeSession(session);

      // Write atomically using a temporary file
      const tempPath = `${filePath}.tmp`;
      await fs.writeFile(tempPath, json, 'utf-8');
      await fs.rename(tempPath, filePath);

      logger.debug('Session saved to disk', { sessionId: session.id, filePath });
    } catch (error) {
      logger.error('Failed to save session to disk', error as Error, {
        sessionId: session.id,
      });
      throw error;
    }
  }

  async load(sessionId: string): Promise<ThinkingSession | null> {
    try {
      const filePath = this.getFilePath(sessionId);

      if (!existsSync(filePath)) {
        return null;
      }

      const json = await fs.readFile(filePath, 'utf-8');
      const session = this.deserializeSession(json);

      logger.debug('Session loaded from disk', { sessionId, filePath });
      return session;
    } catch (error) {
      logger.error('Failed to load session from disk', error as Error, { sessionId });
      return null;
    }
  }

  async delete(sessionId: string): Promise<void> {
    try {
      const filePath = this.getFilePath(sessionId);

      if (existsSync(filePath)) {
        await fs.unlink(filePath);
        logger.debug('Session deleted from disk', { sessionId, filePath });
      }
    } catch (error) {
      logger.error('Failed to delete session from disk', error as Error, { sessionId });
      throw error;
    }
  }

  async list(): Promise<string[]> {
    try {
      await this.ensureDir();
      const files = await fs.readdir(this.baseDir);

      return files
        .filter((file) => file.endsWith('.json'))
        .map((file) => file.replace('.json', ''));
    } catch (error) {
      logger.error('Failed to list sessions from disk', error as Error);
      return [];
    }
  }

  async exists(sessionId: string): Promise<boolean> {
    const filePath = this.getFilePath(sessionId);
    return existsSync(filePath);
  }

  async clear(): Promise<void> {
    try {
      await this.ensureDir();
      const files = await fs.readdir(this.baseDir);

      await Promise.all(
        files
          .filter((file) => file.endsWith('.json'))
          .map((file) => fs.unlink(join(this.baseDir, file)))
      );

      logger.info('All sessions cleared from disk');
    } catch (error) {
      logger.error('Failed to clear sessions from disk', error as Error);
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalSessions: number;
    totalSize: number;
    oldestSession: Date | null;
    newestSession: Date | null;
  }> {
    try {
      await this.ensureDir();
      const files = await fs.readdir(this.baseDir);
      const jsonFiles = files.filter((file) => file.endsWith('.json'));

      let totalSize = 0;
      let oldestSession: Date | null = null;
      let newestSession: Date | null = null;

      for (const file of jsonFiles) {
        const filePath = join(this.baseDir, file);
        const stats = await fs.stat(filePath);
        totalSize += stats.size;

        if (!oldestSession || stats.mtime < oldestSession) {
          oldestSession = stats.mtime;
        }
        if (!newestSession || stats.mtime > newestSession) {
          newestSession = stats.mtime;
        }
      }

      return {
        totalSessions: jsonFiles.length,
        totalSize,
        oldestSession,
        newestSession,
      };
    } catch (error) {
      logger.error('Failed to get storage stats', error as Error);
      return {
        totalSessions: 0,
        totalSize: 0,
        oldestSession: null,
        newestSession: null,
      };
    }
  }
}

/**
 * Create a session store based on configuration
 */
export function createSessionStore(): ISessionStore {
  const config = getConfig();

  if (config.enablePersistence) {
    logger.info('Using file-based session persistence', {
      directory: config.persistenceDir,
    });
    return new FileSessionStore();
  } else {
    logger.info('Using in-memory session storage (no persistence)');
    return new InMemorySessionStore();
  }
}
