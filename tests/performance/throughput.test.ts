/**
 * Throughput Performance Tests
 *
 * Tests T-PRF-006 through T-PRF-010: Performance tests for
 * sustained throughput and concurrent operations.
 *
 * Phase 11 Sprint 11: Integration Scenarios & Performance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../src/session/manager.js';
import { ThoughtFactory } from '../../src/services/ThoughtFactory.js';
import { ExportService } from '../../src/services/ExportService.js';
import { ThinkingMode } from '../../src/types/core.js';
import type { ThinkingToolInput } from '../../src/tools/thinking.js';

describe('Throughput Performance Tests', () => {
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
      totalThoughts: 100,
      nextThoughtNeeded: true,
      mode: 'sequential',
      ...overrides,
    } as ThinkingToolInput;
  }

  // ===========================================================================
  // T-PRF-006: 100 thoughts/second sustained
  // ===========================================================================
  describe('T-PRF-006: 100 Thoughts Per Second', () => {
    it('should sustain 100 thoughts per second', async () => {
      const session = await manager.createSession();
      const targetCount = 100;

      const start = performance.now();
      for (let i = 1; i <= targetCount; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: targetCount,
          nextThoughtNeeded: i < targetCount,
        }), session.id);
        await manager.addThought(session.id, thought);
      }
      const duration = performance.now() - start;

      const thoughtsPerSecond = (targetCount / duration) * 1000;
      expect(thoughtsPerSecond).toBeGreaterThanOrEqual(100);
    });

    it('should maintain throughput with varying content sizes', async () => {
      const session = await manager.createSession();
      const targetCount = 50;

      const start = performance.now();
      for (let i = 1; i <= targetCount; i++) {
        const contentSize = (i % 10) * 100 + 50;
        const thought = factory.createThought(createValidInput({
          thought: 'X'.repeat(contentSize),
          thoughtNumber: i,
          totalThoughts: targetCount,
          nextThoughtNeeded: i < targetCount,
        }), session.id);
        await manager.addThought(session.id, thought);
      }
      const duration = performance.now() - start;

      const thoughtsPerSecond = (targetCount / duration) * 1000;
      expect(thoughtsPerSecond).toBeGreaterThanOrEqual(50);
    });
  });

  // ===========================================================================
  // T-PRF-007: 10 concurrent sessions
  // ===========================================================================
  describe('T-PRF-007: 10 Concurrent Sessions', () => {
    it('should handle 10 concurrent sessions efficiently', async () => {
      const sessions: { id: string }[] = [];

      // Create 10 sessions
      const createStart = performance.now();
      for (let i = 0; i < 10; i++) {
        sessions.push(await manager.createSession());
      }
      const createDuration = performance.now() - createStart;
      expect(createDuration).toBeLessThan(100);

      // Add thoughts to all sessions
      const thoughtStart = performance.now();
      for (let round = 1; round <= 5; round++) {
        for (const session of sessions) {
          const thought = factory.createThought(createValidInput({
            thought: `Round ${round} thought`,
            thoughtNumber: round,
            totalThoughts: 5,
            nextThoughtNeeded: round < 5,
          }), session.id);
          await manager.addThought(session.id, thought);
        }
      }
      const thoughtDuration = performance.now() - thoughtStart;

      // 50 thoughts total (10 sessions * 5 thoughts each)
      const throughput = (50 / thoughtDuration) * 1000;
      expect(throughput).toBeGreaterThanOrEqual(50);

      // Verify all sessions have correct content
      for (const session of sessions) {
        const updated = await manager.getSession(session.id);
        expect(updated?.thoughts).toHaveLength(5);
      }
    });

    it('should maintain isolation between concurrent sessions', async () => {
      const session1 = await manager.createSession();
      const session2 = await manager.createSession();

      // Add different content to each
      const thought1 = factory.createThought(createValidInput({
        thought: 'Session 1 content',
        thoughtNumber: 1,
      }), session1.id);
      await manager.addThought(session1.id, thought1);

      const thought2 = factory.createThought(createValidInput({
        thought: 'Session 2 different content',
        thoughtNumber: 1,
      }), session2.id);
      await manager.addThought(session2.id, thought2);

      const s1 = await manager.getSession(session1.id);
      const s2 = await manager.getSession(session2.id);

      expect(s1?.thoughts[0].content).toBe('Session 1 content');
      expect(s2?.thoughts[0].content).toBe('Session 2 different content');
    });
  });

  // ===========================================================================
  // T-PRF-008: 50 concurrent sessions
  // ===========================================================================
  describe('T-PRF-008: 50 Concurrent Sessions', () => {
    it('should handle 50 concurrent sessions', async () => {
      const sessions: { id: string }[] = [];

      // Create 50 sessions
      const createStart = performance.now();
      for (let i = 0; i < 50; i++) {
        sessions.push(await manager.createSession());
      }
      const createDuration = performance.now() - createStart;
      expect(createDuration).toBeLessThan(500);

      // Add 3 thoughts to each session
      const thoughtStart = performance.now();
      for (const session of sessions) {
        for (let i = 1; i <= 3; i++) {
          const thought = factory.createThought(createValidInput({
            thought: `Thought ${i}`,
            thoughtNumber: i,
            totalThoughts: 3,
            nextThoughtNeeded: i < 3,
          }), session.id);
          await manager.addThought(session.id, thought);
        }
      }
      const thoughtDuration = performance.now() - thoughtStart;

      // 150 thoughts total
      const throughput = (150 / thoughtDuration) * 1000;
      expect(throughput).toBeGreaterThanOrEqual(50);
    });

    it('should export 50 sessions efficiently', async () => {
      const sessions: { id: string }[] = [];

      // Create and populate sessions
      for (let i = 0; i < 50; i++) {
        const session = await manager.createSession();
        sessions.push(session);

        const thought = factory.createThought(createValidInput({
          thought: `Session ${i} thought`,
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      // Export all sessions
      const exportStart = performance.now();
      for (const session of sessions) {
        const updated = await manager.getSession(session.id);
        exportService.exportSession(updated!, 'json');
      }
      const exportDuration = performance.now() - exportStart;

      const exportsPerSecond = (50 / exportDuration) * 1000;
      expect(exportsPerSecond).toBeGreaterThanOrEqual(25);
    });
  });

  // ===========================================================================
  // T-PRF-009: Rapid mode switching
  // ===========================================================================
  describe('T-PRF-009: Rapid Mode Switching', () => {
    it('should handle rapid mode switches efficiently', async () => {
      const session = await manager.createSession();
      const modes = ['sequential', 'hybrid', 'mathematics', 'bayesian', 'causal',
        'inductive', 'deductive', 'abductive', 'temporal', 'gametheory'] as const;

      const switchCount = 100;

      const start = performance.now();
      for (let i = 0; i < switchCount; i++) {
        const mode = modes[i % modes.length];
        const thought = factory.createThought(createValidInput({
          mode,
          thought: `Mode ${mode} thought`,
          thoughtNumber: i + 1,
          totalThoughts: switchCount,
          nextThoughtNeeded: i < switchCount - 1,
        }), session.id);
        await manager.addThought(session.id, thought);
      }
      const duration = performance.now() - start;

      const switchesPerSecond = (switchCount / duration) * 1000;
      expect(switchesPerSecond).toBeGreaterThanOrEqual(50);
    });

    it('should maintain correctness during rapid switching', async () => {
      const session = await manager.createSession();
      const modes = ['sequential', 'mathematics', 'bayesian'] as const;

      for (let i = 0; i < 30; i++) {
        const mode = modes[i % modes.length];
        const thought = factory.createThought(createValidInput({
          mode,
          thought: `Thought ${i} in ${mode}`,
          thoughtNumber: i + 1,
          totalThoughts: 30,
          nextThoughtNeeded: i < 29,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(30);

      // Verify modes alternate correctly
      for (let i = 0; i < 30; i++) {
        const expectedMode = modes[i % modes.length];
        expect(updated?.thoughts[i].mode.toLowerCase()).toBe(expectedMode);
      }
    });
  });

  // ===========================================================================
  // T-PRF-010: Bulk export operations
  // ===========================================================================
  describe('T-PRF-010: Bulk Export Operations', () => {
    it('should export large session to all formats efficiently', async () => {
      const session = await manager.createSession();

      // Create large session
      for (let i = 1; i <= 100; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i} with sufficient content for meaningful export`,
          thoughtNumber: i,
          totalThoughts: 100,
          nextThoughtNeeded: i < 100,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      const updated = await manager.getSession(session.id);
      const formats = ['markdown', 'json', 'html', 'mermaid', 'dot', 'ascii'] as const;

      const start = performance.now();
      for (const format of formats) {
        exportService.exportSession(updated!, format);
      }
      const duration = performance.now() - start;

      // All 6 formats should complete in under 2 seconds
      expect(duration).toBeLessThan(2000);
    });

    it('should handle batch exports across sessions', async () => {
      const sessions: { id: string }[] = [];

      // Create 20 sessions with 10 thoughts each
      for (let s = 0; s < 20; s++) {
        const session = await manager.createSession();
        sessions.push(session);

        for (let i = 1; i <= 10; i++) {
          const thought = factory.createThought(createValidInput({
            thought: `Session ${s} Thought ${i}`,
            thoughtNumber: i,
            totalThoughts: 10,
            nextThoughtNeeded: i < 10,
          }), session.id);
          await manager.addThought(session.id, thought);
        }
      }

      // Export all to JSON
      const start = performance.now();
      const exports: string[] = [];
      for (const session of sessions) {
        const updated = await manager.getSession(session.id);
        exports.push(exportService.exportSession(updated!, 'json'));
      }
      const duration = performance.now() - start;

      expect(exports).toHaveLength(20);
      expect(duration).toBeLessThan(1000);
    });
  });
});
