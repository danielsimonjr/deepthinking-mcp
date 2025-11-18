/**
 * Session Manager for DeepThinking MCP
 * Manages thinking sessions, persistence, and analytics
 */

import { randomUUID } from 'crypto';
import {
  ThinkingSession,
  SessionConfig,
  SessionMetrics,
  SessionMetadata,
  Thought,
  ThinkingMode,
  ExportFormat
} from '../types/index.js';
import { TemporalThought, isTemporalThought } from '../types/modes/temporal.js';
import { GameTheoryThought, isGameTheoryThought } from '../types/modes/gametheory.js';
import { EvidentialThought, isEvidentialThought } from '../types/modes/evidential.js';
import { SessionNotFoundError, InvalidModeError, InputValidationError, ErrorFactory } from '../utils/errors.js';
import { sanitizeString, sanitizeThoughtContent, validateSessionId, MAX_LENGTHS } from '../utils/sanitization.js';
import { logger, Logger, createLogger, LogLevel } from '../utils/logger.js';
import { validationCache } from '../validation/cache.js';

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
  private activeSessions: Map<string, ThinkingSession>;
  private config: Partial<SessionConfig>;
  private logger: Logger;

  /**
   * Creates a new SessionManager instance
   *
   * @param config - Optional default configuration applied to all new sessions
   * @param logLevel - Optional minimum log level (default: INFO)
   *
   * @example
   * ```typescript
   * const manager = new SessionManager({
   *   enableAutoSave: true,
   *   maxThoughtsInMemory: 500
   * }, LogLevel.DEBUG);
   * ```
   */
  constructor(config?: Partial<SessionConfig>, logLevel?: LogLevel) {
    this.activeSessions = new Map();
    this.config = config || {};
    this.logger = createLogger({
      minLevel: logLevel || LogLevel.INFO,
      enableConsole: true
    });
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
      metrics: this.initializeMetrics(),
      tags: [],
      collaborators: author ? [author] : []
    };

    this.activeSessions.set(sessionId, session);

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
   * Retrieves an active session by its unique identifier.
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
    return this.activeSessions.get(sessionId) || null;
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
    this.updateMetrics(session, thought);

    // Check if session is complete
    if (!thought.nextThoughtNeeded) {
      session.isComplete = true;
      this.logger.info('Session completed', {
        sessionId,
        title: session.title,
        totalThoughts: session.thoughts.length
      });
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
   * Returns summary information for all sessions currently managed
   * by this SessionManager instance.
   *
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
  async listSessions(): Promise<SessionMetadata[]> {
    return Array.from(this.activeSessions.values()).map(session => ({
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      thoughtCount: session.thoughts.length,
      mode: session.mode,
      isComplete: session.isComplete
    }));
  }

  /**
   * Delete a session
   *
   * Removes a session from memory. This operation cannot be undone.
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
    const deleted = this.activeSessions.delete(sessionId);

    if (deleted && session) {
      this.logger.info('Session deleted', {
        sessionId,
        title: session.title,
        thoughtCount: session.thoughts.length
      });
    } else {
      this.logger.warn('Attempted to delete non-existent session', { sessionId });
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

  /**
   * Initialize metrics (private helper)
   *
   * Creates a fresh SessionMetrics object with zero values
   */
  private initializeMetrics(): SessionMetrics {
    return {
      totalThoughts: 0,
      thoughtsByType: {},
      averageUncertainty: 0,
      revisionCount: 0,
      timeSpent: 0,
      dependencyDepth: 0,
      customMetrics: new Map(),
      cacheStats: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
        maxSize: 0,
      },
    };
  }

  /**
   * Update session metrics (private helper)
   *
   * Incrementally updates metrics using O(1) algorithms for performance.
   * Handles mode-specific metrics for temporal, game theory, and evidential modes.
   *
   * @param session - Session to update
   * @param thought - Newly added thought
   */
  private updateMetrics(session: ThinkingSession, thought: Thought): void {
    const metrics = session.metrics;

    // Update total thoughts
    metrics.totalThoughts = session.thoughts.length;

    // Update thoughtsByType incrementally (O(1) instead of recalculating)
    const thoughtType = thought.type || 'unknown';
    metrics.thoughtsByType[thoughtType] = (metrics.thoughtsByType[thoughtType] || 0) + 1;

    // Update revision count
    if (thought.isRevision) {
      metrics.revisionCount++;
    }

    // Update time spent (in milliseconds)
    metrics.timeSpent = session.updatedAt.getTime() - session.createdAt.getTime();

    // Update average uncertainty incrementally (O(1) instead of O(n))
    if ('uncertainty' in thought && typeof (thought as any).uncertainty === 'number') {
      const uncertaintyValue = (thought as any).uncertainty;
      const currentSum = metrics._uncertaintySum || 0;
      const currentCount = metrics._uncertaintyCount || 0;

      metrics._uncertaintySum = currentSum + uncertaintyValue;
      metrics._uncertaintyCount = currentCount + 1;
      metrics.averageUncertainty = metrics._uncertaintySum / metrics._uncertaintyCount;
    }

    // Update dependency depth
    if ('dependencies' in thought && thought.dependencies) {
      const deps = (thought as any).dependencies as string[];
      if (deps && deps.length > metrics.dependencyDepth) {
        metrics.dependencyDepth = deps.length;
      }
    }

    // Temporal-specific metrics (Phase 3, v2.1)
    if (isTemporalThought(thought)) {
      if (thought.events) {
        metrics.customMetrics.set('totalEvents', thought.events.length);
      }
      if (thought.timeline) {
        metrics.customMetrics.set('timelineUnit', thought.timeline.timeUnit);
      }
      if (thought.relations) {
        const causalRelations = thought.relations.filter(r => r.relationType === 'causes');
        metrics.customMetrics.set('causalRelations', causalRelations.length);
      }
      if (thought.constraints) {
        metrics.customMetrics.set('temporalConstraints', thought.constraints.length);
      }
      if (thought.intervals) {
        metrics.customMetrics.set('timeIntervals', thought.intervals.length);
      }
    }

    // Game theory-specific metrics (Phase 3, v2.2)
    if (isGameTheoryThought(thought)) {
      if (thought.players) {
        metrics.customMetrics.set('numPlayers', thought.players.length);
      }
      if (thought.strategies) {
        metrics.customMetrics.set('totalStrategies', thought.strategies.length);
        const mixedStrategies = thought.strategies.filter(s => !s.isPure);
        metrics.customMetrics.set('mixedStrategies', mixedStrategies.length);
      }
      if (thought.nashEquilibria) {
        metrics.customMetrics.set('nashEquilibria', thought.nashEquilibria.length);
        const pureEquilibria = thought.nashEquilibria.filter(e => e.type === 'pure');
        metrics.customMetrics.set('pureNashEquilibria', pureEquilibria.length);
      }
      if (thought.dominantStrategies) {
        metrics.customMetrics.set('dominantStrategies', thought.dominantStrategies.length);
      }
      if (thought.game) {
        metrics.customMetrics.set('gameType', thought.game.type);
        metrics.customMetrics.set('isZeroSum', thought.game.isZeroSum);
      }
    }

    // Evidential-specific metrics (Phase 3, v2.3)
    if (isEvidentialThought(thought)) {
      if (thought.hypotheses) {
        metrics.customMetrics.set('totalHypotheses', thought.hypotheses.length);
      }
      if (thought.evidence) {
        metrics.customMetrics.set('totalEvidence', thought.evidence.length);
        const avgReliability = thought.evidence.reduce((sum, e) => sum + e.reliability, 0) / thought.evidence.length;
        metrics.customMetrics.set('avgEvidenceReliability', avgReliability);
      }
      if (thought.beliefFunctions) {
        metrics.customMetrics.set('beliefFunctions', thought.beliefFunctions.length);
      }
      if (thought.combinedBelief) {
        metrics.customMetrics.set('hasCombinedBelief', true);
        if (thought.combinedBelief.conflictMass !== undefined) {
          metrics.customMetrics.set('conflictMass', thought.combinedBelief.conflictMass);
        }
      }
      if (thought.decisions) {
        metrics.customMetrics.set('decisions', thought.decisions.length);
      }
    }

    // Update validation cache statistics
    this.updateCacheStats(session);
  }

  /**
   * Update validation cache statistics in session metrics
   *
   * @param session - Session to update
   */
  private updateCacheStats(session: ThinkingSession): void {
    const cacheStats = validationCache.getStats();
    session.metrics.cacheStats = {
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      hitRate: cacheStats.hitRate,
      size: cacheStats.size,
      maxSize: cacheStats.maxSize,
    };
  }
}
