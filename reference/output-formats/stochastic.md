# Stochastic Thought — Output Format

Modeling probabilistic processes: state transitions, distributions, Markov chains, Monte Carlo simulation.

## JSON Schema

```json
{
  "mode": "stochastic",
  "processType": "<discrete_markov_chain | continuous_markov_chain | random_walk | monte_carlo | queueing>",
  "stepCount": <integer >= 0>,
  "states": [
    {
      "id": "<id>",
      "name": "<name>",
      "description": "<what this state represents>",
      "isAbsorbing": <boolean>,
      "isTransient": <boolean>
    }
  ],
  "transitions": [
    { "from": "<state id>", "to": "<state id>", "probability": <0-1> }
  ],
  "markovChain": {
    "id": "<id>",
    "states": ["<state ids>"],
    "transitionMatrix": [[<row values>]],
    "initialDistribution": [<values summing to 1>],
    "stationaryDistribution": [<values summing to 1>],
    "isIrreducible": <boolean>,
    "isAperiodic": <boolean>,
    "isErgodic": <boolean>
  },
  "randomVariables": [
    {
      "id": "<id>",
      "name": "<name>",
      "distribution": "<Exponential | Poisson | Normal | Uniform | Binomial | Geometric | Gamma | Beta | Bernoulli>",
      "parameters": { "<param>": <value> },
      "mean": <number>,
      "variance": <number>
    }
  ]
}
```

## Required Fields

- `mode` — always `"stochastic"`
- `processType` — what kind of stochastic process this is
- `stepCount` — current step in the process (0 = initial setup)

## Key Distinction from Bayesian

**Bayesian** reasoning updates beliefs about a fixed unknown parameter θ using Bayes' theorem (prior × likelihood → posterior). **Stochastic** reasoning models the *random process itself* — how a system evolves through states over time according to transition probabilities. Bayesian asks "what is θ?"; Stochastic asks "how does this system behave in the long run?"

## Process Types

| Type | Description | Key Analysis |
|------|-------------|--------------|
| `discrete_markov_chain` | Discrete-time state transitions | Stationary distribution, hitting times |
| `continuous_markov_chain` | Continuous-time (CTMC) | Steady-state, transition rates |
| `random_walk` | Position updates by random steps | Expected displacement, variance growth |
| `monte_carlo` | Estimate expectations via sampling | Mean, variance, confidence intervals |
| `queueing` | Arrival/service processes | Wait times, utilization, queue length |

## Worked Example

Input: "Model the distribution of queue wait times for our ticket system."

Output:

```json
{
  "mode": "stochastic",
  "processType": "queueing",
  "stepCount": 0,
  "states": [
    { "id": "empty", "name": "Empty Queue", "description": "No tickets waiting; server idle", "isAbsorbing": false, "isTransient": false },
    { "id": "busy_1", "name": "1 Ticket Being Processed", "description": "One ticket in service, none waiting", "isAbsorbing": false, "isTransient": false },
    { "id": "busy_2plus", "name": "Queue Building", "description": "One in service, one or more waiting", "isAbsorbing": false, "isTransient": false }
  ],
  "transitions": [
    { "from": "empty", "to": "empty", "probability": 0.30 },
    { "from": "empty", "to": "busy_1", "probability": 0.70 },
    { "from": "busy_1", "to": "empty", "probability": 0.55 },
    { "from": "busy_1", "to": "busy_2plus", "probability": 0.45 },
    { "from": "busy_2plus", "to": "busy_1", "probability": 0.60 },
    { "from": "busy_2plus", "to": "busy_2plus", "probability": 0.40 }
  ],
  "markovChain": {
    "id": "mc_ticket_queue",
    "states": ["empty", "busy_1", "busy_2plus"],
    "transitionMatrix": [
      [0.30, 0.70, 0.00],
      [0.55, 0.00, 0.45],
      [0.00, 0.60, 0.40]
    ],
    "initialDistribution": [1.0, 0.0, 0.0],
    "stationaryDistribution": [0.32, 0.39, 0.29],
    "isIrreducible": true,
    "isAperiodic": true,
    "isErgodic": true
  },
  "randomVariables": [
    {
      "id": "rv_arrival",
      "name": "Ticket inter-arrival time",
      "distribution": "Exponential",
      "parameters": { "rate": 5.0 },
      "mean": 0.20,
      "variance": 0.04
    },
    {
      "id": "rv_service",
      "name": "Ticket service time",
      "distribution": "Exponential",
      "parameters": { "rate": 8.0 },
      "mean": 0.125,
      "variance": 0.016
    }
  ]
}
```

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"stochastic"`
- `processType` is one of the five valid enum values
- Transition probabilities from each state sum to 1.0
- `stationaryDistribution` values sum to 1.0 when present
- `isErgodic` is `true` only when both `isIrreducible` and `isAperiodic` are `true`
- Random variable `distribution` names match the actual distributions used
- Mean and variance are consistent with the distribution and its parameters
