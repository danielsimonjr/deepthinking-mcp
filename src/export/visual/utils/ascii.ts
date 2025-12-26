/**
 * ASCII Art Utilities (v8.5.0)
 * Shared utility functions for ASCII diagram generation across all visual exporters
 * Phase 13: Added ASCIIDocBuilder fluent API
 */

// =============================================================================
// Types
// =============================================================================

/** ASCII box style */
export type AsciiBoxStyle = 'single' | 'double' | 'rounded' | 'bold' | 'ascii';

/** ASCII arrow direction */
export type AsciiArrowDirection = 'right' | 'left' | 'up' | 'down' | 'bidirectional';

/** ASCII node definition */
export interface AsciiNode {
  id: string;
  label: string;
  type?: string;
  width?: number;
}

/** ASCII edge definition */
export interface AsciiEdge {
  source: string;
  target: string;
  label?: string;
  direction?: AsciiArrowDirection;
}

/** ASCII section definition */
export interface AsciiSection {
  title: string;
  content: string | string[];
  icon?: string;
}

/** ASCII table column */
export interface AsciiTableColumn {
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

/** ASCII diagram options */
export interface AsciiOptions {
  boxStyle?: AsciiBoxStyle;
  maxWidth?: number;
  indent?: number;
  includeTimestamp?: boolean;
}

// =============================================================================
// Box Drawing Characters
// =============================================================================

/** Box drawing character sets */
export const BOX_CHARS = {
  single: {
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    horizontal: '─',
    vertical: '│',
    teeRight: '├',
    teeLeft: '┤',
    teeDown: '┬',
    teeUp: '┴',
    cross: '┼',
  },
  double: {
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
    horizontal: '═',
    vertical: '║',
    teeRight: '╠',
    teeLeft: '╣',
    teeDown: '╦',
    teeUp: '╩',
    cross: '╬',
  },
  rounded: {
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
    horizontal: '─',
    vertical: '│',
    teeRight: '├',
    teeLeft: '┤',
    teeDown: '┬',
    teeUp: '┴',
    cross: '┼',
  },
  bold: {
    topLeft: '┏',
    topRight: '┓',
    bottomLeft: '┗',
    bottomRight: '┛',
    horizontal: '━',
    vertical: '┃',
    teeRight: '┣',
    teeLeft: '┫',
    teeDown: '┳',
    teeUp: '┻',
    cross: '╋',
  },
  ascii: {
    topLeft: '+',
    topRight: '+',
    bottomLeft: '+',
    bottomRight: '+',
    horizontal: '-',
    vertical: '|',
    teeRight: '+',
    teeLeft: '+',
    teeDown: '+',
    teeUp: '+',
    cross: '+',
  },
};

/** Arrow characters */
export const ARROWS = {
  right: '→',
  left: '←',
  up: '↑',
  down: '↓',
  bidirectional: '↔',
  doubleRight: '⇒',
  doubleLeft: '⇐',
  doubleUp: '⇑',
  doubleDown: '⇓',
  doubleBidirectional: '⇔',
  asciiRight: '->',
  asciiLeft: '<-',
  asciiUp: '^',
  asciiDown: 'v',
  asciiBidirectional: '<->',
};

/** Bullet and list characters */
export const BULLETS = {
  circle: '○',
  filledCircle: '●',
  square: '□',
  filledSquare: '■',
  diamond: '◇',
  filledDiamond: '◆',
  triangle: '△',
  filledTriangle: '▲',
  star: '☆',
  filledStar: '★',
  check: '✓',
  cross: '✗',
  dash: '─',
  bullet: '•',
  asciiBullet: '*',
  asciiDash: '-',
};

// =============================================================================
// String Utilities
// =============================================================================

/**
 * Truncate a string to a maximum length
 */
export function truncateAscii(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Pad a string to a specific width
 */
export function padAscii(
  str: string,
  width: number,
  align: 'left' | 'center' | 'right' = 'left',
  padChar: string = ' '
): string {
  if (str.length >= width) return str.substring(0, width);

  const padding = width - str.length;

  switch (align) {
    case 'right':
      return padChar.repeat(padding) + str;
    case 'center':
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      return padChar.repeat(leftPad) + str + padChar.repeat(rightPad);
    case 'left':
    default:
      return str + padChar.repeat(padding);
  }
}

/**
 * Wrap text to a maximum width
 */
export function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length === 0) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Indent text by a number of spaces
 */
export function indentText(text: string, spaces: number = 2): string {
  const indent = ' '.repeat(spaces);
  return text.split('\n').map(line => indent + line).join('\n');
}

// =============================================================================
// Header and Title Rendering
// =============================================================================

/**
 * Generate a title header with underline
 */
export function generateAsciiHeader(
  title: string,
  style: 'single' | 'double' | 'equals' | 'dash' = 'equals'
): string {
  const underlineChar = style === 'double' ? '═' : style === 'equals' ? '=' : style === 'single' ? '─' : '-';
  const underline = underlineChar.repeat(title.length);
  return `${title}\n${underline}`;
}

/**
 * Generate a section header
 */
export function generateAsciiSectionHeader(title: string, icon?: string): string {
  const prefix = icon ? `${icon} ` : '';
  return `${prefix}${title}:\n${'-'.repeat((prefix + title + ':').length)}`;
}

/**
 * Generate a boxed title
 */
export function generateAsciiBoxedTitle(
  title: string,
  style: AsciiBoxStyle = 'single'
): string {
  const chars = BOX_CHARS[style];
  const width = title.length + 4;

  const top = chars.topLeft + chars.horizontal.repeat(width - 2) + chars.topRight;
  const middle = chars.vertical + ' ' + title + ' ' + chars.vertical;
  const bottom = chars.bottomLeft + chars.horizontal.repeat(width - 2) + chars.bottomRight;

  return `${top}\n${middle}\n${bottom}`;
}

// =============================================================================
// Box Rendering
// =============================================================================

/**
 * Generate an ASCII box around content
 */
export function generateAsciiBox(
  content: string | string[],
  options: {
    style?: AsciiBoxStyle;
    title?: string;
    width?: number;
    padding?: number;
  } = {}
): string {
  const { style = 'single', title, width, padding = 1 } = options;
  const chars = BOX_CHARS[style];

  const lines = Array.isArray(content) ? content : content.split('\n');

  // Calculate width
  let maxContentWidth = Math.max(...lines.map(l => l.length));
  if (title) {
    maxContentWidth = Math.max(maxContentWidth, title.length);
  }
  const boxWidth = width || maxContentWidth + padding * 2 + 2;
  const contentWidth = boxWidth - 2 - padding * 2;

  const result: string[] = [];

  // Top border with optional title
  if (title) {
    const titlePadded = ' ' + title + ' ';
    const leftBorder = Math.floor((boxWidth - 2 - titlePadded.length) / 2);
    const rightBorder = boxWidth - 2 - titlePadded.length - leftBorder;
    result.push(
      chars.topLeft +
      chars.horizontal.repeat(leftBorder) +
      titlePadded +
      chars.horizontal.repeat(rightBorder) +
      chars.topRight
    );
  } else {
    result.push(chars.topLeft + chars.horizontal.repeat(boxWidth - 2) + chars.topRight);
  }

  // Padding top
  for (let i = 0; i < padding; i++) {
    result.push(chars.vertical + ' '.repeat(boxWidth - 2) + chars.vertical);
  }

  // Content
  for (const line of lines) {
    const paddedLine = padAscii(line, contentWidth, 'left');
    result.push(
      chars.vertical +
      ' '.repeat(padding) +
      paddedLine +
      ' '.repeat(padding) +
      chars.vertical
    );
  }

  // Padding bottom
  for (let i = 0; i < padding; i++) {
    result.push(chars.vertical + ' '.repeat(boxWidth - 2) + chars.vertical);
  }

  // Bottom border
  result.push(chars.bottomLeft + chars.horizontal.repeat(boxWidth - 2) + chars.bottomRight);

  return result.join('\n');
}

// =============================================================================
// List Rendering
// =============================================================================

/**
 * Generate a bullet list
 */
export function generateAsciiBulletList(
  items: string[],
  bullet: keyof typeof BULLETS = 'bullet',
  indent: number = 2
): string {
  const bulletChar = BULLETS[bullet];
  const indentStr = ' '.repeat(indent);
  return items.map(item => `${indentStr}${bulletChar} ${item}`).join('\n');
}

/**
 * Generate a numbered list
 */
export function generateAsciiNumberedList(
  items: string[],
  indent: number = 2,
  startNumber: number = 1
): string {
  const indentStr = ' '.repeat(indent);
  const maxNumWidth = String(startNumber + items.length - 1).length;

  return items.map((item, index) => {
    const num = String(startNumber + index).padStart(maxNumWidth, ' ');
    return `${indentStr}${num}. ${item}`;
  }).join('\n');
}

/** Recursive tree node type for ASCII tree rendering */
export interface AsciiTreeNode {
  label: string;
  children?: AsciiTreeNode[];
}

/**
 * Generate a tree/hierarchy list
 */
export function generateAsciiTreeList(
  items: AsciiTreeNode[],
  prefix: string = ''
): string {
  const lines: string[] = [];

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = isLast ? '    ' : '│   ';

    lines.push(prefix + connector + item.label);

    if (item.children && item.children.length > 0) {
      const childTree = generateAsciiTreeList(
        item.children,
        prefix + childPrefix
      );
      lines.push(childTree);
    }
  });

  return lines.join('\n');
}

