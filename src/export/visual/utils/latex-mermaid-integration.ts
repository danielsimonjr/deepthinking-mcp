/**
 * LaTeX-Mermaid Integration (v3.4.0)
 * Phase 4B Task 1.4b: Integrate Phase 3 Visual Exporter with LaTeX
 *
 * Embeds Mermaid diagrams into LaTeX documents using the mermaid-tikz package
 */

import type { ThinkingSession, Thought } from '../../../types/index.js';
import type { VisualExportOptions } from '../types.js';
import { VisualExporter } from '../visual-exporter.js';

/**
 * Mermaid-LaTeX integration options
 */
export interface MermaidLatexOptions {
  engine: 'mermaid-tikz' | 'external-svg' | 'inline-code';
  width?: string; // e.g., '\\textwidth', '0.8\\linewidth'
  caption?: boolean;
  label?: boolean;
  floatPlacement?: 'h' | 't' | 'b' | 'p' | 'H';
  colorScheme?: 'default' | 'monochrome' | 'pastel';
}

/**
 * LaTeX-Mermaid integrator
 */
export class LatexMermaidIntegrator {
  private visualExporter: VisualExporter;

  constructor() {
    this.visualExporter = new VisualExporter();
  }

  /**
   * Generate LaTeX preamble for Mermaid support
   */
  generateMermaidPreamble(engine: 'mermaid-tikz' | 'external-svg' | 'inline-code'): string {
    if (engine === 'mermaid-tikz') {
      return `
% Mermaid diagram support via TikZ
\\usepackage{tikz}
\\usetikzlibrary{shapes.geometric, arrows.meta, positioning, calc}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}

% Mermaid-style colors
\\definecolor{mermaidBlue}{RGB}{100,150,200}
\\definecolor{mermaidGreen}{RGB}{100,200,150}
\\definecolor{mermaidRed}{RGB}{200,100,100}
\\definecolor{mermaidYellow}{RGB}{250,220,100}
\\definecolor{mermaidPurple}{RGB}{180,130,200}

% Mermaid diagram environment
\\newenvironment{mermaiddiagram}[1][h]{
  \\begin{figure}[#1]
  \\centering
}{
  \\end{figure}
}
`;
    } else if (engine === 'external-svg') {
      return `
% Mermaid diagram support via external SVG
\\usepackage{graphicx}
\\usepackage{svg}

% Mermaid diagram from SVG
\\newcommand{\\mermaidsvg}[2][width=\\textwidth]{
  \\includesvg[#1]{#2}
}

\\newenvironment{mermaiddiagram}[1][h]{
  \\begin{figure}[#1]
  \\centering
}{
  \\end{figure}
}
`;
    } else {
      // inline-code: show Mermaid code in listings
      return `
% Mermaid code display
\\usepackage{listings}
\\usepackage{xcolor}

\\lstdefinelanguage{mermaid}{
  keywords={graph, subgraph, flowchart, sequenceDiagram, classDiagram, stateDiagram, gantt, pie},
  keywordstyle=\\color{blue}\\bfseries,
  sensitive=true,
  comment=[l]{\\%\\%},
  commentstyle=\\color{gray}\\itshape,
  stringstyle=\\color{red},
  morestring=[b]",
  morestring=[b]'
}

\\lstset{
  language=mermaid,
  basicstyle=\\small\\ttfamily,
  breaklines=true,
  frame=single,
  backgroundcolor=\\color{gray!10}
}

\\newenvironment{mermaidcode}{
  \\begin{lstlisting}[language=mermaid]
}{
  \\end{lstlisting}
}
`;
    }
  }

