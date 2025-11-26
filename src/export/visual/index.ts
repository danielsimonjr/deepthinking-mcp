/**
 * Visual Export Module (v4.3.0)
 * Sprint 8 Task 8.1: Modular visual exporter with lazy loading
 *
 * Exports thinking sessions to visual formats: Mermaid, DOT, ASCII
 * Split from monolithic 2546-line file into mode-specific modules
 */

// Re-export types
export { type VisualFormat, type VisualExportOptions } from './types.js';
export { sanitizeId } from './utils.js';

// Re-export mode-specific functions
export { exportCausalGraph } from './causal.js';
export { exportTemporalTimeline } from './temporal.js';
export { exportGameTree } from './game-theory.js';
export { exportBayesianNetwork } from './bayesian.js';
export { exportSequentialDependencyGraph } from './sequential.js';
export { exportShannonStageFlow } from './shannon.js';
export { exportAbductiveHypotheses } from './abductive.js';
export { exportCounterfactualScenarios } from './counterfactual.js';
export { exportAnalogicalMapping } from './analogical.js';
export { exportEvidentialBeliefs } from './evidential.js';
export { exportFirstPrinciplesDerivation } from './first-principles.js';
export { exportSystemsThinkingCausalLoops } from './systems-thinking.js';
export { exportScientificMethodExperiment } from './scientific-method.js';
export { exportOptimizationSolution } from './optimization.js';
export { exportFormalLogicProof } from './formal-logic.js';

// Import types for unified class
import type {
  CausalThought,
  TemporalThought,
  GameTheoryThought,
  BayesianThought,
  SequentialThought,
  ShannonThought,
  AbductiveThought,
  CounterfactualThought,
  AnalogicalThought,
  EvidentialThought,
  FirstPrinciplesThought,
  SystemsThinkingThought,
  ScientificMethodThought,
  OptimizationThought,
  FormalLogicThought
} from '../../types/index.js';

import type { VisualExportOptions } from './types.js';

// Import exporters
import { exportCausalGraph } from './causal.js';
import { exportTemporalTimeline } from './temporal.js';
import { exportGameTree } from './game-theory.js';
import { exportBayesianNetwork } from './bayesian.js';
import { exportSequentialDependencyGraph } from './sequential.js';
import { exportShannonStageFlow } from './shannon.js';
import { exportAbductiveHypotheses } from './abductive.js';
import { exportCounterfactualScenarios } from './counterfactual.js';
import { exportAnalogicalMapping } from './analogical.js';
import { exportEvidentialBeliefs } from './evidential.js';
import { exportFirstPrinciplesDerivation } from './first-principles.js';
import { exportSystemsThinkingCausalLoops } from './systems-thinking.js';
import { exportScientificMethodExperiment } from './scientific-method.js';
import { exportOptimizationSolution } from './optimization.js';
import { exportFormalLogicProof } from './formal-logic.js';

/**
 * Unified Visual Exporter for backward compatibility
 * Delegates to mode-specific exporters
 */
export class VisualExporter {
  exportCausalGraph(thought: CausalThought, options: VisualExportOptions): string {
    return exportCausalGraph(thought, options);
  }

  exportTemporalTimeline(thought: TemporalThought, options: VisualExportOptions): string {
    return exportTemporalTimeline(thought, options);
  }

  exportGameTree(thought: GameTheoryThought, options: VisualExportOptions): string {
    return exportGameTree(thought, options);
  }

  exportBayesianNetwork(thought: BayesianThought, options: VisualExportOptions): string {
    return exportBayesianNetwork(thought, options);
  }

  exportSequentialDependencyGraph(thought: SequentialThought, options: VisualExportOptions): string {
    return exportSequentialDependencyGraph(thought, options);
  }

  exportShannonStageFlow(thought: ShannonThought, options: VisualExportOptions): string {
    return exportShannonStageFlow(thought, options);
  }

  exportAbductiveHypotheses(thought: AbductiveThought, options: VisualExportOptions): string {
    return exportAbductiveHypotheses(thought, options);
  }

  exportCounterfactualScenarios(thought: CounterfactualThought, options: VisualExportOptions): string {
    return exportCounterfactualScenarios(thought, options);
  }

  exportAnalogicalMapping(thought: AnalogicalThought, options: VisualExportOptions): string {
    return exportAnalogicalMapping(thought, options);
  }

  exportEvidentialBeliefs(thought: EvidentialThought, options: VisualExportOptions): string {
    return exportEvidentialBeliefs(thought, options);
  }

  exportFirstPrinciplesDerivation(thought: FirstPrinciplesThought, options: VisualExportOptions): string {
    return exportFirstPrinciplesDerivation(thought, options);
  }

  exportSystemsThinkingCausalLoops(thought: SystemsThinkingThought, options: VisualExportOptions): string {
    return exportSystemsThinkingCausalLoops(thought, options);
  }

  exportScientificMethodExperiment(thought: ScientificMethodThought, options: VisualExportOptions): string {
    return exportScientificMethodExperiment(thought, options);
  }

  exportOptimizationSolution(thought: OptimizationThought, options: VisualExportOptions): string {
    return exportOptimizationSolution(thought, options);
  }

  exportFormalLogicProof(thought: FormalLogicThought, options: VisualExportOptions): string {
    return exportFormalLogicProof(thought, options);
  }
}