// =============================================================================
// Table Rendering
// =============================================================================

/**
 * Generate an ASCII table
 */
export function generateAsciiTable(
  headers: string[],
  rows: string[][],
  options: {
    style?: AsciiBoxStyle;
    columnWidths?: number[];
    alignments?: Array<'left' | 'center' | 'right'>;
  } = {}
): string {
  const { style = 'single', columnWidths, alignments } = options;
  const chars = BOX_CHARS[style];

  // Calculate column widths
  const widths = columnWidths || headers.map((header, colIndex) => {
    const colValues = [header, ...rows.map(row => row[colIndex] || '')];
    return Math.max(...colValues.map(v => String(v).length));
  });

  // Helper to render a row
  const renderRow = (cells: string[]): string => {
    return chars.vertical + cells.map((cell, i) => {
      const align = alignments?.[i] || 'left';
      return ' ' + padAscii(String(cell), widths[i], align) + ' ';
    }).join(chars.vertical) + chars.vertical;
  };

  // Helper to render a separator
  const renderSeparator = (left: string, mid: string, right: string): string => {
    return left + widths.map(w => chars.horizontal.repeat(w + 2)).join(mid) + right;
  };

  const result: string[] = [];

  // Top border
  result.push(renderSeparator(chars.topLeft, chars.teeDown, chars.topRight));

  // Headers
  result.push(renderRow(headers));

  // Header separator
  result.push(renderSeparator(chars.teeRight, chars.cross, chars.teeLeft));

  // Rows
  for (const row of rows) {
    result.push(renderRow(row));
  }

  // Bottom border
  result.push(renderSeparator(chars.bottomLeft, chars.teeUp, chars.bottomRight));

  return result.join('\n');
}

