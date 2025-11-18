/**
 * Game Theory Mode Validator
 */

import { GameTheoryThought, ValidationIssue, ValidationContext } from '../../../types/index.js';
import { BaseValidator } from '../base.js';

export class GameTheoryValidator extends BaseValidator<GameTheoryThought> {
  getMode(): string {
    return 'gametheory';
  }

  validate(thought: GameTheoryThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate players
    if (thought.players && thought.players.length < 2) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Game theory typically involves at least 2 players',
        suggestion: 'Add more players or reconsider using game theory mode',
        category: 'structural',
      });
    }

    // Validate strategies
    if (thought.strategies) {
      for (const strategy of thought.strategies) {
        if (strategy.payoff === undefined) {
          issues.push({
            severity: 'info',
            thoughtNumber: thought.thoughtNumber,
            description: `Strategy "${strategy.name}" has no payoff specified`,
            suggestion: 'Consider adding expected payoff for strategies',
            category: 'structural',
          });
        }
      }
    }

    // Validate payoff matrix dimensions
    if (thought.payoffMatrix && thought.players) {
      const expectedDimensions = thought.players.length;
      if (thought.payoffMatrix.length !== expectedDimensions) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Payoff matrix dimensions don't match player count`,
          suggestion: `Expected ${expectedDimensions}-dimensional payoff matrix`,
          category: 'structural',
        });
      }
    }

    return issues;
  }
}
