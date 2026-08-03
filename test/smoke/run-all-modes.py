"""
Automated smoke test runner for all 34 deepthinking-mcp modes.

Invokes `claude --plugin-dir <plugin_root> --bare -p` for each mode's test prompt,
extracts the JSON code block from Claude's response, and validates it against the
mode's JSON Schema. Writes per-mode captured outputs to test/smoke/captured/.

Usage:
    cd <plugin-root>
    python test/smoke/run-all-modes.py

Environment:
    SMOKE_TIMEOUT   seconds per mode (default 180)
    SMOKE_MODE      if set, only run this single mode (e.g. SMOKE_MODE=bayesian)
    SMOKE_WORKERS   number of parallel workers (default 4, capped at 8).
                    Set SMOKE_WORKERS=1 for the sequential escape hatch.
"""

import atexit
import concurrent.futures
import io
import json
import os
import re
import signal
import subprocess
import sys
import threading
from pathlib import Path

# Force UTF-8 stdout on Windows so arrow characters and diagrams don't crash prints.
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, io.UnsupportedOperation, ValueError) as _reconfig_err:
        print(f"WARNING: stdout reconfigure failed: {_reconfig_err}", file=sys.stderr)
else:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

try:
    import jsonschema
except ImportError:
    print("ERROR: jsonschema not installed. Run: pip install jsonschema")
    sys.exit(1)

PLUGIN_ROOT = Path(__file__).parent.parent.parent
SMOKE_DIR = PLUGIN_ROOT / "test" / "smoke"
CAPTURED_DIR = SMOKE_DIR / "captured"
SCHEMAS_DIR = PLUGIN_ROOT / "test" / "schemas"
PROMPTS_FILE = SMOKE_DIR / "prompts.json"

TIMEOUT = int(os.environ.get("SMOKE_TIMEOUT", "180"))
SINGLE_MODE = os.environ.get("SMOKE_MODE")

# SMOKE_WORKERS controls ThreadPoolExecutor concurrency for the full-suite run.
# Default 4, hard-capped at 8. The cap exists because each worker spawns a
# `claude -p` subprocess which (a) hits the Anthropic API (rate-limit pressure
# scales with worker count) and (b) saturates local CPU on the JSON extraction
# and schema validation passes. More than 8 tends to starve I/O and hit 429s
# without meaningful wall-clock improvement. SMOKE_WORKERS=1 degrades to a
# pure sequential loop (no executor) as an escape hatch for debugging.
_WORKERS_RAW = os.environ.get("SMOKE_WORKERS", "4")
try:
    SMOKE_WORKERS = max(1, min(8, int(_WORKERS_RAW)))
except ValueError:
    print(
        f"WARNING: SMOKE_WORKERS={_WORKERS_RAW!r} is not an integer; falling back to 4",
        file=sys.stderr,
    )
    SMOKE_WORKERS = 4

# ---------------------------------------------------------------------------
# Subprocess registry + cleanup handlers
#
# Each worker thread registers its `claude -p` subprocess in _active_procs
# before blocking on communicate() and unregisters it in a finally block.
# The atexit + signal handlers below walk this set to force-kill any
# grandchildren still running when the main process exits for any reason
# (normal completion, Ctrl+C, SIGTERM). This prevents the orphan-grandchild
# pathology where a killed smoke runner would leave behind zombie
# `claude -p` processes whose only parent was the dead Python interpreter.
# ---------------------------------------------------------------------------

_active_procs: set = set()
_active_procs_lock = threading.Lock()


def _register_proc(proc: subprocess.Popen) -> None:
    with _active_procs_lock:
        _active_procs.add(proc)


def _unregister_proc(proc: subprocess.Popen) -> None:
    with _active_procs_lock:
        _active_procs.discard(proc)


def _kill_all_active_procs() -> None:
    """Best-effort terminate of every still-running subprocess in the registry.

    Called on normal exit (atexit), SIGINT (Ctrl+C), and SIGTERM. Idempotent —
    safe to call multiple times. Uses .kill() not .terminate() because the
    child subprocesses hold a live HTTP connection to the Anthropic API and
    SIGTERM is ignored until the next I/O syscall; SIGKILL is immediate."""
    with _active_procs_lock:
        procs = list(_active_procs)
        _active_procs.clear()
    for proc in procs:
        try:
            if proc.poll() is None:
                proc.kill()
        except Exception:
            # Best-effort: a proc we can't kill is already gone.
            pass


