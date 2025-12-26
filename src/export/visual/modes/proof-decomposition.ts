/**
 * Proof Decomposition Visual Exporter (v8.5.0)
 * Phase 8 Sprint 4: Visual export for proof decomposition structures
 * Phase 13 Sprint 5: Refactored to use fluent builder classes
 *
 * Exports ProofDecomposition to Mermaid, DOT, ASCII, and SVG formats
 * with styled nodes based on statement type:
 * - Axioms: green rounded
 * - Hypotheses: blue rectangle
 * - Derived: gray default
 * - Conclusions: purple diamond
 * - Gaps: red dashed
 */

import type { ProofDecomposition, AtomicStatement } from '../../../types/modes/mathematics.js';
import type { VisualExportOptions } from '../types.js';
import { sanitizeId } from '../utils.js';
// Builder classes (Phase 13)
import { DOTGraphBuilder } from '../utils/dot.js';
import { MermaidGraphBuilder } from '../utils/mermaid.js';
import { ASCIIDocBuilder } from '../utils/ascii.js';
import {
  generateHTMLHeader,
  generateHTMLFooter,
  escapeHTML,
  renderMetricCard,
  renderSection,
  renderTable,
  renderProgressBar,
} from '../utils/html.js';
import {
  sanitizeModelicaId,
  escapeModelicaString,
} from '../utils/modelica.js';
import {
  generateUmlDiagram,
  type UmlNode,
  type UmlEdge,
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
  progressBar,
} from '../utils/markdown.js';

/**
 * Export proof decomposition to visual format
 */
