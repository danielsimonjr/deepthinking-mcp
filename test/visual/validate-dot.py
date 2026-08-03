"""
Validate that every mode's visual grammar contains at least one parseable
DOT code block. Syntactic check only — does not invoke graphviz. For a stronger
check, install graphviz and pipe each block to `dot -Tcanon > /dev/null`.

Missing code blocks are treated as FAILURES, not skipped. If a mode genuinely
has no DOT block for some reason, add it to ALLOWED_NO_DOT explicitly.
"""

import re
import sys
from pathlib import Path

GRAMMAR_DIR = Path(__file__).parent.parent.parent / "reference" / "visual-grammar"

ALLOWED_NO_DOT = set()

DOT_START = re.compile(r"(strict\s+)?(digraph|graph)\s+\w*\s*\{", re.MULTILINE)


def _normalize(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n")


def extract_dot_blocks(text: str):
    return re.findall(r"```dot\n(.*?)\n```", _normalize(text), re.DOTALL)


def validate_dot(source: str):
    if not DOT_START.search(source):
        return False, "no digraph/graph declaration"
    if source.count("{") != source.count("}"):
        return False, "unbalanced curly braces"
    return True, "ok"


def main():
    passed = 0
    failed = 0
    for grammar_file in sorted(GRAMMAR_DIR.glob("*.md")):
        content = grammar_file.read_text(encoding="utf-8")
        blocks = extract_dot_blocks(content)
        if not blocks:
            if grammar_file.name in ALLOWED_NO_DOT:
                print(f"PASS (allowlisted, no blocks): {grammar_file.name}")
                passed += 1
            else:
                print(f"FAIL: {grammar_file.name} has no dot block (regression?)")
                failed += 1
            continue
        all_ok = True
        for i, block in enumerate(blocks):
            ok, reason = validate_dot(block)
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
