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
