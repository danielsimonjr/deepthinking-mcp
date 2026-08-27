# TODO — deepthinking-mcp

Repo-level task tracker. Cross-repo roll-up lives in `~/Github/TODO.md`; per-change history is in
[`CHANGELOG.md`](CHANGELOG.md).

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

## Open

- [ ] **A release bump must update the prose mentions, not only the manifests.** That is exactly
  what went red above, and `test/test_version_consistency.py` is the gate that catches it — run it
  as part of the release step rather than discovering it on CI two days later.
- [ ] **`npm audit` does not work here.** This repo uses `bun.lock`, so
  `npm audit --package-lock-only` silently audits **nothing** and reports no lockfile — which
  reads like a clean result and is not one. Audit from a temp-generated lock
  (`npm install --package-lock-only --ignore-scripts` on a copied `package.json`) until Bun is
  installed on the machine. Last audited 2026-08-27: **clean**.

## State (2026-08-27)

Version **9.5.3**, in sync with npm and with the tag; 0 commits since `v9.5.3`; 0 open PRs;
0 open Dependabot alerts (alerting verified enabled, not merely empty).
