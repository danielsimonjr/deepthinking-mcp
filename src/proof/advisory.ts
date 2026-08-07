/**
 * Advisory proof-analysis wrapper
 *
 * `src/proof/` is a complete 13-module subsystem that, until v9.4.0, nothing
 * outside `src/proof/` imported. This wrapper is the only entry point the live
 * request path uses, and it mirrors `src/validation/advisory.ts`:
 *
 * - it never throws (a broken analyser degrades to `available: false`)
 * - it never rejects a thought (a gap, cycle, or inconsistency is FEEDBACK)
 * - the payload it returns is bounded, and says so when it truncates
 * - it never overwrites a caller-supplied `decomposition`
 *
 * It is also SELECTIVE. Decomposition costs 2-60 ms depending on proof size
 * (measured: 1.8 ms at 10 atoms, 13.7 ms at 100, 56.8 ms at 800), so it runs
 * only when the thought actually carries proof content - never on every
 * thought, and never on a mode that cannot carry a proof.
 */

import type { Thought } from "../types/core.js";
import type {
  AdvisoryProofAnalysis,
  ProofAnalysisSource,
} from "../types/session.js";
import type {
  GapAnalysis,
  Inconsistency,
  ProofDecomposition,
  ProofStrategy,
  Theorem,
} from "../types/modes/mathematics.js";
import type { LogicalProof } from "../types/modes/formallogic.js";
import { ThinkingMode } from "../types/core.js";
import { ProofDecomposer, type ProofStep } from "./decomposer.js";
import { GapAnalyzer } from "./gap-analyzer.js";
import {
  CircularReasoningDetector,
  type CircularReasoningResult,
} from "./circular-detector.js";
import { InconsistencyDetector } from "./inconsistency-detector.js";
import {
  analyzeProofExtended,
  type ExtendedProofDeps,
} from "./extended-advisory.js";

/** Maximum proof steps fed to the decomposer. Bounds the worst-case cost. */
export const MAX_PROOF_STEPS = 200;

/** Maximum atomic statements returned to a client for one thought. */
export const MAX_PROOF_ATOMS = 50;

/** Maximum proof gaps returned to a client for one thought. */
export const MAX_PROOF_GAPS = 20;

/** Maximum implicit assumptions returned to a client for one thought. */
export const MAX_PROOF_ASSUMPTIONS = 10;

/** Maximum inconsistencies returned to a client for one thought. */
export const MAX_PROOF_INCONSISTENCIES = 20;

/** Maximum circular-reasoning cycles returned to a client for one thought. */
export const MAX_PROOF_CYCLES = 10;

/** Maximum free-text entries (suggestions, unjustified steps) returned. */
export const MAX_PROOF_NOTES = 10;

/**
 * Fewest statements a body of text needs before it counts as a proof rather
 * than a remark. A single sentence has no structure to decompose.
 */
const MIN_PROOF_STATEMENTS = 2;

/**
 * Mathematics thought types whose content is expected to carry proof text.
 * Types such as `numerical_analysis` or `theorem_statement` are excluded: a
 * theorem statement is a claim, not an argument.
 */
const PROOF_BEARING_MATH_TYPES = new Set([
  "proof_construction",
  "proof_decomposition",
  "lemma_derivation",
  "corollary",
  "dependency_analysis",
  "consistency_check",
  "gap_identification",
  "assumption_trace",
]);

/** Same split the decomposer uses, so the step count we report is the real one. */
const STATEMENT_SPLIT = /(?<=[.!?])\s+|\n+/;

/**
 * The parts of `src/proof/` this wrapper depends on. Narrow on purpose so
 * tests can substitute an analyser without constructing the real engines.
 */
export interface ProofAnalysisDeps {
  decomposer?: {
    decompose(
      proof: string | ProofStep[],
      theorem?: string,
    ): ProofDecomposition;
  };
  gapAnalyzer?: { analyzeGaps(d: ProofDecomposition): GapAnalysis };
  circularDetector?: {
    detectCircularReasoning(d: ProofDecomposition): CircularReasoningResult;
  };
  inconsistencyDetector?: { analyze(d: ProofDecomposition): Inconsistency[] };

  /**
   * Substitutes for the five extended engines (assumption tracker, verifier,
   * branch analyser, hierarchical proof, strategy recommender, fallacy
   * patterns). See `./extended-advisory.js`.
   */
  extended?: ExtendedProofDeps;

  /**
   * Set to `false` to skip the extended engines entirely. Defaults to on.
   * Provided so a caller measuring the base four analysers can isolate them.
   */
  runExtended?: boolean;
}

