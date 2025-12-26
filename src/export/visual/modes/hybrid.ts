/**
 * Hybrid Visual Exporter (v8.5.0)
 * Phase 7 Sprint 2: Hybrid mode reasoning export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support, GraphML, TikZ
 * Phase 13 Sprint 6: Refactored to use fluent builder classes
 */

import type { HybridThought } from '../../../types/core.js';
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
 * Export hybrid reasoning to visual format
 */
export function exportHybridOrchestration(thought: HybridThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeMetrics = true } = options;
  const includeLabels = options.includeLabels !== false;

  switch (format) {
    case 'mermaid':
      return hybridToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return hybridToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return hybridToASCII(thought);
    case 'svg':
      return hybridToSVG(thought, options);
    case 'graphml':
      return hybridToGraphML(thought, options);
    case 'tikz':
      return hybridToTikZ(thought, options);
    case 'html':
      return hybridToHTML(thought, options);
    case 'modelica':
      return hybridToModelica(thought, options);
    case 'uml':
      return hybridToUML(thought, options);
    case 'json':
      return hybridToJSON(thought, options);
    case 'markdown':
      return hybridToMarkdown(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function hybridToMermaid(
  thought: HybridThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  const scheme = colorScheme as 'default' | 'pastel' | 'monochrome';
  const builder = new MermaidGraphBuilder().setDirection('TB');

  // Add hybrid mode node (central orchestrator)
  const hybridId = sanitizeId('hybrid_mode');
  builder.addNode({ id: hybridId, label: 'Hybrid Mode', shape: 'double-circle' });

  // Add primary mode
  const primaryId = sanitizeId(`primary_${thought.primaryMode}`);
  const primaryLabel = includeLabels ? thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1) : primaryId;
  builder.addNode({ id: primaryId, label: primaryLabel, shape: 'subroutine' });
  builder.addEdge({ source: hybridId, target: primaryId, style: 'thick' });

  // Add secondary features
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    const secondaryId = sanitizeId('secondary_features');
    builder.addNode({ id: secondaryId, label: 'Secondary Features', shape: 'stadium' });
    builder.addEdge({ source: hybridId, target: secondaryId });

    thought.secondaryFeatures.forEach((feature, index) => {
      const featureId = sanitizeId(`feature_${index}`);
      const featureLabel = includeLabels ? feature.slice(0, 30) + (feature.length > 30 ? '...' : '') : `Feature ${index + 1}`;
      builder.addNode({ id: featureId, label: featureLabel, shape: 'rectangle' });
      builder.addEdge({ source: secondaryId, target: featureId });
    });
  }

  // Add switch reason if present
  if (thought.switchReason) {
    const switchId = sanitizeId('switch_reason');
    const switchLabel = includeLabels
      ? thought.switchReason.slice(0, 40) + (thought.switchReason.length > 40 ? '...' : '')
      : 'Switch Reason';
    builder.addNode({ id: switchId, label: switchLabel, shape: 'asymmetric' });
    builder.addEdge({ source: hybridId, target: switchId, style: 'dotted' });
  }

  // Add stage if present (Shannon-style staging)
  if (thought.stage) {
    const stageId = sanitizeId(`stage_${thought.stage}`);
    const stageLabel = `Stage: ${thought.stage.replace(/_/g, ' ')}`;
    builder.addNode({ id: stageId, label: stageLabel, shape: 'hexagon' });
    builder.addEdge({ source: primaryId, target: stageId });
  }

  // Add mathematical model if present
  if (thought.mathematicalModel) {
    const modelId = sanitizeId('math_model');
    const modelLabel = thought.mathematicalModel.symbolic || 'Mathematical Model';
    builder.addNode({ id: modelId, label: modelLabel, shape: 'rectangle' });
    builder.addEdge({ source: primaryId, target: modelId });
  }

  // Add tensor properties if present
  if (thought.tensorProperties) {
    const tensorId = sanitizeId('tensor');
    const tensorLabel = `Tensor (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`;
    builder.addNode({ id: tensorId, label: tensorLabel, shape: 'parallelogram' });
    builder.addEdge({ source: primaryId, target: tensorId });
  }

  // Add physical interpretation if present
  if (thought.physicalInterpretation) {
    const physId = sanitizeId('physical');
    builder.addNode({ id: physId, label: thought.physicalInterpretation.quantity, shape: 'parallelogram' });
    builder.addEdge({ source: primaryId, target: physId });
  }

  // Add uncertainty metric
  if (includeMetrics && thought.uncertainty !== undefined) {
    const uncertId = sanitizeId('uncertainty');
    const uncertLabel = `Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%`;
    builder.addNode({ id: uncertId, label: uncertLabel, shape: 'hexagon' });
  }

  // Add assumptions
  if (thought.assumptions && thought.assumptions.length > 0) {
    const assumptionsId = sanitizeId('assumptions');
    builder.addNode({ id: assumptionsId, label: `Assumptions: ${thought.assumptions.length}`, shape: 'asymmetric' });
  }

  // Add dependencies
  if (thought.dependencies && thought.dependencies.length > 0) {
    const depsId = sanitizeId('dependencies');
    builder.addNode({ id: depsId, label: `Dependencies: ${thought.dependencies.length}`, shape: 'asymmetric' });
  }

  return builder.setOptions({ colorScheme: scheme }).render();
}

