#!/usr/bin/env node

import {
  SUPPORTED_PROTOCOL_VERSIONS,
  type ListToolsResult,
  Server,
} from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { readFileSync, realpathSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Import package.json for version sync
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "../package.json"), "utf-8"),
);

// Import services - Phase 15A: Static imports replace dynamic imports
import { ThoughtFactory } from "./services/ThoughtFactory.js";
import { ExportService } from "./services/ExportService.js";
import { SessionManager } from "./session/manager.js";
import { buildModeRecommendation } from "./services/RecommendationService.js";
import { FileSessionStore } from "./session/storage/file-store.js";
import {
  isValidTool,
  modeToToolMap,
  toolList,
  toolSchemas,
} from "./tools/definitions.js";
import {
  ThinkingMode,
  isFullyImplemented,
  type AddThoughtResponse,
  type AnalyzeResponse,
  type MCPResponse,
  type ProblemCharacteristics,
} from "./types/index.js";

/** MCP 2.0 (2026-07-28) protocol revision this server implements. */
export const MCP_PROTOCOL_VERSION = "2026-07-28" as const;

/**
 * Build a configured MCP server with all tool handlers registered.
 *
 * Used by `serveStdio` (production) and by integration tests (in-memory /
 * `createMcpHandler` fetch shim). Each call returns a fresh instance; business
 * logic services (`thoughtFactory`, `getSessionManager`, etc.) are shared.
 */
export function buildServer(): Server {
  const server = new Server(
    {
      name: packageJson.name,
      version: packageJson.version,
    },
    {
      capabilities: {
        tools: {},
      },
      supportedProtocolVersions: [
        MCP_PROTOCOL_VERSION,
        ...SUPPORTED_PROTOCOL_VERSIONS,
      ],
      cacheHints: {
        "tools/list": { ttlMs: 60_000, cacheScope: "private" },
      },
    },
  );

  registerHandlers(server);
  return server;
}

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
export const server = buildServer();

/**
 * Service Initialization (Phase 15A)
 * Simplified from lazy async getters to direct instances.
 * SessionManager still supports SESSION_DIR for multi-instance support.
 */

// Synchronous services - created immediately
const thoughtFactory = new ThoughtFactory();
const exportService = new ExportService();

// SessionManager - may need async init for file storage
let _sessionManager: SessionManager | null = null;
let _sessionManagerPromise: Promise<SessionManager> | null = null;

/**
 * Get or create SessionManager with optional file-based storage.
 * Uses cached promise to prevent multiple initializations.
 */
async function getSessionManager(): Promise<SessionManager> {
  if (_sessionManager) return _sessionManager;

  if (!_sessionManagerPromise) {
    _sessionManagerPromise = (async () => {
      const sessionDir = process.env.SESSION_DIR;

      if (sessionDir) {
        // File-based storage for multi-instance support
        const storage = new FileSessionStore(sessionDir);
        await storage.initialize();
        _sessionManager = new SessionManager({}, undefined, storage);
        console.error(
          `[deepthinking-mcp] Using file-based session storage: ${sessionDir}`,
        );
      } else {
        // Default: in-memory only (single instance)
        _sessionManager = new SessionManager();
      }
      return _sessionManager;
    })();
  }

  return _sessionManagerPromise;
}

