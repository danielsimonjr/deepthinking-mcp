/**
 * Hand-Written JSON Schemas for MCP Tools (v4.4.0)
 *
 * Following the pattern used by working MCP servers (sequential-thinking-mcp, memory-mcp):
 * - JSON schemas are hand-written as plain JavaScript objects
 * - Conforming to JSON Schema draft 2020-12
 * - Zod schemas remain for runtime validation only
 */

/**
 * Base properties shared by all thought-adding tools
 */
const baseThoughtProperties = {
  sessionId: {
    type: "string",
    description: "Optional session ID. If not provided, a new session will be created."
  },
  thought: {
    type: "string",
    description: "The current thought or reasoning step",
    minLength: 1
  },
  thoughtNumber: {
    type: "integer",
    description: "Current thought number in sequence",
    minimum: 1
  },
  totalThoughts: {
    type: "integer",
    description: "Estimated total number of thoughts needed",
    minimum: 1
  },
  nextThoughtNeeded: {
    type: "boolean",
    description: "Whether another thought step is needed"
  },
  isRevision: {
    type: "boolean",
    description: "Whether this thought revises previous thinking"
  },
  revisesThought: {
    type: "string",
    description: "ID of the thought being revised"
  },
  revisionReason: {
    type: "string",
    description: "Explanation for why revision is needed"
  },
  branchFrom: {
    type: "string",
    description: "ID of thought to branch from for alternative reasoning path"
  },
  branchId: {
    type: "string",
    description: "Identifier for this reasoning branch"
  },
  uncertainty: {
    type: "number",
    description: "Confidence level (0-1, where 1 is highest confidence)",
    minimum: 0,
    maximum: 1
  },
  dependencies: {
    type: "array",
    items: { type: "string" },
    description: "IDs of thoughts this one depends on"
  },
  assumptions: {
    type: "array",
    items: { type: "string" },
    description: "Key assumptions made in this thought"
  }
} as const;

const baseThoughtRequired = ["thought", "thoughtNumber", "totalThoughts", "nextThoughtNeeded"] as const;

/**
 * deepthinking_core - Sequential, Shannon, Hybrid modes
 */
export const deepthinking_core_schema = {
  name: "deepthinking_core",
  description: "Core modes: sequential, shannon (5-stage), hybrid",
  inputSchema: {
    type: "object",
    properties: {
      ...baseThoughtProperties,
      mode: {
        type: "string",
        enum: ["sequential", "shannon", "hybrid"],
        description: "Thinking mode to use"
      },
      stage: {
        type: "string",
        enum: ["problem_definition", "constraints", "model", "proof", "implementation"],
        description: "Shannon methodology stage (only for shannon mode)"
      },
      activeModes: {
        type: "array",
        items: { type: "string" },
        description: "Active sub-modes for hybrid mode"
      }
    },
    required: [...baseThoughtRequired],
    additionalProperties: false
  }
} as const;

/**
 * deepthinking_math - Mathematics and Physics modes
 */
