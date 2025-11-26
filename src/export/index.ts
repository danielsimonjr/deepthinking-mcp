/**
 * Export module index (v4.3.0)
 * Re-exports all exporters
 * Sprint 8 Task 8.1: Use modular visual exporter
 * Sprint 9.2: Explicit exports for tree-shaking
 */

// Visual exports
export {
  type VisualFormat,
  type VisualExportOptions,
  sanitizeId,
  VisualExporter,
  exportCausalGraph,
  exportTemporalTimeline,
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
} from './visual/index.js';

// LaTeX exports
export { LaTeXExporter, type LaTeXExportOptions } from './latex.js';
