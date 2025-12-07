/**
 * MetaReasoning Visual Exporter (v7.0.3)
 * Phase 7 Sprint 2: Meta-reasoning export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 * Phase 9: Added GraphML and TikZ export support
 */

import type { MetaReasoningThought } from '../../types/modes/metareasoning.js';
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
  type TikZNode,
  type TikZEdge,
  type TikZOptions,
} from './tikz-utils.js';

/**
 * Export meta-reasoning to visual format
 */
export function exportMetaReasoningVisualization(thought: MetaReasoningThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return metaReasoningToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return metaReasoningToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return metaReasoningToASCII(thought);
    case 'svg':
      return metaReasoningToSVG(thought, options);
    case 'graphml':
      return metaReasoningToGraphML(thought, options);
    case 'tikz':
      return metaReasoningToTikZ(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function metaReasoningToMermaid(
  thought: MetaReasoningThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TB\n';

  // Meta-reasoning central node
  const metaId = sanitizeId('meta_reasoning');
  mermaid += `  ${metaId}((\"Meta-Reasoning\"))\n`;

  // Current strategy
  const currentId = sanitizeId('current_strategy');
  const currentLabel = includeLabels ? thought.currentStrategy.approach : 'Current Strategy';
  mermaid += `  ${currentId}[[\"${currentLabel}\"]]\n`;
  mermaid += `  ${metaId} ==> ${currentId}\n`;

  // Current mode
  const modeId = sanitizeId('current_mode');
  mermaid += `  ${modeId}([\"Mode: ${thought.currentStrategy.mode}\"])\n`;
  mermaid += `  ${currentId} --> ${modeId}\n`;

  // Strategy evaluation
  const evalId = sanitizeId('evaluation');
  mermaid += `  ${evalId}{{\"Effectiveness: ${(thought.strategyEvaluation.effectiveness * 100).toFixed(0)}%\"}}\n`;
  mermaid += `  ${currentId} --> ${evalId}\n`;

  // Issues (if any)
  if (thought.strategyEvaluation.issues.length > 0) {
    const issuesId = sanitizeId('issues');
    mermaid += `  ${issuesId}>\"Issues: ${thought.strategyEvaluation.issues.length}\"]\n`;
    mermaid += `  ${evalId} --> ${issuesId}\n`;
  }

  // Strengths (if any)
  if (thought.strategyEvaluation.strengths.length > 0) {
    const strengthsId = sanitizeId('strengths');
    mermaid += `  ${strengthsId}>\"Strengths: ${thought.strategyEvaluation.strengths.length}\"]\n`;
    mermaid += `  ${evalId} --> ${strengthsId}\n`;
  }

  // Alternative strategies
  if (thought.alternativeStrategies.length > 0) {
    const altsId = sanitizeId('alternatives');
    mermaid += `  ${altsId}([\"Alternative Strategies\"])\n`;
    mermaid += `  ${metaId} --> ${altsId}\n`;

    thought.alternativeStrategies.forEach((alt, index) => {
      const altId = sanitizeId(`alt_${index}`);
      const altLabel = includeLabels
        ? `${alt.mode}: ${(alt.recommendationScore * 100).toFixed(0)}%`
        : `Alt ${index + 1}`;
      mermaid += `  ${altId}[\"${altLabel}\"]\n`;
      mermaid += `  ${altsId} --> ${altId}\n`;
    });
  }

  // Recommendation
  const recId = sanitizeId('recommendation');
  const recLabel = `${thought.recommendation.action}${thought.recommendation.targetMode ? ` → ${thought.recommendation.targetMode}` : ''}`;
  mermaid += `  ${recId}[/\"${recLabel}\"/]\n`;
  mermaid += `  ${metaId} ==> ${recId}\n`;

  // Recommendation confidence
  if (includeMetrics) {
    const confId = sanitizeId('rec_confidence');
    mermaid += `  ${confId}{{\"Confidence: ${(thought.recommendation.confidence * 100).toFixed(0)}%\"}}\n`;
    mermaid += `  ${recId} --> ${confId}\n`;
  }

  // Quality metrics
  if (includeMetrics) {
    const qualityId = sanitizeId('quality');
    const qualityLabel = `Quality: ${(thought.qualityMetrics.overallQuality * 100).toFixed(0)}%`;
    mermaid += `  ${qualityId}{{\"${qualityLabel}\"}}\n`;
    mermaid += `  ${metaId} -.-> ${qualityId}\n`;
  }

  // Resource allocation
  const resourceId = sanitizeId('resources');
  mermaid += `  ${resourceId}[(\"Complexity: ${thought.resourceAllocation.complexityLevel}\")]\n`;
  mermaid += `  ${metaId} -.-> ${resourceId}\n`;

  // Session context
  const sessionId = sanitizeId('session');
  mermaid += `  ${sessionId}>\"Thoughts: ${thought.sessionContext.totalThoughts}\"]\n`;
  mermaid += `  ${metaId} -.-> ${sessionId}\n`;

  // Color scheme
  if (colorScheme !== 'monochrome') {
    const colors = colorScheme === 'pastel'
      ? { meta: '#f3e5f5', current: '#e3f2fd', rec: '#e8f5e9', alt: '#fff3e0' }
      : { meta: '#DDA0DD', current: '#87CEEB', rec: '#90EE90', alt: '#FFD700' };

    mermaid += `\n  style ${metaId} fill:${colors.meta}\n`;
    mermaid += `  style ${currentId} fill:${colors.current}\n`;
    mermaid += `  style ${recId} fill:${colors.rec}\n`;
    if (thought.alternativeStrategies.length > 0) {
      mermaid += `  style ${sanitizeId('alternatives')} fill:${colors.alt}\n`;
    }
  }

  return mermaid;
}

function metaReasoningToDOT(
  thought: MetaReasoningThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph MetaReasoning {\n';
  dot += '  rankdir=TB;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  // Subgraph for current strategy
  dot += '  subgraph cluster_current {\n';
  dot += '    label="Current Strategy";\n';
  dot += '    style=filled;\n';
  dot += '    fillcolor=lightblue;\n';

  const currentId = sanitizeId('current_strategy');
  const currentLabel = includeLabels
    ? thought.currentStrategy.approach.slice(0, 30).replace(/"/g, '\\"')
    : 'Current Strategy';
  dot += `    ${currentId} [label="${currentLabel}"];\n`;

  const modeId = sanitizeId('current_mode');
  dot += `    ${modeId} [label="${thought.currentStrategy.mode}", shape=ellipse];\n`;
  dot += `    ${currentId} -> ${modeId};\n`;

  // Evaluation metrics
  if (includeMetrics) {
    const evalId = sanitizeId('evaluation');
    dot += `    ${evalId} [label="Eff: ${(thought.strategyEvaluation.effectiveness * 100).toFixed(0)}%", shape=diamond];\n`;
    dot += `    ${currentId} -> ${evalId};\n`;
  }

  dot += '  }\n\n';

  // Subgraph for alternatives
  if (thought.alternativeStrategies.length > 0) {
    dot += '  subgraph cluster_alternatives {\n';
    dot += '    label="Alternatives";\n';
    dot += '    style=filled;\n';
    dot += '    fillcolor=lightyellow;\n';

    thought.alternativeStrategies.forEach((alt, index) => {
      const altId = sanitizeId(`alt_${index}`);
      const altLabel = `${alt.mode}\\n${(alt.recommendationScore * 100).toFixed(0)}%`;
      dot += `    ${altId} [label="${altLabel}"];\n`;
    });

    dot += '  }\n\n';
  }

  // Recommendation node
  const recId = sanitizeId('recommendation');
  const recLabel = `${thought.recommendation.action}${thought.recommendation.targetMode ? `\\n→ ${thought.recommendation.targetMode}` : ''}`;
  dot += `  ${recId} [label="${recLabel}", shape=hexagon, style="filled", fillcolor=lightgreen];\n`;

  // Quality metrics
  if (includeMetrics) {
    const qualityId = sanitizeId('quality');
    const qualityLabel = `Quality: ${(thought.qualityMetrics.overallQuality * 100).toFixed(0)}%`;
    dot += `  ${qualityId} [label="${qualityLabel}", shape=diamond];\n`;
  }

  // Edges
  dot += `  ${currentId} -> ${recId} [style=bold, penwidth=2];\n`;

  // Edges from alternatives to recommendation
  thought.alternativeStrategies.forEach((_, index) => {
    const altId = sanitizeId(`alt_${index}`);
    dot += `  ${altId} -> ${recId} [style=dashed];\n`;
  });

  dot += '}\n';
  return dot;
}

function metaReasoningToASCII(thought: MetaReasoningThought): string {
  let ascii = 'Meta-Reasoning Analysis:\n';
  ascii += '========================\n\n';

  // Current Strategy
  ascii += 'CURRENT STRATEGY\n';
  ascii += '----------------\n';
  ascii += `Mode: ${thought.currentStrategy.mode}\n`;
  ascii += `Approach: ${thought.currentStrategy.approach}\n`;
  ascii += `Thoughts Spent: ${thought.currentStrategy.thoughtsSpent}\n`;
  if (thought.currentStrategy.progressIndicators.length > 0) {
    ascii += 'Progress Indicators:\n';
    thought.currentStrategy.progressIndicators.forEach((ind, index) => {
      ascii += `  ${index + 1}. ${ind}\n`;
    });
  }
  ascii += '\n';

  // Strategy Evaluation
  ascii += 'STRATEGY EVALUATION\n';
  ascii += '-------------------\n';
  ascii += `Effectiveness: ${(thought.strategyEvaluation.effectiveness * 100).toFixed(1)}%\n`;
  ascii += `Efficiency: ${(thought.strategyEvaluation.efficiency * 100).toFixed(1)}%\n`;
  ascii += `Confidence: ${(thought.strategyEvaluation.confidence * 100).toFixed(1)}%\n`;
  ascii += `Progress Rate: ${thought.strategyEvaluation.progressRate.toFixed(2)} insights/thought\n`;
  ascii += `Quality Score: ${(thought.strategyEvaluation.qualityScore * 100).toFixed(1)}%\n`;

  if (thought.strategyEvaluation.strengths.length > 0) {
    ascii += 'Strengths:\n';
    thought.strategyEvaluation.strengths.forEach((s, index) => {
      ascii += `  + ${index + 1}. ${s}\n`;
    });
  }

  if (thought.strategyEvaluation.issues.length > 0) {
    ascii += 'Issues:\n';
    thought.strategyEvaluation.issues.forEach((issue, index) => {
      ascii += `  - ${index + 1}. ${issue}\n`;
    });
  }
  ascii += '\n';

  // Alternative Strategies
  if (thought.alternativeStrategies.length > 0) {
    ascii += 'ALTERNATIVE STRATEGIES\n';
    ascii += '----------------------\n';
    thought.alternativeStrategies.forEach((alt, index) => {
      ascii += `[${index + 1}] ${alt.mode}\n`;
      ascii += `    Reasoning: ${alt.reasoning}\n`;
      ascii += `    Expected Benefit: ${alt.expectedBenefit}\n`;
      ascii += `    Switching Cost: ${(alt.switchingCost * 100).toFixed(0)}%\n`;
      ascii += `    Recommendation Score: ${(alt.recommendationScore * 100).toFixed(0)}%\n`;
    });
    ascii += '\n';
  }

  // Recommendation
  ascii += 'RECOMMENDATION\n';
  ascii += '--------------\n';
  ascii += `Action: ${thought.recommendation.action}\n`;
  if (thought.recommendation.targetMode) {
    ascii += `Target Mode: ${thought.recommendation.targetMode}\n`;
  }
  ascii += `Justification: ${thought.recommendation.justification}\n`;
  ascii += `Confidence: ${(thought.recommendation.confidence * 100).toFixed(1)}%\n`;
  ascii += `Expected Improvement: ${thought.recommendation.expectedImprovement}\n`;
  ascii += '\n';

  // Resource Allocation
  ascii += 'RESOURCE ALLOCATION\n';
  ascii += '-------------------\n';
  ascii += `Time Spent: ${thought.resourceAllocation.timeSpent}ms\n`;
  ascii += `Thoughts Remaining: ${thought.resourceAllocation.thoughtsRemaining}\n`;
  ascii += `Complexity: ${thought.resourceAllocation.complexityLevel}\n`;
  ascii += `Urgency: ${thought.resourceAllocation.urgency}\n`;
  ascii += `Recommendation: ${thought.resourceAllocation.recommendation}\n`;
  ascii += '\n';

  // Quality Metrics
  ascii += 'QUALITY METRICS\n';
  ascii += '---------------\n';
  ascii += `Logical Consistency: ${(thought.qualityMetrics.logicalConsistency * 100).toFixed(1)}%\n`;
  ascii += `Evidence Quality: ${(thought.qualityMetrics.evidenceQuality * 100).toFixed(1)}%\n`;
  ascii += `Completeness: ${(thought.qualityMetrics.completeness * 100).toFixed(1)}%\n`;
  ascii += `Originality: ${(thought.qualityMetrics.originality * 100).toFixed(1)}%\n`;
  ascii += `Clarity: ${(thought.qualityMetrics.clarity * 100).toFixed(1)}%\n`;
  ascii += `Overall Quality: ${(thought.qualityMetrics.overallQuality * 100).toFixed(1)}%\n`;
  ascii += '\n';

  // Session Context
  ascii += 'SESSION CONTEXT\n';
  ascii += '---------------\n';
  ascii += `Session ID: ${thought.sessionContext.sessionId}\n`;
  ascii += `Total Thoughts: ${thought.sessionContext.totalThoughts}\n`;
  ascii += `Mode Switches: ${thought.sessionContext.modeSwitches}\n`;
  ascii += `Problem Type: ${thought.sessionContext.problemType}\n`;
  ascii += `Modes Used: ${thought.sessionContext.modesUsed.join(', ')}\n`;
  if (thought.sessionContext.historicalEffectiveness !== undefined) {
    ascii += `Historical Effectiveness: ${(thought.sessionContext.historicalEffectiveness * 100).toFixed(1)}%\n`;
  }

  return ascii;
}

/**
 * Export meta-reasoning to native SVG format
 */
function metaReasoningToSVG(thought: MetaReasoningThought, options: VisualExportOptions): string {
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

  // Meta-reasoning at the top center
  positions.set('meta', {
    id: 'meta',
    label: 'Meta-Reasoning',
    x: svgWidth / 2,
    y: 80,
    width: nodeWidth,
    height: nodeHeight,
    type: 'meta',
  });

  // Current strategy on the left
  positions.set('current', {
    id: 'current',
    label: includeLabels ? thought.currentStrategy.approach : 'Current Strategy',
    x: 200,
    y: 220,
    width: nodeWidth,
    height: nodeHeight,
    type: 'current',
  });

  // Recommendation on the right
  positions.set('recommendation', {
    id: 'recommendation',
    label: thought.recommendation.action,
    x: svgWidth - 200,
    y: 220,
    width: nodeWidth,
    height: nodeHeight,
    type: 'recommendation',
  });

  // Alternative strategies at the bottom
  if (thought.alternativeStrategies && thought.alternativeStrategies.length > 0) {
    thought.alternativeStrategies.forEach((alt, index) => {
      positions.set(`alt_${index}`, {
        id: `alt_${index}`,
        label: includeLabels ? `${alt.mode}: ${(alt.recommendationScore * 100).toFixed(0)}%` : `Alt ${index + 1}`,
        x: 150 + index * 180,
        y: 380,
        width: nodeWidth,
        height: nodeHeight,
        type: 'alternative',
      });
    });
  }

  let svg = generateSVGHeader(svgWidth, svgHeight, 'Meta-Reasoning Analysis');

  // Render edges
  svg += '\n  <!-- Edges -->\n  <g class="edges">';

  const metaPos = positions.get('meta');
  const currentPos = positions.get('current');
  const recPos = positions.get('recommendation');

  if (metaPos && currentPos) {
    svg += renderEdge(metaPos, currentPos, { style: 'solid' });
  }
  if (metaPos && recPos) {
    svg += renderEdge(metaPos, recPos, { style: 'solid' });
  }

  // Edges from meta to alternatives
  if (thought.alternativeStrategies) {
    thought.alternativeStrategies.forEach((_, index) => {
      const altPos = positions.get(`alt_${index}`);
      if (metaPos && altPos) {
        svg += renderEdge(metaPos, altPos, { style: 'dashed' });
      }
    });
  }

  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';

  const metaColors = getNodeColor('warning', colorScheme);
  const currentColors = getNodeColor('primary', colorScheme);
  const recColors = getNodeColor('success', colorScheme);
  const altColors = getNodeColor('secondary', colorScheme);

  for (const [, pos] of positions) {
    if (pos.type === 'meta') {
      svg += renderEllipseNode(pos, metaColors);
    } else if (pos.type === 'current') {
      svg += renderStadiumNode(pos, currentColors);
    } else if (pos.type === 'recommendation') {
      svg += renderStadiumNode(pos, recColors);
    } else if (pos.type === 'alternative') {
      svg += renderRectNode(pos, altColors);
    }
  }
  svg += '\n  </g>';

  // Render metrics panel
  if (includeMetrics) {
    const metrics = [
      { label: 'Effectiveness', value: `${(thought.strategyEvaluation.effectiveness * 100).toFixed(0)}%` },
      { label: 'Quality', value: `${(thought.qualityMetrics.overallQuality * 100).toFixed(0)}%` },
      { label: 'Alternatives', value: thought.alternativeStrategies.length },
      { label: 'Rec Confidence', value: `${(thought.recommendation.confidence * 100).toFixed(0)}%` },
    ];
    svg += renderMetricsPanel(svgWidth - 190, svgHeight - 140, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Meta-Reasoning', color: metaColors, shape: 'ellipse' as const },
    { label: 'Current Strategy', color: currentColors, shape: 'stadium' as const },
    { label: 'Recommendation', color: recColors, shape: 'stadium' as const },
    { label: 'Alternative', color: altColors },
  ];
  svg += renderLegend(20, svgHeight - 140, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}

/**
 * Export meta-reasoning to GraphML format
 */
function metaReasoningToGraphML(thought: MetaReasoningThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  const nodes: GraphMLNode[] = [];
  const edges: GraphMLEdge[] = [];

  // Meta-reasoning central node
  nodes.push({
    id: 'meta',
    label: 'Meta-Reasoning',
    type: 'meta',
  });

  // Current strategy node
  const currentLabel = includeLabels ? thought.currentStrategy.approach : 'Current Strategy';
  nodes.push({
    id: 'current_strategy',
    label: currentLabel,
    type: 'current',
    metadata: {
      mode: thought.currentStrategy.mode,
      thoughtsSpent: thought.currentStrategy.thoughtsSpent,
    },
  });

  edges.push({
    id: 'e_meta_current',
    source: 'meta',
    target: 'current_strategy',
    directed: true,
  });

  // Strategy evaluation node
  if (includeMetrics) {
    nodes.push({
      id: 'evaluation',
      label: `Effectiveness: ${(thought.strategyEvaluation.effectiveness * 100).toFixed(0)}%`,
      type: 'evaluation',
      metadata: {
        effectiveness: thought.strategyEvaluation.effectiveness,
        efficiency: thought.strategyEvaluation.efficiency,
        confidence: thought.strategyEvaluation.confidence,
        progressRate: thought.strategyEvaluation.progressRate,
        qualityScore: thought.strategyEvaluation.qualityScore,
      },
    });

    edges.push({
      id: 'e_current_eval',
      source: 'current_strategy',
      target: 'evaluation',
      directed: true,
    });

    // Issues node
    if (thought.strategyEvaluation.issues.length > 0) {
      nodes.push({
        id: 'issues',
        label: `Issues: ${thought.strategyEvaluation.issues.length}`,
        type: 'issue',
        metadata: {
          issues: thought.strategyEvaluation.issues,
        },
      });

      edges.push({
        id: 'e_eval_issues',
        source: 'evaluation',
        target: 'issues',
        directed: true,
      });
    }

    // Strengths node
    if (thought.strategyEvaluation.strengths.length > 0) {
      nodes.push({
        id: 'strengths',
        label: `Strengths: ${thought.strategyEvaluation.strengths.length}`,
        type: 'strength',
        metadata: {
          strengths: thought.strategyEvaluation.strengths,
        },
      });

      edges.push({
        id: 'e_eval_strengths',
        source: 'evaluation',
        target: 'strengths',
        directed: true,
      });
    }
  }

  // Alternative strategies
  if (thought.alternativeStrategies.length > 0) {
    thought.alternativeStrategies.forEach((alt, index) => {
      const altLabel = includeLabels
        ? `${alt.mode}: ${(alt.recommendationScore * 100).toFixed(0)}%`
        : `Alternative ${index + 1}`;

      nodes.push({
        id: `alt_${index}`,
        label: altLabel,
        type: 'alternative',
        metadata: {
          mode: alt.mode,
          reasoning: alt.reasoning,
          expectedBenefit: alt.expectedBenefit,
          switchingCost: alt.switchingCost,
          recommendationScore: alt.recommendationScore,
        },
      });

      edges.push({
        id: `e_meta_alt_${index}`,
        source: 'meta',
        target: `alt_${index}`,
        directed: true,
      });
    });
  }

  // Recommendation node
  const recLabel = `${thought.recommendation.action}${thought.recommendation.targetMode ? ` → ${thought.recommendation.targetMode}` : ''}`;
  nodes.push({
    id: 'recommendation',
    label: recLabel,
    type: 'recommendation',
    metadata: {
      action: thought.recommendation.action,
      targetMode: thought.recommendation.targetMode,
      justification: thought.recommendation.justification,
      confidence: thought.recommendation.confidence,
      expectedImprovement: thought.recommendation.expectedImprovement,
    },
  });

  edges.push({
    id: 'e_meta_rec',
    source: 'meta',
    target: 'recommendation',
    directed: true,
  });

  // Quality metrics node
  if (includeMetrics) {
    nodes.push({
      id: 'quality',
      label: `Quality: ${(thought.qualityMetrics.overallQuality * 100).toFixed(0)}%`,
      type: 'quality',
      metadata: {
        logicalConsistency: thought.qualityMetrics.logicalConsistency,
        evidenceQuality: thought.qualityMetrics.evidenceQuality,
        completeness: thought.qualityMetrics.completeness,
        originality: thought.qualityMetrics.originality,
        clarity: thought.qualityMetrics.clarity,
        overallQuality: thought.qualityMetrics.overallQuality,
      },
    });

    edges.push({
      id: 'e_meta_quality',
      source: 'meta',
      target: 'quality',
      directed: true,
    });
  }

  const graphmlOptions: GraphMLOptions = {
    graphName: 'MetaReasoning Visualization',
    directed: true,
    includeLabels,
  };

  return generateGraphML(nodes, edges, graphmlOptions);
}

/**
 * Export meta-reasoning to TikZ format
 */
function metaReasoningToTikZ(thought: MetaReasoningThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true, colorScheme = 'default' } = options;

  const nodes: TikZNode[] = [];
  const edges: TikZEdge[] = [];

  // Meta-reasoning central node at top
  nodes.push({
    id: 'meta',
    label: 'Meta-Reasoning',
    x: 0,
    y: 0,
    shape: 'ellipse',
    type: 'meta',
  });

  // Current strategy on the left
  const currentLabel = includeLabels ? thought.currentStrategy.approach : 'Current Strategy';
  nodes.push({
    id: 'current_strategy',
    label: currentLabel.substring(0, 30), // Truncate for readability
    x: -4,
    y: -2,
    shape: 'stadium',
    type: 'current',
  });

  edges.push({
    source: 'meta',
    target: 'current_strategy',
    directed: true,
  });

  // Recommendation on the right
  const recLabel = `${thought.recommendation.action}${thought.recommendation.targetMode ? ` → ${thought.recommendation.targetMode}` : ''}`;
  nodes.push({
    id: 'recommendation',
    label: recLabel.substring(0, 30),
    x: 4,
    y: -2,
    shape: 'stadium',
    type: 'recommendation',
  });

  edges.push({
    source: 'meta',
    target: 'recommendation',
    directed: true,
  });

  // Strategy evaluation
  if (includeMetrics) {
    nodes.push({
      id: 'evaluation',
      label: `Eff: ${(thought.strategyEvaluation.effectiveness * 100).toFixed(0)}%`,
      x: -4,
      y: -4,
      shape: 'diamond',
      type: 'evaluation',
    });

    edges.push({
      source: 'current_strategy',
      target: 'evaluation',
      directed: true,
    });
  }

  // Alternative strategies at the bottom
  if (thought.alternativeStrategies.length > 0) {
    const altCount = thought.alternativeStrategies.length;
    const spacing = 2.5;
    const totalWidth = (altCount - 1) * spacing;
    const offset = totalWidth / 2;

    thought.alternativeStrategies.forEach((alt, index) => {
      const altLabel = includeLabels
        ? `${alt.mode}: ${(alt.recommendationScore * 100).toFixed(0)}%`
        : `Alt ${index + 1}`;

      nodes.push({
        id: `alt_${index}`,
        label: altLabel,
        x: index * spacing - offset,
        y: -5,
        shape: 'rectangle',
        type: 'alternative',
      });

      edges.push({
        source: 'meta',
        target: `alt_${index}`,
        directed: true,
        style: 'dashed',
      });
    });
  }

  // Quality metrics
  if (includeMetrics) {
    nodes.push({
      id: 'quality',
      label: `Quality: ${(thought.qualityMetrics.overallQuality * 100).toFixed(0)}%`,
      x: 4,
      y: -4,
      shape: 'diamond',
      type: 'quality',
    });

    edges.push({
      source: 'meta',
      target: 'quality',
      directed: true,
      style: 'dashed',
    });
  }

  const tikzOptions: TikZOptions = {
    title: 'MetaReasoning Visualization',
    colorScheme,
    includeLabels,
  };

  return generateTikZ(nodes, edges, tikzOptions);
}
