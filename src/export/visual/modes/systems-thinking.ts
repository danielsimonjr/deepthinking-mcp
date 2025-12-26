/**
 * Systems Thinking Visual Exporter (v8.5.0)
 * Sprint 8 Task 8.1: Systems thinking causal loop export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 * Phase 9: Added GraphML and TikZ export support
 * Phase 13 Sprint 8: Refactored to use fluent builder classes
 */

import type { SystemsThinkingThought } from '../../../types/index.js';
import type { VisualExportOptions } from '../types.js';
import { sanitizeId } from '../utils.js';
// Builder classes (Phase 13)
import { DOTGraphBuilder } from '../utils/dot.js';
import { MermaidGraphBuilder } from '../utils/mermaid.js';
import { ASCIIDocBuilder } from '../utils/ascii.js';
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
} from '../utils/svg.js';
import {
  generateGraphML,
  type GraphMLNode,
  type GraphMLEdge,
} from '../utils/graphml.js';
import {
  generateTikZ,
  type TikZNode,
  type TikZEdge,
} from '../utils/tikz.js';
import {
  generateHTMLHeader,
  generateHTMLFooter,
  escapeHTML,
  renderMetricCard,
  renderSection,
  renderTable,
  renderBadge,
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
  addLegendItem,
  serializeGraph,
} from '../utils/json.js';
import {
  section,
  table,
  list,
  keyValueSection,
  mermaidBlock,
  document as mdDocument,
} from '../utils/markdown.js';

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
    case 'graphml':
      return systemsThinkingToGraphML(thought, options);
    case 'tikz':
      return systemsThinkingToTikZ(thought, options);
    case 'html':
      return systemsThinkingToHTML(thought, options);
    case 'modelica':
      return systemsThinkingToModelica(thought, options);
    case 'uml':
      return systemsThinkingToUML(thought, options);
    case 'json':
      return systemsThinkingToJSON(thought, options);
    case 'markdown':
      return systemsThinkingToMarkdown(thought, options);
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
  const scheme = colorScheme as 'default' | 'pastel' | 'monochrome';
  const builder = new MermaidGraphBuilder().setDirection('TB');

  // Add system node if present
  if (thought.system) {
    builder.addNode({ id: 'System', label: thought.system.name, shape: 'rectangle' });
  }

  // Add component nodes
  if (thought.components && thought.components.length > 0) {
    for (const component of thought.components) {
      const compId = sanitizeId(component.id);
      const label = includeLabels ? component.name : compId;
      const shape = component.type === 'stock' ? 'subroutine' : 'rectangle';
      builder.addNode({ id: compId, label, shape });
    }
  }

  // Add feedback loop edges
  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    for (const loop of thought.feedbackLoops) {
      const loopComponents = loop.components;

      for (let i = 0; i < loopComponents.length; i++) {
        const fromId = sanitizeId(loopComponents[i]);
        const toId = sanitizeId(loopComponents[(i + 1) % loopComponents.length]);

        const edgeLabel = includeMetrics
          ? `${loop.type} (${loop.strength.toFixed(2)})`
          : loop.type;

        const edgeStyle = loop.type === 'reinforcing' ? 'arrow' : 'dotted';
        builder.addEdge({ source: fromId, target: toId, label: edgeLabel, style: edgeStyle });
      }
    }
  }

  return builder.setOptions({ colorScheme: scheme }).render();
}

function systemsThinkingToDOT(
  thought: SystemsThinkingThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  const builder = new DOTGraphBuilder()
    .setGraphName('SystemsThinking')
    .setRankDir('TB')
    .setNodeDefaults({ shape: 'box', style: 'rounded' });

  // Add component nodes
  if (thought.components && thought.components.length > 0) {
    for (const component of thought.components) {
      const compId = sanitizeId(component.id);
      const label = includeLabels ? component.name : compId;
      const shape = component.type === 'stock' ? 'box' : 'ellipse';
      builder.addNode({ id: compId, label, shape });
    }
  }

  // Add feedback loop edges
  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    for (const loop of thought.feedbackLoops) {
      const loopComponents = loop.components;

      for (let i = 0; i < loopComponents.length; i++) {
        const fromId = sanitizeId(loopComponents[i]);
        const toId = sanitizeId(loopComponents[(i + 1) % loopComponents.length]);

        const edgeLabel = includeMetrics
          ? `${loop.type} (${loop.strength.toFixed(2)})`
          : loop.type;

        const edgeStyle = loop.type === 'reinforcing' ? 'solid' : 'dashed';
        builder.addEdge({ source: fromId, target: toId, label: edgeLabel, style: edgeStyle });
      }
    }
  }

  return builder.render();
}

