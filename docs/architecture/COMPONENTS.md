# DeepThinking MCP — Component Reference

This is a signature-level reference. For per-file dependency detail (who imports whom, which
exports are used where), see `DEPENDENCY_GRAPH.md` — this document does not repeat its per-file
listings. For request-flow sequencing, see `DATA_FLOW.md`. For the full 13-tool MCP surface, see
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
functions. None contains mode-specific logic itself — all delegate.

`RecommendationService` exists for a structural reason worth knowing: `src/index.ts` calls `main()`
at module scope, so a test cannot import it. Response-building logic that lives there is only
reachable by re-implementation in tests, which is how several subsystems went dead. Moving
`recommend_mode`'s response construction here made it testable. Extending that treatment to the
remaining handlers is tracked work.

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

`createThought` always routes through `ModeHandlerRegistry.createThought()` — the constructor
auto-registers all 34 mode handlers via `registerAllHandlers()` unless
`autoRegisterHandlers: false` is passed. The legacy per-mode switch statement this factory used to
contain was removed; every mode now has a dedicated handler, so `createThought` throws only if
registry initialization itself failed (a condition the code treats as "should never happen").

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
the comprehensive one. The taxonomy section is **appended** — set `includeReasoningTypes: false`
and the response is byte-identical to what it was before the taxonomy was wired, which is asserted
by test. A throwing advisory engine degrades to a one-line note; the recommendation still returns.

---

### ExportService (`src/services/ExportService.ts`)

**Purpose**: Orchestrates multi-format session export — routes to document exporters (JSON,
Markdown, LaTeX, HTML, Jupyter) or to `VisualExporter` for diagram formats.

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
visual formats (`mermaid` through `visual-markdown`) delegate to a private `exportVisual()` which
constructs a `VisualExporter` and picks the mode-specific visual exporter from
`src/export/visual/modes/`; `json`, `markdown`, `latex`, and `jupyter` are handled by private
`exportTo*` methods inside this file (`html` is a visual format here, not a private method — it is
generated via `HTMLDocBuilder` in `src/export/visual/utils/html.ts`). `visual-json` and
`visual-markdown` are aliases that map onto the `json`/`markdown` members of `VisualFormat`, kept
distinct from the plain `json`/`markdown` document formats so callers can request either the flat
document or the graph-structured visual rendering of the same format name. The class carries the
codebase's one confirmed type suppression: a `@ts-expect-error` at `ExportService.ts:1043` marking
a method kept for future use.

---

## Session

`src/session/` owns session lifecycle, meta-monitoring (strategy tracking across a session), and
the persistence abstraction. Storage has two implementations reachable through one interface;
cross-process file locking lives in `src/utils/file-lock.ts`, not in a `src/session/locks/`
subdirectory.

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
  auto-saves the evicted session to `storage` when `enableAutoSave` is set; with no storage
  configured, the session's thoughts are discarded and a warning is logged rather than dropped
  silently.
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
- **`evaluateStrategy` / `calculateQualityMetrics`** are heuristic scorers over
  `currentStrategies` / `sessionHistory` maps keyed by `sessionId` — weighted combinations of
  progress-indicator counts, issue counts, and mode diversity, not derived from the mode handlers
  themselves. Both return neutral (`0.5`-centered) results when no history exists for the session.
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

`updateMetrics` dispatches internally to a private `updateModeSpecificMetrics()` (tracks
mode-dependent signals such as branch counts and revision counts) and a private
`updateCacheStats()`. Both private helpers are implementation detail; `updateMetrics` is the
only entry point callers need.

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
uses whenever `SESSION_DIR` is set — see `DATA_FLOW.md` for the multi-instance sharing sequence
and the cross-process locking it relies on.

### File locking — `src/utils/file-lock.ts`

Not a class: a small set of exported async functions layered on advisory lock files (`.lock`
sidecars), used by `FileSessionStore` so multiple `deepthinking-mcp` instances can share one
`SESSION_DIR` safely.

```typescript
export interface LockOptions { /* timeout, staleThreshold, type: "exclusive" | "shared", ... */ }

export async function acquireLock(filePath: string, options?: LockOptions): Promise<() => Promise<void>>
export async function withLock<T>(filePath: string, fn: () => Promise<T>, options?: LockOptions): Promise<T>
export async function withSharedLock<T>(filePath: string, fn: () => Promise<T>, options?: LockOptions): Promise<T>
export async function isLocked(filePath: string): Promise<boolean>
export async function forceUnlock(filePath: string): Promise<void>
```

`withLock` takes an exclusive lock for the duration of `fn`, releasing it (including on throw) via
the returned release function from `acquireLock`. `withSharedLock` allows concurrent readers.
Stale locks (older than a configurable threshold) are detected and cleared automatically rather
than blocking forever on a crashed holder.

---

## Mode Handlers

`src/modes/handlers/` implements the Strategy pattern that replaced a monolithic switch statement
in the original `ThoughtFactory`. The directory holds 37 files: one interface file
(`ModeHandler.ts`), 35 handlers each bound to exactly one `ThinkingMode` value via
`registerAllHandlers()` in `src/modes/index.ts`, and `GenericModeHandler.ts`, a 36th handler class
that is never registered — it is constructed on demand by the registry as the fallback for any
mode with no registered handler, and today that path is unreachable in practice because all 35
non-generic modes are registered at startup. `ThinkingMode.CUSTOM` (handled by `CustomHandler`) is
one of the 35 registered modes, not a separate case.

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
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
export interface ValidationError { field: string; message: string; code: string }
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
export function validationFailure(errors: ValidationError[], warnings?: ValidationWarning[]): ValidationResult
export function createValidationError(field: string, message: string, code: string): ValidationError
export function createValidationWarning(field: string, message: string, suggestion?: string): ValidationWarning
```

`getEnhancements` and `supportsThoughtType` are optional on the interface but every shipped handler
implements both; only `GenericModeHandler` and a small number of simple handlers omit
`supportsThoughtType` where a mode has no thought-type variants worth checking.

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

### All handlers

Every row below is a `class X implements ModeHandler` in `src/modes/handlers/`, registered in
`registerAllHandlers()` unless noted. The description column is each handler's own `description`
field, not a paraphrase.

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
| BayesianHandler | `BayesianHandler.ts` | `bayesian` | Probabilistic reasoning with Bayes theorem and evidence updates — computes the posterior itself |
| CounterfactualHandler | `CounterfactualHandler.ts` | `counterfactual` | What-if analysis with world state tracking and divergence point identification |
| TemporalHandler | `TemporalHandler.ts` | `temporal` | Timeline analysis with Allen's interval algebra and event sequencing |
| HistoricalHandler | `HistoricalHandler.ts` | `historical` | Historical analysis with source evaluation, pattern recognition, and causal chain analysis |
| GameTheoryHandler | `GameTheoryHandler.ts` | `gametheory` | Strategic interaction analysis with Nash equilibria and payoff matrices |
| EvidentialHandler | `EvidentialHandler.ts` | `evidential` | Dempster-Shafer belief functions with uncertainty quantification |
| AnalogicalHandler | `AnalogicalHandler.ts` | `analogical` | Cross-domain reasoning through structural mapping and analogy transfer |
| FirstPrinciplesHandler | `FirstPrinciplesHandler.ts` | `firstprinciples` | Bottom-up reasoning from fundamental truths with derivation chains |
| SystemsThinkingHandler | `SystemsThinkingHandler.ts` | `systemsthinking` | Systems analysis with archetype detection, feedback loops, and leverage point identification |
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
| MetaReasoningHandler | `MetaReasoningHandler.ts` | `metareasoning` | Reasoning about reasoning itself — strategy monitoring and optimization |
| RecursiveHandler | `RecursiveHandler.ts` | `recursive` | Problem decomposition, base case identification, and recursive solution construction |
| ModalHandler | `ModalHandler.ts` | `modal` | Reasoning about necessity, possibility, and possible worlds semantics |
| StochasticHandler | `StochasticHandler.ts` | `stochastic` | Markov chains, random processes, probabilistic state transitions, and Monte Carlo methods |
| ConstraintHandler | `ConstraintHandler.ts` | `constraint` | Constraint satisfaction, domain reduction, propagation, and feasibility analysis |
| OptimizationHandler | `OptimizationHandler.ts` | `optimization` | Constraint optimization, objective functions, and solution search |
| CustomHandler | `CustomHandler.ts` | `custom` | User-defined reasoning patterns with flexible structure and custom validation |
| GenericModeHandler | `GenericModeHandler.ts` | any (fallback) | Replicates the pre-Strategy-pattern switch statement; constructed on demand, never registered |

Both `ConstraintHandler` and `OptimizationHandler` are registered, dedicated handlers, not
generic-handler-plus-validator coverage.

### The eight handlers with real specialized logic

Every handler above implements `createThought` and `validate`; most `getEnhancements` too. The
eight below carry algorithms beyond input shaping — the actual computation the mode is named for.

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
  private isNashEquilibrium(entry: PayoffEntry, matrix: PayoffMatrix, players: Player[], strategies: Strategy[]): boolean
  private isStrictEquilibrium(entry: PayoffEntry, matrix: PayoffMatrix, players: Player[], strategies: Strategy[]): boolean
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
least one) — if one does, the equilibrium is efficient but not Pareto optimal.

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
against every archetype's signature (exact count match: +0.4 confidence; off-by-one: +0.2; delay
match: +0.2), keeps matches scoring ≥0.4, and returns the top three by confidence.

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

  private normalizeTimeComplexity(tc: any): TimeComplexity
  private normalizeSpaceComplexity(sc: any): SpaceComplexity
  private normalizeCorrectnessProof(proof: any): CorrectnessProof
  private normalizeDPFormulation(dp: any): DPFormulation
  private normalizeGreedyProof(proof: any): GreedyProof
  private validateDPFormulation(dp: any): any[]
  private validateCorrectnessProof(proof: any): any[]
}
```

