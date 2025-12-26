/**
 * Computability Visual Exporter (v8.5.0)
 * Phase 11: Turing machine diagrams, reduction chains, computation traces
 * Phase 13 Sprint 8: Refactored to use fluent builder classes
 *
 * Inspired by Alan Turing's foundational work on computability (1936)
 * Exports reasoning about computability theory to visual formats
 */

import type { ComputabilityThought, TuringMachine, Reduction } from '../../../types/index.js';
import type { VisualExportOptions } from '../types.js';
import { sanitizeId } from '../utils.js';
// Builder classes (Phase 13)
import { DOTGraphBuilder, type DotNodeStyle } from '../utils/dot.js';
import { MermaidGraphBuilder } from '../utils/mermaid.js';
import { ASCIIDocBuilder } from '../utils/ascii.js';
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
  renderMetricCard,
  renderSection,
  renderTable,
  renderList,
  renderBadge,
} from '../utils/html.js';
import {
  createJsonGraph,
  addNode,
  addEdge,
  addMetric,
  addLegendItem,
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
 * Export computability thought to visual format
 */
export function exportComputability(thought: ComputabilityThought, options: VisualExportOptions): string {
  const { format } = options;

  switch (format) {
    case 'mermaid':
      return computabilityToMermaid(thought, options);
    case 'dot':
      return computabilityToDOT(thought, options);
    case 'ascii':
      return computabilityToASCII(thought);
    case 'svg':
      return computabilityToSVG(thought, options);
    case 'graphml':
      return computabilityToGraphML(thought, options);
    case 'tikz':
      return computabilityToTikZ(thought, options);
    case 'html':
      return computabilityToHTML(thought, options);
    case 'json':
      return computabilityToJSON(thought, options);
    case 'markdown':
      return computabilityToMarkdown(thought, options);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Export to Mermaid diagram
 */
function computabilityToMermaid(thought: ComputabilityThought, options: VisualExportOptions): string {
  const { includeLabels = true } = options;

  // Decide what to visualize based on thought content
  if (thought.currentMachine || (thought.machines && thought.machines.length > 0)) {
    return turingMachineToMermaid(thought.currentMachine || thought.machines![0], includeLabels);
  }

  if (thought.reductions && thought.reductions.length > 0) {
    return reductionChainToMermaid(thought.reductions, thought.reductionChain, includeLabels);
  }

  if (thought.decidabilityProof) {
    return decidabilityProofToMermaid(thought, includeLabels);
  }

  // Default: show thought type and key insight using builder
  const builder = new MermaidGraphBuilder().setDirection('TD');
  builder.addNode({ id: 'type', label: thought.thoughtType || 'Computability', shape: 'rectangle' });
  if (thought.keyInsight) {
    builder.addNode({ id: 'insight', label: `${thought.keyInsight.substring(0, 50)}...`, shape: 'rectangle' });
    builder.addEdge({ source: 'type', target: 'insight' });
  }
  return builder.render();
}

/**
 * Turing machine to Mermaid state diagram
 * Note: Uses raw string building as MermaidGraphBuilder doesn't support stateDiagram-v2 syntax
 */
function turingMachineToMermaid(machine: TuringMachine, includeLabels: boolean): string {
  let mermaid = 'stateDiagram-v2\n';
  mermaid += `  [*] --> ${sanitizeId(machine.initialState)}\n`;

  // Add transitions
  for (const t of machine.transitions) {
    const label = includeLabels ? `${t.readSymbol}/${t.writeSymbol},${t.direction}` : '';
    mermaid += `  ${sanitizeId(t.fromState)} --> ${sanitizeId(t.toState)}`;
    if (label) {
      mermaid += `: ${label}`;
    }
    mermaid += '\n';
  }

  // Mark accept states
  for (const acceptState of machine.acceptStates) {
    mermaid += `  ${sanitizeId(acceptState)} --> [*]\n`;
  }

  return mermaid;
}

/**
 * Reduction chain to Mermaid
 */
function reductionChainToMermaid(reductions: Reduction[], chain: string[] | undefined, includeLabels: boolean): string {
  const builder = new MermaidGraphBuilder().setDirection('LR');

  if (chain && chain.length > 0) {
    // Use the chain ordering
    for (let i = 0; i < chain.length - 1; i++) {
      const from = sanitizeId(chain[i]);
      const to = sanitizeId(chain[i + 1]);
      const reduction = reductions.find(r => r.fromProblem === chain[i] && r.toProblem === chain[i + 1]);
      const label = includeLabels && reduction ? `≤${reduction.type === 'polynomial_time' ? 'p' : 'm'}` : undefined;
      builder.addNode({ id: from, label: chain[i], shape: 'rectangle' });
      builder.addNode({ id: to, label: chain[i + 1], shape: 'rectangle' });
      builder.addEdge({ source: from, target: to, label });
    }
  } else {
    // Show all reductions
    for (const r of reductions) {
      const from = sanitizeId(r.fromProblem);
      const to = sanitizeId(r.toProblem);
      const label = includeLabels ? `≤${r.type === 'polynomial_time' ? 'p' : 'm'}` : undefined;
      builder.addNode({ id: from, label: r.fromProblem, shape: 'rectangle' });
      builder.addNode({ id: to, label: r.toProblem, shape: 'rectangle' });
      builder.addEdge({ source: from, target: to, label });
    }
  }

  return builder.render();
}

/**
 * Decidability proof to Mermaid
 */
function decidabilityProofToMermaid(thought: ComputabilityThought, _includeLabels: boolean): string {
  const proof = thought.decidabilityProof!;
  const builder = new MermaidGraphBuilder().setDirection('TD');

  builder.addNode({ id: 'problem', label: `Problem: ${proof.problem}`, shape: 'rectangle' });
  builder.addNode({ id: 'method', label: `Method: ${proof.method}`, shape: 'rectangle' });
  builder.addNode({ id: 'conclusion', label: proof.conclusion.toUpperCase(), shape: 'rectangle' });

  builder.addEdge({ source: 'problem', target: 'method' });
  builder.addEdge({ source: 'method', target: 'conclusion' });

  return builder.render();
}

/**
 * Export to DOT format
 */
function computabilityToDOT(thought: ComputabilityThought, options: VisualExportOptions): string {
  const { includeLabels = true } = options;

  if (thought.currentMachine || (thought.machines && thought.machines.length > 0)) {
    return turingMachineToDOT(thought.currentMachine || thought.machines![0], includeLabels);
  }

  if (thought.reductions && thought.reductions.length > 0) {
    return reductionChainToDOT(thought.reductions, thought.reductionChain, includeLabels);
  }

  // Default: show thought type using builder
  const builder = new DOTGraphBuilder()
    .setGraphName('Computability')
    .setRankDir('TB');
  builder.addNode({ id: 'type', label: thought.thoughtType || 'Computability' });
  return builder.render();
}

/**
 * Turing machine to DOT
 */
function turingMachineToDOT(machine: TuringMachine, includeLabels: boolean): string {
  const builder = new DOTGraphBuilder()
    .setGraphName('TuringMachine')
    .setRankDir('LR')
    .setNodeDefaults({ shape: 'circle' });

  // Initial state marker
  builder.addNode({ id: 'start', shape: 'point' });
  builder.addEdge({ source: 'start', target: sanitizeId(machine.initialState) });

  // States
  for (const state of machine.states) {
    const isAccept = machine.acceptStates.includes(state);
    const isReject = machine.rejectStates.includes(state);
    const shape = isAccept ? 'doublecircle' : 'circle';
    const style: DotNodeStyle | DotNodeStyle[] | undefined = isReject ? ['filled'] as DotNodeStyle[] : undefined;
    const fillColor = isReject ? 'lightgray' : undefined;
    builder.addNode({ id: sanitizeId(state), label: state, shape, style, fillColor });
  }

  // Transitions
  for (const t of machine.transitions) {
    const label = includeLabels ? `${t.readSymbol}/${t.writeSymbol},${t.direction}` : undefined;
    builder.addEdge({ source: sanitizeId(t.fromState), target: sanitizeId(t.toState), label });
  }

  return builder.render();
}

/**
 * Reduction chain to DOT
 */
function reductionChainToDOT(reductions: Reduction[], _chain: string[] | undefined, includeLabels: boolean): string {
  const builder = new DOTGraphBuilder()
    .setGraphName('ReductionChain')
    .setRankDir('LR')
    .setNodeDefaults({ shape: 'box', style: 'rounded' });

  // Collect all problems
  const problems = new Set<string>();
  for (const r of reductions) {
    problems.add(r.fromProblem);
    problems.add(r.toProblem);
  }

  // Add problem nodes
  for (const p of problems) {
    builder.addNode({ id: sanitizeId(p), label: p });
  }

  // Add reduction edges
  for (const r of reductions) {
    const label = includeLabels ? `≤${r.type === 'polynomial_time' ? 'p' : 'm'}` : undefined;
    builder.addEdge({ source: sanitizeId(r.fromProblem), target: sanitizeId(r.toProblem), label });
  }

  return builder.render();
}

/**
 * Export to ASCII art
 */
function computabilityToASCII(thought: ComputabilityThought): string {
  const builder = new ASCIIDocBuilder()
    .setMaxWidth(50)
    .addHeader('COMPUTABILITY ANALYSIS');

  builder.addSection('Type')
    .addText(`${thought.thoughtType}\n`)
    .addEmptyLine();

  if (thought.keyInsight) {
    builder.addSection('Key Insight')
      .addText(`${thought.keyInsight}\n`)
      .addEmptyLine();
  }

  // Turing machine
  if (thought.currentMachine) {
    const m = thought.currentMachine;
    builder.addSection('Turing Machine')
      .addText(`Name: ${m.name}\n`)
      .addText(`States: {${m.states.join(', ')}}\n`)
      .addText(`Initial: ${m.initialState}\n`)
      .addText(`Accept: {${m.acceptStates.join(', ')}}\n`)
      .addText(`Transitions: ${m.transitions.length}\n`)
      .addEmptyLine();
  }

  // Computation trace
  if (thought.computationTrace) {
    const trace = thought.computationTrace;
    builder.addSection('Computation Trace')
      .addText(`Input: ${trace.input}\n`)
      .addText(`Steps: ${trace.totalSteps}\n`)
      .addText(`Result: ${trace.result.toUpperCase()}\n`);

    // Show first few steps
    for (const step of trace.steps.slice(0, 5)) {
      const head = ' '.repeat(step.headPosition) + 'v';
      builder.addText(`[${step.stepNumber}] ${step.state}: ${step.tapeContents}\n`);
      builder.addText(`     ${head}\n`);
    }
    if (trace.steps.length > 5) {
      builder.addText(`... (${trace.steps.length - 5} more steps)\n`);
    }
    builder.addEmptyLine();
  }

  // Decidability proof
  if (thought.decidabilityProof) {
    const proof = thought.decidabilityProof;
    builder.addSection('Decidability Analysis')
      .addText(`Problem: ${proof.problem}\n`)
      .addText(`Method: ${proof.method}\n`)
      .addText(`Conclusion: ${proof.conclusion.toUpperCase()}\n`);

    if (proof.proofSteps.length > 0) {
      builder.addEmptyLine()
        .addText('Proof Steps:\n');
      for (let i = 0; i < Math.min(proof.proofSteps.length, 5); i++) {
        builder.addText(`  ${i + 1}. ${proof.proofSteps[i]}\n`);
      }
    }
    builder.addEmptyLine();
  }

  // Reductions
  if (thought.reductions && thought.reductions.length > 0) {
    builder.addSection('Reductions');
    for (const r of thought.reductions) {
      builder.addText(`${r.fromProblem} ≤${r.type === 'polynomial_time' ? 'p' : 'm'} ${r.toProblem}\n`);
    }
    builder.addEmptyLine();
  }

  // Diagonalization
  if (thought.diagonalization) {
    const diag = thought.diagonalization;
    builder.addSection('Diagonalization Argument')
      .addText(`Pattern: ${diag.pattern}\n`)
      .addText(`Enumeration: ${diag.enumeration.description}\n`)
      .addText(`Diagonal: ${diag.diagonalConstruction.description}\n`)
      .addText(`Contradiction: ${diag.contradiction.impossibility}\n`);
  }

  return builder.render();
}

/**
 * Export to SVG
 */
function computabilityToSVG(thought: ComputabilityThought, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = 400,
  } = options;

  const title = thought.currentMachine?.name || 'Computability Analysis';

  if (thought.currentMachine) {
    return turingMachineToSVG(thought.currentMachine, { ...options, colorScheme, svgWidth, svgHeight });
  }

  // Default: show summary
  const positions = new Map<string, SVGNodePosition>();
  positions.set('type', {
    id: 'type',
    x: svgWidth / 2 - 60,
    y: 80,
    width: 120,
    height: 40,
    label: thought.thoughtType,
    type: 'type',
  });

  let svg = generateSVGHeader(svgWidth, svgHeight, title);

  svg += '\n  <!-- Nodes -->\n  <g class="nodes">';
  for (const [, pos] of positions) {
    svg += renderRectNode(pos, getNodeColor('primary', colorScheme));
  }
  svg += '\n  </g>';

  if (includeMetrics) {
    const metrics = [
      { label: 'Type', value: thought.thoughtType },
      { label: 'Uncertainty', value: thought.uncertainty.toFixed(2) },
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 80, metrics);
  }

  svg += '\n' + generateSVGFooter();
  return svg;
}

/**
 * Turing machine to SVG
 */
function turingMachineToSVG(machine: TuringMachine, options: VisualExportOptions): string {
  const {
    colorScheme = 'default',
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = 400,
  } = options;

  const positions = new Map<string, SVGNodePosition>();
  const nodeRadius = 30;
  const spacing = 120;

  // Arrange states in a grid
  const cols = Math.ceil(Math.sqrt(machine.states.length));
  machine.states.forEach((state, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    positions.set(state, {
      id: state,
      x: 100 + col * spacing,
      y: 100 + row * spacing,
      width: nodeRadius * 2,
      height: nodeRadius * 2,
      label: state,
      type: machine.acceptStates.includes(state) ? 'accept' : machine.rejectStates.includes(state) ? 'reject' : 'state',
    });
  });

  let svg = generateSVGHeader(svgWidth, svgHeight, machine.name);

  // Render edges
  svg += '\n  <!-- Transitions -->\n  <g class="edges">';
  for (const t of machine.transitions) {
    const fromPos = positions.get(t.fromState);
    const toPos = positions.get(t.toState);
    if (fromPos && toPos) {
      svg += renderEdge(fromPos, toPos, { label: `${t.readSymbol}/${t.writeSymbol}` });
    }
  }
  svg += '\n  </g>';

  // Render nodes
  svg += '\n\n  <!-- States -->\n  <g class="nodes">';
  for (const [, pos] of positions) {
    const colors = pos.type === 'accept'
      ? getNodeColor('success', colorScheme)
      : pos.type === 'reject'
        ? getNodeColor('danger', colorScheme)
        : getNodeColor('neutral', colorScheme);
    svg += renderEllipseNode(pos, colors);
  }
  svg += '\n  </g>';

  // Legend
  const legendItems = [
    { label: 'State', color: getNodeColor('neutral', colorScheme) },
    { label: 'Accept', color: getNodeColor('success', colorScheme) },
    { label: 'Reject', color: getNodeColor('danger', colorScheme) },
  ];
  svg += renderLegend(20, svgHeight - 80, legendItems);

  svg += '\n' + generateSVGFooter();
  return svg;
}

/**
 * Export to GraphML
 */
function computabilityToGraphML(thought: ComputabilityThought, options: VisualExportOptions): string {
  const nodes: GraphMLNode[] = [];
  const edges: GraphMLEdge[] = [];
  let edgeId = 0;

  if (thought.currentMachine) {
    const m = thought.currentMachine;

    for (const state of m.states) {
      nodes.push({
        id: sanitizeId(state),
        label: state,
        type: m.acceptStates.includes(state) ? 'accept' : m.rejectStates.includes(state) ? 'reject' : 'state',
      });
    }

    for (const t of m.transitions) {
      edges.push({
        id: `e${edgeId++}`,
        source: sanitizeId(t.fromState),
        target: sanitizeId(t.toState),
        label: options.includeLabels ? `${t.readSymbol}/${t.writeSymbol},${t.direction}` : undefined,
        directed: true,
      });
    }

    return generateGraphML(nodes, edges, { graphName: m.name });
  }

  // Default
  nodes.push({ id: 'root', label: thought.thoughtType, type: 'root' });
  return generateGraphML(nodes, edges, { graphName: 'Computability Analysis' });
}

/**
 * Export to TikZ
 */
function computabilityToTikZ(thought: ComputabilityThought, options: VisualExportOptions): string {
  const nodes: TikZNode[] = [];
  const edges: TikZEdge[] = [];

  if (thought.currentMachine) {
    const m = thought.currentMachine;
    const cols = Math.ceil(Math.sqrt(m.states.length));

    m.states.forEach((state, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      nodes.push({
        id: sanitizeId(state),
        label: state,
        x: col * 3,
        y: -row * 2,
        shape: 'ellipse',
        type: m.acceptStates.includes(state) ? 'success' : m.rejectStates.includes(state) ? 'danger' : 'neutral',
      });
    });

    for (const t of m.transitions) {
      edges.push({
        source: sanitizeId(t.fromState),
        target: sanitizeId(t.toState),
        label: options.includeLabels ? `${t.readSymbol}/${t.writeSymbol}` : undefined,
        directed: true,
      });
    }

    return generateTikZ(nodes, edges, { title: m.name, colorScheme: options.colorScheme });
  }

  nodes.push({ id: 'root', label: thought.thoughtType, x: 0, y: 0, shape: 'rectangle', type: 'primary' });
  return generateTikZ(nodes, edges, { title: 'Computability Analysis' });
}

/**
 * Export to HTML
 */
function computabilityToHTML(thought: ComputabilityThought, options: VisualExportOptions): string {
  const {
    htmlStandalone = true,
    htmlTitle = 'Computability Analysis',
    htmlTheme = 'light',
    includeMetrics = true,
  } = options;

  let html = generateHTMLHeader(htmlTitle, { standalone: htmlStandalone, theme: htmlTheme });
  html += `<h1>${escapeHTML(htmlTitle)}</h1>\n`;

  // Type badge
  const typeBadge = renderBadge(thought.thoughtType, 'primary');
  html += `<p>Analysis Type: ${typeBadge}</p>\n`;

  // Metrics
  if (includeMetrics) {
    html += '<div class="metrics-grid">';
    html += renderMetricCard('Thought Type', thought.thoughtType, 'primary');
    html += renderMetricCard('Uncertainty', thought.uncertainty.toFixed(2), 'info');
    if (thought.machines) {
      html += renderMetricCard('Machines', thought.machines.length, 'info');
    }
    if (thought.reductions) {
      html += renderMetricCard('Reductions', thought.reductions.length, 'info');
    }
    html += '</div>\n';
  }

  // Turing machine
  if (thought.currentMachine) {
    const m = thought.currentMachine;
    html += renderSection('Turing Machine', `
      <p><strong>Name:</strong> ${escapeHTML(m.name)}</p>
      <p><strong>Type:</strong> ${escapeHTML(m.type)}</p>
      <p><strong>States:</strong> {${m.states.map(s => escapeHTML(s)).join(', ')}}</p>
      <p><strong>Initial State:</strong> ${escapeHTML(m.initialState)}</p>
      <p><strong>Accept States:</strong> {${m.acceptStates.map(s => escapeHTML(s)).join(', ')}}</p>
      <p><strong>Transitions:</strong> ${m.transitions.length}</p>
    `, '🤖');
  }

  // Decidability proof
  if (thought.decidabilityProof) {
    const proof = thought.decidabilityProof;
    const conclusionBadge = renderBadge(
      proof.conclusion.toUpperCase(),
      proof.conclusion === 'decidable' ? 'success' : proof.conclusion === 'undecidable' ? 'danger' : 'warning'
    );
    html += renderSection('Decidability Analysis', `
      <p><strong>Problem:</strong> ${escapeHTML(proof.problem)}</p>
      <p><strong>Method:</strong> ${escapeHTML(proof.method)}</p>
      <p><strong>Conclusion:</strong> ${conclusionBadge}</p>
      ${proof.proofSteps.length > 0 ? renderList(proof.proofSteps) : ''}
    `, '📊');
  }

  // Reductions
  if (thought.reductions && thought.reductions.length > 0) {
    const rows = thought.reductions.map(r => [
      escapeHTML(r.fromProblem),
      `≤${r.type === 'polynomial_time' ? 'p' : 'm'}`,
      escapeHTML(r.toProblem),
    ]);
    html += renderSection('Reductions', renderTable(['From', 'Type', 'To'], rows), '🔗');
  }

  // Key insight
  if (thought.keyInsight) {
    html += renderSection('Key Insight', `<p>${escapeHTML(thought.keyInsight)}</p>`, '💡');
  }

  html += generateHTMLFooter(htmlStandalone);
  return html;
}

/**
 * Export to JSON
 */
function computabilityToJSON(thought: ComputabilityThought, options: VisualExportOptions): string {
  const { includeMetrics = true } = options;

  const graph = createJsonGraph('Computability Analysis', 'computability');

  addNode(graph, {
    id: 'root',
    label: thought.thoughtType,
    type: 'thought-type',
    metadata: {
      uncertainty: thought.uncertainty,
      keyInsight: thought.keyInsight,
    },
  });

  let edgeId = 0;

  // Add machines
  if (thought.machines) {
    for (const m of thought.machines) {
      addNode(graph, {
        id: sanitizeId(m.id),
        label: m.name,
        type: 'turing-machine',
        metadata: {
          states: m.states.length,
          transitions: m.transitions.length,
          type: m.type,
        },
      });
      addEdge(graph, {
        id: `e${edgeId++}`,
        source: 'root',
        target: sanitizeId(m.id),
        type: 'contains',
      });
    }
  }

  // Add reductions
  if (thought.reductions) {
    for (const r of thought.reductions) {
      addNode(graph, {
        id: sanitizeId(r.id),
        label: `${r.fromProblem} → ${r.toProblem}`,
        type: 'reduction',
        metadata: {
          reductionType: r.type,
          fromProblem: r.fromProblem,
          toProblem: r.toProblem,
        },
      });
    }
  }

  // Metrics
  if (includeMetrics) {
    addMetric(graph, 'Thought Type', thought.thoughtType);
    addMetric(graph, 'Uncertainty', thought.uncertainty);
    if (thought.machines) {
      addMetric(graph, 'Machines', thought.machines.length);
    }
    if (thought.decidabilityProof) {
      addMetric(graph, 'Conclusion', thought.decidabilityProof.conclusion);
    }
  }

  // Legend
  addLegendItem(graph, 'Turing Machine', '#4A90E2');
  addLegendItem(graph, 'Reduction', '#50C878');
  addLegendItem(graph, 'Decidable', '#28A745');
  addLegendItem(graph, 'Undecidable', '#DC3545');

  return serializeGraph(graph);
}

/**
 * Export to Markdown
 */
function computabilityToMarkdown(thought: ComputabilityThought, options: VisualExportOptions): string {
  const {
    markdownIncludeFrontmatter = false,
    markdownIncludeToc = false,
    markdownIncludeMermaid = true,
    includeMetrics = true,
  } = options;

  const parts: string[] = [];

  // Metrics
  if (includeMetrics) {
    parts.push(section('Analysis', keyValueSection({
      'Type': thought.thoughtType,
      'Uncertainty': thought.uncertainty.toFixed(2),
      ...(thought.keyInsight ? { 'Key Insight': thought.keyInsight } : {}),
    })));
  }

  // Turing machine
  if (thought.currentMachine) {
    const m = thought.currentMachine;
    parts.push(section('Turing Machine', keyValueSection({
      'Name': m.name,
      'Type': m.type,
      'States': `{${m.states.join(', ')}}`,
      'Initial State': m.initialState,
      'Accept States': `{${m.acceptStates.join(', ')}}`,
      'Transitions': m.transitions.length.toString(),
    })));

    // Transition table
    if (m.transitions.length > 0) {
      const transitionRows = m.transitions.map(t => [
        t.fromState,
        t.readSymbol,
        t.toState,
        t.writeSymbol,
        t.direction,
      ]);
      parts.push(section('Transition Function', table(
        ['From State', 'Read', 'To State', 'Write', 'Move'],
        transitionRows
      )));
    }
  }

  // Decidability proof
  if (thought.decidabilityProof) {
    const proof = thought.decidabilityProof;
    parts.push(section('Decidability Analysis', keyValueSection({
      'Problem': proof.problem,
      'Method': proof.method,
      'Conclusion': `**${proof.conclusion.toUpperCase()}**`,
    })));

    if (proof.proofSteps.length > 0) {
      parts.push(section('Proof Steps', list(proof.proofSteps.map((s, i) => `${i + 1}. ${s}`))));
    }
  }

  // Reductions
  if (thought.reductions && thought.reductions.length > 0) {
    const reductionRows = thought.reductions.map(r => [
      r.fromProblem,
      `≤${r.type === 'polynomial_time' ? 'p' : 'm'}`,
      r.toProblem,
    ]);
    parts.push(section('Reductions', table(['From Problem', 'Reduction', 'To Problem'], reductionRows)));
  }

  // Diagonalization
  if (thought.diagonalization) {
    const d = thought.diagonalization;
    parts.push(section('Diagonalization Argument', keyValueSection({
      'Pattern': d.pattern,
      'Enumeration': d.enumeration.description,
      'Diagonal Construction': d.diagonalConstruction.description,
      'Contradiction': d.contradiction.impossibility,
    })));
  }

  // Mermaid diagram
  if (markdownIncludeMermaid) {
    const mermaidDiagram = computabilityToMermaid(thought, { ...options, format: 'mermaid' });
    parts.push(section('Diagram', mermaidBlock(mermaidDiagram)));
  }

  return mdDocument('Computability Analysis', parts.join('\n'), {
    includeFrontmatter: markdownIncludeFrontmatter,
    includeTableOfContents: markdownIncludeToc,
    metadata: {
      mode: 'computability',
      thoughtType: thought.thoughtType,
      uncertainty: thought.uncertainty,
    },
  });
}
