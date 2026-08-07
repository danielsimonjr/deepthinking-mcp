/**
 * Regression guard: the five remaining `src/proof/` engines are wired into the
 * live request path.
 *
 * The 2026-08-06 wave wired the decomposer, gap analyser, circular detector and
 * inconsistency detector into `SessionManager.addThought()` and stopped there.
 * `assumption-tracker`, `verifier`, `branch-analyzer`, `hierarchical-proof`,
 * `strategy-recommender` and `patterns/warnings` stayed unreachable on the
 * theory that they were stateful or unserialisable. Reading them showed
 * neither: every one is a pure function of its arguments, and only the
 * assumption tracker had a serialisation problem, which is projected away.
 *
 * These tests assert a LIVE `addThought` call produces each engine's output.
 * They fail the moment any of them stops being invoked, which is exactly how
 * this subsystem became dead code the first time.
 *
 * Everything here is ADVISORY. No assertion below may become a gate.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { validationCache } from '../../../src/validation/cache.js';
import { AssumptionTracker } from '../../../src/proof/assumption-tracker.js';
import { ProofVerifier } from '../../../src/proof/verifier.js';
import { BranchAnalyzer } from '../../../src/proof/branch-analyzer.js';
import { HierarchicalProofManager } from '../../../src/proof/hierarchical-proof.js';
import { StrategyRecommender } from '../../../src/proof/strategy-recommender.js';
import { MAX_EXTENDED_PROOF_STEPS } from '../../../src/proof/extended-advisory.js';
import { ThinkingMode } from '../../../src/types/index.js';
import type { ProofAnalysisResult } from '../../../src/types/session.js';
import { randomUUID } from 'crypto';

const PROOF_STEPS = [
  'Assume that sqrt(2) is rational.',
  'Then sqrt(2) = a/b where a and b are integers with no common factor.',
  'Squaring both sides, we have 2 = a^2/b^2 by algebraic manipulation.',
  'Therefore a^2 = 2 b^2 by step 3.',
  'Since a^2 is even, a is even by definition of evenness.',
  'Let a = 2k for some integer k.',
  'This implies b^2 = 2k^2 by substitution.',
  'Therefore a and b share the common factor 2, a contradiction.',
];

const THEOREM = 'For all natural numbers n, sqrt(2) is not rational.';

function mathThought(sessionId: string, extra: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    sessionId,
    mode: ThinkingMode.MATHEMATICS,
    thoughtType: 'proof_construction',
    content: 'A proof by contradiction.',
    thoughtNumber: 1,
    totalThoughts: 2,
    timestamp: new Date(),
    nextThoughtNeeded: true,
    theorems: [{ statement: THEOREM, proof: PROOF_STEPS.join(' ') }],
    ...extra,
  } as any;
}

async function analyse(
  manager: SessionManager,
  extra: Record<string, unknown> = {},
) {
  const session = await manager.createSession({
    title: 'Extended proof wiring',
    mode: ThinkingMode.MATHEMATICS,
  });
  const updated = await manager.addThought(
    session.id,
    mathThought(session.id, extra),
  );
  const analysis = (updated.thoughts[0] as any).proofAnalysis;
  expect(analysis).toBeDefined();
  expect(analysis.available).toBe(true);
  return analysis as ProofAnalysisResult;
}

describe('extended proof analysis wiring', () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager();
    validationCache.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs every extended engine on a live addThought call', async () => {
    const analysis = await analyse(manager);
    const extended = analysis.extended;

    expect(extended).toBeDefined();
    expect(extended!.failed).toEqual([]);

    // AssumptionTracker
    expect(extended!.assumptions).toBeDefined();
    expect(extended!.assumptions!.suggestions.length).toBeGreaterThan(0);

    // ProofVerifier — coverage is computed over the real steps
    expect(extended!.verification).toBeDefined();
    expect(extended!.verification!.coverage.totalSteps).toBe(
      PROOF_STEPS.length,
    );
    expect(
      extended!.verification!.justificationTypes.length,
    ).toBeGreaterThan(0);

    // BranchAnalyzer
    expect(extended!.branches).toBeDefined();
    expect(extended!.branches!.totals.branches).toBeGreaterThan(0);

    // HierarchicalProofManager
    expect(extended!.structure).toBeDefined();
    expect(extended!.structure!.stepCount).toBe(PROOF_STEPS.length);

    // StrategyRecommender — needs a theorem, which this thought carries
    expect(extended!.strategies).toBeDefined();
    expect(extended!.strategies!.recommendations.length).toBeGreaterThan(0);
    expect(extended!.strategies!.recommendations[0].strategy).toBeTruthy();

    // Fallacy patterns
    expect(extended!.fallacies).toBeDefined();
    expect(extended!.fallacies!.statementsScanned).toBe(PROOF_STEPS.length);
  });

  it('detects a planted fallacy in the live path', async () => {
    // The detector must actually detect. A scanner that always returns an
    // empty list is indistinguishable from one that is never called.
    const analysis = await analyse(manager, {
      theorems: [
        {
          statement: THEOREM,
          proof: [
            'Assume n is an integer.',
            'Dividing by (a - b) gives the result.',
            'This completes the proof.',
          ].join(' '),
        },
      ],
    });

    const hits = analysis.extended!.fallacies!.hits;
    expect(hits.map((h) => h.patternId)).toContain('division_by_hidden_zero');
    expect(hits[0].severity).toBeTruthy();
    expect(hits[0].suggestion).toBeTruthy();
  });

  it('projects the assumption tracker Maps into arrays that survive JSON', async () => {
    // `AssumptionAnalysis.conclusionDependencies` and `.minimalSets` are
    // `Map`s, and `JSON.stringify(new Map(...))` is `"{}"`. Sending either one
    // unprojected over MCP would hand the client an empty object with no
    // error. This asserts the wire form, after a real round-trip.
    const analysis = await analyse(manager);
    const round = JSON.parse(JSON.stringify(analysis));
    const assumptions = round.extended.assumptions;

    // `Array.isArray` alone is not enough: an empty array satisfies it, so a
    // projection that silently dropped every entry would pass. Mutation
    // testing caught exactly that. Assert the entries are really there and
    // agree with the pre-truncation count the same call reported.
    expect(assumptions.totals.conclusionDependencies).toBeGreaterThan(0);
    expect(assumptions.conclusionDependencies).toHaveLength(
      assumptions.totals.conclusionDependencies,
    );
    expect(assumptions.minimalSets).toHaveLength(
      assumptions.totals.minimalSets,
    );
    for (const entry of assumptions.conclusionDependencies) {
      expect(typeof entry.conclusion).toBe('string');
      expect(entry.conclusion.length).toBeGreaterThan(0);
      expect(Array.isArray(entry.assumptions)).toBe(true);
    }
    // The tracker found explicit assumptions; the projection must carry them.
    expect(assumptions.explicit.length).toBe(assumptions.totals.explicit);
    expect(assumptions.explicit[0].id).toBeTruthy();
    expect(assumptions.explicit[0].statement).toBeTruthy();

    // Nothing anywhere in the payload may still be a Map or a Set.
    const offenders: string[] = [];
    (function walk(value: unknown, path: string) {
      if (value instanceof Map || value instanceof Set) offenders.push(path);
      else if (Array.isArray(value))
        value.forEach((v, i) => walk(v, `${path}[${i}]`));
      else if (value && typeof value === 'object')
        for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
    })(analysis.extended, 'extended');
    expect(offenders).toEqual([]);
  });

  it('caps the steps fed to the extended engines and says it did', async () => {
    const long = Array.from(
      { length: MAX_EXTENDED_PROOF_STEPS + 40 },
      (_, i) => PROOF_STEPS[i % PROOF_STEPS.length],
    ).join(' ');

    const analysis = await analyse(manager, {
      theorems: [{ statement: THEOREM, proof: long }],
    });
    const extended = analysis.extended!;

    expect(extended.stepsAnalyzed).toBe(MAX_EXTENDED_PROOF_STEPS);
    expect(extended.truncated.input).toBe(true);
    expect(extended.truncated.any).toBe(true);
    // A capped list must never be reported as a complete one.
    expect(extended.verification!.coverage.totalSteps).toBe(
      MAX_EXTENDED_PROOF_STEPS,
    );
  });

  it('keeps the other engines when one throws, and never rejects the thought', async () => {
    vi.spyOn(ProofVerifier.prototype, 'verify').mockImplementation(() => {
      throw new Error('verifier exploded');
    });

    const analysis = await analyse(manager);
    const extended = analysis.extended!;

    expect(extended.failed).toContain('verification');
    expect(extended.verification).toBeUndefined();
    // The other four still ran.
    expect(extended.assumptions).toBeDefined();
    expect(extended.branches).toBeDefined();
    expect(extended.structure).toBeDefined();
    expect(extended.strategies).toBeDefined();
  });

  it('stores the thought even when every extended engine throws', async () => {
    const boom = () => {
      throw new Error('engine exploded');
    };
    vi.spyOn(AssumptionTracker.prototype, 'analyzeAssumptions').mockImplementation(boom);
    vi.spyOn(ProofVerifier.prototype, 'verify').mockImplementation(boom);
    vi.spyOn(BranchAnalyzer.prototype, 'analyze').mockImplementation(boom);
    vi.spyOn(HierarchicalProofManager.prototype, 'createProof').mockImplementation(boom);
    vi.spyOn(StrategyRecommender.prototype, 'recommend').mockImplementation(boom);

    const session = await manager.createSession({
      title: 'All engines down',
      mode: ThinkingMode.MATHEMATICS,
    });
    const updated = await manager.addThought(
      session.id,
      mathThought(session.id),
    );

    // The thought is still created and stored. That is the whole contract.
    expect(updated.thoughts).toHaveLength(1);
    const analysis = (updated.thoughts[0] as any)
      .proofAnalysis as ProofAnalysisResult;
    expect(analysis.available).toBe(true);
    expect(analysis.extended!.failed).toEqual(
      expect.arrayContaining([
        'assumptions',
        'verification',
        'branches',
        'structure',
        'strategies',
      ]),
    );
    // The base four analysers are untouched by an extended failure.
    expect(analysis.atoms.length).toBeGreaterThan(0);
  });

  it('skips strategy recommendation when no theorem statement exists', async () => {
    // Recommending a proof strategy needs something to prove. Without a
    // theorem the field is absent rather than fabricated.
    const analysis = await analyse(manager, {
      theorems: undefined,
      content: PROOF_STEPS.join(' '),
    });

    expect(analysis.extended!.strategies).toBeUndefined();
    // Everything that does not need a theorem still ran.
    expect(analysis.extended!.verification).toBeDefined();
    expect(analysis.extended!.failed).toEqual([]);
  });

  it('omits the branch steps rather than echoing the proof back', async () => {
    // A 200-step proof's branch analysis carries every step twice. Echoing it
    // turned the payload into 48 KB; the summary is a few hundred bytes.
    const analysis = await analyse(manager);
    const branches = analysis.extended!.branches!.branches;

    expect(branches.length).toBeGreaterThan(0);
    for (const branch of branches) {
      expect(branch).not.toHaveProperty('steps');
      expect(typeof branch.stepCount).toBe('number');
    }
  });
});