// Register tool list handler - returns the 13 focused tools.
// L-2 (2026-08-03 audit): the legacy "deepthinking" tool is intentionally
// hidden from tools/list (it advertised itself as deprecated to every
// client) but its handler below is kept so existing callers that already
// hardcode the tool name continue to work.
function registerHandlers(server: Server): void {
  server.setRequestHandler("tools/list", async () => {
    return {
      tools: [...toolList] as unknown as ListToolsResult["tools"],
    };
  });

  // Register tool call handler
  server.setRequestHandler("tools/call", async (request) => {
    const { name, arguments: args } = request.params;

    try {
      // Handle new focused tools
      if (isValidTool(name)) {
        const schema = toolSchemas[name as keyof typeof toolSchemas];
        const input = schema.parse(args);

        // Session action tool
        if (name === "deepthinking_session") {
          return await handleSessionAction(input as SessionInput);
        }

        // Multi-mode analyze tool (Phase 12 Sprint 3)
        if (name === "deepthinking_analyze") {
          return await handleAnalyze(input as AnalyzeInputType);
        }

        // All other tools are for adding thoughts
        return await handleAddThought(input as ThoughtInput, name);
      }

      // Handle legacy tool (backward compatibility)
      if (name === "deepthinking") {
        const { ThinkingToolSchema } = await import("./tools/thinking.js");
        const input = ThinkingToolSchema.parse(args);

        // Add deprecation warning
        const deprecationWarning =
          '⚠️ DEPRECATED: The "deepthinking" tool is deprecated. ' +
          "Use the focused tools instead: deepthinking_core, deepthinking_mathematics, " +
          "deepthinking_temporal, deepthinking_probabilistic, deepthinking_causal, " +
          "deepthinking_strategic, deepthinking_analytical, deepthinking_scientific, " +
          "deepthinking_session. See docs/migration/v4.0-tool-splitting.md for details.\n\n";

        switch (input.action) {
          case "add_thought": {
            const result = await handleAddThought(
              input,
              modeToToolMap[input.mode || "hybrid"] || "deepthinking_core",
            );
            return prependWarning(result, deprecationWarning);
          }
          case "summarize":
          case "export":
          case "switch_mode":
          case "get_session":
          case "recommend_mode": {
            const result = await handleSessionAction(input);
            return prependWarning(result, deprecationWarning);
          }
          default:
            throw new Error(`Unknown action: ${input.action}`);
        }
      }

      throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });
} // registerHandlers

/**
 * Prepend a warning message to a tool result
 */
function prependWarning(result: MCPResponse, warning: string): MCPResponse {
  if (
    result.content &&
    result.content[0] &&
    result.content[0].type === "text"
  ) {
    result.content[0].text = warning + result.content[0].text;
  }
  return result;
}

import { ThinkingToolInput } from "./tools/thinking.js";

/** Input type for thought handlers - validated by Zod schemas */
type ThoughtInput = Omit<
  ThinkingToolInput,
  | "action"
  | "exportFormat"
  | "newMode"
  | "problemType"
  | "problemCharacteristics"
  | "includeCombinations"
  | "includeReasoningTypes"
> & {
  // Override sessionId to be properly typed
  sessionId?: string;
  // Index signature to support all mode-specific properties (e.g., mathematicalModel, proofStrategy, etc.)
  [key: string]: unknown;
};

/** Input type for session action handlers - validated by Zod schemas */
type SessionInput = Record<string, unknown> & {
  action: string;
  sessionId?: string;
};

/** Input type for analyze handlers - validated by Zod schemas */
type AnalyzeInputType = Record<string, unknown> & {
  thought: string;
  timeoutPerMode?: number;
  customModes?: string[];
  preset?: string;
  mergeStrategy?: string;
  sessionId?: string;
  context?: string;
};

/**
 * Handle add_thought action for any thinking mode
 *
 * @param input - Validated thought input from Zod schema (contains all mode-specific properties)
 * @param _toolName - Name of the tool that invoked this handler (for debugging)
 * @returns MCP response with created thought and session data
 */
async function handleAddThought(
  input: ThoughtInput,
  _toolName: string,
): Promise<MCPResponse> {
  const sessionManager = await getSessionManager();
  // Phase 15A: thoughtFactory is now a module-level constant

  let sessionId = input.sessionId;

  // Determine mode from tool name or input
  const mode = (input.mode as ThinkingMode) || ThinkingMode.HYBRID;

  // Create session if none provided
  if (!sessionId) {
    const session = await sessionManager.createSession({
      mode: mode,
      title: `Thinking Session ${new Date().toISOString()}`,
    });
    sessionId = session.id;
  }

  // Use ThoughtFactory to create thought
  // Input is already validated by Zod and properly typed with index signature
  // The factory internally handles mode conversion from string to ThinkingMode
  // Add action='add_thought' to satisfy ThinkingToolInput interface (legacy compatibility)
  const thought = thoughtFactory.createThought(
    { ...input, action: "add_thought" as const },
    sessionId,
  );

  const session = await sessionManager.addThought(sessionId, thought);

  // Build response with analysis results if present
  // Phase 15A: Use thoughtFactory directly instead of registry singleton
  const hasHandler = thoughtFactory.hasSpecializedHandler(thought.mode);
  const modeStatus = {
    mode: thought.mode,
    isFullyImplemented: isFullyImplemented(thought.mode),
    hasSpecializedHandler: hasHandler,
    note: !isFullyImplemented(thought.mode)
      ? "This mode is experimental with limited runtime implementation"
      : hasHandler
        ? undefined
        : "Using generic handler - specialized validation not available",
  };

  // Type-safe response building
  const thoughtRecord = thought as unknown as Record<string, unknown>;
  const response: AddThoughtResponse = {
    sessionId: session.id,
    thoughtId: thought.id,
    thoughtNumber: thought.thoughtNumber,
    mode: thought.mode,
    nextThoughtNeeded: thought.nextThoughtNeeded,
    sessionComplete: session.isComplete,
    totalThoughts: session.thoughts.length,
    modeStatus, // Phase 10 Sprint 1: API transparency
    // Advisory validation feedback attached by SessionManager.addThought().
    // Present unless the session disables validation. Never gates the call.
    validation: thought.validation,
    // Advisory proof analysis attached by SessionManager.addThought(). Present
    // only when the thought carried proof content. Never gates the call.
    proofAnalysis: thought.proofAnalysis,
    // Include analysis results in response if available
    decomposition: thoughtRecord.decomposition,
    consistencyReport: thoughtRecord.consistencyReport,
    gapAnalysis: thoughtRecord.gapAnalysis,
  };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response, null, 2),
      },
    ],
  };
}

