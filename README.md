# DeepThinking MCP v2.4

A comprehensive Model Context Protocol (MCP) server featuring **13 advanced reasoning modes** with intelligent mode recommendation for complex problem-solving, analysis, and decision-making.

## Overview

DeepThinking MCP v2.4 provides a complete toolkit for structured reasoning with 13 specialized modes and an intelligent recommendation system:

### Core Modes
- **Sequential**: Iterative refinement with revision capabilities
- **Shannon**: 5-stage systematic problem-solving methodology
- **Mathematics**: Theorem proving and symbolic computation
- **Physics**: Tensor mathematics and field theory
- **Hybrid**: Intelligently combines multiple approaches

### Advanced Modes (v2.0)
- **Abductive**: Inference to the best explanation, hypothesis generation and evaluation
- **Causal**: Cause-effect analysis with causal graphs and interventions
- **Bayesian**: Probabilistic reasoning with evidence updates
- **Counterfactual**: What-if scenario analysis and alternative histories
- **Analogical**: Cross-domain pattern matching and knowledge transfer
n### Phase 3 Modes (v2.3+)
- **Temporal**: Event timelines, temporal constraints, Allen's interval algebra, causal relations over time
- **Game Theory**: Nash equilibria, strategic analysis, payoff matrices, dominant strategies, game trees
- **Evidential**: Dempster-Shafer theory, belief functions, evidence combination, uncertainty intervals

## Features

### 13 Specialized Reasoning Modes

#### Core Modes
- **Sequential**: Iterative refinement with revision capabilities and branching
- **Shannon**: Systematic 5-stage problem-solving (problem definition → constraints → model → proof → implementation)
- **Mathematics**: Theorem proving, lemma derivation, symbolic computation
- **Physics**: Tensor formulation, dimensional analysis, conservation laws
- **Hybrid**: Intelligently combines modes based on problem characteristics

#### Advanced Reasoning Modes (v2.0)
- **Abductive**: Generate and evaluate hypotheses to explain observations. Perfect for debugging, root cause analysis, and diagnostic reasoning.
- **Causal**: Build causal graphs with nodes and edges, analyze interventions and their effects. Ideal for impact analysis and system design.
- **Bayesian**: Update beliefs using probabilistic reasoning with priors, likelihoods, and evidence. Essential for risk assessment and A/B testing.
- **Counterfactual**: Explore alternative scenarios and compare outcomes. Excellent for post-mortems and strategic planning.
- **Analogical**: Transfer knowledge across domains by identifying structural similarities. Great for design patterns and innovative problem-solving.
n#### Phase 3 Reasoning Modes (v2.3+)
- **Temporal**: Model events, intervals, and temporal relationships using Allen's interval algebra. Track causality over time with timestamps, durations, and temporal constraints. Perfect for timeline analysis, scheduling problems, and understanding event sequences.
- **Game Theory**: Analyze strategic interactions between rational agents. Define games, players, and strategies. Compute Nash equilibria (pure and mixed), identify dominant strategies, construct payoff matrices, and build extensive-form game trees. Ideal for competitive analysis, mechanism design, and strategic decision-making.
- **Evidential**: Apply Dempster-Shafer theory for reasoning with uncertain and incomplete evidence. Define hypotheses, collect evidence with reliability scores, assign belief functions with mass assignments, combine evidence using Dempster's rule, compute belief and plausibility intervals, and make decisions under uncertainty. Ideal for sensor fusion, diagnostic reasoning, intelligence analysis, and situations with incomplete information.

### Mathematical Enhancements
- **Symbolic computation** support with LaTeX and symbolic formats
- **Theorem and proof** structures
- **Lemma derivation** and corollary tracking
- **Algebraic manipulation** and numerical analysis
- **Logical form** with premises, conclusions, and inference rules

### Physics Capabilities
- **Tensor mathematics** with rank, symmetries, and invariants
- **Dimensional analysis** for unit consistency
- **Conservation law** verification
- **Field theory** context (Lagrangian, Hamiltonian, gauge symmetries)
- **Physical interpretation** with units and observables

### Session Management
- Persistent thinking sessions
- Automatic metrics tracking
- Mode switching during problem-solving
- Export to multiple formats (Markdown, LaTeX, JSON)

