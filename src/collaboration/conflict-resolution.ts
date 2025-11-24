/**
 * Conflict Resolution for Divergent Thoughts (v3.4.0)
 * Phase 4C Task 5.4: Resolve conflicts when agents reach different conclusions
 */

import type { Thought } from '../types/index.js';
import type { ThinkingMode } from '../types/core.js';

/**
 * Conflict severity level
 */
export type ConflictSeverity = 'trivial' | 'minor' | 'moderate' | 'major' | 'critical';

/**
 * Conflict category
 */
export type ConflictCategory =
  | 'logical_contradiction' // Mutually exclusive conclusions
  | 'factual_disagreement' // Different facts/assumptions
  | 'methodological' // Different approaches
  | 'interpretive' // Different interpretations
  | 'priority' // Different importance/urgency
  | 'scope' // Different problem boundaries
  | 'temporal' // Different timelines/sequences
  | 'ethical'; // Different value judgments

/**
 * Resolution strategy
 */
export type ResolutionStrategy =
  | 'voting' // Democratic vote
  | 'consensus' // Unanimous agreement
  | 'mediation' // Third-party mediator
  | 'evidence_based' // Follow strongest evidence
  | 'expertise_weighted' // Weight by expertise
  | 'hierarchical' // Defer to authority
  | 'compromise' // Middle ground
  | 'parallel_paths' // Accept both as valid
  | 'defer' // Postpone resolution
  | 'escalate'; // Escalate to higher authority

/**
 * Resolution status
 */
export type ResolutionStatus = 'pending' | 'in_progress' | 'resolved' | 'unresolved' | 'deferred';

/**
 * Divergent thought (conflicting position)
 */
export interface DivergentThought {
  thoughtId: string;
  agentId: string;
  agentName: string;
  mode: ThinkingMode;
  position: string; // The stance/conclusion
  reasoning: string; // Why this position
  evidence: string[]; // Supporting evidence
  confidence: number; // 0-1
  timestamp: Date;
}

/**
 * Conflict between thoughts
 */
export interface ThoughtConflict {
  id: string;
  category: ConflictCategory;
  severity: ConflictSeverity;
  description: string;
  divergentThoughts: DivergentThought[];
  context: string;
  detectedAt: Date;
  detectedBy: string; // Agent ID who detected
  status: ResolutionStatus;
  resolution?: ConflictResolution;
}

/**
 * Resolution attempt
 */
export interface ConflictResolution {
  id: string;
  conflictId: string;
  strategy: ResolutionStrategy;
  mediatorId?: string;
  proposal: string;
  rationale: string;
  votes: ResolutionVote[];
  outcome: 'accepted' | 'rejected' | 'modified';
  finalDecision: string;
  resolvedAt: Date;
  resolvedBy: string;
  dissent?: string[]; // Agent IDs who dissented
}

/**
 * Vote on resolution
 */
export interface ResolutionVote {
  agentId: string;
  agentName: string;
  vote: 'accept' | 'reject' | 'abstain';
  weight: number; // Voting weight (1.0 = standard)
  comment?: string;
  timestamp: Date;
}

/**
 * Consensus requirement
 */
export interface ConsensusRequirement {
  strategy: ResolutionStrategy;
  minVotes: number;
  minAcceptanceRatio: number; // 0-1 (e.g., 0.66 for 2/3 majority)
  requireUnanimous: boolean;
  allowAbstentions: boolean;
  expertiseWeighting: boolean;
}

/**
 * Evidence for position
 */
export interface Evidence {
  id: string;
  source: string;
  content: string;
  credibility: number; // 0-1
  supportedPositions: string[]; // Divergent thought IDs
  contradictedPositions: string[]; // Divergent thought IDs
  addedBy: string;
  timestamp: Date;
}

/**
 * Conflict resolution manager
 */
export class ConflictResolutionManager {
  private conflicts: Map<string, ThoughtConflict>;
  private resolutions: Map<string, ConflictResolution>;
  private evidence: Map<string, Evidence>;

  constructor() {
    this.conflicts = new Map();
    this.resolutions = new Map();
    this.evidence = new Map();
  }

  /**
   * Detect conflict between thoughts
   */
  detectConflict(
    thoughts: Thought[],
    category: ConflictCategory,
    severity: ConflictSeverity,
    description: string,
    context: string,
    detectedBy: string
  ): string {
    const conflictId = this.generateConflictId();

    // Extract divergent thoughts
    const divergentThoughts: DivergentThought[] = thoughts.map(thought => ({
      thoughtId: thought.id,
      agentId: thought.mode, // Using mode as proxy for agent
      agentName: thought.mode,
      mode: thought.mode,
      position: this.extractPosition(thought),
      reasoning: thought.content,
      evidence: [],
      confidence: 0.7, // Default confidence
      timestamp: thought.timestamp,
    }));

    const conflict: ThoughtConflict = {
      id: conflictId,
      category,
      severity,
      description,
      divergentThoughts,
      context,
      detectedAt: new Date(),
      detectedBy,
      status: 'pending',
    };

    this.conflicts.set(conflictId, conflict);
    return conflictId;
  }

