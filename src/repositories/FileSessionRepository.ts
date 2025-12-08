/**
 * File-based Session Repository Implementation (v3.4.5)
 * Sprint 3 Task 3.1: Repository Pattern Implementation
 *
 * Wraps SessionStorage interface to provide domain-oriented repository operations.
 * Delegates actual storage operations to the injected SessionStorage implementation.
 *
 * ARCHITECTURE:
 * SessionManager → FileSessionRepository → SessionStorage → File System
 *
 * This layer provides:
 * - Domain-specific query methods (findByMode, etc.)
 * - Consistent error handling
 * - Logging and monitoring hooks
 * - Abstraction from storage implementation details
 */

import { ISessionRepository } from './ISessionRepository.js';
import { SessionStorage } from '../session/storage/interface.js';
import { ThinkingSession, SessionMetadata, ThinkingMode } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { StorageError } from '../utils/errors.js';

/**
 * File-based implementation of ISessionRepository
 *
 * Delegates storage operations to an injected SessionStorage instance,
 * providing a clean repository interface for the domain layer.
 *
 * @example
 * ```typescript
 * const storage = new FileSessionStorage('./data/sessions');
 * const repository = new FileSessionRepository(storage);
 *
 * // Use repository in domain logic
 * const session = await repository.findById('session-123');
 * const mathSessions = await repository.findByMode(ThinkingMode.MATHEMATICS);
 * ```
 */
export class FileSessionRepository implements ISessionRepository {
  private storage: SessionStorage;

  /**
   * Creates a new file-based session repository
   *
   * @param storage - The underlying storage implementation to use
   *
   * @example
   * ```typescript
   * const storage = new FileSessionStorage();
   * const repository = new FileSessionRepository(storage);
   * ```
   */
  constructor(storage: SessionStorage) {
    this.storage = storage;
    logger.debug('FileSessionRepository initialized');
  }

  /**
   * Save a session to the repository
   *
   * @param session - The session to save
   * @throws {ValidationError} If session is invalid
   * @throws {StorageError} If persistence fails
   */
  async save(session: ThinkingSession): Promise<void> {
    try {
      await this.storage.saveSession(session);
      logger.debug('Session saved to repository', { sessionId: session.id });
    } catch (error) {
      logger.error('Failed to save session to repository', error as Error, {
        sessionId: session.id,
      });
      throw new StorageError(`Failed to save session: ${(error as Error).message}`);
    }
  }

  /**
   * Find a session by its unique ID
   *
   * @param id - The session ID to find
   * @returns The session if found, null otherwise
   * @throws {StorageError} If storage access fails
   */
  async findById(id: string): Promise<ThinkingSession | null> {
    try {
      const session = await this.storage.loadSession(id);
      if (session) {
        logger.debug('Session found in repository', { sessionId: id });
      } else {
        logger.debug('Session not found in repository', { sessionId: id });
      }
      return session;
    } catch (error) {
      logger.error('Failed to find session in repository', error as Error, {
        sessionId: id,
      });
      throw new StorageError(`Failed to find session: ${(error as Error).message}`);
    }
  }

  /**
   * Find all sessions in the repository
   *
   * Loads all sessions from storage. For large repositories, this may be slow.
   * Consider using findByMode() or listMetadata() for better performance.
   *
   * @returns Array of all sessions (may be empty)
   * @throws {StorageError} If storage access fails
   */
  async findAll(): Promise<ThinkingSession[]> {
    try {
      // Get all session metadata first
      const metadata = await this.storage.listSessions();

      // Load each session
      const sessions: ThinkingSession[] = [];
      for (const meta of metadata) {
        const session = await this.storage.loadSession(meta.id);
        if (session) {
          sessions.push(session);
        }
      }

      logger.debug('All sessions loaded from repository', {
        count: sessions.length,
      });

      return sessions;
    } catch (error) {
      logger.error('Failed to find all sessions in repository', error as Error);
      throw new StorageError(`Failed to find all sessions: ${(error as Error).message}`);
    }
  }

