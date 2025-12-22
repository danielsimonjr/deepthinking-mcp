/**
 * Strategic Mode Integration Tests - Game Theory
 *
 * Tests T-STR-001 through T-STR-020: Comprehensive integration tests
 * for the deepthinking_strategic tool with gametheory mode.
 *
 * Phase 11 Sprint 5: Causal & Strategic Modes Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type GameTheoryThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import { assertValidProbability, assertInRange } from '../../utils/assertion-helpers.js';

// ============================================================================
// GAME THEORY MODE MOCK DATA
// ============================================================================

const SAMPLE_GAME_NORMAL = {
  id: 'game-1',
  name: 'Prisoner\'s Dilemma',
  description: 'Classic two-player non-cooperative game',
  type: 'normal_form' as const,
  numPlayers: 2,
  isZeroSum: false,
  isPerfectInformation: true,
};

const SAMPLE_GAME_EXTENSIVE = {
  id: 'game-2',
  name: 'Sequential Bargaining',
  description: 'Multi-stage bargaining game',
  type: 'extensive_form' as const,
  numPlayers: 2,
  isZeroSum: false,
  isPerfectInformation: true,
};

const SAMPLE_PLAYERS_2 = [
  {
    id: 'player-1',
    name: 'Player 1',
    role: 'Row player',
    isRational: true,
    availableStrategies: ['s1-cooperate', 's1-defect'],
  },
  {
    id: 'player-2',
    name: 'Player 2',
    role: 'Column player',
    isRational: true,
    availableStrategies: ['s2-cooperate', 's2-defect'],
  },
];

const SAMPLE_PLAYERS_3 = [
  ...SAMPLE_PLAYERS_2,
  {
    id: 'player-3',
    name: 'Player 3',
    role: 'Third player',
    isRational: true,
    availableStrategies: ['s3-join', 's3-leave'],
  },
];

const SAMPLE_STRATEGIES_PURE = [
  {
    id: 's1-cooperate',
    playerId: 'player-1',
    name: 'Cooperate',
    description: 'Choose to cooperate with the other player',
    isPure: true,
  },
  {
    id: 's1-defect',
    playerId: 'player-1',
    name: 'Defect',
    description: 'Choose to defect against the other player',
    isPure: true,
  },
  {
    id: 's2-cooperate',
    playerId: 'player-2',
    name: 'Cooperate',
    description: 'Choose to cooperate',
    isPure: true,
  },
  {
    id: 's2-defect',
    playerId: 'player-2',
    name: 'Defect',
    description: 'Choose to defect',
    isPure: true,
  },
];

const SAMPLE_STRATEGIES_MIXED = [
  {
    id: 's1-mixed',
    playerId: 'player-1',
    name: 'Mixed Strategy',
    description: 'Randomize between strategies',
    isPure: false,
    probability: 0.6, // 60% cooperate
  },
  {
    id: 's2-mixed',
    playerId: 'player-2',
    name: 'Mixed Strategy',
    description: 'Randomize between strategies',
    isPure: false,
    probability: 0.5, // 50% cooperate
  },
];

const SAMPLE_PAYOFF_MATRIX_PD = {
  players: ['player-1', 'player-2'],
  dimensions: [2, 2],
  payoffs: [
    { strategyProfile: ['s1-cooperate', 's2-cooperate'], payoffs: [3, 3] },
    { strategyProfile: ['s1-cooperate', 's2-defect'], payoffs: [0, 5] },
    { strategyProfile: ['s1-defect', 's2-cooperate'], payoffs: [5, 0] },
    { strategyProfile: ['s1-defect', 's2-defect'], payoffs: [1, 1] },
  ],
};

const SAMPLE_NASH_EQUILIBRIUM_PURE = {
  id: 'nash-1',
  strategyProfile: ['s1-defect', 's2-defect'],
  payoffs: [1, 1],
  type: 'pure' as const,
  isStrict: true,
  stability: 1.0,
};

const SAMPLE_NASH_EQUILIBRIUM_MIXED = {
  id: 'nash-2',
  strategyProfile: ['s1-mixed', 's2-mixed'],
  payoffs: [2.5, 2.5],
  type: 'mixed' as const,
  isStrict: false,
  stability: 0.8,
};

const SAMPLE_DOMINANT_STRATEGY = {
  playerId: 'player-1',
  strategyId: 's1-defect',
  type: 'strictly_dominant' as const,
  dominatesStrategies: ['s1-cooperate'],
  justification: 'Defecting yields higher payoff regardless of opponent\'s choice',
};

const SAMPLE_GAME_TREE = {
  rootNode: 'node-1',
  nodes: [
    { id: 'node-1', type: 'decision' as const, playerId: 'player-1', childNodes: ['node-2', 'node-3'] },
    { id: 'node-2', type: 'decision' as const, playerId: 'player-2', parentNode: 'node-1', action: 'Accept', childNodes: ['node-4', 'node-5'] },
    { id: 'node-3', type: 'decision' as const, playerId: 'player-2', parentNode: 'node-1', action: 'Reject', childNodes: ['node-6', 'node-7'] },
    { id: 'node-4', type: 'terminal' as const, parentNode: 'node-2', action: 'Accept', childNodes: [], payoffs: [3, 3] },
    { id: 'node-5', type: 'terminal' as const, parentNode: 'node-2', action: 'Reject', childNodes: [], payoffs: [1, 1] },
    { id: 'node-6', type: 'terminal' as const, parentNode: 'node-3', action: 'Accept', childNodes: [], payoffs: [2, 4] },
    { id: 'node-7', type: 'terminal' as const, parentNode: 'node-3', action: 'Reject', childNodes: [], payoffs: [0, 0] },
  ],
};

// ============================================================================
// GAME THEORY THOUGHT FACTORIES
// ============================================================================

function createBaseGameTheoryInput(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    thought: 'Analyzing strategic game',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    mode: 'gametheory',
    ...overrides,
  } as ThinkingToolInput;
}

function createGameTheoryWithGame(
  game: typeof SAMPLE_GAME_NORMAL,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createBaseGameTheoryInput({
    game,
    ...overrides,
  });
}

function createGameTheoryWithPlayers(
  players: typeof SAMPLE_PLAYERS_2,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createBaseGameTheoryInput({
    players,
    ...overrides,
  });
}

function createPrisonersDilemmaSetup(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createBaseGameTheoryInput({
    game: SAMPLE_GAME_NORMAL,
    players: SAMPLE_PLAYERS_2,
    strategies: SAMPLE_STRATEGIES_PURE,
    payoffMatrix: SAMPLE_PAYOFF_MATRIX_PD,
    ...overrides,
  });
}

// ============================================================================
// TESTS
// ============================================================================

describe('Strategic Mode Integration Tests - Game Theory', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-STR-001: Basic gametheory thought
   */
  describe('T-STR-001: Basic GameTheory Thought', () => {
    it('should create a basic game theory thought with minimal params', () => {
      const input = createBaseGameTheoryInput({
        thought: 'Analyzing strategic interaction',
      });

      const thought = factory.createThought(input, 'session-str-001');

      expect(thought.mode).toBe(ThinkingMode.GAMETHEORY);
      expect(thought.content).toBe('Analyzing strategic interaction');
      expect(thought.sessionId).toBe('session-str-001');
    });

    it('should assign unique IDs to game theory thoughts', () => {
      const input1 = createBaseGameTheoryInput({ thought: 'First game analysis' });
      const input2 = createBaseGameTheoryInput({ thought: 'Second game analysis' });

      const thought1 = factory.createThought(input1, 'session-str-001');
      const thought2 = factory.createThought(input2, 'session-str-001');

      expect(thought1.id).not.toBe(thought2.id);
    });
  });

  /**
   * T-STR-002: GameTheory with players array (2 players)
   */
  describe('T-STR-002: GameTheory with Players Array (2 Players)', () => {
    it('should include 2-player game setup', () => {
      const input = createGameTheoryWithPlayers(SAMPLE_PLAYERS_2);

      const thought = factory.createThought(input, 'session-str-002') as GameTheoryThought;

      expect(thought.players).toHaveLength(2);
      expect(thought.players![0].id).toBe('player-1');
      expect(thought.players![1].id).toBe('player-2');
    });

    it('should preserve player names and roles', () => {
      const input = createGameTheoryWithPlayers(SAMPLE_PLAYERS_2);

      const thought = factory.createThought(input, 'session-str-002') as GameTheoryThought;

      expect(thought.players![0].name).toBe('Player 1');
      expect(thought.players![0].role).toBe('Row player');
      expect(thought.players![1].name).toBe('Player 2');
      expect(thought.players![1].role).toBe('Column player');
    });
  });

  /**
   * T-STR-003: GameTheory with players array (3+ players)
   */
  describe('T-STR-003: GameTheory with Players Array (3+ Players)', () => {
    it('should handle 3-player games', () => {
      const input = createGameTheoryWithPlayers(SAMPLE_PLAYERS_3);

      const thought = factory.createThought(input, 'session-str-003') as GameTheoryThought;

      expect(thought.players).toHaveLength(3);
      expect(thought.players![2].id).toBe('player-3');
      expect(thought.players![2].role).toBe('Third player');
    });
  });

  /**
   * T-STR-004: GameTheory with players[].isRational
   */
  describe('T-STR-004: GameTheory with Player Rationality', () => {
    it('should track player rationality assumption', () => {
      const input = createGameTheoryWithPlayers(SAMPLE_PLAYERS_2);

      const thought = factory.createThought(input, 'session-str-004') as GameTheoryThought;

      expect(thought.players![0].isRational).toBe(true);
      expect(thought.players![1].isRational).toBe(true);
    });

    it('should allow non-rational players', () => {
      const nonRationalPlayers = [
        { ...SAMPLE_PLAYERS_2[0], isRational: false },
        SAMPLE_PLAYERS_2[1],
      ];
      const input = createGameTheoryWithPlayers(nonRationalPlayers);

      const thought = factory.createThought(input, 'session-str-004') as GameTheoryThought;

      expect(thought.players![0].isRational).toBe(false);
      expect(thought.players![1].isRational).toBe(true);
    });
  });

  /**
   * T-STR-005: GameTheory with players[].role
   */
  describe('T-STR-005: GameTheory with Player Roles', () => {
    it('should include player roles in game setup', () => {
      const input = createGameTheoryWithPlayers(SAMPLE_PLAYERS_2);

      const thought = factory.createThought(input, 'session-str-005') as GameTheoryThought;

      expect(thought.players![0].role).toBe('Row player');
      expect(thought.players![1].role).toBe('Column player');
    });
  });

  /**
   * T-STR-006: GameTheory with players[].availableStrategies
   */
  describe('T-STR-006: GameTheory with Available Strategies', () => {
    it('should track available strategies for each player', () => {
      const input = createGameTheoryWithPlayers(SAMPLE_PLAYERS_2);

      const thought = factory.createThought(input, 'session-str-006') as GameTheoryThought;

      expect(thought.players![0].availableStrategies).toContain('s1-cooperate');
      expect(thought.players![0].availableStrategies).toContain('s1-defect');
      expect(thought.players![1].availableStrategies).toContain('s2-cooperate');
      expect(thought.players![1].availableStrategies).toContain('s2-defect');
    });
  });

  /**
   * T-STR-007: GameTheory with strategies array
   */
  describe('T-STR-007: GameTheory with Strategies Array', () => {
    it('should include full strategy definitions', () => {
      const input = createBaseGameTheoryInput({
        strategies: SAMPLE_STRATEGIES_PURE,
      });

      const thought = factory.createThought(input, 'session-str-007') as GameTheoryThought;

      expect(thought.strategies).toHaveLength(4);
      expect(thought.strategies![0].name).toBe('Cooperate');
      expect(thought.strategies![1].name).toBe('Defect');
    });
  });

  /**
   * T-STR-008: GameTheory with strategies[].isPure = true
   */
  describe('T-STR-008: GameTheory with Pure Strategies', () => {
    it('should identify pure strategies', () => {
      const input = createBaseGameTheoryInput({
        strategies: SAMPLE_STRATEGIES_PURE,
      });

      const thought = factory.createThought(input, 'session-str-008') as GameTheoryThought;

      const pureStrategies = thought.strategies!.filter(s => s.isPure);
      expect(pureStrategies).toHaveLength(4);
    });
  });

  /**
   * T-STR-009: GameTheory with strategies[].isPure = false (mixed)
   */
  describe('T-STR-009: GameTheory with Mixed Strategies', () => {
    it('should handle mixed strategies', () => {
      const input = createBaseGameTheoryInput({
        strategies: SAMPLE_STRATEGIES_MIXED,
      });

      const thought = factory.createThought(input, 'session-str-009') as GameTheoryThought;

      const mixedStrategies = thought.strategies!.filter(s => !s.isPure);
      expect(mixedStrategies).toHaveLength(2);
    });
  });

  /**
   * T-STR-010: GameTheory with strategies[].probability
   */
  describe('T-STR-010: GameTheory with Strategy Probabilities', () => {
    it('should include probability for mixed strategies', () => {
      const input = createBaseGameTheoryInput({
        strategies: SAMPLE_STRATEGIES_MIXED,
      });

      const thought = factory.createThought(input, 'session-str-010') as GameTheoryThought;

      expect(thought.strategies![0].probability).toBe(0.6);
      expect(thought.strategies![1].probability).toBe(0.5);
      assertValidProbability(thought.strategies![0].probability!);
    });
  });

  /**
   * T-STR-011: GameTheory with payoffMatrix
   */
  describe('T-STR-011: GameTheory with Payoff Matrix', () => {
    it('should include payoff matrix', () => {
      const input = createPrisonersDilemmaSetup();

      const thought = factory.createThought(input, 'session-str-011') as GameTheoryThought;

      expect(thought.payoffMatrix).toBeDefined();
      expect(thought.payoffMatrix!.players).toHaveLength(2);
      expect(thought.payoffMatrix!.payoffs).toHaveLength(4);
    });
  });

  /**
   * T-STR-012: GameTheory with payoffMatrix.dimensions
   */
  describe('T-STR-012: GameTheory with Payoff Matrix Dimensions', () => {
    it('should specify matrix dimensions', () => {
      const input = createPrisonersDilemmaSetup();

      const thought = factory.createThought(input, 'session-str-012') as GameTheoryThought;

      expect(thought.payoffMatrix!.dimensions).toEqual([2, 2]);
    });
  });

  /**
   * T-STR-013: GameTheory with payoffMatrix.payoffs array
   */
  describe('T-STR-013: GameTheory with Payoffs Array', () => {
    it('should include all payoff entries', () => {
      const input = createPrisonersDilemmaSetup();

      const thought = factory.createThought(input, 'session-str-013') as GameTheoryThought;

      const ccPayoff = thought.payoffMatrix!.payoffs.find(
        p => p.strategyProfile.includes('s1-cooperate') && p.strategyProfile.includes('s2-cooperate')
      );
      expect(ccPayoff?.payoffs).toEqual([3, 3]);

      const ddPayoff = thought.payoffMatrix!.payoffs.find(
        p => p.strategyProfile.includes('s1-defect') && p.strategyProfile.includes('s2-defect')
      );
      expect(ddPayoff?.payoffs).toEqual([1, 1]);
    });
  });

  /**
   * T-STR-014: GameTheory Prisoner's Dilemma setup
   */
  describe('T-STR-014: GameTheory Prisoner\'s Dilemma Setup', () => {
    it('should correctly model Prisoner\'s Dilemma payoffs', () => {
      const input = createPrisonersDilemmaSetup();

      const thought = factory.createThought(input, 'session-str-014') as GameTheoryThought;

      // Verify temptation > reward > punishment > sucker
      const payoffs = thought.payoffMatrix!.payoffs;
      const T = payoffs.find(p => p.strategyProfile[0] === 's1-defect' && p.strategyProfile[1] === 's2-cooperate')?.payoffs[0]; // 5
      const R = payoffs.find(p => p.strategyProfile[0] === 's1-cooperate' && p.strategyProfile[1] === 's2-cooperate')?.payoffs[0]; // 3
      const P = payoffs.find(p => p.strategyProfile[0] === 's1-defect' && p.strategyProfile[1] === 's2-defect')?.payoffs[0]; // 1
      const S = payoffs.find(p => p.strategyProfile[0] === 's1-cooperate' && p.strategyProfile[1] === 's2-defect')?.payoffs[0]; // 0

      expect(T).toBeGreaterThan(R!);
      expect(R).toBeGreaterThan(P!);
      expect(P).toBeGreaterThan(S!);
    });
  });

  /**
   * T-STR-015: GameTheory Nash equilibrium detection
   */
  describe('T-STR-015: GameTheory Nash Equilibrium Detection', () => {
    it('should identify Nash equilibria', () => {
      const input = createPrisonersDilemmaSetup({
        nashEquilibria: [SAMPLE_NASH_EQUILIBRIUM_PURE],
      });

      const thought = factory.createThought(input, 'session-str-015') as GameTheoryThought;

      expect(thought.nashEquilibria).toHaveLength(1);
      expect(thought.nashEquilibria![0].strategyProfile).toEqual(['s1-defect', 's2-defect']);
      expect(thought.nashEquilibria![0].payoffs).toEqual([1, 1]);
    });

    it('should identify equilibrium type', () => {
      const input = createPrisonersDilemmaSetup({
        nashEquilibria: [SAMPLE_NASH_EQUILIBRIUM_PURE],
      });

      const thought = factory.createThought(input, 'session-str-015') as GameTheoryThought;

      expect(thought.nashEquilibria![0].type).toBe('pure');
      expect(thought.nashEquilibria![0].isStrict).toBe(true);
    });
  });

  /**
   * T-STR-016: GameTheory dominant strategy identification
   */
  describe('T-STR-016: GameTheory Dominant Strategy Identification', () => {
    it('should identify dominant strategies', () => {
      const input = createPrisonersDilemmaSetup({
        dominantStrategies: [SAMPLE_DOMINANT_STRATEGY],
      });

      const thought = factory.createThought(input, 'session-str-016') as GameTheoryThought;

      expect(thought.dominantStrategies).toHaveLength(1);
      expect(thought.dominantStrategies![0].playerId).toBe('player-1');
      expect(thought.dominantStrategies![0].strategyId).toBe('s1-defect');
    });

    it('should specify dominance type', () => {
      const input = createPrisonersDilemmaSetup({
        dominantStrategies: [SAMPLE_DOMINANT_STRATEGY],
      });

      const thought = factory.createThought(input, 'session-str-016') as GameTheoryThought;

      expect(thought.dominantStrategies![0].type).toBe('strictly_dominant');
      expect(thought.dominantStrategies![0].dominatesStrategies).toContain('s1-cooperate');
    });
  });

  /**
   * T-STR-017: GameTheory mixed strategy equilibrium
   */
  describe('T-STR-017: GameTheory Mixed Strategy Equilibrium', () => {
    it('should handle mixed strategy Nash equilibria', () => {
      const input = createBaseGameTheoryInput({
        strategies: SAMPLE_STRATEGIES_MIXED,
        nashEquilibria: [SAMPLE_NASH_EQUILIBRIUM_MIXED],
      });

      const thought = factory.createThought(input, 'session-str-017') as GameTheoryThought;

      expect(thought.nashEquilibria![0].type).toBe('mixed');
      expect(thought.nashEquilibria![0].isStrict).toBe(false);
      assertInRange(thought.nashEquilibria![0].stability, 0, 1);
    });
  });

  /**
   * T-STR-018: GameTheory multi-thought game analysis
   */
  describe('T-STR-018: GameTheory Multi-Thought Game Analysis', () => {
    it('should support multi-step game analysis', () => {
      const sessionId = 'session-str-018';

      // Step 1: Define game
      const step1 = createGameTheoryWithGame(SAMPLE_GAME_NORMAL, {
        thought: 'Defining game structure',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
      });
      const thought1 = factory.createThought(step1, sessionId) as GameTheoryThought;
      expect(thought1.game?.name).toBe('Prisoner\'s Dilemma');

      // Step 2: Define players and strategies
      const step2 = createPrisonersDilemmaSetup({
        thought: 'Defining players and strategies',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
      });
      const thought2 = factory.createThought(step2, sessionId) as GameTheoryThought;
      expect(thought2.players).toHaveLength(2);
      expect(thought2.strategies).toHaveLength(4);

      // Step 3: Analyze payoffs
      const step3 = createPrisonersDilemmaSetup({
        thought: 'Analyzing payoff structure',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
      });
      const thought3 = factory.createThought(step3, sessionId) as GameTheoryThought;
      expect(thought3.payoffMatrix!.payoffs).toHaveLength(4);

      // Step 4: Find equilibrium
      const step4 = createPrisonersDilemmaSetup({
        thought: 'Finding Nash equilibrium',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        nashEquilibria: [SAMPLE_NASH_EQUILIBRIUM_PURE],
        dominantStrategies: [SAMPLE_DOMINANT_STRATEGY],
      });
      const thought4 = factory.createThought(step4, sessionId) as GameTheoryThought;
      expect(thought4.nashEquilibria).toHaveLength(1);
      expect(thought4.dominantStrategies).toHaveLength(1);
    });
  });

  /**
   * T-STR-019: GameTheory with strategic form representation
   */
  describe('T-STR-019: GameTheory with Strategic Form Representation', () => {
    it('should represent game in strategic (normal) form', () => {
      const input = createGameTheoryWithGame(SAMPLE_GAME_NORMAL, {
        players: SAMPLE_PLAYERS_2,
        strategies: SAMPLE_STRATEGIES_PURE,
        payoffMatrix: SAMPLE_PAYOFF_MATRIX_PD,
      });

      const thought = factory.createThought(input, 'session-str-019') as GameTheoryThought;

      expect(thought.game?.type).toBe('normal_form');
      expect(thought.payoffMatrix).toBeDefined();
      expect(thought.payoffMatrix!.players).toEqual(['player-1', 'player-2']);
    });
  });

  /**
   * T-STR-020: GameTheory extensive form game
   */
  describe('T-STR-020: GameTheory Extensive Form Game', () => {
    it('should represent game in extensive form with game tree', () => {
      const input = createGameTheoryWithGame(SAMPLE_GAME_EXTENSIVE, {
        players: SAMPLE_PLAYERS_2,
        gameTree: SAMPLE_GAME_TREE,
      });

      const thought = factory.createThought(input, 'session-str-020') as GameTheoryThought;

      expect(thought.game?.type).toBe('extensive_form');
      expect(thought.gameTree).toBeDefined();
      expect(thought.gameTree!.rootNode).toBe('node-1');
    });

    it('should include game tree nodes', () => {
      const input = createGameTheoryWithGame(SAMPLE_GAME_EXTENSIVE, {
        gameTree: SAMPLE_GAME_TREE,
      });

      const thought = factory.createThought(input, 'session-str-020') as GameTheoryThought;

      expect(thought.gameTree!.nodes).toHaveLength(7);

      const decisionNodes = thought.gameTree!.nodes.filter(n => n.type === 'decision');
      expect(decisionNodes).toHaveLength(3);

      const terminalNodes = thought.gameTree!.nodes.filter(n => n.type === 'terminal');
      expect(terminalNodes).toHaveLength(4);
    });

    it('should capture payoffs at terminal nodes', () => {
      const input = createGameTheoryWithGame(SAMPLE_GAME_EXTENSIVE, {
        gameTree: SAMPLE_GAME_TREE,
      });

      const thought = factory.createThought(input, 'session-str-020') as GameTheoryThought;

      const terminalNodes = thought.gameTree!.nodes.filter(n => n.type === 'terminal');
      for (const node of terminalNodes) {
        expect(node.payoffs).toBeDefined();
        expect(node.payoffs).toHaveLength(2);
      }
    });
  });
});
