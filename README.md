# DeepThinking MCP

[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io)

A comprehensive Model Context Protocol (MCP) server featuring **18 advanced reasoning modes** with intelligent mode recommendation, visual export capabilities, high-performance validation caching, and production-ready features for complex problem-solving, analysis, and decision-making.

> 📋 **Latest Release**: v3.4.5 - See [CHANGELOG](CHANGELOG.md) for updates and improvements.

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

- **18 Specialized Reasoning Modes** - From sequential thinking to game theory and formal logic
- **Intelligent Mode Recommendation** - Automatic mode selection based on problem characteristics
- **Visual Exports** - Generate Mermaid diagrams, DOT graphs, ASCII art, and LaTeX documents
- **Production-Ready** - Search engine, templates, batch processing, caching, backup/restore
- **High Performance** - LRU validation caching with 4-5x speedups
- **Type-Safe** - 100% TypeScript with zero suppressions
- **Extensible** - Plugin architecture for custom reasoning modes
- **MCP Compatible** - Full integration with Model Context Protocol

## Installation

### NPM Package

```bash
npm install deepthinking-mcp
```

### From Source

```bash
git clone https://github.com/yourusername/deepthinking-mcp.git
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

### Basic Usage

```typescript
import { DeepThinkingServer } from 'deepthinking-mcp';

const server = new DeepThinkingServer();

// Start a sequential reasoning session
const session = await server.startThinking({
  mode: 'sequential',
  problem: 'Analyze the scalability challenges of a distributed system'
});

// Add thoughts iteratively
await server.addThought(session.id, {
  content: 'First, identify the main bottlenecks...'
});

// Export results
const markdown = await server.exportSession(session.id, 'markdown');
```

### MCP Tool Usage

```typescript
// Use via MCP protocol
{
  "tool": "start_thinking",
  "arguments": {
    "mode": "causal",
    "problem": "What caused the service outage?"
  }
}
```

## Reasoning Modes

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

## Usage Examples

### Example 1: Debugging with Abductive Reasoning

```typescript
const session = await server.startThinking({
  mode: 'abductive',
  problem: 'Users report intermittent 500 errors on checkout'
});

await server.addThought(session.id, {
  content: 'Observed: Errors occur during high traffic periods',
  type: 'observation'
});

await server.addThought(session.id, {
  content: 'Hypothesis 1: Database connection pool exhaustion',
  type: 'hypothesis',
  likelihood: 0.8
});

const analysis = await server.analyzeSession(session.id);
// Returns ranked hypotheses with supporting evidence
```

### Example 2: Impact Analysis with Causal Reasoning

```typescript
const session = await server.startThinking({
  mode: 'causal',
  problem: 'Impact of increasing API rate limits'
});

await server.addThought(session.id, {
  content: 'Build causal graph',
  causalGraph: {
    nodes: ['rate_limit', 'server_load', 'response_time', 'user_satisfaction'],
    edges: [
      { from: 'rate_limit', to: 'server_load', strength: 0.9 },
      { from: 'server_load', to: 'response_time', strength: 0.85 }
    ]
  }
});

const intervention = await server.analyzeIntervention(session.id, {
  variable: 'rate_limit',
  change: '+50%'
});
// Returns predicted effects on downstream variables
```

### Example 3: Strategic Analysis with Game Theory

```typescript
const session = await server.startThinking({
  mode: 'game-theory',
  problem: 'Pricing strategy in competitive market'
});

await server.addThought(session.id, {
  content: 'Define game structure',
  game: {
    players: ['us', 'competitor'],
    strategies: {
      us: ['premium', 'competitive', 'discount'],
      competitor: ['premium', 'competitive', 'discount']
    },
    payoffs: {
      // Payoff matrix for each strategy combination
    }
  }
});

