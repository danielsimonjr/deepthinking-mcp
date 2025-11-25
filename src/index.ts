#!/usr/bin/env node

/**
 * DeepThinking MCP Server (v3.4.5)
 * Sprint 3 Task 3.3: Refactored to use service layer
 *
 * Main server entry point - delegates to service layer for business logic.
 * Reduced from 796 lines to ~180 lines by extracting services.
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

import { thinkingTool, ThinkingToolInput, ThinkingToolSchema } from './tools/thinking.js';
import { SessionManager } from './session/index.js';
import { ThinkingMode } from './types/index.js';
import { ThoughtFactory, ExportService, ModeRouter } from './services/index.js';

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

// Initialize services
const sessionManager = new SessionManager();
const thoughtFactory = new ThoughtFactory();
const exportService = new ExportService();
const modeRouter = new ModeRouter(sessionManager);

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [thinkingTool],
  };
});

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'deepthinking') {
    try {
      const input = ThinkingToolSchema.parse(args) as ThinkingToolInput;

      switch (input.action) {
        case 'add_thought':
          return await handleAddThought(input);
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
          throw new Error(`Unknown action: ${input.action}`);
      }
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
  }

  throw new Error(`Unknown tool: ${name}`);
});

/**
 * Handle add_thought action
 *
 * Creates a new thought and adds it to the session.
 * Uses ThoughtFactory to create properly typed thought objects.
 */
async function handleAddThought(input: ThinkingToolInput) {
  let sessionId = input.sessionId;

  // Create session if none provided
  if (!sessionId) {
    const session = await sessionManager.createSession({
      mode: input.mode as ThinkingMode,
      title: `Thinking Session ${new Date().toISOString()}`,
    });
    sessionId = session.id;
  }

  // Use ThoughtFactory to create thought
  const thought = thoughtFactory.createThought(input, sessionId);
  const session = await sessionManager.addThought(sessionId, thought);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          sessionId: session.id,
          thoughtId: thought.id,
          thoughtNumber: thought.thoughtNumber,
          mode: thought.mode,
          nextThoughtNeeded: thought.nextThoughtNeeded,
          sessionComplete: session.isComplete,
          totalThoughts: session.thoughts.length,
        }, null, 2),
      },
    ],
  };
}

/**
 * Handle summarize action
 *
 * Generates a summary of the session's thoughts.
 */
async function handleSummarize(input: ThinkingToolInput) {
  if (!input.sessionId) {
    throw new Error('sessionId required for summarize action');
  }

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
 *
 * Exports session to requested format using ExportService.
 */
async function handleExport(input: ThinkingToolInput) {
  if (!input.sessionId) {
    throw new Error('sessionId required for export action');
  }

  const session = await sessionManager.getSession(input.sessionId);
  if (!session) {
    throw new Error(`Session ${input.sessionId} not found`);
  }

  const format = input.exportFormat || 'json';

  // Use ExportService for all exports
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
 *
 * Switches session to a new thinking mode using ModeRouter.
 */
async function handleSwitchMode(input: ThinkingToolInput) {
  if (!input.sessionId || !input.newMode) {
    throw new Error('sessionId and newMode required for switch_mode action');
  }

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
 *
 * Retrieves session details and metrics.
 */
async function handleGetSession(input: ThinkingToolInput) {
  if (!input.sessionId) {
    throw new Error('sessionId required for get_session action');
  }

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
 *
 * Provides mode recommendations using ModeRouter.
 */
async function handleRecommendMode(input: ThinkingToolInput) {
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
