# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.2] - 2025-11-16

### Performance
- **Incremental Metrics Calculation**: Optimized session metrics to use O(1) incremental calculation instead of O(n)
  - Average uncertainty now calculated using running totals
  - Significantly faster for large sessions (>500 thoughts)
  - Benchmark shows 1.19x ratio between 500 and 1000 thoughts (true O(1) behavior)

### Testing
- Added comprehensive performance benchmark suite
  - Correctness verification for incremental calculations
  - Complexity analysis to verify O(1) behavior
  - 159 tests passing (including 2 new benchmark tests)

### Code Quality
- Removed legacy core-old.ts file
- Added internal fields to SessionMetrics interface for performance tracking

### Technical Details
- Package size: 74.74 KB
- All tests passing

---


## [2.5.1] - 2025-11-16

### Fixed
- **Server Version Sync**: Server metadata now correctly displays version from package.json instead of hardcoded '1.0.0'
  - Added dynamic import of package.json version
  - Server name also synced with package.json
- **SessionManager Syntax Error**: Fixed missing closing braces in updateMetrics() method (lines 267-314)
  - Added missing closing brace for temporal block (after line 266)
  - Added missing closing brace for game theory block (after line 289)
  - Removed two extra closing braces (lines 315-316)

### Technical Details
- No functional changes to features
- Critical bug fixes only
- All 157 tests passing
- Package size: 74.67 KB

---

## [2.5.0] - 2025-11-16

### Added

#### New Feature: Visual Export Formats (Phase 3E)
- **Visual Diagram Exports**: Export reasoning sessions as visual diagrams in multiple formats
  - `VisualExporter` class with 4 main export methods
  - Support for Mermaid, DOT (Graphviz), and ASCII formats
  - Visual exports for causal graphs, temporal timelines, game trees, and Bayesian networks

#### Export Formats
- **Mermaid Format**:
  - Flowcharts for causal graphs with color-coded nodes
  - Gantt charts for temporal timelines
  - Decision trees for game theory analysis
  - Network diagrams for Bayesian reasoning
  - Compatible with GitHub, documentation generators, and Markdown renderers
- **DOT Format**:
  - Graphviz-compatible output for professional graph visualization
  - Customizable node shapes based on semantic types
  - Edge labels showing metrics (strength, probabilities)
  - Suitable for publications and technical documentation
- **ASCII Format**:
  - Plain text diagrams for terminal output
  - Human-readable timeline representations
  - Compatible with logs and text-based documentation
  - Accessibility-friendly format

#### Supported Visual Export Modes
- **Causal Mode**: Export causal graphs with node types (causes, effects, mediators, confounders)
  - Node shapes vary by type: stadium for causes, double boxes for effects, rectangles for mediators, diamonds for confounders
  - Edge labels show causal strength (0-1 scale)
  - Color coding by node type (blue for causes, red for effects, yellow for mediators)
- **Temporal Mode**: Export timelines as Gantt charts or ASCII timelines
  - Instant events shown as milestones (⦿)
  - Interval events shown with duration bars (━)
  - Time units configurable (milliseconds, seconds, minutes, hours, days, months, years)
- **Game Theory Mode**: Export game trees with strategies and payoffs
  - Decision nodes, chance nodes, and terminal nodes
  - Action labels on edges
  - Payoff values at terminal nodes
- **Bayesian Mode**: Export Bayesian networks showing probability flow
  - Prior, evidence, hypothesis, and posterior nodes
  - Probability values displayed
  - Bayes factor shown
  - Evidence flow visualization

#### Visual Export Options
- **Color Schemes**:
  - `default`: Vibrant colors (blue causes, red effects, yellow mediators)
  - `pastel`: Soft pastel colors for presentations
  - `monochrome`: No colors for print or accessibility
- **Configurable Options**:
  - `includeLabels`: Show/hide node and edge labels
  - `includeMetrics`: Display strength values, probabilities, and other metrics

#### Implementation Components
- `src/export/visual.ts`: Complete VisualExporter class (600+ lines)
  - `exportCausalGraph()`: 3 format implementations
  - `exportTemporalTimeline()`: 3 format implementations
  - `exportGameTree()`: 3 format implementations
  - `exportBayesianNetwork()`: 3 format implementations
  - 12 private format-specific methods (e.g., `causalGraphToMermaid()`, `gameTreeToDOT()`)
  - Node sanitization for diagram compatibility
  - Color scheme management
  - Shape mapping by node type
