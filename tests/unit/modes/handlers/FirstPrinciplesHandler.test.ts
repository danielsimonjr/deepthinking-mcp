/**
 * FirstPrinciplesHandler Unit Tests
 *
 * Tests for First Principles reasoning mode handler including:
 * - Foundational principle identification
 * - Derivation chain validation
 * - Assumption checking
 * - Bottom-up reasoning verification
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FirstPrinciplesHandler } from '../../../../src/modes/handlers/FirstPrinciplesHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('FirstPrinciplesHandler', () => {
  let handler: FirstPrinciplesHandler;

  beforeEach(() => {
    handler = new FirstPrinciplesHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.FIRSTPRINCIPLES);
    });

    it('should have descriptive mode name', () => {
      expect(handler.modeName).toBe('First Principles Reasoning');
    });

    it('should have meaningful description', () => {
      expect(handler.description).toContain('fundamental');
      expect(handler.description).toContain('derivation');
    });
  });

  describe('createThought', () => {
    it('should create basic first principles thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Starting from fundamental axioms',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.FIRSTPRINCIPLES);
      expect(thought.content).toBe('Starting from fundamental axioms');
      expect(thought.sessionId).toBe('session-123');
    });

    it('should include question', () => {
      const input: any = {
        thought: 'Investigating battery cost',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
        question: 'Why are batteries expensive?',
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.question).toBe('Why are batteries expensive?');
    });

    it('should include principles', () => {
      const input: any = {
        thought: 'Identifying foundational principles',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
        principles: [
          {
            id: 'p1',
            statement: 'Battery cost = material cost + labor cost + margin',
            justification: 'Basic cost accounting principle',
            source: 'economic theory',
          },
          {
            id: 'p2',
            statement: 'Material costs are driven by commodity prices',
            justification: 'Market economics',
            source: 'market observation',
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.principles.length).toBe(2);
      expect(thought.principles[0].statement).toContain('Battery cost');
    });

    it('should include derivation steps', () => {
      const input: any = {
        thought: 'Deriving conclusions',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
        derivationSteps: [
          {
            step: 1,
            statement: 'If we source materials directly...',
            principle: 'p1',
            justification: 'Eliminates margin markup',
          },
          {
            step: 2,
            statement: 'Labor costs can be automated...',
            principle: 'p2',
            justification: 'Technology advancement',
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.derivationSteps.length).toBe(2);
    });

    it('should include conclusion', () => {
      const input: any = {
        thought: 'Reaching conclusion',
        thoughtNumber: 5,
        totalThoughts: 5,
        nextThoughtNeeded: false,
        mode: 'firstprinciples',
        conclusion: {
          statement: 'Batteries can be made 70% cheaper',
          derivationChain: ['p1', 'p2', 'd1', 'd2'],
          certainty: 0.85,
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.conclusion.statement).toContain('70% cheaper');
      expect(thought.conclusion.certainty).toBe(0.85);
    });

    it('should include alternative interpretations', () => {
      const input: any = {
        thought: 'Considering alternatives',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
        alternativeInterpretations: [
          {
            statement: 'Costs may be driven by regulation',
            likelihood: 0.3,
            implication: 'Policy changes needed instead of technology',
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.alternativeInterpretations.length).toBe(1);
    });

    it('should track revision information', () => {
      const input: ThinkingToolInput = {
        thought: 'Revised principle',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
        isRevision: true,
        revisesThought: 'thought-1',
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('thought-1');
    });
  });

  describe('validate', () => {
    it('should validate basic first principles input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid first principles thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should warn about missing question', () => {
      const input: any = {
        thought: 'First principles without question',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'question')).toBe(true);
    });

    it('should warn about missing principles', () => {
      const input: any = {
        thought: 'First principles without principles',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
        question: 'Some question',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'principles')).toBe(true);
    });

    it('should warn about unjustified principles', () => {
      const input: any = {
        thought: 'Principles without justification',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
        principles: [
          { id: 'p1', statement: 'Some principle' },
          { id: 'p2', statement: 'Another principle', justification: '' },
        ],
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('lack justification'))).toBe(true);
    });

    it('should warn about unknown principle references', () => {
      const input: any = {
        thought: 'Derivation with bad reference',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
        principles: [
          { id: 'p1', statement: 'Principle 1', justification: 'Known' },
        ],
        derivationSteps: [
          { step: 1, statement: 'Step 1', principle: 'p1' },
          { step: 2, statement: 'Step 2', principle: 'p99' }, // Unknown reference
        ],
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('unknown principle'))).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide base enhancements', () => {
      const input: ThinkingToolInput = {
        thought: 'First principles reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.DEDUCTIVE);
      expect(enhancements.mentalModels).toContain("Elon Musk's First Principles Method");
      expect(enhancements.mentalModels).toContain('Socratic Questioning');
    });

    it('should calculate metrics', () => {
      const input: any = {
        thought: 'First principles with data',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
        principles: [{ id: 'p1' }, { id: 'p2' }],
        derivationSteps: [{ step: 1 }],
        conclusion: { statement: 'Conclusion', certainty: 0.7 },
        alternativeInterpretations: [{ statement: 'Alt 1' }],
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.principleCount).toBe(2);
      expect(enhancements.metrics?.derivationStepCount).toBe(1);
      expect(enhancements.metrics?.conclusionCertainty).toBe(0.7);
      expect(enhancements.metrics?.alternativeCount).toBe(1);
    });

    it('should suggest starting point when no principles', () => {
      const input: ThinkingToolInput = {
        thought: 'Empty first principles',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('What do we know for certain')
      );
    });

    it('should suggest building derivation when principles exist', () => {
      const input: any = {
        thought: 'Principles without derivation',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
        principles: [{ id: 'p1', statement: 'Principle 1' }],
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('Build up from principles')
      );
    });

    it('should suggest defining question', () => {
      const input: any = {
        thought: 'Without question',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
        question: '',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('fundamental question')
      );
    });

    it('should suggest formulating conclusion', () => {
      const input: any = {
        thought: 'Without conclusion',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
        principles: [{ id: 'p1' }],
        derivationSteps: [{ step: 1 }],
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('Formulate a conclusion')
      );
    });

    it('should include Socratic guiding questions', () => {
      const input: ThinkingToolInput = {
        thought: 'First principles reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions?.length).toBeGreaterThan(0);
      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('most fundamental truth')
      );
      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('assumptions')
      );
    });
  });

  describe('supportsThoughtType', () => {
    it('should support all thought types', () => {
      // FirstPrinciplesHandler returns true for all thought types
      expect(handler.supportsThoughtType('any_type')).toBe(true);
      expect(handler.supportsThoughtType('principle_identification')).toBe(true);
      expect(handler.supportsThoughtType('')).toBe(true);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete first principles reasoning session', () => {
      // Step 1: Define the question
      const step1: any = {
        thought: 'Starting first principles analysis of electric vehicle costs',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
        question: 'Why are electric vehicles expensive and how can we reduce costs?',
      };

      const thought1 = handler.createThought(step1, 'fp-session');
      expect(thought1.question).toContain('electric vehicles');

      // Step 2: Identify fundamental principles
      const step2: any = {
        thought: 'Identifying the fundamental cost drivers',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
        question: step1.question,
        principles: [
          {
            id: 'p1',
            statement: 'EV cost = battery cost + motor cost + body cost + assembly cost + margin',
            justification: 'Cost accounting fundamentals',
            source: 'manufacturing economics',
          },
          {
            id: 'p2',
            statement: 'Battery cost is ~40% of total EV cost',
            justification: 'Industry data analysis',
            source: 'market research',
          },
          {
            id: 'p3',
            statement: 'Battery cost = $/kWh × capacity',
            justification: 'Linear relationship verified',
            source: 'engineering fundamentals',
          },
        ],
      };

      const thought2 = handler.createThought(step2, 'fp-session');
      expect(thought2.principles.length).toBe(3);

      // Step 3: Build derivation chain
      const step3: any = {
        thought: 'Deriving cost reduction opportunities',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
        question: step1.question,
        principles: step2.principles,
        derivationSteps: [
          {
            step: 1,
            statement: 'Since battery is 40% of cost (p2), reducing battery cost has highest impact',
            principle: 'p2',
            justification: 'Pareto principle - focus on largest contributor',
          },
          {
            step: 2,
            statement: 'Battery cost/kWh can be reduced via chemistry improvements or scale',
            principle: 'p3',
            justification: 'Cost drivers from p3',
          },
          {
            step: 3,
            statement: 'Current lithium cost is not the bottleneck - manufacturing is',
            principle: 'p1',
            justification: 'Raw material is ~15% of battery cost',
          },
        ],
      };

      const thought3 = handler.createThought(step3, 'fp-session');
      expect(thought3.derivationSteps.length).toBe(3);

      // Step 4: Consider alternatives
      const step4: any = {
        thought: 'Considering alternative interpretations',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'firstprinciples',
        question: step1.question,
        principles: step2.principles,
        derivationSteps: step3.derivationSteps,
        alternativeInterpretations: [
          {
            statement: 'Battery costs may plateau due to material constraints',
            likelihood: 0.3,
            implication: 'Need alternative battery chemistries',
          },
          {
            statement: 'Scale economics may have diminishing returns',
            likelihood: 0.2,
            implication: 'Innovation in manufacturing more important than volume',
          },
        ],
      };

      const thought4 = handler.createThought(step4, 'fp-session');
      expect(thought4.alternativeInterpretations.length).toBe(2);

      // Step 5: Reach conclusion
      const step5: any = {
        thought: 'Reaching first principles conclusion',
        thoughtNumber: 5,
        totalThoughts: 5,
        nextThoughtNeeded: false,
        mode: 'firstprinciples',
        question: step1.question,
        principles: step2.principles,
        derivationSteps: step3.derivationSteps,
        alternativeInterpretations: step4.alternativeInterpretations,
        conclusion: {
          statement:
            'EV costs can be reduced 30-50% by focusing on battery manufacturing innovation',
          derivationChain: ['p1', 'p2', 'p3', 'd1', 'd2', 'd3'],
          certainty: 0.75,
        },
      };

      const thought5 = handler.createThought(step5, 'fp-session');
      expect(thought5.conclusion.certainty).toBe(0.75);
      expect(thought5.nextThoughtNeeded).toBe(false);

      // Validate all steps
      const validations = [step1, step2, step3, step4, step5].map((s) => handler.validate(s));
      for (const v of validations) {
        expect(v.valid).toBe(true);
      }

      // Check final enhancements
      const enhancements = handler.getEnhancements(thought5);
      expect(enhancements.metrics?.principleCount).toBe(3);
      expect(enhancements.metrics?.derivationStepCount).toBe(3);
      expect(enhancements.metrics?.conclusionCertainty).toBe(0.75);
    });
  });
});
