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
import {
  ThinkingMode,
  ShannonStage,
  SequentialThought,
  ShannonThought,
  MathematicsThought,
  PhysicsThought,
  AbductiveThought,
  CausalThought,
  BayesianThought,
  TemporalThought,
  GameTheoryThought,
  FirstPrinciplesThought,
  ModeRecommender,
} from './types/index.js';
import { VisualExporter, type VisualFormat } from './export/visual.js';
import { toExtendedThoughtType } from './utils/type-guards.js';
import { escapeHtml, escapeLatex } from './utils/sanitization.js';
import type { ThinkingSession } from './types/session.js';

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

  const format = input.exportFormat || 'json';

  // For visual formats, check if applicable and use VisualExporter
  if (format === 'mermaid' || format === 'dot' || format === 'ascii') {
    const visualExporter = new VisualExporter();
    const lastThought = session.thoughts[session.thoughts.length - 1];

    if (!lastThought) {
      throw new Error('No thoughts in session to export');
    }

    let exported: string;

    // Determine which visual export method to use based on mode
    if (lastThought.mode === 'causal' && 'causalGraph' in lastThought) {
      exported = visualExporter.exportCausalGraph(lastThought as CausalThought, {
        format: format as VisualFormat,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    } else if (lastThought.mode === 'temporal' && 'timeline' in lastThought) {
      exported = visualExporter.exportTemporalTimeline(lastThought as TemporalThought, {
        format: format as VisualFormat,
        includeLabels: true,
      });
    } else if (lastThought.mode === 'gametheory' && 'game' in lastThought) {
      exported = visualExporter.exportGameTree(lastThought as GameTheoryThought, {
        format: format as VisualFormat,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    } else if (lastThought.mode === 'bayesian' && 'hypothesis' in lastThought) {
      exported = visualExporter.exportBayesianNetwork(lastThought as BayesianThought, {
        format: format as VisualFormat,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    } else if (lastThought.mode === ThinkingMode.FIRSTPRINCIPLES && 'question' in lastThought) {
      // @ts-expect-error - Method not implemented yet
      exported = visualExporter.exportFirstPrinciples(lastThought as FirstPrinciplesThought, {
        format: format as VisualFormat,
        colorScheme: 'default',
      });
    } else {
      // Generic thought sequence export for all other modes
      // @ts-expect-error - Method not implemented yet
      exported = visualExporter.exportThoughtSequence(session.thoughts, {
        format: format as VisualFormat,
        colorScheme: 'default',
      });
    }

    return {
      content: [{
        type: 'text' as const,
        text: exported,
      }],
    };
  }

  // Standard exports (json, markdown, latex, html, jupyter)
  let exported: string;

  switch (format) {
    case 'json':
      // For JSON, convert Map to Object for serialization
      const sessionWithCustomMetrics = {
        ...session,
        metrics: {
          ...session.metrics,
          customMetrics: Object.fromEntries(session.metrics.customMetrics),
        },
      };
      exported = JSON.stringify(sessionWithCustomMetrics, null, 2);
      break;
    case 'markdown':
      exported = exportToMarkdown(session);
      break;
    case 'latex':
      exported = exportToLatex(session);
      break;
    case 'html':
      exported = exportToHTML(session);
      break;
    case 'jupyter':
      exported = exportToJupyter(session);
      break;
    default:
      // For unknown formats, fallback to JSON
      const fallbackSession = {
        ...session,
        metrics: {
          ...session.metrics,
          customMetrics: Object.fromEntries(session.metrics.customMetrics),
        },
      };
      exported = JSON.stringify(fallbackSession, null, 2);
  }

  return {
    content: [{
      type: 'text' as const,
      text: exported,
    }],
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
        thoughtType: toExtendedThoughtType(input.thoughtType, 'model'),
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
        thoughtType: toExtendedThoughtType(input.thoughtType, 'model'),
        tensorProperties: input.tensorProperties,
        physicalInterpretation: input.physicalInterpretation,
        dependencies: input.dependencies || [],
        assumptions: input.assumptions || [],
        uncertainty: input.uncertainty || 0.5,
      } as PhysicsThought;

    case 'abductive':
      return {
        ...baseThought,
        mode: ThinkingMode.ABDUCTIVE,
        thoughtType: toExtendedThoughtType(input.thoughtType, 'problem_definition'),
        observations: input.observations || [],
        hypotheses: input.hypotheses || [],
        evaluationCriteria: input.evaluationCriteria,
        evidence: input.evidence || [],
        bestExplanation: input.bestExplanation,
      } as AbductiveThought;

    case 'causal':
      return {
        ...baseThought,
        mode: ThinkingMode.CAUSAL,
        thoughtType: toExtendedThoughtType(input.thoughtType, 'problem_definition'),
        causalGraph: input.causalGraph,
        interventions: input.interventions || [],
        mechanisms: input.mechanisms || [],
        confounders: input.confounders || [],
      } as CausalThought;

    case 'bayesian':
      return {
        ...baseThought,
        mode: ThinkingMode.BAYESIAN,
        thoughtType: toExtendedThoughtType(input.thoughtType, 'problem_definition'),
        hypothesis: input.hypothesis,
        prior: input.prior,
        likelihood: input.likelihood,
        evidence: input.evidence || [],
        posterior: input.posterior,
        bayesFactor: input.bayesFactor,
      } as any;

    case 'counterfactual':
      return {
        ...baseThought,
        mode: ThinkingMode.COUNTERFACTUAL,
        thoughtType: toExtendedThoughtType(input.thoughtType, 'problem_definition'),
        actual: input.actual,
        counterfactuals: input.counterfactuals || [],
        comparison: input.comparison,
        interventionPoint: input.interventionPoint,
        causalChains: input.causalChains || [],
      } as any;

    case 'analogical':
      return {
        ...baseThought,
        mode: ThinkingMode.ANALOGICAL,
        thoughtType: toExtendedThoughtType(input.thoughtType, 'analogy'),
        sourceDomain: input.sourceDomain,
        targetDomain: input.targetDomain,
        mapping: input.mapping || [],
        insights: input.insights || [],
        inferences: input.inferences || [],
        limitations: input.limitations || [],
        analogyStrength: input.analogyStrength,
      } as any;

    case 'temporal':
      return {
        ...baseThought,
        mode: ThinkingMode.TEMPORAL,
        thoughtType: input.thoughtType || 'event_definition',
        timeline: input.timeline,
        events: input.events || [],
        intervals: input.intervals || [],
        constraints: input.constraints || [],
        relations: input.relations || [],
      } as any;

    case 'gametheory':
      return {
        ...baseThought,
        mode: ThinkingMode.GAMETHEORY,
        thoughtType: input.thoughtType || 'game_definition',
        game: input.game,
        players: input.players || [],
        strategies: input.strategies || [],
        payoffMatrix: input.payoffMatrix,
        nashEquilibria: input.nashEquilibria || [],
        dominantStrategies: input.dominantStrategies || [],
        gameTree: input.gameTree,
      } as any;

    case 'evidential':
      return {
        ...baseThought,
        mode: ThinkingMode.EVIDENTIAL,
        thoughtType: input.thoughtType || 'hypothesis_definition',
        frameOfDiscernment: input.frameOfDiscernment,
        hypotheses: input.hypotheses || [],
        evidence: input.evidence || [],
        beliefFunctions: input.beliefFunctions || [],
        combinedBelief: input.combinedBelief,
        plausibility: input.plausibility,
        decisions: input.decisions || [],
      } as any;

    case ThinkingMode.FIRSTPRINCIPLES:
      return {
        ...baseThought,
        mode: ThinkingMode.FIRSTPRINCIPLES,
        question: input.question || '',
        principles: input.principles || [],
        derivationSteps: input.derivationSteps || [],
        conclusion: input.conclusion || { statement: '', derivationChain: [], certainty: 0 },
        alternativeInterpretations: input.alternativeInterpretations || [],
      } as any;
    case 'hybrid':
    default:
      return {
        ...baseThought,
        mode: ThinkingMode.HYBRID,
        thoughtType: toExtendedThoughtType(input.thoughtType, 'synthesis'),
        stage: input.stage as ShannonStage,
        uncertainty: input.uncertainty,
        dependencies: input.dependencies,
        assumptions: input.assumptions,
        mathematicalModel: input.mathematicalModel,
        tensorProperties: input.tensorProperties,
        physicalInterpretation: input.physicalInterpretation,
        primaryMode: (input.mode || ThinkingMode.HYBRID) as any,
        secondaryFeatures: [],
      } as any;
  }
}


/**
 * Handle mode recommendation requests
 */
async function handleRecommendMode(input: ThinkingToolInput) {
  const recommender = new ModeRecommender();
  
  // Quick recommendation based on problem type
  if (input.problemType && !input.problemCharacteristics) {
    const recommendedMode = recommender.quickRecommend(input.problemType);
    
    return {
      content: [{
        type: 'text' as const,
        text: `Quick recommendation for "${input.problemType}":\n\n**Recommended Mode**: ${recommendedMode}\n\nFor more detailed recommendations, provide problemCharacteristics.`
      }],
      isError: false,
    };
  }
  
  // Comprehensive recommendations based on problem characteristics
  if (input.problemCharacteristics) {
    const modeRecs = recommender.recommendModes(input.problemCharacteristics);
    const combinationRecs = input.includeCombinations 
      ? recommender.recommendCombinations(input.problemCharacteristics)
      : [];
    
    let response = '# Mode Recommendations\n\n';
    
    // Single mode recommendations
    response += '## Individual Modes\n\n';
    for (const rec of modeRecs) {
      response += `### ${rec.mode} (Score: ${rec.score})\n`;
      response += `**Reasoning**: ${rec.reasoning}\n\n`;
      response += `**Strengths**:\n`;
      for (const strength of rec.strengths) {
        response += `- ${strength}\n`;
      }
      response += `\n**Limitations**:\n`;
      for (const limitation of rec.limitations) {
        response += `- ${limitation}\n`;
      }
      response += `\n**Examples**: ${rec.examples.join(', ')}\n\n`;
      response += '---\n\n';
    }
    
    // Mode combinations
    if (combinationRecs.length > 0) {
      response += '## Recommended Mode Combinations\n\n';
      for (const combo of combinationRecs) {
        response += `### ${combo.modes.join(' + ')} (${combo.sequence})\n`;
        response += `**Rationale**: ${combo.rationale}\n\n`;
        response += `**Benefits**:\n`;
        for (const benefit of combo.benefits) {
          response += `- ${benefit}\n`;
        }
        response += `\n**Synergies**:\n`;
        for (const synergy of combo.synergies) {
          response += `- ${synergy}\n`;
        }
        response += '\n---\n\n';
      }
    }
    
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


// Helper export functions

/**
 * Export session to Markdown format
 * @param session - The thinking session to export
 * @returns Markdown-formatted string
 */
function exportToMarkdown(session: ThinkingSession): string {
  const status = session.isComplete ? 'Complete' : 'In Progress';
  let md = `# Thinking Session: ${session.title}

`;
  md += `**Mode**: ${session.mode}
`;
  md += `**Created**: ${session.createdAt.toISOString()}
`;
  md += `**Status**: ${status}

`;
  md += `## Thoughts

`;

  for (const thought of session.thoughts) {
    md += `### Thought ${thought.thoughtNumber}/${session.thoughts.length}

`;
    md += `${thought.content}

`;
  }

  return md;
}

/**
 * Export session to LaTeX format with proper escaping
 * @param session - The thinking session to export
 * @returns LaTeX-formatted string
 */
function exportToLatex(session: ThinkingSession): string {
  const status = session.isComplete ? 'Complete' : 'In Progress';
  const safeTitle = escapeLatex(session.title);
  const safeMode = escapeLatex(session.mode);
  const safeStatus = escapeLatex(status);

  let latex = `\\documentclass{article}
`;
  latex += `\\usepackage[utf8]{inputenc}
`;
  latex += `\\title{${safeTitle}}
`;
  latex += `\\begin{document}
`;
  latex += `\\maketitle

`;
  latex += `\\section{Session Details}
`;
  latex += `Mode: ${safeMode}\\\\
`;
  latex += `Status: ${safeStatus}\\\\

`;
  latex += `\\section{Thoughts}
`;

  for (const thought of session.thoughts) {
    latex += `\\subsection{Thought ${thought.thoughtNumber}}
`;
    latex += `${escapeLatex(thought.content)}

`;
  }

  latex += `\\end{document}
`;
  return latex;
}

/**
 * Export session to HTML format with XSS protection
 * @param session - The thinking session to export
 * @returns HTML-formatted string with escaped content
 */
function exportToHTML(session: ThinkingSession): string {
  const status = session.isComplete ? 'Complete' : 'In Progress';
  const safeTitle = escapeHtml(session.title);
  const safeMode = escapeHtml(session.mode);
  const safeStatus = escapeHtml(status);

  let html = `<!DOCTYPE html>
<html>
<head>
`;
  html += `  <meta charset="UTF-8">
`;
  html += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">
`;
  html += `  <title>${safeTitle}</title>
`;
  html += `  <style>body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 0 20px; }</style>
`;
  html += `</head>
<body>
`;
  html += `  <h1>${safeTitle}</h1>
`;
  html += `  <p><strong>Mode:</strong> ${safeMode}</p>
`;
  html += `  <p><strong>Status:</strong> ${safeStatus}</p>
`;
  html += `  <h2>Thoughts</h2>
`;

  for (const thought of session.thoughts) {
    html += `  <div>
`;
    html += `    <h3>Thought ${thought.thoughtNumber}/${session.thoughts.length}</h3>
`;
    html += `    <p>${escapeHtml(thought.content)}</p>
`;
    html += `  </div>
`;
  }

  html += `</body>
</html>
`;
  return html;
}

/**
 * Export session to Jupyter Notebook format
 * @param session - The thinking session to export
 * @returns JSON string representing a Jupyter notebook
 */
function exportToJupyter(session: ThinkingSession): string {
  const status = session.isComplete ? 'Complete' : 'In Progress';

  interface JupyterCell {
    cell_type: 'markdown' | 'code';
    metadata: Record<string, unknown>;
    source: string[];
  }

  interface JupyterNotebook {
    cells: JupyterCell[];
    metadata: Record<string, unknown>;
    nbformat: number;
    nbformat_minor: number;
  }

  const notebook: JupyterNotebook = {
    cells: [],
    metadata: {},
    nbformat: 4,
    nbformat_minor: 2,
  };

  // Add title cell
  notebook.cells.push({
    cell_type: 'markdown',
    metadata: {},
    source: [`# Thinking Session: ${session.title}
`, `
`, `**Mode**: ${session.mode}
`, `**Status**: ${status}
`],
  });

  // Add thought cells
  for (const thought of session.thoughts) {
    notebook.cells.push({
      cell_type: 'markdown',
      metadata: {},
      source: [`## Thought ${thought.thoughtNumber}/${session.thoughts.length}
`, `
`, `${thought.content}
`],
    });
  }

  return JSON.stringify(notebook, null, 2);
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
