/**
 * ExampleMode Reasoning - Type Definitions Template
 *
 * INSTRUCTIONS:
 * 1. Copy this file to: src/types/modes/yourmode.ts
 * 2. Replace all instances of "ExampleMode" with your mode name (PascalCase)
 * 3. Replace all instances of "examplemode" with your mode name (lowercase)
 * 4. Define your mode-specific properties and interfaces
 * 5. Remove this instruction block
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * ExampleMode thought extends base thought with mode-specific properties
 *
 * CUSTOMIZE: Add description of what this mode does and when to use it
 */
export interface ExampleModeThought extends BaseThought {
  mode: ThinkingMode.EXAMPLEMODE;

  /**
   * Optional: Specific thought sub-types for this mode
   * CUSTOMIZE: Define the types of reasoning steps in this mode
   * Examples:
   * - Sequential: 'reasoning_step' | 'conclusion'
   * - Mathematics: 'axiom' | 'lemma' | 'theorem' | 'proof'
   * - Temporal: 'event_definition' | 'interval_analysis' | 'sequence_construction'
   */
  thoughtType?:
    | 'step_type_1'
    | 'step_type_2'
    | 'step_type_3';

  // ============================================================
  // MODE-SPECIFIC PROPERTIES
  // ============================================================
  // CUSTOMIZE: Add your mode's unique properties here
  //
  // Common patterns:
  //
  // 1. Simple fields:
  //    hypothesis?: string;
  //    confidence?: number;  // Use 0-1 range
  //
  // 2. Arrays of complex objects:
  //    entities?: Entity[];
  //    relationships?: Relationship[];
  //
  // 3. Optional nested structures:
  //    analysis?: {
  //      findings: string[];
  //      confidence: number;
  //      recommendations?: string[];
  //    };
  //
  // 4. References to other elements:
  //    dependencies?: string[]; // IDs of related thoughts/entities
  //
  // Examples from existing modes:
  // - Mathematics: mathematicalModel, proofStrategy, dependencies
  // - Temporal: timeline, events, intervals, constraints, relations
  // - GameTheory: players, strategies, payoffMatrix
  // - Bayesian: priorProbability, posteriorProbability, evidence, likelihoodRatio
  //
  // REPLACE THIS COMMENT BLOCK WITH YOUR ACTUAL PROPERTIES
}

// ============================================================
// SUPPORTING INTERFACES
// ============================================================
// CUSTOMIZE: Define any complex types used by your mode
//
// Examples:
//
// export interface Entity {
//   id: string;
//   name: string;
//   type: string;
//   properties?: Record<string, unknown>;
// }
//
// export interface Relationship {
//   id: string;
//   from: string;  // Entity ID
//   to: string;    // Entity ID
//   type: string;
//   strength?: number;  // 0-1 range
// }
//
// REPLACE THIS COMMENT BLOCK WITH YOUR ACTUAL INTERFACES

/**
 * Type guard for ExampleMode thoughts
 *
 * CUSTOMIZE: Replace 'examplemode' with your mode name (lowercase)
 *
 * @example
 * if (isExampleModeThought(thought)) {
 *   // TypeScript now knows thought is ExampleModeThought
 *   console.log(thought.someProperty);
 * }
 */
export function isExampleModeThought(thought: BaseThought): thought is ExampleModeThought {
  return thought.mode === 'examplemode';
}
