/**
 * LaTeX Export Module (v3.2.0)
 * Exports thinking sessions to LaTeX format for professional documentation
 */

import type { ThinkingSession } from '../types/session.js';
import type { Thought, MathematicsThought, PhysicsThought, CausalThought, BayesianThought, AnalogicalThought, TemporalThought, GameTheoryThought, EvidentialThought, FirstPrinciplesThought } from '../types/index.js';
import { VisualExporter } from './visual.js';

/**
 * LaTeX export options
 */
export interface LaTeXExportOptions {
  // Document configuration
  documentClass?: 'article' | 'report' | 'book' | 'memoir';
  fontSize?: '10pt' | '11pt' | '12pt';
  paperSize?: 'letter' | 'a4' | 'legal';

  // Content options
  includeMetadata?: boolean;
  includeTOC?: boolean;
  includeTimestamps?: boolean;
  includeMetrics?: boolean;

  // Formatting options
  syntaxHighlighting?: boolean;
  colorScheme?: 'default' | 'monochrome' | 'vibrant';

  // Package options
  packages?: string[];
  customPreamble?: string;

  // Mode-specific options
  renderDiagrams?: boolean;
  inlineMath?: boolean;
}

/**
 * LaTeX Exporter for converting thinking sessions to LaTeX documents
 */
export class LaTeXExporter {
  private options: Required<LaTeXExportOptions>;
  private visualExporter: VisualExporter;

  constructor(options: LaTeXExportOptions = {}) {
    // Set defaults
    this.options = {
      documentClass: options.documentClass || 'article',
      fontSize: options.fontSize || '11pt',
      paperSize: options.paperSize || 'letter',
      includeMetadata: options.includeMetadata !== false,
      includeTOC: options.includeTOC !== false,
      includeTimestamps: options.includeTimestamps !== false,
      includeMetrics: options.includeMetrics !== false,
      syntaxHighlighting: options.syntaxHighlighting !== false,
      colorScheme: options.colorScheme || 'default',
      packages: options.packages || [],
      customPreamble: options.customPreamble || '',
      renderDiagrams: options.renderDiagrams !== false,
      inlineMath: options.inlineMath !== false,
    };
    this.visualExporter = new VisualExporter();
  }

  /**
   * Generate LaTeX preamble with document setup
   */
  preamble(): string {
    const packages = this.getRequiredPackages();
    const colorSetup = this.getColorScheme();

    return `\\documentclass[${this.options.fontSize},${this.options.paperSize}paper]{${this.options.documentClass}}

% Core packages
${packages.join('\n')}

% Color scheme setup
${colorSetup}

% Theorem environments
\\newtheorem{theorem}{Theorem}[section]
\\newtheorem{lemma}[theorem]{Lemma}
\\newtheorem{corollary}[theorem]{Corollary}
\\newtheorem{definition}[theorem]{Definition}
\\newtheorem{proposition}[theorem]{Proposition}

% Custom commands
\\newcommand{\\thoughtsection}[2]{%
  \\subsection{Thought #1: #2}%
}

\\newcommand{\\metadata}[2]{%
  \\textbf{#1:} \\textit{#2}\\\\%
}

\\newcommand{\\uncertainty}[1]{%
  \\textcolor{uncertaintycolor}{[Uncertainty: #1]}%
}

% Custom preamble
${this.options.customPreamble}

% Document metadata setup
\\usepackage{fancyhdr}
\\pagestyle{fancy}
\\fancyhead[L]{DeepThinking Session}
\\fancyhead[R]{\\today}
\\fancyfoot[C]{\\thepage}

% Hyperref should be last
\\usepackage{hyperref}
\\hypersetup{
  colorlinks=true,
  linkcolor=blue,
  citecolor=blue,
  urlcolor=blue,
}
`;
  }

  /**
   * Get required LaTeX packages based on options
   */
  private getRequiredPackages(): string[] {
    const packages = [
      '\\usepackage[utf8]{inputenc}',
      '\\usepackage[T1]{fontenc}',
      '\\usepackage{amsmath}',
      '\\usepackage{amssymb}',
      '\\usepackage{amsthm}',
      '\\usepackage{graphicx}',
      '\\usepackage{xcolor}',
      '\\usepackage{listings}',
      '\\usepackage{geometry}',
      '\\usepackage{enumitem}',
      '\\usepackage{tikz}',
      '\\usepackage{booktabs}',
      '\\usepackage{longtable}',
      '\\usepackage{multirow}',
    ];

    // Add TikZ libraries for diagrams
    if (this.options.renderDiagrams) {
      packages.push('\\usetikzlibrary{shapes,arrows,positioning,graphs,calc}');
    }

    // Add syntax highlighting
    if (this.options.syntaxHighlighting) {
      packages.push('\\usepackage{minted}');
    }

    // Add custom packages
    this.options.packages.forEach(pkg => {
      packages.push(`\\usepackage{${pkg}}`);
    });

    return packages;
  }

