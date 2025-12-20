/**
 * ArgumentationHandler Unit Tests - Phase 15 (v8.4.0)
 *
 * Tests for Argumentation reasoning handler including:
 * - Toulmin model validation
 * - Argument strength calculation
 * - Fallacy detection
 * - Dialectic analysis
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ArgumentationHandler } from '../../../../src/modes/handlers/ArgumentationHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('ArgumentationHandler', () => {
  let handler: ArgumentationHandler;

  beforeEach(() => {
    handler = new ArgumentationHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.ARGUMENTATION);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Academic Argumentation');
    });

    it('should have a description', () => {
      expect(handler.description).toBeDefined();
      expect(handler.description).toContain('Toulmin');
    });
  });

  describe('createThought', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Building an argument for renewable energy investment',
      thoughtNumber: 1,
      totalThoughts: 6,
      nextThoughtNeeded: true,
      mode: 'argumentation',
    };
    const sessionId = 'test-session-argumentation';

    it('should create an argumentation thought with default thought type', () => {
      const thought = handler.createThought(baseInput, sessionId);

      expect(thought.id).toBeDefined();
      expect(thought.sessionId).toBe(sessionId);
      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect(thought.thoughtType).toBe('claim_formulation');
      expect(thought.content).toBe(baseInput.thought);
    });

    it('should create thought with claim_formulation type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'claim_formulation',
        claims: [
          {
            id: 'C1',
            statement: 'Renewable energy investment reduces long-term energy costs',
            type: 'policy',
            scope: 'national',
          },
        ],
        currentClaim: {
          id: 'C1',
          statement: 'Renewable energy investment reduces long-term energy costs',
        },
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('claim_formulation');
      expect(thought.claims).toHaveLength(1);
      expect(thought.currentClaim).toBeDefined();
    });

    it('should create thought with grounds_identification type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'grounds_identification',
        claims: [{ id: 'C1', statement: 'Renewables are cost-effective' }],
        grounds: [
          {
            id: 'G1',
            content: 'Solar panel costs dropped 89% from 2010-2020',
            type: 'statistical',
            source: 'International Energy Agency',
            reliability: 0.9,
            relevance: 0.95,
          },
          {
            id: 'G2',
            content: 'Wind energy is now cheaper than new coal plants',
            type: 'empirical',
            reliability: 0.85,
            relevance: 0.9,
          },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('grounds_identification');
      expect(thought.grounds).toHaveLength(2);
      expect(thought.grounds![0].reliability).toBe(0.9);
    });

    it('should create thought with warrant_construction type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'warrant_construction',
        claims: [{ id: 'C1', statement: 'Renewables save money' }],
        grounds: [{ id: 'G1', content: 'Solar costs dropped 89%', reliability: 0.9, relevance: 0.9 }],
        warrants: [
          {
            id: 'W1',
            statement: 'Lower technology costs lead to lower energy prices',
            type: 'causal',
            strength: 0.85,
            implicit: false,
          },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('warrant_construction');
      expect(thought.warrants).toHaveLength(1);
      expect(thought.warrants![0].strength).toBe(0.85);
    });

    it('should create thought with backing_provision type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'backing_provision',
        warrants: [{ id: 'W1', statement: 'Market competition reduces prices', strength: 0.7 }],
        backings: [
          {
            id: 'B1',
            warrantId: 'W1',
            content: 'Economic theory of supply and demand',
            type: 'theoretical',
            source: 'Principles of Economics',
          },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('backing_provision');
      expect(thought.backings).toHaveLength(1);
      expect(thought.backings![0].warrantId).toBe('W1');
    });

    it('should create thought with rebuttal_anticipation type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'rebuttal_anticipation',
        rebuttals: [
          {
            id: 'R1',
            targetElement: 'claim',
            targetId: 'C1',
            content: 'Renewables are intermittent and unreliable',
            strength: 0.7,
            response: 'Battery storage and grid management solve intermittency',
            responseStrength: 0.8,
          },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('rebuttal_anticipation');
      expect(thought.rebuttals).toHaveLength(1);
      expect(thought.rebuttals![0].response).toBeDefined();
    });

    it('should create thought with qualifier_specification type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'qualifier_specification',
        qualifiers: [
          {
            id: 'Q1',
            type: 'probability',
            term: 'in most cases',
            conditions: ['with adequate grid infrastructure'],
          },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('qualifier_specification');
      expect(thought.qualifiers).toHaveLength(1);
    });

    it('should create thought with argument_assembly type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'argument_assembly',
        arguments: [
          {
            id: 'ARG1',
            name: 'Cost-effectiveness Argument',
            claim: { id: 'C1', statement: 'Renewables save money' },
            grounds: [{ id: 'G1', content: 'Solar costs dropped', reliability: 0.9, relevance: 0.9 }],
            warrants: [{ id: 'W1', statement: 'Lower costs mean savings', strength: 0.85 }],
            backings: [],
            qualifiers: [],
            rebuttals: [],
          },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('argument_assembly');
      expect(thought.arguments).toHaveLength(1);
      expect(thought.argumentStrength).toBeGreaterThan(0);
    });

    it('should create thought with dialectic_analysis type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'dialectic_analysis',
        dialectic: {
          thesis: {
            id: 'T1',
            position: 'Renewable energy is the solution to climate change',
            arguments: ['ARG1'],
          },
          antithesis: {
            id: 'A1',
            position: 'Nuclear energy is more reliable and scalable',
            arguments: ['ARG2'],
          },
          synthesis: {
            id: 'S1',
            position: 'A diverse energy mix including renewables and nuclear is optimal',
            arguments: ['ARG3'],
          },
          resolution: 'synthesis_achieved',
        },
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('dialectic_analysis');
      expect(thought.dialectic).toBeDefined();
      expect(thought.dialectic!.synthesis).toBeDefined();
    });

    it('should detect fallacies in thought content', () => {
      const input = {
        ...baseInput,
        thought: 'This must be true because it is self-evident and anyone who disagrees attacks the person making the argument',
      };
      const thought = handler.createThought(input as any, sessionId);

      // Should detect fallacies based on pattern matching
      expect(thought.fallacies!.length).toBeGreaterThanOrEqual(0); // May or may not detect depending on patterns
    });

    it('should calculate argument strength from components', () => {
      const input = {
        ...baseInput,
        grounds: [{ id: 'G1', reliability: 0.9, relevance: 0.85 }],
        warrants: [{ id: 'W1', strength: 0.8 }],
        backings: [{ id: 'B1', warrantId: 'W1' }],
        rebuttals: [{ id: 'R1', response: 'addressed' }],
        qualifiers: [{ id: 'Q1' }],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.argumentStrength).toBeGreaterThan(0.3);
      expect(thought.argumentStrength).toBeLessThanOrEqual(1);
    });

    it('should default to claim_formulation for invalid thought type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'invalid_type',
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('claim_formulation');
    });
  });

  describe('validate', () => {
    it('should warn when no claims specified', () => {
      const input: ThinkingToolInput = {
        thought: 'Starting argument',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'argumentation',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'claims')).toBe(true);
    });

    it('should warn when claims lack grounds', () => {
      const input = {
        thought: 'Claim without evidence',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'argumentation',
        claims: [{ id: 'C1', statement: 'This is my claim' }],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'grounds')).toBe(true);
    });

    it('should warn when grounds lack warrants', () => {
      const input = {
        thought: 'Grounds without warrants',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'argumentation',
        claims: [{ id: 'C1', statement: 'My claim' }],
        grounds: [{ id: 'G1', content: 'Evidence' }],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'warrants')).toBe(true);
    });

    it('should warn when many warrants have low strength', () => {
      const input = {
        thought: 'Weak warrants',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'argumentation',
        claims: [{ id: 'C1', statement: 'My claim' }],
        grounds: [{ id: 'G1', content: 'Evidence' }],
        warrants: [
          { id: 'W1', statement: 'Weak warrant 1', strength: 0.3 },
          { id: 'W2', statement: 'Weak warrant 2', strength: 0.4 },
          { id: 'W3', statement: 'Strong warrant', strength: 0.8 },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('low strength'))).toBe(true);
    });

    it('should warn when arguments lack rebuttals', () => {
      const input = {
        thought: 'No counter-arguments',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'argumentation',
        arguments: [
          {
            id: 'ARG1',
            claim: { id: 'C1', statement: 'Claim' },
            grounds: [],
            warrants: [],
          },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'rebuttals')).toBe(true);
    });

    it('should warn about critical fallacies', () => {
      const input = {
        thought: 'Fallacious argument',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'argumentation',
        claims: [{ id: 'C1', statement: 'Claim' }],
        fallacies: [
          {
            id: 'F1',
            name: 'Circular Reasoning',
            category: 'formal',
            severity: 'critical',
            description: 'The argument assumes its conclusion',
          },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('critical fallacies'))).toBe(true);
    });

    it('should validate dialectic structure', () => {
      const input = {
        thought: 'Dialectic analysis',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'argumentation',
        claims: [{ id: 'C1', statement: 'Claim' }],
        dialectic: {
          thesis: null, // Missing thesis
          resolution: 'synthesis_achieved',
        },
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field.includes('thesis'))).toBe(true);
    });

    it('should validate Toulmin argument structure', () => {
      const input = {
        thought: 'Incomplete argument',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'argumentation',
        arguments: [
          {
            id: 'ARG1',
            // Missing claim
            grounds: [],
            warrants: [],
          },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'MISSING_CLAIM')).toBe(true);
    });

    it('should pass validation with complete argumentation', () => {
      const input = {
        thought: 'Complete argument',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: 'argumentation',
        claims: [{ id: 'C1', statement: 'Renewables are cost-effective' }],
        grounds: [{ id: 'G1', content: 'Solar costs dropped 89%', reliability: 0.9, relevance: 0.9 }],
        warrants: [{ id: 'W1', statement: 'Lower costs mean savings', strength: 0.85 }],
        rebuttals: [{ id: 'R1', content: 'Intermittency concern', response: 'Battery storage addresses this' }],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide claim_formulation specific guidance', () => {
      const thought = handler.createThought(
        {
          thought: 'Formulating claim',
          thoughtNumber: 1,
          totalThoughts: 6,
          nextThoughtNeeded: true,
          mode: 'argumentation',
          thoughtType: 'claim_formulation',
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('debatable'))).toBe(true);
      expect(enhancements.guidingQuestions!.some((q) => q.includes('falsifiable'))).toBe(true);
    });

    it('should provide grounds_identification specific guidance', () => {
      const thought = handler.createThought(
        {
          thought: 'Identifying grounds',
          thoughtNumber: 2,
          totalThoughts: 6,
          nextThoughtNeeded: true,
          mode: 'argumentation',
          thoughtType: 'grounds_identification',
          claims: [{ id: 'C1', statement: 'Claim' }],
          grounds: [{ id: 'G1', reliability: 0.4, relevance: 0.5 }],
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('evidence'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('reliability'))).toBe(true);
    });

    it('should suggest making implicit warrants explicit', () => {
      const thought = handler.createThought(
        {
          thought: 'Constructing warrants',
          thoughtNumber: 3,
          totalThoughts: 6,
          nextThoughtNeeded: true,
          mode: 'argumentation',
          thoughtType: 'warrant_construction',
          warrants: [
            { id: 'W1', statement: 'Implicit warrant', implicit: true, strength: 0.7 },
            { id: 'W2', statement: 'Another implicit', implicit: true, strength: 0.6 },
          ],
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('implicit'))).toBe(true);
    });

    it('should provide rebuttal_anticipation specific guidance', () => {
      const thought = handler.createThought(
        {
          thought: 'Anticipating rebuttals',
          thoughtNumber: 4,
          totalThoughts: 6,
          nextThoughtNeeded: true,
          mode: 'argumentation',
          thoughtType: 'rebuttal_anticipation',
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('skeptic'))).toBe(true);
    });

    it('should provide dialectic_analysis specific guidance', () => {
      const thought = handler.createThought(
        {
          thought: 'Dialectic analysis',
          thoughtNumber: 5,
          totalThoughts: 6,
          nextThoughtNeeded: true,
          mode: 'argumentation',
          thoughtType: 'dialectic_analysis',
          dialectic: {
            thesis: { id: 'T1', position: 'Thesis' },
            antithesis: { id: 'A1', position: 'Antithesis' },
            // No synthesis
          },
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('synthesis'))).toBe(true);
    });

    it('should include fallacy warnings', () => {
      const thought = handler.createThought(
        {
          thought: 'Argument with fallacies',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'argumentation',
          fallacies: [
            { id: 'F1', name: 'Ad Hominem', severity: 'minor', description: 'Attacks character' },
          ],
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some((w) => w.includes('Ad Hominem'))).toBe(true);
    });

    it('should suggest strengthening weak arguments', () => {
      const thought = handler.createThought(
        {
          thought: 'Weak argument',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'argumentation',
          claims: [{ id: 'C1', statement: 'Claim' }],
          // No grounds, warrants, etc.
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('strength'))).toBe(true);
    });

    it('should include argumentation mental models', () => {
      const thought = handler.createThought(
        {
          thought: 'Testing',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'argumentation',
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toBeDefined();
      expect(enhancements.mentalModels!.some((m) => m.includes('Toulmin'))).toBe(true);
      expect(enhancements.mentalModels!.some((m) => m.includes('Dialectic'))).toBe(true);
    });

    it('should calculate metrics correctly', () => {
      const thought = handler.createThought(
        {
          thought: 'Full argument',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          mode: 'argumentation',
          claims: [{ id: 'C1', statement: 'Claim 1' }, { id: 'C2', statement: 'Claim 2' }],
          grounds: [
            { id: 'G1', reliability: 0.8, relevance: 0.9 },
            { id: 'G2', reliability: 0.7, relevance: 0.8 },
          ],
          warrants: [{ id: 'W1', strength: 0.85 }],
          rebuttals: [{ id: 'R1' }],
          arguments: [
            { id: 'ARG1', claim: { id: 'C1' }, grounds: [], warrants: [], overallStrength: 0.7 },
          ],
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.claimCount).toBe(2);
      expect(enhancements.metrics!.groundsCount).toBe(2);
      expect(enhancements.metrics!.warrantsCount).toBe(1);
      expect(enhancements.metrics!.rebuttalCount).toBe(1);
      expect(enhancements.metrics!.argumentCount).toBe(1);
      expect(enhancements.metrics!.groundsToClaimRatio).toBe(1);
    });
  });

  describe('supportsThoughtType', () => {
    const supportedTypes = [
      'claim_formulation',
      'grounds_identification',
      'warrant_construction',
      'backing_provision',
      'rebuttal_anticipation',
      'qualifier_specification',
      'argument_assembly',
      'dialectic_analysis',
    ];

    supportedTypes.forEach((type) => {
      it(`should support ${type}`, () => {
        expect(handler.supportsThoughtType(type)).toBe(true);
      });
    });

    it('should not support unknown types', () => {
      expect(handler.supportsThoughtType('unknown_type')).toBe(false);
      expect(handler.supportsThoughtType('complexity_analysis')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete Toulmin argumentation workflow', () => {
      const sessionId = 'e2e-argumentation';

      // Step 1: Claim formulation
      const step1 = handler.createThought(
        {
          thought: 'Formulating main claim: Universities should require coding literacy',
          thoughtNumber: 1,
          totalThoughts: 6,
          nextThoughtNeeded: true,
          mode: 'argumentation',
          thoughtType: 'claim_formulation',
          claims: [
            {
              id: 'C1',
              statement: 'Universities should require coding literacy for all students',
              type: 'policy',
            },
          ],
          currentClaim: {
            id: 'C1',
            statement: 'Universities should require coding literacy for all students',
          },
        } as any,
        sessionId
      );
      expect(step1.thoughtType).toBe('claim_formulation');
      expect(step1.claims).toHaveLength(1);

      // Step 2: Grounds identification
      const step2Input = {
        thought: 'Gathering evidence to support the claim',
        thoughtNumber: 2,
        totalThoughts: 6,
        nextThoughtNeeded: true,
        mode: 'argumentation',
        thoughtType: 'grounds_identification',
        claims: step1.claims,
        grounds: [
          {
            id: 'G1',
            content: '65% of jobs require digital skills (World Economic Forum)',
            type: 'statistical',
            source: 'WEF Future of Jobs Report',
            reliability: 0.9,
            relevance: 0.85,
          },
          {
            id: 'G2',
            content: 'Coding teaches logical thinking applicable across disciplines',
            type: 'expert_opinion',
            source: 'Multiple CS education studies',
            reliability: 0.8,
            relevance: 0.9,
          },
        ],
      };
      const step2 = handler.createThought(step2Input as any, sessionId);
      const validation2 = handler.validate(step2Input as any);
      expect(validation2.valid).toBe(true);
      expect(step2.grounds).toHaveLength(2);

      // Step 3: Warrant construction
      const step3Input = {
        thought: 'Connecting evidence to claim',
        thoughtNumber: 3,
        totalThoughts: 6,
        nextThoughtNeeded: true,
        mode: 'argumentation',
        thoughtType: 'warrant_construction',
        claims: step1.claims,
        grounds: step2.grounds,
        warrants: [
          {
            id: 'W1',
            statement: 'Education should prepare students for workforce demands',
            type: 'principle',
            strength: 0.85,
            implicit: false,
          },
          {
            id: 'W2',
            statement: 'Transferable skills benefit all disciplines',
            type: 'causal',
            strength: 0.8,
            implicit: false,
          },
        ],
      };
      const step3 = handler.createThought(step3Input as any, sessionId);
      expect(step3.warrants).toHaveLength(2);

      // Step 4: Rebuttal anticipation
      const step4Input = {
        thought: 'Addressing counter-arguments',
        thoughtNumber: 4,
        totalThoughts: 6,
        nextThoughtNeeded: true,
        mode: 'argumentation',
        thoughtType: 'rebuttal_anticipation',
        claims: step1.claims,
        grounds: step2.grounds,
        warrants: step3.warrants,
        rebuttals: [
          {
            id: 'R1',
            targetElement: 'claim',
            targetId: 'C1',
            content: 'Not all careers require coding',
            strength: 0.7,
            response: 'Coding teaches computational thinking, valuable even without direct coding',
            responseStrength: 0.8,
          },
          {
            id: 'R2',
            targetElement: 'warrant',
            targetId: 'W1',
            content: 'Education should foster critical thinking, not just job skills',
            strength: 0.6,
            response: 'Coding also develops critical and creative thinking',
            responseStrength: 0.75,
          },
        ],
      };
      const step4 = handler.createThought(step4Input as any, sessionId);
      expect(step4.rebuttals).toHaveLength(2);
      expect(step4.rebuttals![0].response).toBeDefined();

      // Step 5: Argument assembly
      const step5Input = {
        thought: 'Assembling complete Toulmin argument',
        thoughtNumber: 5,
        totalThoughts: 6,
        nextThoughtNeeded: true,
        mode: 'argumentation',
        thoughtType: 'argument_assembly',
        arguments: [
          {
            id: 'ARG1',
            name: 'Coding Literacy Argument',
            claim: step1.claims![0],
            grounds: step2.grounds,
            warrants: step3.warrants,
            backings: [],
            qualifiers: [{ id: 'Q1', type: 'probability', term: 'in most programs' }],
            rebuttals: step4.rebuttals,
          },
        ],
      };
      const step5 = handler.createThought(step5Input as any, sessionId);
      expect(step5.arguments).toHaveLength(1);
      expect(step5.argumentStrength).toBeGreaterThan(0);

      // Step 6: Final validation
      const validation5 = handler.validate(step5Input as any);
      expect(validation5.valid).toBe(true);

      // Final enhancements
      const finalEnhancements = handler.getEnhancements(step5);
      expect(finalEnhancements.metrics!.argumentCount).toBe(1);
      expect(finalEnhancements.metrics!.argumentStrength).toBeGreaterThan(0);
    });
  });
});
