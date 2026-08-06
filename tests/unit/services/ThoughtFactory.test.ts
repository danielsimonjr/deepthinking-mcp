/**
 * ThoughtFactory Tests
 * Tests for src/services/ThoughtFactory.ts
 *
 * ThoughtFactory is imported by dozens of test files, but always as a way to
 * build a thought for some other assertion. These tests exercise the factory
 * at its own surface: mode resolution, delegation to ModeHandlerRegistry, the
 * pass-through methods, and logger injection.
 *
 * Note that ModeHandlerRegistry is a process-wide singleton, so handler
 * registration is shared with every other test in the run. Nothing here
 * asserts on an empty registry.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/index.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ILogger } from '../../../src/interfaces/ILogger.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

/** Minimal ILogger recording calls, for asserting on delegation side effects. */
const createFakeLogger = (): ILogger & { debug: ReturnType<typeof vi.fn> } => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  getLogs: () => [],
  clearLogs: () => {},
  setLevel: () => {},
  exportLogs: () => '[]',
});

const createInput = (
  overrides: Partial<ThinkingToolInput> = {},
): ThinkingToolInput =>
  ({
    thought: 'A test thought',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    mode: 'sequential',
    ...overrides,
  }) as ThinkingToolInput;

describe('ThoughtFactory', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    factory = new ThoughtFactory({ logger: createFakeLogger() });
  });

  describe('createThought', () => {
    it('builds a thought carrying the requested mode and session', () => {
      const thought = factory.createThought(
        createInput({ thought: 'Step one', mode: 'sequential' }),
        'session-abc',
      );

      expect(thought.mode).toBe(ThinkingMode.SEQUENTIAL);
      expect(thought.sessionId).toBe('session-abc');
      expect(thought.content).toBe('Step one');
      expect(thought.thoughtNumber).toBe(1);
      expect(thought.totalThoughts).toBe(3);
      expect(thought.nextThoughtNeeded).toBe(true);
    });

    it('gives every thought a distinct id', () => {
      const a = factory.createThought(createInput(), 'session-1');
      const b = factory.createThought(createInput(), 'session-1');

      expect(a.id).toBeTruthy();
      expect(b.id).toBeTruthy();
      expect(a.id).not.toBe(b.id);
    });

    it('produces a hybrid thought when the input names no mode', () => {
      const input = createInput();
      delete (input as Record<string, unknown>).mode;

      const thought = factory.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });

    it('produces a hybrid thought when the mode is an empty string', () => {
      const thought = factory.createThought(
        createInput({ mode: '' as ThinkingMode }),
        'session-1',
      );

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });

    it('resolves a missing mode to hybrid in its own bookkeeping', () => {
      // The factory computes `(input.mode as ThinkingMode) || HYBRID`, but it
      // forwards the untouched `input` to the registry -- so that local only
      // reaches the debug log and the handler lookup, and the hybrid thought
      // above is produced by the registry's own defaulting, not by this line.
      // The log is therefore the only place the factory's resolution is
      // observable, and it is asserted here so the two defaults cannot drift
      // apart unnoticed.
      const logger = createFakeLogger();
      const loggingFactory = new ThoughtFactory({ logger });
      const input = createInput();
      delete (input as Record<string, unknown>).mode;
      logger.debug.mockClear();

      const thought = loggingFactory.createThought(input, 'session-1');

      const createCall = logger.debug.mock.calls.find(
        (call) => call[0] === 'Creating thought',
      );
      expect(createCall?.[1]).toMatchObject({ mode: ThinkingMode.HYBRID });
      expect(thought.mode).toBe(ThinkingMode.HYBRID);
    });

    it('routes each mode to that mode`s own handler', () => {
      const modes = [
        ThinkingMode.BAYESIAN,
        ThinkingMode.CAUSAL,
        ThinkingMode.DEDUCTIVE,
        ThinkingMode.TEMPORAL,
        ThinkingMode.SYNTHESIS,
      ];

      for (const mode of modes) {
        const thought = factory.createThought(createInput({ mode }), 'sess');
        expect(thought.mode).toBe(mode);
      }
    });

    it('preserves revision metadata through the handler', () => {
      const thought = factory.createThought(
        createInput({
          thoughtNumber: 2,
          isRevision: true,
          revisesThought: 'thought-1',
        }),
        'session-1',
      );

      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('thought-1');
    });

    it('preserves branch metadata through the handler', () => {
      const thought = factory.createThought(
        createInput({ branchId: 'branch-a', branchFrom: 'thought-1' }),
        'session-1',
      );

      expect(thought.branchId).toBe('branch-a');
      expect(thought.branchFrom).toBe('thought-1');
    });

    it('logs the mode it is about to create through the injected logger', () => {
      const logger = createFakeLogger();
      const loggingFactory = new ThoughtFactory({ logger });
      logger.debug.mockClear();

      loggingFactory.createThought(
        createInput({ mode: ThinkingMode.BAYESIAN }),
        'session-9',
      );

      const messages = logger.debug.mock.calls.map((call) => call[0]);
      expect(messages).toContain('Creating thought');
      const createCall = logger.debug.mock.calls.find(
        (call) => call[0] === 'Creating thought',
      );
      expect(createCall?.[1]).toMatchObject({
        sessionId: 'session-9',
        mode: ThinkingMode.BAYESIAN,
      });
    });
  });

  describe('handler registration', () => {
    it('registers handlers on construction by default', () => {
      const logger = createFakeLogger();

      new ThoughtFactory({ logger });

      const messages = logger.debug.mock.calls.map((call) => call[0]);
      expect(messages).toContain('All mode handlers registered');
    });

    it('skips registration when autoRegisterHandlers is false', () => {
      const logger = createFakeLogger();

      new ThoughtFactory({ logger, autoRegisterHandlers: false });

      const messages = logger.debug.mock.calls.map((call) => call[0]);
      expect(messages).not.toContain('All mode handlers registered');
    });

    it('reports a specialized handler for a mode that has one', () => {
      expect(factory.hasSpecializedHandler(ThinkingMode.BAYESIAN)).toBe(true);
      expect(factory.hasSpecializedHandler(ThinkingMode.CAUSAL)).toBe(true);
    });

    it('reports no specialized handler for an unregistered mode', () => {
      expect(
        factory.hasSpecializedHandler('not-a-mode' as ThinkingMode),
      ).toBe(false);
    });

    it('getStats reports the registered handler count and mode list', () => {
      const stats = factory.getStats();

      expect(stats.specializedHandlers).toBeGreaterThan(0);
      expect(stats.specializedHandlers).toBe(stats.modesWithHandlers.length);
      expect(stats.modesWithHandlers).toContain(ThinkingMode.BAYESIAN);
      expect(stats.modesWithHandlers).toContain(ThinkingMode.SEQUENTIAL);
    });
  });

  describe('registry pass-through', () => {
    it('getRegistry returns the shared registry singleton', () => {
      expect(factory.getRegistry()).toBe(ModeHandlerRegistry.getInstance());
    });

    it('validate delegates to the registry and returns its result', () => {
      const registry = ModeHandlerRegistry.getInstance();
      const expected = { valid: false, errors: ['boom'], warnings: [] };
      const spy = vi
        .spyOn(registry, 'validate')
        .mockReturnValue(expected as never);

      try {
        const input = createInput();
        expect(factory.validate(input)).toBe(expected);
        expect(spy).toHaveBeenCalledWith(input);
      } finally {
        spy.mockRestore();
      }
    });

    it('validate accepts a well-formed input', () => {
      const result = factory.validate(createInput());

      expect(result.valid).toBe(true);
    });

    it('getModeStatus delegates to the registry', () => {
      const status = factory.getModeStatus(ThinkingMode.BAYESIAN);

      expect(status.mode).toBe(ThinkingMode.BAYESIAN);
      expect(status.hasSpecializedHandler).toBe(true);
    });
  });
});
