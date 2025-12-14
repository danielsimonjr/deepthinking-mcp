/**
 * GameTheoryHandler - Phase 10 Sprint 2 (v8.1.0)
 *
 * Specialized handler for Game Theory reasoning mode with:
 * - Payoff matrix dimension validation
 * - Player/strategy consistency checks
 * - Basic Nash equilibria computation (pure strategies)
 * - Zero-sum game detection
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, GameTheoryThought } from '../../types/core.js';
import type {
  Game,
  Player,
  Strategy,
  PayoffMatrix,
  PayoffEntry,
  NashEquilibrium,
  DominantStrategy,
} from '../../types/modes/gametheory.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

/** Valid thought types for GameTheory mode */
type GameTheoryThoughtType =
  | 'game_definition'
  | 'strategy_analysis'
  | 'equilibrium_finding'
  | 'payoff_computation'
  | 'dominance_analysis'
  | 'minimax_analysis'
  | 'cooperative_analysis'
  | 'coalition_formation'
  | 'shapley_value'
  | 'core_analysis';

/**
 * GameTheoryHandler - Specialized handler for game-theoretic reasoning
 *
 * Provides semantic validation and strategic analysis:
 * - Validates payoff matrix dimensions match player/strategy counts
 * - Checks player-strategy assignment consistency
 * - Identifies dominant strategies
 * - Finds pure strategy Nash equilibria
 * - Detects zero-sum games
 */
export class GameTheoryHandler implements ModeHandler {
  readonly mode = ThinkingMode.GAMETHEORY;
  readonly modeName = 'Game Theory';
  readonly description = 'Strategic interaction analysis with Nash equilibria and payoff matrices';

  /**
   * Supported thought types for game theory mode
   */
  private readonly supportedThoughtTypes = [
    'game_definition',
    'strategy_analysis',
    'equilibrium_finding',
    'payoff_computation',
    'dominance_analysis',
    'minimax_analysis',
    'cooperative_analysis',
    'coalition_formation',
    'shapley_value',
    'core_analysis',
  ];

