/**
 * Systems Thinking Visual Exporter (v7.0.2)
 * Sprint 8 Task 8.1: Systems thinking causal loop export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 */

import type { SystemsThinkingThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';
import {
  generateSVGHeader,
  generateSVGFooter,
  renderRectNode,
  renderEllipseNode,
  renderEdge,
  renderMetricsPanel,
  renderLegend,
  getNodeColor,
  DEFAULT_SVG_OPTIONS,
  type SVGNodePosition,
} from './svg-utils.js';

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
    case 'svg':
      return systemsThinkingToSVG(thought, options);
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

/**
 * Export systems thinking causal loop diagram to native SVG format
 */
function systemsThinkingToSVG(thought: SystemsThinkingThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = DEFAULT_SVG_OPTIONS.height,
  } = options;

  if (!thought.components || thought.components.length === 0) {
    return generateSVGHeader(svgWidth, 200, 'Systems Thinking') +
      '\n  <text x="400" y="100" text-anchor="middle" class="subtitle">No system components defined</text>\n' +
      generateSVGFooter();
  }

  const positions = new Map<string, SVGNodePosition>();
  const nodeWidth = 150;
  const nodeHeight = 40;

  // Layout components in a circular pattern
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  const radius = Math.min(centerX, centerY) - 100;

  thought.components.forEach((component, index) => {
    const angle = (2 * Math.PI * index) / (thought.components?.length || 1);
    const x = centerX + radius * Math.cos(angle - Math.PI / 2);
    const y = centerY + radius * Math.sin(angle - Math.PI / 2);

    positions.set(component.id, {
      id: component.id,
      label: includeLabels ? component.name : component.id,
      x,
      y,
      width: nodeWidth,
      height: nodeHeight,
      type: component.type,
    });
  });

  let svg = generateSVGHeader(svgWidth, svgHeight, 'Systems Thinking Model');

  // Render feedback loop edges
  svg += '\n  <!-- Feedback Loops -->\n  <g class="edges">';
  if (thought.feedbackLoops) {
    for (const loop of thought.feedbackLoops) {
      for (let i = 0; i < loop.components.length; i++) {
        const fromId = loop.components[i];
        const toId = loop.components[(i + 1) % loop.components.length];
        const fromPos = positions.get(fromId);
        const toPos = positions.get(toId);
        if (fromPos && toPos) {
          const label = includeMetrics ? `${loop.type[0].toUpperCase()} (${loop.strength.toFixed(1)})` : undefined;
          const style = loop.type === 'reinforcing' ? 'solid' : 'dashed';
          svg += renderEdge(fromPos, toPos, { label, style });
        }
      }
    }
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Components -->\n  <g class="nodes">';

  const stockColors = getNodeColor('primary', colorScheme);
  const flowColors = getNodeColor('secondary', colorScheme);

  for (const [, pos] of positions) {
    if (pos.type === 'stock') {
      svg += renderRectNode(pos, stockColors);
    } else {
      svg += renderEllipseNode(pos, flowColors);
    }
  }
  svg += '\n  </g>';

  // Render metrics panel
  if (includeMetrics) {
    const metrics = [
      { label: 'Components', value: thought.components.length },
      { label: 'Feedback Loops', value: thought.feedbackLoops?.length || 0 },
      { label: 'Leverage Points', value: thought.leveragePoints?.length || 0 },
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 110, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Stock', color: stockColors },
    { label: 'Flow', color: flowColors, shape: 'ellipse' as const },
  ];
  svg += renderLegend(20, svgHeight - 80, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}
