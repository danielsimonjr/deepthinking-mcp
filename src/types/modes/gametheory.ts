/**
 * Game-Theoretic Reasoning Mode - Type Definitions
 * Phase 3B (v2.2) - Strategic analysis, Nash equilibria, payoff matrices
 * Phase 11 (v7.2.0) - Extended with von Neumann's cooperative game theory and minimax theorem
 *
 * Historical Note: John von Neumann proved the minimax theorem in 1928 and
 * co-founded cooperative game theory with Oskar Morgenstern in 1944.
 */

import { BaseThought, ThinkingMode } from '../core.js';

export interface GameTheoryThought extends BaseThought {
  mode: ThinkingMode.GAMETHEORY;
  thoughtType:
    | 'game_definition'
    | 'strategy_analysis'
    | 'equilibrium_finding'
    | 'payoff_computation'
    | 'dominance_analysis'
    // Phase 11: Von Neumann extensions
    | 'minimax_analysis'        // Von Neumann's minimax theorem
    | 'cooperative_analysis'    // Cooperative game theory
    | 'coalition_formation'     // Coalition analysis
    | 'shapley_value'          // Fair allocation computation
    | 'core_analysis';         // Core stability analysis

  game?: Game;
  players?: Player[];
  strategies?: Strategy[];
  payoffMatrix?: PayoffMatrix;
  nashEquilibria?: NashEquilibrium[];
  dominantStrategies?: DominantStrategy[];
  gameTree?: GameTree;

  // Phase 11: Von Neumann extensions
  minimaxAnalysis?: MinimaxAnalysis;
  cooperativeGame?: CooperativeGame;
  coalitionAnalysis?: CoalitionAnalysis;
}

/**
 * Game definition
 */
export interface Game {
  id: string;
  name: string;
  description: string;
  type: 'normal_form' | 'extensive_form' | 'cooperative' | 'non_cooperative';
  numPlayers: number;
  isZeroSum: boolean;
  isPerfectInformation: boolean;
}

/**
 * Player in the game
 */
export interface Player {
  id: string;
  name: string;
  role?: string;
  isRational: boolean;
  availableStrategies: string[]; // Strategy IDs
}

/**
 * Strategy that a player can choose
 */
export interface Strategy {
  id: string;
  playerId: string;
  name: string;
  description: string;
  isPure: boolean; // true for pure strategy, false for mixed
  probability?: number; // for mixed strategies (0-1)
}

/**
 * Payoff matrix for normal form games
 */
export interface PayoffMatrix {
  players: string[]; // Player IDs in order
  dimensions: number[]; // Number of strategies per player
  payoffs: PayoffEntry[];
  latex?: string; // LaTeX representation of the payoff matrix
}

/**
 * Single entry in payoff matrix
 */
export interface PayoffEntry {
  strategyProfile: string[]; // Strategy IDs for each player
  payoffs: number[]; // Payoff for each player
}

/**
 * Nash equilibrium solution
 */
export interface NashEquilibrium {
  id: string;
  strategyProfile: string[]; // Strategy IDs for each player
  payoffs: number[]; // Resulting payoffs
  type: 'pure' | 'mixed';
  isStrict: boolean; // No player wants to deviate
  stability: number; // 0-1, how stable is this equilibrium
  formula?: string; // LaTeX formula showing equilibrium conditions
}

/**
 * Dominant strategy for a player
 */
export interface DominantStrategy {
  playerId: string;
  strategyId: string;
  type: 'strictly_dominant' | 'weakly_dominant';
  dominatesStrategies: string[]; // Other strategy IDs this dominates
  justification: string;
  formula?: string; // LaTeX formula showing dominance relationship
}

/**
 * Game tree for extensive form games
 */
export interface GameTree {
  rootNode: string; // Node ID
  nodes: GameNode[];
  informationSets?: InformationSet[];
}

/**
 * Node in game tree
 */
export interface GameNode {
  id: string;
  type: 'decision' | 'chance' | 'terminal';
  playerId?: string; // Which player moves (for decision nodes)
  parentNode?: string; // Parent node ID
  childNodes: string[]; // Child node IDs
  action?: string; // Action that led to this node
  probability?: number; // For chance nodes
  payoffs?: number[]; // For terminal nodes
}

