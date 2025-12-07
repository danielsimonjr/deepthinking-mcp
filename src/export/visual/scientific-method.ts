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
import {
  generateHTMLHeader,
  generateHTMLFooter,
  escapeHTML,
  renderMetricCard,
  renderSection,
  renderTable,
  renderBadge,
} from './html-utils.js';
import {
  escapeModelicaString,
} from './modelica-utils.js';
import {
  generateActivityDiagram,
} from './uml-utils.js';
import {
  createJsonGraph,
  addNode,
  addEdge,
  addMetric,
  serializeGraph,
} from './json-utils.js';
import {
  section,
  table,
  list,
  keyValueSection,
  mermaidBlock,
  document as mdDocument,
} from './markdown-utils.js';

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
    case 'html':
      return scientificMethodToHTML(thought, options);
    case 'modelica':
      return scientificMethodToModelica(thought, options);
    case 'uml':
      return scientificMethodToUML(thought, options);
    case 'json':
      return scientificMethodToJSON(thought, options);
    case 'markdown':
      return scientificMethodToMarkdown(thought, options);
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

/**
 * Export scientific method experiment flow to HTML format
 */
function scientificMethodToHTML(thought: ScientificMethodThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Scientific Method Analysis',
    htmlTheme = 'light',
    includeMetrics = true,
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // Research Question
  if (thought.researchQuestion) {
    const questionContent = `
      <p><strong>Question:</strong> ${escapeHTML(thought.researchQuestion.question)}</p>
      <p><strong>Background:</strong> ${escapeHTML(thought.researchQuestion.background)}</p>
      ${thought.researchQuestion.significance ? `<p><strong>Significance:</strong> ${escapeHTML(thought.researchQuestion.significance)}</p>` : ''}
    `;
    html += renderSection('Research Question', questionContent, '❓');
  }

  // Metrics
  if (includeMetrics) {
    html += '<div class="metrics-grid">\n';
    html += renderMetricCard('Hypotheses', thought.scientificHypotheses?.length || 0, 'primary');
    html += renderMetricCard('Tests', thought.analysis?.tests?.length || 0, 'info');
    html += renderMetricCard('Confidence', thought.conclusion?.confidence?.toFixed(2) || 'N/A', 'success');
    html += '</div>\n';
  }

  // Hypotheses
  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    let hypothesesContent = '';
    for (const hypothesis of thought.scientificHypotheses) {
      const typeColor = hypothesis.type === 'null' ? 'secondary' : 'primary';
      const badge = renderBadge(hypothesis.type.toUpperCase(), typeColor as any);
      hypothesesContent += `
        <div class="card">
          <div class="card-header">${badge} ${escapeHTML(hypothesis.statement)}</div>
          ${hypothesis.prediction ? `<p><strong>Prediction:</strong> ${escapeHTML(hypothesis.prediction)}</p>` : ''}
          ${hypothesis.rationale ? `<p><strong>Rationale:</strong> ${escapeHTML(hypothesis.rationale)}</p>` : ''}
        </div>
      `;
    }
    html += renderSection('Hypotheses', hypothesesContent, '💡');
  }

  // Experiment
  if (thought.experiment) {
    const experimentContent = `
      <p><strong>Type:</strong> ${escapeHTML(thought.experiment.type)}</p>
      <p><strong>Design:</strong> ${escapeHTML(thought.experiment.design)}</p>
      ${(thought.experiment as any).sampleSize ? `<p><strong>Sample Size:</strong> ${(thought.experiment as any).sampleSize}</p>` : ''}
    `;
    html += renderSection('Experiment', experimentContent, '🔬');
  }

  // Data Collection
  if (thought.data) {
    const dataContent = `
      <p><strong>Method:</strong> ${escapeHTML(thought.data.method.join(', '))}</p>
      ${thought.data.dataQuality ? `
        <p><strong>Quality Metrics:</strong></p>
        <ul>
          <li>Completeness: ${(thought.data.dataQuality.completeness * 100).toFixed(0)}%</li>
          <li>Reliability: ${(thought.data.dataQuality.reliability * 100).toFixed(0)}%</li>
        </ul>
      ` : ''}
    `;
    html += renderSection('Data Collection', dataContent, '📊');
  }

  // Statistical Analysis
  if (thought.analysis && thought.analysis.tests) {
    const testRows = thought.analysis.tests.map(test => [
      test.name,
      test.pValue.toFixed(4),
      test.alpha.toString(),
      test.result,
    ]);
    const testsTable = renderTable(
      ['Test', 'p-value', 'α', 'Result'],
      testRows,
      { caption: 'Statistical Tests' }
    );
    html += renderSection('Statistical Analysis', testsTable, '📈');
  }

  // Conclusion
  if (thought.conclusion) {
    const conclusionBadge = thought.conclusion.confidence && thought.conclusion.confidence > 0.8
      ? renderBadge('HIGH CONFIDENCE', 'success')
      : thought.conclusion.confidence && thought.conclusion.confidence > 0.5
        ? renderBadge('MODERATE CONFIDENCE', 'warning')
        : renderBadge('LOW CONFIDENCE', 'danger');

    const conclusionContent = `
      <p>${conclusionBadge}</p>
      <p>${escapeHTML(thought.conclusion.statement)}</p>
      ${thought.conclusion.confidence ? `<p><strong>Confidence:</strong> ${(thought.conclusion.confidence * 100).toFixed(0)}%</p>` : ''}
      ${(thought.conclusion as any).supportedHypotheses ? `<p><strong>Supported Hypotheses:</strong> ${(thought.conclusion as any).supportedHypotheses.join(', ')}</p>` : ''}
    `;
    html += renderSection('Conclusion', conclusionContent, '✅');
  }

  html += generateHTMLFooter(htmlStandalone);
  return html;
}

