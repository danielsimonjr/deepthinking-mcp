/**
 * Schema Index (v4.3.0)
 * Sprint 5 Task 5.3: Central export for all schemas
 * Sprint 9.2: Explicit exports for tree-shaking
 */

// Base schemas
export { BaseThoughtSchema, SessionActionSchema, type BaseThoughtInput, type SessionActionInput } from './base.js';

// Mode-specific schemas - explicit exports
export { CoreSchema, type CoreInput } from './modes/core.js';
export { MathSchema, type MathInput } from './modes/mathematics.js';
export { TemporalSchema, type TemporalInput } from './modes/temporal.js';
export { ProbabilisticSchema, type ProbabilisticInput } from './modes/probabilistic.js';
export { CausalSchema, type CausalInput } from './modes/causal.js';
export { StrategicSchema, type StrategicInput } from './modes/strategic.js';
export { AnalyticalSchema, type AnalyticalInput } from './modes/analytical.js';
export { ScientificSchema, type ScientificInput } from './modes/scientific.js';
