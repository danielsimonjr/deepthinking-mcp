"""
test_skill_invariants.py — validate per-mode rules that JSON Schema cannot enforce.

The canonical catalog of these rules is docs/SKILL-INVARIANTS.md. A given
mode's JSON Schema defines the SHAPE of a valid thought, but cannot express
constraints like "exactly one element of this array has isActual=true" or
"the conclusion's confidence must not exceed the minimum in its derivation
chain". Those invariants live in the skill prose (skills/think-<category>/
SKILL.md) and are expected to be followed by the model.

This test walks both test/samples/<mode>-valid.json (the hand-crafted
reference fixtures, always checked) and test/smoke/captured/<mode>-parsed.json
(the last real Claude output, checked only if present) and applies the
invariant check for each relevant mode. It complements test/harness.py:

  - harness.py    : does the thought MATCH the schema?
  - this file     : does the thought HONOR the schema-unenforceable rules?

Exit 0 if every applicable file satisfies its invariant; exit non-zero on
any failure with a clear per-check report.

Run with `python test/test_skill_invariants.py` — no pytest, no unittest,
plain stdlib. Do NOT run with `python -O` since any `assert` usage would be
stripped (the test uses explicit if/return instead for safety).
"""

import json
import re
import sys
from pathlib import Path

PLUGIN_ROOT = Path(__file__).parent.parent
SAMPLES_DIR = PLUGIN_ROOT / "test" / "samples"
CAPTURED_DIR = PLUGIN_ROOT / "test" / "smoke" / "captured"


# ---------------------------------------------------------------------------
# Per-mode invariant checks
#
# Each function takes a parsed thought (dict) and returns (ok, reason).
# A return of (True, "...") means the invariant is satisfied.
# A return of (False, "...") means the invariant was violated; the reason
# string should be concrete enough to diagnose the specific violation.
#
# Array-of-thoughts modes (sequential, shannon, hybrid) are handled at the
# dispatch layer below — none of the 6 invariant-bearing modes is an
# array-of-thoughts mode, so the check functions only handle dict input.
# ---------------------------------------------------------------------------


