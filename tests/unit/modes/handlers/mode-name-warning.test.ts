/**
 * Warning tests for a mode name that is replaced.
 *
 * `resolveMode` turns a mode name from the client into a ThinkingMode and replaces
 * a name that is not a mode with sequential. CustomHandler (basedOnModes) and
 * HybridHandler (activeModes and modeContributions) must tell the client about
 * each replaced name in `inputWarnings`, and must add no field when every name
 * is a mode.
 */

import { describe, it, expect } from 'vitest';
import { CustomHandler } from '../../../../src/modes/handlers/CustomHandler.js';
import { HybridHandler } from '../../../../src/modes/handlers/HybridHandler.js';
import { unknownModeWarnings } from '../../../../src/modes/handlers/resolve-mode.js';
import { ThinkingMode } from '../../../../src/types/core.js';

const recognised = Object.values(ThinkingMode).join(', ');

function sentence(field: string, name: string): string {
  return `Unknown ${field} "${name}"; using the default "sequential". Recognised values: ${recognised}.`;
}

const baseInput = {
  thought: 'Warn about the mode names',
  thoughtNumber: 1,
  totalThoughts: 1,
  nextThoughtNeeded: false,
};

function hybridThought(extra: Record<string, unknown>): Record<string, any> {
  const input = { ...baseInput, mode: 'hybrid', ...extra } as any;
  return new HybridHandler().createThought(input, 'session-warn') as any;
}

function customThought(extra: Record<string, unknown>): Record<string, any> {
  const input = { ...baseInput, mode: 'custom', ...extra } as any;
  return new CustomHandler().createThought(input, 'session-warn') as any;
}

describe('unknownModeWarnings', () => {
  it('returns no sentence when the list is absent', () => {
    expect(unknownModeWarnings('activeModes', undefined)).toEqual([]);
  });

  it('returns no sentence for a mode name in any case', () => {
    expect(unknownModeWarnings('activeModes', ['bayesian', 'Causal', 'GAMETHEORY', 'custom'])).toEqual([]);
  });

  it('writes one sentence for a name that is not a mode', () => {
    expect(unknownModeWarnings('activeModes', ['bayesian', 'no_such_mode'])).toEqual([
      sentence('activeModes', 'no_such_mode'),
    ]);
  });

  it('writes the sentences in the order of the first use of each name', () => {
    expect(unknownModeWarnings('basedOnModes', ['zeta', 'causal', 'alpha'])).toEqual([
      sentence('basedOnModes', 'zeta'),
      sentence('basedOnModes', 'alpha'),
    ]);
  });

  it('writes one sentence for a name that the list repeats', () => {
    expect(unknownModeWarnings('activeModes', ['zeta', 'zeta', 'zeta'])).toEqual([
      sentence('activeModes', 'zeta'),
    ]);
  });

  it('treats an empty name as absent, as the other warning helpers do', () => {
    expect(unknownModeWarnings('activeModes', [''])).toEqual([]);
  });

  it('writes a sentence for the names of the object prototype', () => {
    expect(unknownModeWarnings('activeModes', ['constructor', '__proto__'])).toEqual([
      sentence('activeModes', 'constructor'),
      sentence('activeModes', '__proto__'),
    ]);
  });

  it('shortens a long name in the sentence', () => {
    const [text] = unknownModeWarnings('activeModes', ['x'.repeat(100)]);
    expect(text).toContain(`"${'x'.repeat(60)}..."`);
    expect(text).not.toContain('x'.repeat(61));
  });
});

describe('HybridHandler warning for a replaced mode name', () => {
  it('keeps the resolved modes and records one sentence for activeModes', () => {
    const thought = hybridThought({ activeModes: ['Causal', 'no_such_mode'] });

    expect(thought.activeModes).toEqual([ThinkingMode.CAUSAL, ThinkingMode.SEQUENTIAL]);
    expect(thought.inputWarnings).toEqual([sentence('activeModes', 'no_such_mode')]);
  });

  it('records a sentence for the mode of a contribution', () => {
    const thought = hybridThought({
      modeContributions: [
        { mode: 'bayesian', confidence: 0.6 },
        { mode: 'nonsense', confidence: 0.4 },
      ],
    });

    expect(thought.modeContributions.map((c: any) => c.mode)).toEqual([
      ThinkingMode.BAYESIAN,
      ThinkingMode.SEQUENTIAL,
    ]);
    expect(thought.inputWarnings).toEqual([sentence('modeContributions[].mode', 'nonsense')]);
  });

  it('records the sentences of activeModes before those of modeContributions', () => {
    const thought = hybridThought({
      activeModes: ['first_bad'],
      modeContributions: [{ mode: 'second_bad', confidence: 0.5 }],
    });

    expect(thought.inputWarnings).toEqual([
      sentence('activeModes', 'first_bad'),
      sentence('modeContributions[].mode', 'second_bad'),
    ]);
  });

  it('adds no field when every name is a mode or a contribution has no mode', () => {
    const thought = hybridThought({
      activeModes: ['causal', 'Bayesian'],
      modeContributions: [{ mode: 'causal', confidence: 0.5 }, { confidence: 0.5 }],
    });

    expect('inputWarnings' in thought).toBe(false);
  });

  it('adds no field when the client sends no names', () => {
    expect('inputWarnings' in hybridThought({})).toBe(false);
  });
});

describe('CustomHandler warning for a replaced mode name', () => {
  it('keeps the resolved modes and records one sentence for basedOnModes', () => {
    const thought = customThought({ basedOnModes: ['inductive', 'no_such_mode'] });

    expect(thought.basedOnModes).toEqual([ThinkingMode.INDUCTIVE, ThinkingMode.SEQUENTIAL]);
    expect(thought.inputWarnings).toEqual([sentence('basedOnModes', 'no_such_mode')]);
  });

  it('adds no field when every name is a mode', () => {
    expect('inputWarnings' in customThought({ basedOnModes: ['Inductive', 'modal'] })).toBe(false);
  });

  it('adds no field when the client sends no names', () => {
    expect('inputWarnings' in customThought({})).toBe(false);
  });
});