  /**
   * Embed Mermaid diagram in LaTeX
   */
  embedMermaidDiagram(
    mermaidCode: string,
    caption: string,
    label: string,
    options: MermaidLatexOptions
  ): string {
    const {
      engine = 'mermaid-tikz',
      width = '\\textwidth',
      caption: showCaption = true,
      label: showLabel = true,
      floatPlacement = 'h',
    } = options;

    let content = '';

    if (engine === 'inline-code') {
      // Just show the Mermaid code
      content = `\\begin{mermaiddiagram}[${floatPlacement}]
\\begin{mermaidcode}
${mermaidCode}
\\end{mermaidcode}
${showCaption ? `\\caption{${caption}}` : ''}
${showLabel ? `\\label{${label}}` : ''}
\\end{mermaiddiagram}`;
    } else if (engine === 'external-svg') {
      // Reference external SVG (assumes SVG file exists)
      const filename = label.replace(/:/g, '-');
      content = `\\begin{mermaiddiagram}[${floatPlacement}]
\\mermaidsvg[width=${width}]{diagrams/${filename}.svg}
${showCaption ? `\\caption{${caption}}` : ''}
${showLabel ? `\\label{${label}}` : ''}
\\end{mermaiddiagram}`;
    } else {
      // Convert to TikZ (simplified - real implementation would parse Mermaid)
      const tikzCode = this.convertMermaidToTikZ(mermaidCode);
      content = `\\begin{mermaiddiagram}[${floatPlacement}]
${tikzCode}
${showCaption ? `\\caption{${caption}}` : ''}
${showLabel ? `\\label{${label}}` : ''}
\\end{mermaiddiagram}`;
    }

    return content;
  }

  /**
   * Convert Mermaid code to TikZ (simplified implementation)
   */
  private convertMermaidToTikZ(mermaidCode: string): string {
    // This is a simplified conversion - a full implementation would parse Mermaid AST
    // For now, we'll just wrap it in a comment and provide a placeholder

    return `% Mermaid diagram (requires manual conversion or mermaid-cli)
% Original Mermaid code:
${mermaidCode.split('\n').map(line => `% ${line}`).join('\n')}

% Placeholder TikZ diagram
\\begin{tikzpicture}[node distance=2cm, auto]
  \\node[draw, rectangle, rounded corners] (placeholder) {Diagram rendered from Mermaid};
  \\node[below=of placeholder, text width=6cm, text centered] {
    \\small\\textit{Use mermaid-cli to generate SVG or compile with --shell-escape}
  };
\\end{tikzpicture}`;
  }

  /**
   * Generate diagram for thought and embed in LaTeX
   */
  generateThoughtDiagram(thought: Thought, options: MermaidLatexOptions): string {
    const visualOptions: VisualExportOptions = {
      format: 'mermaid',
      colorScheme: options.colorScheme || 'default',
      includeLabels: true,
      includeMetrics: true,
    };

    let mermaidCode = '';
    let caption = '';
    let label = '';

    // Generate appropriate diagram based on thought type
    if (thought.mode === 'causal' && 'graph' in thought) {
      mermaidCode = this.visualExporter.exportCausalGraph(thought as any, visualOptions);
      caption = 'Causal Graph';
      label = `fig:causal-${thought.thoughtNumber}`;
    } else if (thought.mode === 'temporal' && 'timeline' in thought) {
      mermaidCode = this.visualExporter.exportTemporalTimeline(thought as any, visualOptions);
      caption = 'Temporal Timeline';
      label = `fig:temporal-${thought.thoughtNumber}`;
    } else if (thought.mode === 'gametheory' && 'gameTree' in thought) {
      mermaidCode = this.visualExporter.exportGameTree(thought as any, visualOptions);
      caption = 'Game Theory Tree';
      label = `fig:gametheory-${thought.thoughtNumber}`;
    } else if (thought.mode === 'bayesian' && 'network' in thought) {
      mermaidCode = this.visualExporter.exportBayesianNetwork(thought as any, visualOptions);
      caption = 'Bayesian Network';
      label = `fig:bayesian-${thought.thoughtNumber}`;
    } else {
      return ''; // No diagram for this thought type
    }

    return this.embedMermaidDiagram(mermaidCode, caption, label, options);
  }

