# DeepThinking MCP

[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io)

A comprehensive Model Context Protocol (MCP) server featuring **33 reasoning modes** (29 with dedicated thought types, 4 advanced runtime modes) including meta-reasoning for strategic oversight, with intelligent mode recommendation, taxonomy-based classification, enterprise security, and production-ready features for complex problem-solving, analysis, and decision-making.

> 📋 **Latest Release**: v8.3.1 - See [CHANGELOG](CHANGELOG.md) for updates and improvements.
>
> 🎉 **New in v8.3.x**: Multi-instance support with file locking, dependency graph tool with unused code detection, codebase cleanup.
>
> ✨ **v8.2.x**: Phase 10 ModeHandler Architecture! 7 specialized handlers with advanced validation and enhancements - Systems Archetypes detection, Socratic question framework, automatic Bayesian posterior calculation, Nash equilibria computation.
>
> ✨ **v8.0.0**: ModeHandler infrastructure with Strategy pattern for mode-specific processing.
>
> ✨ **v7.5.0**: All 29 modes with dedicated thought types accessible via 12 focused MCP tools.
>
> ✨ **v7.4.0**: Academic Research Modes - Synthesis (literature review), Argumentation (Toulmin model), Critique (peer review), Analysis (qualitative methods).

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Reasoning Modes](#reasoning-modes)
- [Proof Decomposition](#proof-decomposition)
- [Usage Examples](#usage-examples)
- [Production Features](#production-features)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

- **33 Specialized Reasoning Modes** - From sequential thinking to game theory, formal logic, and meta-reasoning (29 with full thought types, 4 advanced runtime modes)
- **ModeHandler Architecture (v8.x)** - Strategy pattern with 7 specialized handlers providing advanced validation and enhancements
- **Specialized Handler Enhancements** - Systems Archetypes (8 patterns), Socratic Questions (6 categories), auto Bayesian posteriors, Nash equilibria
- **Academic Research Modes** - Synthesis (literature review), Argumentation (Toulmin), Critique (peer review), Analysis (qualitative methods)
- **Algorithmic Reasoning** - Comprehensive CLRS coverage with 100+ named algorithms, complexity analysis, design patterns
- **Historical Computing Extensions** - Computability (Turing machines), Cryptanalytic (decibans), extended Game Theory (von Neumann)
- **Proof Decomposition** - Break proofs into atomic statements, detect gaps, track assumption chains
- **Native SVG Export** - Direct SVG generation without external tools for proof visualizations
- **Meta-Reasoning** - Strategic oversight that monitors effectiveness, recommends mode switches, and assesses quality
- **Adaptive Mode Switching** - Automatic evaluation-based mode switching when effectiveness drops below thresholds
- **Intelligent Mode Recommendation** - Automatic mode selection based on problem characteristics
- **Taxonomy Classifier** - 69 reasoning types across 12 categories for intelligent task classification (110 planned)
- **Visual Exports** - Generate Mermaid diagrams, DOT graphs, ASCII art, SVG graphics, and LaTeX documents
- **Production-Ready** - Search engine, templates, batch processing, caching, backup/restore
- **Enterprise Security** - Input validation (Zod), rate limiting, path sanitization, PII redaction
- **High Performance** - LRU caching with auto-eviction, async I/O, 4-5x validation speedups
- **Type-Safe** - 100% TypeScript with zero suppressions (down from 231 baseline)
- **Repository Pattern** - Clean architecture with dependency injection
- **Extensible** - Plugin architecture for custom reasoning modes
- **MCP Compatible** - Full integration with Model Context Protocol

## Installation

### NPM Package

```bash
npm install deepthinking-mcp
```

### From Source

```bash
git clone https://github.com/danielsimonjr/deepthinking-mcp.git
cd deepthinking-mcp
npm install
npm run build
```

### MCP Configuration

Add to your MCP settings file:

```json
{
  "mcpServers": {
    "deepthinking": {
      "command": "npx",
      "args": ["deepthinking-mcp"]
    }
  }
}
```

## Quick Start

### MCP Tool Usage

DeepThinking MCP provides 12 focused tools for different reasoning domains:

| Tool | Modes | Description |
|------|-------|-------------|
| `deepthinking_core` | inductive, deductive, abductive | Fundamental reasoning |
| `deepthinking_standard` | sequential, shannon, hybrid | Standard workflow modes |
| `deepthinking_mathematics` | mathematics, physics, computability | Math/physics/computability |
| `deepthinking_temporal` | temporal | Time-based reasoning |
| `deepthinking_probabilistic` | bayesian, evidential | Probabilistic reasoning |
| `deepthinking_causal` | causal, counterfactual | Cause-effect analysis |
| `deepthinking_strategic` | gametheory, optimization | Strategic reasoning |
| `deepthinking_analytical` | analogical, firstprinciples, metareasoning, cryptanalytic | Analytical reasoning |
| `deepthinking_scientific` | scientificmethod, systemsthinking, formallogic | Scientific reasoning |
| `deepthinking_engineering` | engineering, algorithmic | Engineering/algorithmic |
| `deepthinking_academic` | synthesis, argumentation, critique, analysis | Academic research |
| `deepthinking_session` | - | Session management |

### Example: Sequential Reasoning

```json
{
  "tool": "deepthinking_standard",
  "arguments": {
    "mode": "sequential",
    "thought": "First, identify the main bottlenecks in the distributed system",
    "thoughtNumber": 1,
    "totalThoughts": 5,
    "nextThoughtNeeded": true
  }
}
```

### Example: Causal Analysis

```json
{
  "tool": "deepthinking_causal",
  "arguments": {
    "mode": "causal",
    "thought": "Analyzing the root cause of the service outage",
    "thoughtNumber": 1,
    "totalThoughts": 3,
    "nextThoughtNeeded": true,
    "causalGraph": {
      "nodes": [
        {"id": "n1", "name": "High Load", "type": "cause"},
        {"id": "n2", "name": "Memory Exhaustion", "type": "mediator"},
        {"id": "n3", "name": "Service Crash", "type": "effect"}
      ],
      "edges": [
        {"from": "n1", "to": "n2", "strength": 0.9},
        {"from": "n2", "to": "n3", "strength": 0.95}
      ]
    }
  }
}
```

### Example: Session Export

```json
{
  "tool": "deepthinking_session",
  "arguments": {
    "action": "export",
    "sessionId": "session-123",
    "exportFormat": "markdown"
  }
}
```

## Reasoning Modes

The server supports 33 reasoning modes organized into categories:

- **Core Modes (5)**: Sequential, Shannon, Mathematics, Physics, Hybrid
- **Historical Computing (2)**: Computability (Turing), Cryptanalytic (Turing) - *v7.2.0*
- **Algorithmic (1)**: Algorithmic (CLRS) - *v7.3.0*
- **Academic Research (4)**: Synthesis, Argumentation, Critique, Analysis - *v7.4.0*
- **Advanced Runtime Modes (6)**: Metareasoning, Recursive, Modal, Stochastic, Constraint, Optimization
- **Fundamental Modes (3)**: Inductive, Deductive, Abductive
- **Experimental Modes (12)**: Causal, Bayesian, Counterfactual, Analogical, Temporal, Game Theory (+ von Neumann extensions), Evidential, First Principles, Systems Thinking, Scientific Method, Formal Logic, Engineering

### Core Modes

#### Sequential
Iterative refinement with revision capabilities. Perfect for step-by-step problem solving.

```typescript
mode: 'sequential'
// Use for: Debugging, algorithmic thinking, systematic analysis
```

#### Shannon
5-stage systematic problem-solving methodology (problem → constraints → model → proof → implementation).

```typescript
mode: 'shannon'
// Use for: Engineering problems, system design, complex optimizations
```

#### Mathematics
Theorem proving, lemma derivation, symbolic computation with LaTeX support.

```typescript
mode: 'mathematics'
// Use for: Proofs, mathematical modeling, symbolic algebra
```

#### Physics
Tensor mathematics, dimensional analysis, conservation laws, field theory.

```typescript
mode: 'physics'
// Use for: Physical modeling, dimensional analysis, scientific computing
```

#### Hybrid
Intelligently combines multiple reasoning modes based on problem characteristics.

```typescript
mode: 'hybrid'
// Use for: Complex multi-faceted problems requiring diverse approaches
```

### Advanced Modes

#### Causal
Build causal graphs, analyze interventions and effects.

```typescript
mode: 'causal'
// Use for: Impact analysis, system design, decision making
```

#### Bayesian
Probabilistic reasoning with priors, likelihoods, and evidence updates.

```typescript
mode: 'bayesian'
// Use for: Risk assessment, A/B testing, uncertainty quantification
```

#### Counterfactual
Explore alternative scenarios and compare outcomes.

```typescript
mode: 'counterfactual'
// Use for: Post-mortems, strategic planning, what-if analysis
```

#### Analogical
Transfer knowledge across domains by identifying structural similarities.

```typescript
mode: 'analogical'
// Use for: Design patterns, innovative problem-solving, knowledge transfer
```

### Specialized Modes

#### Temporal
Model events, intervals, and temporal relationships using Allen's interval algebra.

```typescript
mode: 'temporal'
// Use for: Timeline analysis, scheduling, event sequencing
```

#### Game Theory
Analyze strategic interactions, compute Nash equilibria, build game trees.

```typescript
mode: 'game-theory'
// Use for: Competitive analysis, mechanism design, strategic decisions
```

#### Evidential
Dempster-Shafer theory for reasoning with uncertain evidence.

```typescript
mode: 'evidential'
// Use for: Sensor fusion, intelligence analysis, incomplete information
```

#### First Principles
Derive conclusions from foundational axioms using deductive reasoning.

```typescript
mode: 'first-principles'
// Use for: Fundamental analysis, conceptual understanding, basic truths
```

#### Meta-Reasoning
Strategic oversight of reasoning process - monitors effectiveness, recommends mode switches, assesses quality.

```typescript
mode: 'metareasoning'
// Use for: Strategy evaluation, adaptive mode switching, quality assessment
// Metrics: Effectiveness, Efficiency, Confidence, Quality (6 dimensions)
// Auto-switches at effectiveness < 0.3
```

See [full documentation](docs/modes/METAREASONING.md) for detailed usage.

#### Systems Thinking
Holistic analysis of complex systems, feedback loops, and emergence.

```typescript
mode: 'systems-thinking'
// Use for: Complex systems, organizational design, ecosystem analysis
```

#### Scientific Method
Hypothesis-driven experimentation with research design and statistical analysis.

```typescript
mode: 'scientific-method'
// Use for: Experimental design, hypothesis testing, research
```

#### Optimization
Constraint satisfaction and optimization with decision variables.

```typescript
mode: 'optimization'
// Use for: Resource allocation, scheduling, constrained optimization
```

#### Formal Logic
Rigorous logical reasoning with formal systems and proof verification.

```typescript
mode: 'formal-logic'
// Use for: Proof verification, logical analysis, formal methods
```

### Advanced Runtime Modes

#### Recursive
Recursive problem decomposition - break complex problems into smaller subproblems.

```typescript
mode: 'recursive'
// Use for: Divide-and-conquer, tree-structured problems, recursive algorithms
```

#### Modal
Possibility and necessity reasoning using modal logic.

```typescript
mode: 'modal'
// Use for: What's possible vs necessary, requirement analysis, constraint exploration
```

#### Stochastic
Probabilistic state transitions and Markov chain reasoning.

```typescript
mode: 'stochastic'
// Use for: Process modeling, state machines, probabilistic sequences
```

#### Constraint
Constraint satisfaction problem solving.

```typescript
mode: 'constraint'
// Use for: Scheduling, resource allocation, constraint propagation
```

### Fundamental Modes

#### Inductive
Reasoning from specific observations to general principles.

```typescript
mode: 'inductive'
// Use for: Pattern recognition, generalization, empirical reasoning
```

#### Deductive
Reasoning from general principles to specific conclusions.

```typescript
mode: 'deductive'
// Use for: Logical proofs, applying rules, deriving conclusions
```

#### Abductive
Generate and evaluate hypotheses to explain observations.

```typescript
mode: 'abductive'
// Use for: Debugging, root cause analysis, diagnostic reasoning
```

### Historical Computing Modes (v7.2.0)

Tributes to Alan Turing and John von Neumann's foundational work.

#### Computability
Turing machines, decidability proofs, reductions, and diagonalization arguments.

```typescript
mode: 'computability'
// Use for: Decidability analysis, algorithm limits, computational complexity
// Features: Turing machine simulation, reduction chains, halting problem analysis
```

#### Cryptanalytic
Turing's deciban evidence system from Bletchley Park.

```typescript
mode: 'cryptanalytic'
// Use for: Evidence quantification, hypothesis testing, code-breaking analysis
// Features: Deciban accumulation (10 db ≈ 10:1 odds), frequency analysis, Banburismus
```

#### Extended Game Theory (v7.2.0)
Von Neumann's minimax theorem, cooperative games, and Shapley values.

```typescript
mode: 'gametheory'
// Enhanced with: Minimax analysis, cooperative game theory, coalition analysis
// Use for: Zero-sum games, fair value distribution, strategic decision-making
```

### Algorithmic Mode (v7.3.0)

#### Algorithmic
Comprehensive coverage of algorithms from "Introduction to Algorithms" (CLRS) with 100+ named algorithms.

```typescript
mode: 'algorithmic'
// Use for: Algorithm design, complexity analysis, correctness proofs
// Features: Divide-and-conquer, dynamic programming, greedy, graph algorithms
// Coverage: Sorting, searching, graph, string, computational geometry
```

### Academic Research Modes (v7.4.0)

Designed for PhD students and scientific paper writing.

#### Synthesis
Literature review and knowledge integration.

```typescript
mode: 'synthesis'
// Use for: Literature reviews, theme extraction, knowledge integration
// Features: Source synthesis, pattern identification, gap analysis
```

#### Argumentation
Academic argumentation using the Toulmin model.

```typescript
mode: 'argumentation'
// Use for: Building arguments, dialectical reasoning, rhetorical analysis
// Features: Toulmin model (claim, data, warrant, backing), counter-arguments
```

#### Critique
Critical analysis and peer review frameworks.

```typescript
mode: 'critique'
// Use for: Peer review, methodology evaluation, evidence assessment
// Features: Systematic critique, strengths/weaknesses analysis
```

#### Analysis
Qualitative analysis methods.

```typescript
mode: 'analysis'
// Use for: Thematic analysis, grounded theory, discourse analysis
// Features: Multiple qualitative analysis frameworks, coding support
```

### Specialized Mode Handlers (v8.x)

Phase 10 introduced 7 specialized handlers with advanced validation and enhancements:

| Handler | Mode | Key Enhancements |
|---------|------|------------------|
| **CausalHandler** | causal | Validates graph structure, detects cycles, propagates interventions |
| **BayesianHandler** | bayesian | Auto-calculates posteriors from prior × likelihood, validates probability sums |
| **GameTheoryHandler** | gametheory | Validates payoff matrix dimensions, computes Nash equilibria |
| **CounterfactualHandler** | counterfactual | Tracks world states, validates divergence points, compares outcomes |
| **SynthesisHandler** | synthesis | Tracks source coverage, validates theme extraction, detects contradictions |
| **SystemsThinkingHandler** | systemsthinking | Detects 8 Systems Archetypes, adds warning signs and interventions |
| **CritiqueHandler** | critique | 6 Socratic question categories for rigorous critical analysis |

#### Systems Archetypes Detection

SystemsThinkingHandler automatically detects Peter Senge's 8 archetypes:

- **Fixes that Fail** - Short-term fixes with unintended consequences
- **Shifting the Burden** - Symptomatic vs fundamental solutions
- **Limits to Growth** - Growth hitting constraints
- **Success to the Successful** - Winner-take-all dynamics
- **Tragedy of the Commons** - Shared resource depletion
- **Escalation** - Competitive escalation spirals
- **Accidental Adversaries** - Alliance deterioration
- **Growth and Underinvestment** - Capacity constraints

#### Socratic Question Framework

CritiqueHandler uses Richard Paul's 6 categories:

- **Clarification** - "What do you mean by...?"
- **Assumptions** - "What are you assuming?"
- **Evidence** - "What evidence supports this?"
- **Perspectives** - "Are there alternative viewpoints?"
- **Implications** - "What are the consequences?"
- **Meta** - "Why is this question important?"

## Proof Decomposition

**New in v7.0.0!** The proof decomposition system provides advanced mathematical reasoning capabilities:

### Components

| Component | Purpose |
|-----------|---------|
| **ProofDecomposer** | Breaks proofs into atomic statements with dependency tracking |
| **GapAnalyzer** | Detects missing steps, unjustified leaps, and implicit assumptions |
| **AssumptionTracker** | Traces conclusions back to their supporting assumptions |
| **InconsistencyDetector** | Detects circular dependencies and contradictions |
| **MathematicsReasoningEngine** | Integrated proof analysis with improvement suggestions |

### Features

- **Atomic Statement Types**: axiom, hypothesis, definition, derived, lemma, conclusion
- **Inference Rules**: algebraic_manipulation, substitution, modus_ponens, universal_instantiation, etc.
- **Gap Detection**: Identify missing steps with severity levels (minor, significant, critical)
- **Rigor Levels**: informal, textbook, rigorous, formal
- **Visual Export**: Mermaid, DOT, ASCII, and native SVG formats

### Example: Proof Analysis

```json
{
  "tool": "deepthinking_mathematics",
  "arguments": {
    "mode": "mathematics",
    "thought": "Analyzing the proof that n² is even when n is even",
    "thoughtNumber": 1,
    "totalThoughts": 3,
    "nextThoughtNeeded": true,
    "proofDecomposition": {
      "theorem": "If n is even, then n² is even",
      "atoms": [
        {"id": "a1", "content": "n is an even integer", "type": "hypothesis"},
        {"id": "a2", "content": "n = 2k for some integer k", "type": "definition"},
        {"id": "a3", "content": "n² = 4k² = 2(2k²)", "type": "derived"},
        {"id": "a4", "content": "n² is even", "type": "conclusion"}
      ],
      "dependencies": {
        "nodes": ["a1", "a2", "a3", "a4"],
        "edges": [
          {"from": "a1", "to": "a2"},
          {"from": "a2", "to": "a3"},
          {"from": "a3", "to": "a4"}
        ]
      }
    }
  }
}
```

### Visual Export Formats

Export proof decompositions to multiple visual formats:

```typescript
// Native SVG (no external tools required)
exportProofDecomposition(decomposition, {
  format: 'svg',
  colorScheme: 'default',  // 'default' | 'pastel' | 'monochrome'
  includeMetrics: true,
  svgWidth: 1200,
  svgHeight: 800
});

// Mermaid diagram
exportProofDecomposition(decomposition, { format: 'mermaid' });

// GraphViz DOT
exportProofDecomposition(decomposition, { format: 'dot' });

// ASCII text
exportProofDecomposition(decomposition, { format: 'ascii' });
```

## Usage Examples

### Example 1: Debugging with Abductive Reasoning

```json
// Step 1: Start with observation
{
  "tool": "deepthinking_core",
  "arguments": {
    "mode": "abductive",
    "thought": "Observed: Users report intermittent 500 errors on checkout during high traffic periods",
    "thoughtNumber": 1,
    "totalThoughts": 4,
    "nextThoughtNeeded": true,
    "observations": ["Errors occur during high traffic", "Checkout page affected", "Intermittent pattern"]
  }
}

// Step 2: Generate hypothesis
{
  "tool": "deepthinking_core",
  "arguments": {
    "sessionId": "session-from-step-1",
    "mode": "abductive",
    "thought": "Hypothesis: Database connection pool exhaustion under load",
    "thoughtNumber": 2,
    "totalThoughts": 4,
    "nextThoughtNeeded": true,
    "hypotheses": [{
      "id": "h1",
      "explanation": "Connection pool exhausted",
      "assumptions": ["Fixed pool size", "No connection recycling"],
      "predictions": ["Errors correlate with traffic spikes"],
      "score": 0.8
    }]
  }
}
```

### Example 2: Impact Analysis with Causal Reasoning

```json
{
  "tool": "deepthinking_causal",
  "arguments": {
    "mode": "causal",
    "thought": "Analyzing impact of increasing API rate limits on system behavior",
    "thoughtNumber": 1,
    "totalThoughts": 3,
    "nextThoughtNeeded": true,
    "causalGraph": {
      "nodes": [
        {"id": "rate_limit", "name": "Rate Limit", "type": "cause", "description": "API rate limit setting"},
        {"id": "server_load", "name": "Server Load", "type": "mediator", "description": "CPU/Memory usage"},
        {"id": "response_time", "name": "Response Time", "type": "effect", "description": "API latency"},
        {"id": "satisfaction", "name": "User Satisfaction", "type": "effect", "description": "User experience"}
      ],
      "edges": [
        {"from": "rate_limit", "to": "server_load", "strength": 0.9, "confidence": 0.85},
        {"from": "server_load", "to": "response_time", "strength": 0.85, "confidence": 0.9},
        {"from": "response_time", "to": "satisfaction", "strength": -0.7, "confidence": 0.8}
      ]
    }
  }
}
```

### Example 3: Strategic Analysis with Game Theory

```json
{
  "tool": "deepthinking_strategic",
  "arguments": {
    "mode": "gametheory",
    "thought": "Analyzing pricing strategy in competitive market using game theory",
    "thoughtNumber": 1,
    "totalThoughts": 3,
    "nextThoughtNeeded": true,
    "game": {
      "type": "strategic",
      "players": ["Company A", "Company B"],
      "strategies": {
        "Company A": ["premium", "competitive", "discount"],
        "Company B": ["premium", "competitive", "discount"]
      },
      "payoffMatrix": [
        [{"A": 10, "B": 10}, {"A": 5, "B": 15}, {"A": 2, "B": 12}],
        [{"A": 15, "B": 5}, {"A": 8, "B": 8}, {"A": 4, "B": 10}],
        [{"A": 12, "B": 2}, {"A": 10, "B": 4}, {"A": 6, "B": 6}]
      ]
    }
  }
}
```

## Production Features

> **Note**: DeepThinking MCP is an MCP server, not a library. These features are accessed through MCP tools and internal architecture. The examples below describe the internal capabilities.

### Proof Decomposition (v7.0.0)

Advanced mathematical reasoning with proof analysis:

- **ProofDecomposer**: Break proofs into atomic statements with dependency graphs
- **GapAnalyzer**: Detect missing steps, unjustified leaps, implicit assumptions
- **AssumptionTracker**: Trace conclusions to their supporting assumptions
- **InconsistencyDetector**: Find circular dependencies and contradictions
- **Native SVG Export**: Generate proof visualizations without external tools

### Search Engine

Full-text search with faceted filtering and relevance ranking. Used internally to search across reasoning sessions by mode, tags, date ranges, and content.

### Template System

Pre-built templates for common reasoning patterns, accessible through session creation.

### Batch Processing

Process multiple sessions concurrently with 8 operation types:

- **export** - Batch export sessions to various formats
- **import** - Batch import sessions from files
- **analyze** - Batch taxonomy/quality/pattern analysis
- **validate** - Batch session validation
- **transform** - Batch mode switching, merging, splitting
- **index** - Batch search/analytics indexing
- **backup** - Batch backup with compression
- **cleanup** - Batch cleanup of old/incomplete sessions

### Backup & Restore

Automated backup with compression and local storage, with support for multiple providers (Local, S3, GCS, Azure).

### Session Comparison

Compare reasoning sessions to analyze differences and similarities with quantitative metrics.

### Security & Validation

Enterprise-grade security features built into the MCP server:

- **Input Validation** - Zod schemas validate all 33 mode inputs
- **Rate Limiting** - Sliding window rate limiter for API protection
- **Path Sanitization** - Prevents directory traversal attacks
- **PII Redaction** - GDPR-compliant log sanitization

### Taxonomy Classifier

Intelligent classification of reasoning tasks using 69 reasoning types across 12 categories. Use the `recommend_mode` action in `deepthinking_session` to get mode recommendations based on problem characteristics.

## API Documentation

### MCP Tool Interface

All reasoning is done through MCP tools. Each tool accepts arguments and returns JSON responses.

#### Common Parameters (all thinking tools)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sessionId` | string | No | Session ID (auto-created if omitted) |
| `thought` | string | Yes | The reasoning content |
| `thoughtNumber` | integer | Yes | Current thought number (1-based) |
| `totalThoughts` | integer | Yes | Estimated total thoughts |
| `nextThoughtNeeded` | boolean | Yes | Whether more reasoning needed |
| `mode` | string | Yes | The reasoning mode |

#### Session Actions (`deepthinking_session`)

| Action | Parameters | Description |
|--------|------------|-------------|
| `summarize` | `sessionId` | Generate session summary |
| `export` | `sessionId`, `exportFormat` | Export to format (json, markdown, latex, html, jupyter, mermaid, dot, ascii, svg) |
| `get_session` | `sessionId` | Get session details |
| `switch_mode` | `sessionId`, `newMode` | Switch reasoning mode |
| `recommend_mode` | `problemType` or `problemCharacteristics` | Get mode recommendations |

#### Example Response

```json
{
  "sessionId": "session-abc123",
  "thoughtId": "thought-xyz789",
  "thoughtNumber": 1,
  "mode": "sequential",
  "nextThoughtNeeded": true,
  "sessionComplete": false,
  "totalThoughts": 3
}
```

For architecture details, see [docs/architecture/](docs/architecture/).

## Project Stats

| Metric | Value |
|--------|-------|
| TypeScript Files | 197 |
| Lines of Code | ~80,336 |
| Test Files | 39 |
| Passing Tests | 1046+ |
| Thinking Modes | 33 (29 with thought types) |
| Specialized Handlers | 7 |
| MCP Tools | 12 focused + 1 legacy |
| Export Formats | 8 (including native SVG) |
| Visual Exporters | 35+ mode-specific files |
| Reasoning Types | 69 (110 planned) |
| Modules | 16 |
| Total Exports | 1033 (448 re-exports) |

## Architecture

The codebase is organized into 16 modules with clean separation of concerns. See [docs/architecture/DEPENDENCY_GRAPH.md](docs/architecture/DEPENDENCY_GRAPH.md) for the complete dependency graph.

### Core Structure

```
src/
├── index.ts           # MCP server entry point (tool handlers)
├── types/             # Type definitions including 33 mode types
│   ├── core.ts        # ThinkingMode enum, Thought union type
│   └── modes/         # One file per reasoning mode (26 files)
├── services/          # Business logic layer
│   ├── ThoughtFactory.ts    # Thought creation with handler integration
│   ├── ExportService.ts     # Multi-format export handling
│   └── ModeRouter.ts        # Mode switching and recommendations
├── session/           # SessionManager, persistence, storage
├── modes/             # ModeHandler architecture (v8.x)
│   ├── handlers/            # 7 specialized handlers
│   │   ├── CausalHandler.ts
│   │   ├── BayesianHandler.ts
│   │   ├── GameTheoryHandler.ts
│   │   ├── CounterfactualHandler.ts
│   │   ├── SynthesisHandler.ts
│   │   ├── SystemsThinkingHandler.ts
│   │   └── CritiqueHandler.ts
│   └── base/                # ModeHandler interface, registry
├── proof/             # Proof decomposition system (v7.0.0)
│   ├── decomposer.ts        # ProofDecomposer class
│   ├── gap-analyzer.ts      # GapAnalyzer class
│   └── assumption-tracker.ts # AssumptionTracker class
├── reasoning/         # Reasoning engines (v7.0.0)
│   └── inconsistency-detector.ts  # InconsistencyDetector class
└── tools/             # MCP tool definitions and schemas
```

### ModeHandler Architecture (v8.x)

Phase 10 introduced the ModeHandler pattern (Strategy pattern) for mode-specific processing:

```typescript
// Handler interface
interface ModeHandler {
  mode: ThinkingMode;
  validate(input: ThinkingToolInput): ValidationResult;
  enhance(thought: Thought, context: SessionContext): Thought;
  getSuggestions(thought: Thought): string[];
}

// Registry manages all handlers
const registry = ModeHandlerRegistry.getInstance();
registry.hasSpecializedHandler('causal'); // true for 7 modes
```

**Benefits:**
- Specialized validation logic per mode
- Automatic enhancements (posteriors, equilibria, archetypes)
- Mode-specific suggestions and warnings
- Clean separation from ThoughtFactory switch statement

### Feature Modules

```
src/
├── taxonomy/          # 69 reasoning types, classifier, suggestion engine
│   ├── reasoning-types.ts   # Full taxonomy definitions
│   ├── classifier.ts        # Task classification
│   └── suggestion-engine.ts # Mode recommendations
├── export/            # Visual and document exporters
│   ├── visual/        # 21 mode-specific visual exporters + native SVG
│   │   ├── proof-decomposition.ts  # Proof visualization (v7.0.0)
│   │   └── [19 mode exporters]     # Mermaid, DOT, ASCII, SVG
│   └── latex.ts       # LaTeX document generation
├── search/            # Full-text search with faceted filtering
├── batch/             # Batch processing (8 operations)
├── backup/            # Backup manager with provider abstraction
├── cache/             # LRU/LFU/FIFO caching strategies
├── rate-limit/        # Sliding window rate limiter
├── validation/        # Zod schemas (31+ mode validators)
├── comparison/        # Session comparison & diff generation
├── templates/         # Session templates with usage tracking
├── analytics/         # Analytics engine and dashboard
├── webhooks/          # Event-driven webhook system
├── collaboration/     # Annotations and conflict resolution
└── ml/                # Pattern recognition & recommendations
```

### Security Features

Security is built into multiple modules:

- **validation/** - Input validation with Zod schemas for all 33 modes
- **utils/sanitization.ts** - Path sanitization & traversal prevention
- **utils/log-sanitizer.ts** - PII redaction for GDPR compliance
- **rate-limit/** - Per-key rate limiting with sliding windows
- **utils/errors.ts** - Standardized error hierarchy with context

## Contributing

We welcome contributions! Please open an issue or pull request on [GitHub](https://github.com/danielsimonjr/deepthinking-mcp).

### Adding New Reasoning Modes

Want to add a new reasoning mode? We've made it easy:

📖 **[Complete Guide: Adding a New Mode](docs/ADDING_NEW_MODE.md)**

This guide includes:
- Step-by-step instructions for all 8 required files
- Template files in `templates/mode-scaffolding/`
- Code examples and common patterns
- Complete checklist to ensure nothing is missed
- Testing guidelines

**Quick Start**:
```bash
# Copy template files
cp templates/mode-scaffolding/example-mode.type.ts src/types/modes/yourmode.ts
cp templates/mode-scaffolding/example-mode.validator.ts src/validation/validators/modes/yourmode.ts

# Follow the guide
cat docs/ADDING_NEW_MODE.md
```

### Development Setup

```bash
# Clone repository
git clone https://github.com/danielsimonjr/deepthinking-mcp.git
cd deepthinking-mcp

# Install dependencies
npm install

# Run tests
npm test

# Run type checking
npm run typecheck

# Build
npm run build
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test.test.ts

# Run with coverage
npm run test:coverage
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built on the [Model Context Protocol](https://modelcontextprotocol.io)
- Inspired by research in cognitive science and AI reasoning
- Community contributions from researchers and practitioners

## Support

- 📚 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/danielsimonjr/deepthinking-mcp/issues)
- 💬 [Discussions](https://github.com/danielsimonjr/deepthinking-mcp/discussions)

---

Made with ❤️ by the DeepThinking MCP team
