/**
 * Physics Visual Exporter (v7.0.3)
 * Phase 7 Sprint 2: Physics reasoning export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 * Phase 9: Added GraphML and TikZ export support
 */

import type { PhysicsThought } from '../../types/modes/physics.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';
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
} from './svg-utils.js';
import {
  generateGraphML,
  type GraphMLNode,
  type GraphMLEdge,
  type GraphMLOptions,
} from './graphml-utils.js';
import {
  generateTikZ,
  renderTikZMetrics,
  type TikZNode,
  type TikZEdge,
  type TikZOptions,
} from './tikz-utils.js';
import {
  generateHTMLHeader,
  generateHTMLFooter,
  escapeHTML,
  renderMetricCard,
  renderSection,
  renderTable,
  renderBadge,
} from './html-utils.js';

/**
 * Export physics reasoning to visual format
 */
export function exportPhysicsVisualization(thought: PhysicsThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return physicsToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return physicsToDOT(thought, includeLabels, includeMetrics);
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
  let mermaid = 'graph TB\n';

  // Add thought type node
  const typeId = sanitizeId(`type_${thought.thoughtType || 'physics'}`);
  const typeLabel = includeLabels ? (thought.thoughtType || 'Physics').replace(/_/g, ' ') : typeId;
  mermaid += `  ${typeId}[[\"${typeLabel}\"]]\n`;

  // Add tensor properties if present
  if (thought.tensorProperties) {
    const tensorId = sanitizeId('tensor');
    const rankLabel = `Rank (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`;
    mermaid += `  ${tensorId}([\"${rankLabel}\"])\n`;
    mermaid += `  ${typeId} --> ${tensorId}\n`;

    // Add tensor components
    const compId = sanitizeId('components');
    const compLabel = includeLabels
      ? thought.tensorProperties.components.slice(0, 30) + (thought.tensorProperties.components.length > 30 ? '...' : '')
      : 'Components';
    mermaid += `  ${compId}[\"${compLabel}\"]\n`;
    mermaid += `  ${tensorId} --> ${compId}\n`;

    // Add symmetries
    if (thought.tensorProperties.symmetries.length > 0) {
      const symId = sanitizeId('symmetries');
      mermaid += `  ${symId}{{\"Symmetries: ${thought.tensorProperties.symmetries.length}\"}}\n`;
      mermaid += `  ${tensorId} --> ${symId}\n`;
    }

    // Add invariants
    if (thought.tensorProperties.invariants.length > 0) {
      const invId = sanitizeId('invariants');
      mermaid += `  ${invId}{{\"Invariants: ${thought.tensorProperties.invariants.length}\"}}\n`;
      mermaid += `  ${tensorId} --> ${invId}\n`;
    }
  }

  // Add physical interpretation if present
  if (thought.physicalInterpretation) {
    const interpId = sanitizeId('interpretation');
    const interpLabel = thought.physicalInterpretation.quantity;
    mermaid += `  ${interpId}[/\"${interpLabel}\"/]\n`;
    mermaid += `  ${typeId} --> ${interpId}\n`;

    // Add units
    const unitsId = sanitizeId('units');
    mermaid += `  ${unitsId}([\"${thought.physicalInterpretation.units}\"])\n`;
    mermaid += `  ${interpId} --> ${unitsId}\n`;

    // Add conservation laws
    if (thought.physicalInterpretation.conservationLaws.length > 0) {
      thought.physicalInterpretation.conservationLaws.forEach((law, index) => {
        const lawId = sanitizeId(`conservation_${index}`);
        const lawLabel = includeLabels ? law.slice(0, 25) + (law.length > 25 ? '...' : '') : `Law ${index + 1}`;
        mermaid += `  ${lawId}>\"${lawLabel}\"]\n`;
        mermaid += `  ${interpId} --> ${lawId}\n`;
      });
    }
  }

  // Add field theory context if present
  if (thought.fieldTheoryContext) {
    const fieldId = sanitizeId('field_theory');
    mermaid += `  ${fieldId}[(\"Field Theory\")]\n`;
    mermaid += `  ${typeId} --> ${fieldId}\n`;

    // Add fields
    thought.fieldTheoryContext.fields.forEach((field, index) => {
      const fId = sanitizeId(`field_${index}`);
      mermaid += `  ${fId}[\"${field}\"]\n`;
      mermaid += `  ${fieldId} --> ${fId}\n`;
    });

    // Add symmetry group
    const symGroupId = sanitizeId('symmetry_group');
    mermaid += `  ${symGroupId}{{\"${thought.fieldTheoryContext.symmetryGroup}\"}}\n`;
    mermaid += `  ${fieldId} --> ${symGroupId}\n`;
  }

  // Add uncertainty metric
  if (includeMetrics) {
    const uncertId = sanitizeId('uncertainty');
    const uncertLabel = `Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%`;
    mermaid += `  ${uncertId}{{${uncertLabel}}}\n`;
  }

  // Add assumptions as notes
  if (thought.assumptions && thought.assumptions.length > 0) {
    const assumptionsId = sanitizeId('assumptions');
    mermaid += `  ${assumptionsId}>\"Assumptions: ${thought.assumptions.length}\"]\n`;
  }

  // Color scheme
  if (colorScheme !== 'monochrome') {
    const colors = colorScheme === 'pastel'
      ? { type: '#e3f2fd', tensor: '#fff3e0', interp: '#e8f5e9' }
      : { type: '#87CEEB', tensor: '#FFD700', interp: '#90EE90' };

    mermaid += `\n  style ${typeId} fill:${colors.type}\n`;
    if (thought.tensorProperties) {
      mermaid += `  style ${sanitizeId('tensor')} fill:${colors.tensor}\n`;
    }
    if (thought.physicalInterpretation) {
      mermaid += `  style ${sanitizeId('interpretation')} fill:${colors.interp}\n`;
    }
  }

  return mermaid;
}

