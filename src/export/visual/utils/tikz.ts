/**
 * TikZ Export Utilities (v8.5.0)
 * Phase 9: Shared TikZ/LaTeX generation utilities for all visual exporters
 * Phase 13: Added TikZBuilder fluent API
 *
 * TikZ is a LaTeX package for creating high-quality graphics, commonly used in:
 * - Academic papers and publications
 * - Technical documentation
 * - Presentations (Beamer)
 * - Books and theses
 */

export interface TikZNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
  type?: string;
  shape?: 'rectangle' | 'circle' | 'ellipse' | 'diamond' | 'rounded' | 'stadium';
  metadata?: Record<string, unknown>;
}

export interface TikZEdge {
  source: string;
  target: string;
  label?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  directed?: boolean;
  bend?: 'left' | 'right' | number;
}

export interface TikZOptions {
  standalone?: boolean;
  includeLabels?: boolean;
  includeMetrics?: boolean;
  colorScheme?: 'default' | 'pastel' | 'monochrome';
  title?: string;
  scale?: number;
  nodeDistance?: string;
  levelDistance?: string;
}

export const DEFAULT_TIKZ_OPTIONS: TikZOptions = {
  standalone: false,
  includeLabels: true,
  includeMetrics: true,
  colorScheme: 'default',
  scale: 1,
  nodeDistance: '2cm',
  levelDistance: '1.5cm',
};

// Color palettes for TikZ
const COLOR_PALETTES = {
  default: {
    primary: { fill: 'blue!20', stroke: 'blue!60' },
    secondary: { fill: 'green!20', stroke: 'green!60' },
    tertiary: { fill: 'orange!20', stroke: 'orange!60' },
    neutral: { fill: 'gray!20', stroke: 'gray!60' },
    success: { fill: 'green!30', stroke: 'green!70' },
    warning: { fill: 'yellow!30', stroke: 'yellow!70' },
    danger: { fill: 'red!20', stroke: 'red!60' },
    info: { fill: 'cyan!20', stroke: 'cyan!60' },
  },
  pastel: {
    primary: { fill: 'blue!10', stroke: 'blue!40' },
    secondary: { fill: 'green!10', stroke: 'green!40' },
    tertiary: { fill: 'orange!10', stroke: 'orange!40' },
    neutral: { fill: 'gray!10', stroke: 'gray!40' },
    success: { fill: 'green!15', stroke: 'green!50' },
    warning: { fill: 'yellow!15', stroke: 'yellow!50' },
    danger: { fill: 'red!10', stroke: 'red!40' },
    info: { fill: 'cyan!10', stroke: 'cyan!40' },
  },
  monochrome: {
    primary: { fill: 'black!10', stroke: 'black!60' },
    secondary: { fill: 'black!15', stroke: 'black!70' },
    tertiary: { fill: 'black!20', stroke: 'black!80' },
    neutral: { fill: 'black!5', stroke: 'black!50' },
    success: { fill: 'black!10', stroke: 'black!60' },
    warning: { fill: 'black!15', stroke: 'black!70' },
    danger: { fill: 'black!20', stroke: 'black!80' },
    info: { fill: 'black!10', stroke: 'black!60' },
  },
};

/**
 * Get TikZ colors for a node type
 */
export function getTikZColor(
  nodeType: string,
  colorScheme: 'default' | 'pastel' | 'monochrome' = 'default'
): { fill: string; stroke: string } {
  const palette = COLOR_PALETTES[colorScheme] || COLOR_PALETTES.default;
  const colorMap: Record<string, keyof typeof palette> = {
    primary: 'primary',
    secondary: 'secondary',
    tertiary: 'tertiary',
    neutral: 'neutral',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'info',
    cause: 'primary',
    effect: 'tertiary',
    mediator: 'secondary',
    confounder: 'warning',
    root: 'primary',
    current: 'primary',
    terminal: 'success',
    hypothesis: 'info',
    evidence: 'secondary',
    conclusion: 'success',
  };

  const key = colorMap[nodeType] || 'neutral';
  return palette[key];
}

