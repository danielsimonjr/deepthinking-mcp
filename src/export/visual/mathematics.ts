/**
 * Mathematics Visual Exporter (v7.0.2)
 * Phase 7 Sprint 2: Mathematics reasoning export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 */

import type { MathematicsThought } from '../../types/modes/mathematics.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';
import {
  generateSVGHeader,
  generateSVGFooter,
  renderRectNode,
  renderEllipseNode,
  renderStadiumNode,
  renderEdge,
  renderMetricsPanel,
  renderLegend,
  getNodeColor,
  DEFAULT_SVG_OPTIONS,
  type SVGNodePosition,
} from './svg-utils.js';

/**
 * Export mathematics reasoning to visual format
 */
export function exportMathematicsDerivation(thought: MathematicsThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return mathematicsToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return mathematicsToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return mathematicsToASCII(thought);
    case 'svg':
      return mathematicsToSVG(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function mathematicsToMermaid(
  thought: MathematicsThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TB\n';

  // Add thought type node
  const typeId = sanitizeId(`type_${thought.thoughtType || 'proof'}`);
  const typeLabel = includeLabels ? (thought.thoughtType || 'Proof').replace(/_/g, ' ') : typeId;
  mermaid += `  ${typeId}[["${typeLabel}"]]\n`;

  // Add proof strategy if present
  if (thought.proofStrategy) {
    const strategyId = sanitizeId('strategy');
    const strategyLabel = thought.proofStrategy.type;
    mermaid += `  ${strategyId}(["${strategyLabel}"])\n`;
    mermaid += `  ${typeId} --> ${strategyId}\n`;

    // Add proof steps
    let prevStepId = strategyId;
    thought.proofStrategy.steps.forEach((step, index) => {
      const stepId = sanitizeId(`step_${index}`);
      const stepLabel = includeLabels ? step.slice(0, 40) + (step.length > 40 ? '...' : '') : `Step ${index + 1}`;
      mermaid += `  ${stepId}["${stepLabel}"]\n`;
      mermaid += `  ${prevStepId} --> ${stepId}\n`;
      prevStepId = stepId;
    });

    // Add completeness metric
    if (includeMetrics) {
      const completenessId = sanitizeId('completeness');
      const completenessLabel = `Completeness: ${(thought.proofStrategy.completeness * 100).toFixed(0)}%`;
      mermaid += `  ${completenessId}{{${completenessLabel}}}\n`;
      mermaid += `  ${prevStepId} --> ${completenessId}\n`;
    }
  }

  // Add mathematical model if present
  if (thought.mathematicalModel) {
    const modelId = sanitizeId('model');
    const modelLabel = thought.mathematicalModel.symbolic || 'Mathematical Model';
    mermaid += `  ${modelId}["${modelLabel}"]\n`;
    mermaid += `  ${typeId} --> ${modelId}\n`;
  }

  // Add theorems if present
  if (thought.theorems && thought.theorems.length > 0) {
    thought.theorems.forEach((theorem, index) => {
      const theoremId = sanitizeId(`theorem_${index}`);
      const theoremLabel = theorem.name || `Theorem ${index + 1}`;
      mermaid += `  ${theoremId}[/"${theoremLabel}"/]\n`;
      mermaid += `  ${typeId} --> ${theoremId}\n`;
    });
  }

  // Add assumptions as notes
  if (thought.assumptions && thought.assumptions.length > 0) {
    const assumptionsId = sanitizeId('assumptions');
    mermaid += `  ${assumptionsId}>"Assumptions: ${thought.assumptions.length}"]\n`;
  }

  // Color scheme
  if (colorScheme !== 'monochrome') {
    const colors = colorScheme === 'pastel'
      ? { type: '#e8f4e8', strategy: '#fff3e0', step: '#e3f2fd' }
      : { type: '#90EE90', strategy: '#FFD700', step: '#87CEEB' };

    mermaid += `\n  style ${typeId} fill:${colors.type}\n`;
    if (thought.proofStrategy) {
      mermaid += `  style ${sanitizeId('strategy')} fill:${colors.strategy}\n`;
    }
  }

  return mermaid;
}

function mathematicsToDOT(
  thought: MathematicsThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph MathematicsDerivation {\n';
  dot += '  rankdir=TB;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  // Add thought type node
  const typeId = sanitizeId(`type_${thought.thoughtType || 'proof'}`);
  const typeLabel = includeLabels ? (thought.thoughtType || 'Proof').replace(/_/g, ' ') : typeId;
  dot += `  ${typeId} [label="${typeLabel}", shape=doubleoctagon];\n`;

  // Add proof strategy
  if (thought.proofStrategy) {
    const strategyId = sanitizeId('strategy');
    dot += `  ${strategyId} [label="${thought.proofStrategy.type}", shape=ellipse];\n`;
    dot += `  ${typeId} -> ${strategyId};\n`;

    // Add steps
    let prevStepId = strategyId;
    thought.proofStrategy.steps.forEach((step, index) => {
      const stepId = sanitizeId(`step_${index}`);
      const stepLabel = includeLabels ? step.slice(0, 30).replace(/"/g, '\\"') : `Step ${index + 1}`;
      dot += `  ${stepId} [label="${stepLabel}"];\n`;
      dot += `  ${prevStepId} -> ${stepId};\n`;
      prevStepId = stepId;
    });

    if (includeMetrics) {
      const completenessId = sanitizeId('completeness');
      dot += `  ${completenessId} [label="${(thought.proofStrategy.completeness * 100).toFixed(0)}%", shape=diamond];\n`;
      dot += `  ${prevStepId} -> ${completenessId};\n`;
    }
  }

  // Add theorems
  if (thought.theorems) {
    thought.theorems.forEach((theorem, index) => {
      const theoremId = sanitizeId(`theorem_${index}`);
      dot += `  ${theoremId} [label="${theorem.name || `Theorem ${index + 1}`}", shape=parallelogram];\n`;
      dot += `  ${typeId} -> ${theoremId};\n`;
    });
  }

  dot += '}\n';
  return dot;
}

function mathematicsToASCII(thought: MathematicsThought): string {
  let ascii = 'Mathematics Derivation:\n';
  ascii += '=======================\n\n';

  // Thought type
  ascii += `Type: ${(thought.thoughtType || 'proof').replace(/_/g, ' ')}\n`;
  ascii += `Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%\n\n`;

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

  // Proof strategy
  if (thought.proofStrategy) {
    ascii += `Proof Strategy: ${thought.proofStrategy.type}\n`;
    ascii += `Completeness: ${(thought.proofStrategy.completeness * 100).toFixed(0)}%\n`;
    ascii += 'Steps:\n';
    thought.proofStrategy.steps.forEach((step, index) => {
      ascii += `  ${index + 1}. ${step}\n`;
    });
    if (thought.proofStrategy.baseCase) {
      ascii += `Base Case: ${thought.proofStrategy.baseCase}\n`;
    }
    if (thought.proofStrategy.inductiveStep) {
      ascii += `Inductive Step: ${thought.proofStrategy.inductiveStep}\n`;
    }
    ascii += '\n';
  }

  // Theorems
  if (thought.theorems && thought.theorems.length > 0) {
    ascii += 'Theorems:\n';
    thought.theorems.forEach((theorem, index) => {
      ascii += `  [${index + 1}] ${theorem.name}: ${theorem.statement}\n`;
      if (theorem.hypotheses.length > 0) {
        ascii += `      Hypotheses: ${theorem.hypotheses.join(', ')}\n`;
      }
      ascii += `      Conclusion: ${theorem.conclusion}\n`;
    });
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
  }

  return ascii;
}

/**
 * Export mathematics reasoning to native SVG format
 */
function mathematicsToSVG(thought: MathematicsThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
  } = options;

  const positions = new Map<string, SVGNodePosition>();
  const nodeWidth = 150;
  const nodeHeight = 40;
  let currentY = 80;

  // Thought type at the top
  const typeId = 'type';
  positions.set(typeId, {
    id: typeId,
    label: includeLabels ? (thought.thoughtType || 'Proof').replace(/_/g, ' ') : typeId,
    x: svgWidth / 2,
    y: currentY,
    width: nodeWidth,
    height: nodeHeight,
    type: 'type',
  });
  currentY += 120;

  // Proof strategy if present
  if (thought.proofStrategy) {
    positions.set('strategy', {
      id: 'strategy',
      label: thought.proofStrategy.type,
      x: svgWidth / 2,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: 'strategy',
    });
    currentY += 100;

    // Proof steps
    thought.proofStrategy.steps.forEach((step, index) => {
      const stepId = `step_${index}`;
      positions.set(stepId, {
        id: stepId,
        label: includeLabels ? `${index + 1}. ${step.substring(0, 25)}...` : `Step ${index + 1}`,
        x: 150 + (index % 3) * 200,
        y: currentY + Math.floor(index / 3) * 80,
        width: nodeWidth,
        height: nodeHeight,
        type: 'step',
      });
    });
    currentY += Math.ceil(thought.proofStrategy.steps.length / 3) * 80 + 40;
  }

  // Theorems if present
  if (thought.theorems && thought.theorems.length > 0) {
    thought.theorems.forEach((theorem, index) => {
      const theoremId = `theorem_${index}`;
      positions.set(theoremId, {
        id: theoremId,
        label: theorem.name || `Theorem ${index + 1}`,
        x: svgWidth / 2,
        y: currentY,
        width: nodeWidth,
        height: nodeHeight,
        type: 'theorem',
      });
      currentY += 80;
    });
  }

  const actualHeight = Math.max(DEFAULT_SVG_OPTIONS.height, currentY + 100);

  let svg = generateSVGHeader(svgWidth, actualHeight, 'Mathematics Derivation');

  // Render edges
  svg += '\n  <!-- Edges -->\n  <g class="edges">';

  // Edge from type to strategy
  if (thought.proofStrategy) {
    const typePos = positions.get('type');
    const strategyPos = positions.get('strategy');
    if (typePos && strategyPos) {
      svg += renderEdge(typePos, strategyPos);
    }

    // Edges from strategy to steps
    const stratPos = positions.get('strategy');
    thought.proofStrategy.steps.forEach((_, index) => {
      const stepPos = positions.get(`step_${index}`);
      if (stratPos && stepPos) {
        svg += renderEdge(stratPos, stepPos);
      }
    });
  }

  // Edges from type to theorems
  if (thought.theorems) {
    const typePos = positions.get('type');
    thought.theorems.forEach((_, index) => {
      const theoremPos = positions.get(`theorem_${index}`);
      if (typePos && theoremPos) {
        svg += renderEdge(typePos, theoremPos);
      }
    });
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';

  const typeColors = getNodeColor('primary', colorScheme);
  const strategyColors = getNodeColor('secondary', colorScheme);
  const stepColors = getNodeColor('neutral', colorScheme);
  const theoremColors = getNodeColor('tertiary', colorScheme);

  for (const [, pos] of positions) {
    if (pos.type === 'type') {
      svg += renderStadiumNode(pos, typeColors);
    } else if (pos.type === 'strategy') {
      svg += renderEllipseNode(pos, strategyColors);
    } else if (pos.type === 'step') {
      svg += renderRectNode(pos, stepColors);
    } else if (pos.type === 'theorem') {
      svg += renderRectNode(pos, theoremColors);
    }
  }
  svg += '\n  </g>';

  // Render metrics panel
  if (includeMetrics) {
    const metrics = [
      { label: 'Uncertainty', value: `${(thought.uncertainty * 100).toFixed(1)}%` },
      { label: 'Theorems', value: thought.theorems?.length || 0 },
      { label: 'Assumptions', value: thought.assumptions?.length || 0 },
    ];
    svg += renderMetricsPanel(svgWidth - 180, actualHeight - 110, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Type', color: typeColors, shape: 'stadium' as const },
    { label: 'Strategy', color: strategyColors, shape: 'ellipse' as const },
    { label: 'Step', color: stepColors },
    { label: 'Theorem', color: theoremColors },
  ];
  svg += renderLegend(20, actualHeight - 130, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}
