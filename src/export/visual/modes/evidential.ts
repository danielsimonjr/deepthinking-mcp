/**
 * Evidential Visual Exporter (v7.0.3)
 * Sprint 8 Task 8.1: Evidential belief export to Mermaid, DOT, ASCII
 * Phase 9: Added native SVG export support
 * Phase 9: Added GraphML and TikZ export support
 */

import type { EvidentialThought } from '../../../types/index.js';
import type { VisualExportOptions } from '../types.js';
import { sanitizeId } from '../utils.js';
import {
  generateSVGHeader,
  generateSVGFooter,
  renderRectNode,
  renderEllipseNode,
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
  renderSection,
  renderTable,
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
 * Export evidential belief visualization to visual format
 */
export function exportEvidentialBeliefs(thought: EvidentialThought, options: VisualExportOptions): string {
  const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

  switch (format) {
    case 'mermaid':
      return evidentialToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case 'dot':
      return evidentialToDOT(thought, includeLabels, includeMetrics);
    case 'ascii':
      return evidentialToASCII(thought);
    case 'svg':
      return evidentialToSVG(thought, options);
    case 'graphml':
      return evidentialToGraphML(thought, options);
    case 'tikz':
      return evidentialToTikZ(thought, options);
    case 'html':
      return evidentialToHTML(thought, options);
    case 'modelica':
      return evidentialToModelica(thought, options);
    case 'uml':
      return evidentialToUML(thought, options);
    case 'json':
      return evidentialToJSON(thought, options);
    case 'markdown':
      return evidentialToMarkdown(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function evidentialToMermaid(
  thought: EvidentialThought,
  colorScheme: string,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let mermaid = 'graph TD\n';

  mermaid += '  Frame["Frame of Discernment"]\n';

  if (thought.frameOfDiscernment) {
    for (const hypothesis of thought.frameOfDiscernment) {
      const hypId = sanitizeId(hypothesis);
      const label = includeLabels ? hypothesis : hypId;

      mermaid += `  ${hypId}["${label}"]\n`;
      mermaid += `  Frame --> ${hypId}\n`;
    }
  }

  if (includeMetrics && (thought as any).massAssignments && (thought as any).massAssignments.length > 0) {
    mermaid += '\n';
    for (const mass of (thought as any).massAssignments) {
      const massId = sanitizeId(mass.subset.join('_'));
      const label = `{${mass.subset.join(', ')}}`;
      mermaid += `  ${massId}["${label}: ${mass.mass.toFixed(3)}"]\n`;
    }
  }

  if (colorScheme !== 'monochrome' && thought.frameOfDiscernment) {
    mermaid += '\n';
    const color = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
    for (const hypothesis of thought.frameOfDiscernment) {
      const hypId = sanitizeId(hypothesis);
      mermaid += `  style ${hypId} fill:${color}\n`;
    }
  }

  return mermaid;
}

function evidentialToDOT(
  thought: EvidentialThought,
  includeLabels: boolean,
  includeMetrics: boolean
): string {
  let dot = 'digraph EvidentialBeliefs {\n';
  dot += '  rankdir=TD;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  dot += '  Frame [label="Frame of Discernment", shape=ellipse];\n\n';

  if (thought.frameOfDiscernment) {
    for (const hypothesis of thought.frameOfDiscernment) {
      const hypId = sanitizeId(hypothesis);
      const label = includeLabels ? hypothesis : hypId;

      dot += `  ${hypId} [label="${label}"];\n`;
      dot += `  Frame -> ${hypId};\n`;
    }
  }

  if (includeMetrics && (thought as any).massAssignments && (thought as any).massAssignments.length > 0) {
    dot += '\n';
    for (const mass of (thought as any).massAssignments) {
      const massId = sanitizeId(mass.subset.join('_'));
      const label = `{${mass.subset.join(', ')}}: ${mass.mass.toFixed(3)}`;
      dot += `  ${massId} [label="${label}", shape=note];\n`;
    }
  }

  dot += '}\n';
  return dot;
}

function evidentialToASCII(thought: EvidentialThought): string {
  let ascii = 'Evidential Belief Visualization:\n';
  ascii += '================================\n\n';

  ascii += 'Frame of Discernment:\n';
  if (thought.frameOfDiscernment) {
    ascii += `  {${thought.frameOfDiscernment.join(', ')}}\n\n`;
  } else {
    ascii += '  (not defined)\n\n';
  }

  if ((thought as any).massAssignments && (thought as any).massAssignments.length > 0) {
    ascii += 'Mass Assignments:\n';
    for (const mass of (thought as any).massAssignments) {
      ascii += `  m({${mass.subset.join(', ')}}) = ${mass.mass.toFixed(3)}\n`;
    }
    ascii += '\n';
  }

  if (thought.beliefFunctions && thought.beliefFunctions.length > 0) {
    ascii += `Belief Functions: ${thought.beliefFunctions.length} defined\n`;
  }

  if ((thought as any).plausibilityFunction) {
    ascii += `Plausibility: ${(thought as any).plausibilityFunction.toFixed(3)}\n`;
  }

  return ascii;
}

/**
 * Export evidential belief visualization to native SVG format
 */
function evidentialToSVG(thought: EvidentialThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
  } = options;

  if (!thought.frameOfDiscernment || thought.frameOfDiscernment.length === 0) {
    return generateSVGHeader(svgWidth, 200, 'Evidential Beliefs') +
      '\n  <text x="400" y="100" text-anchor="middle" class="subtitle">No frame of discernment defined</text>\n' +
      generateSVGFooter();
  }

  const positions = new Map<string, SVGNodePosition>();
  const nodeWidth = 150;
  const nodeHeight = 40;

  // Frame of discernment at the top center
  positions.set('frame', {
    id: 'frame',
    label: 'Frame of Discernment',
    x: svgWidth / 2,
    y: 80,
    width: nodeWidth,
    height: nodeHeight,
    type: 'frame',
  });

  // Hypotheses below the frame
  const hypSpacing = Math.min(200, svgWidth / (thought.frameOfDiscernment.length + 1));
  const hypStartX = (svgWidth - (thought.frameOfDiscernment.length - 1) * hypSpacing) / 2;
  thought.frameOfDiscernment.forEach((hypothesis, index) => {
    const hypId = sanitizeId(hypothesis);
    positions.set(hypId, {
      id: hypId,
      label: includeLabels ? hypothesis : hypId,
      x: hypStartX + index * hypSpacing,
      y: 200,
      width: nodeWidth,
      height: nodeHeight,
      type: 'hypothesis',
    });
  });

  const actualHeight = 400;

  let svg = generateSVGHeader(svgWidth, actualHeight, 'Evidential Beliefs');

  // Render edges from frame to hypotheses
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  const framePos = positions.get('frame')!;
  for (const hypothesis of thought.frameOfDiscernment) {
    const hypPos = positions.get(sanitizeId(hypothesis));
    if (hypPos) {
      svg += renderEdge(framePos, hypPos);
    }
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';

  const frameColors = getNodeColor('warning', colorScheme);
  const hypColors = getNodeColor('primary', colorScheme);

  svg += renderEllipseNode(framePos, frameColors);

  for (const [id, pos] of positions) {
    if (id !== 'frame') {
      svg += renderRectNode(pos, hypColors);
    }
  }
  svg += '\n  </g>';

  // Render metrics panel
  if (includeMetrics) {
    const metrics = [
      { label: 'Hypotheses', value: thought.frameOfDiscernment.length },
      { label: 'Belief Functions', value: thought.beliefFunctions?.length || 0 },
    ];
    svg += renderMetricsPanel(svgWidth - 180, actualHeight - 110, metrics);
  }

  // Render legend
  const legendItems = [
    { label: 'Frame', color: frameColors, shape: 'ellipse' as const },
    { label: 'Hypothesis', color: hypColors },
  ];
  svg += renderLegend(20, actualHeight - 80, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}

/**
 * Export evidential belief visualization to GraphML format
 */
function evidentialToGraphML(thought: EvidentialThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  const nodes: GraphMLNode[] = [];
  const edges: GraphMLEdge[] = [];
  let edgeId = 0;

  // Create nodes for evidence items
  if (thought.evidence && thought.evidence.length > 0) {
    for (const evidence of thought.evidence) {
      nodes.push({
        id: evidence.id,
        label: includeLabels ? evidence.description : evidence.id,
        type: 'evidence',
        metadata: {
          source: evidence.source,
          reliability: evidence.reliability,
          description: evidence.description,
        },
      });
    }
  }

  // Create nodes for belief functions
  if (thought.beliefFunctions && thought.beliefFunctions.length > 0) {
    for (const belief of thought.beliefFunctions) {
      const label = includeLabels
        ? `Belief: ${belief.source}`
        : belief.id;

      nodes.push({
        id: belief.id,
        label,
        type: 'belief',
        metadata: belief.conflictMass !== undefined
          ? { conflictMass: belief.conflictMass }
          : undefined,
      });

      // Create edges from evidence to beliefs
      if (thought.evidence && thought.evidence.length > 0) {
        const sourceEvidence = thought.evidence.find(e => e.id === belief.source);
        if (sourceEvidence) {
          edges.push({
            id: `e${edgeId++}`,
            source: sourceEvidence.id,
            target: belief.id,
            label: includeMetrics ? `strength: ${sourceEvidence.reliability.toFixed(3)}` : undefined,
            metadata: includeMetrics ? { weight: sourceEvidence.reliability } : undefined,
          });
        }
      }
    }
  }

  // If no evidence or beliefs, create frame of discernment nodes
  if (nodes.length === 0 && thought.frameOfDiscernment && thought.frameOfDiscernment.length > 0) {
    nodes.push({
      id: 'frame',
      label: 'Frame of Discernment',
      type: 'frame',
    });

    for (const hypothesis of thought.frameOfDiscernment) {
      const hypId = sanitizeId(hypothesis);
      nodes.push({
        id: hypId,
        label: includeLabels ? hypothesis : hypId,
        type: 'hypothesis',
      });

      edges.push({
        id: `e${edgeId++}`,
        source: 'frame',
        target: hypId,
      });
    }
  }

  return generateGraphML(nodes, edges, {
    graphName: 'Evidential Beliefs',
    includeLabels,
    includeMetadata: includeMetrics,
  });
}

/**
 * Export evidential belief visualization to TikZ/LaTeX format
 */
function evidentialToTikZ(thought: EvidentialThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true, colorScheme = 'default' } = options;

  const nodes: TikZNode[] = [];
  const edges: TikZEdge[] = [];

  // Create nodes for evidence items (top layer)
  if (thought.evidence && thought.evidence.length > 0) {
    const evidenceCount = thought.evidence.length;
    const evidenceSpacing = Math.min(3, 8 / evidenceCount);
    const startX = (8 - (evidenceCount - 1) * evidenceSpacing) / 2;

    for (let i = 0; i < thought.evidence.length; i++) {
      const evidence = thought.evidence[i];
      const label = includeLabels
        ? `${evidence.description.substring(0, 20)}${evidence.description.length > 20 ? '...' : ''}`
        : evidence.id;

      nodes.push({
        id: evidence.id,
        label,
        x: startX + i * evidenceSpacing,
        y: 0,
        type: 'evidence',
        shape: 'rectangle',
      });
    }
  }

  // Create nodes for belief functions (bottom layer)
  if (thought.beliefFunctions && thought.beliefFunctions.length > 0) {
    const beliefCount = thought.beliefFunctions.length;
    const beliefSpacing = Math.min(3, 8 / beliefCount);
    const startX = (8 - (beliefCount - 1) * beliefSpacing) / 2;

    for (let i = 0; i < thought.beliefFunctions.length; i++) {
      const belief = thought.beliefFunctions[i];
      const label = includeLabels
        ? `Belief: ${belief.source}`
        : belief.id;

      nodes.push({
        id: belief.id,
        label,
        x: startX + i * beliefSpacing,
        y: -3,
        type: 'primary',
        shape: 'ellipse',
      });

      // Create edges from evidence to beliefs with strength labels
      if (thought.evidence && thought.evidence.length > 0) {
        const sourceEvidence = thought.evidence.find(e => e.id === belief.source);
        if (sourceEvidence) {
          edges.push({
            source: sourceEvidence.id,
            target: belief.id,
            label: includeMetrics ? sourceEvidence.reliability.toFixed(3) : undefined,
            directed: true,
          });
        }
      }
    }
  }

  // If no evidence or beliefs, create frame of discernment structure
  if (nodes.length === 0 && thought.frameOfDiscernment && thought.frameOfDiscernment.length > 0) {
    nodes.push({
      id: 'frame',
      label: 'Frame of Discernment',
      x: 4,
      y: 0,
      type: 'warning',
      shape: 'ellipse',
    });

    const hypCount = thought.frameOfDiscernment.length;
    const hypSpacing = Math.min(2.5, 8 / hypCount);
    const startX = (8 - (hypCount - 1) * hypSpacing) / 2;

    for (let i = 0; i < thought.frameOfDiscernment.length; i++) {
      const hypothesis = thought.frameOfDiscernment[i];
      const hypId = sanitizeId(hypothesis);

      nodes.push({
        id: hypId,
        label: includeLabels ? hypothesis : hypId,
        x: startX + i * hypSpacing,
        y: -2.5,
        type: 'info',
        shape: 'rectangle',
      });

      edges.push({
        source: 'frame',
        target: hypId,
        directed: true,
      });
    }
  }

  return generateTikZ(nodes, edges, {
    title: 'Evidential Beliefs',
    includeLabels,
    includeMetrics,
    colorScheme,
  });
}

/**
 * Export evidential beliefs to HTML format
 */
function evidentialToHTML(thought: EvidentialThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Evidential Reasoning Analysis',
    htmlTheme = 'light',
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // Frame of discernment
  if (thought.frameOfDiscernment && thought.frameOfDiscernment.length > 0) {
    html += renderSection('Frame of Discernment', `
      <p>Hypotheses under consideration:</p>
      <ul class="list-styled">
        ${thought.frameOfDiscernment.map(h => `<li>${escapeHTML(h)}</li>`).join('\n')}
      </ul>
    `, '🎯');
  }

  // Evidence table
  if (thought.evidence && thought.evidence.length > 0) {
    const evRows = thought.evidence.map(ev => [
      ev.id,
      ev.description,
      ev.reliability.toFixed(2),
      ev.source || '-',
    ]);
    html += renderSection('Evidence', renderTable(
      ['ID', 'Description', 'Reliability', 'Source'],
      evRows
    ), '📊');
  }

  // Belief functions
  if (thought.beliefFunctions && thought.beliefFunctions.length > 0) {
    const bfContent = thought.beliefFunctions.map(bf => {
      const massRows = bf.massAssignments.map(ma =>
        `<tr><td>{${ma.hypothesisSet.join(', ')}}</td><td>${ma.mass.toFixed(3)}</td><td>${ma.justification ? escapeHTML(ma.justification) : '-'}</td></tr>`
      ).join('\n');
      return `
        <div class="card">
          <div class="card-header">Belief from: ${bf.source ? escapeHTML(bf.source) : '-'}</div>
          ${bf.conflictMass ? `<p><strong>Conflict Mass:</strong> ${bf.conflictMass.toFixed(3)}</p>` : ''}
          <table class="table">
            <thead><tr><th>Hypothesis Set</th><th>Mass</th><th>Justification</th></tr></thead>
            <tbody>${massRows}</tbody>
          </table>
        </div>
      `;
    }).join('\n');
    html += renderSection('Belief Functions', bfContent, '📈');
  }

  // Combined belief if available
  if (thought.combinedBelief) {
    const massRows = thought.combinedBelief.massAssignments.map(ma =>
      `<tr><td>{${ma.hypothesisSet.join(', ')}}</td><td>${ma.mass.toFixed(3)}</td><td>${ma.justification ? escapeHTML(ma.justification) : '-'}</td></tr>`
    ).join('\n');
    html += renderSection('Combined Belief', `
      <table class="table">
        <thead><tr><th>Hypothesis Set</th><th>Mass</th><th>Justification</th></tr></thead>
        <tbody>${massRows}</tbody>
      </table>
      ${thought.combinedBelief.conflictMass ? `<p><strong>Conflict Mass:</strong> ${thought.combinedBelief.conflictMass.toFixed(3)}</p>` : ''}
    `, '🔮');
  }

  html += generateHTMLFooter(htmlStandalone);
  return html;
}

/**
 * Export evidential beliefs to Modelica format
 */
function evidentialToModelica(thought: EvidentialThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  let modelica = 'package EvidentialBeliefs\n';
  modelica += '  "Evidential reasoning with belief degrees and evidence"\n\n';

  // Define evidence records
  if (thought.evidence && thought.evidence.length > 0) {
    modelica += '  // Evidence Items\n';
    for (const evidence of thought.evidence) {
      const evId = sanitizeModelicaId(evidence.id);
      const desc = includeLabels && evidence.description ? escapeModelicaString(evidence.description) : '';

      modelica += `  record ${evId}\n`;
      modelica += `    "Evidence: ${desc}"\n`;
      modelica += `    parameter Real reliability = ${evidence.reliability};\n`;
      if (evidence.source) {
        modelica += `    parameter String source = "${escapeModelicaString(evidence.source)}";\n`;
      }
      modelica += `    parameter String description = "${desc}";\n`;
      modelica += `  end ${evId};\n\n`;
    }
  }

  // Define belief function records
  if (thought.beliefFunctions && thought.beliefFunctions.length > 0) {
    modelica += '  // Belief Functions\n';
    for (const belief of thought.beliefFunctions) {
      const bfId = sanitizeModelicaId(belief.id);

      modelica += `  record ${bfId}\n`;
      modelica += `    "Belief function from ${belief.source ? escapeModelicaString(belief.source) : ''}"\n`;

      // Mass assignments as parameters
      if (belief.massAssignments && belief.massAssignments.length > 0) {
        for (let i = 0; i < belief.massAssignments.length; i++) {
          const ma = belief.massAssignments[i];
          const hypSet = ma.hypothesisSet.map(h => sanitizeModelicaId(h)).join('_');
          modelica += `    parameter Real mass_${hypSet} = ${ma.mass};\n`;
        }
      }

      if (belief.conflictMass !== undefined && includeMetrics) {
        modelica += `    parameter Real conflictMass = ${belief.conflictMass};\n`;
      }

      modelica += `  end ${bfId};\n\n`;
    }
  }

  // Combined belief if available
  if (thought.combinedBelief && includeMetrics) {
    modelica += '  // Combined Belief\n';
    modelica += '  record CombinedBelief\n';
    modelica += '    "Result of combining all evidence"\n';

    if (thought.combinedBelief.massAssignments) {
      for (let i = 0; i < thought.combinedBelief.massAssignments.length; i++) {
        const ma = thought.combinedBelief.massAssignments[i];
        const hypSet = ma.hypothesisSet.map(h => sanitizeModelicaId(h)).join('_');
        modelica += `    parameter Real mass_${hypSet} = ${ma.mass};\n`;
      }
    }

    if (thought.combinedBelief.conflictMass !== undefined) {
      modelica += `    parameter Real conflictMass = ${thought.combinedBelief.conflictMass};\n`;
    }

    modelica += '  end CombinedBelief;\n\n';
  }

  // Frame of discernment as enumeration
  if (thought.frameOfDiscernment && thought.frameOfDiscernment.length > 0) {
    modelica += '  // Frame of Discernment\n';
    modelica += '  type Hypothesis = enumeration(\n';
    const hypEnums = thought.frameOfDiscernment.map(h => `    ${sanitizeModelicaId(h)}`);
    modelica += hypEnums.join(',\n');
    modelica += '\n  );\n\n';
  }

  modelica += 'end EvidentialBeliefs;\n';
  return modelica;
}

/**
 * Export evidential beliefs to UML format
 */
function evidentialToUML(thought: EvidentialThought, options: VisualExportOptions): string {
  const { includeLabels = true, includeMetrics = true } = options;

  const nodes: UmlNode[] = [];
  const edges: UmlEdge[] = [];

  // Create evidence nodes (classes with attributes)
  if (thought.evidence && thought.evidence.length > 0) {
    for (const evidence of thought.evidence) {
      const attributes = [
        `reliability: Real = ${evidence.reliability}`,
      ];

      if (includeLabels) {
        attributes.unshift(`description: String = "${evidence.description.substring(0, 30)}${evidence.description.length > 30 ? '...' : ''}"`);
      }

      if (evidence.source) {
        attributes.push(`source: String = "${evidence.source}"`);
      }

      nodes.push({
        id: evidence.id,
        label: evidence.id,
        shape: 'class',
        stereotype: '<<evidence>>',
        attributes,
      });
    }
  }

  // Create belief function nodes
  if (thought.beliefFunctions && thought.beliefFunctions.length > 0) {
    for (const belief of thought.beliefFunctions) {
      const attributes: string[] = [];

      // Add mass assignments as attributes
      if (includeMetrics && belief.massAssignments && belief.massAssignments.length > 0) {
        for (const ma of belief.massAssignments) {
          const hypSet = ma.hypothesisSet.join(', ');
          attributes.push(`m({${hypSet}}): Real = ${ma.mass.toFixed(3)}`);
        }
      }

      if (belief.conflictMass !== undefined && includeMetrics) {
        attributes.push(`conflictMass: Real = ${belief.conflictMass.toFixed(3)}`);
      }

      nodes.push({
        id: belief.id,
        label: includeLabels ? `Belief from ${belief.source}` : belief.id,
        shape: 'class',
        stereotype: '<<belief>>',
        attributes,
      });

      // Create edges from evidence to beliefs
      if (thought.evidence && thought.evidence.length > 0) {
        const sourceEvidence = thought.evidence.find(e => e.id === belief.source);
        if (sourceEvidence) {
          edges.push({
            source: sourceEvidence.id,
            target: belief.id,
            type: 'association',
            label: includeMetrics ? `[${sourceEvidence.reliability.toFixed(3)}]` : 'supports',
          });
        }
      }
    }
  }

  // Create combined belief node if available
  if (thought.combinedBelief && includeMetrics) {
    const attributes: string[] = [];

    if (thought.combinedBelief.massAssignments) {
      for (const ma of thought.combinedBelief.massAssignments) {
        const hypSet = ma.hypothesisSet.join(', ');
        attributes.push(`m({${hypSet}}): Real = ${ma.mass.toFixed(3)}`);
      }
    }

    if (thought.combinedBelief.conflictMass !== undefined) {
      attributes.push(`conflictMass: Real = ${thought.combinedBelief.conflictMass.toFixed(3)}`);
    }

    nodes.push({
      id: 'combined_belief',
      label: 'Combined Belief',
      shape: 'class',
      stereotype: '<<conclusion>>',
      attributes,
    });

    // Connect all beliefs to combined belief
    if (thought.beliefFunctions && thought.beliefFunctions.length > 0) {
      for (const belief of thought.beliefFunctions) {
        edges.push({
          source: belief.id,
          target: 'combined_belief',
          type: 'dependency',
          label: 'combines',
        });
      }
    }
  }

  // If no evidence or beliefs, show frame of discernment
  if (nodes.length === 0 && thought.frameOfDiscernment && thought.frameOfDiscernment.length > 0) {
    nodes.push({
      id: 'frame',
      label: 'Frame of Discernment',
      shape: 'class',
      stereotype: '<<enumeration>>',
      attributes: thought.frameOfDiscernment.map(h => `${sanitizeId(h)}`),
    });
  }

  return generateUmlDiagram(nodes, edges, {
    title: 'Evidential Reasoning',
    includeLabels,
  });
}

/**
 * Export evidential beliefs to JSON format
 */
function evidentialToJSON(thought: EvidentialThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;

  const graph = createJsonGraph('evidential', 'Evidential Beliefs');

  // Add evidence nodes
  if (thought.evidence && thought.evidence.length > 0) {
    for (const evidence of thought.evidence) {
      addNode(graph, {
        id: evidence.id,
        label: evidence.description,
        type: 'evidence',
        metadata: {
          reliability: evidence.reliability,
          source: evidence.source,
        },
      });
    }
  }

  // Add belief function nodes
  if (thought.beliefFunctions && thought.beliefFunctions.length > 0) {
    for (const belief of thought.beliefFunctions) {
      const metadata: Record<string, any> = {
        source: belief.source,
      };

      if (includeMetrics && belief.massAssignments) {
        metadata.massAssignments = belief.massAssignments.map(ma => ({
          hypothesisSet: ma.hypothesisSet,
          mass: ma.mass,
          justification: ma.justification,
        }));
      }

      if (belief.conflictMass !== undefined) {
        metadata.conflictMass = belief.conflictMass;
      }

      addNode(graph, {
        id: belief.id,
        label: `Belief: ${belief.source}`,
        type: 'belief',
        metadata,
      });

      // Create edges from evidence to beliefs
      if (thought.evidence && thought.evidence.length > 0) {
        const sourceEvidence = thought.evidence.find(e => e.id === belief.source);
        if (sourceEvidence) {
          addEdge(graph, {
            id: `edge_${sourceEvidence.id}_${belief.id}`,
            source: sourceEvidence.id,
            target: belief.id,
            label: 'supports',
            weight: sourceEvidence.reliability,
            metadata: includeMetrics ? {
              reliability: sourceEvidence.reliability,
            } : undefined,
          });
        }
      }
    }
  }

  // Add combined belief node if available
  if (thought.combinedBelief) {
    const metadata: Record<string, any> = {};

    if (includeMetrics && thought.combinedBelief.massAssignments) {
      metadata.massAssignments = thought.combinedBelief.massAssignments.map(ma => ({
        hypothesisSet: ma.hypothesisSet,
        mass: ma.mass,
        justification: ma.justification,
      }));
    }

    if (thought.combinedBelief.conflictMass !== undefined) {
      metadata.conflictMass = thought.combinedBelief.conflictMass;
    }

    addNode(graph, {
      id: 'combined_belief',
      label: 'Combined Belief',
      type: 'conclusion',
      metadata,
    });

    // Connect all beliefs to combined belief
    if (thought.beliefFunctions && thought.beliefFunctions.length > 0) {
      for (const belief of thought.beliefFunctions) {
        addEdge(graph, {
          id: `edge_${belief.id}_combined`,
          source: belief.id,
          target: 'combined_belief',
          label: 'combines',
        });
      }
    }
  }

  // Add frame of discernment as metadata if no evidence/beliefs
  if (graph.nodes.length === 0 && thought.frameOfDiscernment && thought.frameOfDiscernment.length > 0) {
    addNode(graph, {
      id: 'frame',
      label: 'Frame of Discernment',
      type: 'frame',
      metadata: {
        hypotheses: thought.frameOfDiscernment,
      },
    });
  }

  // Add metrics
  if (includeMetrics) {
    if (thought.frameOfDiscernment) {
      addMetric(graph, 'hypotheses', thought.frameOfDiscernment.length);
    }
    if (thought.evidence) {
      addMetric(graph, 'evidenceCount', thought.evidence.length);
    }
    if (thought.beliefFunctions) {
      addMetric(graph, 'beliefFunctions', thought.beliefFunctions.length);
    }
    if (thought.combinedBelief) {
      addMetric(graph, 'hasCombinedBelief', true);
    }
  }

  return serializeGraph(graph);
}

/**
 * Export evidential beliefs to Markdown format
 */
function evidentialToMarkdown(thought: EvidentialThought, options: VisualExportOptions): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
    includeMetrics = true,
  } = options;

  const parts: string[] = [];

  // Metrics
  if (includeMetrics) {
    parts.push(section('Metrics', keyValueSection({
      'Hypotheses': thought.frameOfDiscernment?.length || 0,
      'Evidence Items': thought.evidence?.length || 0,
      'Belief Functions': thought.beliefFunctions?.length || 0,
    })));
  }

  // Frame of discernment
  if (thought.frameOfDiscernment && thought.frameOfDiscernment.length > 0) {
    parts.push(section('Frame of Discernment',
      list(thought.frameOfDiscernment)
    ));
  }

  // Evidence
  if (thought.evidence && thought.evidence.length > 0) {
    const evRows = thought.evidence.map(ev => [
      ev.id,
      ev.description,
      ev.reliability.toFixed(2),
      ev.source || '-',
    ]);
    parts.push(section('Evidence', table(
      ['ID', 'Description', 'Reliability', 'Source'],
      evRows
    )));
  }

  // Belief functions
  if (thought.beliefFunctions && thought.beliefFunctions.length > 0) {
    const beliefContent: string[] = [];
    for (const bf of thought.beliefFunctions) {
      beliefContent.push(`**Source:** ${bf.source}\n`);
      if (bf.conflictMass !== undefined) {
        beliefContent.push(`**Conflict Mass:** ${bf.conflictMass.toFixed(3)}\n`);
      }
      const massRows = bf.massAssignments.map(ma => [
        `{${ma.hypothesisSet.join(', ')}}`,
        ma.mass.toFixed(3),
        ma.justification,
      ]);
      beliefContent.push(table(
        ['Hypothesis Set', 'Mass', 'Justification'],
        massRows
      ));
      beliefContent.push('\n');
    }
    parts.push(section('Belief Functions', beliefContent.join('')));
  }

  // Combined belief
  if (thought.combinedBelief) {
    const massRows = thought.combinedBelief.massAssignments.map(ma => [
      `{${ma.hypothesisSet.join(', ')}}`,
      ma.mass.toFixed(3),
      ma.justification,
    ]);
    let combinedContent = table(
      ['Hypothesis Set', 'Mass', 'Justification'],
      massRows
    );
    if (thought.combinedBelief.conflictMass !== undefined) {
      combinedContent += `\n**Conflict Mass:** ${thought.combinedBelief.conflictMass.toFixed(3)}\n`;
    }
    parts.push(section('Combined Belief', combinedContent));
  }

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaid = evidentialToMermaid(thought, 'default', true, includeMetrics);
    parts.push(section('Visualization', mermaidBlock(mermaid)));
  }

  return mdDocument('Evidential Reasoning Analysis', parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: {
      mode: 'evidential',
      hypotheses: thought.frameOfDiscernment?.length || 0,
    },
  });
}