/**
 * Escape special LaTeX characters
 */
export function escapeLatex(str: string): string {
  return str
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/&/g, '\\&')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/~/g, '\\textasciitilde{}');
}

/**
 * Generate TikZ document header with required packages
 */
export function generateTikZHeader(options: TikZOptions = {}): string {
  const { standalone = false, title, scale = 1 } = options;

  let header = '';

  if (standalone) {
    header += `\\documentclass[tikz,border=10pt]{standalone}
\\usepackage{tikz}
\\usetikzlibrary{shapes,arrows,positioning,calc,backgrounds,fit}
\\begin{document}
`;
  }

  header += `\\begin{tikzpicture}[
  scale=${scale},
  every node/.style={font=\\small},
  box/.style={rectangle, draw, rounded corners=3pt, minimum width=2cm, minimum height=0.8cm, text centered},
  circle node/.style={circle, draw, minimum size=0.8cm, text centered},
  ellipse node/.style={ellipse, draw, minimum width=2cm, minimum height=0.8cm, text centered},
  diamond node/.style={diamond, draw, aspect=2, minimum width=1.5cm, text centered},
  stadium node/.style={rectangle, draw, rounded corners=0.4cm, minimum width=2cm, minimum height=0.8cm, text centered},
  arrow/.style={->, >=stealth, thick},
  dashed arrow/.style={->, >=stealth, thick, dashed},
  dotted arrow/.style={->, >=stealth, thick, dotted},
  edge label/.style={font=\\footnotesize, fill=white, inner sep=1pt}
]`;

  if (title) {
    header += `\n\n% Title\n\\node[font=\\large\\bfseries] at (4, 0.5) {${escapeLatex(title)}};`;
  }

  return header;
}

/**
 * Generate TikZ document footer
 */
export function generateTikZFooter(options: TikZOptions = {}): string {
  const { standalone = false } = options;

  let footer = '\n\\end{tikzpicture}';

  if (standalone) {
    footer += '\n\\end{document}';
  }

  return footer;
}

/**
 * Get TikZ shape style from node shape
 */
function getShapeStyle(shape?: string): string {
  switch (shape) {
    case 'circle':
      return 'circle node';
    case 'ellipse':
      return 'ellipse node';
    case 'diamond':
      return 'diamond node';
    case 'stadium':
    case 'rounded':
      return 'stadium node';
    case 'rectangle':
    default:
      return 'box';
  }
}

/**
 * Render a node in TikZ format
 */
export function renderTikZNode(node: TikZNode, options: TikZOptions = {}): string {
  const { colorScheme = 'default', includeLabels = true } = options;
  const colors = getTikZColor(node.type || 'neutral', colorScheme);
  const shapeStyle = getShapeStyle(node.shape);
  const label = includeLabels ? escapeLatex(node.label) : escapeLatex(node.id);

  const position = node.x !== undefined && node.y !== undefined ? `at (${node.x}, ${node.y})` : '';

  return `\n  \\node[${shapeStyle}, fill=${colors.fill}, draw=${colors.stroke}] (${node.id}) ${position} {${label}};`;
}

/**
 * Render a node with relative positioning
 */
export function renderTikZNodeRelative(
  node: TikZNode,
  position: { direction: 'right' | 'left' | 'above' | 'below'; of: string; distance?: string },
  options: TikZOptions = {}
): string {
  const { colorScheme = 'default', includeLabels = true, nodeDistance = '2cm' } = options;
  const colors = getTikZColor(node.type || 'neutral', colorScheme);
  const shapeStyle = getShapeStyle(node.shape);
  const label = includeLabels ? escapeLatex(node.label) : escapeLatex(node.id);
  const distance = position.distance || nodeDistance;

  return `\n  \\node[${shapeStyle}, fill=${colors.fill}, draw=${colors.stroke}, ${position.direction}=${distance} of ${position.of}] (${node.id}) {${label}};`;
}

