/**
 * Shared Schema Components (v4.1.0)
 * Sprint 7 Task 7.5: Consolidate common schema patterns
 *
 * Reduces duplication across mode-specific schemas.
 * Import these shared components instead of redefining.
 */

import { z } from "zod";
import { MAX_LENGTHS } from "../../utils/sanitization.js";

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
// BOUNDED STRING/ARRAY SCHEMAS (H-2 remediation, 2026-08-03 audit)
// ============================================================
//
// Every free-text string and every array in src/tools/schemas/** must be
// bounded — before this fix, sanitization only ran in SessionManager, so a
// tool call (deepthinking_probabilistic) could carry a 5 MB string field or
// a 50,000-element array. Limits are centralised on MAX_LENGTHS
// (src/utils/sanitization.ts) so this file and MAX_LENGTHS never drift.
//
// Tiers, chosen to be generous for legitimate use while killing multi-MB /
// unbounded-array payloads:
//   - IdSchema     short identifiers/enums-as-strings (id, from, to, node…) — 1,000 chars
//   - NameSchema    names/titles/labels                                     —   500 chars
//   - TextSchema    free-text content/descriptions/explanations             — 10,000 chars
//   - ThoughtTextSchema  large free-form bodies (the `thought` field itself) — 100,000 chars
//   - boundedArray(item, maxItems)  caps array length (default tiers below)

/** Short identifier/enum-like string (ids, from/to, node refs, etc.) */
export const IdSchema = z.string().max(MAX_LENGTHS.STRING_FIELD);

/** Name/title/label-like string */
export const NameSchema = z.string().max(MAX_LENGTHS.TITLE);

/** Free-text content: description, explanation, statement, justification, etc. */
export const TextSchema = z.string().max(MAX_LENGTHS.DESCRIPTION);

/** Large free-form text bodies (thought content, LaTeX/model source, etc.) */
export const ThoughtTextSchema = z.string().max(MAX_LENGTHS.THOUGHT_CONTENT);

/**
 * Bound an array's length. Defaults to ARRAY_ITEMS (1,000) for arrays of
 * primitives; pass MAX_LENGTHS.NESTED_ARRAY_ITEMS (500) for arrays of
 * structured objects, which are heavier per element.
 */
export function boundedArray<T extends z.ZodTypeAny>(
  item: T,
  maxItems: number = MAX_LENGTHS.ARRAY_ITEMS,
) {
  return z.array(item).max(maxItems);
}

/** Array of bounded id-like strings (evidence, tags, dependencies, etc.) */
export const IdArraySchema = boundedArray(IdSchema);

/** Array of bounded free-text strings (observations, premises, etc.) */
export const TextArraySchema = boundedArray(TextSchema);

// ============================================================
// COMMON ENUMS
// ============================================================

/**
 * Three-level scale (low/medium/high)
 * Used for: complexity, uncertainty, priority
 */
export const LevelEnum = z.enum(["low", "medium", "high"]);

/**
 * Impact assessment
 */
export const ImpactEnum = z.enum(["positive", "negative", "neutral"]);

/**
 * Export formats supported by DeepThinking MCP
 */
export const ExportFormatEnum = z.enum([
  "markdown",
  "latex",
  "json",
  "html",
  "jupyter",
  "mermaid",
  "dot",
  "ascii",
]);

/**
 * Session actions
 */
export const SessionActionEnum = z.enum([
  "summarize",
  "export",
  "export_all",
  "get_session",
  "switch_mode",
  "recommend_mode",
  "delete_session",
]);

/**
 * Export profile presets (Phase 12 Sprint 4)
 * Defines pre-configured export bundles for common use cases
 */
export const ExportProfileEnum = z.enum([
  "academic",
  "presentation",
  "documentation",
  "archive",
  "minimal",
]);

/**
 * Proof strategy types (mathematics mode)
 */
export const ProofTypeEnum = z.enum([
  "direct",
  "contradiction",
  "induction",
  "construction",
  "contrapositive",
]);

/**
 * Time units
 */
export const TimeUnitEnum = z.enum([
  "milliseconds",
  "seconds",
  "minutes",
  "hours",
  "days",
  "months",
  "years",
]);

/**
 * Temporal constraint types (Allen's interval algebra)
 */
export const TemporalConstraintEnum = z.enum([
  "before",
  "after",
  "during",
  "overlaps",
  "meets",
  "starts",
  "finishes",
  "equals",
]);

/**
 * Temporal relation types
 */
export const TemporalRelationEnum = z.enum([
  "before",
  "after",
  "during",
  "overlaps",
  "meets",
  "starts",
  "finishes",
  "equals",
  "causes",
]);

/**
 * Event types
 */
export const EventTypeEnum = z.enum(["instant", "interval"]);

/**
 * Tensor transformation types
 */
export const TransformationEnum = z.enum([
  "covariant",
  "contravariant",
  "mixed",
]);

/**
 * Shannon methodology stages
 */
export const ShannonStageEnum = z.enum([
  "problem_definition",
  "constraints",
  "model",
  "proof",
  "implementation",
]);

// ============================================================
// REUSABLE OBJECT SCHEMAS
// ============================================================

/**
 * Basic entity with ID and name
 */
export const EntitySchema = z.object({
  id: IdSchema,
  name: NameSchema,
});

/**
 * Entity with description
 */
export const DescribedEntitySchema = EntitySchema.extend({
  description: TextSchema,
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
