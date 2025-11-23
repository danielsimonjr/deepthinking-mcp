/**
 * Diff Generator (v3.4.0)
 * Phase 4 Task 9.9: Generate detailed diffs between sessions
 */

import type {
  TextDiff,
  ComparisonTimeline,
  TimelineEvent,
  DivergencePoint,
  ConvergencePoint,
} from './types.js';
import type { ThinkingSession } from '../types/session.js';

/**
 * Diff generator for creating detailed diffs
 */
export class DiffGenerator {
  /**
   * Generate text diff between two strings
   */
  generateTextDiff(textA: string, textB: string, contextLines: number = 3): TextDiff[] {
    const linesA = textA.split('\n');
    const linesB = textB.split('\n');

    const diffs: TextDiff[] = [];
    const maxLength = Math.max(linesA.length, linesB.length);

    for (let i = 0; i < maxLength; i++) {
      const lineA = linesA[i];
      const lineB = linesB[i];

      if (lineA === undefined && lineB !== undefined) {
        diffs.push({
          type: 'added',
          lineNumber: i + 1,
          content: lineB,
        });
      } else if (lineA !== undefined && lineB === undefined) {
        diffs.push({
          type: 'removed',
          lineNumber: i + 1,
          content: lineA,
        });
      } else if (lineA !== lineB) {
        diffs.push({
          type: 'modified',
          lineNumber: i + 1,
          content: lineB,
          context: this.getContext(linesA, i, contextLines),
        });
      } else {
        diffs.push({
          type: 'unchanged',
          lineNumber: i + 1,
          content: lineA,
        });
      }
    }

    return diffs;
  }

  /**
   * Generate comparison timeline
   */
  generateTimeline(
    sessionA: ThinkingSession,
    sessionB: ThinkingSession
  ): ComparisonTimeline {
    const events: TimelineEvent[] = [];
    const divergencePoints: DivergencePoint[] = [];
    const convergencePoints: ConvergencePoint[] = [];

    const thoughtsA = sessionA.thoughts || [];
    const thoughtsB = sessionB.thoughts || [];

    // Track mode switches
    if (sessionA.mode !== sessionB.mode) {
      events.push({
        timestamp: 0,
        sessionAThought: 0,
        sessionBThought: 0,
        eventType: 'mode_switch',
        description: `Different starting modes: ${sessionA.mode} vs ${sessionB.mode}`,
      });

      divergencePoints.push({
        thoughtIndex: 0,
        divergenceType: 'approach',
        severity: 0.8,
        description: 'Sessions started with different thinking modes',
      });
    }

    // Compare thought progressions
    const maxLength = Math.max(thoughtsA.length, thoughtsB.length);

    for (let i = 0; i < maxLength; i++) {
      const thoughtA = thoughtsA[i];
      const thoughtB = thoughtsB[i];

      if (thoughtA && thoughtB) {
        const contentA = this.extractContent(thoughtA);
        const contentB = this.extractContent(thoughtB);
        const similarity = this.calculateSimilarity(contentA, contentB);

        events.push({
          timestamp: i,
          sessionAThought: i,
          sessionBThought: i,
          eventType: 'thought_added',
          description: `Thought ${i + 1}: ${Math.round(similarity * 100)}% similar`,
        });

        if (similarity < 0.5) {
          divergencePoints.push({
            thoughtIndex: i,
            divergenceType: 'content',
            severity: 1 - similarity,
            description: `Significant content divergence at thought ${i + 1}`,
          });
        } else if (similarity > 0.8) {
          convergencePoints.push({
            thoughtIndexA: i,
            thoughtIndexB: i,
            similarity,
            description: `High similarity at thought ${i + 1}`,
          });
        }
      } else if (thoughtA && !thoughtB) {
        events.push({
          timestamp: i,
          sessionAThought: i,
          eventType: 'thought_added',
          description: `Session A has additional thought ${i + 1}`,
        });
      } else if (!thoughtA && thoughtB) {
        events.push({
          timestamp: i,
          sessionBThought: i,
          eventType: 'thought_added',
          description: `Session B has additional thought ${i + 1}`,
        });
      }
    }

    return {
      sessionA: sessionA.id || 'session-a',
      sessionB: sessionB.id || 'session-b',
      events,
      divergencePoints,
      convergencePoints,
    };
  }

