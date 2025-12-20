/**
 * Unit tests for LaTeX Export (Phase 4 Task 1.5)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LaTeXExporter } from '../../../src/export/visual/utils/latex.js';
import {
  ThinkingMode,
  type MathematicsThought,
  type CausalThought,
  type BayesianThought,
  type TemporalThought,
  type GameTheoryThought,
  type EvidentialThought,
} from '../../../src/types/index.js';
import type { ThinkingSession } from '../../../src/types/session.js';

describe('LaTeX Export', () => {
  let exporter: LaTeXExporter;

  beforeEach(() => {
    exporter = new LaTeXExporter();
  });

  // Helper to create a basic test session
  const createTestSession = (thoughts: any[] = []): ThinkingSession => ({
    id: 'test-session-1',
    title: 'Test Session',
    mode: ThinkingMode.SEQUENTIAL,
    thoughts: thoughts,
    isComplete: false,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T01:00:00Z'),
    metrics: {
      totalThoughts: thoughts.length,
      revisionCount: 0,
      averageUncertainty: 0.3,
      timeSpent: 3600,
    },
    tags: ['test'],
  });

  describe('Basic Export Structure', () => {
    it('should generate valid LaTeX document structure', () => {
      const session = createTestSession();
      const latex = exporter.export(session);

      expect(latex).toContain('\\documentclass');
      expect(latex).toContain('\\begin{document}');
      expect(latex).toContain('\\end{document}');
    });

    it('should include document title and metadata', () => {
      const session = createTestSession();
      session.author = 'Test Author';
      const latex = exporter.export(session);

      expect(latex).toContain('\\title{Test Session}');
      expect(latex).toContain('\\author{Test Author}');
      expect(latex).toContain('\\maketitle');
    });

    it('should include table of contents when requested', () => {
      const exporter = new LaTeXExporter({ includeTOC: true });
      const session = createTestSession();
      const latex = exporter.export(session);

      expect(latex).toContain('\\tableofcontents');
    });

    it('should include session metadata section', () => {
      const session = createTestSession();
      const latex = exporter.export(session);

      expect(latex).toContain('Session Metadata');
      expect(latex).toContain('test-session-1');
      expect(latex).toContain('sequential');
    });

    it('should include metrics when requested', () => {
      const exporter = new LaTeXExporter({ includeMetrics: true });
      const session = createTestSession();
      const latex = exporter.export(session);

      expect(latex).toContain('Total Thoughts');
      expect(latex).toContain('Average Uncertainty');
    });
  });

  describe('Configuration Options', () => {
    it('should use specified document class', () => {
      const exporter = new LaTeXExporter({ documentClass: 'report' });
      const session = createTestSession();
      const latex = exporter.export(session);

      expect(latex).toContain('\\documentclass[11pt,letterpaper]{report}');
    });

    it('should use specified font size', () => {
      const exporter = new LaTeXExporter({ fontSize: '12pt' });
      const session = createTestSession();
      const latex = exporter.export(session);

      expect(latex).toContain('\\documentclass[12pt,letterpaper]{article}');
    });

    it('should use specified paper size', () => {
      const exporter = new LaTeXExporter({ paperSize: 'a4' });
      const session = createTestSession();
      const latex = exporter.export(session);

      expect(latex).toContain('\\documentclass[11pt,a4paper]{article}');
    });

    it('should include custom preamble when provided', () => {
      const customPreamble = '\\usepackage{mypackage}';
      const exporter = new LaTeXExporter({ customPreamble });
      const session = createTestSession();
      const latex = exporter.export(session);

      expect(latex).toContain(customPreamble);
    });
  });

  describe('Mathematics Mode Export', () => {
    it('should export mathematical equations', () => {
      const thought: MathematicsThought = {
        id: 'math-1',
        sessionId: 'test-1',
        mode: ThinkingMode.MATHEMATICS,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Pythagorean theorem',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'equation',
        mathematicalModel: {
          latex: 'a^2 + b^2 = c^2',
          symbolic: 'a**2 + b**2 == c**2',
          ascii: 'a^2 + b^2 = c^2',
        },
      };

      const session = createTestSession([thought]);
      const latex = exporter.export(session);

      expect(latex).toContain('\\begin{equation}');
      expect(latex).toContain('a^2 + b^2 = c^2');
      expect(latex).toContain('\\end{equation}');
      expect(latex).toContain('\\label{eq:thought1}');
    });

    it('should format theorem environments', () => {
      const thought: MathematicsThought = {
        id: 'math-2',
        sessionId: 'test-1',
        mode: ThinkingMode.MATHEMATICS,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Fundamental theorem',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'theorem',
        mathematicalModel: {
          latex: 'x + y = y + x',
          symbolic: 'x + y == y + x',
        },
        theorems: [
          {
            name: 'Commutativity',
            statement: 'Addition is commutative',
            hypotheses: ['x and y are real numbers'],
          },
        ],
      };

      const session = createTestSession([thought]);
      const latex = exporter.export(session);

      expect(latex).toContain('\\begin{theorem}');
      expect(latex).toContain('Commutativity');
      expect(latex).toContain('Addition is commutative');
      expect(latex).toContain('\\end{theorem}');
    });

    it('should format proof strategies', () => {
      const thought: MathematicsThought = {
        id: 'math-3',
        sessionId: 'test-1',
        mode: ThinkingMode.MATHEMATICS,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Proof by induction',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'proof',
        mathematicalModel: {
          latex: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
          symbolic: 'sum(i, i=1..n) == n*(n+1)/2',
        },
        proofStrategy: {
          type: 'induction',
          steps: ['Base case: n=1', 'Inductive step: assume true for k', 'Prove for k+1'],
        },
      };

      const session = createTestSession([thought]);
      const latex = exporter.export(session);

      expect(latex).toContain('\\begin{proof}');
      expect(latex).toContain('Strategy:');
      expect(latex).toContain('induction');
      expect(latex).toContain('Base case');
      expect(latex).toContain('\\end{proof}');
    });
  });

  describe('Causal Mode Export', () => {
    it('should generate TikZ diagrams for causal graphs', () => {
      const thought: CausalThought = {
        id: 'causal-1',
        sessionId: 'test-1',
        mode: ThinkingMode.CAUSAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Causal analysis',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'graph_construction',
        causalGraph: {
          nodes: [
            { id: 'n1', name: 'Cause A', type: 'cause', description: 'First cause' },
            { id: 'n2', name: 'Effect B', type: 'effect', description: 'Result' },
          ],
          edges: [
            { id: 'e1', from: 'n1', to: 'n2', strength: 0.8, type: 'direct', confidence: 0.9 },
          ],
        },
      };

      const session = createTestSession([thought]);
      const latex = exporter.export(session);

      expect(latex).toContain('\\begin{tikzpicture}');
      expect(latex).toContain('\\end{tikzpicture}');
      expect(latex).toContain('Cause A');
      expect(latex).toContain('Effect B');
    });

    it('should include node styling based on type', () => {
      const thought: CausalThought = {
        id: 'causal-2',
        sessionId: 'test-1',
        mode: ThinkingMode.CAUSAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Node types',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'graph_construction',
        causalGraph: {
          nodes: [
            { id: 'n1', name: 'Cause', type: 'cause', description: 'Cause node' },
            { id: 'n2', name: 'Mediator', type: 'mediator', description: 'Mediator node' },
            { id: 'n3', name: 'Effect', type: 'effect', description: 'Effect node' },
            { id: 'n4', name: 'Confounder', type: 'confounder', description: 'Confounder node' },
          ],
          edges: [],
        },
      };

      const session = createTestSession([thought]);
      const latex = exporter.export(session);

      expect(latex).toContain('fill=blue!20'); // cause
      expect(latex).toContain('fill=green!20'); // mediator
      expect(latex).toContain('fill=red!20'); // effect
      expect(latex).toContain('fill=yellow!20'); // confounder
    });
  });

  describe('Bayesian Mode Export', () => {
    it('should format prior and posterior probabilities', () => {
      const thought: BayesianThought = {
        id: 'bayes-1',
        sessionId: 'test-1',
        mode: ThinkingMode.BAYESIAN,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Bayesian update',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'probability_update',
        hypothesis: {
          id: 'h1',
          statement: 'The coin is fair',
          alternatives: ['The coin is biased'],
        },
        prior: {
          probability: 0.5,
          justification: 'Uniform prior',
        },
        evidence: {
          id: 'e1',
          description: 'Observed 7 heads out of 10 flips',
          likelihood: 0.7,
          likelihoodGivenNot: 0.3,
        },
        posterior: {
          probability: 0.63,
          method: 'bayes_rule',
        },
        bayesFactor: 2.33,
      };

      const session = createTestSession([thought]);
      const latex = exporter.export(session);

      expect(latex).toContain('Hypothesis');
      expect(latex).toContain('The coin is fair');
      expect(latex).toContain('Prior');
      expect(latex).toContain('0.5');
      expect(latex).toContain('Posterior');
      expect(latex).toContain('0.63');
      expect(latex).toContain('Bayes Factor');
    });
  });

  describe('Temporal Mode Export', () => {
    it('should format temporal timeline', () => {
      const thought: TemporalThought = {
        id: 'temporal-1',
        sessionId: 'test-1',
        mode: ThinkingMode.TEMPORAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Timeline analysis',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'timeline_construction',
        timeline: {
          id: 'timeline-1',
          name: 'Project Timeline',
          timeUnit: 'days',
          events: ['e1', 'e2'],
        },
        events: [
          {
            id: 'e1',
            name: 'Start',
            description: 'Project start',
            timestamp: 0,
            type: 'instant',
            properties: {},
          },
          {
            id: 'e2',
            name: 'End',
            description: 'Project end',
            timestamp: 30,
            type: 'instant',
            properties: {},
          },
        ],
      };

      const session = createTestSession([thought]);
      const latex = exporter.export(session);

      expect(latex).toContain('Timeline');
      expect(latex).toContain('Project Timeline');
      expect(latex).toContain('Start');
      expect(latex).toContain('End');
    });
  });

  describe('Game Theory Mode Export', () => {
    it('should format game definition', () => {
      const thought: GameTheoryThought = {
        id: 'game-1',
        sessionId: 'test-1',
        mode: ThinkingMode.GAMETHEORY,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Game analysis',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'game_definition',
        game: {
          id: 'g1',
          name: "Prisoner's Dilemma",
          description: 'Classic game theory scenario',
          type: 'normal_form',
          numPlayers: 2,
          isZeroSum: false,
          isPerfectInformation: true,
        },
      };

      const session = createTestSession([thought]);
      const latex = exporter.export(session);

      expect(latex).toContain('Game');
      expect(latex).toContain("Prisoner's Dilemma");
      expect(latex).toContain('Players: 2');
    });

    it('should format Nash equilibria', () => {
      const thought: GameTheoryThought = {
        id: 'game-2',
        sessionId: 'test-1',
        mode: ThinkingMode.GAMETHEORY,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Equilibrium finding',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'equilibrium_finding',
        nashEquilibria: [
          {
            id: 'ne1',
            strategyProfile: ['Cooperate', 'Cooperate'],
            payoffs: [3, 3],
            type: 'pure',
            isStrict: true,
            stability: 0.8,
          },
        ],
      };

      const session = createTestSession([thought]);
      const latex = exporter.export(session);

      expect(latex).toContain('Nash Equilibria');
      expect(latex).toContain('Cooperate');
      expect(latex).toContain('Payoffs');
      expect(latex).toContain('Stability');
    });
  });

  describe('Evidential Mode Export', () => {
    it('should format frame of discernment', () => {
      const thought: EvidentialThought = {
        id: 'ev-1',
        sessionId: 'test-1',
        mode: ThinkingMode.EVIDENTIAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Evidence analysis',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'hypothesis_definition',
        frameOfDiscernment: ['H1', 'H2', 'H3'],
      };

      const session = createTestSession([thought]);
      const latex = exporter.export(session);

      expect(latex).toContain('Frame of Discernment');
      expect(latex).toContain('H1');
      expect(latex).toContain('H2');
      expect(latex).toContain('H3');
    });

    it('should format belief functions', () => {
      const thought: EvidentialThought = {
        id: 'ev-2',
        sessionId: 'test-1',
        mode: ThinkingMode.EVIDENTIAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Belief assignment',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'belief_assignment',
        frameOfDiscernment: ['H1', 'H2'],
        beliefFunctions: [
          {
            id: 'bf1',
            source: 'Sensor A',
            massAssignments: [
              {
                hypothesisSet: ['H1'],
                mass: 0.6,
                justification: 'Strong signal',
              },
              {
                hypothesisSet: ['H2'],
                mass: 0.4,
                justification: 'Weak signal',
              },
            ],
          },
        ],
      };

      const session = createTestSession([thought]);
      const latex = exporter.export(session);

      expect(latex).toContain('Belief Functions');
      expect(latex).toContain('Sensor A');
      expect(latex).toContain('0.6');
      expect(latex).toContain('0.4');
    });
  });

  describe('Diagram Embedding', () => {
    it('should embed Mermaid diagrams for causal mode when renderDiagrams is true', () => {
      const exporter = new LaTeXExporter({ renderDiagrams: true });
      const thought: CausalThought = {
        id: 'causal-3',
        sessionId: 'test-1',
        mode: ThinkingMode.CAUSAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Causal with Mermaid',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'graph_construction',
        causalGraph: {
          nodes: [
            { id: 'n1', name: 'A', type: 'cause', description: 'Node A' },
            { id: 'n2', name: 'B', type: 'effect', description: 'Node B' },
          ],
          edges: [
            { id: 'e1', from: 'n1', to: 'n2', strength: 0.9, type: 'direct', confidence: 0.95 },
          ],
        },
      };

      const session = createTestSession([thought]);
      const latex = exporter.export(session);

      // Should contain both TikZ and Mermaid diagrams
      expect(latex).toContain('\\begin{tikzpicture}');
      expect(latex).toContain('\\begin{verbatim}');
      expect(latex).toContain('graph');
      expect(latex).toContain('Causal Graph for Thought 1');
    });

    it('should not embed diagrams when renderDiagrams is false', () => {
      const exporter = new LaTeXExporter({ renderDiagrams: false });
      const thought: CausalThought = {
        id: 'causal-4',
        sessionId: 'test-1',
        mode: ThinkingMode.CAUSAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Causal without diagrams',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'graph_construction',
        causalGraph: {
          nodes: [{ id: 'n1', name: 'A', type: 'cause', description: 'Node A' }],
          edges: [],
        },
      };

      const session = createTestSession([thought]);
      const latex = exporter.export(session);

      // Should contain TikZ but not Mermaid verbatim blocks for causal graphs
      expect(latex).toContain('\\begin{tikzpicture}');
      const verbatimCount = (latex.match(/\\begin{verbatim}/g) || []).length;
      expect(verbatimCount).toBe(0); // No Mermaid diagrams
    });
  });

  describe('Special Characters', () => {
    it('should escape LaTeX special characters', () => {
      const session = createTestSession();
      session.title = 'Test & Title $ % # _ { }';
      const latex = exporter.export(session);

      expect(latex).toContain('\\&');
      expect(latex).toContain('\\$');
      expect(latex).toContain('\\%');
      expect(latex).toContain('\\#');
      expect(latex).toContain('\\_');
      expect(latex).toContain('\\{');
      expect(latex).toContain('\\}');
    });
  });
});
