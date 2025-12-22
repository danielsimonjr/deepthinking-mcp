/**
 * Probabilistic Mode Integration Tests - Dempster-Shafer Evidential Reasoning
 *
 * Tests T-PRB-016 through T-PRB-025: Comprehensive integration tests
 * for the deepthinking_probabilistic tool with Dempster-Shafer theory.
 *
 * Phase 11 Sprint 4: Temporal & Probabilistic Modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { EvidentialThought } from '../../../src/types/modes/evidential.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

// Helper to create base Evidential thought input
function createEvidentialThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    thought: 'Analyzing evidence',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    mode: 'evidential',
    ...overrides,
  } as ThinkingToolInput;
}

describe('Probabilistic Mode Integration - Dempster-Shafer Evidential', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-PRB-016: Basic evidential thought
   */
  describe('T-PRB-016: Basic Evidential Thought Creation', () => {
    it('should create a basic evidential thought with minimal params', () => {
      const input = createEvidentialThought({
        thought: 'Basic evidential reasoning step',
      });

      const thought = factory.createThought(input, 'session-016');

      expect(thought.mode).toBe(ThinkingMode.EVIDENTIAL);
      expect(thought.content).toBe('Basic evidential reasoning step');
      expect(thought.sessionId).toBe('session-016');
    });

    it('should assign unique IDs to evidential thoughts', () => {
      const input1 = createEvidentialThought({ thought: 'First thought' });
      const input2 = createEvidentialThought({ thought: 'Second thought' });

      const thought1 = factory.createThought(input1, 'session-016');
      const thought2 = factory.createThought(input2, 'session-016');

      expect(thought1.id).not.toBe(thought2.id);
    });
  });

  /**
   * T-PRB-017: Evidential with frameOfDiscernment array
   */
  describe('T-PRB-017: Frame of Discernment', () => {
    it('should correctly store frame of discernment', () => {
      const input = createEvidentialThought({
        frameOfDiscernment: ['Hypothesis A', 'Hypothesis B', 'Hypothesis C'],
      });

      const thought = factory.createThought(input, 'session-017') as EvidentialThought;

      expect(thought.frameOfDiscernment).toHaveLength(3);
      expect(thought.frameOfDiscernment).toContain('Hypothesis A');
      expect(thought.frameOfDiscernment).toContain('Hypothesis B');
      expect(thought.frameOfDiscernment).toContain('Hypothesis C');
    });

    it('should handle binary frame of discernment', () => {
      const input = createEvidentialThought({
        frameOfDiscernment: ['True', 'False'],
      });

      const thought = factory.createThought(input, 'session-017') as EvidentialThought;

      expect(thought.frameOfDiscernment).toHaveLength(2);
    });

    it('should handle larger frame of discernment', () => {
      const input = createEvidentialThought({
        frameOfDiscernment: ['A', 'B', 'C', 'D', 'E', 'F'],
      });

      const thought = factory.createThought(input, 'session-017') as EvidentialThought;

      expect(thought.frameOfDiscernment).toHaveLength(6);
    });
  });

  /**
   * T-PRB-018: Evidential with massFunction object
   */
  describe('T-PRB-018: Mass Function', () => {
    it('should correctly store mass function assignments', () => {
      const input = createEvidentialThought({
        frameOfDiscernment: ['A', 'B', 'C'],
        massFunction: {
          'A': 0.3,
          'B': 0.2,
          'A,B': 0.1,
          'A,B,C': 0.4, // Uncertainty mass assigned to full frame
        },
      });

      const thought = factory.createThought(input, 'session-018') as any;

      // The mass function should sum to 1
      expect(thought.mode).toBe(ThinkingMode.EVIDENTIAL);
    });

    it('should handle focal elements', () => {
      const input = createEvidentialThought({
        frameOfDiscernment: ['Faulty', 'Working'],
        massFunction: {
          'Faulty': 0.6,
          'Working': 0.2,
          'Faulty,Working': 0.2, // Uncertainty
        },
      });

      const thought = factory.createThought(input, 'session-018') as any;

      expect(thought.mode).toBe(ThinkingMode.EVIDENTIAL);
    });
  });

  /**
   * T-PRB-019: Evidential with beliefFunction object
   */
  describe('T-PRB-019: Belief Function', () => {
    it('should correctly store belief function values', () => {
      const input = createEvidentialThought({
        frameOfDiscernment: ['A', 'B'],
        beliefFunction: {
          'A': 0.3,      // Belief in A
          'B': 0.2,      // Belief in B
          'A,B': 0.7,    // Belief in (A or B) - includes all mass supporting A or B
        },
      });

      const thought = factory.createThought(input, 'session-019') as any;

      expect(thought.mode).toBe(ThinkingMode.EVIDENTIAL);
    });

    it('should verify belief properties', () => {
      // Bel(empty) = 0, Bel(Omega) = 1
      const input = createEvidentialThought({
        frameOfDiscernment: ['X', 'Y'],
        beliefFunction: {
          'X': 0.4,
          'Y': 0.3,
          'X,Y': 1.0, // Full frame always has belief = 1
        },
        massFunction: {
          'X': 0.4,
          'Y': 0.3,
          'X,Y': 0.3,
        },
      });

      const thought = factory.createThought(input, 'session-019') as any;

      expect(thought.mode).toBe(ThinkingMode.EVIDENTIAL);
    });
  });

  /**
   * T-PRB-020: Evidential with plausibilityFunction object
   */
  describe('T-PRB-020: Plausibility Function', () => {
    it('should correctly store plausibility function values', () => {
      const input = createEvidentialThought({
        frameOfDiscernment: ['A', 'B', 'C'],
        plausibility: {
          id: 'pl1',
          assignments: [
            {
              hypothesisSet: ['A'],
              plausibility: 0.8,
              belief: 0.3,
              uncertaintyInterval: [0.3, 0.8],
            },
            {
              hypothesisSet: ['B'],
              plausibility: 0.6,
              belief: 0.2,
              uncertaintyInterval: [0.2, 0.6],
            },
          ],
        },
      });

      const thought = factory.createThought(input, 'session-020') as EvidentialThought;

      expect(thought.plausibility).toBeDefined();
      expect(thought.plausibility!.assignments).toHaveLength(2);
      expect(thought.plausibility!.assignments[0].plausibility).toBe(0.8);
    });

    it('should verify Bel <= Pl relationship', () => {
      // For any set A: Bel(A) <= Pl(A)
      const input = createEvidentialThought({
        frameOfDiscernment: ['H1', 'H2'],
        plausibility: {
          id: 'pl-check',
          assignments: [
            {
              hypothesisSet: ['H1'],
              belief: 0.4,
              plausibility: 0.7,
              uncertaintyInterval: [0.4, 0.7],
            },
          ],
        },
      });

      const thought = factory.createThought(input, 'session-020') as EvidentialThought;

      const assignment = thought.plausibility!.assignments[0];
      expect(assignment.belief).toBeLessThanOrEqual(assignment.plausibility);
    });
  });

  /**
   * T-PRB-021: Evidential mass function normalization
   */
  describe('T-PRB-021: Mass Function Normalization', () => {
    it('should handle mass assignments that sum to 1', () => {
      const input = createEvidentialThought({
        frameOfDiscernment: ['A', 'B', 'C'],
        massFunction: {
          'A': 0.25,
          'B': 0.25,
          'C': 0.25,
          'A,B,C': 0.25, // Total = 1.0
        },
      });

      const thought = factory.createThought(input, 'session-021') as any;

      expect(thought.mode).toBe(ThinkingMode.EVIDENTIAL);
    });

    it('should support belief functions with mass assignments', () => {
      const input = createEvidentialThought({
        frameOfDiscernment: ['Guilty', 'Innocent'],
        beliefFunctions: [
          {
            id: 'bf1',
            source: 'witness1',
            massAssignments: [
              {
                hypothesisSet: ['Guilty'],
                mass: 0.6,
                justification: 'Witness testimony',
              },
              {
                hypothesisSet: ['Guilty', 'Innocent'],
                mass: 0.4,
                justification: 'Uncertainty',
              },
            ],
          },
        ],
      });

      const thought = factory.createThought(input, 'session-021') as EvidentialThought;

      expect(thought.beliefFunctions).toHaveLength(1);
      const totalMass = thought.beliefFunctions![0].massAssignments.reduce(
        (sum, ma) => sum + ma.mass,
        0
      );
      expect(totalMass).toBeCloseTo(1.0, 5);
    });
  });

  /**
   * T-PRB-022: Evidential belief-plausibility relationship
   */
  describe('T-PRB-022: Belief-Plausibility Relationship', () => {
    it('should maintain Bel(A) + Pl(~A) = 1 relationship', () => {
      // Dempster-Shafer property: Bel(A) + Pl(not A) = 1
      const input = createEvidentialThought({
        frameOfDiscernment: ['A', 'notA'],
        plausibility: {
          id: 'pl-relationship',
          assignments: [
            {
              hypothesisSet: ['A'],
              belief: 0.3,
              plausibility: 0.7,
              uncertaintyInterval: [0.3, 0.7],
            },
            {
              hypothesisSet: ['notA'],
              belief: 0.3, // Pl(A) = 1 - Bel(notA) => Bel(notA) = 1 - 0.7 = 0.3
              plausibility: 0.7, // Bel(A) = 1 - Pl(notA) => Pl(notA) = 1 - 0.3 = 0.7
              uncertaintyInterval: [0.3, 0.7],
            },
          ],
        },
      });

      const thought = factory.createThought(input, 'session-022') as EvidentialThought;

      const assignmentA = thought.plausibility!.assignments[0];
      const assignmentNotA = thought.plausibility!.assignments[1];

      // Bel(A) + Pl(notA) should equal 1
      expect(assignmentA.belief + assignmentNotA.plausibility).toBeCloseTo(1.0, 5);
    });
  });

  /**
   * T-PRB-023: Evidential Dempster combination rule
   */
  describe('T-PRB-023: Dempster Combination Rule', () => {
    it('should support combining belief functions', () => {
      const input = createEvidentialThought({
        thought: 'Combining evidence from two sources',
        frameOfDiscernment: ['A', 'B', 'C'],
        beliefFunctions: [
          {
            id: 'source1',
            source: 'sensor1',
            massAssignments: [
              { hypothesisSet: ['A'], mass: 0.4, justification: 'Sensor 1 reading' },
              { hypothesisSet: ['A', 'B'], mass: 0.3, justification: 'Uncertain A or B' },
              { hypothesisSet: ['A', 'B', 'C'], mass: 0.3, justification: 'Full uncertainty' },
            ],
          },
          {
            id: 'source2',
            source: 'sensor2',
            massAssignments: [
              { hypothesisSet: ['A'], mass: 0.5, justification: 'Sensor 2 reading' },
              { hypothesisSet: ['B'], mass: 0.2, justification: 'Some support for B' },
              { hypothesisSet: ['A', 'B', 'C'], mass: 0.3, justification: 'Full uncertainty' },
            ],
          },
        ],
        combinedBelief: {
          id: 'combined',
          source: 'combined',
          massAssignments: [
            { hypothesisSet: ['A'], mass: 0.68, justification: 'Combined result favors A' },
            { hypothesisSet: ['B'], mass: 0.06, justification: 'Small support for B' },
            { hypothesisSet: ['A', 'B'], mass: 0.12, justification: 'Some A or B' },
            { hypothesisSet: ['A', 'B', 'C'], mass: 0.14, justification: 'Remaining uncertainty' },
          ],
          conflictMass: 0.0, // No conflict in this case
        },
      });

      const thought = factory.createThought(input, 'session-023') as EvidentialThought;

      expect(thought.beliefFunctions).toHaveLength(2);
      expect(thought.combinedBelief).toBeDefined();
      expect(thought.combinedBelief!.source).toBe('combined');
    });
  });

  /**
   * T-PRB-024: Evidential multi-source evidence fusion
   */
  describe('T-PRB-024: Multi-Source Evidence Fusion', () => {
    it('should fuse evidence from multiple sources', () => {
      const sessionId = 'session-024-fusion';

      // Step 1: First source of evidence
      const step1Input = createEvidentialThought({
        thought: 'Collecting evidence from first source',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        frameOfDiscernment: ['Defective', 'Functional'],
        beliefFunctions: [
          {
            id: 'visual-inspection',
            source: 'inspector',
            massAssignments: [
              { hypothesisSet: ['Defective'], mass: 0.3, justification: 'Visual signs of damage' },
              { hypothesisSet: ['Defective', 'Functional'], mass: 0.7, justification: 'Inconclusive' },
            ],
          },
        ],
      });
      const step1 = factory.createThought(step1Input, sessionId) as EvidentialThought;

      expect(step1.beliefFunctions).toHaveLength(1);

      // Step 2: Second source of evidence
      const step2Input = createEvidentialThought({
        thought: 'Collecting evidence from second source',
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        frameOfDiscernment: ['Defective', 'Functional'],
        beliefFunctions: [
          {
            id: 'sensor-reading',
            source: 'automated-sensor',
            massAssignments: [
              { hypothesisSet: ['Defective'], mass: 0.6, justification: 'Sensor indicates anomaly' },
              { hypothesisSet: ['Defective', 'Functional'], mass: 0.4, justification: 'Sensor uncertainty' },
            ],
          },
        ],
      });
      const step2 = factory.createThought(step2Input, sessionId) as EvidentialThought;

      expect(step2.beliefFunctions).toHaveLength(1);

      // Step 3: Combine evidence
      const step3Input = createEvidentialThought({
        thought: 'Fusing all evidence sources',
        thoughtNumber: 3,
        totalThoughts: 3,
        nextThoughtNeeded: false,
        frameOfDiscernment: ['Defective', 'Functional'],
        beliefFunctions: [
          {
            id: 'visual-inspection',
            source: 'inspector',
            massAssignments: [
              { hypothesisSet: ['Defective'], mass: 0.3, justification: 'Visual signs' },
              { hypothesisSet: ['Defective', 'Functional'], mass: 0.7, justification: 'Inconclusive' },
            ],
          },
          {
            id: 'sensor-reading',
            source: 'automated-sensor',
            massAssignments: [
              { hypothesisSet: ['Defective'], mass: 0.6, justification: 'Sensor anomaly' },
              { hypothesisSet: ['Defective', 'Functional'], mass: 0.4, justification: 'Uncertainty' },
            ],
          },
        ],
        combinedBelief: {
          id: 'fused-belief',
          source: 'combined',
          massAssignments: [
            { hypothesisSet: ['Defective'], mass: 0.72, justification: 'Strong combined evidence' },
            { hypothesisSet: ['Defective', 'Functional'], mass: 0.28, justification: 'Remaining uncertainty' },
          ],
        },
        decisions: [
          {
            id: 'd1',
            name: 'Quality Decision',
            selectedHypothesis: ['Defective'],
            confidence: 0.72,
            reasoning: 'Combined evidence strongly suggests defect',
            alternatives: [
              {
                hypothesis: ['Functional'],
                expectedUtility: 0.28,
                risk: 0.72, // Risk of false negative
              },
            ],
          },
        ],
      });
      const step3 = factory.createThought(step3Input, sessionId) as EvidentialThought;

      expect(step3.combinedBelief).toBeDefined();
      expect(step3.decisions).toHaveLength(1);
      expect(step3.decisions![0].confidence).toBeGreaterThan(0.7);
    });
  });

  /**
   * T-PRB-025: Evidential with conflicting evidence
   */
  describe('T-PRB-025: Conflicting Evidence Handling', () => {
    it('should handle conflicting evidence sources', () => {
      const input = createEvidentialThought({
        thought: 'Analyzing conflicting evidence',
        frameOfDiscernment: ['A', 'B'],
        beliefFunctions: [
          {
            id: 'source1',
            source: 'expert1',
            massAssignments: [
              { hypothesisSet: ['A'], mass: 0.9, justification: 'Expert 1 strongly supports A' },
              { hypothesisSet: ['A', 'B'], mass: 0.1, justification: 'Small uncertainty' },
            ],
          },
          {
            id: 'source2',
            source: 'expert2',
            massAssignments: [
              { hypothesisSet: ['B'], mass: 0.9, justification: 'Expert 2 strongly supports B' },
              { hypothesisSet: ['A', 'B'], mass: 0.1, justification: 'Small uncertainty' },
            ],
          },
        ],
        combinedBelief: {
          id: 'conflicted-combined',
          source: 'combined',
          massAssignments: [
            { hypothesisSet: ['A'], mass: 0.45, justification: 'Normalized after conflict' },
            { hypothesisSet: ['B'], mass: 0.45, justification: 'Normalized after conflict' },
            { hypothesisSet: ['A', 'B'], mass: 0.10, justification: 'Remaining uncertainty' },
          ],
          conflictMass: 0.81, // High conflict: m1(A) * m2(B) = 0.9 * 0.9 = 0.81
        },
      });

      const thought = factory.createThought(input, 'session-025') as EvidentialThought;

      expect(thought.combinedBelief).toBeDefined();
      expect(thought.combinedBelief!.conflictMass).toBeGreaterThan(0.8);
    });

    it('should track conflict mass for decision support', () => {
      const input = createEvidentialThought({
        thought: 'High conflict scenario',
        frameOfDiscernment: ['X', 'Y', 'Z'],
        combinedBelief: {
          id: 'high-conflict',
          source: 'combined',
          massAssignments: [
            { hypothesisSet: ['X'], mass: 0.33, justification: 'After normalization' },
            { hypothesisSet: ['Y'], mass: 0.33, justification: 'After normalization' },
            { hypothesisSet: ['Z'], mass: 0.34, justification: 'After normalization' },
          ],
          conflictMass: 0.75, // Very high conflict
        },
        decisions: [
          {
            id: 'uncertain-decision',
            name: 'Uncertain Decision',
            selectedHypothesis: ['Z'],
            confidence: 0.34, // Low confidence due to conflict
            reasoning: 'High conflict between sources, decision uncertain',
            alternatives: [
              { hypothesis: ['X'], expectedUtility: 0.33, risk: 0.67 },
              { hypothesis: ['Y'], expectedUtility: 0.33, risk: 0.67 },
            ],
          },
        ],
      });

      const thought = factory.createThought(input, 'session-025') as EvidentialThought;

      // High conflict should result in low decision confidence
      expect(thought.decisions![0].confidence).toBeLessThan(0.5);
      expect(thought.combinedBelief!.conflictMass).toBeGreaterThan(0.5);
    });
  });
});
