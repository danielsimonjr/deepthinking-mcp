/**
 * Pattern Recognition System (v3.4.1)
 * Phase 4 Task 10: ML-based pattern recognition for thinking sessions
 *
 * Identifies recurring patterns in reasoning:
 * - Thought sequences and chains
 * - Mode transitions
 * - Problem-solving approaches
 * - Reasoning structures
 */

import type { ThinkingSession } from '../types/session.js';
import type { Thought } from '../types/core.js';

/**
 * Pattern type classification
 */
export type PatternType =
  | 'sequence'      // Recurring thought sequences
  | 'transition'    // Mode transition patterns
  | 'structure'     // Reasoning structure patterns
  | 'temporal'      // Time-based patterns
  | 'branching'     // Decision branching patterns
  | 'revision'      // Revision and refinement patterns
  | 'convergence';  // Convergence to solutions

/**
 * Recognized pattern
 */
export interface Pattern {
  id: string;
  type: PatternType;
  name: string;
  description: string;
  confidence: number; // 0-1
  frequency: number;
  examples: PatternExample[];
  metadata: PatternMetadata;
}

/**
 * Pattern example
 */
export interface PatternExample {
  sessionId: string;
  thoughts: number[]; // Thought numbers
  context: string;
}

/**
 * Pattern metadata
 */
export interface PatternMetadata {
  firstSeen: Date;
  lastSeen: Date;
  sessions: Set<string>;
  averageEffectiveness?: number; // 0-1
  commonDomains?: string[];
  commonModes?: string[];
}

/**
 * Pattern recognition result
 */
export interface PatternRecognitionResult {
  patterns: Pattern[];
  totalPatterns: number;
  sessionCount: number;
  coverage: number; // Percentage of thoughts explained by patterns
  insights: string[];
}

/**
 * Pattern similarity
 */
export interface PatternSimilarity {
  pattern1: string;
  pattern2: string;
  similarity: number;
}

/**
 * Pattern Recognition Engine
 */
export class PatternRecognizer {
  private patterns: Map<string, Pattern>;
  private sessions: ThinkingSession[];
  private minSupport: number; // Minimum frequency for pattern
  private minConfidence: number; // Minimum confidence threshold

  constructor(options: {
    minSupport?: number;
    minConfidence?: number;
  } = {}) {
    this.patterns = new Map();
    this.sessions = [];
    this.minSupport = options.minSupport || 2; // At least 2 occurrences
    this.minConfidence = options.minConfidence || 0.6; // 60% confidence
  }

  /**
   * Add session for pattern learning
   */
  addSession(session: ThinkingSession): void {
    this.sessions.push(session);
  }

  /**
   * Train pattern recognizer on all sessions
   */
  train(): PatternRecognitionResult {
    this.patterns.clear();

    // Extract different types of patterns
    this.extractSequencePatterns();
    this.extractTransitionPatterns();
    this.extractStructurePatterns();
    this.extractTemporalPatterns();
    this.extractBranchingPatterns();
    this.extractRevisionPatterns();
    this.extractConvergencePatterns();

    // Filter patterns by support and confidence
    this.filterPatterns();

    // Calculate coverage
    const coverage = this.calculateCoverage();

    // Generate insights
    const insights = this.generateInsights();

    return {
      patterns: Array.from(this.patterns.values()),
      totalPatterns: this.patterns.size,
      sessionCount: this.sessions.length,
      coverage,
      insights,
    };
  }

