/**
 * Unit tests for SessionManager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../src/session/manager.js';
import { ThinkingMode, ShannonStage } from '../../src/types/core.js';

describe('SessionManager', () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager();
  });

  describe('createSession', () => {
    it('should create a new session with default values', async () => {
      const session = await manager.createSession();

      expect(session.id).toBeDefined();
      expect(session.title).toBe('Untitled Session');
      expect(session.mode).toBe(ThinkingMode.HYBRID);
      expect(session.thoughts).toHaveLength(0);
      expect(session.isComplete).toBe(false);
      expect(session.currentThoughtNumber).toBe(0);
    });

    it('should create a session with custom options', async () => {
      const session = await manager.createSession({
        title: 'My Problem',
        mode: ThinkingMode.MATHEMATICS,
        domain: 'number_theory',
        author: 'Test User',
      });

      expect(session.title).toBe('My Problem');
      expect(session.mode).toBe(ThinkingMode.MATHEMATICS);
      expect(session.domain).toBe('number_theory');
      expect(session.author).toBe('Test User');
    });

    it('should initialize metrics correctly', async () => {
      const session = await manager.createSession();

      expect(session.metrics.totalThoughts).toBe(0);
      expect(session.metrics.revisionCount).toBe(0);
      expect(session.metrics.averageUncertainty).toBe(0);
      expect(session.metrics.dependencyDepth).toBe(0);
    });
  });

  describe('getSession', () => {
    it('should retrieve an existing session', async () => {
      const created = await manager.createSession({ title: 'Test Session' });
      const retrieved = await manager.getSession(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.title).toBe('Test Session');
    });

    it('should return null for non-existent valid UUID session', async () => {
      // Use a valid UUID v4 format that doesn't exist in storage
      const session = await manager.getSession('12345678-1234-4234-8234-123456789abc');
      expect(session).toBeNull();
    });

    it('should throw validation error for invalid session ID format', async () => {
      // Security: Invalid session IDs throw validation errors to prevent path traversal
      await expect(manager.getSession('non-existent-id')).rejects.toThrow('Invalid session ID format');
    });
  });

  describe('addThought', () => {
    it('should add a sequential thought to session', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.SEQUENTIAL });

      const thought = {
        id: 'thought-1',
        sessionId: session.id,
        mode: ThinkingMode.SEQUENTIAL,
        thoughtNumber: 1,
        totalThoughts: 3,
        content: 'First thought',
        timestamp: new Date(),
        nextThoughtNeeded: true,
      };

      const updated = await manager.addThought(session.id, thought as any);

      expect(updated.thoughts).toHaveLength(1);
      expect(updated.thoughts[0].content).toBe('First thought');
      expect(updated.currentThoughtNumber).toBe(1);
      expect(updated.metrics.totalThoughts).toBe(1);
    });

    it('should mark session as complete when nextThoughtNeeded is false', async () => {
      const session = await manager.createSession();

      const thought = {
        id: 'thought-final',
        sessionId: session.id,
        mode: ThinkingMode.SEQUENTIAL,
        thoughtNumber: 3,
        totalThoughts: 3,
        content: 'Final thought',
        timestamp: new Date(),
        nextThoughtNeeded: false,
      };

      const updated = await manager.addThought(session.id, thought as any);

      expect(updated.isComplete).toBe(true);
    });

    it('should track revisions in metrics', async () => {
      const session = await manager.createSession();

      const thought1 = {
        id: 'thought-1',
        sessionId: session.id,
        mode: ThinkingMode.SEQUENTIAL,
        thoughtNumber: 1,
        totalThoughts: 3,
        content: 'Original thought',
        timestamp: new Date(),
        nextThoughtNeeded: true,
      };

      await manager.addThought(session.id, thought1 as any);

      const revision = {
        id: 'thought-2',
        sessionId: session.id,
        mode: ThinkingMode.SEQUENTIAL,
        thoughtNumber: 2,
        totalThoughts: 3,
        content: 'Revised thought',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        isRevision: true,
        revisesThought: 'thought-1',
      };

      const updated = await manager.addThought(session.id, revision as any);

      expect(updated.metrics.revisionCount).toBe(1);
    });

    it('should calculate average uncertainty for Shannon thoughts', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.SHANNON });

      const thought1 = {
        id: 'thought-1',
        sessionId: session.id,
        mode: ThinkingMode.SHANNON,
        thoughtNumber: 1,
        totalThoughts: 3,
        content: 'First Shannon thought',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        stage: ShannonStage.PROBLEM_DEFINITION,
        uncertainty: 0.2,
        dependencies: [],
        assumptions: [],
      };

      await manager.addThought(session.id, thought1 as any);

      const thought2 = {
        id: 'thought-2',
        sessionId: session.id,
        mode: ThinkingMode.SHANNON,
        thoughtNumber: 2,
        totalThoughts: 3,
        content: 'Second Shannon thought',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        stage: ShannonStage.MODEL,
        uncertainty: 0.4,
        dependencies: ['thought-1'],
        assumptions: [],
      };

      const updated = await manager.addThought(session.id, thought2 as any);

      expect(updated.metrics.averageUncertainty).toBeCloseTo(0.3, 5); // (0.2 + 0.4) / 2
    });

    it('should throw error for non-existent session', async () => {
      const nonExistentId = '00000000-0000-4000-8000-000000000000';
      const thought = {
        id: 'thought-1',
        sessionId: nonExistentId,
        mode: ThinkingMode.SEQUENTIAL,
        thoughtNumber: 1,
        totalThoughts: 3,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: true,
      };

      await expect(manager.addThought(nonExistentId, thought as any))
        .rejects.toThrow(`Session not found: ${nonExistentId}`);
    });
  });

  describe('switchMode', () => {
    it('should switch session mode', async () => {
      const session = await manager.createSession({ mode: ThinkingMode.SEQUENTIAL });

      const updated = await manager.switchMode(
        session.id,
        ThinkingMode.SHANNON,
        'Need systematic approach'
      );

      expect(updated.mode).toBe(ThinkingMode.SHANNON);
      expect(updated.config.modeConfig.mode).toBe(ThinkingMode.SHANNON);
    });

    it('should throw error for non-existent session', async () => {
      const nonExistentId = '00000000-0000-4000-8000-000000000000';
      await expect(manager.switchMode(nonExistentId, ThinkingMode.SHANNON))
        .rejects.toThrow(`Session not found: ${nonExistentId}`);
    });
  });

  describe('listSessions', () => {
    it('should list all sessions', async () => {
      await manager.createSession({ title: 'Session 1' });
      await manager.createSession({ title: 'Session 2' });
      await manager.createSession({ title: 'Session 3' });

      const sessions = await manager.listSessions();

      expect(sessions).toHaveLength(3);
      expect(sessions.map(s => s.title)).toContain('Session 1');
      expect(sessions.map(s => s.title)).toContain('Session 2');
      expect(sessions.map(s => s.title)).toContain('Session 3');
    });

    it('should return empty array when no sessions', async () => {
      const sessions = await manager.listSessions();
      expect(sessions).toHaveLength(0);
    });
  });

  describe('deleteSession', () => {
    it('should delete a session', async () => {
      const session = await manager.createSession();

      await manager.deleteSession(session.id);

      const retrieved = await manager.getSession(session.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('generateSummary', () => {
    it('should generate a summary of session', async () => {
      const session = await manager.createSession({ title: 'Test Problem' });

      const thought = {
        id: 'thought-1',
        sessionId: session.id,
        mode: ThinkingMode.SEQUENTIAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'This is a test thought with enough content to be summarized properly',
        timestamp: new Date(),
        nextThoughtNeeded: false,
      };

      await manager.addThought(session.id, thought as any);

      const summary = await manager.generateSummary(session.id);

      expect(summary).toContain('Test Problem');
      expect(summary).toContain('hybrid');
      expect(summary).toContain('Complete');
      expect(summary).toContain('This is a test thought');
    });
  });
});
