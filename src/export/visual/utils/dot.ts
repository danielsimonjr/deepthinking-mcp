/**
 * DOT/GraphViz Utilities (v8.5.0)
 * Shared utility functions for DOT graph generation across all visual exporters
 * Phase 13: Added DOTGraphBuilder fluent API
 */

// =============================================================================
// Types
// =============================================================================

/** DOT rank direction */
export type DotRankDir = 'TB' | 'BT' | 'LR' | 'RL';

/** DOT node shapes */
export type DotNodeShape =
  | 'box'
  | 'ellipse'
  | 'circle'
  | 'oval'
  | 'diamond'
  | 'trapezium'
  | 'parallelogram'
  | 'house'
  | 'pentagon'
  | 'hexagon'
  | 'septagon'
  | 'octagon'
  | 'doublecircle'
  | 'doubleoctagon'
  | 'tripleoctagon'
  | 'invtriangle'
  | 'triangle'
  | 'star'
  | 'cylinder'
  | 'note'
  | 'tab'
  | 'folder'
  | 'component'
  | 'plaintext'
  | 'plain'
  | 'point'
  | 'record'
  | 'Mrecord';

/** DOT edge arrow shapes */
export type DotArrowHead =
  | 'normal'
  | 'inv'
  | 'dot'
  | 'invdot'
  | 'odot'
  | 'invodot'
  | 'none'
  | 'tee'
  | 'empty'
  | 'invempty'
  | 'diamond'
  | 'odiamond'
  | 'ediamond'
  | 'crow'
  | 'box'
  | 'obox'
  | 'open'
  | 'halfopen'
  | 'vee';

/** DOT edge style */
export type DotEdgeStyle = 'solid' | 'dashed' | 'dotted' | 'bold' | 'invis';

/** DOT node style */
export type DotNodeStyle =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'bold'
  | 'rounded'
  | 'diagonals'
  | 'filled'
  | 'striped'
  | 'wedged';

/** DOT node definition */
export interface DotNode {
  id: string;
  label?: string;
  shape?: DotNodeShape;
  style?: DotNodeStyle | DotNodeStyle[];
  fillColor?: string;
  color?: string;
  fontColor?: string;
  fontName?: string;
  fontSize?: number;
  width?: number;
  height?: number;
  tooltip?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

/** DOT edge definition */
export interface DotEdge {
  source: string;
  target: string;
  label?: string;
  style?: DotEdgeStyle;
  color?: string;
  fontColor?: string;
  arrowHead?: DotArrowHead;
  arrowTail?: DotArrowHead;
  constraint?: boolean;
  weight?: number;
  penWidth?: number;
  tooltip?: string;
}

/** DOT subgraph definition */
export interface DotSubgraph {
  id: string;
  label?: string;
  nodes: string[];
  style?: 'filled' | 'rounded' | 'dashed';
  fillColor?: string;
  color?: string;
  rank?: 'same' | 'min' | 'max' | 'source' | 'sink';
}

/** DOT graph options */
export interface DotOptions {
  graphType?: 'digraph' | 'graph';
  graphName?: string;
  rankDir?: DotRankDir;
  splines?: 'ortho' | 'polyline' | 'curved' | 'line' | 'spline' | 'true' | 'false';
  overlap?: boolean | 'scale' | 'false' | 'true' | 'compress';
  concentrate?: boolean;
  compound?: boolean;
  bgcolor?: string;
  fontName?: string;
  fontSize?: number;
  nodeDefaults?: Partial<DotNode>;
  edgeDefaults?: Partial<DotEdge>;
  includeLabels?: boolean;
}

// =============================================================================
// ID and String Utilities
// =============================================================================

/**
 * Sanitize an ID for use in DOT graphs
 * DOT IDs can be alphanumeric or quoted strings
 */
export function sanitizeDotId(id: string): string {
  // If ID is simple alphanumeric, return as-is
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(id)) {
    return id;
  }
  // Otherwise, quote it
  return `"${escapeDotString(id)}"`;
}

/**
 * Escape special characters in DOT strings
 */
export function escapeDotString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Truncate a label to a maximum length
 */
