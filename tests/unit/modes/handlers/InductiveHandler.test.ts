/**
 * InductiveHandler Unit Tests - Phase 10 Sprint 3
 *
 * Tests for the specialized InductiveHandler:
 * - Pattern recognition from observations
 * - Generalization strength assessment
 * - Counterexample tracking
 * - Sample size and confidence correlation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InductiveHandler } from '../../../../src/modes/handlers/InductiveHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('InductiveHandler', () => {
  let handler: InductiveHandler;

  beforeEach(() => {
    handler = new InductiveHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.INDUCTIVE);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Inductive Reasoning');
    });

    it('should have a description', () => {
      expect(handler.description).toBeTruthy();
      expect(handler.description).toContain('observation');
    });
  });

  describe('createThought', () => {
    it('should create a basic inductive thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Observing patterns',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.INDUCTIVE);
      expect(thought.content).toBe('Observing patterns');
      expect(thought.sessionId).toBe('session-1');
    });

    it('should include observations', () => {
      const input: ThinkingToolInput = {
        thought: 'Collecting data',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        observations: ['Swan 1 is white', 'Swan 2 is white', 'Swan 3 is white'],
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.observations).toEqual(['Swan 1 is white', 'Swan 2 is white', 'Swan 3 is white']);
    });

    it('should include pattern when provided', () => {
      const input: ThinkingToolInput = {
        thought: 'Found pattern',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        pattern: 'All observed swans are white',
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.pattern).toBe('All observed swans are white');
    });

    it('should include generalization when provided', () => {
      const input: ThinkingToolInput = {
        thought: 'Generalizing',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        generalization: 'All swans are white',
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.generalization).toBe('All swans are white');
    });

    it('should calculate confidence based on observations', () => {
      const input: ThinkingToolInput = {
        thought: 'Multiple observations',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        observations: ['obs1', 'obs2', 'obs3', 'obs4', 'obs5'],
      } as any;

      const thought = handler.createThought(input, 'session-1');

      // 5 observations should give higher confidence than baseline
      expect(thought.confidence).toBeGreaterThan(0.5);
    });

    it('should use provided confidence', () => {
      const input: ThinkingToolInput = {
        thought: 'Specific confidence',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        confidence: 0.85,
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.confidence).toBe(0.85);
    });

    it('should reduce confidence for counterexamples', () => {
      const inputNoCounter: ThinkingToolInput = {
        thought: 'No counterexamples',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        observations: ['obs1', 'obs2', 'obs3'],
      } as any;

      const inputWithCounter: ThinkingToolInput = {
        thought: 'With counterexamples',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        observations: ['obs1', 'obs2', 'obs3'],
        counterexamples: ['Black swan found'],
      } as any;

      const thoughtNoCounter = handler.createThought(inputNoCounter, 'session-1');
      const thoughtWithCounter = handler.createThought(inputWithCounter, 'session-1');

      expect(thoughtWithCounter.confidence).toBeLessThan(thoughtNoCounter.confidence);
    });

    it('should include counterexamples', () => {
      const input: ThinkingToolInput = {
        thought: 'Found exceptions',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        counterexamples: ['Black swan in Australia', 'Brown swan in the zoo'],
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.counterexamples).toHaveLength(2);
      expect(thought.counterexamples).toContain('Black swan in Australia');
    });

    it('should include sample size', () => {
      const input: ThinkingToolInput = {
        thought: 'Large sample',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        sampleSize: 100,
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.sampleSize).toBe(100);
    });

    it('should clamp confidence to [0, 1]', () => {
      const inputHigh: ThinkingToolInput = {
        thought: 'High confidence',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        confidence: 1.5,
      } as any;

      const inputLow: ThinkingToolInput = {
        thought: 'Low confidence',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        confidence: -0.5,
      } as any;

      expect(handler.createThought(inputHigh, 'session-1').confidence).toBeLessThanOrEqual(1);
      expect(handler.createThought(inputLow, 'session-1').confidence).toBeGreaterThanOrEqual(0);
    });
  });

  describe('validate', () => {
    it('should pass validation for valid input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid inductive reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        observations: ['obs1', 'obs2', 'obs3'],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for empty thought', () => {
      const input: ThinkingToolInput = {
        thought: '',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should fail for confidence out of range', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        confidence: 1.5,
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'CONFIDENCE_OUT_OF_RANGE')).toBe(true);
    });

    it('should warn when no observations provided', () => {
      const input: ThinkingToolInput = {
        thought: 'No observations',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'observations')).toBe(true);
    });

    it('should warn for few observations', () => {
      const input: ThinkingToolInput = {
        thought: 'Few observations',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        observations: ['obs1', 'obs2'],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'observations' && w.message.includes('2'))).toBe(true);
    });

    it('should warn for generalization without observations', () => {
      const input: ThinkingToolInput = {
        thought: 'Unsupported generalization',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        generalization: 'All X are Y',
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'generalization')).toBe(true);
    });

    it('should warn for sample size mismatch', () => {
      const input: ThinkingToolInput = {
        thought: 'Size mismatch',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        observations: ['obs1', 'obs2', 'obs3'],
        sampleSize: 10,
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'sampleSize')).toBe(true);
    });

    it('should warn for high confidence with counterexamples', () => {
      const input: ThinkingToolInput = {
        thought: 'High confidence despite exceptions',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        confidence: 0.9,
        counterexamples: ['exception1'],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'confidence')).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide related modes', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.DEDUCTIVE);
      expect(enhancements.relatedModes).toContain(ThinkingMode.ABDUCTIVE);
    });

    it('should provide mental models', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain('Pattern Recognition');
      expect(enhancements.mentalModels).toContain('Statistical Generalization');
    });

    it('should suggest collecting observations when none provided', () => {
      const thought = handler.createThought({
        thought: 'No observations',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('observation'))).toBe(true);
    });

    it('should suggest more observations for small samples', () => {
      const thought = handler.createThought({
        thought: 'Few observations',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        observations: ['obs1', 'obs2', 'obs3'],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('more observation'))).toBe(true);
    });

    it('should suggest looking for pattern when observations exist but no pattern', () => {
      const thought = handler.createThought({
        thought: 'Looking for pattern',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        observations: ['obs1', 'obs2', 'obs3', 'obs4'],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('common') || s.includes('pattern'))).toBe(true);
    });

    it('should suggest generalization when pattern exists', () => {
      const thought = handler.createThought({
        thought: 'Pattern found',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        observations: ['obs1', 'obs2', 'obs3'],
        pattern: 'All X share property Y',
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('general'))).toBe(true);
    });

    it('should warn about counterexamples', () => {
      const thought = handler.createThought({
        thought: 'Exceptions found',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        observations: ['obs1', 'obs2', 'obs3'],
        counterexamples: ['exception1', 'exception2'],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some(w => w.includes('counterexample'))).toBe(true);
    });

    it('should warn about high confidence with small sample', () => {
      const thought = handler.createThought({
        thought: 'Overconfident',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        observations: ['obs1', 'obs2', 'obs3'],
        confidence: 0.95,
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some(w => w.includes('high confidence'))).toBe(true);
    });

    it('should suggest statistical analysis for large samples', () => {
      const thought = handler.createThought({
        thought: 'Large sample',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        sampleSize: 50,
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('statistical'))).toBe(true);
    });

    it('should include metrics', () => {
      const thought = handler.createThought({
        thought: 'Metrics test',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'inductive',
        observations: ['obs1', 'obs2', 'obs3'],
        counterexamples: ['exception1'],
        confidence: 0.7,
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.observationCount).toBe(3);
      expect(enhancements.metrics!.counterexampleCount).toBe(1);
      expect(enhancements.metrics!.confidence).toBe(0.7);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support observation', () => {
      expect(handler.supportsThoughtType('observation')).toBe(true);
    });

    it('should support pattern_identification', () => {
      expect(handler.supportsThoughtType('pattern_identification')).toBe(true);
    });

    it('should support generalization', () => {
      expect(handler.supportsThoughtType('generalization')).toBe(true);
    });

    it('should support counterexample_analysis', () => {
      expect(handler.supportsThoughtType('counterexample_analysis')).toBe(true);
    });

    it('should support confidence_assessment', () => {
      expect(handler.supportsThoughtType('confidence_assessment')).toBe(true);
    });

    it('should not support unknown thought type', () => {
      expect(handler.supportsThoughtType('unknown_type')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete inductive reasoning process', () => {
      // Step 1: Gather observations
      const step1 = handler.createThought({
        thought: 'Observing bird colors in the local pond',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'inductive',
        observations: [
          'Swan A is white',
          'Swan B is white',
          'Swan C is white',
          'Swan D is white',
          'Swan E is white',
        ],
      } as any, 'session-1');

      expect(step1.observations).toHaveLength(5);

      // Step 2: Identify pattern
      const step2 = handler.createThought({
        thought: 'All swans observed so far have been white',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'inductive',
        observations: step1.observations,
        pattern: 'Every swan I have observed is white',
      } as any, 'session-1');

      expect(step2.pattern).toBe('Every swan I have observed is white');

      // Step 3: Form generalization
      const step3 = handler.createThought({
        thought: 'Based on observations, forming a general hypothesis',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'inductive',
        observations: step1.observations,
        pattern: step2.pattern,
        generalization: 'All swans are white',
        confidence: 0.8,
      } as any, 'session-1');

      expect(step3.generalization).toBe('All swans are white');
      expect(step3.confidence).toBe(0.8);

      // Step 4: Encounter counterexample
      const step4 = handler.createThought({
        thought: 'Discovered black swans exist in Australia',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        mode: 'inductive',
        observations: step1.observations,
        pattern: step2.pattern,
        generalization: 'Most swans are white (revised)',
        counterexamples: ['Black swans exist in Australia'],
        confidence: 0.5,
        isRevision: true,
        revisesThought: step3.id,
      } as any, 'session-1');

      expect(step4.counterexamples).toContain('Black swans exist in Australia');
      expect(step4.confidence).toBeLessThan(step3.confidence);
      expect(step4.isRevision).toBe(true);
    });
  });
});
