# Data Flow

## Overview

This document traces a request from the MCP client through the server and back, the session
lifecycle, and the export flow. Tool names and the request path below are read directly from
`src/index.ts`, not carried over from an older doc revision — a prior revision of this document
described a pre-refactor tool surface (`add_thought`, `create_session`, and other names) that
predates the current 13-tool architecture and no longer exists as callable tools.

## Request Processing Pipeline

A client calls one of 13 tools, listed here exactly as `src/index.ts` registers them:

`deepthinking_core`, `deepthinking_standard`, `deepthinking_mathematics`,
`deepthinking_temporal`, `deepthinking_probabilistic`, `deepthinking_causal`,
`deepthinking_strategic`, `deepthinking_analytical`, `deepthinking_scientific`,
`deepthinking_engineering`, `deepthinking_academic`, `deepthinking_session`,
`deepthinking_analyze`.

The first 10 are mode-grouping tools — each carries 2-4 related reasoning modes as an input
parameter (for example `deepthinking_core` covers inductive, deductive, and abductive).
`deepthinking_session` is different in kind: it bundles session-lifecycle **actions** (create,
list, delete, export, get_session, switch_mode, recommend_mode) as one tool's action enum, not
as six separate tools. `deepthinking_analyze` runs multi-mode analysis with presets and merge
strategies.

```
Client → tools/call (MCP JSON-RPC over stdio)
  → src/index.ts: CallToolRequestSchema handler
    → validate input (Zod schema, src/validation/)
    → ThoughtFactory.createThought()   [src/services/ThoughtFactory.ts]
      → ModeHandlerRegistry.getHandler(mode)   [src/modes/registry.ts]
        → specialized handler or generic fallback   [src/modes/handlers/]
      → returns typed Thought
    → SessionManager.addThought()   [src/session/manager.ts]
  ← tool result (JSON-RPC response)
```

A legacy `deepthinking` tool still exists in the handler map for backward compatibility. It is
hidden from `tools/list` as of the 2026-08-03 audit, so a fresh client handshake never
advertises it, but a client that already hardcodes the name still gets a response — with a
deprecation warning and the same input-size caps as the 13 focused tools.

## Session Lifecycle

1. **First tool call** — `SessionManager` initializes lazily via a cached promise. All handlers
   `await getSessionManager()` before use; there is no eager init at module load.
2. **Storage backend** — in-memory by default. Setting `SESSION_DIR` switches to file-based
   storage with cross-process file locking (`src/session/locks/`), enabling multiple server
   instances to share sessions safely (concurrent reads, exclusive writes).
3. **Thought accumulation** — each `add_thought`-equivalent action appends a typed thought to
   the session, tracked by `SessionMetricsCalculator`.
4. **Export** — `deepthinking_session` with `action: "export"` (or `export_all`) routes through
   `ExportService` to a format-specific exporter in `src/export/` (document formats) or
   `src/export/visual/` (diagram formats).
5. **Mode switching** — `action: "switch_mode"` changes which mode new thoughts use within the
   same session; prior thoughts keep their original mode.

## Export Flow

```
deepthinking_session (action: export) or deepthinking_analyze
  → ExportService   [src/services/ExportService.ts]
    → format-specific exporter
       document formats → src/export/*.ts
       visual formats    → src/export/visual/modes/<mode>.ts  (24 mode-specific files)
                            using shared builders in src/export/visual/utils/  (14 files)
  ← exported content (returned inline, or written to disk if MCP_EXPORT_PATH is set)
```

## Data Persistence — one live mechanism, one dead one

Do not confuse these two. They read similarly from the environment-variable names but only one
does anything.

- **Live**: `SESSION_DIR` (read in `src/session/`, not `src/config/`) enables file-based session
  storage shared across multiple server instances, with atomic cross-process locking. This is
  the multi-instance mechanism described under "Session Lifecycle" above.
- **Dead**: `MCP_ENABLE_PERSISTENCE` and `MCP_PERSISTENCE_DIR` are read into
  `config.enablePersistence` / `config.persistenceDir` at `src/config/index.ts:96-97`, defaulting
  to `./.deepthinking-sessions`. A repo-wide grep found zero other references to either config
  field anywhere in `src/`. Setting these environment variables changes nothing today — no code
  path consumes them. Treat any documentation of atomic-write guarantees, crash recovery, or a
  `.deepthinking-sessions/sessions/*.json` file format as describing a feature that does not
  currently run, not as a description of live behavior.

## Error Flow

Errors extend `DeepThinkingError` (`src/utils/errors.ts`) — `SessionNotFoundError`,
`ValidationError`, and others, each raised where the corresponding failure is detected
(session lookup, input validation, mode dispatch) and propagated back through the tool handler
as a structured MCP error response. This is a stdio JSON-RPC server, not an HTTP server; if you
see HTTP status codes attached to these error types elsewhere, treat that as informal severity
shorthand, not a literal transport-layer status.

## Verification

Generated 2026-08-05 by `repo_map.py map`; tool names and line numbers confirmed by direct
`grep` of `src/index.ts` and `src/config/index.ts` on 2026-08-05, not by repo_map's metrics.
Regenerate: `python repo_map.py map <repo> --out <dir>` · Check: `python repo_map.py check <repo> --docs docs/Architecture`

| Claim | Value | Source |
|---|---|---|
| totalTypeScriptFiles | 436 | dependency-graph.json |
| entryRoots | 1 | dependency-graph.json |
| runtimeCircularDeps | 0 | dependency-graph.json |

MCP tool count (13) and names, `MCP_ENABLE_PERSISTENCE`/`MCP_PERSISTENCE_DIR` dead-code status,
and `resolveSandboxedOutputDir`'s dynamic-import call sites (`src/index.ts:407-409`,
`:591-593`) are confirmed by direct source grep, not by a repo_map metric name — repo_map does
not model MCP tool registration or environment-variable usage.