- `src/index.ts`: Export action integration
  - Extended `handleExport()` to route visual formats
  - Format detection for mermaid/dot/ascii
  - Mode-based routing to appropriate visual exporter
  - Fallback to standard exports (json, markdown, latex, html, jupyter)
- `src/tools/thinking.ts`: Schema updates
  - Extended `exportFormat` enum: added 'mermaid', 'dot', 'ascii'
  - Updated Zod schema and JSON schema

#### Testing
- `tests/unit/visual.test.ts`: 13 comprehensive tests
  - Causal Graph Exports (3 tests): Mermaid, DOT, ASCII format validation
  - Temporal Timeline Exports (3 tests): Gantt chart, ASCII, DOT format validation
  - Game Theory Exports (2 tests): Mermaid and ASCII game tree rendering
  - Bayesian Network Exports (2 tests): Mermaid and ASCII network diagrams
  - Export Options (3 tests): color schemes, metrics inclusion, error handling
- **Total test count: 157 tests (145 → 157)**

#### Documentation
- Updated README.md to v2.5
- Added "Visual Exports (v2.5)" feature section with:
  - Supported formats and modes documentation
  - Visual export examples (Mermaid causal graph, ASCII timeline, DOT game tree)
  - Color scheme options
  - Integration guidance (GitHub, Graphviz, documentation generators)
- Updated roadmap to show Phase 3E completion
- Added visual export capabilities to overview

### Changed
- Extended export action to support 8 total formats (json, markdown, latex, html, jupyter, mermaid, dot, ascii)
- Package size: 55.78 KB → 74.50 KB (33% increase due to visual export implementations)
- Refactored `handleExport()` function to route visual and standard exports separately

### Fixed
- Game tree action labels: Fixed to use child node's action property instead of parent node's
  - Applied fix to both `gameTreeToMermaid()` and `gameTreeToDOT()` methods
  - Ensures action labels appear correctly on game tree edges

### Technical Details
- Lines of code: ~600 new lines for visual export system
- Test coverage: 13 new tests, all passing
- API: 4 public export methods on VisualExporter class
- Type safety: Full TypeScript coverage with strict typing
- Format support: 3 visual formats × 4 reasoning modes = 12 export combinations


## [2.4.0] - 2025-11-16

### Added

#### New Feature: Mode Recommendation System (Phase 3D)
- **Intelligent Mode Selection**: Automatically recommends the best reasoning modes based on problem characteristics
  - `ModeRecommender` class with three recommendation methods
  - `recommendModes()`: Returns ranked mode recommendations with scores, reasoning, strengths, limitations, and examples
  - `recommendCombinations()`: Suggests synergistic mode combinations (parallel, sequential, or hybrid)
  - `quickRecommend()`: Simple problem-type based recommendations using keyword mapping
  
#### Problem Characteristics Analysis
- **ProblemCharacteristics** interface with 10 dimensions:
  - Domain (general, mathematics, physics, engineering, etc.)
  - Complexity (low, medium, high)
  - Uncertainty level (low, medium, high)
  - Time-dependent (boolean)
  - Multi-agent (boolean)
  - Requires proof (boolean)
  - Requires quantification (boolean)
  - Has incomplete info (boolean)
  - Requires explanation (boolean)
  - Has alternatives (boolean)

#### Mode Recommendation Logic
- **Temporal Mode**: Recommended for time-dependent problems (score: 0.9)
- **Game Theory Mode**: Recommended for multi-agent strategic interactions (score: 0.85)
- **Evidential Mode**: Recommended for incomplete information + high uncertainty (score: 0.88)
- **Abductive Mode**: Recommended when explanation is needed (score: 0.87)
- **Causal Mode**: Recommended for time-dependent + explanation problems (score: 0.86)
- **Bayesian Mode**: Recommended for quantification + uncertainty (score: 0.84)
- **Counterfactual Mode**: Recommended when alternatives exist (score: 0.82)
- **Analogical Mode**: Recommended for high complexity + explanation (score: 0.80)
- **Mathematics Mode**: Recommended when proof is required (score: 0.95)
- **Physics Mode**: Recommended for physics/engineering domains (score: 0.90)
- **Shannon Mode**: Recommended for high complexity + proof (score: 0.88)
- **Sequential Mode**: Default fallback mode (score: 0.70)