export const deepthinking_math_schema = {
  name: "deepthinking_math",
  description: "Math/physics: proofs, tensors, LaTeX, conservation laws",
  inputSchema: {
    type: "object",
    properties: {
      ...baseThoughtProperties,
      mode: {
        type: "string",
        enum: ["mathematics", "physics"],
        description: "Mathematical reasoning mode"
      },
      mathematicalModel: {
        type: "object",
        properties: {
          latex: { type: "string", description: "LaTeX representation" },
          symbolic: { type: "string", description: "Symbolic notation" },
          ascii: { type: "string", description: "ASCII math representation" }
        },
        required: ["latex", "symbolic"],
        additionalProperties: false,
        description: "Mathematical model representation"
      },
      proofStrategy: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["direct", "contradiction", "induction", "construction", "contrapositive"],
            description: "Type of mathematical proof"
          },
          steps: {
            type: "array",
            items: { type: "string" },
            description: "Proof steps"
          }
        },
        required: ["type", "steps"],
        additionalProperties: false,
        description: "Proof strategy being used"
      },
      tensorProperties: {
        type: "object",
        properties: {
          rank: {
            type: "array",
            items: { type: "integer" },
            minItems: 2,
            maxItems: 2,
            description: "Tensor rank as [contravariant, covariant]"
          },
          components: { type: "string", description: "Tensor components" },
          latex: { type: "string", description: "LaTeX representation" },
          symmetries: {
            type: "array",
            items: { type: "string" },
            description: "Symmetry properties"
          },
          invariants: {
            type: "array",
            items: { type: "string" },
            description: "Invariant quantities"
          },
          transformation: {
            type: "string",
            enum: ["covariant", "contravariant", "mixed"],
            description: "Transformation type"
          }
        },
        required: ["rank", "components", "latex", "transformation"],
        additionalProperties: false,
        description: "Tensor properties for physics calculations"
      },
      physicalInterpretation: {
        type: "object",
        properties: {
          quantity: { type: "string", description: "Physical quantity being described" },
          units: { type: "string", description: "Units of the quantity" },
          conservationLaws: {
            type: "array",
            items: { type: "string" },
            description: "Conservation laws applicable"
          }
        },
        required: ["quantity", "units", "conservationLaws"],
        additionalProperties: false,
        description: "Physical interpretation of the model"
      }
    },
    required: [...baseThoughtRequired],
    additionalProperties: false
  }
} as const;

/**
 * deepthinking_temporal - Temporal reasoning
 */
export const deepthinking_temporal_schema = {
  name: "deepthinking_temporal",
  description: "Temporal: timelines, Allen intervals, event sequencing",
  inputSchema: {
    type: "object",
    properties: {
      ...baseThoughtProperties,
      mode: {
        type: "string",
        enum: ["temporal"],
        description: "Temporal reasoning mode"
      },
      timeline: {
        type: "object",
        properties: {
          start: { type: "string", description: "Timeline start point" },
          end: { type: "string", description: "Timeline end point" },
          unit: {
            type: "string",
            enum: ["milliseconds", "seconds", "minutes", "hours", "days", "months", "years"],
            description: "Time unit"
          },
          resolution: { type: "string", description: "Timeline resolution" }
        },
        required: ["start", "end", "unit"],
        additionalProperties: false,
        description: "Timeline definition"
      },
      events: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            type: {
              type: "string",
              enum: ["instant", "interval"]
            },
            timestamp: { type: "string" },
            duration: { type: "number" },
            description: { type: "string" }
          },
          required: ["id", "name", "type"],
          additionalProperties: false
        },
        description: "Events on the timeline"
      },
      temporalConstraints: {
        type: "array",
        items: {
          type: "object",
          properties: {
            event1: { type: "string" },
            relation: {
              type: "string",
              enum: ["before", "after", "during", "overlaps", "meets", "starts", "finishes", "equals"]
            },
            event2: { type: "string" }
          },
          required: ["event1", "relation", "event2"],
          additionalProperties: false
        },
        description: "Allen interval algebra constraints"
      },
      causalRelations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            from: { type: "string" },
            to: { type: "string" },
            type: {
              type: "string",
              enum: ["causes", "enables", "prevents", "precedes", "follows"]
            }
          },
          required: ["from", "to", "type"],
          additionalProperties: false
        },
        description: "Causal relationships between events"
      }
    },
    required: [...baseThoughtRequired],
    additionalProperties: false
  }
} as const;

/**
 * deepthinking_probabilistic - Bayesian and Evidential reasoning
 */
