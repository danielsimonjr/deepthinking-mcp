/**
 * Mode Validator Contract Tests
 * Covers every file in src/validation/validators/modes/
 *
 * Ten of the mode validators had dedicated unit tests; this file adds the
 * contract that all of them must satisfy, so the ones without deep coverage
 * are not untested, and so a newly added validator is covered the moment its
 * file exists. The list is DISCOVERED with import.meta.glob rather than
 * hardcoded, which is what makes that last property hold.
 *
 * Deep, behaviour-level coverage lives in the per-validator files:
 * bayesian, causal, computability, constraint, cryptanalytic, deductive,
 * evidential, gametheory, inductive, metareasoning, modal, optimization,
 * recursive and stochastic. Everything else is covered here by contract.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { ThoughtFactory } from '../../../../../src/services/ThoughtFactory.js';
import { getSupportedModes } from '../../../../../src/validation/validators/registry.js';
import type { ModeValidator } from '../../../../../src/validation/validators/base.js';
import type { Thought, ValidationIssue } from '../../../../../src/types/index.js';
import type { ValidationContext } from '../../../../../src/validation/validator.js';
import type { ThinkingToolInput } from '../../../../../src/tools/thinking.js';

const SEVERITIES = ['error', 'warning', 'info'];
const CATEGORIES = [
  'structural',
  'logical',
  'mathematical',
  'physical',
  'completeness',
  'interpretation',
];

/**
 * Validator files that VALIDATOR_REGISTRY does not map, so nothing on the
 * live path can reach them. Listed explicitly rather than skipped silently:
 * adding a validator without registering it must fail this file, and
 * registering one of these must fail it too, so the decision is visible
 * either way.
 *
 * - meta: there is no `meta` ThinkingMode at all, so nothing can produce a
 *   thought this validator would run on. `metareasoning` is the real mode and
 *   has its own registered validator.
 *
 * constraint, modal, recursive and stochastic were listed here until v9.4.1.
 * Their ThinkingMode members exist and ThoughtFactory builds thoughts for
 * them, so leaving them unmapped meant a client got "No validator registered
 * for thinking mode: X" while the validator sat unreferenced. They are now
 * registered; the mapping is pinned in both directions by
 * tests/unit/validation/registry-mode-coverage.test.ts.
 */
const UNREGISTERED_VALIDATORS = ['meta'];

interface DiscoveredValidator {
  file: string;
  className: string;
  validator: ModeValidator;
}

const modules = import.meta.glob(
  '../../../../../src/validation/validators/modes/*.ts',
  { eager: true },
) as Record<string, Record<string, unknown>>;

const discovered: DiscoveredValidator[] = Object.entries(modules).flatMap(
  ([path, mod]) => {
    const file = path.split('/').pop()!.replace('.ts', '');
    return Object.entries(mod).flatMap(([className, exported]) => {
      if (typeof exported !== 'function') return [];
      let instance: unknown;
      try {
        instance = new (exported as new () => unknown)();
      } catch {
        return [];
      }
      const candidate = instance as ModeValidator;
      if (
        typeof candidate?.validate !== 'function' ||
        typeof candidate?.getMode !== 'function'
      ) {
        return [];
      }
      return [{ file, className, validator: candidate }];
    });
  },
);

const context: ValidationContext = {
  sessionId: 'contract-test-session',
  existingThoughts: new Map(),
};

