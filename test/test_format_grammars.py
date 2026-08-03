"""
test_format_grammars.py — verify that every format grammar file at
reference/visual-grammar/formats/ has the expected structure.

The visual-exporter agent consumes these files when asked to produce output in
formats other than mermaid/dot. A broken template, missing section, or renamed
file would silently degrade the agent's output quality. This test enforces:

1. The expected set of format grammar files is present.
2. Each file has the canonical section headings.
3. Each file is non-trivially sized (>= 400 bytes) so an accidental truncation
   is caught.

The expected set is hardcoded here deliberately: these are a small, stable set
(9 formats) that should only change deliberately. If you add or remove a format
grammar, update EXPECTED below.

Do NOT run with `python -O` — assertions would be stripped.
"""

import sys
from pathlib import Path

PLUGIN_ROOT = Path(__file__).parent.parent
FORMATS_DIR = PLUGIN_ROOT / "reference" / "visual-grammar" / "formats"

EXPECTED_FORMATS = {
    "ascii",
    "csv",
    "dashboard",
    "graphml",
    "html",
    "json",
    "latex-math",
    "markdown",
    "modelica",
    "tikz",
    "uml",
}

REQUIRED_SECTIONS = [
    "## Format Overview",
    "## Encoding Rules",
    "## Template",
    "## Worked Example",
]

MIN_BYTES = 400  # ~10 lines of meaningful content


def main():
    assert FORMATS_DIR.is_dir(), f"format grammars directory missing: {FORMATS_DIR}"

    actual = {p.stem for p in FORMATS_DIR.glob("*.md")}
    missing = EXPECTED_FORMATS - actual
    extra = actual - EXPECTED_FORMATS

    failed = 0

    if missing:
        print(f"FAIL: format grammars missing: {sorted(missing)}")
        failed += 1
    if extra:
        print(
            f"WARN: unexpected format grammar files: {sorted(extra)} (add to EXPECTED?)"
        )
        # WARN only — unexpected extras don't fail the test

    for fmt in sorted(actual & EXPECTED_FORMATS):
        path = FORMATS_DIR / f"{fmt}.md"
        content = path.read_text(encoding="utf-8")
        size = len(content.encode("utf-8"))
        if size < MIN_BYTES:
            print(f"FAIL: {fmt}.md is only {size} bytes (expected >= {MIN_BYTES})")
            failed += 1
            continue
        section_failures = []
        for section in REQUIRED_SECTIONS:
            # Allow case-insensitive match and permit the section heading to be
            # any level (e.g., `## Format Overview` or `### Format Overview`)
            # by checking for the literal text on a line starting with `#`.
            section_text = section.lstrip("# ").strip().lower()
            found = False
            for line in content.splitlines():
                stripped = line.lstrip("# ").strip().lower()
                if line.startswith("#") and section_text in stripped:
                    found = True
                    break
            if not found:
                section_failures.append(section)
        if section_failures:
            print(f"FAIL: {fmt}.md missing sections: {section_failures}")
            failed += 1
        else:
            print(f"PASS: {fmt}.md ({size} bytes, all sections present)")

    print()
    if failed:
        print(f"{failed} format grammar file(s) failed validation")
        return 1
    print(f"All {len(EXPECTED_FORMATS)} format grammars have required structure")
    return 0


if __name__ == "__main__":
    sys.exit(main())
