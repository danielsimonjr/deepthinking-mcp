/**
 * Export module index (v4.4.0)
 * Re-exports all exporters
 * Sprint 8 Task 8.1: Use modular visual exporter
 * Sprint 9.2: Explicit exports for tree-shaking
 * Phase 12 Sprint 4: Export profiles and file exporter
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
  // Phase 8: Proof decomposition
  exportProofDecomposition,
} from './visual/index.js';

// LaTeX exports
export { LaTeXExporter, type LaTeXExportOptions } from './visual/utils/latex.js';

// Phase 12 Sprint 4: Export profiles
export {
  type ExportFormatType,
  type ProfileExportOptions,
  type ExportProfile,
  type ExportProfileId,
  type ExportProfileMetadata,
  EXPORT_PROFILES,
  getExportProfile,
  getAllExportProfiles,
  getExportProfilesByTag,
  getExportProfilesByFormat,
  isValidExportProfileId,
  listExportProfileIds,
  getExportProfileMetadata,
  combineExportProfiles,
  recommendExportProfile,
} from './profiles.js';

// Phase 12 Sprint 4: File exporter
export {
  type FileExportConfig,
  type FileExportResult,
  type BatchExportResult,
  type ExportProgress,
  type ExportProgressCallback,
  FileExporter,
  createFileExporter,
} from './file-exporter.js';