/**
 * Export scientific method experiment flow to Modelica format
 */
function scientificMethodToModelica(thought: ScientificMethodThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;
  const lines: string[] = [];

  // Package header
  lines.push('package ScientificMethodExperiment');
  lines.push('  "Scientific method experiment modeling package"');
  lines.push('');

  // Stage enumeration
  const stages: string[] = [];
  if (thought.researchQuestion) stages.push('ResearchQuestion');
  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) stages.push('Hypothesis');
  if (thought.experiment) stages.push('Experiment');
  if (thought.data) stages.push('DataCollection');
  if (thought.analysis) stages.push('Analysis');
  if (thought.conclusion) stages.push('Conclusion');

  if (stages.length > 0) {
    lines.push('  type Stage = enumeration(');
    for (let i = 0; i < stages.length; i++) {
      const comma = i < stages.length - 1 ? ',' : '';
      lines.push(`    ${stages[i]} "${stages[i]}"${comma}`);
    }
    lines.push('  );');
    lines.push('');
  }

  // Research Question record
  if (thought.researchQuestion) {
    lines.push('  record ResearchQuestionData');
    lines.push('    "Research question information"');
    lines.push(`    parameter String question = "${escapeModelicaString(thought.researchQuestion.question)}";`);
    lines.push(`    parameter String background = "${escapeModelicaString(thought.researchQuestion.background)}";`);
    if (thought.researchQuestion.significance) {
      lines.push(`    parameter String significance = "${escapeModelicaString(thought.researchQuestion.significance)}";`);
    }
    lines.push('  end ResearchQuestionData;');
    lines.push('');
  }

  // Hypothesis record
  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    lines.push('  record HypothesisData');
    lines.push('    "Hypothesis information"');
    lines.push(`    parameter Integer count = ${thought.scientificHypotheses.length};`);
    lines.push(`    parameter String primaryHypothesis = "${escapeModelicaString(thought.scientificHypotheses[0].statement)}";`);
    lines.push(`    parameter String hypothesisType = "${thought.scientificHypotheses[0].type}";`);
    lines.push('  end HypothesisData;');
    lines.push('');
  }

  // Experiment record
  if (thought.experiment) {
    lines.push('  record ExperimentData');
    lines.push('    "Experiment design information"');
    lines.push(`    parameter String experimentType = "${escapeModelicaString(thought.experiment.type)}";`);
    lines.push(`    parameter String design = "${escapeModelicaString(thought.experiment.design)}";`);
    const sampleSize = (thought.experiment as any)?.sampleSize || 0;
    if (sampleSize > 0) {
      lines.push(`    parameter Integer sampleSize = ${sampleSize};`);
    }
    lines.push('  end ExperimentData;');
    lines.push('');
  }

  // Data Collection record
  if (thought.data) {
    lines.push('  record DataCollectionInfo');
    lines.push('    "Data collection and quality metrics"');
    lines.push(`    parameter String method = "${escapeModelicaString(thought.data.method.join(', '))}";`);
    if (thought.data.dataQuality) {
      lines.push(`    parameter Real completeness = ${thought.data.dataQuality.completeness.toFixed(3)};`);
      lines.push(`    parameter Real reliability = ${thought.data.dataQuality.reliability.toFixed(3)};`);
    }
    lines.push('  end DataCollectionInfo;');
    lines.push('');
  }

  // Analysis record
  if (thought.analysis && thought.analysis.tests) {
    lines.push('  record AnalysisData');
    lines.push('    "Statistical analysis results"');
    lines.push(`    parameter Integer testCount = ${thought.analysis.tests.length};`);
    if (thought.analysis.tests.length > 0) {
      lines.push(`    parameter String primaryTest = "${escapeModelicaString(thought.analysis.tests[0].name)}";`);
      lines.push(`    parameter Real primaryPValue = ${thought.analysis.tests[0].pValue.toFixed(4)};`);
    }
    lines.push('  end AnalysisData;');
    lines.push('');
  }

  // Conclusion record
  if (thought.conclusion) {
    lines.push('  record ConclusionData');
    lines.push('    "Final conclusion and confidence"');
    lines.push(`    parameter String statement = "${escapeModelicaString(thought.conclusion.statement)}";`);
    if (thought.conclusion.confidence) {
      lines.push(`    parameter Real confidence = ${thought.conclusion.confidence.toFixed(3)};`);
    }
    lines.push('  end ConclusionData;');
    lines.push('');
  }

  // Progress metrics
  if (includeMetrics && stages.length > 0) {
    const currentStageIndex = stages.length; // All stages completed if we have conclusion
    lines.push('  // Progress metrics');
    lines.push(`  parameter Integer totalStages = ${stages.length};`);
    lines.push(`  parameter Integer completedStages = ${currentStageIndex};`);
    lines.push(`  parameter Real progress = ${(currentStageIndex / stages.length).toFixed(3)};`);
    lines.push('');
  }

  // Package footer with annotations
  lines.push('  annotation(');
  lines.push('    Documentation(info="<html>');
  lines.push('      <p>Scientific Method Experiment Flow</p>');
  if (includeMetrics) {
    lines.push(`      <p>Stages: ${stages.length}</p>`);
    if (thought.scientificHypotheses) {
      lines.push(`      <p>Hypotheses: ${thought.scientificHypotheses.length}</p>`);
    }
    if (thought.conclusion?.confidence) {
      lines.push(`      <p>Confidence: ${(thought.conclusion.confidence * 100).toFixed(0)}%</p>`);
    }
  }
  lines.push('      <p>Generated by DeepThinking MCP v7.1.0</p>');
  lines.push('    </html>"),');
  lines.push('    version="1.0.0"');
  lines.push('  );');
  lines.push('end ScientificMethodExperiment;');

  return lines.join('\n');
}