/**
 * Render an edge in TikZ format
 */
export function renderTikZEdge(edge: TikZEdge, options: TikZOptions = {}): string {
  const { includeLabels = true } = options;

  let style = 'arrow';
  if (edge.style === 'dashed') style = 'dashed arrow';
  if (edge.style === 'dotted') style = 'dotted arrow';
  if (edge.directed === false) style = style.replace('->', '-');

  let bendOption = '';
  if (edge.bend) {
    if (typeof edge.bend === 'number') {
      bendOption = `, bend ${edge.bend > 0 ? 'left' : 'right'}=${Math.abs(edge.bend)}`;
    } else {
      bendOption = `, bend ${edge.bend}`;
    }
  }

  let labelOption = '';
  if (includeLabels && edge.label) {
    labelOption = ` node[edge label, midway] {${escapeLatex(edge.label)}}`;
  }

  return `\n  \\draw[${style}${bendOption}] (${edge.source}) --${labelOption} (${edge.target});`;
}

/**
 * Render a metrics panel in TikZ
 */
export function renderTikZMetrics(
  x: number,
  y: number,
  metrics: Array<{ label: string; value: string | number }>
): string {
  let tikz = `\n\n  % Metrics Panel\n  \\node[draw, fill=white, rounded corners, align=left, font=\\footnotesize] at (${x}, ${y}) {`;

  const lines = metrics.map(m => `${escapeLatex(m.label)}: ${escapeLatex(String(m.value))}`);
  tikz += lines.join(' \\\\ ');
  tikz += '};';

  return tikz;
}

/**
 * Render a legend in TikZ
 */
export function renderTikZLegend(
  x: number,
  y: number,
  items: Array<{ label: string; color: { fill: string; stroke: string }; shape?: string }>
): string {
  let tikz = '\n\n  % Legend';

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemY = y - i * 0.5;
    const shapeStyle = getShapeStyle(item.shape);

    tikz += `\n  \\node[${shapeStyle}, fill=${item.color.fill}, draw=${item.color.stroke}, minimum width=0.5cm, minimum height=0.3cm] at (${x}, ${itemY}) {};`;
    tikz += `\n  \\node[right, font=\\footnotesize] at (${x + 0.4}, ${itemY}) {${escapeLatex(item.label)}};`;
  }

  return tikz;
}

/**
 * Generate a complete TikZ diagram from nodes and edges
 */
export function generateTikZ(
  nodes: TikZNode[],
  edges: TikZEdge[],
  options: TikZOptions = {}
): string {
  const mergedOptions = { ...DEFAULT_TIKZ_OPTIONS, ...options };

  let tikz = generateTikZHeader(mergedOptions);

  // Add nodes
  tikz += '\n\n  % Nodes';
  for (const node of nodes) {
    tikz += renderTikZNode(node, mergedOptions);
  }

  // Add edges
  tikz += '\n\n  % Edges';
  for (const edge of edges) {
    tikz += renderTikZEdge(edge, mergedOptions);
  }

  tikz += generateTikZFooter(mergedOptions);
  return tikz;
}

/**
 * Create a linear chain diagram (for sequential/temporal flows)
 */
export function createLinearTikZ(
  nodeLabels: string[],
  options: TikZOptions = {}
): string {
  const nodes: TikZNode[] = nodeLabels.map((label, i) => ({
    id: `n${i}`,
    label,
    x: i * 3,
    y: 0,
    type: i === 0 ? 'primary' : i === nodeLabels.length - 1 ? 'success' : 'neutral',
    shape: 'rectangle',
  }));

  const edges: TikZEdge[] = [];
  for (let i = 0; i < nodeLabels.length - 1; i++) {
    edges.push({
      source: `n${i}`,
      target: `n${i + 1}`,
      directed: true,
    });
  }

  return generateTikZ(nodes, edges, options);
}

