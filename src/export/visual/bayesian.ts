/**
 * Bayesian Visual Exporter (v7.0.3)
 * Sprint 8 Task 8.1: Bayesian network export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 * Phase 9: Added GraphML and TikZ export support
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
import {
  generateGraphML,
  type GraphMLNode,
  type GraphMLEdge,
} from './graphml-utils.js';
import {
  generateTikZ,
  type TikZNode,
  type TikZEdge,
} from './tikz-utils.js';
import {
  generateHTMLHeader,
  generateHTMLFooter,
  escapeHTML,
  renderMetricCard,
  renderSection,
  renderTable,
  renderProgressBar,
} from './html-utils.js';
import {
  sanitizeModelicaId,
  escapeModelicaString,
} from './modelica-utils.js';
import {
  generateUmlDiagram,
  type UmlNode,
  type UmlEdge,
} from './uml-utils.js';
import {
  generateBayesianJson,
} from './json-utils.js';

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
    case 'graphml':
      return bayesianToGraphML(thought, options);
    case 'tikz':
      return bayesianToTikZ(thought, options);
    case 'html':
      return bayesianToHTML(thought, options);
    case 'modelica':
      return bayesianToModelica(thought, options);
    case 'uml':
      return bayesianToUML(thought, options);
    case 'json':
      return bayesianToJSON(thought, options);
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

/**
 * Export Bayesian network to GraphML format
 */
function bayesianToGraphML(thought: BayesianThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  // Simple structure with Prior, Hypothesis, Evidence, Posterior
  const nodes: GraphMLNode[] = [
    { id: 'prior', label: includeLabels ? `Prior: ${thought.prior.probability.toFixed(3)}` : 'Prior', type: 'prior' },
    { id: 'hypothesis', label: 'Hypothesis', type: 'hypothesis' },
    { id: 'evidence', label: 'Evidence', type: 'evidence' },
    { id: 'posterior', label: includeLabels ? `Posterior: ${thought.posterior.probability.toFixed(3)}` : 'Posterior', type: 'posterior' },
  ];

  const edges: GraphMLEdge[] = [
    { id: 'e1', source: 'prior', target: 'hypothesis' },
    { id: 'e2', source: 'evidence', target: 'hypothesis' },
    { id: 'e3', source: 'hypothesis', target: 'posterior' },
  ];

  return generateGraphML(nodes, edges, {
    graphName: 'Bayesian Network',
    includeLabels,
    includeMetadata: includeMetrics,
  });
}

/**
 * Export Bayesian network to TikZ/LaTeX format
 */
function bayesianToTikZ(thought: BayesianThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true, colorScheme = 'default' } = options;

  // Simple structure with Prior, Hypothesis, Evidence, Posterior
  const nodes: TikZNode[] = [
    { id: 'prior', label: includeLabels ? `Prior: ${thought.prior.probability.toFixed(3)}` : 'Prior', x: 0, y: 0, type: 'primary', shape: 'stadium' },
    { id: 'evidence', label: 'Evidence', x: 4, y: 0, type: 'info', shape: 'rectangle' },
    { id: 'hypothesis', label: 'Hypothesis', x: 2, y: -2, type: 'neutral', shape: 'ellipse' },
    { id: 'posterior', label: includeLabels ? `Posterior: ${thought.posterior.probability.toFixed(3)}` : 'Posterior', x: 2, y: -4, type: 'success', shape: 'stadium' },
  ];

  const edges: TikZEdge[] = [
    { source: 'prior', target: 'hypothesis', directed: true },
    { source: 'evidence', target: 'hypothesis', directed: true },
    { source: 'hypothesis', target: 'posterior', directed: true },
  ];

  return generateTikZ(nodes, edges, {
    title: 'Bayesian Network',
    includeLabels,
    includeMetrics,
    colorScheme,
  });
}

/**
 * Export Bayesian network to HTML format
 */
