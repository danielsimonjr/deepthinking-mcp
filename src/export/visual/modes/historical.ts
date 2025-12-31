/**
 * Historical Visual Exporter (v9.1.0)
 * Visualizations for historical reasoning mode:
 * - Event timelines and causal chains
 * - Source relationship graphs
 * - Period diagrams
 * - Actor networks
 */

import type { HistoricalThought } from '../../../types/index.js';
import type { VisualExportOptions } from '../types.js';
import { sanitizeId } from '../utils.js';
// Builder classes (Phase 13)
import { DOTGraphBuilder } from '../utils/dot.js';
import { ASCIIDocBuilder } from '../utils/ascii.js';
import { MermaidGraphBuilder, MermaidGanttBuilder } from '../utils/mermaid.js';

/**
 * Export historical thought to visual format
 */
export function exportHistoricalTimeline(thought: HistoricalThought, options: VisualExportOptions): string {
  const { format, includeLabels = true } = options;

  switch (format) {
    case 'mermaid':
      return historicalToMermaid(thought, includeLabels);
    case 'dot':
      return historicalToDOT(thought, includeLabels);
    case 'ascii':
      return historicalToASCII(thought);
    default:
      // Fallback to Mermaid for unsupported formats
      return historicalToMermaid(thought, includeLabels);
  }
}

// ===== MERMAID EXPORT =====

function historicalToMermaid(thought: HistoricalThought, includeLabels: boolean): string {
  // Use timeline for events, flowchart for causal chains
  if (thought.causalChains && thought.causalChains.length > 0) {
    return causalChainsToMermaid(thought, includeLabels);
  }
  if (thought.events && thought.events.length > 0) {
    return eventsToMermaidGantt(thought, includeLabels);
  }
  if (thought.actors && thought.actors.length > 0) {
    return actorsToMermaid(thought, includeLabels);
  }

  return new MermaidGraphBuilder()
    .setDirection('TB')
    .addNode({ id: 'empty', label: 'No historical data to visualize' })
    .render();
}

function eventsToMermaidGantt(thought: HistoricalThought, includeLabels: boolean): string {
  const builder = new MermaidGanttBuilder()
    .setTitle('Historical Timeline')
    .setDateFormat('YYYY-MM-DD')
    .setAxisFormat('%Y');

  // Group events by period if available
  if (thought.periods && thought.periods.length > 0) {
    for (const period of thought.periods) {
      builder.addSection(period.name);
      const periodEvents = thought.events?.filter(e =>
        period.keyEvents?.includes(e.id)
      ) || [];
      for (const event of periodEvents) {
        const label = includeLabels ? event.name : event.id;
        const startDate = typeof event.date === 'string' ? event.date : event.date.start;
        builder.addTask({ id: event.id, label, start: startDate, duration: '1d' });
      }
    }
  } else {
    builder.addSection('Events');
    for (const event of thought.events || []) {
      const label = includeLabels ? event.name : event.id;
      const startDate = typeof event.date === 'string' ? event.date : event.date.start;
      builder.addTask({ id: event.id, label, start: startDate, duration: '1d' });
    }
  }

  return builder.render();
}

function causalChainsToMermaid(thought: HistoricalThought, includeLabels: boolean): string {
  const builder = new MermaidGraphBuilder()
    .setDirection('LR');

  const events = thought.events || [];
  const eventMap = new Map(events.map(e => [e.id, e]));

  // Add event nodes with dates
  for (const event of events) {
    const label = includeLabels
      ? `${event.name}<br/>(${formatDate(event.date)})`
      : event.id;
    const shape = getSignificanceShape(event.significance);
    builder.addNode({ id: sanitizeId(event.id), label, shape });
  }

  // Add causal chain links
  for (const chain of thought.causalChains || []) {
    for (const link of chain.links) {
      const fromEvent = eventMap.get(link.cause);
      const toEvent = eventMap.get(link.effect);
      if (fromEvent && toEvent) {
        builder.addEdge({
          source: sanitizeId(link.cause),
          target: sanitizeId(link.effect),
          label: link.mechanism || `${Math.round(link.confidence * 100)}%`,
        });
      }
    }
  }

  return builder.render();
}

