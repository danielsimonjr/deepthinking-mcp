# Game Theory Mode

**Version**: 7.3.0
**Tool**: `deepthinking_strategic`
**Status**: Experimental
**Source**: `src/types/modes/gametheory.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Interfaces**: `GameTheoryThought`, `Game`, `Player`, `Strategy`, `PayoffMatrix`, `PayoffEntry`, `NashEquilibrium`, `DominantStrategy`, `GameTree`, `GameNode`, `InformationSet`, `BackwardInduction`, `MinimaxAnalysis`, `CooperativeGame`, `CoalitionValue`, `CoreAllocation`, `CoalitionAnalysis`, `ShapleyValueDetails`
- **Functions**: `isGameTheoryThought`, `createCharacteristicFunction`, `checkSuperadditivity`, `calculateShapleyValue`

---

## Overview

Game Theory mode provides **strategic analysis** using payoff matrices, Nash equilibria, dominant strategies, and game trees. Phase 11 extends this with **von Neumann's cooperative game theory** including minimax theorem, Shapley values, and coalition analysis.

This mode captures the structure of game-theoretic reasoning - from game definition through strategy analysis to equilibrium finding.

## Thought Types

| Type | Description |
|------|-------------|
| `game_definition` | Define game structure and players |
| `strategy_analysis` | Analyze available strategies |
| `equilibrium_finding` | Find Nash equilibria |
| `payoff_computation` | Compute payoffs for strategy profiles |
| `dominance_analysis` | Identify dominant strategies |
| `minimax_analysis` | Von Neumann's minimax theorem (Phase 11) |
| `cooperative_analysis` | Cooperative game theory (Phase 11) |
| `coalition_formation` | Coalition analysis (Phase 11) |
| `shapley_value` | Fair allocation computation (Phase 11) |
| `core_analysis` | Core stability analysis (Phase 11) |

## When to Use Game Theory Mode

Use game theory mode when you need to:

- **Model strategic interactions** - Multiple agents with conflicting interests
- **Find equilibria** - Nash equilibria, dominant strategy equilibria
- **Analyze coalitions** - Cooperative games, fair division
- **Compute fair allocations** - Shapley value, nucleolus
- **Analyze zero-sum games** - Minimax strategies

### Problem Types Well-Suited for Game Theory Mode

- **Competitive scenarios** - Auctions, negotiations, competitions
- **Mechanism design** - Designing fair allocation rules
- **Market analysis** - Oligopoly, competition modeling
- **Coalition problems** - Voting, cost sharing
- **Strategic decision-making** - Any multi-agent decision scenario

## Core Concepts

### Game Definition

```typescript
interface Game {
  id: string;
  name: string;
  description: string;
  type: 'normal_form' | 'extensive_form' | 'cooperative' | 'non_cooperative';
  numPlayers: number;
  isZeroSum: boolean;
  isPerfectInformation: boolean;
}
```

### Players and Strategies

```typescript
interface Player {
  id: string;
  name: string;
  role?: string;
  isRational: boolean;
  availableStrategies: string[];  // Strategy IDs
}

interface Strategy {
  id: string;
  playerId: string;
  name: string;
  description: string;
  isPure: boolean;         // true for pure, false for mixed
  probability?: number;    // For mixed strategies (0-1)
}
```

### Payoff Matrix

```typescript
interface PayoffMatrix {
  players: string[];        // Player IDs in order
  dimensions: number[];     // Number of strategies per player
  payoffs: PayoffEntry[];
  latex?: string;           // LaTeX representation
}

interface PayoffEntry {
  strategyProfile: string[];  // Strategy IDs for each player
  payoffs: number[];          // Payoff for each player
}
```

### Nash Equilibrium

```typescript
interface NashEquilibrium {
  id: string;
  strategyProfile: string[];  // Strategy IDs for each player
  payoffs: number[];
  type: 'pure' | 'mixed';
  isStrict: boolean;          // No player wants to deviate
  stability: number;          // 0-1
  formula?: string;           // LaTeX for equilibrium conditions
}
```

### Von Neumann Extensions (Phase 11)

#### Minimax Analysis

```typescript
interface MinimaxAnalysis {
  gameValue: number;
  maximin: number;
  minimax: number;
  hasSaddlePoint: boolean;
  saddlePoint?: [number, number];
  optimalRowStrategy: number[];
  optimalColumnStrategy: number[];
  solutionMethod: 'linear_programming' | 'lemke_howson' | 'iterative' | 'analytical';
  securityLevels: {
    rowPlayer: number;
    columnPlayer: number;
  };
}
```

#### Cooperative Game

```typescript
interface CooperativeGame {
  id: string;
  players: string[];
  characteristicFunction: CoalitionValue[];
  isSuperadditive: boolean;
  isConvex: boolean;
  hasNonEmptyCore: boolean;
  core?: CoreAllocation[];
  shapleyValues?: Record<string, number>;
  nucleolus?: number[];
  banzhafIndex?: Record<string, number>;
}
```

#### Shapley Value

The Shapley value φ_i is the weighted average of player i's marginal contributions:

$$φ_i = Σ_{S⊆N\{i}} \frac{|S|!(n-|S|-1)!}{n!} × [v(S∪\{i\}) - v(S)]$$

```typescript
interface ShapleyValueDetails {
  playerId: string;
  value: number;
  marginalContributions: {
    coalition: string[];
    marginalContribution: number;
    weight: number;
  }[];
  formula?: string;
}
```

## Usage Example

```typescript
// Game definition
const game = await deepthinking_strategic({
  mode: 'gametheory',
  thought: 'Define the Prisoner\'s Dilemma game',
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'game_definition',
  game: {
    id: 'prisoners_dilemma',
    name: 'Prisoner\'s Dilemma',
    description: 'Classic game of cooperation vs defection',
    type: 'normal_form',
    numPlayers: 2,
    isZeroSum: false,
    isPerfectInformation: true
  },
  players: [
    { id: 'p1', name: 'Player 1', isRational: true, availableStrategies: ['cooperate', 'defect'] },
    { id: 'p2', name: 'Player 2', isRational: true, availableStrategies: ['cooperate', 'defect'] }
  ],
  strategies: [
    { id: 'cooperate', playerId: 'p1', name: 'Cooperate', description: 'Stay silent', isPure: true },
    { id: 'defect', playerId: 'p1', name: 'Defect', description: 'Betray partner', isPure: true }
  ]
});

