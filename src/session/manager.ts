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
      dependencyDepth: 0
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

    // Update average uncertainty (for modes that have uncertainty)
    if ('uncertainty' in thought) {
      const totalUncertainty = session.thoughts
        .filter(t => 'uncertainty' in t)
        .reduce((sum, t) => sum + (t as any).uncertainty, 0);
      const thoughtsWithUncertainty = session.thoughts.filter(t => 'uncertainty' in t).length;
      metrics.averageUncertainty = thoughtsWithUncertainty > 0
        ? totalUncertainty / thoughtsWithUncertainty
        : 0;
    }

    // Update dependency depth
    if ('dependencies' in thought) {
      const deps = (thought as any).dependencies as string[];
      if (deps.length > metrics.dependencyDepth) {
        metrics.dependencyDepth = deps.length;
      }
    }
  }
}
