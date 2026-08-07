/**
 * ModeHandlerRegistry completeness, derived from the enum rather than a list.
 *
 * `registerAllHandlers()` is a hand-maintained sequence of `registry.replace()`
 * calls. Nothing connects it to `ThinkingMode`, so a mode added without a
 * handler does not fail: `getHandler()` returns a `GenericModeHandler` and the
 * mode quietly loses its specialized validation and thought shaping. The
 * pre-existing coverage was a hardcoded 34-name list asserted with
 * `toBeGreaterThanOrEqual(33)` — it omitted `historical` and would still pass
 * with two handlers missing.
 *
 * Every assertion here is derived from `Object.values(ThinkingMode)`, so a new
 * mode fails at test time instead of degrading at runtime.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ModeHandlerRegistry,
  registerAllHandlers,
  GenericModeHandler,
} from '../../../src/modes/index.js';
import { ThinkingMode } from '../../../src/types/core.js';

const ALL_MODES = Object.values(ThinkingMode) as ThinkingMode[];

describe('registerAllHandlers covers ThinkingMode', () => {
  let registry: ModeHandlerRegistry;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    registerAllHandlers();
    registry = ModeHandlerRegistry.getInstance();
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  it('registers a specialized handler for every ThinkingMode member', () => {
    const missing = ALL_MODES.filter(
      (mode) => !registry.hasSpecializedHandler(mode),
    );

    expect(missing).toEqual([]);
  });

  it('registers exactly as many handlers as there are modes, and no more', () => {
    // An exact count, not `>=`: a stale `>=` cannot catch a missing handler,
    // and it cannot catch a handler registered for a mode that no longer
    // exists either.
    expect(registry.getRegisteredModes().sort()).toEqual([...ALL_MODES].sort());
  });

  it('reports no mode as falling back to the generic handler', () => {
    expect(registry.getStats().modesWithGenericHandler).toEqual([]);
  });

  it.each(ALL_MODES)(
    'returns a specialized, correctly-keyed handler for %s',
    (mode) => {
      const handler = registry.getHandler(mode);

      // Shadowing check: a handler filed under the wrong key would still be
      // "registered", but would build the wrong thought shape.
      expect(handler.mode).toBe(mode);
      expect(handler).not.toBeInstanceOf(GenericModeHandler);
    },
  );

  it('files every handler under exactly one mode', () => {
    // `registerAllHandlers` uses `replace()`, which does not throw on a
    // duplicate. Two `replace(new XHandler())` lines for the same mode would
    // be invisible; so would a copy-paste that registers one class twice.
    const classNames = registry
      .getRegisteredModes()
      .map((mode) => registry.getHandler(mode).constructor.name);

    expect(new Set(classNames).size).toBe(classNames.length);
  });

  it('creates a thought carrying the requested mode for every mode', () => {
    for (const mode of ALL_MODES) {
      const thought = registry.createThought(
        {
          thought: `A ${mode} thought.`,
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          mode,
        } as never,
        'session-1',
      );

      expect(thought.mode, `handler for ${mode} produced the wrong mode`).toBe(
        mode,
      );
    }
  });
});

describe('registry behaviour without registration', () => {
  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  it('falls back to the generic handler when nothing is registered', () => {
    // Proves the completeness assertions above are not tautological: the
    // registry really can return a GenericModeHandler, and really does report
    // modes as unhandled. If this test ever passes trivially, the ones above
    // prove nothing.
    ModeHandlerRegistry.resetInstance();
    const empty = ModeHandlerRegistry.getInstance();

    expect(empty.hasSpecializedHandler(ThinkingMode.CAUSAL)).toBe(false);
    expect(empty.getHandler(ThinkingMode.CAUSAL)).toBeInstanceOf(
      GenericModeHandler,
    );
    expect(empty.getStats().modesWithGenericHandler).toHaveLength(
      ALL_MODES.length,
    );
  });
});