function hybridToDOT(
  thought: HybridThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  const builder = new DOTGraphBuilder()
    .setGraphName('HybridOrchestration')
    .setRankDir('TB')
    .setNodeDefaults({ shape: 'box', style: 'rounded' });

  // Hybrid mode node (central)
  const hybridId = sanitizeId('hybrid_mode');
  builder.addNode({ id: hybridId, label: 'Hybrid Mode', shape: 'doubleoctagon' });

  // Primary mode
  const primaryId = sanitizeId(`primary_${thought.primaryMode}`);
  const primaryLabel = thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1);
  builder.addNode({ id: primaryId, label: primaryLabel, shape: 'box', style: ['filled', 'rounded'], fillColor: 'lightblue' });
  builder.addEdge({ source: hybridId, target: primaryId, style: 'bold', penWidth: 2 });

  // Secondary features
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    const secondaryId = sanitizeId('secondary_features');
    builder.addNode({ id: secondaryId, label: 'Secondary Features', shape: 'ellipse' });
    builder.addEdge({ source: hybridId, target: secondaryId });

    thought.secondaryFeatures.forEach((feature, index) => {
      const featureId = sanitizeId(`feature_${index}`);
      const featureLabel = includeLabels ? feature.slice(0, 25) : `Feature ${index + 1}`;
      builder.addNode({ id: featureId, label: featureLabel });
      builder.addEdge({ source: secondaryId, target: featureId });
    });
  }

  // Switch reason
  if (thought.switchReason) {
    const switchId = sanitizeId('switch_reason');
    const switchLabel = includeLabels
      ? thought.switchReason.slice(0, 30)
      : 'Switch Reason';
    builder.addNode({ id: switchId, label: switchLabel, shape: 'note' });
    builder.addEdge({ source: hybridId, target: switchId, style: 'dashed' });
  }

  // Stage
  if (thought.stage) {
    const stageId = sanitizeId(`stage_${thought.stage}`);
    builder.addNode({ id: stageId, label: thought.stage.replace(/_/g, ' '), shape: 'diamond' });
    builder.addEdge({ source: primaryId, target: stageId });
  }

  // Mathematical model
  if (thought.mathematicalModel) {
    const modelId = sanitizeId('math_model');
    const modelLabel = thought.mathematicalModel.symbolic
      ? thought.mathematicalModel.symbolic.slice(0, 25)
      : 'Math Model';
    builder.addNode({ id: modelId, label: modelLabel, shape: 'parallelogram' });
    builder.addEdge({ source: primaryId, target: modelId });
  }

  // Tensor properties
  if (thought.tensorProperties) {
    const tensorId = sanitizeId('tensor');
    builder.addNode({ id: tensorId, label: `Tensor (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`, shape: 'parallelogram' });
    builder.addEdge({ source: primaryId, target: tensorId });
  }

  // Physical interpretation
  if (thought.physicalInterpretation) {
    const physId = sanitizeId('physical');
    builder.addNode({ id: physId, label: thought.physicalInterpretation.quantity, shape: 'parallelogram' });
    builder.addEdge({ source: primaryId, target: physId });
  }

  // Uncertainty
  if (includeMetrics && thought.uncertainty !== undefined) {
    const uncertId = sanitizeId('uncertainty');
    builder.addNode({ id: uncertId, label: `${(thought.uncertainty * 100).toFixed(1)}%`, shape: 'diamond' });
  }

  return builder.render();
}

function hybridToASCII(thought: HybridThought): string {
  const builder = new ASCIIDocBuilder()
    .addHeader('Hybrid Mode Orchestration', 'equals')
    .addEmptyLine();

  // Primary mode
  builder.addText(`Primary Mode: ${thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1)}`);

  // Stage
  if (thought.stage) {
    builder.addText(`Current Stage: ${thought.stage.replace(/_/g, ' ')}`);
  }

  // Uncertainty
  if (thought.uncertainty !== undefined) {
    builder.addText(`Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%`);
  }

  builder.addEmptyLine();

  // Switch reason
  if (thought.switchReason) {
    builder.addText(`Switch Reason: ${thought.switchReason}`).addEmptyLine();
  }

  // Secondary features
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    builder.addSection('Secondary Features').addEmptyLine();
    builder.addNumberedList(thought.secondaryFeatures).addEmptyLine();
  }

  // Mathematical model
  if (thought.mathematicalModel) {
    builder.addSection('Mathematical Model').addEmptyLine();
    builder.addText(`  LaTeX: ${thought.mathematicalModel.latex}`);
    builder.addText(`  Symbolic: ${thought.mathematicalModel.symbolic}`);
    if (thought.mathematicalModel.ascii) {
      builder.addText(`  ASCII: ${thought.mathematicalModel.ascii}`);
    }
    builder.addEmptyLine();
  }

  // Tensor properties
  if (thought.tensorProperties) {
    builder.addSection('Tensor Properties').addEmptyLine();
    builder.addText(`  Rank: (${thought.tensorProperties.rank[0]}, ${thought.tensorProperties.rank[1]})`);
    builder.addText(`  Components: ${thought.tensorProperties.components}`);
    builder.addText(`  Transformation: ${thought.tensorProperties.transformation}`);
    if (thought.tensorProperties.symmetries.length > 0) {
      builder.addText('  Symmetries:');
      thought.tensorProperties.symmetries.forEach((sym, index) => {
        builder.addText(`    ${index + 1}. ${sym}`);
      });
    }
    builder.addEmptyLine();
  }

  // Physical interpretation
  if (thought.physicalInterpretation) {
    builder.addSection('Physical Interpretation').addEmptyLine();
    builder.addText(`  Quantity: ${thought.physicalInterpretation.quantity}`);
    builder.addText(`  Units: ${thought.physicalInterpretation.units}`);
    if (thought.physicalInterpretation.conservationLaws.length > 0) {
      builder.addText('  Conservation Laws:');
      thought.physicalInterpretation.conservationLaws.forEach((law, index) => {
        builder.addText(`    ${index + 1}. ${law}`);
      });
    }
    builder.addEmptyLine();
  }

  // Assumptions
  if (thought.assumptions && thought.assumptions.length > 0) {
    builder.addSection('Assumptions').addEmptyLine();
    builder.addNumberedList(thought.assumptions).addEmptyLine();
  }

  // Dependencies
  if (thought.dependencies && thought.dependencies.length > 0) {
    builder.addSection('Dependencies').addEmptyLine();
    builder.addNumberedList(thought.dependencies).addEmptyLine();
  }

  // Revision reason
  if (thought.revisionReason) {
    builder.addText(`Revision Reason: ${thought.revisionReason}`);
  }

  return builder.render();
}

