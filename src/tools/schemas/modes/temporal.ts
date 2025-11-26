/**
 * Temporal Mode Schema (v4.1.0)
 * Sprint 5 Task 5.3: Temporal reasoning with Allen's interval algebra
 * Sprint 7 Task 7.5: Use shared enums
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
  properties: z.record(z.unknown()).optional(),
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

/**
 * Temporal reasoning schema
 */
export const TemporalSchema = BaseThoughtSchema.extend({
  mode: z.literal('temporal'),
  timeline: TimelineSchema.optional(),
  events: z.array(TemporalEventSchema).optional(),
  constraints: z.array(TemporalConstraintSchema).optional(),
  intervals: z.array(TemporalIntervalSchema).optional(),
  relations: z.array(TemporalRelationSchema).optional(),
});

export type TemporalInput = z.infer<typeof TemporalSchema>;
