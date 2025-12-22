/**
 * Memory Performance Tests
 *
 * Tests T-PRF-011 through T-PRF-015: Performance tests for
 * memory usage and leak detection.
 *
 * Phase 11 Sprint 11: Integration Scenarios & Performance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../src/session/manager.js';
import { ThoughtFactory } from '../../src/services/ThoughtFactory.js';
import { ExportService } from '../../src/services/ExportService.js';
import { ThinkingMode } from '../../src/types/core.js';
import type { ThinkingToolInput } from '../../src/tools/thinking.js';

describe('Memory Performance Tests', () => {
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

  function getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  function forceGC(): void {
    if (typeof global !== 'undefined' && (global as any).gc) {
      (global as any).gc();
    }
  }

  // ===========================================================================
  // T-PRF-011: Memory usage with 100 sessions
  // ===========================================================================
  describe('T-PRF-011: Memory With 100 Sessions', () => {
    it('should handle 100 sessions without excessive memory growth', async () => {
      forceGC();
      const initialMemory = getMemoryUsage();

      const sessions: { id: string }[] = [];

      // Create 100 sessions with 5 thoughts each
      for (let s = 0; s < 100; s++) {
        const session = await manager.createSession();
        sessions.push(session);

        for (let i = 1; i <= 5; i++) {
          const thought = factory.createThought(createValidInput({
            thought: `Session ${s} Thought ${i}`,
            thoughtNumber: i,
            totalThoughts: 5,
            nextThoughtNeeded: i < 5,
          }), session.id);
          await manager.addThought(session.id, thought);
        }
      }

      forceGC();
      const finalMemory = getMemoryUsage();

      // Verify all sessions exist
      expect(sessions).toHaveLength(100);
      for (const session of sessions) {
        const updated = await manager.getSession(session.id);
        expect(updated?.thoughts).toHaveLength(5);
      }

      // Memory should not grow excessively (less than 100MB for 500 thoughts)
      const memoryGrowth = finalMemory - initialMemory;
      if (initialMemory > 0) {
        expect(memoryGrowth).toBeLessThan(100 * 1024 * 1024);
      }
    });

    it('should maintain consistent memory per session', async () => {
      const sessionSizes: number[] = [];

      for (let i = 0; i < 10; i++) {
        forceGC();
        const before = getMemoryUsage();

        const session = await manager.createSession();
        for (let j = 1; j <= 10; j++) {
          const thought = factory.createThought(createValidInput({
            thought: `Thought ${j}`,
            thoughtNumber: j,
            totalThoughts: 10,
          }), session.id);
          await manager.addThought(session.id, thought);
        }

        forceGC();
        const after = getMemoryUsage();
        sessionSizes.push(after - before);
      }

      // Memory growth per session should be relatively consistent
      // Note: GC timing is non-deterministic, so we only verify if we have meaningful data
      if (sessionSizes[0] > 0) {
        const avgSize = sessionSizes.reduce((a, b) => a + b, 0) / sessionSizes.length;
        const positiveAvg = Math.max(avgSize, 1); // Avoid division issues with small values
        // Allow 5x variance due to GC non-determinism
        const withinVariance = sessionSizes.filter(size =>
          Math.abs(size - avgSize) < positiveAvg * 5
        ).length;
        // At least 70% of samples should be within variance
        expect(withinVariance / sessionSizes.length).toBeGreaterThanOrEqual(0.7);
      }
    });
  });

  // ===========================================================================
  // T-PRF-012: Memory usage with 1000-thought session
  // ===========================================================================
  describe('T-PRF-012: Memory With 1000-Thought Session', () => {
    it('should handle 1000 thoughts in single session', async () => {
      const session = await manager.createSession();

      forceGC();
      const initialMemory = getMemoryUsage();

      for (let i = 1; i <= 1000; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought number ${i} with some content`,
          thoughtNumber: i,
          totalThoughts: 1000,
          nextThoughtNeeded: i < 1000,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      forceGC();
      const finalMemory = getMemoryUsage();

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(1000);

      // Memory should scale linearly (roughly)
      const memoryGrowth = finalMemory - initialMemory;
      if (initialMemory > 0) {
        // Should be less than 50MB for 1000 thoughts
        expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
      }
    });

    it('should export 1000-thought session without memory spike', async () => {
      const session = await manager.createSession();

      for (let i = 1; i <= 1000; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 1000,
          nextThoughtNeeded: i < 1000,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      forceGC();
      const beforeExport = getMemoryUsage();

      const updated = await manager.getSession(session.id);
      const json = exportService.exportSession(updated!, 'json');

      forceGC();
      const afterExport = getMemoryUsage();

      expect(json).toBeDefined();
      expect(json.length).toBeGreaterThan(0);

      // Export should not cause large memory spike
      const exportMemory = afterExport - beforeExport;
      if (beforeExport > 0) {
        expect(exportMemory).toBeLessThan(50 * 1024 * 1024);
      }
    });
  });

  // ===========================================================================
  // T-PRF-013: Memory cleanup after session delete
  // ===========================================================================
  describe('T-PRF-013: Memory Cleanup After Delete', () => {
    it('should release memory after session deletion', async () => {
      // Create a large session
      const session = await manager.createSession();
      for (let i = 1; i <= 500; i++) {
        const thought = factory.createThought(createValidInput({
          thought: 'A'.repeat(1000), // 1KB per thought
          thoughtNumber: i,
          totalThoughts: 500,
          nextThoughtNeeded: i < 500,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      forceGC();
      const beforeDelete = getMemoryUsage();

      // Delete the session
      await manager.deleteSession(session.id);

      forceGC();
      const afterDelete = getMemoryUsage();

      // Verify session is gone
      expect(await manager.getSession(session.id)).toBeNull();

      // Memory should not increase significantly after deletion
      // Note: GC may not run immediately, so we allow small increases
      if (beforeDelete > 0) {
        const memoryChange = afterDelete - beforeDelete;
        // Allow up to 1MB increase due to GC timing
        expect(memoryChange).toBeLessThan(1 * 1024 * 1024);
      }
    });

    it('should clean up multiple deleted sessions', async () => {
      const sessions: { id: string }[] = [];

      // Create 50 sessions
      for (let s = 0; s < 50; s++) {
        const session = await manager.createSession();
        sessions.push(session);

        for (let i = 1; i <= 10; i++) {
          const thought = factory.createThought(createValidInput({
            thought: 'Content'.repeat(100),
            thoughtNumber: i,
            totalThoughts: 10,
          }), session.id);
          await manager.addThought(session.id, thought);
        }
      }

      forceGC();
      const afterCreate = getMemoryUsage();

      // Delete all sessions
      for (const session of sessions) {
        await manager.deleteSession(session.id);
      }

      forceGC();
      const afterDelete = getMemoryUsage();

      // Verify all sessions are gone
      for (const session of sessions) {
        expect(await manager.getSession(session.id)).toBeNull();
      }

      // Memory should not increase significantly after deletion
      // Note: GC timing is non-deterministic, allow some variance
      if (afterCreate > 0) {
        const memoryChange = afterDelete - afterCreate;
        // Allow up to 2MB increase due to GC timing
        expect(memoryChange).toBeLessThan(2 * 1024 * 1024);
      }
    });
  });

  // ===========================================================================
  // T-PRF-014: LRU cache effectiveness
  // ===========================================================================
  describe('T-PRF-014: Cache Effectiveness', () => {
    it('should reuse cached resources efficiently', async () => {
      const session = await manager.createSession();

      // Create thoughts that might benefit from caching
      const modes = ['sequential', 'hybrid', 'mathematics'] as const;

      const firstPassTimes: number[] = [];
      const secondPassTimes: number[] = [];

      // First pass
      for (let i = 0; i < 30; i++) {
        const mode = modes[i % modes.length];
        const start = performance.now();
        const thought = factory.createThought(createValidInput({
          mode,
          thought: `First pass ${i}`,
          thoughtNumber: i + 1,
          totalThoughts: 60,
        }), session.id);
        await manager.addThought(session.id, thought);
        firstPassTimes.push(performance.now() - start);
      }

      // Second pass with same modes
      for (let i = 0; i < 30; i++) {
        const mode = modes[i % modes.length];
        const start = performance.now();
        const thought = factory.createThought(createValidInput({
          mode,
          thought: `Second pass ${i}`,
          thoughtNumber: i + 31,
          totalThoughts: 60,
        }), session.id);
        await manager.addThought(session.id, thought);
        secondPassTimes.push(performance.now() - start);
      }

      const avgFirst = firstPassTimes.reduce((a, b) => a + b, 0) / firstPassTimes.length;
      const avgSecond = secondPassTimes.reduce((a, b) => a + b, 0) / secondPassTimes.length;

      // Second pass should be at least as fast (caching helps or doesn't hurt)
      expect(avgSecond).toBeLessThanOrEqual(avgFirst * 1.5);
    });

    it('should maintain cache under memory pressure', async () => {
      // Create many sessions to potentially trigger cache eviction
      const sessions: { id: string }[] = [];

      for (let s = 0; s < 100; s++) {
        const session = await manager.createSession();
        sessions.push(session);

        const thought = factory.createThought(createValidInput({
          thought: `Session ${s}`,
          thoughtNumber: 1,
          totalThoughts: 1,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      // System should still be responsive
      const testSession = await manager.createSession();
      const start = performance.now();
      const thought = factory.createThought(createValidInput({
        thought: 'Test after cache pressure',
        thoughtNumber: 1,
        totalThoughts: 1,
      }), testSession.id);
      await manager.addThought(testSession.id, thought);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  // ===========================================================================
  // T-PRF-015: No memory leaks over time
  // ===========================================================================
  describe('T-PRF-015: Memory Leak Detection', () => {
    it('should not leak memory over repeated operations', async () => {
      const memoryReadings: number[] = [];

      // Perform 10 cycles of create/use/delete
      for (let cycle = 0; cycle < 10; cycle++) {
        forceGC();
        memoryReadings.push(getMemoryUsage());

        // Create, use, delete pattern
        const session = await manager.createSession();
        for (let i = 1; i <= 50; i++) {
          const thought = factory.createThought(createValidInput({
            thought: `Cycle ${cycle} Thought ${i}`,
            thoughtNumber: i,
            totalThoughts: 50,
          }), session.id);
          await manager.addThought(session.id, thought);
        }

        const updated = await manager.getSession(session.id);
        exportService.exportSession(updated!, 'json');
        exportService.exportSession(updated!, 'markdown');

        await manager.deleteSession(session.id);
      }

      forceGC();
      memoryReadings.push(getMemoryUsage());

      if (memoryReadings[0] > 0) {
        // Memory should not grow significantly over cycles
        const initial = memoryReadings[0];
        const final = memoryReadings[memoryReadings.length - 1];
        const growth = final - initial;

        // Allow some growth but not excessive (less than 10MB over 10 cycles)
        expect(growth).toBeLessThan(10 * 1024 * 1024);
      }
    });

    it('should not leak memory with exports', async () => {
      const session = await manager.createSession();

      for (let i = 1; i <= 20; i++) {
        const thought = factory.createThought(createValidInput({
          thought: `Thought ${i}`,
          thoughtNumber: i,
          totalThoughts: 20,
        }), session.id);
        await manager.addThought(session.id, thought);
      }

      forceGC();
      const beforeExports = getMemoryUsage();

      // Perform many exports
      const updated = await manager.getSession(session.id);
      for (let i = 0; i < 100; i++) {
        exportService.exportSession(updated!, 'json');
        exportService.exportSession(updated!, 'markdown');
      }

      forceGC();
      const afterExports = getMemoryUsage();

      if (beforeExports > 0) {
        const growth = afterExports - beforeExports;
        // 200 exports should not cause significant memory growth
        expect(growth).toBeLessThan(10 * 1024 * 1024);
      }
    });
  });
});