#### Combination Recommendations
- **Temporal + Causal**: Sequential combination for timeline → causal analysis
- **Abductive + Bayesian**: Sequential combination for hypotheses → probabilities
- **Game Theory + Counterfactual**: Hybrid combination for equilibria → scenarios
- **Evidential + Causal**: Parallel combination for uncertain evidence + causality
- **Temporal + Game Theory**: Sequential for events → strategic analysis
- **Analogical + Abductive**: Parallel for creative + systematic hypothesis generation
- **Shannon + Mathematics**: Hybrid for structured complex proofs

#### Implementation Components
- `src/types/modes/recommendations.ts`: Complete type definitions
  - `ProblemCharacteristics` interface
  - `ModeRecommendation` interface with score, reasoning, strengths, limitations, examples
  - `CombinationRecommendation` interface with modes, sequence, rationale, benefits, synergies
  - `ModeRecommender` class with full recommendation logic
- Moved from `src/modes/recommendations.ts` to `src/types/modes/` for better organization

#### Code Organization
- **Type Refactoring**: Created separate type definition files in `src/types/modes/`:
  - `sequential.ts`: SequentialThought interface with branching and iteration control
  - `shannon.ts`: ShannonThought interface with 5-stage methodology
  - `mathematics.ts`: MathematicsThought with proofs and theorems
  - `physics.ts`: PhysicsThought with tensor properties and field theory
  - `causal.ts`: CausalThought with causal graphs and interventions
  - `bayesian.ts`: BayesianThought with priors, likelihoods, and posteriors
  - `counterfactual.ts`: CounterfactualThought with scenarios and comparisons
  - `analogical.ts`: AnalogicalThought with domain mapping and insights
- Core reasoning modes (Inductive, Deductive, Abductive) remain in `core.ts` for backward compatibility
- All mode files exported from `src/types/index.ts`

#### Testing
- `tests/unit/recommendations.test.ts`: 15 comprehensive tests
  - Single mode recommendations: temporal, game theory, evidential, abductive (4 tests)
  - Mode combinations: temporal+causal, abductive+bayesian (2 tests)
  - Mode scoring correctness and ranking (1 test)
  - Quick recommendations with case-insensitivity (2 tests)
  - Recommendation quality and fallback behavior (2 tests)
  - Combination synergies and sequence types (2 tests)
  - Edge cases: domain-specific recommendations (2 tests)
- All 15 tests passing
- Total test count: 145 tests (129 before + 15 new + 1 additional)

#### Documentation
- Updated README.md to v2.4
- Added "Mode Recommendation System (v2.4)" feature section
- Added "Mode Recommendations (v2.4)" usage section with examples
- Documented problem characteristics analysis
- Provided quick recommendation keyword mapping
- Updated version references from v2.3 to v2.4
- Changed mode count from "11" to "13 Specialized Reasoning Modes"

### Changed
- Enhanced hybrid mode preparation for integration with recommendation engine (planned for future update)
- Reorganized type definitions for better maintainability
- Improved code organization with separate mode type files

### Technical Details
- Lines of code: ~300 new lines for recommendation system
- Test coverage: 15 new tests, all passing
- API: Three public methods on ModeRecommender class
- Type safety: Full TypeScript coverage with strict typing


## [2.3.0] - 2025-11-15

### Added

#### New Reasoning Mode: Evidential (Phase 3C)
- **Evidential Reasoning Mode**: Dempster-Shafer theory for uncertain and incomplete evidence
  - Frame of discernment for hypothesis space definition
  - Hypothesis modeling with mutually exclusive and composite hypotheses
  - Evidence collection with reliability scores (0-1) and timestamp tracking
  - Belief functions with basic probability mass assignments
  - Dempster's rule of combination for evidence fusion
  - Conflict mass computation and normalization
  - Belief and plausibility interval calculations
  - Uncertainty interval representation [belief, plausibility]
  - Decision analysis under uncertainty with confidence scores
  - Support for sensor fusion, diagnostic reasoning, intelligence analysis

