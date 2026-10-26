# Test Coverage

This document maps the deepthinking-mcp test suite to the code it covers. Use it to
answer one question: is this area tested, and where.

## 1. Overview

The suite uses **Vitest** with the **V8** coverage provider (`vitest.config.ts`). Coverage
excludes `node_modules/`, `dist/`, `*.d.ts`, config files, and the `tests/` tree itself.
`vitest.config.ts` does not set a coverage `thresholds` block, so no minimum percentage
gates the build. Coverage reports are informational, not enforced.

Most test folders follow the folder names of `src/`: `tests/unit/<area>/` and
`tests/integration/<area>/` mirror `src/<area>/`. Five folders have no `src/` counterpart:
`tests/unit/benchmarks/` and `tests/integration/{exports,handlers,scenarios,validators}/`. A file under
`src/modes/handlers/BayesianHandler.ts` has its unit test at
`tests/unit/modes/handlers/BayesianHandler.test.ts`. Every one of the 38 files in
`src/modes/handlers/` has a test file of the same name.

### Layout

| Directory | Test files | Purpose |
|---|---|---|
| `tests/unit/` | 151 | Type guards, handlers, validators, exporters, session storage, and regression guards that pin one wiring or one contract. |
| `tests/integration/` | 80 | Cross-module paths: entry-point dispatch over a real transport, tool-shaped input through the handlers, export round-trips, multi-mode analysis, session lifecycles. |
| `tests/edge-cases/` | 6 | Boundary conditions, malformed input, regressions pinned from past bugs. |
| `tests/performance/` | 4 | Counted-work checks for cost, throughput, memory and stress. `helpers/work-probe.ts` holds the counters. |
| `tests/utils/` | 0 (5 helper files) | Shared fixtures, factories, and assertion helpers. 21 test files import them, all under `tests/integration/tools/`. |
| `tests/test-results/` | 0 | Reporter code and `TEST_RESULTS_v*.md` summaries. Not test code. |

The suite holds 241 test files. `npx vitest list --filesOnly` lists them. This document maps
files. It holds no test count and no pass or fail state. Run the suite to get those.

### Running each tier

```bash
npx vitest run tests/unit               # unit only
npx vitest run tests/integration        # integration only
npx vitest run tests/edge-cases         # edge cases only
npx vitest run tests/performance        # performance checks only
npx vitest run                          # everything
```

`npm run test:publish` sets `SKIP_BENCHMARKS=1`. That variable switches on one extra entry in the
`exclude` list of `vitest.config.ts`: `**/benchmarks/**`. The pattern matches the directory
`tests/unit/benchmarks/`, which holds 2 test files. It does not match `tests/performance/`, so
the 4 performance files run under `test:publish`. With the variable set, `vitest list` shows 239
files instead of 241.

### Where reports land

`vitest.config.ts` registers two reporters: the built-in `default` console reporter and a
custom `./tests/test-results/per-file-reporter.js`. The variable `VITEST_REPORT_MODE` selects what
the custom reporter writes:

- `summary` (`npm run test:run`, `npm run test:publish`): the summary only.
- `debug` (`npm run test:debug`): the summary, plus one report for each failed test file.
- `all` (`npm run test:all`, and the default when the variable is not set): the summary, plus one
  report for each test file.

A per-file report is one HTML and one JSON file in `tests/test-results/html/` and
`tests/test-results/json/`, named `<test-file>-<date>-<PASS|FAIL>`. The summary goes to
`tests/test-results/summary/`. Coverage output goes to `./coverage/` (the `json`, `json-summary` and `html`
reporters; the `text` reporter prints to the console). Run `npm run test:coverage`, or any run with `--coverage`.

## 2. Coverage by area

The counts come from direct directory listings of `src/` and `tests/`, and from the import graph
of `repo-tools map` (a file counts as imported when at least one file under `tests/` imports it
directly; a type-only import counts). "Unit test files" counts the files under `tests/unit/` that cover the area, including
the root-level files that name the area in their subject.

