/**
 * SVG Export Utilities (v8.5.0)
 * Phase 9: Generic SVG export module for all thinking modes
 * Phase 13: Added SVGBuilder fluent API
 *
 * Provides shared utilities for generating native SVG visualizations
 * across all visual exporters. Supports multiple node shapes, color
 * schemes, and edge styling.
 */

/**
 * SVG-specific export options
 */
export interface SVGExportOptions {
  width?: number;
  height?: number;
  nodeWidth?: number;
  nodeHeight?: number;
  nodeSpacing?: number;
  layerSpacing?: number;
  padding?: number;
  colorScheme?: 'default' | 'monochrome' | 'pastel';
  includeLabels?: boolean;
  includeMetrics?: boolean;
  title?: string;
}

/**
 * Default SVG options
 */
export const DEFAULT_SVG_OPTIONS: Required<SVGExportOptions> = {
  width: 800,
  height: 600,
  nodeWidth: 150,
  nodeHeight: 40,
  nodeSpacing: 20,
  layerSpacing: 100,
  padding: 40,
  colorScheme: 'default',
  includeLabels: true,
  includeMetrics: true,
  title: '',
};

/**
 * Node position for SVG layout
 */
export interface SVGNodePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  type?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Edge definition for SVG
 */
export interface SVGEdge {
  from: string;
  to: string;
  label?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  color?: string;
  bidirectional?: boolean;
}

/**
 * Color palette for different node types
 */
export interface ColorPalette {
  [key: string]: { fill: string; stroke: string };
}

/**
 * Default color palettes
 */
export const COLOR_PALETTES: Record<string, ColorPalette> = {
  default: {
    primary: { fill: '#64b5f6', stroke: '#1976d2' },
    secondary: { fill: '#81c784', stroke: '#388e3c' },
    tertiary: { fill: '#ffb74d', stroke: '#f57c00' },
    quaternary: { fill: '#ba68c8', stroke: '#7b1fa2' },
    neutral: { fill: '#bdbdbd', stroke: '#616161' },
    success: { fill: '#81c784', stroke: '#388e3c' },
    warning: { fill: '#ffb74d', stroke: '#f57c00' },
    error: { fill: '#e57373', stroke: '#d32f2f' },
    info: { fill: '#64b5f6', stroke: '#1976d2' },
    highlight: { fill: '#fff176', stroke: '#fbc02d' },
  },
  pastel: {
    primary: { fill: '#bbdefb', stroke: '#2196f3' },
    secondary: { fill: '#c8e6c9', stroke: '#4caf50' },
    tertiary: { fill: '#ffe0b2', stroke: '#ff9800' },
    quaternary: { fill: '#e1bee7', stroke: '#9c27b0' },
    neutral: { fill: '#e0e0e0', stroke: '#757575' },
    success: { fill: '#c8e6c9', stroke: '#4caf50' },
    warning: { fill: '#fff9c4', stroke: '#ffc107' },
    error: { fill: '#ffcdd2', stroke: '#e53935' },
    info: { fill: '#bbdefb', stroke: '#2196f3' },
    highlight: { fill: '#fff9c4', stroke: '#fbc02d' },
  },
  monochrome: {
    primary: { fill: '#ffffff', stroke: '#333333' },
    secondary: { fill: '#f5f5f5', stroke: '#333333' },
    tertiary: { fill: '#eeeeee', stroke: '#333333' },
    quaternary: { fill: '#e0e0e0', stroke: '#333333' },
    neutral: { fill: '#fafafa', stroke: '#333333' },
    success: { fill: '#ffffff', stroke: '#333333' },
    warning: { fill: '#f5f5f5', stroke: '#333333' },
    error: { fill: '#eeeeee', stroke: '#333333' },
    info: { fill: '#ffffff', stroke: '#333333' },
    highlight: { fill: '#e0e0e0', stroke: '#333333' },
  },
};

/**
 * Get color for a node type from a palette
 */
export function getNodeColor(
  type: string,
  colorScheme: 'default' | 'monochrome' | 'pastel' = 'default'
): { fill: string; stroke: string } {
  const palette = COLOR_PALETTES[colorScheme] || COLOR_PALETTES.default;
  return palette[type] || palette.neutral;
}

/**
 * Escape text for safe SVG embedding
 */
export function escapeSVGText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Truncate text to fit within a character limit
 */
export function truncateText(text: string, maxChars: number = 30): string {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars - 3) + '...';
}

/**
 * Generate SVG header with defs (markers, gradients, etc.)
 */
