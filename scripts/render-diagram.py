"""
render-diagram.py — wraps external diagram-rendering binaries.

Usage:
    python render-diagram.py --format mermaid --output out.svg < input.mmd
    python render-diagram.py --format dot --output out.png --render-as png < input.dot

Input is read from stdin.

Exit codes:
    0   — rendered successfully; the output file exists at --output
    1   — generic error (no input, bad argument, render failed)
    2   — missing dependency with --allow-skip: source printed to stdout,
          no file written at --output. Callers that treat 0 as "file exists"
          must check for this code.
    124 — subprocess timed out
    127 — missing dependency without --allow-skip: no file written

Required binaries (optional, install only if using SVG/PNG output):
    - graphviz (`dot` on PATH)                   — for DOT → SVG/PNG
    - @mermaid-js/mermaid-cli (`mmdc` on PATH)   — for Mermaid → SVG/PNG
"""

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

DEFAULT_TIMEOUT = 60
EXIT_OK = 0
EXIT_ERROR = 1
EXIT_SKIPPED = 2
EXIT_TIMEOUT = 124
EXIT_MISSING = 127


INSTALL_HINTS = {
    "dot": "winget install Graphviz.Graphviz (Windows) | brew install graphviz (macOS) | apt install graphviz (Linux)",
    "mmdc": "npm install -g @mermaid-js/mermaid-cli",
}


def _render_with_binary(
    binary: str, args_for: callable, source: str, output: Path, allow_skip: bool
) -> int:
    """Shared render implementation for dot and mmdc.

    `args_for(tmp_path, output_path)` returns the list of args to invoke the binary with.
    """
    if not shutil.which(binary):
        hint = INSTALL_HINTS.get(binary, "(see binary's docs)")
        if allow_skip:
            print(
                f"# SKIPPED: {binary} not installed. Install: {hint}", file=sys.stderr
            )
            print(source)
            return EXIT_SKIPPED
        print(
            f"ERROR: {binary} is not installed and --allow-skip was not passed. Install: {hint}",
            file=sys.stderr,
        )
        return EXIT_MISSING

    with tempfile.NamedTemporaryFile(
        "w", suffix=f".{binary}", delete=False, encoding="utf-8"
    ) as f:
        f.write(source)
        tmp = Path(f.name)
    try:
        try:
            result = subprocess.run(
                [binary, *args_for(tmp, output)],
                capture_output=True,
                text=True,
                encoding="utf-8",
                timeout=DEFAULT_TIMEOUT,
            )
        except subprocess.TimeoutExpired:
            print(
                f"ERROR: {binary} timed out after {DEFAULT_TIMEOUT}s",
                file=sys.stderr,
            )
            return EXIT_TIMEOUT
        if result.returncode != 0:
            print(f"ERROR from {binary}: {result.stderr}", file=sys.stderr)
            return EXIT_ERROR
        print(f"Wrote {output}")
        return EXIT_OK
    finally:
        tmp.unlink(missing_ok=True)


def render_dot(source: str, output: Path, fmt: str, allow_skip: bool) -> int:
    return _render_with_binary(
        "dot",
        lambda tmp, out: [f"-T{fmt}", str(tmp), "-o", str(out)],
        source,
        output,
        allow_skip,
    )


def render_mermaid(source: str, output: Path, fmt: str, allow_skip: bool) -> int:
    # mmdc infers format from the output extension; fmt is accepted for API symmetry.
    return _render_with_binary(
        "mmdc",
        lambda tmp, out: ["-i", str(tmp), "-o", str(out)],
        source,
        output,
        allow_skip,
    )


def main():
    parser = argparse.ArgumentParser(
        description="Render DOT or Mermaid source to SVG/PNG via graphviz/mmdc."
    )
    parser.add_argument(
        "--format",
        choices=["mermaid", "dot"],
        required=True,
        help="Source format on stdin",
    )
    parser.add_argument("--output", required=True, type=Path, help="Output file path")
    parser.add_argument(
        "--render-as",
        choices=["svg", "png"],
        default="svg",
        help="Output image format (default: svg)",
    )
    parser.add_argument(
        "--allow-skip",
        action="store_true",
        help="If the required binary is missing, print source to stdout and exit 2 instead of failing",
    )
    args = parser.parse_args()

    source = sys.stdin.read()
    if not source.strip():
        print("ERROR: no source on stdin", file=sys.stderr)
        return EXIT_ERROR

    if args.format == "dot":
        return render_dot(source, args.output, args.render_as, args.allow_skip)
    if args.format == "mermaid":
        return render_mermaid(source, args.output, args.render_as, args.allow_skip)
    return EXIT_ERROR


if __name__ == "__main__":
    sys.exit(main())
