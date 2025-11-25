/**
 * Export Service (v3.4.5)
 * Sprint 3 Task 3.3: Extract export logic from index.ts
 *
 * Centralizes session export logic for multiple formats.
 * Handles conversion between internal session format and export formats.
 *
 * RESPONSIBILITY:
 * - Export sessions to various formats (JSON, Markdown, LaTeX, HTML, Jupyter)
 * - Handle visual exports (Mermaid, DOT, ASCII)
 * - Apply proper escaping and formatting for each format
 *
 * EXTRACTED FROM: src/index.ts (handleExport, exportTo* functions)
 */

import {
  ThinkingSession,
  ThinkingMode,
  CausalThought,
  TemporalThought,
  GameTheoryThought,
  BayesianThought,
  FirstPrinciplesThought,
} from '../types/index.js';
import { VisualExporter, type VisualFormat } from '../export/visual.js';
import { escapeHtml, escapeLatex } from '../utils/sanitization.js';

/**
 * Export Service - Handles session exports to multiple formats
 *
 * Provides a unified interface for exporting thinking sessions to
 * various formats including text (JSON, Markdown), document (LaTeX, HTML),
 * notebook (Jupyter), and visual (Mermaid, DOT, ASCII).
 *
 * @example
 * ```typescript
 * const exportService = new ExportService();
 * const markdown = exportService.exportSession(session, 'markdown');
 * const jupyter = exportService.exportSession(session, 'jupyter');
 * ```
 */
export class ExportService {
  private visualExporter: VisualExporter;

  constructor() {
    this.visualExporter = new VisualExporter();
  }

  /**
   * Export a session to the specified format
   *
   * Main export method that routes to format-specific exporters.
   * Handles both standard formats (JSON, Markdown, etc.) and visual
   * formats (Mermaid, DOT, ASCII).
   *
   * @param session - The session to export
   * @param format - The desired export format
   * @returns Formatted string in the requested format
   * @throws {Error} If session has no thoughts for visual exports
   *
   * @example
   * ```typescript
   * const service = new ExportService();
   * const exported = service.exportSession(session, 'markdown');
   * ```
   */
  exportSession(
    session: ThinkingSession,
    format: 'json' | 'markdown' | 'latex' | 'html' | 'jupyter' | 'mermaid' | 'dot' | 'ascii'
  ): string {
    // Handle visual formats
    if (format === 'mermaid' || format === 'dot' || format === 'ascii') {
      return this.exportVisual(session, format);
    }

    // Handle standard formats
    switch (format) {
      case 'json':
        return this.exportToJSON(session);
      case 'markdown':
        return this.exportToMarkdown(session);
      case 'latex':
        return this.exportToLatex(session);
      case 'html':
        return this.exportToHTML(session);
      case 'jupyter':
        return this.exportToJupyter(session);
      default:
        // Fallback to JSON for unknown formats
        return this.exportToJSON(session);
    }
  }

