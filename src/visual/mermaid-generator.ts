/**
 * Mermaid Generator Infrastructure (v3.4.0)
 * Phase 4B Task 3.1: Enhanced Mermaid diagram generation
 *
 * Provides advanced Mermaid diagram generation with styling, themes, and configuration
 */

import type { ThinkingSession, Thought } from '../types/index.js';

/**
 * Mermaid diagram type
 */
export type MermaidDiagramType =
  | 'flowchart' // Flowchart (graph)
  | 'sequence' // Sequence diagram
  | 'class' // Class diagram
  | 'state' // State diagram
  | 'er' // Entity relationship
  | 'gantt' // Gantt chart
  | 'pie' // Pie chart
  | 'journey' // User journey
  | 'gitgraph' // Git graph
  | 'mindmap' // Mind map
  | 'timeline' // Timeline
  | 'quadrant'; // Quadrant chart

/**
 * Mermaid theme
 */
export type MermaidTheme =
  | 'default' // Default Mermaid theme
  | 'neutral' // Neutral theme
  | 'dark' // Dark theme
  | 'forest' // Forest theme
  | 'base'; // Base theme

/**
 * Flowchart direction
 */
export type FlowchartDirection = 'TB' | 'BT' | 'LR' | 'RL'; // Top-bottom, bottom-top, left-right, right-left

/**
 * Node shape
 */
export type NodeShape =
  | 'rectangle' // [text]
  | 'rounded' // (text)
  | 'stadium' // ([text])
  | 'subroutine' // [[text]]
  | 'cylindrical' // [(text)]
  | 'circle' // ((text))
  | 'asymmetric' // >text]
  | 'rhombus' // {text}
  | 'hexagon' // {{text}}
  | 'parallelogram' // [/text/]
  | 'trapezoid'; // [\\text/]

/**
 * Mermaid configuration
 */
export interface MermaidConfig {
  theme: MermaidTheme;
  themeVariables?: Record<string, string>;
  flowchart?: {
    direction?: FlowchartDirection;
    curve?: 'basis' | 'linear' | 'stepAfter' | 'stepBefore';
    nodeSpacing?: number;
    rankSpacing?: number;
  };
  sequence?: {
    actorMargin?: number;
    noteMargin?: number;
    messageMargin?: number;
    mirrorActors?: boolean;
  };
  gantt?: {
    titleTopMargin?: number;
    barHeight?: number;
    barGap?: number;
    topPadding?: number;
    leftPadding?: number;
    gridLineStartPadding?: number;
    fontSize?: number;
  };
}

/**
 * Mermaid node
 */
export interface MermaidNode {
  id: string;
  label: string;
  shape?: NodeShape;
  class?: string;
  link?: string;
  click?: string;
  style?: string;
}

/**
 * Mermaid edge
 */
export interface MermaidEdge {
  from: string;
  to: string;
  label?: string;
  type?: 'arrow' | 'open' | 'dotted' | 'thick' | 'invisible';
  style?: string;
}

/**
 * Mermaid style class
 */
export interface MermaidStyleClass {
  name: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  color?: string;
  fontSize?: string;
}

/**
 * Mermaid generator
 */
export class MermaidGenerator {
  private config: MermaidConfig;

  constructor(config: MermaidConfig = { theme: 'default' }) {
    this.config = config;
  }

  /**
   * Generate Mermaid configuration block
   */
  generateConfig(): string {
    const lines: string[] = [];

    lines.push('%%{init: {');
    lines.push(`  'theme': '${this.config.theme}'`);

    if (this.config.themeVariables) {
      lines.push(`  ,'themeVariables': ${JSON.stringify(this.config.themeVariables)}`);
    }

    if (this.config.flowchart) {
      lines.push(`  ,'flowchart': ${JSON.stringify(this.config.flowchart)}`);
    }

    if (this.config.sequence) {
      lines.push(`  ,'sequence': ${JSON.stringify(this.config.sequence)}`);
    }

    if (this.config.gantt) {
      lines.push(`  ,'gantt': ${JSON.stringify(this.config.gantt)}`);
    }

    lines.push('}}%%');

    return lines.join('\n');
  }

