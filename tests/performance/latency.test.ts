/**
 * Latency Performance Tests
 *
 * Tests T-PRF-001 through T-PRF-005: Performance tests for
 * response time and latency benchmarks.
 *
 * Phase 11 Sprint 11: Integration Scenarios & Performance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../src/session/manager.js';
import { ThoughtFactory } from '../../src/services/ThoughtFactory.js';
import { ExportService } from '../../src/services/ExportService.js';
import { ThinkingMode } from '../../src/types/core.js';
import type { ThinkingToolInput } from '../../src/tools/thinking.js';

describe('Latency Performance Tests', () => {
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
      thought: 'Valid thought content for performance testing',
      thoughtNumber: 1,
      totalThoughts: 10,
      nextThoughtNeeded: true,
      mode: 'sequential',
      ...overrides,
    } as ThinkingToolInput;
  }

  // ===========================================================================
  // T-PRF-001: Single thought response time < 100ms
  // ===========================================================================
  describe('T-PRF-001: Single Thought Response Time', () => {
    it('should create single thought in under 100ms', async () => {
      const session = await manager.createSession();

      const start = performance.now();
      const thought = factory.createThought(createValidInput(), session.id);
      await manager.addThought(session.id, thought);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should create thought with complex content in under 100ms', async () => {
      const session = await manager.createSession();

      const start = performance.now();
      const thought = factory.createThought(createValidInput({
        mode: 'bayesian',
        thought: 'Complex Bayesian analysis with multiple factors',
        priorProbability: 0.5,
        evidence: ['Evidence 1', 'Evidence 2', 'Evidence 3'],
        posteriorProbability: 0.75,
      }), session.id);
      await manager.addThought(session.id, thought);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should maintain sub-100ms for various modes', async () => {
      const modes = ['sequential', 'hybrid', 'mathematics', 'bayesian', 'causal'] as const;

      for (const mode of modes) {
        const session = await manager.createSession();

        const start = performance.now();
        const thought = factory.createThought(createValidInput({ mode }), session.id);
        await manager.addThought(session.id, thought);
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(100);
      }
    });
  });

  // ===========================================================================
  // T-PRF-002: 10-thought session total time < 500ms
  // ===========================================================================
  describe('T-PRF-002: 10-Thought Session Time', () => {
    it('should create 10 thoughts in under 500ms', async () => {
      const session = await manager.createSession();

      const start = performance.now();
      for (let i = 1; i <= 10; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          nextThoughtNeeded: i < 10,
        }), session.id);
        await manager.addThought(session.id, thought);
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(500);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(10);
    });

    it('should maintain speed with mode switching', async () => {
      const session = await manager.createSession();
      const modes = ['sequential', 'hybrid', 'mathematics', 'bayesian', 'causal',
        'sequential', 'hybrid', 'mathematics', 'bayesian', 'causal'] as const;

      const start = performance.now();
      for (let i = 0; i < modes.length; i++) {
        const thought = factory.createThought(createValidInput({
          mode: modes[i],
          thought: `${modes[i]} thought`,
          thoughtNumber: i + 1,
          nextThoughtNeeded: i < 9,
        }), session.id);
        await manager.addThought(session.id, thought);
      }
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });

  // ===========================================================================
  // T-PRF-003: Export response time < 200ms
  // ===========================================================================
  describe('T-PRF-003: Export Response Time', () => {
    it('should export to JSON in under 200ms', async () => {
      const session = await manager.createSession();

      // Create a medium-sized session
      for (let i = 1; i <= 20; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i} with some content for testing export performance`,
          thoughtNumber: i,
          totalThoughts: 20,
          nextThoughtNeeded: i < 20,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const updated = await manager.getSession(session.id);

      const start = performance.now();
      exportService.exportSession(updated!, 'json');
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(200);
    });

    it('should export to markdown in under 200ms', async () => {
      const session = await manager.createSession();

      for (let i = 1; i <= 20; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 20,
          nextThoughtNeeded: i < 20,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const updated = await manager.getSession(session.id);

      const start = performance.now();
      exportService.exportSession(updated!, 'markdown');
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(200);
    });

    it('should export to all formats in under 200ms each', async () => {
      const session = await manager.createSession();

      for (let i = 1; i <= 10; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 10,
          nextThoughtNeeded: i < 10,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const updated = await manager.getSession(session.id);
      const formats = ['markdown', 'json', 'html', 'mermaid', 'dot', 'ascii'] as const;

      for (const format of formats) {
        const start = performance.now();
        exportService.exportSession(updated!, format);
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(200);
      }
    });
  });

  // ===========================================================================
  // T-PRF-004: Mode switch response time < 50ms
  // ===========================================================================
  describe('T-PRF-004: Mode Switch Response Time', () => {
    it('should switch modes in under 50ms', async () => {
      const session = await manager.createSession();

      const thought1 = factory.createThought(createValidInput({
        mode: 'sequential',
        thought: 'Sequential',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, thought1);

      const start = performance.now();
      const thought2 = factory.createThought(createValidInput({
        mode: 'mathematics',
        thought: 'Mathematics',
        thoughtNumber: 2,
      }), session.id);
      await manager.addThought(session.id, thought2);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should handle rapid mode switches', async () => {
      const session = await manager.createSession();
      const modes = ['sequential', 'hybrid', 'mathematics', 'bayesian', 'causal'] as const;

      // Warm up
      const warmup = factory.createThought(createValidInput({
        mode: 'sequential',
        thought: 'Initial',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, warmup);

      // Test rapid switches
      const durations: number[] = [];
      for (let i = 0; i < modes.length; i++) {
        const start = performance.now();
        const thought = factory.createThought(createValidInput({
          mode: modes[i],
          thought: `Switch to ${modes[i]}`,
          thoughtNumber: i + 2,
          totalThoughts: modes.length + 1,
        }), session.id);
        await manager.addThought(session.id, thought);
        durations.push(performance.now() - start);
      }

      // All switches should be fast
      const maxDuration = Math.max(...durations);
      expect(maxDuration).toBeLessThan(50);
    });
  });

  // ===========================================================================
  // T-PRF-005: Session resume time < 100ms
  // ===========================================================================
  describe('T-PRF-005: Session Resume Time', () => {
    it('should retrieve session in under 100ms', async () => {
      const session = await manager.createSession();

      // Create some thoughts
      for (let i = 1; i <= 10; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 10,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      // Simulate resume by getting session
      const start = performance.now();
      const retrieved = await manager.getSession(session.id);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
      expect(retrieved?.thoughts).toHaveLength(10);
    });

    it('should add thought to existing session quickly', async () => {
      const session = await manager.createSession();

      // Create initial thoughts
      for (let i = 1; i <= 10; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 15,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      // Resume and add thought
      const start = performance.now();
      const thought = factory.createThought(createValidInput({
        thought: 'Resumed thought',
        thoughtNumber: 11,
        totalThoughts: 15,
      }), session.id);
      await manager.addThought(session.id, thought);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should handle session lookup with many sessions', async () => {
      // Create multiple sessions
      const sessions: { id: string }[] = [];
      for (let i = 0; i < 50; i++) {
        const s = await manager.createSession();
        sessions.push(s);
      }

      // Add thoughts to a target session
      const target = sessions[25];
      for (let i = 1; i <= 5; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 5,
        }), target.id);
        await manager.addThought(target.id, thought);
      }

      // Resume target session
      const start = performance.now();
      const retrieved = await manager.getSession(target.id);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
      expect(retrieved?.thoughts).toHaveLength(5);
    });
  });
});
