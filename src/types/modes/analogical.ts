/**
 * Analogical Reasoning Mode - Type Definitions
 * Cross-domain analogies, mapping, and knowledge transfer
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Entity in a domain
 */
export interface Entity {
  id: string;
  name: string;
  type: string;
  description: string;
}

/**
 * Relation between entities
 */
export interface Relation {
  id: string;
  type: string;
  from: string; // entity id
  to: string; // entity id
  description: string;
}

/**
 * Property of an entity
 */
export interface Property {
  entityId: string;
  name: string;
  value: string;
}

/**
 * Domain (source or target)
 */
export interface Domain {
  id: string;
  name: string;
  description: string;
  entities: Entity[];
  relations: Relation[];
  properties: Property[];
}

/**
 * Mapping between source and target domains
 */
export interface Mapping {
  sourceEntityId: string;
  targetEntityId: string;
  justification: string;
  confidence: number; // 0-1
}

/**
 * Insight from analogy
 */
export interface Insight {
  description: string;
  sourceEvidence: string;
  targetApplication: string;
  novelty: number; // 0-1
}

/**
 * Inference based on analogy
 */
export interface Inference {
  sourcePattern: string;
  targetPrediction: string;
  confidence: number; // 0-1
  needsVerification: boolean;
}

export interface AnalogicalThought extends BaseThought {
  mode: ThinkingMode.ANALOGICAL;
  sourceDomain: Domain;
  targetDomain: Domain;
  mapping: Mapping[];
  insights: Insight[];
  inferences: Inference[];
  limitations: string[];
  analogyStrength: number; // 0-1
}

export function isAnalogicalThought(thought: BaseThought): thought is AnalogicalThought {
  return thought.mode === 'analogical';
}