function systemsThinkingToASCII(thought: SystemsThinkingThought): string {
  const builder = new ASCIIDocBuilder()
    .setMaxWidth(60)
    .addHeader('Systems Thinking Model');

  // System overview
  if (thought.system) {
    builder.addSection('System')
      .addText(`${thought.system.name}\n${thought.system.description}\n`)
      .addEmptyLine();
  }

  // Components
  if (thought.components && thought.components.length > 0) {
    builder.addSection('Components');
    for (const component of thought.components) {
      const typeIcon = component.type === 'stock' ? '[■]' : '(○)';
      builder.addText(`${typeIcon} ${component.name}: ${component.description}\n`);
    }
    builder.addEmptyLine();
  }

  // Feedback loops
  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    builder.addSection('Feedback Loops');
    for (const loop of thought.feedbackLoops) {
      const loopIcon = loop.type === 'reinforcing' ? '⊕' : '⊖';
      builder.addText(`${loopIcon} ${loop.name} (${loop.type})\n`);
      builder.addText(`  Strength: ${loop.strength.toFixed(2)}\n`);
      builder.addText(`  Components: ${loop.components.join(' → ')}\n`);
    }
    builder.addEmptyLine();
  }

  // Leverage points
  if (thought.leveragePoints && thought.leveragePoints.length > 0) {
    builder.addSection('Leverage Points');
    for (const point of thought.leveragePoints) {
      builder.addText(`★ ${point.location} (effectiveness: ${point.effectiveness.toFixed(2)})\n`);
      builder.addText(`  ${point.description}\n`);
    }
  }

  return builder.render();
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

/**
 * Export systems thinking causal loop diagram to GraphML format
 */
function systemsThinkingToGraphML(thought: SystemsThinkingThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  const nodes: GraphMLNode[] = [];
  const edges: GraphMLEdge[] = [];

  // Create nodes for system components
  if (thought.components && thought.components.length > 0) {
    for (const component of thought.components) {
      nodes.push({
        id: sanitizeId(component.id),
        label: component.name,
        type: component.type,
        metadata: {
          description: component.description,
          unit: component.unit,
          initialValue: component.initialValue,
        },
      });
    }
  }

  // Create edges for feedback loops
  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    let edgeCount = 0;
    for (const loop of thought.feedbackLoops) {
      const loopComponents = loop.components;

      for (let i = 0; i < loopComponents.length; i++) {
        const fromId = sanitizeId(loopComponents[i]);
        const toId = sanitizeId(loopComponents[(i + 1) % loopComponents.length]);

        const label = includeLabels && includeMetrics
          ? `${loop.type} (${loop.strength.toFixed(2)})`
          : includeLabels
            ? loop.type
            : undefined;

        edges.push({
          id: `e${edgeCount++}`,
          source: fromId,
          target: toId,
          label,
          directed: true,
          metadata: {
            type: loop.type,
            weight: loop.strength,
            polarity: loop.polarity,
            loopName: loop.name,
          },
        });
      }
    }
  }

  return generateGraphML(nodes, edges, {
    graphName: 'Systems Thinking Causal Loops',
    directed: true,
    includeLabels,
    includeMetadata: includeMetrics,
  });
}

/**
 * Export systems thinking causal loop diagram to TikZ format
 */