  /**
   * Get color scheme definitions
   */
  private getColorScheme(): string {
    const schemes = {
      default: `% Default color scheme
\\definecolor{thoughtcolor}{RGB}{52,73,94}
\\definecolor{metacolor}{RGB}{127,140,141}
\\definecolor{uncertaintycolor}{RGB}{231,76,60}
\\definecolor{mathcolor}{RGB}{46,134,193}
\\definecolor{physicscolor}{RGB}{142,68,173}
\\definecolor{codebackground}{RGB}{247,247,247}`,

      monochrome: `% Monochrome color scheme
\\definecolor{thoughtcolor}{RGB}{0,0,0}
\\definecolor{metacolor}{RGB}{80,80,80}
\\definecolor{uncertaintycolor}{RGB}{120,120,120}
\\definecolor{mathcolor}{RGB}{0,0,0}
\\definecolor{physicscolor}{RGB}{0,0,0}
\\definecolor{codebackground}{RGB}{245,245,245}`,

      vibrant: `% Vibrant color scheme
\\definecolor{thoughtcolor}{RGB}{26,188,156}
\\definecolor{metacolor}{RGB}{52,152,219}
\\definecolor{uncertaintycolor}{RGB}{231,76,60}
\\definecolor{mathcolor}{RGB}{155,89,182}
\\definecolor{physicscolor}{RGB}{243,156,18}
\\definecolor{codebackground}{RGB}{236,240,241}`,
    };

    return schemes[this.options.colorScheme];
  }

  /**
   * Export a complete thinking session to LaTeX
   */
  export(session: ThinkingSession): string {
    const preamble = this.preamble();
    const metadata = this.options.includeMetadata ? this.formatMetadata(session) : '';
    const toc = this.options.includeTOC ? '\\tableofcontents\n\\newpage\n' : '';
    const content = this.formatSession(session);

    return `${preamble}

\\begin{document}

\\title{${this.escapeLatex(session.title)}}
${session.author ? `\\author{${this.escapeLatex(session.author)}}` : ''}
\\date{${this.formatDate(session.createdAt)}}
\\maketitle

${metadata}

${toc}

${content}

\\end{document}`;
  }

  /**
   * Format session metadata
   */
  private formatMetadata(session: ThinkingSession): string {
    const meta: string[] = [];

    meta.push('\\section*{Session Metadata}');
    meta.push('\\begin{description}[leftmargin=3cm,style=nextline]');
    meta.push(`  \\item[Session ID] \\texttt{${this.escapeLatex(session.id)}}`);
    meta.push(`  \\item[Mode] \\texttt{${this.escapeLatex(session.mode)}}`);

    if (session.domain) {
      meta.push(`  \\item[Domain] ${this.escapeLatex(session.domain)}`);
    }

    if (this.options.includeTimestamps) {
      meta.push(`  \\item[Created] ${this.formatDate(session.createdAt)}`);
      meta.push(`  \\item[Updated] ${this.formatDate(session.updatedAt)}`);
    }

    if (this.options.includeMetrics && session.metrics) {
      meta.push(`  \\item[Total Thoughts] ${session.metrics.totalThoughts}`);
      meta.push(`  \\item[Revisions] ${session.metrics.revisionCount}`);
      meta.push(`  \\item[Average Uncertainty] ${session.metrics.averageUncertainty.toFixed(3)}`);
      if (session.metrics.timeSpent > 0) {
        meta.push(`  \\item[Time Spent] ${this.formatDuration(session.metrics.timeSpent)}`);
      }
    }

    if (session.tags && session.tags.length > 0) {
      meta.push(`  \\item[Tags] ${session.tags.map(t => this.escapeLatex(t)).join(', ')}`);
    }

    meta.push('\\end{description}');
    meta.push('\\newpage\n');

    return meta.join('\n');
  }

  /**
   * Format the session content (all thoughts)
   */
  private formatSession(session: ThinkingSession): string {
    const sections: string[] = [];

    sections.push('\\section{Reasoning Process}');
    sections.push('');

    session.thoughts.forEach((thought, index) => {
      sections.push(this.formatThought(thought, index + 1));
      sections.push(''); // Add spacing between thoughts
    });

    // Add summary if session is complete
    if (session.isComplete) {
      sections.push(this.formatSummary(session));
    }

    return sections.join('\n');
  }

  /**
   * Format a single thought based on its mode
   */
  private formatThought(thought: Thought, number: number): string {
    const sections: string[] = [];

    // Thought header
    const thoughtLabel = thought.isRevision ? 'Revision' : 'Thought';
    sections.push(`\\thoughtsection{${number}}{${thoughtLabel}}`);

    // Thought content
    sections.push(`\\noindent ${this.escapeLatex(thought.content)}`);
    sections.push('');

    // Mode-specific formatting
    switch (thought.mode) {
      case 'mathematics':
        sections.push(this.formatMathematicsThought(thought as MathematicsThought));
        break;
      case 'physics':
        sections.push(this.formatPhysicsThought(thought as PhysicsThought));
        break;
      case 'causal':
        sections.push(this.formatCausalThought(thought as CausalThought));
        break;
      case 'bayesian':
        sections.push(this.formatBayesianThought(thought as BayesianThought));
        break;
      case 'analogical':
        sections.push(this.formatAnalogicalThought(thought as AnalogicalThought));
        break;
      case 'temporal':
        sections.push(this.formatTemporalThought(thought as TemporalThought));
        break;
      case 'gametheory':
        sections.push(this.formatGameTheoryThought(thought as GameTheoryThought));
        break;
      case 'evidential':
        sections.push(this.formatEvidentialThought(thought as EvidentialThought));
        break;
      case 'firstprinciples':
        sections.push(this.formatFirstPrinciplesThought(thought as FirstPrinciplesThought));
        break;
      default:
        // Generic formatting for other modes
        sections.push(this.formatGenericThought(thought));
        break;
    }


    // Embed Mermaid diagrams for visual modes
    if (this.shouldIncludeDiagram(thought)) {
      try {
        let mermaid: string = '';
        let caption: string = '';

        switch (thought.mode) {
          case 'causal':
            mermaid = this.visualExporter.exportCausalGraph(
              thought as CausalThought,
              { format: 'mermaid', includeLabels: true, includeMetrics: true }
            );
            caption = `Causal Graph for Thought ${number}`;
            break;
          case 'temporal':
            mermaid = this.visualExporter.exportTemporalTimeline(
              thought as TemporalThought,
              { format: 'mermaid', includeLabels: true }
            );
            caption = `Temporal Timeline for Thought ${number}`;
            break;
          case 'gametheory':
            mermaid = this.visualExporter.exportGameTree(
              thought as GameTheoryThought,
              { format: 'mermaid', includeLabels: true, includeMetrics: true }
            );
            caption = `Game Tree for Thought ${number}`;
            break;
          case 'bayesian':
            mermaid = this.visualExporter.exportBayesianNetwork(
              thought as BayesianThought,
              { format: 'mermaid', includeLabels: true, includeMetrics: true }
            );
            caption = `Bayesian Network for Thought ${number}`;
            break;
        }

        if (mermaid) {
          sections.push(this.embedMermaidDiagram(mermaid, caption));
        }
      } catch (error) {
        // Silently skip diagram generation if it fails
        console.warn(`Failed to generate diagram for thought ${number}:`, error);
      }
    }
    return sections.join('\n');
  }

