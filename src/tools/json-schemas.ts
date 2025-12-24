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
 * deepthinking_core - Fundamental reasoning modes
 */
export const deepthinking_core_schema = {
  name: "deepthinking_core",
  description: "Core reasoning: inductive, deductive, abductive",
  inputSchema: {
    type: "object",
    properties: {
      ...baseThoughtProperties,
      mode: {
        type: "string",
        enum: ["inductive", "deductive", "abductive"],
        description: "Core reasoning mode"
      },
      // Inductive properties
      observations: {
        type: "array",
        items: { type: "string" },
        description: "Specific cases observed (inductive/abductive)"
      },
      pattern: {
        type: "string",
        description: "Identified pattern (inductive)"
      },
      generalization: {
        type: "string",
        description: "General principle formed (inductive)"
      },
      confidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Strength of inference (inductive)"
      },
      counterexamples: {
        type: "array",
        items: { type: "string" },
        description: "Known exceptions (inductive)"
      },
      sampleSize: {
        type: "integer",
        minimum: 1,
        description: "Number of observations (inductive)"
      },
      // Deductive properties
      premises: {
        type: "array",
        items: { type: "string" },
        description: "General principles (deductive)"
      },
      conclusion: {
        type: "string",
        description: "Specific conclusion (deductive)"
      },
      logicForm: {
        type: "string",
        description: "Logic form: modus ponens, modus tollens, etc. (deductive)"
      },
      validityCheck: {
        type: "boolean",
        description: "Is the deduction logically valid? (deductive)"
      },
      soundnessCheck: {
        type: "boolean",
        description: "Are the premises true? (deductive)"
      },
      // Abductive properties
      hypotheses: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            explanation: { type: "string" },
            score: { type: "number" }
          },
          required: ["id", "explanation"],
          additionalProperties: false
        },
        description: "Candidate explanations (abductive)"
      },
      bestExplanation: {
        type: "object",
        properties: {
          id: { type: "string" },
          explanation: { type: "string" },
          score: { type: "number" }
        },
        required: ["id", "explanation"],
        additionalProperties: false,
        description: "Best explanation chosen (abductive)"
      }
    },
    required: [...baseThoughtRequired],
    additionalProperties: false
  }
} as const;

/**
 * deepthinking_standard - Sequential, Shannon, Hybrid modes
 */
