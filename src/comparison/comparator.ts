/**
 * Session Comparator (v3.4.0)
 * Phase 4 Task 9.9: Core comparison engine
 */

import type {
  ComparisonResult,
  Difference,
  ComparisonSummary,
  ComparisonMetrics,
  DiffOptions,
  SimilarityMetrics,
  ThoughtComparison,
} from './types.js';
import type { ThinkingSession } from '../types/session.js';

/**
 * Session comparator for comparing two thinking sessions
 */
export class SessionComparator {
  private options: Required<DiffOptions>;

  constructor(options: Partial<DiffOptions> = {}) {
    this.options = {
      compareContent: options.compareContent !== false,
      compareMetadata: options.compareMetadata !== false,
      compareTaxonomy: options.compareTaxonomy !== false,
      compareQuality: options.compareQuality !== false,
      ignoreWhitespace: options.ignoreWhitespace || false,
      ignoreCase: options.ignoreCase || false,
      contextLines: options.contextLines || 3,
    };
  }

  /**
   * Compare two sessions
   */
  compare(
    sessionA: ThinkingSession,
    sessionB: ThinkingSession
  ): ComparisonResult {
    const differences: Difference[] = [];

    // Compare modes
    if (sessionA.mode !== sessionB.mode) {
      differences.push({
        type: 'mode',
        path: 'mode',
        valueA: sessionA.mode,
        valueB: sessionB.mode,
        severity: 'major',
        description: `Different thinking modes: ${sessionA.mode} vs ${sessionB.mode}`,
      });
    }

    // Compare thought counts
    const thoughtCountA = sessionA.thoughts?.length || 0;
    const thoughtCountB = sessionB.thoughts?.length || 0;
    if (thoughtCountA !== thoughtCountB) {
      differences.push({
        type: 'thought_count',
        path: 'thoughts.length',
        valueA: thoughtCountA,
        valueB: thoughtCountB,
        severity: Math.abs(thoughtCountA - thoughtCountB) > 5 ? 'major' : 'minor',
        description: `Different thought counts: ${thoughtCountA} vs ${thoughtCountB}`,
      });
    }

    // Compare completion status
    if (sessionA.isComplete !== sessionB.isComplete) {
      differences.push({
        type: 'completion',
        path: 'completed',
        valueA: sessionA.isComplete,
        valueB: sessionB.isComplete,
        severity: 'major',
        description: `Completion status differs: ${sessionA.isComplete} vs ${sessionB.isComplete}`,
      });
    }

    // Compare metadata if requested
    if (this.options.compareMetadata) {
      this.compareMetadata(sessionA, sessionB, differences);
    }

    // Compare content if requested
    if (this.options.compareContent) {
      this.compareThoughts(sessionA, sessionB, differences);
    }

    // Calculate similarity
    const similarity = this.calculateSimilarity(sessionA, sessionB);

    // Calculate metrics
    const metrics = this.calculateMetrics(sessionA, sessionB);

    // Generate summary
    const summary = this.generateSummary(differences, similarity);

    return {
      sessionA: sessionA.id || 'session-a',
      sessionB: sessionB.id || 'session-b',
      comparedAt: new Date(),
      similarity: similarity.overall,
      differences,
      summary,
      metrics,
    };
  }

  /**
   * Compare session metadata
   */
  private compareMetadata(
    sessionA: ThinkingSession,
    sessionB: ThinkingSession,
    differences: Difference[]
  ): void {
    if (sessionA.domain !== sessionB.domain) {
      differences.push({
        type: 'metadata',
        path: 'domain',
        valueA: sessionA.domain,
        valueB: sessionB.domain,
        severity: 'minor',
        description: `Different domains: ${sessionA.domain} vs ${sessionB.domain}`,
      });
    }

    if (sessionA.author !== sessionB.author) {
      differences.push({
        type: 'metadata',
        path: 'author',
        valueA: sessionA.author,
        valueB: sessionB.author,
        severity: 'info',
        description: `Different authors: ${sessionA.author} vs ${sessionB.author}`,
      });
    }
  }