def check_abductive(thought: dict) -> tuple[bool, str]:
    """≥2 hypotheses with non-equal scores + abductionSteps[] referential integrity (v0.5.4+).

    Two distinct classes of invariant:

    (1) Base cardinality/distinctness rule (original, pre-v0.5.4):
        JSON Schema has only `hypotheses.minItems: 1` on abductive, which is
        under-constrained. A thought with a single hypothesis is not
        abduction (abduction is inference to the BEST explanation and needs
        at least one competitor). Two hypotheses with IDENTICAL scores are
        also insufficient — the whole point is a preference ordering.

    (2) Referential integrity for the optional abductionSteps[] field
        (v0.5.4+). When populated, each step must satisfy:

        2a. Sequential unique step numbers 1..N.
        2b. stepsUsed[] must reference existing earlier steps only
            (values in [1, stepNumber-1]).
        2c. triggerObservation (if non-null) must match an id in the
            top-level observations[] array.
        2d. Every id in hypothesesGenerated[] must match an id in the
            top-level hypotheses[] array.
        2e. Every id in hypothesesEliminated[] must match an id in the
            top-level hypotheses[] array.
        2f. Every step must do something — at least one of
            hypothesesGenerated[], hypothesesEliminated[], or stepsUsed[]
            must be non-empty.
        2g. Chain closure: if bestExplanation is present, its id must
            appear in at least one step's hypothesesGenerated[] — the
            committed hypothesis must have been explicitly introduced
            during the stepwise abduction process, not pulled from nowhere.
        2h. Commitment coherence: the committed bestExplanation.id must
            NOT appear in any step's hypothesesEliminated[]. Generating a
            hypothesis and then eliminating it, only to commit to it as
            the final answer, is internally inconsistent.
        2i. No duplicate generation: each hypothesis id may appear in at
            most one step's hypothesesGenerated[] across the entire
            chain. "Generating" an already-introduced hypothesis is
            semantically empty.
        2j. No re-generation after elimination: once a hypothesis is
            listed in some step's hypothesesEliminated[], no later step
            may list it in hypothesesGenerated[]. This blocks silent
            rehabilitation; if the reasoner decides an elimination was
            wrong, the honest move is to author a new thought.

    Thoughts that omit abductionSteps[] entirely are exempt from class (2)
    but still subject to class (1).
    """
    # ---- Class 1: the original ≥2-distinct-scores rule ----
    hyps = thought.get("hypotheses")
    if not isinstance(hyps, list):
        return False, "no hypotheses array"
    if len(hyps) < 2:
        return False, (
            f"abductive requires ≥2 hypotheses, got {len(hyps)} — "
            "a single hypothesis is not abduction"
        )
    # Distinguish "missing scores" from "equal scores" — they warrant
    # different error messages. The schema requires `score` on every
    # hypothesis, so a missing score would typically fail schema validation
    # first; this check is defensive for the case where the schema pass
    # somehow lets a scoreless hypothesis through.
    scores_present = []
    missing_count = 0
    for h in hyps:
        if not isinstance(h, dict):
            continue
        s = h.get("score")
        if s is None:
            missing_count += 1
        else:
            scores_present.append(s)
    if missing_count > 0:
        return False, (
            f"abductive: {missing_count} of {len(hyps)} hypotheses lack a "
            "`score` field — the schema requires a score on every hypothesis "
            "so this should have failed schema validation first"
        )
    if len(set(scores_present)) < 2:
        return False, (
            f"abductive requires hypotheses with non-equal scores, got "
            f"{scores_present} — abduction is a preference ordering, not a tie"
        )

    # ---- Class 2: abductionSteps[] referential integrity (v0.5.4+) ----
    steps = thought.get("abductionSteps")
    if not isinstance(steps, list) or len(steps) == 0:
        return True, "ok (no abductionSteps to check)"

    # Pre-index the observation and hypothesis id sets for O(1) lookups.
    obs_ids = {
        o.get("id")
        for o in thought.get("observations", [])
        if isinstance(o, dict) and isinstance(o.get("id"), str)
    }
    hyp_ids = {
        h.get("id")
        for h in hyps
        if isinstance(h, dict) and isinstance(h.get("id"), str)
    }

    # Rule 2a: sequential unique step numbers 1..N
    expected_numbers = list(range(1, len(steps) + 1))
    actual_numbers = [s.get("stepNumber") for s in steps if isinstance(s, dict)]
    if actual_numbers != expected_numbers:
        return False, (
            f"abductive abductionSteps[] stepNumbers must be sequential "
            f"1..{len(steps)}, got {actual_numbers} — step numbers must be "
            "unique, starting at 1, and increment by 1 with no gaps"
        )

    # Rules 2b-2f + 2i + 2j: per-step integrity. Track running sets for
    # duplicate-generation and re-generation-after-elimination checks.
    all_generated_ids: set = set()
    all_eliminated_ids: set = set()
    for s in steps:
        if not isinstance(s, dict):
            continue
        num = s.get("stepNumber")

        # Rule 2b: stepsUsed[] must reference existing earlier steps only
        steps_used = s.get("stepsUsed", [])
        if isinstance(steps_used, list):
            for ref in steps_used:
                if isinstance(ref, int) and (ref < 1 or ref >= num):
                    return False, (
                        f"abductive abductionSteps[{num}] stepsUsed={steps_used} "
                        f"contains invalid reference {ref} (must be in range "
                        f"[1, {num - 1}]) — a step can only reference strictly "
                        "earlier, existing steps"
                    )

        # Rule 2c: triggerObservation must reference a valid observation id
        trig = s.get("triggerObservation")
        if isinstance(trig, str) and trig not in obs_ids:
            return False, (
                f"abductive abductionSteps[{num}] triggerObservation={trig!r} "
                f"does not match any id in observations[] — valid ids are "
                f"{sorted(obs_ids) or '[]'}"
            )

        # Rule 2d: hypothesesGenerated[] ids must reference valid hypotheses
        # Rule 2i: no duplicate generation across the chain
        # Rule 2j: no re-generation of a previously-eliminated hypothesis
        gen = s.get("hypothesesGenerated", [])
        if isinstance(gen, list):
            for hid in gen:
                if isinstance(hid, str):
                    if hid not in hyp_ids:
                        return False, (
                            f"abductive abductionSteps[{num}] hypothesesGenerated "
                            f"contains id {hid!r} that does not match any id in "
                            f"hypotheses[] — valid ids are {sorted(hyp_ids)}"
                        )
                    if hid in all_generated_ids:
                        return False, (
                            f"abductive abductionSteps[{num}] hypothesesGenerated "
                            f"contains id {hid!r} that was already generated by "
                            f"an earlier step — each hypothesis may appear in "
                            f"hypothesesGenerated[] at most once across the chain"
                        )
                    if hid in all_eliminated_ids:
                        return False, (
                            f"abductive abductionSteps[{num}] hypothesesGenerated "
                            f"contains id {hid!r} that was eliminated by an earlier "
                            f"step — re-generating an eliminated hypothesis is a "
                            f"silent rehabilitation; author a new thought instead"
                        )
                    all_generated_ids.add(hid)

        # Rule 2e: hypothesesEliminated[] ids must reference valid hypotheses
        elim = s.get("hypothesesEliminated", [])
        if isinstance(elim, list):
            for hid in elim:
                if isinstance(hid, str):
                    if hid not in hyp_ids:
                        return False, (
                            f"abductive abductionSteps[{num}] hypothesesEliminated "
                            f"contains id {hid!r} that does not match any id in "
                            f"hypotheses[] — valid ids are {sorted(hyp_ids)}"
                        )
                    all_eliminated_ids.add(hid)

        # Rule 2f: step must do something
        gen_empty = not isinstance(gen, list) or len(gen) == 0
        elim_empty = not isinstance(elim, list) or len(elim) == 0
        steps_empty = not isinstance(steps_used, list) or len(steps_used) == 0
        if gen_empty and elim_empty and steps_empty:
            return False, (
                f"abductive abductionSteps[{num}] has hypothesesGenerated[], "
                "hypothesesEliminated[], and stepsUsed[] all empty — every "
                "step must do something (generate candidates, rule some out, "
                "or build on a prior step); a free-standing assertion is not "
                "an abduction step"
            )

    # Rule 2g: chain closure — bestExplanation.id must have been introduced
    # somewhere in the step process. The abductive analog of deductive's
    # "final step's intermediateConclusion matches top-level conclusion".
    # Rule 2h: commitment coherence — bestExplanation.id must NOT have been
    # eliminated at any step. Generating a hypothesis, eliminating it, and
    # then committing to it is internally inconsistent.
    best = thought.get("bestExplanation")
    if isinstance(best, dict):
        best_id = best.get("id")
        if isinstance(best_id, str):
            if best_id not in all_generated_ids:
                return False, (
                    f"abductive bestExplanation.id={best_id!r} was never "
                    f"introduced by any step's hypothesesGenerated[] — the "
                    f"committed hypothesis must have been explicitly generated "
                    f"during the stepwise abduction process. Generated ids "
                    f"across all steps: {sorted(all_generated_ids) or '[]'}"
                )
            if best_id in all_eliminated_ids:
                return False, (
                    f"abductive bestExplanation.id={best_id!r} appears in some "
                    f"step's hypothesesEliminated[] — cannot commit to a "
                    f"hypothesis that the chain ruled out. Either remove the "
                    f"elimination or commit to a different hypothesis. "
                    f"Eliminated ids across all steps: "
                    f"{sorted(all_eliminated_ids)}"
                )
    return True, "ok"


