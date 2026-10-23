/**
 * The built bundle must carry its mode validators.
 *
 * `dist/index.js` is ONE file (tsup, `splitting: false`). Every other test in
 * the suite imports `src/`, where a validator module can be loaded from the
 * file system at run time. In the bundle that is not possible: a module
 * specifier the bundler cannot resolve at build time stays in the output as a
 * relative path, points at a file next to `dist/index.js` that does not
 * exist, and `loadValidator` turns the failed import into `undefined`. Every
 * thought then carries "No validator registered for thinking mode: <mode>",
 * and no source-level test can see it.
 *
 * This test starts the BUILT server over stdio, sends one thought per mode
 * through the tool that owns the mode, and reads the advisory validation block
 * of each reply. The block is advisory: a missing validator is a warning, so
 * the only way to see the defect is to read it.
 *
 * The test needs `dist/index.js`. A missing file fails the test with a
 * message that says so; it never skips.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { MCP_PROTOCOL_VERSION } from "../../src/index.js";
import { modeToToolMap } from "../../src/tools/definitions.js";
import { FULLY_IMPLEMENTED_MODES } from "../../src/types/core.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BUNDLE = resolve(ROOT, "dist/index.js");
const NEWLINE = String.fromCharCode(10);
const NO_VALIDATOR = /No validator registered/;

interface ValidationBlock {
  available?: boolean;
  reason?: string;
  isValid?: boolean;
  issues?: { severity: string; description: string }[];
}

interface Reply {
  result?: { isError?: boolean; content?: { text: string }[] };
  error?: { message: string };
}

describe("built bundle (dist/index.js) carries its mode validators", () => {
  let child: ChildProcessWithoutNullStreams;
  let stderr = "";
  let strayStdout = "";
  let exitNote = "";
  let buffer = "";
  let nextId = 1;
  const pending = new Map<number, (reply: Reply) => void>();

  function request(method: string, params: unknown): Promise<Reply> {
    const id = nextId++;
    return new Promise<Reply>((resolveReply, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(
          new Error(
            `${exitNote}no reply to ${method} in 20 s. ` +
              `stderr: ${stderr.slice(-400)} stdout that is not JSON: ${strayStdout.slice(-400)}`,
          ),
        );
      }, 20_000);
      pending.set(id, (reply) => {
        clearTimeout(timer);
        resolveReply(reply);
      });
      child.stdin.write(
        JSON.stringify({ jsonrpc: "2.0", id, method, params }) + NEWLINE,
      );
    });
  }

  /** Send one thought for `mode` through its tool and return the validation block. */
  async function validationFor(mode: string): Promise<ValidationBlock> {
    const reply = await request("tools/call", {
      name: modeToToolMap[mode],
      arguments: {
        thought: `bundle probe for ${mode}`,
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode,
      },
    });
    expect(reply.error, `${mode}: protocol error`).toBeUndefined();
    const text = reply.result?.content?.[0]?.text ?? "";
    let payload: { validation?: ValidationBlock };
    try {
      payload = JSON.parse(text) as { validation?: ValidationBlock };
    } catch {
      throw new Error(
        `${mode}: reply is not JSON: ${text.slice(0, 200)}. ` +
          `If dist/index.js is older than src/, run "bun run build" and commit dist/.`,
      );
    }
    expect(
      payload.validation,
      `${mode}: reply has no validation block`,
    ).toBeDefined();
    return payload.validation as ValidationBlock;
  }

  beforeAll(async () => {
    if (!existsSync(BUNDLE)) {
      throw new Error(`${BUNDLE} does not exist: run "bun run build" first`);
    }
    // SESSION_DIR switches the server to file-backed sessions. An empty value keeps
    // the probe's 35 sessions in memory even when the caller's shell sets it.
    child = spawn("node", [BUNDLE], {
      cwd: ROOT,
      env: { ...process.env, SESSION_DIR: "" },
      stdio: ["pipe", "pipe", "pipe"],
    });
    child.on("exit", (code, signal) => {
      exitNote = `server exited (code ${code}, signal ${signal}). `;
    });
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.stdout.on("data", (d) => {
      buffer += d.toString();
      let end: number;
      while ((end = buffer.indexOf(NEWLINE)) >= 0) {
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + 1);
        if (!line.trim()) continue;
        try {
          const message = JSON.parse(line) as Reply & { id?: number };
          if (message.id !== undefined) pending.get(message.id)?.(message);
        } catch {
          // A line that is not JSON is not a reply; keep it for the timeout message.
          strayStdout += line.slice(0, 200) + NEWLINE;
        }
      }
    });
    const init = await request("initialize", {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "dist-bundle-validators", version: "1.0.0" },
    });
    expect(init.error).toBeUndefined();
    child.stdin.write(
      JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) +
        NEWLINE,
    );
  }, 30_000);

  afterAll(() => {
    child?.kill();
  });

  it("probes every fully implemented mode through a tool that owns it", () => {
    // Guards the per-mode test below against passing on an empty list.
    expect(FULLY_IMPLEMENTED_MODES.length).toBeGreaterThanOrEqual(34);
    for (const mode of FULLY_IMPLEMENTED_MODES) {
      expect(modeToToolMap[mode], `no tool owns mode "${mode}"`).toBeDefined();
    }
  });

  it("runs a mode-specific validator: a deductive thought with no premise is flagged", async () => {
    // The positive control. A reply with no "No validator registered" issue
    // could also come from a validator step that never ran at all; this
    // thought can only produce its issue if DeductiveValidator really ran.
    const validation = await validationFor("deductive");
    const descriptions = (validation.issues ?? []).map((i) => i.description);
    expect(descriptions.join(" | ")).toMatch(/requires at least one premise/);
  }, 30_000);

  it("answers every fully implemented mode without a 'No validator registered' issue", async () => {
    const missing: string[] = [];
    const unavailable: string[] = [];
    for (const mode of FULLY_IMPLEMENTED_MODES) {
      const validation = await validationFor(mode);
      const hit = (validation.issues ?? []).some((i) =>
        NO_VALIDATOR.test(i.description),
      );
      if (hit) missing.push(mode);
      // A validator that throws makes the advisory step answer { available: false }
      // with no issues, which the check above cannot see.
      if (validation.available !== true)
        unavailable.push(`${mode}: ${validation.reason}`);
    }
    expect(missing).toEqual([]);
    expect(unavailable).toEqual([]);
  }, 60_000);
});
