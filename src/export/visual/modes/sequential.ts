/**
 * Sequential Visual Exporter (v7.1.0)
 * Sprint 8 Task 8.1: Sequential dependency graph export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support, GraphML, TikZ
 * Phase 11: Refactored to use shared utility modules
 */

import type { SequentialThought } from '../../../types/index.js';
import type { VisualExportOptions } from '../types.js';
import { sanitizeId } from '../utils.js';
// Mermaid utilities
import {
  generateMermaidFlowchart,
  truncateLabel,
  getMermaidColor,
  type MermaidNode,
  type MermaidEdge,
} from '../utils/mermaid.js';
// DOT utilities
import {
  generateDotGraph,
  truncateDotLabel,
  type DotNode,
  type DotEdge,
} from '../utils/dot.js';
// ASCII utilities
import {
  generateAsciiHeader,
  generateAsciiSectionHeader,
  generateAsciiBulletList,
} from '../utils/ascii.js';
// SVG utilities
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
  renderBadge,
  renderList,
} from '../utils/html.js';
import {
  sanitizeModelicaId,
  escapeModelicaString,
} from '../utils/modelica.js';
import {
  generateActivityDiagram,
} from '../utils/uml.js';
import {
  createJsonGraph,
  addNode,
  addEdge,
  addMetric,
  serializeGraph,
} from '../utils/json.js';
import {
  section,
  list,
  keyValueSection,
  mermaidBlock,
  document as mdDocument,
} from '../utils/markdown.js';

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
    case 'modelica':
      return sequentialToModelica(thought, options);
    case 'uml':
      return sequentialToUML(thought, options);
    case 'json':
      return sequentialToJSON(thought, options);
    case 'markdown':
      return sequentialToMarkdown(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function sequentialToMermaid(
  thought: SequentialThought,
  colorScheme: string,
  includeLabels: boolean
): string {
  const scheme = colorScheme as 'default' | 'pastel' | 'monochrome';
  const nodes: MermaidNode[] = [];
  const edges: MermaidEdge[] = [];

  // Current thought node
  const nodeId = sanitizeId(thought.id);
  const label = includeLabels ? truncateLabel(thought.content, 50) : nodeId;

  nodes.push({
    id: nodeId,
    label,
    shape: thought.isRevision ? 'hexagon' : 'stadium',
    style: colorScheme !== 'monochrome' ? {
      fill: thought.isRevision
        ? getMermaidColor('warning', scheme)
        : getMermaidColor('primary', scheme),
    } : undefined,
  });

  // Dependencies
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    for (const depId of thought.buildUpon) {
      const depNodeId = sanitizeId(depId);
      nodes.push({
        id: depNodeId,
        label: depNodeId,
        shape: 'rectangle',
      });
      edges.push({
        source: depNodeId,
        target: nodeId,
        style: 'arrow',
      });
    }
  }

  // Branch relationship
  if (thought.branchFrom) {
    const branchId = sanitizeId(thought.branchFrom);
    edges.push({
      source: branchId,
      target: nodeId,
      style: 'dotted',
      label: 'branch',
    });
  }

  // Revision relationship
  if (thought.revisesThought) {
    const revisedId = sanitizeId(thought.revisesThought);
    edges.push({
      source: revisedId,
      target: nodeId,
      style: 'thick',
      label: 'revises',
    });
  }

  return generateMermaidFlowchart(nodes, edges, { direction: 'TD', colorScheme: scheme });
}

function sequentialToDOT(thought: SequentialThought, includeLabels: boolean): string {
  const nodes: DotNode[] = [];
  const edges: DotEdge[] = [];

  // Current thought node
  const nodeId = sanitizeId(thought.id);
  const label = includeLabels ? truncateDotLabel(thought.content, 50) : nodeId;

  nodes.push({
    id: nodeId,
    label,
    shape: thought.isRevision ? 'hexagon' : 'box',
    style: ['rounded', 'filled'],
    fillColor: thought.isRevision ? '#ffd699' : '#a8d5ff',
  });

  // Dependencies
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    for (const depId of thought.buildUpon) {
      const depNodeId = sanitizeId(depId);
      nodes.push({
        id: depNodeId,
        label: depNodeId,
        shape: 'box',
        style: 'rounded',
      });
      edges.push({
        source: depNodeId,
        target: nodeId,
      });
    }
  }

  // Branch relationship
  if (thought.branchFrom) {
    const branchId = sanitizeId(thought.branchFrom);
    edges.push({
      source: branchId,
      target: nodeId,
      style: 'dashed',
      label: 'branch',
    });
  }

  // Revision relationship
  if (thought.revisesThought) {
    const revisedId = sanitizeId(thought.revisesThought);
    edges.push({
      source: revisedId,
      target: nodeId,
      style: 'bold',
      label: 'revises',
    });
  }

  return generateDotGraph(nodes, edges, {
    graphName: 'SequentialDependency',
    rankDir: 'TB',
    nodeDefaults: { shape: 'box', style: 'rounded' },
  });
}

