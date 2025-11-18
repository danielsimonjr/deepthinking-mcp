# DeepThinking MCP Phase 4 - Detailed Task Breakdown

This document provides granular task breakdowns for all Phase 4 features, with specific file locations, code snippets, and acceptance criteria.

**Prerequisites**: Phase 3 complete (v2.6) with 13 reasoning modes, 145 tests, visual/specialized exports

**Phase 4 Timeline**: Weeks 7-18 (after Phase 3 completion)

**Test Count Progression**:
- Phase 3 End: 145 tests
- Phase 4A (v3.0.0): 165 tests (+20)
- Phase 4B (v3.1.0): 185 tests (+20)
- Phase 4C (v3.2.0): 205 tests (+20)
- Phase 4D (v4.0.0): 225 tests (+20)

---

## Phase 4 Dependencies on Phase 3

All Phase 4 tasks build upon Phase 3 infrastructure:
- **Visual Exporter** (`src/export/visual.ts`) - Mermaid, DOT, ASCII generation
- **Specialized Exporter** (`src/export/specialized.ts`) - GraphML, PDDL generation
- **Mode Recommender** (`src/modes/recommendations.ts`) - Problem characteristic analysis
- **13 Reasoning Modes** - Including temporal, game-theoretic, evidential from Phase 3

---

## Phase 4A: Export & Enhanced Visualization (v3.0.0)

### Feature 1: LaTeX Export

#### Task 1.1: Create LaTeX Export Infrastructure
**File**: `src/export/latex.ts`
**Estimated Time**: 3 hours

**Code Snippet**:
```typescript
export interface LaTeXExportOptions {
  documentClass: 'article' | 'report' | 'book';
  includeMetadata: boolean;
  includeTOC: boolean;
  includeValidation: boolean;
  syntaxHighlighting: boolean;
  packages: string[];
  fontSize: '10pt' | '11pt' | '12pt';
  paperSize: 'a4paper' | 'letterpaper';
}

export class LaTeXExporter {
  private preamble(options: LaTeXExportOptions): string {
    return `\\documentclass[${options.fontSize},${options.paperSize}]{${options.documentClass}}
\\usepackage{amsmath,amssymb,amsthm}
\\usepackage{tikz}
\\usepackage{listings}
\\usepackage{hyperref}
${options.packages.map(pkg => `\\usepackage{${pkg}}`).join('\n')}

\\title{Thinking Session Report}
\\date{\\today}

\\begin{document}
\\maketitle
${options.includeTOC ? '\\tableofcontents\n\\newpage' : ''}
`;
  }

  async export(session: ThinkingSession, options: LaTeXExportOptions): Promise<string> {
    let latex = this.preamble(options);

    if (options.includeMetadata) {
      latex += this.formatMetadata(session);
    }

    // Export thoughts
    for (const thought of session.thoughts) {
      latex += this.formatThought(thought);
    }

    latex += '\\end{document}';
    return latex;
  }

  private formatMetadata(session: ThinkingSession): string;
  private formatThought(thought: Thought): string;
}
```

**Acceptance Criteria**:
- [ ] LaTeX preamble generation working
- [ ] Configurable document class and options
- [ ] Package management system
- [ ] Basic document structure output

---

#### Task 1.2: Add Mathematics Mode LaTeX Export
**File**: `src/export/latex.ts`
**Estimated Time**: 4 hours

**Code Snippet**:
```typescript
export class LaTeXExporter {
  private exportMathematics(thoughts: MathematicsThought[]): string {
    let output = '\\section{Mathematical Reasoning}\n\n';

    for (const thought of thoughts) {
      output += `\\subsection{Thought ${thought.thoughtNumber}}\n`;
      output += `${thought.content}\n\n`;

      // Export mathematical model
      if (thought.mathematicalModel) {
        output += '\\begin{equation}\n';
        output += thought.mathematicalModel.latex;
        output += '\n\\end{equation}\n\n';
      }

      // Export proof strategy
      if (thought.proofStrategy) {
        output += this.formatProof(thought.proofStrategy);
      }

      // Export logical form
      if (thought.logicalForm) {
        output += this.formatLogicalForm(thought.logicalForm);
      }
    }

    return output;
  }

  private formatProof(proof: ProofStrategy): string {
    return `\\begin{proof}
\\textbf{Strategy}: ${proof.type}

${proof.steps.map((step, i) => `\\textbf{Step ${i + 1}}: ${step}`).join('\n\n')}

${proof.baseCase ? `\\textbf{Base Case}: ${proof.baseCase}\n` : ''}
${proof.inductiveStep ? `\\textbf{Inductive Step}: ${proof.inductiveStep}\n` : ''}

Completeness: ${(proof.completeness * 100).toFixed(0)}\\%
\\end{proof}\n\n`;
  }

  private formatLogicalForm(logic: LogicalForm): string {
    let output = '\\textbf{Logical Form}:\n\n';
    output += '\\textbf{Premises}:\n\\begin{enumerate}\n';
    logic.premises.forEach(p => {
      output += `\\item ${p}\n`;
    });
    output += '\\end{enumerate}\n\n';
    output += `\\textbf{Conclusion}: ${logic.conclusion}\n\n`;
    output += `\\textbf{Inference Rule}: ${logic.inferenceRule}\n\n`;
    return output;
  }
}
```

**Acceptance Criteria**:
- [ ] Equations formatted correctly with amsmath
- [ ] Proof environments working
- [ ] Logical forms exported
- [ ] Theorem/lemma numbering

---

#### Task 1.3: Add Causal Graph LaTeX Export with TikZ
**File**: `src/export/latex.ts`
**Estimated Time**: 5 hours

**Code Snippet**:
```typescript
export class LaTeXExporter {
  private exportCausal(thoughts: CausalThought[]): string {
    let output = '\\section{Causal Analysis}\n\n';

    for (const thought of thoughts) {
      output += `\\subsection{Thought ${thought.thoughtNumber}}\n`;
      output += `${thought.content}\n\n`;

      if (thought.causalGraph) {
        output += this.formatCausalGraph(thought.causalGraph);
      }

      if (thought.interventions) {
        output += this.formatInterventions(thought.interventions);
      }
    }

    return output;
  }

  private formatCausalGraph(graph: CausalGraph): string {
    let tikz = '\\begin{figure}[h]\n\\centering\n';
    tikz += '\\begin{tikzpicture}[node distance=2cm, auto]\n';

    // Position nodes (simple grid layout for now)
    const positions = this.calculateNodePositions(graph.nodes);

    // Draw nodes
    graph.nodes.forEach((node, i) => {
      const pos = positions[i];
      const style = this.getNodeStyle(node.type);
      tikz += `\\node[${style}] (${node.id}) at (${pos.x},${pos.y}) {${node.name}};\n`;
    });

    // Draw edges
    graph.edges.forEach(edge => {
      const style = this.getEdgeStyle(edge.strength);
      tikz += `\\draw[${style}] (${edge.from}) -- node {${edge.strength.toFixed(2)}} (${edge.to});\n`;
    });

    tikz += '\\end{tikzpicture}\n';
    tikz += `\\caption{Causal Graph}\n`;
    tikz += '\\end{figure}\n\n';

    return tikz;
  }

  private calculateNodePositions(nodes: CausalNode[]): Array<{x: number, y: number}> {
    // Simple layered layout
    const layers: CausalNode[][] = [];

    // Group by type
    const causes = nodes.filter(n => n.type === 'cause');
    const mediators = nodes.filter(n => n.type === 'mediator');
    const effects = nodes.filter(n => n.type === 'effect');

    // Calculate positions
    const positions: Array<{x: number, y: number}> = [];
    // ... layout algorithm
    return positions;
  }

  private getNodeStyle(type: string): string {
    const styles = {
      cause: 'circle,draw,fill=blue!20',
      effect: 'circle,draw,fill=red!20',
      mediator: 'circle,draw,fill=green!20',
      confounder: 'circle,draw,fill=yellow!20,dashed'
    };
    return styles[type] || 'circle,draw';
  }

  private getEdgeStyle(strength: number): string {
    if (strength > 0.7) return '->,thick';
    if (strength > 0.4) return '->';
    return '->,dashed';
  }
}
```

