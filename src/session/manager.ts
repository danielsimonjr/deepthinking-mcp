/**
 * Session Manager for DeepThinking MCP (v3.4.5)
 * Sprint 3 Task 3.4: Refactored to use SessionMetricsCalculator
 *
 * Manages thinking sessions, persistence, and coordinates with metrics calculator.
 */

import { randomUUID } from 'crypto';
import {
  ThinkingSession,
  SessionConfig,
  SessionMetadata,
  Thought,
  ThinkingMode
} from '../types/index.js';
import { SessionNotFoundError } from '../utils/errors.js';
import { sanitizeString, sanitizeThoughtContent, validateSessionId, MAX_LENGTHS } from '../utils/sanitization.js';
import { createLogger, LogLevel } from '../utils/logger.js';
import { ILogger } from '../interfaces/ILogger.js';
import { SessionStorage } from './storage/interface.js';
import { LRUCache } from '../cache/lru.js';
import { SessionMetricsCalculator } from './SessionMetricsCalculator.js';

/**
 * Default session configuration
 */
const DEFAULT_CONFIG: SessionConfig = {
  modeConfig: {
    mode: ThinkingMode.HYBRID,
    strictValidation: false,
    allowModeSwitch: true
  },
  enableAutoSave: true,
  enableValidation: true,
  enableVisualization: true,
  integrations: {},
  exportFormats: ['markdown', 'latex', 'json'],
  autoExportOnComplete: false,
  maxThoughtsInMemory: 1000,
  compressionThreshold: 500
};

/**
 * Session Manager - Manages thinking session lifecycle and analytics
 *
 * The SessionManager provides a centralized interface for creating, managing,
 * and analyzing deep thinking sessions across all 13 reasoning modes.
 *
 * @example
 * ```typescript
 * const manager = new SessionManager();
 * const session = await manager.createSession({
 *   title: 'Problem Analysis',
 *   mode: ThinkingMode.SEQUENTIAL
 * });
 *
 * await manager.addThought(session.id, {
 *   thought: 'Initial analysis...',
 *   thoughtNumber: 1,
 *   totalThoughts: 5,
 *   nextThoughtNeeded: true
 * });
 * ```
 */
export class SessionManager {
  private activeSessions: LRUCache<ThinkingSession>;
  private config: Partial<SessionConfig>;
  private logger: ILogger;
  private storage?: SessionStorage;
  private metricsCalculator: SessionMetricsCalculator;

  /**
   * Creates a new SessionManager instance
   *
   * @param config - Optional default configuration applied to all new sessions
   * @param logger - Optional logger instance or log level (default: INFO level logger)
   * @param storage - Optional persistent storage backend for sessions
   *
   * @example
   * ```typescript
   * // Memory-only mode with default logger
   * const manager = new SessionManager({
   *   enableAutoSave: true,
   *   maxThoughtsInMemory: 500
   * });
   *
   * // With custom logger (DI)
   * import { createLogger, LogLevel } from './utils/logger.js';
   * const logger = createLogger({ minLevel: LogLevel.DEBUG });
   * const manager = new SessionManager({}, logger);
   *
   * // With file-based persistence (backward compatible)
   * import { FileSessionStore } from './storage/file-store.js';
   * const storage = new FileSessionStore('./sessions');
   * await storage.initialize();
   * const manager = new SessionManager({}, LogLevel.INFO, storage);
   * ```
   */
  constructor(
    config?: Partial<SessionConfig>,
    logger?: ILogger | LogLevel,
    storage?: SessionStorage
  ) {
    // Initialize LRU cache for sessions (max 1000 sessions, ~10-50MB)
    this.activeSessions = new LRUCache<ThinkingSession>({
      maxSize: 1000,
      enableStats: true,
      onEvict: async (key: string, session: ThinkingSession) => {
        // Auto-save evicted sessions to persistent storage if available
        if (this.storage && session.config.enableAutoSave) {
          try {
            await this.storage.saveSession(session);
            this.logger.debug('Evicted session saved to storage', { sessionId: key });
          } catch (error) {
            this.logger.error('Failed to save evicted session', error as Error, { sessionId: key });
          }
        }
      }
    });
    this.config = config || {};
    this.storage = storage;

    // Support both ILogger injection (DI) and LogLevel (backward compatibility)
    if (logger && typeof logger === 'object' && 'info' in logger) {
      this.logger = logger;
    } else {
      this.logger = createLogger({
        minLevel: (logger as LogLevel) || LogLevel.INFO,
        enableConsole: true
      });
    }
    this.metricsCalculator = new SessionMetricsCalculator();
  }