function systemsThinkingToTikZ(thought: SystemsThinkingThought, options: VisualExportOptions): string {
  const { colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  const nodes: TikZNode[] = [];
  const edges: TikZEdge[] = [];

  // Create TikZ nodes for system components
  if (thought.components && thought.components.length > 0) {
    const numComponents = thought.components.length;
    const radius = 4; // Radius of circular layout

    thought.components.forEach((component, index) => {
      const angle = (2 * Math.PI * index) / numComponents;
      const x = 4 + radius * Math.cos(angle - Math.PI / 2);
      const y = -2 + radius * Math.sin(angle - Math.PI / 2);

      nodes.push({
        id: sanitizeId(component.id),
        label: component.name,
        x,
        y,
        type: component.type === 'stock' ? 'primary' : 'secondary',
        shape: component.type === 'stock' ? 'rectangle' : 'ellipse',
      });
    });
  }

  // Create TikZ edges for feedback loops with curved/bent edges
  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    for (const loop of thought.feedbackLoops) {
      const loopComponents = loop.components;

      for (let i = 0; i < loopComponents.length; i++) {
        const fromId = sanitizeId(loopComponents[i]);
        const toId = sanitizeId(loopComponents[(i + 1) % loopComponents.length]);

        const label = includeLabels && includeMetrics
          ? `${loop.type[0].toUpperCase()} (${loop.strength.toFixed(2)})`
          : includeLabels
            ? loop.type[0].toUpperCase()
            : undefined;

        // Mark reinforcing vs balancing loops differently
        const style = loop.type === 'reinforcing' ? 'solid' : 'dashed';
        // Use curved edges for feedback loops
        const bend = loop.type === 'reinforcing' ? 'left' : 'right';

        edges.push({
          source: fromId,
          target: toId,
          label,
          style,
          directed: true,
          bend,
        });
      }
    }
  }

  return generateTikZ(nodes, edges, {
    title: 'Systems Thinking Causal Loops',
    colorScheme,
    includeLabels,
    includeMetrics,
  });
}

/**
 * Export systems thinking causal loop diagram to HTML format
 */
function systemsThinkingToHTML(thought: SystemsThinkingThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Systems Thinking Analysis',
    htmlTheme = 'light',
    includeMetrics = true,
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // System Overview
  if (thought.system) {
    const systemContent = `
      <p><strong>Name:</strong> ${escapeHTML(thought.system.name)}</p>
      <p>${escapeHTML(thought.system.description)}</p>
    `;
    html += renderSection('System Overview', systemContent, '🔍');
  }

  // Metrics
  if (includeMetrics) {
    html += '<div class="metrics-grid">\n';
    html += renderMetricCard('Components', thought.components?.length || 0, 'primary');
    html += renderMetricCard('Feedback Loops', thought.feedbackLoops?.length || 0, 'info');
    html += renderMetricCard('Leverage Points', thought.leveragePoints?.length || 0, 'success');
    html += '</div>\n';
  }

  // Components Table
  if (thought.components && thought.components.length > 0) {
    const componentRows = thought.components.map(c => [
      c.name,
      c.type,
      c.description,
      c.unit || 'N/A',
      c.initialValue !== undefined ? String(c.initialValue) : 'N/A',
    ]);
    const componentsTable = renderTable(
      ['Name', 'Type', 'Description', 'Unit', 'Initial Value'],
      componentRows,
      { caption: 'System Components' }
    );
    html += renderSection('Components', componentsTable, '🔧');
  }

  // Feedback Loops
  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    let loopsContent = '';
    for (const loop of thought.feedbackLoops) {
      const loopType = loop.type === 'reinforcing' ? 'success' : 'warning';
      const badge = renderBadge(loop.type.toUpperCase(), loopType as any);
      loopsContent += `
        <div class="card">
          <div class="card-header">${escapeHTML(loop.name)} ${badge}</div>
          <p><strong>Polarity:</strong> ${escapeHTML(loop.polarity)}</p>
          <p><strong>Strength:</strong> ${loop.strength.toFixed(2)}</p>
          <p><strong>Components:</strong> ${loop.components.map(c => escapeHTML(c)).join(' → ')}</p>
          ${loop.description ? `<p>${escapeHTML(loop.description)}</p>` : ''}
        </div>
      `;
    }
    html += renderSection('Feedback Loops', loopsContent, '🔄');
  }

  // Leverage Points
  if (thought.leveragePoints && thought.leveragePoints.length > 0) {
    const leverageRows = thought.leveragePoints.map(lp => [
      lp.location,
      lp.effectiveness.toFixed(2),
      lp.description,
    ]);
    const leverageTable = renderTable(
      ['Location', 'Effectiveness', 'Description'],
      leverageRows,
      { caption: 'Leverage Points' }
    );
    html += renderSection('Leverage Points', leverageTable, '⭐');
  }

  html += generateHTMLFooter(htmlStandalone);
  return html;
}