  /**
   * Create a game theory thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): GameTheoryThought {
    const inputAny = input as any;

    // Extract game theory components
    const game: Game | undefined = inputAny.game;
    const players: Player[] = inputAny.players || [];
    const strategies: Strategy[] = inputAny.strategies || [];
    const payoffMatrix: PayoffMatrix | undefined = inputAny.payoffMatrix;

    // Try to find Nash equilibria if payoff matrix is provided
    let nashEquilibria: NashEquilibrium[] | undefined = inputAny.nashEquilibria;
    if (!nashEquilibria && payoffMatrix && players.length > 0) {
      nashEquilibria = this.findPureStrategyNashEquilibria(payoffMatrix, players, strategies);
    }

    // Find dominant strategies
    let dominantStrategies: DominantStrategy[] | undefined = inputAny.dominantStrategies;
    if (!dominantStrategies && payoffMatrix && players.length > 0) {
      dominantStrategies = this.findDominantStrategies(payoffMatrix, players, strategies);
    }

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
      mode: ThinkingMode.GAMETHEORY,
      thoughtType: this.resolveThoughtType(input.thoughtType),
      game,
      players,
      strategies,
      payoffMatrix,
      nashEquilibria,
      dominantStrategies,
      gameTree: inputAny.gameTree,
      minimaxAnalysis: inputAny.minimaxAnalysis,
      cooperativeGame: inputAny.cooperativeGame,
      coalitionAnalysis: inputAny.coalitionAnalysis,
    };
  }

  /**
   * Validate game theory-specific input
   *
   * Performs semantic validation:
   * 1. Basic input validation
   * 2. Payoff matrix dimension validation
   * 3. Player-strategy consistency
   * 4. Payoff value validation
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors = [];
    const warnings = [];
    const inputAny = input as any;

    // Basic validation
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError('thought', 'Thought content is required', 'EMPTY_THOUGHT'),
      ]);
    }

    if (input.thoughtNumber > input.totalThoughts) {
      return validationFailure([
        createValidationError(
          'thoughtNumber',
          `Thought number (${input.thoughtNumber}) exceeds total thoughts (${input.totalThoughts})`,
          'INVALID_THOUGHT_NUMBER'
        ),
      ]);
    }

    // Validate players
    const players: Player[] = inputAny.players || [];
    const strategies: Strategy[] = inputAny.strategies || [];
    const payoffMatrix: PayoffMatrix | undefined = inputAny.payoffMatrix;

    if (players.length > 0) {
      const playerValidation = this.validatePlayers(players, strategies);
      if (!playerValidation.valid) {
        errors.push(...playerValidation.errors);
      }
      warnings.push(...playerValidation.warnings);
    }

    // Validate strategies
    if (strategies.length > 0) {
      const strategyValidation = this.validateStrategies(strategies, players);
      if (!strategyValidation.valid) {
        errors.push(...strategyValidation.errors);
      }
      warnings.push(...strategyValidation.warnings);
    }

    // Validate payoff matrix
    if (payoffMatrix) {
      const matrixValidation = this.validatePayoffMatrix(payoffMatrix, players, strategies);
      if (!matrixValidation.valid) {
        errors.push(...matrixValidation.errors);
      }
      warnings.push(...matrixValidation.warnings);
    }

    // Suggest adding game elements if none provided
    if (players.length === 0 && !payoffMatrix) {
      warnings.push(
        createValidationWarning(
          'players',
          'No players or payoff matrix defined',
          'Define players and their strategies for game theory analysis'
        )
      );
    }

    // Check for game definition
    const game: Game | undefined = inputAny.game;
    if (!game && players.length > 0) {
      warnings.push(
        createValidationWarning(
          'game',
          'No formal game definition provided',
          'Consider adding a Game object with type, name, and properties'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get game theory-specific enhancements
   */
  getEnhancements(thought: GameTheoryThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.OPTIMIZATION, ThinkingMode.COUNTERFACTUAL],
      guidingQuestions: [],
      warnings: [],
      metrics: {},
      mentalModels: [
        "Nash Equilibrium",
        "Dominant Strategy",
        "Pareto Efficiency",
        "Minimax Theorem",
        "Prisoner's Dilemma",
      ],
    };

    // Add game metrics
    if (thought.players) {
      enhancements.metrics!.playerCount = thought.players.length;
    }

    if (thought.strategies) {
      enhancements.metrics!.strategyCount = thought.strategies.length;
    }

    if (thought.payoffMatrix) {
      enhancements.metrics!.payoffEntries = thought.payoffMatrix.payoffs.length;

      // Check if zero-sum
      const isZeroSum = this.isZeroSumGame(thought.payoffMatrix);
      enhancements.metrics!.isZeroSum = isZeroSum ? 1 : 0;

      if (isZeroSum) {
        enhancements.suggestions!.push(
          'This is a zero-sum game. Consider minimax strategies.'
        );
        enhancements.relatedModes!.unshift(ThinkingMode.OPTIMIZATION);
      }
    }

    // Nash equilibria analysis
    if (thought.nashEquilibria && thought.nashEquilibria.length > 0) {
      enhancements.metrics!.nashEquilibriaCount = thought.nashEquilibria.length;

      if (thought.nashEquilibria.length > 1) {
        enhancements.suggestions!.push(
          `Multiple Nash equilibria found (${thought.nashEquilibria.length}). Consider coordination mechanisms or focal points.`
        );
        enhancements.guidingQuestions!.push(
          'Which equilibrium is most likely to emerge? Are there Schelling focal points?'
        );
      }

      // Check for Pareto efficiency of equilibria
      const paretoOptimal = this.checkParetoOptimality(thought.nashEquilibria, thought.payoffMatrix);
      if (!paretoOptimal) {
        enhancements.warnings!.push(
          "Nash equilibrium may not be Pareto optimal (like in Prisoner's Dilemma)"
        );
        enhancements.guidingQuestions!.push(
          'Is there a mechanism to achieve a Pareto-superior outcome through cooperation?'
        );
      }
    } else if (thought.payoffMatrix) {
      enhancements.suggestions!.push(
        'No pure strategy Nash equilibria found. Consider mixed strategies.'
      );
      enhancements.guidingQuestions!.push(
        'What are the optimal mixed strategy probabilities for each player?'
      );
    }

    // Dominant strategy analysis
    if (thought.dominantStrategies && thought.dominantStrategies.length > 0) {
      enhancements.metrics!.dominantStrategyCount = thought.dominantStrategies.length;
      enhancements.suggestions!.push(
        `${thought.dominantStrategies.length} dominant strategy(ies) identified. These simplify equilibrium analysis.`
      );
    }

    // Guide questions based on game type
    if (thought.game) {
      if (thought.game.type === 'cooperative') {
        enhancements.guidingQuestions!.push(
          'What coalitions might form? How should payoffs be divided fairly?'
        );
        enhancements.mentalModels!.push('Shapley Value', 'Core', 'Coalition Formation');
      } else if (thought.game.type === 'extensive_form') {
        enhancements.guidingQuestions!.push(
          'What is the subgame perfect equilibrium? Use backward induction.'
        );
        enhancements.mentalModels!.push('Backward Induction', 'Subgame Perfect Equilibrium');
      }
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType);
  }

  /**
   * Resolve input thought type to valid GameTheory thought type
   */
  private resolveThoughtType(inputType: string | undefined): GameTheoryThoughtType {
    if (inputType && this.supportedThoughtTypes.includes(inputType)) {
      return inputType as GameTheoryThoughtType;
    }
    return 'game_definition';
  }

  /**
   * Validate players array
   */
  private validatePlayers(players: Player[], strategies: Strategy[]): ValidationResult {
    const errors = [];
    const warnings = [];
    const playerIds = new Set<string>();

    for (const player of players) {
      // Check for duplicate IDs
      if (playerIds.has(player.id)) {
        errors.push(
          createValidationError(
            'players',
            `Duplicate player ID: ${player.id}`,
            'DUPLICATE_PLAYER_ID'
          )
        );
      }
      playerIds.add(player.id);

      // Check player has strategies
      if (!player.availableStrategies || player.availableStrategies.length === 0) {
        warnings.push(
          createValidationWarning(
            `players.${player.id}`,
            `Player ${player.name || player.id} has no available strategies`,
            'Define available strategies for meaningful game analysis'
          )
        );
      } else {
        // Validate strategy references
        for (const stratId of player.availableStrategies) {
          const strategyExists = strategies.some(s => s.id === stratId);
          if (!strategyExists && strategies.length > 0) {
            errors.push(
              createValidationError(
                `players.${player.id}.availableStrategies`,
                `Player references non-existent strategy: ${stratId}`,
                'INVALID_STRATEGY_REFERENCE'
              )
            );
          }
        }
      }
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Validate strategies array
   */
  private validateStrategies(strategies: Strategy[], players: Player[]): ValidationResult {
    const errors = [];
    const warnings = [];
    const strategyIds = new Set<string>();
    const playerIds = new Set(players.map(p => p.id));

    for (const strategy of strategies) {
      // Check for duplicate IDs
      if (strategyIds.has(strategy.id)) {
        errors.push(
          createValidationError(
            'strategies',
            `Duplicate strategy ID: ${strategy.id}`,
            'DUPLICATE_STRATEGY_ID'
          )
        );
      }
      strategyIds.add(strategy.id);

      // Validate player reference
      if (strategy.playerId && !playerIds.has(strategy.playerId) && players.length > 0) {
        errors.push(
          createValidationError(
            `strategies.${strategy.id}`,
            `Strategy references non-existent player: ${strategy.playerId}`,
            'INVALID_PLAYER_REFERENCE'
          )
        );
      }

      // Validate mixed strategy probability
      if (!strategy.isPure && strategy.probability !== undefined) {
        if (strategy.probability < 0 || strategy.probability > 1) {
          errors.push(
            createValidationError(
              `strategies.${strategy.id}.probability`,
              `Mixed strategy probability (${strategy.probability}) must be between 0 and 1`,
              'INVALID_PROBABILITY'
            )
          );
        }
      }
    }

    // Check mixed strategy probabilities sum to 1 per player
    for (const player of players) {
      const playerStrategies = strategies.filter(s => s.playerId === player.id && !s.isPure);
      if (playerStrategies.length > 0) {
        const probSum = playerStrategies.reduce((sum, s) => sum + (s.probability || 0), 0);
        if (Math.abs(probSum - 1) > 0.001) {
          warnings.push(
            createValidationWarning(
              `strategies`,
              `Mixed strategy probabilities for player ${player.id} sum to ${probSum.toFixed(3)}, not 1`,
              'Ensure mixed strategy probabilities sum to exactly 1'
            )
          );
        }
      }
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Validate payoff matrix
   */
  private validatePayoffMatrix(
    matrix: PayoffMatrix,
    _players: Player[],
    strategies: Strategy[]
  ): ValidationResult {
    const errors = [];
    const warnings = [];

    // Validate dimensions match players
    if (matrix.players.length !== matrix.dimensions.length) {
      errors.push(
        createValidationError(
          'payoffMatrix',
          `Player count (${matrix.players.length}) doesn't match dimension count (${matrix.dimensions.length})`,
          'DIMENSION_MISMATCH'
        )
      );
    }

    // Validate expected number of payoff entries
    const expectedEntries = matrix.dimensions.reduce((a, b) => a * b, 1);
    if (matrix.payoffs.length !== expectedEntries) {
      warnings.push(
        createValidationWarning(
          'payoffMatrix.payoffs',
          `Expected ${expectedEntries} payoff entries based on dimensions, got ${matrix.payoffs.length}`,
          'Ensure all strategy combinations have payoff entries'
        )
      );
    }

    // Validate each payoff entry
    for (let i = 0; i < matrix.payoffs.length; i++) {
      const entry = matrix.payoffs[i];

      // Check strategy profile length matches player count
      if (entry.strategyProfile.length !== matrix.players.length) {
        errors.push(
          createValidationError(
            `payoffMatrix.payoffs[${i}]`,
            `Strategy profile has ${entry.strategyProfile.length} strategies, expected ${matrix.players.length}`,
            'INVALID_STRATEGY_PROFILE'
          )
        );
      }

      // Check payoff array length matches player count
      if (entry.payoffs.length !== matrix.players.length) {
        errors.push(
          createValidationError(
            `payoffMatrix.payoffs[${i}]`,
            `Payoff entry has ${entry.payoffs.length} values, expected ${matrix.players.length}`,
            'INVALID_PAYOFF_COUNT'
          )
        );
      }

      // Validate strategy references
      for (const stratId of entry.strategyProfile) {
        const strategyExists = strategies.some(s => s.id === stratId);
        if (!strategyExists && strategies.length > 0) {
          errors.push(
            createValidationError(
              `payoffMatrix.payoffs[${i}].strategyProfile`,
              `Payoff entry references non-existent strategy: ${stratId}`,
              'INVALID_STRATEGY_REFERENCE'
            )
          );
        }
      }
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Find pure strategy Nash equilibria
   *
   * A strategy profile is a Nash equilibrium if no player can
   * improve their payoff by unilaterally changing their strategy.
   */
  private findPureStrategyNashEquilibria(
    matrix: PayoffMatrix,
    players: Player[],
    strategies: Strategy[]
  ): NashEquilibrium[] {
    const equilibria: NashEquilibrium[] = [];

    // Only handle 2-player games for now
    if (matrix.players.length !== 2 || matrix.dimensions.length !== 2) {
      return equilibria;
    }

    // Check each strategy combination
    for (const entry of matrix.payoffs) {
      if (this.isNashEquilibrium(entry, matrix, players, strategies)) {
        equilibria.push({
          id: randomUUID(),
          strategyProfile: entry.strategyProfile,
          payoffs: entry.payoffs,
          type: 'pure',
          isStrict: this.isStrictEquilibrium(entry, matrix, players, strategies),
          stability: this.calculateEquilibriumStability(entry, matrix, players, strategies),
        });
      }
    }

    return equilibria;
  }

  /**
   * Check if a strategy profile is a Nash equilibrium
   */
  private isNashEquilibrium(
    entry: PayoffEntry,
    matrix: PayoffMatrix,
    _players: Player[],
    _strategies: Strategy[]
  ): boolean {
    // For each player, check if they can improve by deviating
    for (let playerIdx = 0; playerIdx < matrix.players.length; playerIdx++) {
      const currentPayoff = entry.payoffs[playerIdx];

      // Find all alternative strategy profiles where only this player deviates
      for (const altEntry of matrix.payoffs) {
        // Check if only this player's strategy differs
        let onlyThisPlayerDiffers = true;
        for (let i = 0; i < matrix.players.length; i++) {
          if (i === playerIdx) {
            // This player should differ
            if (altEntry.strategyProfile[i] === entry.strategyProfile[i]) {
              onlyThisPlayerDiffers = false;
              break;
            }
          } else {
            // Other players should be the same
            if (altEntry.strategyProfile[i] !== entry.strategyProfile[i]) {
              onlyThisPlayerDiffers = false;
              break;
            }
          }
        }

        // If only this player differs and they get a better payoff, not an equilibrium
        if (onlyThisPlayerDiffers && altEntry.payoffs[playerIdx] > currentPayoff) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if equilibrium is strict (strictly better than all deviations)
   */
  private isStrictEquilibrium(
    entry: PayoffEntry,
    matrix: PayoffMatrix,
    _players: Player[],
    _strategies: Strategy[]
  ): boolean {
    for (let playerIdx = 0; playerIdx < matrix.players.length; playerIdx++) {
      const currentPayoff = entry.payoffs[playerIdx];

      for (const altEntry of matrix.payoffs) {
        let onlyThisPlayerDiffers = true;
        for (let i = 0; i < matrix.players.length; i++) {
          if (i === playerIdx) {
            if (altEntry.strategyProfile[i] === entry.strategyProfile[i]) {
              onlyThisPlayerDiffers = false;
              break;
            }
          } else {
            if (altEntry.strategyProfile[i] !== entry.strategyProfile[i]) {
              onlyThisPlayerDiffers = false;
              break;
            }
          }
        }

        // If deviation gives same payoff, not strict
        if (onlyThisPlayerDiffers && altEntry.payoffs[playerIdx] >= currentPayoff) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Calculate equilibrium stability score
   */
  private calculateEquilibriumStability(
    entry: PayoffEntry,
    matrix: PayoffMatrix,
    _players: Player[],
    _strategies: Strategy[]
  ): number {
    // Calculate average deviation penalty
    let totalPenalty = 0;
    let deviationCount = 0;

    for (let playerIdx = 0; playerIdx < matrix.players.length; playerIdx++) {
      const currentPayoff = entry.payoffs[playerIdx];

      for (const altEntry of matrix.payoffs) {
        let onlyThisPlayerDiffers = true;
        for (let i = 0; i < matrix.players.length; i++) {
          if (i === playerIdx) {
            if (altEntry.strategyProfile[i] === entry.strategyProfile[i]) {
              onlyThisPlayerDiffers = false;
              break;
            }
          } else {
            if (altEntry.strategyProfile[i] !== entry.strategyProfile[i]) {
              onlyThisPlayerDiffers = false;
              break;
            }
          }
        }

        if (onlyThisPlayerDiffers) {
          totalPenalty += currentPayoff - altEntry.payoffs[playerIdx];
          deviationCount++;
        }
      }
    }

    // Higher penalty = more stable
    const avgPenalty = deviationCount > 0 ? totalPenalty / deviationCount : 0;

    // Normalize to 0-1 (assuming payoffs are reasonable)
    return Math.min(1, Math.max(0, 0.5 + avgPenalty / 10));
  }

  /**
   * Find dominant strategies
   */
  private findDominantStrategies(
    matrix: PayoffMatrix,
    players: Player[],
    strategies: Strategy[]
  ): DominantStrategy[] {
    const dominantStrategies: DominantStrategy[] = [];

    // Only handle 2-player games
    if (matrix.players.length !== 2) {
      return dominantStrategies;
    }

    for (let playerIdx = 0; playerIdx < players.length; playerIdx++) {
      const player = players[playerIdx];
      const playerStrategies = strategies.filter(s => s.playerId === player.id);

      for (const strategy of playerStrategies) {
        const dominates = this.checkDominance(strategy, playerIdx, matrix, playerStrategies);
        if (dominates.length > 0) {
          dominantStrategies.push({
            playerId: player.id,
            strategyId: strategy.id,
            type: dominates.length === playerStrategies.length - 1 ? 'strictly_dominant' : 'weakly_dominant',
            dominatesStrategies: dominates,
            justification: `Strategy ${strategy.name || strategy.id} dominates: ${dominates.join(', ')}`,
          });
        }
      }
    }

    return dominantStrategies;
  }

  /**
   * Check which strategies a given strategy dominates
   */
  private checkDominance(
    strategy: Strategy,
    playerIdx: number,
    matrix: PayoffMatrix,
    playerStrategies: Strategy[]
  ): string[] {
    const dominates: string[] = [];

    for (const otherStrategy of playerStrategies) {
      if (otherStrategy.id === strategy.id) continue;

      // Check if strategy dominates otherStrategy
      let dominatesAll = true;

      // Group payoffs by opponent's strategy choices
      const strategyPayoffs = new Map<string, number>();
      const otherPayoffs = new Map<string, number>();

      for (const entry of matrix.payoffs) {
        const key = entry.strategyProfile.filter((_, i) => i !== playerIdx).join('-');

        if (entry.strategyProfile[playerIdx] === strategy.id) {
          strategyPayoffs.set(key, entry.payoffs[playerIdx]);
        }
        if (entry.strategyProfile[playerIdx] === otherStrategy.id) {
          otherPayoffs.set(key, entry.payoffs[playerIdx]);
        }
      }

      // Compare payoffs for all opponent strategy combinations
      for (const [key, payoff] of strategyPayoffs) {
        const otherPayoff = otherPayoffs.get(key);
        if (otherPayoff !== undefined && payoff <= otherPayoff) {
          dominatesAll = false;
          break;
        }
      }

      if (dominatesAll && strategyPayoffs.size > 0) {
        dominates.push(otherStrategy.id);
      }
    }

    return dominates;
  }

  /**
   * Check if game is zero-sum
   */
  private isZeroSumGame(matrix: PayoffMatrix): boolean {
    if (matrix.players.length !== 2) {
      return false; // Only check 2-player games
    }

    for (const entry of matrix.payoffs) {
      const sum = entry.payoffs.reduce((a, b) => a + b, 0);
      if (Math.abs(sum) > 0.001) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if Nash equilibria are Pareto optimal
   */
  private checkParetoOptimality(
    equilibria: NashEquilibrium[],
    matrix: PayoffMatrix | undefined
  ): boolean {
    if (!matrix || equilibria.length === 0) {
      return true; // Assume optimal if no data
    }

    for (const eq of equilibria) {
      // Check if any other outcome Pareto dominates this equilibrium
      for (const entry of matrix.payoffs) {
        let paretoDominates = true;
        let strictlyBetter = false;

        for (let i = 0; i < entry.payoffs.length; i++) {
          if (entry.payoffs[i] < eq.payoffs[i]) {
            paretoDominates = false;
            break;
          }
          if (entry.payoffs[i] > eq.payoffs[i]) {
            strictlyBetter = true;
          }
        }

        if (paretoDominates && strictlyBetter) {
          return false; // Found a Pareto dominating outcome
        }
      }
    }

    return true;
  }
}
