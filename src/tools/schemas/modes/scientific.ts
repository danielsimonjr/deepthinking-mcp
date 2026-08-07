/**
 * Scientific Mode Schemas (v8.4.0)
 * Sprint 5: Scientific Method, Systems Thinking, Formal Logic
 * Phase 15: Aligned with JSON schema for complete validation
 * v9.3.4: Added modal mode (was unreachable through any MCP tool)
 */

import { z } from "zod";
import { BaseThoughtSchema } from "../base.js";
import {
  IdSchema,
  NameSchema,
  TextSchema,
  IdArraySchema,
  boundedRecord,
} from "../shared.js";
import { MAX_LENGTHS } from "../../../utils/sanitization.js";

/**
 * Experiment schema for scientific method
 */
const ExperimentSchema = z.object({
  id: IdSchema,
  description: TextSchema,
  result: TextSchema.optional(),
});

/**
 * System component schema for systems thinking
 */
const SystemComponentSchema = z.object({
  id: IdSchema,
  name: NameSchema,
  role: TextSchema.optional(),
});

/**
 * Interaction schema for systems thinking
 */
const InteractionSchema = z.object({
  from: IdSchema,
  to: IdSchema,
  type: IdSchema,
});

/**
 * Feedback loop schema for systems thinking
 */
const FeedbackLoopSchema = z.object({
  type: z.enum(["positive", "negative", "neutral"]).optional(),
  components: IdArraySchema.optional(),
});

// ============================================================
// MODAL LOGIC (v9.3.4)
// ============================================================
//
// `modal` had a full handler (ModalHandler), a registered validator and a place
// in FULLY_IMPLEMENTED_MODES, but no tool accepted the value, so no MCP client
// could ever select it. It belongs here because modal logic IS formal logic
// extended with necessity/possibility operators -- `formallogic` already sits on
// this tool, and ModalHandler's premise/conclusion/validity machinery is the
// same family as FormalLogicHandler's, one Kripke frame deeper.
//
// No collision with the existing surface: `inference` (singular string, the
// formal-logic inference rule) is untouched; modal inferences arrive as
// `inferences` (plural array).
//
// Vocabulary fields (`thoughtType`, `modalLogicType`, `modalDomain`, relation
// `type`, proposition `operator`) are bounded strings, NOT enums: ModalHandler
// warns on or silently defaults an unrecognised value. A Zod enum would turn
// that into a hard rejection.

/** A possible world in the Kripke model. */
const PossibleWorldSchema = z.object({
  id: IdSchema.optional(),
  name: NameSchema.optional(),
  description: TextSchema.optional(),
  /** Truth assignment in this world, keyed by proposition content. */
  propositions: boundedRecord(IdSchema, z.boolean()).optional(),
  isActual: z.boolean().optional(),
  accessibility: IdArraySchema.optional(),
});

/** A proposition evaluated under a modal operator. */
const ModalPropositionSchema = z.object({
  id: IdSchema.optional(),
  content: TextSchema.optional(),
  operator: IdSchema.optional(),
  truthValue: z.boolean().optional(),
  worldsTrue: IdArraySchema.optional(),
  worldsFalse: IdArraySchema.optional(),
});

/** An accessibility relation between two worlds. */
const AccessibilityRelationSchema = z.object({
  id: IdSchema.optional(),
  fromWorld: IdSchema.optional(),
  toWorld: IdSchema.optional(),
  type: IdSchema.optional(),
  modalType: IdSchema.optional(),
});

/** A modal inference: premises, a rule, and its validity. */
const ModalInferenceSchema = z.object({
  id: IdSchema.optional(),
  premises: IdArraySchema.optional(),
  conclusion: TextSchema.optional(),
  rule: IdSchema.optional(),
  valid: z.boolean().optional(),
  justification: TextSchema.optional(),
});

/**
 * Scientific reasoning schema (+ Modal logic)
 */
export const ScientificSchema = BaseThoughtSchema.extend({
  mode: z.enum(["scientificmethod", "systemsthinking", "formallogic", "modal"]),

  /** Mode-specific step label; every handler here resolves it leniently. */
  thoughtType: IdSchema.optional(),

  // Scientific method
  hypothesis: TextSchema.optional(),
  predictions: IdArraySchema.optional(),
  experiments: z
    .array(ExperimentSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),

  // Systems thinking
  systemComponents: z
    .array(SystemComponentSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  interactions: z
    .array(InteractionSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  feedbackLoops: z
    .array(FeedbackLoopSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),

  // Formal logic
  premises: IdArraySchema.optional(),
  conclusion: TextSchema.optional(),
  inference: TextSchema.optional(),

  // Modal logic
  worlds: z
    .array(PossibleWorldSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  actualWorld: IdSchema.optional(),
  propositions: z
    .array(ModalPropositionSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  accessibilityRelations: z
    .array(AccessibilityRelationSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  inferences: z
    .array(ModalInferenceSchema)
    .max(MAX_LENGTHS.NESTED_ARRAY_ITEMS)
    .optional(),
  modalLogicType: IdSchema.optional(),
  modalDomain: IdSchema.optional(),
});

export type ScientificInput = z.infer<typeof ScientificSchema>;