#### Implementation Components
- `src/types/modes/evidential.ts`: Complete type definitions
  - `EvidentialThought` interface with 5 thought types
  - 9 supporting interfaces: Hypothesis, Evidence, BeliefFunction, MassAssignment, PlausibilityFunction, PlausibilityAssignment, Decision, Alternative
  - Type guard: `isEvidentialThought()`
- `src/validation/validator.ts`: Evidential validation
  - `validateEvidential()` method (200+ lines)
  - Validates hypothesis subsets, evidence reliability, mass assignments
  - Belief function mass sum validation (must equal 1.0)
  - Plausibility consistency checks (belief ≤ plausibility)
  - Uncertainty interval validation
  - Decision hypothesis reference validation
- `src/tools/thinking.ts`: Zod schemas for runtime validation
- `src/session/manager.ts`: Evidential metrics tracking
  - totalHypotheses, totalEvidence, avgEvidenceReliability
  - beliefFunctions, hasCombinedBelief, conflictMass
  - decisions tracking
- `src/index.ts`: createThought() integration for evidential mode

#### Testing
- `tests/unit/evidential.test.ts`: 17 comprehensive tests
  - Type guard validation (1 test)
  - Hypothesis validation (2 tests)
  - Evidence validation (3 tests)
  - Belief function validation (4 tests)
  - Plausibility validation (3 tests)
  - Decision validation (2 tests)
  - Complete sensor fusion example (2 tests)
- **Total test count: 130 tests (113 → 130)**

#### Documentation
- Updated README.md to v2.3
- Added evidential mode to Phase 3 Modes section
- Complete parameter documentation for all evidential fields
- Updated mode count from 12 to 13 modes

### Changed
- Extended `ThinkingMode` enum to include 'evidential'
- Updated `Thought` union type to include `EvidentialThought`
- Mode count: 12 → 13 reasoning modes


## [2.2.0] - 2025-11-15

### Added

#### New Reasoning Mode: Game Theory (Phase 3B)
- **Game-Theoretic Reasoning Mode**: Strategic analysis with Nash equilibria and payoff matrices
  - Game definitions: normal-form, extensive-form, cooperative, non-cooperative
  - Player modeling with rational agents and available strategies
  - Pure and mixed strategies with probability distributions
  - Payoff matrix representation with strategy profiles
  - Nash equilibrium detection (pure and mixed)
  - Dominant strategy analysis (strictly/weakly dominant)
  - Game tree structures for extensive-form games
  - Information sets for imperfect information games
  - Support for zero-sum and general-sum games
  - Perfect and imperfect information modeling

#### Implementation Components
- `src/types/modes/gametheory.ts`: Complete type definitions
  - `GameTheoryThought` interface with 5 thought types
  - 11 supporting interfaces: Game, Player, Strategy, PayoffMatrix, PayoffEntry, NashEquilibrium, DominantStrategy, GameTree, GameNode, InformationSet, BackwardInduction
  - Type guard: `isGameTheoryThought()`
- `src/validation/validator.ts`: Game theory validation
  - `validateGameTheory()` method (240+ lines)
  - Validates player counts, strategy references, probability ranges
  - Payoff matrix dimension checking
  - Nash equilibria validation
  - Game tree structure validation with node references
  - Terminal node payoff verification
- `src/tools/thinking.ts`: Zod schemas for runtime validation
- `src/session/manager.ts`: Game theory metrics tracking
  - numPlayers, totalStrategies, mixedStrategies
  - nashEquilibria, pureNashEquilibria, dominantStrategies
  - gameType, isZeroSum tracking
- `src/index.ts`: createThought() integration for gametheory mode

#### Testing
- `tests/unit/gametheory.test.ts`: 17 comprehensive tests
  - Type guard validation (2 tests)
  - Game definition validation (2 tests)
  - Player validation (3 tests)
  - Strategy validation (3 tests)
  - Payoff matrix validation (2 tests)
  - Nash equilibria validation (2 tests)
  - Game tree validation (2 tests)
  - Complete Prisoner's Dilemma example (1 test)
