"""
test_artifact_consistency.py — verify that every mode has a complete set of artifacts.

Adding a 35th mode requires touching many files (schema, sample, visual grammar,
output-format doc, smoke prompt, router entry, category skill). Auto-discovery
in harness.py/validate-mermaid.py/validate-dot.py is a one-way bridge: they all
iterate what they find, so a missing artifact fails silently ("nothing found,
nothing to test"). This test enforces SET EQUALITY between every mode-scoped
directory and surfaces drift as a clear diff.

The authoritative mode set is `test/schemas/<mode>.json` — every other directory
must match it. If the sets diverge, the test fails and prints the symmetric
difference so you know exactly what to add.

Do NOT run with `python -O` — assertions would be stripped.
"""

import ast
import json
import sys
from pathlib import Path

PLUGIN_ROOT = Path(__file__).parent.parent

SCHEMAS_DIR = PLUGIN_ROOT / "test" / "schemas"
SAMPLES_DIR = PLUGIN_ROOT / "test" / "samples"
GRAMMAR_DIR = PLUGIN_ROOT / "reference" / "visual-grammar"
OUTPUT_FORMATS_DIR = PLUGIN_ROOT / "reference" / "output-formats"
PROMPTS_FILE = PLUGIN_ROOT / "test" / "smoke" / "prompts.json"
DASHBOARD_SCRIPT = PLUGIN_ROOT / "scripts" / "render-html-dashboard.py"


def schemas_set():
    return {p.stem for p in SCHEMAS_DIR.glob("*.json")}


def samples_valid_set():
    return {p.name[: -len("-valid.json")] for p in SAMPLES_DIR.glob("*-valid.json")}


def grammar_set():
    # Per-mode grammar files at reference/visual-grammar/<mode>.md — NOT the
    # nested formats/ subdirectory (those are format-level, not mode-level).
    return {
        p.stem
        for p in GRAMMAR_DIR.glob("*.md")
        if p.is_file() and p.parent.name == "visual-grammar"
    }


def output_formats_set():
    return {p.stem for p in OUTPUT_FORMATS_DIR.glob("*.md")}


def prompts_set():
    if not PROMPTS_FILE.exists():
        return set()
    with open(PROMPTS_FILE, "r", encoding="utf-8") as f:
        entries = json.load(f)
    return {entry["mode"] for entry in entries}


def _ast_str_value(node):
    """Extract string value from an ast.Constant (or legacy ast.Str) node."""
    if isinstance(node, ast.Constant) and isinstance(node.value, str):
        return node.value
    if hasattr(ast, "Str") and isinstance(node, ast.Str):  # Python < 3.8 compat
        return node.s
    raise TypeError(f"Expected string AST node, got {type(node).__name__}")


def mode_display_names_set():
    """Parse MODE_DISPLAY_NAMES from render-html-dashboard.py via ast (no import)."""
    with open(DASHBOARD_SCRIPT, "r", encoding="utf-8") as f:
        source = f.read()
    tree = ast.parse(source, filename=str(DASHBOARD_SCRIPT))
    for node in ast.walk(tree):
        if (
            isinstance(node, ast.Assign)
            and len(node.targets) == 1
            and isinstance(node.targets[0], ast.Name)
            and node.targets[0].id == "MODE_DISPLAY_NAMES"
            and isinstance(node.value, ast.Dict)
        ):
            return {_ast_str_value(k) for k in node.value.keys}
    raise RuntimeError(f"MODE_DISPLAY_NAMES not found in {DASHBOARD_SCRIPT}")


def format_diff(expected, actual, label):
    missing = expected - actual
    extra = actual - expected
    lines = []
    if missing:
        lines.append(f"  {label} MISSING modes: {sorted(missing)}")
    if extra:
        lines.append(f"  {label} EXTRA modes (not in schemas/): {sorted(extra)}")
    return "\n".join(lines)


def main():
    modes = schemas_set()
    assert len(modes) > 0, f"no schemas found under {SCHEMAS_DIR}"
    print(f"Authoritative mode set (from schemas/): {len(modes)} modes")

    checks = [
        ("samples/*-valid.json", samples_valid_set()),
        ("reference/visual-grammar/", grammar_set()),
        ("reference/output-formats/", output_formats_set()),
        ("test/smoke/prompts.json", prompts_set()),
        (
            "scripts/render-html-dashboard.py MODE_DISPLAY_NAMES",
            mode_display_names_set(),
        ),
    ]

    failed = 0
    for label, actual in checks:
        if actual == modes:
            print(f"PASS: {label} matches ({len(actual)} modes)")
        else:
            diff_text = format_diff(modes, actual, label)
            print(f"FAIL: {label} drift from schemas/:\n{diff_text}")
            failed += 1

    print()
    if failed:
        print(f"{failed} artifact directory/file(s) drifted from schemas/")
        return 1
    print(f"All {len(modes)} modes have consistent artifacts across all directories")
    return 0


if __name__ == "__main__":
    sys.exit(main())