  /**
   * Create a new thinking session
   *
   * Creates and initializes a new thinking session with the specified configuration.
   * Sessions are stored in memory and tracked until explicitly deleted.
   *
   * @param options - Session creation options
   * @param options.title - Session title (default: 'Untitled Session')
   * @param options.mode - Thinking mode to use (default: HYBRID)
   * @param options.domain - Problem domain (e.g., 'mathematics', 'physics')
   * @param options.author - Session creator/author
   * @param options.config - Session-specific configuration overrides
   * @returns Promise resolving to the created session
   *
   * @example
   * ```typescript
   * const session = await manager.createSession({
   *   title: 'Mathematical Proof',
   *   mode: ThinkingMode.MATHEMATICS,
   *   domain: 'number-theory',
   *   author: 'user@example.com'
   * });
   * ```
   */
  async createSession(options: {
    title?: string;
    mode?: ThinkingMode;
    domain?: string;
    author?: string;
    config?: Partial<SessionConfig>;
  } = {}): Promise<ThinkingSession> {
    // Validate inputs
    const title = options.title
      ? sanitizeString(options.title, MAX_LENGTHS.TITLE, 'title')
      : 'Untitled Session';

    const domain = options.domain
      ? sanitizeString(options.domain, MAX_LENGTHS.DOMAIN, 'domain')
      : undefined;

    const author = options.author
      ? sanitizeString(options.author, MAX_LENGTHS.AUTHOR, 'author')
      : undefined;

    const sessionId = randomUUID();
    const now = new Date();

    const session: ThinkingSession = {
      id: sessionId,
      title,
      mode: options.mode || ThinkingMode.HYBRID,
      domain,
      config: this.mergeConfig(options.config),
      thoughts: [],
      createdAt: now,
      updatedAt: now,
      author,
      currentThoughtNumber: 0,
      isComplete: false,
      metrics: this.metricsCalculator.initializeMetrics(),
      tags: [],
      collaborators: author ? [author] : []
    };

    this.activeSessions.set(sessionId, session);

    // Auto-save to storage if enabled
    if (this.storage && session.config.enableAutoSave) {
      try {
        await this.storage.saveSession(session);
        this.logger.debug('Session persisted to storage', { sessionId });
      } catch (error) {
        this.logger.error('Failed to persist session', error as Error, { sessionId });
        // Don't throw - session is still created in memory
      }
    }

    this.logger.info('Session created', {
      sessionId,
      title,
      mode: session.mode,
      domain,
      author
    });

    return session;
  }

  /**
   * Get a session by ID
   *
   * Retrieves a session by its unique identifier. If the session is not in memory
   * but storage is available, it will attempt to load from storage.
   *
   * @param sessionId - Unique UUID v4 identifier of the session
   * @returns Promise resolving to the session, or null if not found
   *
   * @example
   * ```typescript
   * const session = await manager.getSession('550e8400-e29b-41d4-a716-446655440000');
   * if (session) {
   *   console.log(`Session: ${session.title}`);
   *   console.log(`Thoughts: ${session.thoughts.length}`);
   * }
   * ```
   */
  async getSession(sessionId: string): Promise<ThinkingSession | null> {
    // Check memory first
    let session = this.activeSessions.get(sessionId);

    // If not in memory and storage is available, try loading from storage
    if (!session && this.storage) {
      try {
        session = (await this.storage.loadSession(sessionId)) ?? undefined;
        if (session) {
          // Add to active sessions cache
          this.activeSessions.set(sessionId, session);
          this.logger.debug('Session loaded from storage', { sessionId });
        }
      } catch (error) {
        this.logger.error('Failed to load session from storage', error as Error, { sessionId });
      }
    }

    return session || null;
  }