function physicsToDOT(
  thought: PhysicsThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph PhysicsVisualization {\n';
  dot += '  rankdir=TB;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  // Add thought type node
  const typeId = sanitizeId(`type_${thought.thoughtType || 'physics'}`);
  const typeLabel = includeLabels ? (thought.thoughtType || 'Physics').replace(/_/g, ' ') : typeId;
  dot += `  ${typeId} [label="${typeLabel}", shape=doubleoctagon];\n`;

  // Add tensor properties
  if (thought.tensorProperties) {
    const tensorId = sanitizeId('tensor');
    const rankLabel = `Rank (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`;
    dot += `  ${tensorId} [label="${rankLabel}", shape=ellipse];\n`;
    dot += `  ${typeId} -> ${tensorId};\n`;

    // Components
    const compId = sanitizeId('components');
    const compLabel = includeLabels
      ? thought.tensorProperties.components.slice(0, 25).replace(/"/g, '\\"')
      : 'Components';
    dot += `  ${compId} [label="${compLabel}"];\n`;
    dot += `  ${tensorId} -> ${compId};\n`;

    // Transformation type
    const transId = sanitizeId('transformation');
    dot += `  ${transId} [label="${thought.tensorProperties.transformation}", shape=diamond];\n`;
    dot += `  ${tensorId} -> ${transId};\n`;
  }

  // Add physical interpretation
  if (thought.physicalInterpretation) {
    const interpId = sanitizeId('interpretation');
    dot += `  ${interpId} [label="${thought.physicalInterpretation.quantity}", shape=parallelogram];\n`;
    dot += `  ${typeId} -> ${interpId};\n`;

    // Units
    const unitsId = sanitizeId('units');
    dot += `  ${unitsId} [label="${thought.physicalInterpretation.units}", shape=ellipse];\n`;
    dot += `  ${interpId} -> ${unitsId};\n`;

    // Conservation laws
    thought.physicalInterpretation.conservationLaws.forEach((law, index) => {
      const lawId = sanitizeId(`conservation_${index}`);
      const lawLabel = includeLabels ? law.slice(0, 20).replace(/"/g, '\\"') : `Law ${index + 1}`;
      dot += `  ${lawId} [label="${lawLabel}", shape=hexagon];\n`;
      dot += `  ${interpId} -> ${lawId};\n`;
    });
  }

  // Add field theory context
  if (thought.fieldTheoryContext) {
    const fieldId = sanitizeId('field_theory');
    dot += `  ${fieldId} [label="Field Theory", shape=cylinder];\n`;
    dot += `  ${typeId} -> ${fieldId};\n`;

    // Fields
    thought.fieldTheoryContext.fields.forEach((field, index) => {
      const fId = sanitizeId(`field_${index}`);
      dot += `  ${fId} [label="${field}"];\n`;
      dot += `  ${fieldId} -> ${fId};\n`;
    });

    // Symmetry group
    const symGroupId = sanitizeId('symmetry_group');
    dot += `  ${symGroupId} [label="${thought.fieldTheoryContext.symmetryGroup}", shape=diamond];\n`;
    dot += `  ${fieldId} -> ${symGroupId};\n`;
  }

  // Add uncertainty
  if (includeMetrics) {
    const uncertId = sanitizeId('uncertainty');
    dot += `  ${uncertId} [label="${(thought.uncertainty * 100).toFixed(1)}%", shape=diamond];\n`;
  }

  dot += '}\n';
  return dot;
}

function physicsToASCII(thought: PhysicsThought): string {
  let ascii = 'Physics Analysis:\n';
  ascii += '=================\n\n';

  // Thought type
  ascii += `Type: ${(thought.thoughtType || 'physics').replace(/_/g, ' ')}\n`;
  ascii += `Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%\n\n`;

  // Tensor properties
  if (thought.tensorProperties) {
    ascii += 'Tensor Properties:\n';
    ascii += `  Rank: (${thought.tensorProperties.rank[0]}, ${thought.tensorProperties.rank[1]})\n`;
    ascii += `  Components: ${thought.tensorProperties.components}\n`;
    ascii += `  LaTeX: ${thought.tensorProperties.latex}\n`;
    ascii += `  Transformation: ${thought.tensorProperties.transformation}\n`;
    if (thought.tensorProperties.indexStructure) {
      ascii += `  Index Structure: ${thought.tensorProperties.indexStructure}\n`;
    }
    if (thought.tensorProperties.coordinateSystem) {
      ascii += `  Coordinate System: ${thought.tensorProperties.coordinateSystem}\n`;
    }
    if (thought.tensorProperties.symmetries.length > 0) {
      ascii += '  Symmetries:\n';
      thought.tensorProperties.symmetries.forEach((sym, index) => {
        ascii += `    ${index + 1}. ${sym}\n`;
      });
    }
    if (thought.tensorProperties.invariants.length > 0) {
      ascii += '  Invariants:\n';
      thought.tensorProperties.invariants.forEach((inv, index) => {
        ascii += `    ${index + 1}. ${inv}\n`;
      });
    }
    ascii += '\n';
  }

  // Physical interpretation
  if (thought.physicalInterpretation) {
    ascii += 'Physical Interpretation:\n';
    ascii += `  Quantity: ${thought.physicalInterpretation.quantity}\n`;
    ascii += `  Units: ${thought.physicalInterpretation.units}\n`;
    if (thought.physicalInterpretation.conservationLaws.length > 0) {
      ascii += '  Conservation Laws:\n';
      thought.physicalInterpretation.conservationLaws.forEach((law, index) => {
        ascii += `    ${index + 1}. ${law}\n`;
      });
    }
    if (thought.physicalInterpretation.constraints && thought.physicalInterpretation.constraints.length > 0) {
      ascii += '  Constraints:\n';
      thought.physicalInterpretation.constraints.forEach((constraint, index) => {
        ascii += `    ${index + 1}. ${constraint}\n`;
      });
    }
    if (thought.physicalInterpretation.observables && thought.physicalInterpretation.observables.length > 0) {
      ascii += '  Observables:\n';
      thought.physicalInterpretation.observables.forEach((obs, index) => {
        ascii += `    ${index + 1}. ${obs}\n`;
      });
    }
    ascii += '\n';
  }

  // Field theory context
  if (thought.fieldTheoryContext) {
    ascii += 'Field Theory Context:\n';
    ascii += `  Symmetry Group: ${thought.fieldTheoryContext.symmetryGroup}\n`;
    if (thought.fieldTheoryContext.fields.length > 0) {
      ascii += '  Fields:\n';
      thought.fieldTheoryContext.fields.forEach((field, index) => {
        ascii += `    ${index + 1}. ${field}\n`;
      });
    }
    if (thought.fieldTheoryContext.interactions.length > 0) {
      ascii += '  Interactions:\n';
      thought.fieldTheoryContext.interactions.forEach((interaction, index) => {
        ascii += `    ${index + 1}. ${interaction}\n`;
      });
    }
    if (thought.fieldTheoryContext.gaugeSymmetries && thought.fieldTheoryContext.gaugeSymmetries.length > 0) {
      ascii += '  Gauge Symmetries:\n';
      thought.fieldTheoryContext.gaugeSymmetries.forEach((gauge, index) => {
        ascii += `    ${index + 1}. ${gauge}\n`;
      });
    }
    ascii += '\n';
  }

  // Assumptions
  if (thought.assumptions && thought.assumptions.length > 0) {
    ascii += 'Assumptions:\n';
    thought.assumptions.forEach((assumption, index) => {
      ascii += `  ${index + 1}. ${assumption}\n`;
    });
    ascii += '\n';
  }

  // Dependencies
  if (thought.dependencies && thought.dependencies.length > 0) {
    ascii += 'Dependencies:\n';
    thought.dependencies.forEach((dep, index) => {
      ascii += `  ${index + 1}. ${dep}\n`;
    });
  }

  return ascii;
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

  let leftColumn = -4;
  let rightColumn = 4;
  let currentRow = -2;

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
