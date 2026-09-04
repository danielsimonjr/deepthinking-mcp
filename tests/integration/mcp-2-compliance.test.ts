/**
 * MCP 2.0 compliance tests.
 *
 * Exercises the stateless protocol path via `createMcpHandler` + fetch shim
 * (the SDK-recommended in-process test harness for modern-era behavior).
 * Legacy 2025-era coverage remains in `index-server.test.ts` (InMemoryTransport).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { DiscoverResultSchema } from "@modelcontextprotocol/core";
import {
  createMcpHandler,
  SERVER_INFO_META_KEY,
  SUPPORTED_PROTOCOL_VERSIONS,
} from "@modelcontextprotocol/server";
import { buildServer, MCP_PROTOCOL_VERSION } from "../../src/index.js";

describe("MCP 2.0 compliance", () => {
  let client: Client;
  let handler: ReturnType<typeof createMcpHandler>;

  beforeAll(async () => {
    handler = createMcpHandler(() => buildServer());
    const transport = new StreamableHTTPClientTransport(
      new URL("http://test.local/mcp"),
      {
        fetch: (url, init) => handler.fetch(new Request(url, init)),
      },
    );
    client = new Client(
      { name: "mcp2-compliance-test", version: "1.0.0" },
      // `mode: { pin }` is for 2026-07-28-and-later servers; the SDK rejects a 2025-era
      // pin by name. This server negotiates 2025-11-25 -- the SDK's own latest -- so
      // legacy is the correct mode. The previous `pin: MCP_PROTOCOL_VERSION` only passed
      // because the constant held a 2026 date the SDK cannot actually speak.
      { versionNegotiation: { mode: "legacy" } },
    );
    await client.connect(transport);
  }, 30_000);

  afterAll(async () => {
    await client.close();
    await handler.close();
  });

  it("advertises a protocol revision the SDK can actually speak", () => {
    // NOT `toBe("<literal>")`. The previous form asserted the constant against a copy
    // of itself, so it passed while the constant named "2026-07-28" -- a revision no
    // published SDK implements. A test that shares its subject's constant certifies
    // the bug green. Assert against the SDK instead, which is the authority.
    expect(SUPPORTED_PROTOCOL_VERSIONS).toContain(MCP_PROTOCOL_VERSION);
  });

  it("negotiates over real stdio the same revision it advertises", async () => {
    // The rest of this suite runs over createMcpHandler (streamable HTTP). The SHIPPED
    // binary is stdio, and the two paths do not agree -- `server/discover` is
    // "Method not found" over stdio. Pin the property that actually reaches users.
    const { spawn } = await import("node:child_process");
    const child = spawn("node", ["dist/index.js"], { stdio: ["pipe", "pipe", "pipe"] });
    try {
      let buf = "";
      child.stdout.on("data", (d) => (buf += d.toString()));
      child.stdin.write(
        JSON.stringify({
          jsonrpc: "2.0", id: 1, method: "initialize",
          params: { protocolVersion: MCP_PROTOCOL_VERSION, capabilities: {},
                    clientInfo: { name: "stdio-probe", version: "1.0.0" } },
        }) + String.fromCharCode(10),
      );
      const negotiated = await new Promise<string | undefined>((resolve) => {
        const t = setTimeout(() => resolve(undefined), 10_000);
        const tick = setInterval(() => {
          for (const line of buf.split(String.fromCharCode(10)).filter(Boolean)) {
            try {
              const m = JSON.parse(line);
              if (m.id === 1) { clearTimeout(t); clearInterval(tick); resolve(m.result?.protocolVersion); }
            } catch { /* partial line */ }
          }
        }, 100);
      });
      expect(negotiated).toBe(MCP_PROTOCOL_VERSION);
    } finally {
      child.kill();
    }
  }, 20_000);

  it("reports the protocol era matching the revision it actually negotiates", () => {
    // Asserted "modern" while the server negotiates 2025-11-25. The SDK's own error text
    // draws the line at 2026-07-28, so this server is a 2025-era server built on the v2
    // packages -- the dependency major and the protocol era are separate facts.
    expect(client.getProtocolEra()).toBe("legacy");
  });

  it("does NOT expose server/discover, because 2025-11-25 has no such method", async () => {
    // This previously asserted `supportedVersions` CONTAINED 2026-07-28 -- and passed,
    // because the client had been pinned to a revision the SDK cannot speak, which put it
    // in modern mode over an in-process HTTP shim. The shipped stdio binary answers
    // "Method not found" for the same call. Both agree now: the method does not exist at
    // this wire era. Asserting the real behaviour keeps the suite honest instead of
    // certifying a capability the product does not have.
    // The SDK throws SYNCHRONOUSLY from _assertOutboundRequestInEra, before a promise
    // exists, so passing the call's result to .rejects never sees it. Wrap in an async
    // arrow so the synchronous throw surfaces as a rejection.
    await expect(async () =>
      client.request({ method: "server/discover", params: {} }, DiscoverResultSchema),
    ).rejects.toThrow(/not supported by the negotiated protocol version/);
  });
  it("returns exactly 13 focused tools via tools/list", async () => {
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(13);
    expect(tools.map((t) => t.name)).not.toContain("deepthinking");
  });

  it("executes tools/call over the modern protocol path", async () => {
    const result = await client.callTool({
      name: "deepthinking_core",
      arguments: {
        thought: "MCP 2.0 compliance probe",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: "deductive",
      },
    });
    expect(result.isError).toBeFalsy();
    const payload = JSON.parse((result.content as { text: string }[])[0].text);
    expect(payload.thoughtId).toBeDefined();
    expect(payload.sessionId).toBeDefined();
    expect(payload.mode).toBe("deductive");
  });
});
