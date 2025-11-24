/**
 * Enhanced Mermaid Diagram Generator (v3.3.0)
 * Phase 4B Task 3.1: Advanced Mermaid infrastructure with interactive features
 */
// @ts-nocheck - Requires type refactoring

import type { BaseThought } from '../types/index.js';

/**
 * Mermaid diagram types supported
 */
export type MermaidDiagramType =
  | 'flowchart'
  | 'sequence'
  | 'stateDiagram'
  | 'classDiagram'
  | 'erDiagram'
  | 'gantt'
  | 'pie'
  | 'mindmap'
  | 'timeline'
  | 'quadrantChart';

/**
 * Configuration for Mermaid diagram generation
 */
export interface MermaidConfig {
  // Diagram type
  type: MermaidDiagramType;

  // Visual options
  theme?: 'default' | 'dark' | 'forest' | 'neutral' | 'base';
  direction?: 'TB' | 'TD' | 'BT' | 'LR' | 'RL';

  // Interactive features
  enableClick?: boolean;
  enableTooltips?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;

  // Content options
  includeLabels?: boolean;
  includeMetrics?: boolean;
  includeTimestamps?: boolean;

  // Styling
  nodeSpacing?: number;
  edgeThickness?: number;
  fontSize?: number;

  // Security
  securityLevel?: 'strict' | 'loose' | 'antiscript';
}

/**
 * Interactive element configuration
 */
export interface InteractiveElement {
  id: string;
  clickHandler?: string; // JavaScript function name or URL
  tooltip?: string;
  cssClass?: string;
  callback?: string; // Callback function name
}

/**
 * Enhanced Mermaid Generator with interactive capabilities
 */
export class MermaidGenerator {
  private config: Required<MermaidConfig>;
  private interactiveElements: Map<string, InteractiveElement>;

  constructor(config: Partial<MermaidConfig> = {}) {
    this.config = {
      type: config.type || 'flowchart',
      theme: config.theme || 'default',
      direction: config.direction || 'TB',
      enableClick: config.enableClick !== false,
      enableTooltips: config.enableTooltips !== false,
      enableZoom: config.enableZoom !== false,
      enablePan: config.enablePan !== false,
      includeLabels: config.includeLabels !== false,
      includeMetrics: config.includeMetrics !== false,
      includeTimestamps: config.includeTimestamps !== false,
      nodeSpacing: config.nodeSpacing || 50,
      edgeThickness: config.edgeThickness || 2,
      fontSize: config.fontSize || 14,
      securityLevel: config.securityLevel || 'loose',
    };

    this.interactiveElements = new Map();
  }

