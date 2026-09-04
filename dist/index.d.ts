#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/server';

/**
 * The protocol revision this server actually implements.
 *
 * DERIVED from the SDK, never hardcoded. It was hardcoded to "2026-07-28" until
 * 2026-09-04, which no published SDK implements -- `@modelcontextprotocol/server`
 * is at 2.0.0 and its LATEST_PROTOCOL_VERSION is "2025-11-25". The string exists in
 * the SDK only inside client error messages describing a FUTURE protocol era
 * ("pinning is for 2026-07-28 and later"), so it read like a real revision.
 *
 * The effect was a server that ADVERTISED a version it could not speak: `initialize`
 * correctly clamped to 2025-11-25 for every request -- including deliberately invalid
 * input -- while this constant claimed otherwise. Deriving it removes the second
 * source of truth that made the drift possible.
 */
declare const MCP_PROTOCOL_VERSION = "2025-11-25";
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
 * Main server startup — serves the SDK's latest protocol revision and legacy 2025-era
 * clients on the same stdio connection via `serveStdio`.
 */
declare function main(): Promise<void>;

export { MCP_PROTOCOL_VERSION, buildServer, main, server };
