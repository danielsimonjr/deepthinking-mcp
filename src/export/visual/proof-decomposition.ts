/**
 * Proof Decomposition Visual Exporter (v7.0.0)
 * Phase 8 Sprint 4: Visual export for proof decomposition structures
 *
 * Exports ProofDecomposition to Mermaid, DOT, and ASCII formats
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
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return proofDecompositionToMermaid(decomposition, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return proofDecompositionToDOT(decomposition, includeLabels, includeMetrics);
    case 'ascii':
      return proofDecompositionToASCII(decomposition);
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
