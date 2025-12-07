/**
 * Sequential Visual Exporter (v7.0.2)
 * Sprint 8 Task 8.1: Sequential dependency graph export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
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