/**
 * Create a hierarchical tree diagram
 */
export function createTreeTikZ(
  root: { id: string; label: string; children?: Array<{ id: string; label: string; children?: unknown[] }> },
  options: TikZOptions = {}
): string {
  const nodes: TikZNode[] = [];
  const edges: TikZEdge[] = [];

  function traverse(
    node: { id: string; label: string; children?: unknown[] },
    x: number,
    y: number,
    width: number
  ): void {
    nodes.push({
      id: node.id,
      label: node.label,
      x,
      y,
      type: y === 0 ? 'primary' : 'neutral',
      shape: 'rectangle',
    });

    if (node.children && Array.isArray(node.children)) {
      const children = node.children as Array<{ id: string; label: string; children?: unknown[] }>;
      const childWidth = width / children.length;

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const childX = x - width / 2 + childWidth / 2 + i * childWidth;

        edges.push({
          source: node.id,
          target: child.id,
          directed: true,
        });
        traverse(child, childX, y - 2, childWidth);
      }
    }
  }

  traverse(root, 4, 0, 8);
  return generateTikZ(nodes, edges, options);
}

/**
 * Create a layered graph diagram (for causal/bayesian networks)
 */
export function createLayeredTikZ(
  layers: Array<Array<{ id: string; label: string; type?: string; shape?: TikZNode['shape'] }>>,
  connections: Array<{ from: string; to: string; label?: string; style?: TikZEdge['style'] }>,
  options: TikZOptions = {}
): string {
  const nodes: TikZNode[] = [];

  for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
    const layer = layers[layerIdx];
    const layerWidth = layer.length * 3;
    const startX = (8 - layerWidth) / 2 + 1.5;

    for (let nodeIdx = 0; nodeIdx < layer.length; nodeIdx++) {
      const node = layer[nodeIdx];
      nodes.push({
        id: node.id,
        label: node.label,
        x: startX + nodeIdx * 3,
        y: -layerIdx * 2,
        type: node.type || 'neutral',
        shape: node.shape || 'rectangle',
      });
    }
  }

  const edges: TikZEdge[] = connections.map(conn => ({
    source: conn.from,
    target: conn.to,
    label: conn.label,
    style: conn.style,
    directed: true,
  }));

  return generateTikZ(nodes, edges, options);
}

// =============================================================================
// TikZBuilder - Fluent API Builder Class (Phase 13)
// =============================================================================

/** TikZ node options for builder */
export interface TikZNodeOptions {
  shape?: TikZNode['shape'];
  type?: string;
  fill?: string;
  draw?: string;
  position?: { x: number; y: number };
  relativePosition?: {
    direction: 'right' | 'left' | 'above' | 'below';
    of: string;
    distance?: string;
  };
  style?: string;
  minimumWidth?: string;
  minimumHeight?: string;
}

/** TikZ edge options for builder */
export interface TikZEdgeOptions {
  label?: string;
  style?: TikZEdge['style'];
  directed?: boolean;
  bend?: 'left' | 'right' | number;
  color?: string;
}

/** TikZ scope options */
export interface TikZScopeOptions {
  xshift?: string;
  yshift?: string;
  scale?: number;
  opacity?: number;
  style?: string;
}

/**
 * Fluent API builder for TikZ diagrams
 *
 * Provides a chainable interface for constructing TikZ graphics,
 * wrapping the existing utility functions for easier use.
 *
 * @example
 * ```typescript
 * const tikz = new TikZBuilder()
 *   .setOptions({ standalone: true, title: 'My Diagram' })
 *   .addNode('a', 'Node A', { position: { x: 0, y: 0 } })
 *   .addNode('b', 'Node B', { relativePosition: { direction: 'right', of: 'a' } })
 *   .addEdge('a', 'b', { label: 'connects' })
 *   .render();
 * ```
 */