**Acceptance Criteria**:
- [ ] TikZ diagrams generated for causal graphs
- [ ] Node positioning algorithm working
- [ ] Edge styles based on strength
- [ ] Proper figure captions

---

#### Task 1.4: Add Bayesian & Analogical LaTeX Export
**File**: `src/export/latex.ts`
**Estimated Time**: 3 hours

**Code Snippet**:
```typescript
export class LaTeXExporter {
  private exportBayesian(thoughts: BayesianThought[]): string {
    let output = '\\section{Bayesian Reasoning}\n\n';

    for (const thought of thoughts) {
      output += `\\subsection{Thought ${thought.thoughtNumber}}\n`;

      output += '\\textbf{Hypothesis}: ' + thought.hypothesis.statement + '\n\n';

      output += '\\textbf{Prior Probability}:\n';
      output += `\\[P(H) = ${thought.prior.probability}\\]\n`;
      output += `Justification: ${thought.prior.justification}\n\n`;

      output += '\\textbf{Evidence}:\n\\begin{itemize}\n';
      thought.evidence.forEach(ev => {
        output += `\\item ${ev.description}\n`;
        output += `  \\begin{align*}\n`;
        output += `    P(E|H) &= ${ev.likelihoodGivenHypothesis}\\\\\n`;
        output += `    P(E|\\neg H) &= ${ev.likelihoodGivenNotHypothesis}\n`;
        output += `  \\end{align*}\n`;
      });
      output += '\\end{itemize}\n\n';

      output += '\\textbf{Posterior Probability}:\n';
      output += `\\[P(H|E) = ${thought.posterior.probability}\\]\n\n`;
      output += `Calculation: ${thought.posterior.calculation}\n\n`;

      if (thought.bayesFactor) {
        output += `\\textbf{Bayes Factor}: ${thought.bayesFactor}\n\n`;
      }
    }

    return output;
  }

  private exportAnalogical(thoughts: AnalogicalThought[]): string {
    let output = '\\section{Analogical Reasoning}\n\n';

    for (const thought of thoughts) {
      output += `\\subsection{Thought ${thought.thoughtNumber}}\n`;

      output += '\\textbf{Source Domain}: ' + thought.sourceDomain.name + '\n\n';
      output += thought.sourceDomain.description + '\n\n';

      output += '\\textbf{Target Domain}: ' + thought.targetDomain.name + '\n\n';
      output += thought.targetDomain.description + '\n\n';

      output += '\\textbf{Mappings}:\n\\begin{itemize}\n';
      thought.mapping.forEach(m => {
        output += `\\item ${m.sourceEntityId} $\\mapsto$ ${m.targetEntityId}\n`;
        output += `  \\textit{Confidence}: ${m.confidence}\n`;
        output += `  \\textit{Justification}: ${m.justification}\n`;
      });
      output += '\\end{itemize}\n\n';

      output += `\\textbf{Analogy Strength}: ${thought.analogyStrength}\n\n`;

      if (thought.limitations.length > 0) {
        output += '\\textbf{Limitations}:\n\\begin{itemize}\n';
        thought.limitations.forEach(lim => {
          output += `\\item ${lim}\n`;
        });
        output += '\\end{itemize}\n\n';
      }
    }

    return output;
  }
}
```

**Acceptance Criteria**:
- [ ] Bayesian equations formatted correctly
- [ ] Analogical mappings displayed clearly
- [ ] All probability values formatted
- [ ] Limitations section included

---

#### Task 1.4a: Add Phase 3 Modes LaTeX Export (Temporal, Game Theory, Evidential)
**File**: `src/export/latex.ts`
**Estimated Time**: 8 hours
**NEW - Phase 4 addition**

