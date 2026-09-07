# TODO — deepthinking-mcp

Repo-level task tracker. Cross-repo roll-up lives in `~/Github/TODO.md`; per-change history is in
[`CHANGELOG.md`](CHANGELOG.md).

## Blocked: vitest 5 major (2026-09-07)

- [x] **vitest 4 -> 5 — RESOLVED 2026-09-07 by landing both halves together (#309).**
      The original diagnosis below was WRONG in a way worth keeping: it read as "coverage-v8 5
      breaks the coverage step", when nothing was broken. vitest 5 changed the core/provider
      contract — `onAfterSuiteRun({ coverage })` now expects a FILENAME the provider has
      written (`dist/chunks/index.B89dZ0-N.js:15000`), while coverage-v8 v4 passes the raw V8
      object inline. #309 (vitest 5 + coverage-v8 4) and #308 (the mirror) were two halves of
      one bump, each red for the other's absence. Verified locally before pushing:
      `bun run test:coverage` completes at 68.56% lines vs a threshold of 55. #308 closed as
      superseded. **The tell was there and I under-read it: math-mcp took vitest 5 cleanly the
      same morning — not because it is different, but because it runs no coverage job and so
      never paired the two majors.**
- [ ] ~~ORIGINAL (superseded):~~ **vitest 4 -> 5 cannot land here yet: `@vitest/coverage-v8` 5 breaks the coverage step.**
      PRs #309 (vitest) and #308 (coverage-v8) are red, and it is a REAL breaking change, not
      the usual `bun.lock` plumbing. Run 34108055630, job **Generate Coverage Report**, step
      *Run tests with coverage*:

      ```
      TypeError: Expected string coverage payload, received object,
      {"result":[{"scriptId":"208","url":"file:///.../document-builders.test.ts", ...
      ```

      **All 220 test files PASS.** Only the coverage reporter fails, so the library itself is
      compatible with vitest 5 — what breaks is the v8 coverage payload changing from a string
      to an object. The message comes from vitest 5's own code, not ours (nothing in this repo
      or in the vitest-4 `node_modules` contains that string).

      **Useful contrast: math-mcp took vitest 5 cleanly** (#106 merged the same morning), because
      it does not run this coverage job. So the blocker is the coverage integration, not vitest.

      Both PRs must land TOGETHER when it is fixed — splitting them leaves vitest and
      coverage-v8 on mismatched majors, which is its own failure.

## Done

- [x] **SHA-pin the three third-party GitHub Actions** (`c879b038`, 2026-08-27).
  `codecov/codecov-action`, `schneegans/dynamic-badges-action` and `softprops/action-gh-release`
  were on mutable tags. A tag can be repointed by its owner, so a bare tag grants that owner the
  ability to change what runs in this repo's CI. Each now pins the resolved commit with the
  version as a trailing comment. Verified: no unpinned third-party action remains, all workflow
  YAML parses, and Code Coverage passed on the pin commit.
- [x] **Fix the red `master`** (`64c2bfa`, 2026-08-27). The repo's own version-consistency gate had
  been failing since 2026-08-25: the 9.5.3 release bumped `plugin.json` and `package.json` but left
  `skills/think/SKILL.md` and `CLAUDE.md` claiming v9.5.2. Verified locally
  (`test/test_version_consistency.py` exits 0) before pushing; CI green after.

- [x] **Gitignore `.tracker-watch.json`** (`89e9c5b`, 2026-08-27) — agent-local
  infrastructure, kept out of the published tree.

## Open

- [ ] **A release bump must update the prose mentions, not only the manifests.** That is exactly
  what went red above, and `test/test_version_consistency.py` is the gate that catches it — run it
  as part of the release step rather than discovering it on CI two days later.
- [ ] **`npm audit` does not work here.** This repo uses `bun.lock`, so
  `npm audit --package-lock-only` silently audits **nothing** and reports no lockfile — which
  reads like a clean result and is not one. Audit from a temp-generated lock
  (`npm install --package-lock-only --ignore-scripts` on a copied `package.json`) until Bun is
  installed on the machine. Last audited 2026-08-27: **clean**.

## State (2026-09-04)

Version **10.0.0**, in sync with npm and with the tag (`v10.0.0`); 0 open PRs; 0 open Dependabot
alerts. Released as a **dependency major** — the runtime moved from `@modelcontextprotocol/sdk@1.x`
to `@modelcontextprotocol/{server,client,core}@2.x`. It is **not** a protocol change: the negotiated
MCP wire revision is `2025-11-25` before and after, verified by a live stdio round trip against the
published artifact.

Known stale: `sbom.json` still describes 9.1.3 and lists `@modelcontextprotocol/sdk 1.29.0`, a
dependency this package no longer has. It was generated once (2026-05-02) by
`@cyclonedx/cyclonedx-npm`, which reads an npm tree; this repo is now bun-only, so the generator
was orphaned by that migration and nothing regenerates it. Needs a bun-capable generator, a
synthesised lockfile, or removal — tracked, not silently patched.
