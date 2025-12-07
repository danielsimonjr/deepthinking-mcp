/**
 * Engineering Visual Exporter (v7.1.0)
 * Phase 10: Visual export for engineering analysis thoughts
 *
 * Exports engineering analysis to visual formats:
 * - Mermaid: Flowcharts and sequence diagrams
 * - DOT: Graphviz directed graphs
 * - ASCII: Text-based visualization
 * - SVG: Native scalable vector graphics
 * - GraphML: XML-based graph format
 * - TikZ: LaTeX graphics
 * - Modelica: System modeling language for simulation
 */

import type { EngineeringThought } from '../../types/modes/engineering.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';
import {
  generateSVGHeader,
  generateSVGFooter,
  renderRectNode,
  renderStadiumNode,
  renderEdge,
  getNodeColor,
  renderMetricsPanel,
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
  renderTable,
  renderBadge,
  renderProgressBar,
} from './html-utils.js';
import {
  generateUmlDiagram,
  type UmlNode,
  type UmlEdge,
} from './uml-utils.js';
import {
  createJsonGraph,
  addNode,
  addEdge,
  addMetric,
  serializeGraph,
} from './json-utils.js';
import {
  section,
  table,
  list,
  keyValueSection,
  mermaidBlock,
  document as mdDocument,
  progressBar,
} from './markdown-utils.js';

/**
 * Main export function for engineering analysis
 */