// Payoff matrix
const payoffs = await deepthinking_strategic({
  mode: 'gametheory',
  thought: 'Define payoff matrix',
  thoughtNumber: 2,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'payoff_computation',
  payoffMatrix: {
    players: ['p1', 'p2'],
    dimensions: [2, 2],
    payoffs: [
      { strategyProfile: ['cooperate', 'cooperate'], payoffs: [-1, -1] },
      { strategyProfile: ['cooperate', 'defect'], payoffs: [-3, 0] },
      { strategyProfile: ['defect', 'cooperate'], payoffs: [0, -3] },
      { strategyProfile: ['defect', 'defect'], payoffs: [-2, -2] }
    ],
    latex: '\\begin{pmatrix} (-1,-1) & (-3,0) \\\\ (0,-3) & (-2,-2) \\end{pmatrix}'
  }
});

// Dominance analysis
const dominance = await deepthinking_strategic({
  mode: 'gametheory',
  thought: 'Identify dominant strategies',
  thoughtNumber: 3,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'dominance_analysis',
  dominantStrategies: [
    {
      playerId: 'p1',
      strategyId: 'defect',
      type: 'strictly_dominant',
      dominatesStrategies: ['cooperate'],
      justification: 'Defect yields higher payoff regardless of opponent\'s choice',
      formula: 'u_1(D, s_2) > u_1(C, s_2) \\forall s_2'
    },
    {
      playerId: 'p2',
      strategyId: 'defect',
      type: 'strictly_dominant',
      dominatesStrategies: ['cooperate'],
      justification: 'Symmetric game - defect dominates for P2 as well'
    }
  ]
});

// Nash equilibrium
const equilibrium = await deepthinking_strategic({
  mode: 'gametheory',
  thought: 'Find Nash equilibrium',
  thoughtNumber: 4,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  thoughtType: 'equilibrium_finding',
  nashEquilibria: [{
    id: 'ne_1',
    strategyProfile: ['defect', 'defect'],
    payoffs: [-2, -2],
    type: 'pure',
    isStrict: true,
    stability: 1.0,
    formula: '(D, D) \\text{ is the unique Nash equilibrium}'
  }]
});

// Cooperative game analysis (Phase 11)
const cooperative = await deepthinking_strategic({
  mode: 'gametheory',
  thought: 'Analyze as cooperative game',
  thoughtNumber: 5,
  totalThoughts: 5,
  nextThoughtNeeded: false,

  thoughtType: 'cooperative_analysis',
  cooperativeGame: {
    id: 'coop_game',
    players: ['p1', 'p2'],
    characteristicFunction: [
      { coalition: [], value: 0 },
      { coalition: ['p1'], value: -2 },
      { coalition: ['p2'], value: -2 },
      { coalition: ['p1', 'p2'], value: -2 }  // Both cooperating yields -1,-1 = -2 total
    ],
    isSuperadditive: false,  // v({1,2}) = -2 < v({1}) + v({2}) = -4 (not superadditive because cooperation is better)
    isConvex: false,
    hasNonEmptyCore: true,
    shapleyValues: { p1: -1, p2: -1 }
  }
});
```

## Best Practices

### Game Definition

✅ **Do:**
- Clearly specify game type
- Define all players and strategies
- Note information structure

❌ **Don't:**
- Confuse game types
- Omit important strategies
- Ignore information sets

### Equilibrium Analysis

✅ **Do:**
- Find all equilibria
- Distinguish pure vs mixed
- Assess equilibrium stability

❌ **Don't:**
- Stop at first equilibrium
- Ignore mixed equilibria
- Skip refinements

### Cooperative Games

✅ **Do:**
- Define characteristic function completely
- Check superadditivity
- Compute Shapley values for fairness

❌ **Don't:**
- Omit coalition values
- Ignore core emptiness
- Skip fairness analysis

## GameTheoryThought Interface

```typescript
interface GameTheoryThought extends BaseThought {
  mode: ThinkingMode.GAMETHEORY;
  thoughtType: /* see types above */;

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
```

## Historical Note

**John von Neumann** (1903-1957) proved the minimax theorem in 1928 and co-founded cooperative game theory with Oskar Morgenstern in 1944 through their book "Theory of Games and Economic Behavior."

## Integration with Other Modes

Game Theory mode integrates with:

- **Optimization Mode** - Strategy optimization
- **Bayesian Mode** - Games with incomplete information
- **Causal Mode** - Strategic causation

## Related Modes

- [Optimization Mode](./OPTIMIZATION.md) - Optimization
- [Bayesian Mode](./BAYESIAN.md) - Probabilistic reasoning
- [Causal Mode](./CAUSAL.md) - Causal reasoning

## Limitations

- **No automated solvers** - Manual equilibrium computation
- **Limited to modeling** - No game-theoretic algorithms
- **Complexity** - Large games require external tools

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
