/**
 * Unit tests for the advisory proof-analysis wrapper.
 *
 * The wrapper is the only entry point the live request path uses. It must:
 * - run only when the thought actually carries proof content
 * - never throw (a broken analyser degrades to `available: false`)
 * - never overwrite a caller-supplied decomposition
 * - bound every list it returns and say so when it truncates
 */

import { describe, it, expect } from 'vitest';
import {
  analyzeProofAdvisory,
  MAX_PROOF_ATOMS,
  MAX_PROOF_GAPS,
  MAX_PROOF_STEPS,
} from '../../../src/proof/advisory.js';
import { ThinkingMode } from '../../../src/types/index.js';

const SQRT2_PROOF = [
  'Assume that sqrt(2) is rational.',
  'Then sqrt(2) = a/b where a and b are integers with no common factor.',
  'Squaring both sides, we have 2 = a^2/b^2.',
  'Therefore a^2 = 2 b^2.',
  'Since a^2 is even, a is even.',
  'Let a = 2k for some integer k.',
  'By substitution, we get 4k^2 = 2b^2.',
  'This implies b^2 = 2k^2.',
  'Therefore a and b share the common factor 2.',
].join('\n');

function mathThought(extra: Record<string, unknown> = {}) {
  return {
    id: 'm1',
    sessionId: 's1',
    mode: ThinkingMode.MATHEMATICS,
    thoughtType: 'proof_construction',
    content: SQRT2_PROOF,
    thoughtNumber: 1,
    totalThoughts: 2,
    timestamp: new Date(),
    nextThoughtNeeded: true,
    dependencies: [],
    assumptions: [],
    uncertainty: 0.2,
    ...extra,
  } as any;
}

function logicThought(extra: Record<string, unknown> = {}) {
  return {
    id: 'l1',
    sessionId: 's1',
    mode: ThinkingMode.FORMALLOGIC,
    thoughtType: 'proof_construction',
    content: 'Deriving Q from P.',
    thoughtNumber: 1,
    totalThoughts: 2,
    timestamp: new Date(),
    nextThoughtNeeded: true,
    ...extra,
  } as any;
}