| Area | `src/` files | Unit test files | `src/` files imported directly by a test | Also exercised by |
|---|---|---|---|---|
| `index.ts` | 1 | 0 | 1 (8 test files) | `tests/integration/index-server.test.ts` and 7 more files that import the module. See Gaps. |
| `types/` | 37 | 11 | 18 | Most handler and validator tests import types from here. No test imports 18 of the mode type files directly. |
| `modes/` (handlers, combinations, causal graph, stochastic) | 58 | 59 | 56 | `tests/integration/handlers/`, `tests/integration/mode-handler-delegation.test.ts`. |
| `services/` | 3 | 2 | 3 | 68 test files import `ThoughtFactory` or `ExportService` directly. `RecommendationService` has one importer, `tests/unit/taxonomy/taxonomy-wiring.test.ts`. |
| `session/` | 4 | 11 | 2 | `tests/integration/session-workflow.test.ts`, `multi-session.test.ts`, `edge-cases/session-edges.test.ts`, and 4 `tests/integration/tools/session-*.test.ts` files. |
| `validation/` | 44 | 21 | 21 | `tests/unit/validation/validators/modes/validator-contract.test.ts` covers all 35 mode validators. See Gaps. |
| `export/` | 48 | 15 | 23 | 12 integration files under `tests/integration/export/` and `tests/integration/exports/`. The per-mode visual exporters are reached through `visual/modes/index.ts`. |
| `proof/` | 15 | 10 | 13 | `tests/integration/proof/decomposition.test.ts`, and the `proof-*-wiring` tests in `tests/unit/session/`. |
| `taxonomy/` | 7 | 3 | 6 | `tests/unit/session/reasoning-flow-wiring.test.ts`. |
| `cache/` | 3 | 2 | 1 | `src/cache/lru.ts` is imported by 2 unit tests. `index.ts` and `types.ts` have no direct importer. |
| `utils/` + `interfaces/` | 7 | 4 | 5 | `type-guards.ts` and `logger-types.ts` have no direct importer. |
| `tools/` | 19 | 10 | 17 | 40 files under `tests/integration/tools/`. 2 barrel files have no direct importer. |
| `config/` | 1 | 1 | 1 | `config-index.test.ts` has 5 tests. They set no environment variable. |

**Headline:** `modes/` has a test file for every handler. The validation area shows a low
count of direct importers, but its contract test discovers the mode validators by glob. The
`tools/` area has 17 of its 19 files imported, and `schema-contract.test.ts` walks `toolList`
and `toolSchemas`. See Gaps for the exact limits of that coverage.

## 3. Unit tests

151 files under `tests/unit/`, organized by the `src/` area they cover.

**`types/` (11 files).** `types.test.ts` covers the core type guards in `src/types/core.ts`.
`types/thought-guard-coverage.test.ts` pins the type guards against `ThinkingMode` in both
directions. Eight files pair one reasoning mode's type guard with `ThoughtValidator` from
`src/validation/validator.ts`: `abductive.test.ts`, `analogical.test.ts`, `bayesian.test.ts`,
`causal.test.ts`, `counterfactual.test.ts`, `evidential.test.ts`, `gametheory.test.ts`,
`temporal.test.ts`. `recommendations.test.ts` covers `ModeRecommender` in
`src/types/modes/recommendations.ts`.

**`modes/` (59 files).** The largest concentration in the suite:
- `tests/unit/modes/handlers/` (42 files) has one test per file in `src/modes/handlers/`
  (`AbductiveHandler.test.ts` through `TemporalHandler.test.ts`, and `ModeHandler.test.ts` for the
  interface file). It also holds `registry.test.ts` for the `ModeHandlerRegistry` singleton in
  `src/modes/registry.ts`, and `stochastic-engine-wiring.test.ts`, which checks that
  `StochasticHandler` uses the Monte Carlo engine. `GameTheoryEquilibria.test.ts` pins the
  equilibrium set, the `isStrict` flag and the stability score on five small games.
  `mode-name-resolution.test.ts` checks `resolveMode` and the mode names that `CustomHandler` and
  `HybridHandler` accept.
- `tests/unit/modes/handler-registration-coverage.test.ts` checks that `registerAllHandlers`
  covers every `ThinkingMode`. The expected list comes from the enum, not from a copy.
- `tests/unit/modes/registry-base-fields.test.ts` checks that `ModeHandlerRegistry.createThought`
  carries the six base fields (`revisionReason`, `branchFrom`, `branchId`, `uncertainty`,
  `dependencies`, `assumptions`) from the input to the thought, for every mode. It also checks
  that a value the handler computed stays, and that the registry adds no key when the input
  carries none of the six.
- `tests/unit/modes/combinations/` (5 files): `analyzer-execution.test.ts`,
  `conflict-resolver.test.ts`, `merger.test.ts`, `presets.test.ts`, `text-similarity.test.ts`. The first one checks that
  `deepthinking_analyze` runs real modes through `ThoughtFactory`.
