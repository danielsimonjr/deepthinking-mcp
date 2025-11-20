/**
 * LaTeX Export Tests (v3.4.0)
 * Phase 4B Task 1.5: Add LaTeX export tests (15+ tests)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LaTeXExporter } from '../../src/export/latex.js';
import { LatexMermaidIntegrator } from '../../src/export/latex-mermaid-integration.js';
import type { ThinkingSession, Thought, MathematicsThought, CausalThought } from '../../src/types/index.js';

describe('LaTeX Exporter', () => {
  let exporter: LaTeXExporter;
  let session: ThinkingSession;

  beforeEach(() => {
    exporter = new LaTeXExporter();
    session = {
      id: 'test-session',
      title: 'Test Session',
      mode: 'mathematics',
      thoughts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe('Preamble Generation', () => {
    it('should generate basic preamble', () => {
      const preamble = exporter.preamble();

      expect(preamble).toContain('\\documentclass');
      expect(preamble).toContain('\\usepackage');
    });

    it('should include amsmath for mathematics support', () => {
      const preamble = exporter.preamble();

      expect(preamble).toContain('amsmath');
    });

    it('should include tikz for diagrams', () => {
      const preamble = exporter.preamble();

      expect(preamble).toContain('tikz');
    });

    it('should define custom commands', () => {
      const preamble = exporter.preamble();

      expect(preamble).toContain('\\newcommand');
      expect(preamble).toContain('\\thoughtsection');
    });

    it('should configure color scheme', () => {
      const exporter = new LaTeXExporter({ colorScheme: 'vibrant' });
      const preamble = exporter.preamble();

      expect(preamble).toContain('\\definecolor');
    });
  });

  describe('Document Structure', () => {
    it('should export complete document', () => {
      const thought: Thought = {
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        thought: 'Test thought',
        mode: 'sequential',
      };
      session.thoughts = [thought];

      const latex = exporter.export(session);

      expect(latex).toContain('\\begin{document}');
      expect(latex).toContain('\\end{document}');
      expect(latex).toContain('Test Session');
      expect(latex).toContain('Test thought');
    });

    it('should include table of contents when enabled', () => {
      const exporter = new LaTeXExporter({ includeTOC: true });
      const latex = exporter.export(session);

      expect(latex).toContain('\\tableofcontents');
    });

    it('should exclude table of contents when disabled', () => {
      const exporter = new LaTeXExporter({ includeTOC: false });
      const latex = exporter.export(session);

      expect(latex).not.toContain('\\tableofcontents');
    });

    it('should include metadata when enabled', () => {
      const exporter = new LaTeXExporter({ includeMetadata: true });
      const latex = exporter.export(session);

      expect(latex).toContain('Session ID') || expect(latex).toContain('metadata');
    });
  });

  describe('Mathematics Mode Export', () => {
    it('should export mathematical equations', () => {
      const mathThought: MathematicsThought = {
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        thought: 'Mathematical proof',
        mode: 'mathematics',
        equation: 'x^2 + y^2 = z^2',
        proofStrategy: { type: 'direct', steps: [] },
      };
      session.thoughts = [mathThought];

      const latex = exporter.export(session);

      expect(latex).toContain('x^2 + y^2 = z^2');
      expect(latex).toContain('\\[') || expect(latex).toContain('$$');
    });

    it('should handle inline math mode', () => {
      const exporter = new LaTeXExporter({ inlineMath: true });
      const mathThought: MathematicsThought = {
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        thought: 'Inline equation',
        mode: 'mathematics',
        equation: 'E = mc^2',
        proofStrategy: { type: 'direct', steps: [] },
      };
      session.thoughts = [mathThought];

      const latex = exporter.export(session);

      expect(latex).toContain('$') || expect(latex).toContain('\\(');
    });

    it('should format theorem environments', () => {
      const mathThought: MathematicsThought = {
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        thought: 'Pythagorean theorem',
        mode: 'mathematics',
        equation: 'a^2 + b^2 = c^2',
        proofStrategy: { type: 'direct', steps: ['Step 1', 'Step 2'] },
      };
      session.thoughts = [mathThought];

      const latex = exporter.export(session);

      expect(latex).toContain('theorem') || expect(latex).toContain('proof');
    });
  });

  describe('Diagram Integration', () => {
    it('should include diagrams when enabled', () => {
      const exporter = new LaTeXExporter({ renderDiagrams: true });
      const causalThought: CausalThought = {
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        thought: 'Causal analysis',
        mode: 'causal',
        graph: {
          nodes: [{ id: 'A', label: 'A' }],
          edges: [{ from: 'A', to: 'B', type: 'causes', strength: 0.8, bidirectional: false }],
        },
      };
      session.thoughts = [causalThought];

      const latex = exporter.export(session);

      expect(latex).toContain('tikz') || expect(latex).toContain('figure');
    });

    it('should exclude diagrams when disabled', () => {
      const exporter = new LaTeXExporter({ renderDiagrams: false });
      const causalThought: CausalThought = {
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        thought: 'Causal analysis',
        mode: 'causal',
        graph: {
          nodes: [{ id: 'A', label: 'A' }],
          edges: [],
        },
      };
      session.thoughts = [causalThought];

      const latex = exporter.export(session);

      // Should not contain diagram-specific content
      const hasDiagram = latex.includes('\\begin{tikzpicture}') || latex.includes('\\begin{figure}');
      expect(hasDiagram).toBe(false);
    });
  });

  describe('LaTeX-Mermaid Integration', () => {
    let integrator: LatexMermaidIntegrator;

    beforeEach(() => {
      integrator = new LatexMermaidIntegrator();
    });

    it('should generate Mermaid preamble for TikZ engine', () => {
      const preamble = integrator.generateMermaidPreamble('mermaid-tikz');

      expect(preamble).toContain('\\usepackage{tikz}');
      expect(preamble).toContain('mermaid');
    });

    it('should generate Mermaid preamble for SVG engine', () => {
      const preamble = integrator.generateMermaidPreamble('external-svg');

      expect(preamble).toContain('\\usepackage{svg}');
      expect(preamble).toContain('\\includesvg');
    });

    it('should generate Mermaid preamble for inline code', () => {
      const preamble = integrator.generateMermaidPreamble('inline-code');

      expect(preamble).toContain('\\lstdefinelanguage{mermaid}');
      expect(preamble).toContain('listings');
    });

    it('should embed Mermaid diagram with caption', () => {
      const mermaidCode = 'graph TD\\n  A --> B';
      const embedded = integrator.embedMermaidDiagram(
        mermaidCode,
        'Test Diagram',
        'fig:test',
        { engine: 'inline-code', caption: true }
      );

      expect(embedded).toContain('\\caption{Test Diagram}');
      expect(embedded).toContain('\\label{fig:test}');
    });

    it('should embed Mermaid diagram without caption', () => {
      const mermaidCode = 'graph TD\\n  A --> B';
      const embedded = integrator.embedMermaidDiagram(
        mermaidCode,
        'Test Diagram',
        'fig:test',
        { engine: 'inline-code', caption: false }
      );

      expect(embedded).not.toContain('\\caption');
    });

    it('should generate thought diagram', () => {
      const causalThought: CausalThought = {
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        thought: 'Causal analysis',
        mode: 'causal',
        graph: {
          nodes: [{ id: 'A', label: 'A' }],
          edges: [{ from: 'A', to: 'B', type: 'causes', strength: 0.8, bidirectional: false }],
        },
      };

      const diagram = integrator.generateThoughtDiagram(causalThought, { engine: 'inline-code' });

      expect(diagram).toContain('mermaid');
    });

    it('should generate session diagrams', () => {
      const causalThought: CausalThought = {
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        thought: 'Causal analysis',
        mode: 'causal',
        graph: {
          nodes: [{ id: 'A', label: 'A' }],
          edges: [],
        },
      };
      session.thoughts = [causalThought];

      const diagrams = integrator.generateSessionDiagrams(session, { engine: 'inline-code' });

      expect(diagrams.length).toBeGreaterThan(0);
    });

    it('should generate Mermaid appendix', () => {
      const causalThought: CausalThought = {
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        thought: 'Causal analysis',
        mode: 'causal',
        graph: {
          nodes: [{ id: 'A', label: 'A' }],
          edges: [],
        },
      };
      session.thoughts = [causalThought];

      const appendix = integrator.generateMermaidAppendix(session);

      expect(appendix).toContain('Appendix');
      expect(appendix).toContain('Mermaid');
    });

    it('should generate complete integrated document', () => {
      const causalThought: CausalThought = {
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        thought: 'Causal analysis',
        mode: 'causal',
        graph: {
          nodes: [{ id: 'A', label: 'A' }],
          edges: [],
        },
      };
      session.thoughts = [causalThought];

      const doc = integrator.generateIntegratedDocument(session, {
        engine: 'inline-code',
        includeAppendix: true,
      });

      expect(doc).toContain('\\documentclass');
      expect(doc).toContain('\\begin{document}');
      expect(doc).toContain('\\end{document}');
      expect(doc).toContain('Causal analysis');
    });
  });

  describe('Special Characters Escaping', () => {
    it('should escape LaTeX special characters', () => {
      const thought: Thought = {
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        thought: 'Special chars: $ % & # _',
        mode: 'sequential',
      };
      session.thoughts = [thought];

      const latex = exporter.export(session);

      expect(latex).toContain('\\$') || expect(latex).toContain('\\textdollar');
      expect(latex).toContain('\\%');
      expect(latex).toContain('\\&');
    });
  });

  describe('Export Options', () => {
    it('should respect document class option', () => {
      const exporter = new LaTeXExporter({ documentClass: 'report' });
      const latex = exporter.export(session);

      expect(latex).toContain('\\documentclass[11pt,letterpaper]{report}');
    });

    it('should respect font size option', () => {
      const exporter = new LaTeXExporter({ fontSize: '12pt' });
      const latex = exporter.export(session);

      expect(latex).toContain('[12pt');
    });

    it('should respect paper size option', () => {
      const exporter = new LaTeXExporter({ paperSize: 'a4' });
      const latex = exporter.export(session);

      expect(latex).toContain('a4paper');
    });
  });
});