  /**
   * Find all sessions using a specific thinking mode
   *
   * @param mode - The thinking mode to filter by
   * @returns Array of sessions using the specified mode (may be empty)
   * @throws {StorageError} If storage access fails
   */
  async findByMode(mode: ThinkingMode): Promise<ThinkingSession[]> {
    try {
      // Get all session metadata first
      const metadata = await this.storage.listSessions();

      // Filter by mode and load matching sessions
      const sessions: ThinkingSession[] = [];
      for (const meta of metadata) {
        if (meta.mode === mode) {
          const session = await this.storage.loadSession(meta.id);
          if (session) {
            sessions.push(session);
          }
        }
      }

      logger.debug('Sessions found by mode', {
        mode,
        count: sessions.length,
      });

      return sessions;
    } catch (error) {
      logger.error('Failed to find sessions by mode', error as Error, { mode });
      throw new StorageError(`Failed to find sessions by mode: ${(error as Error).message}`);
    }
  }

  /**
   * List all session metadata without loading full session data
   *
   * Efficient for listings and search results where full session data
   * is not needed.
   *
   * @returns Array of session metadata (may be empty)
   * @throws {StorageError} If storage access fails
   */
  async listMetadata(): Promise<SessionMetadata[]> {
    try {
      const metadata = await this.storage.listSessions();
      logger.debug('Session metadata listed', { count: metadata.length });
      return metadata;
    } catch (error) {
      logger.error('Failed to list session metadata', error as Error);
      throw new StorageError(`Failed to list session metadata: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a session from the repository
   *
   * @param id - The session ID to delete
   * @returns true if session was deleted, false if not found
   * @throws {StorageError} If deletion fails
   */
  async delete(id: string): Promise<boolean> {
    try {
      const deleted = await this.storage.deleteSession(id);
      if (deleted) {
        logger.info('Session deleted from repository', { sessionId: id });
      } else {
        logger.debug('Session not found for deletion', { sessionId: id });
      }
      return deleted;
    } catch (error) {
      logger.error('Failed to delete session from repository', error as Error, {
        sessionId: id,
      });
      throw new StorageError(`Failed to delete session: ${(error as Error).message}`);
    }
  }

  /**
   * Check if a session exists in the repository
   *
   * @param id - The session ID to check
   * @returns true if session exists, false otherwise
   * @throws {StorageError} If storage access fails
   */
  async exists(id: string): Promise<boolean> {
    try {
      const exists = await this.storage.exists(id);
      logger.debug('Session existence checked', { sessionId: id, exists });
      return exists;
    } catch (error) {
      logger.error('Failed to check session existence', error as Error, {
        sessionId: id,
      });
      throw new StorageError(`Failed to check session existence: ${(error as Error).message}`);
    }
  }

  /**
   * Count total number of sessions in the repository
   *
   * @returns Total number of sessions
   * @throws {StorageError} If storage access fails
   */
  async count(): Promise<number> {
    try {
      const metadata = await this.storage.listSessions();
      const count = metadata.length;
      logger.debug('Session count retrieved', { count });
      return count;
    } catch (error) {
      logger.error('Failed to count sessions', error as Error);
      throw new StorageError(`Failed to count sessions: ${(error as Error).message}`);
    }
  }

  /**
   * Delete all sessions from the repository
   *
   * Permanently removes all sessions. Use with caution!
   *
   * @returns Number of sessions deleted
   * @throws {StorageError} If deletion fails
   */
  async clear(): Promise<number> {
    try {
      // Get all session IDs
      const metadata = await this.storage.listSessions();
      const count = metadata.length;

      // Delete each session
      for (const meta of metadata) {
        await this.storage.deleteSession(meta.id);
      }

      logger.warn('All sessions cleared from repository', { count });
      return count;
    } catch (error) {
      logger.error('Failed to clear repository', error as Error);
      throw new StorageError(`Failed to clear repository: ${(error as Error).message}`);
    }
  }
}