# Install cleanup hooks exactly once, at module import. atexit fires on any
# normal Python exit path; signal handlers catch Ctrl+C and kill-signal
# exits before the interpreter tears down.
atexit.register(_kill_all_active_procs)


def _signal_handler(signum, frame):
    _kill_all_active_procs()
    # 128 + signum is the standard shell-reported exit code for signal-
    # terminated processes (130 for SIGINT, 143 for SIGTERM).
    sys.exit(128 + signum)


signal.signal(signal.SIGINT, _signal_handler)
try:
    signal.signal(signal.SIGTERM, _signal_handler)
except (AttributeError, ValueError):
    # Python on Windows does not support installing SIGTERM handlers in all
    # configurations (only the Ctrl-C equivalent via SIGINT). atexit still
    # runs on normal exit paths, which covers the common case.
    pass
# Windows also has SIGBREAK (Ctrl+Break), which is NOT the same as SIGINT
# (Ctrl+C). Install the same handler for it on Windows so Ctrl+Break also
# triggers the subprocess cleanup. SIGBREAK is absent on POSIX.
try:
    signal.signal(signal.SIGBREAK, _signal_handler)  # type: ignore[attr-defined]
except (AttributeError, ValueError):
    pass

JSON_BLOCK_RE = re.compile(r"```json\s*\n(.*?)\n```", re.DOTALL)

# Matches a lone backslash that is NOT part of a valid JSON escape sequence.
# Valid escapes: \" \\ \/ \b \f \n \r \t \uXXXX
INVALID_BACKSLASH_RE = re.compile(r'\\(?![\\"/bfnrtu])')


def repair_lone_backslashes(source):
    r"""Claude sometimes emits LaTeX-style escapes like `\ ` or `\mu` inside
    JSON strings, which are invalid JSON. Double any backslash that isn't part
    of a recognized escape sequence."""
    return INVALID_BACKSLASH_RE.sub(r"\\\\", source)


def extract_json_block(text):
    """Return (parsed, repaired) for the first ```json ... ``` block, or (None, False).

    Tries strict JSON parsing first; on failure, applies a minimal repair pass
    for lone backslashes (common in math/LaTeX output) and retries. The `repaired`
    flag is surfaced in test output so JSON escape bugs in Claude's output are
    not silently masked — they pass the test but with an attributed warning."""
    for match in JSON_BLOCK_RE.finditer(text):
        candidate = match.group(1).strip()
        try:
            return json.loads(candidate), False
        except json.JSONDecodeError:
            try:
                return json.loads(repair_lone_backslashes(candidate)), True
            except json.JSONDecodeError:
                continue
    return None, False


def _escape_for_slash_command(value: str) -> str:
    """Escape backslashes and double-quotes so the value survives embedding in
    a `"..."` argument to /deepthinking-mcp:think. This is NOT shell escaping
    — subprocess.run with shell=False handles that already — it is slash-command
    argument escaping so a prompt containing a literal `"` doesn't terminate the
    argument early."""
    return value.replace("\\", "\\\\").replace('"', '\\"')


def run_mode(mode, prompt, timeout):
    """Invoke claude -p for one mode. Return (stdout, stderr, exit_code, timed_out).

    Uses subprocess.Popen + communicate() (not subprocess.run) so the
    running subprocess is registered in _active_procs before it blocks.
    This registration is what allows the atexit and signal handlers above
    to force-kill any in-flight children when the interpreter exits,
    preventing the orphan-grandchild pathology in v0.5.0 where interrupting
    the smoke runner left zombie `claude -p` processes behind.

    Popen creation and registration happen atomically under
    `_active_procs_lock` to close the race window where a signal could
    arrive after Popen returned but before the child was registered; that
    narrow gap would otherwise leak a child from the cleanup handler's
    view. Holding the lock during Popen costs ~50-100ms of serialization
    across workers (process fork is fast) but that is negligible compared
    to the minutes each worker spends in communicate() waiting for the
    API response."""
    safe_prompt = _escape_for_slash_command(prompt)
    cmd = [
        "claude",
        "--plugin-dir",
        str(PLUGIN_ROOT),
        "--bare",
        "-p",
        f'/deepthinking-mcp:think {mode} "{safe_prompt}"',
    ]
    # Atomic Popen+register under the lock — eliminates the race where a
    # signal arriving between Popen and _register_proc could leak the child.
    with _active_procs_lock:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        _active_procs.add(proc)
    try:
        try:
            stdout, stderr = proc.communicate(timeout=timeout)
            return stdout, stderr, proc.returncode, False
        except subprocess.TimeoutExpired:
            # Timeout reached — force-kill the subprocess and drain whatever
            # its pipes produced before the kill. A second communicate() with
            # a short grace period is the idiomatic way to recover partial
            # output after a kill. If even that times out, explicitly reap
            # the zombie via wait() and close the pipe fds so we don't leak
            # file descriptors or leave the child in a defunct state.
            proc.kill()
            try:
                stdout, stderr = proc.communicate(timeout=5)
            except subprocess.TimeoutExpired:
                stdout, stderr = "", ""
                try:
                    if proc.stdout is not None:
                        proc.stdout.close()
                    if proc.stderr is not None:
                        proc.stderr.close()
                except Exception:
                    pass
                try:
                    proc.wait(timeout=5)  # reap the zombie
                except subprocess.TimeoutExpired:
                    pass  # give up — atexit handler will take a final swing
            return stdout, stderr, -1, True
    finally:
        _unregister_proc(proc)


