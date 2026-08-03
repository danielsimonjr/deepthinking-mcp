"""
Cross-file version coherence check for deepthinking-plugin.

WHY THIS TEST EXISTS — the v0.4.1 latent-bug story
===================================================
From v0.2.0 through v0.4.0 (four consecutive releases), the authoritative
`.claude-plugin/plugin.json` was stuck at `"version": "0.1.0"`. The reason:
the only test that touched it was `test_plugin_json.py`, which contained a
hardcoded assertion (`assert version == "0.1.0"`). Every release bumped
CHANGELOG.md and README.md but nobody caught that plugin.json never moved.

The hardcoded assertion was replaced with a semver regex in v0.4.1, but that
only validates *format*, not *value*. This test adds the missing second check:
it reads the authoritative version from plugin.json, then verifies every other
known version-mention in the repo agrees with it.

DESIGN DECISIONS
================
- Absence is valid: a file that doesn't mention a version at all passes.
  Only explicit disagreements fail.
- CHANGELOG: only the first real `## [X.Y.Z]` heading is checked (the latest
  release). `[Unreleased]` is skipped. Earlier historical headings are ignored.
- README: only the Status section (first 20 lines) is checked.
- SKILL.md: only the "Available Modes (vX.Y.Z)" heading is checked.
- CLAUDE.md: only the "Current version: vX.Y.Z" intro line is checked.
- ARCHITECTURE.md: optional; checked if any `vX.Y.Z` mention exists.
- Version patterns: both `v0.4.1` and `0.4.1` are accepted (v-prefix optional).
"""

import json
import re
import sys
from pathlib import Path

# Repo root is two levels up from this test file (test/test_version_consistency.py)
REPO_ROOT = Path(__file__).parent.parent


def load_authoritative_version() -> str:
    """Read the canonical version from .claude-plugin/plugin.json."""
    plugin_json = REPO_ROOT / ".claude-plugin" / "plugin.json"
    with open(plugin_json, encoding="utf-8") as f:
        data = json.load(f)
    version = data.get("version", "")
    if not version:
        print("FAIL: .claude-plugin/plugin.json has no 'version' field")
        sys.exit(1)
    return version


def extract_changelog_version() -> str | None:
    """
    Return the version from the first real `## [X.Y.Z] - YYYY-MM-DD` heading.
    Skips `## [Unreleased]`. Returns None if no real heading is found.
    """
    path = REPO_ROOT / "CHANGELOG.md"
    if not path.exists():
        return None
    pattern = re.compile(r"^##\s+\[(\d+\.\d+\.\d+)\]", re.MULTILINE)
    text = path.read_text(encoding="utf-8")
    match = pattern.search(text)
    return match.group(1) if match else None


def extract_readme_version() -> str | None:
    """
    Return the version from the Status section (first 20 lines of README.md).
    Looks for patterns like `v0.4.1`, `**v0.4.1**`, `v0.4.1 —`.
    Returns None if no version mention is found.
    """
    path = REPO_ROOT / "README.md"
    if not path.exists():
        return None
    lines = path.read_text(encoding="utf-8").splitlines()[:20]
    pattern = re.compile(r"\bv(\d+\.\d+\.\d+)\b")
    for line in lines:
        match = pattern.search(line)
        if match:
            return match.group(1)
    return None


def extract_skill_version() -> str | None:
    """
    Return the version from `## Available Modes (vX.Y.Z)` in skills/think/SKILL.md.
    Returns None if the heading is absent or has no version.
    """
    path = REPO_ROOT / "skills" / "think" / "SKILL.md"
    if not path.exists():
        return None
    text = path.read_text(encoding="utf-8")
    pattern = re.compile(r"##\s+Available Modes\s+\(v(\d+\.\d+\.\d+)\)")
    match = pattern.search(text)
    return match.group(1) if match else None


def extract_claudemd_version() -> str | None:
    """
    Return the version from `**Current version:** vX.Y.Z` in CLAUDE.md.
    Returns None if the line is absent.
    """
    path = REPO_ROOT / "CLAUDE.md"
    if not path.exists():
        return None
    text = path.read_text(encoding="utf-8")
    pattern = re.compile(r"\*\*Current version:\*\*\s+v(\d+\.\d+\.\d+)")
    match = pattern.search(text)
    return match.group(1) if match else None


def extract_architecture_version() -> str | None:
    """
    Optional: return the first `vX.Y.Z` mention in ARCHITECTURE.md.
    Returns None if the file has no version mention (absence is valid).
    """
    path = REPO_ROOT / "ARCHITECTURE.md"
    if not path.exists():
        return None
    text = path.read_text(encoding="utf-8")
    pattern = re.compile(r"\bv(\d+\.\d+\.\d+)\b")
    match = pattern.search(text)
    return match.group(1) if match else None


def main() -> int:
    authoritative = load_authoritative_version()
    print(f"Authoritative version (plugin.json): {authoritative}")

    checks = [
        ("CHANGELOG.md (first release heading)", extract_changelog_version()),
        ("README.md (Status section)", extract_readme_version()),
        ("skills/think/SKILL.md (Available Modes heading)", extract_skill_version()),
        ("CLAUDE.md (Current version intro)", extract_claudemd_version()),
        ("ARCHITECTURE.md (first version mention)", extract_architecture_version()),
    ]

    failures: list[str] = []
    for label, found in checks:
        if found is None:
            print(f"  SKIP: {label} — no version mention found (absence is OK)")
        elif found == authoritative:
            print(f"  OK:   {label} — {found}")
        else:
            msg = f"FAIL: {label} claims v{found} but plugin.json says v{authoritative}"
            print(f"  {msg}")
            failures.append(msg)

    print()
    if failures:
        print(f"FAILED — {len(failures)} version mismatch(es):")
        for f in failures:
            print(f"  • {f}")
        return 1
    else:
        print("PASSED — all version mentions agree with plugin.json")
        return 0


if __name__ == "__main__":
    sys.exit(main())
