/**
 * Abductive Visual Exporter (v7.0.2)
 * Sprint 8 Task 8.1: Abductive hypothesis export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 */

import type { AbductiveThought } from '../../types/index.js';
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
 * Export abductive hypothesis comparison to visual format
 */
export function exportAbductiveHypotheses(thought: AbductiveThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return abductiveToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return abductiveToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return abductiveToASCII(thought);
    case 'svg':
      return abductiveToSVG(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function abductiveToMermaid(
  thought: AbductiveThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TD\n';

  mermaid += '  Observations["Observations"]\n';

  for (const hypothesis of thought.hypotheses) {
    const hypId = sanitizeId(hypothesis.id);
    const label = includeLabels ? hypothesis.explanation.substring(0, 50) + '...' : hypId;
    const scoreLabel = includeMetrics ? ` (${hypothesis.score.toFixed(2)})` : '';

    mermaid += `  ${hypId}["${label}${scoreLabel}"]\n`;
    mermaid += `  Observations --> ${hypId}\n`;
  }

  if (thought.bestExplanation && colorScheme !== 'monochrome') {
    mermaid += '\n';
    const bestId = sanitizeId(thought.bestExplanation.id);
    const color = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
    mermaid += `  style ${bestId} fill:${color},stroke:#333,stroke-width:3px\n`;
  }

  return mermaid;
}

function abductiveToDOT(
  thought: AbductiveThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph AbductiveHypotheses {\n';
  dot += '  rankdir=TD;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  dot += '  Observations [label="Observations", shape=ellipse];\n\n';

  for (const hypothesis of thought.hypotheses) {
    const hypId = sanitizeId(hypothesis.id);
    const label = includeLabels ? hypothesis.explanation.substring(0, 50) + '...' : hypId;
    const scoreLabel = includeMetrics ? ` (${hypothesis.score.toFixed(2)})` : '';

    const isBest = thought.bestExplanation?.id === hypothesis.id;
    const style = isBest ? ', style=filled, fillcolor=lightblue' : '';

    dot += `  ${hypId} [label="${label}${scoreLabel}"${style}];\n`;
    dot += `  Observations -> ${hypId};\n`;
  }

  dot += '}\n';
  return dot;
}

function abductiveToASCII(thought: AbductiveThought): string {
  let ascii = 'Abductive Hypothesis Comparison:\n';
  ascii += '================================\n\n';

  ascii += 'Observations:\n';
  for (const obs of thought.observations) {
    ascii += `  • ${obs.description} (confidence: ${obs.confidence.toFixed(2)})\n`;
  }

  ascii += '\nHypotheses:\n';
  for (const hypothesis of thought.hypotheses) {
    const isBest = thought.bestExplanation?.id === hypothesis.id;
    const marker = isBest ? '★' : '•';

    ascii += `  ${marker} ${hypothesis.explanation}\n`;
    ascii += `    Score: ${hypothesis.score.toFixed(2)}\n`;
    ascii += `    Assumptions: ${hypothesis.assumptions.join(', ')}\n`;
    ascii += '\n';
  }

  if (thought.bestExplanation) {
    ascii += `Best Explanation: ${thought.bestExplanation.explanation}\n`;
  }

  return ascii;
}

/**
 * Export abductive hypotheses to native SVG format
 */
function abductiveToSVG(thought: AbductiveThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = 450,
  } = options;

  const positions = new Map<string, SVGNodePosition>();
  const nodeWidth = 180;
  const nodeHeight = 50;
  const centerX = svgWidth / 2;

  // Observations node at top
  positions.set('observations', {
    id: 'observations',
    x: centerX - nodeWidth / 2,
    y: 60,
    width: nodeWidth,
    height: nodeHeight,
    label: 'Observations',
    type: 'observations',
  });

  // Hypothesis nodes below
  const hypCount = thought.hypotheses.length;
  const layerWidth = hypCount * (nodeWidth + 20) - 20;
  let startX = (svgWidth - layerWidth) / 2;

  for (const hypothesis of thought.hypotheses) {
    const hypId = sanitizeId(hypothesis.id);
    const label = includeLabels
      ? hypothesis.explanation.substring(0, 30) + '...'
      : hypId;
    const scoreLabel = includeMetrics ? ` (${hypothesis.score.toFixed(2)})` : '';

    positions.set(hypothesis.id, {
      id: hypothesis.id,
      x: startX,
      y: 180,
      width: nodeWidth,
      height: nodeHeight,
      label: label + scoreLabel,
      type: thought.bestExplanation?.id === hypothesis.id ? 'best' : 'hypothesis',
    });
    startX += nodeWidth + 20;
  }

  let svg = generateSVGHeader(svgWidth, svgHeight, 'Abductive Hypotheses');

  // Render edges from observations to hypotheses
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  const obsPos = positions.get('observations');
  for (const hypothesis of thought.hypotheses) {
    const hypPos = positions.get(hypothesis.id);
    if (obsPos && hypPos) {
      svg += renderEdge(obsPos, hypPos, {});
    }
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';

  // Observations
  svg += renderEllipseNode(positions.get('observations')!, getNodeColor('info', colorScheme));

  // Hypotheses
  for (const hypothesis of thought.hypotheses) {
    const pos = positions.get(hypothesis.id)!;
    const isBest = thought.bestExplanation?.id === hypothesis.id;
    const colors = isBest
      ? getNodeColor('success', colorScheme)
      : getNodeColor('neutral', colorScheme);

    if (isBest) {
      svg += renderStadiumNode(pos, colors);
    } else {
      svg += renderRectNode(pos, colors);
    }
  }
  svg += '\n  </g>';

  // Render metrics
  if (includeMetrics) {
    const metrics = [
      { label: 'Hypotheses', value: thought.hypotheses.length },
      { label: 'Observations', value: thought.observations.length },
      { label: 'Best Score', value: thought.bestExplanation?.score.toFixed(2) || 'N/A' },
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 100, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Observations', color: getNodeColor('info', colorScheme), shape: 'ellipse' as const },
    { label: 'Hypothesis', color: getNodeColor('neutral', colorScheme) },
    { label: 'Best', color: getNodeColor('success', colorScheme) },
  ];
  svg += renderLegend(20, svgHeight - 80, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}
