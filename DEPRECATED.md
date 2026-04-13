# deepthinking-mcp is deprecated

**As of 2026-04-12, `deepthinking-mcp` is no longer under active development.** It has been replaced by **[deepthinking-plugin](https://github.com/danielsimonjr/deepthinking-plugin)**, a Claude Code plugin that delivers the same 34 reasoning modes as prompt-based skills rather than as a Node.js MCP server.

If you're starting a new project, **use the plugin, not this MCP**. If you're already using this MCP, see the [Migration guide](#migration-guide) below.

---

## Timeline

| Date | Status |
|---|---|
| **2026-04-12** | v9.1.3 is the final feature release. Deprecation announced. |
| **2026-04-12 → 2026-10-12** | Security fixes only. No new modes, formats, or features. |
| **After 2026-10-12** | Maintenance-only. Issues may be closed with a pointer to `deepthinking-plugin`. |
| **Never** | The repo will not be deleted. The npm package will remain published. |

You can keep running v9.1.3 indefinitely — nothing breaks on the deprecation date. You just won't gain new capabilities and you'll miss out on the improvements that only land in the plugin.

---

## Why it was replaced

The MCP server and the plugin solve the same problem — teaching Claude to reason with 34 structured methods — but in fundamentally different ways:

| Concern | `deepthinking-mcp` (v9.1.3) | `deepthinking-plugin` (v0.4.1) |
|---|---|---|
| **Runtime** | Node.js ≥18, TypeScript compilation, 102K LOC, 237 files | No runtime. Prompt-based skills, ~180 files, no compilation |
| **Startup cost** | Every Claude session spawns a Node subprocess | Zero — skills load lazily into context on invocation |
| **Dependencies** | `@modelcontextprotocol/sdk` + `zod` + ~400 transitive devDeps | Python stdlib + optional `jsonschema` for tests only |
| **Tool surface** | 13 tools (`deepthinking_core`, `deepthinking_bayesian`, ...) — all loaded into Claude's tool list every session | 1 slash command (`/think`) + 1 subagent — loaded on demand |
| **Context pollution** | All 34 modes always visible in Claude's tool picker | Only the relevant category skill (2-4 modes) loads per invocation |
| **Validation** | Zod runtime schemas | JSON Schema (draft-07) + lenient repair pass |
| **Visual export** | 42 TypeScript exporter files → 11 formats via 14 builder classes | 34 per-mode grammar files + 9 per-format grammar files + visual-exporter subagent |
| **Distribution** | `npm install deepthinking-mcp` | `claude --plugin-dir` or copy to `~/.claude/plugins/` |
| **Session state** | Persistent session management, multi-instance file locking | No session state. Each invocation is self-contained. |
| **Test coverage** | 5,148 Vitest tests against TypeScript units | 118 automated checks + 34-mode end-to-end smoke tests against real Claude output |
| **Update cadence** | Static. New modes require rebuilding the TS codebase. | Incremental. Adding a mode means dropping a few markdown files. |

The plugin approach also discovered 6 real schema bugs during its end-to-end smoke tests that were invisible to the MCP's unit tests, because those bugs only manifest when real Claude output exercises the schemas. That class of test is now automated and repeatable for every release.

**Short version**: the reasoning methods *are* the product. The TypeScript runtime was scaffolding around what are fundamentally prompt-based instructions. Moving to native Claude Code skills removed the scaffolding without removing any capability.

---

## Migration guide

Migrating from `deepthinking-mcp` to `deepthinking-plugin` takes roughly 10 minutes. The reasoning content is the same; only the invocation surface changes.

### Step 1 — Remove the MCP from your Claude Code config

Find your MCP config (one of `.mcp.json`, `~/.claude/.mcp.json`, or `claude_desktop_config.json`) and remove the `deepthinking` entry.

**Before:**

```json
{
  "mcpServers": {
    "deepthinking": {
      "command": "node",
      "args": ["C:/path/to/deepthinking-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

**After:**

```json
{
  "mcpServers": {}
}
```

(Or remove the file entirely if `deepthinking` was the only entry.)

### Step 2 — Install the plugin

Clone the new repo:

```bash
git clone https://github.com/danielsimonjr/deepthinking-plugin.git
cd deepthinking-plugin
git checkout v0.4.1
```

Then either:

**(a) Load directly (dev mode)** — no install, just point Claude Code at the directory:

```bash
claude --plugin-dir "/absolute/path/to/deepthinking-plugin"
```

**(b) Permanent install** — copy into your personal plugins folder:

```bash
# macOS / Linux
cp -r deepthinking-plugin ~/.claude/plugins/

# Windows PowerShell
Copy-Item -Recurse deepthinking-plugin "$env:USERPROFILE\.claude\plugins\"
```

Plain `claude` will auto-discover the plugin on next session.

### Step 3 — Update your invocation syntax

The MCP exposed tools named like `deepthinking_bayesian`, `deepthinking_core`, etc. The plugin exposes a single slash command: `/think`.

| Old (MCP tool) | New (plugin slash command) |
|---|---|
| `deepthinking_core { mode: "inductive", thought: "..." }` | `/think inductive "..."` |
| `deepthinking_probabilistic { mode: "bayesian", thought: "..." }` | `/think bayesian "..."` |
| `deepthinking_causal { mode: "causal", thought: "..." }` | `/think causal "..."` |
| `deepthinking_strategic { mode: "gametheory", thought: "..." }` | `/think gametheory "..."` |
| ... (13 grouped tools × 34 modes) | `/think <any-of-34-modes> "..."` (one command, all modes) |
| `deepthinking_session { action: "recommend_mode", problem: "..." }` | `/think "<problem>"` (auto-recommend) |
| `deepthinking_analyze { modes: [...], problem: "..." }` | `/think analyze "..."` (router picks multi-mode analysis) |

**Namespaced form:** the canonical slash command is `/deepthinking-plugin:think`. The bare `/think` requires a personal alias at `~/.claude/commands/think.md` — see [examples/personal-command-alias/README.md](https://github.com/danielsimonjr/deepthinking-plugin/tree/master/examples/personal-command-alias) in the plugin repo.

### Step 4 — Update visual export

The MCP had an `export_visual` tool. The plugin replaces it with a second slash command:

| Old | New |
|---|---|
| `deepthinking_session { action: "export", format: "mermaid" }` | `/think-render mermaid` |
| `deepthinking_session { action: "export", format: "dot" }` | `/think-render dot` |
| N/A (MCP exported to files) | `/think-render dashboard` — interactive standalone HTML |
| Formats: mermaid, dot, ascii, svg, graphml, html, tikz, uml, modelica, markdown, json | Same 11 formats, plus the new `dashboard` format |

### Step 5 — Drop session management

The MCP had persistent sessions (via `SESSION_DIR` env var) that let you accumulate thoughts across tool calls and export the full chain later. **The plugin has no session state.** Each `/think` invocation is self-contained. If you need a chain of thoughts, put them in one invocation:

```
/think sequential "Break down the DB migration into steps, and for each step explain the rollback plan."
```

Claude will emit an array of sequential thoughts in one response. This is how the plugin's smoke tests validate sequential chains — one invocation, one structured output, the whole chain in a single JSON array.

### Step 6 — Verify it works

Start Claude Code with the plugin loaded and try:

```
/think bayesian "Is the p99 latency spike caused by the new cache config?"
```

You should see:
1. A one-sentence meta line explaining Bayesian reasoning was applied
2. A JSON code block with `mode`, `hypothesis`, `prior`, `likelihood`, `evidence`, `posterior`
3. A short natural-language summary

If you see that, migration is complete.

---

## What you keep

Almost everything. The plugin has feature parity with the MCP for the reasoning methods themselves:

- ✅ All 34 reasoning modes (Sequential, Shannon, Hybrid, Inductive, Deductive, Abductive, Mathematics, Physics, Computability, Temporal, Historical, Bayesian, Evidential, Causal, Counterfactual, GameTheory, Optimization, Constraint, Analogical, FirstPrinciples, MetaReasoning, Cryptanalytic, ScientificMethod, SystemsThinking, FormalLogic, Engineering, Algorithmic, Synthesis, Argumentation, Critique, Analysis, Recursive, Modal, Stochastic)
- ✅ Structured JSON output per mode (matching the same fields as the MCP's thought types)
- ✅ 11 visual export formats
- ✅ Taxonomy classifier (via `reference/taxonomy.md` and `mode-index.md` decision tree)
- ✅ Auto-recommendation (via `/think "<problem>"` with no mode)
- ✅ Multi-mode analysis (via `/think analyze`)
- ✅ Mode-specific auto-computation — the plugin teaches Claude the same Bayes' theorem arithmetic, Nash equilibrium conditions, Dempster-Shafer mass assignments, Allen interval relations, CLRS algorithm taxonomy, and Systems Thinking archetypes that the MCP handlers computed

## What you lose

Small list, mostly things you probably weren't using:

- ❌ Persistent session state across invocations — replace with single-invocation chains
- ❌ File-based multi-instance session sharing (`SESSION_DIR`) — no longer needed without a server
- ❌ Runtime Zod validation — replaced by JSON Schema + repair pass, which is more permissive about Claude's actual output patterns
- ❌ The `--no-validation` escape hatch — the plugin's validation is at test time, not invocation time
- ❌ 13 grouped tools in Claude's tool picker — replaced by 1 slash command (most users consider this a feature, not a loss)

## What you gain

- 🟢 **No Node.js process** — zero startup cost, zero dependencies to audit
- 🟢 **Only the relevant category loads** — solves context pollution (~2-4 modes per invocation vs. all 34 always visible)
- 🟢 **Interactive HTML dashboard** format (new — no MCP equivalent)
- 🟢 **Distributable plugin format** — `git clone` and point Claude Code at it, done
- 🟢 **End-to-end smoke tests** against real Claude output catch schema bugs the unit tests miss
- 🟢 **Contributing is trivial** — adding a new mode means dropping a few markdown files, no TypeScript build, no test update

---

## Existing MCP users: what to do with v9.1.3

You have three options, listed from easiest to most thorough:

### Option A — Keep using v9.1.3 indefinitely

Do nothing. `deepthinking-mcp@9.1.3` will remain published on npm forever. Security fixes will land through 2026-10-12. After that, no more updates, but the code will keep working as long as the MCP SDK and Node.js remain compatible.

### Option B — Migrate now (recommended)

Follow the [Migration guide](#migration-guide) above. Takes about 10 minutes. You'll get access to new features as the plugin evolves.

### Option C — Run both side-by-side during transition

The MCP server and the plugin don't conflict. You can keep the MCP config in place AND install the plugin. Use `/think` for new work, keep using the `deepthinking_*` tools for in-flight projects, and migrate when convenient. Remove the MCP config when you're ready.

---

## Questions?

- **"Will v9.1.3 keep working?"** — Yes. Indefinitely. The npm package stays published.
- **"Is the plugin a strict superset of the MCP?"** — Feature-wise yes (plus the interactive dashboard which is new). The one thing the MCP has that the plugin doesn't is persistent session state, which you almost certainly weren't using.
- **"Can I contribute new modes to the MCP instead of the plugin?"** — Please don't. New work should land in the plugin. The MCP is closed to feature PRs.
- **"Will security fixes backport to the MCP?"** — Yes, through 2026-10-12. Open an issue with a CVE number or reproduction and it will be fixed.
- **"Where do I report a bug in the plugin?"** — Issues: https://github.com/danielsimonjr/deepthinking-plugin/issues

---

## New repository

**https://github.com/danielsimonjr/deepthinking-plugin**

Tagged releases: v0.1.0 → v0.2.0 → v0.3.0 → v0.4.0 → v0.4.1

The plugin was built in one continuous session from the same reasoning knowledge that powered this MCP. Every method — Bayes' theorem, Toulmin argumentation, Dempster-Shafer, Allen intervals, Nash equilibria, Systems Archetypes, Decibans — was distilled from the handler code in this repo and rewritten as prompt-based instructions. If you want to see how that distillation worked, the knowledge packs are still at `docs/superpowers/knowledge-packs/` in this repo (one ~5KB file per mode).

Thanks for using `deepthinking-mcp`. See you on the plugin.

— 2026-04-12
