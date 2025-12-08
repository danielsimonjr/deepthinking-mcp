/**
 * Session Repository Interface (v3.4.5)
 * Sprint 3 Task 3.1: Repository Pattern Implementation
 *
 * Provides a domain-oriented abstraction over session persistence,
 * separating domain logic from storage implementation details.
 *
 * BENEFITS:
 * - Testability: Easy to mock for unit tests
 * - Flexibility: Can swap storage backends without changing domain logic
 * - Query abstraction: Domain-specific query methods
 * - Dependency inversion: Domain depends on interfaces, not implementations
 *
 * ARCHITECTURE:
 * Domain Layer (SessionManager) → ISessionRepository → SessionStorage → File System
 */

import { ThinkingSession, SessionMetadata, ThinkingMode } from '../types/index.js';

/**
 * Repository interface for session domain operations
 *
 * Provides CRUD operations and domain-specific queries for thinking sessions.
 * Implementations can use different storage backends (file, memory, database).
 *
 * @example
 * ```typescript
 * const repository = new FileSessionRepository(storage);
 *
 * // Save a session
 * await repository.save(session);
 *
 * // Query sessions
 * const session = await repository.findById('session-123');
 * const mathSessions = await repository.findByMode(ThinkingMode.MATHEMATICS);
 * const allSessions = await repository.findAll();
 * ```
 */
export interface ISessionRepository {
  /**
   * Save a session to the repository
   *
   * Creates a new session or updates an existing one based on session.id.
   *
   * @param session - The session to save
   * @throws {ValidationError} If session is invalid
   * @throws {StorageError} If persistence fails
   *
   * @example
   * ```typescript
   * await repository.save(session);
   * ```
   */
  save(session: ThinkingSession): Promise<void>;

  /**
   * Find a session by its unique ID
   *
   * @param id - The session ID to find
   * @returns The session if found, null otherwise
   * @throws {StorageError} If storage access fails
   *
   * @example
   * ```typescript
   * const session = await repository.findById('550e8400-e29b-41d4-a716-446655440000');
   * if (session) {
   *   console.log(`Found session: ${session.title}`);
   * }
   * ```
   */
  findById(id: string): Promise<ThinkingSession | null>;

  /**
   * Find all sessions in the repository
   *
   * Returns all sessions regardless of mode or status. For large repositories,
   * consider using findByMode() or pagination.
   *
   * @returns Array of all sessions (may be empty)
   * @throws {StorageError} If storage access fails
   *
   * @example
   * ```typescript
   * const allSessions = await repository.findAll();
   * console.log(`Total sessions: ${allSessions.length}`);
   * ```
   */
  findAll(): Promise<ThinkingSession[]>;

  /**
   * Find all sessions using a specific thinking mode
   *
   * Useful for analyzing mode-specific patterns or generating statistics.
   *
   * @param mode - The thinking mode to filter by
   * @returns Array of sessions using the specified mode (may be empty)
   * @throws {StorageError} If storage access fails
   *
   * @example
   * ```typescript
   * const mathSessions = await repository.findByMode(ThinkingMode.MATHEMATICS);
   * console.log(`Found ${mathSessions.length} mathematics sessions`);
   * ```
   */
  findByMode(mode: ThinkingMode): Promise<ThinkingSession[]>;

  /**
   * List all session metadata without loading full session data
   *
   * Efficient for listings and search results where full session data
   * is not needed. Returns lightweight metadata objects.
   *
   * @returns Array of session metadata (may be empty)
   * @throws {StorageError} If storage access fails
   *
   * @example
   * ```typescript
   * const metadata = await repository.listMetadata();
   * metadata.forEach(m => {
   *   console.log(`${m.title}: ${m.thoughtCount} thoughts`);
   * });
   * ```
   */
  listMetadata(): Promise<SessionMetadata[]>;

  /**
   * Delete a session from the repository
   *
   * Permanently removes the session and all its data. This operation
   * cannot be undone.
   *
   * @param id - The session ID to delete
   * @returns true if session was deleted, false if not found
   * @throws {StorageError} If deletion fails
   *
   * @example
   * ```typescript
   * const deleted = await repository.delete('session-123');
   * if (deleted) {
   *   console.log('Session deleted successfully');
   * }
   * ```
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if a session exists in the repository
   *
   * More efficient than findById() when you only need to check existence.
   *
   * @param id - The session ID to check
   * @returns true if session exists, false otherwise
   * @throws {StorageError} If storage access fails
   *
   * @example
   * ```typescript
   * if (await repository.exists('session-123')) {
   *   console.log('Session exists');
   * }
   * ```
   */
  exists(id: string): Promise<boolean>;

  /**
   * Count total number of sessions in the repository
   *
   * Efficient method to get total count without loading all sessions.
   *
   * @returns Total number of sessions
   * @throws {StorageError} If storage access fails
   *
   * @example
   * ```typescript
   * const count = await repository.count();
   * console.log(`Repository contains ${count} sessions`);
   * ```
   */
  count(): Promise<number>;

  /**
   * Delete all sessions from the repository
   *
   * Permanently removes all sessions. Use with caution!
   * Typically used only in testing scenarios.
   *
   * @returns Number of sessions deleted
   * @throws {StorageError} If deletion fails
   *
   * @example
   * ```typescript
   * const deleted = await repository.clear();
   * console.log(`Cleared ${deleted} sessions`);
   * ```
   */
  clear(): Promise<number>;
}
