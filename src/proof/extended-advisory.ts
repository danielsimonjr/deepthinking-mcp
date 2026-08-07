/**
 * Extended advisory proof analysis — the five engines the first wiring wave
 * left unreachable.
 *
 * The 2026-08-06 wave wired `decomposer`, `gap-analyzer`, `circular-detector`
 * and `inconsistency-detector` into `SessionManager.addThought()` and stopped
 * there. `assumption-tracker`, `verifier`, `branch-analyzer`,
 * `hierarchical-proof`, `strategy-recommender` and `patterns/warnings` were
 * left out on the theory that they needed a session-level home because they
 * were stateful or unserialisable. Reading them says otherwise:
 *
 * - **None of the five classes holds per-call state.** Each stores only its
 *   options object; `analyze`, `verify`, `createProof`, `recommend` and
 *   `analyzeAssumptions` are pure functions of their arguments. A
 *   session-level home was never required.
 * - **Only the assumption tracker had a serialisation problem**, and it is
 *   fixable rather than disqualifying. `AssumptionAnalysis.conclusionDependencies`
 *   and `.minimalSets` are `Map`s, and `JSON.stringify` turns a `Map` into
 *   `{}` — measured, not assumed. {@link toDependencyEntries} projects both to
 *   arrays before they reach a client.
 * - **The verifier's input is the same `ProofStep[]` the decomposer already
 *   receives.** No new client-facing schema field is needed.
 *
 * Everything here obeys the same three rules as `advisory.ts`:
 * it never throws, it never rejects a thought, and every list it returns is
 * bounded with an explicit truncation flag.
 *
 * It also degrades per-engine. Each analyser runs inside its own `try`, so one
 * throwing costs its own field only and is named in `failed`.
 */

import type {
  AssumptionDependencyEntry,
  ProofAssumptionAnalysis,
  ProofBranchAnalysis,
  ProofExtendedAnalysis,
  ProofFallacyAnalysis,
  ProofFallacyHit,
  ProofStrategyAnalysis,
  ProofStructureAnalysis,
  ProofVerificationAnalysis,
} from "../types/session.js";
import type { ProofDecomposition } from "../types/modes/mathematics.js";
import type { ProofStep } from "./decomposer.js";
import { AssumptionTracker } from "./assumption-tracker.js";
import { ProofVerifier } from "./verifier.js";
import { BranchAnalyzer } from "./branch-analyzer.js";
import { HierarchicalProofManager } from "./hierarchical-proof.js";
import { StrategyRecommender } from "./strategy-recommender.js";
import { checkStatement } from "./patterns/warnings.js";

/**
 * Steps fed to the extended engines.
 *
 * Lower than `MAX_PROOF_STEPS` (200) on purpose. Measured on this machine with
 * a 10-statement proof repeated to length: verification costs 2.4 ms at 100
 * steps and 20.5 ms at 200, branch analysis 1.6 ms and 4.2 ms. The decomposer
 * still sees the full 200; only these five are capped, and `truncated.input`
 * says so.
 */
export const MAX_EXTENDED_PROOF_STEPS = 100;

/** Maximum explicit assumptions returned. */
export const MAX_EXTENDED_ASSUMPTIONS = 20;

/** Maximum conclusion→assumption entries returned, per map. */
export const MAX_EXTENDED_CONCLUSIONS = 10;

/** Maximum verification errors, warnings, and unverified step ids returned. */
export const MAX_VERIFICATION_ITEMS = 20;

/** Maximum proof branches returned. */
export const MAX_PROOF_BRANCHES = 20;

/** Maximum extracted sub-proofs (lemmas, claims) returned. */
export const MAX_SUB_PROOFS = 20;

/** Maximum strategy recommendations returned. */
export const MAX_STRATEGY_RECOMMENDATIONS = 3;

/** Maximum fallacy-pattern hits returned. */
export const MAX_FALLACY_HITS = 20;

/** Maximum free-text notes (suggestions, structure issues) returned. */
export const MAX_EXTENDED_NOTES = 10;

/**
 * Characters of one statement fed to the fallacy regexes.
 *
 * The patterns are linear on this engine (measured: 0.44 ms at 233 chars,
 * 6.22 ms at 10,033 — no catastrophic backtracking), but `thought.content` is
 * only bounded at 10,000 characters and a statement with no sentence
 * punctuation is not split. This keeps the per-statement cost flat regardless.
 */
