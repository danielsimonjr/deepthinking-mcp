/**
 * Optimization Visual Exporter (v4.3.0)
 * Sprint 8 Task 8.1: Optimization constraint graph export to Mermaid, DOT, ASCII
 */

import type { OptimizationThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';

/**
 * Export optimization problem constraint graph to visual format
 */
export function exportOptimizationSolution(thought: OptimizationThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return optimizationToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return optimizationToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return optimizationToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function optimizationToMermaid(
  thought: OptimizationThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TD\n';

  if (thought.problem) {
    const problemLabel = includeLabels
      ? `Problem: ${thought.problem.name}`
      : 'Problem';
    mermaid += `  Problem["${problemLabel}"]\n\n`;
  }

  if (thought.variables && thought.variables.length > 0) {
    mermaid += '  subgraph Variables["Decision Variables"]\n';
    for (const variable of thought.variables) {
      const varId = sanitizeId(variable.id);
      const label = includeLabels ? variable.name : varId;
      const domainLabel = includeMetrics && variable.domain
        ? ` [${(variable.domain as any).lowerBound},${(variable.domain as any).upperBound}]`
        : '';
      mermaid += `    ${varId}["${label}${domainLabel}"]\n`;
    }
    mermaid += '  end\n\n';
  }

  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    mermaid += '  subgraph Constraints["Constraints"]\n';
    for (const constraint of thought.optimizationConstraints) {
      const constId = sanitizeId(constraint.id);
      const label = includeLabels ? constraint.name : constId;
      mermaid += `    ${constId}["${label}"]\n`;
    }
    mermaid += '  end\n\n';
  }

  if (thought.objectives && thought.objectives.length > 0) {
    for (const objective of thought.objectives) {
      const objId = sanitizeId(objective.id);
      const label = includeLabels
        ? `${objective.type}: ${objective.name}`
        : objId;
      mermaid += `  ${objId}["${label}"]\n`;
    }
    mermaid += '\n';
  }

  if (thought.solution) {
    const qualityLabel = includeMetrics && thought.solution.quality
      ? ` (quality: ${thought.solution.quality.toFixed(2)})`
      : '';
    mermaid += `  Solution["Solution${qualityLabel}"]\n`;
    if (thought.objectives) {
      for (const objective of thought.objectives) {
        const objId = sanitizeId(objective.id);
        mermaid += `  ${objId} --> Solution\n`;
      }
    }
  }

  if (colorScheme !== 'monochrome') {
    mermaid += '\n';
    const solutionColor = colorScheme === 'pastel' ? '#e8f5e9' : '#a5d6a7';
    if (thought.solution) {
      mermaid += `  style Solution fill:${solutionColor}\n`;
    }
  }

  return mermaid;
}

function optimizationToDOT(
  thought: OptimizationThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph Optimization {\n';
  dot += '  rankdir=TD;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  if (thought.problem) {
    const label = includeLabels ? thought.problem.name : 'Problem';
    dot += `  Problem [label="Problem:\\n${label}", shape=ellipse];\n\n`;
  }

  if (thought.variables && thought.variables.length > 0) {
    dot += '  subgraph cluster_variables {\n';
    dot += '    label="Decision Variables";\n';
    for (const variable of thought.variables) {
      const varId = sanitizeId(variable.id);
      const label = includeLabels ? variable.name : varId;
      const domainLabel = includeMetrics && variable.domain
        ? `\\n[${(variable.domain as any).lowerBound}, ${(variable.domain as any).upperBound}]`
        : '';
      dot += `    ${varId} [label="${label}${domainLabel}"];\n`;
    }
    dot += '  }\n\n';
  }

  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    dot += '  subgraph cluster_constraints {\n';
    dot += '    label="Constraints";\n';
    for (const constraint of thought.optimizationConstraints) {
      const constId = sanitizeId(constraint.id);
      const label = includeLabels ? constraint.name : constId;
      dot += `    ${constId} [label="${label}", shape=diamond];\n`;
    }
    dot += '  }\n\n';
  }

  if (thought.objectives) {
    for (const objective of thought.objectives) {
      const objId = sanitizeId(objective.id);
      const label = includeLabels ? `${objective.type}:\\n${objective.name}` : objId;
      dot += `  ${objId} [label="${label}"];\n`;
    }
  }

  if (thought.solution) {
    const qualityLabel = includeMetrics && thought.solution.quality
      ? `\\nquality: ${thought.solution.quality.toFixed(2)}`
      : '';
    dot += `  Solution [label="Solution${qualityLabel}", shape=doubleoctagon, style=filled, fillcolor=lightgreen];\n`;
    if (thought.objectives) {
      for (const objective of thought.objectives) {
        const objId = sanitizeId(objective.id);
        dot += `  ${objId} -> Solution;\n`;
      }
    }
  }

  dot += '}\n';
  return dot;
}

function optimizationToASCII(thought: OptimizationThought): string {
  let ascii = 'Optimization Problem:\n';
  ascii += '====================\n\n';

  if (thought.problem) {
    ascii += `Problem: ${thought.problem.name}\n`;
    ascii += `Type: ${thought.problem.type}\n`;
    ascii += `${thought.problem.description}\n\n`;
  }

  if (thought.variables && thought.variables.length > 0) {
    ascii += 'Decision Variables:\n';
    for (const variable of thought.variables) {
      const varType = (variable as any).type || 'unknown';
      ascii += `  ${variable.name} (${varType})\n`;
      if (variable.domain) {
        ascii += `    Domain: [${(variable.domain as any).lowerBound}, ${(variable.domain as any).upperBound}]\n`;
      }
    }
    ascii += '\n';
  }

  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    ascii += 'Constraints:\n';
    for (const constraint of thought.optimizationConstraints) {
      ascii += `  ${constraint.name} (${constraint.type})\n`;
      ascii += `    ${constraint.formula}\n`;
    }
    ascii += '\n';
  }

  if (thought.objectives && thought.objectives.length > 0) {
    ascii += 'Objectives:\n';
    for (const objective of thought.objectives) {
      ascii += `  ${objective.type.toUpperCase()}: ${objective.name}\n`;
      ascii += `    ${objective.formula}\n`;
    }
    ascii += '\n';
  }

  if (thought.solution) {
    ascii += 'Solution:\n';
    const solution = thought.solution as any;
    if (solution.status) {
      ascii += `  Status: ${solution.status}\n`;
    }
    if (solution.optimalValue !== undefined) {
      ascii += `  Optimal Value: ${solution.optimalValue}\n`;
    }
    if (solution.quality !== undefined) {
      ascii += `  Quality: ${solution.quality.toFixed(2)}\n`;
    }
    if (solution.assignments) {
      ascii += '  Assignments:\n';
      for (const [varId, value] of Object.entries(solution.assignments)) {
        ascii += `    ${varId} = ${value}\n`;
      }
    }
  }

  return ascii;
}
