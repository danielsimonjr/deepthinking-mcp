/**
 * Session Manager for DeepThinking MCP (v9.0.0)
 * Sprint 3 Task 3.4: Refactored to use SessionMetricsCalculator
 * Phase 6 Sprint 2: Integrated with MetaMonitor for meta-reasoning tracking
 * Phase 15A Sprint 2: MetaMonitor merged into SessionManager
 *
 * Manages thinking sessions, persistence, and coordinates with metrics calculator.
 * Tracks session thoughts for meta-reasoning insights and adaptive mode switching.
 * Now includes integrated meta-monitoring for strategy evaluation.
 */

import { randomUUID } from 'crypto';
import {
  ThinkingSession,
  SessionConfig,
  SessionMetadata,
  Thought,
  ThinkingMode
} from '../types/index.js';
import {
  StrategyEvaluation,
  AlternativeStrategy,
  QualityMetrics,
  SessionContext,
} from '../types/modes/metareasoning.js';
import { SessionNotFoundError } from '../utils/errors.js';
import { sanitizeString, sanitizeThoughtContent, validateSessionId, MAX_LENGTHS } from '../utils/sanitization.js';
import { createLogger, LogLevel } from '../utils/logger.js';
import { ILogger } from '../interfaces/ILogger.js';
import { SessionStorage } from './storage/interface.js';
import { LRUCache } from '../cache/lru.js';
import { SessionMetricsCalculator } from './SessionMetricsCalculator.js';

/**
 * Session history entry for meta-monitoring
 */
interface SessionHistoryEntry {
  thoughtId: string;
  mode: ThinkingMode;
  timestamp: Date;
  content: string;
  uncertainty?: number;
}

/**
 * Strategy performance metrics for meta-monitoring
 */
