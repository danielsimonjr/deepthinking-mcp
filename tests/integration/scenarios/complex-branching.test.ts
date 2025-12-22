/**
 * Complex Branching Tests
 *
 * Tests T-INT-006 through T-INT-010: Integration tests for
 * branching, nested branches, and branch management.
 *
 * Phase 11 Sprint 11: Integration Scenarios & Performance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ExportService } from '../../../src/services/ExportService.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Complex Branching Integration Tests', () => {
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
  // T-INT-006: Create 3+ parallel branches
  // ===========================================================================
  describe('T-INT-006: Multiple Parallel Branches', () => {
    it('should support creating 3 parallel branches', async () => {
      const session = await manager.createSession();

      // Main thought
      const thought1 = factory.createThought(createValidInput({
        thought: 'Initial thought - branching point',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, thought1);

      // Branch A
      const thought2 = factory.createThought(createValidInput({
        thought: 'Branch A exploration',
        thoughtNumber: 2,
        branchId: 'branch-a',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, thought2);

      // Branch B
      const thought3 = factory.createThought(createValidInput({
        thought: 'Branch B exploration',
        thoughtNumber: 2,
        branchId: 'branch-b',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, thought3);

      // Branch C
      const thought4 = factory.createThought(createValidInput({
        thought: 'Branch C exploration',
        thoughtNumber: 2,
        branchId: 'branch-c',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, thought4);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(4);
    });

    it('should allow continuing thoughts on each branch', async () => {
      const session = await manager.createSession();

      const root = factory.createThought(createValidInput({ thought: 'Root', thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, root);

      // Branch A with follow-up
      const branchA1 = factory.createThought(createValidInput({
        thought: 'Branch A - step 1',
        thoughtNumber: 2,
        branchId: 'branch-a',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, branchA1);

      const branchA2 = factory.createThought(createValidInput({
        thought: 'Branch A - step 2',
        thoughtNumber: 3,
        branchId: 'branch-a',
      }), session.id);
      await manager.addThought(session.id, branchA2);

      // Branch B with follow-up
      const branchB1 = factory.createThought(createValidInput({
        thought: 'Branch B - step 1',
        thoughtNumber: 2,
        branchId: 'branch-b',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, branchB1);

      const branchB2 = factory.createThought(createValidInput({
        thought: 'Branch B - step 2',
        thoughtNumber: 3,
        branchId: 'branch-b',
      }), session.id);
      await manager.addThought(session.id, branchB2);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(5);
    });

    it('should track branch IDs correctly', async () => {
      const session = await manager.createSession();

      const root = factory.createThought(createValidInput({ thought: 'Root', thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, root);

      const alpha = factory.createThought(createValidInput({
        thought: 'Branch A',
        thoughtNumber: 2,
        branchId: 'alpha',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, alpha);

      const beta = factory.createThought(createValidInput({
        thought: 'Branch B',
        thoughtNumber: 2,
        branchId: 'beta',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, beta);

      const updated = await manager.getSession(session.id);
      const branchIds = updated?.thoughts.map(t => t.branchId).filter(Boolean);
      expect(branchIds).toContain('alpha');
      expect(branchIds).toContain('beta');
    });
  });

  // ===========================================================================
  // T-INT-007: Branch from branch (nested)
  // ===========================================================================
  describe('T-INT-007: Nested Branching', () => {
    it('should support branching from a branch', async () => {
      const session = await manager.createSession();

      // Root
      const root = factory.createThought(createValidInput({
        thought: 'Root thought',
        thoughtNumber: 1,
      }), session.id);
      await manager.addThought(session.id, root);

      // First-level branch
      const branch1 = factory.createThought(createValidInput({
        thought: 'First branch',
        thoughtNumber: 2,
        branchId: 'branch-1',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, branch1);

      // Nested branch from first branch
      const nested = factory.createThought(createValidInput({
        thought: 'Nested branch from branch-1',
        thoughtNumber: 3,
        branchId: 'branch-1-a',
        branchFrom: 'thought-2',
      }), session.id);
      await manager.addThought(session.id, nested);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(3);
    });

    it('should support 3 levels of nesting', async () => {
      const session = await manager.createSession();

      const level0 = factory.createThought(createValidInput({ thought: 'Level 0', thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, level0);

      const level1 = factory.createThought(createValidInput({
        thought: 'Level 1',
        thoughtNumber: 2,
        branchId: 'L1',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, level1);

      const level2 = factory.createThought(createValidInput({
        thought: 'Level 2',
        thoughtNumber: 3,
        branchId: 'L2',
        branchFrom: 'thought-2',
      }), session.id);
      await manager.addThought(session.id, level2);

      const level3 = factory.createThought(createValidInput({
        thought: 'Level 3',
        thoughtNumber: 4,
        branchId: 'L3',
        branchFrom: 'thought-3',
      }), session.id);
      await manager.addThought(session.id, level3);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(4);
    });

    it('should export nested branches correctly', async () => {
      const session = await manager.createSession();

      const root = factory.createThought(createValidInput({ thought: 'Root', thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, root);

      const branch = factory.createThought(createValidInput({
        thought: 'Branch',
        thoughtNumber: 2,
        branchId: 'b1',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, branch);

      const nested = factory.createThought(createValidInput({
        thought: 'Nested',
        thoughtNumber: 3,
        branchId: 'b1-sub',
        branchFrom: 'thought-2',
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, nested);

      const updated = await manager.getSession(session.id);
      const mermaid = exportService.exportSession(updated!, 'mermaid');
      expect(mermaid).toContain('graph');
    });
  });

  // ===========================================================================
  // T-INT-008: Merge branch insights
  // ===========================================================================
  describe('T-INT-008: Branch Insight Merging', () => {
    it('should support thought referencing multiple branches', async () => {
      const session = await manager.createSession();

      const root = factory.createThought(createValidInput({ thought: 'Root', thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, root);

      const branchA = factory.createThought(createValidInput({
        thought: 'Branch A insight',
        thoughtNumber: 2,
        branchId: 'branch-a',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, branchA);

      const branchB = factory.createThought(createValidInput({
        thought: 'Branch B insight',
        thoughtNumber: 2,
        branchId: 'branch-b',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, branchB);

      // Merge thought referencing both branches
      const merge = factory.createThought(createValidInput({
        thought: 'Merging insights from A and B',
        thoughtNumber: 3,
        dependencies: ['thought-2', 'thought-3'],
      }), session.id);
      await manager.addThought(session.id, merge);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(4);
      expect(updated?.thoughts[3].dependencies).toContain('thought-2');
      expect(updated?.thoughts[3].dependencies).toContain('thought-3');
    });

    it('should allow synthesis mode for branch merging', async () => {
      const session = await manager.createSession();

      const problem = factory.createThought(createValidInput({ thought: 'Problem', thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, problem);

      const approachA = factory.createThought(createValidInput({
        thought: 'Approach A',
        thoughtNumber: 2,
        branchId: 'approach-a',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, approachA);

      const approachB = factory.createThought(createValidInput({
        thought: 'Approach B',
        thoughtNumber: 2,
        branchId: 'approach-b',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, approachB);

      const synthesis = factory.createThought(createValidInput({
        mode: 'synthesis',
        thought: 'Synthesizing both approaches',
        thoughtNumber: 3,
        sources: [
          { id: 'a', title: 'Approach A', type: 'branch' },
          { id: 'b', title: 'Approach B', type: 'branch' },
        ],
      }), session.id);
      await manager.addThought(session.id, synthesis);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts[3].mode).toBe(ThinkingMode.SYNTHESIS);
    });
  });

  // ===========================================================================
  // T-INT-009: Revision after branching
  // ===========================================================================
  describe('T-INT-009: Revision After Branching', () => {
    it('should support revisions on main branch after creating branches', async () => {
      const session = await manager.createSession();

      const original = factory.createThought(createValidInput({ thought: 'Original', thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, original);

      const exploration = factory.createThought(createValidInput({
        thought: 'Branch exploration',
        thoughtNumber: 2,
        branchId: 'exploration',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, exploration);

      // Revision on main branch
      const revision = factory.createThought(createValidInput({
        thought: 'Revised original based on branch insights',
        thoughtNumber: 2,
        isRevision: true,
        revisesThought: 'thought-1',
        revisionReason: 'Incorporating insights from exploration branch',
      }), session.id);
      await manager.addThought(session.id, revision);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts).toHaveLength(3);
      expect(updated?.thoughts[2].isRevision).toBe(true);
    });

    it('should support revisions within a branch', async () => {
      const session = await manager.createSession();

      const root = factory.createThought(createValidInput({ thought: 'Root', thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, root);

      const step1 = factory.createThought(createValidInput({
        thought: 'Branch step 1',
        thoughtNumber: 2,
        branchId: 'branch-x',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, step1);

      const revision = factory.createThought(createValidInput({
        thought: 'Revised branch step 1',
        thoughtNumber: 2,
        branchId: 'branch-x',
        isRevision: true,
        revisesThought: 'thought-2',
        revisionReason: 'Correcting approach',
      }), session.id);
      await manager.addThought(session.id, revision);

      const updated = await manager.getSession(session.id);
      expect(updated?.thoughts[2].isRevision).toBe(true);
      expect(updated?.thoughts[2].revisesThought).toBe('thought-2');
    });
  });

  // ===========================================================================
  // T-INT-010: Branch comparison export
  // ===========================================================================
  describe('T-INT-010: Branch Comparison Export', () => {
    it('should export all branches in markdown', async () => {
      const session = await manager.createSession();

      const decision = factory.createThought(createValidInput({ thought: 'Decision point', thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, decision);

      const optionA = factory.createThought(createValidInput({
        thought: 'Option A analysis',
        thoughtNumber: 2,
        branchId: 'option-a',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, optionA);

      const optionB = factory.createThought(createValidInput({
        thought: 'Option B analysis',
        thoughtNumber: 2,
        branchId: 'option-b',
        branchFrom: 'thought-1',
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, optionB);

      const updated = await manager.getSession(session.id);
      const markdown = exportService.exportSession(updated!, 'markdown');

      expect(markdown).toBeDefined();
      expect(markdown.length).toBeGreaterThan(0);
    });

    it('should export branching structure in DOT format', async () => {
      const session = await manager.createSession();

      const root = factory.createThought(createValidInput({ thought: 'Root', thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, root);

      const left = factory.createThought(createValidInput({
        thought: 'Left branch',
        thoughtNumber: 2,
        branchId: 'left',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, left);

      const right = factory.createThought(createValidInput({
        thought: 'Right branch',
        thoughtNumber: 2,
        branchId: 'right',
        branchFrom: 'thought-1',
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, right);

      const updated = await manager.getSession(session.id);
      const dot = exportService.exportSession(updated!, 'dot');

      expect(dot).toContain('digraph');
    });

    it('should export branching structure in Mermaid format', async () => {
      const session = await manager.createSession();

      const start = factory.createThought(createValidInput({ thought: 'Start', thoughtNumber: 1 }), session.id);
      await manager.addThought(session.id, start);

      const path1 = factory.createThought(createValidInput({
        thought: 'Path 1',
        thoughtNumber: 2,
        branchId: 'path-1',
        branchFrom: 'thought-1',
      }), session.id);
      await manager.addThought(session.id, path1);

      const path2 = factory.createThought(createValidInput({
        thought: 'Path 2',
        thoughtNumber: 2,
        branchId: 'path-2',
        branchFrom: 'thought-1',
        nextThoughtNeeded: false,
      }), session.id);
      await manager.addThought(session.id, path2);

      const updated = await manager.getSession(session.id);
      const mermaid = exportService.exportSession(updated!, 'mermaid');

      expect(mermaid).toContain('graph');
    });
  });
});
