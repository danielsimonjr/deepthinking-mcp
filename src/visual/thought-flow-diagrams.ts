/**
 * Thought Flow Sequence Diagrams (v3.4.0)
 * Phase 4B Task 3.3: Add thought flow sequence diagrams
 *
 * Generates sequence diagrams showing the flow of reasoning across thoughts
 */

import type { ThinkingSession, Thought } from '../types/index.js';
import { MermaidGenerator } from './mermaid-generator.js';

/**
 * Flow node type
 */
export type FlowNodeType =
  | 'thought' // Regular thought
  | 'decision' // Decision point
  | 'branch' // Branch/revision
  | 'merge' // Merge point
  | 'loop' // Iterative loop
  | 'milestone'; // Important milestone

/**
 * Flow edge type
 */
export type FlowEdgeType =
  | 'sequential' // Normal sequential flow
  | 'conditional' // Conditional branch
  | 'iterative' // Loop back
  | 'parallel' // Parallel paths
  | 'dependency'; // Dependency relationship

/**
 * Thought flow node
 */
export interface ThoughtFlowNode {
  id: string;
  thoughtNumber: number;
  label: string;
  type: FlowNodeType;
  mode: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

/**
 * Thought flow edge
 */
export interface ThoughtFlowEdge {
  from: string;
  to: string;
  type: FlowEdgeType;
  label?: string;
  condition?: string;
}

/**
 * Thought flow graph
 */
export interface ThoughtFlowGraph {
  nodes: ThoughtFlowNode[];
  edges: ThoughtFlowEdge[];
  branches: Map<string, ThoughtFlowNode[]>; // Branch points
  milestones: ThoughtFlowNode[];
}

/**
 * Thought flow sequence diagram generator
 */
export class ThoughtFlowDiagramGenerator {
  private mermaidGenerator: MermaidGenerator;

  constructor() {
    this.mermaidGenerator = new MermaidGenerator();
  }

  /**
   * Analyze session and extract flow graph
   */
  analyzeFlow(session: ThinkingSession): ThoughtFlowGraph {
    const nodes: ThoughtFlowNode[] = [];
    const edges: ThoughtFlowEdge[] = [];
    const branches = new Map<string, ThoughtFlowNode[]>();
    const milestones: ThoughtFlowNode[] = [];

    // Create nodes for each thought
    for (const thought of session.thoughts) {
      const nodeType = this.determineNodeType(thought);
      const node: ThoughtFlowNode = {
        id: `T${thought.contentNumber}`,
        thoughtNumber: thought.contentNumber,
        label: this.createNodeLabel(thought),
        type: nodeType,
        mode: thought.mode,
      };

      nodes.push(node);

      // Track milestones
      if (nodeType === 'milestone') {
        milestones.push(node);
      }

      // Track branches
      if ('isRevision' in thought && thought.isRevision) {
        const branchPoint = thought.revisesThought?.toString() || 'unknown';
        if (!branches.has(branchPoint)) {
          branches.set(branchPoint, []);
        }
        branches.get(branchPoint)!.push(node);
      }
    }

    // Create edges based on flow
    for (let i = 0; i < session.thoughts.length - 1; i++) {
      const current = session.thoughts[i];
      const next = session.thoughts[i + 1];

      const edgeType = this.determineEdgeType(current, next);

      edges.push({
        from: `T${current.thoughtNumber}`,
        to: `T${next.thoughtNumber}`,
        type: edgeType,
        label: this.createEdgeLabel(current, next),
      });
    }

    // Add branch edges
    for (const thought of session.thoughts) {
      if ('isRevision' in thought && thought.isRevision && thought.revisesThought) {
        edges.push({
          from: `T${thought.revisesThought}`,
          to: `T${thought.contentNumber}`,
          type: 'conditional',
          label: 'revision',
        });
      }
    }

    return { nodes, edges, branches, milestones };
  }

