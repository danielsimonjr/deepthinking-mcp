/**
 * Game Theory Reasoning Tests
 * Phase 3B (v2.2)
 */

import { describe, it, expect } from 'vitest';
import { ThoughtValidator } from '../../src/validation/validator.js';
import { GameTheoryThought, isGameTheoryThought } from '../../src/types/modes/gametheory.js';

describe('Game Theory Reasoning', () => {
  const validator = new ThoughtValidator();

  describe('isGameTheoryThought type guard', () => {
    it('should identify game theory thoughts correctly', () => {
      const thought: GameTheoryThought = {
        id: 'gt-1',
        sessionId: 'session-1',
        mode: 'gametheory',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test game theory thought',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'game_definition',
      };

      expect(isGameTheoryThought(thought)).toBe(true);
    });

    it('should reject non-game-theory thoughts', () => {
      const thought: any = {
        id: 'seq-1',
        sessionId: 'session-1',
        mode: 'sequential',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test sequential thought',
        timestamp: new Date(),
        nextThoughtNeeded: false,
      };

      expect(isGameTheoryThought(thought)).toBe(false);
    });
  });

  describe('Game definition validation', () => {
    it('should require at least 2 players', async () => {
      const thought: GameTheoryThought = {
        id: 'gt-2',
        sessionId: 'session-1',
        mode: 'gametheory',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Invalid game with 1 player',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'game_definition',
        game: {
          id: 'game-1',
          name: 'Invalid Game',
          description: 'Test',
          type: 'normal_form',
          numPlayers: 1,
          isZeroSum: false,
          isPerfectInformation: true,
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('at least 2 players'))).toBe(true);
    });

    it('should accept valid game with 2 players', async () => {
      const thought: GameTheoryThought = {
        id: 'gt-3',
        sessionId: 'session-1',
        mode: 'gametheory',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Valid game with 2 players',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'game_definition',
        game: {
          id: 'game-1',
          name: 'Valid Game',
          description: 'Test',
          type: 'normal_form',
          numPlayers: 2,
          isZeroSum: true,
          isPerfectInformation: true,
        },
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });
  });

  describe('Player validation', () => {
    it('should validate player count matches game definition', async () => {
      const thought: GameTheoryThought = {
        id: 'gt-4',
        sessionId: 'session-1',
        mode: 'gametheory',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Player count mismatch',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'game_definition',
        game: {
          id: 'game-1',
          name: 'Test Game',
          description: 'Test',
          type: 'normal_form',
          numPlayers: 2,
          isZeroSum: false,
          isPerfectInformation: true,
        },
        players: [
          {
            id: 'p1',
            name: 'Player 1',
            isRational: true,
            availableStrategies: ['s1'],
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('does not match game definition'))).toBe(true);
    });

    it('should require players to have strategies', async () => {
      const thought: GameTheoryThought = {
        id: 'gt-5',
        sessionId: 'session-1',
        mode: 'gametheory',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Player without strategies',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'strategy_analysis',
        game: {
          id: 'game-1',
          name: 'Test Game',
          description: 'Test',
          type: 'normal_form',
          numPlayers: 2,
          isZeroSum: false,
          isPerfectInformation: true,
        },
        players: [
          {
            id: 'p1',
            name: 'Player 1',
            isRational: true,
            availableStrategies: [],
          },
          {
            id: 'p2',
            name: 'Player 2',
            isRational: true,
            availableStrategies: ['s1'],
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('no available strategies'))).toBe(true);
    });

    it('should accept valid players with strategies', async () => {
      const thought: GameTheoryThought = {
        id: 'gt-6',
        sessionId: 'session-1',
        mode: 'gametheory',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Valid players',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'strategy_analysis',
        game: {
          id: 'game-1',
          name: 'Test Game',
          description: 'Test',
          type: 'normal_form',
          numPlayers: 2,
          isZeroSum: false,
          isPerfectInformation: true,
        },
        players: [
          {
            id: 'p1',
            name: 'Player 1',
            isRational: true,
            availableStrategies: ['s1', 's2'],
          },
          {
            id: 'p2',
            name: 'Player 2',
            isRational: true,
            availableStrategies: ['s3', 's4'],
          },
        ],
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });
  });

  describe('Strategy validation', () => {
    it('should validate strategies reference existing players', async () => {
      const thought: GameTheoryThought = {
        id: 'gt-7',
        sessionId: 'session-1',
        mode: 'gametheory',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Strategy with invalid player reference',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'strategy_analysis',
        players: [
          {
            id: 'p1',
            name: 'Player 1',
            isRational: true,
            availableStrategies: ['s1'],
          },
        ],
        strategies: [
          {
            id: 's1',
            playerId: 'p99',
            name: 'Strategy 1',
            description: 'Test',
            isPure: true,
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('non-existent player'))).toBe(true);
    });

    it('should validate mixed strategies have probability', async () => {
      const thought: GameTheoryThought = {
        id: 'gt-8',
        sessionId: 'session-1',
        mode: 'gametheory',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Mixed strategy without probability',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'strategy_analysis',
        players: [
          {
            id: 'p1',
            name: 'Player 1',
            isRational: true,
            availableStrategies: ['s1'],
          },
        ],
        strategies: [
          {
            id: 's1',
            playerId: 'p1',
            name: 'Mixed Strategy',
            description: 'Test',
            isPure: false,
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('missing probability'))).toBe(true);
    });

    it('should validate probability range 0-1', async () => {
      const thought: GameTheoryThought = {
        id: 'gt-9',
        sessionId: 'session-1',
        mode: 'gametheory',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Strategy with invalid probability',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'strategy_analysis',
        players: [
          {
            id: 'p1',
            name: 'Player 1',
            isRational: true,
            availableStrategies: ['s1'],
          },
        ],
        strategies: [
          {
            id: 's1',
            playerId: 'p1',
            name: 'Mixed Strategy',
            description: 'Test',
            isPure: false,
            probability: 1.5,
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('probability must be 0-1'))).toBe(true);
    });
  });

  describe('Payoff matrix validation', () => {
    it('should validate payoff matrix player count', async () => {
      const thought: GameTheoryThought = {
        id: 'gt-10',
        sessionId: 'session-1',
        mode: 'gametheory',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Payoff matrix with wrong player count',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'payoff_computation',
        players: [
          {
            id: 'p1',
            name: 'Player 1',
            isRational: true,
            availableStrategies: ['s1'],
          },
          {
            id: 'p2',
            name: 'Player 2',
            isRational: true,
            availableStrategies: ['s2'],
          },
        ],
        payoffMatrix: {
          players: ['p1'],
          dimensions: [2, 2],
          payoffs: [],
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('player count does not match'))).toBe(true);
    });

    it('should validate payoff entry dimensions', async () => {
      const thought: GameTheoryThought = {
        id: 'gt-11',
        sessionId: 'session-1',
        mode: 'gametheory',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Payoff entry with wrong dimensions',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'payoff_computation',
        players: [
          {
            id: 'p1',
            name: 'Player 1',
            isRational: true,
            availableStrategies: ['s1'],
          },
          {
            id: 'p2',
            name: 'Player 2',
            isRational: true,
            availableStrategies: ['s2'],
          },
        ],
        payoffMatrix: {
          players: ['p1', 'p2'],
          dimensions: [2, 2],
          payoffs: [
            {
              strategyProfile: ['s1'],
              payoffs: [3, 3],
            },
          ],
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('Strategy profile'))).toBe(true);
    });
  });

  describe('Nash equilibria validation', () => {
    it('should validate equilibrium strategy profile length', async () => {
      const thought: GameTheoryThought = {
        id: 'gt-12',
        sessionId: 'session-1',
        mode: 'gametheory',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Nash equilibrium with wrong strategy count',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'equilibrium_finding',
        players: [
          {
            id: 'p1',
            name: 'Player 1',
            isRational: true,
            availableStrategies: ['s1'],
          },
          {
            id: 'p2',
            name: 'Player 2',
            isRational: true,
            availableStrategies: ['s2'],
          },
        ],
        nashEquilibria: [
          {
            id: 'nash-1',
            strategyProfile: ['s1'],
            payoffs: [3, 3],
            type: 'pure',
            isStrict: true,
            stability: 0.9,
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('strategy profile length mismatch'))).toBe(true);
    });

    it('should validate stability range 0-1', async () => {
      const thought: GameTheoryThought = {
        id: 'gt-13',
        sessionId: 'session-1',
        mode: 'gametheory',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Nash equilibrium with invalid stability',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'equilibrium_finding',
        players: [
          {
            id: 'p1',
            name: 'Player 1',
            isRational: true,
            availableStrategies: ['s1'],
          },
          {
            id: 'p2',
            name: 'Player 2',
            isRational: true,
            availableStrategies: ['s2'],
          },
        ],
        nashEquilibria: [
          {
            id: 'nash-1',
            strategyProfile: ['s1', 's2'],
            payoffs: [3, 3],
            type: 'pure',
            isStrict: true,
            stability: 1.5,
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('stability must be 0-1'))).toBe(true);
    });
  });

  describe('Game tree validation', () => {
    it('should validate root node exists', async () => {
      const thought: GameTheoryThought = {
        id: 'gt-14',
        sessionId: 'session-1',
        mode: 'gametheory',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Game tree with invalid root',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'strategy_analysis',
        gameTree: {
          rootNode: 'node-99',
          nodes: [
            {
              id: 'node-1',
              type: 'decision',
              childNodes: [],
            },
          ],
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('root node does not exist'))).toBe(true);
    });

    it('should validate terminal nodes have payoffs', async () => {
      const thought: GameTheoryThought = {
        id: 'gt-15',
        sessionId: 'session-1',
        mode: 'gametheory',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Terminal node without payoffs',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'strategy_analysis',
        gameTree: {
          rootNode: 'node-1',
          nodes: [
            {
              id: 'node-1',
              type: 'terminal',
              childNodes: [],
            },
          ],
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('Terminal node') && e.description.includes('missing payoffs'))).toBe(true);
    });
  });

  describe('Complete game theory thought validation', () => {
    it('should accept comprehensive game theory thought with all features', async () => {
      const thought: GameTheoryThought = {
        id: 'gt-complete',
        sessionId: 'session-1',
        mode: 'gametheory',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Complete prisoner dilemma analysis',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'equilibrium_finding',
        game: {
          id: 'pd-game',
          name: "Prisoner's Dilemma",
          description: 'Classic game theory example',
          type: 'normal_form',
          numPlayers: 2,
          isZeroSum: false,
          isPerfectInformation: true,
        },
        players: [
          {
            id: 'p1',
            name: 'Prisoner 1',
            role: 'Criminal',
            isRational: true,
            availableStrategies: ['cooperate', 'defect'],
          },
          {
            id: 'p2',
            name: 'Prisoner 2',
            role: 'Criminal',
            isRational: true,
            availableStrategies: ['cooperate', 'defect'],
          },
        ],
        strategies: [
          {
            id: 'cooperate',
            playerId: 'p1',
            name: 'Cooperate',
            description: 'Stay silent',
            isPure: true,
          },
          {
            id: 'defect',
            playerId: 'p1',
            name: 'Defect',
            description: 'Betray',
            isPure: true,
          },
        ],
        payoffMatrix: {
          players: ['p1', 'p2'],
          dimensions: [2, 2],
          payoffs: [
            {
              strategyProfile: ['cooperate', 'cooperate'],
              payoffs: [-1, -1],
            },
            {
              strategyProfile: ['cooperate', 'defect'],
              payoffs: [-3, 0],
            },
            {
              strategyProfile: ['defect', 'cooperate'],
              payoffs: [0, -3],
            },
            {
              strategyProfile: ['defect', 'defect'],
              payoffs: [-2, -2],
            },
          ],
        },
        nashEquilibria: [
          {
            id: 'nash-defect-defect',
            strategyProfile: ['defect', 'defect'],
            payoffs: [-2, -2],
            type: 'pure',
            isStrict: true,
            stability: 1.0,
          },
        ],
        dominantStrategies: [
          {
            playerId: 'p1',
            strategyId: 'defect',
            type: 'strictly_dominant',
            dominatesStrategies: ['cooperate'],
            justification: 'Defecting always yields higher payoff regardless of opponent strategy',
          },
          {
            playerId: 'p2',
            strategyId: 'defect',
            type: 'strictly_dominant',
            dominatesStrategies: ['cooperate'],
            justification: 'Defecting always yields higher payoff regardless of opponent strategy',
          },
        ],
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });
  });
});
