/**
 * Bayesian Visual Exporter (v4.3.0)
 * Sprint 8 Task 8.1: Bayesian network export to Mermaid, DOT, ASCII
 */

import type { BayesianThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';

/**
 * Export Bayesian network to visual format
 */
export function exportBayesianNetwork(thought: BayesianThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return bayesianToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return bayesianToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return bayesianToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function bayesianToMermaid(
  thought: BayesianThought,
  colorScheme: string,
  _includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph LR\n';

  mermaid += `  H([Hypothesis])\n`;
  mermaid += `  Prior[Prior: ${includeMetrics ? thought.prior.probability.toFixed(3) : '?'}]\n`;
  mermaid += `  Evidence[Evidence]\n`;
  mermaid += `  Posterior[[Posterior: ${includeMetrics ? thought.posterior.probability.toFixed(3) : '?'}]]\n`;

  mermaid += '\n';
  mermaid += '  Prior --> H\n';
  mermaid += '  Evidence --> H\n';
  mermaid += '  H --> Posterior\n';

  if (colorScheme !== 'monochrome') {
    mermaid += '\n';
    const priorColor = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
    const posteriorColor = colorScheme === 'pastel' ? '#c8e6c9' : '#81c784';

    mermaid += `  style Prior fill:${priorColor}\n`;
    mermaid += `  style Posterior fill:${posteriorColor}\n`;
  }

  return mermaid;
}

function bayesianToDOT(
  thought: BayesianThought,
  _includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph BayesianNetwork {\n';
  dot += '  rankdir=LR;\n';
  dot += '  node [shape=ellipse];\n\n';

  const priorProb = includeMetrics ? `: ${thought.prior.probability.toFixed(3)}` : '';
  const posteriorProb = includeMetrics ? `: ${thought.posterior.probability.toFixed(3)}` : '';

  dot += `  Prior [label="Prior${priorProb}"];\n`;
  dot += `  Hypothesis [label="Hypothesis", shape=box];\n`;
  dot += `  Evidence [label="Evidence"];\n`;
  dot += `  Posterior [label="Posterior${posteriorProb}", shape=doublecircle];\n`;

  dot += '\n';
  dot += '  Prior -> Hypothesis;\n';
  dot += '  Evidence -> Hypothesis;\n';
  dot += '  Hypothesis -> Posterior;\n';

  dot += '}\n';
  return dot;
}

function bayesianToASCII(thought: BayesianThought): string {
  let ascii = 'Bayesian Network:\n';
  ascii += '=================\n\n';

  ascii += `Hypothesis: ${thought.hypothesis.statement}\n\n`;
  ascii += `Prior Probability: ${thought.prior.probability.toFixed(3)}\n`;
  ascii += `  Justification: ${thought.prior.justification}\n\n`;

  if (thought.evidence && thought.evidence.length > 0) {
    ascii += 'Evidence:\n';
    for (const ev of thought.evidence) {
      ascii += `  • ${ev.description}\n`;
    }
    ascii += '\n';
  }

  ascii += `Posterior Probability: ${thought.posterior.probability.toFixed(3)}\n`;
  ascii += `  Calculation: ${thought.posterior.calculation}\n`;

  if (thought.bayesFactor !== undefined) {
    ascii += `\nBayes Factor: ${thought.bayesFactor.toFixed(2)}\n`;
  }

  return ascii;
}
