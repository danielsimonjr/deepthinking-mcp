/**
 * Proof Decomposition Visual Exporter (v7.0.0)
 * Phase 8 Sprint 4: Visual export for proof decomposition structures
 *
 * Exports ProofDecomposition to Mermaid, DOT, ASCII, and SVG formats
 * with styled nodes based on statement type:
 * - Axioms: green rounded
 * - Hypotheses: blue rectangle
 * - Derived: gray default
 * - Conclusions: purple diamond
 * - Gaps: red dashed
 */

import type { ProofDecomposition, AtomicStatement } from '../../types/modes/mathematics.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';

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
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Get node shape for Mermaid based on statement type
 */
function getMermaidShape(type: AtomicStatement['type']): [string, string] {
  switch (type) {
    case 'axiom':
      return ['([', '])'];  // Stadium/rounded
    case 'definition':
      return ['[[', ']]'];  // Subroutine
    case 'hypothesis':
      return ['[', ']'];    // Rectangle
    case 'lemma':
      return ['{{', '}}'];  // Hexagon
    case 'derived':
      return ['(', ')'];    // Default rounded
    case 'conclusion':
      return ['{', '}'];    // Diamond shape via styling
    default:
      return ['(', ')'];
  }
}

/**
 * Get color for statement type
 */
function getNodeColor(type: AtomicStatement['type'], colorScheme: string): string {
  if (colorScheme === 'monochrome') return '#ffffff';

  const colors = colorScheme === 'pastel'
    ? {
        axiom: '#c8e6c9',      // Light green
        definition: '#e1bee7',  // Light purple
        hypothesis: '#bbdefb',  // Light blue
        lemma: '#fff9c4',       // Light yellow
        derived: '#e0e0e0',     // Light gray
        conclusion: '#d1c4e9',  // Light purple
      }
    : {
        axiom: '#81c784',      // Green
        definition: '#ba68c8',  // Purple
        hypothesis: '#64b5f6',  // Blue
        lemma: '#ffd54f',       // Yellow
        derived: '#bdbdbd',     // Gray
        conclusion: '#9575cd',  // Purple
      };

  return colors[type] || colors.derived;
}

/**
 * Convert proof decomposition to Mermaid format
 */