export function truncateDotLabel(label: string, maxLength: number = 50): string {
  if (label.length <= maxLength) return label;
  return label.substring(0, maxLength - 3) + '...';
}

// =============================================================================
// Attribute Rendering
// =============================================================================

/**
 * Render node attributes as a DOT attribute string
 */
export function renderDotNodeAttrs(node: DotNode): string {
  const attrs: string[] = [];

  if (node.label !== undefined) {
    attrs.push(`label="${escapeDotString(node.label)}"`);
  }
  if (node.shape) {
    attrs.push(`shape=${node.shape}`);
  }
  if (node.style) {
    const styleStr = Array.isArray(node.style) ? node.style.join(',') : node.style;
    attrs.push(`style="${styleStr}"`);
  }
  if (node.fillColor) {
    attrs.push(`fillcolor="${node.fillColor}"`);
  }
  if (node.color) {
    attrs.push(`color="${node.color}"`);
  }
  if (node.fontColor) {
    attrs.push(`fontcolor="${node.fontColor}"`);
  }
  if (node.fontName) {
    attrs.push(`fontname="${node.fontName}"`);
  }
  if (node.fontSize) {
    attrs.push(`fontsize=${node.fontSize}`);
  }
  if (node.width) {
    attrs.push(`width=${node.width}`);
  }
  if (node.height) {
    attrs.push(`height=${node.height}`);
  }
  if (node.tooltip) {
    attrs.push(`tooltip="${escapeDotString(node.tooltip)}"`);
  }
  if (node.url) {
    attrs.push(`URL="${escapeDotString(node.url)}"`);
  }

  return attrs.length > 0 ? ` [${attrs.join(', ')}]` : '';
}

/**
 * Render edge attributes as a DOT attribute string
 */
export function renderDotEdgeAttrs(edge: DotEdge): string {
  const attrs: string[] = [];

  if (edge.label) {
    attrs.push(`label="${escapeDotString(edge.label)}"`);
  }
  if (edge.style) {
    attrs.push(`style=${edge.style}`);
  }
  if (edge.color) {
    attrs.push(`color="${edge.color}"`);
  }
  if (edge.fontColor) {
    attrs.push(`fontcolor="${edge.fontColor}"`);
  }
  if (edge.arrowHead) {
    attrs.push(`arrowhead=${edge.arrowHead}`);
  }
  if (edge.arrowTail) {
    attrs.push(`arrowtail=${edge.arrowTail}`);
  }
  if (edge.constraint === false) {
    attrs.push('constraint=false');
  }
  if (edge.weight !== undefined) {
    attrs.push(`weight=${edge.weight}`);
  }
  if (edge.penWidth !== undefined) {
    attrs.push(`penwidth=${edge.penWidth}`);
  }
  if (edge.tooltip) {
    attrs.push(`tooltip="${escapeDotString(edge.tooltip)}"`);
  }

  return attrs.length > 0 ? ` [${attrs.join(', ')}]` : '';
}

// =============================================================================
// Node Rendering
// =============================================================================

/**
 * Render a single DOT node
 */
export function renderDotNode(node: DotNode): string {
  const id = sanitizeDotId(node.id);
  const attrs = renderDotNodeAttrs(node);
  return `  ${id}${attrs};`;
}

// =============================================================================
// Edge Rendering
// =============================================================================

/**
 * Render a single DOT edge
 */
export function renderDotEdge(edge: DotEdge, directed: boolean = true): string {
  const source = sanitizeDotId(edge.source);
  const target = sanitizeDotId(edge.target);
  const arrow = directed ? '->' : '--';
  const attrs = renderDotEdgeAttrs(edge);
  return `  ${source} ${arrow} ${target}${attrs};`;
}

// =============================================================================
// Subgraph Rendering
// =============================================================================

/**
 * Render a DOT subgraph (cluster)
 */