const equilibria = await server.findNashEquilibria(session.id);
// Returns Nash equilibria and dominant strategies
```

## Production Features

### Search Engine

Full-text search with faceted filtering, autocomplete, and relevance ranking.

```typescript
const results = await server.search({
  query: 'machine learning optimization',
  facets: ['mode', 'tags'],
  filters: {
    modes: ['optimization', 'mathematics'],
    dateRange: { from: new Date('2024-01-01') }
  }
});
```

### Template System

Pre-built templates for common reasoning patterns.

```typescript
const templates = await server.listTemplates({
  category: 'problem-solving',
  difficulty: 'beginner'
});

const session = await server.instantiateTemplate(templates[0].id, {
  title: 'My Analysis',
  context: 'Specific problem details...'
});
```

### Batch Processing

Process multiple sessions concurrently with job tracking.

```typescript
const jobId = await server.submitBatchJob({
  type: 'export',
  sessionIds: ['session-1', 'session-2', 'session-3'],
  format: 'latex'
});

const status = await server.getJobStatus(jobId);
```

### Backup & Restore

Automated backup with compression and cloud storage support.

```typescript
const backupManager = new BackupManager({
  provider: 'local',
  config: { path: './backups' }
});

const backupId = await backupManager.backup(session);
const restored = await backupManager.restore(backupId);
```

### Session Comparison

Compare reasoning sessions to analyze differences and similarities.

```typescript
const comparison = await server.compareSessions(session1, session2);

console.log(comparison.similarity); // 0-1 scale
console.log(comparison.differences); // Detailed diff
console.log(comparison.metrics); // Quantitative metrics
```

## API Documentation

### Core Methods

#### `startThinking(options)`

Start a new thinking session.

**Parameters:**
- `mode` (string): Reasoning mode to use
- `problem` (string): Problem description
- `context?` (object): Additional context

**Returns:** `Promise<ThinkingSession>`

#### `addThought(sessionId, thought)`

Add a thought to an existing session.

**Parameters:**
- `sessionId` (string): Session identifier
- `thought` (object): Thought content and metadata

**Returns:** `Promise<Thought>`

#### `exportSession(sessionId, format)`

Export session to specified format.

**Parameters:**
- `sessionId` (string): Session identifier
- `format` ('markdown' | 'latex' | 'json' | 'mermaid' | 'dot' | 'ascii'): Export format

**Returns:** `Promise<string>`

### Advanced Methods

#### `recommendMode(problem, characteristics)`

Get intelligent mode recommendations.

**Parameters:**
- `problem` (string): Problem description
- `characteristics?` (object): Problem characteristics

**Returns:** `Promise<ModeRecommendation[]>`

#### `validateSession(sessionId)`

Validate session structure and content.

**Parameters:**
- `sessionId` (string): Session identifier

**Returns:** `Promise<ValidationResult>`

For complete API documentation, see [API.md](docs/API.md).

## Architecture

### Taxonomy System

Intelligent reasoning type classification and navigation.

```
taxonomy/
├── reasoning-types.ts  # 100+ reasoning type definitions
├── navigator.ts        # Query and exploration
├── suggestion-engine.ts # Mode recommendations
└── adaptive-selector.ts # Dynamic mode selection
```

### Export Formats

Multiple visualization and document formats.

```
exports/
├── latex/      # LaTeX document generation
├── markdown/   # Markdown formatting
├── mermaid/    # Mermaid diagrams
├── dot/        # Graphviz DOT graphs
└── ascii/      # ASCII art visualizations
```

### Production Systems

Enterprise-ready features for production deployment.

```
production/
├── search/     # Full-text search engine
├── templates/  # Session templates
├── batch/      # Batch processing
├── cache/      # High-performance caching
├── backup/     # Backup & restore
└── comparison/ # Session comparison
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/deepthinking-mcp.git
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
- 🐛 [Issue Tracker](https://github.com/yourusername/deepthinking-mcp/issues)
- 💬 [Discussions](https://github.com/yourusername/deepthinking-mcp/discussions)
- 📧 Email: support@example.com

---

Made with ❤️ by the DeepThinking MCP team
