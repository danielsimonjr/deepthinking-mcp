# DeepThinking MCP — Data Flow Reference

This document traces every request path through the server, from the MCP `tools/call` boundary
to the response. Each section names the real files and functions on the call path, the branch
points, and what happens on failure. Facts are read from source, not inferred. Where a stated
behavior in an older document or design note does not match what the code does, this document
follows the code.

## Table of Contents

1. [General Request Flow](#1-general-request-flow)
2. [Thought Creation Flow](#2-thought-creation-flow)
3. [Validation Flow](#3-validation-flow)
4. [Session Lifecycle](#4-session-lifecycle)
5. [The 13 Tools](#5-the-13-tools)
6. [`deepthinking_session` Actions](#6-deepthinking_session-actions)
7. [`deepthinking_analyze` — Multi-Mode Analysis](#7-deepthinking_analyze--multi-mode-analysis)
8. [Export Flow](#8-export-flow)
9. [Proof Decomposition Flow](#9-proof-decomposition-flow)
10. [Error Flow](#10-error-flow)
11. [Verification](#verification)

---

## 1. General Request Flow

Every tool call enters through one MCP request handler in `src/index.ts`. `buildServer()`
(`src/index.ts:65`–`86`) creates a `Server` and calls `registerHandlers()` (`src/index.ts:149`–`227`).
`registerHandlers()` registers two handlers on that instance:

- `tools/list` (`src/index.ts:150`) — returns the 13-tool list unconditionally.
- `tools/call` (`src/index.ts:157`) — the single dispatch point for every tool call.

`main()` (`src/index.ts:1000`) gives `serveStdio()` a factory that calls `buildServer()` and sets
`legacy: "serve"`. The opening exchange of a connection selects the protocol era, and the SDK pins
one instance from the factory to that connection. The process can therefore serve a client of
either era, one era for each connection.
`main()` runs only when the module is the process entry point (`isProcessEntryPoint()`), so
importing the module starts no server. The module also exports one ready instance,
`server = buildServer()` (`src/index.ts:98`), so a test can drive the real dispatch path over an
in-memory transport.

```
Client
  │  tools/call { name, arguments }
  ▼
src/index.ts: server.setRequestHandler("tools/call", ...)            [index.ts:157]
  │
  ├─ isValidTool(name)?                                              [tools/definitions.ts]
  │    │
  │    ├─ YES → schema = toolSchemas[name]                           [tools/definitions.ts]
  │    │        input  = schema.parse(args)     ← Zod validation, THROWS on mismatch
  │    │        │
  │    │        ├─ name === "deepthinking_session"  → handleSessionAction(input)
  │    │        ├─ name === "deepthinking_analyze"   → handleAnalyze(input)
  │    │        └─ else (11 mode-grouping tools)     → handleAddThought(input, name)
  │    │
  │    └─ NO  → name === "deepthinking" (legacy, hidden from tools/list)?
  │              │
  │              ├─ YES → ThinkingToolSchema.parse(args)              [tools/thinking.ts]
  │              │        switch(input.action) → handleAddThought / handleSessionAction
  │              │        response gets a deprecation warning prepended
  │              │
  │              └─ NO  → throw new Error(`Unknown tool: ${name}`)
  ▼
try { ... } catch (error) {
  return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
}
```

The whole dispatch body (`index.ts:160`–`225`) runs inside one `try`/`catch`. Every error raised
anywhere downstream — a Zod validation failure, a missing session, a thrown `DeepThinkingError`
subclass, an unexpected exception — is caught at this single point, stringified, and returned as
an MCP tool result with `isError: true`. There is no per-branch error handling; see
[Error Flow](#10-error-flow) for what each failure class looks like at this boundary.

### Schema validation happens before any business logic runs

`schema.parse(args)` at `index.ts:164` is a hard gate: it runs before `handleAddThought`,
`handleSessionAction`, or `handleAnalyze` are ever called, so a structurally invalid request
never reaches a handler function. Each of the 13 tools has its own Zod schema
(`src/tools/schemas/`), and each mode-grouping tool's schema fixes `mode` to a closed enum of
just the 2–4 modes that tool covers (for example `StandardSchema` at
`src/tools/schemas/modes/core.ts` accepts only `"sequential" | "shannon" | "hybrid"`). A
caller cannot pass an arbitrary mode string to `deepthinking_core` and have it silently coerced —
Zod rejects it before dispatch.

### Input-size caps are enforced in the schema layer, not downstream

Every free-text string and every array in `src/tools/schemas/**` is bounded, via shared
primitives in `src/tools/schemas/shared.ts`:

| Schema helper | Cap | Used for |
|---|---|---|
| `IdSchema` | 1,000 chars | short identifiers, enum-like strings, `from`/`to`/node refs |
| `NameSchema` | 500 chars | names, titles, labels |
| `TextSchema` | 10,000 chars | free-text content, descriptions, explanations |
| `ThoughtTextSchema` | 100,000 chars | the `thought` field itself, large model/proof source |
| `boundedArray(item, max)` | 1,000 items (500 for structured-object arrays) | any array field |
| `boundedRecord(key, value, max)` | 1,000 entries | any record/map-shaped field |

These caps come from `MAX_LENGTHS` in `src/utils/sanitization.ts` and are the single source of
truth — the schema layer imports them rather than hardcoding separate numbers. Because Zod
applies them at the tool boundary, a raw tool call cannot carry a multi-megabyte string or a
very long array through validation. The legacy `deepthinking` tool's schema
(`src/tools/thinking.ts`) imports the same `MAX_LENGTHS`, so a caller cannot bypass the caps of
the focused tools by using the old tool name.

The `deepthinking_analyze` schema adds its own numeric caps that don't come from `MAX_LENGTHS`:
`customModes` accepts 2–10 entries from a closed list of 34 mode strings (`analyze.ts`),
and `timeoutPerMode` is an integer from 1,000 to 120,000 (`analyze.ts`); Zod rejects a value outside
that range.

### What is not gated here

Session-level limits — active-session count, thoughts-per-session, session timeout — are not
enforced at this boundary. They are enforced later, inside `SessionManager`; see
[Session Lifecycle](#4-session-lifecycle).

---

## 2. Thought Creation Flow

This is the path used by the 11 mode-grouping tools and by the legacy `deepthinking` tool's
`add_thought` action. The legacy tool is hidden from `tools/list`, so the 11 mode-grouping tools
are 11 of the 13 listed tools (`deepthinking_session` and `deepthinking_analyze` do not create a
single thought this way; see their own sections).

```
handleAddThought(input, toolName)                                    [index.ts:286]
  │
  ├─ sessionManager = await getSessionManager()                      [index.ts:118, lazy cached promise]
  │
  ├─ sessionId = input.sessionId
  │    └─ if absent: sessionManager.createSession({ mode, title })   [creates a new session first]
  │
  ├─ mode = input.mode || ThinkingMode.HYBRID
  │
  ├─ thought = thoughtFactory.createThought(input, sessionId)        [services/ThoughtFactory.ts]
  │    │
  │    │   ThoughtFactory is a module-level singleton constructed once at
  │    │   module load (index.ts:107), with autoRegisterHandlers=true —
  │    │   its constructor calls registerAllHandlers() (modes/index.ts),
  │    │   which populates the ModeHandlerRegistry singleton with all 35
  │    │   handlers before the first request ever arrives.
  │    │
  │    └─ this.registry.createThought(input, sessionId)               [modes/registry.ts]
  │         │
  │         ├─ mode = input.mode || ThinkingMode.HYBRID
  │         ├─ handler = this.getHandler(mode)                        [modes/registry.ts]
  │         │    └─ handlers.get(mode) ?? new GenericModeHandler(mode) [fallback for any
  │         │                                                           mode with no registered
  │         │                                                           specialized handler]
  │         └─ return carryBaseFields(handler.createThought(input, sessionId), input)
  │              (copies revisionReason, branchFrom, branchId, uncertainty,
  │               dependencies and assumptions from the input when the
  │               handler left them unset)
  │
  ├─ session = await sessionManager.addThought(sessionId, thought)    [session/manager.ts]
  │    │   (validates session exists, enforces maxThoughtsInMemory,
  │    │    sanitizes content, runs advisory validation and proof analysis,
  │    │    appends, updates metrics — see §4)
  │
  ├─ hasHandler = thoughtFactory.hasSpecializedHandler(thought.mode)
  │    └─ builds a `modeStatus` object in the response: whether the mode is
  │       "fully implemented", whether a specialized handler exists, and an
  │       informational note when it doesn't. This is reporting, not a gate —
  │       a mode with no specialized handler still creates a thought via
  │       GenericModeHandler; the request never fails for this reason.
  │
  └─ return { sessionId, thoughtId, thoughtNumber, mode, nextThoughtNeeded,
              sessionComplete, totalThoughts, modeStatus, validation, proofAnalysis,
              decomposition, consistencyReport, gapAnalysis }          [AddThoughtResponse]
```

The last three fields read `decomposition`, `consistencyReport` and `gapAnalysis` from the thought.
No tool schema declares those fields, so through the 13 tools they are always absent (§9).

### Where mode-specific enrichment happens

Enrichment (auto-computed Bayesian posteriors, Nash-equilibrium detection, and similar
mode-specific logic) happens entirely inside the individual handler's
`createThought()` implementation in `src/modes/handlers/`, before the thought object is ever
returned to `ThoughtFactory`. There is no separate enrichment pass afterward. Concretely:

- `BayesianHandler.createThought()` computes the posterior from the supplied `priorProbability`
  and `likelihood` (each defaults to 0.5), unless the caller passes `posteriorProbability`.
- `GameTheoryHandler.createThought()` runs Nash-equilibrium detection over the supplied payoff
  matrix.
- `HistoricalHandler.createThought()` performs source-reliability scoring and pattern detection
  over supplied historical evidence.

A handler may also implement `getEnhancements(thought)`, which returns `ModeEnhancements` fields
(`suggestions`, `warnings`, `guidingQuestions`, `relatedModes`, mode-specific `metrics`; see
`ModeHandler.ts` for the shape). The method is optional on the `ModeHandler` interface. No code
under `src/` calls it, so no tool response carries these fields; only the handler tests call it.
`SystemsThinkingHandler.createThought()` only copies fields onto the thought. Its archetype
detection (8 known systems archetypes) runs inside `getEnhancements()`, so it never runs on a
live request.
The enrichment that `createThought()` performs is not a second network round trip or a deferred
computation; it all happens synchronously inside `createThought()`.

### Specialized vs. generic handler

`ModeHandlerRegistry.getHandler(mode)` (`modes/registry.ts`) is the only place this decision
is made. `registerAllHandlers()` registers a specialized handler class for each of the 35
`ThinkingMode` members (the 34 reasoning modes and `custom`), so every member gets its
specialized handler. Only a mode string that is not a `ThinkingMode` member falls through to
`GenericModeHandler`, which implements the same `ModeHandler` interface with mode-agnostic field
handling. `hasSpecializedHandler(mode)` is a plain `Map.has()` check — it
never throws and never blocks thought creation.

### The legacy `deepthinking` tool's `add_thought` action

Routes through the identical `handleAddThought()` function (`index.ts:194`-`200`), with the tool
name for routing purposes derived from `modeToToolMap[input.mode]` rather than the literal tool
name the client called — the function body doesn't otherwise change behavior based on which of
the two entry tools was used.

---

## 3. Validation Flow

Three validation mechanisms exist in this codebase. Two of them run on a live `add_thought`-style
call: Zod at the tool boundary, which can reject the call, and an advisory pass inside
`SessionManager.addThought()`, which only reports. The third, `ModeHandler.validate()`, runs only
inside the multi-mode `analyze` path. This section states which is which — the most
consequential fact for anyone extending validation in this codebase.

### 3a. What actually runs: Zod schema validation at the tool boundary

As described in [§1](#1-general-request-flow), `schema.parse(args)` at `index.ts:164` is the only
validation step that can reject a live request before a thought is created. It checks structural
shape (required fields, types, enum membership for `mode`) and the input-size caps in
`src/tools/schemas/shared.ts`. It runs once, per call, before dispatch to
`handleAddThought`/`handleSessionAction`/`handleAnalyze`. A `ZodError` here is caught by the
outer `try`/`catch` in the `tools/call` handler and returned as a generic
`Error: <message>` response — see [Error Flow](#10-error-flow).

### 3b. What runs only in `analyze`: `ModeHandler.validate()`

Every `ModeHandler` implementation carries its own `validate(input): ValidationResult` method
(declared on the `ModeHandler` interface in `modes/handlers/ModeHandler.ts`), and
`ModeHandlerRegistry.validate()` and `ThoughtFactory.validate()` both expose it. No handler's
`createThought()` calls `this.validate()`, and `handleAddThought` never calls `.validate(`. A live
`add_thought`-style tool call therefore never runs mode-specific business validation
(required-field combinations, cross-field consistency, mode-specific numeric ranges) through this
method. The one live caller is the combination analyzer: `runMode()` in
`modes/combinations/analyzer.ts` builds a thought with `factory.createThought()`, calls
`factory.validate(input)`, and folds the result into the insight for that mode. The result is
advisory there too: it never rejects a mode or fails the analysis. The
`modeStatus.hasSpecializedHandler` field in the response (§2) is informational only and is not
derived from calling `validate()`.

### 3c. What also runs, as feedback only: the `src/validation/` engine

`src/validation/validator.ts` defines `ThoughtValidator`, a class that validates an already-typed
`Thought` (not raw tool input) against a per-mode validator resolved through
`src/validation/validators/index.ts` → `getValidatorForMode()`, with results cached in
`ValidationCache` (`src/validation/cache.ts`, SHA-256-keyed LRU, sized by
`MCP_VALIDATION_CACHE_SIZE`, gated by `MCP_ENABLE_VALIDATION_CACHE`). One path reaches it:
`SessionManager.addThought()` calls `validateAdvisory()` from `src/validation/advisory.ts` after it
sanitises the content and stamps the session id and the time. `validateAdvisory()` runs one shared
`ThoughtValidator` and returns a bounded result that never throws. The result becomes
`thought.validation` and the `validation` field of the `add_thought` response. The pass is gated per
session by `SessionConfig.enableValidation`, which defaults to `true`. It is feedback only:
`isValid: false` never rejects the thought, and a validator that throws degrades to
`{ available: false, reason }`. `src/index.ts` imports nothing from `src/validation/`, and nothing in
`src/` imports the `src/validation/index.ts` barrel.

Mode resolution inside the engine has two paths, worth documenting because they resolve differently:

- **The lazy path** (`src/validation/validators/registry.ts`) — `VALIDATOR_REGISTRY`, a table of
  34 modes each mapped to a `{ load, className }` pair. `ValidatorRegistry.getAsync(mode)` checks
  its cache, then calls `loadValidator()`. `loadValidator()` runs `await config.load()`, a literal
  `import()` of the mode file. It instantiates the validator class on first use and caches the
  instance afterward. This is the path `ThoughtValidator.performValidation()` actually calls,
  through `getValidatorForMode` (re-exported from the barrel).
- **The static barrel** (`src/validation/validators/index.ts`) — re-exports 25 validator classes
  as direct named exports (`SequentialValidator`, `MathematicsValidator`, ..., `ModalValidator`,
  `ConstraintValidator`, `StochasticValidator`, `RecursiveValidator`, `MetaValidator`), for any
  code that wants to import and construct a validator directly rather than through the registry.

The two lists differ in one name and in ten. `MetaValidator` is exported by the barrel and has no
entry in `VALIDATOR_REGISTRY`. `ThinkingMode` has no `meta` member (the real mode is
`metareasoning`, which has its own entry), so no thought can reach `MetaValidator`. Ten modes in the
registry (`engineering`, `firstprinciples`, `systemsthinking`, `scientificmethod`, `formallogic`,
`algorithmic`, `synthesis`, `argumentation`, `critique`, `analysis`) have no corresponding static
export in the barrel — they are reachable only through the registry's `load` functions.
`ThinkingMode.CUSTOM` is in neither list, because a user-defined mode has no fixed shape for a mode
validator; `performValidation()` adds a warning-severity issue for a mode without a validator.
Every other `ThinkingMode` member has a registry entry. The two "supported mode" lists in this
subsystem are therefore not interchangeable.

### Net effect for a live thought

A thought's `mode`, `thought` text, and structured mode-specific fields are checked for shape and
size by Zod. That layer can reject the call. After it, `SessionManager.addThought()` grades the
stored thought with its mode validator (§3c) and returns the result in the `validation` field of
the response. The server stores the thought whatever that result says. Semantic correctness that
no mode validator checks is not caught at creation time; it either surfaces later if a handler's
enrichment logic trips on it, or not at all.

---

## 4. Session Lifecycle

### Lazy initialization

`SessionManager` is not constructed at module load. `getSessionManager()` (`index.ts:118`) is an
async function every handler calls before touching sessions; it uses a cached-promise pattern
(`_sessionManagerPromise`, `index.ts:112`) so concurrent first calls all await the same
initialization rather than racing to construct two managers:

```
getSessionManager()
  ├─ if _sessionManager already set → return it immediately (fast path, no promise involved)
  └─ else, if no init in flight → start one:
       sessionDir = process.env.SESSION_DIR
       ├─ sessionDir set   → storage = new FileSessionStore(sessionDir)
       │                     await storage.initialize()
       │                     _sessionManager = new SessionManager({}, undefined, storage)
       └─ sessionDir unset → _sessionManager = new SessionManager()   [in-memory only]
```

### In-memory storage (default)

`SessionManager` holds active sessions in an `LRUCache<ThinkingSession>`
(`session/manager.ts`, `cache/lru.ts`), sized by `getConfig().maxActiveSessions`
(`MCP_MAX_SESSIONS`, default 100). When the cache evicts a session (`onEvict` in
`session/manager.ts`):

- If `storage` is configured and the session's `enableAutoSave` is true, the evicted session is
  saved to disk before being dropped from memory.
- Otherwise, the session and every thought in it are gone. This is logged as a `warn`, not
  silently dropped.

### File-based storage (`SESSION_DIR`)

`FileSessionStore` (`session/storage/file-store.ts`) lays sessions out as
`{baseDir}/sessions/{sessionId}.json` plus a `{baseDir}/metadata/index.json` index for fast
listing. It exists to let multiple MCP server instances share one session pool (see the
multi-instance config example in the project's `CLAUDE.md`).

Cross-process safety comes from `src/utils/file-lock.ts`, not a dedicated `locks/` directory —
`withLock`/`withSharedLock` implement `.lock` sidecar files carrying PID, hostname, timestamp,
and an instance ID, with exclusive locks for writes and shared locks for concurrent reads. Stale
locks (older than `staleThreshold`, default 30s) are detected and cleaned up automatically; lock
acquisition retries for up to `timeout` (default 10s) at `retryInterval` (default 50ms) before
giving up.

A shared lock lives in a directory of per-reader lock files. A reader that releases the last
shared lock removes that directory. A second reader can then meet the removal between its
`mkdir` and its `writeFile`. `acquireSharedLock` treats that race as a retry. An `ENOENT` from
either call restarts the attempt. So does an `EPERM` from `mkdir` on Windows, and an `EINVAL`
from `writeFile` on macOS. The `EINVAL` retry first waits one `retryInterval`. A refusal that does not
clear ends as the timeout error, with the last `EINVAL` as its `cause`. Any other `mkdir` error
propagates. From `writeFile`, `EEXIST` returns a release function for the lock file that already
exists, and any other error propagates.

### Thought accumulation and the enforced cap

`SessionManager.addThought()` (`session/manager.ts`) is the single mutation point for adding
a thought to a session:

1. `validateSessionId(sessionId)` — rejects malformed IDs (path-traversal defense, since a
   session ID becomes part of a filesystem path under `SESSION_DIR`).
2. Look up the live session; throw `SessionNotFoundError` if absent or expired.
3. **Capacity check**: if `session.thoughts.length >= maxThoughtsInMemory`
   (default 1,000), throw `ResourceLimitError` before any mutation happens — no push, no metrics
   update, no auto-save attempt. The chosen behavior on hitting the cap is **rejection**, not eviction of the oldest
   thought — dropping old thoughts was considered and rejected because downstream consumers
   (metrics, exporters, proof-decomposition dependency IDs) assume every `thoughtNumber`/`id`
   a later thought references (`revisesThought`, `dependencies`) stays resolvable; silently
   deleting history could break those references without a full audit of every consumer.
4. Sanitize `thought.content` via `sanitizeThoughtContent()`.
5. Stamp `sessionId` and a fresh `timestamp` onto the thought.
6. Advisory validation: when `SessionConfig.enableValidation` is true (the default), set
   `thought.validation` from `validateAdvisory()` (§3c). It is feedback only and never rejects.
7. Advisory proof analysis: unless `SessionConfig.enableProofAnalysis` is `false`, set
   `thought.proofAnalysis` from `analyzeProofAdvisory()`. It returns nothing when the thought
   has no proof content. It is feedback only.
8. Push the thought, update `currentThoughtNumber` and `updatedAt`.
9. Update metrics via `SessionMetricsCalculator`, and record the thought for meta-reasoning
   tracking (`recordMetaThought`).
10. If `thought.nextThoughtNeeded` is false, set `session.isComplete` to true.
11. If storage is configured and the session's `enableAutoSave` is true, save the session. A
    failed save is logged and does not fail the call: the thought stays in memory.

`compressionThreshold` (`MCP_COMPRESSION_THRESHOLD`, default 500) is read into config but nothing
in `src/session/` implements compression — the field is inert.

### Session timeout

`MCP_SESSION_TIMEOUT_MS` (default `0` = no timeout) is enforced lazily, on access, not by a
background timer — deliberately, to avoid a process-lifetime interval handle. `getLiveSession()`
(`session/manager.ts`) checks `isSessionExpired()` (comparing
`Date.now() - session.updatedAt` against the timeout) every time a session is read, and evicts it
on the spot if expired. `getSession()` re-checks expiry a second time after a storage reload
(`session/manager.ts`) — necessary because reloading a persisted session doesn't change its
`updatedAt`, so without the second check an expired file-backed session would be evicted and then
immediately resurrected from disk on every subsequent read, making the timeout a no-op for
`SESSION_DIR`-backed reads.

### Export, mode switch, deletion

Covered in [§6](#6-deepthinking_session-actions).

---

## 5. The 13 Tools

A live `tools/list` handshake returns exactly these 13 tool names, in this order
(`src/tools/definitions.ts`, backed by `src/tools/json-schemas.ts`). The first 11 are
mode-grouping tools sharing the [thought-creation flow](#2-thought-creation-flow); each fixes
`mode` to a closed enum in its own Zod schema (`src/tools/schemas/modes/*.ts`), so a client cannot
pass a mode belonging to a different tool's group.

| Tool | Modes accessible via this tool's schema |
|---|---|
| `deepthinking_core` | inductive, deductive, abductive |
| `deepthinking_standard` | sequential, shannon, hybrid |
| `deepthinking_mathematics` | mathematics, physics, computability |
| `deepthinking_temporal` | temporal, historical |
| `deepthinking_probabilistic` | bayesian, evidential, stochastic |
| `deepthinking_causal` | causal, counterfactual |
| `deepthinking_strategic` | gametheory, optimization, constraint |
| `deepthinking_analytical` | analogical, firstprinciples, metareasoning, cryptanalytic |
| `deepthinking_scientific` | scientificmethod, systemsthinking, formallogic, modal |
| `deepthinking_engineering` | engineering, algorithmic, recursive |
| `deepthinking_academic` | synthesis, argumentation, critique, analysis |
| `deepthinking_session` | actions, not modes — see [§6](#6-deepthinking_session-actions) |
| `deepthinking_analyze` | multi-mode analysis — see [§7](#7-deepthinking_analyze--multi-mode-analysis) |

This table is the full `modeToToolMap` in `src/tools/definitions.ts`, cross-checked
against each tool's Zod schema (each of the ten schema files in `src/tools/schemas/modes/` has a
`mode` field that is a closed enum). It accounts for all 34 reasoning modes, and each mode belongs to
exactly one tool. The `custom` mode has a registered handler but no entry in `modeToToolMap`, and
no tool schema accepts it as a thought mode. The legacy `deepthinking` tool
(`src/tools/thinking.ts`) is hidden from `tools/list`. Its `mode` field is a closed enum of 20
modes: `sequential`, `shannon`, `mathematics`, `physics`, `hybrid`, `inductive`, `deductive`,
`abductive`, `causal`, `bayesian`, `counterfactual`, `analogical`, `temporal`, `gametheory`,
`evidential`, `firstprinciples`, `systemsthinking`, `scientificmethod`, `optimization` and
`formallogic`. The other 14 reasoning modes and `custom` are not in it.

### Distinguishing step per tool

Each mode-grouping tool's schema, beyond the shared `BaseThoughtSchema` fields (`sessionId`,
`thought`, `thoughtNumber`, `totalThoughts`, `nextThoughtNeeded`, revision/branch fields,
`uncertainty`, `dependencies`, `assumptions` — `tools/schemas/base.ts`), adds the
mode-specific structured fields that its handlers consume for enrichment (§2):
`deepthinking_probabilistic` adds prior/likelihood fields the `BayesianHandler` uses to
auto-compute a posterior; `deepthinking_strategic` adds a payoff-matrix shape the
`GameTheoryHandler` searches for equilibria; `deepthinking_scientific` adds fields such as
`components` and `feedbackLoops`, which `SystemsThinkingHandler` copies onto the thought. Its `validate()`, which checks them, runs
only in the analyze path (§3b). The routing logic itself — which tool maps
to which handler — is identical across all 11; what differs is purely which structured fields
each schema accepts and therefore which enrichment each handler can run.

`deepthinking_session` and `deepthinking_analyze` are qualitatively different: they don't create
a single mode-tagged thought from a fixed enum. `deepthinking_session` bundles 7 session-lifecycle
**actions** behind one `action` enum field; `deepthinking_analyze` runs several modes at once
against one thought and merges the results. Both are covered below.

---

## 6. `deepthinking_session` Actions

`handleSessionAction()` (`index.ts:368`) is a plain switch over `input.action`
(`SessionActionEnum` — `summarize`, `export`, `export_all`, `get_session`, `switch_mode`,
`recommend_mode`, `delete_session`, `tools/schemas/shared.ts`), dispatching to one
handler function per action, all defined in `src/index.ts`.

### `summarize`

`handleSummarize()` (`index.ts:394`) requires `sessionId`, calls
`sessionManager.generateSummary(sessionId)` (`session/manager.ts`), and returns the result as
plain text. The summary itself is deterministic string-building — title, mode, thought count,
completion status, then each thought's number and the first 100 characters of its content — not a
model-generated summary. For a session of two or more thoughts, `generateSummary()` appends a
reasoning-flow report from `summarizeReasoningFlow()` (`taxonomy/flow-advisory.ts`), which runs
`MultiModalAnalyzer` over the session. The report is advisory, is capped at 4,000 characters, and
is left out when the analyser fails.

### `export` and `export_all`

Covered in full in [§8](#8-export-flow); both actions require `sessionId` and route through
`ExportService`.

### `switch_mode`

`handleSwitchMode()` (`index.ts:768`) requires `sessionId` and `newMode`, and calls
`sessionManager.switchMode()` (`session/manager.ts`). `switchMode()` first checks `newMode`
against the values of the `ThinkingMode` enum and throws `InvalidModeError` for any other string;
the outer `catch` turns that into an `Error: ...` response (§10). It then reassigns
`session.mode` and `session.config.modeConfig.mode`, updates `updatedAt`, and auto-saves if
storage and auto-save are configured. Thoughts already in the session keep the mode they were
created with. `session.mode` is the label that `get_session`, `summarize` and the exporters show.
It does not choose a handler, because each `add_thought` call takes its mode from the `mode`
field of its own input.

### `get_session`

`handleGetSession()` (`index.ts:794`) requires `sessionId`, loads the session (throwing if not
found), and returns id/title/mode/thought count/completion/metrics. `session.metrics.customMetrics`
is a `Map` internally and is converted with `Object.fromEntries()` before serialization, since
`Map` doesn't survive `JSON.stringify` directly.

### `recommend_mode`

`handleRecommendMode()` (`index.ts:838`) passes the four optional inputs (`problemType`,
`problemCharacteristics`, `includeCombinations`, `includeReasoningTypes`) to
`buildModeRecommendation()` (`services/RecommendationService.ts`), which builds the response text.
The service lives outside `src/index.ts` so that a test can import it without starting the server.
It has two independent branches, chosen by which optional input fields are present:

- **`problemType` only** (a free-text string like `"probability"` or `"mathematical"`) →
  `modeRecommender.quickRecommend(problemType)` (`types/modes/recommendations.ts`), a lookup into a
  `Record<string, ThinkingMode>` table of more than 300 keywords (for example `"bayesian"` →
  `BAYESIAN`, `"what-if"` → `COUNTERFACTUAL`, `"complex"`/`"philosophical"`/`"metaphysical"` →
  `HYBRID`). The lowercased input is tried as an exact key first, then as a substring match
  against a priority list of keywords, then against every key. With no match the result is
  `SEQUENTIAL`. The result is one mode and is not scored.
- **`problemCharacteristics` present** (a structured object: `domain`, `complexity`,
  `uncertainty`, `timeDependent`, `multiAgent`, `requiresProof`, `requiresQuantification`,
  `hasIncompleteInfo`, `requiresExplanation`, `hasAlternatives`) →
  `modeRecommender.recommendModes(characteristics)`
  (`types/modes/recommendations.ts`), which runs a large set of hand-written conditional
  rules (over 900 lines) against the supplied characteristics, pushing a `ModeRecommendation`
  (mode, 0–1 score, reasoning, strengths, limitations, examples) for every mode whose rule
  matches. If no rule matches, the result is one `SEQUENTIAL` entry with score 0.7. The list is
  sorted by score, highest first. If `includeCombinations` is also set, `recommendCombinations()`
  (`recommendations.ts`) runs a parallel rule set producing multi-mode combination
  suggestions (parallel/sequential/hybrid sequencing, rationale, synergies).
- Neither field present → throws (a caller must supply one or the other).

Both branches then append a "Reasoning Types (advisory)" section, unless the caller passes
`includeReasoningTypes: false`; the response is then the text that the branch built. The section
comes from `suggestReasoningTypesAdvisory()` (`taxonomy/advisory.ts`).
`TaxonomyClassifier.classifyText()` classifies the `problemType` and domain text, and
`SuggestionEngine.suggestForProblem()` (which uses `TaxonomyNavigator`) ranks up to 5 of the 69
reasoning types in `taxonomy/reasoning-types.ts`. The advice never changes the mode verdict
above it. A failure in the classifier loses only the classification. A failure in the engine
produces an "unavailable" note, and the recommendation stays as built.

### `delete_session`

`handleDeleteSession()` (`index.ts:859`) requires `sessionId`, then calls
`sessionManager.getSession()` itself to confirm the session exists — `deleteSession()` has no
existence check of its own, so the handler does it manually and throws a plain `Error` (not the
`SessionNotFoundError` class other handlers use) if the session is missing — then calls
`sessionManager.deleteSession()` (`session/manager.ts`), which removes the session from the
in-memory LRU, clears its meta-monitoring history/strategy/mode-transition tracking maps
unconditionally (so an explicitly deleted session leaves no meta-monitoring state behind),
and deletes it from
`storage` if file-backed persistence is configured.

---

## 7. `deepthinking_analyze` — Multi-Mode Analysis

`handleAnalyze()` (`index.ts:887`) loads the analyzer with a dynamic `import()`:

```typescript
const { MultiModeAnalyzer } = await import("./modes/combinations/index.js");   // index.ts:888
```

The import loads the whole `src/modes/combinations/` module — analyzer, merger, conflict-resolver,
text-similarity, presets — on the first `deepthinking_analyze` call rather than at server startup. The export
handlers and the legacy-tool branch also use dynamic `import()`, for `config/index.js`,
`export/file-exporter.js`, `export/profiles.js` and `tools/thinking.js`.

### The 5 presets

`getPreset(presetId)` (`modes/combinations/presets.ts`) resolves one of five fixed
`ModeCombination` objects, each pairing a mode list with a merge strategy and, for
non-`union` strategies, a strategy-specific config:

| Preset | Modes | Merge strategy |
|---|---|---|
| `comprehensive_analysis` | deductive, inductive, abductive, systemsthinking, firstprinciples | weighted (per-mode weights, e.g. deductive 0.9, abductive 0.7) |
| `hypothesis_testing` | scientificmethod, bayesian, evidential, deductive | hierarchical (scientificmethod primary; others supporting) |
| `decision_making` | gametheory, optimization, counterfactual, bayesian | weighted (per-mode weights, e.g. gametheory 0.9, bayesian 0.75) |
| `root_cause` | causal, systemsthinking, firstprinciples, abductive | hierarchical (causal primary; others supporting) |
| `future_planning` | temporal, counterfactual, bayesian, optimization | dialectical (temporal thesis, counterfactual antithesis, bayesian synthesis) |

The strategy column is the preset's own default. It applies only to a direct caller of
`MultiModeAnalyzer.analyze()` that omits `mergeStrategy`. Through `deepthinking_analyze`, the
schema defaults `mergeStrategy` to `union` and `handleAnalyze()` passes `input.mergeStrategy ||
"union"`, so a request carries a strategy every time. The caller must pass `weighted`,
`hierarchical` or `dialectical` to get one of those strategies. The merger gives the preset's
strategy config to only those three.

A caller may instead supply `customModes` (2–10 modes from a fixed list of 34 modes
in `analyze.ts`, which holds every reasoning mode but `custom`, consistent with §5).
`customModes` replace the preset entirely: `resolveModes()` drops the preset's modes, strategy and
config.

### How modes are combined

`MultiModeAnalyzer.analyze()` (`modes/combinations/analyzer.ts`) resolves the modes (custom modes
first, then the preset, then `comprehensive_analysis` as the default). `executeModes()` walks the
modes in batches of at most `maxParallelModes` (default 5). `runMode()` is synchronous, so the
modes in a batch run one after another.

`runMode()` runs each mode through its real handler. It builds a minimal `ThinkingToolInput` from
the problem statement (`context`, when present, is appended to the thought text, and
`thoughtNumber` and `totalThoughts` are both 1), calls `ThoughtFactory.createThought()` (the
same registry path as a single-mode tool call, §2), and then calls `ThoughtFactory.validate()` for
the handler's own advisory warnings (§3b). `deriveInsight()` turns the result into one `Insight`
per mode. The insight text names the mode-specific fields that the handler populated (at most 8)
and quotes up to 3 of the handler's advisory suggestions, introduced by "To reason about this
problem it needs:". The text is capped at 600 characters.

`deepthinking_analyze` supplies only the problem statement and no mode-specific field. A handler
computes a confidence from mode data (a Bayesian posterior from a prior and a likelihood, for
example), so no handler can compute one here. `deriveInsight()` therefore marks every insight
`confidenceBasis: "unavailable"`, gives it the neutral weight 0.5 (`UNSCORED_INSIGHT_WEIGHT`) and
adds a `confidenceNote`. The response always carries `confidenceBasis` and `confidenceNote`. It
carries `confidenceScore` and the per-insight `confidence` only when the basis is `derived`.

A mode that throws is recorded in `errors` (`{ mode, message, recoverable }`). `handleAnalyze()`
always sets `continueOnError: true`, so the analysis goes on with the other modes.
`timeoutPerMode` is validated (1,000–120,000 ms) and then dropped. `handleAnalyze()` does not pass
it to the analyzer. Each `runMode()` call is synchronous, so nothing can interrupt a mode and no
per-mode time limit applies.

### Merge strategies

`InsightMerger.merge()` (`modes/combinations/merger.ts`) switches on the resolved
`mergeStrategy` and dispatches to one of five internal methods:

- **`union`** — combine all insights from all modes, deduplicating near-identical ones.
- **`intersection`** — keep only insights multiple modes agree on.
- **`weighted`** — weight each mode's insights by the preset's (or a default) per-mode weight.
- **`hierarchical`** — treat one mode as primary, others as supporting evidence, per
  `HierarchicalMergeConfig` (`primaryMode`, `supportingModes`, `allowOverride`,
  `overrideThreshold`).
- **`dialectical`** — thesis/antithesis/synthesis structuring across the contributing modes.

Before merging, `ConflictResolver.detectConflicts(insights)`
(`modes/combinations/conflict-resolver.ts`) scans the collected insights for pairs that
disagree, and `resolveAll()` resolves each detected conflict; the
counts surface in the response as `conflictsDetected`/`conflictsResolved`.

### Session creation after analysis

Unlike the other 12 tools, `deepthinking_analyze` always creates a new session
(in `handleAnalyze()`) — it never accepts an existing `sessionId` to append to — and adds one
synthetic `HYBRID`-mode thought summarizing the merged conclusion and top insights,
specifically so the result becomes exportable through the normal
`deepthinking_session` `export`/`export_all` path (§8). The response includes an `exportHint`
string telling the caller exactly how to do this.

---

## 8. Export Flow

Export is reachable two ways — `deepthinking_session` with `action: "export"` or `"export_all"`,
and indirectly via the session `deepthinking_analyze` creates (§7). Both `handleExport()`
(`index.ts:416`) and `handleExportAll()` (`index.ts:600`) follow the same shape; `export` produces
one format. `export_all` produces the default set of 8 formats (`markdown`, `latex`, `json`, `html`,
`jupyter`, `mermaid`, `dot`, `ascii`), or a profile's format list, in one call.

```
handleExport(input) / handleExportAll(input)
  │
  ├─ sessionId required; session = await sessionManager.getSession(sessionId)
  │    └─ plain `Error("Session ... not found")` throw if absent (not the SessionNotFoundError
  │       class — same pattern as delete_session, §6)
  │
  ├─ config = getConfig()                                     [dynamic import: ./config/index.js]
  │
  ├─ outputDir resolution (only if requestedOutputDir or config.exportDir is set):
  │    outputDir = resolveSandboxedOutputDir(requestedOutputDir, config.exportDir)
  │                                                             [export/file-exporter.ts]
  │
  ├─ exportProfile?
  │    └─ getExportProfile(id) → resolves a named set of formats + options
  │       export builds a profile bundle and returns early; export_all uses the profile's
  │       formats in place of its default 8 and continues into the shared path
  │
  ├─ format(s) resolved: single `input.exportFormat` (default "json"), or all 8
  │    ["markdown","latex","json","html","jupyter","mermaid","dot","ascii"] for export_all,
  │    or a profile's format list
  │
  ├─ outputDir set?
  │    ├─ YES → createFileExporter({outputDir, overwrite, createDir: true}, exportSession)
  │    │        → fileExporter.exportToFile(session, format) / exportToFiles(session, formats)
  │    │        → writes to disk, returns {filePath, success, size} per format
  │    └─ NO  → exportService.exportSession(session, format) per format, content returned inline
  │             as text in the MCP response (export_all's summary omits content unless
  │             includeContent: true was passed)
  ▼
ExportService.exportSession(session, format)                    [services/ExportService.ts]
  │
  ├─ format ∈ {mermaid, dot, ascii, svg, graphml, tikz, modelica, html, uml,
  │            visual-json, visual-markdown}?
  │    └─ YES → exportVisual(session, format)                   [ExportService.ts]
  │              ├─ session.thoughts.length === 0 → throws `No thoughts in session to export`
  │              ├─ session.thoughts.length > 1 → session-level visualization (always shows
  │              │   every thought, branch, revision, dependency)
  │              └─ session.thoughts.length === 1 → mode-specific single-thought visualization
  │                   when the last thought carries mode-specific graph data (causalGraph,
  │                   timeline, ...), else a generic fallback
  │              routes into `src/export/visual/modes/<mode>.ts` (23 mode-specific files) using
  │              shared builder classes in `src/export/visual/utils/` (14 fluent builders — DOT,
  │              Mermaid, GraphML, ASCII, SVG, TikZ, UML, HTML, Markdown, Modelica, JSON, ...)
  │
  └─ else → document format switch: json / markdown / latex / jupyter
             (any other format throws `Unsupported export format`, in ExportService.ts)
```

Without an `outputDir`, a single `export` call lets an export error propagate, and the client gets
an `isError` response. With an `outputDir` (or with `MCP_EXPORT_PATH` set, which makes `outputDir`
always set), `FileExporter` catches the error of every format, so even a single `export` returns
`success: false` and `error` in a normal response. `export_all` and the profile branch of `export`
report a `success: false` entry for each failed format in both modes, so the other formats still
complete.

### `MCP_EXPORT_PATH` sandboxing

`resolveSandboxedOutputDir()` (`export/file-exporter.ts:46`) is the security boundary for every
file-write export path, called from both `handleExport` and `handleExportAll` (`index.ts:437`-
`439` and `index.ts:621`-`623`). Its model:

- The sandbox root is `config.exportDir` (from `MCP_EXPORT_PATH`) if set; otherwise it defaults to
  `~/.claude/deepthinking-exports/` (`DEFAULT_EXPORT_SANDBOX`, `file-exporter.ts:24`-`28`) — a
  caller can never write to arbitrary filesystem locations even with no env var configured.
- A caller-supplied `outputDir` argument is resolved relative to the sandbox root (not the
  process's cwd) if it's a relative path, then checked: if the resolved path is not the sandbox
  root itself and does not start with the sandbox root plus a path separator, the call throws.
- This exists specifically to block a prompt-injection vector: a compromised or manipulated model
  convincing the caller to pass `outputDir: "C:/Windows/..."` or `"/etc/..."` to write outside the
  intended sandbox.

### PII redaction — not present

No PII-redaction step exists anywhere in the export path. `resolveSandboxedOutputDir` and the
`ExportService`/visual-exporter chain control *where* content is written and *how* it is
formatted; neither redacts, masks, or filters thought content for personally identifiable
information before writing or returning it. A thought's content, once written into a session, is
exported without redaction in whichever format was requested. The exporters still transform it
for the format: they escape HTML, Mermaid and LaTeX text, and the Mermaid builder truncates labels.

### `MCP_EXPORT_OVERWRITE`

Read into `config.exportOverwrite` and used as the default for the `overwrite` flag
(`input.overwrite ?? config.exportOverwrite`) when a caller doesn't pass one explicitly. When
`overwrite` is false and the target file already exists, `FileExporter.exportToFile()`
(`file-exporter.ts`) returns a per-format failure result (`success: false, error: "File
already exists and overwrite is disabled"`) rather than throwing — a batch `export_all` call still
completes and reports which formats succeeded and which were skipped for this reason.

---

## 9. Proof Decomposition Flow

`src/proof/` holds the proof-analysis engines, the type file `branch-types.ts` and the barrel
`index.ts`. The engines are `decomposer.ts`, `gap-analyzer.ts`,
`inconsistency-detector.ts`, `circular-detector.ts` and `dependency-graph.ts` (the base set), and
`assumption-tracker.ts`, `verifier.ts`, `branch-analyzer.ts`, `hierarchical-proof.ts`,
`strategy-recommender.ts` and `patterns/warnings.ts` (the extended set). The live request path
reaches them through two wrappers, `proof/advisory.ts` (the base set) and
`proof/extended-advisory.ts` (the extended set). `SessionManager.addThought()` calls
`analyzeProofAdvisory()` from `proof/advisory.ts` (§4).

### The engines' own shape

`ProofDecomposer.decompose(proof, theorem?)` (`proof/decomposer.ts`) takes either a raw proof
string or an array of `ProofStep` objects and breaks it into `AtomicStatement`s (axiom,
definition, hypothesis, lemma, derived, conclusion) using an ordered list of regular-expression
patterns (`initializeStatementPatterns()`) — for example a line matching
`/^(?:Axiom|Postulate)\s*(?:\d+)?[:.]?\s*(.+)$/i` is classified as an axiom statement. A second
pattern list (`initializeDependencyPatterns()`) infers which earlier statements each derived
statement depends on, by matching connective phrases like "By X, we have Y" or "Substituting X
into Y". `DependencyGraphBuilder` (`proof/dependency-graph.ts`), which `ProofDecomposer` calls, turns those
dependencies into a graph. `GapAnalyzer` flags statements with no supporting justification, and
`InconsistencyDetector` and `CircularReasoningDetector` look for contradictions and circular
support in the decomposition. In the extended set, `AssumptionTracker` traces implicit assumption
chains, `ProofVerifier` checks the justification of each step, `BranchAnalyzer` finds independent
branches that could be verified in parallel, `HierarchicalProofManager` manages nested proofs with
lemmas and sub-theorems, and `StrategyRecommender` recommends proof strategies from the theorem
statement. This is pattern-matching logic — not an LLM call — and it is deterministic given the
same input text.

### How the engines reach a thought

`SessionManager.addThought()` calls `analyzeProofAdvisory(thought)` after the validation step,
unless `SessionConfig.enableProofAnalysis` is `false`. The result becomes `thought.proofAnalysis`
and the `proofAnalysis` field of the `add_thought` response. The pass is feedback only: it never
rejects a thought, and an analyser that throws degrades to `{ available: false, reason }`.

The pass is selective, because decomposition costs time that grows with the size of the proof.
It runs only when the thought carries proof content. `findProofContent()` looks for it in this
order, and at least two statements are needed:

1. A `formallogic` thought with `proof.steps`.
2. A `mathematics` or `formallogic` thought whose `theorems` list holds a theorem with proof text.
3. A `mathematics` or `formallogic` thought with `proofStrategy.steps`.
4. The thought text itself, for the proof-bearing thought types only: `proof_construction`,
   `proof_decomposition`, `lemma_derivation`, `corollary`, `dependency_analysis`,
   `consistency_check`, `gap_identification` and `assumption_trace` for `mathematics`, and
   `proof_construction` for `formallogic`.

A caller-supplied `decomposition` on the thought also starts the pass. The pass reuses that
decomposition and never overwrites it; a caller-supplied `gapAnalysis` is reused in the same way.
A thought with none of these gets no `proofAnalysis` field.

Not every source is reachable through a tool. No tool schema declares a `proof` field, a `theorems`
field, a `decomposition` field or a `gapAnalysis` field, and Zod strips a key that the schema does
not declare. Through the 13 tools, only sources 3 and 4 can start the pass: `ProofStrategySchema`
declares `proofStrategy.steps`, and the `thoughtType` field of the mathematics and scientific tools
is a free string. Sources 1 and 2, and a caller-supplied `decomposition` or `gapAnalysis`, exist for
a direct caller of `SessionManager.addThought()`.

The pass feeds the decomposer at most 200 steps (`MAX_PROOF_STEPS`). Every list in the result is
bounded (at most 50 atoms, 20 gaps, 20 inconsistencies, 10 cycles, 10 implicit assumptions and 10
notes), and the `totals` and `truncated` fields say when a list was cut. The extended set runs
inside `analyzeProofExtended()`, each engine in its own `try`, so one failure costs only that
engine's field.

### What the mathematics handler does with proof fields

`MathematicsHandler.createThought()` (`modes/handlers/MathematicsHandler.ts`) copies
`decomposition`, `consistencyReport`, `gapAnalysis` and `assumptionAnalysis` from the caller's
input onto the thought (`inputAny.decomposition`, etc.); the handler's own comment marks them
"populated by external engine". The mathematics tool schema (`tools/schemas/modes/mathematics.ts`)
does not declare these four fields, and Zod strips undeclared keys at the tool boundary, so a
client cannot supply them through any of the 13 tools. The handler copies them for programmatic
callers only. The schema does declare `proofSteps`, `theorem`, `hypotheses`, `analysisDepth`,
`includeConsistencyCheck` and `traceAssumptions`, and `MathematicsHandler` copies none of those six
fields onto the thought, so nothing downstream reads them. The handler only reads what is present,
in `getEnhancements()`. If `thought.decomposition` is set, it copies
`atomCount`/`completeness`/`rigorLevel` into `ModeEnhancements.metrics`. If
`thought.consistencyReport` is present and `isConsistent` is false, it adds a warning that counts
the inconsistencies. If `thought.gapAnalysis.gaps` is not empty, it adds a warning that counts the
gaps. No code under `src/` calls `getEnhancements()` (§2), so these warnings and metrics reach
no response. The `proofAnalysis` field is the proof feedback that a client receives.

### Verdict assembly

The request path has no single combined verdict. The results of the base analysers (gaps, cycles,
inconsistencies) and of the extended set sit side by side in `proofAnalysis`. The `extended` field
holds `assumptions`, `verification`, `branches`, `structure`, `strategies` and `fallacies`, and a
`failed` list that names the engines that threw. `ProofVerifier.verify(steps)` returns a
`VerificationResult` (errors, warnings, coverage) for the proof steps; it fills `verification`.

---

## 10. Error Flow

All 13 tools share the single `try`/`catch` around the `tools/call` handler
(`index.ts:160`-`225`, shown in full in [§1](#1-general-request-flow)). There is no per-tool or
per-action error handling above this point — every failure, regardless of where it originates,
ends up here and is turned into the same MCP response shape:

```json
{ "content": [{ "type": "text", "text": "Error: <message>" }], "isError": true }
```

### A validation failure

Zod's `schema.parse(args)` (§1, §3a) throws a `ZodError` on any structural mismatch — a required
field missing, a string over its `MAX_LENGTHS` cap, a `mode` value outside the tool's closed enum,
an array over its item cap. `ZodError.message` is a JSON-formatted list of per-field issues; that
whole string becomes the `Error: ...` text the client sees. This is the validation failure that
rejects a live request. The mode-specific `ModeHandler.validate()` runs only inside `analyze`,
and the `src/validation/` engine only reports; neither rejects a request (§3).

### An unknown mode

A mode outside a mode-grouping tool's closed enum fails Zod validation (the case above) before
any mode-resolution code runs, so that path has no separate error class. `switch_mode` is the
action that takes a free mode string: `deepthinking_session` validates `newMode` only as a
bounded string, and `SessionManager.switchMode()` checks it against the `ThinkingMode` values and
throws `InvalidModeError` (`utils/errors.ts`). The registry itself does not throw for an unknown
mode: a mode string that is not a `ThinkingMode` member and still reaches
`getHandler()` (`modes/registry.ts`) falls back to `GenericModeHandler`. Every `ThinkingMode`
member has a registered specialized handler, so only such a string takes this path.
`ErrorFactory.invalidMode()` is defined, and nothing in `src/` calls it.

### An oversized input

Caught by the same Zod path as any other validation failure — a `.max()` violation on a
`TextSchema`/`ThoughtTextSchema`/`boundedArray`/`boundedRecord` field produces a `too_big` Zod
issue, surfaced the same way as any other schema mismatch, before the request reaches a handler
or touches `SessionManager`.

### Other named error classes and where they actually fire

`src/utils/errors.ts` defines a `DeepThinkingError` base class, which carries a string `code`, a
`context` record and a `timestamp`, and 15 named subclasses: `SessionError`, `SessionNotFoundError`, `SessionAlreadyExistsError`, `ValidationError`, `InputValidationError`,
`ConfigurationError`, `InvalidModeError`, `ThoughtProcessingError`, `ExportError`,
`ResourceLimitError`, `RateLimitError`, `SecurityError`, `PathTraversalError`, `StorageError`,
`BackupError`. Four of these are thrown on a live path:
`InvalidModeError` (`SessionManager.switchMode`, §6), `SessionNotFoundError`
(`SessionManager.addThought`, `switchMode` and `generateSummary`, when the session is missing),
`ResourceLimitError` (`SessionManager.addThought`, when the session already holds
`maxThoughtsInMemory` thoughts, §4) and `StorageError` (`FileSessionStore.initialize()` on a
filesystem failure). The handlers `handleExport`, `handleExportAll`, `handleGetSession` and
`handleDeleteSession` in `index.ts` throw a plain `Error` with a similar message instead of
`SessionNotFoundError`. The client cannot tell the difference, because it sees only the message.
Outside `errors.ts`, no file constructs the other eleven classes, and nothing calls any of the 5
static methods of `ErrorFactory`. This is a stdio JSON-RPC server, and no error carries an HTTP
status code; the error types carry the string `code` that `DeepThinkingError` defines.

Every one of these errors, regardless of class, is caught by the single outer `try`/`catch` and
flattened to the same `Error: <message>` text response — the client never sees a structured error
code or type discriminator, only the message string and `isError: true`.

---

## Verification

Generated 2026-10-23 by `repo-tools map`.
Regenerate the generated reports: `npm run docs:deps` · Check: `repo-tools check . --docs=docs/architecture`

The claims below come from `repo-tools map .`, which reads the whole repository. The generated reports in this
directory come from `tools/create-dependency-graph`, which counts files and exports with its own rules. Their
counts differ for that reason.

| Claim | Value | Source |
|---|---|---|
| totalTypeScriptFiles | 528 | repo-tools map (whole repository) |
| entryRoots | 1 | repo-tools map (whole repository) |
| reachableFiles | 239 | repo-tools map (whole repository) |
| runtimeCircularDeps | 0 | repo-tools map (whole repository) |
| typeOnlyCircularDeps | 95 | repo-tools map (whole repository) |

Every flow above was traced by reading the cited source. Tool names, action names, the
mode-to-tool mapping, and which function calls which are confirmed by direct grep, with the file
path given at each claim — not derived from a metric.
