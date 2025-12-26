/**
 * Markdown Export Utilities (v8.5.0)
 * Phase 12: Shared utilities for Markdown visual exports
 * Phase 13 Sprint 3: Added MarkdownBuilder fluent API
 *
 * Provides reusable functions for generating Markdown exports across all modes.
 */

/**
 * Markdown heading levels
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Table alignment options
 */
export type TableAlignment = 'left' | 'center' | 'right';

/**
 * List style options
 */
export type ListStyle = 'bullet' | 'numbered' | 'checkbox' | 'checkbox-checked';

/**
 * Generate a Markdown heading
 */
export function heading(text: string, level: HeadingLevel = 1): string {
  const prefix = '#'.repeat(level);
  return `${prefix} ${text}\n`;
}

/**
 * Generate bold text
 */
export function bold(text: string): string {
  return `**${text}**`;
}

/**
 * Generate italic text
 */
export function italic(text: string): string {
  return `*${text}*`;
}

/**
 * Generate strikethrough text
 */
export function strikethrough(text: string): string {
  return `~~${text}~~`;
}

/**
 * Generate inline code
 */
export function inlineCode(text: string): string {
  return `\`${text}\``;
}

/**
 * Generate a code block
 */
export function codeBlock(code: string, language: string = ''): string {
  return `\`\`\`${language}\n${code}\n\`\`\`\n`;
}

/**
 * Generate a blockquote
 */
export function blockquote(text: string): string {
  const lines = text.split('\n');
  return lines.map(line => `> ${line}`).join('\n') + '\n';
}

/**
 * Generate a horizontal rule
 */
export function horizontalRule(): string {
  return '\n---\n\n';
}

/**
 * Generate a link
 */
export function link(text: string, url: string, title?: string): string {
  if (title) {
    return `[${text}](${url} "${title}")`;
  }
  return `[${text}](${url})`;
}

/**
 * Generate an image
 */
export function image(alt: string, url: string, title?: string): string {
  if (title) {
    return `![${alt}](${url} "${title}")`;
  }
  return `![${alt}](${url})`;
}

/**
 * Generate a list item
 */
export function listItem(text: string, style: ListStyle = 'bullet', indent: number = 0): string {
  const indentStr = '  '.repeat(indent);
  switch (style) {
    case 'numbered':
      return `${indentStr}1. ${text}`;
    case 'checkbox':
      return `${indentStr}- [ ] ${text}`;
    case 'checkbox-checked':
      return `${indentStr}- [x] ${text}`;
    case 'bullet':
    default:
      return `${indentStr}- ${text}`;
  }
}

/**
 * Generate a list
 */
export function list(items: string[], style: ListStyle = 'bullet'): string {
  return items.map((item, index) => {
    if (style === 'numbered') {
      return `${index + 1}. ${item}`;
    }
    return listItem(item, style);
  }).join('\n') + '\n';
}

/**
 * Generate a nested list
 */
export function nestedList(items: Array<{ text: string; children?: string[] }>, style: ListStyle = 'bullet'): string {
  const lines: string[] = [];
  items.forEach((item, index) => {
    if (style === 'numbered') {
      lines.push(`${index + 1}. ${item.text}`);
    } else {
      lines.push(listItem(item.text, style));
    }
    if (item.children && item.children.length > 0) {
      item.children.forEach(child => {
        lines.push(listItem(child, style, 1));
      });
    }
  });
  return lines.join('\n') + '\n';
}

/**
 * Generate a table header separator based on alignment
 */
function getAlignmentSeparator(alignment: TableAlignment): string {
  switch (alignment) {
    case 'center':
      return ':---:';
    case 'right':
      return '---:';
    case 'left':
    default:
      return ':---';
  }
}

/**
 * Escape pipe characters in table cells
 */
function escapeTableCell(text: string): string {
  return text.replace(/\|/g, '\\|');
}

/**
 * Generate a Markdown table
 */
