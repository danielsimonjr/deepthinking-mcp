/**
 * Lazy Schema Loader (v4.1.0)
 * Sprint 5 Task 5.5: Load schemas on-demand for reduced memory footprint
 *
 * Benefits:
 * - Reduced startup time (schemas loaded only when needed)
 * - Lower memory footprint (unused schemas never loaded)
 * - Validation schemas cached after first use
 */

import { z } from 'zod';

type SchemaLoader = () => Promise<{ schema: z.ZodType; tool: object }>;

/**
 * Schema loaders - load on first use
 */
const schemaLoaders: Record<string, SchemaLoader> = {
  deepthinking_core: async () => {
    const { CoreSchema } = await import('./schemas/modes/core.js');
    const { generateToolSchema } = await import('./schema-generator.js');
    return {
      schema: CoreSchema,
      tool: generateToolSchema(
        CoreSchema,
        'deepthinking_core',
        'Core modes: sequential, shannon, hybrid'
      ),
    };
  },

  deepthinking_math: async () => {
    const { MathSchema } = await import('./schemas/modes/mathematics.js');
    const { generateToolSchema } = await import('./schema-generator.js');
    return {
      schema: MathSchema,
      tool: generateToolSchema(
        MathSchema,
        'deepthinking_math',
        'Math/physics: proofs, tensors, LaTeX, conservation laws'
      ),
    };
  },

  deepthinking_temporal: async () => {
    const { TemporalSchema } = await import('./schemas/modes/temporal.js');
    const { generateToolSchema } = await import('./schema-generator.js');
    return {
      schema: TemporalSchema,
      tool: generateToolSchema(
        TemporalSchema,
        'deepthinking_temporal',
        'Temporal: timelines, Allen intervals, event sequencing'
      ),
    };
  },

  deepthinking_probabilistic: async () => {
    const { ProbabilisticSchema } = await import('./schemas/modes/probabilistic.js');
    const { generateToolSchema } = await import('./schema-generator.js');
    return {
      schema: ProbabilisticSchema,
      tool: generateToolSchema(
        ProbabilisticSchema,
        'deepthinking_probabilistic',
        'Probabilistic: Bayesian updates, Dempster-Shafer belief'
      ),
    };
  },

  deepthinking_causal: async () => {
    const { CausalSchema } = await import('./schemas/modes/causal.js');
    const { generateToolSchema } = await import('./schema-generator.js');
    return {
      schema: CausalSchema,
      tool: generateToolSchema(
        CausalSchema,
        'deepthinking_causal',
        'Causal: graphs, counterfactuals, abductive inference'
      ),
    };
  },

  deepthinking_strategic: async () => {
    const { StrategicSchema } = await import('./schemas/modes/strategic.js');
    const { generateToolSchema } = await import('./schema-generator.js');
    return {
      schema: StrategicSchema,
      tool: generateToolSchema(
        StrategicSchema,
        'deepthinking_strategic',
        'Strategic: game theory, Nash equilibria, optimization'
      ),
    };
  },

  deepthinking_analytical: async () => {
    const { AnalyticalSchema } = await import('./schemas/modes/analytical.js');
    const { generateToolSchema } = await import('./schema-generator.js');
    return {
      schema: AnalyticalSchema,
      tool: generateToolSchema(
        AnalyticalSchema,
        'deepthinking_analytical',
        'Analytical: analogical mapping, first principles'
      ),
    };
  },

  deepthinking_scientific: async () => {
    const { ScientificSchema } = await import('./schemas/modes/scientific.js');
    const { generateToolSchema } = await import('./schema-generator.js');
    return {
      schema: ScientificSchema,
      tool: generateToolSchema(
        ScientificSchema,
        'deepthinking_scientific',
        'Scientific: hypothesis testing, systems thinking, formal logic'
      ),
    };
  },

  deepthinking_session: async () => {
    const { SessionActionSchema } = await import('./schemas/base.js');
    const { generateToolSchema } = await import('./schema-generator.js');
    return {
      schema: SessionActionSchema,
      tool: generateToolSchema(
        SessionActionSchema,
        'deepthinking_session',
        'Session: summarize, export, get, switch_mode, recommend'
      ),
    };
  },
};

/**
 * Cache for loaded schemas
 */
const loadedSchemas = new Map<string, { schema: z.ZodType; tool: object }>();

/**
 * Get schema for a tool (lazy loaded)
 */
export async function getSchema(toolName: string): Promise<{ schema: z.ZodType; tool: object }> {
  if (!loadedSchemas.has(toolName)) {
    const loader = schemaLoaders[toolName];
    if (!loader) {
      throw new Error(`Unknown tool: ${toolName}`);
    }
    loadedSchemas.set(toolName, await loader());
  }
  return loadedSchemas.get(toolName)!;
}

/**
 * Get tool definition (lazy loaded)
 */
export async function getToolDefinition(toolName: string): Promise<object> {
  const { tool } = await getSchema(toolName);
  return tool;
}

/**
 * Get list of currently loaded tools
 */
export function getLoadedTools(): string[] {
  return Array.from(loadedSchemas.keys());
}

/**
 * Get all available tool names
 */
export function getAvailableTools(): string[] {
  return Object.keys(schemaLoaders);
}

/**
 * Preload specific schemas (for optimization)
 */
export async function preloadSchemas(toolNames: string[]): Promise<void> {
  await Promise.all(toolNames.map((name) => getSchema(name)));
}

/**
 * Preload all schemas (useful during startup if needed)
 */
export async function preloadAllSchemas(): Promise<void> {
  await preloadSchemas(getAvailableTools());
}

/**
 * Clear the schema cache (useful for testing)
 */
export function clearSchemaCache(): void {
  loadedSchemas.clear();
}

/**
 * Get memory usage statistics
 */
export function getSchemaStats(): {
  loaded: number;
  available: number;
  loadedNames: string[];
} {
  return {
    loaded: loadedSchemas.size,
    available: Object.keys(schemaLoaders).length,
    loadedNames: getLoadedTools(),
  };
}

/**
 * Get all tool definitions (for MCP ListTools)
 * Note: This loads all schemas - use sparingly
 */
export async function getAllToolDefinitions(): Promise<object[]> {
  const toolNames = getAvailableTools();
  const definitions = await Promise.all(
    toolNames.map(async (name) => {
      const { tool } = await getSchema(name);
      return tool;
    })
  );
  return definitions;
}

/**
 * Validate input against a tool's schema
 * Lazy loads the schema if not already loaded
 */
export async function validateInput(
  toolName: string,
  input: unknown
): Promise<{ success: boolean; data?: unknown; error?: z.ZodError }> {
  const { schema } = await getSchema(toolName);
  const result = schema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Check if a tool exists
 */
export function isValidTool(toolName: string): boolean {
  return toolName in schemaLoaders;
}
