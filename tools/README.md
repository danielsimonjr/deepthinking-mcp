# DeepThinking MCP Tools

This directory contains utility scripts for maintaining the DeepThinking MCP codebase.

## Available Tools

### create-dependency-graph.mjs

Scans the codebase and generates comprehensive dependency documentation.

**Usage:**

```bash
# Run directly
node tools/create-dependency-graph.mjs

# Or via npm script
npm run docs:deps
```

**Output:**

- `docs/architecture/DEPENDENCY_GRAPH.md` - Markdown documentation
- `docs/architecture/dependency-graph.json` - JSON data structure

**Features:**

- Scans all TypeScript files in `src/`
- Parses imports and exports
- Categorizes files into logical modules
- Detects circular dependencies
- Generates statistics (file count, export count, etc.)
- Produces both human-readable Markdown and machine-readable JSON

**Generated Documentation Includes:**

- External dependencies (npm packages)
- Node.js built-in dependencies
- Internal dependencies (relative imports)
- Exported classes, interfaces, functions, constants
- Circular dependency analysis
- Visual dependency graph (Mermaid diagram)
- Summary statistics

## Adding New Tools

1. Create a new `.mjs` file in this directory
2. Add a corresponding npm script in `package.json`
3. Document the tool in this README