export function table(
  headers: string[],
  rows: string[][],
  alignments?: TableAlignment[]
): string {
  const aligns = alignments || headers.map(() => 'left' as TableAlignment);

  // Header row
  const headerRow = '| ' + headers.map(escapeTableCell).join(' | ') + ' |';

  // Separator row
  const separatorRow = '| ' + aligns.map(getAlignmentSeparator).join(' | ') + ' |';

  // Data rows
  const dataRows = rows.map(row => {
    const cells = row.map(escapeTableCell);
    // Pad with empty cells if needed
    while (cells.length < headers.length) {
      cells.push('');
    }
    return '| ' + cells.join(' | ') + ' |';
  });

  return [headerRow, separatorRow, ...dataRows].join('\n') + '\n';
}

/**
 * Generate a definition list (using bold terms and indented definitions)
 */
export function definitionList(items: Array<{ term: string; definition: string }>): string {
  return items.map(item => `${bold(item.term)}\n: ${item.definition}`).join('\n\n') + '\n';
}

/**
 * Generate a task list
 */
export function taskList(items: Array<{ text: string; completed: boolean }>): string {
  return items.map(item => listItem(item.text, item.completed ? 'checkbox-checked' : 'checkbox')).join('\n') + '\n';
}

/**
 * Generate a collapsible section (details/summary)
 */
export function collapsible(summary: string, content: string): string {
  return `<details>\n<summary>${summary}</summary>\n\n${content}\n</details>\n`;
}

/**
 * Generate a badge (GitHub-style)
 */
export function badge(label: string, value: string, color: string = 'blue'): string {
  const encodedLabel = encodeURIComponent(label.replace(/-/g, '--'));
  const encodedValue = encodeURIComponent(value.replace(/-/g, '--'));
  return `![${label}](https://img.shields.io/badge/${encodedLabel}-${encodedValue}-${color})`;
}

/**
 * Generate a progress indicator
 */
export function progressBar(value: number, max: number = 100, width: number = 20): string {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `${bar} ${percentage.toFixed(0)}%`;
}

/**
 * Generate a metric display
 */
export function metric(name: string, value: string | number, unit?: string): string {
  const valueStr = unit ? `${value} ${unit}` : String(value);
  return `${bold(name)}: ${valueStr}`;
}

/**
 * Generate a key-value section
 */
export function keyValueSection(items: Record<string, string | number | boolean>): string {
  return Object.entries(items)
    .map(([key, value]) => `- ${bold(key)}: ${value}`)
    .join('\n') + '\n';
}

/**
 * Generate a Mermaid diagram block
 */
export function mermaidBlock(diagram: string): string {
  return codeBlock(diagram, 'mermaid');
}

/**
 * Generate a section with heading and content
 */
export function section(title: string, content: string, level: HeadingLevel = 2): string {
  return heading(title, level) + '\n' + content + '\n';
}

/**
 * Generate document frontmatter (YAML)
 */
export function frontmatter(metadata: Record<string, string | number | boolean | string[]>): string {
  const lines = ['---'];
  for (const [key, value] of Object.entries(metadata)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      value.forEach(v => lines.push(`  - ${v}`));
    } else {
      lines.push(`${key}: ${typeof value === 'string' ? `"${value}"` : value}`);
    }
  }
  lines.push('---', '');
  return lines.join('\n');
}

/**
 * Generate a complete Markdown document
 */
export function document(
  title: string,
  content: string,
  options: {
    includeFrontmatter?: boolean;
    metadata?: Record<string, string | number | boolean | string[]>;
    includeTableOfContents?: boolean;
  } = {}
): string {
  const { includeFrontmatter = false, metadata = {}, includeTableOfContents = false } = options;

  const parts: string[] = [];

  // Frontmatter
  if (includeFrontmatter) {
    const fm = {
      title,
      date: new Date().toISOString().split('T')[0],
      ...metadata,
    };
    parts.push(frontmatter(fm));
  }

  // Title
  parts.push(heading(title, 1));

  // Table of contents placeholder
  if (includeTableOfContents) {
    parts.push('\n## Table of Contents\n\n[TOC]\n');
  }

  // Content
  parts.push(content);

  return parts.join('\n');
}

/**
 * Generate a node representation for graphs
 */
export function graphNode(id: string, label: string, properties?: Record<string, string>): string {
  let result = `- ${bold(id)}: ${label}`;
  if (properties && Object.keys(properties).length > 0) {
    const props = Object.entries(properties)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ');
    result += ` (${props})`;
  }
  return result;
}

/**
 * Generate an edge representation for graphs
 */
