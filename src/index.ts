#!/usr/bin/env node

/**
 * DeepThinking MCP Server (v8.4.0)
 *
 * 33 advanced reasoning modes with ModeHandler pattern, meta-reasoning,
 * taxonomy classifier, enterprise security, and visual export capabilities.
 *
 * Tools (13 total):
 * - deepthinking_core: inductive, deductive, abductive modes
 * - deepthinking_standard: sequential, shannon, hybrid modes
 * - deepthinking_mathematics: mathematics, physics, computability modes
 * - deepthinking_temporal: temporal reasoning
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

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import package.json for version sync
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

// Import new tool definitions and schemas
import { toolList, toolSchemas, isValidTool, modeToToolMap } from './tools/definitions.js';
import { thinkingTool } from './tools/thinking.js'; // Legacy tool for backward compatibility
import type { SessionManager } from './session/index.js';
import {
  ThinkingMode,
  isFullyImplemented,
  type MCPResponse,
  type AddThoughtResponse,
  type AnalyzeResponse,
  type ProblemCharacteristics,
} from './types/index.js';
import type { ThoughtFactory, ExportService, ModeRouter } from './services/index.js';
import { ModeHandlerRegistry } from './modes/index.js';

// Initialize server
const server = new Server(
  {
    name: packageJson.name,
    version: packageJson.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Lazy Service Initialization (Sprint 9.1)
 * Services are loaded on first use to reduce startup time
 */
let _sessionManager: SessionManager | null = null;
let _thoughtFactory: ThoughtFactory | null = null;
let _exportService: ExportService | null = null;
let _modeRouter: ModeRouter | null = null;

async function getSessionManager(): Promise<SessionManager> {
  if (!_sessionManager) {
    const { SessionManager } = await import('./session/index.js');

    // Check for SESSION_DIR environment variable for multi-instance support
    const sessionDir = process.env.SESSION_DIR;

    if (sessionDir) {
      // Use file-based storage with shared directory for multi-instance support
      const { FileSessionStore } = await import('./session/storage/file-store.js');
      const storage = new FileSessionStore(sessionDir);
      await storage.initialize();
      _sessionManager = new SessionManager({}, undefined, storage);
      console.error(`[deepthinking-mcp] Using file-based session storage: ${sessionDir}`);
    } else {
      // Default: in-memory only (single instance)
      _sessionManager = new SessionManager();
    }
  }
  return _sessionManager;
}

async function getThoughtFactory(): Promise<ThoughtFactory> {
  if (!_thoughtFactory) {
    const { ThoughtFactory } = await import('./services/index.js');
    _thoughtFactory = new ThoughtFactory();
  }
  return _thoughtFactory;
}

async function getExportService(): Promise<ExportService> {
  if (!_exportService) {
    const { ExportService } = await import('./services/index.js');
    _exportService = new ExportService();
  }
  return _exportService;
}

async function getModeRouter(): Promise<ModeRouter> {
  if (!_modeRouter) {
    const { ModeRouter } = await import('./services/index.js');
    const sessionManager = await getSessionManager();
    _modeRouter = new ModeRouter(sessionManager);
  }
  return _modeRouter;
}

