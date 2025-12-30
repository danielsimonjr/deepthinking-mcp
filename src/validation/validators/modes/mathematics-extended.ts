/**
 * Mathematics Extended Validators (v9.0.0)
 * Phase 15A Sprint 3: Zod validators for proof decomposition types
 *
 * Validates output structures from MathematicsReasoningEngine:
 * - AtomicStatement
 * - DependencyGraph
 * - ProofDecomposition
 * - ConsistencyReport
 * - GapAnalysis
 * - AssumptionAnalysis
 */

import { z } from 'zod';

/**
 * Inference rules for mathematical reasoning
 */
export const InferenceRuleSchema = z.enum([
  'modus_ponens',
  'modus_tollens',
  'hypothetical_syllogism',
  'disjunctive_syllogism',
  'universal_instantiation',
  'existential_generalization',
  'mathematical_induction',
  'contradiction',
  'direct_implication',
  'substitution',
  'algebraic_manipulation',
  'definition_expansion',
]);

export type InferenceRuleInput = z.infer<typeof InferenceRuleSchema>;

/**
 * Atomic statement types
 */
export const AtomicStatementTypeSchema = z.enum([
  'axiom',
  'definition',
  'hypothesis',
  'lemma',
  'derived',
  'conclusion',
]);

/**
 * Source location for a statement
 */
export const SourceLocationSchema = z.object({
  stepNumber: z.number().int().optional(),
  section: z.string().optional(),
});

/**
 * Atomic Statement - smallest unit of a proof
 */
export const AtomicStatementSchema = z.object({
  id: z.string().min(1, 'ID cannot be empty'),
  statement: z.string().min(1, 'Statement cannot be empty'),
  latex: z.string().optional(),
  type: AtomicStatementTypeSchema,

  // Provenance
  justification: z.string().optional(),
  derivedFrom: z.array(z.string()).optional(),
  usedInferenceRule: InferenceRuleSchema.optional(),

  // Metadata
  confidence: z.number().min(0).max(1),
  isExplicit: z.boolean().optional().default(true),
  sourceLocation: SourceLocationSchema.optional(),
});

export type AtomicStatementInput = z.infer<typeof AtomicStatementSchema>;

/**
 * Dependency edge types
 */
export const DependencyEdgeTypeSchema = z.enum([
  'logical',
  'definitional',
  'computational',
  'implicit',
]);

/**
 * Dependency edge in the graph
 */
export const DependencyEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: DependencyEdgeTypeSchema,
  strength: z.number().min(0).max(1).optional().default(1),
  inferenceRule: InferenceRuleSchema.optional(),
});

export type DependencyEdgeInput = z.infer<typeof DependencyEdgeSchema>;

/**
 * Dependency Graph for proof analysis
 * Note: nodes can be a Map at runtime, but for validation we accept any object
 * since Map is not directly JSON-serializable
 */
export const DependencyGraphSchema = z.object({
  // Map<string, AtomicStatement> or object - at runtime this may be a Map
  nodes: z.any(),  // Accept Map or serialized object
  edges: z.array(DependencyEdgeSchema),

  // Computed properties
  roots: z.array(z.string()),
  leaves: z.array(z.string()),

  // Graph metrics
  depth: z.number().int().optional(),
  width: z.number().int().optional(),
  hasCycles: z.boolean(),

  // Analysis
  stronglyConnectedComponents: z.array(z.array(z.string())).optional(),
  topologicalOrder: z.array(z.string()).optional(),
});

export type DependencyGraphInput = z.infer<typeof DependencyGraphSchema>;

/**
 * Proof gap types
 */
export const ProofGapTypeSchema = z.enum([
  'missing_step',
  'unjustified_leap',
  'implicit_assumption',
  'undefined_term',
  'scope_error',
]);

/**
 * Proof gap severity
 */
export const GapSeveritySchema = z.enum(['minor', 'significant', 'critical']);

/**
 * Proof Gap - identified gap in a proof
 */
export const ProofGapSchema = z.object({
  id: z.string(),
  type: ProofGapTypeSchema,
  location: z.object({
    from: z.string(),
    to: z.string(),
  }),
  description: z.string(),
  severity: GapSeveritySchema,
  suggestedFix: z.string().optional(),
});

export type ProofGapInput = z.infer<typeof ProofGapSchema>;

/**
 * Implicit assumption types
 */
export const ImplicitAssumptionTypeSchema = z.enum([
  'domain_assumption',
  'existence_assumption',
  'uniqueness_assumption',
  'continuity_assumption',
  'finiteness_assumption',
  'well_ordering',
]);

/**
 * Implicit Assumption
 */
export const ImplicitAssumptionSchema = z.object({
  id: z.string(),
  statement: z.string(),
  type: ImplicitAssumptionTypeSchema,
  usedInStep: z.string(),
  shouldBeExplicit: z.boolean(),
  suggestedFormulation: z.string(),
});

export type ImplicitAssumptionInput = z.infer<typeof ImplicitAssumptionSchema>;

/**
 * Assumption Chain - path from conclusion to axioms
 */
export const AssumptionChainSchema = z.object({
  conclusion: z.string(),
  assumptions: z.array(z.string()),
  path: z.array(z.string()),
  allAssumptionsExplicit: z.boolean(),
  implicitAssumptions: z.array(ImplicitAssumptionSchema),
});

