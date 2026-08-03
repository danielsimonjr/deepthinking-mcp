"""
run-router-tests.py — test the /think auto-recommendation branch end-to-end.

Unlike run-all-modes.py which invokes `/think <mode> "..."` (explicit mode),
this runner invokes `/think "<problem>"` with NO mode and verifies that the
router picked one of the expected modes for each prompt. The expected set is
a list, not a single mode — multiple modes can be reasonable for the same
prompt, and the router just has to pick one of them.

Usage:
    cd <plugin-root>
    python test/smoke/run-router-tests.py

Environment:
    ROUTER_TIMEOUT   seconds per prompt (default 240 — router prompts tend to
                     be more open-ended than /think <mode> prompts)
    ROUTER_PROMPT    0-based index to run only a single prompt (e.g., ROUTER_PROMPT=3)

Expects `claude` on PATH. Takes ~20-40 minutes for the full suite of ~12 prompts.
"""

import io
import json
import os
import re
import subprocess
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, io.UnsupportedOperation, ValueError):
        pass

PLUGIN_ROOT = Path(__file__).parent.parent.parent
ROUTER_PROMPTS = PLUGIN_ROOT / "test" / "smoke" / "router-prompts.json"
CAPTURED_DIR = PLUGIN_ROOT / "test" / "smoke" / "captured" / "router"

TIMEOUT = int(os.environ.get("ROUTER_TIMEOUT", "240"))
SINGLE = os.environ.get("ROUTER_PROMPT")

JSON_BLOCK_RE = re.compile(r"```json\s*\n(.*?)\n```", re.DOTALL)


def run_router(prompt):
    """Invoke /think with no mode. Returns (stdout, exit_code, timed_out)."""
    safe = prompt.replace("\\", "\\\\").replace('"', '\\"')
    cmd = [
        "claude",
        "--plugin-dir",
        str(PLUGIN_ROOT),
        "--bare",
        "-p",
        f'/deepthinking-mcp:think "{safe}"',
    ]
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=TIMEOUT,
            errors="replace",
        )
        return result.stdout, result.returncode, False
    except subprocess.TimeoutExpired:
        return "", -1, True


def extract_mode(text):
    """Return the mode from the first ```json block, or None."""
    for match in JSON_BLOCK_RE.finditer(text):
        candidate = match.group(1).strip()
        try:
            obj = json.loads(candidate)
        except json.JSONDecodeError:
            continue
        if isinstance(obj, list) and obj:
            first = obj[0]
            if isinstance(first, dict):
                return first.get("mode")
        if isinstance(obj, dict):
            return obj.get("mode")
    return None


def main():
    CAPTURED_DIR.mkdir(parents=True, exist_ok=True)
    entries = json.loads(ROUTER_PROMPTS.read_text(encoding="utf-8"))

    if SINGLE:
        try:
            entries = [entries[int(SINGLE)]]
        except (ValueError, IndexError):
            print(f"ERROR: ROUTER_PROMPT={SINGLE!r} is not a valid index")
            return 1

    results = []
    for i, entry in enumerate(entries):
        prompt = entry["prompt"]
        expected = set(entry["expected_modes"])
        print(f"[{i}] {prompt[:70]}", flush=True)
        print(f"    expected: {sorted(expected)}", flush=True)

        stdout, exit_code, timed_out = run_router(prompt)
        raw_path = CAPTURED_DIR / f"prompt-{i:02d}-raw.txt"
        raw_path.write_text(stdout or "", encoding="utf-8")

        if timed_out:
            print(f"    FAIL: timeout after {TIMEOUT}s")
            results.append((i, False, "timeout"))
            continue
        if exit_code != 0 and not stdout:
            print(f"    FAIL: exit {exit_code} with no output")
            results.append((i, False, f"exit {exit_code}"))
            continue

        picked = extract_mode(stdout)
        if picked is None:
            print("    FAIL: no JSON block / no mode field")
            results.append((i, False, "no mode"))
            continue

        if picked in expected:
            print(f"    PASS: picked '{picked}' (expected one of {sorted(expected)})")
            results.append((i, True, picked))
        else:
            print(f"    FAIL: picked '{picked}' (expected one of {sorted(expected)})")
            results.append((i, False, f"picked {picked}"))

    print()
    passed = sum(1 for _, ok, _ in results if ok)
    failed = len(results) - passed
    print(f"===== Router: {passed}/{len(results)} passed, {failed} failed =====")
    for i, ok, reason in results:
        marker = "PASS" if ok else "FAIL"
        print(f"  {marker}  prompt {i:02d}  {reason}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
