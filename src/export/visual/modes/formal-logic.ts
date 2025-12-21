/**
 * Formal Logic Visual Exporter (v7.0.3)
 * Sprint 8 Task 8.1: Formal logic proof tree export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support, GraphML, TikZ
 */

import type { FormalLogicThought } from '../../../types/index.js';
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
} from '../utils/markdown.js';

/**
 * Export formal logic proof tree to visual format
 */
export function exportFormalLogicProof(thought: FormalLogicThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return formalLogicToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return formalLogicToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return formalLogicToASCII(thought);
    case 'svg':
      return formalLogicToSVG(thought, options);
    case 'graphml':
      return formalLogicToGraphML(thought, options);
    case 'tikz':
      return formalLogicToTikZ(thought, options);
    case 'html':
      return formalLogicToHTML(thought, options);
    case 'modelica':
      return formalLogicToModelica(thought, options);
    case 'uml':
      return formalLogicToUML(thought, options);
    case 'json':
      return formalLogicToJSON(thought, options);
    case 'markdown':
      return formalLogicToMarkdown(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function formalLogicToMermaid(
  thought: FormalLogicThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TD\n';

  if (thought.propositions && thought.propositions.length > 0) {
    mermaid += '  subgraph Propositions["Propositions"]\n';
    for (const proposition of thought.propositions) {
      const propId = sanitizeId(proposition.id);
      const label = includeLabels
        ? `${proposition.symbol}: ${proposition.statement.substring(0, 40)}...`
        : proposition.symbol;
      const shape = proposition.type === 'atomic' ? ['[', ']'] : ['[[', ']]'];
      mermaid += `    ${propId}${shape[0]}${label}${shape[1]}\n`;
    }
    mermaid += '  end\n\n';
  }

  if (thought.proof && thought.proof.steps && thought.proof.steps.length > 0) {
    mermaid += '  Theorem["Theorem"]\n';

    for (const step of thought.proof.steps) {
      const stepId = `Step${step.stepNumber}`;
      const label = includeLabels
        ? `${step.stepNumber}. ${step.statement.substring(0, 40)}...`
        : `Step ${step.stepNumber}`;

      mermaid += `  ${stepId}["${label}"]\n`;

      if (step.referencesSteps && step.referencesSteps.length > 0) {
        for (const refStep of step.referencesSteps) {
          mermaid += `  Step${refStep} --> ${stepId}\n`;
        }
      }
    }

    const lastStep = thought.proof.steps[thought.proof.steps.length - 1];
    mermaid += `  Step${lastStep.stepNumber} --> Theorem\n`;

    if (includeMetrics) {
      const completeness = (thought.proof.completeness * 100).toFixed(0);
      mermaid += `\n  Completeness["Completeness: ${completeness}%"]\n`;
      mermaid += `  Completeness -.-> Theorem\n`;
    }
  }

  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    mermaid += '\n';
    for (const inference of thought.logicalInferences) {
      const infId = sanitizeId(inference.id);
      const label = includeLabels ? inference.rule : infId;

      mermaid += `  ${infId}{{"${label}"}}\n`;

      if (inference.premises) {
        for (const premiseId of inference.premises) {
          const propId = sanitizeId(premiseId);
          mermaid += `  ${propId} --> ${infId}\n`;
        }
      }

      const conclusionId = sanitizeId(inference.conclusion);
      mermaid += `  ${infId} --> ${conclusionId}\n`;
    }
  }

  if (colorScheme !== 'monochrome') {
    mermaid += '\n';
    const atomicColor = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
    const compoundColor = colorScheme === 'pastel' ? '#fff3e0' : '#ffd699';

    if (thought.propositions) {
      for (const proposition of thought.propositions) {
        const propId = sanitizeId(proposition.id);
        const color = proposition.type === 'atomic' ? atomicColor : compoundColor;
        mermaid += `  style ${propId} fill:${color}\n`;
      }
    }
  }

  return mermaid;
}

function formalLogicToDOT(
  thought: FormalLogicThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph FormalLogic {\n';
  dot += '  rankdir=TD;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  if (thought.propositions && thought.propositions.length > 0) {
    dot += '  subgraph cluster_propositions {\n';
    dot += '    label="Propositions";\n';
    for (const proposition of thought.propositions) {
      const propId = sanitizeId(proposition.id);
      const label = includeLabels
        ? `${proposition.symbol}:\\n${proposition.statement.substring(0, 40)}...`
        : proposition.symbol;
      const shape = proposition.type === 'atomic' ? 'ellipse' : 'box';
      dot += `    ${propId} [label="${label}", shape=${shape}];\n`;
    }
    dot += '  }\n\n';
  }

  if (thought.proof && thought.proof.steps && thought.proof.steps.length > 0) {
    dot += `  Theorem [label="Theorem:\\n${thought.proof.theorem.substring(0, 50)}...", shape=doubleoctagon, style=bold];\n\n`;

    for (const step of thought.proof.steps) {
      const stepId = `Step${step.stepNumber}`;
      const label = includeLabels
        ? `${step.stepNumber}. ${step.statement.substring(0, 40)}...`
        : `Step ${step.stepNumber}`;
      const ruleLabel = step.rule ? `\\n(${step.rule})` : '';

      dot += `  ${stepId} [label="${label}${ruleLabel}"];\n`;

      if (step.referencesSteps) {
        for (const refStep of step.referencesSteps) {
          dot += `  Step${refStep} -> ${stepId};\n`;
        }
      }
    }

    const lastStep = thought.proof.steps[thought.proof.steps.length - 1];
    dot += `  Step${lastStep.stepNumber} -> Theorem;\n`;

    if (includeMetrics) {
      const completeness = (thought.proof.completeness * 100).toFixed(0);
      dot += `\n  Completeness [label="Completeness: ${completeness}%", shape=note];\n`;
    }
  }

  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    dot += '\n';
    for (const inference of thought.logicalInferences) {
      const infId = sanitizeId(inference.id);
      const label = includeLabels ? inference.rule : infId;

      dot += `  ${infId} [label="${label}", shape=diamond];\n`;

      if (inference.premises) {
        for (const premiseId of inference.premises) {
          const propId = sanitizeId(premiseId);
          dot += `  ${propId} -> ${infId};\n`;
        }
      }

      const conclusionId = sanitizeId(inference.conclusion);
      dot += `  ${infId} -> ${conclusionId};\n`;
    }
  }

  dot += '}\n';
  return dot;
}