  /**
   * Add divergent thought to existing conflict
   */
  addDivergentThought(
    conflictId: string,
    thought: Thought,
    agentId: string,
    agentName: string,
    position: string,
    reasoning: string,
    evidence: string[] = [],
    confidence: number = 0.7
  ): void {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    const divergent: DivergentThought = {
      thoughtId: thought.id,
      agentId,
      agentName,
      mode: thought.mode,
      position,
      reasoning,
      evidence,
      confidence,
      timestamp: thought.timestamp,
    };

    conflict.divergentThoughts.push(divergent);
  }

  /**
   * Extract position from thought
   */
  private extractPosition(thought: Thought): string {
    // Simple heuristic: look for conclusion keywords
    const content = thought.content.toLowerCase();
    const lines = content.split('\n');

    for (const line of lines) {
      if (
        line.includes('therefore') ||
        line.includes('conclusion:') ||
        line.includes('result:') ||
        line.includes('answer:')
      ) {
        return line.trim();
      }
    }

    // Fallback: use first 100 chars
    return thought.content.substring(0, 100);
  }

  /**
   * Propose resolution
   */
  proposeResolution(
    conflictId: string,
    strategy: ResolutionStrategy,
    proposal: string,
    rationale: string,
    mediatorId?: string
  ): string {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    if (conflict.status === 'resolved') {
      throw new Error(`Conflict ${conflictId} already resolved`);
    }

    const resolutionId = this.generateResolutionId();

    const resolution: ConflictResolution = {
      id: resolutionId,
      conflictId,
      strategy,
      mediatorId,
      proposal,
      rationale,
      votes: [],
      outcome: 'accepted', // Will be updated based on votes
      finalDecision: proposal,
      resolvedAt: new Date(),
      resolvedBy: mediatorId || 'system',
    };

    this.resolutions.set(resolutionId, resolution);
    conflict.resolution = resolution;
    conflict.status = 'in_progress';

    return resolutionId;
  }

  /**
   * Vote on resolution
   */
  vote(
    resolutionId: string,
    agentId: string,
    agentName: string,
    vote: 'accept' | 'reject' | 'abstain',
    comment?: string,
    weight: number = 1.0
  ): void {
    const resolution = this.resolutions.get(resolutionId);
    if (!resolution) {
      throw new Error(`Resolution ${resolutionId} not found`);
    }

    // Remove existing vote from this agent
    resolution.votes = resolution.votes.filter(v => v.agentId !== agentId);

    // Add new vote
    resolution.votes.push({
      agentId,
      agentName,
      vote,
      weight,
      comment,
      timestamp: new Date(),
    });
  }

