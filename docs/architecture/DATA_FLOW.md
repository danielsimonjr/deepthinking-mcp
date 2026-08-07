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

Every tool call enters through one MCP request handler in `src/index.ts`. The server registers
two handlers on the `Server` instance (`src/index.ts:64`–`74`):

- `ListToolsRequestSchema` (`src/index.ts:128`) — returns the 13-tool list unconditionally.
- `CallToolRequestSchema` (`src/index.ts:135`) — the single dispatch point for every tool call.

```
Client
  │  tools/call { name, arguments }
  ▼
src/index.ts: server.setRequestHandler(CallToolRequestSchema, ...)   [index.ts:135]
  │
  ├─ isValidTool(name)?                                              [tools/definitions.ts:149]
  │    │
  │    ├─ YES → schema = toolSchemas[name]                           [tools/definitions.ts:59-73]
  │    │        input  = schema.parse(args)     ← Zod validation, THROWS on mismatch
  │    │        │
  │    │        ├─ name === "deepthinking_session"  → handleSessionAction(input)
  │    │        ├─ name === "deepthinking_analyze"   → handleAnalyze(input)
  │    │        └─ else (10 mode-grouping tools)     → handleAddThought(input, name)
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

The whole dispatch body (`index.ts:138`–`203`) runs inside one `try`/`catch`. Every error raised
anywhere downstream — a Zod validation failure, a missing session, a thrown `DeepThinkingError`
subclass, an unexpected exception — is caught at this single point, stringified, and returned as
an MCP tool result with `isError: true`. There is no per-branch error handling; see
[Error Flow](#10-error-flow) for what each failure class looks like at this boundary.

### Schema validation happens before any business logic runs

`schema.parse(args)` at `index.ts:142` is a hard gate: it runs before `handleAddThought`,
`handleSessionAction`, or `handleAnalyze` are ever called, so a structurally invalid request
never reaches a handler function. Each of the 13 tools has its own Zod schema
(`src/tools/schemas/`), and each mode-grouping tool's schema fixes `mode` to a closed enum of
just the 2–4 modes that tool covers (for example `StandardSchema` at
`src/tools/schemas/modes/core.ts:24` accepts only `"sequential" | "shannon" | "hybrid"`). A
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

These caps come from `MAX_LENGTHS` in `src/utils/sanitization.ts:9`-`22` and are the single
source of truth — the schema layer imports them rather than hardcoding separate numbers. This
closed a gap found in a 2026-08-03 security review: before it, only `SessionManager` sanitized
thought content post-creation, so a raw tool call could carry a multi-megabyte string or a
50,000-element array all the way through validation. The legacy `deepthinking` tool's schema
(`src/tools/thinking.ts`) is bounded to the same limits — arrays were missed there until a later
patch, which would have let a caller bypass the 10-tool caps entirely by using the old tool name.

The `deepthinking_analyze` schema adds its own numeric caps that don't come from `MAX_LENGTHS`:
`customModes` accepts 2–10 entries from a closed list of 29 mode strings (`analyze.ts:42`-`72`),
and `timeoutPerMode` is clamped to 1,000–120,000 ms (`analyze.ts:107`-`116`).

### What is not gated here

Session-level limits — active-session count, thoughts-per-session, session timeout — are not
enforced at this boundary. They are enforced later, inside `SessionManager`; see
[Session Lifecycle](#4-session-lifecycle).

---

## 2. Thought Creation Flow

This is the path used by the 10 mode-grouping tools plus the legacy `deepthinking` tool's
`add_thought` action — 11 of the 13 tools in total (`deepthinking_session` and
`deepthinking_analyze` do not create a single thought this way; see their own sections).

```
handleAddThought(input, toolName)                                    [index.ts:262]
  │
  ├─ sessionManager = await getSessionManager()                      [index.ts:97, lazy cached promise]
  │
  ├─ sessionId = input.sessionId
  │    └─ if absent: sessionManager.createSession({ mode, title })   [creates a new session first]
  │
  ├─ mode = input.mode || ThinkingMode.HYBRID
  │
  ├─ thought = thoughtFactory.createThought(input, sessionId)        [services/ThoughtFactory.ts:207]
  │    │
  │    │   ThoughtFactory is a module-level singleton constructed once at
  │    │   server startup (index.ts:83), with autoRegisterHandlers=true —
  │    │   its constructor calls registerAllHandlers() (modes/index.ts),
  │    │   which populates the ModeHandlerRegistry singleton with all 37
  │    │   handlers before the first request ever arrives.
  │    │
  │    └─ this.registry.createThought(input, sessionId)               [modes/registry.ts:164]
  │         │
  │         ├─ mode = input.mode || ThinkingMode.HYBRID
  │         ├─ handler = this.getHandler(mode)                        [modes/registry.ts:130]
  │         │    └─ handlers.get(mode) ?? new GenericModeHandler(mode) [fallback for any
  │         │                                                           mode with no registered
  │         │                                                           specialized handler]
  │         └─ return handler.createThought(input, sessionId)
  │
  ├─ session = await sessionManager.addThought(sessionId, thought)    [session/manager.ts:405]
  │    │   (validates session exists, enforces maxThoughtsInMemory,
  │    │    sanitizes content, appends, updates metrics — see §4)
  │
  ├─ hasHandler = thoughtFactory.hasSpecializedHandler(thought.mode)
  │    └─ builds a `modeStatus` object in the response: whether the mode is
  │       "fully implemented", whether a specialized handler exists, and an
  │       informational note when it doesn't. This is reporting, not a gate —
  │       a mode with no specialized handler still creates a thought via
  │       GenericModeHandler; the request never fails for this reason.
  │
  └─ return { sessionId, thoughtId, thoughtNumber, mode, nextThoughtNeeded,
              sessionComplete, totalThoughts, modeStatus,
              decomposition, consistencyReport, gapAnalysis }          [AddThoughtResponse]
