/**
 * Temporal Mode Schema (v4.0.0)
 * Sprint 5 Task 5.3: Temporal reasoning with Allen's interval algebra
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';

/**
 * Time units
 */
const TimeUnitEnum = z.enum([
  'milliseconds', 'seconds', 'minutes', 'hours', 'days', 'months', 'years'
]);

/**
 * Allen's interval algebra constraints
 */
const TemporalConstraintTypeEnum = z.enum([
  'before', 'after', 'during', 'overlaps', 'meets', 'starts', 'finishes', 'equals'
]);

/**
 * Timeline structure
 */
const TimelineSchema = z.object({
  id: z.string(),
  name: z.string(),
  timeUnit: TimeUnitEnum,
  events: z.array(z.string()),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
});

/**
 * Temporal event
 */
const TemporalEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  timestamp: z.number(),
  type: z.enum(['instant', 'interval']),
  duration: z.number().optional(),
  properties: z.record(z.unknown()).optional(),
});

/**
 * Temporal constraint
 */
const TemporalConstraintSchema = z.object({
  id: z.string(),
  type: TemporalConstraintTypeEnum,
  subject: z.string(),
  object: z.string(),
  confidence: z.number().min(0).max(1),
});

/**
 * Temporal interval
 */
const TemporalIntervalSchema = z.object({
  id: z.string(),
  name: z.string(),
  start: z.number(),
  end: z.number(),
  contains: z.array(z.string()).optional(),
  overlaps: z.array(z.string()).optional(),
});

/**
 * Temporal relation
 */
const TemporalRelationSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  relationType: z.enum(['causes', 'enables', 'prevents', 'precedes', 'follows']),
  strength: z.number().min(0).max(1),
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
