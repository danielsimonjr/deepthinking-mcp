/**
 * Engineering Mode Schemas (v7.5.0)
 * Phase 14: Engineering and Algorithmic modes accessible via MCP tools
 */

import { z } from 'zod';
import { BaseThoughtSchema } from '../base.js';

export const EngineeringSchema = BaseThoughtSchema.extend({
  mode: z.enum(['engineering', 'algorithmic']),
});

export type EngineeringInput = z.infer<typeof EngineeringSchema>;
