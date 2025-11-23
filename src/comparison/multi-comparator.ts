/**
 * Multi-Session Comparator (v3.4.0)
 * Phase 4 Task 9.9: Compare multiple sessions simultaneously
 */

import type {
  MultiSessionComparison,
  SessionCluster,
  ComparisonResult,
} from './types.js';
import type { ThinkingSession } from '../types/session.js';
import { SessionComparator } from './comparator.js';

/**
 * Multi-session comparator for comparing multiple sessions
 */
export class MultiSessionComparator {
  private comparator: SessionComparator;

  constructor() {
    this.comparator = new SessionComparator();
  }

  /**
   * Compare multiple sessions
   */
  compareMultiple(sessions: ThinkingSession[]): MultiSessionComparison {
    if (sessions.length < 2) {
      throw new Error('At least 2 sessions required for comparison');
    }

    // Perform pairwise comparisons
    const pairwiseComparisons = new Map<string, ComparisonResult>();
    const similarityMatrix: number[][] = Array(sessions.length)
      .fill(0)
      .map(() => Array(sessions.length).fill(0));

    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        const result = this.comparator.compare(sessions[i], sessions[j]);
        const key = `${i}-${j}`;
        pairwiseComparisons.set(key, result);
        similarityMatrix[i][j] = result.similarity;
        similarityMatrix[j][i] = result.similarity;
      }
    }

    // Calculate average similarity
    let totalSimilarity = 0;
    let count = 0;
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        totalSimilarity += similarityMatrix[i][j];
        count++;
      }
    }
    const averageSimilarity = count > 0 ? totalSimilarity / count : 0;

    // Cluster sessions
    const clustering = this.clusterSessions(sessions, similarityMatrix);

    // Detect outliers (sessions dissimilar to all others)
    const outliers = this.detectOutliers(sessions, similarityMatrix);

    return {
      sessions: sessions.map(s => s.id || 'unknown'),
      comparedAt: new Date(),
      pairwiseComparisons,
      clustering,
      outliers,
      averageSimilarity,
    };
  }

  /**
   * Cluster similar sessions
   */
  private clusterSessions(
    sessions: ThinkingSession[],
    similarityMatrix: number[][]
  ): SessionCluster[] {
    // Simple clustering: group sessions with similarity > threshold
    const threshold = 0.7;
    const clusters: SessionCluster[] = [];
    const assigned = new Set<number>();

    for (let i = 0; i < sessions.length; i++) {
      if (assigned.has(i)) continue;

      const cluster: number[] = [i];
      assigned.add(i);

      for (let j = i + 1; j < sessions.length; j++) {
        if (assigned.has(j)) continue;

        if (similarityMatrix[i][j] >= threshold) {
          cluster.push(j);
          assigned.add(j);
        }
      }

      // Calculate cluster characteristics
      const clusterSessions = cluster.map(idx => sessions[idx]);
      const avgThoughtCount =
        clusterSessions.reduce(
          (sum, s) => sum + (s.thoughts?.length || 0),
          0
        ) / clusterSessions.length;

      // Calculate intra-cluster similarity
      let totalSimilarity = 0;
      let count = 0;
      for (let a = 0; a < cluster.length; a++) {
        for (let b = a + 1; b < cluster.length; b++) {
          totalSimilarity += similarityMatrix[cluster[a]][cluster[b]];
          count++;
        }
      }
      const avgSimilarity = count > 0 ? totalSimilarity / count : 1;

      // Find common mode
      const modes = clusterSessions.map(s => s.mode);
      const modeCount = new Map<string, number>();
      for (const mode of modes) {
        modeCount.set(mode, (modeCount.get(mode) || 0) + 1);
      }
      const commonMode = Array.from(modeCount.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0];

      clusters.push({
        id: `cluster_${clusters.length}`,
        sessions: cluster.map(idx => sessions[idx].id || `session-${idx}`),
        centroid: sessions[cluster[0]].id || `session-${cluster[0]}`,
        averageIntraClusterSimilarity: avgSimilarity,
        characteristics: {
          commonMode: commonMode as any,
          averageThoughtCount: avgThoughtCount,
          commonTaxonomy: [],
          averageQuality: 0.5,
        },
      });
    }

    return clusters;
  }

  /**
   * Detect outlier sessions
   */
  private detectOutliers(
    sessions: ThinkingSession[],
    similarityMatrix: number[][]
  ): string[] {
    const threshold = 0.3;
    const outliers: string[] = [];

    for (let i = 0; i < sessions.length; i++) {
      // Calculate average similarity to all other sessions
      let avgSimilarity = 0;
      let count = 0;

      for (let j = 0; j < sessions.length; j++) {
        if (i !== j) {
          avgSimilarity += similarityMatrix[i][j];
          count++;
        }
      }

      avgSimilarity = count > 0 ? avgSimilarity / count : 0;

      if (avgSimilarity < threshold) {
        outliers.push(sessions[i].id || `session-${i}`);
      }
    }

    return outliers;
  }

  /**
   * Find most similar session to a target
   */
  findMostSimilar(
    target: ThinkingSession,
    candidates: ThinkingSession[]
  ): { session: ThinkingSession; similarity: number } | null {
    if (candidates.length === 0) return null;

    let maxSimilarity = -1;
    let mostSimilar: ThinkingSession | null = null;

    for (const candidate of candidates) {
      const result = this.comparator.compare(target, candidate);
      if (result.similarity > maxSimilarity) {
        maxSimilarity = result.similarity;
        mostSimilar = candidate;
      }
    }

    return mostSimilar
      ? { session: mostSimilar, similarity: maxSimilarity }
      : null;
  }

  /**
   * Rank sessions by similarity to target
   */
  rankBySimilarity(
    target: ThinkingSession,
    candidates: ThinkingSession[]
  ): Array<{ session: ThinkingSession; similarity: number; rank: number }> {
    const results = candidates.map(candidate => {
      const result = this.comparator.compare(target, candidate);
      return {
        session: candidate,
        similarity: result.similarity,
        rank: 0,
      };
    });

    // Sort by similarity (descending)
    results.sort((a, b) => b.similarity - a.similarity);

    // Assign ranks
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    return results;
  }
}
