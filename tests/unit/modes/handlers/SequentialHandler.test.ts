/**
 * SequentialHandler Unit Tests - Phase 10 Sprint 3
 *
 * Tests for the specialized SequentialHandler:
 * - Thought creation with revision tracking
 * - Branching support
 * - Dependency tracking
 * - Validation of sequential-specific fields
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SequentialHandler } from '../../../../src/modes/handlers/SequentialHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('SequentialHandler', () => {
  let handler: SequentialHandler;

  beforeEach(() => {
    handler = new SequentialHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.SEQUENTIAL);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Sequential Thinking');
    });

    it('should have a description', () => {
      expect(handler.description).toBeTruthy();
      expect(handler.description).toContain('Step-by-step');
    });
  });

  describe('createThought', () => {
    it('should create a basic sequential thought', () => {
      const input: ThinkingToolInput = {
        thought: 'First step in reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.SEQUENTIAL);
      expect(thought.content).toBe('First step in reasoning');
      expect(thought.sessionId).toBe('session-1');
      expect(thought.thoughtNumber).toBe(1);
      expect(thought.totalThoughts).toBe(5);
      expect(thought.nextThoughtNeeded).toBe(true);
    });

    it('should create thought with revision tracking', () => {
      const input: ThinkingToolInput = {
        thought: 'Revised understanding',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
        isRevision: true,
        revisesThought: 'thought-1-id',
        revisionReason: 'Found new evidence',
      };

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('thought-1-id');
      expect(thought.revisionReason).toBe('Found new evidence');
    });

    it('should create thought with branching support', () => {
      const input: ThinkingToolInput = {
        thought: 'Alternative approach',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
        branchFrom: 'thought-2-id',
        branchId: 'branch-a',
      };

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.branchFrom).toBe('thought-2-id');
      expect(thought.branchId).toBe('branch-a');
    });

    it('should create thought with dependencies', () => {
      const input: ThinkingToolInput = {
        thought: 'Depends on previous thoughts',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
        dependencies: ['thought-1', 'thought-2', 'thought-3'],
      };

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.dependencies).toEqual(['thought-1', 'thought-2', 'thought-3']);
    });

    it('should set needsMoreThoughts from nextThoughtNeeded', () => {
      const input: ThinkingToolInput = {
        thought: 'Final thought',
        thoughtNumber: 5,
        totalThoughts: 5,
        nextThoughtNeeded: false,
        mode: 'sequential',
      };

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.needsMoreThoughts).toBe(false);
    });

    it('should generate unique id for each thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
      };

      const thought1 = handler.createThought(input, 'session-1');
      const thought2 = handler.createThought(input, 'session-1');

      expect(thought1.id).toBeDefined();
      expect(thought2.id).toBeDefined();
      expect(thought1.id).not.toBe(thought2.id);
    });

    it('should set timestamp on thought creation', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
      };

      const before = new Date();
      const thought = handler.createThought(input, 'session-1');
      const after = new Date();

      expect(thought.timestamp).toBeInstanceOf(Date);
      expect(thought.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(thought.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('validate', () => {
    it('should pass validation for valid input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid sequential reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for empty thought', () => {
      const input: ThinkingToolInput = {
        thought: '',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should fail validation for whitespace-only thought', () => {
      const input: ThinkingToolInput = {
        thought: '   \n\t  ',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should fail when thoughtNumber exceeds totalThoughts', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 10,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_THOUGHT_NUMBER')).toBe(true);
    });

    it('should warn when isRevision is true but revisesThought is missing', () => {
      const input: ThinkingToolInput = {
        thought: 'Revised thought',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
        isRevision: true,
        // Missing revisesThought
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'revisesThought')).toBe(true);
    });

    it('should warn when revisesThought is set but isRevision is false', () => {
      const input: ThinkingToolInput = {
        thought: 'Thought with revision reference',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
        revisesThought: 'thought-1',
        // isRevision not set
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'isRevision')).toBe(true);
    });

    it('should warn when branchFrom is set but branchId is missing', () => {
      const input: ThinkingToolInput = {
        thought: 'Branching thought',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
        branchFrom: 'thought-2',
        // Missing branchId
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'branchId')).toBe(true);
    });

    it('should warn when revision lacks revisionReason', () => {
      const input: ThinkingToolInput = {
        thought: 'Revised thought',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
        isRevision: true,
        revisesThought: 'thought-1',
        // Missing revisionReason
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'revisionReason')).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide related modes', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.relatedModes).toContain(ThinkingMode.HYBRID);
      expect(enhancements.relatedModes).toContain(ThinkingMode.SHANNON);
    });

    it('should provide mental models', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.mentalModels).toContain('Iterative Refinement');
      expect(enhancements.mentalModels).toContain('Step-by-Step Analysis');
    });

    it('should provide progress metrics', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.metrics).toBeDefined();
      expect(enhancements.metrics!.thoughtNumber).toBe(3);
      expect(enhancements.metrics!.totalThoughts).toBe(5);
      expect(enhancements.metrics!.progress).toBeCloseTo(0.6, 2);
    });

    it('should suggest exploring problem space early in progression', () => {
      const thought = handler.createThought({
        thought: 'Initial exploration',
        thoughtNumber: 1,
        totalThoughts: 10,
        nextThoughtNeeded: true,
        mode: 'sequential',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.suggestions!.some(s =>
        s.includes('problem space') || s.includes('understanding')
      )).toBe(true);
    });

    it('should suggest branching mid-progression', () => {
      const thought = handler.createThought({
        thought: 'Mid-point analysis',
        thoughtNumber: 5,
        totalThoughts: 10,
        nextThoughtNeeded: true,
        mode: 'sequential',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.suggestions!.some(s => s.includes('branch'))).toBe(true);
    });

    it('should suggest synthesizing late in progression', () => {
      const thought = handler.createThought({
        thought: 'Final thoughts',
        thoughtNumber: 9,
        totalThoughts: 10,
        nextThoughtNeeded: true,
        mode: 'sequential',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.suggestions!.some(s =>
        s.includes('synth') || s.includes('conclusion')
      )).toBe(true);
    });

    it('should track revision in metrics', () => {
      const thought = handler.createThought({
        thought: 'Revised thought',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
        isRevision: true,
        revisesThought: 'thought-1',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.metrics!.isRevision).toBe(1);
    });

    it('should track branch in metrics', () => {
      const thought = handler.createThought({
        thought: 'Branch thought',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
        branchFrom: 'thought-2',
        branchId: 'branch-a',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.metrics!.hasBranch).toBe(1);
    });

    it('should track dependency count in metrics', () => {
      const thought = handler.createThought({
        thought: 'Dependent thought',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
        dependencies: ['t1', 't2', 't3'],
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.metrics!.dependencyCount).toBe(3);
    });

    it('should warn about revision without reason', () => {
      const thought = handler.createThought({
        thought: 'Revised thought',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
        isRevision: true,
        revisesThought: 'thought-1',
        // No revisionReason
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.warnings!.some(w => w.includes('reason'))).toBe(true);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support initial thought type', () => {
      expect(handler.supportsThoughtType('initial')).toBe(true);
    });

    it('should support continuation thought type', () => {
      expect(handler.supportsThoughtType('continuation')).toBe(true);
    });

    it('should support revision thought type', () => {
      expect(handler.supportsThoughtType('revision')).toBe(true);
    });

    it('should support branch thought type', () => {
      expect(handler.supportsThoughtType('branch')).toBe(true);
    });

    it('should support conclusion thought type', () => {
      expect(handler.supportsThoughtType('conclusion')).toBe(true);
    });

    it('should not support unknown thought type', () => {
      expect(handler.supportsThoughtType('unknown_type')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete sequential reasoning session', () => {
      // Step 1: Initial thought
      const step1 = handler.createThought({
        thought: 'Define the problem: How to optimize database queries?',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'sequential',
      }, 'session-1') as any;

      expect(step1.mode).toBe(ThinkingMode.SEQUENTIAL);
      expect(step1.thoughtNumber).toBe(1);

      // Step 2: Analysis
      const step2 = handler.createThought({
        thought: 'Current queries are doing full table scans',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'sequential',
        dependencies: [step1.id],
      }, 'session-1') as any;

      expect(step2.dependencies).toContain(step1.id);

      // Step 3: Revision based on new information
      const step3 = handler.createThought({
        thought: 'Actually, the issue is missing indexes, not table scans',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'sequential',
        isRevision: true,
        revisesThought: step2.id,
        revisionReason: 'Discovered actual root cause',
      }, 'session-1') as any;

      expect(step3.isRevision).toBe(true);
      expect(step3.revisesThought).toBe(step2.id);

      // Step 4: Conclusion
      const step4 = handler.createThought({
        thought: 'Solution: Add composite index on columns A and B',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        mode: 'sequential',
        dependencies: [step1.id, step3.id],
      }, 'session-1') as any;

      expect(step4.needsMoreThoughts).toBe(false);
      expect(step4.dependencies).toContain(step1.id);
      expect(step4.dependencies).toContain(step3.id);
    });

    it('should handle branching exploration', () => {
      // Main reasoning path
      const mainPath = handler.createThought({
        thought: 'Approach A: Use caching',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
      }, 'session-1') as any;

      // Branch to explore alternative
      const branchA = handler.createThought({
        thought: 'Alternative: Use read replicas instead',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
        branchFrom: mainPath.id,
        branchId: 'branch-replicas',
      }, 'session-1') as any;

      expect(branchA.branchFrom).toBe(mainPath.id);
      expect(branchA.branchId).toBe('branch-replicas');

      // Continue on branch
      const branchA2 = handler.createThought({
        thought: 'Read replicas would reduce load on primary',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
        branchId: 'branch-replicas',
        dependencies: [branchA.id],
      }, 'session-1') as any;

      expect(branchA2.branchId).toBe('branch-replicas');
      expect(branchA2.dependencies).toContain(branchA.id);
    });
  });
});