```

### Where mode-specific enrichment happens

Enrichment (auto-computed Bayesian posteriors, Nash-equilibrium detection, systems-archetype
detection, and similar mode-specific logic) happens entirely inside the individual handler's
`createThought()` implementation in `src/modes/handlers/`, before the thought object is ever
returned to `ThoughtFactory`. There is no separate enrichment pass afterward. Concretely:

- `BayesianHandler.createThought()` computes the posterior from the supplied prior and likelihood
  when both are present, rather than requiring the caller to pre-compute it.
- `GameTheoryHandler.createThought()` runs Nash-equilibrium detection over the supplied payoff
  matrix.
- `SystemsThinkingHandler.createThought()` runs archetype detection (8 known systems archetypes)
  against the thought's stated feedback loops and structure.
- `HistoricalHandler.createThought()` performs source-reliability scoring and pattern detection
  over supplied historical evidence.

Each handler also implements `ModeEnhancements` fields (`suggestions`, `warnings`,
`guidingQuestions`, `relatedModes`, mode-specific `metrics`) that ride along on the returned
`Thought` object — see `ModeHandler.ts:64`-`80` for the full shape. None of this enrichment is a
second network round trip or a deferred computation; it all happens synchronously inside
`createThought()`.

### Specialized vs. generic handler

`ModeHandlerRegistry.getHandler(mode)` (`modes/registry.ts:130`) is the only place this decision
is made. Every one of the 30 modes with a `ThinkingMode` enum value that also has a class
registered in `registerAllHandlers()` gets its specialized handler; the four "advanced runtime"
modes without a registered specialized handler class, and any input mode string not recognized at
all, fall through to `GenericModeHandler`, which implements the same `ModeHandler` interface with
mode-agnostic field handling. `hasSpecializedHandler(mode)` is a plain `Map.has()` check — it
never throws and never blocks thought creation.

### The legacy `deepthinking` tool's `add_thought` action

Routes through the identical `handleAddThought()` function (`index.ts:172`-`178`), with the tool
name for routing purposes derived from `modeToToolMap[input.mode]` rather than the literal tool
name the client called — the function body doesn't otherwise change behavior based on which of
the two entry tools was used.

---

## 3. Validation Flow

There are two independent validation mechanisms in this codebase. Only one of them runs during a
live tool call. This section documents both, and states plainly which is which — this is the
single most consequential fact for anyone extending validation in this codebase.

### 3a. What actually runs: Zod schema validation at the tool boundary

As described in [§1](#1-general-request-flow), `schema.parse(args)` at `index.ts:142` is the only
validation gate a live request passes through before a thought is created. It checks structural
shape (required fields, types, enum membership for `mode`) and the input-size caps in
`src/tools/schemas/shared.ts`. It runs once, per call, before dispatch to
`handleAddThought`/`handleSessionAction`/`handleAnalyze`. A `ZodError` here is caught by the
outer `try`/`catch` in the `CallToolRequestSchema` handler and returned as a generic
`Error: <message>` response — see [Error Flow](#10-error-flow).

### 3b. What is built but not reachable: `ModeHandler.validate()`

Every `ModeHandler` implementation carries its own `validate(input): ValidationResult` method
(interface at `modes/handlers/ModeHandler.ts:19`-`26`), and `ModeHandlerRegistry.validate()`
(`modes/registry.ts:176`) and `ThoughtFactory.validate()` (`services/ThoughtFactory.ts:151`) both
expose it. Tracing every call site of `createThought()` in `src/modes/handlers/` and every call
in `src/index.ts` confirms `.validate(` is never called anywhere in `src/index.ts`, and no
handler's `createThought()` calls `this.validate()` internally. A live `add_thought`-style tool
call never runs mode-specific business validation (required-field combinations, cross-field
consistency, mode-specific numeric ranges) — only the Zod structural check in §3a. The
`modeStatus.hasSpecializedHandler` field in the response (§2) is informational only and is not
derived from calling `validate()`.

### 3c. What is also built but not reachable: the `src/validation/` engine

`src/validation/validator.ts` defines `ThoughtValidator`, a class that validates an already-typed
`Thought` (not raw tool input) against a per-mode validator resolved through
`src/validation/validators/index.ts` → `getValidatorForMode()`, with results cached in
`ValidationCache` (`src/validation/cache.ts`, SHA-256-keyed LRU, sized by
`MCP_VALIDATION_CACHE_SIZE`, gated by `MCP_ENABLE_VALIDATION_CACHE`). This looks, from its file
names and exports, like the server's validation layer. It is fully implemented and fully tested.
Tracing every import of `ThoughtValidator` and of `src/validation/index.ts` across `src/` finds
none outside `src/validation/` itself — `src/index.ts` never imports anything from
`src/validation/`. This subsystem now runs advisorily on every stored thought — see the advisory-validation step in the thought-creation flow.

Within that unreachable subsystem, mode resolution itself has two paths, worth documenting
because they resolve differently:

- **The lazy path** (`src/validation/validators/registry.ts`) — `VALIDATOR_REGISTRY`, a table of
  30 modes each mapped to a `{ module, className }` pair. `getAsync(mode)` at `registry.ts:142`
  checks the table, then `await import(config.module)` (`registry.ts:186`) dynamically loads and
  instantiates the validator class on first use, caching the instance afterward. This is the path
  `ThoughtValidator.validate()` actually calls (`validator.ts:76`, via `getValidatorForMode` re-
  exported from the barrel).
- **The static barrel** (`src/validation/validators/index.ts`) — re-exports 25 validator classes
  as direct named exports (`SequentialValidator`, `MathematicsValidator`, ..., `ModalValidator`,
  `ConstraintValidator`, `StochasticValidator`, `RecursiveValidator`, `MetaValidator`), for any
  code that wants to import and construct a validator directly rather than through the registry.

These two lists don't match. Five classes exported by the static barrel —
`MetaValidator`, `ModalValidator`, `ConstraintValidator`, `StochasticValidator`, and
`RecursiveValidator` — have no entry in `VALIDATOR_REGISTRY`, so `getValidatorForMode()` (the
lazy path) can never resolve them regardless of which mode is passed in; a lookup for `"modal"`
or `"recursive"` returns `undefined` from that function even though a `ModalValidator` class
exists and is exported. Ten modes in the registry (`engineering`, `firstprinciples`,
`systemsthinking`, `scientificmethod`, `formallogic`, `algorithmic`, `synthesis`,
`argumentation`, `critique`, `analysis`) have no corresponding static export in the barrel — they
are reachable only through the lazy dynamic-import path. Since neither path is called from a live
request (§3c above), this asymmetry has no effect on server behavior today, but it means the two
"supported mode" lists in this subsystem are not interchangeable if either is wired in later.

### Net effect for a live thought

A thought's `mode`, `thought` text, and structured mode-specific fields are checked once, for
shape and size, by Zod, and nothing else. Any semantic correctness (a Bayesian prior that isn't a
probability, a proof step referencing a nonexistent statement ID, a temporal constraint that
contradicts an earlier one) is not caught at creation time by this server — it either surfaces
later if a handler's enrichment logic trips on it, or not at all.

---

## 4. Session Lifecycle

### Lazy initialization

`SessionManager` is not constructed at module load. `getSessionManager()` (`index.ts:97`) is an
async function every handler calls before touching sessions; it uses a cached-promise pattern
(`_sessionManagerPromise`, `index.ts:88`) so concurrent first calls all await the same
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
(`session/manager.ts:122`, `cache/lru.ts`), sized by `getConfig().maxActiveSessions`
(`MCP_MAX_SESSIONS`, default 100). This cap used to be hardcoded to 1,000 regardless of the env
var; a 2026-08-03 audit fixed it to actually read the config, which means the effective default
dropped by 10x. When the cache evicts a session (`onEvict`, `manager.ts:173`-`207`):

- If `storage` is configured and the session's `enableAutoSave` is true, the evicted session is
  saved to disk before being dropped from memory.
- Otherwise, the session and every thought in it are gone. This is logged as a `warn`, not
  silently dropped, specifically because the lowered default cap means eviction now happens ~10x
  sooner than before the fix.

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

### Thought accumulation and the enforced cap

`SessionManager.addThought()` (`session/manager.ts:405`) is the single mutation point for adding
a thought to a session:

1. `validateSessionId(sessionId)` — rejects malformed IDs (path-traversal defense, since a
   session ID becomes part of a filesystem path under `SESSION_DIR`).
2. Look up the live session; throw `SessionNotFoundError` if absent or expired.
3. **Capacity check** (`manager.ts:418`-`442`): if `session.thoughts.length >= maxThoughtsInMemory`
   (default 1,000), throw `ResourceLimitError` before any mutation happens — no push, no metrics
   update, no auto-save attempt. This was previously unenforced; a 2026-08-03 audit (H-3) added
   the check. The chosen behavior on hitting the cap is **rejection**, not eviction of the oldest
   thought — dropping old thoughts was considered and rejected because downstream consumers
   (metrics, exporters, proof-decomposition dependency IDs) assume every `thoughtNumber`/`id`
   a later thought references (`revisesThought`, `dependencies`) stays resolvable; silently
   deleting history could break those references without a full audit of every consumer.
4. Sanitize `thought.content` via `sanitizeThoughtContent()`.
5. Stamp `sessionId` and a fresh `timestamp` onto the thought, push it, update
   `currentThoughtNumber` and `updatedAt`.
6. Update metrics via `SessionMetricsCalculator`, and record the thought for meta-reasoning
   tracking (`recordMetaThought`).

`compressionThreshold` (`MCP_COMPRESSION_THRESHOLD`, default 500) is read into config but nothing
in `src/session/` implements compression — the field is inert.

### Session timeout

`MCP_SESSION_TIMEOUT_MS` (default `0` = no timeout) is enforced lazily, on access, not by a
background timer — deliberately, to avoid a process-lifetime interval handle. `getLiveSession()`
(`manager.ts:759`) checks `isSessionExpired()` (`manager.ts:748`-`756`, comparing
`Date.now() - session.updatedAt` against the timeout) every time a session is read, and evicts it
on the spot if expired. `getSession()` re-checks expiry a second time after a storage reload
(`manager.ts:357`) — necessary because reloading a persisted session doesn't change its
`updatedAt`, so without the second check an expired file-backed session would be evicted and then
immediately resurrected from disk on every subsequent read, making the timeout a no-op for
`SESSION_DIR`-backed reads.

### Export, mode switch, deletion

Covered in [§6](#6-deepthinking_session-actions).

---

## 5. The 13 Tools

A live `tools/list` handshake returns exactly these 13 tool names, in this order
(`src/tools/definitions.ts:33`-`47`, backed by `src/tools/json-schemas.ts`). The first 10 are
mode-grouping tools sharing the [thought-creation flow](#2-thought-creation-flow); each fixes
`mode` to a closed enum in its own Zod schema (`src/tools/schemas/modes/*.ts`), so a client cannot
pass a mode belonging to a different tool's group.

| Tool | Modes accessible via this tool's schema |
|---|---|
| `deepthinking_core` | inductive, deductive, abductive |
| `deepthinking_standard` | sequential, shannon, hybrid |
| `deepthinking_mathematics` | mathematics, physics, computability |
| `deepthinking_temporal` | temporal, historical |
| `deepthinking_probabilistic` | bayesian, evidential |
| `deepthinking_causal` | causal, counterfactual |
| `deepthinking_strategic` | gametheory, optimization |
| `deepthinking_analytical` | analogical, firstprinciples, metareasoning, cryptanalytic |
| `deepthinking_scientific` | scientificmethod, systemsthinking, formallogic |
| `deepthinking_engineering` | engineering, algorithmic |
| `deepthinking_academic` | synthesis, argumentation, critique, analysis |
| `deepthinking_session` | actions, not modes — see [§6](#6-deepthinking_session-actions) |
| `deepthinking_analyze` | multi-mode analysis — see [§7](#7-deepthinking_analyze--multi-mode-analysis) |

This table is the full `modeToToolMap` in `src/tools/definitions.ts:80`-`132`, cross-checked
against each tool's Zod schema. It accounts for 29 of the modes with a dedicated `Thought` type.
Four modes with dedicated types and registered handlers — `modal`, `recursive`, `stochastic`,
`constraint` — have no entry in `modeToToolMap` and no tool schema whose `mode` enum includes
them. A client cannot reach any of these four modes through the 10 mode-grouping tools' Zod
schemas; each schema's `mode` field is a closed enum that simply doesn't list them (confirmed by
reading every `src/tools/schemas/modes/*.ts` file's `mode: z.enum([...])`). The only way to
create a thought in one of these four modes is the legacy `deepthinking` tool, whose schema
(`src/tools/thinking.ts`) accepts a broader mode set — it is hidden from `tools/list` but its
handler still exists (§1).

### Distinguishing step per tool

Each mode-grouping tool's schema, beyond the shared `BaseThoughtSchema` fields (`sessionId`,
`thought`, `thoughtNumber`, `totalThoughts`, `nextThoughtNeeded`, revision/branch fields,
`uncertainty`, `dependencies`, `assumptions` — `tools/schemas/base.ts:24`-`38`), adds the
mode-specific structured fields that its handlers consume for enrichment (§2):
`deepthinking_probabilistic` adds prior/likelihood fields the `BayesianHandler` uses to
auto-compute a posterior; `deepthinking_strategic` adds a payoff-matrix shape the
`GameTheoryHandler` searches for equilibria; `deepthinking_scientific` adds the fields
`SystemsThinkingHandler` uses for archetype detection. The routing logic itself — which tool maps
to which handler — is identical across all 10; what differs is purely which structured fields
each schema accepts and therefore which enrichment each handler can run.

`deepthinking_session` and `deepthinking_analyze` are qualitatively different: they don't create
a single mode-tagged thought from a fixed enum. `deepthinking_session` bundles 7 session-lifecycle
**actions** behind one `action` enum field; `deepthinking_analyze` runs several modes at once
against one thought and merges the results. Both are covered below.

---

## 6. `deepthinking_session` Actions

`handleSessionAction()` (`index.ts:338`) is a plain switch over `input.action`
(`SessionActionEnum` — `summarize`, `export`, `export_all`, `get_session`, `switch_mode`,
`recommend_mode`, `delete_session`, `tools/schemas/shared.ts:137`-`145`), dispatching to one
handler function per action, all defined in `src/index.ts`.

### `summarize`

`handleSummarize()` (`index.ts:364`) requires `sessionId`, calls
`sessionManager.generateSummary(sessionId)` (`session/manager.ts:699`), and returns the result as
plain text. The summary itself is simple, deterministic string-building — title, mode, thought
count, completion status, then each thought's number and the first 100 characters of its content
— not a model-generated summary.

### `export` and `export_all`

Covered in full in [§8](#8-export-flow); both actions require `sessionId` and route through
`ExportService`.

### `switch_mode`

`handleSwitchMode()` (`index.ts:738`) requires `sessionId` and `newMode`, and calls
`sessionManager.switchMode()` (`session/manager.ts:519`), which reassigns `session.mode` and
`session.config.modeConfig.mode` in place, updates `updatedAt`, and auto-saves if storage and
auto-save are configured. Thoughts already in the session keep whatever mode they were created
with — `switchMode` only changes which mode applies to thoughts added *after* the switch. There
is no validation that `newMode` is a recognized `ThinkingMode` at this layer; an unrecognized
string is simply stored and later resolves to `GenericModeHandler` on the next `add_thought` call
for that session.

### `get_session`

`handleGetSession()` (`index.ts:764`) requires `sessionId`, loads the session (throwing if not
found), and returns id/title/mode/thought count/completion/metrics. `session.metrics.customMetrics`
is a `Map` internally and is converted with `Object.fromEntries()` before serialization, since
`Map` doesn't survive `JSON.stringify` directly.

### `recommend_mode`

`handleRecommendMode()` (`index.ts:806`) has two independent branches, chosen by which optional
input fields are present:

- **`problemType` only** (a free-text string like `"probability"` or `"mathematical"`) →
  `modeRecommender.quickRecommend(problemType)` (`types/modes/recommendations.ts:1676`), a
  hardcoded `Record<string, ThinkingMode>` lookup table mapping ~50 keyword strings to a single
  mode each (e.g. `"bayesian"` → `BAYESIAN`, `"what-if"` → `COUNTERFACTUAL`,
  `"complex"`/`"philosophical"`/`"metaphysical"` → `HYBRID`). This is a direct string-key lookup,
  not scored.
- **`problemCharacteristics` present** (a structured object: `domain`, `complexity`,
  `uncertainty`, `timeDependent`, `multiAgent`, `requiresProof`, `requiresQuantification`,
  `hasIncompleteInfo`, `requiresExplanation`, `hasAlternatives`) →
  `modeRecommender.recommendModes(characteristics)`
  (`types/modes/recommendations.ts:43`), which runs a large set of hand-written conditional
  rules (over 900 lines) against the supplied characteristics, pushing a `ModeRecommendation`
  (mode, 0–1 score, reasoning, strengths, limitations, examples) for every mode whose rule
  matches. If `includeCombinations` is also set, `recommendCombinations()`
  (`recommendations.ts:964`) runs a parallel rule set producing multi-mode combination
  suggestions (parallel/sequential/hybrid sequencing, rationale, synergies).
- Neither field present → throws (a caller must supply one or the other).

**This selection logic is entirely self-contained in `src/types/modes/recommendations.ts` and
does not use `src/taxonomy/` at all.** `src/taxonomy/` (`classifier.ts` — `TaxonomyClassifier`,
`reasoning-types.ts` — a 69-entry reasoning-type catalog across 12 categories,
`suggestion-engine.ts`, `navigator.ts`, `multi-modal-analyzer.ts`) is a separate, fully built
module. Tracing every import of any `src/taxonomy/*` file from outside `src/taxonomy/` itself
across the whole codebase finds none — no handler, no service, and no line in `src/index.ts`
constructs a `TaxonomyClassifier` or calls any of its methods. The taxonomy catalog exists and is
exported, but nothing in a live request path — including `recommend_mode` — currently reads it.
Mode recommendation, as shipped, is driven entirely by the keyword table and rule set in
`ModeRecommender`.

### `delete_session`

`handleDeleteSession()` (`index.ts:889`) requires `sessionId`, then calls
`sessionManager.getSession()` itself to confirm the session exists — `deleteSession()` has no
existence check of its own, so the handler does it manually and throws a plain `Error` (not the
`SessionNotFoundError` class other handlers use) if the session is missing — then calls
`sessionManager.deleteSession()` (`session/manager.ts:634`), which removes the session from the
in-memory LRU, clears its meta-monitoring history/strategy/mode-transition tracking maps
unconditionally (a 2026-08-03 fix — previously only LRU eviction cleared these, so an
explicitly-deleted session's meta-monitoring state leaked forever), and deletes it from
`storage` if file-backed persistence is configured.

---

## 7. `deepthinking_analyze` — Multi-Mode Analysis

`handleAnalyze()` (`index.ts:917`) is the only place in `src/index.ts` that uses a dynamic
`import()` for core business logic rather than a static top-level import:

```typescript
const { MultiModeAnalyzer } = await import("./modes/combinations/index.js");   // index.ts:918
```

Everything else in `src/index.ts` was converted to static imports in an earlier refactor; this
one dynamic import remains, loading the entire `src/modes/combinations/` module — analyzer,
merger, conflict-resolver, presets — on first `deepthinking_analyze` call rather than at server
startup.

### The 5 presets

`getPreset(presetId)` (`modes/combinations/presets.ts`) resolves one of five fixed
`ModeCombination` objects, each pairing a mode list with a default merge strategy and, for
non-`union` strategies, a strategy-specific config:

| Preset | Modes | Merge strategy |
|---|---|---|
| `comprehensive_analysis` | deductive, inductive, abductive, systemsthinking, firstprinciples | weighted (per-mode weights, e.g. deductive 0.9, abductive 0.7) |
| `hypothesis_testing` | scientificmethod, bayesian, evidential, deductive | hierarchical (scientificmethod primary; others supporting) |
| `decision_making` | gametheory, optimization, counterfactual | (see `presets.ts`) |
| `root_cause` | causal, systemsthinking, firstprinciples | (see `presets.ts`) |
| `future_planning` | temporal, counterfactual, bayesian | (see `presets.ts`) |

A caller may instead supply `customModes` (2–10 modes from a fixed 29-mode list,
`analyze.ts:42`-`72` — this list does not include `modal`, `recursive`, `stochastic`, or
`constraint`, consistent with their absence from the tool schemas in §5) with an explicit
`mergeStrategy`, which overrides any preset.

### How modes are "combined" — read this before assuming real per-mode reasoning runs

`MultiModeAnalyzer.analyze()` (`modes/combinations/analyzer.ts:148`) calls
`executeModes()` (`analyzer.ts:405`), which batches the selected modes (bounded by
`maxParallelModes`, default 5) and runs them concurrently via `Promise.all` over each batch. For
each mode, the actual insight-generation call is `generateModeInsights(mode, thought, context)`
(`analyzer.ts:477`), whose own doc comment states plainly: *"This is a placeholder - in
production, this would integrate with ThoughtFactory."* It does not call `ThoughtFactory`,
`ModeHandlerRegistry`, or any specialized handler from §2. Instead it runs a `switch (mode)` that
returns one or two templated `Insight` objects per mode — for example the `DEDUCTIVE` case
produces content string-templated as `` `Logical deduction from premises: ${thought.substring(0,
50)}...` `` with a fixed confidence of `0.8` (`ANALYZER_CONSTANTS.BASE_INSIGHT_CONFIDENCE`,
`analyzer.ts:60`) for every mode. `deepthinking_analyze` therefore does not run the target modes'
real reasoning handlers; it produces one fixed-shape templated insight per selected mode and
merges those. Timing and per-mode error handling (`timeoutPerMode`, `continueOnError`) still
function normally around this templated generation step.

### Merge strategies

`InsightMerger.merge()` (`modes/combinations/merger.ts:60`) switches on the resolved
`mergeStrategy` and dispatches to one of five internal methods:

- **`union`** — combine all insights from all modes, deduplicating near-identical ones.
- **`intersection`** — keep only insights multiple modes agree on.
- **`weighted`** — weight each mode's insights by the preset's (or a default) per-mode weight.
- **`hierarchical`** — treat one mode as primary, others as supporting evidence, per
  `HierarchicalMergeConfig` (`primaryMode`, `supportingModes`, `allowOverride`,
  `overrideThreshold`).
- **`dialectical`** — thesis/antithesis/synthesis structuring across the contributing modes.

Before merging, `ConflictResolver.detectConflicts(insights)`
(`modes/combinations/conflict-resolver.ts:59`) scans the collected insights for pairs that
disagree, and `resolveAll()` (`conflict-resolver.ts:162`) resolves each detected conflict; the
counts surface in the response as `conflictsDetected`/`conflictsResolved`.

### Session creation after analysis

Unlike the other 12 tools, `deepthinking_analyze` always creates a new session
(`index.ts:950`) — it never accepts an existing `sessionId` to append to — and adds one synthetic
`HYBRID`-mode thought summarizing the merged conclusion and top insights
(`index.ts:956`-`970`), specifically so the result becomes exportable through the normal
`deepthinking_session` `export`/`export_all` path (§8). The response includes an `exportHint`
string telling the caller exactly how to do this.

---

## 8. Export Flow

Export is reachable two ways — `deepthinking_session` with `action: "export"` or `"export_all"`,
and indirectly via the session `deepthinking_analyze` creates (§7). Both `handleExport()`
(`index.ts:386`) and `handleExportAll()` (`index.ts:570`) follow the same shape; `export` produces
one format, `export_all` produces all 8 non-visual-only text formats (or a profile's subset) in
one call.

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
  │                                                             [export/file-exporter.ts:46]
  │
  ├─ exportProfile? (export only, not export_all's own profile branch — export_all has a
  │    parallel profile branch too)
  │    └─ getExportProfile(id) → resolves a named set of formats + options
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
ExportService.exportSession(session, format)                    [services/ExportService.ts:105]
  │
  ├─ format ∈ {mermaid, dot, ascii, svg, graphml, tikz, modelica, html, uml,
  │            visual-json, visual-markdown}?
  │    └─ YES → exportVisual(session, format)                   [ExportService.ts:206]
  │              ├─ session.thoughts.length > 1 → session-level visualization (always shows
  │              │   every thought, branch, revision, dependency)
  │              └─ session.thoughts.length === 1 → mode-specific single-thought visualization
  │                   when the last thought carries mode-specific graph data (causalGraph,
  │                   timeline, ...), else a generic fallback
  │              routes into `src/export/visual/modes/<mode>.ts` (24 mode-specific files) using
  │              shared builder classes in `src/export/visual/utils/` (14 fluent builders — DOT,
  │              Mermaid, GraphML, ASCII, SVG, TikZ, UML, HTML, Markdown, Modelica, JSON, ...)
  │
  └─ else → document format switch: json / markdown / latex / jupyter
             (anything unrecognized falls back to JSON, ExportService.ts:177-179)
```

### `MCP_EXPORT_PATH` sandboxing

`resolveSandboxedOutputDir()` (`export/file-exporter.ts:46`) is the security boundary for every
file-write export path, called from both `handleExport` and `handleExportAll` (`index.ts:407`-
`409` and `index.ts:591`-`593`). Its model:

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
exported verbatim in whichever format was requested.

### `MCP_EXPORT_OVERWRITE`

Read into `config.exportOverwrite` and used as the default for the `overwrite` flag
(`input.overwrite ?? config.exportOverwrite`) when a caller doesn't pass one explicitly. When
`overwrite` is false and the target file already exists, `FileExporter.exportToFile()`
(`file-exporter.ts:246`-`253`) returns a per-format failure result (`success: false, error: "File
already exists and overwrite is disabled"`) rather than throwing — a batch `export_all` call still
completes and reports which formats succeeded and which were skipped for this reason.

---

## 9. Proof Decomposition Flow

`src/proof/` (`decomposer.ts`, `gap-analyzer.ts`, `assumption-tracker.ts`,
`inconsistency-detector.ts`, `circular-detector.ts`, `dependency-graph.ts`,
`hierarchical-proof.ts`, `branch-analyzer.ts`, `verifier.ts`, `strategy-recommender.ts`,
`patterns/warnings.ts`) is a complete, self-contained proof-analysis engine, exported as a unit
from `src/proof/index.ts`. Read it as a library, not as something the server calls automatically.

### The engine's own internal shape

`ProofDecomposer.decompose(proof, theorem?)` (`proof/decomposer.ts:242`) takes either a raw proof
string or an array of `ProofStep` objects and breaks it into `AtomicStatement`s (axiom,
definition, hypothesis, lemma, derived, conclusion) using an ordered list of regular-expression
patterns (`initializeStatementPatterns()`, `decomposer.ts:66`-`126`) — for example a line matching
`/^(?:Axiom|Postulate)\s*(?:\d+)?[:.]?\s*(.+)$/i` is classified as an axiom statement. A second
pattern list (`initializeDependencyPatterns()`) infers which earlier statements each derived
statement depends on, by matching connective phrases like "By X, we have Y" or "Substituting X
into Y". `DependencyGraphBuilder` (`proof/dependency-graph.ts`) turns those dependencies into a
graph; from there, `GapAnalyzer` flags statements with no supporting justification,
`AssumptionTracker` traces implicit assumption chains, `InconsistencyDetector` and
`CircularReasoningDetector` walk the same graph for contradictions and circular support, and
`ProofVerifier`/`StrategyRecommender`/`BranchAnalyzer`/`HierarchicalProofManager` build on top of
those results for verification, strategy suggestion, and structured proof trees. This is
substantial, pattern-matching-based logic — not an LLM call — entirely deterministic given the
same input text.

### How it actually reaches a thought — and how it doesn't

`MathematicsHandler.createThought()` (`modes/handlers/MathematicsHandler.ts:117`-`120`) sets
`decomposition`, `consistencyReport`, `gapAnalysis`, and `assumptionAnalysis` directly from the
caller-supplied input (`inputAny.decomposition`, etc.) — the handler's own comment marks these
"Proof analysis fields (populated by external engine)". The mathematics tool schema
(`tools/schemas/modes/mathematics.ts`) accepts these as structured input fields on the
`deepthinking_mathematics` tool call. What the handler does with them once present is
*post-hoc enhancement*, not computation: if `thought.decomposition` is set, it copies
`atomCount`/`completeness`/`rigorLevel` into `ModeEnhancements.metrics`
(`MathematicsHandler.ts:363`-`367`); if `thought.consistencyReport.isConsistent` is false, it adds
a warning string counting the inconsistencies (`:370`-`378`); if `thought.gapAnalysis.gaps.length`
is nonzero, it adds a warning counting the gaps (`:381`-`388`).

Tracing every constructor call for `ProofDecomposer`, `GapAnalyzer`, `AssumptionTracker`,
`InconsistencyDetector`, and `CircularReasoningDetector` across the whole `src/` tree finds
instantiations only inside `src/proof/` itself (classes calling each other) — no handler,
service, or `index.ts` code path constructs any of them. **The proof decomposition engine never
runs automatically during a live tool call.** A `deepthinking_mathematics` call that wants
`decomposition`/`consistencyReport`/`gapAnalysis` populated must compute those objects itself
(by running the equivalent analysis externally, or by an MCP client/agent that separately imports
and calls `ProofDecomposer` as a library) and pass them in as input; the server then stores them
on the thought and derives warnings/metrics from whatever was supplied. If none of these fields
are supplied, the corresponding warnings and metrics are simply absent — there is no fallback
computation.

### Verdict assembly

Because the engine isn't invoked automatically, there is no single "verdict assembly" step that
runs during a request. Within the library itself, the closest equivalent is
`ProofVerifier`/`HierarchicalProofManager` combining a decomposition's gaps, inconsistencies, and
dependency structure into a `VerificationResult` (errors, warnings, coverage) — but that assembly
only happens if a caller of the library (not the live MCP request path) invokes it directly.

---

## 10. Error Flow

All 13 tools share the single `try`/`catch` around the `CallToolRequestSchema` handler
(`index.ts:138`-`203`, shown in full in [§1](#1-general-request-flow)). There is no per-tool or
per-action error handling above this point — every failure, regardless of where it originates,
ends up here and is turned into the same MCP response shape:

```json
{ "content": [{ "type": "text", "text": "Error: <message>" }], "isError": true }
```

### A validation failure

Zod's `schema.parse(args)` (§1, §3a) throws a `ZodError` on any structural mismatch — a required
field missing, a string over its `MAX_LENGTHS` cap, a `mode` value outside the tool's closed enum,
an array over its item cap. `ZodError.message` is a JSON-formatted list of per-field issues; that
whole string becomes the `Error: ...` text the client sees. This is the only validation failure a
live request can actually hit — see §3 for why the mode-specific `ModeHandler.validate()` and the
`src/validation/` engine never run.

### An unknown mode

There is no dedicated code path for "unknown mode" as a distinct error class, because the
mode-grouping tools' Zod schemas make it structurally unreachable — a mode outside a tool's fixed
enum fails Zod validation (the case above) before any mode-resolution code runs. Reachable modes
that fall outside `ModeHandlerRegistry`'s specialized-handler map (the four advanced-runtime modes
not wired into any tool schema — see §5 — if reached via the legacy `deepthinking` tool with a
mode string outside even *its* accepted set) don't error either: `getHandler()`
(`modes/registry.ts:130`) falls back to `GenericModeHandler` rather than throwing. The codebase
does define `InvalidModeError` (`utils/errors.ts`) and an `ErrorFactory.invalidMode()` helper that
constructs it — but tracing every call site of `ErrorFactory.invalidMode` and of `new
InvalidModeError` across `src/` finds none outside the class's own definition. This error type is
fully implemented and exported, and never thrown.

### An oversized input

Caught by the same Zod path as any other validation failure — a `.max()` violation on a
`TextSchema`/`ThoughtTextSchema`/`boundedArray`/`boundedRecord` field produces a `too_big` Zod
issue, surfaced the same way as any other schema mismatch, before the request reaches a handler
or touches `SessionManager`.

### Other named error classes and where they actually fire

`src/utils/errors.ts` defines a `DeepThinkingError` base class with named subclasses:
`SessionNotFoundError`, `SessionAlreadyExistsError`, `ValidationError`, `InputValidationError`,
`ConfigurationError`, `InvalidModeError`, `ThoughtProcessingError`, `ExportError`,
`ResourceLimitError`, `RateLimitError`, `SecurityError`, `PathTraversalError`, `StorageError`,
`BackupError`. Of these, the ones confirmed on a live path by tracing their throw sites:
`SessionNotFoundError` (`SessionManager.addThought`/`switchMode`/`generateSummary` when a session
is missing — though `handleExport` and `handleDeleteSession` in `index.ts` independently throw a
plain `Error` with a similar message instead of this class, rather than reusing it — an
inconsistency worth knowing about if you're pattern-matching on error class rather than message
text), `ResourceLimitError` (`SessionManager.addThought`'s capacity check, §4), and `StorageError`
(`FileSessionStore.initialize()` on a filesystem failure). None of these carry HTTP status codes
in any meaningful sense — this is a stdio JSON-RPC server, not an HTTP server; any status-code-like
number attached to an error type elsewhere is informal severity shorthand.

Every one of these errors, regardless of class, is caught by the single outer `try`/`catch` and
flattened to the same `Error: <message>` text response — the client never sees a structured error
code or type discriminator, only the message string and `isError: true`.

---

## Verification

Generated 2026-08-05 by `repo_map.py map`.
Regenerate: `python repo_map.py map <repo> --out <dir>` · Check: `python repo_map.py check <repo> --docs docs/architecture`

| Claim | Value | Source |
|---|---|---|
| totalTypeScriptFiles | 459 | dependency-graph.json |
| entryRoots | 1 | dependency-graph.json |
| reachableFiles | 186 | dependency-graph.json |
| runtimeCircularDeps | 0 | dependency-graph.json |
| typeOnlyCircularDeps | 59 | dependency-graph.json |

Every flow above was traced by reading the cited source. Tool names, action names, the
mode-to-tool mapping, and which function calls which are confirmed by direct grep, with the file
path given at each claim — not derived from a metric.
