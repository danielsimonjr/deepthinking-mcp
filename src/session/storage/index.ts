/**
 * Session Storage Module
 *
 * Provides pluggable persistence for thinking sessions.
 * Supports multiple storage backends (file, database, cloud).
 */

export {
  SessionStorage,
  StorageStats,
  StorageConfig,
  DEFAULT_STORAGE_CONFIG,
} from './interface.js';

export { FileSessionStore } from './file-store.js';
