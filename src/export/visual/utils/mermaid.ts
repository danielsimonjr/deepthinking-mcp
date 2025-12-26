/**
 * Mermaid Utilities (v8.5.0)
 * Shared utility functions for Mermaid diagram generation across all visual exporters
 * Phase 13: Added MermaidGraphBuilder fluent API
 */

// =============================================================================
// Types
// =============================================================================

/** Mermaid graph direction */
export type MermaidDirection = 'TD' | 'TB' | 'LR' | 'RL' | 'BT';

/** Mermaid node shape identifiers */
export type MermaidNodeShape =
  | 'rectangle'      // [label]
  | 'rounded'        // (label)
  | 'stadium'        // ([label])
  | 'subroutine'     // [[label]]
  | 'cylinder'       // [(label)]
  | 'circle'         // ((label))
  | 'asymmetric'     // >label]
  | 'rhombus'        // {label}
  | 'hexagon'        // {{label}}
  | 'parallelogram'  // [/label/]
  | 'parallelogram-alt' // [\label\]
  | 'trapezoid'      // [/label\]
  | 'trapezoid-alt'  // [\label/]
  | 'double-circle'; // (((label)))

/** Mermaid edge/link style */
export type MermaidEdgeStyle =
  | 'arrow'          // -->
  | 'open'           // ---
  | 'dotted'         // -.->
  | 'thick'          // ==>
  | 'invisible';     // ~~~

/** Mermaid node definition */
export interface MermaidNode {
  id: string;
  label: string;
  shape?: MermaidNodeShape;
  style?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: string;
    color?: string;
  };
  className?: string;
}

/** Mermaid edge definition */
export interface MermaidEdge {
  source: string;
  target: string;
  style?: MermaidEdgeStyle;
  label?: string;
  labelPosition?: 'middle' | 'start' | 'end';
}

/** Mermaid subgraph definition */
export interface MermaidSubgraph {
  id: string;
  label: string;
  nodes: string[];
  direction?: MermaidDirection;
}

/** Mermaid diagram options */
export interface MermaidOptions {
  direction?: MermaidDirection;
  title?: string;
  includeLabels?: boolean;
  colorScheme?: 'default' | 'pastel' | 'monochrome';
}

// =============================================================================
// ID and String Utilities
// =============================================================================

/**
 * Sanitize an ID for use in Mermaid diagrams
 * Mermaid IDs should be alphanumeric with underscores
 */
export function sanitizeMermaidId(id: string): string {
  return id
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^(\d)/, '_$1')
    .replace(/__+/g, '_')
    .replace(/^_+|_+$/g, '') || 'node';
}

/**
 * Escape special characters in Mermaid labels
 * Handles quotes and special markdown characters
 */