- `tests/unit/modes/causal/graph/` (4 files): `centrality.test.ts`, `d-separation.test.ts`,
  `graph-utils.test.ts`, `intervention.test.ts`, covering the causal-graph algorithms in
  `src/modes/causal/graph/algorithms/`.
- `tests/unit/modes/stochastic/` (6 files): `distribution.test.ts`, `gamma-variates.test.ts`,
  `large-sample.test.ts`, `moments.test.ts`, `rng.test.ts`, `statistics.test.ts`, covering
  `src/modes/stochastic/{models,sampling,analysis}/`.

**`validation/` (20 files).** `tests/unit/validation/validators/modes/` holds 15 files. Fourteen
are per-mode validator tests: `bayesian`, `causal`, `computability`, `constraint`, `cryptanalytic`,
`deductive`, `evidential`, `gametheory`, `inductive`, `metareasoning`, `modal`, `optimization`,
`recursive`, `stochastic`. The fifteenth, `validator-contract.test.ts`, discovers the validator
files with `import.meta.glob` and asserts the shared contract for all 35 mode validators. Five
files sit one level up: `advisory.test.ts` (the `validateAdvisory` wrapper), `cache-key.test.ts`
(validation cache key derivation), `registry-mode-coverage.test.ts` (`VALIDATOR_REGISTRY` covers
`ThinkingMode`), `unknown-mode.test.ts` (a mode with no registered validator), and
`validator-file-coverage.test.ts` (validator files and `VALIDATOR_REGISTRY` agree in both
directions).

**`export/` (14 files).** Five files sit in `tests/unit/export/`: `file-exporter.test.ts`,
`latex.test.ts`, `latex-export.test.ts`, `profiles.test.ts`, `proof-decomposition-visual.test.ts`.
Two more pin shared behavior: `duplicate-implementations.test.ts` (copies of the same logic must agree)
and `mode-exporter-format-matrix.test.ts` (every mode renders every visual format).
`visual/modes/snapshot-baseline.test.ts` pins visual-exporter output against snapshots.
`visual/utils/{document-builders,graph-builders,svg-shared-elements,visual-builders}.test.ts` cover the fluent builder
classes in `src/export/visual/utils/`. `visual/utils/dispatch.test.ts` covers the format dispatch of `exportByFormat`. `visual.test.ts` (at the `tests/unit/` root) exercises
`VisualExporter` across causal, temporal, game-theory, and Bayesian thought types.

**`proof/` (10 files).** `advisory.test.ts` covers the `analyzeProofAdvisory` wrapper. Eight files
cover one proof module each: `branch-analyzer`, `circular-detector`, `dependency-graph`,
`hierarchical-proof`, `inconsistency-detector`, `strategy-recommender`, `verifier`, `warning-patterns`
(covers `patterns/warnings.ts`). `types.test.ts` tests the proof-decomposition types in
`src/types/modes/mathematics.ts` and the `isMathematicsThought` guard in `src/types/core.ts`. It
imports no module from `src/proof/`.
`assumption-tracker.ts`, `decomposer.ts`, and `gap-analyzer.ts` have no file of their own here.
`tests/integration/proof/decomposition.test.ts` imports all three.
`tests/unit/session/proof-analysis-wiring.test.ts` imports `decomposer.ts`, and
`proof-extended-wiring.test.ts` imports `assumption-tracker.ts`.

**`taxonomy/` (3 files).** `taxonomy-system.test.ts` exercises the reasoning-types catalogue, the
navigator, the suggestion engine, and the multi-modal analyzer. `taxonomy-advisory.test.ts` covers
the advisory wrapper `suggestReasoningTypesAdvisory`. `taxonomy-wiring.test.ts` checks that
`recommend_mode` reaches the taxonomy through `RecommendationService`.

