/**
 * Collaborative Annotations (v3.4.0)
 * Phase 4C Task 5.3: Annotations, highlights, and comments on shared thoughts
 */

import type { Thought } from '../types/index.js';

/**
 * Annotation type
 */
export type AnnotationType =
  | 'comment' // General comment
  | 'highlight' // Highlight text
  | 'tag' // Add tag/label
  | 'note' // Personal note
  | 'question' // Pose question
  | 'suggestion' // Suggest improvement
  | 'critique' // Critical analysis
  | 'praise'; // Positive feedback

/**
 * Highlight color
 */
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'red' | 'purple' | 'orange';

/**
 * Annotation visibility
 */
export type AnnotationVisibility = 'public' | 'private' | 'team' | 'specific_agents';

/**
 * Text range for anchoring annotation
 */
export interface TextRange {
  start: number; // Character offset
  end: number;
  text: string; // Actual text selected
}

/**
 * Annotation on a thought
 */
export interface Annotation {
  id: string;
  type: AnnotationType;
  authorId: string; // Agent ID
  authorName: string;
  thoughtId: string;
  content: string;
  range?: TextRange; // For highlights and inline comments
  color?: HighlightColor;
  tags?: string[];
  visibility: AnnotationVisibility;
  visibleTo?: string[]; // Agent IDs (when visibility = 'specific_agents')
  created: Date;
  modified: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  votes: AnnotationVote[];
  replies: Annotation[];
}

/**
 * Vote on annotation
 */
export interface AnnotationVote {
  agentId: string;
  value: 1 | -1; // Upvote or downvote
  timestamp: Date;
}

/**
 * Annotation filter
 */
export interface AnnotationFilter {
  type?: AnnotationType[];
  authorId?: string;
  thoughtId?: string;
  tags?: string[];
  visibility?: AnnotationVisibility;
  resolved?: boolean;
  hasReplies?: boolean;
  minVotes?: number;
  dateRange?: { start: Date; end: Date };
}

/**
 * Annotation thread (group of related annotations)
 */
export interface AnnotationThread {
  id: string;
  rootAnnotationId: string;
  thoughtId: string;
  participants: string[]; // Agent IDs
  annotationCount: number;
  lastActivity: Date;
  resolved: boolean;
}

/**
 * Annotation statistics
 */
export interface AnnotationStats {
  total: number;
  byType: Map<AnnotationType, number>;
  byAuthor: Map<string, number>;
  resolved: number;
  unresolved: number;
  withReplies: number;
  averageVotes: number;
  mostVoted: Annotation | null;
  mostDiscussed: Annotation | null;
}

/**
 * Collaborative annotation manager
 */
export class AnnotationManager {
  private annotations: Map<string, Annotation>;
  private threads: Map<string, AnnotationThread>;
  private thoughtAnnotations: Map<string, string[]>; // Thought ID -> Annotation IDs

  constructor() {
    this.annotations = new Map();
    this.threads = new Map();
    this.thoughtAnnotations = new Map();
  }

  /**
   * Add annotation to thought
   */
  addAnnotation(
    thoughtId: string,
    authorId: string,
    authorName: string,
    type: AnnotationType,
    content: string,
    options: {
      range?: TextRange;
      color?: HighlightColor;
      tags?: string[];
      visibility?: AnnotationVisibility;
      visibleTo?: string[];
      replyTo?: string; // Parent annotation ID
    } = {}
  ): string {
    const annotationId = this.generateAnnotationId();

    const annotation: Annotation = {
      id: annotationId,
      type,
      authorId,
      authorName,
      thoughtId,
      content,
      range: options.range,
      color: options.color,
      tags: options.tags || [],
      visibility: options.visibility || 'public',
      visibleTo: options.visibleTo,
      created: new Date(),
      modified: new Date(),
      resolved: false,
      votes: [],
      replies: [],
    };

    if (options.replyTo) {
      // Add as reply to parent annotation
      const parent = this.annotations.get(options.replyTo);
      if (parent) {
        parent.replies.push(annotation);
        parent.modified = new Date();

        // Update thread
        const threadId = this.findThreadByAnnotation(options.replyTo);
        if (threadId) {
          const thread = this.threads.get(threadId);
          if (thread) {
            if (!thread.participants.includes(authorId)) {
              thread.participants.push(authorId);
            }
            thread.annotationCount++;
            thread.lastActivity = new Date();
          }
        }
      }
    } else {
      // Create new root annotation
      this.annotations.set(annotationId, annotation);

      // Track by thought
      if (!this.thoughtAnnotations.has(thoughtId)) {
        this.thoughtAnnotations.set(thoughtId, []);
      }
      this.thoughtAnnotations.get(thoughtId)!.push(annotationId);

      // Create thread for questions and suggestions
      if (type === 'question' || type === 'suggestion' || type === 'critique') {
        const threadId = this.generateThreadId();
        const thread: AnnotationThread = {
          id: threadId,
          rootAnnotationId: annotationId,
          thoughtId,
          participants: [authorId],
          annotationCount: 1,
          lastActivity: new Date(),
          resolved: false,
        };
        this.threads.set(threadId, thread);
      }
    }

    return annotationId;
  }