export class TikZBuilder {
  private nodes: TikZNode[] = [];
  private edges: TikZEdge[] = [];
  private customStyles: Map<string, string> = new Map();
  private rawContent: string[] = [];
  private scopeStack: TikZScopeOptions[] = [];
  private options: TikZOptions = {};

  /**
   * Set or merge TikZ options
   * @param options - TikZ options to set/merge
   * @returns this for chaining
   */
  setOptions(options: TikZOptions): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Set whether to generate standalone document
   * @param standalone - true for standalone, false for tikzpicture only
   * @returns this for chaining
   */
  setStandalone(standalone: boolean): this {
    this.options.standalone = standalone;
    return this;
  }

  /**
   * Set the title
   * @param title - The diagram title
   * @returns this for chaining
   */
  setTitle(title: string): this {
    this.options.title = title;
    return this;
  }

  /**
   * Set the scale
   * @param scale - The scale factor
   * @returns this for chaining
   */
  setScale(scale: number): this {
    this.options.scale = scale;
    return this;
  }

  /**
   * Set the color scheme
   * @param scheme - Color scheme name
   * @returns this for chaining
   */
  setColorScheme(scheme: 'default' | 'pastel' | 'monochrome'): this {
    this.options.colorScheme = scheme;
    return this;
  }

  /**
   * Set the node distance for relative positioning
   * @param distance - Distance value (e.g., '2cm')
   * @returns this for chaining
   */
  setNodeDistance(distance: string): this {
    this.options.nodeDistance = distance;
    return this;
  }

  /**
   * Set the level distance for hierarchical layouts
   * @param distance - Distance value (e.g., '1.5cm')
   * @returns this for chaining
   */
  setLevelDistance(distance: string): this {
    this.options.levelDistance = distance;
    return this;
  }

  /**
   * Add a custom style definition
   * @param name - Style name
   * @param style - TikZ style definition
   * @returns this for chaining
   */
  addStyle(name: string, style: string): this {
    this.customStyles.set(name, style);
    return this;
  }

  /**
   * Add a node to the diagram
   * @param id - Node ID
   * @param label - Node label
   * @param nodeOptions - Node options
   * @returns this for chaining
   */
  addNode(id: string, label: string, nodeOptions?: TikZNodeOptions): this {
    const node: TikZNode = {
      id,
      label,
      type: nodeOptions?.type || 'neutral',
      shape: nodeOptions?.shape || 'rectangle',
    };

    if (nodeOptions?.position) {
      node.x = nodeOptions.position.x;
      node.y = nodeOptions.position.y;
    }

    // Store relative position in metadata for later processing
    if (nodeOptions?.relativePosition) {
      node.metadata = {
        ...node.metadata,
        relativePosition: nodeOptions.relativePosition,
      };
    }

    this.nodes.push(node);
    return this;
  }

  /**
   * Add multiple nodes at once
   * @param nodes - Array of node definitions
   * @returns this for chaining
   */
  addNodes(nodes: Array<{ id: string; label: string; options?: TikZNodeOptions }>): this {
    for (const node of nodes) {
      this.addNode(node.id, node.label, node.options);
    }
    return this;
  }

  /**
   * Add an edge between two nodes
   * @param source - Source node ID
   * @param target - Target node ID
   * @param edgeOptions - Edge options
   * @returns this for chaining
   */
  addEdge(source: string, target: string, edgeOptions?: TikZEdgeOptions): this {
    const edge: TikZEdge = {
      source,
      target,
      label: edgeOptions?.label,
      style: edgeOptions?.style || 'solid',
      directed: edgeOptions?.directed !== false,
      bend: edgeOptions?.bend,
    };

    this.edges.push(edge);
    return this;
  }

  /**
   * Add multiple edges at once
   * @param edges - Array of edge definitions
   * @returns this for chaining
   */
  addEdges(edges: Array<{ source: string; target: string; options?: TikZEdgeOptions }>): this {
    for (const edge of edges) {
      this.addEdge(edge.source, edge.target, edge.options);
    }
    return this;
  }

