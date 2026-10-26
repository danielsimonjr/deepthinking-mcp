/**
 * createThoughtTail and the handlers that use it.
 *
 * AlgorithmicHandler, ComputabilityHandler and CryptanalyticHandler end the thought they
 * return with five fields in a fixed order: dependencies, assumptions, uncertainty,
 * isRevision and revisesThought. MathematicsHandler, PhysicsHandler and ShannonHandler write
 * the same fields in another order or apart, and keep their own lines, so the key order of
 * the thoughts they return does not change.
 */

import { describe, it, expect } from 'vitest';
import { createThoughtTail } from '../../../../src/modes/handlers/ModeHandler.js';
import { AlgorithmicHandler } from '../../../../src/modes/handlers/AlgorithmicHandler.js';
import { ComputabilityHandler } from '../../../../src/modes/handlers/ComputabilityHandler.js';
import { CryptanalyticHandler } from '../../../../src/modes/handlers/CryptanalyticHandler.js';
import { MathematicsHandler } from '../../../../src/modes/handlers/MathematicsHandler.js';
import { PhysicsHandler } from '../../../../src/modes/handlers/PhysicsHandler.js';
import { ShannonHandler } from '../../../../src/modes/handlers/ShannonHandler.js';
import type { ModeHandler } from '../../../../src/modes/handlers/ModeHandler.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

const TAIL = ['dependencies', 'assumptions', 'uncertainty', 'isRevision', 'revisesThought'];

const inputFor = (mode: string, extra: Record<string, unknown> = {}): ThinkingToolInput =>
  ({
    mode,
    thought: 'a thought',
    thoughtNumber: 2,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    ...extra,
  }) as unknown as ThinkingToolInput;

describe('createThoughtTail', () => {
  it('returns the five fields in a fixed order', () => {
    expect(Object.keys(createThoughtTail(inputFor('algorithmic')))).toEqual(TAIL);
  });

  it('fills the defaults: two empty lists, an uncertainty of 0.5 and two undefined fields', () => {
    const tail = createThoughtTail(inputFor('algorithmic'));

    expect(tail.dependencies).toEqual([]);
    expect(tail.assumptions).toEqual([]);
    expect(tail.uncertainty).toBe(0.5);
    expect('isRevision' in tail).toBe(true);
    expect(tail.isRevision).toBeUndefined();
    expect('revisesThought' in tail).toBe(true);
    expect(tail.revisesThought).toBeUndefined();
  });

  it('returns a new empty list for each call', () => {
    const a = createThoughtTail(inputFor('algorithmic'));
    const b = createThoughtTail(inputFor('algorithmic'));

    expect(a.dependencies).not.toBe(b.dependencies);
    expect(a.assumptions).not.toBe(b.assumptions);
  });

  it('keeps the given lists and does not copy them', () => {
    const dependencies = ['t1'];
    const assumptions = ['x'];
    const tail = createThoughtTail(inputFor('algorithmic', { dependencies, assumptions }));

    expect(tail.dependencies).toBe(dependencies);
    expect(tail.assumptions).toBe(assumptions);
  });

  it('keeps an uncertainty of 0', () => {
    expect(createThoughtTail(inputFor('algorithmic', { uncertainty: 0 })).uncertainty).toBe(0);
  });

  it('keeps a given uncertainty', () => {
    expect(createThoughtTail(inputFor('algorithmic', { uncertainty: 0.25 })).uncertainty).toBe(0.25);
  });

  it('replaces a missing uncertainty and a null uncertainty with 0.5', () => {
    expect(createThoughtTail(inputFor('algorithmic', { uncertainty: null })).uncertainty).toBe(0.5);
  });

  it('keeps isRevision false and an empty revisesThought', () => {
    const tail = createThoughtTail(inputFor('algorithmic', { isRevision: false, revisesThought: '' }));

    expect(tail.isRevision).toBe(false);
    expect(tail.revisesThought).toBe('');
  });

  it('copies isRevision and revisesThought as given', () => {
    const tail = createThoughtTail(inputFor('algorithmic', { isRevision: true, revisesThought: 't1' }));

    expect(tail.isRevision).toBe(true);
    expect(tail.revisesThought).toBe('t1');
  });

  it('replaces a falsy list with an empty list', () => {
    const empty = createThoughtTail(inputFor('algorithmic', { dependencies: '', assumptions: 0 }));
    const missing = createThoughtTail(inputFor('algorithmic', { dependencies: null, assumptions: null }));

    expect(empty.dependencies).toEqual([]);
    expect(empty.assumptions).toEqual([]);
    expect(missing.dependencies).toEqual([]);
    expect(missing.assumptions).toEqual([]);
  });
});

const tailKeysOf = (handler: ModeHandler, mode: string, extra: Record<string, unknown> = {}) => {
  const thought = handler.createThought(inputFor(mode, extra), 'sess-1') as unknown as Record<string, unknown>;
  const keys = Object.keys(thought);
  return { thought, keys, tail: keys.filter((k) => TAIL.includes(k)) };
};

const users: Array<[string, ModeHandler, string]> = [
  ['AlgorithmicHandler', new AlgorithmicHandler(), 'algorithmic'],
  ['ComputabilityHandler', new ComputabilityHandler(), 'computability'],
  ['CryptanalyticHandler', new CryptanalyticHandler(), 'cryptanalytic'],
];

describe.each(users)('%s ends its thought with the tail', (_name, handler, mode) => {
  it('writes the five fields together and in order', () => {
    const { keys, tail } = tailKeysOf(handler, mode);
    const first = keys.indexOf('dependencies');

    expect(tail).toEqual(TAIL);
    expect(keys.slice(first, first + 5)).toEqual(TAIL);
    expect(keys.indexOf('keyInsight')).toBe(first - 1);
  });

  it('writes the defaults', () => {
    const { thought } = tailKeysOf(handler, mode);

    expect(thought.dependencies).toEqual([]);
    expect(thought.assumptions).toEqual([]);
    expect(thought.uncertainty).toBe(0.5);
    expect(thought.isRevision).toBeUndefined();
    expect(thought.revisesThought).toBeUndefined();
  });

  it('writes the given values', () => {
    const { thought } = tailKeysOf(handler, mode, {
      dependencies: ['t1'],
      assumptions: ['x'],
      uncertainty: 0,
      isRevision: true,
      revisesThought: 't1',
    });

    expect(thought.dependencies).toEqual(['t1']);
    expect(thought.assumptions).toEqual(['x']);
    expect(thought.uncertainty).toBe(0);
    expect(thought.isRevision).toBe(true);
    expect(thought.revisesThought).toBe('t1');
  });
});

describe('handlers that keep their own lines', () => {
  it('ShannonHandler writes uncertainty before the two lists', () => {
    const { tail } = tailKeysOf(new ShannonHandler(), 'shannon');

    expect(tail).toEqual(['uncertainty', 'dependencies', 'assumptions', 'isRevision', 'revisesThought']);
  });

  it.each([
    ['MathematicsHandler', new MathematicsHandler(), 'mathematics'],
    ['PhysicsHandler', new PhysicsHandler(), 'physics'],
  ] as Array<[string, ModeHandler, string]>)('%s writes the revision fields apart from the other three', (_n, handler, mode) => {
    const { keys, tail } = tailKeysOf(handler, mode);

    expect(tail).toEqual(TAIL);
    expect(keys.indexOf('isRevision') - keys.indexOf('uncertainty')).toBeGreaterThan(1);
  });
});