  /**
   * Finalize resolution based on votes
   */
  finalizeResolution(resolutionId: string, requirement: ConsensusRequirement): {
    accepted: boolean;
    reason: string;
  } {
    const resolution = this.resolutions.get(resolutionId);
    if (!resolution) {
      throw new Error(`Resolution ${resolutionId} not found`);
    }

    const conflict = this.conflicts.get(resolution.conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${resolution.conflictId} not found`);
    }

    const votes = resolution.votes;
    const totalVotes = votes.length;

    if (totalVotes < requirement.minVotes) {
      return {
        accepted: false,
        reason: `Insufficient votes: ${totalVotes}/${requirement.minVotes}`,
      };
    }

    // Calculate weighted votes
    const acceptVotes = votes.filter(v => v.vote === 'accept');
    const rejectVotes = votes.filter(v => v.vote === 'reject');
    const abstainVotes = votes.filter(v => v.vote === 'abstain');

    const totalWeight = votes.reduce((sum, v) => sum + v.weight, 0);
    const acceptWeight = acceptVotes.reduce((sum, v) => sum + v.weight, 0);

    const acceptanceRatio = acceptWeight / totalWeight;

    // Check unanimous requirement
    if (requirement.requireUnanimous) {
      const nonAbstainVotes = votes.filter(v => v.vote !== 'abstain');
      const allAccept = nonAbstainVotes.every(v => v.vote === 'accept');

      if (!allAccept) {
        resolution.outcome = 'rejected';
        conflict.status = 'unresolved';
        return {
          accepted: false,
          reason: 'Unanimous consensus not reached',
        };
      }
    }

    // Check acceptance ratio
    if (acceptanceRatio < requirement.minAcceptanceRatio) {
      resolution.outcome = 'rejected';
      conflict.status = 'unresolved';
      return {
        accepted: false,
        reason: `Acceptance ratio ${(acceptanceRatio * 100).toFixed(1)}% below threshold ${(requirement.minAcceptanceRatio * 100).toFixed(1)}%`,
      };
    }

    // Resolution accepted
    resolution.outcome = 'accepted';
    conflict.status = 'resolved';
    conflict.resolution = resolution;

    // Track dissent
    resolution.dissent = rejectVotes.map(v => v.agentId);

    return {
      accepted: true,
      reason: `Accepted with ${(acceptanceRatio * 100).toFixed(1)}% approval (${acceptVotes.length} accept, ${rejectVotes.length} reject, ${abstainVotes.length} abstain)`,
    };
  }

  /**
   * Add evidence to conflict
   */
  addEvidence(
    conflictId: string,
    source: string,
    content: string,
    credibility: number,
    supportedPositions: string[],
    contradictedPositions: string[],
    addedBy: string
  ): string {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    const evidenceId = this.generateEvidenceId();

    const evidence: Evidence = {
      id: evidenceId,
      source,
      content,
      credibility,
      supportedPositions,
      contradictedPositions,
      addedBy,
      timestamp: new Date(),
    };

    this.evidence.set(evidenceId, evidence);

    // Update divergent thoughts with evidence references
    for (const position of supportedPositions) {
      const thought = conflict.divergentThoughts.find(dt => dt.thoughtId === position);
      if (thought) {
        thought.evidence.push(evidenceId);
      }
    }

    return evidenceId;
  }

  /**
   * Analyze evidence for conflict
   */
  analyzeEvidence(conflictId: string): {
    byPosition: Map<string, { support: number; contradiction: number; netScore: number }>;
    recommendation: string | null;
  } {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    const allEvidence = Array.from(this.evidence.values());
    const byPosition = new Map<string, { support: number; contradiction: number; netScore: number }>();

    // Calculate evidence scores for each position
    for (const divergent of conflict.divergentThoughts) {
      let supportScore = 0;
      let contradictionScore = 0;

      for (const evidence of allEvidence) {
        if (evidence.supportedPositions.includes(divergent.thoughtId)) {
          supportScore += evidence.credibility;
        }
        if (evidence.contradictedPositions.includes(divergent.thoughtId)) {
          contradictionScore += evidence.credibility;
        }
      }

      byPosition.set(divergent.thoughtId, {
        support: supportScore,
        contradiction: contradictionScore,
        netScore: supportScore - contradictionScore,
      });
    }

    // Find position with strongest evidence
    let bestPosition: string | null = null;
    let bestScore = -Infinity;

    for (const [thoughtId, scores] of byPosition) {
      if (scores.netScore > bestScore) {
        bestScore = scores.netScore;
        bestPosition = thoughtId;
      }
    }

    const recommendation = bestPosition
      ? `Position ${bestPosition} has strongest evidence support (net score: ${bestScore.toFixed(2)})`
      : null;

    return { byPosition, recommendation };
  }

  /**
   * Get conflict by ID
   */
  getConflict(conflictId: string): ThoughtConflict | null {
    return this.conflicts.get(conflictId) || null;
  }

  /**
   * Get all conflicts
   */
  getAllConflicts(filter?: { status?: ResolutionStatus; severity?: ConflictSeverity; category?: ConflictCategory }): ThoughtConflict[] {
    let conflicts = Array.from(this.conflicts.values());

    if (filter) {
      if (filter.status) {
        conflicts = conflicts.filter(c => c.status === filter.status);
      }
      if (filter.severity) {
        conflicts = conflicts.filter(c => c.severity === filter.severity);
      }
      if (filter.category) {
        conflicts = conflicts.filter(c => c.category === filter.category);
      }
    }

    return conflicts;
  }

  /**
   * Defer conflict resolution
   */
  deferConflict(conflictId: string, reason: string): void {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    conflict.status = 'deferred';
    conflict.context += `\n[Deferred: ${reason}]`;
  }

  /**
   * Escalate conflict
   */
  escalateConflict(conflictId: string, toAuthority: string): void {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    conflict.context += `\n[Escalated to: ${toAuthority}]`;
    conflict.severity = this.increaseSeverity(conflict.severity);
  }

  /**
   * Increase severity level
   */
  private increaseSeverity(current: ConflictSeverity): ConflictSeverity {
    const levels: ConflictSeverity[] = ['trivial', 'minor', 'moderate', 'major', 'critical'];
    const index = levels.indexOf(current);
    return index < levels.length - 1 ? levels[index + 1] : current;
  }

  /**
   * Get consensus requirement for strategy
   */
  getConsensusRequirement(strategy: ResolutionStrategy): ConsensusRequirement {
    switch (strategy) {
      case 'voting':
        return {
          strategy,
          minVotes: 3,
          minAcceptanceRatio: 0.5, // Simple majority
          requireUnanimous: false,
          allowAbstentions: true,
          expertiseWeighting: false,
        };

      case 'consensus':
        return {
          strategy,
          minVotes: 2,
          minAcceptanceRatio: 1.0, // 100%
          requireUnanimous: true,
          allowAbstentions: false,
          expertiseWeighting: false,
        };

      case 'evidence_based':
        return {
          strategy,
          minVotes: 1,
          minAcceptanceRatio: 0.0,
          requireUnanimous: false,
          allowAbstentions: true,
          expertiseWeighting: false,
        };

      case 'expertise_weighted':
        return {
          strategy,
          minVotes: 3,
          minAcceptanceRatio: 0.66, // 2/3 majority
          requireUnanimous: false,
          allowAbstentions: true,
          expertiseWeighting: true,
        };

      case 'hierarchical':
        return {
          strategy,
          minVotes: 1,
          minAcceptanceRatio: 1.0,
          requireUnanimous: false,
          allowAbstentions: false,
          expertiseWeighting: false,
        };

      default:
        return {
          strategy,
          minVotes: 2,
          minAcceptanceRatio: 0.5,
          requireUnanimous: false,
          allowAbstentions: true,
          expertiseWeighting: false,
        };
    }
  }

  /**
   * Generate conflict resolution report
   */
  generateReport(conflictId?: string): string {
    const conflicts = conflictId
      ? [this.conflicts.get(conflictId)].filter(Boolean) as ThoughtConflict[]
      : Array.from(this.conflicts.values());

    const report: string[] = [];

    const scope = conflictId ? `Conflict ${conflictId}` : 'All Conflicts';
    report.push(`# Conflict Resolution Report: ${scope}`);
    report.push('');

    // Statistics
    const total = conflicts.length;
    const resolved = conflicts.filter(c => c.status === 'resolved').length;
    const pending = conflicts.filter(c => c.status === 'pending').length;
    const inProgress = conflicts.filter(c => c.status === 'in_progress').length;
    const deferred = conflicts.filter(c => c.status === 'deferred').length;

    report.push('## Statistics');
    report.push(`- **Total Conflicts:** ${total}`);
    report.push(`- **Resolved:** ${resolved} (${((resolved / total) * 100).toFixed(1)}%)`);
    report.push(`- **Pending:** ${pending}`);
    report.push(`- **In Progress:** ${inProgress}`);
    report.push(`- **Deferred:** ${deferred}`);
    report.push('');

    // By severity
    const bySeverity = new Map<ConflictSeverity, number>();
    for (const conflict of conflicts) {
      bySeverity.set(conflict.severity, (bySeverity.get(conflict.severity) || 0) + 1);
    }

    report.push('## By Severity');
    for (const severity of ['critical', 'major', 'moderate', 'minor', 'trivial'] as ConflictSeverity[]) {
      const count = bySeverity.get(severity) || 0;
      if (count > 0) {
        report.push(`- **${severity}:** ${count}`);
      }
    }
    report.push('');

    // By category
    const byCategory = new Map<ConflictCategory, number>();
    for (const conflict of conflicts) {
      byCategory.set(conflict.category, (byCategory.get(conflict.category) || 0) + 1);
    }

    report.push('## By Category');
    for (const [category, count] of byCategory) {
      report.push(`- **${category}:** ${count}`);
    }
    report.push('');

    // Recent conflicts
    report.push('## Recent Conflicts');
    const recent = conflicts.slice(0, 5);
    for (const conflict of recent) {
      const statusIcon = conflict.status === 'resolved' ? '✓' : conflict.status === 'pending' ? '⏳' : '🔄';
      report.push(`${statusIcon} **[${conflict.severity}]** ${conflict.description}`);
      report.push(`  - Category: ${conflict.category}`);
      report.push(`  - Divergent positions: ${conflict.divergentThoughts.length}`);
      if (conflict.resolution) {
        report.push(`  - Resolution: ${conflict.resolution.strategy} (${conflict.resolution.outcome})`);
      }
      report.push('');
    }

    return report.join('\n');
  }

  /**
   * Generate unique conflict ID
   */
  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique resolution ID
   */
  private generateResolutionId(): string {
    return `resolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique evidence ID
   */
  private generateEvidenceId(): string {
    return `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
