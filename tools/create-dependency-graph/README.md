# create-dependency-graph

This tool scans the codebase and writes the dependency documentation in
`docs/architecture/`.

## Usage

```bash
# Run with the npm script. This is the recommended method.
npm run docs:deps

# Or run the TypeScript source directly.
npx tsx tools/create-dependency-graph/create-dependency-graph.ts

# Or run the compiled binary. Give the project root if the
# current directory is not the project root.
tools/create-dependency-graph/create-dependency-graph.exe
tools/create-dependency-graph/create-dependency-graph.exe --root=C:/path/to/project
```

The tool finds the project root from the command line or the current directory.
It does not use its own file location. You can therefore move these sources
without a change to the output paths.

## Output

The tool writes five files in `docs/architecture/`:

| File | Contents |
|---|---|
| `DEPENDENCY_GRAPH.md` | The report for readers, with a Mermaid diagram |
| `dependency-graph.json` | The full graph |
| `dependency-graph.yaml` | The full graph, approximately 40% smaller than the JSON |
| `dependency-summary.compact.json` | A short summary for a model context window |
| `unused-analysis.md` | Files and exports that no other file imports |

Each Markdown file starts with a `GENERATED FILE` banner and the
`<!-- repo-map:no-verification -->` marker. The generator writes both markers.
**Do not edit these files by hand.** A hand-added marker does not stay: the next
run of the generator removes it.

## Source layout

The entry point holds the orchestration only. The work is in `src/`, in layers
that keep the module graph acyclic:

| Module | Function |
|---|---|
| `src/types.ts` | The shared types. This module imports nothing. |
| `src/paths.ts` | Relative-import resolution. The analysis layer and the reporters both use it. |
| `src/config.ts` | The project root, the output paths, and the generated-file banner |
| `src/scanner.ts` | File discovery and parsing. Only this layer reads source text. |
| `src/analysis.ts` | Modules, the import matrix, circular dependencies, unused code, statistics |
| `src/reporters/` | The renderers. They use the analysis result. They do not read source text again. |

## Build

```bash
cd tools/create-dependency-graph
npm run typecheck   # tsc --noEmit
npm run build       # Bun compiles create-dependency-graph.exe
```

The build needs Bun. The binary contains the Bun runtime, so it is
approximately 95 MB.

**Rebuild the binary each time you change this tool.** If you do not, the binary
writes output from the old sources and gives no warning. Verify a rebuild in
this way: run `npm run docs:deps`, keep a copy of the five output files, run the
binary, then compare the files. The two results must be the same.

> The two runtimes resolve `js-yaml` differently. Node and tsx use the CommonJS
> build. Bun uses `js-yaml.mjs`, which has no default export, so `bun build`
> gives a warning. Both results are the same. This was verified with SHA256.

## Add a new tool

1. Make a directory in `tools/`.
2. Add an npm script in the project `package.json`.
3. Write a README for the tool.
4. Run `npm run typecheck` before you commit.