function formalLogicToASCII(thought: FormalLogicThought): string {
  let ascii = 'Formal Logic Proof:\n';
  ascii += '==================\n\n';

  if (thought.propositions && thought.propositions.length > 0) {
    ascii += 'Propositions:\n';
    for (const proposition of thought.propositions) {
      const typeMarker = proposition.type === 'atomic' ? '●' : '◆';
      ascii += `  ${typeMarker} ${proposition.symbol}: ${proposition.statement}\n`;
    }
    ascii += '\n';
  }

  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    ascii += 'Inferences:\n';
    for (const inference of thought.logicalInferences) {
      ascii += `  [${inference.rule}]\n`;
      ascii += `    Premises: ${inference.premises.join(', ')}\n`;
      ascii += `    Conclusion: ${inference.conclusion}\n`;
      ascii += `    Valid: ${inference.valid ? '✓' : '✗'}\n`;
    }
    ascii += '\n';
  }

  if (thought.proof) {
    ascii += `Proof: ${thought.proof.theorem}\n`;
    ascii += `Technique: ${thought.proof.technique}\n`;
    ascii += `Completeness: ${(thought.proof.completeness * 100).toFixed(0)}%\n\n`;

    if (thought.proof.steps && thought.proof.steps.length > 0) {
      ascii += 'Proof Steps:\n';
      for (const step of thought.proof.steps) {
        ascii += `  ${step.stepNumber}. ${step.statement}\n`;
        ascii += `     Justification: ${step.justification}\n`;
      }
      ascii += '\n';
    }

    ascii += `Conclusion: ${thought.proof.conclusion}\n`;
    ascii += `Valid: ${thought.proof.valid ? '✓' : '✗'}\n`;
  }

  if (thought.truthTable) {
    ascii += '\nTruth Table:\n';
    ascii += `  Tautology: ${thought.truthTable.isTautology ? '✓' : '✗'}\n`;
    ascii += `  Contradiction: ${thought.truthTable.isContradiction ? '✓' : '✗'}\n`;
    ascii += `  Contingent: ${thought.truthTable.isContingent ? '✓' : '✗'}\n`;
  }

  return ascii;
}

/**
 * Export formal logic proof tree to native SVG format
 */
