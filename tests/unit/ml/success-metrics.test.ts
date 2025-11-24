/**
 * Success Metrics Analyzer Tests (v3.4.0)
 * Phase 4 Task 11: Success metrics and analysis
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SuccessMetricsAnalyzer } from '../../../src/ml/success-metrics.js';
import type { ThinkingSession } from '../../../src/types/session.js';
import type { Thought } from '../../../src/types/core.js';

describe('SuccessMetricsAnalyzer', () => {
  let analyzer: SuccessMetricsAnalyzer;
  let testSessions: ThinkingSession[];

  beforeEach(() => {
    analyzer = new SuccessMetricsAnalyzer();

    // Create test sessions with varying quality
    testSessions = [
      createTestSession('excellent-1', true, 10, 1, 300, 0.1),
      createTestSession('good-1', true, 8, 2, 400, 0.2),
      createTestSession('fair-1', true, 5, 1, 200, 0.4),
      createTestSession('poor-1', false, 3, 0, 100, 0.7),
    ];
  });

  describe('constructor', () => {
    it('should create analyzer', () => {
      expect(analyzer).toBeDefined();
    });
  });

  describe('addSession', () => {
    it('should add session for analysis', () => {
      analyzer.addSession(testSessions[0]);
      expect(analyzer.getAllAnalyses().length).toBe(0); // Not analyzed yet
    });

    it('should add multiple sessions', () => {
      testSessions.forEach(s => analyzer.addSession(s));
      expect(analyzer.getAllAnalyses().length).toBe(0); // Not analyzed yet
    });
  });

  describe('analyzeSession', () => {
    it('should analyze a session', () => {
      const session = testSessions[0];
      const analysis = analyzer.analyzeSession(session);

      expect(analysis).toBeDefined();
      expect(analysis.sessionId).toBe(session.id);
      expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
      expect(analysis.overallScore).toBeLessThanOrEqual(1);
      expect(analysis.rating).toMatch(/excellent|good|fair|poor/);
      expect(Array.isArray(analysis.metrics)).toBe(true);
      expect(analysis.metrics.length).toBeGreaterThan(0);
    });

    it('should calculate metrics for excellent session', () => {
      const session = testSessions[0];
      const analysis = analyzer.analyzeSession(session);

      expect(analysis.rating).toMatch(/excellent|good/);
      expect(analysis.overallScore).toBeGreaterThan(0.6);
    });

    it('should calculate metrics for poor session', () => {
      const session = testSessions[3];
      const analysis = analyzer.analyzeSession(session);

      expect(analysis.rating).toMatch(/poor|fair/);
      expect(analysis.overallScore).toBeLessThan(0.7);
    });

    it('should identify strengths', () => {
      const session = testSessions[0];
      const analysis = analyzer.analyzeSession(session);

      expect(Array.isArray(analysis.strengths)).toBe(true);
    });

    it('should identify weaknesses', () => {
      const session = testSessions[3];
      const analysis = analyzer.analyzeSession(session);

      expect(Array.isArray(analysis.weaknesses)).toBe(true);
    });

    it('should generate recommendations', () => {
      const session = testSessions[2];
      const analysis = analyzer.analyzeSession(session);

      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });

    it('should include comparison to average with enough data', () => {
      // Add 10+ sessions
      for (let i = 0; i < 12; i++) {
        analyzer.addSession(createTestSession(`session-${i}`, true, 7, 1, 300, 0.3));
      }

      const analysis = analyzer.analyzeSession(testSessions[0]);

      expect(analysis.comparisonToAverage).toBeDefined();
      expect(analysis.comparisonToAverage?.percentile).toBeGreaterThanOrEqual(0);
      expect(analysis.comparisonToAverage?.percentile).toBeLessThanOrEqual(100);
    });
  });

  describe('analyzeAll', () => {
    it('should analyze all sessions', () => {
      testSessions.forEach(s => analyzer.addSession(s));
      const insights = analyzer.analyzeAll();

      expect(insights).toBeDefined();
      expect(insights.totalSessions).toBe(4);
      expect(insights.averageScore).toBeGreaterThanOrEqual(0);
      expect(insights.averageScore).toBeLessThanOrEqual(1);
      expect(Array.isArray(insights.topFactors)).toBe(true);
      expect(insights.modePerformance).toBeDefined();
      expect(Array.isArray(insights.recommendations)).toBe(true);
    });

    it('should identify success factors', () => {
      testSessions.forEach(s => analyzer.addSession(s));
      const insights = analyzer.analyzeAll();

      expect(insights.topFactors.length).toBeGreaterThan(0);
      insights.topFactors.forEach(factor => {
        expect(factor.correlation).toBeGreaterThanOrEqual(-1);
        expect(factor.correlation).toBeLessThanOrEqual(1);
        expect(factor.significance).toBeGreaterThanOrEqual(0);
        expect(factor.significance).toBeLessThanOrEqual(1);
      });
    });

    it('should calculate mode performance', () => {
      testSessions.forEach(s => analyzer.addSession(s));
      const insights = analyzer.analyzeAll();

      expect(insights.modePerformance.size).toBeGreaterThan(0);

      for (const [mode, perf] of insights.modePerformance) {
        expect(perf.averageScore).toBeGreaterThanOrEqual(0);
        expect(perf.averageScore).toBeLessThanOrEqual(1);
        expect(perf.sessionCount).toBeGreaterThan(0);
        expect(perf.successRate).toBeGreaterThanOrEqual(0);
        expect(perf.successRate).toBeLessThanOrEqual(100);
      }
    });

    it('should generate global recommendations', () => {
      testSessions.forEach(s => analyzer.addSession(s));
      const insights = analyzer.analyzeAll();

      expect(insights.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getAnalysis', () => {
    it('should retrieve analysis by ID', () => {
      const session = testSessions[0];
      analyzer.analyzeSession(session);

      const analysis = analyzer.getAnalysis(session.id);
      expect(analysis).toBeDefined();
      expect(analysis?.sessionId).toBe(session.id);
    });

    it('should return undefined for non-existent session', () => {
      const analysis = analyzer.getAnalysis('non-existent');
      expect(analysis).toBeUndefined();
    });
  });

  describe('getAllAnalyses', () => {
    it('should return all analyses', () => {
      testSessions.forEach(s => analyzer.analyzeSession(s));

      const analyses = analyzer.getAllAnalyses();
      expect(analyses.length).toBe(4);
    });

    it('should return empty array when no analyses', () => {
      const analyses = analyzer.getAllAnalyses();
      expect(analyses).toEqual([]);
    });
  });

  describe('getSuccessFactors', () => {
    it('should return success factors after analyzing all', () => {
      testSessions.forEach(s => analyzer.addSession(s));
      analyzer.analyzeAll();

      const factors = analyzer.getSuccessFactors();
      expect(Array.isArray(factors)).toBe(true);
      expect(factors.length).toBeGreaterThan(0);
    });

    it('should return empty array before analyzing', () => {
      const factors = analyzer.getSuccessFactors();
      expect(factors).toEqual([]);
    });
  });

  describe('findSimilarSuccessful', () => {
    it('should find similar successful sessions', () => {
      testSessions.forEach(s => analyzer.addSession(s));
      analyzer.analyzeAll();

      const similar = analyzer.findSimilarSuccessful(testSessions[0].id, 2);
      expect(Array.isArray(similar)).toBe(true);
      expect(similar.length).toBeLessThanOrEqual(2);
    });

    it('should return empty array for poor sessions', () => {
      const poorSession = testSessions[3];
      analyzer.analyzeSession(poorSession);

      const similar = analyzer.findSimilarSuccessful(poorSession.id, 2);
      expect(similar).toEqual([]);
    });

    it('should return empty array for non-existent session', () => {
      const similar = analyzer.findSimilarSuccessful('non-existent', 2);
      expect(similar).toEqual([]);
    });
  });

  describe('metric calculations', () => {
    it('should calculate completion metric', () => {
      const completeSession = testSessions[0];
      const analysis = analyzer.analyzeSession(completeSession);
      const completion = analysis.metrics.find(m => m.id === 'completion');

      expect(completion).toBeDefined();
      expect(completion?.value).toBe(1.0);
      expect(completion?.category).toBe('completion');
    });

    it('should calculate goal achievement metric', () => {
      const session = testSessions[0];
      const analysis = analyzer.analyzeSession(session);
      const goal = analysis.metrics.find(m => m.id === 'goal_achievement');

      expect(goal).toBeDefined();
      expect(goal?.category).toBe('completion');
    });

    it('should calculate confidence metric', () => {
      const session = testSessions[0];
      const analysis = analyzer.analyzeSession(session);
      const confidence = analysis.metrics.find(m => m.id === 'confidence');

      expect(confidence).toBeDefined();
      expect(confidence?.category).toBe('quality');
    });

    it('should calculate depth metric', () => {
      const session = testSessions[0];
      const analysis = analyzer.analyzeSession(session);
      const depth = analysis.metrics.find(m => m.id === 'depth');

      expect(depth).toBeDefined();
      expect(depth?.category).toBe('quality');
    });

    it('should calculate coherence metric', () => {
      const session = testSessions[0];
      const analysis = analyzer.analyzeSession(session);
      const coherence = analysis.metrics.find(m => m.id === 'coherence');

      expect(coherence).toBeDefined();
      expect(coherence?.category).toBe('quality');
    });

    it('should calculate efficiency metric', () => {
      const session = testSessions[0];
      const analysis = analyzer.analyzeSession(session);
      const efficiency = analysis.metrics.find(m => m.id === 'efficiency');

      expect(efficiency).toBeDefined();
      expect(efficiency?.category).toBe('efficiency');
    });

    it('should calculate revision ratio metric', () => {
      const session = testSessions[0];
      const analysis = analyzer.analyzeSession(session);
      const revisionRatio = analysis.metrics.find(m => m.id === 'revision_ratio');

      expect(revisionRatio).toBeDefined();
      expect(revisionRatio?.category).toBe('efficiency');
    });
  });

  describe('rating system', () => {
    it('should rate excellent sessions correctly', () => {
      const session = createTestSession('excellent', true, 15, 2, 600, 0.05);
      const analysis = analyzer.analyzeSession(session);

      expect(analysis.overallScore).toBeGreaterThan(0.7);
      expect(analysis.rating).toMatch(/excellent|good/);
    });

    it('should rate poor sessions correctly', () => {
      const session = createTestSession('poor', false, 2, 0, 50, 0.9);
      const analysis = analyzer.analyzeSession(session);

      expect(analysis.overallScore).toBeLessThan(0.6);
      expect(analysis.rating).toMatch(/poor|fair/);
    });
  });
});

// Helper function to create test sessions
function createTestSession(
  id: string,
  isComplete: boolean,
  thoughtCount: number,
  dependencyDepth: number,
  timeSpent: number,
  avgUncertainty: number
): ThinkingSession {
  const thoughts: Thought[] = [];

  for (let i = 0; i < thoughtCount; i++) {
    const thought: Thought = {
      id: `${id}-thought-${i}`,
      sessionId: id,
      thoughtNumber: i + 1,
      totalThoughts: thoughtCount,
      content: `Test thought ${i + 1}`,
      timestamp: new Date(Date.now() + i * 1000),
      mode: 'sequential',
      nextThoughtNeeded: i < thoughtCount - 1,
    };

    // Add uncertainty
    (thought as any).uncertainty = avgUncertainty + (Math.random() - 0.5) * 0.1;

    // Add dependencies for some thoughts
    if (i > 0 && i <= dependencyDepth) {
      (thought as any).dependencies = [`${id}-thought-${i - 1}`];
    }

    thoughts.push(thought);
  }

  return {
    id,
    title: `Test Session ${id}`,
    mode: 'sequential',
    config: {
      modeConfig: { mode: 'sequential' },
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
      thoughtsByType: { sequential: thoughtCount },
      averageUncertainty: avgUncertainty,
      revisionCount: Math.floor(thoughtCount * 0.2),
      timeSpent,
      dependencyDepth,
      customMetrics: new Map(),
    },
    tags: ['test'],
  };
}