Not one algorithm but three formal-formulation shapes lifted from *Introduction to Algorithms*
(Cormen/Leiserson/Rivest/Stein): a `CorrectnessProof` (precondition/postcondition/invariant plus a
termination argument with a decreasing quantity and lower bound), a `DPFormulation` (optimal
substructure characterization, recursive definition, computation order, reconstruction method,
complexity), and a `GreedyProof` (greedy-choice property plus optimal-substructure proof, with an
optional exchange argument or matroid justification). The `normalize*` methods fill structurally
required sub-fields with safe defaults when a caller supplies a partial object; `validateDPFormulation`
and `validateCorrectnessProof` then check the fully-normalized structure and return field-level
issues.

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
the fallback when nothing else applies. This mirrors — but does not call — the strategy-evaluation
logic in `SessionManager.evaluateStrategy`; the two are independent implementations of a similar
heuristic, one scoped to a single thought's self-report, the other to the whole session's history.

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

`createModeSpecificThought` is a large `switch (mode)` that replicates, mode by mode, the same
field-shaping logic each specialized handler's `createThought` does — this is the pre-Strategy-
pattern implementation kept alive as the registry's fallback path. It is designed to be
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
  private resolveMode(mode: string): ThinkingMode          // string -> ThinkingMode, defaults to SEQUENTIAL
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

`src/validation/` holds 37 classes across 39 files: the top-level engine (`validator.ts`,
`cache.ts`), the lazy-loading registry and static barrel that both feed it validators
(`validators/registry.ts`, `validators/index.ts`), a shared interface (`validators/base.ts`), shared
constants (`constants.ts`), 35 per-mode validator classes under `validators/modes/`, and two Zod
schema files (`schemas.ts`, `schema-utils.ts`) plus a top-level barrel (`index.ts`) that nothing in
`src/` imports.

> ### This engine runs advisorily on every thought
>
> `SessionManager.addThought()` calls `validateAdvisory()` (`src/validation/advisory.ts`) after
> sanitising a thought, and attaches the result to `Thought.validation` and to the tool response.
> **It is feedback only** — `isValid === false` never rejects a thought, and a validator that
> throws degrades to `{available: false, reason}` without failing the request. Issues are capped
> at 20 (ordered errors → warnings → info) with `totalIssues` and `issuesTruncated` alongside;
> suggestions are deduplicated and capped at 10. Gated per session by
> `SessionConfig.enableValidation`. Cost is 0.035–0.085 ms per call.
>
> Zod still validates at the tool boundary; that is the layer that can reject. This engine grades
> what Zod accepted.

### ThoughtValidator (`src/validation/validator.ts`)

**Purpose**: The validation entry point *of this subsystem* — looks up the mode-specific validator,
runs it, and turns its issues into a scored `ValidationResult`. Not called by the server today.

```typescript
export class ThoughtValidator {
  async validate(thought: Thought, context?: ValidationContext): Promise<ValidationResult>

  private async performValidation(thought: Thought, context?: ValidationContext): Promise<ValidationResult>
  private calculateConfidence(thought: Thought, issues: ValidationIssue[]): number
  private calculateStrengthMetrics(thought: Thought, issues: ValidationIssue[]): {
    logicalSoundness: number; empiricalSupport: number;
    mathematicalRigor: number; physicalConsistency: number;
  }
  private generateSuggestions(issues: ValidationIssue[]): string[]
}

export interface ValidationContext {
  existingThoughts?: Map<string, Thought>;
  strictMode?: boolean;
}
```

`validate()` checks `validationCache` first when `MCP_ENABLE_VALIDATION_CACHE` is on, then calls
`performValidation()`, which fetches the mode's validator via `getValidatorForMode(thought.mode)`
(async, lazy-loaded — see registry below) and folds its `ValidationIssue[]` into a result:
`confidence` starts at 1.0 and loses 0.3 per error / 0.1 per warning / 0.05 per info, then is
further scaled by the thought's own `uncertainty` field when present.

### ValidationCache (`src/validation/cache.ts`)

**Purpose**: LRU cache of `ValidationResult`s keyed by a SHA-256 hash of the thought's serialized
content, so re-validating unchanged content is free.

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
`validateNonEmptyArray`) for composition instead of subclassing — an earlier abstract
`BaseValidator` class was removed in favor of this composition pattern; the name survives only as a
deprecated type alias for `ModeValidator`.

### Two loading paths — the one thing to know about this directory

Mode validators reach `ThoughtValidator` through two different mechanisms, and both are live.

