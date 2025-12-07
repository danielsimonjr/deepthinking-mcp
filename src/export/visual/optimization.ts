/**
 * Optimization Visual Exporter (v7.0.3)
 * Sprint 8 Task 8.1: Optimization constraint graph export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 * Phase 9: Added GraphML and TikZ export support
 */

import type { OptimizationThought } from '../../types/index.js';
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
  sanitizeModelicaId,
  escapeModelicaString,
} from './modelica-utils.js';
import {
  generateUmlDiagram,
  type UmlNode,
  type UmlEdge,
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
 * Export optimization problem constraint graph to visual format
 */
export function exportOptimizationSolution(thought: OptimizationThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return optimizationToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return optimizationToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return optimizationToASCII(thought);
    case 'svg':
      return optimizationToSVG(thought, options);
    case 'graphml':
      return optimizationToGraphML(thought, options);
    case 'tikz':
      return optimizationToTikZ(thought, options);
    case 'html':
      return optimizationToHTML(thought, options);
    case 'modelica':
      return optimizationToModelica(thought, options);
    case 'uml':
      return optimizationToUML(thought, options);
    case 'json':
      return optimizationToJSON(thought, options);
    case 'markdown':
      return optimizationToMarkdown(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function optimizationToMermaid(
  thought: OptimizationThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TD\n';

  if (thought.problem) {
    const problemLabel = includeLabels
      ? `Problem: ${thought.problem.name}`
      : 'Problem';
    mermaid += `  Problem["${problemLabel}"]\n\n`;
  }

  if (thought.variables && thought.variables.length > 0) {
    mermaid += '  subgraph Variables["Decision Variables"]\n';
    for (const variable of thought.variables) {
      const varId = sanitizeId(variable.id);
      const label = includeLabels ? variable.name : varId;
      const domainLabel = includeMetrics && variable.domain
        ? ` [${(variable.domain as any).lowerBound},${(variable.domain as any).upperBound}]`
        : '';
      mermaid += `    ${varId}["${label}${domainLabel}"]\n`;
    }
    mermaid += '  end\n\n';
  }

  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    mermaid += '  subgraph Constraints["Constraints"]\n';
    for (const constraint of thought.optimizationConstraints) {
      const constId = sanitizeId(constraint.id);
      const label = includeLabels ? constraint.name : constId;
      mermaid += `    ${constId}["${label}"]\n`;
    }
    mermaid += '  end\n\n';
  }

  if (thought.objectives && thought.objectives.length > 0) {
    for (const objective of thought.objectives) {
      const objId = sanitizeId(objective.id);
      const label = includeLabels
        ? `${objective.type}: ${objective.name}`
        : objId;
      mermaid += `  ${objId}["${label}"]\n`;
    }
    mermaid += '\n';
  }

  if (thought.solution) {
    const qualityLabel = includeMetrics && thought.solution.quality
      ? ` (quality: ${thought.solution.quality.toFixed(2)})`
      : '';
    mermaid += `  Solution["Solution${qualityLabel}"]\n`;
    if (thought.objectives) {
      for (const objective of thought.objectives) {
        const objId = sanitizeId(objective.id);
        mermaid += `  ${objId} --> Solution\n`;
      }
    }
  }

  if (colorScheme !== 'monochrome') {
    mermaid += '\n';
    const solutionColor = colorScheme === 'pastel' ? '#e8f5e9' : '#a5d6a7';
    if (thought.solution) {
      mermaid += `  style Solution fill:${solutionColor}\n`;
    }
  }

  return mermaid;
}

function optimizationToDOT(
  thought: OptimizationThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph Optimization {\n';
  dot += '  rankdir=TD;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  if (thought.problem) {
    const label = includeLabels ? thought.problem.name : 'Problem';
    dot += `  Problem [label="Problem:\\n${label}", shape=ellipse];\n\n`;
  }

  if (thought.variables && thought.variables.length > 0) {
    dot += '  subgraph cluster_variables {\n';
    dot += '    label="Decision Variables";\n';
    for (const variable of thought.variables) {
      const varId = sanitizeId(variable.id);
      const label = includeLabels ? variable.name : varId;
      const domainLabel = includeMetrics && variable.domain
        ? `\\n[${(variable.domain as any).lowerBound}, ${(variable.domain as any).upperBound}]`
        : '';
      dot += `    ${varId} [label="${label}${domainLabel}"];\n`;
    }
    dot += '  }\n\n';
  }

  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    dot += '  subgraph cluster_constraints {\n';
    dot += '    label="Constraints";\n';
    for (const constraint of thought.optimizationConstraints) {
      const constId = sanitizeId(constraint.id);
      const label = includeLabels ? constraint.name : constId;
      dot += `    ${constId} [label="${label}", shape=diamond];\n`;
    }
    dot += '  }\n\n';
  }

  if (thought.objectives) {
    for (const objective of thought.objectives) {
      const objId = sanitizeId(objective.id);
      const label = includeLabels ? `${objective.type}:\\n${objective.name}` : objId;
      dot += `  ${objId} [label="${label}"];\n`;
    }
  }

  if (thought.solution) {
    const qualityLabel = includeMetrics && thought.solution.quality
      ? `\\nquality: ${thought.solution.quality.toFixed(2)}`
      : '';
    dot += `  Solution [label="Solution${qualityLabel}", shape=doubleoctagon, style=filled, fillcolor=lightgreen];\n`;
    if (thought.objectives) {
      for (const objective of thought.objectives) {
        const objId = sanitizeId(objective.id);
        dot += `  ${objId} -> Solution;\n`;
      }
    }
  }

  dot += '}\n';
  return dot;
}

function optimizationToASCII(thought: OptimizationThought): string {
  let ascii = 'Optimization Problem:\n';
  ascii += '====================\n\n';

  if (thought.problem) {
    ascii += `Problem: ${thought.problem.name}\n`;
    ascii += `Type: ${thought.problem.type}\n`;
    ascii += `${thought.problem.description}\n\n`;
  }

  if (thought.variables && thought.variables.length > 0) {
    ascii += 'Decision Variables:\n';
    for (const variable of thought.variables) {
      const varType = (variable as any).type || 'unknown';
      ascii += `  ${variable.name} (${varType})\n`;
      if (variable.domain) {
        ascii += `    Domain: [${(variable.domain as any).lowerBound}, ${(variable.domain as any).upperBound}]\n`;
      }
    }
    ascii += '\n';
  }

  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    ascii += 'Constraints:\n';
    for (const constraint of thought.optimizationConstraints) {
      ascii += `  ${constraint.name} (${constraint.type})\n`;
      ascii += `    ${constraint.formula}\n`;
    }
    ascii += '\n';
  }

  if (thought.objectives && thought.objectives.length > 0) {
    ascii += 'Objectives:\n';
    for (const objective of thought.objectives) {
      ascii += `  ${objective.type.toUpperCase()}: ${objective.name}\n`;
      ascii += `    ${objective.formula}\n`;
    }
    ascii += '\n';
  }

  if (thought.solution) {
    ascii += 'Solution:\n';
    const solution = thought.solution as any;
    if (solution.status) {
      ascii += `  Status: ${solution.status}\n`;
    }
    if (solution.optimalValue !== undefined) {
      ascii += `  Optimal Value: ${solution.optimalValue}\n`;
    }
    if (solution.quality !== undefined) {
      ascii += `  Quality: ${solution.quality.toFixed(2)}\n`;
    }
    if (solution.assignments) {
      ascii += '  Assignments:\n';
      for (const [varId, value] of Object.entries(solution.assignments)) {
        ascii += `    ${varId} = ${value}\n`;
      }
    }
  }

  return ascii;
}