export function renderDotSubgraph(subgraph: DotSubgraph): string {
  const lines: string[] = [];
  const id = sanitizeDotId(`cluster_${subgraph.id}`);

  lines.push(`  subgraph ${id} {`);

  if (subgraph.label) {
    lines.push(`    label="${escapeDotString(subgraph.label)}";`);
  }
  if (subgraph.style) {
    lines.push(`    style=${subgraph.style};`);
  }
  if (subgraph.fillColor) {
    lines.push(`    fillcolor="${subgraph.fillColor}";`);
  }
  if (subgraph.color) {
    lines.push(`    color="${subgraph.color}";`);
  }
  if (subgraph.rank) {
    lines.push(`    rank=${subgraph.rank};`);
  }

  for (const nodeId of subgraph.nodes) {
    lines.push(`    ${sanitizeDotId(nodeId)};`);
  }

  lines.push('  }');

  return lines.join('\n');
}

// =============================================================================
// Color Utilities
// =============================================================================

/** DOT color palette */
export const DOT_COLORS = {
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
    primary: '#b0b0b0',
    secondary: '#909090',
    success: '#707070',
    warning: '#606060',
    danger: '#505050',
    info: '#404040',
    neutral: '#d0d0d0',
  },
};

/**
 * Get a color from the specified scheme
 */
export function getDotColor(
  type: keyof typeof DOT_COLORS.default,
  scheme: 'default' | 'pastel' | 'monochrome' = 'default'
): string {
  return DOT_COLORS[scheme][type];
}

// =============================================================================
// Complete Graph Generation
// =============================================================================

/**
 * Generate a complete DOT graph
 */
export function generateDotGraph(
  nodes: DotNode[],
  edges: DotEdge[],
  options: DotOptions = {}
): string {
  const {
    graphType = 'digraph',
    graphName = 'G',
    rankDir = 'TB',
    splines,
    overlap,
    concentrate,
    compound,
    bgcolor,
    fontName,
    fontSize,
    nodeDefaults,
    edgeDefaults,
  } = options;

  const lines: string[] = [];
  const directed = graphType === 'digraph';

  // Graph header
  lines.push(`${graphType} ${sanitizeDotId(graphName)} {`);

  // Graph attributes
  lines.push(`  rankdir=${rankDir};`);
  if (splines) lines.push(`  splines=${splines};`);
  if (overlap !== undefined) lines.push(`  overlap=${overlap};`);
  if (concentrate) lines.push('  concentrate=true;');
  if (compound) lines.push('  compound=true;');
  if (bgcolor) lines.push(`  bgcolor="${bgcolor}";`);
  if (fontName) lines.push(`  fontname="${fontName}";`);
  if (fontSize) lines.push(`  fontsize=${fontSize};`);

  // Node defaults
  if (nodeDefaults) {
    const defaultAttrs: string[] = [];
    if (nodeDefaults.shape) defaultAttrs.push(`shape=${nodeDefaults.shape}`);
    if (nodeDefaults.style) {
      const styleStr = Array.isArray(nodeDefaults.style)
        ? nodeDefaults.style.join(',')
        : nodeDefaults.style;
      defaultAttrs.push(`style="${styleStr}"`);
    }
    if (nodeDefaults.fillColor) defaultAttrs.push(`fillcolor="${nodeDefaults.fillColor}"`);
    if (nodeDefaults.fontName) defaultAttrs.push(`fontname="${nodeDefaults.fontName}"`);
    if (nodeDefaults.fontSize) defaultAttrs.push(`fontsize=${nodeDefaults.fontSize}`);
    if (defaultAttrs.length > 0) {
      lines.push(`  node [${defaultAttrs.join(', ')}];`);
    }
  }

  // Edge defaults
  if (edgeDefaults) {
    const defaultAttrs: string[] = [];
    if (edgeDefaults.style) defaultAttrs.push(`style=${edgeDefaults.style}`);
    if (edgeDefaults.color) defaultAttrs.push(`color="${edgeDefaults.color}"`);
    if (edgeDefaults.arrowHead) defaultAttrs.push(`arrowhead=${edgeDefaults.arrowHead}`);
    if (defaultAttrs.length > 0) {
      lines.push(`  edge [${defaultAttrs.join(', ')}];`);
    }
  }

  lines.push('');

  // Nodes
  for (const node of nodes) {
    lines.push(renderDotNode(node));
  }

  // Edges
  if (edges.length > 0) {
    lines.push('');
    for (const edge of edges) {
      lines.push(renderDotEdge(edge, directed));
    }
  }

  lines.push('}');

  return lines.join('\n');
}

