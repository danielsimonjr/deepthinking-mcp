/**
 * Shared Schema Components (v4.1.0)
 * Sprint 7 Task 7.5: Consolidate common schema patterns
 *
 * Reduces duplication across mode-specific schemas.
 * Import these shared components instead of redefining.
 */

import { z } from 'zod';

// ============================================================
// NUMERIC SCHEMAS
// ============================================================

/**
 * Confidence/probability value (0-1 range)
 * Used for: uncertainty, confidence, probability, strength, mass
 */
export const ConfidenceSchema = z.number().min(0).max(1);

/**
 * Positive integer (1+)
 */
export const PositiveIntSchema = z.number().int().min(1);

// ============================================================
// COMMON ENUMS
// ============================================================

/**
 * Three-level scale (low/medium/high)
 * Used for: complexity, uncertainty, priority
 */
export const LevelEnum = z.enum(['low', 'medium', 'high']);

/**
 * Impact assessment
 */
export const ImpactEnum = z.enum(['positive', 'negative', 'neutral']);

/**
 * Export formats supported by DeepThinking MCP
 */
export const ExportFormatEnum = z.enum([
  'markdown',
  'latex',
  'json',
  'html',
  'jupyter',
  'mermaid',
  'dot',
  'ascii',
]);

/**
 * Session actions
 */
export const SessionActionEnum = z.enum([
  'summarize',
  'export',
  'export_all',
  'get_session',
  'switch_mode',
  'recommend_mode',
  'delete_session',
]);

/**
 * Proof strategy types (mathematics mode)
 */
export const ProofTypeEnum = z.enum([
  'direct',
  'contradiction',
  'induction',
  'construction',
  'contrapositive',
]);

/**
 * Time units
 */
export const TimeUnitEnum = z.enum([
  'milliseconds',
  'seconds',
  'minutes',
  'hours',
  'days',
  'months',
  'years',
]);

/**
 * Temporal constraint types (Allen's interval algebra)
 */
export const TemporalConstraintEnum = z.enum([
  'before',
  'after',
  'during',
  'overlaps',
  'meets',
  'starts',
  'finishes',
  'equals',
]);

/**
 * Temporal relation types
 */
export const TemporalRelationEnum = z.enum([
  'before',
  'after',
  'during',
  'overlaps',
  'meets',
  'starts',
  'finishes',
  'equals',
  'causes',
]);

/**
 * Event types
 */
export const EventTypeEnum = z.enum(['instant', 'interval']);

/**
 * Tensor transformation types
 */
export const TransformationEnum = z.enum(['covariant', 'contravariant', 'mixed']);

/**
 * Shannon methodology stages
 */
export const ShannonStageEnum = z.enum([
  'problem_definition',
  'constraints',
  'model',
  'proof',
  'implementation',
]);

// ============================================================
// REUSABLE OBJECT SCHEMAS
// ============================================================

/**
 * Basic entity with ID and name
 */
export const EntitySchema = z.object({
  id: z.string(),
  name: z.string(),
});

/**
 * Entity with description
 */
export const DescribedEntitySchema = EntitySchema.extend({
  description: z.string(),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type Confidence = z.infer<typeof ConfidenceSchema>;
export type Level = z.infer<typeof LevelEnum>;
export type Impact = z.infer<typeof ImpactEnum>;
export type ExportFormat = z.infer<typeof ExportFormatEnum>;
export type SessionAction = z.infer<typeof SessionActionEnum>;
export type ProofType = z.infer<typeof ProofTypeEnum>;
export type TimeUnit = z.infer<typeof TimeUnitEnum>;
export type TemporalConstraint = z.infer<typeof TemporalConstraintEnum>;
export type TemporalRelation = z.infer<typeof TemporalRelationEnum>;
export type EventType = z.infer<typeof EventTypeEnum>;
export type Transformation = z.infer<typeof TransformationEnum>;
export type ShannonStage = z.infer<typeof ShannonStageEnum>;