function proofDecompositionToMermaid(
  decomposition: ProofDecomposition,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TD\n';

  // Add title
  if (decomposition.theorem) {
    mermaid += `  title["Proof: ${decomposition.theorem.substring(0, 50)}..."]\n`;
    mermaid += '  style title fill:#f5f5f5,stroke:#333\n\n';
  }

  // Group atoms by type
  const axioms = decomposition.atoms.filter((a) => a.type === 'axiom');
  const hypotheses = decomposition.atoms.filter((a) => a.type === 'hypothesis');
  const derived = decomposition.atoms.filter((a) => a.type === 'derived' || a.type === 'lemma');
  const conclusions = decomposition.atoms.filter((a) => a.type === 'conclusion');

  // Axioms subgraph
  if (axioms.length > 0) {
    mermaid += '  subgraph Axioms["Axioms"]\n';
    for (const atom of axioms) {
      const nodeId = sanitizeId(atom.id);
      const label = includeLabels
        ? atom.statement.substring(0, 40) + (atom.statement.length > 40 ? '...' : '')
        : atom.id;
      const [open, close] = getMermaidShape(atom.type);
      mermaid += `    ${nodeId}${open}"${label}"${close}\n`;
    }
    mermaid += '  end\n\n';
  }

  // Hypotheses subgraph
  if (hypotheses.length > 0) {
    mermaid += '  subgraph Hypotheses["Hypotheses"]\n';
    for (const atom of hypotheses) {
      const nodeId = sanitizeId(atom.id);
      const label = includeLabels
        ? atom.statement.substring(0, 40) + (atom.statement.length > 40 ? '...' : '')
        : atom.id;
      const [open, close] = getMermaidShape(atom.type);
      mermaid += `    ${nodeId}${open}"${label}"${close}\n`;
    }
    mermaid += '  end\n\n';
  }

  // Derived statements (no subgraph, just nodes)
  for (const atom of derived) {
    const nodeId = sanitizeId(atom.id);
    const label = includeLabels
      ? atom.statement.substring(0, 40) + (atom.statement.length > 40 ? '...' : '')
      : atom.id;
    const [open, close] = getMermaidShape(atom.type);
    mermaid += `  ${nodeId}${open}"${label}"${close}\n`;
  }

  // Conclusions subgraph
  if (conclusions.length > 0) {
    mermaid += '\n  subgraph Conclusions["Conclusions"]\n';
    for (const atom of conclusions) {
      const nodeId = sanitizeId(atom.id);
      const label = includeLabels
        ? atom.statement.substring(0, 40) + (atom.statement.length > 40 ? '...' : '')
        : atom.id;
      mermaid += `    ${nodeId}{"${label}"}\n`;  // Diamond shape
    }
    mermaid += '  end\n\n';
  }

  // Add edges from dependency graph
  if (decomposition.dependencies && decomposition.dependencies.edges) {
    for (const edge of decomposition.dependencies.edges) {
      const fromId = sanitizeId(edge.from);
      const toId = sanitizeId(edge.to);
      const edgeLabel = edge.inferenceRule ? ` -->|${edge.inferenceRule}| ` : ' --> ';
      mermaid += `  ${fromId}${edgeLabel}${toId}\n`;
    }
  }

  // Add gaps as dashed nodes
  if (decomposition.gaps && decomposition.gaps.length > 0) {
    mermaid += '\n  subgraph Gaps["Identified Gaps"]\n';
    for (const gap of decomposition.gaps) {
      const gapId = sanitizeId(gap.id);
      const label = gap.description.substring(0, 30) + '...';
      mermaid += `    ${gapId}["${label}"]\n`;
      mermaid += `    ${sanitizeId(gap.location.from)} -.->|gap| ${gapId}\n`;
      mermaid += `    ${gapId} -.-> ${sanitizeId(gap.location.to)}\n`;
    }
    mermaid += '  end\n';
  }

  // Add metrics
  if (includeMetrics) {
    mermaid += '\n  subgraph Metrics["Metrics"]\n';
    mermaid += `    m1["Completeness: ${(decomposition.completeness * 100).toFixed(0)}%"]\n`;
    mermaid += `    m2["Rigor: ${decomposition.rigorLevel}"]\n`;
    mermaid += `    m3["Atoms: ${decomposition.atomCount}"]\n`;
    mermaid += `    m4["Depth: ${decomposition.maxDependencyDepth}"]\n`;
    mermaid += '  end\n';
  }

  // Apply colors
  if (colorScheme !== 'monochrome') {
    mermaid += '\n';
    for (const atom of decomposition.atoms) {
      const nodeId = sanitizeId(atom.id);
      const color = getNodeColor(atom.type, colorScheme);
      mermaid += `  style ${nodeId} fill:${color}\n`;
    }

    // Style gaps as red dashed
    if (decomposition.gaps) {
      for (const gap of decomposition.gaps) {
        const gapId = sanitizeId(gap.id);
        mermaid += `  style ${gapId} fill:#ffcdd2,stroke:#e53935,stroke-dasharray: 5 5\n`;
      }
    }
  }

  return mermaid;
}

/**
 * Get DOT node shape for statement type
 */
