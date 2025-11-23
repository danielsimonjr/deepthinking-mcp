/**
 * Visual Export Module (v3.2.0)
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
  EvidentialThought,
  FirstPrinciplesThought,
  SystemsThinkingThought,
  ScientificMethodThought,
  OptimizationThought,
  FormalLogicThought
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
        const _entityId = this.sanitizeId('tgt_' + entity.id);
        mermaid += `  style ${_entityId} fill:${tgtColor}\n`;
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
    if (includeMetrics && (thought as any).massAssignments && (thought as any).massAssignments.length > 0) {
      mermaid += '\n';
      for (const mass of (thought as any).massAssignments) {
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

    if (includeMetrics && (thought as any).massAssignments && (thought as any).massAssignments.length > 0) {
      dot += '\n';
      for (const mass of (thought as any).massAssignments) {
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

    if ((thought as any).massAssignments && (thought as any).massAssignments.length > 0) {
      ascii += 'Mass Assignments:\n';
      for (const mass of (thought as any).massAssignments) {
        ascii += `  m({${mass.subset.join(', ')}}) = ${mass.mass.toFixed(3)}\n`;
      }
      ascii += '\n';
    }

    if (thought.beliefFunctions) {
      ascii += `Belief: ${thought.beliefFunctions.toFixed(3)}\n`;
    }

    if ((thought as any).plausibilityFunction) {
      ascii += `Plausibility: ${(thought as any).plausibilityFunction.toFixed(3)}\n`;
    }

    return ascii;
  }

  /**
   * Export first-principles derivation chain to visual format
   */
  exportFirstPrinciplesDerivation(thought: FirstPrinciplesThought, options: VisualExportOptions): string {
    const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

    switch (format) {
      case 'mermaid':
        return this.firstPrinciplesToMermaid(thought, colorScheme, includeLabels, includeMetrics);
      case 'dot':
        return this.firstPrinciplesToDOT(thought, includeLabels, includeMetrics);
      case 'ascii':
        return this.firstPrinciplesToASCII(thought);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private firstPrinciplesToMermaid(
    thought: FirstPrinciplesThought,
    colorScheme: string,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let mermaid = 'graph TD\n';

    // Add question node at the top
    mermaid += `  Q["Question: ${thought.question}"]\n`;
    mermaid += '\n';

    // Add principle nodes
    for (const principle of thought.principles) {
      const principleId = this.sanitizeId(principle.id);
      const label = includeLabels
        ? `${principle.type.toUpperCase()}: ${principle.statement.substring(0, 50)}...`
        : principleId;

      // Different shapes for different principle types
      let shape: [string, string];
      switch (principle.type) {
        case 'axiom':
          shape = ['([', '])'];  // Stadium shape for axioms
          break;
        case 'definition':
          shape = ['[[', ']]'];  // Subroutine shape for definitions
          break;
        case 'observation':
          shape = ['[(', ')]'];  // Cylindrical shape for observations
          break;
        case 'logical_inference':
          shape = ['[', ']'];    // Rectangle for inferences
          break;
        case 'assumption':
          shape = ['{', '}'];    // Diamond for assumptions
          break;
        default:
          shape = ['[', ']'];
      }

      mermaid += `  ${principleId}${shape[0]}${label}${shape[1]}\n`;

      // Add dependency edges
      if (principle.dependsOn) {
        for (const depId of principle.dependsOn) {
          const sanitizedDepId = this.sanitizeId(depId);
          mermaid += `  ${sanitizedDepId} --> ${principleId}\n`;
        }
      }
    }

    mermaid += '\n';

    // Add derivation step nodes
    for (const step of thought.derivationSteps) {
      const stepId = `Step${step.stepNumber}`;
      const principleId = this.sanitizeId(step.principle);
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

    // Add conclusion node
    const conclusionLabel = includeLabels
      ? `Conclusion: ${thought.conclusion.statement.substring(0, 50)}...`
      : 'Conclusion';
    mermaid += `  C["${conclusionLabel}"]\n`;

    // Connect relevant steps to conclusion
    for (const stepNum of thought.conclusion.derivationChain) {
      mermaid += `  Step${stepNum} --> C\n`;
    }

    if (includeMetrics) {
      mermaid += `  C -.->|certainty: ${thought.conclusion.certainty.toFixed(2)}| C\n`;
    }

    // Add styling based on color scheme
    if (colorScheme !== 'monochrome') {
      mermaid += '\n';

      // Color principles by type
      const axiomColor = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
      const definitionColor = colorScheme === 'pastel' ? '#f3e5f5' : '#ce93d8';
      const observationColor = colorScheme === 'pastel' ? '#fff3e0' : '#ffd699';
      const inferenceColor = colorScheme === 'pastel' ? '#e8f5e9' : '#a5d6a7';
      const assumptionColor = colorScheme === 'pastel' ? '#ffebee' : '#ef9a9a';

      for (const principle of thought.principles) {
        const principleId = this.sanitizeId(principle.id);
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

      // Color conclusion
      const conclusionColor = colorScheme === 'pastel' ? '#c8e6c9' : '#66bb6a';
      mermaid += `  style C fill:${conclusionColor}\n`;
    }

    return mermaid;
  }

  private firstPrinciplesToDOT(
    thought: FirstPrinciplesThought,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let dot = 'digraph FirstPrinciples {\n';
    dot += '  rankdir=TD;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    // Add question node
    dot += `  Q [label="Question:\\n${thought.question}", shape=ellipse, style=bold];\n\n`;

    // Add principle nodes
    for (const principle of thought.principles) {
      const principleId = this.sanitizeId(principle.id);
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

      // Add dependency edges
      if (principle.dependsOn) {
        for (const depId of principle.dependsOn) {
          const sanitizedDepId = this.sanitizeId(depId);
          dot += `  ${sanitizedDepId} -> ${principleId};\n`;
        }
      }
    }

    dot += '\n';

    // Add derivation step nodes
    for (const step of thought.derivationSteps) {
      const stepId = `Step${step.stepNumber}`;
      const principleId = this.sanitizeId(step.principle);
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

    // Add conclusion node
    const conclusionLabel = includeLabels
      ? `Conclusion:\\n${thought.conclusion.statement.substring(0, 60)}...`
      : 'Conclusion';
    const certaintyLabel = includeMetrics
      ? `\\ncertainty: ${thought.conclusion.certainty.toFixed(2)}`
      : '';
    dot += `  C [label="${conclusionLabel}${certaintyLabel}", shape=doubleoctagon, style=bold];\n`;

    // Connect relevant steps to conclusion
    for (const stepNum of thought.conclusion.derivationChain) {
      dot += `  Step${stepNum} -> C;\n`;
    }

    dot += '}\n';
    return dot;
  }

  private firstPrinciplesToASCII(thought: FirstPrinciplesThought): string {
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

  // ===== Systems Thinking Causal Loop Exporters =====

  /**
   * Export systems thinking causal loop diagram to visual format
   */
  exportSystemsThinkingCausalLoops(thought: SystemsThinkingThought, options: VisualExportOptions): string {
    const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

    switch (format) {
      case 'mermaid':
        return this.systemsThinkingToMermaid(thought, colorScheme, includeLabels, includeMetrics);
      case 'dot':
        return this.systemsThinkingToDOT(thought, includeLabels, includeMetrics);
      case 'ascii':
        return this.systemsThinkingToASCII(thought);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private systemsThinkingToMermaid(
    thought: SystemsThinkingThought,
    colorScheme: string,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let mermaid = 'graph TB\n';

    // Add system node
    if (thought.system) {
      mermaid += `  System["${thought.system.name}"]\n\n`;
    }

    // Add component nodes
    if (thought.components && thought.components.length > 0) {
      for (const component of thought.components) {
        const compId = this.sanitizeId(component.id);
        const label = includeLabels ? component.name : compId;

        // Different shapes for stocks vs flows
        const shape = component.type === 'stock' ? ['[[', ']]'] : ['[', ']'];
        mermaid += `  ${compId}${shape[0]}${label}${shape[1]}\n`;
      }
      mermaid += '\n';
    }

    // Add feedback loops
    if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
      for (const loop of thought.feedbackLoops) {
        const loopComponents = loop.components;

        for (let i = 0; i < loopComponents.length; i++) {
          const fromId = this.sanitizeId(loopComponents[i]);
          const toId = this.sanitizeId(loopComponents[(i + 1) % loopComponents.length]);

          const edgeLabel = includeMetrics
            ? `|${loop.type} (${loop.strength.toFixed(2)})| `
            : `|${loop.type}| `;

          const edgeStyle = loop.type === 'reinforcing' ? '-->' : '-..->';
          mermaid += `  ${fromId} ${edgeStyle}${edgeLabel}${toId}\n`;
        }
      }
      mermaid += '\n';
    }

    // Add styling based on color scheme
    if (colorScheme !== 'monochrome' && thought.components) {
      const stockColor = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
      const flowColor = colorScheme === 'pastel' ? '#fff3e0' : '#ffd699';

      for (const component of thought.components) {
        const compId = this.sanitizeId(component.id);
        const color = component.type === 'stock' ? stockColor : flowColor;
        mermaid += `  style ${compId} fill:${color}\n`;
      }
    }

    return mermaid;
  }

  private systemsThinkingToDOT(
    thought: SystemsThinkingThought,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let dot = 'digraph SystemsThinking {\n';
    dot += '  rankdir=TB;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    // Add components
    if (thought.components && thought.components.length > 0) {
      for (const component of thought.components) {
        const compId = this.sanitizeId(component.id);
        const label = includeLabels ? component.name : compId;
        const shape = component.type === 'stock' ? 'box' : 'ellipse';

        dot += `  ${compId} [label="${label}", shape=${shape}];\n`;
      }
      dot += '\n';
    }

    // Add feedback loops
    if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
      for (const loop of thought.feedbackLoops) {
        const loopComponents = loop.components;

        for (let i = 0; i < loopComponents.length; i++) {
          const fromId = this.sanitizeId(loopComponents[i]);
          const toId = this.sanitizeId(loopComponents[(i + 1) % loopComponents.length]);

          const edgeLabel = includeMetrics
            ? `, label="${loop.type} (${loop.strength.toFixed(2)})"`
            : `, label="${loop.type}"`;

          const edgeStyle = loop.type === 'reinforcing' ? 'solid' : 'dashed';
          dot += `  ${fromId} -> ${toId} [style=${edgeStyle}${edgeLabel}];\n`;
        }
      }
    }

    dot += '}\n';
    return dot;
  }

  private systemsThinkingToASCII(thought: SystemsThinkingThought): string {
    let ascii = 'Systems Thinking Model:\n';
    ascii += '======================\n\n';

    if (thought.system) {
      ascii += `System: ${thought.system.name}\n`;
      ascii += `${thought.system.description}\n\n`;
    }

    if (thought.components && thought.components.length > 0) {
      ascii += 'Components:\n';
      for (const component of thought.components) {
        const typeIcon = component.type === 'stock' ? '[■]' : '(○)';
        ascii += `  ${typeIcon} ${component.name}: ${component.description}\n`;
      }
      ascii += '\n';
    }

    if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
      ascii += 'Feedback Loops:\n';
      for (const loop of thought.feedbackLoops) {
        const loopIcon = loop.type === 'reinforcing' ? '⊕' : '⊖';
        ascii += `  ${loopIcon} ${loop.name} (${loop.type})\n`;
        ascii += `    Strength: ${loop.strength.toFixed(2)}\n`;
        ascii += `    Components: ${loop.components.join(' → ')}\n`;
      }
      ascii += '\n';
    }

    if (thought.leveragePoints && thought.leveragePoints.length > 0) {
      ascii += 'Leverage Points:\n';
      for (const point of thought.leveragePoints) {
        ascii += `  ★ ${point.location} (effectiveness: ${point.effectiveness.toFixed(2)})\n`;
        ascii += `    ${point.description}\n`;
      }
    }

    return ascii;
  }

  // ===== Scientific Method Experiment Exporters =====

  /**
   * Export scientific method experiment flow to visual format
   */
  exportScientificMethodExperiment(thought: ScientificMethodThought, options: VisualExportOptions): string {
    const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

    switch (format) {
      case 'mermaid':
        return this.scientificMethodToMermaid(thought, colorScheme, includeLabels, includeMetrics);
      case 'dot':
        return this.scientificMethodToDOT(thought, includeLabels, includeMetrics);
      case 'ascii':
        return this.scientificMethodToASCII(thought);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private scientificMethodToMermaid(
    thought: ScientificMethodThought,
    colorScheme: string,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let mermaid = 'graph TD\n';

    // Research question
    if (thought.researchQuestion) {
      mermaid += `  RQ["Research Question: ${thought.researchQuestion.question.substring(0, 60)}..."]\n`;
      mermaid += '\n';
    }

    // Hypotheses
    if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
      for (const hypothesis of thought.scientificHypotheses) {
        const hypId = this.sanitizeId(hypothesis.id);
        const label = includeLabels ? hypothesis.statement.substring(0, 50) + '...' : hypId;
        mermaid += `  ${hypId}["H: ${label}"]\n`;
        if (thought.researchQuestion) {
          mermaid += `  RQ --> ${hypId}\n`;
        }
      }
      mermaid += '\n';
    }

    // Experiment
    if (thought.experiment) {
      mermaid += `  Exp["Experiment: ${thought.experiment.design}"]\n`;
      if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
        for (const hypothesis of thought.scientificHypotheses) {
          const hypId = this.sanitizeId(hypothesis.id);
          mermaid += `  ${hypId} --> Exp\n`;
        }
      }
      mermaid += '\n';
    }

    // Data collection
    if (thought.data) {
      mermaid += `  Data["Data Collection: ${(thought.experiment as any)?.sampleSize || 0} samples"]\n`;
      if (thought.experiment) {
        mermaid += `  Exp --> Data\n`;
      }
      mermaid += '\n';
    }

    // Statistical analysis
    if (thought.analysis) {
      mermaid += `  Stats["Statistical Analysis"]\n`;
      if (thought.data) {
        mermaid += `  Data --> Stats\n`;
      }
      mermaid += '\n';
    }

    // Conclusion
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

    // Add styling
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
          const hypId = this.sanitizeId(hypothesis.id);
          mermaid += `  style ${hypId} fill:${hypothesisColor}\n`;
        }
      }
      if (thought.conclusion) {
        mermaid += `  style Conclusion fill:${conclusionColor}\n`;
      }
    }

    return mermaid;
  }

  private scientificMethodToDOT(
    thought: ScientificMethodThought,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let dot = 'digraph ScientificMethod {\n';
    dot += '  rankdir=TD;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    // Research question
    if (thought.researchQuestion) {
      const label = includeLabels ? thought.researchQuestion.question.substring(0, 60) + '...' : 'RQ';
      dot += `  RQ [label="Research Question:\\n${label}", shape=ellipse];\n\n`;
    }

    // Hypotheses
    if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
      for (const hypothesis of thought.scientificHypotheses) {
        const hypId = this.sanitizeId(hypothesis.id);
        const label = includeLabels ? hypothesis.statement.substring(0, 50) + '...' : hypId;
        dot += `  ${hypId} [label="Hypothesis:\\n${label}"];\n`;
        if (thought.researchQuestion) {
          dot += `  RQ -> ${hypId};\n`;
        }
      }
      dot += '\n';
    }

    // Experiment
    if (thought.experiment) {
      const label = includeLabels ? thought.experiment.design : 'Exp';
      dot += `  Exp [label="Experiment:\\n${label}"];\n`;
      if (thought.scientificHypotheses) {
        for (const hypothesis of thought.scientificHypotheses) {
          const hypId = this.sanitizeId(hypothesis.id);
          dot += `  ${hypId} -> Exp;\n`;
        }
      }
      dot += '\n';
    }

    // Data and analysis
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

    // Conclusion
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

  private scientificMethodToASCII(thought: ScientificMethodThought): string {
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
      ascii += `Support for hypothesis: ${thought.conclusion.supportForHypothesis}\n`;
      if (thought.conclusion.confidence) {
        ascii += `Confidence: ${thought.conclusion.confidence.toFixed(2)}\n`;
      }
    }

    return ascii;
  }

  // ===== Optimization Constraint Graph Exporters =====

  /**
   * Export optimization problem constraint graph to visual format
   */
  exportOptimizationSolution(thought: OptimizationThought, options: VisualExportOptions): string {
    const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

    switch (format) {
      case 'mermaid':
        return this.optimizationToMermaid(thought, colorScheme, includeLabels, includeMetrics);
      case 'dot':
        return this.optimizationToDOT(thought, includeLabels, includeMetrics);
      case 'ascii':
        return this.optimizationToASCII(thought);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private optimizationToMermaid(
    thought: OptimizationThought,
    colorScheme: string,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let mermaid = 'graph TD\n';

    // Problem definition
    if (thought.problem) {
      const problemLabel = includeLabels
        ? `Problem: ${thought.problem.name}`
        : 'Problem';
      mermaid += `  Problem["${problemLabel}"]\n\n`;
    }

    // Decision variables
    if (thought.variables && thought.variables.length > 0) {
      mermaid += '  subgraph Variables["Decision Variables"]\n';
      for (const variable of thought.variables) {
        const varId = this.sanitizeId(variable.id);
        const label = includeLabels ? variable.name : varId;
        const domainLabel = includeMetrics && variable.domain
          ? ` [${(variable.domain as any).lowerBound},${(variable.domain as any).upperBound}]`
          : '';
        mermaid += `    ${varId}["${label}${domainLabel}"]\n`;
      }
      mermaid += '  end\n\n';
    }

    // Constraints
    if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
      mermaid += '  subgraph Constraints["Constraints"]\n';
      for (const constraint of thought.optimizationConstraints) {
        const constId = this.sanitizeId(constraint.id);
        const label = includeLabels ? constraint.name : constId;
        mermaid += `    ${constId}["${label}"]\n`;
      }
      mermaid += '  end\n\n';
    }

    // Objectives
    if (thought.objectives && thought.objectives.length > 0) {
      for (const objective of thought.objectives) {
        const objId = this.sanitizeId(objective.id);
        const label = includeLabels
          ? `${objective.type}: ${objective.name}`
          : objId;
        mermaid += `  ${objId}["${label}"]\n`;
      }
      mermaid += '\n';
    }

    // Solution
    if (thought.solution) {
      const qualityLabel = includeMetrics && thought.solution.quality
        ? ` (quality: ${thought.solution.quality.toFixed(2)})`
        : '';
      mermaid += `  Solution["Solution${qualityLabel}"]\n`;
      if (thought.objectives) {
        for (const objective of thought.objectives) {
          const objId = this.sanitizeId(objective.id);
          mermaid += `  ${objId} --> Solution\n`;
        }
      }
    }

    // Add styling
    if (colorScheme !== 'monochrome') {
      mermaid += '\n';
      const solutionColor = colorScheme === 'pastel' ? '#e8f5e9' : '#a5d6a7';
      if (thought.solution) {
        mermaid += `  style Solution fill:${solutionColor}\n`;
      }
    }

    return mermaid;
  }

  private optimizationToDOT(
    thought: OptimizationThought,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let dot = 'digraph Optimization {\n';
    dot += '  rankdir=TD;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    // Problem
    if (thought.problem) {
      const label = includeLabels ? thought.problem.name : 'Problem';
      dot += `  Problem [label="Problem:\\n${label}", shape=ellipse];\n\n`;
    }

    // Variables
    if (thought.variables && thought.variables.length > 0) {
      dot += '  subgraph cluster_variables {\n';
      dot += '    label="Decision Variables";\n';
      for (const variable of thought.variables) {
        const varId = this.sanitizeId(variable.id);
        const label = includeLabels ? variable.name : varId;
        const domainLabel = includeMetrics && variable.domain
          ? `\\n[${(variable.domain as any).lowerBound}, ${(variable.domain as any).upperBound}]`
          : '';
        dot += `    ${varId} [label="${label}${domainLabel}"];\n`;
      }
      dot += '  }\n\n';
    }

    // Constraints
    if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
      dot += '  subgraph cluster_constraints {\n';
      dot += '    label="Constraints";\n';
      for (const constraint of thought.optimizationConstraints) {
        const constId = this.sanitizeId(constraint.id);
        const label = includeLabels ? constraint.name : constId;
        dot += `    ${constId} [label="${label}", shape=diamond];\n`;
      }
      dot += '  }\n\n';
    }

    // Objectives and solution
    if (thought.objectives) {
      for (const objective of thought.objectives) {
        const objId = this.sanitizeId(objective.id);
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
          const objId = this.sanitizeId(objective.id);
          dot += `  ${objId} -> Solution;\n`;
        }
      }
    }

    dot += '}\n';
    return dot;
  }

  private optimizationToASCII(thought: OptimizationThought): string {
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
        ascii += `  ${variable.name} (${variable.variableType})\n`;
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
      ascii += `  Status: ${thought.solution.status}\n`;
      if (thought.solution.optimalValue !== undefined) {
        ascii += `  Optimal Value: ${thought.solution.optimalValue}\n`;
      }
      if (thought.solution.quality !== undefined) {
        ascii += `  Quality: ${thought.solution.quality.toFixed(2)}\n`;
      }
      if (thought.solution.assignments) {
        ascii += '  Assignments:\n';
        for (const [varId, value] of Object.entries(thought.solution.assignments)) {
          ascii += `    ${varId} = ${value}\n`;
        }
      }
    }

    return ascii;
  }

  // ===== Formal Logic Proof Tree Exporters =====

  /**
   * Export formal logic proof tree to visual format
   */
  exportFormalLogicProof(thought: FormalLogicThought, options: VisualExportOptions): string {
    const { format, colorScheme = 'default', includeLabels = true, includeMetrics = true } = options;

    switch (format) {
      case 'mermaid':
        return this.formalLogicToMermaid(thought, colorScheme, includeLabels, includeMetrics);
      case 'dot':
        return this.formalLogicToDOT(thought, includeLabels, includeMetrics);
      case 'ascii':
        return this.formalLogicToASCII(thought);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private formalLogicToMermaid(
    thought: FormalLogicThought,
    colorScheme: string,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let mermaid = 'graph TD\n';

    // Add propositions
    if (thought.propositions && thought.propositions.length > 0) {
      mermaid += '  subgraph Propositions["Propositions"]\n';
      for (const proposition of thought.propositions) {
        const propId = this.sanitizeId(proposition.id);
        const label = includeLabels
          ? `${proposition.symbol}: ${proposition.statement.substring(0, 40)}...`
          : proposition.symbol;
        const shape = proposition.type === 'atomic' ? ['[', ']'] : ['[[', ']]'];
        mermaid += `    ${propId}${shape[0]}${label}${shape[1]}\n`;
      }
      mermaid += '  end\n\n';
    }

    // Add proof steps if available
    if (thought.proof && thought.proof.steps && thought.proof.steps.length > 0) {
      mermaid += '  Theorem["Theorem"]\n';

      for (const step of thought.proof.steps) {
        const stepId = `Step${step.stepNumber}`;
        const label = includeLabels
          ? `${step.stepNumber}. ${step.statement.substring(0, 40)}...`
          : `Step ${step.stepNumber}`;

        mermaid += `  ${stepId}["${label}"]\n`;

        // Connect referenced steps
        if (step.referencesSteps && step.referencesSteps.length > 0) {
          for (const refStep of step.referencesSteps) {
            mermaid += `  Step${refStep} --> ${stepId}\n`;
          }
        }
      }

      // Connect last step to theorem
      const lastStep = thought.proof.steps[thought.proof.steps.length - 1];
      mermaid += `  Step${lastStep.stepNumber} --> Theorem\n`;

      // Add completeness metric
      if (includeMetrics) {
        const completeness = (thought.proof.completeness * 100).toFixed(0);
        mermaid += `\n  Completeness["Completeness: ${completeness}%"]\n`;
        mermaid += `  Completeness -.-> Theorem\n`;
      }
    }

    // Add inferences
    if (thought.logicalInferences && thought.logicalInferences.length > 0) {
      mermaid += '\n';
      for (const inference of thought.logicalInferences) {
        const infId = this.sanitizeId(inference.id);
        const label = includeLabels ? inference.rule : infId;

        mermaid += `  ${infId}{{"${label}"}}\n`;

        // Connect premises to inference
        if (inference.premises) {
          for (const premiseId of inference.premises) {
            const propId = this.sanitizeId(premiseId);
            mermaid += `  ${propId} --> ${infId}\n`;
          }
        }

        // Connect inference to conclusion
        const conclusionId = this.sanitizeId(inference.conclusion);
        mermaid += `  ${infId} --> ${conclusionId}\n`;
      }
    }

    // Add styling
    if (colorScheme !== 'monochrome') {
      mermaid += '\n';
      const atomicColor = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
      const compoundColor = colorScheme === 'pastel' ? '#fff3e0' : '#ffd699';

      if (thought.propositions) {
        for (const proposition of thought.propositions) {
          const propId = this.sanitizeId(proposition.id);
          const color = proposition.type === 'atomic' ? atomicColor : compoundColor;
          mermaid += `  style ${propId} fill:${color}\n`;
        }
      }
    }

    return mermaid;
  }

  private formalLogicToDOT(
    thought: FormalLogicThought,
    includeLabels: boolean,
    includeMetrics: boolean
  ): string {
    let dot = 'digraph FormalLogic {\n';
    dot += '  rankdir=TD;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    // Add propositions
    if (thought.propositions && thought.propositions.length > 0) {
      dot += '  subgraph cluster_propositions {\n';
      dot += '    label="Propositions";\n';
      for (const proposition of thought.propositions) {
        const propId = this.sanitizeId(proposition.id);
        const label = includeLabels
          ? `${proposition.symbol}:\\n${proposition.statement.substring(0, 40)}...`
          : proposition.symbol;
        const shape = proposition.type === 'atomic' ? 'ellipse' : 'box';
        dot += `    ${propId} [label="${label}", shape=${shape}];\n`;
      }
      dot += '  }\n\n';
    }

    // Add proof steps
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

    // Add inferences
    if (thought.logicalInferences && thought.logicalInferences.length > 0) {
      dot += '\n';
      for (const inference of thought.logicalInferences) {
        const infId = this.sanitizeId(inference.id);
        const label = includeLabels ? inference.rule : infId;

        dot += `  ${infId} [label="${label}", shape=diamond];\n`;

        if (inference.premises) {
          for (const premiseId of inference.premises) {
            const propId = this.sanitizeId(premiseId);
            dot += `  ${propId} -> ${infId};\n`;
          }
        }

        const conclusionId = this.sanitizeId(inference.conclusion);
        dot += `  ${infId} -> ${conclusionId};\n`;
      }
    }

    dot += '}\n';
    return dot;
  }

  private formalLogicToASCII(thought: FormalLogicThought): string {
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

  // ===== Utility Methods =====

  /**
   * Sanitize ID for use in diagram formats
   */
  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
  }
}