/**
 * Generate a linear flow DOT graph
 */
export function generateLinearFlowDot(
  steps: string[],
  options: DotOptions = {}
): string {
  const { rankDir = 'TB' } = options;

  if (steps.length === 0) {
    return generateDotGraph(
      [{ id: 'empty', label: 'No steps', shape: 'box' }],
      [],
      { ...options, graphName: 'LinearFlow' }
    );
  }

  const nodes: DotNode[] = steps.map((step, index) => ({
    id: `step_${index}`,
    label: truncateDotLabel(step),
    shape: 'box',
    style: 'rounded',
    fillColor: index === 0
      ? DOT_COLORS.default.primary
      : index === steps.length - 1
        ? DOT_COLORS.default.success
        : DOT_COLORS.default.neutral,
  }));

  const edges: DotEdge[] = [];
  for (let i = 0; i < steps.length - 1; i++) {
    edges.push({
      source: `step_${i}`,
      target: `step_${i + 1}`,
    });
  }

  return generateDotGraph(nodes, edges, {
    ...options,
    graphName: 'LinearFlow',
    rankDir,
    nodeDefaults: { style: ['rounded', 'filled'] },
  });
}

/**
 * Generate a hierarchical/tree DOT graph
 */
export function generateHierarchyDot(
  root: { id: string; label: string; children?: Array<{ id: string; label: string; children?: unknown[] }> },
  options: DotOptions = {}
): string {
  const nodes: DotNode[] = [];
  const edges: DotEdge[] = [];

  function traverse(
    node: { id: string; label: string; children?: unknown[] },
    parentId?: string,
    depth: number = 0
  ): void {
    nodes.push({
      id: node.id,
      label: truncateDotLabel(node.label),
      shape: depth === 0 ? 'ellipse' : 'box',
      style: 'rounded',
    });

    if (parentId) {
      edges.push({
        source: parentId,
        target: node.id,
      });
    }

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children as Array<{ id: string; label: string; children?: unknown[] }>) {
        traverse(child, node.id, depth + 1);
      }
    }
  }

  traverse(root);

  return generateDotGraph(nodes, edges, {
    ...options,
    graphName: 'Hierarchy',
    nodeDefaults: { style: ['rounded', 'filled'], fillColor: DOT_COLORS.default.neutral },
  });
}

/**
 * Generate a network/graph DOT diagram
 */
export function generateNetworkDot(
  nodes: Array<{ id: string; label: string; group?: string }>,
  connections: Array<{ from: string; to: string; weight?: number }>,
  options: DotOptions = {}
): string {
  const dotNodes: DotNode[] = nodes.map(node => ({
    id: node.id,
    label: truncateDotLabel(node.label),
    shape: 'ellipse',
    style: 'filled',
    fillColor: node.group ? getDotColor('primary') : getDotColor('neutral'),
  }));

  const dotEdges: DotEdge[] = connections.map(conn => ({
    source: conn.from,
    target: conn.to,
    label: conn.weight !== undefined ? conn.weight.toFixed(2) : undefined,
    penWidth: conn.weight !== undefined ? Math.max(1, conn.weight * 3) : undefined,
  }));

  return generateDotGraph(dotNodes, dotEdges, {
    ...options,
    graphName: 'Network',
    splines: 'spline',
    overlap: 'scale',
  });
}

// =============================================================================
// DOTGraphBuilder - Fluent API Builder Class (Phase 13)
// =============================================================================

/**
 * Fluent API builder for DOT graphs
 *
 * Provides a chainable interface for constructing DOT graphs,
 * wrapping the existing utility functions for easier use.
 *
 * @example
 * ```typescript
 * const dot = new DOTGraphBuilder()
 *   .setOptions({ rankDir: 'LR', graphName: 'MyGraph' })
 *   .addNode({ id: 'a', label: 'Node A', shape: 'box' })
 *   .addNode({ id: 'b', label: 'Node B', shape: 'ellipse' })
 *   .addEdge({ source: 'a', target: 'b', label: 'connects' })
 *   .render();
 * ```
 */