def check_counterfactual(thought: dict) -> tuple[bool, str]:
    """Exactly one condition with isIntervention=True per counterfactual scenario.

    JSON Schema cannot express "exactly N of this kind". The rule: a
    counterfactual scenario isolates ONE intervention against the actual
    baseline; multiple simultaneous interventions break isolation and make
    the analysis unfalsifiable (you can't tell which change caused which
    outcome). A counterfactual thought may contain multiple scenarios in the
    top-level counterfactuals[] array, and each scenario must have exactly
    one intervention.
    """
    counterfactuals = thought.get("counterfactuals")
    if not isinstance(counterfactuals, list):
        return False, "no counterfactuals array"
    if len(counterfactuals) == 0:
        return False, (
            "counterfactual requires at least one scenario in the "
            "counterfactuals array — a counterfactual thought with zero "
            "scenarios has nothing to compare against the actual baseline"
        )
    for i, cf in enumerate(counterfactuals):
        if not isinstance(cf, dict):
            continue
        conds = cf.get("conditions")
        if not isinstance(conds, list):
            return False, f"counterfactuals[{i}] has no conditions array"
        iv_count = sum(
            1 for c in conds if isinstance(c, dict) and c.get("isIntervention") is True
        )
        if iv_count != 1:
            label = cf.get("id") or f"index {i}"
            return False, (
                f"counterfactuals[{label}] has {iv_count} interventions, "
                "must be exactly 1 (one intervention per scenario)"
            )
    return True, "ok"


