/**
 * Bayesian Validator Tests
 * Tests for src/validation/validators/modes/bayesian.ts
 *
 * Covered deeply because it range-checks four separate probability fields
 * through three different code paths (a shared helper for prior and
 * posterior, hand-written comparisons for likelihood and per-evidence
 * likelihoods) and interprets the Bayes factor against the threshold 1.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BayesianValidator } from '../../../../../src/validation/validators/modes/bayesian.js';
import { ThinkingMode } from '../../../../../src/types/core.js';
import type { BayesianThought } from '../../../../../src/types/index.js';
import type { ValidationContext } from '../../../../../src/validation/validator.js';

describe('BayesianValidator', () => {
  let validator: BayesianValidator;
  let context: ValidationContext;

  const createThought = (
    overrides: Record<string, unknown> = {},
  ): BayesianThought =>
    ({
      id: 'thought-1',
      mode: ThinkingMode.BAYESIAN,
      thought: 'Test thought',
      content: 'Updating on the evidence',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      ...overrides,
    }) as unknown as BayesianThought;

  const descriptions = (thought: BayesianThought): string[] =>
    validator.validate(thought, context).map((issue) => issue.description);

  beforeEach(() => {
    validator = new BayesianValidator();
    context = { sessionId: 'test-session', existingThoughts: new Map() };
  });

  describe('getMode', () => {
    it('identifies itself as the bayesian validator', () => {
      expect(validator.getMode()).toBe('bayesian');
    });
  });

  describe('minimal input', () => {
    it('reports nothing for a thought with no probabilities', () => {
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

  describe('prior probability', () => {
    it('accepts a prior inside 0..1', () => {
      const thought = createThought({ prior: { probability: 0.25 } });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('accepts the exact bounds', () => {
      for (const probability of [0, 1]) {
        expect(
          validator.validate(createThought({ prior: { probability } }), context),
          `prior ${probability}`,
        ).toEqual([]);
      }
    });

    it('rejects a prior above 1', () => {
      const issue = validator
        .validate(createThought({ prior: { probability: 1.5 } }), context)
        .find((i) => i.description.includes('Prior'));

      expect(issue?.description).toBe(
        'Prior probability must be between 0 and 1',
      );
      expect(issue?.severity).toBe('error');
      expect(issue?.category).toBe('mathematical');
    });

    it('rejects a negative prior', () => {
      expect(
        descriptions(createThought({ prior: { probability: -0.1 } })),
      ).toContain('Prior probability must be between 0 and 1');
    });
  });

  describe('likelihood', () => {
    it('accepts a likelihood inside 0..1', () => {
      const thought = createThought({ likelihood: { probability: 0.8 } });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('rejects a likelihood outside 0..1 as a structural error', () => {
      // The likelihood check is hand-written rather than routed through the
      // shared helper, so its category differs from the prior's.
      const issue = validator
        .validate(createThought({ likelihood: { probability: 2 } }), context)
        .find((i) => i.description.includes('Likelihood'));

      expect(issue?.description).toBe(
        'Likelihood probability must be between 0 and 1',
      );
      expect(issue?.category).toBe('structural');
    });
  });

  describe('posterior probability', () => {
    it('accepts a posterior with its calculation shown', () => {
      const thought = createThought({
        posterior: { probability: 0.7, calculation: 'P(H|E) = 0.8*0.25/0.29' },
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('warns when the posterior carries no calculation', () => {
      const issue = validator
        .validate(createThought({ posterior: { probability: 0.7 } }), context)
        .find((i) => i.description.includes('calculation'));

      expect(issue?.description).toBe('Posterior calculation should be shown');
      expect(issue?.severity).toBe('warning');
    });

    it('warns when the calculation is only whitespace', () => {
      const thought = createThought({
        posterior: { probability: 0.7, calculation: '   ' },
      });

      expect(descriptions(thought)).toContain(
        'Posterior calculation should be shown',
      );
    });

    it('rejects a posterior outside 0..1 and still asks for the calculation', () => {
      const thought = createThought({ posterior: { probability: 3 } });

      expect(descriptions(thought)).toEqual(
        expect.arrayContaining([
          'Posterior probability must be between 0 and 1',
          'Posterior calculation should be shown',
        ]),
      );
    });
  });

  describe('per-evidence likelihoods', () => {
    it('accepts evidence with both likelihoods inside 0..1', () => {
      const thought = createThought({
        evidence: [
          {
            description: 'Positive test',
            likelihoodGivenHypothesis: 0.9,
            likelihoodGivenNotHypothesis: 0.1,
          },
        ],
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('rejects an out-of-range P(E|H) and names the evidence and the value', () => {
      const thought = createThought({
        evidence: [
          {
            description: 'Positive test',
            likelihoodGivenHypothesis: 1.4,
            likelihoodGivenNotHypothesis: 0.1,
          },
        ],
      });

      expect(descriptions(thought)).toContain(
        'Evidence "Positive test" has invalid P(E|H): 1.4',
      );
    });

    it('rejects an out-of-range P(E|not H)', () => {
      const thought = createThought({
        evidence: [
          {
            description: 'Positive test',
            likelihoodGivenHypothesis: 0.9,
            likelihoodGivenNotHypothesis: -0.2,
          },
        ],
      });

      expect(descriptions(thought)).toContain(
        'Evidence "Positive test" has invalid P(E|¬H): -0.2',
      );
    });

    it('checks every piece of evidence, not just the first', () => {
      const thought = createThought({
        evidence: [
          {
            description: 'First',
            likelihoodGivenHypothesis: 0.5,
            likelihoodGivenNotHypothesis: 0.5,
          },
          {
            description: 'Second',
            likelihoodGivenHypothesis: 5,
            likelihoodGivenNotHypothesis: 0.5,
          },
        ],
      });

      expect(descriptions(thought)).toContain(
        'Evidence "Second" has invalid P(E|H): 5',
      );
    });
  });

  describe('Bayes factor', () => {
    it('reports evidence supporting the hypothesis when the factor exceeds 1', () => {
      const issue = validator
        .validate(createThought({ bayesFactor: 9 }), context)
        .find((i) => i.description.includes('Bayes factor'));

      expect(issue?.description).toBe(
        'Bayes factor 9.00 > 1, evidence supports hypothesis',
      );
      expect(issue?.severity).toBe('info');
      expect(issue?.category).toBe('interpretation');
    });

    it('reports evidence contradicting the hypothesis when the factor is below 1', () => {
      expect(descriptions(createThought({ bayesFactor: 0.25 }))).toContain(
        'Bayes factor 0.25 < 1, evidence contradicts hypothesis',
      );
    });

    it('says nothing at exactly 1, where the evidence is uninformative', () => {
      expect(validator.validate(createThought({ bayesFactor: 1 }), context)).toEqual(
        [],
      );
    });

    it('rejects a negative Bayes factor as a mathematical error', () => {
      const issues = validator.validate(
        createThought({ bayesFactor: -2 }),
        context,
      );

      expect(issues.map((i) => i.description)).toContain(
        'Bayes factor must be between 0 and Infinity',
      );
      expect(
        issues.find((i) => i.description.startsWith('Bayes factor must be'))
          ?.category,
      ).toBe('mathematical');
    });

    it('does not also call a negative factor "contradicting", which would be nonsense', () => {
      // The `>= 0` guard on the contradiction branch exists for exactly this.
      expect(descriptions(createThought({ bayesFactor: -2 })).join(' ')).not.toContain(
        'evidence contradicts hypothesis',
      );
    });

    it('accepts an arbitrarily large factor, since the range has no upper bound', () => {
      const thought = createThought({ bayesFactor: 1e6 });

      const issues = validator.validate(thought, context);
      expect(issues).toHaveLength(1);
      expect(issues[0].severity).toBe('info');
    });
  });

  describe('issue shape', () => {
    it('stamps every issue with the thought number and a suggestion', () => {
      const thought = createThought({
        thoughtNumber: 2,
        prior: { probability: 5 },
        posterior: { probability: 0.5 },
        bayesFactor: 4,
      });

      const issues = validator.validate(thought, context);
      expect(issues.length).toBeGreaterThanOrEqual(3);
      for (const issue of issues) {
        expect(issue.thoughtNumber).toBe(2);
        expect(issue.suggestion).toBeTruthy();
      }
    });
  });
});