export const deepthinking_probabilistic_schema = {
  name: "deepthinking_probabilistic",
  description: "Probabilistic: Bayesian updates, Dempster-Shafer belief",
  inputSchema: {
    type: "object",
    properties: {
      ...baseThoughtProperties,
      mode: {
        type: "string",
        enum: ["bayesian", "evidential"],
        description: "Probabilistic reasoning mode"
      },
      priorProbability: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Prior probability before evidence"
      },
      likelihood: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Likelihood of evidence given hypothesis"
      },
      posteriorProbability: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Posterior probability after evidence"
      },
      evidence: {
        type: "array",
        items: { type: "string" },
        description: "Evidence considered"
      },
      hypotheses: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            description: { type: "string" },
            probability: { type: "number", minimum: 0, maximum: 1 }
          },
          required: ["id", "description"],
          additionalProperties: false
        },
        description: "Hypotheses under consideration"
      },
      frameOfDiscernment: {
        type: "array",
        items: { type: "string" },
        description: "Frame of discernment for Dempster-Shafer theory"
      },
      massFunction: {
        type: "object",
        additionalProperties: { type: "number", minimum: 0, maximum: 1 },
        description: "Mass function assignments"
      },
      beliefFunction: {
        type: "object",
        additionalProperties: { type: "number", minimum: 0, maximum: 1 },
        description: "Belief function values"
      },
      plausibilityFunction: {
        type: "object",
        additionalProperties: { type: "number", minimum: 0, maximum: 1 },
        description: "Plausibility function values"
      }
    },
    required: [...baseThoughtRequired],
    additionalProperties: false
  }
} as const;

/**
 * deepthinking_causal - Causal, Counterfactual, Abductive reasoning
 */
export const deepthinking_causal_schema = {
  name: "deepthinking_causal",
  description: "Causal: graphs, counterfactuals, abductive inference",
  inputSchema: {
    type: "object",
    properties: {
      ...baseThoughtProperties,
      mode: {
        type: "string",
        enum: ["causal", "counterfactual", "abductive"],
        description: "Causal reasoning mode"
      },
      nodes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" }
          },
          required: ["id", "name"],
          additionalProperties: false
        },
        description: "Nodes in the causal graph"
      },
      edges: {
        type: "array",
        items: {
          type: "object",
          properties: {
            from: { type: "string" },
            to: { type: "string" },
            strength: { type: "number", minimum: 0, maximum: 1 },
            type: { type: "string" }
          },
          required: ["from", "to"],
          additionalProperties: false
        },
        description: "Causal edges in the graph"
      },
      interventions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            node: { type: "string" },
            value: { type: "string" },
            effect: { type: "string" }
          },
          required: ["node"],
          additionalProperties: false
        },
        description: "Interventions applied to the causal graph"
      },
      counterfactual: {
        type: "object",
        properties: {
          actual: { type: "string" },
          hypothetical: { type: "string" },
          consequence: { type: "string" }
        },
        additionalProperties: false,
        description: "Counterfactual scenario"
      },
      observations: {
        type: "array",
        items: { type: "string" },
        description: "Observed phenomena for abductive reasoning"
      },
      explanations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            hypothesis: { type: "string" },
            plausibility: { type: "number", minimum: 0, maximum: 1 }
          },
          required: ["hypothesis"],
          additionalProperties: false
        },
        description: "Candidate explanations"
      }
    },
    required: [...baseThoughtRequired],
    additionalProperties: false
  }
} as const;

/**
 * deepthinking_strategic - Game Theory and Optimization
 */