function bayesianToHTML(thought: BayesianThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Bayesian Analysis',
    htmlTheme = 'light',
    includeMetrics = true,
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // Hypothesis section
  html += renderSection('Hypothesis', `
    <p><strong>${escapeHTML(thought.hypothesis.statement)}</strong></p>
    ${thought.hypothesis.alternatives && thought.hypothesis.alternatives.length > 0 ? `<p class="text-secondary">Alternatives: ${thought.hypothesis.alternatives.join(', ')}</p>` : ''}
  `, '🎯');

  // Probabilities section
  if (includeMetrics) {
    html += '<div class="metrics-grid">';
    html += renderMetricCard('Prior', (thought.prior.probability * 100).toFixed(1) + '%', 'primary');
    html += renderMetricCard('Posterior', (thought.posterior.probability * 100).toFixed(1) + '%', 'success');
    if (thought.bayesFactor !== undefined) {
      html += renderMetricCard('Bayes Factor', thought.bayesFactor.toFixed(2), 'info');
    }
    html += '</div>\n';

    // Prior probability bar
    html += '<div class="card">';
    html += '<div class="card-header">Prior Probability</div>';
    html += renderProgressBar(thought.prior.probability * 100, 'primary');
    html += `<p class="text-secondary" style="margin-top: 0.5rem">${escapeHTML(thought.prior.justification)}</p>`;
    html += '</div>\n';

    // Posterior probability bar
    html += '<div class="card">';
    html += '<div class="card-header">Posterior Probability</div>';
    html += renderProgressBar(thought.posterior.probability * 100, 'success');
    html += `<p class="text-secondary" style="margin-top: 0.5rem">${escapeHTML(thought.posterior.calculation)}</p>`;
    html += '</div>\n';
  }

  // Evidence section
  if (thought.evidence && thought.evidence.length > 0) {
    const evidenceRows = thought.evidence.map((ev, i) => [
      (i + 1).toString(),
      ev.description,
      ev.likelihoodGivenHypothesis?.toFixed(3) || '-',
      ev.likelihoodGivenNotHypothesis?.toFixed(3) || '-',
    ]);
    html += renderSection('Evidence', renderTable(
      ['#', 'Description', 'P(E|H)', 'P(E|¬H)'],
      evidenceRows
    ), '📊');
  }

  // Interpretation
  const change = thought.posterior.probability - thought.prior.probability;
  const changeDirection = change > 0 ? 'increased' : change < 0 ? 'decreased' : 'unchanged';
  const changeClass = change > 0 ? 'text-success' : change < 0 ? 'text-danger' : 'text-secondary';

  html += renderSection('Interpretation', `
    <p>The posterior probability has <span class="${changeClass}"><strong>${changeDirection}</strong></span>
    by ${Math.abs(change * 100).toFixed(1)} percentage points from the prior.</p>
    ${thought.bayesFactor !== undefined ? `
      <p>Bayes Factor of ${thought.bayesFactor.toFixed(2)} indicates
      ${thought.bayesFactor > 3 ? 'substantial' : thought.bayesFactor > 1 ? 'weak' : 'evidence against'}
      support for the hypothesis.</p>
    ` : ''}
  `, '💡');

  html += generateHTMLFooter(htmlStandalone);
  return html;
}

/**
 * Export Bayesian network to Modelica format
 */