export const MAX_FALLACY_STATEMENT_CHARS = 2000;

/** Characters of a matched substring echoed back as context. */
export const MAX_FALLACY_EXCERPT_CHARS = 160;

/**
 * The parts of `src/proof/` this wrapper depends on. Narrow on purpose so
 * tests can substitute one analyser without constructing the real engines.
 */
export interface ExtendedProofDeps {
  assumptionTracker?: Pick<
    AssumptionTracker,
    "analyzeAssumptions" | "getSuggestions" | "validateStructure"
  >;
  verifier?: Pick<ProofVerifier, "verify">;
  branchAnalyzer?: Pick<BranchAnalyzer, "analyze">;
  hierarchicalProof?: Pick<HierarchicalProofManager, "createProof">;
  strategyRecommender?: Pick<StrategyRecommender, "recommend">;
  checkStatement?: typeof checkStatement;
}

const defaultAssumptionTracker = new AssumptionTracker();
const defaultVerifier = new ProofVerifier();
const defaultBranchAnalyzer = new BranchAnalyzer();
const defaultHierarchicalProof = new HierarchicalProofManager();
const defaultStrategyRecommender = new StrategyRecommender();

/**
 * Project a `Map<conclusion, assumptions>` to an array.
 *
 * This is the whole reason the assumption tracker was previously excluded: a
 * `Map` field survives the type checker and then serialises to `{}` over MCP,
 * which is worse than omitting it because the client cannot tell the
 * difference between "no dependencies" and "the server dropped them".
 */
function toDependencyEntries(
  map: Map<string, string[]> | undefined,
  limit: number,
): { entries: AssumptionDependencyEntry[]; total: number } {
  const all = map instanceof Map ? [...map.entries()] : [];
  return {
    entries: all
      .slice(0, limit)
      .map(([conclusion, assumptions]) => ({ conclusion, assumptions })),
    total: all.length,
  };
}

function analyzeAssumptions(
  decomposition: ProofDecomposition,
  deps: ExtendedProofDeps,
): ProofAssumptionAnalysis {
  const tracker = deps.assumptionTracker ?? defaultAssumptionTracker;
  const analysis = tracker.analyzeAssumptions(decomposition);
  const structure = tracker.validateStructure(decomposition);
  const suggestions = tracker.getSuggestions(analysis);

  const conclusionDependencies = toDependencyEntries(
    analysis.conclusionDependencies,
    MAX_EXTENDED_CONCLUSIONS,
  );
  const minimalSets = toDependencyEntries(
    analysis.minimalSets,
    MAX_EXTENDED_CONCLUSIONS,
  );

  const explicit = analysis.explicitAssumptions ?? [];
  const unused = analysis.unusedAssumptions ?? [];
  const issues = structure.issues ?? [];

  const truncated = {
    explicit: explicit.length > MAX_EXTENDED_ASSUMPTIONS,
    unused: unused.length > MAX_EXTENDED_ASSUMPTIONS,
    conclusionDependencies:
      conclusionDependencies.total > MAX_EXTENDED_CONCLUSIONS,
    minimalSets: minimalSets.total > MAX_EXTENDED_CONCLUSIONS,
    suggestions: suggestions.length > MAX_EXTENDED_NOTES,
    structureIssues: issues.length > MAX_EXTENDED_NOTES,
    any: false,
  };
  truncated.any = Object.values(truncated).some((v) => v === true);

  return {
    explicit: explicit.slice(0, MAX_EXTENDED_ASSUMPTIONS).map((a) => ({
      id: a.id,
      statement: a.statement,
      type: a.type,
    })),
    unused: unused.slice(0, MAX_EXTENDED_ASSUMPTIONS),
    conclusionDependencies: conclusionDependencies.entries,
    minimalSets: minimalSets.entries,
    suggestions: suggestions.slice(0, MAX_EXTENDED_NOTES),
    structureIssues: issues.slice(0, MAX_EXTENDED_NOTES),
    totals: {
      explicit: explicit.length,
      unused: unused.length,
      conclusionDependencies: conclusionDependencies.total,
      minimalSets: minimalSets.total,
      suggestions: suggestions.length,
      structureIssues: issues.length,
    },
    truncated,
  };
}