  /**
   * Generate Mermaid diagram header with configuration
   */
  private generateHeader(): string {
    const lines: string[] = [];

    lines.push('%%{init: {');
    lines.push(`  'theme': '${this.config.theme}',`);
    lines.push(`  'themeVariables': {`);
    lines.push(`    'fontSize': '${this.config.fontSize}px'`);
    lines.push(`  },`);
    lines.push(`  'securityLevel': '${this.config.securityLevel}'`);
    lines.push('}}%%');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate flowchart diagram
   */
  generateFlowchart(nodes: FlowchartNode[], edges: FlowchartEdge[]): string {
    const lines: string[] = [];

    lines.push(this.generateHeader());
    lines.push(`flowchart ${this.config.direction}`);
    lines.push('');

    // Add nodes
    for (const node of nodes) {
      const nodeStr = this.formatFlowchartNode(node);
      lines.push(`  ${nodeStr}`);

      // Add interactive features
      if (this.config.enableClick && node.clickHandler) {
        lines.push(`  click ${node.id} call ${node.clickHandler}()`);
      }
      if (this.config.enableTooltips && node.tooltip) {
        lines.push(`  ${node.id}:::tooltip["${node.tooltip}"]`);
      }
    }

    lines.push('');

    // Add edges
    for (const edge of edges) {
      const edgeStr = this.formatFlowchartEdge(edge);
      lines.push(`  ${edgeStr}`);
    }

    // Add styling
    if (nodes.some(n => n.cssClass)) {
      lines.push('');
      lines.push(this.generateFlowchartStyles(nodes));
    }

    return lines.join('\n');
  }

  /**
   * Format a flowchart node with appropriate shape
   */
  private formatFlowchartNode(node: FlowchartNode): string {
    const { id, label, shape = 'rectangle', cssClass } = node;
    const displayLabel = this.config.includeLabels ? label : id;

    let formatted: string;
    switch (shape) {
      case 'rectangle':
        formatted = `${id}[${displayLabel}]`;
        break;
      case 'roundedge':
        formatted = `${id}(${displayLabel})`;
        break;
      case 'stadium':
        formatted = `${id}([${displayLabel}])`;
        break;
      case 'subroutine':
        formatted = `${id}[[${displayLabel}]]`;
        break;
      case 'cylinder':
        formatted = `${id}[(${displayLabel})]`;
        break;
      case 'circle':
        formatted = `${id}((${displayLabel}))`;
        break;
      case 'diamond':
        formatted = `${id}{${displayLabel}}`;
        break;
      case 'hexagon':
        formatted = `${id}{{${displayLabel}}}`;
        break;
      case 'parallelogram':
        formatted = `${id}[/${displayLabel}/]`;
        break;
      case 'trapezoid':
        formatted = `${id}[\\${displayLabel}/]`;
        break;
      default:
        formatted = `${id}[${displayLabel}]`;
    }

    if (cssClass) {
      formatted += `:::${cssClass}`;
    }

    return formatted;
  }

  /**
   * Format a flowchart edge
   */
  private formatFlowchartEdge(edge: FlowchartEdge): string {
    const { from, to, label, type = 'solid', thickness = 'normal' } = edge;

    let arrow: string;
    switch (type) {
      case 'solid':
        arrow = thickness === 'thick' ? '==>' : '-->';
        break;
      case 'dotted':
        arrow = thickness === 'thick' ? '=.=>' : '-.->';
        break;
      case 'thick':
        arrow = '==>';
        break;
      default:
        arrow = '-->';
    }

    if (label && this.config.includeLabels) {
      return `${from} ${arrow}|${label}| ${to}`;
    }

    return `${from} ${arrow} ${to}`;
  }

  /**
   * Generate CSS classes for styled nodes
   */
  private generateFlowchartStyles(nodes: FlowchartNode[]): string {
    const lines: string[] = [];
    const classes = new Set(nodes.map(n => n.cssClass).filter(Boolean));

    for (const cssClass of classes) {
      lines.push(`  classDef ${cssClass} fill:#f9f,stroke:#333,stroke-width:4px`);
    }

    return lines.join('\n');
  }

  /**
   * Generate sequence diagram
   */
  generateSequenceDiagram(participants: string[], interactions: SequenceInteraction[]): string {
    const lines: string[] = [];

    lines.push(this.generateHeader());
    lines.push('sequenceDiagram');
    lines.push('');

    // Add participants
    for (const participant of participants) {
      lines.push(`  participant ${this.sanitizeId(participant)}`);
    }

    lines.push('');

    // Add interactions
    for (const interaction of interactions) {
      const line = this.formatSequenceInteraction(interaction);
      lines.push(`  ${line}`);
    }

    return lines.join('\n');
  }

  /**
   * Format a sequence diagram interaction
   */
  private formatSequenceInteraction(interaction: SequenceInteraction): string {
    const { from, to, message, type = 'solid', activate = false } = interaction;

    const fromId = this.sanitizeId(from);
    const toId = this.sanitizeId(to);

    let arrow: string;
    switch (type) {
      case 'solid':
        arrow = '->>';
        break;
      case 'dotted':
        arrow = '-->';
        break;
      case 'async':
        arrow = '->>';
        break;
      default:
        arrow = '->>';
    }

    let line = `${fromId}${arrow}${toId}: ${message}`;

    if (activate) {
      line += `\n  activate ${toId}`;
    }

    return line;
  }

  /**
   * Generate state diagram
   */
  generateStateDiagram(states: StateNode[], transitions: StateTransition[]): string {
    const lines: string[] = [];

    lines.push(this.generateHeader());
    lines.push('stateDiagram-v2');
    lines.push('');

    // Add states
    for (const state of states) {
      if (state.type === 'start') {
        lines.push(`  [*] --> ${state.id}`);
      } else if (state.type === 'end') {
        lines.push(`  ${state.id} --> [*]`);
      } else {
        lines.push(`  state "${state.label}" as ${state.id}`);
      }

      if (state.description) {
        lines.push(`  ${state.id}: ${state.description}`);
      }
    }

    lines.push('');

    // Add transitions
    for (const transition of transitions) {
      const line = this.formatStateTransition(transition);
      lines.push(`  ${line}`);
    }

    return lines.join('\n');
  }

  /**
   * Format a state transition
   */
  private formatStateTransition(transition: StateTransition): string {
    const { from, to, condition } = transition;

    if (condition && this.config.includeLabels) {
      return `${from} --> ${to}: ${condition}`;
    }

    return `${from} --> ${to}`;
  }

  /**
   * Generate mind map diagram
   */
  generateMindmap(root: MindmapNode): string {
    const lines: string[] = [];

    lines.push(this.generateHeader());
    lines.push('mindmap');
    lines.push(`  root((${root.label}))`);

    for (const child of root.children || []) {
      this.addMindmapNode(lines, child, 2);
    }

    return lines.join('\n');
  }

  /**
   * Recursively add mindmap nodes
   */
  private addMindmapNode(lines: string[], node: MindmapNode, indent: number): void {
    const spaces = '  '.repeat(indent);

    // Choose shape based on level
    let formatted: string;
    if (indent === 2) {
      // First level children - rounded rectangles
      formatted = `${spaces}${node.label}`;
    } else if (indent === 3) {
      // Second level - circles
      formatted = `${spaces}((${node.label}))`;
    } else {
      // Deeper levels - rectangles
      formatted = `${spaces}[${node.label}]`;
    }

    lines.push(formatted);

    // Add children recursively
    if (node.children) {
      for (const child of node.children) {
        this.addMindmapNode(lines, child, indent + 1);
      }
    }
  }

  /**
   * Generate Gantt chart (timeline)
   */
  generateGantt(title: string, tasks: GanttTask[]): string {
    const lines: string[] = [];

    lines.push(this.generateHeader());
    lines.push('gantt');
    lines.push(`  title ${title}`);
    lines.push(`  dateFormat YYYY-MM-DD`);
    lines.push('');

    // Group tasks by section
    const sections = this.groupTasksBySection(tasks);

    for (const [section, sectionTasks] of sections.entries()) {
      lines.push(`  section ${section}`);

      for (const task of sectionTasks) {
        const taskStr = this.formatGanttTask(task);
        lines.push(`    ${taskStr}`);
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Group Gantt tasks by section
   */
  private groupTasksBySection(tasks: GanttTask[]): Map<string, GanttTask[]> {
    const sections = new Map<string, GanttTask[]>();

    for (const task of tasks) {
      const section = task.section || 'Default';
      if (!sections.has(section)) {
        sections.set(section, []);
      }
      sections.get(section)!.push(task);
    }

    return sections;
  }

  /**
   * Format a Gantt task
   */
  private formatGanttTask(task: GanttTask): string {
    const { id, name, status = 'active', startDate, endDate, duration } = task;

    let taskStr = `${name} :`;

    if (status) {
      taskStr += `${status}, `;
    }

    if (id) {
      taskStr += `${id}, `;
    }

    if (startDate && endDate) {
      taskStr += `${startDate}, ${endDate}`;
    } else if (startDate && duration) {
      taskStr += `${startDate}, ${duration}`;
    }

    return taskStr;
  }

  /**
   * Sanitize ID for Mermaid (remove special characters)
   */
  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Add click handler to element
   */
  addClickHandler(elementId: string, handlerName: string, tooltip?: string): void {
    this.interactiveElements.set(elementId, {
      id: elementId,
      clickHandler: handlerName,
      tooltip,
    });
  }

  /**
   * Get all interactive elements
   */
  getInteractiveElements(): InteractiveElement[] {
    return Array.from(this.interactiveElements.values());
  }

  /**
   * Generate complete HTML wrapper with interactive features
   */
  generateInteractiveHTML(mermaidCode: string, title: string = 'Diagram'): string {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({
      startOnLoad: true,
      theme: '${this.config.theme}',
      securityLevel: '${this.config.securityLevel}',
      ${this.config.enableZoom ? 'flowchart: { useMaxWidth: false },' : ''}
    });
  </script>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      padding: 0;
    }
    .mermaid {
      ${this.config.enableZoom ? 'cursor: grab;' : ''}
      ${this.config.enableZoom ? 'user-select: none;' : ''}
    }
    ${this.config.enableZoom ? `
    .mermaid:active {
      cursor: grabbing;
    }
    ` : ''}
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="mermaid">
${mermaidCode}
  </div>
  ${this.config.enableZoom ? this.generateZoomScript() : ''}
</body>
</html>`;

    return html;
  }

  /**
   * Generate zoom/pan JavaScript
   */
  private generateZoomScript(): string {
    return `
  <script>
    // Add zoom and pan functionality
    const diagram = document.querySelector('.mermaid svg');
    if (diagram) {
      let scale = 1;
      let translateX = 0;
      let translateY = 0;
      let isDragging = false;
      let startX, startY;

      diagram.style.cursor = 'grab';

      diagram.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        scale *= delta;
        scale = Math.max(0.1, Math.min(scale, 10));
        updateTransform();
      });

      diagram.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        diagram.style.cursor = 'grabbing';
      });

      document.addEventListener('mousemove', (e) => {
        if (isDragging) {
          translateX = e.clientX - startX;
          translateY = e.clientY - startY;
          updateTransform();
        }
      });

      document.addEventListener('mouseup', () => {
        isDragging = false;
        diagram.style.cursor = 'grab';
      });

      function updateTransform() {
        diagram.style.transform = \`translate(\${translateX}px, \${translateY}px) scale(\${scale})\`;
      }
    }
  </script>`;
  }
}

/**
 * Flowchart node definition
 */
export interface FlowchartNode {
  id: string;
  label: string;
  shape?: 'rectangle' | 'roundedge' | 'stadium' | 'subroutine' | 'cylinder' |
          'circle' | 'diamond' | 'hexagon' | 'parallelogram' | 'trapezoid';
  cssClass?: string;
  clickHandler?: string;
  tooltip?: string;
}

/**
 * Flowchart edge definition
 */
export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
  type?: 'solid' | 'dotted' | 'thick';
  thickness?: 'normal' | 'thick';
}

/**
 * Sequence diagram interaction
 */
export interface SequenceInteraction {
  from: string;
  to: string;
  message: string;
  type?: 'solid' | 'dotted' | 'async';
  activate?: boolean;
}

/**
 * State diagram node
 */
export interface StateNode {
  id: string;
  label: string;
  type?: 'normal' | 'start' | 'end';
  description?: string;
}

/**
 * State transition
 */
export interface StateTransition {
  from: string;
  to: string;
  condition?: string;
}

/**
 * Mindmap node
 */
export interface MindmapNode {
  label: string;
  children?: MindmapNode[];
}

/**
 * Gantt chart task
 */
export interface GanttTask {
  id?: string;
  name: string;
  section?: string;
  status?: 'active' | 'done' | 'crit' | 'milestone';
  startDate?: string;
  endDate?: string;
  duration?: string;
}
