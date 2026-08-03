/**
 * Legacy thinking tool for DeepThinking MCP v4.4.0
 * DEPRECATED: Use focused tools (deepthinking_*) instead
 *
 * This file provides backward compatibility only.
 * Zod schema kept for runtime validation. JSON schema is hand-written.
 */

import { z } from "zod";
import { MAX_LENGTHS } from "../utils/sanitization.js";
import { boundedRecord } from "./schemas/shared.js";

/**
 * Zod schema for runtime validation (internal use)
 */
export const ThinkingToolSchema = z.object({
  sessionId: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
  mode: z
    .enum([
      "sequential",
      "shannon",
      "mathematics",
      "physics",
      "hybrid",
      "inductive",
      "deductive",
      "abductive",
      "causal",
      "bayesian",
      "counterfactual",
      "analogical",
      "temporal",
      "gametheory",
      "evidential",
      "firstprinciples",
      "systemsthinking",
      "scientificmethod",
      "optimization",
      "formallogic",
    ])
    .default("hybrid"),
  thought: z.string().max(MAX_LENGTHS.THOUGHT_CONTENT),
  thoughtNumber: z.number().int().positive(),
  totalThoughts: z.number().int().positive(),
  nextThoughtNeeded: z.boolean(),
  isRevision: z.boolean().optional(),
  revisesThought: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
  revisionReason: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
  branchFrom: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
  branchId: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
  stage: z
    .enum([
      "problem_definition",
      "constraints",
      "model",
      "proof",
      "implementation",
    ])
    .optional(),
  uncertainty: z.number().min(0).max(1).optional(),
  dependencies: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
  assumptions: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
  thoughtType: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
  mathematicalModel: z
    .object({
      latex: z.string().max(MAX_LENGTHS.DESCRIPTION),
      symbolic: z.string().max(MAX_LENGTHS.DESCRIPTION),
      ascii: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
    })
    .optional(),
  proofStrategy: z
    .object({
      type: z.enum([
        "direct",
        "contradiction",
        "induction",
        "construction",
        "contrapositive",
      ]),
      steps: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
    })
    .optional(),
  tensorProperties: z
    .object({
      rank: z.tuple([z.number(), z.number()]),
      components: z.string().max(MAX_LENGTHS.DESCRIPTION),
      latex: z.string().max(MAX_LENGTHS.DESCRIPTION),
      symmetries: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      invariants: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      transformation: z.enum(["covariant", "contravariant", "mixed"]),
    })
    .optional(),
  physicalInterpretation: z
    .object({
      quantity: z.string().max(MAX_LENGTHS.DESCRIPTION),
      units: z.string().max(MAX_LENGTHS.DESCRIPTION),
      conservationLaws: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
    })
    .optional(),
  // Inductive reasoning properties (Phase 5, v5.0.0)
  pattern: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
  generalization: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
  confidence: z.number().min(0).max(1).optional(),
  counterexamples: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
  sampleSize: z.number().int().min(1).optional(),
  // Deductive reasoning properties (Phase 5, v5.0.0)
  premises: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
  logicForm: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
  validityCheck: z.boolean().optional(),
  soundnessCheck: z.boolean().optional(),
  // Abductive reasoning properties (v2.0)
  observations: z
    .union([
      z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS), // For inductive reasoning - simple strings
      z.array(
        z.object({
          // For abductive reasoning - structured objects
          id: z.string().max(MAX_LENGTHS.DESCRIPTION),
          description: z.string().max(MAX_LENGTHS.DESCRIPTION),
          confidence: z.number().min(0).max(1),
        }),
      ).max(MAX_LENGTHS.ARRAY_ITEMS),
    ])
    .optional(),
  hypotheses: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        // Abductive fields
        explanation: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
        assumptions: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
        predictions: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
        score: z.number().optional(),
        // Evidential fields
        name: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
        description: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
        mutuallyExclusive: z.boolean().optional(),
        subsets: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  evaluationCriteria: z
    .object({
      parsimony: z.number(),
      explanatoryPower: z.number(),
      plausibility: z.number(),
      testability: z.boolean(),
    })
    .optional(),
  evidence: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        description: z.string().max(MAX_LENGTHS.DESCRIPTION),
        // Abductive fields
        hypothesisId: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
        type: z.enum(["supporting", "contradicting", "neutral"]).optional(),
        strength: z.number().min(0).max(1).optional(),
        // Evidential fields
        source: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
        reliability: z.number().min(0).max(1).optional(),
        timestamp: z.number().optional(),
        supports: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
        contradicts: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  bestExplanation: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      explanation: z.string().max(MAX_LENGTHS.DESCRIPTION),
      assumptions: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      predictions: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      score: z.number(),
    })
    .optional(),
  // Causal reasoning properties (v2.0)
  causalGraph: z
    .object({
      nodes: z.array(
        z.object({
          id: z.string().max(MAX_LENGTHS.DESCRIPTION),
          name: z.string().max(MAX_LENGTHS.DESCRIPTION),
          type: z.enum(["cause", "effect", "mediator", "confounder"]),
          description: z.string().max(MAX_LENGTHS.DESCRIPTION),
        }),
      ).max(MAX_LENGTHS.ARRAY_ITEMS),
      edges: z.array(
        z.object({
          from: z.string().max(MAX_LENGTHS.DESCRIPTION),
          to: z.string().max(MAX_LENGTHS.DESCRIPTION),
          strength: z.number(),
          confidence: z.number().min(0).max(1),
        }),
      ).max(MAX_LENGTHS.ARRAY_ITEMS),
    })
    .optional(),
  interventions: z
    .array(
      z.object({
        nodeId: z.string().max(MAX_LENGTHS.DESCRIPTION),
        action: z.string().max(MAX_LENGTHS.DESCRIPTION),
        expectedEffects: z.array(
          z.object({
            nodeId: z.string().max(MAX_LENGTHS.DESCRIPTION),
            expectedChange: z.string().max(MAX_LENGTHS.DESCRIPTION),
            confidence: z.number(),
          }),
        ).max(MAX_LENGTHS.ARRAY_ITEMS),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  mechanisms: z
    .array(
      z.object({
        from: z.string().max(MAX_LENGTHS.DESCRIPTION),
        to: z.string().max(MAX_LENGTHS.DESCRIPTION),
        description: z.string().max(MAX_LENGTHS.DESCRIPTION),
        type: z.enum(["direct", "indirect", "feedback"]),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  confounders: z
    .array(
      z.object({
        nodeId: z.string().max(MAX_LENGTHS.DESCRIPTION),
        affects: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
        description: z.string().max(MAX_LENGTHS.DESCRIPTION),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  // Bayesian reasoning properties (v2.0)
  hypothesis: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      statement: z.string().max(MAX_LENGTHS.DESCRIPTION),
    })
    .optional(),
  prior: z
    .object({
      probability: z.number().min(0).max(1),
      justification: z.string().max(MAX_LENGTHS.DESCRIPTION),
    })
    .optional(),
  likelihood: z
    .object({
      probability: z.number().min(0).max(1),
      description: z.string().max(MAX_LENGTHS.DESCRIPTION),
    })
    .optional(),
  posterior: z
    .object({
      probability: z.number().min(0).max(1),
      calculation: z.string().max(MAX_LENGTHS.DESCRIPTION),
    })
    .optional(),
  bayesFactor: z.number().optional(),
  // Counterfactual reasoning properties (v2.0)
  actual: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      name: z.string().max(MAX_LENGTHS.DESCRIPTION),
      description: z.string().max(MAX_LENGTHS.DESCRIPTION),
      conditions: z.array(
        z.object({
          factor: z.string().max(MAX_LENGTHS.DESCRIPTION),
          value: z.string().max(MAX_LENGTHS.DESCRIPTION),
        }),
      ).max(MAX_LENGTHS.ARRAY_ITEMS),
      outcomes: z.array(
        z.object({
          description: z.string().max(MAX_LENGTHS.DESCRIPTION),
          impact: z.enum(["positive", "negative", "neutral"]),
          magnitude: z.number().optional(),
        }),
      ).max(MAX_LENGTHS.ARRAY_ITEMS),
    })
    .optional(),
  counterfactuals: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        name: z.string().max(MAX_LENGTHS.DESCRIPTION),
        description: z.string().max(MAX_LENGTHS.DESCRIPTION),
        conditions: z.array(
          z.object({
            factor: z.string().max(MAX_LENGTHS.DESCRIPTION),
            value: z.string().max(MAX_LENGTHS.DESCRIPTION),
          }),
        ).max(MAX_LENGTHS.ARRAY_ITEMS),
        outcomes: z.array(
          z.object({
            description: z.string().max(MAX_LENGTHS.DESCRIPTION),
            impact: z.enum(["positive", "negative", "neutral"]),
            magnitude: z.number().optional(),
          }),
        ).max(MAX_LENGTHS.ARRAY_ITEMS),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  comparison: z
    .object({
      differences: z.array(
        z.object({
          aspect: z.string().max(MAX_LENGTHS.DESCRIPTION),
          actual: z.string().max(MAX_LENGTHS.DESCRIPTION),
          counterfactual: z.string().max(MAX_LENGTHS.DESCRIPTION),
          significance: z.enum(["high", "medium", "low"]),
        }),
      ).max(MAX_LENGTHS.ARRAY_ITEMS),
      insights: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      lessons: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
    })
    .optional(),
  interventionPoint: z
    .object({
      description: z.string().max(MAX_LENGTHS.DESCRIPTION),
      alternatives: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
    })
    .optional(),
  causalChains: z
    .array(
      z.object({
        intervention: z.string().max(MAX_LENGTHS.DESCRIPTION),
        steps: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
        finalOutcome: z.string().max(MAX_LENGTHS.DESCRIPTION),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  // Analogical reasoning properties (v2.0)
  sourceDomain: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      name: z.string().max(MAX_LENGTHS.DESCRIPTION),
      description: z.string().max(MAX_LENGTHS.DESCRIPTION),
      entities: z.array(
        z.object({
          id: z.string().max(MAX_LENGTHS.DESCRIPTION),
          name: z.string().max(MAX_LENGTHS.DESCRIPTION),
          type: z.string().max(MAX_LENGTHS.DESCRIPTION),
        }),
      ).max(MAX_LENGTHS.ARRAY_ITEMS),
      relations: z.array(
        z.object({
          id: z.string().max(MAX_LENGTHS.DESCRIPTION),
          type: z.string().max(MAX_LENGTHS.DESCRIPTION),
          from: z.string().max(MAX_LENGTHS.DESCRIPTION),
          to: z.string().max(MAX_LENGTHS.DESCRIPTION),
        }),
      ).max(MAX_LENGTHS.ARRAY_ITEMS),
    })
    .optional(),
  targetDomain: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      name: z.string().max(MAX_LENGTHS.DESCRIPTION),
      description: z.string().max(MAX_LENGTHS.DESCRIPTION),
      entities: z.array(
        z.object({
          id: z.string().max(MAX_LENGTHS.DESCRIPTION),
          name: z.string().max(MAX_LENGTHS.DESCRIPTION),
          type: z.string().max(MAX_LENGTHS.DESCRIPTION),
        }),
      ).max(MAX_LENGTHS.ARRAY_ITEMS),
      relations: z.array(
        z.object({
          id: z.string().max(MAX_LENGTHS.DESCRIPTION),
          type: z.string().max(MAX_LENGTHS.DESCRIPTION),
          from: z.string().max(MAX_LENGTHS.DESCRIPTION),
          to: z.string().max(MAX_LENGTHS.DESCRIPTION),
        }),
      ).max(MAX_LENGTHS.ARRAY_ITEMS),
    })
    .optional(),
  mapping: z
    .array(
      z.object({
        sourceEntityId: z.string().max(MAX_LENGTHS.DESCRIPTION),
        targetEntityId: z.string().max(MAX_LENGTHS.DESCRIPTION),
        justification: z.string().max(MAX_LENGTHS.DESCRIPTION),
        confidence: z.number().min(0).max(1),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  insights: z
    .array(
      z.object({
        description: z.string().max(MAX_LENGTHS.DESCRIPTION),
        sourceEvidence: z.string().max(MAX_LENGTHS.DESCRIPTION),
        targetApplication: z.string().max(MAX_LENGTHS.DESCRIPTION),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  inferences: z
    .array(
      z.object({
        sourcePattern: z.string().max(MAX_LENGTHS.DESCRIPTION),
        targetPrediction: z.string().max(MAX_LENGTHS.DESCRIPTION),
        confidence: z.number().min(0).max(1),
        needsVerification: z.boolean(),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  limitations: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
  analogyStrength: z.number().min(0).max(1).optional(),
  // Temporal reasoning properties (Phase 3, v2.1)
  timeline: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      name: z.string().max(MAX_LENGTHS.DESCRIPTION),
      timeUnit: z.enum([
        "milliseconds",
        "seconds",
        "minutes",
        "hours",
        "days",
        "months",
        "years",
      ]),
      startTime: z.number().optional(),
      endTime: z.number().optional(),
      events: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
    })
    .optional(),
  events: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        name: z.string().max(MAX_LENGTHS.DESCRIPTION),
        description: z.string().max(MAX_LENGTHS.DESCRIPTION),
        timestamp: z.number(),
        duration: z.number().optional(),
        type: z.enum(["instant", "interval"]),
        properties: boundedRecord(z.string().max(MAX_LENGTHS.DESCRIPTION), z.any()),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  intervals: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        name: z.string().max(MAX_LENGTHS.DESCRIPTION),
        start: z.number(),
        end: z.number(),
        overlaps: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
        contains: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  constraints: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        type: z.enum([
          "before",
          "after",
          "during",
          "overlaps",
          "meets",
          "starts",
          "finishes",
          "equals",
        ]),
        subject: z.string().max(MAX_LENGTHS.DESCRIPTION),
        object: z.string().max(MAX_LENGTHS.DESCRIPTION),
        confidence: z.number().min(0).max(1),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  relations: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        from: z.string().max(MAX_LENGTHS.DESCRIPTION),
        to: z.string().max(MAX_LENGTHS.DESCRIPTION),
        relationType: z.enum([
          "causes",
          "enables",
          "prevents",
          "precedes",
          "follows",
        ]),
        strength: z.number().min(0).max(1),
        delay: z.number().optional(),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  // Game theory properties (Phase 3, v2.2)
  game: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      name: z.string().max(MAX_LENGTHS.DESCRIPTION),
      description: z.string().max(MAX_LENGTHS.DESCRIPTION),
      type: z.enum([
        "normal_form",
        "extensive_form",
        "cooperative",
        "non_cooperative",
      ]),
      numPlayers: z.number().int().min(2),
      isZeroSum: z.boolean(),
      isPerfectInformation: z.boolean(),
    })
    .optional(),
  players: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        name: z.string().max(MAX_LENGTHS.DESCRIPTION),
        role: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
        isRational: z.boolean(),
        availableStrategies: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  strategies: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        playerId: z.string().max(MAX_LENGTHS.DESCRIPTION),
        name: z.string().max(MAX_LENGTHS.DESCRIPTION),
        description: z.string().max(MAX_LENGTHS.DESCRIPTION),
        isPure: z.boolean(),
        probability: z.number().min(0).max(1).optional(),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  payoffMatrix: z
    .object({
      players: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      dimensions: z.array(z.number()).max(MAX_LENGTHS.ARRAY_ITEMS),
      payoffs: z.array(
        z.object({
          strategyProfile: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
          payoffs: z.array(z.number()),
        }),
      ).max(MAX_LENGTHS.ARRAY_ITEMS),
    })
    .optional(),
  nashEquilibria: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        strategyProfile: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
        payoffs: z.array(z.number()).max(MAX_LENGTHS.ARRAY_ITEMS),
        type: z.enum(["pure", "mixed"]),
        isStrict: z.boolean(),
        stability: z.number().min(0).max(1),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  dominantStrategies: z
    .array(
      z.object({
        playerId: z.string().max(MAX_LENGTHS.DESCRIPTION),
        strategyId: z.string().max(MAX_LENGTHS.DESCRIPTION),
        type: z.enum(["strictly_dominant", "weakly_dominant"]),
        dominatesStrategies: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
        justification: z.string().max(MAX_LENGTHS.DESCRIPTION),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  gameTree: z
    .object({
      rootNode: z.string().max(MAX_LENGTHS.DESCRIPTION),
      nodes: z.array(
        z.object({
          id: z.string().max(MAX_LENGTHS.DESCRIPTION),
          type: z.enum(["decision", "chance", "terminal"]),
          playerId: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
          parentNode: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
          childNodes: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
          action: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
          probability: z.number().min(0).max(1).optional(),
          payoffs: z.array(z.number()).optional(),
        }),
      ).max(MAX_LENGTHS.ARRAY_ITEMS),
      informationSets: z
        .array(
          z.object({
            id: z.string().max(MAX_LENGTHS.DESCRIPTION),
            playerId: z.string().max(MAX_LENGTHS.DESCRIPTION),
            nodes: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
            availableActions: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
          }),
        ).max(MAX_LENGTHS.ARRAY_ITEMS)
        .optional(),
    })
    .optional(),

  // Evidential properties (Phase 3, v2.3)
  frameOfDiscernment: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
  beliefFunctions: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        source: z.string().max(MAX_LENGTHS.DESCRIPTION),
        massAssignments: z.array(
          z.object({
            hypothesisSet: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
            mass: z.number().min(0).max(1),
            justification: z.string().max(MAX_LENGTHS.DESCRIPTION),
          }),
        ).max(MAX_LENGTHS.ARRAY_ITEMS),
        conflictMass: z.number().optional(),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  combinedBelief: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      source: z.string().max(MAX_LENGTHS.DESCRIPTION),
      massAssignments: z.array(
        z.object({
          hypothesisSet: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
          mass: z.number().min(0).max(1),
          justification: z.string().max(MAX_LENGTHS.DESCRIPTION),
        }),
      ).max(MAX_LENGTHS.ARRAY_ITEMS),
      conflictMass: z.number().optional(),
    })
    .optional(),
  plausibility: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      assignments: z.array(
        z.object({
          hypothesisSet: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
          plausibility: z.number().min(0).max(1),
          belief: z.number().min(0).max(1),
          uncertaintyInterval: z.tuple([z.number(), z.number()]),
        }),
      ).max(MAX_LENGTHS.ARRAY_ITEMS),
    })
    .optional(),
  decisions: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        name: z.string().max(MAX_LENGTHS.DESCRIPTION),
        selectedHypothesis: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
        confidence: z.number().min(0).max(1),
        reasoning: z.string().max(MAX_LENGTHS.DESCRIPTION),
        alternatives: z.array(
          z.object({
            hypothesis: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
            expectedUtility: z.number(),
            risk: z.number(),
          }),
        ).max(MAX_LENGTHS.ARRAY_ITEMS),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  // First-Principles properties (Phase 3, v3.1.0)
  question: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
  principles: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        type: z.enum([
          "axiom",
          "definition",
          "observation",
          "logical_inference",
          "assumption",
        ]),
        statement: z.string().max(MAX_LENGTHS.DESCRIPTION),
        justification: z.string().max(MAX_LENGTHS.DESCRIPTION),
        dependsOn: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
        confidence: z.number().min(0).max(1).optional(),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  derivationSteps: z
    .array(
      z.object({
        stepNumber: z.number().int().positive(),
        principle: z.string().max(MAX_LENGTHS.DESCRIPTION),
        inference: z.string().max(MAX_LENGTHS.DESCRIPTION),
        logicalForm: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
        confidence: z.number().min(0).max(1),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  conclusion: z
    .union([
      z.string().max(MAX_LENGTHS.DESCRIPTION), // For deductive reasoning - simple conclusion
      z.object({
        // For first-principles reasoning - structured conclusion
        statement: z.string().max(MAX_LENGTHS.DESCRIPTION),
        derivationChain: z.array(z.number()).max(MAX_LENGTHS.ARRAY_ITEMS),
        certainty: z.number().min(0).max(1),
        limitations: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
      }),
    ])
    .optional(),
  alternativeInterpretations: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),

  // Systems Thinking properties (Phase 4, v3.2.0)
  system: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      name: z.string().max(MAX_LENGTHS.DESCRIPTION),
      description: z.string().max(MAX_LENGTHS.DESCRIPTION),
      boundary: z.string().max(MAX_LENGTHS.DESCRIPTION),
      purpose: z.string().max(MAX_LENGTHS.DESCRIPTION),
      timeHorizon: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
    })
    .optional(),
  components: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        name: z.string().max(MAX_LENGTHS.DESCRIPTION),
        type: z.enum(["stock", "flow", "variable", "parameter", "delay"]),
        description: z.string().max(MAX_LENGTHS.DESCRIPTION),
        unit: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
        initialValue: z.number().optional(),
        formula: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
        influencedBy: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  feedbackLoops: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        name: z.string().max(MAX_LENGTHS.DESCRIPTION),
        type: z.enum(["reinforcing", "balancing"]),
        description: z.string().max(MAX_LENGTHS.DESCRIPTION),
        components: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
        polarity: z.enum(["+", "-"]),
        strength: z.number().min(0).max(1),
        delay: z.number().optional(),
        dominance: z.enum(["early", "middle", "late"]).optional(),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  leveragePoints: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        name: z.string().max(MAX_LENGTHS.DESCRIPTION),
        location: z.string().max(MAX_LENGTHS.DESCRIPTION),
        description: z.string().max(MAX_LENGTHS.DESCRIPTION),
        effectiveness: z.number().min(0).max(1),
        difficulty: z.number().min(0).max(1),
        type: z.enum([
          "parameter",
          "feedback",
          "structure",
          "goal",
          "paradigm",
        ]),
        interventionExamples: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  behaviors: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        name: z.string().max(MAX_LENGTHS.DESCRIPTION),
        description: z.string().max(MAX_LENGTHS.DESCRIPTION),
        pattern: z.enum([
          "growth",
          "decline",
          "oscillation",
          "equilibrium",
          "chaos",
          "overshoot_collapse",
        ]),
        causes: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
        timeframe: z.string().max(MAX_LENGTHS.DESCRIPTION),
        unintendedConsequences: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),

  // Scientific Method properties (Phase 4, v3.2.0)
  researchQuestion: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      question: z.string().max(MAX_LENGTHS.DESCRIPTION),
      background: z.string().max(MAX_LENGTHS.DESCRIPTION),
      rationale: z.string().max(MAX_LENGTHS.DESCRIPTION),
      significance: z.string().max(MAX_LENGTHS.DESCRIPTION),
      variables: z.object({
        independent: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
        dependent: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
        control: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      }),
    })
    .optional(),
  scientificHypotheses: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        type: z.enum(["null", "alternative", "directional", "non_directional"]),
        statement: z.string().max(MAX_LENGTHS.DESCRIPTION),
        prediction: z.string().max(MAX_LENGTHS.DESCRIPTION),
        rationale: z.string().max(MAX_LENGTHS.DESCRIPTION),
        testable: z.boolean(),
        falsifiable: z.boolean(),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  experiment: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      type: z.enum([
        "experimental",
        "quasi_experimental",
        "observational",
        "correlational",
      ]),
      design: z.string().max(MAX_LENGTHS.DESCRIPTION),
      sampleSize: z.number().int().positive(),
      sampleSizeJustification: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
      randomization: z.boolean(),
      blinding: z.enum(["none", "single", "double", "triple"]).optional(),
      controls: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      procedure: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      materials: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
      duration: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
      ethicalConsiderations: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
    })
    .optional(),
  dataCollection: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      method: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      instruments: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      dataQuality: z.object({
        completeness: z.number().min(0).max(1),
        reliability: z.number().min(0).max(1),
        validity: z.number().min(0).max(1),
      }),
      limitations: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
    })
    .optional(),
  statisticalAnalysis: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      tests: z.array(
        z.object({
          id: z.string().max(MAX_LENGTHS.DESCRIPTION),
          name: z.string().max(MAX_LENGTHS.DESCRIPTION),
          hypothesisTested: z.string().max(MAX_LENGTHS.DESCRIPTION),
          testStatistic: z.number(),
          pValue: z.number().min(0).max(1),
          confidenceInterval: z.tuple([z.number(), z.number()]).optional(),
          alpha: z.number().min(0).max(1),
          result: z.enum(["reject_null", "fail_to_reject_null"]),
          interpretation: z.string().max(MAX_LENGTHS.DESCRIPTION),
        }),
      ).max(MAX_LENGTHS.ARRAY_ITEMS),
      summary: z.string().max(MAX_LENGTHS.DESCRIPTION),
      effectSize: z
        .object({
          type: z.string().max(MAX_LENGTHS.DESCRIPTION),
          value: z.number(),
          interpretation: z.string().max(MAX_LENGTHS.DESCRIPTION),
        })
        .optional(),
      powerAnalysis: z
        .object({
          power: z.number().min(0).max(1),
          alpha: z.number().min(0).max(1),
          interpretation: z.string().max(MAX_LENGTHS.DESCRIPTION),
        })
        .optional(),
    })
    .optional(),
  scientificConclusion: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      statement: z.string().max(MAX_LENGTHS.DESCRIPTION),
      supportedHypotheses: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      rejectedHypotheses: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      confidence: z.number().min(0).max(1),
      limitations: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      alternativeExplanations: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
      futureDirections: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      replicationConsiderations: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      practicalImplications: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
      theoreticalImplications: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
    })
    .optional(),

  // Optimization properties (Phase 4, v3.2.0)
  optimizationProblem: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      name: z.string().max(MAX_LENGTHS.DESCRIPTION),
      description: z.string().max(MAX_LENGTHS.DESCRIPTION),
      type: z.enum([
        "linear",
        "nonlinear",
        "integer",
        "mixed_integer",
        "constraint_satisfaction",
        "multi_objective",
      ]),
      approach: z
        .enum(["exact", "heuristic", "metaheuristic", "approximation"])
        .optional(),
      complexity: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
    })
    .optional(),
  decisionVariables: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        name: z.string().max(MAX_LENGTHS.DESCRIPTION),
        description: z.string().max(MAX_LENGTHS.DESCRIPTION),
        type: z.enum(["continuous", "integer", "binary", "categorical"]),
        unit: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
        semantics: z.string().max(MAX_LENGTHS.DESCRIPTION),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  optimizationConstraints: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        name: z.string().max(MAX_LENGTHS.DESCRIPTION),
        description: z.string().max(MAX_LENGTHS.DESCRIPTION),
        type: z.enum(["hard", "soft"]),
        formula: z.string().max(MAX_LENGTHS.DESCRIPTION),
        variables: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
        penalty: z.number().optional(),
        rationale: z.string().max(MAX_LENGTHS.DESCRIPTION),
        priority: z.number().optional(),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  objectives: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        name: z.string().max(MAX_LENGTHS.DESCRIPTION),
        description: z.string().max(MAX_LENGTHS.DESCRIPTION),
        type: z.enum(["minimize", "maximize"]),
        formula: z.string().max(MAX_LENGTHS.DESCRIPTION),
        variables: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
        weight: z.number().min(0).max(1).optional(),
        units: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
        idealValue: z.number().optional(),
        acceptableRange: z.tuple([z.number(), z.number()]).optional(),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  solution: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      type: z.enum([
        "optimal",
        "feasible",
        "infeasible",
        "unbounded",
        "approximate",
      ]),
      variableValues: boundedRecord(z.string().max(MAX_LENGTHS.DESCRIPTION), z.union([z.number(), z.string().max(MAX_LENGTHS.DESCRIPTION)])),
      objectiveValues: boundedRecord(z.string().max(MAX_LENGTHS.DESCRIPTION), z.number()),
      quality: z.number().min(0).max(1),
      computationTime: z.number().optional(),
      iterations: z.number().optional(),
      method: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
      guarantees: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
    })
    .optional(),
  sensitivityAnalysis: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      robustness: z.number().min(0).max(1),
      criticalConstraints: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      shadowPrices: boundedRecord(z.string().max(MAX_LENGTHS.DESCRIPTION), z.number()).optional(),
      recommendations: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
    })
    .optional(),

  // Formal Logic properties (Phase 4, v3.2.0)
  propositions: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        symbol: z.string().max(MAX_LENGTHS.DESCRIPTION),
        statement: z.string().max(MAX_LENGTHS.DESCRIPTION),
        truthValue: z.boolean().optional(),
        type: z.enum(["atomic", "compound"]),
        formula: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  logicalInferences: z
    .array(
      z.object({
        id: z.string().max(MAX_LENGTHS.DESCRIPTION),
        rule: z.enum([
          "modus_ponens",
          "modus_tollens",
          "hypothetical_syllogism",
          "disjunctive_syllogism",
          "conjunction",
          "simplification",
          "addition",
          "resolution",
          "contradiction",
          "excluded_middle",
        ]),
        premises: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
        conclusion: z.string().max(MAX_LENGTHS.DESCRIPTION),
        justification: z.string().max(MAX_LENGTHS.DESCRIPTION),
        valid: z.boolean(),
      }),
    ).max(MAX_LENGTHS.ARRAY_ITEMS)
    .optional(),
  logicalProof: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      theorem: z.string().max(MAX_LENGTHS.DESCRIPTION),
      technique: z.enum([
        "direct",
        "contradiction",
        "contrapositive",
        "cases",
        "induction",
        "natural_deduction",
        "resolution",
        "semantic_tableaux",
      ]),
      steps: z.array(
        z.object({
          stepNumber: z.number().int().positive(),
          statement: z.string().max(MAX_LENGTHS.DESCRIPTION),
          formula: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
          justification: z.string().max(MAX_LENGTHS.DESCRIPTION),
          rule: z
            .enum([
              "modus_ponens",
              "modus_tollens",
              "hypothetical_syllogism",
              "disjunctive_syllogism",
              "conjunction",
              "simplification",
              "addition",
              "resolution",
              "contradiction",
              "excluded_middle",
            ])
            .optional(),
          referencesSteps: z.array(z.number()).optional(),
          isAssumption: z.boolean().optional(),
          dischargesAssumption: z.number().optional(),
        }),
      ).max(MAX_LENGTHS.ARRAY_ITEMS),
      conclusion: z.string().max(MAX_LENGTHS.DESCRIPTION),
      valid: z.boolean(),
      completeness: z.number().min(0).max(1),
      assumptions: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS).optional(),
    })
    .optional(),
  truthTable: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      propositions: z.array(z.string().max(MAX_LENGTHS.DESCRIPTION)).max(MAX_LENGTHS.ARRAY_ITEMS),
      formula: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
      rows: z.array(
        z.object({
          rowNumber: z.number().int().positive(),
          assignments: boundedRecord(z.string().max(MAX_LENGTHS.DESCRIPTION), z.boolean()),
          result: z.boolean(),
        }),
      ).max(MAX_LENGTHS.ARRAY_ITEMS),
      isTautology: z.boolean(),
      isContradiction: z.boolean(),
      isContingent: z.boolean(),
    })
    .optional(),
  satisfiability: z
    .object({
      id: z.string().max(MAX_LENGTHS.DESCRIPTION),
      formula: z.string().max(MAX_LENGTHS.DESCRIPTION),
      satisfiable: z.boolean(),
      model: boundedRecord(z.string().max(MAX_LENGTHS.DESCRIPTION), z.boolean()).optional(),
      method: z.enum(["dpll", "cdcl", "resolution", "truth_table", "other"]),
      complexity: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
      explanation: z.string().max(MAX_LENGTHS.DESCRIPTION),
    })
    .optional(),

  action: z
    .enum([
      "add_thought",
      "summarize",
      "export",
      "export_all",
      "switch_mode",
      "get_session",
      "recommend_mode",
      "delete_session",
    ])
    .default("add_thought"),
  exportFormat: z
    .enum([
      "markdown",
      "latex",
      "json",
      "html",
      "jupyter",
      "mermaid",
      "dot",
      "ascii",
    ])
    .optional(),
  newMode: z
    .enum([
      "sequential",
      "shannon",
      "mathematics",
      "physics",
      "hybrid",
      "inductive",
      "deductive",
      "abductive",
      "causal",
      "bayesian",
      "counterfactual",
      "analogical",
      "temporal",
      "gametheory",
      "evidential",
      "firstprinciples",
      "systemsthinking",
      "scientificmethod",
      "optimization",
      "formallogic",
    ])
    .optional(),
  // Mode recommendation parameters (v2.4)
  problemType: z.string().max(MAX_LENGTHS.DESCRIPTION).optional(),
  problemCharacteristics: z
    .object({
      domain: z.string().max(MAX_LENGTHS.DESCRIPTION),
      complexity: z.enum(["low", "medium", "high"]),
      uncertainty: z.enum(["low", "medium", "high"]),
      timeDependent: z.boolean(),
      multiAgent: z.boolean(),
      requiresProof: z.boolean(),
      requiresQuantification: z.boolean(),
      hasIncompleteInfo: z.boolean(),
      requiresExplanation: z.boolean(),
      hasAlternatives: z.boolean(),
    })
    .optional(),
  includeCombinations: z.boolean().optional(),
});