// =============================================================================
// Arrow and Flow Rendering
// =============================================================================

/**
 * Get an arrow character
 */
export function getAsciiArrow(
  direction: AsciiArrowDirection,
  useAscii: boolean = false
): string {
  if (useAscii) {
    switch (direction) {
      case 'right': return ARROWS.asciiRight;
      case 'left': return ARROWS.asciiLeft;
      case 'up': return ARROWS.asciiUp;
      case 'down': return ARROWS.asciiDown;
      case 'bidirectional': return ARROWS.asciiBidirectional;
    }
  }
  return ARROWS[direction];
}

/**
 * Generate a simple flow diagram
 */
export function generateAsciiFlowDiagram(
  steps: string[],
  direction: 'horizontal' | 'vertical' = 'vertical',
  options: { boxStyle?: AsciiBoxStyle; maxWidth?: number } = {}
): string {
  const { boxStyle = 'single', maxWidth = 40 } = options;

  if (steps.length === 0) {
    return generateAsciiBox('(empty)', { style: boxStyle });
  }

  if (direction === 'horizontal') {
    // Horizontal layout: [Step 1] → [Step 2] → [Step 3]
    const boxes = steps.map(step => {
      const truncated = truncateAscii(step, maxWidth);
      return `[${truncated}]`;
    });
    return boxes.join(' → ');
  }

  // Vertical layout
  const lines: string[] = [];
  const chars = BOX_CHARS[boxStyle];

  for (let i = 0; i < steps.length; i++) {
    const step = truncateAscii(steps[i], maxWidth);
    const boxWidth = Math.max(step.length + 4, 20);

    // Top border
    lines.push(chars.topLeft + chars.horizontal.repeat(boxWidth - 2) + chars.topRight);
    // Content
    lines.push(chars.vertical + ' ' + padAscii(step, boxWidth - 4) + ' ' + chars.vertical);
    // Bottom border
    lines.push(chars.bottomLeft + chars.horizontal.repeat(boxWidth - 2) + chars.bottomRight);

    // Arrow to next step
    if (i < steps.length - 1) {
      const arrowPadding = ' '.repeat(Math.floor(boxWidth / 2) - 1);
      lines.push(arrowPadding + '↓');
    }
  }

  return lines.join('\n');
}

