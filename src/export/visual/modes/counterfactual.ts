/**
 * Counterfactual Visual Exporter (v7.0.3)
 * Sprint 8 Task 8.1: Counterfactual scenario export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 * Phase 9: Added GraphML and TikZ export support
 */

import type { CounterfactualThought } from '../../../types/index.js';
import type { VisualExportOptions } from '../types.js';
import { sanitizeId } from '../utils.js';
import {
  generateSVGHeader,
  generateSVGFooter,
  renderRectNode,
  renderStadiumNode,
  renderEdge,
  renderMetricsPanel,
  renderLegend,
  getNodeColor,
  DEFAULT_SVG_OPTIONS,
  type SVGNodePosition,
} from '../utils/svg.js';
import {
  generateGraphML,
  type GraphMLNode,
  type GraphMLEdge,
  type GraphMLOptions,
} from '../utils/graphml.js';
import {
  generateTikZ,
  type TikZNode,
  type TikZEdge,
  type TikZOptions,
} from '../utils/tikz.js';
import {
  generateHTMLHeader,
  generateHTMLFooter,
  escapeHTML,
  renderMetricCard,
  renderSection,
  renderTable,
} from '../utils/html.js';
import {
  sanitizeModelicaId,
  escapeModelicaString,
} from '../utils/modelica.js';
import {
  generateUmlDiagram,
  type UmlNode,
  type UmlEdge,
} from '../utils/uml.js';
import {
  createJsonGraph,
  addNode,
  addEdge,
  addMetric,
  serializeGraph,
} from '../utils/json.js';
import {
  section,
  table,
  keyValueSection,
  mermaidBlock,
  document as mdDocument,
} from '../utils/markdown.js';

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
    case 'svg':
      return counterfactualToSVG(thought, options);
    case 'graphml':
      return counterfactualToGraphML(thought, options);
    case 'tikz':
      return counterfactualToTikZ(thought, options);
    case 'html':
      return counterfactualToHTML(thought, options);
    case 'modelica':
      return counterfactualToModelica(thought, options);
    case 'uml':
      return counterfactualToUML(thought, options);
    case 'json':
      return counterfactualToJSON(thought, options);
    case 'markdown':
      return counterfactualToMarkdown(thought, options);
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

/**
 * Export counterfactual scenario tree to native SVG format
 */
