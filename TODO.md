# TODO — deepthinking-mcp

Repo-level task tracker. Cross-repo roll-up lives in `~/Github/TODO.md`; per-change history is in
[`CHANGELOG.md`](CHANGELOG.md).

## Flaky on Windows

- [x] 🔴 **`FileSessionStore` concurrent reads return `undefined` on Windows.** `tests/unit/file-store.test.ts > concurrent operations > should handle concurrent reads` failed on windows-latest (Node 22.x) in run 36910387395 attempt 1 and passed on the rerun. The log shows ENOENT opening lock files in `<session>.json.locks\` just before the failure, so concurrent readers race in `src/utils/file-lock.ts` and a read can report an existing session as missing. Find the cause, reproduce it locally on Windows, fix it with a RED test first.
- [x] 🔴 **The shared-lock `mkdir` itself loses the same race.** The coverage job on `master` 82c8907 (run 37135019767) failed "never fails concurrent staggered readers": 22 of 40 readers rejected. The recursive `mkdir` in `acquireSharedLock` sat outside the retry, and a concurrent `rmdir` makes it throw `ENOENT` (and `EPERM` on Windows): 1,860 and 14 in an 8 s Node 24 probe. Fixed with RED tests per error code, an `EACCES` test that must still fail at once, and a staggered test that names the rejected codes.
- [x] 2026-10-03 · five-axis pass (shared-lock mkdir race): stability — the read path no longer fails on a concurrent release, and the staggered test now names each rejection's code; reliability — no non-race `mkdir` error is swallowed (`EACCES` still fails in under 1 s). NOT done: speed not measured (no hot-path change); `ENOENT` retries without a sleep, as the existing `writeFile` retry does, so a sustained race spins until `timeout`. CHANGELOG: folded two stray `[Unreleased]` sections (one shipped in 10.0.1, one belongs to the next release) and dropped the superseded "TypeScript stays at 6" bullet; duplicate subsection headings inside 10.0.0 and older were left as they are.

## Dependabot ignore rules to restore when remediation returns

The root Dependabot entry was removed on 2026-10-01 because no updater ecosystem works on a
Bun-managed root (see `.github/dependabot.yml`). The ignore rules below went with it. They are
NOT obsolete - they are inert only while nothing proposes updates, and each one must be restored
with the entry.

- [ ] 🟡 **The `typescript` semver-major ignore must come back with the entry.** It was:

      ```yaml
      - dependency-name: "typescript"
        update-types: ["version-update:semver-major"]
      ```

      WHY, and it still holds: TypeScript 7 is un-adoptable until the lint toolchain supports it.
      `@typescript-eslint/eslint-plugin@8.63.0` (latest at the time) declares
      `peer typescript: >=4.8.4 <6.1.0`, so `npm ci` fails with ERESOLVE. Drop the ignore only
      once `@typescript-eslint` ships TS 7 support — check with
      `npm view @typescript-eslint/eslint-plugin peerDependencies.typescript`.

## Resolved: vitest 5 major (filed + closed 2026-09-07)

- [x] **vitest 4 -> 5 cannot land here yet: `@vitest/coverage-v8` 5 breaks the coverage step.**
      **RESOLVED 2026-09-07 by landing both halves together (#309)** — and the heading above
      is kept verbatim on purpose: a closed item must still be findable by the words it was
      filed under.
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