// =============================================================================
// Section and Document Rendering
// =============================================================================

/**
 * Generate a complete ASCII section
 */
export function generateAsciiSection(section: AsciiSection): string {
  const lines: string[] = [];

  // Section header
  lines.push(generateAsciiSectionHeader(section.title, section.icon));
  lines.push('');

  // Content
  if (Array.isArray(section.content)) {
    lines.push(section.content.join('\n'));
  } else {
    lines.push(section.content);
  }

  return lines.join('\n');
}

/**
 * Generate a complete ASCII document
 */
export function generateAsciiDocument(
  title: string,
  sections: AsciiSection[],
  options: AsciiOptions = {}
): string {
  const { includeTimestamp = false } = options;

  const lines: string[] = [];

  // Title
  lines.push(generateAsciiHeader(title, 'double'));
  lines.push('');

  // Timestamp
  if (includeTimestamp) {
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');
  }

  // Sections
  for (let i = 0; i < sections.length; i++) {
    lines.push(generateAsciiSection(sections[i]));
    if (i < sections.length - 1) {
      lines.push('');
    }
  }

  return lines.join('\n');
}

// =============================================================================
// Metrics and Progress Rendering
// =============================================================================

/**
 * Generate an ASCII progress bar
 */
export function generateAsciiProgressBar(
  value: number,
  max: number = 100,
  width: number = 20,
  options: { filled?: string; empty?: string; showPercent?: boolean } = {}
): string {
  const { filled = '█', empty = '░', showPercent = true } = options;

  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const filledWidth = Math.round((percent / 100) * width);
  const emptyWidth = width - filledWidth;

  const bar = filled.repeat(filledWidth) + empty.repeat(emptyWidth);
  const percentStr = showPercent ? ` ${percent.toFixed(0)}%` : '';

  return `[${bar}]${percentStr}`;
}

/**
 * Generate an ASCII metric display
 */
