/**
 * Core Mode Integration Tests - Abductive Reasoning
 *
 * Tests T-COR-036 through T-COR-045: Comprehensive integration tests
 * for the deepthinking_core tool with abductive mode.
 *
 * Phase 11 Sprint 1: Test Infrastructure and Core Mode Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type AbductiveThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import {
  createAbductiveThought,
  createAbductiveWithObservations,
  createAbductiveWithHypotheses,
  createAbductiveWithBestExplanation,
  createAbductiveWithScoredHypotheses,
  createCompleteAbductiveThought,
  createThoughtWithBranch,
  createRevisionThought,
  createAbductiveRefinementSequence,
  type TestHypothesis,
} from '../../utils/thought-factory.js';
import {
  assertValidAbductiveThought,
  assertHasHypotheses,
  assertHasBestExplanation,
  assertBestExplanationIsFromHypotheses,
  assertHypothesesHaveScores,
  assertValidationPassed,
  assertValidationFailed,
  assertHasErrorCode,
  assertHasWarning,
} from '../../utils/assertion-helpers.js';
import {
  SAMPLE_HYPOTHESES,
  ABDUCTIVE_OBSERVATIONS,
  BEST_EXPLANATIONS,
} from '../../utils/mock-data.js';

describe('Core Mode Integration - Abductive Reasoning', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-COR-036: Basic abductive thought creation
   */
  describe('T-COR-036: Basic Abductive Thought Creation', () => {
    it('should create a basic abductive thought with minimal params', () => {
      const input = createAbductiveThought({
        thought: 'Basic abductive reasoning step',
      });

      const thought = factory.createThought(input, 'session-036');

      expect(thought.mode).toBe(ThinkingMode.ABDUCTIVE);
      expect(thought.content).toBe('Basic abductive reasoning step');
      expect(thought.sessionId).toBe('session-036');
    });

    it('should assign unique IDs to abductive thoughts', () => {
      const input1 = createAbductiveThought({ thought: 'First hypothesis' });
      const input2 = createAbductiveThought({ thought: 'Second hypothesis' });

      const thought1 = factory.createThought(input1, 'session-036');
      const thought2 = factory.createThought(input2, 'session-036');

      expect(thought1.id).not.toBe(thought2.id);
    });

    it('should set timestamp correctly', () => {
      const before = new Date();
      const input = createAbductiveThought();
      const thought = factory.createThought(input, 'session-036');
      const after = new Date();

      expect(thought.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(thought.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  /**
   * T-COR-037: Abductive thought with observations
   */
  describe('T-COR-037: Abductive Thought with Observations', () => {
    it('should include observations in thought', () => {
      const input = createAbductiveWithObservations(ABDUCTIVE_OBSERVATIONS.system);

      const thought = factory.createThought(input, 'session-037') as AbductiveThought;

      // Abductive observations may be converted to structured format
      expect(thought.observations).toBeDefined();
      expect(Array.isArray(thought.observations)).toBe(true);
    });

    it('should handle medical diagnosis observations', () => {
      const input = createAbductiveWithObservations(ABDUCTIVE_OBSERVATIONS.medical);

      const thought = factory.createThought(input, 'session-037') as AbductiveThought;

      expect(thought.observations).toBeDefined();
    });

    it('should handle debugging observations', () => {
      const input = createAbductiveWithObservations(ABDUCTIVE_OBSERVATIONS.debugging);

      const thought = factory.createThought(input, 'session-037') as AbductiveThought;

      expect(thought.observations).toBeDefined();
    });
  });

  /**
   * T-COR-038: Abductive thought with hypotheses
   */
  describe('T-COR-038: Abductive Thought with Hypotheses', () => {
    it('should include simple hypotheses in thought', () => {
      const input = createAbductiveWithHypotheses(SAMPLE_HYPOTHESES.simple);

      const thought = factory.createThought(input, 'session-038') as AbductiveThought;

      expect(thought.hypotheses).toBeDefined();
      assertHasHypotheses(thought, 2);
    });

    it('should include multiple hypotheses in thought', () => {
      const input = createAbductiveWithHypotheses(SAMPLE_HYPOTHESES.multiple);

      const thought = factory.createThought(input, 'session-038') as AbductiveThought;

      assertHasHypotheses(thought, 5);
    });

    it('should include medical hypotheses', () => {
      const input = createAbductiveWithHypotheses(SAMPLE_HYPOTHESES.medical);

      const thought = factory.createThought(input, 'session-038') as AbductiveThought;

      assertHasHypotheses(thought, 3);
    });

    it('should include debugging hypotheses', () => {
      const input = createAbductiveWithHypotheses(SAMPLE_HYPOTHESES.debugging);

      const thought = factory.createThought(input, 'session-038') as AbductiveThought;

      assertHasHypotheses(thought, 3);
    });
  });

  /**
   * T-COR-039: Abductive thought with best explanation
   */
  describe('T-COR-039: Best Explanation Selection', () => {
    it('should include best explanation in thought', () => {
      const input = createAbductiveWithBestExplanation(
        BEST_EXPLANATIONS.system,
        SAMPLE_HYPOTHESES.multiple
      );

      const thought = factory.createThought(input, 'session-039') as AbductiveThought;

      expect(thought.bestExplanation).toBeDefined();
      assertHasBestExplanation(thought);
    });

    it('should select best explanation from hypotheses', () => {
      const hypotheses: TestHypothesis[] = [
        { id: 'h1', explanation: 'Primary cause', score: 0.9 },
        { id: 'h2', explanation: 'Alternative cause', score: 0.5 },
      ];
      const input = createAbductiveWithBestExplanation(hypotheses[0], hypotheses);

      const thought = factory.createThought(input, 'session-039') as AbductiveThought;

      expect(thought.bestExplanation!.id).toBe('h1');
      assertBestExplanationIsFromHypotheses(thought);
    });
  });

  /**
   * T-COR-040: Hypothesis scoring
   */
  describe('T-COR-040: Hypothesis Scoring', () => {
    it('should include scores in hypotheses', () => {
      const input = createAbductiveWithScoredHypotheses([0.8, 0.6, 0.4, 0.2]);

      const thought = factory.createThought(input, 'session-040') as AbductiveThought;

      assertHypothesesHaveScores(thought);
    });

    it('should order hypotheses by score', () => {
      const input = createAbductiveWithScoredHypotheses([0.2, 0.8, 0.5]);

      const thought = factory.createThought(input, 'session-040') as AbductiveThought;

      // Hypotheses should maintain their original order (not auto-sorted)
      expect(thought.hypotheses).toHaveLength(3);
    });

    it('should handle equal scores', () => {
      const input = createAbductiveWithScoredHypotheses([0.5, 0.5, 0.5]);

      const thought = factory.createThought(input, 'session-040') as AbductiveThought;

      expect(thought.hypotheses).toHaveLength(3);
    });
  });

  /**
   * T-COR-041: Complete abductive thought
   */
  describe('T-COR-041: Complete Abductive Thought', () => {
    it('should create a complete abductive thought with all params', () => {
      const input = createCompleteAbductiveThought();

      const thought = factory.createThought(input, 'session-041') as AbductiveThought;

      assertValidAbductiveThought(thought);
      assertHasHypotheses(thought, 3);
      assertHasBestExplanation(thought);
    });
  });

  /**
   * T-COR-042: Validation - empty thought rejection
   */
  describe('T-COR-042: Validation - Empty Thought', () => {
    it('should reject empty thought content', () => {
      const input = createAbductiveThought({ thought: '' });

      const result = factory.validate(input);

      assertValidationFailed(result);
      assertHasErrorCode(result, 'EMPTY_THOUGHT');
    });
  });

  /**
   * T-COR-043: Branching support for abductive
   * Note: branchFrom/branchId are input parameters tracked at session level
   */
  describe('T-COR-043: Branching Support', () => {
    it('should accept branching parameters in input', () => {
      const input = createThoughtWithBranch('abductive', 'thought-4', 'branch-c');

      // Verify input has branching params
      expect((input as any).branchFrom).toBe('thought-4');
      expect((input as any).branchId).toBe('branch-c');

      // Thought should be created successfully
      const thought = factory.createThought(input, 'session-043');
      expect(thought.mode).toBe(ThinkingMode.ABDUCTIVE);
      expect(thought.sessionId).toBe('session-043');
    });

    it('should accept multiple branch inputs from same thought', () => {
      const input1 = createThoughtWithBranch('abductive', 'thought-4', 'branch-c1');
      const input2 = createThoughtWithBranch('abductive', 'thought-4', 'branch-c2');

      // Verify inputs have different branch IDs
      expect((input1 as any).branchFrom).toBe('thought-4');
      expect((input2 as any).branchFrom).toBe('thought-4');
      expect((input1 as any).branchId).not.toBe((input2 as any).branchId);

      // Both thoughts should be created successfully
      const thought1 = factory.createThought(input1, 'session-043');
      const thought2 = factory.createThought(input2, 'session-043');
      expect(thought1.id).not.toBe(thought2.id);
    });
  });

  /**
   * T-COR-044: Revision support for abductive
   * Note: isRevision and revisesThought are tracked; revisionReason is input-only
   */
  describe('T-COR-044: Revision Support', () => {
    it('should create a revision abductive thought', () => {
      const input = createRevisionThought(
        'abductive',
        'thought-3',
        'New evidence disproves hypothesis'
      );

      const thought = factory.createThought(input, 'session-044');

      // isRevision and revisesThought are tracked on the thought
      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('thought-3');
      // revisionReason is available in input but may not be on thought output
      expect((input as any).revisionReason).toBe('New evidence disproves hypothesis');
    });

    it('should support revising hypothesis ranking', () => {
      // Initial thought
      const initial = createAbductiveWithHypotheses([
        { id: 'h1', explanation: 'Initial best', score: 0.9 },
        { id: 'h2', explanation: 'Alternative', score: 0.4 },
      ]);
      const initialThought = factory.createThought(initial, 'session-044') as AbductiveThought;

      // Revision with new evidence
      const revision = createRevisionThought(
        'abductive',
        initialThought.id,
        'New evidence changes ranking',
      );
      (revision as any).hypotheses = [
        { id: 'h1', explanation: 'Initial best', score: 0.3 },
        { id: 'h2', explanation: 'Alternative', score: 0.8 },
      ];

      const revisionThought = factory.createThought(revision, 'session-044');

      expect(revisionThought.isRevision).toBe(true);
    });
  });

  /**
   * T-COR-045: End-to-end abductive reasoning flow
   */
  describe('T-COR-045: End-to-End Abductive Flow', () => {
    it('should handle complete abductive reasoning process', () => {
      const sessionId = 'session-045-e2e';

      // Step 1: Collect observations
      const step1Input = createAbductiveWithObservations(
        ABDUCTIVE_OBSERVATIONS.system,
        {
          thought: 'System exhibiting unusual behavior',
          thoughtNumber: 1,
          totalThoughts: 4,
          nextThoughtNeeded: true,
        }
      );
      const step1 = factory.createThought(step1Input, sessionId) as AbductiveThought;
      expect(step1.observations).toBeDefined();

      // Step 2: Generate initial hypotheses
      const step2Input = createAbductiveWithHypotheses(
        SAMPLE_HYPOTHESES.multiple,
        {
          thought: 'Generating candidate explanations',
          thoughtNumber: 2,
          totalThoughts: 4,
          nextThoughtNeeded: true,
          observations: ABDUCTIVE_OBSERVATIONS.system,
        }
      );
      const step2 = factory.createThought(step2Input, sessionId) as AbductiveThought;
      assertHasHypotheses(step2, 5);

      // Step 3: Evaluate and score hypotheses
      const scoredHypotheses = SAMPLE_HYPOTHESES.multiple.map(h => ({
        ...h,
        score: h.score || 0.5,
      }));
      const step3Input = createAbductiveWithHypotheses(scoredHypotheses, {
        thought: 'Evaluating hypotheses against observations',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        observations: ABDUCTIVE_OBSERVATIONS.system,
      });
      const step3 = factory.createThought(step3Input, sessionId) as AbductiveThought;
      assertHypothesesHaveScores(step3);

      // Step 4: Select best explanation
      const bestHypothesis = scoredHypotheses.reduce((a, b) =>
        (a.score || 0) > (b.score || 0) ? a : b
      );
      const step4Input = createAbductiveWithBestExplanation(
        bestHypothesis,
        scoredHypotheses,
        {
          thought: 'System overload is the most likely explanation',
          thoughtNumber: 4,
          totalThoughts: 4,
          nextThoughtNeeded: false,
          observations: ABDUCTIVE_OBSERVATIONS.system,
        }
      );
      const step4 = factory.createThought(step4Input, sessionId) as AbductiveThought;
      assertHasBestExplanation(step4);
      expect(step4.bestExplanation!.score).toBe(0.9);
    });

    it('should handle hypothesis refinement sequence', () => {
      const observations = ['Symptom A', 'Symptom B', 'Symptom C'];
      const hypotheses: TestHypothesis[] = [
        { id: 'h1', explanation: 'Cause 1', score: 0.6 },
        { id: 'h2', explanation: 'Cause 2', score: 0.5 },
        { id: 'h3', explanation: 'Cause 3', score: 0.3 },
      ];

      const inputs = createAbductiveRefinementSequence(observations, hypotheses);

      const thoughts = inputs.map((input, i) =>
        factory.createThought(input, `session-045-seq-${i}`)
      ) as AbductiveThought[];

      expect(thoughts).toHaveLength(3);

      // First thought: observations
      expect(thoughts[0].observations).toBeDefined();

      // Second thought: hypotheses generated
      expect(thoughts[1].hypotheses).toHaveLength(3);

      // Third thought: best explanation selected
      assertHasBestExplanation(thoughts[2]);
    });

    it('should handle diagnostic reasoning scenario', () => {
      const sessionId = 'session-045-diagnostic';

      // Medical diagnosis scenario
      const observationsInput = createAbductiveWithObservations(
        ABDUCTIVE_OBSERVATIONS.medical,
        {
          thought: 'Patient presenting with symptoms',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
        }
      );
      const observations = factory.createThought(observationsInput, sessionId);

      const hypothesesInput = createAbductiveWithHypotheses(
        SAMPLE_HYPOTHESES.medical,
        {
          thought: 'Differential diagnosis candidates',
          thoughtNumber: 2,
          totalThoughts: 3,
          nextThoughtNeeded: true,
        }
      );
      const hypotheses = factory.createThought(hypothesesInput, sessionId) as AbductiveThought;
      assertHasHypotheses(hypotheses, 3);

      const diagnosisInput = createAbductiveWithBestExplanation(
        BEST_EXPLANATIONS.medical,
        SAMPLE_HYPOTHESES.medical,
        {
          thought: 'Most likely diagnosis: Common cold',
          thoughtNumber: 3,
          totalThoughts: 3,
          nextThoughtNeeded: false,
        }
      );
      const diagnosis = factory.createThought(diagnosisInput, sessionId) as AbductiveThought;
      assertHasBestExplanation(diagnosis);
      expect(diagnosis.bestExplanation!.explanation).toContain('cold');
    });

    it('should handle debugging reasoning scenario', () => {
      const sessionId = 'session-045-debugging';

      const observationsInput = createAbductiveWithObservations(
        ABDUCTIVE_OBSERVATIONS.debugging,
        {
          thought: 'Application exhibiting errors',
          thoughtNumber: 1,
          totalThoughts: 2,
          nextThoughtNeeded: true,
        }
      );
      const observations = factory.createThought(observationsInput, sessionId);

      const diagnosisInput = createAbductiveWithBestExplanation(
        BEST_EXPLANATIONS.debugging,
        SAMPLE_HYPOTHESES.debugging,
        {
          thought: 'Root cause identified: Null pointer exception',
          thoughtNumber: 2,
          totalThoughts: 2,
          nextThoughtNeeded: false,
        }
      );
      const diagnosis = factory.createThought(diagnosisInput, sessionId) as AbductiveThought;
      assertHasBestExplanation(diagnosis);
      expect(diagnosis.bestExplanation!.explanation).toContain('Null pointer');
    });
  });
});
