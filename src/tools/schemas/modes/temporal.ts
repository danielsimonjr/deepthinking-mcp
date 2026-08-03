/**
 * Temporal Mode Schema (v9.1.0)
 * Sprint 5 Task 5.3: Temporal reasoning with Allen's interval algebra
 * Sprint 7 Task 7.5: Use shared enums
 * v9.1.0: Added historical mode support
 */

import { z } from "zod";
import { BaseThoughtSchema } from "../base.js";
import {
  ConfidenceSchema,
  TimeUnitEnum,
  TemporalConstraintEnum,
  TemporalRelationEnum,
  EventTypeEnum,
  IdSchema,
  NameSchema,
  TextSchema,
  IdArraySchema,
} from "../shared.js";
import { MAX_LENGTHS } from "../../../utils/sanitization.js";

// ===== HISTORICAL MODE SCHEMAS (v9.1.0) =====

const DateRangeSchema = z.object({
  start: IdSchema,
  end: IdSchema,
  precision: z
    .enum(["exact", "approximate", "century", "decade", "year", "month", "day"])
    .optional(),
});

const HistoricalEventSchema = z.object({
  id: IdSchema,
  name: NameSchema,
  date: z.union([IdSchema, DateRangeSchema]),
  location: NameSchema.optional(),
  description: TextSchema.optional(),
  actors: IdArraySchema.optional(),
  causes: IdArraySchema.optional(),
  effects: IdArraySchema.optional(),
  significance: z.enum(["minor", "moderate", "major", "transformative"]),
  sources: IdArraySchema.optional(),
  tags: IdArraySchema.optional(),
});

const SourceBiasSchema = z.object({
  type: z.enum([
    "political",
    "religious",
    "cultural",
    "economic",
    "nationalistic",
    "ideological",
    "personal",
  ]),
  direction: IdSchema.optional(),
  severity: z.number().min(0).max(1).optional(),
});

const HistoricalSourceSchema = z.object({
  id: IdSchema,
  title: NameSchema,
  type: z.enum(["primary", "secondary", "tertiary"]),
  subtype: z
    .enum([
      "document",
      "artifact",
      "oral",
      "visual",
      "archaeological",
      "statistical",
    ])
    .optional(),
  author: NameSchema.optional(),
  date: IdSchema.optional(),
  reliability: z.number().min(0).max(1),
  bias: SourceBiasSchema.optional(),
  corroboratedBy: IdArraySchema.optional(),
  contradictedBy: IdArraySchema.optional(),
});

const HistoricalPeriodSchema = z.object({
  id: IdSchema,
  name: NameSchema,
  startDate: IdSchema,
  endDate: IdSchema,
  characteristics: IdArraySchema,
  keyEvents: IdArraySchema.optional(),
  keyActors: IdArraySchema.optional(),
  themes: IdArraySchema.optional(),
});

const CausalLinkSchema = z.object({
  cause: TextSchema,
  effect: TextSchema,
  mechanism: TextSchema.optional(),
  confidence: z.number().min(0).max(1),
  evidence: IdArraySchema.optional(),
});

const CausalChainSchema = z.object({
  id: IdSchema,
  name: NameSchema,
  links: z.array(CausalLinkSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS),
  confidence: z.number().min(0).max(1),
  alternativeExplanations: IdArraySchema.optional(),
});

const ActorRelationshipSchema = z.object({
  actorId: IdSchema,
  type: z.enum([
    "ally",
    "rival",
    "subordinate",
    "superior",
    "colleague",
    "influenced_by",
    "mentor",
    "successor",
  ]),
  description: TextSchema.optional(),
});

const HistoricalActorSchema = z.object({
  id: IdSchema,
  name: NameSchema,
  type: z.enum([
    "individual",
    "group",
    "institution",
    "nation",
    "movement",
    "class",
  ]),
  period: IdSchema.optional(),
  roles: IdArraySchema.optional(),
  motivations: IdArraySchema.optional(),
  relationships: z.array(ActorRelationshipSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  significance: z
    .enum(["minor", "moderate", "major", "transformative"])
    .optional(),
});

const HistoricalThoughtTypeSchema = z.enum([
  "event_analysis",
  "source_evaluation",
  "pattern_identification",
  "causal_chain",
  "periodization",
]);

const TimelineSchema = z.object({
  id: IdSchema,
  name: NameSchema,
  timeUnit: TimeUnitEnum,
  events: IdArraySchema,
  startTime: z.number().optional(),
  endTime: z.number().optional(),
});

const TemporalEventSchema = z.object({
  id: IdSchema,
  name: NameSchema,
  description: TextSchema,
  timestamp: z.number(),
  type: EventTypeEnum,
  duration: z.number().optional(),
  properties: z.record(IdSchema, z.unknown()).optional(),
});

const TemporalConstraintSchema = z.object({
  id: IdSchema,
  type: TemporalConstraintEnum,
  subject: IdSchema,
  object: IdSchema,
  confidence: ConfidenceSchema,
});

const TemporalIntervalSchema = z.object({
  id: IdSchema,
  name: NameSchema,
  start: z.number(),
  end: z.number(),
  contains: IdArraySchema.optional(),
  overlaps: IdArraySchema.optional(),
});

const TemporalRelationSchema = z.object({
  id: IdSchema,
  from: IdSchema,
  to: IdSchema,
  relationType: TemporalRelationEnum,
  strength: ConfidenceSchema,
  delay: z.number().optional(),
});

// ===== TEMPORAL MODE SCHEMAS =====

/**
 * Temporal reasoning schema (v9.1.0)
 * Now supports both temporal and historical modes
 */
export const TemporalSchema = BaseThoughtSchema.extend({
  mode: z.enum(["temporal", "historical"]),

  // Temporal-specific properties
  timeline: TimelineSchema.optional(),
  events: z.array(TemporalEventSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  constraints: z.array(TemporalConstraintSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  intervals: z.array(TemporalIntervalSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  relations: z.array(TemporalRelationSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),

  // Historical-specific properties (v9.1.0)
  thoughtType: HistoricalThoughtTypeSchema.optional(),
  historicalEvents: z.array(HistoricalEventSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  historicalSources: z.array(HistoricalSourceSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  periods: z.array(HistoricalPeriodSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  causalChains: z.array(CausalChainSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  actors: z.array(HistoricalActorSchema).max(MAX_LENGTHS.NESTED_ARRAY_ITEMS).optional(),
  historiographicalSchool: IdSchema.optional(),
});

export type TemporalInput = z.infer<typeof TemporalSchema>;
export type HistoricalInput = TemporalInput;
