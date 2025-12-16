#!/usr/bin/env node

/**
 * DeepThinking MCP Server (v8.0.0)
 *
 * 33 advanced reasoning modes with ModeHandler pattern, meta-reasoning,
 * taxonomy classifier, enterprise security, and visual export capabilities.
 *
 * Tools:
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
 * - deepthinking_session: summarize, export, get_session, switch_mode, recommend_mode
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
import { ThinkingMode, isFullyImplemented } from './types/index.js';
import type { ThoughtFactory, ExportService, ModeRouter } from './services/index.js';
import { ModeHandlerRegistry } from './modes/handlers/index.js';

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
        return await handleSessionAction(input);
      }

      // All other tools are for adding thoughts
      return await handleAddThought(input, name);
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
function prependWarning(result: any, warning: string) {
  if (result.content && result.content[0] && result.content[0].type === 'text') {
    result.content[0].text = warning + result.content[0].text;
  }
  return result;
}

/**
 * Check if a thought type is a proof decomposition type (Phase 8)
 */
function isDecompositionThoughtType(thoughtType: string | undefined): boolean {
  return [
    'proof_decomposition',
    'dependency_analysis',
    'consistency_check',
    'gap_identification',
    'assumption_trace',
  ].includes(thoughtType || '');
}

/**
 * Lazy load MathematicsReasoningEngine (Phase 8)
 */
let _mathEngine: any = null;
async function getMathematicsReasoningEngine() {
  if (!_mathEngine) {
    const { MathematicsReasoningEngine } = await import('./modes/mathematics-reasoning.js');
    _mathEngine = new MathematicsReasoningEngine();
  }
  return _mathEngine;
}

/**
 * Handle add_thought action for any thinking mode
 */
async function handleAddThought(input: any, _toolName: string) {
  const sessionManager = await getSessionManager();
  const thoughtFactory = await getThoughtFactory();

  let sessionId = input.sessionId;

  // Determine mode from tool name or input
  let mode: ThinkingMode = input.mode || ThinkingMode.HYBRID;

  // Create session if none provided
  if (!sessionId) {
    const session = await sessionManager.createSession({
      mode: mode,
      title: `Thinking Session ${new Date().toISOString()}`,
    });
    sessionId = session.id;
  }

  // Use ThoughtFactory to create thought
  const thought = thoughtFactory.createThought({ ...input, mode }, sessionId);

  // Phase 8: Enrich mathematics thoughts with proof decomposition analysis
  if (mode === ThinkingMode.MATHEMATICS && isDecompositionThoughtType(input.thoughtType)) {
    try {
      const mathEngine = await getMathematicsReasoningEngine();

      // Build proof input from tool input
      const proofInput = input.proofSteps || input.thought;

      // Run analysis based on thought type
      const analysisResult = mathEngine.analyzeForThoughtType(
        proofInput,
        input.thoughtType,
        input.theorem
      );

      // Enrich the thought with analysis results
      (thought as any).decomposition = analysisResult.decomposition;
      (thought as any).consistencyReport = analysisResult.consistencyReport;
      (thought as any).gapAnalysis = analysisResult.gapAnalysis;
      (thought as any).assumptionAnalysis = analysisResult.assumptionAnalysis;
    } catch (error) {
      // Log but don't fail - analysis is optional enhancement
      console.error('Proof analysis failed:', error);
    }
  }

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

  const response: any = {
    sessionId: session.id,
    thoughtId: thought.id,
    thoughtNumber: thought.thoughtNumber,
    mode: thought.mode,
    nextThoughtNeeded: thought.nextThoughtNeeded,
    sessionComplete: session.isComplete,
    totalThoughts: session.thoughts.length,
    modeStatus, // Phase 10 Sprint 1: API transparency
  };

  // Include analysis results in response if available
  if ((thought as any).decomposition) {
    response.decomposition = (thought as any).decomposition;
  }
  if ((thought as any).consistencyReport) {
    response.consistencyReport = (thought as any).consistencyReport;
  }
  if ((thought as any).gapAnalysis) {
    response.gapAnalysis = (thought as any).gapAnalysis;
  }

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
 * Handle session actions (summarize, export, switch_mode, get_session, recommend_mode)
 */
async function handleSessionAction(input: any) {
  const action = input.action;

  switch (action) {
    case 'summarize':
      return await handleSummarize(input);
    case 'export':
      return await handleExport(input);
    case 'switch_mode':
      return await handleSwitchMode(input);
    case 'get_session':
      return await handleGetSession(input);
    case 'recommend_mode':
      return await handleRecommendMode(input);
    default:
      throw new Error(`Unknown session action: ${action}`);
  }
}

/**
 * Handle summarize action
 */
async function handleSummarize(input: any) {
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
 */
async function handleExport(input: any) {
  if (!input.sessionId) {
    throw new Error('sessionId required for export action');
  }

  const sessionManager = await getSessionManager();
  const exportService = await getExportService();

  const session = await sessionManager.getSession(input.sessionId);
  if (!session) {
    throw new Error(`Session ${input.sessionId} not found`);
  }

  const format = input.exportFormat || 'json';
  const exported = exportService.exportSession(session, format as any);

  return {
    content: [{
      type: 'text' as const,
      text: exported,
    }],
  };
}

/**
 * Handle switch_mode action
 */
async function handleSwitchMode(input: any) {
  if (!input.sessionId || !input.newMode) {
    throw new Error('sessionId and newMode required for switch_mode action');
  }

  const modeRouter = await getModeRouter();
  const session = await modeRouter.switchMode(
    input.sessionId,
    input.newMode as ThinkingMode,
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
async function handleGetSession(input: any) {
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
async function handleRecommendMode(input: any) {
  const modeRouter = await getModeRouter();

  // Quick recommendation based on problem type
  if (input.problemType && !input.problemCharacteristics) {
    const recommendedMode = modeRouter.quickRecommend(input.problemType);
    const response = modeRouter.formatQuickRecommendation(input.problemType, recommendedMode);

    return {
      content: [{
        type: 'text' as const,
        text: response
      }],
      isError: false,
    };
  }

  // Comprehensive recommendations based on problem characteristics
  if (input.problemCharacteristics) {
    const response = modeRouter.getRecommendations(
      input.problemCharacteristics,
      input.includeCombinations || false
    );

    return {
      content: [{
        type: 'text' as const,
        text: response
      }],
      isError: false,
    };
  }

  // No valid input provided
  return {
    content: [{
      type: 'text' as const,
      text: 'Error: Please provide either problemType or problemCharacteristics for mode recommendations.'
    }],
    isError: true,
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