  /**
   * Determine node type
   */
  private determineNodeType(thought: Thought): FlowNodeType {
    // Check for revision
    if ('isRevision' in thought && thought.isRevision) {
      return 'branch';
    }

    // Check for decision (high uncertainty)
    if ('uncertainty' in thought && typeof thought.uncertainty === 'number' && thought.uncertainty > 0.7) {
      return 'decision';
    }

    // Check for milestone (low thought number or specific modes)
    if (thought.contentNumber === 1 || thought.contentNumber === thought.totalThoughts) {
      return 'milestone';
    }

    // Check for loop (needs more thoughts)
    if ('needsMoreThoughts' in thought && thought.needsMoreThoughts) {
      return 'loop';
    }

    return 'thought';
  }

  /**
   * Determine edge type
   */
  private determineEdgeType(current: Thought, next: Thought): FlowEdgeType {
    // Check if next is a revision
    if ('isRevision' in next && next.isRevision) {
      return 'conditional';
    }

    // Check if same mode continues
    if (current.mode === next.mode) {
      return 'sequential';
    }

    // Mode changed
    return 'dependency';
  }

  /**
   * Create node label
   */
  private createNodeLabel(thought: Thought): string {
    const maxLength = 30;
    let text = thought.content;

    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }

    return `T${thought.contentNumber}: ${thought.mode}`;
  }

  /**
   * Create edge label
   */
  private createEdgeLabel(current: Thought, next: Thought): string {
    if (current.mode !== next.mode) {
      return `→ ${next.mode}`;
    }
    return '';
  }

  /**
   * Generate sequence diagram showing thought progression
   */
  generateSequenceDiagram(session: ThinkingSession): string {
    const participants: string[] = [];
    const messages: Array<{ from: string; to: string; text: string; type?: 'solid' | 'dotted' }> = [];

    // Extract unique modes as participants
    const modes = new Set<string>();
    for (const thought of session.thoughts) {
      modes.add(thought.mode);
    }

    participants.push('User');
    for (const mode of modes) {
      participants.push(mode);
    }

    // Add messages for each thought
    let previousMode = 'User';
    for (const thought of session.thoughts) {
      const currentMode = thought.mode;

      // Message from previous to current
      messages.push({
        from: previousMode,
        to: currentMode,
        text: `T${thought.contentNumber}: ${this.createNodeLabel(thought)}`,
        type: 'solid',
      });

      previousMode = currentMode;
    }

    // Final message
    messages.push({
      from: previousMode,
      to: 'User',
      text: 'Complete',
      type: 'solid',
    });

    return this.mermaidGenerator.generateSequenceDiagram(participants, messages);
  }

  /**
   * Generate flowchart showing thought flow
   */
  generateFlowchart(session: ThinkingSession): string {
    const flow = this.analyzeFlow(session);

    const mermaidNodes = flow.nodes.map(node => ({
      id: node.id,
      label: node.label,
      shape: this.getNodeShape(node.type),
      class: node.type,
    }));

    const mermaidEdges = flow.edges.map(edge => ({
      from: edge.from,
      to: edge.to,
      label: edge.label,
      type: edge.type === 'conditional' ? 'dotted' as const : 'arrow' as const,
    }));

    // Define style classes
    const styleClasses = [
      { name: 'thought', fill: '#e3f2fd', stroke: '#1976d2', strokeWidth: '2px' },
      { name: 'decision', fill: '#fff3e0', stroke: '#f57c00', strokeWidth: '2px' },
      { name: 'branch', fill: '#f3e5f5', stroke: '#7b1fa2', strokeWidth: '2px' },
      { name: 'milestone', fill: '#e8f5e9', stroke: '#388e3c', strokeWidth: '3px' },
      { name: 'loop', fill: '#fce4ec', stroke: '#c2185b', strokeWidth: '2px' },
    ];

    return this.mermaidGenerator.generateFlowchart(mermaidNodes, mermaidEdges, 'TB', styleClasses);
  }

  /**
   * Get node shape based on type
   */
  private getNodeShape(type: FlowNodeType): 'rectangle' | 'rounded' | 'rhombus' | 'stadium' | 'circle' {
    switch (type) {
      case 'decision':
        return 'rhombus';
      case 'milestone':
        return 'stadium';
      case 'branch':
        return 'rounded';
      case 'loop':
        return 'circle';
      default:
        return 'rectangle';
    }
  }

