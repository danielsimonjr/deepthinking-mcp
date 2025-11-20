/**
 * Visual Export Module (v2.5)
 * Exports thinking sessions to visual formats: Mermaid, DOT, ASCII
 */

import type { CausalThought, TemporalThought, GameTheoryThought, BayesianThought, FirstPrincipleThought, BaseThought } from '../types/index.js';

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

  // ===== Utility Methods =====

  /**
   * Sanitize ID for use in diagram formats
   */
  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  // ===== Generic Thought Sequence Export =====

  /**
   * Export any thought sequence as a flow diagram
   * Works for sequential, shannon, mathematics, physics, hybrid, abductive,
   * counterfactual, analogical, and evidential modes
   */
  exportThoughtSequence(thoughts: BaseThought[], options: VisualExportOptions): string {
    const { format, colorScheme = 'default' } = options;

    switch (format) {
      case 'mermaid':
        return this.thoughtSequenceToMermaid(thoughts, colorScheme);
      case 'dot':
        return this.thoughtSequenceToDOT(thoughts);
      case 'ascii':
        return this.thoughtSequenceToASCII(thoughts);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private thoughtSequenceToMermaid(thoughts: BaseThought[], colorScheme: string): string {
    let mermaid = 'graph TD\n';

    for (let i = 0; i < thoughts.length; i++) {
      const thought = thoughts[i];
      const nodeId = `T${i + 1}`;
      const content = thought.content.substring(0, 60).replace(/\n/g, ' ');
      const label = `${i + 1}. ${content}${thought.content.length > 60 ? '...' : ''}`;

      mermaid += `  ${nodeId}["${label}"]\n`;

      if (i > 0) {
        mermaid += `  T${i} --> ${nodeId}\n`;
      }
    }

    if (colorScheme !== 'monochrome' && thoughts.length > 0) {
      mermaid += '\n';
      const color = colorScheme === 'pastel' ? '#e1f5ff' : '#a8d5ff';
      mermaid += `  style T1 fill:${color}\n`;
      if (thoughts.length > 1) {
        const endColor = colorScheme === 'pastel' ? '#e8f5e9' : '#c8e6c9';
        mermaid += `  style T${thoughts.length} fill:${endColor}\n`;
      }
    }

    return mermaid;
  }

  private thoughtSequenceToDOT(thoughts: BaseThought[]): string {
    let dot = 'digraph ThoughtSequence {\n';
    dot += '  rankdir=TD;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    for (let i = 0; i < thoughts.length; i++) {
      const thought = thoughts[i];
      const nodeId = `T${i + 1}`;
      const content = thought.content.substring(0, 60).replace(/"/g, '\\"').replace(/\n/g, ' ');
      const label = `${i + 1}. ${content}${thought.content.length > 60 ? '...' : ''}`;

      dot += `  ${nodeId} [label="${label}"];\n`;

      if (i > 0) {
        dot += `  T${i} -> ${nodeId};\n`;
      }
    }

    dot += '}\n';
    return dot;
  }

  private thoughtSequenceToASCII(thoughts: BaseThought[]): string {
    let ascii = 'Thought Sequence:\n';
    ascii += '=================\n\n';

    for (let i = 0; i < thoughts.length; i++) {
      const thought = thoughts[i];
      ascii += `${i + 1}. ${thought.content}\n`;

      if (i < thoughts.length - 1) {
        ascii += '   ↓\n';
      }
      ascii += '\n';
    }

    return ascii;
  }

  // ===== First-Principles Export =====

  /**
   * Export first-principles reasoning to visual format
   */
  exportFirstPrinciples(thought: FirstPrincipleThought, options: VisualExportOptions): string {
    const { format, colorScheme = 'default' } = options;

    switch (format) {
      case 'mermaid':
        return this.firstPrinciplesToMermaid(thought, colorScheme);
      case 'dot':
        return this.firstPrinciplesToDOT(thought);
      case 'ascii':
        return this.firstPrinciplesToASCII(thought);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private firstPrinciplesToMermaid(thought: FirstPrincipleThought, colorScheme: string): string {
    let mermaid = 'graph TD\n';

    // Add question
    mermaid += `  Q["Question: ${thought.question}"]\n`;

    // Add principles
    for (const principle of thought.principles) {
      const pid = this.sanitizeId(principle.id);
      mermaid += `  ${pid}["${principle.type}: ${principle.statement}"]\n`;
    }

    // Add derivation steps
    for (const step of thought.derivationSteps) {
      const sid = `S${step.stepNumber}`;
      const pid = this.sanitizeId(step.principle.id);
      mermaid += `  ${sid}["Step ${step.stepNumber}: ${step.inference}"]\n`;
      mermaid += `  ${pid} --> ${sid}\n`;

      if (step.stepNumber > 1) {
        mermaid += `  S${step.stepNumber - 1} --> ${sid}\n`;
      } else {
        mermaid += `  Q --> ${pid}\n`;
      }
    }

    // Add conclusion
    mermaid += `  C[["Conclusion: ${thought.conclusion.statement}"]]:\n`;
    if (thought.derivationSteps.length > 0) {
      mermaid += `  S${thought.derivationSteps.length} --> C\n`;
    }

    // Styling
    if (colorScheme !== 'monochrome') {
      mermaid += '\n';
      const qColor = colorScheme === 'pastel' ? '#fff3e0' : '#ffeb3b';
      const cColor = colorScheme === 'pastel' ? '#e8f5e9' : '#4caf50';
      mermaid += `  style Q fill:${qColor}\n`;
      mermaid += `  style C fill:${cColor}\n`;
    }

    return mermaid;
  }

  private firstPrinciplesToDOT(thought: FirstPrincipleThought): string {
    let dot = 'digraph FirstPrinciples {\n';
    dot += '  rankdir=TD;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    // Question
    dot += `  Q [label="Question:\\n${thought.question}", shape=ellipse];\n`;

    // Principles
    for (const principle of thought.principles) {
      const pid = this.sanitizeId(principle.id);
      dot += `  ${pid} [label="${principle.type}:\\n${principle.statement}"];\n`;
    }

    // Steps
    for (const step of thought.derivationSteps) {
      const sid = `S${step.stepNumber}`;
      const pid = this.sanitizeId(step.principle.id);
      dot += `  ${sid} [label="Step ${step.stepNumber}:\\n${step.inference}"];\n`;
      dot += `  ${pid} -> ${sid};\n`;

      if (step.stepNumber > 1) {
        dot += `  S${step.stepNumber - 1} -> ${sid};\n`;
      } else {
        dot += `  Q -> ${pid};\n`;
      }
    }

    // Conclusion
    dot += `  C [label="Conclusion:\\n${thought.conclusion.statement}", shape=doubleoctagon];\n`;
    if (thought.derivationSteps.length > 0) {
      dot += `  S${thought.derivationSteps.length} -> C;\n`;
    }

    dot += '}\n';
    return dot;
  }

  private firstPrinciplesToASCII(thought: FirstPrincipleThought): string {
    let ascii = 'First-Principles Reasoning:\n';
    ascii += '===========================\n\n';

    ascii += `Question: ${thought.question}\n\n`;

    ascii += 'Foundational Principles:\n';
    for (const principle of thought.principles) {
      ascii += `  • [${principle.type}] ${principle.statement}\n`;
      ascii += `    Justification: ${principle.justification}\n`;
    }
    ascii += '\n';

    ascii += 'Derivation Chain:\n';
    for (const step of thought.derivationSteps) {
      ascii += `  ${step.stepNumber}. ${step.inference}\n`;
      ascii += `     (From: ${step.principle.statement})\n`;
      ascii += `     Confidence: ${(step.confidence * 100).toFixed(0)}%\n`;
    }
    ascii += '\n';

    ascii += `Conclusion: ${thought.conclusion.statement}\n`;
    ascii += `Certainty: ${(thought.conclusion.certainty * 100).toFixed(0)}%\n`;

    if (thought.conclusion.limitations && thought.conclusion.limitations.length > 0) {
      ascii += '\nLimitations:\n';
      for (const limitation of thought.conclusion.limitations) {
        ascii += `  • ${limitation}\n`;
      }
    }

    return ascii;
  }
}
