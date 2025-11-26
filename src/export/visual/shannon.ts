/**
 * Shannon Visual Exporter (v4.3.0)
 * Sprint 8 Task 8.1: Shannon stage flow export to Mermaid, DOT, ASCII
 */

import type { ShannonThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';

/**
 * Export Shannon stage flow diagram to visual format
 */
export function exportShannonStageFlow(thought: ShannonThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return shannonToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return shannonToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return shannonToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

const stages = [
  'problem_definition',
  'constraints',
  'model',
  'proof',
  'implementation'
];

const stageLabels: Record<string, string> = {
  problem_definition: 'Problem Definition',
  constraints: 'Constraints',
  model: 'Model',
  proof: 'Proof',
  implementation: 'Implementation'
};

function shannonToMermaid(
  thought: ShannonThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph LR\n';

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const stageId = sanitizeId(stage);
    const label = includeLabels ? stageLabels[stage] : stageId;

    mermaid += `  ${stageId}["${label}"]\n`;

    if (i < stages.length - 1) {
      const nextStageId = sanitizeId(stages[i + 1]);
      mermaid += `  ${stageId} --> ${nextStageId}\n`;
    }
  }

  if (colorScheme !== 'monochrome') {
    mermaid += '\n';
    const currentStageId = sanitizeId(thought.stage);
    const color = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
    mermaid += `  style ${currentStageId} fill:${color},stroke:#333,stroke-width:3px\n`;
  }

  if (includeMetrics && thought.uncertainty !== undefined) {
    mermaid += `\n  uncertainty["Uncertainty: ${thought.uncertainty.toFixed(2)}"]\n`;
    mermaid += `  uncertainty -.-> ${sanitizeId(thought.stage)}\n`;
  }

  return mermaid;
}

function shannonToDOT(
  thought: ShannonThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph ShannonStageFlow {\n';
  dot += '  rankdir=LR;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const stageId = sanitizeId(stage);
    const label = includeLabels ? stageLabels[stage] : stageId;

    const isCurrent = stage === thought.stage;
    const style = isCurrent ? ', style=filled, fillcolor=lightblue' : '';

    dot += `  ${stageId} [label="${label}"${style}];\n`;

    if (i < stages.length - 1) {
      const nextStageId = sanitizeId(stages[i + 1]);
      dot += `  ${stageId} -> ${nextStageId};\n`;
    }
  }

  if (includeMetrics && thought.uncertainty !== undefined) {
    dot += `\n  uncertainty [label="Uncertainty: ${thought.uncertainty.toFixed(2)}", shape=ellipse];\n`;
    dot += `  uncertainty -> ${sanitizeId(thought.stage)} [style=dashed];\n`;
  }

  dot += '}\n';
  return dot;
}

function shannonToASCII(thought: ShannonThought): string {
  let ascii = 'Shannon Stage Flow:\n';
  ascii += '===================\n\n';

  ascii += 'Flow: ';
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const isCurrent = stage === thought.stage;

    if (isCurrent) {
      ascii += `[${stageLabels[stage]}]`;
    } else {
      ascii += stageLabels[stage];
    }

    if (i < stages.length - 1) {
      ascii += ' → ';
    }
  }

  ascii += '\n\n';
  ascii += `Current Stage: ${stageLabels[thought.stage]}\n`;
  ascii += `Uncertainty: ${thought.uncertainty.toFixed(2)}\n`;

  if (thought.dependencies && thought.dependencies.length > 0) {
    ascii += '\nDependencies:\n';
    for (const dep of thought.dependencies) {
      ascii += `  • ${dep}\n`;
    }
  }

  if (thought.assumptions && thought.assumptions.length > 0) {
    ascii += '\nAssumptions:\n';
    for (const assumption of thought.assumptions) {
      ascii += `  • ${assumption}\n`;
    }
  }

  return ascii;
}
