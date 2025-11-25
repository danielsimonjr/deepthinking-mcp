/**
 * Repository module exports (v3.4.5)
 * Sprint 3 Task 3.1: Repository Pattern Implementation
 *
 * Provides repository pattern abstraction for session persistence.
 * Supports multiple implementations (file-based, in-memory) for
 * flexibility and testability.
 */

export { ISessionRepository } from './ISessionRepository.js';
export { FileSessionRepository } from './FileSessionRepository.js';
export { MemorySessionRepository } from './MemorySessionRepository.js';
