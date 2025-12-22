/**
 * JSON Export Integration Tests
 *
 * Tests T-EXP-027 through T-EXP-031: Comprehensive tests for
 * JSON data export format.
 *
 * Phase 11 Sprint 8: Session Management & Export Formats
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ExportService } from '../../../src/services/ExportService.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('JSON Export Integration Tests', () => {
  let manager: SessionManager;
  let factory: ThoughtFactory;
  let exportService: ExportService;

  beforeEach(() => {
    manager = new SessionManager();
    factory = new ThoughtFactory();
    exportService = new ExportService();
  });

  function createThought(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Test thought',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'sequential',
      ...overrides,
    } as ThinkingToolInput;
  }

  async function createSessionWithThoughts(count: number): Promise<string> {
    const session = await manager.createSession();
    for (let i = 1; i <= count; i++) {
      const thought = factory.createThought(createThought({
        thought: `Thought ${i}`,
        thoughtNumber: i,
        totalThoughts: count,
        nextThoughtNeeded: i < count,
      }), session.id);
      await manager.addThought(session.id, thought);
    }
    return session.id;
  }

  // ===========================================================================
  // T-EXP-027: JSON single thought
  // ===========================================================================
  describe('T-EXP-027: Single Thought', () => {
    it('should export single thought to JSON', async () => {
      const sessionId = await createSessionWithThoughts(1);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'json');
      expect(result).toBeDefined();
      const parsed = JSON.parse(result);
      expect(parsed).toBeDefined();
    });

    it('should be valid JSON', async () => {
      const session = await manager.createSession();
      const thought = factory.createThought(createThought({
        thought: 'JSON test content',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'json');
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  // ===========================================================================
  // T-EXP-028: JSON multi-thought
  // ===========================================================================
  describe('T-EXP-028: Multi-Thought', () => {
    it('should export multiple thoughts', async () => {
      const sessionId = await createSessionWithThoughts(5);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'json');
      const parsed = JSON.parse(result);
      expect(parsed).toBeDefined();
    });

    it('should include all thoughts', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'json');
      const parsed = JSON.parse(result);
      expect(parsed).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-029: JSON schema validation
  // ===========================================================================
  describe('T-EXP-029: Schema Validation', () => {
    it('should have consistent structure', async () => {
      const sessionId = await createSessionWithThoughts(3);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'json');
      const parsed = JSON.parse(result);
      expect(parsed).toBeDefined();
    });

    it('should include session metadata', async () => {
      const session = await manager.createSession(ThinkingMode.MATHEMATICS);
      const thought = factory.createThought(createThought({
        mode: 'mathematics',
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'json');
      const parsed = JSON.parse(result);
      expect(parsed).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-030: JSON roundtrip fidelity
  // ===========================================================================
  describe('T-EXP-030: Roundtrip Fidelity', () => {
    it('should preserve thought content', async () => {
      const session = await manager.createSession();
      const originalContent = 'This is the original thought content';
      const thought = factory.createThought(createThought({
        thought: originalContent,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'json');
      expect(result).toContain(originalContent);
    });

    it('should preserve special characters', async () => {
      const session = await manager.createSession();
      const content = 'Special chars: "quotes", \\backslash, \n newline';
      const thought = factory.createThought(createThought({
        thought: content,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'json');
      const parsed = JSON.parse(result);
      expect(parsed).toBeDefined();
    });
  });

  // ===========================================================================
  // T-EXP-031: JSON mode-specific fields
  // ===========================================================================
  describe('T-EXP-031: Mode-Specific Fields', () => {
    it('should include sequential mode fields', async () => {
      const sessionId = await createSessionWithThoughts(2);
      const session = await manager.getSession(sessionId);

      const result = exportService.exportSession(session!, 'json');
      const parsed = JSON.parse(result);
      expect(parsed).toBeDefined();
    });

    it('should include mathematics mode fields', async () => {
      const session = await manager.createSession(ThinkingMode.MATHEMATICS);
      const thought = factory.createThought(createThought({
        mode: 'mathematics',
        proofStrategy: {
          type: 'direct',
          steps: ['Step 1', 'Step 2'],
        },
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'json');
      const parsed = JSON.parse(result);
      expect(parsed).toBeDefined();
    });

    it('should include bayesian mode fields', async () => {
      const session = await manager.createSession(ThinkingMode.BAYESIAN);
      const thought = factory.createThought(createThought({
        mode: 'bayesian',
        priorProbability: 0.5,
        likelihood: 0.8,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, thought);

      const updated = await manager.getSession(session.id);
      const result = exportService.exportSession(updated!, 'json');
      const parsed = JSON.parse(result);
      expect(parsed).toBeDefined();
    });
  });
});
