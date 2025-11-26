/**
 * Temporal Visual Exporter (v4.3.0)
 * Sprint 8 Task 8.1: Timeline export to Mermaid, DOT, ASCII
 */

import type { TemporalThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';

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