export function escapeMermaidLabel(label: string): string {
  return label
    .replace(/"/g, '#quot;')
    .replace(/</g, '#lt;')
    .replace(/>/g, '#gt;')
    .replace(/\[/g, '#91;')
    .replace(/\]/g, '#93;')
    .replace(/\{/g, '#123;')
    .replace(/\}/g, '#125;')
    .replace(/\(/g, '#40;')
    .replace(/\)/g, '#41;')
    .replace(/\|/g, '#124;')
    .replace(/\n/g, '<br/>');
}

/**
 * Truncate a label to a maximum length
 */
export function truncateLabel(label: string, maxLength: number = 40): string {
  if (label.length <= maxLength) return label;
  return label.substring(0, maxLength - 3) + '...';
}

// =============================================================================
// Node Shape Rendering
// =============================================================================

/**
 * Get the opening and closing brackets for a node shape
 */
export function getNodeShapeBrackets(shape: MermaidNodeShape): [string, string] {
  switch (shape) {
    case 'rectangle':
      return ['[', ']'];
    case 'rounded':
      return ['(', ')'];
    case 'stadium':
      return ['([', '])'];
    case 'subroutine':
      return ['[[', ']]'];
    case 'cylinder':
      return ['[(', ')]'];
    case 'circle':
      return ['((', '))'];
    case 'asymmetric':
      return ['>', ']'];
    case 'rhombus':
      return ['{', '}'];
    case 'hexagon':
      return ['{{', '}}'];
    case 'parallelogram':
      return ['[/', '/]'];
    case 'parallelogram-alt':
      return ['[\\', '\\]'];
    case 'trapezoid':
      return ['[/', '\\]'];
    case 'trapezoid-alt':
      return ['[\\', '/]'];
    case 'double-circle':
      return ['(((', ')))'];
    default:
      return ['[', ']'];
  }
}

/**
 * Render a single Mermaid node
 */
export function renderMermaidNode(node: MermaidNode): string {
  const id = sanitizeMermaidId(node.id);
  const label = escapeMermaidLabel(node.label);
  const [open, close] = getNodeShapeBrackets(node.shape || 'rectangle');

  let nodeStr = `  ${id}${open}"${label}"${close}`;

  if (node.className) {
    nodeStr += `:::${node.className}`;
  }

  return nodeStr;
}

/**
 * Render a node style definition
 */
export function renderMermaidNodeStyle(nodeId: string, style: MermaidNode['style']): string {
  if (!style) return '';

  const id = sanitizeMermaidId(nodeId);
  const styles: string[] = [];

  if (style.fill) styles.push(`fill:${style.fill}`);
  if (style.stroke) styles.push(`stroke:${style.stroke}`);
  if (style.strokeWidth) styles.push(`stroke-width:${style.strokeWidth}`);
  if (style.color) styles.push(`color:${style.color}`);

  if (styles.length === 0) return '';
  return `  style ${id} ${styles.join(',')}`;
}

// =============================================================================
// Edge Rendering
// =============================================================================

/**
 * Get the arrow syntax for an edge style
 */
export function getEdgeArrow(style: MermaidEdgeStyle): string {
  switch (style) {
    case 'arrow':
      return '-->';
    case 'open':
      return '---';
    case 'dotted':
      return '-.->';
    case 'thick':
      return '==>';
    case 'invisible':
      return '~~~';
    default:
      return '-->';
  }
}

/**
 * Render a single Mermaid edge
 */
export function renderMermaidEdge(edge: MermaidEdge): string {
  const source = sanitizeMermaidId(edge.source);
  const target = sanitizeMermaidId(edge.target);
  const arrow = getEdgeArrow(edge.style || 'arrow');

  if (edge.label) {
    const label = escapeMermaidLabel(edge.label);
    return `  ${source} ${arrow}|${label}| ${target}`;
  }

  return `  ${source} ${arrow} ${target}`;
}

// =============================================================================
// Subgraph Rendering
// =============================================================================

/**
 * Render a Mermaid subgraph
 */
export function renderMermaidSubgraph(subgraph: MermaidSubgraph): string {
  const lines: string[] = [];
  const id = sanitizeMermaidId(subgraph.id);
  const label = escapeMermaidLabel(subgraph.label);

  lines.push(`  subgraph ${id}["${label}"]`);

  if (subgraph.direction) {
    lines.push(`    direction ${subgraph.direction}`);
  }

  for (const nodeId of subgraph.nodes) {
    lines.push(`    ${sanitizeMermaidId(nodeId)}`);
  }

  lines.push('  end');

  return lines.join('\n');
}

// =============================================================================
// Color Utilities
// =============================================================================

/** Color palettes for different schemes */
export const MERMAID_COLORS = {
  default: {
    primary: '#a8d5ff',
    secondary: '#ffd699',
    success: '#81c784',
    warning: '#ffb74d',
    danger: '#e57373',
    info: '#4fc3f7',
    neutral: '#e0e0e0',
  },
  pastel: {
    primary: '#e1f5ff',
    secondary: '#fff3e0',
    success: '#c8e6c9',
    warning: '#ffecb3',
    danger: '#ffcdd2',
    info: '#b3e5fc',
    neutral: '#f5f5f5',
  },
  monochrome: {
    primary: '#e0e0e0',
    secondary: '#bdbdbd',
    success: '#9e9e9e',
    warning: '#757575',
    danger: '#616161',
    info: '#424242',
    neutral: '#f5f5f5',
  },
};

/**
 * Get a color from the specified scheme
 */
export function getMermaidColor(
  type: keyof typeof MERMAID_COLORS.default,
  scheme: 'default' | 'pastel' | 'monochrome' = 'default'
): string {
  return MERMAID_COLORS[scheme][type];
}

// =============================================================================
// Complete Diagram Generation
// =============================================================================

/**
 * Generate a complete Mermaid flowchart diagram
 */
export function generateMermaidFlowchart(
  nodes: MermaidNode[],
  edges: MermaidEdge[],
  options: MermaidOptions = {}
): string {
  const { direction = 'TD', colorScheme = 'default' } = options;
  const lines: string[] = [];

  // Header
  lines.push(`graph ${direction}`);

  // Nodes
  if (nodes.length > 0) {
    lines.push('');
    for (const node of nodes) {
      lines.push(renderMermaidNode(node));
    }
  }

  // Edges
  if (edges.length > 0) {
    lines.push('');
    for (const edge of edges) {
      lines.push(renderMermaidEdge(edge));
    }
  }

  // Styles
  if (colorScheme !== 'monochrome') {
    const styledNodes = nodes.filter(n => n.style);
    if (styledNodes.length > 0) {
      lines.push('');
      for (const node of styledNodes) {
        const styleStr = renderMermaidNodeStyle(node.id, node.style);
        if (styleStr) lines.push(styleStr);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Generate a linear flow diagram (start -> step1 -> step2 -> ... -> end)
 */
export function generateLinearFlowMermaid(
  steps: string[],
  options: MermaidOptions = {}
): string {
  const { direction = 'TD', colorScheme = 'default' } = options;

  if (steps.length === 0) {
    return `graph ${direction}\n  Empty["No steps"]`;
  }

  const nodes: MermaidNode[] = steps.map((step, index) => ({
    id: `step_${index}`,
    label: truncateLabel(step),
    shape: index === 0 ? 'stadium' : index === steps.length - 1 ? 'stadium' : 'rectangle',
    style: {
      fill: index === 0
        ? getMermaidColor('primary', colorScheme)
        : index === steps.length - 1
          ? getMermaidColor('success', colorScheme)
          : undefined,
    },
  }));

  const edges: MermaidEdge[] = [];
  for (let i = 0; i < steps.length - 1; i++) {
    edges.push({
      source: `step_${i}`,
      target: `step_${i + 1}`,
      style: 'arrow',
    });
  }

  return generateMermaidFlowchart(nodes, edges, options);
}

/**
 * Generate a hierarchical/tree diagram
 */
export function generateHierarchyMermaid(
  root: { id: string; label: string; children?: Array<{ id: string; label: string; children?: unknown[] }> },
  options: MermaidOptions = {}
): string {
  const { direction = 'TD' } = options;
  const nodes: MermaidNode[] = [];
  const edges: MermaidEdge[] = [];

  function traverse(
    node: { id: string; label: string; children?: unknown[] },
    parentId?: string
  ): void {
    nodes.push({
      id: node.id,
      label: truncateLabel(node.label),
      shape: parentId ? 'rectangle' : 'stadium',
    });

    if (parentId) {
      edges.push({
        source: parentId,
        target: node.id,
        style: 'arrow',
      });
    }

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children as Array<{ id: string; label: string; children?: unknown[] }>) {
        traverse(child, node.id);
      }
    }
  }

  traverse(root);
  return generateMermaidFlowchart(nodes, edges, { ...options, direction });
}

/**
 * Generate a state diagram
 */
export function generateMermaidStateDiagram(
  states: Array<{ id: string; label: string; type?: 'start' | 'end' | 'normal' | 'choice' }>,
  transitions: Array<{ from: string; to: string; label?: string }>
): string {
  const lines: string[] = ['stateDiagram-v2'];

  // Define states
  for (const state of states) {
    if (state.type === 'start') {
      lines.push(`  [*] --> ${sanitizeMermaidId(state.id)}`);
    } else if (state.type === 'end') {
      lines.push(`  ${sanitizeMermaidId(state.id)} --> [*]`);
    }

    if (state.type !== 'start' && state.type !== 'end') {
      lines.push(`  ${sanitizeMermaidId(state.id)} : ${escapeMermaidLabel(state.label)}`);
    }
  }

  // Define transitions
  lines.push('');
  for (const trans of transitions) {
    const from = sanitizeMermaidId(trans.from);
    const to = sanitizeMermaidId(trans.to);
    if (trans.label) {
      lines.push(`  ${from} --> ${to} : ${escapeMermaidLabel(trans.label)}`);
    } else {
      lines.push(`  ${from} --> ${to}`);
    }
  }

  return lines.join('\n');
}

/**
 * Generate a class diagram
 */
export function generateMermaidClassDiagram(
  classes: Array<{
    name: string;
    attributes?: string[];
    methods?: string[];
  }>,
  relationships: Array<{
    from: string;
    to: string;
    type: 'inheritance' | 'composition' | 'aggregation' | 'association' | 'dependency';
    label?: string;
  }>
): string {
  const lines: string[] = ['classDiagram'];

  // Define classes
  for (const cls of classes) {
    lines.push(`  class ${sanitizeMermaidId(cls.name)} {`);
    if (cls.attributes) {
      for (const attr of cls.attributes) {
        lines.push(`    ${attr}`);
      }
    }
    if (cls.methods) {
      for (const method of cls.methods) {
        lines.push(`    ${method}`);
      }
    }
    lines.push('  }');
  }

  // Define relationships
  lines.push('');
  for (const rel of relationships) {
    const from = sanitizeMermaidId(rel.from);
    const to = sanitizeMermaidId(rel.to);
    let arrow: string;
    switch (rel.type) {
      case 'inheritance':
        arrow = '<|--';
        break;
      case 'composition':
        arrow = '*--';
        break;
      case 'aggregation':
        arrow = 'o--';
        break;
      case 'association':
        arrow = '-->';
        break;
      case 'dependency':
        arrow = '..>';
        break;
      default:
        arrow = '-->';
    }
    if (rel.label) {
      lines.push(`  ${from} ${arrow} ${to} : ${escapeMermaidLabel(rel.label)}`);
    } else {
      lines.push(`  ${from} ${arrow} ${to}`);
    }
  }

  return lines.join('\n');
}

// =============================================================================
// MermaidGraphBuilder - Fluent API Builder Class (Phase 13)
// =============================================================================

/**
 * Fluent API builder for Mermaid diagrams
 *
 * Provides a chainable interface for constructing Mermaid flowchart diagrams,
 * wrapping the existing utility functions for easier use.
 *
 * @example
 * ```typescript
 * const mermaid = new MermaidGraphBuilder()
 *   .setDirection('LR')
 *   .addNode({ id: 'a', label: 'Start', shape: 'stadium' })
 *   .addNode({ id: 'b', label: 'Process', shape: 'rectangle' })
 *   .addEdge({ source: 'a', target: 'b', style: 'arrow' })
 *   .render();
 * ```
 */
export class MermaidGraphBuilder {
  private nodes: MermaidNode[] = [];
  private edges: MermaidEdge[] = [];
  private subgraphs: MermaidSubgraph[] = [];
  private options: MermaidOptions = {};

  /**
   * Add a node to the diagram
   * @param node - The node definition
   * @returns this for chaining
   */
  addNode(node: MermaidNode): this {
    this.nodes.push(node);
    return this;
  }

  /**
   * Add multiple nodes to the diagram
   * @param nodes - Array of node definitions
   * @returns this for chaining
   */
  addNodes(nodes: MermaidNode[]): this {
    this.nodes.push(...nodes);
    return this;
  }

  /**
   * Add an edge to the diagram
   * @param edge - The edge definition
   * @returns this for chaining
   */
  addEdge(edge: MermaidEdge): this {
    this.edges.push(edge);
    return this;
  }

  /**
   * Add multiple edges to the diagram
   * @param edges - Array of edge definitions
   * @returns this for chaining
   */
  addEdges(edges: MermaidEdge[]): this {
    this.edges.push(...edges);
    return this;
  }

  /**
   * Add a subgraph to the diagram
   * @param id - Subgraph ID
   * @param label - Subgraph label/title
   * @param nodeIds - Array of node IDs to include in the subgraph
   * @param direction - Optional direction for the subgraph
   * @returns this for chaining
   */
  addSubgraph(id: string, label: string, nodeIds: string[], direction?: MermaidDirection): this {
    this.subgraphs.push({
      id,
      label,
      nodes: nodeIds,
      direction,
    });
    return this;
  }

  /**
   * Add a subgraph object to the diagram
   * @param subgraph - The subgraph definition
   * @returns this for chaining
   */
  addSubgraphDef(subgraph: MermaidSubgraph): this {
    this.subgraphs.push(subgraph);
    return this;
  }

  /**
   * Add multiple subgraphs to the diagram
   * @param subgraphs - Array of subgraph definitions
   * @returns this for chaining
   */
  addSubgraphs(subgraphs: MermaidSubgraph[]): this {
    this.subgraphs.push(...subgraphs);
    return this;
  }

  /**
   * Set or merge diagram options
   * @param options - Diagram options to set/merge
   * @returns this for chaining
   */
  setOptions(options: MermaidOptions): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Set the diagram direction
   * @param direction - The direction (TD, TB, LR, RL, BT)
   * @returns this for chaining
   */
  setDirection(direction: MermaidDirection): this {
    this.options.direction = direction;
    return this;
  }

  /**
   * Set the diagram title
   * @param title - The title
   * @returns this for chaining
   */
  setTitle(title: string): this {
    this.options.title = title;
    return this;
  }

  /**
   * Set the color scheme
   * @param scheme - The color scheme (default, pastel, monochrome)
   * @returns this for chaining
   */
  setColorScheme(scheme: 'default' | 'pastel' | 'monochrome'): this {
    this.options.colorScheme = scheme;
    return this;
  }

  /**
   * Get the current node count
   */
  get nodeCount(): number {
    return this.nodes.length;
  }

  /**
   * Get the current edge count
   */
  get edgeCount(): number {
    return this.edges.length;
  }

  /**
   * Get the current subgraph count
   */
  get subgraphCount(): number {
    return this.subgraphs.length;
  }

  /**
   * Clear all nodes, edges, and subgraphs
   * @returns this for chaining
   */
  clear(): this {
    this.nodes = [];
    this.edges = [];
    this.subgraphs = [];
    return this;
  }

  /**
   * Reset options to defaults
   * @returns this for chaining
   */
  resetOptions(): this {
    this.options = {};
    return this;
  }

  /**
   * Render the diagram as a Mermaid string
   *
   * If subgraphs are present, nodes are organized into their
   * respective subgraphs. Nodes not in any subgraph are rendered
   * at the top level.
   *
   * @returns The complete Mermaid diagram string
   */
  render(): string {
    const { direction = 'TD', colorScheme = 'default' } = this.options;
    const lines: string[] = [];

    // Header
    lines.push(`graph ${direction}`);

    // Collect node IDs that are in subgraphs
    const nodesInSubgraphs = new Set<string>();
    for (const subgraph of this.subgraphs) {
      for (const nodeId of subgraph.nodes) {
        nodesInSubgraphs.add(nodeId);
      }
    }

    // Render nodes not in subgraphs
    const topLevelNodes = this.nodes.filter(n => !nodesInSubgraphs.has(n.id));
    if (topLevelNodes.length > 0) {
      lines.push('');
      for (const node of topLevelNodes) {
        lines.push(renderMermaidNode(node));
      }
    }

    // Render subgraphs
    if (this.subgraphs.length > 0) {
      lines.push('');
      for (const subgraph of this.subgraphs) {
        lines.push(renderMermaidSubgraph(subgraph));

        // Find and render full node definitions for nodes in this subgraph
        const subgraphNodes = this.nodes.filter(n => subgraph.nodes.includes(n.id));
        for (const node of subgraphNodes) {
          // Render node inside subgraph context (add extra indent)
          const nodeStr = renderMermaidNode(node);
          lines.push(`  ${nodeStr}`);
        }
      }
    }

    // Render edges
    if (this.edges.length > 0) {
      lines.push('');
      for (const edge of this.edges) {
        lines.push(renderMermaidEdge(edge));
      }
    }

    // Render styles
    if (colorScheme !== 'monochrome') {
      const styledNodes = this.nodes.filter(n => n.style);
      if (styledNodes.length > 0) {
        lines.push('');
        for (const node of styledNodes) {
          const styleStr = renderMermaidNodeStyle(node.id, node.style);
          if (styleStr) lines.push(styleStr);
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Render as a state diagram instead of flowchart
   * @param states - State definitions with optional types
   * @param transitions - Transition definitions
   * @returns The Mermaid state diagram string
   */
  renderAsStateDiagram(
    states: Array<{ id: string; label: string; type?: 'start' | 'end' | 'normal' | 'choice' }>,
    transitions: Array<{ from: string; to: string; label?: string }>
  ): string {
    return generateMermaidStateDiagram(states, transitions);
  }

  /**
   * Render as a class diagram
   * @param classes - Class definitions
   * @param relationships - Relationship definitions
   * @returns The Mermaid class diagram string
   */
  renderAsClassDiagram(
    classes: Array<{ name: string; attributes?: string[]; methods?: string[] }>,
    relationships: Array<{
      from: string;
      to: string;
      type: 'inheritance' | 'composition' | 'aggregation' | 'association' | 'dependency';
      label?: string;
    }>
  ): string {
    return generateMermaidClassDiagram(classes, relationships);
  }

  /**
   * Create a builder from existing nodes, edges, and options
   * Useful for modifying existing diagram structures
   * @param nodes - Initial nodes
   * @param edges - Initial edges
   * @param options - Initial options
   * @returns A new MermaidGraphBuilder instance
   */
  static from(
    nodes: MermaidNode[] = [],
    edges: MermaidEdge[] = [],
    options: MermaidOptions = {}
  ): MermaidGraphBuilder {
    const builder = new MermaidGraphBuilder();
    builder.nodes = [...nodes];
    builder.edges = [...edges];
    builder.options = { ...options };
    return builder;
  }
}