/**
 * Handle session actions (summarize, export, export_all, switch_mode, get_session, recommend_mode, delete_session)
 */
async function handleSessionAction(input: SessionInput): Promise<MCPResponse> {
  const action = input.action;

  switch (action) {
    case "summarize":
      return await handleSummarize(input);
    case "export":
      return await handleExport(input);
    case "export_all":
      return await handleExportAll(input);
    case "switch_mode":
      return await handleSwitchMode(input);
    case "get_session":
      return await handleGetSession(input);
    case "recommend_mode":
      return await handleRecommendMode(input);
    case "delete_session":
      return await handleDeleteSession(input);
    default:
      throw new Error(`Unknown session action: ${action}`);
  }
}

/**
 * Handle summarize action
 */
async function handleSummarize(input: SessionInput): Promise<MCPResponse> {
  if (!input.sessionId) {
    throw new Error("sessionId required for summarize action");
  }

  const sessionManager = await getSessionManager();
  const summary = await sessionManager.generateSummary(input.sessionId);

  return {
    content: [
      {
        type: "text",
        text: summary,
      },
    ],
  };
}

/**
 * Handle export action
 * Phase 16: Added file export support via outputDir parameter or MCP_EXPORT_DIR config
 */
async function handleExport(input: SessionInput): Promise<MCPResponse> {
  if (!input.sessionId) {
    throw new Error("sessionId required for export action");
  }

  const sessionManager = await getSessionManager();
  // Phase 15A: exportService is now a module-level constant

  const session = await sessionManager.getSession(input.sessionId);
  if (!session) {
    throw new Error(`Session ${input.sessionId} not found`);
  }

  // Phase 16: File export support - use config defaults if not specified in request
  const { getConfig } = await import("./config/index.js");
  const config = getConfig();
  const requestedOutputDir = input.outputDir as string | undefined;
  // Security: when the caller is allowed to specify an outputDir, sandbox it
  // against MCP_EXPORT_PATH (or a per-user default). Reject paths that escape.
  let outputDir: string | undefined;
  if (requestedOutputDir || config.exportDir) {
    const { resolveSandboxedOutputDir } =
      await import("./export/file-exporter.js");
    outputDir = resolveSandboxedOutputDir(requestedOutputDir, config.exportDir);
  }
  const overwrite = (input.overwrite as boolean) ?? config.exportOverwrite;

  // Phase 12: Support export profiles
  const exportProfile = input.exportProfile as string | undefined;
  if (exportProfile) {
    const { getExportProfile } = await import("./export/profiles.js");
    type ExportProfileId =
      "academic" | "presentation" | "documentation" | "archive" | "minimal";
    const profile = getExportProfile(exportProfile as ExportProfileId);

    if (!profile) {
      throw new Error(
        `Unknown export profile: ${exportProfile}. Valid profiles: academic, presentation, documentation, archive, minimal`,
      );
    }

    // Phase 16: If outputDir provided, use FileExporter
    if (outputDir) {
      const { createFileExporter } = await import("./export/file-exporter.js");
      const fileExporter = createFileExporter(
        { outputDir, overwrite, createDir: true },
        (s, f) => exportService.exportSession(s, f as any),
      );

      const batchResult = await fileExporter.exportToFiles(
        session,
        profile.formats,
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                mode: "file",
                profile: { id: profile.id, name: profile.name },
                outputDir: batchResult.outputDir,
                successCount: batchResult.successCount,
                failureCount: batchResult.failureCount,
                totalSize: batchResult.totalSize,
                files: batchResult.results.map((r) => ({
                  format: r.format,
                  path: r.filePath,
                  success: r.success,
                  size: r.size,
                  error: r.error,
                })),
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    // Export all formats defined in the profile (return as content)
    const results: {
      format: string;
      success: boolean;
      content?: string;
      error?: string;
    }[] = [];

    for (const format of profile.formats) {
      try {
        const exported = exportService.exportSession(session, format as any);
        results.push({ format, success: true, content: exported });
      } catch (error) {
        results.push({
          format,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const output = {
      profile: {
        id: profile.id,
        name: profile.name,
        description: profile.description,
        options: profile.options,
      },
      summary: {
        totalFormats: results.length,
        successful: successCount,
        failed: results.length - successCount,
      },
      exports: results.map((r) => ({
        format: r.format,
        success: r.success,
        ...(r.success ? { content: r.content } : { error: r.error }),
      })),
    };

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(output, null, 2),
        },
      ],
    };
  }

  // Standard single-format export
  const format = input.exportFormat || "json";

  // Phase 16: If outputDir provided, write to file
  if (outputDir) {
    const { createFileExporter } = await import("./export/file-exporter.js");
    const fileExporter = createFileExporter(
      { outputDir, overwrite, createDir: true },
      (s, f) => exportService.exportSession(s, f as any),
    );

    const result = await fileExporter.exportToFile(session, format as any);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              mode: "file",
              format: result.format,
              path: result.filePath,
              success: result.success,
              size: result.size,
              error: result.error,
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  // Return content as text (original behavior)
  const exported = exportService.exportSession(session, format as any);

  return {
    content: [
      {
        type: "text" as const,
        text: exported,
      },
    ],
  };
}

/**
 * Handle export_all action - exports all 8 formats at once (or profile-specific formats)
 * Phase 12 Sprint 4, Phase 16: Added file export support via outputDir parameter or MCP_EXPORT_DIR config
 */
async function handleExportAll(input: SessionInput): Promise<MCPResponse> {
  if (!input.sessionId) {
    throw new Error("sessionId required for export_all action");
  }

  const sessionManager = await getSessionManager();
  // Phase 15A: exportService is now a module-level constant

  const session = await sessionManager.getSession(input.sessionId);
  if (!session) {
    throw new Error(`Session ${input.sessionId} not found`);
  }

  // Phase 16: File export support - use config defaults if not specified in request
  const { getConfig } = await import("./config/index.js");
  const config = getConfig();
  const requestedOutputDir = input.outputDir as string | undefined;
  // Security: sandbox caller-supplied outputDir under MCP_EXPORT_PATH (or
  // a per-user default) to prevent arbitrary FS writes via prompt injection.
  let outputDir: string | undefined;
  if (requestedOutputDir || config.exportDir) {
    const { resolveSandboxedOutputDir } =
      await import("./export/file-exporter.js");
    outputDir = resolveSandboxedOutputDir(requestedOutputDir, config.exportDir);
  }
  const overwrite = (input.overwrite as boolean) ?? config.exportOverwrite;

  // Phase 12: Support export profiles in export_all
  let formats: readonly string[] = [
    "markdown",
    "latex",
    "json",
    "html",
    "jupyter",
    "mermaid",
    "dot",
    "ascii",
  ];

  const exportAllProfile = input.exportProfile as string | undefined;
  if (exportAllProfile) {
    const { getExportProfile } = await import("./export/profiles.js");
    type ExportProfileId =
      "academic" | "presentation" | "documentation" | "archive" | "minimal";
    const profile = getExportProfile(exportAllProfile as ExportProfileId);

    if (!profile) {
      throw new Error(
        `Unknown export profile: ${exportAllProfile}. Valid profiles: academic, presentation, documentation, archive, minimal`,
      );
    }

    // Use only the formats defined in the profile
    formats = profile.formats;
  }

  // Phase 16: If outputDir provided, use FileExporter
  if (outputDir) {
    const { createFileExporter } = await import("./export/file-exporter.js");
    const fileExporter = createFileExporter(
      { outputDir, overwrite, createDir: true },
      (s, f) => exportService.exportSession(s, f as any),
    );

    const batchResult = await fileExporter.exportToFiles(
      session,
      formats as any,
    );

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              mode: "file",
              sessionId: input.sessionId,
              outputDir: batchResult.outputDir,
              successCount: batchResult.successCount,
              failureCount: batchResult.failureCount,
              totalSize: batchResult.totalSize,
              exportedAt: batchResult.exportedAt.toISOString(),
              files: batchResult.results.map((r) => ({
                format: r.format,
                path: r.filePath,
                success: r.success,
                size: r.size,
                error: r.error,
              })),
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  // Original behavior: generate content in memory
  const results: {
    format: string;
    success: boolean;
    content?: string;
    error?: string;
  }[] = [];

  for (const format of formats) {
    try {
      const exported = exportService.exportSession(session, format as any);
      results.push({ format, success: true, content: exported });
    } catch (error) {
      results.push({
        format,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  // Build summary
  const summary = {
    sessionId: input.sessionId,
    totalFormats: formats.length,
    successCount,
    failureCount,
    results: results.map((r) => ({
      format: r.format,
      success: r.success,
      size: r.content?.length || 0,
      error: r.error,
    })),
  };

  // If includeContent is true, include all successful exports
  if (input.includeContent) {
    const contentMap: Record<string, string> = {};
    for (const r of results) {
      if (r.success && r.content) {
        contentMap[r.format] = r.content;
      }
    }
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ ...summary, exports: contentMap }, null, 2),
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(summary, null, 2),
      },
    ],
  };
}

/**
 * Handle switch_mode action
 * Phase 15A Sprint 2: Inlined from ModeRouter
 */
async function handleSwitchMode(input: SessionInput): Promise<MCPResponse> {
  const newMode = input.newMode as string | undefined;
  if (!input.sessionId || !newMode) {
    throw new Error("sessionId and newMode required for switch_mode action");
  }

  const sessionManager = await getSessionManager();
  const session = await sessionManager.switchMode(
    input.sessionId,
    newMode as ThinkingMode,
    "User requested mode switch",
  );

  return {
    content: [
      {
        type: "text",
        text: `Switched session ${session.id} to ${session.mode} mode`,
      },
    ],
  };
}

/**
 * Handle get_session action
 */
async function handleGetSession(input: SessionInput): Promise<MCPResponse> {
  if (!input.sessionId) {
    throw new Error("sessionId required for get_session action");
  }

  const sessionManager = await getSessionManager();
  const session = await sessionManager.getSession(input.sessionId);
  if (!session) {
    throw new Error(`Session ${input.sessionId} not found`);
  }

  // Convert Map to object for JSON serialization
  const metricsWithCustom = {
    ...session.metrics,
    customMetrics: Object.fromEntries(session.metrics.customMetrics),
  };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            id: session.id,
            title: session.title,
            mode: session.mode,
            thoughtCount: session.thoughts.length,
            isComplete: session.isComplete,
            metrics: metricsWithCustom,
          },
          null,
          2,
        ),
      },
    ],
  };
}

