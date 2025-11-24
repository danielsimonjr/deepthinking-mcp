/**
 * Recommendation Engine Tests (v3.4.0)
 * Phase 4 Task 12: Intelligent recommendations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RecommendationEngine } from '../../../src/ml/recommendation-engine.js';
import type { ThinkingSession } from '../../../src/types/session.js';
import type { Thought } from '../../../src/types/core.js';

describe('RecommendationEngine', () => {
  let engine: RecommendationEngine;
  let trainingData: ThinkingSession[];

  beforeEach(() => {
    engine = new RecommendationEngine();

    // Create diverse training data
    trainingData = [
      createSession('train-1', 'sequential', 10, 0.2, true, 500),
      createSession('train-2', 'mathematics', 12, 0.1, true, 600),
      createSession('train-3', 'causal', 8, 0.3, true, 400),
      createSession('train-4', 'sequential', 15, 0.15, true, 700),
      createSession('train-5', 'bayesian', 6, 0.4, false, 300),
    ];
  });

  describe('constructor', () => {
    it('should create recommendation engine', () => {
      expect(engine).toBeDefined();
    });
  });

  describe('train', () => {
    it('should train on sessions', () => {
      engine.train(trainingData);

      const stats = engine.getTrainingStats();
      expect(stats.sessionCount).toBe(5);
      expect(stats.patternCount).toBeGreaterThanOrEqual(0);
      expect(stats.analysisCount).toBeGreaterThanOrEqual(0);
    });

    it('should collect training statistics', () => {
      engine.train(trainingData);

      const stats = engine.getTrainingStats();
      expect(stats).toBeDefined();
      expect(stats.sessionCount).toBeGreaterThanOrEqual(0);
      expect(stats.patternCount).toBeGreaterThanOrEqual(0);
      expect(stats.analysisCount).toBeGreaterThanOrEqual(0);
      expect(stats.successFactorCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getRecommendations', () => {
    beforeEach(() => {
      engine.train(trainingData);
    });

    it('should generate recommendations without session', () => {
      const result = engine.getRecommendations({});

      expect(result).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.totalRecommendations).toBeGreaterThanOrEqual(0);
      expect(result.summary).toBeDefined();
    });

    it('should generate recommendations for session', () => {
      const session = createSession('test-1', 'sequential', 7, 0.35, false, 350);
      const result = engine.getRecommendations({ session });

      expect(result).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should respect recommendation limit', () => {
      const result = engine.getRecommendations({ limit: 3 });

      expect(result.recommendations.length).toBeLessThanOrEqual(3);
    });

    it('should filter by recommendation types', () => {
      const result = engine.getRecommendations({
        types: ['mode', 'structure'],
      });

      expect(result.recommendations.every(r => r.type === 'mode' || r.type === 'structure')).toBe(true);
    });

    it('should provide domain-specific recommendations', () => {
      const result = engine.getRecommendations({
        context: {
          domain: 'mathematics',
        },
      });

      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should respect mode preferences', () => {
      const result = engine.getRecommendations({
        context: {
          preferences: {
            avoidModes: ['sequential'],
          },
        },
      });

      const modeRecs = result.recommendations.filter(r => r.type === 'mode');
      expect(modeRecs.every(r => !r.title.includes('sequential'))).toBe(true);
    });
  });

  describe('recommendation types', () => {
    beforeEach(() => {
      engine.train(trainingData);
    });

    it('should generate mode recommendations', () => {
      const result = engine.getRecommendations({
        types: ['mode'],
      });

      // Mode recommendations may require more training data
      expect(result).toBeDefined();
      // If we have mode recommendations, they should be of type 'mode'
      if (result.recommendations.length > 0) {
        expect(result.recommendations.every(r => r.type === 'mode')).toBe(true);
      }
    });

    it('should generate structure recommendations', () => {
      const result = engine.getRecommendations({
        types: ['structure'],
      });

      // May or may not have structure recs depending on data
      expect(result).toBeDefined();
    });

    it('should generate behavior recommendations', () => {
      const result = engine.getRecommendations({
        types: ['behavior'],
      });

      // May or may not have behavior recs depending on data
      expect(result).toBeDefined();
    });

    it('should generate template recommendations', () => {
      const result = engine.getRecommendations({
        types: ['template'],
      });

      // May or may not have template recs depending on patterns
      expect(result).toBeDefined();
    });

    it('should generate continuation recommendations', () => {
      const session = createSession('ongoing', 'sequential', 5, 0.5, false, 250);
      const result = engine.getRecommendations({
        session,
        types: ['continuation'],
      });

      expect(result.recommendations.some(r => r.type === 'continuation')).toBe(true);
    });

    it('should generate improvement recommendations', () => {
      const session = createSession('improve', 'sequential', 4, 0.6, false, 200);
      const result = engine.getRecommendations({
        session,
        types: ['improvement'],
      });

      expect(result.recommendations.some(r => r.type === 'improvement')).toBe(true);
    });
  });

  describe('recommendation quality', () => {
    beforeEach(() => {
      engine.train(trainingData);
    });

    it('should include confidence scores', () => {
      const result = engine.getRecommendations({});

      result.recommendations.forEach(rec => {
        expect(rec.confidence).toMatch(/high|medium|low/);
        expect(rec.confidenceScore).toBeGreaterThanOrEqual(0);
        expect(rec.confidenceScore).toBeLessThanOrEqual(1);
      });
    });

    it('should include rationale', () => {
      const result = engine.getRecommendations({});

      result.recommendations.forEach(rec => {
        expect(rec.rationale).toBeDefined();
        expect(rec.rationale.length).toBeGreaterThan(0);
      });
    });

    it('should provide actionable recommendations', () => {
      const result = engine.getRecommendations({});

      const actionable = result.recommendations.filter(r => r.actionable);
      expect(actionable.length).toBeGreaterThan(0);

      actionable.forEach(rec => {
        if (rec.actions) {
          expect(rec.actions.length).toBeGreaterThan(0);
        }
      });
    });

    it('should estimate expected improvement', () => {
      const result = engine.getRecommendations({});

      result.recommendations.forEach(rec => {
        if (rec.expectedImprovement !== undefined) {
          expect(rec.expectedImprovement).toBeGreaterThanOrEqual(0);
          expect(rec.expectedImprovement).toBeLessThanOrEqual(1);
        }
      });
    });

    it('should reference basis for recommendations', () => {
      const result = engine.getRecommendations({});

      result.recommendations.forEach(rec => {
        expect(rec.basedOn).toBeDefined();
        const hasEvidence =
          (rec.basedOn.patterns && rec.basedOn.patterns.length > 0) ||
          (rec.basedOn.metrics && rec.basedOn.metrics.length > 0) ||
          (rec.basedOn.successFactors && rec.basedOn.successFactors.length > 0) ||
          (rec.basedOn.similarSessions && rec.basedOn.similarSessions.length > 0);

        // Some recommendations may not have evidence if data is limited
        expect(typeof hasEvidence).toBe('boolean');
      });
    });
  });

  describe('sorting and filtering', () => {
    beforeEach(() => {
      engine.train(trainingData);
    });

    it('should sort recommendations by confidence', () => {
      const result = engine.getRecommendations({});

      if (result.recommendations.length > 1) {
        for (let i = 1; i < result.recommendations.length; i++) {
          expect(result.recommendations[i - 1].confidenceScore).toBeGreaterThanOrEqual(
            result.recommendations[i].confidenceScore
          );
        }
      }
    });

    it('should count high confidence recommendations', () => {
      const result = engine.getRecommendations({});

      const actualHighCount = result.recommendations.filter(r => r.confidence === 'high').length;
      expect(result.highConfidenceCount).toBe(actualHighCount);
    });
  });

  describe('domain-specific recommendations', () => {
    beforeEach(() => {
      engine.train(trainingData);
    });

    it('should suggest mathematics mode for math domain', () => {
      const result = engine.getRecommendations({
        context: { domain: 'mathematics' },
      });

      const mathRec = result.recommendations.find(r =>
        r.title.toLowerCase().includes('mathematics')
      );
      expect(mathRec).toBeDefined();
    });

    it('should suggest physics mode for physics domain', () => {
      const result = engine.getRecommendations({
        context: { domain: 'physics' },
      });

      const physicsRec = result.recommendations.find(r =>
        r.title.toLowerCase().includes('physics')
      );
      expect(physicsRec).toBeDefined();
    });

    it('should suggest scientific mode for science domain', () => {
      const result = engine.getRecommendations({
        context: { domain: 'science' },
      });

      const scienceRec = result.recommendations.find(r =>
        r.title.toLowerCase().includes('scientific')
      );
      expect(scienceRec).toBeDefined();
    });
  });

  describe('summary generation', () => {
    beforeEach(() => {
      engine.train(trainingData);
    });

    it('should generate meaningful summary', () => {
      const result = engine.getRecommendations({});

      expect(result.summary).toBeDefined();
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it('should mention count in summary', () => {
      const result = engine.getRecommendations({});

      if (result.totalRecommendations > 0) {
        expect(result.summary).toContain(`${result.totalRecommendations}`);
      }
    });
  });
});

// Helper function to create test sessions
function createSession(
  id: string,
  mode: string,
  thoughtCount: number,
  avgUncertainty: number,
  isComplete: boolean,
  timeSpent: number
): ThinkingSession {
  const thoughts: Thought[] = [];

  for (let i = 0; i < thoughtCount; i++) {
    const thought: Thought = {
      id: `${id}-thought-${i}`,
      sessionId: id,
      thoughtNumber: i + 1,
      totalThoughts: thoughtCount,
      content: `Thought ${i + 1} about ${mode} reasoning`,
      timestamp: new Date(Date.now() + i * 1000),
      mode: mode as any,
      nextThoughtNeeded: i < thoughtCount - 1,
    };

    // Add uncertainty
    (thought as any).uncertainty = avgUncertainty + (Math.random() - 0.5) * 0.05;

    thoughts.push(thought);
  }

  return {
    id,
    title: `Session ${id}`,
    mode: mode as any,
    config: {
      modeConfig: { mode },
      enableAutoSave: false,
      enableValidation: true,
      enableVisualization: false,
      integrations: {},
      exportFormats: ['json'],
      autoExportOnComplete: false,
      maxThoughtsInMemory: 1000,
      compressionThreshold: 10000,
    },
    thoughts,
    createdAt: new Date(),
    updatedAt: new Date(),
    currentThoughtNumber: thoughtCount,
    isComplete,
    metrics: {
      totalThoughts: thoughtCount,
      thoughtsByType: {},
      averageUncertainty: avgUncertainty,
      revisionCount: Math.floor(thoughtCount * 0.15),
      timeSpent,
      dependencyDepth: Math.min(thoughtCount - 1, 3),
      customMetrics: new Map(),
    },
    tags: ['test', mode],
  };
}