**`tools/` (10 files).** `mode-reachability.test.ts` checks that every implemented mode is
selectable through a tool. `schema-bounds.test.ts` covers `withZodBounds` in
`src/tools/schema-bounds.ts`. That function copies the length, count and numeric limits of a Zod
schema into the hand-written JSON schema of the same tool. The test checks four rules. A limit
that the JSON schema states stays. A missing limit is copied at every depth. The safe-integer
limits of `.int()` are not copied. The function does not change its inputs.
`schemas/bounds.test.ts`, `schemas/schema-contract.test.ts`, `schemas/schema-validation.test.ts`,
and `schemas/tool-definitions.test.ts` cover input-size limits, the Zod schema contract, schema
shape, and the 13 tool definitions in `src/tools/definitions.ts` and `src/tools/schemas/`.
`schemas/analyze-custom-modes.test.ts` pins the `customModes` list of `deepthinking_analyze`. The
list holds every `ThinkingMode` except `custom`, in the Zod schema and in the advertised schema.
`schemas/advertised-omissions.ts` is a helper and not a test file. It lists the fields that the
advertised schema of a tool leaves out, with the reason. `advertised-schema-conformance.test.ts`,
`schema-contract.test.ts` and `algorithmic-contract.test.ts` read it.
Three more files in `schemas/` guard the whole class of schema defects.
`advertised-schema-conformance.test.ts` derives a JSON schema from each Zod schema. It compares
the result with the advertised schema at every depth: property names, required names, types,
enum members and bounds. `bounded-inputs.test.ts` covers the Zod schemas of the 13 tools and of
the legacy `deepthinking` tool. It fails on a string, an array or a value of unknown type that
has no bound. `field-reach.test.ts` changes one leaf of an input at a time. It checks that the
leaf reaches the stored thought. A list names the leaves that no mode stores. The test compares
that list with the measured one in both directions.

**`session/` (10 files).** Four files sit at the `tests/unit/` root: `session-manager.test.ts` and
`session-manager-remediation.test.ts` cover `src/session/manager.ts`; `file-store.test.ts` and
`file-store-storage-error.test.ts` cover `src/session/storage/file-store.ts`, including the error
paths a healthy run never hits. Six regression guards sit in `tests/unit/session/`:
`advisory-validation-wiring`, `proof-analysis-wiring`, `proof-extended-wiring`, and
`reasoning-flow-wiring` check that the validation engine, the proof engines and the reasoning-flow
analyzer sit on the live request path. `create-session-mode-sync` checks that `createSession`
sets the session mode in both places it is stored. `default-config-leak` checks that a session
never mutates `DEFAULT_CONFIG`.

**`services/` (2 files).** `ThoughtFactory.test.ts` and `ExportService.test.ts`.

**`cache/` (2 files).** `lru.test.ts` and `lru-contract.test.ts` cover `LRUCache` in
`src/cache/lru.ts`, including its statistics contract.

**`utils/` (4 files).** `errors.test.ts`, `logger.test.ts`, and `sanitization.test.ts` cover
`src/utils/{errors,logger,sanitization}.ts`. `file-lock.test.ts` covers
`src/utils/file-lock.ts`, the cross-process lock used by multi-instance session storage.

**`config/` (1 file).** `config-index.test.ts` has 5 tests. They cover the defaults of `maxActiveSessions`,
`sessionTimeoutMs`, `maxThoughtsInMemory` and `compressionThreshold`, `updateConfig`, and
`validateConfig`. They set no environment variable, so the 14 `MCP_*` variables that
`src/config/index.ts` reads are not exercised through the environment.

**`benchmarks/` (2 files, not area-specific).** `tests/unit/benchmarks/metrics-performance.test.ts`
and `validation-performance.test.ts` are micro-benchmarks. They are the two files that
`SKIP_BENCHMARKS=1` excludes. They are not part of `tests/performance/`.

## 4. Integration tests

80 files under `tests/integration/`, exercising cross-module paths that a unit test cannot
reach.

**Root files (13) — the server entry point, the protocol and the mode contracts.** Six of these
files import `src/index.ts`, and one more re-implements it:
- `index-importable.test.ts` checks the entry-point guard: importing `src/index.ts` starts no
  stdio server.
- `index-server.test.ts` drives the exported server over an in-memory transport: `tools/list`
  returns exactly the 13 focused tools and hides the legacy tool; `tools/call` creates a session
  and a thought, carries mode-specific fields to the stored thought, appends to an existing
  session, and exports a session; an unknown tool, a Zod rejection, and a mode that the tool does
  not own return tool errors; the server keeps serving after an error; the hidden legacy
  `deepthinking` tool still answers.