**Code Snippet**:
```typescript
export class LaTeXExporter {
  // NEW: Temporal reasoning export
  private exportTemporal(thoughts: TemporalThought[]): string {
    let output = '\\section{Temporal Reasoning}\n\n';

    for (const thought of thoughts) {
      output += `\\subsection{Thought ${thought.thoughtNumber}}\n`;
      output += `${thought.content}\n\n`;

      // Timeline visualization (leverages Phase 3 Mermaid)
      if (thought.timeline) {
        output += `\\textbf{Timeline}: ${thought.timeline.name}\n`;
        output += `Time Unit: ${thought.timeline.timeUnit}\n\n`;
      }

      // Events timeline (TikZ)
      if (thought.events) {
        output += this.formatTemporalTimeline(thought.events);
      }

      // Temporal relations
      if (thought.relations) {
        output += this.formatTemporalRelations(thought.relations);
      }
    }

    return output;
  }

  private formatTemporalTimeline(events: TemporalEvent[]): string {
    let tikz = '\\begin{figure}[h]\n\\centering\n';
    tikz += '\\begin{tikzpicture}[>=stealth]\n';
    tikz += '\\draw[->] (0,0) -- (10,0) node[right] {Time};\n';

    // Plot events on timeline
    events.forEach(event => {
      const x = (event.timestamp / 100) * 10; // Scale to 10cm
      tikz += `\\draw (${x},0.1) -- (${x},-0.1) node[below,rotate=45,anchor=west] {${event.name}};\n`;
    });

    tikz += '\\end{tikzpicture}\n';
    tikz += '\\caption{Temporal Timeline}\n';
    tikz += '\\end{figure}\n\n';
    return tikz;
  }

  private formatTemporalRelations(relations: TemporalRelation[]): string {
    let output = '\\textbf{Temporal Relations}:\n\\begin{itemize}\n';
    relations.forEach(rel => {
      output += `\\item ${rel.from} \\textit{${rel.relationType}} ${rel.to}`;
      if (rel.delay) output += ` (delay: ${rel.delay})`;
      output += ` [strength: ${rel.strength}]\n`;
    });
    output += '\\end{itemize}\n\n';
    return output;
  }

  // NEW: Game-theoretic mode export
  private exportGameTheory(thoughts: GameTheoryThought[]): string {
    let output = '\\section{Game-Theoretic Analysis}\n\n';

    for (const thought of thoughts) {
      output += `\\subsection{Thought ${thought.thoughtNumber}}\n`;
      output += `${thought.content}\n\n`;

      if (thought.game) {
        output += `\\textbf{Game}: ${thought.game.name} (${thought.game.type})\n`;
        output += `Players: ${thought.game.players.length}\n\n`;
      }

      // Payoff matrix
      if (thought.payoffs) {
        output += this.formatPayoffMatrix(thought.payoffs, thought.players);
      }

      // Nash equilibria
      if (thought.equilibria && thought.equilibria.length > 0) {
        output += this.formatEquilibria(thought.equilibria);
      }
    }

    return output;
  }

  private formatPayoffMatrix(payoffs: PayoffMatrix, players?: Player[]): string {
    let output = '\\textbf{Payoff Matrix}:\n\n';
    output += '\\begin{table}[h]\n\\centering\n';
    output += '\\begin{tabular}{|c|';

    // Determine table columns
    const numCols = Math.sqrt(payoffs.entries.length);
    output += 'c|'.repeat(numCols) + '}\n\\hline\n';

    // Table content
    payoffs.entries.forEach((entry, i) => {
      if (i % numCols === 0 && i > 0) output += '\\\\ \\hline\n';
      output += `${entry.payoffs.join(', ')} `;
      if ((i + 1) % numCols !== 0) output += '& ';
    });

    output += '\\\\ \\hline\n\\end{tabular}\n';
    output += '\\caption{Payoff Matrix}\n\\end{table}\n\n';
    return output;
  }

  private formatEquilibria(equilibria: Equilibrium[]): string {
    let output = '\\textbf{Nash Equilibria}:\n\\begin{enumerate}\n';
    equilibria.forEach(eq => {
      output += `\\item \\textbf{${eq.type}}: ${eq.strategyProfile.join(', ')}\n`;
      output += `  Payoffs: (${eq.payoffs.join(', ')}), Stability: ${eq.stability}\n`;
      output += `  ${eq.reasoning}\n`;
    });
    output += '\\end{enumerate}\n\n';
    return output;
  }

  // NEW: Evidential reasoning export
  private exportEvidential(thoughts: EvidentialThought[]): string {
    let output = '\\section{Evidential Reasoning (Dempster-Shafer)}\n\n';

    for (const thought of thoughts) {
      output += `\\subsection{Thought ${thought.thoughtNumber}}\n`;
      output += `${thought.content}\n\n`;

      // Hypotheses
      if (thought.hypotheses) {
        output += '\\textbf{Hypotheses}:\n\\begin{itemize}\n';
        thought.hypotheses.forEach(h => {
          output += `\\item ${h.name}: ${h.description}\n`;
        });
        output += '\\end{itemize}\n\n';
      }

      // Belief functions
      if (thought.beliefFunctions) {
        output += this.formatBeliefFunctions(thought.beliefFunctions);
      }

      // Plausibility
      if (thought.plausibility) {
        output += this.formatPlausibility(thought.plausibility);
      }

      // Combined belief
      if (thought.combinedBelief) {
        output += '\\textbf{Combined Belief}:\n';
        output += this.formatBeliefFunction(thought.combinedBelief);
        if (thought.combinedBelief.conflictMass !== undefined) {
          output += `Conflict Mass: ${thought.combinedBelief.conflictMass.toFixed(3)}\n\n`;
        }
      }
    }

    return output;
  }

  private formatBeliefFunctions(bfs: BeliefFunction[]): string {
    let output = '\\textbf{Belief Functions}:\n\n';
    bfs.forEach((bf, i) => {
      output += `\\textit{Source ${i + 1}}: ${bf.source}\n`;
      output += this.formatBeliefFunction(bf);
    });
    return output;
  }

  private formatBeliefFunction(bf: BeliefFunction): string {
    let output = '\\begin{tabular}{|l|c|}\n\\hline\n';
    output += 'Hypothesis Set & Mass \\\\ \\hline\n';
    bf.massAssignments.forEach(ma => {
      const hypSet = ma.hypothesisSet.length > 0 ?
        `\\{${ma.hypothesisSet.join(', ')}\\}` : '$\\emptyset$';
      output += `${hypSet} & ${ma.mass.toFixed(3)} \\\\ \\hline\n`;
    });
    output += '\\end{tabular}\n\n';
    return output;
  }

  private formatPlausibility(pl: PlausibilityFunction): string {
    let output = '\\textbf{Plausibility Intervals}:\n\n';
    output += '\\begin{tabular}{|l|c|c|}\n\\hline\n';
    output += 'Hypothesis & Belief & Plausibility \\\\ \\hline\n';
    pl.assignments.forEach(pa => {
      const hypSet = `\\{${pa.hypothesisSet.join(', ')}\\}`;
      output += `${hypSet} & ${pa.belief.toFixed(3)} & ${pa.plausibility.toFixed(3)} \\\\ \\hline\n`;
    });
    output += '\\end{tabular}\n\n';
    return output;
  }
}
```

**Acceptance Criteria**:
- [ ] Temporal timeline TikZ diagrams generated
- [ ] Temporal relations formatted with delays and strengths
- [ ] Game theory payoff matrices displayed as LaTeX tables
- [ ] Nash equilibria formatted with stability scores
- [ ] Dempster-Shafer belief functions shown in tables
- [ ] Plausibility intervals displayed
- [ ] All Phase 3 modes properly integrated

---

#### Task 1.4b: Integrate Phase 3 Visual Exporter with LaTeX
**File**: `src/export/latex.ts`
**Estimated Time**: 3 hours
**NEW - Phase 4 addition**

**Code Snippet**:
```typescript
import { VisualExporter, VisualExportOptions } from '../export/visual.js'; // Phase 3

export class LaTeXExporter {
  private visualExporter: VisualExporter;

  constructor() {
    this.visualExporter = new VisualExporter(); // Phase 3 component
  }

  async export(session: ThinkingSession, options: LaTeXExportOptions): Promise<string> {
    let latex = this.preamble(options);

    if (options.includeMetadata) {
      latex += this.formatMetadata(session);
    }

    // Export thoughts
    for (const thought of session.thoughts) {
      latex += this.formatThought(thought);

      // NEW: Embed Mermaid diagrams from Phase 3
      if (this.shouldIncludeDiagram(thought)) {
        const mermaid = await this.visualExporter.exportCausalGraph(
          thought,
          { format: 'mermaid', includeLabels: true, includeMetrics: true }
        );
        latex += this.embedMermaidDiagram(mermaid);
      }
    }

    latex += '\\end{document}';
    return latex;
  }

  private shouldIncludeDiagram(thought: Thought): boolean {
    // Include diagrams for causal, temporal, game theory modes
    return thought.mode === 'causal' ||
           thought.mode === 'temporal' ||
           thought.mode === 'gametheory';
  }

  private embedMermaidDiagram(mermaid: string): string {
    // Convert Mermaid to TikZ or include as verbatim for external rendering
    return `\\begin{verbatim}\n${mermaid}\n\\end{verbatim}\n\n`;
  }
}
```

**Acceptance Criteria**:
- [ ] Phase 3 VisualExporter integrated
- [ ] Mermaid diagrams embedded in LaTeX
- [ ] Causal graphs from Phase 3 included
- [ ] Temporal Gantt charts from Phase 3 included
- [ ] Game trees from Phase 3 included

---

#### Task 1.5: Add LaTeX Export Tests
**File**: `tests/unit/export/latex.test.ts`
**Estimated Time**: 3 hours

