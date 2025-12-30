/**
 * Game Theory Mode Validator (v9.0.0)
 * Phase 15A Sprint 3: Uses composition with utility functions
 *
 * Validates game theory reasoning (players, strategies, payoffs)
 */

import type { GameTheoryThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { IssueCategory, IssueSeverity } from '../../constants.js';
import { validateCommon, validateProbability, validateNonEmptyArray } from '../validation-utils.js';

/**
 * Validator for game theory reasoning mode
 * Validates game structures, strategies, and equilibria
 */
export class GameTheoryValidator implements ModeValidator<GameTheoryThought> {
  getMode(): string {
    return 'gametheory';
  }

  validate(thought: GameTheoryThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...validateCommon(thought));

    // Validate game definition requires at least 2 players
    if (thought.game && thought.game.numPlayers < 2) {
      issues.push({
        severity: IssueSeverity.ERROR,
        thoughtNumber: thought.thoughtNumber,
        description: 'Game must have at least 2 players',
        suggestion: 'Game theory requires at least 2 players',
        category: IssueCategory.STRUCTURAL,
      });
    }

    // Validate player count matches game definition
    if (thought.game && thought.players) {
      if (thought.players.length !== thought.game.numPlayers) {
        issues.push({
          severity: IssueSeverity.ERROR,
          thoughtNumber: thought.thoughtNumber,
          description: `Player count (${thought.players.length}) does not match game definition (${thought.game.numPlayers})`,
          suggestion: 'Ensure number of players matches game definition',
          category: IssueCategory.STRUCTURAL,
        });
      }

      // Validate players have strategies using shared method (ERROR severity)
      for (const player of thought.players) {
        issues.push(
          ...validateNonEmptyArray(
            thought,
            player.availableStrategies,
            `Player "${player.name}" available strategies`,
            IssueCategory.STRUCTURAL,
            IssueSeverity.ERROR
          )
        );
      }
    }

    // Validate strategies
    if (thought.strategies) {
      const playerIds = new Set(thought.players?.map(p => p.id) || []);

      for (const strategy of thought.strategies) {
        // Validate strategy references existing player
        if (!playerIds.has(strategy.playerId)) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Strategy "${strategy.name}" references non-existent player: ${strategy.playerId}`,
            suggestion: 'Ensure strategies reference existing players',
            category: IssueCategory.STRUCTURAL,
          });
        }

        // Validate mixed strategies have probability
        if (!strategy.isPure && strategy.probability === undefined) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Mixed strategy "${strategy.name}" is missing probability`,
            suggestion: 'Provide probability for mixed strategies',
            category: IssueCategory.STRUCTURAL,
          });
        }

        // Validate probability range
        if (strategy.probability !== undefined &&
            (strategy.probability < 0 || strategy.probability > 1)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Strategy "${strategy.name}" probability must be 0-1`,
            suggestion: 'Provide probability as decimal',
            category: 'structural',
          });
        }
      }
    }

    // Validate payoff matrix
    if (thought.payoffMatrix) {
      // Validate player count
      if (thought.players && thought.payoffMatrix.players.length !== thought.players.length) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Payoff matrix player count does not match actual player count`,
          suggestion: 'Ensure payoff matrix includes all players',
          category: 'structural',
        });
      }

      // Validate payoff entry dimensions
      for (const entry of thought.payoffMatrix.payoffs) {
        if (entry.strategyProfile.length !== thought.payoffMatrix.players.length) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Strategy profile length does not match player count`,
            suggestion: 'Each payoff entry must specify strategies for all players',
            category: 'structural',
          });
        }
        if (entry.payoffs.length !== thought.payoffMatrix.players.length) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Payoff entry payoffs length does not match player count`,
            suggestion: 'Each payoff entry must specify payoffs for all players',
            category: 'structural',
          });
        }
      }
    }

    // Validate Nash equilibria
    if (thought.nashEquilibria) {
      for (const equilibrium of thought.nashEquilibria) {
        // Validate strategy profile length
        if (thought.players && equilibrium.strategyProfile.length !== thought.players.length) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Nash equilibrium "${equilibrium.id}" has strategy profile length mismatch`,
            suggestion: 'Strategy profile must include strategies for all players',
            category: IssueCategory.STRUCTURAL,
          });
        }

        // Validate stability range
        if (equilibrium.stability < 0 || equilibrium.stability > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Nash equilibrium "${equilibrium.id}" stability must be 0-1`,
            suggestion: 'Provide stability as decimal',
            category: 'structural',
          });
        }
      }
    }

    // Validate game tree
    if (thought.gameTree) {
      const nodeIds = new Set(thought.gameTree.nodes.map(n => n.id));

      // Validate root node exists
      if (!nodeIds.has(thought.gameTree.rootNode)) {
        issues.push({
          severity: IssueSeverity.ERROR,
          thoughtNumber: thought.thoughtNumber,
          description: 'Game tree root node does not exist in nodes',
          suggestion: 'Ensure rootNode references an existing node',
          category: IssueCategory.STRUCTURAL,
        });
      }

      // Validate nodes
      for (const node of thought.gameTree.nodes) {
        // Validate terminal nodes have payoffs
        if (node.type === 'terminal' && !node.payoffs) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Terminal node ${node.id} is missing payoffs`,
            suggestion: 'Provide payoffs for terminal nodes',
            category: IssueCategory.STRUCTURAL,
          });
        }

        // Validate chance nodes have probability
        if (node.type === 'chance' && node.probability === undefined) {
          issues.push({
            severity: IssueSeverity.ERROR,
            thoughtNumber: thought.thoughtNumber,
            description: `Chance node ${node.id} must have probability`,
            suggestion: 'Provide probability for chance nodes',
            category: IssueCategory.STRUCTURAL,
          });
        }

        // Validate probability range using shared method
        issues.push(...validateProbability(thought, node.probability, `Node ${node.id} probability`));
      }
    }

    return issues;
  }
}
