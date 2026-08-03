"""
render-html-dashboard.py — render a deepthinking thought as a standalone HTML dashboard.

Usage:
    python render-html-dashboard.py --thought thought.json --output dashboard.html [--mermaid diagram.mmd]

Reads the template at reference/html-dashboard-template.html, substitutes placeholder
tokens with the thought JSON (and optional pre-rendered Mermaid source), and writes
a single self-contained HTML file. No dependencies beyond the Python stdlib; Mermaid
is loaded from a CDN at page view time.

Exit codes:
    0 — dashboard written successfully
    1 — error (missing file, bad JSON, leftover template tokens, path escape, etc.)
"""

import argparse
import html
import json
import re
import sys
from datetime import datetime
from pathlib import Path

PLUGIN_ROOT = Path(__file__).parent.parent
TEMPLATE_PATH = PLUGIN_ROOT / "reference" / "html-dashboard-template.html"

MODE_DISPLAY_NAMES = {
    "sequential": "Sequential Reasoning",
    "shannon": "Shannon-Style Decomposition",
    "hybrid": "Hybrid Reasoning",
    "inductive": "Inductive Reasoning",
    "deductive": "Deductive Reasoning",
    "abductive": "Abductive Reasoning",
    "mathematics": "Mathematical Reasoning",
    "physics": "Physical Reasoning",
    "computability": "Computability & Complexity",
    "temporal": "Temporal Reasoning",
    "historical": "Historical Reasoning",
    "bayesian": "Bayesian Inference",
    "evidential": "Evidential Reasoning",
    "causal": "Causal Analysis",
    "counterfactual": "Counterfactual Reasoning",
    "gametheory": "Game Theory",
    "optimization": "Optimization",
    "constraint": "Constraint Satisfaction",
    "analogical": "Analogical Reasoning",
    "firstprinciples": "First Principles Reasoning",
    "metareasoning": "Meta-Reasoning",
    "cryptanalytic": "Cryptanalytic Reasoning",
    "scientificmethod": "Scientific Method",
    "systemsthinking": "Systems Thinking",
    "formallogic": "Formal Logic",
    "engineering": "Engineering Reasoning",
    "algorithmic": "Algorithmic Reasoning",
    "synthesis": "Synthesis",
    "argumentation": "Argumentation (Toulmin)",
    "critique": "Peer-Review Critique",
    "analysis": "Layered Analysis",
    "recursive": "Recursive Reasoning",
    "modal": "Modal Reasoning",
    "stochastic": "Stochastic Reasoning",
    "5w1h": "5W1H",
    "swot": "SWOT Analysis",
    "fivewhys": "5 Whys",
    "fishbone": "Fishbone (Ishikawa)",
    "pestle": "PESTLE Analysis",
    "forcefield": "Force Field Analysis",
    "decisionmatrix": "Decision Matrix",
    "pareto": "Pareto (80/20)",
    "stakeholder": "Stakeholder Analysis",
    "costbenefit": "Cost-Benefit Analysis",
    "riskassessment": "Risk Assessment",
    "gapanalysis": "Gap Analysis",
}

MODE_SLUG_RE = re.compile(r"^[a-z][a-z0-9_-]{0,40}$")
LEFTOVER_TOKEN_RE = re.compile(r"\{\{[A-Z][A-Z_]*\}\}")


def extract_mode(thought):
    """Return the mode slug from a thought (dict) or the first entry in a list chain."""
    if isinstance(thought, list) and thought:
        first = thought[0]
        if isinstance(first, dict):
            value = first.get("mode")
            if isinstance(value, str):
                return value
        return "unknown"
    if isinstance(thought, dict):
        value = thought.get("mode")
        if isinstance(value, str):
            return value
    return "unknown"


def fallback_mermaid(thought):
    """Minimal Mermaid diagram derived from top-level thought fields when no source provided."""
    mode = extract_mode(thought)
    safe_mode = html.escape(mode, quote=True).replace('"', "&quot;")
    lines = ["graph TD", f'  root["{safe_mode}"]']
    if isinstance(thought, list):
        for i, t in enumerate(thought[:8], start=1):
            if isinstance(t, dict):
                label_src = t.get("content") or t.get("thoughtNumber") or f"thought {i}"
            else:
                label_src = f"thought {i}"
            label = html.escape(str(label_src)[:60], quote=True).replace('"', "&quot;")
            lines.append(f'  t{i}["{label}"]')
            lines.append(f"  root --> t{i}")
    elif isinstance(thought, dict):
        i = 1
        for key, value in list(thought.items())[:8]:
            if key == "mode":
                continue
            safe_key = html.escape(str(key)[:30], quote=True).replace('"', "&quot;")
            preview = html.escape(json.dumps(value)[:60], quote=True).replace(
                '"', "&quot;"
            )
            lines.append(f'  n{i}["{safe_key}: {preview}"]')
            lines.append(f"  root --> n{i}")
            i += 1
    return "\n".join(lines)


