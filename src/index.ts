#!/usr/bin/env node

/**
 * DeepThinking MCP Server
 * Unified deep thinking server combining sequential, Shannon, and mathematical reasoning
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'crypto';

import { thinkingTool, ThinkingToolInput, ThinkingToolSchema } from './tools/thinking.js';
import { SessionManager } from './session/index.js';
import {
  ThinkingMode,
  ShannonStage,
  SequentialThought,
  ShannonThought,
  MathematicsThought,
  PhysicsThought,
  HybridThought,
} from './types/index.js';

const server = new Server(
  {
    name: 'deepthinking-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const sessionManager = new SessionManager();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [thinkingTool],
  };
});

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

async function handleAddThought(input: ThinkingToolInput) {
  let sessionId = input.sessionId;
  if (!sessionId) {
    const session = await sessionManager.createSession({
      mode: input.mode as ThinkingMode,
      title: `Thinking Session ${new Date().toISOString()}`,
    });
    sessionId = session.id;
  }

  const thought = createThought(input, sessionId);
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

async function handleExport(input: ThinkingToolInput) {
  if (!input.sessionId) {
    throw new Error('sessionId required for export action');
  }

  const session = await sessionManager.getSession(input.sessionId);
  if (!session) {
    throw new Error(`Session ${input.sessionId} not found`);
  }

  const exported = JSON.stringify(session, null, 2);

  return {
    content: [
      {
        type: 'text',
        text: exported,
      },
    ],
  };
}

async function handleSwitchMode(input: ThinkingToolInput) {
  if (!input.sessionId || !input.newMode) {
    throw new Error('sessionId and newMode required for switch_mode action');
  }

  const session = await sessionManager.switchMode(
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

async function handleGetSession(input: ThinkingToolInput) {
  if (!input.sessionId) {
    throw new Error('sessionId required for get_session action');
  }

  const session = await sessionManager.getSession(input.sessionId);
  if (!session) {
    throw new Error(`Session ${input.sessionId} not found`);
  }

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
          metrics: session.metrics,
        }, null, 2),
      },
    ],
  };
}

function createThought(input: ThinkingToolInput, sessionId: string) {
  const baseThought = {
    id: randomUUID(),
    sessionId,
    thoughtNumber: input.thoughtNumber,
    totalThoughts: input.totalThoughts,
    content: input.thought,
    timestamp: new Date(),
    nextThoughtNeeded: input.nextThoughtNeeded,
    isRevision: input.isRevision,
    revisesThought: input.revisesThought,
  };

  switch (input.mode) {
    case 'sequential':
      return {
        ...baseThought,
        mode: ThinkingMode.SEQUENTIAL,
        revisionReason: input.revisionReason,
        branchFrom: input.branchFrom,
        branchId: input.branchId,
      } as SequentialThought;

    case 'shannon':
      return {
        ...baseThought,
        mode: ThinkingMode.SHANNON,
        stage: (input.stage as ShannonStage) || ShannonStage.PROBLEM_DEFINITION,
        uncertainty: input.uncertainty || 0.5,
        dependencies: input.dependencies || [],
        assumptions: input.assumptions || [],
      } as ShannonThought;

    case 'mathematics':
      return {
        ...baseThought,
        mode: ThinkingMode.MATHEMATICS,
        thoughtType: input.thoughtType as any,
        mathematicalModel: input.mathematicalModel,
        proofStrategy: input.proofStrategy,
        dependencies: input.dependencies || [],
        assumptions: input.assumptions || [],
        uncertainty: input.uncertainty || 0.5,
      } as MathematicsThought;

    case 'physics':
      return {
        ...baseThought,
        mode: ThinkingMode.PHYSICS,
        thoughtType: input.thoughtType as any,
        tensorProperties: input.tensorProperties,
        physicalInterpretation: input.physicalInterpretation,
        dependencies: input.dependencies || [],
        assumptions: input.assumptions || [],
        uncertainty: input.uncertainty || 0.5,
      } as PhysicsThought;

    case 'hybrid':
    default:
      return {
        ...baseThought,
        mode: ThinkingMode.HYBRID,
        thoughtType: input.thoughtType as any,
        stage: input.stage as ShannonStage,
        uncertainty: input.uncertainty,
        dependencies: input.dependencies,
        assumptions: input.assumptions,
        mathematicalModel: input.mathematicalModel,
        tensorProperties: input.tensorProperties,
        physicalInterpretation: input.physicalInterpretation,
        primaryMode: input.mode as any,
        secondaryFeatures: [],
      } as HybridThought;
  }
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('DeepThinking MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