  /**
   * Export session to visual format (Mermaid, DOT, ASCII)
   *
   * Uses VisualExporter to generate visual representations
   * based on the session's thinking mode and thought structure.
   *
   * @param session - The session to export
   * @param format - Visual format (mermaid, dot, ascii)
   * @returns Visual representation as string
   * @throws {Error} If session has no thoughts
   */
  private exportVisual(session: ThinkingSession, format: VisualFormat): string {
    const lastThought = session.thoughts[session.thoughts.length - 1];

    if (!lastThought) {
      throw new Error('No thoughts in session to export');
    }

    // Determine which visual export method to use based on mode
    if (lastThought.mode === 'causal' && 'causalGraph' in lastThought) {
      return this.visualExporter.exportCausalGraph(lastThought as CausalThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === 'temporal' && 'timeline' in lastThought) {
      return this.visualExporter.exportTemporalTimeline(lastThought as TemporalThought, {
        format,
        includeLabels: true,
      });
    }

    if (lastThought.mode === 'gametheory' && 'game' in lastThought) {
      return this.visualExporter.exportGameTree(lastThought as GameTheoryThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === 'bayesian' && 'hypothesis' in lastThought) {
      return this.visualExporter.exportBayesianNetwork(lastThought as BayesianThought, {
        format,
        colorScheme: 'default',
        includeLabels: true,
        includeMetrics: true,
      });
    }

    if (lastThought.mode === ThinkingMode.FIRSTPRINCIPLES && 'question' in lastThought) {
      return this.visualExporter.exportFirstPrinciplesDerivation(lastThought as FirstPrinciplesThought, {
        format,
        colorScheme: 'default',
      });
    }

    // Generic thought sequence export for modes without specific visual exporters
    const thoughts = session.thoughts.map((t, i) =>
      `Thought ${i + 1} (${t.mode}):\n${t.content}\n`
    ).join('\n');

    return `Session: ${session.title || 'Untitled'}\nMode: ${lastThought.mode}\n\n${thoughts}`;
  }

  /**
   * Export session to JSON format
   *
   * Converts the session to JSON, handling Map serialization.
   *
   * @param session - The session to export
   * @returns JSON string with pretty printing
   */
  private exportToJSON(session: ThinkingSession): string {
    // Convert Map to Object for JSON serialization
    const sessionWithCustomMetrics = {
      ...session,
      metrics: {
        ...session.metrics,
        customMetrics: Object.fromEntries(session.metrics.customMetrics),
      },
    };

    return JSON.stringify(sessionWithCustomMetrics, null, 2);
  }

  /**
   * Export session to Markdown format
   *
   * Creates a human-readable Markdown document with session details
   * and all thoughts formatted as sections.
   *
   * @param session - The session to export
   * @returns Markdown-formatted string
   */
  private exportToMarkdown(session: ThinkingSession): string {
    const status = session.isComplete ? 'Complete' : 'In Progress';
    let md = `# Thinking Session: ${session.title}\n\n`;
    md += `**Mode**: ${session.mode}\n`;
    md += `**Created**: ${session.createdAt.toISOString()}\n`;
    md += `**Status**: ${status}\n\n`;
    md += `## Thoughts\n\n`;

    for (const thought of session.thoughts) {
      md += `### Thought ${thought.thoughtNumber}/${session.thoughts.length}\n\n`;
      md += `${thought.content}\n\n`;
    }

    return md;
  }

  /**
   * Export session to LaTeX format
   *
   * Generates a LaTeX document with proper escaping for special characters.
   * Ready for compilation with pdflatex.
   *
   * @param session - The session to export
   * @returns LaTeX document as string
   */
  private exportToLatex(session: ThinkingSession): string {
    const status = session.isComplete ? 'Complete' : 'In Progress';
    const safeTitle = escapeLatex(session.title);
    const safeMode = escapeLatex(session.mode);
    const safeStatus = escapeLatex(status);

    let latex = `\\documentclass{article}\n`;
    latex += `\\usepackage[utf8]{inputenc}\n`;
    latex += `\\title{${safeTitle}}\n`;
    latex += `\\begin{document}\n`;
    latex += `\\maketitle\n\n`;
    latex += `\\section{Session Details}\n`;
    latex += `Mode: ${safeMode}\\\\\n`;
    latex += `Status: ${safeStatus}\\\\\n\n`;
    latex += `\\section{Thoughts}\n`;

    for (const thought of session.thoughts) {
      latex += `\\subsection{Thought ${thought.thoughtNumber}}\n`;
      latex += `${escapeLatex(thought.content)}\n\n`;
    }

    latex += `\\end{document}\n`;
    return latex;
  }

  /**
   * Export session to HTML format
   *
   * Generates a standalone HTML page with XSS protection via escaping.
   * Includes basic styling for readability.
   *
   * @param session - The session to export
   * @returns HTML document as string
   */
  private exportToHTML(session: ThinkingSession): string {
    const status = session.isComplete ? 'Complete' : 'In Progress';
    const safeTitle = escapeHtml(session.title);
    const safeMode = escapeHtml(session.mode);
    const safeStatus = escapeHtml(status);

    let html = `<!DOCTYPE html>\n<html>\n<head>\n`;
    html += `  <meta charset="UTF-8">\n`;
    html += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
    html += `  <title>${safeTitle}</title>\n`;
    html += `  <style>body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 0 20px; }</style>\n`;
    html += `</head>\n<body>\n`;
    html += `  <h1>${safeTitle}</h1>\n`;
    html += `  <p><strong>Mode:</strong> ${safeMode}</p>\n`;
    html += `  <p><strong>Status:</strong> ${safeStatus}</p>\n`;
    html += `  <h2>Thoughts</h2>\n`;

    for (const thought of session.thoughts) {
      html += `  <div>\n`;
      html += `    <h3>Thought ${thought.thoughtNumber}/${session.thoughts.length}</h3>\n`;
      html += `    <p>${escapeHtml(thought.content)}</p>\n`;
      html += `  </div>\n`;
    }

    html += `</body>\n</html>\n`;
    return html;
  }

  /**
   * Export session to Jupyter Notebook format
   *
   * Creates a .ipynb file structure with Markdown cells for each thought.
   * Compatible with Jupyter Notebook and JupyterLab.
   *
   * @param session - The session to export
   * @returns JSON string representing Jupyter notebook
   */
  private exportToJupyter(session: ThinkingSession): string {
    const status = session.isComplete ? 'Complete' : 'In Progress';

    interface JupyterCell {
      cell_type: 'markdown' | 'code';
      metadata: Record<string, unknown>;
      source: string[];
    }

    interface JupyterNotebook {
      cells: JupyterCell[];
      metadata: Record<string, unknown>;
      nbformat: number;
      nbformat_minor: number;
    }

    const notebook: JupyterNotebook = {
      cells: [],
      metadata: {},
      nbformat: 4,
      nbformat_minor: 2,
    };

    // Add title cell
    notebook.cells.push({
      cell_type: 'markdown',
      metadata: {},
      source: [
        `# Thinking Session: ${session.title}\n`,
        `\n`,
        `**Mode**: ${session.mode}\n`,
        `**Status**: ${status}\n`,
      ],
    });

    // Add thought cells
    for (const thought of session.thoughts) {
      notebook.cells.push({
        cell_type: 'markdown',
        metadata: {},
        source: [
          `## Thought ${thought.thoughtNumber}/${session.thoughts.length}\n`,
          `\n`,
          `${thought.content}\n`,
        ],
      });
    }

    return JSON.stringify(notebook, null, 2);
  }
}