describe('analyzeProofAdvisory', () => {
  describe('when it runs', () => {
    it('analyses a mathematics proof carried in the thought content', () => {
      const result = analyzeProofAdvisory(mathThought());

      expect(result).toBeDefined();
      expect(result!.available).toBe(true);
      if (!result!.available) return;
      expect(result!.source).toBe('thought.content');
      expect(result!.decompositionSource).toBe('derived');
      expect(result!.atoms.length).toBeGreaterThan(1);
      expect(result!.totals.atoms).toBe(result!.atoms.length);
    });

    it('prefers an explicit theorem proof over the thought content', () => {
      const result = analyzeProofAdvisory(
        mathThought({
          content: 'Some commentary about the approach.',
          theorems: [
            {
              name: 'Irrationality of sqrt(2)',
              statement: 'sqrt(2) is irrational',
              hypotheses: [],
              conclusion: 'sqrt(2) is irrational',
              proof: SQRT2_PROOF,
            },
          ],
        }),
      );

      expect(result!.available).toBe(true);
      if (!result!.available) return;
      expect(result!.source).toBe('theorem.proof');
      expect(result!.theorem).toBe('sqrt(2) is irrational');
    });

    it('analyses proofStrategy steps when there is no theorem proof', () => {
      const result = analyzeProofAdvisory(
        mathThought({
          content: 'Short note.',
          proofStrategy: {
            type: 'induction',
            steps: [
              'Base case: P(0) holds.',
              'Assume P(n) holds for some n.',
              'Therefore P(n+1) holds.',
            ],
            completeness: 0.8,
          },
        }),
      );

      expect(result!.available).toBe(true);
      if (!result!.available) return;
      expect(result!.source).toBe('proofStrategy.steps');
    });

    it('analyses the structured steps of a formal-logic proof', () => {
      const result = analyzeProofAdvisory(
        logicThought({
          proof: {
            id: 'p1',
            theorem: 'P implies R',
            technique: 'direct',
            steps: [
              { stepNumber: 1, statement: 'Assume P.', justification: 'hypothesis' },
              { stepNumber: 2, statement: 'P implies Q.', justification: 'premise' },
              { stepNumber: 3, statement: 'Therefore Q.', justification: 'modus ponens' },
              { stepNumber: 4, statement: 'Therefore R.', justification: 'modus ponens' },
            ],
            conclusion: 'R',
            valid: true,
            completeness: 1,
          },
        }),
      );

      expect(result!.available).toBe(true);
      if (!result!.available) return;
      expect(result!.source).toBe('formallogic.proof.steps');
      expect(result!.theorem).toBe('P implies R');
    });

    it('reports circular reasoning as feedback', () => {
      const result = analyzeProofAdvisory(
        mathThought({
          content: [
            'Assume the statement S is true.',
            'Since S is true, we have that S holds.',
            'Therefore S is true.',
          ].join('\n'),
        }),
      );

      expect(result!.available).toBe(true);
      if (!result!.available) return;
      expect(typeof result!.hasCircularReasoning).toBe('boolean');
      expect(typeof result!.circularSummary).toBe('string');
    });
  });

  describe('when it does not run', () => {
    it('returns undefined for a mode that carries no proofs', () => {
      const result = analyzeProofAdvisory({
        id: 't1',
        sessionId: 's1',
        mode: ThinkingMode.SEQUENTIAL,
        content: SQRT2_PROOF,
        thoughtNumber: 1,
        totalThoughts: 2,
        timestamp: new Date(),
        nextThoughtNeeded: true,
      } as any);

      expect(result).toBeUndefined();
    });

    it('returns undefined for a mathematics thought whose type carries no proof', () => {
      const result = analyzeProofAdvisory(
        mathThought({ thoughtType: 'numerical_analysis' }),
      );

      expect(result).toBeUndefined();
    });

    it('returns undefined when the content is a single statement', () => {
      const result = analyzeProofAdvisory(
        mathThought({ content: 'Therefore the result holds.' }),
      );

      expect(result).toBeUndefined();
    });

    it('returns undefined for a formal-logic thought with an empty proof', () => {
      const result = analyzeProofAdvisory(
        logicThought({
          thoughtType: 'satisfiability_check',
          proof: undefined,
        }),
      );

      expect(result).toBeUndefined();
    });
  });

  describe('caller-supplied decomposition', () => {
    it('reuses it instead of recomputing, and never overwrites it', () => {
      const supplied = {
        id: 'caller-decomposition',
        originalProof: 'caller proof',
        atoms: [
          {
            id: 'a1',
            statement: 'P',
            type: 'hypothesis',
            confidence: 1,
            isExplicit: true,
          },
        ],
        dependencies: {
          nodes: new Map(),
          edges: [],
          roots: [],
          leaves: [],
          depth: 1,
          width: 1,
          hasCycles: false,
        },
        assumptionChains: [],
        gaps: [],
        implicitAssumptions: [],
        completeness: 0.9,
        rigorLevel: 'rigorous',
        atomCount: 1,
        maxDependencyDepth: 1,
      };
      const thought = mathThought({ decomposition: supplied });

      const result = analyzeProofAdvisory(thought);

      expect(result!.available).toBe(true);
      if (!result!.available) return;
      expect(result!.decompositionSource).toBe('caller-supplied');
      expect(result!.source).toBe('caller.decomposition');
      // The caller's numbers are passed through, not recomputed from content.
      expect(result!.completeness).toBe(0.9);
      expect(result!.rigorLevel).toBe('rigorous');
      expect(result!.totals.atoms).toBe(1);
      // The thought's own field is untouched.
      expect(thought.decomposition).toBe(supplied);
    });

    it('reuses a caller-supplied gap analysis', () => {
      const thought = mathThought({
        gapAnalysis: {
          completeness: 0.42,
          gaps: [],
          implicitAssumptions: [],
          unjustifiedSteps: ['step 3'],
          suggestions: ['Justify step 3'],
        },
      });

      const result = analyzeProofAdvisory(thought);

      expect(result!.available).toBe(true);
      if (!result!.available) return;
      expect(result!.unjustifiedSteps).toEqual(['step 3']);
      expect(result!.suggestions).toEqual(['Justify step 3']);
    });
  });

  describe('degradation', () => {
    it('reports available: false when the decomposer throws', () => {
      const result = analyzeProofAdvisory(mathThought(), {
        decomposer: {
          decompose() {
            throw new Error('decomposer exploded');
          },
        },
      });

      expect(result).toBeDefined();
      expect(result!.available).toBe(false);
      if (result!.available) return;
      expect(result!.reason).toContain('decomposer exploded');
    });

    it('reports available: false when a downstream analyser throws', () => {
      const result = analyzeProofAdvisory(mathThought(), {
        gapAnalyzer: {
          analyzeGaps() {
            throw new Error('gap analyzer exploded');
          },
        },
      });

      expect(result!.available).toBe(false);
      if (result!.available) return;
      expect(result!.reason).toContain('gap analyzer exploded');
    });
  });

  describe('bounded output', () => {
    it('caps the atoms it returns and marks the truncation', () => {
      const long = Array.from(
        { length: MAX_PROOF_ATOMS + 20 },
        (_, i) => `Since x${i} is positive, we have that y${i} is positive.`,
      ).join('\n');

      const result = analyzeProofAdvisory(mathThought({ content: long }));

      expect(result!.available).toBe(true);
      if (!result!.available) return;
      expect(result!.atoms).toHaveLength(MAX_PROOF_ATOMS);
      expect(result!.totals.atoms).toBe(MAX_PROOF_ATOMS + 20);
      expect(result!.truncated.atoms).toBe(true);
      expect(result!.truncated.any).toBe(true);
    });

    it('caps the proof steps it analyses at all and marks the input truncated', () => {
      const huge = Array.from(
        { length: MAX_PROOF_STEPS + 50 },
        (_, i) => `Since x${i} is positive, we have that y${i} is positive.`,
      ).join('\n');

      const result = analyzeProofAdvisory(mathThought({ content: huge }));

      expect(result!.available).toBe(true);
      if (!result!.available) return;
      expect(result!.truncated.input).toBe(true);
      expect(result!.totals.steps).toBe(MAX_PROOF_STEPS + 50);
      expect(result!.stepsAnalyzed).toBe(MAX_PROOF_STEPS);
      // Nothing downstream may exceed the analysed-step budget.
      expect(result!.totals.atoms).toBeLessThanOrEqual(MAX_PROOF_STEPS);
    });

    it('caps the gaps it returns and marks the truncation', () => {
      const result = analyzeProofAdvisory(mathThought(), {
        gapAnalyzer: {
          analyzeGaps() {
            return {
              completeness: 0.1,
              gaps: Array.from({ length: MAX_PROOF_GAPS + 5 }, (_, i) => ({
                id: `g${i}`,
                type: 'missing_step' as const,
                location: { from: 'a', to: 'b' },
                description: `gap ${i}`,
                severity: 'minor' as const,
              })),
              implicitAssumptions: [],
              unjustifiedSteps: [],
              suggestions: [],
            };
          },
        },
      });

      expect(result!.available).toBe(true);
      if (!result!.available) return;
      expect(result!.gaps).toHaveLength(MAX_PROOF_GAPS);
      expect(result!.totals.gaps).toBe(MAX_PROOF_GAPS + 5);
      expect(result!.truncated.gaps).toBe(true);
    });

    it('reports no truncation for a proof that fits within every cap', () => {
      const result = analyzeProofAdvisory(mathThought());

      expect(result!.available).toBe(true);
      if (!result!.available) return;
      expect(result!.truncated.any).toBe(false);
      expect(result!.truncated.atoms).toBe(false);
      expect(result!.truncated.input).toBe(false);
    });
  });
});
