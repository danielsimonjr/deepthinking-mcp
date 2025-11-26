/**
 * Scientific Method Visual Exporter (v4.3.0)
 * Sprint 8 Task 8.1: Scientific method experiment export to Mermaid, DOT, ASCII
 */

import type { ScientificMethodThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';

/**
 * Export scientific method experiment flow to visual format
 */
export function exportScientificMethodExperiment(thought: ScientificMethodThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return scientificMethodToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return scientificMethodToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return scientificMethodToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function scientificMethodToMermaid(
  thought: ScientificMethodThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TD\n';

  if (thought.researchQuestion) {
    mermaid += `  RQ["Research Question: ${thought.researchQuestion.question.substring(0, 60)}..."]\n`;
    mermaid += '\n';
  }

  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    for (const hypothesis of thought.scientificHypotheses) {
      const hypId = sanitizeId(hypothesis.id);
      const label = includeLabels ? hypothesis.statement.substring(0, 50) + '...' : hypId;
      mermaid += `  ${hypId}["H: ${label}"]\n`;
      if (thought.researchQuestion) {
        mermaid += `  RQ --> ${hypId}\n`;
      }
    }
    mermaid += '\n';
  }

  if (thought.experiment) {
    mermaid += `  Exp["Experiment: ${thought.experiment.design}"]\n`;
    if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
      for (const hypothesis of thought.scientificHypotheses) {
        const hypId = sanitizeId(hypothesis.id);
        mermaid += `  ${hypId} --> Exp\n`;
      }
    }
    mermaid += '\n';
  }

  if (thought.data) {
    mermaid += `  Data["Data Collection: ${(thought.experiment as any)?.sampleSize || 0} samples"]\n`;
    if (thought.experiment) {
      mermaid += `  Exp --> Data\n`;
    }
    mermaid += '\n';
  }

  if (thought.analysis) {
    mermaid += `  Stats["Statistical Analysis"]\n`;
    if (thought.data) {
      mermaid += `  Data --> Stats\n`;
    }
    mermaid += '\n';
  }

  if (thought.conclusion) {
    const conclusionId = 'Conclusion';
    const supportLabel = includeMetrics && thought.conclusion.confidence
      ? ` (conf: ${thought.conclusion.confidence.toFixed(2)})`
      : '';
    mermaid += `  ${conclusionId}["Conclusion: ${thought.conclusion.statement.substring(0, 50)}...${supportLabel}"]\n`;
    if (thought.analysis) {
      mermaid += `  Stats --> ${conclusionId}\n`;
    }
  }

  if (colorScheme !== 'monochrome') {
    mermaid += '\n';
    const questionColor = colorScheme === 'pastel' ? '#fff3e0' : '#ffd699';
    const hypothesisColor = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
    const conclusionColor = colorScheme === 'pastel' ? '#e8f5e9' : '#a5d6a7';

    if (thought.researchQuestion) {
      mermaid += `  style RQ fill:${questionColor}\n`;
    }
    if (thought.scientificHypotheses) {
      for (const hypothesis of thought.scientificHypotheses) {
        const hypId = sanitizeId(hypothesis.id);
        mermaid += `  style ${hypId} fill:${hypothesisColor}\n`;
      }
    }
    if (thought.conclusion) {
      mermaid += `  style Conclusion fill:${conclusionColor}\n`;
    }
  }

  return mermaid;
}