  /**
   * Format Mathematics mode thought
   */
  private formatMathematicsThought(thought: MathematicsThought): string {
    const sections: string[] = [];

    // Assumptions
    if (thought.assumptions && thought.assumptions.length > 0) {
      sections.push('\\paragraph{Assumptions}');
      sections.push('\\begin{itemize}');
      thought.assumptions.forEach(assumption => {
        sections.push(`  \\item ${this.escapeLatex(assumption)}`);
      });
      sections.push('\\end{itemize}');
      sections.push('');
    }

    // Mathematical model with equation numbering
    if (thought.mathematicalModel) {
      sections.push('\\paragraph{Mathematical Model}');
      sections.push('\\begin{equation}');
      sections.push(`  \\label{eq:thought${thought.thoughtNumber}}`);
      sections.push(`  ${thought.mathematicalModel.latex}`);
      sections.push('\\end{equation}');

      // Add symbolic representation if different
      if (thought.mathematicalModel.symbolic && thought.mathematicalModel.symbolic !== thought.mathematicalModel.latex) {
        sections.push(`\\textit{Symbolic form:} \\texttt{${this.escapeLatex(thought.mathematicalModel.symbolic)}}`);
      }

      // Add complexity and invariants if present
      if (thought.mathematicalModel.complexity) {
        sections.push(`\\textit{Complexity:} ${this.escapeLatex(thought.mathematicalModel.complexity)}`);
      }

      if (thought.mathematicalModel.invariants && thought.mathematicalModel.invariants.length > 0) {
        sections.push('\\textit{Invariants:}');
        sections.push('\\begin{itemize}');
        thought.mathematicalModel.invariants.forEach(inv => {
          sections.push(`  \\item ${this.escapeLatex(inv)}`);
        });
        sections.push('\\end{itemize}');
      }

      sections.push('');
    }

    // Theorems
    if (thought.theorems && thought.theorems.length > 0) {
      thought.theorems.forEach((theorem, index) => {
        sections.push(this.formatTheorem(theorem, thought.thoughtNumber, index));
      });
    }

    // Proof strategy with proof environment
    if (thought.proofStrategy) {
      sections.push(this.formatProof(thought.proofStrategy));
    }

    // Logical form
    if (thought.logicalForm) {
      sections.push(this.formatLogicalForm(thought.logicalForm));
    }

    // Dependencies
    if (thought.dependencies && thought.dependencies.length > 0) {
      sections.push('\\paragraph{Dependencies}');
      sections.push('References thoughts: ' + thought.dependencies.join(', '));
      sections.push('');
    }

    // Uncertainty
    if (thought.uncertainty !== undefined) {
      sections.push(`\\uncertainty{${(thought.uncertainty * 100).toFixed(1)}\\%}`);
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Format a theorem
   */
  private formatTheorem(theorem: any, thoughtNum: number, index: number): string {
    const sections: string[] = [];

    sections.push(`\\begin{theorem}[${this.escapeLatex(theorem.name)}]`);
    sections.push(`\\label{thm:thought${thoughtNum}-${index}}`);
    sections.push(this.escapeLatex(theorem.statement));

    if (theorem.hypotheses && theorem.hypotheses.length > 0) {
      sections.push('\\\\\\textbf{Hypotheses:}');
      sections.push('\\begin{enumerate}');
      theorem.hypotheses.forEach((hyp: string) => {
        sections.push(`  \\item ${this.escapeLatex(hyp)}`);
      });
      sections.push('\\end{enumerate}');
    }

    sections.push('\\end{theorem}');

    if (theorem.proof) {
      sections.push('\\begin{proof}');
      sections.push(this.escapeLatex(theorem.proof));
      sections.push('\\end{proof}');
    }

    sections.push('');

    return sections.join('\n');
  }

  /**
   * Format a proof strategy
   */
  private formatProof(proof: any): string {
    const sections: string[] = [];

    sections.push('\\begin{proof}');
    sections.push(`\\textbf{Strategy:} ${proof.type}`);
    sections.push('');

    if (proof.steps && proof.steps.length > 0) {
      proof.steps.forEach((step: string, i: number) => {
        sections.push(`\\textbf{Step ${i + 1}:} ${this.escapeLatex(step)}`);
        sections.push('');
      });
    }

    if (proof.baseCase) {
      sections.push(`\\textbf{Base Case:} ${this.escapeLatex(proof.baseCase)}`);
      sections.push('');
    }

    if (proof.inductiveStep) {
      sections.push(`\\textbf{Inductive Step:} ${this.escapeLatex(proof.inductiveStep)}`);
      sections.push('');
    }

    if (proof.completeness !== undefined) {
      sections.push(`\\textit{Completeness: ${(proof.completeness * 100).toFixed(0)}\\%}`);
    }

    sections.push('\\end{proof}');
    sections.push('');

    return sections.join('\n');
  }

  /**
   * Format logical form
   */
  private formatLogicalForm(logic: any): string {
    const sections: string[] = [];

    sections.push('\\paragraph{Logical Form}');

    if (logic.premises && logic.premises.length > 0) {
      sections.push('\\textbf{Premises:}');
      sections.push('\\begin{enumerate}');
      logic.premises.forEach((premise: string) => {
        sections.push(`  \\item ${this.escapeLatex(premise)}`);
      });
      sections.push('\\end{enumerate}');
    }

    if (logic.conclusion) {
      sections.push(`\\textbf{Conclusion:} ${this.escapeLatex(logic.conclusion)}`);
      sections.push('');
    }

    if (logic.rules && logic.rules.length > 0) {
      sections.push('\\textbf{Inference Rules:}');
      sections.push('\\begin{itemize}');
      logic.rules.forEach((rule: string) => {
        sections.push(`  \\item ${this.escapeLatex(rule)}`);
      });
      sections.push('\\end{itemize}');
    }

    sections.push('');

    return sections.join('\n');
  }

  /**
   * Format Physics mode thought
   */
  private formatPhysicsThought(thought: PhysicsThought): string {
    const sections: string[] = [];

    if (thought.tensorProperties) {
      sections.push('\\paragraph{Tensor Properties}');
      sections.push(`\\textbf{Rank:} $(${thought.tensorProperties.rank[0]}, ${thought.tensorProperties.rank[1]})$`);
      sections.push('');
      sections.push('\\begin{equation}');
      sections.push(thought.tensorProperties.latex);
      sections.push('\\end{equation}');
      sections.push('');
    }

    if (thought.physicalInterpretation) {
      sections.push('\\paragraph{Physical Interpretation}');
      sections.push(`\\textbf{Quantity:} ${this.escapeLatex(thought.physicalInterpretation.quantity)}`);
      sections.push(`\\textbf{Units:} ${this.escapeLatex(thought.physicalInterpretation.units)}`);

      if (thought.physicalInterpretation.conservationLaws.length > 0) {
        sections.push('\\textbf{Conservation Laws:}');
        sections.push('\\begin{itemize}');
        thought.physicalInterpretation.conservationLaws.forEach(law => {
          sections.push(`  \\item ${this.escapeLatex(law)}`);
        });
        sections.push('\\end{itemize}');
      }
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Format Causal mode thought with TikZ diagrams
   */
  private formatCausalThought(thought: CausalThought): string {
    const sections: string[] = [];

    // Causal graph visualization
    if (thought.causalGraph && this.options.renderDiagrams) {
      sections.push(this.formatCausalGraph(thought.causalGraph, thought.thoughtNumber));
    }

    // Causal mechanisms
    if (thought.mechanisms && thought.mechanisms.length > 0) {
      sections.push('\\paragraph{Causal Mechanisms}');
      sections.push('\\begin{itemize}');
      thought.mechanisms.forEach(mechanism => {
        const typeLabel = mechanism.type === 'direct' ? 'Direct' :
                         mechanism.type === 'indirect' ? 'Indirect' : 'Feedback';
        sections.push(`  \\item \\textbf{[${typeLabel}]} ${this.escapeLatex(mechanism.from)} $\\rightarrow$ ${this.escapeLatex(mechanism.to)}: ${this.escapeLatex(mechanism.description)}`);
      });
      sections.push('\\end{itemize}');
      sections.push('');
    }

    // Interventions
    if (thought.interventions && thought.interventions.length > 0) {
      sections.push(this.formatInterventions(thought.interventions));
    }

    // Confounders
    if (thought.confounders && thought.confounders.length > 0) {
      sections.push('\\paragraph{Confounding Variables}');
      sections.push('\\begin{itemize}');
      thought.confounders.forEach(confounder => {
        sections.push(`  \\item \\textbf{${this.escapeLatex(confounder.nodeId)}}: ${this.escapeLatex(confounder.description)}`);
        if (confounder.affects && confounder.affects.length > 0) {
          sections.push(`        \\\\\\textit{Affects:} ${confounder.affects.join(', ')}`);
        }
      });
      sections.push('\\end{itemize}');
      sections.push('');
    }

    // Counterfactuals
    if (thought.counterfactuals && thought.counterfactuals.length > 0) {
      sections.push('\\paragraph{Counterfactual Scenarios}');
      thought.counterfactuals.forEach(cf => {
        sections.push(`\\textbf{${this.escapeLatex(cf.description)}}`);
        sections.push(`\\\\\\textit{Predicted outcome:} ${this.escapeLatex(cf.predictedOutcome)}`);
        sections.push('');
      });
    }

    return sections.join('\n');
  }

  /**
   * Format causal graph as TikZ diagram
   */
  private formatCausalGraph(graph: any, thoughtNum: number): string {
    const sections: string[] = [];

    sections.push('\\begin{figure}[h]');
    sections.push('\\centering');
    sections.push('\\begin{tikzpicture}[');
    sections.push('  node distance=2.5cm,');
    sections.push('  auto,');
    sections.push('  thick,');
    sections.push('  main node/.style={circle,draw,font=\\sffamily\\small,minimum size=1cm}');
    sections.push(']');
    sections.push('');

    // Calculate positions for nodes
    const positions = this.calculateNodePositions(graph.nodes);

    // Draw nodes
    graph.nodes.forEach((node: any, i: number) => {
      const pos = positions[i];
      const style = this.getNodeStyle(node.type);
      const label = this.escapeLatex(node.name).substring(0, 15); // Truncate long names
      sections.push(`\\node[main node,${style}] (${node.id}) at (${pos.x},${pos.y}) {${label}};`);
    });

    sections.push('');

    // Draw edges
    graph.edges.forEach((edge: any) => {
      const edgeStyle = this.getEdgeStyle(edge.strength);
      const label = edge.strength >= 0
        ? `${edge.strength.toFixed(2)}`
        : `${edge.strength.toFixed(2)}`;

      sections.push(`\\draw[${edgeStyle}] (${edge.from}) -- node[midway,above,sloped,font=\\tiny] {${label}} (${edge.to});`);
    });

    sections.push('');
    sections.push('\\end{tikzpicture}');
    sections.push(`\\caption{Causal Graph (Thought ${thoughtNum})}`);
    sections.push(`\\label{fig:causal${thoughtNum}}`);
    sections.push('\\end{figure}');
    sections.push('');

    return sections.join('\n');
  }

  /**
   * Calculate node positions using a layered layout
   */
  private calculateNodePositions(nodes: any[]): Array<{x: number, y: number}> {
    // Group nodes by type
    const causes = nodes.filter(n => n.type === 'cause');
    const mediators = nodes.filter(n => n.type === 'mediator');
    const effects = nodes.filter(n => n.type === 'effect');
    const confounders = nodes.filter(n => n.type === 'confounder');

    const positions: Array<{x: number, y: number}> = [];
    const spacing = 3; // horizontal spacing between nodes

    // Layout causes on the left (x=0)
    causes.forEach((node, i) => {
      const y = (i - (causes.length - 1) / 2) * spacing;
      positions[nodes.indexOf(node)] = { x: 0, y };
    });

    // Layout mediators in the middle (x=spacing)
    mediators.forEach((node, i) => {
      const y = (i - (mediators.length - 1) / 2) * spacing;
      positions[nodes.indexOf(node)] = { x: spacing, y };
    });

    // Layout effects on the right (x=spacing*2)
    effects.forEach((node, i) => {
      const y = (i - (effects.length - 1) / 2) * spacing;
      positions[nodes.indexOf(node)] = { x: spacing * 2, y };
    });

    // Layout confounders above (y=spacing*1.5)
    confounders.forEach((node, i) => {
      const x = (i - (confounders.length - 1) / 2) * spacing + spacing;
      positions[nodes.indexOf(node)] = { x, y: spacing * 1.5 };
    });

    return positions;
  }

  /**
   * Get TikZ node style based on node type
   */
  private getNodeStyle(type: string): string {
    const styles: Record<string, string> = {
      cause: 'fill=blue!20',
      effect: 'fill=red!20',
      mediator: 'fill=green!20',
      confounder: 'fill=yellow!20,dashed'
    };
    return styles[type] || 'fill=gray!20';
  }

  /**
   * Get TikZ edge style based on strength
   */
  private getEdgeStyle(strength: number): string {
    const absStrength = Math.abs(strength);
    const direction = strength >= 0 ? '->' : '->,red';

    if (absStrength > 0.7) {
      return `${direction},very thick`;
    } else if (absStrength > 0.4) {
      return `${direction},thick`;
    } else {
      return `${direction},dashed`;
    }
  }

  /**
   * Format interventions
   */
  private formatInterventions(interventions: any[]): string {
    const sections: string[] = [];

    sections.push('\\paragraph{Interventions}');
    sections.push('\\begin{enumerate}');

    interventions.forEach(intervention => {
      sections.push(`  \\item \\textbf{Action on ${this.escapeLatex(intervention.nodeId)}:} ${this.escapeLatex(intervention.action)}`);

      if (intervention.expectedEffects && intervention.expectedEffects.length > 0) {
        sections.push('        \\\\\\textit{Expected effects:}');
        sections.push('        \\begin{itemize}');
        intervention.expectedEffects.forEach((effect: any) => {
          sections.push(`          \\item ${this.escapeLatex(effect.nodeId)}: ${this.escapeLatex(effect.expectedChange)} (confidence: ${(effect.confidence * 100).toFixed(0)}\\%)`);
        });
        sections.push('        \\end{itemize}');
      }
    });

    sections.push('\\end{enumerate}');
    sections.push('');

    return sections.join('\n');
  }

  /**
   * Format Bayesian mode thought with probability calculations
   */
  private formatBayesianThought(thought: BayesianThought): string {
    const sections: string[] = [];

    // Hypothesis
    sections.push('\\paragraph{Hypothesis}');
    sections.push(this.escapeLatex(thought.hypothesis.statement));
    if (thought.hypothesis.alternatives && thought.hypothesis.alternatives.length > 0) {
      sections.push('\\\\\\textit{Alternatives:}');
      sections.push('\\begin{itemize}');
      thought.hypothesis.alternatives.forEach(alt => {
        sections.push(`  \\item ${this.escapeLatex(alt)}`);
      });
      sections.push('\\end{itemize}');
    }
    sections.push('');

    // Prior probability
    sections.push('\\paragraph{Prior Probability}');
    sections.push('\\begin{equation}');
    sections.push(`  P(H) = ${thought.prior.probability.toFixed(4)}`);
    sections.push('\\end{equation}');
    sections.push(`\\textit{Justification:} ${this.escapeLatex(thought.prior.justification)}`);
    sections.push('');

    // Evidence with likelihoods
    if (thought.evidence && thought.evidence.length > 0) {
      sections.push('\\paragraph{Evidence}');
      sections.push('\\begin{itemize}');
      thought.evidence.forEach(ev => {
        sections.push(`  \\item \\textbf{${this.escapeLatex(ev.description)}}`);
        sections.push('        \\begin{align*}');
        sections.push(`          P(E|H) &= ${ev.likelihoodGivenHypothesis.toFixed(4)} \\\\`);
        sections.push(`          P(E|\\neg H) &= ${ev.likelihoodGivenNotHypothesis.toFixed(4)}`);
        sections.push('        \\end{align*}');
      });
      sections.push('\\end{itemize}');
      sections.push('');
    }

    // Posterior probability
    sections.push('\\paragraph{Posterior Probability}');
    sections.push('\\begin{equation}');
    sections.push(`  P(H|E) = ${thought.posterior.probability.toFixed(4)}`);
    sections.push('\\end{equation}');
    sections.push(`\\textit{Calculation:} ${this.escapeLatex(thought.posterior.calculation)}`);
    if ((thought.posterior as any).confidence !== undefined) {
      sections.push(`\\\\\\textit{Confidence:} ${((thought.posterior as any).confidence * 100).toFixed(1)}\\%`);
    }
    sections.push('');

    // Bayes factor
    if (thought.bayesFactor !== undefined) {
      sections.push('\\paragraph{Bayes Factor}');
      const interpretation = this.interpretBayesFactor(thought.bayesFactor);
      sections.push(`\\textbf{BF} = ${thought.bayesFactor.toFixed(2)}`);
      sections.push(`\\\\\\textit{Interpretation:} ${interpretation}`);
      sections.push('');
    }

    // Sensitivity analysis
    if (thought.sensitivity) {
      sections.push('\\paragraph{Sensitivity Analysis}');
      sections.push(`Prior range: [${thought.sensitivity.priorRange[0].toFixed(2)}, ${thought.sensitivity.priorRange[1].toFixed(2)}]`);
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Interpret Bayes factor strength
   */
  private interpretBayesFactor(bf: number): string {
    if (bf > 100) return 'Extreme evidence for hypothesis';
    if (bf > 30) return 'Very strong evidence for hypothesis';
    if (bf > 10) return 'Strong evidence for hypothesis';
    if (bf > 3) return 'Moderate evidence for hypothesis';
    if (bf > 1) return 'Weak evidence for hypothesis';
    if (bf === 1) return 'No evidence';
    if (bf > 1/3) return 'Weak evidence against hypothesis';
    if (bf > 1/10) return 'Moderate evidence against hypothesis';
    if (bf > 1/30) return 'Strong evidence against hypothesis';
    if (bf > 1/100) return 'Very strong evidence against hypothesis';
    return 'Extreme evidence against hypothesis';
  }

  /**
   * Format Analogical mode thought with domain mappings
   */
  private formatAnalogicalThought(thought: any): string {
    const sections: string[] = [];

    // Source domain
    sections.push('\\paragraph{Source Domain}');
    sections.push(`\\textbf{${this.escapeLatex(thought.sourceDomain.name)}}`);
    sections.push(`\\\\${this.escapeLatex(thought.sourceDomain.description)}`);
    sections.push('');

    // Target domain
    sections.push('\\paragraph{Target Domain}');
    sections.push(`\\textbf{${this.escapeLatex(thought.targetDomain.name)}}`);
    sections.push(`\\\\${this.escapeLatex(thought.targetDomain.description)}`);
    sections.push('');

    // Mappings
    if (thought.mapping && thought.mapping.length > 0) {
      sections.push('\\paragraph{Mappings}');
      sections.push('\\begin{itemize}');
      thought.mapping.forEach((m: any) => {
        sections.push(`  \\item ${this.escapeLatex(m.sourceEntityId)} $\\mapsto$ ${this.escapeLatex(m.targetEntityId)}`);
        sections.push(`        \\\\\\textit{Confidence:} ${(m.confidence * 100).toFixed(0)}\\%`);
        sections.push(`        \\\\\\textit{Justification:} ${this.escapeLatex(m.justification)}`);
      });
      sections.push('\\end{itemize}');
      sections.push('');
    }

    // Insights
    if (thought.insights && thought.insights.length > 0) {
      sections.push('\\paragraph{Insights}');
      sections.push('\\begin{enumerate}');
      thought.insights.forEach((insight: any) => {
        sections.push(`  \\item ${this.escapeLatex(insight.description)}`);
        sections.push(`        \\\\\\textit{Source evidence:} ${this.escapeLatex(insight.sourceEvidence)}`);
        sections.push(`        \\\\\\textit{Target application:} ${this.escapeLatex(insight.targetApplication)}`);
        sections.push(`        \\\\\\textit{Novelty:} ${(insight.novelty * 100).toFixed(0)}\\%`);
      });
      sections.push('\\end{enumerate}');
      sections.push('');
    }

    // Inferences
    if (thought.inferences && thought.inferences.length > 0) {
      sections.push('\\paragraph{Inferences}');
      sections.push('\\begin{enumerate}');
      thought.inferences.forEach((inference: any) => {
        sections.push(`  \\item ${this.escapeLatex(inference.description)}`);
        sections.push(`        \\\\\\textit{Based on:} ${this.escapeLatex(inference.basedOn)}`);
        sections.push(`        \\\\\\textit{Confidence:} ${(inference.confidence * 100).toFixed(0)}\\%`);
        sections.push(`        \\\\\\textit{Testability:} ${this.escapeLatex(inference.testability)}`);
      });
      sections.push('\\end{enumerate}');
      sections.push('');
    }

    // Analogy strength
    sections.push('\\paragraph{Analogy Strength}');
    const strengthPercent = (thought.analogyStrength * 100).toFixed(1);
    const strengthLabel = thought.analogyStrength > 0.7 ? 'Strong' :
                          thought.analogyStrength > 0.4 ? 'Moderate' : 'Weak';
    sections.push(`${strengthPercent}\\% (${strengthLabel})`);
    sections.push('');

    // Limitations
    if (thought.limitations && thought.limitations.length > 0) {
      sections.push('\\paragraph{Limitations}');
      sections.push('\\begin{itemize}');
      thought.limitations.forEach((lim: string) => {
        sections.push(`  \\item ${this.escapeLatex(lim)}`);
      });
      sections.push('\\end{itemize}');
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Format Temporal mode thought with timeline visualization
   */
  private formatTemporalThought(thought: TemporalThought): string {
    const sections: string[] = [];

    // Timeline information
    if (thought.timeline) {
      sections.push('\\paragraph{Timeline}');
      sections.push(`\\textbf{${this.escapeLatex(thought.timeline.name)}}`);
      sections.push(`\\\\Time Unit: ${this.escapeLatex(thought.timeline.timeUnit)}`);
      if (thought.timeline.startTime !== undefined) {
        sections.push(`\\\\Start: ${thought.timeline.startTime}`);
      }
      if (thought.timeline.endTime !== undefined) {
        sections.push(`\\\\End: ${thought.timeline.endTime}`);
      }
      sections.push('');
    }

    // Events
    if (thought.events && thought.events.length > 0) {
      sections.push('\\paragraph{Events}');
      sections.push('\\begin{itemize}');
      thought.events.forEach(event => {
        const eventType = event.type === 'instant' ? 'Instant' : 'Interval';
        sections.push(`  \\item \\textbf{[${eventType}] ${this.escapeLatex(event.name)}} (t=${event.timestamp})`);
        sections.push(`        \\\\${this.escapeLatex(event.description)}`);
      });
      sections.push('\\end{itemize}');
      sections.push('');
    }

    // Temporal relations
    if (thought.relations && thought.relations.length > 0) {
      sections.push('\\paragraph{Temporal Relations}');
      sections.push('\\begin{itemize}');
      thought.relations.forEach(rel => {
        const relType = rel.relationType.replace(/_/g, ' ');
        sections.push(`  \\item ${this.escapeLatex(rel.from)} \\textit{${relType}} ${this.escapeLatex(rel.to)}`);
        if (rel.delay) {
          sections.push(`        \\\\Delay: ${rel.delay}`);
        }
        sections.push(`        \\\\Strength: ${(rel.strength * 100).toFixed(0)}\\%`);
      });
      sections.push('\\end{itemize}');
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Format Game Theory mode thought
   */
  private formatGameTheoryThought(thought: GameTheoryThought): string {
    const sections: string[] = [];

    // Game description
    if (thought.game) {
      sections.push('\\paragraph{Game}');
      sections.push(`\\textbf{${this.escapeLatex(thought.game.name)}} (${thought.game.type})`);
      sections.push(`\\\\Players: ${thought.game.numPlayers}`);
      sections.push('');
    }

    // Players
    if (thought.players && thought.players.length > 0) {
      sections.push('\\paragraph{Players}');
      sections.push('\\begin{itemize}');
      thought.players.forEach(player => {
        sections.push(`  \\item \\textbf{${this.escapeLatex(player.name)}}`);
        if (player.role) {
          sections.push(`        \\\\Role: ${this.escapeLatex(player.role)}`);
        }
        sections.push(`        \\\\Rational: ${player.isRational ? 'Yes' : 'No'}`);
      });
      sections.push('\\end{itemize}');
      sections.push('');
    }

    // Strategies
    if (thought.strategies && thought.strategies.length > 0) {
      sections.push('\\paragraph{Strategies}');
      sections.push('\\begin{itemize}');
      thought.strategies.forEach(strategy => {
        const stratType = strategy.isPure ? 'Pure' : 'Mixed';
        sections.push(`  \\item \\textbf{[${stratType}] ${this.escapeLatex(strategy.name)}}`);
        sections.push(`        \\\\${this.escapeLatex(strategy.description)}`);
      });
      sections.push('\\end{itemize}');
      sections.push('');
    }

    // Nash equilibria
    if (thought.nashEquilibria && thought.nashEquilibria.length > 0) {
      sections.push('\\paragraph{Nash Equilibria}');
      sections.push('\\begin{enumerate}');
      thought.nashEquilibria.forEach(eq => {
        const eqType = eq.type || 'Unknown';
        sections.push(`  \\item \\textbf{[${eqType}]} ${eq.strategyProfile.join(', ')}`);
        sections.push(`        \\\\Payoffs: (${eq.payoffs.join(', ')})`);
        sections.push(`        \\\\Stability: ${eq.stability}`);
      });
      sections.push('\\end{enumerate}');
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Format Evidential mode thought (Dempster-Shafer theory)
   */
  private formatEvidentialThought(thought: EvidentialThought): string {
    const sections: string[] = [];

    // Frame of discernment
    if (thought.frameOfDiscernment && thought.frameOfDiscernment.length > 0) {
      sections.push('\\paragraph{Frame of Discernment}');
      sections.push(`$\\Theta = \\{${thought.frameOfDiscernment.map(h => this.escapeLatex(h)).join(', ')}\\}$`);
      sections.push('');
    }

    // Hypotheses
    if (thought.hypotheses && thought.hypotheses.length > 0) {
      sections.push('\\paragraph{Hypotheses}');
      sections.push('\\begin{itemize}');
      thought.hypotheses.forEach(hyp => {
        sections.push(`  \\item \\textbf{${this.escapeLatex(hyp.name)}}: ${this.escapeLatex(hyp.description)}`);
      });
      sections.push('\\end{itemize}');
      sections.push('');
    }

    // Evidence
    if (thought.evidence && thought.evidence.length > 0) {
      sections.push('\\paragraph{Evidence}');
      sections.push('\\begin{enumerate}');
      thought.evidence.forEach(ev => {
        sections.push(`  \\item \\textbf{${this.escapeLatex(ev.description)}}`);
        sections.push(`        \\\\Source: ${this.escapeLatex(ev.source)}`);
        sections.push(`        \\\\Reliability: ${(ev.reliability * 100).toFixed(0)}\\%`);
      });
      sections.push('\\end{enumerate}');
      sections.push('');
    }

    // Belief functions
    if (thought.beliefFunctions && thought.beliefFunctions.length > 0) {
      sections.push('\\paragraph{Belief Functions}');
      sections.push('\\begin{itemize}');
      thought.beliefFunctions.forEach(bf => {
        sections.push(`  \\item \\textbf{Source:} ${this.escapeLatex(bf.source)}`);
        bf.massAssignments.forEach(ma => {
          sections.push(`    - $m(\\{${ma.hypothesisSet.join(', ')}\\}) = ${ma.mass.toFixed(4)}$`);
          sections.push(`      \\\\\\textit{${this.escapeLatex(ma.justification)}}`);
        });
      });
      sections.push('\\end{itemize}');
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Format First-Principles mode thought
   */
  private formatFirstPrinciplesThought(thought: FirstPrinciplesThought): string {
    const sections: string[] = [];

    if (thought.question) {
      sections.push('\\paragraph{Question}');
      sections.push(`\\textit{${this.escapeLatex(thought.question)}}`);
      sections.push('');
    }

    if (thought.principles && thought.principles.length > 0) {
      sections.push('\\paragraph{Foundational Principles}');
      sections.push('\\begin{enumerate}');
      thought.principles.forEach(principle => {
        sections.push(`  \\item \\textbf{[${principle.type}]} ${this.escapeLatex(principle.statement)}`);
        sections.push(`        \\\\\\textit{Justification:} ${this.escapeLatex(principle.justification)}`);
      });
      sections.push('\\end{enumerate}');
      sections.push('');
    }

    if (thought.conclusion) {
      sections.push('\\paragraph{Conclusion}');
      sections.push(this.escapeLatex(thought.conclusion.statement));
      sections.push(`\\\\\\textit{Certainty:} ${thought.conclusion.certainty}`);
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Format generic thought (fallback for modes without specialized formatting)
   */
  private formatGenericThought(thought: Thought): string {
    const sections: string[] = [];

    if (this.options.includeTimestamps) {
      sections.push(`\\textit{Timestamp:} ${this.formatDate(thought.timestamp)}`);
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Format session summary
   */
  private formatSummary(session: ThinkingSession): string {
    const sections: string[] = [];

    sections.push('\\section{Summary}');
    sections.push('');
    sections.push(`This ${session.mode} reasoning session completed with ${session.thoughts.length} thoughts.`);

    if (session.metrics.revisionCount > 0) {
      sections.push(`The reasoning process included ${session.metrics.revisionCount} revisions, `);
      sections.push(`demonstrating iterative refinement.`);
    }

    sections.push('');

    return sections.join('\n');
  }

  /**
   * Escape special LaTeX characters
   */
  private escapeLatex(text: string): string {
    if (!text) return '';

    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/[&%$#_{}]/g, '\\$&')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}');
  }

  /**
   * Format date for LaTeX
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Format duration in human-readable form
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }

  /**
   * Determine if a thought should include a visual diagram
   */
  private shouldIncludeDiagram(thought: Thought): boolean {
    if (!this.options.renderDiagrams) {
      return false;
    }

    // Include diagrams for modes with rich visual representations
    return thought.mode === 'causal' ||
           thought.mode === 'temporal' ||
           thought.mode === 'gametheory' ||
           thought.mode === 'bayesian';
  }

  /**
   * Embed a Mermaid diagram in LaTeX document
   */
  private embedMermaidDiagram(mermaid: string, caption: string): string {
    const sections: string[] = [];

    sections.push('\\begin{figure}[h]');
    sections.push('\\centering');
    sections.push('\\begin{verbatim}');
    sections.push(mermaid);
    sections.push('\\end{verbatim}');
    sections.push(`\\caption{${this.escapeLatex(caption)}}`);
    sections.push('\\end{figure}');
    sections.push('');

    return sections.join('\n');
  }
}