function bayesianToModelica(thought: BayesianThought, options: VisualExportOptions): string {
  const { modelicaPackageName, modelicaIncludeAnnotations = true, includeMetrics = true } = options;
  const packageName = modelicaPackageName || 'BayesianNetwork';
  const lines: string[] = [];

  lines.push(`package ${sanitizeModelicaId(packageName)}`);
  lines.push(`  "Bayesian network analysis"`);
  lines.push('');

  // Hypothesis record
  lines.push('  record Hypothesis');
  lines.push(`    constant String statement = "${escapeModelicaString(thought.hypothesis.statement)}";`);
  if (thought.hypothesis.alternatives && thought.hypothesis.alternatives.length > 0) {
    lines.push(`    constant Integer alternativeCount = ${thought.hypothesis.alternatives.length};`);
  }
  lines.push('  end Hypothesis;');
  lines.push('');

  // Probability parameters
  lines.push('  // Probability parameters');
  lines.push(`  parameter Real prior = ${thought.prior.probability.toFixed(6)} "Prior probability";`);
  lines.push(`  parameter Real posterior = ${thought.posterior.probability.toFixed(6)} "Posterior probability";`);
  if (thought.bayesFactor !== undefined) {
    lines.push(`  parameter Real bayesFactor = ${thought.bayesFactor.toFixed(6)} "Bayes factor";`);
  }
  lines.push('');

  // Computed values
  if (includeMetrics) {
    lines.push('  // Computed metrics');
    lines.push(`  final parameter Real probabilityChange = posterior - prior;`);
    lines.push(`  final parameter Real updateRatio = posterior / max(prior, 1e-10);`);
    lines.push('');
  }

  // Evidence
  if (thought.evidence && thought.evidence.length > 0) {
    lines.push('  // Evidence');
    for (let i = 0; i < thought.evidence.length; i++) {
      const ev = thought.evidence[i];
      lines.push(`  record Evidence_${i + 1}`);
      lines.push(`    constant String description = "${escapeModelicaString(ev.description)}";`);
      if (ev.likelihoodGivenHypothesis !== undefined) {
        lines.push(`    constant Real likelihoodGivenH = ${ev.likelihoodGivenHypothesis.toFixed(6)};`);
      }
      if (ev.likelihoodGivenNotHypothesis !== undefined) {
        lines.push(`    constant Real likelihoodGivenNotH = ${ev.likelihoodGivenNotHypothesis.toFixed(6)};`);
      }
      lines.push(`  end Evidence_${i + 1};`);
      lines.push('');
    }
  }

  if (modelicaIncludeAnnotations) {
    lines.push('  annotation(');
    lines.push('    Documentation(info="<html>');
    lines.push(`      <p><b>Prior:</b> ${(thought.prior.probability * 100).toFixed(1)}%</p>`);
    lines.push(`      <p><b>Posterior:</b> ${(thought.posterior.probability * 100).toFixed(1)}%</p>`);
    lines.push('      <p>Generated by DeepThinking MCP v7.1.0</p>');
    lines.push('    </html>")');
    lines.push('  );');
  }

  lines.push(`end ${sanitizeModelicaId(packageName)};`);

  return lines.join('\n');
}

/**
 * Export Bayesian network to UML/PlantUML format
 */
function bayesianToUML(thought: BayesianThought, options: VisualExportOptions): string {
  const { umlTheme, umlDirection, includeMetrics = true } = options;

  const nodes: UmlNode[] = [
    {
      id: 'prior',
      label: includeMetrics ? `Prior: ${thought.prior.probability.toFixed(3)}` : 'Prior',
      shape: 'entity',
    },
    {
      id: 'evidence',
      label: 'Evidence',
      shape: 'rectangle',
    },
    {
      id: 'hypothesis',
      label: 'Hypothesis',
      shape: 'usecase',
    },
    {
      id: 'posterior',
      label: includeMetrics ? `Posterior: ${thought.posterior.probability.toFixed(3)}` : 'Posterior',
      shape: 'entity',
      color: '90EE90',
    },
  ];

  const edges: UmlEdge[] = [
    { source: 'prior', target: 'hypothesis', type: 'arrow' },
    { source: 'evidence', target: 'hypothesis', type: 'arrow' },
    { source: 'hypothesis', target: 'posterior', type: 'arrow' },
  ];

  return generateUmlDiagram(nodes, edges, {
    title: 'Bayesian Network',
    theme: umlTheme,
    direction: umlDirection,
  });
}

/**
 * Export Bayesian network to JSON format
 */
function bayesianToJSON(thought: BayesianThought, options: VisualExportOptions): string {
  const { jsonPrettyPrint = true, jsonIndent = 2 } = options;

  const evidenceDescriptions = thought.evidence?.map(e => e.description) || [];

  return generateBayesianJson(
    'Bayesian Network',
    thought.prior.probability,
    thought.posterior.probability,
    thought.bayesFactor,
    thought.hypothesis.statement,
    evidenceDescriptions,
    {
      prettyPrint: jsonPrettyPrint,
      indent: jsonIndent,
    }
  );
}