function formalLogicToSVG(thought: FormalLogicThought, options: VisualExportOptions): string {
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

  // Propositions at the top
  if (thought.propositions) {
    const propSpacing = Math.min(180, svgWidth / (thought.propositions.length + 1));
    const propStartX = (svgWidth - (thought.propositions.length - 1) * propSpacing) / 2;
    thought.propositions.forEach((prop, index) => {
      positions.set(prop.id, {
        id: prop.id,
        label: includeLabels ? `${prop.symbol}: ${prop.statement.substring(0, 20)}...` : prop.symbol,
        x: propStartX + index * propSpacing,
        y: 80,
        width: nodeWidth,
        height: nodeHeight,
        type: prop.type,
      });
    });
  }

  // Proof steps in the middle
  if (thought.proof && thought.proof.steps) {
    thought.proof.steps.forEach((step, index) => {
      const stepId = `Step${step.stepNumber}`;
      positions.set(stepId, {
        id: stepId,
        label: includeLabels ? `${step.stepNumber}. ${step.statement.substring(0, 25)}...` : `Step ${step.stepNumber}`,
        x: 150 + index * 180,
        y: 250,
        width: nodeWidth,
        height: nodeHeight,
        type: 'step',
      });
    });
  }

  // Theorem at the bottom
  if (thought.proof) {
    positions.set('Theorem', {
      id: 'Theorem',
      label: 'Theorem',
      x: svgWidth / 2,
      y: 420,
      width: nodeWidth,
      height: nodeHeight,
      type: 'theorem',
    });
  }

  let svg = generateSVGHeader(svgWidth, svgHeight, 'Formal Logic Proof');

  // Render edges
  svg += '\n  <!-- Edges -->\n  <g class="edges">';

  // Edges from steps to theorem
  if (thought.proof && thought.proof.steps) {
    const theoremPos = positions.get('Theorem');
    for (const step of thought.proof.steps) {
      const stepPos = positions.get(`Step${step.stepNumber}`);
      if (stepPos && theoremPos) {
        svg += renderEdge(stepPos, theoremPos);
      }

      // Edges between steps (references)
      if (step.referencesSteps) {
        for (const refStepNum of step.referencesSteps) {
          const refStepPos = positions.get(`Step${refStepNum}`);
          if (refStepPos && stepPos) {
            svg += renderEdge(refStepPos, stepPos, { style: 'dashed' });
          }
        }
      }
    }
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';

  const atomicColors = getNodeColor('primary', colorScheme);
  const compoundColors = getNodeColor('secondary', colorScheme);
  const stepColors = getNodeColor('neutral', colorScheme);
  const theoremColors = getNodeColor('success', colorScheme);

  for (const [, pos] of positions) {
    if (pos.type === 'theorem') {
      svg += renderStadiumNode(pos, theoremColors);
    } else if (pos.type === 'step') {
      svg += renderRectNode(pos, stepColors);
    } else if (pos.type === 'atomic') {
      svg += renderEllipseNode(pos, atomicColors);
    } else {
      svg += renderRectNode(pos, compoundColors);
    }
  }
  svg += '\n  </g>';

  // Render metrics panel
  if (includeMetrics) {
    const metrics = [
      { label: 'Propositions', value: thought.propositions?.length || 0 },
      { label: 'Proof Steps', value: thought.proof?.steps?.length || 0 },
      { label: 'Completeness', value: thought.proof ? `${(thought.proof.completeness * 100).toFixed(0)}%` : 'N/A' },
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 110, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Atomic', color: atomicColors, shape: 'ellipse' as const },
    { label: 'Compound', color: compoundColors },
    { label: 'Proof Step', color: stepColors },
    { label: 'Theorem', color: theoremColors, shape: 'stadium' as const },
  ];
  svg += renderLegend(20, svgHeight - 130, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}

/**
 * Export formal logic proof tree to GraphML format
 */
function formalLogicToGraphML(thought: FormalLogicThought, options: VisualExportOptions): string {
  const { includeLabels = true } = options;

  const nodes: GraphMLNode[] = [];
  const edges: GraphMLEdge[] = [];
  let edgeCount = 0;

  // Add propositions (premises)
  if (thought.propositions && thought.propositions.length > 0) {
    for (const proposition of thought.propositions) {
      nodes.push({
        id: sanitizeId(proposition.id),
        label: includeLabels
          ? `${proposition.symbol}: ${proposition.statement}`
          : proposition.symbol,
        type: 'premise',
        metadata: {
          propositionType: proposition.type,
          description: proposition.statement,
        },
      });
    }
  }

  // Add logical inferences (inference rules)
  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    for (const inference of thought.logicalInferences) {
      const infId = sanitizeId(inference.id);
      nodes.push({
        id: infId,
        label: includeLabels ? inference.rule : infId,
        type: 'inference',
        metadata: {
          rule: inference.rule,
          valid: inference.valid,
        },
      });

      // Create edges from premises to inference
      if (inference.premises) {
        for (const premiseId of inference.premises) {
          edges.push({
            id: `e${edgeCount++}`,
            source: sanitizeId(premiseId),
            target: infId,
            directed: true,
            metadata: { type: 'premise-to-inference' },
          });
        }
      }

      // Create edge from inference to conclusion
      edges.push({
        id: `e${edgeCount++}`,
        source: infId,
        target: sanitizeId(inference.conclusion),
        directed: true,
        metadata: { type: 'inference-to-conclusion' },
      });
    }
  }

  // Add proof steps
  if (thought.proof && thought.proof.steps && thought.proof.steps.length > 0) {
    for (const step of thought.proof.steps) {
      const stepId = `Step${step.stepNumber}`;
      nodes.push({
        id: stepId,
        label: includeLabels
          ? `${step.stepNumber}. ${step.statement}`
          : `Step ${step.stepNumber}`,
        type: 'proof-step',
        metadata: {
          stepNumber: step.stepNumber,
          justification: step.justification,
          rule: step.rule,
        },
      });

      // Create edges between referenced steps
      if (step.referencesSteps && step.referencesSteps.length > 0) {
        for (const refStep of step.referencesSteps) {
          edges.push({
            id: `e${edgeCount++}`,
            source: `Step${refStep}`,
            target: stepId,
            directed: true,
            metadata: { type: 'step-reference' },
          });
        }
      }
    }

    // Add theorem/conclusion node
    nodes.push({
      id: 'Theorem',
      label: includeLabels ? thought.proof.theorem : 'Theorem',
      type: 'conclusion',
      metadata: {
        theorem: thought.proof.theorem,
        valid: thought.proof.valid,
        completeness: thought.proof.completeness,
      },
    });

    // Connect last step to theorem
    const lastStep = thought.proof.steps[thought.proof.steps.length - 1];
    edges.push({
      id: `e${edgeCount++}`,
      source: `Step${lastStep.stepNumber}`,
      target: 'Theorem',
      directed: true,
      metadata: { type: 'step-to-theorem' },
    });
  }

  return generateGraphML(nodes, edges, {
    graphName: 'Formal Logic Proof',
    directed: true,
    includeLabels,
  });
}

/**
 * Export formal logic proof tree to TikZ format
 */
function formalLogicToTikZ(thought: FormalLogicThought, options: VisualExportOptions): string {
  const { includeLabels = true, colorScheme = 'default' } = options;

  const nodes: TikZNode[] = [];
  const edges: TikZEdge[] = [];
  let currentY = 0;

  // Add propositions (premises) at the top with stadium shape
  if (thought.propositions && thought.propositions.length > 0) {
    thought.propositions.forEach((proposition, index) => {
      nodes.push({
        id: sanitizeId(proposition.id),
        label: includeLabels
          ? `${proposition.symbol}: ${proposition.statement.substring(0, 30)}...`
          : proposition.symbol,
        x: index * 3,
        y: currentY,
        type: 'premise',
        shape: 'stadium',
      });
    });
    currentY -= 2.5;
  }

  // Add logical inferences (inference rules) in the middle with rectangle shape
  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    thought.logicalInferences.forEach((inference, index) => {
      const infId = sanitizeId(inference.id);
      nodes.push({
        id: infId,
        label: includeLabels ? inference.rule : infId,
        x: index * 3,
        y: currentY,
        type: 'inference',
        shape: 'rectangle',
      });

      // Create edges from premises to inference
      if (inference.premises) {
        for (const premiseId of inference.premises) {
          edges.push({
            source: sanitizeId(premiseId),
            target: infId,
            directed: true,
          });
        }
      }

      // Create edge from inference to conclusion
      edges.push({
        source: infId,
        target: sanitizeId(inference.conclusion),
        directed: true,
      });
    });
    currentY -= 2.5;
  }

  // Add proof steps in the middle with rectangle shape
  if (thought.proof && thought.proof.steps && thought.proof.steps.length > 0) {
    thought.proof.steps.forEach((step, index) => {
      const stepId = `Step${step.stepNumber}`;
      nodes.push({
        id: stepId,
        label: includeLabels
          ? `${step.stepNumber}. ${step.statement.substring(0, 20)}...`
          : `Step ${step.stepNumber}`,
        x: index * 3,
        y: currentY,
        type: 'neutral',
        shape: 'rectangle',
      });

      // Create edges between referenced steps
      if (step.referencesSteps && step.referencesSteps.length > 0) {
        for (const refStep of step.referencesSteps) {
          edges.push({
            source: `Step${refStep}`,
            target: stepId,
            directed: true,
            style: 'dashed',
          });
        }
      }
    });
    currentY -= 2.5;

    // Add theorem/conclusion at the bottom with ellipse shape
    nodes.push({
      id: 'Theorem',
      label: includeLabels ? 'Theorem' : 'T',
      x: (thought.proof.steps.length - 1) * 1.5,
      y: currentY,
      type: 'conclusion',
      shape: 'ellipse',
    });

    // Connect last step to theorem
    const lastStep = thought.proof.steps[thought.proof.steps.length - 1];
    edges.push({
      source: `Step${lastStep.stepNumber}`,
      target: 'Theorem',
      directed: true,
    });
  }

  return generateTikZ(nodes, edges, {
    title: 'Formal Logic Proof',
    colorScheme,
    includeLabels,
  });
}

/**
 * Export formal logic proof tree to HTML format
 */
function formalLogicToHTML(thought: FormalLogicThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Formal Logic Analysis',
    htmlTheme = 'light',
    includeMetrics = true,
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // Proof Overview
  if (thought.proof) {
    const validBadge = thought.proof.valid ? renderBadge('VALID', 'success') : renderBadge('INVALID', 'danger');
    const proofContent = `
      <p><strong>Theorem:</strong> ${escapeHTML(thought.proof.theorem)}</p>
      <p><strong>Technique:</strong> ${escapeHTML(thought.proof.technique)}</p>
      <p><strong>Validity:</strong> ${validBadge}</p>
      <p><strong>Completeness:</strong> ${(thought.proof.completeness * 100).toFixed(0)}%</p>
      ${renderProgressBar(thought.proof.completeness * 100, 'primary')}
    `;
    html += renderSection('Proof', proofContent, '📋');
  }

  // Metrics
  if (includeMetrics) {
    html += '<div class="metrics-grid">\n';
    html += renderMetricCard('Propositions', thought.propositions?.length || 0, 'primary');
    html += renderMetricCard('Inferences', thought.logicalInferences?.length || 0, 'info');
    html += renderMetricCard('Proof Steps', thought.proof?.steps?.length || 0, 'secondary');
    html += renderMetricCard('Completeness', thought.proof ? `${(thought.proof.completeness * 100).toFixed(0)}%` : 'N/A', 'success');
    html += '</div>\n';
  }

  // Propositions
  if (thought.propositions && thought.propositions.length > 0) {
    const propositionRows = thought.propositions.map(p => [
      p.symbol,
      p.type,
      p.statement,
      p.truthValue !== undefined ? String(p.truthValue) : 'N/A',
    ]);
    const propositionsTable = renderTable(
      ['Symbol', 'Type', 'Statement', 'Truth Value'],
      propositionRows,
      { caption: 'Propositions' }
    );
    html += renderSection('Propositions', propositionsTable, '💭');
  }

  // Logical Inferences
  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    let inferencesContent = '';
    for (const inference of thought.logicalInferences) {
      const validBadge = inference.valid ? renderBadge('VALID', 'success') : renderBadge('INVALID', 'danger');
      inferencesContent += `
        <div class="card">
          <div class="card-header">${inference.rule ? escapeHTML(inference.rule) : '-'} ${validBadge}</div>
          <p><strong>Premises:</strong> ${inference.premises ? inference.premises.map(p => p ? escapeHTML(p) : '-').join(', ') : '-'}</p>
          <p><strong>Conclusion:</strong> ${inference.conclusion ? escapeHTML(inference.conclusion) : '-'}</p>
        </div>
      `;
    }
    html += renderSection('Logical Inferences', inferencesContent, '🔗');
  }

  // Proof Steps
  if (thought.proof && thought.proof.steps && thought.proof.steps.length > 0) {
    let stepsContent = '<ol>';
    for (const step of thought.proof.steps) {
      stepsContent += `
        <li>
          <strong>${step.statement ? escapeHTML(step.statement) : '-'}</strong>
          <p><em>Justification:</em> ${step.justification ? escapeHTML(step.justification) : '-'}</p>
          ${step.rule ? `<p><em>Rule:</em> ${renderBadge(step.rule, 'info')}</p>` : ''}
          ${step.referencesSteps && step.referencesSteps.length > 0 ? `<p><em>References steps:</em> ${step.referencesSteps.join(', ')}</p>` : ''}
        </li>
      `;
    }
    stepsContent += '</ol>';
    html += renderSection('Proof Steps', stepsContent, '📝');
  }

  // Conclusion
  if (thought.proof) {
    const conclusionBadge = thought.proof.valid ? renderBadge('PROVEN', 'success') : renderBadge('NOT PROVEN', 'danger');
    const conclusionContent = `
      <p>${conclusionBadge}</p>
      <p>${thought.proof.conclusion ? escapeHTML(thought.proof.conclusion) : '-'}</p>
    `;
    html += renderSection('Conclusion', conclusionContent, '✅');
  }

  // Truth Table (if present)
  if (thought.truthTable) {
    const truthTableContent = `
      <p><strong>Tautology:</strong> ${thought.truthTable.isTautology ? '✓' : '✗'}</p>
      <p><strong>Contradiction:</strong> ${thought.truthTable.isContradiction ? '✓' : '✗'}</p>
      <p><strong>Contingent:</strong> ${thought.truthTable.isContingent ? '✓' : '✗'}</p>
    `;
    html += renderSection('Truth Table', truthTableContent, '📊');
  }

  html += generateHTMLFooter(htmlStandalone);
  return html;
}

