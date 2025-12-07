/**
 * Hybrid Visual Exporter (v7.0.3)
 * Phase 7 Sprint 2: Hybrid mode reasoning export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support, GraphML, TikZ
 */

import type { HybridThought } from '../../types/core.js';
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
} from './graphml-utils.js';
import {
  generateTikZ,
  type TikZNode,
  type TikZEdge,
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
 * Export hybrid reasoning to visual format
 */
export function exportHybridOrchestration(thought: HybridThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

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
  let mermaid = 'graph TB\n';

  // Add hybrid mode node (central orchestrator)
  const hybridId = sanitizeId('hybrid_mode');
  mermaid += `  ${hybridId}((\"Hybrid Mode\"))\n`;

  // Add primary mode
  const primaryId = sanitizeId(`primary_${thought.primaryMode}`);
  const primaryLabel = includeLabels ? thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1) : primaryId;
  mermaid += `  ${primaryId}[[\"${primaryLabel}\"]]\n`;
  mermaid += `  ${hybridId} ==> ${primaryId}\n`;

  // Add secondary features
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    const secondaryId = sanitizeId('secondary_features');
    mermaid += `  ${secondaryId}([\"Secondary Features\"])\n`;
    mermaid += `  ${hybridId} --> ${secondaryId}\n`;

    thought.secondaryFeatures.forEach((feature, index) => {
      const featureId = sanitizeId(`feature_${index}`);
      const featureLabel = includeLabels ? feature.slice(0, 30) + (feature.length > 30 ? '...' : '') : `Feature ${index + 1}`;
      mermaid += `  ${featureId}[\"${featureLabel}\"]\n`;
      mermaid += `  ${secondaryId} --> ${featureId}\n`;
    });
  }

  // Add switch reason if present
  if (thought.switchReason) {
    const switchId = sanitizeId('switch_reason');
    const switchLabel = includeLabels
      ? thought.switchReason.slice(0, 40) + (thought.switchReason.length > 40 ? '...' : '')
      : 'Switch Reason';
    mermaid += `  ${switchId}>\"${switchLabel}\"]\n`;
    mermaid += `  ${hybridId} -.-> ${switchId}\n`;
  }

  // Add stage if present (Shannon-style staging)
  if (thought.stage) {
    const stageId = sanitizeId(`stage_${thought.stage}`);
    const stageLabel = thought.stage.replace(/_/g, ' ');
    mermaid += `  ${stageId}{{\"Stage: ${stageLabel}\"}}\n`;
    mermaid += `  ${primaryId} --> ${stageId}\n`;
  }

  // Add mathematical model if present
  if (thought.mathematicalModel) {
    const modelId = sanitizeId('math_model');
    const modelLabel = thought.mathematicalModel.symbolic || 'Mathematical Model';
    mermaid += `  ${modelId}[\"${modelLabel}\"]\n`;
    mermaid += `  ${primaryId} --> ${modelId}\n`;
  }

  // Add tensor properties if present
  if (thought.tensorProperties) {
    const tensorId = sanitizeId('tensor');
    const tensorLabel = `Tensor (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`;
    mermaid += `  ${tensorId}[/\"${tensorLabel}\"/]\n`;
    mermaid += `  ${primaryId} --> ${tensorId}\n`;
  }

  // Add physical interpretation if present
  if (thought.physicalInterpretation) {
    const physId = sanitizeId('physical');
    mermaid += `  ${physId}[/\"${thought.physicalInterpretation.quantity}\"/]\n`;
    mermaid += `  ${primaryId} --> ${physId}\n`;
  }

  // Add uncertainty metric
  if (includeMetrics && thought.uncertainty !== undefined) {
    const uncertId = sanitizeId('uncertainty');
    const uncertLabel = `Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%`;
    mermaid += `  ${uncertId}{{${uncertLabel}}}\n`;
  }

  // Add assumptions
  if (thought.assumptions && thought.assumptions.length > 0) {
    const assumptionsId = sanitizeId('assumptions');
    mermaid += `  ${assumptionsId}>\"Assumptions: ${thought.assumptions.length}\"]\n`;
  }

  // Add dependencies
  if (thought.dependencies && thought.dependencies.length > 0) {
    const depsId = sanitizeId('dependencies');
    mermaid += `  ${depsId}>\"Dependencies: ${thought.dependencies.length}\"]\n`;
  }

  // Color scheme
  if (colorScheme !== 'monochrome') {
    const colors = colorScheme === 'pastel'
      ? { hybrid: '#e8f4e8', primary: '#e3f2fd', secondary: '#fff3e0' }
      : { hybrid: '#90EE90', primary: '#87CEEB', secondary: '#FFD700' };

    mermaid += `\n  style ${hybridId} fill:${colors.hybrid}\n`;
    mermaid += `  style ${primaryId} fill:${colors.primary}\n`;
    if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
      mermaid += `  style ${sanitizeId('secondary_features')} fill:${colors.secondary}\n`;
    }
  }

  return mermaid;
}

