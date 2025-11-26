/**
 * Focused Tool Definitions (v4.0.0)
 * Sprint 5 Task 5.4: Split monolithic tool into 9 focused tools
 *
 * Token optimization: ~8-10K tokens → ~3-4K tokens (60% reduction)
 */

import { generateToolSchema } from './schema-generator.js';
import { SessionActionSchema } from './schemas/base.js';
import { CoreSchema } from './schemas/modes/core.js';
import { MathSchema } from './schemas/modes/mathematics.js';
import { TemporalSchema } from './schemas/modes/temporal.js';
import { ProbabilisticSchema } from './schemas/modes/probabilistic.js';
import { CausalSchema } from './schemas/modes/causal.js';
import { StrategicSchema } from './schemas/modes/strategic.js';
import { AnalyticalSchema } from './schemas/modes/analytical.js';
import { ScientificSchema } from './schemas/modes/scientific.js';

/**
 * 9 focused tools replacing the monolithic deepthinking tool
 * Token-optimized descriptions (Sprint 7)
 */
export const tools = {
  deepthinking_core: generateToolSchema(
    CoreSchema,
    'deepthinking_core',
    'Core modes: sequential, shannon (5-stage), hybrid'
  ),

  deepthinking_math: generateToolSchema(
    MathSchema,
    'deepthinking_math',
    'Math/physics: proofs, tensors, LaTeX, conservation laws'
  ),

  deepthinking_temporal: generateToolSchema(
    TemporalSchema,
    'deepthinking_temporal',
    'Temporal: timelines, Allen intervals, event sequencing'
  ),

  deepthinking_probabilistic: generateToolSchema(
    ProbabilisticSchema,
    'deepthinking_probabilistic',
    'Probabilistic: Bayesian updates, Dempster-Shafer belief'
  ),

  deepthinking_causal: generateToolSchema(
    CausalSchema,
    'deepthinking_causal',
    'Causal: graphs, counterfactuals, abductive inference'
  ),

  deepthinking_strategic: generateToolSchema(
    StrategicSchema,
    'deepthinking_strategic',
    'Strategic: game theory, Nash equilibria, optimization'
  ),

  deepthinking_analytical: generateToolSchema(
    AnalyticalSchema,
    'deepthinking_analytical',
    'Analytical: analogical mapping, first principles'
  ),

  deepthinking_scientific: generateToolSchema(
    ScientificSchema,
    'deepthinking_scientific',
    'Scientific: hypothesis testing, systems thinking, formal logic'
  ),

  deepthinking_session: generateToolSchema(
    SessionActionSchema,
    'deepthinking_session',
    'Session: summarize, export, get, switch_mode, recommend'
  ),
};

/**
 * All tools as array for MCP ListTools
 */
export const toolList = Object.values(tools);

/**
 * Tool name to schema mapping for validation
 */
export const toolSchemas = {
  deepthinking_core: CoreSchema,
  deepthinking_math: MathSchema,
  deepthinking_temporal: TemporalSchema,
  deepthinking_probabilistic: ProbabilisticSchema,
  deepthinking_causal: CausalSchema,
  deepthinking_strategic: StrategicSchema,
  deepthinking_analytical: AnalyticalSchema,
  deepthinking_scientific: ScientificSchema,
  deepthinking_session: SessionActionSchema,
} as const;

/**
 * Mode to tool name mapping for routing
 */
export const modeToToolMap: Record<string, string> = {
  // Core modes
  sequential: 'deepthinking_core',
  shannon: 'deepthinking_core',
  hybrid: 'deepthinking_core',

  // Math/Physics modes
  mathematics: 'deepthinking_math',
  physics: 'deepthinking_math',

  // Temporal mode
  temporal: 'deepthinking_temporal',

  // Probabilistic modes
  bayesian: 'deepthinking_probabilistic',
  evidential: 'deepthinking_probabilistic',

  // Causal modes
  causal: 'deepthinking_causal',
  counterfactual: 'deepthinking_causal',
  abductive: 'deepthinking_causal',

  // Strategic modes
  gametheory: 'deepthinking_strategic',
  optimization: 'deepthinking_strategic',

  // Analytical modes
  analogical: 'deepthinking_analytical',
  firstprinciples: 'deepthinking_analytical',

  // Scientific modes
  scientificmethod: 'deepthinking_scientific',
  systemsthinking: 'deepthinking_scientific',
  formallogic: 'deepthinking_scientific',
};

/**
 * Get the appropriate tool for a mode
 */
export function getToolForMode(mode: string): string {
  const tool = modeToToolMap[mode];
  if (!tool) {
    // Default to core for unknown modes
    return 'deepthinking_core';
  }
  return tool;
}

/**
 * Check if a tool name is valid
 */
export function isValidTool(toolName: string): boolean {
  return toolName in toolSchemas;
}

/**
 * Get schema for a tool
 */
export function getSchemaForTool(toolName: string) {
  if (!isValidTool(toolName)) {
    throw new Error(`Unknown tool: ${toolName}`);
  }
  return toolSchemas[toolName as keyof typeof toolSchemas];
}
