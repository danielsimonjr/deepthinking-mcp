/**
 * Visual Exporter Class (v9.1.0)
 * Unified Visual Exporter that delegates to mode-specific exporters
 * Separated to break circular dependency with utils/latex.ts
 * v9.1.0: Added historical mode support
 */

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
  HistoricalThought,
} from '../../types/index.js';
import type { MathematicsThought, ProofDecomposition } from '../../types/modes/mathematics.js';
import type { PhysicsThought } from '../../types/modes/physics.js';
import type { MetaReasoningThought } from '../../types/modes/metareasoning.js';
import type { EngineeringThought } from '../../types/modes/engineering.js';
import type { ComputabilityThought } from '../../types/modes/computability.js';

import type { VisualExportOptions } from './types.js';

import {
  exportCausalGraph,
  exportTemporalTimeline,
  exportHistoricalTimeline,
  exportGameTree,
  exportBayesianNetwork,
  exportSequentialDependencyGraph,
  exportShannonStageFlow,
  exportAbductiveHypotheses,
  exportCounterfactualScenarios,
  exportAnalogicalMapping,
  exportEvidentialBeliefs,
  exportFirstPrinciplesDerivation,
  exportSystemsThinkingCausalLoops,
  exportScientificMethodExperiment,
  exportOptimizationSolution,
  exportFormalLogicProof,
  exportMathematicsDerivation,
  exportPhysicsVisualization,
  exportHybridOrchestration,
  exportMetaReasoningVisualization,
  exportProofDecomposition,
  exportEngineeringAnalysis,
  exportComputability,
} from './modes/index.js';

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

  exportHistoricalTimeline(thought: HistoricalThought, options: VisualExportOptions): string {
    return exportHistoricalTimeline(thought, options);
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

  exportProofDecomposition(decomposition: ProofDecomposition, options: VisualExportOptions): string {
    return exportProofDecomposition(decomposition, options);
  }

  exportEngineeringAnalysis(thought: EngineeringThought, options: VisualExportOptions): string {
    return exportEngineeringAnalysis(thought, options);
  }

  exportComputability(thought: ComputabilityThought, options: VisualExportOptions): string {
    return exportComputability(thought, options);
  }
}