def check_historical(thought: dict) -> tuple[bool, str]:
    """Patterns with verdictApplies=True require ≥2 distinct episodes.

    JSON Schema has `patterns.items.episodes.minItems: 1`, which is correct
    for REJECTED patterns (verdictApplies=False — you considered one similar
    incident and explained why the pattern doesn't actually apply) but
    under-constrained for ASSERTED patterns (verdictApplies=True — you're
    claiming a generalization from the data). A generalization from n=1 is
    an anecdote, not a pattern.

    Patterns without a verdictApplies field, or with verdictApplies=False,
    are exempt from this check — only the assertive case triggers the rule.
    """
    patterns = thought.get("patterns")
    if not isinstance(patterns, list):
        return True, "ok (no patterns to check)"
    for i, p in enumerate(patterns):
        if not isinstance(p, dict):
            continue
        # Only assertive patterns trigger the rule. Rejected or unverdicted
        # patterns are exempt because they are not claiming a generalization.
        if p.get("verdictApplies") is not True:
            continue
        episodes = p.get("episodes")
        if not isinstance(episodes, list) or len(episodes) < 2:
            label = p.get("id") or f"index {i}"
            count = len(episodes) if isinstance(episodes, list) else 0
            return False, (
                f"historical pattern[{label}] is asserted (verdictApplies=True) "
                f"but has {count} episode(s); asserted patterns require ≥2 "
                "distinct episodes (one is anecdote, not pattern)"
            )
    return True, "ok"


def check_modal(thought: dict) -> tuple[bool, str]:
    """Exactly one world in possibleWorlds has isActual=True.

    JSON Schema cannot express "exactly N true values across array elements".
    Modal reasoning requires a single distinguished ground-truth world to
    anchor the possibility/necessity relations; having zero actual worlds
    means no anchor, and having multiple actual worlds means the model has
    no referent for "what actually happened" vs the alternatives.

    Consistency check: if the thought also has a top-level `actualWorld`
    field (a string reference), its value should match the `id` of the world
    with isActual=True. Mismatch is a softer violation — reported but still
    counts as a failure since it indicates the two signals disagree.
    """
    worlds = thought.get("possibleWorlds")
    if not isinstance(worlds, list):
        return False, "no possibleWorlds array"
    actual_worlds = [
        w for w in worlds if isinstance(w, dict) and w.get("isActual") is True
    ]
    if len(actual_worlds) != 1:
        return False, (
            f"modal requires exactly 1 world with isActual=True, "
            f"got {len(actual_worlds)} — modal reasoning needs a single "
            "distinguished ground-truth world"
        )
    # Secondary consistency: the top-level actualWorld reference should point
    # to the world marked isActual. A mismatch indicates the thought is
    # internally inconsistent even though both fields individually validate.
    actual_world_ref = thought.get("actualWorld")
    if isinstance(actual_world_ref, str):
        marked_id = actual_worlds[0].get("id")
        if isinstance(marked_id, str) and marked_id != actual_world_ref:
            return False, (
                f"modal has top-level actualWorld={actual_world_ref!r} but the "
                f"world with isActual=True has id={marked_id!r} — these must agree"
            )
    return True, "ok"