def validate_thought(thought, mode, schema_dir):
    """Validate a parsed thought (object or array of thoughts) against the mode's schema."""
    schema_path = schema_dir / f"{mode}.json"
    if not schema_path.exists():
        return False, f"missing schema at {schema_path}"
    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)

    thoughts = thought if isinstance(thought, list) else [thought]
    if not thoughts:
        return False, "empty thought array"

    for i, t in enumerate(thoughts):
        try:
            jsonschema.validate(t, schema)
        except jsonschema.ValidationError as e:
            label = f"thought[{i}]" if len(thoughts) > 1 else "thought"
            return False, f"{label}: {e.message}"
    return True, f"ok ({len(thoughts)} thought{'s' if len(thoughts) > 1 else ''})"


def run_single_mode(
    entry: dict,
    schema_dir: Path,
    captured_dir: Path,
    timeout: int,
) -> tuple:
    """Execute one mode end-to-end and return (mode, ok, reason).

    This is a pure function: it takes all its dependencies as arguments and
    produces filesystem side effects only within `captured_dir`. It is the
    unit of work for ThreadPoolExecutor AND the single-mode code path — the
    two share this function so behavior can't drift between them.

    Writes three files under captured_dir:
      - <mode>-raw.txt     : raw stdout from `claude -p`
      - <mode>-stderr.txt  : stderr, if any
      - <mode>-parsed.json : pretty-printed parsed thought, if extraction succeeded

    Returned `reason` values:
      - "ok"           : passed schema validation, no repair needed
      - "ok-repaired"  : passed after backslash repair (attribution preserved)
      - "timeout"      : subprocess timed out
      - "exit <N>"     : non-zero exit with no captured stdout
      - "no JSON block": stdout lacked a parseable ```json fence
      - "<schema msg>" : schema validation error (first-error path)
    """
    mode = entry["mode"]
    prompt = entry["prompt"]

    captured, stderr, exit_code, timed_out = run_mode(mode, prompt, timeout)

    raw_path = captured_dir / f"{mode}-raw.txt"
    raw_path.write_text(captured or "", encoding="utf-8")
    if stderr:
        stderr_path = captured_dir / f"{mode}-stderr.txt"
        stderr_path.write_text(stderr, encoding="utf-8")

    if timed_out:
        return (mode, False, "timeout")

    if exit_code != 0 and not captured:
        return (mode, False, f"exit {exit_code}")

    thought, repaired = extract_json_block(captured)
    if thought is None:
        return (mode, False, "no JSON block")

    json_path = captured_dir / f"{mode}-parsed.json"
    json_path.write_text(json.dumps(thought, indent=2), encoding="utf-8")

    ok, reason = validate_thought(thought, mode, schema_dir)
    if ok:
        if repaired:
            return (mode, True, "ok-repaired")
        return (mode, True, "ok")
    return (mode, False, reason)


