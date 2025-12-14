/**
 * ModeHandlerRegistry Tests - Phase 10 Sprint 1
 *
 * Tests for the mode handler registry functionality.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ModeHandlerRegistry,
  getRegistry,
  registerHandler,
  createThought,
} from '../../../../src/modes/handlers/registry.js';
import { GenericModeHandler } from '../../../../src/modes/handlers/GenericModeHandler.js';
import {
  ModeHandler,
  validationSuccess,
} from '../../../../src/modes/handlers/ModeHandler.js';
import { ThinkingMode, Thought } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

// Mock specialized handler for testing
class MockCausalHandler implements ModeHandler {
  readonly mode = ThinkingMode.CAUSAL;
  readonly modeName = 'Mock Causal';
  readonly description = 'Mock causal handler for testing';

  createThought(input: ThinkingToolInput, sessionId: string): Thought {
    return {
      id: 'mock-thought-id',
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      mode: ThinkingMode.CAUSAL,
      nextThoughtNeeded: input.nextThoughtNeeded,
      causalGraph: { nodes: [], edges: [] },
      mechanisms: [],
    } as any;
  }

  validate(input: ThinkingToolInput) {
    return validationSuccess();
  }
}

describe('ModeHandlerRegistry', () => {
  let registry: ModeHandlerRegistry;

  beforeEach(() => {
    // Reset the singleton for each test
    ModeHandlerRegistry.resetInstance();
    registry = ModeHandlerRegistry.getInstance();
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ModeHandlerRegistry.getInstance();
      const instance2 = ModeHandlerRegistry.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should reset the instance', () => {
      const instance1 = ModeHandlerRegistry.getInstance();
      ModeHandlerRegistry.resetInstance();
      const instance2 = ModeHandlerRegistry.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Handler Registration', () => {
    it('should register a handler', () => {
      const handler = new MockCausalHandler();
      registry.register(handler);

      expect(registry.hasSpecializedHandler(ThinkingMode.CAUSAL)).toBe(true);
    });

    it('should throw when registering duplicate handler', () => {
      const handler = new MockCausalHandler();
      registry.register(handler);

      expect(() => registry.register(handler)).toThrow(
        /already registered/
      );
    });

    it('should replace an existing handler', () => {
      const handler1 = new MockCausalHandler();
      const handler2 = new MockCausalHandler();

      registry.register(handler1);
      registry.replace(handler2);

      expect(registry.hasSpecializedHandler(ThinkingMode.CAUSAL)).toBe(true);
    });

    it('should unregister a handler', () => {
      const handler = new MockCausalHandler();
      registry.register(handler);

      const removed = registry.unregister(ThinkingMode.CAUSAL);

      expect(removed).toBe(true);
      expect(registry.hasSpecializedHandler(ThinkingMode.CAUSAL)).toBe(false);
    });

    it('should return false when unregistering non-existent handler', () => {
      const removed = registry.unregister(ThinkingMode.CAUSAL);

      expect(removed).toBe(false);
    });
  });

  describe('Handler Lookup', () => {
    it('should return specialized handler when registered', () => {
      const handler = new MockCausalHandler();
      registry.register(handler);

      const retrieved = registry.getHandler(ThinkingMode.CAUSAL);

      expect(retrieved).toBe(handler);
      expect(retrieved.mode).toBe(ThinkingMode.CAUSAL);
    });

    it('should return generic handler when no specialized handler', () => {
      const handler = registry.getHandler(ThinkingMode.BAYESIAN);

      expect(handler).toBeInstanceOf(GenericModeHandler);
      expect(handler.mode).toBe(ThinkingMode.BAYESIAN);
    });

    it('should list registered modes', () => {
      registry.register(new MockCausalHandler());

      const modes = registry.getRegisteredModes();

      expect(modes).toContain(ThinkingMode.CAUSAL);
    });
  });

  describe('Thought Creation', () => {
    it('should create thought using specialized handler', () => {
      const handler = new MockCausalHandler();
      registry.register(handler);

      const input: ThinkingToolInput = {
        mode: 'causal',
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      };

      const thought = registry.createThought(input, 'session-123');

      expect(thought.id).toBe('mock-thought-id');
      expect(thought.mode).toBe(ThinkingMode.CAUSAL);
    });

    it('should create thought using generic handler for unregistered modes', () => {
      const input: ThinkingToolInput = {
        mode: 'sequential',
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      };

      const thought = registry.createThought(input, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.SEQUENTIAL);
      expect(thought.content).toBe('Test thought');
    });

    it('should default to hybrid mode when no mode specified', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      };

      const thought = registry.createThought(input, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });
  });

  describe('Validation', () => {
    it('should validate using specialized handler', () => {
      const handler = new MockCausalHandler();
      registry.register(handler);

      const input: ThinkingToolInput = {
        mode: 'causal',
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      };

      const result = registry.validate(input);

      expect(result.valid).toBe(true);
    });

    it('should fail validation for empty thought', () => {
      const input: ThinkingToolInput = {
        mode: 'sequential',
        thought: '',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
      };

      const result = registry.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('EMPTY_THOUGHT');
    });
  });

  describe('Mode Status', () => {
    it('should return status for mode with specialized handler', () => {
      registry.register(new MockCausalHandler());

      const status = registry.getModeStatus(ThinkingMode.CAUSAL);

      expect(status.mode).toBe(ThinkingMode.CAUSAL);
      expect(status.hasSpecializedHandler).toBe(true);
    });

    it('should return status for mode without specialized handler', () => {
      const status = registry.getModeStatus(ThinkingMode.SEQUENTIAL);

      expect(status.mode).toBe(ThinkingMode.SEQUENTIAL);
      expect(status.hasSpecializedHandler).toBe(false);
      expect(status.isFullyImplemented).toBe(true);
    });

    it('should include note for experimental modes', () => {
      const status = registry.getModeStatus(ThinkingMode.ABDUCTIVE);

      expect(status.isFullyImplemented).toBe(false);
      expect(status.note).toContain('experimental');
    });
  });

  describe('Statistics', () => {
    it('should return registry statistics', () => {
      registry.register(new MockCausalHandler());

      const stats = registry.getStats();

      expect(stats.totalHandlers).toBe(1);
      expect(stats.specializedHandlers).toBe(1);
      expect(stats.modesWithHandlers).toContain(ThinkingMode.CAUSAL);
      expect(stats.modesWithGenericHandler.length).toBeGreaterThan(0);
    });
  });

  describe('Global Functions', () => {
    it('should get registry via getRegistry()', () => {
      const reg = getRegistry();

      expect(reg).toBe(ModeHandlerRegistry.getInstance());
    });

    it('should register handler via registerHandler()', () => {
      registerHandler(new MockCausalHandler());

      expect(getRegistry().hasSpecializedHandler(ThinkingMode.CAUSAL)).toBe(true);
    });

    it('should create thought via createThought()', () => {
      const input: ThinkingToolInput = {
        mode: 'hybrid',
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      };

      const thought = createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });
  });
});