**Lazy path — `validators/registry.ts`.** A private `ValidatorRegistry` class (only its singleton
instance is exported) holds `VALIDATOR_REGISTRY`, a `Record<string, { module, className }>` table
naming 30 of the 35 mode-validator files by dynamic-import path:

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
import(config.module)` and instantiates `mod[config.className]`, caching the instance for
subsequent calls. Ten of the thirty entries (`algorithmic`, `analysis`, `argumentation`, `critique`,
`engineering`, `firstprinciples`, `formallogic`, `scientificmethod`, `synthesis`, `systemsthinking`)
are reached exclusively through this `import()` call — no static `import` statement anywhere in
`src/` references those ten files, which is why a purely static reachability scan cannot see them as
used even though they are.

**Static path — `validators/index.ts`.** A hand-written barrel that statically imports and
re-exports 24 validator classes plus the constants and utility functions above. Its 24 named
exports overlap with 20 of the registry's 30 dynamic-import entries (the sequential/shannon/
mathematics/physics/hybrid/inductive/deductive/abductive/causal/bayesian/counterfactual/
analogical/temporal/historical/gametheory/evidential/computability/cryptanalytic/metareasoning
group), but also names five classes the registry table never mentions:

```typescript
export { MetaValidator } from "./modes/meta.js";
export { ModalValidator } from "./modes/modal.js";
export { ConstraintValidator } from "./modes/constraint.js";
export { OptimizationValidator } from "./modes/optimization.js";
export { StochasticValidator } from "./modes/stochastic.js";
export { RecursiveValidator } from "./modes/recursive.js";
```

**This is a real gap, not a style choice.** `VALIDATOR_REGISTRY` in `registry.ts` has no entry for
`constraint`, `modal`, `recursive`, or `stochastic` — all four are real `ThinkingMode` enum values
with live handlers, but a thought created in any of those four modes can never reach its validator
class through `getValidatorForMode()`; `performValidation()` falls through to the "unknown thinking
mode" warning branch instead, exactly as if no validator existed for the mode at all.
(`OptimizationValidator` is not affected — `optimization` *is* in `VALIDATOR_REGISTRY`, just under a
module path the static-export list also happens to duplicate.) `MetaValidator` is a further step
removed: `ThinkingMode` has no `META` value at all, only `METAREASONING` (backed separately by
`MetaReasoningValidator`, which *is* registered) — so `meta.ts` cannot be reached by any live
thought regardless of the registry table, static export, or import path used.

### Per-mode validators (`src/validation/validators/modes/`)

All 35 implement `ModeValidator<T>` the same way: a `getMode()` returning the mode's string key, and
a `validate(thought, context)` that opens with `validateCommon(thought)` (checks shared structural
fields) and layers mode-specific checks on top via the same `validation-utils.ts` helpers. Example
(`BayesianValidator`, `validators/modes/bayesian.ts`):

```typescript
export class BayesianValidator implements ModeValidator<BayesianThought> {
  getMode(): string   // "bayesian"
  validate(thought: BayesianThought, context: ValidationContext): ValidationIssue[]
}
```

The 35 files, one per mode, are not enumerated individually here — the loading-path table above
already lists every mode name, and each validator's file is `validators/modes/<mode>.ts` with class
name `<Mode>Validator` (e.g. `historical.ts` → `HistoricalValidator`). `constants.ts` supplies the
shared `IssueSeverity`, `IssueCategory`, `ValidationThresholds`, and `ValidationMessages` enums/
factories every validator draws its issue codes and messages from, plus the `ValidationContext`
interface (relocated here from `validator.ts` in a past refactor specifically to break a
`validator.ts` → `validators/index.ts` → `base.ts` → `validator.ts` circular import).

### Unused: `schemas.ts`, `schema-utils.ts`, `validation/index.ts`

`schemas.ts` defines Zod schemas for the MCP tool inputs (`SessionIdSchema`, `ThinkingModeSchema`,
`CreateSessionSchema`, `AddThoughtSchema`, and others). `schema-utils.ts` defines lower-level
reusable Zod primitives (`probabilitySchema` and similar) that `schemas.ts` could compose from.
`validation/index.ts` is a barrel that re-exports both plus the constants and `ThoughtValidator`.
None of the three has an importer anywhere in `src/` outside of each other — `index.ts` imports
`schemas.ts`, and nothing imports `index.ts`. The live input-validation path for MCP tool calls is
different: `src/index.ts` parses raw tool arguments with `ThinkingToolSchema` (Zod, defined in
`src/tools/thinking.ts`), and the per-tool JSON Schemas advertised to MCP clients come from
`src/tools/json-schemas.ts` plus the per-mode Zod schemas under `src/tools/schemas/modes/`. These
three `src/validation/` files are a superseded, disconnected alternative that predates that path.

---

## Export

`src/export/` splits into two families: flat document exporters (`ExportService`'s private
`exportTo*` methods, covered under Services above, plus `FileExporter` for writing them to disk)
and `src/export/visual/` for diagram formats. Visual export has three layers: 23 mode-specific
exporter functions (`visual/modes/`), 14 fluent builder classes plus 4 supporting classes that those
functions call into (`visual/utils/`), and `VisualExporter`, a thin per-mode dispatch facade. 18
classes total across the directory.

### FileExporter (`src/export/file-exporter.ts`)

**Purpose**: Writes `ExportService` output to disk — single session, batch of sessions, or a named
export profile — inside a sandboxed output directory.

```typescript
export function resolveSandboxedOutputDir(requestedDir: string | undefined, root: string): string

export interface FileExportConfig { /* outputDir, overwrite, filenameTemplate, ... */ }
export interface FileExportResult { /* filePath, bytesWritten, format, ... */ }
export interface BatchExportResult { /* results: FileExportResult[], succeeded, failed, ... */ }
export interface ExportProgress { /* current, total, sessionId, ... */ }
export type ExportProgressCallback = (progress: ExportProgress) => void;

export class FileExporter {
  constructor(exportService: ExportService, config?: Partial<FileExportConfig>)

  async exportToFile(session: ThinkingSession, format: string, filename?: string): Promise<FileExportResult>
  async exportToFiles(sessions: ThinkingSession[], format: string, onProgress?: ExportProgressCallback): Promise<BatchExportResult>
  async exportWithProfile(session: ThinkingSession, profileId: ExportProfileId): Promise<FileExportResult>
  async exportAll(session: ThinkingSession, formats: string[]): Promise<BatchExportResult>

  getConfig(): FileExportConfig
  updateConfig(updates: Partial<FileExportConfig>): void
}

export function createFileExporter(exportService: ExportService, config?: Partial<FileExportConfig>): FileExporter
```

`resolveSandboxedOutputDir` is the security-relevant piece: it resolves a caller-requested output
directory against a root and rejects (throws) any path that escapes the root, guarding
`MCP_EXPORT_PATH` against path traversal. Private helpers handle filename generation
(`generateFilename`, `sanitizeFilename`, `formatDate`) and directory creation (`ensureDir`).

### Export profiles (`src/export/profiles.ts`)

Not a class — a static catalog. `EXPORT_PROFILES: Record<ExportProfileId, ExportProfile>` bundles a
named set of formats and options (e.g. an "academic paper" profile bundling LaTeX + a diagram
format) that `FileExporter.exportWithProfile()` and `ExportService` consumers can request by ID
instead of listing formats individually.

```typescript
export const EXPORT_PROFILES: Record<ExportProfileId, ExportProfile>

export function getExportProfile(id: ExportProfileId): ExportProfile
export function getAllExportProfiles(): ExportProfile[]
export function getExportProfilesByTag(tag: string): ExportProfile[]
export function getExportProfilesByFormat(format: ExportFormatType): ExportProfile[]
export function isValidExportProfileId(id: string): id is ExportProfileId
export function listExportProfileIds(): ExportProfileId[]
export function getExportProfileMetadata(id: ExportProfileId): ExportProfileMetadata
export function combineExportProfiles(ids: ExportProfileId[]): ExportProfile
export function recommendExportProfile(keywords: string[]): ExportProfileId
```

### VisualExporter (`src/export/visual/visual-exporter.ts`)

**Purpose**: A per-mode dispatch facade — 22 methods, each a one-line delegation to the matching
function in `visual/modes/`. `ExportService.exportVisual()` picks which method to call by inspecting
`thought.mode` and a mode-specific field (e.g. `"causalGraph" in lastThought`), so `VisualExporter`
itself carries no branching logic.

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
requested `VisualFormat`, internally branching on `options.format` and calling into the matching
builder class from `visual/utils/`.

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
synthesis, algorithmic, cryptanalytic, modal, constraint, recursive, stochastic, custom) fall back
to `ExportService`'s session-level thought-sequence visualization rather than a mode-specific
diagram.

### The 14 fluent builder classes (`src/export/visual/utils/`)

All 14 share one shape: `set*`/`add*` methods return `this` for chaining, and a terminal `render()`
returns the finished string. This is the public-facing authoring API for anything that wants to
build a diagram directly, outside the mode-exporter dispatch path.

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
  static from(nodes: DotNode[], edges: DotEdge[], options?: DotOptions): string
}
```

