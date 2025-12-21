/**
 * Analogical Visual Exporter (v7.0.3)
 * Sprint 8 Task 8.1: Analogical domain mapping export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 * Phase 9: Added GraphML and TikZ export support
 */

import type { AnalogicalThought } from '../../../types/index.js';
import type { VisualExportOptions } from '../types.js';
import { sanitizeId } from '../utils.js';
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
} from '../utils/svg.js';
import {
  generateGraphML,
  type GraphMLNode,
  type GraphMLEdge,
  type GraphMLOptions,
} from '../utils/graphml.js';
import {
  generateTikZ,
  getTikZColor,
  renderTikZMetrics,
  renderTikZLegend,
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
  renderProgressBar,
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
  list,
  keyValueSection,
  mermaidBlock,
  document as mdDocument,
} from '../utils/markdown.js';

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
    case 'graphml':
      return analogicalToGraphML(thought, options);
    case 'tikz':
      return analogicalToTikZ(thought, options);
    case 'html':
      return analogicalToHTML(thought, options);
    case 'modelica':
      return analogicalToModelica(thought, options);
    case 'uml':
      return analogicalToUML(thought, options);
    case 'json':
      return analogicalToJSON(thought, options);
    case 'markdown':
      return analogicalToMarkdown(thought, options);
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

/**
 * Export analogical domain mapping to GraphML format
 */
function analogicalToGraphML(thought: AnalogicalThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;

  // Create nodes for source domain entities
  const nodes: GraphMLNode[] = [];
  for (const entity of thought.sourceDomain.entities) {
    nodes.push({
      id: 'src_' + entity.id,
      label: entity.name,
      type: 'source',
      metadata: {
        description: entity.description,
        domain: thought.sourceDomain.name,
      },
    });
  }

  // Create nodes for target domain entities
  for (const entity of thought.targetDomain.entities) {
    nodes.push({
      id: 'tgt_' + entity.id,
      label: entity.name,
      type: 'target',
      metadata: {
        description: entity.description,
        domain: thought.targetDomain.name,
      },
    });
  }

  // Create edges for mappings
  const edges: GraphMLEdge[] = thought.mapping.map((mapping, index) => {
    const edge: GraphMLEdge = {
      id: `mapping_${index}`,
      source: 'src_' + mapping.sourceEntityId,
      target: 'tgt_' + mapping.targetEntityId,
    };

    if (includeMetrics) {
      edge.metadata = {
        weight: mapping.confidence,
        type: 'mapping',
      };
      edge.label = mapping.confidence.toFixed(2);
    }

    return edge;
  });

  const graphmlOptions: GraphMLOptions = {
    graphName: 'Analogical Mapping',
  };

  return generateGraphML(nodes, edges, graphmlOptions);
}

/**
 * Export analogical domain mapping to TikZ format
 */
