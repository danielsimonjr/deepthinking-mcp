/**
 * ExampleMode Reasoning - Type Definitions Template
 *
 * INSTRUCTIONS:
 * 1. Copy this file to: src/types/modes/yourmode.ts
 * 2. Replace "ExampleMode" with your mode name (PascalCase)
 * 3. Replace "examplemode" with your mode name (lowercase)
 * 4. Replace "EXAMPLEMODE" with your mode name (UPPERCASE)
 * 5. Define your mode-specific properties
 * 6. Remove this instruction block
 *
 * REFERENCE: See src/types/modes/sequential.ts for a simple example
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * ExampleMode thought extends BaseThought with mode-specific properties
 *
 * TODO: Add description of what this mode does and when to use it
 */
export interface ExampleModeThought extends BaseThought {
  mode: ThinkingMode.EXAMPLEMODE;

  /**
   * Optional thought sub-type for this mode
   *
   * Examples from existing modes:
   * - Sequential: (none, uses generic thoughtType)
   * - Mathematics: 'proof_decomposition' | 'dependency_analysis' | 'consistency_check'
   * - Temporal: 'event_definition' | 'interval_analysis' | 'constraint_check'
   * - Synthesis: 'source_analysis' | 'theme_identification' | 'gap_analysis'
   */
  thoughtType?:
    | 'step_type_1'
    | 'step_type_2'
    | 'step_type_3';

  // ============================================================
  // MODE-SPECIFIC PROPERTIES
  // ============================================================
  //
  // Common patterns:
  //
  // 1. Simple optional fields:
  //    hypothesis?: string;
  //    confidence?: number;  // 0-1 range
  //
  // 2. Arrays of primitive types:
  //    observations?: string[];
  //    tags?: string[];
  //
  // 3. Arrays of complex objects (define interface below):
  //    entities?: ExampleEntity[];
  //    relationships?: ExampleRelationship[];
  //
  // 4. Nested structures:
  //    analysis?: {
  //      findings: string[];
  //      confidence: number;
  //      recommendations?: string[];
  //    };
  //
  // 5. Record types:
  //    metadata?: Record<string, unknown>;
  //
  // REPLACE THIS COMMENT BLOCK WITH YOUR PROPERTIES
}

// ============================================================
// SUPPORTING INTERFACES
// ============================================================
//
// Define complex types used by your mode here.
//
// Example:
//
// export interface ExampleEntity {
//   id: string;
//   name: string;
//   type: string;
//   properties?: Record<string, unknown>;
// }
//
// export interface ExampleRelationship {
//   id: string;
//   from: string;  // Entity ID
//   to: string;    // Entity ID
//   type: string;
//   strength?: number;  // 0-1 range
// }
//
// REPLACE THIS COMMENT BLOCK WITH YOUR INTERFACES

/**
 * Type guard for ExampleMode thoughts
 *
 * @example
 * if (isExampleModeThought(thought)) {
 *   // TypeScript knows thought is ExampleModeThought
 *   console.log(thought.someProperty);
 * }
 */
export function isExampleModeThought(thought: BaseThought): thought is ExampleModeThought {
  return thought.mode === 'examplemode';
}