export function exportProofDecomposition(
  decomposition: ProofDecomposition,
  options: VisualExportOptions
): string {
  const {
    format,
    colorScheme = 'default',
    includeLabels = true,
    includeMetrics = true,
    svgWidth = 800,
    svgHeight = 600,
    nodeSpacing = 120,
  } = options;

  switch (format) {
    case 'mermaid':
      return proofDecompositionToMermaid(decomposition, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return proofDecompositionToDOT(decomposition, includeLabels, includeMetrics);
    case 'ascii':
      return proofDecompositionToASCII(decomposition);
    case 'svg':
      return proofDecompositionToSVG(decomposition, colorScheme, includeLabels, includeMetrics, svgWidth, svgHeight, nodeSpacing);
    case 'html':
      return proofDecompositionToHTML(decomposition, options);
    case 'modelica':
      return proofDecompositionToModelica(decomposition, options);
    case 'uml':
      return proofDecompositionToUML(decomposition, options);
    case 'json':
      return proofDecompositionToJSON(decomposition, options);
    case 'markdown':
      return proofDecompositionToMarkdown(decomposition, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

// Note: getMermaidShape and getNodeColor removed in Phase 13 Sprint 5 - now using builder classes

/**
 * Convert proof decomposition to Mermaid format
 */
function proofDecompositionToMermaid(
  decomposition: ProofDecomposition,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  const scheme = colorScheme as 'default' | 'pastel' | 'monochrome';
  const builder = new MermaidGraphBuilder().setDirection('TD');

  // Group atoms by type
  const axioms = decomposition.atoms.filter((a) => a.type === 'axiom');
  const hypotheses = decomposition.atoms.filter((a) => a.type === 'hypothesis');
  const derived = decomposition.atoms.filter((a) => a.type === 'derived' || a.type === 'lemma');
  const conclusions = decomposition.atoms.filter((a) => a.type === 'conclusion');

  // Helper for label
  const getLabel = (atom: AtomicStatement) => includeLabels
    ? atom.statement.substring(0, 40) + (atom.statement.length > 40 ? '...' : '')
    : atom.id;

  // Helper to map type to Mermaid shape
  const typeToShape = (type: AtomicStatement['type']): 'stadium' | 'subroutine' | 'rectangle' | 'hexagon' | 'circle' | 'rhombus' => {
    switch (type) {
      case 'axiom': return 'stadium';
      case 'definition': return 'subroutine';
      case 'hypothesis': return 'rectangle';
      case 'lemma': return 'hexagon';
      case 'conclusion': return 'rhombus';
      default: return 'circle';
    }
  };

  // Helper to get node style based on atom type and color scheme
  const getNodeStyle = (type: AtomicStatement['type']): { fill?: string; stroke?: string } | undefined => {
    if (scheme === 'monochrome') return undefined;
    const colors: Record<AtomicStatement['type'], { fill: string; stroke: string }> = {
      axiom: { fill: '#81c784', stroke: '#388e3c' },
      definition: { fill: '#ba68c8', stroke: '#7b1fa2' },
      hypothesis: { fill: '#64b5f6', stroke: '#1976d2' },
      lemma: { fill: '#ffd54f', stroke: '#ffa000' },
      derived: { fill: '#bdbdbd', stroke: '#616161' },
      conclusion: { fill: '#9575cd', stroke: '#512da8' },
    };
    return colors[type] || colors.derived;
  };

  // Title
  if (decomposition.theorem) {
    builder.addNode({ id: 'title', label: `Proof: ${decomposition.theorem.substring(0, 50)}...` });
  }

  // Add axioms
  const axiomIds: string[] = [];
  for (const atom of axioms) {
    const nodeId = sanitizeId(atom.id);
    builder.addNode({ id: nodeId, label: getLabel(atom), shape: typeToShape(atom.type), style: getNodeStyle(atom.type) });
    axiomIds.push(nodeId);
  }
  if (axiomIds.length > 0) builder.addSubgraph('Axioms', 'Axioms', axiomIds);

  // Add hypotheses
  const hypIds: string[] = [];
  for (const atom of hypotheses) {
    const nodeId = sanitizeId(atom.id);
    builder.addNode({ id: nodeId, label: getLabel(atom), shape: typeToShape(atom.type), style: getNodeStyle(atom.type) });
    hypIds.push(nodeId);
  }
  if (hypIds.length > 0) builder.addSubgraph('Hypotheses', 'Hypotheses', hypIds);

  // Derived statements (no subgraph)
  for (const atom of derived) {
    builder.addNode({ id: sanitizeId(atom.id), label: getLabel(atom), shape: typeToShape(atom.type), style: getNodeStyle(atom.type) });
  }

  // Conclusions
  const concIds: string[] = [];
  for (const atom of conclusions) {
    const nodeId = sanitizeId(atom.id);
    builder.addNode({ id: nodeId, label: getLabel(atom), shape: 'rhombus', style: getNodeStyle(atom.type) });
    concIds.push(nodeId);
  }
  if (concIds.length > 0) builder.addSubgraph('Conclusions', 'Conclusions', concIds);

  // Add dependency edges
  if (decomposition.dependencies?.edges) {
    for (const edge of decomposition.dependencies.edges) {
      builder.addEdge({
        source: sanitizeId(edge.from),
        target: sanitizeId(edge.to),
        label: edge.inferenceRule || undefined,
      });
    }
  }

  // Gaps
  if (decomposition.gaps?.length) {
    const gapIds: string[] = [];
    for (const gap of decomposition.gaps) {
      const gapId = sanitizeId(gap.id);
      builder.addNode({ id: gapId, label: gap.description.substring(0, 30) + '...' });
      builder.addEdge({ source: sanitizeId(gap.location.from), target: gapId, label: 'gap', style: 'dotted' });
      builder.addEdge({ source: gapId, target: sanitizeId(gap.location.to), style: 'dotted' });
      gapIds.push(gapId);
    }
    builder.addSubgraph('Gaps', 'Identified Gaps', gapIds);
  }

  // Metrics
  if (includeMetrics) {
    const metricIds = ['m1', 'm2', 'm3', 'm4'];
    builder
      .addNode({ id: 'm1', label: `Completeness: ${(decomposition.completeness * 100).toFixed(0)}%` })
      .addNode({ id: 'm2', label: `Rigor: ${decomposition.rigorLevel}` })
      .addNode({ id: 'm3', label: `Atoms: ${decomposition.atomCount}` })
      .addNode({ id: 'm4', label: `Depth: ${decomposition.maxDependencyDepth}` })
      .addSubgraph('Metrics', 'Metrics', metricIds);
  }

  return builder.setOptions({ colorScheme: scheme }).render();
}

/**
 * Get DOT node shape for statement type
 */
function getDOTShape(type: AtomicStatement['type']): 'ellipse' | 'box' | 'hexagon' | 'diamond' {
  switch (type) {
    case 'axiom':
      return 'ellipse';
    case 'definition':
      return 'box';
    case 'hypothesis':
      return 'box';
    case 'lemma':
      return 'hexagon';
    case 'derived':
      return 'box';
    case 'conclusion':
      return 'diamond';
    default:
      return 'box';
  }
}

/**
 * Convert proof decomposition to DOT format
 */
function proofDecompositionToDOT(
  decomposition: ProofDecomposition,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  const builder = new DOTGraphBuilder()
    .setGraphName('ProofDecomposition')
    .setRankDir('TB')
    .setNodeDefaults({ style: ['rounded', 'filled'], fontName: 'Arial' })
    .setEdgeDefaults({});

  // Group atoms by type
  const axioms = decomposition.atoms.filter((a) => a.type === 'axiom');
  const hypotheses = decomposition.atoms.filter((a) => a.type === 'hypothesis');
  const derived = decomposition.atoms.filter((a) => a.type === 'derived' || a.type === 'lemma');
  const conclusions = decomposition.atoms.filter((a) => a.type === 'conclusion');

  // Helper for labels
  const getLabel = (atom: AtomicStatement) => includeLabels
    ? atom.statement.substring(0, 40).replace(/"/g, '\\"')
    : atom.id;

  // Axioms
  for (const atom of axioms) {
    builder.addNode({ id: sanitizeId(atom.id), label: getLabel(atom), shape: getDOTShape(atom.type), fillColor: '#81c784' });
  }
  if (axioms.length > 0) {
    builder.addSubgraph({ id: 'cluster_axioms', label: 'Axioms', nodes: axioms.map((a) => sanitizeId(a.id)), style: 'filled', color: '#e8f5e9' });
  }

  // Hypotheses
  for (const atom of hypotheses) {
    builder.addNode({ id: sanitizeId(atom.id), label: getLabel(atom), shape: getDOTShape(atom.type), fillColor: '#64b5f6' });
  }
  if (hypotheses.length > 0) {
    builder.addSubgraph({ id: 'cluster_hypotheses', label: 'Hypotheses', nodes: hypotheses.map((a) => sanitizeId(a.id)), style: 'filled', color: '#e3f2fd' });
  }

  // Derived statements
  for (const atom of derived) {
    const color = atom.type === 'lemma' ? '#ffd54f' : '#bdbdbd';
    builder.addNode({ id: sanitizeId(atom.id), label: getLabel(atom), shape: getDOTShape(atom.type), fillColor: color });
  }

  // Conclusions
  for (const atom of conclusions) {
    builder.addNode({ id: sanitizeId(atom.id), label: getLabel(atom), shape: getDOTShape(atom.type), fillColor: '#9575cd' });
  }
  if (conclusions.length > 0) {
    builder.addSubgraph({ id: 'cluster_conclusions', label: 'Conclusions', nodes: conclusions.map((a) => sanitizeId(a.id)), style: 'filled', color: '#ede7f6' });
  }

  // Dependency edges
  if (decomposition.dependencies?.edges) {
    for (const edge of decomposition.dependencies.edges) {
      builder.addEdge({ source: sanitizeId(edge.from), target: sanitizeId(edge.to), label: edge.inferenceRule });
    }
  }

  // Gaps
  if (decomposition.gaps?.length) {
    for (const gap of decomposition.gaps) {
      const gapId = sanitizeId(gap.id);
      builder.addNode({ id: gapId, label: gap.description.substring(0, 30).replace(/"/g, '\\"'), shape: 'note', fillColor: '#ffcdd2', style: 'dashed' });
      builder.addEdge({ source: sanitizeId(gap.location.from), target: gapId, style: 'dashed', color: 'red' });
      builder.addEdge({ source: gapId, target: sanitizeId(gap.location.to), style: 'dashed', color: 'red' });
    }
  }

  // Metrics
  if (includeMetrics) {
    builder.addNode({ id: 'metrics', label: `Completeness: ${(decomposition.completeness * 100).toFixed(0)}%\\nRigor: ${decomposition.rigorLevel}\\nAtoms: ${decomposition.atomCount}\\nDepth: ${decomposition.maxDependencyDepth}`, shape: 'note' });
    builder.addSubgraph({ id: 'cluster_metrics', label: 'Metrics', nodes: ['metrics'], style: 'filled', color: '#f5f5f5' });
  }

  return builder.render();
}

/**
 * Convert proof decomposition to ASCII format
 */
function proofDecompositionToASCII(decomposition: ProofDecomposition): string {
  const builder = new ASCIIDocBuilder()
    .setBoxStyle('double')
    .addBoxedTitle('PROOF DECOMPOSITION');

  if (decomposition.theorem) {
    builder.addText(`Theorem: ${decomposition.theorem}\n`).addEmptyLine();
  }

  // Metrics summary
  builder.addSection('METRICS')
    .addText(`Completeness: ${(decomposition.completeness * 100).toFixed(0)}%\n`)
    .addText(`Rigor Level:  ${decomposition.rigorLevel}\n`)
    .addText(`Atom Count:   ${decomposition.atomCount}\n`)
    .addText(`Max Depth:    ${decomposition.maxDependencyDepth}\n`)
    .addEmptyLine();

  // Axioms
  const axioms = decomposition.atoms.filter((a) => a.type === 'axiom');
  if (axioms.length > 0) {
    builder.addSection('AXIOMS');
    for (const atom of axioms) {
      builder.addText(`◉ [${atom.id}] ${atom.statement.substring(0, 55)}\n`);
    }
    builder.addEmptyLine();
  }

  // Hypotheses
  const hypotheses = decomposition.atoms.filter((a) => a.type === 'hypothesis');
  if (hypotheses.length > 0) {
    builder.addSection('HYPOTHESES');
    for (const atom of hypotheses) {
      builder.addText(`◆ [${atom.id}] ${atom.statement.substring(0, 55)}\n`);
    }
    builder.addEmptyLine();
  }

  // Derivation chain
  const derived = decomposition.atoms.filter((a) => a.type === 'derived' || a.type === 'lemma');
  if (derived.length > 0) {
    builder.addSection('DERIVATION CHAIN');
    for (const atom of derived) {
      const marker = atom.type === 'lemma' ? '◇' : '○';
      const deps = atom.derivedFrom?.length ? ` ← [${atom.derivedFrom.join(', ')}]` : '';
      builder.addText(`${marker} [${atom.id}] ${atom.statement.substring(0, 45)}${deps}\n`);
      if (atom.usedInferenceRule) {
        builder.addText(`   └─ Rule: ${atom.usedInferenceRule}\n`);
      }
    }
    builder.addEmptyLine();
  }

  // Conclusions
  const conclusions = decomposition.atoms.filter((a) => a.type === 'conclusion');
  if (conclusions.length > 0) {
    builder.addSection('CONCLUSIONS');
    for (const atom of conclusions) {
      const deps = atom.derivedFrom?.length ? ` ← [${atom.derivedFrom.join(', ')}]` : '';
      builder.addText(`★ [${atom.id}] ${atom.statement.substring(0, 45)}${deps}\n`);
    }
    builder.addEmptyLine();
  }

  // Gaps
  if (decomposition.gaps?.length) {
    builder.addSection('GAPS (Missing Steps)');
    for (const gap of decomposition.gaps) {
      const severityIcon = gap.severity === 'critical' ? '⚠' : gap.severity === 'significant' ? '!' : '?';
      builder.addText(`${severityIcon} [${gap.type}] ${gap.description.substring(0, 50)}\n`);
      builder.addText(`   Between: ${gap.location.from} → ${gap.location.to}\n`);
      if (gap.suggestedFix) {
        builder.addText(`   Fix: ${gap.suggestedFix.substring(0, 50)}\n`);
      }
    }
    builder.addEmptyLine();
  }

  // Implicit assumptions
  if (decomposition.implicitAssumptions?.length) {
    builder.addSection('IMPLICIT ASSUMPTIONS');
    for (const assumption of decomposition.implicitAssumptions) {
      builder.addText(`• [${assumption.type}]\n`);
      builder.addText(`   ${assumption.statement.substring(0, 55)}\n`);
      if (assumption.shouldBeExplicit) {
        builder.addText(`   ⚠ Should be explicit\n`);
      }
    }
    builder.addEmptyLine();
  }

  // Dependency tree
  if (decomposition.dependencies?.edges.length) {
    builder.addSection('DEPENDENCY TREE');
    const roots = decomposition.dependencies.roots || [];
    for (const rootId of roots) {
      builder.addText(buildASCIITree(rootId, decomposition, 0, new Set()));
    }
  }

  return builder.render();
}

/**
 * Build ASCII tree from a node
 */
function buildASCIITree(
  nodeId: string,
  decomposition: ProofDecomposition,
  depth: number,
  visited: Set<string>
): string {
  if (visited.has(nodeId) || depth > 10) {
    return '';
  }
  visited.add(nodeId);

  const indent = '│   '.repeat(depth);
  const atom = decomposition.atoms.find((a) => a.id === nodeId);
  if (!atom) return '';

  const typeMarker = {
    axiom: '◉',
    hypothesis: '◆',
    definition: '▣',
    lemma: '◇',
    derived: '○',
    conclusion: '★',
  }[atom.type] || '?';

  let result = `│ ${indent}${typeMarker} ${atom.id}\n`;

  // Find children (edges where this node is the 'from')
  const children = decomposition.dependencies.edges
    .filter((e) => e.from === nodeId)
    .map((e) => e.to);

  for (const childId of children) {
    result += buildASCIITree(childId, decomposition, depth + 1, visited);
  }

  return result;
}

// ============================================================================
// SVG Export Functions
// ============================================================================

/**
 * Node position for SVG layout
 */
interface NodePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: AtomicStatement['type'];
  label: string;
}

/**
 * Get SVG colors for statement type
 */
function getSVGColors(type: AtomicStatement['type'], colorScheme: string): { fill: string; stroke: string } {
  if (colorScheme === 'monochrome') {
    return { fill: '#ffffff', stroke: '#333333' };
  }

  const colors = colorScheme === 'pastel'
    ? {
        axiom: { fill: '#c8e6c9', stroke: '#4caf50' },
        definition: { fill: '#e1bee7', stroke: '#9c27b0' },
        hypothesis: { fill: '#bbdefb', stroke: '#2196f3' },
        lemma: { fill: '#fff9c4', stroke: '#ffc107' },
        derived: { fill: '#e0e0e0', stroke: '#757575' },
        conclusion: { fill: '#d1c4e9', stroke: '#673ab7' },
      }
    : {
        axiom: { fill: '#81c784', stroke: '#388e3c' },
        definition: { fill: '#ba68c8', stroke: '#7b1fa2' },
        hypothesis: { fill: '#64b5f6', stroke: '#1976d2' },
        lemma: { fill: '#ffd54f', stroke: '#ffa000' },
        derived: { fill: '#bdbdbd', stroke: '#616161' },
        conclusion: { fill: '#9575cd', stroke: '#512da8' },
      };

  return colors[type] || colors.derived;
}

/**
 * Escape text for SVG
 */
function escapeSVGText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Truncate text to fit within a width (approximate)
 */
function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars - 3) + '...';
}

/**
 * Render an SVG node based on type
 */
function renderSVGNode(pos: NodePosition, colorScheme: string): string {
  const colors = getSVGColors(pos.type, colorScheme);
  const escapedLabel = escapeSVGText(truncateText(pos.label, 30));

  switch (pos.type) {
    case 'axiom':
      // Rounded rectangle (like stadium shape)
      return `
    <g class="node node-axiom" data-id="${sanitizeId(pos.id)}">
      <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}"
            rx="20" ry="20" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 5}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="12">${escapedLabel}</text>
    </g>`;

    case 'hypothesis':
      // Rectangle
      return `
    <g class="node node-hypothesis" data-id="${sanitizeId(pos.id)}">
      <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}"
            rx="4" ry="4" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 5}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="12">${escapedLabel}</text>
    </g>`;

    case 'conclusion': {
      // Diamond shape
      const cx = pos.x + pos.width / 2;
      const cy = pos.y + pos.height / 2;
      return `
    <g class="node node-conclusion" data-id="${sanitizeId(pos.id)}">
      <polygon points="${cx},${pos.y} ${pos.x + pos.width},${cy} ${cx},${pos.y + pos.height} ${pos.x},${cy}"
               fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${cx}" y="${cy + 5}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="12">${escapedLabel}</text>
    </g>`;
    }

    case 'lemma': {
      // Hexagon
      const hx = pos.x + pos.width / 2;
      const hy = pos.y + pos.height / 2;
      const w = pos.width;
      const h = pos.height;
      return `
    <g class="node node-lemma" data-id="${sanitizeId(pos.id)}">
      <polygon points="${pos.x + w * 0.25},${pos.y} ${pos.x + w * 0.75},${pos.y} ${pos.x + w},${hy} ${pos.x + w * 0.75},${pos.y + h} ${pos.x + w * 0.25},${pos.y + h} ${pos.x},${hy}"
               fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${hx}" y="${hy + 5}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="12">${escapedLabel}</text>
    </g>`;
    }

    case 'definition':
      // Double-bordered rectangle
      return `
    <g class="node node-definition" data-id="${sanitizeId(pos.id)}">
      <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}"
            rx="4" ry="4" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <rect x="${pos.x + 4}" y="${pos.y + 4}" width="${pos.width - 8}" height="${pos.height - 8}"
            rx="2" ry="2" fill="none" stroke="${colors.stroke}" stroke-width="1"/>
      <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 5}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="12">${escapedLabel}</text>
    </g>`;

    default:
      // Default: rounded rectangle
      return `
    <g class="node node-derived" data-id="${sanitizeId(pos.id)}">
      <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}"
            rx="8" ry="8" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 5}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="12">${escapedLabel}</text>
    </g>`;
  }
}

/**
 * Render an SVG edge (arrow)
 */
function renderSVGEdge(
  fromPos: NodePosition,
  toPos: NodePosition,
  label: string | undefined,
  isDashed: boolean = false,
  color: string = '#333333'
): string {
  // Calculate edge points (from bottom of source to top of target)
  const fromX = fromPos.x + fromPos.width / 2;
  const fromY = fromPos.y + fromPos.height;
  const toX = toPos.x + toPos.width / 2;
  const toY = toPos.y;

  // Create curved path
  const midY = (fromY + toY) / 2;
  const path = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY - 8}`;

  const dashStyle = isDashed ? 'stroke-dasharray="5,5"' : '';
  const labelElement = label
    ? `<text x="${(fromX + toX) / 2}" y="${midY - 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">${escapeSVGText(label)}</text>`
    : '';

  return `
    <g class="edge">
      <path d="${path}" fill="none" stroke="${color}" stroke-width="2" ${dashStyle} marker-end="url(#arrowhead)"/>
      ${labelElement}
    </g>`;
}

/**
 * Convert proof decomposition to SVG format
 */
function proofDecompositionToSVG(
  decomposition: ProofDecomposition,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean,
  width: number,
  height: number,
  nodeSpacing: number
): string {
  const nodeWidth = 150;
  const nodeHeight = 40;
  const padding = 40;
  const layerSpacing = nodeSpacing;

  // Group atoms by type for layered layout
  const axioms = decomposition.atoms.filter((a) => a.type === 'axiom');
  const hypotheses = decomposition.atoms.filter((a) => a.type === 'hypothesis');
  const derived = decomposition.atoms.filter((a) => a.type === 'derived' || a.type === 'lemma');
  const conclusions = decomposition.atoms.filter((a) => a.type === 'conclusion');

  // Calculate positions
  const nodePositions = new Map<string, NodePosition>();
  let currentY = padding;

  // Position axioms in first row
  const layer1 = [...axioms, ...hypotheses];
  const layer1Width = layer1.length * (nodeWidth + 20) - 20;
  let startX = (width - layer1Width) / 2;
  for (const atom of layer1) {
    const label = includeLabels ? atom.statement : atom.id;
    nodePositions.set(atom.id, {
      id: atom.id,
      x: startX,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: atom.type,
      label,
    });
    startX += nodeWidth + 20;
  }
  currentY += nodeHeight + layerSpacing;

  // Position derived statements in middle rows
  const derivedWidth = derived.length * (nodeWidth + 20) - 20;
  startX = (width - derivedWidth) / 2;
  for (const atom of derived) {
    const label = includeLabels ? atom.statement : atom.id;
    nodePositions.set(atom.id, {
      id: atom.id,
      x: startX,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: atom.type,
      label,
    });
    startX += nodeWidth + 20;
  }
  currentY += nodeHeight + layerSpacing;

  // Position conclusions in last row
  const conclusionsWidth = conclusions.length * (nodeWidth + 20) - 20;
  startX = (width - conclusionsWidth) / 2;
  for (const atom of conclusions) {
    const label = includeLabels ? atom.statement : atom.id;
    nodePositions.set(atom.id, {
      id: atom.id,
      x: startX,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: atom.type,
      label,
    });
    startX += nodeWidth + 20;
  }
  currentY += nodeHeight + padding;

  // Calculate actual height needed
  const actualHeight = Math.max(height, currentY);

  // Build SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${actualHeight}" width="${width}" height="${actualHeight}">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#333"/>
    </marker>
    <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#e53935"/>
    </marker>
  </defs>

  <style>
    .title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; }
    .section-label { font-family: Arial, sans-serif; font-size: 12px; fill: #666; font-style: italic; }
    .metrics { font-family: Arial, sans-serif; font-size: 11px; fill: #444; }
  </style>

  <!-- Background -->
  <rect width="100%" height="100%" fill="#fafafa"/>
`;

  // Title
  if (decomposition.theorem) {
    svg += `
  <!-- Title -->
  <text x="${width / 2}" y="25" text-anchor="middle" class="title">Proof: ${escapeSVGText(truncateText(decomposition.theorem, 60))}</text>
`;
  }

  // Render edges first (so they appear behind nodes)
  if (decomposition.dependencies && decomposition.dependencies.edges) {
    svg += '\n  <!-- Edges -->\n  <g class="edges">';
    for (const edge of decomposition.dependencies.edges) {
      const fromPos = nodePositions.get(edge.from);
      const toPos = nodePositions.get(edge.to);
      if (fromPos && toPos) {
        svg += renderSVGEdge(fromPos, toPos, edge.inferenceRule);
      }
    }
    svg += '\n  </g>\n';
  }

  // Render gap edges (dashed red)
  if (decomposition.gaps && decomposition.gaps.length > 0) {
    svg += '\n  <!-- Gap Edges -->\n  <g class="gap-edges">';
    for (const gap of decomposition.gaps) {
      const fromPos = nodePositions.get(gap.location.from);
      const toPos = nodePositions.get(gap.location.to);
      if (fromPos && toPos) {
        svg += renderSVGEdge(fromPos, toPos, 'GAP: ' + truncateText(gap.description, 20), true, '#e53935');
      }
    }
    svg += '\n  </g>\n';
  }

  // Render nodes
  svg += '\n  <!-- Nodes -->\n  <g class="nodes">';
  for (const [, pos] of nodePositions) {
    svg += renderSVGNode(pos, colorScheme);
  }
  svg += '\n  </g>\n';

  // Render metrics
  if (includeMetrics) {
    const metricsX = width - 180;
    const metricsY = actualHeight - 100;
    svg += `
  <!-- Metrics -->
  <g class="metrics-panel">
    <rect x="${metricsX}" y="${metricsY}" width="160" height="90" rx="8" fill="#f5f5f5" stroke="#ddd" stroke-width="1"/>
    <text x="${metricsX + 10}" y="${metricsY + 20}" class="metrics" font-weight="bold">Metrics</text>
    <text x="${metricsX + 10}" y="${metricsY + 38}" class="metrics">Completeness: ${(decomposition.completeness * 100).toFixed(0)}%</text>
    <text x="${metricsX + 10}" y="${metricsY + 54}" class="metrics">Rigor: ${decomposition.rigorLevel}</text>
    <text x="${metricsX + 10}" y="${metricsY + 70}" class="metrics">Atoms: ${decomposition.atomCount}</text>
    <text x="${metricsX + 10}" y="${metricsY + 86}" class="metrics">Depth: ${decomposition.maxDependencyDepth}</text>
  </g>
`;
  }

  // Legend
  svg += `
  <!-- Legend -->
  <g class="legend" transform="translate(20, ${actualHeight - 100})">
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Legend</text>
    <rect x="0" y="10" width="20" height="12" rx="6" fill="${getSVGColors('axiom', colorScheme).fill}" stroke="${getSVGColors('axiom', colorScheme).stroke}"/>
    <text x="25" y="20" font-family="Arial, sans-serif" font-size="10">Axiom</text>
    <rect x="0" y="28" width="20" height="12" rx="2" fill="${getSVGColors('hypothesis', colorScheme).fill}" stroke="${getSVGColors('hypothesis', colorScheme).stroke}"/>
    <text x="25" y="38" font-family="Arial, sans-serif" font-size="10">Hypothesis</text>
    <rect x="0" y="46" width="20" height="12" rx="4" fill="${getSVGColors('derived', colorScheme).fill}" stroke="${getSVGColors('derived', colorScheme).stroke}"/>
    <text x="25" y="56" font-family="Arial, sans-serif" font-size="10">Derived</text>
    <polygon points="10,64 20,70 10,76 0,70" fill="${getSVGColors('conclusion', colorScheme).fill}" stroke="${getSVGColors('conclusion', colorScheme).stroke}"/>
    <text x="25" y="74" font-family="Arial, sans-serif" font-size="10">Conclusion</text>
  </g>
`;

  svg += '</svg>';

  return svg;
}

// ============================================================================
// HTML Export Functions
// ============================================================================

/**
 * Convert proof decomposition to HTML format
 */
function proofDecompositionToHTML(
  decomposition: ProofDecomposition,
  options: VisualExportOptions
): string {
  const { colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;
  const theme = colorScheme === 'monochrome' ? 'light' : 'light';

  let html = generateHTMLHeader('Proof Decomposition', { standalone: true, theme });

  // Title section
  if (decomposition.theorem) {
    html += renderSection(
      'Theorem',
      `<p class="theorem-statement">${escapeHTML(decomposition.theorem)}</p>`,
      'info'
    );
  }

  // Metrics section
  if (includeMetrics) {
    const metricsHTML = `
      <div class="metrics-grid">
        ${renderMetricCard('Completeness', `${(decomposition.completeness * 100).toFixed(0)}%`, renderProgressBar(decomposition.completeness * 100))}
        ${renderMetricCard('Rigor Level', decomposition.rigorLevel)}
        ${renderMetricCard('Atom Count', decomposition.atomCount.toString())}
        ${renderMetricCard('Max Depth', decomposition.maxDependencyDepth.toString())}
      </div>
    `;
    html += renderSection('Metrics', metricsHTML);
  }

  // Axioms section
  const axioms = decomposition.atoms.filter((a) => a.type === 'axiom');
  if (axioms.length > 0) {
    const axiomsRows = axioms.map((atom) => [
      atom.id,
      includeLabels ? atom.statement : atom.id,
      atom.type,
    ]);
    html += renderSection('Axioms', renderTable(['ID', 'Statement', 'Type'], axiomsRows), 'success');
  }

  // Hypotheses section
  const hypotheses = decomposition.atoms.filter((a) => a.type === 'hypothesis');
  if (hypotheses.length > 0) {
    const hypothesesRows = hypotheses.map((atom) => [
      atom.id,
      includeLabels ? atom.statement : atom.id,
      atom.type,
    ]);
    html += renderSection('Hypotheses', renderTable(['ID', 'Statement', 'Type'], hypothesesRows), 'info');
  }

  // Derivation chain section
  const derived = decomposition.atoms.filter((a) => a.type === 'derived' || a.type === 'lemma');
  if (derived.length > 0) {
    const derivedRows = derived.map((atom) => {
      const deps = atom.derivedFrom && atom.derivedFrom.length > 0
        ? atom.derivedFrom.join(', ')
        : 'None';
      const rule = atom.usedInferenceRule ? atom.usedInferenceRule : 'N/A';
      return [
        atom.id,
        includeLabels ? atom.statement : atom.id,
        atom.type,
        deps,
        rule,
      ];
    });
    html += renderSection(
      'Derivation Chain',
      renderTable(['ID', 'Statement', 'Type', 'Derived From', 'Inference Rule'], derivedRows)
    );
  }

  // Conclusions section
  const conclusions = decomposition.atoms.filter((a) => a.type === 'conclusion');
  if (conclusions.length > 0) {
    const conclusionsRows = conclusions.map((atom) => {
      const deps = atom.derivedFrom && atom.derivedFrom.length > 0
        ? atom.derivedFrom.join(', ')
        : 'None';
      return [
        atom.id,
        includeLabels ? atom.statement : atom.id,
        atom.type,
        deps,
      ];
    });
    html += renderSection('Conclusions', renderTable(['ID', 'Statement', 'Type', 'Derived From'], conclusionsRows), 'primary');
  }

  // Dependencies section
  if (decomposition.dependencies && decomposition.dependencies.edges && decomposition.dependencies.edges.length > 0) {
    const depsRows = decomposition.dependencies.edges.map((edge) => [
      edge.from,
      edge.to,
      edge.inferenceRule ? edge.inferenceRule : 'Direct',
    ]);
    html += renderSection('Dependencies', renderTable(['From', 'To', 'Inference Rule'], depsRows));
  }

  // Gaps section
  if (decomposition.gaps && decomposition.gaps.length > 0) {
    const gapsRows = decomposition.gaps.map((gap) => [
      gap.id,
      gap.type,
      gap.severity,
      gap.description,
      `${gap.location.from} → ${gap.location.to}`,
      gap.suggestedFix ? gap.suggestedFix : 'N/A',
    ]);
    html += renderSection('Gaps (Missing Steps)', renderTable(['ID', 'Type', 'Severity', 'Description', 'Location', 'Suggested Fix'], gapsRows), 'danger');
  }

  // Implicit assumptions section
  if (decomposition.implicitAssumptions && decomposition.implicitAssumptions.length > 0) {
    const assumptionsRows = decomposition.implicitAssumptions.map((assumption) => [
      assumption.type,
      assumption.statement,
      assumption.shouldBeExplicit ? 'Yes' : 'No',
      assumption.suggestedFormulation || 'N/A',
    ]);
    html += renderSection('Implicit Assumptions', renderTable(['Type', 'Statement', 'Should Be Explicit', 'Suggested Formulation'], assumptionsRows), 'warning');
  }

  html += generateHTMLFooter(true);
  return html;
}

// ============================================================================
// Modelica Export Functions
// ============================================================================

/**
 * Convert proof decomposition to Modelica format
 */
function proofDecompositionToModelica(
  decomposition: ProofDecomposition,
  options: VisualExportOptions
): string {
  const { includeLabels = true, includeMetrics = true } = options;
  const packageName = 'ProofDecomposition';

  let modelica = `package ${packageName}\n`;
  modelica += `  "Proof decomposition structure for: ${escapeModelicaString(decomposition.theorem || 'theorem')}"\n\n`;

  // Add theorem record
  if (decomposition.theorem) {
    modelica += `  record Theorem "Main theorem being proved"\n`;
    modelica += `    String statement = "${escapeModelicaString(decomposition.theorem)}";\n`;
    modelica += `    Real completeness = ${decomposition.completeness};\n`;
    modelica += `    String rigorLevel = "${escapeModelicaString(decomposition.rigorLevel)}";\n`;
    modelica += `    Integer atomCount = ${decomposition.atomCount};\n`;
    modelica += `    Integer maxDepth = ${decomposition.maxDependencyDepth};\n`;
    modelica += `  end Theorem;\n\n`;
  }

  // Add atomic statement record
  modelica += `  record AtomicStatement "Individual statement in the proof"\n`;
  modelica += `    String id "Unique identifier";\n`;
  modelica += `    String statementType "Type: axiom, hypothesis, derived, lemma, conclusion, definition";\n`;
  modelica += `    String statement "The mathematical statement";\n`;
  modelica += `  end AtomicStatement;\n\n`;

  // Group atoms by type
  const axioms = decomposition.atoms.filter((a) => a.type === 'axiom');
  const hypotheses = decomposition.atoms.filter((a) => a.type === 'hypothesis');
  const lemmas = decomposition.atoms.filter((a) => a.type === 'lemma');
  const derived = decomposition.atoms.filter((a) => a.type === 'derived');
  const conclusions = decomposition.atoms.filter((a) => a.type === 'conclusion');

  // Axioms
  if (axioms.length > 0) {
    modelica += `  // Axioms (${axioms.length})\n`;
    for (const atom of axioms) {
      const atomId = sanitizeModelicaId(atom.id);
      const statement = includeLabels ? escapeModelicaString(atom.statement) : atom.id;
      modelica += `  AtomicStatement ${atomId}(\n`;
      modelica += `    id="${escapeModelicaString(atom.id)}",\n`;
      modelica += `    statementType="${atom.type}",\n`;
      modelica += `    statement="${statement}"\n`;
      modelica += `  );\n`;
    }
    modelica += '\n';
  }

  // Hypotheses
  if (hypotheses.length > 0) {
    modelica += `  // Hypotheses (${hypotheses.length})\n`;
    for (const atom of hypotheses) {
      const atomId = sanitizeModelicaId(atom.id);
      const statement = includeLabels ? escapeModelicaString(atom.statement) : atom.id;
      modelica += `  AtomicStatement ${atomId}(\n`;
      modelica += `    id="${escapeModelicaString(atom.id)}",\n`;
      modelica += `    statementType="${atom.type}",\n`;
      modelica += `    statement="${statement}"\n`;
      modelica += `  );\n`;
    }
    modelica += '\n';
  }

  // Lemmas
  if (lemmas.length > 0) {
    modelica += `  // Lemmas (${lemmas.length})\n`;
    for (const atom of lemmas) {
      const atomId = sanitizeModelicaId(atom.id);
      const statement = includeLabels ? escapeModelicaString(atom.statement) : atom.id;
      modelica += `  AtomicStatement ${atomId}(\n`;
      modelica += `    id="${escapeModelicaString(atom.id)}",\n`;
      modelica += `    statementType="${atom.type}",\n`;
      modelica += `    statement="${statement}"\n`;
      modelica += `  );\n`;
    }
    modelica += '\n';
  }

  // Derived statements
  if (derived.length > 0) {
    modelica += `  // Derived Statements (${derived.length})\n`;
    for (const atom of derived) {
      const atomId = sanitizeModelicaId(atom.id);
      const statement = includeLabels ? escapeModelicaString(atom.statement) : atom.id;
      modelica += `  AtomicStatement ${atomId}(\n`;
      modelica += `    id="${escapeModelicaString(atom.id)}",\n`;
      modelica += `    statementType="${atom.type}",\n`;
      modelica += `    statement="${statement}"\n`;
      modelica += `  );\n`;
    }
    modelica += '\n';
  }

  // Conclusions
  if (conclusions.length > 0) {
    modelica += `  // Conclusions (${conclusions.length})\n`;
    for (const atom of conclusions) {
      const atomId = sanitizeModelicaId(atom.id);
      const statement = includeLabels ? escapeModelicaString(atom.statement) : atom.id;
      modelica += `  AtomicStatement ${atomId}(\n`;
      modelica += `    id="${escapeModelicaString(atom.id)}",\n`;
      modelica += `    statementType="${atom.type}",\n`;
      modelica += `    statement="${statement}"\n`;
      modelica += `  );\n`;
    }
    modelica += '\n';
  }

  // Add dependency information as comments
  if (decomposition.dependencies && decomposition.dependencies.edges && decomposition.dependencies.edges.length > 0) {
    modelica += `  // Dependencies (${decomposition.dependencies.edges.length} edges)\n`;
    modelica += `  /* Proof structure:\n`;
    for (const edge of decomposition.dependencies.edges) {
      const rule = edge.inferenceRule ? ` [${edge.inferenceRule}]` : '';
      modelica += `   * ${edge.from} -> ${edge.to}${rule}\n`;
    }
    modelica += `   */\n\n`;
  }

  // Add gaps as comments if present
  if (decomposition.gaps && decomposition.gaps.length > 0) {
    modelica += `  // Identified Gaps (${decomposition.gaps.length})\n`;
    modelica += `  /* Gaps in proof:\n`;
    for (const gap of decomposition.gaps) {
      modelica += `   * [${gap.severity}] ${gap.type}: ${gap.description}\n`;
      modelica += `   *   Location: ${gap.location.from} -> ${gap.location.to}\n`;
      if (gap.suggestedFix) {
        modelica += `   *   Fix: ${gap.suggestedFix}\n`;
      }
    }
    modelica += `   */\n\n`;
  }

  // Add metrics as annotation
  if (includeMetrics) {
    modelica += `  annotation(\n`;
    modelica += `    Documentation(info="<html>\n`;
    modelica += `      <h3>Proof Metrics</h3>\n`;
    modelica += `      <ul>\n`;
    modelica += `        <li>Completeness: ${(decomposition.completeness * 100).toFixed(0)}%</li>\n`;
    modelica += `        <li>Rigor Level: ${decomposition.rigorLevel}</li>\n`;
    modelica += `        <li>Atom Count: ${decomposition.atomCount}</li>\n`;
    modelica += `        <li>Max Dependency Depth: ${decomposition.maxDependencyDepth}</li>\n`;
    modelica += `      </ul>\n`;
    modelica += `    </html>")\n`;
    modelica += `  );\n`;
  }

  modelica += `end ${packageName};\n`;
  return modelica;
}

// ============================================================================
// UML Export Functions
// ============================================================================

/**
 * Convert proof decomposition to UML format
 */
function proofDecompositionToUML(
  decomposition: ProofDecomposition,
  options: VisualExportOptions
): string {
  const { includeLabels = true, includeMetrics = true } = options;

  const nodes: UmlNode[] = [];
  const edges: UmlEdge[] = [];

  // Create nodes for all atoms
  for (const atom of decomposition.atoms) {
    const label = includeLabels
      ? atom.statement.substring(0, 40) + (atom.statement.length > 40 ? '...' : '')
      : atom.id;

    // Determine stereotype based on type
    let stereotype = '';
    switch (atom.type) {
      case 'axiom':
        stereotype = '«axiom»';
        break;
      case 'hypothesis':
        stereotype = '«hypothesis»';
        break;
      case 'lemma':
        stereotype = '«lemma»';
        break;
      case 'conclusion':
        stereotype = '«conclusion»';
        break;
      case 'definition':
        stereotype = '«definition»';
        break;
      default:
        stereotype = '«derived»';
    }

    nodes.push({
      id: atom.id,
      label: `${stereotype}\\n${label}`,
      shape: 'class', // Use class notation
      stereotype: atom.type,
    });
  }

  // Create edges from dependencies
  if (decomposition.dependencies && decomposition.dependencies.edges) {
    for (const edge of decomposition.dependencies.edges) {
      edges.push({
        source: edge.from,
        target: edge.to,
        label: edge.inferenceRule || 'derives',
        type: 'dependency', // UML dependency arrow
      });
    }
  }

  // Add gap edges
  if (decomposition.gaps && decomposition.gaps.length > 0) {
    for (const gap of decomposition.gaps) {
      edges.push({
        source: gap.location.from,
        target: gap.location.to,
        label: `GAP: ${gap.description.substring(0, 20)}`,
        type: 'dashed',
      });
    }
  }

  // Generate UML diagram
  let uml = generateUmlDiagram(nodes, edges, {
    title: `Proof Structure: ${decomposition.theorem?.substring(0, 50) || 'Proof Decomposition'}`,
    direction: 'top to bottom',
  });

  // Add notes for metrics
  if (includeMetrics) {
    uml += '\n\nnote right of diagram\n';
    uml += '  **Proof Metrics**\n';
    uml += `  Completeness: ${(decomposition.completeness * 100).toFixed(0)}%\n`;
    uml += `  Rigor: ${decomposition.rigorLevel}\n`;
    uml += `  Atoms: ${decomposition.atomCount}\n`;
    uml += `  Depth: ${decomposition.maxDependencyDepth}\n`;
    uml += 'end note\n';
  }

  // Add legend for statement types
  uml += '\nlegend right\n';
  uml += '  |= Type |= Symbol |\n';
  uml += '  | Axiom | «axiom» |\n';
  uml += '  | Hypothesis | «hypothesis» |\n';
  uml += '  | Lemma | «lemma» |\n';
  uml += '  | Derived | «derived» |\n';
  uml += '  | Conclusion | «conclusion» |\n';
  uml += 'endlegend\n';

  return uml;
}

// ============================================================================
// JSON Export Functions
// ============================================================================

/**
 * Convert proof decomposition to JSON format
 */
function proofDecompositionToJSON(
  decomposition: ProofDecomposition,
  options: VisualExportOptions
): string {
  const { includeLabels = true, includeMetrics = true } = options;

  // Create graph structure
  const graph = createJsonGraph(
    decomposition.theorem?.substring(0, 50) || 'Proof Decomposition',
    'mathematics',
    { includeMetrics, includeLayout: true }
  );

  // Add metadata to graph.metadata
  if (decomposition.theorem) {
    graph.metadata.theorem = decomposition.theorem;
    graph.metadata.completeness = decomposition.completeness;
    graph.metadata.rigorLevel = decomposition.rigorLevel;
    graph.metadata.atomCount = decomposition.atomCount;
    graph.metadata.maxDependencyDepth = decomposition.maxDependencyDepth;
  }

  // Add nodes for all atoms
  for (const atom of decomposition.atoms) {
    const label = includeLabels ? atom.statement : atom.id;
    addNode(graph, {
      id: atom.id,
      label,
      type: atom.type,
      shape: atom.type === 'conclusion' ? 'diamond' : atom.type === 'axiom' ? 'stadium' : 'rectangle',
      metadata: {
        statement: atom.statement,
        derivedFrom: atom.derivedFrom || [],
        usedInferenceRule: atom.usedInferenceRule || null,
      },
    });
  }

  // Add edges from dependencies
  if (decomposition.dependencies && decomposition.dependencies.edges) {
    let edgeId = 0;
    for (const edge of decomposition.dependencies.edges) {
      addEdge(graph, {
        id: `edge_${edgeId++}`,
        source: edge.from,
        target: edge.to,
        label: edge.inferenceRule,
        type: 'inference',
        directed: true,
        style: 'solid',
      });
    }
  }

  // Add gap edges
  if (decomposition.gaps && decomposition.gaps.length > 0) {
    let gapId = 0;
    for (const gap of decomposition.gaps) {
      addEdge(graph, {
        id: `gap_${gapId++}`,
        source: gap.location.from,
        target: gap.location.to,
        label: `GAP: ${gap.description.substring(0, 30)}`,
        type: 'gap',
        directed: true,
        style: 'dashed',
        metadata: {
          gapType: gap.type,
          severity: gap.severity,
          description: gap.description,
          suggestedFix: gap.suggestedFix || null,
        },
      });
    }
  }

  // Add metrics
  if (includeMetrics) {
    addMetric(graph, 'completeness', decomposition.completeness);
    addMetric(graph, 'rigorLevel', decomposition.rigorLevel);
    addMetric(graph, 'atomCount', decomposition.atomCount);
    addMetric(graph, 'maxDependencyDepth', decomposition.maxDependencyDepth);
  }

  // Add implicit assumptions to metadata
  if (decomposition.implicitAssumptions && decomposition.implicitAssumptions.length > 0) {
    graph.metadata.implicitAssumptions = decomposition.implicitAssumptions.map((assumption) => ({
      type: assumption.type,
      statement: assumption.statement,
      shouldBeExplicit: assumption.shouldBeExplicit || false,
      suggestedFormulation: assumption.suggestedFormulation || null,
    }));
  }

  // Add gaps summary to metadata
  if (decomposition.gaps && decomposition.gaps.length > 0) {
    graph.metadata.gaps = decomposition.gaps.map((gap) => ({
      id: gap.id,
      type: gap.type,
      severity: gap.severity,
      description: gap.description,
      location: gap.location,
      suggestedFix: gap.suggestedFix || null,
    }));
  }

  return serializeGraph(graph, { prettyPrint: true });
}

/**
 * Export proof decomposition to Markdown format
 */
function proofDecompositionToMarkdown(
  decomposition: ProofDecomposition,
  options: VisualExportOptions
): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
    includeMetrics = true,
  } = options;

  const parts: string[] = [];

  // Theorem section
  if (decomposition.theorem) {
    parts.push(section('Theorem', decomposition.theorem));
  }

  // Metrics section
  if (includeMetrics) {
    const metricsContent = keyValueSection({
      'Completeness': `${(decomposition.completeness * 100).toFixed(0)}%`,
      'Rigor Level': decomposition.rigorLevel,
      'Atom Count': decomposition.atomCount,
      'Max Dependency Depth': decomposition.maxDependencyDepth,
    });

    let metricsFull = metricsContent;
    metricsFull += '\n\n**Completeness:**\n\n' + progressBar(decomposition.completeness * 100);

    parts.push(section('Metrics', metricsFull));
  }

  // Axioms section
  const axioms = decomposition.atoms.filter((a) => a.type === 'axiom');
  if (axioms.length > 0) {
    const axiomRows = axioms.map(atom => [
      atom.id,
      atom.statement.substring(0, 100) + (atom.statement.length > 100 ? '...' : ''),
    ]);
    parts.push(section('Axioms', table(['ID', 'Statement'], axiomRows)));
  }

  // Hypotheses section
  const hypotheses = decomposition.atoms.filter((a) => a.type === 'hypothesis');
  if (hypotheses.length > 0) {
    const hypothesesRows = hypotheses.map(atom => [
      atom.id,
      atom.statement.substring(0, 100) + (atom.statement.length > 100 ? '...' : ''),
    ]);
    parts.push(section('Hypotheses', table(['ID', 'Statement'], hypothesesRows)));
  }

  // Definitions section
  const definitions = decomposition.atoms.filter((a) => a.type === 'definition');
  if (definitions.length > 0) {
    const definitionsRows = definitions.map(atom => [
      atom.id,
      atom.statement.substring(0, 100) + (atom.statement.length > 100 ? '...' : ''),
    ]);
    parts.push(section('Definitions', table(['ID', 'Statement'], definitionsRows)));
  }

  // Lemmas section
  const lemmas = decomposition.atoms.filter((a) => a.type === 'lemma');
  if (lemmas.length > 0) {
    const lemmasRows = lemmas.map(atom => [
      atom.id,
      atom.statement.substring(0, 80) + (atom.statement.length > 80 ? '...' : ''),
      atom.derivedFrom ? atom.derivedFrom.join(', ') : '-',
      atom.usedInferenceRule || '-',
    ]);
    parts.push(section('Lemmas', table(['ID', 'Statement', 'Derived From', 'Rule'], lemmasRows)));
  }

  // Derived statements section
  const derived = decomposition.atoms.filter((a) => a.type === 'derived');
  if (derived.length > 0) {
    const derivedRows = derived.map(atom => [
      atom.id,
      atom.statement.substring(0, 80) + (atom.statement.length > 80 ? '...' : ''),
      atom.derivedFrom ? atom.derivedFrom.join(', ') : '-',
      atom.usedInferenceRule || '-',
    ]);
    parts.push(section('Derived Statements', table(['ID', 'Statement', 'Derived From', 'Rule'], derivedRows)));
  }

  // Conclusions section
  const conclusions = decomposition.atoms.filter((a) => a.type === 'conclusion');
  if (conclusions.length > 0) {
    const conclusionsRows = conclusions.map(atom => [
      atom.id,
      atom.statement.substring(0, 100) + (atom.statement.length > 100 ? '...' : ''),
      atom.derivedFrom ? atom.derivedFrom.join(', ') : '-',
    ]);
    parts.push(section('Conclusions', table(['ID', 'Statement', 'Derived From'], conclusionsRows)));
  }

  // Dependencies section
  if (decomposition.dependencies && decomposition.dependencies.edges && decomposition.dependencies.edges.length > 0) {
    const depsRows = decomposition.dependencies.edges.map(edge => [
      edge.from,
      edge.to,
      edge.inferenceRule || 'Direct',
    ]);
    parts.push(section('Dependencies', table(['From', 'To', 'Inference Rule'], depsRows)));
  }

  // Gaps section
  if (decomposition.gaps && decomposition.gaps.length > 0) {
    const gapsRows = decomposition.gaps.map(gap => [
      gap.id,
      gap.type,
      gap.severity,
      gap.description.substring(0, 60) + (gap.description.length > 60 ? '...' : ''),
      `${gap.location.from} → ${gap.location.to}`,
      gap.suggestedFix ? gap.suggestedFix.substring(0, 40) : '-',
    ]);
    parts.push(section('Identified Gaps', table(
      ['ID', 'Type', 'Severity', 'Description', 'Location', 'Suggested Fix'],
      gapsRows
    )));
  }

  // Implicit assumptions section
  if (decomposition.implicitAssumptions && decomposition.implicitAssumptions.length > 0) {
    const assumptionsRows = decomposition.implicitAssumptions.map(assumption => [
      assumption.type,
      assumption.statement.substring(0, 80) + (assumption.statement.length > 80 ? '...' : ''),
      assumption.shouldBeExplicit ? 'Yes' : 'No',
      assumption.suggestedFormulation ? assumption.suggestedFormulation.substring(0, 50) : '-',
    ]);
    parts.push(section('Implicit Assumptions', table(
      ['Type', 'Statement', 'Should Be Explicit', 'Suggested Formulation'],
      assumptionsRows
    )));
  }

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaidDiagram = proofDecompositionToMermaid(decomposition, 'default', true, true);
    parts.push(section('Proof Structure Diagram', mermaidBlock(mermaidDiagram)));
  }

  return mdDocument('Proof Decomposition Analysis', parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: {
      mode: 'proof-decomposition',
      completeness: decomposition.completeness,
      rigorLevel: decomposition.rigorLevel,
      atomCount: decomposition.atomCount,
    },
  });
}