#### MermaidGraphBuilder, MermaidGanttBuilder, MermaidStateDiagramBuilder (`mermaid.ts`) — Mermaid

```typescript
export class MermaidGraphBuilder {
  addNode(node: MermaidNode): this
  addNodes(nodes: MermaidNode[]): this
  addEdge(edge: MermaidEdge): this
  addEdges(edges: MermaidEdge[]): this
  addSubgraph(id: string, title: string, nodeIds: string[]): this
  addSubgraphDef(subgraph: MermaidSubgraph): this
  addSubgraphs(subgraphs: MermaidSubgraph[]): this
  setOptions(options: MermaidOptions): this
  setDirection(direction: MermaidDirection): this   // "TD" | "TB" | "LR" | "RL" | "BT"
  setTitle(title: string): this
  setColorScheme(scheme: "default" | "pastel" | "monochrome"): this
  clear(): this
  resetOptions(): this
  render(): string
  renderAsStateDiagram(states: unknown, transitions: unknown): string
  renderAsClassDiagram(classes: unknown, relationships: unknown): string
  static from(nodes: MermaidNode[], edges: MermaidEdge[], options?: MermaidOptions): string
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
  addNode(id: string, label?: string, attrs?: Record<string, unknown>): this
  addNodeDef(node: GraphMLNode): this
  addNodes(nodes: GraphMLNode[]): this
  addEdge(source: string, target: string, attrs?: Record<string, unknown>): this
  addEdgeDef(edge: GraphMLEdge): this
  addEdges(edges: GraphMLEdge[]): this
  defineNodeAttribute(attr: GraphMLAttribute): this
  defineEdgeAttribute(attr: GraphMLAttribute): this
  setOptions(options: GraphMLOptions): this
  setGraphId(id: string): this
  setGraphName(name: string): this
  setDirected(directed: boolean): this
  setIncludeMetadata(include: boolean): this
  setIncludeLabels(include: boolean): this
  clear(): this
  resetOptions(): this
  render(): string
  static from(nodes: GraphMLNode[], edges: GraphMLEdge[], options?: GraphMLOptions): string
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
  addBulletList(items: string[]): this
  addNumberedList(items: string[]): this
  addBox(content: string, options?: unknown): this
  addTree(root: AsciiTreeNode): this
  addTreeList(items: AsciiTreeNode[]): this
  addTable(columns: AsciiTableColumn[], rows: unknown[][]): this
  addFlowDiagram(steps: string[], direction?: "horizontal" | "vertical"): this
  addProgressBar(percent: number, width?: number): this
  addMetricsPanel(metrics: Record<string, unknown>): this
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
export class SVGGroupBuilder {
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

export class SVGBuilder {
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
  addNode(id: string, label: string, options?: TikZNodeOptions): this
  addNodes(nodes: Array<{ id: string; label: string; options?: TikZNodeOptions }>): this
  addEdge(source: string, target: string, options?: TikZEdgeOptions): this
  addEdges(edges: Array<{ source: string; target: string; options?: TikZEdgeOptions }>): this
  beginScope(options?: TikZScopeOptions): this
  endScope(): this
  addRaw(content: string): this
  addComment(comment: string): this
  addCoordinate(name: string, x: number, y: number): this
  addBackground(...args: unknown[]): this
  addMetrics(...args: unknown[]): this
  addLegend(...args: unknown[]): this
  clear(): this
  resetOptions(): this
  render(): string
  static withOptions(options: TikZOptions): TikZBuilder
  static standalone(): TikZBuilder
}
```

#### UMLBuilder (`uml.ts`) — UML (via Mermaid/PlantUML-style syntax)

```typescript
export class UMLBuilder {
  setOptions(options: UMLBuilderOptions): this
  setTitle(title: string): this
  setTheme(theme: UMLBuilderOptions["theme"]): this        // "default" | "sketchy" | "blueprint" | "plain"
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
  addTable(headers: string[], rows: string[][]): this
  addDiv(content: string, className?: string): this
  addSection(title: string, content: string, icon?: string): this
  addMetricCard(label: string, value: string | number, color?: string): this
  addProgressBar(percent: number, color?: string): this
  addBadge(text: string, color?: string): this
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
  enableFrontmatter(metadata: Record<string, unknown>): this
  enableTableOfContents(): this
  addHeading(level: HeadingLevel, text: string): this      // HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
  addParagraph(text: string): this
  addBulletList(items: string[]): this
  addNumberedList(items: string[]): this
  addTaskList(items: Array<{ text: string; completed: boolean }>): this
  addCodeBlock(code: string, language?: string): this
  addTable(headers: string[], rows: string[][], alignment?: TableAlignment[]): this
  addBlockquote(text: string): this
  addHorizontalRule(): this
  addLink(text: string, url: string, title?: string): this
  addImage(alt: string, url: string, title?: string): this
  addMermaidDiagram(diagram: string): this
  addCollapsible(summary: string, detailContent: string): this
  addKeyValueSection(items: Record<string, string | number | boolean>): this
  addRaw(markdown: string): this
  addSection(title: string, content: string, level?: HeadingLevel): this
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
  addLayout(layout: { type: string; [key: string]: unknown }): this
  addMetrics(metrics: Record<string, unknown>): this
  addLegend(entries: unknown[]): this
  removeSection(key: string): this
  reset(): this
  getData(): Record<string, unknown>
  render(): string

  private removeNulls(obj: Record<string, unknown>): Record<string, unknown>
  private sortKeysRecursive(obj: unknown): unknown
}
```

### LaTeX support classes (`visual/utils/latex.ts`, `latex-mermaid-integration.ts`)

Two more classes round out the 18, kept separate from `ExportService`'s own `exportToLatex` (a
private, simpler LaTeX path) because they produce a fuller document with embedded diagrams.

```typescript
export class LaTeXExporter {
  constructor(options?: LaTeXExportOptions)
  preamble(): string
  export(session: ThinkingSession): string
  // ~25 private formatX(thought) methods, one per mode family, plus escapeLatex, formatDate, formatDuration
}

export class LatexMermaidIntegrator {
  generateMermaidPreamble(options?: MermaidLatexOptions): string
  embedMermaidDiagram(mermaidCode: string, caption?: string): string
  generateThoughtDiagram(thought: Thought, options?: unknown): string
  generateSessionDiagrams(session: ThinkingSession): string
  generateMermaidAppendix(session: ThinkingSession): string
  generateIntegratedDocument(session: ThinkingSession, options?: unknown): string

  private convertMermaidToTikZ(mermaidCode: string): string
}
```

`LaTeXExporter.export()` is the full-document entry point; its private `formatXThought` methods
switch on mode the same way `ExportService`'s private markdown/HTML formatters do — a duplicated
shape, not shared code. `LaTeXExporter` previously carried its own `escapeLatex()`; it now imports
the canonical one from `src/utils/sanitization.ts`, as `TikZBuilder` and `ExportService` do. The
private copies were not equivalent — they chained `.replace()` calls and re-escaped their own
inserted braces, so a literal backslash rendered as `\{}`. `LatexMermaidIntegrator` converts
Mermaid diagram source to TikZ (`convertMermaidToTikZ`) so a LaTeX document can embed a native
vector diagram instead of a rasterized Mermaid render.

---

### Session graph renderer (`src/export/visual/session-graph.ts`)

