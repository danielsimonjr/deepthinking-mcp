/**
 * Evidential Validator Tests
 * Tests for src/validation/validators/modes/evidential.ts
 *
 * Covered deeply because this validator enforces the Dempster-Shafer
 * invariants numerically: mass assignments must sum to 1 within 0.001,
 * Bel(A) <= Pl(A), and the uncertainty interval must equal [Bel, Pl]. Those
 * are multi-field arithmetic invariants, not presence checks, and every
 * cross-reference is resolved against the declared hypothesis set.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EvidentialValidator } from '../../../../../src/validation/validators/modes/evidential.js';
import { ThinkingMode } from '../../../../../src/types/core.js';
import type { EvidentialThought } from '../../../../../src/types/index.js';
import type { ValidationContext } from '../../../../../src/validation/validator.js';

describe('EvidentialValidator', () => {
  let validator: EvidentialValidator;
  let context: ValidationContext;

  const createThought = (
    overrides: Record<string, unknown> = {},
  ): EvidentialThought =>
    ({
      id: 'thought-1',
      mode: ThinkingMode.EVIDENTIAL,
      thought: 'Test thought',
      content: 'Weighing the evidence',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      ...overrides,
    }) as unknown as EvidentialThought;

  const hypotheses = [
    { id: 'h1', name: 'Hypothesis One' },
    { id: 'h2', name: 'Hypothesis Two' },
  ];

  const massFunction = (
    assignments: Array<{ hypothesisSet: string[]; mass: number }>,
    id = 'bf1',
  ) => ({ beliefFunctions: [{ id, massAssignments: assignments }] });

  const descriptions = (thought: EvidentialThought): string[] =>
    validator.validate(thought, context).map((issue) => issue.description);

  beforeEach(() => {
    validator = new EvidentialValidator();
    context = { sessionId: 'test-session', existingThoughts: new Map() };
  });

  describe('getMode', () => {
    it('identifies itself as the evidential validator', () => {
      expect(validator.getMode()).toBe('evidential');
    });
  });

  describe('minimal input', () => {
    it('reports nothing for a thought with no evidential structures', () => {
      expect(validator.validate(createThought(), context)).toEqual([]);
    });

    it('applies the shared base checks', () => {
      const thought = createThought({ thoughtNumber: 0, totalThoughts: 0 });

      expect(descriptions(thought)).toEqual(
        expect.arrayContaining([
          'Thought number must be positive',
          'Total thoughts must be positive',
        ]),
      );
    });
  });

  describe('mass assignments must sum to 1', () => {
    it('accepts masses summing to exactly 1', () => {
      const thought = createThought({
        hypotheses,
        ...massFunction([
          { hypothesisSet: ['h1'], mass: 0.6 },
          { hypothesisSet: ['h2'], mass: 0.4 },
        ]),
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('accepts a sum inside the 0.001 tolerance', () => {
      const thought = createThought({
        hypotheses,
        ...massFunction([
          { hypothesisSet: ['h1'], mass: 0.6 },
          { hypothesisSet: ['h2'], mass: 0.4005 },
        ]),
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('rejects a sum outside the tolerance and reports the actual total', () => {
      const thought = createThought({
        hypotheses,
        ...massFunction([
          { hypothesisSet: ['h1'], mass: 0.6 },
          { hypothesisSet: ['h2'], mass: 0.3 },
        ]),
      });

      const issue = validator
        .validate(thought, context)
        .find((i) => i.description.includes('must sum to 1.0'));
      expect(issue?.description).toBe(
        'Belief function "bf1" mass assignments must sum to 1.0 (current: 0.900)',
      );
      expect(issue?.severity).toBe('error');
      expect(issue?.category).toBe('mathematical');
    });

    it('rejects masses summing above 1', () => {
      const thought = createThought({
        hypotheses,
        ...massFunction([
          { hypothesisSet: ['h1'], mass: 0.8 },
          { hypothesisSet: ['h2'], mass: 0.8 },
        ]),
      });

      expect(descriptions(thought)).toContain(
        'Belief function "bf1" mass assignments must sum to 1.0 (current: 1.600)',
      );
    });

    it('tolerates floating-point drift in a sum of many small masses', () => {
      // 0.1 x 10 sums to 0.9999999999999999 in IEEE 754. The 0.001 tolerance
      // is what keeps arithmetic like this from being reported as an error.
      const thought = createThought({
        hypotheses,
        ...massFunction(
          Array.from({ length: 10 }, () => ({
            hypothesisSet: ['h1'],
            mass: 0.1,
          })),
        ),
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('reports an empty belief function, whose masses sum to 0', () => {
      const thought = createThought({ hypotheses, ...massFunction([]) });

      expect(descriptions(thought)).toContain(
        'Belief function "bf1" mass assignments must sum to 1.0 (current: 0.000)',
      );
    });

    it('checks each belief function separately', () => {
      const thought = createThought({
        hypotheses,
        beliefFunctions: [
          { id: 'good', massAssignments: [{ hypothesisSet: ['h1'], mass: 1 }] },
          { id: 'bad', massAssignments: [{ hypothesisSet: ['h2'], mass: 0.5 }] },
        ],
      });

      const sums = descriptions(thought).filter((d) =>
        d.includes('must sum to 1.0'),
      );
      expect(sums).toEqual([
        'Belief function "bad" mass assignments must sum to 1.0 (current: 0.500)',
      ]);
    });
  });

  describe('individual mass assignments', () => {
    it('rejects a mass outside 0..1', () => {
      const thought = createThought({
        hypotheses,
        ...massFunction([
          { hypothesisSet: ['h1'], mass: 1.5 },
          { hypothesisSet: ['h2'], mass: -0.5 },
        ]),
      });

      const massIssues = descriptions(thought).filter((d) =>
        d.includes('mass value that must be 0-1'),
      );
      expect(massIssues).toHaveLength(2);
    });

    it('rejects a mass assignment naming no hypotheses', () => {
      const thought = createThought({
        hypotheses,
        ...massFunction([{ hypothesisSet: [], mass: 1 }]),
      });

      expect(descriptions(thought)).toContain(
        'Mass assignment in belief function "bf1" must reference at least one hypothesis',
      );
    });
  });

  describe('belief and plausibility', () => {
    it('accepts Bel(A) below Pl(A)', () => {
      const thought = createThought({
        hypotheses,
        plausibility: {
          assignments: [{ hypothesisId: 'h1', belief: 0.3, plausibility: 0.7 }],
        },
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('accepts Bel(A) equal to Pl(A), the zero-ignorance case', () => {
      const thought = createThought({
        hypotheses,
        plausibility: {
          assignments: [{ hypothesisId: 'h1', belief: 0.5, plausibility: 0.5 }],
        },
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('rejects Bel(A) above Pl(A)', () => {
      const thought = createThought({
        hypotheses,
        plausibility: {
          assignments: [{ hypothesisId: 'h1', belief: 0.9, plausibility: 0.4 }],
        },
      });

      const issue = validator
        .validate(thought, context)
        .find((i) => i.description.includes('cannot exceed'));
      expect(issue?.description).toBe(
        'Belief 0.9 cannot exceed plausibility 0.4',
      );
      expect(issue?.category).toBe('logical');
    });

    it('accepts an uncertainty interval matching [Bel, Pl]', () => {
      const thought = createThought({
        hypotheses,
        plausibility: {
          assignments: [
            {
              hypothesisId: 'h1',
              belief: 0.3,
              plausibility: 0.7,
              uncertaintyInterval: [0.3, 0.7],
            },
          ],
        },
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('rejects an uncertainty interval that disagrees with [Bel, Pl]', () => {
      const thought = createThought({
        hypotheses,
        plausibility: {
          assignments: [
            {
              hypothesisId: 'h1',
              belief: 0.3,
              plausibility: 0.7,
              uncertaintyInterval: [0.2, 0.7],
            },
          ],
        },
      });

      expect(descriptions(thought)).toContain(
        'Uncertainty interval [0.2, 0.7] must match [belief, plausibility]',
      );
    });

    it('allows the interval to differ by less than the 0.001 tolerance', () => {
      const thought = createThought({
        hypotheses,
        plausibility: {
          assignments: [
            {
              hypothesisId: 'h1',
              belief: 0.3,
              plausibility: 0.7,
              uncertaintyInterval: [0.3005, 0.7],
            },
          ],
        },
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });
  });

  describe('cross-references against the hypothesis set', () => {
    it('rejects a hypothesis subset naming an unknown hypothesis', () => {
      const thought = createThought({
        hypotheses: [{ id: 'h1', name: 'Hypothesis One', subsets: ['ghost'] }],
      });

      expect(descriptions(thought)).toContain(
        'Hypothesis "Hypothesis One" references unknown subset: ghost',
      );
    });

    it('accepts a subset naming a declared hypothesis', () => {
      const thought = createThought({
        hypotheses: [
          { id: 'h1', name: 'Hypothesis One', subsets: ['h2'] },
          { id: 'h2', name: 'Hypothesis Two' },
        ],
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('rejects evidence supporting an unknown hypothesis', () => {
      const thought = createThought({
        hypotheses,
        evidence: [{ description: 'Witness report', supports: ['ghost'] }],
      });

      expect(descriptions(thought)).toContain(
        'Evidence "Witness report" supports unknown hypothesis: ghost',
      );
    });

    it('rejects a decision selecting an unknown hypothesis', () => {
      const thought = createThought({
        hypotheses,
        decisions: [{ name: 'Adopt plan', selectedHypothesis: ['ghost'] }],
      });

      expect(descriptions(thought)).toContain(
        'Decision "Adopt plan" selects unknown hypothesis: ghost',
      );
    });

    it('rejects every reference when no hypotheses are declared at all', () => {
      const thought = createThought({
        evidence: [{ description: 'Witness report', supports: ['h1'] }],
      });

      expect(descriptions(thought)).toContain(
        'Evidence "Witness report" supports unknown hypothesis: h1',
      );
    });
  });

  describe('evidence reliability', () => {
    it('accepts reliability inside 0..1', () => {
      const thought = createThought({
        hypotheses,
        evidence: [{ description: 'Lab result', reliability: 0.95 }],
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('rejects reliability outside 0..1', () => {
      const thought = createThought({
        hypotheses,
        evidence: [{ description: 'Lab result', reliability: 1.2 }],
      });

      expect(descriptions(thought)).toContain(
        'Evidence "Lab result" reliability must be 0-1',
      );
    });

    it('skips the reliability check when it is not stated', () => {
      const thought = createThought({
        hypotheses,
        evidence: [{ description: 'Lab result' }],
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });
  });

  describe('issue shape', () => {
    it('stamps every issue with the thought number and a suggestion', () => {
      const thought = createThought({
        thoughtNumber: 3,
        hypotheses,
        ...massFunction([{ hypothesisSet: [], mass: 2 }]),
      });

      const issues = validator.validate(thought, context);
      expect(issues.length).toBeGreaterThan(0);
      for (const issue of issues) {
        expect(issue.thoughtNumber).toBe(3);
        expect(issue.suggestion).toBeTruthy();
      }
    });
  });
});
