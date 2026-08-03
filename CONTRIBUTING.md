# Contributing to deepthinking-mcp

Thanks for your interest in improving deepthinking-mcp. This is a single-maintainer project
(Daniel Simon Jr.), so please read this before opening a PR — it saves both of us a review cycle.

## Before you start

- **Search existing issues first.** Duplicate reports slow everything down.
- **For anything non-trivial, open an issue before writing code.** A short design discussion is
  much cheaper than a large PR that gets redirected.
- **Security issues do NOT go through GitHub issues or PRs.** See [SECURITY.md](SECURITY.md).

## Development setup

```bash
git clone https://github.com/danielsimonjr/deepthinking-mcp
cd deepthinking-mcp
npm install
```

Requires Node.js >=18.0.0 (the CI matrix tests 20.x and 22.x; 18.x is EOL and excluded — see
`.github/workflows/test.yml`).

## Required workflow before opening a PR

This project enforces **TDD strict, typecheck-then-test-then-build order**. Follow this sequence —
it is also what CI checks:

```bash
npm run typecheck       # 1. Type check first
npm run lint             # 2. ESLint (max-warnings gate — see below)
npm run format:check     # 3. Prettier formatting
npm run test:publish     # 4. Full test suite (skips wall-clock benchmarks)
npm run build             # 5. Build after everything else is green
```

For the Python consistency suite under `test/` (schema/artifact/version-drift checks — these are
invoked directly in CI, not via `pytest test`, because most of them are `check_*`/`main()`-shaped
rather than `test_*`-shaped):

```bash
pip install jsonschema pytest
python test/harness.py
python test/test_artifact_consistency.py
python test/test_format_grammars.py
python test/test_skill_frontmatter.py
python test/test_skill_invariants.py
python test/test_version_consistency.py
python -m pytest test/test_plugin_json.py
```

### Test-Driven Development

Write the failing test before the implementation. See `docs/setup/ADDING_NEW_MODE.md` for the
complete template when adding a new reasoning mode (type definition → `ThinkingMode` enum → handler
→ registry → `ThoughtFactory` → Zod validator → visual exporter).

### Lint gate

`npm run lint` runs with `--max-warnings` pinned to the current warning count (a ratchet, not a
free pass — see `package.json`). **Do not raise that number** to make new warnings pass; fix the
warning or, if it's a deliberate `any`, justify it in review. Lowering the count as you fix
warnings is welcome.

### Coverage gate

`.github/workflows/coverage.yml` fails the build below `COVERAGE_THRESHOLD` (currently a ratchet
baseline just under the measured value — see the comment in that file). Don't lower it to make a
regression pass; raise it as coverage improves.

## Commit and PR conventions

- Keep commits atomic and descriptive.
- Update `CHANGELOG.md` under `[Unreleased]` for any user-visible change.
- If your change affects a documented number (test count, export count, tool count, etc.), prefer
  regenerating `docs/architecture/DEPENDENCY_GRAPH.md` via `npm run docs:deps` over hand-editing
  the figure, and sync any copies in `CLAUDE.md` / `README.md`.
- Sync both the hand-written JSON schemas and the Zod validators in `src/tools/` /
  `src/validation/` when adding or changing a mode's input shape (see `CLAUDE.md` → Key
  Conventions).

## Code of conduct

Be respectful and constructive. Disagreement about a technical approach is fine and expected;
personal attacks are not.

## License

By contributing, you agree your contribution is licensed under this project's [MIT License](LICENSE).
