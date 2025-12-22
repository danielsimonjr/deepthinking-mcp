/**
 * Real-World Workflow Tests
 *
 * Tests T-INT-011 through T-INT-015: Integration tests for
 * practical, real-world reasoning workflows.
 *
 * Phase 11 Sprint 11: Integration Scenarios & Performance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ExportService } from '../../../src/services/ExportService.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Real-World Workflow Integration Tests', () => {
  let manager: SessionManager;
  let factory: ThoughtFactory;
  let exportService: ExportService;

  beforeEach(() => {
    manager = new SessionManager();
    factory = new ThoughtFactory();
    exportService = new ExportService();
  });

  function createValidInput(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Valid thought content',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'sequential',
      ...overrides,
    } as ThinkingToolInput;
  }

  // ===========================================================================
  // T-INT-011: Literature review workflow
  // ===========================================================================
  describe('T-INT-011: Literature Review Workflow', () => {
    it('should support complete literature review workflow', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.SYNTHESIS });

      // Step 1: Define research question
      const thought1 = factory.createThought(createValidInput({
        mode: 'sequential',
        thought: 'Research question: What factors influence software maintainability?',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, thought1);

      // Step 2: Source gathering
      const thought2 = factory.createThought(createValidInput({
        mode: 'synthesis',
        thought: 'Gathering and categorizing sources',
        thoughtNumber: 2,
        sources: [
          { id: 's1', title: 'Clean Code', authors: ['R. Martin'], year: 2008 },
          { id: 's2', title: 'Refactoring', authors: ['M. Fowler'], year: 2018 },
          { id: 's3', title: 'Design Patterns', authors: ['GoF'], year: 1994 },
        ],
      }), session.id);
      await manager.addThought(session.id, thought2);

      // Step 3: Theme extraction
      const thought3 = factory.createThought(createValidInput({
        mode: 'synthesis',
        thought: 'Extracting themes across sources',
        thoughtNumber: 3,
        themes: [
          { id: 't1', name: 'Code readability', sourceIds: ['s1', 's2'], consensus: 'strong' },
          { id: 't2', name: 'Modular design', sourceIds: ['s1', 's3'], consensus: 'strong' },
          { id: 't3', name: 'Testing practices', sourceIds: ['s2'], consensus: 'moderate' },
        ],
      }), session.id);
      await manager.addThought(session.id, thought3);

      // Step 4: Gap identification
      const thought4 = factory.createThought(createValidInput({
        mode: 'synthesis',
        thought: 'Identifying gaps in literature',
        thoughtNumber: 4,
        gaps: [
          { id: 'g1', description: 'Limited studies on AI-assisted maintainability', type: 'empirical', importance: 'significant' },
        ],
      }), session.id);
      await manager.addThought(session.id, thought4);

      // Step 5: Synthesis conclusion
      const thought5 = factory.createThought(createValidInput({
        mode: 'synthesis',
        thought: 'Final synthesis and recommendations',
        thoughtNumber: 5,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought5);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(5);
    });

    it('should export literature review to markdown', async () => {
      const session = await manager.createSession();

      const thought = factory.createThought(createValidInput({
        mode: 'synthesis',
        thought: 'Literature review on testing',
        thoughtNumber: 1,
        sources: [{ id: 's1', title: 'Test Source' }],
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const markdown = exportService.exportSession(updated!, 'markdown');
      expect(markdown).toBeDefined();
    });
  });

  // ===========================================================================
  // T-INT-012: Algorithm design workflow
  // ===========================================================================
  describe('T-INT-012: Algorithm Design Workflow', () => {
    it('should support algorithm design process', async () => {
      const session = await manager.createSession();

      // Step 1: Problem statement
      const thought1 = factory.createThought(createValidInput({
        mode: 'sequential',
        thought: 'Design an efficient sorting algorithm for nearly-sorted arrays',
        thoughtNumber: 1,
        stage: 'problem_definition',
      }), session.id);
      await manager.addThought(session.id, thought1);

      // Step 2: Algorithmic analysis
      const thought2 = factory.createThought(createValidInput({
        mode: 'algorithmic',
        thought: 'Analyzing algorithmic approaches',
        thoughtNumber: 2,
        algorithmName: 'Adaptive Sort',
        designPattern: 'divide-and-conquer',
        complexityAnalysis: {
          timeComplexity: 'O(n log n)',
          spaceComplexity: 'O(n)',
          bestCase: 'O(n)',
          worstCase: 'O(n log n)',
        },
      }), session.id);
      await manager.addThought(session.id, thought2);

      // Step 3: Mathematical proof
      const thought3 = factory.createThought(createValidInput({
        mode: 'mathematics',
        thought: 'Proving correctness of the algorithm',
        thoughtNumber: 3,
        proofStrategy: {
          type: 'induction',
          steps: [
            'Base case: array of size 1 is sorted',
            'Inductive step: if works for n, prove for n+1',
          ],
        },
      }), session.id);
      await manager.addThought(session.id, thought3);

      // Step 4: Engineering implementation
      const thought4 = factory.createThought(createValidInput({
        mode: 'engineering',
        thought: 'Implementation considerations and trade-offs',
        thoughtNumber: 4,
        tradeStudy: {
          criteria: ['Time complexity', 'Space usage', 'Cache efficiency'],
          options: ['Insertion sort hybrid', 'Timsort variant'],
        },
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought4);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(4);
    });
  });

  // ===========================================================================
  // T-INT-013: Causal analysis workflow
  // ===========================================================================
  describe('T-INT-013: Causal Analysis Workflow', () => {
    it('should support causal investigation workflow', async () => {
      const session = await manager.createSession();

      // Step 1: Observation
      const thought1 = factory.createThought(createValidInput({
        mode: 'sequential',
        thought: 'Observing: Customer churn increased 20% this quarter',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, thought1);

      // Step 2: Causal graph construction
      const thought2 = factory.createThought(createValidInput({
        mode: 'causal',
        thought: 'Building causal graph of potential factors',
        thoughtNumber: 2,
        nodes: [
          { id: 'price', name: 'Price Increase' },
          { id: 'support', name: 'Support Quality' },
          { id: 'competitor', name: 'Competitor Entry' },
          { id: 'churn', name: 'Customer Churn' },
        ],
        edges: [
          { from: 'price', to: 'churn', strength: 0.6 },
          { from: 'support', to: 'churn', strength: 0.3 },
          { from: 'competitor', to: 'churn', strength: 0.5 },
        ],
      }), session.id);
      await manager.addThought(session.id, thought2);

      // Step 3: Counterfactual analysis
      const thought3 = factory.createThought(createValidInput({
        mode: 'counterfactual',
        thought: 'What if we had not increased prices?',
        thoughtNumber: 3,
        counterfactual: {
          actual: 'Price increased 15%',
          hypothetical: 'Price remained same',
          consequence: 'Churn would be ~12% instead of 20%',
        },
      }), session.id);
      await manager.addThought(session.id, thought3);

      // Step 4: Intervention recommendation
      const thought4 = factory.createThought(createValidInput({
        mode: 'causal',
        thought: 'Recommending interventions',
        thoughtNumber: 4,
        interventions: [
          { node: 'price', value: 'rollback', effect: 'reduce churn by 8%' },
          { node: 'support', value: 'improve', effect: 'reduce churn by 3%' },
        ],
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought4);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(4);
      expect(updated?.thoughts[1].mode).toBe(ThinkingMode.CAUSAL);
      expect(updated?.thoughts[2].mode).toBe(ThinkingMode.COUNTERFACTUAL);
    });
  });

  // ===========================================================================
  // T-INT-014: Decision-making workflow
  // ===========================================================================
  describe('T-INT-014: Decision-Making Workflow', () => {
    it('should support structured decision-making process', async () => {
      const session = await manager.createSession();

      // Step 1: Decision framing
      const thought1 = factory.createThought(createValidInput({
        mode: 'sequential',
        thought: 'Decision: Should we migrate to a microservices architecture?',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, thought1);

      // Step 2: Bayesian probability assessment
      const thought2 = factory.createThought(createValidInput({
        mode: 'bayesian',
        thought: 'Assessing probability of success',
        thoughtNumber: 2,
        priorProbability: 0.5,
        evidence: ['Team has microservices experience', 'Current system is modular'],
        posteriorProbability: 0.7,
      }), session.id);
      await manager.addThought(session.id, thought2);

      // Step 3: Game theory analysis
      const thought3 = factory.createThought(createValidInput({
        mode: 'gametheory',
        thought: 'Analyzing strategic implications',
        thoughtNumber: 3,
        players: [
          { id: 'company', name: 'Our Company', isRational: true, availableStrategies: ['migrate', 'stay'] },
          { id: 'competitor', name: 'Competitor', isRational: true, availableStrategies: ['aggressive', 'passive'] },
        ],
        strategies: [
          { id: 's1', playerId: 'company', name: 'Migrate', description: 'Full migration', isPure: true },
          { id: 's2', playerId: 'company', name: 'Stay', description: 'Keep monolith', isPure: true },
        ],
      }), session.id);
      await manager.addThought(session.id, thought3);

      // Step 4: Engineering trade study
      const thought4 = factory.createThought(createValidInput({
        mode: 'engineering',
        thought: 'Technical trade study',
        thoughtNumber: 4,
        tradeStudy: {
          criteria: ['Scalability', 'Complexity', 'Cost', 'Time to market'],
          options: ['Full microservices', 'Hybrid approach', 'Modular monolith'],
          weights: { Scalability: 0.3, Complexity: 0.2, Cost: 0.3, 'Time to market': 0.2 },
        },
      }), session.id);
      await manager.addThought(session.id, thought4);

      // Step 5: Final recommendation
      const thought5 = factory.createThought(createValidInput({
        mode: 'synthesis',
        thought: 'Synthesizing decision recommendation',
        thoughtNumber: 5,
        themes: [
          { id: 't1', name: 'Hybrid approach recommended', consensus: 'strong' },
        ],
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought5);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(5);
    });
  });

  // ===========================================================================
  // T-INT-015: Proof construction workflow
  // ===========================================================================
  describe('T-INT-015: Proof Construction Workflow', () => {
    it('should support mathematical proof construction', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.MATHEMATICS });

      // Step 1: State theorem
      const thought1 = factory.createThought(createValidInput({
        mode: 'mathematics',
        thought: 'Theorem: The sum of angles in a triangle equals 180 degrees',
        thoughtNumber: 1,
        theorem: 'Sum of angles in triangle = 180°',
      }), session.id);
      await manager.addThought(session.id, thought1);

      // Step 2: Identify proof strategy
      const thought2 = factory.createThought(createValidInput({
        mode: 'mathematics',
        thought: 'Choosing direct proof using parallel lines',
        thoughtNumber: 2,
        proofStrategy: {
          type: 'direct',
          steps: [
            'Draw line parallel to base through opposite vertex',
            'Use alternate interior angles',
            'Sum angles on straight line',
          ],
        },
      }), session.id);
      await manager.addThought(session.id, thought2);

      // Step 3: Formal proof steps
      const thought3 = factory.createThought(createValidInput({
        mode: 'mathematics',
        thought: 'Executing proof',
        thoughtNumber: 3,
        proofSteps: [
          { stepNumber: 1, statement: 'Let ABC be a triangle', justification: 'Given' },
          { stepNumber: 2, statement: 'Draw line DE through A parallel to BC', justification: 'Parallel postulate' },
          { stepNumber: 3, statement: 'Angle DAB = Angle ABC', justification: 'Alternate interior angles' },
          { stepNumber: 4, statement: 'Angle EAC = Angle ACB', justification: 'Alternate interior angles' },
          { stepNumber: 5, statement: 'DAB + BAC + EAC = 180°', justification: 'Angles on straight line' },
        ],
      }), session.id);
      await manager.addThought(session.id, thought3);

      // Step 4: Conclusion
      const thought4 = factory.createThought(createValidInput({
        mode: 'mathematics',
        thought: 'Therefore ABC + BCA + CAB = 180° QED',
        thoughtNumber: 4,
        soundnessCheck: true,
        validityCheck: true,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought4);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(4);
    });

    it('should export proof to LaTeX', async () => {
      const session = await manager.createSession();

      const thought = factory.createThought(createValidInput({
        mode: 'mathematics',
        thought: 'Proof of Pythagorean theorem',
        thoughtNumber: 1,
        mathematicalModel: {
          latex: 'a^2 + b^2 = c^2',
          symbolic: 'a² + b² = c²',
        },
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const latex = exportService.exportSession(updated!, 'latex');
      expect(latex).toBeDefined();
    });
  });
});