/**
 * Export hybrid reasoning to native SVG format
 */
function hybridToSVG(thought: HybridThought, options: VisualExportOptions): string {
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

  // Hybrid mode at the center
  positions.set('hybrid', {
    id: 'hybrid',
    label: 'Hybrid Mode',
    x: svgWidth / 2,
    y: 100,
    width: nodeWidth,
    height: nodeHeight,
    type: 'hybrid',
  });

  // Primary mode
  positions.set('primary', {
    id: 'primary',
    label: thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1),
    x: svgWidth / 2,
    y: 240,
    width: nodeWidth,
    height: nodeHeight,
    type: 'primary',
  });

  // Secondary features
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    thought.secondaryFeatures.forEach((feature, index) => {
      positions.set(`feature_${index}`, {
        id: `feature_${index}`,
        label: includeLabels ? feature.substring(0, 30) + (feature.length > 30 ? '...' : '') : `Feature ${index + 1}`,
        x: 150 + index * 180,
        y: 380,
        width: nodeWidth,
        height: nodeHeight,
        type: 'feature',
      });
    });
  }

  let svg = generateSVGHeader(svgWidth, svgHeight, 'Hybrid Mode Orchestration');

  // Render edges
  svg += '\n  <!-- Edges -->\n  <g class="edges">';

  const hybridPos = positions.get('hybrid');
  const primaryPos = positions.get('primary');

  if (hybridPos && primaryPos) {
    svg += renderEdge(hybridPos, primaryPos, { style: 'solid' });
  }

  // Edges from hybrid to features
  if (thought.secondaryFeatures) {
    thought.secondaryFeatures.forEach((_, index) => {
      const featurePos = positions.get(`feature_${index}`);
      if (hybridPos && featurePos) {
        svg += renderEdge(hybridPos, featurePos);
      }
    });
  }

  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';

  const hybridColors = getNodeColor('success', colorScheme);
  const primaryColors = getNodeColor('primary', colorScheme);
  const featureColors = getNodeColor('secondary', colorScheme);

  for (const [, pos] of positions) {
    if (pos.type === 'hybrid') {
      svg += renderEllipseNode(pos, hybridColors);
    } else if (pos.type === 'primary') {
      svg += renderStadiumNode(pos, primaryColors);
    } else if (pos.type === 'feature') {
      svg += renderRectNode(pos, featureColors);
    }
  }
  svg += '\n  </g>';

  // Render metrics panel
  if (includeMetrics) {
    const metrics = [
      { label: 'Primary Mode', value: thought.primaryMode },
      { label: 'Secondary Features', value: thought.secondaryFeatures?.length || 0 },
      { label: 'Uncertainty', value: thought.uncertainty !== undefined ? `${(thought.uncertainty * 100).toFixed(1)}%` : 'N/A' },
    ];
    svg += renderMetricsPanel(svgWidth - 200, svgHeight - 120, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Hybrid Mode', color: hybridColors, shape: 'ellipse' as const },
    { label: 'Primary Mode', color: primaryColors, shape: 'stadium' as const },
    { label: 'Secondary Feature', color: featureColors },
  ];
  svg += renderLegend(20, svgHeight - 110, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}

/**
 * Export hybrid orchestration to GraphML format
 */
function hybridToGraphML(thought: HybridThought, options: VisualExportOptions): string {
  const { includeLabels = true } = options;

  // Build nodes for hybrid orchestration
  const nodes: GraphMLNode[] = [];
  const edges: GraphMLEdge[] = [];

  // Central hybrid mode node
  nodes.push({
    id: sanitizeId('hybrid_mode'),
    label: includeLabels ? 'Hybrid Mode' : 'hybrid',
    type: 'hybrid',
  });

  // Primary mode node
  const primaryId = sanitizeId(`primary_${thought.primaryMode}`);
  nodes.push({
    id: primaryId,
    label: includeLabels ? thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1) : thought.primaryMode,
    type: 'primary',
  });

  // Edge from hybrid to primary
  edges.push({
    id: 'e_hybrid_primary',
    source: sanitizeId('hybrid_mode'),
    target: primaryId,
    directed: true,
  });

  // Secondary features
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    thought.secondaryFeatures.forEach((feature, index) => {
      const featureId = sanitizeId(`feature_${index}`);
      nodes.push({
        id: featureId,
        label: includeLabels ? feature.substring(0, 50) + (feature.length > 50 ? '...' : '') : `Feature ${index + 1}`,
        type: 'secondary',
      });

      // Edge from hybrid to feature
      edges.push({
        id: `e_hybrid_feature_${index}`,
        source: sanitizeId('hybrid_mode'),
        target: featureId,
        directed: true,
      });
    });
  }

  // Add stage node if present
  if (thought.stage) {
    const stageId = sanitizeId(`stage_${thought.stage}`);
    nodes.push({
      id: stageId,
      label: includeLabels ? thought.stage.replace(/_/g, ' ') : 'stage',
      type: 'stage',
    });

    edges.push({
      id: 'e_primary_stage',
      source: primaryId,
      target: stageId,
      directed: true,
    });
  }

  return generateGraphML(nodes, edges, {
    graphName: 'Hybrid Orchestration',
    directed: true,
    includeLabels,
  });
}