export function graphEdge(from: string, to: string, label?: string, directed: boolean = true): string {
  const arrow = directed ? '→' : '—';
  const labelPart = label ? ` [${label}]` : '';
  return `- ${from} ${arrow} ${to}${labelPart}`;
}

/**
 * Generate a graph in Markdown format
 */
export function graph(
  title: string,
  nodes: Array<{ id: string; label: string; properties?: Record<string, string> }>,
  edges: Array<{ from: string; to: string; label?: string }>,
  options: { directed?: boolean } = {}
): string {
  const { directed = true } = options;

  const parts: string[] = [];

  parts.push(heading(title, 3));

  if (nodes.length > 0) {
    parts.push(heading('Nodes', 4));
    nodes.forEach(node => {
      parts.push(graphNode(node.id, node.label, node.properties));
    });
    parts.push('');
  }

  if (edges.length > 0) {
    parts.push(heading('Edges', 4));
    edges.forEach(edge => {
      parts.push(graphEdge(edge.from, edge.to, edge.label, directed));
    });
    parts.push('');
  }

  return parts.join('\n');
}

/**
 * Escape special Markdown characters
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_{}[\]()#+\-.!|])/g, '\\$1');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// =============================================================================
// MarkdownBuilder Fluent API (Phase 13 Sprint 3)
// =============================================================================

/**
 * MarkdownBuilder options
 */
export interface MarkdownBuilderOptions {
  includeFrontmatter?: boolean;
  metadata?: Record<string, string | number | boolean | string[]>;
  includeTableOfContents?: boolean;
}

/**
 * MarkdownBuilder - Fluent API for building Markdown documents
 *
 * @example
 * ```typescript
 * const md = new MarkdownBuilder()
 *   .addHeading(1, 'Main Title')
 *   .addParagraph('This is a paragraph.')
 *   .addBulletList(['Item 1', 'Item 2', 'Item 3'])
 *   .addCodeBlock('console.log("Hello");', 'javascript')
 *   .render();
 * ```
 */
export class MarkdownBuilder {
  private content: string[] = [];
  private options: MarkdownBuilderOptions = {};
  private documentTitle: string = '';

  /**
   * Set or merge builder options
   * @param options - Options to set/merge
   * @returns this for chaining
   */
  setOptions(options: MarkdownBuilderOptions): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Set the document title (for frontmatter)
   * @param title - The document title
   * @returns this for chaining
   */
  setTitle(title: string): this {
    this.documentTitle = title;
    return this;
  }

  /**
   * Enable frontmatter generation
   * @param metadata - Optional metadata to include
   * @returns this for chaining
   */
  enableFrontmatter(metadata?: Record<string, string | number | boolean | string[]>): this {
    this.options.includeFrontmatter = true;
    if (metadata) {
      this.options.metadata = { ...this.options.metadata, ...metadata };
    }
    return this;
  }

  /**
   * Enable table of contents generation
   * @returns this for chaining
   */
  enableTableOfContents(): this {
    this.options.includeTableOfContents = true;
    return this;
  }

  /**
   * Add a heading
   * @param level - Heading level (1-6)
   * @param text - Heading text
   * @returns this for chaining
   */
  addHeading(level: HeadingLevel, text: string): this {
    this.content.push(heading(text, level));
    return this;
  }

  /**
   * Add a paragraph
   * @param text - Paragraph text
   * @returns this for chaining
   */
  addParagraph(text: string): this {
    this.content.push(text + '\n');
    return this;
  }

  /**
   * Add a bullet list
   * @param items - List items
   * @returns this for chaining
   */
  addBulletList(items: string[]): this {
    this.content.push(list(items, 'bullet'));
    return this;
  }

  /**
   * Add a numbered list
   * @param items - List items
   * @returns this for chaining
   */
  addNumberedList(items: string[]): this {
    this.content.push(list(items, 'numbered'));
    return this;
  }

  /**
   * Add a task list
   * @param items - Task items with completion status
   * @returns this for chaining
   */
  addTaskList(items: Array<{ text: string; completed: boolean }>): this {
    this.content.push(taskList(items));
    return this;
  }

  /**
   * Add a code block
   * @param code - The code content
   * @param language - Optional language for syntax highlighting
   * @returns this for chaining
   */
  addCodeBlock(code: string, language?: string): this {
    this.content.push(codeBlock(code, language));
    return this;
  }