function scientificMethodToDOT(
  thought: ScientificMethodThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph ScientificMethod {\n';
  dot += '  rankdir=TD;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  if (thought.researchQuestion) {
    const label = includeLabels ? thought.researchQuestion.question.substring(0, 60) + '...' : 'RQ';
    dot += `  RQ [label="Research Question:\\n${label}", shape=ellipse];\n\n`;
  }

  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    for (const hypothesis of thought.scientificHypotheses) {
      const hypId = sanitizeId(hypothesis.id);
      const label = includeLabels ? hypothesis.statement.substring(0, 50) + '...' : hypId;
      dot += `  ${hypId} [label="Hypothesis:\\n${label}"];\n`;
      if (thought.researchQuestion) {
        dot += `  RQ -> ${hypId};\n`;
      }
    }
    dot += '\n';
  }

  if (thought.experiment) {
    const label = includeLabels ? thought.experiment.design : 'Exp';
    dot += `  Exp [label="Experiment:\\n${label}"];\n`;
    if (thought.scientificHypotheses) {
      for (const hypothesis of thought.scientificHypotheses) {
        const hypId = sanitizeId(hypothesis.id);
        dot += `  ${hypId} -> Exp;\n`;
      }
    }
    dot += '\n';
  }

  if (thought.data) {
    const sampleLabel = includeMetrics ? `\\nSamples: ${(thought.experiment as any)?.sampleSize || 0}` : '';
    dot += `  Data [label="Data Collection${sampleLabel}"];\n`;
    if (thought.experiment) {
      dot += `  Exp -> Data;\n`;
    }
  }

  if (thought.analysis) {
    dot += `  Stats [label="Statistical Analysis"];\n`;
    if (thought.data) {
      dot += `  Data -> Stats;\n`;
    }
  }

  if (thought.conclusion) {
    const label = includeLabels ? thought.conclusion.statement.substring(0, 50) + '...' : 'Conclusion';
    const confLabel = includeMetrics && thought.conclusion.confidence
      ? `\\nconf: ${thought.conclusion.confidence.toFixed(2)}`
      : '';
    dot += `  Conclusion [label="Conclusion:\\n${label}${confLabel}", shape=doubleoctagon];\n`;
    if (thought.analysis) {
      dot += `  Stats -> Conclusion;\n`;
    }
  }

  dot += '}\n';
  return dot;
}

function scientificMethodToASCII(thought: ScientificMethodThought): string {
  let ascii = 'Scientific Method Process:\n';
  ascii += '==========================\n\n';

  if (thought.researchQuestion) {
    ascii += `Research Question: ${thought.researchQuestion.question}\n`;
    ascii += `Background: ${thought.researchQuestion.background}\n\n`;
  }

  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    ascii += 'Hypotheses:\n';
    for (const hypothesis of thought.scientificHypotheses) {
      const typeIcon = hypothesis.type === 'null' ? 'H₀' : 'H₁';
      ascii += `  ${typeIcon} ${hypothesis.statement}\n`;
      if (hypothesis.prediction) {
        ascii += `    Prediction: ${hypothesis.prediction}\n`;
      }
    }
    ascii += '\n';
  }

  if (thought.experiment) {
    ascii += `Experiment: ${thought.experiment.design}\n`;
    ascii += `Type: ${thought.experiment.type}\n`;
    ascii += `Design: ${thought.experiment.design}\n\n`;
  }

  if (thought.data) {
    ascii += 'Data Collection:\n';
    ascii += `  Sample Size: ${(thought.experiment as any)?.sampleSize || 0}\n`;
    ascii += `  Method: ${thought.data.method}\n`;
    if (thought.data.dataQuality) {
      ascii += `  Quality:\n`;
      ascii += `    Completeness: ${thought.data.dataQuality.completeness.toFixed(2)}\n`;
      ascii += `    Reliability: ${thought.data.dataQuality.reliability.toFixed(2)}\n`;
    }
    ascii += '\n';
  }

  if (thought.analysis && thought.analysis.tests) {
    ascii += 'Statistical Tests:\n';
    for (const test of thought.analysis.tests) {
      ascii += `  • ${test.name}\n`;
      ascii += `    p-value: ${test.pValue.toFixed(4)}, α: ${test.alpha}\n`;
      ascii += `    Result: ${test.result}\n`;
    }
    ascii += '\n';
  }

  if (thought.conclusion) {
    ascii += 'Conclusion:\n';
    ascii += `${thought.conclusion.statement}\n`;
    if ((thought.conclusion as any).supportedHypotheses) {
      ascii += `Supported hypotheses: ${(thought.conclusion as any).supportedHypotheses.join(', ')}\n`;
    }
    if (thought.conclusion.confidence) {
      ascii += `Confidence: ${thought.conclusion.confidence.toFixed(2)}\n`;
    }
  }

  return ascii;
}