/**
 * Export hybrid orchestration to TikZ format
 */
function hybridToTikZ(thought: HybridThought, options: VisualExportOptions): string {
  const { includeLabels = true, colorScheme = 'default' } = options;

  // Build nodes for hybrid orchestration
  const nodes: TikZNode[] = [];
  const edges: TikZEdge[] = [];

  // Central hybrid mode node (top of orchestration)
  nodes.push({
    id: sanitizeId('hybrid_mode'),
    label: includeLabels ? 'Hybrid Mode' : 'hybrid',
    x: 4,
    y: 0,
    type: 'success',
    shape: 'ellipse',
  });

  // Primary mode node (below hybrid)
  const primaryId = sanitizeId(`primary_${thought.primaryMode}`);
  nodes.push({
    id: primaryId,
    label: includeLabels ? thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1) : thought.primaryMode,
    x: 4,
    y: -2,
    type: 'primary',
    shape: 'stadium',
  });

  // Edge from hybrid to primary
  edges.push({
    source: sanitizeId('hybrid_mode'),
    target: primaryId,
    directed: true,
  });

  // Secondary features (positioned horizontally below primary)
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    const featureCount = thought.secondaryFeatures.length;
    const spacing = 3;
    const totalWidth = (featureCount - 1) * spacing;
    const startX = 4 - totalWidth / 2;

    thought.secondaryFeatures.forEach((feature, index) => {
      const featureId = sanitizeId(`feature_${index}`);
      nodes.push({
        id: featureId,
        label: includeLabels ? (feature.length > 20 ? feature.substring(0, 20) + '...' : feature) : `F${index + 1}`,
        x: startX + index * spacing,
        y: -4,
        type: 'secondary',
        shape: 'rectangle',
      });

      // Edge from primary to feature
      edges.push({
        source: primaryId,
        target: featureId,
        directed: true,
      });
    });
  }

  // Add stage node if present
  if (thought.stage) {
    const stageId = sanitizeId(`stage_${thought.stage}`);
    nodes.push({
      id: stageId,
      label: includeLabels ? thought.stage.replace(/_/g, ' ') : 'stage',
      x: 7,
      y: -2,
      type: 'info',
      shape: 'diamond',
    });

    edges.push({
      source: primaryId,
      target: stageId,
      directed: true,
      style: 'dashed',
    });
  }

  return generateTikZ(nodes, edges, {
    title: 'Hybrid Orchestration',
    colorScheme,
    includeLabels,
  });
}

/**
 * Export hybrid orchestration to HTML format
 */
