# DeepThinking MCP

[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io)

An MCP server that gives an LLM **structured reasoning methods** as callable tools.

Instead of asking a model to "think carefully", you invoke a named method — Bayesian updating,
causal chain analysis, Toulmin argumentation, first-principles decomposition — and the server
enforces that method's structure: it validates the required fields, computes what can be computed
(posteriors, Nash equilibria, source-reliability scores), tracks the reasoning across a session,
and exports the result as a diagram or document.

**34 reasoning modes** are reachable through **13 tools**, with session management, proof
decomposition, and visual export.

## What ships

This repository is one Claude Code plugin with four surfaces:

| Surface | What you get |
|---|---|
| **MCP server** | 13 tools across 34 reasoning modes, session management, proof decomposition |
| **Slash commands** | `/think` and `/think-render` (canonically `/deepthinking-mcp:think`) |
| **Skills** | 14 reasoning skills covering 46 modes — including frameworks the server does not implement (SWOT, decision matrix, 5 Whys, fishbone, PESTLE, force-field, Pareto, stakeholder, gap/risk, cost-benefit) |
| **Subagent** | `visual-exporter` — renders a thought to 13 diagram/document formats (plus SVG/PNG via a render script) and a standalone interactive HTML dashboard. This path reaches formats the MCP tool API does not — see Capabilities. |

## Installation

**As an npm package**

```bash
npm install -g deepthinking-mcp
```

**From source**

```bash
git clone https://github.com/danielsimonjr/deepthinking-mcp.git
cd deepthinking-mcp
npm install && npm run build
```

## Configuration

Add the server to your MCP client config:

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

Sessions are in-memory by default. To share them across instances, set `SESSION_DIR` to a
directory both processes can reach — the server handles cross-process file locking.

```json
{
  "mcpServers": {
    "deepthinking": {
      "command": "npx",
      "args": ["-y", "deepthinking-mcp"],
      "env": { "SESSION_DIR": "/shared/deepthinking-sessions" }
    }
  }
}
```