### Mode Recommendation System (v2.4)
- **Intelligent Mode Selection**: Automatically recommends the best reasoning modes based on problem characteristics
- **Combination Suggestions**: Identifies synergistic mode combinations for complex problems
- **Quick Recommendations**: Simple problem-type based recommendations
- **Problem Characteristics Analysis**: Analyzes domain, complexity, uncertainty, time-dependence, and more
- **Ranked Recommendations**: Returns modes sorted by suitability score with detailed reasoning

## Installation

```bash
npm install deepthinking-mcp
```

## Configuration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "deepthinking": {
      "command": "npx",
      "args": ["-y", "deepthinking-mcp"]
    }
  }
}
```

## Usage

### Basic Sequential Thinking

```
Use the deepthinking tool to help me think through this step by step...
```

The tool will automatically create a session and track your thoughts.

### Mathematical Reasoning

```
Use deepthinking in mathematics mode to prove the Pythagorean theorem...
```

### Physics Problems

```
Use deepthinking in physics mode to derive the electromagnetic tensor formulation...
```

### Hybrid Mode (Default)

```
Use deepthinking to solve this complex problem...
```

The hybrid mode automatically selects the best features from each mode.

### Mode Recommendations (v2.4)

The recommendation system helps you choose the best reasoning mode for your problem:

```
What mode should I use for debugging this application?
```

Returns: **Abductive mode** - Perfect for hypothesis generation and root cause analysis.

```
I need to analyze a competitive business scenario with multiple players. What modes should I use?
```

Returns: **Game Theory mode** for strategic analysis, potentially combined with **Counterfactual mode** for scenario exploration.

#### Problem Characteristics

The recommender analyzes:
- **Domain**: General, mathematics, physics, engineering, etc.
- **Complexity**: Low, medium, or high
- **Uncertainty**: How much unknown information exists
- **Time-dependent**: Whether events occur over time
- **Multi-agent**: Whether multiple actors interact strategically
- **Requires proof**: Whether formal mathematical proof is needed
- **Requires quantification**: Whether probabilities or measurements are needed
- **Incomplete information**: Whether data gaps exist
- **Requires explanation**: Whether understanding "why" is important
- **Has alternatives**: Whether alternative scenarios should be explored

#### Quick Recommendations

For simple cases, use problem-type keywords:
- `debugging` → Abductive mode
- `proof` → Mathematics mode
- `timeline` → Temporal mode
- `strategy` → Game Theory mode
- `uncertainty` → Evidential mode
- `causality` → Causal mode
- `probability` → Bayesian mode
- `what-if` → Counterfactual mode


## Tool Parameters

### Core Parameters
- `thought` (string, required): The thought content
- `thoughtNumber` (number, required): Position in sequence
- `totalThoughts` (number, required): Estimated total thoughts needed
- `nextThoughtNeeded` (boolean, required): Whether to continue thinking
- `mode` (string, optional): `sequential`, `shannon`, `mathematics`, `physics`, `hybrid`, `abductive`, `causal`, `bayesian`, `counterfactual`, `analogical`, or `temporal` (default: `hybrid`)

### Mode-Specific Parameters

#### Sequential Mode
- `isRevision`: Whether this revises a previous thought
- `revisesThought`: ID of thought being revised
- `revisionReason`: Why the revision was needed

#### Shannon Mode
- `stage`: Which Shannon stage (problem_definition, constraints, model, proof, implementation)
- `uncertainty`: Confidence level (0-1)
- `dependencies`: IDs of dependent thoughts
- `assumptions`: Explicit assumptions

#### Mathematics Mode
- `thoughtType`: Specific type (axiom_definition, theorem_statement, proof_construction, etc.)
- `mathematicalModel`: LaTeX and symbolic representation
- `proofStrategy`: Type and steps of proof
- `logicalForm`: Premises, conclusion, inference rules

#### Physics Mode
- `thoughtType`: Specific type (tensor_formulation, symmetry_analysis, etc.)
- `tensorProperties`: Rank, components, symmetries, invariants
- `physicalInterpretation`: Quantity, units, conservation laws
- `dimensionalAnalysis`: Unit consistency checking

#### Abductive Mode
- `observations`: Array of observations requiring explanation (id, description, confidence)
- `hypotheses`: Generated hypotheses with assumptions and predictions
- `evaluationCriteria`: Parsimony, explanatory power, plausibility, testability
- `evidence`: Supporting or contradicting evidence
- `bestExplanation`: Selected hypothesis that best explains observations

#### Causal Mode
- `causalGraph`: Nodes (causes, effects, mediators) and edges (causal relationships)
- `interventions`: Actions on nodes with expected effects
- `mechanisms`: Direct, indirect, or feedback mechanisms
- `confounders`: Variables affecting multiple nodes

#### Bayesian Mode
- `hypothesis`: Statement being evaluated
- `prior`: Prior probability with justification
- `likelihood`: P(Evidence|Hypothesis)
- `evidence`: Observations with likelihoods
- `posterior`: Updated belief after seeing evidence
- `bayesFactor`: Strength of evidence (optional)

#### Counterfactual Mode
- `actual`: The scenario that actually occurred
- `counterfactuals`: Alternative "what if" scenarios
- `interventionPoint`: Where the scenarios diverge
- `comparison`: Differences, insights, and lessons learned
- `causalChains`: Intervention → steps → outcome paths

#### Analogical Mode
- `sourceDomain`: Known domain with entities and relations
- `targetDomain`: Domain being analyzed
- `mapping`: Entity-to-entity mappings with justifications
- `insights`: Knowledge transferred from source to target
- `inferences`: Predictions based on analogical reasoning
- `limitations`: Where the analogy breaks down
- `analogyStrength`: Overall confidence in the analogy (0-1)
n#### Temporal Mode
- `timeline`: Timeline structure with id, name, timeUnit, events array
- `events`: Temporal events (instant or interval) with timestamps, duration, properties
- `intervals`: Time intervals with start, end, overlaps, contains relationships
- `constraints`: Allen's interval algebra constraints (before, after, during, overlaps, meets, starts, finishes, equals)
- `relations`: Temporal causal relations (causes, enables, prevents, precedes, follows) with strength and delay

#### Game Theory Mode
- `game`: Game definition (id, name, type, numPlayers, isZeroSum, isPerfectInformation)
- `players`: Player definitions with roles, rationality, available strategies
- `strategies`: Pure or mixed strategies with probabilities
- `payoffMatrix`: Normal-form payoff matrix with strategy profiles and payoffs
- `nashEquilibria`: Nash equilibrium solutions (pure/mixed, strict, stability)
- `dominantStrategies`: Dominant strategy analysis (strictly/weakly dominant)
- `gameTree`: Extensive-form game tree with decision, chance, and terminal nodes

#### Evidential Mode
- `frameOfDiscernment`: Set of all possible hypotheses being considered
- `hypotheses`: Hypothesis definitions (id, name, description, mutuallyExclusive, subsets)
- `evidence`: Evidence items with source, reliability (0-1), timestamp, supports, contradicts
- `beliefFunctions`: Belief function with mass assignments (hypothesisSet, mass, justification)
- `combinedBelief`: Belief function resulting from Dempster-Shafer combination (includes conflictMass)
- `plausibility`: Plausibility function with belief/plausibility values and uncertainty intervals
- `decisions`: Decision analysis (selectedHypothesis, confidence, reasoning, alternatives)

### Actions
- `add_thought` (default): Add a new thought to session
- `summarize`: Generate session summary
- `export`: Export session (requires `exportFormat`)
- `switch_mode`: Change thinking mode (requires `newMode`)
- `get_session`: Get session metadata

## Examples

### Example 1: Sequential Problem Solving

```
Thought 1: "Let me break down this optimization problem..."
- mode: sequential
- thoughtNumber: 1
- nextThoughtNeeded: true