export type ThinkingToolInput = z.infer<typeof ThinkingToolSchema>;

/**
 * Legacy tool definition - DEPRECATED
 *
 * Use the focused tools instead:
 * - deepthinking_core, deepthinking_mathematics, deepthinking_temporal
 * - deepthinking_probabilistic, deepthinking_causal, deepthinking_strategic
 * - deepthinking_analytical, deepthinking_scientific, deepthinking_session
 *
 * NOTE: This tool accepts a superset of all focused tool properties for backward compatibility.
 * The schema lists all possible properties but most are optional.
 */
export const thinkingTool = {
  name: "deepthinking",
  description:
    "[DEPRECATED] Use deepthinking_* tools instead. Legacy tool supporting 18 reasoning modes with auto-routing to focused tools.",
  inputSchema: {
    type: "object" as const,
    properties: {
      sessionId: { type: "string" },
      mode: {
        type: "string",
        enum: [
          "sequential",
          "shannon",
          "mathematics",
          "physics",
          "hybrid",
          "inductive",
          "deductive",
          "abductive",
          "causal",
          "bayesian",
          "counterfactual",
          "analogical",
          "temporal",
          "gametheory",
          "evidential",
          "firstprinciples",
          "systemsthinking",
          "scientificmethod",
          "optimization",
          "formallogic",
        ],
        default: "hybrid",
      },
      thought: { type: "string", minLength: 1 },
      thoughtNumber: { type: "integer", minimum: 1 },
      totalThoughts: { type: "integer", minimum: 1 },
      nextThoughtNeeded: { type: "boolean" },
      isRevision: { type: "boolean" },
      revisesThought: { type: "string" },
      revisionReason: { type: "string" },
      branchFrom: { type: "string" },
      branchId: { type: "string" },
      stage: {
        type: "string",
        enum: [
          "problem_definition",
          "constraints",
          "model",
          "proof",
          "implementation",
        ],
      },
      uncertainty: { type: "number", minimum: 0, maximum: 1 },
      dependencies: { type: "array", items: { type: "string" } },
      assumptions: { type: "array", items: { type: "string" } },
      thoughtType: { type: "string" },
      // Math/Physics properties
      mathematicalModel: {
        type: "object",
        properties: {
          latex: { type: "string" },
          symbolic: { type: "string" },
          ascii: { type: "string" },
        },
        additionalProperties: false,
      },
      proofStrategy: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: [
              "direct",
              "contradiction",
              "induction",
              "construction",
              "contrapositive",
            ],
          },
          steps: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
      tensorProperties: {
        type: "object",
        properties: {
          rank: {
            type: "array",
            items: { type: "number" },
            minItems: 2,
            maxItems: 2,
          },
          components: { type: "string" },
          latex: { type: "string" },
          symmetries: { type: "array", items: { type: "string" } },
          invariants: { type: "array", items: { type: "string" } },
          transformation: {
            type: "string",
            enum: ["covariant", "contravariant", "mixed"],
          },
        },
        additionalProperties: false,
      },
      // All other optional properties from various modes (simplified for legacy compatibility)
      // Most users should migrate to focused tools for full schema validation
    },
    required: [
      "thought",
      "thoughtNumber",
      "totalThoughts",
      "nextThoughtNeeded",
    ],
    additionalProperties: true, // Allow extra properties for backward compatibility
  },
};