export const deepthinking_standard_schema = {
  name: "deepthinking_standard",
  description: "Standard workflows: sequential, shannon (5-stage), hybrid",
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
 * deepthinking_mathematics - Mathematics, Physics, and Computability modes
 * Phase 8: Added proof decomposition fields
 * Phase 14: Added computability mode
 */
export const deepthinking_mathematics_schema = {
  name: "deepthinking_mathematics",
  description: "Math/physics/computability: proofs, Turing machines, decidability, tensors, LaTeX, conservation laws",
  inputSchema: {
    type: "object",
    properties: {
      ...baseThoughtProperties,
      mode: {
        type: "string",
        enum: ["mathematics", "physics", "computability"],
        description: "Mathematical reasoning mode"
      },
      thoughtType: {
        type: "string",
        description: "Specific thought type for mathematics mode. Use 'proof_decomposition', 'dependency_analysis', 'consistency_check', 'gap_identification', or 'assumption_trace' for proof analysis."
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
      },
      // Phase 8: Proof decomposition fields
      proofSteps: {
        type: "array",
        description: "Structured proof steps for decomposition analysis",
        items: {
          type: "object",
          properties: {
            stepNumber: { type: "integer", minimum: 1, description: "Step number in the proof" },
            statement: { type: "string", description: "The statement being made" },
            justification: { type: "string", description: "Justification for this step" },
            latex: { type: "string", description: "LaTeX representation of the statement" },
            referencesSteps: {
              type: "array",
              items: { type: "integer" },
              description: "Step numbers this step references"
            }
          },
          required: ["stepNumber", "statement"],
          additionalProperties: false
        }
      },
      theorem: {
        type: "string",
        description: "The theorem being proved (for proof decomposition)"
      },
      hypotheses: {
        type: "array",
        items: { type: "string" },
        description: "Starting hypotheses for the proof"
      },
      analysisDepth: {
        type: "string",
        enum: ["shallow", "standard", "deep"],
        description: "Depth of proof analysis"
      },
      includeConsistencyCheck: {
        type: "boolean",
        description: "Whether to run inconsistency detection"
      },
      traceAssumptions: {
        type: "boolean",
        description: "Whether to include assumption chain analysis"
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
          id: { type: "string", description: "Timeline ID" },
          name: { type: "string", description: "Timeline name" },
          timeUnit: {
            type: "string",
            enum: ["milliseconds", "seconds", "minutes", "hours", "days", "months", "years"],
            description: "Time unit"
          },
          events: {
            type: "array",
            items: { type: "string" },
            description: "Event IDs in this timeline"
          },
          startTime: { type: "number", description: "Timeline start time (optional)" },
          endTime: { type: "number", description: "Timeline end time (optional)" }
        },
        required: ["id", "name", "timeUnit", "events"],
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
            description: { type: "string" },
            timestamp: { type: "number", description: "Event timestamp as number" },
            type: {
              type: "string",
              enum: ["instant", "interval"],
              description: "Event type"
            },
            duration: { type: "number", description: "Event duration (optional)" },
            properties: {
              type: "object",
              additionalProperties: true,
              description: "Additional event properties"
            }
          },
          required: ["id", "name", "description", "timestamp", "type"],
          additionalProperties: false
        },
        description: "Temporal events"
      },
      constraints: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: {
              type: "string",
              enum: ["before", "after", "during", "simultaneous"],
              description: "Constraint type"
            },
            subject: { type: "string", description: "Subject event ID" },
            object: { type: "string", description: "Object event ID" },
            confidence: { type: "number", minimum: 0, maximum: 1, description: "Confidence in constraint" }
          },
          required: ["id", "type", "subject", "object", "confidence"],
          additionalProperties: false
        },
        description: "Temporal constraints"
      },
      intervals: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            start: { type: "number", description: "Interval start" },
            end: { type: "number", description: "Interval end" },
            contains: {
              type: "array",
              items: { type: "string" },
              description: "Event IDs contained in this interval"
            },
            overlaps: {
              type: "array",
              items: { type: "string" },
              description: "Interval IDs that overlap"
            }
          },
          required: ["id", "name", "start", "end"],
          additionalProperties: false
        },
        description: "Temporal intervals"
      },
      relations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            from: { type: "string", description: "Source event ID" },
            to: { type: "string", description: "Target event ID" },
            relationType: {
              type: "string",
              enum: ["before", "after", "during", "overlaps", "meets", "starts", "finishes", "equals", "causes"],
              description: "Relation type (Allen's interval algebra)"
            },
            strength: { type: "number", minimum: 0, maximum: 1, description: "Relation strength" },
            delay: { type: "number", description: "Temporal delay (optional)" }
          },
          required: ["id", "from", "to", "relationType", "strength"],
          additionalProperties: false
        },
        description: "Temporal relations between events"
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
 * deepthinking_causal - Causal and Counterfactual reasoning
 */
