/**
 * Formal Logic Visual Exporter (v4.3.0)
 * Sprint 8 Task 8.1: Formal logic proof tree export to Mermaid, DOT, ASCII
 */

import type { FormalLogicThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';

/**
 * Export formal logic proof tree to visual format
 */
export function exportFormalLogicProof(thought: FormalLogicThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return formalLogicToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return formalLogicToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return formalLogicToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function formalLogicToMermaid(
  thought: FormalLogicThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TD\n';

  if (thought.propositions && thought.propositions.length > 0) {
    mermaid += '  subgraph Propositions["Propositions"]\n';
    for (const proposition of thought.propositions) {
      const propId = sanitizeId(proposition.id);
      const label = includeLabels
        ? `${proposition.symbol}: ${proposition.statement.substring(0, 40)}...`
        : proposition.symbol;
      const shape = proposition.type === 'atomic' ? ['[', ']'] : ['[[', ']]'];
      mermaid += `    ${propId}${shape[0]}${label}${shape[1]}\n`;
    }
    mermaid += '  end\n\n';
  }

  if (thought.proof && thought.proof.steps && thought.proof.steps.length > 0) {
    mermaid += '  Theorem["Theorem"]\n';

    for (const step of thought.proof.steps) {
      const stepId = `Step${step.stepNumber}`;
      const label = includeLabels
        ? `${step.stepNumber}. ${step.statement.substring(0, 40)}...`
        : `Step ${step.stepNumber}`;

      mermaid += `  ${stepId}["${label}"]\n`;

      if (step.referencesSteps && step.referencesSteps.length > 0) {
        for (const refStep of step.referencesSteps) {
          mermaid += `  Step${refStep} --> ${stepId}\n`;
        }
      }
    }

    const lastStep = thought.proof.steps[thought.proof.steps.length - 1];
    mermaid += `  Step${lastStep.stepNumber} --> Theorem\n`;

    if (includeMetrics) {
      const completeness = (thought.proof.completeness * 100).toFixed(0);
      mermaid += `\n  Completeness["Completeness: ${completeness}%"]\n`;
      mermaid += `  Completeness -.-> Theorem\n`;
    }
  }

  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    mermaid += '\n';
    for (const inference of thought.logicalInferences) {
      const infId = sanitizeId(inference.id);
      const label = includeLabels ? inference.rule : infId;

      mermaid += `  ${infId}{{"${label}"}}\n`;

      if (inference.premises) {
        for (const premiseId of inference.premises) {
          const propId = sanitizeId(premiseId);
          mermaid += `  ${propId} --> ${infId}\n`;
        }
      }

      const conclusionId = sanitizeId(inference.conclusion);
      mermaid += `  ${infId} --> ${conclusionId}\n`;
    }
  }

  if (colorScheme !== 'monochrome') {
    mermaid += '\n';
    const atomicColor = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
    const compoundColor = colorScheme === 'pastel' ? '#fff3e0' : '#ffd699';

    if (thought.propositions) {
      for (const proposition of thought.propositions) {
        const propId = sanitizeId(proposition.id);
        const color = proposition.type === 'atomic' ? atomicColor : compoundColor;
        mermaid += `  style ${propId} fill:${color}\n`;
      }
    }
  }

  return mermaid;
}

function formalLogicToDOT(
  thought: FormalLogicThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph FormalLogic {\n';
  dot += '  rankdir=TD;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  if (thought.propositions && thought.propositions.length > 0) {
    dot += '  subgraph cluster_propositions {\n';
    dot += '    label="Propositions";\n';
    for (const proposition of thought.propositions) {
      const propId = sanitizeId(proposition.id);
      const label = includeLabels
        ? `${proposition.symbol}:\\n${proposition.statement.substring(0, 40)}...`
        : proposition.symbol;
      const shape = proposition.type === 'atomic' ? 'ellipse' : 'box';
      dot += `    ${propId} [label="${label}", shape=${shape}];\n`;
    }
    dot += '  }\n\n';
  }

  if (thought.proof && thought.proof.steps && thought.proof.steps.length > 0) {
    dot += `  Theorem [label="Theorem:\\n${thought.proof.theorem.substring(0, 50)}...", shape=doubleoctagon, style=bold];\n\n`;

    for (const step of thought.proof.steps) {
      const stepId = `Step${step.stepNumber}`;
      const label = includeLabels
        ? `${step.stepNumber}. ${step.statement.substring(0, 40)}...`
        : `Step ${step.stepNumber}`;
      const ruleLabel = step.rule ? `\\n(${step.rule})` : '';

      dot += `  ${stepId} [label="${label}${ruleLabel}"];\n`;

      if (step.referencesSteps) {
        for (const refStep of step.referencesSteps) {
          dot += `  Step${refStep} -> ${stepId};\n`;
        }
      }
    }

    const lastStep = thought.proof.steps[thought.proof.steps.length - 1];
    dot += `  Step${lastStep.stepNumber} -> Theorem;\n`;

    if (includeMetrics) {
      const completeness = (thought.proof.completeness * 100).toFixed(0);
      dot += `\n  Completeness [label="Completeness: ${completeness}%", shape=note];\n`;
    }
  }

  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    dot += '\n';
    for (const inference of thought.logicalInferences) {
      const infId = sanitizeId(inference.id);
      const label = includeLabels ? inference.rule : infId;

      dot += `  ${infId} [label="${label}", shape=diamond];\n`;

      if (inference.premises) {
        for (const premiseId of inference.premises) {
          const propId = sanitizeId(premiseId);
          dot += `  ${propId} -> ${infId};\n`;
        }
      }

      const conclusionId = sanitizeId(inference.conclusion);
      dot += `  ${infId} -> ${conclusionId};\n`;
    }
  }

  dot += '}\n';
  return dot;
}

