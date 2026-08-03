"""
test_schema_parity.py — cross-check the TS runtime contract against test/schemas/*.json
for the 34 modes the server actually implements (audit finding M-6).

THE PROBLEM THIS CLOSES
========================
After the 9.2.0 plugin merge this repo carries three parallel definitions of each
reasoning mode: (1) the TypeScript runtime types, (2) the skill prompt content under
skills/, (3) the JSON Schemas under test/schemas/*.json used to validate skill-generated
sample outputs. test_artifact_consistency.py cross-checks the skill-layer artifacts
against each other, but never references src/ — a TS field can be renamed or removed and
nothing detects that test/schemas/<mode>.json has silently diverged. This test is that
missing check.

WHAT "THE TS SIDE" MEANS HERE — read before extending this test
=================================================================
The audit's framing named "the Zod validators in src/validation/validators/modes/" as
one of the three definitions. That turned out not to hold up: those files
(e.g. SequentialValidator) are hand-written classes with an imperative `validate()`
method containing business-logic checks (revision consistency, etc.) — they are not
Zod schema objects, and no field set can be mechanically extracted from them.

The Zod schemas that DO exist, under src/tools/schemas/modes/*.ts, are grouped by MCP
*tool* (e.g. one StandardSchema/CoreModeSchema per tool), not by mode: several modes
share one schema with unioned, renamed fields (the tool schema's `thought` is the
mode-type's `content`; a shared schema's fields aren't discriminated per mode). They
describe the *request* shape, not the *thought* shape. They are not a clean 1:1 source
for a per-mode field set either, and generating real JSON Schema from them (the "ideal"
option per the remediation brief) would validate the wrong artifact — the MCP tool
input, not the thought object test/schemas/*.json describes.

The one part of the TS side that DOES match test/schemas/*.json's shape 1:1 is the
mode's `Thought` interface itself: `BaseThought` (src/types/core.ts) plus the
mode-specific `<Mode>Thought extends BaseThought` interface (src/types/core.ts for the
inductive/deductive/abductive triad, src/types/modes/<mode>.ts for the other 31). This
is the object ThoughtFactory/the mode handlers actually construct and SessionManager
stores — the real runtime contract. That is the ground truth this test uses.

HOW THE TS SIDE IS EXTRACTED
=============================
tools/schema-parity/extract-ts-fields.cjs parses those files with the real TypeScript
compiler API (`typescript`, already a devDependency — nothing new added) and prints
{enumMap, baseThoughtFields, modeInterfaces} as JSON. This is a genuine AST parse (not
regex), so multi-line union types, inline JSDoc, etc. don't throw it off — verified
against `constraint.ts`'s multi-line `thoughtType` union. It does NOT type-check or
resolve imports; it only reads top-level interface member names + optionality, which is
all a field-set diff needs.

WHAT THIS CHECK CATCHES, AND WHAT IT DOES NOT
================================================
This is the "field-name/required-field diff" approximation the remediation brief calls
out as acceptable when full Zod-to-JSON-Schema generation isn't a good fit (see above —
here it plainly isn't, since the tool-level Zod schemas describe a different artifact).

CATCHES (fails the mode):
  - UNKNOWN property in test/schemas/<mode>.json that doesn't correspond to any
    BaseThought field or any field on the mode's own TS interface — e.g. a field that
    was renamed or removed in TS but the schema wasn't updated.
  - A mode-specific TS field (declared directly on `<Mode>Thought`, not inherited) that
    is completely absent from the schema's `properties` — the schema doesn't know a real
    field exists at all.
  - A mode-specific TS field that IS present in the schema but the schema's `required`
    disagrees with TS non-optionality in the direction that matters most: TS says the
    field is mandatory (no `?`) but the schema doesn't list it as `required` — a
    skill could omit it and still validate.

DOES NOT CATCH (by design, and re-verified empirically before shipping this check —
see the README of tools/schema-parity or the commit note for the measurement):
  - A schema omitting an OPTIONAL BaseThought field (e.g. `tags`, `importance`,
    `uncertainty`, `assumptions`). Confirmed this is inconsistent-but-intentional: most
    mode schemas omit these entirely, 7 of 34 include a subset
    (algorithmic/computability/cryptanalytic/hybrid/mathematics/physics/shannon), and
    sequential/shannon/hybrid additionally require the BaseThought fields
    (thoughtNumber/totalThoughts/content/nextThoughtNeeded) that every other mode's
    schema leaves out entirely. There is no TS-derivable rule for which subset a given
    mode "should" include, so this is left as an editorial choice, not drift.
  - A schema requiring a field that TS marks optional (stricter-than-TS). This is
    reported as an INFO line, not a failure — a schema legitimately can narrow what
    counts as a "valid" sample beyond what the type system mandates.
  - Anything about field *types* (string vs array vs enum values, min/max, nesting
    shape) — only field *names* and required-vs-optional are compared. A field that
    keeps its name but silently changes type is NOT caught.
  - The skill prompt layer (skills/**) and the 12 skill-only frameworks modes
    (5w1h, costbenefit, decisionmatrix, fishbone, fivewhys, forcefield, gapanalysis,
    pareto, pestle, riskassessment, stakeholder, swot) — these are intentionally
    TS-less per CHANGELOG 9.2.0 (the server never implemented think-frameworks) and are
    skipped entirely, not treated as drift.

Do NOT run with `python -O` — assertions would be stripped.
"""

