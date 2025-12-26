# Stochastic Reasoning Mode

**Version**: 8.4.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_probabilistic`
**Status**: Stable (Advanced Runtime Mode)
**Source**: `src/types/modes/stochastic.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `StochasticProcessType`, `DistributionType`
- **Interfaces**: `StochasticThought`, `StochasticState`, `StateTransition`, `MarkovChain`, `RandomVariable`, `MonteCarloSimulation`
- **Functions**: `isStochasticThought`

---

## Overview

Stochastic reasoning handles **probabilistic processes** including Markov chains, random walks, Monte Carlo simulations, and other random phenomena. It models state transitions, computes stationary distributions, and analyzes convergence.

This mode captures the structure of stochastic thinking - defining states, specifying transition probabilities, and analyzing long-run behavior.

## When to Use Stochastic Mode

Use stochastic reasoning when you need to:

- **Model random processes** - State machines with probabilities
- **Markov chain analysis** - Stationary distributions, hitting times
- **Monte Carlo simulation** - Estimate expectations via sampling
- **Queueing theory** - Model arrival/service processes
- **Random walk analysis** - Diffusion, financial models

## Thought Types

| Type | Description |
|------|-------------|
| `process_definition` | Defining the stochastic process |
| `state_analysis` | Analyzing individual states |
| `transition_modeling` | Defining transition probabilities |
| `simulation_run` | Executing Monte Carlo |
| `stationary_analysis` | Finding steady-state |
| `convergence_check` | Checking convergence |
| `transition_analysis` | Analyzing transition matrix |
| `steady_state_analysis` | Computing π = πP |
| `random_variable_definition` | Defining random variables |
| `monte_carlo_simulation` | Running simulations |
| `hitting_time_analysis` | Expected first passage times |

## Process Types

| Type | Description |
|------|-------------|
| `discrete_markov_chain` | Discrete states, discrete time |
| `continuous_markov_chain` | Discrete states, continuous time |
| `random_walk` | Integer-valued Markov chain |
| `poisson_process` | Event arrivals |
| `brownian_motion` | Continuous state, continuous time |
| `birth_death_process` | Queueing models |

## Key Properties

| Property | Type | Description |
|----------|------|-------------|
| `processType` | `StochasticProcessType` | Type of process |
| `stepCount` | `number` | Current step/time |
| `states` | `StochasticState[]` | State space |
| `currentState` | `string` | Current state |
| `stateHistory` | `string[]` | State trajectory |
| `transitions` | `StateTransition[]` | Transition rules |
| `markovChain` | `MarkovChain` | Chain specification |
| `randomVariables` | `RandomVariable[]` | RVs in the model |

## Example Usage

```json
{
  "tool": "deepthinking_probabilistic",
  "arguments": {
    "mode": "stochastic",
    "thought": "Analyzing customer churn as Markov chain",
    "thoughtNumber": 1,
    "totalThoughts": 3,
    "nextThoughtNeeded": true,
    "thoughtType": "stationary_analysis",
    "processType": "discrete_markov_chain",
    "stepCount": 0,
    "states": [
      {"id": "active", "name": "Active", "probability": 0.8},
      {"id": "at_risk", "name": "At Risk", "probability": 0.15},
      {"id": "churned", "name": "Churned", "probability": 0.05}
    ],
    "transitions": [
      {"from": "active", "to": "active", "probability": 0.85},
      {"from": "active", "to": "at_risk", "probability": 0.10},
      {"from": "active", "to": "churned", "probability": 0.05},
      {"from": "at_risk", "to": "active", "probability": 0.30},
      {"from": "at_risk", "to": "at_risk", "probability": 0.40},
      {"from": "at_risk", "to": "churned", "probability": 0.30},
      {"from": "churned", "to": "churned", "probability": 1.0}
    ],
    "markovChain": {
      "isIrreducible": false,
      "isAperiodic": true,
      "absorbingStates": ["churned"]
    }
  }
}
```

## Best Practices

1. **Verify transition probabilities sum to 1** - For each state
2. **Check irreducibility** - Can you reach any state from any state?
3. **Identify absorbing states** - States you can't leave
4. **Compute stationary distribution** - Long-run behavior
5. **Use Monte Carlo for complex systems** - When analytical solutions are hard

## Related Modes

- **Bayesian** - Probabilistic inference
- **Temporal** - Time-dependent reasoning
- **Optimization** - Stochastic optimization
