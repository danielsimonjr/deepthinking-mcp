/**
 * Abductive Visual Exporter (v7.0.3)
 * Sprint 8 Task 8.1: Abductive hypothesis export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 * Phase 9: Added GraphML and TikZ export support
 */

import type { AbductiveThought } from '../../../types/index.js';
import type { VisualExportOptions } from '../types.js';
import { sanitizeId } from '../utils.js';
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
} from '../utils/svg.js';
import {
  generateGraphML,
  type GraphMLNode,
  type GraphMLEdge,
} from '../utils/graphml.js';
import {
  generateTikZ,
  type TikZNode,
  type TikZEdge,
} from '../utils/tikz.js';
import {
  generateHTMLHeader,
  generateHTMLFooter,
  escapeHTML,
  renderMetricCard,
  renderSection,
  renderTable,
  renderBadge,
} from '../utils/html.js';
import {
  generateHierarchyModelica,
} from '../utils/modelica.js';
import {
  generateUmlDiagram,
  type UmlNode,
  type UmlEdge,
} from '../utils/uml.js';
import {
  generateHierarchyJson,
} from '../utils/json.js';
import {
  section,
  table,
  list,
  keyValueSection,
  mermaidBlock,
  document as mdDocument,
} from '../utils/markdown.js';

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
    case 'graphml':
      return abductiveToGraphML(thought, options);
    case 'tikz':
      return abductiveToTikZ(thought, options);
    case 'html':
      return abductiveToHTML(thought, options);
    case 'modelica':
      return abductiveToModelica(thought, options);
    case 'uml':
      return abductiveToUML(thought, options);
    case 'json':
      return abductiveToJSON(thought, options);
    case 'markdown':
      return abductiveToMarkdown(thought, options);
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

/**
 * Export abductive hypotheses to GraphML format
 */
function abductiveToGraphML(thought: AbductiveThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  // Create nodes from hypotheses
  const nodes: GraphMLNode[] = thought.hypotheses.map(hypothesis => ({
    id: sanitizeId(hypothesis.id),
    label: includeLabels ? hypothesis.explanation.substring(0, 50) + '...' : hypothesis.id,
    type: 'hypothesis',
    metadata: includeMetrics ? {
      description: hypothesis.explanation,
      score: hypothesis.score,
      assumptions: hypothesis.assumptions.join(', '),
    } : undefined,
  }));

  // Add observation nodes if available
  if (thought.observations && thought.observations.length > 0) {
    for (const obs of thought.observations) {
      nodes.push({
        id: sanitizeId(`obs_${obs.id}`),
        label: includeLabels ? obs.description : `obs_${obs.id}`,
        type: 'observation',
        metadata: includeMetrics ? {
          description: obs.description,
          confidence: obs.confidence,
        } : undefined,
      });
    }
  }

  // Create edges linking observations to hypotheses
  const edges: GraphMLEdge[] = [];
  let edgeId = 0;

  if (thought.observations && thought.observations.length > 0) {
    for (const obs of thought.observations) {
      for (const hypothesis of thought.hypotheses) {
        edges.push({
          id: `e${edgeId++}`,
          source: sanitizeId(`obs_${obs.id}`),
          target: sanitizeId(hypothesis.id),
          metadata: includeMetrics ? { weight: obs.confidence } : undefined,
        });
      }
    }
  }

  return generateGraphML(nodes, edges, {
    graphName: 'Abductive Hypotheses',
    includeLabels,
    includeMetadata: includeMetrics,
  });
}

/**
 * Export abductive hypotheses to TikZ/LaTeX format
 */
