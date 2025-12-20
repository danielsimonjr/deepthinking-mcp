/**
 * AbductiveHandler Unit Tests - Phase 10 Sprint 3
 *
 * Tests for the specialized AbductiveHandler:
 * - Inference to best explanation
 * - Hypothesis plausibility scoring
 * - Evidence coverage analysis
 * - Occam's razor evaluation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AbductiveHandler } from '../../../../src/modes/handlers/AbductiveHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('AbductiveHandler', () => {
  let handler: AbductiveHandler;

  beforeEach(() => {
    handler = new AbductiveHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.ABDUCTIVE);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Abductive Reasoning');
    });

    it('should have a description mentioning inference or explanation', () => {
      expect(handler.description).toBeTruthy();
      expect(handler.description.toLowerCase()).toMatch(/explanation|inference/);
    });
  });

  describe('createThought', () => {
    it('should create a basic abductive thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Finding best explanation',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.ABDUCTIVE);
      expect(thought.content).toBe('Finding best explanation');
      expect(thought.sessionId).toBe('session-1');
    });

    it('should process string observations', () => {
      const input: ThinkingToolInput = {
        thought: 'Observations collected',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
        observations: ['The lawn is wet', 'It is morning', 'No clouds visible'],
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.observations).toHaveLength(3);
      expect(thought.observations[0].description).toBe('The lawn is wet');
    });

    it('should process object observations', () => {
      const input: ThinkingToolInput = {
        thought: 'Detailed observations',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
        observations: [
          { id: 'o1', description: 'Lawn is wet', confidence: 0.9 },
          { id: 'o2', description: 'No rain last night', confidence: 0.8 },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.observations).toHaveLength(2);
      expect(thought.observations[0].id).toBe('o1');
      expect(thought.observations[0].confidence).toBe(0.9);
    });

    it('should process hypotheses', () => {
      const input: ThinkingToolInput = {
        thought: 'Generating hypotheses',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
        hypotheses: [
          { id: 'h1', explanation: 'Sprinklers ran overnight' },
          { id: 'h2', explanation: 'Heavy dew formed' },
          { id: 'h3', explanation: 'Neighbor watered the lawn' },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.hypotheses).toHaveLength(3);
      expect(thought.hypotheses[0].explanation).toBe('Sprinklers ran overnight');
    });

    it('should score hypotheses based on observations', () => {
      const input: ThinkingToolInput = {
        thought: 'Scoring explanations',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
        observations: ['Lawn is wet', 'Sprinkler timer shows 3am'],
        hypotheses: [
          { id: 'h1', explanation: 'Sprinklers ran at 3am making the lawn wet' },
          { id: 'h2', explanation: 'Aliens visited' },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1');

      // h1 should score higher because it explains the observations better
      const h1 = thought.hypotheses.find(h => h.id === 'h1');
      const h2 = thought.hypotheses.find(h => h.id === 'h2');
      expect(h1!.score).toBeGreaterThan(h2!.score);
    });

    it('should auto-select best explanation', () => {
      const input: ThinkingToolInput = {
        thought: 'Selecting best explanation',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
        observations: ['Lawn is wet'],
        hypotheses: [
          { id: 'h1', explanation: 'Sprinklers ran making the lawn wet', score: 0.8 },
          { id: 'h2', explanation: 'Dew formed', score: 0.6 },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.bestExplanation).toBeDefined();
      expect(thought.bestExplanation!.id).toBe('h1');
    });

    it('should use provided best explanation', () => {
      const input: ThinkingToolInput = {
        thought: 'Explicit best explanation',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
        hypotheses: [
          { id: 'h1', explanation: 'Option A' },
          { id: 'h2', explanation: 'Option B' },
        ],
        bestExplanation: { id: 'h2', explanation: 'Option B' },
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.bestExplanation!.id).toBe('h2');
    });

    it('should process evidence', () => {
      const input: ThinkingToolInput = {
        thought: 'Evaluating evidence',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
        evidence: [
          { hypothesisId: 'h1', type: 'supporting', description: 'Timer log confirms', strength: 0.9 },
          { hypothesisId: 'h2', type: 'refuting', description: 'Temperature too high for dew', strength: 0.7 },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.evidence).toHaveLength(2);
      expect(thought.evidence[0].type).toBe('supporting');
      expect(thought.evidence[1].type).toBe('refuting');
    });

    it('should create default evaluation criteria', () => {
      const input: ThinkingToolInput = {
        thought: 'Default criteria',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.evaluationCriteria).toBeDefined();
      expect(thought.evaluationCriteria.parsimony).toBeDefined();
      expect(thought.evaluationCriteria.explanatoryPower).toBeDefined();
    });

    it('should use provided evaluation criteria', () => {
      const input: ThinkingToolInput = {
        thought: 'Custom criteria',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
        evaluationCriteria: {
          parsimony: 0.8,
          explanatoryPower: 0.9,
          plausibility: 0.7,
          testability: true,
        },
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.evaluationCriteria.parsimony).toBe(0.8);
      expect(thought.evaluationCriteria.explanatoryPower).toBe(0.9);
    });

    it('should set current hypothesis to first hypothesis', () => {
      const input: ThinkingToolInput = {
        thought: 'Current hypothesis',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
        hypotheses: [
          { id: 'h1', explanation: 'First hypothesis' },
          { id: 'h2', explanation: 'Second hypothesis' },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1');

      expect(thought.currentHypothesis).toBeDefined();
      expect(thought.currentHypothesis!.id).toBe('h1');
    });

    it('should track revision', () => {
      const input: ThinkingToolInput = {
        thought: 'Revised analysis',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
        isRevision: true,
        revisesThought: 'thought-2',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('thought-2');
    });
  });

  describe('validate', () => {
    it('should pass validation for valid input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid abductive reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
        observations: ['obs1', 'obs2'],
        hypotheses: [
          { id: 'h1', explanation: 'Explanation A' },
          { id: 'h2', explanation: 'Explanation B' },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn when no observations provided', () => {
      const input: ThinkingToolInput = {
        thought: 'No observations',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'observations')).toBe(true);
    });

    it('should warn for hypotheses without explanations', () => {
      const input: ThinkingToolInput = {
        thought: 'Incomplete hypotheses',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
        hypotheses: [
          { id: 'h1', explanation: 'Good explanation' },
          { id: 'h2', explanation: '' }, // Empty explanation
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'hypotheses' && w.message.includes('lack explanation'))).toBe(true);
    });

    it('should warn when only one hypothesis provided', () => {
      const input: ThinkingToolInput = {
        thought: 'Single hypothesis',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
        hypotheses: [{ id: 'h1', explanation: 'Only option' }],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'hypotheses' && w.message.includes('one'))).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide related modes', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.INDUCTIVE);
      expect(enhancements.relatedModes).toContain(ThinkingMode.BAYESIAN);
    });

    it('should provide mental models', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain("Occam's Razor - prefer simpler explanations");
      expect(enhancements.mentalModels).toContain('Inference to Best Explanation (IBE)');
    });

    it('should suggest generating alternatives for few hypotheses', () => {
      const thought = handler.createThought({
        thought: 'Few hypotheses',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
        hypotheses: [{ id: 'h1', explanation: 'Only one' }],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('alternative'))).toBe(true);
    });

    it('should suggest more observations for few observations', () => {
      const thought = handler.createThought({
        thought: 'Few observations',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
        observations: ['obs1', 'obs2'],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('observation'))).toBe(true);
    });

    it('should suggest collecting evidence when none exists', () => {
      const thought = handler.createThought({
        thought: 'No evidence',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
        hypotheses: [
          { id: 'h1', explanation: 'Hypothesis A' },
          { id: 'h2', explanation: 'Hypothesis B' },
        ],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('evidence'))).toBe(true);
    });

    it('should provide guiding questions', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.length).toBeGreaterThan(0);
      expect(enhancements.guidingQuestions!.some(q => q.includes('explain'))).toBe(true);
    });

    it('should include metrics', () => {
      const thought = handler.createThought({
        thought: 'Metrics test',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'abductive',
        observations: ['obs1', 'obs2', 'obs3'],
        hypotheses: [
          { id: 'h1', explanation: 'Hyp 1' },
          { id: 'h2', explanation: 'Hyp 2' },
        ],
        evidence: [{ hypothesisId: 'h1', type: 'supporting', description: 'Test' }],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.observationCount).toBe(3);
      expect(enhancements.metrics!.hypothesisCount).toBe(2);
      expect(enhancements.metrics!.evidenceCount).toBe(1);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete abductive reasoning (diagnostic scenario)', () => {
      // Step 1: Collect observations
      const step1 = handler.createThought({
        thought: 'Car won\'t start - collecting observations',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'abductive',
        observations: [
          'Car won\'t start',
          'Dashboard lights are dim',
          'Clicking sound when turning key',
          'Headlights work but are dim',
        ],
      } as any, 'session-1');

      expect(step1.observations).toHaveLength(4);

      // Step 2: Generate hypotheses
      const step2 = handler.createThought({
        thought: 'Generating possible explanations',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'abductive',
        observations: step1.observations,
        hypotheses: [
          { id: 'h1', explanation: 'Dead battery - explains dim lights and clicking' },
          { id: 'h2', explanation: 'Faulty starter motor - explains clicking' },
          { id: 'h3', explanation: 'Corroded battery terminals - explains weak electrical' },
          { id: 'h4', explanation: 'Alternator failure - battery not charging' },
        ],
      } as any, 'session-1');

      expect(step2.hypotheses).toHaveLength(4);
      expect(step2.bestExplanation).toBeDefined();

      // Step 3: Evaluate with additional evidence
      const step3 = handler.createThought({
        thought: 'Testing hypotheses with additional evidence',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'abductive',
        observations: step1.observations,
        hypotheses: step2.hypotheses,
        evidence: [
          { hypothesisId: 'h1', type: 'supporting', description: 'Battery is 5 years old', strength: 0.7 },
          { hypothesisId: 'h3', type: 'refuting', description: 'Terminals look clean', strength: 0.8 },
          { hypothesisId: 'h4', type: 'neutral', description: 'Alternator was replaced last year', strength: 0.5 },
        ],
        evaluationCriteria: {
          parsimony: 0.7,
          explanatoryPower: 0.9,
          plausibility: 0.8,
          testability: true,
        },
      } as any, 'session-1');

      expect(step3.evidence).toHaveLength(3);
      expect(step3.evaluationCriteria.explanatoryPower).toBe(0.9);

      // Step 4: Select best explanation
      const step4 = handler.createThought({
        thought: 'Concluding with best explanation',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        mode: 'abductive',
        observations: step1.observations,
        hypotheses: step2.hypotheses,
        evidence: step3.evidence,
        bestExplanation: { id: 'h1', explanation: 'Dead battery - best explains all symptoms' },
      } as any, 'session-1');

      expect(step4.bestExplanation!.id).toBe('h1');
      expect(step4.nextThoughtNeeded).toBe(false);
    });

    it('should apply Occam\'s razor - simpler explanations preferred', () => {
      const input = {
        thought: 'Comparing complex vs simple explanations',
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'abductive',
        observations: ['Light in sky moving fast'],
        hypotheses: [
          {
            id: 'h1',
            explanation: 'Airplane with lights',
            assumptions: [],
          },
          {
            id: 'h2',
            explanation: 'Alien spacecraft from distant galaxy using advanced warp technology invisible to radar with cloaking device that partially failed revealing lights',
            assumptions: ['Aliens exist', 'They have warp tech', 'They have cloaking', 'Cloaking failed'],
          },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1');

      // Simpler explanation (airplane) should score higher
      const simple = thought.hypotheses.find(h => h.id === 'h1');
      const complex = thought.hypotheses.find(h => h.id === 'h2');

      expect(simple!.score).toBeGreaterThan(complex!.score);
    });
  });
});