def validate_safe_output_path(output: Path) -> Path:
    """Reject paths that escape the current working directory. Returns a resolved Path."""
    resolved = output.resolve()
    # Allow anywhere under the current working directory OR under a temp directory
    # (for tests). Reject explicit system paths.
    cwd = Path.cwd().resolve()
    try:
        import tempfile

        tmp = Path(tempfile.gettempdir()).resolve()
    except Exception:
        tmp = None
    under_cwd = False
    try:
        resolved.relative_to(cwd)
        under_cwd = True
    except ValueError:
        pass
    if under_cwd:
        return resolved
    if tmp is not None:
        try:
            resolved.relative_to(tmp)
            return resolved
        except ValueError:
            pass
    # Not under cwd or temp — refuse.
    raise ValueError(
        f"output path {resolved} is outside the current working directory and temp dir"
    )


def render(thought, mermaid_source, output_path):
    template = TEMPLATE_PATH.read_text(encoding="utf-8")

    mode = extract_mode(thought)
    # Validate mode against a whitelist when possible; otherwise sanitize.
    if not MODE_SLUG_RE.match(mode):
        # Unknown mode: strip to a safe identifier, but keep the original for display.
        original_mode = mode
        mode = re.sub(r"[^a-z0-9_-]", "_", mode.lower())[:40] or "unknown"
    else:
        original_mode = mode

    mode_display = MODE_DISPLAY_NAMES.get(
        mode, original_mode.capitalize() + " Reasoning"
    )
    thought_json = json.dumps(thought, indent=2, ensure_ascii=False)

    rendered = template
    rendered = rendered.replace("{{MODE}}", html.escape(mode))
    # MODE_JSON is injected into a JS context (a string literal). Use json.dumps
    # so the value cannot escape the quotes via backslash, quote, or newline.
    rendered = rendered.replace("{{MODE_JSON}}", json.dumps(mode))
    rendered = rendered.replace("{{MODE_DISPLAY}}", html.escape(mode_display))
    rendered = rendered.replace("{{THOUGHT_JSON}}", html.escape(thought_json))
    rendered = rendered.replace("{{THOUGHT_JSON_RAW}}", html.escape(thought_json))
    # Mermaid source lives inside <pre class="mermaid">...</pre>; HTML-escaping is
    # safe because Mermaid reads textContent (which decodes entities automatically).
    rendered = rendered.replace("{{MERMAID_SOURCE}}", html.escape(mermaid_source))
    rendered = rendered.replace(
        "{{TIMESTAMP}}", datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )

    # Fail loudly if any template tokens remain unsubstituted (e.g., a new {{FOO}}
    # added to the template but not handled here).
    leftovers = LEFTOVER_TOKEN_RE.findall(rendered)
    if leftovers:
        raise ValueError(f"template has unsubstituted tokens: {sorted(set(leftovers))}")

    output_path.write_text(rendered, encoding="utf-8")
    return output_path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--thought", required=True, type=Path, help="Path to thought JSON file"
    )
    parser.add_argument(
        "--output", required=True, type=Path, help="Path to write dashboard HTML"
    )
    parser.add_argument(
        "--mermaid", type=Path, help="Optional path to pre-rendered Mermaid source"
    )
    args = parser.parse_args()

    if not args.thought.exists():
        print(f"ERROR: thought file not found: {args.thought}", file=sys.stderr)
        return 1
    if not TEMPLATE_PATH.exists():
        print(f"ERROR: template not found at {TEMPLATE_PATH}", file=sys.stderr)
        return 1

    try:
        output_path = validate_safe_output_path(args.output)
    except ValueError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1

    try:
        thought = json.loads(args.thought.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(
            f"ERROR: thought file {args.thought} is not valid JSON: {e}",
            file=sys.stderr,
        )
        return 1
    except UnicodeDecodeError as e:
        print(
            f"ERROR: thought file {args.thought} is not valid UTF-8: {e}",
            file=sys.stderr,
        )
        return 1

    if args.mermaid:
        if not args.mermaid.exists():
            print(f"ERROR: --mermaid file not found: {args.mermaid}", file=sys.stderr)
            return 1
        mermaid_source = args.mermaid.read_text(encoding="utf-8")
    else:
        mermaid_source = fallback_mermaid(thought)
        print(
            "INFO: no --mermaid provided, using auto-generated fallback diagram",
            file=sys.stderr,
        )

    try:
        render(thought, mermaid_source, output_path)
    except ValueError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1

    print(f"Wrote {output_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
