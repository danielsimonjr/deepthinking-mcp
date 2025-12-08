/**
 * Unit tests for Visual Export functionality (v2.5)
 */

import { describe, it, expect } from 'vitest';
import { VisualExporter } from '../../src/export/visual.js';
import type { CausalThought, TemporalThought, GameTheoryThought, BayesianThought } from '../../src/types/index.js';

describe('Visual Export', () => {
  const exporter = new VisualExporter();

  describe('Causal Graph Exports', () => {
    const causalThought: CausalThought = {
      id: 'causal-1',
      sessionId: 'session-1',
      mode: 'causal',
      thoughtNumber: 1,
      totalThoughts: 1,
      content: 'Analyzing marketing effectiveness',
      timestamp: new Date(),
      nextThoughtNeeded: false,
      causalGraph: {
        nodes: [
          { id: 'marketing', name: 'Marketing Budget', type: 'cause', description: 'Marketing spend' },
          { id: 'awareness', name: 'Brand Awareness', type: 'mediator', description: 'Customer awareness' },
          { id: 'revenue', name: 'Revenue', type: 'effect', description: 'Sales revenue' },
        ],
        edges: [
          { id: 'e1', from: 'marketing', to: 'awareness', strength: 0.8, type: 'direct' },
          { id: 'e2', from: 'awareness', to: 'revenue', strength: 0.7, type: 'direct' },
        ],
      },
      mechanisms: [],
    };

    it('should export causal graph to Mermaid format', () => {
      const result = exporter.exportCausalGraph(causalThought, { format: 'mermaid' });

      expect(result).toContain('graph TB');
      expect(result).toContain('marketing([Marketing Budget])');
      expect(result).toContain('awareness[Brand Awareness]');
      expect(result).toContain('revenue[[Revenue]]');
      expect(result).toContain('marketing --> |0.80| awareness');
      expect(result).toContain('awareness --> |0.70| revenue');
      expect(result).toContain('style marketing fill:#');
      expect(result).toContain('style revenue fill:#');
    });

    it('should export causal graph to DOT format', () => {
      const result = exporter.exportCausalGraph(causalThought, { format: 'dot' });

      expect(result).toContain('digraph CausalGraph');
      expect(result).toContain('rankdir=TB');
      expect(result).toContain('marketing [label="Marketing Budget", shape=ellipse]');
      expect(result).toContain('awareness [label="Brand Awareness", shape=box]');
      expect(result).toContain('revenue [label="Revenue", shape=doubleoctagon]');
      expect(result).toContain('marketing -> awareness [label="0.80"]');
      expect(result).toContain('awareness -> revenue [label="0.70"]');
    });

    it('should export causal graph to ASCII format', () => {
      const result = exporter.exportCausalGraph(causalThought, { format: 'ascii' });

      expect(result).toContain('Causal Graph:');
      expect(result).toContain('[CAUSE] Marketing Budget');
      expect(result).toContain('[MEDIATOR] Brand Awareness');
      expect(result).toContain('[EFFECT] Revenue');
      expect(result).toContain('Marketing Budget --> Brand Awareness (strength: 0.80)');
      expect(result).toContain('Brand Awareness --> Revenue (strength: 0.70)');
    });
  });

  describe('Temporal Timeline Exports', () => {
    const temporalThought: TemporalThought = {
      id: 'temporal-1',
      sessionId: 'session-1',
      mode: 'temporal',
      thoughtNumber: 1,
      totalThoughts: 1,
      content: 'Project timeline',
      timestamp: new Date(),
      nextThoughtNeeded: false,
      thoughtType: 'event_definition',
      timeline: {
        id: 'tl-1',
        name: 'Project Timeline',
        timeUnit: 'days',
        events: ['e1', 'e2', 'e3'],
      },
      events: [
        { id: 'e1', name: 'Project Start', description: 'Kickoff', timestamp: 0, type: 'instant', properties: {} },
        { id: 'e2', name: 'Development', description: 'Code', timestamp: 5, duration: 10, type: 'interval', properties: {} },
        { id: 'e3', name: 'Launch', description: 'Release', timestamp: 20, type: 'instant', properties: {} },
      ],
    };

    it('should export temporal timeline to Mermaid Gantt chart', () => {
      const result = exporter.exportTemporalTimeline(temporalThought, { format: 'mermaid' });

      expect(result).toContain('gantt');
      expect(result).toContain('title Project Timeline');
      expect(result).toContain('dateFormat X');
      expect(result).toContain('Project Start :milestone');
      expect(result).toContain('Development :5, 10s');
      expect(result).toContain('Launch :milestone');
    });

    it('should export temporal timeline to ASCII format', () => {
      const result = exporter.exportTemporalTimeline(temporalThought, { format: 'ascii' });

      expect(result).toContain('Timeline: Project Timeline');
      expect(result).toContain('t=   0 ⦿ Project Start');
      expect(result).toContain('t=   5 ━ Development');
      expect(result).toContain('duration: 10');
      expect(result).toContain('t=  20 ⦿ Launch');
    });

    it('should export temporal timeline to DOT format', () => {
      const result = exporter.exportTemporalTimeline(temporalThought, { format: 'dot' });

      expect(result).toContain('digraph Timeline');
      expect(result).toContain('rankdir=LR');
      expect(result).toContain('e1 [label="Project Start');
      expect(result).toContain('e2 [label="Development');
      expect(result).toContain('e1 -> e2');
      expect(result).toContain('e2 -> e3');
    });
  });

  describe('Game Theory Exports', () => {
    const gameThought: GameTheoryThought = {
      id: 'game-1',
      sessionId: 'session-1',
      mode: 'gametheory',
      thoughtNumber: 1,
      totalThoughts: 1,
      content: 'Analyzing prisoner dilemma',
      timestamp: new Date(),
      nextThoughtNeeded: false,
      thoughtType: 'game_definition',
      game: {
        id: 'pd',
        name: "Prisoner's Dilemma",
        description: 'Classic game theory example',
        type: 'normal_form',
        numPlayers: 2,
        isPerfectInformation: true,
        isZeroSum: false,
      },
      strategies: [
        { id: 's1', playerId: 'player1', name: 'Cooperate', description: 'Stay silent', isPure: true },
        { id: 's2', playerId: 'player1', name: 'Defect', description: 'Betray', isPure: true },
      ],
      gameTree: {
        nodes: [
          { id: 'root', type: 'decision', playerId: 'player1', parentNode: undefined, childNodes: ['n1', 'n2'], action: undefined },
          { id: 'n1', type: 'terminal', playerId: 'player1', parentNode: 'root', childNodes: [], action: 'Cooperate', payoffs: [-1, -1] },
          { id: 'n2', type: 'terminal', playerId: 'player1', parentNode: 'root', childNodes: [], action: 'Defect', payoffs: [0, -3] },
        ],
      },
    };

    it('should export game tree to Mermaid format', () => {
      const result = exporter.exportGameTree(gameThought, { format: 'mermaid' });

      expect(result).toContain('graph TD');
      expect(result).toContain('root[root]');
      expect(result).toContain('n1[[Cooperate]]');
      expect(result).toContain('n2[[Defect]]');
      expect(result).toContain('root --> |Cooperate| n1');
      expect(result).toContain('root --> |Defect| n2');
    });

    it('should export game tree to ASCII format', () => {
      const result = exporter.exportGameTree(gameThought, { format: 'ascii' });

      expect(result).toContain("Game: Prisoner's Dilemma");
      expect(result).toContain('Strategies:');
      expect(result).toContain('• Cooperate (Pure)');
      expect(result).toContain('• Defect (Pure)');
    });
  });

  describe('Bayesian Network Exports', () => {
    const bayesianThought: BayesianThought = {
      id: 'bayesian-1',
      sessionId: 'session-1',
      mode: 'bayesian',
      thoughtNumber: 1,
      totalThoughts: 1,
      content: 'Analyzing hypothesis',
      timestamp: new Date(),
      nextThoughtNeeded: false,
      hypothesis: { id: 'h1', statement: 'Feature improves conversion', alternatives: [] },
      prior: { probability: 0.5, justification: 'No prior data' },
      likelihood: { probability: 0.8, description: 'Test results' },
      evidence: [
        { id: 'ev1', description: 'A/B test shows 20% lift', likelihoodGivenHypothesis: 0.8, likelihoodGivenNotHypothesis: 0.2 },
      ],
      posterior: { probability: 0.76, calculation: 'Bayesian update', confidence: 0.9 },
      bayesFactor: 3.8,
    };

    it('should export Bayesian network to Mermaid format', () => {
      const result = exporter.exportBayesianNetwork(bayesianThought, { format: 'mermaid' });

      expect(result).toContain('graph LR');
      expect(result).toContain('H([Hypothesis])');
      expect(result).toContain('Prior[Prior: 0.500]');
      expect(result).toContain('Evidence[Evidence]');
      expect(result).toContain('Posterior[[Posterior: 0.760]]');
      expect(result).toContain('Prior --> H');
      expect(result).toContain('Evidence --> H');
      expect(result).toContain('H --> Posterior');
      expect(result).toContain('style Prior fill:#');
      expect(result).toContain('style Posterior fill:#');
    });

    it('should export Bayesian network to ASCII format', () => {
      const result = exporter.exportBayesianNetwork(bayesianThought, { format: 'ascii' });

      expect(result).toContain('Bayesian Network:');
      expect(result).toContain('Hypothesis: Feature improves conversion');
      expect(result).toContain('Prior Probability: 0.500');
      expect(result).toContain('Posterior Probability: 0.760');
      expect(result).toContain('Bayes Factor: 3.80');
      expect(result).toContain('Evidence:');
      expect(result).toContain('• A/B test shows 20% lift');
    });
  });

  describe('Export Options', () => {
    const simpleThought: CausalThought = {
      id: 'simple-1',
      sessionId: 'session-1',
      mode: 'causal',
      thoughtNumber: 1,
      totalThoughts: 1,
      content: 'Simple graph',
      timestamp: new Date(),
      nextThoughtNeeded: false,
      causalGraph: {
        nodes: [
          { id: 'a', name: 'A', type: 'cause', description: 'Node A' },
          { id: 'b', name: 'B', type: 'effect', description: 'Node B' },
        ],
        edges: [
          { id: 'e1', from: 'a', to: 'b', strength: 0.9, type: 'direct' },
        ],
      },
      mechanisms: [],
    };

    it('should apply color schemes correctly', () => {
      const defaultColors = exporter.exportCausalGraph(simpleThought, { format: 'mermaid', colorScheme: 'default' });
      const pastelColors = exporter.exportCausalGraph(simpleThought, { format: 'mermaid', colorScheme: 'pastel' });
      const monochromeColors = exporter.exportCausalGraph(simpleThought, { format: 'mermaid', colorScheme: 'monochrome' });

      expect(defaultColors).toContain('style a fill:#a8d5ff');
      expect(pastelColors).toContain('style a fill:#e1f5ff');
      expect(monochromeColors).not.toContain('style a fill:#');
    });

    it('should handle includeMetrics option', () => {
      const withMetrics = exporter.exportCausalGraph(simpleThought, { format: 'mermaid', includeMetrics: true });
      const withoutMetrics = exporter.exportCausalGraph(simpleThought, { format: 'mermaid', includeMetrics: false });

      expect(withMetrics).toContain('|0.90|');
      expect(withoutMetrics).not.toContain('|0.90|');
    });

    it('should throw error for unsupported format', () => {
      expect(() => {
        exporter.exportCausalGraph(simpleThought, { format: 'invalid' as any });
      }).toThrow('Unsupported format: invalid');
    });
  });
});