export class DOTGraphBuilder {
  private nodes: DotNode[] = [];
  private edges: DotEdge[] = [];
  private subgraphs: DotSubgraph[] = [];
  private options: DotOptions = {};

  /**
   * Add a node to the graph
   * @param node - The node definition
   * @returns this for chaining
   */
  addNode(node: DotNode): this {
    this.nodes.push(node);
    return this;
  }

  /**
   * Add multiple nodes to the graph
   * @param nodes - Array of node definitions
   * @returns this for chaining
   */
  addNodes(nodes: DotNode[]): this {
    this.nodes.push(...nodes);
    return this;
  }

  /**
   * Add an edge to the graph
   * @param edge - The edge definition
   * @returns this for chaining
   */
  addEdge(edge: DotEdge): this {
    this.edges.push(edge);
    return this;
  }

  /**
   * Add multiple edges to the graph
   * @param edges - Array of edge definitions
   * @returns this for chaining
   */
  addEdges(edges: DotEdge[]): this {
    this.edges.push(...edges);
    return this;
  }

  /**
   * Add a subgraph (cluster) to the graph
   * @param subgraph - The subgraph definition
   * @returns this for chaining
   */
  addSubgraph(subgraph: DotSubgraph): this {
    this.subgraphs.push(subgraph);
    return this;
  }

  /**
   * Add multiple subgraphs to the graph
   * @param subgraphs - Array of subgraph definitions
   * @returns this for chaining
   */
  addSubgraphs(subgraphs: DotSubgraph[]): this {
    this.subgraphs.push(...subgraphs);
    return this;
  }

  /**
   * Set or merge graph options
   * @param options - Graph options to set/merge
   * @returns this for chaining
   */
  setOptions(options: DotOptions): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Set the graph name
   * @param name - The graph name
   * @returns this for chaining
   */
  setGraphName(name: string): this {
    this.options.graphName = name;
    return this;
  }

  /**
   * Set the rank direction
   * @param direction - The rank direction (TB, BT, LR, RL)
   * @returns this for chaining
   */
  setRankDir(direction: DotRankDir): this {
    this.options.rankDir = direction;
    return this;
  }

  /**
   * Set whether the graph is directed
   * @param directed - true for digraph, false for graph
   * @returns this for chaining
   */
  setDirected(directed: boolean): this {
    this.options.graphType = directed ? 'digraph' : 'graph';
    return this;
  }

  /**
   * Set default node attributes
   * @param defaults - Default node attributes
   * @returns this for chaining
   */
  setNodeDefaults(defaults: Partial<DotNode>): this {
    this.options.nodeDefaults = defaults;
    return this;
  }