export const deepthinking_causal_schema = {
  name: "deepthinking_causal",
  description: "Causal: graphs, counterfactuals (abductive moved to core)",
  inputSchema: {
    type: "object",
    properties: {
      ...baseThoughtProperties,
      mode: {
        type: "string",
        enum: ["causal", "counterfactual"],
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
 * deepthinking_analytical - Analogical, First Principles, Meta-Reasoning, and Cryptanalytic
 * Phase 14: Added cryptanalytic mode
 */
export const deepthinking_analytical_schema = {
  name: "deepthinking_analytical",
  description: "Analytical: analogical mapping, first principles, meta-reasoning, cryptanalytic (decibans)",
  inputSchema: {
    type: "object",
    properties: {
      ...baseThoughtProperties,
      mode: {
        type: "string",
        enum: ["analogical", "firstprinciples", "metareasoning", "cryptanalytic"],
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
 * deepthinking_engineering - Engineering and Algorithmic modes
 * Phase 14: New tool for engineering-focused reasoning
 */
export const deepthinking_engineering_schema = {
  name: "deepthinking_engineering",
  description: "Engineering: requirements, trade studies, FMEA, ADRs, algorithm design (CLRS)",
  inputSchema: {
    type: "object",
    properties: {
      ...baseThoughtProperties,
      mode: {
        type: "string",
        enum: ["engineering", "algorithmic"],
        description: "Engineering reasoning mode"
      },
      // Engineering-specific properties
      requirementId: {
        type: "string",
        description: "Requirement ID being analyzed"
      },
      tradeStudy: {
        type: "object",
        properties: {
          options: {
            type: "array",
            items: { type: "string" },
            description: "Options being compared"
          },
          criteria: {
            type: "array",
            items: { type: "string" },
            description: "Evaluation criteria"
          },
          weights: {
            type: "object",
            additionalProperties: { type: "number" },
            description: "Criteria weights"
          }
        },
        additionalProperties: false,
        description: "Trade study configuration"
      },
      fmeaEntry: {
        type: "object",
        properties: {
          failureMode: { type: "string" },
          severity: { type: "integer", minimum: 1, maximum: 10 },
          occurrence: { type: "integer", minimum: 1, maximum: 10 },
          detection: { type: "integer", minimum: 1, maximum: 10 },
          rpn: { type: "integer", description: "Risk Priority Number = S * O * D" }
        },
        additionalProperties: false,
        description: "FMEA analysis entry"
      },
      // Algorithmic-specific properties
      algorithmName: {
        type: "string",
        description: "Name of the algorithm being analyzed"
      },
      designPattern: {
        type: "string",
        enum: ["divide-and-conquer", "dynamic-programming", "greedy", "backtracking", "branch-and-bound", "randomized", "approximation"],
        description: "Algorithm design pattern"
      },
      complexityAnalysis: {
        type: "object",
        properties: {
          timeComplexity: { type: "string", description: "Time complexity (e.g., O(n log n))" },
          spaceComplexity: { type: "string", description: "Space complexity (e.g., O(n))" },
          bestCase: { type: "string" },
          averageCase: { type: "string" },
          worstCase: { type: "string" }
        },
        additionalProperties: false,
        description: "Complexity analysis"
      },
      correctnessProof: {
        type: "object",
        properties: {
          invariant: { type: "string", description: "Loop invariant" },
          termination: { type: "string", description: "Termination argument" },
          correctness: { type: "string", description: "Correctness proof" }
        },
        additionalProperties: false,
        description: "Algorithm correctness proof"
      }
    },
    required: [...baseThoughtRequired],
    additionalProperties: false
  }
} as const;

/**
 * deepthinking_academic - Academic Research modes
 * Phase 14: New tool for academic research reasoning
 * Designed for PhD students and scientific paper writing
 */
export const deepthinking_academic_schema = {
  name: "deepthinking_academic",
  description: "Academic: synthesis (literature review), argumentation (Toulmin), critique (peer review), analysis (qualitative)",
  inputSchema: {
    type: "object",
    properties: {
      ...baseThoughtProperties,
      mode: {
        type: "string",
        enum: ["synthesis", "argumentation", "critique", "analysis"],
        description: "Academic research reasoning mode"
      },
      // Synthesis-specific properties
      sources: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string" },
            title: { type: "string" },
            authors: { type: "array", items: { type: "string" } },
            year: { type: "integer" },
            venue: { type: "string" },
            doi: { type: "string" },
            relevance: { type: "number", minimum: 0, maximum: 1 }
          },
          required: ["id", "title"]
        },
        description: "Literature sources being synthesized"
      },
      themes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            sourceIds: { type: "array", items: { type: "string" } },
            strength: { type: "number", minimum: 0, maximum: 1 },
            consensus: { type: "string", enum: ["strong", "moderate", "weak", "contested"] }
          },
          required: ["id", "name"]
        },
        description: "Identified themes across sources"
      },
      researchGaps: {
        type: "array",
        items: { type: "string" },
        description: "Identified gaps in the literature"
      },
      gaps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            description: { type: "string" },
            type: { type: "string", enum: ["empirical", "theoretical", "methodological", "population", "contextual"] },
            importance: { type: "string", enum: ["critical", "significant", "moderate", "minor"] }
          },
          required: ["id", "description"]
        },
        description: "Identified gaps in the literature (structured)"
      },
      // Argumentation-specific properties (Toulmin model)
      claims: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            statement: { type: "string" },
            type: { type: "string", enum: ["fact", "value", "policy", "definition", "cause"] },
            strength: { type: "string", enum: ["strong", "moderate", "tentative"] }
          },
          required: ["id", "statement"]
        },
        description: "Claims in the argument"
      },
      grounds: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string", enum: ["empirical", "statistical", "testimonial", "analogical", "logical", "textual"] },
            content: { type: "string" },
            source: { type: "string" },
            reliability: { type: "number", minimum: 0, maximum: 1 }
          },
          required: ["id", "content"]
        },
        description: "Grounds/evidence supporting claims"
      },
      warrants: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            statement: { type: "string" },
            type: { type: "string", enum: ["generalization", "analogy", "causal", "authority", "principle", "definition"] },
            groundsIds: { type: "array", items: { type: "string" } },
            claimId: { type: "string" }
          },
          required: ["id", "statement"]
        },
        description: "Warrants connecting grounds to claims"
      },
      rebuttals: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            objection: { type: "string" },
            type: { type: "string", enum: ["factual", "logical", "ethical", "practical", "definitional"] },
            strength: { type: "string", enum: ["strong", "moderate", "weak"] },
            response: { type: "string" }
          },
          required: ["id", "objection"]
        },
        description: "Potential rebuttals and counter-arguments"
      },
      argumentStrength: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Overall argument strength (0-1)"
      },
      // Critique-specific properties
      critiquedWork: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          authors: { type: "array", items: { type: "string" } },
          year: { type: "integer" },
          type: { type: "string" },
          field: { type: "string" }
        },
        required: ["title"],
        description: "Work being critiqued"
      },
      strengths: {
        type: "array",
        items: { type: "string" },
        description: "Identified strengths"
      },
      weaknesses: {
        type: "array",
        items: { type: "string" },
        description: "Identified weaknesses"
      },
      suggestions: {
        type: "array",
        items: { type: "string" },
        description: "Improvement suggestions"
      },
      // Analysis-specific properties
      analysisMethod: {
        type: "string",
        enum: ["thematic", "grounded-theory", "discourse", "content", "narrative", "phenomenological"],
        description: "Qualitative analysis method (simplified)"
      },
      methodology: {
        type: "string",
        enum: ["thematic_analysis", "grounded_theory", "discourse_analysis", "content_analysis", "phenomenological", "narrative_analysis", "framework_analysis", "template_analysis", "mixed_qualitative"],
        description: "Qualitative analysis methodology"
      },
      dataSources: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string" },
            description: { type: "string" },
            participantId: { type: "string" }
          },
          required: ["id", "type"]
        },
        description: "Data sources for analysis"
      },
      codes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            label: { type: "string" },
            definition: { type: "string" },
            type: { type: "string", enum: ["descriptive", "in_vivo", "process", "initial", "focused", "axial", "theoretical", "emotion", "value"] },
            frequency: { type: "integer" },
            examples: { type: "array", items: { type: "string" } }
          },
          required: ["id", "label"]
        },
        description: "Coding scheme for analysis"
      },
      memos: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string", enum: ["analytical", "theoretical", "methodological", "reflexive", "code", "operational"] },
            content: { type: "string" },
            relatedCodes: { type: "array", items: { type: "string" } }
          },
          required: ["id", "content"]
        },
        description: "Analytical memos"
      },
      categories: {
        type: "array",
        items: { type: "string" },
        description: "Categories derived from codes"
      },
      saturationReached: {
        type: "boolean",
        description: "Whether theoretical saturation has been reached"
      },
      keyInsight: {
        type: "string",
        description: "Key insight from the analysis"
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
  description: "Session: summarize, export, export_all, get, switch_mode, recommend, delete",
  inputSchema: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "Session ID (required for most actions except recommend_mode)"
      },
      action: {
        type: "string",
        enum: ["summarize", "export", "export_all", "get_session", "switch_mode", "recommend_mode", "delete_session"],
        description: "Session action to perform"
      },
      exportFormat: {
        type: "string",
        enum: ["markdown", "latex", "json", "html", "jupyter", "mermaid", "dot", "ascii"],
        description: "Export format (for export action)"
      },
      includeContent: {
        type: "boolean",
        description: "Include full export content in response (for export_all action)"
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
 * deepthinking_analyze - Multi-Mode Analysis Tool
 * Phase 12 Sprint 3: Combines multiple reasoning modes for comprehensive analysis
 */
export const deepthinking_analyze_schema = {
  name: "deepthinking_analyze",
  description: `Multi-mode reasoning analysis: combines insights from multiple thinking modes.

Executes 2-10 reasoning modes in parallel, merges insights using a specified strategy,
handles conflicts between perspectives, and produces a synthesized conclusion.

**Presets:**
- comprehensive_analysis: Thorough multi-perspective analysis (5 modes)
- hypothesis_testing: Evidence-based hypothesis evaluation (4 modes)
- decision_making: Strategic decision analysis (4 modes)
- root_cause: Causal analysis for problem diagnosis (4 modes)
- future_planning: Temporal and scenario analysis (4 modes)

**Merge Strategies:**
- union: Combine all insights, remove duplicates
- intersection: Only insights agreed upon by all modes
- weighted: Weight insights by mode confidence/importance
- hierarchical: Primary mode with supporting evidence
- dialectical: Thesis-antithesis-synthesis approach`,
  inputSchema: {
    type: "object",
    properties: {
      thought: {
        type: "string",
        description: "The thought, problem, or question to analyze using multiple reasoning modes",
        minLength: 1
      },
      preset: {
        type: "string",
        enum: ["comprehensive_analysis", "hypothesis_testing", "decision_making", "root_cause", "future_planning"],
        description: "Pre-defined mode combination preset"
      },
      customModes: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "sequential", "shannon", "mathematics", "physics", "hybrid",
            "inductive", "deductive", "abductive", "causal", "bayesian",
            "counterfactual", "temporal", "gametheory", "evidential",
            "analogical", "firstprinciples", "systemsthinking", "scientificmethod",
            "formallogic", "optimization", "engineering", "computability",
            "cryptanalytic", "algorithmic", "synthesis", "argumentation",
            "critique", "analysis", "metareasoning"
          ]
        },
        minItems: 2,
        maxItems: 10,
        description: "Custom selection of modes (overrides preset). Minimum 2, maximum 10 modes."
      },
      mergeStrategy: {
        type: "string",
        enum: ["union", "intersection", "weighted", "hierarchical", "dialectical"],
        default: "union",
        description: "Strategy for merging insights from different modes"
      },
      sessionId: {
        type: "string",
        description: "Optional session ID to associate analysis with"
      },
      context: {
        type: "string",
        description: "Additional context or background information for the analysis"
      },
      timeoutPerMode: {
        type: "integer",
        minimum: 1000,
        maximum: 120000,
        default: 30000,
        description: "Maximum time in milliseconds per mode (default: 30000)"
      }
    },
    required: ["thought"],
    additionalProperties: false
  }
} as const;

/**
 * All tool schemas as array (v8.4.0 - 13 tools)
 * Phase 12 Sprint 3: Added deepthinking_analyze
 * Phase 14: Added deepthinking_engineering and deepthinking_academic
 */
export const jsonSchemas = [
  deepthinking_core_schema,
  deepthinking_standard_schema,
  deepthinking_mathematics_schema,
  deepthinking_temporal_schema,
  deepthinking_probabilistic_schema,
  deepthinking_causal_schema,
  deepthinking_strategic_schema,
  deepthinking_analytical_schema,
  deepthinking_scientific_schema,
  deepthinking_engineering_schema,
  deepthinking_academic_schema,
  deepthinking_session_schema,
  deepthinking_analyze_schema,
] as const;
