/**
 * Physics Reasoning Mode - Type Definitions
 * Physical modeling with tensor mathematics and field theory
 */

import { BaseThought } from '../core.js';

/**
 * Physics thought types
 */
export type PhysicsThoughtType =
  | 'symmetry_analysis'
  | 'gauge_theory'
  | 'field_equations'
  | 'lagrangian'
  | 'hamiltonian'
  | 'conservation_law'
  | 'dimensional_analysis'
  | 'tensor_formulation'
  | 'differential_geometry';

/**
 * Tensor properties for physics modeling
 */
export interface TensorProperties {
  rank: [number, number]; // [contravariant, covariant] indices
  components: string;
  latex: string;
  symmetries: string[];
  invariants: string[];
  transformation: 'covariant' | 'contravariant' | 'mixed';
  indexStructure?: string;
  coordinateSystem?: string;
}

/**
 * Physical interpretation
 */
export interface PhysicalInterpretation {
  quantity: string;
  units: string;
  conservationLaws: string[];
  constraints?: string[];
  observables?: string[];
}

/**
 * Field theory context
 */
export interface FieldTheoryContext {
  fields: string[];
  interactions: string[];
  symmetryGroup: string;
  gaugeSymmetries?: string[];
}

export interface PhysicsThought extends BaseThought {
  mode: 'physics';
  thoughtType: PhysicsThoughtType;
  tensorProperties?: TensorProperties;
  physicalInterpretation?: PhysicalInterpretation;
  dependencies: string[];
  assumptions: string[];
  uncertainty: number; // 0-1
  fieldTheoryContext?: FieldTheoryContext;
}

export function isPhysicsThought(thought: BaseThought): thought is PhysicsThought {
  return thought.mode === 'physics';
}