def check_firstprinciples(thought: dict) -> tuple[bool, str]:
    """conclusion.certainty must not exceed min(step.confidence in derivation chain).

    A cross-field semantic rule: a first-principles conclusion cannot be MORE
    certain than its weakest supporting step. JSON Schema cannot express
    constraints that compare values across different fields of the same
    thought.

    The check:
      1. Read `conclusion.certainty` (the final confidence in the conclusion).
      2. Read `conclusion.derivationChain` (array of step numbers).
      3. For each step number in the chain, look up the matching
         `derivationSteps[i].confidence` and collect them.
      4. If any are present, assert `conclusion.certainty ≤ min(collected)`.

    If the chain is empty, the certainty field is missing, or no steps carry
    confidence values, the check passes (nothing to compare against).
    """
    conc = thought.get("conclusion")
    steps = thought.get("derivationSteps")
    if not isinstance(conc, dict) or not isinstance(steps, list):
        return True, "ok (no conclusion or derivationSteps to check)"
    cert = conc.get("certainty")
    chain = conc.get("derivationChain")
    if cert is None or not isinstance(chain, list):
        return True, "ok (no certainty or chain)"
    # Build two maps: step number → confidence (only when present), and
    # the set of ALL step numbers that actually exist. We need the second
    # to detect broken chain references (chain references a step number
    # that doesn't exist in derivationSteps at all).
    step_numbers_present = set()
    step_confs_by_num: dict = {}
    for s in steps:
        if not isinstance(s, dict):
            continue
        num = s.get("stepNumber")
        if num is None:
            continue
        step_numbers_present.add(num)
        conf = s.get("confidence")
        if conf is not None:
            step_confs_by_num[num] = conf
    # Detect chain entries that point to step numbers that don't exist —
    # this is a referential-integrity bug in the thought even though the
    # schema permits it (JSON Schema can't express cross-field integrity).
    missing_refs = [n for n in chain if n not in step_numbers_present]
    if missing_refs:
        return False, (
            f"firstprinciples conclusion.derivationChain references step "
            f"number(s) {missing_refs} that do not exist in derivationSteps — "
            "broken chain reference"
        )
    chain_confs = [step_confs_by_num[n] for n in chain if n in step_confs_by_num]
    if not chain_confs:
        return True, "ok (chain resolves but no confidence values to compare)"
    min_conf = min(chain_confs)
    if cert > min_conf:
        return False, (
            f"firstprinciples conclusion.certainty ({cert}) > min step "
            f"confidence ({min_conf}) in chain — conclusion cannot be more "
            "certain than its weakest derivation step"
        )
    return True, "ok"


# Regexes for the bayesian check — compiled once at module load.
# _BAYESIAN_NUMBER_RE matches a numeric sequence (integer or decimal); real
# arithmetic requires AT LEAST TWO numbers so we can verify operands exist,
# not just a result. _BAYESIAN_ARITH_OP_RE matches TRUE arithmetic operators
# (NOT `=` — equals alone appears in prose like "probability = high" which
# isn't arithmetic). Unicode × and ÷ are included because Claude commonly
# emits them in math output instead of the ASCII * and /.
_BAYESIAN_NUMBER_RE = re.compile(r"\d+(?:\.\d+)?")
_BAYESIAN_ARITH_OP_RE = re.compile(r"[+\-*/×÷]")


def check_bayesian(thought: dict) -> tuple[bool, str]:
    """posterior.calculation must show arithmetic, not just a final number.

    A skill-prose rule: the bayesian worked output is supposed to be
    auditable — readers and verifiers need to see the math, not just the
    result. A calculation field containing only "0.66" or "probability =
    high" is formally valid JSON but defeats the purpose of the mode.

    Heuristic check (the invariant is qualitative, so we approximate):
      1. The calculation field must be a non-empty string ≥ 10 characters.
      2. It must contain at least TWO distinct numeric sequences (the
         operands of arithmetic, not just a single result value).
      3. It must contain at least one TRUE arithmetic operator from
         {+, -, *, /, ×, ÷} — the equals sign alone is insufficient because
         prose like "probability = high" would otherwise pass.

    This won't catch every evasion (a well-crafted non-arithmetic string
    with two numbers and a dash could satisfy all three), but it catches
    the common failure modes: a bare result, a prose summary, or a
    single-number statement.
    """
    post = thought.get("posterior")
    if not isinstance(post, dict):
        return False, "no posterior object"
    calc = post.get("calculation")
    if not isinstance(calc, str):
        return (
            False,
            f"bayesian.posterior.calculation must be a string, got {type(calc).__name__}",
        )
    if len(calc.strip()) < 10:
        return False, (
            f"bayesian.posterior.calculation too short to be arithmetic: {calc!r}"
        )
    numbers = _BAYESIAN_NUMBER_RE.findall(calc)
    if len(numbers) < 2:
        return False, (
            f"bayesian.posterior.calculation must contain ≥2 numbers to show "
            f"arithmetic (found {len(numbers)}: {numbers}): {calc!r}"
        )
    if not _BAYESIAN_ARITH_OP_RE.search(calc):
        return False, (
            f"bayesian.posterior.calculation has no arithmetic operator "
            f"from {{+, -, *, /, ×, ÷}} — '=' alone is not arithmetic: {calc!r}"
        )
    return True, "ok"


