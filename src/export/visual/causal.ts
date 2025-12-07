/**
 * Causal Visual Exporter (v7.0.2)
 * Sprint 8 Task 8.1: Causal graph export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
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
