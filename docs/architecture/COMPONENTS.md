# DeepThinking MCP — Component Reference

This is a signature-level reference. For per-file dependency detail (who imports whom, which
exports are used where), see `DEPENDENCY_GRAPH.md` — this document does not repeat its per-file
listings. For request-flow sequencing, see `DATAFLOW.md`. For the full 13-tool MCP surface, see
`OVERVIEW.md`.

---

## Table of Contents

1. [Services](#services)
2. [Session](#session)
3. [Mode Handlers](#mode-handlers)
4. [Validation](#validation)
5. [Export](#export)
6. [Proof](#proof)
7. [Taxonomy](#taxonomy)
8. [Cache](#cache)
9. [Utils](#utils)
10. [Types](#types)
11. [Verification](#verification)

---

## Services

`src/services/` sits between the MCP handlers in `src/index.ts` and the mode/export subsystems.
`ThoughtFactory` and `ExportService` are classes; `RecommendationService` is a module of pure
functions. `ThoughtFactory` and `RecommendationService` delegate to other subsystems.
`ExportService` delegates the visual formats to `VisualExporter`. It builds the `json`, `markdown`,
`latex` and `jupyter` documents itself, including their mode-specific sections.

`RecommendationService` exists for a structural reason: response-building logic that lives in
`src/index.ts` is reachable only through the MCP dispatch path. `src/index.ts` is importable by a
test, because `main()` runs only when the module is the process entry point and the module exports
a ready `server`. A unit test of one response builder in that file still needs the whole server
around it. A module of pure functions needs no server, so a test can call the `recommend_mode`
response builder on its own.

### ThoughtFactory (`src/services/ThoughtFactory.ts`)

**Purpose**: Builds the correctly typed thought object for any of the 34 reasoning modes by
delegating to `ModeHandlerRegistry`.

```typescript
export interface ThoughtFactoryConfig {
  autoRegisterHandlers?: boolean;  // default: true
  logger?: ILogger;
}

export class ThoughtFactory {
  constructor(config?: ThoughtFactoryConfig)

  hasSpecializedHandler(mode: ThinkingMode): boolean
  getStats(): { specializedHandlers: number; modesWithHandlers: ThinkingMode[] }
  validate(input: ThinkingToolInput): ValidationResult
  getModeStatus(mode: ThinkingMode): ModeStatus
  getRegistry(): ModeHandlerRegistry
  createThought(input: ThinkingToolInput, sessionId: string): Thought
}
```

`createThought` always calls `ModeHandlerRegistry.createThought()`. The constructor registers all 35
mode handlers through `registerAllHandlers()` unless `autoRegisterHandlers: false` is passed. A mode
string with no registered handler gets `GenericModeHandler` from the registry. The `throw` at the end
of `createThought` cannot run, because the private `shouldUseRegistry()` always returns `true`.

### RecommendationService (`src/services/RecommendationService.ts`)

**Purpose**: Builds the `recommend_mode` response — the `ModeRecommender` recommendation plus
advisory reasoning-type advice from the taxonomy.

```typescript
export interface RecommendModeInput {
  problemType?: string
  problemCharacteristics?: ProblemCharacteristics
  includeCombinations?: boolean
  includeReasoningTypes?: boolean   // default true
}

export function buildModeRecommendation(input: RecommendModeInput): string
```

Two input paths: `problemType` alone gives a quick recommendation; `problemCharacteristics` gives
the comprehensive one. The taxonomy section is **appended**. With `includeReasoningTypes: false` the
function returns the mode recommendation with no taxonomy section. A test asserts that the default
response starts with the opt-out response. A throwing advisory engine degrades to a one-line note;
the recommendation still returns.

---

### ExportService (`src/services/ExportService.ts`)

**Purpose**: Orchestrates multi-format session export — builds the `json`, `markdown`, `latex` and
`jupyter` documents in this file, and routes the other eleven formats to `VisualExporter`.

```typescript
export class ExportService {
  constructor(logger?: ILogger)

  exportSession(
    session: ThinkingSession,
    format:
      | "json" | "markdown" | "latex" | "html" | "jupyter"
      | "mermaid" | "dot" | "ascii" | "svg" | "graphml" | "tikz"
      | "modelica" | "uml" | "visual-json" | "visual-markdown",
  ): string
}
```

`exportSession` is the entire public surface. Internally it branches on `format`: the eleven
visual formats (`mermaid`, `dot`, `ascii`, `svg`, `graphml`, `tikz`, `modelica`, `html`, `uml`,
`visual-json` and `visual-markdown`) delegate to a private `exportVisual()`. `exportVisual()` throws
when the session has no thoughts. For a session with one thought, it calls the mode-specific method
of the `VisualExporter` that the constructor created (the exporters are in
`src/export/visual/modes/`). For a session with more than one thought, it renders the whole session
as one graph. `json`, `markdown`, `latex`, and `jupyter` are handled by private `exportTo*` methods
inside this file. `html` is a visual format here, not a private method. The session-graph renderer
builds it in `toHTML()` (`src/export/visual/graph-render.ts`) with the helper functions of
`src/export/visual/utils/html.ts`; no code under `src/` constructs `HTMLDocBuilder`. `visual-json` and
`visual-markdown` are aliases that map onto the `json`/`markdown` members of `VisualFormat`, kept
distinct from the plain `json`/`markdown` document formats so callers can request either the flat
document or the graph-structured visual rendering of the same format name.

---

## Session

`src/session/` owns session lifecycle, meta-monitoring (strategy tracking across a session), and
the persistence abstraction. `SessionManager` keeps sessions in an in-memory LRU cache, and it can
also write them through one optional `SessionStorage` backend. `FileSessionStore` is the only
backend. Cross-process file locking lives in `src/utils/file-lock.ts`; `src/session/` has no
`locks/` subdirectory.

### SessionManager (`src/session/manager.ts`)

**Purpose**: Session lifecycle (create/read/update/delete), thought accumulation, and
meta-reasoning strategy tracking, backed by an LRU in-memory cache with optional persistent
storage.

```typescript
export class SessionManager {
  constructor(
    config?: Partial<SessionConfig>,
    logger?: ILogger | LogLevel,
    storage?: SessionStorage,
  )

  // Lifecycle
  async createSession(options?: {
    title?: string;
    mode?: ThinkingMode;
    domain?: string;
    author?: string;
    config?: Partial<SessionConfig>;
  }): Promise<ThinkingSession>
  async getSession(sessionId: string): Promise<ThinkingSession | null>
  async addThought(sessionId: string, thought: Thought): Promise<ThinkingSession>
  async switchMode(sessionId: string, newMode: ThinkingMode, reason?: string): Promise<ThinkingSession>
  async listSessions(includeStoredSessions?: boolean): Promise<SessionMetadata[]>
  async deleteSession(sessionId: string): Promise<void>
  async generateSummary(sessionId: string): Promise<string>

  // Meta-monitoring (merged from a former MetaMonitor class)
  updateStrategyProgress(sessionId: string, indicator: string): void
  recordStrategyIssue(sessionId: string, issue: string): void
  evaluateStrategy(sessionId: string): StrategyEvaluation
  suggestAlternatives(sessionId: string, currentMode: ThinkingMode): AlternativeStrategy[]
  calculateQualityMetrics(sessionId: string): QualityMetrics
  getMetaSessionContext(sessionId: string, problemType: string): SessionContext
  clearMetaSession(sessionId: string): void
  getActiveMetaSessions(): string[]

  // Diagnostics
  getSessionCacheStats(): CacheStats
}
```

Behaviour notes:

- **Eviction.** The in-memory store is an `LRUCache<ThinkingSession>` sized from
  `getConfig().maxActiveSessions` (`MCP_MAX_SESSIONS`, default 100). Its `onEvict` callback
  saves the evicted session to `storage` when a storage backend exists and the session's
  `enableAutoSave` is true. In every other case it discards the thoughts and logs a warning. In both
  cases it clears the meta-monitoring state of the session.
- **Expiry.** `getSession()` checks expiry twice — once against the in-memory copy
  (`isSessionExpired` inside `getLiveSession`), and again after a storage reload, because a
  persisted session's `updatedAt` does not change on reload; without the second check an expired
  file-backed session would be resurrected on every read.
- **Capacity.** `addThought()` rejects (throws `ResourceLimitError`) once
  `session.config.maxThoughtsInMemory` is reached, before any mutation — no partial state, no
  auto-save attempt on a rejected write.
- **`switchMode`** changes `session.mode` and `session.config.modeConfig.mode` together and
  re-persists if auto-save is enabled; it does not validate that the new mode is compatible with
  thoughts already recorded.
- **`evaluateStrategy`** scores the tracked strategy of a session from its progress indicators,
  thoughts spent, elapsed time and issue count. It returns a baseline (0.5 for every score except
  `progressRate`, which is 0) when no strategy is tracked. **`calculateQualityMetrics`** scores the
  session history from its length, average uncertainty, mode diversity and the strategy's issue and
  progress counts. It returns 0.5 for every metric when the session has no history. Neither method
  uses the mode handlers. No code under `src/` outside `manager.ts` calls the public meta-monitoring
  methods (`evaluateStrategy`, `suggestAlternatives`, `calculateQualityMetrics`,
  `updateStrategyProgress`, `recordStrategyIssue`, `getMetaSessionContext`). Only the private
  `recordMetaThought` runs, from `addThought`.
- **`getSessionCacheStats()`** exposes `LRUCache.getStats()` directly, specifically so tests can
  assert on cache hit/miss counts instead of wall-clock timing.

### SessionMetricsCalculator (`src/session/SessionMetricsCalculator.ts`)

**Purpose**: Computes and updates the per-session `SessionMetrics` object as thoughts are added.
`SessionManager` owns one instance and calls it from `createSession` and `addThought`.

```typescript
export class SessionMetricsCalculator {
  initializeMetrics(): SessionMetrics
  updateMetrics(session: ThinkingSession, thought: Thought): void
}
```

`updateMetrics` updates the basic counters itself: thought count, thoughts by type, revision
count, time spent, average uncertainty and dependency depth. It then calls a private
`updateModeSpecificMetrics()`, which records custom metrics for temporal, game-theory and
evidential thoughts, and a private `updateCacheStats()`, which copies the statistics of the global
validation cache. `updateMetrics` is the only entry point callers need.

### Storage — `src/session/storage/`

**`interface.ts`** defines the `SessionStorage` contract every backend implements:

```typescript
export interface SessionStorage {
  initialize(): Promise<void>
  saveSession(session: ThinkingSession): Promise<void>
  loadSession(sessionId: string): Promise<ThinkingSession | null>
  deleteSession(sessionId: string): Promise<boolean>
  listSessions(): Promise<SessionMetadata[]>
  exists(sessionId: string): Promise<boolean>
  getStats(): Promise<StorageStats>
  cleanup(maxAgeMs: number): Promise<number>
  close(): Promise<void>
}
```

`StorageStats` (`totalSessions`, `totalThoughts`, `storageSize`, `oldestSession?`, `newestSession?`,
`averageSessionSize`, `storageHealth: "healthy" | "warning" | "critical"`) and `StorageConfig`
(`autoSave`, `autoSaveDelay`, `enableCompression`, `maxSessions`, `maxSessionAge`,
`enableEncryption`, optional `serialization: { prettyPrint, includeMetadata }`) live alongside it,
with a `DEFAULT_STORAGE_CONFIG` constant.

### FileSessionStore (`src/session/storage/file-store.ts`)

**Purpose**: The only shipped `SessionStorage` implementation — one JSON file per session under a
base directory, plus a metadata index file for fast `listSessions()` without reading every session
file.

```typescript
export class FileSessionStore implements SessionStorage {
  constructor(baseDir: string, config?: Partial<StorageConfig>)

  async initialize(): Promise<void>
  async saveSession(session: ThinkingSession): Promise<void>
  async loadSession(sessionId: string): Promise<ThinkingSession | null>
  async deleteSession(sessionId: string): Promise<boolean>
  async listSessions(): Promise<SessionMetadata[]>
  async exists(sessionId: string): Promise<boolean>
  async getStats(): Promise<StorageStats>
  async cleanup(maxAgeMs: number): Promise<number>
  async close(): Promise<void>
}
```

Private helpers handle the metadata-index round trip (`updateMetadata`, `loadMetadataIndex`,
`saveMetadataIndex`), lazy initialization guarding (`ensureInitialized`), path construction from a
session ID (`getSessionPath`), and `Date`/complex-field round-tripping through JSON
(`prepareForSerialization` / `restoreFromSerialization`). This is the backend `SessionManager`
uses whenever `SESSION_DIR` is set — see `DATAFLOW.md` for the multi-instance sharing sequence
and the cross-process locking it relies on.

### File locking — `src/utils/file-lock.ts`

Not a class: a small set of exported async functions layered on advisory lock files (`.lock`
sidecars), used by `FileSessionStore` so multiple `deepthinking-mcp` instances can share one
`SESSION_DIR` safely.

```typescript
export interface LockOptions { /* timeout, staleThreshold, type: "exclusive" | "shared", ... */ }

export async function acquireLock(filePath: string, options?: LockOptions): Promise<() => Promise<void>>
export async function withLock<T>(filePath: string, fn: () => Promise<T>, options?: Omit<LockOptions, "type">): Promise<T>
export async function withSharedLock<T>(filePath: string, fn: () => Promise<T>, options?: Omit<LockOptions, "type">): Promise<T>
export async function isLocked(filePath: string, staleThreshold?: number): Promise<{ locked: boolean; type?: "exclusive" | "shared"; holders?: number }>
export async function forceUnlock(filePath: string): Promise<void>
```

`withLock` takes an exclusive lock for the duration of `fn`, releasing it (including on throw) via
the returned release function from `acquireLock`. `withSharedLock` allows concurrent readers.
Stale locks (older than a configurable threshold) are detected and cleared automatically rather
than blocking forever on a crashed holder.

A shared lock is one file in a per-path directory, and the reader that releases the last shared
lock removes that directory. A second reader can meet that removal between its `mkdir` and its
`writeFile`. `acquireSharedLock` retries these refusals: `ENOENT` from either call, `EPERM` from
`mkdir` on Windows, and `EINVAL` from `writeFile` on macOS. A retry for `EINVAL` first waits one
`retryInterval`. A refusal that does not clear ends as the timeout error, with the last `EINVAL`
as its `cause`. Any other `mkdir` error propagates. From `writeFile`, `EEXIST` returns a release
function for the lock file that already exists, and any other error propagates.

---

## Mode Handlers

`src/modes/handlers/` implements the Strategy pattern: one handler class for each mode. The
directory holds 40 files: the interface file (`ModeHandler.ts`), 35 handlers, `GenericModeHandler.ts`
and three helper modules. `registerAllHandlers()` in `src/modes/index.ts` binds each of the 35 handlers
to exactly one `ThinkingMode` value. `GenericModeHandler.ts` is a 36th handler class that is never
registered. The registry constructs it on demand as the fallback for any mode string with no
registered handler. That path is unreachable for a `ThinkingMode` member, because all 35 non-generic
modes are registered at startup. `ThinkingMode.CUSTOM` (handled by `CustomHandler`) is one of the 35
registered modes, not a separate case. The helper modules are `input-warnings.ts`,
`resolve-mode.ts` and `causal-fields.ts`. They are not handlers. `input-warnings.ts` exports `unrecognisedValueWarning(field, value, recognised, fallback?)`,
`droppedValueWarning(field, value, recognised)` and `inputWarningsField(sentences)`.
A handler uses them to record a request value that it replaced or ignored in the `inputWarnings`
field of the thought. `unrecognisedValueWarning` is for a value that the handler keeps or replaces.
`droppedValueWarning` is for a value that the handler does not store. `EngineeringHandler` and
`AlgorithmicHandler` use them.

`resolve-mode.ts` exports `resolveMode(name)`. `CustomHandler` and `HybridHandler` use it to turn a mode
name from `basedOnModes` or `activeModes` into a `ThinkingMode`. `resolveMode` ignores case and returns
`sequential` for a name that is not a mode.

`causal-fields.ts` exports `readCausalGraph(input)` and `createCausalFields(input)`. `readCausalGraph` returns
`input.causalGraph`, or a graph built from `input.nodes` and `input.edges` (each defaults to an empty list)
when the input has no graph. `createCausalFields` returns the six fields that a causal thought takes from the
input, in this order: `mode`, `thoughtType`, `causalGraph`, `interventions`, `mechanisms` and `confounders`.
`CausalHandler` and `GenericModeHandler` (in causal mode) spread the result into their thought after the base
fields and the two revision fields. `CausalHandler.validate` calls `readCausalGraph`.

### ModeHandler (`src/modes/handlers/ModeHandler.ts`)

**Purpose**: The interface every specialized handler implements, plus the shared result/enhancement
types and four factory helpers for building `ValidationResult`s.

```typescript
export interface ModeHandler {
  readonly mode: ThinkingMode;
  readonly modeName: string;
  readonly description: string;

  createThought(input: ThinkingToolInput, sessionId: string): Thought;
  validate(input: ThinkingToolInput): ValidationResult;

  // Optional
  getEnhancements?(thought: Thought): ModeEnhancements;
  supportsThoughtType?(thoughtType: string): boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: HandlerValidationError[];
  warnings: ValidationWarning[];
}
export interface HandlerValidationError { field: string; message: string; code: string }
export interface ValidationWarning { field: string; message: string; suggestion?: string }

export interface ModeEnhancements {
  suggestions?: string[];
  relatedModes?: ThinkingMode[];
  metrics?: Record<string, number | string>;
  guidingQuestions?: string[];
  warnings?: string[];
  mentalModels?: string[];
  socraticQuestions?: Record<string, string[]>;      // Critique mode
  detectedArchetypes?: DetectedArchetype[];           // SystemsThinking mode
}
export interface DetectedArchetype { name: string; confidence: number; matchedPatterns: string[] }

export interface ModeStatus {
  mode: ThinkingMode;
  isFullyImplemented: boolean;
  hasSpecializedHandler: boolean;
  note?: string;
  supportedThoughtTypes?: string[];
}

// Factory helpers
export function validationSuccess(warnings?: ValidationWarning[]): ValidationResult
export function validationFailure(errors: HandlerValidationError[], warnings?: ValidationWarning[]): ValidationResult
export function createValidationError(field: string, message: string, code: string): HandlerValidationError
export function createValidationWarning(field: string, message: string, suggestion?: string): ValidationWarning

// Shared checks
export function checkThoughtBasics(input: ThinkingToolInput): ValidationResult | undefined
export function checkThoughtType(input: ThinkingToolInput, validTypes: readonly string[]): ValidationWarning | undefined
export function checkUncertaintyRange(input: ThinkingToolInput): HandlerValidationError | undefined

// Shared thought fields
export function createThoughtBase(input: ThinkingToolInput, sessionId: string): ThoughtBase
export function createThoughtTail(input: ThinkingToolInput): ThoughtTail
```

`checkThoughtBasics` returns a failure for a blank thought or for a thought number above the total,
and `undefined` when both checks pass. 26 handlers call the function at the start of `validate`.
The other 10 handlers make neither check.

`checkThoughtType` returns a warning for a `thoughtType` that is set but is not in the list of
valid types, and `undefined` otherwise. The match is exact, so the case matters. 9 handlers call it
in `validate`: `ComputabilityHandler`, `ConstraintHandler`, `CryptanalyticHandler`, `HybridHandler`,
`MathematicsHandler`, `ModalHandler`, `OptimizationHandler`, `PhysicsHandler` and `StochasticHandler`.

`checkUncertaintyRange` returns an error for an `uncertainty` outside the range 0 to 1, and
`undefined` otherwise. A value that no comparison can order, such as `NaN`, is not an error. 6
handlers call it in `validate`: `AlgorithmicHandler`, `ComputabilityHandler`, `CryptanalyticHandler`,
`MathematicsHandler`, `PhysicsHandler` and `ShannonHandler`.

`createThoughtBase` returns the seven fields that start every thought: a new `id`, `sessionId`,
`thoughtNumber`, `totalThoughts`, `content`, `timestamp` and `nextThoughtNeeded`. `ThoughtBase` is
the type of that result, and only `ModeHandler.ts` uses its name. All 36 handler classes spread the
result first in the thought they return. Each handler then adds the revision fields, `mode` and
its own fields in its own order.

`createThoughtTail` returns the five fields that close a thought: `dependencies`, `assumptions`,
`uncertainty`, `isRevision` and `revisesThought`, in that order. The two lists default to an empty
list. The uncertainty defaults to 0.5, and an uncertainty of 0 stays 0. `ThoughtTail` is the type of
that result. 3 handlers spread the result where their own five lines stood: `AlgorithmicHandler`,
`ComputabilityHandler` and `CryptanalyticHandler`. `MathematicsHandler`, `PhysicsHandler` and
`ShannonHandler` also write these five fields, but they keep their own lines, because a spread
would change the order of the keys of their thought. `GenericModeHandler` keeps its own lines for
a different reason: it uses `||` for the uncertainty, so an uncertainty of 0 becomes 0.5.

`getEnhancements` and `supportsThoughtType` are optional on the interface. All 36 handler classes
implement `getEnhancements`. All handlers except `AbductiveHandler`, `AnalogicalHandler` and
`GenericModeHandler` implement `supportsThoughtType`.

`HandlerValidationError` is plain data inside a `ValidationResult`. It is never thrown. The
throwable `ValidationError` class is a different type, in `src/utils/errors.ts`.

### ModeHandlerRegistry (`src/modes/registry.ts`)

**Purpose**: Singleton Strategy-pattern dispatcher — looks up the registered handler for a mode,
falling back to a `GenericModeHandler` instance for unregistered modes.

```typescript
export interface RegistryStats {
  totalHandlers: number;
  specializedHandlers: number;
  modesWithHandlers: ThinkingMode[];
  modesWithGenericHandler: ThinkingMode[];
}

export class ModeHandlerRegistry {
  static getInstance(): ModeHandlerRegistry
  static resetInstance(): void            // testing only

  register(handler: ModeHandler): void    // throws if mode already registered
  replace(handler: ModeHandler): void     // register-or-overwrite
  unregister(mode: ThinkingMode): boolean
  clear(): void                           // testing only

  getHandler(mode: ThinkingMode): ModeHandler
  hasSpecializedHandler(mode: ThinkingMode): boolean
  getRegisteredModes(): ThinkingMode[]

  createThought(input: ThinkingToolInput, sessionId: string): Thought
  validate(input: ThinkingToolInput): ValidationResult
  getModeStatus(mode: ThinkingMode): ModeStatus
  getStats(): RegistryStats
}

// Module-level convenience wrappers around the singleton
export function getRegistry(): ModeHandlerRegistry
export function registerHandler(handler: ModeHandler): void
export function createThought(input: ThinkingToolInput, sessionId: string): Thought
```

`register()` throws if a handler is already registered for that mode — `registerAllHandlers()`
therefore calls `replace()`, not `register()`, so re-initializing the registry (e.g. in tests) never
throws. `validate()` runs one universal check first (`thought` must be non-empty) before delegating
to the mode's handler; an empty `thought` field fails validation regardless of mode, before any
handler-specific logic runs.

`createThought()` returns the thought that the handler built, after one more step. A handler builds
its thought by hand, and most copy only some of the six base fields `revisionReason`, `branchFrom`,
`branchId`, `uncertainty`, `dependencies` and `assumptions`. The module function `carryBaseFields`
copies a field from the input onto the thought. The copy happens only when the handler left the
field `undefined` and the caller sent it. A value that the handler computed is kept, and a call that sends
none of the six gets the thought unchanged.

### All handlers

Every row below is a `class X implements ModeHandler` in `src/modes/handlers/`, registered in
`registerAllHandlers()` unless noted. The description column repeats each handler's own `description`
field, with two exceptions: the `GenericModeHandler` row is a summary (the handler computes its
`description` from the mode in its constructor), and the Bayesian row adds a closing clause.

| Handler | File | Mode | What it adds |
|---|---|---|---|
| SequentialHandler | `SequentialHandler.ts` | `sequential` | Step-by-step logical reasoning with revision and branching support |
| ShannonHandler | `ShannonHandler.ts` | `shannon` | Claude Shannon's 5-stage systematic problem-solving methodology |
| MathematicsHandler | `MathematicsHandler.ts` | `mathematics` | Formal mathematical proofs, theorems, and symbolic computation |
| PhysicsHandler | `PhysicsHandler.ts` | `physics` | Physical modeling with tensor mathematics, conservation laws, and field theory |
| HybridHandler | `HybridHandler.ts` | `hybrid` | Combines top 3 recommended modes for 97% confidence through multi-modal synthesis |
| InductiveHandler | `InductiveHandler.ts` | `inductive` | Reasoning from specific observations to general principles with confidence tracking |
| DeductiveHandler | `DeductiveHandler.ts` | `deductive` | Reasoning from general principles to specific conclusions with validity checking |
| AbductiveHandler | `AbductiveHandler.ts` | `abductive` | Inference to best explanation with hypothesis evaluation and evidence coverage |
| CausalHandler | `CausalHandler.ts` | `causal` | Causal graph analysis with intervention reasoning and cycle detection |
| BayesianHandler | `BayesianHandler.ts` | `bayesian` | Probabilistic reasoning with Bayes theorem and evidence updates (the handler also computes the posterior itself) |
| CounterfactualHandler | `CounterfactualHandler.ts` | `counterfactual` | What-if analysis with world state tracking and divergence point identification |
| TemporalHandler | `TemporalHandler.ts` | `temporal` | Timeline analysis with Allen's interval algebra and event sequencing |
| HistoricalHandler | `HistoricalHandler.ts` | `historical` | Historical analysis with source evaluation, pattern recognition, and causal chain analysis |
| GameTheoryHandler | `GameTheoryHandler.ts` | `gametheory` | Strategic interaction analysis with Nash equilibria and payoff matrices |
| EvidentialHandler | `EvidentialHandler.ts` | `evidential` | Dempster-Shafer belief functions with uncertainty quantification |
| AnalogicalHandler | `AnalogicalHandler.ts` | `analogical` | Cross-domain reasoning through structural mapping and analogy transfer |
| FirstPrinciplesHandler | `FirstPrinciplesHandler.ts` | `firstprinciples` | Bottom-up reasoning from fundamental truths with derivation chains |
| SystemsThinkingHandler | `SystemsThinkingHandler.ts` | `systemsthinking` | Systems analysis: feedback loops and leverage points; archetype detection runs only in `getEnhancements()` |
| ScientificMethodHandler | `ScientificMethodHandler.ts` | `scientificmethod` | Hypothesis testing with experimental design and falsifiability analysis |
| FormalLogicHandler | `FormalLogicHandler.ts` | `formallogic` | Propositional and predicate logic with inference validation |
| SynthesisHandler | `SynthesisHandler.ts` | `synthesis` | Multi-source synthesis with theme extraction, contradiction detection, and gap analysis |
| ArgumentationHandler | `ArgumentationHandler.ts` | `argumentation` | Toulmin model argumentation with dialectic analysis and fallacy detection |
| CritiqueHandler | `CritiqueHandler.ts` | `critique` | Scholarly critique with Socratic questioning, balanced evaluation, and methodology assessment |
| AnalysisHandler | `AnalysisHandler.ts` | `analysis` | Rigorous qualitative analysis with codebook validation and saturation assessment |
| EngineeringHandler | `EngineeringHandler.ts` | `engineering` | Structured engineering analysis with requirements, trade studies, FMEA, and ADRs |
| ComputabilityHandler | `ComputabilityHandler.ts` | `computability` | Turing machine analysis, decidability proofs, and reductions |
| CryptanalyticHandler | `CryptanalyticHandler.ts` | `cryptanalytic` | Bayesian cryptanalysis with Turing's deciban evidence system |
| AlgorithmicHandler | `AlgorithmicHandler.ts` | `algorithmic` | Algorithm design, complexity analysis, and correctness proofs (CLRS coverage) |
| MetaReasoningHandler | `MetaReasoningHandler.ts` | `metareasoning` | Reasoning about reasoning itself - strategy monitoring and optimization |
| RecursiveHandler | `RecursiveHandler.ts` | `recursive` | Problem decomposition, base case identification, and recursive solution construction |
| ModalHandler | `ModalHandler.ts` | `modal` | Reasoning about necessity, possibility, and possible worlds semantics |
| StochasticHandler | `StochasticHandler.ts` | `stochastic` | Markov chains, random processes, probabilistic state transitions, and Monte Carlo methods |
| ConstraintHandler | `ConstraintHandler.ts` | `constraint` | Constraint satisfaction, domain reduction, propagation, and feasibility analysis |
| OptimizationHandler | `OptimizationHandler.ts` | `optimization` | Constraint optimization, objective functions, and solution search |
| CustomHandler | `CustomHandler.ts` | `custom` | User-defined reasoning patterns with flexible structure and custom validation |
| GenericModeHandler | `GenericModeHandler.ts` | any (fallback) | Fallback with a `switch` over eight modes and a hybrid default; constructed on demand, never registered |

Both `ConstraintHandler` and `OptimizationHandler` are registered, dedicated handlers, not
generic-handler-plus-validator coverage.

### The eight handlers with real specialized logic

Every handler above implements `createThought`, `validate` and `getEnhancements`. Eight handlers
are described below in more detail. Other handlers, such as `CausalHandler`, `ConstraintHandler`
and `StochasticHandler`, also contain algorithms.

#### BayesianHandler — auto posterior calculation

```typescript
export class BayesianHandler implements ModeHandler {
  readonly mode = ThinkingMode.BAYESIAN;
  createThought(input: ThinkingToolInput, sessionId: string): BayesianThought
  validate(input: ThinkingToolInput): ValidationResult
  getEnhancements(thought: BayesianThought): ModeEnhancements
  supportsThoughtType(thoughtType: string): boolean

  private calculatePosterior(
    prior: PriorProbability,
    likelihood: Likelihood,
    evidence: BayesianEvidence[],
    inputAny: any,
  ): PosteriorProbability
  private calculateBayesFactor(evidence: BayesianEvidence[]): number | undefined
  private estimatePosteriorConfidence(evidence: BayesianEvidence[]): number
}
```

If the caller supplies `posteriorProbability` directly, `calculatePosterior` uses it verbatim.
Otherwise it applies Bayes' theorem evidence-by-evidence — `P(H|E) = P(E|H)P(H) / P(E)` — folding
each `BayesianEvidence` item's `likelihoodGivenHypothesis` / `likelihoodGivenNotHypothesis` into a
running posterior, clamped to `[0, 1]`. `calculateBayesFactor` multiplies per-evidence likelihood
ratios (`∏ P(Eᵢ|H) / P(Eᵢ|¬H)`). `estimatePosteriorConfidence` rewards more evidence
(diminishing returns, capped contribution 0.4) but penalizes extreme likelihood ratios (>100 or
<0.01) as probable overconfidence rather than strong signal.

#### GameTheoryHandler — Nash equilibria

```typescript
export class GameTheoryHandler implements ModeHandler {
  readonly mode = ThinkingMode.GAMETHEORY;
  createThought(input: ThinkingToolInput, sessionId: string): GameTheoryThought
  validate(input: ThinkingToolInput): ValidationResult
  getEnhancements(thought: GameTheoryThought): ModeEnhancements
  supportsThoughtType(thoughtType: string): boolean

  private findPureStrategyNashEquilibria(
    matrix: PayoffMatrix, players: Player[], strategies: Strategy[],
  ): NashEquilibrium[]
  private isNashEquilibrium(entry: PayoffEntry, matrix: PayoffMatrix): boolean
  private isStrictEquilibrium(entry: PayoffEntry, matrix: PayoffMatrix): boolean
  private hasTemptingDeviation(entry: PayoffEntry, matrix: PayoffMatrix, tempts: (deviationPayoff: number, currentPayoff: number) => boolean): boolean
  private unilateralDeviations(entry: PayoffEntry, matrix: PayoffMatrix, playerIdx: number): PayoffEntry[]
  private calculateEquilibriumStability(entry: PayoffEntry, matrix: PayoffMatrix, players: Player[], strategies: Strategy[]): number
  private findDominantStrategies(matrix: PayoffMatrix, players: Player[], strategies: Strategy[]): DominantStrategy[]
  private checkDominance(strategy: Strategy, playerIdx: number, matrix: PayoffMatrix, playerStrategies: Strategy[]): string[]
  private isZeroSumGame(matrix: PayoffMatrix): boolean
  private checkParetoOptimality(equilibria: NashEquilibrium[], matrix: PayoffMatrix | undefined): boolean
}
```

Pure-strategy Nash equilibrium detection is exhaustive, not iterative: it walks every payoff-matrix
entry and keeps those where no single player can improve by unilaterally deviating
(`isNashEquilibrium`), currently limited to two-player games (`matrix.players.length !== 2` short
circuits to an empty result). `findDominantStrategies` classifies each strategy as
`strictly_dominant` (dominates every alternative) or `weakly_dominant` (dominates some) by pairwise
payoff comparison via `checkDominance`. `checkParetoOptimality` verifies no other outcome in the
matrix Pareto-dominates a found equilibrium (weakly better for every player, strictly better for at
least one). If one does, the equilibrium is not Pareto optimal and the function returns `false`.
The function returns `true` when there is no matrix or no equilibrium.

#### SystemsThinkingHandler — archetype detection

```typescript
export class SystemsThinkingHandler implements ModeHandler {
  readonly mode = ThinkingMode.SYSTEMSTHINKING;
  createThought(input: ThinkingToolInput, sessionId: string): SystemsThinkingThought
  validate(input: ThinkingToolInput): ValidationResult
  getEnhancements(thought: SystemsThinkingThought): ModeEnhancements
  supportsThoughtType(thoughtType: string): boolean

  private detectArchetypes(
    thought: SystemsThinkingThought,
  ): { name: string; confidence: number; archetype: SystemArchetype }[]
}
```

`SYSTEMS_ARCHETYPES` is a fixed table of eight archetypes from Peter Senge's *The Fifth
Discipline* — Fixes that Fail, Shifting the Burden, Limits to Growth, Success to the Successful,
Tragedy of the Commons, Escalation, Growth and Underinvestment, Eroding Goals — each carrying a
`loopSignature` (expected counts of reinforcing/balancing feedback loops, and whether a delay is
present). `detectArchetypes` counts the thought's own `feedbackLoops` by type, fuzzy-matches
against every archetype's signature (for each of the reinforcing and balancing loop counts: exact
match +0.4 confidence, off by one +0.2; matching the delay flag +0.2), keeps matches scoring ≥0.4, and returns the top three by confidence. Only
`getEnhancements()` calls `detectArchetypes`, and no code under `src/` calls `getEnhancements()`,
so no tool response carries `detectedArchetypes`.

#### HistoricalHandler — source reliability scoring

```typescript
export class HistoricalHandler implements ModeHandler {
  readonly mode = ThinkingMode.HISTORICAL;
  createThought(input: ThinkingToolInput, sessionId: string): HistoricalThought
  validate(input: ThinkingToolInput): ValidationResult
  getEnhancements(thought: HistoricalThought): ModeEnhancements
  supportsThoughtType(thoughtType: string): boolean

  private calculateAggregateReliability(sources: HistoricalSource[]): number
  private calculateTemporalSpan(events: HistoricalEvent[]): { start: string; end: string } | undefined
  private detectPatterns(events: HistoricalEvent[]): HistoricalPattern[]
}
```

`calculateAggregateReliability` weights each source by type before averaging its declared
`reliability` — primary sources ×2, secondary ×1.5, other ×1 — then adds a small corroboration
bonus (up to +0.1) proportional to the fraction of sources with a non-empty `corroboratedBy` list,
clamped to `[0, 1]`. This is a source-evaluation heuristic, not a citation-graph algorithm: it
never inspects what a source corroborates, only whether the field is populated.

#### AlgorithmicHandler — CLRS-style formulation coverage

```typescript
export class AlgorithmicHandler implements ModeHandler {
  readonly mode = ThinkingMode.ALGORITHMIC;
  createThought(input: ThinkingToolInput, sessionId: string): AlgorithmicThought
  validate(input: ThinkingToolInput): ValidationResult
  getEnhancements(thought: AlgorithmicThought): ModeEnhancements
  supportsThoughtType(thoughtType: string): boolean

  private resolveThoughtType(inputType: string | undefined): AlgorithmicThoughtType
  private resolveDesignPattern(value: unknown, notes: (string | undefined)[]): DesignPattern | undefined
  private normalizeTimeComplexity(tc: Sent<"timeComplexity">): TimeComplexity
  private normalizeSpaceComplexity(sc: Sent<"spaceComplexity">): SpaceComplexity
  private normalizeCorrectnessProof(proof: Sent<"correctnessProof">, vocabulary: Vocabulary): CorrectnessProof
  private normalizeDPFormulation(dp: Sent<"dpFormulation">, vocabulary: Vocabulary): DPFormulation
  private normalizeGreedyProof(proof: Sent<"greedyProof">): GreedyProof
  private validateDPFormulation(dp: Sent<"dpFormulation">): ReturnType<typeof createValidationWarning>[]
  private validateCorrectnessProof(proof: Sent<"correctnessProof">): ReturnType<typeof createValidationWarning>[]
}
```

Not one algorithm but three formal-formulation shapes lifted from *Introduction to Algorithms*
(Cormen/Leiserson/Rivest/Stein): a `CorrectnessProof` (precondition/postcondition/invariant plus a
termination argument with a decreasing quantity and lower bound), a `DPFormulation` (optimal
substructure characterization, recursive definition, computation order, reconstruction method,
complexity), and a `GreedyProof` (greedy-choice property plus optimal-substructure proof, with an
optional exchange argument or matroid justification). `Sent<K>` is the type that the Zod schema of
`deepthinking_engineering` gives to the request field `K`. Each normaliser reads a typed request,
and none reads `any`. `createThought()` calls the `normalize*` methods. A caller can leave out a
member that the thought type requires. The method then gives it an empty string, an empty list,
`false` or a generated identifier. It writes no complexity case that the caller did not send. A member with a fixed vocabulary stays absent when the caller sends none. Two members,
`correctnessProof.method` and `dpFormulation.computationOrder.direction`, take the first value of
their list. An unrecognised value is kept as sent. A design pattern in the hyphen spelling is read as the
underscore value. An unknown design pattern is not stored. Each replacement and each ignored value
adds one sentence to the `inputWarnings` field of the thought. `validate()` calls
`validateDPFormulation` and `validateCorrectnessProof` on the raw caller input, not on the
normalized structure. They return field-level warnings.

#### MetaReasoningHandler — strategy recommendation

```typescript
export class MetaReasoningHandler implements ModeHandler {
  readonly mode = ThinkingMode.METAREASONING;
  createThought(input: ThinkingToolInput, sessionId: string): MetaReasoningThought
  validate(input: ThinkingToolInput): ValidationResult
  getEnhancements(thought: MetaReasoningThought): ModeEnhancements
  supportsThoughtType(thoughtType: string): boolean

  private generateRecommendation(
    evaluation: StrategyEvaluation,
    alternatives: AlternativeStrategy[],
  ): StrategyRecommendation
  private clamp(value: number): number
}
```

`generateRecommendation` is a decision table over the current strategy's evaluated
`effectiveness`/`efficiency`: `CONTINUE` when both exceed threshold (0.7 / 0.5); `SWITCH` to the
best-scoring `AlternativeStrategy` when it beats current effectiveness by more than 0.2; `REFINE`
when effectiveness is below 0.5 with no clearly better alternative; `CONTINUE` (low confidence) as
the fallback when nothing else applies. `createThought` calls `generateRecommendation` only when the caller
supplies no `recommendation`. It does not call `SessionManager`: its decision table is independent
of `SessionManager.evaluateStrategy` and `SessionManager.suggestAlternatives`.

#### GenericModeHandler — the fallback (`GenericModeHandler.ts`)

```typescript
export class GenericModeHandler implements ModeHandler {
  readonly mode: ThinkingMode;
  readonly modeName: string;
  readonly description: string;

  constructor(mode: ThinkingMode, modeName?: string, description?: string)

  createThought(input: ThinkingToolInput, sessionId: string): Thought
  validate(input: ThinkingToolInput): ValidationResult
  getEnhancements(thought: Thought): ModeEnhancements
  getModeStatus(): ModeStatus

  protected createBaseThought(input: ThinkingToolInput, sessionId: string): { id: string; sessionId: string; thoughtNumber: number; totalThoughts: number; content: string; timestamp: Date; nextThoughtNeeded: boolean; isRevision?: boolean; revisesThought?: number }
  protected createModeSpecificThought(input: ThinkingToolInput, baseThought: ReturnType<typeof this.createBaseThought>): Thought
  protected createCausalThought(...): CausalThought
  protected createHybridThought(...): HybridThought
  protected getRelatedModes(mode: ThinkingMode): ThinkingMode[]
}
```

`createModeSpecificThought` is a `switch (mode)` with cases for eight modes (sequential, shannon,
mathematics, physics, inductive, deductive, abductive and causal). Every other mode, including
hybrid, gets a hybrid-shaped thought from `createHybridThought()`. It is designed to be
subclassed (`protected` members, constructor takes the mode as a parameter) but the registry never
instantiates a subclass — only the base `GenericModeHandler(mode)` — so the extension point is
unused in practice.

#### CustomHandler — user-defined mode (`CustomHandler.ts`)

```typescript
export class CustomHandler implements ModeHandler {
  readonly mode = ThinkingMode.CUSTOM;
  createThought(input: ThinkingToolInput, sessionId: string): CustomThought
  validate(input: ThinkingToolInput): ValidationResult
  getEnhancements(thought: CustomThought): ModeEnhancements
  supportsThoughtType(_thoughtType: string): boolean   // always true — custom mode accepts any thought type

  private normalizeField(field: any): CustomField
  private resolveFieldType(type: string | undefined): CustomField["type"]
  private normalizeStage(stage: any, defaultOrder: number): CustomStage
  private normalizeValidationRule(rule: any): CustomValidationRule
  private evaluateRule(rule: string, value: unknown, allFields: Map<string, unknown>): boolean
}
```

`CustomThought` carries user-defined `customFields: CustomField[]` (typed `string | number |
boolean | array | object`), optional ordered `stages`, and optional `validationRules`.
`evaluateRule` is a small deliberately-restricted rule language — `required`, `min:`/`max:`,
`minLength:`/`maxLength:`, `pattern:` (regex), `in:` (enum membership), `positive`, `negative`,
`integer` — evaluated by string prefix match rather than `eval`, so a malformed or unrecognized
rule fails open (returns `true`, i.e. does not block the value) instead of throwing.

---

## Validation

`src/validation/` holds 37 exported classes across 44 files: the top-level engine (`validator.ts`,
`cache.ts`), the advisory wrapper (`advisory.ts`), the lazy-loading registry and static barrel that
both feed it validators (`validators/registry.ts`, `validators/index.ts`), a shared interface
(`validators/base.ts`), shared helper functions (`validators/validation-utils.ts`), shared
constants (`constants.ts`), 35 per-mode validator classes under `validators/modes/`, and a
top-level barrel (`index.ts`) that nothing in `src/` imports.

> ### This engine runs advisorily on every thought
>
> `SessionManager.addThought()` calls `validateAdvisory()` (`src/validation/advisory.ts`) after
> sanitising a thought, and attaches the result to `Thought.validation` and to the tool response.
> **It is feedback only** — `isValid === false` never rejects a thought, and a validator that
> throws degrades to `{available: false, reason}` without failing the request. Issues are capped
> at 20 (ordered errors → warnings → info) with `totalIssues` and `issuesTruncated` alongside;
> suggestions are deduplicated and capped at 10. Gated per session by
> `SessionConfig.enableValidation`.
>
> Zod validates at the tool boundary; that is the layer that can reject. This engine grades
> what Zod accepted.

### ThoughtValidator (`src/validation/validator.ts`)

**Purpose**: The validation entry point *of this subsystem* — looks up the mode-specific validator,
runs it, and turns its issues into a scored `ValidationResult`. `SessionManager.addThought()` reaches it
through `validateAdvisory()` (`src/validation/advisory.ts`).

```typescript
export class ThoughtValidator {
  async validate(thought: Thought, context: ValidationContext = {}): Promise<ValidationResult>

  private cacheKeySource(thought: Thought, context: ValidationContext): unknown
  private async performValidation(thought: Thought, context: ValidationContext = {}): Promise<ValidationResult>
  private calculateConfidence(thought: Thought, issues: ValidationIssue[]): number
  private calculateStrengthMetrics(_thought: Thought, issues: ValidationIssue[]): {
    logicalSoundness: number; empiricalSupport: number;
    mathematicalRigor: number; physicalConsistency: number;
  }
  private generateSuggestions(issues: ValidationIssue[]): string[]
}

// Defined in constants.ts; validator.ts re-exports the type.
export interface ValidationContext {
  existingThoughts?: Map<string, Thought>;
  strictMode?: boolean;
}
```

`validate()` uses `validationCache` when `MCP_ENABLE_VALIDATION_CACHE` is on and the context has no
`existingThoughts`. A call with `existingThoughts` skips the cache. The cache key comes from
`cacheKeySource()`: a stable copy of the thought without `id`, `sessionId`, `timestamp` and
`validation`, plus `strictMode`. On a miss, `validate()` calls `performValidation()`, which fetches
the mode's validator via `getValidatorForMode(thought.mode)` (async, lazy-loaded — see registry
below) and folds its `ValidationIssue[]` into a result:
`confidence` starts at 1.0 and loses 0.3 per error / 0.1 per warning / 0.05 per info, then is
further scaled by the thought's own `uncertainty` field when present.

### ValidationCache (`src/validation/cache.ts`)

**Purpose**: LRU cache of `ValidationResult`s keyed by a SHA-256 hash of the content value that
the caller passes (`ThoughtValidator` passes the stable copy from `cacheKeySource()`), so
re-validating unchanged content is free.

```typescript
export interface ValidationCacheEntry {
  result: ValidationResult;
  timestamp: number;
  hitCount: number;
}

export class ValidationCache {
  constructor(maxSize?: number)   // default: config.validationCacheMaxSize (MCP_VALIDATION_CACHE_SIZE)

  get(content: unknown): ValidationCacheEntry | undefined
  set(content: unknown, result: ValidationResult): void
  has(content: unknown): boolean
  clear(): void
  resize(newSize: number): void
  getStats(): { size: number; maxSize: number; hits: number; misses: number; hitRate: number }
  getTopEntries(limit?: number): Array<{ key: string; entry: ValidationCacheEntry }>
  evictOld(maxAgeMs: number): number
}

export const validationCache = new ValidationCache();  // module-level singleton
```

`get()` moves a hit to the end of the internal `Map` (insertion-order LRU); `set()` evicts the
oldest entry (`cache.keys().next().value`) once `maxSize` is reached. `ThoughtValidator` uses the
exported `validationCache` singleton, not its own instance.

### ModeValidator interface (`src/validation/validators/base.ts`)

```typescript
export interface ModeValidator<T extends Thought = Thought> {
  validate(thought: T, context: ValidationContext): ValidationIssue[];
  getMode(): string;
}

/** @deprecated alias — validators implement ModeValidator directly */
export { ModeValidator as BaseValidator };
```

Every per-mode validator (below) implements this interface directly using free functions from
`validation-utils.ts` (`validateCommon`, `validateDependencies`, `validateUncertainty`,
`validateNumberRange`, `validateProbability`, `validateConfidence`, `validateRequired`,
`validateNonEmptyArray`) for composition instead of subclassing. There is no abstract base class:
`BaseValidator` is only a deprecated type alias for `ModeValidator`.

### Two loading paths — the one thing to know about this directory

Mode validators reach `ThoughtValidator` through two different mechanisms, and both are live.

**Lazy path — `validators/registry.ts`.** A private `ValidatorRegistry` class (only its singleton
instance is exported) holds `VALIDATOR_REGISTRY`, a `Record<string, { load, className }>` table
naming 34 of the 35 mode-validator files (all but `meta`). Each `load` is an arrow function that
calls `import()` with a literal specifier:

```typescript
export const validatorRegistry: ValidatorRegistry;  // singleton (class itself is not exported)

export async function getValidatorForMode(mode: string): Promise<ModeValidator | undefined>
export function getValidatorForModeSync(mode: string): ModeValidator | undefined
export function hasValidatorForMode(mode: string): boolean
export function getSupportedModes(): string[]
export async function preloadValidators(modes: string[]): Promise<void>
```

`getValidatorForMode()` — the function `ThoughtValidator.performValidation()` actually calls — first
checks the registry's in-memory cache, then `VALIDATOR_REGISTRY[mode]`, then `await
config.load()` and instantiates `mod[config.className]`, caching the instance for
subsequent calls. Ten of the 34 entries (`algorithmic`, `analysis`, `argumentation`, `critique`,
`engineering`, `firstprinciples`, `formallogic`, `scientificmethod`, `synthesis`, `systemsthinking`)
are reached only through the `load` functions — no static `import` statement anywhere in `src/`
references those ten files.

The specifier in each `load` function is a literal. A bundler resolves a literal specifier at build
time, so the single-file build (`dist/index.js`) carries every validator. A specifier held in a
variable cannot be resolved at build time. The bundle then looks for `./modes/<mode>.js` next to
`dist/index.js`, finds nothing, and `loadValidator` turns the failed import into `undefined`. Every
mode then reports "No validator registered". `tests/integration/dist-bundle-validators.test.ts`
starts the built `dist/index.js` and sends one thought for each mode, because no test that imports
`src/` can see this failure.

**Static path — `validators/index.ts`.** A hand-written barrel that re-exports 25 validator
classes, the eight utility functions, the `ModeValidator` type and the registry API. It has no
`import` statements and exports no constants. 24 of the 25 are also registry entries. The 25th, `MetaValidator`, is not. The ten modes that only the registry
names (listed above) have no static export.

**`MetaValidator` can never be reached by a thought.** `ThinkingMode` has no `META` member. Its
real mode is `METAREASONING`, which `MetaReasoningValidator` serves and the registry lists. A
comment at the end of `VALIDATOR_REGISTRY` records the same fact. `ThinkingMode.CUSTOM` is also
absent from the registry, because a user-defined mode has no fixed shape that a mode validator
could check. For a thought in the `custom` mode, `performValidation()` adds a warning-severity
issue ("No validator registered for thinking mode"). Every other mode resolves to its validator
through `getValidatorForMode()`.

### Per-mode validators (`src/validation/validators/modes/`)

All 35 implement `ModeValidator<T>` the same way: a `getMode()` returning the mode's string key, and
a `validate(thought, context)` that opens with `validateCommon(thought)` (checks shared structural
fields) and layers mode-specific checks on top via the same `validation-utils.ts` helpers.
`validateCommon` also reports each `inputWarnings` sentence of the thought as a warning. Example
(`BayesianValidator`, `validators/modes/bayesian.ts`):

```typescript
export class BayesianValidator implements ModeValidator<BayesianThought> {
  getMode(): string   // "bayesian"
  validate(thought: BayesianThought, context: ValidationContext): ValidationIssue[]
}
```

The 35 files are not listed here. Each file is `validators/modes/<mode>.ts` with class name
`<Mode>Validator` (e.g. `historical.ts` → `HistoricalValidator`). `VALIDATOR_REGISTRY` in
`registry.ts` lists 34 of the mode names.

`constants.ts` defines `IssueSeverity`, `IssueCategory`, `ValidationThresholds`,
`ValidationMessages`, three range helpers (`isInRange`, `isValidProbability`,
`isValidConfidence`) and the `ValidationContext` interface. `validation-utils.ts` uses the
thresholds and messages. 12 of the 35 mode validators import `IssueSeverity` and `IssueCategory`
from it. 22 of the other 23 write the severity as a string literal, and `HybridValidator` uses only
the helpers. `ValidationIssue` has no issue-code field.

`validator.ts` re-exports `ValidationContext` as a type, so `base.ts` imports it from
`constants.ts` and the shared base layer has no import back to `validator.ts`. All 35 mode
validators import the type from `validator.ts` with `import type`. 25 of them are also re-exported
by `validators/index.ts`, and those 25 close the type-only validator cycles that `ARCHITECTURE.md`
lists. The other ten close no static cycle.

### Input validation for tool calls is not in `src/validation/`

`src/validation/` validates thoughts, not tool-call arguments. The input validation of an MCP tool
call lives in `src/tools/`. The `tools/call` handler in `src/index.ts` looks the tool name up in
`toolSchemas` (`src/tools/definitions.ts`), one Zod schema per focused tool, and calls
`schema.parse(args)`. The per-mode Zod schemas are under `src/tools/schemas/`. The legacy
`deepthinking` tool parses with `ThinkingToolSchema` (`src/tools/thinking.ts`). The JSON Schemas
that `tools/list` advertises come from `src/tools/json-schemas.ts`. That file is written by hand.
It states a few limits, and the Zod schemas own the rest. `withZodBounds` in
`src/tools/schema-bounds.ts` returns a copy of an advertised tool definition. The copy carries the
limits of the Zod schema that enforces the tool: `maxLength`, `minLength`, `maxItems`, `minItems`,
`minimum` and `maximum`. It copies a limit only where the hand-written node states none, so a
disagreement stays visible to the conformance test. `withZodBounds` does not copy two record
limits. The entry count of a record is a `superRefine` in `boundedRecord`, and a JSON Schema
derivation does not carry it. The length of a record key is in `propertyNames`, which the copy does not visit.
`definitions.ts` applies it once to each of the 11 thought tools and to the two management tools.

`validation/index.ts` is a barrel that re-exports the constants, `ThoughtValidator`, and the
advisory wrapper (`validateAdvisory`, `MAX_ADVISORY_ISSUES`, `MAX_ADVISORY_SUGGESTIONS` and the
`AdvisoryValidatorLike` type). Nothing in `src/` imports it. Consumers import the concrete modules.

---

## Export

`src/export/` splits into two families: flat document exporters (`ExportService`'s private
`exportTo*` methods, covered under Services above, plus `FileExporter` for writing them to disk)
and `src/export/visual/` for diagram formats. Visual export has three layers: 23 mode-specific
exporter functions (`visual/modes/`), 16 classes in `visual/utils/` (14 fluent builder classes plus
`LaTeXExporter` and `LatexMermaidIntegrator`), and `VisualExporter`, a thin per-mode dispatch
facade. `visual/` holds 17 classes. With `FileExporter`, `src/export/` holds 18 classes.

The mode exporters build `mermaid`, `dot` and `ascii` output with three builder classes. They
build the other eight formats with helper functions from `visual/utils/*.ts`.

### FileExporter (`src/export/file-exporter.ts`)

**Purpose**: Writes the output of an export callback to disk. One session can go to one format, to
a list of formats, to all 8 file formats, or to the formats of a named export profile. The class
does not check the output path. Callers resolve it first with `resolveSandboxedOutputDir`.

```typescript
export function resolveSandboxedOutputDir(requestedDir: string | undefined, sandboxRoot: string | undefined): string

export interface FileExportConfig {
  outputDir: string;
  createSessionSubdir?: boolean;      // default true
  createDateSubdir?: boolean;         // default false
  filenamePattern?: string;           // default "{session}_{mode}_{format}"
  overwrite?: boolean;                // default false
  createDir?: boolean;                // default true
  dateFormat?: "iso" | "short" | "timestamp";   // default "iso"
}
export interface FileExportResult { format: ExportFormatType; filePath: string; success: boolean; error?: string; size?: number }
export interface BatchExportResult {
  outputDir: string; results: FileExportResult[];
  successCount: number; failureCount: number; totalSize: number; exportedAt: Date;
}
export interface ExportProgress {
  currentFormat: ExportFormatType; currentIndex: number; totalExports: number; percentage: number;
  phase: "started" | "exporting" | "writing" | "completed" | "failed";
}
export type ExportProgressCallback = (progress: ExportProgress) => void;

export class FileExporter {
  constructor(
    config: Partial<FileExportConfig>,
    exportFunction: (session: ThinkingSession, format: ExportFormatType) => string,
  )

  async exportToFile(session: ThinkingSession, format: ExportFormatType): Promise<FileExportResult>
  async exportToFiles(session: ThinkingSession, formats: ExportFormatType[], onProgress?: ExportProgressCallback): Promise<BatchExportResult>
  async exportWithProfile(session: ThinkingSession, profileId: ExportProfileId, onProgress?: ExportProgressCallback): Promise<BatchExportResult>
  async exportAll(session: ThinkingSession, onProgress?: ExportProgressCallback): Promise<BatchExportResult>

  getConfig(): FileExportConfig
  updateConfig(updates: Partial<FileExportConfig>): void
}

export function createFileExporter(
  config: Partial<FileExportConfig>,
  exportFunction: (session: ThinkingSession, format: ExportFormatType) => string,
): FileExporter
```

`ExportFormatType` has 8 values: `markdown`, `latex`, `json`, `html`, `jupyter`, `mermaid`, `dot`,
`ascii`. `exportAll()` exports exactly these 8. `exportWithProfile()` with an unknown profile ID
returns a batch with `failureCount: 1` and no results.

`resolveSandboxedOutputDir` is the security-relevant piece, and it is a separate function: it
resolves a caller-requested output directory against a sandbox root (`MCP_EXPORT_PATH`, or
`~/.claude/deepthinking-exports` when the root is unset or empty) and throws for any path that
escapes the root. `src/index.ts` calls it, passes the result as `outputDir` to
`createFileExporter`, and passes `(s, f) => exportService.exportSession(s, f)` as the export
callback. `FileExporter` writes to `config.outputDir` (default `./exports`) with no containment
check. Private helpers handle the output directory (`resolveOutputDir`), filename generation
(`generateFilename`, `sanitizeFilename`, `formatDate`) and directory creation (`ensureDir`).

### Export profiles (`src/export/profiles.ts`)

Not a class — a static catalog. `EXPORT_PROFILES: Record<ExportProfileId, ExportProfile>` bundles a
named set of formats and options under five IDs: `academic` (latex, markdown, json),
`presentation` (mermaid, markdown), `documentation` (markdown, mermaid, ascii), `archive` (json,
markdown, latex, jupyter) and `minimal` (json, markdown). `src/index.ts` looks a profile up by ID
with `getExportProfile()` and passes `profile.formats` to `FileExporter.exportToFiles()`.
`FileExporter.exportWithProfile()` does the same lookup inside the class. `ExportService` does not
use profiles.

```typescript
export const EXPORT_PROFILES: Record<ExportProfileId, ExportProfile>

export function getExportProfile(id: ExportProfileId): ExportProfile | undefined
export function getAllExportProfiles(): ExportProfile[]
export function getExportProfilesByTag(tag: string): ExportProfile[]
export function getExportProfilesByFormat(format: ExportFormatType): ExportProfile[]
export function isValidExportProfileId(id: string): id is ExportProfileId
export function listExportProfileIds(): ExportProfileId[]
export function getExportProfileMetadata(id: ExportProfileId): ExportProfileMetadata | undefined
export function combineExportProfiles(
  profileIds: ExportProfileId[], name: string, mergeOptions?: "union" | "intersection",   // default "union"
): ExportProfile
export function recommendExportProfile(keywords: string[]): ExportProfileId
```

### VisualExporter (`src/export/visual/visual-exporter.ts`)

**Purpose**: A per-mode dispatch facade — 23 methods, each a one-line delegation to the matching
function in `visual/modes/`. `ExportService.exportVisual()` calls these methods only for a session
with exactly one thought. It picks the method by inspecting `thought.mode` and a mode-specific
field (e.g. `"causalGraph" in lastThought`), so `VisualExporter` itself carries no branching logic.
A session with more than one thought always uses the session-level visualization
(`exportSessionWithThoughtDetails`), in every mode.

```typescript
export class VisualExporter {
  exportCausalGraph(thought: CausalThought, options: VisualExportOptions): string
  exportTemporalTimeline(thought: TemporalThought, options: VisualExportOptions): string
  exportHistoricalTimeline(thought: HistoricalThought, options: VisualExportOptions): string
  exportGameTree(thought: GameTheoryThought, options: VisualExportOptions): string
  exportBayesianNetwork(thought: BayesianThought, options: VisualExportOptions): string
  exportSequentialDependencyGraph(thought: SequentialThought, options: VisualExportOptions): string
  exportShannonStageFlow(thought: ShannonThought, options: VisualExportOptions): string
  exportAbductiveHypotheses(thought: AbductiveThought, options: VisualExportOptions): string
  exportCounterfactualScenarios(thought: CounterfactualThought, options: VisualExportOptions): string
  exportAnalogicalMapping(thought: AnalogicalThought, options: VisualExportOptions): string
  exportEvidentialBeliefs(thought: EvidentialThought, options: VisualExportOptions): string
  exportFirstPrinciplesDerivation(thought: FirstPrinciplesThought, options: VisualExportOptions): string
  exportSystemsThinkingCausalLoops(thought: SystemsThinkingThought, options: VisualExportOptions): string
  exportScientificMethodExperiment(thought: ScientificMethodThought, options: VisualExportOptions): string
  exportOptimizationSolution(thought: OptimizationThought, options: VisualExportOptions): string
  exportFormalLogicProof(thought: FormalLogicThought, options: VisualExportOptions): string
  exportMathematicsDerivation(thought: MathematicsThought, options: VisualExportOptions): string
  exportPhysicsVisualization(thought: PhysicsThought, options: VisualExportOptions): string
  exportHybridOrchestration(thought: HybridThought, options: VisualExportOptions): string
  exportMetaReasoningVisualization(thought: MetaReasoningThought, options: VisualExportOptions): string
  exportProofDecomposition(decomposition: ProofDecomposition, options: VisualExportOptions): string
  exportEngineeringAnalysis(thought: EngineeringThought, options: VisualExportOptions): string
  exportComputability(thought: ComputabilityThought, options: VisualExportOptions): string
}
```

`VisualFormat` (`visual/types.ts`) is the eleven-value union every builder ultimately renders one
of: `"mermaid" | "dot" | "ascii" | "svg" | "graphml" | "tikz" | "modelica" | "html" | "uml" | "json"
| "markdown"`. `VisualExportOptions` carries `format` plus format-specific option groups (SVG
dimensions, TikZ scale, GraphML directedness, HTML theme, UML diagram type, JSON pretty-printing,
Markdown frontmatter/TOC flags).

### Mode-specific visual exporters (`src/export/visual/modes/`)

23 exporter functions, one per file, plus `index.ts` re-exporting all of them (24 files total). Each
function takes a mode's `Thought` subtype plus `VisualExportOptions` and returns a string in the
requested `VisualFormat`, branching on `options.format`. It builds `mermaid`, `dot` and `ascii`
output with `MermaidGraphBuilder`, `DOTGraphBuilder` and `ASCIIDocBuilder` (and with
`MermaidGanttBuilder` in `temporal.ts` and `historical.ts`, and `MermaidStateDiagramBuilder` in
`computability.ts`). It builds the other eight formats with helper functions from
`visual/utils/*.ts` (for example `generateGraphML`, `generateTikZ`, `generateSVGHeader` and
`generateHTMLHeader`).

20 of the 23 exporter functions call `exportByFormat` (`visual/utils/dispatch.ts`). It picks the
converter for `options.format` and throws `Unsupported format: <format>` for any other value. The
exporter file `proof-decomposition.ts` keeps its own `switch` with the same `default:` throw. The
`switch` has no `graphml` or `tikz` case. `computability.ts` and `historical.ts` render the
normalized graph for the formats they do not name.

| Function | File | Mode |
|---|---|---|
| `exportSequentialDependencyGraph` | `sequential.ts` | sequential |
| `exportShannonStageFlow` | `shannon.ts` | shannon |
| `exportMathematicsDerivation` | `mathematics.ts` | mathematics |
| `exportPhysicsVisualization` | `physics.ts` | physics |
| `exportHybridOrchestration` | `hybrid.ts` | hybrid |
| `exportCausalGraph` | `causal.ts` | causal |
| `exportTemporalTimeline` | `temporal.ts` | temporal |
| `exportHistoricalTimeline` | `historical.ts` | historical |
| `exportCounterfactualScenarios` | `counterfactual.ts` | counterfactual |
| `exportBayesianNetwork` | `bayesian.ts` | bayesian |
| `exportEvidentialBeliefs` | `evidential.ts` | evidential |
| `exportGameTree` | `game-theory.ts` | gametheory |
| `exportOptimizationSolution` | `optimization.ts` | optimization |
| `exportAbductiveHypotheses` | `abductive.ts` | abductive |
| `exportAnalogicalMapping` | `analogical.ts` | analogical |
| `exportFirstPrinciplesDerivation` | `first-principles.ts` | firstprinciples |
| `exportMetaReasoningVisualization` | `metareasoning.ts` | metareasoning |
| `exportSystemsThinkingCausalLoops` | `systems-thinking.ts` | systemsthinking |
| `exportScientificMethodExperiment` | `scientific-method.ts` | scientificmethod |
| `exportFormalLogicProof` | `formal-logic.ts` | formallogic |
| `exportEngineeringAnalysis` | `engineering.ts` | engineering |
| `exportComputability` | `computability.ts` | computability |
| `exportProofDecomposition` | `proof-decomposition.ts` | (proof system, not a mode — see Proof) |

Modes with no dedicated visual exporter (deductive, inductive, analysis, argumentation, critique,
synthesis, algorithmic, cryptanalytic, modal, constraint, recursive, stochastic, custom) have no
mode-specific diagram. A one-thought session in one of these modes uses
`ExportService.exportGenericThoughtSequence`. A session with more than one thought uses the
session-level visualization in every mode.

### The 14 fluent builder classes (`src/export/visual/utils/`)

All 14 share one shape: `set*`/`add*` methods return `this` for chaining, and a terminal `render()`
returns the finished string. These classes are the internal authoring API of the export layer. The
package entry point (`src/index.ts`) does not export them. The mode exporters use
`DOTGraphBuilder`, `MermaidGraphBuilder` and `ASCIIDocBuilder`, plus the Gantt and state-diagram
builders in three exporters. The other nine builder classes (`GraphMLBuilder`, `SVGBuilder`,
`SVGGroupBuilder`, `TikZBuilder`, `UMLBuilder`, `HTMLDocBuilder`, `MarkdownBuilder`,
`ModelicaBuilder`, `JSONExportBuilder`) have no caller in `src/`; only tests use them.

#### DOTGraphBuilder (`dot.ts`) — GraphViz DOT

```typescript
export class DOTGraphBuilder {
  addNode(node: DotNode): this
  addNodes(nodes: DotNode[]): this
  addEdge(edge: DotEdge): this
  addEdges(edges: DotEdge[]): this
  addSubgraph(subgraph: DotSubgraph): this
  addSubgraphs(subgraphs: DotSubgraph[]): this
  setOptions(options: DotOptions): this
  setGraphName(name: string): this
  setRankDir(direction: DotRankDir): this          // "TB" | "BT" | "LR" | "RL"
  setDirected(directed: boolean): this
  setNodeDefaults(defaults: Partial<DotNode>): this
  setEdgeDefaults(defaults: Partial<DotEdge>): this
  clear(): this
  resetOptions(): this
  render(): string
  static from(nodes?: DotNode[], edges?: DotEdge[], options?: DotOptions): DOTGraphBuilder
}
```

#### MermaidGraphBuilder, MermaidGanttBuilder, MermaidStateDiagramBuilder (`mermaid.ts`) — Mermaid

```typescript
export class MermaidGraphBuilder {
  addNode(node: MermaidNode): this
  addNodes(nodes: MermaidNode[]): this
  addEdge(edge: MermaidEdge): this
  addEdges(edges: MermaidEdge[]): this
  addSubgraph(id: string, label: string, nodeIds: string[], direction?: MermaidDirection): this
  addSubgraphDef(subgraph: MermaidSubgraph): this
  addSubgraphs(subgraphs: MermaidSubgraph[]): this
  setOptions(options: MermaidOptions): this
  setDirection(direction: MermaidDirection): this   // "TD" | "TB" | "LR" | "RL" | "BT"
  setTitle(title: string): this
  setColorScheme(scheme: "default" | "pastel" | "monochrome"): this
  clear(): this
  resetOptions(): this
  render(): string
  renderAsStateDiagram(
    states: Array<{ id: string; label: string; type?: "start" | "end" | "normal" | "choice" }>,
    transitions: Array<{ from: string; to: string; label?: string }>,
  ): string
  renderAsClassDiagram(
    classes: Array<{ name: string; attributes?: string[]; methods?: string[] }>,
    relationships: Array<{
      from: string; to: string; label?: string;
      type: "inheritance" | "composition" | "aggregation" | "association" | "dependency";
    }>,
  ): string
  static from(nodes?: MermaidNode[], edges?: MermaidEdge[], options?: MermaidOptions): MermaidGraphBuilder
}

export class MermaidGanttBuilder {
  setTitle(title: string): this
  setDateFormat(format: string): this
  setAxisFormat(format: string): this
  addExcludes(exclusion: string): this
  addSection(name: string): this
  addTask(task: GanttTask): this
  addMilestone(milestone: Omit<GanttTask, "type" | "duration">): this
  addCriticalTask(task: Omit<GanttTask, "type">): this
  addDoneTask(task: Omit<GanttTask, "type">): this
  getSectionCount(): number
  getTaskCount(): number
  render(): string
}

export class MermaidStateDiagramBuilder {
  setDirection(direction: MermaidDirection): this
  setTitle(title: string): this
  setInitialState(stateId: string): this
  addState(state: StateDiagramState): this
  addStates(states: StateDiagramState[]): this
  addFinalState(stateId: string): this
  addTransition(transition: StateTransition): this
  addTransitions(transitions: StateTransition[]): this
  getStateCount(): number
  getTransitionCount(): number
  render(): string
}
```

#### GraphMLBuilder (`graphml.ts`) — GraphML

```typescript
export class GraphMLBuilder {
  addNode(id: string, label: string, attributes?: { type?: string; metadata?: Record<string, unknown> }): this
  addNodeDef(node: GraphMLNode): this
  addNodes(nodes: GraphMLNode[]): this
  addEdge(source: string, target: string, attributes?: { label?: string; metadata?: Record<string, unknown> }): this
  addEdgeDef(edge: GraphMLEdge): this
  addEdges(edges: GraphMLEdge[]): this
  defineNodeAttribute(name: string, type: "string" | "double" | "int" | "boolean", defaultValue?: string): this
  defineEdgeAttribute(name: string, type: "string" | "double" | "int" | "boolean", defaultValue?: string): this
  setOptions(options: GraphMLOptions): this
  setGraphId(id: string): this
  setGraphName(name: string): this
  setDirected(directed: boolean): this
  setIncludeMetadata(include: boolean): this
  setIncludeLabels(include: boolean): this
  clear(): this
  resetOptions(): this
  render(): string
  static from(nodes?: GraphMLNode[], edges?: GraphMLEdge[], options?: GraphMLOptions): GraphMLBuilder
}
```

#### ASCIIDocBuilder (`ascii.ts`) — plain-text/ASCII documents

```typescript
export class ASCIIDocBuilder {
  setOptions(options: ASCIIDocBuilderOptions): this
  setBoxStyle(style: AsciiBoxStyle): this            // "single" | "double" | "rounded" | "bold" | "ascii"
  setMaxWidth(width: number): this
  setIndent(indent: number): this
  addHeader(title: string, style?: ASCIIHeaderStyle): this
  addSection(title: string, icon?: string): this
  addBoxedTitle(title: string, style?: AsciiBoxStyle): this
  addBulletList(items: string[], bullet?: keyof typeof BULLETS, indent?: number): this   // bullet defaults to "bullet"
  addNumberedList(items: string[], indent?: number, startNumber?: number): this           // startNumber defaults to 1
  addBox(content: string | string[], boxOptions?: { style?: AsciiBoxStyle; title?: string; width?: number; padding?: number }): this
  addTree(root: AsciiTreeNode): this
  addTreeList(items: AsciiTreeNode[]): this
  addTable(
    headers: string[], rows: string[][],
    tableOptions?: { style?: AsciiBoxStyle; columnWidths?: number[]; alignments?: Array<"left" | "center" | "right"> },
  ): this
  addFlowDiagram(steps: string[], direction?: "horizontal" | "vertical"): this
  addProgressBar(                                    // the second argument is the maximum, not the width
    value: number, max?: number, width?: number,     // max defaults to 100, width to 20
    barOptions?: { filled?: string; empty?: string; showPercent?: boolean },
  ): this
  addMetricsPanel(
    metrics: Array<{ label: string; value: string | number }>,
    panelOptions?: { style?: AsciiBoxStyle; title?: string },
  ): this
  addGraph(nodes: AsciiNode[], edges: AsciiEdge[]): this
  addText(text: string): this
  addEmptyLine(count?: number): this
  addHorizontalRule(width?: number, char?: string): this
  clear(): this
  resetOptions(): this
  render(separator?: string): string
  static withOptions(options: ASCIIDocBuilderOptions): ASCIIDocBuilder
}
```

#### SVGBuilder, SVGGroupBuilder (`svg.ts`) — native SVG

```typescript
export class SVGGroupBuilder extends SVGElementBuilder {
  constructor(id?: string)
  setTransform(transform: string): this
  setClassName(className: string): this
  addRect(x: number, y: number, width: number, height: number, options?: SVGShapeOptions): this
  addCircle(cx: number, cy: number, r: number, options?: SVGShapeOptions): this
  addText(x: number, y: number, text: string, options?: SVGTextOptions): this
  addLine(x1: number, y1: number, x2: number, y2: number, options?: SVGLineOptions): this
  addRaw(svg: string): this
  render(): string
}

export class SVGBuilder extends SVGElementBuilder {
  setDimensions(width: number, height: number): this
  setWidth(width: number): this
  setHeight(height: number): this
  setTitle(title: string): this
  setBackground(color: string): this
  setIncludeDefaultDefs(include: boolean): this
  setIncludeDefaultStyles(include: boolean): this
  addDef(def: string): this
  addStyle(style: string): this
  addRect(x: number, y: number, width: number, height: number, options?: SVGShapeOptions): this
  addCircle(cx: number, cy: number, r: number, options?: SVGShapeOptions): this
  addEllipse(cx: number, cy: number, rx: number, ry: number, options?: SVGShapeOptions): this
  addLine(x1: number, y1: number, x2: number, y2: number, options?: SVGLineOptions): this
  addPolyline(points: Array<[number, number]>, options?: SVGLineOptions): this
  addPolygon(points: Array<[number, number]>, options?: SVGShapeOptions): this
  addPath(d: string, options?: SVGPathOptions): this
  addText(x: number, y: number, text: string, options?: SVGTextOptions): this
  addGroup(id?: string): SVGGroupBuilder                 // returns a nested group builder, not `this`
  addRenderedGroup(group: SVGGroupBuilder): this
  addComment(comment: string): this
  addRaw(svg: string): this
  clear(): this
  reset(): this
  render(): string
  static withDimensions(width: number, height: number): SVGBuilder
}
```

`addGroup()` is the one method on this list that breaks the `this`-chaining convention by design —
it returns a child `SVGGroupBuilder` so nested-group content can be composed independently, then
folded back in via `addRenderedGroup()`.

Both classes extend `SVGElementBuilder`, which `svg.ts` does not export. It holds the element list and
the methods `addRect`, `addCircle`, `addText` and `addLine`. Each subclass sets `indent`, the spaces
before each element line: four in a group and two in a document.

#### TikZBuilder (`tikz.ts`) — LaTeX TikZ

```typescript
export class TikZBuilder {
  setOptions(options: TikZOptions): this
  setStandalone(standalone: boolean): this
  setTitle(title: string): this
  setScale(scale: number): this
  setColorScheme(scheme: "default" | "pastel" | "monochrome"): this
  setNodeDistance(distance: string): this
  setLevelDistance(distance: string): this
  addStyle(name: string, style: string): this
  addNode(id: string, label: string, nodeOptions?: TikZNodeOptions): this
  addNodes(nodes: Array<{ id: string; label: string; options?: TikZNodeOptions }>): this
  addEdge(source: string, target: string, edgeOptions?: TikZEdgeOptions): this
  addEdges(edges: Array<{ source: string; target: string; options?: TikZEdgeOptions }>): this
  beginScope(scopeOptions?: TikZScopeOptions): this
  endScope(): this
  addRaw(content: string): this
  addComment(comment: string): this
  addCoordinate(name: string, x: number, y: number): this
  addBackground(x1: number, y1: number, x2: number, y2: number, fill?: string): this   // fill defaults to "gray!10"
  addMetrics(x: number, y: number, metrics: Array<{ label: string; value: string | number }>): this
  addLegend(
    x: number, y: number,
    items: Array<{ label: string; color: { fill: string; stroke: string }; shape?: string }>,
  ): this
  clear(): this
  resetOptions(): this
  render(): string
  static withOptions(options: TikZOptions): TikZBuilder
  static standalone(): TikZBuilder
}
```

#### UMLBuilder (`uml.ts`) — UML (PlantUML syntax)

```typescript
export class UMLBuilder {
  setOptions(options: UMLBuilderOptions): this
  setTitle(title: string): this
  setTheme(theme: UMLBuilderOptions["theme"]): this        // "default" | "sketchy" | "blueprint" | "plain" | "cerulean" | "reddress"
  setDirection(direction: "left to right" | "top to bottom"): this
  setScale(scale: number): this
  addSkinparam(param: string, value: string): this
  addClass(classDef: UMLClassDef): this
  addClasses(classes: UMLClassDef[]): this
  addInterface(interfaceDef: UMLInterfaceDef): this
  addInterfaces(interfaces: UMLInterfaceDef[]): this
  addRelation(relation: UMLRelationDef): this
  addRelations(relations: UMLRelationDef[]): this
  addNote(note: UMLNoteDef): this
  beginPackage(name: string): this
  endPackage(): this
  addRaw(line: string | string[]): this
  reset(): this
  render(): string
}
```

#### HTMLDocBuilder (`html.ts`) — standalone HTML documents

```typescript
export class HTMLDocBuilder {
  setOptions(options: HTMLDocBuilderOptions): this
  setTitle(title: string): this
  setTheme(theme: "light" | "dark" | "auto"): this
  setStandalone(standalone: boolean): this
  addStyle(css: string): this
  addHeading(level: 1 | 2 | 3 | 4 | 5 | 6, text: string): this
  addParagraph(text: string, className?: string): this
  addRaw(html: string): this
  addList(items: string[], ordered?: boolean): this
  addTable(headers: string[], rows: (string | number)[][], caption?: string): this
  addDiv(content: string, className?: string): this
  addSection(title: string, content: string, icon?: string): this
  addMetricCard(label: string, value: string | number, color?: string): this
  addProgressBar(percent: number, color?: string): this
  addBadge(text: string, type?: "primary" | "success" | "warning" | "danger" | "info" | "secondary"): this   // type defaults to "primary"
  beginMetricsGrid(): this
  endMetricsGrid(): this
  addCard(header: string, content: string): this
  reset(): this
  render(): string
}
```

#### MarkdownBuilder (`markdown.ts`) — Markdown documents

```typescript
export class MarkdownBuilder {
  setOptions(options: MarkdownBuilderOptions): this
  setTitle(title: string): this
  enableFrontmatter(metadata?: Record<string, string | number | boolean | string[]>): this
  enableTableOfContents(): this
  addHeading(level: HeadingLevel, text: string): this      // HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
  addParagraph(text: string): this
  addBulletList(items: string[]): this
  addNumberedList(items: string[]): this
  addTaskList(items: Array<{ text: string; completed: boolean }>): this
  addCodeBlock(code: string, language?: string): this
  addTable(headers: string[], rows: string[][], alignments?: TableAlignment[]): this
  addBlockquote(text: string): this
  addHorizontalRule(): this
  addLink(text: string, url: string, title?: string): this
  addImage(alt: string, url: string, title?: string): this
  addMermaidDiagram(diagram: string): this
  addCollapsible(summary: string, detailContent: string): this
  addKeyValueSection(items: Record<string, string | number | boolean>): this
  addRaw(markdown: string): this
  addSection(title: string, sectionContent: string, level?: HeadingLevel): this   // level defaults to 2
  addBadge(label: string, value: string, color?: string): this
  addProgressBar(value: number, max?: number, width?: number): this
  reset(): this
  render(): string
}
```

#### ModelicaBuilder (`modelica.ts`) — Modelica models

```typescript
export class ModelicaBuilder {
  setOptions(options: ModelicaBuilderOptions): this
  beginPackage(name: string, description: string): this
  endPackage(): this
  beginModel(name: string, description: string): this
  addParameter(param: ModelicaParameterDef): this
  addVariable(variable: ModelicaVariableDef): this
  addEquation(eq: ModelicaEquationDef): this
  addConnection(conn: ModelicaConnectionDef): this
  endModel(): this
  addRaw(code: string): this
  reset(): this
  render(): string
}
```

#### JSONExportBuilder (`json.ts`) — structured JSON graphs/documents

```typescript
export class JSONExportBuilder {
  setOptions(options: JSONExportBuilderOptions): this
  setFormatting(formatting: { prettyPrint?: boolean; indent?: number }): this
  setMetadata(metadata: Record<string, unknown>): this
  addSection(key: string, value: unknown): this
  addArraySection(key: string, items: unknown[]): this
  addObjectSection(key: string, object: Record<string, unknown>): this
  addSections(sections: JSONSectionDef[]): this
  setPath(path: string, value: unknown): this
  addGraph(nodes: JsonVisualNode[], edges: JsonVisualEdge[]): this
  addLayout(layout: { type: "hierarchical" | "force" | "circular" | "tree" | "linear"; direction?: "TB" | "BT" | "LR" | "RL" }): this
  addMetrics(metrics: Record<string, unknown>): this
  addLegend(legend: Array<{ label: string; color: string; shape?: string }>): this
  removeSection(key: string): this
  reset(): this
  getData(): Record<string, unknown>
  render(): string

  private removeNulls(obj: Record<string, unknown>): Record<string, unknown>
  private sortKeysRecursive(obj: unknown): unknown
}
```

### LaTeX support classes (`visual/utils/latex.ts`, `latex-mermaid-integration.ts`)

Two more classes bring `visual/utils/` to 16 classes. With `VisualExporter` and `FileExporter`,
`src/export/` holds 18 classes. They are separate from `ExportService`'s own `exportToLatex` (a
private, simpler LaTeX path) because they produce a fuller document with embedded diagrams.

```typescript
export class LaTeXExporter {
  constructor(options?: LaTeXExportOptions)
  preamble(): string
  export(session: ThinkingSession): string
  // 30 private helper methods: 9 per-mode formatters, a generic formatter for every other
  // mode, and layout, style and escaping helpers
}

export interface MermaidLatexOptions {
  engine: "mermaid-tikz" | "external-svg" | "inline-code";
  width?: string; caption?: boolean; label?: boolean;
  floatPlacement?: "h" | "t" | "b" | "p" | "H";
  colorScheme?: "default" | "monochrome" | "pastel";
}

export class LatexMermaidIntegrator {
  constructor()

  generateMermaidPreamble(engine: "mermaid-tikz" | "external-svg" | "inline-code"): string
  embedMermaidDiagram(mermaidCode: string, caption: string, label: string, options: MermaidLatexOptions): string
  generateThoughtDiagram(thought: Thought, options: MermaidLatexOptions): string
  generateSessionDiagrams(session: ThinkingSession, options: MermaidLatexOptions): string
  generateMermaidAppendix(session: ThinkingSession): string
  generateIntegratedDocument(session: ThinkingSession, options: MermaidLatexOptions & { includeAppendix?: boolean }): string

  private convertMermaidToTikZ(mermaidCode: string): string
}
```

`LaTeXExporter.export()` is the full-document entry point; its private per-mode formatters
(`formatMathematicsThought`, `formatPhysicsThought` and seven more, plus `formatGenericThought` for
every other mode) follow the same shape as `ExportService`'s private markdown/HTML formatters — a
duplicated shape, not shared code. `LaTeXExporter` imports the canonical `escapeLatex()` from
`src/utils/sanitization.ts`, as `TikZBuilder` and `ExportService` do; its private `escapeLatex`
method only calls that function.

`convertMermaidToTikZ` is a placeholder. It writes the Mermaid source as LaTeX comment lines and
emits a fixed one-node TikZ picture, so the embedded diagram is not a vector drawing of the graph.
Nothing in `src/` calls `LatexMermaidIntegrator`, and `LaTeXExporter` is only re-exported by
`src/export/index.ts`, which nothing in `src/` imports. Tests are the only callers of both.

---

### Session graph renderer (`src/export/visual/session-graph.ts`)

**Purpose**: Renders a multi-thought session in the 8 formats that `graph-render.ts` owns (`svg`,
`graphml`, `tikz`, `modelica`, `html`, `uml`, `json`, `markdown`). It maps the session to a
`GraphRenderModel` and calls `renderGraphModel` in `graph-render.ts`, which calls the helper
functions in `visual/utils/*.ts`, not the builder classes. `modes/historical.ts` uses the same
`renderGraphModel`.

```typescript
export interface SessionGraphNode {
  id: string; label: string;
  type: "session" | "thought";       // "session" is the summary node
  detail?: string; mode?: string; thoughtNumber?: number;
}
export interface SessionGraphEdge {
  source: string; target: string;
  type: "sequence" | "revision" | "dependency"; label?: string;
}
export interface SessionGraphModel {
  title: string; mode: string;
  thoughtCount: number; branchCount: number; revisionCount: number;
  nodes: SessionGraphNode[]; edges: SessionGraphEdge[];
}

export function renderSessionGraph(model: SessionGraphModel, format: VisualFormat): string
```

`ExportService` renders `mermaid`, `dot` and `ascii` for a session itself. `renderSessionGraph`
throws `Unsupported visual format for session-level export` for those three and for any other
format outside the list above.

---

## Proof

`src/proof/` (16 files, 10 classes) implements proof decomposition, gap analysis, assumption
tracking, inconsistency detection, circular-reasoning detection, and strategy recommendation for
the Mathematics and Formal Logic modes. Its `index.ts` barrel is unused: no file under `src/`
imports it. `SessionManager.addThought()` reaches the proof classes through `advisory.ts` and
`extended-advisory.ts`, which between them reach every other module of the directory. Tests import
the concrete modules directly. The classes share the types `ProofDecomposition`,
`AtomicStatement` and `DependencyGraph` from `src/types/modes/mathematics.ts`. `decomposer.ts`
defines `ProofStep`.

`advisory.ts` exports `analyzeProofAdvisory(thought, deps?)`. It finds proof content in a
mathematics or formal-logic thought, runs the decomposer, gap analyzer, circular-reasoning
detector and inconsistency detector, and returns an `AdvisoryProofAnalysis`, or `undefined` when
the thought carries no proof content. `extended-advisory.ts` adds the assumption tracker, verifier,
branch analyzer, hierarchical proof manager, strategy recommender and fallacy patterns.

`word-overlap.ts` exports `wordOverlap(a, b, options)`. It returns the share of the words that two
texts have in common, from 0 to 1. A word counts when it has more characters than
`options.longerThan`. `options.denominator` says whether the shared words are divided by the words
of the smaller text or of the larger text. The result is 0 when either text has no word that counts.
`ProofDecomposer.hasSignificantOverlap`, `GapAnalyzer.computeWordOverlap` and
`CircularReasoningDetector.statementsEquivalent` call it. Each caller keeps its own word limit,
denominator, lowercasing and threshold.

### ProofDecomposer (`decomposer.ts`)

**Purpose**: The entry point — turns raw proof text or a `ProofStep[]` into atomic statements, a
dependency graph, and a completeness score.

```typescript
export interface ProofStep { content: string; justification?: string; latex?: string }

export class ProofDecomposer {
  decompose(proof: string | ProofStep[], theorem?: string): ProofDecomposition
  extractStatements(steps: ProofStep[]): AtomicStatement[]
  classifyStatement(step: ProofStep, stepNumber: number): AtomicStatement | null
  inferDependencies(                 // returns nothing: it sets `derivedFrom` on the atoms
    atoms: AtomicStatement[], steps: ProofStep[], statementIds: Map<string, string>,
  ): void
  computeCompleteness(atoms: AtomicStatement[], gaps: ProofGap[]): number
  computeMetrics(decomposition: ProofDecomposition): {
    atomCount: number; rootCount: number; leafCount: number; avgDependencies: number;
    maxDependencyDepth: number; completeness: number; gapCount: number; implicitAssumptionCount: number;
  }
}
```

`decompose()` is the orchestrator: parse (`parseProofText` if given a raw string) → classify each
step (`extractStatements` calls `classifyStatement`; the type is an axiom, definition, hypothesis,
lemma, derived statement or conclusion, chosen with regex `StatementPattern`s initialized in the
constructor) → infer dependencies (`inferDependencies`: pattern-based reference detection, not
NLP) → build the dependency graph (`buildDependencyGraph`) → trace assumption chains back to axioms
(`traceAssumptionChains`) → detect gaps (`detectBasicGaps`, `findImplicitAssumptions`) → score
completeness and rigor (`computeCompleteness`, `assessRigorLevel`). Statement classification and
dependency inference are both regex-pattern-driven, not a formal parser — `hasSignificantOverlap`
uses word-overlap heuristics to decide whether two statements likely reference each other.

### GapAnalyzer (`gap-analyzer.ts`)

**Purpose**: Deeper gap analysis than `ProofDecomposer`'s basic pass — unjustified logical leaps,
missing intermediate steps, scope errors, undefined terms.

```typescript
export interface GapAnalyzerConfig {
  strictness: "lenient" | "standard" | "strict";   // default "standard"
  checkDomainAssumptions: boolean;                 // default true
  verifyInferenceRules: boolean;                   // default true
  maxLeapDistance: number;                         // default 2
}

// Not exported: { isValid: boolean; reason?: string; suggestedFix?: string; missingSteps?: string[] }
interface TransitionValidation { /* see above */ }

export class GapAnalyzer {
  constructor(config?: Partial<GapAnalyzerConfig>)

  analyzeGaps(decomposition: ProofDecomposition): GapAnalysis
  isValidTransition(from: AtomicStatement, to: AtomicStatement): TransitionValidation
  findUnjustifiedLeaps(atoms: AtomicStatement[], graph: DependencyGraph): ProofGap[]
  findMissingSteps(atoms: AtomicStatement[], graph: DependencyGraph): ProofGap[]
  findScopeErrors(atoms: AtomicStatement[]): ProofGap[]
  findUndefinedTerms(atoms: AtomicStatement[]): ProofGap[]
  findImplicitAssumptions(atoms: AtomicStatement[], gaps: ProofGap[]): ImplicitAssumption[]
  findUnjustifiedSteps(atoms: AtomicStatement[]): string[]
  generateSuggestions(
    gaps: ProofGap[], implicitAssumptions: ImplicitAssumption[], unjustifiedSteps: string[],
  ): string[]
  computeCompleteness(
    atoms: AtomicStatement[], gaps: ProofGap[], implicitAssumptions: ImplicitAssumption[],
  ): number
}
```

`isValidTransition` takes any two statements. It is always valid when `to` is an axiom,
definition or hypothesis. When `to.derivedFrom` includes `from.id`, it checks the inference rule
(`verifyInferenceRule`) if `to.usedInferenceRule` is set and `verifyInferenceRules` is on.
Otherwise it looks for an implied semantic connection (`checkImpliedConnection`). Only
`findMissingSteps` calls it. `findUnjustifiedLeaps` does not call it. It flags a derived statement,
lemma or conclusion that has no `derivedFrom` entry. Unless `strictness` is `lenient`, it also
flags a statement whose `computeLeapDistance` is larger than `maxLeapDistance`.
`findUndefinedTerms` looks for the phrase "by (the) definition of X". It flags X when no definition
statement defines X and X is not in the hardcoded list of standard math vocabulary
(`isStandardMathTerm`). The set of defined terms comes from all definition statements in the proof.

### AssumptionTracker (`assumption-tracker.ts`)

**Purpose**: Traces which axioms/assumptions each statement ultimately depends on, and finds the
minimal assumption set a proof actually needs.

```typescript
// Not exported: { assumptionId: string; isDischarged: boolean; dischargedAt?: string; dischargeReason?: string }
interface DischargeStatus { /* see above */ }

export class AssumptionTracker {
  traceToAssumptions(conclusionId: string, graph: DependencyGraph): AssumptionChain
  analyzeAssumptions(decomposition: ProofDecomposition): AssumptionAnalysis
  findMinimalAssumptions(
    conclusionDependencies: Map<string, string[]>, graph: DependencyGraph,
  ): Map<string, string[]>
  findUnusedAssumptions(decomposition: ProofDecomposition): string[]
  checkAssumptionDischarge(decomposition: ProofDecomposition): DischargeStatus[]
  getAssumptionImpact(assumptionId: string, graph: DependencyGraph): string[]
  getSuggestions(analysis: AssumptionAnalysis): string[]
  validateStructure(decomposition: ProofDecomposition): { isValid: boolean; issues: string[] }
}
```

`traceToAssumptions` collects the assumptions that one conclusion depends on, with a depth-first
walk back to axiom, definition and hypothesis statements. `findMinimalAssumptions` takes those
assumptions for each conclusion. `computeMinimalSet` removes one assumption at a time and keeps the
removal when `isReachable` shows that the conclusion still follows from the smaller set
(`isReachable` propagates forward from the assumptions). The result is a greedy, approximate
minimal set. `findUnusedAssumptions` is a different check: it lists axioms, definitions and
hypotheses that no statement and no edge uses. `getAssumptionImpact` runs a breadth-first search
over `derivedFrom` and returns every statement that depends on the assumption, directly or through
other statements. It does not test whether a dependent has other support.

### InconsistencyDetector (`inconsistency-detector.ts`)

**Purpose**: Finds direct contradictions, type mismatches, domain violations, undefined operations,
axiom conflicts, and quantifier-scope errors across a proof's statements.

```typescript
export interface InconsistencyDetectorConfig {
  strictTyping: boolean;             // default true
  checkDomains: boolean;             // default true
  checkQuantifiers: boolean;         // default true
  maxPairwiseComparisons: number;    // default 1000
}

export class InconsistencyDetector {
  constructor(config?: Partial<InconsistencyDetectorConfig>)

  analyze(decomposition: ProofDecomposition): Inconsistency[]
  detectContradictions(atoms: AtomicStatement[]): Omit<Inconsistency, "id">[]
  detectTypeMismatches(atoms: AtomicStatement[]): Omit<Inconsistency, "id">[]
  detectDomainViolations(atoms: AtomicStatement[]): Omit<Inconsistency, "id">[]
  detectUndefinedOperations(atoms: AtomicStatement[]): Omit<Inconsistency, "id">[]
  detectAxiomConflicts(atoms: AtomicStatement[]): Omit<Inconsistency, "id">[]
  detectQuantifierErrors(atoms: AtomicStatement[], graph: DependencyGraph): Omit<Inconsistency, "id">[]
  getSummary(inconsistencies: Inconsistency[]): {
    isConsistent: boolean; criticalCount: number; errorCount: number; warningCount: number; summary: string;
  }
}
```

`analyze()` runs the six `detect*` passes and assigns each finding an ID of the form `inc-N`. The
type, domain and quantifier passes run only when `strictTyping`, `checkDomains` and
`checkQuantifiers` are true (the default). Contradiction detection (`detectContradictions`) is
syntactic (`isSyntacticNegation` — pattern-matches negation forms like "not X" against "X"), not
semantic — it will not catch a contradiction expressed in different words. Only
`detectContradictions` uses the fixed table of nine `ContradictionPattern` entries built in the
constructor (`initializePatterns`). It compares statements in pairs, and `maxPairwiseComparisons`
limits the pairs: the loop covers the first `sqrt(maxPairwiseComparisons)` statements, which is 32
with the default. A proof with more statements is not fully checked for direct contradictions.
`getSummary().isConsistent` is true when there is no critical and no error finding.

### CircularReasoningDetector (`circular-detector.ts`)

**Purpose**: Detects circular reasoning — self-referential statements, dependency cycles,
begging-the-question patterns, and tautologies masquerading as proof steps.

```typescript
export interface CircularReasoningResult {
  hasCircularReasoning: boolean;     // ignores tautologies
  cycles: CircularPath[];
  selfReferentialStatements: string[];
  beggingTheQuestion: string[];
  tautologies: string[];
  summary: string;
}

export class CircularReasoningDetector {
  detectCircularReasoning(decomposition: ProofDecomposition): CircularReasoningResult
  isSelfReferential(statement: AtomicStatement): boolean
  findReasoningCycles(graph: DependencyGraph): CircularPath[]
  findBeggingTheQuestion(atoms: AtomicStatement[], graph: DependencyGraph): string[]
  findTautologies(atoms: AtomicStatement[]): string[]
  analyzeCycle(cycle: CircularPath, graph: DependencyGraph): {
    involvedStatements: AtomicStatement[]; breakPoints: string[]; suggestedFix: string;
  }
  conclusionDependsOnItself(conclusionId: string, graph: DependencyGraph): boolean
}
```

`findReasoningCycles` returns nothing when `graph.hasCycles` is false. Otherwise it reads the
strongly connected components that `DependencyGraphBuilder` computed with Tarjan's algorithm and
makes one `CircularPath` for each component with more than one statement. A graph that
`ProofDecomposer` built always has these components when it has a cycle. The detector runs its own
depth-first search (`findCyclesDFS`, `extractCyclePath`) only for a graph without components. A
self-referential statement is a component of one node, so `isSelfReferential` finds it, not
`findReasoningCycles`. `findBeggingTheQuestion` and `findTautologies` are pattern/equivalence
heuristics (`statementsEquivalent`, `isLogicalTautology`), not derived from the cycle search.

### DependencyGraphBuilder (`dependency-graph.ts`)

**Purpose**: The mutable graph builder behind `DependencyGraph` — add statements and dependency
edges, then query structure (roots, leaves, depth, cycles, topological order, paths).

```typescript
export class DependencyGraphBuilder {
  addStatement(statement: AtomicStatement): void
  createStatement(      // makes the statement with a random UUID as its id, adds it, and returns it
    statement: string, type: AtomicStatement["type"],
    options?: Partial<Omit<AtomicStatement, "id" | "statement" | "type">>,
  ): AtomicStatement
  addDependency(        // throws an Error when either statement is not in the graph
    from: string, to: string,
    type?: "logical" | "definitional" | "computational" | "implicit",   // default "logical"
    options?: { strength?: number; inferenceRule?: InferenceRule },
  ): void

  findRoots(): string[]
  findLeaves(): string[]
  getAncestors(nodeId: string): string[]
  getDescendants(nodeId: string): string[]
  computeDepth(): number
  computeWidth(): number
  detectCycles(): string[][]
  hasCycles(): boolean
  getTopologicalOrder(): string[] | null   // null when the graph has a cycle
  findPath(from: string, to: string): string[] | null
  findAllPaths(from: string, to: string, maxPaths?: number): string[][]   // default maxPaths: 100

  build(): DependencyGraph
  get nodeCount(): number
  get edgeCount(): number
  hasNode(nodeId: string): boolean
  getNode(nodeId: string): AtomicStatement | undefined
  getAllNodes(): AtomicStatement[]
  getAllEdges(): DependencyEdge[]
  clear(): void
}
```

`ProofDecomposer.buildDependencyGraph` (private) is the only code that creates a
`DependencyGraphBuilder`. The other proof classes read the finished `DependencyGraph` value, not
the builder. `detectCycles()` uses Tarjan's algorithm, and `build()` stores its result as
`stronglyConnectedComponents` when the graph has a cycle. `getTopologicalOrder()` returning `null`
is the graph's own signal for "contains a cycle," independent of `CircularReasoningDetector`'s
higher-level analysis.

### HierarchicalProofManager (`hierarchical-proof.ts`)

**Purpose**: Organizes a proof into a tree of lemmas/corollaries/sub-proofs rather than a flat step
list, and can render that tree to Mermaid.

```typescript
export interface HierarchicalProofOptions {
  autoExtractLemmas?: boolean;       // default true
  maxDepth?: number;                 // default 10
  extractMetadata?: boolean;         // default true
}
export interface ProofElementInput {
  type: HierarchicalProofType; statement: string; name?: string;
  proof: ProofStep[]; dependencies?: string[];
}

export class HierarchicalProofManager {
  constructor(options?: HierarchicalProofOptions)

  createProof(statement: string, steps: ProofStep[], name?: string): HierarchicalProof   // always a theorem
  createElement(input: ProofElementInput): HierarchicalProof
  buildTree(root: HierarchicalProof): ProofTree

  addLemma(proof: HierarchicalProof, lemma: ProofElementInput): HierarchicalProof
  addCorollary(proof: HierarchicalProof, corollary: ProofElementInput): HierarchicalProof
  findById(tree: ProofTree, id: string): HierarchicalProof | undefined
  findByType(tree: ProofTree, type: HierarchicalProofType): HierarchicalProof[]
  findIncomplete(tree: ProofTree): HierarchicalProof[]
  generateSummary(tree: ProofTree): string
  toMermaid(tree: ProofTree): string
}
```

`createProof()` and `createElement()` extract lemmas from the step list (private
`extractSubProofs`, `findLemmas`) when `autoExtractLemmas` is true, and they set `isComplete` on each
element (`checkCompleteness` / `checkStepCompleteness`). `createProof()` makes a theorem;
`createElement()` makes a lemma, corollary, claim or proposition. `addLemma()` and `addCorollary()`
create an element from the input and return a new proof with that element added to `subProofs`;
they do not change the original proof. `buildTree()` walks the existing sub-proofs down to
`maxDepth`, then computes the dependency order (`computeDependencyOrder`) and the statistics
(`calculateStatistics`). `toMermaid()` is this class's own diagram
renderer — a proof-tree-specific Mermaid emitter, separate from `MermaidGraphBuilder` in
`src/export/visual/utils/mermaid.ts`.

### BranchAnalyzer (`branch-analyzer.ts`)

**Purpose**: Partitions a proof's steps into branches that could be verified or explored in
parallel, and orders the branches into execution levels.

```typescript
export interface BranchAnalyzerOptions {
  minBranchSize?: number;            // default 1
  estimateComplexity?: boolean;      // default true
  extractMetadata?: boolean;         // default true
}

export class BranchAnalyzer {
  constructor(options?: BranchAnalyzerOptions)

  analyze(steps: ProofStep[]): BranchAnalysisResult
  buildDependencyGraph(steps: ProofStep[]): Map<number, DependencyNode>
  partitionIntoBranches(graph: Map<number, DependencyNode>, steps: ProofStep[]): ProofBranch[]
  markIndependentBranches(branches: ProofBranch[]): void
  getExecutionOrder(branches: ProofBranch[]): ProofBranch[][]   // outer array = levels, inner = branches in one level
  estimateComplexity(branch: ProofBranch): number
  getStatistics(result: BranchAnalysisResult): {
    totalBranches: number; independentBranches: number; maxParallelism: number;
    totalSteps: number; avgBranchSize: number; avgComplexity: number;
  }
}
```

`getExecutionOrder()` returns a list of levels, not a flat order: branches within one inner array
have no dependency on each other and could run concurrently, and the levels are ordered. The
branches are mutually independent by construction. `partitionIntoBranches` builds each branch as a
connected component of the step dependency graph, and the component search follows both
`dependencies` and `dependents`, so no dependency edge leaves a branch. `resolveBranchDependencies`
therefore records no cross-branch edge, `markIndependentBranches` marks every branch independent,
and `getExecutionOrder` returns one level that holds all branches.

### ProofVerifier (`verifier.ts`)

**Purpose**: Checks each proof step's justification against a known set of inference rules and
flags structural problems (circular references, undefined terms) across the whole step sequence.

```typescript
export interface ProofVerifierConfig {
  checkCircular?: boolean;           // default true
  checkUndefinedTerms?: boolean;     // default true
  strict?: boolean;                  // default false
  customRules?: string[];            // default []
}

export class ProofVerifier {
  constructor(config?: ProofVerifierConfig)

  verify(steps: ProofStep[]): VerificationResult
  verifyStep(step: ProofStep, context?: ProofStep[]): VerificationError[]
  isValidJustification(justification: string): boolean
  getKnownRules(): string[]
  addCustomRule(rule: string): void
}
```

`verify()` parses every step (`parseStep` → extracts justification, references, and
introduced/used terms), then runs two whole-sequence checks that a single-step `verifyStep()` call
cannot: `checkCircularReferences` (a step that, transitively, justifies itself) and
`checkUndefinedTerms` (a term used before any step introduces it); each runs only when its config
flag is true. The constructor builds a fixed set of 31 known rule names, and `customRules` adds to
it. `addCustomRule()` extends the
known-rule set at runtime — `isValidJustification()` checks against whatever rules are currently
registered, including custom ones added earlier in the same instance's lifetime.

### StrategyRecommender (`strategy-recommender.ts`)

**Purpose**: Given a theorem statement, recommends proof strategies (induction, contradiction,
direct, contrapositive, ...) ranked by fit, each with the static template for its strategy.

```typescript
export interface StrategyRecommenderConfig {
  maxRecommendations?: number;       // default 3
  minConfidence?: number;            // default 0.3
  includeTemplates?: boolean;        // default true; stored, never read
}

export class StrategyRecommender {
  constructor(config?: StrategyRecommenderConfig)

  recommend(theorem: string): StrategyRecommendation[]
  extractFeatures(theorem: string): TheoremFeatures
  matchStrategies(features: TheoremFeatures): Array<{ strategy: ProofStrategyType; score: number; matchedFeatures: string[] }>
  getStrategies(): ProofStrategyType[]
  getTemplate(strategy: ProofStrategyType): ProofTemplate | undefined
}
```

`recommend()` extracts features from the theorem text (`extractFeatures` — domain type via
`detectDomainType`, plus `detectAdditionalFeatures`, which returns tags such as `parity`,
`uniqueness`, `constructive` and `impossibility`), scores all 12 strategies against a fixed weight
table (`initializeStrategyWeights`, `matchStrategies`) with domain and feature bonuses layered on
(`applyDomainBonus`, `applyAdditionalFeatureBonus`), keeps the scores of at least `minConfidence`,
and returns the top `maxRecommendations`, sorted by score. Each result carries reasoning text
(`generateReasoning`) and the static `ProofTemplate` of its strategy (`initializeTemplates` builds a
per-strategy template map at construction; `getDefaultTemplate` is the fallback for a strategy with
no custom template). Nothing fills a template with content from the theorem. The weights and bonuses
are fixed tables in the code; the config cannot change them.

### Warning patterns (`patterns/warnings.ts`)

Not a class — a static catalog of 12 named `WarningPattern` constants (division by hidden zero,
assuming the conclusion, affirming the consequent, denying the antecedent, hasty generalization,
ambiguous middle, illegal cancellation, infinity arithmetic, necessary/sufficient confusion,
existential instantiation error, √ sign error, limit exchange error). `ALL_WARNING_PATTERNS` holds
11 of them. `AMBIGUOUS_MIDDLE` stays exported but is not scanned, because its regex fails in both
directions. The file also has four functions:

```typescript
export function getPatternsByCategory(category: WarningCategory): WarningPattern[]
export function getPatternsBySeverity(severity: "info" | "warning" | "error" | "critical"): WarningPattern[]
export function checkStatement(statement: string): { pattern: WarningPattern; match: RegExpMatchArray }[]
export function checkProof(statements: string[]): Map<number, { pattern: WarningPattern; match: RegExpMatchArray }[]>
```

`checkStatement` is called by `findFallacies` in `extended-advisory.ts`, which flags a known
logical-fallacy pattern by name rather than re-deriving it structurally — a complementary,
name-the-fallacy layer alongside `InconsistencyDetector`'s structural contradiction detection.
`checkProof`, `getPatternsByCategory` and `getPatternsBySeverity` are exported from
`src/proof/index.ts`. No other code in `src/` calls them.

---

## Taxonomy

`src/taxonomy/` classifies and recommends reasoning approaches independent of the 34 `ThinkingMode`
values — a broader 69-entry taxonomy backs `recommend_mode` and related tooling. The live request
path reaches it through two wrappers. `advisory.ts` appends reasoning-type advice to the
`recommend_mode` response, and `flow-advisory.ts` appends a reasoning-flow report to the
`summarize` text.

### Reasoning taxonomy data (`reasoning-types.ts`)

```typescript
export type ReasoningCategory =
  | "deductive" | "inductive" | "abductive" | "analogical" | "causal"
  | "mathematical" | "scientific" | "probabilistic" | "dialectical"
  | "practical" | "creative" | "critical";

export interface ReasoningType {
  id: string; name: string; category: ReasoningCategory; description: string;
  aliases: string[]; relatedTypes: string[]; prerequisites: string[];
  applications: string[]; strengths: string[]; limitations: string[];
  examples: string[]; keywords: string[];
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  usageFrequency: "rare" | "uncommon" | "common" | "very_common";
  formalDefinition?: string;
  notation?: string;
}

export const REASONING_TAXONOMY: ReasoningType[]   // 69 entries

export function getReasoningType(id: string): ReasoningType | undefined
export function getReasoningTypesByCategory(category: ReasoningCategory): ReasoningType[]
export function searchReasoningTypes(query: string): ReasoningType[]
export function getRelatedTypes(id: string): ReasoningType[]
export function getTaxonomyStats(): {
  total: number;
  byCategory: Map<ReasoningCategory, number>;
  byDifficulty: Map<string, number>;
  byFrequency: Map<string, number>;
}
```

The header comment of `reasoning-types.ts` says "110 reasoning types". `REASONING_TAXONOMY` holds 69
entries: 20 deductive, 15 inductive, 10 abductive, 8 analogical, and 2 in each of the other eight
categories. Count the `id:` fields to check the number.

### TaxonomyClassifier (`classifier.ts`)

**Purpose**: Classifies a `Thought`, or free text, against the 69-entry taxonomy via keyword + context scoring.

```typescript
export interface ThoughtClassification {
  primaryCategory: ReasoningCategory; primaryType: ReasoningType; secondaryTypes: ReasoningType[];
  confidence: number; matchedKeywords: string[];
}

export class TaxonomyClassifier {
  classifyThought(thought: Thought): ThoughtClassification
  classifyText(text: string): ThoughtClassification
  getType(typeId: string): ReasoningType | undefined
  getTypesByCategory(category: ReasoningCategory): ReasoningType[]
  getCategories(): ReasoningCategory[]
  getStatistics(): {
    totalTypes: number;
    categories: Map<ReasoningCategory, number>;
    difficulties: Map<string, number>;
    frequencies: Map<string, number>;
  }
}
```

The constructor builds a keyword index (`buildKeywordIndex`) over every taxonomy entry's
`keywords` and `aliases` once, up front. The index also holds the tokens of each type's `name` that
are longer than 3 characters. `classifyThought` passes the thought's content to `classifyText`,
which tokenizes the text (`tokenize`), scores each candidate type by keyword overlap
(`calculateKeywordScore`) plus a context bonus for surrounding sentence structure
(`calculateContextScore`), and returns the best-scoring type with at most 3 secondary types.
`confidence` is `min(1, score / 10)`. When no token matches, `classifyText` returns the type
`practical_common_sense` with confidence 0.3 and no secondary types. `taxonomy/advisory.ts` constructs one `TaxonomyClassifier`
and calls `classifyText()` on the `problemType` and domain text of a `recommend_mode` request.

### TaxonomyNavigator (`navigator.ts`)

**Purpose**: Query and traversal API over the taxonomy graph — filtered search, learning paths,
type comparison, and a text report generator.

```typescript
export interface TaxonomyQuery {
  categories?: ReasoningCategory[];
  difficulties?: Array<"beginner" | "intermediate" | "advanced" | "expert">;
  frequencies?: Array<"rare" | "uncommon" | "common" | "very_common">;
  keywords?: string[]; applications?: string[];
  hasPrerequisites?: boolean; hasFormalDefinition?: boolean; searchText?: string;
}
export interface QueryResult { type: ReasoningType; relevanceScore: number; matchReasons: string[] }
export interface NavigationPath { steps: NavigationStep[]; totalDistance: number }
export interface TaxonomyExploration {
  startType: ReasoningType;
  neighborhood: {
    prerequisites: ReasoningType[]; related: ReasoningType[];
    sameCategory: ReasoningType[]; similarApplications: ReasoningType[];
  };
  learningPath: ReasoningType[];               // suggested order to learn the prerequisites
  dependencies: Map<string, string[]>;         // type ID -> prerequisite IDs
}

export class TaxonomyNavigator {
  query(filters: TaxonomyQuery): QueryResult[]
  findByKeyword(keyword: string): ReasoningType[]
  findByApplication(application: string): ReasoningType[]
  explore(typeId: string): TaxonomyExploration | null
  findPath(fromId: string, toId: string, maxDepth?: number): NavigationPath | null   // maxDepth defaults to 6
  recommend(
    problemDescription: string,
    context?: { difficulty?: "beginner" | "intermediate" | "advanced" | "expert"; domain?: string; constraints?: string[] },
  ): QueryResult[]                                                                 // at most 10 results
  compare(id1: string, id2: string): {
    type1: ReasoningType; type2: ReasoningType;
    commonalities: string[]; differences: string[]; relatedPath: NavigationPath | null;
  } | null                                                                         // null for an unknown ID
  getOverview(): {
    total: number;
    categories: Array<{ name: ReasoningCategory; count: number; types: string[] }>;
    difficulties: Map<string, number>; popularTypes: ReasoningType[];
  }
  generateQueryReport(results: QueryResult[]): string
}
```

`explore()` sets `learningPath` with `computeLearningPath`, a depth-first walk over
`ReasoningType.prerequisites` that returns the prerequisite chain leading up to the requested type.
It sets `dependencies` with the private `buildDependencyGraph`, which walks `prerequisites` and
`relatedTypes` to depth 2.
`SuggestionEngine` constructs a `TaxonomyNavigator` and calls its `recommend()` and `query()`
methods, so `recommend_mode` reaches it through `suggestForProblem()`.

### SuggestionEngine (`suggestion-engine.ts`)

**Purpose**: The largest taxonomy file that holds logic (`reasoning-types.ts` is larger, and is
data) — recommends a reasoning type for a described problem, and retrospectively analyzes a
completed session for quality and bottlenecks.

```typescript
export type CognitiveLoad = "minimal" | "low" | "moderate" | "high" | "very_high";
export type DualProcessType = "system1" | "system2" | "hybrid";
export interface QualityMetrics { /* rigor, completeness, clarity, ... */ }
export interface ProblemCharacteristics {
  domain: string;
  complexity: "simple" | "moderate" | "complex" | "very_complex";
  uncertainty: "low" | "medium" | "high";
  timeConstraints: "none" | "loose" | "moderate" | "tight" | "critical";
  stakeholders: number;
  novelty: "routine" | "familiar" | "novel" | "unprecedented";
  dataAvailability: "abundant" | "adequate" | "limited" | "scarce";
  reversibility: "reversible" | "partially_reversible" | "irreversible";
  ethicalImplications: "none" | "minor" | "moderate" | "significant" | "critical";
}
export interface ReasoningSuggestion {
  reasoningType: ReasoningType; metadata: EnhancedMetadata; relevanceScore: number;
  rationale: string[]; warnings: string[]; alternatives: string[];
  estimatedEffort: string; successProbability: number;
}
export interface SessionAnalysis {
  session: ThinkingSession; totalThoughts: number; uniqueModes: number;
  cognitiveLoadProfile: Map<CognitiveLoad, number>;
  dualProcessDistribution: Map<DualProcessType, number>;
  averageQualityMetrics: QualityMetrics;
  modeEffectiveness: Map<string, number>;      // always an empty Map
  suggestions: ReasoningSuggestion[];          // always empty
  bottlenecks: string[]; improvements: string[];
}

export class SuggestionEngine {
  getMetadata(typeId: string): EnhancedMetadata | null
  suggestForProblem(characteristics: Partial<ProblemCharacteristics>): ReasoningSuggestion[]   // missing fields get defaults
  analyzeSession(session: ThinkingSession): SessionAnalysis
}
```

`suggestForProblem` maps problem complexity to a difficulty tier (`mapComplexityToDifficulty`),
then builds per-suggestion rationale (`buildRationale`), warnings (`buildWarnings`), an effort
estimate (`estimateEffort`), and a success-probability estimate (`estimateSuccessProbability`) — all
heuristic scoring functions, not learned from historical outcomes. It sorts the result by
`successProbability` and keeps at most 10 items. `analyzeSession` maps each thought's
`ThinkingMode` to a taxonomy type with `mapModeToType` (29 mode names; a mode with no mapping, such
as `historical`, `synthesis`, `argumentation`, `critique`, `analysis` or `custom`, is skipped),
averages the quality metrics, and counts the cognitive load. `identifyBottlenecks` has one rule
(more than half of the thoughts have `very_high` load). `suggestImprovements` has three rules, on
the average rigor, creativity and efficiency. `taxonomy/advisory.ts`
constructs one `SuggestionEngine` and calls `suggestForProblem()`. No code under `src/` calls
`analyzeSession()`.

### MultiModalAnalyzer (`multi-modal-analyzer.ts`)

**Purpose**: Analyzes a session that used more than one `ThinkingMode` — transition quality between
modes, detected mode combinations, and pattern-based recommendations for future multi-mode flows.

```typescript
export interface ModeTransition {
  from: ThinkingMode; to: ThinkingMode; thoughtNumber: number; reason?: string; effectiveness: number;
}
export interface ModeCombination {
  modes: ThinkingMode[]; frequency: number; effectiveness: number;
  typicalSequence: ThinkingMode[]; synergy: number; examples: string[];     // examples are thought IDs
}
export interface ReasoningFlow {
  session: ThinkingSession; transitions: ModeTransition[]; combinations: ModeCombination[];
  dominantMode: ThinkingMode; modeDistribution: Map<ThinkingMode, number>;
  categoryDistribution: Map<ReasoningCategory, number>;
  flowComplexity: number; coherence: number; adaptability: number;          // each 0-1
}
export interface MultiModalPattern {
  id: string; name: string; description: string; modeSequence: string[]; useCases: string[];
  effectiveness: number; examples: string[]; prerequisites: string[]; alternatives: string[];
}
export interface ModeSynergy {
  mode1: string; mode2: string; synergyScore: number; complementarity: string[];
  conflicts: string[]; optimalTransition: string; examples: string[];
}
export interface MultiModalRecommendation {
  pattern: MultiModalPattern; relevanceScore: number; rationale: string[];
  adaptations: string[]; estimatedBenefit: number;
}

export class MultiModalAnalyzer {
  analyzeFlow(session: ThinkingSession): ReasoningFlow
  recommendPatterns(problemDescription: string, currentModes: ThinkingMode[]): MultiModalRecommendation[]
  findSynergy(mode1: string, mode2: string): ModeSynergy | null
  generateFlowReport(flow: ReasoningFlow): string
}
```

`analyzeFlow` scores each mode-to-mode transition (`estimateTransitionEffectiveness`), counts mode
combinations (`detectCombinations` slides a window of 3 consecutive thoughts over the session,
keys each window by its mode sequence and sorts by frequency; `calculateCombinationSynergy` scores
a window as the mean `synergyScore` of its known consecutive mode pairs, or 0.5 when it knows
none), and rolls those up into flow-level `calculateFlowComplexity`, `calculateCoherence`, and
`calculateAdaptability` scores. `calculateAdaptability` divides the number of unique modes by the
constant 14, although `ThinkingMode` has 35 members, so the value can exceed 1. `taxonomy/flow-advisory.ts` calls `analyzeFlow()` and
`generateFlowReport()` for the `summarize` action. No code under `src/` calls `recommendPatterns()`
or `findSynergy()`.

---

## Cache

`src/cache/` implements one cache strategy: LRU (`lru.ts`). The `CacheStrategy` type in `types.ts`
also names `"lfu"` and `"fifo"`, and the doc comment of `CacheEntry.accessCount` says "(for LFU)",
but no class implements either strategy and no factory selects between strategies. The module
barrel `cache/index.ts` exports `LRUCache` and the types. Nothing under `src/` imports the barrel:
`SessionManager` imports `lru.ts` and `types.ts` directly and holds its `activeSessions` in an
`LRUCache`. `ValidationCache` keeps its own internal `Map` with its own LRU logic and does not use
this class (see Validation, above).

```typescript
export type CacheStrategy = "lru" | "lfu" | "fifo";   // only "lru" has an implementing class

export interface CacheConfig {
  maxSize: number;
  strategy: CacheStrategy;
  ttl?: number;                                    // 0 = no expiration
  enableStats?: boolean;
  onEvict?: (key: string, value: any) => void;
}

export interface CacheEntry<T> {
  key: string; value: T; createdAt: Date; lastAccessedAt: Date;
  accessCount: number; expiresAt?: Date; size?: number;
}

export interface CacheStats {
  size: number; maxSize: number; hits: number; misses: number; hitRate: number;
  evictions: number; sets: number; deletes: number; memoryUsage: number; avgAccessTime: number;
}

export interface Cache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T, ttl?: number): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  size(): number;
  getStats(): CacheStats;
  keys(): string[];
  values(): T[];
  entries(): Array<[string, T]>;
}
```

### LRUCache\<T\> (`lru.ts`)

```typescript
export class LRUCache<T> implements Cache<T> {
  constructor(config?: Partial<CacheConfig>)

  get(key: string): T | undefined
  set(key: string, value: T, ttl?: number): void
  has(key: string): boolean
  delete(key: string): boolean
  clear(): void
  size(): number
  getStats(): CacheStats
  keys(): string[]
  values(): T[]
  entries(): Array<[string, T]>
  cleanExpired(): number
}
```

`set()` evicts the least-recently-used entry (private `evictLRU`) once `config.maxSize` is reached.
`cleanExpired()` is a separate maintenance sweep for TTL-expired entries — `get()`/`has()` check
expiry lazily on access, so the sweep only reclaims memory from entries that nothing reads after
they expire. No code in `src/` calls `cleanExpired()`. `SessionManager` constructs one with an
`onEvict` callback (see Session, above). The callback saves the evicted session when storage exists
and `session.config.enableAutoSave` is true. Otherwise it logs a warning that the thoughts are
discarded. `LRUCache` calls the callback without awaiting it. The cache itself has no storage
awareness; eviction behavior beyond LRU ordering is entirely the caller's callback.

---

## Utils

`src/utils/` holds 18 classes (in `errors.ts` the base class `DeepThinkingError`, 15 subclasses and
`ErrorFactory`, plus `Logger` in `logger.ts`) and four modules without classes: `sanitization.ts`,
`type-guards.ts`, `logger-types.ts`, and `file-lock.ts` (documented under Session, above, since its
only consumer is `FileSessionStore`).

### Errors (`errors.ts`)

**Purpose**: A structured error hierarchy — every error carries a machine-readable `code`, optional
sanitized `context`, and a `timestamp`, and serializes cleanly for logging.

```typescript
export class DeepThinkingError extends Error {
  readonly code: string;
  readonly context?: Record<string, unknown>;
  readonly timestamp: Date;
  constructor(message: string, code: string, context?: Record<string, unknown>)
  toJSON(): Record<string, unknown>
}

export class SessionError extends DeepThinkingError {
  constructor(message: string, context?: Record<string, unknown>)                    // code: SESSION_ERROR
}
export class SessionNotFoundError extends DeepThinkingError {
  constructor(sessionId: string)                                                     // code: SESSION_NOT_FOUND
}
export class SessionAlreadyExistsError extends DeepThinkingError {
  constructor(sessionId: string)                                                     // code: SESSION_ALREADY_EXISTS
}
export class ValidationError extends DeepThinkingError {
  constructor(message: string, context?: Record<string, unknown>)                    // code: VALIDATION_ERROR
}
export class InputValidationError extends DeepThinkingError {
  constructor(fieldName: string, reason: string, value?: unknown)                    // code: INPUT_VALIDATION_ERROR
}
export class ConfigurationError extends DeepThinkingError {
  constructor(message: string, context?: Record<string, unknown>)                    // code: CONFIGURATION_ERROR
}
export class InvalidModeError extends DeepThinkingError {
  constructor(mode: string, validModes: string[])                                    // code: INVALID_MODE
}
export class ThoughtProcessingError extends DeepThinkingError {
  constructor(message: string, context?: Record<string, unknown>)                    // code: THOUGHT_PROCESSING_ERROR
}
export class ExportError extends DeepThinkingError {
  constructor(message: string, format: string, context?: Record<string, unknown>)    // code: EXPORT_ERROR
}
export class ResourceLimitError extends DeepThinkingError {
  constructor(resource: string, limit: number, actual: number)                       // code: RESOURCE_LIMIT_EXCEEDED
}
export class RateLimitError extends DeepThinkingError {
  constructor(operation: string, limit?: number, windowMs?: number)                  // code: RATE_LIMIT_EXCEEDED
}
export class SecurityError extends DeepThinkingError {
  constructor(message: string, context?: Record<string, unknown>)                    // code: SECURITY_ERROR
}
export class PathTraversalError extends DeepThinkingError {
  constructor(attemptedPath: string)                                                 // code: PATH_TRAVERSAL_DETECTED
}
export class StorageError extends DeepThinkingError {
  constructor(message: string, context?: Record<string, unknown>)                    // code: STORAGE_ERROR
}
export class BackupError extends DeepThinkingError {
  constructor(message: string, backupId?: string, context?: Record<string, unknown>) // code: BACKUP_ERROR
}

export class ErrorFactory {
  static sessionNotFound(sessionId: string): SessionNotFoundError
  static invalidInput(fieldName: string, reason: string, value?: unknown): InputValidationError
  static invalidMode(mode: string, validModes: string[]): InvalidModeError
  static resourceLimit(resource: string, limit: number, actual: number): ResourceLimitError
  static exportFailed(format: string, reason: string): ExportError
}
```

`InputValidationError`'s constructor replaces a `value` whose `typeof` is `"object"` (arrays and
`null` too) with the string `"[object]"` in its `context`, and stores any other value unchanged.
The context also holds `fieldName` and `reason`. `ErrorFactory` builds 5 of the 15 subclasses with
static convenience constructors; code creates the other 10 with `new`.

### Logger (`logger.ts`, `logger-types.ts`)

**Purpose**: The default `ILogger` implementation — in-memory log buffer plus optional console
output, level-filtered.

```typescript
export enum LogLevel { DEBUG = 0, INFO = 1, WARN = 2, ERROR = 3, SILENT = 4 }
export interface LogEntry { level: LogLevel; message: string; timestamp: Date; context?: Record<string, unknown>; error?: Error }
export interface LoggerConfig { minLevel: LogLevel; enableConsole: boolean; enableTimestamps: boolean; prettyPrint: boolean }

export class Logger implements ILogger {
  constructor(config?: Partial<LoggerConfig>)   // default: { minLevel: INFO, enableConsole: true, enableTimestamps: true, prettyPrint: true }

  debug(message: string, context?: Record<string, unknown>): void
  info(message: string, context?: Record<string, unknown>): void
  warn(message: string, context?: Record<string, unknown>): void
  error(message: string, error?: Error, context?: Record<string, unknown>): void

  getLogs(minLevel?: LogLevel): LogEntry[]
  clearLogs(): void
  setLevel(level: LogLevel): void
  exportLogs(): string
}

export const logger: Logger;                                    // module-level default instance
export function createLogger(config?: Partial<LoggerConfig>): Logger
```

`Logger` buffers every entry at or above `minLevel` in `this.logs`, whether or not
`enableConsole` is true. The buffer has no size limit, and `clearLogs()` empties it. `getLogs()`
reads that buffer (optionally filtered to a minimum level), which is how tests assert on logged
output without capturing stdout. `logger-types.ts` holds `LogLevel`, `LogEntry` and `LoggerConfig`
so that other modules can import them without importing `Logger`; `logger.ts` re-exports all
three.

### Sanitization (`sanitization.ts`)

Input-hardening helpers used by `SessionManager`, `FileSessionStore`, `ExportService`, the LaTeX
and TikZ exporters, the legacy tool schema (`src/tools/thinking.ts`) and the tool schemas in
`src/tools/schemas/`. Nothing under `src/validation/` uses them.

```typescript
export const MAX_LENGTHS: {   // nine keys
  THOUGHT_CONTENT: 100000; TITLE: 500; DOMAIN: 200; AUTHOR: 300; SESSION_ID: 100;
  DESCRIPTION: 10000; STRING_FIELD: 1000; ARRAY_ITEMS: 1000; NESTED_ARRAY_ITEMS: 500;
};

// Every parameter after the first has a default: maxLength = MAX_LENGTHS.STRING_FIELD, fieldName = "input".
export function sanitizeString(input: string, maxLength?: number, fieldName?: string): string
export function sanitizeOptionalString(input: string | undefined, maxLength?: number, fieldName?: string): string | undefined
export function validateSessionId(sessionId: string): string             // throws on non-UUID-v4 / path-traversal-shaped input
export function sanitizeNumber(input: number, min?: number, max?: number, fieldName?: string): number   // min = -Infinity, max = Infinity
export function sanitizeStringArray(input: string[], maxLength?: number, maxItems?: number, fieldName?: string): string[]   // maxItems = 1000
export function sanitizeThoughtContent(content: string): string
export function sanitizeTitle(title: string | undefined): string
export function sanitizeDomain(domain: string | undefined): string | undefined
export function sanitizeAuthor(author: string | undefined): string | undefined
export function escapeHtml(text: string): string
export function escapeLatex(text: string): string
```

These functions throw a plain `Error`, not an `InputValidationError`, on invalid input (an empty
string, a string over the limit, a null byte). `sanitizeTitle` returns `"Untitled Session"` for an
empty title. `validateSessionId` is the path-traversal guard `SessionManager` and
`FileSessionStore` both call before touching disk with a caller-supplied session ID. This `escapeLatex` is the single
implementation. `ExportService`, `TikZBuilder` and `LaTeXExporter` all use it. The private
`escapeLatex()` method of `LaTeXExporter` in `src/export/visual/utils/latex.ts` only delegates to
it (see Export, above).

### Type guards (`type-guards.ts`)

Function-only — runtime type narrowing without `as any`.

```typescript
export function isExtendedThoughtType(value: unknown): value is ExtendedThoughtType
export function toExtendedThoughtType(value: unknown, fallback?: ExtendedThoughtType): ExtendedThoughtType   // throws if invalid and no fallback given
export function isNumber(value: unknown): value is number                // also rejects NaN and non-finite values
export function isNonEmptyString(value: unknown): value is string
export function isArray<T>(value: unknown, itemGuard?: (item: unknown) => item is T): value is T[]
export function isPlainObject(value: unknown): value is Record<string, unknown>
export function safeCast<T>(value: unknown, guard: (value: unknown) => value is T, errorMessage: string): T
```

`isExtendedThoughtType` checks against a fixed 33-entry `VALID_THOUGHT_TYPES` array (general
thought-type strings like `"model"`, `"proof"`, plus the five Phase-8 proof-decomposition types) —
this is a separate, smaller vocabulary from the 69-entry taxonomy in `src/taxonomy/`, scoped to the
`ExtendedThoughtType` field on thoughts, not to reasoning-type classification.

---

## Types

`src/types/` splits into `core.ts` (the enum, the union, the fundamental-triad types, and every
type guard) and `types/modes/` (32 files, one per mode with a dedicated `Thought` subtype, plus one
shared support file). `index.ts` is a barrel that 68 files under `src/` import; 50 files import
`core.ts` directly, among them every file in `src/modes/handlers/`. `handlers.ts` and
`session.ts` hold MCP-response and session-lifecycle types respectively, outside the `Thought`
hierarchy.

### `ThinkingMode` enum and `Thought` union (`core.ts`)

```typescript
export enum ThinkingMode {
  SEQUENTIAL = "sequential", SHANNON = "shannon", MATHEMATICS = "mathematics",
  PHYSICS = "physics", HYBRID = "hybrid",
  ENGINEERING = "engineering", COMPUTABILITY = "computability",
  CRYPTANALYTIC = "cryptanalytic", ALGORITHMIC = "algorithmic",
  METAREASONING = "metareasoning", RECURSIVE = "recursive", MODAL = "modal",
  STOCHASTIC = "stochastic", CONSTRAINT = "constraint", OPTIMIZATION = "optimization",
  INDUCTIVE = "inductive", DEDUCTIVE = "deductive", ABDUCTIVE = "abductive",
  CAUSAL = "causal", BAYESIAN = "bayesian", COUNTERFACTUAL = "counterfactual",
  TEMPORAL = "temporal", HISTORICAL = "historical", GAMETHEORY = "gametheory",
  EVIDENTIAL = "evidential",
  ANALOGICAL = "analogical", FIRSTPRINCIPLES = "firstprinciples",
  SYSTEMSTHINKING = "systemsthinking", SCIENTIFICMETHOD = "scientificmethod",
  FORMALLOGIC = "formallogic",
  SYNTHESIS = "synthesis", ARGUMENTATION = "argumentation", CRITIQUE = "critique",
  ANALYSIS = "analysis",
  CUSTOM = "custom",
}
// 35 values: 34 reasoning modes + CUSTOM.

export const FULLY_IMPLEMENTED_MODES: ReadonlyArray<ThinkingMode>;  // all 34 real modes (excludes CUSTOM)
export function isFullyImplemented(mode: ThinkingMode): boolean;

/** @deprecated Always empty. All modes are fully implemented. */
export const EXPERIMENTAL_MODES: ReadonlyArray<ThinkingMode>;       // []

export enum ShannonStage {
  PROBLEM_DEFINITION = "problem_definition", CONSTRAINTS = "constraints",
  MODEL = "model", PROOF = "proof", IMPLEMENTATION = "implementation",
}

export type ExtendedThoughtType = /* the same 33-string vocabulary as utils/type-guards.ts,
  plus 6 Phase-10 Hybrid-mode-only values: "mode_selection" | "parallel_analysis" |
  "sequential_analysis" | "convergence_check" | "confidence_assessment" | "mode_switching" */;

export interface BaseThought {
  id: string; sessionId: string; thoughtNumber: number; totalThoughts: number;
  content: string; timestamp: Date; mode: ThinkingMode; nextThoughtNeeded: boolean;
  isRevision?: boolean; revisesThought?: string; revisionReason?: string;
  branchFrom?: string; branchId?: string; uncertainty?: number;
  dependencies?: string[]; assumptions?: string[]; tags?: string[]; importance?: number;
  validation?: AdvisoryValidation;        // advisory, set by SessionManager.addThought()
  proofAnalysis?: AdvisoryProofAnalysis;  // advisory, set when the thought carries proof content
  inputWarnings?: string[];               // sentences for request values a handler replaced or ignored; validateCommon() reports each as a warning
}

// The fundamental triad is defined directly in core.ts, not in types/modes/ —
// every other mode's thought type lives in its own types/modes/<mode>.ts file.
export interface InductiveThought extends BaseThought {
  mode: ThinkingMode.INDUCTIVE;
  observations: string[]; pattern?: string; generalization: string;
  confidence: number; counterexamples?: string[]; sampleSize?: number;
}
export interface DeductiveThought extends BaseThought {
  mode: ThinkingMode.DEDUCTIVE;
  premises: string[]; conclusion: string; logicForm?: string;
  validityCheck: boolean; soundnessCheck?: boolean;
}
export interface AbductiveThought extends BaseThought {
  mode: ThinkingMode.ABDUCTIVE;
  observations: Observation[]; hypotheses: Hypothesis[]; currentHypothesis?: Hypothesis;
  evaluationCriteria: EvaluationCriteria; evidence: Evidence[]; bestExplanation?: Hypothesis;
}
// + Observation, Hypothesis, Evidence, EvaluationCriteria support interfaces

export type Thought =
  | SequentialThought | ShannonThought | MathematicsThought | PhysicsThought | HybridThought
  | EngineeringThought | ComputabilityThought | CryptanalyticThought | AlgorithmicThought
  | InductiveThought | DeductiveThought | AbductiveThought
  | CausalThought | BayesianThought | CounterfactualThought | TemporalThought
  | HistoricalThought | GameTheoryThought | EvidentialThought
  | AnalogicalThought | FirstPrinciplesThought
  | SystemsThinkingThought | ScientificMethodThought | OptimizationThought | FormalLogicThought
  | SynthesisThought | ArgumentationThought | CritiqueThought | AnalysisThought
  | MetaReasoningThought
  | RecursiveThought | ModalThought | StochasticThought | ConstraintThought
  | CustomThought;
// 35 members — one per ThinkingMode value, including CUSTOM.

export function isInductiveThought(thought: Thought): thought is InductiveThought
export function isDeductiveThought(thought: Thought): thought is DeductiveThought
export function isAbductiveThought(thought: Thought): thought is AbductiveThought
// ... 32 more, one per remaining Thought member — 35 isXThought guards total in core.ts
```

### The `core.ts` ↔ `types/modes/*.ts` relationship

`core.ts` **imports** every mode-specific `Thought` interface as a `type`-only import from its own
file under `types/modes/`, folds all of them into the `Thought` union, and **defines its own
`isXThought` guard for every member** — including the 32 modes whose type it only imported. Each of
those 32 `types/modes/<mode>.ts` files **also** defines its own `is<Mode>Thought` guard. The
`core.ts` copy takes a `Thought` and checks `thought.mode === ThinkingMode.<MODE>`. The
mode-file copy takes a `BaseThought` and checks the same enum member or, in many files, the
string literal of the mode. `isEngineeringThought` in `types/modes/engineering.ts` is stricter
than its `core.ts` copy: it takes `unknown` and also requires the `analysisType` and
`designChallenge` fields. This is a real, verified duplication, not a naming coincidence: 32
guard functions exist in two places each, and nothing enforces that the two copies stay
behaviorally equal if one is edited without the other — a genuine drift risk if a mode's
discriminant check ever needs to change. `types/modes/recommendations.ts` is
the one file in that directory that is not a per-mode thought-type file. It holds the interfaces
`ProblemCharacteristics`, `ModeRecommendation` and `CombinationRecommendation`, and the
`ModeRecommender` class (about 2,100 lines of recommendation logic). `types/index.ts` re-exports it
directly rather than through `core.ts`'s `Thought` union.

`repo-tools map` lists 64 names (`duplicateCount`) that two or more files under `src/` export, and
its classified lists hold 65: 32 runtime names, which are the `isXThought` guard pairs above, and
33 type names. The 65th name is `HybridThought`: `modes/handlers/HybridHandler.ts` declares an
interface of that name that extends the one in `types/modes/hybrid.ts`, and the tool leaves it out
of the 64. Four of the type declarations have an identical body in both files, when comments and whitespace are removed: `CustomThought`
(`modes/handlers/CustomHandler.ts` and `types/modes/custom.ts`), and `MathematicalModel`,
`PhysicalInterpretation` and `TensorProperties` (`types/modes/hybrid.ts` and the mathematics or
physics type file). The remaining type names are different declarations. Some name the same concept
twice with different fields (for example `ModeStatus`, `RecommendModeInput` and
`ProblemCharacteristics`). Some name unrelated concepts that share a word (for example `Constraint`
in `src/modes/stochastic/types.ts` and in `types/modes/optimization.ts`). The hand-curated
`types/index.ts` barrel disambiguates the names that it re-exports.

### Session and validation-result types (`session.ts`)

Referenced throughout Session and Validation above; collected here for completeness.

```typescript
export interface ThinkingSession {
  id: string; title: string; mode: ThinkingMode; domain?: string; config: SessionConfig;
  thoughts: Thought[]; createdAt: Date; updatedAt: Date; author?: string;
  currentThoughtNumber: number; isComplete: boolean; metrics: SessionMetrics;
  collaborators?: string[]; tags?: string[]; attachments?: Attachment[];
}
export interface SessionConfig {
  modeConfig: ModeConfig; enableAutoSave: boolean; enableValidation: boolean;
  enableVisualization: boolean; enableProofAnalysis?: boolean;
  maxThoughtsInMemory: number; compressionThreshold: number; /* ... integrations, exportFormats, ... */
}
export interface ModeConfig { mode: ThinkingMode; /* ... */ }
export interface SessionMetrics {
  totalThoughts: number; thoughtsByType: Record<string, number>; averageUncertainty: number;
  revisionCount: number; timeSpent: number; dependencyDepth: number; customMetrics: Map<string, unknown>;
  cacheStats?: { hits: number; misses: number; hitRate: number; size: number; maxSize: number };
  _uncertaintySum?: number; _uncertaintyCount?: number;     // internal running totals for an O(1) average
}
export interface SessionMetadata { id: string; title: string; createdAt: Date; updatedAt: Date; thoughtCount: number; mode: ThinkingMode; isComplete: boolean }
export type ExportFormat = "markdown" | "latex" | "json" | "html" | "jupyter" | "mermaid";
export interface Attachment { id: string; filename: string; mimeType: string; size: number; url?: string; data?: Buffer }

export interface ValidationResult {          // returned by ThoughtValidator, NOT the src/validation/validators/base.ts ModeValidator result shape
  isValid: boolean; confidence: number; issues: ValidationIssue[];
  strengthMetrics: { logicalSoundness: number; empiricalSupport: number; mathematicalRigor: number; physicalConsistency?: number };
  tensorValidation?: { rankCorrect: boolean; symmetriesVerified: boolean; invariantsChecked: boolean; dimensionsConsistent: boolean };
  suggestions?: string[];
}
export interface ValidationIssue {
  severity: "error" | "warning" | "info"; thoughtNumber: number;
  description: string; suggestion: string;
  category: "logical" | "mathematical" | "physical" | "structural" | "completeness" | "interpretation";
}
```

There are two distinct `ValidationResult` shapes in this codebase: this session-level one (what
`ThoughtValidator.validate()` returns — confidence-scored, with strength metrics) and the
per-handler one in `src/modes/handlers/ModeHandler.ts` (`{ valid, errors, warnings }` — what
`ModeHandler.validate()` and `ModeHandlerRegistry.validate()` return). They serve different layers
of the same word and are not interchangeable. The name `ValidationResult` from the barrel
`types/index.ts` is the handler shape, because the barrel's explicit `ModeHandler` re-export wins
over `export * from "./session.js"`. Import the session shape from `types/session.js`.

### Handler I/O types (`handlers.ts`) and the barrel (`index.ts`)

`handlers.ts` types the MCP response envelope and per-handler input shapes independent of the
`Thought` hierarchy:

```typescript
export interface MCPTextContent { type: "text"; text: string }
export interface MCPResponse { content: MCPTextContent[]; [key: string]: unknown }
export interface AddThoughtInput { /* mode: string (not ThinkingMode) for Zod-schema compatibility, ... */ }
// + one refined input interface per MCP handler function
```

`types/index.ts` is a barrel. 68 files under `src/` import it, and 50 files, among them every file
in `src/modes/handlers/`, import `core.ts` directly. It re-exports `core.ts` and `session.ts`
wholesale (`export *`), then the `ModeHandler` interface family by name (this explicit export is
what makes `ValidationResult` the handler shape; `ModeStatus` from `handlers.ts` is exported as
`HandlerModeStatus` because the `ModeHandler` family already exports a `ModeStatus`),
`types/modes/recommendations.ts` wholesale, and named lists of sub-interfaces and guards from 13
mode files (engineering, computability, gametheory, cryptanalytic, synthesis, argumentation,
critique, analysis, recursive, modal, stochastic, constraint, custom) that are not part of
`core.ts`'s `Thought` union surface. It also re-exports the handler I/O types of `handlers.ts`
(`MCPTextContent`, `MCPResponse`, `AddThoughtInput`, `isAddThoughtInput` and others).

---

## Verification

Generated 2026-10-23 by `repo-tools map`.
Regenerate the generated reports: `npm run docs:deps` · Check: `repo-tools check . --docs=docs/architecture`

The claims below come from `repo-tools map .`, which reads the whole repository. The generated reports in this
directory come from `tools/create-dependency-graph`, which counts files and exports with its own rules. Their
counts differ for that reason.

| Claim | Value | Source |
|---|---|---|
| totalTypeScriptFiles | 533 | repo-tools map (whole repository) |
| totalLinesOfCode | 235333 | repo-tools map (whole repository) |
| totalExports | 2184 | repo-tools map (whole repository) |
| totalModules | 5 | repo-tools map (whole repository) |
| reachableFiles | 241 | repo-tools map (whole repository) |
| orphanedFiles | 12 | repo-tools map (whole repository) |
| noImporterFileCount | 12 | repo-tools map (whole repository) |

Class counts, handler counts and validator counts in this document come from listing the files
in `src/`. They are not graph metrics, so they do not appear in the table above.
