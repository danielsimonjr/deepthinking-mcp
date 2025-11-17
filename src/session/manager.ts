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
 * Session Manager
 */
export class SessionManager {
  private activeSessions: Map<string, ThinkingSession>;
  private config: Partial<SessionConfig>;

  constructor(config?: Partial<SessionConfig>) {
    this.activeSessions = new Map();
    this.config = config || {};
  }

  /**
   * Create a new thinking session
   */
  async createSession(options: {
    title?: string;
    mode?: ThinkingMode;
    domain?: string;
    author?: string;
    config?: Partial<SessionConfig>;
  } = {}): Promise<ThinkingSession> {
    const sessionId = randomUUID();
    const now = new Date();

    const session: ThinkingSession = {
      id: sessionId,
      title: options.title || 'Untitled Session',
      mode: options.mode || ThinkingMode.HYBRID,
      domain: options.domain,
      config: this.mergeConfig(options.config),
      thoughts: [],
      createdAt: now,
      updatedAt: now,
      author: options.author,
      currentThoughtNumber: 0,
      isComplete: false,
      metrics: this.initializeMetrics(),
      tags: [],
      collaborators: options.author ? [options.author] : []
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  /**
   * Get a session by ID
   */
  async getSession(sessionId: string): Promise<ThinkingSession | null> {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Add a thought to a session
   */
  async addThought(sessionId: string, thought: Thought): Promise<ThinkingSession> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
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
    }

    return session;
  }

  /**
   * Update session mode
   */
  async switchMode(
    sessionId: string,
    newMode: ThinkingMode,
    reason?: string
  ): Promise<ThinkingSession> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const oldMode = session.mode;
    session.mode = newMode;
    session.config.modeConfig.mode = newMode;
    session.updatedAt = new Date();

    return session;
  }

  /**
   * List all sessions
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
   */
  async deleteSession(sessionId: string): Promise<void> {
    this.activeSessions.delete(sessionId);
  }

  /**
   * Generate summary of session
   */
  async generateSummary(sessionId: string): Promise<string> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
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
   * Merge configurations
   */
  private mergeConfig(userConfig?: Partial<SessionConfig>): SessionConfig {
    return {
      ...DEFAULT_CONFIG,
      ...this.config,
      ...userConfig
    } as SessionConfig;
  }

  /**
   * Initialize metrics
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
    };
  }

  /**
   * Update session metrics
   */
  private updateMetrics(session: ThinkingSession, thought: Thought): void {
    const metrics = session.metrics;

    // Update total thoughts
    metrics.totalThoughts = session.thoughts.length;

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
  }
}