function analogicalToTikZ(thought: AnalogicalThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true, colorScheme = 'default' } = options;

  const nodes: TikZNode[] = [];

  // Source domain entities on the left (x = -3)
  thought.sourceDomain.entities.forEach((entity, index) => {
    nodes.push({
      id: 'src_' + entity.id,
      x: -3,
      y: -index * 1.5,
      label: includeLabels ? entity.name : entity.id,
      shape: 'rectangle',
      type: 'tertiary',
    });
  });

  // Target domain entities on the right (x = 3)
  thought.targetDomain.entities.forEach((entity, index) => {
    nodes.push({
      id: 'tgt_' + entity.id,
      x: 3,
      y: -index * 1.5,
      label: includeLabels ? entity.name : entity.id,
      shape: 'rectangle',
      type: 'primary',
    });
  });

  // Create dashed edges for mappings
  const edges: TikZEdge[] = thought.mapping.map(mapping => {
    const edge: TikZEdge = {
      source: 'src_' + mapping.sourceEntityId,
      target: 'tgt_' + mapping.targetEntityId,
      style: 'dashed',
    };

    if (includeMetrics) {
      edge.label = mapping.confidence.toFixed(2);
    }

    return edge;
  });

  const tikzOptions: TikZOptions = {
    title: 'Analogical Mapping',
    colorScheme,
    includeLabels,
    includeMetrics,
  };

  let tikz = generateTikZ(nodes, edges, tikzOptions);

  // Add metrics panel if requested
  if (includeMetrics) {
    const metrics = [
      { label: 'Analogy Strength', value: thought.analogyStrength.toFixed(2) },
      { label: 'Mappings', value: thought.mapping.length.toString() },
      { label: 'Source Entities', value: thought.sourceDomain.entities.length.toString() },
      { label: 'Target Entities', value: thought.targetDomain.entities.length.toString() },
    ];
    tikz = tikz.replace(
      /\\end\{tikzpicture\}/,
      renderTikZMetrics(6, -6, metrics) + '\n\\end{tikzpicture}'
    );
  }

  // Add legend
  const sourceColors = getTikZColor('tertiary', colorScheme);
  const targetColors = getTikZColor('primary', colorScheme);
  const legendItems = [
    { label: 'Source Domain', color: sourceColors },
    { label: 'Target Domain', color: targetColors },
  ];
  tikz = tikz.replace(
    /\\end\{tikzpicture\}/,
    renderTikZLegend(-3, -6, legendItems) + '\n\\end{tikzpicture}'
  );

  return tikz;
}

/**
 * Export analogical mapping to HTML format
 */
function analogicalToHTML(thought: AnalogicalThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Analogical Reasoning Analysis',
    htmlTheme = 'light',
    includeMetrics = true,
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // Metrics
  if (includeMetrics) {
    html += '<div class="metrics-grid">';
    html += renderMetricCard('Analogy Strength', (thought.analogyStrength * 100).toFixed(0) + '%', 'primary');
    html += renderMetricCard('Mappings', thought.mapping.length, 'info');
    html += renderMetricCard('Source Entities', thought.sourceDomain.entities.length, 'success');
    html += renderMetricCard('Target Entities', thought.targetDomain.entities.length, 'warning');
    html += '</div>\n';
    html += renderProgressBar(thought.analogyStrength * 100, 'primary');
  }

  // Source domain
  const srcRows = thought.sourceDomain.entities.map(e => [e.id, e.name, e.type || '-', e.description || '-']);
  html += renderSection('Source Domain: ' + thought.sourceDomain.name, renderTable(
    ['ID', 'Name', 'Type', 'Description'],
    srcRows
  ), '📘');

  // Target domain
  const tgtRows = thought.targetDomain.entities.map(e => [e.id, e.name, e.type || '-', e.description || '-']);
  html += renderSection('Target Domain: ' + thought.targetDomain.name, renderTable(
    ['ID', 'Name', 'Type', 'Description'],
    tgtRows
  ), '📗');

  // Mappings
  const mapRows = thought.mapping.map(m => [
    m.sourceEntityId,
    '→',
    m.targetEntityId,
    (m.confidence * 100).toFixed(0) + '%',
    m.justification || '-',
  ]);
  html += renderSection('Entity Mappings', renderTable(
    ['Source', '', 'Target', 'Confidence', 'Justification'],
    mapRows
  ), '🔗');

  // Inferences
  if (thought.inferences && thought.inferences.length > 0) {
    const infRows = thought.inferences.map((inf, i) => [
      (i + 1).toString(),
      inf.sourcePattern,
      inf.targetPrediction,
      (inf.confidence * 100).toFixed(0) + '%',
    ]);
    html += renderSection('Inferences', renderTable(
      ['#', 'Source Pattern', 'Target Prediction', 'Confidence'],
      infRows
    ), '💡');
  }

  html += generateHTMLFooter(htmlStandalone);
  return html;
}

