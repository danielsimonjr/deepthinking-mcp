/**
 * EvidentialHandler Unit Tests - Phase 15 (v8.4.0)
 *
 * Tests for the Evidential/Dempster-Shafer reasoning handler:
 * - Belief function calculation
 * - Plausibility function computation
 * - Dempster's rule of combination
 * - Uncertainty quantification
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EvidentialHandler } from '../../../../src/modes/handlers/EvidentialHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('EvidentialHandler', () => {
  let handler: EvidentialHandler;

  beforeEach(() => {
    handler = new EvidentialHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.EVIDENTIAL);
    });

    it('should have correct modeName', () => {
      expect(handler.modeName).toBe('Evidential Reasoning');
    });

    it('should have descriptive description', () => {
      expect(handler.description).toContain('Dempster-Shafer');
      expect(handler.description).toContain('belief');
    });
  });

  describe('createThought', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Analyzing evidence using Dempster-Shafer theory',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'evidential',
    };

    it('should create thought with default thought type', () => {
      const thought = handler.createThought(baseInput, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.EVIDENTIAL);
      expect(thought.thoughtType).toBe('hypothesis_definition');
      expect(thought.content).toBe(baseInput.thought);
    });

    it('should create thought with specified thought type', () => {
      const input = { ...baseInput, thoughtType: 'evidence_combination' } as any;
      const thought = handler.createThought(input, 'session-123');

      expect(thought.thoughtType).toBe('evidence_combination');
    });

    it('should process frame of discernment', () => {
      const input = {
        ...baseInput,
        frameOfDiscernment: ['H1', 'H2', 'H3'],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.frameOfDiscernment).toEqual(['H1', 'H2', 'H3']);
    });

    it('should process hypotheses', () => {
      const input = {
        ...baseInput,
        hypotheses: [
          { id: 'H1', name: 'Hypothesis 1', description: 'First hypothesis' },
          { id: 'H2', name: 'Hypothesis 2', description: 'Second hypothesis' },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.hypotheses).toHaveLength(2);
    });

    it('should process evidence', () => {
      const input = {
        ...baseInput,
        evidence: [
          { id: 'E1', description: 'Evidence 1', reliability: 0.8, supportsHypotheses: ['H1'] },
          { id: 'E2', description: 'Evidence 2', reliability: 0.6, supportsHypotheses: ['H2'] },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.evidence).toHaveLength(2);
      expect(thought.evidence[0].reliability).toBe(0.8);
    });

    it('should process belief functions', () => {
      const input = {
        ...baseInput,
        beliefFunctions: [
          {
            id: 'BF1',
            source: 'E1',
            massAssignments: [
              { focalElement: ['H1'], mass: 0.6 },
              { focalElement: ['H1', 'H2'], mass: 0.3 },
              { focalElement: ['H1', 'H2', 'H3'], mass: 0.1 },
            ],
          },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.beliefFunctions).toHaveLength(1);
      expect(thought.beliefFunctions[0].massAssignments).toHaveLength(3);
    });

    it('should process combined belief', () => {
      const input = {
        ...baseInput,
        combinedBelief: {
          method: 'dempster',
          belief: { H1: 0.7, H2: 0.1, H3: 0.05 },
          plausibility: { H1: 0.9, H2: 0.25, H3: 0.15 },
          conflict: 0.1,
        },
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.combinedBelief).toBeDefined();
      expect(thought.combinedBelief.belief.H1).toBe(0.7);
    });

    it('should process decisions', () => {
      const input = {
        ...baseInput,
        decisions: [
          { hypothesis: 'H1', action: 'Accept', justification: 'Highest belief' },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.decisions).toHaveLength(1);
    });
  });

  describe('validate', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Evidential reasoning',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'evidential',
    };

    it('should return valid for well-formed input', () => {
      const input = {
        ...baseInput,
        frameOfDiscernment: ['H1', 'H2'],
        beliefFunctions: [
          {
            massAssignments: [
              { focalElement: ['H1'], mass: 0.5 },
              { focalElement: ['H1', 'H2'], mass: 0.5 },
            ],
          },
        ],
      } as any;

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should fail when mass function does not sum to 1', () => {
      const input = {
        ...baseInput,
        beliefFunctions: [
          {
            massAssignments: [
              { focalElement: ['H1'], mass: 0.5 },
              { focalElement: ['H2'], mass: 0.3 }, // Sum = 0.8
            ],
          },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_MASS_SUM')).toBe(true);
    });

    it('should warn when frame of discernment is empty', () => {
      const result = handler.validate(baseInput);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'frameOfDiscernment')).toBe(true);
    });

    it('should warn about evidence without reliability scores', () => {
      const input = {
        ...baseInput,
        frameOfDiscernment: ['H1'],
        evidence: [
          { id: 'E1', description: 'Evidence 1' }, // No reliability
          { id: 'E2', description: 'Evidence 2', reliability: 0.8 },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('lack reliability'))).toBe(true);
    });

    it('should accept valid mass function summing to 1', () => {
      const input = {
        ...baseInput,
        frameOfDiscernment: ['H1', 'H2'],
        beliefFunctions: [
          {
            massAssignments: [
              { focalElement: ['H1'], mass: 0.4 },
              { focalElement: ['H2'], mass: 0.3 },
              { focalElement: ['H1', 'H2'], mass: 0.3 },
            ],
          },
        ],
      } as any;

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    const createThought = (overrides: any = {}) => {
      const baseInput: ThinkingToolInput = {
        thought: 'Evidential reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'evidential',
        ...overrides,
      };
      return handler.createThought(baseInput, 'session-123');
    };

    it('should include related modes', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.BAYESIAN);
      expect(enhancements.relatedModes).toContain(ThinkingMode.ABDUCTIVE);
    });

    it('should include mental models', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain('Dempster-Shafer Theory');
      expect(enhancements.mentalModels).toContain('Belief vs. Plausibility');
      expect(enhancements.mentalModels).toContain('Mass Function Assignment');
    });

    it('should calculate metrics', () => {
      const thought = createThought({
        frameOfDiscernment: ['H1', 'H2', 'H3'],
        hypotheses: [{ id: 'H1' }, { id: 'H2' }],
        evidence: [{ id: 'E1' }, { id: 'E2' }, { id: 'E3' }],
        beliefFunctions: [{ id: 'BF1' }],
        combinedBelief: { method: 'dempster' },
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.frameSize).toBe(3);
      expect(enhancements.metrics!.hypothesisCount).toBe(2);
      expect(enhancements.metrics!.evidenceCount).toBe(3);
      expect(enhancements.metrics!.beliefFunctionCount).toBe(1);
      expect(enhancements.metrics!.hasCombinedBelief).toBe(1);
    });

    it('should suggest defining hypotheses when empty', () => {
      const thought = createThought({
        hypotheses: [],
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('Define hypotheses'))).toBe(true);
    });

    it('should suggest collecting evidence when none present', () => {
      const thought = createThought({
        hypotheses: [{ id: 'H1' }],
        evidence: [],
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('Collect evidence'))).toBe(true);
    });

    it('should suggest assigning belief functions when evidence exists but no functions', () => {
      const thought = createThought({
        evidence: [{ id: 'E1', reliability: 0.8 }],
        beliefFunctions: [],
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('Assign belief functions'))).toBe(true);
    });

    it('should suggest combining beliefs when multiple functions exist', () => {
      const thought = createThought({
        beliefFunctions: [
          { id: 'BF1', massAssignments: [] },
          { id: 'BF2', massAssignments: [] },
        ],
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes("Dempster's rule"))).toBe(true);
    });

    it('should include guiding questions', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('evidence supports'))).toBe(true);
      expect(enhancements.guidingQuestions!.some((q) => q.includes('reliable'))).toBe(true);
      expect(enhancements.guidingQuestions!.some((q) => q.includes('uncertainty interval'))).toBe(true);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support hypothesis_definition', () => {
      expect(handler.supportsThoughtType('hypothesis_definition')).toBe(true);
    });

    it('should support evidence_collection', () => {
      expect(handler.supportsThoughtType('evidence_collection')).toBe(true);
    });

    it('should support belief_assignment', () => {
      expect(handler.supportsThoughtType('belief_assignment')).toBe(true);
    });

    it('should support evidence_combination', () => {
      expect(handler.supportsThoughtType('evidence_combination')).toBe(true);
    });

    it('should support decision_analysis', () => {
      expect(handler.supportsThoughtType('decision_analysis')).toBe(true);
    });

    it('should not support unknown types', () => {
      expect(handler.supportsThoughtType('unknown')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle medical diagnosis scenario', () => {
      const sessionId = 'medical-session';

      // Define frame and hypotheses
      const step1Input = {
        thought: 'Defining possible diagnoses',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'evidential',
        thoughtType: 'hypothesis_definition',
        frameOfDiscernment: ['Disease_A', 'Disease_B', 'Disease_C', 'Healthy'],
        hypotheses: [
          { id: 'Disease_A', name: 'Disease A', description: 'Common condition with symptom overlap' },
          { id: 'Disease_B', name: 'Disease B', description: 'Less common but serious' },
          { id: 'Disease_C', name: 'Disease C', description: 'Rare condition' },
          { id: 'Healthy', name: 'No disease', description: 'Patient is healthy' },
        ],
      } as any;

      const thought1 = handler.createThought(step1Input, sessionId);
      expect(thought1.frameOfDiscernment).toHaveLength(4);
      expect(thought1.hypotheses).toHaveLength(4);

      // Collect evidence with mass assignments
      const step2Input = {
        thought: 'Assigning belief based on lab test results',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'evidential',
        thoughtType: 'belief_assignment',
        frameOfDiscernment: ['Disease_A', 'Disease_B', 'Disease_C', 'Healthy'],
        evidence: [
          { id: 'lab_test', description: 'Blood test results', reliability: 0.85, supportsHypotheses: ['Disease_A', 'Disease_B'] },
          { id: 'imaging', description: 'X-ray results', reliability: 0.9, supportsHypotheses: ['Disease_A'] },
        ],
        beliefFunctions: [
          {
            id: 'BF_lab',
            source: 'lab_test',
            massAssignments: [
              { focalElement: ['Disease_A', 'Disease_B'], mass: 0.7 },
              { focalElement: ['Disease_A', 'Disease_B', 'Disease_C', 'Healthy'], mass: 0.3 },
            ],
          },
          {
            id: 'BF_imaging',
            source: 'imaging',
            massAssignments: [
              { focalElement: ['Disease_A'], mass: 0.6 },
              { focalElement: ['Disease_A', 'Disease_B', 'Disease_C', 'Healthy'], mass: 0.4 },
            ],
          },
        ],
      } as any;

      const thought2 = handler.createThought(step2Input, sessionId);
      const validation2 = handler.validate(step2Input);

      expect(thought2.beliefFunctions).toHaveLength(2);
      expect(validation2.valid).toBe(true);

      // Combine evidence
      const step3Input = {
        thought: "Combining evidence using Dempster's rule",
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'evidential',
        thoughtType: 'evidence_combination',
        frameOfDiscernment: ['Disease_A', 'Disease_B', 'Disease_C', 'Healthy'],
        beliefFunctions: step2Input.beliefFunctions,
        combinedBelief: {
          method: 'dempster',
          belief: {
            Disease_A: 0.58,
            Disease_B: 0.12,
            Disease_C: 0.0,
            Healthy: 0.0,
          },
          plausibility: {
            Disease_A: 0.88,
            Disease_B: 0.42,
            Disease_C: 0.30,
            Healthy: 0.30,
          },
          conflict: 0.18,
        },
      } as any;

      const thought3 = handler.createThought(step3Input, sessionId);
      const enhancements3 = handler.getEnhancements(thought3);

      expect(thought3.combinedBelief).toBeDefined();
      expect(thought3.combinedBelief.belief.Disease_A).toBe(0.58);
      expect(enhancements3.metrics!.hasCombinedBelief).toBe(1);

      // Decision analysis
      const step4Input = {
        thought: 'Making diagnostic decision based on belief intervals',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        mode: 'evidential',
        thoughtType: 'decision_analysis',
        frameOfDiscernment: ['Disease_A', 'Disease_B', 'Disease_C', 'Healthy'],
        combinedBelief: step3Input.combinedBelief,
        decisions: [
          {
            hypothesis: 'Disease_A',
            action: 'Confirm with additional test',
            justification: 'Highest belief (0.58) and plausibility (0.88)',
          },
        ],
      } as any;

      const thought4 = handler.createThought(step4Input, sessionId);

      expect(thought4.decisions).toHaveLength(1);
      expect(thought4.decisions[0].hypothesis).toBe('Disease_A');
    });

    it('should handle sensor fusion scenario', () => {
      const sessionId = 'sensor-session';

      const input = {
        thought: 'Fusing multiple sensor readings for target identification',
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'evidential',
        thoughtType: 'evidence_combination',
        frameOfDiscernment: ['Tank', 'Truck', 'Unknown'],
        evidence: [
          { id: 'radar', description: 'Radar signature', reliability: 0.75 },
          { id: 'infrared', description: 'IR signature', reliability: 0.8 },
          { id: 'visual', description: 'Visual observation', reliability: 0.6 },
        ],
        beliefFunctions: [
          {
            id: 'BF_radar',
            source: 'radar',
            massAssignments: [
              { focalElement: ['Tank'], mass: 0.5 },
              { focalElement: ['Tank', 'Truck'], mass: 0.3 },
              { focalElement: ['Tank', 'Truck', 'Unknown'], mass: 0.2 },
            ],
          },
          {
            id: 'BF_ir',
            source: 'infrared',
            massAssignments: [
              { focalElement: ['Tank'], mass: 0.6 },
              { focalElement: ['Tank', 'Truck', 'Unknown'], mass: 0.4 },
            ],
          },
          {
            id: 'BF_visual',
            source: 'visual',
            massAssignments: [
              { focalElement: ['Truck'], mass: 0.3 },
              { focalElement: ['Tank', 'Truck', 'Unknown'], mass: 0.7 },
            ],
          },
        ],
      } as any;

      const thought = handler.createThought(input, sessionId);
      const validation = handler.validate(input);
      const enhancements = handler.getEnhancements(thought);

      expect(thought.evidence).toHaveLength(3);
      expect(thought.beliefFunctions).toHaveLength(3);
      expect(validation.valid).toBe(true);
      expect(enhancements.metrics!.evidenceCount).toBe(3);
    });
  });
});
