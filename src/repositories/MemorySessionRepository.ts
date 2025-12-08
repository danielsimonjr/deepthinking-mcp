/**
 * In-Memory Session Repository Implementation (v3.4.5)
 * Sprint 3 Task 3.1: Repository Pattern Implementation
 *
 * Fast, in-memory repository implementation for testing and development.
 * All data is stored in memory and lost when the process exits.
 *
 * USAGE:
 * - Unit tests: Fast, isolated tests without file system dependencies
 * - Integration tests: Quick setup/teardown for test fixtures
 * - Development: Rapid prototyping without persistence overhead
 * - CI/CD: Fast test execution in ephemeral environments
 *
 * NOT FOR PRODUCTION: Data is not persisted and will be lost on restart.
 */

import { ISessionRepository } from './ISessionRepository.js';
import { ThinkingSession, SessionMetadata, ThinkingMode } from '../types/index.js';

/**
 * In-memory implementation of ISessionRepository
 *
 * Stores all sessions in a Map for fast access. No persistence.
 * Ideal for testing scenarios where you need predictable, isolated state.
 *
 * @example
 * ```typescript
 * // In unit tests
 * describe('SessionManager', () => {
 *   let repository: ISessionRepository;
 *
 *   beforeEach(() => {
 *     repository = new MemorySessionRepository();
 *   });
 *
 *   it('should create a session', async () => {
 *     await repository.save(mockSession);
 *     expect(await repository.exists(mockSession.id)).toBe(true);
 *   });
 * });
 * ```
 */
export class MemorySessionRepository implements ISessionRepository {
  private sessions: Map<string, ThinkingSession>;

  /**
   * Creates a new in-memory session repository
   *
   * @example
   * ```typescript
   * const repository = new MemorySessionRepository();
   * ```
   */
  constructor() {
    this.sessions = new Map();
  }

  /**
   * Save a session to memory
   *
   * @param session - The session to save
   */
  async save(session: ThinkingSession): Promise<void> {
    // Deep clone to prevent mutations affecting stored data
    const clone = this.deepClone(session);
    this.sessions.set(session.id, clone);
  }

  /**
   * Find a session by its unique ID
   *
   * @param id - The session ID to find
   * @returns The session if found, null otherwise
   */
  async findById(id: string): Promise<ThinkingSession | null> {
    const session = this.sessions.get(id);
    // Return clone to prevent mutations
    return session ? this.deepClone(session) : null;
  }

  /**
   * Find all sessions in memory
   *
   * @returns Array of all sessions (may be empty)
   */
  async findAll(): Promise<ThinkingSession[]> {
    // Return clones to prevent mutations
    return Array.from(this.sessions.values()).map(s => this.deepClone(s));
  }

  /**
   * Find all sessions using a specific thinking mode
   *
   * @param mode - The thinking mode to filter by
   * @returns Array of sessions using the specified mode (may be empty)
   */
  async findByMode(mode: ThinkingMode): Promise<ThinkingSession[]> {
    const sessions = Array.from(this.sessions.values())
      .filter(s => s.mode === mode)
      .map(s => this.deepClone(s));
    return sessions;
  }

  /**
   * List all session metadata without loading full session data
   *
   * @returns Array of session metadata (may be empty)
   */
  async listMetadata(): Promise<SessionMetadata[]> {
    return Array.from(this.sessions.values()).map(session => ({
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      thoughtCount: session.thoughts.length,
      mode: session.mode,
      isComplete: session.isComplete,
    }));
  }

  /**
   * Delete a session from memory
   *
   * @param id - The session ID to delete
   * @returns true if session was deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    return this.sessions.delete(id);
  }

  /**
   * Check if a session exists in memory
   *
   * @param id - The session ID to check
   * @returns true if session exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    return this.sessions.has(id);
  }

  /**
   * Count total number of sessions in memory
   *
   * @returns Total number of sessions
   */
  async count(): Promise<number> {
    return this.sessions.size;
  }

  /**
   * Delete all sessions from memory
   *
   * @returns Number of sessions deleted
   */
  async clear(): Promise<number> {
    const count = this.sessions.size;
    this.sessions.clear();
    return count;
  }

  /**
   * Deep clone a session to prevent mutations
   *
   * Uses JSON serialization for simplicity. For production use cases
   * with complex objects (e.g., Date, Map), consider using a proper
   * cloning library like lodash.cloneDeep.
   *
   * @param session - The session to clone
   * @returns Deep clone of the session
   */
  private deepClone(session: ThinkingSession): ThinkingSession {
    // Serialize and deserialize to create deep clone
    const json = JSON.stringify(session);
    const clone = JSON.parse(json);

    // Restore Date objects (JSON.parse converts dates to strings)
    clone.createdAt = new Date(clone.createdAt);
    clone.updatedAt = new Date(clone.updatedAt);

    // Restore Map objects if present in metrics
    if (clone.metrics?.customMetrics) {
      clone.metrics.customMetrics = new Map(Object.entries(clone.metrics.customMetrics));
    }

    return clone;
  }

  /**
   * Get current repository state for debugging
   *
   * Returns the number of sessions in memory. Useful for debugging
   * test scenarios.
   *
   * @returns Current number of sessions
   *
   * @example
   * ```typescript
   * console.log(`Repository has ${repository.size()} sessions`);
   * ```
   */
  size(): number {
    return this.sessions.size;
  }

  /**
   * Get all session IDs currently in memory
   *
   * Useful for debugging and test assertions.
   *
   * @returns Array of session IDs
   *
   * @example
   * ```typescript
   * const ids = repository.getSessionIds();
   * console.log(`Sessions: ${ids.join(', ')}`);
   * ```
   */
  getSessionIds(): string[] {
    return Array.from(this.sessions.keys());
  }
}