  /**
   * Generate flowchart
   */
  generateFlowchart(
    nodes: MermaidNode[],
    edges: MermaidEdge[],
    direction: FlowchartDirection = 'TB',
    styleClasses?: MermaidStyleClass[]
  ): string {
    const lines: string[] = [];

    // Configuration
    lines.push(this.generateConfig());
    lines.push('');

    // Diagram type and direction
    lines.push(`flowchart ${direction}`);

    // Nodes
    for (const node of nodes) {
      const shape = node.shape || 'rectangle';
      const nodeText = this.escapeText(node.label);
      const nodeDeclaration = this.formatNode(node.id, nodeText, shape);
      lines.push(`  ${nodeDeclaration}`);
    }

    lines.push('');

    // Edges
    for (const edge of edges) {
      const edgeDeclaration = this.formatEdge(edge);
      lines.push(`  ${edgeDeclaration}`);
    }

    // Style classes
    if (styleClasses && styleClasses.length > 0) {
      lines.push('');
      for (const styleClass of styleClasses) {
        lines.push(`  classDef ${styleClass.name} ${this.formatStyle(styleClass)}`);
      }
    }

    // Apply classes to nodes
    for (const node of nodes) {
      if (node.class) {
        lines.push(`  class ${node.id} ${node.class}`);
      }
    }

    // Click handlers
    for (const node of nodes) {
      if (node.click) {
        lines.push(`  click ${node.id} ${node.click}`);
      }
      if (node.link) {
        lines.push(`  click ${node.id} "${node.link}"`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Format node with shape
   */
  private formatNode(id: string, text: string, shape: NodeShape): string {
    switch (shape) {
      case 'rectangle':
        return `${id}[${text}]`;
      case 'rounded':
        return `${id}(${text})`;
      case 'stadium':
        return `${id}([${text}])`;
      case 'subroutine':
        return `${id}[[${text}]]`;
      case 'cylindrical':
        return `${id}[(${text})]`;
      case 'circle':
        return `${id}((${text}))`;
      case 'asymmetric':
        return `${id}>${text}]`;
      case 'rhombus':
        return `${id}{${text}}`;
      case 'hexagon':
        return `${id}{{${text}}}`;
      case 'parallelogram':
        return `${id}[/${text}/]`;
      case 'trapezoid':
        return `${id}[\\${text}/]`;
      default:
        return `${id}[${text}]`;
    }
  }

  /**
   * Format edge
   */
  private formatEdge(edge: MermaidEdge): string {
    const { from, to, label, type = 'arrow' } = edge;

    let connector = '';
    switch (type) {
      case 'arrow':
        connector = label ? `-->|${label}|` : '-->';
        break;
      case 'open':
        connector = label ? `---|${label}|` : '---';
        break;
      case 'dotted':
        connector = label ? `-.->|${label}|` : '.->';
        break;
      case 'thick':
        connector = label ? `==>|${label}|` : '==>';
        break;
      case 'invisible':
        connector = '~~~';
        break;
    }

    return `${from} ${connector} ${to}`;
  }

  /**
   * Format style
   */
  private formatStyle(styleClass: MermaidStyleClass): string {
    const styles: string[] = [];

    if (styleClass.fill) styles.push(`fill:${styleClass.fill}`);
    if (styleClass.stroke) styles.push(`stroke:${styleClass.stroke}`);
    if (styleClass.strokeWidth) styles.push(`stroke-width:${styleClass.strokeWidth}`);
    if (styleClass.color) styles.push(`color:${styleClass.color}`);
    if (styleClass.fontSize) styles.push(`font-size:${styleClass.fontSize}`);

    return styles.join(',');
  }

  /**
   * Generate sequence diagram
   */
  generateSequenceDiagram(
    participants: string[],
    messages: Array<{ from: string; to: string; text: string; type?: 'solid' | 'dotted' }>,
    notes?: Array<{ position: 'left' | 'right' | 'over'; actor: string; text: string }>
  ): string {
    const lines: string[] = [];

    // Configuration
    lines.push(this.generateConfig());
    lines.push('');

    // Diagram type
    lines.push('sequenceDiagram');

    // Participants
    for (const participant of participants) {
      lines.push(`  participant ${participant}`);
    }

    lines.push('');

    // Messages
    for (const message of messages) {
      const arrow = message.type === 'dotted' ? '-->>': '->>';
      lines.push(`  ${message.from}${arrow}${message.to}: ${this.escapeText(message.text)}`);
    }

    // Notes
    if (notes) {
      lines.push('');
      for (const note of notes) {
        lines.push(`  Note ${note.position} of ${note.actor}: ${this.escapeText(note.text)}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate state diagram
   */
  generateStateDiagram(
    states: Array<{ id: string; label?: string }>,
    transitions: Array<{ from: string; to: string; label?: string }>
  ): string {
    const lines: string[] = [];

    // Configuration
    lines.push(this.generateConfig());
    lines.push('');

    // Diagram type
    lines.push('stateDiagram-v2');

    // Start state
    lines.push('  [*] --> ' + (states[0]?.id || 'Initial'));

    // States
    for (const state of states) {
      if (state.label && state.label !== state.id) {
        lines.push(`  ${state.id}: ${state.label}`);
      }
    }

    lines.push('');

    // Transitions
    for (const transition of transitions) {
      if (transition.label) {
        lines.push(`  ${transition.from} --> ${transition.to}: ${transition.label}`);
      } else {
        lines.push(`  ${transition.from} --> ${transition.to}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate Gantt chart
   */
  generateGantt(
    title: string,
    sections: Array<{
      name: string;
      tasks: Array<{ name: string; id?: string; start?: string; end?: string; duration?: string; status?: string }>;
    }>
  ): string {
    const lines: string[] = [];

    // Configuration
    lines.push(this.generateConfig());
    lines.push('');

    // Diagram type and title
    lines.push('gantt');
    lines.push(`  title ${title}`);
    lines.push(`  dateFormat YYYY-MM-DD`);

    // Sections and tasks
    for (const section of sections) {
      lines.push('');
      lines.push(`  section ${section.name}`);
      for (const task of section.tasks) {
        let taskLine = `  ${task.name}`;
        if (task.status) taskLine += ` :${task.status}`;
        if (task.id) taskLine += `, ${task.id}`;
        if (task.start) taskLine += `, ${task.start}`;
        if (task.duration) taskLine += `, ${task.duration}`;
        if (task.end) taskLine += `, ${task.end}`;
        lines.push(taskLine);
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate mind map
   */
  generateMindmap(root: { id: string; label: string; children?: any[] }): string {
    const lines: string[] = [];

    // Configuration
    lines.push(this.generateConfig());
    lines.push('');

    // Diagram type
    lines.push('mindmap');
    lines.push(`  root((${root.label}))`);

    // Recursive function to add children
    const addChildren = (node: any, indent: number = 2) => {
      if (node.children) {
        for (const child of node.children) {
          const spaces = '  '.repeat(indent);
          lines.push(`${spaces}${child.label}`);
          if (child.children) {
            addChildren(child, indent + 1);
          }
        }
      }
    };

    addChildren(root);

    return lines.join('\n');
  }

  /**
   * Generate pie chart
   */
  generatePieChart(title: string, data: Array<{ label: string; value: number }>): string {
    const lines: string[] = [];

    // Configuration
    lines.push(this.generateConfig());
    lines.push('');

    // Diagram type
    lines.push('pie');
    lines.push(`  title ${title}`);

    // Data
    for (const item of data) {
      lines.push(`  "${item.label}" : ${item.value}`);
    }

    return lines.join('\n');
  }

  /**
   * Escape special characters in text
   */
  private escapeText(text: string): string {
    return text
      .replace(/"/g, '#quot;')
      .replace(/</g, '#lt;')
      .replace(/>/g, '#gt;');
  }

  /**
   * Generate Mermaid diagram for thought
   */
  generateForThought(thought: Thought): string | null {
    // This would be extended to handle different thought types
    // For now, return null for unsupported types
    return null;
  }

  /**
   * Generate session overview diagram
   */
  generateSessionOverview(session: ThinkingSession): string {
    const nodes: MermaidNode[] = [];
    const edges: MermaidEdge[] = [];

    // Create nodes for each thought
    for (const thought of session.thoughts) {
      nodes.push({
        id: `T${thought.thoughtNumber}`,
        label: `Thought ${thought.thoughtNumber}\\n${thought.mode}`,
        shape: 'rounded',
      });
    }

    // Create edges between consecutive thoughts
    for (let i = 0; i < session.thoughts.length - 1; i++) {
      edges.push({
        from: `T${session.thoughts[i].thoughtNumber}`,
        to: `T${session.thoughts[i + 1].thoughtNumber}`,
        type: 'arrow',
      });
    }

    return this.generateFlowchart(nodes, edges, 'TB');
  }
}