export type AssumptionChainInput = z.infer<typeof AssumptionChainSchema>;

/**
 * Rigor levels
 */
export const RigorLevelSchema = z.enum(['informal', 'textbook', 'rigorous', 'formal']);

/**
 * Complete Proof Decomposition result
 */
export const ProofDecompositionSchema = z.object({
  id: z.string().optional(),
  originalProof: z.string().optional(),
  theorem: z.string().optional(),

  // Decomposed elements
  atoms: z.array(AtomicStatementSchema),
  dependencies: DependencyGraphSchema.optional(),

  // Analysis results
  assumptionChains: z.array(AssumptionChainSchema).optional(),
  gaps: z.array(ProofGapSchema).optional(),
  implicitAssumptions: z.array(ImplicitAssumptionSchema).optional(),

  // Metrics
  completeness: z.number().min(0).max(1),
  rigorLevel: RigorLevelSchema,
  atomCount: z.number().int().nonnegative(),
  maxDependencyDepth: z.number().int().nonnegative(),
});

export type ProofDecompositionInput = z.infer<typeof ProofDecompositionSchema>;

/**
 * Inconsistency types
 */
export const InconsistencyTypeSchema = z.enum([
  'direct_contradiction',
  'circular_reasoning',
  'type_mismatch',
  'domain_violation',
  'undefined_operation',
  'axiom_conflict',
  'hidden_assumption',
  'quantifier_error',
  'equivalence_failure',
]);

/**
 * Inconsistency severity
 */
export const InconsistencySeveritySchema = z.enum(['warning', 'error', 'critical']);

/**
 * Detected Inconsistency
 */
export const InconsistencySchema = z.object({
  id: z.string(),
  type: InconsistencyTypeSchema,
  involvedStatements: z.array(z.string()),
  explanation: z.string(),
  derivationPath: z.array(z.string()).optional(),
  severity: InconsistencySeveritySchema,
  suggestedResolution: z.string().optional(),
});

export type InconsistencyInput = z.infer<typeof InconsistencySchema>;

/**
 * Circular Path - reasoning cycle
 */
export const CircularPathSchema = z.object({
  statements: z.array(z.string()),
  cycleLength: z.number().int().positive(),
  explanation: z.string(),
  visualPath: z.string(),
  severity: GapSeveritySchema,
});

export type CircularPathInput = z.infer<typeof CircularPathSchema>;

/**
 * Consistency Report
 */
export const ConsistencyReportSchema = z.object({
  isConsistent: z.boolean(),
  overallScore: z.number().min(0).max(1),
  inconsistencies: z.array(InconsistencySchema),
  warnings: z.array(z.string()),
  circularReasoning: z.array(CircularPathSchema),
  summary: z.string(),
});

export type ConsistencyReportInput = z.infer<typeof ConsistencyReportSchema>;

/**
 * Gap Analysis result
 */
export const GapAnalysisSchema = z.object({
  completeness: z.number().min(0).max(1),
  gaps: z.array(ProofGapSchema),
  implicitAssumptions: z.array(ImplicitAssumptionSchema),
  unjustifiedSteps: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export type GapAnalysisInput = z.infer<typeof GapAnalysisSchema>;

/**
 * Assumption Analysis result
 */
export const AssumptionAnalysisSchema = z.object({
  explicitAssumptions: z.array(AtomicStatementSchema),
  implicitAssumptions: z.array(ImplicitAssumptionSchema),
  unusedAssumptions: z.array(z.string()),
  // Maps serialized as objects for JSON compatibility
  conclusionDependencies: z.record(z.string(), z.array(z.string())).optional(),
  minimalSets: z.record(z.string(), z.array(z.string())).optional(),
});

export type AssumptionAnalysisInput = z.infer<typeof AssumptionAnalysisSchema>;

/**
 * Validate AtomicStatement
 */
export function validateAtomicStatement(input: unknown): AtomicStatementInput {
  return AtomicStatementSchema.parse(input);
}

/**
 * Validate ProofDecomposition
 */
export function validateProofDecomposition(input: unknown): ProofDecompositionInput {
  return ProofDecompositionSchema.parse(input);
}

/**
 * Validate ConsistencyReport
 */
export function validateConsistencyReport(input: unknown): ConsistencyReportInput {
  return ConsistencyReportSchema.parse(input);
}

/**
 * Validate GapAnalysis
 */
export function validateGapAnalysis(input: unknown): GapAnalysisInput {
  return GapAnalysisSchema.parse(input);
}

/**
 * Validate AssumptionAnalysis
 */
export function validateAssumptionAnalysis(input: unknown): AssumptionAnalysisInput {
  return AssumptionAnalysisSchema.parse(input);
}

/**
 * Safe validation helpers - return result instead of throwing
 */
export function safeValidateProofDecomposition(input: unknown):
  { success: true; data: ProofDecompositionInput } | { success: false; error: z.ZodError } {
  const result = ProofDecompositionSchema.safeParse(input);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error };
}

export function safeValidateConsistencyReport(input: unknown):
  { success: true; data: ConsistencyReportInput } | { success: false; error: z.ZodError } {
  const result = ConsistencyReportSchema.safeParse(input);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error };
}
