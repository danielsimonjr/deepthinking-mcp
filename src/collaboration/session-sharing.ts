/**
 * Session Sharing and Merging (v3.4.0)
 * Phase 4C Task 5.2: Share and merge thinking sessions between agents
 */

import type { ThinkingSession, Thought } from '../types/index.js';
import type { ThinkingMode } from '../types/core.js';

/**
 * Merge strategy for combining sessions
 */
export type MergeStrategy =
  | 'chronological' // Merge by timestamp
  | 'priority' // Merge by thought importance
  | 'mode_grouped' // Group thoughts by mode
  | 'dependency_ordered' // Order by dependencies
  | 'interleaved'; // Alternate between sessions

/**
 * Conflict type during merge
 */
export type ConflictType =
  | 'duplicate_thought' // Same thought in multiple sessions
  | 'contradictory_conclusion' // Conflicting conclusions
  | 'incompatible_dependency' // Dependencies don't align
  | 'mode_mismatch'; // Incompatible reasoning modes

/**
 * Conflict during merge
 */
export interface MergeConflict {
  id: string;
  type: ConflictType;
  description: string;
  sources: string[]; // Session IDs involved
  thoughtIds: string[]; // Conflicting thoughts
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoResolvable: boolean;
  resolution?: string;
}

/**
 * Merge operation metadata
 */
export interface MergeMetadata {
  id: string;
  sourceSessionIds: string[];
  strategy: MergeStrategy;
  timestamp: Date;
  conflicts: MergeConflict[];
  resolvedConflicts: number;
  totalThoughts: number;
  mergedThoughts: number;
  droppedThoughts: number;
  duration: number; // milliseconds
}

/**
 * Shared session for collaboration
 */
export interface SharedSession {
  id: string;
  originalSessionId: string;
  ownerId: string; // Agent ID
  title: string;
  mode: ThinkingMode;
  thoughts: Thought[];
  sharedAt: Date;
  accessLevel: 'read' | 'comment' | 'edit';
  viewers: string[]; // Agent IDs who have viewed
  comments: SessionComment[];
}

/**
 * Comment on shared session
 */
export interface SessionComment {
  id: string;
  authorId: string;
  thoughtId?: string; // Comment on specific thought
  content: string;
  timestamp: Date;
  replies: SessionComment[];
}

/**
 * Session sharing and merging manager
 */
export class SessionSharingManager {
  private sharedSessions: Map<string, SharedSession>;
  private mergeHistory: Map<string, MergeMetadata>;

  constructor() {
    this.sharedSessions = new Map();
    this.mergeHistory = new Map();
  }