function verifyProof(
  steps: ProofStep[],
  deps: ExtendedProofDeps,
): ProofVerificationAnalysis {
  const verifier = deps.verifier ?? defaultVerifier;
  const result = verifier.verify(steps);
  const errors = result.errors ?? [];
  const warnings = result.warnings ?? [];
  const unverified = result.coverage?.unverifiedSteps ?? [];

  const truncated = {
    errors: errors.length > MAX_VERIFICATION_ITEMS,
    warnings: warnings.length > MAX_VERIFICATION_ITEMS,
    unverifiedSteps: unverified.length > MAX_VERIFICATION_ITEMS,
    any: false,
  };
  truncated.any = Object.values(truncated).some((v) => v === true);

  return {
    errors: errors.slice(0, MAX_VERIFICATION_ITEMS),
    warnings: warnings.slice(0, MAX_VERIFICATION_ITEMS),
    coverage: {
      stepsVerified: result.coverage.stepsVerified,
      totalSteps: result.coverage.totalSteps,
      percentage: result.coverage.percentage,
      unverifiedSteps: unverified.slice(0, MAX_VERIFICATION_ITEMS),
    },
    justificationTypes: result.justificationTypes ?? [],
    totals: {
      errors: errors.length,
      warnings: warnings.length,
      unverifiedSteps: unverified.length,
    },
    truncated,
  };
}

function analyzeBranches(
  steps: ProofStep[],
  deps: ExtendedProofDeps,
): ProofBranchAnalysis {
  const analyzer = deps.branchAnalyzer ?? defaultBranchAnalyzer;
  const result = analyzer.analyze(steps);
  const branches = result.branches ?? [];
  const levels = result.executionLevels ?? [];

  const truncated = {
    branches: branches.length > MAX_PROOF_BRANCHES,
    executionLevels: levels.length > MAX_PROOF_BRANCHES,
    any: false,
  };
  truncated.any = Object.values(truncated).some((v) => v === true);

  return {
    // The steps themselves are dropped: the caller sent them, and echoing
    // every branch's copy back turned a 200-step proof into a 48 KB payload.
    branches: branches.slice(0, MAX_PROOF_BRANCHES).map((b) => ({
      id: b.id,
      name: b.name,
      stepCount: b.steps.length,
      isIndependent: b.isIndependent,
      estimatedComplexity: b.estimatedComplexity,
      dependencies: b.dependencies,
      dependents: b.dependents,
    })),
    executionLevelSizes: levels
      .slice(0, MAX_PROOF_BRANCHES)
      .map((level) => level.length),
    independentCount: result.independentCount,
    totalComplexity: result.totalComplexity,
    canParallelize: result.canParallelize,
    totals: { branches: branches.length, executionLevels: levels.length },
    truncated,
  };
}

function analyzeStructure(
  theorem: string,
  steps: ProofStep[],
  deps: ExtendedProofDeps,
): ProofStructureAnalysis {
  const manager = deps.hierarchicalProof ?? defaultHierarchicalProof;
  const proof = manager.createProof(theorem, steps);
  const subProofs = proof.subProofs ?? [];
  const dependencies = proof.dependencies ?? [];

  const truncated = {
    subProofs: subProofs.length > MAX_SUB_PROOFS,
    dependencies: dependencies.length > MAX_SUB_PROOFS,
    any: false,
  };
  truncated.any = Object.values(truncated).some((v) => v === true);

  return {
    type: proof.type,
    statement: proof.statement,
    name: proof.name,
    stepCount: proof.proof.length,
    isComplete: proof.isComplete,
    dependencies: dependencies.slice(0, MAX_SUB_PROOFS),
    subProofs: subProofs.slice(0, MAX_SUB_PROOFS).map((sub) => ({
      id: sub.id,
      type: sub.type,
      name: sub.name,
      statement: sub.statement,
      stepCount: sub.proof.length,
      isComplete: sub.isComplete,
    })),
    totals: { subProofs: subProofs.length, dependencies: dependencies.length },
    truncated,
  };
}