// Register tool list handler - now returns all 9 focused tools + legacy
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      ...toolList,      // 9 new focused tools
      thinkingTool,     // Legacy tool for backward compatibility
    ],
  };
});

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Handle new focused tools
    if (isValidTool(name)) {
      const schema = toolSchemas[name as keyof typeof toolSchemas];
      const input = schema.parse(args);

      // Session action tool
      if (name === 'deepthinking_session') {
        return await handleSessionAction(input as SessionInput);
      }

      // Multi-mode analyze tool (Phase 12 Sprint 3)
      if (name === 'deepthinking_analyze') {
        return await handleAnalyze(input as AnalyzeInputType);
      }

      // All other tools are for adding thoughts
      return await handleAddThought(input as ThoughtInput, name);
    }

    // Handle legacy tool (backward compatibility)
    if (name === 'deepthinking') {
      const { ThinkingToolSchema } = await import('./tools/thinking.js');
      const input = ThinkingToolSchema.parse(args);

      // Add deprecation warning
      const deprecationWarning = '⚠️ DEPRECATED: The "deepthinking" tool is deprecated. ' +
        'Use the focused tools instead: deepthinking_core, deepthinking_mathematics, ' +
        'deepthinking_temporal, deepthinking_probabilistic, deepthinking_causal, ' +
        'deepthinking_strategic, deepthinking_analytical, deepthinking_scientific, ' +
        'deepthinking_session. See docs/migration/v4.0-tool-splitting.md for details.\n\n';

      switch (input.action) {
        case 'add_thought': {
          const result = await handleAddThought(input, modeToToolMap[input.mode || 'hybrid'] || 'deepthinking_core');
          return prependWarning(result, deprecationWarning);
        }
        case 'summarize':
        case 'export':
        case 'switch_mode':
        case 'get_session':
        case 'recommend_mode': {
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
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Prepend a warning message to a tool result
 */
function prependWarning(result: MCPResponse, warning: string): MCPResponse {
  if (result.content && result.content[0] && result.content[0].type === 'text') {
    result.content[0].text = warning + result.content[0].text;
  }
  return result;
}

/** Input type for thought handlers - validated by Zod schemas */
type ThoughtInput = Record<string, unknown> & {
  sessionId?: string;
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  mode?: string;
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
 */
async function handleAddThought(input: ThoughtInput, _toolName: string): Promise<MCPResponse> {
  const sessionManager = await getSessionManager();
  const thoughtFactory = await getThoughtFactory();

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

  // Use ThoughtFactory to create thought - cast input for schema compatibility
  // The factory internally handles mode conversion from string to ThinkingMode
  const thought = thoughtFactory.createThought(input as Parameters<typeof thoughtFactory.createThought>[0], sessionId);

  const session = await sessionManager.addThought(sessionId, thought);

  // Build response with analysis results if present
  const registry = ModeHandlerRegistry.getInstance();
  const modeStatus = {
    mode: thought.mode,
    isFullyImplemented: isFullyImplemented(thought.mode),
    hasSpecializedHandler: registry.hasSpecializedHandler(thought.mode),
    note: !isFullyImplemented(thought.mode)
      ? 'This mode is experimental with limited runtime implementation'
      : registry.hasSpecializedHandler(thought.mode)
        ? undefined
        : 'Using generic handler - specialized validation not available',
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
    // Include analysis results in response if available
    decomposition: thoughtRecord.decomposition,
    consistencyReport: thoughtRecord.consistencyReport,
    gapAnalysis: thoughtRecord.gapAnalysis,
  };

  return {
    content: [
      {
        type: 'text',
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
    case 'summarize':
      return await handleSummarize(input);
    case 'export':
      return await handleExport(input);
    case 'export_all':
      return await handleExportAll(input);
    case 'switch_mode':
      return await handleSwitchMode(input);
    case 'get_session':
      return await handleGetSession(input);
    case 'recommend_mode':
      return await handleRecommendMode(input);
    case 'delete_session':
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
    throw new Error('sessionId required for summarize action');
  }

  const sessionManager = await getSessionManager();
  const summary = await sessionManager.generateSummary(input.sessionId);

  return {
    content: [
      {
        type: 'text',
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
    throw new Error('sessionId required for export action');
  }

  const sessionManager = await getSessionManager();
  const exportService = await getExportService();

  const session = await sessionManager.getSession(input.sessionId);
  if (!session) {
    throw new Error(`Session ${input.sessionId} not found`);
  }

  // Phase 16: File export support - use config defaults if not specified in request
  const { getConfig } = await import('./config/index.js');
  const config = getConfig();
  const outputDir = (input.outputDir as string | undefined) || config.exportDir || undefined;
  const overwrite = (input.overwrite as boolean) ?? config.exportOverwrite;

  // Phase 12: Support export profiles
  const exportProfile = input.exportProfile as string | undefined;
  if (exportProfile) {
    const { getExportProfile } = await import('./export/profiles.js');
    type ExportProfileId = 'academic' | 'presentation' | 'documentation' | 'archive' | 'minimal';
    const profile = getExportProfile(exportProfile as ExportProfileId);

    if (!profile) {
      throw new Error(`Unknown export profile: ${exportProfile}. Valid profiles: academic, presentation, documentation, archive, minimal`);
    }

    // Phase 16: If outputDir provided, use FileExporter
    if (outputDir) {
      const { createFileExporter } = await import('./export/file-exporter.js');
      const fileExporter = createFileExporter(
        { outputDir, overwrite, createDir: true },
        (s, f) => exportService.exportSession(s, f as any)
      );

      const formats = profile.formats.filter((f: string) => f !== 'svg');
      const batchResult = await fileExporter.exportToFiles(session, formats);

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            mode: 'file',
            profile: { id: profile.id, name: profile.name },
            outputDir: batchResult.outputDir,
            successCount: batchResult.successCount,
            failureCount: batchResult.failureCount,
            totalSize: batchResult.totalSize,
            files: batchResult.results.map(r => ({
              format: r.format,
              path: r.filePath,
              success: r.success,
              size: r.size,
              error: r.error,
            })),
          }, null, 2),
        }],
      };
    }

    // Export all formats defined in the profile (return as content)
    const results: { format: string; success: boolean; content?: string; error?: string }[] = [];

    for (const format of profile.formats) {
      try {
        // Skip SVG for now as it may not be in all exporters
        if (format === 'svg') continue;
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

    const successCount = results.filter(r => r.success).length;
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
      exports: results.map(r => ({
        format: r.format,
        success: r.success,
        ...(r.success ? { content: r.content } : { error: r.error }),
      })),
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(output, null, 2),
      }],
    };
  }

  // Standard single-format export
  const format = input.exportFormat || 'json';

  // Phase 16: If outputDir provided, write to file
  if (outputDir) {
    const { createFileExporter } = await import('./export/file-exporter.js');
    const fileExporter = createFileExporter(
      { outputDir, overwrite, createDir: true },
      (s, f) => exportService.exportSession(s, f as any)
    );

    const result = await fileExporter.exportToFile(session, format as any);

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          mode: 'file',
          format: result.format,
          path: result.filePath,
          success: result.success,
          size: result.size,
          error: result.error,
        }, null, 2),
      }],
    };
  }

  // Return content as text (original behavior)
  const exported = exportService.exportSession(session, format as any);

  return {
    content: [{
      type: 'text' as const,
      text: exported,
    }],
  };
}

