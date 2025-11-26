/**
 * Counterfactual Visual Exporter (v4.3.0)
 * Sprint 8 Task 8.1: Counterfactual scenario export to Mermaid, DOT, ASCII
 */

import type { CounterfactualThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';

/**
 * Export counterfactual scenario tree to visual format
 */
export function exportCounterfactualScenarios(thought: CounterfactualThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return counterfactualToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return counterfactualToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return counterfactualToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function counterfactualToMermaid(
  thought: CounterfactualThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TD\n';

  const interventionId = 'intervention';
  mermaid += `  ${interventionId}["${thought.interventionPoint.description}"]\n`;

  const actualId = sanitizeId(thought.actual.id);
  const actualLabel = includeLabels ? thought.actual.name : actualId;
  mermaid += `  ${actualId}["Actual: ${actualLabel}"]\n`;
  mermaid += `  ${interventionId} -->|no change| ${actualId}\n`;

  for (const scenario of thought.counterfactuals) {
    const scenarioId = sanitizeId(scenario.id);
    const label = includeLabels ? scenario.name : scenarioId;
    const likelihoodLabel = includeMetrics && scenario.likelihood
      ? ` (${scenario.likelihood.toFixed(2)})`
      : '';

    mermaid += `  ${scenarioId}["CF: ${label}${likelihoodLabel}"]\n`;
    mermaid += `  ${interventionId} -->|intervene| ${scenarioId}\n`;
  }

  if (colorScheme !== 'monochrome') {
    mermaid += '\n';
    const actualColor = colorScheme === 'pastel' ? '#fff3e0' : '#ffd699';
    mermaid += `  style ${actualId} fill:${actualColor}\n`;

    const cfColor = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
    for (const scenario of thought.counterfactuals) {
      const scenarioId = sanitizeId(scenario.id);
      mermaid += `  style ${scenarioId} fill:${cfColor}\n`;
    }
  }

  return mermaid;
}

function counterfactualToDOT(
  thought: CounterfactualThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph CounterfactualScenarios {\n';
  dot += '  rankdir=TD;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  const interventionId = 'intervention';
  dot += `  ${interventionId} [label="${thought.interventionPoint.description}", shape=diamond];\n\n`;

  const actualId = sanitizeId(thought.actual.id);
  const actualLabel = includeLabels ? thought.actual.name : actualId;
  dot += `  ${actualId} [label="Actual: ${actualLabel}", style=filled, fillcolor=lightyellow];\n`;
  dot += `  ${interventionId} -> ${actualId} [label="no change"];\n\n`;

  for (const scenario of thought.counterfactuals) {
    const scenarioId = sanitizeId(scenario.id);
    const label = includeLabels ? scenario.name : scenarioId;
    const likelihoodLabel = includeMetrics && scenario.likelihood
      ? ` (${scenario.likelihood.toFixed(2)})`
      : '';

    dot += `  ${scenarioId} [label="CF: ${label}${likelihoodLabel}", style=filled, fillcolor=lightblue];\n`;
    dot += `  ${interventionId} -> ${scenarioId} [label="intervene"];\n`;
  }

  dot += '}\n';
  return dot;
}

function counterfactualToASCII(thought: CounterfactualThought): string {
  let ascii = 'Counterfactual Scenario Tree:\n';
  ascii += '=============================\n\n';

  ascii += `Intervention Point: ${thought.interventionPoint.description}\n`;
  ascii += `Timing: ${thought.interventionPoint.timing}\n`;
  ascii += `Feasibility: ${thought.interventionPoint.feasibility.toFixed(2)}\n\n`;

  ascii += '┌─ Actual Scenario:\n';
  ascii += `│  ${thought.actual.name}\n`;
  ascii += `│  ${thought.actual.description}\n\n`;

  ascii += '└─ Counterfactual Scenarios:\n';
  for (const scenario of thought.counterfactuals) {
    const likelihoodStr = scenario.likelihood ? ` (likelihood: ${scenario.likelihood.toFixed(2)})` : '';
    ascii += `   ├─ ${scenario.name}${likelihoodStr}\n`;
    ascii += `   │  ${scenario.description}\n`;
  }

  return ascii;
}