/**
 * Information set (nodes player cannot distinguish)
 */
export interface InformationSet {
  id: string;
  playerId: string;
  nodes: string[]; // Node IDs in this set
  availableActions: string[];
}

/**
 * Backward induction solution
 */
export interface BackwardInduction {
  subgamePerfectEquilibrium: string[]; // Sequence of strategy IDs
  optimalPath: string[]; // Node IDs along optimal path
  expectedPayoffs: number[];
}

export function isGameTheoryThought(thought: BaseThought): thought is GameTheoryThought {
  return thought.mode === 'gametheory';
}

// ============================================================================
// Phase 11: Von Neumann Extensions (v7.2.0)
// ============================================================================

/**
 * Von Neumann's Minimax Theorem Analysis
 *
 * For two-person zero-sum games, von Neumann proved in 1928 that:
 * max_x min_y (x^T A y) = min_y max_x (x^T A y) = v (game value)
 *
 * This guarantees the existence of optimal mixed strategies.
 */
export interface MinimaxAnalysis {
  /** The game value (guaranteed to exist for zero-sum games) */
  gameValue: number;

  /** Maximin value: max over rows of (min over columns) */
  maximin: number;

  /** Minimax value: min over columns of (max over rows) */
  minimax: number;

  /** Whether a pure strategy saddle point exists */
  hasSaddlePoint: boolean;

  /** Saddle point location if it exists [row, col] */
  saddlePoint?: [number, number];

  /** Optimal mixed strategy for row player (probabilities) */
  optimalRowStrategy: number[];

  /** Optimal mixed strategy for column player (probabilities) */
  optimalColumnStrategy: number[];

  /** Method used to compute the solution */
  solutionMethod: 'linear_programming' | 'lemke_howson' | 'iterative' | 'analytical';

  /** Proof structure for the minimax theorem application */
  proofStructure?: {
    /** The game matrix */
    matrix: number[][];

    /** Steps showing maximin = minimax = v */
    steps: string[];

    /** Reference to von Neumann's 1928 theorem */
    theorem: 'von_neumann_1928';
  };

  /** Security levels for each player */
  securityLevels: {
    rowPlayer: number;
    columnPlayer: number;
  };
}

/**
 * Cooperative Game Theory (von Neumann-Morgenstern, 1944)
 *
 * Cooperative games are defined by a characteristic function v(S)
 * that assigns a value to each coalition S ⊆ N of players.
 */
export interface CooperativeGame {
  /** Game identifier */
  id: string;

  /** Player set N */
  players: string[];

  /** Characteristic function v: 2^N → R */
  characteristicFunction: CoalitionValue[];

  /** Whether the game is superadditive */
  isSuperadditive: boolean;

  /** Whether the game is convex (supermodular) */
  isConvex: boolean;

  /** Whether the game has a non-empty core */
  hasNonEmptyCore: boolean;

  /** The core of the game (stable allocations) */
  core?: CoreAllocation[];

  /** Shapley value for each player */
  shapleyValues?: Record<string, number>;

  /** Nucleolus (lexicographically optimal allocation) */
  nucleolus?: number[];

  /** Banzhaf power index for voting games */
  banzhafIndex?: Record<string, number>;

  /** Description of the cooperative structure */
  description?: string;
}

/**
 * Value assigned to a coalition
 */
export interface CoalitionValue {
  /** Set of player IDs in the coalition */
  coalition: string[];

  /** Value v(S) of this coalition */
  value: number;

  /** How the coalition was formed */
  formationReason?: string;
}

/**
 * An allocation in the core
 */
export interface CoreAllocation {
  /** Allocation to each player */
  allocation: Record<string, number>;

  /** Whether this is an imputation (individually rational, efficient) */
  isImputation: boolean;

  /** Distance to the nucleolus (lower is more stable) */
  distanceToNucleolus?: number;

  /** Explanation of why this is in the core */
  justification?: string;
}

/**
 * Coalition Analysis
 */
export interface CoalitionAnalysis {
  /** The grand coalition N */
  grandCoalition: {
    players: string[];
    value: number;
  };

  /** All coalitions and their values */
  coalitions: CoalitionValue[];

  /** Winning coalitions (for voting games) */
  winningCoalitions?: string[][];

  /** Minimal winning coalitions */
  minimalWinningCoalitions?: string[][];