export const deepthinking_strategic_schema = {
  name: "deepthinking_strategic",
  description: "Strategic: game theory, Nash equilibria, optimization",
  inputSchema: {
    type: "object",
    properties: {
      ...baseThoughtProperties,
      mode: {
        type: "string",
        enum: ["gametheory", "optimization"],
        description: "Strategic reasoning mode"
      },
      players: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            isRational: { type: "boolean", description: "Whether player is rational" },
            availableStrategies: {
              type: "array",
              items: { type: "string" },
              description: "Strategy IDs available to this player"
            },
            role: { type: "string", description: "Player's role in the game" }
          },
          required: ["id", "name", "isRational", "availableStrategies"],
          additionalProperties: false
        },
        description: "Players in the game"
      },
      strategies: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            playerId: { type: "string", description: "ID of the player using this strategy" },
            name: { type: "string", description: "Strategy name" },
            description: { type: "string", description: "Strategy description" },
            isPure: { type: "boolean", description: "Whether this is a pure strategy" },
            probability: { type: "number", minimum: 0, maximum: 1, description: "Probability for mixed strategies" }
          },
          required: ["id", "playerId", "name", "description", "isPure"],
          additionalProperties: false
        },
        description: "Available strategies"
      },
      payoffMatrix: {
        type: "object",
        properties: {
          players: {
            type: "array",
            items: { type: "string" },
            description: "Player IDs in the matrix"
          },
          dimensions: {
            type: "array",
            items: { type: "number" },
            description: "Dimensions of the payoff matrix"
          },
          payoffs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                strategyProfile: {
                  type: "array",
                  items: { type: "string" },
                  description: "Strategy IDs for this profile"
                },
                payoffs: {
                  type: "array",
                  items: { type: "number" },
                  description: "Payoff values for each player"
                }
              },
              required: ["strategyProfile", "payoffs"],
              additionalProperties: false
            },
            description: "Payoff entries"
          }
        },
        required: ["players", "dimensions", "payoffs"],
        additionalProperties: false,
        description: "Payoff matrix for the game"
      },
      objectiveFunction: {
        type: "string",
        description: "Function to optimize"
      },
      constraints: {
        type: "array",
        items: { type: "string" },
        description: "Optimization constraints"
      },
      optimizationMethod: {
        type: "string",
        description: "Method used for optimization"
      },
      solution: {
        type: "object",
        properties: {
          value: { type: "string" },
          variables: {
            type: "object",
            additionalProperties: { type: "number" }
          }
        },
        additionalProperties: false,
        description: "Optimization solution"
      }
    },
    required: [...baseThoughtRequired],
    additionalProperties: false
  }
} as const;

/**
 * deepthinking_analytical - Analogical and First Principles reasoning
 */
export const deepthinking_analytical_schema = {
  name: "deepthinking_analytical",
  description: "Analytical: analogical mapping, first principles",
  inputSchema: {
    type: "object",
    properties: {
      ...baseThoughtProperties,
      mode: {
        type: "string",
        enum: ["analogical", "firstprinciples"],
        description: "Analytical reasoning mode"
      },
      sourceAnalogy: {
        type: "object",
        properties: {
          domain: { type: "string" },
          elements: {
            type: "array",
            items: { type: "string" }
          },
          relations: {
            type: "array",
            items: { type: "string" }
          }
        },
        additionalProperties: false,
        description: "Source domain for analogy"
      },
      targetAnalogy: {
        type: "object",
        properties: {
          domain: { type: "string" },
          elements: {
            type: "array",
            items: { type: "string" }
          },
          relations: {
            type: "array",
            items: { type: "string" }
          }
        },
        additionalProperties: false,
        description: "Target domain for analogy"
      },
      mappings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            source: { type: "string" },
            target: { type: "string" },
            confidence: { type: "number", minimum: 0, maximum: 1 }
          },
          required: ["source", "target"],
          additionalProperties: false
        },
        description: "Mappings between domains"
      },
      fundamentals: {
        type: "array",
        items: { type: "string" },
        description: "Fundamental truths or axioms"
      },
      derivedInsights: {
        type: "array",
        items: { type: "string" },
        description: "Insights derived from first principles"
      }
    },
    required: [...baseThoughtRequired],
    additionalProperties: false
  }
} as const;

/**
 * deepthinking_scientific - Scientific Method, Systems Thinking, Formal Logic
 */