- `mcp-2-compliance.test.ts` imports `src/index.ts` and checks MCP 2.0 behavior.
- `engineering-contract.test.ts` and `algorithmic-contract.test.ts` drive the exported server over
  an in-memory transport. Each sends every field that the handler reads, and checks that the field
  reaches the answer or the stored thought. `algorithmic-contract.test.ts` also checks the tool
  description, the sentences in `validation.issues`, the design-pattern spelling, the complexity
  blocks, and the export of sparse blocks in eight formats.
- `dist-bundle-validators.test.ts` starts the built `dist/index.js` over stdio and checks that
  every mode has a validator.
- `index-handlers.test.ts` does **not** import `src/index.ts`. It re-implements the handler
  logic against `SessionManager`, so it cannot catch a change in the real handlers.
- `mcp-compliance.test.ts` and `mcp-protocol.test.ts` check the tool definitions, their JSON
  Schemas, and the Zod input rules without a server.
- `mode-handler-delegation.test.ts` checks that `ModeHandlerRegistry` routes every mode to the
  right handler.
- `session-workflow.test.ts`, `multi-session.test.ts`, and `error-handling.test.ts` cover session
  lifecycles, concurrent sessions, and error responses at the `SessionManager` level.

**`tools/` (40 files) — one file per tool or mode combination.** Most files call
`ThoughtFactory` and `ModeHandlerRegistry` with tool-shaped input (`ThinkingToolInput`). They
do not go through the `tools/call` handler or the Zod `toolSchemas`. The files are:
`core-{abductive,deductive,inductive}.test.ts`, `standard-{sequential,shannon,hybrid,
runtime-only}.test.ts`, `mathematics-{core,analysis}.test.ts`, `temporal-{events,relations,
timeline}.test.ts`, `probabilistic-{bayesian,evidential}.test.ts`, `causal.test.ts`,
`counterfactual.test.ts`, `strategic-{gametheory,optimization}.test.ts`,
`analytical-{analogical,cryptanalytic,firstprinciples,metareasoning}.test.ts`,
`scientific-{formallogic,method,systemsthinking}.test.ts`, `engineering.test.ts`,
`algorithmic.test.ts`, `academic-{analysis,argumentation,critique,synthesis}.test.ts`,
`physics.test.ts`, `computability.test.ts`, `common-parameters.test.ts`, `analyze.test.ts`
(`MultiModeAnalyzer`), and `analyze-confidence-contract.test.ts` (imports `src/index.ts` and
checks that `deepthinking_analyze` reports no confidence that it did not compute). Four
`session-{actions,export-all,lifecycle,multiinstance}.test.ts` files cover session management.

**`handlers/` (7 files) — handler behavior beyond the unit tests:** `bayesian.handler.test.ts`,
`causal.handler.test.ts`, `counterfactual.handler.test.ts`, `critique.handler.test.ts`,
`gametheory.handler.test.ts`, `synthesis.handler.test.ts`, `systemsthinking.handler.test.ts`.

**`exports/`, `export/` (12 files) — format round-trips.** `exports/{ascii,dot,html,json,
jupyter,latex,markdown,mermaid}.test.ts` each drive a thought through the real export
pipeline and check the rendered output. `exports/mode-specific.test.ts` checks
mode-specific export branches. `export/batch-export.test.ts` covers exporting many sessions
at once. `export/visual/{builders-integration,mode-exporters-snapshot}.test.ts` cover the
visual builder classes wired together. `mode-exporters-snapshot.test.ts` snapshot-pins the output of
the builders, not of the mode exporters.

**`scenarios/` (4 files) — realistic multi-step workflows.** `complex-branching.test.ts`
(branch and revision chains), `export-roundtrip.test.ts` (create, export; it parses only the JSON export and checks the other
formats as text),
`multi-mode.test.ts` (combining modes in one session), `real-world-workflows.test.ts`
(end-to-end usage patterns modeled on actual tool call sequences).

**`modes/` (1 file), `proof/` (1 file), `validators/` (1 file).**
`modes/causal-graph.test.ts` covers causal graph construction from the algorithm modules.
`proof/decomposition.test.ts` covers `decomposer.ts`, `gap-analyzer.ts`, and
`assumption-tracker.ts` together. `validators/mode-validators.test.ts` imports validators that
already have dedicated unit tests, so it does not add coverage for the others. The coverage of
all 35 validators is `tests/unit/validation/validators/modes/validator-contract.test.ts`, which
discovers validator files with `import.meta.glob`, so a new validator is covered the moment its
file exists.

## 5. Edge cases and performance

### Edge cases (6 files, 35 numbered `T-EDG-*` cases + 10 `T-REG-*` regression cases)

