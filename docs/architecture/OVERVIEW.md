# DeepThinking MCP - User Guide

## What is DeepThinking MCP?

DeepThinking MCP is a **Model Context Protocol (MCP) server** that provides advanced reasoning capabilities for AI assistants like Claude. It offers **18 specialized thinking modes** to help solve complex problems through structured reasoning.

**Version**: 4.3.0 | **Node**: >=18.0.0

---

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/deepthinking-mcp.git
cd deepthinking-mcp

# Install dependencies
npm install

# Build
npm run build
```

### Configuration

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "deepthinking": {
      "command": "node",
      "args": ["/path/to/deepthinking-mcp/dist/index.js"]
    }
  }
}
```

---

## Core Concepts

### Thinking Sessions

A **session** represents a problem-solving context. Each session has:
- A **title** describing the problem
- A **thinking mode** (e.g., sequential, mathematics, causal)
- A collection of **thoughts** that build the solution
- **Metrics** tracking progress and quality

### Thoughts

A **thought** is a single reasoning step within a session. Thoughts include:
- **Content**: The actual reasoning text
- **Thought number**: Position in the sequence
- **Mode-specific fields**: Depending on the thinking mode

### Thinking Modes

DeepThinking offers **18 specialized modes** for different problem types:

| Category | Modes | Best For |
|----------|-------|----------|
| **Core** | Sequential, Shannon, Mathematics, Physics, Hybrid | General problem-solving, information theory, formal proofs |
| **Advanced** | Metareasoning, Recursive, Modal, Stochastic, Constraint, Optimization | Complex multi-step problems, probability, constraints |
| **Analytical** | Causal, Bayesian, Counterfactual, Temporal | Cause-effect analysis, probability updates, "what-if" scenarios |
| **Creative** | Abductive, Analogical, First Principles | Hypothesis generation, reasoning by analogy |
| **Systematic** | Systems Thinking, Scientific Method, Formal Logic, Game Theory, Evidential | Holistic analysis, hypothesis testing, strategic decisions |

---

## Basic Usage

### 1. Create a Session

```
Tool: create_session
Arguments:
  - title: "Optimize database query performance"
  - mode: "sequential"
```

### 2. Add Thoughts

```
Tool: add_thought
Arguments:
  - sessionId: "<session-id>"
  - thought: "First, let's identify the slow queries..."
  - thoughtNumber: 1
  - totalThoughts: 5
  - nextThoughtNeeded: true
```

### 3. Continue Reasoning

Add more thoughts, building on previous ones. The session tracks dependencies and metrics automatically.

### 4. Complete the Session

```
Tool: add_thought
Arguments:
  - sessionId: "<session-id>"
  - thought: "In conclusion, implementing an index on the user_id column..."
  - thoughtNumber: 5
  - totalThoughts: 5
  - nextThoughtNeeded: false  # Marks session complete
```

### 5. Export Results

```
Tool: export_session
Arguments:
  - sessionId: "<session-id>"
  - format: "markdown"  # or json, latex, html, mermaid, dot, ascii
```

---

## Available Tools

### Session Management
| Tool | Description |
|------|-------------|
| `create_session` | Start a new thinking session |
| `add_thought` | Add a reasoning step to a session |
| `get_session` | Retrieve session details |
| `list_sessions` | List all sessions |
| `delete_session` | Remove a session |

### Analysis & Export
| Tool | Description |
|------|-------------|
| `get_summary` | Generate session summary |
| `export_session` | Export in various formats |
| `get_recommendations` | Get mode recommendations |
| `switch_mode` | Change thinking mode mid-session |

### Search & Discovery
| Tool | Description |
|------|-------------|
| `search_sessions` | Full-text search across sessions |

### Batch Operations
| Tool | Description |
|------|-------------|
| `batch_submit` | Submit batch jobs |
| `batch_status` | Check job progress |

---

## Choosing the Right Mode

### For Mathematical Problems
- **Mathematics**: Formal proofs, theorems, mathematical models
- **Optimization**: Constraint satisfaction, objective functions
- **Bayesian**: Probability calculations, updates

### For Scientific Analysis
- **Scientific Method**: Hypothesis → experiment → conclusion
- **Physics**: Physical models, tensor analysis, conservation laws
- **Causal**: Cause-effect relationships, intervention analysis

### For Business/Strategic Decisions
- **Game Theory**: Multi-agent decisions, Nash equilibrium
- **Systems Thinking**: Holistic analysis, feedback loops
- **First Principles**: Break down to fundamentals

### For Uncertainty & Risk
- **Shannon**: Information theory, uncertainty quantification
- **Stochastic**: Probabilistic reasoning, Monte Carlo
- **Evidential**: Dempster-Shafer theory, belief functions

### For General Problem-Solving
- **Sequential**: Step-by-step linear reasoning (default)
- **Hybrid**: Combine multiple approaches
- **Analogical**: Learn from similar problems

---

## Export Formats

| Format | Output | Use Case |
|--------|--------|----------|
| `json` | Structured data | API integration, backup |
| `markdown` | Human-readable text | Documentation, sharing |
| `latex` | Academic format | Papers, reports |
| `html` | Web-ready | Browser display |
| `jupyter` | Notebook (.ipynb) | Interactive analysis |
| `mermaid` | Diagrams | Visual flowcharts |
| `dot` | GraphViz | Graph visualization |
| `ascii` | Terminal-friendly | CLI display |

---

## Advanced Features

### Mode Recommendations

Not sure which mode to use? Ask for recommendations:

```
Tool: get_recommendations
Arguments:
  - problemDescription: "I need to analyze customer churn factors"
  - complexity: "high"
  - domain: "business"
```

### Visual Exports

Generate diagrams from your reasoning:

```
Tool: export_session
Arguments:
  - sessionId: "<session-id>"
  - format: "mermaid"
```

This creates flowcharts, decision trees, or causal graphs depending on your session's mode.

### Batch Processing

Process multiple sessions at once:

```
Tool: batch_submit
Arguments:
  - type: "export"
  - sessionIds: ["session-1", "session-2", "session-3"]
  - format: "markdown"
```

### Search

Find sessions by content, mode, or metadata:

```
Tool: search_sessions
Arguments:
  - query: "database optimization"
  - modes: ["sequential", "optimization"]
  - limit: 10
```

---

## Best Practices

### 1. Choose Modes Intentionally
Match the mode to your problem type. Use `get_recommendations` if unsure.

### 2. Structure Your Thoughts
- Start with problem definition
- Build reasoning step by step
- Reference previous thoughts when building on them

### 3. Use Revisions
If a thought needs updating:
```
Arguments:
  - isRevision: true
  - revisesThought: "<thought-id>"
```

### 4. Track Uncertainty
For probabilistic modes, include uncertainty estimates:
```
Arguments:
  - uncertainty: 0.2  # 20% uncertainty
```

### 5. Export for Documentation
Export completed sessions for future reference and sharing.

---

## Troubleshooting

### Session Not Found
- Verify the session ID is correct
- Check if the session was deleted or expired

### Invalid Mode
- Use one of the 18 supported modes
- Mode names are lowercase (e.g., `sequential`, not `Sequential`)

### Export Fails
- Ensure the session has at least one thought
- Check the format name is valid

---

## Further Reading

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[COMPONENTS.md](COMPONENTS.md)** - Detailed component documentation
- **[DATA_FLOW.md](DATA_FLOW.md)** - How data moves through the system
- **[CHANGELOG.md](../../CHANGELOG.md)** - Version history and updates

---

*Last Updated*: 2025-11-26
*Version*: 4.3.0
