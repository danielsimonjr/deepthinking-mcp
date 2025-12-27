# VS Code Copilot Instructions - DeepThinking MCP

**Version**: 8.5.0 | **TypeScript MCP Server** | **Node**: >=18.0.0

## Quick Start

### Essential Commands

```bash
npm run build       # Compile src/ → dist/
npm test            # Watch mode tests (Vitest)
npm run typecheck   # Type check (TS compiler)
npm run lint        # ESLint validation
```

### Common Workflows

| Task              | Command                                 |
| ----------------- | --------------------------------------- |
| Start development | `npm run dev` (watch mode)              |
| Run single test   | `npm test -- tests/unit/<file>.test.ts` |
| Test by pattern   | `npm test -- -t "TestName"`             |
| Check formatting  | `npm run format:check`                  |
| Auto-format code  | `npm run format`                        |
| Generate docs     | `npm run docs:deps`                     |

### Pre-Commit Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run test:publish` passes
- [ ] No temporary files (`test-*.js`, `debug-*.js`, `.error.txt`)
- [ ] `git diff --cached` shows only intended changes

## Project Structure

```
src/
├── index.ts              # MCP server entry + tool handlers
├── types/                # 33 reasoning mode types (32 mode files + core.ts)
├── services/             # ThoughtFactory, ExportService, ModeRouter
├── modes/handlers/       # Strategy pattern handlers (36 total)
├── session/              # SessionManager + storage abstraction
├── export/visual/        # Mode-specific visual exporters
└── tools/                # MCP tool schemas & validators
```

**Path Aliases**: `@/*` (src), `@types/*`, `@modes/*`, `@session/*`, `@export/*`

## Architecture Patterns

- **Strategy Pattern**: `ModeHandlerRegistry` (33 reasoning modes + 3 utilities)
- **Service Layer**: `ThoughtFactory`, `ExportService`, `ModeRouter`, `MetaMonitor`
- **Repository Pattern**: `SessionManager` with pluggable storage (in-memory/file-based)
- **Builder Pattern**: 14 fluent APIs for visual/document export

## The 33 Reasoning Modes

33 modes across 8 categories. See [CLAUDE.md](../CLAUDE.md) for full documentation.

**Quick Reference**: All modes have specialized handlers in `src/modes/handlers/`

| Category                 | Modes                                                                 |
| ------------------------ | --------------------------------------------------------------------- |
| **Core**                 | Sequential, Shannon, Mathematics, Physics, Hybrid                     |
| **Fundamental**          | Inductive, Deductive, Abductive                                       |
| **Causal/Probabilistic** | Causal, Bayesian, Counterfactual, Temporal, GameTheory, Evidential    |
| **Analogical**           | Analogical, FirstPrinciples                                           |
| **Systems/Scientific**   | SystemsThinking, ScientificMethod, FormalLogic                        |
| **Academic**             | Synthesis, Argumentation, Critique, Analysis                          |
| **Engineering**          | Engineering, Computability, Cryptanalytic, Algorithmic                |
| **Advanced Runtime**     | MetaReasoning, Recursive, Modal, Stochastic, Constraint, Optimization |

## Common Development Tasks

### Add a New Mode

1. Create type: `src/types/modes/mymode.ts`
2. Add to enum: `src/types/core.ts`
3. Create handler: `src/modes/handlers/MyModeHandler.ts`
4. Register: `src/modes/handlers/ModeHandlerRegistry.ts`
5. Add validator: `src/validation/validators/modes/mymode.ts`
6. Create exporter: `src/export/visual/mymode.ts`

### Fix a Bug

1. Locate the file (use `@/*` path aliases)
2. Run tests: `npm test -- -t "MyTest"`
3. Type check: `npm run typecheck`
4. Test before commit: `npm run test:publish`

### Debug in VS Code

- Set breakpoints in `src/` files
- Run: `npm run dev` (watch mode)
- Tests auto-run on save
- Coverage: `npm run test:coverage`

## Build & Deploy

### Development Loop

```bash
npm run dev           # Watch mode (auto-recompile)
npm test              # Auto-run tests on save
```

### Before Committing

```bash
npm run typecheck     # Type check
npm run lint          # Lint
npm run format:check  # Check formatting
npm run test:publish  # Final test run
```

### Build for Distribution

```bash
npm run build         # Compile src/ → dist/
git add -A
git commit -m "message"
npm publish
```

## Key Conventions

1. **No mode logic in index.ts** → Use handlers in `src/modes/handlers/`
2. **Use ModeHandlerRegistry** → For all mode-specific operations
3. **Lazy service initialization** → Use getter functions in `src/index.ts`
4. **Sync schemas** → Update both hand-written JSON and Zod schemas in `src/tools/`
5. **Type safety first** → Run `typecheck` before building

## Quick Reference

| What                | Where                        | How                                                       |
| ------------------- | ---------------------------- | --------------------------------------------------------- |
| Add visual export   | `src/export/visual/`         | Use DOTGraphBuilder, MermaidGraphBuilder, ASCIIDocBuilder |
| Add tool parameter  | `src/tools/schemas/`         | Sync JSON schema + Zod validator                          |
| Add validation rule | `src/validation/validators/` | Use Zod schemas                                           |
| Add test            | `tests/unit/`                | Match directory structure to `src/`                       |
| View architecture   | `docs/architecture/`         | See OVERVIEW.md, ARCHITECTURE.md                          |

## Tools & Resources

- **Chunker**: Split large files → `tools/chunker/chunker.exe split <file>`
- **Compress**: Reduce context size → `tools/compress-for-context/compress-for-context.exe <file>`
- **Docs**: Generate dependency graph → `npm run docs:deps`
- **Full Guide**: See [CLAUDE.md](../CLAUDE.md) for comprehensive documentation
