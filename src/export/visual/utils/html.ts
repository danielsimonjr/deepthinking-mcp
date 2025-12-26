/**
 * HTML Export Utilities (v8.5.0)
 * Phase 10: Shared utilities for HTML visual exports
 * Phase 13 Sprint 3: Added HTMLDocBuilder fluent API
 *
 * Provides reusable functions for generating HTML exports across all modes.
 */

/**
 * HTML theme colors
 */
export interface HTMLThemeColors {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  border: string;
  tableHeader: string;
  tableRow: string;
  tableRowAlt: string;
}

/**
 * Get theme colors based on theme name
 */
export function getHTMLThemeColors(theme: 'light' | 'dark' | 'auto' = 'light'): HTMLThemeColors {
  if (theme === 'dark') {
    return {
      background: '#1a1a2e',
      text: '#eaeaea',
      primary: '#4a90d9',
      secondary: '#6c757d',
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      info: '#17a2b8',
      border: '#444',
      tableHeader: '#2d2d44',
      tableRow: '#1a1a2e',
      tableRowAlt: '#252538',
    };
  }
  // Light theme (default)
  return {
    background: '#ffffff',
    text: '#333333',
    primary: '#2563eb',
    secondary: '#6b7280',
    success: '#16a34a',
    warning: '#ca8a04',
    danger: '#dc2626',
    info: '#0891b2',
    border: '#e5e7eb',
    tableHeader: '#f3f4f6',
    tableRow: '#ffffff',
    tableRowAlt: '#f9fafb',
  };
}

/**
 * Generate HTML document header
 */