- **Total test count: 113 tests (96 → 113)**

#### Documentation
- Updated README.md to v2.2
- Added game theory mode to Phase 3 Modes section
- Complete parameter documentation for all game theory fields
- Updated mode count from 11 to 12 modes

### Fixed
- Validation dispatch bug: `validateGameTheory()` was not being called for game theory thoughts
  - Fixed empty dispatch block in `src/validation/validator.ts:69-71`
  - All 17 game theory tests now pass

### Changed
- Extended `ThinkingMode` enum to include 'gametheory'
- Updated `Thought` union type to include `GameTheoryThought`
- Mode count: 11 → 12 reasoning modes

## [2.1.4] - 2025-11-15

### Added

#### New Reasoning Mode: Temporal (Phase 3A)
- **Temporal Reasoning Mode**: Event timelines and temporal constraints using Allen's interval algebra
  - Temporal events (instant and interval types)
  - Time intervals with Allen's algebra relationships (before, after, during, overlaps, meets, starts, finishes, equals)
  - Temporal constraints with confidence levels
  - Causal and enabling relations between events (causes, enables, prevents, precedes, follows)
  - Timeline structures with configurable time units
  - Temporal relation strength (0-1) and time delays

#### Implementation Components
- `src/types/modes/temporal.ts`: Complete type definitions
  - `TemporalThought` interface with 5 thought types
  - Supporting interfaces: TemporalEvent, TemporalInterval, TemporalRelation, TemporalConstraint, Timeline
  - Type guard: `isTemporalThought()`
- `src/validation/validator.ts`: Temporal validation
  - `validateTemporal()` method
  - Validates event timestamps, interval ordering, constraint references
  - Relation strength and confidence validation
  - Timeline structure validation
- `src/tools/thinking.ts`: Zod schemas for temporal parameters
- `src/session/manager.ts`: Temporal metrics tracking
  - totalEvents, instantEvents, intervalEvents
  - temporalRelations, temporalConstraints, hasTimeline
- `src/index.ts`: createThought() integration for temporal mode