  /**
   * Add a thought to a session
   *
   * Adds a new thought to an existing session and automatically updates:
   * - Session metrics (uses O(1) incremental calculation)
   * - Thought timestamps
   * - Session completion status
   * - Mode-specific analytics
   *
   * @param sessionId - ID of the session to add thought to
   * @param thought - The thought object to add
   * @returns Promise resolving to the updated session
   * @throws Error if session is not found
   *
   * @example
   * ```typescript
   * await manager.addThought(session.id, {
   *   thought: 'Initial hypothesis: the problem can be solved using...',
   *   thoughtNumber: 1,
   *   totalThoughts: 5,
   *   nextThoughtNeeded: true,
   *   uncertainty: 0.3
   * });
   * ```
   */
  async addThought(sessionId: string, thought: Thought): Promise<ThinkingSession> {
    // Validate session ID
    validateSessionId(sessionId);

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      this.logger.error('Session not found', undefined, { sessionId });
      throw new SessionNotFoundError(sessionId);
    }

    // Validate thought content
    if (thought.content) {
      thought.content = sanitizeThoughtContent(thought.content);
    }

    // Update thought with session metadata
    thought.sessionId = sessionId;
    thought.timestamp = new Date();

    // Add thought to session
    session.thoughts.push(thought);
    session.currentThoughtNumber = thought.thoughtNumber;
    session.updatedAt = new Date();

    // Update metrics
    this.metricsCalculator.updateMetrics(session, thought);

    // Check if session is complete
    if (!thought.nextThoughtNeeded) {
      session.isComplete = true;
      this.logger.info('Session completed', {
        sessionId,
        title: session.title,
        totalThoughts: session.thoughts.length
      });
    }

    // Auto-save to storage if enabled
    if (this.storage && session.config.enableAutoSave) {
      try {
        await this.storage.saveSession(session);
        this.logger.debug('Session persisted after thought added', { sessionId });
      } catch (error) {
        this.logger.error('Failed to persist session', error as Error, { sessionId });
        // Don't throw - thought is still added in memory
      }
    }

    this.logger.debug('Thought added', {
      sessionId,
      thoughtNumber: thought.thoughtNumber,
      totalThoughts: session.thoughts.length
    });