export function generateSVGHeader(
  width: number,
  height: number,
  title?: string
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#333"/>
    </marker>
    <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#e53935"/>
    </marker>
    <marker id="arrowhead-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#388e3c"/>
    </marker>
    <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#1976d2"/>
    </marker>
  </defs>

  <style>
    .title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; }
    .subtitle { font-family: Arial, sans-serif; font-size: 12px; fill: #666; font-style: italic; }
    .node-label { font-family: Arial, sans-serif; font-size: 12px; }
    .edge-label { font-family: Arial, sans-serif; font-size: 10px; fill: #666; }
    .metrics { font-family: Arial, sans-serif; font-size: 11px; fill: #444; }
    .legend-text { font-family: Arial, sans-serif; font-size: 10px; }
  </style>

  <!-- Background -->
  <rect width="100%" height="100%" fill="#fafafa"/>
${title ? `\n  <!-- Title -->\n  <text x="${width / 2}" y="25" text-anchor="middle" class="title">${escapeSVGText(truncateText(title, 60))}</text>\n` : ''}`;
}

/**
 * Generate SVG footer
 */
export function generateSVGFooter(): string {
  return '</svg>';
}

/**
 * Render a rectangular node
 */
export function renderRectNode(
  pos: SVGNodePosition,
  colors: { fill: string; stroke: string },
  rx: number = 8
): string {
  const escapedLabel = escapeSVGText(truncateText(pos.label, 25));
  return `
    <g class="node" data-id="${pos.id}">
      <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}"
            rx="${rx}" ry="${rx}" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 5}"
            text-anchor="middle" class="node-label">${escapedLabel}</text>
    </g>`;
}

/**
 * Render a rounded/stadium node (for start/source nodes)
 */
export function renderStadiumNode(
  pos: SVGNodePosition,
  colors: { fill: string; stroke: string }
): string {
  const escapedLabel = escapeSVGText(truncateText(pos.label, 25));
  return `
    <g class="node" data-id="${pos.id}">
      <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}"
            rx="20" ry="20" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 5}"
            text-anchor="middle" class="node-label">${escapedLabel}</text>
    </g>`;
}

/**
 * Render a diamond node (for decision/conclusion nodes)
 */
export function renderDiamondNode(
  pos: SVGNodePosition,
  colors: { fill: string; stroke: string }
): string {
  const cx = pos.x + pos.width / 2;
  const cy = pos.y + pos.height / 2;
  const escapedLabel = escapeSVGText(truncateText(pos.label, 20));
  return `
    <g class="node" data-id="${pos.id}">
      <polygon points="${cx},${pos.y} ${pos.x + pos.width},${cy} ${cx},${pos.y + pos.height} ${pos.x},${cy}"
               fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${cx}" y="${cy + 5}"
            text-anchor="middle" class="node-label">${escapedLabel}</text>
    </g>`;
}

/**
 * Render a hexagon node (for process/intermediate nodes)
 */
export function renderHexagonNode(
  pos: SVGNodePosition,
  colors: { fill: string; stroke: string }
): string {
  const cx = pos.x + pos.width / 2;
  const cy = pos.y + pos.height / 2;
  const w = pos.width;
  const h = pos.height;
  const escapedLabel = escapeSVGText(truncateText(pos.label, 20));
  return `
    <g class="node" data-id="${pos.id}">
      <polygon points="${pos.x + w * 0.2},${pos.y} ${pos.x + w * 0.8},${pos.y} ${pos.x + w},${cy} ${pos.x + w * 0.8},${pos.y + h} ${pos.x + w * 0.2},${pos.y + h} ${pos.x},${cy}"
               fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${cx}" y="${cy + 5}"
            text-anchor="middle" class="node-label">${escapedLabel}</text>
    </g>`;
}

/**
 * Render an ellipse node
 */
export function renderEllipseNode(
  pos: SVGNodePosition,
  colors: { fill: string; stroke: string }
): string {
  const cx = pos.x + pos.width / 2;
  const cy = pos.y + pos.height / 2;
  const escapedLabel = escapeSVGText(truncateText(pos.label, 20));
  return `
    <g class="node" data-id="${pos.id}">
      <ellipse cx="${cx}" cy="${cy}" rx="${pos.width / 2}" ry="${pos.height / 2}"
               fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${cx}" y="${cy + 5}"
            text-anchor="middle" class="node-label">${escapedLabel}</text>
    </g>`;
}

/**
 * Render a parallelogram node (for input/output)
 */
export function renderParallelogramNode(
  pos: SVGNodePosition,
  colors: { fill: string; stroke: string }
): string {
  const skew = 15;
  const escapedLabel = escapeSVGText(truncateText(pos.label, 20));
  return `
    <g class="node" data-id="${pos.id}">
      <polygon points="${pos.x + skew},${pos.y} ${pos.x + pos.width},${pos.y} ${pos.x + pos.width - skew},${pos.y + pos.height} ${pos.x},${pos.y + pos.height}"
               fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 5}"
            text-anchor="middle" class="node-label">${escapedLabel}</text>
    </g>`;
}

/**
 * Render a double-bordered rectangle (for subroutine/definition)
 */
export function renderSubroutineNode(
  pos: SVGNodePosition,
  colors: { fill: string; stroke: string }
): string {
  const escapedLabel = escapeSVGText(truncateText(pos.label, 22));
  return `
    <g class="node" data-id="${pos.id}">
      <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}"
            rx="4" ry="4" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <rect x="${pos.x + 6}" y="${pos.y + 6}" width="${pos.width - 12}" height="${pos.height - 12}"
            rx="2" ry="2" fill="none" stroke="${colors.stroke}" stroke-width="1"/>
      <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 5}"
            text-anchor="middle" class="node-label">${escapedLabel}</text>
    </g>`;
}

/**
 * Render an edge (arrow) between two nodes
 */
export function renderEdge(
  fromPos: SVGNodePosition,
  toPos: SVGNodePosition,
  options: {
    label?: string;
    style?: 'solid' | 'dashed' | 'dotted';
    color?: string;
    markerEnd?: string;
  } = {}
): string {
  const { label, style = 'solid', color = '#333333', markerEnd = 'arrowhead' } = options;

  // Calculate edge points (from bottom of source to top of target)
  const fromX = fromPos.x + fromPos.width / 2;
  const fromY = fromPos.y + fromPos.height;
  const toX = toPos.x + toPos.width / 2;
  const toY = toPos.y;

  // Create curved path using bezier curve
  const midY = (fromY + toY) / 2;
  const path = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY - 8}`;

  const dashStyle =
    style === 'dashed'
      ? 'stroke-dasharray="8,4"'
      : style === 'dotted'
        ? 'stroke-dasharray="2,2"'
        : '';

  const labelElement = label
    ? `<text x="${(fromX + toX) / 2}" y="${midY - 5}" text-anchor="middle" class="edge-label">${escapeSVGText(label)}</text>`
    : '';

  return `
    <g class="edge">
      <path d="${path}" fill="none" stroke="${color}" stroke-width="2" ${dashStyle} marker-end="url(#${markerEnd})"/>
      ${labelElement}
    </g>`;
}