/**
 * Export analogical mapping to Modelica format
 */
function analogicalToModelica(thought: AnalogicalThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;

  const pkgName = sanitizeModelicaId('AnalogicalMapping');
  const sourceName = thought.sourceDomain.name || 'Source';
  const targetName = thought.targetDomain.name || 'Target';
  let modelica = `package ${pkgName}\n`;
  modelica += `  "${escapeModelicaString('Analogical domain mapping: ' + sourceName + ' → ' + targetName)}"\n\n`;

  // Source domain record
  modelica += `  record SourceDomain "${escapeModelicaString(sourceName)}"\n`;
  modelica += `    String name = "${escapeModelicaString(sourceName)}";\n`;
  modelica += `    String description = "${escapeModelicaString(thought.sourceDomain.description || '')}";\n`;

  // Add source entities as parameters
  thought.sourceDomain.entities.forEach(entity => {
    const entityId = sanitizeModelicaId(entity.id);
    modelica += `    parameter String entity_${entityId} = "${entity.name ? escapeModelicaString(entity.name) : ''}";\n`;
    if (entity.description) {
      modelica += `    parameter String entity_${entityId}_desc = "${escapeModelicaString(entity.description)}";\n`;
    }
  });
  modelica += `  end SourceDomain;\n\n`;

  // Target domain record
  modelica += `  record TargetDomain "${escapeModelicaString(targetName)}"\n`;
  modelica += `    String name = "${escapeModelicaString(targetName)}";\n`;
  modelica += `    String description = "${escapeModelicaString(thought.targetDomain.description || '')}";\n`;

  // Add target entities as parameters
  thought.targetDomain.entities.forEach(entity => {
    const entityId = sanitizeModelicaId(entity.id);
    modelica += `    parameter String entity_${entityId} = "${entity.name ? escapeModelicaString(entity.name) : ''}";\n`;
    if (entity.description) {
      modelica += `    parameter String entity_${entityId}_desc = "${escapeModelicaString(entity.description)}";\n`;
    }
  });
  modelica += `  end TargetDomain;\n\n`;

  // Mapping record
  modelica += `  record Mapping "Entity mapping with confidence"\n`;
  thought.mapping.forEach((mapping, index) => {
    const srcId = sanitizeModelicaId(mapping.sourceEntityId);
    const tgtId = sanitizeModelicaId(mapping.targetEntityId);
    modelica += `    parameter String map_${index}_source = "${escapeModelicaString(srcId)}";\n`;
    modelica += `    parameter String map_${index}_target = "${escapeModelicaString(tgtId)}";\n`;
    modelica += `    parameter Real map_${index}_confidence = ${mapping.confidence.toFixed(3)};\n`;
    if (mapping.justification) {
      modelica += `    parameter String map_${index}_justification = "${escapeModelicaString(mapping.justification)}";\n`;
    }
  });
  modelica += `  end Mapping;\n\n`;

  // Metrics if requested
  if (includeMetrics) {
    modelica += `  record Metrics "Analogy metrics"\n`;
    modelica += `    parameter Real analogyStrength = ${thought.analogyStrength.toFixed(3)};\n`;
    modelica += `    parameter Integer mappingCount = ${thought.mapping.length};\n`;
    modelica += `    parameter Integer sourceEntityCount = ${thought.sourceDomain.entities.length};\n`;
    modelica += `    parameter Integer targetEntityCount = ${thought.targetDomain.entities.length};\n`;
    modelica += `  end Metrics;\n\n`;
  }

  // Main model connecting domains
  modelica += `  model AnalogicalSystem "Complete analogical mapping system"\n`;
  modelica += `    SourceDomain source;\n`;
  modelica += `    TargetDomain target;\n`;
  modelica += `    Mapping mappings;\n`;
  if (includeMetrics) {
    modelica += `    Metrics metrics;\n`;
  }
  modelica += `  end AnalogicalSystem;\n\n`;

  modelica += `  annotation(Documentation(info="<html>\n`;
  modelica += `    <p>Analogical mapping between ${escapeModelicaString(thought.sourceDomain.name)} and ${escapeModelicaString(thought.targetDomain.name)}</p>\n`;
  modelica += `    <p>Analogy strength: ${(thought.analogyStrength * 100).toFixed(1)}%</p>\n`;
  modelica += `  </html>"));\n`;
  modelica += `end ${pkgName};\n`;

  return modelica;
}

