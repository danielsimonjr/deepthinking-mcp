/**
 * Mode-Specific Export Integration Tests
 *
 * Tests T-EXP-049 through T-EXP-061: Comprehensive tests for
 * mode-specific export content across all formats.
 *
 * Phase 11 Sprint 8: Session Management & Export Formats
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ExportService } from '../../../src/services/ExportService.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Mode-Specific Export Integration Tests', () => {
  let manager: SessionManager;
  let factory: ThoughtFactory;
  let exportService: ExportService;

  const formats = ['markdown', 'json', 'html', 'mermaid', 'dot', 'ascii', 'latex', 'jupyter'] as const;

  beforeEach(() => {
    manager = new SessionManager();
    factory = new ThoughtFactory();
    exportService = new ExportService();
  });

  function createThought(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Test thought',
      thoughtNumber: 1,
      totalThoughts: 1,
      nextThoughtNeeded: false,
      mode: 'sequential',
      ...overrides,
    } as ThinkingToolInput;
  }

  // ===========================================================================
  // T-EXP-049: Sequential mode export (all formats)
  // ===========================================================================
  describe('T-EXP-049: Sequential Mode Export', () => {
    it.each(formats)('should export sequential mode to %s', async (format) => {
      const session = await manager.createSession(ThinkingMode.SEQUENTIAL);
      const thought = factory.createThought(createThought({
        mode: 'sequential',
        thought: 'Step-by-step reasoning process',
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, format);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // T-EXP-050: Shannon mode export with stages
  // ===========================================================================
  describe('T-EXP-050: Shannon Mode Export', () => {
    it.each(formats)('should export shannon mode to %s', async (format) => {
      const session = await manager.createSession(ThinkingMode.SHANNON);
      const thought = factory.createThought(createThought({
        mode: 'shannon',
        thought: 'Shannon methodology analysis',
        stage: 'problem_definition',
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, format);
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-051: Mathematics mode export with LaTeX
  // ===========================================================================
  describe('T-EXP-051: Mathematics Mode Export', () => {
    it.each(formats)('should export mathematics mode to %s', async (format) => {
      const session = await manager.createSession(ThinkingMode.MATHEMATICS);
      const thought = factory.createThought(createThought({
        mode: 'mathematics',
        thought: 'Mathematical proof',
        proofStrategy: {
          type: 'direct',
          steps: ['Assume P', 'Show Q'],
        },
        mathematicalModel: {
          latex: '\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}',
          symbolic: 'integral(exp(-x^2), x, 0, inf) = sqrt(pi)/2',
        },
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, format);
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-052: Physics mode export with tensors
  // ===========================================================================
  describe('T-EXP-052: Physics Mode Export', () => {
    it.each(formats)('should export physics mode to %s', async (format) => {
      const session = await manager.createSession(ThinkingMode.PHYSICS);
      const thought = factory.createThought(createThought({
        mode: 'physics',
        thought: 'Tensor analysis',
        tensorProperties: {
          rank: [2, 0],
          components: 'g_{\\mu\\nu}',
          latex: 'g_{\\mu\\nu}',
          transformation: 'covariant',
        },
        physicalInterpretation: {
          quantity: 'Metric tensor',
          units: 'dimensionless',
          conservationLaws: ['Energy', 'Momentum'],
        },
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, format);
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-053: Temporal mode export with timeline
  // ===========================================================================
  describe('T-EXP-053: Temporal Mode Export', () => {
    it.each(formats)('should export temporal mode to %s', async (format) => {
      const session = await manager.createSession(ThinkingMode.TEMPORAL);
      const thought = factory.createThought(createThought({
        mode: 'temporal',
        thought: 'Temporal reasoning',
        events: [
          { id: 'e1', name: 'Event 1', description: 'First event', timestamp: 1000, type: 'instant' },
          { id: 'e2', name: 'Event 2', description: 'Second event', timestamp: 2000, type: 'instant' },
        ],
        timeline: {
          id: 'timeline-1',
          name: 'Main Timeline',
          timeUnit: 'seconds',
          events: ['e1', 'e2'],
        },
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, format);
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-054: Bayesian mode export with probabilities
  // ===========================================================================
  describe('T-EXP-054: Bayesian Mode Export', () => {
    it.each(formats)('should export bayesian mode to %s', async (format) => {
      const session = await manager.createSession(ThinkingMode.BAYESIAN);
      const thought = factory.createThought(createThought({
        mode: 'bayesian',
        thought: 'Bayesian analysis',
        priorProbability: 0.3,
        likelihood: 0.8,
        evidence: ['Evidence 1', 'Evidence 2'],
        hypotheses: [
          { id: 'h1', description: 'Hypothesis 1', probability: 0.3 },
          { id: 'h2', description: 'Hypothesis 2', probability: 0.7 },
        ],
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, format);
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-055: Causal mode export with graph
  // ===========================================================================
  describe('T-EXP-055: Causal Mode Export', () => {
    it.each(formats)('should export causal mode to %s', async (format) => {
      const session = await manager.createSession(ThinkingMode.CAUSAL);
      const thought = factory.createThought(createThought({
        mode: 'causal',
        thought: 'Causal analysis',
        nodes: [
          { id: 'n1', name: 'Cause', description: 'The cause' },
          { id: 'n2', name: 'Effect', description: 'The effect' },
        ],
        edges: [
          { from: 'n1', to: 'n2', strength: 0.9 },
        ],
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, format);
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-056: GameTheory mode export with payoff matrix
  // ===========================================================================
  describe('T-EXP-056: GameTheory Mode Export', () => {
    it.each(formats)('should export gametheory mode to %s', async (format) => {
      const session = await manager.createSession(ThinkingMode.GAMETHEORY);
      const thought = factory.createThought(createThought({
        mode: 'gametheory',
        thought: 'Game theory analysis',
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['cooperate', 'defect'] },
          { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: ['cooperate', 'defect'] },
        ],
        strategies: [
          { id: 'cooperate', playerId: 'p1', name: 'Cooperate', description: 'Cooperate with opponent', isPure: true },
          { id: 'defect', playerId: 'p1', name: 'Defect', description: 'Defect against opponent', isPure: true },
        ],
        payoffMatrix: {
          players: ['p1', 'p2'],
          dimensions: [2, 2],
          payoffs: [
            { strategyProfile: ['cooperate', 'cooperate'], payoffs: [3, 3] },
            { strategyProfile: ['cooperate', 'defect'], payoffs: [0, 5] },
            { strategyProfile: ['defect', 'cooperate'], payoffs: [5, 0] },
            { strategyProfile: ['defect', 'defect'], payoffs: [1, 1] },
          ],
        },
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, format);
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-057: Algorithmic mode export with complexity
  // ===========================================================================
  describe('T-EXP-057: Algorithmic Mode Export', () => {
    it.each(formats)('should export algorithmic mode to %s', async (format) => {
      const session = await manager.createSession(ThinkingMode.ALGORITHMIC);
      const thought = factory.createThought(createThought({
        mode: 'algorithmic',
        thought: 'Algorithm analysis',
        algorithmName: 'QuickSort',
        designPattern: 'divide-and-conquer',
        complexityAnalysis: {
          timeComplexity: 'O(n log n)',
          spaceComplexity: 'O(log n)',
          bestCase: 'O(n log n)',
          averageCase: 'O(n log n)',
          worstCase: 'O(n^2)',
        },
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, format);
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-058: Synthesis mode export with sources
  // ===========================================================================
  describe('T-EXP-058: Synthesis Mode Export', () => {
    it.each(formats)('should export synthesis mode to %s', async (format) => {
      const session = await manager.createSession(ThinkingMode.SYNTHESIS);
      const thought = factory.createThought(createThought({
        mode: 'synthesis',
        thought: 'Literature synthesis',
        sources: [
          { id: 'src1', title: 'Paper A', type: 'journal', year: 2023, relevance: 0.9 },
          { id: 'src2', title: 'Paper B', type: 'conference', year: 2022, relevance: 0.85 },
        ],
        themes: [
          { id: 'theme1', name: 'Main Theme', strength: 0.8, sourceIds: ['src1', 'src2'] },
        ],
        gaps: [
          { id: 'gap1', description: 'Research gap identified', type: 'empirical', importance: 'significant' },
        ],
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, format);
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-059: Argumentation mode export with Toulmin structure
  // ===========================================================================
  describe('T-EXP-059: Argumentation Mode Export', () => {
    it.each(formats)('should export argumentation mode to %s', async (format) => {
      const session = await manager.createSession(ThinkingMode.ARGUMENTATION);
      const thought = factory.createThought(createThought({
        mode: 'argumentation',
        thought: 'Building argument',
        claims: [
          { id: 'c1', statement: 'Main claim', type: 'policy', strength: 'strong' },
        ],
        grounds: [
          { id: 'g1', content: 'Supporting evidence', type: 'empirical', reliability: 0.9 },
        ],
        warrants: [
          { id: 'w1', statement: 'Because X leads to Y', type: 'causal', claimId: 'c1', groundsIds: ['g1'] },
        ],
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, format);
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-060: Critique mode export with Socratic questions
  // ===========================================================================
  describe('T-EXP-060: Critique Mode Export', () => {
    it.each(formats)('should export critique mode to %s', async (format) => {
      const session = await manager.createSession(ThinkingMode.CRITIQUE);
      const thought = factory.createThought(createThought({
        mode: 'critique',
        thought: 'Critical analysis',
        critiquedWork: {
          title: 'Research Paper',
          authors: ['Author A'],
          type: 'paper',
          year: 2023,
        },
        strengths: ['Clear methodology', 'Large sample size'],
        weaknesses: ['Limited scope', 'Missing controls'],
        suggestions: ['Expand to other domains'],
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, format);
      expect(result).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-061: Analysis mode export with codes
  // ===========================================================================
  describe('T-EXP-061: Analysis Mode Export', () => {
    it.each(formats)('should export analysis mode to %s', async (format) => {
      const session = await manager.createSession(ThinkingMode.ANALYSIS);
      const thought = factory.createThought(createThought({
        mode: 'analysis',
        thought: 'Qualitative analysis',
        methodology: 'thematic_analysis',
        codes: [
          { id: 'code1', label: 'Theme A', type: 'descriptive', frequency: 15 },
          { id: 'code2', label: 'Theme B', type: 'in_vivo', frequency: 8 },
        ],
        categories: ['Category 1', 'Category 2'],
        memos: [
          { id: 'memo1', content: 'Analytical note', type: 'analytical' },
        ],
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, format);
      expect(result).toBeDefined();
    });
  });
});