  /** Veto players (players in every winning coalition) */
  vetoPlayers?: string[];

  /** Blocking coalitions */
  blockingCoalitions?: string[][];

  /** Coalition structure stability analysis */
  stability?: {
    isStable: boolean;
    deviatingCoalition?: string[];
    improvementAmount?: number;
  };
}

/**
 * Shapley Value Computation Details
 *
 * The Shapley value φ_i is the weighted average of player i's
 * marginal contributions across all coalition orderings.
 *
 * φ_i = Σ_{S⊆N\{i}} [|S|!(n-|S|-1)!/n!] × [v(S∪{i}) - v(S)]
 */
export interface ShapleyValueDetails {
  /** Player ID */
  playerId: string;

  /** Final Shapley value */
  value: number;

  /** Marginal contributions for each coalition */
  marginalContributions: {
    coalition: string[];
    marginalContribution: number;
    weight: number;
  }[];

  /** LaTeX formula for this player's Shapley value */
  formula?: string;
}

/**
 * Helper: Create a characteristic function from a list of coalition values
 */
export function createCharacteristicFunction(
  coalitionValues: Array<{ players: string[]; value: number }>
): CoalitionValue[] {
  return coalitionValues.map(cv => ({
    coalition: cv.players,
    value: cv.value,
  }));
}

/**
 * Helper: Check if a game is superadditive
 * A game is superadditive if v(S ∪ T) ≥ v(S) + v(T) for disjoint S, T
 */
export function checkSuperadditivity(characteristicFunction: CoalitionValue[]): boolean {
  const valueMap = new Map<string, number>();

  for (const cv of characteristicFunction) {
    const key = [...cv.coalition].sort().join(',');
    valueMap.set(key, cv.value);
  }

  // Get all coalitions
  const coalitions = characteristicFunction.map(cv => cv.coalition);

  // Check all pairs of disjoint coalitions
  for (let i = 0; i < coalitions.length; i++) {
    for (let j = i + 1; j < coalitions.length; j++) {
      const S = coalitions[i];
      const T = coalitions[j];

      // Check if disjoint
      const isDisjoint = !S.some(p => T.includes(p));
      if (!isDisjoint) continue;

      // Check superadditivity condition
      const union = [...new Set([...S, ...T])];
      const unionKey = [...union].sort().join(',');
      const sKey = [...S].sort().join(',');
      const tKey = [...T].sort().join(',');

      const vUnion = valueMap.get(unionKey) ?? 0;
      const vS = valueMap.get(sKey) ?? 0;
      const vT = valueMap.get(tKey) ?? 0;

      if (vUnion < vS + vT) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Helper: Calculate Shapley value for a player
 */
export function calculateShapleyValue(
  playerId: string,
  players: string[],
  characteristicFunction: CoalitionValue[]
): number {
  const n = players.length;
  const valueMap = new Map<string, number>();

  for (const cv of characteristicFunction) {
    const key = [...cv.coalition].sort().join(',');
    valueMap.set(key, cv.value);
  }

  // Empty coalition has value 0
  valueMap.set('', 0);

  let shapleyValue = 0;

  // Get all subsets of N \ {i}
  const otherPlayers = players.filter(p => p !== playerId);
  const subsets = getAllSubsets(otherPlayers);

  for (const S of subsets) {
    const sSize = S.length;
    const sKey = [...S].sort().join(',');
    const sUnionI = [...S, playerId];
    const sUnionIKey = [...sUnionI].sort().join(',');

    const vS = valueMap.get(sKey) ?? 0;
    const vSUnionI = valueMap.get(sUnionIKey) ?? 0;
    const marginalContribution = vSUnionI - vS;

    // Weight: |S|! × (n - |S| - 1)! / n!
    const weight = (factorial(sSize) * factorial(n - sSize - 1)) / factorial(n);

    shapleyValue += weight * marginalContribution;
  }

  return shapleyValue;
}

// Helper function for subsets
function getAllSubsets<T>(array: T[]): T[][] {
  const subsets: T[][] = [[]];
  for (const element of array) {
    const length = subsets.length;
    for (let i = 0; i < length; i++) {
      subsets.push([...subsets[i], element]);
    }
  }
  return subsets;
}

// Helper function for factorial
function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
