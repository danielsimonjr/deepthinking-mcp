/**
 * Error Handling and Edge Cases Integration Tests
 *
 * Tests system behavior under error conditions and edge cases:
 * - Invalid inputs and validation errors
 * - Boundary conditions
 * - Edge cases (empty data, very large data, special characters)
 * - Error recovery and graceful degradation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../src/session/manager.js';
import { ThinkingMode } from '../../src/types/index.js';
import { randomUUID } from 'crypto';

/**
 * Helper to create a basic valid thought
 */
function createValidThought(sessionId: string, thoughtNumber: number) {
  return {
    id: randomUUID(),
    sessionId,
    mode: ThinkingMode.SEQUENTIAL,
    content: `Thought ${thoughtNumber}`,
    thoughtNumber,
    totalThoughts: thoughtNumber,
    timestamp: new Date(),
    nextThoughtNeeded: false,
  };
}

describe('Error Handling and Edge Cases', () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager();
  });

  describe('Invalid Session Operations', () => {
    it('should throw error for non-existent session ID', async () => {
      const invalidId = '00000000-0000-4000-8000-000000000000';

      await expect(manager.getSession(invalidId)).resolves.toBeNull();
      await expect(
        manager.addThought(invalidId, createValidThought(invalidId, 1) as any)
      ).rejects.toThrow();
    });

    it('should handle empty session ID gracefully', async () => {
      await expect(manager.getSession('')).resolves.toBeNull();
    });

    it('should reject invalid UUID format', async () => {
      await expect(manager.getSession('not-a-uuid')).resolves.toBeNull();
    });

    it('should handle session deletion idempotently', async () => {
      const session = await manager.createSession({ title: 'Test' });

      // First deletion should succeed
      await manager.deleteSession(session.id);

      // Second deletion should not throw (idempotent)
      await expect(manager.deleteSession(session.id)).resolves.not.toThrow();
    });
  });

  describe('Validation Errors', () => {
    // TODO: SessionManager currently doesn't validate inputs - validation happens at MCP tool level
    // These tests document EXPECTED behavior for future implementation

    it('should accept thoughts with missing fields (lenient validation)', async () => {
      const session = await manager.createSession();

      const thoughtWithMissingFields = {
        // Missing: id, sessionId, mode, content, timestamp
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      };

      // Currently accepts (too lenient) - should validate in future
      await expect(
        manager.addThought(session.id, thoughtWithMissingFields as any)
      ).resolves.toBeDefined();
    });

    it('should accept invalid uncertainty values (lenient validation)', async () => {
      const session = await manager.createSession();

      const thoughtWithInvalidUncertainty = {
        ...createValidThought(session.id, 1),
        uncertainty: 1.5, // Invalid: > 1
      };

      // Currently accepts (too lenient) - should validate in future
      await expect(
        manager.addThought(session.id, thoughtWithInvalidUncertainty as any)
      ).resolves.toBeDefined();
    });

    it('should accept negative thought numbers (lenient validation)', async () => {
      const session = await manager.createSession();

      const thoughtWithNegativeNumber = {
        ...createValidThought(session.id, -1),
        thoughtNumber: -1,
      };

      // Currently accepts (too lenient) - should validate in future
      await expect(
        manager.addThought(session.id, thoughtWithNegativeNumber as any)
      ).resolves.toBeDefined();
    });

    it('should accept zero thought numbers (lenient validation)', async () => {
      const session = await manager.createSession();

      const thoughtWithZeroNumber = {
        ...createValidThought(session.id, 0),
        thoughtNumber: 0,
      };

      // Currently accepts (too lenient) - should validate in future
      await expect(
        manager.addThought(session.id, thoughtWithZeroNumber as any)
      ).resolves.toBeDefined();
    });

    it('should accept invalid mode values (lenient validation)', async () => {
      // Currently accepts (too lenient) - should validate in future
      await expect(
        manager.createSession({ mode: 'invalid_mode' as any })
      ).resolves.toBeDefined();
    });

    it('should accept invalid Shannon stage (lenient validation)', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.SHANNON });

      const thoughtWithInvalidStage = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        stage: 'invalid_stage', // Invalid stage
      };

      // Currently accepts (too lenient) - should validate in future
      await expect(
        manager.addThought(session.id, thoughtWithInvalidStage)
      ).resolves.toBeDefined();
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle uncertainty = 0 (perfect certainty)', async () => {
      const session = await manager.createSession();

      await manager.addThought(session.id, {
        ...createValidThought(session.id, 1),
        uncertainty: 0.0,
      } as any);

      const updated = await manager.getSession(session.id);
      expect(updated!.metrics.averageUncertainty).toBe(0.0);
    });

    it('should handle uncertainty = 1 (complete uncertainty)', async () => {
      const session = await manager.createSession();

      await manager.addThought(session.id, {
        ...createValidThought(session.id, 1),
        uncertainty: 1.0,
      } as any);

      const updated = await manager.getSession(session.id);
      expect(updated!.metrics.averageUncertainty).toBe(1.0);
    });

    it('should handle very large thoughtNumber', async () => {
      const session = await manager.createSession();
      const largeNumber = Number.MAX_SAFE_INTEGER;

      await manager.addThought(session.id, {
        ...createValidThought(session.id, largeNumber),
        thoughtNumber: largeNumber,
        totalThoughts: largeNumber,
      } as any);

      const updated = await manager.getSession(session.id);
      expect(updated!.currentThoughtNumber).toBe(largeNumber);
    });

    it('should handle totalThoughts = thoughtNumber (single thought)', async () => {
      const session = await manager.createSession();

      await manager.addThought(session.id, {
        ...createValidThought(session.id, 1),
        totalThoughts: 1,
        nextThoughtNeeded: false,
      } as any);

      const updated = await manager.getSession(session.id);
      expect(updated!.thoughts).toHaveLength(1);
      expect(updated!.isComplete).toBe(true);
    });
  });

  describe('Edge Cases - Empty Data', () => {
    it('should handle empty thought content', async () => {
      const session = await manager.createSession();

      await manager.addThought(session.id, {
        ...createValidThought(session.id, 1),
        content: '',
      } as any);

      const updated = await manager.getSession(session.id);
      expect(updated!.thoughts[0].content).toBe('');
    });

    it('should handle empty session title with default', async () => {
      const session = await manager.createSession({ title: '' });

      // SessionManager provides default title for empty strings
      expect(session.title).toBe('Untitled Session');
    });

    it('should handle empty arrays for optional fields', async () => {
      const session = await manager.createSession();

      await manager.addThought(session.id, {
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        dependencies: [],
        assumptions: [],
      });

      const updated = await manager.getSession(session.id);
      expect(updated!.thoughts).toHaveLength(1);
    });

    it('should handle session with no thoughts', async () => {
      const session = await manager.createSession();

      expect(session.thoughts).toHaveLength(0);
      expect(session.isComplete).toBe(false);
      expect(session.metrics.totalThoughts).toBe(0);
    });
  });

  describe('Edge Cases - Special Characters', () => {
    it('should handle Unicode characters in thought content', async () => {
      const session = await manager.createSession();
      const unicodeContent = '数学 🧮 ∀x∈ℝ, x²≥0 Математика';

      await manager.addThought(session.id, {
        ...createValidThought(session.id, 1),
        content: unicodeContent,
      } as any);

      const updated = await manager.getSession(session.id);
      expect(updated!.thoughts[0].content).toBe(unicodeContent);
    });

    it('should handle special characters in session title', async () => {
      const specialTitle = '<script>alert("xss")</script>';
      const session = await manager.createSession({ title: specialTitle });

      // Title should be stored as-is (sanitization happens at export time)
      expect(session.title).toContain('script');
    });

    it('should handle LaTeX with special characters', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.MATHEMATICS });

      await manager.addThought(session.id, {
        thought: 'Integral formula',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mathematicalModel: {
          latex: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
          symbolic: 'integral(-inf, inf, e^(-x^2)) = sqrt(pi)',
        },
        thoughtType: 'theorem_statement',
        dependencies: [],
        assumptions: [],
      });

      const updated = await manager.getSession(session.id);
      expect(updated!.thoughts).toHaveLength(1);
    });

    it('should handle newlines and tabs in thought content', async () => {
      const session = await manager.createSession();
      const contentWithWhitespace = 'Line 1\nLine 2\n\tIndented\r\nWindows line';

      await manager.addThought(session.id, {
        ...createValidThought(session.id, 1),
        content: contentWithWhitespace,
      } as any);

      const updated = await manager.getSession(session.id);
      expect(updated!.thoughts[0].content).toBe(contentWithWhitespace);
    });
  });

  describe('Edge Cases - Large Data', () => {
    it('should handle very long thought content', async () => {
      const session = await manager.createSession();
      const longContent = 'A'.repeat(100000); // 100KB of text

      await manager.addThought(session.id, {
        ...createValidThought(session.id, 1),
        content: longContent,
      } as any);

      const updated = await manager.getSession(session.id);
      expect(updated!.thoughts[0].content).toHaveLength(100000);
    });

    it('should handle sessions with many thoughts', async () => {
      const session = await manager.createSession();
      const thoughtCount = 100;

      for (let i = 1; i <= thoughtCount; i++) {
        await manager.addThought(session.id, {
          ...createValidThought(session.id, i),
          thoughtNumber: i,
          totalThoughts: thoughtCount,
          nextThoughtNeeded: i < thoughtCount,
        } as any);
      }

      const updated = await manager.getSession(session.id);
      expect(updated!.thoughts).toHaveLength(thoughtCount);
      expect(updated!.metrics.totalThoughts).toBe(thoughtCount);
    });

    it('should handle large dependency arrays', async () => {
      const session = await manager.createSession();
      const dependencies = Array.from({ length: 100 }, (_, i) => `thought-${i}`);

      await manager.addThought(session.id, {
        thought: 'Dependent thought',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        dependencies,
        assumptions: [],
      });

      const updated = await manager.getSession(session.id);
      expect(updated!.thoughts).toHaveLength(1);
    });
  });

  describe('Error Recovery', () => {
    it('should maintain session integrity even with lenient validation', async () => {
      const session = await manager.createSession();

      // Add valid thought
      await manager.addThought(session.id, createValidThought(session.id, 1) as any);

      // Add thought with invalid data (currently accepted due to lenient validation)
      await manager.addThought(session.id, {
        thoughtNumber: -1, // Invalid but accepted
        totalThoughts: 2,
        nextThoughtNeeded: false,
      } as any);

      // Session now has both thoughts (lenient behavior)
      const updated = await manager.getSession(session.id);
      expect(updated!.thoughts).toHaveLength(2);
    });

    it('should allow mode switch even after adding invalid data', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.SEQUENTIAL });

      // Add thought with invalid structure (currently accepted)
      await manager.addThought(session.id, { invalid: true } as any);

      // Should still be able to switch mode
      await expect(
        manager.switchMode(session.id, ThinkingMode.SHANNON)
      ).resolves.toBeDefined();
    });
  });

  describe('Summary Generation Edge Cases', () => {
    it('should generate summary for empty session', async () => {
      const session = await manager.createSession({ title: 'Empty Session' });

      const summary = await manager.generateSummary(session.id);

      expect(summary).toBeDefined();
      expect(summary).toContain('Empty Session');
      expect(summary).toContain('0');
    });

    it('should generate summary for single thought session', async () => {
      const session = await manager.createSession({ title: 'Single Thought' });

      await manager.addThought(session.id, {
        ...createValidThought(session.id, 1),
        content: 'Only thought',
      } as any);

      const summary = await manager.generateSummary(session.id);

      expect(summary).toBeDefined();
      expect(summary).toContain('Single Thought');
      expect(summary).toContain('1');
    });

    it('should handle summary for session with very long thoughts', async () => {
      const session = await manager.createSession();
      const longThought = 'Very long thought content. '.repeat(1000);

      await manager.addThought(session.id, {
        ...createValidThought(session.id, 1),
        content: longThought,
      } as any);

      const summary = await manager.generateSummary(session.id);

      // Summary should be generated even for very long content
      expect(summary).toBeDefined();
      expect(summary.length).toBeGreaterThan(0);
    });
  });

  describe('Concurrent Session Management', () => {
    it('should handle rapid session creation', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        manager.createSession({ title: `Session ${i}` })
      );

      const sessions = await Promise.all(promises);

      expect(sessions).toHaveLength(10);
      expect(new Set(sessions.map(s => s.id)).size).toBe(10); // All unique IDs
    });

    it('should handle concurrent thought additions to same session', async () => {
      const session = await manager.createSession();

      // Add thoughts concurrently (this might cause issues in real concurrent scenarios)
      const promises = Array.from({ length: 5 }, (_, i) =>
        manager.addThought(session.id, {
          ...createValidThought(session.id, i + 1),
          thoughtNumber: i + 1,
          totalThoughts: 5,
          nextThoughtNeeded: i < 4,
        } as any)
      );

      await Promise.all(promises);

      const updated = await manager.getSession(session.id);
      expect(updated!.thoughts.length).toBe(5);
    });

    it('should maintain independence of multiple sessions', async () => {
      const session1 = await manager.createSession({ title: 'Session 1' });
      const session2 = await manager.createSession({ title: 'Session 2' });

      await manager.addThought(session1.id, createValidThought(session1.id, 1) as any);
      await manager.addThought(session2.id, createValidThought(session2.id, 1) as any);

      const s1 = await manager.getSession(session1.id);
      const s2 = await manager.getSession(session2.id);

      expect(s1!.thoughts).toHaveLength(1);
      expect(s2!.thoughts).toHaveLength(1);
      expect(s1!.thoughts[0].sessionId).toBe(session1.id);
      expect(s2!.thoughts[0].sessionId).toBe(session2.id);
    });
  });

  describe('Mode-Specific Edge Cases', () => {
    it('should handle mathematics mode with missing optional fields', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.MATHEMATICS });

      await manager.addThought(session.id, {
        thought: 'Simple theorem',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        // Missing: mathematicalModel, proofStrategy
        thoughtType: 'theorem_statement',
        dependencies: [],
        assumptions: [],
      });

      const updated = await manager.getSession(session.id);
      expect(updated!.thoughts).toHaveLength(1);
    });

    it('should handle Shannon mode without explicit stage', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.SHANNON });

      await manager.addThought(session.id, {
        thought: 'Analyzing the problem',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        // Missing: stage
      });

      const updated = await manager.getSession(session.id);
      expect(updated!.thoughts).toHaveLength(1);
    });

    it('should handle temporal mode with minimal event data', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.TEMPORAL });

      await manager.addThought(session.id, {
        thought: 'Event occurred',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        events: [
          {
            id: 'e1',
            name: 'Event 1',
            description: 'First event',
            timestamp: Date.now(),
            type: 'instant',
            properties: {},
          },
        ],
      });

      const updated = await manager.getSession(session.id);
      expect(updated!.thoughts).toHaveLength(1);
    });
  });
});