/**
 * Export systems thinking causal loop diagram to Modelica format
 */
function systemsThinkingToModelica(thought: SystemsThinkingThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;
  const systemName = thought.system ? sanitizeModelicaId(thought.system.name) : 'SystemsThinking';

  let modelica = `package ${systemName}\n`;
  modelica += `  "${thought.system?.description || 'Systems thinking model with feedback loops'}"\n\n`;

  // Create individual component models (stocks and flows)
  if (thought.components && thought.components.length > 0) {
    modelica += '  // System Components\n';

    for (const component of thought.components) {
      const compName = sanitizeModelicaId(component.name);
      const unit = component.unit ? escapeModelicaString(component.unit) : '';
      const initialValue = component.initialValue !== undefined ? component.initialValue : 0;

      if (component.type === 'stock') {
        // Stocks are state variables that accumulate
        modelica += `  model ${compName}\n`;
        modelica += `    "${escapeModelicaString(component.description)}"\n`;
        modelica += `    parameter Real initial_value = ${initialValue}${unit ? ` "${unit}"` : ''};\n`;
        modelica += `    Real value(start=initial_value)${unit ? `(unit="${unit}")` : ''};\n`;
        modelica += `    input Real inflow${unit ? `(unit="${unit}/s")` : ''};\n`;
        modelica += `    input Real outflow${unit ? `(unit="${unit}/s")` : ''};\n`;
        modelica += '  equation\n';
        modelica += '    der(value) = inflow - outflow;\n';
        modelica += '  end ' + compName + ';\n\n';
      } else {
        // Flows are rate variables
        modelica += `  model ${compName}\n`;
        modelica += `    "${escapeModelicaString(component.description)}"\n`;
        modelica += `    output Real flow_rate${unit ? `(unit="${unit}/s")` : ''};\n`;
        modelica += `    input Real source_value${unit ? `(unit="${unit}")` : ''};\n`;
        modelica += `    input Real sink_value${unit ? `(unit="${unit}")` : ''};\n`;
        modelica += `    parameter Real coefficient = 1.0;\n`;
        modelica += '  equation\n';
        modelica += '    flow_rate = coefficient * (source_value - sink_value);\n';
        modelica += '  end ' + compName + ';\n\n';
      }
    }
  }

  // Create feedback loop models
  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    modelica += '  // Feedback Loop Models\n';

    for (const loop of thought.feedbackLoops) {
      const loopName = sanitizeModelicaId(loop.name);
      const loopType = loop.type === 'reinforcing' ? 'Reinforcing' : 'Balancing';

      modelica += `  model ${loopName}\n`;
      modelica += `    "${loopType} feedback loop: ${escapeModelicaString(loop.description || loop.name)}"\n`;
      if (includeMetrics) {
        modelica += `    // Strength: ${loop.strength.toFixed(3)}\n`;
        modelica += `    // Polarity: ${loop.polarity}\n`;
      }
      modelica += `    parameter Real strength = ${loop.strength.toFixed(3)};\n`;
      modelica += `    parameter String loop_type = "${loop.type}";\n`;

      // Add component instances for this loop
      const loopComponents = loop.components.map(c => sanitizeModelicaId(c));
      modelica += `    // Components in loop: ${loopComponents.join(' → ')}\n`;

      // Create connections for the feedback loop
      modelica += '  equation\n';
      modelica += `    // ${loopType} feedback loop dynamics\n`;
      modelica += '    // Loop components interact with strength factor\n';

      modelica += '  end ' + loopName + ';\n\n';
    }
  }

  // Create main system model that integrates components and feedback loops
  modelica += `  model ${systemName}_Complete\n`;
  modelica += `    "${thought.system?.description || 'Complete systems thinking model'}"\n`;

  if (includeMetrics && thought.leveragePoints && thought.leveragePoints.length > 0) {
    modelica += '\n    // Leverage Points:\n';
    for (const lp of thought.leveragePoints) {
      modelica += `    // - ${lp.location} (effectiveness: ${lp.effectiveness.toFixed(2)})\n`;
      modelica += `    //   ${lp.description}\n`;
    }
  }

  modelica += '\n    // Integrate component models and feedback loops here\n';
  modelica += '  end ' + systemName + '_Complete;\n\n';

  modelica += 'end ' + systemName + ';\n';

  return modelica;
}

