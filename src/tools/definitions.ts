/**
 * Focused Tool Definitions (v8.4.0)
 * Sprint 5 Task 5.4: Split monolithic tool into focused tools
 * Phase 12 Sprint 3: Added deepthinking_analyze (13 total tools)
 * Phase 14: Added deepthinking_engineering and deepthinking_academic
 *
 * REFACTORED: Now using hand-written JSON schemas like working MCP servers
 * - Follows pattern from sequential-thinking-mcp and memory-mcp
 * - Zod schemas kept for runtime validation only
 */

import { jsonSchemas } from './json-schemas.js';
import { SessionActionSchema } from './schemas/base.js';
import { CoreModeSchema, StandardSchema } from './schemas/modes/core.js';
import { MathSchema } from './schemas/modes/mathematics.js';
import { TemporalSchema } from './schemas/modes/temporal.js';
import { ProbabilisticSchema } from './schemas/modes/probabilistic.js';
import { CausalSchema } from './schemas/modes/causal.js';
import { StrategicSchema } from './schemas/modes/strategic.js';
import { AnalyticalSchema } from './schemas/modes/analytical.js';
import { ScientificSchema } from './schemas/modes/scientific.js';
import { EngineeringSchema } from './schemas/modes/engineering.js';
import { AcademicSchema } from './schemas/modes/academic.js';
import { analyzeInputSchema } from './schemas/analyze.js';

/**
 * 13 focused tools with hand-written JSON schemas (v8.4.0)
 * Zod schemas used only for runtime validation
 * Phase 5: Added deepthinking_core for fundamental reasoning
 * Phase 12 Sprint 3: Added deepthinking_analyze
 * Phase 14: Added deepthinking_engineering and deepthinking_academic
 */
export const tools = {
  deepthinking_core: jsonSchemas[0],
  deepthinking_standard: jsonSchemas[1],
  deepthinking_mathematics: jsonSchemas[2],
  deepthinking_temporal: jsonSchemas[3],
  deepthinking_probabilistic: jsonSchemas[4],
  deepthinking_causal: jsonSchemas[5],
  deepthinking_strategic: jsonSchemas[6],
  deepthinking_analytical: jsonSchemas[7],
  deepthinking_scientific: jsonSchemas[8],
  deepthinking_engineering: jsonSchemas[9],
  deepthinking_academic: jsonSchemas[10],
  deepthinking_session: jsonSchemas[11],
  deepthinking_analyze: jsonSchemas[12],
};

/**
 * All tools as array for MCP ListTools
 */
export const toolList = jsonSchemas;

/**
 * Tool name to schema mapping for validation
 * Phase 12 Sprint 3: Added deepthinking_analyze
 * Phase 14: Added engineering and academic schemas
 */
export const toolSchemas = {
  deepthinking_core: CoreModeSchema,
  deepthinking_standard: StandardSchema,
  deepthinking_mathematics: MathSchema,
  deepthinking_temporal: TemporalSchema,
  deepthinking_probabilistic: ProbabilisticSchema,
  deepthinking_causal: CausalSchema,
  deepthinking_strategic: StrategicSchema,
  deepthinking_analytical: AnalyticalSchema,
  deepthinking_scientific: ScientificSchema,
  deepthinking_engineering: EngineeringSchema,
  deepthinking_academic: AcademicSchema,
  deepthinking_session: SessionActionSchema,
  deepthinking_analyze: analyzeInputSchema,
} as const;

/**
 * Mode to tool name mapping for routing
 * Phase 14: All 29 modes with dedicated thought types are now accessible
 */
export const modeToToolMap: Record<string, string> = {
  // Core reasoning modes (fundamental)
  inductive: 'deepthinking_core',
  deductive: 'deepthinking_core',
  abductive: 'deepthinking_core',

  // Standard workflow modes
  sequential: 'deepthinking_standard',
  shannon: 'deepthinking_standard',
  hybrid: 'deepthinking_standard',

  // Math/Physics/Computability modes
  mathematics: 'deepthinking_mathematics',
  physics: 'deepthinking_mathematics',
  computability: 'deepthinking_mathematics',

  // Temporal mode
  temporal: 'deepthinking_temporal',

  // Probabilistic modes
  bayesian: 'deepthinking_probabilistic',
  evidential: 'deepthinking_probabilistic',

  // Causal modes
  causal: 'deepthinking_causal',
  counterfactual: 'deepthinking_causal',

  // Strategic modes
  gametheory: 'deepthinking_strategic',
  optimization: 'deepthinking_strategic',

  // Analytical modes (includes cryptanalytic)
  analogical: 'deepthinking_analytical',
  firstprinciples: 'deepthinking_analytical',
  metareasoning: 'deepthinking_analytical',
  cryptanalytic: 'deepthinking_analytical',

  // Scientific modes
  scientificmethod: 'deepthinking_scientific',
  systemsthinking: 'deepthinking_scientific',
  formallogic: 'deepthinking_scientific',

  // Engineering modes (Phase 14)
  engineering: 'deepthinking_engineering',
  algorithmic: 'deepthinking_engineering',

  // Academic research modes (Phase 14)
  synthesis: 'deepthinking_academic',
  argumentation: 'deepthinking_academic',
  critique: 'deepthinking_academic',
  analysis: 'deepthinking_academic',
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