/**
 * Render a horizontal edge (for timeline/sequence diagrams)
 */
export function renderHorizontalEdge(
  fromPos: SVGNodePosition,
  toPos: SVGNodePosition,
  options: {
    label?: string;
    style?: 'solid' | 'dashed' | 'dotted';
    color?: string;
  } = {}
): string {
  const { label, style = 'solid', color = '#333333' } = options;

  // From right of source to left of target
  const fromX = fromPos.x + fromPos.width;
  const fromY = fromPos.y + fromPos.height / 2;
  const toX = toPos.x;
  const toY = toPos.y + toPos.height / 2;

  const dashStyle =
    style === 'dashed'
      ? 'stroke-dasharray="8,4"'
      : style === 'dotted'
        ? 'stroke-dasharray="2,2"'
        : '';

  const labelElement = label
    ? `<text x="${(fromX + toX) / 2}" y="${(fromY + toY) / 2 - 8}" text-anchor="middle" class="edge-label">${escapeSVGText(label)}</text>`
    : '';

  return `
    <g class="edge">
      <line x1="${fromX}" y1="${fromY}" x2="${toX - 8}" y2="${toY}"
            stroke="${color}" stroke-width="2" ${dashStyle} marker-end="url(#arrowhead)"/>
      ${labelElement}
    </g>`;
}

/**
 * Render a metrics panel
 */
export function renderMetricsPanel(
  x: number,
  y: number,
  metrics: Array<{ label: string; value: string | number }>
): string {
  const panelHeight = 30 + metrics.length * 16;
  let svg = `
  <g class="metrics-panel">
    <rect x="${x}" y="${y}" width="160" height="${panelHeight}" rx="8" fill="#f5f5f5" stroke="#ddd" stroke-width="1"/>
    <text x="${x + 10}" y="${y + 20}" class="metrics" font-weight="bold">Metrics</text>`;

  metrics.forEach((metric, i) => {
    svg += `\n    <text x="${x + 10}" y="${y + 38 + i * 16}" class="metrics">${escapeSVGText(metric.label)}: ${escapeSVGText(String(metric.value))}</text>`;
  });

  svg += '\n  </g>';
  return svg;
}

/**
 * Render a legend
 */
