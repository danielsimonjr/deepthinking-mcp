/**
 * Type guards vs the `Thought` union, pinned in both directions.
 *
 * Every guard in `src/types/core.ts` is one line — `thought.mode === X` — and
 * they were written by copy-paste. Two failure modes follow from that and
 * neither shows up in normal use:
 *
 *  - a union member with no guard. Consumers that dispatch on guards silently
 *    skip that mode; the exporters' `extractModeSpecific*` chains are exactly
 *    such consumers.
 *  - a guard comparing against the wrong mode. It then returns true for a
 *    second mode, or never returns true at all, and both compile.
 *
 * The table below is checked against `Object.values(ThinkingMode)`, so a new
 * mode without a guard fails here. Each guard is then run against every other
 * mode, so a mis-keyed comparison fails too.
 *
 * `_modesCoverUnion` is the third direction and is a COMPILE-time check: it
 * fails `npm run typecheck`, not this suite, if `ThinkingMode` and the
 * `Thought` union stop describing the same set of modes.
 */

import { describe, it, expect } from 'vitest';
import {
  ThinkingMode,
  type Thought,
  isSequentialThought,
  isShannonThought,
  isMathematicsThought,
  isPhysicsThought,
  isHybridThought,
  isEngineeringThought,
  isComputabilityThought,
  isCryptanalyticThought,
  isAlgorithmicThought,
  isMetaReasoningThought,
  isRecursiveThought,
  isModalThought,
  isStochasticThought,
  isConstraintThought,
  isOptimizationThought,
  isInductiveThought,
  isDeductiveThought,
  isAbductiveThought,
  isCausalThought,
  isBayesianThought,
  isCounterfactualThought,
  isTemporalThought,
  isHistoricalThought,
  isGameTheoryThought,
  isEvidentialThought,
  isAnalogicalThought,
  isFirstPrinciplesThought,
  isSystemsThinkingThought,
  isScientificMethodThought,
  isFormalLogicThought,
  isSynthesisThought,
  isArgumentationThought,
  isCritiqueThought,
  isAnalysisThought,
  isCustomThought,
} from '../../../src/types/core.js';

type Guard = (thought: Thought) => boolean;

const GUARDS: Record<ThinkingMode, Guard> = {
  [ThinkingMode.SEQUENTIAL]: isSequentialThought,
  [ThinkingMode.SHANNON]: isShannonThought,
  [ThinkingMode.MATHEMATICS]: isMathematicsThought,
  [ThinkingMode.PHYSICS]: isPhysicsThought,
  [ThinkingMode.HYBRID]: isHybridThought,
  [ThinkingMode.ENGINEERING]: isEngineeringThought,
  [ThinkingMode.COMPUTABILITY]: isComputabilityThought,
  [ThinkingMode.CRYPTANALYTIC]: isCryptanalyticThought,
  [ThinkingMode.ALGORITHMIC]: isAlgorithmicThought,
  [ThinkingMode.METAREASONING]: isMetaReasoningThought,
  [ThinkingMode.RECURSIVE]: isRecursiveThought,
  [ThinkingMode.MODAL]: isModalThought,
  [ThinkingMode.STOCHASTIC]: isStochasticThought,
  [ThinkingMode.CONSTRAINT]: isConstraintThought,
  [ThinkingMode.OPTIMIZATION]: isOptimizationThought,
  [ThinkingMode.INDUCTIVE]: isInductiveThought,
  [ThinkingMode.DEDUCTIVE]: isDeductiveThought,
  [ThinkingMode.ABDUCTIVE]: isAbductiveThought,
  [ThinkingMode.CAUSAL]: isCausalThought,
  [ThinkingMode.BAYESIAN]: isBayesianThought,
  [ThinkingMode.COUNTERFACTUAL]: isCounterfactualThought,
  [ThinkingMode.TEMPORAL]: isTemporalThought,
  [ThinkingMode.HISTORICAL]: isHistoricalThought,
  [ThinkingMode.GAMETHEORY]: isGameTheoryThought,
  [ThinkingMode.EVIDENTIAL]: isEvidentialThought,
  [ThinkingMode.ANALOGICAL]: isAnalogicalThought,
  [ThinkingMode.FIRSTPRINCIPLES]: isFirstPrinciplesThought,
  [ThinkingMode.SYSTEMSTHINKING]: isSystemsThinkingThought,
  [ThinkingMode.SCIENTIFICMETHOD]: isScientificMethodThought,
  [ThinkingMode.FORMALLOGIC]: isFormalLogicThought,
  [ThinkingMode.SYNTHESIS]: isSynthesisThought,
  [ThinkingMode.ARGUMENTATION]: isArgumentationThought,
  [ThinkingMode.CRITIQUE]: isCritiqueThought,
  [ThinkingMode.ANALYSIS]: isAnalysisThought,
  [ThinkingMode.CUSTOM]: isCustomThought,
};

// The third direction — that `ThinkingMode` and the `Thought` union's `mode`
// discriminant describe the same set — cannot be asserted from here: no runtime
// value carries the union's membership, and `tsconfig.json` excludes `tests/`,
// so a type-level assertion written in this file is never compiled and can
// never fail. It lives in `src/types/core.ts` instead, where `npm run
// typecheck` reaches it.

const ALL_MODES = Object.values(ThinkingMode) as ThinkingMode[];

/** The minimum a guard looks at. Cast because guards only read `mode`. */
const thoughtOfMode = (mode: ThinkingMode): Thought =>
  ({
    id: 'id',
    sessionId: 'session',
    thoughtNumber: 1,
    totalThoughts: 1,
    content: 'content',
    timestamp: new Date(),
    mode,
    nextThoughtNeeded: false,
  }) as Thought;

describe('type guards cover ThinkingMode', () => {
  it('has a guard for every mode, and no guard for a mode that does not exist', () => {
    expect(Object.keys(GUARDS).sort()).toEqual([...ALL_MODES].sort());
  });

  it('uses a distinct guard function per mode', () => {
    // Two modes pointing at the same guard means one mode is unreachable.
    const fns = Object.values(GUARDS);
    expect(new Set(fns).size).toBe(fns.length);
  });

  it.each(ALL_MODES)('the %s guard accepts its own mode', (mode) => {
    expect(GUARDS[mode](thoughtOfMode(mode))).toBe(true);
  });

  it.each(ALL_MODES)('the %s guard rejects every other mode', (mode) => {
    const accepted = ALL_MODES.filter(
      (other) => other !== mode && GUARDS[mode](thoughtOfMode(other)),
    );

    expect(accepted).toEqual([]);
  });

  it('classifies every mode under exactly one guard', () => {
    // The union view of the same property: no mode may fall through all the
    // guards, and none may match two. A consumer chaining `if (isX(t))` over
    // the guards depends on both.
    for (const mode of ALL_MODES) {
      const thought = thoughtOfMode(mode);
      const matches = ALL_MODES.filter((candidate) =>
        GUARDS[candidate](thought),
      );

      expect(matches, `mode ${mode} matched ${matches.length} guards`).toEqual([
        mode,
      ]);
    }
  });
});
