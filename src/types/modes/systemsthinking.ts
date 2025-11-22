/**
 * Systems Thinking Mode - Type Definitions
 * Phase 4 (v3.2.0) - Systems analysis with feedback loops, stocks, flows, and leverage points
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Systems Thinking thought extends base thought with system dynamics
 */
export interface SystemsThinkingThought extends BaseThought {
  mode: ThinkingMode.SYSTEMSTHINKING;
  thoughtType:
    | 'system_definition'
    | 'component_analysis'
    | 'feedback_identification'
    | 'leverage_analysis'
    | 'behavior_prediction';

  system?: SystemDefinition;
  components?: SystemComponent[];
  feedbackLoops?: FeedbackLoop[];
  leveragePoints?: LeveragePoint[];
  behaviors?: EmergentBehavior[];
}

/**
 * Overall system definition
 */
export interface SystemDefinition {
  id: string;
  name: string;
  description: string;
  boundary: string; // What's included/excluded
  purpose: string;
  timeHorizon?: string;
}

/**
 * Type of system component
 */
export type ComponentType = 'stock' | 'flow' | 'variable' | 'parameter' | 'delay';

/**
 * System component (stock, flow, variable)
 */
export interface SystemComponent {
  id: string;
  name: string;
  type: ComponentType;
  description: string;
  unit?: string;
  initialValue?: number;
  formula?: string; // LaTeX formula for calculation
  influencedBy?: string[]; // IDs of components that affect this
}

/**
 * Type of feedback loop
 */
export type FeedbackType = 'reinforcing' | 'balancing';

/**
 * Feedback loop in the system
 */
export interface FeedbackLoop {
  id: string;
  name: string;
  type: FeedbackType;
  description: string;
  components: string[]; // Ordered list of component IDs in the loop
  polarity: '+' | '-'; // Overall loop polarity
  strength: number; // 0-1, strength of the feedback
  delay?: number; // Time delay in the loop
  dominance?: 'early' | 'middle' | 'late'; // When this loop dominates behavior
}

/**
 * Connection between components
 */
export interface CausalLink {
  id: string;
  from: string; // Component ID
  to: string; // Component ID
  polarity: '+' | '-'; // Positive or negative influence
  strength: number; // 0-1
  delay?: number; // Time delay
  description?: string;
}

/**
 * Leverage point for intervention
 */
export interface LeveragePoint {
  id: string;
  name: string;
  location: string; // Component or loop ID
  description: string;
  effectiveness: number; // 0-1, higher = more effective
  difficulty: number; // 0-1, higher = more difficult
  type: 'parameter' | 'feedback' | 'structure' | 'goal' | 'paradigm';
  interventionExamples: string[];
}

/**
 * Emergent system behavior
 */
export interface EmergentBehavior {
  id: string;
  name: string;
  description: string;
  pattern: 'growth' | 'decline' | 'oscillation' | 'equilibrium' | 'chaos' | 'overshoot_collapse';
  causes: string[]; // Component/loop IDs causing this behavior
  timeframe: string;
  unintendedConsequences?: string[];
}

/**
 * Stock-flow relationship
 */
export interface StockFlow {
  stockId: string;
  inflowIds: string[]; // Flow IDs that increase the stock
  outflowIds: string[]; // Flow IDs that decrease the stock
  equilibriumCondition?: string; // Condition for steady state
}

/**
 * Time delay in the system
 */
export interface SystemDelay {
  id: string;
  name: string;
  from: string; // Component ID
  to: string; // Component ID
  delayTime: number;
  type: 'information' | 'material' | 'perception';
  impact: string;
}

/**
 * Type guard for Systems Thinking thoughts
 */
export function isSystemsThinkingThought(thought: BaseThought): thought is SystemsThinkingThought {
  return thought.mode === 'systemsthinking';
}
