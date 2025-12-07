/**
 * First Principles Visual Exporter (v7.0.3)
 * Sprint 8 Task 8.1: First principles derivation export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support, GraphML, TikZ
 */

import type { FirstPrinciplesThought } from '../../types/index.js';
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
  calculateSVGHeight,
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
  renderList,
} from './html-utils.js';

/**
 * Export first-principles derivation chain to visual format
 */
export function exportFirstPrinciplesDerivation(thought: FirstPrinciplesThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return firstPrinciplesToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return firstPrinciplesToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return firstPrinciplesToASCII(thought);
    case 'svg':
      return firstPrinciplesToSVG(thought, options);
    case 'graphml':
      return firstPrinciplesToGraphML(thought, options);
    case 'tikz':
      return firstPrinciplesToTikZ(thought, options);
    case 'html':
      return firstPrinciplesToHTML(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function firstPrinciplesToMermaid(
  thought: FirstPrinciplesThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TD\n';

  mermaid += `  Q["Question: ${thought.question}"]\n`;
  mermaid += '\n';

  for (const principle of thought.principles) {
    const principleId = sanitizeId(principle.id);
    const label = includeLabels
      ? `${principle.type.toUpperCase()}: ${principle.statement.substring(0, 50)}...`
      : principleId;

    let shape: [string, string];
    switch (principle.type) {
      case 'axiom':
        shape = ['([', '])'];
        break;
      case 'definition':
        shape = ['[[', ']]'];
        break;
      case 'observation':
        shape = ['[(', ')]'];
        break;
      case 'logical_inference':
        shape = ['[', ']'];
        break;
      case 'assumption':
        shape = ['{', '}'];
        break;
      default:
        shape = ['[', ']'];
    }

    mermaid += `  ${principleId}${shape[0]}${label}${shape[1]}\n`;

    if (principle.dependsOn) {
      for (const depId of principle.dependsOn) {
        const sanitizedDepId = sanitizeId(depId);
        mermaid += `  ${sanitizedDepId} --> ${principleId}\n`;
      }
    }
  }

  mermaid += '\n';

  for (const step of thought.derivationSteps) {
    const stepId = `Step${step.stepNumber}`;
    const principleId = sanitizeId(step.principle);
    const label = includeLabels
      ? `Step ${step.stepNumber}: ${step.inference.substring(0, 50)}...`
      : stepId;

    mermaid += `  ${stepId}["${label}"]\n`;
    mermaid += `  ${principleId} -.->|applies| ${stepId}\n`;

    if (includeMetrics && step.confidence !== undefined) {
      mermaid += `  ${stepId} -.->|conf: ${step.confidence.toFixed(2)}| ${stepId}\n`;
    }
  }

  mermaid += '\n';

  const conclusionLabel = includeLabels
    ? `Conclusion: ${thought.conclusion.statement.substring(0, 50)}...`
    : 'Conclusion';
  mermaid += `  C["${conclusionLabel}"]\n`;

  for (const stepNum of thought.conclusion.derivationChain) {
    mermaid += `  Step${stepNum} --> C\n`;
  }

  if (includeMetrics) {
    mermaid += `  C -.->|certainty: ${thought.conclusion.certainty.toFixed(2)}| C\n`;
  }

  if (colorScheme !== 'monochrome') {
    mermaid += '\n';

    const axiomColor = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
    const definitionColor = colorScheme === 'pastel' ? '#f3e5f5' : '#ce93d8';
    const observationColor = colorScheme === 'pastel' ? '#fff3e0' : '#ffd699';
    const inferenceColor = colorScheme === 'pastel' ? '#e8f5e9' : '#a5d6a7';
    const assumptionColor = colorScheme === 'pastel' ? '#ffebee' : '#ef9a9a';

    for (const principle of thought.principles) {
      const principleId = sanitizeId(principle.id);
      let color = axiomColor;
      switch (principle.type) {
        case 'axiom': color = axiomColor; break;
        case 'definition': color = definitionColor; break;
        case 'observation': color = observationColor; break;
        case 'logical_inference': color = inferenceColor; break;
        case 'assumption': color = assumptionColor; break;
      }
      mermaid += `  style ${principleId} fill:${color}\n`;
    }

    const conclusionColor = colorScheme === 'pastel' ? '#c8e6c9' : '#66bb6a';
    mermaid += `  style C fill:${conclusionColor}\n`;
  }

  return mermaid;
}

function firstPrinciplesToDOT(
  thought: FirstPrinciplesThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph FirstPrinciples {\n';
  dot += '  rankdir=TD;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  dot += `  Q [label="Question:\\n${thought.question}", shape=ellipse, style=bold];\n\n`;

  for (const principle of thought.principles) {
    const principleId = sanitizeId(principle.id);
    const label = includeLabels
      ? `${principle.type.toUpperCase()}:\\n${principle.statement.substring(0, 60)}...`
      : principleId;

    let shape = 'box';
    switch (principle.type) {
      case 'axiom': shape = 'ellipse'; break;
      case 'definition': shape = 'box'; break;
      case 'observation': shape = 'cylinder'; break;
      case 'logical_inference': shape = 'box'; break;
      case 'assumption': shape = 'diamond'; break;
    }

    const confidenceLabel = includeMetrics && principle.confidence
      ? `\\nconf: ${principle.confidence.toFixed(2)}`
      : '';
    dot += `  ${principleId} [label="${label}${confidenceLabel}", shape=${shape}];\n`;

    if (principle.dependsOn) {
      for (const depId of principle.dependsOn) {
        const sanitizedDepId = sanitizeId(depId);
        dot += `  ${sanitizedDepId} -> ${principleId};\n`;
      }
    }
  }

  dot += '\n';

  for (const step of thought.derivationSteps) {
    const stepId = `Step${step.stepNumber}`;
    const principleId = sanitizeId(step.principle);
    const label = includeLabels
      ? `Step ${step.stepNumber}:\\n${step.inference.substring(0, 60)}...`
      : stepId;

    const confidenceLabel = includeMetrics
      ? `\\nconf: ${step.confidence.toFixed(2)}`
      : '';
    dot += `  ${stepId} [label="${label}${confidenceLabel}"];\n`;
    dot += `  ${principleId} -> ${stepId} [style=dashed, label="applies"];\n`;
  }

  dot += '\n';

  const conclusionLabel = includeLabels
    ? `Conclusion:\\n${thought.conclusion.statement.substring(0, 60)}...`
    : 'Conclusion';
  const certaintyLabel = includeMetrics
    ? `\\ncertainty: ${thought.conclusion.certainty.toFixed(2)}`
    : '';
  dot += `  C [label="${conclusionLabel}${certaintyLabel}", shape=doubleoctagon, style=bold];\n`;

  for (const stepNum of thought.conclusion.derivationChain) {
    dot += `  Step${stepNum} -> C;\n`;
  }

  dot += '}\n';
  return dot;
}

function firstPrinciplesToASCII(thought: FirstPrinciplesThought): string {
  let ascii = 'First-Principles Derivation:\n';
  ascii += '============================\n\n';

  ascii += `Question: ${thought.question}\n\n`;

  ascii += 'Foundational Principles:\n';
  ascii += '------------------------\n';
  for (const principle of thought.principles) {
    ascii += `[${principle.id}] ${principle.type.toUpperCase()}\n`;
    ascii += `  Statement: ${principle.statement}\n`;
    ascii += `  Justification: ${principle.justification}\n`;
    if (principle.dependsOn && principle.dependsOn.length > 0) {
      ascii += `  Depends on: ${principle.dependsOn.join(', ')}\n`;
    }
    if (principle.confidence !== undefined) {
      ascii += `  Confidence: ${principle.confidence.toFixed(2)}\n`;
    }
    ascii += '\n';
  }

  ascii += 'Derivation Chain:\n';
  ascii += '----------------\n';
  for (const step of thought.derivationSteps) {
    ascii += `Step ${step.stepNumber} (using principle: ${step.principle})\n`;
    ascii += `  Inference: ${step.inference}\n`;
    if (step.logicalForm) {
      ascii += `  Logical form: ${step.logicalForm}\n`;
    }
    ascii += `  Confidence: ${step.confidence.toFixed(2)}\n`;
    ascii += '\n';
  }

  ascii += 'Conclusion:\n';
  ascii += '----------\n';
  ascii += `${thought.conclusion.statement}\n`;
  ascii += `Derivation chain: Steps [${thought.conclusion.derivationChain.join(', ')}]\n`;
  ascii += `Certainty: ${thought.conclusion.certainty.toFixed(2)}\n`;

  if (thought.conclusion.limitations && thought.conclusion.limitations.length > 0) {
    ascii += '\nLimitations:\n';
    for (const limitation of thought.conclusion.limitations) {
      ascii += `  - ${limitation}\n`;
    }
  }

  if (thought.alternativeInterpretations && thought.alternativeInterpretations.length > 0) {
    ascii += '\nAlternative Interpretations:\n';
    for (const alt of thought.alternativeInterpretations) {
      ascii += `  - ${alt}\n`;
    }
  }

  return ascii;
}

/**
 * Export first-principles derivation chain to native SVG format
 */
function firstPrinciplesToSVG(thought: FirstPrinciplesThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
  } = options;

  const positions = new Map<string, SVGNodePosition>();
  const nodeWidth = 150;
  const nodeHeight = 40;

  // Position principles at the top
  const principleY = 100;
  const principleSpacing = Math.min(180, svgWidth / (thought.principles.length + 1));
  const principleStartX = (svgWidth - (thought.principles.length - 1) * principleSpacing) / 2;
  thought.principles.forEach((p, index) => {
    positions.set(p.id, {
      id: p.id,
      label: includeLabels ? `${p.type}: ${p.statement.substring(0, 30)}...` : p.id,
      x: principleStartX + index * principleSpacing,
      y: principleY,
      width: nodeWidth,
      height: nodeHeight,
      type: p.type,
    });
  });

  // Add derivation steps
  const stepY = 250;
  thought.derivationSteps.forEach((step, index) => {
    const stepId = `Step${step.stepNumber}`;
    positions.set(stepId, {
      id: stepId,
      label: includeLabels ? `Step ${step.stepNumber}` : stepId,
      x: 150 + index * 200,
      y: stepY,
      width: nodeWidth,
      height: nodeHeight,
      type: 'step',
    });
  });

  // Add conclusion
  positions.set('conclusion', {
    id: 'conclusion',
    label: includeLabels ? `Conclusion: ${thought.conclusion.statement.substring(0, 30)}...` : 'Conclusion',
    x: svgWidth / 2,
    y: stepY + 150,
    width: nodeWidth,
    height: nodeHeight,
    type: 'conclusion',
  });

  const actualHeight = calculateSVGHeight(positions);

  let svg = generateSVGHeader(svgWidth, actualHeight, 'First Principles Derivation');

  // Render edges
  svg += '\n  <!-- Edges -->\n  <g class="edges">';

  // Edges from principles to steps
  for (const step of thought.derivationSteps) {
    const principlePos = positions.get(step.principle);
    const stepPos = positions.get(`Step${step.stepNumber}`);
    if (principlePos && stepPos) {
      svg += renderEdge(principlePos, stepPos, { style: 'dashed', label: 'applies' });
    }
  }

  // Edges from steps to conclusion
  const conclusionPos = positions.get('conclusion')!;
  for (const stepNum of thought.conclusion.derivationChain) {
    const stepPos = positions.get(`Step${stepNum}`);
    if (stepPos) {
      svg += renderEdge(stepPos, conclusionPos);
    }
  }

  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';

  const axiomColors = getNodeColor('primary', colorScheme);
  const stepColors = getNodeColor('neutral', colorScheme);
  const conclusionColors = getNodeColor('success', colorScheme);

  for (const [id, pos] of positions) {
    if (id === 'conclusion') {
      svg += renderStadiumNode(pos, conclusionColors);
    } else if (id.startsWith('Step')) {
      svg += renderRectNode(pos, stepColors);
    } else {
      svg += renderEllipseNode(pos, axiomColors);
    }
  }
  svg += '\n  </g>';

  // Render metrics panel
  if (includeMetrics) {
    const metrics = [
      { label: 'Principles', value: thought.principles.length },
      { label: 'Steps', value: thought.derivationSteps.length },
      { label: 'Certainty', value: thought.conclusion.certainty.toFixed(2) },
    ];
    svg += renderMetricsPanel(svgWidth - 180, actualHeight - 110, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Principle', color: axiomColors, shape: 'ellipse' as const },
    { label: 'Derivation Step', color: stepColors },
    { label: 'Conclusion', color: conclusionColors, shape: 'stadium' as const },
  ];
  svg += renderLegend(20, actualHeight - 100, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}

/**
 * Export first-principles derivation chain to GraphML format
 */
function firstPrinciplesToGraphML(thought: FirstPrinciplesThought, options: VisualExportOptions): string {
  const { includeLabels = true } = options;

  const nodes: GraphMLNode[] = [];
  const edges: GraphMLEdge[] = [];
  let edgeCount = 0;

  // Add question node
  nodes.push({
    id: 'question',
    label: includeLabels ? `Question: ${thought.question}` : 'Question',
    type: 'question',
  });

  // Add principle nodes
  for (const principle of thought.principles) {
    const principleId = sanitizeId(principle.id);
    nodes.push({
      id: principleId,
      label: includeLabels
        ? `${principle.type.toUpperCase()}: ${principle.statement.substring(0, 60)}...`
        : principleId,
      type: principle.type,
      metadata: {
        justification: principle.justification,
        confidence: principle.confidence,
      },
    });

    // Add edges from dependencies
    if (principle.dependsOn) {
      for (const depId of principle.dependsOn) {
        const sanitizedDepId = sanitizeId(depId);
        edges.push({
          id: `e${edgeCount++}`,
          source: sanitizedDepId,
          target: principleId,
          label: 'depends on',
          directed: true,
        });
      }
    }
  }

  // Add derivation step nodes
  for (const step of thought.derivationSteps) {
    const stepId = `Step${step.stepNumber}`;
    nodes.push({
      id: stepId,
      label: includeLabels
        ? `Step ${step.stepNumber}: ${step.inference.substring(0, 60)}...`
        : stepId,
      type: 'derivation_step',
      metadata: {
        logicalForm: step.logicalForm,
        confidence: step.confidence,
      },
    });

    // Edge from principle to step
    const principleId = sanitizeId(step.principle);
    edges.push({
      id: `e${edgeCount++}`,
      source: principleId,
      target: stepId,
      label: 'applies',
      directed: true,
    });
  }

  // Add conclusion node
  nodes.push({
    id: 'conclusion',
    label: includeLabels
      ? `Conclusion: ${thought.conclusion.statement.substring(0, 60)}...`
      : 'Conclusion',
    type: 'conclusion',
    metadata: {
      certainty: thought.conclusion.certainty,
      limitations: thought.conclusion.limitations,
    },
  });

  // Edges from derivation steps to conclusion
  for (const stepNum of thought.conclusion.derivationChain) {
    edges.push({
      id: `e${edgeCount++}`,
      source: `Step${stepNum}`,
      target: 'conclusion',
      directed: true,
    });
  }

  return generateGraphML(nodes, edges, {
    graphName: 'First Principles Derivation',
    directed: true,
    includeLabels,
  });
}

/**
 * Export first-principles derivation chain to TikZ format
 */
function firstPrinciplesToTikZ(thought: FirstPrinciplesThought, options: VisualExportOptions): string {
  const { includeLabels = true, colorScheme = 'default' } = options;

  const nodes: TikZNode[] = [];
  const edges: TikZEdge[] = [];

  // Position principles at the top (stadium shape for axioms/principles)
  const principleCount = thought.principles.length;
  thought.principles.forEach((principle, index) => {
    const principleId = sanitizeId(principle.id);
    nodes.push({
      id: principleId,
      label: includeLabels
        ? `${principle.type}: ${principle.statement.substring(0, 25)}...`
        : principleId,
      x: index * 3,
      y: 0,
      type: principle.type === 'axiom' ? 'primary' : 'secondary',
      shape: 'stadium',
    });

    // Add edges for dependencies between principles
    if (principle.dependsOn) {
      for (const depId of principle.dependsOn) {
        const sanitizedDepId = sanitizeId(depId);
        edges.push({
          source: sanitizedDepId,
          target: principleId,
          directed: true,
          style: 'dashed',
        });
      }
    }
  });

  // Position derivation steps in the middle layer
  const stepY = -2;
  thought.derivationSteps.forEach((step, index) => {
    const stepId = `Step${step.stepNumber}`;
    const principleId = sanitizeId(step.principle);

    nodes.push({
      id: stepId,
      label: includeLabels ? `Step ${step.stepNumber}` : stepId,
      x: index * 3,
      y: stepY,
      type: 'neutral',
      shape: 'rectangle',
    });

    // Edge from principle to step
    edges.push({
      source: principleId,
      target: stepId,
      label: 'applies',
      directed: true,
      style: 'dashed',
    });
  });

  // Position conclusion at the bottom
  const conclusionX = (principleCount - 1) * 3 / 2; // Center it
  nodes.push({
    id: 'conclusion',
    label: includeLabels ? 'Conclusion' : 'C',
    x: conclusionX,
    y: -4,
    type: 'success',
    shape: 'stadium',
  });

  // Edges from derivation steps to conclusion
  for (const stepNum of thought.conclusion.derivationChain) {
    edges.push({
      source: `Step${stepNum}`,
      target: 'conclusion',
      directed: true,
    });
  }

  return generateTikZ(nodes, edges, {
    title: 'First Principles Derivation',
    colorScheme,
    includeLabels,
  });
}

/**
 * Export first-principles derivation to HTML format
 */
function firstPrinciplesToHTML(thought: FirstPrinciplesThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'First Principles Analysis',
    htmlTheme = 'light',
    includeMetrics = true,
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // Question
  html += renderSection('Question', `<p class="text-primary"><strong>${escapeHTML(thought.question)}</strong></p>`, '❓');

  // Metrics
  if (includeMetrics) {
    html += '<div class="metrics-grid">';
    html += renderMetricCard('Principles', thought.principles.length, 'primary');
    html += renderMetricCard('Derivation Steps', thought.derivationSteps.length, 'info');
    html += renderMetricCard('Certainty', (thought.conclusion.certainty * 100).toFixed(0) + '%', 'success');
    html += '</div>\n';
  }

  // Principles table
  const principleRows = thought.principles.map(p => {
    const typeBadge = renderBadge(p.type, p.type === 'axiom' ? 'primary' : p.type === 'observation' ? 'info' : 'secondary');
    return [
      p.id,
      typeBadge,
      p.statement,
      p.confidence !== undefined ? (p.confidence * 100).toFixed(0) + '%' : 'N/A',
    ];
  });
  html += renderSection('First Principles', renderTable(
    ['ID', 'Type', 'Statement', 'Confidence'],
    principleRows.map(row => row.map(cell => typeof cell === 'string' && cell.startsWith('<') ? cell : escapeHTML(String(cell))))
  ), '🏛️');

  // Derivation steps
  const stepRows = thought.derivationSteps.map(s => [
    s.stepNumber.toString(),
    s.principle,
    s.inference,
    s.logicalForm || '-',
  ]);
  html += renderSection('Derivation Chain', renderTable(
    ['Step', 'Principle', 'Inference', 'Logical Form'],
    stepRows
  ), '🔗');

  // Conclusion
  html += renderSection('Conclusion', `
    <div class="card">
      <div class="card-header">${escapeHTML(thought.conclusion.statement)}</div>
      <p><strong>Certainty:</strong> ${(thought.conclusion.certainty * 100).toFixed(0)}%</p>
      <p><strong>Derivation Chain:</strong> Steps ${thought.conclusion.derivationChain.join(' → ')}</p>
      ${thought.conclusion.limitations && thought.conclusion.limitations.length > 0 ? `
        <p><strong>Limitations:</strong></p>
        ${renderList(thought.conclusion.limitations)}
      ` : ''}
    </div>
  `, '✓');

  html += generateHTMLFooter(htmlStandalone);
  return html;
}
