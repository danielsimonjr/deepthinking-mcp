/**
 * HTML Export Utilities (v7.1.0)
 * Phase 10: Shared utilities for HTML visual exports
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