function counterfactualToSVG(thought: CounterfactualThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
  } = options;

  const positions = new Map<string, SVGNodePosition>();
  const nodeWidth = 150;
  const nodeHeight = 40;

  // Intervention point at the top
  const interventionId = 'intervention';
  positions.set(interventionId, {
    id: interventionId,
    label: includeLabels ? thought.interventionPoint.description : interventionId,
    x: svgWidth / 2,
    y: 80,
    width: nodeWidth,
    height: nodeHeight,
    type: 'intervention',
  });

  // Actual scenario on the left
  const actualId = thought.actual.id;
  const actualLabel = includeLabels ? `Actual: ${thought.actual.name}` : actualId;
  positions.set(actualId, {
    id: actualId,
    label: actualLabel,
    x: svgWidth / 4,
    y: 200,
    width: nodeWidth,
    height: nodeHeight,
    type: 'actual',
  });

  // Counterfactual scenarios on the right
  const cfCount = thought.counterfactuals.length;
  const cfStartY = 200;
  const cfSpacing = 120;
  thought.counterfactuals.forEach((scenario, index) => {
    const cfLabel = includeLabels ? `CF: ${scenario.name}` : scenario.id;
    positions.set(scenario.id, {
      id: scenario.id,
      label: cfLabel,
      x: (svgWidth * 3) / 4,
      y: cfStartY + index * cfSpacing,
      width: nodeWidth,
      height: nodeHeight,
      type: 'counterfactual',
    });
  });

  const actualHeight = Math.max(DEFAULT_SVG_OPTIONS.height, cfStartY + (cfCount - 1) * cfSpacing + 150);

  let svg = generateSVGHeader(svgWidth, actualHeight, 'Counterfactual Scenarios');

  // Render edges first (behind nodes)
  svg += '\n  <!-- Edges -->\n  <g class="edges">';

  // Edge from intervention to actual
  const interventionPos = positions.get(interventionId)!;
  const actualPos = positions.get(actualId)!;
  svg += renderEdge(interventionPos, actualPos, { label: 'no change' });

  // Edges from intervention to counterfactuals
  for (const scenario of thought.counterfactuals) {
    const cfPos = positions.get(scenario.id);
    if (cfPos) {
      const label = includeMetrics && scenario.likelihood
        ? `${scenario.likelihood.toFixed(2)}`
        : 'intervene';
      svg += renderEdge(interventionPos, cfPos, { label });
    }
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';

  // Render intervention point (diamond)
  const interventionColors = getNodeColor('warning', colorScheme);
  svg += `\n    <polygon points="${interventionPos.x},${interventionPos.y - 30} ${interventionPos.x + 40},${interventionPos.y} ${interventionPos.x},${interventionPos.y + 30} ${interventionPos.x - 40},${interventionPos.y}" fill="${interventionColors.fill}" stroke="${interventionColors.stroke}" stroke-width="2"/>`;
  svg += `\n    <text x="${interventionPos.x}" y="${interventionPos.y + 5}" text-anchor="middle" class="node-label">${interventionPos.label}</text>`;

  // Render actual scenario
  const actualColors = getNodeColor('tertiary', colorScheme);
  svg += renderRectNode(actualPos, actualColors);

  // Render counterfactual scenarios
  const cfColors = getNodeColor('primary', colorScheme);
  for (const [id, pos] of positions) {
    if (id !== interventionId && id !== actualId) {
      svg += renderStadiumNode(pos, cfColors);
    }
  }
  svg += '\n  </g>';

  // Render metrics panel
  if (includeMetrics) {
    const metrics = [
      { label: 'Counterfactuals', value: thought.counterfactuals.length },
      { label: 'Feasibility', value: thought.interventionPoint.feasibility.toFixed(2) },
    ];
    svg += renderMetricsPanel(svgWidth - 180, actualHeight - 110, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Intervention', color: interventionColors, shape: 'diamond' as const },
    { label: 'Actual', color: actualColors },
    { label: 'Counterfactual', color: cfColors, shape: 'stadium' as const },
  ];
  svg += renderLegend(20, actualHeight - 110, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}

/**
 * Export counterfactual scenario tree to GraphML format
 */
function counterfactualToGraphML(thought: CounterfactualThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  // Create nodes: intervention point, actual scenario, and counterfactual scenarios
  const nodes: GraphMLNode[] = [];

  // Intervention point node
  nodes.push({
    id: 'intervention',
    label: includeLabels ? thought.interventionPoint.description : 'intervention',
    type: 'intervention',
    metadata: {
      timing: thought.interventionPoint.timing,
      feasibility: thought.interventionPoint.feasibility,
    },
  });

  // Actual scenario node
  nodes.push({
    id: thought.actual.id,
    label: includeLabels ? `Actual: ${thought.actual.name}` : thought.actual.id,
    type: 'actual',
    metadata: {
      description: thought.actual.description,
    },
  });

  // Counterfactual scenario nodes
  for (const scenario of thought.counterfactuals) {
    nodes.push({
      id: scenario.id,
      label: includeLabels ? `CF: ${scenario.name}` : scenario.id,
      type: 'counterfactual',
      metadata: {
        description: scenario.description,
        likelihood: scenario.likelihood,
      },
    });
  }

  // Create edges showing transitions/comparisons
  const edges: GraphMLEdge[] = [];

  // Edge from intervention to actual
  edges.push({
    id: 'e_intervention_actual',
    source: 'intervention',
    target: thought.actual.id,
    label: 'no change',
  });

  // Edges from intervention to counterfactuals
  for (let i = 0; i < thought.counterfactuals.length; i++) {
    const scenario = thought.counterfactuals[i];
    edges.push({
      id: `e_intervention_cf${i}`,
      source: 'intervention',
      target: scenario.id,
      label: 'intervene',
      metadata: includeMetrics && scenario.likelihood !== undefined
        ? { weight: scenario.likelihood }
        : undefined,
    });
  }

  const graphmlOptions: GraphMLOptions = {
    graphName: 'Counterfactual Scenarios',
  };

  return generateGraphML(nodes, edges, graphmlOptions);
}

/**
 * Export counterfactual scenario tree to TikZ format
 */
function counterfactualToTikZ(thought: CounterfactualThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  const nodes: TikZNode[] = [];

  // Intervention point at the top center
  nodes.push({
    id: 'intervention',
    label: includeLabels ? thought.interventionPoint.description : 'intervention',
    x: 4,
    y: 0,
    type: 'intervention',
    shape: 'diamond',
  });

  // Actual scenario on the left
  nodes.push({
    id: thought.actual.id,
    label: includeLabels ? `Actual: ${thought.actual.name}` : thought.actual.id,
    x: 2,
    y: -2,
    type: 'actual',
    shape: 'rectangle',
  });

  // Counterfactual scenarios on the right
  const cfCount = thought.counterfactuals.length;
  const cfSpacing = 1.5;
  const cfStartY = -2;

  thought.counterfactuals.forEach((scenario, index) => {
    const yOffset = (cfCount - 1) * cfSpacing / 2;
    nodes.push({
      id: scenario.id,
      label: includeLabels ? `CF: ${scenario.name}` : scenario.id,
      x: 6,
      y: cfStartY - index * cfSpacing + yOffset,
      type: 'counterfactual',
      shape: 'ellipse',
    });
  });

  // Create edges
  const edges: TikZEdge[] = [];

  // Edge from intervention to actual
  edges.push({
    source: 'intervention',
    target: thought.actual.id,
    label: 'no change',
    directed: true,
  });

  // Edges from intervention to counterfactuals
  for (const scenario of thought.counterfactuals) {
    edges.push({
      source: 'intervention',
      target: scenario.id,
      label: includeMetrics && scenario.likelihood !== undefined
        ? scenario.likelihood.toFixed(2)
        : 'intervene',
      directed: true,
    });
  }

  const tikzOptions: TikZOptions = {
    title: 'Counterfactual Scenarios',
  };

  return generateTikZ(nodes, edges, tikzOptions);
}

/**
 * Export counterfactual scenarios to HTML format
 */
function counterfactualToHTML(thought: CounterfactualThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Counterfactual Analysis',
    htmlTheme = 'light',
    includeMetrics = true,
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // Metrics
  if (includeMetrics) {
    html += '<div class="metrics-grid">';
    html += renderMetricCard('Counterfactuals', thought.counterfactuals.length, 'primary');
    html += renderMetricCard('Feasibility', (thought.interventionPoint.feasibility * 100).toFixed(0) + '%', 'info');
    html += renderMetricCard('Expected Impact', (thought.interventionPoint.expectedImpact * 100).toFixed(0) + '%', 'success');
    html += '</div>\n';
  }

  // Intervention point
  html += renderSection('Intervention Point', `
    <p><strong>Description:</strong> ${escapeHTML(thought.interventionPoint.description)}</p>
    <p><strong>Timing:</strong> ${escapeHTML(thought.interventionPoint.timing)}</p>
    <p><strong>Feasibility:</strong> ${(thought.interventionPoint.feasibility * 100).toFixed(0)}%</p>
    <p><strong>Expected Impact:</strong> ${(thought.interventionPoint.expectedImpact * 100).toFixed(0)}%</p>
  `, '🔀');

  // Actual outcome
  html += renderSection('Actual Outcome', `
    <div class="card">
      <div class="card-header">${escapeHTML(thought.actual.name)}</div>
      <p>${escapeHTML(thought.actual.description)}</p>
    </div>
  `, '✓');

  // Counterfactual scenarios
  const cfRows = thought.counterfactuals.map(cf => {
    const primaryOutcome = cf.outcomes[0];
    return [
      cf.name,
      primaryOutcome ? primaryOutcome.description.substring(0, 60) + (primaryOutcome.description.length > 60 ? '...' : '') : '-',
      cf.likelihood !== undefined ? cf.likelihood.toFixed(2) : '-',
      primaryOutcome?.impact || '-',
    ];
  });
  html += renderSection('Counterfactual Scenarios', renderTable(
    ['Scenario', 'Outcome', 'Likelihood', 'Impact'],
    cfRows
  ), '🔮');

  html += generateHTMLFooter(htmlStandalone);
  return html;
}

/**
 * Export counterfactual scenarios to Modelica format
 */
function counterfactualToModelica(thought: CounterfactualThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;

  let modelica = 'package CounterfactualScenarios\n';
  modelica += '  "Counterfactual scenario analysis with original vs. alternative outcomes"\n\n';

  // Intervention point record
  modelica += '  record InterventionPoint\n';
  modelica += '    "The point at which the counterfactual diverges from the actual"\n';
  modelica += `    String description = "${escapeModelicaString(thought.interventionPoint.description)}";\n`;
  modelica += `    String timing = "${escapeModelicaString(thought.interventionPoint.timing)}";\n`;
  modelica += `    Real feasibility = ${thought.interventionPoint.feasibility};\n`;
  modelica += `    Real expectedImpact = ${thought.interventionPoint.expectedImpact};\n`;
  modelica += '  end InterventionPoint;\n\n';

  // Actual scenario record
  modelica += '  record ActualScenario\n';
  modelica += '    "The actual outcome that occurred"\n';
  modelica += `    String id = "${sanitizeModelicaId(thought.actual.id)}";\n`;
  modelica += `    String name = "${escapeModelicaString(thought.actual.name)}";\n`;
  modelica += `    String description = "${escapeModelicaString(thought.actual.description)}";\n`;
  modelica += '  end ActualScenario;\n\n';

  // Counterfactual scenario records
  for (let i = 0; i < thought.counterfactuals.length; i++) {
    const scenario = thought.counterfactuals[i];
    const recordName = sanitizeModelicaId(`CF_${scenario.id}`);

    modelica += `  record ${recordName}\n`;
    modelica += `    "Counterfactual: ${escapeModelicaString(scenario.name)}"\n`;
    modelica += `    String id = "${sanitizeModelicaId(scenario.id)}";\n`;
    modelica += `    String name = "${escapeModelicaString(scenario.name)}";\n`;
    modelica += `    String description = "${escapeModelicaString(scenario.description)}";\n`;

    if (includeMetrics && scenario.likelihood !== undefined) {
      modelica += `    Real likelihood = ${scenario.likelihood};\n`;
    }

    // Add outcomes if present
    if (scenario.outcomes && scenario.outcomes.length > 0) {
      modelica += `    String outcomes[${scenario.outcomes.length}] = {`;
      modelica += scenario.outcomes.map(o => `"${escapeModelicaString(o.description)}"`).join(', ');
      modelica += '};\n';
    }

    modelica += `  end ${recordName};\n\n`;
  }

  // Model showing the divergence
  modelica += '  model ScenarioDivergence\n';
  modelica += '    "Model showing the branching from intervention point to outcomes"\n';
  modelica += '    InterventionPoint intervention;\n';
  modelica += '    ActualScenario actual;\n';

  for (let i = 0; i < thought.counterfactuals.length; i++) {
    const scenario = thought.counterfactuals[i];
    const recordName = sanitizeModelicaId(`CF_${scenario.id}`);
    modelica += `    ${recordName} counterfactual${i + 1};\n`;
  }

  if (includeMetrics) {
    modelica += '\n    annotation(Documentation(info="<html>\n';
    modelica += `      <p>Counterfactuals: ${thought.counterfactuals.length}</p>\n`;
    modelica += `      <p>Feasibility: ${(thought.interventionPoint.feasibility * 100).toFixed(1)}%</p>\n`;
    modelica += `      <p>Expected Impact: ${(thought.interventionPoint.expectedImpact * 100).toFixed(1)}%</p>\n`;
    modelica += '    </html>"));\n';
  }

  modelica += '  end ScenarioDivergence;\n';
  modelica += 'end CounterfactualScenarios;\n';

  return modelica;
}

/**
 * Export counterfactual scenarios to UML format
 */
function counterfactualToUML(thought: CounterfactualThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  const nodes: UmlNode[] = [];
  const edges: UmlEdge[] = [];

  // Intervention point node (decision node)
  nodes.push({
    id: 'intervention',
    label: includeLabels ? thought.interventionPoint.description : 'Intervention',
    shape: 'state',
    stereotype: 'decision',
  });

  // Actual scenario node
  nodes.push({
    id: thought.actual.id,
    label: includeLabels ? `Actual: ${thought.actual.name}` : 'Actual',
    shape: 'state',
  });

  // Edge from intervention to actual (no intervention taken)
  edges.push({
    source: 'intervention',
    target: thought.actual.id,
    label: 'no change',
    type: 'arrow',
  });

  // Counterfactual scenario nodes and edges
  for (const scenario of thought.counterfactuals) {
    nodes.push({
      id: scenario.id,
      label: includeLabels ? `CF: ${scenario.name}` : scenario.id,
      shape: 'state',
    });

    const edgeLabel = includeMetrics && scenario.likelihood !== undefined
      ? `intervene (${scenario.likelihood.toFixed(2)})`
      : 'intervene';

    edges.push({
      source: 'intervention',
      target: scenario.id,
      label: edgeLabel,
      type: 'arrow',
    });
  }

  return generateUmlDiagram(nodes, edges, {
    diagramType: 'state',
    title: 'Counterfactual Scenarios',
    includeMetrics,
  });
}

/**
 * Export counterfactual scenarios to JSON format
 */
function counterfactualToJSON(thought: CounterfactualThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  const graph = createJsonGraph('counterfactual', 'Counterfactual Scenarios');

  // Add intervention point node
  addNode(graph, {
    id: 'intervention',
    label: includeLabels ? thought.interventionPoint.description : 'Intervention',
    type: 'intervention',
    metadata: {
      timing: thought.interventionPoint.timing,
      feasibility: thought.interventionPoint.feasibility,
      expectedImpact: thought.interventionPoint.expectedImpact,
    },
  });

  // Add actual scenario node
  addNode(graph, {
    id: thought.actual.id,
    label: includeLabels ? `Actual: ${thought.actual.name}` : thought.actual.id,
    type: 'actual',
    metadata: {
      name: thought.actual.name,
      description: thought.actual.description,
    },
  });

  // Add edge from intervention to actual
  addEdge(graph, {
    id: 'e_intervention_actual',
    source: 'intervention',
    target: thought.actual.id,
    label: 'no change',
    type: 'no_intervention',
  });

  // Add counterfactual scenario nodes and edges
  for (let i = 0; i < thought.counterfactuals.length; i++) {
    const scenario = thought.counterfactuals[i];

    addNode(graph, {
      id: scenario.id,
      label: includeLabels ? `CF: ${scenario.name}` : scenario.id,
      type: 'counterfactual',
      metadata: {
        name: scenario.name,
        description: scenario.description,
        likelihood: scenario.likelihood,
        outcomes: scenario.outcomes?.map(o => ({
          description: o.description,
          impact: o.impact,
        })),
      },
    });

    addEdge(graph, {
      id: `e_intervention_cf${i}`,
      source: 'intervention',
      target: scenario.id,
      label: 'intervene',
      type: 'intervention',
      metadata: includeMetrics && scenario.likelihood !== undefined
        ? { likelihood: scenario.likelihood }
        : undefined,
    });
  }

  // Add metrics
  if (includeMetrics) {
    addMetric(graph, 'counterfactualCount', thought.counterfactuals.length);
    addMetric(graph, 'feasibility', thought.interventionPoint.feasibility);
    addMetric(graph, 'expectedImpact', thought.interventionPoint.expectedImpact);
  }

  return serializeGraph(graph);
}

/**
 * Export counterfactual scenarios to Markdown format
 */
function counterfactualToMarkdown(thought: CounterfactualThought, options: VisualExportOptions): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
    includeMetrics = true,
  } = options;

  const parts: string[] = [];

  // Metrics
  if (includeMetrics) {
    parts.push(section('Metrics', keyValueSection({
      'Counterfactual Scenarios': thought.counterfactuals.length,
      'Intervention Feasibility': (thought.interventionPoint.feasibility * 100).toFixed(0) + '%',
      'Expected Impact': (thought.interventionPoint.expectedImpact * 100).toFixed(0) + '%',
    })));
  }

  // Intervention point
  parts.push(section('Intervention Point', keyValueSection({
    'Description': thought.interventionPoint.description,
    'Timing': thought.interventionPoint.timing,
    'Feasibility': (thought.interventionPoint.feasibility * 100).toFixed(0) + '%',
    'Expected Impact': (thought.interventionPoint.expectedImpact * 100).toFixed(0) + '%',
  })));

  // Actual scenario
  parts.push(section('Actual Scenario',
    `**Name:** ${thought.actual.name}\n\n` +
    `**Description:** ${thought.actual.description}`
  ));

  // Counterfactual scenarios
  const cfRows = thought.counterfactuals.map(cf => {
    const primaryOutcome = cf.outcomes[0];
    return [
      cf.name,
      cf.description.substring(0, 50) + (cf.description.length > 50 ? '...' : ''),
      cf.likelihood !== undefined ? cf.likelihood.toFixed(2) : 'N/A',
      primaryOutcome?.impact || '-',
    ];
  });
  parts.push(section('Counterfactual Scenarios', table(
    ['Name', 'Description', 'Likelihood', 'Impact'],
    cfRows
  )));

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaid = counterfactualToMermaid(thought, 'default', true, includeMetrics);
    parts.push(section('Visualization', mermaidBlock(mermaid)));
  }

  return mdDocument('Counterfactual Analysis', parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: { mode: 'counterfactual', scenarios: thought.counterfactuals.length },
  });
}
