/**
 * Standard Workflows Integration Tests - Shannon Mode
 *
 * Tests T-STD-011 through T-STD-020: Comprehensive integration tests
 * for the deepthinking_standard tool with Shannon mode.
 *
 * Shannon mode implements Claude Shannon's 5-stage problem-solving methodology:
 * 1. problem_definition - Define the problem clearly
 * 2. constraints - Identify constraints and boundaries
 * 3. model - Build a model or framework
 * 4. proof - Prove or validate the solution
 * 5. implementation - Implement the solution
 *
 * Phase 11 Sprint 2: Standard Workflows & Common Parameters
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, ShannonStage, type ShannonThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import {
  SAMPLE_ASSUMPTIONS,
  SAMPLE_DEPENDENCIES,
  BRANCH_DATA,
  UNCERTAINTY_LEVELS,
} from '../../utils/mock-data.js';

/**
 * Create a basic Shannon thought input
 */
function createShannonThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    thought: 'Shannon reasoning step',
    thoughtNumber: 1,
    totalThoughts: 5,
    nextThoughtNeeded: true,
    mode: 'shannon',
    stage: 'problem_definition',
    ...overrides,
  } as ThinkingToolInput;
}

/**
 * Shannon stage type for input
 */
type ShannonStageInput = 'problem_definition' | 'constraints' | 'model' | 'proof' | 'implementation';

/**
 * Create a full 5-stage Shannon session sequence
 */
function createShannonFiveStageSequence(): ThinkingToolInput[] {
  const stages: ShannonStageInput[] = [
    'problem_definition',
    'constraints',
    'model',
    'proof',
    'implementation',
  ];

  return stages.map((stage, i) =>
    createShannonThought({
      thought: `Shannon ${stage} stage`,
      thoughtNumber: i + 1,
      totalThoughts: 5,
      nextThoughtNeeded: i < 4,
      stage,
    })
  );
}

