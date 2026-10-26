/**
 * Pure-strategy equilibrium detection tests.
 *
 * A profile is a Nash equilibrium when no player gains by deviating alone,
 * and a strict one when every deviation loses. These tests fix both rules
 * on games where the two answers differ, so a change to the deviation search
 * shows up as a changed `isStrict` flag or a changed equilibrium set.
 */

import { describe, it, expect } from 'vitest';
import { GameTheoryHandler } from '../../../../src/modes/handlers/GameTheoryHandler.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

type Cell = { strategyProfile: [string, string]; payoffs: [number, number] };

function equilibriaOf(cells: Cell[]) {
  const input = {
    thought: 'Finding equilibria',
    thoughtNumber: 1,
    totalThoughts: 1,
    nextThoughtNeeded: false,
    mode: 'gametheory',
    players: [
      { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['A', 'B'] },
      { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: ['A', 'B'] },
    ],
    strategies: [],
    payoffMatrix: { players: ['p1', 'p2'], dimensions: [2, 2], payoffs: cells },
  } as unknown as ThinkingToolInput;

  const thought = new GameTheoryHandler().createThought(input, 'session-eq') as any;
  return (thought.nashEquilibria as any[]).map((e) => ({
    profile: e.strategyProfile,
    isStrict: e.isStrict,
    stability: e.stability as number,
  }));
}

function strictnessOf(cells: Cell[]) {
  return equilibriaOf(cells).map(({ profile, isStrict }) => ({ profile, isStrict }));
}

describe('GameTheoryHandler pure-strategy equilibria', () => {
  it("reports the Prisoner's Dilemma outcome as one strict equilibrium", () => {
    const found = strictnessOf([
      { strategyProfile: ['A', 'A'], payoffs: [3, 3] },
      { strategyProfile: ['A', 'B'], payoffs: [0, 5] },
      { strategyProfile: ['B', 'A'], payoffs: [5, 0] },
      { strategyProfile: ['B', 'B'], payoffs: [1, 1] },
    ]);

    expect(found).toEqual([{ profile: ['B', 'B'], isStrict: true }]);
  });

  it('reports both coordination outcomes as strict equilibria', () => {
    const found = strictnessOf([
      { strategyProfile: ['A', 'A'], payoffs: [2, 2] },
      { strategyProfile: ['A', 'B'], payoffs: [0, 0] },
      { strategyProfile: ['B', 'A'], payoffs: [0, 0] },
      { strategyProfile: ['B', 'B'], payoffs: [1, 1] },
    ]);

    expect(found).toEqual([
      { profile: ['A', 'A'], isStrict: true },
      { profile: ['B', 'B'], isStrict: true },
    ]);
  });

  it('keeps a profile with an equal-payoff deviation as a non-strict equilibrium', () => {
    // Player 1 earns 1 from either row when player 2 plays A, so (A, A) and (B, A)
    // are equilibria that a one-player deviation reaches at no cost.
    const found = strictnessOf([
      { strategyProfile: ['A', 'A'], payoffs: [1, 2] },
      { strategyProfile: ['A', 'B'], payoffs: [0, 0] },
      { strategyProfile: ['B', 'A'], payoffs: [1, 2] },
      { strategyProfile: ['B', 'B'], payoffs: [0, 0] },
    ]);

    expect(found).toEqual([
      { profile: ['A', 'A'], isStrict: false },
      { profile: ['B', 'A'], isStrict: false },
    ]);
  });

  it('scores stability from the average loss over every one-player deviation', () => {
    // Coordination game: at (A, A) each player loses 2 by leaving, at (B, B) each loses 1.
    const cells: Cell[] = [
      { strategyProfile: ['A', 'A'], payoffs: [2, 2] },
      { strategyProfile: ['A', 'B'], payoffs: [0, 0] },
      { strategyProfile: ['B', 'A'], payoffs: [0, 0] },
      { strategyProfile: ['B', 'B'], payoffs: [1, 1] },
    ];
    const stabilities = equilibriaOf(cells).map((e) => e.stability);

    expect(stabilities[0]).toBeCloseTo(0.5 + 2 / 10, 12);
    expect(stabilities[1]).toBeCloseTo(0.5 + 1 / 10, 12);
  });

  it('averages a free deviation with a costly one when scoring stability', () => {
    // At (A, A) player 1 loses 0 by leaving and player 2 loses 2: the average loss is 1.
    const found = equilibriaOf([
      { strategyProfile: ['A', 'A'], payoffs: [1, 2] },
      { strategyProfile: ['A', 'B'], payoffs: [0, 0] },
      { strategyProfile: ['B', 'A'], payoffs: [1, 2] },
      { strategyProfile: ['B', 'B'], payoffs: [0, 0] },
    ]);

    expect(found[0].stability).toBeCloseTo(0.5 + 1 / 10, 12);
  });

  it('finds no pure equilibrium in matching pennies', () => {
    const found = strictnessOf([
      { strategyProfile: ['A', 'A'], payoffs: [1, -1] },
      { strategyProfile: ['A', 'B'], payoffs: [-1, 1] },
      { strategyProfile: ['B', 'A'], payoffs: [-1, 1] },
      { strategyProfile: ['B', 'B'], payoffs: [1, -1] },
    ]);

    expect(found).toEqual([]);
  });

  it('rejects a profile when only the second player gains by deviating', () => {
    // Player 1 has no better row at (A, A), but player 2 earns more from B than from A there.
    const found = strictnessOf([
      { strategyProfile: ['A', 'A'], payoffs: [2, 1] },
      { strategyProfile: ['A', 'B'], payoffs: [1, 3] },
      { strategyProfile: ['B', 'A'], payoffs: [1, 0] },
      { strategyProfile: ['B', 'B'], payoffs: [0, 0] },
    ]);

    expect(found).toEqual([{ profile: ['A', 'B'], isStrict: true }]);
  });
});