function hybridToDOT(
  thought: HybridThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph HybridOrchestration {\n';
  dot += '  rankdir=TB;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  // Hybrid mode node (central)
  const hybridId = sanitizeId('hybrid_mode');
  dot += `  ${hybridId} [label="Hybrid Mode", shape=doubleoctagon];\n`;

  // Primary mode
  const primaryId = sanitizeId(`primary_${thought.primaryMode}`);
  const primaryLabel = thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1);
  dot += `  ${primaryId} [label="${primaryLabel}", shape=box, style="filled,rounded", fillcolor=lightblue];\n`;
  dot += `  ${hybridId} -> ${primaryId} [style=bold, penwidth=2];\n`;

  // Secondary features
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    const secondaryId = sanitizeId('secondary_features');
    dot += `  ${secondaryId} [label="Secondary Features", shape=ellipse];\n`;
    dot += `  ${hybridId} -> ${secondaryId};\n`;

    thought.secondaryFeatures.forEach((feature, index) => {
      const featureId = sanitizeId(`feature_${index}`);
      const featureLabel = includeLabels ? feature.slice(0, 25).replace(/"/g, '\\"') : `Feature ${index + 1}`;
      dot += `  ${featureId} [label="${featureLabel}"];\n`;
      dot += `  ${secondaryId} -> ${featureId};\n`;
    });
  }

  // Switch reason
  if (thought.switchReason) {
    const switchId = sanitizeId('switch_reason');
    const switchLabel = includeLabels
      ? thought.switchReason.slice(0, 30).replace(/"/g, '\\"')
      : 'Switch Reason';
    dot += `  ${switchId} [label="${switchLabel}", shape=note];\n`;
    dot += `  ${hybridId} -> ${switchId} [style=dashed];\n`;
  }

  // Stage
  if (thought.stage) {
    const stageId = sanitizeId(`stage_${thought.stage}`);
    dot += `  ${stageId} [label="${thought.stage.replace(/_/g, ' ')}", shape=diamond];\n`;
    dot += `  ${primaryId} -> ${stageId};\n`;
  }

  // Mathematical model
  if (thought.mathematicalModel) {
    const modelId = sanitizeId('math_model');
    const modelLabel = thought.mathematicalModel.symbolic
      ? thought.mathematicalModel.symbolic.slice(0, 25).replace(/"/g, '\\"')
      : 'Math Model';
    dot += `  ${modelId} [label="${modelLabel}", shape=parallelogram];\n`;
    dot += `  ${primaryId} -> ${modelId};\n`;
  }

  // Tensor properties
  if (thought.tensorProperties) {
    const tensorId = sanitizeId('tensor');
    dot += `  ${tensorId} [label="Tensor (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})", shape=parallelogram];\n`;
    dot += `  ${primaryId} -> ${tensorId};\n`;
  }

  // Physical interpretation
  if (thought.physicalInterpretation) {
    const physId = sanitizeId('physical');
    dot += `  ${physId} [label="${thought.physicalInterpretation.quantity}", shape=parallelogram];\n`;
    dot += `  ${primaryId} -> ${physId};\n`;
  }

  // Uncertainty
  if (includeMetrics && thought.uncertainty !== undefined) {
    const uncertId = sanitizeId('uncertainty');
    dot += `  ${uncertId} [label="${(thought.uncertainty * 100).toFixed(1)}%", shape=diamond];\n`;
  }

  dot += '}\n';
  return dot;
}

function hybridToASCII(thought: HybridThought): string {
  let ascii = 'Hybrid Mode Orchestration:\n';
  ascii += '==========================\n\n';

  // Primary mode
  ascii += `Primary Mode: ${thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1)}\n`;

  // Stage
  if (thought.stage) {
    ascii += `Current Stage: ${thought.stage.replace(/_/g, ' ')}\n`;
  }

  // Uncertainty
  if (thought.uncertainty !== undefined) {
    ascii += `Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%\n`;
  }

  ascii += '\n';

  // Switch reason
  if (thought.switchReason) {
    ascii += `Switch Reason: ${thought.switchReason}\n\n`;
  }

  // Secondary features
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    ascii += 'Secondary Features:\n';
    thought.secondaryFeatures.forEach((feature, index) => {
      ascii += `  ${index + 1}. ${feature}\n`;
    });
    ascii += '\n';
  }

  // Mathematical model
  if (thought.mathematicalModel) {
    ascii += 'Mathematical Model:\n';
    ascii += `  LaTeX: ${thought.mathematicalModel.latex}\n`;
    ascii += `  Symbolic: ${thought.mathematicalModel.symbolic}\n`;
    if (thought.mathematicalModel.ascii) {
      ascii += `  ASCII: ${thought.mathematicalModel.ascii}\n`;
    }
    ascii += '\n';
  }

  // Tensor properties
  if (thought.tensorProperties) {
    ascii += 'Tensor Properties:\n';
    ascii += `  Rank: (${thought.tensorProperties.rank[0]}, ${thought.tensorProperties.rank[1]})\n`;
    ascii += `  Components: ${thought.tensorProperties.components}\n`;
    ascii += `  Transformation: ${thought.tensorProperties.transformation}\n`;
    if (thought.tensorProperties.symmetries.length > 0) {
      ascii += '  Symmetries:\n';
      thought.tensorProperties.symmetries.forEach((sym, index) => {
        ascii += `    ${index + 1}. ${sym}\n`;
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
    ascii += '\n';
  }

  // Revision reason
  if (thought.revisionReason) {
    ascii += `Revision Reason: ${thought.revisionReason}\n`;
  }

  return ascii;
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