/**
 * Export scientific method experiment flow to UML format (PlantUML activity diagram)
 */
function scientificMethodToUML(thought: ScientificMethodThought, options: VisualExportOptions): string {
  const { includeLabels = true } = options;

  // Build the list of activities (stages in the scientific method)
  const activities: string[] = [];

  if (thought.researchQuestion) {
    const label = includeLabels
      ? `Research Question: ${thought.researchQuestion.question.substring(0, 40)}...`
      : 'Research Question';
    activities.push(label);
  }

  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    const label = includeLabels
      ? `Hypotheses (${thought.scientificHypotheses.length})`
      : 'Hypotheses';
    activities.push(label);
  }

  if (thought.experiment) {
    const label = includeLabels
      ? `Experiment: ${thought.experiment.design.substring(0, 40)}`
      : 'Experiment';
    activities.push(label);
  }

  if (thought.data) {
    activities.push('Data Collection');
  }

  if (thought.analysis) {
    const label = includeLabels && thought.analysis.tests
      ? `Statistical Analysis (${thought.analysis.tests.length} tests)`
      : 'Statistical Analysis';
    activities.push(label);
  }

  if (thought.conclusion) {
    const label = includeLabels
      ? `Conclusion: ${thought.conclusion.statement.substring(0, 40)}...`
      : 'Conclusion';
    activities.push(label);
  }

  // The current activity is the last one (conclusion if it exists)
  const currentActivity = thought.conclusion ? activities[activities.length - 1] : undefined;

  return generateActivityDiagram(activities, currentActivity, {
    title: 'Scientific Method Experiment Flow',
    includeLabels,
  });
}

