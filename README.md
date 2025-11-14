# DeepThinking MCP

A unified Model Context Protocol (MCP) server that combines **sequential thinking**, **Shannon's systematic methodology**, and **mathematical reasoning** with specialized support for physics and tensor mathematics.

## Overview

DeepThinking MCP merges the best approaches from:
- **Sequential-thinking** (Anthropic): Iterative refinement and revision
- **Shannon-thinking**: 5-stage systematic problem-solving
- **Mathematical reasoning**: Theorem proving and symbolic computation
- **Physics support**: Tensor mathematics and field theory

## Features

### Multiple Thinking Modes
- **Sequential**: Iterative refinement with revision capabilities
- **Shannon**: Systematic 5-stage problem-solving (problem definition → constraints → model → proof → implementation)
- **Mathematics**: Theorem proving, lemma derivation, symbolic computation
- **Physics**: Tensor formulation, dimensional analysis, conservation laws
- **Hybrid**: Intelligently combines modes based on problem characteristics

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

## Tool Parameters

### Core Parameters
- `thought` (string, required): The thought content
- `thoughtNumber` (number, required): Position in sequence
- `totalThoughts` (number, required): Estimated total thoughts needed
- `nextThoughtNeeded` (boolean, required): Whether to continue thinking
- `mode` (string, optional): `sequential`, `shannon`, `mathematics`, `physics`, or `hybrid` (default)

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

### Phase 1 (Current)
- ✅ Core type system
- ✅ Session management
- ✅ Unified thinking tool
- ✅ Multiple mode support

### Phase 2 (Next)
- [ ] Validation engine
- [ ] Export to LaTeX/Jupyter
- [ ] Visualization (Mermaid diagrams)
- [ ] Math-MCP integration

### Phase 3 (Future)
- [ ] Persistence layer
- [ ] Collaborative thinking
- [ ] Pattern learning
- [ ] Plugin system

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
