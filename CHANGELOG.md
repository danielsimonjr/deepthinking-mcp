# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[2.2.0]: https://github.com/danielsimonjr/deepthinking-mcp/compare/v2.1.4...v2.2.0
[2.1.4]: https://github.com/danielsimonjr/deepthinking-mcp/compare/v2.0.1...v2.1.4
[2.0.1]: https://github.com/danielsimonjr/deepthinking-mcp/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/danielsimonjr/deepthinking-mcp/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/danielsimonjr/deepthinking-mcp/releases/tag/v1.0.0
