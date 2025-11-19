/**
 * Causal Reasoning Mode - Type Definitions
 * Causal graph modeling, interventions, and counterfactual analysis
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Node in causal graph
 */
export interface CausalNode {
  id: string;
  name: string;
  type: 'cause' | 'effect' | 'mediator' | 'confounder';
  description: string;
}

/**
 * Edge in causal graph (causal relationship)
 */
export interface CausalEdge {
  from: string; // node id
  to: string; // node id
  strength: number; // -1 to 1 (negative = inhibitory)
  confidence: number; // 0-1
  mechanism?: string;
}

/**
 * Causal graph structure
 */
export interface CausalGraph {
  nodes: CausalNode[];
  edges: CausalEdge[];
}

/**
 * Intervention on causal system
 */
export interface Intervention {
  nodeId: string;
  action: string;
  expectedEffects: {
    nodeId: string;
    expectedChange: string;
    confidence: number;
  }[];
}

/**
 * Causal mechanism description
 */
export interface CausalMechanism {
  from: string;
  to: string;
  description: string;
  type: 'direct' | 'indirect' | 'feedback';
}

/**
 * Confounding variable
 */
export interface Confounder {
  nodeId: string;
  affects: string[]; // node ids
  description: string;
}

/**
 * Counterfactual scenario for causal analysis
 */
export interface CounterfactualScenario {
  description: string;
  modifiedNodes: { nodeId: string; newValue: string }[];
  predictedOutcome: string;
}

export interface CausalThought extends BaseThought {
  mode: ThinkingMode.CAUSAL;
  causalGraph: CausalGraph;
  interventions?: Intervention[];
  counterfactuals?: CounterfactualScenario[];
  mechanisms: CausalMechanism[];
  confounders?: Confounder[];
}

export function isCausalThought(thought: BaseThought): thought is CausalThought {
  return thought.mode === 'causal';
}