export function generateAsciiMetric(
  label: string,
  value: string | number,
  maxLabelWidth: number = 20
): string {
  const paddedLabel = padAscii(label + ':', maxLabelWidth, 'left');
  return `${paddedLabel} ${value}`;
}

/**
 * Generate ASCII metrics panel
 */
export function generateAsciiMetricsPanel(
  metrics: Array<{ label: string; value: string | number }>,
  options: { style?: AsciiBoxStyle; title?: string } = {}
): string {
  const { style = 'single', title = 'Metrics' } = options;

  const maxLabelWidth = Math.max(...metrics.map(m => m.label.length)) + 1;
  const content = metrics.map(m => generateAsciiMetric(m.label, m.value, maxLabelWidth));

  return generateAsciiBox(content, { style, title });
}

// =============================================================================
// Graph/Network Rendering
// =============================================================================

/**
 * Generate a simple ASCII graph representation
 */
export function generateAsciiGraph(
  nodes: AsciiNode[],
  edges: AsciiEdge[]
): string {
  const lines: string[] = [];

  lines.push('Nodes:');
  for (const node of nodes) {
    const typeStr = node.type ? ` [${node.type}]` : '';
    lines.push(`  ${BULLETS.filledCircle} ${node.label}${typeStr}`);
  }

  if (edges.length > 0) {
    lines.push('');
    lines.push('Edges:');
    for (const edge of edges) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      const arrow = getAsciiArrow(edge.direction || 'right');
      const label = edge.label ? ` (${edge.label})` : '';
      lines.push(`  ${sourceNode?.label || edge.source} ${arrow} ${targetNode?.label || edge.target}${label}`);
    }
  }

  return lines.join('\n');
}

/**
 * Generate a linear ASCII flow
 */
export function generateLinearFlowAscii(
  steps: string[],
  options: AsciiOptions = {}
): string {
  return generateAsciiFlowDiagram(steps, 'vertical', options);
}

/**
 * Generate a hierarchical ASCII representation
 */
export function generateHierarchyAscii(
  root: AsciiTreeNode
): string {
  const lines: string[] = [];

  lines.push(root.label);

  if (root.children && root.children.length > 0) {
    lines.push(generateAsciiTreeList(root.children));
  }

  return lines.join('\n');
}

// =============================================================================
// ASCIIDocBuilder - Fluent API Builder Class (Phase 13)
// =============================================================================

/** Header style for ASCIIDocBuilder */
export type ASCIIHeaderStyle = 'single' | 'double' | 'equals' | 'dash';

/** Options for ASCIIDocBuilder */
export interface ASCIIDocBuilderOptions {
  boxStyle?: AsciiBoxStyle;
  maxWidth?: number;
  indent?: number;
  includeTimestamp?: boolean;
}

/**
 * Fluent API builder for ASCII documents
 *
 * Provides a chainable interface for constructing ASCII documents,
 * wrapping the existing utility functions for easier use.
 *
 * @example
 * ```typescript
 * const doc = new ASCIIDocBuilder()
 *   .addHeader('My Document', 'double')
 *   .addSection('Introduction')
 *   .addBulletList(['Item 1', 'Item 2', 'Item 3'])
 *   .addBox('Important Note', { title: 'Note' })
 *   .render();
 * ```
 */
export class ASCIIDocBuilder {
  private content: string[] = [];
  private options: ASCIIDocBuilderOptions = {};

  /**
   * Set or merge document options
   * @param options - Document options to set/merge
   * @returns this for chaining
   */
  setOptions(options: ASCIIDocBuilderOptions): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Set the box style for subsequent boxes
   * @param style - The box style to use
   * @returns this for chaining
   */
  setBoxStyle(style: AsciiBoxStyle): this {
    this.options.boxStyle = style;
    return this;
  }