/**
 * Export systems thinking causal loop diagram to UML format
 */
function systemsThinkingToUML(thought: SystemsThinkingThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  const nodes: UmlNode[] = [];
  const edges: UmlEdge[] = [];

  // Create UML nodes for system components
  if (thought.components && thought.components.length > 0) {
    for (const component of thought.components) {
      const attributes: string[] = [];

      if (component.unit) {
        attributes.push(`unit: ${component.unit}`);
      }
      if (component.initialValue !== undefined) {
        attributes.push(`initialValue: ${component.initialValue}`);
      }
      if (includeMetrics) {
        attributes.push(`type: ${component.type}`);
      }

      nodes.push({
        id: sanitizeId(component.id),
        label: component.name,
        shape: component.type === 'stock' ? 'class' : 'component',
        stereotype: component.type,
        attributes,
      });
    }
  }

  // Create UML edges for feedback loops
  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    for (const loop of thought.feedbackLoops) {
      const loopComponents = loop.components;

      for (let i = 0; i < loopComponents.length; i++) {
        const fromId = sanitizeId(loopComponents[i]);
        const toId = sanitizeId(loopComponents[(i + 1) % loopComponents.length]);

        const label = includeLabels && includeMetrics
          ? `${loop.type} (${loop.strength.toFixed(2)})`
          : includeLabels
            ? loop.type
            : undefined;

        // Reinforcing loops are associations, balancing loops are dependencies
        const edgeType = loop.type === 'reinforcing' ? 'association' : 'dependency';

        edges.push({
          source: fromId,
          target: toId,
          type: edgeType,
          label,
        });
      }
    }
  }

  return generateUmlDiagram(nodes, edges, {
    title: 'Systems Thinking Causal Loop Diagram',
    diagramType: 'component',
    includeLabels,
    includeMetrics,
  });
}

/**
 * Export systems thinking causal loop diagram to JSON format
 */
