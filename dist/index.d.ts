#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

/**
 * DeepThinking MCP Server
 *
 * 34 advanced reasoning modes with ModeHandler pattern, meta-reasoning,
 * taxonomy classifier, enterprise security, and visual export capabilities.
 *
 * Tools (13 total):
 * - deepthinking_core: inductive, deductive, abductive modes
 * - deepthinking_standard: sequential, shannon, hybrid modes
 * - deepthinking_mathematics: mathematics, physics, computability modes
 * - deepthinking_temporal: temporal, historical reasoning
 * - deepthinking_probabilistic: bayesian, evidential modes
 * - deepthinking_causal: causal, counterfactual modes
 * - deepthinking_strategic: gametheory, optimization modes
 * - deepthinking_analytical: analogical, firstprinciples, metareasoning, cryptanalytic modes
 * - deepthinking_scientific: scientificmethod, systemsthinking, formallogic modes
 * - deepthinking_engineering: engineering, algorithmic modes
 * - deepthinking_academic: synthesis, argumentation, critique, analysis modes
 * - deepthinking_session: summarize, export, export_all, get_session, switch_mode, recommend_mode
 * - deepthinking_analyze: multi-mode analysis with presets and merge strategies (Phase 12 Sprint 3)
 */

/**
 * The MCP server, with every tool handler registered on it by the
 * `setRequestHandler` calls below.
 *
 * Exported so a test can drive the REAL dispatch path over an in-memory
 * transport instead of re-implementing it. Before this, `main()` ran at module
 * scope, so importing this file started a stdio server -- no test could import
 * it, `tests/integration/index-handlers.test.ts` re-implemented the handlers
 * against `SessionManager` directly, and the real ones drifted and died while
 * the suite stayed green. See `tests/integration/index-server.test.ts`.
 */
declare const server: Server<{
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number | undefined;
            "io.modelcontextprotocol/related-task"?: {
                taskId: string;
            } | undefined;
        } | undefined;
    } | undefined;
}, {
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number | undefined;
            "io.modelcontextprotocol/related-task"?: {
                taskId: string;
            } | undefined;
        } | undefined;
    } | undefined;
}, {
    [x: string]: unknown;
    _meta?: {
        [x: string]: unknown;
        progressToken?: string | number | undefined;
        "io.modelcontextprotocol/related-task"?: {
            taskId: string;
        } | undefined;
    } | undefined;
}>;
/**
 * Main server startup
 */
declare function main(): Promise<void>;

export { main, server };
