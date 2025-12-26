/**
 * Temporal Visual Exporter (v8.5.0)
 * Sprint 8 Task 8.1: Timeline export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 * Phase 13 Sprint 9: Refactored to use fluent builder classes
 * Note: Mermaid gantt diagrams kept as raw strings (not supported by MermaidGraphBuilder)
 */

import type { TemporalThought } from '../../../types/index.js';
import type { VisualExportOptions } from '../types.js';
import { sanitizeId } from '../utils.js';
// Builder classes (Phase 13)
import { DOTGraphBuilder } from '../utils/dot.js';
import { ASCIIDocBuilder } from '../utils/ascii.js';
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
} from '../utils/svg.js';
import {
  createLinearGraphML,
} from '../utils/graphml.js';
import {
  createLinearTikZ,
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
  sanitizeModelicaId,
  escapeModelicaString,
} from '../utils/modelica.js';
import {
  generateStateDiagram,
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
  table,
  keyValueSection,
  mermaidBlock,
  document as mdDocument,
} from '../utils/markdown.js';

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
    case 'modelica':
      return temporalToModelica(thought, options);
    case 'uml':
      return temporalToUML(thought, options);
    case 'json':
      return temporalToJSON(thought, options);
    case 'markdown':
      return temporalToMarkdown(thought, options);
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
  const builder = new DOTGraphBuilder()
    .setGraphName('Timeline')
    .setRankDir('LR')
    .setNodeDefaults({ shape: 'box' });

  if (!thought.events) {
    return builder.render();
  }

  const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);

  // Add event nodes
  for (const event of sortedEvents) {
    const nodeId = sanitizeId(event.id);
    const label = includeLabels ? `${event.name}\\n(t=${event.timestamp})` : nodeId;
    const shape = event.type === 'instant' ? 'ellipse' : 'box';

    builder.addNode({ id: nodeId, label, shape });
  }

  // Add sequential edges between events
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const from = sanitizeId(sortedEvents[i].id);
    const to = sanitizeId(sortedEvents[i + 1].id);
    builder.addEdge({ source: from, target: to });
  }

  // Add causal relation edges
  if (thought.relations) {
    for (const rel of thought.relations) {
      const from = sanitizeId(rel.from);
      const to = sanitizeId(rel.to);
      builder.addEdge({
        source: from,
        target: to,
        style: 'dashed',
        label: rel.relationType,
      });
    }
  }

  return builder.render();
}

function timelineToASCII(thought: TemporalThought): string {
  const builder = new ASCIIDocBuilder()
    .setMaxWidth(60)
    .addHeader(`Timeline: ${thought.timeline?.name || 'Untitled'}`);

  if (!thought.events || thought.events.length === 0) {
    builder.addText('No events\n');
    return builder.render();
  }

  const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);

  builder.addSection('Events');
  for (const event of sortedEvents) {
    const marker = event.type === 'instant' ? '⦿' : '━';
    builder.addText(`t=${event.timestamp.toString().padStart(4)} ${marker} ${event.name}\n`);
    if (event.duration) {
      builder.addText(`       ${'└'.padStart(5)}→ duration: ${event.duration}\n`);
    }
  }

  return builder.render();
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

/**
 * Export temporal timeline to Modelica format
 */
function temporalToModelica(thought: TemporalThought, _options: VisualExportOptions): string {
  const pkgName = sanitizeModelicaId(thought.timeline?.name || 'Timeline');
  let modelica = `package ${pkgName}\n`;
  modelica += `  "${escapeModelicaString(thought.timeline?.name || 'Timeline')} - Temporal Event System"\n\n`;

  if (!thought.events || thought.events.length === 0) {
    modelica += '  // No events\n';
    modelica += `end ${pkgName};\n`;
    return modelica;
  }

  const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);

  // Define event records
  modelica += '  // Event Records\n';
  for (const event of sortedEvents) {
    const eventId = sanitizeModelicaId(event.id);
    modelica += `  record ${eventId}\n`;
    modelica += `    "${event.name ? escapeModelicaString(event.name) : ''}"\n`;
    modelica += `    parameter Real timestamp = ${event.timestamp} "Event timestamp";\n`;
    if (event.duration !== undefined) {
      modelica += `    parameter Real duration = ${event.duration} "Event duration";\n`;
    }
    modelica += `    parameter String eventType = "${event.type || 'instant'}" "Event type (instant/interval)";\n`;
    if (event.description) {
      modelica += `    parameter String description = "${escapeModelicaString(event.description)}";\n`;
    }
    modelica += `  end ${eventId};\n\n`;
  }

  // Define timeline model
  modelica += '  model TimelineModel\n';
  modelica += '    "Temporal event sequence model"\n\n';

  // Timeline parameters
  modelica += '    parameter Real timeStart = ' + sortedEvents[0].timestamp + ' "Timeline start";\n';
  modelica += '    parameter Real timeEnd = ' + sortedEvents[sortedEvents.length - 1].timestamp + ' "Timeline end";\n';
  modelica += `    parameter Integer eventCount = ${sortedEvents.length} "Total number of events";\n\n`;

  // Event instances
  modelica += '    // Event instances\n';
  for (const event of sortedEvents) {
    const eventId = sanitizeModelicaId(event.id);
    modelica += `    ${eventId} ${eventId.toLowerCase()}_inst;\n`;
  }

  // Discrete time logic
  modelica += '\n    // Timeline progression\n';
  modelica += '    discrete Real currentTime(start=timeStart);\n';
  modelica += '  equation\n';
  modelica += '    when time >= timeEnd then\n';
  modelica += '      currentTime = timeEnd;\n';
  modelica += '    end when;\n';

  modelica += '  end TimelineModel;\n\n';

  modelica += `end ${pkgName};\n`;
  return modelica;
}