  /**
   * Add a table
   * @param headers - Table headers
   * @param rows - Table rows
   * @param alignments - Optional column alignments
   * @returns this for chaining
   */
  addTable(headers: string[], rows: string[][], alignments?: TableAlignment[]): this {
    this.content.push(table(headers, rows, alignments));
    return this;
  }

  /**
   * Add a blockquote
   * @param text - Quoted text
   * @returns this for chaining
   */
  addBlockquote(text: string): this {
    this.content.push(blockquote(text));
    return this;
  }

  /**
   * Add a horizontal rule
   * @returns this for chaining
   */
  addHorizontalRule(): this {
    this.content.push(horizontalRule());
    return this;
  }

  /**
   * Add a link
   * @param text - Link text
   * @param url - Link URL
   * @param title - Optional link title
   * @returns this for chaining
   */
  addLink(text: string, url: string, title?: string): this {
    this.content.push(link(text, url, title) + '\n');
    return this;
  }

  /**
   * Add an image
   * @param alt - Alt text
   * @param url - Image URL
   * @param title - Optional image title
   * @returns this for chaining
   */
  addImage(alt: string, url: string, title?: string): this {
    this.content.push(image(alt, url, title) + '\n');
    return this;
  }

  /**
   * Add a Mermaid diagram
   * @param diagram - Mermaid diagram content
   * @returns this for chaining
   */
  addMermaidDiagram(diagram: string): this {
    this.content.push(mermaidBlock(diagram));
    return this;
  }

  /**
   * Add a collapsible section
   * @param summary - Summary text
   * @param detailContent - Content inside the collapsible
   * @returns this for chaining
   */
  addCollapsible(summary: string, detailContent: string): this {
    this.content.push(collapsible(summary, detailContent));
    return this;
  }

  /**
   * Add a key-value section
   * @param items - Key-value pairs
   * @returns this for chaining
   */
  addKeyValueSection(items: Record<string, string | number | boolean>): this {
    this.content.push(keyValueSection(items));
    return this;
  }

  /**
   * Add raw Markdown content
   * @param markdown - Raw Markdown string
   * @returns this for chaining
   */
  addRaw(markdown: string): this {
    this.content.push(markdown);
    return this;
  }

  /**
   * Add a section with heading and content
   * @param title - Section title
   * @param sectionContent - Section content
   * @param level - Heading level (default: 2)
   * @returns this for chaining
   */
  addSection(title: string, sectionContent: string, level: HeadingLevel = 2): this {
    this.content.push(section(title, sectionContent, level));
    return this;
  }

  /**
   * Add a badge (GitHub style)
   * @param label - Badge label
   * @param value - Badge value
   * @param color - Badge color (default: 'blue')
   * @returns this for chaining
   */
  addBadge(label: string, value: string, color: string = 'blue'): this {
    this.content.push(badge(label, value, color) + '\n');
    return this;
  }

  /**
   * Add a progress bar
   * @param value - Current progress value
   * @param max - Maximum value (default: 100)
   * @param width - Bar width in characters (default: 20)
   * @returns this for chaining
   */
  addProgressBar(value: number, max: number = 100, width: number = 20): this {
    this.content.push(progressBar(value, max, width) + '\n');
    return this;
  }

  /**
   * Reset the builder to initial state
   * @returns this for chaining
   */
  reset(): this {
    this.content = [];
    this.options = {};
    this.documentTitle = '';
    return this;
  }

  /**
   * Render the document to Markdown string
   * @returns The complete Markdown document
   */
  render(): string {
    const parts: string[] = [];

    // Frontmatter
    if (this.options.includeFrontmatter) {
      const fm = {
        title: this.documentTitle,
        date: new Date().toISOString().split('T')[0],
        ...this.options.metadata,
      };
      parts.push(frontmatter(fm));
    }

    // Document title (if set and not using frontmatter with title)
    if (this.documentTitle && !this.options.includeFrontmatter) {
      parts.push(heading(this.documentTitle, 1));
    }

    // Table of contents
    if (this.options.includeTableOfContents) {
      parts.push('\n## Table of Contents\n\n[TOC]\n');
    }

    // Content
    parts.push(this.content.join('\n'));

    return parts.join('\n');
  }
}
