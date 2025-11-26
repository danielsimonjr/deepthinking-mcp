/**
 * Legacy Tool Support (v4.0.0)
 * Provides backward compatibility for the deprecated monolithic 'deepthinking' tool
 */

import { z } from 'zod';
import { generateToolSchema } from './schema-generator.js';
import { modeToToolMap, getSchemaForTool } from './definitions.js';
import { getDeprecationWarning } from './schemas/version.js';

/**
 * Minimal legacy schema that routes to appropriate new tool
 */
const LegacySchema = z.object({
  // Session
  sessionId: z.string().optional(),

  // Mode (determines routing)
  mode: z
    .enum([
      'sequential',
      'shannon',
      'hybrid',
      'mathematics',
      'physics',
      'temporal',
      'bayesian',
      'evidential',
      'causal',
      'counterfactual',
      'abductive',
      'gametheory',
      'optimization',
      'analogical',
      'firstprinciples',
      'scientificmethod',
      'systemsthinking',
      'formallogic',
    ])
    .optional()
    .default('hybrid'),

  // Action (for session management)
  action: z
    .enum(['add_thought', 'summarize', 'export', 'get_session', 'switch_mode', 'recommend_mode'])
    .optional()
    .default('add_thought'),

  // Core thought properties
  thought: z.string().optional(),
  thoughtNumber: z.number().int().min(1).optional(),
  totalThoughts: z.number().int().min(1).optional(),
  nextThoughtNeeded: z.boolean().optional(),

  // Passthrough all other properties
}).passthrough();

/**
 * Legacy tool definition
 */
export const legacyTool = generateToolSchema(
  LegacySchema,
  'deepthinking',
  `[DEPRECATED - Use deepthinking_* tools instead]

Routes to appropriate new tool based on mode:
- Core (sequential/shannon/hybrid): deepthinking_core
- Math/Physics: deepthinking_math
- Temporal: deepthinking_temporal
- Probabilistic: deepthinking_probabilistic
- Causal: deepthinking_causal
- Strategic: deepthinking_strategic
- Analytical: deepthinking_analytical
- Scientific: deepthinking_scientific
- Session actions: deepthinking_session`
);

export type LegacyInput = z.infer<typeof LegacySchema>;

/**
 * Handle legacy tool calls by routing to appropriate new tool
 */
export async function handleLegacyTool(
  args: unknown,
  handler: (toolName: string, args: unknown) => Promise<unknown>
): Promise<{ result: unknown; warnings: string[] }> {
  const warnings: string[] = [];

  // Add deprecation warning
  const deprecationWarning = getDeprecationWarning('deepthinking');
  if (deprecationWarning) {
    warnings.push(deprecationWarning);
  }

  // Parse minimal legacy schema
  const parsed = LegacySchema.parse(args);

  // Determine target tool
  let targetTool: string;
  if (parsed.action && parsed.action !== 'add_thought') {
    // Session actions route to session tool
    targetTool = 'deepthinking_session';
  } else {
    // Thought actions route based on mode
    targetTool = modeToToolMap[parsed.mode || 'hybrid'] || 'deepthinking_core';
  }

  warnings.push(`Routing to ${targetTool}`);

  // Get the target schema for validation
  const targetSchema = getSchemaForTool(targetTool);

  // Validate against target schema
  const validated = targetSchema.parse(args);

  // Call the handler with the routed tool
  const result = await handler(targetTool, validated);

  return { result, warnings };
}

/**
 * Get the new tool name for a given mode
 */
export function getNewToolForMode(mode: string): string {
  return modeToToolMap[mode] || 'deepthinking_core';
}