/**
 * Export optimization problem constraint graph to native SVG format
 */
function optimizationToSVG(thought: OptimizationThought, options: VisualExportOptions): string {
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

  // Problem at the top
  if (thought.problem) {
    positions.set('Problem', {
      id: 'Problem',
      label: includeLabels ? thought.problem.name : 'Problem',
      x: svgWidth / 2,
      y: 80,
      width: nodeWidth,
      height: nodeHeight,
      type: 'problem',
    });
  }

  // Variables on the left
  if (thought.variables) {
    thought.variables.forEach((variable, index) => {
      positions.set(variable.id, {
        id: variable.id,
        label: includeLabels ? variable.name : variable.id,
        x: 150,
        y: 200 + index * 80,
        width: nodeWidth,
        height: nodeHeight,
        type: 'variable',
      });
    });
  }

  // Objectives on the right
  if (thought.objectives) {
    thought.objectives.forEach((objective, index) => {
      positions.set(objective.id, {
        id: objective.id,
        label: includeLabels ? `${objective.type}: ${objective.name}` : objective.id,
        x: svgWidth - 150,
        y: 200 + index * 80,
        width: nodeWidth,
        height: nodeHeight,
        type: 'objective',
      });
    });
  }

  // Solution at the bottom
  if (thought.solution) {
    positions.set('Solution', {
      id: 'Solution',
      label: 'Solution',
      x: svgWidth / 2,
      y: svgHeight - 100,
      width: nodeWidth,
      height: nodeHeight,
      type: 'solution',
    });
  }

  let svg = generateSVGHeader(svgWidth, svgHeight, 'Optimization Problem');

  // Render edges
  svg += '\n  <!-- Edges -->\n  <g class="edges">';

  // Edges from objectives to solution
  if (thought.objectives && thought.solution) {
    for (const objective of thought.objectives) {
      const objPos = positions.get(objective.id);
      const solPos = positions.get('Solution');
      if (objPos && solPos) {
        svg += renderEdge(objPos, solPos);
      }
    }
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';

  const problemColors = getNodeColor('warning', colorScheme);
  const variableColors = getNodeColor('neutral', colorScheme);
  const objectiveColors = getNodeColor('primary', colorScheme);
  const solutionColors = getNodeColor('success', colorScheme);

  for (const [, pos] of positions) {
    if (pos.type === 'problem') {
      svg += renderEllipseNode(pos, problemColors);
    } else if (pos.type === 'variable') {
      svg += renderRectNode(pos, variableColors);
    } else if (pos.type === 'objective') {
      svg += renderRectNode(pos, objectiveColors);
    } else if (pos.type === 'solution') {
      svg += renderStadiumNode(pos, solutionColors);
    }
  }
  svg += '\n  </g>';

  // Render metrics panel
  if (includeMetrics) {
    const metrics = [
      { label: 'Variables', value: thought.variables?.length || 0 },
      { label: 'Constraints', value: thought.optimizationConstraints?.length || 0 },
      { label: 'Objectives', value: thought.objectives?.length || 0 },
      { label: 'Quality', value: thought.solution?.quality?.toFixed(2) || 'N/A' },
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 150, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Problem', color: problemColors, shape: 'ellipse' as const },
    { label: 'Variable', color: variableColors },
    { label: 'Objective', color: objectiveColors },
    { label: 'Solution', color: solutionColors, shape: 'stadium' as const },
  ];
  svg += renderLegend(20, svgHeight - 140, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}

/**
 * Export optimization problem to GraphML format
 */
function optimizationToGraphML(thought: OptimizationThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;
  const nodes: GraphMLNode[] = [];
  const edges: GraphMLEdge[] = [];
  let edgeCount = 0;

  // Add objective function nodes
  if (thought.objectives && thought.objectives.length > 0) {
    for (const objective of thought.objectives) {
      nodes.push({
        id: sanitizeId(objective.id),
        label: includeLabels ? `${objective.type}: ${objective.name}` : objective.id,
        type: 'objective',
        metadata: {
          description: objective.formula,
          objectiveType: objective.type,
        },
      });
    }
  }

  // Add constraint nodes
  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    for (const constraint of thought.optimizationConstraints) {
      nodes.push({
        id: sanitizeId(constraint.id),
        label: includeLabels ? constraint.name : constraint.id,
        type: 'constraint',
        metadata: {
          description: constraint.formula,
          constraintType: constraint.type,
        },
      });

      // Create edges from constraints to objectives
      if (thought.objectives) {
        for (const objective of thought.objectives) {
          edges.push({
            id: `e${edgeCount++}`,
            source: sanitizeId(constraint.id),
            target: sanitizeId(objective.id),
            label: 'constrains',
          });
        }
      }
    }
  }

  // Add solution/optimum node
  if (thought.solution) {
    nodes.push({
      id: 'solution',
      label: includeMetrics && thought.solution.quality
        ? `Solution (quality: ${thought.solution.quality.toFixed(2)})`
        : 'Solution',
      type: 'solution',
      metadata: {
        status: (thought.solution as any).status,
        optimalValue: (thought.solution as any).optimalValue,
        quality: thought.solution.quality,
      },
    });

    // Create edges from objectives to solution
    if (thought.objectives) {
      for (const objective of thought.objectives) {
        edges.push({
          id: `e${edgeCount++}`,
          source: sanitizeId(objective.id),
          target: 'solution',
          label: 'optimizes',
        });
      }
    }
  }

  return generateGraphML(nodes, edges, {
    graphName: 'Optimization Solution',
    includeLabels,
    includeMetadata: includeMetrics,
  });
}

/**
 * Export optimization problem to TikZ format
 */
function optimizationToTikZ(thought: OptimizationThought, options: VisualExportOptions): string {
  const { colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;
  const nodes: TikZNode[] = [];
  const edges: TikZEdge[] = [];
  let yOffset = 0;

  // Objective functions at the top
  if (thought.objectives && thought.objectives.length > 0) {
    const startX = thought.objectives.length > 1 ? 0 : 4;
    const spacing = thought.objectives.length > 1 ? 8 / thought.objectives.length : 0;

    for (let i = 0; i < thought.objectives.length; i++) {
      const objective = thought.objectives[i];
      const x = thought.objectives.length === 1 ? startX : startX + i * spacing + spacing / 2;

      nodes.push({
        id: sanitizeId(objective.id),
        label: includeLabels ? `${objective.type}: ${objective.name}` : objective.id,
        x,
        y: yOffset,
        type: 'primary',
        shape: 'rectangle',
      });
    }
    yOffset -= 2;
  }

  // Constraints in the middle
  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    const startX = thought.optimizationConstraints.length > 1 ? 0 : 4;
    const spacing = thought.optimizationConstraints.length > 1 ? 8 / thought.optimizationConstraints.length : 0;

    for (let i = 0; i < thought.optimizationConstraints.length; i++) {
      const constraint = thought.optimizationConstraints[i];
      const x = thought.optimizationConstraints.length === 1 ? startX : startX + i * spacing + spacing / 2;
      const constraintId = sanitizeId(constraint.id);

      nodes.push({
        id: constraintId,
        label: includeLabels ? constraint.name : constraint.id,
        x,
        y: yOffset,
        type: 'warning',
        shape: 'diamond',
      });

      // Create edges from constraints to objectives
      if (thought.objectives) {
        for (const objective of thought.objectives) {
          edges.push({
            source: constraintId,
            target: sanitizeId(objective.id),
            directed: true,
          });
        }
      }
    }
    yOffset -= 2;
  }

  // Solution at the bottom
  if (thought.solution) {
    const solutionLabel = includeMetrics && thought.solution.quality
      ? `Solution (${thought.solution.quality.toFixed(2)})`
      : 'Solution';

    nodes.push({
      id: 'solution',
      label: solutionLabel,
      x: 4,
      y: yOffset,
      type: 'success',
      shape: 'ellipse',
    });

    // Create edges from objectives to solution
    if (thought.objectives) {
      for (const objective of thought.objectives) {
        edges.push({
          source: sanitizeId(objective.id),
          target: 'solution',
          directed: true,
        });
      }
    }
  }

  return generateTikZ(nodes, edges, {
    title: 'Optimization Solution',
    colorScheme,
    includeLabels,
    includeMetrics,
  });
}

/**
 * Export optimization problem to HTML format
 */
function optimizationToHTML(thought: OptimizationThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Optimization Analysis',
    htmlTheme = 'light',
    includeMetrics = true,
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // Problem Overview
  if (thought.problem) {
    const problemContent = `
      <p><strong>Name:</strong> ${escapeHTML(thought.problem.name)}</p>
      <p><strong>Type:</strong> ${renderBadge(thought.problem.type.toUpperCase(), 'info')}</p>
      <p>${escapeHTML(thought.problem.description)}</p>
    `;
    html += renderSection('Problem', problemContent, '🎯');
  }

  // Metrics
  if (includeMetrics) {
    html += '<div class="metrics-grid">\n';
    html += renderMetricCard('Variables', thought.variables?.length || 0, 'primary');
    html += renderMetricCard('Constraints', thought.optimizationConstraints?.length || 0, 'warning');
    html += renderMetricCard('Objectives', thought.objectives?.length || 0, 'info');
    html += renderMetricCard('Quality', thought.solution?.quality?.toFixed(2) || 'N/A', 'success');
    html += '</div>\n';
  }

  // Decision Variables
  if (thought.variables && thought.variables.length > 0) {
    const variableRows = thought.variables.map(v => {
      const varType = (v as any).type || 'unknown';
      const domain = v.domain
        ? `[${(v.domain as any).lowerBound}, ${(v.domain as any).upperBound}]`
        : 'N/A';
      return [v.name, varType, domain, v.description];
    });
    const variablesTable = renderTable(
      ['Name', 'Type', 'Domain', 'Description'],
      variableRows,
      { caption: 'Decision Variables' }
    );
    html += renderSection('Decision Variables', variablesTable, '🔢');
  }

  // Constraints
  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    let constraintsContent = '';
    for (const constraint of thought.optimizationConstraints) {
      const badge = renderBadge(constraint.type.toUpperCase(), 'warning');
      constraintsContent += `
        <div class="card">
          <div class="card-header">${escapeHTML(constraint.name)} ${badge}</div>
          <p><strong>Formula:</strong> <code>${escapeHTML(constraint.formula)}</code></p>
        </div>
      `;
    }
    html += renderSection('Constraints', constraintsContent, '⚠️');
  }

  // Objectives
  if (thought.objectives && thought.objectives.length > 0) {
    let objectivesContent = '';
    for (const objective of thought.objectives) {
      const typeColor = objective.type === 'maximize' ? 'success' : 'info';
      const badge = renderBadge(objective.type.toUpperCase(), typeColor as any);
      objectivesContent += `
        <div class="card">
          <div class="card-header">${badge} ${escapeHTML(objective.name)}</div>
          <p><strong>Formula:</strong> <code>${escapeHTML(objective.formula)}</code></p>
        </div>
      `;
    }
    html += renderSection('Objectives', objectivesContent, '🎯');
  }

  // Solution
  if (thought.solution) {
    const solution = thought.solution as any;
    let solutionContent = '';

    if (solution.status) {
      const statusBadge = solution.status === 'optimal' ? renderBadge('OPTIMAL', 'success')
        : solution.status === 'feasible' ? renderBadge('FEASIBLE', 'info')
          : renderBadge('INFEASIBLE', 'danger');
      solutionContent += `<p><strong>Status:</strong> ${statusBadge}</p>`;
    }

    if (solution.optimalValue !== undefined) {
      solutionContent += `<p><strong>Optimal Value:</strong> ${solution.optimalValue}</p>`;
    }

    if (solution.quality !== undefined) {
      solutionContent += `<p><strong>Quality:</strong> ${(solution.quality * 100).toFixed(0)}%</p>`;
    }

    if (solution.assignments) {
      solutionContent += '<h4>Variable Assignments</h4><ul>';
      for (const [varId, value] of Object.entries(solution.assignments)) {
        solutionContent += `<li><strong>${escapeHTML(varId)}:</strong> ${value}</li>`;
      }
      solutionContent += '</ul>';
    }

    html += renderSection('Solution', solutionContent, '✅');
  }

  html += generateHTMLFooter(htmlStandalone);
  return html;
}

/**
 * Export optimization problem to Modelica format
 */
function optimizationToModelica(thought: OptimizationThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;
  let modelica = '// Optimization Problem Model\n';

  const packageName = thought.problem
    ? sanitizeModelicaId(thought.problem.name)
    : 'OptimizationProblem';

  modelica += `package ${packageName}\n`;

  if (thought.problem) {
    modelica += `  annotation(Documentation(info="${escapeModelicaString(thought.problem.description)}"));\n\n`;
  }

  // Decision Variables
  if (thought.variables && thought.variables.length > 0) {
    modelica += '  // Decision Variables\n';
    for (const variable of thought.variables) {
      const varId = sanitizeModelicaId(variable.id);
      const varType = (variable as any).type || 'Real';
      const domain = variable.domain
        ? `(min=${(variable.domain as any).lowerBound}, max=${(variable.domain as any).upperBound})`
        : '';
      const comment = includeLabels && variable.description
        ? ` "${escapeModelicaString(variable.description)}"`
        : '';
      modelica += `  ${varType} ${varId}${domain}${comment};\n`;
    }
    modelica += '\n';
  }

  // Objectives as optimization parameters
  if (thought.objectives && thought.objectives.length > 0) {
    modelica += '  // Objective Functions\n';
    for (const objective of thought.objectives) {
      const objId = sanitizeModelicaId(objective.id);
      const comment = includeLabels
        ? ` "${objective.type}: ${escapeModelicaString(objective.name)}"`
        : '';
      modelica += `  Real ${objId}${comment};\n`;
      modelica += `  equation\n`;
      modelica += `    ${objId} = ${escapeModelicaString(objective.formula)};\n`;
    }
    modelica += '\n';
  }

  // Constraints
  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    modelica += '  // Constraints\n';
    modelica += '  equation\n';
    for (const constraint of thought.optimizationConstraints) {
      const comment = includeLabels
        ? ` // ${constraint.name} (${constraint.type})`
        : '';
      modelica += `    ${escapeModelicaString(constraint.formula)};${comment}\n`;
    }
    modelica += '\n';
  }

  // Solution record
  if (thought.solution) {
    modelica += '  // Solution\n';
    modelica += '  record Solution\n';

    const solution = thought.solution as any;
    if (solution.status) {
      modelica += `    String status = "${escapeModelicaString(solution.status)}";\n`;
    }
    if (solution.optimalValue !== undefined) {
      modelica += `    Real optimalValue = ${solution.optimalValue};\n`;
    }
    if (includeMetrics && solution.quality !== undefined) {
      modelica += `    Real quality = ${solution.quality.toFixed(4)};\n`;
    }

    if (solution.assignments) {
      modelica += '    // Variable Assignments\n';
      for (const [varId, value] of Object.entries(solution.assignments)) {
        const safeVarId = sanitizeModelicaId(varId);
        modelica += `    Real ${safeVarId}_value = ${value};\n`;
      }
    }

    modelica += '  end Solution;\n';
  }

  modelica += `end ${packageName};\n`;
  return modelica;
}