export function renderLegend(
  x: number,
  y: number,
  items: Array<{ label: string; color: { fill: string; stroke: string }; shape?: 'rect' | 'diamond' | 'ellipse' | 'stadium' }>
): string {
  let svg = `
  <g class="legend" transform="translate(${x}, ${y})">
    <text x="0" y="0" font-weight="bold" class="legend-text">Legend</text>`;

  items.forEach((item, i) => {
    const itemY = 12 + i * 18;
    let shapeEl: string;
    switch (item.shape) {
      case 'diamond':
        shapeEl = `<polygon points="10,${itemY} 20,${itemY + 6} 10,${itemY + 12} 0,${itemY + 6}" fill="${item.color.fill}" stroke="${item.color.stroke}"/>`;
        break;
      case 'ellipse':
        shapeEl = `<ellipse cx="10" cy="${itemY + 6}" rx="10" ry="6" fill="${item.color.fill}" stroke="${item.color.stroke}"/>`;
        break;
      case 'stadium':
        shapeEl = `<rect x="0" y="${itemY}" width="20" height="12" rx="6" ry="6" fill="${item.color.fill}" stroke="${item.color.stroke}"/>`;
        break;
      default:
        shapeEl = `<rect x="0" y="${itemY}" width="20" height="12" rx="4" fill="${item.color.fill}" stroke="${item.color.stroke}"/>`;
    }

    svg += `\n    ${shapeEl}
    <text x="25" y="${itemY + 10}" class="legend-text">${escapeSVGText(item.label)}</text>`;
  });

  svg += '\n  </g>';
  return svg;
}

/**
 * Layout nodes in layers (top-down)
 */
export function layoutNodesInLayers(
  layers: Array<Array<{ id: string; label: string; type?: string }>>,
  options: SVGExportOptions = {}
): Map<string, SVGNodePosition> {
  const opts = { ...DEFAULT_SVG_OPTIONS, ...options };
  const positions = new Map<string, SVGNodePosition>();

  let currentY = opts.padding + (opts.title ? 40 : 0);

  for (const layer of layers) {
    if (layer.length === 0) continue;

    const layerWidth = layer.length * (opts.nodeWidth + opts.nodeSpacing) - opts.nodeSpacing;
    let startX = (opts.width - layerWidth) / 2;

    for (const node of layer) {
      positions.set(node.id, {
        id: node.id,
        x: startX,
        y: currentY,
        width: opts.nodeWidth,
        height: opts.nodeHeight,
        label: node.label,
        type: node.type,
      });
      startX += opts.nodeWidth + opts.nodeSpacing;
    }

    currentY += opts.nodeHeight + opts.layerSpacing;
  }

  return positions;
}

/**
 * Layout nodes in a horizontal sequence
 */
export function layoutNodesHorizontally(
  nodes: Array<{ id: string; label: string; type?: string }>,
  options: SVGExportOptions = {}
): Map<string, SVGNodePosition> {
  const opts = { ...DEFAULT_SVG_OPTIONS, ...options };
  const positions = new Map<string, SVGNodePosition>();

  const totalWidth = nodes.length * (opts.nodeWidth + opts.nodeSpacing) - opts.nodeSpacing;
  let startX = Math.max(opts.padding, (opts.width - totalWidth) / 2);
  const y = opts.height / 2 - opts.nodeHeight / 2;

  for (const node of nodes) {
    positions.set(node.id, {
      id: node.id,
      x: startX,
      y,
      width: opts.nodeWidth,
      height: opts.nodeHeight,
      label: node.label,
      type: node.type,
    });
    startX += opts.nodeWidth + opts.nodeSpacing;
  }

  return positions;
}

/**
 * Calculate required SVG height based on node positions
 */
export function calculateSVGHeight(
  positions: Map<string, SVGNodePosition>,
  padding: number = 40,
  extraSpace: number = 120
): number {
  let maxY = 0;
  for (const pos of positions.values()) {
    maxY = Math.max(maxY, pos.y + pos.height);
  }
  return maxY + padding + extraSpace;
}

// =============================================================================
// SVGBuilder - Fluent API Builder Class (Phase 13)
// =============================================================================

/** Options for SVG shapes */
export interface SVGShapeOptions {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  rx?: number;
  ry?: number;
  className?: string;
}

/** Options for SVG text */
export interface SVGTextOptions {
  fill?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  textAnchor?: 'start' | 'middle' | 'end';
  dominantBaseline?: 'auto' | 'middle' | 'hanging';
  className?: string;
}

/** Options for SVG lines */
export interface SVGLineOptions {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  markerEnd?: string;
  markerStart?: string;
}

/** Options for SVG paths */
export interface SVGPathOptions extends SVGLineOptions {
  fill?: string;
  opacity?: number;
}

/**
 * SVG Group Builder for creating grouped SVG elements
 */
export class SVGGroupBuilder {
  private elements: string[] = [];
  private groupId?: string;
  private transform?: string;
  private className?: string;

  constructor(id?: string) {
    this.groupId = id;
  }

  /**
   * Set the group transform
   * @param transform - SVG transform string
   * @returns this for chaining
   */
  setTransform(transform: string): this {
    this.transform = transform;
    return this;
  }

  /**
   * Set the group class name
   * @param className - CSS class name
   * @returns this for chaining
   */
  setClassName(className: string): this {
    this.className = className;
    return this;
  }