**Code Snippet**:
```typescript
import { describe, it, expect } from 'vitest';
import { LaTeXExporter } from '../../../src/export/latex.js';
import { ThinkingMode } from '../../../src/types/core.js';

describe('LaTeX Export', () => {
  const exporter = new LaTeXExporter();

  describe('Basic export', () => {
    it('should generate valid LaTeX document structure', async () => {
      const session = createTestSession();
      const latex = await exporter.export(session, defaultOptions);

      expect(latex).toContain('\\documentclass');
      expect(latex).toContain('\\begin{document}');
      expect(latex).toContain('\\end{document}');
    });

    it('should include table of contents when requested', async () => {
      const session = createTestSession();
      const latex = await exporter.export(session, {
        ...defaultOptions,
        includeTOC: true
      });

      expect(latex).toContain('\\tableofcontents');
    });
  });

  describe('Mathematics mode export', () => {
    it('should export equations correctly', async () => {
      const thought: MathematicsThought = {
        // ... create test thought
        mathematicalModel: {
          latex: 'a^2 + b^2 = c^2',
          symbolic: 'a**2 + b**2 == c**2'
        }
      };

      const latex = exporter['exportMathematics']([thought]);
      expect(latex).toContain('\\begin{equation}');
      expect(latex).toContain('a^2 + b^2 = c^2');
      expect(latex).toContain('\\end{equation}');
    });

    it('should format proof strategies', async () => {
      // ... test proof export
    });
  });

  describe('Causal mode export', () => {
    it('should generate TikZ diagrams', async () => {
      const thought: CausalThought = {
        // ... create test thought with causal graph
      };

      const latex = exporter['exportCausal']([thought]);
      expect(latex).toContain('\\begin{tikzpicture}');
      expect(latex).toContain('\\end{tikzpicture}');
    });
  });

  // ... more tests for other modes
});
```

**Acceptance Criteria**:
- [ ] 15+ tests for LaTeX export
- [ ] Tests for all reasoning modes
- [ ] Tests for configuration options
- [ ] Validation of generated LaTeX syntax

---

### Feature 2: Jupyter Notebook Export

#### Task 2.1: Create Jupyter Notebook Infrastructure
**File**: `src/export/jupyter.ts`
**Estimated Time**: 4 hours

**Code Snippet**:
```typescript
export interface JupyterNotebook {
  cells: NotebookCell[];
  metadata: {
    kernelspec: {
      display_name: string;
      language: string;
      name: string;
    };
    language_info: {
      name: string;
      version: string;
    };
  };
  nbformat: number;
  nbformat_minor: number;
}

export interface NotebookCell {
  cell_type: 'code' | 'markdown' | 'raw';
  execution_count: number | null;
  metadata: Record<string, any>;
  source: string[];
  outputs?: any[];
}

export class JupyterExporter {
  async export(
    session: ThinkingSession,
    options: JupyterExportOptions
  ): Promise<JupyterNotebook> {
    const notebook: JupyterNotebook = {
      cells: [],
      metadata: this.createMetadata(options.kernelName),
      nbformat: 4,
      nbformat_minor: 5
    };

    // Add title cell
    notebook.cells.push(this.createMarkdownCell([
      `# ${session.title}`,
      '',
      `**Mode**: ${session.mode}`,
      `**Created**: ${session.createdAt.toISOString()}`,
      `**Thoughts**: ${session.thoughts.length}`
    ]));

    // Convert thoughts to cells
    for (const thought of session.thoughts) {
      notebook.cells.push(...this.thoughtToCells(thought, options));
    }

    return notebook;
  }

  private createMetadata(kernel: string) {
    const kernels = {
      python3: {
        display_name: 'Python 3',
        language: 'python',
        name: 'python3'
      },
      julia: {
        display_name: 'Julia',
        language: 'julia',
        name: 'julia-1.9'
      }
    };

    return {
      kernelspec: kernels[kernel] || kernels.python3,
      language_info: {
        name: kernel === 'julia' ? 'julia' : 'python',
        version: kernel === 'julia' ? '1.9' : '3.11'
      }
    };
  }

  private createMarkdownCell(lines: string[]): NotebookCell {
    return {
      cell_type: 'markdown',
      execution_count: null,
      metadata: {},
      source: lines
    };
  }

  private createCodeCell(code: string[]): NotebookCell {
    return {
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      source: code,
      outputs: []
    };
  }

  private thoughtToCells(thought: Thought, options: JupyterExportOptions): NotebookCell[] {
    const cells: NotebookCell[] = [];

    // Add thought content as markdown
    cells.push(this.createMarkdownCell([
      `## Thought ${thought.thoughtNumber}`,
      '',
      thought.content
    ]));

    // Add mode-specific cells
    if (isMathematicsThought(thought)) {
      cells.push(...this.mathToCells(thought, options));
    } else if (isCausalThought(thought)) {
      cells.push(...this.causalToCells(thought, options));
    } else if (isBayesianThought(thought)) {
      cells.push(...this.bayesianToCells(thought, options));
    }

    return cells;
  }
}
```

**Acceptance Criteria**:
- [ ] Valid Jupyter notebook structure
- [ ] Metadata configuration working
- [ ] Cell creation functions
- [ ] Basic markdown cells

---

#### Task 2.2: Add Mathematics Mode Jupyter Export (SymPy)
**File**: `src/export/jupyter.ts`
**Estimated Time**: 4 hours

**Code Snippet**:
```typescript
export class JupyterExporter {
  private mathToCells(
    thought: MathematicsThought,
    options: JupyterExportOptions
  ): NotebookCell[] {
    const cells: NotebookCell[] = [];

    if (!options.includeCode) {
      return cells;
    }

    // Setup SymPy
    cells.push(this.createCodeCell([
      'import sympy as sp',
      'from sympy import *',
      'sp.init_printing(use_unicode=True)'
    ]));

    // Define symbols
    if (thought.mathematicalModel) {
      const symbols = this.extractSymbols(thought.mathematicalModel.symbolic);
      cells.push(this.createCodeCell([
        `# Define symbols`,
        `${symbols.join(', ')} = sp.symbols('${symbols.join(' ')}')`
      ]));

      // Define equation
      cells.push(this.createCodeCell([
        `# Equation`,
        `expr = ${this.toSymPy(thought.mathematicalModel.symbolic)}`,
        `expr`
      ]));

      // Simplify
      cells.push(this.createCodeCell([
        `# Simplify`,
        `simplified = sp.simplify(expr)`,
        `simplified`
      ]));

      // Solve if applicable
      if (thought.proofStrategy?.type === 'construction') {
        cells.push(this.createCodeCell([
          `# Solve`,
          `solutions = sp.solve(expr, ${symbols[0]})`,
          `solutions`
        ]));
      }
    }

    // Add proof steps as markdown comments
    if (thought.proofStrategy) {
      const proofComments = thought.proofStrategy.steps.map(
        (step, i) => `# Step ${i + 1}: ${step}`
      );
      cells.push(this.createCodeCell(proofComments));
    }

    return cells;
  }

  private extractSymbols(symbolic: string): string[] {
    // Extract variable names from symbolic expression
    const matches = symbolic.match(/[a-zA-Z_][a-zA-Z0-9_]*/g);
    return [...new Set(matches || [])];
  }

