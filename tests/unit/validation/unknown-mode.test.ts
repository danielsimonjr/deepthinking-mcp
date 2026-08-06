/**
 * Modes without a registered validator.
 *
 * This branch is NOT dead code, though no MCP tool can reach it: every mode
 * in the 11 focused tools' schemas has a validator, and so does every mode in
 * the legacy tool. It is reachable for a library caller and for
 * `ThinkingMode.CUSTOM`, the one member deliberately left without a validator
 * because a user-defined mode has no fixed shape to check.
 *
 * These tests used recursive/modal as their vehicle until v9.4.1, when those
 * modes gained registry entries; `custom` is now the only in-enum way in.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ThoughtValidator } from '../../../src/validation/validator.js';
import { validationCache } from '../../../src/validation/cache.js';
import { getSupportedModes } from '../../../src/validation/validators/index.js';
import { ThinkingMode } from '../../../src/types/index.js';
import type { Thought } from '../../../src/types/core.js';

function makeThought(mode: ThinkingMode): Thought {
  return {
    id: 'unknown-1',
    sessionId: 'session-1',
    mode,
    content: 'A thought in a mode with no validator.',
    thoughtNumber: 1,
    totalThoughts: 2,
    timestamp: new Date(),
    nextThoughtNeeded: true,
  } as unknown as Thought;
}

describe('validation for a mode with no validator', () => {
  let validator: ThoughtValidator;

  beforeEach(() => {
    validator = new ThoughtValidator();
    validationCache.clear();
  });

  it('reports a warning, not an error, and stays valid', async () => {
    const result = await validator.validate(makeThought(ThinkingMode.CUSTOM));

    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].severity).toBe('warning');
    expect(result.isValid).toBe(true);
  });

  it('suggests the modes that actually have validators', async () => {
    const result = await validator.validate(makeThought(ThinkingMode.CUSTOM));
    const suggestion = result.issues[0].suggestion;

    // The old hardcoded list named modes that have no validator and omitted
    // ones that do. Derive it so it cannot drift again.
    for (const mode of getSupportedModes()) {
      expect(suggestion).toContain(mode);
    }
    expect(suggestion).not.toContain('custom');
  });

  it('covers every ThinkingMode member without a validator', () => {
    const supported = new Set(getSupportedModes());
    const missing = Object.values(ThinkingMode).filter((m) => !supported.has(m));

    // Only `custom`, and deliberately so. The four advanced runtime modes that
    // used to sit here were unregistered by omission, not by decision.
    expect(missing.sort()).toEqual(['custom']);
  });
});
