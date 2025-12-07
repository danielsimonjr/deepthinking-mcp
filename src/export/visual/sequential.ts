/**
 * Sequential Visual Exporter (v7.0.3)
 * Sprint 8 Task 8.1: Sequential dependency graph export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support, GraphML, TikZ
 */

import type { SequentialThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';
import {
  generateSVGHeader,
  generateSVGFooter,
  renderRectNode,
  renderStadiumNode,
  renderEdge,
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
  renderBadge,
  renderList,
} from './html-utils.js';

/**
 * Export sequential dependency graph to visual format
 */
export function exportSequentialDependencyGraph(thought: SequentialThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true } = options;

  switch (format) {
    case 'mermaid':
      return sequentialToMermaid(thought, colorScheme, includeLabels);
    case 'dot':
      return sequentialToDOT(thought, includeLabels);
    case 'ascii':
      return sequentialToASCII(thought);
    case 'svg':
      return sequentialToSVG(thought, options);
    case 'graphml':
      return sequentialToGraphML(thought, options);
    case 'tikz':
      return sequentialToTikZ(thought, options);
    case 'html':
      return sequentialToHTML(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function sequentialToMermaid(
  thought: SequentialThought,
  colorScheme: string,
  includeLabels: boolean
): string {
  let mermaid = 'graph TD\n';

  const nodeId = sanitizeId(thought.id);
  const label = includeLabels ? thought.content.substring(0, 50) + '...' : nodeId;

  mermaid += `  ${nodeId}["${label}"]\n`;

  if (thought.buildUpon && thought.buildUpon.length > 0) {
    mermaid += '\n';
    for (const depId of thought.buildUpon) {
      const depNodeId = sanitizeId(depId);
      mermaid += `  ${depNodeId} --> ${nodeId}\n`;
    }
  }

  if (thought.branchFrom) {
    const branchId = sanitizeId(thought.branchFrom);
    mermaid += `  ${branchId} -.->|branch| ${nodeId}\n`;
  }

  if (thought.revisesThought) {
    const revisedId = sanitizeId(thought.revisesThought);
    mermaid += `  ${revisedId} ==>|revises| ${nodeId}\n`;
  }

  if (colorScheme !== 'monochrome') {
    mermaid += '\n';
    const color = thought.isRevision
      ? (colorScheme === 'pastel' ? '#fff3e0' : '#ffd699')
      : (colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff');
    mermaid += `  style ${nodeId} fill:${color}\n`;
  }

  return mermaid;
}

function sequentialToDOT(thought: SequentialThought, includeLabels: boolean): string {
  let dot = 'digraph SequentialDependency {\n';
  dot += '  rankdir=TD;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  const nodeId = sanitizeId(thought.id);
  const label = includeLabels ? thought.content.substring(0, 50) + '...' : nodeId;

  dot += `  ${nodeId} [label="${label}"];\n`;

  if (thought.buildUpon && thought.buildUpon.length > 0) {
    for (const depId of thought.buildUpon) {
      const depNodeId = sanitizeId(depId);
      dot += `  ${depNodeId} -> ${nodeId};\n`;
    }
  }

  if (thought.branchFrom) {
    const branchId = sanitizeId(thought.branchFrom);
    dot += `  ${branchId} -> ${nodeId} [style=dashed, label="branch"];\n`;
  }

  if (thought.revisesThought) {
    const revisedId = sanitizeId(thought.revisesThought);
    dot += `  ${revisedId} -> ${nodeId} [style=bold, label="revises"];\n`;
  }

  dot += '}\n';
  return dot;
}

function sequentialToASCII(thought: SequentialThought): string {
  let ascii = 'Sequential Dependency Graph:\n';
  ascii += '============================\n\n';

  ascii += `Current Thought: ${thought.id}\n`;
  ascii += `Content: ${thought.content.substring(0, 100)}...\n\n`;

  if (thought.buildUpon && thought.buildUpon.length > 0) {
    ascii += 'Builds Upon:\n';
    for (const depId of thought.buildUpon) {
      ascii += `  ↓ ${depId}\n`;
    }
    ascii += '\n';
  }

  if (thought.branchFrom) {
    ascii += `Branches From: ${thought.branchFrom}\n`;
    if (thought.branchId) {
      ascii += `Branch ID: ${thought.branchId}\n`;
    }
    ascii += '\n';
  }

  if (thought.revisesThought) {
    ascii += `Revises: ${thought.revisesThought}\n`;
    if (thought.revisionReason) {
      ascii += `Reason: ${thought.revisionReason}\n`;
    }
    ascii += '\n';
  }

  return ascii;
}

/**
 * Export sequential dependency graph to native SVG format
 */
function sequentialToSVG(thought: SequentialThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeLabels = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
  } = options;

  const nodeWidth = 160;
  const nodeHeight = 50;
  const padding = 40;
  const verticalSpacing = 80;

  // Build node positions
  const positions = new Map<string, SVGNodePosition>();
  let currentY = padding + 40;

  // Main thought node
  const mainNodeId = sanitizeId(thought.id);
  const mainLabel = includeLabels ? thought.content.substring(0, 40) + '...' : mainNodeId;

  // Position dependencies first
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    const depWidth = thought.buildUpon.length * (nodeWidth + 20) - 20;
    let startX = (svgWidth - depWidth) / 2;

    for (const depId of thought.buildUpon) {
      const depNodeId = sanitizeId(depId);
      positions.set(depId, {
        id: depId,
        x: startX,
        y: currentY,
        width: nodeWidth,
        height: nodeHeight,
        label: depNodeId,
        type: 'dependency',
      });
      startX += nodeWidth + 20;
    }
    currentY += nodeHeight + verticalSpacing;
  }

  // Main node
  positions.set(thought.id, {
    id: thought.id,
    x: (svgWidth - nodeWidth) / 2,
    y: currentY,
    width: nodeWidth,
    height: nodeHeight,
    label: mainLabel,
    type: thought.isRevision ? 'revision' : 'main',
  });
  currentY += nodeHeight + padding;

  const actualHeight = currentY + 80;

  let svg = generateSVGHeader(svgWidth, actualHeight, 'Sequential Dependency Graph');

  // Render edges
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  if (thought.buildUpon) {
    for (const depId of thought.buildUpon) {
      const fromPos = positions.get(depId);
      const toPos = positions.get(thought.id);
      if (fromPos && toPos) {
        svg += renderEdge(fromPos, toPos, {});
      }
    }
  }
  if (thought.branchFrom) {
    const branchLabel = 'branch';
    svg += `\n    <text x="${svgWidth / 2 - 100}" y="${padding + 20}" class="edge-label">${branchLabel} from: ${thought.branchFrom}</text>`;
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  for (const [, pos] of positions) {
    const colors = pos.type === 'revision'
      ? getNodeColor('warning', colorScheme)
      : pos.type === 'main'
        ? getNodeColor('primary', colorScheme)
        : getNodeColor('neutral', colorScheme);

    if (pos.type === 'main' || pos.type === 'revision') {
      svg += renderStadiumNode(pos, colors);
    } else {
      svg += renderRectNode(pos, colors);
    }
  }
  svg += '\n  </g>';

  // Render legend
  const legendItems = [
    { label: 'Current', color: getNodeColor('primary', colorScheme) },
    { label: 'Revision', color: getNodeColor('warning', colorScheme) },
    { label: 'Dependency', color: getNodeColor('neutral', colorScheme) },
  ];
  svg += renderLegend(20, actualHeight - 80, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}

/**
 * Export sequential dependency graph to GraphML format
 */
function sequentialToGraphML(thought: SequentialThought, options: VisualExportOptions): string {
  const { includeLabels = true } = options;

  // Build nodes from thought dependencies (buildUpon) and current thought
  const nodes: GraphMLNode[] = [];
  const edges: GraphMLEdge[] = [];

  // If thought has buildUpon dependencies, use them to create a sequential chain
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    // Add dependency nodes
    thought.buildUpon.forEach((depId, index) => {
      nodes.push({
        id: sanitizeId(depId),
        label: includeLabels ? `Step ${index + 1}: ${depId}` : sanitizeId(depId),
        type: 'dependency',
      });
    });

    // Add current thought as final node
    nodes.push({
      id: sanitizeId(thought.id),
      label: includeLabels ? `Step ${nodes.length + 1}: ${thought.content.substring(0, 50)}...` : sanitizeId(thought.id),
      type: 'current',
    });

    // Create edges linking sequential steps
    thought.buildUpon.forEach((depId, index) => {
      const sourceId = sanitizeId(depId);
      const targetId = index < thought.buildUpon!.length - 1
        ? sanitizeId(thought.buildUpon![index + 1])
        : sanitizeId(thought.id);

      edges.push({
        id: `e${index}`,
        source: sourceId,
        target: targetId,
        directed: true,
      });
    });
  } else {
    // Handle empty case - just show the current thought
    nodes.push({
      id: sanitizeId(thought.id),
      label: includeLabels ? thought.content.substring(0, 100) : sanitizeId(thought.id),
      type: 'current',
    });
  }

  return generateGraphML(nodes, edges, {
    graphName: 'Sequential Dependency Graph',
    directed: true,
    includeLabels,
  });
}

/**
 * Export sequential dependency graph to TikZ format
 */
function sequentialToTikZ(thought: SequentialThought, options: VisualExportOptions): string {
  const { includeLabels = true, colorScheme = 'default' } = options;

  // Build nodes from thought dependencies (buildUpon) and current thought
  const nodes: TikZNode[] = [];
  const edges: TikZEdge[] = [];

  // If thought has buildUpon dependencies, use them to create a sequential chain
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    // Add dependency nodes (completed steps)
    thought.buildUpon.forEach((depId, index) => {
      nodes.push({
        id: sanitizeId(depId),
        label: includeLabels ? `Step ${index + 1}` : sanitizeId(depId),
        x: index * 3,
        y: 0,
        type: 'success', // Completed steps
        shape: 'rectangle',
      });
    });

    // Add current thought as final node (current step)
    nodes.push({
      id: sanitizeId(thought.id),
      label: includeLabels ? `Step ${nodes.length + 1}` : sanitizeId(thought.id),
      x: nodes.length * 3,
      y: 0,
      type: 'primary', // Current step
      shape: 'rectangle',
    });

    // Create edges between consecutive steps
    thought.buildUpon.forEach((depId, index) => {
      const sourceId = sanitizeId(depId);
      const targetId = index < thought.buildUpon!.length - 1
        ? sanitizeId(thought.buildUpon![index + 1])
        : sanitizeId(thought.id);

      edges.push({
        source: sourceId,
        target: targetId,
        directed: true,
      });
    });
  } else {
    // Handle empty case - just show the current thought
    nodes.push({
      id: sanitizeId(thought.id),
      label: includeLabels ? 'Current' : sanitizeId(thought.id),
      x: 0,
      y: 0,
      type: 'primary',
      shape: 'rectangle',
    });
  }

  return generateTikZ(nodes, edges, {
    title: 'Sequential Dependency Graph',
    colorScheme,
    includeLabels,
  });
}

/**
 * Export sequential dependency graph to HTML format
 */
function sequentialToHTML(thought: SequentialThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Sequential Thinking Analysis',
    htmlTheme = 'light',
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // Metrics
  html += '<div class="metrics-grid">';
  html += renderMetricCard('Thought #', thought.thoughtNumber, 'primary');
  html += renderMetricCard('Total', thought.totalThoughts, 'info');
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    html += renderMetricCard('Dependencies', thought.buildUpon.length, 'secondary');
  }
  html += '</div>\n';

  // Current thought
  const badges = [];
  if (thought.isRevision) badges.push(renderBadge('Revision', 'warning'));
  if (thought.branchFrom) badges.push(renderBadge('Branched', 'info'));

  html += renderSection('Current Thought', `
    <div class="flex gap-1" style="margin-bottom: 0.5rem">${badges.join(' ')}</div>
    <p>${escapeHTML(thought.content)}</p>
    ${thought.nextThoughtNeeded ? '<p class="text-info">More thoughts needed...</p>' : '<p class="text-success">Reasoning complete.</p>'}
  `, '💭');

  // Dependencies
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    html += renderSection('Builds Upon', renderList(thought.buildUpon), '🔗');
  }

  // Branch info
  if (thought.branchFrom) {
    html += renderSection('Branch Information', `
      <p><strong>Branched from:</strong> ${escapeHTML(thought.branchFrom)}</p>
      ${thought.branchId ? `<p><strong>Branch ID:</strong> ${escapeHTML(thought.branchId)}</p>` : ''}
    `, '🌿');
  }

  // Revision info
  if (thought.isRevision && thought.revisesThought) {
    html += renderSection('Revision Information', `
      <p><strong>Revises:</strong> ${escapeHTML(thought.revisesThought)}</p>
      ${thought.revisionReason ? `<p><strong>Reason:</strong> ${escapeHTML(thought.revisionReason)}</p>` : ''}
    `, '✏️');
  }

  html += generateHTMLFooter(htmlStandalone);
  return html;
}