Thought 2: "Building on my previous thought, I realize..."
- mode: sequential
- thoughtNumber: 2
- buildUpon: [thought1_id]
- nextThoughtNeeded: true

Thought 3: "Actually, let me revise my first approach..."
- mode: sequential
- isRevision: true
- revisesThought: thought1_id
- revisionReason: "Found a more efficient approach"
```

### Example 2: Mathematical Proof

```
Thought 1: "State the theorem: For all right triangles..."
- mode: mathematics
- thoughtType: theorem_statement
- mathematicalModel: { latex: "a^2 + b^2 = c^2", symbolic: "a**2 + b**2 == c**2" }

Thought 2: "Proof by construction..."
- mode: mathematics
- thoughtType: proof_construction
- proofStrategy: { type: "construction", steps: ["Draw square on each side", ...] }
```

### Example 3: Physics Tensor Analysis

```
Thought 1: "Define the electromagnetic field tensor"
- mode: physics
- thoughtType: tensor_formulation
- tensorProperties: {
    rank: [2, 0],
    components: "F^{μν} = ∂^μ A^ν - ∂^ν A^μ",
    latex: "F^{\\mu\\nu}",
    symmetries: ["antisymmetric"],
    invariants: ["F_{μν}F^{μν}"],
    transformation: "contravariant"
  }