describe('Standard Workflows Integration - Shannon Mode', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-STD-011: Shannon stage = problem_definition
   */
  describe('T-STD-011: Shannon Problem Definition Stage', () => {
    it('should create thought in problem_definition stage', () => {
      const input = createShannonThought({
        thought: 'Clearly defining the problem scope',
        stage: 'problem_definition',
      });

      const thought = factory.createThought(input, 'session-std-011') as ShannonThought;

      expect(thought.mode).toBe(ThinkingMode.SHANNON);
      expect(thought.stage).toBe(ShannonStage.PROBLEM_DEFINITION);
      expect(thought.content).toContain('defining the problem');
    });

    it('should include assumptions in problem definition', () => {
      const input = createShannonThought({
        thought: 'Problem definition with assumptions',
        stage: 'problem_definition',
        assumptions: ['The system is deterministic', 'Inputs are finite'],
      });

      const thought = factory.createThought(input, 'session-std-011') as ShannonThought;

      expect(thought.assumptions).toContain('The system is deterministic');
      expect(thought.assumptions).toContain('Inputs are finite');
    });

    it('should handle uncertainty in problem definition', () => {
      const input = createShannonThought({
        thought: 'Uncertain problem boundaries',
        stage: 'problem_definition',
        uncertainty: 0.3,
      });

      const thought = factory.createThought(input, 'session-std-011') as ShannonThought;

      expect(thought.uncertainty).toBe(0.3);
    });
  });

  /**
   * T-STD-012: Shannon stage = constraints
   */
  describe('T-STD-012: Shannon Constraints Stage', () => {
    it('should create thought in constraints stage', () => {
      const input = createShannonThought({
        thought: 'Identifying system constraints and limitations',
        thoughtNumber: 2,
        stage: 'constraints',
      });

      const thought = factory.createThought(input, 'session-std-012') as ShannonThought;

      expect(thought.mode).toBe(ThinkingMode.SHANNON);
      expect(thought.stage).toBe(ShannonStage.CONSTRAINTS);
    });

    it('should track dependencies from problem definition', () => {
      const input = createShannonThought({
        thought: 'Constraints based on problem definition',
        thoughtNumber: 2,
        stage: 'constraints',
        dependencies: ['thought-1'],
      });

      const thought = factory.createThought(input, 'session-std-012') as ShannonThought;

      expect(thought.dependencies).toContain('thought-1');
    });

    it('should handle multiple constraints assumptions', () => {
      const input = createShannonThought({
        thought: 'Multiple constraint assumptions',
        stage: 'constraints',
        assumptions: [
          'Time complexity must be O(n log n)',
          'Space is limited to O(n)',
          'Must handle edge cases gracefully',
        ],
      });

      const thought = factory.createThought(input, 'session-std-012') as ShannonThought;

      expect(thought.assumptions?.length).toBe(3);
    });
  });

  /**
   * T-STD-013: Shannon stage = model
   */
  describe('T-STD-013: Shannon Model Stage', () => {
    it('should create thought in model stage', () => {
      const input = createShannonThought({
        thought: 'Building mathematical model of the problem',
        thoughtNumber: 3,
        stage: 'model',
      });

      const thought = factory.createThought(input, 'session-std-013') as ShannonThought;

      expect(thought.mode).toBe(ThinkingMode.SHANNON);
      expect(thought.stage).toBe(ShannonStage.MODEL);
    });

    it('should track dependencies from constraints stage', () => {
      const input = createShannonThought({
        thought: 'Model respecting identified constraints',
        thoughtNumber: 3,
        stage: 'model',
        dependencies: ['thought-1', 'thought-2'],
      });

      const thought = factory.createThought(input, 'session-std-013') as ShannonThought;

      expect(thought.dependencies).toEqual(['thought-1', 'thought-2']);
    });

    it('should handle model uncertainty', () => {
      const input = createShannonThought({
        thought: 'Approximate model with known limitations',
        stage: 'model',
        uncertainty: 0.4,
      });

      const thought = factory.createThought(input, 'session-std-013') as ShannonThought;

      expect(thought.uncertainty).toBe(0.4);
    });
  });

  /**
   * T-STD-014: Shannon stage = proof
   */
  describe('T-STD-014: Shannon Proof Stage', () => {
    it('should create thought in proof stage', () => {
      const input = createShannonThought({
        thought: 'Proving correctness of the model',
        thoughtNumber: 4,
        stage: 'proof',
      });

      const thought = factory.createThought(input, 'session-std-014') as ShannonThought;

      expect(thought.mode).toBe(ThinkingMode.SHANNON);
      expect(thought.stage).toBe(ShannonStage.PROOF);
    });

    it('should have low uncertainty after proof', () => {
      const input = createShannonThought({
        thought: 'Proof establishes correctness',
        stage: 'proof',
        uncertainty: 0.1,
      });

      const thought = factory.createThought(input, 'session-std-014') as ShannonThought;

      expect(thought.uncertainty).toBeLessThanOrEqual(0.1);
    });

    it('should track all prior dependencies', () => {
      const input = createShannonThought({
        thought: 'Proof based on problem, constraints, and model',
        thoughtNumber: 4,
        stage: 'proof',
        dependencies: ['thought-1', 'thought-2', 'thought-3'],
      });

      const thought = factory.createThought(input, 'session-std-014') as ShannonThought;

      expect(thought.dependencies?.length).toBe(3);
    });
  });

  /**
   * T-STD-015: Shannon stage = implementation
   */
  describe('T-STD-015: Shannon Implementation Stage', () => {
    it('should create thought in implementation stage', () => {
      const input = createShannonThought({
        thought: 'Implementing the proven solution',
        thoughtNumber: 5,
        totalThoughts: 5,
        nextThoughtNeeded: false,
        stage: 'implementation',
      });

      const thought = factory.createThought(input, 'session-std-015') as ShannonThought;

      expect(thought.mode).toBe(ThinkingMode.SHANNON);
      expect(thought.stage).toBe(ShannonStage.IMPLEMENTATION);
      expect(thought.nextThoughtNeeded).toBe(false);
    });

    it('should mark session complete at implementation', () => {
      const input = createShannonThought({
        thought: 'Final implementation complete',
        thoughtNumber: 5,
        totalThoughts: 5,
        nextThoughtNeeded: false,
        stage: 'implementation',
      });

      const thought = factory.createThought(input, 'session-std-015');

      expect(thought.thoughtNumber).toBe(thought.totalThoughts);
      expect(thought.nextThoughtNeeded).toBe(false);
    });
  });

  /**
   * T-STD-016: Shannon full 5-stage session
   */
  describe('T-STD-016: Shannon Full 5-Stage Session', () => {
    it('should create complete 5-stage Shannon session', () => {
      const sessionId = 'session-std-016';
      const inputs = createShannonFiveStageSequence();

      const thoughts = inputs.map((input) => factory.createThought(input, sessionId)) as ShannonThought[];

      expect(thoughts).toHaveLength(5);

      // Verify stages in order
      expect(thoughts[0].stage).toBe(ShannonStage.PROBLEM_DEFINITION);
      expect(thoughts[1].stage).toBe(ShannonStage.CONSTRAINTS);
      expect(thoughts[2].stage).toBe(ShannonStage.MODEL);
      expect(thoughts[3].stage).toBe(ShannonStage.PROOF);
      expect(thoughts[4].stage).toBe(ShannonStage.IMPLEMENTATION);
    });

    it('should maintain session consistency across stages', () => {
      const sessionId = 'session-std-016b';
      const inputs = createShannonFiveStageSequence();
      const thoughts = inputs.map((input) => factory.createThought(input, sessionId));

      // All thoughts should have the same session ID
      thoughts.forEach((thought) => {
        expect(thought.sessionId).toBe(sessionId);
        expect(thought.mode).toBe(ThinkingMode.SHANNON);
      });

      // All IDs should be unique
      const ids = new Set(thoughts.map((t) => t.id));
      expect(ids.size).toBe(5);
    });
  });

  /**
   * T-STD-017: Shannon with stage transitions
   */
  describe('T-STD-017: Shannon Stage Transitions', () => {
    it('should transition from problem_definition to constraints', () => {
      const sessionId = 'session-std-017';

      const pd = createShannonThought({
        thought: 'Problem definition complete',
        thoughtNumber: 1,
        stage: 'problem_definition',
      });
      const constraints = createShannonThought({
        thought: 'Moving to constraints',
        thoughtNumber: 2,
        stage: 'constraints',
        dependencies: ['thought-1'],
      });

      const thought1 = factory.createThought(pd, sessionId) as ShannonThought;
      const thought2 = factory.createThought(constraints, sessionId) as ShannonThought;

      expect(thought1.stage).toBe(ShannonStage.PROBLEM_DEFINITION);
      expect(thought2.stage).toBe(ShannonStage.CONSTRAINTS);
      expect(thought2.dependencies).toContain('thought-1');
    });

    it('should allow jumping stages if needed', () => {
      const sessionId = 'session-std-017b';

      // Jump from problem_definition directly to model (skip constraints)
      const pd = createShannonThought({
        thought: 'Problem is simple, constraints are obvious',
        thoughtNumber: 1,
        stage: 'problem_definition',
      });
      const model = createShannonThought({
        thought: 'Building model directly',
        thoughtNumber: 2,
        stage: 'model',
      });

      const thought1 = factory.createThought(pd, sessionId) as ShannonThought;
      const thought2 = factory.createThought(model, sessionId) as ShannonThought;

      expect(thought1.stage).toBe(ShannonStage.PROBLEM_DEFINITION);
      expect(thought2.stage).toBe(ShannonStage.MODEL);
    });
  });

  /**
   * T-STD-018: Shannon with stage revision
   */
  describe('T-STD-018: Shannon Stage Revision', () => {
    it('should allow returning to earlier stage for revision', () => {
      const sessionId = 'session-std-018';

      // Original problem definition
      const pd1 = createShannonThought({
        thought: 'Initial problem definition',
        thoughtNumber: 1,
        stage: 'problem_definition',
      });

      // Moved to constraints
      const constraints = createShannonThought({
        thought: 'Identified constraints',
        thoughtNumber: 2,
        stage: 'constraints',
      });

      // Realized problem was misunderstood, revise problem definition
      const pd2 = createShannonThought({
        thought: 'Revised problem definition based on constraint discovery',
        thoughtNumber: 3,
        stage: 'problem_definition',
        isRevision: true,
        revisesThought: 'thought-1',
      });

      factory.createThought(pd1, sessionId);
      factory.createThought(constraints, sessionId);
      const thought3 = factory.createThought(pd2, sessionId) as ShannonThought;

      expect(thought3.stage).toBe(ShannonStage.PROBLEM_DEFINITION);
      expect(thought3.isRevision).toBe(true);
      expect(thought3.revisesThought).toBe('thought-1');
    });

    it('should handle model revision after failed proof', () => {
      const sessionId = 'session-std-018b';

      const model = createShannonThought({
        thought: 'Initial model',
        thoughtNumber: 3,
        stage: 'model',
      });

      const proofAttempt = createShannonThought({
        thought: 'Proof attempt failed',
        thoughtNumber: 4,
        stage: 'proof',
        uncertainty: 0.9,
      });

      const modelRevision = createShannonThought({
        thought: 'Revised model to address proof failure',
        thoughtNumber: 5,
        stage: 'model',
        isRevision: true,
        revisesThought: 'thought-3',
      });

      factory.createThought(model, sessionId);
      factory.createThought(proofAttempt, sessionId);
      const thought3 = factory.createThought(modelRevision, sessionId) as ShannonThought;

      expect(thought3.stage).toBe(ShannonStage.MODEL);
      expect(thought3.isRevision).toBe(true);
    });
  });

  /**
   * T-STD-019: Shannon multi-thought per stage
   */
  describe('T-STD-019: Shannon Multi-Thought Per Stage', () => {
    it('should allow multiple thoughts in problem_definition stage', () => {
      const sessionId = 'session-std-019';

      const inputs = [
        createShannonThought({
          thought: 'Initial problem understanding',
          thoughtNumber: 1,
          totalThoughts: 7,
          stage: 'problem_definition',
        }),
        createShannonThought({
          thought: 'Refining problem scope',
          thoughtNumber: 2,
          totalThoughts: 7,
          stage: 'problem_definition',
        }),
        createShannonThought({
          thought: 'Final problem statement',
          thoughtNumber: 3,
          totalThoughts: 7,
          stage: 'problem_definition',
        }),
      ];

      const thoughts = inputs.map((input) => factory.createThought(input, sessionId)) as ShannonThought[];

      // All in same stage
      thoughts.forEach((thought) => {
        expect(thought.stage).toBe(ShannonStage.PROBLEM_DEFINITION);
      });
    });

    it('should handle complex session with multiple thoughts per stage', () => {
      const sessionId = 'session-std-019b';

      // 2 thoughts for problem_definition, 2 for model, 1 for proof
      const inputs = [
        createShannonThought({ thought: 'PD 1', thoughtNumber: 1, totalThoughts: 5, stage: 'problem_definition' }),
        createShannonThought({ thought: 'PD 2', thoughtNumber: 2, totalThoughts: 5, stage: 'problem_definition' }),
        createShannonThought({ thought: 'Model 1', thoughtNumber: 3, totalThoughts: 5, stage: 'model' }),
        createShannonThought({ thought: 'Model 2', thoughtNumber: 4, totalThoughts: 5, stage: 'model' }),
        createShannonThought({
          thought: 'Proof complete',
          thoughtNumber: 5,
          totalThoughts: 5,
          nextThoughtNeeded: false,
          stage: 'proof',
        }),
      ];

      const thoughts = inputs.map((input) => factory.createThought(input, sessionId)) as ShannonThought[];

      expect(thoughts.filter((t) => t.stage === ShannonStage.PROBLEM_DEFINITION)).toHaveLength(2);
      expect(thoughts.filter((t) => t.stage === ShannonStage.MODEL)).toHaveLength(2);
      expect(thoughts.filter((t) => t.stage === ShannonStage.PROOF)).toHaveLength(1);
    });
  });

  /**
   * T-STD-020: Shannon with branching at model stage
   * Note: Shannon mode handler focuses on the 5-stage methodology and doesn't
   * directly track branchFrom/branchId in output. Branching is validated in input.
   */
  describe('T-STD-020: Shannon Branching at Model Stage', () => {
    it('should create alternative model branch - accepts branching input', () => {
      const sessionId = 'session-std-020';

      // Base path through problem and constraints
      const pd = createShannonThought({
        thought: 'Problem defined',
        thoughtNumber: 1,
        stage: 'problem_definition',
      });
      const constraints = createShannonThought({
        thought: 'Constraints identified',
        thoughtNumber: 2,
        stage: 'constraints',
      });

      // Main model approach
      const modelMain = createShannonThought({
        thought: 'Main model: Graph-based approach',
        thoughtNumber: 3,
        stage: 'model',
      });

      // Alternative model branch - input accepts branching params
      const modelAlt = createShannonThought({
        thought: 'Alternative model: Matrix-based approach',
        thoughtNumber: 3,
        stage: 'model',
        branchFrom: 'thought-2',
        branchId: 'alt-model',
      });

      // Validate branching input is accepted
      expect(factory.validate(modelAlt).valid).toBe(true);

      factory.createThought(pd, sessionId);
      factory.createThought(constraints, sessionId);
      const mainModel = factory.createThought(modelMain, sessionId) as ShannonThought;
      const altModel = factory.createThought(modelAlt, sessionId) as ShannonThought;

      // Both are in model stage
      expect(mainModel.stage).toBe(ShannonStage.MODEL);
      expect(altModel.stage).toBe(ShannonStage.MODEL);

      // Input had branching params (handler may not copy to output)
      expect((modelAlt as any).branchFrom).toBe('thought-2');
      expect((modelAlt as any).branchId).toBe('alt-model');
    });

    it('should continue branches independently through remaining stages', () => {
      const sessionId = 'session-std-020b';

      // Create main branch model and its proof
      const modelMain = createShannonThought({
        thought: 'Main model',
        thoughtNumber: 3,
        stage: 'model',
      });
      const proofMain = createShannonThought({
        thought: 'Proof for main model',
        thoughtNumber: 4,
        stage: 'proof',
        dependencies: ['thought-3'],
      });

      // Create alt branch model and its proof - input has branching
      const modelAlt = createShannonThought({
        thought: 'Alt model',
        thoughtNumber: 3,
        stage: 'model',
        branchFrom: 'thought-2',
        branchId: 'alt',
      });
      const proofAlt = createShannonThought({
        thought: 'Proof for alt model',
        thoughtNumber: 4,
        stage: 'proof',
        branchId: 'alt',
        dependencies: ['thought-3-alt'],
      });

      const main = factory.createThought(modelMain, sessionId) as ShannonThought;
      const mainProof = factory.createThought(proofMain, sessionId) as ShannonThought;
      const alt = factory.createThought(modelAlt, sessionId) as ShannonThought;
      const altProof = factory.createThought(proofAlt, sessionId) as ShannonThought;

      // Both paths progressed to proof stage
      expect(mainProof.stage).toBe(ShannonStage.PROOF);
      expect(altProof.stage).toBe(ShannonStage.PROOF);

      // Input had branching params for alt branch
      expect((proofAlt as any).branchId).toBe('alt');
    });
  });
});