/**
 * Handle export_all action - exports all 8 formats at once (or profile-specific formats)
 * Phase 12 Sprint 4, Phase 16: Added file export support via outputDir parameter or MCP_EXPORT_DIR config
 */
async function handleExportAll(input: SessionInput): Promise<MCPResponse> {
  if (!input.sessionId) {
    throw new Error('sessionId required for export_all action');
  }

  const sessionManager = await getSessionManager();
  const exportService = await getExportService();

  const session = await sessionManager.getSession(input.sessionId);
  if (!session) {
    throw new Error(`Session ${input.sessionId} not found`);
  }

  // Phase 16: File export support - use config defaults if not specified in request
  const { getConfig } = await import('./config/index.js');
  const config = getConfig();
  const outputDir = (input.outputDir as string | undefined) || config.exportDir || undefined;
  const overwrite = (input.overwrite as boolean) ?? config.exportOverwrite;

  // Phase 12: Support export profiles in export_all
  let formats: readonly string[] = ['markdown', 'latex', 'json', 'html', 'jupyter', 'mermaid', 'dot', 'ascii'];

  const exportAllProfile = input.exportProfile as string | undefined;
  if (exportAllProfile) {
    const { getExportProfile } = await import('./export/profiles.js');
    type ExportProfileId = 'academic' | 'presentation' | 'documentation' | 'archive' | 'minimal';
    const profile = getExportProfile(exportAllProfile as ExportProfileId);

    if (!profile) {
      throw new Error(`Unknown export profile: ${exportAllProfile}. Valid profiles: academic, presentation, documentation, archive, minimal`);
    }

    // Use only the formats defined in the profile (excluding svg which isn't widely supported)
    formats = profile.formats.filter((f: string) => f !== 'svg');
  }

  // Phase 16: If outputDir provided, use FileExporter
  if (outputDir) {
    const { createFileExporter } = await import('./export/file-exporter.js');
    const fileExporter = createFileExporter(
      { outputDir, overwrite, createDir: true },
      (s, f) => exportService.exportSession(s, f as any)
    );

    const batchResult = await fileExporter.exportToFiles(session, formats as any);

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          mode: 'file',
          sessionId: input.sessionId,
          outputDir: batchResult.outputDir,
          successCount: batchResult.successCount,
          failureCount: batchResult.failureCount,
          totalSize: batchResult.totalSize,
          exportedAt: batchResult.exportedAt.toISOString(),
          files: batchResult.results.map(r => ({
            format: r.format,
            path: r.filePath,
            success: r.success,
            size: r.size,
            error: r.error,
          })),
        }, null, 2),
      }],
    };
  }

  // Original behavior: generate content in memory
  const results: { format: string; success: boolean; content?: string; error?: string }[] = [];

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

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  // Build summary
  const summary = {
    sessionId: input.sessionId,
    totalFormats: formats.length,
    successCount,
    failureCount,
    results: results.map(r => ({
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
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ ...summary, exports: contentMap }, null, 2),
      }],
    };
  }

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify(summary, null, 2),
    }],
  };
}