  /**
   * Add a rectangle to the group
   */
  addRect(x: number, y: number, width: number, height: number, options?: SVGShapeOptions): this {
    const attrs = [
      `x="${x}"`,
      `y="${y}"`,
      `width="${width}"`,
      `height="${height}"`,
    ];
    if (options?.fill) attrs.push(`fill="${options.fill}"`);
    if (options?.stroke) attrs.push(`stroke="${options.stroke}"`);
    if (options?.strokeWidth) attrs.push(`stroke-width="${options.strokeWidth}"`);
    if (options?.opacity !== undefined) attrs.push(`opacity="${options.opacity}"`);
    if (options?.rx) attrs.push(`rx="${options.rx}"`);
    if (options?.ry) attrs.push(`ry="${options.ry}"`);
    if (options?.className) attrs.push(`class="${options.className}"`);

    this.elements.push(`    <rect ${attrs.join(' ')}/>`);
    return this;
  }

  /**
   * Add a circle to the group
   */
  addCircle(cx: number, cy: number, r: number, options?: SVGShapeOptions): this {
    const attrs = [`cx="${cx}"`, `cy="${cy}"`, `r="${r}"`];
    if (options?.fill) attrs.push(`fill="${options.fill}"`);
    if (options?.stroke) attrs.push(`stroke="${options.stroke}"`);
    if (options?.strokeWidth) attrs.push(`stroke-width="${options.strokeWidth}"`);
    if (options?.opacity !== undefined) attrs.push(`opacity="${options.opacity}"`);
    if (options?.className) attrs.push(`class="${options.className}"`);

    this.elements.push(`    <circle ${attrs.join(' ')}/>`);
    return this;
  }

  /**
   * Add text to the group
   */
  addText(x: number, y: number, text: string, options?: SVGTextOptions): this {
    const attrs = [`x="${x}"`, `y="${y}"`];
    if (options?.fill) attrs.push(`fill="${options.fill}"`);
    if (options?.fontSize) attrs.push(`font-size="${options.fontSize}"`);
    if (options?.fontFamily) attrs.push(`font-family="${options.fontFamily}"`);
    if (options?.fontWeight) attrs.push(`font-weight="${options.fontWeight}"`);
    if (options?.textAnchor) attrs.push(`text-anchor="${options.textAnchor}"`);
    if (options?.dominantBaseline) attrs.push(`dominant-baseline="${options.dominantBaseline}"`);
    if (options?.className) attrs.push(`class="${options.className}"`);

    this.elements.push(`    <text ${attrs.join(' ')}>${escapeSVGText(text)}</text>`);
    return this;
  }

  /**
   * Add a line to the group
   */
  addLine(x1: number, y1: number, x2: number, y2: number, options?: SVGLineOptions): this {
    const attrs = [
      `x1="${x1}"`,
      `y1="${y1}"`,
      `x2="${x2}"`,
      `y2="${y2}"`,
    ];
    if (options?.stroke) attrs.push(`stroke="${options.stroke}"`);
    if (options?.strokeWidth) attrs.push(`stroke-width="${options.strokeWidth}"`);
    if (options?.strokeDasharray) attrs.push(`stroke-dasharray="${options.strokeDasharray}"`);
    if (options?.markerEnd) attrs.push(`marker-end="url(#${options.markerEnd})"`);
    if (options?.markerStart) attrs.push(`marker-start="url(#${options.markerStart})"`);

    this.elements.push(`    <line ${attrs.join(' ')}/>`);
    return this;
  }

  /**
   * Add raw SVG content to the group
   */
  addRaw(svg: string): this {
    this.elements.push(`    ${svg}`);
    return this;
  }

  /**
   * Render the group as SVG string
   * @returns The complete SVG group element string
   */
  render(): string {
    const attrs: string[] = [];
    if (this.groupId) attrs.push(`id="${this.groupId}"`);
    if (this.className) attrs.push(`class="${this.className}"`);
    if (this.transform) attrs.push(`transform="${this.transform}"`);

    const attrStr = attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
    return `  <g${attrStr}>\n${this.elements.join('\n')}\n  </g>`;
  }
}

/**
 * Fluent API builder for SVG documents
 *
 * Provides a chainable interface for constructing SVG graphics,
 * wrapping the existing utility functions for easier use.
 *
 * @example
 * ```typescript
 * const svg = new SVGBuilder()
 *   .setDimensions(800, 600)
 *   .setTitle('My Diagram')
 *   .addRect(10, 10, 100, 50, { fill: '#64b5f6', stroke: '#1976d2' })
 *   .addText(60, 35, 'Hello', { textAnchor: 'middle' })
 *   .addLine(110, 35, 200, 35, { stroke: '#333', markerEnd: 'arrowhead' })
 *   .render();
 * ```
 */
export class SVGBuilder {
  private width: number = 800;
  private height: number = 600;
  private title?: string;
  private elements: string[] = [];
  private defs: string[] = [];
  private styles: string[] = [];
  private background?: string;
  private includeDefaultDefs: boolean = true;
  private includeDefaultStyles: boolean = true;

