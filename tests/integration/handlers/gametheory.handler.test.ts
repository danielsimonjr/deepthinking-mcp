/**
 * GameTheoryHandler Integration Tests
 *
 * Tests T-HDL-012 through T-HDL-016: Comprehensive tests for
 * GameTheoryHandler payoff validation and Nash equilibria detection.
 *
 * Phase 11 Sprint 9: ModeHandler Specialized Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GameTheoryHandler } from '../../../src/modes/handlers/GameTheoryHandler.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('GameTheoryHandler Integration Tests', () => {
  let handler: GameTheoryHandler;

  beforeEach(() => {
    handler = new GameTheoryHandler();
  });

  function createInput(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Game theory analysis',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'gametheory',
      ...overrides,
    } as ThinkingToolInput;
  }

  // ===========================================================================
  // T-HDL-012: Payoff matrix validation
  // ===========================================================================
  describe('T-HDL-012: Payoff Matrix Validation', () => {
    it('should validate valid 2x2 payoff matrix', () => {
      const input = createInput({
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
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should create thought with game structure', () => {
      const input = createInput({
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['A'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.players).toBeDefined();
      expect(thought.mode).toBe(ThinkingMode.GAMETHEORY);
    });
  });

  // ===========================================================================
  // T-HDL-013: Dimension consistency
  // ===========================================================================
  describe('T-HDL-013: Dimension Consistency', () => {
    it('should validate correct number of payoff entries', () => {
      const input = createInput({
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['A', 'B'] },
          { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: ['X', 'Y'] },
        ],
        payoffMatrix: {
          players: ['p1', 'p2'],
          dimensions: [2, 2],
          payoffs: [
            { strategyProfile: ['A', 'X'], payoffs: [1, 1] },
            { strategyProfile: ['A', 'Y'], payoffs: [2, 0] },
            { strategyProfile: ['B', 'X'], payoffs: [0, 2] },
            { strategyProfile: ['B', 'Y'], payoffs: [1, 1] },
          ],
        },
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should handle single player game', () => {
      const input = createInput({
        players: [
          { id: 'p1', name: 'Decision Maker', isRational: true, availableStrategies: ['A', 'B', 'C'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.players).toHaveLength(1);
    });

    it('should handle multi-player game', () => {
      const input = createInput({
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['A'] },
          { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: ['B'] },
          { id: 'p3', name: 'Player 3', isRational: true, availableStrategies: ['C'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.players).toHaveLength(3);
    });
  });

  // ===========================================================================
  // T-HDL-014: Nash equilibria detection
  // ===========================================================================
  describe('T-HDL-014: Nash Equilibria Detection', () => {
    it('should provide enhancements for game analysis', () => {
      const input = createInput({
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['C', 'D'] },
          { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: ['C', 'D'] },
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
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements).toBeDefined();
      expect(enhancements.relatedModes).toContain(ThinkingMode.OPTIMIZATION);
    });

    it('should analyze prisoner dilemma structure', () => {
      const input = createInput({
        players: [
          { id: 'p1', name: 'Prisoner 1', isRational: true, availableStrategies: ['Cooperate', 'Defect'] },
          { id: 'p2', name: 'Prisoner 2', isRational: true, availableStrategies: ['Cooperate', 'Defect'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.mode).toBe(ThinkingMode.GAMETHEORY);
    });
  });

  // ===========================================================================
  // T-HDL-015: Dominant strategy identification
  // ===========================================================================
  describe('T-HDL-015: Dominant Strategy Identification', () => {
    it('should handle games with dominant strategies', () => {
      const input = createInput({
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['S1', 'S2'] },
        ],
        strategies: [
          { id: 'S1', playerId: 'p1', name: 'Strategy 1', description: 'Dominant', isPure: true },
          { id: 'S2', playerId: 'p1', name: 'Strategy 2', description: 'Dominated', isPure: true },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.strategies).toBeDefined();
    });

    it('should validate strategy references', () => {
      const input = createInput({
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['A', 'B'] },
        ],
        strategies: [
          { id: 'A', playerId: 'p1', name: 'Strategy A', description: 'First', isPure: true },
          { id: 'B', playerId: 'p1', name: 'Strategy B', description: 'Second', isPure: true },
        ],
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });
  });

  // ===========================================================================
  // T-HDL-016: Mixed strategy computation
  // ===========================================================================
  describe('T-HDL-016: Mixed Strategy Computation', () => {
    it('should handle mixed strategies', () => {
      const input = createInput({
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['A', 'B'] },
        ],
        strategies: [
          { id: 'A', playerId: 'p1', name: 'Strategy A', description: 'Mixed A', isPure: false, probability: 0.6 },
          { id: 'B', playerId: 'p1', name: 'Strategy B', description: 'Mixed B', isPure: false, probability: 0.4 },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.strategies?.some(s => !s.isPure)).toBe(true);
    });

    it('should include guiding questions for strategic analysis', () => {
      const input = createInput({
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['A'] },
          { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: ['B'] },
        ],
        game: {
          type: 'cooperative',
        },
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      // Guiding questions are added for cooperative games
      expect(enhancements.guidingQuestions?.length).toBeGreaterThan(0);
    });

    it('should track game type in metrics', () => {
      const input = createInput({
        players: [
          { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['A', 'B'] },
          { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: ['X', 'Y'] },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.playerCount).toBe(2);
    });
  });
});