const defaultDecomposer = new ProofDecomposer();
const defaultGapAnalyzer = new GapAnalyzer();
const defaultCircularDetector = new CircularReasoningDetector();
const defaultInconsistencyDetector = new InconsistencyDetector();

/**
 * The proof-carrying fields, gathered from across the mode-specific thought
 * types. Only `Thought`'s common fields are statically available here, so this
 * view names the optional fields the wrapper reads instead of reaching for
 * `any`. Every field is optional: any given thought carries at most a few.
 */
interface ProofBearingView {
  thoughtType?: string;
  theorems?: Theorem[];
  proofStrategy?: ProofStrategy;
  decomposition?: ProofDecomposition;
  gapAnalysis?: GapAnalysis;
  proof?: LogicalProof;
}

function proofFields(thought: Thought): ProofBearingView {
  return thought as unknown as ProofBearingView;
}

/** Proof content located on a thought, before any cost cap is applied. */
interface ProofContent {
  source: ProofAnalysisSource;
  steps: ProofStep[];
  theorem?: string;
}

function toSteps(statements: string[]): ProofStep[] {
  return statements
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((content) => ({ content }));
}

function splitText(text: string): ProofStep[] {
  return toSteps(text.split(STATEMENT_SPLIT));
}

/**
 * Locate proof content on a thought.
 *
 * The gate is the PRESENCE OF PROOF CONTENT, not the mode alone: a
 * mathematics thought whose content is one sentence, or whose thought type is
 * `numerical_analysis`, carries no proof and is skipped.
 *
 * @returns The proof content, or `undefined` when the thought carries none
 */
function findProofContent(thought: Thought): ProofContent | undefined {
  const t = proofFields(thought);

  if (thought.mode === ThinkingMode.FORMALLOGIC) {
    const steps = t.proof?.steps;
    if (Array.isArray(steps) && steps.length >= MIN_PROOF_STATEMENTS) {
      return {
        source: "formallogic.proof.steps",
        theorem: t.proof?.theorem,
        steps: steps.map((s) => ({
          content: s.statement,
          justification: s.justification,
          latex: s.latex,
        })),
      };
    }
  }

  if (
    thought.mode !== ThinkingMode.MATHEMATICS &&
    thought.mode !== ThinkingMode.FORMALLOGIC
  ) {
    return undefined;
  }

  // An explicit theorem proof is the least ambiguous signal available.
  const theoremWithProof = (t.theorems ?? []).find(
    (th) => typeof th?.proof === "string" && th.proof.trim().length > 0,
  );
  if (theoremWithProof?.proof) {
    const steps = splitText(theoremWithProof.proof);
    if (steps.length >= MIN_PROOF_STATEMENTS) {
      return {
        source: "theorem.proof",
        theorem: theoremWithProof.statement,
        steps,
      };
    }
  }

  // A proof strategy carries its steps as an array already.
  const strategySteps = t.proofStrategy?.steps;
  if (
    Array.isArray(strategySteps) &&
    strategySteps.length >= MIN_PROOF_STATEMENTS
  ) {
    return { source: "proofStrategy.steps", steps: toSteps(strategySteps) };
  }

  // Fall back to the thought content, but only for thought types that are
  // supposed to contain an argument.
  const isProofBearingType =
    thought.mode === ThinkingMode.FORMALLOGIC
      ? t.thoughtType === "proof_construction"
      : t.thoughtType !== undefined &&
        PROOF_BEARING_MATH_TYPES.has(t.thoughtType);

  if (isProofBearingType && typeof thought.content === "string") {
    const steps = splitText(thought.content);
    if (steps.length >= MIN_PROOF_STATEMENTS) {
      return { source: "thought.content", steps };
    }
  }

  return undefined;
}

/**
 * Analyse the proof a thought carries and return bounded, non-throwing
 * feedback.
 *
 * @param thought - The thought to analyse
 * @param deps - Analysers to use (defaults to the shared `src/proof/` engines)
 * @returns Advisory proof analysis; `undefined` when the thought carries no
 *   proof content, `available: false` when an analyser failed
 */