def check_deductive(thought: dict) -> tuple[bool, str]:
    """Referential integrity of derivationSteps[] (v0.5.2+).

    The optional `derivationSteps[]` field was added in v0.5.2 to support
    multi-step deductive chains. The schema validates the SHAPE of each
    step (stepNumber, premisesUsed, stepsUsed, intermediateConclusion,
    inferenceRule) but cannot express the cross-field semantic rules:

      1. Sequential unique step numbers. Numbers must be 1, 2, 3, ... with
         no gaps or duplicates.
      2. No forward references. A step's stepsUsed[] may only reference
         step numbers STRICTLY LESS THAN its own stepNumber.
      3. Valid premise indices. Every integer in premisesUsed[] must be a
         valid 0-indexed position into the top-level premises[] array.
      4. Every step must derive from something. At least one of
         premisesUsed[] or stepsUsed[] must be non-empty — a step with no
         inputs has nothing to apply its inferenceRule to.
      5. Final step closes the chain. The final step's intermediateConclusion
         must match the top-level `conclusion` string. Otherwise the chain
         does not actually derive what the thought claims.

    If derivationSteps is absent or empty, the check is skipped (atomic
    single-jump deductions are the default and don't need the array).
    """
    steps = thought.get("derivationSteps")
    if not isinstance(steps, list) or len(steps) == 0:
        return True, "ok (no derivationSteps to check)"
    premises = thought.get("premises", [])
    n_premises = len(premises) if isinstance(premises, list) else 0

    # Rule 1: sequential unique step numbers 1..N
    expected_numbers = list(range(1, len(steps) + 1))
    actual_numbers = [s.get("stepNumber") for s in steps if isinstance(s, dict)]
    if actual_numbers != expected_numbers:
        return False, (
            f"deductive derivationSteps[] stepNumbers must be sequential "
            f"1..{len(steps)}, got {actual_numbers} — step numbers must be "
            "unique, starting at 1, and increment by 1 with no gaps"
        )

    # Rules 2, 3, 4: per-step referential integrity
    for s in steps:
        if not isinstance(s, dict):
            continue
        num = s.get("stepNumber")
        # Rule 2: stepsUsed[] must reference existing earlier steps only.
        # Valid range is [1, num-1]: step numbers start at 1 (Rule 1), and
        # no forward or self references are allowed. A ref of 0 or negative
        # points to a step that doesn't exist; a ref >= num is forward/self.
        steps_used = s.get("stepsUsed", [])
        if isinstance(steps_used, list):
            for ref in steps_used:
                if isinstance(ref, int) and (ref < 1 or ref >= num):
                    return False, (
                        f"deductive derivationSteps[{num}] stepsUsed={steps_used} "
                        f"contains invalid reference {ref} (must be in range "
                        f"[1, {num - 1}]) — a step can only reference strictly "
                        "earlier, existing steps"
                    )
        # Rule 3: premisesUsed[] indices must be valid
        prems_used = s.get("premisesUsed", [])
        if isinstance(prems_used, list):
            for idx in prems_used:
                if isinstance(idx, int) and (idx < 0 or idx >= n_premises):
                    return False, (
                        f"deductive derivationSteps[{num}] premisesUsed={prems_used} "
                        f"contains invalid index {idx} — premises has length "
                        f"{n_premises}, valid indices are 0..{n_premises - 1}"
                    )
        # Rule 4: step must derive from at least one premise or prior step.
        # A step with both arrays empty has no input to apply inferenceRule
        # to — it would be a free-standing assertion, not a derivation.
        prems_empty = not isinstance(prems_used, list) or len(prems_used) == 0
        steps_empty = not isinstance(steps_used, list) or len(steps_used) == 0
        if prems_empty and steps_empty:
            return False, (
                f"deductive derivationSteps[{num}] has both premisesUsed[] and "
                "stepsUsed[] empty — every step must derive from at least one "
                "premise or prior step, otherwise it has no input to apply "
                "the inferenceRule to"
            )

    # Rule 5: final step's intermediateConclusion closes the chain
    final_step = steps[-1] if isinstance(steps[-1], dict) else None
    top_conclusion = thought.get("conclusion")
    if final_step is not None and isinstance(top_conclusion, str):
        final_ic = final_step.get("intermediateConclusion")
        if isinstance(final_ic, str):
            # Normalize whitespace so trailing newlines / double spaces don't
            # cause false positives. We require exact-after-normalization
            # match — anything weaker would let subtly different strings slip
            # through (e.g., "Post P has an author" vs "Post P has an author.").
            norm_ic = " ".join(final_ic.split()).rstrip(".")
            norm_top = " ".join(top_conclusion.split()).rstrip(".")
            if norm_ic != norm_top:
                return False, (
                    f"deductive final derivationSteps[{len(steps)}]."
                    f"intermediateConclusion={final_ic!r} does not match "
                    f"top-level conclusion={top_conclusion!r} — the chain "
                    "must derive exactly what the thought claims"
                )
    return True, "ok"


