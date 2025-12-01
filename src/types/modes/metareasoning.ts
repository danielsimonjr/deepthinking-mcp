/**
 * Meta-Reasoning Mode - Type Definitions
 * Reasoning about reasoning itself - monitoring, evaluation, and strategic oversight
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Current reasoning strategy being employed
 */
export interface CurrentStrategy {
  mode: ThinkingMode;
  approach: string;
  startedAt: Date;
  thoughtsSpent: number;
  progressIndicators: string[];
}

/**
 * Evaluation of current strategy effectiveness
 */
export interface StrategyEvaluation {
  effectiveness: number; // 0-1 scale
  efficiency: number; // 0-1 scale
  confidence: number; // 0-1 scale
  progressRate: number; // insights per thought
  qualityScore: number; // overall quality 0-1
  issues: string[]; // problems identified
  strengths: string[]; // what's working well
}

/**
 * Alternative strategy that could be used instead
 */
export interface AlternativeStrategy {
  mode: ThinkingMode;
  reasoning: string;
  expectedBenefit: string;
  switchingCost: number; // 0-1, effort to switch
  recommendationScore: number; // 0-1
}

/**
 * Action recommendation for meta-reasoning
 */
export type MetaAction = 'CONTINUE' | 'SWITCH' | 'REFINE' | 'COMBINE';

/**
 * Strategic recommendation from meta-reasoning
 */
export interface StrategyRecommendation {
  action: MetaAction;
  targetMode?: ThinkingMode;
  justification: string;
  confidence: number;
  expectedImprovement: string;
}

/**
 * Resource allocation assessment
 */
export interface ResourceAllocation {
  timeSpent: number; // milliseconds
  thoughtsRemaining: number; // estimated
  complexityLevel: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  recommendation: string; // how to allocate cognitive effort
}

/**
 * Quality metrics for reasoning session
 */
export interface QualityMetrics {
  logicalConsistency: number; // 0-1
  evidenceQuality: number; // 0-1
  completeness: number; // 0-1
  originality: number; // 0-1
  clarity: number; // 0-1
  overallQuality: number; // 0-1
}

/**
 * Session context for meta-reasoning
 */
export interface SessionContext {
  sessionId: string;
  totalThoughts: number;
  modesUsed: ThinkingMode[];
  modeSwitches: number;
  problemType: string;
  historicalEffectiveness?: number; // from past similar sessions
}

/**
 * Meta-Reasoning thought - reasoning about reasoning itself
 */
export interface MetaReasoningThought extends BaseThought {
  mode: ThinkingMode.METAREASONING;

  // Core meta-reasoning fields
  currentStrategy: CurrentStrategy;
  strategyEvaluation: StrategyEvaluation;
  alternativeStrategies: AlternativeStrategy[];
  recommendation: StrategyRecommendation;

  // Monitoring and assessment fields
  resourceAllocation: ResourceAllocation;
  qualityMetrics: QualityMetrics;
  sessionContext: SessionContext;
}

/**
 * Type guard for MetaReasoningThought
 */
export function isMetaReasoningThought(thought: BaseThought): thought is MetaReasoningThought {
  return thought.mode === 'metareasoning';
}