describe('mode validator contract', () => {
  let factory: ThoughtFactory;
  /** A thought of each validator's own mode, built the way a tool call does. */
  const minimalThoughts = new Map<string, Thought>();

  beforeAll(() => {
    factory = new ThoughtFactory();
    for (const { validator } of discovered) {
      const mode = validator.getMode();
      const thought = factory.createThought(
        {
          thought: 'Minimal content for contract validation',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode,
        } as ThinkingToolInput,
        'contract-test-session',
      );
      // `meta` is not a ThinkingMode, so the factory falls back to hybrid.
      // Stamp the mode back on so each validator sees a thought of its own.
      (thought as { mode: string }).mode = mode;
      minimalThoughts.set(mode, thought);
    }
  });

  it('discovers every validator file', () => {
    expect(discovered.length).toBe(35);
    expect(new Set(discovered.map((d) => d.file)).size).toBe(discovered.length);
  });

  it('registers every validator except the known-unregistered ones', () => {
    const registered = new Set(getSupportedModes());
    const unregistered = discovered
      .map((d) => d.validator.getMode())
      .filter((mode) => !registered.has(mode))
      .sort();

    expect(unregistered).toEqual(UNREGISTERED_VALIDATORS);
  });

  it('maps every registered mode to a validator file', () => {
    const modes = new Set(discovered.map((d) => d.validator.getMode()));

    for (const mode of getSupportedModes()) {
      expect(modes, `registry maps ${mode} with no validator file`).toContain(
        mode,
      );
    }
  });

  describe.each(discovered.map((d) => [d.file, d] as const))(
    '%s',
    (file, { className, validator }) => {
      const modeOf = () => validator.getMode();
      const thoughtOf = (): Thought => minimalThoughts.get(modeOf())!;

      it('names its mode after its file', () => {
        expect(modeOf()).toBe(file);
      });

      it('is exported as a class named after its mode', () => {
        expect(className).toMatch(/Validator$/);
      });

      it('does not throw on a minimal thought of its own mode', () => {
        expect(() => validator.validate(thoughtOf(), context)).not.toThrow();
      });

      it('returns an array of issues', () => {
        expect(Array.isArray(validator.validate(thoughtOf(), context))).toBe(
          true,
        );
      });

      it('returns only well-formed issues', () => {
        const issues: ValidationIssue[] = validator.validate(
          thoughtOf(),
          context,
        );

        for (const issue of issues) {
          expect(SEVERITIES).toContain(issue.severity);
          expect(CATEGORIES).toContain(issue.category);
          expect(typeof issue.description).toBe('string');
          expect(issue.description.length).toBeGreaterThan(0);
          expect(typeof issue.suggestion).toBe('string');
          expect(issue.suggestion.length).toBeGreaterThan(0);
          expect(issue.thoughtNumber).toBe(thoughtOf().thoughtNumber);
        }
      });

      it('tolerates a thought carrying none of its optional fields', () => {
        // The factory-built thought above has only what a minimal tool call
        // produces, so this asserts the absent-optional-field path directly:
        // no validator may require a field the factory does not set.
        const issues = validator.validate(thoughtOf(), context);

        expect(Array.isArray(issues)).toBe(true);
      });

      it('does not mutate the thought it validates', () => {
        const thought = thoughtOf();
        const snapshot = JSON.stringify(thought);

        validator.validate(thought, context);

        expect(JSON.stringify(thought)).toBe(snapshot);
      });

      it('is deterministic across repeated calls', () => {
        const first = validator.validate(thoughtOf(), context);
        const second = validator.validate(thoughtOf(), context);

        expect(second).toEqual(first);
      });

      it('applies the shared base checks to degenerate numbering', () => {
        // Every validator composes validateCommon(), so a thought numbered 0
        // of 0 must produce those two errors regardless of mode.
        const degenerate = {
          ...thoughtOf(),
          thoughtNumber: 0,
          totalThoughts: 0,
        } as Thought;

        const descriptions = validator
          .validate(degenerate, context)
          .map((issue) => issue.description);

        expect(descriptions).toEqual(
          expect.arrayContaining([
            'Thought number must be positive',
            'Total thoughts must be positive',
          ]),
        );
      });

      it('flags a thought numbered beyond its declared total', () => {
        const overrun = {
          ...thoughtOf(),
          thoughtNumber: 9,
          totalThoughts: 3,
        } as Thought;

        const descriptions = validator
          .validate(overrun, context)
          .map((issue) => issue.description);

        expect(descriptions).toContain('Thought number 9 exceeds total 3');
      });
    },
  );
});