function hybridToHTML(thought: HybridThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Hybrid Mode Orchestration',
    htmlTheme = 'light',
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // Metrics
  html += '<div class="metrics-grid">';
  html += renderMetricCard('Primary Mode', thought.primaryMode, 'primary');
  if (thought.secondaryFeatures) {
    html += renderMetricCard('Secondary Features', thought.secondaryFeatures.length, 'info');
  }
  if (thought.uncertainty !== undefined) {
    html += renderMetricCard('Uncertainty', `${(thought.uncertainty * 100).toFixed(1)}%`, 'warning');
  }
  if (thought.stage) {
    html += renderMetricCard('Stage', thought.stage.replace(/_/g, ' '), 'secondary');
  }
  html += '</div>\n';

  // Badges
  const badges = [];
  badges.push(renderBadge(`Primary: ${thought.primaryMode}`, 'primary'));
  if (thought.stage) {
    badges.push(renderBadge(thought.stage.replace(/_/g, ' '), 'info'));
  }

  html += `<div class="flex gap-1 flex-wrap" style="margin: 1rem 0">${badges.join(' ')}</div>\n`;

  // Switch reason
  if (thought.switchReason) {
    html += renderSection('Mode Switch Reason', `
      <p>${escapeHTML(thought.switchReason)}</p>
    `, '🔄');
  }

  // Secondary features
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    const featuresContent = `
      <ul class="list-styled">
        ${thought.secondaryFeatures.map(f => `<li>${escapeHTML(f)}</li>`).join('')}
      </ul>
    `;
    html += renderSection('Secondary Features', featuresContent, '⚙️');
  }

  // Mathematical model
  if (thought.mathematicalModel) {
    const modelContent = `
      <p><strong>LaTeX:</strong> <code>${escapeHTML(thought.mathematicalModel.latex)}</code></p>
      <p><strong>Symbolic:</strong> <code>${escapeHTML(thought.mathematicalModel.symbolic)}</code></p>
      ${thought.mathematicalModel.ascii ? `<p><strong>ASCII:</strong> <code>${escapeHTML(thought.mathematicalModel.ascii)}</code></p>` : ''}
    `;
    html += renderSection('Mathematical Model', modelContent, '📐');
  }

  // Tensor properties
  if (thought.tensorProperties) {
    const tensorRows = [
      ['Rank', `(${thought.tensorProperties.rank[0]}, ${thought.tensorProperties.rank[1]})`],
      ['Components', thought.tensorProperties.components],
      ['Transformation', thought.tensorProperties.transformation],
    ];

    let tensorContent = renderTable(['Property', 'Value'], tensorRows);

    if (thought.tensorProperties.symmetries.length > 0) {
      tensorContent += '<p style="margin-top: 1rem"><strong>Symmetries:</strong></p>';
      tensorContent += '<ul class="list-styled">';
      thought.tensorProperties.symmetries.forEach(sym => {
        tensorContent += `<li>${escapeHTML(sym)}</li>`;
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

    html += renderSection('Physical Interpretation', interpContent, '⚛️');
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

  // Revision reason
  if (thought.revisionReason) {
    html += renderSection('Revision Reason', `
      <p>${escapeHTML(thought.revisionReason)}</p>
    `, '✏️');
  }

  html += generateHTMLFooter(htmlStandalone);
  return html;
}

/**
 * Export hybrid orchestration to Modelica format
 */
function hybridToModelica(thought: HybridThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;

  let modelica = '// Hybrid Mode Orchestration\n';
  modelica += '// Multi-mode reasoning orchestration package\n\n';

  const packageName = sanitizeModelicaId('HybridOrchestration');
  modelica += `package ${packageName}\n`;
  modelica += '  "Hybrid mode reasoning orchestration with primary and secondary features"\n\n';

  // Mode configuration record
  modelica += '  record ModeConfiguration\n';
  modelica += '    "Configuration for a reasoning mode"\n';
  modelica += '    String modeName "Name of the reasoning mode";\n';
  modelica += '    Real weight "Weight/importance in orchestration (0-1)";\n';
  modelica += '    Boolean isPrimary "Whether this is the primary mode";\n';
  modelica += '  end ModeConfiguration;\n\n';

  // Orchestrator model
  modelica += '  model Orchestrator\n';
  modelica += '    "Hybrid mode orchestration controller"\n\n';

  // Parameters
  modelica += '    // Mode configuration\n';
  const primaryMode = escapeModelicaString(thought.primaryMode);
  modelica += `    parameter String primaryMode = "${primaryMode}" "Primary reasoning mode";\n`;

  if (thought.stage) {
    const stage = escapeModelicaString(thought.stage.replace(/_/g, ' '));
    modelica += `    parameter String currentStage = "${stage}" "Current orchestration stage";\n`;
  }

  if (includeMetrics && thought.uncertainty !== undefined) {
    modelica += `    parameter Real uncertainty = ${thought.uncertainty.toFixed(4)} "Orchestration uncertainty (0-1)";\n`;
  }

  // Secondary features count
  const featureCount = thought.secondaryFeatures?.length || 0;
  modelica += `    parameter Integer secondaryCount = ${featureCount} "Number of secondary features";\n`;

  modelica += '\n    // Mode weights\n';
  modelica += '    parameter Real primaryWeight = 0.7 "Primary mode weight";\n';
  modelica += '    parameter Real secondaryWeight = 0.3 "Secondary features weight";\n\n';

  // Variables
  modelica += '    // State variables\n';
  modelica += '    Real orchestrationEfficiency(start=1.0) "Overall orchestration efficiency";\n';
  modelica += '    Real modeBalance "Balance between primary and secondary modes";\n';
  modelica += '    Boolean isActive(start=true) "Whether orchestration is active";\n\n';

  // Equations
  modelica += '  equation\n';
  modelica += '    // Orchestration efficiency decreases with uncertainty\n';
  if (thought.uncertainty !== undefined) {
    modelica += `    orchestrationEfficiency = 1.0 - ${thought.uncertainty.toFixed(4)};\n`;
  } else {
    modelica += '    orchestrationEfficiency = 1.0;\n';
  }
  modelica += '    \n';
  modelica += '    // Mode balance based on weights\n';
  modelica += '    modeBalance = primaryWeight / (primaryWeight + secondaryWeight);\n';
  modelica += '    \n';
  modelica += '    // Orchestration is active when efficiency is above threshold\n';
  modelica += '    isActive = orchestrationEfficiency > 0.5;\n\n';

  // Annotations
  modelica += '  annotation(\n';
  modelica += '    Documentation(info="<html>\n';
  modelica += `      <p>Hybrid mode orchestration combining ${primaryMode}`;
  if (featureCount > 0) {
    modelica += ` with ${featureCount} secondary features`;
  }
  modelica += '.</p>\n';

  if (thought.switchReason) {
    const switchReason = escapeModelicaString(thought.switchReason);
    modelica += `      <p><b>Switch Reason:</b> ${switchReason}</p>\n`;
  }

  if (thought.assumptions && thought.assumptions.length > 0) {
    modelica += '      <p><b>Assumptions:</b></p>\n';
    modelica += '      <ul>\n';
    thought.assumptions.forEach(assumption => {
      const escapedAssumption = escapeModelicaString(assumption);
      modelica += `        <li>${escapedAssumption}</li>\n`;
    });
    modelica += '      </ul>\n';
  }

  modelica += '    </html>")\n';
  modelica += '  );\n';
  modelica += '  end Orchestrator;\n\n';

  // Secondary features as separate components
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    modelica += '  // Secondary feature models\n';
    thought.secondaryFeatures.forEach((feature, index) => {
      const featureId = sanitizeModelicaId(`Feature${index + 1}`);
      const featureDesc = escapeModelicaString(feature.substring(0, 60));

      modelica += `  model ${featureId}\n`;
      modelica += `    "Secondary feature: ${featureDesc}"\n`;
      modelica += '    parameter Real contribution = 0.1 "Contribution to orchestration";\n';
      modelica += '    Real effectiveness "Feature effectiveness";\n';
      modelica += '  equation\n';
      modelica += '    effectiveness = contribution;\n';
      modelica += `  end ${featureId};\n\n`;
    });
  }

  // Mathematical model component if present
  if (thought.mathematicalModel) {
    modelica += '  model MathematicalModel\n';
    modelica += '    "Mathematical model integration"\n';
    const symbolicModel = escapeModelicaString(thought.mathematicalModel.symbolic || 'Unknown');
    modelica += `    parameter String symbolic = "${symbolicModel}" "Symbolic representation";\n`;
    if (thought.mathematicalModel.ascii) {
      const asciiModel = escapeModelicaString(thought.mathematicalModel.ascii);
      modelica += `    parameter String ascii = "${asciiModel}" "ASCII representation";\n`;
    }
    modelica += '  end MathematicalModel;\n\n';
  }

  // Tensor properties component if present
  if (thought.tensorProperties) {
    modelica += '  model TensorProperties\n';
    modelica += '    "Tensor analysis integration"\n';
    modelica += `    parameter Integer rank[2] = {${thought.tensorProperties.rank[0]}, ${thought.tensorProperties.rank[1]}} "Tensor rank";\n`;
    const components = escapeModelicaString(thought.tensorProperties.components);
    modelica += `    parameter String components = "${components}" "Tensor components";\n`;
    const transformation = escapeModelicaString(thought.tensorProperties.transformation);
    modelica += `    parameter String transformation = "${transformation}" "Transformation rule";\n`;
    modelica += '  end TensorProperties;\n\n';
  }

  // Physical interpretation component if present
  if (thought.physicalInterpretation) {
    modelica += '  model PhysicalInterpretation\n';
    modelica += '    "Physical meaning of reasoning"\n';
    const quantity = escapeModelicaString(thought.physicalInterpretation.quantity);
    modelica += `    parameter String quantity = "${quantity}" "Physical quantity";\n`;
    const units = escapeModelicaString(thought.physicalInterpretation.units);
    modelica += `    parameter String units = "${units}" "Measurement units";\n`;
    modelica += '  end PhysicalInterpretation;\n\n';
  }

  modelica += `end ${packageName};\n`;

  return modelica;
}

/**
 * Export hybrid orchestration to UML format
 */
function hybridToUML(thought: HybridThought, options: VisualExportOptions): string {
  const { includeLabels = true } = options;

  const nodes: UmlNode[] = [];
  const edges: UmlEdge[] = [];

  // Central hybrid orchestrator as a component
  nodes.push({
    id: 'hybrid',
    label: includeLabels ? 'Hybrid Orchestrator' : 'Hybrid',
    shape: 'component',
    stereotype: '<<orchestrator>>',
    attributes: [
      `primaryMode: ${thought.primaryMode}`,
      thought.stage ? `stage: ${thought.stage.replace(/_/g, ' ')}` : null,
      thought.uncertainty !== undefined ? `uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%` : null,
    ].filter(Boolean) as string[],
  });

  // Primary mode as a class
  const primaryId = sanitizeId(`primary_${thought.primaryMode}`);
  nodes.push({
    id: primaryId,
    label: includeLabels ? thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1) : thought.primaryMode,
    shape: 'class',
    stereotype: '<<primary>>',
    attributes: ['weight: 0.7'],
  });

  // Composition relationship from orchestrator to primary mode
  edges.push({
    source: 'hybrid',
    target: primaryId,
    type: 'composition',
    label: 'orchestrates',
  });

  // Secondary features as separate classes
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    thought.secondaryFeatures.forEach((feature, index) => {
      const featureId = sanitizeId(`feature_${index}`);
      nodes.push({
        id: featureId,
        label: includeLabels ? (feature.length > 30 ? feature.substring(0, 30) + '...' : feature) : `Feature${index + 1}`,
        shape: 'class',
        stereotype: '<<secondary>>',
        attributes: ['weight: 0.3'],
      });

      // Association from orchestrator to feature
      edges.push({
        source: 'hybrid',
        target: featureId,
        type: 'association',
        label: 'uses',
      });
    });
  }

  // Mathematical model as a package
  if (thought.mathematicalModel) {
    nodes.push({
      id: 'math_model',
      label: 'Mathematical Model',
      shape: 'package',
      attributes: [
        `symbolic: ${thought.mathematicalModel.symbolic}`,
        thought.mathematicalModel.ascii ? `ascii: ${thought.mathematicalModel.ascii.substring(0, 30)}` : null,
      ].filter(Boolean) as string[],
    });

    edges.push({
      source: primaryId,
      target: 'math_model',
      type: 'dependency',
      label: 'applies',
    });
  }

  // Tensor properties as an interface
  if (thought.tensorProperties) {
    nodes.push({
      id: 'tensor',
      label: 'Tensor Properties',
      shape: 'interface',
      attributes: [
        `rank: (${thought.tensorProperties.rank[0]}, ${thought.tensorProperties.rank[1]})`,
        `components: ${thought.tensorProperties.components}`,
      ],
    });

    edges.push({
      source: primaryId,
      target: 'tensor',
      type: 'implementation',
      label: 'implements',
    });
  }

  // Physical interpretation as a component
  if (thought.physicalInterpretation) {
    nodes.push({
      id: 'physical',
      label: 'Physical Interpretation',
      shape: 'component',
      attributes: [
        `quantity: ${thought.physicalInterpretation.quantity}`,
        `units: ${thought.physicalInterpretation.units}`,
      ],
    });

    edges.push({
      source: primaryId,
      target: 'physical',
      type: 'dependency',
      label: 'interprets',
    });
  }

  // Switch reason as a note
  if (thought.switchReason && includeLabels) {
    nodes.push({
      id: 'switch_note',
      label: 'Switch Reason',
      shape: 'rectangle',
      stereotype: '<<note>>',
      attributes: [thought.switchReason.substring(0, 50) + (thought.switchReason.length > 50 ? '...' : '')],
    });

    edges.push({
      source: 'hybrid',
      target: 'switch_note',
      type: 'dependency',
    });
  }

  return generateUmlDiagram(nodes, edges, {
    title: 'Hybrid Mode Orchestration',
    diagramType: 'component',
  });
}