function sequentialToASCII(thought: SequentialThought): string {
  const lines: string[] = [];

  // Title
  lines.push(generateAsciiHeader('Sequential Dependency Graph', 'equals'));
  lines.push('');

  // Current thought
  lines.push(`Current Thought: ${thought.id}`);
  lines.push(`Content: ${thought.content.substring(0, 100)}...`);
  lines.push('');

  // Dependencies
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    lines.push(generateAsciiSectionHeader('Builds Upon'));
    lines.push(generateAsciiBulletList(
      thought.buildUpon.map(depId => `↓ ${depId}`),
      'asciiBullet',
      0
    ));
    lines.push('');
  }

  // Branch info
  if (thought.branchFrom) {
    lines.push(generateAsciiSectionHeader('Branch Information'));
    lines.push(`  Branches From: ${thought.branchFrom}`);
    if (thought.branchId) {
      lines.push(`  Branch ID: ${thought.branchId}`);
    }
    lines.push('');
  }

  // Revision info
  if (thought.revisesThought) {
    lines.push(generateAsciiSectionHeader('Revision Information'));
    lines.push(`  Revises: ${thought.revisesThought}`);
    if (thought.revisionReason) {
      lines.push(`  Reason: ${thought.revisionReason}`);
    }
    lines.push('');
  }

  return lines.join('\n');
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

/**
 * Export sequential dependency graph to Modelica format
 */
function sequentialToModelica(thought: SequentialThought, options: VisualExportOptions): string {
  const { modelicaPackageName, modelicaIncludeAnnotations = true } = options;
  const packageName = modelicaPackageName || 'SequentialDependency';
  const lines: string[] = [];

  lines.push(`package ${sanitizeModelicaId(packageName)}`);
  lines.push(`  "Sequential dependency graph for thought ${sanitizeId(thought.id)}"`);
  lines.push('');

  // Current thought
  lines.push('  record CurrentThought');
  lines.push(`    constant String id = "${sanitizeModelicaId(thought.id)}";`);
  lines.push(`    constant Integer thoughtNumber = ${thought.thoughtNumber};`);
  lines.push(`    constant Integer totalThoughts = ${thought.totalThoughts};`);
  lines.push(`    constant Boolean isRevision = ${thought.isRevision || false};`);
  lines.push(`    constant Boolean nextThoughtNeeded = ${thought.nextThoughtNeeded};`);
  lines.push('  end CurrentThought;');
  lines.push('');

  // Dependencies
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    lines.push('  // Dependencies');
    lines.push('  type Dependency = enumeration(');
    for (let i = 0; i < thought.buildUpon.length; i++) {
      const dep = thought.buildUpon[i];
      const comma = i < thought.buildUpon.length - 1 ? ',' : '';
      lines.push(`    ${sanitizeModelicaId(dep)} "${escapeModelicaString(dep)}"${comma}`);
    }
    lines.push('  );');
    lines.push('');
  }

  // Branch info
  if (thought.branchFrom) {
    lines.push('  record BranchInfo');
    lines.push(`    constant String branchFrom = "${sanitizeModelicaId(thought.branchFrom)}";`);
    if (thought.branchId) {
      lines.push(`    constant String branchId = "${sanitizeModelicaId(thought.branchId)}";`);
    }
    lines.push('  end BranchInfo;');
    lines.push('');
  }

  // Revision info
  if (thought.revisesThought) {
    lines.push('  record RevisionInfo');
    lines.push(`    constant String revisesThought = "${sanitizeModelicaId(thought.revisesThought)}";`);
    if (thought.revisionReason) {
      lines.push(`    constant String revisionReason = "${escapeModelicaString(thought.revisionReason)}";`);
    }
    lines.push('  end RevisionInfo;');
    lines.push('');
  }

  if (modelicaIncludeAnnotations) {
    lines.push('  annotation(');
    lines.push('    Documentation(info="<html>');
    lines.push('      <p>Generated by DeepThinking MCP v7.1.0</p>');
    lines.push('    </html>")');
    lines.push('  );');
  }

  lines.push(`end ${sanitizeModelicaId(packageName)};`);

  return lines.join('\n');
}

/**
 * Export sequential dependency graph to UML/PlantUML format
 */
