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

/**
 * Session identifier. Narrower than IdSchema because a session ID is always a
 * UUID v4 (36 chars) — `validateSessionId()` in src/utils/sanitization.ts
 * rejects anything else once the value reaches SessionManager. Before this was
 * wired, the same field was bounded three different ways: 10,000 chars on the
 * legacy tool, 1,000 on the focused tools, 36 in the session layer.
 */
export const SessionIdSchema = z.string().max(MAX_LENGTHS.SESSION_ID);

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

/**
 * Bound a record's ENTRY COUNT, not just its key length and value type.
 *
 * Zod records have no built-in `.max()` on the number of keys, so bounding the
 * key string and the value type still leaves the map itself unbounded -- a
 * caller could submit 100,000 entries. That is the same gap the array bounds
 * closed, simply not extended to records when they were added; surfaced by
 * security review of v9.3.0.
 *
 * Implemented with superRefine rather than a wrapper type so the inferred type
 * is unchanged and call sites keep their existing shape.
 */
export function boundedRecord<
  K extends z.ZodType<string>,
  V extends z.ZodTypeAny,
>(key: K, value: V, maxEntries: number = MAX_LENGTHS.ARRAY_ITEMS) {
  return z.record(key, value).superRefine((val, ctx) => {
    const size = Object.keys(val ?? {}).length;
    if (size > maxEntries) {
      ctx.addIssue({
        code: "too_big",
        origin: "record",
        maximum: maxEntries,
        inclusive: true,
        message: `Too big: expected at most ${maxEntries} entries, received ${size}`,
      });
    }
  });
}

/**
 * A value in a caller-supplied property map (for example `events[].properties`):
 * bounded text, a number, a boolean, null, or a bounded list of those.
 *
 * The values used to be `z.unknown()`, so a map was bounded by its entry count
 * alone: each value could be any JSON, nested to any depth and of any size. One
 * level of list covers the real use (a name, a count, a flag, a list of names).
 */
export const PropertyValueSchema = z.union([
  TextSchema,
  z.number(),
  z.boolean(),
  z.null(),
  boundedArray(z.union([TextSchema, z.number(), z.boolean(), z.null()])),
]);

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

/**
 * Type of a confidence value, a number from 0 to 1.
 * TypeScript infers it from ConfidenceSchema.
 */
export type Confidence = z.infer<typeof ConfidenceSchema>;
/**
 * Type of a three-level scale value: low, medium or high.
 * TypeScript infers it from LevelEnum.
 */
export type Level = z.infer<typeof LevelEnum>;
/**
 * Type of an impact assessment: positive, negative or neutral.
 * TypeScript infers it from ImpactEnum.
 */
export type Impact = z.infer<typeof ImpactEnum>;
/**
 * Type of an export format: markdown, latex, json, html,
 * jupyter, mermaid, dot or ascii.
 * TypeScript infers it from ExportFormatEnum.
 */
export type ExportFormat = z.infer<typeof ExportFormatEnum>;
/**
 * Type of a session action, such as summarize or export.
 * TypeScript infers it from SessionActionEnum.
 */
export type SessionAction = z.infer<typeof SessionActionEnum>;
/**
 * Type of a proof strategy: direct, contradiction, induction,
 * construction or contrapositive.
 * TypeScript infers it from ProofTypeEnum.
 */
export type ProofType = z.infer<typeof ProofTypeEnum>;
/**
 * Type of a time unit, from milliseconds to years.
 * TypeScript infers it from TimeUnitEnum.
 */
export type TimeUnit = z.infer<typeof TimeUnitEnum>;
/**
 * Type of an Allen interval algebra constraint, such as before.
 * TypeScript infers it from TemporalConstraintEnum.
 */
export type TemporalConstraint = z.infer<typeof TemporalConstraintEnum>;
/**
 * Type of a temporal relation: the constraint values plus causes.
 * TypeScript infers it from TemporalRelationEnum.
 */
export type TemporalRelation = z.infer<typeof TemporalRelationEnum>;
/**
 * Type of an event: instant or interval.
 * TypeScript infers it from EventTypeEnum.
 */
export type EventType = z.infer<typeof EventTypeEnum>;
/**
 * Type of a tensor transformation: covariant, contravariant or mixed.
 * TypeScript infers it from TransformationEnum.
 */
export type Transformation = z.infer<typeof TransformationEnum>;
/**
 * Type of a Shannon methodology stage, from problem_definition
 * to implementation.
 * TypeScript infers it from ShannonStageEnum.
 */
export type ShannonStage = z.infer<typeof ShannonStageEnum>;
