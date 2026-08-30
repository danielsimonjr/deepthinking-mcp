/**
 * MCP 2.0 (protocol revision 2026-07-28) compliance tests.
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
} from "@modelcontextprotocol/server";
import { buildServer, MCP_PROTOCOL_VERSION } from "../../src/index.js";

describe("MCP 2.0 (2026-07-28) compliance", () => {
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
      { versionNegotiation: { mode: { pin: MCP_PROTOCOL_VERSION } } },
    );
    await client.connect(transport);
  }, 30_000);

  afterAll(async () => {
    await client.close();
    await handler.close();
  });

  it("advertises the 2026-07-28 protocol version constant", () => {
    expect(MCP_PROTOCOL_VERSION).toBe("2026-07-28");
  });

  it("negotiates the modern protocol era", () => {
    expect(client.getProtocolEra()).toBe("modern");
  });

  it("implements server/discover with 2026-07-28 in supportedVersions", async () => {
    const result = await client.request(
      { method: "server/discover", params: {} },
      DiscoverResultSchema,
    );
    expect(result.supportedVersions).toContain(MCP_PROTOCOL_VERSION);
    const serverInfo = result._meta?.[SERVER_INFO_META_KEY];
    expect(serverInfo?.name).toBe("deepthinking-mcp");
    expect(result.capabilities?.tools).toBeDefined();
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
