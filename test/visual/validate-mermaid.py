"""
Validate that every mode's visual grammar contains at least one parseable
Mermaid code block. This is a SYNTACTIC smoke test — it does not invoke mmdc
and cannot catch semantic errors (mismatched arrow types, undeclared subgraphs,
label string literals that look like they contain unbalanced brackets, etc.).
For a stronger check, install mermaid-cli and pipe each block to `mmdc`.

Missing code blocks are treated as FAILURES, not skipped. If a mode genuinely
has no mermaid block for some reason, add it to ALLOWED_NO_MERMAID explicitly.
"""

import re
import sys
from pathlib import Path

GRAMMAR_DIR = Path(__file__).parent.parent.parent / "reference" / "visual-grammar"

# Explicit allowlist for files that legitimately lack a mermaid block.
# Empty set = every grammar file must have at least one mermaid block.
ALLOWED_NO_MERMAID = set()

MERMAID_START = re.compile(
    r"^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|journey|pie|gitGraph|mindmap|timeline|quadrantChart)\b",
    re.MULTILINE,
)


def _normalize(text: str) -> str:
    """Normalize line endings so CRLF files match \\n-anchored regexes."""
    return text.replace("\r\n", "\n").replace("\r", "\n")


def extract_mermaid_blocks(text: str):
    return re.findall(r"```mermaid\n(.*?)\n```", _normalize(text), re.DOTALL)


def validate_mermaid(source: str):
    if not MERMAID_START.search(source):
        return False, "no recognized mermaid graph declaration"
    # Brace-balance heuristic is a smoke check only; label literals can legitimately
    # contain unbalanced punctuation. If this produces false positives, tighten the
    # check by stripping `["..."]` / `("...")` labels before counting.
    if source.count("[") != source.count("]"):
        return False, "unbalanced square brackets"
    if source.count("(") != source.count(")"):
        return False, "unbalanced parentheses"
    if source.count("{") != source.count("}"):
        return False, "unbalanced curly braces"
    return True, "ok"


def main():
    passed = 0
    failed = 0
    for grammar_file in sorted(GRAMMAR_DIR.glob("*.md")):
        content = grammar_file.read_text(encoding="utf-8")
        blocks = extract_mermaid_blocks(content)
        if not blocks:
            if grammar_file.name in ALLOWED_NO_MERMAID:
                print(f"PASS (allowlisted, no blocks): {grammar_file.name}")
                passed += 1
            else:
                print(f"FAIL: {grammar_file.name} has no mermaid block (regression?)")
                failed += 1
            continue
        all_ok = True
        for i, block in enumerate(blocks):
            ok, reason = validate_mermaid(block)
            if not ok:
                print(f"FAIL: {grammar_file.name} block {i + 1}: {reason}")
                all_ok = False
        if all_ok:
            print(f"PASS: {grammar_file.name} ({len(blocks)} blocks)")
            passed += 1
        else:
            failed += 1
    print()
    print(f"Results: {passed} passed, {failed} failed")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