/**
 * Export formal logic proof tree to Modelica format
 */
function formalLogicToModelica(thought: FormalLogicThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  let modelica = 'package FormalLogicProof\n';
  modelica += '  "Formal logic proof representation"\n\n';

  // Add propositions as Boolean parameters
  if (thought.propositions && thought.propositions.length > 0) {
    modelica += '  // Logical Propositions\n';
    for (const proposition of thought.propositions) {
      const propId = sanitizeModelicaId(proposition.id);
      const symbol = proposition.symbol || proposition.id;
      const statement = proposition.statement || '';
      const comment = includeLabels
        ? ` "${escapeModelicaString(symbol)}: ${escapeModelicaString(statement)}"`
        : '';
      const truthValue = proposition.truthValue !== undefined ? String(proposition.truthValue) : 'false';
      modelica += `  parameter Boolean ${propId} = ${truthValue}${comment};\n`;
    }
    modelica += '\n';
  }

  // Add inference rules as functions
  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    modelica += '  // Inference Rules\n';
    for (const inference of thought.logicalInferences) {
      const ruleStr = inference.rule || 'Inference';
      const ruleName = sanitizeModelicaId(ruleStr.replace(/[^a-zA-Z0-9]/g, '_'));

      modelica += `  function ${ruleName}\n`;
      modelica += `    "${escapeModelicaString(ruleStr)}"\n`;

      // Input parameters for premises
      if (inference.premises && inference.premises.length > 0) {
        for (let i = 0; i < inference.premises.length; i++) {
          const premiseId = sanitizeModelicaId(inference.premises[i] || `premise${i + 1}`);
          modelica += `    input Boolean premise${i + 1} "${escapeModelicaString(premiseId)}";\n`;
        }
      }

      // Output parameter for conclusion
      modelica += `    output Boolean conclusion "${inference.conclusion ? escapeModelicaString(inference.conclusion) : ''}";\n`;
      modelica += `  algorithm\n`;

      // Simple logical operation (all premises must be true)
      if (inference.premises && inference.premises.length > 0) {
        const conditions = inference.premises.map((_, i) => `premise${i + 1}`).join(' and ');
        modelica += `    conclusion := ${conditions};\n`;
      } else {
        modelica += `    conclusion := false;\n`;
      }

      modelica += `  end ${ruleName};\n\n`;
    }
  }

  // Add proof steps as model components
  if (thought.proof && thought.proof.steps && thought.proof.steps.length > 0) {
    modelica += '  // Proof Steps\n';
    modelica += `  model ProofSequence\n`;
    modelica += `    "${thought.proof.theorem ? escapeModelicaString(thought.proof.theorem) : ''}"\n\n`;

    for (const step of thought.proof.steps) {
      const stepId = sanitizeModelicaId(`Step${step.stepNumber}`);
      const comment = includeLabels && step.statement
        ? ` "${escapeModelicaString(step.statement)}"`
        : '';
      modelica += `    parameter Boolean ${stepId} = true${comment};\n`;

      if (step.rule) {
        modelica += `    // Rule: ${escapeModelicaString(step.rule)}\n`;
      }
      if (step.justification) {
        modelica += `    // Justification: ${escapeModelicaString(step.justification)}\n`;
      }
    }

    modelica += '\n';

    // Add theorem conclusion
    const validStr = thought.proof.valid ? 'true' : 'false';
    modelica += `    parameter Boolean theoremProven = ${validStr} "Theorem is proven";\n`;

    if (includeMetrics) {
      const completeness = thought.proof.completeness.toFixed(4);
      modelica += `    parameter Real completeness = ${completeness} "Proof completeness (0-1)";\n`;
    }

    modelica += `  end ProofSequence;\n\n`;
  }

  // Add metrics
  if (includeMetrics) {
    modelica += '  // Proof Metrics\n';
    modelica += `  constant Integer propositionCount = ${thought.propositions?.length || 0};\n`;
    modelica += `  constant Integer inferenceCount = ${thought.logicalInferences?.length || 0};\n`;
    modelica += `  constant Integer proofStepCount = ${thought.proof?.steps?.length || 0};\n`;

    if (thought.truthTable) {
      modelica += `  constant Boolean isTautology = ${thought.truthTable.isTautology};\n`;
      modelica += `  constant Boolean isContradiction = ${thought.truthTable.isContradiction};\n`;
      modelica += `  constant Boolean isContingent = ${thought.truthTable.isContingent};\n`;
    }
  }

  modelica += 'end FormalLogicProof;\n';
  return modelica;
}

