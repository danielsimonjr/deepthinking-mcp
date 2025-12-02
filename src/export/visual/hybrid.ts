/**
 * Hybrid Visual Exporter (v6.1.0)
 * Phase 7 Sprint 2: Hybrid mode reasoning export to Mermaid, DOT, ASCII
 */

import type { HybridThought } from '../../types/core.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';

/**
 * Export hybrid reasoning to visual format
 */
export function exportHybridOrchestration(thought: HybridThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return hybridToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return hybridToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return hybridToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function hybridToMermaid(
  thought: HybridThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TB\n';

  // Add hybrid mode node (central orchestrator)
  const hybridId = sanitizeId('hybrid_mode');
  mermaid += `  ${hybridId}((\"Hybrid Mode\"))\n`;

  // Add primary mode
  const primaryId = sanitizeId(`primary_${thought.primaryMode}`);
  const primaryLabel = includeLabels ? thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1) : primaryId;
  mermaid += `  ${primaryId}[[\"${primaryLabel}\"]]\n`;
  mermaid += `  ${hybridId} ==> ${primaryId}\n`;

  // Add secondary features
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    const secondaryId = sanitizeId('secondary_features');
    mermaid += `  ${secondaryId}([\"Secondary Features\"])\n`;
    mermaid += `  ${hybridId} --> ${secondaryId}\n`;

    thought.secondaryFeatures.forEach((feature, index) => {
      const featureId = sanitizeId(`feature_${index}`);
      const featureLabel = includeLabels ? feature.slice(0, 30) + (feature.length > 30 ? '...' : '') : `Feature ${index + 1}`;
      mermaid += `  ${featureId}[\"${featureLabel}\"]\n`;
      mermaid += `  ${secondaryId} --> ${featureId}\n`;
    });
  }

  // Add switch reason if present
  if (thought.switchReason) {
    const switchId = sanitizeId('switch_reason');
    const switchLabel = includeLabels
      ? thought.switchReason.slice(0, 40) + (thought.switchReason.length > 40 ? '...' : '')
      : 'Switch Reason';
    mermaid += `  ${switchId}>\"${switchLabel}\"]\n`;
    mermaid += `  ${hybridId} -.-> ${switchId}\n`;
  }

  // Add stage if present (Shannon-style staging)
  if (thought.stage) {
    const stageId = sanitizeId(`stage_${thought.stage}`);
    const stageLabel = thought.stage.replace(/_/g, ' ');
    mermaid += `  ${stageId}{{\"Stage: ${stageLabel}\"}}\n`;
    mermaid += `  ${primaryId} --> ${stageId}\n`;
  }

  // Add mathematical model if present
  if (thought.mathematicalModel) {
    const modelId = sanitizeId('math_model');
    const modelLabel = thought.mathematicalModel.symbolic || 'Mathematical Model';
    mermaid += `  ${modelId}[\"${modelLabel}\"]\n`;
    mermaid += `  ${primaryId} --> ${modelId}\n`;
  }

  // Add tensor properties if present
  if (thought.tensorProperties) {
    const tensorId = sanitizeId('tensor');
    const tensorLabel = `Tensor (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`;
    mermaid += `  ${tensorId}[/\"${tensorLabel}\"/]\n`;
    mermaid += `  ${primaryId} --> ${tensorId}\n`;
  }

  // Add physical interpretation if present
  if (thought.physicalInterpretation) {
    const physId = sanitizeId('physical');
    mermaid += `  ${physId}[/\"${thought.physicalInterpretation.quantity}\"/]\n`;
    mermaid += `  ${primaryId} --> ${physId}\n`;
  }

  // Add uncertainty metric
  if (includeMetrics && thought.uncertainty !== undefined) {
    const uncertId = sanitizeId('uncertainty');
    const uncertLabel = `Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%`;
    mermaid += `  ${uncertId}{{${uncertLabel}}}\n`;
  }

  // Add assumptions
  if (thought.assumptions && thought.assumptions.length > 0) {
    const assumptionsId = sanitizeId('assumptions');
    mermaid += `  ${assumptionsId}>\"Assumptions: ${thought.assumptions.length}\"]\n`;
  }

  // Add dependencies
  if (thought.dependencies && thought.dependencies.length > 0) {
    const depsId = sanitizeId('dependencies');
    mermaid += `  ${depsId}>\"Dependencies: ${thought.dependencies.length}\"]\n`;
  }

  // Color scheme
  if (colorScheme !== 'monochrome') {
    const colors = colorScheme === 'pastel'
      ? { hybrid: '#e8f4e8', primary: '#e3f2fd', secondary: '#fff3e0' }
      : { hybrid: '#90EE90', primary: '#87CEEB', secondary: '#FFD700' };

    mermaid += `\n  style ${hybridId} fill:${colors.hybrid}\n`;
    mermaid += `  style ${primaryId} fill:${colors.primary}\n`;
    if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
      mermaid += `  style ${sanitizeId('secondary_features')} fill:${colors.secondary}\n`;
    }
  }

  return mermaid;
}

