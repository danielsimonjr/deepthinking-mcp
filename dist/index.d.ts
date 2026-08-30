#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/server';

/** MCP 2.0 (2026-07-28) protocol revision this server implements. */
declare const MCP_PROTOCOL_VERSION: "2026-07-28";
/**
 * Build a configured MCP server with all tool handlers registered.
 *
 * Used by `serveStdio` (production) and by integration tests (in-memory /
 * `createMcpHandler` fetch shim). Each call returns a fresh instance; business
 * logic services (`thoughtFactory`, `getSessionManager`, etc.) are shared.
 */
declare function buildServer(): Server;
/**
 * The MCP server, with every tool handler registered on it.
 *
 * Exported so a test can drive the REAL dispatch path over an in-memory
 * transport instead of re-implementing it. Before this, `main()` ran at module
 * scope, so importing this file started a stdio server -- no test could import
 * it, `tests/integration/index-handlers.test.ts` re-implemented the handlers
 * against `SessionManager` directly, and the real ones drifted and died while
 * the suite stayed green. See `tests/integration/index-server.test.ts`.
 */
declare const server: Server;
/**
 * Main server startup — serves MCP 2026-07-28 (stateless) and legacy 2025-era
 * clients on the same stdio connection via `serveStdio`.
 */
declare function main(): Promise<void>;

export { MCP_PROTOCOL_VERSION, buildServer, main, server };