function systemsThinkingToJSON(thought: SystemsThinkingThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;

  const graph = createJsonGraph('Systems Thinking Causal Loop Diagram', 'systems-thinking', {
    includeMetrics,
  });

  // Add metadata about the system
  if (thought.system) {
    graph.metadata.systemName = thought.system.name;
    graph.metadata.systemDescription = thought.system.description;
  }

  // Add nodes for system components
  if (thought.components && thought.components.length > 0) {
    for (const component of thought.components) {
      addNode(graph, {
        id: component.id,
        label: component.name,
        type: component.type,
        shape: component.type === 'stock' ? 'rectangle' : 'ellipse',
        metadata: {
          description: component.description,
          unit: component.unit,
          initialValue: component.initialValue,
        },
      });
    }
  }

  // Add edges for feedback loops
  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    let edgeCount = 0;
    for (const loop of thought.feedbackLoops) {
      const loopComponents = loop.components;

      for (let i = 0; i < loopComponents.length; i++) {
        const fromId = loopComponents[i];
        const toId = loopComponents[(i + 1) % loopComponents.length];

        addEdge(graph, {
          id: `edge_${edgeCount++}`,
          source: fromId,
          target: toId,
          label: `${loop.type} (${loop.strength.toFixed(2)})`,
          type: loop.type,
          weight: loop.strength,
          style: loop.type === 'reinforcing' ? 'solid' : 'dashed',
          directed: true,
          metadata: {
            loopName: loop.name,
            polarity: loop.polarity,
            description: loop.description,
          },
        });
      }
    }
  }

  // Add metrics
  if (includeMetrics) {
    addMetric(graph, 'components', thought.components?.length || 0);
    addMetric(graph, 'feedbackLoops', thought.feedbackLoops?.length || 0);
    addMetric(graph, 'leveragePoints', thought.leveragePoints?.length || 0);

    // Calculate average loop strength
    if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
      const avgStrength = thought.feedbackLoops.reduce((sum, loop) => sum + loop.strength, 0) / thought.feedbackLoops.length;
      addMetric(graph, 'averageLoopStrength', parseFloat(avgStrength.toFixed(3)));
    }

    // Count reinforcing vs balancing loops
    if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
      const reinforcingCount = thought.feedbackLoops.filter(l => l.type === 'reinforcing').length;
      const balancingCount = thought.feedbackLoops.filter(l => l.type === 'balancing').length;
      addMetric(graph, 'reinforcingLoops', reinforcingCount);
      addMetric(graph, 'balancingLoops', balancingCount);
    }
  }

  // Add legend items
  addLegendItem(graph, 'stock', '#a8d5ff');
  addLegendItem(graph, 'flow', '#ffd699');
  addLegendItem(graph, 'reinforcing', '#90ee90', 'solid');
  addLegendItem(graph, 'balancing', '#ffb3ba', 'dashed');

  // Add leverage points to metadata
  if (thought.leveragePoints && thought.leveragePoints.length > 0) {
    graph.metadata.leveragePoints = thought.leveragePoints.map(lp => ({
      location: lp.location,
      effectiveness: lp.effectiveness,
      description: lp.description,
    }));
  }

  return serializeGraph(graph);
}

/**
 * Export systems thinking causal loop diagram to Markdown format
 */
function systemsThinkingToMarkdown(thought: SystemsThinkingThought, options: VisualExportOptions): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
    includeMetrics = true,
  } = options;

  const parts: string[] = [];

  // System Overview
  if (thought.system) {
    const systemContent = keyValueSection({
      'Name': thought.system.name,
      'Description': thought.system.description,
    });
    parts.push(section('System Overview', systemContent));
  }

  // Metrics
  if (includeMetrics) {
    const metricsContent = keyValueSection({
      'Components': thought.components?.length || 0,
      'Feedback Loops': thought.feedbackLoops?.length || 0,
      'Leverage Points': thought.leveragePoints?.length || 0,
    });
    parts.push(section('Metrics', metricsContent));
  }

  // Components
  if (thought.components && thought.components.length > 0) {
    const componentRows = thought.components.map(c => [
      c.name,
      c.type,
      c.description,
      c.unit || 'N/A',
      c.initialValue !== undefined ? String(c.initialValue) : 'N/A',
    ]);
    const componentsTable = table(
      ['Name', 'Type', 'Description', 'Unit', 'Initial Value'],
      componentRows
    );
    parts.push(section('Components', componentsTable));
  }

  // Feedback Loops
  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    const loopItems = thought.feedbackLoops.map(loop =>
      `**${loop.name}** (${loop.type})\n  - Strength: ${loop.strength.toFixed(2)}\n  - Polarity: ${loop.polarity}\n  - Components: ${loop.components.join(' → ')}`
    );
    parts.push(section('Feedback Loops', list(loopItems)));
  }

  // Leverage Points
  if (thought.leveragePoints && thought.leveragePoints.length > 0) {
    const leverageRows = thought.leveragePoints.map(lp => [
      lp.location,
      lp.effectiveness.toFixed(2),
      lp.description,
    ]);
    const leverageTable = table(
      ['Location', 'Effectiveness', 'Description'],
      leverageRows
    );
    parts.push(section('Leverage Points', leverageTable));
  }

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaidDiagram = systemsThinkingToMermaid(thought, 'default', true, true);
    parts.push(section('Causal Loop Diagram', mermaidBlock(mermaidDiagram)));
  }

  return mdDocument('Systems Thinking Analysis', parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: { mode: 'systems-thinking' },
  });
}