Each edge-case file groups a run of sequentially numbered scenarios, which makes an
individual case easy to find by ID:

- **`input-validation.test.ts`** — `T-EDG-001` to `T-EDG-012`: missing required parameters
  (`thought`, `thoughtNumber`, `totalThoughts`, `nextThoughtNeeded`), out-of-range values
  (`thoughtNumber` zero or exceeding total, `totalThoughts` zero, `uncertainty` outside
  `[0,1]`), an invalid mode string, an empty thought string, and `null` parameters.
- **`type-validation.test.ts`** — `T-EDG-013` to `T-EDG-018`: wrong JavaScript type in each
  direction (string where a number is expected, object where an array is expected, and so
  on), plus nested-object type validation.
- **`boundaries.test.ts`** — `T-EDG-019` to `T-EDG-024`: maximum session size, maximum
  thought length, maximum array sizes, maximum nesting depth, and both empty-array and
  empty-object handling. The tests check that large input is accepted (100 thoughts, thoughts of
  10,000 and 100,000 characters, arrays of 100 items). No test reads an `MCP_MAX_*` value or calls
  `getConfig`, so no test checks a limit.
- **`session-edges.test.ts`** — `T-EDG-025` to `T-EDG-030`: resuming a session that does not
  exist, exporting an empty session, deleting an active session, switching mode on a
  completed session, rapid sequential additions (the test awaits each call; no two calls overlap),
  and session ID collision.
- **`error-responses.test.ts`** — `T-EDG-031` to `T-EDG-035`: error message structure, error
  code consistency, whether error details are included, and that the output of `handler.validate()`
  holds no stack trace or file path. The graceful-degradation tests check that input without
  optional fields still validates and that warnings keep their suggestion text.
- **`regression.test.ts`** — `T-REG-001` to `T-REG-010`: bugs pinned so they cannot silently
  return, covering `undefined` handling in visual exporters, multi-thought visual export,
  the experimental-modes type list, `T-REG-004` (the `sequential` handler's `validate()` accepts valid
  input and rejects an empty thought; no JSON Schema or Zod schema is involved), `T-REG-005` (the
  exports tolerate missing optional properties), `T-REG-006` (10 modes have a registered handler and
  an unknown mode gets the generic handler), mode-routing accuracy, session persistence, export
  completeness, and `T-REG-010` (the handlers reject an empty thought and a bad thought number
  alike).

### Performance (4 files, 20 numbered `T-PRF-*` checks)

The performance files do not assert wall-clock time. A wall-clock bound measures how busy the
machine is, not what the code did. `tests/performance/helpers/work-probe.ts` holds two counters
that the four files use instead: `cacheLedger()` counts the exact session-cache operations
(`sets`, `hits`, `misses`, `deletes`, `evictions`) of a block of work, and `probeReads()` counts
property reads on one stored object. The counters stay the same under machine load, and a
regression changes them by a wide margin. The Vitest per-test timeout is the only wall-clock
backstop. `memory.test.ts` also asserts heap deltas, so it needs a real garbage collector.

- **`latency.test.ts`** — `T-PRF-001` to `T-PRF-005`: single-thought cost, 10-thought session,
  export cost, mode-switch cost, session-resume cost.
- **`throughput.test.ts`** — `T-PRF-006` to `T-PRF-010`: sustained thought ingestion, 10 and 50
  concurrent sessions, rapid mode switching, bulk export operations.
- **`memory.test.ts`** — `T-PRF-011` to `T-PRF-015`: memory with 100 sessions, memory with a single
  1000-thought session, memory cleanup after delete, cache effectiveness, and memory-leak
  detection. See the `NOTE on GC` comment in `vitest.config.ts`: the file calls
  `v8.setFlagsFromString` itself to get a garbage collector, because worker-thread pools reject an
  `--expose-gc` execArgv.
- **`stress.test.ts`** — `T-PRF-016` to `T-PRF-020`: 10,000 total thoughts, 100 concurrent
  sessions, rapid create and delete cycles, an extended-runtime simulation, and recovery from
  resource exhaustion.

