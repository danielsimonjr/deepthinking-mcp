/**
 * GameTheoryHandler Unit Tests - Phase 10 Sprint 2
 *
 * Tests for the specialized GameTheoryHandler:
 * - Thought creation
 * - Payoff matrix validation
 * - Player/strategy consistency
 * - Nash equilibria detection
 * - Dominant strategy identification
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameTheoryHandler } from '../../../../src/modes/handlers/GameTheoryHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('GameTheoryHandler', () => {
  let handler: GameTheoryHandler;

  beforeEach(() => {
    handler = new GameTheoryHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.GAMETHEORY);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Game Theory');
    });

    it('should have a description', () => {
      expect(handler.description).toBeTruthy();
      expect(handler.description.toLowerCase()).toContain('nash');
    });
  });

  describe('createThought', () => {
    it('should create a basic game theory thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Analyzing strategic interaction',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.GAMETHEORY);
      expect(thought.content).toBe('Analyzing strategic interaction');
      expect(thought.sessionId).toBe('session-1');
    });

    it('should create thought with players and strategies', () => {
      const input: ThinkingToolInput = {
        thought: 'Defining game',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['s1', 's2'] },
          { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: ['s3', 's4'] },
        ],
        strategies: [
          { id: 's1', playerId: 'p1', name: 'Cooperate', description: 'Cooperate', isPure: true },
          { id: 's2', playerId: 'p1', name: 'Defect', description: 'Defect', isPure: true },
          { id: 's3', playerId: 'p2', name: 'Cooperate', description: 'Cooperate', isPure: true },
          { id: 's4', playerId: 'p2', name: 'Defect', description: 'Defect', isPure: true },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.players).toHaveLength(2);
      expect(thought.strategies).toHaveLength(4);
    });

    it('should create thought with payoff matrix', () => {
      const input: ThinkingToolInput = {
        thought: 'Analyzing payoffs',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['C', 'D'] },
          { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: ['C', 'D'] },
        ],
        strategies: [
          { id: 'C', playerId: 'p1', name: 'Cooperate', description: 'Cooperate', isPure: true },
          { id: 'D', playerId: 'p1', name: 'Defect', description: 'Defect', isPure: true },
          { id: 'C', playerId: 'p2', name: 'Cooperate', description: 'Cooperate', isPure: true },
          { id: 'D', playerId: 'p2', name: 'Defect', description: 'Defect', isPure: true },
        ],
        payoffMatrix: {
          players: ['p1', 'p2'],
          dimensions: [2, 2],
          payoffs: [
            { strategyProfile: ['C', 'C'], payoffs: [3, 3] },
            { strategyProfile: ['C', 'D'], payoffs: [0, 5] },
            { strategyProfile: ['D', 'C'], payoffs: [5, 0] },
            { strategyProfile: ['D', 'D'], payoffs: [1, 1] },
          ],
        },
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.payoffMatrix).toBeDefined();
      expect(thought.payoffMatrix.payoffs).toHaveLength(4);
    });

    it('should find Nash equilibria in Prisoner\'s Dilemma', () => {
      // Prisoner's Dilemma: (D,D) is the only Nash equilibrium
      const input: ThinkingToolInput = {
        thought: 'Finding equilibria',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['C', 'D'] },
          { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: ['C', 'D'] },
        ],
        strategies: [
          { id: 'C', playerId: 'p1', name: 'Cooperate', description: 'Cooperate', isPure: true },
          { id: 'D', playerId: 'p1', name: 'Defect', description: 'Defect', isPure: true },
        ],
        payoffMatrix: {
          players: ['p1', 'p2'],
          dimensions: [2, 2],
          payoffs: [
            { strategyProfile: ['C', 'C'], payoffs: [3, 3] },
            { strategyProfile: ['C', 'D'], payoffs: [0, 5] },
            { strategyProfile: ['D', 'C'], payoffs: [5, 0] },
            { strategyProfile: ['D', 'D'], payoffs: [1, 1] },
          ],
        },
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      // Should find (D,D) as Nash equilibrium
      expect(thought.nashEquilibria).toBeDefined();
      expect(thought.nashEquilibria.length).toBeGreaterThan(0);
      expect(thought.nashEquilibria[0].strategyProfile).toContain('D');
    });

    it('should find dominant strategies', () => {
      const input: ThinkingToolInput = {
        thought: 'Finding dominant strategies',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['C', 'D'] },
          { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: ['C', 'D'] },
        ],
        strategies: [
          { id: 'C', playerId: 'p1', name: 'Cooperate', description: 'Cooperate', isPure: true },
          { id: 'D', playerId: 'p1', name: 'Defect', description: 'Defect', isPure: true },
        ],
        payoffMatrix: {
          players: ['p1', 'p2'],
          dimensions: [2, 2],
          payoffs: [
            { strategyProfile: ['C', 'C'], payoffs: [3, 3] },
            { strategyProfile: ['C', 'D'], payoffs: [0, 5] },
            { strategyProfile: ['D', 'C'], payoffs: [5, 0] },
            { strategyProfile: ['D', 'D'], payoffs: [1, 1] },
          ],
        },
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      // In Prisoner's Dilemma, D dominates C for both players
      expect(thought.dominantStrategies).toBeDefined();
    });
  });

  describe('validate', () => {
    it('should pass validation for valid input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid game theory reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for empty thought', () => {
      const input: ThinkingToolInput = {
        thought: '',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should detect duplicate player IDs', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: [] },
          { id: 'p1', name: 'Player 2', isRational: true, availableStrategies: [] },
        ],
        strategies: [],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'DUPLICATE_PLAYER_ID')).toBe(true);
    });

    it('should detect duplicate strategy IDs', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['s1'] },
        ],
        strategies: [
          { id: 's1', playerId: 'p1', name: 'Strategy 1', description: 'Test', isPure: true },
          { id: 's1', playerId: 'p1', name: 'Strategy 2', description: 'Duplicate', isPure: true },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'DUPLICATE_STRATEGY_ID')).toBe(true);
    });

    it('should detect invalid strategy references in player', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['nonexistent'] },
        ],
        strategies: [
          { id: 's1', playerId: 'p1', name: 'Strategy 1', description: 'Test', isPure: true },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_STRATEGY_REFERENCE')).toBe(true);
    });

    it('should detect invalid player references in strategy', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: [] },
        ],
        strategies: [
          { id: 's1', playerId: 'nonexistent', name: 'Strategy 1', description: 'Test', isPure: true },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_PLAYER_REFERENCE')).toBe(true);
    });

    it('should detect invalid mixed strategy probability', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['s1'] },
        ],
        strategies: [
          { id: 's1', playerId: 'p1', name: 'Strategy 1', description: 'Test', isPure: false, probability: 1.5 },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_PROBABILITY')).toBe(true);
    });

    it('should detect payoff matrix dimension mismatch', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
        players: [],
        strategies: [],
        payoffMatrix: {
          players: ['p1', 'p2'],
          dimensions: [2], // Should have 2 dimensions
          payoffs: [],
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'DIMENSION_MISMATCH')).toBe(true);
    });

    it('should warn when no players or payoff matrix defined', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'players')).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide related modes', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.relatedModes).toContain(ThinkingMode.OPTIMIZATION);
      expect(enhancements.relatedModes).toContain(ThinkingMode.COUNTERFACTUAL);
    });

    it('should provide mental models', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.mentalModels).toContain('Nash Equilibrium');
      expect(enhancements.mentalModels).toContain('Dominant Strategy');
      expect(enhancements.mentalModels).toContain("Prisoner's Dilemma");
    });

    it('should provide player count metric', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: [] },
          { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: [] },
        ],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.metrics).toBeDefined();
      expect(enhancements.metrics!.playerCount).toBe(2);
    });

    it('should detect zero-sum games', () => {
      const thought = handler.createThought({
        thought: 'Zero-sum game',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['A', 'B'] },
          { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: ['A', 'B'] },
        ],
        strategies: [],
        payoffMatrix: {
          players: ['p1', 'p2'],
          dimensions: [2, 2],
          payoffs: [
            { strategyProfile: ['A', 'A'], payoffs: [1, -1] },
            { strategyProfile: ['A', 'B'], payoffs: [-1, 1] },
            { strategyProfile: ['B', 'A'], payoffs: [-1, 1] },
            { strategyProfile: ['B', 'B'], payoffs: [1, -1] },
          ],
        },
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.metrics!.isZeroSum).toBe(1);
      expect(enhancements.suggestions!.some(s => s.includes('zero-sum'))).toBe(true);
    });

    it('should suggest mixed strategies when no pure Nash equilibrium found', () => {
      // Matching Pennies - no pure strategy Nash equilibrium
      const thought = handler.createThought({
        thought: 'Matching pennies',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'gametheory',
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['H', 'T'] },
          { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: ['H', 'T'] },
        ],
        strategies: [],
        payoffMatrix: {
          players: ['p1', 'p2'],
          dimensions: [2, 2],
          payoffs: [
            { strategyProfile: ['H', 'H'], payoffs: [1, -1] },
            { strategyProfile: ['H', 'T'], payoffs: [-1, 1] },
            { strategyProfile: ['T', 'H'], payoffs: [-1, 1] },
            { strategyProfile: ['T', 'T'], payoffs: [1, -1] },
          ],
        },
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.suggestions!.some(s => s.includes('mixed strateg'))).toBe(true);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support game_definition', () => {
      expect(handler.supportsThoughtType!('game_definition')).toBe(true);
    });

    it('should support equilibrium_finding', () => {
      expect(handler.supportsThoughtType!('equilibrium_finding')).toBe(true);
    });

    it('should support minimax_analysis', () => {
      expect(handler.supportsThoughtType!('minimax_analysis')).toBe(true);
    });

    it('should support shapley_value', () => {
      expect(handler.supportsThoughtType!('shapley_value')).toBe(true);
    });

    it('should not support unknown thought type', () => {
      expect(handler.supportsThoughtType!('unknown_type')).toBe(false);
    });
  });
});