**Purpose**: Renders a whole multi-thought session in any visual format, using the same builders
the single-thought path uses.

```typescript
export interface SessionGraphNode { /* one per thought */ }
export interface SessionGraphEdge { /* thought-to-thought links */ }
export interface SessionGraphModel { nodes: SessionGraphNode[]; edges: SessionGraphEdge[] }

export function renderSessionGraph(model: SessionGraphModel, format: VisualFormat): string
```

This closes a real defect. `exportSessionWithThoughtDetails` previously implemented only
`mermaid`, `dot` and `ascii`; the other eight visual formats fell through to a plain-text
`"Session: …"` dump, so `html` returned text rather than HTML and `visual-json` returned
non-JSON. The single-thought path had always rendered every format and **threw** on an unknown
one — it never degraded — so the session path was the outlier. Normalising the session to a
node/edge model and handing it to the existing builders fixed all eight at once, and the
plain-text fallback was removed from both paths.

---

## Proof

`src/proof/` (13 files, 10 classes) implements proof decomposition, gap analysis, assumption
tracking, inconsistency detection, circular-reasoning detection, and strategy recommendation for
the Mathematics mode. Its `index.ts` barrel is unused — no file under `src/` imports it, and every
consumer (the test suite is currently the only one; see Verification) imports the concrete modules
directly. All ten classes operate on the shared `ProofDecomposition` / `AtomicStatement` /
`DependencyGraph` / `ProofStep` types defined in `decomposer.ts` and `dependency-graph.ts`.

### ProofDecomposer (`decomposer.ts`)

**Purpose**: The entry point — turns raw proof text or a `ProofStep[]` into atomic statements, a
dependency graph, and a completeness score.

```typescript
export interface ProofStep { /* statement, justification, references, ... */ }

export class ProofDecomposer {
  decompose(proof: string | ProofStep[], theorem?: string): ProofDecomposition
  extractStatements(steps: ProofStep[]): AtomicStatement[]
  classifyStatement(statement: string, index: number, allStatements: string[]): AtomicStatement["type"]
  inferDependencies(atoms: AtomicStatement[]): DependencyGraph
  computeCompleteness(atoms: AtomicStatement[], gaps: ProofGap[]): number
  computeMetrics(decomposition: ProofDecomposition): { atomCount: number; gapCount: number; completeness: number; rigorLevel: string; [k: string]: unknown }
}
```

`decompose()` is the orchestrator: parse (`parseProofText` if given a raw string) → classify each
statement (premise / inference / conclusion / assumption / lemma, via regex `StatementPattern`s
initialized in the constructor) → build the dependency graph (`buildDependencyGraph`, pattern-based
reference detection, not NLP) → trace assumption chains back to axioms
(`traceAssumptionChains`) → detect gaps (`detectBasicGaps`, `findImplicitAssumptions`) → score
rigor (`assessRigorLevel`). Statement classification and dependency inference are both
regex-pattern-driven, not a formal parser — `hasSignificantOverlap` uses word-overlap heuristics to
decide whether two statements likely reference each other.

### GapAnalyzer (`gap-analyzer.ts`)

**Purpose**: Deeper gap analysis than `ProofDecomposer`'s basic pass — unjustified logical leaps,
missing intermediate steps, scope errors, undefined terms.

```typescript
export interface GapAnalyzerConfig { /* leapDistanceThreshold, complexityThreshold, ... */ }

export class GapAnalyzer {
  constructor(config?: Partial<GapAnalyzerConfig>)

  analyzeGaps(decomposition: ProofDecomposition): GapAnalysis
  isValidTransition(from: AtomicStatement, to: AtomicStatement): boolean
  findUnjustifiedLeaps(atoms: AtomicStatement[], graph: DependencyGraph): ProofGap[]
  findMissingSteps(atoms: AtomicStatement[]): ProofGap[]
  findScopeErrors(atoms: AtomicStatement[]): ProofGap[]
  findUndefinedTerms(atoms: AtomicStatement[]): ProofGap[]
  findImplicitAssumptions(atoms: AtomicStatement[]): ProofGap[]
  findUnjustifiedSteps(atoms: AtomicStatement[]): string[]
  generateSuggestions(gaps: ProofGap[]): string[]
  computeCompleteness(decomposition: ProofDecomposition, gaps: ProofGap[]): number
}
```

`isValidTransition` checks a known inference rule (`verifyInferenceRule`) or an implied semantic
connection (`checkImpliedConnection`) between two adjacent statements; `findUnjustifiedLeaps` flags
transitions whose `computeLeapDistance` (an estimated-complexity delta, via
`estimateStatementComplexity`) exceeds a threshold with no valid transition found.
`findUndefinedTerms` cross-checks against a hardcoded list of standard math vocabulary
(`isStandardMathTerm`) — anything outside it and not defined earlier in the proof is flagged.

### AssumptionTracker (`assumption-tracker.ts`)

**Purpose**: Traces which axioms/assumptions each statement ultimately depends on, and finds the
minimal assumption set a proof actually needs.

```typescript
export class AssumptionTracker {
  traceToAssumptions(statementId: string, graph: DependencyGraph): string[]
  analyzeAssumptions(decomposition: ProofDecomposition): AssumptionAnalysis
  findMinimalAssumptions(decomposition: ProofDecomposition): string[]
  findUnusedAssumptions(decomposition: ProofDecomposition): string[]
  checkAssumptionDischarge(decomposition: ProofDecomposition): { discharged: string[]; undischarged: string[] }
  getAssumptionImpact(assumptionId: string, graph: DependencyGraph): string[]
  getSuggestions(analysis: AssumptionAnalysis): string[]
  validateStructure(decomposition: ProofDecomposition): { valid: boolean; issues: string[] }
}
```

`findMinimalAssumptions` walks backward from the conclusion (`computeMinimalSet`, reachability via
`isReachable`) rather than just listing every declared assumption — an assumption the conclusion
never actually depends on is excluded, and separately reported by `findUnusedAssumptions`.
`getAssumptionImpact` is the inverse query: given one assumption, which statements would become
unsupported if it were removed (`dependsOn` reachability in the other direction).

### InconsistencyDetector (`inconsistency-detector.ts`)

**Purpose**: Finds direct contradictions, type mismatches, domain violations, undefined operations,
axiom conflicts, and quantifier-scope errors across a proof's statements.

```typescript
export interface InconsistencyDetectorConfig { /* strictness thresholds */ }

export class InconsistencyDetector {
  constructor(config?: Partial<InconsistencyDetectorConfig>)

  analyze(decomposition: ProofDecomposition): Inconsistency[]
  detectContradictions(atoms: AtomicStatement[]): Omit<Inconsistency, "id">[]
  detectTypeMismatches(atoms: AtomicStatement[]): Omit<Inconsistency, "id">[]
  detectDomainViolations(atoms: AtomicStatement[]): Omit<Inconsistency, "id">[]
  detectUndefinedOperations(atoms: AtomicStatement[]): Omit<Inconsistency, "id">[]
  detectAxiomConflicts(atoms: AtomicStatement[]): Omit<Inconsistency, "id">[]
  detectQuantifierErrors(atoms: AtomicStatement[]): Omit<Inconsistency, "id">[]
  getSummary(inconsistencies: Inconsistency[]): { total: number; bySeverity: Record<string, number>; [k: string]: unknown }
}
```

`analyze()` runs all six `detect*` passes and assigns each finding an ID. Contradiction detection
(`detectContradictions`) is syntactic (`isSyntacticNegation` — pattern-matches negation forms like
"not X" against "X"), not semantic — it will not catch a contradiction expressed in different
words. A fixed table of `ContradictionPattern`s built in the constructor
(`initializePatterns`) backs several of the six passes.

### CircularReasoningDetector (`circular-detector.ts`)

