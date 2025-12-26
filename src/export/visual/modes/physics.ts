/**
 * Physics Visual Exporter (v8.5.0)
 * Phase 7 Sprint 2: Physics reasoning export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 * Phase 9: Added GraphML and TikZ export support
 * Phase 13 Sprint 5: Refactored to use fluent builder classes
 */

import type { PhysicsThought } from '../../../types/modes/physics.js';
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
  renderTikZMetrics,
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
  serializeGraph,
} from '../utils/json.js';
import {
  section,
  list,
  keyValueSection,
  mermaidBlock,
  document as mdDocument,
  progressBar,
} from '../utils/markdown.js';

/**
 * Export physics reasoning to visual format
 */
export function exportPhysicsVisualization(thought: PhysicsThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default' } = options;

  switch (format) {
    case 'mermaid':
      return physicsToMermaid(thought, colorScheme, options.includeLabels ?? true, options.includeMetrics ?? true);
    case 'dot':
      return physicsToDOT(thought, options.includeLabels ?? true, options.includeMetrics ?? true);
    case 'ascii':
      return physicsToASCII(thought);
    case 'svg':
      return physicsToSVG(thought, options);
    case 'graphml':
      return physicsToGraphML(thought, options);
    case 'tikz':
      return physicsToTikZ(thought, options);
    case 'html':
      return physicsToHTML(thought, options);
    case 'modelica':
      return physicsToModelica(thought, options);
    case 'uml':
      return physicsToUML(thought, options);
    case 'json':
      return physicsToJSON(thought, options);
    case 'markdown':
      return physicsToMarkdown(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function physicsToMermaid(
  thought: PhysicsThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  const scheme = colorScheme as 'default' | 'pastel' | 'monochrome';
  const builder = new MermaidGraphBuilder().setDirection('TB');

  // Main thought type node
  const typeId = sanitizeId(`type_${thought.thoughtType || 'physics'}`);
  const typeLabel = includeLabels ? (thought.thoughtType || 'Physics').replace(/_/g, ' ') : typeId;
  builder.addNode({ id: typeId, label: typeLabel, shape: 'subroutine' });

  // Tensor properties
  if (thought.tensorProperties) {
    const tensorId = sanitizeId('tensor');
    const compId = sanitizeId('components');
    const compLabel = includeLabels
      ? thought.tensorProperties.components.slice(0, 30) + (thought.tensorProperties.components.length > 30 ? '...' : '')
      : 'Components';

    builder
      .addNode({ id: tensorId, label: `Rank (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`, shape: 'stadium' })
      .addNode({ id: compId, label: compLabel, shape: 'rectangle' })
      .addEdge({ source: typeId, target: tensorId })
      .addEdge({ source: tensorId, target: compId });

    if (thought.tensorProperties.symmetries.length > 0) {
      builder.addNode({ id: sanitizeId('symmetries'), label: `Symmetries: ${thought.tensorProperties.symmetries.length}`, shape: 'hexagon' })
        .addEdge({ source: tensorId, target: sanitizeId('symmetries') });
    }
    if (thought.tensorProperties.invariants.length > 0) {
      builder.addNode({ id: sanitizeId('invariants'), label: `Invariants: ${thought.tensorProperties.invariants.length}`, shape: 'hexagon' })
        .addEdge({ source: tensorId, target: sanitizeId('invariants') });
    }
  }

  // Physical interpretation
  if (thought.physicalInterpretation) {
    const interpId = sanitizeId('interpretation');
    const unitsId = sanitizeId('units');

    builder
      .addNode({ id: interpId, label: thought.physicalInterpretation.quantity, shape: 'parallelogram' })
      .addNode({ id: unitsId, label: thought.physicalInterpretation.units, shape: 'stadium' })
      .addEdge({ source: typeId, target: interpId })
      .addEdge({ source: interpId, target: unitsId });

    thought.physicalInterpretation.conservationLaws.forEach((law, index) => {
      const lawId = sanitizeId(`conservation_${index}`);
      const lawLabel = includeLabels ? law.slice(0, 25) + (law.length > 25 ? '...' : '') : `Law ${index + 1}`;
      builder.addNode({ id: lawId, label: lawLabel, shape: 'asymmetric' })
        .addEdge({ source: interpId, target: lawId });
    });
  }

  // Field theory context
  if (thought.fieldTheoryContext) {
    const fieldId = sanitizeId('field_theory');
    const symGroupId = sanitizeId('symmetry_group');

    builder
      .addNode({ id: fieldId, label: 'Field Theory', shape: 'cylinder' })
      .addNode({ id: symGroupId, label: thought.fieldTheoryContext.symmetryGroup, shape: 'hexagon' })
      .addEdge({ source: typeId, target: fieldId })
      .addEdge({ source: fieldId, target: symGroupId });

    thought.fieldTheoryContext.fields.forEach((field, index) => {
      const fId = sanitizeId(`field_${index}`);
      builder.addNode({ id: fId, label: field, shape: 'rectangle' })
        .addEdge({ source: fieldId, target: fId });
    });
  }

  // Metrics
  if (includeMetrics) {
    builder.addNode({ id: sanitizeId('uncertainty'), label: `Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%`, shape: 'hexagon' });
  }

  // Assumptions
  if (thought.assumptions && thought.assumptions.length > 0) {
    builder.addNode({ id: sanitizeId('assumptions'), label: `Assumptions: ${thought.assumptions.length}`, shape: 'asymmetric' });
  }

  return builder.setOptions({ colorScheme: scheme }).render();
}

function physicsToDOT(
  thought: PhysicsThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  const builder = new DOTGraphBuilder()
    .setGraphName('PhysicsVisualization')
    .setRankDir('TB')
    .setNodeDefaults({ shape: 'box', style: 'rounded' });

  // Main thought type node
  const typeId = sanitizeId(`type_${thought.thoughtType || 'physics'}`);
  const typeLabel = includeLabels ? (thought.thoughtType || 'Physics').replace(/_/g, ' ') : typeId;
  builder.addNode({ id: typeId, label: typeLabel, shape: 'doubleoctagon' });

  // Tensor properties
  if (thought.tensorProperties) {
    const tensorId = sanitizeId('tensor');
    const compId = sanitizeId('components');
    const transId = sanitizeId('transformation');
    const compLabel = includeLabels
      ? thought.tensorProperties.components.slice(0, 25).replace(/"/g, '\\"')
      : 'Components';

    builder
      .addNode({ id: tensorId, label: `Rank (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`, shape: 'ellipse' })
      .addNode({ id: compId, label: compLabel })
      .addNode({ id: transId, label: thought.tensorProperties.transformation, shape: 'diamond' })
      .addEdge({ source: typeId, target: tensorId })
      .addEdge({ source: tensorId, target: compId })
      .addEdge({ source: tensorId, target: transId });
  }

  // Physical interpretation
  if (thought.physicalInterpretation) {
    const interpId = sanitizeId('interpretation');
    const unitsId = sanitizeId('units');

    builder
      .addNode({ id: interpId, label: thought.physicalInterpretation.quantity, shape: 'parallelogram' })
      .addNode({ id: unitsId, label: thought.physicalInterpretation.units, shape: 'ellipse' })
      .addEdge({ source: typeId, target: interpId })
      .addEdge({ source: interpId, target: unitsId });

    thought.physicalInterpretation.conservationLaws.forEach((law, index) => {
      const lawId = sanitizeId(`conservation_${index}`);
      const lawLabel = includeLabels ? law.slice(0, 20).replace(/"/g, '\\"') : `Law ${index + 1}`;
      builder.addNode({ id: lawId, label: lawLabel, shape: 'hexagon' })
        .addEdge({ source: interpId, target: lawId });
    });
  }

  // Field theory context
  if (thought.fieldTheoryContext) {
    const fieldId = sanitizeId('field_theory');
    const symGroupId = sanitizeId('symmetry_group');

    builder
      .addNode({ id: fieldId, label: 'Field Theory', shape: 'cylinder' })
      .addNode({ id: symGroupId, label: thought.fieldTheoryContext.symmetryGroup, shape: 'diamond' })
      .addEdge({ source: typeId, target: fieldId })
      .addEdge({ source: fieldId, target: symGroupId });

    thought.fieldTheoryContext.fields.forEach((field, index) => {
      const fId = sanitizeId(`field_${index}`);
      builder.addNode({ id: fId, label: field })
        .addEdge({ source: fieldId, target: fId });
    });
  }

  // Uncertainty metric
  if (includeMetrics) {
    builder.addNode({ id: sanitizeId('uncertainty'), label: `${(thought.uncertainty * 100).toFixed(1)}%`, shape: 'diamond' });
  }

  return builder.render();
}

function physicsToASCII(thought: PhysicsThought): string {
  const builder = new ASCIIDocBuilder()
    .addHeader('Physics Analysis')
    .addText(`Type: ${(thought.thoughtType || 'physics').replace(/_/g, ' ')}\n`)
    .addText(`Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%\n`)
    .addEmptyLine();

  // Tensor properties
  if (thought.tensorProperties) {
    builder.addSection('Tensor Properties')
      .addText(`  Rank: (${thought.tensorProperties.rank[0]}, ${thought.tensorProperties.rank[1]})\n`)
      .addText(`  Components: ${thought.tensorProperties.components}\n`)
      .addText(`  LaTeX: ${thought.tensorProperties.latex}\n`)
      .addText(`  Transformation: ${thought.tensorProperties.transformation}\n`);

    if (thought.tensorProperties.indexStructure) {
      builder.addText(`  Index Structure: ${thought.tensorProperties.indexStructure}\n`);
    }
    if (thought.tensorProperties.coordinateSystem) {
      builder.addText(`  Coordinate System: ${thought.tensorProperties.coordinateSystem}\n`);
    }
    if (thought.tensorProperties.symmetries.length > 0) {
      builder.addText('  Symmetries:\n').addNumberedList(thought.tensorProperties.symmetries, 4);
    }
    if (thought.tensorProperties.invariants.length > 0) {
      builder.addText('  Invariants:\n').addNumberedList(thought.tensorProperties.invariants, 4);
    }
    builder.addEmptyLine();
  }

  // Physical interpretation
  if (thought.physicalInterpretation) {
    builder.addSection('Physical Interpretation')
      .addText(`  Quantity: ${thought.physicalInterpretation.quantity}\n`)
      .addText(`  Units: ${thought.physicalInterpretation.units}\n`);

    if (thought.physicalInterpretation.conservationLaws.length > 0) {
      builder.addText('  Conservation Laws:\n').addNumberedList(thought.physicalInterpretation.conservationLaws, 4);
    }
    if (thought.physicalInterpretation.constraints?.length) {
      builder.addText('  Constraints:\n').addNumberedList(thought.physicalInterpretation.constraints, 4);
    }
    if (thought.physicalInterpretation.observables?.length) {
      builder.addText('  Observables:\n').addNumberedList(thought.physicalInterpretation.observables, 4);
    }
    builder.addEmptyLine();
  }

  // Field theory context
  if (thought.fieldTheoryContext) {
    builder.addSection('Field Theory Context')
      .addText(`  Symmetry Group: ${thought.fieldTheoryContext.symmetryGroup}\n`);

    if (thought.fieldTheoryContext.fields.length > 0) {
      builder.addText('  Fields:\n').addNumberedList(thought.fieldTheoryContext.fields, 4);
    }
    if (thought.fieldTheoryContext.interactions.length > 0) {
      builder.addText('  Interactions:\n').addNumberedList(thought.fieldTheoryContext.interactions, 4);
    }
    if (thought.fieldTheoryContext.gaugeSymmetries?.length) {
      builder.addText('  Gauge Symmetries:\n').addNumberedList(thought.fieldTheoryContext.gaugeSymmetries, 4);
    }
    builder.addEmptyLine();
  }

  // Assumptions
  if (thought.assumptions?.length) {
    builder.addSection('Assumptions').addNumberedList(thought.assumptions);
    builder.addEmptyLine();
  }

  // Dependencies
  if (thought.dependencies?.length) {
    builder.addSection('Dependencies').addNumberedList(thought.dependencies);
  }

  return builder.render();
}

/**
 * Export physics reasoning to native SVG format
 */
function physicsToSVG(thought: PhysicsThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = DEFAULT_SVG_OPTIONS.height,
  } = options;

  const positions = new Map<string, SVGNodePosition>();
  const nodeWidth = 150;
  const nodeHeight = 40;

  // Thought type at the top
  positions.set('type', {
    id: 'type',
    label: includeLabels ? (thought.thoughtType || 'Physics').replace(/_/g, ' ') : 'Physics',
    x: svgWidth / 2,
    y: 80,
    width: nodeWidth,
    height: nodeHeight,
    type: 'type',
  });

  // Tensor properties on the left
  if (thought.tensorProperties) {
    positions.set('tensor', {
      id: 'tensor',
      label: `Tensor (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`,
      x: 150,
      y: 220,
      width: nodeWidth,
      height: nodeHeight,
      type: 'tensor',
    });
  }

  // Physical interpretation on the right
  if (thought.physicalInterpretation) {
    positions.set('interpretation', {
      id: 'interpretation',
      label: thought.physicalInterpretation.quantity,
      x: svgWidth - 150,
      y: 220,
      width: nodeWidth,
      height: nodeHeight,
      type: 'interpretation',
    });
  }

  // Field theory context at the bottom
  if (thought.fieldTheoryContext) {
    positions.set('field', {
      id: 'field',
      label: 'Field Theory',
      x: svgWidth / 2,
      y: 360,
      width: nodeWidth,
      height: nodeHeight,
      type: 'field',
    });
  }

  let svg = generateSVGHeader(svgWidth, svgHeight, 'Physics Analysis');

  // Render edges
  svg += '\n  <!-- Edges -->\n  <g class="edges">';

  const typePos = positions.get('type');
  const tensorPos = positions.get('tensor');
  const interpPos = positions.get('interpretation');
  const fieldPos = positions.get('field');

  if (typePos && tensorPos) {
    svg += renderEdge(typePos, tensorPos);
  }
  if (typePos && interpPos) {
    svg += renderEdge(typePos, interpPos);
  }
  if (typePos && fieldPos) {
    svg += renderEdge(typePos, fieldPos);
  }

  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';

  const typeColors = getNodeColor('primary', colorScheme);
  const tensorColors = getNodeColor('secondary', colorScheme);
  const interpColors = getNodeColor('tertiary', colorScheme);
  const fieldColors = getNodeColor('neutral', colorScheme);

  for (const [, pos] of positions) {
    if (pos.type === 'type') {
      svg += renderStadiumNode(pos, typeColors);
    } else if (pos.type === 'tensor') {
      svg += renderEllipseNode(pos, tensorColors);
    } else if (pos.type === 'interpretation') {
      svg += renderRectNode(pos, interpColors);
    } else if (pos.type === 'field') {
      svg += renderRectNode(pos, fieldColors);
    }
  }
  svg += '\n  </g>';

  // Render metrics panel
  if (includeMetrics) {
    const metrics = [
      { label: 'Uncertainty', value: `${(thought.uncertainty * 100).toFixed(1)}%` },
      { label: 'Assumptions', value: thought.assumptions?.length || 0 },
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 110, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Type', color: typeColors, shape: 'stadium' as const },
    { label: 'Tensor', color: tensorColors, shape: 'ellipse' as const },
    { label: 'Interpretation', color: interpColors },
    { label: 'Field Theory', color: fieldColors },
  ];
  svg += renderLegend(20, svgHeight - 130, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}

/**
 * Export physics reasoning to GraphML format
 */
function physicsToGraphML(thought: PhysicsThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  const nodes: GraphMLNode[] = [];
  const edges: GraphMLEdge[] = [];
  let edgeCount = 0;

  // Root node for the thought type
  const typeId = 'type';
  nodes.push({
    id: typeId,
    label: includeLabels ? (thought.thoughtType || 'Physics').replace(/_/g, ' ') : 'Physics',
    type: 'primary',
  });

  // Add tensor properties if present
  if (thought.tensorProperties) {
    const tensorId = 'tensor';
    nodes.push({
      id: tensorId,
      label: `Tensor Rank (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`,
      type: 'tensor',
      metadata: {
        description: `Components: ${thought.tensorProperties.components}`,
      },
    });
    edges.push({
      id: `e${edgeCount++}`,
      source: typeId,
      target: tensorId,
      label: 'has tensor',
    });

    // Add tensor components
    const componentsId = 'components';
    nodes.push({
      id: componentsId,
      label: 'Components',
      type: 'property',
      metadata: {
        description: thought.tensorProperties.components,
      },
    });
    edges.push({
      id: `e${edgeCount++}`,
      source: tensorId,
      target: componentsId,
    });

    // Add symmetries
    if (thought.tensorProperties.symmetries.length > 0) {
      thought.tensorProperties.symmetries.forEach((sym, index) => {
        const symId = `symmetry_${index}`;
        nodes.push({
          id: symId,
          label: includeLabels ? sym : `Symmetry ${index + 1}`,
          type: 'symmetry',
        });
        edges.push({
          id: `e${edgeCount++}`,
          source: tensorId,
          target: symId,
          label: 'symmetry',
        });
      });
    }

    // Add invariants
    if (thought.tensorProperties.invariants.length > 0) {
      thought.tensorProperties.invariants.forEach((inv, index) => {
        const invId = `invariant_${index}`;
        nodes.push({
          id: invId,
          label: includeLabels ? inv : `Invariant ${index + 1}`,
          type: 'invariant',
        });
        edges.push({
          id: `e${edgeCount++}`,
          source: tensorId,
          target: invId,
          label: 'invariant',
        });
      });
    }
  }

  // Add physical interpretation if present
  if (thought.physicalInterpretation) {
    const interpId = 'interpretation';
    nodes.push({
      id: interpId,
      label: thought.physicalInterpretation.quantity,
      type: 'interpretation',
      metadata: {
        description: `Units: ${thought.physicalInterpretation.units}`,
      },
    });
    edges.push({
      id: `e${edgeCount++}`,
      source: typeId,
      target: interpId,
      label: 'physical meaning',
    });

    // Add units
    const unitsId = 'units';
    nodes.push({
      id: unitsId,
      label: thought.physicalInterpretation.units,
      type: 'units',
    });
    edges.push({
      id: `e${edgeCount++}`,
      source: interpId,
      target: unitsId,
      label: 'measured in',
    });

    // Add conservation laws
    if (thought.physicalInterpretation.conservationLaws.length > 0) {
      thought.physicalInterpretation.conservationLaws.forEach((law, index) => {
        const lawId = `conservation_${index}`;
        nodes.push({
          id: lawId,
          label: includeLabels ? law : `Law ${index + 1}`,
          type: 'conservation_law',
        });
        edges.push({
          id: `e${edgeCount++}`,
          source: interpId,
          target: lawId,
          label: 'conserves',
        });
      });
    }
  }

  // Add field theory context if present
  if (thought.fieldTheoryContext) {
    const fieldId = 'field_theory';
    nodes.push({
      id: fieldId,
      label: 'Field Theory',
      type: 'field_theory',
      metadata: {
        description: `Symmetry Group: ${thought.fieldTheoryContext.symmetryGroup}`,
      },
    });
    edges.push({
      id: `e${edgeCount++}`,
      source: typeId,
      target: fieldId,
      label: 'context',
    });

    // Add fields
    thought.fieldTheoryContext.fields.forEach((field, index) => {
      const fId = `field_${index}`;
      nodes.push({
        id: fId,
        label: field,
        type: 'field',
      });
      edges.push({
        id: `e${edgeCount++}`,
        source: fieldId,
        target: fId,
        label: 'includes field',
      });
    });

    // Add symmetry group
    const symGroupId = 'symmetry_group';
    nodes.push({
      id: symGroupId,
      label: thought.fieldTheoryContext.symmetryGroup,
      type: 'symmetry_group',
    });
    edges.push({
      id: `e${edgeCount++}`,
      source: fieldId,
      target: symGroupId,
      label: 'has symmetry',
    });
  }

  // Add metrics node
  if (includeMetrics) {
    const metricsId = 'metrics';
    nodes.push({
      id: metricsId,
      label: `Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%`,
      type: 'metric',
      metadata: {
        description: `Assumptions: ${thought.assumptions?.length || 0}`,
      },
    });
  }

  const graphmlOptions: GraphMLOptions = {
    graphName: 'Physics Visualization',
  };

  return generateGraphML(nodes, edges, graphmlOptions);
}

/**
 * Export physics reasoning to TikZ format
 */
function physicsToTikZ(thought: PhysicsThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true, colorScheme = 'default' } = options;

  const nodes: TikZNode[] = [];
  const edges: TikZEdge[] = [];

  // Root node for the thought type (center top)
  const typeId = 'type';
  nodes.push({
    id: typeId,
    x: 0,
    y: 0,
    label: includeLabels ? (thought.thoughtType || 'Physics').replace(/_/g, ' ') : 'Physics',
    shape: 'stadium',
    type: 'primary',
  });

  const leftColumn = -4;
  const rightColumn = 4;
  const currentRow = -2;

  // Add tensor properties on the left
  if (thought.tensorProperties) {
    const tensorId = 'tensor';
    nodes.push({
      id: tensorId,
      x: leftColumn,
      y: currentRow,
      label: `Tensor (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`,
      shape: 'ellipse',
      type: 'tensor',
    });
    edges.push({
      source: typeId,
      target: tensorId,
    });

    // Add components below tensor
    const componentsId = 'components';
    nodes.push({
      id: componentsId,
      x: leftColumn,
      y: currentRow - 1.5,
      label: 'Components',
      shape: 'rectangle',
      type: 'property',
    });
    edges.push({
      source: tensorId,
      target: componentsId,
      style: 'dashed',
    });

    // Add symmetries if present
    if (thought.tensorProperties.symmetries.length > 0) {
      const symId = 'symmetries';
      nodes.push({
        id: symId,
        x: leftColumn - 2,
        y: currentRow - 3,
        label: `Symmetries (${thought.tensorProperties.symmetries.length})`,
        shape: 'diamond',
        type: 'symmetry',
      });
      edges.push({
        source: tensorId,
        target: symId,
      });
    }

    // Add invariants if present
    if (thought.tensorProperties.invariants.length > 0) {
      const invId = 'invariants';
      nodes.push({
        id: invId,
        x: leftColumn + 2,
        y: currentRow - 3,
        label: `Invariants (${thought.tensorProperties.invariants.length})`,
        shape: 'diamond',
        type: 'invariant',
      });
      edges.push({
        source: tensorId,
        target: invId,
      });
    }
  }

  // Add physical interpretation on the right
  if (thought.physicalInterpretation) {
    const interpId = 'interpretation';
    nodes.push({
      id: interpId,
      x: rightColumn,
      y: currentRow,
      label: thought.physicalInterpretation.quantity,
      shape: 'rounded',
      type: 'interpretation',
    });
    edges.push({
      source: typeId,
      target: interpId,
    });

    // Add units below interpretation
    const unitsId = 'units';
    nodes.push({
      id: unitsId,
      x: rightColumn,
      y: currentRow - 1.5,
      label: thought.physicalInterpretation.units,
      shape: 'ellipse',
      type: 'units',
    });
    edges.push({
      source: interpId,
      target: unitsId,
      style: 'dashed',
    });

    // Add conservation laws if present
    if (thought.physicalInterpretation.conservationLaws.length > 0) {
      thought.physicalInterpretation.conservationLaws.forEach((law, index) => {
        const lawId = `conservation_${index}`;
        const offset = (index - (thought.physicalInterpretation!.conservationLaws.length - 1) / 2) * 2;
        nodes.push({
          id: lawId,
          x: rightColumn + offset,
          y: currentRow - 3,
          label: includeLabels ? law.substring(0, 20) : `Law ${index + 1}`,
          shape: 'rectangle',
          type: 'conservation_law',
        });
        edges.push({
          source: interpId,
          target: lawId,
        });
      });
    }
  }

  // Add field theory context at the bottom center
  if (thought.fieldTheoryContext) {
    const fieldId = 'field_theory';
    nodes.push({
      id: fieldId,
      x: 0,
      y: currentRow - 5,
      label: 'Field Theory',
      shape: 'stadium',
      type: 'field_theory',
    });
    edges.push({
      source: typeId,
      target: fieldId,
    });

    // Add fields below field theory
    thought.fieldTheoryContext.fields.forEach((field, index) => {
      const fId = `field_${index}`;
      const offset = (index - (thought.fieldTheoryContext!.fields.length - 1) / 2) * 2.5;
      nodes.push({
        id: fId,
        x: offset,
        y: currentRow - 6.5,
        label: field,
        shape: 'rectangle',
        type: 'field',
      });
      edges.push({
        source: fieldId,
        target: fId,
      });
    });

    // Add symmetry group
    const symGroupId = 'symmetry_group';
    nodes.push({
      id: symGroupId,
      x: 0,
      y: currentRow - 8,
      label: thought.fieldTheoryContext.symmetryGroup,
      shape: 'diamond',
      type: 'symmetry_group',
    });
    edges.push({
      source: fieldId,
      target: symGroupId,
      style: 'dashed',
    });
  }

  const tikzOptions: TikZOptions = {
    title: 'Physics Visualization',
    colorScheme,
  };

  let tikz = generateTikZ(nodes, edges, tikzOptions);

  // Add metrics if requested
  if (includeMetrics) {
    const metrics = [
      { label: 'Uncertainty', value: `${(thought.uncertainty * 100).toFixed(1)}%` },
      { label: 'Assumptions', value: thought.assumptions?.length || 0 },
    ];
    tikz = tikz.replace('\\end{tikzpicture}', renderTikZMetrics(8, -8, metrics) + '\n\\end{tikzpicture}');
  }

  return tikz;
}

/**
 * Export physics reasoning to HTML format
 */
function physicsToHTML(thought: PhysicsThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Physics Analysis',
    htmlTheme = 'light',
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // Metrics
  html += '<div class="metrics-grid">';
  html += renderMetricCard('Uncertainty', `${(thought.uncertainty * 100).toFixed(1)}%`, 'warning');
  if (thought.assumptions) {
    html += renderMetricCard('Assumptions', thought.assumptions.length, 'info');
  }
  if (thought.tensorProperties) {
    html += renderMetricCard('Tensor Rank', `(${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`, 'primary');
  }
  if (thought.physicalInterpretation?.conservationLaws) {
    html += renderMetricCard('Conservation Laws', thought.physicalInterpretation.conservationLaws.length, 'success');
  }
  html += '</div>\n';

  // Thought type badge
  const badges = [];
  if (thought.thoughtType) {
    badges.push(renderBadge(thought.thoughtType.replace(/_/g, ' '), 'primary'));
  }

  if (badges.length > 0) {
    html += `<div class="flex gap-1" style="margin: 1rem 0">${badges.join(' ')}</div>\n`;
  }

  // Tensor properties
  if (thought.tensorProperties) {
    const tensorRows = [
      ['Rank', `(${thought.tensorProperties.rank[0]}, ${thought.tensorProperties.rank[1]})`],
      ['Components', thought.tensorProperties.components],
      ['LaTeX', thought.tensorProperties.latex],
      ['Transformation', thought.tensorProperties.transformation],
    ];
    if (thought.tensorProperties.indexStructure) {
      tensorRows.push(['Index Structure', thought.tensorProperties.indexStructure]);
    }
    if (thought.tensorProperties.coordinateSystem) {
      tensorRows.push(['Coordinate System', thought.tensorProperties.coordinateSystem]);
    }

    let tensorContent = renderTable(['Property', 'Value'], tensorRows);

    if (thought.tensorProperties.symmetries.length > 0) {
      tensorContent += '<p style="margin-top: 1rem"><strong>Symmetries:</strong></p>';
      tensorContent += '<ul class="list-styled">';
      thought.tensorProperties.symmetries.forEach(sym => {
        tensorContent += `<li>${escapeHTML(sym)}</li>`;
      });
      tensorContent += '</ul>';
    }

    if (thought.tensorProperties.invariants.length > 0) {
      tensorContent += '<p style="margin-top: 1rem"><strong>Invariants:</strong></p>';
      tensorContent += '<ul class="list-styled">';
      thought.tensorProperties.invariants.forEach(inv => {
        tensorContent += `<li>${escapeHTML(inv)}</li>`;
      });
      tensorContent += '</ul>';
    }

    html += renderSection('Tensor Properties', tensorContent, '🔢');
  }

  // Physical interpretation
  if (thought.physicalInterpretation) {
    const interpRows = [
      ['Quantity', thought.physicalInterpretation.quantity],
      ['Units', thought.physicalInterpretation.units],
    ];

    let interpContent = renderTable(['Property', 'Value'], interpRows);

    if (thought.physicalInterpretation.conservationLaws.length > 0) {
      interpContent += '<p style="margin-top: 1rem"><strong>Conservation Laws:</strong></p>';
      interpContent += '<ul class="list-styled">';
      thought.physicalInterpretation.conservationLaws.forEach(law => {
        interpContent += `<li>${escapeHTML(law)}</li>`;
      });
      interpContent += '</ul>';
    }

    if (thought.physicalInterpretation.constraints && thought.physicalInterpretation.constraints.length > 0) {
      interpContent += '<p style="margin-top: 1rem"><strong>Constraints:</strong></p>';
      interpContent += '<ul class="list-styled">';
      thought.physicalInterpretation.constraints.forEach(constraint => {
        interpContent += `<li>${escapeHTML(constraint)}</li>`;
      });
      interpContent += '</ul>';
    }

    if (thought.physicalInterpretation.observables && thought.physicalInterpretation.observables.length > 0) {
      interpContent += '<p style="margin-top: 1rem"><strong>Observables:</strong></p>';
      interpContent += '<ul class="list-styled">';
      thought.physicalInterpretation.observables.forEach(obs => {
        interpContent += `<li>${escapeHTML(obs)}</li>`;
      });
      interpContent += '</ul>';
    }

    html += renderSection('Physical Interpretation', interpContent, '⚛️');
  }

  // Field theory context
  if (thought.fieldTheoryContext) {
    let fieldContent = `<p><strong>Symmetry Group:</strong> ${renderBadge(thought.fieldTheoryContext.symmetryGroup, 'info')}</p>`;

    if (thought.fieldTheoryContext.fields.length > 0) {
      fieldContent += '<p style="margin-top: 1rem"><strong>Fields:</strong></p>';
      fieldContent += '<ul class="list-styled">';
      thought.fieldTheoryContext.fields.forEach(field => {
        fieldContent += `<li>${escapeHTML(field)}</li>`;
      });
      fieldContent += '</ul>';
    }

    if (thought.fieldTheoryContext.interactions.length > 0) {
      fieldContent += '<p style="margin-top: 1rem"><strong>Interactions:</strong></p>';
      fieldContent += '<ul class="list-styled">';
      thought.fieldTheoryContext.interactions.forEach(interaction => {
        fieldContent += `<li>${escapeHTML(interaction)}</li>`;
      });
      fieldContent += '</ul>';
    }

    if (thought.fieldTheoryContext.gaugeSymmetries && thought.fieldTheoryContext.gaugeSymmetries.length > 0) {
      fieldContent += '<p style="margin-top: 1rem"><strong>Gauge Symmetries:</strong></p>';
      fieldContent += '<ul class="list-styled">';
      thought.fieldTheoryContext.gaugeSymmetries.forEach(gauge => {
        fieldContent += `<li>${escapeHTML(gauge)}</li>`;
      });
      fieldContent += '</ul>';
    }

    html += renderSection('Field Theory Context', fieldContent, '🌌');
  }

  // Assumptions
  if (thought.assumptions && thought.assumptions.length > 0) {
    const assumptionsList = thought.assumptions.map(a => escapeHTML(a));
    html += renderSection('Assumptions', `
      <ul class="list-styled">
        ${assumptionsList.map(a => `<li>${a}</li>`).join('')}
      </ul>
    `, '⚠️');
  }

  // Dependencies
  if (thought.dependencies && thought.dependencies.length > 0) {
    const depsList = thought.dependencies.map(d => escapeHTML(d));
    html += renderSection('Dependencies', `
      <ul class="list-styled">
        ${depsList.map(d => `<li>${d}</li>`).join('')}
      </ul>
    `, '🔗');
  }

  html += generateHTMLFooter(htmlStandalone);
  return html;
}

/**
 * Export physics reasoning to Modelica format
 */
function physicsToModelica(thought: PhysicsThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;

  const packageName = sanitizeModelicaId(thought.thoughtType || 'PhysicsModel');
  let modelica = `package ${packageName}\n`;
  modelica += `  "${escapeModelicaString('Physics model for ' + (thought.thoughtType || 'physical system'))}"\n\n`;

  // Create main model
  modelica += `  model PhysicalSystem\n`;
  modelica += `    "${escapeModelicaString('Physical system representation')}"\n\n`;

  // Add tensor properties as parameters and variables
  if (thought.tensorProperties) {
    modelica += `    // Tensor Properties\n`;
    modelica += `    parameter Integer tensorRank[2] = {${thought.tensorProperties.rank[0]}, ${thought.tensorProperties.rank[1]}};\n`;
    modelica += `    parameter String tensorComponents = "${escapeModelicaString(thought.tensorProperties.components)}";\n`;
    modelica += `    parameter String tensorTransformation = "${escapeModelicaString(thought.tensorProperties.transformation)}";\n`;

    if (thought.tensorProperties.indexStructure) {
      modelica += `    parameter String indexStructure = "${escapeModelicaString(thought.tensorProperties.indexStructure)}";\n`;
    }

    if (thought.tensorProperties.coordinateSystem) {
      modelica += `    parameter String coordinateSystem = "${escapeModelicaString(thought.tensorProperties.coordinateSystem)}";\n`;
    }

    modelica += '\n';
  }

  // Add physical interpretation as physical quantities
  if (thought.physicalInterpretation) {
    modelica += `    // Physical Interpretation\n`;
    const quantity = sanitizeModelicaId(thought.physicalInterpretation.quantity);
    const units = thought.physicalInterpretation.units;

    modelica += `    Real ${quantity}(unit="${escapeModelicaString(units)}");\n`;
    modelica += `    parameter String physicalQuantity = "${escapeModelicaString(thought.physicalInterpretation.quantity)}";\n`;

    // Add conservation laws as constraints
    if (thought.physicalInterpretation.conservationLaws.length > 0) {
      modelica += `\n    // Conservation Laws\n`;
      thought.physicalInterpretation.conservationLaws.forEach((law, index) => {
        const lawVar = sanitizeModelicaId(`conservationLaw_${index + 1}`);
        modelica += `    parameter String ${lawVar} = "${escapeModelicaString(law)}";\n`;
      });
    }

    // Add constraints as parameters
    if (thought.physicalInterpretation.constraints && thought.physicalInterpretation.constraints.length > 0) {
      modelica += `\n    // Constraints\n`;
      thought.physicalInterpretation.constraints.forEach((constraint, index) => {
        const constraintVar = sanitizeModelicaId(`constraint_${index + 1}`);
        modelica += `    parameter String ${constraintVar} = "${escapeModelicaString(constraint)}";\n`;
      });
    }

    // Add observables
    if (thought.physicalInterpretation.observables && thought.physicalInterpretation.observables.length > 0) {
      modelica += `\n    // Observables\n`;
      thought.physicalInterpretation.observables.forEach((obs, index) => {
        const obsVar = sanitizeModelicaId(`observable_${index + 1}`);
        modelica += `    Real ${obsVar} "${escapeModelicaString(obs)}";\n`;
      });
    }

    modelica += '\n';
  }

  // Add field theory context
  if (thought.fieldTheoryContext) {
    modelica += `    // Field Theory Context\n`;
    modelica += `    parameter String symmetryGroup = "${escapeModelicaString(thought.fieldTheoryContext.symmetryGroup)}";\n`;

    if (thought.fieldTheoryContext.fields.length > 0) {
      modelica += `\n    // Fields\n`;
      thought.fieldTheoryContext.fields.forEach((field, index) => {
        const fieldVar = sanitizeModelicaId(`field_${index + 1}`);
        modelica += `    Real ${fieldVar} "${escapeModelicaString(field)}";\n`;
      });
    }

    if (thought.fieldTheoryContext.interactions.length > 0) {
      modelica += `\n    // Interactions\n`;
      thought.fieldTheoryContext.interactions.forEach((interaction, index) => {
        const intVar = sanitizeModelicaId(`interaction_${index + 1}`);
        modelica += `    parameter String ${intVar} = "${escapeModelicaString(interaction)}";\n`;
      });
    }

    if (thought.fieldTheoryContext.gaugeSymmetries && thought.fieldTheoryContext.gaugeSymmetries.length > 0) {
      modelica += `\n    // Gauge Symmetries\n`;
      thought.fieldTheoryContext.gaugeSymmetries.forEach((gauge, index) => {
        const gaugeVar = sanitizeModelicaId(`gaugeSymmetry_${index + 1}`);
        modelica += `    parameter String ${gaugeVar} = "${escapeModelicaString(gauge)}";\n`;
      });
    }

    modelica += '\n';
  }

  // Add metrics
  if (includeMetrics) {
    modelica += `    // Metrics\n`;
    modelica += `    parameter Real uncertainty = ${thought.uncertainty};\n`;
    if (thought.assumptions && thought.assumptions.length > 0) {
      modelica += `    parameter Integer assumptionCount = ${thought.assumptions.length};\n`;
    }
    modelica += '\n';
  }

  // Add equations section
  modelica += `  equation\n`;

  // Add simple time derivative equation for demonstration
  if (thought.physicalInterpretation) {
    const quantity = sanitizeModelicaId(thought.physicalInterpretation.quantity);
    modelica += `    // Physical evolution (placeholder)\n`;
    modelica += `    der(${quantity}) = 0; // Steady state or define custom dynamics\n`;
  }

  modelica += `  end PhysicalSystem;\n\n`;

  // Add annotations
  modelica += `  annotation(\n`;
  modelica += `    Documentation(info="<html>\n`;
  modelica += `      <p>Physics model generated from reasoning thought</p>\n`;
  modelica += `      <p>Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%</p>\n`;
  if (thought.assumptions && thought.assumptions.length > 0) {
    modelica += `      <p>Assumptions: ${thought.assumptions.length}</p>\n`;
  }
  modelica += `    </html>")\n`;
  modelica += `  );\n`;

  modelica += `end ${packageName};\n`;

  return modelica;
}

/**
 * Export physics reasoning to UML format
 */
function physicsToUML(thought: PhysicsThought, options: VisualExportOptions): string {
  const { includeLabels = true } = options;

  const nodes: UmlNode[] = [];
  const edges: UmlEdge[] = [];

  // Main physics class
  const mainId = 'PhysicsSystem';
  nodes.push({
    id: mainId,
    label: includeLabels ? (thought.thoughtType || 'Physics').replace(/_/g, ' ') : 'PhysicsSystem',
    shape: 'class',
    attributes: [
      `uncertainty: Real = ${thought.uncertainty.toFixed(3)}`,
      ...(thought.assumptions ? [`assumptions: Integer = ${thought.assumptions.length}`] : []),
    ],
    methods: [],
  });

  // Tensor properties as a class
  if (thought.tensorProperties) {
    const tensorId = 'TensorProperties';
    nodes.push({
      id: tensorId,
      label: 'TensorProperties',
      shape: 'class',
      attributes: [
        `rank: Integer[2] = [${thought.tensorProperties.rank[0]}, ${thought.tensorProperties.rank[1]}]`,
        `components: String = "${thought.tensorProperties.components.substring(0, 30)}..."`,
        `transformation: String = "${thought.tensorProperties.transformation}"`,
        ...(thought.tensorProperties.symmetries.length > 0 ? [`symmetries: Integer = ${thought.tensorProperties.symmetries.length}`] : []),
        ...(thought.tensorProperties.invariants.length > 0 ? [`invariants: Integer = ${thought.tensorProperties.invariants.length}`] : []),
      ],
      methods: [],
    });
    edges.push({
      source: mainId,
      target: tensorId,
      type: 'composition',
      label: 'has',
    });
  }

  // Physical interpretation as a class
  if (thought.physicalInterpretation) {
    const interpId = 'PhysicalInterpretation';
    nodes.push({
      id: interpId,
      label: 'PhysicalInterpretation',
      shape: 'class',
      attributes: [
        `quantity: String = "${thought.physicalInterpretation.quantity}"`,
        `units: String = "${thought.physicalInterpretation.units}"`,
        `conservationLaws: Integer = ${thought.physicalInterpretation.conservationLaws.length}`,
        ...(thought.physicalInterpretation.constraints ? [`constraints: Integer = ${thought.physicalInterpretation.constraints.length}`] : []),
        ...(thought.physicalInterpretation.observables ? [`observables: Integer = ${thought.physicalInterpretation.observables.length}`] : []),
      ],
      methods: [
        'measure(): Real',
        'validate(): Boolean',
      ],
    });
    edges.push({
      source: mainId,
      target: interpId,
      type: 'composition',
      label: 'interprets as',
    });

    // Conservation laws as a separate class
    if (thought.physicalInterpretation.conservationLaws.length > 0) {
      const lawsId = 'ConservationLaws';
      nodes.push({
        id: lawsId,
        label: 'ConservationLaws',
        shape: 'class',
        attributes: thought.physicalInterpretation.conservationLaws.map((law, i) =>
          `law${i + 1}: String = "${law.substring(0, 30)}..."`
        ),
        methods: ['verify(): Boolean'],
      });
      edges.push({
        source: interpId,
        target: lawsId,
        type: 'association',
        label: 'enforces',
      });
    }
  }

  // Field theory context as a class
  if (thought.fieldTheoryContext) {
    const fieldId = 'FieldTheory';
    nodes.push({
      id: fieldId,
      label: 'FieldTheory',
      shape: 'class',
      attributes: [
        `symmetryGroup: String = "${thought.fieldTheoryContext.symmetryGroup}"`,
        `fields: Integer = ${thought.fieldTheoryContext.fields.length}`,
        `interactions: Integer = ${thought.fieldTheoryContext.interactions.length}`,
        ...(thought.fieldTheoryContext.gaugeSymmetries ? [`gaugeSymmetries: Integer = ${thought.fieldTheoryContext.gaugeSymmetries.length}`] : []),
      ],
      methods: [
        'computeField(x: Real): Real',
        'applySymmetry(g: Group): Field',
      ],
    });
    edges.push({
      source: mainId,
      target: fieldId,
      type: 'composition',
      label: 'described by',
    });

    // Fields as individual components
    if (thought.fieldTheoryContext.fields.length > 0 && thought.fieldTheoryContext.fields.length <= 3) {
      thought.fieldTheoryContext.fields.forEach((field, index) => {
        const fId = `Field${index + 1}`;
        nodes.push({
          id: fId,
          label: field,
          shape: 'class',
          attributes: ['value: Real', 'gradient: Real'],
          methods: ['evaluate(x: Real): Real'],
        });
        edges.push({
          source: fieldId,
          target: fId,
          type: 'aggregation',
          label: 'contains',
        });
      });
    }
  }

  return generateUmlDiagram(nodes, edges, {
    title: 'Physics System UML',
    includeLabels,
  });
}

/**
 * Export physics reasoning to JSON format
 */
function physicsToJSON(thought: PhysicsThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  const graph = createJsonGraph('physics_system', 'Physics System Model');

  // Add main type node
  const typeId = 'type';
  addNode(graph, {
    id: typeId,
    label: includeLabels ? (thought.thoughtType || 'Physics').replace(/_/g, ' ') : 'Physics',
    type: 'thought_type',
    metadata: {
      thoughtType: thought.thoughtType || 'physics',
    },
  });

  // Add tensor properties
  if (thought.tensorProperties) {
    const tensorId = 'tensor';
    addNode(graph, {
      id: tensorId,
      label: `Tensor (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`,
      type: 'tensor',
      metadata: {
        rank: thought.tensorProperties.rank,
        components: thought.tensorProperties.components,
        transformation: thought.tensorProperties.transformation,
        indexStructure: thought.tensorProperties.indexStructure,
        coordinateSystem: thought.tensorProperties.coordinateSystem,
      },
    });
    addEdge(graph, {
      id: 'edge_type_tensor',
      source: typeId,
      target: tensorId,
      label: 'has_tensor',
      directed: true,
    });

    // Add symmetries as nodes
    if (thought.tensorProperties.symmetries.length > 0) {
      thought.tensorProperties.symmetries.forEach((sym, index) => {
        const symId = `symmetry_${index}`;
        addNode(graph, {
          id: symId,
          label: sym,
          type: 'symmetry',
          metadata: { description: sym },
        });
        addEdge(graph, {
          id: `edge_tensor_sym_${index}`,
          source: tensorId,
          target: symId,
          label: 'has_symmetry',
          directed: true,
        });
      });
    }

    // Add invariants as nodes
    if (thought.tensorProperties.invariants.length > 0) {
      thought.tensorProperties.invariants.forEach((inv, index) => {
        const invId = `invariant_${index}`;
        addNode(graph, {
          id: invId,
          label: inv,
          type: 'invariant',
          metadata: { description: inv },
        });
        addEdge(graph, {
          id: `edge_tensor_inv_${index}`,
          source: tensorId,
          target: invId,
          label: 'has_invariant',
          directed: true,
        });
      });
    }
  }

  // Add physical interpretation
  if (thought.physicalInterpretation) {
    const interpId = 'interpretation';
    addNode(graph, {
      id: interpId,
      label: thought.physicalInterpretation.quantity,
      type: 'physical_interpretation',
      metadata: {
        quantity: thought.physicalInterpretation.quantity,
        units: thought.physicalInterpretation.units,
        conservationLaws: thought.physicalInterpretation.conservationLaws,
        constraints: thought.physicalInterpretation.constraints,
        observables: thought.physicalInterpretation.observables,
      },
    });
    addEdge(graph, {
      id: 'edge_type_interp',
      source: typeId,
      target: interpId,
      label: 'interprets_as',
      directed: true,
    });

    // Add units node
    const unitsId = 'units';
    addNode(graph, {
      id: unitsId,
      label: thought.physicalInterpretation.units,
      type: 'units',
      metadata: { units: thought.physicalInterpretation.units },
    });
    addEdge(graph, {
      id: 'edge_interp_units',
      source: interpId,
      target: unitsId,
      label: 'measured_in',
      directed: true,
    });

    // Add conservation laws
    if (thought.physicalInterpretation.conservationLaws.length > 0) {
      thought.physicalInterpretation.conservationLaws.forEach((law, index) => {
        const lawId = `conservation_${index}`;
        addNode(graph, {
          id: lawId,
          label: includeLabels ? law : `Law ${index + 1}`,
          type: 'conservation_law',
          metadata: { law },
        });
        addEdge(graph, {
          id: `edge_interp_law_${index}`,
          source: interpId,
          target: lawId,
          label: 'conserves',
          directed: true,
        });
      });
    }

    // Add observables
    if (thought.physicalInterpretation.observables && thought.physicalInterpretation.observables.length > 0) {
      thought.physicalInterpretation.observables.forEach((obs, index) => {
        const obsId = `observable_${index}`;
        addNode(graph, {
          id: obsId,
          label: obs,
          type: 'observable',
          metadata: { observable: obs },
        });
        addEdge(graph, {
          id: `edge_interp_obs_${index}`,
          source: interpId,
          target: obsId,
          label: 'has_observable',
          directed: true,
        });
      });
    }
  }

  // Add field theory context
  if (thought.fieldTheoryContext) {
    const fieldId = 'field_theory';
    addNode(graph, {
      id: fieldId,
      label: 'Field Theory',
      type: 'field_theory',
      metadata: {
        symmetryGroup: thought.fieldTheoryContext.symmetryGroup,
        fields: thought.fieldTheoryContext.fields,
        interactions: thought.fieldTheoryContext.interactions,
        gaugeSymmetries: thought.fieldTheoryContext.gaugeSymmetries,
      },
    });
    addEdge(graph, {
      id: 'edge_type_field',
      source: typeId,
      target: fieldId,
      label: 'has_context',
      directed: true,
    });

    // Add fields
    thought.fieldTheoryContext.fields.forEach((field, index) => {
      const fId = `field_${index}`;
      addNode(graph, {
        id: fId,
        label: field,
        type: 'field',
        metadata: { field },
      });
      addEdge(graph, {
        id: `edge_field_f_${index}`,
        source: fieldId,
        target: fId,
        label: 'includes_field',
        directed: true,
      });
    });

    // Add symmetry group
    const symGroupId = 'symmetry_group';
    addNode(graph, {
      id: symGroupId,
      label: thought.fieldTheoryContext.symmetryGroup,
      type: 'symmetry_group',
      metadata: { group: thought.fieldTheoryContext.symmetryGroup },
    });
    addEdge(graph, {
      id: 'edge_field_symgroup',
      source: fieldId,
      target: symGroupId,
      label: 'has_symmetry_group',
      directed: true,
    });
  }

  // Add metrics
  if (includeMetrics) {
    addMetric(graph, 'uncertainty', thought.uncertainty);
    if (thought.assumptions) {
      addMetric(graph, 'assumption_count', thought.assumptions.length);
    }
    if (thought.dependencies) {
      addMetric(graph, 'dependency_count', thought.dependencies.length);
    }
  }

  return serializeGraph(graph);
}

/**
 * Export physics reasoning to Markdown format
 */
function physicsToMarkdown(thought: PhysicsThought, options: VisualExportOptions): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
    includeMetrics = true,
  } = options;

  const parts: string[] = [];

  // Thought type section
  const typeContent = `**Type:** ${(thought.thoughtType || 'physics').replace(/_/g, ' ')}`;
  parts.push(section('Overview', typeContent));

  // Tensor properties section
  if (thought.tensorProperties) {
    const tensorContent = keyValueSection({
      'Rank': `(${thought.tensorProperties.rank[0]}, ${thought.tensorProperties.rank[1]})`,
      'Components': thought.tensorProperties.components,
      'LaTeX': thought.tensorProperties.latex,
      'Transformation': thought.tensorProperties.transformation,
      ...(thought.tensorProperties.indexStructure ? { 'Index Structure': thought.tensorProperties.indexStructure } : {}),
      ...(thought.tensorProperties.coordinateSystem ? { 'Coordinate System': thought.tensorProperties.coordinateSystem } : {}),
    });

    let tensorFull = tensorContent;

    if (thought.tensorProperties.symmetries.length > 0) {
      tensorFull += '\n\n**Symmetries:**\n\n' + list(thought.tensorProperties.symmetries);
    }

    if (thought.tensorProperties.invariants.length > 0) {
      tensorFull += '\n\n**Invariants:**\n\n' + list(thought.tensorProperties.invariants);
    }

    parts.push(section('Tensor Properties', tensorFull));
  }

  // Physical interpretation section
  if (thought.physicalInterpretation) {
    const interpContent = keyValueSection({
      'Quantity': thought.physicalInterpretation.quantity,
      'Units': thought.physicalInterpretation.units,
    });

    let interpFull = interpContent;

    if (thought.physicalInterpretation.conservationLaws.length > 0) {
      interpFull += '\n\n**Conservation Laws:**\n\n' + list(thought.physicalInterpretation.conservationLaws);
    }

    if (thought.physicalInterpretation.constraints && thought.physicalInterpretation.constraints.length > 0) {
      interpFull += '\n\n**Constraints:**\n\n' + list(thought.physicalInterpretation.constraints);
    }

    if (thought.physicalInterpretation.observables && thought.physicalInterpretation.observables.length > 0) {
      interpFull += '\n\n**Observables:**\n\n' + list(thought.physicalInterpretation.observables);
    }

    parts.push(section('Physical Interpretation', interpFull));
  }

  // Field theory context section
  if (thought.fieldTheoryContext) {
    const fieldContent = keyValueSection({
      'Symmetry Group': thought.fieldTheoryContext.symmetryGroup,
    });

    let fieldFull = fieldContent;

    if (thought.fieldTheoryContext.fields.length > 0) {
      fieldFull += '\n\n**Fields:**\n\n' + list(thought.fieldTheoryContext.fields);
    }

    if (thought.fieldTheoryContext.interactions.length > 0) {
      fieldFull += '\n\n**Interactions:**\n\n' + list(thought.fieldTheoryContext.interactions);
    }

    if (thought.fieldTheoryContext.gaugeSymmetries && thought.fieldTheoryContext.gaugeSymmetries.length > 0) {
      fieldFull += '\n\n**Gauge Symmetries:**\n\n' + list(thought.fieldTheoryContext.gaugeSymmetries);
    }

    parts.push(section('Field Theory Context', fieldFull));
  }

  // Metrics section
  if (includeMetrics) {
    const metricsContent = keyValueSection({
      'Uncertainty': `${(thought.uncertainty * 100).toFixed(1)}%`,
      ...(thought.assumptions ? { 'Assumptions': thought.assumptions.length } : {}),
      ...(thought.dependencies ? { 'Dependencies': thought.dependencies.length } : {}),
    });
    parts.push(section('Metrics', metricsContent + '\n\n' + progressBar(thought.uncertainty * 100)));
  }

  // Assumptions section
  if (thought.assumptions && thought.assumptions.length > 0) {
    parts.push(section('Assumptions', list(thought.assumptions)));
  }

  // Dependencies section
  if (thought.dependencies && thought.dependencies.length > 0) {
    parts.push(section('Dependencies', list(thought.dependencies)));
  }

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaidDiagram = physicsToMermaid(thought, 'default', true, true);
    parts.push(section('Visualization', mermaidBlock(mermaidDiagram)));
  }

  return mdDocument('Physics Analysis', parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: {
      mode: 'physics',
      thoughtType: thought.thoughtType || 'physics',
      uncertainty: thought.uncertainty,
    },
  });
}