export function generateHTMLHeader(
  title: string,
  options: {
    standalone?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    customStyles?: string;
  } = {}
): string {
  const { standalone = true, theme = 'light', customStyles = '' } = options;
  const colors = getHTMLThemeColors(theme);

  if (!standalone) {
    return `<div class="visual-export" data-theme="${theme}">\n`;
  }

  return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <style>
    :root {
      --bg-color: ${colors.background};
      --text-color: ${colors.text};
      --primary-color: ${colors.primary};
      --secondary-color: ${colors.secondary};
      --success-color: ${colors.success};
      --warning-color: ${colors.warning};
      --danger-color: ${colors.danger};
      --info-color: ${colors.info};
      --border-color: ${colors.border};
      --table-header-bg: ${colors.tableHeader};
      --table-row-bg: ${colors.tableRow};
      --table-row-alt-bg: ${colors.tableRowAlt};
    }

    * { box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: var(--text-color);
      background-color: var(--bg-color);
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    h1, h2, h3, h4 { margin-top: 1.5rem; margin-bottom: 0.5rem; }
    h1 { font-size: 2rem; border-bottom: 2px solid var(--primary-color); padding-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; color: var(--primary-color); }
    h3 { font-size: 1.25rem; }

    .section {
      margin: 1.5rem 0;
      padding: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge-primary { background: var(--primary-color); color: white; }
    .badge-success { background: var(--success-color); color: white; }
    .badge-warning { background: var(--warning-color); color: black; }
    .badge-danger { background: var(--danger-color); color: white; }
    .badge-info { background: var(--info-color); color: white; }
    .badge-secondary { background: var(--secondary-color); color: white; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      font-size: 0.9rem;
    }

    th, td {
      padding: 0.75rem;
      text-align: left;
      border: 1px solid var(--border-color);
    }

    th {
      background: var(--table-header-bg);
      font-weight: 600;
    }

    tr:nth-child(even) { background: var(--table-row-alt-bg); }
    tr:nth-child(odd) { background: var(--table-row-bg); }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }

    .metric-card {
      padding: 1rem;
      background: var(--table-header-bg);
      border-radius: 8px;
      text-align: center;
    }

    .metric-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .metric-label {
      font-size: 0.85rem;
      color: var(--secondary-color);
    }

    .progress-bar {
      height: 8px;
      background: var(--border-color);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary-color);
      transition: width 0.3s ease;
    }

    .list-styled {
      list-style: none;
      padding: 0;
    }

    .list-styled li {
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border-color);
    }

    .list-styled li:last-child { border-bottom: none; }

    .icon { margin-right: 0.5rem; }

    .text-success { color: var(--success-color); }
    .text-warning { color: var(--warning-color); }
    .text-danger { color: var(--danger-color); }
    .text-info { color: var(--info-color); }
    .text-secondary { color: var(--secondary-color); }

    .card {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
      margin: 0.5rem 0;
    }

    .card-header {
      font-weight: 600;
      margin-bottom: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .flex { display: flex; }
    .flex-wrap { flex-wrap: wrap; }
    .gap-1 { gap: 0.5rem; }
    .gap-2 { gap: 1rem; }

    .footer {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
      font-size: 0.85rem;
      color: var(--secondary-color);
      text-align: center;
    }

    ${customStyles}
  </style>
</head>
<body>
`;
}

/**
 * Generate HTML document footer
 */
export function generateHTMLFooter(standalone: boolean = true): string {
  if (!standalone) {
    return '</div>\n';
  }
  return `
  <div class="footer">
    Generated by DeepThinking MCP v8.3.1
  </div>
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
export function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate a metric card
 */
export function renderMetricCard(label: string, value: string | number, color?: string): string {
  const colorClass = color ? ` style="color: var(--${color}-color)"` : '';
  return `
    <div class="metric-card">
      <div class="metric-value"${colorClass}>${escapeHTML(String(value))}</div>
      <div class="metric-label">${escapeHTML(label)}</div>
    </div>`;
}

/**
 * Generate a progress bar
 */
export function renderProgressBar(percent: number, color: string = 'primary'): string {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  return `
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${clampedPercent}%; background: var(--${color}-color)"></div>
    </div>`;
}

/**
 * Generate a badge
 */
export function renderBadge(text: string, type: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' = 'primary'): string {
  return `<span class="badge badge-${type}">${escapeHTML(text)}</span>`;
}

/**
 * Generate a table from data
 */
export function renderTable(
  headers: string[],
  rows: (string | number)[][],
  options: { caption?: string } = {}
): string {
  const headerCells = headers.map(h => `<th>${escapeHTML(h)}</th>`).join('');
  const bodyRows = rows.map(row => {
    const cells = row.map(cell => `<td>${escapeHTML(String(cell))}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('\n');

  let html = '<table>';
  if (options.caption) {
    html += `<caption>${escapeHTML(options.caption)}</caption>`;
  }
  html += `<thead><tr>${headerCells}</tr></thead>`;
  html += `<tbody>${bodyRows}</tbody>`;
  html += '</table>';
  return html;
}

/**
 * Generate a section with header
 */
export function renderSection(title: string, content: string, icon?: string): string {
  const iconHtml = icon ? `<span class="icon">${icon}</span>` : '';
  return `
    <div class="section">
      <div class="section-header">
        ${iconHtml}<h3>${escapeHTML(title)}</h3>
      </div>
      ${content}
    </div>`;
}

/**
 * Generate a list
 */
export function renderList(items: string[], ordered: boolean = false): string {
  const tag = ordered ? 'ol' : 'ul';
  const listItems = items.map(item => `<li>${escapeHTML(item)}</li>`).join('\n');
  return `<${tag} class="list-styled">${listItems}</${tag}>`;
}

// =============================================================================
// HTMLDocBuilder Fluent API (Phase 13 Sprint 3)
// =============================================================================

/**
 * HTMLDocBuilder options
 */
export interface HTMLDocBuilderOptions {
  standalone?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  customStyles?: string;
}

/**
 * HTMLDocBuilder - Fluent API for building HTML documents
 *
 * @example
 * ```typescript
 * const html = new HTMLDocBuilder()
 *   .setTitle('Analysis Report')
 *   .setTheme('light')
 *   .addHeading(1, 'Main Title')
 *   .addParagraph('This is a paragraph.')
 *   .addTable(['Col1', 'Col2'], [['A', 'B'], ['C', 'D']])
 *   .render();
 * ```
 */
export class HTMLDocBuilder {
  private title: string = 'Document';
  private sections: string[] = [];
  private options: HTMLDocBuilderOptions = { standalone: true, theme: 'light' };
  private styles: string[] = [];

  /**
   * Set or merge builder options
   * @param options - Options to set/merge
   * @returns this for chaining
   */
  setOptions(options: HTMLDocBuilderOptions): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Set the document title
   * @param title - The document title
   * @returns this for chaining
   */
  setTitle(title: string): this {
    this.title = title;
    return this;
  }

  /**
   * Set the theme
   * @param theme - The theme ('light', 'dark', or 'auto')
   * @returns this for chaining
   */
  setTheme(theme: 'light' | 'dark' | 'auto'): this {
    this.options.theme = theme;
    return this;
  }

  /**
   * Set standalone mode
   * @param standalone - Whether to generate a full HTML document
   * @returns this for chaining
   */
  setStandalone(standalone: boolean): this {
    this.options.standalone = standalone;
    return this;
  }

  /**
   * Add custom CSS styles
   * @param css - CSS string to add
   * @returns this for chaining
   */
  addStyle(css: string): this {
    this.styles.push(css);
    return this;
  }

  /**
   * Add a heading
   * @param level - Heading level (1-6)
   * @param text - Heading text
   * @returns this for chaining
   */
  addHeading(level: 1 | 2 | 3 | 4 | 5 | 6, text: string): this {
    this.sections.push(`<h${level}>${escapeHTML(text)}</h${level}>`);
    return this;
  }

  /**
   * Add a paragraph
   * @param text - Paragraph text
   * @param className - Optional CSS class name
   * @returns this for chaining
   */
  addParagraph(text: string, className?: string): this {
    const classAttr = className ? ` class="${className}"` : '';
    this.sections.push(`<p${classAttr}>${escapeHTML(text)}</p>`);
    return this;
  }

  /**
   * Add raw HTML content
   * @param html - Raw HTML string
   * @returns this for chaining
   */
  addRaw(html: string): this {
    this.sections.push(html);
    return this;
  }

  /**
   * Add a list
   * @param items - List items
   * @param ordered - Whether the list is ordered
   * @returns this for chaining
   */
  addList(items: string[], ordered: boolean = false): this {
    this.sections.push(renderList(items, ordered));
    return this;
  }

  /**
   * Add a table
   * @param headers - Table headers
   * @param rows - Table rows
   * @param caption - Optional table caption
   * @returns this for chaining
   */
  addTable(headers: string[], rows: (string | number)[][], caption?: string): this {
    this.sections.push(renderTable(headers, rows, { caption }));
    return this;
  }

  /**
   * Add a div container
   * @param content - Content to wrap
   * @param className - Optional CSS class
   * @returns this for chaining
   */
  addDiv(content: string, className?: string): this {
    const classAttr = className ? ` class="${className}"` : '';
    this.sections.push(`<div${classAttr}>${content}</div>`);
    return this;
  }

  /**
   * Add a section with header
   * @param title - Section title
   * @param content - Section content
   * @param icon - Optional icon
   * @returns this for chaining
   */
  addSection(title: string, content: string, icon?: string): this {
    this.sections.push(renderSection(title, content, icon));
    return this;
  }

  /**
   * Add a metric card
   * @param label - Metric label
   * @param value - Metric value
   * @param color - Optional color ('primary', 'success', 'warning', 'danger', 'info')
   * @returns this for chaining
   */
  addMetricCard(label: string, value: string | number, color?: string): this {
    this.sections.push(renderMetricCard(label, value, color));
    return this;
  }

  /**
   * Add a progress bar
   * @param percent - Progress percentage (0-100)
   * @param color - Optional color
   * @returns this for chaining
   */
  addProgressBar(percent: number, color: string = 'primary'): this {
    this.sections.push(renderProgressBar(percent, color));
    return this;
  }

  /**
   * Add a badge
   * @param text - Badge text
   * @param type - Badge type
   * @returns this for chaining
   */
  addBadge(text: string, type: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' = 'primary'): this {
    this.sections.push(renderBadge(text, type));
    return this;
  }

  /**
   * Begin a metrics grid container
   * @returns this for chaining
   */
  beginMetricsGrid(): this {
    this.sections.push('<div class="metrics-grid">');
    return this;
  }

  /**
   * End a metrics grid container
   * @returns this for chaining
   */
  endMetricsGrid(): this {
    this.sections.push('</div>');
    return this;
  }

  /**
   * Add a card
   * @param header - Card header
   * @param content - Card content
   * @returns this for chaining
   */
  addCard(header: string, content: string): this {
    this.sections.push(`
      <div class="card">
        <div class="card-header">${escapeHTML(header)}</div>
        ${content}
      </div>`);
    return this;
  }

  /**
   * Reset the builder to initial state
   * @returns this for chaining
   */
  reset(): this {
    this.title = 'Document';
    this.sections = [];
    this.styles = [];
    this.options = { standalone: true, theme: 'light' };
    return this;
  }

  /**
   * Render the document to HTML string
   * @returns The complete HTML document or fragment
   */
  render(): string {
    const customStyles = this.styles.join('\n');
    const header = generateHTMLHeader(this.title, {
      standalone: this.options.standalone,
      theme: this.options.theme,
      customStyles,
    });

    const content = this.sections.join('\n');
    const footer = generateHTMLFooter(this.options.standalone);

    return header + content + footer;
  }
}
