/**
 * Unified thinking tool for DeepThinking MCP v2.0
 * Supports 10 thinking modes
 */

import { z } from 'zod';

/**
 * Zod schema for runtime validation (internal use)
 */
export const ThinkingToolSchema = z.object({
  sessionId: z.string().optional(),
  mode: z.enum(['sequential', 'shannon', 'mathematics', 'physics', 'hybrid', 'abductive', 'causal', 'bayesian', 'counterfactual', 'analogical']).default('hybrid'),
  thought: z.string(),
  thoughtNumber: z.number().int().positive(),
  totalThoughts: z.number().int().positive(),
  nextThoughtNeeded: z.boolean(),
  isRevision: z.boolean().optional(),
  revisesThought: z.string().optional(),
  revisionReason: z.string().optional(),
  branchFrom: z.string().optional(),
  branchId: z.string().optional(),
  stage: z.enum(['problem_definition', 'constraints', 'model', 'proof', 'implementation']).optional(),
  uncertainty: z.number().min(0).max(1).optional(),
  dependencies: z.array(z.string()).optional(),
  assumptions: z.array(z.string()).optional(),
  thoughtType: z.string().optional(),
  mathematicalModel: z.object({
    latex: z.string(),
    symbolic: z.string(),
    ascii: z.string().optional(),
  }).optional(),
  proofStrategy: z.object({
    type: z.enum(['direct', 'contradiction', 'induction', 'construction', 'contrapositive']),
    steps: z.array(z.string()),
  }).optional(),
  tensorProperties: z.object({
    rank: z.tuple([z.number(), z.number()]),
    components: z.string(),
    latex: z.string(),
    symmetries: z.array(z.string()),
    invariants: z.array(z.string()),
    transformation: z.enum(['covariant', 'contravariant', 'mixed']),
  }).optional(),
  physicalInterpretation: z.object({
    quantity: z.string(),
    units: z.string(),
    conservationLaws: z.array(z.string()),
  }).optional(),
  action: z.enum(['add_thought', 'summarize', 'export', 'switch_mode', 'get_session']).default('add_thought'),
  exportFormat: z.enum(['markdown', 'latex', 'json', 'html', 'jupyter']).optional(),
  newMode: z.enum(['sequential', 'shannon', 'mathematics', 'physics', 'hybrid', 'abductive', 'causal', 'bayesian', 'counterfactual', 'analogical']).optional(),
});

export type ThinkingToolInput = z.infer<typeof ThinkingToolSchema>;

/**
 * Tool definition using plain JSON Schema (MCP standard format)
 */
export const thinkingTool = {
  name: 'deepthinking',
  description: `Advanced deep thinking tool supporting 10 reasoning modes:

Core Modes:
- sequential: Iterative refinement and exploration
- shannon: Systematic 5-stage problem-solving
- mathematics: Theorem proving and symbolic reasoning
- physics: Tensor mathematics and field theory
- hybrid: Intelligently combines multiple approaches

Advanced Modes (v2.0):
- abductive: Inference to the best explanation, hypothesis generation
- causal: Cause-effect analysis with causal graphs
- bayesian: Probabilistic reasoning with evidence updates
- counterfactual: What-if scenario analysis
- analogical: Cross-domain pattern matching and insights

Choose the mode that best fits your problem type.`,
  inputSchema: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "Session ID (creates new if omitted)"
      },
      mode: {
        type: "string",
        enum: ["sequential", "shannon", "mathematics", "physics", "hybrid", "abductive", "causal", "bayesian", "counterfactual", "analogical"],
        description: "Thinking mode to use"
      },
      thought: {
        type: "string",
        description: "The thought content"
      },
      thoughtNumber: {
        type: "integer",
        minimum: 1,
        description: "Position in sequence"
      },
      totalThoughts: {
        type: "integer",
        minimum: 1,
        description: "Estimated total thoughts"
      },
      nextThoughtNeeded: {
        type: "boolean",
        description: "Should thinking continue?"
      },
      isRevision: {
        type: "boolean",
        description: "Whether this revises previous thinking"
      },
      revisesThought: {
        type: "string",
        description: "Which thought is being reconsidered"
      },
      revisionReason: {
        type: "string",
        description: "Reason for revision"
      },
      branchFrom: {
        type: "string",
        description: "Branching point thought"
      },
      branchId: {
        type: "string",
        description: "Branch identifier"
      },
      stage: {
        type: "string",
        enum: ["problem_definition", "constraints", "model", "proof", "implementation"],
        description: "Shannon methodology stage"
      },
      uncertainty: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Uncertainty level (0-1)"
      },
      dependencies: {
        type: "array",
        items: { type: "string" },
        description: "Dependencies on other thoughts"
      },
      assumptions: {
        type: "array",
        items: { type: "string" },
        description: "Assumptions made"
      },
      thoughtType: {
        type: "string",
        description: "Type of mathematical thought"
      },
      mathematicalModel: {
        type: "object",
        properties: {
          latex: { type: "string", description: "LaTeX representation" },
          symbolic: { type: "string", description: "Symbolic representation" },
          ascii: { type: "string", description: "ASCII representation" }
        },
        required: ["latex", "symbolic"]
      },
      proofStrategy: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["direct", "contradiction", "induction", "construction", "contrapositive"]
          },
          steps: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["type", "steps"]
      },
      tensorProperties: {
        type: "object",
        properties: {
          rank: {
            type: "array",
            items: { type: "number" },
            minItems: 2,
            maxItems: 2
          },
          components: { type: "string" },
          latex: { type: "string" },
          symmetries: {
            type: "array",
            items: { type: "string" }
          },
          invariants: {
            type: "array",
            items: { type: "string" }
          },
          transformation: {
            type: "string",
            enum: ["covariant", "contravariant", "mixed"]
          }
        },
        required: ["rank", "components", "latex", "symmetries", "invariants", "transformation"]
      },
      physicalInterpretation: {
        type: "object",
        properties: {
          quantity: { type: "string" },
          units: { type: "string" },
          conservationLaws: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["quantity", "units", "conservationLaws"]
      },
      action: {
        type: "string",
        enum: ["add_thought", "summarize", "export", "switch_mode", "get_session"],
        description: "Action to perform"
      },
      exportFormat: {
        type: "string",
        enum: ["markdown", "latex", "json", "html", "jupyter"],
        description: "Export format"
      },
      newMode: {
        type: "string",
        enum: ["sequential", "shannon", "mathematics", "physics", "hybrid", "abductive", "causal", "bayesian", "counterfactual", "analogical"],
        description: "New mode for switch_mode action"
      }
    },
    required: ["thought", "thoughtNumber", "totalThoughts", "nextThoughtNeeded"]
  }
};