    return session;
  }

  /**
   * Update session mode (switch reasoning approach mid-session)
   *
   * Changes the thinking mode of an active session. This is useful when
   * the problem requires a different reasoning approach.
   *
   * @param sessionId - ID of the session to update
   * @param newMode - New thinking mode to switch to
   * @param reason - Optional reason for the mode switch
   * @returns Promise resolving to the updated session
   * @throws Error if session is not found
   *
   * @example
   * ```typescript
   * await manager.switchMode(
   *   session.id,
   *   ThinkingMode.CAUSAL,
   *   'Need to analyze cause-effect relationships'
   * );
   * ```
   */
  async switchMode(
    sessionId: string,
    newMode: ThinkingMode,
    reason?: string
  ): Promise<ThinkingSession> {
    // Validate session ID
    validateSessionId(sessionId);

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      this.logger.error('Session not found', undefined, { sessionId });
      throw new SessionNotFoundError(sessionId);
    }

    const oldMode = session.mode;
    session.mode = newMode;
    session.config.modeConfig.mode = newMode;
    session.updatedAt = new Date();

    // Auto-save to storage if enabled
    if (this.storage && session.config.enableAutoSave) {
      try {
        await this.storage.saveSession(session);
        this.logger.debug('Session persisted after mode switch', { sessionId });
      } catch (error) {
        this.logger.error('Failed to persist session', error as Error, { sessionId });
      }
    }

    this.logger.info('Session mode switched', {
      sessionId,
      oldMode,
      newMode,
      reason
    });

    return session;
  }

  /**
   * List all active sessions with metadata
   *
   * Returns summary information for all sessions. If storage is available,
   * includes both in-memory sessions and persisted sessions.
   *
   * @param includeStoredSessions - Whether to include sessions from storage (default: true)
   * @returns Promise resolving to array of session metadata
   *
   * @example
   * ```typescript
   * const sessions = await manager.listSessions();
   * sessions.forEach(s => {
   *   console.log(`${s.title}: ${s.thoughtCount} thoughts (${s.mode})`);
   * });
   * ```
   */
  async listSessions(includeStoredSessions: boolean = true): Promise<SessionMetadata[]> {
    const memoryMetadata = Array.from(this.activeSessions.values()).map(session => ({
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      thoughtCount: session.thoughts.length,
      mode: session.mode,
      isComplete: session.isComplete
    }));

    // If no storage or not including stored sessions, return memory sessions only
    if (!this.storage || !includeStoredSessions) {
      return memoryMetadata;
    }

    // Get stored sessions and merge with memory sessions
    try {
      const storedMetadata = await this.storage.listSessions();
      const memoryIds = new Set(memoryMetadata.map(s => s.id));

      // Combine memory sessions with stored sessions (avoiding duplicates)
      const combined = [
        ...memoryMetadata,
        ...storedMetadata.filter(s => !memoryIds.has(s.id))
      ];

      return combined;
    } catch (error) {
      this.logger.error('Failed to list stored sessions', error as Error);
      return memoryMetadata; // Return memory sessions if storage fails
    }
  }

  /**
   * Delete a session
   *
   * Removes a session from memory and storage (if available).
   * This operation cannot be undone.
   *
   * @param sessionId - ID of the session to delete
   * @returns Promise that resolves when deletion is complete
   *
   * @example
   * ```typescript
   * await manager.deleteSession('old-session-id');
   * ```
   */
  async deleteSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    const deletedFromMemory = this.activeSessions.delete(sessionId);

    // Also delete from storage if available
    if (this.storage) {
      try {
        await this.storage.deleteSession(sessionId);
        this.logger.debug('Session deleted from storage', { sessionId });
      } catch (error) {
        this.logger.error('Failed to delete session from storage', error as Error, { sessionId });
      }
    }

    if (deletedFromMemory && session) {
      this.logger.info('Session deleted', {
        sessionId,
        title: session.title,
        thoughtCount: session.thoughts.length
      });
    } else {
      this.logger.warn('Attempted to delete non-existent session from memory', { sessionId });
    }
  }

  /**
   * Generate a text summary of a session
   *
   * Creates a markdown-formatted summary including:
   * - Session metadata (title, mode, status)
   * - Total thought count
   * - Key thoughts (first 100 characters of each)
   *
   * @param sessionId - ID of the session to summarize
   * @returns Promise resolving to markdown-formatted summary
   * @throws Error if session is not found
   *
   * @example
   * ```typescript
   * const summary = await manager.generateSummary(session.id);
   * console.log(summary);
   * // Output:
   * // # Mathematical Proof
   * // Mode: mathematics
   * // Total Thoughts: 15
   * // Status: Complete
   * // ...
   * ```
   */
  async generateSummary(sessionId: string): Promise<string> {
    // Validate session ID
    validateSessionId(sessionId);

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new SessionNotFoundError(sessionId);
    }

    let summary = `# ${session.title}\n\n`;
    summary += `Mode: ${session.mode}\n`;
    summary += `Total Thoughts: ${session.thoughts.length}\n`;
    summary += `Status: ${session.isComplete ? 'Complete' : 'In Progress'}\n\n`;

    summary += `## Key Thoughts:\n\n`;
    for (const thought of session.thoughts) {
      summary += `${thought.thoughtNumber}. ${thought.content.substring(0, 100)}...\n`;
    }

    return summary;
  }

  /**
   * Merge configurations (private helper)
   *
   * Combines default config, instance config, and user config
   * with proper precedence: user > instance > default
   */
  private mergeConfig(userConfig?: Partial<SessionConfig>): SessionConfig {
    return {
      ...DEFAULT_CONFIG,
      ...this.config,
      ...userConfig
    } as SessionConfig;
  }

}
