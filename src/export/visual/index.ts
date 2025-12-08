/**
 * Visual Export Module (v7.1.0)
 * Sprint 8 Task 8.1: Modular visual exporter with lazy loading
 *
 * Exports thinking sessions to visual formats: Mermaid, DOT, ASCII, SVG, GraphML, TikZ, Modelica, HTML, UML, JSON
 * Split from monolithic 2546-line file into mode-specific modules
 */

// Re-export types
export { type VisualFormat, type VisualExportOptions } from './types.js';
export { sanitizeId } from './utils.js';

// Re-export Mermaid utilities for all exporters
export * from './mermaid-utils.js';

// Re-export DOT/GraphViz utilities for all exporters
export * from './dot-utils.js';

// Re-export ASCII utilities for all exporters
export * from './ascii-utils.js';

// Re-export SVG utilities for all exporters
export * from './svg-utils.js';

// Re-export GraphML utilities for all exporters
export * from './graphml-utils.js';

// Re-export TikZ utilities for all exporters
export * from './tikz-utils.js';

// Re-export HTML utilities for all exporters
export * from './html-utils.js';

// Re-export Modelica utilities for all exporters
export * from './modelica-utils.js';

// Re-export UML utilities for all exporters
export * from './uml-utils.js';

// Re-export JSON visual utilities for all exporters
export * from './json-utils.js';

// Re-export Markdown utilities for all exporters
export * from './markdown-utils.js';

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

// Sprint 2: New visual exporters
export { exportMathematicsDerivation } from './mathematics.js';
export { exportPhysicsVisualization } from './physics.js';
export { exportHybridOrchestration } from './hybrid.js';
export { exportMetaReasoningVisualization } from './metareasoning.js';

// Phase 8: Proof decomposition visual export
export { exportProofDecomposition } from './proof-decomposition.js';

// Phase 10: Engineering visual export
export { exportEngineeringAnalysis } from './engineering.js';

// Phase 11: Computability visual export (Turing's legacy)
export { exportComputability } from './computability.js';

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
  FormalLogicThought,
  HybridThought,
} from '../../types/index.js';
import type { MathematicsThought, ProofDecomposition } from '../../types/modes/mathematics.js';
import type { PhysicsThought } from '../../types/modes/physics.js';
import type { MetaReasoningThought } from '../../types/modes/metareasoning.js';
import type { EngineeringThought } from '../../types/modes/engineering.js';
import type { ComputabilityThought } from '../../types/modes/computability.js';

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

// Sprint 2: Import new exporters
import { exportMathematicsDerivation } from './mathematics.js';
import { exportPhysicsVisualization } from './physics.js';
import { exportHybridOrchestration } from './hybrid.js';
import { exportMetaReasoningVisualization } from './metareasoning.js';

// Phase 8: Import proof decomposition exporter
import { exportProofDecomposition } from './proof-decomposition.js';

// Phase 10: Import engineering exporter
import { exportEngineeringAnalysis } from './engineering.js';

// Phase 11: Import computability exporter (Turing's legacy)
import { exportComputability } from './computability.js';

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

  // Sprint 2: New visual export wrapper methods

  exportMathematicsDerivation(thought: MathematicsThought, options: VisualExportOptions): string {
    return exportMathematicsDerivation(thought, options);
  }

  exportPhysicsVisualization(thought: PhysicsThought, options: VisualExportOptions): string {
    return exportPhysicsVisualization(thought, options);
  }

  exportHybridOrchestration(thought: HybridThought, options: VisualExportOptions): string {
    return exportHybridOrchestration(thought, options);
  }

  exportMetaReasoningVisualization(thought: MetaReasoningThought, options: VisualExportOptions): string {
    return exportMetaReasoningVisualization(thought, options);
  }

  // Phase 8: Proof decomposition visual export

  exportProofDecomposition(decomposition: ProofDecomposition, options: VisualExportOptions): string {
    return exportProofDecomposition(decomposition, options);
  }

  // Phase 10: Engineering visual export

  exportEngineeringAnalysis(thought: EngineeringThought, options: VisualExportOptions): string {
    return exportEngineeringAnalysis(thought, options);
  }

  // Phase 11: Computability visual export (Turing's legacy)

  exportComputability(thought: ComputabilityThought, options: VisualExportOptions): string {
    return exportComputability(thought, options);
  }
}
