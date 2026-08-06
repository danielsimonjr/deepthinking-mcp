/**
 * Validation cache key derivation
 *
 * The cache used to hash the whole thought, including `id` (a fresh uuid per
 * request) and `timestamp`. That made a hit impossible across two requests -
 * the cache cost a SHA-256 per call and returned nothing. The key must cover
 * what validators actually read, and nothing volatile.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ThoughtValidator } from '../../../src/validation/validator.js';
import { validationCache } from '../../../src/validation/cache.js';
import { ThinkingMode } from '../../../src/types/index.js';
import type { Thought } from '../../../src/types/core.js';

function makeThought(overrides: Record<string, unknown> = {}): Thought {
  return {
    id: `id-${Math.random()}`,
    sessionId: `session-${Math.random()}`,
    mode: ThinkingMode.SEQUENTIAL,
    content: 'A stable thought.',
    thoughtNumber: 1,
    totalThoughts: 3,
    timestamp: new Date(),
    nextThoughtNeeded: true,
    ...overrides,
  } as unknown as Thought;
}

describe('validation cache key', () => {
  let validator: ThoughtValidator;

  beforeEach(() => {
    validator = new ThoughtValidator();
    validationCache.clear();
  });

  it('hits for the same content under a different id, session and timestamp', async () => {
    await validator.validate(makeThought());
    await validator.validate(makeThought());

    expect(validationCache.getStats().hits).toBe(1);
  });

  it('misses when the content differs', async () => {
    await validator.validate(makeThought());
    await validator.validate(makeThought({ content: 'A different thought.' }));

    expect(validationCache.getStats().hits).toBe(0);
    expect(validationCache.getStats().misses).toBe(2);
  });

  it('misses when a validation-relevant field differs', async () => {
    await validator.validate(makeThought());
    await validator.validate(makeThought({ totalThoughts: 9 }));

    expect(validationCache.getStats().hits).toBe(0);
  });

  it('ignores top-level field ordering', async () => {
    const base = makeThought({ tags: ['a'], assumptions: ['b'] }) as any;
    await validator.validate(base as Thought);

    // Same values, opposite property declaration order.
    const flipped: any = {};
    for (const key of Object.keys(base).reverse()) flipped[key] = base[key];

    await validator.validate(flipped as Thought);

    expect(validationCache.getStats().hits).toBe(1);
  });

  it('does not reuse a result across differing strictMode', async () => {
    const thought = makeThought();
    await validator.validate(thought, { strictMode: false });
    await validator.validate(thought, { strictMode: true });

    expect(validationCache.getStats().hits).toBe(0);
  });

  it('bypasses the cache when existingThoughts context is supplied', async () => {
    const thought = makeThought();
    const context = { existingThoughts: new Map<string, Thought>() };

    await validator.validate(thought, context);
    await validator.validate(thought, context);

    // Neither stored nor served: a context-sensitive result must not be
    // handed to a caller with a different context.
    expect(validationCache.getStats().hits).toBe(0);
    expect(validationCache.getStats().size).toBe(0);
  });

  it('ignores an advisory result already attached to the thought', async () => {
    const first = makeThought();
    await validator.validate(first);
    const second = makeThought({
      validation: { available: false, reason: 'stale' },
    });

    await validator.validate(second);

    expect(validationCache.getStats().hits).toBe(1);
  });
});