/**
 * Export formal logic proof tree to UML format
 */
function formalLogicToUML(thought: FormalLogicThought, options: VisualExportOptions): string {
  const { includeLabels = true } = options;

  const nodes: UmlNode[] = [];
  const edges: UmlEdge[] = [];

  // Add propositions as class nodes
  if (thought.propositions && thought.propositions.length > 0) {
    for (const proposition of thought.propositions) {
      const propId = sanitizeId(proposition.id);
      const attributes: string[] = [];

      if (includeLabels) {
        attributes.push(`symbol: ${proposition.symbol}`);
        attributes.push(`type: ${proposition.type}`);
        if (proposition.truthValue !== undefined) {
          attributes.push(`truth: ${proposition.truthValue}`);
        }
      }

      nodes.push({
        id: propId,
        label: includeLabels ? proposition.symbol : propId,
        shape: 'class',
        stereotype: 'premise',
        attributes,
      });
    }
  }

  // Add logical inferences as class nodes with methods
  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    for (const inference of thought.logicalInferences) {
      const infId = sanitizeId(inference.id);
      const operations: string[] = [];

      if (includeLabels) {
        operations.push(`apply(): Boolean`);
      }

      nodes.push({
        id: infId,
        label: includeLabels ? inference.rule : infId,
        shape: 'class',
        stereotype: 'inference',
        attributes: [`valid: ${inference.valid}`],
        methods: operations,
      });

      // Create dependency edges from premises to inference
      if (inference.premises) {
        for (const premiseId of inference.premises) {
          const propId = sanitizeId(premiseId);
          edges.push({
            source: propId,
            target: infId,
            type: 'dependency',
            label: 'premise',
          });
        }
      }

      // Create derivation edge from inference to conclusion
      const conclusionId = sanitizeId(inference.conclusion);
      edges.push({
        source: infId,
        target: conclusionId,
        type: 'implementation',
        label: 'derives',
      });
    }
  }

  // Add proof steps as class nodes
  if (thought.proof && thought.proof.steps && thought.proof.steps.length > 0) {
    for (const step of thought.proof.steps) {
      const stepId = `Step${step.stepNumber}`;
      const attributes: string[] = [];

      if (includeLabels) {
        attributes.push(`number: ${step.stepNumber}`);
        if (step.rule) {
          attributes.push(`rule: ${step.rule}`);
        }
      }

      nodes.push({
        id: stepId,
        label: includeLabels ? `Step ${step.stepNumber}` : stepId,
        shape: 'class',
        stereotype: 'proof-step',
        attributes,
      });

      // Create edges between referenced steps
      if (step.referencesSteps && step.referencesSteps.length > 0) {
        for (const refStep of step.referencesSteps) {
          edges.push({
            source: `Step${refStep}`,
            target: stepId,
            type: 'dependency',
            label: 'uses',
          });
        }
      }
    }

    // Add theorem node
    nodes.push({
      id: 'Theorem',
      label: includeLabels ? 'Theorem' : 'T',
      shape: 'class',
      stereotype: 'conclusion',
      attributes: [
        `valid: ${thought.proof.valid}`,
        `completeness: ${(thought.proof.completeness * 100).toFixed(0)}%`,
      ],
    });

    // Connect last step to theorem
    const lastStep = thought.proof.steps[thought.proof.steps.length - 1];
    edges.push({
      source: `Step${lastStep.stepNumber}`,
      target: 'Theorem',
      type: 'implementation',
      label: 'proves',
    });
  }

  return generateUmlDiagram(nodes, edges, {
    title: 'Formal Logic Proof',
    diagramType: 'class',
  });
}

