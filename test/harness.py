"""
Test harness for deepthinking-plugin.
Validates sample thought outputs against JSON schemas.

Reports ALL validation errors per sample (not just the first), and catches
file-loading failures per-sample rather than crashing the whole run.

Do NOT run with `python -O` — assertions in downstream tests would be stripped.
"""

import functools
import json
import sys
from pathlib import Path

try:
    import jsonschema
    from jsonschema import Draft7Validator, SchemaError
except ImportError:
    print("ERROR: jsonschema library not installed. Run: pip install jsonschema")
    sys.exit(1)

TEST_DIR = Path(__file__).parent
SCHEMA_DIR = TEST_DIR / "schemas"
SAMPLE_DIR = TEST_DIR / "samples"


# Auto-discover SAMPLES: every `<mode>-valid.json` in samples/ validates against
# the matching `<mode>.json` in schemas/. Every `<mode>-invalid.json` is expected
# to fail validation against the same schema. This scales to all 34+ modes without
# manual bookkeeping.
def _discover_samples():
    out = []
    for sample_path in sorted(SAMPLE_DIR.glob("*.json")):
        name = sample_path.name
        if name.endswith("-valid.json"):
            mode = name[: -len("-valid.json")]
            schema = f"{mode}.json"
            if (SCHEMA_DIR / schema).exists():
                out.append((name, schema, True))
        elif name.endswith("-invalid.json"):
            mode = name[: -len("-invalid.json")]
            schema = f"{mode}.json"
            if (SCHEMA_DIR / schema).exists():
                out.append((name, schema, False))
    return out


SAMPLES = _discover_samples()


@functools.lru_cache(maxsize=None)
def load_schema(name):
    with open(SCHEMA_DIR / name, "r", encoding="utf-8") as f:
        return json.load(f)


def load_sample(name):
    with open(SAMPLE_DIR / name, "r", encoding="utf-8") as f:
        return json.load(f)


def _format_path(error):
    path = list(error.absolute_path)
    return "/".join(str(p) for p in path) if path else "<root>"


def _validate_all_errors(sample, schema):
    """Return the full list of validation errors (empty list = valid)."""
    validator = Draft7Validator(schema)
    return sorted(validator.iter_errors(sample), key=lambda e: list(e.absolute_path))


def run_tests():
    passed = 0
    failed = 0
    for sample_name, schema_name, should_pass in SAMPLES:
        try:
            sample = load_sample(sample_name)
            schema = load_schema(schema_name)
        except (
            FileNotFoundError,
            PermissionError,
            json.JSONDecodeError,
            UnicodeDecodeError,
        ) as e:
            print(f"FAIL: {sample_name} could not be loaded: {type(e).__name__}: {e}")
            failed += 1
            continue

        try:
            errors = _validate_all_errors(sample, schema)
        except SchemaError as e:
            print(f"FAIL: schema {schema_name} is itself invalid: {e.message}")
            failed += 1
            continue

        if not errors:
            # Valid against schema
            if should_pass:
                print(f"PASS: {sample_name} validates against {schema_name}")
                passed += 1
            else:
                print(f"FAIL: {sample_name} should have failed validation but passed")
                failed += 1
        else:
            # Invalid against schema
            if not should_pass:
                print(
                    f"PASS: {sample_name} correctly rejected by {schema_name} "
                    f"({len(errors)} error{'s' if len(errors) > 1 else ''})"
                )
                passed += 1
            else:
                print(
                    f"FAIL: {sample_name} should have validated but has "
                    f"{len(errors)} error{'s' if len(errors) > 1 else ''}:"
                )
                for err in errors[:5]:  # cap at 5 to keep output readable
                    print(f"  - {_format_path(err)}: {err.message}")
                if len(errors) > 5:
                    print(f"  ... and {len(errors) - 5} more")
                failed += 1

    print()
    print(f"Results: {passed} passed, {failed} failed")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(run_tests())