- physicalInterpretation: {
    quantity: "Electromagnetic field strength",
    units: "GeV^2",
    conservationLaws: ["Energy-momentum", "Charge"]
  }
```

### Example 4: Abductive Reasoning (Debugging)

```
Thought 1: "System crashes at 3 AM - need to find root cause"
- mode: abductive
- observations: [
    { id: "obs1", description: "Crash at 3 AM daily", confidence: 0.95 },
    { id: "obs2", description: "Memory usage spikes before crash", confidence: 0.8 }
  ]
- hypotheses: [
    {
      id: "h1",
      explanation: "Memory leak in background job",
      assumptions: ["Job runs at 3 AM"],
      predictions: ["Memory should grow until crash"],
      score: 0.85
    },
    {
      id: "h2",
      explanation: "External service timeout",
      assumptions: ["Service maintenance window at 3 AM"],
      predictions: ["Network errors in logs"],
      score: 0.6
    }
  ]
- evaluationCriteria: {
    parsimony: 0.7,
    explanatoryPower: 0.85,
    plausibility: 0.8,
    testability: true
  }
- bestExplanation: h1
```

### Example 5: Causal Analysis (Impact Assessment)

```
Thought 1: "Analyze impact of increasing marketing budget"
- mode: causal
- causalGraph: {
    nodes: [
      { id: "marketing", name: "Marketing Budget", type: "cause" },
      { id: "awareness", name: "Brand Awareness", type: "mediator" },
      { id: "leads", name: "Lead Generation", type: "mediator" },
      { id: "revenue", name: "Revenue", type: "effect" }
    ],
    edges: [
      { from: "marketing", to: "awareness", strength: 0.8, confidence: 0.9 },
      { from: "awareness", to: "leads", strength: 0.7, confidence: 0.85 },
      { from: "leads", to: "revenue", strength: 0.9, confidence: 0.95 }
    ]
  }
- interventions: [
    {
      nodeId: "marketing",
      action: "Increase budget by 20%",
      expectedEffects: [
        { nodeId: "revenue", expectedChange: "+12%", confidence: 0.7 }
      ]
    }
  ]
```

### Example 6: Bayesian Reasoning (A/B Test Analysis)

```
Thought 1: "Evaluate if new feature increases engagement"
- mode: bayesian
- hypothesis: { id: "h1", statement: "New feature increases engagement" }
- prior: {
    probability: 0.5,
    justification: "No prior information, neutral stance"
  }
- evidence: [
    {
      id: "e1",
      description: "Test group showed 15% increase",
      likelihoodGivenHypothesis: 0.8,
      likelihoodGivenNotHypothesis: 0.2
    }
  ]
- posterior: {
    probability: 0.8,
    calculation: "P(H|E) = P(E|H) * P(H) / P(E) = 0.8 * 0.5 / 0.5 = 0.8"
  }
- bayesFactor: 4.0  // Strong evidence for hypothesis
```

### Example 7: Counterfactual Analysis (Post-Mortem)

```
Thought 1: "What if we had chosen microservices instead of monolith?"
- mode: counterfactual
- actual: {
    id: "actual",
    name: "Monolithic Architecture",
    description: "Built as single application",
    conditions: [{ factor: "Architecture", value: "Monolith" }],
    outcomes: [
      { description: "Deployment bottleneck", impact: "negative", magnitude: 0.7 },
      { description: "Fast initial development", impact: "positive", magnitude: 0.8 }
    ]
  }