function abductiveToTikZ(thought: AbductiveThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true, colorScheme = 'default' } = options;

  const nodes: TikZNode[] = [];
  const edges: TikZEdge[] = [];

  // Position hypotheses horizontally
  const hypCount = thought.hypotheses.length;
  const spacing = 3;
  const totalWidth = (hypCount - 1) * spacing;
  const startX = 4 - totalWidth / 2;

  for (let i = 0; i < thought.hypotheses.length; i++) {
    const hypothesis = thought.hypotheses[i];
    const isBest = thought.bestExplanation?.id === hypothesis.id;
    const label = includeLabels
      ? hypothesis.explanation.substring(0, 30) + '...'
      : hypothesis.id;
    const scoreLabel = includeMetrics ? ` (${hypothesis.score.toFixed(2)})` : '';

    nodes.push({
      id: sanitizeId(hypothesis.id),
      label: label + scoreLabel,
      x: startX + i * spacing,
      y: -2,
      type: isBest ? 'success' : 'hypothesis',
      shape: 'ellipse',
    });
  }

  // Add observation nodes above if available
  if (thought.observations && thought.observations.length > 0) {
    const obsCount = thought.observations.length;
    const obsSpacing = Math.min(spacing, totalWidth / Math.max(1, obsCount - 1));
    const obsStartX = 4 - ((obsCount - 1) * obsSpacing) / 2;

    for (let i = 0; i < thought.observations.length; i++) {
      const obs = thought.observations[i];
      nodes.push({
        id: sanitizeId(`obs_${obs.id}`),
        label: includeLabels ? obs.description.substring(0, 30) + '...' : `obs_${obs.id}`,
        x: obsStartX + i * obsSpacing,
        y: 0,
        type: 'info',
        shape: 'rectangle',
      });

      // Create edges from observations to hypotheses
      for (const hypothesis of thought.hypotheses) {
        edges.push({
          source: sanitizeId(`obs_${obs.id}`),
          target: sanitizeId(hypothesis.id),
          directed: true,
        });
      }
    }
  }

  return generateTikZ(nodes, edges, {
    title: 'Abductive Hypotheses',
    includeLabels,
    includeMetrics,
    colorScheme,
  });
}

/**
 * Export abductive hypotheses to HTML format
 */
function abductiveToHTML(thought: AbductiveThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Abductive Reasoning Analysis',
    htmlTheme = 'light',
    includeMetrics = true,
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // Metrics
  if (includeMetrics) {
    html += '<div class="metrics-grid">';
    html += renderMetricCard('Observations', thought.observations.length, 'info');
    html += renderMetricCard('Hypotheses', thought.hypotheses.length, 'primary');
    if (thought.bestExplanation) {
      html += renderMetricCard('Best Score', thought.bestExplanation.score.toFixed(2), 'success');
    }
    html += '</div>\n';
  }

  // Observations table
  const obsRows = thought.observations.map((obs, i) => [
    (i + 1).toString(),
    obs.description,
    obs.confidence.toFixed(2),
    obs.timestamp || '-',
  ]);
  html += renderSection('Observations', renderTable(
    ['#', 'Description', 'Confidence', 'Time'],
    obsRows
  ), '👁️');

  // Hypotheses table
  const hypRows = thought.hypotheses.map(hyp => {
    const isBest = thought.bestExplanation?.id === hyp.id;
    const badge = isBest ? renderBadge('Best', 'success') : '';
    return [
      hyp.explanation.substring(0, 60) + (hyp.explanation.length > 60 ? '...' : ''),
      hyp.score.toFixed(2),
      badge,
      hyp.assumptions.slice(0, 3).join(', ') + (hyp.assumptions.length > 3 ? '...' : ''),
    ];
  });
  html += renderSection('Hypotheses', renderTable(
    ['Explanation', 'Score', 'Status', 'Key Assumptions'],
    hypRows.map(row => row.map(cell => typeof cell === 'string' && cell.startsWith('<') ? cell : escapeHTML(String(cell))))
  ), '💡');

  // Best explanation highlight
  if (thought.bestExplanation) {
    html += renderSection('Best Explanation', `
      <div class="card">
        <div class="card-header">${escapeHTML(thought.bestExplanation.explanation)}</div>
        <p><strong>Score:</strong> ${thought.bestExplanation.score.toFixed(2)}</p>
        <p><strong>Assumptions:</strong></p>
        <ul class="list-styled">
          ${thought.bestExplanation.assumptions.map(a => `<li>${escapeHTML(a)}</li>`).join('\n')}
        </ul>
      </div>
    `, '⭐');
  }

  html += generateHTMLFooter(htmlStandalone);
  return html;
}

/**
 * Export abductive hypotheses to Modelica format
 */
function abductiveToModelica(thought: AbductiveThought, options: VisualExportOptions): string {
  const { modelicaPackageName, includeMetrics = true } = options;

  // Map hypotheses to the format expected by generateHierarchyModelica
  const children = thought.hypotheses.map(h => ({
    name: sanitizeId(h.id),
    description: h.explanation.substring(0, 100),
    score: includeMetrics ? h.score : undefined,
  }));

  return generateHierarchyModelica(
    'Observations',
    `Abductive reasoning with ${thought.observations.length} observations`,
    children,
    {
      packageName: modelicaPackageName || 'AbductiveHypotheses',
      includeMetrics,
    }
  );
}

/**
 * Export abductive hypotheses to UML/PlantUML format
 */
