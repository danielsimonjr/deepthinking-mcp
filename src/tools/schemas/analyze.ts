/**
 * Multi-Mode Analyze Tool Schema - Phase 12 Sprint 3
 *
 * Defines the MCP tool schema for the deepthinking_analyze tool,
 * which enables multi-mode reasoning analysis combining insights
 * from multiple thinking modes.
 */

import { z } from 'zod';

/**
 * Input schema for the deepthinking_analyze tool
 */
export const analyzeInputSchema = z.object({
  /** The thought or problem to analyze */
  thought: z
    .string()
    .min(1, 'Thought is required')
    .describe('The thought, problem, or question to analyze using multiple reasoning modes'),

  /** Optional preset combination to use */
  preset: z
    .enum([
      'comprehensive_analysis',
      'hypothesis_testing',
      'decision_making',
      'root_cause',
      'future_planning',
    ])
    .optional()
    .describe(
      'Pre-defined mode combination preset. Available presets: comprehensive_analysis (deductive, inductive, abductive, systems, first principles), hypothesis_testing (scientific method, Bayesian, evidential), decision_making (game theory, optimization, counterfactual), root_cause (causal, systems, first principles), future_planning (temporal, counterfactual, Bayesian)'
    ),

  /** Optional custom modes to use (overrides preset) */
  customModes: z
    .array(
      z.enum([
        'sequential',
        'shannon',
        'mathematics',
        'physics',
        'hybrid',
        'inductive',
        'deductive',
        'abductive',
        'causal',
        'bayesian',
        'counterfactual',
        'temporal',
        'gametheory',
        'evidential',
        'analogical',
        'firstprinciples',
        'systemsthinking',
        'scientificmethod',
        'formallogic',
        'optimization',
        'engineering',
        'computability',
        'cryptanalytic',
        'algorithmic',
        'synthesis',
        'argumentation',
        'critique',
        'analysis',
        'metareasoning',
      ])
    )
    .min(2, 'At least 2 modes required for multi-mode analysis')
    .max(10, 'Maximum 10 modes allowed')
    .optional()
    .describe(
      'Custom selection of modes to use. Overrides preset if provided. Minimum 2 modes required.'
    ),

  /** Optional merge strategy */
  mergeStrategy: z
    .enum(['union', 'intersection', 'weighted', 'hierarchical', 'dialectical'])
    .optional()
    .default('union')
    .describe(
      'Strategy for merging insights: union (combine all), intersection (only agreed), weighted (by confidence), hierarchical (primary + supporting), dialectical (thesis/antithesis/synthesis)'
    ),

  /** Optional session ID for tracking */
  sessionId: z
    .string()
    .optional()
    .describe('Session ID to associate this analysis with an existing session'),

  /** Optional context for the analysis */
  context: z
    .string()
    .optional()
    .describe('Additional context or background information to consider during analysis'),

  /** Optional timeout per mode in milliseconds */
  timeoutPerMode: z
    .number()
    .int()
    .min(1000)
    .max(120000)
    .optional()
    .default(30000)
    .describe('Maximum time in milliseconds to spend on each mode (default: 30000, max: 120000)'),
});

/**
 * Type for validated analyze input
 */
export type AnalyzeInput = z.infer<typeof analyzeInputSchema>;

/**
 * Output schema for the deepthinking_analyze tool
 */
export const analyzeOutputSchema = z.object({
  /** Whether the analysis succeeded */
  success: z.boolean(),

  /** Analysis ID */
  analysisId: z.string(),

  /** Number of modes used */
  modesUsed: z.number(),

  /** List of modes that contributed */
  contributingModes: z.array(z.string()),

  /** Synthesized conclusion from all modes */
  synthesizedConclusion: z.string(),

  /** Overall confidence score (0-1) */
  confidenceScore: z.number().min(0).max(1),

  /** Primary insights from the analysis */
  primaryInsights: z.array(
    z.object({
      id: z.string(),
      content: z.string(),
      sourceMode: z.string(),
      confidence: z.number(),
      category: z.string().optional(),
      priority: z.number().optional(),
    })
  ),

  /** Number of conflicts detected */
  conflictsDetected: z.number(),

  /** Number of conflicts resolved */
  conflictsResolved: z.number(),

  /** Merge strategy used */
  mergeStrategy: z.string(),

  /** Total execution time in milliseconds */
  executionTime: z.number(),

  /** Any errors encountered */
  errors: z
    .array(
      z.object({
        mode: z.string(),
        message: z.string(),
        recoverable: z.boolean(),
      })
    )
    .optional(),

  /** Statistics about the merge */
  statistics: z.object({
    totalInsightsBefore: z.number(),
    totalInsightsAfter: z.number(),
    duplicatesRemoved: z.number(),
    averageConfidence: z.number(),
    mergeTime: z.number(),
  }),
});

/**
 * Type for analyze output
 */
export type AnalyzeOutput = z.infer<typeof analyzeOutputSchema>;

/**
 * Tool definition for MCP registration
 */
export const analyzeToolDefinition = {
  name: 'deepthinking_analyze',
  description: `Multi-mode reasoning analysis tool that combines insights from multiple thinking modes.

This tool executes 2-10 reasoning modes in parallel on a given thought or problem,
then merges the resulting insights using a specified strategy. It handles conflicts
between different perspectives and produces a synthesized conclusion.

**Use Cases:**
- Complex problems requiring multiple perspectives
- Decision analysis with competing considerations
- Root cause analysis with multiple factors
- Hypothesis evaluation with different evidence types
- Strategic planning with various scenarios

**Presets:**
- comprehensive_analysis: Thorough multi-perspective analysis (5 modes)
- hypothesis_testing: Evidence-based hypothesis evaluation (4 modes)
- decision_making: Strategic decision analysis (4 modes)
- root_cause: Causal analysis for problem diagnosis (4 modes)
- future_planning: Temporal and scenario analysis (4 modes)

**Merge Strategies:**
- union: Combine all insights, remove duplicates
- intersection: Only insights agreed upon by all modes
- weighted: Weight insights by mode confidence/importance
- hierarchical: Primary mode with supporting evidence
- dialectical: Thesis-antithesis-synthesis approach`,
  inputSchema: analyzeInputSchema,
};

/**
 * Map string mode names to ThinkingMode enum values
 */
export function mapModeStringToEnum(modeString: string): string {
  // Direct mapping - the string values match the enum
  const modeMap: Record<string, string> = {
    sequential: 'sequential',
    shannon: 'shannon',
    mathematics: 'mathematics',
    physics: 'physics',
    hybrid: 'hybrid',
    inductive: 'inductive',
    deductive: 'deductive',
    abductive: 'abductive',
    causal: 'causal',
    bayesian: 'bayesian',
    counterfactual: 'counterfactual',
    temporal: 'temporal',
    gametheory: 'gametheory',
    evidential: 'evidential',
    analogical: 'analogical',
    firstprinciples: 'firstprinciples',
    systemsthinking: 'systemsthinking',
    scientificmethod: 'scientificmethod',
    formallogic: 'formallogic',
    optimization: 'optimization',
    engineering: 'engineering',
    computability: 'computability',
    cryptanalytic: 'cryptanalytic',
    algorithmic: 'algorithmic',
    synthesis: 'synthesis',
    argumentation: 'argumentation',
    critique: 'critique',
    analysis: 'analysis',
    metareasoning: 'metareasoning',
  };

  return modeMap[modeString.toLowerCase()] || modeString;
}