  /**
   * Begin a scope with optional options
   * @param scopeOptions - Scope options
   * @returns this for chaining
   */
  beginScope(scopeOptions?: TikZScopeOptions): this {
    this.scopeStack.push(scopeOptions || {});

    let scopeStr = '  \\begin{scope}';
    if (scopeOptions) {
      const opts: string[] = [];
      if (scopeOptions.xshift) opts.push(`xshift=${scopeOptions.xshift}`);
      if (scopeOptions.yshift) opts.push(`yshift=${scopeOptions.yshift}`);
      if (scopeOptions.scale) opts.push(`scale=${scopeOptions.scale}`);
      if (scopeOptions.opacity) opts.push(`opacity=${scopeOptions.opacity}`);
      if (scopeOptions.style) opts.push(scopeOptions.style);
      if (opts.length > 0) {
        scopeStr = `  \\begin{scope}[${opts.join(', ')}]`;
      }
    }

    this.rawContent.push(scopeStr);
    return this;
  }

  /**
   * End the current scope
   * @returns this for chaining
   */
  endScope(): this {
    if (this.scopeStack.length > 0) {
      this.scopeStack.pop();
      this.rawContent.push('  \\end{scope}');
    }
    return this;
  }

  /**
   * Add raw TikZ content
   * @param content - Raw TikZ code
   * @returns this for chaining
   */
  addRaw(content: string): this {
    this.rawContent.push(content);
    return this;
  }

  /**
   * Add a comment
   * @param comment - Comment text
   * @returns this for chaining
   */
  addComment(comment: string): this {
    this.rawContent.push(`  % ${comment}`);
    return this;
  }

  /**
   * Add a coordinate definition
   * @param name - Coordinate name
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns this for chaining
   */
  addCoordinate(name: string, x: number, y: number): this {
    this.rawContent.push(`  \\coordinate (${name}) at (${x}, ${y});`);
    return this;
  }

  /**
   * Add a background rectangle
   * @param x1 - Left X
   * @param y1 - Bottom Y
   * @param x2 - Right X
   * @param y2 - Top Y
   * @param fill - Fill color
   * @returns this for chaining
   */
  addBackground(x1: number, y1: number, x2: number, y2: number, fill: string = 'gray!10'): this {
    this.rawContent.push(`  \\fill[${fill}] (${x1}, ${y1}) rectangle (${x2}, ${y2});`);
    return this;
  }

  /**
   * Add a metrics panel
   * @param x - X position
   * @param y - Y position
   * @param metrics - Array of label/value pairs
   * @returns this for chaining
   */
  addMetrics(x: number, y: number, metrics: Array<{ label: string; value: string | number }>): this {
    this.rawContent.push(renderTikZMetrics(x, y, metrics));
    return this;
  }

  /**
   * Add a legend
   * @param x - X position
   * @param y - Y position
   * @param items - Legend items
   * @returns this for chaining
   */
  addLegend(
    x: number,
    y: number,
    items: Array<{ label: string; color: { fill: string; stroke: string }; shape?: string }>
  ): this {
    this.rawContent.push(renderTikZLegend(x, y, items));
    return this;
  }

  /**
   * Get the current node count
   * @returns The number of nodes in the diagram
   */
  get nodeCount(): number {
    return this.nodes.length;
  }

  /**
   * Get the current edge count
   * @returns The number of edges in the diagram
   */
  get edgeCount(): number {
    return this.edges.length;
  }

  /**
   * Get the current style count
   * @returns The number of custom styles defined
   */
  get styleCount(): number {
    return this.customStyles.size;
  }

