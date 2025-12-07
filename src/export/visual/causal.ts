/**
 * Causal Visual Exporter (v7.0.3)
 * Sprint 8 Task 8.1: Causal graph export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 * Phase 9: Added GraphML and TikZ export support
 */

import type { CausalThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';
import {
  generateSVGHeader,
  generateSVGFooter,
  renderStadiumNode,
  renderRectNode,
  renderDiamondNode,
  renderEllipseNode,
  renderEdge,
  renderMetricsPanel,
  renderLegend,
  getNodeColor,
  layoutNodesInLayers,
  calculateSVGHeight,
  DEFAULT_SVG_OPTIONS,
} from './svg-utils.js';
import {
  generateGraphML,
  type GraphMLNode,
  type GraphMLEdge,
  type GraphMLOptions,
} from './graphml-utils.js';
import {
  generateTikZ,
  type TikZNode,
  type TikZEdge,
  type TikZOptions,
} from './tikz-utils.js';
import {
  generateHTMLHeader,
  generateHTMLFooter,
  escapeHTML,
  renderMetricCard,
  renderSection,
  renderTable,
  renderBadge,
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
  generateCausalJson,
} from './json-utils.js';
import {
  section,
  table,
  list,
  keyValueSection,
  mermaidBlock,
  document as mdDocument,
} from './markdown-utils.js';

/**
 * Export causal graph to visual format
 */
export function exportCausalGraph(thought: CausalThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return causalGraphToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return causalGraphToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return causalGraphToASCII(thought);
    case 'svg':
      return causalGraphToSVG(thought, options);
    case 'graphml':
      return causalGraphToGraphML(thought, options);
    case 'tikz':
      return causalGraphToTikZ(thought, options);
    case 'html':
      return causalGraphToHTML(thought, options);
    case 'modelica':
      return causalToModelica(thought, options);
    case 'uml':
      return causalToUML(thought, options);
    case 'json':
      return causalToJSON(thought, options);
    case 'markdown':
      return causalToMarkdown(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function causalGraphToMermaid(
  thought: CausalThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TB\n';

  if (!thought.causalGraph || !thought.causalGraph.nodes) {
    return mermaid + '  NoData["No causal graph data"]\n';
  }

  for (const node of thought.causalGraph.nodes) {
    const nodeId = sanitizeId(node.id);
    const label = includeLabels ? node.name : nodeId;

    let shape: [string, string];
    switch (node.type) {
      case 'cause':
        shape = ['([', '])'];
        break;
      case 'effect':
        shape = ['[[', ']]'];
        break;
      case 'mediator':
        shape = ['[', ']'];
        break;
      case 'confounder':
        shape = ['{', '}'];
        break;
      default:
        shape = ['[', ']'];
    }

    mermaid += `  ${nodeId}${shape[0]}${label}${shape[1]}\n`;
  }

  mermaid += '\n';

  for (const edge of thought.causalGraph.edges) {
    const fromId = sanitizeId(edge.from);
    const toId = sanitizeId(edge.to);

    if (includeMetrics && edge.strength !== undefined) {
      mermaid += `  ${fromId} --> |${edge.strength.toFixed(2)}| ${toId}\n`;
    } else {
      mermaid += `  ${fromId} --> ${toId}\n`;
    }
  }

  if (colorScheme !== 'monochrome') {
    mermaid += '\n';
    const causes = thought.causalGraph.nodes.filter(n => n.type === 'cause');
    const effects = thought.causalGraph.nodes.filter(n => n.type === 'effect');

    for (const node of causes) {
      const color = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
      mermaid += `  style ${sanitizeId(node.id)} fill:${color}\n`;
    }

    for (const node of effects) {
      const color = colorScheme === 'pastel' ? '#fff3e0' : '#ffd699';
      mermaid += `  style ${sanitizeId(node.id)} fill:${color}\n`;
    }
  }

  return mermaid;
}

function causalGraphToDOT(
  thought: CausalThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph CausalGraph {\n';
  dot += '  rankdir=TB;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  if (!thought.causalGraph || !thought.causalGraph.nodes) {
    dot += '  NoData [label="No causal graph data"];\n}\n';
    return dot;
  }

  for (const node of thought.causalGraph.nodes) {
    const nodeId = sanitizeId(node.id);
    const label = includeLabels ? node.name : nodeId;

    let shape = 'box';
    switch (node.type) {
      case 'cause': shape = 'ellipse'; break;
      case 'effect': shape = 'doubleoctagon'; break;
      case 'mediator': shape = 'box'; break;
      case 'confounder': shape = 'diamond'; break;
    }

    dot += `  ${nodeId} [label="${label}", shape=${shape}];\n`;
  }

  dot += '\n';

  for (const edge of thought.causalGraph.edges) {
    const fromId = sanitizeId(edge.from);
    const toId = sanitizeId(edge.to);

    if (includeMetrics && edge.strength !== undefined) {
      dot += `  ${fromId} -> ${toId} [label="${edge.strength.toFixed(2)}"];\n`;
    } else {
      dot += `  ${fromId} -> ${toId};\n`;
    }
  }

  dot += '}\n';
  return dot;
}

function causalGraphToASCII(thought: CausalThought): string {
  let ascii = 'Causal Graph:\n';
  ascii += '=============\n\n';

  if (!thought.causalGraph || !thought.causalGraph.nodes) {
    return ascii + 'No causal graph data\n';
  }

  ascii += 'Nodes:\n';
  for (const node of thought.causalGraph.nodes) {
    ascii += `  [${node.type.toUpperCase()}] ${node.name}: ${node.description}\n`;
  }

  ascii += '\nEdges:\n';
  for (const edge of thought.causalGraph.edges) {
    const fromNode = thought.causalGraph.nodes.find(n => n.id === edge.from);
    const toNode = thought.causalGraph.nodes.find(n => n.id === edge.to);
    const strength = edge.strength !== undefined ? ` (strength: ${edge.strength.toFixed(2)})` : '';
    ascii += `  ${fromNode?.name} --> ${toNode?.name}${strength}\n`;
  }

  return ascii;
}

/**
 * Export causal graph to native SVG format
 */
function causalGraphToSVG(thought: CausalThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
  } = options;

  if (!thought.causalGraph || !thought.causalGraph.nodes) {
    return generateSVGHeader(svgWidth, 200, 'Causal Graph') +
      '\n  <text x="400" y="100" text-anchor="middle" class="subtitle">No causal graph data</text>\n' +
      generateSVGFooter();
  }

  // Group nodes by type for layered layout
  const causes = thought.causalGraph.nodes.filter(n => n.type === 'cause');
  const mediators = thought.causalGraph.nodes.filter(n => n.type === 'mediator');
  const confounders = thought.causalGraph.nodes.filter(n => n.type === 'confounder');
  const effects = thought.causalGraph.nodes.filter(n => n.type === 'effect');

  // Build layers for layout
  const layers = [
    causes.map(n => ({ id: n.id, label: includeLabels ? n.name : n.id, type: 'cause' })),
    [...mediators, ...confounders].map(n => ({ id: n.id, label: includeLabels ? n.name : n.id, type: n.type })),
    effects.map(n => ({ id: n.id, label: includeLabels ? n.name : n.id, type: 'effect' })),
  ].filter(layer => layer.length > 0);

  const positions = layoutNodesInLayers(layers, { width: svgWidth, title: 'Causal Graph' });
  const actualHeight = calculateSVGHeight(positions);

  let svg = generateSVGHeader(svgWidth, actualHeight, 'Causal Graph');

  // Render edges first (behind nodes)
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  for (const edge of thought.causalGraph.edges) {
    const fromPos = positions.get(edge.from);
    const toPos = positions.get(edge.to);
    if (fromPos && toPos) {
      const label = includeMetrics && edge.strength !== undefined ? edge.strength.toFixed(2) : undefined;
      svg += renderEdge(fromPos, toPos, { label });
    }
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  for (const [, pos] of positions) {
    const colors = getNodeColor(pos.type === 'cause' ? 'primary' : pos.type === 'effect' ? 'tertiary' : 'neutral', colorScheme);
    switch (pos.type) {
      case 'cause':
        svg += renderStadiumNode(pos, colors);
        break;
      case 'effect':
        svg += renderEllipseNode(pos, colors);
        break;
      case 'confounder':
        svg += renderDiamondNode(pos, colors);
        break;
      default:
        svg += renderRectNode(pos, colors);
    }
  }
  svg += '\n  </g>';

  // Render metrics panel
  if (includeMetrics) {
    const metrics = [
      { label: 'Nodes', value: thought.causalGraph.nodes.length },
      { label: 'Edges', value: thought.causalGraph.edges.length },
      { label: 'Causes', value: causes.length },
      { label: 'Effects', value: effects.length },
    ];
    svg += renderMetricsPanel(svgWidth - 180, actualHeight - 110, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Cause', color: getNodeColor('primary', colorScheme) },
    { label: 'Mediator', color: getNodeColor('neutral', colorScheme) },
    { label: 'Confounder', color: getNodeColor('neutral', colorScheme), shape: 'diamond' as const },
    { label: 'Effect', color: getNodeColor('tertiary', colorScheme), shape: 'ellipse' as const },
  ];
  svg += renderLegend(20, actualHeight - 100, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}

/**
 * Export causal graph to GraphML format
 */
function causalGraphToGraphML(thought: CausalThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;

  if (!thought.causalGraph || !thought.causalGraph.nodes) {
    const emptyNodes: GraphMLNode[] = [
      { id: 'no_data', label: 'No causal graph data', type: 'message' }
    ];
    return generateGraphML(emptyNodes, [], { graphName: 'Causal Graph' });
  }

  // Convert nodes to GraphML format
  const nodes: GraphMLNode[] = thought.causalGraph.nodes.map(node => ({
    id: node.id,
    label: node.name,
    type: node.type,
  }));

  // Convert edges to GraphML format
  const edges: GraphMLEdge[] = thought.causalGraph.edges.map((edge, index) => {
    const edgeData: GraphMLEdge = {
      id: `e${index}`,
      source: edge.from,
      target: edge.to,
    };

    if (includeMetrics && edge.strength !== undefined) {
      edgeData.metadata = { weight: edge.strength };
    }

    return edgeData;
  });

  const graphmlOptions: GraphMLOptions = {
    graphName: 'Causal Graph',
  };

  return generateGraphML(nodes, edges, graphmlOptions);
}

/**
 * Export causal graph to TikZ format
 */
function causalGraphToTikZ(thought: CausalThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  if (!thought.causalGraph || !thought.causalGraph.nodes) {
    const emptyNodes: TikZNode[] = [
      { id: 'no_data', x: 0, y: 0, label: 'No causal graph data', shape: 'rectangle' }
    ];
    return generateTikZ(emptyNodes, [], { title: 'Causal Graph' });
  }

  // Group nodes by type for layered layout
  const causes = thought.causalGraph.nodes.filter(n => n.type === 'cause');
  const mediators = thought.causalGraph.nodes.filter(n => n.type === 'mediator');
  const confounders = thought.causalGraph.nodes.filter(n => n.type === 'confounder');
  const effects = thought.causalGraph.nodes.filter(n => n.type === 'effect');

  // Create TikZ nodes with layered positions
  const nodes: TikZNode[] = [];

  // Layer 0: Causes (y = 0)
  causes.forEach((node, index) => {
    const spacing = 3;
    const offset = (causes.length - 1) * spacing / 2;
    nodes.push({
      id: node.id,
      x: index * spacing - offset,
      y: 0,
      label: includeLabels ? node.name : node.id,
      shape: 'stadium',
      type: node.type,
    });
  });

  // Layer 1: Mediators and Confounders (y = -2)
  const middleNodes = [...mediators, ...confounders];
  middleNodes.forEach((node, index) => {
    const spacing = 3;
    const offset = (middleNodes.length - 1) * spacing / 2;
    nodes.push({
      id: node.id,
      x: index * spacing - offset,
      y: -2,
      label: includeLabels ? node.name : node.id,
      shape: node.type === 'confounder' ? 'diamond' : 'rectangle',
      type: node.type,
    });
  });

  // Layer 2: Effects (y = -4)
  effects.forEach((node, index) => {
    const spacing = 3;
    const offset = (effects.length - 1) * spacing / 2;
    nodes.push({
      id: node.id,
      x: index * spacing - offset,
      y: -4,
      label: includeLabels ? node.name : node.id,
      shape: 'ellipse',
      type: node.type,
    });
  });

  // Create TikZ edges
  const edges: TikZEdge[] = thought.causalGraph.edges.map(edge => {
    const edgeData: TikZEdge = {
      source: edge.from,
      target: edge.to,
    };

    if (includeMetrics && edge.strength !== undefined) {
      edgeData.label = edge.strength.toFixed(2);
    }

    return edgeData;
  });

  const tikzOptions: TikZOptions = {
    title: 'Causal Graph',
  };

  return generateTikZ(nodes, edges, tikzOptions);
}

/**
 * Export causal graph to HTML format
 */
function causalGraphToHTML(thought: CausalThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Causal Graph Analysis',
    htmlTheme = 'light',
    includeMetrics = true,
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  if (!thought.causalGraph || !thought.causalGraph.nodes) {
    html += '<p class="text-secondary">No causal graph data available.</p>\n';
    html += generateHTMLFooter(htmlStandalone);
    return html;
  }

  // Metrics section
  if (includeMetrics) {
    const causes = thought.causalGraph.nodes.filter(n => n.type === 'cause');
    const effects = thought.causalGraph.nodes.filter(n => n.type === 'effect');
    const mediators = thought.causalGraph.nodes.filter(n => n.type === 'mediator');
    const confounders = thought.causalGraph.nodes.filter(n => n.type === 'confounder');

    html += '<div class="metrics-grid">';
    html += renderMetricCard('Total Nodes', thought.causalGraph.nodes.length, 'primary');
    html += renderMetricCard('Edges', thought.causalGraph.edges.length, 'info');
    html += renderMetricCard('Causes', causes.length, 'success');
    html += renderMetricCard('Effects', effects.length, 'warning');
    if (mediators.length > 0) {
      html += renderMetricCard('Mediators', mediators.length);
    }
    if (confounders.length > 0) {
      html += renderMetricCard('Confounders', confounders.length, 'danger');
    }
    html += '</div>\n';
  }

  // Nodes table
  const nodeRows = thought.causalGraph.nodes.map(node => {
    const typeBadge = renderBadge(node.type,
      node.type === 'cause' ? 'success' :
      node.type === 'effect' ? 'warning' :
      node.type === 'confounder' ? 'danger' : 'secondary'
    );
    return [node.id, node.name, typeBadge, node.description || '-'];
  });
  html += renderSection('Nodes', renderTable(
    ['ID', 'Name', 'Type', 'Description'],
    nodeRows.map(row => row.map(cell => typeof cell === 'string' && cell.startsWith('<') ? cell : escapeHTML(String(cell))))
  ), '📊');

  // Edges table
  const edgeRows = thought.causalGraph.edges.map(edge => {
    const fromNode = thought.causalGraph!.nodes.find(n => n.id === edge.from);
    const toNode = thought.causalGraph!.nodes.find(n => n.id === edge.to);
    return [
      fromNode?.name || edge.from,
      '→',
      toNode?.name || edge.to,
      edge.strength !== undefined ? edge.strength.toFixed(2) : '-',
      edge.mechanism || '-',
    ];
  });
  html += renderSection('Causal Relationships', renderTable(
    ['From', '', 'To', 'Strength', 'Mechanism'],
    edgeRows
  ), '🔗');

  // Confounding warning
  const confounders = thought.causalGraph.nodes.filter(n => n.type === 'confounder');
  if (confounders.length > 0) {
    html += renderSection('⚠️ Confounding Variables', `
      <p class="text-warning">The following variables may confound causal inference:</p>
      <ul class="list-styled">
        ${confounders.map(c => `<li><strong>${escapeHTML(c.name)}</strong>: ${escapeHTML(c.description)}</li>`).join('\n')}
      </ul>
    `);
  }

  html += generateHTMLFooter(htmlStandalone);
  return html;
}

/**
 * Export causal graph to Modelica format
 */
function causalToModelica(thought: CausalThought, options: VisualExportOptions): string {
  const { modelicaPackageName, modelicaIncludeAnnotations = true, includeMetrics = true } = options;
  const packageName = modelicaPackageName || 'CausalGraph';
  const lines: string[] = [];

  lines.push(`package ${sanitizeModelicaId(packageName)}`);
  lines.push(`  "Causal analysis graph"`);
  lines.push('');

  if (!thought.causalGraph || !thought.causalGraph.nodes) {
    lines.push('  // No causal graph data');
    lines.push(`end ${sanitizeModelicaId(packageName)};`);
    return lines.join('\n');
  }

  // Causes as records
  const causes = thought.causalGraph.nodes.filter(n => n.type === 'cause');
  if (causes.length > 0) {
    lines.push('  // Causes');
    for (const cause of causes) {
      const causeId = sanitizeModelicaId(cause.id);
      lines.push(`  record Cause_${causeId}`);
      lines.push(`    constant String description = "${escapeModelicaString(cause.description)}";`);
      lines.push(`    constant String name = "${escapeModelicaString(cause.name)}";`);
      lines.push(`  end Cause_${causeId};`);
      lines.push('');
    }
  }

  // Effects as records
  const effects = thought.causalGraph.nodes.filter(n => n.type === 'effect');
  if (effects.length > 0) {
    lines.push('  // Effects');
    for (const effect of effects) {
      const effectId = sanitizeModelicaId(effect.id);
      lines.push(`  record Effect_${effectId}`);
      lines.push(`    constant String description = "${escapeModelicaString(effect.description)}";`);
      lines.push(`    constant String name = "${escapeModelicaString(effect.name)}";`);
      lines.push(`  end Effect_${effectId};`);
      lines.push('');
    }
  }

  // Causal links (edges)
  if (thought.causalGraph.edges && thought.causalGraph.edges.length > 0) {
    lines.push('  // Causal Links');
    for (let i = 0; i < thought.causalGraph.edges.length; i++) {
      const link = thought.causalGraph.edges[i];
      lines.push(`  record Link_${i + 1}`);
      lines.push(`    constant String cause = "${sanitizeModelicaId(link.from)}";`);
      lines.push(`    constant String effect = "${sanitizeModelicaId(link.to)}";`);
      if (link.strength !== undefined && includeMetrics) {
        lines.push(`    constant Real strength = ${link.strength.toFixed(3)};`);
      }
      if (link.confidence !== undefined && includeMetrics) {
        lines.push(`    constant Real confidence = ${link.confidence.toFixed(3)};`);
      }
      if (link.mechanism) {
        lines.push(`    constant String mechanism = "${escapeModelicaString(link.mechanism)}";`);
      }
      lines.push(`  end Link_${i + 1};`);
      lines.push('');
    }
  }

  if (modelicaIncludeAnnotations) {
    lines.push('  annotation(');
    lines.push('    Documentation(info="<html>');
    lines.push(`      <p>Causes: ${causes.length}</p>`);
    lines.push(`      <p>Effects: ${effects.length}</p>`);
    lines.push(`      <p>Total Nodes: ${thought.causalGraph.nodes.length}</p>`);
    lines.push(`      <p>Edges: ${thought.causalGraph.edges?.length || 0}</p>`);
    lines.push('      <p>Generated by DeepThinking MCP v7.1.0</p>');
    lines.push('    </html>")');
    lines.push('  );');
  }

  lines.push(`end ${sanitizeModelicaId(packageName)};`);

  return lines.join('\n');
}

/**
 * Export causal graph to UML/PlantUML format
 */
function causalToUML(thought: CausalThought, options: VisualExportOptions): string {
  const { umlTheme, umlDirection, includeLabels = true, includeMetrics = true } = options;

  if (!thought.causalGraph || !thought.causalGraph.nodes) {
    const emptyNodes: UmlNode[] = [
      { id: 'no_data', label: 'No causal graph data', shape: 'rectangle' }
    ];
    return generateUmlDiagram(emptyNodes, [], {
      title: 'Causal Graph',
      theme: umlTheme,
      direction: umlDirection,
    });
  }

  const nodes: UmlNode[] = [];
  const edges: UmlEdge[] = [];

  // Add cause nodes
  const causes = thought.causalGraph.nodes.filter(n => n.type === 'cause');
  for (const cause of causes) {
    const id = sanitizeModelicaId(cause.id);
    nodes.push({
      id: `cause_${id}`,
      label: includeLabels ? cause.name.substring(0, 40) : id,
      shape: 'rectangle',
      color: 'FFB74D',
    });
  }

  // Add effect nodes
  const effects = thought.causalGraph.nodes.filter(n => n.type === 'effect');
  for (const effect of effects) {
    const id = sanitizeModelicaId(effect.id);
    nodes.push({
      id: `effect_${id}`,
      label: includeLabels ? effect.name.substring(0, 40) : id,
      shape: 'rectangle',
      color: '4FC3F7',
    });
  }

  // Add mediator nodes
  const mediators = thought.causalGraph.nodes.filter(n => n.type === 'mediator');
  for (const mediator of mediators) {
    const id = sanitizeModelicaId(mediator.id);
    nodes.push({
      id: `mediator_${id}`,
      label: includeLabels ? mediator.name.substring(0, 40) : id,
      shape: 'rectangle',
      color: '81C784',
    });
  }

  // Add confounder nodes
  const confounders = thought.causalGraph.nodes.filter(n => n.type === 'confounder');
  for (const confounder of confounders) {
    const id = sanitizeModelicaId(confounder.id);
    nodes.push({
      id: `confounder_${id}`,
      label: includeLabels ? confounder.name.substring(0, 40) : id,
      shape: 'cloud',
      color: 'E57373',
    });
  }

  // Add causal link edges
  if (thought.causalGraph.edges) {
    for (const link of thought.causalGraph.edges) {
      const label = includeMetrics && link.strength !== undefined
        ? `${link.strength.toFixed(2)}`
        : undefined;

      // Find the type of source and target nodes
      const sourceNode = thought.causalGraph.nodes.find(n => n.id === link.from);
      const targetNode = thought.causalGraph.nodes.find(n => n.id === link.to);

      const sourcePrefix = sourceNode?.type || 'node';
      const targetPrefix = targetNode?.type || 'node';

      edges.push({
        source: `${sourcePrefix}_${sanitizeModelicaId(link.from)}`,
        target: `${targetPrefix}_${sanitizeModelicaId(link.to)}`,
        type: 'arrow',
        label,
      });
    }
  }

  return generateUmlDiagram(nodes, edges, {
    title: 'Causal Graph',
    theme: umlTheme,
    direction: umlDirection,
  });
}

/**
 * Export causal graph to JSON format
 */
function causalToJSON(thought: CausalThought, options: VisualExportOptions): string {
  const { jsonPrettyPrint = true, jsonIndent = 2, includeMetrics = true } = options;

  if (!thought.causalGraph || !thought.causalGraph.nodes) {
    const emptyData = {
      type: 'causal',
      title: 'Causal Graph',
      nodes: [],
      edges: [],
    };
    return jsonPrettyPrint
      ? JSON.stringify(emptyData, null, jsonIndent)
      : JSON.stringify(emptyData);
  }

  const causes = thought.causalGraph.nodes.filter(n => n.type === 'cause').map(c => ({
    id: sanitizeModelicaId(c.id),
    label: c.name,
    description: c.description,
  }));

  const effects = thought.causalGraph.nodes.filter(n => n.type === 'effect').map(e => ({
    id: sanitizeModelicaId(e.id),
    label: e.name,
    description: e.description,
  }));

  const links = (thought.causalGraph.edges || []).map(l => ({
    cause: sanitizeModelicaId(l.from),
    effect: sanitizeModelicaId(l.to),
    strength: includeMetrics ? l.strength : undefined,
    confidence: includeMetrics ? l.confidence : undefined,
    mechanism: l.mechanism,
  }));

  return generateCausalJson(
    'Causal Graph',
    'causal',
    causes,
    effects,
    links,
    {
      prettyPrint: jsonPrettyPrint,
      indent: jsonIndent,
      includeMetrics,
    }
  );
}

/**
 * Export causal graph to Markdown format
 */
function causalToMarkdown(thought: CausalThought, options: VisualExportOptions): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
    includeMetrics = true,
  } = options;

  const parts: string[] = [];

  if (!thought.causalGraph || !thought.causalGraph.nodes) {
    parts.push(section('Status', 'No causal graph data available.'));
    return mdDocument('Causal Graph Analysis', parts.join('\n'), {
      includeFrontmatter: markdownIncludeFrontmatter,
      includeTableOfContents: markdownIncludeToc,
    });
  }

  const causes = thought.causalGraph.nodes.filter(n => n.type === 'cause');
  const effects = thought.causalGraph.nodes.filter(n => n.type === 'effect');
  const mediators = thought.causalGraph.nodes.filter(n => n.type === 'mediator');
  const confounders = thought.causalGraph.nodes.filter(n => n.type === 'confounder');

  // Metrics section
  if (includeMetrics) {
    const metricsContent = keyValueSection({
      'Total Nodes': thought.causalGraph.nodes.length,
      'Edges': thought.causalGraph.edges.length,
      'Causes': causes.length,
      'Effects': effects.length,
      'Mediators': mediators.length,
      'Confounders': confounders.length,
    });
    parts.push(section('Metrics', metricsContent));
  }

  // Nodes table
  const nodeRows = thought.causalGraph.nodes.map(node => [
    node.id,
    node.name,
    node.type.toUpperCase(),
    node.description || '-',
  ]);
  parts.push(section('Nodes', table(['ID', 'Name', 'Type', 'Description'], nodeRows)));

  // Edges table
  const edgeRows = thought.causalGraph.edges.map(edge => {
    const fromNode = thought.causalGraph!.nodes.find(n => n.id === edge.from);
    const toNode = thought.causalGraph!.nodes.find(n => n.id === edge.to);
    return [
      fromNode?.name || edge.from,
      toNode?.name || edge.to,
      edge.strength !== undefined ? edge.strength.toFixed(2) : '-',
      edge.mechanism || '-',
    ];
  });
  parts.push(section('Causal Relationships', table(['From', 'To', 'Strength', 'Mechanism'], edgeRows)));

  // Confounders warning
  if (confounders.length > 0) {
    const confounderList = confounders.map(c => `**${c.name}**: ${c.description}`);
    parts.push(section('⚠️ Confounding Variables', list(confounderList)));
  }

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaidDiagram = causalGraphToMermaid(thought, 'default', true, true);
    parts.push(section('Causal Graph Diagram', mermaidBlock(mermaidDiagram)));
  }

  return mdDocument('Causal Graph Analysis', parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: {
      mode: 'causal',
      nodeCount: thought.causalGraph.nodes.length,
      edgeCount: thought.causalGraph.edges.length,
    },
  });
}