  /**
   * Recognize patterns in a new session
   */
  recognize(session: ThinkingSession): Pattern[] {
    const matchedPatterns: Pattern[] = [];

    for (const pattern of this.patterns.values()) {
      if (this.matchesPattern(session, pattern)) {
        matchedPatterns.push(pattern);
      }
    }

    // Sort by confidence
    return matchedPatterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Extract sequence patterns (recurring thought chains)
   */
  private extractSequencePatterns(): void {
    const sequences = new Map<string, number>();
    const sequenceExamples = new Map<string, PatternExample[]>();

    for (const session of this.sessions) {
      // Extract n-grams (sequences of 2-4 thoughts)
      for (let n = 2; n <= 4; n++) {
        for (let i = 0; i <= session.thoughts.length - n; i++) {
          const sequence = session.thoughts.slice(i, i + n);
          const key = this.getSequenceKey(sequence);

          sequences.set(key, (sequences.get(key) || 0) + 1);

          if (!sequenceExamples.has(key)) {
            sequenceExamples.set(key, []);
          }

          sequenceExamples.get(key)!.push({
            sessionId: session.id,
            thoughts: sequence.map(t => t.thoughtNumber),
            context: `Sequence of ${n} thoughts in ${session.mode} mode`,
          });
        }
      }
    }

    // Create patterns from frequent sequences
    for (const [key, count] of sequences) {
      if (count >= this.minSupport) {
        const examples = sequenceExamples.get(key)!;
        const pattern: Pattern = {
          id: `seq-${this.patterns.size}`,
          type: 'sequence',
          name: `Sequence Pattern ${this.patterns.size}`,
          description: `Recurring sequence of thoughts: ${key}`,
          confidence: Math.min(count / this.sessions.length, 1),
          frequency: count,
          examples: examples.slice(0, 3), // Top 3 examples
          metadata: {
            firstSeen: new Date(),
            lastSeen: new Date(),
            sessions: new Set(examples.map(e => e.sessionId)),
          },
        };

        this.patterns.set(pattern.id, pattern);
      }
    }
  }

  /**
   * Extract mode transition patterns
   */
  private extractTransitionPatterns(): void {
    const transitions = new Map<string, number>();
    const transitionExamples = new Map<string, PatternExample[]>();

    for (const session of this.sessions) {
      for (let i = 0; i < session.thoughts.length - 1; i++) {
        const from = session.thoughts[i].mode;
        const to = session.thoughts[i + 1].mode;

        if (from !== to) {
          const key = `${from}->${to}`;
          transitions.set(key, (transitions.get(key) || 0) + 1);

          if (!transitionExamples.has(key)) {
            transitionExamples.set(key, []);
          }

          transitionExamples.get(key)!.push({
            sessionId: session.id,
            thoughts: [i + 1, i + 2],
            context: `Transition from ${from} to ${to}`,
          });
        }
      }
    }

    // Create patterns from frequent transitions
    for (const [key, count] of transitions) {
      if (count >= this.minSupport) {
        const examples = transitionExamples.get(key)!;
        const pattern: Pattern = {
          id: `trans-${this.patterns.size}`,
          type: 'transition',
          name: `Transition: ${key}`,
          description: `Frequent mode transition: ${key}`,
          confidence: Math.min(count / this.sessions.length, 1),
          frequency: count,
          examples: examples.slice(0, 3),
          metadata: {
            firstSeen: new Date(),
            lastSeen: new Date(),
            sessions: new Set(examples.map(e => e.sessionId)),
          },
        };

        this.patterns.set(pattern.id, pattern);
      }
    }
  }

  /**
   * Extract structure patterns (reasoning organization)
   */
  private extractStructurePatterns(): void {
    const structures = new Map<string, number>();

    for (const session of this.sessions) {
      // Analyze thought structure
      const depth = this.calculateThoughtDepth(session);
      const breadth = this.calculateThoughtBreadth(session);
      const revisionRatio = this.calculateRevisionRatio(session);

      const structureKey = `depth:${Math.floor(depth)},breadth:${Math.floor(breadth)},revisions:${Math.floor(revisionRatio * 10)}`;
      structures.set(structureKey, (structures.get(structureKey) || 0) + 1);
    }

    // Create structure patterns
    for (const [key, count] of structures) {
      if (count >= this.minSupport) {
        const pattern: Pattern = {
          id: `struct-${this.patterns.size}`,
          type: 'structure',
          name: `Structure: ${key}`,
          description: `Common reasoning structure: ${key}`,
          confidence: Math.min(count / this.sessions.length, 1),
          frequency: count,
          examples: [],
          metadata: {
            firstSeen: new Date(),
            lastSeen: new Date(),
            sessions: new Set(),
          },
        };

        this.patterns.set(pattern.id, pattern);
      }
    }
  }

  /**
   * Extract temporal patterns (time-based)
   */
  private extractTemporalPatterns(): void {
    // Analyze thinking speed, pauses, bursts
    const tempos = new Map<string, number>();

    for (const session of this.sessions) {
      if (session.thoughts.length < 2) continue;

      // Calculate average time between thoughts
      let totalTime = 0;
      for (let i = 1; i < session.thoughts.length; i++) {
        const time1 = new Date(session.thoughts[i - 1].timestamp).getTime();
        const time2 = new Date(session.thoughts[i].timestamp).getTime();
        totalTime += time2 - time1;
      }

      const avgTime = totalTime / (session.thoughts.length - 1);
      const tempo = avgTime < 30000 ? 'rapid' : avgTime < 300000 ? 'steady' : 'deliberate';
      tempos.set(tempo, (tempos.get(tempo) || 0) + 1);
    }

    // Create temporal patterns
    for (const [tempo, count] of tempos) {
      if (count >= this.minSupport) {
        const pattern: Pattern = {
          id: `tempo-${tempo}`,
          type: 'temporal',
          name: `Tempo: ${tempo}`,
          description: `${tempo.charAt(0).toUpperCase() + tempo.slice(1)} thinking pace`,
          confidence: count / this.sessions.length,
          frequency: count,
          examples: [],
          metadata: {
            firstSeen: new Date(),
            lastSeen: new Date(),
            sessions: new Set(),
          },
        };

        this.patterns.set(pattern.id, pattern);
      }
    }
  }

  /**
   * Extract branching patterns (decision points)
   */
  private extractBranchingPatterns(): void {
    // Look for branching in thoughts (multiple paths explored)
    let branchingSessions = 0;

    for (const session of this.sessions) {
      let hasBranching = false;

      for (const thought of session.thoughts) {
        // Check for revision or branching indicators
        if ((thought as any).branchId || thought.isRevision) {
          hasBranching = true;
          break;
        }
      }

      if (hasBranching) {
        branchingSessions++;
      }
    }

    if (branchingSessions >= this.minSupport) {
      const pattern: Pattern = {
        id: 'branch-exploratory',
        type: 'branching',
        name: 'Exploratory Branching',
        description: 'Pattern of exploring multiple solution paths',
        confidence: branchingSessions / this.sessions.length,
        frequency: branchingSessions,
        examples: [],
        metadata: {
          firstSeen: new Date(),
          lastSeen: new Date(),
          sessions: new Set(),
        },
      };

      this.patterns.set(pattern.id, pattern);
    }
  }

  /**
   * Extract revision patterns
   */
  private extractRevisionPatterns(): void {
    let revisionSessions = 0;
    let totalRevisions = 0;

    for (const session of this.sessions) {
      const revisions = session.thoughts.filter(t => t.isRevision).length;
      if (revisions > 0) {
        revisionSessions++;
        totalRevisions += revisions;
      }
    }

    if (revisionSessions >= this.minSupport) {
      const pattern: Pattern = {
        id: 'revision-iterative',
        type: 'revision',
        name: 'Iterative Refinement',
        description: 'Pattern of iteratively refining thoughts',
        confidence: revisionSessions / this.sessions.length,
        frequency: totalRevisions,
        examples: [],
        metadata: {
          firstSeen: new Date(),
          lastSeen: new Date(),
          sessions: new Set(),
          averageEffectiveness: 0.75, // Revisions generally improve quality
        },
      };

      this.patterns.set(pattern.id, pattern);
    }
  }

  /**
   * Extract convergence patterns (path to solution)
   */
  private extractConvergencePatterns(): void {
    const convergenceTypes = new Map<string, number>();

    for (const session of this.sessions) {
      if (!session.isComplete) continue;

      // Analyze how the session converged
      const thoughtCount = session.thoughts.length;
      const hasRevisions = session.thoughts.some(t => t.isRevision);

      const type = hasRevisions
        ? thoughtCount < 5
          ? 'quick-iterative'
          : 'deep-iterative'
        : thoughtCount < 5
        ? 'quick-linear'
        : 'deep-linear';

      convergenceTypes.set(type, (convergenceTypes.get(type) || 0) + 1);
    }

    for (const [type, count] of convergenceTypes) {
      if (count >= this.minSupport) {
        const pattern: Pattern = {
          id: `conv-${type}`,
          type: 'convergence',
          name: `Convergence: ${type}`,
          description: `Solution convergence via ${type.replace('-', ' ')} approach`,
          confidence: count / this.sessions.filter(s => s.isComplete).length,
          frequency: count,
          examples: [],
          metadata: {
            firstSeen: new Date(),
            lastSeen: new Date(),
            sessions: new Set(),
          },
        };

        this.patterns.set(pattern.id, pattern);
      }
    }
  }

  /**
   * Filter patterns by support and confidence thresholds
   */
  private filterPatterns(): void {
    for (const [id, pattern] of this.patterns) {
      if (
        pattern.frequency < this.minSupport ||
        pattern.confidence < this.minConfidence
      ) {
        this.patterns.delete(id);
      }
    }
  }

  /**
   * Calculate coverage (percentage of thoughts explained by patterns)
   */
  private calculateCoverage(): number {
    if (this.sessions.length === 0) return 0;

    let totalThoughts = 0;
    let explainedThoughts = 0;

    for (const session of this.sessions) {
      totalThoughts += session.thoughts.length;

      const matchedPatterns = this.recognize(session);
      if (matchedPatterns.length > 0) {
        explainedThoughts += session.thoughts.length;
      }
    }

    return totalThoughts > 0 ? explainedThoughts / totalThoughts : 0;
  }

  /**
   * Generate insights from patterns
   */
  private generateInsights(): string[] {
    const insights: string[] = [];

    // Most common pattern type
    const typeCounts = new Map<PatternType, number>();
    for (const pattern of this.patterns.values()) {
      typeCounts.set(pattern.type, (typeCounts.get(pattern.type) || 0) + 1);
    }

    const mostCommon = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    if (mostCommon) {
      insights.push(
        `Most common pattern type: ${mostCommon[0]} (${mostCommon[1]} patterns)`
      );
    }

    // Highest confidence pattern
    const highestConfidence = Array.from(this.patterns.values()).sort(
      (a, b) => b.confidence - a.confidence
    )[0];
    if (highestConfidence) {
      insights.push(
        `Strongest pattern: ${highestConfidence.name} (${(highestConfidence.confidence * 100).toFixed(1)}% confidence)`
      );
    }

    // Average pattern frequency
    const avgFrequency =
      Array.from(this.patterns.values()).reduce((sum, p) => sum + p.frequency, 0) /
      this.patterns.size;
    insights.push(
      `Average pattern frequency: ${avgFrequency.toFixed(1)} occurrences per pattern`
    );

    return insights;
  }

  /**
   * Check if session matches a pattern
   */
  private matchesPattern(session: ThinkingSession, pattern: Pattern): boolean {
    switch (pattern.type) {
      case 'sequence':
        return this.matchesSequencePattern(session);
      case 'transition':
        return this.matchesTransitionPattern(session);
      case 'structure':
        return this.matchesStructurePattern(session);
      case 'temporal':
        return this.matchesTemporalPattern(session);
      case 'branching':
        return this.matchesBranchingPattern(session);
      case 'revision':
        return this.matchesRevisionPattern(session);
      case 'convergence':
        return this.matchesConvergencePattern(session);
      default:
        return false;
    }
  }

  private matchesSequencePattern(session: ThinkingSession): boolean {
    // Simple heuristic: check if session has similar thought count
    return session.thoughts.length >= 2;
  }

  private matchesTransitionPattern(session: ThinkingSession): boolean {
    // Check if session has mode transitions matching the pattern
    for (let i = 0; i < session.thoughts.length - 1; i++) {
      if (session.thoughts[i].mode !== session.thoughts[i + 1].mode) {
        return true;
      }
    }
    return false;
  }

  private matchesStructurePattern(session: ThinkingSession): boolean {
    return session.thoughts.length > 0;
  }

  private matchesTemporalPattern(session: ThinkingSession): boolean {
    return session.thoughts.length >= 2;
  }

  private matchesBranchingPattern(session: ThinkingSession): boolean {
    return session.thoughts.some(t => t.isRevision || (t as any).branchId);
  }

  private matchesRevisionPattern(session: ThinkingSession): boolean {
    return session.thoughts.some(t => t.isRevision);
  }

  private matchesConvergencePattern(session: ThinkingSession): boolean {
    return session.isComplete;
  }

  /**
   * Helper: Get sequence key from thoughts
   */
  private getSequenceKey(thoughts: Thought[]): string {
    return thoughts.map(t => t.mode.substring(0, 3)).join('-');
  }

  /**
   * Helper: Calculate thought depth (max dependency chain)
   */
  private calculateThoughtDepth(session: ThinkingSession): number {
    // Simplified: return total thoughts as proxy for depth
    return session.thoughts.length;
  }

  /**
   * Helper: Calculate thought breadth (branching factor)
   */
  private calculateThoughtBreadth(session: ThinkingSession): number {
    const branches = session.thoughts.filter(t => (t as any).branchId).length;
    return session.thoughts.length > 0 ? branches / session.thoughts.length : 0;
  }

  /**
   * Helper: Calculate revision ratio
   */
  private calculateRevisionRatio(session: ThinkingSession): number {
    const revisions = session.thoughts.filter(t => t.isRevision).length;
    return session.thoughts.length > 0 ? revisions / session.thoughts.length : 0;
  }

  /**
   * Get all patterns
   */
  getPatterns(): Pattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * Get pattern by ID
   */
  getPattern(id: string): Pattern | undefined {
    return this.patterns.get(id);
  }

  /**
   * Get patterns by type
   */
  getPatternsByType(type: PatternType): Pattern[] {
    return Array.from(this.patterns.values()).filter(p => p.type === type);
  }

  /**
   * Calculate pattern similarity
   */
  calculateSimilarity(pattern1Id: string, pattern2Id: string): number {
    const p1 = this.patterns.get(pattern1Id);
    const p2 = this.patterns.get(pattern2Id);

    if (!p1 || !p2) return 0;

    // Simple similarity based on type and confidence
    let similarity = 0;

    if (p1.type === p2.type) {
      similarity += 0.5;
    }

    const confDiff = Math.abs(p1.confidence - p2.confidence);
    similarity += (1 - confDiff) * 0.3;

    const freqRatio = Math.min(p1.frequency, p2.frequency) / Math.max(p1.frequency, p2.frequency);
    similarity += freqRatio * 0.2;

    return similarity;
  }
}
