/**
 * Evidential Visual Exporter (v4.3.0)
 * Sprint 8 Task 8.1: Evidential belief export to Mermaid, DOT, ASCII
 */

import type { EvidentialThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';

/**
 * Export evidential belief visualization to visual format
 */
export function exportEvidentialBeliefs(thought: EvidentialThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return evidentialToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return evidentialToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return evidentialToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function evidentialToMermaid(
  thought: EvidentialThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TD\n';

  mermaid += '  Frame["Frame of Discernment"]\n';

  if (thought.frameOfDiscernment) {
    for (const hypothesis of thought.frameOfDiscernment) {
      const hypId = sanitizeId(hypothesis);
      const label = includeLabels ? hypothesis : hypId;

      mermaid += `  ${hypId}["${label}"]\n`;
      mermaid += `  Frame --> ${hypId}\n`;
    }
  }

  if (includeMetrics && (thought as any).massAssignments && (thought as any).massAssignments.length > 0) {
    mermaid += '\n';
    for (const mass of (thought as any).massAssignments) {
      const massId = sanitizeId(mass.subset.join('_'));
      const label = `{${mass.subset.join(', ')}}`;
      mermaid += `  ${massId}["${label}: ${mass.mass.toFixed(3)}"]\n`;
    }
  }

  if (colorScheme !== 'monochrome' && thought.frameOfDiscernment) {
    mermaid += '\n';
    const color = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
    for (const hypothesis of thought.frameOfDiscernment) {
      const hypId = sanitizeId(hypothesis);
      mermaid += `  style ${hypId} fill:${color}\n`;
    }
  }

  return mermaid;
}

function evidentialToDOT(
  thought: EvidentialThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph EvidentialBeliefs {\n';
  dot += '  rankdir=TD;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  dot += '  Frame [label="Frame of Discernment", shape=ellipse];\n\n';

  if (thought.frameOfDiscernment) {
    for (const hypothesis of thought.frameOfDiscernment) {
      const hypId = sanitizeId(hypothesis);
      const label = includeLabels ? hypothesis : hypId;

      dot += `  ${hypId} [label="${label}"];\n`;
      dot += `  Frame -> ${hypId};\n`;
    }
  }

  if (includeMetrics && (thought as any).massAssignments && (thought as any).massAssignments.length > 0) {
    dot += '\n';
    for (const mass of (thought as any).massAssignments) {
      const massId = sanitizeId(mass.subset.join('_'));
      const label = `{${mass.subset.join(', ')}}: ${mass.mass.toFixed(3)}`;
      dot += `  ${massId} [label="${label}", shape=note];\n`;
    }
  }

  dot += '}\n';
  return dot;
}

function evidentialToASCII(thought: EvidentialThought): string {
  let ascii = 'Evidential Belief Visualization:\n';
  ascii += '================================\n\n';

  ascii += 'Frame of Discernment:\n';
  if (thought.frameOfDiscernment) {
    ascii += `  {${thought.frameOfDiscernment.join(', ')}}\n\n`;
  } else {
    ascii += '  (not defined)\n\n';
  }

  if ((thought as any).massAssignments && (thought as any).massAssignments.length > 0) {
    ascii += 'Mass Assignments:\n';
    for (const mass of (thought as any).massAssignments) {
      ascii += `  m({${mass.subset.join(', ')}}) = ${mass.mass.toFixed(3)}\n`;
    }
    ascii += '\n';
  }

  if (thought.beliefFunctions && thought.beliefFunctions.length > 0) {
    ascii += `Belief Functions: ${thought.beliefFunctions.length} defined\n`;
  }

  if ((thought as any).plausibilityFunction) {
    ascii += `Plausibility: ${(thought as any).plausibilityFunction.toFixed(3)}\n`;
  }

  return ascii;
}