/**
 * Export analogical mapping to UML format
 */
function analogicalToUML(thought: AnalogicalThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  const nodes: UmlNode[] = [];
  const edges: UmlEdge[] = [];

  // Create package for source domain
  nodes.push({
    id: 'source_domain',
    label: thought.sourceDomain.name,
    shape: 'package',
    stereotype: 'source',
  });

  // Create entities for source domain
  thought.sourceDomain.entities.forEach(entity => {
    const nodeId = 'src_' + entity.id;
    nodes.push({
      id: nodeId,
      label: includeLabels ? entity.name : entity.id,
      shape: 'rectangle',
      color: 'FFE0B2',
      attributes: entity.description ? [entity.description] : [],
    });
  });

  // Create package for target domain
  nodes.push({
    id: 'target_domain',
    label: thought.targetDomain.name,
    shape: 'package',
    stereotype: 'target',
  });

  // Create entities for target domain
  thought.targetDomain.entities.forEach(entity => {
    const nodeId = 'tgt_' + entity.id;
    nodes.push({
      id: nodeId,
      label: includeLabels ? entity.name : entity.id,
      shape: 'rectangle',
      color: 'B3E5FC',
      attributes: entity.description ? [entity.description] : [],
    });
  });

  // Create dependency relationships for mappings
  thought.mapping.forEach(mapping => {
    const srcId = 'src_' + mapping.sourceEntityId;
    const tgtId = 'tgt_' + mapping.targetEntityId;

    edges.push({
      source: srcId,
      target: tgtId,
      type: 'dependency',
      label: includeMetrics ? `${mapping.confidence.toFixed(2)}` : undefined,
    });
  });

  // Add metrics info if requested
  if (includeMetrics) {
    nodes.push({
      id: 'metrics_info',
      label: `Metrics\nAnalogy Strength: ${(thought.analogyStrength * 100).toFixed(1)}%\nMappings: ${thought.mapping.length}`,
      shape: 'rectangle',
      color: 'E8EAF6',
    });
  }

  return generateUmlDiagram(nodes, edges, {
    title: 'Analogical Domain Mapping',
    diagramType: 'component',
  });
}

/**
 * Export analogical mapping to JSON format
 */
