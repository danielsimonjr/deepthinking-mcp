/**
<<<<<<< Updated upstream
 * Academic Mode Schemas (v7.5.0)
 * Phase 14: Academic research modes accessible via MCP tools
 * Designed for PhD students and scientific paper writing
=======
 * Academic Mode Schema (Phase 13 v7.4.0)
 * Zod validation schema for synthesis, argumentation, critique, analysis modes
>>>>>>> Stashed changes
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';
<<<<<<< Updated upstream

export const AcademicSchema = BaseThoughtSchema.extend({
  mode: z.enum(['synthesis', 'argumentation', 'critique', 'analysis']),
=======
import { ConfidenceSchema } from '../shared.js';

/**
 * Academic mode enum
 */
export const AcademicModeEnum = z.enum(['synthesis', 'argumentation', 'critique', 'analysis']);

/**
 * Source schema for synthesis mode
 */
const SourceSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  title: z.string(),
  authors: z.array(z.string()).optional(),
  year: z.number().int().optional(),
  venue: z.string().optional(),
  doi: z.string().optional(),
  relevance: ConfidenceSchema.optional(),
});

/**
 * Theme schema for synthesis mode
 */
const ThemeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  sourceIds: z.array(z.string()).optional(),
  strength: ConfidenceSchema.optional(),
  consensus: z.enum(['strong', 'moderate', 'weak', 'contested']).optional(),
});

/**
 * Gap schema for synthesis mode
 */
const GapSchema = z.object({
  id: z.string(),
  description: z.string(),
  type: z.enum(['empirical', 'theoretical', 'methodological', 'population', 'contextual']).optional(),
  importance: z.enum(['critical', 'significant', 'moderate', 'minor']).optional(),
});

/**
 * Claim schema for argumentation mode (Toulmin)
 */
const ClaimSchema = z.object({
  id: z.string(),
  statement: z.string(),
  type: z.enum(['fact', 'value', 'policy', 'definition', 'cause']).optional(),
  strength: z.enum(['strong', 'moderate', 'tentative']).optional(),
});

/**
 * Grounds schema for argumentation mode
 */
const GroundsSchema = z.object({
  id: z.string(),
  type: z.enum(['empirical', 'statistical', 'testimonial', 'analogical', 'logical', 'textual']).optional(),
  content: z.string(),
  source: z.string().optional(),
  reliability: ConfidenceSchema.optional(),
});

/**
 * Warrant schema for argumentation mode
 */
const WarrantSchema = z.object({
  id: z.string(),
  statement: z.string(),
  type: z.enum(['generalization', 'analogy', 'causal', 'authority', 'principle', 'definition']).optional(),
  groundsIds: z.array(z.string()).optional(),
  claimId: z.string().optional(),
});

/**
 * Rebuttal schema for argumentation mode
 */
const RebuttalSchema = z.object({
  id: z.string(),
  objection: z.string(),
  type: z.enum(['factual', 'logical', 'ethical', 'practical', 'definitional']).optional(),
  strength: z.enum(['strong', 'moderate', 'weak']).optional(),
  response: z.string().optional(),
});

/**
 * Critiqued work schema
 */
const CritiquedWorkSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  authors: z.array(z.string()).optional(),
  year: z.number().int().optional(),
  type: z.string().optional(),
  field: z.string().optional(),
});

/**
 * Qualitative code schema for analysis mode
 */
const CodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  definition: z.string().optional(),
  type: z.enum(['descriptive', 'in_vivo', 'process', 'initial', 'focused', 'axial', 'theoretical', 'emotion', 'value']).optional(),
  frequency: z.number().int().optional(),
  examples: z.array(z.string()).optional(),
});

/**
 * Memo schema for analysis mode
 */
const MemoSchema = z.object({
  id: z.string(),
  type: z.enum(['analytical', 'theoretical', 'methodological', 'reflexive', 'code', 'operational']).optional(),
  content: z.string(),
  relatedCodes: z.array(z.string()).optional(),
});

/**
 * Academic research schema - combines all 4 modes
 */
export const AcademicSchema = BaseThoughtSchema.extend({
  mode: AcademicModeEnum,
  thoughtType: z.string().optional(),

  // Synthesis properties
  sources: z.array(SourceSchema).optional(),
  themes: z.array(ThemeSchema).optional(),
  gaps: z.array(GapSchema).optional(),

  // Argumentation properties (Toulmin model)
  claims: z.array(ClaimSchema).optional(),
  grounds: z.array(GroundsSchema).optional(),
  warrants: z.array(WarrantSchema).optional(),
  rebuttals: z.array(RebuttalSchema).optional(),
  argumentStrength: ConfidenceSchema.optional(),

  // Critique properties
  critiquedWork: CritiquedWorkSchema.optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  suggestions: z.array(z.string()).optional(),

  // Analysis properties (qualitative)
  methodology: z.enum([
    'thematic_analysis',
    'grounded_theory',
    'discourse_analysis',
    'content_analysis',
    'phenomenological',
    'narrative_analysis',
    'framework_analysis',
    'template_analysis',
    'mixed_qualitative',
  ]).optional(),
  dataSources: z.array(z.object({
    id: z.string(),
    type: z.string(),
    description: z.string().optional(),
    participantId: z.string().optional(),
  })).optional(),
  codes: z.array(CodeSchema).optional(),
  memos: z.array(MemoSchema).optional(),
  saturationReached: z.boolean().optional(),

  // Shared
  keyInsight: z.string().optional(),
>>>>>>> Stashed changes
});

export type AcademicInput = z.infer<typeof AcademicSchema>;