#### Testing
- `tests/unit/temporal.test.ts`: 19 comprehensive tests
  - Type guard validation
  - Event validation (instant and interval types)
  - Interval validation (start < end constraint)
  - Relation validation (strength ranges, event references)
  - Constraint validation (Allen's algebra types, confidence levels)
  - Timeline validation (event references, time units)
  - Complete temporal analysis example
- **Total test count: 96 tests (77 → 96)**

#### Documentation
- Updated README.md to v2.1
- Added temporal mode to Phase 3 Modes section
- Complete parameter documentation for temporal reasoning
- Updated mode count from 10 to 11 modes

### Changed
- Extended `ThinkingMode` enum to include 'temporal'
- Updated `Thought` union type to include `TemporalThought`
- Mode count: 10 → 11 reasoning modes

## [2.0.1] - 2025-11-14

### Fixed
- **Session Manager**: Fixed null reference error when accessing `dependencies.length` in metrics update
  - Added defensive null checking before accessing array properties
  - Error occurred when new reasoning modes (abductive, causal, bayesian, counterfactual, analogical) were tested
  - Location: `src/session/manager.ts:237-241`
  - Issue: `'in' operator check was insufficient - now includes explicit null validation

### Changed
- Build size: 18.57 KB (minimal increase from 18.54 KB)

## [2.0.0] - 2025-11-14

### Added

#### New Reasoning Modes
- **Abductive Reasoning Mode**: Inference to the best explanation with hypothesis generation and evaluation
  - Observation tracking with confidence levels
  - Hypothesis generation with assumptions and predictions
  - Evaluation criteria: parsimony, explanatory power, plausibility, testability
  - Evidence tracking (supporting/contradicting)
  - Best explanation selection

- **Causal Reasoning Mode**: Cause-effect analysis with causal graphs
  - Causal graph structure with nodes (causes, effects, mediators, confounders) and edges
  - Edge properties: strength (-1 to 1), confidence (0-1)
  - Intervention analysis with expected effects
  - Causal mechanisms (direct, indirect, feedback)
  - Cycle detection for graph validation

- **Bayesian Reasoning Mode**: Probabilistic reasoning with evidence updates
  - Prior probability with justification
  - Likelihood calculations P(E|H) and P(E|¬H)
  - Posterior probability computation
  - Bayes factor for evidence strength
  - Sensitivity analysis support

- **Counterfactual Reasoning Mode**: What-if scenario analysis
  - Actual scenario tracking
  - Multiple counterfactual scenarios
  - Intervention point specification
  - Comparison analysis (differences, insights, lessons)
  - Causal chain tracking

- **Analogical Reasoning Mode**: Cross-domain pattern matching
  - Source and target domain modeling
  - Entity and relation mapping
  - Structural similarity assessment
  - Insight transfer
  - Analogical inference generation
  - Limitation identification
  - Analogy strength scoring

#### Validation Engine Enhancements
- `validateAbductive()`: Validates observations, hypotheses, evaluation criteria, and best explanation
- `validateCausal()`: Validates causal graphs, detects cycles, checks interventions
- `validateBayesian()`: Validates probability ranges, Bayes factor, evidence likelihoods
- `validateCounterfactual()`: Validates scenarios, intervention points, comparisons
- `validateAnalogical()`: Validates domain mappings, entity references, analogy strength
- Causal graph cycle detection algorithm with feedback loop support

#### Testing
- `tests/unit/abductive.test.ts`: 10 comprehensive tests for abductive reasoning
- `tests/unit/causal.test.ts`: 10 tests including cycle detection and intervention validation
- `tests/unit/bayesian.test.ts`: 10 tests for probability calculations and Bayes factors
- `tests/unit/counterfactual.test.ts`: 8 tests for scenario analysis
- `tests/unit/analogical.test.ts`: 9 tests for domain mapping and analogies
- Updated `tests/unit/types.test.ts` with 5 new type guard tests
- **Total test count increased from 61 to 77 tests**

#### Documentation
- Comprehensive README updates with all 10 modes documented
- 8 detailed examples (one for each reasoning mode)
- Parameter documentation for all new modes
- `docs/REASONING_MODES_IMPLEMENTATION_PLAN.md`: Complete architectural design
- `docs/IMPLEMENTATION_TASKS.md`: Detailed task breakdown with code snippets

#### Type System
- 50+ new TypeScript interfaces for advanced reasoning modes
- Type guards: `isAbductiveThought`, `isCausalThought`, `isBayesianThought`, `isCounterfactualThought`, `isAnalogicalThought`
- Extended `ThinkingMode` enum from 6 to 11 values
- Enhanced tool schema with all new mode parameters

### Changed
- Updated package description to reflect 10 reasoning modes
- Enhanced tool schema description with comprehensive mode documentation
- Updated README roadmap to show Phase 2 completion
- Expanded npm keywords for better discoverability

### Deprecated
- None

### Removed
- None

### Fixed
- None

### Security
- None

## [1.0.0] - 2024-11-14

### Added
- Initial release with 5 core reasoning modes:
  - Sequential thinking with revision capabilities
  - Shannon's 5-stage systematic methodology
  - Mathematical reasoning with theorem proving
  - Physics mode with tensor mathematics
  - Hybrid mode combining multiple approaches
- Session management with persistence
- Validation engine for core modes
- Comprehensive type system
- Tool parameter validation
- Export functionality (summarize, export, get_session actions)
- Mode switching capabilities
- 25 unit tests covering all core functionality

### Core Features
- MCP server implementation
- Zod schema validation
- JSON Schema for tool definitions
- TypeScript type safety
- Build system with tsup
- Testing with Vitest
- Git repository initialization
- npm package publication
- GitHub repository setup

[2.5.0]: https://github.com/danielsimonjr/deepthinking-mcp/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/danielsimonjr/deepthinking-mcp/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/danielsimonjr/deepthinking-mcp/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/danielsimonjr/deepthinking-mcp/compare/v2.1.4...v2.2.0
[2.1.4]: https://github.com/danielsimonjr/deepthinking-mcp/compare/v2.0.1...v2.1.4
[2.0.1]: https://github.com/danielsimonjr/deepthinking-mcp/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/danielsimonjr/deepthinking-mcp/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/danielsimonjr/deepthinking-mcp/releases/tag/v1.0.0