import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
SCHEMAS_DIR = REPO_ROOT / "test" / "schemas"
EXTRACTOR = REPO_ROOT / "tools" / "schema-parity" / "extract-ts-fields.cjs"

# Modes that exist only at the skill layer (docs/audits/2026-08-03-audit.md, M-6):
# CHANGELOG 9.2.0 confirms the server never implemented think-frameworks for these.
SKILL_ONLY_MODES = {
    "5w1h",
    "costbenefit",
    "decisionmatrix",
    "fishbone",
    "fivewhys",
    "forcefield",
    "gapanalysis",
    "pareto",
    "pestle",
    "riskassessment",
    "stakeholder",
    "swot",
}


def run_extractor() -> dict:
    """Invoke the TS-compiler-API field extractor and parse its JSON output."""
    if not EXTRACTOR.exists():
        print(f"FAIL: extractor script missing: {EXTRACTOR}")
        sys.exit(1)
    proc = subprocess.run(
        ["node", str(EXTRACTOR), str(REPO_ROOT)],
        capture_output=True,
        text=True,
        cwd=str(REPO_ROOT),
    )
    if proc.returncode != 0:
        print("FAIL: extract-ts-fields.cjs exited non-zero")
        print(proc.stderr)
        sys.exit(1)
    try:
        return json.loads(proc.stdout)
    except json.JSONDecodeError as e:
        print(f"FAIL: extract-ts-fields.cjs did not print valid JSON: {e}")
        print(proc.stdout[:2000])
        sys.exit(1)


def load_schema(mode: str) -> dict:
    path = SCHEMAS_DIR / f"{mode}.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def check_mode(mode: str, ts_data: dict) -> tuple[bool, list[str], list[str]]:
    """
    Compare one mode's TS interface fields against its JSON Schema.

    Returns (ok, failures, info_notes).
    """
    base_fields = set(ts_data["baseThoughtFields"].keys())
    mode_entry = ts_data["modeInterfaces"].get(mode)
    if mode_entry is None:
        return False, [f"no TS interface found for mode '{mode}' (extends BaseThought)"], []

    mode_fields = mode_entry["fields"]  # name -> {"optional": bool}
    mode_field_names = set(mode_fields.keys())
    expected_fields = base_fields | mode_field_names

    schema = load_schema(mode)
    actual_fields = set(schema.get("properties", {}).keys())
    actual_required = set(schema.get("required", []))

    failures: list[str] = []
    info: list[str] = []

    # 1. Schema properties with no TS counterpart at all -> real drift.
    unknown = actual_fields - expected_fields
    if unknown:
        failures.append(
            f"schema has field(s) not found on BaseThought or "
            f"{mode_entry['interfaceName']} ({mode_entry['file']}): {sorted(unknown)}"
        )

    # 2. Mode-specific TS fields entirely missing from the schema -> real drift.
    missing = mode_field_names - actual_fields
    if missing:
        failures.append(
            f"{mode_entry['interfaceName']} field(s) not represented in schema at all: "
            f"{sorted(missing)}"
        )

    # 3. Mode-specific TS-mandatory fields present in the schema but not required there.
    mandatory_mode_fields = {
        name for name, meta in mode_fields.items() if not meta["optional"]
    }
    required_gap = (mandatory_mode_fields & actual_fields) - actual_required
    if required_gap:
        failures.append(
            f"{mode_entry['interfaceName']} marks field(s) mandatory (no '?') but "
            f"schema does not list them as required: {sorted(required_gap)}"
        )

    # 4. INFO only: schema requires a mode-specific field TS marks optional.
    stricter = (actual_required & mode_field_names) - mandatory_mode_fields
    if stricter:
        info.append(
            f"schema requires field(s) TS marks optional (schema is stricter than TS, "
            f"not treated as drift): {sorted(stricter)}"
        )

    return (len(failures) == 0), failures, info


