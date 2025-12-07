/**
 * Scientific Method Visual Exporter (v7.0.3)
 * Sprint 8 Task 8.1: Scientific method experiment export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support, GraphML, TikZ
 */

import type { ScientificMethodThought } from '../../types/index.js';
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

/**
 * Export scientific method experiment flow to visual format
 */
export function exportScientificMethodExperiment(thought: ScientificMethodThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return scientificMethodToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return scientificMethodToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return scientificMethodToASCII(thought);
    case 'svg':
      return scientificMethodToSVG(thought, options);
    case 'graphml':
      return scientificMethodToGraphML(thought, options);
    case 'tikz':
      return scientificMethodToTikZ(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function scientificMethodToMermaid(
  thought: ScientificMethodThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TD\n';

  if (thought.researchQuestion) {
    mermaid += `  RQ["Research Question: ${thought.researchQuestion.question.substring(0, 60)}..."]\n`;
    mermaid += '\n';
  }

  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    for (const hypothesis of thought.scientificHypotheses) {
      const hypId = sanitizeId(hypothesis.id);
      const label = includeLabels ? hypothesis.statement.substring(0, 50) + '...' : hypId;
      mermaid += `  ${hypId}["H: ${label}"]\n`;
      if (thought.researchQuestion) {
        mermaid += `  RQ --> ${hypId}\n`;
      }
    }
    mermaid += '\n';
  }

  if (thought.experiment) {
    mermaid += `  Exp["Experiment: ${thought.experiment.design}"]\n`;
    if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
      for (const hypothesis of thought.scientificHypotheses) {
        const hypId = sanitizeId(hypothesis.id);
        mermaid += `  ${hypId} --> Exp\n`;
      }
    }
    mermaid += '\n';
  }

  if (thought.data) {
    mermaid += `  Data["Data Collection: ${(thought.experiment as any)?.sampleSize || 0} samples"]\n`;
    if (thought.experiment) {
      mermaid += `  Exp --> Data\n`;
    }
    mermaid += '\n';
  }

  if (thought.analysis) {
    mermaid += `  Stats["Statistical Analysis"]\n`;
    if (thought.data) {
      mermaid += `  Data --> Stats\n`;
    }
    mermaid += '\n';
  }

  if (thought.conclusion) {
    const conclusionId = 'Conclusion';
    const supportLabel = includeMetrics && thought.conclusion.confidence
      ? ` (conf: ${thought.conclusion.confidence.toFixed(2)})`
      : '';
    mermaid += `  ${conclusionId}["Conclusion: ${thought.conclusion.statement.substring(0, 50)}...${supportLabel}"]\n`;
    if (thought.analysis) {
      mermaid += `  Stats --> ${conclusionId}\n`;
    }
  }

  if (colorScheme !== 'monochrome') {
    mermaid += '\n';
    const questionColor = colorScheme === 'pastel' ? '#fff3e0' : '#ffd699';
    const hypothesisColor = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
    const conclusionColor = colorScheme === 'pastel' ? '#e8f5e9' : '#a5d6a7';

    if (thought.researchQuestion) {
      mermaid += `  style RQ fill:${questionColor}\n`;
    }
    if (thought.scientificHypotheses) {
      for (const hypothesis of thought.scientificHypotheses) {
        const hypId = sanitizeId(hypothesis.id);
        mermaid += `  style ${hypId} fill:${hypothesisColor}\n`;
      }
    }
    if (thought.conclusion) {
      mermaid += `  style Conclusion fill:${conclusionColor}\n`;
    }
  }

  return mermaid;
}

