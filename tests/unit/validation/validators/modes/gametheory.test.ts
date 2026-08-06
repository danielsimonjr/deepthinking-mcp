/**
 * Game Theory Validator Tests
 * Tests for src/validation/validators/modes/gametheory.ts
 *
 * Covered deeply because almost every check here is an agreement between two
 * or more fields rather than a property of one: the player list against the
 * game's declared player count, each payoff entry's two arrays against the
 * matrix's player list, each equilibrium's strategy profile against the
 * player list, and every strategy and tree node against the ids they name.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameTheoryValidator } from '../../../../../src/validation/validators/modes/gametheory.js';
import { ThinkingMode } from '../../../../../src/types/core.js';
import type { GameTheoryThought } from '../../../../../src/types/index.js';
import type { ValidationContext } from '../../../../../src/validation/validator.js';

describe('GameTheoryValidator', () => {
  let validator: GameTheoryValidator;
  let context: ValidationContext;

  const createThought = (
    overrides: Record<string, unknown> = {},
  ): GameTheoryThought =>
    ({
      id: 'thought-1',
      mode: ThinkingMode.GAMETHEORY,
      thought: 'Test thought',
      content: 'Analysing the game',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      ...overrides,
    }) as unknown as GameTheoryThought;

  const players = [
    { id: 'p1', name: 'Alice', availableStrategies: ['cooperate', 'defect'] },
    { id: 'p2', name: 'Bob', availableStrategies: ['cooperate', 'defect'] },
  ];

  const twoPlayerGame = { game: { numPlayers: 2 }, players };

  const descriptions = (thought: GameTheoryThought): string[] =>
    validator.validate(thought, context).map((issue) => issue.description);

  beforeEach(() => {
    validator = new GameTheoryValidator();
    context = { sessionId: 'test-session', existingThoughts: new Map() };
  });

  describe('getMode', () => {
    it('identifies itself as the gametheory validator', () => {
      expect(validator.getMode()).toBe('gametheory');
    });
  });

  describe('minimal input', () => {
    it('reports nothing for a thought with no game structures', () => {
      expect(validator.validate(createThought(), context)).toEqual([]);
    });

    it('reports nothing for a well-formed two-player game', () => {
      expect(validator.validate(createThought(twoPlayerGame), context)).toEqual(
        [],
      );
    });

    it('applies the shared base checks', () => {
      const thought = createThought({ thoughtNumber: 0, totalThoughts: 0 });

      expect(descriptions(thought)).toEqual(
        expect.arrayContaining([
          'Thought number must be positive',
          'Total thoughts must be positive',
        ]),
      );
    });
  });

  describe('players against the game definition', () => {
    it('rejects a one-player game', () => {
      const thought = createThought({ game: { numPlayers: 1 } });

      const issue = validator
        .validate(thought, context)
        .find((i) => i.description.includes('at least 2 players'));
      expect(issue?.description).toBe('Game must have at least 2 players');
      expect(issue?.severity).toBe('error');
    });

    it('accepts a game of exactly two players', () => {
      expect(
        validator.validate(createThought({ game: { numPlayers: 2 } }), context),
      ).toEqual([]);
    });

    it('rejects a player list that disagrees with the declared count', () => {
      const thought = createThought({
        game: { numPlayers: 3 },
        players,
      });

      expect(descriptions(thought)).toContain(
        'Player count (2) does not match game definition (3)',
      );
    });

    it('rejects a player with no available strategies', () => {
      const thought = createThought({
        game: { numPlayers: 2 },
        players: [
          { id: 'p1', name: 'Alice', availableStrategies: [] },
          players[1],
        ],
      });

      const issue = validator
        .validate(thought, context)
        .find((i) => i.description.includes('available strategies'));
      expect(issue?.description).toBe(
        'Player "Alice" available strategies must not be empty',
      );
      expect(issue?.severity).toBe('error');
    });

    it('does not check the player list when no game is declared', () => {
      // Every player check is gated on `thought.game` being present.
      const thought = createThought({
        players: [{ id: 'p1', name: 'Alice', availableStrategies: [] }],
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });
  });

  describe('strategies', () => {
    it('accepts a pure strategy belonging to a declared player', () => {
      const thought = createThought({
        ...twoPlayerGame,
        strategies: [{ name: 'Tit for tat', playerId: 'p1', isPure: true }],
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('rejects a strategy naming a player that does not exist', () => {
      const thought = createThought({
        ...twoPlayerGame,
        strategies: [{ name: 'Tit for tat', playerId: 'ghost', isPure: true }],
      });

      expect(descriptions(thought)).toContain(
        'Strategy "Tit for tat" references non-existent player: ghost',
      );
    });

    it('rejects a mixed strategy with no probability', () => {
      const thought = createThought({
        ...twoPlayerGame,
        strategies: [{ name: 'Randomised', playerId: 'p1', isPure: false }],
      });

      expect(descriptions(thought)).toContain(
        'Mixed strategy "Randomised" is missing probability',
      );
    });

    it('accepts a mixed strategy carrying a probability', () => {
      const thought = createThought({
        ...twoPlayerGame,
        strategies: [
          { name: 'Randomised', playerId: 'p1', isPure: false, probability: 0.5 },
        ],
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('rejects a probability outside 0..1 even on a pure strategy', () => {
      const thought = createThought({
        ...twoPlayerGame,
        strategies: [
          { name: 'Odd', playerId: 'p1', isPure: true, probability: 1.5 },
        ],
      });

      expect(descriptions(thought)).toContain(
        'Strategy "Odd" probability must be 0-1',
      );
    });
  });

  describe('payoff matrix dimensions', () => {
    const matrix = (
      matrixPlayers: string[],
      payoffs: Array<{ strategyProfile: string[]; payoffs: number[] }>,
    ) => ({ payoffMatrix: { players: matrixPlayers, payoffs } });

    it('accepts a matrix whose entries match the player count', () => {
      const thought = createThought({
        ...twoPlayerGame,
        ...matrix(
          ['p1', 'p2'],
          [{ strategyProfile: ['cooperate', 'defect'], payoffs: [0, 5] }],
        ),
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('rejects a matrix listing a different number of players than the game', () => {
      const thought = createThought({
        ...twoPlayerGame,
        ...matrix(['p1'], []),
      });

      expect(descriptions(thought)).toContain(
        'Payoff matrix player count does not match actual player count',
      );
    });

    it('rejects a strategy profile shorter than the player list', () => {
      const thought = createThought({
        ...twoPlayerGame,
        ...matrix(
          ['p1', 'p2'],
          [{ strategyProfile: ['cooperate'], payoffs: [0, 5] }],
        ),
      });

      expect(descriptions(thought)).toContain(
        'Strategy profile length does not match player count',
      );
    });

    it('rejects a payoff vector shorter than the player list', () => {
      const thought = createThought({
        ...twoPlayerGame,
        ...matrix(
          ['p1', 'p2'],
          [{ strategyProfile: ['cooperate', 'defect'], payoffs: [0] }],
        ),
      });

      expect(descriptions(thought)).toContain(
        'Payoff entry payoffs length does not match player count',
      );
    });

    it('reports both dimension errors independently for one entry', () => {
      const thought = createThought({
        ...twoPlayerGame,
        ...matrix(['p1', 'p2'], [{ strategyProfile: [], payoffs: [] }]),
      });

      expect(descriptions(thought)).toEqual(
        expect.arrayContaining([
          'Strategy profile length does not match player count',
          'Payoff entry payoffs length does not match player count',
        ]),
      );
    });
  });

  describe('Nash equilibria', () => {
    it('accepts an equilibrium covering every player with valid stability', () => {
      const thought = createThought({
        ...twoPlayerGame,
        nashEquilibria: [
          {
            id: 'ne1',
            strategyProfile: ['defect', 'defect'],
            stability: 0.9,
          },
        ],
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('rejects an equilibrium that does not cover every player', () => {
      const thought = createThought({
        ...twoPlayerGame,
        nashEquilibria: [
          { id: 'ne1', strategyProfile: ['defect'], stability: 0.9 },
        ],
      });

      expect(descriptions(thought)).toContain(
        'Nash equilibrium "ne1" has strategy profile length mismatch',
      );
    });

    it('rejects a stability outside 0..1', () => {
      const thought = createThought({
        ...twoPlayerGame,
        nashEquilibria: [
          { id: 'ne1', strategyProfile: ['defect', 'defect'], stability: 1.2 },
        ],
      });

      expect(descriptions(thought)).toContain(
        'Nash equilibrium "ne1" stability must be 0-1',
      );
    });
  });

  describe('game tree', () => {
    it('accepts a tree whose root exists and whose nodes are complete', () => {
      const thought = createThought({
        ...twoPlayerGame,
        gameTree: {
          rootNode: 'n1',
          nodes: [
            { id: 'n1', type: 'decision' },
            { id: 'n2', type: 'terminal', payoffs: [1, 2] },
          ],
        },
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });

    it('rejects a root that is not among the nodes', () => {
      const thought = createThought({
        ...twoPlayerGame,
        gameTree: { rootNode: 'ghost', nodes: [{ id: 'n1', type: 'decision' }] },
      });

      expect(descriptions(thought)).toContain(
        'Game tree root node does not exist in nodes',
      );
    });

    it('rejects a terminal node with no payoffs', () => {
      const thought = createThought({
        ...twoPlayerGame,
        gameTree: {
          rootNode: 'n1',
          nodes: [{ id: 'n1', type: 'terminal' }],
        },
      });

      expect(descriptions(thought)).toContain(
        'Terminal node n1 is missing payoffs',
      );
    });

    it('rejects a chance node with no probability', () => {
      const thought = createThought({
        ...twoPlayerGame,
        gameTree: {
          rootNode: 'n1',
          nodes: [{ id: 'n1', type: 'chance' }],
        },
      });

      expect(descriptions(thought)).toContain(
        'Chance node n1 must have probability',
      );
    });

    it('rejects a node probability outside 0..1', () => {
      const thought = createThought({
        ...twoPlayerGame,
        gameTree: {
          rootNode: 'n1',
          nodes: [{ id: 'n1', type: 'chance', probability: 1.5 }],
        },
      });

      expect(descriptions(thought)).toContain(
        'Node n1 probability must be between 0 and 1',
      );
    });

    it('does not demand a probability from a decision node', () => {
      const thought = createThought({
        ...twoPlayerGame,
        gameTree: {
          rootNode: 'n1',
          nodes: [{ id: 'n1', type: 'decision' }],
        },
      });

      expect(validator.validate(thought, context)).toEqual([]);
    });
  });

  describe('issue shape', () => {
    it('stamps every issue with the thought number and a suggestion', () => {
      const thought = createThought({
        thoughtNumber: 5,
        totalThoughts: 5,
        game: { numPlayers: 1 },
        players,
      });

      const issues = validator.validate(thought, context);
      expect(issues.length).toBeGreaterThan(0);
      for (const issue of issues) {
        expect(issue.thoughtNumber).toBe(5);
        expect(issue.suggestion).toBeTruthy();
      }
    });
  });
});