export const deepthinking_scientific_schema = {
  name: "deepthinking_scientific",
  description: "Scientific: hypothesis testing, systems thinking, formal logic",
  inputSchema: {
    type: "object",
    properties: {
      ...baseThoughtProperties,
      mode: {
        type: "string",
        enum: ["scientificmethod", "systemsthinking", "formallogic"],
        description: "Scientific reasoning mode"
      },
      hypothesis: {
        type: "string",
        description: "Scientific hypothesis"
      },
      predictions: {
        type: "array",
        items: { type: "string" },
        description: "Testable predictions"
      },
      experiments: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            description: { type: "string" },
            result: { type: "string" }
          },
          required: ["id", "description"],
          additionalProperties: false
        },
        description: "Experiments conducted"
      },
      systemComponents: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            role: { type: "string" }
          },
          required: ["id", "name"],
          additionalProperties: false
        },
        description: "Components of the system"
      },
      interactions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            from: { type: "string" },
            to: { type: "string" },
            type: { type: "string" }
          },
          required: ["from", "to", "type"],
          additionalProperties: false
        },
        description: "Interactions between components"
      },
      feedbackLoops: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["positive", "negative", "neutral"]
            },
            components: {
              type: "array",
              items: { type: "string" }
            }
          },
          additionalProperties: false
        },
        description: "Feedback loops in the system"
      },
      premises: {
        type: "array",
        items: { type: "string" },
        description: "Logical premises"
      },
      conclusion: {
        type: "string",
        description: "Logical conclusion"
      },
      inference: {
        type: "string",
        description: "Type of logical inference used"
      }
    },
    required: [...baseThoughtRequired],
    additionalProperties: false
  }
} as const;

/**
 * deepthinking_session - Session management actions
 */
export const deepthinking_session_schema = {
  name: "deepthinking_session",
  description: "Session: summarize, export, get, switch_mode, recommend",
  inputSchema: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "Session ID (required for most actions except recommend_mode)"
      },
      action: {
        type: "string",
        enum: ["summarize", "export", "get_session", "switch_mode", "recommend_mode"],
        description: "Session action to perform"
      },
      exportFormat: {
        type: "string",
        enum: ["markdown", "latex", "json", "html", "jupyter", "mermaid", "dot", "ascii"],
        description: "Export format (for export action)"
      },
      newMode: {
        type: "string",
        description: "New thinking mode (for switch_mode action)"
      },
      problemType: {
        type: "string",
        description: "Quick problem type for mode recommendation"
      },
      problemCharacteristics: {
        type: "object",
        properties: {
          domain: { type: "string", description: "Problem domain" },
          complexity: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Problem complexity level"
          },
          uncertainty: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Uncertainty level"
          },
          timeDependent: { type: "boolean", description: "Whether problem involves time" },
          multiAgent: { type: "boolean", description: "Whether problem involves multiple agents" },
          requiresProof: { type: "boolean", description: "Whether formal proof is needed" },
          requiresQuantification: { type: "boolean", description: "Whether quantitative analysis is needed" },
          hasIncompleteInfo: { type: "boolean", description: "Whether information is incomplete" },
          requiresExplanation: { type: "boolean", description: "Whether explanation is needed" },
          hasAlternatives: { type: "boolean", description: "Whether alternative scenarios exist" }
        },
        required: ["domain", "complexity", "uncertainty", "timeDependent", "multiAgent", "requiresProof", "requiresQuantification", "hasIncompleteInfo", "requiresExplanation", "hasAlternatives"],
        additionalProperties: false,
        description: "Detailed problem characteristics for comprehensive recommendation"
      },
      includeCombinations: {
        type: "boolean",
        description: "Include mode combinations in recommendations"
      }
    },
    required: ["action"],
    additionalProperties: false
  }
} as const;

/**
 * All tool schemas as array
 */
export const jsonSchemas = [
  deepthinking_core_schema,
  deepthinking_math_schema,
  deepthinking_temporal_schema,
  deepthinking_probabilistic_schema,
  deepthinking_causal_schema,
  deepthinking_strategic_schema,
  deepthinking_analytical_schema,
  deepthinking_scientific_schema,
  deepthinking_session_schema,
] as const;
