"""Smoke test: plugin.json parses and has required fields.

Do NOT run with `python -O` — assertions would be stripped and the test would
pass vacuously. Use plain `python test/test_plugin_json.py`.
"""

import json
import re
from pathlib import Path

PLUGIN_ROOT = Path(__file__).parent.parent
MANIFEST = PLUGIN_ROOT / ".claude-plugin" / "plugin.json"
SEMVER_RE = re.compile(r"^\d+\.\d+\.\d+(?:[-+].*)?$")


def test_plugin_json_exists_and_parses():
    assert MANIFEST.exists(), f"Missing manifest at {MANIFEST}"
    with open(MANIFEST, "r", encoding="utf-8") as f:
        data = json.load(f)
    # Was "deepthinking-plugin" until 2026-08-03, when that plugin was merged
    # into deepthinking-mcp so one plugin ships both the MCP server and these
    # reasoning skills/commands.
    assert data["name"] == "deepthinking-mcp", (
        f"wrong plugin name: {data.get('name')}"
    )
    version = data.get("version", "")
    assert SEMVER_RE.match(version), f"version not semver: {version!r}"
    assert "description" in data and len(data["description"]) > 10, (
        "description missing or too short"
    )
    assert "author" in data, "author field missing"


if __name__ == "__main__":
    test_plugin_json_exists_and_parses()
    print("PASS: plugin.json is valid")
