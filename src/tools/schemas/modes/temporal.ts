/**
 * Temporal Mode Schema (v9.1.0)
 * Sprint 5 Task 5.3: Temporal reasoning with Allen's interval algebra
 * Sprint 7 Task 7.5: Use shared enums
 * v9.1.0: Added historical mode support
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';
import {
  ConfidenceSchema,
  TimeUnitEnum,
  TemporalConstraintEnum,
  TemporalRelationEnum,
  EventTypeEnum,
} from '../shared.js';

// ===== HISTORICAL MODE SCHEMAS (v9.1.0) =====

const DateRangeSchema = z.object({
  start: z.string(),
  end: z.string(),
  precision: z.enum(['exact', 'approximate', 'century', 'decade', 'year', 'month', 'day']).optional(),
});

const HistoricalEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.union([z.string(), DateRangeSchema]),
  location: z.string().optional(),
  description: z.string().optional(),
  actors: z.array(z.string()).optional(),
  causes: z.array(z.string()).optional(),
  effects: z.array(z.string()).optional(),
  significance: z.enum(['minor', 'moderate', 'major', 'transformative']),
  sources: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

const SourceBiasSchema = z.object({
  type: z.enum(['political', 'religious', 'cultural', 'economic', 'nationalistic', 'ideological', 'personal']),
  direction: z.string().optional(),
  severity: z.number().min(0).max(1).optional(),
});

const HistoricalSourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['primary', 'secondary', 'tertiary']),
  subtype: z.enum(['document', 'artifact', 'oral', 'visual', 'archaeological', 'statistical']).optional(),
  author: z.string().optional(),
  date: z.string().optional(),
  reliability: z.number().min(0).max(1),
  bias: SourceBiasSchema.optional(),
  corroboratedBy: z.array(z.string()).optional(),
  contradictedBy: z.array(z.string()).optional(),
});

const HistoricalPeriodSchema = z.object({
  id: z.string(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  characteristics: z.array(z.string()),
  keyEvents: z.array(z.string()).optional(),
  keyActors: z.array(z.string()).optional(),
  themes: z.array(z.string()).optional(),
});

const CausalLinkSchema = z.object({
  cause: z.string(),
  effect: z.string(),
  mechanism: z.string().optional(),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string()).optional(),
});

const CausalChainSchema = z.object({
  id: z.string(),
  name: z.string(),
  links: z.array(CausalLinkSchema),
  confidence: z.number().min(0).max(1),
  alternativeExplanations: z.array(z.string()).optional(),
});

const ActorRelationshipSchema = z.object({
  actorId: z.string(),
  type: z.enum(['ally', 'rival', 'subordinate', 'superior', 'colleague', 'influenced_by', 'mentor', 'successor']),
  description: z.string().optional(),
});

const HistoricalActorSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['individual', 'group', 'institution', 'nation', 'movement', 'class']),
  period: z.string().optional(),
  roles: z.array(z.string()).optional(),
  motivations: z.array(z.string()).optional(),
  relationships: z.array(ActorRelationshipSchema).optional(),
  significance: z.enum(['minor', 'moderate', 'major', 'transformative']).optional(),
});

const HistoricalThoughtTypeSchema = z.enum([
  'event_analysis',
  'source_evaluation',
  'pattern_identification',
  'causal_chain',
  'periodization',
]);

const TimelineSchema = z.object({
  id: z.string(),
  name: z.string(),
  timeUnit: TimeUnitEnum,
  events: z.array(z.string()),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
});

const TemporalEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  timestamp: z.number(),
  type: EventTypeEnum,
  duration: z.number().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
});

const TemporalConstraintSchema = z.object({
  id: z.string(),
  type: TemporalConstraintEnum,
  subject: z.string(),
  object: z.string(),
  confidence: ConfidenceSchema,
});

const TemporalIntervalSchema = z.object({
  id: z.string(),
  name: z.string(),
  start: z.number(),
  end: z.number(),
  contains: z.array(z.string()).optional(),
  overlaps: z.array(z.string()).optional(),
});

const TemporalRelationSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
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
  mode: z.enum(['temporal', 'historical']),

  // Temporal-specific properties
  timeline: TimelineSchema.optional(),
  events: z.array(TemporalEventSchema).optional(),
  constraints: z.array(TemporalConstraintSchema).optional(),
  intervals: z.array(TemporalIntervalSchema).optional(),
  relations: z.array(TemporalRelationSchema).optional(),

  // Historical-specific properties (v9.1.0)
  thoughtType: HistoricalThoughtTypeSchema.optional(),
  historicalEvents: z.array(HistoricalEventSchema).optional(),
  historicalSources: z.array(HistoricalSourceSchema).optional(),
  periods: z.array(HistoricalPeriodSchema).optional(),
  causalChains: z.array(CausalChainSchema).optional(),
  actors: z.array(HistoricalActorSchema).optional(),
  historiographicalSchool: z.string().optional(),
});

export type TemporalInput = z.infer<typeof TemporalSchema>;
export type HistoricalInput = TemporalInput;
