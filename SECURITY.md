# Security Policy

## Supported versions

Only the latest published release on npm (currently 9.2.0) receives security fixes. This project
does not maintain long-term-support branches for older minor/major versions.

| Version | Supported |
|---------|-----------|
| 9.2.x   | ✅ |
| < 9.2.0 | ❌ |

## Reporting a vulnerability

**Please do not open a public GitHub issue or pull request for a security vulnerability.** Public
issues are indexed and searchable immediately, which discloses the problem before a fix ships.

Report privately using **GitHub's private vulnerability reporting**:

1. Go to the [Security tab](https://github.com/danielsimonjr/deepthinking-mcp/security) of this
   repository.
2. Click **"Report a vulnerability"** to open a private draft security advisory.
3. Include: the affected version, a description of the issue, reproduction steps or a PoC, and the
   impact you believe it has (e.g. DoS, path traversal, injection, secret exposure).

This repo runs [CodeQL](.github/workflows/codeql.yml) on every push/PR to catch common
vulnerability classes automatically; a manually reported issue supplements that, it doesn't
duplicate it.

### What to expect

- **Acknowledgement:** within 5 business days.
- **Triage:** the maintainer will confirm severity and scope, and may ask follow-up questions in
  the private advisory thread.
- **Fix and disclosure:** once a fix is ready, it ships in a new npm release. The GitHub Security
  Advisory is published (crediting the reporter, unless you ask to stay anonymous) after the fix is
  available, following coordinated disclosure norms.

### Scope

In scope:
- The MCP server itself (`src/`) — input validation, the export sandbox
  (`src/export/file-exporter.ts`), session storage, and anything reachable through an MCP tool call.
- The build/release pipeline (`.github/workflows/`) — e.g. a workflow that could be tricked into
  running untrusted code or leaking a secret.
- The bundled Python render/validation scripts (`test/`, `scripts/`) — e.g. command injection via
  subprocess arguments.

Out of scope:
- Vulnerabilities that require the operator to have already misconfigured the deployment in an
  insecure way that the documentation explicitly warns against.
- Denial-of-service findings that only reproduce by exceeding resource limits already documented as
  unbounded (see `CLAUDE.md` → Environment Variables, "Not enforced" rows) — these are tracked as
  ordinary issues, not security reports, until they're fixed.
- Third-party dependency vulnerabilities already tracked by Dependabot
  (`.github/dependabot.yml`) — those get normal PRs, not private reports.

## Prerequisite for maintainers

Private vulnerability reporting must be enabled once, manually, in **Settings → Security → Private
vulnerability reporting** for the "Report a vulnerability" button above to appear. This is a
one-time GitHub repository setting, not something this file can turn on by itself.
