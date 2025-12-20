/**
 * Shannon Visual Exporter (v7.0.3)
 * Sprint 8 Task 8.1: Shannon stage flow export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 * Phase 9: Added GraphML and TikZ export support
 */

import type { ShannonThought } from '../../../types/index.js';
import type { VisualExportOptions } from '../types.js';
import { sanitizeId } from '../utils.js';
import {
  generateSVGHeader,
  generateSVGFooter,
  renderRectNode,
  renderStadiumNode,
  renderHorizontalEdge,
  renderMetricsPanel,
  renderLegend,
  getNodeColor,
  layoutNodesHorizontally,
  DEFAULT_SVG_OPTIONS,
} from '../utils/svg.js';
import {
  createLinearGraphML,
} from '../utils/graphml.js';
import {
  type TikZNode,
  type TikZEdge,
  generateTikZ,
} from '../utils/tikz.js';
import {
  generateHTMLHeader,
  generateHTMLFooter,
  escapeHTML,
  renderMetricCard,
  renderSection,
  renderList,
  renderProgressBar,
  renderBadge,
} from '../utils/html.js';
import {
  generateLinearFlowModelica,
} from '../utils/modelica.js';
import {
  generateActivityDiagram,
} from '../utils/uml.js';
import {
  generateLinearFlowJson,
} from '../utils/json.js';
import {
  section,
  list,
  keyValueSection,
  progressBar,
  mermaidBlock,
  document as mdDocument,
} from '../utils/markdown.js';

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
    case 'svg':
      return shannonToSVG(thought, options);
    case 'graphml':
      return shannonToGraphML(thought, options);
    case 'tikz':
      return shannonToTikZ(thought, options);
    case 'html':
      return shannonToHTML(thought, options);
    case 'modelica':
      return shannonToModelica(thought, options);
    case 'uml':
      return shannonToUML(thought, options);
    case 'json':
      return shannonToJSON(thought, options);
    case 'markdown':
      return shannonToMarkdown(thought, options);
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

/**
 * Export Shannon stage flow to native SVG format
 */
