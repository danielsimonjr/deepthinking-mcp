/**
 * Academic Mode Schema (v7.5.0)
 * Phase 14: Academic research modes accessible via MCP tools
 * Designed for PhD students and scientific paper writing
 * Zod validation schema for synthesis, argumentation, critique, analysis modes
 */

import { z } from "zod";
import { BaseThoughtSchema } from "../base.js";
import { ConfidenceSchema, IdSchema, NameSchema, TextSchema, IdArraySchema } from "../shared.js";
import { MAX_LENGTHS } from "../../../utils/sanitization.js";

/**
 * Academic mode enum
 */
export const AcademicModeEnum = z.enum([
  "synthesis",
  "argumentation",
  "critique",
  "analysis",
]);

/**
 * Source schema for synthesis mode
 */
const SourceSchema = z.object({
  id: IdSchema,
  type: IdSchema.optional(),
  title: NameSchema,
  authors: IdArraySchema.optional(),
  year: z.number().int().optional(),
  venue: NameSchema.optional(),
  doi: IdSchema.optional(),
  relevance: ConfidenceSchema.optional(),
});

/**
 * Theme schema for synthesis mode
 */
const ThemeSchema = z.object({
  id: IdSchema,
  name: NameSchema,
  description: TextSchema.optional(),
  sourceIds: IdArraySchema.optional(),
  strength: ConfidenceSchema.optional(),
  consensus: z.enum(["strong", "moderate", "weak", "contested"]).optional(),
});

/**
 * Gap schema for synthesis mode
 */
const GapSchema = z.object({
  id: IdSchema,
  description: TextSchema,
  type: z
    .enum([
      "empirical",
      "theoretical",
      "methodological",
      "population",
      "contextual",
    ])
    .optional(),
  importance: z
    .enum(["critical", "significant", "moderate", "minor"])
    .optional(),
});

/**
 * Claim schema for argumentation mode (Toulmin)
 */
const ClaimSchema = z.object({
  id: IdSchema,
  statement: TextSchema,
  type: z.enum(["fact", "value", "policy", "definition", "cause"]).optional(),
  strength: z.enum(["strong", "moderate", "tentative"]).optional(),
});

/**
 * Grounds schema for argumentation mode
 */
const GroundsSchema = z.object({
  id: IdSchema,
  type: z
    .enum([
      "empirical",
      "statistical",
      "testimonial",
      "analogical",
      "logical",
      "textual",
    ])
    .optional(),
  content: TextSchema,
  source: IdSchema.optional(),
  reliability: ConfidenceSchema.optional(),
});

/**
 * Warrant schema for argumentation mode
 */
const WarrantSchema = z.object({
  id: IdSchema,
  statement: TextSchema,
  type: z
    .enum([
      "generalization",
      "analogy",
      "causal",
      "authority",
      "principle",
      "definition",
    ])
    .optional(),
  groundsIds: IdArraySchema.optional(),
  claimId: IdSchema.optional(),
});

/**
 * Rebuttal schema for argumentation mode
 */
const RebuttalSchema = z.object({
  id: IdSchema,
  objection: TextSchema,
  type: z
    .enum(["factual", "logical", "ethical", "practical", "definitional"])
    .optional(),
  strength: z.enum(["strong", "moderate", "weak"]).optional(),
  response: TextSchema.optional(),
});

/**
 * Critiqued work schema
 */
const CritiquedWorkSchema = z.object({
  id: IdSchema.optional(),
  title: NameSchema,
  authors: IdArraySchema.optional(),
  year: z.number().int().optional(),
  type: IdSchema.optional(),
  field: IdSchema.optional(),
});

/**
 * Qualitative code schema for analysis mode
 */
const CodeSchema = z.object({
  id: IdSchema,
  label: NameSchema,
  definition: TextSchema.optional(),
  type: z
    .enum([
      "descriptive",
      "in_vivo",
      "process",
      "initial",
      "focused",
      "axial",
      "theoretical",
      "emotion",
      "value",
    ])
    .optional(),
  frequency: z.number().int().optional(),
  examples: IdArraySchema.optional(),
});

/**
 * Memo schema for analysis mode
 */
const MemoSchema = z.object({
  id: IdSchema,
  type: z
    .enum([
      "analytical",
      "theoretical",
      "methodological",
      "reflexive",
      "code",
      "operational",
    ])
    .optional(),
  content: TextSchema,
  relatedCodes: IdArraySchema.optional(),
});

/**
 * Academic research schema - combines all 4 modes
 */
export const AcademicSchema = BaseThoughtSchema.extend({
  mode: AcademicModeEnum,
  thoughtType: IdSchema.optional(),

  // Synthesis properties
  sources: z.array(SourceSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  themes: z.array(ThemeSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  gaps: z.array(GapSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),

  // Argumentation properties (Toulmin model)
  claims: z.array(ClaimSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  grounds: z.array(GroundsSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  warrants: z.array(WarrantSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  rebuttals: z.array(RebuttalSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  argumentStrength: ConfidenceSchema.optional(),

  // Critique properties
  critiquedWork: CritiquedWorkSchema.optional(),
  strengths: IdArraySchema.optional(),
  weaknesses: IdArraySchema.optional(),
  suggestions: IdArraySchema.optional(),

  // Analysis properties (qualitative)
  methodology: z
    .enum([
      "thematic_analysis",
      "grounded_theory",
      "discourse_analysis",
      "content_analysis",
      "phenomenological",
      "narrative_analysis",
      "framework_analysis",
      "template_analysis",
      "mixed_qualitative",
    ])
    .optional(),
  dataSources: z
    .array(
      z.object({
        id: IdSchema,
        type: IdSchema,
        description: TextSchema.optional(),
        participantId: IdSchema.optional(),
      }),
    )
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  codes: z.array(CodeSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  memos: z.array(MemoSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  saturationReached: z.boolean().optional(),

  // Shared
  keyInsight: TextSchema.optional(),
});

export type AcademicInput = z.infer<typeof AcademicSchema>;