  /**
   * Generate timeline showing temporal progression
   */
  generateTimeline(session: ThinkingSession): string {
    const lines: string[] = [];

    lines.push('%%{init: { \'theme\': \'default\' }}%%');
    lines.push('timeline');
    lines.push(`  title ${session.title || 'Thinking Session'}`);

    // Group by mode
    const thoughtsByMode = new Map<string, Thought[]>();
    for (const thought of session.thoughts) {
      if (!thoughtsByMode.has(thought.mode)) {
        thoughtsByMode.set(thought.mode, []);
      }
      thoughtsByMode.get(thought.mode)!.push(thought);
    }

    // Add sections
    for (const [mode, thoughts] of thoughtsByMode) {
      lines.push(`  section ${mode}`);
      for (const thought of thoughts) {
        lines.push(`    Thought ${thought.contentNumber} : ${this.createNodeLabel(thought)}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate state diagram showing mode transitions
   */
  generateStateDiagram(session: ThinkingSession): string {
    const states: Array<{ id: string; label?: string }> = [];
    const transitions: Array<{ from: string; to: string; label?: string }> = [];

    // Extract unique modes
    const modes = new Set<string>();
    for (const thought of session.thoughts) {
      modes.add(thought.mode);
    }

    // Create states
    for (const mode of modes) {
      states.push({ id: mode, label: mode });
    }

    // Create transitions
    let previousMode: string | null = null;
    for (const thought of session.thoughts) {
      if (previousMode && previousMode !== thought.mode) {
        // Mode transition
        transitions.push({
          from: previousMode,
          to: thought.mode,
          label: `T${thought.contentNumber}`,
        });
      }
      previousMode = thought.mode;
    }

    return this.mermaidGenerator.generateStateDiagram(states, transitions);
  }

  /**
   * Generate comprehensive flow analysis
   */
  generateFlowAnalysis(session: ThinkingSession): string {
    const flow = this.analyzeFlow(session);

    const report: string[] = [];

    report.push('# Thought Flow Analysis');
    report.push('');

    report.push('## Flow Statistics');
    report.push(`- **Total Thoughts:** ${flow.nodes.length}`);
    report.push(`- **Total Transitions:** ${flow.edges.length}`);
    report.push(`- **Branches:** ${flow.branches.size}`);
    report.push(`- **Milestones:** ${flow.milestones.length}`);
    report.push('');

    report.push('## Node Type Distribution');
    const typeCounts = new Map<FlowNodeType, number>();
    for (const node of flow.nodes) {
      typeCounts.set(node.type, (typeCounts.get(node.type) || 0) + 1);
    }
    for (const [type, count] of typeCounts) {
      report.push(`- ${type}: ${count}`);
    }
    report.push('');

    report.push('## Edge Type Distribution');
    const edgeCounts = new Map<FlowEdgeType, number>();
    for (const edge of flow.edges) {
      edgeCounts.set(edge.type, (edgeCounts.get(edge.type) || 0) + 1);
    }
    for (const [type, count] of edgeCounts) {
      report.push(`- ${type}: ${count}`);
    }
    report.push('');

    if (flow.milestones.length > 0) {
      report.push('## Milestones');
      for (const milestone of flow.milestones) {
        report.push(`- Thought ${milestone.thoughtNumber}: ${milestone.label}`);
      }
      report.push('');
    }

    if (flow.branches.size > 0) {
      report.push('## Branches');
      for (const [branchPoint, nodes] of flow.branches) {
        report.push(`- Branch from Thought ${branchPoint}:`);
        for (const node of nodes) {
          report.push(`  - Thought ${node.thoughtNumber} (${node.mode})`);
        }
      }
      report.push('');
    }

    return report.join('\n');
  }

  /**
   * Generate all flow diagrams for a session
   */
  generateAllDiagrams(session: ThinkingSession): {
    sequence: string;
    flowchart: string;
    timeline: string;
    stateDiagram: string;
    analysis: string;
  } {
    return {
      sequence: this.generateSequenceDiagram(session),
      flowchart: this.generateFlowchart(session),
      timeline: this.generateTimeline(session),
      stateDiagram: this.generateStateDiagram(session),
      analysis: this.generateFlowAnalysis(session),
    };
  }
}