def check_inductive(thought: dict) -> tuple[bool, str]:
    """Referential integrity of inductionSteps[] (v0.5.3+).

    The optional `inductionSteps[]` field was added in v0.5.3 to support
    progressive-refinement, Mill's-methods, and hierarchical multi-step
    inductions. The schema validates the SHAPE of each step (stepNumber,
    observationsUsed, stepsUsed, intermediateGeneralization, inductionMethod)
    but cannot express the cross-field semantic rules:

      1. Sequential unique step numbers. Numbers must be 1, 2, 3, ... with
         no gaps or duplicates.
      2. No forward references. A step's stepsUsed[] may only reference
         existing prior step numbers (values in [1, stepNumber-1]).
      3. Valid observation indices. Every integer in observationsUsed[]
         must be a valid 0-indexed position into the top-level
         observations[] array.
      4. Every step must derive from something. At least one of
         observationsUsed[] or stepsUsed[] must be non-empty — a step with
         no inputs has nothing to apply its inductionMethod to.
      5. Final step closes the chain. The final step's
         intermediateGeneralization must match the top-level
         generalization string. Otherwise the chain does not actually
         derive what the thought claims.

    If inductionSteps is absent or empty, the check is skipped (atomic
    single-jump inductions are the default and don't need the array).
    Intentionally does NOT enforce "each step's intermediateGeneralization
    is different from the previous" — that's a SKILL.md prose rule, not a
    referential-integrity rule, because the "meaningfully different" check
    is semantic and fuzzy.
    """
    steps = thought.get("inductionSteps")
    if not isinstance(steps, list) or len(steps) == 0:
        return True, "ok (no inductionSteps to check)"
    observations = thought.get("observations", [])
    n_obs = len(observations) if isinstance(observations, list) else 0

    # Rule 1: sequential unique step numbers 1..N
    expected_numbers = list(range(1, len(steps) + 1))
    actual_numbers = [s.get("stepNumber") for s in steps if isinstance(s, dict)]
    if actual_numbers != expected_numbers:
        return False, (
            f"inductive inductionSteps[] stepNumbers must be sequential "
            f"1..{len(steps)}, got {actual_numbers} — step numbers must be "
            "unique, starting at 1, and increment by 1 with no gaps"
        )

    # Rules 2, 3, 4: per-step referential integrity
    for s in steps:
        if not isinstance(s, dict):
            continue
        num = s.get("stepNumber")
        # Rule 2: stepsUsed[] must reference existing earlier steps only
        steps_used = s.get("stepsUsed", [])
        if isinstance(steps_used, list):
            for ref in steps_used:
                if isinstance(ref, int) and (ref < 1 or ref >= num):
                    return False, (
                        f"inductive inductionSteps[{num}] stepsUsed={steps_used} "
                        f"contains invalid reference {ref} (must be in range "
                        f"[1, {num - 1}]) — a step can only reference strictly "
                        "earlier, existing steps"
                    )
        # Rule 3: observationsUsed[] indices must be valid
        obs_used = s.get("observationsUsed", [])
        if isinstance(obs_used, list):
            for idx in obs_used:
                if isinstance(idx, int) and (idx < 0 or idx >= n_obs):
                    return False, (
                        f"inductive inductionSteps[{num}] observationsUsed="
                        f"{obs_used} contains invalid index {idx} — observations "
                        f"has length {n_obs}, valid indices are 0..{n_obs - 1}"
                    )
        # Rule 4: step must derive from at least one observation or prior step
        obs_empty = not isinstance(obs_used, list) or len(obs_used) == 0
        steps_empty = not isinstance(steps_used, list) or len(steps_used) == 0
        if obs_empty and steps_empty:
            return False, (
                f"inductive inductionSteps[{num}] has both observationsUsed[] "
                "and stepsUsed[] empty — every step must derive from at least "
                "one observation or prior step, otherwise it has no input to "
                "apply the inductionMethod to"
            )

    # Rule 5: final step's intermediateGeneralization closes the chain
    final_step = steps[-1] if isinstance(steps[-1], dict) else None
    top_gen = thought.get("generalization")
    if final_step is not None and isinstance(top_gen, str):
        final_ig = final_step.get("intermediateGeneralization")
        if isinstance(final_ig, str):
            # Whitespace / trailing-period normalization so minor formatting
            # differences don't cause false positives. Exact match otherwise.
            norm_ig = " ".join(final_ig.split()).rstrip(".")
            norm_top = " ".join(top_gen.split()).rstrip(".")
            if norm_ig != norm_top:
                return False, (
                    f"inductive final inductionSteps[{len(steps)}]."
                    f"intermediateGeneralization={final_ig!r} does not match "
                    f"top-level generalization={top_gen!r} — the chain must "
                    "produce exactly what the thought claims as its top-level "
                    "generalization"
                )
    return True, "ok"