function recommendStrategies(
  theorem: string,
  deps: ExtendedProofDeps,
): ProofStrategyAnalysis {
  const recommender = deps.strategyRecommender ?? defaultStrategyRecommender;
  const all = recommender.recommend(theorem) ?? [];

  return {
    theorem,
    // `suggestedStructure` carries a full template plus a multi-line skeleton
    // string. Only the section names are kept; a client that wants the
    // skeleton can ask for the strategy by name.
    recommendations: all.slice(0, MAX_STRATEGY_RECOMMENDATIONS).map((r) => ({
      strategy: r.strategy,
      confidence: r.confidence,
      reasoning: r.reasoning,
      matchedFeatures: r.matchedFeatures,
      sections: (r.suggestedStructure?.sections ?? []).map((s) => s.name),
    })),
    totals: { recommendations: all.length },
    truncated: { recommendations: all.length > MAX_STRATEGY_RECOMMENDATIONS },
  };
}

function findFallacies(
  steps: ProofStep[],
  deps: ExtendedProofDeps,
): ProofFallacyAnalysis {
  const check = deps.checkStatement ?? checkStatement;
  const hits: ProofFallacyHit[] = [];
  let total = 0;

  for (let i = 0; i < steps.length; i++) {
    const statement = steps[i].content.slice(0, MAX_FALLACY_STATEMENT_CHARS);
    for (const hit of check(statement)) {
      total++;
      if (hits.length < MAX_FALLACY_HITS) {
        hits.push({
          stepIndex: i,
          patternId: hit.pattern.id,
          name: hit.pattern.name,
          category: hit.pattern.category,
          severity: hit.pattern.severity,
          suggestion: hit.pattern.suggestion,
          excerpt: String(hit.match[0]).slice(0, MAX_FALLACY_EXCERPT_CHARS),
        });
      }
    }
  }

  const truncated = {
    hits: total > MAX_FALLACY_HITS,
    statements: steps.some(
      (s) => s.content.length > MAX_FALLACY_STATEMENT_CHARS,
    ),
    any: false,
  };
  truncated.any = truncated.hits || truncated.statements;

  return {
    hits,
    statementsScanned: steps.length,
    totals: { hits: total },
    truncated,
  };
}

/**
 * Run the five previously-unreachable proof engines over an already-computed
 * decomposition and its steps.
 *
 * @param decomposition - Decomposition produced (or supplied) by the caller
 * @param steps - The proof steps; capped at {@link MAX_EXTENDED_PROOF_STEPS}
 * @param theorem - Theorem statement, when the thought carried one. Strategy
 *   recommendation is skipped without it — recommending a proof strategy needs
 *   something to prove.
 * @param deps - Analysers to substitute (defaults to the shared engines)
 * @returns Bounded, Map-free extended analysis. Never throws.
 */
export function analyzeProofExtended(
  decomposition: ProofDecomposition,
  steps: ProofStep[],
  theorem: string | undefined,
  deps: ExtendedProofDeps = {},
): ProofExtendedAnalysis {
  const budgeted = steps.slice(0, MAX_EXTENDED_PROOF_STEPS);
  const failed: string[] = [];

  /**
   * Run one analyser. A throwing analyser costs only its own field, so a
   * single broken engine can never hide the other four — and can never take
   * down thought creation, which is the whole point of an advisory path.
   */
  function attempt<T>(name: string, fn: () => T): T | undefined {
    try {
      return fn();
    } catch {
      failed.push(name);
      return undefined;
    }
  }

  const result: ProofExtendedAnalysis = {
    stepsAnalyzed: budgeted.length,
    assumptions: attempt("assumptions", () =>
      analyzeAssumptions(decomposition, deps),
    ),
    verification: attempt("verification", () => verifyProof(budgeted, deps)),
    branches: attempt("branches", () => analyzeBranches(budgeted, deps)),
    structure: attempt("structure", () =>
      analyzeStructure(theorem ?? decomposition.theorem ?? "", budgeted, deps),
    ),
    strategies: theorem
      ? attempt("strategies", () => recommendStrategies(theorem, deps))
      : undefined,
    fallacies: attempt("fallacies", () => findFallacies(budgeted, deps)),
    failed,
    truncated: {
      input: steps.length > budgeted.length,
      any: steps.length > budgeted.length,
    },
  };

  return result;
}