export function analyzeProofAdvisory(
  thought: Thought,
  deps: ProofAnalysisDeps = {},
): AdvisoryProofAnalysis | undefined {
  const supplied = proofFields(thought).decomposition;
  const content = findProofContent(thought);

  // A caller-supplied decomposition is itself proof content, so it alone is
  // enough to run on.
  if (!supplied && !content) return undefined;

  const decomposer = deps.decomposer ?? defaultDecomposer;
  const gapAnalyzer = deps.gapAnalyzer ?? defaultGapAnalyzer;
  const circularDetector = deps.circularDetector ?? defaultCircularDetector;
  const inconsistencyDetector =
    deps.inconsistencyDetector ?? defaultInconsistencyDetector;

  const allSteps = content?.steps ?? [];
  const analysedSteps = allSteps.slice(0, MAX_PROOF_STEPS);

  try {
    // The caller's decomposition is REUSED, never recomputed and never
    // overwritten: they may have produced it with far better information than
    // the regex decomposer can recover from text.
    const decomposition =
      supplied ?? decomposer.decompose(analysedSteps, content?.theorem);

    const suppliedGaps = proofFields(thought).gapAnalysis;
    const gapAnalysis = suppliedGaps ?? gapAnalyzer.analyzeGaps(decomposition);
    const circular = circularDetector.detectCircularReasoning(decomposition);
    const inconsistencies = inconsistencyDetector.analyze(decomposition);

    const atoms = decomposition.atoms ?? [];
    const gaps = gapAnalysis.gaps ?? [];
    const assumptions = gapAnalysis.implicitAssumptions ?? [];
    const suggestions = gapAnalysis.suggestions ?? [];
    const unjustified = gapAnalysis.unjustifiedSteps ?? [];
    const cycles = circular.cycles ?? [];

    const truncated = {
      input: allSteps.length > analysedSteps.length,
      atoms: atoms.length > MAX_PROOF_ATOMS,
      gaps: gaps.length > MAX_PROOF_GAPS,
      implicitAssumptions: assumptions.length > MAX_PROOF_ASSUMPTIONS,
      inconsistencies: inconsistencies.length > MAX_PROOF_INCONSISTENCIES,
      cycles: cycles.length > MAX_PROOF_CYCLES,
      suggestions: suggestions.length > MAX_PROOF_NOTES,
      unjustifiedSteps: unjustified.length > MAX_PROOF_NOTES,
      any: false,
    };
    truncated.any = Object.values(truncated).some((v) => v === true);

    // When the caller supplied a decomposition there are no raw steps to feed
    // the step-based engines, so reconstitute them from the atoms. Without
    // this, a caller-supplied decomposition silently got verification,
    // branch and fallacy analysis over an empty proof.
    const extendedSteps: ProofStep[] =
      analysedSteps.length > 0
        ? analysedSteps
        : atoms.map((a) => ({
            content: a.statement,
            justification: a.justification,
            latex: a.latex,
          }));

    const extended =
      deps.runExtended === false
        ? undefined
        : analyzeProofExtended(
            decomposition,
            extendedSteps,
            decomposition.theorem ?? content?.theorem,
            deps.extended,
          );

    return {
      available: true,
      source: supplied ? "caller.decomposition" : content!.source,
      decompositionSource: supplied ? "caller-supplied" : "derived",
      theorem: decomposition.theorem ?? content?.theorem,
      completeness: decomposition.completeness,
      rigorLevel: decomposition.rigorLevel,
      maxDependencyDepth: decomposition.maxDependencyDepth,
      gapCompleteness: gapAnalysis.completeness,
      stepsAnalyzed: supplied ? atoms.length : analysedSteps.length,
      atoms: atoms.slice(0, MAX_PROOF_ATOMS),
      gaps: gaps.slice(0, MAX_PROOF_GAPS),
      implicitAssumptions: assumptions.slice(0, MAX_PROOF_ASSUMPTIONS),
      suggestions: suggestions.slice(0, MAX_PROOF_NOTES),
      unjustifiedSteps: unjustified.slice(0, MAX_PROOF_NOTES),
      hasCircularReasoning: circular.hasCircularReasoning,
      circularSummary: circular.summary,
      cycles: cycles.slice(0, MAX_PROOF_CYCLES),
      inconsistencies: inconsistencies.slice(0, MAX_PROOF_INCONSISTENCIES),
      totals: {
        steps: supplied ? atoms.length : allSteps.length,
        atoms: atoms.length,
        gaps: gaps.length,
        implicitAssumptions: assumptions.length,
        inconsistencies: inconsistencies.length,
        cycles: cycles.length,
        suggestions: suggestions.length,
        unjustifiedSteps: unjustified.length,
      },
      truncated,
      extended,
    };
  } catch (error) {
    return {
      available: false,
      reason: `Proof analysis unavailable: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
