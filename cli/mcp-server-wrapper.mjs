#!/usr/bin/env node
/**
 * Launcher for the Claude Code plugin.
 *
 * WHY THIS EXISTS (2026-09-16). The plugin's .mcp.json used to launch the server with
 * `command: "npx"`. An MCP client spawns its server with child_process.spawn and NO shell, and on
 * Windows `npx` is a .cmd shim rather than an executable. Measured on this machine:
 *
 *     spawn("npx")                 -> ENOENT
 *     spawn("npx.cmd")             -> EINVAL   (Node refuses .cmd without a shell, CVE-2024-27980)
 *     spawn("npx", {shell: true})  -> ok
 *     spawn("node")                -> ok
 *
 * So the server never started, the client waited for a handshake that could not arrive, and reported
 * CONNECT_TIMEOUT after 30s - every session. Both npx-launched servers in the marketplace failed
 * this way; all 60 node-launched ones were fine. `node <path>` is the only reliably spawnable form.
 *
 * WHY NOT A COMMITTED BUNDLE. Because it does not work here, and CLAUDE.md says so with receipts:
 * flattening zod v4 into one module dies at startup (`ZodCustom`/`ZodLazy` undefined when a
 * top-level consumer calls it), verified across six esbuild/tsup configurations. Re-confirmed
 * 2026-09-16 by trying it anyway and getting `TypeError: ZodLazy is not a constructor`.
 *
 * WHY NOT dist/index.js DIRECTLY. tsup leaves the two runtime deps external, so dist/index.js alone
 * throws ERR_MODULE_NOT_FOUND without node_modules - measured, by running it in an isolated
 * directory. A git-sourced plugin has no node_modules until something installs them.
 *
 * Hence this wrapper: guarantee the deps, then spawn dist/index.js as its own process.
 * The pattern is copied from episodic-memory's cli/mcp-server-wrapper.js, which solves the same
 * problem in this same marketplace - including its `shell: true` workaround for npm.cmd, which is
 * the very Windows behaviour described above.
 */

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || join(__dirname, "..");

// The sentinels are DERIVED from package.json's own `dependencies`, never hardcoded.
//
// The first version of this file hardcoded ["zod", "@modelcontextprotocol/sdk"] - copying what the
// repo's CLAUDE.md said the runtime deps were. That path exists in this repo's node_modules only as
// a STALE leftover from an older install; package.json actually declares @modelcontextprotocol/
// {server,client,core} and no `sdk` at all. So the check passed here and failed on every fresh
// clone, where it looked for a directory npm would never create: the wrapper reinstalled on every
// launch and then threw "install reported success but the dependencies are still missing".
//
// It also produced a false performance finding - a poll loop waiting on that path made a 4-SECOND
// npm install look like it took 122s and then 242s, which nearly got this whole approach discarded
// as too slow for the 30s startup budget.
//
// Reading the declared set means the check cannot drift when a dependency is added or renamed.
// Checking each package rather than a bare `node_modules/` directory is also deliberate: an
// interrupted install leaves the directory present and packages missing, which then fails later at
// import time with a far less obvious error.
function declaredDeps() {
  try {
    const pkg = JSON.parse(readFileSync(join(PLUGIN_ROOT, "package.json"), "utf-8"));
    return Object.keys(pkg.dependencies ?? {});
  } catch {
    // If package.json cannot be read, fall back to "assume unhealthy" so we install rather than
    // start a server whose imports will fail.
    return null;
  }
}

function depsHealthy() {
  const deps = declaredDeps();
  if (!deps || deps.length === 0) return false;
  return deps.every((d) => existsSync(join(PLUGIN_ROOT, "node_modules", ...d.split("/"))));
}

function npmInstall() {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === "win32";
    // stderr, never stdout: stdout IS the MCP transport and anything written there corrupts the
    // protocol stream.
    console.error("deepthinking-mcp: installing dependencies (first run only)...");
    const child = spawn(
      isWindows ? "npm.cmd" : "npm",
      ["install", "--omit=dev", "--no-audit", "--no-fund"],
      {
        cwd: PLUGIN_ROOT,
        stdio: ["ignore", "pipe", "pipe"],
        // shell:true on Windows for exactly the reason in the header - npm is a .cmd shim and
        // spawn() cannot execute it directly.
        shell: isWindows,
      },
    );
    child.stdout.on("data", (d) => process.stderr.write(d));
    child.stderr.on("data", (d) => process.stderr.write(d));
    child.on("error", (e) => reject(new Error(`npm install could not start: ${e.message}`)));
    child.on("exit", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`npm install exited ${code}. Run manually: cd "${PLUGIN_ROOT}" && npm install`));
    });
  });
}

async function main() {
  if (!depsHealthy()) {
    await npmInstall();
    if (!depsHealthy()) {
      throw new Error(
        "npm install reported success but the dependencies are still missing - " +
          `expected ${SENTINELS.join(" and ")} under ${join(PLUGIN_ROOT, "node_modules")}`,
      );
    }
  }
  // SPAWN, not import - and this is load-bearing.
  //
  // src/index.ts guards main() behind isProcessEntryPoint(), which compares process.argv[1] against
  // its own import.meta.url. Importing dist/index.js from this wrapper makes the WRAPPER the entry
  // point, the guard returns false, main() never runs, and the process EXITS 0 WITH NO OUTPUT -
  // the exact silent failure CLAUDE.md warns about ("indistinguishable from a healthy start").
  // Spawning dist/index.js as its own process keeps argv[1] correct and leaves that fragile guard
  // untouched.
  //
  // stdio:"inherit" hands the child the REAL file descriptors, so there is no pipe between the
  // client and the server and nothing for the protocol stream to snag on. process.execPath is used
  // rather than "node" so the child runs the same runtime as the wrapper, with no PATH lookup.
  const dist = join(PLUGIN_ROOT, "dist", "index.js");
  if (!existsSync(dist)) {
    throw new Error(`dist/index.js not found at ${dist} - run npm run build`);
  }
  const child = spawn(process.execPath, [dist], { stdio: "inherit" });
  child.on("error", (e) => {
    console.error(`deepthinking-mcp wrapper: could not start server: ${e.message}`);
    process.exit(1);
  });
  child.on("exit", (code, signal) => process.exit(signal ? 1 : (code ?? 0)));
}

main().catch((err) => {
  console.error(`deepthinking-mcp wrapper: ${err.message}`);
  process.exit(1);
});