  /**
   * Set the SVG dimensions
   * @param width - Width in pixels
   * @param height - Height in pixels
   * @returns this for chaining
   */
  setDimensions(width: number, height: number): this {
    this.width = width;
    this.height = height;
    return this;
  }

  /**
   * Set the SVG width
   * @param width - Width in pixels
   * @returns this for chaining
   */
  setWidth(width: number): this {
    this.width = width;
    return this;
  }

  /**
   * Set the SVG height
   * @param height - Height in pixels
   * @returns this for chaining
   */
  setHeight(height: number): this {
    this.height = height;
    return this;
  }

  /**
   * Set the SVG title
   * @param title - The title text
   * @returns this for chaining
   */
  setTitle(title: string): this {
    this.title = title;
    return this;
  }

  /**
   * Set the background color
   * @param color - CSS color value
   * @returns this for chaining
   */
  setBackground(color: string): this {
    this.background = color;
    return this;
  }

  /**
   * Control whether to include default marker definitions
   * @param include - true to include defaults
   * @returns this for chaining
   */
  setIncludeDefaultDefs(include: boolean): this {
    this.includeDefaultDefs = include;
    return this;
  }

  /**
   * Control whether to include default styles
   * @param include - true to include defaults
   * @returns this for chaining
   */
  setIncludeDefaultStyles(include: boolean): this {
    this.includeDefaultStyles = include;
    return this;
  }

  /**
   * Add a custom definition (marker, gradient, etc.)
   * @param def - SVG def content
   * @returns this for chaining
   */
  addDef(def: string): this {
    this.defs.push(def);
    return this;
  }

  /**
   * Add a custom style rule
   * @param style - CSS style rule
   * @returns this for chaining
   */
  addStyle(style: string): this {
    this.styles.push(style);
    return this;
  }

  /**
   * Add a rectangle
   * @param x - X position
   * @param y - Y position
   * @param width - Width
   * @param height - Height
   * @param options - Shape options
   * @returns this for chaining
   */
  addRect(x: number, y: number, width: number, height: number, options?: SVGShapeOptions): this {
    const attrs = [
      `x="${x}"`,
      `y="${y}"`,
      `width="${width}"`,
      `height="${height}"`,
    ];
    if (options?.fill) attrs.push(`fill="${options.fill}"`);
    if (options?.stroke) attrs.push(`stroke="${options.stroke}"`);
    if (options?.strokeWidth) attrs.push(`stroke-width="${options.strokeWidth}"`);
    if (options?.opacity !== undefined) attrs.push(`opacity="${options.opacity}"`);
    if (options?.rx) attrs.push(`rx="${options.rx}"`);
    if (options?.ry) attrs.push(`ry="${options.ry}"`);
    if (options?.className) attrs.push(`class="${options.className}"`);

    this.elements.push(`  <rect ${attrs.join(' ')}/>`);
    return this;
  }

  /**
   * Add a circle
   * @param cx - Center X
   * @param cy - Center Y
   * @param r - Radius
   * @param options - Shape options
   * @returns this for chaining
   */
  addCircle(cx: number, cy: number, r: number, options?: SVGShapeOptions): this {
    const attrs = [`cx="${cx}"`, `cy="${cy}"`, `r="${r}"`];
    if (options?.fill) attrs.push(`fill="${options.fill}"`);
    if (options?.stroke) attrs.push(`stroke="${options.stroke}"`);
    if (options?.strokeWidth) attrs.push(`stroke-width="${options.strokeWidth}"`);
    if (options?.opacity !== undefined) attrs.push(`opacity="${options.opacity}"`);
    if (options?.className) attrs.push(`class="${options.className}"`);

    this.elements.push(`  <circle ${attrs.join(' ')}/>`);
    return this;
  }

  /**
   * Add an ellipse
   * @param cx - Center X
   * @param cy - Center Y
   * @param rx - X radius
   * @param ry - Y radius
   * @param options - Shape options
   * @returns this for chaining
   */
  addEllipse(cx: number, cy: number, rx: number, ry: number, options?: SVGShapeOptions): this {
    const attrs = [`cx="${cx}"`, `cy="${cy}"`, `rx="${rx}"`, `ry="${ry}"`];
    if (options?.fill) attrs.push(`fill="${options.fill}"`);
    if (options?.stroke) attrs.push(`stroke="${options.stroke}"`);
    if (options?.strokeWidth) attrs.push(`stroke-width="${options.strokeWidth}"`);
    if (options?.opacity !== undefined) attrs.push(`opacity="${options.opacity}"`);
    if (options?.className) attrs.push(`class="${options.className}"`);

    this.elements.push(`  <ellipse ${attrs.join(' ')}/>`);
    return this;
  }