function formalLogicToASCII(thought: FormalLogicThought): string {
  let ascii = 'Formal Logic Proof:\n';
  ascii += '==================\n\n';

  if (thought.propositions && thought.propositions.length > 0) {
    ascii += 'Propositions:\n';
    for (const proposition of thought.propositions) {
      const typeMarker = proposition.type === 'atomic' ? '●' : '◆';
      ascii += `  ${typeMarker} ${proposition.symbol}: ${proposition.statement}\n`;
    }
    ascii += '\n';
  }

  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    ascii += 'Inferences:\n';
    for (const inference of thought.logicalInferences) {
      ascii += `  [${inference.rule}]\n`;
      ascii += `    Premises: ${inference.premises.join(', ')}\n`;
      ascii += `    Conclusion: ${inference.conclusion}\n`;
      ascii += `    Valid: ${inference.valid ? '✓' : '✗'}\n`;
    }
    ascii += '\n';
  }

  if (thought.proof) {
    ascii += `Proof: ${thought.proof.theorem}\n`;
    ascii += `Technique: ${thought.proof.technique}\n`;
    ascii += `Completeness: ${(thought.proof.completeness * 100).toFixed(0)}%\n\n`;

    if (thought.proof.steps && thought.proof.steps.length > 0) {
      ascii += 'Proof Steps:\n';
      for (const step of thought.proof.steps) {
        ascii += `  ${step.stepNumber}. ${step.statement}\n`;
        ascii += `     Justification: ${step.justification}\n`;
      }
      ascii += '\n';
    }

    ascii += `Conclusion: ${thought.proof.conclusion}\n`;
    ascii += `Valid: ${thought.proof.valid ? '✓' : '✗'}\n`;
  }

  if (thought.truthTable) {
    ascii += '\nTruth Table:\n';
    ascii += `  Tautology: ${thought.truthTable.isTautology ? '✓' : '✗'}\n`;
    ascii += `  Contradiction: ${thought.truthTable.isContradiction ? '✓' : '✗'}\n`;
    ascii += `  Contingent: ${thought.truthTable.isContingent ? '✓' : '✗'}\n`;
  }

  return ascii;
}