  private toSymPy(symbolic: string): string {
    // Convert symbolic expression to SymPy syntax
    return symbolic
      .replace(/\*\*/g, '**')  // Power is same
      .replace(/==/g, '-')     // Equation a == b -> a - b
      .replace(/&&/g, '&')
      .replace(/\|\|/g, '|');
  }
}
```

**Acceptance Criteria**:
- [ ] SymPy code generated for mathematical models
- [ ] Symbol extraction working
- [ ] Equation solving code included
- [ ] Proof steps as comments

---

#### Task 2.3: Add Causal Graph Jupyter Export (NetworkX)
**File**: `src/export/jupyter.ts`
**Estimated Time**: 4 hours

**Code Snippet**:
```typescript
export class JupyterExporter {
  private causalToCells(
    thought: CausalThought,
    options: JupyterExportOptions
  ): NotebookCell[] {
    const cells: NotebookCell[] = [];

    if (!options.includeCode || !thought.causalGraph) {
      return cells;
    }

    // Import libraries
    cells.push(this.createCodeCell([
      'import networkx as nx',
      'import matplotlib.pyplot as plt',
      'from matplotlib.patches import FancyArrowPatch',
      'import numpy as np'
    ]));

    // Create graph
    const graphCode = [
      '# Create directed graph',
      'G = nx.DiGraph()',
      '',
      '# Add nodes'
    ];

    thought.causalGraph.nodes.forEach(node => {
      graphCode.push(
        `G.add_node('${node.id}', name='${node.name}', type='${node.type}')`
      );
    });

    graphCode.push('', '# Add edges');
    thought.causalGraph.edges.forEach(edge => {
      graphCode.push(
        `G.add_edge('${edge.from}', '${edge.to}', strength=${edge.strength}, confidence=${edge.confidence})`
      );
    });

    cells.push(this.createCodeCell(graphCode));

    // Visualization code
    if (options.includeVisualization) {
      cells.push(this.createCodeCell([
        '# Visualize causal graph',
        'plt.figure(figsize=(12, 8))',
        '',
        '# Layout',
        'pos = nx.spring_layout(G, k=2, iterations=50)',
        '',
        '# Draw nodes by type',
        'node_types = nx.get_node_attributes(G, "type")',
        'type_colors = {"cause": "lightblue", "effect": "lightcoral", "mediator": "lightgreen"}',
        '',
        'for node_type, color in type_colors.items():',
        '    nodes = [n for n, t in node_types.items() if t == node_type]',
        '    nx.draw_networkx_nodes(G, pos, nodelist=nodes, node_color=color,',
        '                           node_size=3000, label=node_type)',
        '',
        '# Draw edges with weights',
        'edges = G.edges()',
        'weights = [G[u][v]["strength"] for u, v in edges]',
        'nx.draw_networkx_edges(G, pos, width=2, alpha=0.6,',
        '                       edge_color=weights, edge_cmap=plt.cm.RdYlGn)',
        '',
        '# Labels',
        'labels = nx.get_node_attributes(G, "name")',
        'nx.draw_networkx_labels(G, pos, labels, font_size=10)',
        '',
        '# Edge labels',
        'edge_labels = {(u,v): f"{G[u][v][\'strength\']:.2f}" for u,v in edges}',
        'nx.draw_networkx_edge_labels(G, pos, edge_labels)',
        '',
        'plt.legend()',
        'plt.title("Causal Graph")',
        'plt.axis("off")',
        'plt.tight_layout()',
        'plt.show()'
      ]));

      // Add analysis cells
      cells.push(this.createCodeCell([
        '# Graph statistics',
        'print(f"Nodes: {G.number_of_nodes()}")',
        'print(f"Edges: {G.number_of_edges()}")',
        'print(f"Average degree: {sum(dict(G.degree()).values()) / G.number_of_nodes():.2f}")',
        '',
        '# Identify central nodes',
        'centrality = nx.betweenness_centrality(G)',
        'sorted_centrality = sorted(centrality.items(), key=lambda x: x[1], reverse=True)',
        'print("\\nMost central nodes:")',
        'for node, cent in sorted_centrality[:3]:',
        '    print(f"  {labels[node]}: {cent:.3f}")'
      ]));
    }

    return cells;
  }
}
```

**Acceptance Criteria**:
- [ ] NetworkX graph creation code
- [ ] Matplotlib visualization code
- [ ] Graph statistics calculation
- [ ] Centrality analysis included

---

#### Task 2.4: Add Bayesian Jupyter Export (PyMC)
**File**: `src/export/jupyter.ts`
**Estimated Time**: 3 hours

**Code Snippet**:
```typescript
export class JupyterExporter {
  private bayesianToCells(
    thought: BayesianThought,
    options: JupyterExportOptions
  ): NotebookCell[] {
    const cells: NotebookCell[] = [];

    if (!options.includeCode) {
      return cells;
    }

    // Import libraries
    cells.push(this.createCodeCell([
      'import numpy as np',
      'import matplotlib.pyplot as plt',
      'from scipy import stats'
    ]));

    // Prior
    cells.push(this.createCodeCell([
      '# Prior probability',
      `prior = ${thought.prior.probability}`,
      `print(f"Prior P(H) = {prior}")`
    ]));

    // Likelihood
    cells.push(this.createCodeCell([
      '# Likelihood',
      `likelihood_h = ${thought.likelihood.probability}`,
      `print(f"P(E|H) = {likelihood_h}")`
    ]));

    // Evidence
    if (thought.evidence.length > 0) {
      const evidenceCode = ['# Evidence'];
      thought.evidence.forEach((ev, i) => {
        evidenceCode.push(`ev${i}_given_h = ${ev.likelihoodGivenHypothesis}`);
        evidenceCode.push(`ev${i}_given_not_h = ${ev.likelihoodGivenNotHypothesis}`);
      });
      cells.push(this.createCodeCell(evidenceCode));
    }

    // Bayes' rule calculation
    cells.push(this.createCodeCell([
      '# Calculate posterior using Bayes\' rule',
      'likelihood_not_h = 1 - likelihood_h  # Simplified',
      'prior_not_h = 1 - prior',
      '',
      '# P(E) = P(E|H)P(H) + P(E|¬H)P(¬H)',
      'p_e = likelihood_h * prior + likelihood_not_h * prior_not_h',
      '',
      '# P(H|E) = P(E|H)P(H) / P(E)',
      'posterior = (likelihood_h * prior) / p_e',
      `print(f"Posterior P(H|E) = {posterior:.4f}")`
    ]));

    // Visualization
    if (options.includeVisualization) {
      cells.push(this.createCodeCell([
        '# Visualize prior and posterior',
        'fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))',
        '',
        '# Prior distribution',
        'x = np.linspace(0, 1, 100)',
        'prior_dist = stats.beta(2, 2)',
        'ax1.plot(x, prior_dist.pdf(x))',
        'ax1.axvline(prior, color=\'r\', linestyle=\'--\', label=f\'Prior={prior:.2f}\')',
        'ax1.set_title(\'Prior Distribution\')',
        'ax1.set_xlabel(\'P(H)\')',
        'ax1.legend()',
        '',
        '# Posterior distribution',
        'posterior_dist = stats.beta(3, 2)',
        'ax2.plot(x, posterior_dist.pdf(x))',
        'ax2.axvline(posterior, color=\'g\', linestyle=\'--\', label=f\'Posterior={posterior:.2f}\')',
        'ax2.set_title(\'Posterior Distribution\')',
        'ax2.set_xlabel(\'P(H|E)\')',
        'ax2.legend()',
        '',
        'plt.tight_layout()',
        'plt.show()'
      ]));
    }

    // Bayes factor
    if (thought.bayesFactor) {
      cells.push(this.createCodeCell([
        '# Bayes Factor',
        `bayes_factor = ${thought.bayesFactor}`,
        'print(f"\\nBayes Factor = {bayes_factor:.2f}")',
        'if bayes_factor > 1:',
        '    print("Evidence supports the hypothesis")',
        'elif bayes_factor < 1:',
        '    print("Evidence contradicts the hypothesis")',
        'else:',
        '    print("Evidence is neutral")'
      ]));
    }

    return cells;
  }
}
```

**Acceptance Criteria**:
- [ ] Bayesian calculation code generated
- [ ] Prior/posterior visualization
- [ ] Bayes factor interpretation
- [ ] SciPy stats integration

---

(Continue with remaining tasks...)

### Feature 3: Mermaid Visualization

#### Task 3.1: Create Mermaid Generator Infrastructure
**File**: `src/visualization/mermaid.ts`
**Estimated Time**: 3 hours

[Code snippet and details...]

---

## Phase 3B: Persistence & Integration (v3.1.0)

### Feature 4: Persistence Layer

#### Task 4.1: Design Database Schema
**File**: `src/persistence/schema.ts`
**Estimated Time**: 2 hours

[Details...]

---

## Testing Strategy

### Test Coverage Goals
- **v3.0.0**: 90+ tests (export + visualization)
- **v3.1.0**: 110+ tests (persistence + integration)
- **v3.2.0**: 130+ tests (collaboration)
- **v4.0.0**: 150+ tests (ML/patterns)

### Test Categories
1. **Unit Tests**: Individual functions and classes
2. **Integration Tests**: Feature integration
3. **End-to-End Tests**: Full export/import cycles
4. **Performance Tests**: Large session handling

---

## Documentation Requirements

Each feature must include:
1. **API Documentation**: JSDoc comments for all public APIs
2. **Usage Examples**: Working code examples
3. **Tutorial**: Step-by-step guide
4. **Migration Guide**: For breaking changes
5. **Performance Notes**: Resource requirements

---

## Estimated Total Effort

### Phase 3A (v3.0.0)
- LaTeX Export: 18 hours
- Jupyter Export: 15 hours
- Mermaid Viz: 14 hours
- Testing: 10 hours
- Docs: 8 hours
**Total: 65 hours (~8 days)**

### Phase 3B (v3.1.0)
- Math-MCP: 20 hours
- Persistence: 40 hours
- Testing: 12 hours
- Docs: 8 hours
**Total: 80 hours (~10 days)**

### Phase 3C (v3.2.0)
- Collaboration: 48 hours
- Testing: 14 hours
- Docs: 8 hours
**Total: 70 hours (~9 days)**

### Phase 3D (v4.0.0)
- Pattern Learning: 80 hours
- Testing: 16 hours
- Docs: 10 hours
**Total: 106 hours (~13 days)**

**Grand Total (Original): ~320 hours (~40 days / 8 weeks)**

---

## Phase 4D: Taxonomy Integration (v3.5.0) - **NEW**

### Feature 7: Reasoning Taxonomy Integration

#### Task 7.1: Initialize Taxonomy Database
**File**: `src/taxonomy/data/taxonomy.json`
**Estimated Time**: 8 hours

**Description**: Create comprehensive database of 110 reasoning types across 18 categories from "Types of Thinking and Reasonings - Expanded 3.0.md"

**Code Snippet**:
```json
{
  "reasoningTypes": [
    {
      "id": "deductive",
      "name": "Deductive Reasoning",
      "category": "fundamental",
      "definition": "Logical process where conclusions necessarily follow from premises",
      "relation": "Foundation of formal logic, mathematics, and rigorous proof",
      "examples": [
        "All mammals are warm-blooded. Whales are mammals. Therefore, whales are warm-blooded."
      ],
      "notes": "Truth-preserving but not ampliative. Certainty depends on premise truth and logical validity.",
      "keywords": ["logic", "proof", "validity", "syllogism", "modus ponens"]
    },
    // ... 109 more types
  ],
  "categories": [
    {
      "id": "fundamental",
      "name": "Fundamental Forms",
      "description": "Core reasoning forms that underlie all others",
      "types": ["deductive", "inductive", "abductive"]
    },
    // ... 17 more categories
  ]
}
```

**Acceptance Criteria**:
- [ ] All 110 reasoning types entered with complete metadata
- [ ] All 18 categories defined
- [ ] Keywords for each type for classification
- [ ] JSON schema validation passes
- [ ] Type relationships documented

---

#### Task 7.2: Build Taxonomy Classifier
**File**: `src/taxonomy/classifier.ts`
**Estimated Time**: 16 hours

**Code Snippet**:
```typescript
export class TaxonomyClassifier {
  private reasoningTypes: Map<string, ReasoningType>;
  private keywordIndex: Map<string, string[]>; // keyword -> type IDs

