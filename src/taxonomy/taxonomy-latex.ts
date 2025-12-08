/**
 * Taxonomy LaTeX Integration (v3.4.0)
 * Phase 4D Task 7.6 (File Task 23): Integrate taxonomy with LaTeX exports
 */

import type { ThinkingSession } from '../types/index.js';
import { getReasoningType } from './reasoning-types.js';
import { SuggestionEngine } from './suggestion-engine.js';
import { MultiModalAnalyzer } from './multi-modal-analyzer.js';

/**
 * LaTeX export options for taxonomy
 */
export interface TaxonomyLatexOptions {
  includeMetadata: boolean;
  includeQualityMetrics: boolean;
  includeFlowAnalysis: boolean;
  includeRecommendations: boolean;
  includeCitations: boolean;
  colorScheme: 'standard' | 'academic' | 'vibrant';
}

/**
 * Taxonomy LaTeX exporter
 */
export class TaxonomyLatexExporter {
  private suggestionEngine: SuggestionEngine;
  private multiModalAnalyzer: MultiModalAnalyzer;

  constructor() {
    this.suggestionEngine = new SuggestionEngine();
    this.multiModalAnalyzer = new MultiModalAnalyzer();
  }

  /**
   * Generate LaTeX preamble with taxonomy support
   */
  generateTaxonomyPreamble(): string {
    return `
% Taxonomy packages and setup
\\usepackage{xcolor}
\\usepackage{tcolorbox}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}
\\usepackage{tikz}
\\usetikzlibrary{shapes,arrows,positioning,patterns}

% Taxonomy colors
\\definecolor{deductiveColor}{RGB}{70,130,180}
\\definecolor{inductiveColor}{RGB}{144,238,144}
\\definecolor{abductiveColor}{RGB}{255,165,0}
\\definecolor{analogicalColor}{RGB}{221,160,221}
\\definecolor{causalColor}{RGB}{220,20,60}
\\definecolor{mathematicalColor}{RGB}{0,0,139}
\\definecolor{scientificColor}{RGB}{32,178,170}
\\definecolor{probabilisticColor}{RGB}{255,105,180}
\\definecolor{dialecticalColor}{RGB}{218,112,214}
\\definecolor{practicalColor}{RGB}{34,139,34}
\\definecolor{creativeColor}{RGB}{255,215,0}
\\definecolor{criticalColor}{RGB}{178,34,34}

% Taxonomy boxes
\\newtcolorbox{reasoningbox}[2][]{
  colback=#2!5,
  colframe=#2!75!black,
  fonttitle=\\bfseries,
  title=#1,
  rounded corners,
  boxrule=1pt
}

% Quality metrics command
\\newcommand{\\qualitymetric}[2]{%
  \\textbf{#1:} \\tikz[baseline=(char.base)]{
    \\node[fill=#2!50,inner sep=2pt,rounded corners] (char) {#2\\%%};
  }%
}

% Taxonomy reference command
\\newcommand{\\taxref}[2]{%
  \\textit{#1} (\\texttt{#2})%
}
`;
  }

  /**
   * Generate taxonomy overview section
   */
  generateTaxonomyOverview(session: ThinkingSession, options: TaxonomyLatexOptions): string {
    const flow = this.multiModalAnalyzer.analyzeFlow(session);

    let latex = `
\\section{Reasoning Taxonomy Analysis}

\\subsection{Session Overview}
This session employed \\textbf{${flow.modeDistribution.size}} distinct reasoning modes across \\textbf{${session.thoughts.length}} thoughts.

\\begin{itemize}
  \\item \\textbf{Dominant Mode:} ${this.formatMode(flow.dominantMode)}
  \\item \\textbf{Flow Complexity:} ${(flow.flowComplexity * 100).toFixed(1)}\\%
  \\item \\textbf{Coherence:} ${(flow.coherence * 100).toFixed(1)}\\%
  \\item \\textbf{Adaptability:} ${(flow.adaptability * 100).toFixed(1)}\\%
\\end{itemize}
`;

    if (options.includeFlowAnalysis) {
      latex += this.generateFlowAnalysisSection(flow, options);
    }

    if (options.includeQualityMetrics) {
      latex += this.generateQualityMetricsSection(session, options);
    }

    if (options.includeMetadata) {
      latex += this.generateMetadataSection(session, options);
    }

    return latex;
  }

