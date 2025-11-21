/**
 * Visual Export Module (v2.5)
 * Exports thinking sessions to visual formats: Mermaid, DOT, ASCII
 */

import type {
  CausalThought,
  TemporalThought,
  GameTheoryThought,
  BayesianThought,
  SequentialThought,
  ShannonThought,
  AbductiveThought,
  CounterfactualThought,
  AnalogicalThought,
  EvidentialThought
} from '../types/index.js';

export type VisualFormat = 'mermaid' | 'dot' | 'ascii';

export interface VisualExportOptions {
  format: VisualFormat;
  colorScheme?: 'default' | 'monochrome' | 'pastel';
  includeLabels?: boolean;
  includeMetrics?: boolean;
}

/**
 * Visual Exporter for converting thoughts to visual diagram formats
 */
export class VisualExporter {
  /**
   * Export causal graph to visual format
   */
  exportCausalGraph(thought: CausalThought, options: VisualExportOptions): string {
    const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

    switch (format) {
      case 'mermaid':
        return this.causalGraphToMermaid(thought, colorScheme, includeLabels, includeMetrics);
      case 'dot':
        return this.causalGraphToDOT(thought, includeLabels, includeMetrics);
      case 'ascii':
        return this.causalGraphToASCII(thought);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Export temporal timeline to visual format
   */
  exportTemporalTimeline(thought: TemporalThought, options: VisualExportOptions): string {
    const { format, includeLabels = true } = options;

    switch (format) {
      case 'mermaid':
        return this.timelineToMermaidGantt(thought, includeLabels);
      case 'dot':
        return this.timelineToDOT(thought, includeLabels);
      case 'ascii':
        return this.timelineToASCII(thought);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Export game tree to visual format
   */
  exportGameTree(thought: GameTheoryThought, options: VisualExportOptions): string {
    const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

    switch (format) {
      case 'mermaid':
        return this.gameTreeToMermaid(thought, colorScheme, includeLabels, includeMetrics);
      case 'dot':
        return this.gameTreeToDOT(thought, includeLabels, includeMetrics);
      case 'ascii':
        return this.gameTreeToASCII(thought);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Export Bayesian network to visual format
   */
  exportBayesianNetwork(thought: BayesianThought, options: VisualExportOptions): string {
    const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

    switch (format) {
      case 'mermaid':
        return this.bayesianToMermaid(thought, colorScheme, includeLabels, includeMetrics);
      case 'dot':
        return this.bayesianToDOT(thought, includeLabels, includeMetrics);
      case 'ascii':
        return this.bayesianToASCII(thought);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  // ===== Causal Graph Exporters =====

  private causalGraphToMermaid(
    thought: CausalThought,
    colorScheme: string,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let mermaid = 'graph TB\n';

    // Add nodes with appropriate shapes
    for (const node of thought.causalGraph.nodes) {
      const nodeId = this.sanitizeId(node.id);
      const label = includeLabels ? node.name : nodeId;

      // Different shapes for different node types
      let shape: [string, string];
      switch (node.type) {
        case 'cause':
          shape = ['([', '])'];  // Stadium shape
          break;
        case 'effect':
          shape = ['[[', ']]'];  // Subroutine shape
          break;
        case 'mediator':
          shape = ['[', ']'];    // Rectangle
          break;
        case 'confounder':
          shape = ['{', '}'];    // Diamond
          break;
        default:
          shape = ['[', ']'];
      }

      mermaid += `  ${nodeId}${shape[0]}${label}${shape[1]}\n`;
    }

    mermaid += '\n';

    // Add edges with strength labels
    for (const edge of thought.causalGraph.edges) {
      const fromId = this.sanitizeId(edge.from);
      const toId = this.sanitizeId(edge.to);

      if (includeMetrics && edge.strength !== undefined) {
        mermaid += `  ${fromId} --> |${edge.strength.toFixed(2)}| ${toId}\n`;
      } else {
        mermaid += `  ${fromId} --> ${toId}\n`;
      }
    }

    // Add styling based on color scheme
    if (colorScheme !== 'monochrome') {
      mermaid += '\n';
      const causes = thought.causalGraph.nodes.filter(n => n.type === 'cause');
      const effects = thought.causalGraph.nodes.filter(n => n.type === 'effect');

      for (const node of causes) {
        const color = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
        mermaid += `  style ${this.sanitizeId(node.id)} fill:${color}\n`;
      }

      for (const node of effects) {
        const color = colorScheme === 'pastel' ? '#fff3e0' : '#ffd699';
        mermaid += `  style ${this.sanitizeId(node.id)} fill:${color}\n`;
      }
    }

    return mermaid;
  }

  private causalGraphToDOT(
    thought: CausalThought,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let dot = 'digraph CausalGraph {\n';
    dot += '  rankdir=TB;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    // Add nodes
    for (const node of thought.causalGraph.nodes) {
      const nodeId = this.sanitizeId(node.id);
      const label = includeLabels ? node.name : nodeId;

      let shape = 'box';
      switch (node.type) {
        case 'cause': shape = 'ellipse'; break;
        case 'effect': shape = 'doubleoctagon'; break;
        case 'mediator': shape = 'box'; break;
        case 'confounder': shape = 'diamond'; break;
      }

      dot += `  ${nodeId} [label="${label}", shape=${shape}];\n`;
    }

    dot += '\n';

    // Add edges
    for (const edge of thought.causalGraph.edges) {
      const fromId = this.sanitizeId(edge.from);
      const toId = this.sanitizeId(edge.to);

      if (includeMetrics && edge.strength !== undefined) {
        dot += `  ${fromId} -> ${toId} [label="${edge.strength.toFixed(2)}"];\n`;
      } else {
        dot += `  ${fromId} -> ${toId};\n`;
      }
    }

    dot += '}\n';
    return dot;
  }

  private causalGraphToASCII(thought: CausalThought): string {
    let ascii = 'Causal Graph:\n';
    ascii += '=============\n\n';

    // List nodes
    ascii += 'Nodes:\n';
    for (const node of thought.causalGraph.nodes) {
      ascii += `  [${node.type.toUpperCase()}] ${node.name}: ${node.description}\n`;
    }

    ascii += '\nEdges:\n';
    for (const edge of thought.causalGraph.edges) {
      const fromNode = thought.causalGraph.nodes.find(n => n.id === edge.from);
      const toNode = thought.causalGraph.nodes.find(n => n.id === edge.to);
      const strength = edge.strength !== undefined ? ` (strength: ${edge.strength.toFixed(2)})` : '';
      ascii += `  ${fromNode?.name} --> ${toNode?.name}${strength}\n`;
    }

    return ascii;
  }

  // ===== Temporal Timeline Exporters =====

  private timelineToMermaidGantt(thought: TemporalThought, includeLabels: boolean): string {
    let gantt = 'gantt\n';
    gantt += `  title ${thought.timeline?.name || 'Timeline'}\n`;
    gantt += '  dateFormat X\n';
    gantt += '  axisFormat %s\n\n';

    if (!thought.events || thought.events.length === 0) {
      return gantt + '  No events\n';
    }

    // Group events into sections if possible
    gantt += '  section Events\n';

    for (const event of thought.events) {
      const label = includeLabels ? event.name : event.id;

      if (event.type === 'instant') {
        gantt += `  ${label} :milestone, ${event.timestamp}, 0s\n`;
      } else if (event.type === 'interval' && event.duration) {
        gantt += `  ${label} :${event.timestamp}, ${event.duration}s\n`;
      }
    }

    return gantt;
  }

  private timelineToDOT(thought: TemporalThought, includeLabels: boolean): string {
    let dot = 'digraph Timeline {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box];\n\n';

    if (!thought.events) {
      dot += '}\n';
      return dot;
    }

    // Sort events by timestamp
    const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);

    // Add nodes
    for (const event of sortedEvents) {
      const nodeId = this.sanitizeId(event.id);
      const label = includeLabels ? `${event.name}\\n(t=${event.timestamp})` : nodeId;
      const shape = event.type === 'instant' ? 'ellipse' : 'box';

      dot += `  ${nodeId} [label="${label}", shape=${shape}];\n`;
    }

    dot += '\n';

    // Connect sequential events
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const from = this.sanitizeId(sortedEvents[i].id);
      const to = this.sanitizeId(sortedEvents[i + 1].id);
      dot += `  ${from} -> ${to};\n`;
    }

    // Add temporal relations if they exist
    if (thought.relations) {
      dot += '\n  // Causal relations\n';
      for (const rel of thought.relations) {
        const from = this.sanitizeId(rel.from);
        const to = this.sanitizeId(rel.to);
        dot += `  ${from} -> ${to} [style=dashed, label="${rel.relationType}"];\n`;
      }
    }

    dot += '}\n';
    return dot;
  }

  private timelineToASCII(thought: TemporalThought): string {
    let ascii = `Timeline: ${thought.timeline?.name || 'Untitled'}\n`;
    ascii += '='.repeat(40) + '\n\n';

    if (!thought.events || thought.events.length === 0) {
      return ascii + 'No events\n';
    }

    // Sort events by timestamp
    const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);

    for (const event of sortedEvents) {
      const marker = event.type === 'instant' ? '⦿' : '━';
      ascii += `t=${event.timestamp.toString().padStart(4)} ${marker} ${event.name}\n`;
      if (event.duration) {
        ascii += `       ${'└'.padStart(5)}→ duration: ${event.duration}\n`;
      }
    }

    return ascii;
  }

  // ===== Game Theory Exporters =====

  private gameTreeToMermaid(
    thought: GameTheoryThought,
    _colorScheme: string,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let mermaid = 'graph TD\n';

    if (!thought.game) {
      return mermaid + '  root[No game defined]\n';
    }

    // If we have a game tree structure, use it
    if (thought.gameTree && thought.gameTree.nodes) {
      for (const node of thought.gameTree.nodes) {
        const nodeId = this.sanitizeId(node.id);
        const label = includeLabels ? (node.action || node.id) : nodeId;

        // Terminal nodes use double boxes
        const shape = node.type === 'terminal' ? ['[[', ']]'] : ['[', ']'];
        mermaid += `  ${nodeId}${shape[0]}${label}${shape[1]}\n`;
      }

      mermaid += '\n';

      for (const node of thought.gameTree.nodes) {
        if (node.childNodes && node.childNodes.length > 0) {
          for (const childId of node.childNodes) {
            const fromId = this.sanitizeId(node.id);
            const toId = this.sanitizeId(childId);

            // Find the child node to get its action
            const childNode = thought.gameTree.nodes.find(n => n.id === childId);

            if (includeMetrics && childNode?.action) {
              mermaid += `  ${fromId} --> |${childNode.action}| ${toId}\n`;
            } else {
              mermaid += `  ${fromId} --> ${toId}\n`;
            }
          }
        }
      }
    } else {
      // Fallback: show strategies as a simple tree
      mermaid += '  root[Game]\n';
      if (thought.strategies) {
        for (const strategy of thought.strategies.slice(0, 5)) {
          const stratId = this.sanitizeId(strategy.id);
          mermaid += `  root --> ${stratId}[${strategy.name}]\n`;
        }
      }
    }

    return mermaid;
  }

  private gameTreeToDOT(
    thought: GameTheoryThought,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let dot = 'digraph GameTree {\n';
    dot += '  rankdir=TD;\n';
    dot += '  node [shape=circle];\n\n';

    if (!thought.game) {
      dot += '  root [label="No game"];\n}\n';
      return dot;
    }

    if (thought.gameTree && thought.gameTree.nodes) {
      for (const node of thought.gameTree.nodes) {
        const nodeId = this.sanitizeId(node.id);
        const label = includeLabels ? (node.action || node.id) : nodeId;
        const shape = node.type === 'terminal' ? 'doublecircle' : 'circle';

        dot += `  ${nodeId} [label="${label}", shape=${shape}];\n`;
      }

      dot += '\n';

      for (const node of thought.gameTree.nodes) {
        if (node.childNodes && node.childNodes.length > 0) {
          for (const childId of node.childNodes) {
            const fromId = this.sanitizeId(node.id);
            const toId = this.sanitizeId(childId);

            // Find the child node to get its action
            const childNode = thought.gameTree.nodes.find(n => n.id === childId);

            if (includeMetrics && childNode?.action) {
              dot += `  ${fromId} -> ${toId} [label="${childNode.action}"];\n`;
            } else {
              dot += `  ${fromId} -> ${toId};\n`;
            }
          }
        }
      }
    }

    dot += '}\n';
    return dot;
  }

  private gameTreeToASCII(thought: GameTheoryThought): string {
    let ascii = `Game: ${thought.game?.name || 'Untitled'}\n`;
    ascii += '='.repeat(40) + '\n\n';

    if (thought.strategies && thought.strategies.length > 0) {
      ascii += 'Strategies:\n';
      for (const strategy of thought.strategies) {
        const strategyType = strategy.isPure ? 'Pure' : 'Mixed';
        ascii += `  • ${strategy.name} (${strategyType})\n`;
      }
    }

    if (thought.nashEquilibria && thought.nashEquilibria.length > 0) {
      ascii += '\nEquilibria:\n';
      for (const eq of thought.nashEquilibria) {
        ascii += `  ⚖ ${eq.type}: ${eq.strategyProfile.join(', ')}\n`;
        ascii += `    Payoffs: [${eq.payoffs.join(', ')}]\n`;
      }
    }

    return ascii;
  }

  // ===== Bayesian Network Exporters =====

  private bayesianToMermaid(
    thought: BayesianThought,
    colorScheme: string,
    _includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let mermaid = 'graph LR\n';

    // Create nodes for hypothesis, prior, evidence, posterior
    mermaid += `  H([Hypothesis])\n`;
    mermaid += `  Prior[Prior: ${includeMetrics ? thought.prior.probability.toFixed(3) : '?'}]\n`;
    mermaid += `  Evidence[Evidence]\n`;
    mermaid += `  Posterior[[Posterior: ${includeMetrics ? thought.posterior.probability.toFixed(3) : '?'}]]\n`;

    mermaid += '\n';
    mermaid += '  Prior --> H\n';
    mermaid += '  Evidence --> H\n';
    mermaid += '  H --> Posterior\n';

    // Add styling
    if (colorScheme !== 'monochrome') {
      mermaid += '\n';
      const priorColor = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
      const posteriorColor = colorScheme === 'pastel' ? '#c8e6c9' : '#81c784';

      mermaid += `  style Prior fill:${priorColor}\n`;
      mermaid += `  style Posterior fill:${posteriorColor}\n`;
    }

    return mermaid;
  }

  private bayesianToDOT(
    thought: BayesianThought,
    _includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let dot = 'digraph BayesianNetwork {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=ellipse];\n\n';

    const priorProb = includeMetrics ? `: ${thought.prior.probability.toFixed(3)}` : '';
    const posteriorProb = includeMetrics ? `: ${thought.posterior.probability.toFixed(3)}` : '';

    dot += `  Prior [label="Prior${priorProb}"];\n`;
    dot += `  Hypothesis [label="Hypothesis", shape=box];\n`;
    dot += `  Evidence [label="Evidence"];\n`;
    dot += `  Posterior [label="Posterior${posteriorProb}", shape=doublecircle];\n`;

    dot += '\n';
    dot += '  Prior -> Hypothesis;\n';
    dot += '  Evidence -> Hypothesis;\n';
    dot += '  Hypothesis -> Posterior;\n';

    dot += '}\n';
    return dot;
  }

  private bayesianToASCII(thought: BayesianThought): string {
    let ascii = 'Bayesian Network:\n';
    ascii += '=================\n\n';

    ascii += `Hypothesis: ${thought.hypothesis.statement}\n\n`;
    ascii += `Prior Probability: ${thought.prior.probability.toFixed(3)}\n`;
    ascii += `  Justification: ${thought.prior.justification}\n\n`;

    if (thought.evidence && thought.evidence.length > 0) {
      ascii += 'Evidence:\n';
      for (const ev of thought.evidence) {
        ascii += `  • ${ev.description}\n`;
      }
      ascii += '\n';
    }

    ascii += `Posterior Probability: ${thought.posterior.probability.toFixed(3)}\n`;
    ascii += `  Calculation: ${thought.posterior.calculation}\n`;

    if (thought.bayesFactor !== undefined) {
      ascii += `\nBayes Factor: ${thought.bayesFactor.toFixed(2)}\n`;
    }

    return ascii;
  }

  // ===== Sequential Dependency Graph Exporters =====

  /**
   * Export sequential dependency graph to visual format
   */
  exportSequentialDependencyGraph(thought: SequentialThought, options: VisualExportOptions): string {
    const { format, colorScheme = 'default', includeLabels = true } = options;

    switch (format) {
      case 'mermaid':
        return this.sequentialToMermaid(thought, colorScheme, includeLabels);
      case 'dot':
        return this.sequentialToDOT(thought, includeLabels);
      case 'ascii':
        return this.sequentialToASCII(thought);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private sequentialToMermaid(
    thought: SequentialThought,
    colorScheme: string,
    includeLabels: boolean
  ): string {
    let mermaid = 'graph TD\n';

    const nodeId = this.sanitizeId(thought.id);
    const label = includeLabels ? thought.content.substring(0, 50) + '...' : nodeId;

    mermaid += `  ${nodeId}["${label}"]\n`;

    // Add dependencies
    if (thought.buildUpon && thought.buildUpon.length > 0) {
      mermaid += '\n';
      for (const depId of thought.buildUpon) {
        const depNodeId = this.sanitizeId(depId);
        mermaid += `  ${depNodeId} --> ${nodeId}\n`;
      }
    }

    // Add branch information
    if (thought.branchFrom) {
      const branchId = this.sanitizeId(thought.branchFrom);
      mermaid += `  ${branchId} -.->|branch| ${nodeId}\n`;
    }

    // Add revision information
    if (thought.revisesThought) {
      const revisedId = this.sanitizeId(thought.revisesThought);
      mermaid += `  ${revisedId} ==>|revises| ${nodeId}\n`;
    }

    // Add styling
    if (colorScheme !== 'monochrome') {
      mermaid += '\n';
      const color = thought.isRevision
        ? (colorScheme === 'pastel' ? '#fff3e0' : '#ffd699')
        : (colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff');
      mermaid += `  style ${nodeId} fill:${color}\n`;
    }

    return mermaid;
  }

  private sequentialToDOT(thought: SequentialThought, includeLabels: boolean): string {
    let dot = 'digraph SequentialDependency {\n';
    dot += '  rankdir=TD;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    const nodeId = this.sanitizeId(thought.id);
    const label = includeLabels ? thought.content.substring(0, 50) + '...' : nodeId;

    dot += `  ${nodeId} [label="${label}"];\n`;

    if (thought.buildUpon && thought.buildUpon.length > 0) {
      for (const depId of thought.buildUpon) {
        const depNodeId = this.sanitizeId(depId);
        dot += `  ${depNodeId} -> ${nodeId};\n`;
      }
    }

    if (thought.branchFrom) {
      const branchId = this.sanitizeId(thought.branchFrom);
      dot += `  ${branchId} -> ${nodeId} [style=dashed, label="branch"];\n`;
    }

    if (thought.revisesThought) {
      const revisedId = this.sanitizeId(thought.revisesThought);
      dot += `  ${revisedId} -> ${nodeId} [style=bold, label="revises"];\n`;
    }

    dot += '}\n';
    return dot;
  }

  private sequentialToASCII(thought: SequentialThought): string {
    let ascii = 'Sequential Dependency Graph:\n';
    ascii += '============================\n\n';

    ascii += `Current Thought: ${thought.id}\n`;
    ascii += `Content: ${thought.content.substring(0, 100)}...\n\n`;

    if (thought.buildUpon && thought.buildUpon.length > 0) {
      ascii += 'Builds Upon:\n';
      for (const depId of thought.buildUpon) {
        ascii += `  ↓ ${depId}\n`;
      }
      ascii += '\n';
    }

    if (thought.branchFrom) {
      ascii += `Branches From: ${thought.branchFrom}\n`;
      if (thought.branchId) {
        ascii += `Branch ID: ${thought.branchId}\n`;
      }
      ascii += '\n';
    }

    if (thought.revisesThought) {
      ascii += `Revises: ${thought.revisesThought}\n`;
      if (thought.revisionReason) {
        ascii += `Reason: ${thought.revisionReason}\n`;
      }
      ascii += '\n';
    }

    return ascii;
  }

  // ===== Shannon Stage Flow Exporters =====

  /**
   * Export Shannon stage flow diagram to visual format
   */
  exportShannonStageFlow(thought: ShannonThought, options: VisualExportOptions): string {
    const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

    switch (format) {
      case 'mermaid':
        return this.shannonToMermaid(thought, colorScheme, includeLabels, includeMetrics);
      case 'dot':
        return this.shannonToDOT(thought, includeLabels, includeMetrics);
      case 'ascii':
        return this.shannonToASCII(thought);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private shannonToMermaid(
    thought: ShannonThought,
    colorScheme: string,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let mermaid = 'graph LR\n';

    const stages = [
      'problem_definition',
      'constraints',
      'model',
      'proof',
      'implementation'
    ];

    const stageLabels: Record<string, string> = {
      problem_definition: 'Problem Definition',
      constraints: 'Constraints',
      model: 'Model',
      proof: 'Proof',
      implementation: 'Implementation'
    };

    // Add all stages
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const stageId = this.sanitizeId(stage);
      const label = includeLabels ? stageLabels[stage] : stageId;

      mermaid += `  ${stageId}["${label}"]\n`;

      // Connect to next stage
      if (i < stages.length - 1) {
        const nextStageId = this.sanitizeId(stages[i + 1]);
        mermaid += `  ${stageId} --> ${nextStageId}\n`;
      }
    }

    // Highlight current stage
    if (colorScheme !== 'monochrome') {
      mermaid += '\n';
      const currentStageId = this.sanitizeId(thought.stage);
      const color = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
      mermaid += `  style ${currentStageId} fill:${color},stroke:#333,stroke-width:3px\n`;
    }

    // Add uncertainty metric
    if (includeMetrics && thought.uncertainty !== undefined) {
      mermaid += `\n  uncertainty["Uncertainty: ${thought.uncertainty.toFixed(2)}"]\n`;
      mermaid += `  uncertainty -.-> ${this.sanitizeId(thought.stage)}\n`;
    }

    return mermaid;
  }

  private shannonToDOT(
    thought: ShannonThought,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let dot = 'digraph ShannonStageFlow {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    const stages = [
      'problem_definition',
      'constraints',
      'model',
      'proof',
      'implementation'
    ];

    const stageLabels: Record<string, string> = {
      problem_definition: 'Problem Definition',
      constraints: 'Constraints',
      model: 'Model',
      proof: 'Proof',
      implementation: 'Implementation'
    };

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const stageId = this.sanitizeId(stage);
      const label = includeLabels ? stageLabels[stage] : stageId;

      const isCurrent = stage === thought.stage;
      const style = isCurrent ? ', style=filled, fillcolor=lightblue' : '';

      dot += `  ${stageId} [label="${label}"${style}];\n`;

      if (i < stages.length - 1) {
        const nextStageId = this.sanitizeId(stages[i + 1]);
        dot += `  ${stageId} -> ${nextStageId};\n`;
      }
    }

    if (includeMetrics && thought.uncertainty !== undefined) {
      dot += `\n  uncertainty [label="Uncertainty: ${thought.uncertainty.toFixed(2)}", shape=ellipse];\n`;
      dot += `  uncertainty -> ${this.sanitizeId(thought.stage)} [style=dashed];\n`;
    }

    dot += '}\n';
    return dot;
  }

  private shannonToASCII(thought: ShannonThought): string {
    let ascii = 'Shannon Stage Flow:\n';
    ascii += '===================\n\n';

    const stages = [
      'problem_definition',
      'constraints',
      'model',
      'proof',
      'implementation'
    ];

    const stageLabels: Record<string, string> = {
      problem_definition: 'Problem Definition',
      constraints: 'Constraints',
      model: 'Model',
      proof: 'Proof',
      implementation: 'Implementation'
    };

    ascii += 'Flow: ';
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const isCurrent = stage === thought.stage;

      if (isCurrent) {
        ascii += `[${stageLabels[stage]}]`;
      } else {
        ascii += stageLabels[stage];
      }

      if (i < stages.length - 1) {
        ascii += ' → ';
      }
    }

    ascii += '\n\n';
    ascii += `Current Stage: ${stageLabels[thought.stage]}\n`;
    ascii += `Uncertainty: ${thought.uncertainty.toFixed(2)}\n`;

    if (thought.dependencies && thought.dependencies.length > 0) {
      ascii += '\nDependencies:\n';
      for (const dep of thought.dependencies) {
        ascii += `  • ${dep}\n`;
      }
    }

    if (thought.assumptions && thought.assumptions.length > 0) {
      ascii += '\nAssumptions:\n';
      for (const assumption of thought.assumptions) {
        ascii += `  • ${assumption}\n`;
      }
    }

    return ascii;
  }

  // ===== Abductive Hypothesis Comparison Exporters =====

  /**
   * Export abductive hypothesis comparison to visual format
   */
  exportAbductiveHypotheses(thought: AbductiveThought, options: VisualExportOptions): string {
    const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

    switch (format) {
      case 'mermaid':
        return this.abductiveToMermaid(thought, colorScheme, includeLabels, includeMetrics);
      case 'dot':
        return this.abductiveToDOT(thought, includeLabels, includeMetrics);
      case 'ascii':
        return this.abductiveToASCII(thought);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private abductiveToMermaid(
    thought: AbductiveThought,
    colorScheme: string,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let mermaid = 'graph TD\n';

    // Add observations node
    mermaid += '  Observations["Observations"]\n';

    // Add hypothesis nodes
    for (const hypothesis of thought.hypotheses) {
      const hypId = this.sanitizeId(hypothesis.id);
      const label = includeLabels ? hypothesis.explanation.substring(0, 50) + '...' : hypId;
      const scoreLabel = includeMetrics ? ` (${hypothesis.score.toFixed(2)})` : '';

      mermaid += `  ${hypId}["${label}${scoreLabel}"]\n`;
      mermaid += `  Observations --> ${hypId}\n`;
    }

    // Highlight best explanation
    if (thought.bestExplanation && colorScheme !== 'monochrome') {
      mermaid += '\n';
      const bestId = this.sanitizeId(thought.bestExplanation.id);
      const color = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
      mermaid += `  style ${bestId} fill:${color},stroke:#333,stroke-width:3px\n`;
    }

    return mermaid;
  }

  private abductiveToDOT(
    thought: AbductiveThought,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let dot = 'digraph AbductiveHypotheses {\n';
    dot += '  rankdir=TD;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    dot += '  Observations [label="Observations", shape=ellipse];\n\n';

    for (const hypothesis of thought.hypotheses) {
      const hypId = this.sanitizeId(hypothesis.id);
      const label = includeLabels ? hypothesis.explanation.substring(0, 50) + '...' : hypId;
      const scoreLabel = includeMetrics ? ` (${hypothesis.score.toFixed(2)})` : '';

      const isBest = thought.bestExplanation?.id === hypothesis.id;
      const style = isBest ? ', style=filled, fillcolor=lightblue' : '';

      dot += `  ${hypId} [label="${label}${scoreLabel}"${style}];\n`;
      dot += `  Observations -> ${hypId};\n`;
    }

    dot += '}\n';
    return dot;
  }

  private abductiveToASCII(thought: AbductiveThought): string {
    let ascii = 'Abductive Hypothesis Comparison:\n';
    ascii += '================================\n\n';

    ascii += 'Observations:\n';
    for (const obs of thought.observations) {
      ascii += `  • ${obs.description} (confidence: ${obs.confidence.toFixed(2)})\n`;
    }

    ascii += '\nHypotheses:\n';
    for (const hypothesis of thought.hypotheses) {
      const isBest = thought.bestExplanation?.id === hypothesis.id;
      const marker = isBest ? '★' : '•';

      ascii += `  ${marker} ${hypothesis.explanation}\n`;
      ascii += `    Score: ${hypothesis.score.toFixed(2)}\n`;
      ascii += `    Assumptions: ${hypothesis.assumptions.join(', ')}\n`;
      ascii += '\n';
    }

    if (thought.bestExplanation) {
      ascii += `Best Explanation: ${thought.bestExplanation.explanation}\n`;
    }

    return ascii;
  }

  // ===== Counterfactual Scenario Tree Exporters =====

  /**
   * Export counterfactual scenario tree to visual format
   */
  exportCounterfactualScenarios(thought: CounterfactualThought, options: VisualExportOptions): string {
    const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

    switch (format) {
      case 'mermaid':
        return this.counterfactualToMermaid(thought, colorScheme, includeLabels, includeMetrics);
      case 'dot':
        return this.counterfactualToDOT(thought, includeLabels, includeMetrics);
      case 'ascii':
        return this.counterfactualToASCII(thought);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private counterfactualToMermaid(
    thought: CounterfactualThought,
    colorScheme: string,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let mermaid = 'graph TD\n';

    // Add intervention point
    const interventionId = 'intervention';
    mermaid += `  ${interventionId}["${thought.interventionPoint.description}"]\n`;

    // Add actual scenario
    const actualId = this.sanitizeId(thought.actual.id);
    const actualLabel = includeLabels ? thought.actual.name : actualId;
    mermaid += `  ${actualId}["Actual: ${actualLabel}"]\n`;
    mermaid += `  ${interventionId} -->|no change| ${actualId}\n`;

    // Add counterfactual scenarios
    for (const scenario of thought.counterfactuals) {
      const scenarioId = this.sanitizeId(scenario.id);
      const label = includeLabels ? scenario.name : scenarioId;
      const likelihoodLabel = includeMetrics && scenario.likelihood
        ? ` (${scenario.likelihood.toFixed(2)})`
        : '';

      mermaid += `  ${scenarioId}["CF: ${label}${likelihoodLabel}"]\n`;
      mermaid += `  ${interventionId} -->|intervene| ${scenarioId}\n`;
    }

    // Add styling
    if (colorScheme !== 'monochrome') {
      mermaid += '\n';
      const actualColor = colorScheme === 'pastel' ? '#fff3e0' : '#ffd699';
      mermaid += `  style ${actualId} fill:${actualColor}\n`;

      const cfColor = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
      for (const scenario of thought.counterfactuals) {
        const scenarioId = this.sanitizeId(scenario.id);
        mermaid += `  style ${scenarioId} fill:${cfColor}\n`;
      }
    }

    return mermaid;
  }

  private counterfactualToDOT(
    thought: CounterfactualThought,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let dot = 'digraph CounterfactualScenarios {\n';
    dot += '  rankdir=TD;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    const interventionId = 'intervention';
    dot += `  ${interventionId} [label="${thought.interventionPoint.description}", shape=diamond];\n\n`;

    const actualId = this.sanitizeId(thought.actual.id);
    const actualLabel = includeLabels ? thought.actual.name : actualId;
    dot += `  ${actualId} [label="Actual: ${actualLabel}", style=filled, fillcolor=lightyellow];\n`;
    dot += `  ${interventionId} -> ${actualId} [label="no change"];\n\n`;

    for (const scenario of thought.counterfactuals) {
      const scenarioId = this.sanitizeId(scenario.id);
      const label = includeLabels ? scenario.name : scenarioId;
      const likelihoodLabel = includeMetrics && scenario.likelihood
        ? ` (${scenario.likelihood.toFixed(2)})`
        : '';

      dot += `  ${scenarioId} [label="CF: ${label}${likelihoodLabel}", style=filled, fillcolor=lightblue];\n`;
      dot += `  ${interventionId} -> ${scenarioId} [label="intervene"];\n`;
    }

    dot += '}\n';
    return dot;
  }

  private counterfactualToASCII(thought: CounterfactualThought): string {
    let ascii = 'Counterfactual Scenario Tree:\n';
    ascii += '=============================\n\n';

    ascii += `Intervention Point: ${thought.interventionPoint.description}\n`;
    ascii += `Timing: ${thought.interventionPoint.timing}\n`;
    ascii += `Feasibility: ${thought.interventionPoint.feasibility.toFixed(2)}\n\n`;

    ascii += '┌─ Actual Scenario:\n';
    ascii += `│  ${thought.actual.name}\n`;
    ascii += `│  ${thought.actual.description}\n\n`;

    ascii += '└─ Counterfactual Scenarios:\n';
    for (const scenario of thought.counterfactuals) {
      const likelihoodStr = scenario.likelihood ? ` (likelihood: ${scenario.likelihood.toFixed(2)})` : '';
      ascii += `   ├─ ${scenario.name}${likelihoodStr}\n`;
      ascii += `   │  ${scenario.description}\n`;
    }

    return ascii;
  }

  // ===== Analogical Domain Mapping Exporters =====

  /**
   * Export analogical domain mapping to visual format
   */
  exportAnalogicalMapping(thought: AnalogicalThought, options: VisualExportOptions): string {
    const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

    switch (format) {
      case 'mermaid':
        return this.analogicalToMermaid(thought, colorScheme, includeLabels, includeMetrics);
      case 'dot':
        return this.analogicalToDOT(thought, includeLabels, includeMetrics);
      case 'ascii':
        return this.analogicalToASCII(thought);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private analogicalToMermaid(
    thought: AnalogicalThought,
    colorScheme: string,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let mermaid = 'graph LR\n';

    // Add source domain entities
    mermaid += '  subgraph Source["Source Domain"]\n';
    for (const entity of thought.sourceDomain.entities) {
      const entityId = this.sanitizeId('src_' + entity.id);
      const label = includeLabels ? entity.name : entityId;
      mermaid += `    ${entityId}["${label}"]\n`;
    }
    mermaid += '  end\n\n';

    // Add target domain entities
    mermaid += '  subgraph Target["Target Domain"]\n';
    for (const entity of thought.targetDomain.entities) {
      const entityId = this.sanitizeId('tgt_' + entity.id);
      const label = includeLabels ? entity.name : entityId;
      mermaid += `    ${entityId}["${label}"]\n`;
    }
    mermaid += '  end\n\n';

    // Add mappings
    for (const mapping of thought.mapping) {
      const srcId = this.sanitizeId('src_' + mapping.sourceEntityId);
      const tgtId = this.sanitizeId('tgt_' + mapping.targetEntityId);
      const confidenceLabel = includeMetrics ? `|${mapping.confidence.toFixed(2)}|` : '';

      mermaid += `  ${srcId} -.->${confidenceLabel} ${tgtId}\n`;
    }

    // Add styling
    if (colorScheme !== 'monochrome') {
      mermaid += '\n';
      const srcColor = colorScheme === 'pastel' ? '#fff3e0' : '#ffd699';
      const tgtColor = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';

      for (const entity of thought.sourceDomain.entities) {
        const entityId = this.sanitizeId('src_' + entity.id);
        mermaid += `  style ${entityId} fill:${srcColor}\n`;
      }

      for (const entity of thought.targetDomain.entities) {
        const entityId = this.sanitizeId('tgt_' + entity.id);
        mermaid += `  style ${tgtId} fill:${tgtColor}\n`;
      }
    }

    return mermaid;
  }

  private analogicalToDOT(
    thought: AnalogicalThought,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let dot = 'digraph AnalogicalMapping {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    // Source domain cluster
    dot += '  subgraph cluster_source {\n';
    dot += '    label="Source Domain";\n';
    dot += '    style=filled;\n';
    dot += '    fillcolor=lightyellow;\n\n';

    for (const entity of thought.sourceDomain.entities) {
      const entityId = this.sanitizeId('src_' + entity.id);
      const label = includeLabels ? entity.name : entityId;
      dot += `    ${entityId} [label="${label}"];\n`;
    }

    dot += '  }\n\n';

    // Target domain cluster
    dot += '  subgraph cluster_target {\n';
    dot += '    label="Target Domain";\n';
    dot += '    style=filled;\n';
    dot += '    fillcolor=lightblue;\n\n';

    for (const entity of thought.targetDomain.entities) {
      const entityId = this.sanitizeId('tgt_' + entity.id);
      const label = includeLabels ? entity.name : entityId;
      dot += `    ${entityId} [label="${label}"];\n`;
    }

    dot += '  }\n\n';

    // Add mappings
    for (const mapping of thought.mapping) {
      const srcId = this.sanitizeId('src_' + mapping.sourceEntityId);
      const tgtId = this.sanitizeId('tgt_' + mapping.targetEntityId);
      const confidenceLabel = includeMetrics ? `, label="${mapping.confidence.toFixed(2)}"` : '';

      dot += `  ${srcId} -> ${tgtId} [style=dashed${confidenceLabel}];\n`;
    }

    dot += '}\n';
    return dot;
  }

  private analogicalToASCII(thought: AnalogicalThought): string {
    let ascii = 'Analogical Domain Mapping:\n';
    ascii += '==========================\n\n';

    ascii += `Source Domain: ${thought.sourceDomain.name}\n`;
    ascii += `${thought.sourceDomain.description}\n\n`;

    ascii += `Target Domain: ${thought.targetDomain.name}\n`;
    ascii += `${thought.targetDomain.description}\n\n`;

    ascii += 'Mappings:\n';
    for (const mapping of thought.mapping) {
      const srcEntity = thought.sourceDomain.entities.find(e => e.id === mapping.sourceEntityId);
      const tgtEntity = thought.targetDomain.entities.find(e => e.id === mapping.targetEntityId);

      if (srcEntity && tgtEntity) {
        ascii += `  ${srcEntity.name} ←→ ${tgtEntity.name} (confidence: ${mapping.confidence.toFixed(2)})\n`;
        ascii += `    ${mapping.justification}\n`;
      }
    }

    ascii += `\nAnalogy Strength: ${thought.analogyStrength.toFixed(2)}\n`;

    return ascii;
  }

  // ===== Evidential Belief Visualization Exporters =====

  /**
   * Export evidential belief visualization to visual format
   */
  exportEvidentialBeliefs(thought: EvidentialThought, options: VisualExportOptions): string {
    const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

    switch (format) {
      case 'mermaid':
        return this.evidentialToMermaid(thought, colorScheme, includeLabels, includeMetrics);
      case 'dot':
        return this.evidentialToDOT(thought, includeLabels, includeMetrics);
      case 'ascii':
        return this.evidentialToASCII(thought);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private evidentialToMermaid(
    thought: EvidentialThought,
    colorScheme: string,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let mermaid = 'graph TD\n';

    // Add frame of discernment
    mermaid += '  Frame["Frame of Discernment"]\n';

    // Add hypotheses
    for (const hypothesis of thought.frameOfDiscernment) {
      const hypId = this.sanitizeId(hypothesis);
      const label = includeLabels ? hypothesis : hypId;

      mermaid += `  ${hypId}["${label}"]\n`;
      mermaid += `  Frame --> ${hypId}\n`;
    }

    // Add mass assignments
    if (includeMetrics && thought.massAssignments && thought.massAssignments.length > 0) {
      mermaid += '\n';
      for (const mass of thought.massAssignments) {
        const massId = this.sanitizeId(mass.subset.join('_'));
        const label = `{${mass.subset.join(', ')}}`;
        mermaid += `  ${massId}["${label}: ${mass.mass.toFixed(3)}"]\n`;
      }
    }

    // Add styling
    if (colorScheme !== 'monochrome') {
      mermaid += '\n';
      const color = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
      for (const hypothesis of thought.frameOfDiscernment) {
        const hypId = this.sanitizeId(hypothesis);
        mermaid += `  style ${hypId} fill:${color}\n`;
      }
    }

    return mermaid;
  }

  private evidentialToDOT(
    thought: EvidentialThought,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let dot = 'digraph EvidentialBeliefs {\n';
    dot += '  rankdir=TD;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    dot += '  Frame [label="Frame of Discernment", shape=ellipse];\n\n';

    for (const hypothesis of thought.frameOfDiscernment) {
      const hypId = this.sanitizeId(hypothesis);
      const label = includeLabels ? hypothesis : hypId;

      dot += `  ${hypId} [label="${label}"];\n`;
      dot += `  Frame -> ${hypId};\n`;
    }

    if (includeMetrics && thought.massAssignments && thought.massAssignments.length > 0) {
      dot += '\n';
      for (const mass of thought.massAssignments) {
        const massId = this.sanitizeId(mass.subset.join('_'));
        const label = `{${mass.subset.join(', ')}}: ${mass.mass.toFixed(3)}`;
        dot += `  ${massId} [label="${label}", shape=note];\n`;
      }
    }

    dot += '}\n';
    return dot;
  }

  private evidentialToASCII(thought: EvidentialThought): string {
    let ascii = 'Evidential Belief Visualization:\n';
    ascii += '================================\n\n';

    ascii += 'Frame of Discernment:\n';
    ascii += `  {${thought.frameOfDiscernment.join(', ')}}\n\n`;

    if (thought.massAssignments && thought.massAssignments.length > 0) {
      ascii += 'Mass Assignments:\n';
      for (const mass of thought.massAssignments) {
        ascii += `  m({${mass.subset.join(', ')}}) = ${mass.mass.toFixed(3)}\n`;
      }
      ascii += '\n';
    }

    if (thought.beliefFunction) {
      ascii += `Belief: ${thought.beliefFunction.toFixed(3)}\n`;
    }

    if (thought.plausibilityFunction) {
      ascii += `Plausibility: ${thought.plausibilityFunction.toFixed(3)}\n`;
    }

    return ascii;
  }

  // ===== Utility Methods =====

  /**
   * Sanitize ID for use in diagram formats
   */
  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
  }
}