  /**
   * Compare thoughts between sessions
   */
  private compareThoughts(
    sessionA: ThinkingSession,
    sessionB: ThinkingSession,
    differences: Difference[]
  ): void {
    const thoughtsA = sessionA.thoughts || [];
    const thoughtsB = sessionB.thoughts || [];

    const maxLength = Math.max(thoughtsA.length, thoughtsB.length);

    for (let i = 0; i < maxLength; i++) {
      const thoughtA = thoughtsA[i];
      const thoughtB = thoughtsB[i];

      if (!thoughtA && thoughtB) {
        differences.push({
          type: 'thought_content',
          path: `thoughts[${i}]`,
          valueA: null,
          valueB: this.extractThoughtContent(thoughtB),
          severity: 'minor',
          description: `Session B has additional thought at index ${i}`,
        });
      } else if (thoughtA && !thoughtB) {
        differences.push({
          type: 'thought_content',
          path: `thoughts[${i}]`,
          valueA: this.extractThoughtContent(thoughtA),
          valueB: null,
          severity: 'minor',
          description: `Session A has additional thought at index ${i}`,
        });
      } else if (thoughtA && thoughtB) {
        const contentA = this.extractThoughtContent(thoughtA);
        const contentB = this.extractThoughtContent(thoughtB);

        if (contentA !== contentB) {
          const similarity = this.textSimilarity(contentA, contentB);
          if (similarity < 0.8) {
            differences.push({
              type: 'thought_content',
              path: `thoughts[${i}]`,
              valueA: contentA,
              valueB: contentB,
              severity: similarity < 0.5 ? 'major' : 'minor',
              description: `Thought content differs at index ${i} (${Math.round(similarity * 100)}% similar)`,
            });
          }
        }
      }
    }
  }

  /**
   * Calculate similarity metrics
   */
  private calculateSimilarity(
    sessionA: ThinkingSession,
    sessionB: ThinkingSession
  ): SimilarityMetrics {
    const components = {
      mode: sessionA.mode === sessionB.mode ? 1 : 0,
      thoughtCount: this.thoughtCountSimilarity(sessionA, sessionB),
      thoughtContent: this.contentSimilarity(sessionA, sessionB),
      taxonomy: 0.5, // Placeholder
      quality: 0.5, // Placeholder
    };

    const structural =
      (components.mode * 0.3 + components.thoughtCount * 0.7);
    const content = components.thoughtContent;
    const taxonomic = components.taxonomy;

    const overall =
      structural * 0.4 + content * 0.4 + taxonomic * 0.2;

    return {
      structural,
      content,
      taxonomic,
      overall,
      components,
    };
  }

  /**
   * Calculate thought count similarity
   */
  private thoughtCountSimilarity(
    sessionA: ThinkingSession,
    sessionB: ThinkingSession
  ): number {
    const countA = sessionA.thoughts?.length || 0;
    const countB = sessionB.thoughts?.length || 0;

    if (countA === 0 && countB === 0) return 1;

    const maxCount = Math.max(countA, countB);
    const minCount = Math.min(countA, countB);

    return minCount / maxCount;
  }

  /**
   * Calculate content similarity
   */
  private contentSimilarity(
    sessionA: ThinkingSession,
    sessionB: ThinkingSession
  ): number {
    const thoughtsA = sessionA.thoughts || [];
    const thoughtsB = sessionB.thoughts || [];

    if (thoughtsA.length === 0 && thoughtsB.length === 0) return 1;
    if (thoughtsA.length === 0 || thoughtsB.length === 0) return 0;

    const maxLength = Math.max(thoughtsA.length, thoughtsB.length);
    let totalSimilarity = 0;

    for (let i = 0; i < maxLength; i++) {
      const contentA = thoughtsA[i]
        ? this.extractThoughtContent(thoughtsA[i])
        : '';
      const contentB = thoughtsB[i]
        ? this.extractThoughtContent(thoughtsB[i])
        : '';

      totalSimilarity += this.textSimilarity(contentA, contentB);
    }

    return totalSimilarity / maxLength;
  }

