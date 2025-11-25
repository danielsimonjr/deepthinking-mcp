/**
 * Dependency Injection Interfaces (v3.4.5)
 * Sprint 3 Task 3.2: Dependency Injection
 *
 * Exports all dependency interfaces for clean imports across the codebase.
 *
 * USAGE:
 * ```typescript
 * import { ILogger } from './interfaces/index.js';
 * import { Cache } from './cache/types.js';
 *
 * class MyService {
 *   constructor(
 *     private logger: ILogger,
 *     private cache: Cache<MyData>
 *   ) {}
 * }
 * ```
 */

export { ILogger } from './ILogger.js';

// Re-export Cache interface from cache module for convenience
export { Cache, CacheConfig, CacheStats } from '../cache/types.js';