- counterfactuals: [
    {
      id: "cf1",
      name: "Microservices Architecture",
      description: "Built as independent services",
      conditions: [{ factor: "Architecture", value: "Microservices" }],
      outcomes: [
        { description: "Independent deployment", impact: "positive", magnitude: 0.9 },
        { description: "Higher operational complexity", impact: "negative", magnitude: 0.6 }
      ]
    }
  ]
- interventionPoint: {
    description: "Initial architecture decision",
    alternatives: ["Monolith", "Microservices", "Modular Monolith"]
  }
- comparison: {
    differences: [
      {
        aspect: "Scalability",
        actual: "Limited",
        counterfactual: "Highly scalable",
        significance: "high"
      }
    ],
    insights: ["Microservices would have enabled better scaling"],
    lessons: ["Consider future scale requirements in architecture decisions"]
  }
```

### Example 8: Analogical Reasoning (Design Patterns)

```
Thought 1: "Apply immune system principles to cybersecurity"
- mode: analogical
- sourceDomain: {
    id: "immune",
    name: "Biological Immune System",
    entities: [
      { id: "antibody", name: "Antibody", type: "defender" },
      { id: "pathogen", name: "Pathogen", type: "threat" }
    ],
    relations: [
      { id: "r1", type: "neutralizes", from: "antibody", to: "pathogen" }
    ]
  }
- targetDomain: {
    id: "cyber",
    name: "Cybersecurity System",
    entities: [
      { id: "firewall", name: "Firewall", type: "defender" },
      { id: "malware", name: "Malware", type: "threat" }
    ],
    relations: [
      { id: "r2", type: "blocks", from: "firewall", to: "malware" }
    ]
  }
- mapping: [
    {
      sourceEntityId: "antibody",
      targetEntityId: "firewall",
      justification: "Both identify and neutralize threats",
      confidence: 0.85
    }
  ]
- insights: [
    {
      description: "Layered defense strategy",
      sourceEvidence: "Immune system has innate + adaptive layers",
      targetApplication: "Implement defense-in-depth security"
    }
  ]
- limitations: [
    "Biological systems self-heal, digital systems don't",
    "Pathogens evolve naturally, malware is designed"
  ]
- analogyStrength: 0.75
```

## Development

### Building

```bash
npm install
npm run build
```

### Testing

```bash
npm test
```

### Type Checking

```bash
npm run typecheck
```

## Architecture

```
deepthinking-mcp/
├── src/
│   ├── types/          # Type definitions
│   │   ├── core.ts     # Core thought types
│   │   └── session.ts  # Session management types
│   ├── tools/          # MCP tool definitions
│   ├── session/        # Session manager
│   ├── modes/          # Mode implementations
│   ├── validation/     # Validation logic
│   └── index.ts        # Main MCP server
├── tests/              # Test suite
├── docs/               # Documentation
└── examples/           # Usage examples
```

## Roadmap

### Phase 1 (Completed - v1.0)
- ✅ Core type system
- ✅ Session management
- ✅ Unified thinking tool
- ✅ 5 core reasoning modes

### Phase 2 (Completed - v2.0)
- ✅ Validation engine
- ✅ 5 advanced reasoning modes (Abductive, Causal, Bayesian, Counterfactual, Analogical)
- ✅ Comprehensive test suite (77 tests)
- ✅ Enhanced type safety

### Phase 3 (Future)
- [ ] Export to LaTeX/Jupyter
- [ ] Visualization (Mermaid diagrams for causal graphs)
- [ ] Math-MCP integration
- [ ] Persistence layer
- [ ] Collaborative thinking sessions
- [ ] Pattern learning from successful reasoning chains

## Contributing

Contributions welcome! Please read our contributing guidelines and submit PRs.

## License

MIT

## Credits

Built upon:
- [sequential-thinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking) by Anthropic
- [shannon-thinking](https://github.com/olaservo/shannon-thinking) by olaservo
- Enhanced for mathematical and physics reasoning by Daniel Simon Jr.

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/danielsimonjr/deepthinking-mcp/issues)
- Documentation: [Full docs](https://github.com/danielsimonjr/deepthinking-mcp/tree/main/docs)