/**
 * Handle recommend_mode action
 * Phase 15A Sprint 2: Inlined from ModeRouter, uses ModeRecommender directly
 * v9.4.0: Response built by RecommendationService, which also attaches
 * advisory reasoning-type advice from the taxonomy.
 */
async function handleRecommendMode(input: SessionInput): Promise<MCPResponse> {
  const response = buildModeRecommendation({
    problemType: input.problemType as string | undefined,
    problemCharacteristics: input.problemCharacteristics as
      ProblemCharacteristics | undefined,
    includeCombinations: input.includeCombinations as boolean | undefined,
    includeReasoningTypes: input.includeReasoningTypes as boolean | undefined,
  });

  return {
    content: [
      {
        type: "text" as const,
        text: response,
      },
    ],
  };
}
/**
 * Handle delete_session action
 */
async function handleDeleteSession(input: SessionInput): Promise<MCPResponse> {
  if (!input.sessionId) {
    throw new Error("sessionId required for delete_session action");
  }

  const sessionManager = await getSessionManager();
  const session = await sessionManager.getSession(input.sessionId);

  if (!session) {
    throw new Error(`Session ${input.sessionId} not found`);
  }

  await sessionManager.deleteSession(input.sessionId);

  return {
    content: [
      {
        type: "text",
        text: `Session ${input.sessionId} deleted successfully`,
      },
    ],
  };
}