  constructor() {
    this.initializeTaxonomy();
    this.buildKeywordIndex();
  }

  private async initializeTaxonomy(): Promise<void> {
    const taxonomyData = await import('./data/taxonomy.json');
    this.reasoningTypes = new Map(
      taxonomyData.reasoningTypes.map(rt => [rt.id, rt])
    );
  }

  private buildKeywordIndex(): void {
    for (const [id, type] of this.reasoningTypes) {
      for (const keyword of type.keywords) {
        if (!this.keywordIndex.has(keyword)) {
          this.keywordIndex.set(keyword, []);
        }
        this.keywordIndex.get(keyword)!.push(id);
      }
    }
  }

  async classify(thought: Thought): Promise<TaxonomyClassification> {
    // 1. Keyword matching
    const keywordScores = this.scoreByKeywords(thought.content);

    // 2. Mode-based classification
    const modeTypes = this.getTypesForMode(thought.mode);

    // 3. Structure analysis
    const structureScores = this.analyzeStructure(thought);

    // 4. Combine scores
    const combinedScores = this.combineScores(
      keywordScores,
      modeTypes,
      structureScores
    );

    // 5. Select primary and secondary types
    const sortedTypes = Array.from(combinedScores.entries())
      .sort((a, b) => b[1] - a[1]);

    const primaryType = this.reasoningTypes.get(sortedTypes[0][0])!;
    const secondaryTypes = sortedTypes
      .slice(1, 4)
      .map(([id]) => this.reasoningTypes.get(id)!);

    return {
      primaryType,
      secondaryTypes,
      confidence: sortedTypes[0][1],
      reasoning: this.explainClassification(thought, primaryType),
      applicableCategories: this.getCategories([primaryType, ...secondaryTypes]),
    };
  }

  private scoreByKeywords(content: string): Map<string, number> {
    const scores = new Map<string, number>();
    const words = content.toLowerCase().split(/\W+/);

    for (const word of words) {
      if (this.keywordIndex.has(word)) {
        for (const typeId of this.keywordIndex.get(word)!) {
          scores.set(typeId, (scores.get(typeId) || 0) + 1);
        }
      }
    }

    // Normalize
    const maxScore = Math.max(...scores.values(), 1);
    for (const [typeId, score] of scores) {
      scores.set(typeId, score / maxScore);
    }

    return scores;
  }

  private getTypesForMode(mode: ThinkingMode): Map<string, number> {
    const modeTypeMap: Record<ThinkingMode, string[]> = {
      [ThinkingMode.MATHEMATICS]: ['deductive', 'symbolic', 'mathematical', 'proof'],
      [ThinkingMode.BAYESIAN]: ['bayesian', 'probabilistic', 'inductive'],
      [ThinkingMode.CAUSAL]: ['causal', 'mechanistic', 'abductive'],
      [ThinkingMode.TEMPORAL]: ['temporal', 'sequential'],
      [ThinkingMode.GAMETHEORY]: ['game-theoretic', 'strategic'],
      // ... more mappings
    };

    const types = modeTypeMap[mode] || [];
    return new Map(types.map(t => [t, 0.8])); // High confidence for mode-based
  }