**Purpose**: Detects circular reasoning — self-referential statements, dependency cycles,
begging-the-question patterns, and tautologies masquerading as proof steps.

```typescript
export interface CircularReasoningResult { /* hasCircularReasoning, cycles, selfReferential, ... */ }

export class CircularReasoningDetector {
  detectCircularReasoning(decomposition: ProofDecomposition): CircularReasoningResult
  isSelfReferential(statement: AtomicStatement): boolean
  findReasoningCycles(graph: DependencyGraph): CircularPath[]
  findBeggingTheQuestion(atoms: AtomicStatement[], conclusion: AtomicStatement): string[]
  findTautologies(atoms: AtomicStatement[]): string[]
  analyzeCycle(cycle: string[], graph: DependencyGraph): CircularPath
  conclusionDependsOnItself(decomposition: ProofDecomposition): boolean
}
```

`findReasoningCycles` runs a DFS over the dependency graph (`findCyclesDFS`) and reconstructs each
cycle's statement path (`extractCyclePath`) — this is the one genuinely graph-theoretic check in
the class; `findBeggingTheQuestion` and `findTautologies` are pattern/equivalence heuristics
(`statementsEquivalent`, `isLogicalTautology`) layered on top, not derived from the cycle search.

### DependencyGraphBuilder (`dependency-graph.ts`)

**Purpose**: The mutable graph builder every other proof class consumes — add statements and
dependency edges, then query structure (roots, leaves, depth, cycles, topological order, paths).

```typescript
export class DependencyGraphBuilder {
  addStatement(statement: AtomicStatement): void
  createStatement(id: string, content: string, type: AtomicStatement["type"]): AtomicStatement
  addDependency(fromId: string, toId: string, type?: string): void

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
  hasNode(nodeId: string): boolean
  getNode(nodeId: string): AtomicStatement | undefined
  getAllNodes(): AtomicStatement[]
  getAllEdges(): DependencyEdge[]
  clear(): void
}
```

This is the only proof class with no `analyze`/`detect`-style entry point — it is pure graph
infrastructure that `ProofDecomposer.inferDependencies()` and every detector/tracker above builds
on. `getTopologicalOrder()` returning `null` is the graph's own signal for "contains a cycle,"
independent of `CircularReasoningDetector`'s higher-level analysis.

### HierarchicalProofManager (`hierarchical-proof.ts`)

**Purpose**: Organizes a proof into a tree of lemmas/corollaries/sub-proofs rather than a flat step
list, and can render that tree to Mermaid.

```typescript
export interface HierarchicalProofOptions { /* maxDepth, autoExtractLemmas, ... */ }
export interface ProofElementInput { /* statement, type, parentId?, steps, ... */ }

export class HierarchicalProofManager {
  constructor(options?: HierarchicalProofOptions)

  createProof(input: ProofElementInput): HierarchicalProof
  createElement(input: ProofElementInput): HierarchicalProof
  buildTree(root: HierarchicalProof): ProofTree

  addLemma(tree: ProofTree, lemma: HierarchicalProof, parentId?: string): ProofTree
  addCorollary(tree: ProofTree, corollary: HierarchicalProof, parentId: string): ProofTree
  findById(tree: ProofTree, id: string): HierarchicalProof | undefined
  findByType(tree: ProofTree, type: HierarchicalProof["type"]): HierarchicalProof[]
  findIncomplete(tree: ProofTree): HierarchicalProof[]
  generateSummary(tree: ProofTree): string
  toMermaid(tree: ProofTree): string
}
```

`buildTree()` auto-extracts sub-proofs and lemmas from a flat `ProofStep[]` (private
`extractSubProofs`, `findLemmas`) rather than requiring the caller to pre-structure them, then
computes cross-element dependency order (`computeDependencyOrder`) and per-node completeness
(`checkCompleteness` / `checkStepCompleteness`). `toMermaid()` is this class's own diagram
renderer — a proof-tree-specific Mermaid emitter, separate from `MermaidGraphBuilder` in
`src/export/visual/utils/mermaid.ts`.

### BranchAnalyzer (`branch-analyzer.ts`)

**Purpose**: Partitions a proof's steps into independent branches that could be verified or explored
in parallel, and orders them for sequential execution when they cannot.

```typescript
export interface BranchAnalyzerOptions { /* minBranchSize, mergeThreshold, ... */ }

export class BranchAnalyzer {
  constructor(options?: BranchAnalyzerOptions)

  analyze(steps: ProofStep[]): BranchAnalysisResult
  buildDependencyGraph(steps: ProofStep[]): Map<number, DependencyNode>
  partitionIntoBranches(steps: ProofStep[], graph: Map<number, DependencyNode>): ProofBranch[]
  markIndependentBranches(branches: ProofBranch[]): void
  getExecutionOrder(branches: ProofBranch[]): ProofBranch[][]   // outer array = sequential stages, inner = parallelizable within a stage
  estimateComplexity(branch: ProofBranch): number
  getStatistics(result: BranchAnalysisResult): { branchCount: number; independentCount: number; maxDepth: number; [k: string]: unknown }
}
```

`getExecutionOrder()` returns a *stage list*, not a flat order: branches within one inner array have
no dependency on each other and could run concurrently, while stages themselves are still
sequential — this is a scheduling structure, not a linear step order.

### ProofVerifier (`verifier.ts`)

**Purpose**: Checks each proof step's justification against a known set of inference rules and
flags structural problems (circular references, undefined terms) across the whole step sequence.

```typescript
export interface ProofVerifierConfig { /* knownRules, strictMode, ... */ }

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
`checkUndefinedTerms` (a term used before any step introduces it). `addCustomRule()` extends the
known-rule set at runtime — `isValidJustification()` checks against whatever rules are currently
registered, including custom ones added earlier in the same instance's lifetime.

### StrategyRecommender (`strategy-recommender.ts`)

**Purpose**: Given a theorem statement, recommends proof strategies (induction, contradiction,
direct, contrapositive, ...) ranked by fit, each with a generated template.

```typescript
export interface StrategyRecommenderConfig { /* weights per strategy, domain bonuses, ... */ }

export class StrategyRecommender {
  constructor(config?: StrategyRecommenderConfig)

  recommend(theorem: string): StrategyRecommendation[]
  extractFeatures(theorem: string): TheoremFeatures
  matchStrategies(features: TheoremFeatures): Array<{ strategy: ProofStrategyType; score: number; [k: string]: unknown }>
  getStrategies(): ProofStrategyType[]
  getTemplate(strategy: ProofStrategyType): ProofTemplate | undefined
}
```

`recommend()` extracts features from the theorem text (`extractFeatures` — domain type via
`detectDomainType`, plus `detectAdditionalFeatures` for things like "involves an infinite set" or
"asserts non-existence"), scores every strategy against a fixed weight table
(`initializeStrategyWeights`, `matchStrategies`) with domain and feature bonuses layered on
(`applyDomainBonus`, `applyAdditionalFeatureBonus`), and returns them ranked with generated
reasoning text (`generateReasoning`) and a filled-in `ProofTemplate` (`initializeTemplates` builds a
per-strategy template map at construction; `getDefaultTemplate` is the fallback for a strategy with
no custom template).

### Warning patterns (`patterns/warnings.ts`)

Not a class — a static catalog of 13 named `WarningPattern` constants (division by hidden zero,
assuming the conclusion, affirming the consequent, denying the antecedent, hasty generalization,
ambiguous middle, illegal cancellation, infinity arithmetic, necessary/sufficient confusion,
existential instantiation error, √ sign error, limit exchange error) collected into
`ALL_WARNING_PATTERNS`, plus three lookup/check functions:

```typescript
export function getPatternsByCategory(category: WarningCategory): WarningPattern[]
export function getPatternsBySeverity(severity: string): WarningPattern[]
export function checkStatement(statement: string): WarningPattern[]
export function checkProof(steps: ProofStep[]): Map<number, WarningPattern[]>
```

`checkStatement`/`checkProof` are the entry points other proof classes could call to flag a known
logical-fallacy pattern by name rather than re-deriving it structurally — a complementary,
name-the-fallacy layer alongside `InconsistencyDetector`'s structural contradiction detection.

---

## Taxonomy

`src/taxonomy/` classifies and recommends reasoning approaches independent of the 34 `ThinkingMode`
values — a broader 69-entry taxonomy backs `recommend_mode` and related tooling.

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
export function getTaxonomyStats(): { total: number; byCategory: Record<ReasoningCategory, number>; [k: string]: unknown }
```

