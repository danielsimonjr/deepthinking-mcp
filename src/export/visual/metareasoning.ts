/**
 * MetaReasoning Visual Exporter (v6.1.0)
 * Phase 7 Sprint 2: Meta-reasoning export to Mermaid, DOT, ASCII
 */

import type { MetaReasoningThought } from '../../types/modes/metareasoning.js';
import type { VisualExportOptions } from './types.js';
import { sanitizeId } from './utils.js';

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