function sequentialToUML(thought: SequentialThought, options: VisualExportOptions): string {
  const { umlTheme, umlDirection } = options;

  // Build activity list from dependencies + current thought
  const activities: string[] = [];
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    for (const dep of thought.buildUpon) {
      activities.push(dep);
    }
  }
  activities.push(thought.content.substring(0, 50) + '...');

  return generateActivityDiagram(activities, thought.content.substring(0, 50) + '...', {
    title: 'Sequential Dependency Graph',
    theme: umlTheme,
    direction: umlDirection,
  });
}

/**
 * Export sequential dependency graph to JSON format
 */
function sequentialToJSON(thought: SequentialThought, options: VisualExportOptions): string {
  const { jsonPrettyPrint = true, jsonIndent = 2, includeMetrics = true } = options;

  const graph = createJsonGraph('Sequential Dependency Graph', 'sequential', {
    prettyPrint: jsonPrettyPrint,
    indent: jsonIndent,
    includeMetrics,
  });

  // Add dependency nodes
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    for (let i = 0; i < thought.buildUpon.length; i++) {
      const dep = thought.buildUpon[i];
      addNode(graph, {
        id: sanitizeId(dep),
        label: dep,
        type: 'dependency',
        x: i * 150,
        y: 0,
        color: '#e0e0e0',
        shape: 'rectangle',
      });
    }
  }

  // Add current thought node
  addNode(graph, {
    id: sanitizeId(thought.id),
    label: thought.content.substring(0, 50) + '...',
    type: thought.isRevision ? 'revision' : 'current',
    x: (thought.buildUpon?.length || 0) * 75,
    y: 100,
    color: thought.isRevision ? '#ffd699' : '#a8d5ff',
    shape: 'stadium',
    metadata: {
      thoughtNumber: thought.thoughtNumber,
      totalThoughts: thought.totalThoughts,
      isRevision: thought.isRevision,
      nextThoughtNeeded: thought.nextThoughtNeeded,
    },
  });

  // Add edges from dependencies to current thought
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    for (let i = 0; i < thought.buildUpon.length; i++) {
      const dep = thought.buildUpon[i];
      addEdge(graph, {
        id: `edge_${i}`,
        source: sanitizeId(dep),
        target: sanitizeId(thought.id),
        directed: true,
        style: 'solid',
      });
    }
  }

  // Add metrics
  if (includeMetrics && graph.metrics) {
    addMetric(graph, 'thoughtNumber', thought.thoughtNumber);
    addMetric(graph, 'totalThoughts', thought.totalThoughts);
    addMetric(graph, 'dependencyCount', thought.buildUpon?.length || 0);
    addMetric(graph, 'isRevision', thought.isRevision || false);
    addMetric(graph, 'nextThoughtNeeded', thought.nextThoughtNeeded);
  }

  return serializeGraph(graph, { prettyPrint: jsonPrettyPrint, indent: jsonIndent });
}

/**
 * Export sequential dependency graph to Markdown format
 */
function sequentialToMarkdown(thought: SequentialThought, options: VisualExportOptions): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
  } = options;

  const parts: string[] = [];

  // Overview section
  const overviewContent = keyValueSection({
    'Thought Number': `${thought.thoughtNumber} of ${thought.totalThoughts}`,
    'Status': thought.nextThoughtNeeded ? 'In Progress' : 'Complete',
    'Revision': thought.isRevision ? 'Yes' : 'No',
  });
  parts.push(section('Overview', overviewContent));

  // Current thought content
  parts.push(section('Current Thought', thought.content));

  // Dependencies
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    parts.push(section('Dependencies (Builds Upon)', list(thought.buildUpon)));
  }

  // Branch information
  if (thought.branchFrom) {
    const branchContent = keyValueSection({
      'Branched From': thought.branchFrom,
      ...(thought.branchId ? { 'Branch ID': thought.branchId } : {}),
    });
    parts.push(section('Branch Information', branchContent));
  }

  // Revision information
  if (thought.isRevision && thought.revisesThought) {
    const revisionContent = keyValueSection({
      'Revises': thought.revisesThought,
      ...(thought.revisionReason ? { 'Reason': thought.revisionReason } : {}),
    });
    parts.push(section('Revision Information', revisionContent));
  }

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaidDiagram = sequentialToMermaid(thought, 'default', true);
    parts.push(section('Dependency Graph', mermaidBlock(mermaidDiagram)));
  }

  return mdDocument('Sequential Dependency Analysis', parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: {
      mode: 'sequential',
      thoughtNumber: thought.thoughtNumber,
      totalThoughts: thought.totalThoughts,
    },
  });
}
