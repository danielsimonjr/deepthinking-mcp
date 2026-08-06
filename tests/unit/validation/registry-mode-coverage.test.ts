/**
 * Registry / ThinkingMode mapping pin.
 *
 * `VALIDATOR_REGISTRY` is the only thing that connects a `ThinkingMode` to the
 * validator written for it. A mode with no entry does not fail loudly: it
 * silently receives `"No validator registered for thinking mode: X"` as its
 * advisory output while its ~430-line validator sits unreferenced. That is
 * exactly how `constraint`, `modal`, `recursive` and `stochastic` stayed dead.
 *
 * These tests pin the mapping in BOTH directions, so a new mode added without
 * a validator fails here rather than reaching a client as an advisory message:
 * - every `ThinkingMode` member is registered, or is listed below with a reason
 * - the registry maps no mode that is not a `ThinkingMode` member
 *
 * The live-path test then proves the registered validators actually run
 * through `SessionManager.addThought()`, which is the funnel every
 * thought-creating tool goes through.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'crypto';
import { SessionManager } from '../../../src/session/manager.js';
import { validationCache } from '../../../src/validation/cache.js';
import {
  getSupportedModes,
  getValidatorForMode,
} from '../../../src/validation/validators/registry.js';
import { ThinkingMode } from '../../../src/types/core.js';

/**
 * `ThinkingMode` members that deliberately have no validator.
 *
 * - custom: user-defined mode. Its shape is supplied by the caller at
 *   runtime, so there is no fixed structure a mode validator could check.
 *   `validateCommon` alone would add nothing the generic path does not.
 *
 * Adding a member here is a decision, not a formality: it means thoughts of
 * that mode reach clients carrying the "No validator registered" advisory.
 */
const DELIBERATELY_UNVALIDATED: string[] = [ThinkingMode.CUSTOM];

/**
 * Modes that were registered to close the gap, verified end-to-end below.
 * `meta` is intentionally absent: `MetaValidator.getMode()` returns "meta",
 * but there is no `meta` ThinkingMode member — `metareasoning` is the real
 * mode and has its own registered validator — so nothing can ever produce a
 * thought that validator would run on.
 */
const NEWLY_REGISTERED = ['constraint', 'modal', 'recursive', 'stochastic'];

describe('VALIDATOR_REGISTRY covers ThinkingMode', () => {
  const allModes = Object.values(ThinkingMode) as string[];

  it('registers a validator for every ThinkingMode member', () => {
    const registered = new Set(getSupportedModes());
    const missing = allModes.filter(
      (mode) =>
        !registered.has(mode) && !DELIBERATELY_UNVALIDATED.includes(mode),
    );

    expect(missing).toEqual([]);
  });

  it('maps no mode that is not a ThinkingMode member', () => {
    const modes = new Set(allModes);
    const stray = getSupportedModes().filter((mode) => !modes.has(mode));

    // `meta` would land here if it were ever registered.
    expect(stray).toEqual([]);
  });

  it('has no ThinkingMode member that is both registered and exempted', () => {
    const registered = new Set(getSupportedModes());
    const contradictory = DELIBERATELY_UNVALIDATED.filter((mode) =>
      registered.has(mode),
    );

    expect(contradictory).toEqual([]);
  });

  it.each(NEWLY_REGISTERED)(
    'resolves a validator instance for %s whose getMode matches',
    async (mode) => {
      const validator = await getValidatorForMode(mode);

      expect(validator).toBeDefined();
      expect(validator!.getMode()).toBe(mode);
    },
  );
});

describe('newly registered validators run on the live path', () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager();
    validationCache.clear();
  });

  it.each(NEWLY_REGISTERED)(
    'a %s thought no longer carries the "no validator" advisory',
    async (mode) => {
      const session = await manager.createSession({
        title: `Live ${mode}`,
        mode: mode as ThinkingMode,
      });

      const updated = await manager.addThought(session.id, {
        id: randomUUID(),
        sessionId: session.id,
        mode: mode as ThinkingMode,
        content: 'A thought in a previously unregistered mode.',
        thoughtNumber: 1,
        totalThoughts: 2,
        timestamp: new Date(),
        nextThoughtNeeded: true,
      } as never);

      const validation = updated.thoughts[0].validation;
      expect(validation).toBeDefined();
      expect(validation!.available).toBe(true);
      if (!validation!.available) return;

      const descriptions = validation!.issues.map((i) => i.description);
      expect(
        descriptions.some((d) => d.startsWith('No validator registered')),
      ).toBe(false);
    },
  );

  it('reports real mode-specific feedback rather than a generic message', async () => {
    // A constraint thought with an empty `constraints` array is the
    // ConstraintValidator's own warning, unreachable while the mode was
    // unregistered. Its presence proves that validator ran, not just that
    // the generic message is gone.
    const session = await manager.createSession({
      title: 'Constraint feedback',
      mode: ThinkingMode.CONSTRAINT,
    });

    const updated = await manager.addThought(session.id, {
      id: randomUUID(),
      sessionId: session.id,
      mode: ThinkingMode.CONSTRAINT,
      content: 'Solve the scheduling problem.',
      thoughtNumber: 1,
      totalThoughts: 2,
      timestamp: new Date(),
      nextThoughtNeeded: true,
      constraints: [],
    } as never);

    const validation = updated.thoughts[0].validation!;
    expect(validation.available).toBe(true);
    if (!validation.available) return;

    expect(
      validation.issues.some((i) =>
        i.description.includes(
          'Constraint-based reasoning should define constraints',
        ),
      ),
    ).toBe(true);
  });
});