# ---------------------------------------------------------------------------
# Dispatch
# ---------------------------------------------------------------------------

CHECKS = {
    "abductive": check_abductive,
    "counterfactual": check_counterfactual,
    "deductive": check_deductive,
    "historical": check_historical,
    "inductive": check_inductive,
    "modal": check_modal,
    "firstprinciples": check_firstprinciples,
    "bayesian": check_bayesian,
}


def check_file(mode: str, source_label: str, path: Path):
    """Run the mode's invariant check against a single file.

    Returns a tuple (mode, source_label, ok, reason) or None if the file
    doesn't exist (the captured/ source is optional, so missing files are
    not a failure — they're just not checked).
    """
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError, UnicodeDecodeError) as e:
        return (mode, source_label, False, f"ERROR parsing {path.name}: {e}")

    # None of the 6 invariant-bearing modes produces an array-of-thoughts
    # output (those are sequential/shannon/hybrid, which have no invariants
    # in this test). If we see an array anyway, skip the check — the
    # schema-validation harness.py will catch any structural problem.
    # Use None as the ok value to signal "skipped" in the dispatch/summary,
    # distinct from (True, ...) which is a genuine pass.
    if not isinstance(data, dict):
        return (
            mode,
            source_label,
            None,
            "skipped (array-of-thoughts — no invariant applies)",
        )

    check = CHECKS[mode]
    ok, reason = check(data)
    return (mode, source_label, ok, reason)


def main() -> int:
    results = []
    for mode in sorted(CHECKS.keys()):
        sample_path = SAMPLES_DIR / f"{mode}-valid.json"
        captured_path = CAPTURED_DIR / f"{mode}-parsed.json"
        for source_label, path in (
            ("sample", sample_path),
            ("captured", captured_path),
        ):
            r = check_file(mode, source_label, path)
            if r is not None:
                results.append(r)

    if not results:
        print("ERROR: no sample or captured files found for any invariant-bearing mode")
        return 1

    passed = sum(1 for _, _, ok, _ in results if ok is True)
    failed = sum(1 for _, _, ok, _ in results if ok is False)
    skipped = sum(1 for _, _, ok, _ in results if ok is None)

    print(
        f"Running skill-invariant checks on "
        f"{len(CHECKS)} modes ({', '.join(sorted(CHECKS.keys()))}):"
    )
    print()
    # Group by mode for readability; within a mode, show sample first then captured.
    by_mode: dict[str, list] = {}
    for mode, source, ok, reason in results:
        by_mode.setdefault(mode, []).append((source, ok, reason))
    for mode in sorted(by_mode.keys()):
        for source, ok, reason in by_mode[mode]:
            if ok is None:
                marker = "SKIP"
            elif ok:
                marker = "PASS"
            else:
                marker = "FAIL"
            print(f"  [{marker}] {mode:20s} ({source:8s}): {reason}")
    print()
    skipped_note = f" ({skipped} skipped)" if skipped else ""
    print(
        f"===== Summary: {passed}/{passed + failed} invariant checks passed, "
        f"{failed} failed{skipped_note} ====="
    )

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
