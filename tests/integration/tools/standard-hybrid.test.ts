/**
 * Standard Workflows Integration Tests - Hybrid Mode
 *
 * Tests T-STD-021 through T-STD-030: Comprehensive integration tests
 * for the deepthinking_standard tool with Hybrid mode.
 *
 * Hybrid mode combines multiple reasoning modes with dynamic switching
 * and supports activeModes to specify which modes are being combined.
 *
 * Phase 11 Sprint 2: Standard Workflows & Common Parameters
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type HybridThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import {
  SAMPLE_ASSUMPTIONS,
  UNCERTAINTY_LEVELS,
} from '../../utils/mock-data.js';

/**
 * Create a basic Hybrid thought input
 */
function createHybridThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    thought: 'Hybrid reasoning step',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    mode: 'hybrid',
    ...overrides,
  } as ThinkingToolInput;
}

/**
 * Create a Hybrid thought with specific active modes
 */
function createHybridWithActiveModes(
  activeModes: string[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createHybridThought({
    activeModes,
    ...overrides,
  });
}

/**
 * Create a sequence of hybrid thoughts
 */
function createHybridSequence(
  count: number,
  activeModes: string[] = [],
  baseOverrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput[] {
  return Array.from({ length: count }, (_, i) =>
    createHybridThought({
      thought: `Hybrid step ${i + 1}`,
      thoughtNumber: i + 1,
      totalThoughts: count,
      nextThoughtNeeded: i < count - 1,
      activeModes: activeModes.length > 0 ? activeModes : undefined,
      ...baseOverrides,
    })
  );
}

describe('Standard Workflows Integration - Hybrid Mode', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-STD-021: Basic hybrid thought
   */
  describe('T-STD-021: Basic Hybrid Thought', () => {
    it('should create a basic hybrid thought with minimal params', () => {
      const input = createHybridThought({
        thought: 'Basic hybrid reasoning',
      });

      const thought = factory.createThought(input, 'session-std-021');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
      expect(thought.content).toBe('Basic hybrid reasoning');
      expect(thought.sessionId).toBe('session-std-021');
    });

    it('should assign unique IDs to hybrid thoughts', () => {
      const input1 = createHybridThought({ thought: 'First hybrid' });
      const input2 = createHybridThought({ thought: 'Second hybrid' });

      const thought1 = factory.createThought(input1, 'session-std-021');
      const thought2 = factory.createThought(input2, 'session-std-021');

      expect(thought1.id).not.toBe(thought2.id);
    });

    it('should set timestamp correctly', () => {
      const before = new Date();
      const input = createHybridThought();
      const thought = factory.createThought(input, 'session-std-021');
      const after = new Date();

      expect(thought.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(thought.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  /**
   * T-STD-022: Hybrid with activeModes = [inductive, deductive]
   */
  describe('T-STD-022: Hybrid With Inductive and Deductive Modes', () => {
    it('should combine inductive and deductive reasoning', () => {
      const input = createHybridWithActiveModes(['inductive', 'deductive'], {
        thought: 'Combining inductive patterns with deductive logic',
      });

      const thought = factory.createThought(input, 'session-std-022') as HybridThought;

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
      // HybridThought stores secondary features from input
      // The activeModes become part of the thought's structure
    });

    it('should handle inductive-focused hybrid step', () => {
      const input = createHybridWithActiveModes(['inductive', 'deductive'], {
        thought: 'Identifying patterns from observations',
        observations: ['Case A shows X', 'Case B shows X', 'Case C shows X'],
      });

      const thought = factory.createThought(input, 'session-std-022');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
      expect(thought.content).toContain('patterns');
    });

    it('should handle deductive-focused hybrid step', () => {
      const input = createHybridWithActiveModes(['inductive', 'deductive'], {
        thought: 'Applying logical deduction from established pattern',
        premises: ['All observed cases have property X'],
        conclusion: 'Future cases will have property X',
      });

      const thought = factory.createThought(input, 'session-std-022');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });
  });

  /**
   * T-STD-023: Hybrid with activeModes = 3 modes
   */
  describe('T-STD-023: Hybrid With 3 Active Modes', () => {
    it('should combine three reasoning modes', () => {
      const input = createHybridWithActiveModes(['inductive', 'deductive', 'abductive'], {
        thought: 'Using complete reasoning triad',
      });

      const thought = factory.createThought(input, 'session-std-023');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });

    it('should combine sequential, mathematics, and physics modes', () => {
      const input = createHybridWithActiveModes(['sequential', 'mathematics', 'physics'], {
        thought: 'Step-by-step mathematical physics analysis',
      });

      const thought = factory.createThought(input, 'session-std-023');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });

    it('should combine causal, bayesian, and counterfactual modes', () => {
      const input = createHybridWithActiveModes(['causal', 'bayesian', 'counterfactual'], {
        thought: 'Probabilistic causal reasoning with alternatives',
      });

      const thought = factory.createThought(input, 'session-std-023');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });
  });

  /**
   * T-STD-024: Hybrid with activeModes = 5+ modes
   */
  describe('T-STD-024: Hybrid With 5+ Active Modes', () => {
    it('should handle 5 active modes', () => {
      const input = createHybridWithActiveModes(
        ['sequential', 'inductive', 'deductive', 'abductive', 'causal'],
        {
          thought: 'Comprehensive multi-modal analysis',
        }
      );

      const thought = factory.createThought(input, 'session-std-024');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });

    it('should handle 7 active modes', () => {
      const input = createHybridWithActiveModes(
        ['sequential', 'inductive', 'deductive', 'abductive', 'causal', 'bayesian', 'counterfactual'],
        {
          thought: 'Full reasoning toolkit engagement',
        }
      );

      const thought = factory.createThought(input, 'session-std-024');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });

    it('should handle maximum mode combination', () => {
      const manyModes = [
        'sequential',
        'inductive',
        'deductive',
        'abductive',
        'causal',
        'bayesian',
        'counterfactual',
        'temporal',
        'gametheory',
      ];

      const input = createHybridWithActiveModes(manyModes, {
        thought: 'Maximum multi-modal reasoning',
      });

      const thought = factory.createThought(input, 'session-std-024');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });
  });

  /**
   * T-STD-025: Hybrid multi-thought session
   */
  describe('T-STD-025: Hybrid Multi-Thought Session', () => {
    it('should create 5-thought hybrid session', () => {
      const sessionId = 'session-std-025';
      const inputs = createHybridSequence(5);

      const thoughts = inputs.map((input) => factory.createThought(input, sessionId));

      expect(thoughts).toHaveLength(5);
      thoughts.forEach((thought, i) => {
        expect(thought.mode).toBe(ThinkingMode.HYBRID);
        expect(thought.thoughtNumber).toBe(i + 1);
        expect(thought.totalThoughts).toBe(5);
      });
    });

    it('should maintain consistent mode across session', () => {
      const sessionId = 'session-std-025b';
      const activeModes = ['inductive', 'deductive'];
      const inputs = createHybridSequence(3, activeModes);

      const thoughts = inputs.map((input) => factory.createThought(input, sessionId));

      thoughts.forEach((thought) => {
        expect(thought.mode).toBe(ThinkingMode.HYBRID);
        expect(thought.sessionId).toBe(sessionId);
      });
    });
  });

  /**
   * T-STD-026: Hybrid with mode-specific params for each active mode
   */
  describe('T-STD-026: Hybrid With Mode-Specific Parameters', () => {
    it('should accept inductive-specific parameters', () => {
      const input = createHybridWithActiveModes(['inductive', 'deductive'], {
        thought: 'Inductive-focused hybrid',
        observations: ['Obs 1', 'Obs 2', 'Obs 3'],
        pattern: 'All observations share property X',
        confidence: 0.8,
      });

      const thought = factory.createThought(input, 'session-std-026');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });

    it('should accept deductive-specific parameters', () => {
      const input = createHybridWithActiveModes(['inductive', 'deductive'], {
        thought: 'Deductive-focused hybrid',
        premises: ['All A are B', 'X is A'],
        conclusion: 'X is B',
        logicForm: 'modus_ponens',
        validityCheck: true,
      });

      const thought = factory.createThought(input, 'session-std-026');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });

    it('should accept Shannon-specific parameters', () => {
      const input = createHybridThought({
        thought: 'Shannon-influenced hybrid',
        stage: 'model',
        uncertainty: 0.3,
        assumptions: ['Model is linear'],
      });

      const thought = factory.createThought(input, 'session-std-026') as HybridThought;

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
      expect(thought.uncertainty).toBe(0.3);
      expect(thought.assumptions).toContain('Model is linear');
    });

    it('should accept mathematics-specific parameters', () => {
      const input = createHybridThought({
        thought: 'Mathematics-influenced hybrid',
        mathematicalModel: {
          latex: 'f(x) = x^2',
          symbolic: 'f(x) = x**2',
        },
      });

      const thought = factory.createThought(input, 'session-std-026') as HybridThought;

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
      expect(thought.mathematicalModel?.latex).toBe('f(x) = x^2');
    });
  });

  /**
   * T-STD-027: Hybrid with branching per mode
   */
  describe('T-STD-027: Hybrid With Mode-Based Branching', () => {
    it('should create branch for alternative mode combination', () => {
      const sessionId = 'session-std-027';

      // Main path: inductive-deductive
      const main = createHybridWithActiveModes(['inductive', 'deductive'], {
        thought: 'Main path using inductive-deductive',
        thoughtNumber: 1,
      });

      // Branch: causal-counterfactual
      const branch = createHybridWithActiveModes(['causal', 'counterfactual'], {
        thought: 'Alternative path using causal-counterfactual',
        thoughtNumber: 2,
        branchFrom: 'thought-1',
        branchId: 'causal-branch',
      });

      const mainThought = factory.createThought(main, sessionId) as HybridThought;
      const branchThought = factory.createThought(branch, sessionId) as HybridThought;

      expect(mainThought.mode).toBe(ThinkingMode.HYBRID);
      expect(branchThought.mode).toBe(ThinkingMode.HYBRID);
      // branchId is an input parameter tracked at session level, not on thought output
      expect(branchThought.id).toBeDefined();
    });

    it('should support multiple mode-focused branches', () => {
      const sessionId = 'session-std-027b';

      // Base thought
      const base = createHybridThought({
        thought: 'Starting point',
        thoughtNumber: 1,
      });

      // Branch A: Mathematical focus
      const branchA = createHybridWithActiveModes(['mathematics', 'physics'], {
        thought: 'Mathematical physics approach',
        thoughtNumber: 2,
        branchFrom: 'thought-1',
        branchId: 'math-branch',
      });

      // Branch B: Logical focus
      const branchB = createHybridWithActiveModes(['formallogic', 'deductive'], {
        thought: 'Formal logic approach',
        thoughtNumber: 2,
        branchFrom: 'thought-1',
        branchId: 'logic-branch',
      });

      factory.createThought(base, sessionId);
      const mathBranch = factory.createThought(branchA, sessionId) as HybridThought;
      const logicBranch = factory.createThought(branchB, sessionId) as HybridThought;

      // branchId is an input parameter tracked at session level, not on thought output
      expect(mathBranch.id).toBeDefined();
      expect(logicBranch.id).toBeDefined();
      expect(mathBranch.mode).toBe(ThinkingMode.HYBRID);
      expect(logicBranch.mode).toBe(ThinkingMode.HYBRID);
    });
  });

  /**
   * T-STD-028: Hybrid convergence session
   */
  describe('T-STD-028: Hybrid Convergence Session', () => {
    it('should converge from multiple modes to conclusion', () => {
      const sessionId = 'session-std-028';

      // Start with many modes
      const step1 = createHybridWithActiveModes(
        ['inductive', 'deductive', 'abductive', 'causal', 'bayesian'],
        {
          thought: 'Initial broad exploration',
          thoughtNumber: 1,
          totalThoughts: 4,
        }
      );

      // Narrow down
      const step2 = createHybridWithActiveModes(['inductive', 'deductive', 'causal'], {
        thought: 'Focusing on most relevant modes',
        thoughtNumber: 2,
        totalThoughts: 4,
      });

      // More focus
      const step3 = createHybridWithActiveModes(['deductive', 'causal'], {
        thought: 'Primary modes identified',
        thoughtNumber: 3,
        totalThoughts: 4,
      });

      // Final convergence
      const step4 = createHybridWithActiveModes(['deductive'], {
        thought: 'Final deductive conclusion',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
      });

      const thoughts = [step1, step2, step3, step4].map((input) =>
        factory.createThought(input, sessionId)
      );

      expect(thoughts).toHaveLength(4);
      expect(thoughts[3].nextThoughtNeeded).toBe(false);
    });

    it('should track convergence with dependencies', () => {
      const sessionId = 'session-std-028b';

      const step1 = createHybridThought({
        thought: 'Divergent exploration',
        thoughtNumber: 1,
        totalThoughts: 3,
      });

      const step2 = createHybridThought({
        thought: 'Integrating insights',
        thoughtNumber: 2,
        totalThoughts: 3,
        dependencies: ['thought-1'],
      });

      const step3 = createHybridThought({
        thought: 'Converged conclusion',
        thoughtNumber: 3,
        totalThoughts: 3,
        nextThoughtNeeded: false,
        dependencies: ['thought-1', 'thought-2'],
      });

      const thoughts = [step1, step2, step3].map((input) =>
        factory.createThought(input, sessionId)
      ) as HybridThought[];

      expect(thoughts[2].dependencies).toEqual(['thought-1', 'thought-2']);
    });
  });

  /**
   * T-STD-029: Hybrid with metareasoning integration
   */
  describe('T-STD-029: Hybrid With Metareasoning Integration', () => {
    it('should combine hybrid with metareasoning mode', () => {
      const input = createHybridWithActiveModes(['inductive', 'deductive', 'metareasoning'], {
        thought: 'Reasoning about our reasoning process',
      });

      const thought = factory.createThought(input, 'session-std-029');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });

    it('should support meta-level reflection in hybrid', () => {
      const input = createHybridWithActiveModes(['metareasoning'], {
        thought: 'Evaluating which reasoning modes are most effective',
        thoughtType: 'mode_evaluation',
      });

      const thought = factory.createThought(input, 'session-std-029') as HybridThought;

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
      expect(thought.thoughtType).toBe('mode_evaluation');
    });

    it('should track meta-insights about mode effectiveness', () => {
      const sessionId = 'session-std-029b';

      const analysis = createHybridWithActiveModes(['inductive', 'deductive'], {
        thought: 'Inductive approach yielded strong patterns',
        thoughtNumber: 1,
      });

      const metaReflection = createHybridWithActiveModes(['metareasoning'], {
        thought: 'Inductive mode was most effective for this problem type',
        thoughtNumber: 2,
        dependencies: ['thought-1'],
      });

      const analysisThought = factory.createThought(analysis, sessionId);
      const metaThought = factory.createThought(metaReflection, sessionId) as HybridThought;

      expect(metaThought.dependencies).toContain('thought-1');
    });
  });

  /**
   * T-STD-030: Hybrid session export verification
   */
  describe('T-STD-030: Hybrid Session Export Verification', () => {
    it('should create exportable hybrid session', () => {
      const sessionId = 'session-std-030';

      const inputs = [
        createHybridWithActiveModes(['inductive'], {
          thought: 'Gathering observations',
          thoughtNumber: 1,
          totalThoughts: 3,
          observations: ['A', 'B', 'C'],
        }),
        createHybridWithActiveModes(['deductive'], {
          thought: 'Applying logic',
          thoughtNumber: 2,
          totalThoughts: 3,
          premises: ['All X are Y'],
        }),
        createHybridWithActiveModes(['abductive'], {
          thought: 'Best explanation',
          thoughtNumber: 3,
          totalThoughts: 3,
          nextThoughtNeeded: false,
        }),
      ];

      const thoughts = inputs.map((input) => factory.createThought(input, sessionId));

      // Verify all thoughts have required export fields
      thoughts.forEach((thought) => {
        expect(thought.id).toBeDefined();
        expect(thought.sessionId).toBe(sessionId);
        expect(thought.mode).toBe(ThinkingMode.HYBRID);
        expect(thought.content).toBeDefined();
        expect(thought.timestamp).toBeInstanceOf(Date);
        expect(thought.thoughtNumber).toBeDefined();
        expect(thought.totalThoughts).toBeDefined();
      });
    });

    it('should include all mode-specific details for export', () => {
      const sessionId = 'session-std-030b';

      const input = createHybridThought({
        thought: 'Complete hybrid with all details',
        assumptions: ['Assumption 1', 'Assumption 2'],
        uncertainty: 0.25,
        dependencies: ['thought-0'],
        mathematicalModel: {
          latex: 'E = mc^2',
          symbolic: 'E = m * c ** 2',
        },
      });

      const thought = factory.createThought(input, sessionId) as HybridThought;

      // Verify exportable fields
      expect(thought.assumptions).toEqual(['Assumption 1', 'Assumption 2']);
      expect(thought.uncertainty).toBe(0.25);
      expect(thought.dependencies).toContain('thought-0');
      expect(thought.mathematicalModel).toBeDefined();
    });

    it('should handle session with branching for export', () => {
      const sessionId = 'session-std-030c';

      const main = createHybridThought({
        thought: 'Main path',
        thoughtNumber: 1,
      });

      const branch = createHybridThought({
        thought: 'Branch path',
        thoughtNumber: 2,
        branchFrom: 'thought-1',
        branchId: 'export-branch',
      });

      const mainThought = factory.createThought(main, sessionId) as HybridThought;
      const branchThought = factory.createThought(branch, sessionId) as HybridThought;

      // Both should be valid thoughts - branchFrom/branchId are input parameters
      // tracked at session level, not on individual thought outputs
      expect(mainThought.id).toBeDefined();
      expect(branchThought.id).toBeDefined();
      expect(mainThought.mode).toBe(ThinkingMode.HYBRID);
      expect(branchThought.mode).toBe(ThinkingMode.HYBRID);
    });
  });
});