  /**
   * Generate flow analysis section
   */
  private generateFlowAnalysisSection(flow: any, _options: TaxonomyLatexOptions): string {
    let latex = `
\\subsection{Reasoning Flow Analysis}

\\subsubsection{Mode Distribution}
The following table shows the distribution of reasoning modes throughout the session:

\\begin{table}[h]
\\centering
\\begin{tabular}{lcc}
\\hline
\\textbf{Mode} & \\textbf{Count} & \\textbf{Percentage} \\\\
\\hline
`;

    for (const [mode, count] of flow.modeDistribution) {
      const percentage = ((count / flow.session.thoughts.length) * 100).toFixed(1);
      const color = this.getModeColor(mode);
      latex += `\\textcolor{${color}}{${this.formatMode(mode)}} & ${count} & ${percentage}\\% \\\\\n`;
    }

    latex += `\\hline
\\end{tabular}
\\caption{Mode distribution in reasoning session}
\\end{table}
`;

    // Add transitions
    if (flow.transitions.length > 0) {
      latex += `
\\subsubsection{Mode Transitions}
The session included \\textbf{${flow.transitions.length}} mode transitions:

\\begin{itemize}
`;
      for (const transition of flow.transitions.slice(0, 10)) {
        latex += `  \\item \\textbf{T${transition.thoughtNumber}:} ${this.formatMode(transition.from)} $\\rightarrow$ ${this.formatMode(transition.to)} (effectiveness: ${(transition.effectiveness * 100).toFixed(0)}\\%)\n`;
      }

      latex += `\\end{itemize}
`;
    }

    return latex;
  }

  /**
   * Generate quality metrics section
   */
  private generateQualityMetricsSection(session: ThinkingSession, _options: TaxonomyLatexOptions): string {
    const analysis = this.suggestionEngine.analyzeSession(session);

    let latex = `
\\subsection{Quality Metrics}

The following metrics characterize the quality of reasoning in this session:

\\begin{table}[h]
\\centering
\\begin{tabular}{lc}
\\hline
\\textbf{Metric} & \\textbf{Score} \\\\
\\hline
`;

    const metrics = analysis.averageQualityMetrics;
    const metricNames: Record<string, string> = {
      rigor: 'Logical Rigor',
      creativity: 'Creativity',
      practicality: 'Practicality',
      completeness: 'Completeness',
      clarity: 'Clarity',
      efficiency: 'Efficiency',
      reliability: 'Reliability',
      scalability: 'Scalability',
    };

    for (const [key, name] of Object.entries(metricNames)) {
      const value = metrics[key as keyof typeof metrics];
      const percentage = (value * 100).toFixed(1);
      const color = this.getMetricColor(value);
      latex += `${name} & \\textcolor{${color}}{${percentage}\\%} \\\\\n`;
    }

    latex += `\\hline
\\end{tabular}
\\caption{Quality metrics for reasoning session}
\\end{table}

`;

    // Add radar chart
    latex += this.generateRadarChart(metrics);

    return latex;
  }