function abductiveToUML(thought: AbductiveThought, options: VisualExportOptions): string {
  const { umlTheme, umlDirection, includeLabels = true, includeMetrics = true } = options;

  const nodes: UmlNode[] = [
    {
      id: 'observations',
      label: 'Observations',
      shape: 'database',
    },
  ];

  const edges: UmlEdge[] = [];

  // Add hypothesis nodes
  for (const hyp of thought.hypotheses) {
    const isBest = thought.bestExplanation?.id === hyp.id;
    const label = includeLabels
      ? hyp.explanation.substring(0, 40) + (hyp.explanation.length > 40 ? '...' : '')
      : hyp.id;
    const scoreLabel = includeMetrics ? ` (${hyp.score.toFixed(2)})` : '';

    nodes.push({
      id: sanitizeId(hyp.id),
      label: label + scoreLabel,
      shape: 'class',
      color: isBest ? '90EE90' : undefined,
      stereotype: isBest ? 'best' : undefined,
    });

    edges.push({
      source: 'observations',
      target: sanitizeId(hyp.id),
      type: 'arrow',
    });
  }

  return generateUmlDiagram(nodes, edges, {
    title: 'Abductive Hypotheses',
    theme: umlTheme,
    direction: umlDirection,
  });
}

/**
 * Export abductive hypotheses to JSON format
 */
function abductiveToJSON(thought: AbductiveThought, options: VisualExportOptions): string {
  const { jsonPrettyPrint = true, jsonIndent = 2, includeMetrics = true } = options;

  const children = thought.hypotheses.map(h => ({
    id: sanitizeId(h.id),
    label: h.explanation.substring(0, 60),
    score: h.score,
    metadata: {
      assumptions: h.assumptions,
      isBest: thought.bestExplanation?.id === h.id,
    },
  }));

  let json = generateHierarchyJson(
    'Abductive Hypotheses',
    'abductive',
    { label: 'Observations', metadata: { count: thought.observations.length } },
    children,
    {
      prettyPrint: jsonPrettyPrint,
      indent: jsonIndent,
      includeMetrics,
    }
  );

  // Add observation details
  if (includeMetrics) {
    const graph = JSON.parse(json);
    graph.metadata.observationCount = thought.observations.length;
    graph.metadata.hypothesisCount = thought.hypotheses.length;
    if (thought.bestExplanation) {
      graph.metadata.bestHypothesisId = thought.bestExplanation.id;
      graph.metadata.bestScore = thought.bestExplanation.score;
    }
    json = JSON.stringify(graph, null, jsonPrettyPrint !== false ? jsonIndent : 0);
  }

  return json;
}

/**
 * Export abductive hypotheses to Markdown format
 */
function abductiveToMarkdown(thought: AbductiveThought, options: VisualExportOptions): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
    includeMetrics = true,
  } = options;

  const parts: string[] = [];

  // Metrics
  if (includeMetrics) {
    parts.push(section('Metrics', keyValueSection({
      'Total Hypotheses': thought.hypotheses.length,
      'Total Observations': thought.observations.length,
      'Best Hypothesis Score': thought.bestExplanation?.score.toFixed(2) || 'N/A',
    })));
  }

  // Observations
  const obsRows = thought.observations.map(obs => [
    obs.id,
    obs.description,
    obs.confidence.toFixed(2),
    obs.timestamp || '-',
  ]);
  parts.push(section('Observations', table(
    ['ID', 'Description', 'Confidence', 'Timestamp'],
    obsRows
  )));

  // Hypotheses
  const hypRows = thought.hypotheses.map(hyp => [
    hyp.id,
    hyp.explanation.substring(0, 60) + (hyp.explanation.length > 60 ? '...' : ''),
    hyp.score.toFixed(2),
    thought.bestExplanation?.id === hyp.id ? '★ Best' : '',
  ]);
  parts.push(section('Hypotheses', table(
    ['ID', 'Explanation', 'Score', 'Status'],
    hypRows
  )));

  // Best explanation details
  if (thought.bestExplanation) {
    const assumptions = list(thought.bestExplanation.assumptions);
    parts.push(section('Best Explanation',
      `**Score:** ${thought.bestExplanation.score.toFixed(2)}\n\n` +
      `**Explanation:** ${thought.bestExplanation.explanation}\n\n` +
      `**Assumptions:**\n${assumptions}`
    ));
  }

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaid = abductiveToMermaid(thought, 'default', true, includeMetrics);
    parts.push(section('Visualization', mermaidBlock(mermaid)));
  }

  return mdDocument('Abductive Reasoning Analysis', parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: { mode: 'abductive', hypotheses: thought.hypotheses.length },
  });
}