function actorsToMermaid(thought: HistoricalThought, includeLabels: boolean): string {
  const builder = new MermaidGraphBuilder()
    .setDirection('TB');

  const actors = thought.actors || [];

  // Add actor nodes
  for (const actor of actors) {
    const label = includeLabels ? `${actor.name}\\n(${actor.type})` : actor.id;
    builder.addNode({ id: sanitizeId(actor.id), label, shape: 'rounded' });
  }

  // Add relationships
  for (const actor of actors) {
    for (const rel of actor.relationships || []) {
      builder.addEdge({
        source: sanitizeId(actor.id),
        target: sanitizeId(rel.actorId),
        label: rel.type,
      });
    }
  }

  return builder.render();
}

// ===== DOT EXPORT =====

function historicalToDOT(thought: HistoricalThought, includeLabels: boolean): string {
  const builder = new DOTGraphBuilder()
    .setGraphName('HistoricalAnalysis')
    .setRankDir('LR')
    .setNodeDefaults({ shape: 'box', style: 'filled', fillColor: 'lightblue' });

  // Add events as nodes
  for (const event of thought.events || []) {
    const nodeId = sanitizeId(event.id);
    const label = includeLabels
      ? `${event.name}\\n${formatDate(event.date)}\\n[${event.significance}]`
      : nodeId;
    const fillColor = getSignificanceColor(event.significance);
    builder.addNode({ id: nodeId, label, fillColor, shape: 'box' });
  }

  // Add causal chain edges
  for (const chain of thought.causalChains || []) {
    for (const link of chain.links) {
      builder.addEdge({
        source: sanitizeId(link.cause),
        target: sanitizeId(link.effect),
        label: link.mechanism || undefined,
        style: link.confidence < 0.5 ? 'dashed' : 'solid',
      });
    }
  }

  // Add actor subgraph if present
  if (thought.actors && thought.actors.length > 0) {
    const actorNodeIds: string[] = [];
    for (const actor of thought.actors) {
      const nodeId = sanitizeId(`actor_${actor.id}`);
      actorNodeIds.push(nodeId);
      builder.addNode({
        id: nodeId,
        label: `${actor.name}\\n(${actor.type})`,
        shape: 'ellipse',
        fillColor: 'lightyellow',
      });
    }
    builder.addSubgraph({
      id: 'actors',
      label: 'Historical Actors',
      nodes: actorNodeIds,
    });
  }

  // Add source subgraph if present
  if (thought.sources && thought.sources.length > 0) {
    const sourceNodeIds: string[] = [];
    for (const source of thought.sources) {
      const nodeId = sanitizeId(`source_${source.id}`);
      const reliability = Math.round(source.reliability * 100);
      sourceNodeIds.push(nodeId);
      builder.addNode({
        id: nodeId,
        label: `${source.title}\\n[${source.type}]\\n${reliability}% reliable`,
        shape: 'note',
        fillColor: getReliabilityColor(source.reliability),
      });
    }
    builder.addSubgraph({
      id: 'sources',
      label: 'Sources',
      nodes: sourceNodeIds,
    });
  }

  return builder.render();
}

// ===== ASCII EXPORT =====

