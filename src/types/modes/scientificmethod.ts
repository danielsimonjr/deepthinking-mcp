/**
 * Scientific Method Mode - Type Definitions
 * Phase 4 (v3.2.0) - Hypothesis-driven experimentation and analysis
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Scientific Method thought extends base thought with experimental design
 */
export interface ScientificMethodThought extends BaseThought {
  mode: ThinkingMode.SCIENTIFICMETHOD;
  thoughtType:
    | 'question_formulation'
    | 'hypothesis_generation'
    | 'experiment_design'
    | 'data_collection'
    | 'analysis'
    | 'conclusion';

  researchQuestion?: ResearchQuestion;
  scientificHypotheses?: Hypothesis[];
  experiment?: ExperimentDesign;
  data?: DataCollection;
  analysis?: StatisticalAnalysis;
  conclusion?: ScientificConclusion;
}

/**
 * Research question being investigated
 */
export interface ResearchQuestion {
  id: string;
  question: string;
  background: string;
  rationale: string;
  significance: string;
  variables: {
    independent: string[];
    dependent: string[];
    control: string[];
  };
}

/**
 * Hypothesis for testing
 */
export interface Hypothesis {
  id: string;
  type: 'null' | 'alternative' | 'directional' | 'non_directional';
  statement: string;
  prediction: string;
  rationale: string;
  testable: boolean;
  falsifiable: boolean;
  latex?: string; // Statistical notation
}

/**
 * Experimental design
 */
export interface ExperimentDesign {
  id: string;
  type: 'experimental' | 'quasi_experimental' | 'observational' | 'correlational';
  design: string; // e.g., "randomized controlled trial", "within-subjects"
  independentVariables: Variable[];
  dependentVariables: Variable[];
  controlVariables: Variable[];
  sampleSize: number;
  sampleSizeJustification?: string;
  randomization: boolean;
  blinding?: 'none' | 'single' | 'double' | 'triple';
  controls: string[];
  procedure: string[];
  materials?: string[];
  duration?: string;
  ethicalConsiderations?: string[];
}

/**
 * Variable in the experiment
 */
export interface Variable {
  id: string;
  name: string;
  type: 'independent' | 'dependent' | 'control' | 'confounding';
  description: string;
  measurementScale: 'nominal' | 'ordinal' | 'interval' | 'ratio';
  unit?: string;
  operationalDefinition: string;
  range?: [number, number];
  levels?: string[] | number[];
}

/**
 * Data collection details
 */
export interface DataCollection {
  id: string;
  method: string[];
  instruments: string[];
  observations: Observation[];
  measurements: Measurement[];
  sampleCharacteristics?: Record<string, any>;
  dataQuality: {
    completeness: number; // 0-1
    reliability: number; // 0-1
    validity: number; // 0-1
  };
  limitations?: string[];
}

/**
 * Individual observation
 */
export interface Observation {
  id: string;
  timestamp?: string;
  condition: string;
  values: Record<string, any>;
  notes?: string;
}

/**
 * Measurement data
 */
export interface Measurement {
  variableId: string;
  values: number[];
  descriptiveStats?: {
    mean?: number;
    median?: number;
    mode?: number;
    stdDev?: number;
    variance?: number;
    min?: number;
    max?: number;
    n: number;
  };
}

/**
 * Statistical analysis results
 */
export interface StatisticalAnalysis {
  id: string;
  tests: StatisticalTest[];
  summary: string;
  assumptions: {
    assumption: string;
    met: boolean;
    evidence: string;
  }[];
  effectSize?: {
    type: string; // e.g., "Cohen's d", "r", "eta-squared"
    value: number;
    interpretation: string;
  };
  powerAnalysis?: {
    power: number; // 0-1
    alpha: number; // significance level
    interpretation: string;
  };
}

/**
 * Individual statistical test
 */
export interface StatisticalTest {
  id: string;
  name: string; // e.g., "t-test", "ANOVA", "chi-square"
  hypothesisTested: string; // Hypothesis ID
  testStatistic: number;
  pValue: number;
  confidenceInterval?: [number, number];
  alpha: number; // significance level, typically 0.05
  result: 'reject_null' | 'fail_to_reject_null';
  interpretation: string;
  latex?: string; // Statistical formula
}

/**
 * Scientific conclusion
 */
export interface ScientificConclusion {
  id: string;
  statement: string;
  supportedHypotheses: string[]; // Hypothesis IDs
  rejectedHypotheses: string[]; // Hypothesis IDs
  confidence: number; // 0-1
  limitations: string[];
  alternativeExplanations?: string[];
  futureDirections: string[];
  replicationConsiderations: string[];
  practicalImplications?: string[];
  theoreticalImplications?: string[];
}

/**
 * Type guard for Scientific Method thoughts
 */
export function isScientificMethodThought(thought: BaseThought): thought is ScientificMethodThought {
  return thought.mode === 'scientificmethod';
}