function scientificMethodToDOT(
  thought: ScientificMethodThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph ScientificMethod {\n';
  dot += '  rankdir=TD;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  if (thought.researchQuestion) {
    const label = includeLabels ? thought.researchQuestion.question.substring(0, 60) + '...' : 'RQ';
    dot += `  RQ [label="Research Question:\\n${label}", shape=ellipse];\n\n`;
  }

  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    for (const hypothesis of thought.scientificHypotheses) {
      const hypId = sanitizeId(hypothesis.id);
      const label = includeLabels ? hypothesis.statement.substring(0, 50) + '...' : hypId;
      dot += `  ${hypId} [label="Hypothesis:\\n${label}"];\n`;
      if (thought.researchQuestion) {
        dot += `  RQ -> ${hypId};\n`;
      }
    }
    dot += '\n';
  }

  if (thought.experiment) {
    const label = includeLabels ? thought.experiment.design : 'Exp';
    dot += `  Exp [label="Experiment:\\n${label}"];\n`;
    if (thought.scientificHypotheses) {
      for (const hypothesis of thought.scientificHypotheses) {
        const hypId = sanitizeId(hypothesis.id);
        dot += `  ${hypId} -> Exp;\n`;
      }
    }
    dot += '\n';
  }

  if (thought.data) {
    const sampleLabel = includeMetrics ? `\\nSamples: ${(thought.experiment as any)?.sampleSize || 0}` : '';
    dot += `  Data [label="Data Collection${sampleLabel}"];\n`;
    if (thought.experiment) {
      dot += `  Exp -> Data;\n`;
    }
  }

  if (thought.analysis) {
    dot += `  Stats [label="Statistical Analysis"];\n`;
    if (thought.data) {
      dot += `  Data -> Stats;\n`;
    }
  }

  if (thought.conclusion) {
    const label = includeLabels ? thought.conclusion.statement.substring(0, 50) + '...' : 'Conclusion';
    const confLabel = includeMetrics && thought.conclusion.confidence
      ? `\\nconf: ${thought.conclusion.confidence.toFixed(2)}`
      : '';
    dot += `  Conclusion [label="Conclusion:\\n${label}${confLabel}", shape=doubleoctagon];\n`;
    if (thought.analysis) {
      dot += `  Stats -> Conclusion;\n`;
    }
  }

  dot += '}\n';
  return dot;
}

function scientificMethodToASCII(thought: ScientificMethodThought): string {
  let ascii = 'Scientific Method Process:\n';
  ascii += '==========================\n\n';

  if (thought.researchQuestion) {
    ascii += `Research Question: ${thought.researchQuestion.question}\n`;
    ascii += `Background: ${thought.researchQuestion.background}\n\n`;
  }

  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    ascii += 'Hypotheses:\n';
    for (const hypothesis of thought.scientificHypotheses) {
      const typeIcon = hypothesis.type === 'null' ? 'H₀' : 'H₁';
      ascii += `  ${typeIcon} ${hypothesis.statement}\n`;
      if (hypothesis.prediction) {
        ascii += `    Prediction: ${hypothesis.prediction}\n`;
      }
    }
    ascii += '\n';
  }

  if (thought.experiment) {
    ascii += `Experiment: ${thought.experiment.design}\n`;
    ascii += `Type: ${thought.experiment.type}\n`;
    ascii += `Design: ${thought.experiment.design}\n\n`;
  }

  if (thought.data) {
    ascii += 'Data Collection:\n';
    ascii += `  Sample Size: ${(thought.experiment as any)?.sampleSize || 0}\n`;
    ascii += `  Method: ${thought.data.method}\n`;
    if (thought.data.dataQuality) {
      ascii += `  Quality:\n`;
      ascii += `    Completeness: ${thought.data.dataQuality.completeness.toFixed(2)}\n`;
      ascii += `    Reliability: ${thought.data.dataQuality.reliability.toFixed(2)}\n`;
    }
    ascii += '\n';
  }

  if (thought.analysis && thought.analysis.tests) {
    ascii += 'Statistical Tests:\n';
    for (const test of thought.analysis.tests) {
      ascii += `  • ${test.name}\n`;
      ascii += `    p-value: ${test.pValue.toFixed(4)}, α: ${test.alpha}\n`;
      ascii += `    Result: ${test.result}\n`;
    }
    ascii += '\n';
  }

  if (thought.conclusion) {
    ascii += 'Conclusion:\n';
    ascii += `${thought.conclusion.statement}\n`;
    if ((thought.conclusion as any).supportedHypotheses) {
      ascii += `Supported hypotheses: ${(thought.conclusion as any).supportedHypotheses.join(', ')}\n`;
    }
    if (thought.conclusion.confidence) {
      ascii += `Confidence: ${thought.conclusion.confidence.toFixed(2)}\n`;
    }
  }

  return ascii;
}

/**
 * Export scientific method experiment flow to native SVG format
 */