  /**
   * Set default edge attributes
   * @param defaults - Default edge attributes
   * @returns this for chaining
   */
  setEdgeDefaults(defaults: Partial<DotEdge>): this {
    this.options.edgeDefaults = defaults;
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
   * Render the graph as a DOT string
   *
   * If subgraphs are present, they are rendered inline within the graph.
   * Nodes not in subgraphs are rendered first, followed by subgraphs,
   * then edges.
   *
   * @returns The complete DOT graph string
   */
  render(): string {
    const {
      graphType = 'digraph',
      graphName = 'G',
      rankDir = 'TB',
      splines,
      overlap,
      concentrate,
      compound,
      bgcolor,
      fontName,
      fontSize,
      nodeDefaults,
      edgeDefaults,
    } = this.options;

    const lines: string[] = [];
    const directed = graphType === 'digraph';

    // Graph header
    lines.push(`${graphType} ${sanitizeDotId(graphName)} {`);

    // Graph attributes
    lines.push(`  rankdir=${rankDir};`);
    if (splines) lines.push(`  splines=${splines};`);
    if (overlap !== undefined) lines.push(`  overlap=${overlap};`);
    if (concentrate) lines.push('  concentrate=true;');
    if (compound) lines.push('  compound=true;');
    if (bgcolor) lines.push(`  bgcolor="${bgcolor}";`);
    if (fontName) lines.push(`  fontname="${fontName}";`);
    if (fontSize) lines.push(`  fontsize=${fontSize};`);

    // Node defaults
    if (nodeDefaults) {
      const defaultAttrs: string[] = [];
      if (nodeDefaults.shape) defaultAttrs.push(`shape=${nodeDefaults.shape}`);
      if (nodeDefaults.style) {
        const styleStr = Array.isArray(nodeDefaults.style)
          ? nodeDefaults.style.join(',')
          : nodeDefaults.style;
        defaultAttrs.push(`style="${styleStr}"`);
      }
      if (nodeDefaults.fillColor) defaultAttrs.push(`fillcolor="${nodeDefaults.fillColor}"`);
      if (nodeDefaults.fontName) defaultAttrs.push(`fontname="${nodeDefaults.fontName}"`);
      if (nodeDefaults.fontSize) defaultAttrs.push(`fontsize=${nodeDefaults.fontSize}`);
      if (defaultAttrs.length > 0) {
        lines.push(`  node [${defaultAttrs.join(', ')}];`);
      }
    }

    // Edge defaults
    if (edgeDefaults) {
      const defaultAttrs: string[] = [];
      if (edgeDefaults.style) defaultAttrs.push(`style=${edgeDefaults.style}`);
      if (edgeDefaults.color) defaultAttrs.push(`color="${edgeDefaults.color}"`);
      if (edgeDefaults.arrowHead) defaultAttrs.push(`arrowhead=${edgeDefaults.arrowHead}`);
      if (defaultAttrs.length > 0) {
        lines.push(`  edge [${defaultAttrs.join(', ')}];`);
      }
    }

    lines.push('');

    // Collect node IDs that are in subgraphs
    const nodesInSubgraphs = new Set<string>();
    for (const subgraph of this.subgraphs) {
      for (const nodeId of subgraph.nodes) {
        nodesInSubgraphs.add(nodeId);
      }
    }

    // Render nodes not in subgraphs
    for (const node of this.nodes) {
      if (!nodesInSubgraphs.has(node.id)) {
        lines.push(renderDotNode(node));
      }
    }

    // Render subgraphs with their nodes
    if (this.subgraphs.length > 0) {
      lines.push('');
      for (const subgraph of this.subgraphs) {
        // Find full node definitions for nodes in this subgraph
        const subgraphNodeDefs = this.nodes.filter(n => subgraph.nodes.includes(n.id));

        lines.push(`  subgraph ${sanitizeDotId(`cluster_${subgraph.id}`)} {`);
        if (subgraph.label) {
          lines.push(`    label="${escapeDotString(subgraph.label)}";`);
        }
        if (subgraph.style) {
          lines.push(`    style=${subgraph.style};`);
        }
        if (subgraph.fillColor) {
          lines.push(`    fillcolor="${subgraph.fillColor}";`);
        }
        if (subgraph.color) {
          lines.push(`    color="${subgraph.color}";`);
        }
        if (subgraph.rank) {
          lines.push(`    rank=${subgraph.rank};`);
        }

        // Render node definitions within the subgraph
        for (const node of subgraphNodeDefs) {
          const nodeStr = renderDotNode(node);
          // Adjust indentation for subgraph context
          lines.push(`  ${nodeStr}`);
        }

        // Also include any nodes specified by ID only (not in nodes array)
        for (const nodeId of subgraph.nodes) {
          if (!subgraphNodeDefs.find(n => n.id === nodeId)) {
            lines.push(`    ${sanitizeDotId(nodeId)};`);
          }
        }

        lines.push('  }');
      }
    }

    // Edges
    if (this.edges.length > 0) {
      lines.push('');
      for (const edge of this.edges) {
        lines.push(renderDotEdge(edge, directed));
      }
    }

    lines.push('}');

    return lines.join('\n');
  }

  /**
   * Create a builder from existing nodes, edges, and options
   * Useful for modifying existing graph structures
   * @param nodes - Initial nodes
   * @param edges - Initial edges
   * @param options - Initial options
   * @returns A new DOTGraphBuilder instance
   */
  static from(
    nodes: DotNode[] = [],
    edges: DotEdge[] = [],
    options: DotOptions = {}
  ): DOTGraphBuilder {
    const builder = new DOTGraphBuilder();
    builder.nodes = [...nodes];
    builder.edges = [...edges];
    builder.options = { ...options };
    return builder;
  }
}
