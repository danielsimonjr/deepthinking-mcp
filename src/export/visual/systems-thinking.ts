/**
 * Systems Thinking Visual Exporter (v4.3.0)
 * Sprint 8 Task 8.1: Systems thinking causal loop export to Mermaid, DOT, ASCII
 */

import type { SystemsThinkingThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';

/**
 * Export systems thinking causal loop diagram to visual format
 */
export function exportSystemsThinkingCausalLoops(thought: SystemsThinkingThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return systemsThinkingToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return systemsThinkingToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return systemsThinkingToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function systemsThinkingToMermaid(
  thought: SystemsThinkingThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TB\n';

  if (thought.system) {
    mermaid += `  System["${thought.system.name}"]\n\n`;
  }

  if (thought.components && thought.components.length > 0) {
    for (const component of thought.components) {
      const compId = sanitizeId(component.id);
      const label = includeLabels ? component.name : compId;
      const shape = component.type === 'stock' ? ['[[', ']]'] : ['[', ']'];
      mermaid += `  ${compId}${shape[0]}${label}${shape[1]}\n`;
    }
    mermaid += '\n';
  }

  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    for (const loop of thought.feedbackLoops) {
      const loopComponents = loop.components;

      for (let i = 0; i < loopComponents.length; i++) {
        const fromId = sanitizeId(loopComponents[i]);
        const toId = sanitizeId(loopComponents[(i + 1) % loopComponents.length]);

        const edgeLabel = includeMetrics
          ? `|${loop.type} (${loop.strength.toFixed(2)})| `
          : `|${loop.type}| `;

        const edgeStyle = loop.type === 'reinforcing' ? '-->' : '-..->';
        mermaid += `  ${fromId} ${edgeStyle}${edgeLabel}${toId}\n`;
      }
    }
    mermaid += '\n';
  }

  if (colorScheme !== 'monochrome' && thought.components) {
    const stockColor = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
    const flowColor = colorScheme === 'pastel' ? '#fff3e0' : '#ffd699';

    for (const component of thought.components) {
      const compId = sanitizeId(component.id);
      const color = component.type === 'stock' ? stockColor : flowColor;
      mermaid += `  style ${compId} fill:${color}\n`;
    }
  }

  return mermaid;
}

function systemsThinkingToDOT(
  thought: SystemsThinkingThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph SystemsThinking {\n';
  dot += '  rankdir=TB;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  if (thought.components && thought.components.length > 0) {
    for (const component of thought.components) {
      const compId = sanitizeId(component.id);
      const label = includeLabels ? component.name : compId;
      const shape = component.type === 'stock' ? 'box' : 'ellipse';

      dot += `  ${compId} [label="${label}", shape=${shape}];\n`;
    }
    dot += '\n';
  }

  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    for (const loop of thought.feedbackLoops) {
      const loopComponents = loop.components;

      for (let i = 0; i < loopComponents.length; i++) {
        const fromId = sanitizeId(loopComponents[i]);
        const toId = sanitizeId(loopComponents[(i + 1) % loopComponents.length]);

        const edgeLabel = includeMetrics
          ? `, label="${loop.type} (${loop.strength.toFixed(2)})"`
          : `, label="${loop.type}"`;

        const edgeStyle = loop.type === 'reinforcing' ? 'solid' : 'dashed';
        dot += `  ${fromId} -> ${toId} [style=${edgeStyle}${edgeLabel}];\n`;
      }
    }
  }

  dot += '}\n';
  return dot;
}

function systemsThinkingToASCII(thought: SystemsThinkingThought): string {
  let ascii = 'Systems Thinking Model:\n';
  ascii += '======================\n\n';

  if (thought.system) {
    ascii += `System: ${thought.system.name}\n`;
    ascii += `${thought.system.description}\n\n`;
  }

  if (thought.components && thought.components.length > 0) {
    ascii += 'Components:\n';
    for (const component of thought.components) {
      const typeIcon = component.type === 'stock' ? '[■]' : '(○)';
      ascii += `  ${typeIcon} ${component.name}: ${component.description}\n`;
    }
    ascii += '\n';
  }

  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    ascii += 'Feedback Loops:\n';
    for (const loop of thought.feedbackLoops) {
      const loopIcon = loop.type === 'reinforcing' ? '⊕' : '⊖';
      ascii += `  ${loopIcon} ${loop.name} (${loop.type})\n`;
      ascii += `    Strength: ${loop.strength.toFixed(2)}\n`;
      ascii += `    Components: ${loop.components.join(' → ')}\n`;
    }
    ascii += '\n';
  }

  if (thought.leveragePoints && thought.leveragePoints.length > 0) {
    ascii += 'Leverage Points:\n';
    for (const point of thought.leveragePoints) {
      ascii += `  ★ ${point.location} (effectiveness: ${point.effectiveness.toFixed(2)})\n`;
      ascii += `    ${point.description}\n`;
    }
  }

  return ascii;
}