  /**
   * Share session with other agents
   */
  shareSession(
    session: ThinkingSession,
    ownerId: string,
    accessLevel: 'read' | 'comment' | 'edit' = 'read'
  ): string {
    const sharedId = `shared_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const sharedSession: SharedSession = {
      id: sharedId,
      originalSessionId: session.id,
      ownerId,
      title: session.title,
      mode: session.mode,
      thoughts: [...session.thoughts], // Copy thoughts
      sharedAt: new Date(),
      accessLevel,
      viewers: [],
      comments: [],
    };

    this.sharedSessions.set(sharedId, sharedSession);
    return sharedId;
  }

  /**
   * Get shared session
   */
  getSharedSession(sharedId: string, viewerId: string): SharedSession | null {
    const session = this.sharedSessions.get(sharedId);
    if (!session) return null;

    // Track viewer
    if (!session.viewers.includes(viewerId)) {
      session.viewers.push(viewerId);
    }

    return session;
  }

  /**
   * Add comment to shared session
   */
  addComment(
    sharedId: string,
    authorId: string,
    content: string,
    thoughtId?: string,
    replyToId?: string
  ): string {
    const session = this.sharedSessions.get(sharedId);
    if (!session) {
      throw new Error(`Shared session ${sharedId} not found`);
    }

    if (session.accessLevel === 'read') {
      throw new Error('Session is read-only');
    }

    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const comment: SessionComment = {
      id: commentId,
      authorId,
      thoughtId,
      content,
      timestamp: new Date(),
      replies: [],
    };

    if (replyToId) {
      // Find parent comment and add as reply
      const parentComment = this.findComment(session.comments, replyToId);
      if (parentComment) {
        parentComment.replies.push(comment);
      }
    } else {
      session.comments.push(comment);
    }

    return commentId;
  }

  /**
   * Find comment by ID recursively
   */
  private findComment(comments: SessionComment[], commentId: string): SessionComment | null {
    for (const comment of comments) {
      if (comment.id === commentId) return comment;

      const found = this.findComment(comment.replies, commentId);
      if (found) return found;
    }
    return null;
  }

  /**
   * Merge multiple sessions into one
   */
  mergeSessions(sessions: ThinkingSession[], strategy: MergeStrategy = 'chronological'): {
    merged: ThinkingSession;
    metadata: MergeMetadata;
  } {
    const startTime = Date.now();

    if (sessions.length === 0) {
      throw new Error('No sessions to merge');
    }

    if (sessions.length === 1) {
      // Nothing to merge
      return {
        merged: sessions[0],
        metadata: {
          id: this.generateMergeId(),
          sourceSessionIds: [sessions[0].id],
          strategy,
          timestamp: new Date(),
          conflicts: [],
          resolvedConflicts: 0,
          totalThoughts: sessions[0].thoughts.length,
          mergedThoughts: sessions[0].thoughts.length,
          droppedThoughts: 0,
          duration: Date.now() - startTime,
        },
      };
    }

    // Detect conflicts
    const conflicts = this.detectConflicts(sessions);

    // Merge thoughts based on strategy
    let mergedThoughts: Thought[];
    switch (strategy) {
      case 'chronological':
        mergedThoughts = this.mergeChronological(sessions);
        break;
      case 'priority':
        mergedThoughts = this.mergePriority(sessions);
        break;
      case 'mode_grouped':
        mergedThoughts = this.mergeModeGrouped(sessions);
        break;
      case 'dependency_ordered':
        mergedThoughts = this.mergeDependencyOrdered(sessions);
        break;
      case 'interleaved':
        mergedThoughts = this.mergeInterleaved(sessions);
        break;
      default:
        mergedThoughts = this.mergeChronological(sessions);
    }

    // Deduplicate thoughts
    const { deduplicated, dropped } = this.deduplicateThoughts(mergedThoughts);

    // Create merged session
    const merged: ThinkingSession = {
      id: this.generateMergeId(),
      mode: sessions[0].mode, // Use first session's mode
      title: `Merged: ${sessions.map(s => s.title).join(' + ')}`,
      thoughts: deduplicated,
      isComplete: sessions.every(s => s.isComplete),
      createdAt: new Date(Math.min(...sessions.map(s => s.createdAt.getTime()))),
      metadata: {
        sources: sessions.map(s => s.id),
        mergeStrategy: strategy,
        conflicts: conflicts.length,
      },
    };

    // Resolve auto-resolvable conflicts
    const resolvedConflicts = this.autoResolveConflicts(conflicts, merged);

    const metadata: MergeMetadata = {
      id: merged.id,
      sourceSessionIds: sessions.map(s => s.id),
      strategy,
      timestamp: new Date(),
      conflicts: conflicts,
      resolvedConflicts,
      totalThoughts: sessions.reduce((sum, s) => sum + s.thoughts.length, 0),
      mergedThoughts: deduplicated.length,
      droppedThoughts: dropped,
      duration: Date.now() - startTime,
    };

    this.mergeHistory.set(merged.id, metadata);

    return { merged, metadata };
  }

  /**
   * Detect conflicts between sessions
   */
  private detectConflicts(sessions: ThinkingSession[]): MergeConflict[] {
    const conflicts: MergeConflict[] = [];

    // Check for duplicate thoughts
    const contentMap = new Map<string, { sessionId: string; thoughtId: string }[]>();

    for (const session of sessions) {
      for (const thought of session.thoughts) {
        const normalizedContent = this.normalizeContent(thought.content);

        if (!contentMap.has(normalizedContent)) {
          contentMap.set(normalizedContent, []);
        }

        contentMap.get(normalizedContent)!.push({
          sessionId: session.id,
          thoughtId: thought.id,
        });
      }
    }

    // Find duplicates
    for (const [_content, instances] of contentMap) {
      if (instances.length > 1) {
        conflicts.push({
          id: this.generateConflictId(),
          type: 'duplicate_thought',
          description: `Duplicate thought found in ${instances.length} sessions`,
          sources: Array.from(new Set(instances.map(i => i.sessionId))),
          thoughtIds: instances.map(i => i.thoughtId),
          severity: 'low',
          autoResolvable: true,
          resolution: 'Keep first occurrence, drop duplicates',
        });
      }
    }

    // Check for contradictory conclusions
    // (Simplified: check for opposing keywords)
    const conclusions = sessions.flatMap(s =>
      s.thoughts
        .filter(t => t.content.toLowerCase().includes('therefore') || t.content.toLowerCase().includes('conclusion'))
        .map(t => ({ sessionId: s.id, thoughtId: t.id, content: t.content }))
    );

    for (let i = 0; i < conclusions.length; i++) {
      for (let j = i + 1; j < conclusions.length; j++) {
        if (this.areContradictory(conclusions[i].content, conclusions[j].content)) {
          conflicts.push({
            id: this.generateConflictId(),
            type: 'contradictory_conclusion',
            description: 'Contradictory conclusions detected',
            sources: [conclusions[i].sessionId, conclusions[j].sessionId],
            thoughtIds: [conclusions[i].thoughtId, conclusions[j].thoughtId],
            severity: 'high',
            autoResolvable: false,
            resolution: undefined,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Merge sessions chronologically
   */
  private mergeChronological(sessions: ThinkingSession[]): Thought[] {
    const allThoughts = sessions.flatMap(s => s.thoughts);
    return allThoughts.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Merge sessions by priority (later thoughts have higher priority)
   */
  private mergePriority(sessions: ThinkingSession[]): Thought[] {
    const allThoughts = sessions.flatMap(s => s.thoughts);

    // Assign priority score based on position and revisions
    const scored = allThoughts.map(t => ({
      thought: t,
      score: t.thoughtNumber + (t.isRevision ? 10 : 0),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.map(s => s.thought);
  }

  /**
   * Merge sessions grouped by mode
   */
  private mergeModeGrouped(sessions: ThinkingSession[]): Thought[] {
    const allThoughts = sessions.flatMap(s => s.thoughts);
    const grouped = new Map<ThinkingMode, Thought[]>();

    for (const thought of allThoughts) {
      if (!grouped.has(thought.mode)) {
        grouped.set(thought.mode, []);
      }
      grouped.get(thought.mode)!.push(thought);
    }

    // Flatten groups
    const merged: Thought[] = [];
    for (const thoughts of grouped.values()) {
      thoughts.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      merged.push(...thoughts);
    }

    return merged;
  }

  /**
   * Merge sessions ordered by dependencies
   */
  private mergeDependencyOrdered(sessions: ThinkingSession[]): Thought[] {
    const allThoughts = sessions.flatMap(s => s.thoughts);
    const ordered: Thought[] = [];
    const processed = new Set<string>();

    const processThought = (thought: Thought) => {
      if (processed.has(thought.id)) return;

      // Process dependencies first
      if ((thought as any).dependencies) {
        for (const depId of (thought as any).dependencies) {
          const dep = allThoughts.find(t => t.id === depId);
          if (dep) {
            processThought(dep);
          }
        }
      }

      ordered.push(thought);
      processed.add(thought.id);
    };

    for (const thought of allThoughts) {
      processThought(thought);
    }

    return ordered;
  }

  /**
   * Merge sessions by interleaving thoughts
   */
  private mergeInterleaved(sessions: ThinkingSession[]): Thought[] {
    const merged: Thought[] = [];
    const pointers = sessions.map(() => 0);

    let hasMore = true;
    while (hasMore) {
      hasMore = false;

      for (let i = 0; i < sessions.length; i++) {
        if (pointers[i] < sessions[i].thoughts.length) {
          merged.push(sessions[i].thoughts[pointers[i]]);
          pointers[i]++;
          hasMore = true;
        }
      }
    }

    return merged;
  }

  /**
   * Deduplicate thoughts
   */
  private deduplicateThoughts(thoughts: Thought[]): { deduplicated: Thought[]; dropped: number } {
    const seen = new Set<string>();
    const deduplicated: Thought[] = [];
    let dropped = 0;

    for (const thought of thoughts) {
      const normalized = this.normalizeContent(thought.content);

      if (!seen.has(normalized)) {
        seen.add(normalized);
        deduplicated.push(thought);
      } else {
        dropped++;
      }
    }

    return { deduplicated, dropped };
  }

  /**
   * Auto-resolve conflicts that can be automatically handled
   */
  private autoResolveConflicts(conflicts: MergeConflict[], _mergedSession: ThinkingSession): number {
    let resolved = 0;

    for (const conflict of conflicts) {
      if (conflict.autoResolvable) {
        switch (conflict.type) {
          case 'duplicate_thought':
            // Already handled by deduplication
            conflict.resolution = 'Duplicates removed during merge';
            resolved++;
            break;
        }
      }
    }

    return resolved;
  }

  /**
   * Normalize content for comparison
   */
  private normalizeContent(content: string): string {
    return content.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Check if two conclusions are contradictory
   */
  private areContradictory(content1: string, content2: string): boolean {
    const normalized1 = content1.toLowerCase();
    const normalized2 = content2.toLowerCase();

    // Simple heuristic: check for opposing terms
    const opposingPairs = [
      ['true', 'false'],
      ['correct', 'incorrect'],
      ['valid', 'invalid'],
      ['possible', 'impossible'],
      ['likely', 'unlikely'],
      ['increase', 'decrease'],
      ['positive', 'negative'],
    ];

    for (const [term1, term2] of opposingPairs) {
      if ((normalized1.includes(term1) && normalized2.includes(term2)) || (normalized1.includes(term2) && normalized2.includes(term1))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get merge history
   */
  getMergeHistory(mergeId: string): MergeMetadata | null {
    return this.mergeHistory.get(mergeId) || null;
  }

  /**
   * Export session for sharing
   */
  exportSession(session: ThinkingSession): string {
    return JSON.stringify(session, null, 2);
  }

  /**
   * Import session from JSON
   */
  importSession(json: string): ThinkingSession {
    const parsed = JSON.parse(json);

    // Reconstruct Date objects
    if (parsed.created) {
      parsed.created = new Date(parsed.created);
    }
    if (parsed.lastModified) {
      parsed.lastModified = new Date(parsed.lastModified);
    }

    for (const thought of parsed.thoughts || []) {
      if (thought.timestamp) {
        thought.timestamp = new Date(thought.timestamp);
      }
    }

    return parsed as ThinkingSession;
  }

  /**
   * Generate merge report
   */
  generateMergeReport(metadata: MergeMetadata): string {
    const report: string[] = [];

    report.push('# Session Merge Report');
    report.push('');
    report.push(`**Merge ID:** ${metadata.id}`);
    report.push(`**Timestamp:** ${metadata.timestamp.toISOString()}`);
    report.push(`**Strategy:** ${metadata.strategy}`);
    report.push(`**Duration:** ${metadata.duration}ms`);
    report.push('');

    report.push('## Sources');
    report.push(`Merged ${metadata.sourceSessionIds.length} sessions:`);
    for (const sessionId of metadata.sourceSessionIds) {
      report.push(`- ${sessionId}`);
    }
    report.push('');

    report.push('## Statistics');
    report.push(`- **Total Thoughts:** ${metadata.totalThoughts}`);
    report.push(`- **Merged Thoughts:** ${metadata.mergedThoughts}`);
    report.push(`- **Dropped (Duplicates):** ${metadata.droppedThoughts}`);
    report.push(`- **Efficiency:** ${((metadata.mergedThoughts / metadata.totalThoughts) * 100).toFixed(1)}%`);
    report.push('');

    report.push('## Conflicts');
    report.push(`Found ${metadata.conflicts.length} conflicts (${metadata.resolvedConflicts} auto-resolved):`);
    for (const conflict of metadata.conflicts) {
      const icon = conflict.severity === 'critical' ? '🔴' : conflict.severity === 'high' ? '🟠' : conflict.severity === 'medium' ? '🟡' : '🟢';
      const status = conflict.resolution ? '✓ Resolved' : '⚠ Needs review';

      report.push(`${icon} **${conflict.type}** [${conflict.severity}] - ${status}`);
      report.push(`  ${conflict.description}`);
      if (conflict.resolution) {
        report.push(`  Resolution: ${conflict.resolution}`);
      }
    }

    return report.join('\n');
  }

  /**
   * Generate unique merge ID
   */
  private generateMergeId(): string {
    return `merge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique conflict ID
   */
  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