The file's own header comment still says "110 reasoning types" (Phase 4D naming, from before a
later trim); `REASONING_TAXONOMY` holds exactly 69 entries today — the module-level `id:` field
count is the ground truth, not the comment.

### TaxonomyClassifier (`classifier.ts`)

**Purpose**: Classifies a `Thought` against the 69-entry taxonomy via keyword + context scoring.

```typescript
export interface ThoughtClassification { /* typeId, confidence, alternativeTypes, ... */ }

export class TaxonomyClassifier {
  classifyThought(thought: Thought): ThoughtClassification
  getType(typeId: string): ReasoningType | undefined
  getTypesByCategory(category: ReasoningCategory): ReasoningType[]
  getCategories(): ReasoningCategory[]
  getStatistics(): { totalTypes: number; byCategory: Record<string, number>; [k: string]: unknown }
}
```

The constructor builds a keyword index (`buildKeywordIndex`) over every taxonomy entry's
`keywords`/`aliases` once, up front. `classifyThought` tokenizes the thought's content
(`tokenize`), scores each candidate type by keyword overlap (`calculateKeywordScore`) plus a
context bonus for surrounding sentence structure (`calculateContextScore`), and returns the
best-scoring type with alternatives. **`classifier.ts` itself is unused** — nothing in `src/`
imports `TaxonomyClassifier`; the only occurrence of its name in `src/index.ts` is a JSDoc comment,
not an import.

### TaxonomyNavigator (`navigator.ts`)

**Purpose**: Query and traversal API over the taxonomy graph — filtered search, learning paths,
type comparison, and a text report generator.

```typescript
export interface TaxonomyQuery { /* category?, difficulty?, keyword?, ... */ }
export interface QueryResult { /* type: ReasoningType, relevance: number, ... */ }
export interface NavigationPath { /* steps: NavigationStep[], ... */ }
export interface TaxonomyExploration { /* type, relatedTypes, learningPath, ... */ }

export class TaxonomyNavigator {
  query(filters: TaxonomyQuery): QueryResult[]
  findByKeyword(keyword: string): ReasoningType[]
  findByApplication(application: string): ReasoningType[]
  explore(typeId: string): TaxonomyExploration | null
  findPath(fromId: string, toId: string): NavigationPath | null
  recommend(characteristics: unknown): ReasoningType[]
  compare(typeIdA: string, typeIdB: string): { shared: string[]; differences: string[]; [k: string]: unknown }
  getOverview(): { totalTypes: number; categories: ReasoningCategory[]; [k: string]: unknown }
  generateQueryReport(results: QueryResult[]): string
}
```

`explore()` builds a `computeLearningPath` for the requested type — the prerequisite chain leading
up to it, walked via a private `buildDependencyGraph` over `ReasoningType.prerequisites`. Only the
test suite imports `TaxonomyNavigator`; no production path from `src/index.ts` reaches it.

### SuggestionEngine (`suggestion-engine.ts`)

**Purpose**: The largest taxonomy file — recommends a reasoning type for a described problem, and
retrospectively analyzes a completed session for quality and bottlenecks.

```typescript
export type CognitiveLoad = "low" | "medium" | "high" | "very_high";
export type DualProcessType = "system1" | "system2" | "hybrid";
export interface QualityMetrics { /* rigor, completeness, clarity, ... */ }
export interface ProblemCharacteristics { /* complexity, domain, uncertaintyLevel, ... */ }
export interface ReasoningSuggestion { /* typeId, confidence, rationale, warnings, ... */ }
export interface SessionAnalysis { /* bottlenecks, improvements, qualityTrend, ... */ }

export class SuggestionEngine {
  getMetadata(typeId: string): EnhancedMetadata | null
  suggestForProblem(characteristics: ProblemCharacteristics): ReasoningSuggestion[]
  analyzeSession(session: ThinkingSession): SessionAnalysis
}
```

`suggestForProblem` maps problem complexity to a difficulty tier (`mapComplexityToDifficulty`),
then builds per-suggestion rationale (`buildRationale`), warnings (`buildWarnings`), an effort
estimate (`estimateEffort`), and a success-probability estimate (`estimateSuccessProbability`) — all
heuristic scoring functions, not learned from historical outcomes. `analyzeSession` maps each
thought's `ThinkingMode` back to a taxonomy type (`mapModeToType`) to reuse the same metadata, then
derives `identifyBottlenecks` and `suggestImprovements` from the mapped sequence.

### MultiModalAnalyzer (`multi-modal-analyzer.ts`)

**Purpose**: Analyzes a session that used more than one `ThinkingMode` — transition quality between
modes, detected mode combinations, and pattern-based recommendations for future multi-mode flows.

```typescript
export interface ModeTransition { /* from, to, effectiveness, ... */ }
export interface ModeCombination { /* modes: string[], synergy: number, ... */ }
export interface ReasoningFlow { /* transitions, combinations, complexity, coherence, adaptability */ }
export interface MultiModalPattern { /* name, modes, description, ... */ }
export interface ModeSynergy { /* mode1, mode2, score, rationale */ }
export interface MultiModalRecommendation { /* pattern, relevance, rationale, adaptations */ }

export class MultiModalAnalyzer {
  analyzeFlow(session: ThinkingSession): ReasoningFlow
  recommendPatterns(characteristics: unknown): MultiModalRecommendation[]
  findSynergy(mode1: string, mode2: string): ModeSynergy | null
  generateFlowReport(flow: ReasoningFlow): string
}
```

`analyzeFlow` scores each mode-to-mode transition (`estimateTransitionEffectiveness`), detects
mode-combination clusters (`detectCombinations`, scored by `calculateCombinationSynergy`), and
rolls those up into flow-level `calculateFlowComplexity`, `calculateCoherence`, and
`calculateAdaptability` scores. Not one of the 4 taxonomy classes here is reachable from
`src/index.ts` at runtime except through the taxonomy module as a whole — see Verification for the
dependency-graph's reachability numbers.

---

## Cache