function scientificMethodToSVG(thought: ScientificMethodThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
  } = options;

  const positions = new Map<string, SVGNodePosition>();
  const nodeWidth = 150;
  const nodeHeight = 40;
  const nodeSpacing = 120;
  let currentY = 80;

  // Research Question
  if (thought.researchQuestion) {
    positions.set('RQ', {
      id: 'RQ',
      label: includeLabels ? `RQ: ${thought.researchQuestion.question.substring(0, 40)}...` : 'Research Question',
      x: svgWidth / 2,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: 'question',
    });
    currentY += nodeSpacing;
  }

  // Hypotheses
  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    thought.scientificHypotheses.forEach((hypothesis) => {
      positions.set(hypothesis.id, {
        id: hypothesis.id,
        label: includeLabels ? `H: ${hypothesis.statement.substring(0, 30)}...` : hypothesis.id,
        x: svgWidth / 2,
        y: currentY,
        width: nodeWidth,
        height: nodeHeight,
        type: 'hypothesis',
      });
      currentY += nodeSpacing;
    });
  }

  // Experiment
  if (thought.experiment) {
    positions.set('Exp', {
      id: 'Exp',
      label: 'Experiment',
      x: svgWidth / 2,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: 'experiment',
    });
    currentY += nodeSpacing;
  }

  // Data
  if (thought.data) {
    positions.set('Data', {
      id: 'Data',
      label: 'Data Collection',
      x: svgWidth / 2,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: 'data',
    });
    currentY += nodeSpacing;
  }

  // Analysis
  if (thought.analysis) {
    positions.set('Stats', {
      id: 'Stats',
      label: 'Statistical Analysis',
      x: svgWidth / 2,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: 'analysis',
    });
    currentY += nodeSpacing;
  }

  // Conclusion
  if (thought.conclusion) {
    positions.set('Conclusion', {
      id: 'Conclusion',
      label: includeLabels ? `Conclusion: ${thought.conclusion.statement.substring(0, 30)}...` : 'Conclusion',
      x: svgWidth / 2,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: 'conclusion',
    });
  }

  const actualHeight = Math.max(DEFAULT_SVG_OPTIONS.height, currentY + 100);

  let svg = generateSVGHeader(svgWidth, actualHeight, 'Scientific Method Process');

  // Render edges (linear flow)
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  const nodeIds = ['RQ', ...thought.scientificHypotheses?.map(h => h.id) || [], 'Exp', 'Data', 'Stats', 'Conclusion'];
  for (let i = 0; i < nodeIds.length - 1; i++) {
    const fromPos = positions.get(nodeIds[i]);
    const toPos = positions.get(nodeIds[i + 1]);
    if (fromPos && toPos) {
      svg += renderEdge(fromPos, toPos);
    }
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';

  const questionColors = getNodeColor('tertiary', colorScheme);
  const hypothesisColors = getNodeColor('primary', colorScheme);
  const conclusionColors = getNodeColor('success', colorScheme);
  const neutralColors = getNodeColor('neutral', colorScheme);

  for (const [, pos] of positions) {
    if (pos.type === 'question') {
      svg += renderEllipseNode(pos, questionColors);
    } else if (pos.type === 'hypothesis') {
      svg += renderRectNode(pos, hypothesisColors);
    } else if (pos.type === 'conclusion') {
      svg += renderStadiumNode(pos, conclusionColors);
    } else {
      svg += renderRectNode(pos, neutralColors);
    }
  }
  svg += '\n  </g>';

  // Render metrics panel
  if (includeMetrics) {
    const metrics = [
      { label: 'Hypotheses', value: thought.scientificHypotheses?.length || 0 },
      { label: 'Confidence', value: thought.conclusion?.confidence?.toFixed(2) || 'N/A' },
    ];
    svg += renderMetricsPanel(svgWidth - 180, actualHeight - 110, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Research Question', color: questionColors, shape: 'ellipse' as const },
    { label: 'Hypothesis', color: hypothesisColors },
    { label: 'Conclusion', color: conclusionColors, shape: 'stadium' as const },
  ];
  svg += renderLegend(20, actualHeight - 110, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}

/**
 * Export scientific method experiment flow to GraphML format
 */
function scientificMethodToGraphML(thought: ScientificMethodThought, options: VisualExportOptions): string {
  const { includeLabels = true } = options;

  const nodes: GraphMLNode[] = [];
  const edges: GraphMLEdge[] = [];
  let edgeIndex = 0;

  const stages: Array<{ id: string; label: string; type: string; exists: boolean }> = [];

  // Research Question
  if (thought.researchQuestion) {
    stages.push({
      id: 'RQ',
      label: includeLabels ? `Research Question: ${thought.researchQuestion.question.substring(0, 60)}...` : 'Research Question',
      type: 'question',
      exists: true,
    });
  }

  // Hypothesis (simplified - take first one or summarize)
  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    const hypLabel = includeLabels
      ? `Hypothesis: ${thought.scientificHypotheses[0].statement.substring(0, 60)}...`
      : 'Hypothesis';
    stages.push({
      id: 'Hypothesis',
      label: hypLabel,
      type: 'hypothesis',
      exists: true,
    });
  }

  // Experiment
  if (thought.experiment) {
    stages.push({
      id: 'Experiment',
      label: includeLabels ? `Experiment: ${thought.experiment.design}` : 'Experiment',
      type: 'experiment',
      exists: true,
    });
  }

  // Data Collection
  if (thought.data) {
    const sampleSize = (thought.experiment as any)?.sampleSize || 0;
    stages.push({
      id: 'Data',
      label: includeLabels ? `Data Collection: ${sampleSize} samples` : 'Data Collection',
      type: 'data',
      exists: true,
    });
  }

  // Statistical Analysis
  if (thought.analysis) {
    stages.push({
      id: 'Analysis',
      label: 'Statistical Analysis',
      type: 'analysis',
      exists: true,
    });
  }

  // Conclusion
  if (thought.conclusion) {
    const confLabel = thought.conclusion.confidence
      ? ` (confidence: ${thought.conclusion.confidence.toFixed(2)})`
      : '';
    stages.push({
      id: 'Conclusion',
      label: includeLabels
        ? `Conclusion: ${thought.conclusion.statement.substring(0, 60)}...${confLabel}`
        : 'Conclusion',
      type: 'conclusion',
      exists: true,
    });
  }

  // Create nodes
  for (const stage of stages) {
    nodes.push({
      id: stage.id,
      label: stage.label,
      type: stage.type,
    });
  }

  // Create linear flow edges
  for (let i = 0; i < stages.length - 1; i++) {
    edges.push({
      id: `e${edgeIndex++}`,
      source: stages[i].id,
      target: stages[i + 1].id,
      directed: true,
    });
  }

  return generateGraphML(nodes, edges, {
    graphName: 'Scientific Method Experiment',
    directed: true,
    includeLabels,
  });
}

/**
 * Export scientific method experiment flow to TikZ format
 */
function scientificMethodToTikZ(thought: ScientificMethodThought, options: VisualExportOptions): string {
  const { includeLabels = true, colorScheme = 'default' } = options;

  const nodes: TikZNode[] = [];
  const edges: TikZEdge[] = [];
  let xPosition = 0;
  const xSpacing = 3;

  const stages: Array<{ id: string; label: string; type: string; shape?: TikZNode['shape'] }> = [];

  // Research Question
  if (thought.researchQuestion) {
    stages.push({
      id: 'RQ',
      label: includeLabels ? 'Research\nQuestion' : 'RQ',
      type: 'tertiary',
      shape: 'ellipse',
    });
  }

  // Hypothesis (simplified - just note we have hypotheses)
  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    stages.push({
      id: 'Hypothesis',
      label: includeLabels ? `Hypothesis\n(${thought.scientificHypotheses.length})` : 'H',
      type: 'info',
      shape: 'rectangle',
    });
  }

  // Experiment
  if (thought.experiment) {
    stages.push({
      id: 'Experiment',
      label: 'Experiment',
      type: 'neutral',
      shape: 'rectangle',
    });
  }

  // Data Collection
  if (thought.data) {
    stages.push({
      id: 'Data',
      label: 'Data\nCollection',
      type: 'neutral',
      shape: 'rectangle',
    });
  }

  // Statistical Analysis
  if (thought.analysis) {
    stages.push({
      id: 'Analysis',
      label: 'Statistical\nAnalysis',
      type: 'primary',
      shape: 'rectangle',
    });
  }

  // Conclusion
  if (thought.conclusion) {
    stages.push({
      id: 'Conclusion',
      label: 'Conclusion',
      type: 'success',
      shape: 'stadium',
    });
  }

  // Create nodes with horizontal positioning
  for (const stage of stages) {
    nodes.push({
      id: stage.id,
      label: stage.label,
      x: xPosition,
      y: 0,
      type: stage.type,
      shape: stage.shape || 'rectangle',
    });
    xPosition += xSpacing;
  }

  // Create edges between consecutive stages
  for (let i = 0; i < stages.length - 1; i++) {
    edges.push({
      source: stages[i].id,
      target: stages[i + 1].id,
      directed: true,
    });
  }

  return generateTikZ(nodes, edges, {
    title: 'Scientific Method Experiment',
    colorScheme,
    includeLabels,
  });
}