  /**
   * Set the maximum width for content
   * @param width - Maximum width in characters
   * @returns this for chaining
   */
  setMaxWidth(width: number): this {
    this.options.maxWidth = width;
    return this;
  }

  /**
   * Set the indent level
   * @param indent - Number of spaces for indentation
   * @returns this for chaining
   */
  setIndent(indent: number): this {
    this.options.indent = indent;
    return this;
  }

  /**
   * Add a header with underline
   * @param title - The header title
   * @param style - The underline style (default: 'equals')
   * @returns this for chaining
   */
  addHeader(title: string, style: ASCIIHeaderStyle = 'equals'): this {
    this.content.push(generateAsciiHeader(title, style));
    return this;
  }

  /**
   * Add a section header
   * @param title - The section title
   * @param icon - Optional icon prefix
   * @returns this for chaining
   */
  addSection(title: string, icon?: string): this {
    this.content.push(generateAsciiSectionHeader(title, icon));
    return this;
  }

  /**
   * Add a boxed title
   * @param title - The title to box
   * @param style - The box style (uses builder default if not specified)
   * @returns this for chaining
   */
  addBoxedTitle(title: string, style?: AsciiBoxStyle): this {
    this.content.push(generateAsciiBoxedTitle(title, style || this.options.boxStyle || 'single'));
    return this;
  }

  /**
   * Add a bullet list
   * @param items - Array of list items
   * @param bullet - The bullet style (default: 'bullet')
   * @param indent - Indentation level (uses builder default if not specified)
   * @returns this for chaining
   */
  addBulletList(items: string[], bullet: keyof typeof BULLETS = 'bullet', indent?: number): this {
    this.content.push(generateAsciiBulletList(items, bullet, indent ?? this.options.indent ?? 2));
    return this;
  }

  /**
   * Add a numbered list
   * @param items - Array of list items
   * @param indent - Indentation level (uses builder default if not specified)
   * @param startNumber - Starting number (default: 1)
   * @returns this for chaining
   */
  addNumberedList(items: string[], indent?: number, startNumber: number = 1): this {
    this.content.push(generateAsciiNumberedList(items, indent ?? this.options.indent ?? 2, startNumber));
    return this;
  }

  /**
   * Add a box around content
   * @param content - The content to box (string or array of lines)
   * @param boxOptions - Box options (title, style, width, padding)
   * @returns this for chaining
   */
  addBox(content: string | string[], boxOptions?: {
    style?: AsciiBoxStyle;
    title?: string;
    width?: number;
    padding?: number;
  }): this {
    const mergedOptions = {
      style: boxOptions?.style || this.options.boxStyle || 'single',
      title: boxOptions?.title,
      width: boxOptions?.width,
      padding: boxOptions?.padding,
    };
    this.content.push(generateAsciiBox(content, mergedOptions));
    return this;
  }

  /**
   * Add a tree/hierarchy structure
   * @param root - The root node of the tree
   * @returns this for chaining
   */
  addTree(root: AsciiTreeNode): this {
    this.content.push(generateHierarchyAscii(root));
    return this;
  }

  /**
   * Add a tree list (without root label)
   * @param items - Array of tree nodes
   * @returns this for chaining
   */
  addTreeList(items: AsciiTreeNode[]): this {
    this.content.push(generateAsciiTreeList(items));
    return this;
  }

  /**
   * Add a table
   * @param headers - Array of column headers
   * @param rows - 2D array of row data
   * @param tableOptions - Table options (style, columnWidths, alignments)
   * @returns this for chaining
   */
  addTable(headers: string[], rows: string[][], tableOptions?: {
    style?: AsciiBoxStyle;
    columnWidths?: number[];
    alignments?: Array<'left' | 'center' | 'right'>;
  }): this {
    const mergedOptions = {
      style: tableOptions?.style || this.options.boxStyle || 'single',
      columnWidths: tableOptions?.columnWidths,
      alignments: tableOptions?.alignments,
    };
    this.content.push(generateAsciiTable(headers, rows, mergedOptions));
    return this;
  }