`src/cache/` is now LRU-only. `types.ts`'s `CacheStrategy` type still lists `"lru" | "lfu" |
"fifo"` and `CacheEntry.accessCount`'s doc comment still says "(for LFU)", but the LFU and FIFO
implementations, and the factory that used to select between them, were removed — a comment in
`cache/index.ts` records this explicitly ("Simplified to LRU only (removed unused LFU/FIFO/
factory)"). `LRUCache` is what `SessionManager.activeSessions` and `ValidationCache`'s internal
`Map` conceptually parallel (the latter reimplements its own LRU logic rather than using this
class — see Validation, above).

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
`cleanExpired()` is a separate maintenance sweep for TTL-expired entries — `get()`/`has()` still
check expiry lazily on access, so `cleanExpired()` is only needed to reclaim memory from entries
nobody has touched since they expired. `SessionManager` constructs one with an `onEvict` callback
that auto-saves the evicted session to storage (see Session, above) — the cache itself has no
storage awareness; eviction behavior beyond LRU ordering is entirely the caller's callback.

---

## Utils

`src/utils/` holds 18 classes (17 error classes in `errors.ts` plus `Logger` in `logger.ts`) and
four function-only modules: `sanitization.ts`, `type-guards.ts`, `logger-types.ts`, and
`file-lock.ts` (documented under Session, above, since its only consumer is `FileSessionStore`).

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

`InputValidationError`'s constructor stringifies any object `value` to the literal `"[object]"`
before storing it in `context` — a deliberate choice so a validation error's context never leaks a
full (possibly sensitive) input object into logs, only its field name and a generic marker.
`ErrorFactory` covers five of the seventeen error types with static convenience constructors; the
other twelve are constructed directly.

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

Every entry is buffered in `this.logs` regardless of `enableConsole` — `getLogs()` reads that
buffer (optionally filtered to a minimum level), which is how tests assert on logged output without
capturing stdout. `logger-types.ts` exists purely to hold `LogLevel`/`LogEntry`/`LoggerConfig`
separately from the `Logger` class itself, breaking a circular import that existed when those types
lived in `logger.ts` directly; `logger.ts` re-exports all three for backward compatibility.

### Sanitization (`sanitization.ts`)

Function-only — input-hardening helpers used across `SessionManager`, `ExportService`, and the
validation layer.

```typescript
export const MAX_LENGTHS: { TITLE: number; DOMAIN: number; AUTHOR: number; [k: string]: number };

export function sanitizeString(value: string, maxLength: number, fieldName: string): string
export function sanitizeOptionalString(value: string | undefined, maxLength: number, fieldName: string): string | undefined
export function validateSessionId(sessionId: string): string             // throws on non-UUID-v4 / path-traversal-shaped input
export function sanitizeNumber(value: number, min: number, max: number, fieldName: string): number
export function sanitizeStringArray(values: string[], maxLength: number, fieldName: string): string[]
export function sanitizeThoughtContent(content: string): string
export function sanitizeTitle(title: string | undefined): string
export function sanitizeDomain(domain: string | undefined): string | undefined
export function sanitizeAuthor(author: string | undefined): string | undefined
export function escapeHtml(text: string): string
export function escapeLatex(text: string): string
```

`validateSessionId` is the path-traversal guard `SessionManager` and `FileSessionStore` both call
before touching disk with a caller-supplied session ID. This `escapeLatex` is the one `ExportService`
imports and uses; `LaTeXExporter` in `src/export/visual/utils/latex.ts` has its own private,
independently-implemented `escapeLatex()` method — two implementations of the same operation that
happen to share a name (see Export, above).

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
shared support file). `index.ts` is the barrel every other module imports from; `handlers.ts` and
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
// 35 values: 34 real reasoning modes + CUSTOM. The enum's own doc comment says "33 total" —
// stale; count the members, not the comment.

export const FULLY_IMPLEMENTED_MODES: ReadonlyArray<ThinkingMode>;  // all 34 real modes (excludes CUSTOM)
export function isFullyImplemented(mode: ThinkingMode): boolean;

/** @deprecated always empty — every mode reached full implementation */
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
those 32 `types/modes/<mode>.ts` files **also** defines its own `is<Mode>Thought` guard, with an
identical implementation (`thought.mode === ThinkingMode.<MODE>`). This is a real, verified
duplication, not a naming coincidence: 32 guard functions exist in two places each, and nothing
enforces the two copies stay behaviorally identical if one is edited without the other — a genuine
drift risk if a mode's discriminant check ever needs to change. `types/modes/recommendations.ts` is
the one file in that directory that is not a per-mode thought-type file: it holds
`ProblemCharacteristics` and related types for mode recommendation, re-exported directly through
`types/index.ts` rather than through `core.ts`'s `Thought` union.

63 names in total are exported by two or more files under `src/`. Beyond the 32 duplicated
`isXThought` guard pairs: 29 pairs are type-only names that collide by English word only (e.g.
`Constraint` in `src/modes/stochastic/types.ts` vs. a same-named type in
`types/modes/optimization.ts` — unrelated concepts, already disambiguated by the hand-curated
`types/index.ts` barrel, not a defect); the remaining 2 pairs are the genuine footguns already
covered above — duplicated `escapeLatex` logic (Export/Utils) and two unrelated `ValidationError`
definitions (an interface in `types/session.ts` vs. a class in `src/utils/errors.ts`, distinguished
only by which one a given file happens to import).

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
  maxThoughtsInMemory?: number; sessionTimeoutMs?: number; /* ... */
}
export interface ModeConfig { mode: ThinkingMode; /* ... */ }
export interface SessionMetrics { /* per-mode accumulated stats, updated by SessionMetricsCalculator */ }
export interface SessionMetadata { id: string; title: string; createdAt: Date; updatedAt: Date; thoughtCount: number; mode: ThinkingMode; isComplete: boolean }
export type ExportFormat = /* the document/visual format union, distinct from ExportService's inline literal union */;
export interface Attachment { /* id, type, content or reference, ... */ }

export interface ValidationResult {          // returned by ThoughtValidator, NOT the src/validation/validators/base.ts ModeValidator result shape
  isValid: boolean; confidence: number; issues: ValidationIssue[];
  strengthMetrics: { logicalSoundness: number; empiricalSupport: number; mathematicalRigor: number; physicalConsistency: number };
  suggestions: string[];
}
export interface ValidationIssue {
  severity: "error" | "warning" | "info"; thoughtNumber: number;
  description: string; suggestion: string; category: string;
}
```

There are two distinct `ValidationResult` shapes in this codebase: this session-level one (what
`ThoughtValidator.validate()` returns — confidence-scored, with strength metrics) and the
per-handler one in `src/modes/handlers/ModeHandler.ts` (`{ valid, errors, warnings }` — what
`ModeHandler.validate()` and `ModeHandlerRegistry.validate()` return). They serve different layers
of the same word and are not interchangeable.

### Handler I/O types (`handlers.ts`) and the barrel (`index.ts`)

`handlers.ts` types the MCP response envelope and per-handler input shapes independent of the
`Thought` hierarchy:

```typescript
export interface MCPTextContent { type: "text"; text: string }
export interface MCPResponse { content: MCPTextContent[]; [key: string]: unknown }
export interface AddThoughtInput { /* mode: string (not ThinkingMode) for Zod-schema compatibility, ... */ }
// + one refined input interface per MCP handler function
```

`types/index.ts` is the barrel nearly everything else imports from: it re-exports all of `core.ts`
and `session.ts` wholesale (`export *`), the `ModeHandler` interface family by name (to avoid a
duplicate-export collision with `core.ts`), `types/modes/recommendations.ts` wholesale, and a
curated list of engineering-specific sub-interfaces (`Requirement`, `TradeStudy`, `FailureMode`,
and others) that exist in `types/modes/engineering.ts` but aren't part of `core.ts`'s `Thought`
union surface.

---

## Verification

Generated 2026-08-05 by `repo_map.py map`.
Regenerate: `python repo_map.py map <repo> --out <dir>` · Check: `python repo_map.py check <repo> --docs docs/Architecture`

| Claim | Value | Source |
|---|---|---|
| totalTypeScriptFiles | 459 | dependency-graph.json |
| totalLinesOfCode | 220901 | dependency-graph.json |
| totalExports | 2242 | dependency-graph.json |
| totalModules | 5 | dependency-graph.json |
| reachableFiles | 186 | dependency-graph.json |
| orphanedFiles | 23 | dependency-graph.json |
| noImporterFileCount | 20 | dependency-graph.json |

Class counts, handler counts and validator counts in this document are verified directly
against `src/` by listing and reading the files named at each claim. They are not graph metrics,
so they do not appear in the table above.