  /**
   * Add a line
   * @param x1 - Start X
   * @param y1 - Start Y
   * @param x2 - End X
   * @param y2 - End Y
   * @param options - Line options
   * @returns this for chaining
   */
  addLine(x1: number, y1: number, x2: number, y2: number, options?: SVGLineOptions): this {
    const attrs = [
      `x1="${x1}"`,
      `y1="${y1}"`,
      `x2="${x2}"`,
      `y2="${y2}"`,
    ];
    if (options?.stroke) attrs.push(`stroke="${options.stroke}"`);
    if (options?.strokeWidth) attrs.push(`stroke-width="${options.strokeWidth}"`);
    if (options?.strokeDasharray) attrs.push(`stroke-dasharray="${options.strokeDasharray}"`);
    if (options?.markerEnd) attrs.push(`marker-end="url(#${options.markerEnd})"`);
    if (options?.markerStart) attrs.push(`marker-start="url(#${options.markerStart})"`);

    this.elements.push(`  <line ${attrs.join(' ')}/>`);
    return this;
  }

  /**
   * Add a polyline
   * @param points - Array of [x, y] coordinate pairs
   * @param options - Line options
   * @returns this for chaining
   */
  addPolyline(points: Array<[number, number]>, options?: SVGLineOptions): this {
    const pointsStr = points.map(p => `${p[0]},${p[1]}`).join(' ');
    const attrs = [`points="${pointsStr}"`, 'fill="none"'];
    if (options?.stroke) attrs.push(`stroke="${options.stroke}"`);
    if (options?.strokeWidth) attrs.push(`stroke-width="${options.strokeWidth}"`);
    if (options?.strokeDasharray) attrs.push(`stroke-dasharray="${options.strokeDasharray}"`);
    if (options?.markerEnd) attrs.push(`marker-end="url(#${options.markerEnd})"`);

    this.elements.push(`  <polyline ${attrs.join(' ')}/>`);
    return this;
  }

  /**
   * Add a polygon
   * @param points - Array of [x, y] coordinate pairs
   * @param options - Shape options
   * @returns this for chaining
   */
  addPolygon(points: Array<[number, number]>, options?: SVGShapeOptions): this {
    const pointsStr = points.map(p => `${p[0]},${p[1]}`).join(' ');
    const attrs = [`points="${pointsStr}"`];
    if (options?.fill) attrs.push(`fill="${options.fill}"`);
    if (options?.stroke) attrs.push(`stroke="${options.stroke}"`);
    if (options?.strokeWidth) attrs.push(`stroke-width="${options.strokeWidth}"`);
    if (options?.opacity !== undefined) attrs.push(`opacity="${options.opacity}"`);
    if (options?.className) attrs.push(`class="${options.className}"`);

    this.elements.push(`  <polygon ${attrs.join(' ')}/>`);
    return this;
  }

  /**
   * Add a path
   * @param d - SVG path data string
   * @param options - Path options
   * @returns this for chaining
   */
  addPath(d: string, options?: SVGPathOptions): this {
    const attrs = [`d="${d}"`];
    if (options?.fill !== undefined) attrs.push(`fill="${options.fill}"`);
    if (options?.stroke) attrs.push(`stroke="${options.stroke}"`);
    if (options?.strokeWidth) attrs.push(`stroke-width="${options.strokeWidth}"`);
    if (options?.strokeDasharray) attrs.push(`stroke-dasharray="${options.strokeDasharray}"`);
    if (options?.opacity !== undefined) attrs.push(`opacity="${options.opacity}"`);
    if (options?.markerEnd) attrs.push(`marker-end="url(#${options.markerEnd})"`);
    if (options?.markerStart) attrs.push(`marker-start="url(#${options.markerStart})"`);

    this.elements.push(`  <path ${attrs.join(' ')}/>`);
    return this;
  }

  /**
   * Add text
   * @param x - X position
   * @param y - Y position
   * @param text - Text content
   * @param options - Text options
   * @returns this for chaining
   */
  addText(x: number, y: number, text: string, options?: SVGTextOptions): this {
    const attrs = [`x="${x}"`, `y="${y}"`];
    if (options?.fill) attrs.push(`fill="${options.fill}"`);
    if (options?.fontSize) attrs.push(`font-size="${options.fontSize}"`);
    if (options?.fontFamily) attrs.push(`font-family="${options.fontFamily}"`);
    if (options?.fontWeight) attrs.push(`font-weight="${options.fontWeight}"`);
    if (options?.textAnchor) attrs.push(`text-anchor="${options.textAnchor}"`);
    if (options?.dominantBaseline) attrs.push(`dominant-baseline="${options.dominantBaseline}"`);
    if (options?.className) attrs.push(`class="${options.className}"`);

    this.elements.push(`  <text ${attrs.join(' ')}>${escapeSVGText(text)}</text>`);
    return this;
  }