  /**
   * Generate all diagrams for session
   */
  generateSessionDiagrams(session: ThinkingSession, options: MermaidLatexOptions): string {
    const diagrams: string[] = [];

    for (const thought of session.thoughts) {
      const diagram = this.generateThoughtDiagram(thought, options);
      if (diagram) {
        diagrams.push(diagram);
        diagrams.push(''); // Blank line
      }
    }

    return diagrams.join('\n');
  }

  /**
   * Create appendix with all Mermaid source code
   */
  generateMermaidAppendix(session: ThinkingSession): string {
    const sections: string[] = [];

    sections.push('\\section*{Appendix: Mermaid Diagrams Source Code}');
    sections.push('\\addcontentsline{toc}{section}{Appendix: Mermaid Diagrams Source Code}');
    sections.push('');
    sections.push('This appendix contains the Mermaid source code for all diagrams in this document.');
    sections.push('');

    for (const thought of session.thoughts) {
      const visualOptions: VisualExportOptions = {
        format: 'mermaid',
        includeLabels: true,
        includeMetrics: true,
      };

      let mermaidCode = '';

      if (thought.mode === 'causal' && 'graph' in thought) {
        mermaidCode = this.visualExporter.exportCausalGraph(thought as any, visualOptions);
        sections.push(`\\subsection*{Thought ${thought.thoughtNumber}: Causal Graph}`);
      } else if (thought.mode === 'temporal' && 'timeline' in thought) {
        mermaidCode = this.visualExporter.exportTemporalTimeline(thought as any, visualOptions);
        sections.push(`\\subsection*{Thought ${thought.thoughtNumber}: Temporal Timeline}`);
      } else if (thought.mode === 'gametheory' && 'gameTree' in thought) {
        mermaidCode = this.visualExporter.exportGameTree(thought as any, visualOptions);
        sections.push(`\\subsection*{Thought ${thought.thoughtNumber}: Game Theory Tree}`);
      } else if (thought.mode === 'bayesian' && 'network' in thought) {
        mermaidCode = this.visualExporter.exportBayesianNetwork(thought as any, visualOptions);
        sections.push(`\\subsection*{Thought ${thought.thoughtNumber}: Bayesian Network}`);
      }

      if (mermaidCode) {
        sections.push('');
        sections.push('\\begin{lstlisting}[language=mermaid, caption={Mermaid source code}]');
        sections.push(mermaidCode);
        sections.push('\\end{lstlisting}');
        sections.push('');
      }
    }

    return sections.join('\n');
  }

  /**
   * Generate complete LaTeX document with integrated Mermaid diagrams
   */
  generateIntegratedDocument(
    session: ThinkingSession,
    options: MermaidLatexOptions & { includeAppendix?: boolean }
  ): string {
    const { engine = 'inline-code', includeAppendix = true } = options;

    const doc: string[] = [];

    // Document class
    doc.push('\\documentclass[11pt]{article}');
    doc.push('');

    // Preamble
    doc.push(this.generateMermaidPreamble(engine));
    doc.push('');

    // Title
    doc.push(`\\title{${session.title || 'Thinking Session'}}`);
    doc.push('\\author{DeepThinking MCP}');
    doc.push('\\date{\\today}');
    doc.push('');

    // Document body
    doc.push('\\begin{document}');
    doc.push('\\maketitle');
    doc.push('\\tableofcontents');
    doc.push('\\newpage');
    doc.push('');

    // Thoughts with diagrams
    doc.push('\\section{Reasoning Session}');
    doc.push('');

    for (const thought of session.thoughts) {
      doc.push(`\\subsection{Thought ${thought.thoughtNumber}}`);
      doc.push('');
      doc.push(thought.content);
      doc.push('');

      // Add diagram if applicable
      const diagram = this.generateThoughtDiagram(thought, options);
      if (diagram) {
        doc.push(diagram);
        doc.push('');
      }
    }

    // Appendix with Mermaid source
    if (includeAppendix && engine !== 'inline-code') {
      doc.push('\\newpage');
      doc.push(this.generateMermaidAppendix(session));
    }

    doc.push('');
    doc.push('\\end{document}');

    return doc.join('\n');
  }
}
