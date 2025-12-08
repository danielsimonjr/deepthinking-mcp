/**
 * Academic Mode Schemas (v7.5.0)
 * Phase 14: Academic research modes accessible via MCP tools
 * Designed for PhD students and scientific paper writing
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';

export const AcademicSchema = BaseThoughtSchema.extend({
  mode: z.enum(['synthesis', 'argumentation', 'critique', 'analysis']),
});

export type AcademicInput = z.infer<typeof AcademicSchema>;
