/**
 * ConstraintHandler Unit Tests - Phase 15 (v8.4.0)
 *
 * Tests for the Constraint reasoning handler:
 * - Constraint Satisfaction Problem (CSP) formulation
 * - Variable domain tracking
 * - Constraint propagation support
 * - Feasibility analysis
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConstraintHandler } from '../../../../src/modes/handlers/ConstraintHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('ConstraintHandler', () => {
  let handler: ConstraintHandler;

  beforeEach(() => {
    handler = new ConstraintHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.CONSTRAINT);
    });

    it('should have correct modeName', () => {
      expect(handler.modeName).toBe('Constraint Reasoning');
    });

    it('should have descriptive description', () => {
      expect(handler.description).toContain('Constraint');
      expect(handler.description).toContain('propagation');
      expect(handler.description).toContain('feasibility');
    });
  });

  describe('createThought', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Formulating constraint satisfaction problem',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'constraint',
    };

    it('should create thought with default thought type', () => {
      const thought = handler.createThought(baseInput, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.CONSTRAINT);
      expect(thought.thoughtType).toBe('problem_formulation');
      expect(thought.content).toBe(baseInput.thought);
    });

    it('should create thought with specified thought type', () => {
      const input = { ...baseInput, thoughtType: 'arc_consistency' } as any;
      const thought = handler.createThought(input, 'session-123');

      expect(thought.thoughtType).toBe('arc_consistency');
    });

    it('should process variables', () => {
      const input = {
        ...baseInput,
        variables: [
          { id: 'X1', name: 'Cell 1', domain: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
          { id: 'X2', name: 'Cell 2', domain: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.variables).toHaveLength(2);
      expect(thought.variables[0].domain).toHaveLength(9);
    });

    it('should process constraints', () => {
      const input = {
        ...baseInput,
        variables: [{ id: 'X1' }, { id: 'X2' }],
        constraints: [
          {
            name: 'All different',
            type: 'binary',
            variables: ['X1', 'X2'],
            expression: 'X1 != X2',
            priority: 'required',
          },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.constraints).toHaveLength(1);
      expect(thought.constraints[0].type).toBe('binary');
      expect(thought.constraints[0].priority).toBe('required');
    });

    it('should generate arcs from binary constraints', () => {
      const input = {
        ...baseInput,
        variables: [{ id: 'X1' }, { id: 'X2' }, { id: 'X3' }],
        constraints: [
          { type: 'binary', variables: ['X1', 'X2'], expression: 'X1 != X2' },
          { type: 'binary', variables: ['X2', 'X3'], expression: 'X2 != X3' },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.arcs.length).toBe(4); // 2 per binary constraint
    });

    it('should track current assignments', () => {
      const input = {
        ...baseInput,
        variables: [{ id: 'X1', domain: [1, 2, 3] }],
        currentAssignments: { X1: 2 },
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.currentAssignments).toEqual({ X1: 2 });
    });

    it('should track assignment history', () => {
      const input = {
        ...baseInput,
        assignmentHistory: [
          { variableId: 'X1', value: 1, step: 1, backtracked: false },
          { variableId: 'X1', value: 2, step: 2, backtracked: true },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.backtracks).toBe(1);
    });

    it('should determine solution status', () => {
      const input = {
        ...baseInput,
        variables: [{ id: 'X1', domain: [1] }],
        constraints: [{ variables: ['X1'], expression: 'X1 > 0', priority: 'required' }],
        currentAssignments: { X1: 1 },
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.solutionStatus).toBe('found');
    });

    it('should detect infeasibility from empty domains', () => {
      const input = {
        ...baseInput,
        variables: [{ id: 'X1', domain: [] }], // Empty domain
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.solutionStatus).toBe('infeasible');
    });
  });

  describe('validate', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Constraint reasoning',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'constraint',
    };

    it('should return valid for well-formed input', () => {
      const result = handler.validate(baseInput);
      expect(result.valid).toBe(true);
    });

    it('should fail for empty thought', () => {
      const input = { ...baseInput, thought: '' };
      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should warn for unknown thought type', () => {
      const input = { ...baseInput, thoughtType: 'invalid' } as any;
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'thoughtType')).toBe(true);
    });

    it('should warn about empty variable domains', () => {
      const input = {
        ...baseInput,
        variables: [{ id: 'X1', name: 'X1', domain: [] }],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('empty domain'))).toBe(true);
    });

    it('should warn about constraints referencing unknown variables', () => {
      const input = {
        ...baseInput,
        variables: [{ id: 'X1' }],
        constraints: [{ variables: ['X1', 'X2'] }], // X2 not defined
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('unknown variable'))).toBe(true);
    });

    it('should warn about unknown constraint type', () => {
      const input = {
        ...baseInput,
        constraints: [{ type: 'invalid_type', variables: [] }],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('Unknown constraint type'))).toBe(true);
    });

    it('should warn about unknown priority', () => {
      const input = {
        ...baseInput,
        constraints: [{ priority: 'invalid_priority', variables: [] }],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('Unknown priority'))).toBe(true);
    });

    it('should warn about constraints without expressions', () => {
      const input = {
        ...baseInput,
        constraints: [{ variables: ['X1'], type: 'unary' }], // No expression
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('lacks expression'))).toBe(true);
    });

    it('should warn about assignments outside domain', () => {
      const input = {
        ...baseInput,
        variables: [{ id: 'X1', domain: [1, 2, 3] }],
        currentAssignments: { X1: 5 }, // 5 not in domain
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('not in domain'))).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    const createThought = (overrides: any = {}) => {
      const baseInput: ThinkingToolInput = {
        thought: 'Constraint reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'constraint',
        ...overrides,
      };
      return handler.createThought(baseInput, 'session-123');
    };

    it('should include related modes', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.OPTIMIZATION);
      expect(enhancements.relatedModes).toContain(ThinkingMode.ALGORITHMIC);
      expect(enhancements.relatedModes).toContain(ThinkingMode.FORMALLOGIC);
    });

    it('should include mental models', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain('Constraint Propagation');
      expect(enhancements.mentalModels).toContain('Arc Consistency');
      expect(enhancements.mentalModels).toContain('Backtracking Search');
    });

    it('should calculate metrics', () => {
      const thought = createThought({
        variables: [{ id: 'X1', domain: [1, 2, 3] }, { id: 'X2', domain: [1, 2, 3] }],
        constraints: [{ type: 'binary', variables: ['X1', 'X2'] }],
        currentAssignments: { X1: 1 },
        backtracks: 3,
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.variableCount).toBe(2);
      expect(enhancements.metrics!.constraintCount).toBe(1);
      expect(enhancements.metrics!.assignedCount).toBe(1);
      expect(enhancements.metrics!.backtrackCount).toBe(3);
    });

    it('should provide problem formulation guidance', () => {
      const thought = createThought({ thoughtType: 'problem_formulation' });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('decision variables'))).toBe(true);
    });

    it('should provide variable definition guidance with domain sizes', () => {
      const thought = createThought({
        thoughtType: 'variable_definition',
        variables: [
          { id: 'X1', domain: [1, 2, 3, 4, 5] },
          { id: 'X2', domain: [1, 2, 3] },
        ],
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('Average domain size'))).toBe(true);
    });

    it('should provide backtracking guidance', () => {
      const thought = createThought({
        thoughtType: 'backtracking',
        backtracks: 5,
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('fail'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('Backtracks so far: 5'))).toBe(true);
    });

    it('should warn about empty domains', () => {
      const thought = createThought({
        variables: [{ id: 'X1', domain: [] }],
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some((w) => w.includes('empty domains'))).toBe(true);
    });

    it('should warn about high backtrack rate', () => {
      const thought = createThought({
        variables: [{ id: 'X1', domain: [1, 2] }],
        searchStep: 10,
        backtracks: 8, // 80% backtrack rate
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some((w) => w.includes('High backtrack rate'))).toBe(true);
    });

    it('should add search heuristics for solution search', () => {
      const thought = createThought({ thoughtType: 'solution_search' });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain('MRV (Minimum Remaining Values)');
      expect(enhancements.mentalModels).toContain('LCV (Least Constraining Value)');
    });
  });

  describe('supportsThoughtType', () => {
    it('should support problem_formulation', () => {
      expect(handler.supportsThoughtType('problem_formulation')).toBe(true);
    });

    it('should support variable_definition', () => {
      expect(handler.supportsThoughtType('variable_definition')).toBe(true);
    });

    it('should support constraint_definition', () => {
      expect(handler.supportsThoughtType('constraint_definition')).toBe(true);
    });

    it('should support domain_reduction', () => {
      expect(handler.supportsThoughtType('domain_reduction')).toBe(true);
    });

    it('should support arc_consistency', () => {
      expect(handler.supportsThoughtType('arc_consistency')).toBe(true);
    });

    it('should support propagation', () => {
      expect(handler.supportsThoughtType('propagation')).toBe(true);
    });

    it('should support solution_search', () => {
      expect(handler.supportsThoughtType('solution_search')).toBe(true);
    });

    it('should support backtracking', () => {
      expect(handler.supportsThoughtType('backtracking')).toBe(true);
    });

    it('should support feasibility_check', () => {
      expect(handler.supportsThoughtType('feasibility_check')).toBe(true);
    });

    it('should not support unknown types', () => {
      expect(handler.supportsThoughtType('unknown')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle 4-queens problem', () => {
      const sessionId = 'queens-session';

      const input = {
        thought: 'Solving 4-queens placement problem',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'constraint',
        thoughtType: 'problem_formulation',
        variables: [
          { id: 'Q1', name: 'Queen 1 row', domain: [1, 2, 3, 4] },
          { id: 'Q2', name: 'Queen 2 row', domain: [1, 2, 3, 4] },
          { id: 'Q3', name: 'Queen 3 row', domain: [1, 2, 3, 4] },
          { id: 'Q4', name: 'Queen 4 row', domain: [1, 2, 3, 4] },
        ],
        constraints: [
          // All different rows
          { type: 'binary', variables: ['Q1', 'Q2'], expression: 'Q1 != Q2', priority: 'required' },
          { type: 'binary', variables: ['Q1', 'Q3'], expression: 'Q1 != Q3', priority: 'required' },
          { type: 'binary', variables: ['Q1', 'Q4'], expression: 'Q1 != Q4', priority: 'required' },
          { type: 'binary', variables: ['Q2', 'Q3'], expression: 'Q2 != Q3', priority: 'required' },
          { type: 'binary', variables: ['Q2', 'Q4'], expression: 'Q2 != Q4', priority: 'required' },
          { type: 'binary', variables: ['Q3', 'Q4'], expression: 'Q3 != Q4', priority: 'required' },
          // Diagonal constraints (simplified)
          { type: 'binary', variables: ['Q1', 'Q2'], expression: '|Q1-Q2| != 1', priority: 'required' },
        ],
      } as any;

      const thought = handler.createThought(input, sessionId);
      const validation = handler.validate(input);
      const enhancements = handler.getEnhancements(thought);

      expect(thought.variables).toHaveLength(4);
      expect(thought.constraints).toHaveLength(7);
      expect(validation.valid).toBe(true);
      expect(enhancements.metrics!.variableCount).toBe(4);
    });

    it('should handle graph coloring with solution', () => {
      const sessionId = 'coloring-session';

      const input = {
        thought: 'Graph coloring with 3 colors - found solution',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        mode: 'constraint',
        thoughtType: 'solution_search',
        variables: [
          { id: 'V1', domain: ['R', 'G', 'B'] },
          { id: 'V2', domain: ['R', 'G', 'B'] },
          { id: 'V3', domain: ['R', 'G', 'B'] },
        ],
        constraints: [
          { type: 'binary', variables: ['V1', 'V2'], expression: 'V1 != V2', priority: 'required', satisfied: true },
          { type: 'binary', variables: ['V2', 'V3'], expression: 'V2 != V3', priority: 'required', satisfied: true },
          { type: 'binary', variables: ['V1', 'V3'], expression: 'V1 != V3', priority: 'required', satisfied: true },
        ],
        currentAssignments: { V1: 'R', V2: 'G', V3: 'B' },
        solutionStatus: 'found',
        solutionCount: 1,
      } as any;

      const thought = handler.createThought(input, sessionId);
      const enhancements = handler.getEnhancements(thought);

      expect(thought.solutionStatus).toBe('found');
      expect(enhancements.metrics!.assignedCount).toBe(3);
      expect(enhancements.suggestions!.some((s) => s.includes('Status: found'))).toBe(true);
    });
  });
});