/**
 * Handle switch_mode action
 */
async function handleSwitchMode(input: SessionInput): Promise<MCPResponse> {
  const newMode = input.newMode as string | undefined;
  if (!input.sessionId || !newMode) {
    throw new Error('sessionId and newMode required for switch_mode action');
  }

  const modeRouter = await getModeRouter();
  const session = await modeRouter.switchMode(
    input.sessionId,
    newMode as ThinkingMode,
    'User requested mode switch'
  );

  return {
    content: [
      {
        type: 'text',
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
    throw new Error('sessionId required for get_session action');
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
        type: 'text',
        text: JSON.stringify({
          id: session.id,
          title: session.title,
          mode: session.mode,
          thoughtCount: session.thoughts.length,
          isComplete: session.isComplete,
          metrics: metricsWithCustom,
        }, null, 2),
      },
    ],
  };
}

/**
 * Handle recommend_mode action
 */
async function handleRecommendMode(input: SessionInput): Promise<MCPResponse> {
  const modeRouter = await getModeRouter();
  const problemType = input.problemType as string | undefined;
  const problemCharacteristics = input.problemCharacteristics as ProblemCharacteristics | undefined;
  const includeCombinations = input.includeCombinations as boolean | undefined;

  // Quick recommendation based on problem type
  if (problemType && !problemCharacteristics) {
    const recommendedMode = modeRouter.quickRecommend(problemType);
    const response = modeRouter.formatQuickRecommendation(problemType, recommendedMode);

    return {
      content: [{
        type: 'text' as const,
        text: response
      }],
    };
  }

  // Comprehensive recommendations based on problem characteristics
  if (problemCharacteristics) {
    const response = modeRouter.getRecommendations(
      problemCharacteristics,
      includeCombinations || false
    );

    return {
      content: [{
        type: 'text' as const,
        text: response
      }],
    };
  }

  // No valid input provided - throw error for consistent error handling
  throw new Error('Please provide either problemType or problemCharacteristics for mode recommendations.');
}
/**
 * Handle delete_session action
 */
async function handleDeleteSession(input: SessionInput): Promise<MCPResponse> {
  if (!input.sessionId) {
    throw new Error('sessionId required for delete_session action');
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
        type: 'text',
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
  const { MultiModeAnalyzer } = await import('./modes/combinations/index.js');

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

  type MergeStrategy = 'union' | 'intersection' | 'weighted' | 'hierarchical' | 'dialectical';
  const response = await analyzer.analyze({
    thought: input.thought,
    preset: input.preset,
    customModes,
    mergeStrategy: (input.mergeStrategy || 'union') as MergeStrategy,
    sessionId: input.sessionId,
    context: input.context,
    timeoutPerMode: input.timeoutPerMode,
  });

  // Phase 12 fix: Create an exportable session for the analysis results
  const sessionManager = await getSessionManager();

  const TITLE_MAX_LENGTH = 50;
  // Create a session for the analysis
  const session = await sessionManager.createSession({
    title: `Multi-mode Analysis: ${input.thought.substring(0, TITLE_MAX_LENGTH)}${input.thought.length > TITLE_MAX_LENGTH ? '...' : ''}`,
    mode: ThinkingMode.HYBRID,
  });

  // Add a hybrid thought summarizing the multi-mode analysis
  const analysisContent = `Multi-mode analysis: ${input.thought}\n\nConclusion: ${response.analysis.synthesizedConclusion}\n\nInsights:\n${response.analysis.primaryInsights.map((i) => `- [${i.sourceMode}] ${i.content}`).join('\n')}`;
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
  await sessionManager.addThought(session.id, hybridThought as unknown as Parameters<typeof sessionManager.addThought>[1]);

  const sessionId = session.id;

  // Format the response for MCP output
  const result: AnalyzeResponse = {
    success: response.success,
    sessionId, // Include session ID for export
    analysisId: response.analysis.id,
    modesUsed: response.analysis.contributingModes.length,
    contributingModes: response.analysis.contributingModes,
    synthesizedConclusion: response.analysis.synthesizedConclusion,
    confidenceScore: response.analysis.confidenceScore,
    primaryInsights: response.analysis.primaryInsights.map((i) => ({
      id: i.id,
      content: i.content,
      sourceMode: String(i.sourceMode),
      confidence: i.confidence,
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
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

/**
 * Main server startup
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('DeepThinking MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