/**
 * Export optimization problem to UML format
 */
function optimizationToUML(thought: OptimizationThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;
  const nodes: UmlNode[] = [];
  const edges: UmlEdge[] = [];

  // Problem as main package
  if (thought.problem) {
    nodes.push({
      id: 'Problem',
      label: includeLabels ? thought.problem.name : 'Problem',
      shape: 'package',
      attributes: [
        `type: ${thought.problem.type}`,
        `description: ${thought.problem.description}`,
      ],
    });
  }

  // Variables as a class with attributes
  if (thought.variables && thought.variables.length > 0) {
    const attributes = thought.variables.map(v => {
      const varType = (v as any).type || 'Real';
      const domain = v.domain
        ? ` [${(v.domain as any).lowerBound}..${(v.domain as any).upperBound}]`
        : '';
      return `${v.name}: ${varType}${domain}`;
    });

    nodes.push({
      id: 'Variables',
      label: 'Decision Variables',
      shape: 'class',
      attributes,
    });

    if (thought.problem) {
      edges.push({
        source: 'Problem',
        target: 'Variables',
        type: 'composition',
        label: 'contains',
      });
    }
  }

  // Constraints as a class
  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    const methods = thought.optimizationConstraints.map(c =>
      `${c.name}(): ${c.type} = ${c.formula}`
    );

    nodes.push({
      id: 'Constraints',
      label: 'Constraints',
      shape: 'class',
      stereotype: 'constraint',
      methods,
    });

    if (thought.problem) {
      edges.push({
        source: 'Problem',
        target: 'Constraints',
        type: 'composition',
        label: 'enforces',
      });
    }

    // Constraints constrain variables
    if (thought.variables) {
      edges.push({
        source: 'Constraints',
        target: 'Variables',
        type: 'dependency',
        label: 'constrains',
      });
    }
  }

  // Objectives as a class
  if (thought.objectives && thought.objectives.length > 0) {
    const methods = thought.objectives.map(o =>
      `${o.name}(): ${o.type} = ${o.formula}`
    );

    nodes.push({
      id: 'Objectives',
      label: 'Objective Functions',
      shape: 'interface',
      stereotype: 'interface',
      methods,
    });

    if (thought.problem) {
      edges.push({
        source: 'Problem',
        target: 'Objectives',
        type: 'composition',
        label: 'optimizes',
      });
    }

    // Objectives use variables
    if (thought.variables) {
      edges.push({
        source: 'Objectives',
        target: 'Variables',
        type: 'dependency',
        label: 'uses',
      });
    }
  }

  // Solution as a result class
  if (thought.solution) {
    const solution = thought.solution as any;
    const attributes: string[] = [];

    if (solution.status) {
      attributes.push(`status: ${solution.status}`);
    }
    if (solution.optimalValue !== undefined) {
      attributes.push(`optimalValue: ${solution.optimalValue}`);
    }
    if (includeMetrics && solution.quality !== undefined) {
      attributes.push(`quality: ${solution.quality.toFixed(2)}`);
    }

    if (solution.assignments) {
      for (const [varId, value] of Object.entries(solution.assignments)) {
        attributes.push(`${varId} = ${value}`);
      }
    }

    nodes.push({
      id: 'Solution',
      label: 'Solution',
      shape: 'class',
      stereotype: 'result',
      attributes,
    });

    // Solution realizes objectives
    if (thought.objectives) {
      edges.push({
        source: 'Solution',
        target: 'Objectives',
        type: 'implementation',
        label: 'satisfies',
      });
    }
  }

  return generateUmlDiagram(nodes, edges, {
    title: 'Optimization Problem Structure',
    includeLabels,
  });
}