function hybridToDOT(
  thought: HybridThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph HybridOrchestration {\n';
  dot += '  rankdir=TB;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  // Hybrid mode node (central)
  const hybridId = sanitizeId('hybrid_mode');
  dot += `  ${hybridId} [label="Hybrid Mode", shape=doubleoctagon];\n`;

  // Primary mode
  const primaryId = sanitizeId(`primary_${thought.primaryMode}`);
  const primaryLabel = thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1);
  dot += `  ${primaryId} [label="${primaryLabel}", shape=box, style="filled,rounded", fillcolor=lightblue];\n`;
  dot += `  ${hybridId} -> ${primaryId} [style=bold, penwidth=2];\n`;

  // Secondary features
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    const secondaryId = sanitizeId('secondary_features');
    dot += `  ${secondaryId} [label="Secondary Features", shape=ellipse];\n`;
    dot += `  ${hybridId} -> ${secondaryId};\n`;

    thought.secondaryFeatures.forEach((feature, index) => {
      const featureId = sanitizeId(`feature_${index}`);
      const featureLabel = includeLabels ? feature.slice(0, 25).replace(/"/g, '\\"') : `Feature ${index + 1}`;
      dot += `  ${featureId} [label="${featureLabel}"];\n`;
      dot += `  ${secondaryId} -> ${featureId};\n`;
    });
  }

  // Switch reason
  if (thought.switchReason) {
    const switchId = sanitizeId('switch_reason');
    const switchLabel = includeLabels
      ? thought.switchReason.slice(0, 30).replace(/"/g, '\\"')
      : 'Switch Reason';
    dot += `  ${switchId} [label="${switchLabel}", shape=note];\n`;
    dot += `  ${hybridId} -> ${switchId} [style=dashed];\n`;
  }

  // Stage
  if (thought.stage) {
    const stageId = sanitizeId(`stage_${thought.stage}`);
    dot += `  ${stageId} [label="${thought.stage.replace(/_/g, ' ')}", shape=diamond];\n`;
    dot += `  ${primaryId} -> ${stageId};\n`;
  }

  // Mathematical model
  if (thought.mathematicalModel) {
    const modelId = sanitizeId('math_model');
    const modelLabel = thought.mathematicalModel.symbolic
      ? thought.mathematicalModel.symbolic.slice(0, 25).replace(/"/g, '\\"')
      : 'Math Model';
    dot += `  ${modelId} [label="${modelLabel}", shape=parallelogram];\n`;
    dot += `  ${primaryId} -> ${modelId};\n`;
  }

  // Tensor properties
  if (thought.tensorProperties) {
    const tensorId = sanitizeId('tensor');
    dot += `  ${tensorId} [label="Tensor (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})", shape=parallelogram];\n`;
    dot += `  ${primaryId} -> ${tensorId};\n`;
  }

  // Physical interpretation
  if (thought.physicalInterpretation) {
    const physId = sanitizeId('physical');
    dot += `  ${physId} [label="${thought.physicalInterpretation.quantity}", shape=parallelogram];\n`;
    dot += `  ${primaryId} -> ${physId};\n`;
  }

  // Uncertainty
  if (includeMetrics && thought.uncertainty !== undefined) {
    const uncertId = sanitizeId('uncertainty');
    dot += `  ${uncertId} [label="${(thought.uncertainty * 100).toFixed(1)}%", shape=diamond];\n`;
  }

  dot += '}\n';
  return dot;
}

function hybridToASCII(thought: HybridThought): string {
  let ascii = 'Hybrid Mode Orchestration:\n';
  ascii += '==========================\n\n';

  // Primary mode
  ascii += `Primary Mode: ${thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1)}\n`;

  // Stage
  if (thought.stage) {
    ascii += `Current Stage: ${thought.stage.replace(/_/g, ' ')}\n`;
  }

  // Uncertainty
  if (thought.uncertainty !== undefined) {
    ascii += `Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%\n`;
  }

  ascii += '\n';

  // Switch reason
  if (thought.switchReason) {
    ascii += `Switch Reason: ${thought.switchReason}\n\n`;
  }

  // Secondary features
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    ascii += 'Secondary Features:\n';
    thought.secondaryFeatures.forEach((feature, index) => {
      ascii += `  ${index + 1}. ${feature}\n`;
    });
    ascii += '\n';
  }

  // Mathematical model
  if (thought.mathematicalModel) {
    ascii += 'Mathematical Model:\n';
    ascii += `  LaTeX: ${thought.mathematicalModel.latex}\n`;
    ascii += `  Symbolic: ${thought.mathematicalModel.symbolic}\n`;
    if (thought.mathematicalModel.ascii) {
      ascii += `  ASCII: ${thought.mathematicalModel.ascii}\n`;
    }
    ascii += '\n';
  }

  // Tensor properties
  if (thought.tensorProperties) {
    ascii += 'Tensor Properties:\n';
    ascii += `  Rank: (${thought.tensorProperties.rank[0]}, ${thought.tensorProperties.rank[1]})\n`;
    ascii += `  Components: ${thought.tensorProperties.components}\n`;
    ascii += `  Transformation: ${thought.tensorProperties.transformation}\n`;
    if (thought.tensorProperties.symmetries.length > 0) {
      ascii += '  Symmetries:\n';
      thought.tensorProperties.symmetries.forEach((sym, index) => {
        ascii += `    ${index + 1}. ${sym}\n`;
      });
    }
    ascii += '\n';
  }

  // Physical interpretation
  if (thought.physicalInterpretation) {
    ascii += 'Physical Interpretation:\n';
    ascii += `  Quantity: ${thought.physicalInterpretation.quantity}\n`;
    ascii += `  Units: ${thought.physicalInterpretation.units}\n`;
    if (thought.physicalInterpretation.conservationLaws.length > 0) {
      ascii += '  Conservation Laws:\n';
      thought.physicalInterpretation.conservationLaws.forEach((law, index) => {
        ascii += `    ${index + 1}. ${law}\n`;
      });
    }
    ascii += '\n';
  }

  // Assumptions
  if (thought.assumptions && thought.assumptions.length > 0) {
    ascii += 'Assumptions:\n';
    thought.assumptions.forEach((assumption, index) => {
      ascii += `  ${index + 1}. ${assumption}\n`;
    });
    ascii += '\n';
  }

  // Dependencies
  if (thought.dependencies && thought.dependencies.length > 0) {
    ascii += 'Dependencies:\n';
    thought.dependencies.forEach((dep, index) => {
      ascii += `  ${index + 1}. ${dep}\n`;
    });
    ascii += '\n';
  }

  // Revision reason
  if (thought.revisionReason) {
    ascii += `Revision Reason: ${thought.revisionReason}\n`;
  }

  return ascii;
}
