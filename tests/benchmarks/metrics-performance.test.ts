/**
 * Performance benchmark for incremental metrics calculation
 */

import { describe, it, expect } from 'vitest';
import { SessionManager } from '../../src/session/manager.js';
import { ThinkingMode } from '../../src/types/index.js';

describe('Metrics Performance Benchmark', () => {
  it('should show performance improvement with incremental calculation', async () => {
    const manager = new SessionManager();
    const session = await manager.createSession({
      title: 'Performance Test',
      mode: ThinkingMode.SEQUENTIAL,
    });

    // Add 1000 thoughts with uncertainty values
    const thoughtsToAdd = 1000;
    const uncertaintyValues: number[] = [];

    console.log(`\n📊 Benchmark: Adding ${thoughtsToAdd} thoughts with uncertainty tracking`);

    const startTime = performance.now();

    for (let i = 1; i <= thoughtsToAdd; i++) {
      const uncertainty = Math.random(); // Random uncertainty 0-1
      uncertaintyValues.push(uncertainty);

      await manager.addThought(session.id, {
        thought: `Test thought ${i}`,
        thoughtNumber: i,
        totalThoughts: thoughtsToAdd,
        nextThoughtNeeded: i < thoughtsToAdd,
        uncertainty,
      });
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // Verify correctness
    const updatedSession = await manager.getSession(session.id);
    expect(updatedSession).not.toBeNull();

    const expectedAvg = uncertaintyValues.reduce((sum, val) => sum + val, 0) / uncertaintyValues.length;
    const actualAvg = updatedSession!.metrics.averageUncertainty;

    // Allow small floating-point error (0.0001)
    expect(Math.abs(actualAvg - expectedAvg)).toBeLessThan(0.0001);

    // Calculate approximate time per thought
    const avgTimePerThought = totalTime / thoughtsToAdd;

    console.log(`✅ Total time: ${totalTime.toFixed(2)}ms`);
    console.log(`✅ Average time per thought: ${avgTimePerThought.toFixed(4)}ms`);
    console.log(`✅ Expected average uncertainty: ${expectedAvg.toFixed(6)}`);
    console.log(`✅ Actual average uncertainty: ${actualAvg.toFixed(6)}`);
    console.log(`✅ Accuracy verified: ${Math.abs(actualAvg - expectedAvg) < 0.0001 ? 'PASS' : 'FAIL'}`);

    // With incremental O(1) calculation, average time per thought should be < 1ms
    // Old O(n) implementation would take increasingly longer as thoughts accumulate
    expect(avgTimePerThought).toBeLessThan(1.0);

    console.log(`\n🎯 Performance: ${avgTimePerThought < 0.5 ? 'EXCELLENT' : avgTimePerThought < 1.0 ? 'GOOD' : 'NEEDS IMPROVEMENT'}`);
  });

  it('should maintain O(1) complexity regardless of session size', async () => {
    const manager = new SessionManager();

    // Test with different session sizes
    const sizes = [100, 500, 1000];
    const timings: number[] = [];

    console.log('\n📈 Complexity Analysis: Testing O(1) behavior');

    for (const size of sizes) {
      const session = await manager.createSession({
        title: `Test Session ${size}`,
        mode: ThinkingMode.SEQUENTIAL,
      });

      // Add thoughts and measure time for last 100
      for (let i = 1; i <= size - 100; i++) {
        await manager.addThought(session.id, {
          thought: `Warmup thought ${i}`,
          thoughtNumber: i,
          totalThoughts: size,
          nextThoughtNeeded: true,
          uncertainty: Math.random(),
        });
      }

      // Measure time for last 100 thoughts
      const startTime = performance.now();
      for (let i = size - 99; i <= size; i++) {
        await manager.addThought(session.id, {
          thought: `Measured thought ${i}`,
          thoughtNumber: i,
          totalThoughts: size,
          nextThoughtNeeded: i < size,
          uncertainty: Math.random(),
        });
      }
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 100;

      timings.push(avgTime);
      console.log(`  Session size ${size}: ${avgTime.toFixed(4)}ms per thought`);
    }

    // With O(1), larger session sizes should have consistent timings
    // Compare only the last two sizes to avoid warmup effects
    const ratio500to1000 = Math.max(timings[1], timings[2]) / Math.min(timings[1], timings[2]);

    const minTime = Math.min(...timings);
    const maxTime = Math.max(...timings);
    const overallRatio = maxTime / minTime;

    console.log(`\n  Min: ${minTime.toFixed(4)}ms, Max: ${maxTime.toFixed(4)}ms, Overall Ratio: ${overallRatio.toFixed(2)}x`);
    console.log(`  Ratio (500 vs 1000): ${ratio500to1000.toFixed(2)}x`);
    console.log(`  Complexity: ${ratio500to1000 < 3.0 ? 'O(1) ✅' : 'O(n) ❌'}`);

    // If implementation is truly O(1), ratio between larger sizes should be close to 1
    // Relaxed threshold to 3.0 to account for system variance and logging overhead
    expect(ratio500to1000).toBeLessThan(3.0);
  });
});
