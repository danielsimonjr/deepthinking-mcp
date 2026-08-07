/**
 * Cache Module Exports (v9.0.0)
 * Phase 15A Sprint 2: Simplified to LRU only (removed unused LFU/FIFO/factory)
 *
 * ## Status: not on the live request path (verified 2026-08-07)
 *
 * Nothing under `src/` imports this barrel — `SessionManager` imports
 * `./lru.js` and `./types.js` directly. Both files behind it are live, so
 * there is no dead code here; only the barrel is unimported. Kept as the
 * conventional import surface. The published package exposes no library API
 * for it to serve: `tsup` builds the single entry `src/index.ts`, which has
 * zero exports.
 */

export { LRUCache } from "./lru.js";

export type {
  Cache,
  CacheConfig,
  CacheEntry,
  CacheStats,
  CacheStrategy,
} from "./types.js";
