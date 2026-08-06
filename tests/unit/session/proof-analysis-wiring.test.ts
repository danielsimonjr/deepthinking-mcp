/**
 * Regression guard: the proof-decomposition subsystem is wired into the live
 * request path.
 *
 * `src/proof/` was 13 complete modules that nothing outside `src/proof/` ever
 * imported - a documented feature that no client could reach. These tests fail
 * the moment `SessionManager.addThought()` stops invoking it, which is the way
 * it became dead code the first time.
 *
 * Proof analysis is ADVISORY. A gap, a cycle, or an inconsistency is feedback;
 * it never rejects the thought.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { SessionManager } from '../../../src/session/manager.js';
import { ProofDecomposer } from '../../../src/proof/decomposer.js';
import { validationCache } from '../../../src/validation/cache.js';
import { ThinkingMode } from '../../../src/types/index.js';
import { randomUUID } from 'crypto';

const PROOF = [
  'Assume that sqrt(2) is rational.',
  'Then sqrt(2) = a/b where a and b are integers with no common factor.',
  'Squaring both sides, we have 2 = a^2/b^2.',
  'Therefore a^2 = 2 b^2.',
  'Since a^2 is even, a is even.',
  'Let a = 2k for some integer k.',
  'This implies b^2 = 2k^2.',
  'Therefore a and b share the common factor 2.',
].join('\n');

function mathThought(sessionId: string, extra: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    sessionId,
    mode: ThinkingMode.MATHEMATICS,
    thoughtType: 'proof_construction',
    content: PROOF,
    thoughtNumber: 1,
    totalThoughts: 2,
    timestamp: new Date(),
    nextThoughtNeeded: true,
    dependencies: [],
    assumptions: [],
    uncertainty: 0.2,
    ...extra,
  } as any;
}

describe('proof analysis wiring', () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager();
    validationCache.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('attaches a proof analysis to a stored proof-bearing thought', async () => {
    const session = await manager.createSession({
      title: 'Proof wiring',
      mode: ThinkingMode.MATHEMATICS,
    });

    const updated = await manager.addThought(
      session.id,
      mathThought(session.id),
    );

    const stored = updated.thoughts[0] as any;
    expect(stored.proofAnalysis).toBeDefined();
    expect(stored.proofAnalysis.available).toBe(true);
    if (!stored.proofAnalysis.available) return;
    expect(stored.proofAnalysis.atoms.length).toBeGreaterThan(1);
    expect(typeof stored.proofAnalysis.completeness).toBe('number');
  });

  it('leaves a thought with no proof content alone', async () => {
    const session = await manager.createSession({
      title: 'No proof',
      mode: ThinkingMode.SEQUENTIAL,
    });

    const updated = await manager.addThought(session.id, {
      id: randomUUID(),
      sessionId: session.id,
      mode: ThinkingMode.SEQUENTIAL,
      content: PROOF,
      thoughtNumber: 1,
      totalThoughts: 2,
      timestamp: new Date(),
      nextThoughtNeeded: true,
    } as any);

    expect((updated.thoughts[0] as any).proofAnalysis).toBeUndefined();
  });

  it('stores a thought whose proof has gaps instead of rejecting it', async () => {
    const session = await manager.createSession({
      title: 'Gappy',
      mode: ThinkingMode.MATHEMATICS,
    });

    const updated = await manager.addThought(
      session.id,
      mathThought(session.id, {
        content: [
          'Assume x is an arbitrary real number.',
          'Therefore x squared is greater than every other real number.',
          'Hence the theorem holds.',
        ].join('\n'),
      }),
    );

    expect(updated.thoughts).toHaveLength(1);
    expect((updated.thoughts[0] as any).proofAnalysis.available).toBe(true);
  });

  it('still stores the thought when the decomposer throws', async () => {
    vi.spyOn(ProofDecomposer.prototype, 'decompose').mockImplementation(() => {
      throw new Error('decomposer exploded');
    });

    const session = await manager.createSession({
      title: 'Degrade',
      mode: ThinkingMode.MATHEMATICS,
    });

    const updated = await manager.addThought(
      session.id,
      mathThought(session.id),
    );

    expect(updated.thoughts).toHaveLength(1);
    const analysis = (updated.thoughts[0] as any).proofAnalysis;
    expect(analysis.available).toBe(false);
    expect(analysis.reason).toContain('decomposer exploded');
  });

  it('does not overwrite a caller-supplied decomposition', async () => {
    const supplied = {
      id: 'caller-decomposition',
      originalProof: 'caller proof',
      atoms: [],
      dependencies: {
        nodes: new Map(),
        edges: [],
        roots: [],
        leaves: [],
        depth: 0,
        width: 0,
        hasCycles: false,
      },
      assumptionChains: [],
      gaps: [],
      implicitAssumptions: [],
      completeness: 0.77,
      rigorLevel: 'formal',
      atomCount: 0,
      maxDependencyDepth: 0,
    };
    const session = await manager.createSession({
      title: 'Caller decomposition',
      mode: ThinkingMode.MATHEMATICS,
    });

    const updated = await manager.addThought(
      session.id,
      mathThought(session.id, { decomposition: supplied }),
    );

    const stored = updated.thoughts[0] as any;
    expect(stored.decomposition).toBe(supplied);
    expect(stored.proofAnalysis.decompositionSource).toBe('caller-supplied');
    expect(stored.proofAnalysis.completeness).toBe(0.77);
  });

  it('honours the per-session enableProofAnalysis flag', async () => {
    const session = await manager.createSession({
      title: 'Disabled',
      mode: ThinkingMode.MATHEMATICS,
      config: { enableProofAnalysis: false } as any,
    });

    const updated = await manager.addThought(
      session.id,
      mathThought(session.id),
    );

    expect((updated.thoughts[0] as any).proofAnalysis).toBeUndefined();
  });

  it('returns the proof analysis to the client from index.ts', () => {
    // Tripwire: computing the analysis is useless if the tool response drops
    // it. Guards the one line in handleAddThought that no in-process test can
    // reach (index.ts starts the stdio server on import).
    const indexSource = readFileSync(
      join(process.cwd(), 'src', 'index.ts'),
      'utf-8',
    );
    expect(indexSource).toMatch(/proofAnalysis:\s*thought\.proofAnalysis/);
  });
});