def main():
    CAPTURED_DIR.mkdir(parents=True, exist_ok=True)
    with open(PROMPTS_FILE, "r", encoding="utf-8") as f:
        prompts = json.load(f)

    if SINGLE_MODE:
        prompts = [p for p in prompts if p["mode"] == SINGLE_MODE]
        if not prompts:
            print(f"ERROR: no prompt for mode '{SINGLE_MODE}'")
            return 1

    total = len(prompts)
    mode_word = "mode" if total == 1 else "modes"
    print(
        f"Running {total} {mode_word} with {SMOKE_WORKERS} parallel "
        f"workers (SMOKE_WORKERS={SMOKE_WORKERS})...",
        flush=True,
    )

    # results: dict[mode -> (mode, ok, reason)]. Keyed by mode so we can later
    # iterate sorted(results.keys()) for a deterministic alphabetical summary,
    # regardless of the order in which futures complete.
    results: dict = {}

    # Concurrent control flow notes:
    # - We use threads (not processes) because each worker's real work is a
    #   subprocess.Popen + communicate() call — it blocks on I/O, not Python
    #   CPU — so the GIL is irrelevant. ThreadPoolExecutor is the lightest
    #   option.
    # - `as_completed` yields futures in completion order, letting us print a
    #   live progress line for each mode the moment it finishes.
    # - KeyboardInterrupt (Ctrl+C) and SIGTERM: every in-flight `claude -p`
    #   subprocess is registered in _active_procs at the top of run_mode()
    #   and unregistered in its finally block. The signal handlers installed
    #   at module load walk that set and .kill() each running child before
    #   the interpreter exits. atexit runs the same cleanup on normal exit
    #   paths. This eliminates the orphan-grandchild bug from v0.5.0 where
    #   interrupting a parallel smoke run would leave behind zombie
    #   `claude -p` processes. Signal exit uses code 128 + signum (130 for
    #   SIGINT, 143 for SIGTERM) per the POSIX convention.
    # - Single-mode mode (SMOKE_MODE=bayesian) and SMOKE_WORKERS=1 both bypass
    #   the executor entirely. The sequential path is a pure for-loop that
    #   calls run_single_mode directly — same function, just no concurrency.
    use_executor = SMOKE_WORKERS > 1 and total > 1

    if use_executor:
        with concurrent.futures.ThreadPoolExecutor(
            max_workers=SMOKE_WORKERS
        ) as executor:
            future_to_mode = {
                executor.submit(
                    run_single_mode, entry, SCHEMAS_DIR, CAPTURED_DIR, TIMEOUT
                ): entry["mode"]
                for entry in prompts
            }
            completed = 0
            for future in concurrent.futures.as_completed(future_to_mode):
                mode_name = future_to_mode[future]
                try:
                    mode, ok, reason = future.result()
                except Exception as exc:  # noqa: BLE001 — surface any worker crash
                    mode = mode_name
                    ok = False
                    reason = f"worker crash: {type(exc).__name__}: {exc}"
                results[mode] = (mode, ok, reason)
                completed += 1
                status = "PASS" if ok else "FAIL"
                extra = ""
                if ok and reason == "ok-repaired":
                    extra = " (with backslash repair — JSON escape bug in model output)"
                elif not ok:
                    extra = f": {reason}"
                print(
                    f"[{completed:2d}/{total}] {mode}: {status}{extra}",
                    flush=True,
                )
    else:
        # Sequential path — used for single-mode runs and the SMOKE_WORKERS=1
        # escape hatch. No executor, no futures, no threads.
        for i, entry in enumerate(prompts, start=1):
            mode = entry["mode"]
            print(
                f"[{i:2d}/{total}] {mode}: running (timeout {TIMEOUT}s)...",
                flush=True,
            )
            mode, ok, reason = run_single_mode(
                entry, SCHEMAS_DIR, CAPTURED_DIR, TIMEOUT
            )
            results[mode] = (mode, ok, reason)
            status = "PASS" if ok else "FAIL"
            extra = ""
            if ok and reason == "ok-repaired":
                extra = " (with backslash repair — JSON escape bug in model output)"
            elif not ok:
                extra = f": {reason}"
            print(f"[{i:2d}/{total}] {mode}: {status}{extra}", flush=True)

    # Deterministic alphabetical summary regardless of completion order.
    print()
    ordered = [results[m] for m in sorted(results.keys())]
    passed = sum(1 for _, ok, _ in ordered if ok)
    failed = len(ordered) - passed
    repaired_count = sum(
        1 for _, ok, reason in ordered if ok and reason == "ok-repaired"
    )

    print(f"===== Summary: {passed}/{len(ordered)} passed, {failed} failed =====")
    if repaired_count:
        print(
            f"NOTE: {repaired_count} mode(s) required backslash repair — their SKILL.md "
            "should be updated to produce strict-JSON-safe output (escape LaTeX "
            "backslashes as \\\\)."
        )
    for mode, ok, reason in ordered:
        marker = "PASS" if ok else "FAIL"
        print(f"  {marker:4s}  {mode:20s}  {reason}")

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
