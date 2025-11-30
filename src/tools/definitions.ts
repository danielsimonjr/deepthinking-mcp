/**
 * Focused Tool Definitions (v4.4.0)
 * Sprint 5 Task 5.4: Split monolithic tool into 9 focused tools
 *
 * REFACTORED: Now using hand-written JSON schemas like working MCP servers
 * - Follows pattern from sequential-thinking-mcp and memory-mcp
 * - Zod schemas kept for runtime validation only
 */

import { jsonSchemas } from './json-schemas.js';
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
 * 9 focused tools with hand-written JSON schemas
 * Zod schemas used only for runtime validation
 */
export const tools = {
  deepthinking_standard: jsonSchemas[0],
  deepthinking_math: jsonSchemas[1],
  deepthinking_temporal: jsonSchemas[2],
  deepthinking_probabilistic: jsonSchemas[3],
  deepthinking_causal: jsonSchemas[4],
  deepthinking_strategic: jsonSchemas[5],
  deepthinking_analytical: jsonSchemas[6],
  deepthinking_scientific: jsonSchemas[7],
  deepthinking_session: jsonSchemas[8],
};

/**
 * All tools as array for MCP ListTools
 */
export const toolList = jsonSchemas;

/**
 * Tool name to schema mapping for validation
 */
export const toolSchemas = {
  deepthinking_standard: CoreSchema,
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
  // Standard workflow modes
  sequential: 'deepthinking_standard',
  shannon: 'deepthinking_standard',
  hybrid: 'deepthinking_standard',

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
    // Default to standard for unknown modes
    return 'deepthinking_standard';
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
