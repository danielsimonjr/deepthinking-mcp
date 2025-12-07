/**
 * Shannon Visual Exporter (v7.0.2)
 * Sprint 8 Task 8.1: Shannon stage flow export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 */

import type { ShannonThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';
import {
  generateSVGHeader,
  generateSVGFooter,
  renderRectNode,
  renderStadiumNode,
  renderHorizontalEdge,
  renderMetricsPanel,
  renderLegend,
  getNodeColor,
  layoutNodesHorizontally,
  DEFAULT_SVG_OPTIONS,
} from './svg-utils.js';

/**
 * Export Shannon stage flow diagram to visual format
 */
export function exportShannonStageFlow(thought: ShannonThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return shannonToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return shannonToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return shannonToASCII(thought);
    case 'svg':
      return shannonToSVG(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

const stages = [
  'problem_definition',
  'constraints',
  'model',
  'proof',
  'implementation'
];

const stageLabels: Record<string, string> = {
  problem_definition: 'Problem Definition',
  constraints: 'Constraints',
  model: 'Model',
  proof: 'Proof',
  implementation: 'Implementation'
};

function shannonToMermaid(
  thought: ShannonThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph LR\n';

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const stageId = sanitizeId(stage);
    const label = includeLabels ? stageLabels[stage] : stageId;

    mermaid += `  ${stageId}["${label}"]\n`;

    if (i < stages.length - 1) {
      const nextStageId = sanitizeId(stages[i + 1]);
      mermaid += `  ${stageId} --> ${nextStageId}\n`;
    }
  }

  if (colorScheme !== 'monochrome') {
    mermaid += '\n';
    const currentStageId = sanitizeId(thought.stage);
    const color = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
    mermaid += `  style ${currentStageId} fill:${color},stroke:#333,stroke-width:3px\n`;
  }

  if (includeMetrics && thought.uncertainty !== undefined) {
    mermaid += `\n  uncertainty["Uncertainty: ${thought.uncertainty.toFixed(2)}"]\n`;
    mermaid += `  uncertainty -.-> ${sanitizeId(thought.stage)}\n`;
  }

  return mermaid;
}

function shannonToDOT(
  thought: ShannonThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph ShannonStageFlow {\n';
  dot += '  rankdir=LR;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const stageId = sanitizeId(stage);
    const label = includeLabels ? stageLabels[stage] : stageId;

    const isCurrent = stage === thought.stage;
    const style = isCurrent ? ', style=filled, fillcolor=lightblue' : '';

    dot += `  ${stageId} [label="${label}"${style}];\n`;

    if (i < stages.length - 1) {
      const nextStageId = sanitizeId(stages[i + 1]);
      dot += `  ${stageId} -> ${nextStageId};\n`;
    }
  }

  if (includeMetrics && thought.uncertainty !== undefined) {
    dot += `\n  uncertainty [label="Uncertainty: ${thought.uncertainty.toFixed(2)}", shape=ellipse];\n`;
    dot += `  uncertainty -> ${sanitizeId(thought.stage)} [style=dashed];\n`;
  }

  dot += '}\n';
  return dot;
}

function shannonToASCII(thought: ShannonThought): string {
  let ascii = 'Shannon Stage Flow:\n';
  ascii += '===================\n\n';

  ascii += 'Flow: ';
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const isCurrent = stage === thought.stage;

    if (isCurrent) {
      ascii += `[${stageLabels[stage]}]`;
    } else {
      ascii += stageLabels[stage];
    }

    if (i < stages.length - 1) {
      ascii += ' → ';
    }
  }

  ascii += '\n\n';
  ascii += `Current Stage: ${stageLabels[thought.stage]}\n`;
  ascii += `Uncertainty: ${thought.uncertainty.toFixed(2)}\n`;

  if (thought.dependencies && thought.dependencies.length > 0) {
    ascii += '\nDependencies:\n';
    for (const dep of thought.dependencies) {
      ascii += `  • ${dep}\n`;
    }
  }

  if (thought.assumptions && thought.assumptions.length > 0) {
    ascii += '\nAssumptions:\n';
    for (const assumption of thought.assumptions) {
      ascii += `  • ${assumption}\n`;
    }
  }

  return ascii;
}

/**
 * Export Shannon stage flow to native SVG format
 */
function shannonToSVG(thought: ShannonThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = 300,
  } = options;

  // Create nodes from stages
  const nodes = stages.map(stage => ({
    id: sanitizeId(stage),
    label: includeLabels ? stageLabels[stage] : sanitizeId(stage),
    type: stage === thought.stage ? 'current' : 'stage',
  }));

  const positions = layoutNodesHorizontally(nodes, {
    width: svgWidth,
    height: svgHeight,
    nodeWidth: 130,
    nodeHeight: 45,
    nodeSpacing: 25,
  });

  let svg = generateSVGHeader(svgWidth, svgHeight, 'Shannon Stage Flow');

  // Render edges between consecutive stages
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  for (let i = 0; i < stages.length - 1; i++) {
    const fromPos = positions.get(sanitizeId(stages[i]));
    const toPos = positions.get(sanitizeId(stages[i + 1]));
    if (fromPos && toPos) {
      svg += renderHorizontalEdge(fromPos, toPos, {});
    }
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const pos = positions.get(sanitizeId(stage));
    if (pos) {
      const isCurrent = stage === thought.stage;
      const colors = isCurrent
        ? getNodeColor('primary', colorScheme)
        : getNodeColor('neutral', colorScheme);

      if (isCurrent) {
        svg += renderStadiumNode(pos, colors);
      } else {
        svg += renderRectNode(pos, colors);
      }
    }
  }
  svg += '\n  </g>';

  // Render metrics
  if (includeMetrics && thought.uncertainty !== undefined) {
    const metrics = [
      { label: 'Stage', value: stageLabels[thought.stage] },
      { label: 'Uncertainty', value: thought.uncertainty.toFixed(2) },
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 80, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Current', color: getNodeColor('primary', colorScheme) },
    { label: 'Stage', color: getNodeColor('neutral', colorScheme) },
  ];
  svg += renderLegend(20, svgHeight - 60, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}