  /**
   * Generate metadata section
   */
  private generateMetadataSection(session: ThinkingSession, _options: TaxonomyLatexOptions): string {
    const analysis = this.suggestionEngine.analyzeSession(session);

    let latex = `
\\subsection{Cognitive Characteristics}

\\subsubsection{Cognitive Load Profile}

\\begin{table}[h]
\\centering
\\begin{tabular}{lc}
\\hline
\\textbf{Load Level} & \\textbf{Frequency} \\\\
\\hline
`;

    for (const [load, count] of analysis.cognitiveLoadProfile) {
      latex += `${this.formatCognitiveLoad(load)} & ${count} \\\\\n`;
    }

    latex += `\\hline
\\end{tabular}
\\caption{Cognitive load distribution}
\\end{table}

\\subsubsection{Dual-Process Theory Classification}

\\begin{table}[h]
\\centering
\\begin{tabular}{lc}
\\hline
\\textbf{Process Type} & \\textbf{Frequency} \\\\
\\hline
`;

    for (const [process, count] of analysis.dualProcessDistribution) {
      latex += `${this.formatDualProcess(process)} & ${count} \\\\\n`;
    }

    latex += `\\hline
\\end{tabular}
\\caption{Dual-process distribution}
\\end{table}
`;

    return latex;
  }

  /**
   * Generate radar chart for quality metrics
   */
  private generateRadarChart(metrics: any): string {
    const data = [
      metrics.rigor,
      metrics.creativity,
      metrics.practicality,
      metrics.completeness,
      metrics.clarity,
      metrics.efficiency,
      metrics.reliability,
      metrics.scalability,
    ];

    return `
\\begin{figure}[h]
\\centering
\\begin{tikzpicture}
\\begin{polaraxis}[
  width=10cm,
  height=10cm,
  xtick={0,45,90,135,180,225,270,315},
  xticklabels={Rigor,Creativity,Practicality,Completeness,Clarity,Efficiency,Reliability,Scalability},
  ytick={0,0.25,0.5,0.75,1},
  yticklabels={0\\%,25\\%,50\\%,75\\%,100\\%},
  ymin=0,
  ymax=1,
  grid=major
]
\\addplot[
  mark=*,
  mark size=2pt,
  color=blue,
  fill=blue,
  fill opacity=0.3,
  thick
] coordinates {
  (0,${data[0]})
  (45,${data[1]})
  (90,${data[2]})
  (135,${data[3]})
  (180,${data[4]})
  (225,${data[5]})
  (270,${data[6]})
  (315,${data[7]})
  (360,${data[0]})
};
\\end{polaraxis}
\\end{tikzpicture}
\\caption{Quality metrics radar chart}
\\end{figure}
`;
  }

  /**
   * Generate thought annotation with taxonomy
   */
  generateThoughtAnnotation(_thought: any, typeId?: string): string {
    if (!typeId) return '';

    const type = getReasoningType(typeId);
    if (!type) return '';

    const metadata = this.suggestionEngine.getMetadata(typeId);
    if (!metadata) return '';

    const color = this.getCategoryColor(type.category);

    return `
\\begin{reasoningbox}[${type.name}]{${color}}
\\textbf{Category:} ${type.category} \\\\
\\textbf{Difficulty:} ${type.difficulty} \\\\
\\textbf{Cognitive Load:} ${metadata.cognitiveLoad} \\\\

\\textbf{Description:} ${type.description}

${this.renderQualityMetrics(metadata.qualityMetrics)}

\\end{reasoningbox}
`;
  }

  /**
   * Render quality metrics
   */
  private renderQualityMetrics(metrics: any): string {
    let latex = `\\textbf{Quality Metrics:}\\\\`;

    latex += `\\qualitymetric{Rigor}{${(metrics.rigor * 100).toFixed(0)}} `;
    latex += `\\qualitymetric{Creativity}{${(metrics.creativity * 100).toFixed(0)}} `;
    latex += `\\qualitymetric{Practicality}{${(metrics.practicality * 100).toFixed(0)}}`;

    return latex;
  }

