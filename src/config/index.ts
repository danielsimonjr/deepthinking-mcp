/**
 * Centralized configuration for DeepThinking MCP Server
 *
 * All configurable values should be defined here to enable
 * easy environment-based configuration and deployment flexibility.
 */

/**
 * Server configuration
 */
export interface ServerConfig {
  /** Maximum number of thoughts to keep in memory per session */
  maxThoughtsInMemory: number;

  /** Threshold for compressing old thoughts */
  compressionThreshold: number;

  /** Maximum content length in characters */
  maxContentLength: number;

  /** Validation tolerance for mathematical checks (e.g., mass sum) */
  validationTolerance: number;

  /** Maximum number of active sessions to keep in memory */
  maxActiveSessions: number;

  /** Session timeout in milliseconds (0 = no timeout) */
  sessionTimeoutMs: number;

  /** Enable validation result caching */
  enableValidationCache: boolean;

  /** Validation cache max size (number of entries) */
  validationCacheMaxSize: number;

  /** Enable session persistence to disk */
  enablePersistence: boolean;

  /** Directory for session persistence (if enabled) */
  persistenceDir: string;

  /** Log level: 'debug' | 'info' | 'warn' | 'error' */
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  /** Enable performance metrics logging */
  enablePerformanceMetrics: boolean;

  /** Default directory for file exports (Phase 16). Empty string = return content as text */
  exportDir: string;

  /** Overwrite existing files when exporting (Phase 16) */
  exportOverwrite: boolean;
}

/**
 * Default configuration values
 */
const defaultConfig: ServerConfig = {
  maxThoughtsInMemory: parseInt(process.env.MCP_MAX_THOUGHTS || '1000', 10),
  compressionThreshold: parseInt(process.env.MCP_COMPRESSION_THRESHOLD || '500', 10),
  maxContentLength: parseInt(process.env.MCP_MAX_CONTENT_LENGTH || '10000', 10),
  validationTolerance: parseFloat(process.env.MCP_VALIDATION_TOLERANCE || '0.01'),
  maxActiveSessions: parseInt(process.env.MCP_MAX_SESSIONS || '100', 10),
  sessionTimeoutMs: parseInt(process.env.MCP_SESSION_TIMEOUT_MS || '0', 10),
  enableValidationCache: process.env.MCP_ENABLE_VALIDATION_CACHE !== 'false',
  validationCacheMaxSize: parseInt(process.env.MCP_VALIDATION_CACHE_SIZE || '1000', 10),
  enablePersistence: process.env.MCP_ENABLE_PERSISTENCE === 'true',
  persistenceDir: process.env.MCP_PERSISTENCE_DIR || './.deepthinking-sessions',
  logLevel: (process.env.MCP_LOG_LEVEL || 'info') as ServerConfig['logLevel'],
  enablePerformanceMetrics: process.env.MCP_ENABLE_PERF_METRICS === 'true',
  exportDir: process.env.MCP_EXPORT_PATH || '',
  exportOverwrite: process.env.MCP_EXPORT_OVERWRITE === 'true',
};

/**
 * Current active configuration (can be overridden)
 */
let activeConfig: ServerConfig = { ...defaultConfig };

/**
 * Get the current configuration
 */
export function getConfig(): Readonly<ServerConfig> {
  return Object.freeze({ ...activeConfig });
}

/**
 * Update configuration (for testing or runtime changes)
 *
 * @param updates - Partial configuration to merge with existing config
 * @returns The updated configuration
 */
export function updateConfig(updates: Partial<ServerConfig>): Readonly<ServerConfig> {
  activeConfig = { ...activeConfig, ...updates };
  return getConfig();
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
  activeConfig = { ...defaultConfig };
}

/**
 * Validate configuration values
 *
 * @throws Error if configuration is invalid
 */
export function validateConfig(config: ServerConfig): void {
  if (config.maxThoughtsInMemory < 1) {
    throw new Error('maxThoughtsInMemory must be at least 1');
  }

  if (config.compressionThreshold < 0) {
    throw new Error('compressionThreshold must be non-negative');
  }

  if (config.maxContentLength < 1) {
    throw new Error('maxContentLength must be at least 1');
  }

  if (config.validationTolerance < 0 || config.validationTolerance > 1) {
    throw new Error('validationTolerance must be between 0 and 1');
  }

  if (config.maxActiveSessions < 1) {
    throw new Error('maxActiveSessions must be at least 1');
  }

  if (config.sessionTimeoutMs < 0) {
    throw new Error('sessionTimeoutMs must be non-negative');
  }

  if (config.validationCacheMaxSize < 0) {
    throw new Error('validationCacheMaxSize must be non-negative');
  }

  if (!['debug', 'info', 'warn', 'error'].includes(config.logLevel)) {
    throw new Error('logLevel must be one of: debug, info, warn, error');
  }
}

// Validate default config on load
validateConfig(activeConfig);

/**
 * Export constants for common use
 */
export const CONFIG = getConfig();