function historicalToASCII(thought: HistoricalThought): string {
  const builder = new ASCIIDocBuilder()
    .addHeader('Historical Analysis')
    .addHorizontalRule();

  // Thought type and methodology
  const metadata: string[] = [];
  if (thought.thoughtType) {
    metadata.push(`Analysis Type: ${thought.thoughtType}`);
  }
  if (thought.historiographicalSchool) {
    metadata.push(`Historiographical School: ${thought.historiographicalSchool}`);
  }
  if (thought.methodology) {
    metadata.push(`Methodology: ${thought.methodology.approach}`);
  }
  if (metadata.length > 0) {
    builder.addBulletList(metadata);
  }

  // Events section
  if (thought.events && thought.events.length > 0) {
    builder.addEmptyLine().addSection('HISTORICAL EVENTS');
    const eventItems = thought.events.map(event => {
      const dateStr = formatDate(event.date);
      let text = `[${event.significance.toUpperCase()}] ${event.name} (${dateStr})`;
      if (event.location) {
        text += ` - ${event.location}`;
      }
      if (event.actors && event.actors.length > 0) {
        text += ` | Actors: ${event.actors.join(', ')}`;
      }
      return text;
    });
    builder.addBulletList(eventItems);
  }

  // Causal chains section
  if (thought.causalChains && thought.causalChains.length > 0) {
    builder.addEmptyLine().addSection('CAUSAL CHAINS');
    for (const chain of thought.causalChains) {
      builder.addText(`${chain.name} (Confidence: ${Math.round(chain.confidence * 100)}%)`);
      const chainSteps = chain.links.map(link => {
        let step = `${link.cause} → ${link.effect}`;
        if (link.mechanism) {
          step += ` (${link.mechanism})`;
        }
        return step;
      });
      builder.addFlowDiagram(chainSteps, 'vertical');
    }
  }

  // Sources section
  if (thought.sources && thought.sources.length > 0) {
    builder.addEmptyLine().addSection('SOURCES');
    const sourceItems = thought.sources.map(source => {
      const reliability = Math.round(source.reliability * 100);
      let text = `[${source.type.toUpperCase()}] ${source.title} (${reliability}% reliable)`;
      if (source.author) {
        text += ` by ${source.author}`;
      }
      if (source.bias) {
        text += ` | Bias: ${source.bias.type}`;
      }
      return text;
    });
    builder.addBulletList(sourceItems);
  }

  // Periods section
  if (thought.periods && thought.periods.length > 0) {
    builder.addEmptyLine().addSection('HISTORICAL PERIODS');
    for (const period of thought.periods) {
      builder.addText(`${period.name}: ${period.startDate} - ${period.endDate}`);
      if (period.characteristics.length > 0) {
        builder.addBulletList(period.characteristics);
      }
    }
  }

  // Actors section
  if (thought.actors && thought.actors.length > 0) {
    builder.addEmptyLine().addSection('HISTORICAL ACTORS');
    const actorItems = thought.actors.map(actor => {
      let text = `${actor.name} (${actor.type})`;
      if (actor.roles && actor.roles.length > 0) {
        text += ` | Roles: ${actor.roles.join(', ')}`;
      }
      return text;
    });
    builder.addBulletList(actorItems);
  }

  // Patterns section
  if (thought.patterns && thought.patterns.length > 0) {
    builder.addEmptyLine().addSection('DETECTED PATTERNS');
    const patternItems = thought.patterns.map(pattern => {
      let text = `${pattern.name} [${pattern.type}] - ${Math.round(pattern.confidence * 100)}% confidence`;
      if (pattern.description) {
        text += `: ${pattern.description}`;
      }
      return text;
    });
    builder.addBulletList(patternItems);
  }

  // Aggregate reliability
  if (thought.aggregateReliability !== undefined) {
    builder.addEmptyLine()
      .addText(`Aggregate Source Reliability: ${Math.round(thought.aggregateReliability * 100)}%`);
  }

  return builder.render();
}

// ===== HELPER FUNCTIONS =====

function formatDate(date: string | { start: string; end: string }): string {
  if (typeof date === 'string') {
    return date;
  }
  return `${date.start} - ${date.end}`;
}

function getSignificanceColor(significance: string): string {
  switch (significance) {
    case 'minor':
      return '#d4edda';
    case 'moderate':
      return '#fff3cd';
    case 'major':
      return '#f8d7da';
    case 'transformative':
      return '#d1ecf1';
    default:
      return '#e2e3e5';
  }
}

function getReliabilityColor(reliability: number): string {
  if (reliability >= 0.8) return '#d4edda';
  if (reliability >= 0.5) return '#fff3cd';
  return '#f8d7da';
}

function getSignificanceShape(significance: string): 'rounded' | 'rectangle' | 'rhombus' | 'stadium' | 'hexagon' {
  switch (significance) {
    case 'transformative':
      return 'hexagon';
    case 'major':
      return 'rhombus';
    case 'moderate':
      return 'stadium';
    default:
      return 'rounded';
  }
}