  /**
   * Generate bibliography with taxonomy citations
   */
  generateTaxonomyBibliography(): string {
    return `
\\begin{thebibliography}{99}

\\bibitem{kahneman2011}
Kahneman, D. (2011). \\textit{Thinking, Fast and Slow}. Farrar, Straus and Giroux.

\\bibitem{peirce1931}
Peirce, C. S. (1931-1958). \\textit{Collected Papers of Charles Sanders Peirce}. Harvard University Press.

\\bibitem{polya1945}
Pólya, G. (1945). \\textit{How to Solve It}. Princeton University Press.

\\bibitem{pearl2009}
Pearl, J. (2009). \\textit{Causality: Models, Reasoning, and Inference}. Cambridge University Press.

\\bibitem{thagard1988}
Thagard, P. (1988). \\textit{Computational Philosophy of Science}. MIT Press.

\\bibitem{gentner1983}
Gentner, D. (1983). Structure-mapping: A theoretical framework for analogy. \\textit{Cognitive Science}, 7(2), 155-170.

\\bibitem{koller2009}
Koller, D., \\& Friedman, N. (2009). \\textit{Probabilistic Graphical Models}. MIT Press.

\\bibitem{walton1996}
Walton, D. (1996). \\textit{Argumentation Schemes for Presumptive Reasoning}. Lawrence Erlbaum Associates.

\\end{thebibliography}
`;
  }

  /**
   * Format mode name
   */
  private formatMode(mode: string): string {
    return mode.charAt(0).toUpperCase() + mode.slice(1).replace(/_/g, ' ');
  }

  /**
   * Get mode color
   */
  private getModeColor(mode: string): string {
    // Map modes to categories
    const categoryMap: Record<string, string> = {
      sequential: 'deductiveColor',
      mathematics: 'mathematicalColor',
      causal: 'causalColor',
      bayesian: 'probabilisticColor',
      abductive: 'abductiveColor',
      analogical: 'analogicalColor',
    };
    return categoryMap[mode] || 'black';
  }

  /**
   * Get category color
   */
  private getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      deductive: 'deductiveColor',
      inductive: 'inductiveColor',
      abductive: 'abductiveColor',
      analogical: 'analogicalColor',
      causal: 'causalColor',
      mathematical: 'mathematicalColor',
      scientific: 'scientificColor',
      probabilistic: 'probabilisticColor',
      dialectical: 'dialecticalColor',
      practical: 'practicalColor',
      creative: 'creativeColor',
      critical: 'criticalColor',
    };
    return colors[category] || 'black';
  }

  /**
   * Get metric color based on value
   */
  private getMetricColor(value: number): string {
    if (value >= 0.8) return 'green!70!black';
    if (value >= 0.6) return 'blue!70!black';
    if (value >= 0.4) return 'orange!70!black';
    return 'red!70!black';
  }

  /**
   * Format cognitive load
   */
  private formatCognitiveLoad(load: string): string {
    const mapping: Record<string, string> = {
      minimal: 'Minimal',
      low: 'Low',
      moderate: 'Moderate',
      high: 'High',
      very_high: 'Very High',
    };
    return mapping[load] || load;
  }

  /**
   * Format dual process type
   */
  private formatDualProcess(process: string): string {
    const mapping: Record<string, string> = {
      system1: 'System 1 (Fast, Intuitive)',
      system2: 'System 2 (Slow, Analytical)',
      hybrid: 'Hybrid',
    };
    return mapping[process] || process;
  }

  /**
   * Generate complete taxonomy-enhanced LaTeX document
   */
  generateFullDocument(session: ThinkingSession, options: TaxonomyLatexOptions): string {
    let latex = `\\documentclass[12pt]{article}

${this.generateTaxonomyPreamble()}

\\title{Reasoning Session: ${session.title}}
\\author{DeepThinking MCP v3.4.0}
\\date{\\today}

\\begin{document}

\\maketitle

\\tableofcontents
\\newpage

${this.generateTaxonomyOverview(session, options)}

`;

    if (options.includeCitations) {
      latex += this.generateTaxonomyBibliography();
    }

    latex += `
\\end{document}
`;

    return latex;
  }
}
