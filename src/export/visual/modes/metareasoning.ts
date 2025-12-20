/**
 * MetaReasoning Visual Exporter (v7.0.3)
 * Phase 7 Sprint 2: Meta-reasoning export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 * Phase 9: Added GraphML and TikZ export support
 */

import type { MetaReasoningThought } from '../../../types/modes/metareasoning.js';
import type { VisualExportOptions } from '../types.js';
import { sanitizeId } from '../utils.js';
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
  progressBar,
} from '../utils/markdown.js';

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
    case 'html':
      return metaReasoningToHTML(thought, options);
    case 'modelica':
      return metaReasoningToModelica(thought, options);
    case 'uml':
      return metaReasoningToUML(thought, options);
    case 'json':
      return metaReasoningToJSON(thought, options);
    case 'markdown':
      return metaReasoningToMarkdown(thought, options);
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
  mermaid += `  ${metaId}(("Meta-Reasoning"))\n`;

  // Current strategy
  const currentId = sanitizeId('current_strategy');
  const currentLabel = includeLabels ? thought.currentStrategy.approach : 'Current Strategy';
  mermaid += `  ${currentId}[["${currentLabel}"]]\n`;
  mermaid += `  ${metaId} ==> ${currentId}\n`;

  // Current mode
  const modeId = sanitizeId('current_mode');
  mermaid += `  ${modeId}(["Mode: ${thought.currentStrategy.mode}"])\n`;
  mermaid += `  ${currentId} --> ${modeId}\n`;

  // Strategy evaluation
  const evalId = sanitizeId('evaluation');
  mermaid += `  ${evalId}{{"Effectiveness: ${(thought.strategyEvaluation.effectiveness * 100).toFixed(0)}%"}}\n`;
  mermaid += `  ${currentId} --> ${evalId}\n`;

  // Issues (if any)
  if (thought.strategyEvaluation.issues.length > 0) {
    const issuesId = sanitizeId('issues');
    mermaid += `  ${issuesId}>"Issues: ${thought.strategyEvaluation.issues.length}"]\n`;
    mermaid += `  ${evalId} --> ${issuesId}\n`;
  }

  // Strengths (if any)
  if (thought.strategyEvaluation.strengths.length > 0) {
    const strengthsId = sanitizeId('strengths');
    mermaid += `  ${strengthsId}>"Strengths: ${thought.strategyEvaluation.strengths.length}"]\n`;
    mermaid += `  ${evalId} --> ${strengthsId}\n`;
  }

  // Alternative strategies
  if (thought.alternativeStrategies.length > 0) {
    const altsId = sanitizeId('alternatives');
    mermaid += `  ${altsId}(["Alternative Strategies"])\n`;
    mermaid += `  ${metaId} --> ${altsId}\n`;

    thought.alternativeStrategies.forEach((alt, index) => {
      const altId = sanitizeId(`alt_${index}`);
      const altLabel = includeLabels
        ? `${alt.mode}: ${(alt.recommendationScore * 100).toFixed(0)}%`
        : `Alt ${index + 1}`;
      mermaid += `  ${altId}["${altLabel}"]\n`;
      mermaid += `  ${altsId} --> ${altId}\n`;
    });
  }

  // Recommendation
  const recId = sanitizeId('recommendation');
  const recLabel = `${thought.recommendation.action}${thought.recommendation.targetMode ? ` → ${thought.recommendation.targetMode}` : ''}`;
  mermaid += `  ${recId}[/"${recLabel}"/]\n`;
  mermaid += `  ${metaId} ==> ${recId}\n`;

  // Recommendation confidence
  if (includeMetrics) {
    const confId = sanitizeId('rec_confidence');
    mermaid += `  ${confId}{{"Confidence: ${(thought.recommendation.confidence * 100).toFixed(0)}%"}}\n`;
    mermaid += `  ${recId} --> ${confId}\n`;
  }

  // Quality metrics
  if (includeMetrics) {
    const qualityId = sanitizeId('quality');
    const qualityLabel = `Quality: ${(thought.qualityMetrics.overallQuality * 100).toFixed(0)}%`;
    mermaid += `  ${qualityId}{{"${qualityLabel}"}}\n`;
    mermaid += `  ${metaId} -.-> ${qualityId}\n`;
  }

  // Resource allocation
  const resourceId = sanitizeId('resources');
  mermaid += `  ${resourceId}[("Complexity: ${thought.resourceAllocation.complexityLevel}")]\n`;
  mermaid += `  ${metaId} -.-> ${resourceId}\n`;

  // Session context
  const sessionId = sanitizeId('session');
  mermaid += `  ${sessionId}>"Thoughts: ${thought.sessionContext.totalThoughts}"]\n`;
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
    ? thought.currentStrategy.approach.slice(0, 30).replace(/"/g, '\"')
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

/**
 * Export meta-reasoning to HTML format
 */
function metaReasoningToHTML(thought: MetaReasoningThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Meta-Reasoning Analysis',
    htmlTheme = 'light',
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // Metrics
  html += '<div class="metrics-grid">';
  html += renderMetricCard('Effectiveness', `${(thought.strategyEvaluation.effectiveness * 100).toFixed(0)}%`, 'primary');
  html += renderMetricCard('Quality', `${(thought.qualityMetrics.overallQuality * 100).toFixed(0)}%`, 'success');
  html += renderMetricCard('Alternatives', thought.alternativeStrategies.length, 'info');
  html += renderMetricCard('Confidence', `${(thought.recommendation.confidence * 100).toFixed(0)}%`, 'warning');
  html += '</div>\n';

  // Current strategy section
  const strategyContent = `
    <p><strong>Mode:</strong> ${renderBadge(thought.currentStrategy.mode, 'primary')}</p>
    <p><strong>Approach:</strong> ${escapeHTML(thought.currentStrategy.approach)}</p>
    <p><strong>Thoughts Spent:</strong> ${thought.currentStrategy.thoughtsSpent}</p>
    ${thought.currentStrategy.progressIndicators.length > 0 ? `
      <p style="margin-top: 1rem"><strong>Progress Indicators:</strong></p>
      <ul class="list-styled">
        ${thought.currentStrategy.progressIndicators.map(ind => `<li>${escapeHTML(ind)}</li>`).join('')}
      </ul>
    ` : ''}
  `;
  html += renderSection('Current Strategy', strategyContent, '🎯');

  // Strategy evaluation section
  const evalRows = [
    ['Effectiveness', `${(thought.strategyEvaluation.effectiveness * 100).toFixed(1)}%`],
    ['Efficiency', `${(thought.strategyEvaluation.efficiency * 100).toFixed(1)}%`],
    ['Confidence', `${(thought.strategyEvaluation.confidence * 100).toFixed(1)}%`],
    ['Progress Rate', `${thought.strategyEvaluation.progressRate.toFixed(2)} insights/thought`],
    ['Quality Score', `${(thought.strategyEvaluation.qualityScore * 100).toFixed(1)}%`],
  ];

  let evalContent = renderTable(['Metric', 'Value'], evalRows);

  // Add effectiveness progress bar
  evalContent += '<p style="margin-top: 1rem"><strong>Effectiveness:</strong></p>';
  evalContent += renderProgressBar(thought.strategyEvaluation.effectiveness * 100, 'primary');

  if (thought.strategyEvaluation.strengths.length > 0) {
    evalContent += '<p style="margin-top: 1rem"><strong>Strengths:</strong></p>';
    evalContent += '<ul class="list-styled">';
    thought.strategyEvaluation.strengths.forEach(s => {
      evalContent += `<li class="text-success">✓ ${escapeHTML(s)}</li>`;
    });
    evalContent += '</ul>';
  }

  if (thought.strategyEvaluation.issues.length > 0) {
    evalContent += '<p style="margin-top: 1rem"><strong>Issues:</strong></p>';
    evalContent += '<ul class="list-styled">';
    thought.strategyEvaluation.issues.forEach(issue => {
      evalContent += `<li class="text-danger">✗ ${escapeHTML(issue)}</li>`;
    });
    evalContent += '</ul>';
  }

  html += renderSection('Strategy Evaluation', evalContent, '📊');

  // Alternative strategies
  if (thought.alternativeStrategies.length > 0) {
    const altsContent = thought.alternativeStrategies.map(alt => `
      <div class="card">
        <div class="card-header">
          ${renderBadge(alt.mode, 'info')}
          ${renderBadge(`Score: ${(alt.recommendationScore * 100).toFixed(0)}%`, 'secondary')}
        </div>
        <p><strong>Reasoning:</strong> ${escapeHTML(alt.reasoning)}</p>
        <p><strong>Expected Benefit:</strong> ${escapeHTML(alt.expectedBenefit)}</p>
        <p><strong>Switching Cost:</strong></p>
        ${renderProgressBar(alt.switchingCost * 100, 'warning')}
        <p style="margin-top: 0.5rem"><strong>Recommendation Score:</strong></p>
        ${renderProgressBar(alt.recommendationScore * 100, 'success')}
      </div>
    `).join('');
    html += renderSection('Alternative Strategies', altsContent, '🔀');
  }

  // Recommendation section
  const recContent = `
    <p><strong>Action:</strong> ${renderBadge(thought.recommendation.action, 'warning')}</p>
    ${thought.recommendation.targetMode ? `<p><strong>Target Mode:</strong> ${renderBadge(thought.recommendation.targetMode, 'primary')}</p>` : ''}
    <p><strong>Justification:</strong> ${escapeHTML(thought.recommendation.justification)}</p>
    <p><strong>Expected Improvement:</strong> ${escapeHTML(thought.recommendation.expectedImprovement)}</p>
    <p style="margin-top: 1rem"><strong>Confidence:</strong></p>
    ${renderProgressBar(thought.recommendation.confidence * 100, 'success')}
  `;
  html += renderSection('Recommendation', recContent, '💡');

  // Resource allocation section
  const resourceRows = [
    ['Time Spent', `${thought.resourceAllocation.timeSpent}ms`],
    ['Thoughts Remaining', thought.resourceAllocation.thoughtsRemaining],
    ['Complexity Level', thought.resourceAllocation.complexityLevel],
    ['Urgency', thought.resourceAllocation.urgency],
  ];

  let resourceContent = renderTable(['Resource', 'Value'], resourceRows);
  resourceContent += `<p style="margin-top: 1rem"><strong>Recommendation:</strong> ${escapeHTML(thought.resourceAllocation.recommendation)}</p>`;

  html += renderSection('Resource Allocation', resourceContent, '⚡');

  // Quality metrics section
  const qualityRows = [
    ['Logical Consistency', `${(thought.qualityMetrics.logicalConsistency * 100).toFixed(1)}%`],
    ['Evidence Quality', `${(thought.qualityMetrics.evidenceQuality * 100).toFixed(1)}%`],
    ['Completeness', `${(thought.qualityMetrics.completeness * 100).toFixed(1)}%`],
    ['Originality', `${(thought.qualityMetrics.originality * 100).toFixed(1)}%`],
    ['Clarity', `${(thought.qualityMetrics.clarity * 100).toFixed(1)}%`],
    ['Overall Quality', `${(thought.qualityMetrics.overallQuality * 100).toFixed(1)}%`],
  ];

  let qualityContent = renderTable(['Metric', 'Value'], qualityRows);
  qualityContent += '<p style="margin-top: 1rem"><strong>Overall Quality:</strong></p>';
  qualityContent += renderProgressBar(thought.qualityMetrics.overallQuality * 100, 'success');

  html += renderSection('Quality Metrics', qualityContent, '⭐');

  // Session context section
  const sessionRows = [
    ['Session ID', thought.sessionContext.sessionId],
    ['Total Thoughts', thought.sessionContext.totalThoughts],
    ['Mode Switches', thought.sessionContext.modeSwitches],
    ['Problem Type', thought.sessionContext.problemType],
  ];

  if (thought.sessionContext.historicalEffectiveness !== undefined) {
    sessionRows.push(['Historical Effectiveness', `${(thought.sessionContext.historicalEffectiveness * 100).toFixed(1)}%`]);
  }

  let sessionContent = renderTable(['Property', 'Value'], sessionRows);

  if (thought.sessionContext.modesUsed.length > 0) {
    sessionContent += '<p style="margin-top: 1rem"><strong>Modes Used:</strong></p>';
    sessionContent += '<div class="flex gap-1 flex-wrap">';
    thought.sessionContext.modesUsed.forEach(mode => {
      sessionContent += renderBadge(mode, 'info');
      sessionContent += ' ';
    });
    sessionContent += '</div>';
  }

  html += renderSection('Session Context', sessionContent, '📋');

  html += generateHTMLFooter(htmlStandalone);
  return html;
}

/**
 * Export meta-reasoning to Modelica format
 */
function metaReasoningToModelica(thought: MetaReasoningThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;

  let modelica = 'package MetaReasoning\n';
  modelica += '  "Meta-reasoning analysis model for strategy evaluation and recommendation"\n\n';

  // Current strategy record
  modelica += '  record CurrentStrategy\n';
  modelica += '    "Current reasoning strategy being employed"\n';
  const modeId = sanitizeModelicaId(thought.currentStrategy.mode);
  modelica += `    parameter String mode = "${escapeModelicaString(modeId)}";\n`;
  modelica += `    parameter String approach = "${escapeModelicaString(thought.currentStrategy.approach)}";\n`;
  modelica += `    parameter Integer thoughtsSpent = ${thought.currentStrategy.thoughtsSpent};\n`;
  if (thought.currentStrategy.progressIndicators.length > 0) {
    modelica += `    parameter Integer progressIndicatorCount = ${thought.currentStrategy.progressIndicators.length};\n`;
  }
  modelica += '  end CurrentStrategy;\n\n';

  // Strategy evaluation record
  modelica += '  record StrategyEvaluation\n';
  modelica += '    "Evaluation metrics for current strategy"\n';
  modelica += `    parameter Real effectiveness(min=0.0, max=1.0) = ${thought.strategyEvaluation.effectiveness.toFixed(4)};\n`;
  modelica += `    parameter Real efficiency(min=0.0, max=1.0) = ${thought.strategyEvaluation.efficiency.toFixed(4)};\n`;
  modelica += `    parameter Real confidence(min=0.0, max=1.0) = ${thought.strategyEvaluation.confidence.toFixed(4)};\n`;
  modelica += `    parameter Real progressRate = ${thought.strategyEvaluation.progressRate.toFixed(4)};\n`;
  modelica += `    parameter Real qualityScore(min=0.0, max=1.0) = ${thought.strategyEvaluation.qualityScore.toFixed(4)};\n`;
  modelica += `    parameter Integer issueCount = ${thought.strategyEvaluation.issues.length};\n`;
  modelica += `    parameter Integer strengthCount = ${thought.strategyEvaluation.strengths.length};\n`;
  modelica += '  end StrategyEvaluation;\n\n';

  // Alternative strategies
  if (thought.alternativeStrategies.length > 0) {
    thought.alternativeStrategies.forEach((alt, index) => {
      modelica += `  record AlternativeStrategy${index + 1}\n`;
      modelica += `    "Alternative reasoning strategy option ${index + 1}"\n`;
      const altModeId = sanitizeModelicaId(alt.mode);
      modelica += `    parameter String mode = "${escapeModelicaString(altModeId)}";\n`;
      modelica += `    parameter String reasoning = "${escapeModelicaString(alt.reasoning)}";\n`;
      modelica += `    parameter String expectedBenefit = "${escapeModelicaString(alt.expectedBenefit)}";\n`;
      modelica += `    parameter Real switchingCost(min=0.0, max=1.0) = ${alt.switchingCost.toFixed(4)};\n`;
      modelica += `    parameter Real recommendationScore(min=0.0, max=1.0) = ${alt.recommendationScore.toFixed(4)};\n`;
      modelica += `  end AlternativeStrategy${index + 1};\n\n`;
    });
  }

  // Recommendation record
  modelica += '  record Recommendation\n';
  modelica += '    "Strategic recommendation from meta-reasoning"\n';
  modelica += `    parameter String action = "${escapeModelicaString(thought.recommendation.action)}";\n`;
  if (thought.recommendation.targetMode) {
    const targetModeId = sanitizeModelicaId(thought.recommendation.targetMode);
    modelica += `    parameter String targetMode = "${escapeModelicaString(targetModeId)}";\n`;
  }
  modelica += `    parameter String justification = "${escapeModelicaString(thought.recommendation.justification)}";\n`;
  modelica += `    parameter Real confidence(min=0.0, max=1.0) = ${thought.recommendation.confidence.toFixed(4)};\n`;
  modelica += `    parameter String expectedImprovement = "${escapeModelicaString(thought.recommendation.expectedImprovement)}";\n`;
  modelica += '  end Recommendation;\n\n';

  // Quality metrics
  if (includeMetrics) {
    modelica += '  record QualityMetrics\n';
    modelica += '    "Quality assessment metrics for reasoning session"\n';
    modelica += `    parameter Real logicalConsistency(min=0.0, max=1.0) = ${thought.qualityMetrics.logicalConsistency.toFixed(4)};\n`;
    modelica += `    parameter Real evidenceQuality(min=0.0, max=1.0) = ${thought.qualityMetrics.evidenceQuality.toFixed(4)};\n`;
    modelica += `    parameter Real completeness(min=0.0, max=1.0) = ${thought.qualityMetrics.completeness.toFixed(4)};\n`;
    modelica += `    parameter Real originality(min=0.0, max=1.0) = ${thought.qualityMetrics.originality.toFixed(4)};\n`;
    modelica += `    parameter Real clarity(min=0.0, max=1.0) = ${thought.qualityMetrics.clarity.toFixed(4)};\n`;
    modelica += `    parameter Real overallQuality(min=0.0, max=1.0) = ${thought.qualityMetrics.overallQuality.toFixed(4)};\n`;
    modelica += '  end QualityMetrics;\n\n';
  }

  // Resource allocation
  modelica += '  record ResourceAllocation\n';
  modelica += '    "Resource allocation and complexity assessment"\n';
  modelica += `    parameter Real timeSpent = ${thought.resourceAllocation.timeSpent};\n`;
  modelica += `    parameter Integer thoughtsRemaining = ${thought.resourceAllocation.thoughtsRemaining};\n`;
  modelica += `    parameter String complexityLevel = "${escapeModelicaString(thought.resourceAllocation.complexityLevel)}";\n`;
  modelica += `    parameter String urgency = "${escapeModelicaString(thought.resourceAllocation.urgency)}";\n`;
  modelica += `    parameter String recommendation = "${escapeModelicaString(thought.resourceAllocation.recommendation)}";\n`;
  modelica += '  end ResourceAllocation;\n\n';

  // Session context
  modelica += '  record SessionContext\n';
  modelica += '    "Session context and historical information"\n';
  modelica += `    parameter String sessionId = "${escapeModelicaString(thought.sessionContext.sessionId)}";\n`;
  modelica += `    parameter Integer totalThoughts = ${thought.sessionContext.totalThoughts};\n`;
  modelica += `    parameter Integer modeSwitches = ${thought.sessionContext.modeSwitches};\n`;
  modelica += `    parameter String problemType = "${escapeModelicaString(thought.sessionContext.problemType)}";\n`;
  modelica += `    parameter Integer modesUsedCount = ${thought.sessionContext.modesUsed.length};\n`;
  if (thought.sessionContext.historicalEffectiveness !== undefined) {
    modelica += `    parameter Real historicalEffectiveness(min=0.0, max=1.0) = ${thought.sessionContext.historicalEffectiveness.toFixed(4)};\n`;
  }
  modelica += '  end SessionContext;\n\n';

  // Main meta-reasoning model
  modelica += '  model MetaReasoningAnalysis\n';
  modelica += '    "Complete meta-reasoning analysis model"\n';
  modelica += '    CurrentStrategy currentStrategy;\n';
  modelica += '    StrategyEvaluation strategyEvaluation;\n';
  modelica += '    Recommendation recommendation;\n';
  if (includeMetrics) {
    modelica += '    QualityMetrics qualityMetrics;\n';
  }
  modelica += '    ResourceAllocation resourceAllocation;\n';
  modelica += '    SessionContext sessionContext;\n';

  if (thought.alternativeStrategies.length > 0) {
    thought.alternativeStrategies.forEach((_, index) => {
      modelica += `    AlternativeStrategy${index + 1} alternativeStrategy${index + 1};\n`;
    });
  }

  modelica += '  end MetaReasoningAnalysis;\n\n';
  modelica += 'end MetaReasoning;\n';

  return modelica;
}

/**
 * Export meta-reasoning to UML format
 */
function metaReasoningToUML(thought: MetaReasoningThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;

  const nodes: UmlNode[] = [];
  const edges: UmlEdge[] = [];

  // Main meta-reasoning class
  nodes.push({
    id: 'MetaReasoning',
    label: 'MetaReasoning',
    shape: 'class',
    attributes: [
      `mode: ${thought.currentStrategy.mode}`,
      `sessionId: ${thought.sessionContext.sessionId}`,
      `totalThoughts: ${thought.sessionContext.totalThoughts}`,
    ],
    methods: [
      'evaluateStrategy()',
      'generateRecommendation()',
      'allocateResources()',
    ],
  });

  // Current strategy class
  nodes.push({
    id: 'CurrentStrategy',
    label: 'CurrentStrategy',
    shape: 'class',
    attributes: [
      `mode: ${thought.currentStrategy.mode}`,
      `approach: ${thought.currentStrategy.approach.substring(0, 30)}...`,
      `thoughtsSpent: ${thought.currentStrategy.thoughtsSpent}`,
      `progressIndicators: ${thought.currentStrategy.progressIndicators.length}`,
    ],
  });

  edges.push({
    source: 'MetaReasoning',
    target: 'CurrentStrategy',
    label: 'employs',
    type: 'composition',
  });

  // Strategy evaluation class
  nodes.push({
    id: 'StrategyEvaluation',
    label: 'StrategyEvaluation',
    shape: 'class',
    attributes: [
      `effectiveness: ${(thought.strategyEvaluation.effectiveness * 100).toFixed(1)}%`,
      `efficiency: ${(thought.strategyEvaluation.efficiency * 100).toFixed(1)}%`,
      `confidence: ${(thought.strategyEvaluation.confidence * 100).toFixed(1)}%`,
      `progressRate: ${thought.strategyEvaluation.progressRate.toFixed(2)}`,
      `qualityScore: ${(thought.strategyEvaluation.qualityScore * 100).toFixed(1)}%`,
      `issues: ${thought.strategyEvaluation.issues.length}`,
      `strengths: ${thought.strategyEvaluation.strengths.length}`,
    ],
  });

  edges.push({
    source: 'MetaReasoning',
    target: 'StrategyEvaluation',
    label: 'evaluates',
    type: 'association',
  });

  // Recommendation class
  nodes.push({
    id: 'Recommendation',
    label: 'Recommendation',
    shape: 'class',
    attributes: [
      `action: ${thought.recommendation.action}`,
      thought.recommendation.targetMode ? `targetMode: ${thought.recommendation.targetMode}` : undefined,
      `confidence: ${(thought.recommendation.confidence * 100).toFixed(1)}%`,
      `justification: ${thought.recommendation.justification.substring(0, 40)}...`,
    ].filter(Boolean) as string[],
  });

  edges.push({
    source: 'MetaReasoning',
    target: 'Recommendation',
    label: 'produces',
    type: 'association',
  });

  // Alternative strategies
  if (thought.alternativeStrategies.length > 0) {
    // Create an interface for alternative strategies
    nodes.push({
      id: 'AlternativeStrategy',
      label: '<<interface>>\\nAlternativeStrategy',
      shape: 'interface',
      attributes: [
        'mode: ThinkingMode',
        'reasoning: string',
        'expectedBenefit: string',
        'switchingCost: number',
        'recommendationScore: number',
      ],
    });

    edges.push({
      source: 'MetaReasoning',
      target: 'AlternativeStrategy',
      label: `considers (${thought.alternativeStrategies.length})`,
      type: 'association',
    });

    // Add concrete alternative strategies
    thought.alternativeStrategies.slice(0, 3).forEach((alt, index) => {
      nodes.push({
        id: `Alt${index + 1}`,
        label: `${alt.mode}Strategy`,
        shape: 'class',
        attributes: [
          `score: ${(alt.recommendationScore * 100).toFixed(0)}%`,
          `cost: ${(alt.switchingCost * 100).toFixed(0)}%`,
        ],
      });

      edges.push({
        source: `Alt${index + 1}`,
        target: 'AlternativeStrategy',
        type: 'implementation',
      });
    });
  }

  // Quality metrics (if included)
  if (includeMetrics) {
    nodes.push({
      id: 'QualityMetrics',
      label: 'QualityMetrics',
      shape: 'class',
      attributes: [
        `logicalConsistency: ${(thought.qualityMetrics.logicalConsistency * 100).toFixed(1)}%`,
        `evidenceQuality: ${(thought.qualityMetrics.evidenceQuality * 100).toFixed(1)}%`,
        `completeness: ${(thought.qualityMetrics.completeness * 100).toFixed(1)}%`,
        `originality: ${(thought.qualityMetrics.originality * 100).toFixed(1)}%`,
        `clarity: ${(thought.qualityMetrics.clarity * 100).toFixed(1)}%`,
        `overallQuality: ${(thought.qualityMetrics.overallQuality * 100).toFixed(1)}%`,
      ],
    });

    edges.push({
      source: 'MetaReasoning',
      target: 'QualityMetrics',
      label: 'monitors',
      type: 'association',
    });
  }

  // Resource allocation
  nodes.push({
    id: 'ResourceAllocation',
    label: 'ResourceAllocation',
    shape: 'class',
    attributes: [
      `timeSpent: ${thought.resourceAllocation.timeSpent}ms`,
      `thoughtsRemaining: ${thought.resourceAllocation.thoughtsRemaining}`,
      `complexity: ${thought.resourceAllocation.complexityLevel}`,
      `urgency: ${thought.resourceAllocation.urgency}`,
    ],
  });

  edges.push({
    source: 'MetaReasoning',
    target: 'ResourceAllocation',
    label: 'manages',
    type: 'composition',
  });

  return generateUmlDiagram(nodes, edges, {
    title: 'MetaReasoning Structure',
    direction: 'top to bottom',
  });
}

/**
 * Export meta-reasoning to JSON format
 */
function metaReasoningToJSON(thought: MetaReasoningThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;

  const graph = createJsonGraph(
    'MetaReasoning',
    'Meta-reasoning analysis graph showing strategy evaluation and recommendations',
    { includeMetrics, includeLayout: true }
  );

  // Add central meta-reasoning node
  addNode(graph, {
    id: 'meta',
    label: 'Meta-Reasoning',
    type: 'meta',
    metadata: {
      mode: thought.currentStrategy.mode,
      sessionId: thought.sessionContext.sessionId,
    },
  });

  // Add current strategy node
  addNode(graph, {
    id: 'current_strategy',
    label: 'Current Strategy',
    type: 'strategy',
    metadata: {
      mode: thought.currentStrategy.mode,
      approach: thought.currentStrategy.approach,
      thoughtsSpent: thought.currentStrategy.thoughtsSpent,
      progressIndicatorCount: thought.currentStrategy.progressIndicators.length,
      progressIndicators: thought.currentStrategy.progressIndicators,
    },
  });

  addEdge(graph, {
    id: 'e_meta_current',
    source: 'meta',
    target: 'current_strategy',
    label: 'employs',
    metadata: {
      relationship: 'current',
    },
  });

  // Add strategy evaluation node
  addNode(graph, {
    id: 'evaluation',
    label: 'Strategy Evaluation',
    type: 'evaluation',
    metadata: {
      effectiveness: thought.strategyEvaluation.effectiveness,
      efficiency: thought.strategyEvaluation.efficiency,
      confidence: thought.strategyEvaluation.confidence,
      progressRate: thought.strategyEvaluation.progressRate,
      qualityScore: thought.strategyEvaluation.qualityScore,
      issueCount: thought.strategyEvaluation.issues.length,
      strengthCount: thought.strategyEvaluation.strengths.length,
      issues: thought.strategyEvaluation.issues,
      strengths: thought.strategyEvaluation.strengths,
    },
  });

  addEdge(graph, {
    id: 'e_current_eval',
    source: 'current_strategy',
    target: 'evaluation',
    label: 'evaluated_by',
  });

  // Add alternative strategies
  thought.alternativeStrategies.forEach((alt, index) => {
    addNode(graph, {
      id: `alt_${index}`,
      label: `Alternative: ${alt.mode}`,
      type: 'alternative',
      metadata: {
        mode: alt.mode,
        reasoning: alt.reasoning,
        expectedBenefit: alt.expectedBenefit,
        switchingCost: alt.switchingCost,
        recommendationScore: alt.recommendationScore,
      },
    });

    addEdge(graph, {
      id: `e_meta_alt_${index}`,
      source: 'meta',
      target: `alt_${index}`,
      label: 'considers',
      metadata: {
        score: alt.recommendationScore,
      },
    });
  });

  // Add recommendation node
  addNode(graph, {
    id: 'recommendation',
    label: 'Recommendation',
    type: 'recommendation',
    metadata: {
      action: thought.recommendation.action,
      targetMode: thought.recommendation.targetMode,
      justification: thought.recommendation.justification,
      confidence: thought.recommendation.confidence,
      expectedImprovement: thought.recommendation.expectedImprovement,
    },
  });

  addEdge(graph, {
    id: 'e_eval_rec',
    source: 'evaluation',
    target: 'recommendation',
    label: 'produces',
    metadata: {
      confidence: thought.recommendation.confidence,
    },
  });

  // Add quality metrics (if included)
  if (includeMetrics) {
    addNode(graph, {
      id: 'quality',
      label: 'Quality Metrics',
      type: 'metrics',
      metadata: {
        logicalConsistency: thought.qualityMetrics.logicalConsistency,
        evidenceQuality: thought.qualityMetrics.evidenceQuality,
        completeness: thought.qualityMetrics.completeness,
        originality: thought.qualityMetrics.originality,
        clarity: thought.qualityMetrics.clarity,
        overallQuality: thought.qualityMetrics.overallQuality,
      },
    });

    addEdge(graph, {
      id: 'e_meta_quality',
      source: 'meta',
      target: 'quality',
      label: 'monitors',
    });

    // Add overall metrics
    addMetric(graph, 'effectiveness', thought.strategyEvaluation.effectiveness);
    addMetric(graph, 'overallQuality', thought.qualityMetrics.overallQuality);
    addMetric(graph, 'recommendationConfidence', thought.recommendation.confidence);
  }

  // Add resource allocation node
  addNode(graph, {
    id: 'resources',
    label: 'Resource Allocation',
    type: 'resources',
    metadata: {
      timeSpent: thought.resourceAllocation.timeSpent,
      thoughtsRemaining: thought.resourceAllocation.thoughtsRemaining,
      complexityLevel: thought.resourceAllocation.complexityLevel,
      urgency: thought.resourceAllocation.urgency,
      recommendation: thought.resourceAllocation.recommendation,
    },
  });

  addEdge(graph, {
    id: 'e_meta_resources',
    source: 'meta',
    target: 'resources',
    label: 'manages',
  });

  // Add session context metadata
  graph.metadata = {
    ...graph.metadata,
    sessionContext: {
      sessionId: thought.sessionContext.sessionId,
      totalThoughts: thought.sessionContext.totalThoughts,
      modeSwitches: thought.sessionContext.modeSwitches,
      problemType: thought.sessionContext.problemType,
      modesUsed: thought.sessionContext.modesUsed,
      historicalEffectiveness: thought.sessionContext.historicalEffectiveness,
    },
  };

  return serializeGraph(graph);
}

/**
 * Export meta-reasoning to Markdown format
 */
function metaReasoningToMarkdown(thought: MetaReasoningThought, options: VisualExportOptions): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
    includeMetrics = true,
  } = options;

  const parts: string[] = [];

  // Current Strategy section
  const strategyContent = keyValueSection({
    'Mode': thought.currentStrategy.mode,
    'Approach': thought.currentStrategy.approach,
    'Thoughts Spent': thought.currentStrategy.thoughtsSpent,
  });

  let strategyFull = strategyContent;

  if (thought.currentStrategy.progressIndicators.length > 0) {
    strategyFull += '\n\n**Progress Indicators:**\n\n' + list(thought.currentStrategy.progressIndicators);
  }

  parts.push(section('Current Strategy', strategyFull));

  // Strategy Evaluation section
  if (includeMetrics) {
    const evalRows = [
      ['Effectiveness', `${(thought.strategyEvaluation.effectiveness * 100).toFixed(1)}%`],
      ['Efficiency', `${(thought.strategyEvaluation.efficiency * 100).toFixed(1)}%`],
      ['Confidence', `${(thought.strategyEvaluation.confidence * 100).toFixed(1)}%`],
      ['Progress Rate', `${thought.strategyEvaluation.progressRate.toFixed(2)} insights/thought`],
      ['Quality Score', `${(thought.strategyEvaluation.qualityScore * 100).toFixed(1)}%`],
    ];

    let evalContent = table(['Metric', 'Value'], evalRows);

    evalContent += '\n\n**Effectiveness:**\n\n' + progressBar(thought.strategyEvaluation.effectiveness * 100);

    if (thought.strategyEvaluation.strengths.length > 0) {
      evalContent += '\n\n**Strengths:**\n\n' + list(thought.strategyEvaluation.strengths.map(s => `✓ ${s}`));
    }

    if (thought.strategyEvaluation.issues.length > 0) {
      evalContent += '\n\n**Issues:**\n\n' + list(thought.strategyEvaluation.issues.map(i => `✗ ${i}`));
    }

    parts.push(section('Strategy Evaluation', evalContent));
  }

  // Alternative Strategies section
  if (thought.alternativeStrategies.length > 0) {
    const altRows = thought.alternativeStrategies.map(alt => [
      alt.mode,
      alt.reasoning.substring(0, 50) + (alt.reasoning.length > 50 ? '...' : ''),
      alt.expectedBenefit.substring(0, 40) + (alt.expectedBenefit.length > 40 ? '...' : ''),
      `${(alt.switchingCost * 100).toFixed(0)}%`,
      `${(alt.recommendationScore * 100).toFixed(0)}%`,
    ]);

    parts.push(section('Alternative Strategies', table(
      ['Mode', 'Reasoning', 'Expected Benefit', 'Switching Cost', 'Score'],
      altRows
    )));
  }

  // Recommendation section
  const recContent = keyValueSection({
    'Action': thought.recommendation.action,
    ...(thought.recommendation.targetMode ? { 'Target Mode': thought.recommendation.targetMode } : {}),
    'Confidence': `${(thought.recommendation.confidence * 100).toFixed(1)}%`,
    'Expected Improvement': thought.recommendation.expectedImprovement,
  });

  let recFull = recContent;
  recFull += '\n\n**Justification:**\n\n' + thought.recommendation.justification;
  recFull += '\n\n**Confidence Level:**\n\n' + progressBar(thought.recommendation.confidence * 100);

  parts.push(section('Recommendation', recFull));

  // Resource Allocation section
  const resourceContent = keyValueSection({
    'Time Spent': `${thought.resourceAllocation.timeSpent}ms`,
    'Thoughts Remaining': thought.resourceAllocation.thoughtsRemaining,
    'Complexity Level': thought.resourceAllocation.complexityLevel,
    'Urgency': thought.resourceAllocation.urgency,
    'Recommendation': thought.resourceAllocation.recommendation,
  });

  parts.push(section('Resource Allocation', resourceContent));

  // Quality Metrics section
  if (includeMetrics) {
    const qualityRows = [
      ['Logical Consistency', `${(thought.qualityMetrics.logicalConsistency * 100).toFixed(1)}%`],
      ['Evidence Quality', `${(thought.qualityMetrics.evidenceQuality * 100).toFixed(1)}%`],
      ['Completeness', `${(thought.qualityMetrics.completeness * 100).toFixed(1)}%`],
      ['Originality', `${(thought.qualityMetrics.originality * 100).toFixed(1)}%`],
      ['Clarity', `${(thought.qualityMetrics.clarity * 100).toFixed(1)}%`],
      ['Overall Quality', `${(thought.qualityMetrics.overallQuality * 100).toFixed(1)}%`],
    ];

    let qualityContent = table(['Metric', 'Value'], qualityRows);
    qualityContent += '\n\n**Overall Quality:**\n\n' + progressBar(thought.qualityMetrics.overallQuality * 100);

    parts.push(section('Quality Metrics', qualityContent));
  }

  // Session Context section
  const sessionContent = keyValueSection({
    'Session ID': thought.sessionContext.sessionId,
    'Total Thoughts': thought.sessionContext.totalThoughts,
    'Mode Switches': thought.sessionContext.modeSwitches,
    'Problem Type': thought.sessionContext.problemType,
    'Modes Used': thought.sessionContext.modesUsed.join(', '),
    ...(thought.sessionContext.historicalEffectiveness !== undefined
      ? { 'Historical Effectiveness': `${(thought.sessionContext.historicalEffectiveness * 100).toFixed(1)}%` }
      : {}),
  });

  parts.push(section('Session Context', sessionContent));

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaidDiagram = metaReasoningToMermaid(thought, 'default', true, true);
    parts.push(section('Visualization', mermaidBlock(mermaidDiagram)));
  }

  return mdDocument('Meta-Reasoning Analysis', parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: {
      mode: 'metareasoning',
      currentMode: thought.currentStrategy.mode,
      recommendedAction: thought.recommendation.action,
      overallQuality: thought.qualityMetrics.overallQuality,
    },
  });
}