  /**
   * Clear all nodes, edges, and content
   * @returns this for chaining
   */
  clear(): this {
    this.nodes = [];
    this.edges = [];
    this.customStyles.clear();
    this.rawContent = [];
    this.scopeStack = [];
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
   * Render the TikZ diagram as a string
   * @returns Complete TikZ diagram string
   */
  render(): string {
    const mergedOptions = { ...DEFAULT_TIKZ_OPTIONS, ...this.options };

    const lines: string[] = [];

    // Standalone header
    if (mergedOptions.standalone) {
      lines.push('\\documentclass[tikz,border=10pt]{standalone}');
      lines.push('\\usepackage{tikz}');
      lines.push('\\usetikzlibrary{shapes,arrows,positioning,calc,backgrounds,fit}');
      lines.push('\\begin{document}');
    }

    // Begin tikzpicture with options
    const pictureOpts: string[] = [];
    if (mergedOptions.scale !== 1) {
      pictureOpts.push(`scale=${mergedOptions.scale}`);
    }
    pictureOpts.push('every node/.style={font=\\small}');
    pictureOpts.push('box/.style={rectangle, draw, rounded corners=3pt, minimum width=2cm, minimum height=0.8cm, text centered}');
    pictureOpts.push('circle node/.style={circle, draw, minimum size=0.8cm, text centered}');
    pictureOpts.push('ellipse node/.style={ellipse, draw, minimum width=2cm, minimum height=0.8cm, text centered}');
    pictureOpts.push('diamond node/.style={diamond, draw, aspect=2, minimum width=1.5cm, text centered}');
    pictureOpts.push('stadium node/.style={rectangle, draw, rounded corners=0.4cm, minimum width=2cm, minimum height=0.8cm, text centered}');
    pictureOpts.push('arrow/.style={->, >=stealth, thick}');
    pictureOpts.push('dashed arrow/.style={->, >=stealth, thick, dashed}');
    pictureOpts.push('dotted arrow/.style={->, >=stealth, thick, dotted}');
    pictureOpts.push('edge label/.style={font=\\footnotesize, fill=white, inner sep=1pt}');

    // Add custom styles
    for (const [name, style] of this.customStyles) {
      pictureOpts.push(`${name}/.style={${style}}`);
    }

    lines.push(`\\begin{tikzpicture}[`);
    lines.push(`  ${pictureOpts.join(',\n  ')}`);
    lines.push(`]`);

    // Title
    if (mergedOptions.title) {
      lines.push('');
      lines.push(`% Title`);
      lines.push(`\\node[font=\\large\\bfseries] at (4, 0.5) {${escapeLatex(mergedOptions.title)}};`);
    }

    // Nodes
    if (this.nodes.length > 0) {
      lines.push('');
      lines.push('  % Nodes');
      for (const node of this.nodes) {
        // Check for relative positioning
        const relPos = node.metadata?.relativePosition as TikZNodeOptions['relativePosition'];
        if (relPos) {
          lines.push(renderTikZNodeRelative(
            node,
            relPos,
            mergedOptions
          ));
        } else {
          lines.push(renderTikZNode(node, mergedOptions));
        }
      }
    }

    // Raw content (includes scopes)
    if (this.rawContent.length > 0) {
      lines.push('');
      lines.push('  % Custom content');
      lines.push(...this.rawContent);
    }

    // Edges
    if (this.edges.length > 0) {
      lines.push('');
      lines.push('  % Edges');
      for (const edge of this.edges) {
        lines.push(renderTikZEdge(edge, mergedOptions));
      }
    }

    // End tikzpicture
    lines.push('\\end{tikzpicture}');

    // Standalone footer
    if (mergedOptions.standalone) {
      lines.push('\\end{document}');
    }

    return lines.join('\n');
  }

  /**
   * Create a builder with preset options
   * @param options - Initial TikZ options
   * @returns A new TikZBuilder instance
   */
  static withOptions(options: TikZOptions): TikZBuilder {
    return new TikZBuilder().setOptions(options);
  }

  /**
   * Create a standalone builder
   * @returns A new TikZBuilder configured for standalone output
   */
  static standalone(): TikZBuilder {
    return new TikZBuilder().setStandalone(true);
  }
}
