/**
 * Analogical Visual Exporter (v7.0.2)
 * Sprint 8 Task 8.1: Analogical domain mapping export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 */

import type { AnalogicalThought } from '../../types/index.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';
import {
  generateSVGHeader,
  generateSVGFooter,
  renderRectNode,
  renderEdge,
  renderMetricsPanel,
  renderLegend,
  getNodeColor,
  DEFAULT_SVG_OPTIONS,
  type SVGNodePosition,
} from './svg-utils.js';

/**
 * Export analogical domain mapping to visual format
 */
export function exportAnalogicalMapping(thought: AnalogicalThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return analogicalToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return analogicalToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return analogicalToASCII(thought);
    case 'svg':
      return analogicalToSVG(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function analogicalToMermaid(
  thought: AnalogicalThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph LR\n';

  mermaid += '  subgraph Source["Source Domain"]\n';
  for (const entity of thought.sourceDomain.entities) {
    const entityId = sanitizeId('src_' + entity.id);
    const label = includeLabels ? entity.name : entityId;
    mermaid += `    ${entityId}["${label}"]\n`;
  }
  mermaid += '  end\n\n';

  mermaid += '  subgraph Target["Target Domain"]\n';
  for (const entity of thought.targetDomain.entities) {
    const entityId = sanitizeId('tgt_' + entity.id);
    const label = includeLabels ? entity.name : entityId;
    mermaid += `    ${entityId}["${label}"]\n`;
  }
  mermaid += '  end\n\n';

  for (const mapping of thought.mapping) {
    const srcId = sanitizeId('src_' + mapping.sourceEntityId);
    const tgtId = sanitizeId('tgt_' + mapping.targetEntityId);
    const confidenceLabel = includeMetrics ? `|${mapping.confidence.toFixed(2)}|` : '';

    mermaid += `  ${srcId} -.->${confidenceLabel} ${tgtId}\n`;
  }

  if (colorScheme !== 'monochrome') {
    mermaid += '\n';
    const srcColor = colorScheme === 'pastel' ? '#fff3e0' : '#ffd699';
    const tgtColor = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';

    for (const entity of thought.sourceDomain.entities) {
      const entityId = sanitizeId('src_' + entity.id);
      mermaid += `  style ${entityId} fill:${srcColor}\n`;
    }

    for (const entity of thought.targetDomain.entities) {
      const entityId = sanitizeId('tgt_' + entity.id);
      mermaid += `  style ${entityId} fill:${tgtColor}\n`;
    }
  }

  return mermaid;
}

function analogicalToDOT(
  thought: AnalogicalThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph AnalogicalMapping {\n';
  dot += '  rankdir=LR;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  dot += '  subgraph cluster_source {\n';
  dot += '    label="Source Domain";\n';
  dot += '    style=filled;\n';
  dot += '    fillcolor=lightyellow;\n\n';

  for (const entity of thought.sourceDomain.entities) {
    const entityId = sanitizeId('src_' + entity.id);
    const label = includeLabels ? entity.name : entityId;
    dot += `    ${entityId} [label="${label}"];\n`;
  }

  dot += '  }\n\n';

  dot += '  subgraph cluster_target {\n';
  dot += '    label="Target Domain";\n';
  dot += '    style=filled;\n';
  dot += '    fillcolor=lightblue;\n\n';

  for (const entity of thought.targetDomain.entities) {
    const entityId = sanitizeId('tgt_' + entity.id);
    const label = includeLabels ? entity.name : entityId;
    dot += `    ${entityId} [label="${label}"];\n`;
  }

  dot += '  }\n\n';

  for (const mapping of thought.mapping) {
    const srcId = sanitizeId('src_' + mapping.sourceEntityId);
    const tgtId = sanitizeId('tgt_' + mapping.targetEntityId);
    const confidenceLabel = includeMetrics ? `, label="${mapping.confidence.toFixed(2)}"` : '';

    dot += `  ${srcId} -> ${tgtId} [style=dashed${confidenceLabel}];\n`;
  }

  dot += '}\n';
  return dot;
}

function analogicalToASCII(thought: AnalogicalThought): string {
  let ascii = 'Analogical Domain Mapping:\n';
  ascii += '==========================\n\n';

  ascii += `Source Domain: ${thought.sourceDomain.name}\n`;
  ascii += `${thought.sourceDomain.description}\n\n`;

  ascii += `Target Domain: ${thought.targetDomain.name}\n`;
  ascii += `${thought.targetDomain.description}\n\n`;

  ascii += 'Mappings:\n';
  for (const mapping of thought.mapping) {
    const srcEntity = thought.sourceDomain.entities.find(e => e.id === mapping.sourceEntityId);
    const tgtEntity = thought.targetDomain.entities.find(e => e.id === mapping.targetEntityId);

    if (srcEntity && tgtEntity) {
      ascii += `  ${srcEntity.name} ←→ ${tgtEntity.name} (confidence: ${mapping.confidence.toFixed(2)})\n`;
      ascii += `    ${mapping.justification}\n`;
    }
  }

  ascii += `\nAnalogy Strength: ${thought.analogyStrength.toFixed(2)}\n`;

  return ascii;
}

/**
 * Export analogical domain mapping to native SVG format
 */
function analogicalToSVG(thought: AnalogicalThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
  } = options;

  const positions = new Map<string, SVGNodePosition>();

  // Source domain entities on the left
  const sourceY = 100;
  const entitySpacing = 100;
  const nodeWidth = 150;
  const nodeHeight = 40;
  thought.sourceDomain.entities.forEach((entity, index) => {
    const srcId = 'src_' + entity.id;
    positions.set(srcId, {
      id: srcId,
      label: includeLabels ? entity.name : srcId,
      x: 150,
      y: sourceY + index * entitySpacing,
      width: nodeWidth,
      height: nodeHeight,
      type: 'source',
    });
  });

  // Target domain entities on the right
  const targetY = 100;
  thought.targetDomain.entities.forEach((entity, index) => {
    const tgtId = 'tgt_' + entity.id;
    positions.set(tgtId, {
      id: tgtId,
      label: includeLabels ? entity.name : tgtId,
      x: svgWidth - 150,
      y: targetY + index * entitySpacing,
      width: nodeWidth,
      height: nodeHeight,
      type: 'target',
    });
  });

  const actualHeight = Math.max(
    DEFAULT_SVG_OPTIONS.height,
    Math.max(thought.sourceDomain.entities.length, thought.targetDomain.entities.length) * entitySpacing + 150
  );

  let svg = generateSVGHeader(svgWidth, actualHeight, 'Analogical Domain Mapping');

  // Render edges first (mapping connections)
  svg += '\n  <!-- Mappings -->\n  <g class="edges">';
  for (const mapping of thought.mapping) {
    const srcPos = positions.get('src_' + mapping.sourceEntityId);
    const tgtPos = positions.get('tgt_' + mapping.targetEntityId);
    if (srcPos && tgtPos) {
      const label = includeMetrics ? mapping.confidence.toFixed(2) : undefined;
      svg += renderEdge(srcPos, tgtPos, { label, style: 'dashed' });
    }
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';

  const sourceColors = getNodeColor('tertiary', colorScheme);
  const targetColors = getNodeColor('primary', colorScheme);

  for (const [, pos] of positions) {
    if (pos.type === 'source') {
      svg += renderRectNode(pos, sourceColors);
    } else {
      svg += renderRectNode(pos, targetColors);
    }
  }
  svg += '\n  </g>';

  // Render metrics panel
  if (includeMetrics) {
    const metrics = [
      { label: 'Analogy Strength', value: thought.analogyStrength.toFixed(2) },
      { label: 'Mappings', value: thought.mapping.length },
      { label: 'Source Entities', value: thought.sourceDomain.entities.length },
      { label: 'Target Entities', value: thought.targetDomain.entities.length },
    ];
    svg += renderMetricsPanel(svgWidth - 180, actualHeight - 140, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Source Domain', color: sourceColors },
    { label: 'Target Domain', color: targetColors },
  ];
  svg += renderLegend(20, actualHeight - 80, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}
