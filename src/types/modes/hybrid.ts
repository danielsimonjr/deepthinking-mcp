/**
 * Hybrid Reasoning Mode - Type Definitions
 * Combines multiple reasoning modes with dynamic switching
 */

import { BaseThought, ThinkingMode, ShannonStage, ExtendedThoughtType } from '../core.js';

/**
 * Mathematical model representation (used in hybrid mode)
 */
export interface MathematicalModel {
  latex: string;
  symbolic: string;
  ascii?: string;
  tensorRank?: number;
  dimensions?: number[];
  invariants?: string[];
  symmetries?: string[];
  complexity?: string;
  stabilityNotes?: string;
  validated?: boolean;
  validationMethod?: string;
}

/**
 * Tensor properties for physics modeling (used in hybrid mode)
 */
export interface TensorProperties {
  rank: [number, number];
  components: string;
  latex: string;
  symmetries: string[];
  invariants: string[];
  transformation: 'covariant' | 'contravariant' | 'mixed';
  indexStructure?: string;
  coordinateSystem?: string;
}

/**
 * Physical interpretation (used in hybrid mode)
 */
export interface PhysicalInterpretation {
  quantity: string;
  units: string;
  conservationLaws: string[];
  constraints?: string[];
  observables?: string[];
}

/**
 * Hybrid-mode thought
 * Combines features from multiple reasoning modes
 */
export interface HybridThought extends BaseThought {
  mode: ThinkingMode.HYBRID;
  thoughtType?: ExtendedThoughtType;
  stage?: ShannonStage;
  uncertainty?: number;
  dependencies?: string[];
  assumptions?: string[];
  revisionReason?: string;
  mathematicalModel?: MathematicalModel;
  tensorProperties?: TensorProperties;
  physicalInterpretation?: PhysicalInterpretation;
  primaryMode: 'sequential' | 'shannon' | 'mathematics' | 'physics';
  secondaryFeatures: string[];
  switchReason?: string;
}

export function isHybridThought(thought: BaseThought): thought is HybridThought {
  return thought.mode === 'hybrid';
}
