/**
 * Game-Theoretic Reasoning Mode - Type Definitions
 * Phase 3B (v2.2) - Strategic analysis, Nash equilibria, payoff matrices
 */

import { BaseThought, ThinkingMode } from '../core.js';

export interface GameTheoryThought extends BaseThought {
  mode: ThinkingMode.GAMETHEORY;
  thoughtType:
    | 'game_definition'
    | 'strategy_analysis'
    | 'equilibrium_finding'
    | 'payoff_computation'
    | 'dominance_analysis';

  game?: Game;
  players?: Player[];
  strategies?: Strategy[];
  payoffMatrix?: PayoffMatrix;
  nashEquilibria?: NashEquilibrium[];
  dominantStrategies?: DominantStrategy[];
  gameTree?: GameTree;
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
