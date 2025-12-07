/**
 * Temporal Visual Exporter (v7.0.3)
 * Sprint 8 Task 8.1: Timeline export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 */

import type { TemporalThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';
import {
  generateSVGHeader,
  generateSVGFooter,
  renderRectNode,
  renderEllipseNode,
  renderHorizontalEdge,
  renderLegend,
  getNodeColor,
  layoutNodesHorizontally,
  DEFAULT_SVG_OPTIONS,
} from './svg-utils.js';
import {
  createLinearGraphML,
} from './graphml-utils.js';
import {
  createLinearTikZ,
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

/**
 * Export temporal timeline to visual format
 */
export function exportTemporalTimeline(thought: TemporalThought, options: VisualExportOptions): string {
  const { format, includeLabels = true } = options;

  switch (format) {
    case 'mermaid':
      return timelineToMermaidGantt(thought, includeLabels);
    case 'dot':
      return timelineToDOT(thought, includeLabels);
    case 'ascii':
      return timelineToASCII(thought);
    case 'svg':
      return timelineToSVG(thought, options);
    case 'graphml':
      return timelineToGraphML(thought, options);
    case 'tikz':
      return timelineToTikZ(thought, options);
    case 'html':
      return timelineToHTML(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function timelineToMermaidGantt(thought: TemporalThought, includeLabels: boolean): string {
  let gantt = 'gantt\n';
  gantt += `  title ${thought.timeline?.name || 'Timeline'}\n`;
  gantt += '  dateFormat X\n';
  gantt += '  axisFormat %s\n\n';

  if (!thought.events || thought.events.length === 0) {
    return gantt + '  No events\n';
  }

  gantt += '  section Events\n';

  for (const event of thought.events) {
    const label = includeLabels ? event.name : event.id;

    if (event.type === 'instant') {
      gantt += `  ${label} :milestone, ${event.timestamp}, 0s\n`;
    } else if (event.type === 'interval' && event.duration) {
      gantt += `  ${label} :${event.timestamp}, ${event.duration}s\n`;
    }
  }

  return gantt;
}

function timelineToDOT(thought: TemporalThought, includeLabels: boolean): string {
  let dot = 'digraph Timeline {\n';
  dot += '  rankdir=LR;\n';
  dot += '  node [shape=box];\n\n';

  if (!thought.events) {
    dot += '}\n';
    return dot;
  }

  const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);

  for (const event of sortedEvents) {
    const nodeId = sanitizeId(event.id);
    const label = includeLabels ? `${event.name}\\n(t=${event.timestamp})` : nodeId;
    const shape = event.type === 'instant' ? 'ellipse' : 'box';

    dot += `  ${nodeId} [label="${label}", shape=${shape}];\n`;
  }

  dot += '\n';

  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const from = sanitizeId(sortedEvents[i].id);
    const to = sanitizeId(sortedEvents[i + 1].id);
    dot += `  ${from} -> ${to};\n`;
  }

  if (thought.relations) {
    dot += '\n  // Causal relations\n';
    for (const rel of thought.relations) {
      const from = sanitizeId(rel.from);
      const to = sanitizeId(rel.to);
      dot += `  ${from} -> ${to} [style=dashed, label="${rel.relationType}"];\n`;
    }
  }

  dot += '}\n';
  return dot;
}

function timelineToASCII(thought: TemporalThought): string {
  let ascii = `Timeline: ${thought.timeline?.name || 'Untitled'}\n`;
  ascii += '='.repeat(40) + '\n\n';

  if (!thought.events || thought.events.length === 0) {
    return ascii + 'No events\n';
  }

  const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);

  for (const event of sortedEvents) {
    const marker = event.type === 'instant' ? '⦿' : '━';
    ascii += `t=${event.timestamp.toString().padStart(4)} ${marker} ${event.name}\n`;
    if (event.duration) {
      ascii += `       ${'└'.padStart(5)}→ duration: ${event.duration}\n`;
    }
  }

  return ascii;
}

/**
 * Export temporal timeline to GraphML format
 */
function timelineToGraphML(thought: TemporalThought, _options: VisualExportOptions): string {
  if (!thought.events || thought.events.length === 0) {
    return createLinearGraphML([], {
      graphName: thought.timeline?.name || 'Timeline',
      directed: true,
    });
  }

  const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);
  const labels = sortedEvents.map(event => event.name);

  return createLinearGraphML(labels, {
    graphName: thought.timeline?.name || 'Timeline',
    directed: true,
  });
}

/**
 * Export temporal timeline to TikZ format
 */
function timelineToTikZ(thought: TemporalThought, _options: VisualExportOptions): string {
  if (!thought.events || thought.events.length === 0) {
    return createLinearTikZ([], {
      title: thought.timeline?.name || 'Timeline',
    });
  }

  const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);
  const labels = sortedEvents.map(event => event.name);

  return createLinearTikZ(labels, {
    title: thought.timeline?.name || 'Timeline',
  });
}

