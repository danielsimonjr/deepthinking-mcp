/**
 * Regression guard: the validation engine is wired into the live request path.
 *
 * `SessionManager.addThought()` is the single funnel every thought-creating
 * tool goes through, so these tests fail the moment validation stops being
 * invoked - which is what turned `src/validation/` into dead code before.
 *
 * Validation is ADVISORY. An invalid thought is still created and stored.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { SessionManager } from '../../../src/session/manager.js';
import { validationCache } from '../../../src/validation/cache.js';
import { ThoughtValidator } from '../../../src/validation/validator.js';
import { ThinkingMode } from '../../../src/types/index.js';
import { randomUUID } from 'crypto';

function makeThought(
  sessionId: string,
  content: string,
  thoughtNumber: number,
  totalThoughts: number,
) {
  return {
    id: randomUUID(),
    sessionId,
    mode: ThinkingMode.SEQUENTIAL,
    content,
    thoughtNumber,
    totalThoughts,
    timestamp: new Date(),
    nextThoughtNeeded: true,
  } as any;
}

describe('advisory validation wiring', () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager();
    validationCache.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('attaches a validation result to every stored thought', async () => {
    const session = await manager.createSession({
      title: 'Wiring',
      mode: ThinkingMode.SEQUENTIAL,
    });

    const updated = await manager.addThought(
      session.id,
      makeThought(session.id, 'A well-formed thought.', 1, 3),
    );

    const stored = updated.thoughts[0];
    expect(stored.validation).toBeDefined();
    expect(stored.validation!.available).toBe(true);
    if (!stored.validation!.available) return;
    expect(typeof stored.validation!.confidence).toBe('number');
    expect(stored.validation!.strengthMetrics).toBeDefined();
  });

  it('stores a thought that fails validation instead of rejecting it', async () => {
    const session = await manager.createSession({
      title: 'Advisory only',
      mode: ThinkingMode.SEQUENTIAL,
    });

    // thoughtNumber > totalThoughts is an error-severity issue today, and this
    // input is accepted by the tool schema. It must keep working.
    const updated = await manager.addThought(
      session.id,
      makeThought(session.id, 'Numbering is inconsistent.', 5, 2),
    );

    expect(updated.thoughts).toHaveLength(1);
    const validation = updated.thoughts[0].validation!;
    expect(validation.available).toBe(true);
    if (!validation.available) return;
    expect(validation.isValid).toBe(false);
    expect(validation.issues.some((i) => i.severity === 'error')).toBe(true);
  });

  it('still stores the thought when the validator throws', async () => {
    vi.spyOn(ThoughtValidator.prototype, 'validate').mockRejectedValue(
      new Error('validator exploded'),
    );

    const session = await manager.createSession({
      title: 'Degrade',
      mode: ThinkingMode.SEQUENTIAL,
    });

    const updated = await manager.addThought(
      session.id,
      makeThought(session.id, 'Validator is broken.', 1, 2),
    );

    expect(updated.thoughts).toHaveLength(1);
    const validation = updated.thoughts[0].validation!;
    expect(validation.available).toBe(false);
    if (validation.available) return;
    expect(validation.reason).toContain('validator exploded');
  });

  it('serves a repeated thought from the validation cache', async () => {
    const session = await manager.createSession({
      title: 'Cache',
      mode: ThinkingMode.SEQUENTIAL,
    });

    await manager.addThought(
      session.id,
      makeThought(session.id, 'Identical content.', 1, 3),
    );
    const before = validationCache.getStats().hits;

    await manager.addThought(
      session.id,
      makeThought(session.id, 'Identical content.', 1, 3),
    );

    expect(validationCache.getStats().hits).toBe(before + 1);
  });

  it('honours the per-session enableValidation flag', async () => {
    const session = await manager.createSession({
      title: 'Disabled',
      mode: ThinkingMode.SEQUENTIAL,
      config: { enableValidation: false } as any,
    });

    const updated = await manager.addThought(
      session.id,
      makeThought(session.id, 'No validation wanted.', 1, 2),
    );

    expect(updated.thoughts[0].validation).toBeUndefined();
  });

  it('returns the validation result to the client from index.ts', () => {
    // Tripwire: the session layer computing validation is useless if the tool
    // response drops it. Guards the one line in handleAddThought that no
    // in-process test can reach (index.ts starts the stdio server on import).
    const indexSource = readFileSync(
      join(process.cwd(), 'src', 'index.ts'),
      'utf-8',
    );
    expect(indexSource).toMatch(/validation:\s*thought\.validation/);
  });
});