  /**
   * Add a flow diagram
   * @param steps - Array of step labels
   * @param direction - Flow direction ('horizontal' or 'vertical')
   * @returns this for chaining
   */
  addFlowDiagram(steps: string[], direction: 'horizontal' | 'vertical' = 'vertical'): this {
    this.content.push(generateAsciiFlowDiagram(steps, direction, {
      boxStyle: this.options.boxStyle,
      maxWidth: this.options.maxWidth,
    }));
    return this;
  }

  /**
   * Add a progress bar
   * @param value - Current value
   * @param max - Maximum value (default: 100)
   * @param width - Bar width in characters (default: 20)
   * @param barOptions - Progress bar options
   * @returns this for chaining
   */
  addProgressBar(value: number, max: number = 100, width: number = 20, barOptions?: {
    filled?: string;
    empty?: string;
    showPercent?: boolean;
  }): this {
    this.content.push(generateAsciiProgressBar(value, max, width, barOptions));
    return this;
  }

  /**
   * Add a metrics panel
   * @param metrics - Array of label/value pairs
   * @param panelOptions - Panel options (style, title)
   * @returns this for chaining
   */
  addMetricsPanel(metrics: Array<{ label: string; value: string | number }>, panelOptions?: {
    style?: AsciiBoxStyle;
    title?: string;
  }): this {
    const mergedOptions = {
      style: panelOptions?.style || this.options.boxStyle || 'single',
      title: panelOptions?.title || 'Metrics',
    };
    this.content.push(generateAsciiMetricsPanel(metrics, mergedOptions));
    return this;
  }

  /**
   * Add a graph representation
   * @param nodes - Array of graph nodes
   * @param edges - Array of graph edges
   * @returns this for chaining
   */
  addGraph(nodes: AsciiNode[], edges: AsciiEdge[]): this {
    this.content.push(generateAsciiGraph(nodes, edges));
    return this;
  }

  /**
   * Add raw text content
   * @param text - The text to add
   * @returns this for chaining
   */
  addText(text: string): this {
    this.content.push(text);
    return this;
  }

  /**
   * Add an empty line
   * @param count - Number of empty lines to add (default: 1)
   * @returns this for chaining
   */
  addEmptyLine(count: number = 1): this {
    for (let i = 0; i < count; i++) {
      this.content.push('');
    }
    return this;
  }

  /**
   * Add a horizontal rule
   * @param width - Width of the rule (default: 40)
   * @param char - Character to use (default: '-')
   * @returns this for chaining
   */
  addHorizontalRule(width: number = 40, char: string = '-'): this {
    this.content.push(char.repeat(width));
    return this;
  }

  /**
   * Get the current content line count
   * @returns The total number of lines in the document
   */
  get lineCount(): number {
    return this.content.reduce((count, item) => {
      return count + (item.split('\n').length);
    }, 0);
  }

  /**
   * Get the current content section count
   * @returns The number of content sections in the document
   */
  get sectionCount(): number {
    return this.content.length;
  }

  /**
   * Clear all content
   * @returns this for chaining
   */
  clear(): this {
    this.content = [];
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
   * Render the document as a string
   * @param separator - Separator between content sections (default: '\n')
   * @returns The complete ASCII document
   */
  render(separator: string = '\n'): string {
    let result = this.content.join(separator);

    if (this.options.includeTimestamp) {
      result = `Generated: ${new Date().toISOString()}\n\n${result}`;
    }

    return result;
  }

  /**
   * Create a builder with pre-configured options
   * @param options - Initial options
   * @returns A new ASCIIDocBuilder instance
   */
  static withOptions(options: ASCIIDocBuilderOptions): ASCIIDocBuilder {
    const builder = new ASCIIDocBuilder();
    builder.options = { ...options };
    return builder;
  }
}
