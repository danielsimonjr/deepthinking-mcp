/**
 * Abductive Visual Exporter (v4.3.0)
 * Sprint 8 Task 8.1: Abductive hypothesis export to Mermaid, DOT, ASCII
 */

import type { AbductiveThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';

/**
 * Export abductive hypothesis comparison to visual format
 */
export function exportAbductiveHypotheses(thought: AbductiveThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return abductiveToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return abductiveToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return abductiveToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function abductiveToMermaid(
  thought: AbductiveThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TD\n';

  mermaid += '  Observations["Observations"]\n';

  for (const hypothesis of thought.hypotheses) {
    const hypId = sanitizeId(hypothesis.id);
    const label = includeLabels ? hypothesis.explanation.substring(0, 50) + '...' : hypId;
    const scoreLabel = includeMetrics ? ` (${hypothesis.score.toFixed(2)})` : '';

    mermaid += `  ${hypId}["${label}${scoreLabel}"]\n`;
    mermaid += `  Observations --> ${hypId}\n`;
  }

  if (thought.bestExplanation && colorScheme !== 'monochrome') {
    mermaid += '\n';
    const bestId = sanitizeId(thought.bestExplanation.id);
    const color = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
    mermaid += `  style ${bestId} fill:${color},stroke:#333,stroke-width:3px\n`;
  }

  return mermaid;
}

function abductiveToDOT(
  thought: AbductiveThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph AbductiveHypotheses {\n';
  dot += '  rankdir=TD;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  dot += '  Observations [label="Observations", shape=ellipse];\n\n';

  for (const hypothesis of thought.hypotheses) {
    const hypId = sanitizeId(hypothesis.id);
    const label = includeLabels ? hypothesis.explanation.substring(0, 50) + '...' : hypId;
    const scoreLabel = includeMetrics ? ` (${hypothesis.score.toFixed(2)})` : '';

    const isBest = thought.bestExplanation?.id === hypothesis.id;
    const style = isBest ? ', style=filled, fillcolor=lightblue' : '';

    dot += `  ${hypId} [label="${label}${scoreLabel}"${style}];\n`;
    dot += `  Observations -> ${hypId};\n`;
  }

  dot += '}\n';
  return dot;
}

function abductiveToASCII(thought: AbductiveThought): string {
  let ascii = 'Abductive Hypothesis Comparison:\n';
  ascii += '================================\n\n';

  ascii += 'Observations:\n';
  for (const obs of thought.observations) {
    ascii += `  • ${obs.description} (confidence: ${obs.confidence.toFixed(2)})\n`;
  }

  ascii += '\nHypotheses:\n';
  for (const hypothesis of thought.hypotheses) {
    const isBest = thought.bestExplanation?.id === hypothesis.id;
    const marker = isBest ? '★' : '•';

    ascii += `  ${marker} ${hypothesis.explanation}\n`;
    ascii += `    Score: ${hypothesis.score.toFixed(2)}\n`;
    ascii += `    Assumptions: ${hypothesis.assumptions.join(', ')}\n`;
    ascii += '\n';
  }

  if (thought.bestExplanation) {
    ascii += `Best Explanation: ${thought.bestExplanation.explanation}\n`;
  }

  return ascii;
}