Full environment-variable reference, including which settings are parsed but **not yet enforced**,
is in [CLAUDE.md](CLAUDE.md#environment-variables).

## Quick start

Ask for a causal analysis:

```json
{
  "tool": "deepthinking_causal",
  "arguments": {
    "mode": "causal",
    "thought": "Deploy latency rose 40% after the cache change",
    "thoughtNumber": 1,
    "totalThoughts": 3,
    "nextThoughtNeeded": true,
    "causalLinks": [
      { "cause": "cache TTL lowered to 30s", "effect": "origin request rate tripled", "strength": 0.9 },
      { "cause": "origin request rate tripled", "effect": "p99 latency +40%", "strength": 0.85 }
    ]
  }
}
```

Update a belief with evidence:

```json
{
  "tool": "deepthinking_probabilistic",
  "arguments": {
    "mode": "bayesian",
    "thought": "Is the regression caused by the cache change?",
    "thoughtNumber": 1,
    "totalThoughts": 2,
    "nextThoughtNeeded": true,
    "hypothesis": "The cache TTL change caused the regression",
    "priorProbability": 0.6,
    "evidence": [{ "description": "Latency rose within 5 min of deploy", "likelihood": 0.9 }]
  }
}
```

The server computes the posterior for you. Then export the session:

```json
{ "tool": "deepthinking_session", "arguments": { "action": "export", "format": "mermaid" } }
```

## Tools

| Tool | Modes / actions |
|---|---|
| `deepthinking_core` | inductive, deductive, abductive |
| `deepthinking_standard` | sequential, shannon, hybrid |
| `deepthinking_mathematics` | mathematics, physics, computability |
| `deepthinking_temporal` | temporal, historical |
| `deepthinking_probabilistic` | bayesian, evidential |
| `deepthinking_causal` | causal, counterfactual |
| `deepthinking_strategic` | gametheory, optimization |
| `deepthinking_analytical` | analogical, firstprinciples, metareasoning, cryptanalytic |
| `deepthinking_scientific` | scientificmethod, systemsthinking, formallogic |
| `deepthinking_engineering` | engineering, algorithmic |
| `deepthinking_academic` | synthesis, argumentation, critique, analysis |
| `deepthinking_session` | summarize, export, export_all, get_session, switch_mode, recommend_mode, delete_session |
| `deepthinking_analyze` | comprehensive_analysis, hypothesis_testing, decision_making, root_cause, future_planning |

A legacy `deepthinking` catch-all tool remains callable for clients that hardcode the name, but it
is hidden from `tools/list` and returns a deprecation warning. Use the focused tools.

## Reasoning modes

Grouped by what you would reach for them to do. Each links to its own guide in
[`docs/modes/`](docs/modes/), which covers the required fields, worked examples, and what the mode
validates.

| To do this | Use |
|---|---|
| Work a problem step by step, or split it across parallel tracks | sequential, shannon, hybrid |
| Reason from rules, from cases, or to the best explanation | deductive, inductive, abductive |
| Trace cause and effect, or ask what would have happened otherwise | causal, counterfactual |
| Update a belief as evidence arrives; weigh source reliability | bayesian, evidential |
| Analyse events over time, or evaluate historical sources | temporal, historical |
| Model strategic interaction, or optimise under constraints | gametheory, optimization |
| Decompose to fundamentals, or map one domain onto another | firstprinciples, analogical |
| Run a scientific method, model a system, or check a proof's logic | scientificmethod, systemsthinking, formallogic |
| Work through algorithms, complexity, computability, or ciphers | algorithmic, engineering, computability, cryptanalytic |
| Do literature synthesis, structured argument, critique, or qualitative analysis | synthesis, argumentation, critique, analysis |
| Reason about physical or mathematical structure | mathematics, physics |
| Supervise your own reasoning and switch approach when it stalls | metareasoning, recursive, modal, stochastic |

Not sure which applies? `deepthinking_session` with `action: "recommend_mode"` picks one from a
problem description or a set of problem characteristics.

## Capabilities

**Proof decomposition** — breaks an argument into atomic statements, then finds the gaps: missing
justifications, unstated assumptions, circular reasoning, and inconsistencies. Reports a verified
dependency graph of the argument rather than a verdict.

**Visual export** — a session exports to **8 formats over the tool API**: `markdown`, `latex`,
`json`, `html`, `jupyter`, `mermaid`, `dot`, `ascii`. Exports return inline or write to disk via
`MCP_EXPORT_PATH`.

> `ExportService` also implements SVG, GraphML, TikZ, Modelica, and UML, with working builder
> classes behind them — but `ExportFormatEnum` (`src/tools/schemas/shared.ts`) does not accept
> those names, and `src/index.ts` strips `svg` from profile exports. **They are not reachable
> through the MCP API today.** See [`docs/architecture/API.md`](docs/architecture/API.md).

**Session management** — thoughts accumulate in a session you can summarise, export, branch, or
switch modes within. File-backed storage with cross-process locking supports several server
instances over one session store.

**Validation and safety** — every tool input is Zod-validated with bounded string, array, and
record sizes (`src/tools/schemas/shared.ts`), and export paths are sandboxed to
`MCP_EXPORT_PATH`. Content is length-capped and cleaned by `src/utils/sanitization.ts`; there is
**no PII redaction** — do not put sensitive content in a thought you intend to export.

## Architecture

`src/index.ts` receives a tool call, validates it, and hands off to `ThoughtFactory`, which asks
`ModeHandlerRegistry` for the handler matching the requested mode. Each of the 37 handlers owns its
mode's validation and enrichment; a generic handler backs modes without a specialised one. Results
land in `SessionManager`. Exports take a parallel path through `ExportService`.

## Documentation

Architecture documents live in [`docs/architecture/`](docs/architecture/). Every authored document
ends with a `## Verification` block, and a drift gate re-checks those claims against a fresh parse —
see [`DRIFT_REPORT.md`](docs/architecture/DRIFT_REPORT.md) for what the checker verifies and where
its limits are.

| Document | Contents |
|---|---|
| [`OVERVIEW.md`](docs/architecture/OVERVIEW.md) | What this is, key metrics, layout, how code gets loaded |
| [`ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) | Design decisions and the constraints behind them |
| [`COMPONENTS.md`](docs/architecture/COMPONENTS.md) | Module-by-module reference with real signatures |
| [`DATAFLOW.md`](docs/architecture/DATAFLOW.md) | How a request travels, end to end |
| [`API.md`](docs/architecture/API.md) | The full public surface, per export |
| [`FILE_INVENTORY.md`](docs/architecture/FILE_INVENTORY.md) | Every file, its area and disposition (generated) |
| [`TEST_COVERAGE.md`](docs/architecture/TEST_COVERAGE.md) | What is tested, and the gaps that matter |
| [`DEPENDENCY_GRAPH.md`](docs/architecture/DEPENDENCY_GRAPH.md) | Who imports whom (generated) |
| [`unused-analysis.md`](docs/architecture/unused-analysis.md) | Files and exports with no importer (generated) |
| [`duplicate-symbols.md`](docs/architecture/duplicate-symbols.md) | Names defined in more than one file (generated) |
| [`DIRECTORY_STRUCTURE.md`](docs/architecture/DIRECTORY_STRUCTURE.md) | What each directory is for |
| [`DRIFT_REPORT.md`](docs/architecture/DRIFT_REPORT.md) | Refresh record, findings, analyzer limits |

Also: [`CHANGELOG.md`](CHANGELOG.md) for version history and [`CLAUDE.md`](CLAUDE.md) for the full
environment-variable reference and working notes.

## Development

```bash
npm run typecheck     # types only, no emit
npm run test:run      # full suite with coverage
npm run lint          # ESLint over src/
npm run build         # tsup → dist/
npm run docs:deps     # regenerate the dependency graph docs
```

Run one file with `npm test -- tests/unit/session/manager.test.ts`, or one pattern with
`npm test -- -t "SessionManager"`.

## Contributing

Adding a reasoning mode touches eight places — type definition, mode enum, thought union, handler,
registry, factory, validator, and visual exporter. [`docs/setup/ADDING_NEW_MODE.md`](docs/setup/ADDING_NEW_MODE.md)
walks the whole path with templates. Conventions and architectural constraints are in
[CLAUDE.md](CLAUDE.md).

## License

MIT — see [LICENSE](LICENSE).

Release history is in [CHANGELOG.md](CHANGELOG.md). Issues and questions:
[GitHub Issues](https://github.com/danielsimonjr/deepthinking-mcp/issues).
