"""
Integration test for scripts/render-html-dashboard.py.

Uses an existing sample thought fixture plus a minimal Mermaid source, invokes the
renderer, verifies the output HTML contains the expected substitutions, and cleans up.
"""

import json
import subprocess
import sys
import tempfile
from pathlib import Path

PLUGIN_ROOT = Path(__file__).parent.parent.parent
RENDERER = PLUGIN_ROOT / "scripts" / "render-html-dashboard.py"
SAMPLE = PLUGIN_ROOT / "test" / "samples" / "bayesian-valid.json"


def main():
    if not RENDERER.exists():
        print(f"FAIL: renderer not found at {RENDERER}")
        return 1
    if not SAMPLE.exists():
        print(f"FAIL: sample fixture not found at {SAMPLE}")
        return 1

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = Path(tmpdir)
        mermaid_src = tmp / "diagram.mmd"
        mermaid_src.write_text(
            "graph TD\n  h1[Hypothesis] --> e1[Evidence]\n  e1 --> p1[Posterior]\n",
            encoding="utf-8",
        )
        output = tmp / "dashboard.html"

        result = subprocess.run(
            [
                sys.executable,
                str(RENDERER),
                "--thought",
                str(SAMPLE),
                "--output",
                str(output),
                "--mermaid",
                str(mermaid_src),
            ],
            capture_output=True,
            text=True,
            encoding="utf-8",
        )

        if result.returncode != 0:
            print(f"FAIL: renderer exited {result.returncode}")
            print(result.stderr)
            return 1

        if not output.exists():
            print("FAIL: output file was not created")
            return 1

        content = output.read_text(encoding="utf-8")

        # Check key substitutions happened
        thought = json.loads(SAMPLE.read_text(encoding="utf-8"))
        mode = thought["mode"]

        checks = [
            (f'data-mode="{mode}"', "mode attribute"),
            (f'class="mode-badge">{mode}', "mode badge"),
            ("h1[Hypothesis]", "mermaid source embedded"),
            ("Bayesian", "mode display name"),
            ("copyJson", "interactive button script"),
            ("mermaid.min.js", "mermaid CDN script tag"),
        ]

        failed = []
        for needle, label in checks:
            if needle not in content:
                failed.append(f"{label}: missing '{needle}'")

        # Ensure no unsubstituted template tokens remain
        unfilled = [
            tok
            for tok in [
                "{{MODE}}",
                "{{MERMAID_SOURCE}}",
                "{{THOUGHT_JSON}}",
                "{{TIMESTAMP}}",
            ]
            if tok in content
        ]
        if unfilled:
            failed.append(f"unsubstituted tokens: {unfilled}")

        if failed:
            print("FAIL:")
            for reason in failed:
                print(f"  - {reason}")
            return 1

    print(f"PASS: dashboard integration test ({len(checks)} checks)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