function shannonToSVG(thought: ShannonThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = 300,
  } = options;

  // Create nodes from stages
  const nodes = stages.map(stage => ({
    id: sanitizeId(stage),
    label: includeLabels ? stageLabels[stage] : sanitizeId(stage),
    type: stage === thought.stage ? 'current' : 'stage',
  }));

  const positions = layoutNodesHorizontally(nodes, {
    width: svgWidth,
    height: svgHeight,
    nodeWidth: 130,
    nodeHeight: 45,
    nodeSpacing: 25,
  });

  let svg = generateSVGHeader(svgWidth, svgHeight, 'Shannon Stage Flow');

  // Render edges between consecutive stages
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  for (let i = 0; i < stages.length - 1; i++) {
    const fromPos = positions.get(sanitizeId(stages[i]));
    const toPos = positions.get(sanitizeId(stages[i + 1]));
    if (fromPos && toPos) {
      svg += renderHorizontalEdge(fromPos, toPos, {});
    }
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const pos = positions.get(sanitizeId(stage));
    if (pos) {
      const isCurrent = stage === thought.stage;
      const colors = isCurrent
        ? getNodeColor('primary', colorScheme)
        : getNodeColor('neutral', colorScheme);

      if (isCurrent) {
        svg += renderStadiumNode(pos, colors);
      } else {
        svg += renderRectNode(pos, colors);
      }
    }
  }
  svg += '\n  </g>';

  // Render metrics
  if (includeMetrics && thought.uncertainty !== undefined) {
    const metrics = [
      { label: 'Stage', value: stageLabels[thought.stage] },
      { label: 'Uncertainty', value: thought.uncertainty.toFixed(2) },
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 80, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Current', color: getNodeColor('primary', colorScheme) },
    { label: 'Stage', color: getNodeColor('neutral', colorScheme) },
  ];
  svg += renderLegend(20, svgHeight - 60, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}

/**
 * Export Shannon stage flow to GraphML format
 */
function shannonToGraphML(_thought: ShannonThought, options: VisualExportOptions): string {
  const { includeLabels = true } = options;

  // Create labels from stageLabels
  const labels = stages.map(stage =>
    includeLabels ? stageLabels[stage] : sanitizeId(stage)
  );

  return createLinearGraphML(labels, {
    graphName: 'Shannon Stage Flow',
    directed: true
  });
}

/**
 * Export Shannon stage flow to TikZ format
 */
function shannonToTikZ(thought: ShannonThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  // Create TikZ nodes with horizontal spacing
  const nodes: TikZNode[] = stages.map((stage, i) => ({
    id: sanitizeId(stage),
    label: includeLabels ? stageLabels[stage] : sanitizeId(stage),
    x: i * 3,
    y: 0,
    shape: stage === thought.stage ? 'stadium' : 'rectangle',
    type: stage === thought.stage ? 'primary' : 'neutral',
  }));

  // Create edges between consecutive stages
  const edges: TikZEdge[] = [];
  for (let i = 0; i < stages.length - 1; i++) {
    edges.push({
      source: sanitizeId(stages[i]),
      target: sanitizeId(stages[i + 1]),
      label: '',
    });
  }

  return generateTikZ(nodes, edges, {
    title: 'Shannon Stage Flow',
    includeLabels,
    includeMetrics,
  });
}

/**
 * Export Shannon stage flow to HTML format
 */
function shannonToHTML(thought: ShannonThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Shannon Problem-Solving Analysis',
    htmlTheme = 'light',
    includeMetrics = true,
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // Metrics
  if (includeMetrics) {
    const stageIndex = stages.indexOf(thought.stage);
    const progress = ((stageIndex + 1) / stages.length) * 100;

    html += '<div class="metrics-grid">';
    html += renderMetricCard('Current Stage', stageLabels[thought.stage], 'primary');
    html += renderMetricCard('Uncertainty', thought.uncertainty.toFixed(2), 'info');
    html += renderMetricCard('Progress', `${progress.toFixed(0)}%`, 'success');
    html += '</div>\n';
  }

  // Stage flow visualization
  html += renderSection('Stage Flow', `
    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0;">
      ${stages.map(stage => {
        const isCurrent = stage === thought.stage;
        const badge = renderBadge(stageLabels[stage], isCurrent ? 'primary' : 'secondary');
        return badge;
      }).join(' → ')}
    </div>
    ${renderProgressBar((stages.indexOf(thought.stage) + 1) / stages.length * 100, 'primary')}
  `, '🔄');

  // Current stage
  html += renderSection('Current Stage', `
    <p><strong>${stageLabels[thought.stage]}</strong></p>
    <p class="text-secondary">Uncertainty: ${(thought.uncertainty * 100).toFixed(0)}%</p>
  `, '📍');

  // Dependencies
  if (thought.dependencies && thought.dependencies.length > 0) {
    html += renderSection('Dependencies', renderList(thought.dependencies), '🔗');
  }

  // Assumptions
  if (thought.assumptions && thought.assumptions.length > 0) {
    html += renderSection('Assumptions', renderList(thought.assumptions), '💡');
  }

  // Known limitations
  if (thought.knownLimitations && thought.knownLimitations.length > 0) {
    html += renderSection('Known Limitations', renderList(thought.knownLimitations), '⚠️');
  }

  html += generateHTMLFooter(htmlStandalone);
  return html;
}

/**
 * Export Shannon stage flow to Modelica format
 */
function shannonToModelica(thought: ShannonThought, options: VisualExportOptions): string {
  const { modelicaPackageName, modelicaIncludeAnnotations = true, includeMetrics = true } = options;
  const stageLabelsArray = stages.map(s => stageLabels[s]);

  // Use the shared linear flow generator
  let modelica = generateLinearFlowModelica(stageLabelsArray, stageLabels[thought.stage], {
    packageName: modelicaPackageName || 'ShannonStageFlow',
    includeAnnotations: modelicaIncludeAnnotations,
    includeMetrics,
  });

  // Add uncertainty metric if available
  if (includeMetrics && thought.uncertainty !== undefined) {
    // Insert before package footer
    const insertPoint = modelica.lastIndexOf('end ');
    const metricsSection = `
  // Shannon-specific metrics
  parameter Real uncertainty = ${thought.uncertainty.toFixed(3)} "Current uncertainty level";

`;
    modelica = modelica.slice(0, insertPoint) + metricsSection + modelica.slice(insertPoint);
  }

  return modelica;
}

/**
 * Export Shannon stage flow to UML/PlantUML format
 */
function shannonToUML(thought: ShannonThought, options: VisualExportOptions): string {
  const { umlTheme, umlDirection } = options;
  const stageLabelsArray = stages.map(s => stageLabels[s]);

  return generateActivityDiagram(stageLabelsArray, stageLabels[thought.stage], {
    title: 'Shannon Stage Flow',
    theme: umlTheme,
    direction: umlDirection,
  });
}

/**
 * Export Shannon stage flow to JSON format
 */
function shannonToJSON(thought: ShannonThought, options: VisualExportOptions): string {
  const { jsonPrettyPrint = true, jsonIndent = 2, includeMetrics = true } = options;
  const stageLabelsArray = stages.map(s => stageLabels[s]);

  let json = generateLinearFlowJson('Shannon Stage Flow', 'shannon', stageLabelsArray, stageLabels[thought.stage], {
    prettyPrint: jsonPrettyPrint,
    indent: jsonIndent,
    includeMetrics,
  });

  // Parse, add custom fields, and re-serialize
  if (includeMetrics) {
    const graph = JSON.parse(json);
    graph.metadata.mode = 'shannon';
    graph.metrics = graph.metrics || {};
    graph.metrics.uncertainty = thought.uncertainty;
    graph.metrics.stage = thought.stage;
    if (thought.dependencies) {
      graph.metrics.dependencyCount = thought.dependencies.length;
    }
    if (thought.assumptions) {
      graph.metrics.assumptionCount = thought.assumptions.length;
    }
    json = JSON.stringify(graph, null, jsonPrettyPrint !== false ? jsonIndent : 0);
  }

  return json;
}

/**
 * Export Shannon stage flow to Markdown format
 */
function shannonToMarkdown(thought: ShannonThought, options: VisualExportOptions): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
    includeMetrics = true,
  } = options;

  const parts: string[] = [];

  // Metrics
  if (includeMetrics) {
    const stageIndex = stages.indexOf(thought.stage);
    const progress = ((stageIndex + 1) / stages.length) * 100;

    const metricsContent = keyValueSection({
      'Current Stage': stageLabels[thought.stage],
      'Uncertainty': thought.uncertainty.toFixed(2),
      'Progress': `${progress.toFixed(0)}%`,
    });
    parts.push(section('Metrics', metricsContent));
  }

  // Stage flow
  const stageFlow = stages.map(stage => {
    const isCurrent = stage === thought.stage;
    return isCurrent ? `**[${stageLabels[stage]}]**` : stageLabels[stage];
  }).join(' → ');

  const stageIndex = stages.indexOf(thought.stage);
  const progressPct = ((stageIndex + 1) / stages.length) * 100;

  parts.push(section('Stage Flow', `${stageFlow}\n\n${progressBar(progressPct)}`));

  // Current stage details
  parts.push(section('Current Stage', `**${stageLabels[thought.stage]}**\n\nUncertainty: ${(thought.uncertainty * 100).toFixed(0)}%`));

  // Dependencies
  if (thought.dependencies && thought.dependencies.length > 0) {
    parts.push(section('Dependencies', list(thought.dependencies)));
  }

  // Assumptions
  if (thought.assumptions && thought.assumptions.length > 0) {
    parts.push(section('Assumptions', list(thought.assumptions)));
  }

  // Known limitations
  if (thought.knownLimitations && thought.knownLimitations.length > 0) {
    parts.push(section('Known Limitations', list(thought.knownLimitations)));
  }

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaidDiagram = shannonToMermaid(thought, 'default', true, true);
    parts.push(section('Stage Flow Diagram', mermaidBlock(mermaidDiagram)));
  }

  return mdDocument('Shannon Problem-Solving Analysis', parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: {
      mode: 'shannon',
      stage: thought.stage,
      uncertainty: thought.uncertainty,
    },
  });
}