/**
 * Export temporal timeline to UML format
 */
function temporalToUML(thought: TemporalThought, _options: VisualExportOptions): string {
  if (!thought.events || thought.events.length === 0) {
    return generateStateDiagram([], [], undefined, { title: thought.timeline?.name || 'Timeline' });
  }

  const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);

  // Create states from events (map to just the names)
  const states = sortedEvents.map(event => event.name);

  // Create transitions between consecutive events
  const transitions: Array<{ from: string; to: string; event?: string }> = [];
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    transitions.push({
      from: sortedEvents[i].id,
      to: sortedEvents[i + 1].id,
      event: `Δt=${sortedEvents[i + 1].timestamp - sortedEvents[i].timestamp}`,
    });
  }

  // Add causal relations as additional transitions
  if (thought.relations) {
    for (const rel of thought.relations) {
      transitions.push({
        from: rel.from,
        to: rel.to,
        event: rel.relationType,
      });
    }
  }

  return generateStateDiagram(states, transitions, undefined, { title: thought.timeline?.name || 'Timeline' });
}

/**
 * Export temporal timeline to JSON format
 */
function temporalToJSON(thought: TemporalThought, _options: VisualExportOptions): string {
  const graph = createJsonGraph(
    thought.timeline?.name || 'Timeline',
    'temporal',
    _options
  );

  if (!thought.events || thought.events.length === 0) {
    return serializeGraph(graph, _options);
  }

  const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);

  // Add event nodes
  for (const event of sortedEvents) {
    addNode(graph, {
      id: event.id,
      label: event.name,
      type: event.type,
      metadata: {
        timestamp: event.timestamp,
        duration: event.duration,
        description: event.description,
      },
    });
  }

  // Add edges between consecutive events
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    addEdge(graph, {
      id: `edge_${i}`,
      source: sortedEvents[i].id,
      target: sortedEvents[i + 1].id,
      label: 'temporal_next',
      metadata: {
        timeDelta: sortedEvents[i + 1].timestamp - sortedEvents[i].timestamp,
      },
    });
  }

  // Add causal relation edges
  if (thought.relations) {
    let relIdx = sortedEvents.length - 1;
    for (const rel of thought.relations) {
      addEdge(graph, {
        id: `edge_rel_${relIdx++}`,
        source: rel.from,
        target: rel.to,
        label: rel.relationType,
        metadata: {
          edgeType: 'causal',
        },
      });
    }
  }

  // Add metrics
  const instants = sortedEvents.filter(e => e.type === 'instant');
  const intervals = sortedEvents.filter(e => e.type === 'interval');
  addMetric(graph, 'totalEvents', sortedEvents.length);
  addMetric(graph, 'instantEvents', instants.length);
  addMetric(graph, 'intervalEvents', intervals.length);
  addMetric(graph, 'timeStart', sortedEvents[0].timestamp);
  addMetric(graph, 'timeEnd', sortedEvents[sortedEvents.length - 1].timestamp);
  addMetric(graph, 'timeSpan', sortedEvents[sortedEvents.length - 1].timestamp - sortedEvents[0].timestamp);

  return serializeGraph(graph, _options);
}

/**
 * Export temporal timeline to Markdown format
 */
function temporalToMarkdown(thought: TemporalThought, options: VisualExportOptions): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
    includeMetrics = true,
  } = options;

  const parts: string[] = [];
  const title = thought.timeline?.name || 'Timeline';

  if (!thought.events || thought.events.length === 0) {
    parts.push(section('Status', 'No events in timeline.'));
    return mdDocument(`Temporal Analysis: ${title}`, parts.join('\n'), {
      includeFrontmatter: markdownIncludeFrontmatter,
      includeTableOfContents: markdownIncludeToc,
    });
  }

  const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);
  const instants = sortedEvents.filter(e => e.type === 'instant');
  const intervals = sortedEvents.filter(e => e.type === 'interval');

  // Metrics section
  if (includeMetrics) {
    const metricsContent = keyValueSection({
      'Total Events': sortedEvents.length,
      'Instant Events': instants.length,
      'Interval Events': intervals.length,
      'Time Span': `${sortedEvents[0].timestamp} - ${sortedEvents[sortedEvents.length - 1].timestamp}`,
    });
    parts.push(section('Metrics', metricsContent));
  }

  // Events table
  const eventRows = sortedEvents.map(event => [
    event.timestamp.toString(),
    event.name,
    event.type.toUpperCase(),
    event.duration ? `${event.duration}` : '-',
    event.description || '-',
  ]);
  parts.push(section('Events', table(['Timestamp', 'Name', 'Type', 'Duration', 'Description'], eventRows)));

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
    parts.push(section('Temporal Relations', table(['From', 'Relation', 'To'], relationRows)));
  }

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaidDiagram = timelineToMermaidGantt(thought, true);
    parts.push(section('Timeline Diagram', mermaidBlock(mermaidDiagram)));
  }

  return mdDocument(`Temporal Analysis: ${title}`, parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: {
      mode: 'temporal',
      eventCount: sortedEvents.length,
    },
  });
}