/**
 * Export scientific method experiment flow to JSON format
 */
function scientificMethodToJSON(thought: ScientificMethodThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;

  const graph = createJsonGraph('Scientific Method Experiment', 'scientific-method', options);

  // Set layout for linear flow
  if (graph.layout) {
    graph.layout.type = 'linear';
    graph.layout.direction = 'TB';
  }

  let yPosition = 0;
  const ySpacing = 100;
  let edgeId = 0;
  const nodeIds: string[] = [];

  // Research Question node
  if (thought.researchQuestion) {
    addNode(graph, {
      id: 'research_question',
      label: thought.researchQuestion.question.substring(0, 60) + '...',
      type: 'question',
      y: yPosition,
      x: 200,
      color: '#ffd699',
      shape: 'ellipse',
      metadata: {
        question: thought.researchQuestion.question,
        background: thought.researchQuestion.background,
        significance: thought.researchQuestion.significance,
      },
    });
    nodeIds.push('research_question');
    yPosition += ySpacing;
  }

  // Hypotheses node
  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    addNode(graph, {
      id: 'hypotheses',
      label: `Hypotheses (${thought.scientificHypotheses.length})`,
      type: 'hypothesis',
      y: yPosition,
      x: 200,
      color: '#a8d5ff',
      shape: 'rectangle',
      metadata: {
        count: thought.scientificHypotheses.length,
        hypotheses: thought.scientificHypotheses.map(h => ({
          id: h.id,
          statement: h.statement,
          type: h.type,
        })),
      },
    });
    nodeIds.push('hypotheses');
    yPosition += ySpacing;
  }

  // Experiment node
  if (thought.experiment) {
    addNode(graph, {
      id: 'experiment',
      label: `Experiment: ${thought.experiment.design.substring(0, 30)}...`,
      type: 'experiment',
      y: yPosition,
      x: 200,
      color: '#e0e0e0',
      shape: 'rectangle',
      metadata: {
        type: thought.experiment.type,
        design: thought.experiment.design,
        sampleSize: (thought.experiment as any)?.sampleSize,
      },
    });
    nodeIds.push('experiment');
    yPosition += ySpacing;
  }

  // Data Collection node
  if (thought.data) {
    addNode(graph, {
      id: 'data_collection',
      label: 'Data Collection',
      type: 'data',
      y: yPosition,
      x: 200,
      color: '#e0e0e0',
      shape: 'rectangle',
      metadata: {
        method: thought.data.method,
        dataQuality: thought.data.dataQuality,
      },
    });
    nodeIds.push('data_collection');
    yPosition += ySpacing;
  }

  // Analysis node
  if (thought.analysis) {
    const testCount = thought.analysis.tests?.length || 0;
    addNode(graph, {
      id: 'analysis',
      label: `Statistical Analysis (${testCount} tests)`,
      type: 'analysis',
      y: yPosition,
      x: 200,
      color: '#e0e0e0',
      shape: 'rectangle',
      metadata: {
        testCount,
        tests: thought.analysis.tests,
      },
    });
    nodeIds.push('analysis');
    yPosition += ySpacing;
  }

  // Conclusion node
  if (thought.conclusion) {
    addNode(graph, {
      id: 'conclusion',
      label: `Conclusion: ${thought.conclusion.statement.substring(0, 40)}...`,
      type: 'conclusion',
      y: yPosition,
      x: 200,
      color: '#a5d6a7',
      shape: 'stadium',
      metadata: {
        statement: thought.conclusion.statement,
        confidence: thought.conclusion.confidence,
        supportedHypotheses: (thought.conclusion as any).supportedHypotheses,
      },
    });
    nodeIds.push('conclusion');
  }

  // Create edges between consecutive stages
  for (let i = 0; i < nodeIds.length - 1; i++) {
    addEdge(graph, {
      id: `edge_${edgeId++}`,
      source: nodeIds[i],
      target: nodeIds[i + 1],
      directed: true,
      style: 'solid',
    });
  }

  // Add metrics
  if (includeMetrics && graph.metrics) {
    addMetric(graph, 'totalStages', nodeIds.length);
    addMetric(graph, 'completedStages', nodeIds.length);
    addMetric(graph, 'progress', 1.0);
    addMetric(graph, 'hypothesisCount', thought.scientificHypotheses?.length || 0);
    if (thought.conclusion?.confidence) {
      addMetric(graph, 'confidence', thought.conclusion.confidence);
    }
    if (thought.analysis?.tests) {
      addMetric(graph, 'testCount', thought.analysis.tests.length);
    }
  }

  return serializeGraph(graph, options);
}

