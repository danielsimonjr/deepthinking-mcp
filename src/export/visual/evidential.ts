/**
 * Evidential Visual Exporter (v7.0.2)
 * Sprint 8 Task 8.1: Evidential belief export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 */

import type { EvidentialThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';
import {
  generateSVGHeader,
  generateSVGFooter,
  renderRectNode,
  renderEllipseNode,
  renderEdge,
  renderMetricsPanel,
  renderLegend,
  getNodeColor,
  DEFAULT_SVG_OPTIONS,
  type SVGNodePosition,
} from './svg-utils.js';

/**
 * Export evidential belief visualization to visual format
 */
export function exportEvidentialBeliefs(thought: EvidentialThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return evidentialToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return evidentialToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return evidentialToASCII(thought);
    case 'svg':
      return evidentialToSVG(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function evidentialToMermaid(
  thought: EvidentialThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TD\n';

  mermaid += '  Frame["Frame of Discernment"]\n';

  if (thought.frameOfDiscernment) {
    for (const hypothesis of thought.frameOfDiscernment) {
      const hypId = sanitizeId(hypothesis);
      const label = includeLabels ? hypothesis : hypId;

      mermaid += `  ${hypId}["${label}"]\n`;
      mermaid += `  Frame --> ${hypId}\n`;
    }
  }

  if (includeMetrics && (thought as any).massAssignments && (thought as any).massAssignments.length > 0) {
    mermaid += '\n';
    for (const mass of (thought as any).massAssignments) {
      const massId = sanitizeId(mass.subset.join('_'));
      const label = `{${mass.subset.join(', ')}}`;
      mermaid += `  ${massId}["${label}: ${mass.mass.toFixed(3)}"]\n`;
    }
  }

  if (colorScheme !== 'monochrome' && thought.frameOfDiscernment) {
    mermaid += '\n';
    const color = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
    for (const hypothesis of thought.frameOfDiscernment) {
      const hypId = sanitizeId(hypothesis);
      mermaid += `  style ${hypId} fill:${color}\n`;
    }
  }

  return mermaid;
}

function evidentialToDOT(
  thought: EvidentialThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph EvidentialBeliefs {\n';
  dot += '  rankdir=TD;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  dot += '  Frame [label="Frame of Discernment", shape=ellipse];\n\n';

  if (thought.frameOfDiscernment) {
    for (const hypothesis of thought.frameOfDiscernment) {
      const hypId = sanitizeId(hypothesis);
      const label = includeLabels ? hypothesis : hypId;

      dot += `  ${hypId} [label="${label}"];\n`;
      dot += `  Frame -> ${hypId};\n`;
    }
  }

  if (includeMetrics && (thought as any).massAssignments && (thought as any).massAssignments.length > 0) {
    dot += '\n';
    for (const mass of (thought as any).massAssignments) {
      const massId = sanitizeId(mass.subset.join('_'));
      const label = `{${mass.subset.join(', ')}}: ${mass.mass.toFixed(3)}`;
      dot += `  ${massId} [label="${label}", shape=note];\n`;
    }
  }

  dot += '}\n';
  return dot;
}

function evidentialToASCII(thought: EvidentialThought): string {
  let ascii = 'Evidential Belief Visualization:\n';
  ascii += '================================\n\n';

  ascii += 'Frame of Discernment:\n';
  if (thought.frameOfDiscernment) {
    ascii += `  {${thought.frameOfDiscernment.join(', ')}}\n\n`;
  } else {
    ascii += '  (not defined)\n\n';
  }

  if ((thought as any).massAssignments && (thought as any).massAssignments.length > 0) {
    ascii += 'Mass Assignments:\n';
    for (const mass of (thought as any).massAssignments) {
      ascii += `  m({${mass.subset.join(', ')}}) = ${mass.mass.toFixed(3)}\n`;
    }
    ascii += '\n';
  }

  if (thought.beliefFunctions && thought.beliefFunctions.length > 0) {
    ascii += `Belief Functions: ${thought.beliefFunctions.length} defined\n`;
  }

  if ((thought as any).plausibilityFunction) {
    ascii += `Plausibility: ${(thought as any).plausibilityFunction.toFixed(3)}\n`;
  }

  return ascii;
}

/**
 * Export evidential belief visualization to native SVG format
 */
function evidentialToSVG(thought: EvidentialThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
  } = options;

  if (!thought.frameOfDiscernment || thought.frameOfDiscernment.length === 0) {
    return generateSVGHeader(svgWidth, 200, 'Evidential Beliefs') +
      '\n  <text x="400" y="100" text-anchor="middle" class="subtitle">No frame of discernment defined</text>\n' +
      generateSVGFooter();
  }

  const positions = new Map<string, SVGNodePosition>();
  const nodeWidth = 150;
  const nodeHeight = 40;

  // Frame of discernment at the top center
  positions.set('frame', {
    id: 'frame',
    label: 'Frame of Discernment',
    x: svgWidth / 2,
    y: 80,
    width: nodeWidth,
    height: nodeHeight,
    type: 'frame',
  });

  // Hypotheses below the frame
  const hypSpacing = Math.min(200, svgWidth / (thought.frameOfDiscernment.length + 1));
  const hypStartX = (svgWidth - (thought.frameOfDiscernment.length - 1) * hypSpacing) / 2;
  thought.frameOfDiscernment.forEach((hypothesis, index) => {
    const hypId = sanitizeId(hypothesis);
    positions.set(hypId, {
      id: hypId,
      label: includeLabels ? hypothesis : hypId,
      x: hypStartX + index * hypSpacing,
      y: 200,
      width: nodeWidth,
      height: nodeHeight,
      type: 'hypothesis',
    });
  });

  const actualHeight = 400;

  let svg = generateSVGHeader(svgWidth, actualHeight, 'Evidential Beliefs');

  // Render edges from frame to hypotheses
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  const framePos = positions.get('frame')!;
  for (const hypothesis of thought.frameOfDiscernment) {
    const hypPos = positions.get(sanitizeId(hypothesis));
    if (hypPos) {
      svg += renderEdge(framePos, hypPos);
    }
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';

  const frameColors = getNodeColor('warning', colorScheme);
  const hypColors = getNodeColor('primary', colorScheme);

  svg += renderEllipseNode(framePos, frameColors);

  for (const [id, pos] of positions) {
    if (id !== 'frame') {
      svg += renderRectNode(pos, hypColors);
    }
  }
  svg += '\n  </g>';

  // Render metrics panel
  if (includeMetrics) {
    const metrics = [
      { label: 'Hypotheses', value: thought.frameOfDiscernment.length },
      { label: 'Belief Functions', value: thought.beliefFunctions?.length || 0 },
    ];
    svg += renderMetricsPanel(svgWidth - 180, actualHeight - 110, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Frame', color: frameColors, shape: 'ellipse' as const },
    { label: 'Hypothesis', color: hypColors },
  ];
  svg += renderLegend(20, actualHeight - 80, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}
