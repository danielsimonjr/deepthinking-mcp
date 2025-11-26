# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

DeepThinking MCP is a TypeScript-based Model Context Protocol server featuring 18 advanced reasoning modes with taxonomy-based classification (110+ reasoning types across 12 categories), enterprise security, and visual export capabilities.

**Version**: 4.3.0 | **Node**: >=18.0.0 | **Entry Point**: `dist/index.js`

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
├── types/             # Type definitions including 18 mode types
│   ├── core.ts        # ThinkingMode enum, Thought union type
│   └── modes/         # One file per reasoning mode
├── services/          # Business logic layer
├── session/           # SessionManager, persistence, storage abstraction
├── taxonomy/          # 110+ reasoning types, classifier, suggestion engine
├── export/            # Visual and document exporters
├── search/            # Full-text search engine with faceted filtering
├── batch/             # Batch processing (6 operations)
├── backup/            # Backup manager with provider abstraction
├── cache/             # LRU/LFU/FIFO caching strategies
├── rate-limit/        # Sliding window rate limiter
├── repositories/      # Repository pattern (ISessionRepository interface)
├── modes/             # Advanced reasoning mode implementations
└── validation/        # Zod schemas for input validation
```

### Type System

All 18 reasoning modes defined in `src/types/core.ts`:
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

## The 18 Reasoning Modes

**Core (full runtime)**: Sequential, Shannon, Mathematics, Physics, Hybrid

**Advanced (full runtime)**: Metareasoning, Recursive, Modal, Stochastic, Constraint, Optimization

**Experimental (validators + types)**: Abductive, Causal, Bayesian, Counterfactual, Analogical, Temporal, Game Theory, Evidential, First Principles, Systems Thinking, Scientific Method, Formal Logic

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
- `src/taxonomy/reasoning-types.ts` - All 110+ reasoning type definitions
- `src/search/engine.ts` - Full-text search implementation

## Memory Usage Reminder

**IMPORTANT**: Use the `memory-mcp` tools periodically during sessions to:

1. **At session start**: Search for existing context with `mcp__memory-mcp__search_nodes` using query "deepthinking-mcp"
2. **During work**: Add observations for significant changes with `mcp__memory-mcp__add_observations`
3. **At session end**: Update memory with session summary and any new findings

This ensures continuity across sessions and prevents loss of important project context.