  /**
   * Generate unified diff format (similar to git diff)
   */
  generateUnifiedDiff(
    sessionA: ThinkingSession,
    sessionB: ThinkingSession
  ): string {
    const lines: string[] = [];

    lines.push(`--- Session A: ${sessionA.id || 'unknown'}`);
    lines.push(`+++ Session B: ${sessionB.id || 'unknown'}`);
    lines.push('');

    // Compare modes
    if (sessionA.mode !== sessionB.mode) {
      lines.push('## Mode');
      lines.push(`- ${sessionA.mode}`);
      lines.push(`+ ${sessionB.mode}`);
      lines.push('');
    }

    // Compare thought counts
    const countA = sessionA.thoughts?.length || 0;
    const countB = sessionB.thoughts?.length || 0;
    if (countA !== countB) {
      lines.push('## Thought Count');
      lines.push(`- ${countA} thoughts`);
      lines.push(`+ ${countB} thoughts`);
      lines.push('');
    }

    // Compare completion
    if (sessionA.completed !== sessionB.completed) {
      lines.push('## Completion Status');
      lines.push(`- ${sessionA.completed ? 'Completed' : 'Incomplete'}`);
      lines.push(`+ ${sessionB.completed ? 'Completed' : 'Incomplete'}`);
      lines.push('');
    }

    // Compare thoughts
    const thoughtsA = sessionA.thoughts || [];
    const thoughtsB = sessionB.thoughts || [];
    const maxLength = Math.max(thoughtsA.length, thoughtsB.length);

    for (let i = 0; i < maxLength; i++) {
      const thoughtA = thoughtsA[i];
      const thoughtB = thoughtsB[i];

      if (!thoughtA && thoughtB) {
        lines.push(`## Thought ${i + 1} (Added in B)`);
        lines.push(`+ ${this.extractContent(thoughtB)}`);
        lines.push('');
      } else if (thoughtA && !thoughtB) {
        lines.push(`## Thought ${i + 1} (Removed in B)`);
        lines.push(`- ${this.extractContent(thoughtA)}`);
        lines.push('');
      } else if (thoughtA && thoughtB) {
        const contentA = this.extractContent(thoughtA);
        const contentB = this.extractContent(thoughtB);

        if (contentA !== contentB) {
          lines.push(`## Thought ${i + 1} (Modified)`);
          lines.push(`- ${contentA}`);
          lines.push(`+ ${contentB}`);
          lines.push('');
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate side-by-side diff
   */
  generateSideBySideDiff(
    sessionA: ThinkingSession,
    sessionB: ThinkingSession
  ): string {
    const lines: string[] = [];
    const width = 40;

    lines.push(
      `Session A${' '.repeat(width - 9)} | Session B`
    );
    lines.push(`${'='.repeat(width)} | ${'='.repeat(width)}`);

    // Compare modes
    const modeA = sessionA.mode.padEnd(width);
    const modeB = sessionB.mode.padEnd(width);
    lines.push(`${modeA} | ${modeB}`);
    lines.push('');

    // Compare thoughts
    const thoughtsA = sessionA.thoughts || [];
    const thoughtsB = sessionB.thoughts || [];
    const maxLength = Math.max(thoughtsA.length, thoughtsB.length);

    for (let i = 0; i < maxLength; i++) {
      const contentA = thoughtsA[i]
        ? this.extractContent(thoughtsA[i]).substring(0, width)
        : '';
      const contentB = thoughtsB[i]
        ? this.extractContent(thoughtsB[i]).substring(0, width)
        : '';

      lines.push(
        `${contentA.padEnd(width)} | ${contentB.padEnd(width)}`
      );
    }

    return lines.join('\n');
  }

  /**
   * Get context lines around a line
   */
  private getContext(
    lines: string[],
    lineIndex: number,
    contextLines: number
  ): string[] {
    const start = Math.max(0, lineIndex - contextLines);
    const end = Math.min(lines.length, lineIndex + contextLines + 1);
    return lines.slice(start, end);
  }

  /**
   * Extract content from thought
   */
  private extractContent(thought: any): string {
    if (typeof thought === 'string') return thought;
    if (thought.thought) return thought.thought;
    if (thought.content) return thought.content;
    return JSON.stringify(thought);
  }

  /**
   * Calculate similarity between two strings
   */
  private calculateSimilarity(textA: string, textB: string): number {
    const wordsA = new Set(textA.toLowerCase().split(/\s+/));
    const wordsB = new Set(textB.toLowerCase().split(/\s+/));

    const intersection = new Set(
      [...wordsA].filter(word => wordsB.has(word))
    );
    const union = new Set([...wordsA, ...wordsB]);

    if (union.size === 0) return 1;

    return intersection.size / union.size;
  }
}