  private analyzeStructure(thought: Thought): Map<string, number> {
    const scores = new Map<string, number>();

    // Check for mathematical structures
    if (/\$.*\$|\\[a-z]+/.test(thought.content)) {
      scores.set('mathematical', 0.7);
      scores.set('symbolic', 0.6);
    }

    // Check for causal language
    if (/(because|causes?|leads? to|results? in)/i.test(thought.content)) {
      scores.set('causal', 0.7);
    }

    // Check for probabilistic language
    if (/(probability|likely|chance|odds)/i.test(thought.content)) {
      scores.set('probabilistic', 0.7);
      scores.set('bayesian', 0.5);
    }

    // Check for modal operators
    if (/(necessary|possible|must|might|could)/i.test(thought.content)) {
      scores.set('modal', 0.6);
    }

    return scores;
  }

  detectFundamentalForms(thought: Thought): {
    deductive: number;
    inductive: number;
    abductive: number;
  } {
    let deductive = 0, inductive = 0, abductive = 0;

    // Deductive indicators
    if (/(therefore|thus|hence|proves|must be)/i.test(thought.content)) {
      deductive += 0.3;
    }
    if (thought.mode === ThinkingMode.MATHEMATICS) {
      deductive += 0.4;
    }

    // Inductive indicators
    if (/(pattern|in general|usually|often|tends to)/i.test(thought.content)) {
      inductive += 0.3;
    }
    if (thought.mode === ThinkingMode.BAYESIAN) {
      inductive += 0.3;
    }

    // Abductive indicators
    if (/(best explanation|hypothesis|likely cause|explains)/i.test(thought.content)) {
      abductive += 0.3;
    }
    if (thought.mode === ThinkingMode.ABDUCTIVE) {
      abductive += 0.5;
    }

    // Normalize to 0-1
    const total = deductive + inductive + abductive;
    if (total > 0) {
      deductive /= total;
      inductive /= total;
      abductive /= total;
    }

    return { deductive, inductive, abductive };
  }
}
```

**Acceptance Criteria**:
- [ ] Taxonomy loaded from JSON
- [ ] Keyword-based classification working
- [ ] Mode-based type mapping working
- [ ] Structure analysis detecting patterns
- [ ] Fundamental forms detection accurate
- [ ] Confidence scores calibrated

---

#### Task 7.3: Implement Enhanced Metadata
**File**: `src/types/taxonomy.ts`
**Estimated Time**: 8 hours

**Code Snippet**:
```typescript
export class MetadataCalculator {
  /**
   * Calculate cognitive load metrics
   */
  calculateCognitiveLoad(thought: Thought): CognitiveLoad {
    // Working memory demand based on complexity
    const workingMemoryDemand = this.estimateWorkingMemory(thought);

    // Processing depth (shallow pattern recognition vs deep analysis)
    const processingDepth = this.estimateProcessingDepth(thought);

    // Conceptual complexity
    const conceptualComplexity = this.estimateComplexity(thought);

    const estimatedEffort =
      (workingMemoryDemand + processingDepth + conceptualComplexity) / 3 > 0.6
        ? 'high'
        : (workingMemoryDemand + processingDepth + conceptualComplexity) / 3 > 0.3
        ? 'medium'
        : 'low';

    return {
      workingMemoryDemand,
      processingDepth,
      conceptualComplexity,
      estimatedEffort,
    };
  }

  private estimateWorkingMemory(thought: Thought): number {
    let score = 0;

    // Count of distinct concepts (measured by unique nouns/technical terms)
    const concepts = this.extractConcepts(thought.content);
    score += Math.min(concepts.length / 7, 1) * 0.4; // 7 ± 2 working memory capacity

    // Nesting depth (for nested structures like proofs)
    const nestingDepth = this.measureNesting(thought);
    score += Math.min(nestingDepth / 4, 1) * 0.3;

    // Mode-specific complexity
    if (isMathematicsThought(thought)) {
      score += thought.mathematicalModel ? 0.2 : 0;
      score += thought.proofStrategy ? 0.1 : 0;
    }

    return Math.min(score, 1);
  }

  /**
   * Calculate dual-process indicators
   */
  calculateDualProcess(thought: Thought): DualProcess {
    // System 1: Fast, intuitive, automatic
    let system1Score = 0;

    // Indicators of System 1:
    // - Short response time
    // - Pattern recognition
    // - Heuristic use
    // - Analogical reasoning

    if (thought.mode === ThinkingMode.ANALOGICAL) {
      system1Score += 0.3;
    }

    // Quick pattern recognition
    if (this.hasQuickPatterns(thought.content)) {
      system1Score += 0.2;
    }

    // System 2: Slow, analytical, deliberate
    let system2Score = 0;

    // Indicators of System 2:
    // - Mathematical reasoning
    // - Logical deduction
    // - Multi-step analysis
    // - Counterfactual thinking

    if (thought.mode === ThinkingMode.MATHEMATICS ||
        thought.mode === ThinkingMode.BAYESIAN) {
      system2Score += 0.4;
    }

    if (this.hasMultiStepReasoning(thought)) {
      system2Score += 0.3;
    }

    // Normalize
    const total = system1Score + system2Score;
    if (total > 0) {
      system1Score /= total;
      system2Score /= total;
    }

    const predominantSystem =
      Math.abs(system1Score - system2Score) < 0.2
        ? 'hybrid'
        : system1Score > system2Score
        ? 'system1'
        : 'system2';

    const automaticity = system1Score; // Higher System 1 = more automatic

    return {
      system1Score,
      system2Score,
      predominantSystem,
      automaticity,
    };
  }

  /**
   * Calculate reasoning quality metrics
   */
  calculateQuality(
    thought: Thought,
    validation?: ValidationResult
  ): QualityMetrics {
    // Rigor: How formal and structured
    const rigor = this.assessRigor(thought);

    // Completeness: How thorough
    const completeness = validation?.strengthMetrics?.completeness ?? this.assessCompleteness(thought);

    // Soundness: Logical validity
    const soundness = validation?.confidence ?? this.assessSoundness(thought);

    // Creativity: Novelty and insight
    const creativity = this.assessCreativity(thought);

    // Practicality: Real-world applicability
    const practicality = this.assessPracticality(thought);

    return {
      rigor,
      completeness,
      soundness,
      creativity,
      practicality,
    };
  }

  private assessRigor(thought: Thought): number {
    let score = 0;

    // Formal modes are more rigorous
    if (thought.mode === ThinkingMode.MATHEMATICS) score += 0.4;
    if (thought.mode === ThinkingMode.PHYSICS) score += 0.3;

    // Look for formal structures
    if (/theorem|lemma|proof|axiom/i.test(thought.content)) score += 0.2;
    if (/\$.*\$/.test(thought.content)) score += 0.1; // LaTeX math

    return Math.min(score, 1);
  }

