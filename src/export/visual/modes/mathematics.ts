/**
 * Mathematics Visual Exporter (v8.5.0)
 * Phase 7 Sprint 2: Mathematics reasoning export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support, GraphML, TikZ
 * Phase 13 Sprint 7: Refactored to use fluent builder classes
 */

import type { MathematicsThought } from '../../../types/modes/mathematics.js';
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
  list,
  keyValueSection,
  mermaidBlock,
  document as mdDocument,
} from '../utils/markdown.js';

/**
 * Export mathematics reasoning to visual format
 */
export function exportMathematicsDerivation(thought: MathematicsThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return mathematicsToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return mathematicsToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return mathematicsToASCII(thought);
    case 'svg':
      return mathematicsToSVG(thought, options);
    case 'graphml':
      return mathematicsToGraphML(thought, options);
    case 'tikz':
      return mathematicsToTikZ(thought, options);
    case 'html':
      return mathematicsToHTML(thought, options);
    case 'modelica':
      return mathematicsToModelica(thought, options);
    case 'uml':
      return mathematicsToUML(thought, options);
    case 'json':
      return mathematicsToJSON(thought, options);
    case 'markdown':
      return mathematicsToMarkdown(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function mathematicsToMermaid(
  thought: MathematicsThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  const scheme = colorScheme as 'default' | 'pastel' | 'monochrome';
  const builder = new MermaidGraphBuilder().setDirection('TB');

  // Add thought type node
  const typeId = sanitizeId(`type_${thought.thoughtType || 'proof'}`);
  const typeLabel = includeLabels ? (thought.thoughtType || 'Proof').replace(/_/g, ' ') : typeId;
  builder.addNode({ id: typeId, label: typeLabel, shape: 'subroutine' });

  // Add proof strategy if present
  if (thought.proofStrategy) {
    const strategyId = sanitizeId('strategy');
    builder.addNode({ id: strategyId, label: thought.proofStrategy.type, shape: 'stadium' });
    builder.addEdge({ source: typeId, target: strategyId });

    // Add proof steps
    let prevStepId = strategyId;
    thought.proofStrategy.steps.forEach((step, index) => {
      const stepId = sanitizeId(`step_${index}`);
      const stepLabel = includeLabels ? step.slice(0, 40) + (step.length > 40 ? '...' : '') : `Step ${index + 1}`;
      builder.addNode({ id: stepId, label: stepLabel, shape: 'rectangle' });
      builder.addEdge({ source: prevStepId, target: stepId });
      prevStepId = stepId;
    });

    // Add completeness metric
    if (includeMetrics) {
      const completenessId = sanitizeId('completeness');
      const completenessLabel = `Completeness: ${(thought.proofStrategy.completeness * 100).toFixed(0)}%`;
      builder.addNode({ id: completenessId, label: completenessLabel, shape: 'hexagon' });
      builder.addEdge({ source: prevStepId, target: completenessId });
    }
  }

  // Add mathematical model if present
  if (thought.mathematicalModel) {
    const modelId = sanitizeId('model');
    const modelLabel = thought.mathematicalModel.symbolic || 'Mathematical Model';
    builder.addNode({ id: modelId, label: modelLabel, shape: 'rectangle' });
    builder.addEdge({ source: typeId, target: modelId });
  }

  // Add theorems if present
  if (thought.theorems && thought.theorems.length > 0) {
    thought.theorems.forEach((theorem, index) => {
      const theoremId = sanitizeId(`theorem_${index}`);
      const theoremLabel = theorem.name || `Theorem ${index + 1}`;
      builder.addNode({ id: theoremId, label: theoremLabel, shape: 'trapezoid' });
      builder.addEdge({ source: typeId, target: theoremId });
    });
  }

  // Add assumptions as notes
  if (thought.assumptions && thought.assumptions.length > 0) {
    const assumptionsId = sanitizeId('assumptions');
    builder.addNode({ id: assumptionsId, label: `Assumptions: ${thought.assumptions.length}`, shape: 'asymmetric' });
  }

  return builder.setOptions({ colorScheme: scheme }).render();
}

function mathematicsToDOT(
  thought: MathematicsThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  const builder = new DOTGraphBuilder()
    .setGraphName('MathematicsDerivation')
    .setRankDir('TB')
    .setNodeDefaults({ shape: 'box', style: 'rounded' });

  // Add thought type node
  const typeId = sanitizeId(`type_${thought.thoughtType || 'proof'}`);
  const typeLabel = includeLabels ? (thought.thoughtType || 'Proof').replace(/_/g, ' ') : typeId;
  builder.addNode({ id: typeId, label: typeLabel, shape: 'doubleoctagon' });

  // Add proof strategy
  if (thought.proofStrategy) {
    const strategyId = sanitizeId('strategy');
    builder.addNode({ id: strategyId, label: thought.proofStrategy.type, shape: 'ellipse' });
    builder.addEdge({ source: typeId, target: strategyId });

    // Add steps
    let prevStepId = strategyId;
    thought.proofStrategy.steps.forEach((step, index) => {
      const stepId = sanitizeId(`step_${index}`);
      const stepLabel = includeLabels ? step.slice(0, 30).replace(/"/g, '\\"') : `Step ${index + 1}`;
      builder.addNode({ id: stepId, label: stepLabel });
      builder.addEdge({ source: prevStepId, target: stepId });
      prevStepId = stepId;
    });

    if (includeMetrics) {
      const completenessId = sanitizeId('completeness');
      builder.addNode({ id: completenessId, label: `${(thought.proofStrategy.completeness * 100).toFixed(0)}%`, shape: 'diamond' });
      builder.addEdge({ source: prevStepId, target: completenessId });
    }
  }

  // Add theorems
  if (thought.theorems) {
    thought.theorems.forEach((theorem, index) => {
      const theoremId = sanitizeId(`theorem_${index}`);
      builder.addNode({ id: theoremId, label: theorem.name || `Theorem ${index + 1}`, shape: 'parallelogram' });
      builder.addEdge({ source: typeId, target: theoremId });
    });
  }

  return builder.render();
}

function mathematicsToASCII(thought: MathematicsThought): string {
  const builder = new ASCIIDocBuilder();

  builder.addHeader('Mathematics Derivation');

  // Thought type
  builder.addText(`Type: ${(thought.thoughtType || 'proof').replace(/_/g, ' ')}`);
  builder.addText(`Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%`);
  builder.addEmptyLine();

  // Mathematical model
  if (thought.mathematicalModel) {
    builder.addText('Mathematical Model:');
    builder.addText(`  LaTeX: ${thought.mathematicalModel.latex}`);
    builder.addText(`  Symbolic: ${thought.mathematicalModel.symbolic}`);
    if (thought.mathematicalModel.ascii) {
      builder.addText(`  ASCII: ${thought.mathematicalModel.ascii}`);
    }
    builder.addEmptyLine();
  }

  // Proof strategy
  if (thought.proofStrategy) {
    builder.addText(`Proof Strategy: ${thought.proofStrategy.type}`);
    builder.addText(`Completeness: ${(thought.proofStrategy.completeness * 100).toFixed(0)}%`);
    builder.addText('Steps:');
    builder.addNumberedList(thought.proofStrategy.steps);
    if (thought.proofStrategy.baseCase) {
      builder.addText(`Base Case: ${thought.proofStrategy.baseCase}`);
    }
    if (thought.proofStrategy.inductiveStep) {
      builder.addText(`Inductive Step: ${thought.proofStrategy.inductiveStep}`);
    }
    builder.addEmptyLine();
  }

  // Theorems
  if (thought.theorems && thought.theorems.length > 0) {
    builder.addText('Theorems:');
    thought.theorems.forEach((theorem, index) => {
      builder.addText(`  [${index + 1}] ${theorem.name || `Theorem ${index + 1}`}: ${theorem.statement}`);
      if (theorem.hypotheses.length > 0) {
        builder.addText(`      Hypotheses: ${theorem.hypotheses.join(', ')}`);
      }
      builder.addText(`      Conclusion: ${theorem.conclusion}`);
    });
    builder.addEmptyLine();
  }

  // Assumptions
  if (thought.assumptions && thought.assumptions.length > 0) {
    builder.addText('Assumptions:');
    builder.addNumberedList(thought.assumptions);
    builder.addEmptyLine();
  }

  // Dependencies
  if (thought.dependencies && thought.dependencies.length > 0) {
    builder.addText('Dependencies:');
    builder.addNumberedList(thought.dependencies);
  }

  return builder.render();
}

/**
 * Export mathematics reasoning to native SVG format
 */
function mathematicsToSVG(thought: MathematicsThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
  } = options;

  const positions = new Map<string, SVGNodePosition>();
  const nodeWidth = 150;
  const nodeHeight = 40;
  let currentY = 80;

  // Thought type at the top
  const typeId = 'type';
  positions.set(typeId, {
    id: typeId,
    label: includeLabels ? (thought.thoughtType || 'Proof').replace(/_/g, ' ') : typeId,
    x: svgWidth / 2,
    y: currentY,
    width: nodeWidth,
    height: nodeHeight,
    type: 'type',
  });
  currentY += 120;

  // Proof strategy if present
  if (thought.proofStrategy) {
    positions.set('strategy', {
      id: 'strategy',
      label: thought.proofStrategy.type,
      x: svgWidth / 2,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: 'strategy',
    });
    currentY += 100;

    // Proof steps
    thought.proofStrategy.steps.forEach((step, index) => {
      const stepId = `step_${index}`;
      positions.set(stepId, {
        id: stepId,
        label: includeLabels ? `${index + 1}. ${step.substring(0, 25)}...` : `Step ${index + 1}`,
        x: 150 + (index % 3) * 200,
        y: currentY + Math.floor(index / 3) * 80,
        width: nodeWidth,
        height: nodeHeight,
        type: 'step',
      });
    });
    currentY += Math.ceil(thought.proofStrategy.steps.length / 3) * 80 + 40;
  }

  // Theorems if present
  if (thought.theorems && thought.theorems.length > 0) {
    thought.theorems.forEach((theorem, index) => {
      const theoremId = `theorem_${index}`;
      positions.set(theoremId, {
        id: theoremId,
        label: theorem.name || `Theorem ${index + 1}`,
        x: svgWidth / 2,
        y: currentY,
        width: nodeWidth,
        height: nodeHeight,
        type: 'theorem',
      });
      currentY += 80;
    });
  }

  const actualHeight = Math.max(DEFAULT_SVG_OPTIONS.height, currentY + 100);

  let svg = generateSVGHeader(svgWidth, actualHeight, 'Mathematics Derivation');

  // Render edges
  svg += '\n  <!-- Edges -->\n  <g class="edges">';

  // Edge from type to strategy
  if (thought.proofStrategy) {
    const typePos = positions.get('type');
    const strategyPos = positions.get('strategy');
    if (typePos && strategyPos) {
      svg += renderEdge(typePos, strategyPos);
    }

    // Edges from strategy to steps
    const stratPos = positions.get('strategy');
    thought.proofStrategy.steps.forEach((_, index) => {
      const stepPos = positions.get(`step_${index}`);
      if (stratPos && stepPos) {
        svg += renderEdge(stratPos, stepPos);
      }
    });
  }

  // Edges from type to theorems
  if (thought.theorems) {
    const typePos = positions.get('type');
    thought.theorems.forEach((_, index) => {
      const theoremPos = positions.get(`theorem_${index}`);
      if (typePos && theoremPos) {
        svg += renderEdge(typePos, theoremPos);
      }
    });
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';

  const typeColors = getNodeColor('primary', colorScheme);
  const strategyColors = getNodeColor('secondary', colorScheme);
  const stepColors = getNodeColor('neutral', colorScheme);
  const theoremColors = getNodeColor('tertiary', colorScheme);

  for (const [, pos] of positions) {
    if (pos.type === 'type') {
      svg += renderStadiumNode(pos, typeColors);
    } else if (pos.type === 'strategy') {
      svg += renderEllipseNode(pos, strategyColors);
    } else if (pos.type === 'step') {
      svg += renderRectNode(pos, stepColors);
    } else if (pos.type === 'theorem') {
      svg += renderRectNode(pos, theoremColors);
    }
  }
  svg += '\n  </g>';

  // Render metrics panel
  if (includeMetrics) {
    const metrics = [
      { label: 'Uncertainty', value: `${(thought.uncertainty * 100).toFixed(1)}%` },
      { label: 'Theorems', value: thought.theorems?.length || 0 },
      { label: 'Assumptions', value: thought.assumptions?.length || 0 },
    ];
    svg += renderMetricsPanel(svgWidth - 180, actualHeight - 110, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Type', color: typeColors, shape: 'stadium' as const },
    { label: 'Strategy', color: strategyColors, shape: 'ellipse' as const },
    { label: 'Step', color: stepColors },
    { label: 'Theorem', color: theoremColors },
  ];
  svg += renderLegend(20, actualHeight - 130, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}

/**
 * Export mathematics reasoning to GraphML format
 */
function mathematicsToGraphML(thought: MathematicsThought, options: VisualExportOptions): string {
  const { includeLabels = true } = options;

  const nodes: GraphMLNode[] = [];
  const edges: GraphMLEdge[] = [];
  let edgeCount = 0;

  // Add thought type as root node
  const typeId = sanitizeId(`type_${thought.thoughtType || 'proof'}`);
  nodes.push({
    id: typeId,
    label: includeLabels ? (thought.thoughtType || 'Proof').replace(/_/g, ' ') : typeId,
    type: 'type',
  });

  // Add theorems/axioms if present
  if (thought.theorems && thought.theorems.length > 0) {
    thought.theorems.forEach((theorem, index) => {
      const theoremId = sanitizeId(`theorem_${index}`);
      nodes.push({
        id: theoremId,
        label: theorem.name || `Theorem ${index + 1}`,
        type: 'axiom',
        metadata: {
          description: theorem.statement,
        },
      });

      // Connect type to theorems
      edges.push({
        id: `e${edgeCount++}`,
        source: typeId,
        target: theoremId,
        directed: true,
      });
    });
  }

  // Add proof strategy with derivation steps
  if (thought.proofStrategy) {
    const strategyId = sanitizeId('strategy');
    nodes.push({
      id: strategyId,
      label: thought.proofStrategy.type,
      type: 'strategy',
    });

    edges.push({
      id: `e${edgeCount++}`,
      source: typeId,
      target: strategyId,
      directed: true,
    });

    // Add proof steps as derivation nodes
    let prevStepId = strategyId;
    thought.proofStrategy.steps.forEach((step, index) => {
      const stepId = sanitizeId(`step_${index}`);
      nodes.push({
        id: stepId,
        label: includeLabels ? step.slice(0, 40) + (step.length > 40 ? '...' : '') : `Step ${index + 1}`,
        type: 'step',
        metadata: {
          description: step,
        },
      });

      edges.push({
        id: `e${edgeCount++}`,
        source: prevStepId,
        target: stepId,
        directed: true,
      });

      prevStepId = stepId;
    });
  }

  // Add mathematical model if present
  if (thought.mathematicalModel) {
    const modelId = sanitizeId('model');
    nodes.push({
      id: modelId,
      label: thought.mathematicalModel.symbolic || 'Mathematical Model',
      type: 'model',
      metadata: {
        description: thought.mathematicalModel.latex,
      },
    });

    edges.push({
      id: `e${edgeCount++}`,
      source: typeId,
      target: modelId,
      directed: true,
    });
  }

  return generateGraphML(nodes, edges, {
    graphName: 'Mathematics Derivation',
    directed: true,
    includeLabels,
  });
}

/**
 * Export mathematics reasoning to TikZ format
 */
function mathematicsToTikZ(thought: MathematicsThought, options: VisualExportOptions): string {
  const { includeLabels = true, colorScheme = 'default' } = options;

  const nodes: TikZNode[] = [];
  const edges: TikZEdge[] = [];
  let yPos = 0;

  // Add thought type as root node (stadium shape for axioms/theorems)
  const typeId = sanitizeId(`type_${thought.thoughtType || 'proof'}`);
  nodes.push({
    id: typeId,
    label: includeLabels ? (thought.thoughtType || 'Proof').replace(/_/g, ' ') : typeId,
    x: 4,
    y: yPos,
    type: 'primary',
    shape: 'stadium',
  });
  yPos -= 2;

  // Add theorems/axioms if present (stadium shapes)
  if (thought.theorems && thought.theorems.length > 0) {
    thought.theorems.forEach((theorem, index) => {
      const theoremId = sanitizeId(`theorem_${index}`);
      const xPos = 1 + index * 3;
      nodes.push({
        id: theoremId,
        label: theorem.name || `Theorem ${index + 1}`,
        x: xPos,
        y: yPos,
        type: 'secondary',
        shape: 'stadium',
      });

      edges.push({
        source: typeId,
        target: theoremId,
        directed: true,
      });
    });
    yPos -= 2;
  }

  // Add proof strategy with derivation steps (rectangles for steps)
  if (thought.proofStrategy) {
    const strategyId = sanitizeId('strategy');
    nodes.push({
      id: strategyId,
      label: thought.proofStrategy.type,
      x: 4,
      y: yPos,
      type: 'secondary',
      shape: 'ellipse',
    });

    edges.push({
      source: typeId,
      target: strategyId,
      directed: true,
    });

    yPos -= 2;

    // Add proof steps as derivation nodes (rectangles)
    let prevStepId = strategyId;
    thought.proofStrategy.steps.forEach((step, index) => {
      const stepId = sanitizeId(`step_${index}`);
      const xPos = 1 + (index % 3) * 2.5;
      const stepYPos = yPos - Math.floor(index / 3) * 1.5;

      nodes.push({
        id: stepId,
        label: includeLabels ? `${index + 1}. ${step.substring(0, 20)}...` : `Step ${index + 1}`,
        x: xPos,
        y: stepYPos,
        type: 'neutral',
        shape: 'rectangle',
      });

      edges.push({
        source: prevStepId,
        target: stepId,
        directed: true,
      });

      prevStepId = stepId;
    });
  }

  return generateTikZ(nodes, edges, {
    title: 'Mathematics Derivation',
    colorScheme,
    includeLabels,
  });
}

/**
 * Export mathematics reasoning to HTML format
 */
function mathematicsToHTML(thought: MathematicsThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Mathematics Derivation Analysis',
    htmlTheme = 'light',
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // Metrics
  html += '<div class="metrics-grid">';
  html += renderMetricCard('Uncertainty', `${(thought.uncertainty * 100).toFixed(1)}%`, 'warning');
  if (thought.theorems) {
    html += renderMetricCard('Theorems', thought.theorems.length, 'primary');
  }
  if (thought.assumptions) {
    html += renderMetricCard('Assumptions', thought.assumptions.length, 'info');
  }
  if (thought.proofStrategy) {
    html += renderMetricCard('Completeness', `${(thought.proofStrategy.completeness * 100).toFixed(0)}%`, 'success');
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

  // Mathematical model
  if (thought.mathematicalModel) {
    const modelContent = `
      <p><strong>LaTeX:</strong> <code>${escapeHTML(thought.mathematicalModel.latex)}</code></p>
      <p><strong>Symbolic:</strong> <code>${escapeHTML(thought.mathematicalModel.symbolic)}</code></p>
      ${thought.mathematicalModel.ascii ? `<p><strong>ASCII:</strong> <code>${escapeHTML(thought.mathematicalModel.ascii)}</code></p>` : ''}
    `;
    html += renderSection('Mathematical Model', modelContent, '📐');
  }

  // Proof strategy
  if (thought.proofStrategy) {
    const proofContent = `
      <p><strong>Type:</strong> ${renderBadge(thought.proofStrategy.type, 'info')}</p>
      <p><strong>Completeness:</strong></p>
      ${renderProgressBar(thought.proofStrategy.completeness * 100, 'success')}
      <p style="margin-top: 1rem"><strong>Steps:</strong></p>
      <ol class="list-styled">
        ${thought.proofStrategy.steps.map(step => `<li>${escapeHTML(step)}</li>`).join('')}
      </ol>
      ${thought.proofStrategy.baseCase ? `<p><strong>Base Case:</strong> ${escapeHTML(thought.proofStrategy.baseCase)}</p>` : ''}
      ${thought.proofStrategy.inductiveStep ? `<p><strong>Inductive Step:</strong> ${escapeHTML(thought.proofStrategy.inductiveStep)}</p>` : ''}
    `;
    html += renderSection('Proof Strategy', proofContent, '🔍');
  }

  // Theorems
  if (thought.theorems && thought.theorems.length > 0) {
    const theoremsContent = thought.theorems.map((theorem, index) => `
      <div class="card">
        <div class="card-header">${escapeHTML(theorem.name || `Theorem ${index + 1}`)}</div>
        <p><strong>Statement:</strong> ${escapeHTML(theorem.statement)}</p>
        ${theorem.hypotheses.length > 0 ? `<p><strong>Hypotheses:</strong> ${escapeHTML(theorem.hypotheses.join(', '))}</p>` : ''}
        <p><strong>Conclusion:</strong> ${escapeHTML(theorem.conclusion)}</p>
      </div>
    `).join('');
    html += renderSection('Theorems', theoremsContent, '📜');
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
 * Export mathematics reasoning to Modelica format
 */
function mathematicsToModelica(thought: MathematicsThought, options: VisualExportOptions): string {
  const { includeLabels = true } = options;

  let modelica = '// Mathematics Derivation Model\n';
  modelica += `package MathematicsDerivation "${thought.thoughtType || 'Proof'}"\n`;
  modelica += '  "Mathematical derivation and proof structure"\n\n';

  // Add mathematical constants and parameters
  modelica += '  // Mathematical Model\n';
  if (thought.mathematicalModel) {
    const modelName = sanitizeModelicaId('MathModel');
    modelica += `  model ${modelName} "Mathematical Expression"\n`;
    modelica += `    parameter String latex = "${escapeModelicaString(thought.mathematicalModel.latex)}";\n`;
    modelica += `    parameter String symbolic = "${escapeModelicaString(thought.mathematicalModel.symbolic)}";\n`;
    if (thought.mathematicalModel.ascii) {
      modelica += `    parameter String ascii = "${escapeModelicaString(thought.mathematicalModel.ascii)}";\n`;
    }
    modelica += `  end ${modelName};\n\n`;
  }

  // Add theorems as models
  if (thought.theorems && thought.theorems.length > 0) {
    modelica += '  // Theorems\n';
    thought.theorems.forEach((theorem, index) => {
      const theoremName = sanitizeModelicaId(theorem.name || `Theorem${index + 1}`);
      modelica += `  model ${theoremName} "Theorem ${index + 1}"\n`;
      modelica += `    parameter String statement = "${escapeModelicaString(theorem.statement)}";\n`;
      if (theorem.hypotheses.length > 0) {
        theorem.hypotheses.forEach((hyp, hypIndex) => {
          modelica += `    parameter String hypothesis${hypIndex + 1} = "${escapeModelicaString(hyp)}";\n`;
        });
      }
      modelica += `    parameter String conclusion = "${escapeModelicaString(theorem.conclusion)}";\n`;
      modelica += `  end ${theoremName};\n\n`;
    });
  }

  // Add proof strategy as a model with derivation steps
  if (thought.proofStrategy) {
    const strategyName = sanitizeModelicaId(thought.proofStrategy.type.replace(/\s+/g, '_'));
    modelica += '  // Proof Strategy\n';
    modelica += `  model ${strategyName} "Proof Strategy"\n`;
    modelica += `    parameter String proofType = "${escapeModelicaString(thought.proofStrategy.type)}";\n`;
    modelica += `    parameter Real completeness = ${thought.proofStrategy.completeness};\n`;

    // Add proof steps as parameters
    thought.proofStrategy.steps.forEach((step, index) => {
      if (includeLabels) {
        modelica += `    parameter String step${index + 1} = "${escapeModelicaString(step)}";\n`;
      }
    });

    if (thought.proofStrategy.baseCase) {
      modelica += `    parameter String baseCase = "${escapeModelicaString(thought.proofStrategy.baseCase)}";\n`;
    }
    if (thought.proofStrategy.inductiveStep) {
      modelica += `    parameter String inductiveStep = "${escapeModelicaString(thought.proofStrategy.inductiveStep)}";\n`;
    }
    modelica += `  end ${strategyName};\n\n`;
  }

  // Add assumptions
  if (thought.assumptions && thought.assumptions.length > 0) {
    modelica += '  // Assumptions\n';
    modelica += '  model Assumptions "Proof Assumptions"\n';
    thought.assumptions.forEach((assumption, index) => {
      modelica += `    parameter String assumption${index + 1} = "${escapeModelicaString(assumption)}";\n`;
    });
    modelica += '  end Assumptions;\n\n';
  }

  // Add metadata
  modelica += '  // Metadata\n';
  modelica += '  model Metadata "Derivation Metadata"\n';
  modelica += `    parameter Real uncertainty = ${thought.uncertainty};\n`;
  modelica += `    parameter Integer theoremCount = ${thought.theorems?.length || 0};\n`;
  modelica += `    parameter Integer assumptionCount = ${thought.assumptions?.length || 0};\n`;
  modelica += '  end Metadata;\n\n';

  modelica += 'end MathematicsDerivation;\n';
  return modelica;
}

/**
 * Export mathematics reasoning to UML format
 */
function mathematicsToUML(thought: MathematicsThought, options: VisualExportOptions): string {
  const { includeLabels = true } = options;

  const nodes: UmlNode[] = [];
  const edges: UmlEdge[] = [];

  // Add thought type as root class
  const typeId = sanitizeId(`type_${thought.thoughtType || 'proof'}`);
  nodes.push({
    id: typeId,
    label: includeLabels ? (thought.thoughtType || 'Proof').replace(/_/g, ' ') : typeId,
    shape: 'class',
    stereotype: 'mathematical',
    attributes: [
      `uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%`,
    ],
  });

  // Add mathematical model as class
  if (thought.mathematicalModel) {
    const modelId = sanitizeId('model');
    nodes.push({
      id: modelId,
      label: 'Mathematical Model',
      shape: 'class',
      stereotype: 'model',
      attributes: [
        `latex: ${thought.mathematicalModel.latex.substring(0, 40)}...`,
        `symbolic: ${thought.mathematicalModel.symbolic}`,
      ],
    });

    edges.push({
      source: typeId,
      target: modelId,
      type: 'composition',
      label: 'contains',
    });
  }

  // Add theorems as classes
  if (thought.theorems && thought.theorems.length > 0) {
    thought.theorems.forEach((theorem, index) => {
      const theoremId = sanitizeId(`theorem_${index}`);
      const attributes = [
        `statement: ${theorem.statement.substring(0, 40)}...`,
        `hypotheses: ${theorem.hypotheses.length}`,
        `conclusion: ${theorem.conclusion.substring(0, 40)}...`,
      ];

      nodes.push({
        id: theoremId,
        label: theorem.name || `Theorem ${index + 1}`,
        shape: 'class',
        stereotype: 'theorem',
        attributes,
      });

      edges.push({
        source: typeId,
        target: theoremId,
        type: 'association',
        label: 'uses',
      });
    });
  }

  // Add proof strategy as class with methods
  if (thought.proofStrategy) {
    const strategyId = sanitizeId('strategy');
    const methods = thought.proofStrategy.steps.map((step, index) => {
      return includeLabels ? `step${index + 1}(): ${step.substring(0, 30)}...` : `step${index + 1}()`;
    });

    nodes.push({
      id: strategyId,
      label: thought.proofStrategy.type,
      shape: 'class',
      stereotype: 'strategy',
      attributes: [
        `completeness: ${(thought.proofStrategy.completeness * 100).toFixed(0)}%`,
      ],
      methods,
    });

    edges.push({
      source: typeId,
      target: strategyId,
      type: 'dependency',
      label: 'applies',
    });
  }

  // Add assumptions as interface
  if (thought.assumptions && thought.assumptions.length > 0) {
    const assumptionsId = sanitizeId('assumptions');
    nodes.push({
      id: assumptionsId,
      label: 'Assumptions',
      shape: 'interface',
      attributes: thought.assumptions.slice(0, 5).map((a, i) => `${i + 1}. ${a.substring(0, 30)}...`),
    });

    edges.push({
      source: typeId,
      target: assumptionsId,
      type: 'implementation',
      label: 'assumes',
    });
  }

  return generateUmlDiagram(nodes, edges, {
    title: 'Mathematics Derivation Structure',
    includeLabels,
  });
}

/**
 * Export mathematics reasoning to JSON format
 */
function mathematicsToJSON(thought: MathematicsThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  const graph = createJsonGraph('Mathematics Derivation', 'mathematics');

  // Add thought type as root node
  const typeId = sanitizeId(`type_${thought.thoughtType || 'proof'}`);
  addNode(graph, {
    id: typeId,
    label: includeLabels ? (thought.thoughtType || 'Proof').replace(/_/g, ' ') : typeId,
    type: 'type',
    metadata: {
      thoughtType: thought.thoughtType || 'proof',
      uncertainty: thought.uncertainty,
    },
  });

  // Add mathematical model
  if (thought.mathematicalModel) {
    const modelId = sanitizeId('model');
    addNode(graph, {
      id: modelId,
      label: thought.mathematicalModel.symbolic || 'Mathematical Model',
      type: 'model',
      metadata: {
        latex: thought.mathematicalModel.latex,
        symbolic: thought.mathematicalModel.symbolic,
        ascii: thought.mathematicalModel.ascii,
      },
    });

    addEdge(graph, {
      id: `edge_${typeId}_${modelId}`,
      source: typeId,
      target: modelId,
      label: 'contains',
      type: 'composition',
    });
  }

  // Add theorems
  if (thought.theorems && thought.theorems.length > 0) {
    thought.theorems.forEach((theorem, index) => {
      const theoremId = sanitizeId(`theorem_${index}`);
      addNode(graph, {
        id: theoremId,
        label: theorem.name || `Theorem ${index + 1}`,
        type: 'theorem',
        metadata: {
          statement: theorem.statement,
          hypotheses: theorem.hypotheses,
          conclusion: theorem.conclusion,
        },
      });

      addEdge(graph, {
        id: `edge_${typeId}_${theoremId}`,
        source: typeId,
        target: theoremId,
        label: 'uses',
        type: 'association',
      });
    });
  }

  // Add proof strategy with derivation steps
  if (thought.proofStrategy) {
    const strategyId = sanitizeId('strategy');
    addNode(graph, {
      id: strategyId,
      label: thought.proofStrategy.type,
      type: 'strategy',
      metadata: {
        proofType: thought.proofStrategy.type,
        completeness: thought.proofStrategy.completeness,
        baseCase: thought.proofStrategy.baseCase,
        inductiveStep: thought.proofStrategy.inductiveStep,
      },
    });

    addEdge(graph, {
      id: `edge_${typeId}_${strategyId}`,
      source: typeId,
      target: strategyId,
      label: 'applies',
      type: 'dependency',
    });

    // Add proof steps as nodes
    let prevStepId = strategyId;
    thought.proofStrategy.steps.forEach((step, index) => {
      const stepId = sanitizeId(`step_${index}`);
      addNode(graph, {
        id: stepId,
        label: includeLabels ? `Step ${index + 1}` : stepId,
        type: 'step',
        metadata: {
          stepNumber: index + 1,
          description: step,
        },
      });

      addEdge(graph, {
        id: `edge_${prevStepId}_${stepId}`,
        source: prevStepId,
        target: stepId,
        label: 'leads_to',
        type: 'sequence',
      });

      prevStepId = stepId;
    });
  }

  // Add assumptions as nodes
  if (thought.assumptions && thought.assumptions.length > 0) {
    thought.assumptions.forEach((assumption, index) => {
      const assumptionId = sanitizeId(`assumption_${index}`);
      addNode(graph, {
        id: assumptionId,
        label: includeLabels ? `Assumption ${index + 1}` : assumptionId,
        type: 'assumption',
        metadata: {
          description: assumption,
        },
      });

      addEdge(graph, {
        id: `edge_${typeId}_${assumptionId}`,
        source: typeId,
        target: assumptionId,
        label: 'assumes',
        type: 'dependency',
      });
    });
  }

  // Add metrics
  if (includeMetrics) {
    addMetric(graph, 'uncertainty', thought.uncertainty);
    addMetric(graph, 'theorem_count', thought.theorems?.length || 0);
    addMetric(graph, 'assumption_count', thought.assumptions?.length || 0);
    addMetric(graph, 'dependency_count', thought.dependencies?.length || 0);
    if (thought.proofStrategy) {
      addMetric(graph, 'proof_completeness', thought.proofStrategy.completeness);
      addMetric(graph, 'proof_step_count', thought.proofStrategy.steps.length);
    }
  }

  return serializeGraph(graph);
}

/**
 * Export mathematics reasoning to Markdown format
 */
function mathematicsToMarkdown(thought: MathematicsThought, options: VisualExportOptions): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
    includeMetrics = true,
  } = options;

  const parts: string[] = [];

  // Type and Uncertainty
  const typeContent = keyValueSection({
    'Type': (thought.thoughtType || 'proof').replace(/_/g, ' '),
    'Uncertainty': `${(thought.uncertainty * 100).toFixed(1)}%`,
  });
  parts.push(section('Overview', typeContent));

  // Mathematical Model
  if (thought.mathematicalModel) {
    const modelContent = keyValueSection({
      'LaTeX': `\`${thought.mathematicalModel.latex}\``,
      'Symbolic': `\`${thought.mathematicalModel.symbolic}\``,
      'ASCII': thought.mathematicalModel.ascii ? `\`${thought.mathematicalModel.ascii}\`` : 'N/A',
    });
    parts.push(section('Mathematical Model', modelContent));
  }

  // Metrics
  if (includeMetrics) {
    const metricsContent = keyValueSection({
      'Uncertainty': `${(thought.uncertainty * 100).toFixed(1)}%`,
      'Theorems': thought.theorems?.length || 0,
      'Assumptions': thought.assumptions?.length || 0,
      'Proof Completeness': thought.proofStrategy ? `${(thought.proofStrategy.completeness * 100).toFixed(0)}%` : 'N/A',
    });
    parts.push(section('Metrics', metricsContent));
  }

  // Proof Strategy
  if (thought.proofStrategy) {
    let proofContent = `**Type:** ${thought.proofStrategy.type}\n\n`;
    proofContent += `**Completeness:** ${(thought.proofStrategy.completeness * 100).toFixed(0)}%\n\n`;
    proofContent += '**Steps:**\n\n';

    const stepItems = thought.proofStrategy.steps.map((step, index) =>
      `${index + 1}. ${step}`
    );
    proofContent += list(stepItems, 'numbered');

    if (thought.proofStrategy.baseCase) {
      proofContent += `\n**Base Case:** ${thought.proofStrategy.baseCase}\n`;
    }
    if (thought.proofStrategy.inductiveStep) {
      proofContent += `\n**Inductive Step:** ${thought.proofStrategy.inductiveStep}\n`;
    }

    parts.push(section('Proof Strategy', proofContent));
  }

  // Theorems
  if (thought.theorems && thought.theorems.length > 0) {
    const theoremItems = thought.theorems.map(theorem =>
      `**${theorem.name}**: ${theorem.statement}\n  - Hypotheses: ${theorem.hypotheses.join(', ')}\n  - Conclusion: ${theorem.conclusion}`
    );
    parts.push(section('Theorems', list(theoremItems)));
  }

  // Assumptions
  if (thought.assumptions && thought.assumptions.length > 0) {
    parts.push(section('Assumptions', list(thought.assumptions)));
  }

  // Dependencies
  if (thought.dependencies && thought.dependencies.length > 0) {
    parts.push(section('Dependencies', list(thought.dependencies)));
  }

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaidDiagram = mathematicsToMermaid(thought, 'default', true, true);
    parts.push(section('Derivation Diagram', mermaidBlock(mermaidDiagram)));
  }

  return mdDocument('Mathematics Analysis', parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: { mode: 'mathematics' },
  });
}