  /**
   * Add a group of elements
   * @param id - Optional group ID
   * @returns An SVGGroupBuilder for the group
   */
  addGroup(id?: string): SVGGroupBuilder {
    const group = new SVGGroupBuilder(id);
    // We'll add a placeholder that gets replaced when we render
    this.elements.push(`__GROUP_${this.elements.length}__`);
    // Store reference for later
    (this as unknown as { _groups: Map<string, SVGGroupBuilder> })._groups =
      (this as unknown as { _groups: Map<string, SVGGroupBuilder> })._groups || new Map();
    (this as unknown as { _groups: Map<string, SVGGroupBuilder> })._groups.set(
      `__GROUP_${this.elements.length - 1}__`,
      group
    );
    return group;
  }

  /**
   * Add a rendered group
   * @param group - An SVGGroupBuilder that has been configured
   * @returns this for chaining
   */
  addRenderedGroup(group: SVGGroupBuilder): this {
    this.elements.push(group.render());
    return this;
  }

  /**
   * Add a comment
   * @param comment - Comment text
   * @returns this for chaining
   */
  addComment(comment: string): this {
    this.elements.push(`  <!-- ${comment} -->`);
    return this;
  }

  /**
   * Add raw SVG content
   * @param svg - Raw SVG string
   * @returns this for chaining
   */
  addRaw(svg: string): this {
    this.elements.push(svg);
    return this;
  }

  /**
   * Get the current element count
   * @returns The number of SVG elements added
   */
  get elementCount(): number {
    return this.elements.length;
  }

  /**
   * Clear all elements
   * @returns this for chaining
   */
  clear(): this {
    this.elements = [];
    this.defs = [];
    this.styles = [];
    return this;
  }

  /**
   * Reset to default state
   * @returns this for chaining
   */
  reset(): this {
    this.width = 800;
    this.height = 600;
    this.title = undefined;
    this.background = undefined;
    this.includeDefaultDefs = true;
    this.includeDefaultStyles = true;
    return this.clear();
  }

  /**
   * Render the SVG as a string
   * @returns Complete SVG document string
   */
  render(): string {
    const lines: string[] = [];

    // XML header and SVG opening tag
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" width="${this.width}" height="${this.height}">`);

    // Defs section
    const allDefs: string[] = [];
    if (this.includeDefaultDefs) {
      allDefs.push(`    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#333"/>
    </marker>`);
      allDefs.push(`    <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#e53935"/>
    </marker>`);
      allDefs.push(`    <marker id="arrowhead-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#388e3c"/>
    </marker>`);
      allDefs.push(`    <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#1976d2"/>
    </marker>`);
    }
    allDefs.push(...this.defs.map(d => `    ${d}`));

    if (allDefs.length > 0) {
      lines.push('  <defs>');
      lines.push(...allDefs);
      lines.push('  </defs>');
    }

    // Styles section
    const allStyles: string[] = [];
    if (this.includeDefaultStyles) {
      allStyles.push('    .title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; }');
      allStyles.push('    .subtitle { font-family: Arial, sans-serif; font-size: 12px; fill: #666; font-style: italic; }');
      allStyles.push('    .node-label { font-family: Arial, sans-serif; font-size: 12px; }');
      allStyles.push('    .edge-label { font-family: Arial, sans-serif; font-size: 10px; fill: #666; }');
      allStyles.push('    .metrics { font-family: Arial, sans-serif; font-size: 11px; fill: #444; }');
      allStyles.push('    .legend-text { font-family: Arial, sans-serif; font-size: 10px; }');
    }
    allStyles.push(...this.styles.map(s => `    ${s}`));

    if (allStyles.length > 0) {
      lines.push('');
      lines.push('  <style>');
      lines.push(...allStyles);
      lines.push('  </style>');
    }

    // Background
    lines.push('');
    lines.push(`  <!-- Background -->`);
    lines.push(`  <rect width="100%" height="100%" fill="${this.background || '#fafafa'}"/>`);

    // Title
    if (this.title) {
      lines.push('');
      lines.push('  <!-- Title -->');
      lines.push(`  <text x="${this.width / 2}" y="25" text-anchor="middle" class="title">${escapeSVGText(truncateText(this.title, 60))}</text>`);
    }

    // Elements
    if (this.elements.length > 0) {
      lines.push('');
      lines.push('  <!-- Elements -->');

      // Replace group placeholders with rendered groups
      const groups = (this as unknown as { _groups?: Map<string, SVGGroupBuilder> })._groups;
      for (const element of this.elements) {
        if (element.startsWith('__GROUP_') && groups) {
          const group = groups.get(element);
          if (group) {
            lines.push(group.render());
          }
        } else {
          lines.push(element);
        }
      }
    }

    // Closing tag
    lines.push('</svg>');

    return lines.join('\n');
  }

  /**
   * Create a builder with preset dimensions
   * @param width - Width in pixels
   * @param height - Height in pixels
   * @returns A new SVGBuilder instance
   */
  static withDimensions(width: number, height: number): SVGBuilder {
    return new SVGBuilder().setDimensions(width, height);
  }
}