/**
 * Export hybrid orchestration to JSON format
 */
function hybridToJSON(thought: HybridThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;

  // Create graph structure
  const graph = createJsonGraph('Hybrid Mode Orchestration', 'hybrid_orchestration', {
    includeMetrics,
    includeLegend: true,
    includeLayout: true,
  });

  // Add central hybrid mode node
  addNode(graph, {
    id: 'hybrid',
    label: 'Hybrid Mode',
    type: 'orchestrator',
    metadata: {
      primaryMode: thought.primaryMode,
      stage: thought.stage || null,
      uncertainty: thought.uncertainty,
      secondaryFeaturesCount: thought.secondaryFeatures?.length || 0,
    },
  });

  // Add primary mode node
  const primaryId = sanitizeId(`primary_${thought.primaryMode}`);
  addNode(graph, {
    id: primaryId,
    label: thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1),
    type: 'primary_mode',
    metadata: {
      name: thought.primaryMode,
      weight: 0.7,
    },
  });

  // Edge from hybrid to primary
  addEdge(graph, {
    id: 'e_hybrid_primary',
    source: 'hybrid',
    target: primaryId,
    label: 'orchestrates',
    type: 'primary',
    metadata: {
      strength: 1.0,
    },
  });

  // Add secondary features
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    thought.secondaryFeatures.forEach((feature, index) => {
      const featureId = sanitizeId(`feature_${index}`);
      addNode(graph, {
        id: featureId,
        label: `Feature ${index + 1}`,
        type: 'secondary_feature',
        metadata: {
          description: feature,
          index: index,
          weight: 0.3 / thought.secondaryFeatures!.length,
        },
      });

      addEdge(graph, {
        id: `e_hybrid_feature_${index}`,
        source: 'hybrid',
        target: featureId,
        label: 'uses',
        type: 'secondary',
        metadata: {
          strength: 0.5,
        },
      });
    });
  }

  // Add stage node if present
  if (thought.stage) {
    const stageId = sanitizeId(`stage_${thought.stage}`);
    addNode(graph, {
      id: stageId,
      label: thought.stage.replace(/_/g, ' '),
      type: 'stage',
      metadata: {
        name: thought.stage,
      },
    });

    addEdge(graph, {
      id: 'e_primary_stage',
      source: primaryId,
      target: stageId,
      label: 'in_stage',
      type: 'stage_flow',
    });
  }

  // Add mathematical model if present
  if (thought.mathematicalModel) {
    addNode(graph, {
      id: 'math_model',
      label: 'Mathematical Model',
      type: 'mathematical',
      metadata: {
        latex: thought.mathematicalModel.latex,
        symbolic: thought.mathematicalModel.symbolic,
        ascii: thought.mathematicalModel.ascii || null,
      },
    });

    addEdge(graph, {
      id: 'e_primary_math',
      source: primaryId,
      target: 'math_model',
      label: 'applies',
      type: 'transformation',
    });
  }

  // Add tensor properties if present
  if (thought.tensorProperties) {
    addNode(graph, {
      id: 'tensor',
      label: 'Tensor Properties',
      type: 'tensor',
      metadata: {
        rank: thought.tensorProperties.rank,
        components: thought.tensorProperties.components,
        transformation: thought.tensorProperties.transformation,
        symmetries: thought.tensorProperties.symmetries,
      },
    });

    addEdge(graph, {
      id: 'e_primary_tensor',
      source: primaryId,
      target: 'tensor',
      label: 'analyzes',
      type: 'analysis',
    });
  }

  // Add physical interpretation if present
  if (thought.physicalInterpretation) {
    addNode(graph, {
      id: 'physical',
      label: 'Physical Interpretation',
      type: 'physical',
      metadata: {
        quantity: thought.physicalInterpretation.quantity,
        units: thought.physicalInterpretation.units,
        conservationLaws: thought.physicalInterpretation.conservationLaws,
      },
    });

    addEdge(graph, {
      id: 'e_primary_physical',
      source: primaryId,
      target: 'physical',
      label: 'interprets',
      type: 'interpretation',
    });
  }

  // Add metrics if requested
  if (includeMetrics) {
    addMetric(graph, 'primary_mode', thought.primaryMode);
    addMetric(graph, 'secondary_features_count', thought.secondaryFeatures?.length || 0);

    if (thought.uncertainty !== undefined) {
      addMetric(graph, 'uncertainty', thought.uncertainty);
    }

    if (thought.stage) {
      addMetric(graph, 'stage', thought.stage);
    }

    if (thought.assumptions) {
      addMetric(graph, 'assumptions_count', thought.assumptions.length);
    }

    if (thought.dependencies) {
      addMetric(graph, 'dependencies_count', thought.dependencies.length);
    }
  }

  // Add legend items
  addLegendItem(graph, 'Hybrid Orchestrator', '#90EE90');
  addLegendItem(graph, 'Primary Mode', '#87CEEB');
  addLegendItem(graph, 'Secondary Feature', '#FFD700');

  if (thought.mathematicalModel) {
    addLegendItem(graph, 'Mathematical Model', '#DDA0DD');
  }

  if (thought.tensorProperties) {
    addLegendItem(graph, 'Tensor Properties', '#F0E68C');
  }

  if (thought.physicalInterpretation) {
    addLegendItem(graph, 'Physical Interpretation', '#98FB98');
  }

  return serializeGraph(graph);
}

