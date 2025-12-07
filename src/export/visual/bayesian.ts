/**
 * Bayesian Visual Exporter (v7.0.2)
 * Sprint 8 Task 8.1: Bayesian network export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 */

import type { BayesianThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
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
 * Export Bayesian network to visual format
 */
export function exportBayesianNetwork(thought: BayesianThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return bayesianToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return bayesianToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return bayesianToASCII(thought);
    case 'svg':
      return bayesianToSVG(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function bayesianToMermaid(
  thought: BayesianThought,
  colorScheme: string,
  _includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph LR\n';

  mermaid += `  H([Hypothesis])\n`;
  mermaid += `  Prior[Prior: ${includeMetrics ? thought.prior.probability.toFixed(3) : '?'}]\n`;
  mermaid += `  Evidence[Evidence]\n`;
  mermaid += `  Posterior[[Posterior: ${includeMetrics ? thought.posterior.probability.toFixed(3) : '?'}]]\n`;

  mermaid += '\n';
  mermaid += '  Prior --> H\n';
  mermaid += '  Evidence --> H\n';
  mermaid += '  H --> Posterior\n';

  if (colorScheme !== 'monochrome') {
    mermaid += '\n';
    const priorColor = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
    const posteriorColor = colorScheme === 'pastel' ? '#c8e6c9' : '#81c784';

    mermaid += `  style Prior fill:${priorColor}\n`;
    mermaid += `  style Posterior fill:${posteriorColor}\n`;
  }

  return mermaid;
}

function bayesianToDOT(
  thought: BayesianThought,
  _includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph BayesianNetwork {\n';
  dot += '  rankdir=LR;\n';
  dot += '  node [shape=ellipse];\n\n';

  const priorProb = includeMetrics ? `: ${thought.prior.probability.toFixed(3)}` : '';
  const posteriorProb = includeMetrics ? `: ${thought.posterior.probability.toFixed(3)}` : '';

  dot += `  Prior [label="Prior${priorProb}"];\n`;
  dot += `  Hypothesis [label="Hypothesis", shape=box];\n`;
  dot += `  Evidence [label="Evidence"];\n`;
  dot += `  Posterior [label="Posterior${posteriorProb}", shape=doublecircle];\n`;

  dot += '\n';
  dot += '  Prior -> Hypothesis;\n';
  dot += '  Evidence -> Hypothesis;\n';
  dot += '  Hypothesis -> Posterior;\n';

  dot += '}\n';
  return dot;
}

function bayesianToASCII(thought: BayesianThought): string {
  let ascii = 'Bayesian Network:\n';
  ascii += '=================\n\n';

  ascii += `Hypothesis: ${thought.hypothesis.statement}\n\n`;
  ascii += `Prior Probability: ${thought.prior.probability.toFixed(3)}\n`;
  ascii += `  Justification: ${thought.prior.justification}\n\n`;

  if (thought.evidence && thought.evidence.length > 0) {
    ascii += 'Evidence:\n';
    for (const ev of thought.evidence) {
      ascii += `  • ${ev.description}\n`;
    }
    ascii += '\n';
  }

  ascii += `Posterior Probability: ${thought.posterior.probability.toFixed(3)}\n`;
  ascii += `  Calculation: ${thought.posterior.calculation}\n`;

  if (thought.bayesFactor !== undefined) {
    ascii += `\nBayes Factor: ${thought.bayesFactor.toFixed(2)}\n`;
  }

  return ascii;
}

/**
 * Export Bayesian network to native SVG format
 */
function bayesianToSVG(thought: BayesianThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = 400,
  } = options;

  const nodeWidth = 140;
  const nodeHeight = 50;
  const centerX = svgWidth / 2;

  // Define node positions for Bayesian network layout
  const positions = new Map<string, SVGNodePosition>();

  // Prior at top left
  positions.set('prior', {
    id: 'prior',
    x: centerX - 200,
    y: 80,
    width: nodeWidth,
    height: nodeHeight,
    label: `Prior: ${includeMetrics ? thought.prior.probability.toFixed(3) : '?'}`,
    type: 'prior',
  });

  // Evidence at top right
  positions.set('evidence', {
    id: 'evidence',
    x: centerX + 60,
    y: 80,
    width: nodeWidth,
    height: nodeHeight,
    label: 'Evidence',
    type: 'evidence',
  });

  // Hypothesis in center
  positions.set('hypothesis', {
    id: 'hypothesis',
    x: centerX - nodeWidth / 2,
    y: 180,
    width: nodeWidth,
    height: nodeHeight,
    label: 'Hypothesis',
    type: 'hypothesis',
  });

  // Posterior at bottom
  positions.set('posterior', {
    id: 'posterior',
    x: centerX - nodeWidth / 2,
    y: 280,
    width: nodeWidth,
    height: nodeHeight,
    label: `Posterior: ${includeMetrics ? thought.posterior.probability.toFixed(3) : '?'}`,
    type: 'posterior',
  });

  let svg = generateSVGHeader(svgWidth, svgHeight, 'Bayesian Network');

  // Render edges
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  svg += renderEdge(positions.get('prior')!, positions.get('hypothesis')!, {});
  svg += renderEdge(positions.get('evidence')!, positions.get('hypothesis')!, {});
  svg += renderEdge(positions.get('hypothesis')!, positions.get('posterior')!, {});
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';

  // Prior - stadium shape
  svg += renderStadiumNode(positions.get('prior')!, getNodeColor('primary', colorScheme));

  // Evidence - rectangle
  svg += renderRectNode(positions.get('evidence')!, getNodeColor('info', colorScheme));

  // Hypothesis - ellipse
  svg += renderEllipseNode(positions.get('hypothesis')!, getNodeColor('neutral', colorScheme));

  // Posterior - stadium (result)
  svg += renderStadiumNode(positions.get('posterior')!, getNodeColor('success', colorScheme));

  svg += '\n  </g>';

  // Render metrics panel
  if (includeMetrics) {
    const metrics = [
      { label: 'Prior', value: thought.prior.probability.toFixed(3) },
      { label: 'Posterior', value: thought.posterior.probability.toFixed(3) },
      { label: 'Bayes Factor', value: thought.bayesFactor?.toFixed(2) || 'N/A' },
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 100, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Prior', color: getNodeColor('primary', colorScheme) },
    { label: 'Evidence', color: getNodeColor('info', colorScheme) },
    { label: 'Hypothesis', color: getNodeColor('neutral', colorScheme), shape: 'ellipse' as const },
    { label: 'Posterior', color: getNodeColor('success', colorScheme) },
  ];
  svg += renderLegend(20, svgHeight - 100, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}