/**
 * Export scientific method experiment flow to Markdown format
 */
function scientificMethodToMarkdown(thought: ScientificMethodThought, options: VisualExportOptions): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
    includeMetrics = true,
  } = options;

  const parts: string[] = [];

  // Research Question
  if (thought.researchQuestion) {
    const questionContent = keyValueSection({
      'Question': thought.researchQuestion.question,
      'Background': thought.researchQuestion.background,
      'Significance': thought.researchQuestion.significance || 'N/A',
    });
    parts.push(section('Research Question', questionContent));
  }

  // Metrics
  if (includeMetrics) {
    const metricsContent = keyValueSection({
      'Hypotheses': thought.scientificHypotheses?.length || 0,
      'Tests': thought.analysis?.tests?.length || 0,
      'Confidence': thought.conclusion?.confidence?.toFixed(2) || 'N/A',
    });
    parts.push(section('Metrics', metricsContent));
  }

  // Hypotheses
  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    const hypothesisItems = thought.scientificHypotheses.map(h =>
      `**${h.type === 'null' ? 'H₀' : 'H₁'}**: ${h.statement}${h.prediction ? `\n  - Prediction: ${h.prediction}` : ''}`
    );
    parts.push(section('Hypotheses', list(hypothesisItems)));
  }

  // Experiment
  if (thought.experiment) {
    const experimentContent = keyValueSection({
      'Type': thought.experiment.type,
      'Design': thought.experiment.design,
      'Sample Size': (thought.experiment as any)?.sampleSize || 'N/A',
    });
    parts.push(section('Experiment', experimentContent));
  }

  // Data Collection
  if (thought.data) {
    const dataContent = keyValueSection({
      'Method': thought.data.method.join(', '),
      'Completeness': thought.data.dataQuality ? `${(thought.data.dataQuality.completeness * 100).toFixed(0)}%` : 'N/A',
      'Reliability': thought.data.dataQuality ? `${(thought.data.dataQuality.reliability * 100).toFixed(0)}%` : 'N/A',
    });
    parts.push(section('Data Collection', dataContent));
  }

  // Statistical Analysis
  if (thought.analysis && thought.analysis.tests) {
    const testRows = thought.analysis.tests.map(test => [
      test.name,
      test.pValue.toFixed(4),
      test.alpha.toString(),
      test.result,
    ]);
    const testsTable = table(
      ['Test', 'p-value', 'α', 'Result'],
      testRows
    );
    parts.push(section('Statistical Analysis', testsTable));
  }

  // Conclusion
  if (thought.conclusion) {
    const conclusionContent = `${thought.conclusion.statement}\n\n` +
      keyValueSection({
        'Confidence': thought.conclusion.confidence ? `${(thought.conclusion.confidence * 100).toFixed(0)}%` : 'N/A',
        'Supported Hypotheses': (thought.conclusion as any).supportedHypotheses?.join(', ') || 'N/A',
      });
    parts.push(section('Conclusion', conclusionContent));
  }

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaidDiagram = scientificMethodToMermaid(thought, 'default', true, true);
    parts.push(section('Experiment Flow Diagram', mermaidBlock(mermaidDiagram)));
  }

  return mdDocument('Scientific Method Analysis', parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: { mode: 'scientific-method' },
  });
}
