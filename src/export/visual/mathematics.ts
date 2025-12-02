/**
 * Mathematics Visual Exporter (v6.1.0)
 * Phase 7 Sprint 2: Mathematics reasoning export to Mermaid, DOT, ASCII
 */

import type { MathematicsThought } from '../../types/modes/mathematics.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';

/**
 * Export mathematics reasoning to visual format
 */
export function exportMathematicsDerivation(thought: MathematicsThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return mathematicsToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return mathematicsToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return mathematicsToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function mathematicsToMermaid(
  thought: MathematicsThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TB\n';

  // Add thought type node
  const typeId = sanitizeId(`type_${thought.thoughtType || 'proof'}`);
  const typeLabel = includeLabels ? (thought.thoughtType || 'Proof').replace(/_/g, ' ') : typeId;
  mermaid += `  ${typeId}[["${typeLabel}"]]\n`;

  // Add proof strategy if present
  if (thought.proofStrategy) {
    const strategyId = sanitizeId('strategy');
    const strategyLabel = thought.proofStrategy.type;
    mermaid += `  ${strategyId}(["${strategyLabel}"])\n`;
    mermaid += `  ${typeId} --> ${strategyId}\n`;

    // Add proof steps
    let prevStepId = strategyId;
    thought.proofStrategy.steps.forEach((step, index) => {
      const stepId = sanitizeId(`step_${index}`);
      const stepLabel = includeLabels ? step.slice(0, 40) + (step.length > 40 ? '...' : '') : `Step ${index + 1}`;
      mermaid += `  ${stepId}["${stepLabel}"]\n`;
      mermaid += `  ${prevStepId} --> ${stepId}\n`;
      prevStepId = stepId;
    });

    // Add completeness metric
    if (includeMetrics) {
      const completenessId = sanitizeId('completeness');
      const completenessLabel = `Completeness: ${(thought.proofStrategy.completeness * 100).toFixed(0)}%`;
      mermaid += `  ${completenessId}{{${completenessLabel}}}\n`;
      mermaid += `  ${prevStepId} --> ${completenessId}\n`;
    }
  }

  // Add mathematical model if present
  if (thought.mathematicalModel) {
    const modelId = sanitizeId('model');
    const modelLabel = thought.mathematicalModel.symbolic || 'Mathematical Model';
    mermaid += `  ${modelId}["${modelLabel}"]\n`;
    mermaid += `  ${typeId} --> ${modelId}\n`;
  }

  // Add theorems if present
  if (thought.theorems && thought.theorems.length > 0) {
    thought.theorems.forEach((theorem, index) => {
      const theoremId = sanitizeId(`theorem_${index}`);
      const theoremLabel = theorem.name || `Theorem ${index + 1}`;
      mermaid += `  ${theoremId}[/"${theoremLabel}"/]\n`;
      mermaid += `  ${typeId} --> ${theoremId}\n`;
    });
  }

  // Add assumptions as notes
  if (thought.assumptions && thought.assumptions.length > 0) {
    const assumptionsId = sanitizeId('assumptions');
    mermaid += `  ${assumptionsId}>"Assumptions: ${thought.assumptions.length}"]\n`;
  }

  // Color scheme
  if (colorScheme !== 'monochrome') {
    const colors = colorScheme === 'pastel'
      ? { type: '#e8f4e8', strategy: '#fff3e0', step: '#e3f2fd' }
      : { type: '#90EE90', strategy: '#FFD700', step: '#87CEEB' };

    mermaid += `\n  style ${typeId} fill:${colors.type}\n`;
    if (thought.proofStrategy) {
      mermaid += `  style ${sanitizeId('strategy')} fill:${colors.strategy}\n`;
    }
  }

  return mermaid;
}

function mathematicsToDOT(
  thought: MathematicsThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph MathematicsDerivation {\n';
  dot += '  rankdir=TB;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  // Add thought type node
  const typeId = sanitizeId(`type_${thought.thoughtType || 'proof'}`);
  const typeLabel = includeLabels ? (thought.thoughtType || 'Proof').replace(/_/g, ' ') : typeId;
  dot += `  ${typeId} [label="${typeLabel}", shape=doubleoctagon];\n`;

  // Add proof strategy
  if (thought.proofStrategy) {
    const strategyId = sanitizeId('strategy');
    dot += `  ${strategyId} [label="${thought.proofStrategy.type}", shape=ellipse];\n`;
    dot += `  ${typeId} -> ${strategyId};\n`;

    // Add steps
    let prevStepId = strategyId;
    thought.proofStrategy.steps.forEach((step, index) => {
      const stepId = sanitizeId(`step_${index}`);
      const stepLabel = includeLabels ? step.slice(0, 30).replace(/"/g, '\\"') : `Step ${index + 1}`;
      dot += `  ${stepId} [label="${stepLabel}"];\n`;
      dot += `  ${prevStepId} -> ${stepId};\n`;
      prevStepId = stepId;
    });

    if (includeMetrics) {
      const completenessId = sanitizeId('completeness');
      dot += `  ${completenessId} [label="${(thought.proofStrategy.completeness * 100).toFixed(0)}%", shape=diamond];\n`;
      dot += `  ${prevStepId} -> ${completenessId};\n`;
    }
  }

  // Add theorems
  if (thought.theorems) {
    thought.theorems.forEach((theorem, index) => {
      const theoremId = sanitizeId(`theorem_${index}`);
      dot += `  ${theoremId} [label="${theorem.name || `Theorem ${index + 1}`}", shape=parallelogram];\n`;
      dot += `  ${typeId} -> ${theoremId};\n`;
    });
  }

  dot += '}\n';
  return dot;
}

function mathematicsToASCII(thought: MathematicsThought): string {
  let ascii = 'Mathematics Derivation:\n';
  ascii += '=======================\n\n';

  // Thought type
  ascii += `Type: ${(thought.thoughtType || 'proof').replace(/_/g, ' ')}\n`;
  ascii += `Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%\n\n`;

  // Mathematical model
  if (thought.mathematicalModel) {
    ascii += 'Mathematical Model:\n';
    ascii += `  LaTeX: ${thought.mathematicalModel.latex}\n`;
    ascii += `  Symbolic: ${thought.mathematicalModel.symbolic}\n`;
    if (thought.mathematicalModel.ascii) {
      ascii += `  ASCII: ${thought.mathematicalModel.ascii}\n`;
    }
    ascii += '\n';
  }

  // Proof strategy
  if (thought.proofStrategy) {
    ascii += `Proof Strategy: ${thought.proofStrategy.type}\n`;
    ascii += `Completeness: ${(thought.proofStrategy.completeness * 100).toFixed(0)}%\n`;
    ascii += 'Steps:\n';
    thought.proofStrategy.steps.forEach((step, index) => {
      ascii += `  ${index + 1}. ${step}\n`;
    });
    if (thought.proofStrategy.baseCase) {
      ascii += `Base Case: ${thought.proofStrategy.baseCase}\n`;
    }
    if (thought.proofStrategy.inductiveStep) {
      ascii += `Inductive Step: ${thought.proofStrategy.inductiveStep}\n`;
    }
    ascii += '\n';
  }

  // Theorems
  if (thought.theorems && thought.theorems.length > 0) {
    ascii += 'Theorems:\n';
    thought.theorems.forEach((theorem, index) => {
      ascii += `  [${index + 1}] ${theorem.name}: ${theorem.statement}\n`;
      if (theorem.hypotheses.length > 0) {
        ascii += `      Hypotheses: ${theorem.hypotheses.join(', ')}\n`;
      }
      ascii += `      Conclusion: ${theorem.conclusion}\n`;
    });
    ascii += '\n';
  }

  // Assumptions
  if (thought.assumptions && thought.assumptions.length > 0) {
    ascii += 'Assumptions:\n';
    thought.assumptions.forEach((assumption, index) => {
      ascii += `  ${index + 1}. ${assumption}\n`;
    });
    ascii += '\n';
  }

  // Dependencies
  if (thought.dependencies && thought.dependencies.length > 0) {
    ascii += 'Dependencies:\n';
    thought.dependencies.forEach((dep, index) => {
      ascii += `  ${index + 1}. ${dep}\n`;
    });
  }

  return ascii;
}