  /**
   * Get annotation by ID
   */
  getAnnotation(annotationId: string): Annotation | null {
    return this.annotations.get(annotationId) || null;
  }

  /**
   * Get annotations for thought
   */
  getAnnotationsForThought(thoughtId: string, filter?: AnnotationFilter): Annotation[] {
    const annotationIds = this.thoughtAnnotations.get(thoughtId) || [];
    let annotations = annotationIds.map(id => this.annotations.get(id)).filter(Boolean) as Annotation[];

    if (filter) {
      annotations = this.applyFilter(annotations, filter);
    }

    return annotations;
  }

  /**
   * Get all annotations with filter
   */
  getAllAnnotations(filter?: AnnotationFilter): Annotation[] {
    let annotations = Array.from(this.annotations.values());

    if (filter) {
      annotations = this.applyFilter(annotations, filter);
    }

    return annotations;
  }

  /**
   * Apply filter to annotations
   */
  private applyFilter(annotations: Annotation[], filter: AnnotationFilter): Annotation[] {
    let filtered = annotations;

    if (filter.type) {
      filtered = filtered.filter(a => filter.type!.includes(a.type));
    }

    if (filter.authorId) {
      filtered = filtered.filter(a => a.authorId === filter.authorId);
    }

    if (filter.thoughtId) {
      filtered = filtered.filter(a => a.thoughtId === filter.thoughtId);
    }

    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(a => a.tags && filter.tags!.some(tag => a.tags!.includes(tag)));
    }

    if (filter.visibility) {
      filtered = filtered.filter(a => a.visibility === filter.visibility);
    }

    if (filter.resolved !== undefined) {
      filtered = filtered.filter(a => a.resolved === filter.resolved);
    }

    if (filter.hasReplies !== undefined) {
      filtered = filtered.filter(a => (a.replies.length > 0) === filter.hasReplies);
    }

    if (filter.minVotes !== undefined) {
      filtered = filtered.filter(a => this.getVoteScore(a) >= filter.minVotes!);
    }

    if (filter.dateRange) {
      filtered = filtered.filter(
        a =>
          a.created >= filter.dateRange!.start &&
          a.created <= filter.dateRange!.end
      );
    }