/**
 * Handle multi-mode analyze action (Phase 12 Sprint 3)
 * Phase 12 fix: Now creates an exportable session for the analysis results
 */
async function handleAnalyze(input: AnalyzeInputType): Promise<MCPResponse> {
  const { MultiModeAnalyzer } = await import("./modes/combinations/index.js");

  const DEFAULT_TIMEOUT_PER_MODE = 30000;
  const analyzer = new MultiModeAnalyzer({
    defaultTimeoutPerMode: input.timeoutPerMode || DEFAULT_TIMEOUT_PER_MODE,
    continueOnError: true,
    verbose: false,
  });

  // Map string modes to ThinkingMode enum values if provided
  let customModes: ThinkingMode[] | undefined;
  if (input.customModes && input.customModes.length > 0) {
    customModes = input.customModes.map((mode: string) => mode as ThinkingMode);
  }

  type MergeStrategy =
    "union" | "intersection" | "weighted" | "hierarchical" | "dialectical";
  const response = await analyzer.analyze({
    thought: input.thought,
    preset: input.preset,
    customModes,
    mergeStrategy: (input.mergeStrategy || "union") as MergeStrategy,
    sessionId: input.sessionId,
    context: input.context,
    timeoutPerMode: input.timeoutPerMode,
  });

  // Phase 12 fix: Create an exportable session for the analysis results
  const sessionManager = await getSessionManager();

  const TITLE_MAX_LENGTH = 50;
  // Create a session for the analysis
  const session = await sessionManager.createSession({
    title: `Multi-mode Analysis: ${input.thought.substring(0, TITLE_MAX_LENGTH)}${input.thought.length > TITLE_MAX_LENGTH ? "..." : ""}`,
    mode: ThinkingMode.HYBRID,
  });

  // Add a hybrid thought summarizing the multi-mode analysis
  const analysisContent = `Multi-mode analysis: ${input.thought}\n\nConclusion: ${response.analysis.synthesizedConclusion}\n\nInsights:\n${response.analysis.primaryInsights.map((i) => `- [${i.sourceMode}] ${i.content}`).join("\n")}`;
  const hybridThought = {
    id: response.analysis.id,
    sessionId: session.id,
    content: analysisContent, // Use 'content' not 'thought' for exporters
    thoughtNumber: 1,
    totalThoughts: 1,
    timestamp: new Date(),
    nextThoughtNeeded: false,
    mode: ThinkingMode.HYBRID,
  };
  await sessionManager.addThought(
    session.id,
    hybridThought as unknown as Parameters<typeof sessionManager.addThought>[1],
  );

  const sessionId = session.id;

  // Format the response for MCP output
  const result: AnalyzeResponse = {
    success: response.success,
    sessionId, // Include session ID for export
    analysisId: response.analysis.id,
    modesUsed: response.analysis.contributingModes.length,
    contributingModes: response.analysis.contributingModes,
    synthesizedConclusion: response.analysis.synthesizedConclusion,
    // Emit the number only when something actually derived it. Passing it
    // through unconditionally is how a constant 0.5 reached clients while the
    // explanation stayed behind in the analysis object.
    ...(response.analysis.confidenceBasis === "derived"
      ? { confidenceScore: response.analysis.confidenceScore }
      : {}),
    confidenceBasis: response.analysis.confidenceBasis,
    confidenceNote: response.analysis.confidenceNote,
    primaryInsights: response.analysis.primaryInsights.map((i) => ({
      id: i.id,
      content: i.content,
      sourceMode: String(i.sourceMode),
      ...(i.confidenceBasis === "derived" ? { confidence: i.confidence } : {}),
      confidenceBasis: i.confidenceBasis,
      confidenceNote: i.confidenceNote,
      category: i.category,
      priority: i.priority,
    })),
    conflictsDetected: response.analysis.statistics.conflictsDetected,
    conflictsResolved: response.analysis.statistics.conflictsResolved,
    mergeStrategy: response.analysis.mergeStrategy,
    executionTime: response.executionTime,
    errors: response.errors,
    statistics: {
      totalInsightsBefore: response.analysis.statistics.totalInsightsBefore,
      totalInsightsAfter: response.analysis.statistics.totalInsightsAfter,
      duplicatesRemoved: response.analysis.statistics.duplicatesRemoved,
      averageConfidence: response.analysis.statistics.averageConfidence,
      mergeTime: response.analysis.statistics.mergeTime,
    },
    exportable: true, // Indicate session is exportable
    exportHint: `Use deepthinking_session with action: 'export', sessionId: '${sessionId}' to export results`,
  };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

/**
 * Main server startup — serves MCP 2026-07-28 (stateless) and legacy 2025-era
 * clients on the same stdio connection via `serveStdio`.
 */
export async function main() {
  serveStdio(() => buildServer(), { legacy: "serve" });
  console.error(
    `DeepThinking MCP server running on stdio (protocol ${MCP_PROTOCOL_VERSION} + legacy)`,
  );
}

/**
 * Is this module the process entry point, rather than an import?
 *
 * `main()` used to be called unconditionally at module scope, which made this
 * file impossible to import: any test that tried would connect a stdio
 * transport. That is the root cause of this repo's dead-code problem -- the
 * entry point holds all 13 tool handlers and the whole dispatch, and none of it
 * could be reached by a test, so handlers drifted out of use while the suite
 * stayed green.
 *
 * `realpathSync` on BOTH sides is what makes this correct for the shipped
 * artifact, not just for `node dist/index.js`:
 *   - `npm`/`npx` install `bin.deepthinking-mcp` as `node_modules/.bin/
 *     deepthinking-mcp`. On POSIX that is a SYMLINK to `dist/index.js`, so
 *     `argv[1]` is the symlink path and a raw string compare fails -- the
 *     server would exit 0, silently, having served nothing. Resolving both
 *     sides to their real paths makes them equal.
 *   - On Windows npm writes a `.cmd`/`.ps1` shim that invokes `node` with the
 *     real path, so `argv[1]` already matches; `realpathSync` is a no-op there.
 *
 * VERIFICATION IS MANUAL AND MANDATORY AFTER TOUCHING THIS FUNCTION. There is
 * deliberately no automated test for it, because the only honest one would run
 * the BUILT artifact, and `dist/` is committed and usually stale during
 * development -- such a test would either pass against a stale bundle that does
 * not contain this code (a tautology) or sit permanently red. See
 * "Entry-point guard" in CLAUDE.md for the four-case handshake procedure.
 *
 * What IS automated is the opposite direction: `tests/integration/
 * index-server.test.ts` imports this module, so if the guard ever starts
 * returning `true` unconditionally, that file fails at setup with "Already
 * connected to a transport".
 *
 * Do not "simplify" this to a string compare or an `import.meta.main` check
 * without re-running the manual procedure: every way of getting this wrong
 * fails by exiting 0 with no output, which is indistinguishable from a healthy
 * start unless you complete a real handshake.
 */
function isProcessEntryPoint(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    // A path that cannot be resolved is not this module.
    return false;
  }
}

if (isProcessEntryPoint()) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