function getDOTShape(type: AtomicStatement['type']): string {
  switch (type) {
    case 'axiom':
      return 'ellipse';
    case 'definition':
      return 'box3d';
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
  let dot = 'digraph ProofDecomposition {\n';
  dot += '  rankdir=TB;\n';
  dot += '  compound=true;\n';
  dot += '  node [style="rounded,filled", fontname="Arial"];\n';
  dot += '  edge [fontname="Arial", fontsize=10];\n\n';

  // Title
  if (decomposition.theorem) {
    dot += `  label="Proof: ${decomposition.theorem.substring(0, 60)}...";\n`;
    dot += '  labelloc=t;\n';
    dot += '  fontsize=14;\n\n';
  }

  // Group atoms by type for clustering
  const axioms = decomposition.atoms.filter((a) => a.type === 'axiom');
  const hypotheses = decomposition.atoms.filter((a) => a.type === 'hypothesis');
  const conclusions = decomposition.atoms.filter((a) => a.type === 'conclusion');

  // Axioms cluster
  if (axioms.length > 0) {
    dot += '  subgraph cluster_axioms {\n';
    dot += '    label="Axioms";\n';
    dot += '    style=filled;\n';
    dot += '    color="#e8f5e9";\n';
    for (const atom of axioms) {
      const nodeId = sanitizeId(atom.id);
      const label = includeLabels
        ? atom.statement.substring(0, 40).replace(/"/g, '\\"')
        : atom.id;
      dot += `    ${nodeId} [label="${label}", shape=${getDOTShape(atom.type)}, fillcolor="#81c784"];\n`;
    }
    dot += '  }\n\n';
  }

  // Hypotheses cluster
  if (hypotheses.length > 0) {
    dot += '  subgraph cluster_hypotheses {\n';
    dot += '    label="Hypotheses";\n';
    dot += '    style=filled;\n';
    dot += '    color="#e3f2fd";\n';
    for (const atom of hypotheses) {
      const nodeId = sanitizeId(atom.id);
      const label = includeLabels
        ? atom.statement.substring(0, 40).replace(/"/g, '\\"')
        : atom.id;
      dot += `    ${nodeId} [label="${label}", shape=${getDOTShape(atom.type)}, fillcolor="#64b5f6"];\n`;
    }
    dot += '  }\n\n';
  }

  // Derived statements (middle layer)
  const derived = decomposition.atoms.filter((a) => a.type === 'derived' || a.type === 'lemma');
  for (const atom of derived) {
    const nodeId = sanitizeId(atom.id);
    const label = includeLabels
      ? atom.statement.substring(0, 40).replace(/"/g, '\\"')
      : atom.id;
    const color = atom.type === 'lemma' ? '#ffd54f' : '#bdbdbd';
    dot += `  ${nodeId} [label="${label}", shape=${getDOTShape(atom.type)}, fillcolor="${color}"];\n`;
  }
  dot += '\n';

  // Conclusions cluster
  if (conclusions.length > 0) {
    dot += '  subgraph cluster_conclusions {\n';
    dot += '    label="Conclusions";\n';
    dot += '    style=filled;\n';
    dot += '    color="#ede7f6";\n';
    for (const atom of conclusions) {
      const nodeId = sanitizeId(atom.id);
      const label = includeLabels
        ? atom.statement.substring(0, 40).replace(/"/g, '\\"')
        : atom.id;
      dot += `    ${nodeId} [label="${label}", shape=${getDOTShape(atom.type)}, fillcolor="#9575cd"];\n`;
    }
    dot += '  }\n\n';
  }

  // Add edges
  if (decomposition.dependencies && decomposition.dependencies.edges) {
    for (const edge of decomposition.dependencies.edges) {
      const fromId = sanitizeId(edge.from);
      const toId = sanitizeId(edge.to);
      const edgeLabel = edge.inferenceRule ? ` [label="${edge.inferenceRule}"]` : '';
      dot += `  ${fromId} -> ${toId}${edgeLabel};\n`;
    }
  }

  // Add gaps
  if (decomposition.gaps && decomposition.gaps.length > 0) {
    dot += '\n  // Gaps (dashed red)\n';
    for (const gap of decomposition.gaps) {
      const gapId = sanitizeId(gap.id);
      const label = gap.description.substring(0, 30).replace(/"/g, '\\"');
      dot += `  ${gapId} [label="${label}", shape=note, fillcolor="#ffcdd2", style="dashed,filled"];\n`;
      dot += `  ${sanitizeId(gap.location.from)} -> ${gapId} [style=dashed, color=red];\n`;
      dot += `  ${gapId} -> ${sanitizeId(gap.location.to)} [style=dashed, color=red];\n`;
    }
  }

  // Add metrics
  if (includeMetrics) {
    dot += '\n  // Metrics\n';
    dot += '  subgraph cluster_metrics {\n';
    dot += '    label="Metrics";\n';
    dot += '    style=filled;\n';
    dot += '    color="#f5f5f5";\n';
    dot += `    metrics [label="Completeness: ${(decomposition.completeness * 100).toFixed(0)}%\\nRigor: ${decomposition.rigorLevel}\\nAtoms: ${decomposition.atomCount}\\nDepth: ${decomposition.maxDependencyDepth}", shape=note];\n`;
    dot += '  }\n';
  }

  dot += '}\n';
  return dot;
}

/**
 * Convert proof decomposition to ASCII format
 */
function proofDecompositionToASCII(decomposition: ProofDecomposition): string {
  let ascii = '';

  // Title
  ascii += '╔════════════════════════════════════════════════════════════════╗\n';
  ascii += '║                    PROOF DECOMPOSITION                         ║\n';
  ascii += '╚════════════════════════════════════════════════════════════════╝\n\n';

  if (decomposition.theorem) {
    ascii += `Theorem: ${decomposition.theorem}\n\n`;
  }

  // Metrics summary
  ascii += '┌─────────────────────────────────────────────────────────────────┐\n';
  ascii += '│ METRICS                                                         │\n';
  ascii += '├─────────────────────────────────────────────────────────────────┤\n';
  ascii += `│ Completeness: ${(decomposition.completeness * 100).toFixed(0)}%`.padEnd(66) + '│\n';
  ascii += `│ Rigor Level:  ${decomposition.rigorLevel}`.padEnd(66) + '│\n';
  ascii += `│ Atom Count:   ${decomposition.atomCount}`.padEnd(66) + '│\n';
  ascii += `│ Max Depth:    ${decomposition.maxDependencyDepth}`.padEnd(66) + '│\n';
  ascii += '└─────────────────────────────────────────────────────────────────┘\n\n';

  // Axioms
  const axioms = decomposition.atoms.filter((a) => a.type === 'axiom');
  if (axioms.length > 0) {
    ascii += '┌─ AXIOMS ────────────────────────────────────────────────────────┐\n';
    for (const atom of axioms) {
      const marker = '◉';  // Filled circle for axioms
      const line = `│ ${marker} [${atom.id}] ${atom.statement}`;
      ascii += line.substring(0, 65).padEnd(66) + '│\n';
    }
    ascii += '└─────────────────────────────────────────────────────────────────┘\n\n';
  }

  // Hypotheses
  const hypotheses = decomposition.atoms.filter((a) => a.type === 'hypothesis');
  if (hypotheses.length > 0) {
    ascii += '┌─ HYPOTHESES ────────────────────────────────────────────────────┐\n';
    for (const atom of hypotheses) {
      const marker = '◆';  // Diamond for hypotheses
      const line = `│ ${marker} [${atom.id}] ${atom.statement}`;
      ascii += line.substring(0, 65).padEnd(66) + '│\n';
    }
    ascii += '└─────────────────────────────────────────────────────────────────┘\n\n';
  }

  // Derivation chain (derived statements with dependencies)
  const derived = decomposition.atoms.filter((a) => a.type === 'derived' || a.type === 'lemma');
  if (derived.length > 0) {
    ascii += '┌─ DERIVATION CHAIN ──────────────────────────────────────────────┐\n';
    for (const atom of derived) {
      const marker = atom.type === 'lemma' ? '◇' : '○';
      const deps = atom.derivedFrom && atom.derivedFrom.length > 0
        ? ` ← [${atom.derivedFrom.join(', ')}]`
        : '';
      const line = `│ ${marker} [${atom.id}] ${atom.statement}${deps}`;
      ascii += line.substring(0, 65).padEnd(66) + '│\n';

      // Show inference rule if present
      if (atom.usedInferenceRule) {
        ascii += `│   └─ Rule: ${atom.usedInferenceRule}`.padEnd(66) + '│\n';
      }
    }
    ascii += '└─────────────────────────────────────────────────────────────────┘\n\n';
  }

  // Conclusions
  const conclusions = decomposition.atoms.filter((a) => a.type === 'conclusion');
  if (conclusions.length > 0) {
    ascii += '┌─ CONCLUSIONS ───────────────────────────────────────────────────┐\n';
    for (const atom of conclusions) {
      const marker = '★';  // Star for conclusions
      const deps = atom.derivedFrom && atom.derivedFrom.length > 0
        ? ` ← [${atom.derivedFrom.join(', ')}]`
        : '';
      const line = `│ ${marker} [${atom.id}] ${atom.statement}${deps}`;
      ascii += line.substring(0, 65).padEnd(66) + '│\n';
    }
    ascii += '└─────────────────────────────────────────────────────────────────┘\n\n';
  }

  // Gaps
  if (decomposition.gaps && decomposition.gaps.length > 0) {
    ascii += '┌─ GAPS (Missing Steps) ──────────────────────────────────────────┐\n';
    for (const gap of decomposition.gaps) {
      const severityIcon = gap.severity === 'critical' ? '⚠' : gap.severity === 'significant' ? '!' : '?';
      ascii += `│ ${severityIcon} [${gap.type}] ${gap.description}`.substring(0, 65).padEnd(66) + '│\n';
      ascii += `│   Between: ${gap.location.from} → ${gap.location.to}`.padEnd(66) + '│\n';
      if (gap.suggestedFix) {
        ascii += `│   Fix: ${gap.suggestedFix}`.substring(0, 65).padEnd(66) + '│\n';
      }
    }
    ascii += '└─────────────────────────────────────────────────────────────────┘\n\n';
  }

  // Implicit assumptions
  if (decomposition.implicitAssumptions && decomposition.implicitAssumptions.length > 0) {
    ascii += '┌─ IMPLICIT ASSUMPTIONS ──────────────────────────────────────────┐\n';
    for (const assumption of decomposition.implicitAssumptions) {
      ascii += `│ • [${assumption.type}]`.padEnd(66) + '│\n';
      ascii += `│   ${assumption.statement}`.substring(0, 65).padEnd(66) + '│\n';
      if (assumption.shouldBeExplicit) {
        ascii += `│   ⚠ Should be explicit`.padEnd(66) + '│\n';
      }
    }
    ascii += '└─────────────────────────────────────────────────────────────────┘\n\n';
  }

  // Dependency tree visualization
  if (decomposition.dependencies && decomposition.dependencies.edges.length > 0) {
    ascii += '┌─ DEPENDENCY TREE ─────────────────────────────────────────────────┐\n';
    ascii += '│                                                                    │\n';

    // Find roots (no incoming edges)
    const roots = decomposition.dependencies.roots || [];
    for (const rootId of roots) {
      ascii += buildASCIITree(rootId, decomposition, 0, new Set());
    }

    ascii += '└──────────────────────────────────────────────────────────────────┘\n';
  }

  return ascii;
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