function analogicalToJSON(thought: AnalogicalThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;

  // Create graph
  const graph = createJsonGraph('Analogical Domain Mapping', 'analogical');

  // Add additional metadata
  graph.metadata.sourceDomainName = thought.sourceDomain.name;
  graph.metadata.sourceDomainDescription = thought.sourceDomain.description;
  graph.metadata.targetDomainName = thought.targetDomain.name;
  graph.metadata.targetDomainDescription = thought.targetDomain.description;

  // Add source domain entities as nodes
  thought.sourceDomain.entities.forEach(entity => {
    addNode(graph, {
      id: 'src_' + entity.id,
      label: entity.name,
      type: 'source_entity',
      metadata: {
        originalId: entity.id,
        description: entity.description,
        entityType: entity.type,
        domain: 'source',
      },
    });
  });

  // Add target domain entities as nodes
  thought.targetDomain.entities.forEach(entity => {
    addNode(graph, {
      id: 'tgt_' + entity.id,
      label: entity.name,
      type: 'target_entity',
      metadata: {
        originalId: entity.id,
        description: entity.description,
        entityType: entity.type,
        domain: 'target',
      },
    });
  });

  // Add mappings as edges
  thought.mapping.forEach((mapping, index) => {
    addEdge(graph, {
      id: `mapping_${index}`,
      source: 'src_' + mapping.sourceEntityId,
      target: 'tgt_' + mapping.targetEntityId,
      label: `confidence: ${mapping.confidence.toFixed(2)}`,
      type: 'mapping',
      metadata: {
        confidence: mapping.confidence,
        justification: mapping.justification,
      },
    });
  });

  // Add metrics
  if (includeMetrics) {
    addMetric(graph, 'analogyStrength', thought.analogyStrength);
    addMetric(graph, 'mappingCount', thought.mapping.length);
    addMetric(graph, 'sourceEntityCount', thought.sourceDomain.entities.length);
    addMetric(graph, 'targetEntityCount', thought.targetDomain.entities.length);

    // Add average mapping confidence
    if (thought.mapping.length > 0) {
      const avgConfidence = thought.mapping.reduce((sum, m) => sum + m.confidence, 0) / thought.mapping.length;
      addMetric(graph, 'averageMappingConfidence', avgConfidence);
    }
  }

  // Add inferences if present
  if (thought.inferences && thought.inferences.length > 0) {
    graph.metadata.inferences = thought.inferences.map(inf => ({
      sourcePattern: inf.sourcePattern,
      targetPrediction: inf.targetPrediction,
      confidence: inf.confidence,
    }));
    if (includeMetrics) {
      addMetric(graph, 'inferenceCount', thought.inferences.length);
    }
  }

  return serializeGraph(graph);
}

/**
 * Export analogical mapping to Markdown format
 */
function analogicalToMarkdown(thought: AnalogicalThought, options: VisualExportOptions): string {
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
      'Analogy Strength': (thought.analogyStrength * 100).toFixed(0) + '%',
      'Mappings': thought.mapping.length,
      'Source Entities': thought.sourceDomain.entities.length,
      'Target Entities': thought.targetDomain.entities.length,
    })));
  }

  // Source domain
  parts.push(section('Source Domain',
    `**Name:** ${thought.sourceDomain.name}\n\n` +
    `**Description:** ${thought.sourceDomain.description || 'N/A'}\n\n` +
    `**Entities:**\n${list(thought.sourceDomain.entities.map(e => `${e.name}: ${e.description || 'N/A'}`))}`
  ));

  // Target domain
  parts.push(section('Target Domain',
    `**Name:** ${thought.targetDomain.name}\n\n` +
    `**Description:** ${thought.targetDomain.description || 'N/A'}\n\n` +
    `**Entities:**\n${list(thought.targetDomain.entities.map(e => `${e.name}: ${e.description || 'N/A'}`))}`
  ));

  // Mappings
  const mapRows = thought.mapping.map(m => [
    m.sourceEntityId,
    '→',
    m.targetEntityId,
    (m.confidence * 100).toFixed(0) + '%',
    m.justification || '-',
  ]);
  parts.push(section('Entity Mappings', table(
    ['Source', '', 'Target', 'Confidence', 'Justification'],
    mapRows
  )));

  // Inferences
  if (thought.inferences && thought.inferences.length > 0) {
    const infRows = thought.inferences.map(inf => [
      inf.sourcePattern,
      inf.targetPrediction,
      (inf.confidence * 100).toFixed(0) + '%',
    ]);
    parts.push(section('Inferences', table(
      ['Source Pattern', 'Target Prediction', 'Confidence'],
      infRows
    )));
  }

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaid = analogicalToMermaid(thought, 'default', true, includeMetrics);
    parts.push(section('Visualization', mermaidBlock(mermaid)));
  }

  return mdDocument('Analogical Reasoning Analysis', parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: {
      mode: 'analogical',
      mappings: thought.mapping.length,
      analogyStrength: thought.analogyStrength.toFixed(2),
    },
  });
}
