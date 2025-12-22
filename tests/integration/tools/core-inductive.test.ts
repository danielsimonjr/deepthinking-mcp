/**
 * Core Mode Integration Tests - Inductive Reasoning
 *
 * Tests T-COR-001 through T-COR-020: Comprehensive integration tests
 * for the deepthinking_core tool with inductive mode.
 *
 * Phase 11 Sprint 1: Test Infrastructure and Core Mode Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type InductiveThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import {
  createInductiveThought,
  createInductiveWithObservations,
  createInductiveWithPattern,
  createInductiveWithGeneralization,
  createInductiveWithConfidence,
  createInductiveWithCounterexamples,
  createInductiveWithSampleSize,
  createCompleteInductiveThought,
  createThoughtWithBranch,
  createRevisionThought,
  createInductiveSequence,
} from '../../utils/thought-factory.js';
import {
  assertValidInductiveThought,
  assertHasObservations,
  assertHasPattern,
  assertHasGeneralization,
  assertConfidenceInRange,
  assertHasCounterexamples,
  assertValidationPassed,
  assertValidationFailed,
  assertHasErrorCode,
  assertHasWarning,
} from '../../utils/assertion-helpers.js';
import {
  SAMPLE_OBSERVATIONS,
  SAMPLE_PATTERNS,
  SAMPLE_GENERALIZATIONS,
  SAMPLE_COUNTEREXAMPLES,
  CONFIDENCE_LEVELS,
  SAMPLE_SIZES,
} from '../../utils/mock-data.js';

describe('Core Mode Integration - Inductive Reasoning', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-COR-001: Basic inductive thought creation
   */
  describe('T-COR-001: Basic Inductive Thought Creation', () => {
    it('should create a basic inductive thought with minimal params', () => {
      const input = createInductiveThought({
        thought: 'Basic inductive reasoning step',
      });

      const thought = factory.createThought(input, 'session-001');

      expect(thought.mode).toBe(ThinkingMode.INDUCTIVE);
      expect(thought.content).toBe('Basic inductive reasoning step');
      expect(thought.sessionId).toBe('session-001');
    });

    it('should assign unique IDs to thoughts', () => {
      const input1 = createInductiveThought({ thought: 'First thought' });
      const input2 = createInductiveThought({ thought: 'Second thought' });

      const thought1 = factory.createThought(input1, 'session-001');
      const thought2 = factory.createThought(input2, 'session-001');

      expect(thought1.id).not.toBe(thought2.id);
    });

    it('should set timestamp to current time', () => {
      const before = new Date();
      const input = createInductiveThought();
      const thought = factory.createThought(input, 'session-001');
      const after = new Date();

      expect(thought.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(thought.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  /**
   * T-COR-002: Inductive thought with observations
   */
  describe('T-COR-002: Inductive Thought with Observations', () => {
    it('should include observations in thought', () => {
      const input = createInductiveWithObservations(SAMPLE_OBSERVATIONS.scientific);

      const thought = factory.createThought(input, 'session-002') as InductiveThought;

      expect(thought.observations).toEqual(SAMPLE_OBSERVATIONS.scientific);
      assertHasObservations(thought, 5);
    });

    it('should handle empty observations array', () => {
      const input = createInductiveWithObservations([]);

      const thought = factory.createThought(input, 'session-002') as InductiveThought;

      expect(thought.observations).toEqual([]);
    });

    it('should handle large observation sets', () => {
      const largeObservations = Array.from({ length: 100 }, (_, i) => `Observation ${i + 1}`);
      const input = createInductiveWithObservations(largeObservations);

      const thought = factory.createThought(input, 'session-002') as InductiveThought;

      expect(thought.observations).toHaveLength(100);
    });
  });

  /**
   * T-COR-003: Inductive thought with pattern identification
   */
  describe('T-COR-003: Pattern Identification', () => {
    it('should include pattern in thought', () => {
      const input = createInductiveWithPattern(
        SAMPLE_PATTERNS.scientific,
        SAMPLE_OBSERVATIONS.scientific
      );

      const thought = factory.createThought(input, 'session-003') as InductiveThought;

      expect(thought.pattern).toBe(SAMPLE_PATTERNS.scientific);
      assertHasPattern(thought);
    });

    it('should handle pattern without observations', () => {
      const input = createInductiveWithPattern(SAMPLE_PATTERNS.simple);

      const thought = factory.createThought(input, 'session-003') as InductiveThought;

      expect(thought.pattern).toBe(SAMPLE_PATTERNS.simple);
    });
  });

  /**
   * T-COR-004: Inductive thought with generalization
   */
  describe('T-COR-004: Generalization Formation', () => {
    it('should include generalization in thought', () => {
      const input = createInductiveWithGeneralization(
        SAMPLE_GENERALIZATIONS.scientific,
        SAMPLE_OBSERVATIONS.scientific,
        SAMPLE_PATTERNS.scientific
      );

      const thought = factory.createThought(input, 'session-004') as InductiveThought;

      expect(thought.generalization).toBe(SAMPLE_GENERALIZATIONS.scientific);
      assertHasGeneralization(thought);
    });

    it('should handle qualified generalizations', () => {
      const input = createInductiveWithGeneralization(SAMPLE_GENERALIZATIONS.qualified);

      const thought = factory.createThought(input, 'session-004') as InductiveThought;

      expect(thought.generalization).toContain('Most');
    });
  });

  /**
   * T-COR-005: Confidence scoring
   */
  describe('T-COR-005: Confidence Scoring', () => {
    it('should include provided confidence score', () => {
      const input = createInductiveWithConfidence(CONFIDENCE_LEVELS.high);

      const thought = factory.createThought(input, 'session-005') as InductiveThought;

      expect(thought.confidence).toBe(CONFIDENCE_LEVELS.high);
    });

    it('should clamp confidence to valid range [0, 1]', () => {
      const inputHigh = createInductiveWithConfidence(1.5);
      const inputLow = createInductiveWithConfidence(-0.5);

      const thoughtHigh = factory.createThought(inputHigh, 'session-005') as InductiveThought;
      const thoughtLow = factory.createThought(inputLow, 'session-005') as InductiveThought;

      assertConfidenceInRange(thoughtHigh, 0, 1);
      assertConfidenceInRange(thoughtLow, 0, 1);
    });

    it('should calculate confidence from observations when not provided', () => {
      const input = createInductiveWithObservations(SAMPLE_OBSERVATIONS.many);
      delete (input as any).confidence;

      const thought = factory.createThought(input, 'session-005') as InductiveThought;

      expect(thought.confidence).toBeGreaterThan(0);
      expect(thought.confidence).toBeLessThanOrEqual(1);
    });
  });

  /**
   * T-COR-006: Counterexample handling
   */
  describe('T-COR-006: Counterexample Handling', () => {
    it('should include counterexamples in thought', () => {
      const input = createInductiveWithCounterexamples(SAMPLE_COUNTEREXAMPLES.multiple);

      const thought = factory.createThought(input, 'session-006') as InductiveThought;

      expect(thought.counterexamples).toEqual(SAMPLE_COUNTEREXAMPLES.multiple);
      assertHasCounterexamples(thought, 3);
    });

    it('should reduce confidence when counterexamples present', () => {
      const inputNoCounter = createInductiveWithObservations(SAMPLE_OBSERVATIONS.few);
      const inputWithCounter = createInductiveWithCounterexamples(
        SAMPLE_COUNTEREXAMPLES.single,
        { observations: SAMPLE_OBSERVATIONS.few }
      );

      const thoughtNoCounter = factory.createThought(inputNoCounter, 'session-006') as InductiveThought;
      const thoughtWithCounter = factory.createThought(inputWithCounter, 'session-006') as InductiveThought;

      expect(thoughtWithCounter.confidence).toBeLessThan(thoughtNoCounter.confidence);
    });
  });

  /**
   * T-COR-007: Sample size specification
   */
  describe('T-COR-007: Sample Size Specification', () => {
    it('should include sample size in thought', () => {
      const input = createInductiveWithSampleSize(SAMPLE_SIZES.large);

      const thought = factory.createThought(input, 'session-007') as InductiveThought;

      expect(thought.sampleSize).toBe(SAMPLE_SIZES.large);
    });

    it('should handle very large sample sizes', () => {
      const input = createInductiveWithSampleSize(SAMPLE_SIZES.xlarge);

      const thought = factory.createThought(input, 'session-007') as InductiveThought;

      expect(thought.sampleSize).toBe(SAMPLE_SIZES.xlarge);
    });
  });

  /**
   * T-COR-008: Complete inductive thought
   */
  describe('T-COR-008: Complete Inductive Thought', () => {
    it('should create a complete inductive thought with all params', () => {
      const input = createCompleteInductiveThought();

      const thought = factory.createThought(input, 'session-008') as InductiveThought;

      assertValidInductiveThought(thought);
      assertHasObservations(thought, 1);
      assertHasPattern(thought);
      assertHasGeneralization(thought);
      assertHasCounterexamples(thought);
    });
  });

  /**
   * T-COR-009: Validation - empty thought rejection
   */
  describe('T-COR-009: Validation - Empty Thought', () => {
    it('should reject empty thought content', () => {
      const input = createInductiveThought({ thought: '' });

      const result = factory.validate(input);

      assertValidationFailed(result);
      assertHasErrorCode(result, 'EMPTY_THOUGHT');
    });

    it('should reject whitespace-only thought content', () => {
      const input = createInductiveThought({ thought: '   ' });

      const result = factory.validate(input);

      assertValidationFailed(result);
      assertHasErrorCode(result, 'EMPTY_THOUGHT');
    });
  });

  /**
   * T-COR-010: Validation - confidence out of range
   */
  describe('T-COR-010: Validation - Confidence Range', () => {
    it('should reject confidence greater than 1', () => {
      const input = createInductiveWithConfidence(1.5);

      const result = factory.validate(input);

      assertValidationFailed(result);
      assertHasErrorCode(result, 'CONFIDENCE_OUT_OF_RANGE');
    });

    it('should reject negative confidence', () => {
      const input = createInductiveWithConfidence(-0.1);

      const result = factory.validate(input);

      assertValidationFailed(result);
      assertHasErrorCode(result, 'CONFIDENCE_OUT_OF_RANGE');
    });

    it('should accept valid confidence values', () => {
      const input = createInductiveWithConfidence(0.5);

      const result = factory.validate(input);

      assertValidationPassed(result);
    });
  });

  /**
   * T-COR-011: Validation - warning for no observations
   */
  describe('T-COR-011: Validation - No Observations Warning', () => {
    it('should warn when no observations provided', () => {
      const input = createInductiveThought();
      delete (input as any).observations;

      const result = factory.validate(input);

      expect(result.valid).toBe(true);
      assertHasWarning(result, 'observations');
    });
  });

  /**
   * T-COR-012: Validation - warning for few observations
   */
  describe('T-COR-012: Validation - Few Observations Warning', () => {
    it('should warn when only 2 observations provided', () => {
      const input = createInductiveWithObservations(['Obs 1', 'Obs 2']);

      const result = factory.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'observations' && w.message.includes('2'))).toBe(true);
    });
  });

  /**
   * T-COR-013: Validation - generalization without observations
   */
  describe('T-COR-013: Validation - Generalization Without Observations', () => {
    it('should warn when generalization has no supporting observations', () => {
      const input = createInductiveWithGeneralization(SAMPLE_GENERALIZATIONS.simple);
      delete (input as any).observations;

      const result = factory.validate(input);

      expect(result.valid).toBe(true);
      assertHasWarning(result, 'generalization');
    });
  });

  /**
   * T-COR-014: Validation - sample size mismatch
   */
  describe('T-COR-014: Validation - Sample Size Mismatch', () => {
    it('should warn when sample size differs from observation count', () => {
      const input = createInductiveThought({
        observations: ['Obs 1', 'Obs 2', 'Obs 3'],
        sampleSize: 10,
      });

      const result = factory.validate(input);

      expect(result.valid).toBe(true);
      assertHasWarning(result, 'sampleSize');
    });
  });

  /**
   * T-COR-015: Validation - high confidence with counterexamples
   */
  describe('T-COR-015: Validation - High Confidence With Counterexamples', () => {
    it('should warn when confidence is high despite counterexamples', () => {
      const input = createInductiveThought({
        confidence: 0.9,
        counterexamples: ['Exception found'],
      });

      const result = factory.validate(input);

      expect(result.valid).toBe(true);
      assertHasWarning(result, 'confidence');
    });
  });

  /**
   * T-COR-016: Branching support
   * Note: branchFrom/branchId are input parameters tracked at session level
   */
  describe('T-COR-016: Branching Support', () => {
    it('should accept branching parameters in input', () => {
      const input = createThoughtWithBranch('inductive', 'thought-2', 'branch-a');

      // Verify input has branching params
      expect((input as any).branchFrom).toBe('thought-2');
      expect((input as any).branchId).toBe('branch-a');

      // Thought should be created successfully
      const thought = factory.createThought(input, 'session-016');
      expect(thought.mode).toBe(ThinkingMode.INDUCTIVE);
      expect(thought.sessionId).toBe('session-016');
    });
  });

  /**
   * T-COR-017: Revision support
   * Note: isRevision and revisesThought are tracked; revisionReason is input-only
   */
  describe('T-COR-017: Revision Support', () => {
    it('should create a revision inductive thought', () => {
      const input = createRevisionThought(
        'inductive',
        'thought-1',
        'New evidence found'
      );

      const thought = factory.createThought(input, 'session-017');

      // isRevision and revisesThought are tracked on the thought
      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('thought-1');
      // revisionReason is available in input but may not be on thought output
      expect((input as any).revisionReason).toBe('New evidence found');
    });
  });

  /**
   * T-COR-018: Thought sequence creation
   */
  describe('T-COR-018: Thought Sequence Creation', () => {
    it('should create a sequence of inductive thoughts', () => {
      const inputs = createInductiveSequence(5);

      const thoughts = inputs.map((input, i) =>
        factory.createThought(input, `session-018-${i}`)
      );

      expect(thoughts).toHaveLength(5);
      thoughts.forEach((thought, i) => {
        expect(thought.mode).toBe(ThinkingMode.INDUCTIVE);
        expect(thought.thoughtNumber).toBe(i + 1);
        expect(thought.totalThoughts).toBe(5);
        expect(thought.nextThoughtNeeded).toBe(i < 4);
      });
    });
  });

  /**
   * T-COR-019: Handler enhancements
   */
  describe('T-COR-019: Handler Enhancements', () => {
    it('should provide related modes in enhancements', () => {
      const input = createInductiveThought();
      const thought = factory.createThought(input, 'session-019');

      const handler = ModeHandlerRegistry.getInstance().getHandler(ThinkingMode.INDUCTIVE);
      const enhancements = handler!.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.DEDUCTIVE);
      expect(enhancements.relatedModes).toContain(ThinkingMode.ABDUCTIVE);
    });

    it('should provide mental models in enhancements', () => {
      const input = createInductiveThought();
      const thought = factory.createThought(input, 'session-019');

      const handler = ModeHandlerRegistry.getInstance().getHandler(ThinkingMode.INDUCTIVE);
      const enhancements = handler!.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain('Pattern Recognition');
      expect(enhancements.mentalModels).toContain('Statistical Generalization');
    });

    it('should provide suggestions for improvement', () => {
      const input = createInductiveThought();
      const thought = factory.createThought(input, 'session-019');

      const handler = ModeHandlerRegistry.getInstance().getHandler(ThinkingMode.INDUCTIVE);
      const enhancements = handler!.getEnhancements(thought);

      expect(enhancements.suggestions).toBeDefined();
      expect(Array.isArray(enhancements.suggestions)).toBe(true);
    });
  });

  /**
   * T-COR-020: End-to-end inductive reasoning flow
   */
  describe('T-COR-020: End-to-End Inductive Flow', () => {
    it('should handle complete inductive reasoning process', () => {
      const sessionId = 'session-020-e2e';

      // Step 1: Gather observations
      const step1Input = createInductiveWithObservations(
        SAMPLE_OBSERVATIONS.scientific,
        {
          thought: 'Observing swan colors',
          thoughtNumber: 1,
          totalThoughts: 4,
          nextThoughtNeeded: true,
        }
      );
      const step1 = factory.createThought(step1Input, sessionId) as InductiveThought;
      expect(step1.observations).toHaveLength(5);

      // Step 2: Identify pattern
      const step2Input = createInductiveWithPattern(
        SAMPLE_PATTERNS.scientific,
        SAMPLE_OBSERVATIONS.scientific,
        {
          thought: 'All observed swans are white',
          thoughtNumber: 2,
          totalThoughts: 4,
          nextThoughtNeeded: true,
        }
      );
      const step2 = factory.createThought(step2Input, sessionId) as InductiveThought;
      assertHasPattern(step2);

      // Step 3: Form generalization
      const step3Input = createInductiveWithGeneralization(
        SAMPLE_GENERALIZATIONS.scientific,
        SAMPLE_OBSERVATIONS.scientific,
        SAMPLE_PATTERNS.scientific,
        {
          thought: 'Forming general hypothesis',
          thoughtNumber: 3,
          totalThoughts: 4,
          nextThoughtNeeded: true,
          confidence: 0.8,
        }
      );
      const step3 = factory.createThought(step3Input, sessionId) as InductiveThought;
      assertHasGeneralization(step3);
      expect(step3.confidence).toBe(0.8);

      // Step 4: Encounter counterexample and revise
      const step4Input = createInductiveWithCounterexamples(
        ['Black swans exist in Australia'],
        {
          thought: 'Discovered black swans - revising hypothesis',
          thoughtNumber: 4,
          totalThoughts: 4,
          nextThoughtNeeded: false,
          observations: SAMPLE_OBSERVATIONS.scientific,
          pattern: SAMPLE_PATTERNS.scientific,
          generalization: 'Most swans are white (revised)',
          confidence: 0.5,
          isRevision: true,
          revisesThought: step3.id,
        }
      );
      const step4 = factory.createThought(step4Input, sessionId) as InductiveThought;
      assertHasCounterexamples(step4);
      expect(step4.confidence).toBeLessThan(step3.confidence);
      expect(step4.isRevision).toBe(true);
    });
  });
});
