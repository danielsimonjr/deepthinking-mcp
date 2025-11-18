/**
 * Storage Interface for Session Persistence
 *
 * Defines the contract for session storage backends. Implementations can use
 * file systems, databases, or other storage mechanisms.
 */

import { ThinkingSession, SessionMetadata } from '../../types/index.js';

/**
 * Session storage interface
 *
 * Provides CRUD operations for session persistence. All operations are async
 * to support various storage backends (files, databases, remote storage).
 */
export interface SessionStorage {
  /**
   * Initialize the storage backend
   * Creates necessary directories, tables, or connections
   */
  initialize(): Promise<void>;

  /**
   * Save a session to storage
   * Overwrites existing session if it exists
   *
   * @param session - The session to save
   */
  saveSession(session: ThinkingSession): Promise<void>;

  /**
   * Load a session from storage
   *
   * @param sessionId - The session ID to load
   * @returns The session, or null if not found
   */
  loadSession(sessionId: string): Promise<ThinkingSession | null>;

  /**
   * Delete a session from storage
   *
   * @param sessionId - The session ID to delete
   * @returns true if deleted, false if not found
   */
  deleteSession(sessionId: string): Promise<boolean>;

  /**
   * List all sessions (metadata only for performance)
   *
   * @returns Array of session metadata
   */
  listSessions(): Promise<SessionMetadata[]>;

  /**
   * Check if a session exists
   *
   * @param sessionId - The session ID to check
   * @returns true if exists, false otherwise
   */
  exists(sessionId: string): Promise<boolean>;

  /**
   * Get storage statistics
   *
   * @returns Storage metrics and health information
   */
  getStats(): Promise<StorageStats>;

  /**
   * Clean up old or incomplete sessions
   *
   * @param maxAgeMs - Maximum age in milliseconds
   * @returns Number of sessions cleaned up
   */
  cleanup(maxAgeMs: number): Promise<number>;

  /**
   * Close storage connections and release resources
   */
  close(): Promise<void>;
}

/**
 * Storage statistics
 */
export interface StorageStats {
  totalSessions: number;
  totalThoughts: number;
  storageSize: number; // in bytes
  oldestSession?: Date;
  newestSession?: Date;
  averageSessionSize: number;
  storageHealth: 'healthy' | 'warning' | 'critical';
}

/**
 * Storage configuration options
 */
export interface StorageConfig {
  /**
   * Enable automatic persistence on session updates
   */
  autoSave: boolean;

  /**
   * Debounce interval for auto-save (ms)
   */
  autoSaveDelay: number;

  /**
   * Enable compression for stored sessions
   */
  enableCompression: boolean;

  /**
   * Maximum number of sessions to keep in storage
   */
  maxSessions: number;

  /**
   * Maximum age of sessions before auto-cleanup (ms)
   */
  maxSessionAge: number;

  /**
   * Enable storage encryption
   */
  enableEncryption: boolean;

  /**
   * Custom serialization options
   */
  serialization?: {
    prettyPrint: boolean;
    includeMetadata: boolean;
  };
}

/**
 * Default storage configuration
 */
export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  autoSave: true,
  autoSaveDelay: 1000, // 1 second
  enableCompression: false,
  maxSessions: 1000,
  maxSessionAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  enableEncryption: false,
  serialization: {
    prettyPrint: false,
    includeMetadata: true,
  },
};
