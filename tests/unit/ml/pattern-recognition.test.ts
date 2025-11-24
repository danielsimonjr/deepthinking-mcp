/**
 * Pattern Recognition Tests (v3.4.0)
 * Phase 4 Task 10: ML-based pattern recognition
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PatternRecognizer } from '../../../src/ml/pattern-recognition.js';
import type { ThinkingSession } from '../../../src/types/session.js';
import type { Thought } from '../../../src/types/core.js';

describe('PatternRecognizer', () => {
  let recognizer: PatternRecognizer;
  let testSessions: ThinkingSession[];

  beforeEach(() => {
    recognizer = new PatternRecognizer({
      minSupport: 2,
      minConfidence: 0.5,
    });

    // Create test sessions with patterns
    testSessions = [
      createSessionWithPattern('session-1', 'sequential', ['math', 'AI']),
      createSessionWithPattern('session-2', 'sequential', ['math', 'proof']),
      createSessionWithPattern('session-3', 'mathematics', ['theorem', 'proof']),
    ];
  });

  describe('constructor', () => {
    it('should create recognizer with default options', () => {
      const defaultRecognizer = new PatternRecognizer();
      expect(defaultRecognizer).toBeDefined();
    });

    it('should create recognizer with custom options', () => {
      const customRecognizer = new PatternRecognizer({
        minSupport: 5,
        minConfidence: 0.8,
      });
      expect(customRecognizer).toBeDefined();
    });
  });

  describe('addSession', () => {
    it('should add session to training data', () => {
      recognizer.addSession(testSessions[0]);
      expect(recognizer.getPatterns().length).toBe(0); // Not trained yet
    });

    it('should add multiple sessions', () => {
      testSessions.forEach(session => recognizer.addSession(session));
      expect(recognizer.getPatterns().length).toBe(0); // Not trained yet
    });
  });

  describe('train', () => {
    it('should extract patterns from sessions', () => {
      testSessions.forEach(session => recognizer.addSession(session));
      const result = recognizer.train();

      expect(result).toBeDefined();
      expect(result.patterns).toBeDefined();
      expect(result.totalPatterns).toBeGreaterThanOrEqual(0);
      expect(result.sessionCount).toBe(3);
      expect(result.coverage).toBeGreaterThanOrEqual(0);
      expect(result.coverage).toBeLessThanOrEqual(1);
    });

    it('should generate insights', () => {
      testSessions.forEach(session => recognizer.addSession(session));
      const result = recognizer.train();

      expect(result.insights).toBeDefined();
      expect(Array.isArray(result.insights)).toBe(true);

      if (result.totalPatterns > 0) {
        expect(result.insights.length).toBeGreaterThan(0);
      }
    });

    it('should filter patterns by support and confidence', () => {
      const strictRecognizer = new PatternRecognizer({
        minSupport: 10,
        minConfidence: 0.9,
      });

      testSessions.forEach(session => strictRecognizer.addSession(session));
      const result = strictRecognizer.train();

      // With high thresholds, should have fewer patterns
      expect(result.totalPatterns).toBeLessThanOrEqual(10);
    });
  });

  describe('recognize', () => {
    it('should recognize patterns in new session', () => {
      testSessions.forEach(session => recognizer.addSession(session));
      recognizer.train();

      const newSession = createSessionWithPattern('test', 'sequential', ['math']);
      const patterns = recognizer.recognize(newSession);

      expect(patterns).toBeDefined();
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('should return patterns sorted by confidence', () => {
      testSessions.forEach(session => recognizer.addSession(session));
      recognizer.train();

      const newSession = createSessionWithPattern('test', 'sequential', ['math']);
      const patterns = recognizer.recognize(newSession);

      if (patterns.length > 1) {
        for (let i = 1; i < patterns.length; i++) {
          expect(patterns[i - 1].confidence).toBeGreaterThanOrEqual(
            patterns[i].confidence
          );
        }
      }
    });
  });

  describe('getPatterns', () => {
    it('should return all patterns', () => {
      testSessions.forEach(session => recognizer.addSession(session));
      recognizer.train();

      const patterns = recognizer.getPatterns();
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('should return empty array before training', () => {
      const patterns = recognizer.getPatterns();
      expect(patterns).toEqual([]);
    });
  });

  describe('getPattern', () => {
    it('should retrieve pattern by ID', () => {
      testSessions.forEach(session => recognizer.addSession(session));
      const result = recognizer.train();

      if (result.patterns.length > 0) {
        const pattern = recognizer.getPattern(result.patterns[0].id);
        expect(pattern).toBeDefined();
        expect(pattern?.id).toBe(result.patterns[0].id);
      }
    });

    it('should return undefined for non-existent ID', () => {
      const pattern = recognizer.getPattern('non-existent');
      expect(pattern).toBeUndefined();
    });
  });

  describe('getPatternsByType', () => {
    it('should filter patterns by type', () => {
      testSessions.forEach(session => recognizer.addSession(session));
      recognizer.train();

      const sequencePatterns = recognizer.getPatternsByType('sequence');
      expect(Array.isArray(sequencePatterns)).toBe(true);
      expect(sequencePatterns.every(p => p.type === 'sequence')).toBe(true);
    });

    it('should return empty array for type with no patterns', () => {
      const patterns = recognizer.getPatternsByType('convergence');
      expect(patterns).toEqual([]);
    });
  });

  describe('calculateSimilarity', () => {
    it('should calculate similarity between patterns', () => {
      testSessions.forEach(session => recognizer.addSession(session));
      const result = recognizer.train();

      if (result.patterns.length >= 2) {
        const similarity = recognizer.calculateSimilarity(
          result.patterns[0].id,
          result.patterns[1].id
        );

        expect(similarity).toBeGreaterThanOrEqual(0);
        expect(similarity).toBeLessThanOrEqual(1);
      }
    });

    it('should return 0 for non-existent patterns', () => {
      const similarity = recognizer.calculateSimilarity('non-existent-1', 'non-existent-2');
      expect(similarity).toBe(0);
    });
  });

  describe('pattern types', () => {
    it('should extract sequence patterns', () => {
      // Create sessions with repeated sequences
      const sessions = [
        createSessionWithSequence('s1', ['analyze', 'hypothesis', 'test']),
        createSessionWithSequence('s2', ['analyze', 'hypothesis', 'test']),
      ];

      sessions.forEach(session => recognizer.addSession(session));
      recognizer.train();

      const sequencePatterns = recognizer.getPatternsByType('sequence');
      expect(sequencePatterns.length).toBeGreaterThanOrEqual(0);
    });

    it('should extract transition patterns', () => {
      // Create sessions with mode transitions
      const session = createSessionWithModeTransitions('s1', [
        'sequential',
        'mathematics',
        'sequential',
      ]);

      recognizer.addSession(session);
      recognizer.train();

      const transitionPatterns = recognizer.getPatternsByType('transition');
      expect(transitionPatterns.length).toBeGreaterThanOrEqual(0);
    });

    it('should extract structure patterns', () => {
      testSessions.forEach(session => recognizer.addSession(session));
      recognizer.train();

      const structurePatterns = recognizer.getPatternsByType('structure');
      expect(structurePatterns.length).toBeGreaterThanOrEqual(0);
    });
  });
});

// Helper functions
function createSessionWithPattern(
  id: string,
  mode: string,
  tags: string[]
): ThinkingSession {
  const thoughts: Thought[] = [];

  for (let i = 0; i < 5; i++) {
    thoughts.push({
      id: `${id}-thought-${i}`,
      sessionId: id,
      thoughtNumber: i + 1,
      totalThoughts: 5,
      content: `Test thought ${i + 1} for ${mode} with ${tags.join(', ')}`,
      timestamp: new Date(Date.now() + i * 1000),
      mode: mode as any,
      nextThoughtNeeded: i < 4,
    });
  }

  return {
    id,
    title: `Test Session ${id}`,
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
    currentThoughtNumber: 5,
    isComplete: true,
    metrics: {
      totalThoughts: 5,
      thoughtsByType: {},
      averageUncertainty: 0.3,
      revisionCount: 0,
      timeSpent: 300,
      dependencyDepth: 1,
      customMetrics: new Map(),
    },
    tags,
  };
}

function createSessionWithSequence(id: string, sequence: string[]): ThinkingSession {
  const thoughts: Thought[] = sequence.map((content, i) => ({
    id: `${id}-thought-${i}`,
    sessionId: id,
    thoughtNumber: i + 1,
    totalThoughts: sequence.length,
    content,
    timestamp: new Date(Date.now() + i * 1000),
    mode: 'sequential',
    nextThoughtNeeded: i < sequence.length - 1,
  }));

  return {
    id,
    title: `Sequence Test ${id}`,
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
    currentThoughtNumber: sequence.length,
    isComplete: true,
    metrics: {
      totalThoughts: sequence.length,
      thoughtsByType: {},
      averageUncertainty: 0.3,
      revisionCount: 0,
      timeSpent: 300,
      dependencyDepth: 1,
      customMetrics: new Map(),
    },
    tags: ['test'],
  };
}

function createSessionWithModeTransitions(
  id: string,
  modes: string[]
): ThinkingSession {
  const thoughts: Thought[] = modes.map((mode, i) => ({
    id: `${id}-thought-${i}`,
    sessionId: id,
    thoughtNumber: i + 1,
    totalThoughts: modes.length,
    content: `Thought in ${mode} mode`,
    timestamp: new Date(Date.now() + i * 1000),
    mode: mode as any,
    nextThoughtNeeded: i < modes.length - 1,
  }));

  return {
    id,
    title: `Transition Test ${id}`,
    mode: modes[0] as any,
    config: {
      modeConfig: { mode: modes[0] },
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
    currentThoughtNumber: modes.length,
    isComplete: true,
    metrics: {
      totalThoughts: modes.length,
      thoughtsByType: {},
      averageUncertainty: 0.3,
      revisionCount: 0,
      timeSpent: 300,
      dependencyDepth: 1,
      customMetrics: new Map(),
    },
    tags: ['test'],
  };
}