  /**
   * Calculate text similarity (Jaccard similarity)
   */
  private textSimilarity(textA: string, textB: string): number {
    if (this.options.ignoreWhitespace) {
      textA = textA.replace(/\s+/g, ' ').trim();
      textB = textB.replace(/\s+/g, ' ').trim();
    }

    if (this.options.ignoreCase) {
      textA = textA.toLowerCase();
      textB = textB.toLowerCase();
    }

    const wordsA = new Set(textA.split(/\s+/));
    const wordsB = new Set(textB.split(/\s+/));

    const intersection = new Set(
      [...wordsA].filter(word => wordsB.has(word))
    );
    const union = new Set([...wordsA, ...wordsB]);

    if (union.size === 0) return 1;

    return intersection.size / union.size;
  }

  /**
   * Calculate comparison metrics
   */
  private calculateMetrics(
    sessionA: ThinkingSession,
    sessionB: ThinkingSession
  ): ComparisonMetrics {
    const thoughtCountA = sessionA.thoughts?.length || 0;
    const thoughtCountB = sessionB.thoughts?.length || 0;

    return {
      thoughtCountDiff: Math.abs(thoughtCountA - thoughtCountB),
      modesSame: sessionA.mode === sessionB.mode,
      completionDiff: (sessionA.isComplete ? 1 : 0) - (sessionB.isComplete ? 1 : 0),
      averageConfidenceDiff: 0, // Placeholder
      taxonomySimilarity: 0.5, // Placeholder
      qualityScoreDiff: 0, // Placeholder
      durationDiff: 0, // Placeholder
    };
  }

  /**
   * Generate comparison summary
   */
  private generateSummary(
    differences: Difference[],
    similarity: SimilarityMetrics
  ): ComparisonSummary {
    const majorDifferences = differences.filter(
      d => d.severity === 'major' || d.severity === 'critical'
    ).length;

    const minorDifferences = differences.filter(
      d => d.severity === 'minor' || d.severity === 'info'
    ).length;

    const recommendations: string[] = [];

    if (similarity.overall < 0.5) {
      recommendations.push(
        'Sessions are significantly different. Review major differences carefully.'
      );
    }

    if (similarity.components.mode < 1) {
      recommendations.push(
        'Different thinking modes were used. Consider if the same mode would be more effective.'
      );
    }

    if (similarity.components.thoughtCount < 0.7) {
      recommendations.push(
        'Significant difference in thought counts. Review reasoning depth.'
      );
    }

    return {
      identical: differences.length === 0,
      majorDifferences,
      minorDifferences,
      structuralSimilarity: similarity.structural,
      contentSimilarity: similarity.content,
      recommendations,
    };
  }

  /**
   * Extract thought content for comparison
   */
  private extractThoughtContent(thought: any): string {
    if (typeof thought === 'string') return thought;
    if (thought.thought) return thought.thought;
    if (thought.content) return thought.content;
    return JSON.stringify(thought);
  }

  /**
   * Compare individual thoughts
   */
  compareIndividualThoughts(thoughtA: any, thoughtB: any): ThoughtComparison {
    const contentA = this.extractThoughtContent(thoughtA);
    const contentB = this.extractThoughtContent(thoughtB);

    const similarity = this.textSimilarity(contentA, contentB);
    const differences: Difference[] = [];

    if (similarity < 1) {
      differences.push({
        type: 'thought_content',
        path: 'content',
        valueA: contentA,
        valueB: contentB,
        severity: similarity < 0.5 ? 'major' : 'minor',
        description: `Content similarity: ${Math.round(similarity * 100)}%`,
      });
    }

    return {
      thoughtIndexA: thoughtA.thoughtNumber || 0,
      thoughtIndexB: thoughtB.thoughtNumber || 0,
      similarity,
      differences,
      contentDiff: [],
    };
  }
}