/**
 * Export temporal timeline to native SVG format
 */
function timelineToSVG(thought: TemporalThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeLabels = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = 300,
  } = options;

  const title = thought.timeline?.name || 'Timeline';

  if (!thought.events || thought.events.length === 0) {
    return generateSVGHeader(svgWidth, 200, title) +
      '\n  <text x="400" y="100" text-anchor="middle" class="subtitle">No events</text>\n' +
      generateSVGFooter();
  }

  const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);

  // Create nodes from events
  const nodes = sortedEvents.map(event => ({
    id: event.id,
    label: includeLabels ? event.name : event.id,
    type: event.type,
  }));

  const positions = layoutNodesHorizontally(nodes, {
    width: svgWidth,
    height: svgHeight,
    nodeWidth: 120,
    nodeHeight: 40,
    nodeSpacing: 30,
  });

  let svg = generateSVGHeader(svgWidth, svgHeight, title);

  // Render timeline axis
  const axisY = svgHeight / 2 + 40;
  svg += `\n  <!-- Timeline Axis -->\n  <line x1="40" y1="${axisY}" x2="${svgWidth - 40}" y2="${axisY}" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>`;

  // Render edges between consecutive events
  svg += '\n\n  <!-- Edges -->\n  <g class="edges">';
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const fromPos = positions.get(sortedEvents[i].id);
    const toPos = positions.get(sortedEvents[i + 1].id);
    if (fromPos && toPos) {
      svg += renderHorizontalEdge(fromPos, toPos, {});
    }
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  for (const event of sortedEvents) {
    const pos = positions.get(event.id);
    if (pos) {
      const colors = event.type === 'instant'
        ? getNodeColor('primary', colorScheme)
        : getNodeColor('secondary', colorScheme);

      if (event.type === 'instant') {
        svg += renderEllipseNode(pos, colors);
      } else {
        svg += renderRectNode(pos, colors);
      }

      // Add timestamp label below node
      svg += `\n    <text x="${pos.x}" y="${pos.y + pos.height + 15}" text-anchor="middle" class="edge-label">t=${event.timestamp}</text>`;
    }
  }
  svg += '\n  </g>';

  // Render legend
  const legendItems = [
    { label: 'Instant', color: getNodeColor('primary', colorScheme), shape: 'ellipse' as const },
    { label: 'Interval', color: getNodeColor('secondary', colorScheme) },
  ];
  svg += renderLegend(20, svgHeight - 60, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}

/**
 * Export temporal timeline to HTML format
 */
function timelineToHTML(thought: TemporalThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = thought.timeline?.name || 'Timeline Analysis',
    htmlTheme = 'light',
    includeMetrics = true,
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  if (!thought.events || thought.events.length === 0) {
    html += '<p class="text-secondary">No events in timeline.</p>\n';
    html += generateHTMLFooter(htmlStandalone);
    return html;
  }

  const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);

  // Metrics section
  if (includeMetrics) {
    const instants = sortedEvents.filter(e => e.type === 'instant');
    const intervals = sortedEvents.filter(e => e.type === 'interval');
    const minTime = sortedEvents[0].timestamp;
    const maxTime = sortedEvents[sortedEvents.length - 1].timestamp;

    html += '<div class="metrics-grid">';
    html += renderMetricCard('Total Events', sortedEvents.length, 'primary');
    html += renderMetricCard('Instants', instants.length, 'info');
    html += renderMetricCard('Intervals', intervals.length, 'success');
    html += renderMetricCard('Time Span', `${minTime} - ${maxTime}`);
    html += '</div>\n';
  }

  // Events table
  const eventRows = sortedEvents.map(event => {
    const typeBadge = renderBadge(event.type, event.type === 'instant' ? 'info' : 'success');
    return [
      event.timestamp.toString(),
      event.name,
      typeBadge,
      event.duration ? `${event.duration}` : '-',
      event.description || '-',
    ];
  });
  html += renderSection('Events', renderTable(
    ['Timestamp', 'Name', 'Type', 'Duration', 'Description'],
    eventRows.map(row => row.map(cell => typeof cell === 'string' && cell.startsWith('<') ? cell : escapeHTML(String(cell))))
  ), '📅');

  // Relations section
  if (thought.relations && thought.relations.length > 0) {
    const relationRows = thought.relations.map(rel => {
      const fromEvent = thought.events?.find(e => e.id === rel.from);
      const toEvent = thought.events?.find(e => e.id === rel.to);
      return [
        fromEvent?.name || rel.from,
        rel.relationType,
        toEvent?.name || rel.to,
      ];
    });
    html += renderSection('Temporal Relations', renderTable(
      ['From', 'Relation', 'To'],
      relationRows
    ), '🔗');
  }

  html += generateHTMLFooter(htmlStandalone);
  return html;
}
