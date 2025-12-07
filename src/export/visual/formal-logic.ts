/**
 * Formal Logic Visual Exporter (v7.0.3)
 * Sprint 8 Task 8.1: Formal logic proof tree export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support, GraphML, TikZ
 */

import type { FormalLogicThought } from '../../types/index.js';
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