/**
 * Export optimization problem to JSON format
 */
function optimizationToJSON(thought: OptimizationThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;
  const graph = createJsonGraph('Optimization Problem Graph', 'optimization');
  let edgeIdCounter = 0;

  // Add problem node
  if (thought.problem) {
    addNode(graph, {
      id: 'problem',
      label: includeLabels ? thought.problem.name : 'Problem',
      type: 'problem',
      metadata: {
        problemType: thought.problem.type,
        description: thought.problem.description,
      },
    });
  }

  // Add variable nodes
  if (thought.variables && thought.variables.length > 0) {
    for (const variable of thought.variables) {
      addNode(graph, {
        id: variable.id,
        label: includeLabels ? variable.name : variable.id,
        type: 'variable',
        metadata: {
          variableType: (variable as any).type || 'Real',
          domain: variable.domain,
          description: variable.description,
        },
      });

      // Connect variables to problem
      if (thought.problem) {
        addEdge(graph, {
          id: `e${edgeIdCounter++}`,
          source: 'problem',
          target: variable.id,
          label: 'has_variable',
        });
      }
    }
  }

  // Add constraint nodes
  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    for (const constraint of thought.optimizationConstraints) {
      addNode(graph, {
        id: constraint.id,
        label: includeLabels ? constraint.name : constraint.id,
        type: 'constraint',
        metadata: {
          constraintType: constraint.type,
          formula: constraint.formula,
        },
      });

      // Connect constraints to problem
      if (thought.problem) {
        addEdge(graph, {
          id: `e${edgeIdCounter++}`,
          source: 'problem',
          target: constraint.id,
          label: 'enforces',
        });
      }
    }
  }

  // Add objective nodes
  if (thought.objectives && thought.objectives.length > 0) {
    for (const objective of thought.objectives) {
      addNode(graph, {
        id: objective.id,
        label: includeLabels ? objective.name : objective.id,
        type: 'objective',
        metadata: {
          objectiveType: objective.type,
          formula: objective.formula,
        },
      });

      // Connect objectives to problem
      if (thought.problem) {
        addEdge(graph, {
          id: `e${edgeIdCounter++}`,
          source: 'problem',
          target: objective.id,
          label: 'optimizes',
        });
      }

      // Connect objectives to solution
      if (thought.solution) {
        addEdge(graph, {
          id: `e${edgeIdCounter++}`,
          source: objective.id,
          target: 'solution',
          label: 'achieved_by',
        });
      }
    }
  }

  // Add solution node
  if (thought.solution) {
    const solution = thought.solution as any;
    addNode(graph, {
      id: 'solution',
      label: 'Solution',
      type: 'solution',
      metadata: {
        status: solution.status,
        optimalValue: solution.optimalValue,
        quality: solution.quality,
        assignments: solution.assignments,
      },
    });
  }

  // Add metrics
  if (includeMetrics) {
    addMetric(graph, 'variable_count', thought.variables?.length || 0);
    addMetric(graph, 'constraint_count', thought.optimizationConstraints?.length || 0);
    addMetric(graph, 'objective_count', thought.objectives?.length || 0);
    if (thought.solution?.quality !== undefined) {
      addMetric(graph, 'solution_quality', thought.solution.quality);
    }
  }

  return serializeGraph(graph);
}