export function exportEngineeringAnalysis(
  thought: EngineeringThought,
  options: VisualExportOptions
): string {
  const { format } = options;

  switch (format) {
    case 'mermaid':
      return engineeringToMermaid(thought, options);
    case 'dot':
      return engineeringToDOT(thought, options);
    case 'ascii':
      return engineeringToASCII(thought);
    case 'svg':
      return engineeringToSVG(thought, options);
    case 'graphml':
      return engineeringToGraphML(thought, options);
    case 'tikz':
      return engineeringToTikZ(thought, options);
    case 'modelica':
      return engineeringToModelica(thought, options);
    case 'html':
      return engineeringToHTML(thought, options);
    case 'uml':
      return engineeringToUML(thought, options);
    case 'json':
      return engineeringToJSON(thought, options);
    case 'markdown':
      return engineeringToMarkdown(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

// =============================================================================
// Mermaid Export
// =============================================================================

function engineeringToMermaid(thought: EngineeringThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;
  const lines: string[] = ['flowchart TB'];

  // Title node
  lines.push(`  title["🔧 ${thought.analysisType.toUpperCase()} Analysis"]`);
  lines.push(`  title --> challenge["${thought.designChallenge.slice(0, 50)}${thought.designChallenge.length > 50 ? '...' : ''}"]`);

  // Requirements section
  if (thought.requirements && thought.requirements.requirements.length > 0) {
    lines.push('');
    lines.push('  subgraph Requirements ["📋 Requirements"]');
    for (const req of thought.requirements.requirements.slice(0, 5)) {
      const label = includeLabels ? req.title.slice(0, 30) : req.id;
      const status = req.status === 'verified' ? '✓' : req.status === 'implemented' ? '⚙' : '○';
      lines.push(`    ${sanitizeId(req.id)}["${status} ${label}"]`);
    }
    if (thought.requirements.requirements.length > 5) {
      lines.push(`    reqMore["... +${thought.requirements.requirements.length - 5} more"]`);
    }
    lines.push('  end');
    lines.push('  challenge --> Requirements');
  }

  // Trade Study section
  if (thought.tradeStudy) {
    lines.push('');
    lines.push('  subgraph TradeStudy ["⚖️ Trade Study"]');
    for (const alt of thought.tradeStudy.alternatives.slice(0, 4)) {
      const isRecommended = alt.id === thought.tradeStudy.recommendation;
      const icon = isRecommended ? '★' : '○';
      const label = includeLabels ? alt.name.slice(0, 25) : alt.id;
      lines.push(`    ${sanitizeId(alt.id)}["${icon} ${label}"]`);
    }
    if (thought.tradeStudy.alternatives.length > 4) {
      lines.push(`    altMore["... +${thought.tradeStudy.alternatives.length - 4} more"]`);
    }
    lines.push('  end');
    lines.push('  challenge --> TradeStudy');
  }

  // FMEA section
  if (thought.fmea && thought.fmea.failureModes.length > 0) {
    lines.push('');
    lines.push('  subgraph FMEA ["⚠️ Failure Modes"]');
    const sortedModes = [...thought.fmea.failureModes].sort((a, b) => b.rpn - a.rpn);
    for (const fm of sortedModes.slice(0, 4)) {
      const risk = fm.rpn >= thought.fmea.rpnThreshold ? '🔴' : fm.rpn >= 100 ? '🟡' : '🟢';
      const label = includeMetrics ? `${fm.failureMode.slice(0, 20)} (RPN:${fm.rpn})` : fm.failureMode.slice(0, 25);
      lines.push(`    ${sanitizeId(fm.id)}{{"${risk} ${label}"}}`);
    }
    if (thought.fmea.failureModes.length > 4) {
      lines.push(`    fmMore["... +${thought.fmea.failureModes.length - 4} more"]`);
    }
    lines.push('  end');
    lines.push('  challenge --> FMEA');
  }

  // Design Decisions section
  if (thought.designDecisions && thought.designDecisions.decisions.length > 0) {
    lines.push('');
    lines.push('  subgraph Decisions ["📝 Design Decisions"]');
    for (const dec of thought.designDecisions.decisions.slice(0, 4)) {
      const status = dec.status === 'accepted' ? '✓' : dec.status === 'proposed' ? '?' : '✗';
      const label = includeLabels ? dec.title.slice(0, 25) : dec.id;
      lines.push(`    ${sanitizeId(dec.id)}(["${status} ${label}"])`);
    }
    if (thought.designDecisions.decisions.length > 4) {
      lines.push(`    decMore["... +${thought.designDecisions.decisions.length - 4} more"]`);
    }
    lines.push('  end');
    lines.push('  challenge --> Decisions');
  }

  // Metrics summary
  if (includeMetrics && thought.assessment) {
    lines.push('');
    lines.push(`  metrics["📊 Confidence: ${(thought.assessment.confidence * 100).toFixed(0)}%"]`);
    lines.push('  challenge --> metrics');
  }

  return lines.join('\n');
}

// =============================================================================
// DOT Export
// =============================================================================

function engineeringToDOT(thought: EngineeringThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;
  const lines: string[] = [
    'digraph EngineeringAnalysis {',
    '  rankdir=TB;',
    '  node [fontname="Arial", fontsize=10];',
    '  edge [fontname="Arial", fontsize=9];',
    '',
  ];

  // Challenge node
  lines.push(`  challenge [label="${thought.designChallenge.slice(0, 40)}", shape=box, style=filled, fillcolor=lightblue];`);

  // Requirements cluster
  if (thought.requirements && thought.requirements.requirements.length > 0) {
    lines.push('');
    lines.push('  subgraph cluster_requirements {');
    lines.push('    label="Requirements";');
    lines.push('    style=filled;');
    lines.push('    fillcolor=lightyellow;');
    for (const req of thought.requirements.requirements) {
      const label = includeLabels ? `${req.id}\\n${req.title.slice(0, 20)}` : req.id;
      const color = req.status === 'verified' ? 'green' : req.status === 'implemented' ? 'blue' : 'gray';
      lines.push(`    ${sanitizeId(req.id)} [label="${label}", color=${color}];`);
    }
    lines.push('  }');
    lines.push('  challenge -> ' + sanitizeId(thought.requirements.requirements[0]?.id || 'req') + ';');
  }

  // Trade Study cluster
  if (thought.tradeStudy) {
    lines.push('');
    lines.push('  subgraph cluster_trade {');
    lines.push('    label="Trade Study";');
    lines.push('    style=filled;');
    lines.push('    fillcolor=lightgreen;');
    for (const alt of thought.tradeStudy.alternatives) {
      const label = includeLabels ? `${alt.id}\\n${alt.name.slice(0, 20)}` : alt.id;
      const style = alt.id === thought.tradeStudy.recommendation ? 'bold' : 'solid';
      const color = alt.id === thought.tradeStudy.recommendation ? 'gold' : 'white';
      lines.push(`    ${sanitizeId(alt.id)} [label="${label}", style="${style},filled", fillcolor=${color}];`);
    }
    lines.push('  }');
    lines.push('  challenge -> ' + sanitizeId(thought.tradeStudy.alternatives[0]?.id || 'alt') + ';');
  }

  // FMEA cluster
  if (thought.fmea && thought.fmea.failureModes.length > 0) {
    lines.push('');
    lines.push('  subgraph cluster_fmea {');
    lines.push('    label="FMEA";');
    lines.push('    style=filled;');
    lines.push('    fillcolor=mistyrose;');
    for (const fm of thought.fmea.failureModes) {
      const label = includeMetrics
        ? `${fm.id}\\n${fm.failureMode.slice(0, 15)}\\nRPN:${fm.rpn}`
        : `${fm.id}\\n${fm.failureMode.slice(0, 20)}`;
      const color = fm.rpn >= thought.fmea.rpnThreshold ? 'red' : fm.rpn >= 100 ? 'orange' : 'green';
      lines.push(`    ${sanitizeId(fm.id)} [label="${label}", shape=diamond, color=${color}];`);
    }
    lines.push('  }');
    lines.push('  challenge -> ' + sanitizeId(thought.fmea.failureModes[0]?.id || 'fm') + ';');
  }

  // Design Decisions cluster
  if (thought.designDecisions && thought.designDecisions.decisions.length > 0) {
    lines.push('');
    lines.push('  subgraph cluster_decisions {');
    lines.push('    label="Design Decisions";');
    lines.push('    style=filled;');
    lines.push('    fillcolor=lavender;');
    for (const dec of thought.designDecisions.decisions) {
      const label = includeLabels ? `${dec.id}\\n${dec.title.slice(0, 20)}` : dec.id;
      const shape = dec.status === 'accepted' ? 'box' : 'ellipse';
      lines.push(`    ${sanitizeId(dec.id)} [label="${label}", shape=${shape}];`);
    }
    lines.push('  }');
    lines.push('  challenge -> ' + sanitizeId(thought.designDecisions.decisions[0]?.id || 'dec') + ';');
  }

  lines.push('}');
  return lines.join('\n');
}

// =============================================================================
// ASCII Export
// =============================================================================

function engineeringToASCII(thought: EngineeringThought): string {
  const lines: string[] = [];
  const width = 60;

  // Header
  lines.push('╔' + '═'.repeat(width - 2) + '╗');
  lines.push('║' + ` 🔧 ENGINEERING: ${thought.analysisType.toUpperCase()} `.padEnd(width - 2) + '║');
  lines.push('╠' + '═'.repeat(width - 2) + '╣');

  // Design Challenge
  lines.push('║' + ` Challenge: ${thought.designChallenge.slice(0, width - 14)}`.padEnd(width - 2) + '║');
  lines.push('╠' + '─'.repeat(width - 2) + '╣');

  // Requirements
  if (thought.requirements && thought.requirements.requirements.length > 0) {
    lines.push('║' + ' 📋 REQUIREMENTS'.padEnd(width - 2) + '║');
    lines.push('║' + '─'.repeat(width - 2) + '║');
    for (const req of thought.requirements.requirements.slice(0, 5)) {
      const status = req.status === 'verified' ? '[✓]' : req.status === 'implemented' ? '[⚙]' : '[ ]';
      const line = ` ${status} ${req.id}: ${req.title.slice(0, width - 20)}`;
      lines.push('║' + line.padEnd(width - 2) + '║');
    }
    if (thought.requirements.requirements.length > 5) {
      lines.push('║' + `   ... +${thought.requirements.requirements.length - 5} more`.padEnd(width - 2) + '║');
    }
    lines.push('║' + `   Coverage: ${thought.requirements.coverage.verified}/${thought.requirements.coverage.total} verified`.padEnd(width - 2) + '║');
    lines.push('╠' + '─'.repeat(width - 2) + '╣');
  }

  // Trade Study
  if (thought.tradeStudy) {
    lines.push('║' + ' ⚖️ TRADE STUDY'.padEnd(width - 2) + '║');
    lines.push('║' + '─'.repeat(width - 2) + '║');
    for (const alt of thought.tradeStudy.alternatives) {
      const isRec = alt.id === thought.tradeStudy.recommendation;
      const marker = isRec ? '★' : '○';
      const line = ` ${marker} ${alt.name.slice(0, width - 8)}`;
      lines.push('║' + line.padEnd(width - 2) + '║');
    }
    lines.push('║' + `   Recommended: ${thought.tradeStudy.recommendation}`.padEnd(width - 2) + '║');
    lines.push('╠' + '─'.repeat(width - 2) + '╣');
  }

  // FMEA
  if (thought.fmea && thought.fmea.failureModes.length > 0) {
    lines.push('║' + ' ⚠️ FAILURE MODES (FMEA)'.padEnd(width - 2) + '║');
    lines.push('║' + '─'.repeat(width - 2) + '║');
    const sortedModes = [...thought.fmea.failureModes].sort((a, b) => b.rpn - a.rpn);
    for (const fm of sortedModes.slice(0, 5)) {
      const risk = fm.rpn >= thought.fmea.rpnThreshold ? '🔴' : fm.rpn >= 100 ? '🟡' : '🟢';
      const line = ` ${risk} ${fm.failureMode.slice(0, width - 25)} RPN:${fm.rpn}`;
      lines.push('║' + line.padEnd(width - 2) + '║');
    }
    if (thought.fmea.failureModes.length > 5) {
      lines.push('║' + `   ... +${thought.fmea.failureModes.length - 5} more`.padEnd(width - 2) + '║');
    }
    lines.push('║' + `   Critical: ${thought.fmea.summary.criticalModes} modes above threshold`.padEnd(width - 2) + '║');
    lines.push('╠' + '─'.repeat(width - 2) + '╣');
  }

  // Design Decisions
  if (thought.designDecisions && thought.designDecisions.decisions.length > 0) {
    lines.push('║' + ' 📝 DESIGN DECISIONS'.padEnd(width - 2) + '║');
    lines.push('║' + '─'.repeat(width - 2) + '║');
    for (const dec of thought.designDecisions.decisions.slice(0, 5)) {
      const status = dec.status === 'accepted' ? '[✓]' : dec.status === 'proposed' ? '[?]' : '[✗]';
      const line = ` ${status} ${dec.id}: ${dec.title.slice(0, width - 20)}`;
      lines.push('║' + line.padEnd(width - 2) + '║');
    }
    if (thought.designDecisions.decisions.length > 5) {
      lines.push('║' + `   ... +${thought.designDecisions.decisions.length - 5} more`.padEnd(width - 2) + '║');
    }
    lines.push('╠' + '─'.repeat(width - 2) + '╣');
  }

  // Assessment
  if (thought.assessment) {
    lines.push('║' + ' 📊 ASSESSMENT'.padEnd(width - 2) + '║');
    lines.push('║' + `   Confidence: ${(thought.assessment.confidence * 100).toFixed(0)}%`.padEnd(width - 2) + '║');
    if (thought.assessment.keyRisks.length > 0) {
      lines.push('║' + `   Key Risks: ${thought.assessment.keyRisks.length}`.padEnd(width - 2) + '║');
    }
    if (thought.assessment.openIssues.length > 0) {
      lines.push('║' + `   Open Issues: ${thought.assessment.openIssues.length}`.padEnd(width - 2) + '║');
    }
  }

  // Footer
  lines.push('╚' + '═'.repeat(width - 2) + '╝');

  return lines.join('\n');
}

// =============================================================================
// SVG Export
// =============================================================================

function engineeringToSVG(thought: EngineeringThought, options: VisualExportOptions): string {
  const { colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;
  const svgOptions = { ...DEFAULT_SVG_OPTIONS, ...options };
  const nodePositions = new Map<string, SVGNodePosition>();

  let currentY = 60;
  const centerX = (svgOptions.svgWidth || 800) / 2;

  // Challenge node
  const challengePos: SVGNodePosition = {
    id: 'challenge',
    label: thought.designChallenge.slice(0, 40),
    x: centerX - 100,
    y: currentY,
    width: 200,
    height: 40,
    type: 'primary',
  };
  nodePositions.set('challenge', challengePos);
  currentY += 80;

  // Section nodes
  const sections: Array<{ id: string; label: string; type: string }> = [];

  if (thought.requirements && thought.requirements.requirements.length > 0) {
    const label = includeLabels ? `Requirements (${thought.requirements.requirements.length})` : 'Reqs';
    sections.push({ id: 'requirements', label, type: 'info' });
  }
  if (thought.tradeStudy) {
    const label = includeLabels ? `Trade Study (${thought.tradeStudy.alternatives.length} alts)` : 'Trade';
    sections.push({ id: 'tradeStudy', label, type: 'secondary' });
  }
  if (thought.fmea && thought.fmea.failureModes.length > 0) {
    const label = includeLabels ? `FMEA (${thought.fmea.failureModes.length} modes)` : 'FMEA';
    sections.push({ id: 'fmea', label, type: 'danger' });
  }
  if (thought.designDecisions && thought.designDecisions.decisions.length > 0) {
    const label = includeLabels ? `Decisions (${thought.designDecisions.decisions.length})` : 'Decisions';
    sections.push({ id: 'decisions', label, type: 'tertiary' });
  }

  // Position sections horizontally
  const sectionWidth = 150;
  const totalWidth = sections.length * (sectionWidth + 20);
  let startX = centerX - totalWidth / 2;

  for (const section of sections) {
    const pos: SVGNodePosition = {
      id: section.id,
      label: section.label,
      x: startX,
      y: currentY,
      width: sectionWidth,
      height: 40,
      type: section.type,
    };
    nodePositions.set(section.id, pos);
    startX += sectionWidth + 20;
  }

  // Calculate SVG height
  const svgHeight = currentY + 120;

  // Generate SVG
  let svg = generateSVGHeader(svgOptions.svgWidth || 800, svgHeight, `Engineering: ${thought.analysisType}`);

  // Render challenge node
  const challengeColors = getNodeColor('primary', colorScheme);
  svg += renderStadiumNode(challengePos, challengeColors);

  // Render section nodes and edges
  for (const section of sections) {
    const pos = nodePositions.get(section.id)!;
    const colors = getNodeColor(section.type, colorScheme);
    svg += renderRectNode(pos, colors, 5);
    svg += renderEdge(challengePos, pos, { color: '#666666' });
  }

  // Add metrics panel
  if (includeMetrics && thought.assessment) {
    const metrics = [
      { label: 'Confidence', value: `${(thought.assessment.confidence * 100).toFixed(0)}%` },
      { label: 'Key Risks', value: thought.assessment.keyRisks.length },
      { label: 'Open Issues', value: thought.assessment.openIssues.length },
    ];
    svg += renderMetricsPanel((svgOptions.svgWidth || 800) - 150, 20, metrics);
  }

  svg += generateSVGFooter();
  return svg;
}

// =============================================================================
// GraphML Export
// =============================================================================

function engineeringToGraphML(thought: EngineeringThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;
  const nodes: GraphMLNode[] = [];
  const edges: GraphMLEdge[] = [];
  let edgeId = 0;

  // Challenge node
  nodes.push({
    id: 'challenge',
    label: includeLabels ? thought.designChallenge : 'Challenge',
    type: 'challenge',
    metadata: { analysisType: thought.analysisType },
  });

  // Requirements
  if (thought.requirements) {
    for (const req of thought.requirements.requirements) {
      nodes.push({
        id: sanitizeId(req.id),
        label: includeLabels ? req.title : req.id,
        type: 'requirement',
        metadata: {
          priority: req.priority,
          status: req.status,
          source: req.source,
        },
      });
      edges.push({
        id: `e${edgeId++}`,
        source: 'challenge',
        target: sanitizeId(req.id),
        label: 'requires',
      });

      // Traceability edges
      if (req.tracesTo) {
        for (const parentId of req.tracesTo) {
          edges.push({
            id: `e${edgeId++}`,
            source: sanitizeId(req.id),
            target: sanitizeId(parentId),
            label: 'traces to',
          });
        }
      }
    }
  }

  // Trade Study
  if (thought.tradeStudy) {
    nodes.push({
      id: 'tradeStudy',
      label: thought.tradeStudy.title,
      type: 'trade-study',
    });
    edges.push({
      id: `e${edgeId++}`,
      source: 'challenge',
      target: 'tradeStudy',
    });

    for (const alt of thought.tradeStudy.alternatives) {
      const isRecommended = alt.id === thought.tradeStudy.recommendation;
      nodes.push({
        id: sanitizeId(alt.id),
        label: includeLabels ? alt.name : alt.id,
        type: isRecommended ? 'recommended' : 'alternative',
        metadata: {
          riskLevel: alt.riskLevel,
          estimatedCost: alt.estimatedCost,
        },
      });
      edges.push({
        id: `e${edgeId++}`,
        source: 'tradeStudy',
        target: sanitizeId(alt.id),
        label: isRecommended ? 'recommended' : 'alternative',
      });
    }
  }

  // FMEA
  if (thought.fmea) {
    for (const fm of thought.fmea.failureModes) {
      nodes.push({
        id: sanitizeId(fm.id),
        label: includeLabels ? fm.failureMode : fm.id,
        type: fm.rpn >= thought.fmea.rpnThreshold ? 'critical-failure' : 'failure-mode',
        metadata: includeMetrics ? {
          severity: fm.severity,
          occurrence: fm.occurrence,
          detection: fm.detection,
          rpn: fm.rpn,
          component: fm.component,
        } : undefined,
      });
      edges.push({
        id: `e${edgeId++}`,
        source: 'challenge',
        target: sanitizeId(fm.id),
        label: 'failure mode',
        metadata: includeMetrics ? { weight: fm.rpn } : undefined,
      });
    }
  }

  // Design Decisions
  if (thought.designDecisions) {
    for (const dec of thought.designDecisions.decisions) {
      nodes.push({
        id: sanitizeId(dec.id),
        label: includeLabels ? dec.title : dec.id,
        type: `decision-${dec.status}`,
        metadata: {
          status: dec.status,
          context: dec.context,
        },
      });
      edges.push({
        id: `e${edgeId++}`,
        source: 'challenge',
        target: sanitizeId(dec.id),
        label: 'decision',
      });

      // Related decisions edges
      if (dec.relatedDecisions) {
        for (const relId of dec.relatedDecisions) {
          edges.push({
            id: `e${edgeId++}`,
            source: sanitizeId(dec.id),
            target: sanitizeId(relId),
            label: 'related to',
          });
        }
      }
    }
  }

  return generateGraphML(nodes, edges, { graphName: 'Engineering Analysis', directed: true });
}

// =============================================================================
// TikZ Export
// =============================================================================

function engineeringToTikZ(thought: EngineeringThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;
  const nodes: TikZNode[] = [];
  const edges: TikZEdge[] = [];

  // Challenge node
  nodes.push({
    id: 'challenge',
    label: thought.designChallenge.slice(0, 30),
    x: 4,
    y: 0,
    type: 'primary',
    shape: 'stadium',
  });

  let sectionX = 0;
  const sectionY = -2;

  // Requirements section
  if (thought.requirements && thought.requirements.requirements.length > 0) {
    nodes.push({
      id: 'reqs',
      label: includeLabels ? `Reqs (${thought.requirements.requirements.length})` : 'Requirements',
      x: sectionX,
      y: sectionY,
      type: 'info',
      shape: 'rectangle',
    });
    edges.push({ source: 'challenge', target: 'reqs', directed: true });
    sectionX += 2.5;
  }

  // Trade Study section
  if (thought.tradeStudy) {
    nodes.push({
      id: 'trade',
      label: includeLabels ? `Trade (${thought.tradeStudy.alternatives.length})` : 'Trade Study',
      x: sectionX,
      y: sectionY,
      type: 'secondary',
      shape: 'rectangle',
    });
    edges.push({ source: 'challenge', target: 'trade', directed: true });
    sectionX += 2.5;
  }

  // FMEA section
  if (thought.fmea && thought.fmea.failureModes.length > 0) {
    const criticalCount = thought.fmea.summary.criticalModes;
    nodes.push({
      id: 'fmea',
      label: includeMetrics ? `FMEA (${criticalCount} crit)` : 'FMEA',
      x: sectionX,
      y: sectionY,
      type: 'danger',
      shape: 'diamond',
    });
    edges.push({ source: 'challenge', target: 'fmea', directed: true });
    sectionX += 2.5;
  }

  // Decisions section
  if (thought.designDecisions && thought.designDecisions.decisions.length > 0) {
    nodes.push({
      id: 'decisions',
      label: includeLabels ? `Decisions (${thought.designDecisions.decisions.length})` : 'Decisions',
      x: sectionX,
      y: sectionY,
      type: 'tertiary',
      shape: 'ellipse',
    });
    edges.push({ source: 'challenge', target: 'decisions', directed: true });
  }

  // Assessment node if present
  if (thought.assessment && includeMetrics) {
    nodes.push({
      id: 'assessment',
      label: `${(thought.assessment.confidence * 100).toFixed(0)}% conf`,
      x: 4,
      y: -4,
      type: 'success',
      shape: 'ellipse',
    });
    edges.push({ source: 'challenge', target: 'assessment', style: 'dashed', directed: true });
  }

  return generateTikZ(nodes, edges, { title: `Engineering: ${thought.analysisType}` });
}

// =============================================================================
// Modelica Export
// =============================================================================

/**
 * Sanitize identifier for Modelica (must start with letter, alphanumeric + underscore only)
 */
function sanitizeModelicaId(id: string): string {
  // Replace hyphens and spaces with underscores
  let sanitized = id.replace(/[-\s]/g, '_');
  // Remove any non-alphanumeric characters except underscore
  sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '');
  // Ensure it starts with a letter
  if (!/^[a-zA-Z]/.test(sanitized)) {
    sanitized = 'id_' + sanitized;
  }
  return sanitized;
}

/**
 * Escape string for Modelica string literals
 */
function escapeModelicaString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function engineeringToModelica(thought: EngineeringThought, options: VisualExportOptions): string {
  const { includeMetrics = true, modelicaPackageName, modelicaIncludeAnnotations = true } = options;
  const packageName = modelicaPackageName || sanitizeModelicaId(thought.designChallenge.slice(0, 30)) || 'EngineeringAnalysis';
  const lines: string[] = [];

  // Package header
  lines.push(`package ${packageName}`);
  lines.push(`  "Engineering Analysis: ${escapeModelicaString(thought.designChallenge)}"`);
  lines.push('');

  // Requirements as a record type with constraints
  if (thought.requirements && thought.requirements.requirements.length > 0) {
    lines.push('  // ==========================================================================');
    lines.push('  // Requirements Traceability');
    lines.push('  // ==========================================================================');
    lines.push('');
    lines.push('  record Requirements');
    lines.push(`    "Requirements traceability for ${escapeModelicaString(thought.designChallenge)}"`);
    lines.push('');

    for (const req of thought.requirements.requirements) {
      const reqId = sanitizeModelicaId(req.id);
      const priority = req.priority.toUpperCase();
      const status = req.status;
      lines.push(`    // ${req.id}: ${escapeModelicaString(req.title)}`);
      lines.push(`    parameter Boolean ${reqId}_satisfied = ${status === 'verified' || status === 'implemented' ? 'true' : 'false'}`);
      if (modelicaIncludeAnnotations) {
        lines.push(`      annotation(Dialog(group="${priority}", tab="Requirements"),`);
        lines.push(`               Documentation(info="<html><p>${escapeModelicaString(req.description)}</p></html>"));`);
      } else {
        lines.push('      ;');
      }
      lines.push('');
    }

    // Coverage metrics
    if (includeMetrics) {
      const cov = thought.requirements.coverage;
      lines.push(`    // Coverage Metrics`);
      lines.push(`    final parameter Integer totalRequirements = ${cov.total};`);
      lines.push(`    final parameter Integer verifiedRequirements = ${cov.verified};`);
      lines.push(`    final parameter Real coverageRatio = ${(cov.verified / Math.max(cov.total, 1)).toFixed(3)};`);
      lines.push('');
    }

    lines.push('  end Requirements;');
    lines.push('');
  }

  // Trade Study as parameterized model
  if (thought.tradeStudy) {
    lines.push('  // ==========================================================================');
    lines.push('  // Trade Study');
    lines.push('  // ==========================================================================');
    lines.push('');
    lines.push('  model TradeStudy');
    lines.push(`    "${escapeModelicaString(thought.tradeStudy.title)}"`);
    lines.push('');

    // Define alternatives as an enumeration
    const altIds = thought.tradeStudy.alternatives.map(a => sanitizeModelicaId(a.id));
    lines.push(`    type Alternative = enumeration(`);
    for (let i = 0; i < altIds.length; i++) {
      const alt = thought.tradeStudy.alternatives[i];
      const comma = i < altIds.length - 1 ? ',' : '';
      lines.push(`      ${altIds[i]} "${escapeModelicaString(alt.name)}"${comma}`);
    }
    lines.push('    );');
    lines.push('');

    // Recommended alternative
    const recId = sanitizeModelicaId(thought.tradeStudy.recommendation);
    lines.push(`    parameter Alternative selectedAlternative = Alternative.${recId}`);
    lines.push(`      "Selected alternative based on trade study";`);
    lines.push('');

    // Criteria weights
    lines.push('    // Criteria Weights (sum to 1.0)');
    for (const crit of thought.tradeStudy.criteria) {
      const critId = sanitizeModelicaId(crit.id);
      lines.push(`    parameter Real weight_${critId} = ${crit.weight.toFixed(3)} "${escapeModelicaString(crit.name)}";`);
    }
    lines.push('');

    // Scores for recommended alternative
    lines.push('    // Scores for selected alternative');
    const recScores = thought.tradeStudy.scores.filter(s => s.alternativeId === thought.tradeStudy!.recommendation);
    for (const score of recScores) {
      const critId = sanitizeModelicaId(score.criteriaId);
      lines.push(`    final parameter Real score_${critId} = ${score.score};`);
    }
    lines.push('');

    if (modelicaIncludeAnnotations) {
      lines.push('    annotation(Documentation(info="<html>');
      lines.push(`      <h3>Objective</h3><p>${escapeModelicaString(thought.tradeStudy.objective)}</p>`);
      lines.push(`      <h3>Justification</h3><p>${escapeModelicaString(thought.tradeStudy.justification)}</p>`);
      lines.push('    </html>"));');
    }

    lines.push('  end TradeStudy;');
    lines.push('');
  }

  // FMEA as failure mode records
  if (thought.fmea && thought.fmea.failureModes.length > 0) {
    lines.push('  // ==========================================================================');
    lines.push('  // Failure Mode and Effects Analysis (FMEA)');
    lines.push('  // ==========================================================================');
    lines.push('');
    lines.push('  model FMEA');
    lines.push(`    "FMEA for ${escapeModelicaString(thought.fmea.system)}"`);
    lines.push('');

    // RPN threshold
    lines.push(`    parameter Integer rpnThreshold = ${thought.fmea.rpnThreshold} "Action required above this RPN";`);
    lines.push('');

    // Failure modes as nested records
    for (const fm of thought.fmea.failureModes) {
      const fmId = sanitizeModelicaId(fm.id);
      const isCritical = fm.rpn >= thought.fmea.rpnThreshold;
      lines.push(`    // Failure Mode: ${fm.id}`);
      lines.push(`    record ${fmId}`);
      lines.push(`      "${escapeModelicaString(fm.failureMode)}"`);
      lines.push(`      constant String component = "${escapeModelicaString(fm.component)}";`);
      lines.push(`      constant String cause = "${escapeModelicaString(fm.cause)}";`);
      lines.push(`      constant String effect = "${escapeModelicaString(fm.effect)}";`);
      lines.push(`      constant Integer severity = ${fm.severity} "1-10 scale";`);
      lines.push(`      constant Integer occurrence = ${fm.occurrence} "1-10 scale";`);
      lines.push(`      constant Integer detection = ${fm.detection} "1-10 scale";`);
      lines.push(`      constant Integer rpn = ${fm.rpn} "Risk Priority Number";`);
      lines.push(`      constant Boolean isCritical = ${isCritical};`);
      if (fm.mitigation) {
        lines.push(`      constant String mitigation = "${escapeModelicaString(fm.mitigation)}";`);
      }
      lines.push(`    end ${fmId};`);
      lines.push('');
    }

    // Summary metrics
    if (includeMetrics) {
      const sum = thought.fmea.summary;
      lines.push('    // Summary Statistics');
      lines.push(`    final parameter Integer totalModes = ${sum.totalModes};`);
      lines.push(`    final parameter Integer criticalModes = ${sum.criticalModes};`);
      lines.push(`    final parameter Real averageRpn = ${sum.averageRpn.toFixed(1)};`);
      lines.push(`    final parameter Integer maxRpn = ${sum.maxRpn};`);
      lines.push('');
    }

    lines.push('  end FMEA;');
    lines.push('');
  }

  // Design Decisions as documentation records
  if (thought.designDecisions && thought.designDecisions.decisions.length > 0) {
    lines.push('  // ==========================================================================');
    lines.push('  // Design Decision Records');
    lines.push('  // ==========================================================================');
    lines.push('');
    lines.push('  package DesignDecisions');
    if (thought.designDecisions.projectName) {
      lines.push(`    "Design decisions for ${escapeModelicaString(thought.designDecisions.projectName)}"`);
    }
    lines.push('');

    for (const dec of thought.designDecisions.decisions) {
      const decId = sanitizeModelicaId(dec.id);
      lines.push(`    record ${decId}`);
      lines.push(`      "${escapeModelicaString(dec.title)}"`);
      lines.push(`      constant String status = "${dec.status}";`);
      lines.push(`      constant String context = "${escapeModelicaString(dec.context.slice(0, 200))}";`);
      lines.push(`      constant String decision = "${escapeModelicaString(dec.decision.slice(0, 200))}";`);
      lines.push(`      constant String rationale = "${escapeModelicaString(dec.rationale.slice(0, 200))}";`);
      if (dec.date) {
        lines.push(`      constant String date = "${dec.date}";`);
      }
      if (dec.supersededBy) {
        lines.push(`      constant String supersededBy = "${sanitizeModelicaId(dec.supersededBy)}";`);
      }

      if (modelicaIncludeAnnotations && dec.consequences.length > 0) {
        lines.push('      annotation(Documentation(info="<html>');
        lines.push('        <h4>Consequences</h4><ul>');
        for (const cons of dec.consequences) {
          lines.push(`          <li>${escapeModelicaString(cons)}</li>`);
        }
        lines.push('        </ul></html>"));');
      }

      lines.push(`    end ${decId};`);
      lines.push('');
    }

    lines.push('  end DesignDecisions;');
    lines.push('');
  }

  // Assessment summary
  if (thought.assessment && includeMetrics) {
    lines.push('  // ==========================================================================');
    lines.push('  // Assessment');
    lines.push('  // ==========================================================================');
    lines.push('');
    lines.push('  record Assessment');
    lines.push('    "Overall engineering assessment"');
    lines.push(`    constant Real confidence = ${thought.assessment.confidence.toFixed(3)};`);
    lines.push(`    constant Integer keyRisksCount = ${thought.assessment.keyRisks.length};`);
    lines.push(`    constant Integer openIssuesCount = ${thought.assessment.openIssues.length};`);

    if (modelicaIncludeAnnotations) {
      lines.push('    annotation(Documentation(info="<html>');
      if (thought.assessment.keyRisks.length > 0) {
        lines.push('      <h4>Key Risks</h4><ul>');
        for (const risk of thought.assessment.keyRisks) {
          lines.push(`        <li>${escapeModelicaString(risk)}</li>`);
        }
        lines.push('      </ul>');
      }
      if (thought.assessment.nextSteps.length > 0) {
        lines.push('      <h4>Next Steps</h4><ul>');
        for (const step of thought.assessment.nextSteps) {
          lines.push(`        <li>${escapeModelicaString(step)}</li>`);
        }
        lines.push('      </ul>');
      }
      lines.push('    </html>"));');
    }

    lines.push('  end Assessment;');
    lines.push('');
  }

  // Package footer with annotation
  if (modelicaIncludeAnnotations) {
    lines.push(`  annotation(`);
    lines.push(`    Documentation(info="<html>`);
    lines.push(`      <h2>Engineering Analysis: ${escapeModelicaString(thought.analysisType)}</h2>`);
    lines.push(`      <p><b>Design Challenge:</b> ${escapeModelicaString(thought.designChallenge)}</p>`);
    lines.push(`      <p>Generated by DeepThinking MCP v7.1.0</p>`);
    lines.push(`    </html>"),`);
    lines.push(`    version="1.0.0"`);
    lines.push(`  );`);
  }

  lines.push(`end ${packageName};`);

  return lines.join('\n');
}

// =============================================================================
// HTML Export
// =============================================================================

/**
 * Export engineering analysis to HTML format
 */
function engineeringToHTML(thought: EngineeringThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Engineering Analysis',
    htmlTheme = 'light',
    includeMetrics = true,
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // Analysis type badge
  const typeBadge = renderBadge(thought.analysisType, 'primary');
  html += `<p>Analysis Type: ${typeBadge}</p>\n`;

  // Design challenge
  html += renderSection('Design Challenge', `
    <p class="text-primary"><strong>${escapeHTML(thought.designChallenge)}</strong></p>
  `, '🔧');

  // Requirements Traceability
  if (thought.requirements && thought.requirements.requirements.length > 0) {
    if (includeMetrics) {
      const cov = thought.requirements.coverage;
      const coveragePercent = (cov.verified / Math.max(cov.total, 1)) * 100;
      html += '<div class="metrics-grid">';
      html += renderMetricCard('Total Requirements', cov.total, 'primary');
      html += renderMetricCard('Verified', cov.verified, 'success');
      html += renderMetricCard('Traced to Source', cov.tracedToSource, 'info');
      html += renderMetricCard('Allocated', cov.allocatedToDesign, 'warning');
      html += '</div>\n';
      html += renderProgressBar(coveragePercent, 'success');
    }

    const reqRows = thought.requirements.requirements.map(req => {
      const statusBadge = renderBadge(req.status,
        req.status === 'verified' ? 'success' :
        req.status === 'implemented' ? 'info' :
        req.status === 'approved' ? 'primary' : 'secondary'
      );
      const priorityBadge = renderBadge(req.priority,
        req.priority === 'must' ? 'danger' :
        req.priority === 'should' ? 'warning' : 'secondary'
      );
      return [
        req.id,
        req.title,
        priorityBadge,
        statusBadge,
        req.source,
      ];
    });
    html += renderSection('Requirements Traceability', renderTable(
      ['ID', 'Title', 'Priority', 'Status', 'Source'],
      reqRows.map(row => row.map(cell => typeof cell === 'string' && cell.startsWith('<') ? cell : escapeHTML(String(cell))))
    ), '📋');
  }

  // Trade Study
  if (thought.tradeStudy) {
    html += renderSection('Trade Study: ' + thought.tradeStudy.title, `
      <p><strong>Objective:</strong> ${escapeHTML(thought.tradeStudy.objective)}</p>
      <h4>Criteria</h4>
    ` + renderTable(
      ['Criterion', 'Weight', 'Description'],
      thought.tradeStudy.criteria.map(c => [c.name, (c.weight * 100).toFixed(0) + '%', c.description || '-'])
    ) + `
      <h4>Alternatives</h4>
    ` + renderTable(
      ['Alternative', 'Description', 'Risk Level'],
      thought.tradeStudy.alternatives.map(a => [
        a.id === thought.tradeStudy!.recommendation ? '⭐ ' + a.name : a.name,
        a.description,
        a.riskLevel || '-',
      ])
    ) + `
      <div class="card" style="margin-top: 1rem; border-color: var(--success-color);">
        <div class="card-header text-success">Recommendation: ${escapeHTML(thought.tradeStudy.recommendation)}</div>
        <p>${escapeHTML(thought.tradeStudy.justification)}</p>
      </div>
    `, '⚖️');
  }

  // FMEA
  if (thought.fmea && thought.fmea.failureModes.length > 0) {
    if (includeMetrics) {
      html += '<div class="metrics-grid">';
      html += renderMetricCard('Failure Modes', thought.fmea.summary.totalModes, 'primary');
      html += renderMetricCard('Critical Modes', thought.fmea.summary.criticalModes, 'danger');
      html += renderMetricCard('Average RPN', thought.fmea.summary.averageRpn.toFixed(1), 'warning');
      html += renderMetricCard('Max RPN', thought.fmea.summary.maxRpn, 'danger');
      html += '</div>\n';
    }

    const fmeaRows = thought.fmea.failureModes.map(fm => {
      const isCritical = fm.rpn >= thought.fmea!.rpnThreshold;
      const rpnBadge = renderBadge(fm.rpn.toString(), isCritical ? 'danger' : 'warning');
      return [
        fm.component,
        fm.failureMode.substring(0, 40) + (fm.failureMode.length > 40 ? '...' : ''),
        fm.severity.toString(),
        fm.occurrence.toString(),
        fm.detection.toString(),
        rpnBadge,
        fm.mitigation ? '✓' : '-',
      ];
    });
    html += renderSection('Failure Mode Analysis (FMEA)', `
      <p><strong>System:</strong> ${escapeHTML(thought.fmea.system)} | <strong>RPN Threshold:</strong> ${thought.fmea.rpnThreshold}</p>
    ` + renderTable(
      ['Component', 'Failure Mode', 'S', 'O', 'D', 'RPN', 'Mitigation'],
      fmeaRows.map(row => row.map(cell => typeof cell === 'string' && cell.startsWith('<') ? cell : escapeHTML(String(cell))))
    ), '⚠️');
  }

  // Design Decisions
  if (thought.designDecisions && thought.designDecisions.decisions.length > 0) {
    const decisionsContent = thought.designDecisions.decisions.map(dec => {
      const statusBadge = renderBadge(dec.status,
        dec.status === 'accepted' ? 'success' :
        dec.status === 'rejected' ? 'danger' :
        dec.status === 'deprecated' ? 'warning' : 'secondary'
      );
      return `
        <div class="card">
          <div class="card-header">${escapeHTML(dec.id)}: ${escapeHTML(dec.title)} ${statusBadge}</div>
          <p><strong>Context:</strong> ${escapeHTML(dec.context)}</p>
          <p><strong>Decision:</strong> ${escapeHTML(dec.decision)}</p>
          <p><strong>Rationale:</strong> ${escapeHTML(dec.rationale)}</p>
          ${dec.consequences.length > 0 ? `
            <p><strong>Consequences:</strong></p>
            <ul class="list-styled">
              ${dec.consequences.map(c => `<li>${escapeHTML(c)}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `;
    }).join('\n');
    html += renderSection('Design Decisions', decisionsContent, '📝');
  }

  // Assessment
  if (thought.assessment && includeMetrics) {
    html += renderSection('Assessment', `
      <div class="metrics-grid">
        ${renderMetricCard('Confidence', (thought.assessment.confidence * 100).toFixed(0) + '%', 'primary')}
        ${renderMetricCard('Key Risks', thought.assessment.keyRisks.length, 'danger')}
        ${renderMetricCard('Open Issues', thought.assessment.openIssues.length, 'warning')}
      </div>
      ${renderProgressBar(thought.assessment.confidence * 100, 'primary')}
      ${thought.assessment.keyRisks.length > 0 ? `
        <h4>Key Risks</h4>
        <ul class="list-styled">
          ${thought.assessment.keyRisks.map(r => `<li class="text-danger">${escapeHTML(r)}</li>`).join('')}
        </ul>
      ` : ''}
      ${thought.assessment.nextSteps.length > 0 ? `
        <h4>Next Steps</h4>
        <ul class="list-styled">
          ${thought.assessment.nextSteps.map(s => `<li>${escapeHTML(s)}</li>`).join('')}
        </ul>
      ` : ''}
    `, '📊');
  }

  html += generateHTMLFooter(htmlStandalone);
  return html;
}

// =============================================================================
// UML Export
// =============================================================================

/**
 * Export engineering analysis to UML/PlantUML format
 */
function engineeringToUML(thought: EngineeringThought, options: VisualExportOptions): string {
  const { umlTheme, umlDirection, includeLabels = true, includeMetrics = true } = options;

  const nodes: UmlNode[] = [];
  const edges: UmlEdge[] = [];

  // Central challenge node
  nodes.push({
    id: 'challenge',
    label: thought.designChallenge.substring(0, 50),
    shape: 'component',
    stereotype: thought.analysisType,
  });

  // Requirements section
  if (thought.requirements && thought.requirements.requirements.length > 0) {
    nodes.push({
      id: 'requirements',
      label: includeLabels ? `Requirements (${thought.requirements.requirements.length})` : 'Requirements',
      shape: 'folder',
      color: 'lightyellow',
    });
    edges.push({
      source: 'challenge',
      target: 'requirements',
      type: 'composition',
    });

    // Add individual requirements
    for (const req of thought.requirements.requirements.slice(0, 5)) {
      const reqId = sanitizeId(req.id);
      nodes.push({
        id: `req_${reqId}`,
        label: includeLabels ? req.title.substring(0, 30) : req.id,
        shape: 'class',
        stereotype: req.priority,
      });
      edges.push({
        source: 'requirements',
        target: `req_${reqId}`,
        type: 'aggregation',
      });
    }
  }

  // Trade Study section
  if (thought.tradeStudy) {
    nodes.push({
      id: 'tradeStudy',
      label: includeLabels ? thought.tradeStudy.title.substring(0, 30) : 'Trade Study',
      shape: 'package',
      color: 'lightgreen',
    });
    edges.push({
      source: 'challenge',
      target: 'tradeStudy',
      type: 'dependency',
    });

    // Add alternatives
    for (const alt of thought.tradeStudy.alternatives.slice(0, 4)) {
      const isRec = alt.id === thought.tradeStudy.recommendation;
      nodes.push({
        id: `alt_${sanitizeId(alt.id)}`,
        label: alt.name.substring(0, 25),
        shape: isRec ? 'entity' : 'rectangle',
        stereotype: isRec ? 'recommended' : undefined,
        color: isRec ? '90EE90' : undefined,
      });
      edges.push({
        source: 'tradeStudy',
        target: `alt_${sanitizeId(alt.id)}`,
        type: 'association',
      });
    }
  }

  // FMEA section
  if (thought.fmea && thought.fmea.failureModes.length > 0) {
    nodes.push({
      id: 'fmea',
      label: includeMetrics ? `FMEA (${thought.fmea.summary.criticalModes} critical)` : 'FMEA',
      shape: 'database',
      color: 'mistyrose',
    });
    edges.push({
      source: 'challenge',
      target: 'fmea',
      type: 'dependency',
    });
  }

  // Design Decisions section
  if (thought.designDecisions && thought.designDecisions.decisions.length > 0) {
    nodes.push({
      id: 'decisions',
      label: includeLabels ? `Decisions (${thought.designDecisions.decisions.length})` : 'Decisions',
      shape: 'folder',
      color: 'lavender',
    });
    edges.push({
      source: 'challenge',
      target: 'decisions',
      type: 'dependency',
    });
  }

  // Assessment
  if (thought.assessment && includeMetrics) {
    nodes.push({
      id: 'assessment',
      label: `Confidence: ${(thought.assessment.confidence * 100).toFixed(0)}%`,
      shape: 'usecase',
      color: thought.assessment.confidence > 0.7 ? '90EE90' : 'FFD700',
    });
    edges.push({
      source: 'challenge',
      target: 'assessment',
      type: 'dashed',
    });
  }

  return generateUmlDiagram(nodes, edges, {
    title: `Engineering: ${thought.analysisType}`,
    theme: umlTheme,
    direction: umlDirection,
  });
}

// =============================================================================
// JSON Export
// =============================================================================

/**
 * Export engineering analysis to JSON format
 */
function engineeringToJSON(thought: EngineeringThought, options: VisualExportOptions): string {
  const { jsonPrettyPrint = true, jsonIndent = 2, includeMetrics = true } = options;

  const graph = createJsonGraph(`Engineering: ${thought.analysisType}`, 'engineering', {
    prettyPrint: jsonPrettyPrint,
    indent: jsonIndent,
    includeMetrics,
  });

  // Add metadata
  graph.metadata.analysisType = thought.analysisType;
  graph.metadata.designChallenge = thought.designChallenge;

  // Challenge node
  addNode(graph, {
    id: 'challenge',
    label: thought.designChallenge,
    type: 'challenge',
    color: '#a8d5ff',
    shape: 'stadium',
    metadata: { analysisType: thought.analysisType },
  });

  // Requirements
  if (thought.requirements) {
    addNode(graph, {
      id: 'requirements',
      label: `Requirements (${thought.requirements.requirements.length})`,
      type: 'requirements',
      color: '#fff9c4',
      shape: 'rectangle',
      metadata: {
        total: thought.requirements.coverage.total,
        verified: thought.requirements.coverage.verified,
        requirements: thought.requirements.requirements.map(r => ({
          id: r.id,
          title: r.title,
          priority: r.priority,
          status: r.status,
        })),
      },
    });
    addEdge(graph, {
      id: 'edge_challenge_requirements',
      source: 'challenge',
      target: 'requirements',
      type: 'has_requirements',
      directed: true,
    });
  }

  // Trade Study
  if (thought.tradeStudy) {
    addNode(graph, {
      id: 'tradeStudy',
      label: thought.tradeStudy.title,
      type: 'trade_study',
      color: '#c8e6c9',
      shape: 'rectangle',
      metadata: {
        objective: thought.tradeStudy.objective,
        recommendation: thought.tradeStudy.recommendation,
        justification: thought.tradeStudy.justification,
        alternatives: thought.tradeStudy.alternatives.map(a => ({
          id: a.id,
          name: a.name,
          riskLevel: a.riskLevel,
        })),
        criteria: thought.tradeStudy.criteria.map(c => ({
          id: c.id,
          name: c.name,
          weight: c.weight,
        })),
      },
    });
    addEdge(graph, {
      id: 'edge_challenge_tradeStudy',
      source: 'challenge',
      target: 'tradeStudy',
      type: 'has_trade_study',
      directed: true,
    });
  }

  // FMEA
  if (thought.fmea && thought.fmea.failureModes.length > 0) {
    addNode(graph, {
      id: 'fmea',
      label: `FMEA: ${thought.fmea.system}`,
      type: 'fmea',
      color: '#ffcdd2',
      shape: 'diamond',
      metadata: {
        system: thought.fmea.system,
        rpnThreshold: thought.fmea.rpnThreshold,
        summary: thought.fmea.summary,
        failureModes: thought.fmea.failureModes.map(fm => ({
          id: fm.id,
          component: fm.component,
          failureMode: fm.failureMode,
          rpn: fm.rpn,
          severity: fm.severity,
          occurrence: fm.occurrence,
          detection: fm.detection,
        })),
      },
    });
    addEdge(graph, {
      id: 'edge_challenge_fmea',
      source: 'challenge',
      target: 'fmea',
      type: 'has_fmea',
      directed: true,
    });
  }

  // Design Decisions
  if (thought.designDecisions && thought.designDecisions.decisions.length > 0) {
    addNode(graph, {
      id: 'decisions',
      label: `Decisions (${thought.designDecisions.decisions.length})`,
      type: 'design_decisions',
      color: '#e1bee7',
      shape: 'rectangle',
      metadata: {
        projectName: thought.designDecisions.projectName,
        decisions: thought.designDecisions.decisions.map(d => ({
          id: d.id,
          title: d.title,
          status: d.status,
          decision: d.decision,
        })),
      },
    });
    addEdge(graph, {
      id: 'edge_challenge_decisions',
      source: 'challenge',
      target: 'decisions',
      type: 'has_decisions',
      directed: true,
    });
  }

  // Assessment
  if (thought.assessment) {
    addNode(graph, {
      id: 'assessment',
      label: `Assessment: ${(thought.assessment.confidence * 100).toFixed(0)}%`,
      type: 'assessment',
      color: thought.assessment.confidence > 0.7 ? '#a5d6a7' : '#ffe082',
      shape: 'ellipse',
      metadata: {
        confidence: thought.assessment.confidence,
        keyRisks: thought.assessment.keyRisks,
        openIssues: thought.assessment.openIssues,
        nextSteps: thought.assessment.nextSteps,
      },
    });
    addEdge(graph, {
      id: 'edge_challenge_assessment',
      source: 'challenge',
      target: 'assessment',
      type: 'has_assessment',
      directed: true,
      style: 'dashed',
    });
  }

  // Add metrics
  if (includeMetrics && graph.metrics) {
    addMetric(graph, 'analysisType', thought.analysisType);
    if (thought.requirements) {
      addMetric(graph, 'requirementCount', thought.requirements.requirements.length);
      addMetric(graph, 'verifiedRequirements', thought.requirements.coverage.verified);
    }
    if (thought.tradeStudy) {
      addMetric(graph, 'alternativeCount', thought.tradeStudy.alternatives.length);
      addMetric(graph, 'recommendation', thought.tradeStudy.recommendation);
    }
    if (thought.fmea) {
      addMetric(graph, 'failureModeCount', thought.fmea.failureModes.length);
      addMetric(graph, 'criticalModes', thought.fmea.summary.criticalModes);
      addMetric(graph, 'maxRpn', thought.fmea.summary.maxRpn);
    }
    if (thought.designDecisions) {
      addMetric(graph, 'decisionCount', thought.designDecisions.decisions.length);
    }
    if (thought.assessment) {
      addMetric(graph, 'confidence', thought.assessment.confidence);
      addMetric(graph, 'riskCount', thought.assessment.keyRisks.length);
    }
  }

  return serializeGraph(graph, { prettyPrint: jsonPrettyPrint, indent: jsonIndent });
}

/**
 * Export engineering analysis to Markdown format
 */
function engineeringToMarkdown(thought: EngineeringThought, options: VisualExportOptions): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
    includeMetrics = true,
  } = options;

  const parts: string[] = [];

  // Overview section
  const overviewContent = keyValueSection({
    'Analysis Type': thought.analysisType.toUpperCase(),
    'Design Challenge': thought.designChallenge.substring(0, 100) + (thought.designChallenge.length > 100 ? '...' : ''),
  });
  parts.push(section('Overview', overviewContent));

  // Requirements Traceability section
  if (thought.requirements && thought.requirements.requirements.length > 0) {
    const reqRows = thought.requirements.requirements.map(req => [
      req.id,
      req.title.substring(0, 40) + (req.title.length > 40 ? '...' : ''),
      req.priority,
      req.status,
      req.source,
    ]);

    let reqContent = table(['ID', 'Title', 'Priority', 'Status', 'Source'], reqRows);

    if (includeMetrics) {
      const cov = thought.requirements.coverage;
      const coveragePercent = (cov.verified / Math.max(cov.total, 1)) * 100;
      reqContent += '\n\n' + keyValueSection({
        'Total Requirements': cov.total,
        'Verified': cov.verified,
        'Traced to Source': cov.tracedToSource,
        'Allocated to Design': cov.allocatedToDesign,
        'Coverage': `${coveragePercent.toFixed(1)}%`,
      });
      reqContent += '\n\n**Verification Progress:**\n\n' + progressBar(coveragePercent);
    }

    parts.push(section('Requirements Traceability', reqContent));
  }

  // Trade Study section
  if (thought.tradeStudy) {
    const criteriaRows = thought.tradeStudy.criteria.map(c => [
      c.name,
      `${(c.weight * 100).toFixed(0)}%`,
      c.description || '-',
    ]);

    const altRows = thought.tradeStudy.alternatives.map(alt => [
      alt.id === thought.tradeStudy!.recommendation ? `⭐ ${alt.name}` : alt.name,
      alt.description.substring(0, 60) + (alt.description.length > 60 ? '...' : ''),
      alt.riskLevel || '-',
      alt.estimatedCost?.toString() || '-',
    ]);

    let tradeContent = `**Objective:** ${thought.tradeStudy.objective}\n\n`;
    tradeContent += '### Criteria\n\n';
    tradeContent += table(['Criterion', 'Weight', 'Description'], criteriaRows);
    tradeContent += '\n\n### Alternatives\n\n';
    tradeContent += table(['Alternative', 'Description', 'Risk Level', 'Cost'], altRows);
    tradeContent += '\n\n**Recommendation:** ' + thought.tradeStudy.recommendation;
    tradeContent += '\n\n**Justification:**\n\n' + thought.tradeStudy.justification;

    parts.push(section('Trade Study: ' + thought.tradeStudy.title, tradeContent));
  }

  // FMEA section
  if (thought.fmea && thought.fmea.failureModes.length > 0) {
    const fmeaRows = thought.fmea.failureModes.map(fm => {
      const isCritical = fm.rpn >= thought.fmea!.rpnThreshold;
      return [
        fm.component,
        fm.failureMode.substring(0, 40) + (fm.failureMode.length > 40 ? '...' : ''),
        fm.severity.toString(),
        fm.occurrence.toString(),
        fm.detection.toString(),
        `${fm.rpn}${isCritical ? ' ⚠️' : ''}`,
        fm.mitigation ? '✓' : '-',
      ];
    });

    let fmeaContent = `**System:** ${thought.fmea.system}\n\n`;
    fmeaContent += table(
      ['Component', 'Failure Mode', 'S', 'O', 'D', 'RPN', 'Mitigation'],
      fmeaRows
    );

    if (includeMetrics) {
      const sum = thought.fmea.summary;
      fmeaContent += '\n\n' + keyValueSection({
        'Total Modes': sum.totalModes,
        'Critical Modes': sum.criticalModes,
        'Average RPN': sum.averageRpn.toFixed(1),
        'Max RPN': sum.maxRpn,
        'RPN Threshold': thought.fmea.rpnThreshold,
      });
    }

    parts.push(section('Failure Mode and Effects Analysis (FMEA)', fmeaContent));
  }

  // Design Decisions section
  if (thought.designDecisions && thought.designDecisions.decisions.length > 0) {
    let decisionsContent = '';

    for (const dec of thought.designDecisions.decisions) {
      decisionsContent += `### ${dec.id}: ${dec.title} (${dec.status})\n\n`;
      decisionsContent += keyValueSection({
        'Status': dec.status,
        'Date': dec.date || '-',
      });
      decisionsContent += '\n\n**Context:**\n\n' + dec.context;
      decisionsContent += '\n\n**Decision:**\n\n' + dec.decision;
      decisionsContent += '\n\n**Rationale:**\n\n' + dec.rationale;

      if (dec.consequences.length > 0) {
        decisionsContent += '\n\n**Consequences:**\n\n' + list(dec.consequences);
      }

      if (dec.supersededBy) {
        decisionsContent += `\n\n*Superseded by: ${dec.supersededBy}*`;
      }

      decisionsContent += '\n\n---\n\n';
    }

    parts.push(section('Design Decisions', decisionsContent));
  }

  // Assessment section
  if (thought.assessment) {
    let assessmentContent = keyValueSection({
      'Confidence': `${(thought.assessment.confidence * 100).toFixed(1)}%`,
      'Key Risks': thought.assessment.keyRisks.length,
      'Open Issues': thought.assessment.openIssues.length,
    });

    assessmentContent += '\n\n**Confidence Level:**\n\n' + progressBar(thought.assessment.confidence * 100);

    if (thought.assessment.keyRisks.length > 0) {
      assessmentContent += '\n\n**Key Risks:**\n\n' + list(thought.assessment.keyRisks.map(r => `⚠️ ${r}`));
    }

    if (thought.assessment.openIssues.length > 0) {
      assessmentContent += '\n\n**Open Issues:**\n\n' + list(thought.assessment.openIssues);
    }

    if (thought.assessment.nextSteps.length > 0) {
      assessmentContent += '\n\n**Next Steps:**\n\n' + list(thought.assessment.nextSteps);
    }

    parts.push(section('Assessment', assessmentContent));
  }

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaidDiagram = engineeringToMermaid(thought, options);
    parts.push(section('Visualization', mermaidBlock(mermaidDiagram)));
  }

  return mdDocument(`Engineering Analysis: ${thought.analysisType}`, parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: {
      mode: 'engineering',
      analysisType: thought.analysisType,
      ...(thought.assessment?.confidence !== undefined ? { confidence: thought.assessment.confidence } : {}),
    },
  });
}
