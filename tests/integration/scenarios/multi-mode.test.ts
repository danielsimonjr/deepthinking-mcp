/**
 * Multi-Mode Session Tests
 *
 * Tests T-INT-001 through T-INT-005: Integration tests for
 * mode switching and chaining across sessions.
 *
 * Phase 11 Sprint 11: Integration Scenarios & Performance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ExportService } from '../../../src/services/ExportService.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Multi-Mode Session Integration Tests', () => {
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
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'sequential',
      ...overrides,
    } as ThinkingToolInput;
  }

  // ===========================================================================
  // T-INT-001: Start sequential, switch to mathematics
  // ===========================================================================
  describe('T-INT-001: Sequential to Mathematics Switch', () => {
    it('should allow switching from sequential to mathematics mode', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.SEQUENTIAL });

      // Start with sequential
      const thought1 = factory.createThought(createValidInput({
        mode: 'sequential',
        thought: 'Initial problem analysis',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, thought1);

      // Switch to mathematics
      const thought2 = factory.createThought(createValidInput({
        mode: 'mathematics',
        thought: 'Mathematical formulation',
        thoughtNumber: 2,
      }), session.id);
      await manager.addThought(session.id, thought2);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(2);
      expect(updated?.thoughts[0].mode).toBe(ThinkingMode.SEQUENTIAL);
      expect(updated?.thoughts[1].mode).toBe(ThinkingMode.MATHEMATICS);
    });

    it('should preserve context across mode switch', async () => {
      const session = await manager.createSession();

      const thought1 = factory.createThought(createValidInput({
        mode: 'sequential',
        thought: 'Identifying variables: x, y, z',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, thought1);

      const thought2 = factory.createThought(createValidInput({
        mode: 'mathematics',
        thought: 'Formalizing relationship between x, y, z',
        thoughtNumber: 2,
        dependencies: ['thought-1'],
      }), session.id);
      await manager.addThought(session.id, thought2);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts[1].content).toContain('x, y, z');
    });

    it('should export multi-mode session correctly', async () => {
      const session = await manager.createSession();

      const thought1 = factory.createThought(createValidInput({
        mode: 'sequential',
        thought: 'Step 1',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, thought1);

      const thought2 = factory.createThought(createValidInput({
        mode: 'mathematics',
        thought: 'Step 2',
        thoughtNumber: 2,
        totalThoughts: 2,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought2);

      const updated = await manager.getSession(session.id);
      const json = exportService.exportSession(updated!, 'json');
      const parsed = JSON.parse(json);
      expect(parsed).toBeDefined();
    });
  });

  // ===========================================================================
  // T-INT-002: Start inductive, switch to deductive
  // ===========================================================================
  describe('T-INT-002: Inductive to Deductive Switch', () => {
    it('should transition from inductive to deductive reasoning', async () => {
      const session = await manager.createSession();

      // Inductive: gather observations
      const thought1 = factory.createThought(createValidInput({
        mode: 'inductive',
        thought: 'Observing patterns in data',
        thoughtNumber: 1,
        observations: ['A leads to B', 'A leads to B again'],
        generalization: 'A always leads to B',
      }), session.id);
      await manager.addThought(session.id, thought1);

      // Deductive: apply the pattern
      const thought2 = factory.createThought(createValidInput({
        mode: 'deductive',
        thought: 'Given A always leads to B, and we have A, therefore B',
        thoughtNumber: 2,
        premises: ['A always leads to B', 'We have A'],
        conclusion: 'B will occur',
      }), session.id);
      await manager.addThought(session.id, thought2);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(2);
      expect(updated?.thoughts[0].mode).toBe(ThinkingMode.INDUCTIVE);
      expect(updated?.thoughts[1].mode).toBe(ThinkingMode.DEDUCTIVE);
    });

    it('should allow back-and-forth mode switching', async () => {
      const session = await manager.createSession();

      const thought1 = factory.createThought(createValidInput({ mode: 'inductive', thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, thought1);

      const thought2 = factory.createThought(createValidInput({ mode: 'deductive', thoughtNumber: 2 }), session.id);
      await manager.addThought(session.id, thought2);

      const thought3 = factory.createThought(createValidInput({ mode: 'inductive', thoughtNumber: 3 }), session.id);
      await manager.addThought(session.id, thought3);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(3);
    });
  });

  // ===========================================================================
  // T-INT-003: Hybrid mode with 3+ active modes
  // ===========================================================================
  describe('T-INT-003: Hybrid Mode with Multiple Active Modes', () => {
    it('should handle hybrid mode with multiple active submodes', async () => {
      const session = await manager.createSession();

      const thought = factory.createThought(createValidInput({
        mode: 'hybrid',
        thought: 'Combining inductive, deductive, and abductive reasoning',
        thoughtNumber: 1,
        activeModes: ['inductive', 'deductive', 'abductive'],
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(1);
      expect(updated?.thoughts[0].mode).toBe(ThinkingMode.HYBRID);
    });

    it('should support 5 active modes in hybrid', async () => {
      const session = await manager.createSession();

      const thought = factory.createThought(createValidInput({
        mode: 'hybrid',
        thought: 'Multi-faceted analysis',
        thoughtNumber: 1,
        activeModes: ['sequential', 'mathematics', 'causal', 'bayesian', 'temporal'],
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts[0]).toBeDefined();
    });

    it('should transition from hybrid to single mode', async () => {
      const session = await manager.createSession();

      const thought1 = factory.createThought(createValidInput({
        mode: 'hybrid',
        thought: 'Initial multi-mode analysis',
        thoughtNumber: 1,
        activeModes: ['causal', 'bayesian'],
      }), session.id);
      await manager.addThought(session.id, thought1);

      const thought2 = factory.createThought(createValidInput({
        mode: 'bayesian',
        thought: 'Focused Bayesian analysis',
        thoughtNumber: 2,
      }), session.id);
      await manager.addThought(session.id, thought2);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts[1].mode).toBe(ThinkingMode.BAYESIAN);
    });
  });

  // ===========================================================================
  // T-INT-004: Mode chain: abductive -> deductive -> synthesis
  // ===========================================================================
  describe('T-INT-004: Abductive-Deductive-Synthesis Chain', () => {
    it('should support full reasoning chain', async () => {
      const session = await manager.createSession();

      // Abductive: generate hypothesis
      const thought1 = factory.createThought(createValidInput({
        mode: 'abductive',
        thought: 'Observing unexpected pattern, hypothesizing cause',
        thoughtNumber: 1,
        observations: ['The system failed under load'],
        hypotheses: [
          { id: 'h1', explanation: 'Memory leak', score: 0.8 },
          { id: 'h2', explanation: 'CPU throttling', score: 0.6 },
        ],
      }), session.id);
      await manager.addThought(session.id, thought1);

      // Deductive: derive predictions from hypothesis
      const thought2 = factory.createThought(createValidInput({
        mode: 'deductive',
        thought: 'If memory leak, then memory usage should increase over time',
        thoughtNumber: 2,
        premises: ['Memory leak causes increasing memory usage'],
        conclusion: 'We should observe memory growth',
      }), session.id);
      await manager.addThought(session.id, thought2);

      // Synthesis: combine findings
      const thought3 = factory.createThought(createValidInput({
        mode: 'synthesis',
        thought: 'Synthesizing findings from multiple reasoning approaches',
        thoughtNumber: 3,
        sources: [
          { id: 's1', title: 'Hypothesis generation', type: 'analysis' },
          { id: 's2', title: 'Deductive predictions', type: 'analysis' },
        ],
        themes: [
          { id: 't1', name: 'Memory issues', sourceIds: ['s1', 's2'] },
        ],
      }), session.id);
      await manager.addThought(session.id, thought3);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(3);
      expect(updated?.thoughts[0].mode).toBe(ThinkingMode.ABDUCTIVE);
      expect(updated?.thoughts[1].mode).toBe(ThinkingMode.DEDUCTIVE);
      expect(updated?.thoughts[2].mode).toBe(ThinkingMode.SYNTHESIS);
    });
  });

  // ===========================================================================
  // T-INT-005: Full workflow: problem -> analysis -> solution
  // ===========================================================================
  describe('T-INT-005: Full Problem-Analysis-Solution Workflow', () => {
    it('should support complete problem-solving workflow', async () => {
      const session = await manager.createSession();

      // 1. Problem definition (sequential)
      const thought1 = factory.createThought(createValidInput({
        mode: 'sequential',
        thought: 'Defining the problem: System performance degradation',
        thoughtNumber: 1,
        stage: 'problem_definition',
      }), session.id);
      await manager.addThought(session.id, thought1);

      // 2. Causal analysis
      const thought2 = factory.createThought(createValidInput({
        mode: 'causal',
        thought: 'Analyzing causal factors',
        thoughtNumber: 2,
        nodes: [
          { id: 'n1', name: 'Load increase' },
          { id: 'n2', name: 'Memory pressure' },
          { id: 'n3', name: 'Performance drop' },
        ],
        edges: [
          { from: 'n1', to: 'n2' },
          { from: 'n2', to: 'n3' },
        ],
      }), session.id);
      await manager.addThought(session.id, thought2);

      // 3. Bayesian analysis for likelihood
      const thought3 = factory.createThought(createValidInput({
        mode: 'bayesian',
        thought: 'Evaluating probability of memory being root cause',
        thoughtNumber: 3,
        priorProbability: 0.5,
        evidence: ['Memory usage 90%'],
        posteriorProbability: 0.8,
      }), session.id);
      await manager.addThought(session.id, thought3);

      // 4. Solution synthesis
      const thought4 = factory.createThought(createValidInput({
        mode: 'synthesis',
        thought: 'Synthesizing solution: Memory optimization needed',
        thoughtNumber: 4,
        themes: [
          { id: 't1', name: 'Root cause: Memory', consensus: 'strong' },
        ],
      }), session.id);
      await manager.addThought(session.id, thought4);

      // 5. Engineering implementation
      const thought5 = factory.createThought(createValidInput({
        mode: 'engineering',
        thought: 'Engineering solution: Implement memory pooling',
        thoughtNumber: 5,
        totalThoughts: 5,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought5);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(5);

      // Verify mode progression
      const modes = updated?.thoughts.map(t => t.mode);
      expect(modes).toContain(ThinkingMode.SEQUENTIAL);
      expect(modes).toContain(ThinkingMode.CAUSAL);
      expect(modes).toContain(ThinkingMode.BAYESIAN);
      expect(modes).toContain(ThinkingMode.SYNTHESIS);
      expect(modes).toContain(ThinkingMode.ENGINEERING);
    });

    it('should export full workflow to all formats', async () => {
      const session = await manager.createSession();

      const thought1 = factory.createThought(createValidInput({ mode: 'sequential', thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, thought1);

      const thought2 = factory.createThought(createValidInput({ mode: 'causal', thoughtNumber: 2 }), session.id);
      await manager.addThought(session.id, thought2);

      const thought3 = factory.createThought(createValidInput({ mode: 'bayesian', thoughtNumber: 3, nextThoughtNeeded: false }), session.id);
      await manager.addThought(session.id, thought3);

      const updated = await manager.getSession(session.id);
      const formats = ['markdown', 'json', 'html', 'mermaid', 'dot'] as const;

      for (const format of formats) {
        expect(() => exportService.exportSession(updated!, format)).not.toThrow();
      }
    });
  });
});