    return filtered;
  }

  /**
   * Update annotation
   */
  updateAnnotation(
    annotationId: string,
    updates: {
      content?: string;
      tags?: string[];
      resolved?: boolean;
      resolvedBy?: string;
    }
  ): void {
    const annotation = this.annotations.get(annotationId);
    if (!annotation) {
      throw new Error(`Annotation ${annotationId} not found`);
    }

    if (updates.content !== undefined) {
      annotation.content = updates.content;
    }

    if (updates.tags !== undefined) {
      annotation.tags = updates.tags;
    }

    if (updates.resolved !== undefined) {
      annotation.resolved = updates.resolved;
      if (updates.resolved) {
        annotation.resolvedBy = updates.resolvedBy;
        annotation.resolvedAt = new Date();

        // Update thread
        const threadId = this.findThreadByAnnotation(annotationId);
        if (threadId) {
          const thread = this.threads.get(threadId);
          if (thread) {
            thread.resolved = true;
          }
        }
      }
    }

    annotation.modified = new Date();
  }

  /**
   * Delete annotation
   */
  deleteAnnotation(annotationId: string): void {
    const annotation = this.annotations.get(annotationId);
    if (!annotation) {
      throw new Error(`Annotation ${annotationId} not found`);
    }

    // Remove from thought mapping
    const thoughtIds = this.thoughtAnnotations.get(annotation.thoughtId);
    if (thoughtIds) {
      const index = thoughtIds.indexOf(annotationId);
      if (index > -1) {
        thoughtIds.splice(index, 1);
      }
    }

    // Remove thread if root annotation
    const threadId = this.findThreadByAnnotation(annotationId);
    if (threadId) {
      const thread = this.threads.get(threadId);
      if (thread && thread.rootAnnotationId === annotationId) {
        this.threads.delete(threadId);
      }
    }

    this.annotations.delete(annotationId);
  }

  /**
   * Vote on annotation
   */
  vote(annotationId: string, agentId: string, value: 1 | -1): void {
    const annotation = this.annotations.get(annotationId);
    if (!annotation) {
      throw new Error(`Annotation ${annotationId} not found`);
    }

    // Remove existing vote from this agent
    annotation.votes = annotation.votes.filter(v => v.agentId !== agentId);

    // Add new vote
    annotation.votes.push({
      agentId,
      value,
      timestamp: new Date(),
    });

    annotation.modified = new Date();
  }

  /**
   * Get vote score for annotation
   */
  private getVoteScore(annotation: Annotation): number {
    return annotation.votes.reduce((sum, vote) => sum + vote.value, 0);
  }

  /**
   * Get annotation threads
   */
  getThreads(thoughtId?: string): AnnotationThread[] {
    let threads = Array.from(this.threads.values());

    if (thoughtId) {
      threads = threads.filter(t => t.thoughtId === thoughtId);
    }

    // Sort by last activity
    threads.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

    return threads;
  }

  /**
   * Get thread by annotation
   */
  private findThreadByAnnotation(annotationId: string): string | null {
    for (const [threadId, thread] of this.threads) {
      if (thread.rootAnnotationId === annotationId) {
        return threadId;
      }

      // Check if annotation is in replies
      const rootAnnotation = this.annotations.get(thread.rootAnnotationId);
      if (rootAnnotation && this.hasAnnotationInReplies(rootAnnotation, annotationId)) {
        return threadId;
      }
    }
    return null;
  }

  /**
   * Check if annotation exists in reply tree
   */
  private hasAnnotationInReplies(annotation: Annotation, targetId: string): boolean {
    if (annotation.id === targetId) return true;

    for (const reply of annotation.replies) {
      if (this.hasAnnotationInReplies(reply, targetId)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get highlights for thought
   */
  getHighlights(thoughtId: string): Annotation[] {
    return this.getAnnotationsForThought(thoughtId, { type: ['highlight'] });
  }

  /**
   * Get tags for thought
   */
  getTags(thoughtId: string): string[] {
    const annotations = this.getAnnotationsForThought(thoughtId);
    const allTags = new Set<string>();

    for (const annotation of annotations) {
      if (annotation.tags) {
        for (const tag of annotation.tags) {
          allTags.add(tag);
        }
      }
    }

    return Array.from(allTags);
  }

  /**
   * Search annotations by content
   */
  searchAnnotations(query: string): Annotation[] {
    const lowerQuery = query.toLowerCase();
    const results: Annotation[] = [];

    for (const annotation of this.annotations.values()) {
      if (
        annotation.content.toLowerCase().includes(lowerQuery) ||
        (annotation.tags && annotation.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      ) {
        results.push(annotation);
      }

      // Search in replies
      const replyMatches = this.searchInReplies(annotation.replies, lowerQuery);
      results.push(...replyMatches);
    }

    return results;
  }

  /**
   * Search in reply tree
   */
  private searchInReplies(replies: Annotation[], query: string): Annotation[] {
    const matches: Annotation[] = [];

    for (const reply of replies) {
      if (
        reply.content.toLowerCase().includes(query) ||
        (reply.tags && reply.tags.some(tag => tag.toLowerCase().includes(query)))
      ) {
        matches.push(reply);
      }

      matches.push(...this.searchInReplies(reply.replies, query));
    }

    return matches;
  }

  /**
   * Get annotation statistics
   */
  getStatistics(thoughtId?: string): AnnotationStats {
    let annotations = thoughtId
      ? this.getAnnotationsForThought(thoughtId)
      : Array.from(this.annotations.values());

    const byType = new Map<AnnotationType, number>();
    const byAuthor = new Map<string, number>();
    let resolved = 0;
    let withReplies = 0;
    let totalVotes = 0;
    let maxVotes = -Infinity;
    let mostVoted: Annotation | null = null;
    let maxReplies = -1;
    let mostDiscussed: Annotation | null = null;

    for (const annotation of annotations) {
      // By type
      byType.set(annotation.type, (byType.get(annotation.type) || 0) + 1);

      // By author
      byAuthor.set(annotation.authorId, (byAuthor.get(annotation.authorId) || 0) + 1);

      // Resolved count
      if (annotation.resolved) {
        resolved++;
      }

      // With replies
      if (annotation.replies.length > 0) {
        withReplies++;

        if (annotation.replies.length > maxReplies) {
          maxReplies = annotation.replies.length;
          mostDiscussed = annotation;
        }
      }

      // Votes
      const voteScore = this.getVoteScore(annotation);
      totalVotes += annotation.votes.length;

      if (voteScore > maxVotes) {
        maxVotes = voteScore;
        mostVoted = annotation;
      }
    }

    const averageVotes = annotations.length > 0 ? totalVotes / annotations.length : 0;

    return {
      total: annotations.length,
      byType,
      byAuthor,
      resolved,
      unresolved: annotations.length - resolved,
      withReplies,
      averageVotes,
      mostVoted,
      mostDiscussed,
    };
  }

  /**
   * Export annotations as JSON
   */
  exportAnnotations(thoughtId?: string): string {
    const annotations = thoughtId
      ? this.getAnnotationsForThought(thoughtId)
      : Array.from(this.annotations.values());

    return JSON.stringify(annotations, null, 2);
  }

  /**
   * Generate annotation report
   */
  generateReport(thoughtId?: string): string {
    const stats = this.getStatistics(thoughtId);
    const threads = this.getThreads(thoughtId);

    const report: string[] = [];

    const scope = thoughtId ? `Thought ${thoughtId}` : 'All Thoughts';
    report.push(`# Annotation Report: ${scope}`);
    report.push('');

    report.push('## Statistics');
    report.push(`- **Total Annotations:** ${stats.total}`);
    report.push(`- **Resolved:** ${stats.resolved} (${((stats.resolved / stats.total) * 100).toFixed(1)}%)`);
    report.push(`- **Unresolved:** ${stats.unresolved}`);
    report.push(`- **With Replies:** ${stats.withReplies}`);
    report.push(`- **Average Votes:** ${stats.averageVotes.toFixed(2)}`);
    report.push('');

    report.push('## By Type');
    for (const [type, count] of stats.byType) {
      const percentage = ((count / stats.total) * 100).toFixed(1);
      report.push(`- **${type}:** ${count} (${percentage}%)`);
    }
    report.push('');

    report.push('## By Author');
    const sortedAuthors = Array.from(stats.byAuthor.entries()).sort((a, b) => b[1] - a[1]);
    for (const [authorId, count] of sortedAuthors) {
      report.push(`- **${authorId}:** ${count} annotations`);
    }
    report.push('');

    if (stats.mostVoted) {
      report.push('## Most Voted Annotation');
      report.push(`**Score:** ${this.getVoteScore(stats.mostVoted)}`);
      report.push(`**Type:** ${stats.mostVoted.type}`);
      report.push(`**Content:** ${stats.mostVoted.content}`);
      report.push('');
    }

    if (stats.mostDiscussed) {
      report.push('## Most Discussed Annotation');
      report.push(`**Replies:** ${stats.mostDiscussed.replies.length}`);
      report.push(`**Type:** ${stats.mostDiscussed.type}`);
      report.push(`**Content:** ${stats.mostDiscussed.content}`);
      report.push('');
    }

    report.push('## Active Threads');
    const activeThreads = threads.filter(t => !t.resolved);
    report.push(`${activeThreads.length} active discussion threads:`);
    for (const thread of activeThreads.slice(0, 10)) {
      const rootAnnotation = this.annotations.get(thread.rootAnnotationId);
      if (rootAnnotation) {
        report.push(`- [${thread.participants.length} participants] ${rootAnnotation.content.substring(0, 60)}...`);
      }
    }

    return report.join('\n');
  }

  /**
   * Generate unique annotation ID
   */
  private generateAnnotationId(): string {
    return `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique thread ID
   */
  private generateThreadId(): string {
    return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