/**
 * Export formal logic proof tree to JSON format
 */
function formalLogicToJSON(thought: FormalLogicThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  const graph = createJsonGraph('Formal Logic Proof', 'formal-logic', { includeMetrics });

  // Add propositions as nodes
  if (thought.propositions && thought.propositions.length > 0) {
    for (const proposition of thought.propositions) {
      addNode(graph, {
        id: proposition.id,
        label: includeLabels ? `${proposition.symbol}: ${proposition.statement}` : proposition.symbol,
        type: 'premise',
        metadata: {
          symbol: proposition.symbol,
          propositionType: proposition.type,
          statement: proposition.statement,
          truthValue: proposition.truthValue,
        },
      });
    }
  }

  // Edge counter for unique IDs
  let edgeId = 0;

  // Add logical inferences as nodes and edges
  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    for (const inference of thought.logicalInferences) {
      const infId = inference.id;

      addNode(graph, {
        id: infId,
        label: includeLabels ? inference.rule : infId,
        type: 'inference',
        metadata: {
          rule: inference.rule,
          valid: inference.valid,
          premises: inference.premises,
          conclusion: inference.conclusion,
        },
      });

      // Create edges from premises to inference
      if (inference.premises) {
        for (const premiseId of inference.premises) {
          addEdge(graph, {
            id: `edge_${edgeId++}`,
            source: premiseId,
            target: infId,
            label: 'premise',
            metadata: { type: 'premise-to-inference' },
          });
        }
      }

      // Create edge from inference to conclusion
      addEdge(graph, {
        id: `edge_${edgeId++}`,
        source: infId,
        target: inference.conclusion,
        label: 'derives',
        metadata: { type: 'inference-to-conclusion' },
      });
    }
  }

  // Add proof steps as nodes
  if (thought.proof && thought.proof.steps && thought.proof.steps.length > 0) {
    for (const step of thought.proof.steps) {
      const stepId = `Step${step.stepNumber}`;

      addNode(graph, {
        id: stepId,
        label: includeLabels ? `${step.stepNumber}. ${step.statement}` : `Step ${step.stepNumber}`,
        type: 'proof-step',
        metadata: {
          stepNumber: step.stepNumber,
          statement: step.statement,
          justification: step.justification,
          rule: step.rule,
          referencesSteps: step.referencesSteps,
        },
      });

      // Create edges between referenced steps
      if (step.referencesSteps && step.referencesSteps.length > 0) {
        for (const refStep of step.referencesSteps) {
          addEdge(graph, {
            id: `edge_${edgeId++}`,
            source: `Step${refStep}`,
            target: stepId,
            label: 'uses',
            metadata: { type: 'step-reference' },
          });
        }
      }
    }

    // Add theorem node
    addNode(graph, {
      id: 'Theorem',
      label: includeLabels ? thought.proof.theorem : 'Theorem',
      type: 'conclusion',
      metadata: {
        theorem: thought.proof.theorem,
        technique: thought.proof.technique,
        valid: thought.proof.valid,
        completeness: thought.proof.completeness,
        conclusion: thought.proof.conclusion,
      },
    });

    // Connect last step to theorem
    const lastStep = thought.proof.steps[thought.proof.steps.length - 1];
    addEdge(graph, {
      id: `edge_${edgeId++}`,
      source: `Step${lastStep.stepNumber}`,
      target: 'Theorem',
      label: 'proves',
      metadata: { type: 'step-to-theorem' },
    });
  }

  // Add metrics
  if (includeMetrics) {
    addMetric(graph, 'propositionCount', thought.propositions?.length || 0);
    addMetric(graph, 'inferenceCount', thought.logicalInferences?.length || 0);
    addMetric(graph, 'proofStepCount', thought.proof?.steps?.length || 0);

    if (thought.proof) {
      addMetric(graph, 'proofValid', thought.proof.valid);
      addMetric(graph, 'proofCompleteness', thought.proof.completeness);
    }

    if (thought.truthTable) {
      addMetric(graph, 'isTautology', thought.truthTable.isTautology);
      addMetric(graph, 'isContradiction', thought.truthTable.isContradiction);
      addMetric(graph, 'isContingent', thought.truthTable.isContingent);
    }
  }

  return serializeGraph(graph);
}