/**
 * Export hybrid orchestration to Markdown format
 */
function hybridToMarkdown(thought: HybridThought, options: VisualExportOptions): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
    includeMetrics = true,
  } = options;

  const parts: string[] = [];

  // Overview section
  const overviewContent = keyValueSection({
    'Primary Mode': thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1),
    ...(thought.stage ? { 'Stage': thought.stage.replace(/_/g, ' ') } : {}),
    ...(thought.uncertainty !== undefined ? { 'Uncertainty': `${(thought.uncertainty * 100).toFixed(1)}%` } : {}),
  });
  parts.push(section('Overview', overviewContent));

  // Switch reason section
  if (thought.switchReason) {
    parts.push(section('Mode Switch Reason', thought.switchReason));
  }

  // Secondary features section
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    parts.push(section('Secondary Features', list(thought.secondaryFeatures)));
  }

  // Mathematical model section
  if (thought.mathematicalModel) {
    const mathContent = keyValueSection({
      'LaTeX': thought.mathematicalModel.latex,
      'Symbolic': thought.mathematicalModel.symbolic,
      ...(thought.mathematicalModel.ascii ? { 'ASCII': thought.mathematicalModel.ascii } : {}),
    });
    parts.push(section('Mathematical Model', mathContent));
  }

  // Tensor properties section
  if (thought.tensorProperties) {
    const tensorRows = [
      ['Rank', `(${thought.tensorProperties.rank[0]}, ${thought.tensorProperties.rank[1]})`],
      ['Components', thought.tensorProperties.components],
      ['Transformation', thought.tensorProperties.transformation],
    ];

    let tensorContent = table(['Property', 'Value'], tensorRows);

    if (thought.tensorProperties.symmetries.length > 0) {
      tensorContent += '\n\n**Symmetries:**\n\n' + list(thought.tensorProperties.symmetries);
    }

    parts.push(section('Tensor Properties', tensorContent));
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

    parts.push(section('Physical Interpretation', interpFull));
  }

  // Metrics section
  if (includeMetrics) {
    const metricsItems: Record<string, string | number> = {
      'Primary Mode': thought.primaryMode,
      'Secondary Features': thought.secondaryFeatures?.length || 0,
    };

    if (thought.uncertainty !== undefined) {
      metricsItems['Uncertainty'] = `${(thought.uncertainty * 100).toFixed(1)}%`;
    }

    if (thought.assumptions) {
      metricsItems['Assumptions'] = thought.assumptions.length;
    }

    if (thought.dependencies) {
      metricsItems['Dependencies'] = thought.dependencies.length;
    }

    parts.push(section('Metrics', keyValueSection(metricsItems)));
  }

  // Assumptions section
  if (thought.assumptions && thought.assumptions.length > 0) {
    parts.push(section('Assumptions', list(thought.assumptions)));
  }

  // Dependencies section
  if (thought.dependencies && thought.dependencies.length > 0) {
    parts.push(section('Dependencies', list(thought.dependencies)));
  }

  // Revision reason section
  if (thought.revisionReason) {
    parts.push(section('Revision Reason', thought.revisionReason));
  }

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaidDiagram = hybridToMermaid(thought, 'default', true, true);
    parts.push(section('Visualization', mermaidBlock(mermaidDiagram)));
  }

  return mdDocument('Hybrid Mode Orchestration', parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: {
      mode: 'hybrid',
      primaryMode: thought.primaryMode,
      secondaryFeatures: thought.secondaryFeatures?.length || 0,
    },
  });
}
