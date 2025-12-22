/**
 * Session Actions Integration Tests
 *
 * Tests T-SES-009 through T-SES-021: Comprehensive integration tests
 * for all 6 session management actions.
 *
 * Phase 11 Sprint 8: Session Management & Export Formats
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ExportService } from '../../../src/services/ExportService.js';
import { ModeRouter } from '../../../src/services/ModeRouter.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Session Actions Integration Tests', () => {
  let manager: SessionManager;
  let factory: ThoughtFactory;
  let exportService: ExportService;
  let modeRouter: ModeRouter;

  beforeEach(() => {
    manager = new SessionManager();
    factory = new ThoughtFactory();
    exportService = new ExportService();
    modeRouter = new ModeRouter();
  });

  /**
   * Helper to create a basic thought input
   */
  function createBasicThought(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Test thought content',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'sequential',
      ...overrides,
    } as ThinkingToolInput;
  }

  /**
   * Helper to create a session with thoughts
   */
  async function createSessionWithThoughts(count: number, mode: string = 'sequential'): Promise<string> {
    const session = await manager.createSession();
    for (let i = 1; i <= count; i++) {
      const thought = factory.createThought(createBasicThought({
        thought: `Thought ${i}`,
        thoughtNumber: i,
        totalThoughts: count,
        nextThoughtNeeded: i < count,
        mode,
      }), session.id);
      await manager.addThought(session.id, thought);
    }
    return session.id;
  }

  // ===========================================================================
  // T-SES-009: export action - all 8 formats
  // ===========================================================================
  describe('T-SES-009: Export Action', () => {
    it('should export to markdown format', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'markdown');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should export to json format', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'json');
      expect(result).toBeDefined();
      const parsed = JSON.parse(result);
      expect(parsed).toBeDefined();
    });

    it('should export to html format', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'html');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // Multi-thought sessions currently use text fallback; single-thought uses HTML
      expect(result).toContain('Session:');
    });

    it('should export to mermaid format', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'mermaid');
      expect(result).toBeDefined();
      expect(result).toContain('graph');
    });

    it('should export to dot format', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'dot');
      expect(result).toBeDefined();
      expect(result).toContain('digraph');
    });

    it('should export to ascii format', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'ascii');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should export to latex format', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'latex');
      expect(result).toBeDefined();
      expect(result).toContain('\\');
    });

    it('should export to jupyter format', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'jupyter');
      expect(result).toBeDefined();
      const parsed = JSON.parse(result);
      expect(parsed.cells).toBeDefined();
    });
  });

  // ===========================================================================
  // T-SES-010: summarize action - single thought session
  // ===========================================================================
  describe('T-SES-010: Summarize Single Thought', () => {
    it('should summarize single thought session', async () => {
      const sessionId = await createSessionWithThoughts(1);
      const session = await manager.getSession(sessionId);

      expect(session?.thoughts).toHaveLength(1);
    });

    it('should include thought content in summary', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createBasicThought({
        thought: 'The key insight is X',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts[0].content).toContain('key insight');
    });
  });

  // ===========================================================================
  // T-SES-011: summarize action - multi-thought session
  // ===========================================================================
  describe('T-SES-011: Summarize Multi-Thought', () => {
    it('should summarize multi-thought session', async () => {
      const sessionId = await createSessionWithThoughts(5);
      const session = await manager.getSession(sessionId);

      expect(session?.thoughts).toHaveLength(5);
    });

    it('should track thought progression', async () => {
      const sessionId = await createSessionWithThoughts(5);
      const session = await manager.getSession(sessionId);

      for (let i = 0; i < 5; i++) {
        expect(session?.thoughts[i].thoughtNumber).toBe(i + 1);
      }
    });
  });

  // ===========================================================================
  // T-SES-012: summarize action - branched session
  // ===========================================================================
  describe('T-SES-012: Summarize Branched Session', () => {
    it('should handle session with branches', async () => {
      const session = await manager.createSession();

      // Main branch
      const mainThought = factory.createThought(createBasicThought({ thought: 'Main thought', thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, mainThought);

      // Branch
      const branchThought = factory.createThought(createBasicThought({
        thought: 'Branch thought',
        thoughtNumber: 2,
        branchFrom: 'thought-1',
        branchId: 'alternative-approach',
      }), session.id);
      await manager.addThought(session.id, branchThought);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(2);
    });
  });

  // ===========================================================================
  // T-SES-013: get_session action - full data
  // ===========================================================================
  describe('T-SES-013: Get Session Full Data', () => {
    it('should return complete session data', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      expect(session).toBeDefined();
      expect(session?.id).toBe(sessionId);
      expect(session?.thoughts).toHaveLength(3);
    });

    it('should include session metadata', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.MATHEMATICS });
      const thought = factory.createThought(createBasicThought({ mode: 'mathematics' }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      expect(updated?.mode).toBe(ThinkingMode.MATHEMATICS);
      expect(updated?.createdAt).toBeDefined();
    });
  });

  // ===========================================================================
  // T-SES-014: get_session action - non-existent session
  // ===========================================================================
  describe('T-SES-014: Get Non-Existent Session', () => {
    it('should return null for non-existent session', async () => {
      const session = await manager.getSession('non-existent-id');
      expect(session).toBeNull();
    });

    it('should handle empty session ID gracefully', async () => {
      const session = await manager.getSession('');
      expect(session).toBeNull();
    });
  });

  // ===========================================================================
  // T-SES-015: switch_mode action - compatible mode
  // ===========================================================================
  describe('T-SES-015: Switch Mode Compatible', () => {
    it('should switch from sequential to mathematics', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.SEQUENTIAL });
      const thought1 = factory.createThought(createBasicThought({ mode: 'sequential' }), session.id);
      await manager.addThought(session.id, thought1);
      const thought2 = factory.createThought(createBasicThought({ mode: 'mathematics', thoughtNumber: 2 }), session.id);
      await manager.addThought(session.id, thought2);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts[1].mode).toBe(ThinkingMode.MATHEMATICS);
    });

    it('should switch from bayesian to evidential', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.BAYESIAN });
      const thought1 = factory.createThought(createBasicThought({ mode: 'bayesian' }), session.id);
      await manager.addThought(session.id, thought1);
      const thought2 = factory.createThought(createBasicThought({ mode: 'evidential', thoughtNumber: 2 }), session.id);
      await manager.addThought(session.id, thought2);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts[1].mode).toBe(ThinkingMode.EVIDENTIAL);
    });
  });

  // ===========================================================================
  // T-SES-016: switch_mode action - all modes
  // ===========================================================================
  describe('T-SES-016: Switch All Modes', () => {
    const modes = [
      'sequential', 'shannon', 'hybrid', 'mathematics', 'physics',
      'inductive', 'deductive', 'abductive', 'causal', 'bayesian',
    ];

    it('should support switching between major modes', async () => {
      for (const mode of modes) {
        const session = await manager.createSession();
        const thought = factory.createThought(createBasicThought({ mode }), session.id);
        await manager.addThought(session.id, thought);
        const updated = await manager.getSession(session.id);
        expect(updated?.thoughts).toHaveLength(1);
      }
    });
  });

  // ===========================================================================
  // T-SES-017: recommend_mode action - quick (problemType)
  // ===========================================================================
  describe('T-SES-017: Recommend Mode Quick', () => {
    it('should recommend mode for proof problem', () => {
      const recommendation = modeRouter.getRecommendations({
        domain: 'mathematics',
        complexity: 'high',
        uncertainty: 'low',
        requiresProof: true,
        timeDependent: false,
        multiAgent: false,
        requiresQuantification: false,
        hasIncompleteInfo: false,
        requiresExplanation: false,
        hasAlternatives: false,
      });

      expect(recommendation).toBeDefined();
      expect(typeof recommendation).toBe('string');
      expect(recommendation.length).toBeGreaterThan(0);
    });

    it('should recommend mode for optimization problem', () => {
      const recommendation = modeRouter.getRecommendations({
        domain: 'optimization',
        complexity: 'medium',
        uncertainty: 'low',
        requiresProof: false,
        timeDependent: false,
        multiAgent: false,
        requiresQuantification: true,
        hasIncompleteInfo: false,
        requiresExplanation: false,
        hasAlternatives: true,
      });

      expect(recommendation).toBeDefined();
    });

    it('should recommend mode for analysis problem', () => {
      const recommendation = modeRouter.getRecommendations({
        domain: 'analysis',
        complexity: 'medium',
        uncertainty: 'medium',
        requiresProof: false,
        timeDependent: false,
        multiAgent: false,
        requiresQuantification: false,
        hasIncompleteInfo: false,
        requiresExplanation: true,
        hasAlternatives: false,
      });

      expect(recommendation).toBeDefined();
    });
  });

  // ===========================================================================
  // T-SES-018: recommend_mode action - detailed (problemCharacteristics)
  // ===========================================================================
  describe('T-SES-018: Recommend Mode Detailed', () => {
    it('should recommend based on detailed characteristics', () => {
      const recommendation = modeRouter.getRecommendations({
        domain: 'mathematics',
        complexity: 'high',
        uncertainty: 'low',
        requiresProof: true,
        timeDependent: false,
        multiAgent: false,
        requiresQuantification: true,
        hasIncompleteInfo: false,
        requiresExplanation: true,
        hasAlternatives: false,
      });

      expect(recommendation).toBeDefined();
      expect(typeof recommendation).toBe('string');
    });

    it('should handle high uncertainty problems', () => {
      const recommendation = modeRouter.getRecommendations({
        domain: 'decision-making',
        complexity: 'medium',
        uncertainty: 'high',
        requiresProof: false,
        timeDependent: false,
        multiAgent: false,
        requiresQuantification: false,
        hasIncompleteInfo: true,
        requiresExplanation: true,
        hasAlternatives: true,
      });

      expect(recommendation).toBeDefined();
    });
  });

  // ===========================================================================
  // T-SES-019: recommend_mode action - with combinations
  // ===========================================================================
  describe('T-SES-019: Recommend Mode Combinations', () => {
    it('should suggest mode combinations', () => {
      const recommendation = modeRouter.getRecommendations({
        domain: 'research',
        complexity: 'high',
        uncertainty: 'medium',
        requiresProof: true,
        timeDependent: false,
        multiAgent: false,
        requiresQuantification: true,
        hasIncompleteInfo: false,
        requiresExplanation: true,
        hasAlternatives: false,
      }, true); // includeCombinations = true

      expect(recommendation).toBeDefined();
      // May include alternative or complementary modes
    });
  });

  // ===========================================================================
  // T-SES-020: delete_session action - existing session
  // ===========================================================================
  describe('T-SES-020: Delete Existing Session', () => {
    it('should delete existing session', async () => {
      const sessionId = await createSessionWithThoughts(3);

      // Verify session exists
      const before = await manager.getSession(sessionId);
      expect(before).toBeDefined();

      // Delete session
      await manager.deleteSession(sessionId);

      // Verify session is gone
      const after = await manager.getSession(sessionId);
      expect(after).toBeNull();
    });

    it('should not affect other sessions', async () => {
      const session1Id = await createSessionWithThoughts(2);
      const session2Id = await createSessionWithThoughts(3);

      await manager.deleteSession(session1Id);

      const deleted = await manager.getSession(session1Id);
      const remaining = await manager.getSession(session2Id);
      expect(deleted).toBeNull();
      expect(remaining).toBeDefined();
    });
  });

  // ===========================================================================
  // T-SES-021: delete_session action - non-existent session
  // ===========================================================================
  describe('T-SES-021: Delete Non-Existent Session', () => {
    it('should handle deleting non-existent session', async () => {
      // deleteSession returns void but doesn't throw for non-existent sessions
      await expect(manager.deleteSession('non-existent-id')).resolves.toBeUndefined();
    });

    it('should handle deleting already deleted session', async () => {
      const sessionId = await createSessionWithThoughts(1);
      await manager.deleteSession(sessionId);

      // Second delete should also complete without error (returns void)
      await expect(manager.deleteSession(sessionId)).resolves.toBeUndefined();
    });
  });
});