/**
 * Export formal logic proof tree to Markdown format
 */
function formalLogicToMarkdown(thought: FormalLogicThought, options: VisualExportOptions): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
    includeMetrics = true,
  } = options;

  const parts: string[] = [];

  // Proof Overview
  if (thought.proof) {
    const proofContent = keyValueSection({
      'Theorem': thought.proof.theorem,
      'Technique': thought.proof.technique,
      'Valid': thought.proof.valid ? 'Yes' : 'No',
      'Completeness': `${(thought.proof.completeness * 100).toFixed(0)}%`,
    });
    parts.push(section('Proof', proofContent));
  }

  // Metrics
  if (includeMetrics) {
    const metricsContent = keyValueSection({
      'Propositions': thought.propositions?.length || 0,
      'Inferences': thought.logicalInferences?.length || 0,
      'Proof Steps': thought.proof?.steps?.length || 0,
      'Completeness': thought.proof ? `${(thought.proof.completeness * 100).toFixed(0)}%` : 'N/A',
    });
    parts.push(section('Metrics', metricsContent));
  }

  // Propositions
  if (thought.propositions && thought.propositions.length > 0) {
    const propositionRows = thought.propositions.map(p => [
      p.symbol,
      p.type,
      p.statement,
      p.truthValue !== undefined ? String(p.truthValue) : 'N/A',
    ]);
    const propositionsTable = table(
      ['Symbol', 'Type', 'Statement', 'Truth Value'],
      propositionRows
    );
    parts.push(section('Propositions', propositionsTable));
  }

  // Logical Inferences
  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    const inferenceItems = thought.logicalInferences.map(inf =>
      `**${inf.rule}** (${inf.valid ? 'Valid' : 'Invalid'})\n  - Premises: ${inf.premises.join(', ')}\n  - Conclusion: ${inf.conclusion}`
    );
    parts.push(section('Logical Inferences', list(inferenceItems)));
  }

  // Proof Steps
  if (thought.proof && thought.proof.steps && thought.proof.steps.length > 0) {
    const stepItems = thought.proof.steps.map(step =>
      `**${step.stepNumber}. ${step.statement}**\n  - Justification: ${step.justification}${step.rule ? `\n  - Rule: ${step.rule}` : ''}${step.referencesSteps && step.referencesSteps.length > 0 ? `\n  - References steps: ${step.referencesSteps.join(', ')}` : ''}`
    );
    parts.push(section('Proof Steps', list(stepItems)));
  }

  // Conclusion
  if (thought.proof) {
    const conclusionContent = `${thought.proof.conclusion}\n\n**Status:** ${thought.proof.valid ? 'PROVEN' : 'NOT PROVEN'}`;
    parts.push(section('Conclusion', conclusionContent));
  }

  // Truth Table
  if (thought.truthTable) {
    const truthTableContent = keyValueSection({
      'Tautology': thought.truthTable.isTautology ? 'Yes' : 'No',
      'Contradiction': thought.truthTable.isContradiction ? 'Yes' : 'No',
      'Contingent': thought.truthTable.isContingent ? 'Yes' : 'No',
    });
    parts.push(section('Truth Table', truthTableContent));
  }

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaidDiagram = formalLogicToMermaid(thought, 'default', true, true);
    parts.push(section('Proof Tree Diagram', mermaidBlock(mermaidDiagram)));
  }

  return mdDocument('Formal Logic Analysis', parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: { mode: 'formal-logic' },
  });
}
