# DeepThinking MCP

[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io)

A comprehensive Model Context Protocol (MCP) server featuring **25 reasoning modes** (21 with dedicated thought types, 4 advanced runtime modes) including meta-reasoning for strategic oversight, with intelligent mode recommendation, taxonomy-based classification, enterprise security, and production-ready features for complex problem-solving, analysis, and decision-making.

> 📋 **Latest Release**: v6.1.2 - See [CHANGELOG](CHANGELOG.md) for updates and improvements.
>
> 🎉 **New in v6.1.x**: Fixed causal graph exports, eliminated all runtime circular dependencies, updated architecture docs.
>
> ✨ **v6.0.0+**: Meta-Reasoning mode for strategic oversight! Monitor reasoning effectiveness, get adaptive mode-switching recommendations, and assess quality metrics across 6 dimensions. v5.0.0 added Inductive and Deductive reasoning modes.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Reasoning Modes](#reasoning-modes)
- [Usage Examples](#usage-examples)
- [Production Features](#production-features)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

- **25 Specialized Reasoning Modes** - From sequential thinking to game theory, formal logic, and meta-reasoning (21 with full thought types, 4 advanced runtime modes)
- **Meta-Reasoning (NEW!)** - Strategic oversight that monitors effectiveness, recommends mode switches, and assesses quality
- **Adaptive Mode Switching** - Automatic evaluation-based mode switching when effectiveness drops below thresholds
- **Intelligent Mode Recommendation** - Automatic mode selection based on problem characteristics
- **Taxonomy Classifier** - 69 reasoning types across 12 categories for intelligent task classification (110 planned)
- **Visual Exports** - Generate Mermaid diagrams, DOT graphs, ASCII art, and LaTeX documents with meta-insights
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

DeepThinking MCP provides 10 focused tools for different reasoning domains:

| Tool | Modes | Description |
|------|-------|-------------|
| `deepthinking_core` | inductive, deductive, abductive | Fundamental reasoning |
| `deepthinking_standard` | sequential, shannon, hybrid | Standard workflow modes |
| `deepthinking_math` | mathematics, physics | Mathematical/scientific reasoning |
| `deepthinking_temporal` | temporal | Time-based reasoning |
| `deepthinking_probabilistic` | bayesian, evidential | Probabilistic reasoning |
| `deepthinking_causal` | causal, counterfactual | Cause-effect analysis |
| `deepthinking_strategic` | gametheory, optimization | Strategic reasoning |
| `deepthinking_analytical` | analogical, firstprinciples, metareasoning | Analytical reasoning |
| `deepthinking_scientific` | scientificmethod, systemsthinking, formallogic | Scientific reasoning |
| `deepthinking_session` | - | Session management (summarize, export, switch_mode) |

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

The server supports 25 reasoning modes organized into categories:

- **Core Modes (5)**: Sequential, Shannon, Mathematics, Physics, Hybrid
- **Advanced Runtime Modes (6)**: Metareasoning, Recursive, Modal, Stochastic, Constraint, Optimization
- **Fundamental Modes (2)**: Inductive, Deductive
- **Experimental Modes (12)**: Abductive, Causal, Bayesian, Counterfactual, Analogical, Temporal, Game Theory, Evidential, First Principles, Systems Thinking, Scientific Method, Formal Logic

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

#### Abductive
Generate and evaluate hypotheses to explain observations.

```typescript
mode: 'abductive'
// Use for: Debugging, root cause analysis, diagnostic reasoning
```

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

#### Meta-Reasoning ⭐ NEW
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

- **Input Validation** - Zod schemas validate all 25+ mode inputs
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
| `export` | `sessionId`, `exportFormat` | Export to format (json, markdown, latex, html, jupyter, mermaid, dot, ascii) |
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
| TypeScript Files | 190 |
| Lines of Code | ~52,000 |
| Test Files | 36 |
| Passing Tests | 745 |
| Thinking Modes | 25 (21 with thought types) |
| MCP Tools | 10 focused + 1 legacy |
| Export Formats | 8 |
| Reasoning Types | 69 (110 planned) |
| Modules | 25 |
| Total Exports | 535 |

## Architecture

The codebase is organized into 25 modules with clean separation of concerns. See [docs/architecture/DEPENDENCY_GRAPH.md](docs/architecture/DEPENDENCY_GRAPH.md) for the complete dependency graph.

### Core Structure

```
src/
├── index.ts           # MCP server entry point (tool handlers)
├── types/             # Type definitions including 25 mode types
│   ├── core.ts        # ThinkingMode enum, Thought union type
│   └── modes/         # One file per reasoning mode (17 files)
├── services/          # Business logic layer
│   ├── ThoughtFactory.ts    # Thought creation and validation
│   ├── ExportService.ts     # Multi-format export handling
│   └── ModeRouter.ts        # Mode switching and recommendations
├── session/           # SessionManager, persistence, storage
├── modes/             # Advanced reasoning implementations (6 files)
└── tools/             # MCP tool definitions and schemas
```

### Feature Modules

```
src/
├── taxonomy/          # 69 reasoning types, classifier, suggestion engine
│   ├── reasoning-types.ts   # Full taxonomy definitions
│   ├── classifier.ts        # Task classification
│   └── suggestion-engine.ts # Mode recommendations
├── export/            # Visual and document exporters
│   ├── visual/        # 19 mode-specific visual exporters
│   └── latex.ts       # LaTeX document generation
├── search/            # Full-text search with faceted filtering
├── batch/             # Batch processing (8 operations)
├── backup/            # Backup manager with provider abstraction
├── cache/             # LRU/LFU/FIFO caching strategies
├── rate-limit/        # Sliding window rate limiter
├── validation/        # Zod schemas (25+ mode validators)
├── comparison/        # Session comparison & diff generation
├── templates/         # Session templates with usage tracking
├── analytics/         # Analytics engine and dashboard
├── webhooks/          # Event-driven webhook system
├── collaboration/     # Annotations and conflict resolution
└── ml/                # Pattern recognition & recommendations
```

### Security Features

Security is built into multiple modules:

- **validation/** - Input validation with Zod schemas for all 25 modes
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