  /**
   * Calculate transfer potential
   */
  calculateTransfer(
    thought: Thought,
    taxonomy: TaxonomyClassification
  ): TransferPotential {
    const applicableModes: ThinkingMode[] = [];

    // Determine which modes could benefit from this insight
    if (taxonomy.primaryType.category === 'fundamental') {
      // Fundamental forms apply broadly
      applicableModes.push(...Object.values(ThinkingMode));
    } else if (taxonomy.primaryType.category === 'mathematical_quantitative') {
      applicableModes.push(
        ThinkingMode.MATHEMATICS,
        ThinkingMode.PHYSICS,
        ThinkingMode.BAYESIAN
      );
    }

    // Generalizability: How broadly applicable
    const generalizability = this.assessGeneralizability(thought, taxonomy);

    // Domain specificity: How tied to specific domain
    const domainSpecificity = 1 - generalizability;

    const transferSuggestions = this.generateTransferSuggestions(
      thought,
      applicableModes
    );

    return {
      applicableModes,
      generalizability,
      domainSpecificity,
      transferSuggestions,
    };
  }
}
```

**Acceptance Criteria**:
- [ ] Cognitive load calculation accurate
- [ ] Dual-process classification reasonable
- [ ] Quality metrics comprehensive
- [ ] Transfer potential useful
- [ ] All metrics normalized 0-1

---

#### Task 7.4: Build Multi-Modal Analyzer
**File**: `src/taxonomy/multimodal.ts`
**Estimated Time**: 12 hours

**Acceptance Criteria**:
- [ ] Session-level analysis working
- [ ] Mode transitions detected
- [ ] Synergies identified
- [ ] Architecture visualization generated
- [ ] Mermaid diagrams accurate

---

#### Task 7.5: Implement Adaptive Mode Selector
**File**: `src/taxonomy/adaptive.ts`
**Estimated Time**: 10 hours

**Acceptance Criteria**:
- [ ] Mode recommendations based on progress
- [ ] Switch detection accurate
- [ ] Sequence optimization reasonable
- [ ] Integration with existing recommender

---

#### Task 7.6: Integrate Taxonomy with Exports
**File**: `src/export/latex.ts`, `src/export/jupyter.ts`
**Estimated Time**: 8 hours

**Acceptance Criteria**:
- [ ] LaTeX exports include taxonomy tags
- [ ] Jupyter notebooks show classifications
- [ ] Visualizations include taxonomy overlays

---

#### Task 7.7: Testing Taxonomy System
**File**: `tests/unit/taxonomy/*.test.ts`
**Estimated Time**: 10 hours

**Acceptance Criteria**:
- [ ] 25+ tests for taxonomy features
- [ ] Classification accuracy tested
- [ ] Metadata calculations validated
- [ ] Integration tests passing

---

## Phase 4E: Additional Reasoning Modes (v3.7.0) - **NEW**

### Feature 8: 6 New Reasoning Modes

#### Task 8.1: Implement Meta-Reasoning Mode
**Files**: `src/types/modes/metareasoning.ts`, `src/validation/metareasoning.ts`
**Estimated Time**: 12 hours

**Acceptance Criteria**:
- [ ] Type definitions complete
- [ ] Validation logic working
- [ ] Integration with existing modes
- [ ] 8+ tests passing
- [ ] Documentation complete

---

#### Task 8.2: Implement Modal Reasoning Mode
**Files**: `src/types/modes/modal.ts`, `src/validation/modal.ts`
**Estimated Time**: 12 hours

**Acceptance Criteria**:
- [ ] Modal operators supported
- [ ] Possible worlds semantics working
- [ ] Validation checks modal consistency
- [ ] 8+ tests passing

---

#### Task 8.3: Implement Constraint-Based Mode
**Files**: `src/types/modes/constraint.ts`, `src/validation/constraint.ts`
**Estimated Time**: 12 hours

**Acceptance Criteria**:
- [ ] CSP formulation supported
- [ ] Constraint types implemented
- [ ] Solution approaches defined
- [ ] 8+ tests passing

---

#### Task 8.4: Implement Optimization Mode
**Files**: `src/types/modes/optimization.ts`, `src/validation/optimization.ts`
**Estimated Time**: 12 hours

**Acceptance Criteria**:
- [ ] Objective functions supported
- [ ] Multiple optimization methods
- [ ] Constraint handling
- [ ] 8+ tests passing

---

#### Task 8.5: Implement Stochastic Mode
**Files**: `src/types/modes/stochastic.ts`, `src/validation/stochastic.ts`
**Estimated Time**: 12 hours

**Acceptance Criteria**:
- [ ] Stochastic processes modeled
- [ ] Simulation support
- [ ] Statistical analysis
- [ ] 8+ tests passing

---

#### Task 8.6: Implement Recursive Mode
**Files**: `src/types/modes/recursive.ts`, `src/validation/recursive.ts`
**Estimated Time**: 12 hours

**Acceptance Criteria**:
- [ ] Base/recursive cases supported
- [ ] Self-reference detection
- [ ] Cycle prevention
- [ ] 8+ tests passing

---

#### Task 8.7: Update Core Types for New Modes
**File**: `src/types/core.ts`
**Estimated Time**: 4 hours

**Code Snippet**:
```typescript
export enum ThinkingMode {
  // Existing modes
  SEQUENTIAL = 'sequential',
  SHANNON = 'shannon',
  MATHEMATICS = 'mathematics',
  PHYSICS = 'physics',
  HYBRID = 'hybrid',
  ABDUCTIVE = 'abductive',
  CAUSAL = 'causal',
  BAYESIAN = 'bayesian',
  COUNTERFACTUAL = 'counterfactual',
  ANALOGICAL = 'analogical',
  TEMPORAL = 'temporal',
  GAMETHEORY = 'gametheory',
  EVIDENTIAL = 'evidential',

  // NEW: Phase 4 modes
  METAREASONING = 'metareasoning',
  MODAL = 'modal',
  CONSTRAINT = 'constraint',
  OPTIMIZATION = 'optimization',
  STOCHASTIC = 'stochastic',
  RECURSIVE = 'recursive',

  CUSTOM = 'custom'
}
```

**Acceptance Criteria**:
- [ ] All 19 modes in enum
- [ ] Type guards for new modes
- [ ] Union types updated
- [ ] Exports complete

---

#### Task 8.8: Update Validator for New Modes
**File**: `src/validation/validator.ts`
**Estimated Time**: 4 hours

**Acceptance Criteria**:
- [ ] Validation for all 6 new modes
- [ ] Mode-specific checks
- [ ] Integration with taxonomy
- [ ] Tests updated

---

## Updated Total Effort

### Phase 4D (v3.5.0) - Taxonomy Integration
- Taxonomy initialization: 8 hours
- Classification system: 16 hours
- Enhanced metadata: 8 hours
- Multi-modal analyzer: 12 hours
- Adaptive selector: 10 hours
- Export integration: 8 hours
- Testing: 10 hours
- Documentation: 6 hours
**Subtotal: 78 hours (~10 days)**

### Phase 4E (v3.7.0) - New Modes
- 6 modes × 12 hours: 72 hours
- Core types update: 4 hours
- Validator update: 4 hours
- Integration testing: 8 hours
- Documentation: 8 hours
**Subtotal: 96 hours (~12 days)**

### Original Phases 4A-4C + 4F
- Phase 4A: 65 hours
- Phase 4B: 80 hours
- Phase 4C: 70 hours
- Phase 4F (ML): 96 hours (updated for 19 modes)
**Subtotal: 311 hours (~39 days)**

**Grand Total (Enhanced): ~485 hours (~60 days / 12 weeks)**
**Increase from Original: +165 hours (+51%)**