def main() -> int:
    ts_data = run_extractor()

    all_schema_modes = {p.stem for p in SCHEMAS_DIR.glob("*.json")}
    shared_modes = sorted(all_schema_modes - SKILL_ONLY_MODES)

    print(f"TS interfaces extracted: {len(ts_data['modeInterfaces'])}")
    print(f"Schemas found: {len(all_schema_modes)} ({len(SKILL_ONLY_MODES)} skill-only, skipped)")
    print(f"Checking {len(shared_modes)} shared modes for TS <-> schema field parity")
    print()

    failed_modes: list[str] = []
    for mode in shared_modes:
        ok, failures, info = check_mode(mode, ts_data)
        if ok:
            print(f"PASS: {mode}")
        else:
            print(f"FAIL: {mode}")
            failed_modes.append(mode)
            for msg in failures:
                print(f"  - {msg}")
        for msg in info:
            print(f"  (info) {msg}")

    print()
    if failed_modes:
        print(f"{len(failed_modes)}/{len(shared_modes)} mode(s) drifted: {failed_modes}")
        print()
        print(
            "CONTEXT for whoever reads this next (see docs/audits/2026-08-03-audit.md, M-6):\n"
            "  This is the FIRST run of this check, and most of the above failures were\n"
            "  individually investigated, not rubber-stamped. Conclusion: the skill-layer\n"
            "  output contract (skills/**, reference/output-formats/**, test/schemas/**) is\n"
            "  an independently-designed, self-consistent, extensively-documented format for\n"
            "  `/think` skill output — it was NOT built to mirror the internal TS\n"
            "  `<Mode>Thought` runtime type field-for-field, and mostly never did. That is\n"
            "  most visible in the Academic tool group (synthesis/argumentation/critique/\n"
            "  analysis) and the scientificmethod/systemsthinking/formallogic/constraint/\n"
            "  optimization cluster, where the skill schema uses a simpler, hand-designed\n"
            "  shape entirely distinct from the TS type's elaborate nested objects. Smaller\n"
            "  gaps (e.g. abductive's extra `abductionSteps`) also check out as deliberate,\n"
            "  documented skill-only enrichment fields (see skills/think-core/SKILL.md),\n"
            "  not staleness. No test/schemas/*.json edit was made on this run: no case was\n"
            "  found where the TS side is confidently authoritative over the schema.\n"
            "  ACTION NEEDED, not delegable to this check: an explicit decision on whether\n"
            "  the two contracts should be reconciled (real, ADR-level, multi-file work) or\n"
            "  formally documented as intentionally decoupled. Until that lands, wiring this\n"
            "  script into a hard-blocking CI gate will fail on ~23/34 modes for reasons\n"
            "  that are architecture, not bugs — surface that to whoever owns CI wiring\n"
            "  before flipping it on as a release gate."
        )
        return 1
    print(f"All {len(shared_modes)} shared modes are field-parity-consistent between TS and schema")
    return 0


if __name__ == "__main__":
    sys.exit(main())
