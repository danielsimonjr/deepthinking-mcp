# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

DeepThinking MCP is a TypeScript-based Model Context Protocol server featuring 25 reasoning modes (21 with dedicated thought types) with taxonomy-based classification (69 reasoning types across 12 categories, 110 planned), enterprise security, and visual export capabilities.

**Version**: 6.1.2 | **Node**: >=18.0.0 | **Entry Point**: `dist/index.js`

## Build & Development Commands

```bash
npm run build        # Compile with tsup → dist/
npm run dev          # Watch mode compilation
npm run typecheck    # Type check without emitting
npm run lint         # ESLint checks on src/
npm run format       # Prettier auto-format
npm run format:check # Check formatting
```

## Testing

```bash
npm test             # Run tests in watch mode
npm run test:run     # Run all tests once (CI mode)
npm run test:coverage # Generate coverage reports

# Run a single test file
npm test -- tests/unit/session/manager.test.ts

# Run tests matching a pattern
npm test -- -t "SessionManager"
```

Test framework: Vitest with V8 coverage provider.

## Architecture

### Service Layer Pattern

Business logic extracted from `src/index.ts` into three main services:

- **ThoughtFactory** (`src/services/ThoughtFactory.ts`) - Creates mode-specific thoughts with validation
- **ExportService** (`src/services/ExportService.ts`) - Multi-format export (Markdown, LaTeX, Mermaid, DOT, ASCII)
- **ModeRouter** (`src/services/ModeRouter.ts`) - Mode switching and recommendations

### Key Directories

```
src/
├── index.ts           # MCP server entry point (tool handlers)
├── types/             # Type definitions including 25 mode types
│   ├── core.ts        # ThinkingMode enum, Thought union type
│   └── modes/         # One file per reasoning mode
├── services/          # Business logic layer
├── session/           # SessionManager, persistence, storage abstraction
├── taxonomy/          # 69 reasoning types (110 planned), classifier, suggestion engine
├── export/            # Visual and document exporters
├── search/            # Full-text search engine with faceted filtering
├── batch/             # Batch processing (8 operations)
├── backup/            # Backup manager with provider abstraction
├── cache/             # LRU/LFU/FIFO caching strategies
├── rate-limit/        # Sliding window rate limiter
├── repositories/      # Repository pattern (ISessionRepository interface)
├── modes/             # Advanced reasoning mode implementations
└── validation/        # Zod schemas for input validation
```

### Type System

All 25 reasoning modes defined in `src/types/core.ts`:
- `ThinkingMode` enum - Mode identifiers
- `Thought` union type - Discriminated union of all thought types
- Type guards: `isSequentialThought()`, `isMathematicsThought()`, etc.

Mode-specific types in `src/types/modes/` (one file per mode).

### Path Aliases

Configured in `tsconfig.json`:
- `@/*` → `src/*`
- `@types/*` → `src/types/*`
- `@utils/*` → `src/utils/*`
- `@validation/*` → `src/validation/*`
- `@modes/*`, `@session/*`, `@search/*`, `@batch/*`, `@backup/*`, `@cache/*`, `@export/*`, `@taxonomy/*`

## The 25 Reasoning Modes

**Core (5)**: Sequential, Shannon, Mathematics, Physics, Hybrid

**Advanced Runtime (6)**: Metareasoning, Recursive, Modal, Stochastic, Constraint, Optimization

**Fundamental (2)**: Inductive, Deductive

**Experimental (12)**: Abductive, Causal, Bayesian, Counterfactual, Analogical, Temporal, Game Theory, Evidential, First Principles, Systems Thinking, Scientific Method, Formal Logic

Note: 21 modes have dedicated thought types. 4 modes (Recursive, Modal, Stochastic, Constraint) are runtime-only.

## Adding New Features

### New Reasoning Mode
1. Create type definition: `src/types/modes/newmode.ts`
2. Add to `ThinkingMode` enum in `src/types/core.ts`
3. Add to `Thought` union type
4. Create handler: `src/modes/newmode-reasoning.ts`
5. Update `ThoughtFactory` to handle the mode
6. Add Zod validator in `src/validation/validators/modes/`

### New Export Format
1. Create exporter: `src/export/newformat.ts`
2. Register in `src/services/ExportService.ts`
3. Add to export format enum/list

### New MCP Tool
1. Define schema in `src/tools/thinking.ts`
2. Add handler in `src/index.ts`
3. Implement logic in appropriate service

## MCP Configuration

```json
{
  "mcpServers": {
    "deepthinking": {
      "command": "node",
      "args": ["C:/path/to/deepthinking-mcp/dist/index.js"]
    }
  }
}
```

## Key Files

- `src/index.ts` - MCP server entry, all tool handlers
- `src/types/core.ts` - Core types, mode enums, thought union
- `src/session/manager.ts` - SessionManager lifecycle management
- `src/services/ThoughtFactory.ts` - Thought creation and validation
- `src/taxonomy/reasoning-types.ts` - All 69 reasoning type definitions (110 planned)
- `src/search/engine.ts` - Full-text search implementation

## Development Best Practices

### Cleanup Before Committing/Publishing

**CRITICAL**: Always remove temporary debug/test artifacts before committing or publishing:

```bash
# Before git commit - check for junk files
git status

# Common temporary files to remove:
rm test-*.mjs test-*.js debug-*.js temp-*.js .error.txt

# Verify only intended files are staged
git diff --cached
```

**Cleanup Checklist:**
- ✅ Remove temporary test scripts (e.g., `test-mcp-server.mjs`, `test-schema-output.js`)
- ✅ Delete debug files created during troubleshooting
- ✅ Check for `.error.txt` or other runtime artifacts
- ✅ Review `git status` output before committing
- ✅ Verify `dist/` doesn't contain test artifacts before publishing
- ✅ Run tests to ensure nothing broke after cleanup

**Workflow:**
1. Create temp files for debugging → Test/Debug → **Delete temp files** → Commit clean code
2. Before `git commit`: Ask yourself "Did I create any temp/debug files?"
3. Before `npm publish`: Verify package contents are clean

### Build & Publish Workflow

**CRITICAL**: Always follow this exact order - typecheck and test BEFORE building:

```bash
# Correct workflow (v4.4.0+)
1. Make source changes in src/
2. npm run typecheck          # ← CRITICAL: Type check FIRST
3. npm run test:publish       # ← CRITICAL: Test BEFORE building
4. npm run build              # ← Build AFTER typecheck and tests pass
5. git add -A && git commit   # Commit source + dist
6. npm publish                # Publish to npm
7. git push origin master     # Push to GitHub
```

**Why This Order Matters:**
- Typecheck catches errors before wasting time on builds
- Tests verify correctness before building
- Building only when code is verified saves time
- Never commit broken code

**Common Mistakes:**
- ❌ Building before typechecking (wastes time if types are wrong)
- ❌ Building before testing (wastes time if tests fail)
- ❌ Committing source without rebuilding dist/
- ❌ Publishing with outdated dist/ files
- ✅ Typecheck → Test → Build → Commit → Publish (correct order)

## Memory Usage Reminder

**IMPORTANT**: Use the `memory-mcp` tools periodically during sessions to:

1. **At session start**: Search for existing context with `mcp__memory-mcp__search_nodes` using query "deepthinking-mcp"
2. **During work**: Add observations for significant changes with `mcp__memory-mcp__add_observations`
3. **At session end**: Update memory with session summary and any new findings

This ensures continuity across sessions and prevents loss of important project context.