/**
 * Export optimization problem constraint graph to Markdown format
 */
function optimizationToMarkdown(thought: OptimizationThought, options: VisualExportOptions): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
    includeMetrics = true,
  } = options;

  const parts: string[] = [];

  // Problem Overview
  if (thought.problem) {
    const problemContent = keyValueSection({
      'Name': thought.problem.name,
      'Type': thought.problem.type,
      'Description': thought.problem.description,
    });
    parts.push(section('Problem', problemContent));
  }

  // Metrics
  if (includeMetrics) {
    const metricsContent = keyValueSection({
      'Variables': thought.variables?.length || 0,
      'Constraints': thought.optimizationConstraints?.length || 0,
      'Objectives': thought.objectives?.length || 0,
      'Quality': thought.solution?.quality?.toFixed(2) || 'N/A',
    });
    parts.push(section('Metrics', metricsContent));
  }

  // Decision Variables
  if (thought.variables && thought.variables.length > 0) {
    const variableRows = thought.variables.map(v => {
      const varType = (v as any).type || 'unknown';
      const domain = v.domain
        ? `[${(v.domain as any).lowerBound}, ${(v.domain as any).upperBound}]`
        : 'N/A';
      return [v.name, varType, domain, v.description];
    });
    const variablesTable = table(
      ['Name', 'Type', 'Domain', 'Description'],
      variableRows
    );
    parts.push(section('Decision Variables', variablesTable));
  }

  // Constraints
  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    const constraintItems = thought.optimizationConstraints.map(c =>
      `**${c.name}** (${c.type})\n  - Formula: \`${c.formula}\``
    );
    parts.push(section('Constraints', list(constraintItems)));
  }

  // Objectives
  if (thought.objectives && thought.objectives.length > 0) {
    const objectiveItems = thought.objectives.map(o =>
      `**${o.type.toUpperCase()}: ${o.name}**\n  - Formula: \`${o.formula}\``
    );
    parts.push(section('Objectives', list(objectiveItems)));
  }

  // Solution
  if (thought.solution) {
    const solution = thought.solution as any;
    let solutionContent = '';

    if (solution.status) {
      solutionContent += `**Status:** ${solution.status}\n\n`;
    }

    const solutionMetrics: Record<string, string | number> = {};
    if (solution.optimalValue !== undefined) {
      solutionMetrics['Optimal Value'] = solution.optimalValue;
    }
    if (solution.quality !== undefined) {
      solutionMetrics['Quality'] = `${(solution.quality * 100).toFixed(0)}%`;
    }

    if (Object.keys(solutionMetrics).length > 0) {
      solutionContent += keyValueSection(solutionMetrics);
    }

    if (solution.assignments) {
      solutionContent += '\n**Variable Assignments:**\n\n';
      solutionContent += keyValueSection(solution.assignments);
    }

    parts.push(section('Solution', solutionContent));
  }

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaidDiagram = optimizationToMermaid(thought, 'default', true, true);
    parts.push(section('Optimization Diagram', mermaidBlock(mermaidDiagram)));
  }

  return mdDocument('Optimization Analysis', parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: { mode: 'optimization' },
  });
}