**Benchmark skipping.** `SKIP_BENCHMARKS=1` adds `**/benchmarks/**` to the `exclude` list of
`vitest.config.ts`. The pattern matches the directory `tests/unit/benchmarks/` (2 files). It does
not match `tests/performance/`. See [Running each tier](#running-each-tier).

## 6. Test utilities

`tests/utils/` holds shared fixtures so individual test files build scenarios instead of
hand-rolling thought objects. `tests/utils/index.ts` re-exports everything, but the 21 test files
that use these helpers import the individual files (`thought-factory.ts`, `assertion-helpers.ts`
and `mock-data.ts`); none imports `index.ts`.

- **`thought-factory.ts`** — the largest helper file. Builders for the three foundational
  reasoning modes: `createInductiveThought` / `createInductiveWithObservations` /
  `...WithPattern` / `...WithGeneralization` / `...WithConfidence` /
  `...WithCounterexamples` / `...WithSampleSize` / `createCompleteInductiveThought`; the
  matching `createDeductive*` family including `createClassicSyllogism`; the matching
  `createAbductive*` family including `createCompleteAbductiveThought`. Structural helpers
  for branching (`createThoughtWithBranch`, `createRevisionThought`,
  `createThoughtWithDependencies`) and multi-step sequences (`createInductiveSequence`,
  `createDeductiveProofChain`, `createAbductiveRefinementSequence`).
- **`session-factory.ts`** — `createTestSessionManager()` returns a ready `SessionManager`
  for tests that need one without a storage backend. `session-factory.ts` is imported by no test,
  so `createTestSessionManager()` and `generateTestSessionId()` have no caller.
- **`assertion-helpers.ts`** — domain-specific assertions layered on top of `expect()`:
  mode/shape checks (`assertThoughtMode`, `assertValidBaseThought`, `assertIsRevision`,
  `assertIsBranch`), per-mode structural checks for inductive/deductive/abductive thoughts
  (`assertHasObservations`, `assertHasPremises`, `assertHasHypotheses`,
  `assertHypothesesHaveScores`, and their siblings), session checks (`assertValidSession`,
  `assertSessionHasThoughts`, `assertSessionMode`), validation-result checks
  (`assertValidationPassed`, `assertValidationFailed`, `assertHasErrorCode`,
  `assertHasWarning`), and general-purpose numeric/collection checks
  (`assertValidProbability`, `assertUniqueItems`, `assertInRange`).
- **`mock-data.ts`** — static fixture data. Only `index.ts` and six tests under
  `tests/integration/tools/` (`core-abductive`, `core-deductive`, `core-inductive`, `standard-hybrid`,
  `standard-sequential` and `standard-shannon`) import it; no factory in `tests/utils/` does:
  `SAMPLE_OBSERVATIONS`, `SAMPLE_PATTERNS`, `SAMPLE_GENERALIZATIONS`,
  `SAMPLE_COUNTEREXAMPLES`, `CONFIDENCE_LEVELS`, `SAMPLE_SIZES`, `CLASSIC_SYLLOGISMS`,
  `LOGIC_FORMS`, `SAMPLE_PREMISES`, `SAMPLE_CONCLUSIONS`, `SAMPLE_HYPOTHESES`,
  `ABDUCTIVE_OBSERVATIONS`, `BEST_EXPLANATIONS`, `SAMPLE_ASSUMPTIONS`,
  `SAMPLE_DEPENDENCIES`, `BRANCH_DATA`, `REVISION_DATA`, `UNCERTAINTY_LEVELS`, and three
  larger fixture blocks for multi-step sequences (`INDUCTIVE_SEQUENCE_DATA`,
  `DEDUCTIVE_PROOF_CHAIN_DATA`, `ABDUCTIVE_REFINEMENT_DATA`).

A contributor adding a test for inductive, deductive, or abductive reasoning should start
here rather than constructing thought objects by hand — the factories already produce
schema-valid input, and the assertion helpers already know each mode's required fields.

## 7. Gaps and risks

These are the areas with the least direct test evidence, named by file so they are easy to
act on. The statements that a file has no direct test importer come from the import graph of
`repo-tools map`. The tool counts come from the test bodies, and the exporter count comes from a
directory listing.

- **Real dispatch of `src/index.ts` covers 8 of the 13 tools.** Eight test files import
  `src/index.ts`. Between them they call `deepthinking_core`, `_standard`, `_probabilistic`, `_strategic`,
  `_scientific`, `_engineering`, `_session`, `_analyze`, and the hidden legacy `deepthinking`
  tool. `deepthinking_mathematics`, `_temporal`, `_causal`, `_analytical`, and `_academic` never
  go through the `tools/call` handler in any test. Their handlers have tests through
  `ThoughtFactory`, and their Zod schemas have tests in `tests/unit/tools/schemas/`. A fault in
  the dispatch code that is specific to one of those five tools has no test.
- **`tests/integration/index-handlers.test.ts` tests a copy.** It does not import
  `src/index.ts`, so it cannot fail when a real handler changes. The tests of the real handlers
  are the eight files that import the module.
- **Mode validators: 14 covered deeply, all 35 covered by contract.** The 14 have dedicated unit
  tests. The remaining 21 are covered by `validator-contract.test.ts`, which asserts the shared
  contract: issues carry valid severities, a minimal valid thought of the mode never throws, and
  absent optional fields are handled. A mode-specific regression in the 21 is still possible
  where it concerns the mode's own rules rather than the shared contract. The import graph shows
  those 21 files as "not imported by a test" because the contract test loads them by glob.
- **The per-mode visual exporters have no direct test importer.** The 22 per-mode files in
  `src/export/visual/modes/` are reached through `src/export/visual/modes/index.ts`. `snapshot-baseline.test.ts` pins
  the output of 21 of them (`exportHistoricalTimeline` is not imported there), and
  `mode-exporter-format-matrix.test.ts` runs the exporters through the format matrix. No file
  tests one exporter in isolation.
- **`src/taxonomy/classifier.ts` has no direct test importer.** `taxonomy-advisory.test.ts` and
  `taxonomy-wiring.test.ts` reach it through `advisory.ts`. `taxonomy-system.test.ts` does not
  import it.
- **`src/cache/index.ts` and `src/cache/types.ts` have no direct test importer.** `lru.ts`, the
  implementation, has two unit test files. `src/validation/cache.ts` is a separate cache with its
  own tests (`cache-key.test.ts`, `validation-performance.test.ts`).
- **`src/session/SessionMetricsCalculator.ts` has no direct test importer.** The session tests
  reach it through `src/session/manager.ts`. Nothing tests the calculator in isolation.
- **`src/utils/type-guards.ts` and `src/utils/logger-types.ts` have no direct test importer.**
  Both are narrow: `type-guards.ts` holds type predicates and two conversion helpers
  (`toExtendedThoughtType`, `safeCast`), and `logger-types.ts` holds the `LogLevel` enum and two
  interfaces.

## 8. Running the suite

```bash
# Everything, once, with coverage
npm run test:run

# Everything except tests/unit/benchmarks/, with coverage — used before publish
npm run test:publish

# Watch mode (re-runs on file change)
npm test

# Vitest with coverage; VITEST_REPORT_MODE is not set, so the custom reporter runs in all mode
npm run test:coverage

# A single file
npx vitest run tests/unit/modes/handlers/BayesianHandler.test.ts

# A directory
npx vitest run tests/unit/proof

# By name pattern (matches describe/it text, not file names)
npx vitest run -t "T-EDG-019"
npx vitest run -t "Bayesian"
```

`npm run test:run`, `npm run test:debug`, and `npm run test:all` set `VITEST_REPORT_MODE` to
`summary`, `debug`, and `all` before they run with coverage. The variable changes what the custom
reporter writes, not which tests run. See [Where reports land](#where-reports-land).

Coverage HTML lands in `./coverage/index.html` after any `--coverage` run; open it directly
rather than reading the JSON summary by hand.

## Verification

Generated 2026-10-23 by `repo-tools map`.
Regenerate the generated reports: `npm run docs:deps` · Check: `repo-tools check . --docs=docs/architecture`

The claims below come from `repo-tools map .`, which reads the whole repository. The generated reports in this
directory come from `tools/create-dependency-graph`, which counts files and exports with its own rules. Their
counts differ for that reason.

| Claim | Value | Source |
|---|---|---|
| totalTypeScriptFiles | 529 | repo-tools map (whole repository) |
| testOnlyFiles | 2 | repo-tools map (whole repository) |
| orphanedFiles | 12 | repo-tools map (whole repository) |

The test-file counts are **source-measured**: direct directory listings, and the file list from
`vitest list --filesOnly`. The per-area `src/` file counts come from the same listings. The counts
of files that a test imports directly come from the import graph of `repo-tools map`, which
includes the files under `tests/`. That `src/proof/` and `src/taxonomy/` are reached from
`src/index.ts` was confirmed by a walk of the same graph. The per-case descriptions of the edge-case
files in section 5 are not re-derived from the test bodies.
