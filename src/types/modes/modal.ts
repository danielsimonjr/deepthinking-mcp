/**
 * Modal Logic Mode - Type Definitions
 * Phase 10 Sprint 3 (v8.4.0) - Possible worlds semantics, necessity, possibility
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Modal thought extends base thought with possible worlds structures
 */
export interface ModalThought extends BaseThought {
  mode: ThinkingMode.MODAL;
  thoughtType:
    | 'world_definition'
    | 'proposition_analysis'
    | 'accessibility_relation'
    | 'accessibility_analysis'
    | 'necessity_check'
    | 'necessity_proof'
    | 'possibility_check'
    | 'possibility_proof'
    | 'kripke_frame_construction'
    | 'modal_inference'
    | 'countermodel';

  /** Modal logic system being used */
  logicSystem?: ModalLogicSystem;

  /** Modal logic type (alternative naming) */
  modalLogicType?: ModalLogicType;

  /** Modal domain (alethic, epistemic, deontic, temporal) */
  modalDomain: ModalDomain;

  /** Possible worlds in the model */
  possibleWorlds?: PossibleWorld[];
  worlds?: PossibleWorld[];

  /** Currently designated actual world */
  actualWorld?: string;

  /** Accessibility relations between worlds */
  accessibilityRelations?: AccessibilityRelation[];

  /** Modal propositions being evaluated */
  propositions?: ModalProposition[];

  /** Kripke frame if constructed */
  kripkeFrame?: KripkeFrame;

  /** Modal inferences */
  inferences?: ModalInference[];
}

/**
 * Modal inference
 */
export interface ModalInference {
  id: string;
  premises?: string[];
  premise?: string;
  operator?: ModalOperator;
  conclusion: string;
  rule?: string;
  valid: boolean;
  justification: string;
}

/**
 * Modal logic systems
 */
export type ModalLogicSystem = 'K' | 'T' | 'S4' | 'S5' | 'D' | 'B';

/**
 * Extended modal logic types (includes custom)
 */
export type ModalLogicType = 'K' | 'T' | 'S4' | 'S5' | 'D' | 'B' | 'custom';

/**
 * Modal domains
 */
export type ModalDomain = 'alethic' | 'epistemic' | 'deontic' | 'temporal';

/**
 * A possible world in the Kripke model
 */
export interface PossibleWorld {
  id: string;
  name: string;
  description: string;
  truths?: string[];
  propositions?: Record<string, boolean>;
  isActual: boolean;
  accessibility?: string[];
}

/**
 * Accessibility relation between worlds
 */
export interface AccessibilityRelation {
  id?: string;
  from?: string;
  fromWorld?: string;
  to?: string;
  toWorld?: string;
  type: 'reflexive' | 'symmetric' | 'transitive' | 'euclidean' | 'serial';
  modalType?: ModalDomain;
}

/**
 * A modal proposition
 */
export interface ModalProposition {
  id: string;
  content: string;
  operator: ModalOperator;
  evaluatedIn?: string;
  truthValue?: boolean;
  justification?: string;
  worldsTrue?: string[];
  worldsFalse?: string[];
}

/**
 * Modal operators
 */
export type ModalOperator =
  | 'necessary'     // Box: necessarily true
  | 'possible'      // Diamond: possibly true
  | 'contingent'    // Could be either
  | 'impossible'    // Cannot be true
  | 'known'         // Epistemic: known to be true
  | 'believed'      // Doxastic: believed to be true
  | 'obligatory'    // Deontic: ought to be true
  | 'permitted'     // Deontic: allowed to be true
  | 'always'        // Temporal: true at all times
  | 'eventually';   // Temporal: true at some time

/**
 * A Kripke frame (W, R)
 */
export interface KripkeFrame {
  id: string;
  worlds: string[];
  relations: AccessibilityRelation[];
  properties: KripkeProperty[];
  isValid: boolean;
}

/**
 * Properties of a Kripke frame
 */
export type KripkeProperty =
  | 'reflexive'
  | 'symmetric'
  | 'transitive'
  | 'euclidean'
  | 'serial'
  | 'convergent';

/**
 * Type guard for Modal thoughts
 */
export function isModalThought(thought: BaseThought): thought is ModalThought {
  return thought.mode === ThinkingMode.MODAL;
}