interface StrategyPerformance {
  mode: ThinkingMode;
  thoughtsSpent: number;
  startTime: Date;
  endTime?: Date;
  progressIndicators: string[];
  issuesEncountered: string[];
}

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

  // Meta-monitoring state (merged from MetaMonitor)
  private sessionHistory: Map<string, SessionHistoryEntry[]> = new Map();
  private currentStrategies: Map<string, StrategyPerformance> = new Map();
  private modeTransitions: Map<string, ThinkingMode[]> = new Map();

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
        // Clear meta-monitoring data for evicted session
        this.clearMetaSession(key);
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

    // Start meta-monitoring strategy tracking
    this.startMetaStrategy(sessionId, session.mode);

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
    // Security: Validate session ID format to prevent path traversal attacks
    validateSessionId(sessionId);

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

    // Record thought for meta-reasoning insights
    this.recordMetaThought(sessionId, thought);

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
    // Security: Validate session ID format to prevent path traversal attacks
    validateSessionId(sessionId);

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

  // ============================================
  // Meta-Monitoring Methods (merged from MetaMonitor)
  // ============================================

  /**
   * Record a thought in session history for meta-monitoring
   */
  private recordMetaThought(sessionId: string, thought: Thought): void {
    if (!this.sessionHistory.has(sessionId)) {
      this.sessionHistory.set(sessionId, []);
    }

    const history = this.sessionHistory.get(sessionId)!;
    history.push({
      thoughtId: thought.id,
      mode: thought.mode,
      timestamp: thought.timestamp,
      content: thought.content,
      uncertainty: 'uncertainty' in thought ? (thought as { uncertainty?: number }).uncertainty : undefined,
    });

    // Track mode transitions
    if (!this.modeTransitions.has(sessionId)) {
      this.modeTransitions.set(sessionId, []);
    }
    const transitions = this.modeTransitions.get(sessionId)!;
    if (transitions.length === 0 || transitions[transitions.length - 1] !== thought.mode) {
      transitions.push(thought.mode);
    }
  }

  /**
   * Start tracking a new strategy for meta-monitoring
   */
  private startMetaStrategy(sessionId: string, mode: ThinkingMode): void {
    this.currentStrategies.set(sessionId, {
      mode,
      thoughtsSpent: 0,
      startTime: new Date(),
      progressIndicators: [],
      issuesEncountered: [],
    });
  }

  /**
   * Update current strategy progress
   */
  updateStrategyProgress(sessionId: string, indicator: string): void {
    const strategy = this.currentStrategies.get(sessionId);
    if (strategy) {
      strategy.progressIndicators.push(indicator);
      strategy.thoughtsSpent++;
    }
  }

  /**
   * Record an issue with current strategy
   */
  recordStrategyIssue(sessionId: string, issue: string): void {
    const strategy = this.currentStrategies.get(sessionId);
    if (strategy) {
      strategy.issuesEncountered.push(issue);
    }
  }

  /**
   * Evaluate current strategy effectiveness
   */
  evaluateStrategy(sessionId: string): StrategyEvaluation {
    const strategy = this.currentStrategies.get(sessionId);

    if (!strategy) {
      // No active strategy - return baseline evaluation
      return {
        effectiveness: 0.5,
        efficiency: 0.5,
        confidence: 0.5,
        progressRate: 0,
        qualityScore: 0.5,
        issues: ['No active strategy being tracked'],
        strengths: [],
      };
    }

    // Calculate metrics
    const thoughtsSpent = strategy.thoughtsSpent;
    const progressMade = strategy.progressIndicators.length;
    const issuesCount = strategy.issuesEncountered.length;
    const timeElapsed = new Date().getTime() - strategy.startTime.getTime();

    // Effectiveness: progress relative to effort
    const effectiveness = Math.min(1.0, progressMade / Math.max(1, thoughtsSpent));

    // Efficiency: progress per unit time (minutes)
    const MILLIS_PER_MINUTE = 60000;
    const efficiency = timeElapsed > 0 ? Math.min(1.0, progressMade / (timeElapsed / MILLIS_PER_MINUTE)) : 0.5;

    // Confidence: based on issues encountered
    const ISSUE_PENALTY = 0.15;
    const MIN_CONFIDENCE = 0.1;
    const confidence = Math.max(MIN_CONFIDENCE, 1.0 - issuesCount * ISSUE_PENALTY);

    // Progress rate: insights per thought
    const progressRate = thoughtsSpent > 0 ? progressMade / thoughtsSpent : 0;

    // Quality score: weighted combination
    const EFFECTIVENESS_WEIGHT = 0.4;
    const EFFICIENCY_WEIGHT = 0.2;
    const CONFIDENCE_WEIGHT = 0.4;
    const qualityScore = effectiveness * EFFECTIVENESS_WEIGHT + efficiency * EFFICIENCY_WEIGHT + confidence * CONFIDENCE_WEIGHT;

    return {
      effectiveness,
      efficiency,
      confidence,
      progressRate,
      qualityScore,
      issues: [...strategy.issuesEncountered],
      strengths: strategy.progressIndicators.slice(-3), // Recent progress
    };
  }

  /**
   * Suggest alternative strategies based on current performance
   */
  suggestAlternatives(sessionId: string, currentMode: ThinkingMode): AlternativeStrategy[] {
    const evaluation = this.evaluateStrategy(sessionId);
    const alternatives: AlternativeStrategy[] = [];

    const LOW_EFFECTIVENESS_THRESHOLD = 0.4;
    const LOW_EFFICIENCY_THRESHOLD = 0.5;

    // If current strategy is failing, suggest fundamental alternatives
    if (evaluation.effectiveness < LOW_EFFECTIVENESS_THRESHOLD) {
      // Suggest switching to a different core reasoning mode
      if (currentMode !== ThinkingMode.HYBRID) {
        alternatives.push({
          mode: ThinkingMode.HYBRID,
          reasoning: 'Low effectiveness detected - hybrid multi-modal approach may provide better results',
          expectedBenefit: 'Combines multiple reasoning types for comprehensive analysis',
          switchingCost: 0.3,
          recommendationScore: 0.85,
        });
      }

      if (currentMode !== ThinkingMode.INDUCTIVE) {
        alternatives.push({
          mode: ThinkingMode.INDUCTIVE,
          reasoning: 'Consider gathering more empirical observations',
          expectedBenefit: 'Build stronger generalizations from specific cases',
          switchingCost: 0.2,
          recommendationScore: 0.70,
        });
      }
    }

    // If making progress but slowly, suggest refinements
    if (evaluation.effectiveness >= LOW_EFFECTIVENESS_THRESHOLD && evaluation.efficiency < LOW_EFFICIENCY_THRESHOLD) {
      alternatives.push({
        mode: currentMode, // Same mode, but recommend refinement
        reasoning: 'Progress detected but efficiency is low - consider refining current approach',
        expectedBenefit: 'Improved efficiency while maintaining progress',
        switchingCost: 0.1,
        recommendationScore: 0.65,
      });
    }

    return alternatives;
  }

  /**
   * Calculate quality metrics for current session
   */
  calculateQualityMetrics(sessionId: string): QualityMetrics {
    const history = this.sessionHistory.get(sessionId) || [];
    const strategy = this.currentStrategies.get(sessionId);

    if (history.length === 0) {
      // No history - return neutral metrics
      return {
        logicalConsistency: 0.5,
        evidenceQuality: 0.5,
        completeness: 0.5,
        originality: 0.5,
        clarity: 0.5,
        overallQuality: 0.5,
      };
    }

    // Logical consistency: fewer contradictions and issues
    const ISSUE_CONSISTENCY_PENALTY = 0.1;
    const MIN_CONSISTENCY = 0.1;
    const issuesCount = strategy?.issuesEncountered.length || 0;
    const logicalConsistency = Math.max(MIN_CONSISTENCY, 1.0 - issuesCount * ISSUE_CONSISTENCY_PENALTY);

    // Evidence quality: based on uncertainty levels
    const avgUncertainty =
      history.reduce((sum, entry) => sum + (entry.uncertainty || 0.5), 0) / history.length;
    const evidenceQuality = 1.0 - avgUncertainty;

    // Completeness: thoughts addressing multiple aspects
    const COMPLETENESS_NORMALIZATION = 5; // Normalize to 5 thoughts
    const completeness = Math.min(1.0, history.length / COMPLETENESS_NORMALIZATION);

    // Originality: mode diversity
    const ORIGINALITY_NORMALIZATION = 3; // Normalize to 3 unique modes
    const uniqueModes = new Set(history.map((h) => h.mode)).size;
    const originality = Math.min(1.0, uniqueModes / ORIGINALITY_NORMALIZATION);

    // Clarity: based on progress indicators
    const progressCount = strategy?.progressIndicators.length || 0;
    const clarity = Math.min(1.0, progressCount / Math.max(1, history.length));

    // Overall quality: weighted average
    const CONSISTENCY_WEIGHT = 0.25;
    const EVIDENCE_WEIGHT = 0.2;
    const COMPLETENESS_WEIGHT = 0.15;
    const ORIGINALITY_WEIGHT = 0.15;
    const CLARITY_WEIGHT = 0.25;
    const overallQuality =
      logicalConsistency * CONSISTENCY_WEIGHT +
      evidenceQuality * EVIDENCE_WEIGHT +
      completeness * COMPLETENESS_WEIGHT +
      originality * ORIGINALITY_WEIGHT +
      clarity * CLARITY_WEIGHT;

    return {
      logicalConsistency,
      evidenceQuality,
      completeness,
      originality,
      clarity,
      overallQuality,
    };
  }

  /**
   * Get session context for meta-reasoning
   */
  getMetaSessionContext(sessionId: string, problemType: string): SessionContext {
    const history = this.sessionHistory.get(sessionId) || [];
    const transitions = this.modeTransitions.get(sessionId) || [];

    return {
      sessionId,
      totalThoughts: history.length,
      modesUsed: transitions,
      modeSwitches: Math.max(0, transitions.length - 1),
      problemType,
      historicalEffectiveness: this.getHistoricalEffectiveness(problemType),
    };
  }

  /**
   * Get historical effectiveness for similar problems (simplified)
   */
  private getHistoricalEffectiveness(_problemType: string): number | undefined {
    // In a full implementation, this would query past sessions
    // For now, return undefined to indicate no historical data
    return undefined;
  }

  /**
   * Clear meta-monitoring session data (for cleanup)
   */
  clearMetaSession(sessionId: string): void {
    this.sessionHistory.delete(sessionId);
    this.currentStrategies.delete(sessionId);
    this.modeTransitions.delete(sessionId);
  }

  /**
   * Get all tracked meta-monitoring sessions
   */
  getActiveMetaSessions(): string[] {
    return Array.from(this.sessionHistory.keys());
  }
}
