#!/usr/bin/env node
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { createHash, randomUUID } from 'crypto';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'fs';

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var init_esm_shims = __esm({
  "node_modules/tsup/assets/esm_shims.js"() {
  }
});

// src/tools/thinking.ts
var thinking_exports = {};
__export(thinking_exports, {
  ThinkingToolSchema: () => ThinkingToolSchema,
  thinkingTool: () => thinkingTool
});
var ThinkingToolSchema, thinkingTool;
var init_thinking = __esm({
  "src/tools/thinking.ts"() {
    init_esm_shims();
    ThinkingToolSchema = z.object({
      sessionId: z.string().optional(),
      mode: z.enum(["sequential", "shannon", "mathematics", "physics", "hybrid", "inductive", "deductive", "abductive", "causal", "bayesian", "counterfactual", "analogical", "temporal", "gametheory", "evidential", "firstprinciples", "systemsthinking", "scientificmethod", "optimization", "formallogic"]).default("hybrid"),
      thought: z.string(),
      thoughtNumber: z.number().int().positive(),
      totalThoughts: z.number().int().positive(),
      nextThoughtNeeded: z.boolean(),
      isRevision: z.boolean().optional(),
      revisesThought: z.string().optional(),
      revisionReason: z.string().optional(),
      branchFrom: z.string().optional(),
      branchId: z.string().optional(),
      stage: z.enum(["problem_definition", "constraints", "model", "proof", "implementation"]).optional(),
      uncertainty: z.number().min(0).max(1).optional(),
      dependencies: z.array(z.string()).optional(),
      assumptions: z.array(z.string()).optional(),
      thoughtType: z.string().optional(),
      mathematicalModel: z.object({
        latex: z.string(),
        symbolic: z.string(),
        ascii: z.string().optional()
      }).optional(),
      proofStrategy: z.object({
        type: z.enum(["direct", "contradiction", "induction", "construction", "contrapositive"]),
        steps: z.array(z.string())
      }).optional(),
      tensorProperties: z.object({
        rank: z.tuple([z.number(), z.number()]),
        components: z.string(),
        latex: z.string(),
        symmetries: z.array(z.string()),
        invariants: z.array(z.string()),
        transformation: z.enum(["covariant", "contravariant", "mixed"])
      }).optional(),
      physicalInterpretation: z.object({
        quantity: z.string(),
        units: z.string(),
        conservationLaws: z.array(z.string())
      }).optional(),
      // Inductive reasoning properties (Phase 5, v5.0.0)
      pattern: z.string().optional(),
      generalization: z.string().optional(),
      confidence: z.number().min(0).max(1).optional(),
      counterexamples: z.array(z.string()).optional(),
      sampleSize: z.number().int().min(1).optional(),
      // Deductive reasoning properties (Phase 5, v5.0.0)
      premises: z.array(z.string()).optional(),
      logicForm: z.string().optional(),
      validityCheck: z.boolean().optional(),
      soundnessCheck: z.boolean().optional(),
      // Abductive reasoning properties (v2.0)
      observations: z.union([
        z.array(z.string()),
        // For inductive reasoning - simple strings
        z.array(z.object({
          // For abductive reasoning - structured objects
          id: z.string(),
          description: z.string(),
          confidence: z.number().min(0).max(1)
        }))
      ]).optional(),
      hypotheses: z.array(z.object({
        id: z.string(),
        // Abductive fields
        explanation: z.string().optional(),
        assumptions: z.array(z.string()).optional(),
        predictions: z.array(z.string()).optional(),
        score: z.number().optional(),
        // Evidential fields
        name: z.string().optional(),
        description: z.string().optional(),
        mutuallyExclusive: z.boolean().optional(),
        subsets: z.array(z.string()).optional()
      })).optional(),
      evaluationCriteria: z.object({
        parsimony: z.number(),
        explanatoryPower: z.number(),
        plausibility: z.number(),
        testability: z.boolean()
      }).optional(),
      evidence: z.array(z.object({
        id: z.string(),
        description: z.string(),
        // Abductive fields
        hypothesisId: z.string().optional(),
        type: z.enum(["supporting", "contradicting", "neutral"]).optional(),
        strength: z.number().min(0).max(1).optional(),
        // Evidential fields
        source: z.string().optional(),
        reliability: z.number().min(0).max(1).optional(),
        timestamp: z.number().optional(),
        supports: z.array(z.string()).optional(),
        contradicts: z.array(z.string()).optional()
      })).optional(),
      bestExplanation: z.object({
        id: z.string(),
        explanation: z.string(),
        assumptions: z.array(z.string()),
        predictions: z.array(z.string()),
        score: z.number()
      }).optional(),
      // Causal reasoning properties (v2.0)
      causalGraph: z.object({
        nodes: z.array(z.object({
          id: z.string(),
          name: z.string(),
          type: z.enum(["cause", "effect", "mediator", "confounder"]),
          description: z.string()
        })),
        edges: z.array(z.object({
          from: z.string(),
          to: z.string(),
          strength: z.number(),
          confidence: z.number().min(0).max(1)
        }))
      }).optional(),
      interventions: z.array(z.object({
        nodeId: z.string(),
        action: z.string(),
        expectedEffects: z.array(z.object({
          nodeId: z.string(),
          expectedChange: z.string(),
          confidence: z.number()
        }))
      })).optional(),
      mechanisms: z.array(z.object({
        from: z.string(),
        to: z.string(),
        description: z.string(),
        type: z.enum(["direct", "indirect", "feedback"])
      })).optional(),
      confounders: z.array(z.object({
        nodeId: z.string(),
        affects: z.array(z.string()),
        description: z.string()
      })).optional(),
      // Bayesian reasoning properties (v2.0)
      hypothesis: z.object({
        id: z.string(),
        statement: z.string()
      }).optional(),
      prior: z.object({
        probability: z.number().min(0).max(1),
        justification: z.string()
      }).optional(),
      likelihood: z.object({
        probability: z.number().min(0).max(1),
        description: z.string()
      }).optional(),
      posterior: z.object({
        probability: z.number().min(0).max(1),
        calculation: z.string()
      }).optional(),
      bayesFactor: z.number().optional(),
      // Counterfactual reasoning properties (v2.0)
      actual: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        conditions: z.array(z.object({
          factor: z.string(),
          value: z.string()
        })),
        outcomes: z.array(z.object({
          description: z.string(),
          impact: z.enum(["positive", "negative", "neutral"]),
          magnitude: z.number().optional()
        }))
      }).optional(),
      counterfactuals: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        conditions: z.array(z.object({
          factor: z.string(),
          value: z.string()
        })),
        outcomes: z.array(z.object({
          description: z.string(),
          impact: z.enum(["positive", "negative", "neutral"]),
          magnitude: z.number().optional()
        }))
      })).optional(),
      comparison: z.object({
        differences: z.array(z.object({
          aspect: z.string(),
          actual: z.string(),
          counterfactual: z.string(),
          significance: z.enum(["high", "medium", "low"])
        })),
        insights: z.array(z.string()),
        lessons: z.array(z.string())
      }).optional(),
      interventionPoint: z.object({
        description: z.string(),
        alternatives: z.array(z.string())
      }).optional(),
      causalChains: z.array(z.object({
        intervention: z.string(),
        steps: z.array(z.string()),
        finalOutcome: z.string()
      })).optional(),
      // Analogical reasoning properties (v2.0)
      sourceDomain: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        entities: z.array(z.object({
          id: z.string(),
          name: z.string(),
          type: z.string()
        })),
        relations: z.array(z.object({
          id: z.string(),
          type: z.string(),
          from: z.string(),
          to: z.string()
        }))
      }).optional(),
      targetDomain: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        entities: z.array(z.object({
          id: z.string(),
          name: z.string(),
          type: z.string()
        })),
        relations: z.array(z.object({
          id: z.string(),
          type: z.string(),
          from: z.string(),
          to: z.string()
        }))
      }).optional(),
      mapping: z.array(z.object({
        sourceEntityId: z.string(),
        targetEntityId: z.string(),
        justification: z.string(),
        confidence: z.number().min(0).max(1)
      })).optional(),
      insights: z.array(z.object({
        description: z.string(),
        sourceEvidence: z.string(),
        targetApplication: z.string()
      })).optional(),
      inferences: z.array(z.object({
        sourcePattern: z.string(),
        targetPrediction: z.string(),
        confidence: z.number().min(0).max(1),
        needsVerification: z.boolean()
      })).optional(),
      limitations: z.array(z.string()).optional(),
      analogyStrength: z.number().min(0).max(1).optional(),
      // Temporal reasoning properties (Phase 3, v2.1)
      timeline: z.object({
        id: z.string(),
        name: z.string(),
        timeUnit: z.enum(["milliseconds", "seconds", "minutes", "hours", "days", "months", "years"]),
        startTime: z.number().optional(),
        endTime: z.number().optional(),
        events: z.array(z.string())
      }).optional(),
      events: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        timestamp: z.number(),
        duration: z.number().optional(),
        type: z.enum(["instant", "interval"]),
        properties: z.record(z.string(), z.any())
      })).optional(),
      intervals: z.array(z.object({
        id: z.string(),
        name: z.string(),
        start: z.number(),
        end: z.number(),
        overlaps: z.array(z.string()).optional(),
        contains: z.array(z.string()).optional()
      })).optional(),
      constraints: z.array(z.object({
        id: z.string(),
        type: z.enum(["before", "after", "during", "overlaps", "meets", "starts", "finishes", "equals"]),
        subject: z.string(),
        object: z.string(),
        confidence: z.number().min(0).max(1)
      })).optional(),
      relations: z.array(z.object({
        id: z.string(),
        from: z.string(),
        to: z.string(),
        relationType: z.enum(["causes", "enables", "prevents", "precedes", "follows"]),
        strength: z.number().min(0).max(1),
        delay: z.number().optional()
      })).optional(),
      // Game theory properties (Phase 3, v2.2)
      game: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        type: z.enum(["normal_form", "extensive_form", "cooperative", "non_cooperative"]),
        numPlayers: z.number().int().min(2),
        isZeroSum: z.boolean(),
        isPerfectInformation: z.boolean()
      }).optional(),
      players: z.array(z.object({
        id: z.string(),
        name: z.string(),
        role: z.string().optional(),
        isRational: z.boolean(),
        availableStrategies: z.array(z.string())
      })).optional(),
      strategies: z.array(z.object({
        id: z.string(),
        playerId: z.string(),
        name: z.string(),
        description: z.string(),
        isPure: z.boolean(),
        probability: z.number().min(0).max(1).optional()
      })).optional(),
      payoffMatrix: z.object({
        players: z.array(z.string()),
        dimensions: z.array(z.number()),
        payoffs: z.array(z.object({
          strategyProfile: z.array(z.string()),
          payoffs: z.array(z.number())
        }))
      }).optional(),
      nashEquilibria: z.array(z.object({
        id: z.string(),
        strategyProfile: z.array(z.string()),
        payoffs: z.array(z.number()),
        type: z.enum(["pure", "mixed"]),
        isStrict: z.boolean(),
        stability: z.number().min(0).max(1)
      })).optional(),
      dominantStrategies: z.array(z.object({
        playerId: z.string(),
        strategyId: z.string(),
        type: z.enum(["strictly_dominant", "weakly_dominant"]),
        dominatesStrategies: z.array(z.string()),
        justification: z.string()
      })).optional(),
      gameTree: z.object({
        rootNode: z.string(),
        nodes: z.array(z.object({
          id: z.string(),
          type: z.enum(["decision", "chance", "terminal"]),
          playerId: z.string().optional(),
          parentNode: z.string().optional(),
          childNodes: z.array(z.string()),
          action: z.string().optional(),
          probability: z.number().min(0).max(1).optional(),
          payoffs: z.array(z.number()).optional()
        })),
        informationSets: z.array(z.object({
          id: z.string(),
          playerId: z.string(),
          nodes: z.array(z.string()),
          availableActions: z.array(z.string())
        })).optional()
      }).optional(),
      // Evidential properties (Phase 3, v2.3)
      frameOfDiscernment: z.array(z.string()).optional(),
      beliefFunctions: z.array(z.object({
        id: z.string(),
        source: z.string(),
        massAssignments: z.array(z.object({
          hypothesisSet: z.array(z.string()),
          mass: z.number().min(0).max(1),
          justification: z.string()
        })),
        conflictMass: z.number().optional()
      })).optional(),
      combinedBelief: z.object({
        id: z.string(),
        source: z.string(),
        massAssignments: z.array(z.object({
          hypothesisSet: z.array(z.string()),
          mass: z.number().min(0).max(1),
          justification: z.string()
        })),
        conflictMass: z.number().optional()
      }).optional(),
      plausibility: z.object({
        id: z.string(),
        assignments: z.array(z.object({
          hypothesisSet: z.array(z.string()),
          plausibility: z.number().min(0).max(1),
          belief: z.number().min(0).max(1),
          uncertaintyInterval: z.tuple([z.number(), z.number()])
        }))
      }).optional(),
      decisions: z.array(z.object({
        id: z.string(),
        name: z.string(),
        selectedHypothesis: z.array(z.string()),
        confidence: z.number().min(0).max(1),
        reasoning: z.string(),
        alternatives: z.array(z.object({
          hypothesis: z.array(z.string()),
          expectedUtility: z.number(),
          risk: z.number()
        }))
      })).optional(),
      // First-Principles properties (Phase 3, v3.1.0)
      question: z.string().optional(),
      principles: z.array(z.object({
        id: z.string(),
        type: z.enum(["axiom", "definition", "observation", "logical_inference", "assumption"]),
        statement: z.string(),
        justification: z.string(),
        dependsOn: z.array(z.string()).optional(),
        confidence: z.number().min(0).max(1).optional()
      })).optional(),
      derivationSteps: z.array(z.object({
        stepNumber: z.number().int().positive(),
        principle: z.string(),
        inference: z.string(),
        logicalForm: z.string().optional(),
        confidence: z.number().min(0).max(1)
      })).optional(),
      conclusion: z.union([
        z.string(),
        // For deductive reasoning - simple conclusion
        z.object({
          // For first-principles reasoning - structured conclusion
          statement: z.string(),
          derivationChain: z.array(z.number()),
          certainty: z.number().min(0).max(1),
          limitations: z.array(z.string()).optional()
        })
      ]).optional(),
      alternativeInterpretations: z.array(z.string()).optional(),
      // Systems Thinking properties (Phase 4, v3.2.0)
      system: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        boundary: z.string(),
        purpose: z.string(),
        timeHorizon: z.string().optional()
      }).optional(),
      components: z.array(z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(["stock", "flow", "variable", "parameter", "delay"]),
        description: z.string(),
        unit: z.string().optional(),
        initialValue: z.number().optional(),
        formula: z.string().optional(),
        influencedBy: z.array(z.string()).optional()
      })).optional(),
      feedbackLoops: z.array(z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(["reinforcing", "balancing"]),
        description: z.string(),
        components: z.array(z.string()),
        polarity: z.enum(["+", "-"]),
        strength: z.number().min(0).max(1),
        delay: z.number().optional(),
        dominance: z.enum(["early", "middle", "late"]).optional()
      })).optional(),
      leveragePoints: z.array(z.object({
        id: z.string(),
        name: z.string(),
        location: z.string(),
        description: z.string(),
        effectiveness: z.number().min(0).max(1),
        difficulty: z.number().min(0).max(1),
        type: z.enum(["parameter", "feedback", "structure", "goal", "paradigm"]),
        interventionExamples: z.array(z.string())
      })).optional(),
      behaviors: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        pattern: z.enum(["growth", "decline", "oscillation", "equilibrium", "chaos", "overshoot_collapse"]),
        causes: z.array(z.string()),
        timeframe: z.string(),
        unintendedConsequences: z.array(z.string()).optional()
      })).optional(),
      // Scientific Method properties (Phase 4, v3.2.0)
      researchQuestion: z.object({
        id: z.string(),
        question: z.string(),
        background: z.string(),
        rationale: z.string(),
        significance: z.string(),
        variables: z.object({
          independent: z.array(z.string()),
          dependent: z.array(z.string()),
          control: z.array(z.string())
        })
      }).optional(),
      scientificHypotheses: z.array(z.object({
        id: z.string(),
        type: z.enum(["null", "alternative", "directional", "non_directional"]),
        statement: z.string(),
        prediction: z.string(),
        rationale: z.string(),
        testable: z.boolean(),
        falsifiable: z.boolean()
      })).optional(),
      experiment: z.object({
        id: z.string(),
        type: z.enum(["experimental", "quasi_experimental", "observational", "correlational"]),
        design: z.string(),
        sampleSize: z.number().int().positive(),
        sampleSizeJustification: z.string().optional(),
        randomization: z.boolean(),
        blinding: z.enum(["none", "single", "double", "triple"]).optional(),
        controls: z.array(z.string()),
        procedure: z.array(z.string()),
        materials: z.array(z.string()).optional(),
        duration: z.string().optional(),
        ethicalConsiderations: z.array(z.string()).optional()
      }).optional(),
      dataCollection: z.object({
        id: z.string(),
        method: z.array(z.string()),
        instruments: z.array(z.string()),
        dataQuality: z.object({
          completeness: z.number().min(0).max(1),
          reliability: z.number().min(0).max(1),
          validity: z.number().min(0).max(1)
        }),
        limitations: z.array(z.string()).optional()
      }).optional(),
      statisticalAnalysis: z.object({
        id: z.string(),
        tests: z.array(z.object({
          id: z.string(),
          name: z.string(),
          hypothesisTested: z.string(),
          testStatistic: z.number(),
          pValue: z.number().min(0).max(1),
          confidenceInterval: z.tuple([z.number(), z.number()]).optional(),
          alpha: z.number().min(0).max(1),
          result: z.enum(["reject_null", "fail_to_reject_null"]),
          interpretation: z.string()
        })),
        summary: z.string(),
        effectSize: z.object({
          type: z.string(),
          value: z.number(),
          interpretation: z.string()
        }).optional(),
        powerAnalysis: z.object({
          power: z.number().min(0).max(1),
          alpha: z.number().min(0).max(1),
          interpretation: z.string()
        }).optional()
      }).optional(),
      scientificConclusion: z.object({
        id: z.string(),
        statement: z.string(),
        supportedHypotheses: z.array(z.string()),
        rejectedHypotheses: z.array(z.string()),
        confidence: z.number().min(0).max(1),
        limitations: z.array(z.string()),
        alternativeExplanations: z.array(z.string()).optional(),
        futureDirections: z.array(z.string()),
        replicationConsiderations: z.array(z.string()),
        practicalImplications: z.array(z.string()).optional(),
        theoreticalImplications: z.array(z.string()).optional()
      }).optional(),
      // Optimization properties (Phase 4, v3.2.0)
      optimizationProblem: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        type: z.enum(["linear", "nonlinear", "integer", "mixed_integer", "constraint_satisfaction", "multi_objective"]),
        approach: z.enum(["exact", "heuristic", "metaheuristic", "approximation"]).optional(),
        complexity: z.string().optional()
      }).optional(),
      decisionVariables: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        type: z.enum(["continuous", "integer", "binary", "categorical"]),
        unit: z.string().optional(),
        semantics: z.string()
      })).optional(),
      optimizationConstraints: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        type: z.enum(["hard", "soft"]),
        formula: z.string(),
        variables: z.array(z.string()),
        penalty: z.number().optional(),
        rationale: z.string(),
        priority: z.number().optional()
      })).optional(),
      objectives: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        type: z.enum(["minimize", "maximize"]),
        formula: z.string(),
        variables: z.array(z.string()),
        weight: z.number().min(0).max(1).optional(),
        units: z.string().optional(),
        idealValue: z.number().optional(),
        acceptableRange: z.tuple([z.number(), z.number()]).optional()
      })).optional(),
      solution: z.object({
        id: z.string(),
        type: z.enum(["optimal", "feasible", "infeasible", "unbounded", "approximate"]),
        variableValues: z.record(z.string(), z.union([z.number(), z.string()])),
        objectiveValues: z.record(z.string(), z.number()),
        quality: z.number().min(0).max(1),
        computationTime: z.number().optional(),
        iterations: z.number().optional(),
        method: z.string().optional(),
        guarantees: z.array(z.string()).optional()
      }).optional(),
      sensitivityAnalysis: z.object({
        id: z.string(),
        robustness: z.number().min(0).max(1),
        criticalConstraints: z.array(z.string()),
        shadowPrices: z.record(z.string(), z.number()).optional(),
        recommendations: z.array(z.string())
      }).optional(),
      // Formal Logic properties (Phase 4, v3.2.0)
      propositions: z.array(z.object({
        id: z.string(),
        symbol: z.string(),
        statement: z.string(),
        truthValue: z.boolean().optional(),
        type: z.enum(["atomic", "compound"]),
        formula: z.string().optional()
      })).optional(),
      logicalInferences: z.array(z.object({
        id: z.string(),
        rule: z.enum(["modus_ponens", "modus_tollens", "hypothetical_syllogism", "disjunctive_syllogism", "conjunction", "simplification", "addition", "resolution", "contradiction", "excluded_middle"]),
        premises: z.array(z.string()),
        conclusion: z.string(),
        justification: z.string(),
        valid: z.boolean()
      })).optional(),
      logicalProof: z.object({
        id: z.string(),
        theorem: z.string(),
        technique: z.enum(["direct", "contradiction", "contrapositive", "cases", "induction", "natural_deduction", "resolution", "semantic_tableaux"]),
        steps: z.array(z.object({
          stepNumber: z.number().int().positive(),
          statement: z.string(),
          formula: z.string().optional(),
          justification: z.string(),
          rule: z.enum(["modus_ponens", "modus_tollens", "hypothetical_syllogism", "disjunctive_syllogism", "conjunction", "simplification", "addition", "resolution", "contradiction", "excluded_middle"]).optional(),
          referencesSteps: z.array(z.number()).optional(),
          isAssumption: z.boolean().optional(),
          dischargesAssumption: z.number().optional()
        })),
        conclusion: z.string(),
        valid: z.boolean(),
        completeness: z.number().min(0).max(1),
        assumptions: z.array(z.string()).optional()
      }).optional(),
      truthTable: z.object({
        id: z.string(),
        propositions: z.array(z.string()),
        formula: z.string().optional(),
        rows: z.array(z.object({
          rowNumber: z.number().int().positive(),
          assignments: z.record(z.string(), z.boolean()),
          result: z.boolean()
        })),
        isTautology: z.boolean(),
        isContradiction: z.boolean(),
        isContingent: z.boolean()
      }).optional(),
      satisfiability: z.object({
        id: z.string(),
        formula: z.string(),
        satisfiable: z.boolean(),
        model: z.record(z.string(), z.boolean()).optional(),
        method: z.enum(["dpll", "cdcl", "resolution", "truth_table", "other"]),
        complexity: z.string().optional(),
        explanation: z.string()
      }).optional(),
      action: z.enum(["add_thought", "summarize", "export", "switch_mode", "get_session", "recommend_mode"]).default("add_thought"),
      exportFormat: z.enum(["markdown", "latex", "json", "html", "jupyter", "mermaid", "dot", "ascii"]).optional(),
      newMode: z.enum(["sequential", "shannon", "mathematics", "physics", "hybrid", "inductive", "deductive", "abductive", "causal", "bayesian", "counterfactual", "analogical", "temporal", "gametheory", "evidential", "firstprinciples", "systemsthinking", "scientificmethod", "optimization", "formallogic"]).optional(),
      // Mode recommendation parameters (v2.4)
      problemType: z.string().optional(),
      problemCharacteristics: z.object({
        domain: z.string(),
        complexity: z.enum(["low", "medium", "high"]),
        uncertainty: z.enum(["low", "medium", "high"]),
        timeDependent: z.boolean(),
        multiAgent: z.boolean(),
        requiresProof: z.boolean(),
        requiresQuantification: z.boolean(),
        hasIncompleteInfo: z.boolean(),
        requiresExplanation: z.boolean(),
        hasAlternatives: z.boolean()
      }).optional(),
      includeCombinations: z.boolean().optional()
    });
    thinkingTool = {
      name: "deepthinking",
      description: "[DEPRECATED] Use deepthinking_* tools instead. Legacy tool supporting 18 reasoning modes with auto-routing to focused tools.",
      inputSchema: {
        type: "object",
        properties: {
          sessionId: { type: "string" },
          mode: {
            type: "string",
            enum: ["sequential", "shannon", "mathematics", "physics", "hybrid", "inductive", "deductive", "abductive", "causal", "bayesian", "counterfactual", "analogical", "temporal", "gametheory", "evidential", "firstprinciples", "systemsthinking", "scientificmethod", "optimization", "formallogic"],
            default: "hybrid"
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
            enum: ["problem_definition", "constraints", "model", "proof", "implementation"]
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
              ascii: { type: "string" }
            },
            additionalProperties: false
          },
          proofStrategy: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["direct", "contradiction", "induction", "construction", "contrapositive"] },
              steps: { type: "array", items: { type: "string" } }
            },
            additionalProperties: false
          },
          tensorProperties: {
            type: "object",
            properties: {
              rank: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 },
              components: { type: "string" },
              latex: { type: "string" },
              symmetries: { type: "array", items: { type: "string" } },
              invariants: { type: "array", items: { type: "string" } },
              transformation: { type: "string", enum: ["covariant", "contravariant", "mixed"] }
            },
            additionalProperties: false
          }
          // All other optional properties from various modes (simplified for legacy compatibility)
          // Most users should migrate to focused tools for full schema validation
        },
        required: ["thought", "thoughtNumber", "totalThoughts", "nextThoughtNeeded"],
        additionalProperties: true
        // Allow extra properties for backward compatibility
      }
    };
  }
});

// src/types/core.ts
function isTemporalThought(thought) {
  return thought.mode === "temporal" /* TEMPORAL */;
}
function isGameTheoryThought(thought) {
  return thought.mode === "gametheory" /* GAMETHEORY */;
}
function isEvidentialThought(thought) {
  return thought.mode === "evidential" /* EVIDENTIAL */;
}
function isMetaReasoningThought(thought) {
  return thought.mode === "metareasoning" /* METAREASONING */;
}
var init_core = __esm({
  "src/types/core.ts"() {
    init_esm_shims();
  }
});

// src/types/session.ts
var init_session = __esm({
  "src/types/session.ts"() {
    init_esm_shims();
  }
});

// src/types/modes/recommendations.ts
var ModeRecommender;
var init_recommendations = __esm({
  "src/types/modes/recommendations.ts"() {
    init_esm_shims();
    ModeRecommender = class {
      /**
       * Recommends reasoning modes based on problem characteristics
       * Returns modes ranked by suitability score
       */
      recommendModes(characteristics) {
        const recommendations = [];
        const isPhilosophical = characteristics.domain.toLowerCase().includes("metaphysics") || characteristics.domain.toLowerCase().includes("theology") || characteristics.domain.toLowerCase().includes("philosophy") || characteristics.domain.toLowerCase().includes("epistemology") || characteristics.domain.toLowerCase().includes("ethics");
        if (characteristics.complexity === "high" && (characteristics.requiresExplanation || characteristics.hasAlternatives || isPhilosophical)) {
          recommendations.push({
            mode: "hybrid" /* HYBRID */,
            score: 0.92,
            reasoning: "Complex problem benefits from multi-modal synthesis combining inductive, deductive, and abductive reasoning",
            strengths: ["Comprehensive analysis", "Combines empirical and logical approaches", "Maximum evidential strength", "Convergent validation"],
            limitations: ["Time-intensive", "Requires understanding of multiple reasoning types"],
            examples: ["Philosophical arguments", "Scientific theories", "Complex decision-making", "Metaphysical questions"]
          });
        }
        if (!characteristics.requiresProof && (characteristics.requiresQuantification || characteristics.hasIncompleteInfo || isPhilosophical)) {
          recommendations.push({
            mode: "inductive" /* INDUCTIVE */,
            score: isPhilosophical ? 0.85 : 0.8,
            reasoning: "Problem requires pattern recognition and generalization from observations",
            strengths: ["Empirical grounding", "Pattern detection", "Probabilistic reasoning", "Scientific discovery"],
            limitations: ["Cannot prove with certainty", "Vulnerable to black swans", "Sample size dependent"],
            examples: ["Scientific hypotheses", "Trend analysis", "Empirical arguments", "Data-driven insights"]
          });
        }
        if (characteristics.requiresProof || isPhilosophical) {
          recommendations.push({
            mode: "deductive" /* DEDUCTIVE */,
            score: characteristics.requiresProof ? 0.9 : 0.75,
            reasoning: "Problem requires logical derivation from general principles to specific conclusions",
            strengths: ["Logical validity", "Rigorous inference", "Exposes contradictions", "Formal reasoning"],
            limitations: ["Soundness depends on premise truth", "Vulnerable to definitional disputes", "May not handle uncertainty well"],
            examples: ["Logical proofs", "Mathematical theorems", "Philosophical arguments", "Formal verification"]
          });
        }
        if (characteristics.requiresExplanation || isPhilosophical) {
          recommendations.push({
            mode: "abductive" /* ABDUCTIVE */,
            score: isPhilosophical ? 0.9 : 0.87,
            reasoning: "Problem requires finding best explanations through comparative hypothesis evaluation",
            strengths: ["Hypothesis generation", "Comparative evaluation", "Explanatory power assessment", "Handles competing theories"],
            limitations: ["May miss non-obvious explanations", "Explanatory power is subjective"],
            examples: ["Scientific explanation", "Debugging", "Diagnosis", "Theory selection", "Metaphysical arguments"]
          });
        }
        if (characteristics.complexity === "high" || characteristics.hasAlternatives && characteristics.uncertainty === "high") {
          recommendations.push({
            mode: "metareasoning" /* METAREASONING */,
            score: characteristics.complexity === "high" ? 0.88 : 0.82,
            reasoning: "Complex or uncertain problems benefit from strategic monitoring and adaptive reasoning",
            strengths: ["Strategy evaluation", "Mode switching recommendations", "Quality monitoring", "Resource allocation", "Self-reflection"],
            limitations: ["Meta-level overhead", "Requires understanding of other modes", "May not directly solve the problem"],
            examples: ["Strategy selection", "Debugging stuck reasoning", "Quality assessment", "Adaptive problem-solving"]
          });
        }
        if (characteristics.timeDependent) {
          recommendations.push({
            mode: "temporal" /* TEMPORAL */,
            score: 0.9,
            reasoning: "Problem involves time-dependent events and sequences",
            strengths: ["Event sequencing", "Temporal causality", "Timeline construction"],
            limitations: ["Limited strategic reasoning"],
            examples: ["Process modeling", "Event correlation", "Timeline debugging"]
          });
        }
        if (characteristics.multiAgent) {
          recommendations.push({
            mode: "gametheory" /* GAMETHEORY */,
            score: 0.85,
            reasoning: "Problem involves strategic interactions between agents",
            strengths: ["Equilibrium analysis", "Strategic reasoning", "Multi-agent dynamics"],
            limitations: ["Assumes rationality", "Complex computations"],
            examples: ["Competitive analysis", "Auction design", "Negotiation"]
          });
        }
        if (characteristics.hasIncompleteInfo && characteristics.uncertainty === "high" && !isPhilosophical) {
          recommendations.push({
            mode: "evidential" /* EVIDENTIAL */,
            score: 0.82,
            reasoning: "Problem has incomplete information and high uncertainty requiring Dempster-Shafer belief functions",
            strengths: ["Handles ignorance", "Evidence combination", "Uncertainty intervals"],
            limitations: ["Computational complexity", "Requires careful mass assignment", "Better for sensor fusion than philosophical reasoning"],
            examples: ["Sensor fusion", "Diagnostic reasoning", "Intelligence analysis"]
          });
        }
        if (characteristics.timeDependent && characteristics.requiresExplanation) {
          recommendations.push({
            mode: "causal" /* CAUSAL */,
            score: 0.86,
            reasoning: "Problem requires understanding cause-effect relationships",
            strengths: ["Intervention analysis", "Causal graphs", "Impact assessment"],
            limitations: ["Requires domain knowledge", "Difficult to identify confounders"],
            examples: ["Impact analysis", "System design", "Policy evaluation"]
          });
        }
        if (characteristics.requiresQuantification && characteristics.uncertainty !== "low") {
          recommendations.push({
            mode: "bayesian" /* BAYESIAN */,
            score: 0.84,
            reasoning: "Problem requires probabilistic reasoning with evidence updates",
            strengths: ["Principled uncertainty", "Evidence integration", "Prior knowledge"],
            limitations: ["Requires probability estimates", "Computationally intensive"],
            examples: ["A/B testing", "Risk assessment", "Predictive modeling"]
          });
        }
        if (characteristics.hasAlternatives) {
          recommendations.push({
            mode: "counterfactual" /* COUNTERFACTUAL */,
            score: 0.82,
            reasoning: "Problem benefits from analyzing alternative scenarios",
            strengths: ["What-if analysis", "Post-mortem insights", "Decision comparison"],
            limitations: ["Speculative", "Difficult to validate"],
            examples: ["Post-mortems", "Strategic planning", "Architecture decisions"]
          });
        }
        if (characteristics.complexity === "high" && characteristics.requiresExplanation) {
          recommendations.push({
            mode: "analogical" /* ANALOGICAL */,
            score: 0.8,
            reasoning: "Problem can benefit from cross-domain analogies",
            strengths: ["Creative insights", "Knowledge transfer", "Pattern recognition"],
            limitations: ["Analogies may be superficial", "Requires diverse knowledge"],
            examples: ["Novel problem solving", "Design thinking", "Innovation"]
          });
        }
        if (characteristics.requiresProof) {
          recommendations.push({
            mode: "mathematics" /* MATHEMATICS */,
            score: 0.95,
            reasoning: "Problem requires formal proofs and symbolic reasoning",
            strengths: ["Rigorous proofs", "Symbolic computation", "Theorem proving"],
            limitations: ["Limited to mathematical domains"],
            examples: ["Algorithm correctness", "Complexity analysis", "Formal verification"]
          });
        }
        if (characteristics.domain === "physics" || characteristics.domain === "engineering") {
          recommendations.push({
            mode: "physics" /* PHYSICS */,
            score: 0.9,
            reasoning: "Problem involves physical systems or tensor mathematics",
            strengths: ["Field theory", "Conservation laws", "Tensor analysis"],
            limitations: ["Specialized to physics domains"],
            examples: ["Physical modeling", "System dynamics", "Engineering analysis"]
          });
        }
        if (characteristics.complexity === "high" && characteristics.requiresProof) {
          recommendations.push({
            mode: "shannon" /* SHANNON */,
            score: 0.88,
            reasoning: "Complex problem requiring systematic decomposition",
            strengths: ["Systematic approach", "Problem decomposition", "Rigorous analysis"],
            limitations: ["Time-intensive", "Requires discipline"],
            examples: ["Complex system design", "Research problems", "Novel algorithms"]
          });
        }
        if (recommendations.length === 0) {
          recommendations.push({
            mode: "sequential" /* SEQUENTIAL */,
            score: 0.7,
            reasoning: "General-purpose iterative reasoning",
            strengths: ["Flexible", "Adaptable", "Iterative refinement"],
            limitations: ["May lack structure for complex problems"],
            examples: ["General problem solving", "Exploration", "Brainstorming"]
          });
        }
        return recommendations.sort((a, b) => b.score - a.score);
      }
      /**
       * Recommends combinations of reasoning modes that work well together
       */
      recommendCombinations(characteristics) {
        const combinations = [];
        const isPhilosophical = characteristics.domain.toLowerCase().includes("metaphysics") || characteristics.domain.toLowerCase().includes("theology") || characteristics.domain.toLowerCase().includes("philosophy") || characteristics.domain.toLowerCase().includes("epistemology") || characteristics.domain.toLowerCase().includes("ethics");
        if (isPhilosophical || characteristics.complexity === "high" && characteristics.requiresExplanation && characteristics.hasAlternatives) {
          combinations.push({
            modes: ["inductive" /* INDUCTIVE */, "deductive" /* DEDUCTIVE */, "abductive" /* ABDUCTIVE */],
            sequence: "hybrid",
            rationale: "Synthesize empirical patterns, logical derivations, and explanatory hypotheses for maximum evidential strength",
            benefits: ["Convergent validation from three independent methods", "Empirical grounding + logical rigor + explanatory power", "Highest achievable confidence through multi-modal synthesis", "Exposes both empirical patterns and logical contradictions"],
            synergies: ["Inductive patterns inform abductive hypotheses", "Deductive logic tests hypothesis validity", "Abductive explanations guide inductive search", "All three methods converge on same conclusion"]
          });
        }
        if (characteristics.timeDependent && characteristics.requiresExplanation) {
          combinations.push({
            modes: ["temporal" /* TEMPORAL */, "causal" /* CAUSAL */],
            sequence: "sequential",
            rationale: "Build timeline first, then analyze causal relationships",
            benefits: ["Complete temporal-causal model", "Root cause with timeline context"],
            synergies: ["Temporal events inform causal nodes", "Causal edges explain temporal sequences"]
          });
        }
        if (characteristics.requiresExplanation && characteristics.requiresQuantification) {
          combinations.push({
            modes: ["abductive" /* ABDUCTIVE */, "bayesian" /* BAYESIAN */],
            sequence: "sequential",
            rationale: "Generate hypotheses, then quantify with probabilities",
            benefits: ["Systematic hypothesis generation", "Quantified belief updates"],
            synergies: ["Abductive hypotheses become Bayesian hypotheses", "Bayesian updates refine explanations"]
          });
        }
        if (characteristics.multiAgent && characteristics.hasAlternatives) {
          combinations.push({
            modes: ["gametheory" /* GAMETHEORY */, "counterfactual" /* COUNTERFACTUAL */],
            sequence: "hybrid",
            rationale: "Analyze equilibria, then explore alternative strategies",
            benefits: ["Strategic analysis + scenario exploration", "Robustness testing"],
            synergies: ["Equilibria as actual scenarios", "Strategy changes as interventions"]
          });
        }
        if (characteristics.hasIncompleteInfo && characteristics.timeDependent) {
          combinations.push({
            modes: ["evidential" /* EVIDENTIAL */, "causal" /* CAUSAL */],
            sequence: "parallel",
            rationale: "Combine uncertain evidence while modeling causal structure",
            benefits: ["Handles uncertainty and causality", "Evidence fusion with causal reasoning"],
            synergies: ["Belief functions inform causal strengths", "Causal structure guides evidence combination"]
          });
        }
        if (characteristics.timeDependent && characteristics.multiAgent) {
          combinations.push({
            modes: ["temporal" /* TEMPORAL */, "gametheory" /* GAMETHEORY */],
            sequence: "sequential",
            rationale: "Model event sequences, then analyze strategic interactions over time",
            benefits: ["Dynamic game analysis", "Time-dependent strategies"],
            synergies: ["Temporal events as game stages", "Strategies evolve over timeline"]
          });
        }
        if (characteristics.requiresProof && characteristics.complexity === "high") {
          combinations.push({
            modes: ["shannon" /* SHANNON */, "mathematics" /* MATHEMATICS */],
            sequence: "hybrid",
            rationale: "Use Shannon methodology to structure complex mathematical proofs",
            benefits: ["Systematic proof construction", "Clear problem decomposition"],
            synergies: ["Shannon stages guide proof strategy", "Mathematical rigor validates each stage"]
          });
        }
        return combinations;
      }
      /**
       * Get a simple mode recommendation based on a few key characteristics
       * Simplified version for quick recommendations
       */
      quickRecommend(problemType) {
        const typeMap = {
          // Core reasoning modes
          "explanation": "abductive" /* ABDUCTIVE */,
          "hypothesis": "abductive" /* ABDUCTIVE */,
          "inference": "abductive" /* ABDUCTIVE */,
          "pattern": "inductive" /* INDUCTIVE */,
          "generalization": "inductive" /* INDUCTIVE */,
          "empirical": "inductive" /* INDUCTIVE */,
          "logic": "deductive" /* DEDUCTIVE */,
          "proof": "deductive" /* DEDUCTIVE */,
          "derivation": "deductive" /* DEDUCTIVE */,
          "complex": "hybrid" /* HYBRID */,
          "synthesis": "hybrid" /* HYBRID */,
          "philosophical": "hybrid" /* HYBRID */,
          "metaphysical": "hybrid" /* HYBRID */,
          // Meta-reasoning
          "meta": "metareasoning" /* METAREASONING */,
          "strategy-selection": "metareasoning" /* METAREASONING */,
          "quality-assessment": "metareasoning" /* METAREASONING */,
          "reflection": "metareasoning" /* METAREASONING */,
          // Specialized modes
          "debugging": "abductive" /* ABDUCTIVE */,
          "mathematical": "mathematics" /* MATHEMATICS */,
          "timeline": "temporal" /* TEMPORAL */,
          "strategy": "gametheory" /* GAMETHEORY */,
          "uncertainty": "evidential" /* EVIDENTIAL */,
          "causality": "causal" /* CAUSAL */,
          "probability": "bayesian" /* BAYESIAN */,
          "what-if": "counterfactual" /* COUNTERFACTUAL */,
          "analogy": "analogical" /* ANALOGICAL */,
          "physics": "physics" /* PHYSICS */,
          "systematic": "shannon" /* SHANNON */
        };
        return typeMap[problemType.toLowerCase()] || "sequential" /* SEQUENTIAL */;
      }
    };
  }
});

// src/types/index.ts
var init_types = __esm({
  "src/types/index.ts"() {
    init_esm_shims();
    init_core();
    init_session();
    init_recommendations();
  }
});

// src/utils/errors.ts
var DeepThinkingError, SessionNotFoundError;
var init_errors = __esm({
  "src/utils/errors.ts"() {
    init_esm_shims();
    DeepThinkingError = class extends Error {
      code;
      context;
      timestamp;
      constructor(message, code, context) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.context = context;
        this.timestamp = /* @__PURE__ */ new Date();
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }
      }
      /**
       * Convert error to JSON for logging/serialization
       */
      toJSON() {
        return {
          name: this.name,
          message: this.message,
          code: this.code,
          context: this.context,
          timestamp: this.timestamp.toISOString(),
          stack: this.stack
        };
      }
    };
    SessionNotFoundError = class extends DeepThinkingError {
      constructor(sessionId) {
        super(`Session not found: ${sessionId}`, "SESSION_NOT_FOUND", { sessionId });
      }
    };
  }
});

// src/utils/sanitization.ts
function sanitizeString(input, maxLength = MAX_LENGTHS.STRING_FIELD, fieldName = "input") {
  if (typeof input !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }
  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`);
  }
  if (trimmed.includes("\0")) {
    throw new Error(`${fieldName} contains invalid null bytes`);
  }
  return trimmed;
}
function validateSessionId(sessionId) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(sessionId)) {
    throw new Error(`Invalid session ID format: ${sessionId}`);
  }
  return sessionId;
}
function sanitizeThoughtContent(content) {
  return sanitizeString(content, MAX_LENGTHS.THOUGHT_CONTENT, "thought content");
}
function escapeHtml(text) {
  const htmlEscapeMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;"
  };
  return text.replace(/[&<>"'\/]/g, (char) => htmlEscapeMap[char] || char);
}
function escapeLatex(text) {
  const latexEscapeMap = {
    "\\": "\\textbackslash{}",
    "{": "\\{",
    "}": "\\}",
    "$": "\\$",
    "&": "\\&",
    "%": "\\%",
    "#": "\\#",
    "_": "\\_",
    "~": "\\textasciitilde{}",
    "^": "\\textasciicircum{}"
  };
  return text.replace(/[\\{}$&%#_~^]/g, (char) => latexEscapeMap[char] || char);
}
var MAX_LENGTHS;
var init_sanitization = __esm({
  "src/utils/sanitization.ts"() {
    init_esm_shims();
    MAX_LENGTHS = {
      THOUGHT_CONTENT: 1e5,
      // 100KB for thought content
      TITLE: 500,
      DOMAIN: 200,
      AUTHOR: 300,
      SESSION_ID: 100,
      HYPOTHESIS: 5e3,
      DESCRIPTION: 1e4,
      STRING_FIELD: 1e3
    };
  }
});

// src/utils/logger-types.ts
var LogLevel;
var init_logger_types = __esm({
  "src/utils/logger-types.ts"() {
    init_esm_shims();
    LogLevel = /* @__PURE__ */ ((LogLevel2) => {
      LogLevel2[LogLevel2["DEBUG"] = 0] = "DEBUG";
      LogLevel2[LogLevel2["INFO"] = 1] = "INFO";
      LogLevel2[LogLevel2["WARN"] = 2] = "WARN";
      LogLevel2[LogLevel2["ERROR"] = 3] = "ERROR";
      LogLevel2[LogLevel2["SILENT"] = 4] = "SILENT";
      return LogLevel2;
    })(LogLevel || {});
  }
});

// src/utils/logger.ts
function createLogger(config) {
  return new Logger(config);
}
var DEFAULT_CONFIG, Logger;
var init_logger = __esm({
  "src/utils/logger.ts"() {
    init_esm_shims();
    init_logger_types();
    DEFAULT_CONFIG = {
      minLevel: 1 /* INFO */,
      enableConsole: true,
      enableTimestamps: true,
      prettyPrint: true
    };
    Logger = class {
      config;
      logs = [];
      constructor(config) {
        this.config = { ...DEFAULT_CONFIG, ...config };
      }
      /**
       * Log a debug message
       */
      debug(message, context) {
        this.log(0 /* DEBUG */, message, context);
      }
      /**
       * Log an info message
       */
      info(message, context) {
        this.log(1 /* INFO */, message, context);
      }
      /**
       * Log a warning message
       */
      warn(message, context) {
        this.log(2 /* WARN */, message, context);
      }
      /**
       * Log an error message
       */
      error(message, error, context) {
        this.log(3 /* ERROR */, message, context, error);
      }
      /**
       * Internal log method
       */
      log(level, message, context, error) {
        if (level < this.config.minLevel) {
          return;
        }
        const entry = {
          level,
          message,
          timestamp: /* @__PURE__ */ new Date(),
          context,
          error
        };
        this.logs.push(entry);
        if (this.config.enableConsole) {
          this.writeToConsole(entry);
        }
      }
      /**
       * Write log entry to console
       */
      writeToConsole(entry) {
        const levelName = LogLevel[entry.level];
        const timestamp = this.config.enableTimestamps ? `[${entry.timestamp.toISOString()}] ` : "";
        let message = `${timestamp}${levelName}: ${entry.message}`;
        if (entry.context && this.config.prettyPrint) {
          message += `
  Context: ${JSON.stringify(entry.context, null, 2)}`;
        }
        if (entry.error) {
          message += `
  Error: ${entry.error.message}`;
          if (entry.error.stack && this.config.prettyPrint) {
            message += `
  Stack: ${entry.error.stack}`;
          }
        }
        switch (entry.level) {
          case 0 /* DEBUG */:
          case 1 /* INFO */:
            console.log(message);
            break;
          case 2 /* WARN */:
            console.warn(message);
            break;
          case 3 /* ERROR */:
            console.error(message);
            break;
        }
      }
      /**
       * Get all log entries
       */
      getLogs(minLevel) {
        if (minLevel !== void 0) {
          return this.logs.filter((log) => log.level >= minLevel);
        }
        return [...this.logs];
      }
      /**
       * Clear all logs
       */
      clearLogs() {
        this.logs = [];
      }
      /**
       * Set minimum log level
       */
      setLevel(level) {
        this.config.minLevel = level;
      }
      /**
       * Export logs as JSON
       */
      exportLogs() {
        return JSON.stringify(this.logs.map((log) => ({
          ...log,
          level: LogLevel[log.level],
          timestamp: log.timestamp.toISOString()
        })), null, 2);
      }
    };
    new Logger();
  }
});

// src/cache/lru.ts
var LRUCache;
var init_lru = __esm({
  "src/cache/lru.ts"() {
    init_esm_shims();
    LRUCache = class {
      cache;
      config;
      stats;
      constructor(config = {}) {
        this.cache = /* @__PURE__ */ new Map();
        this.config = {
          /**
           * Default max cache size: 100 entries
           * Reasoning:
           * - Validation cache typically stores session/thought validation results
           * - Average entry size: ~1-2KB (validation result + metadata)
           * - 100 entries = ~100-200KB memory usage
           * - Sufficient for most use cases (covers recent validations)
           * - Prevents unbounded memory growth in long-running processes
           * - Can be overridden via config parameter for high-traffic scenarios
           */
          maxSize: config.maxSize || 100,
          strategy: "lru",
          ttl: config.ttl || 0,
          enableStats: config.enableStats !== false,
          onEvict: config.onEvict || (() => {
          })
        };
        this.stats = {
          size: 0,
          maxSize: this.config.maxSize,
          hits: 0,
          misses: 0,
          hitRate: 0,
          evictions: 0,
          sets: 0,
          deletes: 0,
          memoryUsage: 0,
          avgAccessTime: 0
        };
      }
      /**
       * Get value by key
       */
      get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
          if (this.config.enableStats) {
            this.stats.misses++;
            this.updateHitRate();
          }
          return void 0;
        }
        if (entry.expiresAt && entry.expiresAt < /* @__PURE__ */ new Date()) {
          this.delete(key);
          if (this.config.enableStats) {
            this.stats.misses++;
            this.updateHitRate();
          }
          return void 0;
        }
        entry.lastAccessedAt = /* @__PURE__ */ new Date();
        entry.accessCount++;
        this.cache.delete(key);
        this.cache.set(key, entry);
        if (this.config.enableStats) {
          this.stats.hits++;
          this.updateHitRate();
        }
        return entry.value;
      }
      /**
       * Set value for key
       */
      set(key, value, ttl) {
        const existing = this.cache.get(key);
        if (existing) {
          this.cache.delete(key);
        } else if (this.cache.size >= this.config.maxSize) {
          this.evictLRU();
        }
        const now = /* @__PURE__ */ new Date();
        const effectiveTtl = ttl ?? this.config.ttl;
        const entry = {
          key,
          value,
          createdAt: now,
          lastAccessedAt: now,
          accessCount: 0,
          expiresAt: effectiveTtl ? new Date(now.getTime() + effectiveTtl) : void 0,
          size: this.estimateSize(value)
        };
        this.cache.set(key, entry);
        if (this.config.enableStats) {
          this.stats.sets++;
          this.stats.size = this.cache.size;
          this.stats.memoryUsage += entry.size || 0;
        }
      }
      /**
       * Check if key exists
       */
      has(key) {
        const entry = this.cache.get(key);
        if (!entry) return false;
        if (entry.expiresAt && entry.expiresAt < /* @__PURE__ */ new Date()) {
          this.delete(key);
          return false;
        }
        return true;
      }
      /**
       * Delete entry by key
       */
      delete(key) {
        const entry = this.cache.get(key);
        if (!entry) return false;
        this.cache.delete(key);
        if (this.config.enableStats) {
          this.stats.deletes++;
          this.stats.size = this.cache.size;
          this.stats.memoryUsage -= entry.size || 0;
        }
        return true;
      }
      /**
       * Clear all entries
       */
      clear() {
        this.cache.clear();
        if (this.config.enableStats) {
          this.stats.size = 0;
          this.stats.memoryUsage = 0;
        }
      }
      /**
       * Get cache size
       */
      size() {
        return this.cache.size;
      }
      /**
       * Get cache statistics
       */
      getStats() {
        return { ...this.stats };
      }
      /**
       * Get all keys
       */
      keys() {
        return Array.from(this.cache.keys());
      }
      /**
       * Get all values
       */
      values() {
        return Array.from(this.cache.values()).map((e) => e.value);
      }
      /**
       * Get all entries
       */
      entries() {
        return Array.from(this.cache.entries()).map(([k, v]) => [k, v.value]);
      }
      /**
       * Evict least recently used entry
       */
      evictLRU() {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
          const entry = this.cache.get(firstKey);
          this.cache.delete(firstKey);
          if (this.config.onEvict && entry) {
            this.config.onEvict(firstKey, entry.value);
          }
          if (this.config.enableStats) {
            this.stats.evictions++;
            this.stats.size = this.cache.size;
            if (entry) {
              this.stats.memoryUsage -= entry.size || 0;
            }
          }
        }
      }
      /**
       * Update hit rate
       */
      updateHitRate() {
        const total = this.stats.hits + this.stats.misses;
        this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
      }
      /**
       * Estimate entry size
       */
      estimateSize(value) {
        try {
          return JSON.stringify(value).length * 2;
        } catch {
          return 0;
        }
      }
      /**
       * Clean expired entries
       */
      cleanExpired() {
        let cleaned = 0;
        const now = /* @__PURE__ */ new Date();
        for (const [key, entry] of this.cache) {
          if (entry.expiresAt && entry.expiresAt < now) {
            this.delete(key);
            cleaned++;
          }
        }
        return cleaned;
      }
    };
  }
});

// src/config/index.ts
function getConfig() {
  return Object.freeze({ ...activeConfig });
}
function validateConfig(config) {
  if (config.maxThoughtsInMemory < 1) {
    throw new Error("maxThoughtsInMemory must be at least 1");
  }
  if (config.compressionThreshold < 0) {
    throw new Error("compressionThreshold must be non-negative");
  }
  if (config.maxContentLength < 1) {
    throw new Error("maxContentLength must be at least 1");
  }
  if (config.validationTolerance < 0 || config.validationTolerance > 1) {
    throw new Error("validationTolerance must be between 0 and 1");
  }
  if (config.maxActiveSessions < 1) {
    throw new Error("maxActiveSessions must be at least 1");
  }
  if (config.sessionTimeoutMs < 0) {
    throw new Error("sessionTimeoutMs must be non-negative");
  }
  if (config.validationCacheMaxSize < 0) {
    throw new Error("validationCacheMaxSize must be non-negative");
  }
  if (!["debug", "info", "warn", "error"].includes(config.logLevel)) {
    throw new Error("logLevel must be one of: debug, info, warn, error");
  }
}
var defaultConfig, activeConfig;
var init_config = __esm({
  "src/config/index.ts"() {
    init_esm_shims();
    defaultConfig = {
      maxThoughtsInMemory: parseInt(process.env.MCP_MAX_THOUGHTS || "1000", 10),
      compressionThreshold: parseInt(process.env.MCP_COMPRESSION_THRESHOLD || "500", 10),
      maxContentLength: parseInt(process.env.MCP_MAX_CONTENT_LENGTH || "10000", 10),
      validationTolerance: parseFloat(process.env.MCP_VALIDATION_TOLERANCE || "0.01"),
      maxActiveSessions: parseInt(process.env.MCP_MAX_SESSIONS || "100", 10),
      sessionTimeoutMs: parseInt(process.env.MCP_SESSION_TIMEOUT_MS || "0", 10),
      enableValidationCache: process.env.MCP_ENABLE_VALIDATION_CACHE !== "false",
      validationCacheMaxSize: parseInt(process.env.MCP_VALIDATION_CACHE_SIZE || "1000", 10),
      enablePersistence: process.env.MCP_ENABLE_PERSISTENCE === "true",
      persistenceDir: process.env.MCP_PERSISTENCE_DIR || "./.deepthinking-sessions",
      logLevel: process.env.MCP_LOG_LEVEL || "info",
      enablePerformanceMetrics: process.env.MCP_ENABLE_PERF_METRICS === "true"
    };
    activeConfig = { ...defaultConfig };
    validateConfig(activeConfig);
    getConfig();
  }
});
var ValidationCache, validationCache;
var init_cache = __esm({
  "src/validation/cache.ts"() {
    init_esm_shims();
    init_config();
    ValidationCache = class {
      cache;
      maxSize;
      hits = 0;
      misses = 0;
      constructor(maxSize) {
        const config = getConfig();
        this.maxSize = maxSize || config.validationCacheMaxSize;
        this.cache = /* @__PURE__ */ new Map();
      }
      /**
       * Generate a cache key from thought content
       *
       * Uses SHA-256 hash of JSON-serialized content for reliable cache keys
       *
       * @param content - Content to hash
       * @returns Cache key
       */
      generateKey(content) {
        const json = JSON.stringify(content);
        return createHash("sha256").update(json).digest("hex");
      }
      /**
       * Get validation result from cache
       *
       * @param content - Content to look up
       * @returns Cached result or undefined if not found
       */
      get(content) {
        const key = this.generateKey(content);
        const entry = this.cache.get(key);
        if (entry) {
          this.hits++;
          entry.hitCount++;
          this.cache.delete(key);
          this.cache.set(key, entry);
          return entry;
        }
        this.misses++;
        return void 0;
      }
      /**
       * Store validation result in cache
       *
       * @param content - Content that was validated
       * @param result - Validation result to cache
       */
      set(content, result) {
        const key = this.generateKey(content);
        if (this.cache.size >= this.maxSize) {
          const firstKey = this.cache.keys().next().value;
          if (firstKey !== void 0) {
            this.cache.delete(firstKey);
          }
        }
        const entry = {
          result,
          timestamp: Date.now(),
          hitCount: 0
        };
        this.cache.set(key, entry);
      }
      /**
       * Check if content is in cache
       *
       * @param content - Content to check
       * @returns true if cached
       */
      has(content) {
        const key = this.generateKey(content);
        return this.cache.has(key);
      }
      /**
       * Clear all cached validation results
       */
      clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
      }
      /**
       * Get cache statistics
       */
      getStats() {
        const total = this.hits + this.misses;
        return {
          size: this.cache.size,
          maxSize: this.maxSize,
          hits: this.hits,
          misses: this.misses,
          hitRate: total > 0 ? this.hits / total : 0
        };
      }
      /**
       * Resize the cache
       *
       * @param newSize - New maximum cache size
       */
      resize(newSize) {
        this.maxSize = newSize;
        if (this.cache.size > newSize) {
          const keysToDelete = this.cache.size - newSize;
          const keys = Array.from(this.cache.keys());
          for (let i = 0; i < keysToDelete; i++) {
            this.cache.delete(keys[i]);
          }
        }
      }
      /**
       * Get entries sorted by hit count (most used first)
       */
      getTopEntries(limit = 10) {
        const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({ key, entry })).sort((a, b) => b.entry.hitCount - a.entry.hitCount);
        return entries.slice(0, limit);
      }
      /**
       * Remove entries older than a certain age
       *
       * @param maxAgeMs - Maximum age in milliseconds
       * @returns Number of entries removed
       */
      evictOld(maxAgeMs) {
        const now = Date.now();
        let removed = 0;
        for (const [key, entry] of this.cache.entries()) {
          if (now - entry.timestamp > maxAgeMs) {
            this.cache.delete(key);
            removed++;
          }
        }
        return removed;
      }
    };
    validationCache = new ValidationCache();
  }
});

// src/session/SessionMetricsCalculator.ts
var SessionMetricsCalculator;
var init_SessionMetricsCalculator = __esm({
  "src/session/SessionMetricsCalculator.ts"() {
    init_esm_shims();
    init_core();
    init_cache();
    SessionMetricsCalculator = class {
      /**
       * Initialize metrics for a new session
       *
       * Creates a fresh metrics object with all counters set to zero
       * and cache statistics initialized.
       *
       * @returns Initialized session metrics
       *
       * @example
       * ```typescript
       * const metrics = calculator.initializeMetrics();
       * session.metrics = metrics;
       * ```
       */
      initializeMetrics() {
        return {
          totalThoughts: 0,
          thoughtsByType: {},
          averageUncertainty: 0,
          revisionCount: 0,
          timeSpent: 0,
          dependencyDepth: 0,
          customMetrics: /* @__PURE__ */ new Map(),
          cacheStats: {
            hits: 0,
            misses: 0,
            hitRate: 0,
            size: 0,
            maxSize: 0
          }
        };
      }
      /**
       * Update session metrics after adding a thought
       *
       * Performs incremental updates using O(1) algorithms for performance.
       * Handles mode-specific metrics for temporal, game theory, and evidential modes.
       *
       * **Performance Optimizations**:
       * - Incremental thoughtsByType counter (O(1) vs O(n) recalculation)
       * - Running average for uncertainty (O(1) vs O(n) recalculation)
       * - Max dependency depth tracking (O(1) comparison)
       *
       * @param session - Session to update (modified in-place)
       * @param thought - Newly added thought
       *
       * @example
       * ```typescript
       * calculator.updateMetrics(session, newThought);
       * console.log(session.metrics.totalThoughts); // Incremented
       * ```
       */
      updateMetrics(session, thought) {
        const metrics = session.metrics;
        metrics.totalThoughts = session.thoughts.length;
        const thoughtType = thought.mode || "unknown";
        metrics.thoughtsByType[thoughtType] = (metrics.thoughtsByType[thoughtType] || 0) + 1;
        if (thought.isRevision) {
          metrics.revisionCount++;
        }
        metrics.timeSpent = session.updatedAt.getTime() - session.createdAt.getTime();
        if ("uncertainty" in thought && typeof thought.uncertainty === "number") {
          const uncertaintyValue = thought.uncertainty;
          const currentSum = metrics._uncertaintySum || 0;
          const currentCount = metrics._uncertaintyCount || 0;
          const newSum = currentSum + uncertaintyValue;
          const newCount = currentCount + 1;
          metrics._uncertaintySum = newSum;
          metrics._uncertaintyCount = newCount;
          metrics.averageUncertainty = newSum / newCount;
        }
        if ("dependencies" in thought && thought.dependencies) {
          const deps = thought.dependencies;
          if (deps && deps.length > metrics.dependencyDepth) {
            metrics.dependencyDepth = deps.length;
          }
        }
        this.updateModeSpecificMetrics(metrics, thought);
        this.updateCacheStats(session);
      }
      /**
       * Update mode-specific custom metrics
       *
       * Calculates and stores metrics unique to specific thinking modes:
       * - Temporal: events, timeline, relations, constraints, intervals
       * - Game Theory: players, strategies, equilibria, game type
       * - Evidential: hypotheses, evidence, belief functions, decisions
       *
       * @param metrics - Session metrics to update
       * @param thought - Thought to analyze
       */
      updateModeSpecificMetrics(metrics, thought) {
        if (isTemporalThought(thought)) {
          if (thought.events) {
            metrics.customMetrics.set("totalEvents", thought.events.length);
          }
          if (thought.timeline) {
            metrics.customMetrics.set("timelineUnit", thought.timeline.timeUnit);
          }
          if (thought.relations) {
            const causalRelations = thought.relations.filter((r) => r.relationType === "causes");
            metrics.customMetrics.set("causalRelations", causalRelations.length);
          }
          if (thought.constraints) {
            metrics.customMetrics.set("temporalConstraints", thought.constraints.length);
          }
          if (thought.intervals) {
            metrics.customMetrics.set("timeIntervals", thought.intervals.length);
          }
        }
        if (isGameTheoryThought(thought)) {
          if (thought.players) {
            metrics.customMetrics.set("numPlayers", thought.players.length);
          }
          if (thought.strategies) {
            metrics.customMetrics.set("totalStrategies", thought.strategies.length);
            const mixedStrategies = thought.strategies.filter((s) => !s.isPure);
            metrics.customMetrics.set("mixedStrategies", mixedStrategies.length);
          }
          if (thought.nashEquilibria) {
            metrics.customMetrics.set("nashEquilibria", thought.nashEquilibria.length);
            const pureEquilibria = thought.nashEquilibria.filter((e) => e.type === "pure");
            metrics.customMetrics.set("pureNashEquilibria", pureEquilibria.length);
          }
          if (thought.dominantStrategies) {
            metrics.customMetrics.set("dominantStrategies", thought.dominantStrategies.length);
          }
          if (thought.game) {
            metrics.customMetrics.set("gameType", thought.game.type);
            metrics.customMetrics.set("isZeroSum", thought.game.isZeroSum);
          }
        }
        if (isEvidentialThought(thought)) {
          if (thought.hypotheses) {
            metrics.customMetrics.set("totalHypotheses", thought.hypotheses.length);
          }
          if (thought.evidence) {
            metrics.customMetrics.set("totalEvidence", thought.evidence.length);
            const avgReliability = thought.evidence.reduce((sum, e) => sum + e.reliability, 0) / thought.evidence.length;
            metrics.customMetrics.set("avgEvidenceReliability", avgReliability);
          }
          if (thought.beliefFunctions) {
            metrics.customMetrics.set("beliefFunctions", thought.beliefFunctions.length);
          }
          if (thought.combinedBelief) {
            metrics.customMetrics.set("hasCombinedBelief", true);
            if (thought.combinedBelief.conflictMass !== void 0) {
              metrics.customMetrics.set("conflictMass", thought.combinedBelief.conflictMass);
            }
          }
          if (thought.decisions) {
            metrics.customMetrics.set("decisions", thought.decisions.length);
          }
        }
      }
      /**
       * Update validation cache statistics in session metrics
       *
       * Retrieves current validation cache statistics and updates the
       * session metrics with the latest values.
       *
       * @param session - Session to update
       *
       * @example
       * ```typescript
       * calculator.updateCacheStats(session);
       * console.log(session.metrics.cacheStats.hitRate); // Updated
       * ```
       */
      updateCacheStats(session) {
        const cacheStats = validationCache.getStats();
        session.metrics.cacheStats = {
          hits: cacheStats.hits,
          misses: cacheStats.misses,
          hitRate: cacheStats.hitRate,
          size: cacheStats.size,
          maxSize: cacheStats.maxSize
        };
      }
    };
  }
});

// src/services/MetaMonitor.ts
var MetaMonitor, metaMonitor;
var init_MetaMonitor = __esm({
  "src/services/MetaMonitor.ts"() {
    init_esm_shims();
    MetaMonitor = class {
      sessionHistory = /* @__PURE__ */ new Map();
      currentStrategies = /* @__PURE__ */ new Map();
      modeTransitions = /* @__PURE__ */ new Map();
      /**
       * Record a thought in session history
       */
      recordThought(sessionId, thought) {
        if (!this.sessionHistory.has(sessionId)) {
          this.sessionHistory.set(sessionId, []);
        }
        const history = this.sessionHistory.get(sessionId);
        history.push({
          thoughtId: thought.id,
          mode: thought.mode,
          timestamp: thought.timestamp,
          content: thought.content,
          uncertainty: "uncertainty" in thought ? thought.uncertainty : void 0
        });
        if (!this.modeTransitions.has(sessionId)) {
          this.modeTransitions.set(sessionId, []);
        }
        const transitions = this.modeTransitions.get(sessionId);
        if (transitions.length === 0 || transitions[transitions.length - 1] !== thought.mode) {
          transitions.push(thought.mode);
        }
      }
      /**
       * Start tracking a new strategy
       */
      startStrategy(sessionId, mode) {
        this.currentStrategies.set(sessionId, {
          mode,
          thoughtsSpent: 0,
          startTime: /* @__PURE__ */ new Date(),
          progressIndicators: [],
          issuesEncountered: []
        });
      }
      /**
       * Update current strategy progress
       */
      updateStrategyProgress(sessionId, indicator) {
        const strategy = this.currentStrategies.get(sessionId);
        if (strategy) {
          strategy.progressIndicators.push(indicator);
          strategy.thoughtsSpent++;
        }
      }
      /**
       * Record an issue with current strategy
       */
      recordStrategyIssue(sessionId, issue) {
        const strategy = this.currentStrategies.get(sessionId);
        if (strategy) {
          strategy.issuesEncountered.push(issue);
        }
      }
      /**
       * Evaluate current strategy effectiveness
       */
      evaluateStrategy(sessionId) {
        const strategy = this.currentStrategies.get(sessionId);
        if (!strategy) {
          return {
            effectiveness: 0.5,
            efficiency: 0.5,
            confidence: 0.5,
            progressRate: 0,
            qualityScore: 0.5,
            issues: ["No active strategy being tracked"],
            strengths: []
          };
        }
        const thoughtsSpent = strategy.thoughtsSpent;
        const progressMade = strategy.progressIndicators.length;
        const issuesCount = strategy.issuesEncountered.length;
        const timeElapsed = (/* @__PURE__ */ new Date()).getTime() - strategy.startTime.getTime();
        const effectiveness = Math.min(1, progressMade / Math.max(1, thoughtsSpent));
        const efficiency = timeElapsed > 0 ? Math.min(1, progressMade / (timeElapsed / 6e4)) : 0.5;
        const confidence = Math.max(0.1, 1 - issuesCount * 0.15);
        const progressRate = thoughtsSpent > 0 ? progressMade / thoughtsSpent : 0;
        const qualityScore = effectiveness * 0.4 + efficiency * 0.2 + confidence * 0.4;
        return {
          effectiveness,
          efficiency,
          confidence,
          progressRate,
          qualityScore,
          issues: [...strategy.issuesEncountered],
          strengths: strategy.progressIndicators.slice(-3)
          // Recent progress
        };
      }
      /**
       * Suggest alternative strategies based on current performance
       */
      suggestAlternatives(sessionId, currentMode) {
        const evaluation = this.evaluateStrategy(sessionId);
        const alternatives = [];
        if (evaluation.effectiveness < 0.4) {
          if (currentMode !== "hybrid" /* HYBRID */) {
            alternatives.push({
              mode: "hybrid" /* HYBRID */,
              reasoning: "Low effectiveness detected - hybrid multi-modal approach may provide better results",
              expectedBenefit: "Combines multiple reasoning types for comprehensive analysis",
              switchingCost: 0.3,
              recommendationScore: 0.85
            });
          }
          if (currentMode !== "inductive" /* INDUCTIVE */) {
            alternatives.push({
              mode: "inductive" /* INDUCTIVE */,
              reasoning: "Consider gathering more empirical observations",
              expectedBenefit: "Build stronger generalizations from specific cases",
              switchingCost: 0.2,
              recommendationScore: 0.7
            });
          }
        }
        if (evaluation.effectiveness >= 0.4 && evaluation.efficiency < 0.5) {
          alternatives.push({
            mode: currentMode,
            // Same mode, but recommend refinement
            reasoning: "Progress detected but efficiency is low - consider refining current approach",
            expectedBenefit: "Improved efficiency while maintaining progress",
            switchingCost: 0.1,
            recommendationScore: 0.65
          });
        }
        return alternatives;
      }
      /**
       * Calculate quality metrics for current session
       */
      calculateQualityMetrics(sessionId) {
        const history = this.sessionHistory.get(sessionId) || [];
        const strategy = this.currentStrategies.get(sessionId);
        if (history.length === 0) {
          return {
            logicalConsistency: 0.5,
            evidenceQuality: 0.5,
            completeness: 0.5,
            originality: 0.5,
            clarity: 0.5,
            overallQuality: 0.5
          };
        }
        const issuesCount = strategy?.issuesEncountered.length || 0;
        const logicalConsistency = Math.max(0.1, 1 - issuesCount * 0.1);
        const avgUncertainty = history.reduce((sum, entry) => sum + (entry.uncertainty || 0.5), 0) / history.length;
        const evidenceQuality = 1 - avgUncertainty;
        const completeness = Math.min(1, history.length / 5);
        const uniqueModes = new Set(history.map((h) => h.mode)).size;
        const originality = Math.min(1, uniqueModes / 3);
        const progressCount = strategy?.progressIndicators.length || 0;
        const clarity = Math.min(1, progressCount / Math.max(1, history.length));
        const overallQuality = logicalConsistency * 0.25 + evidenceQuality * 0.2 + completeness * 0.15 + originality * 0.15 + clarity * 0.25;
        return {
          logicalConsistency,
          evidenceQuality,
          completeness,
          originality,
          clarity,
          overallQuality
        };
      }
      /**
       * Get session context for meta-reasoning
       */
      getSessionContext(sessionId, problemType) {
        const history = this.sessionHistory.get(sessionId) || [];
        const transitions = this.modeTransitions.get(sessionId) || [];
        return {
          sessionId,
          totalThoughts: history.length,
          modesUsed: transitions,
          modeSwitches: Math.max(0, transitions.length - 1),
          problemType,
          historicalEffectiveness: this.getHistoricalEffectiveness(problemType)
        };
      }
      /**
       * Get historical effectiveness for similar problems (simplified)
       */
      getHistoricalEffectiveness(_problemType) {
        return void 0;
      }
      /**
       * Clear session data (for cleanup)
       */
      clearSession(sessionId) {
        this.sessionHistory.delete(sessionId);
        this.currentStrategies.delete(sessionId);
        this.modeTransitions.delete(sessionId);
      }
      /**
       * Get all tracked sessions
       */
      getActiveSessions() {
        return Array.from(this.sessionHistory.keys());
      }
    };
    metaMonitor = new MetaMonitor();
  }
});
var DEFAULT_CONFIG2, SessionManager;
var init_manager = __esm({
  "src/session/manager.ts"() {
    init_esm_shims();
    init_errors();
    init_sanitization();
    init_logger();
    init_lru();
    init_SessionMetricsCalculator();
    init_MetaMonitor();
    DEFAULT_CONFIG2 = {
      modeConfig: {
        mode: "hybrid" /* HYBRID */,
        strictValidation: false,
        allowModeSwitch: true
      },
      enableAutoSave: true,
      enableValidation: true,
      enableVisualization: true,
      integrations: {},
      exportFormats: ["markdown", "latex", "json"],
      autoExportOnComplete: false,
      maxThoughtsInMemory: 1e3,
      compressionThreshold: 500
    };
    SessionManager = class {
      activeSessions;
      config;
      logger;
      storage;
      metricsCalculator;
      monitor;
      /**
       * Creates a new SessionManager instance
       *
       * @param config - Optional default configuration applied to all new sessions
       * @param logger - Optional logger instance or log level (default: INFO level logger)
       * @param storage - Optional persistent storage backend for sessions
       * @param monitor - Optional MetaMonitor instance for dependency injection
       *
       * @example
       * ```typescript
       * // Memory-only mode with default logger
       * const manager = new SessionManager({
       *   enableAutoSave: true,
       *   maxThoughtsInMemory: 500
       * });
       *
       * // With custom logger (DI)
       * import { createLogger, LogLevel } from './utils/logger.js';
       * const logger = createLogger({ minLevel: LogLevel.DEBUG });
       * const manager = new SessionManager({}, logger);
       *
       * // With file-based persistence (backward compatible)
       * import { FileSessionStore } from './storage/file-store.js';
       * const storage = new FileSessionStore('./sessions');
       * await storage.initialize();
       * const manager = new SessionManager({}, LogLevel.INFO, storage);
       * ```
       */
      constructor(config, logger2, storage, monitor) {
        this.activeSessions = new LRUCache({
          maxSize: 1e3,
          enableStats: true,
          onEvict: async (key, session) => {
            if (this.storage && session.config.enableAutoSave) {
              try {
                await this.storage.saveSession(session);
                this.logger.debug("Evicted session saved to storage", { sessionId: key });
              } catch (error) {
                this.logger.error("Failed to save evicted session", error, { sessionId: key });
              }
            }
            if (this.monitor) {
              this.monitor.clearSession(key);
            }
          }
        });
        this.config = config || {};
        this.storage = storage;
        this.monitor = monitor || metaMonitor;
        if (logger2 && typeof logger2 === "object" && "info" in logger2) {
          this.logger = logger2;
        } else {
          this.logger = createLogger({
            minLevel: logger2 || 1 /* INFO */,
            enableConsole: true
          });
        }
        this.metricsCalculator = new SessionMetricsCalculator();
      }
      /**
       * Create a new thinking session
       *
       * Creates and initializes a new thinking session with the specified configuration.
       * Sessions are stored in memory and tracked until explicitly deleted.
       *
       * @param options - Session creation options
       * @param options.title - Session title (default: 'Untitled Session')
       * @param options.mode - Thinking mode to use (default: HYBRID)
       * @param options.domain - Problem domain (e.g., 'mathematics', 'physics')
       * @param options.author - Session creator/author
       * @param options.config - Session-specific configuration overrides
       * @returns Promise resolving to the created session
       *
       * @example
       * ```typescript
       * const session = await manager.createSession({
       *   title: 'Mathematical Proof',
       *   mode: ThinkingMode.MATHEMATICS,
       *   domain: 'number-theory',
       *   author: 'user@example.com'
       * });
       * ```
       */
      async createSession(options = {}) {
        const title = options.title ? sanitizeString(options.title, MAX_LENGTHS.TITLE, "title") : "Untitled Session";
        const domain = options.domain ? sanitizeString(options.domain, MAX_LENGTHS.DOMAIN, "domain") : void 0;
        const author = options.author ? sanitizeString(options.author, MAX_LENGTHS.AUTHOR, "author") : void 0;
        const sessionId = randomUUID();
        const now = /* @__PURE__ */ new Date();
        const session = {
          id: sessionId,
          title,
          mode: options.mode || "hybrid" /* HYBRID */,
          domain,
          config: this.mergeConfig(options.config),
          thoughts: [],
          createdAt: now,
          updatedAt: now,
          author,
          currentThoughtNumber: 0,
          isComplete: false,
          metrics: this.metricsCalculator.initializeMetrics(),
          tags: [],
          collaborators: author ? [author] : []
        };
        this.activeSessions.set(sessionId, session);
        if (this.storage && session.config.enableAutoSave) {
          try {
            await this.storage.saveSession(session);
            this.logger.debug("Session persisted to storage", { sessionId });
          } catch (error) {
            this.logger.error("Failed to persist session", error, { sessionId });
          }
        }
        this.monitor.startStrategy(sessionId, session.mode);
        this.logger.info("Session created", {
          sessionId,
          title,
          mode: session.mode,
          domain,
          author
        });
        return session;
      }
      /**
       * Get a session by ID
       *
       * Retrieves a session by its unique identifier. If the session is not in memory
       * but storage is available, it will attempt to load from storage.
       *
       * @param sessionId - Unique UUID v4 identifier of the session
       * @returns Promise resolving to the session, or null if not found
       *
       * @example
       * ```typescript
       * const session = await manager.getSession('550e8400-e29b-41d4-a716-446655440000');
       * if (session) {
       *   console.log(`Session: ${session.title}`);
       *   console.log(`Thoughts: ${session.thoughts.length}`);
       * }
       * ```
       */
      async getSession(sessionId) {
        let session = this.activeSessions.get(sessionId);
        if (!session && this.storage) {
          try {
            session = await this.storage.loadSession(sessionId) ?? void 0;
            if (session) {
              this.activeSessions.set(sessionId, session);
              this.logger.debug("Session loaded from storage", { sessionId });
            }
          } catch (error) {
            this.logger.error("Failed to load session from storage", error, { sessionId });
          }
        }
        return session || null;
      }
      /**
       * Add a thought to a session
       *
       * Adds a new thought to an existing session and automatically updates:
       * - Session metrics (uses O(1) incremental calculation)
       * - Thought timestamps
       * - Session completion status
       * - Mode-specific analytics
       *
       * @param sessionId - ID of the session to add thought to
       * @param thought - The thought object to add
       * @returns Promise resolving to the updated session
       * @throws Error if session is not found
       *
       * @example
       * ```typescript
       * await manager.addThought(session.id, {
       *   thought: 'Initial hypothesis: the problem can be solved using...',
       *   thoughtNumber: 1,
       *   totalThoughts: 5,
       *   nextThoughtNeeded: true,
       *   uncertainty: 0.3
       * });
       * ```
       */
      async addThought(sessionId, thought) {
        validateSessionId(sessionId);
        const session = this.activeSessions.get(sessionId);
        if (!session) {
          this.logger.error("Session not found", void 0, { sessionId });
          throw new SessionNotFoundError(sessionId);
        }
        if (thought.content) {
          thought.content = sanitizeThoughtContent(thought.content);
        }
        thought.sessionId = sessionId;
        thought.timestamp = /* @__PURE__ */ new Date();
        session.thoughts.push(thought);
        session.currentThoughtNumber = thought.thoughtNumber;
        session.updatedAt = /* @__PURE__ */ new Date();
        this.metricsCalculator.updateMetrics(session, thought);
        this.monitor.recordThought(sessionId, thought);
        if (!thought.nextThoughtNeeded) {
          session.isComplete = true;
          this.logger.info("Session completed", {
            sessionId,
            title: session.title,
            totalThoughts: session.thoughts.length
          });
        }
        if (this.storage && session.config.enableAutoSave) {
          try {
            await this.storage.saveSession(session);
            this.logger.debug("Session persisted after thought added", { sessionId });
          } catch (error) {
            this.logger.error("Failed to persist session", error, { sessionId });
          }
        }
        this.logger.debug("Thought added", {
          sessionId,
          thoughtNumber: thought.thoughtNumber,
          totalThoughts: session.thoughts.length
        });
        return session;
      }
      /**
       * Update session mode (switch reasoning approach mid-session)
       *
       * Changes the thinking mode of an active session. This is useful when
       * the problem requires a different reasoning approach.
       *
       * @param sessionId - ID of the session to update
       * @param newMode - New thinking mode to switch to
       * @param reason - Optional reason for the mode switch
       * @returns Promise resolving to the updated session
       * @throws Error if session is not found
       *
       * @example
       * ```typescript
       * await manager.switchMode(
       *   session.id,
       *   ThinkingMode.CAUSAL,
       *   'Need to analyze cause-effect relationships'
       * );
       * ```
       */
      async switchMode(sessionId, newMode, reason) {
        validateSessionId(sessionId);
        const session = this.activeSessions.get(sessionId);
        if (!session) {
          this.logger.error("Session not found", void 0, { sessionId });
          throw new SessionNotFoundError(sessionId);
        }
        const oldMode = session.mode;
        session.mode = newMode;
        session.config.modeConfig.mode = newMode;
        session.updatedAt = /* @__PURE__ */ new Date();
        if (this.storage && session.config.enableAutoSave) {
          try {
            await this.storage.saveSession(session);
            this.logger.debug("Session persisted after mode switch", { sessionId });
          } catch (error) {
            this.logger.error("Failed to persist session", error, { sessionId });
          }
        }
        this.logger.info("Session mode switched", {
          sessionId,
          oldMode,
          newMode,
          reason
        });
        return session;
      }
      /**
       * List all active sessions with metadata
       *
       * Returns summary information for all sessions. If storage is available,
       * includes both in-memory sessions and persisted sessions.
       *
       * @param includeStoredSessions - Whether to include sessions from storage (default: true)
       * @returns Promise resolving to array of session metadata
       *
       * @example
       * ```typescript
       * const sessions = await manager.listSessions();
       * sessions.forEach(s => {
       *   console.log(`${s.title}: ${s.thoughtCount} thoughts (${s.mode})`);
       * });
       * ```
       */
      async listSessions(includeStoredSessions = true) {
        const memoryMetadata = Array.from(this.activeSessions.values()).map((session) => ({
          id: session.id,
          title: session.title,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          thoughtCount: session.thoughts.length,
          mode: session.mode,
          isComplete: session.isComplete
        }));
        if (!this.storage || !includeStoredSessions) {
          return memoryMetadata;
        }
        try {
          const storedMetadata = await this.storage.listSessions();
          const memoryIds = new Set(memoryMetadata.map((s) => s.id));
          const combined = [
            ...memoryMetadata,
            ...storedMetadata.filter((s) => !memoryIds.has(s.id))
          ];
          return combined;
        } catch (error) {
          this.logger.error("Failed to list stored sessions", error);
          return memoryMetadata;
        }
      }
      /**
       * Delete a session
       *
       * Removes a session from memory and storage (if available).
       * This operation cannot be undone.
       *
       * @param sessionId - ID of the session to delete
       * @returns Promise that resolves when deletion is complete
       *
       * @example
       * ```typescript
       * await manager.deleteSession('old-session-id');
       * ```
       */
      async deleteSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        const deletedFromMemory = this.activeSessions.delete(sessionId);
        if (this.storage) {
          try {
            await this.storage.deleteSession(sessionId);
            this.logger.debug("Session deleted from storage", { sessionId });
          } catch (error) {
            this.logger.error("Failed to delete session from storage", error, { sessionId });
          }
        }
        if (deletedFromMemory && session) {
          this.logger.info("Session deleted", {
            sessionId,
            title: session.title,
            thoughtCount: session.thoughts.length
          });
        } else {
          this.logger.warn("Attempted to delete non-existent session from memory", { sessionId });
        }
      }
      /**
       * Generate a text summary of a session
       *
       * Creates a markdown-formatted summary including:
       * - Session metadata (title, mode, status)
       * - Total thought count
       * - Key thoughts (first 100 characters of each)
       *
       * @param sessionId - ID of the session to summarize
       * @returns Promise resolving to markdown-formatted summary
       * @throws Error if session is not found
       *
       * @example
       * ```typescript
       * const summary = await manager.generateSummary(session.id);
       * console.log(summary);
       * // Output:
       * // # Mathematical Proof
       * // Mode: mathematics
       * // Total Thoughts: 15
       * // Status: Complete
       * // ...
       * ```
       */
      async generateSummary(sessionId) {
        validateSessionId(sessionId);
        const session = this.activeSessions.get(sessionId);
        if (!session) {
          throw new SessionNotFoundError(sessionId);
        }
        let summary = `# ${session.title}

`;
        summary += `Mode: ${session.mode}
`;
        summary += `Total Thoughts: ${session.thoughts.length}
`;
        summary += `Status: ${session.isComplete ? "Complete" : "In Progress"}

`;
        summary += `## Key Thoughts:

`;
        for (const thought of session.thoughts) {
          summary += `${thought.thoughtNumber}. ${thought.content.substring(0, 100)}...
`;
        }
        return summary;
      }
      /**
       * Merge configurations (private helper)
       *
       * Combines default config, instance config, and user config
       * with proper precedence: user > instance > default
       */
      mergeConfig(userConfig) {
        return {
          ...DEFAULT_CONFIG2,
          ...this.config,
          ...userConfig
        };
      }
    };
  }
});

// src/session/index.ts
var session_exports = {};
__export(session_exports, {
  SessionManager: () => SessionManager
});
var init_session2 = __esm({
  "src/session/index.ts"() {
    init_esm_shims();
    init_manager();
  }
});

// src/utils/type-guards.ts
function isExtendedThoughtType(value) {
  return typeof value === "string" && VALID_THOUGHT_TYPES.includes(value);
}
function toExtendedThoughtType(value, fallback) {
  if (isExtendedThoughtType(value)) {
    return value;
  }
  if (fallback !== void 0) {
    return fallback;
  }
  throw new Error(
    `Invalid ExtendedThoughtType: ${value}. Must be one of: ${VALID_THOUGHT_TYPES.join(", ")}`
  );
}
var VALID_THOUGHT_TYPES;
var init_type_guards = __esm({
  "src/utils/type-guards.ts"() {
    init_esm_shims();
    VALID_THOUGHT_TYPES = [
      "problem_definition",
      "constraints",
      "model",
      "proof",
      "implementation",
      "axiom_definition",
      "theorem_statement",
      "proof_construction",
      "lemma_derivation",
      "corollary",
      "counterexample",
      "algebraic_manipulation",
      "symbolic_computation",
      "numerical_analysis",
      "symmetry_analysis",
      "gauge_theory",
      "field_equations",
      "lagrangian",
      "hamiltonian",
      "conservation_law",
      "dimensional_analysis",
      "tensor_formulation",
      "differential_geometry",
      "decomposition",
      "synthesis",
      "abstraction",
      "analogy",
      "metacognition"
    ];
  }
});
var ThoughtFactory;
var init_ThoughtFactory = __esm({
  "src/services/ThoughtFactory.ts"() {
    init_esm_shims();
    init_type_guards();
    init_logger();
    ThoughtFactory = class {
      logger;
      constructor(logger2) {
        this.logger = logger2 || createLogger({ minLevel: 1 /* INFO */, enableConsole: true });
      }
      /**
       * Create a thought object based on input and mode
       *
       * Generates a properly typed thought object with mode-specific fields
       * and default values. Each mode has unique required and optional fields.
       *
       * @param input - Thought input from MCP tool
       * @param sessionId - Session ID this thought belongs to
       * @returns Typed thought object ready for session storage
       *
       * @example
       * ```typescript
       * const thought = factory.createThought({
       *   mode: 'mathematics',
       *   thought: 'Analyzing the problem...',
       *   thoughtNumber: 1,
       *   totalThoughts: 5,
       *   nextThoughtNeeded: true,
       *   mathematicalModel: { equations: ['E = mc^2'] }
       * }, 'session-123');
       * ```
       */
      createThought(input, sessionId) {
        this.logger.debug("Creating thought", {
          sessionId,
          mode: input.mode,
          thoughtNumber: input.thoughtNumber,
          totalThoughts: input.totalThoughts,
          isRevision: input.isRevision
        });
        const baseThought = {
          id: randomUUID(),
          sessionId,
          thoughtNumber: input.thoughtNumber,
          totalThoughts: input.totalThoughts,
          content: input.thought,
          timestamp: /* @__PURE__ */ new Date(),
          nextThoughtNeeded: input.nextThoughtNeeded,
          isRevision: input.isRevision,
          revisesThought: input.revisesThought
        };
        switch (input.mode) {
          case "sequential":
            return {
              ...baseThought,
              mode: "sequential" /* SEQUENTIAL */,
              revisionReason: input.revisionReason,
              branchFrom: input.branchFrom,
              branchId: input.branchId
            };
          case "shannon":
            return {
              ...baseThought,
              mode: "shannon" /* SHANNON */,
              stage: input.stage || "problem_definition" /* PROBLEM_DEFINITION */,
              uncertainty: input.uncertainty || 0.5,
              dependencies: input.dependencies || [],
              assumptions: input.assumptions || []
            };
          case "mathematics":
            return {
              ...baseThought,
              mode: "mathematics" /* MATHEMATICS */,
              thoughtType: toExtendedThoughtType(input.thoughtType, "model"),
              mathematicalModel: input.mathematicalModel,
              proofStrategy: input.proofStrategy,
              dependencies: input.dependencies || [],
              assumptions: input.assumptions || [],
              uncertainty: input.uncertainty || 0.5
            };
          case "physics":
            return {
              ...baseThought,
              mode: "physics" /* PHYSICS */,
              thoughtType: toExtendedThoughtType(input.thoughtType, "model"),
              tensorProperties: input.tensorProperties,
              physicalInterpretation: input.physicalInterpretation,
              dependencies: input.dependencies || [],
              assumptions: input.assumptions || [],
              uncertainty: input.uncertainty || 0.5
            };
          case "inductive":
            return {
              ...baseThought,
              mode: "inductive" /* INDUCTIVE */,
              observations: input.observations || [],
              pattern: input.pattern,
              generalization: input.generalization || "",
              confidence: input.confidence ?? 0.5,
              counterexamples: input.counterexamples || [],
              sampleSize: input.sampleSize
            };
          case "deductive":
            return {
              ...baseThought,
              mode: "deductive" /* DEDUCTIVE */,
              premises: input.premises || [],
              conclusion: input.conclusion || "",
              logicForm: input.logicForm,
              validityCheck: input.validityCheck ?? false,
              soundnessCheck: input.soundnessCheck
            };
          case "abductive":
            return {
              ...baseThought,
              mode: "abductive" /* ABDUCTIVE */,
              thoughtType: toExtendedThoughtType(input.thoughtType, "problem_definition"),
              observations: input.observations || [],
              hypotheses: input.hypotheses || [],
              evaluationCriteria: input.evaluationCriteria,
              evidence: input.evidence || [],
              bestExplanation: input.bestExplanation
            };
          case "causal":
            const inputAny = input;
            const causalGraph = input.causalGraph || {
              nodes: inputAny.nodes || [],
              edges: inputAny.edges || []
            };
            return {
              ...baseThought,
              mode: "causal" /* CAUSAL */,
              thoughtType: toExtendedThoughtType(input.thoughtType, "problem_definition"),
              causalGraph,
              interventions: input.interventions || [],
              mechanisms: input.mechanisms || [],
              confounders: input.confounders || []
            };
          case "bayesian":
            return {
              ...baseThought,
              mode: "bayesian" /* BAYESIAN */,
              thoughtType: toExtendedThoughtType(input.thoughtType, "problem_definition"),
              hypothesis: input.hypothesis,
              prior: input.prior,
              likelihood: input.likelihood,
              evidence: input.evidence || [],
              posterior: input.posterior,
              bayesFactor: input.bayesFactor
            };
          case "counterfactual":
            return {
              ...baseThought,
              mode: "counterfactual" /* COUNTERFACTUAL */,
              thoughtType: toExtendedThoughtType(input.thoughtType, "problem_definition"),
              actual: input.actual,
              counterfactuals: input.counterfactuals || [],
              comparison: input.comparison,
              interventionPoint: input.interventionPoint,
              causalChains: input.causalChains || []
            };
          case "analogical":
            return {
              ...baseThought,
              mode: "analogical" /* ANALOGICAL */,
              thoughtType: toExtendedThoughtType(input.thoughtType, "analogy"),
              sourceDomain: input.sourceDomain,
              targetDomain: input.targetDomain,
              mapping: input.mapping || [],
              insights: input.insights || [],
              inferences: input.inferences || [],
              limitations: input.limitations || [],
              analogyStrength: input.analogyStrength
            };
          case "temporal":
            return {
              ...baseThought,
              mode: "temporal" /* TEMPORAL */,
              thoughtType: input.thoughtType || "event_definition",
              timeline: input.timeline,
              events: input.events || [],
              intervals: input.intervals || [],
              constraints: input.constraints || [],
              relations: input.relations || []
            };
          case "gametheory":
            return {
              ...baseThought,
              mode: "gametheory" /* GAMETHEORY */,
              thoughtType: input.thoughtType || "game_definition",
              game: input.game,
              players: input.players || [],
              strategies: input.strategies || [],
              payoffMatrix: input.payoffMatrix,
              nashEquilibria: input.nashEquilibria || [],
              dominantStrategies: input.dominantStrategies || [],
              gameTree: input.gameTree
            };
          case "evidential":
            return {
              ...baseThought,
              mode: "evidential" /* EVIDENTIAL */,
              thoughtType: input.thoughtType || "hypothesis_definition",
              frameOfDiscernment: input.frameOfDiscernment,
              hypotheses: input.hypotheses || [],
              evidence: input.evidence || [],
              beliefFunctions: input.beliefFunctions || [],
              combinedBelief: input.combinedBelief,
              plausibility: input.plausibility,
              decisions: input.decisions || []
            };
          case "firstprinciples" /* FIRSTPRINCIPLES */:
            return {
              ...baseThought,
              mode: "firstprinciples" /* FIRSTPRINCIPLES */,
              question: input.question || "",
              principles: input.principles || [],
              derivationSteps: input.derivationSteps || [],
              conclusion: input.conclusion || { statement: "", derivationChain: [], certainty: 0 },
              alternativeInterpretations: input.alternativeInterpretations || []
            };
          case "metareasoning": {
            const metaInput = input;
            return {
              ...baseThought,
              mode: "metareasoning" /* METAREASONING */,
              currentStrategy: metaInput.currentStrategy || {
                mode: "sequential" /* SEQUENTIAL */,
                approach: "Default sequential approach",
                startedAt: /* @__PURE__ */ new Date(),
                thoughtsSpent: 0,
                progressIndicators: []
              },
              strategyEvaluation: metaInput.strategyEvaluation || {
                effectiveness: 0.5,
                efficiency: 0.5,
                confidence: 0.5,
                progressRate: 0,
                qualityScore: 0.5,
                issues: [],
                strengths: []
              },
              alternativeStrategies: metaInput.alternativeStrategies || [],
              recommendation: metaInput.recommendation || {
                action: "CONTINUE",
                justification: "No specific recommendation yet",
                confidence: 0.5,
                expectedImprovement: "Monitor progress"
              },
              resourceAllocation: metaInput.resourceAllocation || {
                timeSpent: 0,
                thoughtsRemaining: input.totalThoughts - input.thoughtNumber,
                complexityLevel: "medium",
                urgency: "medium",
                recommendation: "Continue with current approach"
              },
              qualityMetrics: metaInput.qualityMetrics || {
                logicalConsistency: 0.5,
                evidenceQuality: 0.5,
                completeness: 0.5,
                originality: 0.5,
                clarity: 0.5,
                overallQuality: 0.5
              },
              sessionContext: metaInput.sessionContext || {
                sessionId,
                totalThoughts: input.thoughtNumber,
                modesUsed: [input.mode],
                modeSwitches: 0,
                problemType: "general"
              }
            };
          }
          case "hybrid":
          default:
            return {
              ...baseThought,
              mode: "hybrid" /* HYBRID */,
              thoughtType: toExtendedThoughtType(input.thoughtType, "synthesis"),
              stage: input.stage,
              uncertainty: input.uncertainty,
              dependencies: input.dependencies,
              assumptions: input.assumptions,
              mathematicalModel: input.mathematicalModel,
              tensorProperties: input.tensorProperties,
              physicalInterpretation: input.physicalInterpretation,
              primaryMode: input.mode || "hybrid" /* HYBRID */,
              secondaryFeatures: []
            };
        }
      }
    };
  }
});

// src/export/visual/utils.ts
function sanitizeId(id) {
  return id.replace(/[^a-zA-Z0-9_]/g, "_");
}
var init_utils = __esm({
  "src/export/visual/utils.ts"() {
    init_esm_shims();
  }
});

// src/export/visual/causal.ts
function exportCausalGraph(thought, options) {
  const { format, colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  switch (format) {
    case "mermaid":
      return causalGraphToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return causalGraphToDOT(thought, includeLabels, includeMetrics);
    case "ascii":
      return causalGraphToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function causalGraphToMermaid(thought, colorScheme, includeLabels, includeMetrics) {
  let mermaid = "graph TB\n";
  if (!thought.causalGraph || !thought.causalGraph.nodes) {
    return mermaid + '  NoData["No causal graph data"]\n';
  }
  for (const node of thought.causalGraph.nodes) {
    const nodeId = sanitizeId(node.id);
    const label = includeLabels ? node.name : nodeId;
    let shape;
    switch (node.type) {
      case "cause":
        shape = ["([", "])"];
        break;
      case "effect":
        shape = ["[[", "]]"];
        break;
      case "mediator":
        shape = ["[", "]"];
        break;
      case "confounder":
        shape = ["{", "}"];
        break;
      default:
        shape = ["[", "]"];
    }
    mermaid += `  ${nodeId}${shape[0]}${label}${shape[1]}
`;
  }
  mermaid += "\n";
  for (const edge of thought.causalGraph.edges) {
    const fromId = sanitizeId(edge.from);
    const toId = sanitizeId(edge.to);
    if (includeMetrics && edge.strength !== void 0) {
      mermaid += `  ${fromId} --> |${edge.strength.toFixed(2)}| ${toId}
`;
    } else {
      mermaid += `  ${fromId} --> ${toId}
`;
    }
  }
  if (colorScheme !== "monochrome") {
    mermaid += "\n";
    const causes = thought.causalGraph.nodes.filter((n) => n.type === "cause");
    const effects = thought.causalGraph.nodes.filter((n) => n.type === "effect");
    for (const node of causes) {
      const color = colorScheme === "pastel" ? "#e1f5ff" : "#a8d5ff";
      mermaid += `  style ${sanitizeId(node.id)} fill:${color}
`;
    }
    for (const node of effects) {
      const color = colorScheme === "pastel" ? "#fff3e0" : "#ffd699";
      mermaid += `  style ${sanitizeId(node.id)} fill:${color}
`;
    }
  }
  return mermaid;
}
function causalGraphToDOT(thought, includeLabels, includeMetrics) {
  let dot = "digraph CausalGraph {\n";
  dot += "  rankdir=TB;\n";
  dot += "  node [shape=box, style=rounded];\n\n";
  if (!thought.causalGraph || !thought.causalGraph.nodes) {
    dot += '  NoData [label="No causal graph data"];\n}\n';
    return dot;
  }
  for (const node of thought.causalGraph.nodes) {
    const nodeId = sanitizeId(node.id);
    const label = includeLabels ? node.name : nodeId;
    let shape = "box";
    switch (node.type) {
      case "cause":
        shape = "ellipse";
        break;
      case "effect":
        shape = "doubleoctagon";
        break;
      case "mediator":
        shape = "box";
        break;
      case "confounder":
        shape = "diamond";
        break;
    }
    dot += `  ${nodeId} [label="${label}", shape=${shape}];
`;
  }
  dot += "\n";
  for (const edge of thought.causalGraph.edges) {
    const fromId = sanitizeId(edge.from);
    const toId = sanitizeId(edge.to);
    if (includeMetrics && edge.strength !== void 0) {
      dot += `  ${fromId} -> ${toId} [label="${edge.strength.toFixed(2)}"];
`;
    } else {
      dot += `  ${fromId} -> ${toId};
`;
    }
  }
  dot += "}\n";
  return dot;
}
function causalGraphToASCII(thought) {
  let ascii = "Causal Graph:\n";
  ascii += "=============\n\n";
  if (!thought.causalGraph || !thought.causalGraph.nodes) {
    return ascii + "No causal graph data\n";
  }
  ascii += "Nodes:\n";
  for (const node of thought.causalGraph.nodes) {
    ascii += `  [${node.type.toUpperCase()}] ${node.name}: ${node.description}
`;
  }
  ascii += "\nEdges:\n";
  for (const edge of thought.causalGraph.edges) {
    const fromNode = thought.causalGraph.nodes.find((n) => n.id === edge.from);
    const toNode = thought.causalGraph.nodes.find((n) => n.id === edge.to);
    const strength = edge.strength !== void 0 ? ` (strength: ${edge.strength.toFixed(2)})` : "";
    ascii += `  ${fromNode?.name} --> ${toNode?.name}${strength}
`;
  }
  return ascii;
}
var init_causal = __esm({
  "src/export/visual/causal.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/temporal.ts
function exportTemporalTimeline(thought, options) {
  const { format, includeLabels = true } = options;
  switch (format) {
    case "mermaid":
      return timelineToMermaidGantt(thought, includeLabels);
    case "dot":
      return timelineToDOT(thought, includeLabels);
    case "ascii":
      return timelineToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function timelineToMermaidGantt(thought, includeLabels) {
  let gantt = "gantt\n";
  gantt += `  title ${thought.timeline?.name || "Timeline"}
`;
  gantt += "  dateFormat X\n";
  gantt += "  axisFormat %s\n\n";
  if (!thought.events || thought.events.length === 0) {
    return gantt + "  No events\n";
  }
  gantt += "  section Events\n";
  for (const event of thought.events) {
    const label = includeLabels ? event.name : event.id;
    if (event.type === "instant") {
      gantt += `  ${label} :milestone, ${event.timestamp}, 0s
`;
    } else if (event.type === "interval" && event.duration) {
      gantt += `  ${label} :${event.timestamp}, ${event.duration}s
`;
    }
  }
  return gantt;
}
function timelineToDOT(thought, includeLabels) {
  let dot = "digraph Timeline {\n";
  dot += "  rankdir=LR;\n";
  dot += "  node [shape=box];\n\n";
  if (!thought.events) {
    dot += "}\n";
    return dot;
  }
  const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);
  for (const event of sortedEvents) {
    const nodeId = sanitizeId(event.id);
    const label = includeLabels ? `${event.name}\\n(t=${event.timestamp})` : nodeId;
    const shape = event.type === "instant" ? "ellipse" : "box";
    dot += `  ${nodeId} [label="${label}", shape=${shape}];
`;
  }
  dot += "\n";
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const from = sanitizeId(sortedEvents[i].id);
    const to = sanitizeId(sortedEvents[i + 1].id);
    dot += `  ${from} -> ${to};
`;
  }
  if (thought.relations) {
    dot += "\n  // Causal relations\n";
    for (const rel of thought.relations) {
      const from = sanitizeId(rel.from);
      const to = sanitizeId(rel.to);
      dot += `  ${from} -> ${to} [style=dashed, label="${rel.relationType}"];
`;
    }
  }
  dot += "}\n";
  return dot;
}
function timelineToASCII(thought) {
  let ascii = `Timeline: ${thought.timeline?.name || "Untitled"}
`;
  ascii += "=".repeat(40) + "\n\n";
  if (!thought.events || thought.events.length === 0) {
    return ascii + "No events\n";
  }
  const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);
  for (const event of sortedEvents) {
    const marker = event.type === "instant" ? "\u29BF" : "\u2501";
    ascii += `t=${event.timestamp.toString().padStart(4)} ${marker} ${event.name}
`;
    if (event.duration) {
      ascii += `       ${"\u2514".padStart(5)}\u2192 duration: ${event.duration}
`;
    }
  }
  return ascii;
}
var init_temporal = __esm({
  "src/export/visual/temporal.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/game-theory.ts
function exportGameTree(thought, options) {
  const { format, colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  switch (format) {
    case "mermaid":
      return gameTreeToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return gameTreeToDOT(thought, includeLabels, includeMetrics);
    case "ascii":
      return gameTreeToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function gameTreeToMermaid(thought, _colorScheme, includeLabels, includeMetrics) {
  let mermaid = "graph TD\n";
  if (!thought.game) {
    return mermaid + "  root[No game defined]\n";
  }
  if (thought.gameTree && thought.gameTree.nodes) {
    for (const node of thought.gameTree.nodes) {
      const nodeId = sanitizeId(node.id);
      const label = includeLabels ? node.action || node.id : nodeId;
      const shape = node.type === "terminal" ? ["[[", "]]"] : ["[", "]"];
      mermaid += `  ${nodeId}${shape[0]}${label}${shape[1]}
`;
    }
    mermaid += "\n";
    for (const node of thought.gameTree.nodes) {
      if (node.childNodes && node.childNodes.length > 0) {
        for (const childId of node.childNodes) {
          const fromId = sanitizeId(node.id);
          const toId = sanitizeId(childId);
          const childNode = thought.gameTree.nodes.find((n) => n.id === childId);
          if (includeMetrics && childNode?.action) {
            mermaid += `  ${fromId} --> |${childNode.action}| ${toId}
`;
          } else {
            mermaid += `  ${fromId} --> ${toId}
`;
          }
        }
      }
    }
  } else {
    mermaid += "  root[Game]\n";
    if (thought.strategies) {
      for (const strategy of thought.strategies.slice(0, 5)) {
        const stratId = sanitizeId(strategy.id);
        mermaid += `  root --> ${stratId}[${strategy.name}]
`;
      }
    }
  }
  return mermaid;
}
function gameTreeToDOT(thought, includeLabels, includeMetrics) {
  let dot = "digraph GameTree {\n";
  dot += "  rankdir=TD;\n";
  dot += "  node [shape=circle];\n\n";
  if (!thought.game) {
    dot += '  root [label="No game"];\n}\n';
    return dot;
  }
  if (thought.gameTree && thought.gameTree.nodes) {
    for (const node of thought.gameTree.nodes) {
      const nodeId = sanitizeId(node.id);
      const label = includeLabels ? node.action || node.id : nodeId;
      const shape = node.type === "terminal" ? "doublecircle" : "circle";
      dot += `  ${nodeId} [label="${label}", shape=${shape}];
`;
    }
    dot += "\n";
    for (const node of thought.gameTree.nodes) {
      if (node.childNodes && node.childNodes.length > 0) {
        for (const childId of node.childNodes) {
          const fromId = sanitizeId(node.id);
          const toId = sanitizeId(childId);
          const childNode = thought.gameTree.nodes.find((n) => n.id === childId);
          if (includeMetrics && childNode?.action) {
            dot += `  ${fromId} -> ${toId} [label="${childNode.action}"];
`;
          } else {
            dot += `  ${fromId} -> ${toId};
`;
          }
        }
      }
    }
  }
  dot += "}\n";
  return dot;
}
function gameTreeToASCII(thought) {
  let ascii = `Game: ${thought.game?.name || "Untitled"}
`;
  ascii += "=".repeat(40) + "\n\n";
  if (thought.strategies && thought.strategies.length > 0) {
    ascii += "Strategies:\n";
    for (const strategy of thought.strategies) {
      const strategyType = strategy.isPure ? "Pure" : "Mixed";
      ascii += `  \u2022 ${strategy.name} (${strategyType})
`;
    }
  }
  if (thought.nashEquilibria && thought.nashEquilibria.length > 0) {
    ascii += "\nEquilibria:\n";
    for (const eq of thought.nashEquilibria) {
      ascii += `  \u2696 ${eq.type}: ${eq.strategyProfile.join(", ")}
`;
      ascii += `    Payoffs: [${eq.payoffs.join(", ")}]
`;
    }
  }
  return ascii;
}
var init_game_theory = __esm({
  "src/export/visual/game-theory.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/bayesian.ts
function exportBayesianNetwork(thought, options) {
  const { format, colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  switch (format) {
    case "mermaid":
      return bayesianToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return bayesianToDOT(thought, includeLabels, includeMetrics);
    case "ascii":
      return bayesianToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function bayesianToMermaid(thought, colorScheme, _includeLabels, includeMetrics) {
  let mermaid = "graph LR\n";
  mermaid += `  H([Hypothesis])
`;
  mermaid += `  Prior[Prior: ${includeMetrics ? thought.prior.probability.toFixed(3) : "?"}]
`;
  mermaid += `  Evidence[Evidence]
`;
  mermaid += `  Posterior[[Posterior: ${includeMetrics ? thought.posterior.probability.toFixed(3) : "?"}]]
`;
  mermaid += "\n";
  mermaid += "  Prior --> H\n";
  mermaid += "  Evidence --> H\n";
  mermaid += "  H --> Posterior\n";
  if (colorScheme !== "monochrome") {
    mermaid += "\n";
    const priorColor = colorScheme === "pastel" ? "#e1f5ff" : "#a8d5ff";
    const posteriorColor = colorScheme === "pastel" ? "#c8e6c9" : "#81c784";
    mermaid += `  style Prior fill:${priorColor}
`;
    mermaid += `  style Posterior fill:${posteriorColor}
`;
  }
  return mermaid;
}
function bayesianToDOT(thought, _includeLabels, includeMetrics) {
  let dot = "digraph BayesianNetwork {\n";
  dot += "  rankdir=LR;\n";
  dot += "  node [shape=ellipse];\n\n";
  const priorProb = includeMetrics ? `: ${thought.prior.probability.toFixed(3)}` : "";
  const posteriorProb = includeMetrics ? `: ${thought.posterior.probability.toFixed(3)}` : "";
  dot += `  Prior [label="Prior${priorProb}"];
`;
  dot += `  Hypothesis [label="Hypothesis", shape=box];
`;
  dot += `  Evidence [label="Evidence"];
`;
  dot += `  Posterior [label="Posterior${posteriorProb}", shape=doublecircle];
`;
  dot += "\n";
  dot += "  Prior -> Hypothesis;\n";
  dot += "  Evidence -> Hypothesis;\n";
  dot += "  Hypothesis -> Posterior;\n";
  dot += "}\n";
  return dot;
}
function bayesianToASCII(thought) {
  let ascii = "Bayesian Network:\n";
  ascii += "=================\n\n";
  ascii += `Hypothesis: ${thought.hypothesis.statement}

`;
  ascii += `Prior Probability: ${thought.prior.probability.toFixed(3)}
`;
  ascii += `  Justification: ${thought.prior.justification}

`;
  if (thought.evidence && thought.evidence.length > 0) {
    ascii += "Evidence:\n";
    for (const ev of thought.evidence) {
      ascii += `  \u2022 ${ev.description}
`;
    }
    ascii += "\n";
  }
  ascii += `Posterior Probability: ${thought.posterior.probability.toFixed(3)}
`;
  ascii += `  Calculation: ${thought.posterior.calculation}
`;
  if (thought.bayesFactor !== void 0) {
    ascii += `
Bayes Factor: ${thought.bayesFactor.toFixed(2)}
`;
  }
  return ascii;
}
var init_bayesian = __esm({
  "src/export/visual/bayesian.ts"() {
    init_esm_shims();
  }
});

// src/export/visual/sequential.ts
function exportSequentialDependencyGraph(thought, options) {
  const { format, colorScheme = "default", includeLabels = true } = options;
  switch (format) {
    case "mermaid":
      return sequentialToMermaid(thought, colorScheme, includeLabels);
    case "dot":
      return sequentialToDOT(thought, includeLabels);
    case "ascii":
      return sequentialToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function sequentialToMermaid(thought, colorScheme, includeLabels) {
  let mermaid = "graph TD\n";
  const nodeId = sanitizeId(thought.id);
  const label = includeLabels ? thought.content.substring(0, 50) + "..." : nodeId;
  mermaid += `  ${nodeId}["${label}"]
`;
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    mermaid += "\n";
    for (const depId of thought.buildUpon) {
      const depNodeId = sanitizeId(depId);
      mermaid += `  ${depNodeId} --> ${nodeId}
`;
    }
  }
  if (thought.branchFrom) {
    const branchId = sanitizeId(thought.branchFrom);
    mermaid += `  ${branchId} -.->|branch| ${nodeId}
`;
  }
  if (thought.revisesThought) {
    const revisedId = sanitizeId(thought.revisesThought);
    mermaid += `  ${revisedId} ==>|revises| ${nodeId}
`;
  }
  if (colorScheme !== "monochrome") {
    mermaid += "\n";
    const color = thought.isRevision ? colorScheme === "pastel" ? "#fff3e0" : "#ffd699" : colorScheme === "pastel" ? "#e1f5ff" : "#a8d5ff";
    mermaid += `  style ${nodeId} fill:${color}
`;
  }
  return mermaid;
}
function sequentialToDOT(thought, includeLabels) {
  let dot = "digraph SequentialDependency {\n";
  dot += "  rankdir=TD;\n";
  dot += "  node [shape=box, style=rounded];\n\n";
  const nodeId = sanitizeId(thought.id);
  const label = includeLabels ? thought.content.substring(0, 50) + "..." : nodeId;
  dot += `  ${nodeId} [label="${label}"];
`;
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    for (const depId of thought.buildUpon) {
      const depNodeId = sanitizeId(depId);
      dot += `  ${depNodeId} -> ${nodeId};
`;
    }
  }
  if (thought.branchFrom) {
    const branchId = sanitizeId(thought.branchFrom);
    dot += `  ${branchId} -> ${nodeId} [style=dashed, label="branch"];
`;
  }
  if (thought.revisesThought) {
    const revisedId = sanitizeId(thought.revisesThought);
    dot += `  ${revisedId} -> ${nodeId} [style=bold, label="revises"];
`;
  }
  dot += "}\n";
  return dot;
}
function sequentialToASCII(thought) {
  let ascii = "Sequential Dependency Graph:\n";
  ascii += "============================\n\n";
  ascii += `Current Thought: ${thought.id}
`;
  ascii += `Content: ${thought.content.substring(0, 100)}...

`;
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    ascii += "Builds Upon:\n";
    for (const depId of thought.buildUpon) {
      ascii += `  \u2193 ${depId}
`;
    }
    ascii += "\n";
  }
  if (thought.branchFrom) {
    ascii += `Branches From: ${thought.branchFrom}
`;
    if (thought.branchId) {
      ascii += `Branch ID: ${thought.branchId}
`;
    }
    ascii += "\n";
  }
  if (thought.revisesThought) {
    ascii += `Revises: ${thought.revisesThought}
`;
    if (thought.revisionReason) {
      ascii += `Reason: ${thought.revisionReason}
`;
    }
    ascii += "\n";
  }
  return ascii;
}
var init_sequential = __esm({
  "src/export/visual/sequential.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/shannon.ts
function exportShannonStageFlow(thought, options) {
  const { format, colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  switch (format) {
    case "mermaid":
      return shannonToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return shannonToDOT(thought, includeLabels, includeMetrics);
    case "ascii":
      return shannonToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function shannonToMermaid(thought, colorScheme, includeLabels, includeMetrics) {
  let mermaid = "graph LR\n";
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const stageId = sanitizeId(stage);
    const label = includeLabels ? stageLabels[stage] : stageId;
    mermaid += `  ${stageId}["${label}"]
`;
    if (i < stages.length - 1) {
      const nextStageId = sanitizeId(stages[i + 1]);
      mermaid += `  ${stageId} --> ${nextStageId}
`;
    }
  }
  if (colorScheme !== "monochrome") {
    mermaid += "\n";
    const currentStageId = sanitizeId(thought.stage);
    const color = colorScheme === "pastel" ? "#e1f5ff" : "#a8d5ff";
    mermaid += `  style ${currentStageId} fill:${color},stroke:#333,stroke-width:3px
`;
  }
  if (includeMetrics && thought.uncertainty !== void 0) {
    mermaid += `
  uncertainty["Uncertainty: ${thought.uncertainty.toFixed(2)}"]
`;
    mermaid += `  uncertainty -.-> ${sanitizeId(thought.stage)}
`;
  }
  return mermaid;
}
function shannonToDOT(thought, includeLabels, includeMetrics) {
  let dot = "digraph ShannonStageFlow {\n";
  dot += "  rankdir=LR;\n";
  dot += "  node [shape=box, style=rounded];\n\n";
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const stageId = sanitizeId(stage);
    const label = includeLabels ? stageLabels[stage] : stageId;
    const isCurrent = stage === thought.stage;
    const style = isCurrent ? ", style=filled, fillcolor=lightblue" : "";
    dot += `  ${stageId} [label="${label}"${style}];
`;
    if (i < stages.length - 1) {
      const nextStageId = sanitizeId(stages[i + 1]);
      dot += `  ${stageId} -> ${nextStageId};
`;
    }
  }
  if (includeMetrics && thought.uncertainty !== void 0) {
    dot += `
  uncertainty [label="Uncertainty: ${thought.uncertainty.toFixed(2)}", shape=ellipse];
`;
    dot += `  uncertainty -> ${sanitizeId(thought.stage)} [style=dashed];
`;
  }
  dot += "}\n";
  return dot;
}
function shannonToASCII(thought) {
  let ascii = "Shannon Stage Flow:\n";
  ascii += "===================\n\n";
  ascii += "Flow: ";
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const isCurrent = stage === thought.stage;
    if (isCurrent) {
      ascii += `[${stageLabels[stage]}]`;
    } else {
      ascii += stageLabels[stage];
    }
    if (i < stages.length - 1) {
      ascii += " \u2192 ";
    }
  }
  ascii += "\n\n";
  ascii += `Current Stage: ${stageLabels[thought.stage]}
`;
  ascii += `Uncertainty: ${thought.uncertainty.toFixed(2)}
`;
  if (thought.dependencies && thought.dependencies.length > 0) {
    ascii += "\nDependencies:\n";
    for (const dep of thought.dependencies) {
      ascii += `  \u2022 ${dep}
`;
    }
  }
  if (thought.assumptions && thought.assumptions.length > 0) {
    ascii += "\nAssumptions:\n";
    for (const assumption of thought.assumptions) {
      ascii += `  \u2022 ${assumption}
`;
    }
  }
  return ascii;
}
var stages, stageLabels;
var init_shannon = __esm({
  "src/export/visual/shannon.ts"() {
    init_esm_shims();
    init_utils();
    stages = [
      "problem_definition",
      "constraints",
      "model",
      "proof",
      "implementation"
    ];
    stageLabels = {
      problem_definition: "Problem Definition",
      constraints: "Constraints",
      model: "Model",
      proof: "Proof",
      implementation: "Implementation"
    };
  }
});

// src/export/visual/abductive.ts
function exportAbductiveHypotheses(thought, options) {
  const { format, colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  switch (format) {
    case "mermaid":
      return abductiveToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return abductiveToDOT(thought, includeLabels, includeMetrics);
    case "ascii":
      return abductiveToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function abductiveToMermaid(thought, colorScheme, includeLabels, includeMetrics) {
  let mermaid = "graph TD\n";
  mermaid += '  Observations["Observations"]\n';
  for (const hypothesis of thought.hypotheses) {
    const hypId = sanitizeId(hypothesis.id);
    const label = includeLabels ? hypothesis.explanation.substring(0, 50) + "..." : hypId;
    const scoreLabel = includeMetrics ? ` (${hypothesis.score.toFixed(2)})` : "";
    mermaid += `  ${hypId}["${label}${scoreLabel}"]
`;
    mermaid += `  Observations --> ${hypId}
`;
  }
  if (thought.bestExplanation && colorScheme !== "monochrome") {
    mermaid += "\n";
    const bestId = sanitizeId(thought.bestExplanation.id);
    const color = colorScheme === "pastel" ? "#e1f5ff" : "#a8d5ff";
    mermaid += `  style ${bestId} fill:${color},stroke:#333,stroke-width:3px
`;
  }
  return mermaid;
}
function abductiveToDOT(thought, includeLabels, includeMetrics) {
  let dot = "digraph AbductiveHypotheses {\n";
  dot += "  rankdir=TD;\n";
  dot += "  node [shape=box, style=rounded];\n\n";
  dot += '  Observations [label="Observations", shape=ellipse];\n\n';
  for (const hypothesis of thought.hypotheses) {
    const hypId = sanitizeId(hypothesis.id);
    const label = includeLabels ? hypothesis.explanation.substring(0, 50) + "..." : hypId;
    const scoreLabel = includeMetrics ? ` (${hypothesis.score.toFixed(2)})` : "";
    const isBest = thought.bestExplanation?.id === hypothesis.id;
    const style = isBest ? ", style=filled, fillcolor=lightblue" : "";
    dot += `  ${hypId} [label="${label}${scoreLabel}"${style}];
`;
    dot += `  Observations -> ${hypId};
`;
  }
  dot += "}\n";
  return dot;
}
function abductiveToASCII(thought) {
  let ascii = "Abductive Hypothesis Comparison:\n";
  ascii += "================================\n\n";
  ascii += "Observations:\n";
  for (const obs of thought.observations) {
    ascii += `  \u2022 ${obs.description} (confidence: ${obs.confidence.toFixed(2)})
`;
  }
  ascii += "\nHypotheses:\n";
  for (const hypothesis of thought.hypotheses) {
    const isBest = thought.bestExplanation?.id === hypothesis.id;
    const marker = isBest ? "\u2605" : "\u2022";
    ascii += `  ${marker} ${hypothesis.explanation}
`;
    ascii += `    Score: ${hypothesis.score.toFixed(2)}
`;
    ascii += `    Assumptions: ${hypothesis.assumptions.join(", ")}
`;
    ascii += "\n";
  }
  if (thought.bestExplanation) {
    ascii += `Best Explanation: ${thought.bestExplanation.explanation}
`;
  }
  return ascii;
}
var init_abductive = __esm({
  "src/export/visual/abductive.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/counterfactual.ts
function exportCounterfactualScenarios(thought, options) {
  const { format, colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  switch (format) {
    case "mermaid":
      return counterfactualToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return counterfactualToDOT(thought, includeLabels, includeMetrics);
    case "ascii":
      return counterfactualToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function counterfactualToMermaid(thought, colorScheme, includeLabels, includeMetrics) {
  let mermaid = "graph TD\n";
  const interventionId = "intervention";
  mermaid += `  ${interventionId}["${thought.interventionPoint.description}"]
`;
  const actualId = sanitizeId(thought.actual.id);
  const actualLabel = includeLabels ? thought.actual.name : actualId;
  mermaid += `  ${actualId}["Actual: ${actualLabel}"]
`;
  mermaid += `  ${interventionId} -->|no change| ${actualId}
`;
  for (const scenario of thought.counterfactuals) {
    const scenarioId = sanitizeId(scenario.id);
    const label = includeLabels ? scenario.name : scenarioId;
    const likelihoodLabel = includeMetrics && scenario.likelihood ? ` (${scenario.likelihood.toFixed(2)})` : "";
    mermaid += `  ${scenarioId}["CF: ${label}${likelihoodLabel}"]
`;
    mermaid += `  ${interventionId} -->|intervene| ${scenarioId}
`;
  }
  if (colorScheme !== "monochrome") {
    mermaid += "\n";
    const actualColor = colorScheme === "pastel" ? "#fff3e0" : "#ffd699";
    mermaid += `  style ${actualId} fill:${actualColor}
`;
    const cfColor = colorScheme === "pastel" ? "#e1f5ff" : "#a8d5ff";
    for (const scenario of thought.counterfactuals) {
      const scenarioId = sanitizeId(scenario.id);
      mermaid += `  style ${scenarioId} fill:${cfColor}
`;
    }
  }
  return mermaid;
}
function counterfactualToDOT(thought, includeLabels, includeMetrics) {
  let dot = "digraph CounterfactualScenarios {\n";
  dot += "  rankdir=TD;\n";
  dot += "  node [shape=box, style=rounded];\n\n";
  const interventionId = "intervention";
  dot += `  ${interventionId} [label="${thought.interventionPoint.description}", shape=diamond];

`;
  const actualId = sanitizeId(thought.actual.id);
  const actualLabel = includeLabels ? thought.actual.name : actualId;
  dot += `  ${actualId} [label="Actual: ${actualLabel}", style=filled, fillcolor=lightyellow];
`;
  dot += `  ${interventionId} -> ${actualId} [label="no change"];

`;
  for (const scenario of thought.counterfactuals) {
    const scenarioId = sanitizeId(scenario.id);
    const label = includeLabels ? scenario.name : scenarioId;
    const likelihoodLabel = includeMetrics && scenario.likelihood ? ` (${scenario.likelihood.toFixed(2)})` : "";
    dot += `  ${scenarioId} [label="CF: ${label}${likelihoodLabel}", style=filled, fillcolor=lightblue];
`;
    dot += `  ${interventionId} -> ${scenarioId} [label="intervene"];
`;
  }
  dot += "}\n";
  return dot;
}
function counterfactualToASCII(thought) {
  let ascii = "Counterfactual Scenario Tree:\n";
  ascii += "=============================\n\n";
  ascii += `Intervention Point: ${thought.interventionPoint.description}
`;
  ascii += `Timing: ${thought.interventionPoint.timing}
`;
  ascii += `Feasibility: ${thought.interventionPoint.feasibility.toFixed(2)}

`;
  ascii += "\u250C\u2500 Actual Scenario:\n";
  ascii += `\u2502  ${thought.actual.name}
`;
  ascii += `\u2502  ${thought.actual.description}

`;
  ascii += "\u2514\u2500 Counterfactual Scenarios:\n";
  for (const scenario of thought.counterfactuals) {
    const likelihoodStr = scenario.likelihood ? ` (likelihood: ${scenario.likelihood.toFixed(2)})` : "";
    ascii += `   \u251C\u2500 ${scenario.name}${likelihoodStr}
`;
    ascii += `   \u2502  ${scenario.description}
`;
  }
  return ascii;
}
var init_counterfactual = __esm({
  "src/export/visual/counterfactual.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/analogical.ts
function exportAnalogicalMapping(thought, options) {
  const { format, colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  switch (format) {
    case "mermaid":
      return analogicalToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return analogicalToDOT(thought, includeLabels, includeMetrics);
    case "ascii":
      return analogicalToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function analogicalToMermaid(thought, colorScheme, includeLabels, includeMetrics) {
  let mermaid = "graph LR\n";
  mermaid += '  subgraph Source["Source Domain"]\n';
  for (const entity of thought.sourceDomain.entities) {
    const entityId = sanitizeId("src_" + entity.id);
    const label = includeLabels ? entity.name : entityId;
    mermaid += `    ${entityId}["${label}"]
`;
  }
  mermaid += "  end\n\n";
  mermaid += '  subgraph Target["Target Domain"]\n';
  for (const entity of thought.targetDomain.entities) {
    const entityId = sanitizeId("tgt_" + entity.id);
    const label = includeLabels ? entity.name : entityId;
    mermaid += `    ${entityId}["${label}"]
`;
  }
  mermaid += "  end\n\n";
  for (const mapping of thought.mapping) {
    const srcId = sanitizeId("src_" + mapping.sourceEntityId);
    const tgtId = sanitizeId("tgt_" + mapping.targetEntityId);
    const confidenceLabel = includeMetrics ? `|${mapping.confidence.toFixed(2)}|` : "";
    mermaid += `  ${srcId} -.->${confidenceLabel} ${tgtId}
`;
  }
  if (colorScheme !== "monochrome") {
    mermaid += "\n";
    const srcColor = colorScheme === "pastel" ? "#fff3e0" : "#ffd699";
    const tgtColor = colorScheme === "pastel" ? "#e1f5ff" : "#a8d5ff";
    for (const entity of thought.sourceDomain.entities) {
      const entityId = sanitizeId("src_" + entity.id);
      mermaid += `  style ${entityId} fill:${srcColor}
`;
    }
    for (const entity of thought.targetDomain.entities) {
      const entityId = sanitizeId("tgt_" + entity.id);
      mermaid += `  style ${entityId} fill:${tgtColor}
`;
    }
  }
  return mermaid;
}
function analogicalToDOT(thought, includeLabels, includeMetrics) {
  let dot = "digraph AnalogicalMapping {\n";
  dot += "  rankdir=LR;\n";
  dot += "  node [shape=box, style=rounded];\n\n";
  dot += "  subgraph cluster_source {\n";
  dot += '    label="Source Domain";\n';
  dot += "    style=filled;\n";
  dot += "    fillcolor=lightyellow;\n\n";
  for (const entity of thought.sourceDomain.entities) {
    const entityId = sanitizeId("src_" + entity.id);
    const label = includeLabels ? entity.name : entityId;
    dot += `    ${entityId} [label="${label}"];
`;
  }
  dot += "  }\n\n";
  dot += "  subgraph cluster_target {\n";
  dot += '    label="Target Domain";\n';
  dot += "    style=filled;\n";
  dot += "    fillcolor=lightblue;\n\n";
  for (const entity of thought.targetDomain.entities) {
    const entityId = sanitizeId("tgt_" + entity.id);
    const label = includeLabels ? entity.name : entityId;
    dot += `    ${entityId} [label="${label}"];
`;
  }
  dot += "  }\n\n";
  for (const mapping of thought.mapping) {
    const srcId = sanitizeId("src_" + mapping.sourceEntityId);
    const tgtId = sanitizeId("tgt_" + mapping.targetEntityId);
    const confidenceLabel = includeMetrics ? `, label="${mapping.confidence.toFixed(2)}"` : "";
    dot += `  ${srcId} -> ${tgtId} [style=dashed${confidenceLabel}];
`;
  }
  dot += "}\n";
  return dot;
}
function analogicalToASCII(thought) {
  let ascii = "Analogical Domain Mapping:\n";
  ascii += "==========================\n\n";
  ascii += `Source Domain: ${thought.sourceDomain.name}
`;
  ascii += `${thought.sourceDomain.description}

`;
  ascii += `Target Domain: ${thought.targetDomain.name}
`;
  ascii += `${thought.targetDomain.description}

`;
  ascii += "Mappings:\n";
  for (const mapping of thought.mapping) {
    const srcEntity = thought.sourceDomain.entities.find((e) => e.id === mapping.sourceEntityId);
    const tgtEntity = thought.targetDomain.entities.find((e) => e.id === mapping.targetEntityId);
    if (srcEntity && tgtEntity) {
      ascii += `  ${srcEntity.name} \u2190\u2192 ${tgtEntity.name} (confidence: ${mapping.confidence.toFixed(2)})
`;
      ascii += `    ${mapping.justification}
`;
    }
  }
  ascii += `
Analogy Strength: ${thought.analogyStrength.toFixed(2)}
`;
  return ascii;
}
var init_analogical = __esm({
  "src/export/visual/analogical.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/evidential.ts
function exportEvidentialBeliefs(thought, options) {
  const { format, colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  switch (format) {
    case "mermaid":
      return evidentialToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return evidentialToDOT(thought, includeLabels, includeMetrics);
    case "ascii":
      return evidentialToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function evidentialToMermaid(thought, colorScheme, includeLabels, includeMetrics) {
  let mermaid = "graph TD\n";
  mermaid += '  Frame["Frame of Discernment"]\n';
  if (thought.frameOfDiscernment) {
    for (const hypothesis of thought.frameOfDiscernment) {
      const hypId = sanitizeId(hypothesis);
      const label = includeLabels ? hypothesis : hypId;
      mermaid += `  ${hypId}["${label}"]
`;
      mermaid += `  Frame --> ${hypId}
`;
    }
  }
  if (includeMetrics && thought.massAssignments && thought.massAssignments.length > 0) {
    mermaid += "\n";
    for (const mass of thought.massAssignments) {
      const massId = sanitizeId(mass.subset.join("_"));
      const label = `{${mass.subset.join(", ")}}`;
      mermaid += `  ${massId}["${label}: ${mass.mass.toFixed(3)}"]
`;
    }
  }
  if (colorScheme !== "monochrome" && thought.frameOfDiscernment) {
    mermaid += "\n";
    const color = colorScheme === "pastel" ? "#e1f5ff" : "#a8d5ff";
    for (const hypothesis of thought.frameOfDiscernment) {
      const hypId = sanitizeId(hypothesis);
      mermaid += `  style ${hypId} fill:${color}
`;
    }
  }
  return mermaid;
}
function evidentialToDOT(thought, includeLabels, includeMetrics) {
  let dot = "digraph EvidentialBeliefs {\n";
  dot += "  rankdir=TD;\n";
  dot += "  node [shape=box, style=rounded];\n\n";
  dot += '  Frame [label="Frame of Discernment", shape=ellipse];\n\n';
  if (thought.frameOfDiscernment) {
    for (const hypothesis of thought.frameOfDiscernment) {
      const hypId = sanitizeId(hypothesis);
      const label = includeLabels ? hypothesis : hypId;
      dot += `  ${hypId} [label="${label}"];
`;
      dot += `  Frame -> ${hypId};
`;
    }
  }
  if (includeMetrics && thought.massAssignments && thought.massAssignments.length > 0) {
    dot += "\n";
    for (const mass of thought.massAssignments) {
      const massId = sanitizeId(mass.subset.join("_"));
      const label = `{${mass.subset.join(", ")}}: ${mass.mass.toFixed(3)}`;
      dot += `  ${massId} [label="${label}", shape=note];
`;
    }
  }
  dot += "}\n";
  return dot;
}
function evidentialToASCII(thought) {
  let ascii = "Evidential Belief Visualization:\n";
  ascii += "================================\n\n";
  ascii += "Frame of Discernment:\n";
  if (thought.frameOfDiscernment) {
    ascii += `  {${thought.frameOfDiscernment.join(", ")}}

`;
  } else {
    ascii += "  (not defined)\n\n";
  }
  if (thought.massAssignments && thought.massAssignments.length > 0) {
    ascii += "Mass Assignments:\n";
    for (const mass of thought.massAssignments) {
      ascii += `  m({${mass.subset.join(", ")}}) = ${mass.mass.toFixed(3)}
`;
    }
    ascii += "\n";
  }
  if (thought.beliefFunctions && thought.beliefFunctions.length > 0) {
    ascii += `Belief Functions: ${thought.beliefFunctions.length} defined
`;
  }
  if (thought.plausibilityFunction) {
    ascii += `Plausibility: ${thought.plausibilityFunction.toFixed(3)}
`;
  }
  return ascii;
}
var init_evidential = __esm({
  "src/export/visual/evidential.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/first-principles.ts
function exportFirstPrinciplesDerivation(thought, options) {
  const { format, colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  switch (format) {
    case "mermaid":
      return firstPrinciplesToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return firstPrinciplesToDOT(thought, includeLabels, includeMetrics);
    case "ascii":
      return firstPrinciplesToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function firstPrinciplesToMermaid(thought, colorScheme, includeLabels, includeMetrics) {
  let mermaid = "graph TD\n";
  mermaid += `  Q["Question: ${thought.question}"]
`;
  mermaid += "\n";
  for (const principle of thought.principles) {
    const principleId = sanitizeId(principle.id);
    const label = includeLabels ? `${principle.type.toUpperCase()}: ${principle.statement.substring(0, 50)}...` : principleId;
    let shape;
    switch (principle.type) {
      case "axiom":
        shape = ["([", "])"];
        break;
      case "definition":
        shape = ["[[", "]]"];
        break;
      case "observation":
        shape = ["[(", ")]"];
        break;
      case "logical_inference":
        shape = ["[", "]"];
        break;
      case "assumption":
        shape = ["{", "}"];
        break;
      default:
        shape = ["[", "]"];
    }
    mermaid += `  ${principleId}${shape[0]}${label}${shape[1]}
`;
    if (principle.dependsOn) {
      for (const depId of principle.dependsOn) {
        const sanitizedDepId = sanitizeId(depId);
        mermaid += `  ${sanitizedDepId} --> ${principleId}
`;
      }
    }
  }
  mermaid += "\n";
  for (const step of thought.derivationSteps) {
    const stepId = `Step${step.stepNumber}`;
    const principleId = sanitizeId(step.principle);
    const label = includeLabels ? `Step ${step.stepNumber}: ${step.inference.substring(0, 50)}...` : stepId;
    mermaid += `  ${stepId}["${label}"]
`;
    mermaid += `  ${principleId} -.->|applies| ${stepId}
`;
    if (includeMetrics && step.confidence !== void 0) {
      mermaid += `  ${stepId} -.->|conf: ${step.confidence.toFixed(2)}| ${stepId}
`;
    }
  }
  mermaid += "\n";
  const conclusionLabel = includeLabels ? `Conclusion: ${thought.conclusion.statement.substring(0, 50)}...` : "Conclusion";
  mermaid += `  C["${conclusionLabel}"]
`;
  for (const stepNum of thought.conclusion.derivationChain) {
    mermaid += `  Step${stepNum} --> C
`;
  }
  if (includeMetrics) {
    mermaid += `  C -.->|certainty: ${thought.conclusion.certainty.toFixed(2)}| C
`;
  }
  if (colorScheme !== "monochrome") {
    mermaid += "\n";
    const axiomColor = colorScheme === "pastel" ? "#e1f5ff" : "#a8d5ff";
    const definitionColor = colorScheme === "pastel" ? "#f3e5f5" : "#ce93d8";
    const observationColor = colorScheme === "pastel" ? "#fff3e0" : "#ffd699";
    const inferenceColor = colorScheme === "pastel" ? "#e8f5e9" : "#a5d6a7";
    const assumptionColor = colorScheme === "pastel" ? "#ffebee" : "#ef9a9a";
    for (const principle of thought.principles) {
      const principleId = sanitizeId(principle.id);
      let color = axiomColor;
      switch (principle.type) {
        case "axiom":
          color = axiomColor;
          break;
        case "definition":
          color = definitionColor;
          break;
        case "observation":
          color = observationColor;
          break;
        case "logical_inference":
          color = inferenceColor;
          break;
        case "assumption":
          color = assumptionColor;
          break;
      }
      mermaid += `  style ${principleId} fill:${color}
`;
    }
    const conclusionColor = colorScheme === "pastel" ? "#c8e6c9" : "#66bb6a";
    mermaid += `  style C fill:${conclusionColor}
`;
  }
  return mermaid;
}
function firstPrinciplesToDOT(thought, includeLabels, includeMetrics) {
  let dot = "digraph FirstPrinciples {\n";
  dot += "  rankdir=TD;\n";
  dot += "  node [shape=box, style=rounded];\n\n";
  dot += `  Q [label="Question:\\n${thought.question}", shape=ellipse, style=bold];

`;
  for (const principle of thought.principles) {
    const principleId = sanitizeId(principle.id);
    const label = includeLabels ? `${principle.type.toUpperCase()}:\\n${principle.statement.substring(0, 60)}...` : principleId;
    let shape = "box";
    switch (principle.type) {
      case "axiom":
        shape = "ellipse";
        break;
      case "definition":
        shape = "box";
        break;
      case "observation":
        shape = "cylinder";
        break;
      case "logical_inference":
        shape = "box";
        break;
      case "assumption":
        shape = "diamond";
        break;
    }
    const confidenceLabel = includeMetrics && principle.confidence ? `\\nconf: ${principle.confidence.toFixed(2)}` : "";
    dot += `  ${principleId} [label="${label}${confidenceLabel}", shape=${shape}];
`;
    if (principle.dependsOn) {
      for (const depId of principle.dependsOn) {
        const sanitizedDepId = sanitizeId(depId);
        dot += `  ${sanitizedDepId} -> ${principleId};
`;
      }
    }
  }
  dot += "\n";
  for (const step of thought.derivationSteps) {
    const stepId = `Step${step.stepNumber}`;
    const principleId = sanitizeId(step.principle);
    const label = includeLabels ? `Step ${step.stepNumber}:\\n${step.inference.substring(0, 60)}...` : stepId;
    const confidenceLabel = includeMetrics ? `\\nconf: ${step.confidence.toFixed(2)}` : "";
    dot += `  ${stepId} [label="${label}${confidenceLabel}"];
`;
    dot += `  ${principleId} -> ${stepId} [style=dashed, label="applies"];
`;
  }
  dot += "\n";
  const conclusionLabel = includeLabels ? `Conclusion:\\n${thought.conclusion.statement.substring(0, 60)}...` : "Conclusion";
  const certaintyLabel = includeMetrics ? `\\ncertainty: ${thought.conclusion.certainty.toFixed(2)}` : "";
  dot += `  C [label="${conclusionLabel}${certaintyLabel}", shape=doubleoctagon, style=bold];
`;
  for (const stepNum of thought.conclusion.derivationChain) {
    dot += `  Step${stepNum} -> C;
`;
  }
  dot += "}\n";
  return dot;
}
function firstPrinciplesToASCII(thought) {
  let ascii = "First-Principles Derivation:\n";
  ascii += "============================\n\n";
  ascii += `Question: ${thought.question}

`;
  ascii += "Foundational Principles:\n";
  ascii += "------------------------\n";
  for (const principle of thought.principles) {
    ascii += `[${principle.id}] ${principle.type.toUpperCase()}
`;
    ascii += `  Statement: ${principle.statement}
`;
    ascii += `  Justification: ${principle.justification}
`;
    if (principle.dependsOn && principle.dependsOn.length > 0) {
      ascii += `  Depends on: ${principle.dependsOn.join(", ")}
`;
    }
    if (principle.confidence !== void 0) {
      ascii += `  Confidence: ${principle.confidence.toFixed(2)}
`;
    }
    ascii += "\n";
  }
  ascii += "Derivation Chain:\n";
  ascii += "----------------\n";
  for (const step of thought.derivationSteps) {
    ascii += `Step ${step.stepNumber} (using principle: ${step.principle})
`;
    ascii += `  Inference: ${step.inference}
`;
    if (step.logicalForm) {
      ascii += `  Logical form: ${step.logicalForm}
`;
    }
    ascii += `  Confidence: ${step.confidence.toFixed(2)}
`;
    ascii += "\n";
  }
  ascii += "Conclusion:\n";
  ascii += "----------\n";
  ascii += `${thought.conclusion.statement}
`;
  ascii += `Derivation chain: Steps [${thought.conclusion.derivationChain.join(", ")}]
`;
  ascii += `Certainty: ${thought.conclusion.certainty.toFixed(2)}
`;
  if (thought.conclusion.limitations && thought.conclusion.limitations.length > 0) {
    ascii += "\nLimitations:\n";
    for (const limitation of thought.conclusion.limitations) {
      ascii += `  - ${limitation}
`;
    }
  }
  if (thought.alternativeInterpretations && thought.alternativeInterpretations.length > 0) {
    ascii += "\nAlternative Interpretations:\n";
    for (const alt of thought.alternativeInterpretations) {
      ascii += `  - ${alt}
`;
    }
  }
  return ascii;
}
var init_first_principles = __esm({
  "src/export/visual/first-principles.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/systems-thinking.ts
function exportSystemsThinkingCausalLoops(thought, options) {
  const { format, colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  switch (format) {
    case "mermaid":
      return systemsThinkingToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return systemsThinkingToDOT(thought, includeLabels, includeMetrics);
    case "ascii":
      return systemsThinkingToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function systemsThinkingToMermaid(thought, colorScheme, includeLabels, includeMetrics) {
  let mermaid = "graph TB\n";
  if (thought.system) {
    mermaid += `  System["${thought.system.name}"]

`;
  }
  if (thought.components && thought.components.length > 0) {
    for (const component of thought.components) {
      const compId = sanitizeId(component.id);
      const label = includeLabels ? component.name : compId;
      const shape = component.type === "stock" ? ["[[", "]]"] : ["[", "]"];
      mermaid += `  ${compId}${shape[0]}${label}${shape[1]}
`;
    }
    mermaid += "\n";
  }
  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    for (const loop of thought.feedbackLoops) {
      const loopComponents = loop.components;
      for (let i = 0; i < loopComponents.length; i++) {
        const fromId = sanitizeId(loopComponents[i]);
        const toId = sanitizeId(loopComponents[(i + 1) % loopComponents.length]);
        const edgeLabel = includeMetrics ? `|${loop.type} (${loop.strength.toFixed(2)})| ` : `|${loop.type}| `;
        const edgeStyle = loop.type === "reinforcing" ? "-->" : "-..->";
        mermaid += `  ${fromId} ${edgeStyle}${edgeLabel}${toId}
`;
      }
    }
    mermaid += "\n";
  }
  if (colorScheme !== "monochrome" && thought.components) {
    const stockColor = colorScheme === "pastel" ? "#e1f5ff" : "#a8d5ff";
    const flowColor = colorScheme === "pastel" ? "#fff3e0" : "#ffd699";
    for (const component of thought.components) {
      const compId = sanitizeId(component.id);
      const color = component.type === "stock" ? stockColor : flowColor;
      mermaid += `  style ${compId} fill:${color}
`;
    }
  }
  return mermaid;
}
function systemsThinkingToDOT(thought, includeLabels, includeMetrics) {
  let dot = "digraph SystemsThinking {\n";
  dot += "  rankdir=TB;\n";
  dot += "  node [shape=box, style=rounded];\n\n";
  if (thought.components && thought.components.length > 0) {
    for (const component of thought.components) {
      const compId = sanitizeId(component.id);
      const label = includeLabels ? component.name : compId;
      const shape = component.type === "stock" ? "box" : "ellipse";
      dot += `  ${compId} [label="${label}", shape=${shape}];
`;
    }
    dot += "\n";
  }
  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    for (const loop of thought.feedbackLoops) {
      const loopComponents = loop.components;
      for (let i = 0; i < loopComponents.length; i++) {
        const fromId = sanitizeId(loopComponents[i]);
        const toId = sanitizeId(loopComponents[(i + 1) % loopComponents.length]);
        const edgeLabel = includeMetrics ? `, label="${loop.type} (${loop.strength.toFixed(2)})"` : `, label="${loop.type}"`;
        const edgeStyle = loop.type === "reinforcing" ? "solid" : "dashed";
        dot += `  ${fromId} -> ${toId} [style=${edgeStyle}${edgeLabel}];
`;
      }
    }
  }
  dot += "}\n";
  return dot;
}
function systemsThinkingToASCII(thought) {
  let ascii = "Systems Thinking Model:\n";
  ascii += "======================\n\n";
  if (thought.system) {
    ascii += `System: ${thought.system.name}
`;
    ascii += `${thought.system.description}

`;
  }
  if (thought.components && thought.components.length > 0) {
    ascii += "Components:\n";
    for (const component of thought.components) {
      const typeIcon = component.type === "stock" ? "[\u25A0]" : "(\u25CB)";
      ascii += `  ${typeIcon} ${component.name}: ${component.description}
`;
    }
    ascii += "\n";
  }
  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    ascii += "Feedback Loops:\n";
    for (const loop of thought.feedbackLoops) {
      const loopIcon = loop.type === "reinforcing" ? "\u2295" : "\u2296";
      ascii += `  ${loopIcon} ${loop.name} (${loop.type})
`;
      ascii += `    Strength: ${loop.strength.toFixed(2)}
`;
      ascii += `    Components: ${loop.components.join(" \u2192 ")}
`;
    }
    ascii += "\n";
  }
  if (thought.leveragePoints && thought.leveragePoints.length > 0) {
    ascii += "Leverage Points:\n";
    for (const point of thought.leveragePoints) {
      ascii += `  \u2605 ${point.location} (effectiveness: ${point.effectiveness.toFixed(2)})
`;
      ascii += `    ${point.description}
`;
    }
  }
  return ascii;
}
var init_systems_thinking = __esm({
  "src/export/visual/systems-thinking.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/scientific-method.ts
function exportScientificMethodExperiment(thought, options) {
  const { format, colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  switch (format) {
    case "mermaid":
      return scientificMethodToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return scientificMethodToDOT(thought, includeLabels, includeMetrics);
    case "ascii":
      return scientificMethodToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function scientificMethodToMermaid(thought, colorScheme, includeLabels, includeMetrics) {
  let mermaid = "graph TD\n";
  if (thought.researchQuestion) {
    mermaid += `  RQ["Research Question: ${thought.researchQuestion.question.substring(0, 60)}..."]
`;
    mermaid += "\n";
  }
  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    for (const hypothesis of thought.scientificHypotheses) {
      const hypId = sanitizeId(hypothesis.id);
      const label = includeLabels ? hypothesis.statement.substring(0, 50) + "..." : hypId;
      mermaid += `  ${hypId}["H: ${label}"]
`;
      if (thought.researchQuestion) {
        mermaid += `  RQ --> ${hypId}
`;
      }
    }
    mermaid += "\n";
  }
  if (thought.experiment) {
    mermaid += `  Exp["Experiment: ${thought.experiment.design}"]
`;
    if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
      for (const hypothesis of thought.scientificHypotheses) {
        const hypId = sanitizeId(hypothesis.id);
        mermaid += `  ${hypId} --> Exp
`;
      }
    }
    mermaid += "\n";
  }
  if (thought.data) {
    mermaid += `  Data["Data Collection: ${thought.experiment?.sampleSize || 0} samples"]
`;
    if (thought.experiment) {
      mermaid += `  Exp --> Data
`;
    }
    mermaid += "\n";
  }
  if (thought.analysis) {
    mermaid += `  Stats["Statistical Analysis"]
`;
    if (thought.data) {
      mermaid += `  Data --> Stats
`;
    }
    mermaid += "\n";
  }
  if (thought.conclusion) {
    const conclusionId = "Conclusion";
    const supportLabel = includeMetrics && thought.conclusion.confidence ? ` (conf: ${thought.conclusion.confidence.toFixed(2)})` : "";
    mermaid += `  ${conclusionId}["Conclusion: ${thought.conclusion.statement.substring(0, 50)}...${supportLabel}"]
`;
    if (thought.analysis) {
      mermaid += `  Stats --> ${conclusionId}
`;
    }
  }
  if (colorScheme !== "monochrome") {
    mermaid += "\n";
    const questionColor = colorScheme === "pastel" ? "#fff3e0" : "#ffd699";
    const hypothesisColor = colorScheme === "pastel" ? "#e1f5ff" : "#a8d5ff";
    const conclusionColor = colorScheme === "pastel" ? "#e8f5e9" : "#a5d6a7";
    if (thought.researchQuestion) {
      mermaid += `  style RQ fill:${questionColor}
`;
    }
    if (thought.scientificHypotheses) {
      for (const hypothesis of thought.scientificHypotheses) {
        const hypId = sanitizeId(hypothesis.id);
        mermaid += `  style ${hypId} fill:${hypothesisColor}
`;
      }
    }
    if (thought.conclusion) {
      mermaid += `  style Conclusion fill:${conclusionColor}
`;
    }
  }
  return mermaid;
}
function scientificMethodToDOT(thought, includeLabels, includeMetrics) {
  let dot = "digraph ScientificMethod {\n";
  dot += "  rankdir=TD;\n";
  dot += "  node [shape=box, style=rounded];\n\n";
  if (thought.researchQuestion) {
    const label = includeLabels ? thought.researchQuestion.question.substring(0, 60) + "..." : "RQ";
    dot += `  RQ [label="Research Question:\\n${label}", shape=ellipse];

`;
  }
  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    for (const hypothesis of thought.scientificHypotheses) {
      const hypId = sanitizeId(hypothesis.id);
      const label = includeLabels ? hypothesis.statement.substring(0, 50) + "..." : hypId;
      dot += `  ${hypId} [label="Hypothesis:\\n${label}"];
`;
      if (thought.researchQuestion) {
        dot += `  RQ -> ${hypId};
`;
      }
    }
    dot += "\n";
  }
  if (thought.experiment) {
    const label = includeLabels ? thought.experiment.design : "Exp";
    dot += `  Exp [label="Experiment:\\n${label}"];
`;
    if (thought.scientificHypotheses) {
      for (const hypothesis of thought.scientificHypotheses) {
        const hypId = sanitizeId(hypothesis.id);
        dot += `  ${hypId} -> Exp;
`;
      }
    }
    dot += "\n";
  }
  if (thought.data) {
    const sampleLabel = includeMetrics ? `\\nSamples: ${thought.experiment?.sampleSize || 0}` : "";
    dot += `  Data [label="Data Collection${sampleLabel}"];
`;
    if (thought.experiment) {
      dot += `  Exp -> Data;
`;
    }
  }
  if (thought.analysis) {
    dot += `  Stats [label="Statistical Analysis"];
`;
    if (thought.data) {
      dot += `  Data -> Stats;
`;
    }
  }
  if (thought.conclusion) {
    const label = includeLabels ? thought.conclusion.statement.substring(0, 50) + "..." : "Conclusion";
    const confLabel = includeMetrics && thought.conclusion.confidence ? `\\nconf: ${thought.conclusion.confidence.toFixed(2)}` : "";
    dot += `  Conclusion [label="Conclusion:\\n${label}${confLabel}", shape=doubleoctagon];
`;
    if (thought.analysis) {
      dot += `  Stats -> Conclusion;
`;
    }
  }
  dot += "}\n";
  return dot;
}
function scientificMethodToASCII(thought) {
  let ascii = "Scientific Method Process:\n";
  ascii += "==========================\n\n";
  if (thought.researchQuestion) {
    ascii += `Research Question: ${thought.researchQuestion.question}
`;
    ascii += `Background: ${thought.researchQuestion.background}

`;
  }
  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    ascii += "Hypotheses:\n";
    for (const hypothesis of thought.scientificHypotheses) {
      const typeIcon = hypothesis.type === "null" ? "H\u2080" : "H\u2081";
      ascii += `  ${typeIcon} ${hypothesis.statement}
`;
      if (hypothesis.prediction) {
        ascii += `    Prediction: ${hypothesis.prediction}
`;
      }
    }
    ascii += "\n";
  }
  if (thought.experiment) {
    ascii += `Experiment: ${thought.experiment.design}
`;
    ascii += `Type: ${thought.experiment.type}
`;
    ascii += `Design: ${thought.experiment.design}

`;
  }
  if (thought.data) {
    ascii += "Data Collection:\n";
    ascii += `  Sample Size: ${thought.experiment?.sampleSize || 0}
`;
    ascii += `  Method: ${thought.data.method}
`;
    if (thought.data.dataQuality) {
      ascii += `  Quality:
`;
      ascii += `    Completeness: ${thought.data.dataQuality.completeness.toFixed(2)}
`;
      ascii += `    Reliability: ${thought.data.dataQuality.reliability.toFixed(2)}
`;
    }
    ascii += "\n";
  }
  if (thought.analysis && thought.analysis.tests) {
    ascii += "Statistical Tests:\n";
    for (const test of thought.analysis.tests) {
      ascii += `  \u2022 ${test.name}
`;
      ascii += `    p-value: ${test.pValue.toFixed(4)}, \u03B1: ${test.alpha}
`;
      ascii += `    Result: ${test.result}
`;
    }
    ascii += "\n";
  }
  if (thought.conclusion) {
    ascii += "Conclusion:\n";
    ascii += `${thought.conclusion.statement}
`;
    if (thought.conclusion.supportedHypotheses) {
      ascii += `Supported hypotheses: ${thought.conclusion.supportedHypotheses.join(", ")}
`;
    }
    if (thought.conclusion.confidence) {
      ascii += `Confidence: ${thought.conclusion.confidence.toFixed(2)}
`;
    }
  }
  return ascii;
}
var init_scientific_method = __esm({
  "src/export/visual/scientific-method.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/optimization.ts
function exportOptimizationSolution(thought, options) {
  const { format, colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  switch (format) {
    case "mermaid":
      return optimizationToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return optimizationToDOT(thought, includeLabels, includeMetrics);
    case "ascii":
      return optimizationToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function optimizationToMermaid(thought, colorScheme, includeLabels, includeMetrics) {
  let mermaid = "graph TD\n";
  if (thought.problem) {
    const problemLabel = includeLabels ? `Problem: ${thought.problem.name}` : "Problem";
    mermaid += `  Problem["${problemLabel}"]

`;
  }
  if (thought.variables && thought.variables.length > 0) {
    mermaid += '  subgraph Variables["Decision Variables"]\n';
    for (const variable of thought.variables) {
      const varId = sanitizeId(variable.id);
      const label = includeLabels ? variable.name : varId;
      const domainLabel = includeMetrics && variable.domain ? ` [${variable.domain.lowerBound},${variable.domain.upperBound}]` : "";
      mermaid += `    ${varId}["${label}${domainLabel}"]
`;
    }
    mermaid += "  end\n\n";
  }
  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    mermaid += '  subgraph Constraints["Constraints"]\n';
    for (const constraint of thought.optimizationConstraints) {
      const constId = sanitizeId(constraint.id);
      const label = includeLabels ? constraint.name : constId;
      mermaid += `    ${constId}["${label}"]
`;
    }
    mermaid += "  end\n\n";
  }
  if (thought.objectives && thought.objectives.length > 0) {
    for (const objective of thought.objectives) {
      const objId = sanitizeId(objective.id);
      const label = includeLabels ? `${objective.type}: ${objective.name}` : objId;
      mermaid += `  ${objId}["${label}"]
`;
    }
    mermaid += "\n";
  }
  if (thought.solution) {
    const qualityLabel = includeMetrics && thought.solution.quality ? ` (quality: ${thought.solution.quality.toFixed(2)})` : "";
    mermaid += `  Solution["Solution${qualityLabel}"]
`;
    if (thought.objectives) {
      for (const objective of thought.objectives) {
        const objId = sanitizeId(objective.id);
        mermaid += `  ${objId} --> Solution
`;
      }
    }
  }
  if (colorScheme !== "monochrome") {
    mermaid += "\n";
    const solutionColor = colorScheme === "pastel" ? "#e8f5e9" : "#a5d6a7";
    if (thought.solution) {
      mermaid += `  style Solution fill:${solutionColor}
`;
    }
  }
  return mermaid;
}
function optimizationToDOT(thought, includeLabels, includeMetrics) {
  let dot = "digraph Optimization {\n";
  dot += "  rankdir=TD;\n";
  dot += "  node [shape=box, style=rounded];\n\n";
  if (thought.problem) {
    const label = includeLabels ? thought.problem.name : "Problem";
    dot += `  Problem [label="Problem:\\n${label}", shape=ellipse];

`;
  }
  if (thought.variables && thought.variables.length > 0) {
    dot += "  subgraph cluster_variables {\n";
    dot += '    label="Decision Variables";\n';
    for (const variable of thought.variables) {
      const varId = sanitizeId(variable.id);
      const label = includeLabels ? variable.name : varId;
      const domainLabel = includeMetrics && variable.domain ? `\\n[${variable.domain.lowerBound}, ${variable.domain.upperBound}]` : "";
      dot += `    ${varId} [label="${label}${domainLabel}"];
`;
    }
    dot += "  }\n\n";
  }
  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    dot += "  subgraph cluster_constraints {\n";
    dot += '    label="Constraints";\n';
    for (const constraint of thought.optimizationConstraints) {
      const constId = sanitizeId(constraint.id);
      const label = includeLabels ? constraint.name : constId;
      dot += `    ${constId} [label="${label}", shape=diamond];
`;
    }
    dot += "  }\n\n";
  }
  if (thought.objectives) {
    for (const objective of thought.objectives) {
      const objId = sanitizeId(objective.id);
      const label = includeLabels ? `${objective.type}:\\n${objective.name}` : objId;
      dot += `  ${objId} [label="${label}"];
`;
    }
  }
  if (thought.solution) {
    const qualityLabel = includeMetrics && thought.solution.quality ? `\\nquality: ${thought.solution.quality.toFixed(2)}` : "";
    dot += `  Solution [label="Solution${qualityLabel}", shape=doubleoctagon, style=filled, fillcolor=lightgreen];
`;
    if (thought.objectives) {
      for (const objective of thought.objectives) {
        const objId = sanitizeId(objective.id);
        dot += `  ${objId} -> Solution;
`;
      }
    }
  }
  dot += "}\n";
  return dot;
}
function optimizationToASCII(thought) {
  let ascii = "Optimization Problem:\n";
  ascii += "====================\n\n";
  if (thought.problem) {
    ascii += `Problem: ${thought.problem.name}
`;
    ascii += `Type: ${thought.problem.type}
`;
    ascii += `${thought.problem.description}

`;
  }
  if (thought.variables && thought.variables.length > 0) {
    ascii += "Decision Variables:\n";
    for (const variable of thought.variables) {
      const varType = variable.type || "unknown";
      ascii += `  ${variable.name} (${varType})
`;
      if (variable.domain) {
        ascii += `    Domain: [${variable.domain.lowerBound}, ${variable.domain.upperBound}]
`;
      }
    }
    ascii += "\n";
  }
  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    ascii += "Constraints:\n";
    for (const constraint of thought.optimizationConstraints) {
      ascii += `  ${constraint.name} (${constraint.type})
`;
      ascii += `    ${constraint.formula}
`;
    }
    ascii += "\n";
  }
  if (thought.objectives && thought.objectives.length > 0) {
    ascii += "Objectives:\n";
    for (const objective of thought.objectives) {
      ascii += `  ${objective.type.toUpperCase()}: ${objective.name}
`;
      ascii += `    ${objective.formula}
`;
    }
    ascii += "\n";
  }
  if (thought.solution) {
    ascii += "Solution:\n";
    const solution = thought.solution;
    if (solution.status) {
      ascii += `  Status: ${solution.status}
`;
    }
    if (solution.optimalValue !== void 0) {
      ascii += `  Optimal Value: ${solution.optimalValue}
`;
    }
    if (solution.quality !== void 0) {
      ascii += `  Quality: ${solution.quality.toFixed(2)}
`;
    }
    if (solution.assignments) {
      ascii += "  Assignments:\n";
      for (const [varId, value] of Object.entries(solution.assignments)) {
        ascii += `    ${varId} = ${value}
`;
      }
    }
  }
  return ascii;
}
var init_optimization = __esm({
  "src/export/visual/optimization.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/formal-logic.ts
function exportFormalLogicProof(thought, options) {
  const { format, colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  switch (format) {
    case "mermaid":
      return formalLogicToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return formalLogicToDOT(thought, includeLabels, includeMetrics);
    case "ascii":
      return formalLogicToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function formalLogicToMermaid(thought, colorScheme, includeLabels, includeMetrics) {
  let mermaid = "graph TD\n";
  if (thought.propositions && thought.propositions.length > 0) {
    mermaid += '  subgraph Propositions["Propositions"]\n';
    for (const proposition of thought.propositions) {
      const propId = sanitizeId(proposition.id);
      const label = includeLabels ? `${proposition.symbol}: ${proposition.statement.substring(0, 40)}...` : proposition.symbol;
      const shape = proposition.type === "atomic" ? ["[", "]"] : ["[[", "]]"];
      mermaid += `    ${propId}${shape[0]}${label}${shape[1]}
`;
    }
    mermaid += "  end\n\n";
  }
  if (thought.proof && thought.proof.steps && thought.proof.steps.length > 0) {
    mermaid += '  Theorem["Theorem"]\n';
    for (const step of thought.proof.steps) {
      const stepId = `Step${step.stepNumber}`;
      const label = includeLabels ? `${step.stepNumber}. ${step.statement.substring(0, 40)}...` : `Step ${step.stepNumber}`;
      mermaid += `  ${stepId}["${label}"]
`;
      if (step.referencesSteps && step.referencesSteps.length > 0) {
        for (const refStep of step.referencesSteps) {
          mermaid += `  Step${refStep} --> ${stepId}
`;
        }
      }
    }
    const lastStep = thought.proof.steps[thought.proof.steps.length - 1];
    mermaid += `  Step${lastStep.stepNumber} --> Theorem
`;
    if (includeMetrics) {
      const completeness = (thought.proof.completeness * 100).toFixed(0);
      mermaid += `
  Completeness["Completeness: ${completeness}%"]
`;
      mermaid += `  Completeness -.-> Theorem
`;
    }
  }
  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    mermaid += "\n";
    for (const inference of thought.logicalInferences) {
      const infId = sanitizeId(inference.id);
      const label = includeLabels ? inference.rule : infId;
      mermaid += `  ${infId}{{"${label}"}}
`;
      if (inference.premises) {
        for (const premiseId of inference.premises) {
          const propId = sanitizeId(premiseId);
          mermaid += `  ${propId} --> ${infId}
`;
        }
      }
      const conclusionId = sanitizeId(inference.conclusion);
      mermaid += `  ${infId} --> ${conclusionId}
`;
    }
  }
  if (colorScheme !== "monochrome") {
    mermaid += "\n";
    const atomicColor = colorScheme === "pastel" ? "#e1f5ff" : "#a8d5ff";
    const compoundColor = colorScheme === "pastel" ? "#fff3e0" : "#ffd699";
    if (thought.propositions) {
      for (const proposition of thought.propositions) {
        const propId = sanitizeId(proposition.id);
        const color = proposition.type === "atomic" ? atomicColor : compoundColor;
        mermaid += `  style ${propId} fill:${color}
`;
      }
    }
  }
  return mermaid;
}
function formalLogicToDOT(thought, includeLabels, includeMetrics) {
  let dot = "digraph FormalLogic {\n";
  dot += "  rankdir=TD;\n";
  dot += "  node [shape=box, style=rounded];\n\n";
  if (thought.propositions && thought.propositions.length > 0) {
    dot += "  subgraph cluster_propositions {\n";
    dot += '    label="Propositions";\n';
    for (const proposition of thought.propositions) {
      const propId = sanitizeId(proposition.id);
      const label = includeLabels ? `${proposition.symbol}:\\n${proposition.statement.substring(0, 40)}...` : proposition.symbol;
      const shape = proposition.type === "atomic" ? "ellipse" : "box";
      dot += `    ${propId} [label="${label}", shape=${shape}];
`;
    }
    dot += "  }\n\n";
  }
  if (thought.proof && thought.proof.steps && thought.proof.steps.length > 0) {
    dot += `  Theorem [label="Theorem:\\n${thought.proof.theorem.substring(0, 50)}...", shape=doubleoctagon, style=bold];

`;
    for (const step of thought.proof.steps) {
      const stepId = `Step${step.stepNumber}`;
      const label = includeLabels ? `${step.stepNumber}. ${step.statement.substring(0, 40)}...` : `Step ${step.stepNumber}`;
      const ruleLabel = step.rule ? `\\n(${step.rule})` : "";
      dot += `  ${stepId} [label="${label}${ruleLabel}"];
`;
      if (step.referencesSteps) {
        for (const refStep of step.referencesSteps) {
          dot += `  Step${refStep} -> ${stepId};
`;
        }
      }
    }
    const lastStep = thought.proof.steps[thought.proof.steps.length - 1];
    dot += `  Step${lastStep.stepNumber} -> Theorem;
`;
    if (includeMetrics) {
      const completeness = (thought.proof.completeness * 100).toFixed(0);
      dot += `
  Completeness [label="Completeness: ${completeness}%", shape=note];
`;
    }
  }
  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    dot += "\n";
    for (const inference of thought.logicalInferences) {
      const infId = sanitizeId(inference.id);
      const label = includeLabels ? inference.rule : infId;
      dot += `  ${infId} [label="${label}", shape=diamond];
`;
      if (inference.premises) {
        for (const premiseId of inference.premises) {
          const propId = sanitizeId(premiseId);
          dot += `  ${propId} -> ${infId};
`;
        }
      }
      const conclusionId = sanitizeId(inference.conclusion);
      dot += `  ${infId} -> ${conclusionId};
`;
    }
  }
  dot += "}\n";
  return dot;
}
function formalLogicToASCII(thought) {
  let ascii = "Formal Logic Proof:\n";
  ascii += "==================\n\n";
  if (thought.propositions && thought.propositions.length > 0) {
    ascii += "Propositions:\n";
    for (const proposition of thought.propositions) {
      const typeMarker = proposition.type === "atomic" ? "\u25CF" : "\u25C6";
      ascii += `  ${typeMarker} ${proposition.symbol}: ${proposition.statement}
`;
    }
    ascii += "\n";
  }
  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    ascii += "Inferences:\n";
    for (const inference of thought.logicalInferences) {
      ascii += `  [${inference.rule}]
`;
      ascii += `    Premises: ${inference.premises.join(", ")}
`;
      ascii += `    Conclusion: ${inference.conclusion}
`;
      ascii += `    Valid: ${inference.valid ? "\u2713" : "\u2717"}
`;
    }
    ascii += "\n";
  }
  if (thought.proof) {
    ascii += `Proof: ${thought.proof.theorem}
`;
    ascii += `Technique: ${thought.proof.technique}
`;
    ascii += `Completeness: ${(thought.proof.completeness * 100).toFixed(0)}%

`;
    if (thought.proof.steps && thought.proof.steps.length > 0) {
      ascii += "Proof Steps:\n";
      for (const step of thought.proof.steps) {
        ascii += `  ${step.stepNumber}. ${step.statement}
`;
        ascii += `     Justification: ${step.justification}
`;
      }
      ascii += "\n";
    }
    ascii += `Conclusion: ${thought.proof.conclusion}
`;
    ascii += `Valid: ${thought.proof.valid ? "\u2713" : "\u2717"}
`;
  }
  if (thought.truthTable) {
    ascii += "\nTruth Table:\n";
    ascii += `  Tautology: ${thought.truthTable.isTautology ? "\u2713" : "\u2717"}
`;
    ascii += `  Contradiction: ${thought.truthTable.isContradiction ? "\u2713" : "\u2717"}
`;
    ascii += `  Contingent: ${thought.truthTable.isContingent ? "\u2713" : "\u2717"}
`;
  }
  return ascii;
}
var init_formal_logic = __esm({
  "src/export/visual/formal-logic.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/mathematics.ts
function exportMathematicsDerivation(thought, options) {
  const { format, colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  switch (format) {
    case "mermaid":
      return mathematicsToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return mathematicsToDOT(thought, includeLabels, includeMetrics);
    case "ascii":
      return mathematicsToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function mathematicsToMermaid(thought, colorScheme, includeLabels, includeMetrics) {
  let mermaid = "graph TB\n";
  const typeId = sanitizeId(`type_${thought.thoughtType || "proof"}`);
  const typeLabel = includeLabels ? (thought.thoughtType || "Proof").replace(/_/g, " ") : typeId;
  mermaid += `  ${typeId}[["${typeLabel}"]]
`;
  if (thought.proofStrategy) {
    const strategyId = sanitizeId("strategy");
    const strategyLabel = thought.proofStrategy.type;
    mermaid += `  ${strategyId}(["${strategyLabel}"])
`;
    mermaid += `  ${typeId} --> ${strategyId}
`;
    let prevStepId = strategyId;
    thought.proofStrategy.steps.forEach((step, index) => {
      const stepId = sanitizeId(`step_${index}`);
      const stepLabel = includeLabels ? step.slice(0, 40) + (step.length > 40 ? "..." : "") : `Step ${index + 1}`;
      mermaid += `  ${stepId}["${stepLabel}"]
`;
      mermaid += `  ${prevStepId} --> ${stepId}
`;
      prevStepId = stepId;
    });
    if (includeMetrics) {
      const completenessId = sanitizeId("completeness");
      const completenessLabel = `Completeness: ${(thought.proofStrategy.completeness * 100).toFixed(0)}%`;
      mermaid += `  ${completenessId}{{${completenessLabel}}}
`;
      mermaid += `  ${prevStepId} --> ${completenessId}
`;
    }
  }
  if (thought.mathematicalModel) {
    const modelId = sanitizeId("model");
    const modelLabel = thought.mathematicalModel.symbolic || "Mathematical Model";
    mermaid += `  ${modelId}["${modelLabel}"]
`;
    mermaid += `  ${typeId} --> ${modelId}
`;
  }
  if (thought.theorems && thought.theorems.length > 0) {
    thought.theorems.forEach((theorem, index) => {
      const theoremId = sanitizeId(`theorem_${index}`);
      const theoremLabel = theorem.name || `Theorem ${index + 1}`;
      mermaid += `  ${theoremId}[/"${theoremLabel}"/]
`;
      mermaid += `  ${typeId} --> ${theoremId}
`;
    });
  }
  if (thought.assumptions && thought.assumptions.length > 0) {
    const assumptionsId = sanitizeId("assumptions");
    mermaid += `  ${assumptionsId}>"Assumptions: ${thought.assumptions.length}"]
`;
  }
  if (colorScheme !== "monochrome") {
    const colors = colorScheme === "pastel" ? { type: "#e8f4e8", strategy: "#fff3e0"} : { type: "#90EE90", strategy: "#FFD700"};
    mermaid += `
  style ${typeId} fill:${colors.type}
`;
    if (thought.proofStrategy) {
      mermaid += `  style ${sanitizeId("strategy")} fill:${colors.strategy}
`;
    }
  }
  return mermaid;
}
function mathematicsToDOT(thought, includeLabels, includeMetrics) {
  let dot = "digraph MathematicsDerivation {\n";
  dot += "  rankdir=TB;\n";
  dot += "  node [shape=box, style=rounded];\n\n";
  const typeId = sanitizeId(`type_${thought.thoughtType || "proof"}`);
  const typeLabel = includeLabels ? (thought.thoughtType || "Proof").replace(/_/g, " ") : typeId;
  dot += `  ${typeId} [label="${typeLabel}", shape=doubleoctagon];
`;
  if (thought.proofStrategy) {
    const strategyId = sanitizeId("strategy");
    dot += `  ${strategyId} [label="${thought.proofStrategy.type}", shape=ellipse];
`;
    dot += `  ${typeId} -> ${strategyId};
`;
    let prevStepId = strategyId;
    thought.proofStrategy.steps.forEach((step, index) => {
      const stepId = sanitizeId(`step_${index}`);
      const stepLabel = includeLabels ? step.slice(0, 30).replace(/"/g, '\\"') : `Step ${index + 1}`;
      dot += `  ${stepId} [label="${stepLabel}"];
`;
      dot += `  ${prevStepId} -> ${stepId};
`;
      prevStepId = stepId;
    });
    if (includeMetrics) {
      const completenessId = sanitizeId("completeness");
      dot += `  ${completenessId} [label="${(thought.proofStrategy.completeness * 100).toFixed(0)}%", shape=diamond];
`;
      dot += `  ${prevStepId} -> ${completenessId};
`;
    }
  }
  if (thought.theorems) {
    thought.theorems.forEach((theorem, index) => {
      const theoremId = sanitizeId(`theorem_${index}`);
      dot += `  ${theoremId} [label="${theorem.name || `Theorem ${index + 1}`}", shape=parallelogram];
`;
      dot += `  ${typeId} -> ${theoremId};
`;
    });
  }
  dot += "}\n";
  return dot;
}
function mathematicsToASCII(thought) {
  let ascii = "Mathematics Derivation:\n";
  ascii += "=======================\n\n";
  ascii += `Type: ${(thought.thoughtType || "proof").replace(/_/g, " ")}
`;
  ascii += `Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%

`;
  if (thought.mathematicalModel) {
    ascii += "Mathematical Model:\n";
    ascii += `  LaTeX: ${thought.mathematicalModel.latex}
`;
    ascii += `  Symbolic: ${thought.mathematicalModel.symbolic}
`;
    if (thought.mathematicalModel.ascii) {
      ascii += `  ASCII: ${thought.mathematicalModel.ascii}
`;
    }
    ascii += "\n";
  }
  if (thought.proofStrategy) {
    ascii += `Proof Strategy: ${thought.proofStrategy.type}
`;
    ascii += `Completeness: ${(thought.proofStrategy.completeness * 100).toFixed(0)}%
`;
    ascii += "Steps:\n";
    thought.proofStrategy.steps.forEach((step, index) => {
      ascii += `  ${index + 1}. ${step}
`;
    });
    if (thought.proofStrategy.baseCase) {
      ascii += `Base Case: ${thought.proofStrategy.baseCase}
`;
    }
    if (thought.proofStrategy.inductiveStep) {
      ascii += `Inductive Step: ${thought.proofStrategy.inductiveStep}
`;
    }
    ascii += "\n";
  }
  if (thought.theorems && thought.theorems.length > 0) {
    ascii += "Theorems:\n";
    thought.theorems.forEach((theorem, index) => {
      ascii += `  [${index + 1}] ${theorem.name}: ${theorem.statement}
`;
      if (theorem.hypotheses.length > 0) {
        ascii += `      Hypotheses: ${theorem.hypotheses.join(", ")}
`;
      }
      ascii += `      Conclusion: ${theorem.conclusion}
`;
    });
    ascii += "\n";
  }
  if (thought.assumptions && thought.assumptions.length > 0) {
    ascii += "Assumptions:\n";
    thought.assumptions.forEach((assumption, index) => {
      ascii += `  ${index + 1}. ${assumption}
`;
    });
    ascii += "\n";
  }
  if (thought.dependencies && thought.dependencies.length > 0) {
    ascii += "Dependencies:\n";
    thought.dependencies.forEach((dep, index) => {
      ascii += `  ${index + 1}. ${dep}
`;
    });
  }
  return ascii;
}
var init_mathematics = __esm({
  "src/export/visual/mathematics.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/physics.ts
function exportPhysicsVisualization(thought, options) {
  const { format, colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  switch (format) {
    case "mermaid":
      return physicsToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return physicsToDOT(thought, includeLabels, includeMetrics);
    case "ascii":
      return physicsToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function physicsToMermaid(thought, colorScheme, includeLabels, includeMetrics) {
  let mermaid = "graph TB\n";
  const typeId = sanitizeId(`type_${thought.thoughtType || "physics"}`);
  const typeLabel = includeLabels ? (thought.thoughtType || "Physics").replace(/_/g, " ") : typeId;
  mermaid += `  ${typeId}[["${typeLabel}"]]
`;
  if (thought.tensorProperties) {
    const tensorId = sanitizeId("tensor");
    const rankLabel = `Rank (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`;
    mermaid += `  ${tensorId}(["${rankLabel}"])
`;
    mermaid += `  ${typeId} --> ${tensorId}
`;
    const compId = sanitizeId("components");
    const compLabel = includeLabels ? thought.tensorProperties.components.slice(0, 30) + (thought.tensorProperties.components.length > 30 ? "..." : "") : "Components";
    mermaid += `  ${compId}["${compLabel}"]
`;
    mermaid += `  ${tensorId} --> ${compId}
`;
    if (thought.tensorProperties.symmetries.length > 0) {
      const symId = sanitizeId("symmetries");
      mermaid += `  ${symId}{{"Symmetries: ${thought.tensorProperties.symmetries.length}"}}
`;
      mermaid += `  ${tensorId} --> ${symId}
`;
    }
    if (thought.tensorProperties.invariants.length > 0) {
      const invId = sanitizeId("invariants");
      mermaid += `  ${invId}{{"Invariants: ${thought.tensorProperties.invariants.length}"}}
`;
      mermaid += `  ${tensorId} --> ${invId}
`;
    }
  }
  if (thought.physicalInterpretation) {
    const interpId = sanitizeId("interpretation");
    const interpLabel = thought.physicalInterpretation.quantity;
    mermaid += `  ${interpId}[/"${interpLabel}"/]
`;
    mermaid += `  ${typeId} --> ${interpId}
`;
    const unitsId = sanitizeId("units");
    mermaid += `  ${unitsId}(["${thought.physicalInterpretation.units}"])
`;
    mermaid += `  ${interpId} --> ${unitsId}
`;
    if (thought.physicalInterpretation.conservationLaws.length > 0) {
      thought.physicalInterpretation.conservationLaws.forEach((law, index) => {
        const lawId = sanitizeId(`conservation_${index}`);
        const lawLabel = includeLabels ? law.slice(0, 25) + (law.length > 25 ? "..." : "") : `Law ${index + 1}`;
        mermaid += `  ${lawId}>"${lawLabel}"]
`;
        mermaid += `  ${interpId} --> ${lawId}
`;
      });
    }
  }
  if (thought.fieldTheoryContext) {
    const fieldId = sanitizeId("field_theory");
    mermaid += `  ${fieldId}[("Field Theory")]
`;
    mermaid += `  ${typeId} --> ${fieldId}
`;
    thought.fieldTheoryContext.fields.forEach((field, index) => {
      const fId = sanitizeId(`field_${index}`);
      mermaid += `  ${fId}["${field}"]
`;
      mermaid += `  ${fieldId} --> ${fId}
`;
    });
    const symGroupId = sanitizeId("symmetry_group");
    mermaid += `  ${symGroupId}{{"${thought.fieldTheoryContext.symmetryGroup}"}}
`;
    mermaid += `  ${fieldId} --> ${symGroupId}
`;
  }
  if (includeMetrics) {
    const uncertId = sanitizeId("uncertainty");
    const uncertLabel = `Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%`;
    mermaid += `  ${uncertId}{{${uncertLabel}}}
`;
  }
  if (thought.assumptions && thought.assumptions.length > 0) {
    const assumptionsId = sanitizeId("assumptions");
    mermaid += `  ${assumptionsId}>"Assumptions: ${thought.assumptions.length}"]
`;
  }
  if (colorScheme !== "monochrome") {
    const colors = colorScheme === "pastel" ? { type: "#e3f2fd", tensor: "#fff3e0", interp: "#e8f5e9" } : { type: "#87CEEB", tensor: "#FFD700", interp: "#90EE90" };
    mermaid += `
  style ${typeId} fill:${colors.type}
`;
    if (thought.tensorProperties) {
      mermaid += `  style ${sanitizeId("tensor")} fill:${colors.tensor}
`;
    }
    if (thought.physicalInterpretation) {
      mermaid += `  style ${sanitizeId("interpretation")} fill:${colors.interp}
`;
    }
  }
  return mermaid;
}
function physicsToDOT(thought, includeLabels, includeMetrics) {
  let dot = "digraph PhysicsVisualization {\n";
  dot += "  rankdir=TB;\n";
  dot += "  node [shape=box, style=rounded];\n\n";
  const typeId = sanitizeId(`type_${thought.thoughtType || "physics"}`);
  const typeLabel = includeLabels ? (thought.thoughtType || "Physics").replace(/_/g, " ") : typeId;
  dot += `  ${typeId} [label="${typeLabel}", shape=doubleoctagon];
`;
  if (thought.tensorProperties) {
    const tensorId = sanitizeId("tensor");
    const rankLabel = `Rank (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`;
    dot += `  ${tensorId} [label="${rankLabel}", shape=ellipse];
`;
    dot += `  ${typeId} -> ${tensorId};
`;
    const compId = sanitizeId("components");
    const compLabel = includeLabels ? thought.tensorProperties.components.slice(0, 25).replace(/"/g, '\\"') : "Components";
    dot += `  ${compId} [label="${compLabel}"];
`;
    dot += `  ${tensorId} -> ${compId};
`;
    const transId = sanitizeId("transformation");
    dot += `  ${transId} [label="${thought.tensorProperties.transformation}", shape=diamond];
`;
    dot += `  ${tensorId} -> ${transId};
`;
  }
  if (thought.physicalInterpretation) {
    const interpId = sanitizeId("interpretation");
    dot += `  ${interpId} [label="${thought.physicalInterpretation.quantity}", shape=parallelogram];
`;
    dot += `  ${typeId} -> ${interpId};
`;
    const unitsId = sanitizeId("units");
    dot += `  ${unitsId} [label="${thought.physicalInterpretation.units}", shape=ellipse];
`;
    dot += `  ${interpId} -> ${unitsId};
`;
    thought.physicalInterpretation.conservationLaws.forEach((law, index) => {
      const lawId = sanitizeId(`conservation_${index}`);
      const lawLabel = includeLabels ? law.slice(0, 20).replace(/"/g, '\\"') : `Law ${index + 1}`;
      dot += `  ${lawId} [label="${lawLabel}", shape=hexagon];
`;
      dot += `  ${interpId} -> ${lawId};
`;
    });
  }
  if (thought.fieldTheoryContext) {
    const fieldId = sanitizeId("field_theory");
    dot += `  ${fieldId} [label="Field Theory", shape=cylinder];
`;
    dot += `  ${typeId} -> ${fieldId};
`;
    thought.fieldTheoryContext.fields.forEach((field, index) => {
      const fId = sanitizeId(`field_${index}`);
      dot += `  ${fId} [label="${field}"];
`;
      dot += `  ${fieldId} -> ${fId};
`;
    });
    const symGroupId = sanitizeId("symmetry_group");
    dot += `  ${symGroupId} [label="${thought.fieldTheoryContext.symmetryGroup}", shape=diamond];
`;
    dot += `  ${fieldId} -> ${symGroupId};
`;
  }
  if (includeMetrics) {
    const uncertId = sanitizeId("uncertainty");
    dot += `  ${uncertId} [label="${(thought.uncertainty * 100).toFixed(1)}%", shape=diamond];
`;
  }
  dot += "}\n";
  return dot;
}
function physicsToASCII(thought) {
  let ascii = "Physics Analysis:\n";
  ascii += "=================\n\n";
  ascii += `Type: ${(thought.thoughtType || "physics").replace(/_/g, " ")}
`;
  ascii += `Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%

`;
  if (thought.tensorProperties) {
    ascii += "Tensor Properties:\n";
    ascii += `  Rank: (${thought.tensorProperties.rank[0]}, ${thought.tensorProperties.rank[1]})
`;
    ascii += `  Components: ${thought.tensorProperties.components}
`;
    ascii += `  LaTeX: ${thought.tensorProperties.latex}
`;
    ascii += `  Transformation: ${thought.tensorProperties.transformation}
`;
    if (thought.tensorProperties.indexStructure) {
      ascii += `  Index Structure: ${thought.tensorProperties.indexStructure}
`;
    }
    if (thought.tensorProperties.coordinateSystem) {
      ascii += `  Coordinate System: ${thought.tensorProperties.coordinateSystem}
`;
    }
    if (thought.tensorProperties.symmetries.length > 0) {
      ascii += "  Symmetries:\n";
      thought.tensorProperties.symmetries.forEach((sym, index) => {
        ascii += `    ${index + 1}. ${sym}
`;
      });
    }
    if (thought.tensorProperties.invariants.length > 0) {
      ascii += "  Invariants:\n";
      thought.tensorProperties.invariants.forEach((inv, index) => {
        ascii += `    ${index + 1}. ${inv}
`;
      });
    }
    ascii += "\n";
  }
  if (thought.physicalInterpretation) {
    ascii += "Physical Interpretation:\n";
    ascii += `  Quantity: ${thought.physicalInterpretation.quantity}
`;
    ascii += `  Units: ${thought.physicalInterpretation.units}
`;
    if (thought.physicalInterpretation.conservationLaws.length > 0) {
      ascii += "  Conservation Laws:\n";
      thought.physicalInterpretation.conservationLaws.forEach((law, index) => {
        ascii += `    ${index + 1}. ${law}
`;
      });
    }
    if (thought.physicalInterpretation.constraints && thought.physicalInterpretation.constraints.length > 0) {
      ascii += "  Constraints:\n";
      thought.physicalInterpretation.constraints.forEach((constraint, index) => {
        ascii += `    ${index + 1}. ${constraint}
`;
      });
    }
    if (thought.physicalInterpretation.observables && thought.physicalInterpretation.observables.length > 0) {
      ascii += "  Observables:\n";
      thought.physicalInterpretation.observables.forEach((obs, index) => {
        ascii += `    ${index + 1}. ${obs}
`;
      });
    }
    ascii += "\n";
  }
  if (thought.fieldTheoryContext) {
    ascii += "Field Theory Context:\n";
    ascii += `  Symmetry Group: ${thought.fieldTheoryContext.symmetryGroup}
`;
    if (thought.fieldTheoryContext.fields.length > 0) {
      ascii += "  Fields:\n";
      thought.fieldTheoryContext.fields.forEach((field, index) => {
        ascii += `    ${index + 1}. ${field}
`;
      });
    }
    if (thought.fieldTheoryContext.interactions.length > 0) {
      ascii += "  Interactions:\n";
      thought.fieldTheoryContext.interactions.forEach((interaction, index) => {
        ascii += `    ${index + 1}. ${interaction}
`;
      });
    }
    if (thought.fieldTheoryContext.gaugeSymmetries && thought.fieldTheoryContext.gaugeSymmetries.length > 0) {
      ascii += "  Gauge Symmetries:\n";
      thought.fieldTheoryContext.gaugeSymmetries.forEach((gauge, index) => {
        ascii += `    ${index + 1}. ${gauge}
`;
      });
    }
    ascii += "\n";
  }
  if (thought.assumptions && thought.assumptions.length > 0) {
    ascii += "Assumptions:\n";
    thought.assumptions.forEach((assumption, index) => {
      ascii += `  ${index + 1}. ${assumption}
`;
    });
    ascii += "\n";
  }
  if (thought.dependencies && thought.dependencies.length > 0) {
    ascii += "Dependencies:\n";
    thought.dependencies.forEach((dep, index) => {
      ascii += `  ${index + 1}. ${dep}
`;
    });
  }
  return ascii;
}
var init_physics = __esm({
  "src/export/visual/physics.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/hybrid.ts
function exportHybridOrchestration(thought, options) {
  const { format, colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  switch (format) {
    case "mermaid":
      return hybridToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return hybridToDOT(thought, includeLabels, includeMetrics);
    case "ascii":
      return hybridToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function hybridToMermaid(thought, colorScheme, includeLabels, includeMetrics) {
  let mermaid = "graph TB\n";
  const hybridId = sanitizeId("hybrid_mode");
  mermaid += `  ${hybridId}(("Hybrid Mode"))
`;
  const primaryId = sanitizeId(`primary_${thought.primaryMode}`);
  const primaryLabel = includeLabels ? thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1) : primaryId;
  mermaid += `  ${primaryId}[["${primaryLabel}"]]
`;
  mermaid += `  ${hybridId} ==> ${primaryId}
`;
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    const secondaryId = sanitizeId("secondary_features");
    mermaid += `  ${secondaryId}(["Secondary Features"])
`;
    mermaid += `  ${hybridId} --> ${secondaryId}
`;
    thought.secondaryFeatures.forEach((feature, index) => {
      const featureId = sanitizeId(`feature_${index}`);
      const featureLabel = includeLabels ? feature.slice(0, 30) + (feature.length > 30 ? "..." : "") : `Feature ${index + 1}`;
      mermaid += `  ${featureId}["${featureLabel}"]
`;
      mermaid += `  ${secondaryId} --> ${featureId}
`;
    });
  }
  if (thought.switchReason) {
    const switchId = sanitizeId("switch_reason");
    const switchLabel = includeLabels ? thought.switchReason.slice(0, 40) + (thought.switchReason.length > 40 ? "..." : "") : "Switch Reason";
    mermaid += `  ${switchId}>"${switchLabel}"]
`;
    mermaid += `  ${hybridId} -.-> ${switchId}
`;
  }
  if (thought.stage) {
    const stageId = sanitizeId(`stage_${thought.stage}`);
    const stageLabel = thought.stage.replace(/_/g, " ");
    mermaid += `  ${stageId}{{"Stage: ${stageLabel}"}}
`;
    mermaid += `  ${primaryId} --> ${stageId}
`;
  }
  if (thought.mathematicalModel) {
    const modelId = sanitizeId("math_model");
    const modelLabel = thought.mathematicalModel.symbolic || "Mathematical Model";
    mermaid += `  ${modelId}["${modelLabel}"]
`;
    mermaid += `  ${primaryId} --> ${modelId}
`;
  }
  if (thought.tensorProperties) {
    const tensorId = sanitizeId("tensor");
    const tensorLabel = `Tensor (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`;
    mermaid += `  ${tensorId}[/"${tensorLabel}"/]
`;
    mermaid += `  ${primaryId} --> ${tensorId}
`;
  }
  if (thought.physicalInterpretation) {
    const physId = sanitizeId("physical");
    mermaid += `  ${physId}[/"${thought.physicalInterpretation.quantity}"/]
`;
    mermaid += `  ${primaryId} --> ${physId}
`;
  }
  if (includeMetrics && thought.uncertainty !== void 0) {
    const uncertId = sanitizeId("uncertainty");
    const uncertLabel = `Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%`;
    mermaid += `  ${uncertId}{{${uncertLabel}}}
`;
  }
  if (thought.assumptions && thought.assumptions.length > 0) {
    const assumptionsId = sanitizeId("assumptions");
    mermaid += `  ${assumptionsId}>"Assumptions: ${thought.assumptions.length}"]
`;
  }
  if (thought.dependencies && thought.dependencies.length > 0) {
    const depsId = sanitizeId("dependencies");
    mermaid += `  ${depsId}>"Dependencies: ${thought.dependencies.length}"]
`;
  }
  if (colorScheme !== "monochrome") {
    const colors = colorScheme === "pastel" ? { hybrid: "#e8f4e8", primary: "#e3f2fd", secondary: "#fff3e0" } : { hybrid: "#90EE90", primary: "#87CEEB", secondary: "#FFD700" };
    mermaid += `
  style ${hybridId} fill:${colors.hybrid}
`;
    mermaid += `  style ${primaryId} fill:${colors.primary}
`;
    if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
      mermaid += `  style ${sanitizeId("secondary_features")} fill:${colors.secondary}
`;
    }
  }
  return mermaid;
}
function hybridToDOT(thought, includeLabels, includeMetrics) {
  let dot = "digraph HybridOrchestration {\n";
  dot += "  rankdir=TB;\n";
  dot += "  node [shape=box, style=rounded];\n\n";
  const hybridId = sanitizeId("hybrid_mode");
  dot += `  ${hybridId} [label="Hybrid Mode", shape=doubleoctagon];
`;
  const primaryId = sanitizeId(`primary_${thought.primaryMode}`);
  const primaryLabel = thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1);
  dot += `  ${primaryId} [label="${primaryLabel}", shape=box, style="filled,rounded", fillcolor=lightblue];
`;
  dot += `  ${hybridId} -> ${primaryId} [style=bold, penwidth=2];
`;
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    const secondaryId = sanitizeId("secondary_features");
    dot += `  ${secondaryId} [label="Secondary Features", shape=ellipse];
`;
    dot += `  ${hybridId} -> ${secondaryId};
`;
    thought.secondaryFeatures.forEach((feature, index) => {
      const featureId = sanitizeId(`feature_${index}`);
      const featureLabel = includeLabels ? feature.slice(0, 25).replace(/"/g, '\\"') : `Feature ${index + 1}`;
      dot += `  ${featureId} [label="${featureLabel}"];
`;
      dot += `  ${secondaryId} -> ${featureId};
`;
    });
  }
  if (thought.switchReason) {
    const switchId = sanitizeId("switch_reason");
    const switchLabel = includeLabels ? thought.switchReason.slice(0, 30).replace(/"/g, '\\"') : "Switch Reason";
    dot += `  ${switchId} [label="${switchLabel}", shape=note];
`;
    dot += `  ${hybridId} -> ${switchId} [style=dashed];
`;
  }
  if (thought.stage) {
    const stageId = sanitizeId(`stage_${thought.stage}`);
    dot += `  ${stageId} [label="${thought.stage.replace(/_/g, " ")}", shape=diamond];
`;
    dot += `  ${primaryId} -> ${stageId};
`;
  }
  if (thought.mathematicalModel) {
    const modelId = sanitizeId("math_model");
    const modelLabel = thought.mathematicalModel.symbolic ? thought.mathematicalModel.symbolic.slice(0, 25).replace(/"/g, '\\"') : "Math Model";
    dot += `  ${modelId} [label="${modelLabel}", shape=parallelogram];
`;
    dot += `  ${primaryId} -> ${modelId};
`;
  }
  if (thought.tensorProperties) {
    const tensorId = sanitizeId("tensor");
    dot += `  ${tensorId} [label="Tensor (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})", shape=parallelogram];
`;
    dot += `  ${primaryId} -> ${tensorId};
`;
  }
  if (thought.physicalInterpretation) {
    const physId = sanitizeId("physical");
    dot += `  ${physId} [label="${thought.physicalInterpretation.quantity}", shape=parallelogram];
`;
    dot += `  ${primaryId} -> ${physId};
`;
  }
  if (includeMetrics && thought.uncertainty !== void 0) {
    const uncertId = sanitizeId("uncertainty");
    dot += `  ${uncertId} [label="${(thought.uncertainty * 100).toFixed(1)}%", shape=diamond];
`;
  }
  dot += "}\n";
  return dot;
}
function hybridToASCII(thought) {
  let ascii = "Hybrid Mode Orchestration:\n";
  ascii += "==========================\n\n";
  ascii += `Primary Mode: ${thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1)}
`;
  if (thought.stage) {
    ascii += `Current Stage: ${thought.stage.replace(/_/g, " ")}
`;
  }
  if (thought.uncertainty !== void 0) {
    ascii += `Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%
`;
  }
  ascii += "\n";
  if (thought.switchReason) {
    ascii += `Switch Reason: ${thought.switchReason}

`;
  }
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    ascii += "Secondary Features:\n";
    thought.secondaryFeatures.forEach((feature, index) => {
      ascii += `  ${index + 1}. ${feature}
`;
    });
    ascii += "\n";
  }
  if (thought.mathematicalModel) {
    ascii += "Mathematical Model:\n";
    ascii += `  LaTeX: ${thought.mathematicalModel.latex}
`;
    ascii += `  Symbolic: ${thought.mathematicalModel.symbolic}
`;
    if (thought.mathematicalModel.ascii) {
      ascii += `  ASCII: ${thought.mathematicalModel.ascii}
`;
    }
    ascii += "\n";
  }
  if (thought.tensorProperties) {
    ascii += "Tensor Properties:\n";
    ascii += `  Rank: (${thought.tensorProperties.rank[0]}, ${thought.tensorProperties.rank[1]})
`;
    ascii += `  Components: ${thought.tensorProperties.components}
`;
    ascii += `  Transformation: ${thought.tensorProperties.transformation}
`;
    if (thought.tensorProperties.symmetries.length > 0) {
      ascii += "  Symmetries:\n";
      thought.tensorProperties.symmetries.forEach((sym, index) => {
        ascii += `    ${index + 1}. ${sym}
`;
      });
    }
    ascii += "\n";
  }
  if (thought.physicalInterpretation) {
    ascii += "Physical Interpretation:\n";
    ascii += `  Quantity: ${thought.physicalInterpretation.quantity}
`;
    ascii += `  Units: ${thought.physicalInterpretation.units}
`;
    if (thought.physicalInterpretation.conservationLaws.length > 0) {
      ascii += "  Conservation Laws:\n";
      thought.physicalInterpretation.conservationLaws.forEach((law, index) => {
        ascii += `    ${index + 1}. ${law}
`;
      });
    }
    ascii += "\n";
  }
  if (thought.assumptions && thought.assumptions.length > 0) {
    ascii += "Assumptions:\n";
    thought.assumptions.forEach((assumption, index) => {
      ascii += `  ${index + 1}. ${assumption}
`;
    });
    ascii += "\n";
  }
  if (thought.dependencies && thought.dependencies.length > 0) {
    ascii += "Dependencies:\n";
    thought.dependencies.forEach((dep, index) => {
      ascii += `  ${index + 1}. ${dep}
`;
    });
    ascii += "\n";
  }
  if (thought.revisionReason) {
    ascii += `Revision Reason: ${thought.revisionReason}
`;
  }
  return ascii;
}
var init_hybrid = __esm({
  "src/export/visual/hybrid.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/metareasoning.ts
function exportMetaReasoningVisualization(thought, options) {
  const { format, colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  switch (format) {
    case "mermaid":
      return metaReasoningToMermaid(thought, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return metaReasoningToDOT(thought, includeLabels, includeMetrics);
    case "ascii":
      return metaReasoningToASCII(thought);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function metaReasoningToMermaid(thought, colorScheme, includeLabels, includeMetrics) {
  let mermaid = "graph TB\n";
  const metaId = sanitizeId("meta_reasoning");
  mermaid += `  ${metaId}(("Meta-Reasoning"))
`;
  const currentId = sanitizeId("current_strategy");
  const currentLabel = includeLabels ? thought.currentStrategy.approach : "Current Strategy";
  mermaid += `  ${currentId}[["${currentLabel}"]]
`;
  mermaid += `  ${metaId} ==> ${currentId}
`;
  const modeId = sanitizeId("current_mode");
  mermaid += `  ${modeId}(["Mode: ${thought.currentStrategy.mode}"])
`;
  mermaid += `  ${currentId} --> ${modeId}
`;
  const evalId = sanitizeId("evaluation");
  mermaid += `  ${evalId}{{"Effectiveness: ${(thought.strategyEvaluation.effectiveness * 100).toFixed(0)}%"}}
`;
  mermaid += `  ${currentId} --> ${evalId}
`;
  if (thought.strategyEvaluation.issues.length > 0) {
    const issuesId = sanitizeId("issues");
    mermaid += `  ${issuesId}>"Issues: ${thought.strategyEvaluation.issues.length}"]
`;
    mermaid += `  ${evalId} --> ${issuesId}
`;
  }
  if (thought.strategyEvaluation.strengths.length > 0) {
    const strengthsId = sanitizeId("strengths");
    mermaid += `  ${strengthsId}>"Strengths: ${thought.strategyEvaluation.strengths.length}"]
`;
    mermaid += `  ${evalId} --> ${strengthsId}
`;
  }
  if (thought.alternativeStrategies.length > 0) {
    const altsId = sanitizeId("alternatives");
    mermaid += `  ${altsId}(["Alternative Strategies"])
`;
    mermaid += `  ${metaId} --> ${altsId}
`;
    thought.alternativeStrategies.forEach((alt, index) => {
      const altId = sanitizeId(`alt_${index}`);
      const altLabel = includeLabels ? `${alt.mode}: ${(alt.recommendationScore * 100).toFixed(0)}%` : `Alt ${index + 1}`;
      mermaid += `  ${altId}["${altLabel}"]
`;
      mermaid += `  ${altsId} --> ${altId}
`;
    });
  }
  const recId = sanitizeId("recommendation");
  const recLabel = `${thought.recommendation.action}${thought.recommendation.targetMode ? ` \u2192 ${thought.recommendation.targetMode}` : ""}`;
  mermaid += `  ${recId}[/"${recLabel}"/]
`;
  mermaid += `  ${metaId} ==> ${recId}
`;
  if (includeMetrics) {
    const confId = sanitizeId("rec_confidence");
    mermaid += `  ${confId}{{"Confidence: ${(thought.recommendation.confidence * 100).toFixed(0)}%"}}
`;
    mermaid += `  ${recId} --> ${confId}
`;
  }
  if (includeMetrics) {
    const qualityId = sanitizeId("quality");
    const qualityLabel = `Quality: ${(thought.qualityMetrics.overallQuality * 100).toFixed(0)}%`;
    mermaid += `  ${qualityId}{{"${qualityLabel}"}}
`;
    mermaid += `  ${metaId} -.-> ${qualityId}
`;
  }
  const resourceId = sanitizeId("resources");
  mermaid += `  ${resourceId}[("Complexity: ${thought.resourceAllocation.complexityLevel}")]
`;
  mermaid += `  ${metaId} -.-> ${resourceId}
`;
  const sessionId = sanitizeId("session");
  mermaid += `  ${sessionId}>"Thoughts: ${thought.sessionContext.totalThoughts}"]
`;
  mermaid += `  ${metaId} -.-> ${sessionId}
`;
  if (colorScheme !== "monochrome") {
    const colors = colorScheme === "pastel" ? { meta: "#f3e5f5", current: "#e3f2fd", rec: "#e8f5e9", alt: "#fff3e0" } : { meta: "#DDA0DD", current: "#87CEEB", rec: "#90EE90", alt: "#FFD700" };
    mermaid += `
  style ${metaId} fill:${colors.meta}
`;
    mermaid += `  style ${currentId} fill:${colors.current}
`;
    mermaid += `  style ${recId} fill:${colors.rec}
`;
    if (thought.alternativeStrategies.length > 0) {
      mermaid += `  style ${sanitizeId("alternatives")} fill:${colors.alt}
`;
    }
  }
  return mermaid;
}
function metaReasoningToDOT(thought, includeLabels, includeMetrics) {
  let dot = "digraph MetaReasoning {\n";
  dot += "  rankdir=TB;\n";
  dot += "  node [shape=box, style=rounded];\n\n";
  dot += "  subgraph cluster_current {\n";
  dot += '    label="Current Strategy";\n';
  dot += "    style=filled;\n";
  dot += "    fillcolor=lightblue;\n";
  const currentId = sanitizeId("current_strategy");
  const currentLabel = includeLabels ? thought.currentStrategy.approach.slice(0, 30).replace(/"/g, '\\"') : "Current Strategy";
  dot += `    ${currentId} [label="${currentLabel}"];
`;
  const modeId = sanitizeId("current_mode");
  dot += `    ${modeId} [label="${thought.currentStrategy.mode}", shape=ellipse];
`;
  dot += `    ${currentId} -> ${modeId};
`;
  if (includeMetrics) {
    const evalId = sanitizeId("evaluation");
    dot += `    ${evalId} [label="Eff: ${(thought.strategyEvaluation.effectiveness * 100).toFixed(0)}%", shape=diamond];
`;
    dot += `    ${currentId} -> ${evalId};
`;
  }
  dot += "  }\n\n";
  if (thought.alternativeStrategies.length > 0) {
    dot += "  subgraph cluster_alternatives {\n";
    dot += '    label="Alternatives";\n';
    dot += "    style=filled;\n";
    dot += "    fillcolor=lightyellow;\n";
    thought.alternativeStrategies.forEach((alt, index) => {
      const altId = sanitizeId(`alt_${index}`);
      const altLabel = `${alt.mode}\\n${(alt.recommendationScore * 100).toFixed(0)}%`;
      dot += `    ${altId} [label="${altLabel}"];
`;
    });
    dot += "  }\n\n";
  }
  const recId = sanitizeId("recommendation");
  const recLabel = `${thought.recommendation.action}${thought.recommendation.targetMode ? `\\n\u2192 ${thought.recommendation.targetMode}` : ""}`;
  dot += `  ${recId} [label="${recLabel}", shape=hexagon, style="filled", fillcolor=lightgreen];
`;
  if (includeMetrics) {
    const qualityId = sanitizeId("quality");
    const qualityLabel = `Quality: ${(thought.qualityMetrics.overallQuality * 100).toFixed(0)}%`;
    dot += `  ${qualityId} [label="${qualityLabel}", shape=diamond];
`;
  }
  dot += `  ${currentId} -> ${recId} [style=bold, penwidth=2];
`;
  thought.alternativeStrategies.forEach((_, index) => {
    const altId = sanitizeId(`alt_${index}`);
    dot += `  ${altId} -> ${recId} [style=dashed];
`;
  });
  dot += "}\n";
  return dot;
}
function metaReasoningToASCII(thought) {
  let ascii = "Meta-Reasoning Analysis:\n";
  ascii += "========================\n\n";
  ascii += "CURRENT STRATEGY\n";
  ascii += "----------------\n";
  ascii += `Mode: ${thought.currentStrategy.mode}
`;
  ascii += `Approach: ${thought.currentStrategy.approach}
`;
  ascii += `Thoughts Spent: ${thought.currentStrategy.thoughtsSpent}
`;
  if (thought.currentStrategy.progressIndicators.length > 0) {
    ascii += "Progress Indicators:\n";
    thought.currentStrategy.progressIndicators.forEach((ind, index) => {
      ascii += `  ${index + 1}. ${ind}
`;
    });
  }
  ascii += "\n";
  ascii += "STRATEGY EVALUATION\n";
  ascii += "-------------------\n";
  ascii += `Effectiveness: ${(thought.strategyEvaluation.effectiveness * 100).toFixed(1)}%
`;
  ascii += `Efficiency: ${(thought.strategyEvaluation.efficiency * 100).toFixed(1)}%
`;
  ascii += `Confidence: ${(thought.strategyEvaluation.confidence * 100).toFixed(1)}%
`;
  ascii += `Progress Rate: ${thought.strategyEvaluation.progressRate.toFixed(2)} insights/thought
`;
  ascii += `Quality Score: ${(thought.strategyEvaluation.qualityScore * 100).toFixed(1)}%
`;
  if (thought.strategyEvaluation.strengths.length > 0) {
    ascii += "Strengths:\n";
    thought.strategyEvaluation.strengths.forEach((s, index) => {
      ascii += `  + ${index + 1}. ${s}
`;
    });
  }
  if (thought.strategyEvaluation.issues.length > 0) {
    ascii += "Issues:\n";
    thought.strategyEvaluation.issues.forEach((issue, index) => {
      ascii += `  - ${index + 1}. ${issue}
`;
    });
  }
  ascii += "\n";
  if (thought.alternativeStrategies.length > 0) {
    ascii += "ALTERNATIVE STRATEGIES\n";
    ascii += "----------------------\n";
    thought.alternativeStrategies.forEach((alt, index) => {
      ascii += `[${index + 1}] ${alt.mode}
`;
      ascii += `    Reasoning: ${alt.reasoning}
`;
      ascii += `    Expected Benefit: ${alt.expectedBenefit}
`;
      ascii += `    Switching Cost: ${(alt.switchingCost * 100).toFixed(0)}%
`;
      ascii += `    Recommendation Score: ${(alt.recommendationScore * 100).toFixed(0)}%
`;
    });
    ascii += "\n";
  }
  ascii += "RECOMMENDATION\n";
  ascii += "--------------\n";
  ascii += `Action: ${thought.recommendation.action}
`;
  if (thought.recommendation.targetMode) {
    ascii += `Target Mode: ${thought.recommendation.targetMode}
`;
  }
  ascii += `Justification: ${thought.recommendation.justification}
`;
  ascii += `Confidence: ${(thought.recommendation.confidence * 100).toFixed(1)}%
`;
  ascii += `Expected Improvement: ${thought.recommendation.expectedImprovement}
`;
  ascii += "\n";
  ascii += "RESOURCE ALLOCATION\n";
  ascii += "-------------------\n";
  ascii += `Time Spent: ${thought.resourceAllocation.timeSpent}ms
`;
  ascii += `Thoughts Remaining: ${thought.resourceAllocation.thoughtsRemaining}
`;
  ascii += `Complexity: ${thought.resourceAllocation.complexityLevel}
`;
  ascii += `Urgency: ${thought.resourceAllocation.urgency}
`;
  ascii += `Recommendation: ${thought.resourceAllocation.recommendation}
`;
  ascii += "\n";
  ascii += "QUALITY METRICS\n";
  ascii += "---------------\n";
  ascii += `Logical Consistency: ${(thought.qualityMetrics.logicalConsistency * 100).toFixed(1)}%
`;
  ascii += `Evidence Quality: ${(thought.qualityMetrics.evidenceQuality * 100).toFixed(1)}%
`;
  ascii += `Completeness: ${(thought.qualityMetrics.completeness * 100).toFixed(1)}%
`;
  ascii += `Originality: ${(thought.qualityMetrics.originality * 100).toFixed(1)}%
`;
  ascii += `Clarity: ${(thought.qualityMetrics.clarity * 100).toFixed(1)}%
`;
  ascii += `Overall Quality: ${(thought.qualityMetrics.overallQuality * 100).toFixed(1)}%
`;
  ascii += "\n";
  ascii += "SESSION CONTEXT\n";
  ascii += "---------------\n";
  ascii += `Session ID: ${thought.sessionContext.sessionId}
`;
  ascii += `Total Thoughts: ${thought.sessionContext.totalThoughts}
`;
  ascii += `Mode Switches: ${thought.sessionContext.modeSwitches}
`;
  ascii += `Problem Type: ${thought.sessionContext.problemType}
`;
  ascii += `Modes Used: ${thought.sessionContext.modesUsed.join(", ")}
`;
  if (thought.sessionContext.historicalEffectiveness !== void 0) {
    ascii += `Historical Effectiveness: ${(thought.sessionContext.historicalEffectiveness * 100).toFixed(1)}%
`;
  }
  return ascii;
}
var init_metareasoning = __esm({
  "src/export/visual/metareasoning.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/index.ts
var VisualExporter;
var init_visual = __esm({
  "src/export/visual/index.ts"() {
    init_esm_shims();
    init_causal();
    init_temporal();
    init_game_theory();
    init_bayesian();
    init_sequential();
    init_shannon();
    init_abductive();
    init_counterfactual();
    init_analogical();
    init_evidential();
    init_first_principles();
    init_systems_thinking();
    init_scientific_method();
    init_optimization();
    init_formal_logic();
    init_mathematics();
    init_physics();
    init_hybrid();
    init_metareasoning();
    VisualExporter = class {
      exportCausalGraph(thought, options) {
        return exportCausalGraph(thought, options);
      }
      exportTemporalTimeline(thought, options) {
        return exportTemporalTimeline(thought, options);
      }
      exportGameTree(thought, options) {
        return exportGameTree(thought, options);
      }
      exportBayesianNetwork(thought, options) {
        return exportBayesianNetwork(thought, options);
      }
      exportSequentialDependencyGraph(thought, options) {
        return exportSequentialDependencyGraph(thought, options);
      }
      exportShannonStageFlow(thought, options) {
        return exportShannonStageFlow(thought, options);
      }
      exportAbductiveHypotheses(thought, options) {
        return exportAbductiveHypotheses(thought, options);
      }
      exportCounterfactualScenarios(thought, options) {
        return exportCounterfactualScenarios(thought, options);
      }
      exportAnalogicalMapping(thought, options) {
        return exportAnalogicalMapping(thought, options);
      }
      exportEvidentialBeliefs(thought, options) {
        return exportEvidentialBeliefs(thought, options);
      }
      exportFirstPrinciplesDerivation(thought, options) {
        return exportFirstPrinciplesDerivation(thought, options);
      }
      exportSystemsThinkingCausalLoops(thought, options) {
        return exportSystemsThinkingCausalLoops(thought, options);
      }
      exportScientificMethodExperiment(thought, options) {
        return exportScientificMethodExperiment(thought, options);
      }
      exportOptimizationSolution(thought, options) {
        return exportOptimizationSolution(thought, options);
      }
      exportFormalLogicProof(thought, options) {
        return exportFormalLogicProof(thought, options);
      }
      // Sprint 2: New visual export wrapper methods
      exportMathematicsDerivation(thought, options) {
        return exportMathematicsDerivation(thought, options);
      }
      exportPhysicsVisualization(thought, options) {
        return exportPhysicsVisualization(thought, options);
      }
      exportHybridOrchestration(thought, options) {
        return exportHybridOrchestration(thought, options);
      }
      exportMetaReasoningVisualization(thought, options) {
        return exportMetaReasoningVisualization(thought, options);
      }
    };
  }
});

// src/services/ExportService.ts
var ExportService;
var init_ExportService = __esm({
  "src/services/ExportService.ts"() {
    init_esm_shims();
    init_types();
    init_visual();
    init_sanitization();
    init_logger();
    ExportService = class {
      visualExporter;
      logger;
      constructor(logger2) {
        this.visualExporter = new VisualExporter();
        this.logger = logger2 || createLogger({ minLevel: 1 /* INFO */, enableConsole: true });
      }
      /**
       * Export a session to the specified format
       *
       * Main export method that routes to format-specific exporters.
       * Handles both standard formats (JSON, Markdown, etc.) and visual
       * formats (Mermaid, DOT, ASCII).
       *
       * @param session - The session to export
       * @param format - The desired export format
       * @returns Formatted string in the requested format
       * @throws {Error} If session has no thoughts for visual exports
       *
       * @example
       * ```typescript
       * const service = new ExportService();
       * const exported = service.exportSession(session, 'markdown');
       * ```
       */
      exportSession(session, format) {
        const startTime = Date.now();
        this.logger.debug("Export started", { sessionId: session.id, format, thoughtCount: session.thoughts.length });
        if (format === "mermaid" || format === "dot" || format === "ascii") {
          const result2 = this.exportVisual(session, format);
          this.logger.debug("Export completed", {
            sessionId: session.id,
            format,
            duration: Date.now() - startTime,
            outputSize: result2.length
          });
          return result2;
        }
        let result;
        switch (format) {
          case "json":
            result = this.exportToJSON(session);
            break;
          case "markdown":
            result = this.exportToMarkdown(session);
            break;
          case "latex":
            result = this.exportToLatex(session);
            break;
          case "html":
            result = this.exportToHTML(session);
            break;
          case "jupyter":
            result = this.exportToJupyter(session);
            break;
          default:
            result = this.exportToJSON(session);
        }
        this.logger.debug("Export completed", {
          sessionId: session.id,
          format,
          duration: Date.now() - startTime,
          outputSize: result.length
        });
        return result;
      }
      /**
       * Export session to visual format (Mermaid, DOT, ASCII)
       *
       * Uses VisualExporter to generate visual representations
       * based on the session's thinking mode and thought structure.
       *
       * @param session - The session to export
       * @param format - Visual format (mermaid, dot, ascii)
       * @returns Visual representation as string
       * @throws {Error} If session has no thoughts
       */
      exportVisual(session, format) {
        const lastThought = session.thoughts[session.thoughts.length - 1];
        if (!lastThought) {
          throw new Error("No thoughts in session to export");
        }
        if (lastThought.mode === "causal" && "causalGraph" in lastThought) {
          return this.visualExporter.exportCausalGraph(lastThought, {
            format,
            colorScheme: "default",
            includeLabels: true,
            includeMetrics: true
          });
        }
        if (lastThought.mode === "temporal" && "timeline" in lastThought) {
          return this.visualExporter.exportTemporalTimeline(lastThought, {
            format,
            includeLabels: true
          });
        }
        if (lastThought.mode === "gametheory" && "game" in lastThought) {
          return this.visualExporter.exportGameTree(lastThought, {
            format,
            colorScheme: "default",
            includeLabels: true,
            includeMetrics: true
          });
        }
        if (lastThought.mode === "bayesian" && "hypothesis" in lastThought) {
          return this.visualExporter.exportBayesianNetwork(lastThought, {
            format,
            colorScheme: "default",
            includeLabels: true,
            includeMetrics: true
          });
        }
        if (lastThought.mode === "firstprinciples" /* FIRSTPRINCIPLES */ && "question" in lastThought) {
          return this.visualExporter.exportFirstPrinciplesDerivation(lastThought, {
            format,
            colorScheme: "default"
          });
        }
        if (lastThought.mode === "sequential" /* SEQUENTIAL */ && "buildUpon" in lastThought) {
          return this.visualExporter.exportSequentialDependencyGraph(lastThought, {
            format,
            colorScheme: "default",
            includeLabels: true,
            includeMetrics: true
          });
        }
        if (lastThought.mode === "shannon" /* SHANNON */ && "stage" in lastThought) {
          return this.visualExporter.exportShannonStageFlow(lastThought, {
            format,
            colorScheme: "default",
            includeLabels: true,
            includeMetrics: true
          });
        }
        if (lastThought.mode === "abductive" /* ABDUCTIVE */ && "hypotheses" in lastThought) {
          return this.visualExporter.exportAbductiveHypotheses(lastThought, {
            format,
            colorScheme: "default",
            includeLabels: true,
            includeMetrics: true
          });
        }
        if (lastThought.mode === "counterfactual" /* COUNTERFACTUAL */ && "scenarios" in lastThought) {
          return this.visualExporter.exportCounterfactualScenarios(lastThought, {
            format,
            colorScheme: "default",
            includeLabels: true,
            includeMetrics: true
          });
        }
        if (lastThought.mode === "analogical" /* ANALOGICAL */ && "sourceAnalogy" in lastThought) {
          return this.visualExporter.exportAnalogicalMapping(lastThought, {
            format,
            colorScheme: "default",
            includeLabels: true,
            includeMetrics: true
          });
        }
        if (lastThought.mode === "evidential" /* EVIDENTIAL */ && "frameOfDiscernment" in lastThought) {
          return this.visualExporter.exportEvidentialBeliefs(lastThought, {
            format,
            colorScheme: "default",
            includeLabels: true,
            includeMetrics: true
          });
        }
        if (lastThought.mode === "systemsthinking" /* SYSTEMSTHINKING */ && "systemComponents" in lastThought) {
          return this.visualExporter.exportSystemsThinkingCausalLoops(lastThought, {
            format,
            colorScheme: "default",
            includeLabels: true,
            includeMetrics: true
          });
        }
        if (lastThought.mode === "scientificmethod" /* SCIENTIFICMETHOD */ && "hypothesis" in lastThought) {
          return this.visualExporter.exportScientificMethodExperiment(lastThought, {
            format,
            colorScheme: "default",
            includeLabels: true,
            includeMetrics: true
          });
        }
        if (lastThought.mode === "optimization" /* OPTIMIZATION */ && "objectiveFunction" in lastThought) {
          return this.visualExporter.exportOptimizationSolution(lastThought, {
            format,
            colorScheme: "default",
            includeLabels: true,
            includeMetrics: true
          });
        }
        if (lastThought.mode === "formallogic" /* FORMALLOGIC */ && "premises" in lastThought) {
          return this.visualExporter.exportFormalLogicProof(lastThought, {
            format,
            colorScheme: "default",
            includeLabels: true,
            includeMetrics: true
          });
        }
        if (lastThought.mode === "mathematics" /* MATHEMATICS */ && "proofStrategy" in lastThought) {
          return this.visualExporter.exportMathematicsDerivation(lastThought, {
            format,
            colorScheme: "default",
            includeLabels: true,
            includeMetrics: true
          });
        }
        if (lastThought.mode === "physics" /* PHYSICS */ && "tensorProperties" in lastThought) {
          return this.visualExporter.exportPhysicsVisualization(lastThought, {
            format,
            colorScheme: "default",
            includeLabels: true,
            includeMetrics: true
          });
        }
        if (lastThought.mode === "hybrid" /* HYBRID */ && "primaryMode" in lastThought) {
          return this.visualExporter.exportHybridOrchestration(lastThought, {
            format,
            colorScheme: "default",
            includeLabels: true,
            includeMetrics: true
          });
        }
        if (lastThought.mode === "metareasoning" /* METAREASONING */ && "currentStrategy" in lastThought) {
          return this.visualExporter.exportMetaReasoningVisualization(lastThought, {
            format,
            colorScheme: "default",
            includeLabels: true,
            includeMetrics: true
          });
        }
        const thoughts = session.thoughts.map(
          (t, i) => `Thought ${i + 1} (${t.mode}):
${t.content}
`
        ).join("\n");
        return `Session: ${session.title || "Untitled"}
Mode: ${lastThought.mode}

${thoughts}`;
      }
      /**
       * Export session to JSON format
       *
       * Converts the session to JSON, handling Map serialization.
       *
       * @param session - The session to export
       * @returns JSON string with pretty printing
       */
      exportToJSON(session) {
        const sessionWithCustomMetrics = {
          ...session,
          metrics: {
            ...session.metrics,
            customMetrics: Object.fromEntries(session.metrics.customMetrics)
          }
        };
        return JSON.stringify(sessionWithCustomMetrics, null, 2);
      }
      /**
       * Export session to Markdown format
       *
       * Creates a human-readable Markdown document with session details
       * and all thoughts formatted as sections.
       *
       * @param session - The session to export
       * @returns Markdown-formatted string
       */
      exportToMarkdown(session) {
        const status = session.isComplete ? "Complete" : "In Progress";
        let md = `# Thinking Session: ${session.title}

`;
        md += `**Mode**: ${session.mode}
`;
        md += `**Created**: ${session.createdAt.toISOString()}
`;
        md += `**Status**: ${status}

`;
        md += `## Thoughts

`;
        for (const thought of session.thoughts) {
          md += `### Thought ${thought.thoughtNumber}/${session.thoughts.length}

`;
          md += `${thought.content}

`;
          if (isMetaReasoningThought(thought)) {
            md += `#### \u{1F4CA} Meta-Reasoning Analysis

`;
            md += `**Current Strategy:**
`;
            md += `- Mode: ${thought.currentStrategy.mode}
`;
            md += `- Approach: ${thought.currentStrategy.approach}
`;
            md += `- Thoughts Spent: ${thought.currentStrategy.thoughtsSpent}
`;
            if (thought.currentStrategy.progressIndicators.length > 0) {
              md += `- Progress: ${thought.currentStrategy.progressIndicators.join(", ")}
`;
            }
            md += `
`;
            md += `**Strategy Evaluation:**
`;
            md += `- Effectiveness: ${(thought.strategyEvaluation.effectiveness * 100).toFixed(1)}%
`;
            md += `- Efficiency: ${(thought.strategyEvaluation.efficiency * 100).toFixed(1)}%
`;
            md += `- Confidence: ${(thought.strategyEvaluation.confidence * 100).toFixed(1)}%
`;
            md += `- Quality Score: ${(thought.strategyEvaluation.qualityScore * 100).toFixed(1)}%
`;
            if (thought.strategyEvaluation.issues.length > 0) {
              md += `- Issues: ${thought.strategyEvaluation.issues.join("; ")}
`;
            }
            if (thought.strategyEvaluation.strengths.length > 0) {
              md += `- Strengths: ${thought.strategyEvaluation.strengths.join("; ")}
`;
            }
            md += `
`;
            md += `**Recommendation:** ${thought.recommendation.action}
`;
            md += `- ${thought.recommendation.justification}
`;
            md += `- Confidence: ${(thought.recommendation.confidence * 100).toFixed(1)}%
`;
            md += `- Expected Improvement: ${thought.recommendation.expectedImprovement}
`;
            if (thought.alternativeStrategies.length > 0) {
              md += `
**Alternative Strategies:**
`;
              for (const alt of thought.alternativeStrategies) {
                md += `- **${alt.mode}** (score: ${(alt.recommendationScore * 100).toFixed(0)}%): ${alt.reasoning}
`;
              }
            }
            md += `
**Quality Metrics:**
`;
            md += `- Logical Consistency: ${(thought.qualityMetrics.logicalConsistency * 100).toFixed(1)}%
`;
            md += `- Evidence Quality: ${(thought.qualityMetrics.evidenceQuality * 100).toFixed(1)}%
`;
            md += `- Completeness: ${(thought.qualityMetrics.completeness * 100).toFixed(1)}%
`;
            md += `- Originality: ${(thought.qualityMetrics.originality * 100).toFixed(1)}%
`;
            md += `- Clarity: ${(thought.qualityMetrics.clarity * 100).toFixed(1)}%
`;
            md += `- Overall Quality: ${(thought.qualityMetrics.overallQuality * 100).toFixed(1)}%
`;
            md += `
`;
          }
        }
        return md;
      }
      /**
       * Export session to LaTeX format
       *
       * Generates a LaTeX document with proper escaping for special characters.
       * Ready for compilation with pdflatex.
       *
       * @param session - The session to export
       * @returns LaTeX document as string
       */
      exportToLatex(session) {
        const status = session.isComplete ? "Complete" : "In Progress";
        const safeTitle = escapeLatex(session.title);
        const safeMode = escapeLatex(session.mode);
        const safeStatus = escapeLatex(status);
        let latex = `\\documentclass{article}
`;
        latex += `\\usepackage[utf8]{inputenc}
`;
        latex += `\\title{${safeTitle}}
`;
        latex += `\\begin{document}
`;
        latex += `\\maketitle

`;
        latex += `\\section{Session Details}
`;
        latex += `Mode: ${safeMode}\\\\
`;
        latex += `Status: ${safeStatus}\\\\

`;
        latex += `\\section{Thoughts}
`;
        for (const thought of session.thoughts) {
          latex += `\\subsection{Thought ${thought.thoughtNumber}}
`;
          latex += `${escapeLatex(thought.content)}

`;
        }
        latex += `\\end{document}
`;
        return latex;
      }
      /**
       * Export session to HTML format
       *
       * Generates a standalone HTML page with XSS protection via escaping.
       * Includes basic styling for readability.
       *
       * @param session - The session to export
       * @returns HTML document as string
       */
      exportToHTML(session) {
        const status = session.isComplete ? "Complete" : "In Progress";
        const safeTitle = escapeHtml(session.title);
        const safeMode = escapeHtml(session.mode);
        const safeStatus = escapeHtml(status);
        let html = `<!DOCTYPE html>
<html>
<head>
`;
        html += `  <meta charset="UTF-8">
`;
        html += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">
`;
        html += `  <title>${safeTitle}</title>
`;
        html += `  <style>body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 0 20px; }</style>
`;
        html += `</head>
<body>
`;
        html += `  <h1>${safeTitle}</h1>
`;
        html += `  <p><strong>Mode:</strong> ${safeMode}</p>
`;
        html += `  <p><strong>Status:</strong> ${safeStatus}</p>
`;
        html += `  <h2>Thoughts</h2>
`;
        for (const thought of session.thoughts) {
          html += `  <div>
`;
          html += `    <h3>Thought ${thought.thoughtNumber}/${session.thoughts.length}</h3>
`;
          html += `    <p>${escapeHtml(thought.content)}</p>
`;
          html += `  </div>
`;
        }
        html += `</body>
</html>
`;
        return html;
      }
      /**
       * Export session to Jupyter Notebook format
       *
       * Creates a .ipynb file structure with Markdown cells for each thought.
       * Compatible with Jupyter Notebook and JupyterLab.
       *
       * @param session - The session to export
       * @returns JSON string representing Jupyter notebook
       */
      exportToJupyter(session) {
        const status = session.isComplete ? "Complete" : "In Progress";
        const notebook = {
          cells: [],
          metadata: {},
          nbformat: 4,
          nbformat_minor: 2
        };
        notebook.cells.push({
          cell_type: "markdown",
          metadata: {},
          source: [
            `# Thinking Session: ${session.title}
`,
            `
`,
            `**Mode**: ${session.mode}
`,
            `**Status**: ${status}
`
          ]
        });
        for (const thought of session.thoughts) {
          notebook.cells.push({
            cell_type: "markdown",
            metadata: {},
            source: [
              `## Thought ${thought.thoughtNumber}/${session.thoughts.length}
`,
              `
`,
              `${thought.content}
`
            ]
          });
        }
        return JSON.stringify(notebook, null, 2);
      }
    };
  }
});

// src/services/ModeRouter.ts
var ModeRouter;
var init_ModeRouter = __esm({
  "src/services/ModeRouter.ts"() {
    init_esm_shims();
    init_types();
    init_logger();
    init_MetaMonitor();
    ModeRouter = class {
      sessionManager;
      recommender;
      logger;
      monitor;
      /**
       * Create a new ModeRouter
       *
       * @param sessionManager - Session manager instance for mode switching
       * @param logger - Optional logger for dependency injection
       * @param monitor - Optional MetaMonitor instance for dependency injection
       *
       * @example
       * ```typescript
       * const router = new ModeRouter(sessionManager);
       * // Or with DI:
       * const router = new ModeRouter(sessionManager, customLogger, customMonitor);
       * ```
       */
      constructor(sessionManager, logger2, monitor) {
        this.sessionManager = sessionManager;
        this.recommender = new ModeRecommender();
        this.logger = logger2 || createLogger({ minLevel: 1 /* INFO */, enableConsole: true });
        this.monitor = monitor || metaMonitor;
      }
      /**
       * Switch a session to a new thinking mode
       *
       * Changes the thinking mode of an active session while preserving
       * existing thoughts. Useful when the problem characteristics change
       * or initial mode selection was suboptimal.
       *
       * @param sessionId - ID of the session to switch
       * @param newMode - The new thinking mode to use
       * @param reason - Reason for the mode switch (for logging)
       * @returns The updated session
       * @throws {Error} If session not found
       *
       * @example
       * ```typescript
       * const session = await router.switchMode(
       *   'session-123',
       *   ThinkingMode.MATHEMATICS,
       *   'Problem requires mathematical proof'
       * );
       * ```
       */
      async switchMode(sessionId, newMode, reason) {
        this.logger.info("Switching mode", {
          sessionId,
          newMode,
          reason
        });
        const session = await this.sessionManager.switchMode(sessionId, newMode, reason);
        this.logger.debug("Mode switch completed", {
          sessionId,
          newMode,
          thoughtCount: session.thoughts.length
        });
        return session;
      }
      /**
       * Get quick mode recommendation based on problem type
       *
       * Provides a fast, single-mode recommendation based on a simple
       * problem type string. Useful for quick suggestions without detailed
       * problem analysis.
       *
       * @param problemType - Simple problem type description
       * @returns Recommended thinking mode
       *
       * @example
       * ```typescript
       * const mode = router.quickRecommend('mathematical proof');
       * // Returns: ThinkingMode.MATHEMATICS
       * ```
       */
      quickRecommend(problemType) {
        this.logger.debug("Quick recommend requested", { problemType });
        const mode = this.recommender.quickRecommend(problemType);
        this.logger.debug("Quick recommend result", { problemType, recommendedMode: mode });
        return mode;
      }
      /**
       * Get comprehensive mode recommendations
       *
       * Analyzes problem characteristics and returns ranked recommendations
       * for individual modes and optionally mode combinations.
       *
       * @param characteristics - Detailed problem characteristics
       * @param includeCombinations - Whether to include mode combinations
       * @returns Formatted recommendation response
       *
       * @example
       * ```typescript
       * const response = router.getRecommendations({
       *   requiresProof: true,
       *   hasQuantities: true,
       *   hasUncertainty: false
       * }, true);
       * ```
       */
      getRecommendations(characteristics, includeCombinations = false) {
        this.logger.debug("Getting mode recommendations", {
          characteristics,
          includeCombinations
        });
        const modeRecs = this.recommender.recommendModes(characteristics);
        const combinationRecs = includeCombinations ? this.recommender.recommendCombinations(characteristics) : [];
        this.logger.debug("Recommendations generated", {
          modeCount: modeRecs.length,
          combinationCount: combinationRecs.length,
          topMode: modeRecs[0]?.mode,
          topScore: modeRecs[0]?.score
        });
        let response = "# Mode Recommendations\n\n";
        response += "## Individual Modes\n\n";
        for (const rec of modeRecs) {
          response += `### ${rec.mode} (Score: ${rec.score})
`;
          response += `**Reasoning**: ${rec.reasoning}

`;
          response += `**Strengths**:
`;
          for (const strength of rec.strengths) {
            response += `- ${strength}
`;
          }
          response += `
**Limitations**:
`;
          for (const limitation of rec.limitations) {
            response += `- ${limitation}
`;
          }
          response += `
**Examples**: ${rec.examples.join(", ")}

`;
          response += "---\n\n";
        }
        if (combinationRecs.length > 0) {
          response += "## Recommended Mode Combinations\n\n";
          for (const combo of combinationRecs) {
            response += `### ${combo.modes.join(" + ")} (${combo.sequence})
`;
            response += `**Rationale**: ${combo.rationale}

`;
            response += `**Benefits**:
`;
            for (const benefit of combo.benefits) {
              response += `- ${benefit}
`;
            }
            response += `
**Synergies**:
`;
            for (const synergy of combo.synergies) {
              response += `- ${synergy}
`;
            }
            response += "\n---\n\n";
          }
        }
        return response;
      }
      /**
       * Format a quick recommendation response
       *
       * Creates a formatted response for quick recommendations.
       *
       * @param problemType - The problem type that was analyzed
       * @param recommendedMode - The recommended mode
       * @returns Formatted response string
       */
      formatQuickRecommendation(problemType, recommendedMode) {
        return `Quick recommendation for "${problemType}":

**Recommended Mode**: ${recommendedMode}

For more detailed recommendations, provide problemCharacteristics.`;
      }
      /**
       * Evaluate current session and suggest mode switch if beneficial
       *
       * Uses meta-reasoning to evaluate the current strategy effectiveness
       * and suggest alternative modes if the current approach is suboptimal.
       *
       * @param sessionId - Session to evaluate
       * @param problemType - Optional problem type for context
       * @returns Evaluation result with switch recommendation
       *
       * @example
       * ```typescript
       * const evaluation = await router.evaluateAndSuggestSwitch('session-123', 'debugging');
       * if (evaluation.shouldSwitch) {
       *   await router.switchMode(sessionId, evaluation.suggestedMode!, evaluation.reasoning);
       * }
       * ```
       */
      async evaluateAndSuggestSwitch(sessionId, problemType = "general") {
        this.logger.debug("Evaluating session for potential mode switch", { sessionId, problemType });
        const evaluation = this.monitor.evaluateStrategy(sessionId);
        const session = await this.sessionManager.getSession(sessionId);
        const currentMode = session?.mode || "sequential" /* SEQUENTIAL */;
        const alternatives = this.monitor.suggestAlternatives(sessionId, currentMode);
        const shouldSwitch = evaluation.effectiveness < 0.4 || evaluation.effectiveness < 0.6 && alternatives.length > 0 && alternatives[0].recommendationScore > 0.75;
        const suggestedMode = shouldSwitch && alternatives.length > 0 ? alternatives[0].mode : void 0;
        const reasoning = shouldSwitch ? `Current strategy effectiveness: ${(evaluation.effectiveness * 100).toFixed(1)}%. ${alternatives[0]?.reasoning || "Consider switching modes."}` : `Current strategy performing adequately (effectiveness: ${(evaluation.effectiveness * 100).toFixed(1)}%). Continue with current mode.`;
        this.logger.debug("Mode switch evaluation completed", {
          sessionId,
          shouldSwitch,
          suggestedMode,
          currentEffectiveness: evaluation.effectiveness
        });
        return {
          currentEvaluation: evaluation,
          shouldSwitch,
          suggestedMode,
          reasoning,
          alternatives
        };
      }
      /**
       * Auto-switch mode if current strategy is failing
       *
       * Automatically evaluates and switches modes if the current approach
       * is demonstrably ineffective (effectiveness < 0.3).
       *
       * @param sessionId - Session to evaluate
       * @param problemType - Optional problem type for context
       * @returns Switch result with details
       *
       * @example
       * ```typescript
       * const result = await router.autoSwitchIfNeeded('session-123', 'complex-problem');
       * console.log(result.switched ? 'Switched to' + result.newMode : 'No switch needed');
       * ```
       */
      async autoSwitchIfNeeded(sessionId, problemType = "general") {
        this.logger.debug("Auto-switch evaluation", { sessionId, problemType });
        const evaluation = await this.evaluateAndSuggestSwitch(sessionId, problemType);
        const autoSwitchThreshold = 0.3;
        if (evaluation.currentEvaluation.effectiveness < autoSwitchThreshold && evaluation.suggestedMode) {
          const session = await this.sessionManager.getSession(sessionId);
          const oldMode = session?.mode || "sequential" /* SEQUENTIAL */;
          await this.switchMode(sessionId, evaluation.suggestedMode, evaluation.reasoning);
          this.logger.info("Auto-switched mode due to low effectiveness", {
            sessionId,
            oldMode,
            newMode: evaluation.suggestedMode,
            effectiveness: evaluation.currentEvaluation.effectiveness
          });
          return {
            switched: true,
            oldMode,
            newMode: evaluation.suggestedMode,
            reasoning: evaluation.reasoning,
            evaluation: evaluation.currentEvaluation
          };
        }
        this.logger.debug("Auto-switch not needed", {
          sessionId,
          effectiveness: evaluation.currentEvaluation.effectiveness,
          threshold: autoSwitchThreshold
        });
        return {
          switched: false,
          reasoning: evaluation.reasoning,
          evaluation: evaluation.currentEvaluation
        };
      }
    };
  }
});

// src/services/index.ts
var services_exports = {};
__export(services_exports, {
  ExportService: () => ExportService,
  ModeRouter: () => ModeRouter,
  ThoughtFactory: () => ThoughtFactory
});
var init_services = __esm({
  "src/services/index.ts"() {
    init_esm_shims();
    init_ThoughtFactory();
    init_ExportService();
    init_ModeRouter();
  }
});

// src/index.ts
init_esm_shims();

// src/tools/definitions.ts
init_esm_shims();

// src/tools/json-schemas.ts
init_esm_shims();
var baseThoughtProperties = {
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
};
var baseThoughtRequired = ["thought", "thoughtNumber", "totalThoughts", "nextThoughtNeeded"];
var deepthinking_core_schema = {
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
};
var deepthinking_standard_schema = {
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
};
var deepthinking_math_schema = {
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
};
var deepthinking_temporal_schema = {
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
};
var deepthinking_probabilistic_schema = {
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
};
var deepthinking_causal_schema = {
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
};
var deepthinking_strategic_schema = {
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
};
var deepthinking_analytical_schema = {
  name: "deepthinking_analytical",
  description: "Analytical: analogical mapping, first principles, meta-reasoning",
  inputSchema: {
    type: "object",
    properties: {
      ...baseThoughtProperties,
      mode: {
        type: "string",
        enum: ["analogical", "firstprinciples", "metareasoning"],
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
};
var deepthinking_scientific_schema = {
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
};
var deepthinking_session_schema = {
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
};
var jsonSchemas = [
  deepthinking_core_schema,
  deepthinking_standard_schema,
  deepthinking_math_schema,
  deepthinking_temporal_schema,
  deepthinking_probabilistic_schema,
  deepthinking_causal_schema,
  deepthinking_strategic_schema,
  deepthinking_analytical_schema,
  deepthinking_scientific_schema,
  deepthinking_session_schema
];

// src/tools/schemas/base.ts
init_esm_shims();

// src/tools/schemas/shared.ts
init_esm_shims();
var ConfidenceSchema = z.number().min(0).max(1);
var PositiveIntSchema = z.number().int().min(1);
var LevelEnum = z.enum(["low", "medium", "high"]);
z.enum(["positive", "negative", "neutral"]);
var ExportFormatEnum = z.enum([
  "markdown",
  "latex",
  "json",
  "html",
  "jupyter",
  "mermaid",
  "dot",
  "ascii"
]);
var SessionActionEnum = z.enum([
  "summarize",
  "export",
  "get_session",
  "switch_mode",
  "recommend_mode"
]);
var ProofTypeEnum = z.enum([
  "direct",
  "contradiction",
  "induction",
  "construction",
  "contrapositive"
]);
var TimeUnitEnum = z.enum([
  "milliseconds",
  "seconds",
  "minutes",
  "hours",
  "days",
  "months",
  "years"
]);
var TemporalConstraintEnum = z.enum([
  "before",
  "after",
  "during",
  "overlaps",
  "meets",
  "starts",
  "finishes",
  "equals"
]);
var TemporalRelationEnum = z.enum([
  "before",
  "after",
  "during",
  "overlaps",
  "meets",
  "starts",
  "finishes",
  "equals",
  "causes"
]);
var EventTypeEnum = z.enum(["instant", "interval"]);
var TransformationEnum = z.enum(["covariant", "contravariant", "mixed"]);
var ShannonStageEnum = z.enum([
  "problem_definition",
  "constraints",
  "model",
  "proof",
  "implementation"
]);
var EntitySchema = z.object({
  id: z.string(),
  name: z.string()
});
EntitySchema.extend({
  description: z.string()
});

// src/tools/schemas/base.ts
var BaseThoughtSchema = z.object({
  sessionId: z.string().optional(),
  thought: z.string().min(1),
  thoughtNumber: PositiveIntSchema,
  totalThoughts: PositiveIntSchema,
  nextThoughtNeeded: z.boolean(),
  isRevision: z.boolean().optional(),
  revisesThought: z.string().optional(),
  revisionReason: z.string().optional(),
  branchFrom: z.string().optional(),
  branchId: z.string().optional(),
  uncertainty: ConfidenceSchema.optional(),
  dependencies: z.array(z.string()).optional(),
  assumptions: z.array(z.string()).optional()
});
var SessionActionSchema = z.object({
  sessionId: z.string().optional(),
  action: SessionActionEnum,
  exportFormat: ExportFormatEnum.optional(),
  newMode: z.string().optional(),
  problemType: z.string().optional(),
  problemCharacteristics: z.object({
    domain: z.string(),
    complexity: LevelEnum,
    uncertainty: LevelEnum,
    timeDependent: z.boolean(),
    multiAgent: z.boolean(),
    requiresProof: z.boolean(),
    requiresQuantification: z.boolean(),
    hasIncompleteInfo: z.boolean(),
    requiresExplanation: z.boolean(),
    hasAlternatives: z.boolean()
  }).optional(),
  includeCombinations: z.boolean().optional()
});

// src/tools/schemas/modes/core.ts
init_esm_shims();
var StandardSchema = BaseThoughtSchema.extend({
  mode: z.enum(["sequential", "shannon", "hybrid"]),
  stage: ShannonStageEnum.optional(),
  activeModes: z.array(z.string()).optional()
});
var CoreModeSchema = BaseThoughtSchema.extend({
  mode: z.enum(["inductive", "deductive", "abductive"]),
  // Inductive properties
  observations: z.array(z.string()).optional(),
  pattern: z.string().optional(),
  generalization: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  counterexamples: z.array(z.string()).optional(),
  sampleSize: z.number().int().min(1).optional(),
  // Deductive properties
  premises: z.array(z.string()).optional(),
  conclusion: z.string().optional(),
  logicForm: z.string().optional(),
  validityCheck: z.boolean().optional(),
  soundnessCheck: z.boolean().optional(),
  // Abductive properties
  hypotheses: z.array(z.object({
    id: z.string(),
    explanation: z.string(),
    score: z.number().optional()
  })).optional(),
  bestExplanation: z.object({
    id: z.string(),
    explanation: z.string(),
    score: z.number().optional()
  }).optional()
});

// src/tools/schemas/modes/mathematics.ts
init_esm_shims();
var ProofStrategySchema = z.object({
  type: ProofTypeEnum,
  steps: z.array(z.string())
});
var MathematicalModelSchema = z.object({
  latex: z.string(),
  symbolic: z.string(),
  ascii: z.string().optional()
});
var TensorPropertiesSchema = z.object({
  rank: z.tuple([z.number(), z.number()]),
  components: z.string(),
  latex: z.string(),
  symmetries: z.array(z.string()),
  invariants: z.array(z.string()),
  transformation: TransformationEnum
});
var PhysicalInterpretationSchema = z.object({
  quantity: z.string(),
  units: z.string(),
  conservationLaws: z.array(z.string())
});
var MathSchema = BaseThoughtSchema.extend({
  mode: z.enum(["mathematics", "physics"]),
  thoughtType: z.string().optional(),
  proofStrategy: ProofStrategySchema.optional(),
  mathematicalModel: MathematicalModelSchema.optional(),
  tensorProperties: TensorPropertiesSchema.optional(),
  physicalInterpretation: PhysicalInterpretationSchema.optional()
});

// src/tools/schemas/modes/temporal.ts
init_esm_shims();
var TimelineSchema = z.object({
  id: z.string(),
  name: z.string(),
  timeUnit: TimeUnitEnum,
  events: z.array(z.string()),
  startTime: z.number().optional(),
  endTime: z.number().optional()
});
var TemporalEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  timestamp: z.number(),
  type: EventTypeEnum,
  duration: z.number().optional(),
  properties: z.record(z.string(), z.unknown()).optional()
});
var TemporalConstraintSchema = z.object({
  id: z.string(),
  type: TemporalConstraintEnum,
  subject: z.string(),
  object: z.string(),
  confidence: ConfidenceSchema
});
var TemporalIntervalSchema = z.object({
  id: z.string(),
  name: z.string(),
  start: z.number(),
  end: z.number(),
  contains: z.array(z.string()).optional(),
  overlaps: z.array(z.string()).optional()
});
var TemporalRelationSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  relationType: TemporalRelationEnum,
  strength: ConfidenceSchema,
  delay: z.number().optional()
});
var TemporalSchema = BaseThoughtSchema.extend({
  mode: z.literal("temporal"),
  timeline: TimelineSchema.optional(),
  events: z.array(TemporalEventSchema).optional(),
  constraints: z.array(TemporalConstraintSchema).optional(),
  intervals: z.array(TemporalIntervalSchema).optional(),
  relations: z.array(TemporalRelationSchema).optional()
});

// src/tools/schemas/modes/probabilistic.ts
init_esm_shims();
var BeliefMassSchema = z.object({
  hypothesisSet: z.array(z.string()),
  mass: ConfidenceSchema,
  justification: z.string()
});
var ProbabilisticSchema = BaseThoughtSchema.extend({
  mode: z.enum(["bayesian", "evidential"]),
  // Evidential (Dempster-Shafer) specific
  frameOfDiscernment: z.array(z.string()).optional(),
  beliefMasses: z.array(BeliefMassSchema).optional()
});

// src/tools/schemas/modes/causal.ts
init_esm_shims();
var CausalNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(["cause", "effect", "mediator", "confounder"]).optional()
});
var CausalEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.string().optional(),
  strength: z.number().min(0).max(1).optional()
});
var CounterfactualSchema = z.object({
  actual: z.string().optional(),
  hypothetical: z.string().optional(),
  consequence: z.string().optional()
});
var InterventionSchema = z.object({
  node: z.string(),
  value: z.string().optional(),
  effect: z.string().optional()
});
var CausalSchema = BaseThoughtSchema.extend({
  mode: z.enum(["causal", "counterfactual", "abductive"]),
  // Causal graph properties (top-level for JSON schema compatibility)
  nodes: z.array(CausalNodeSchema).optional(),
  edges: z.array(CausalEdgeSchema).optional(),
  // Nested causalGraph for backwards compatibility
  causalGraph: z.object({
    nodes: z.array(CausalNodeSchema),
    edges: z.array(CausalEdgeSchema)
  }).optional(),
  // Counterfactual properties
  counterfactual: CounterfactualSchema.optional(),
  // Intervention properties
  interventions: z.array(InterventionSchema).optional(),
  // Observations for abductive reasoning
  observations: z.array(z.string()).optional(),
  explanations: z.array(z.object({
    hypothesis: z.string(),
    plausibility: z.number().min(0).max(1).optional()
  })).optional()
});

// src/tools/schemas/modes/strategic.ts
init_esm_shims();
var PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  isRational: z.boolean(),
  availableStrategies: z.array(z.string()),
  role: z.string().optional()
});
var StrategySchema = z.object({
  id: z.string(),
  playerId: z.string(),
  name: z.string(),
  description: z.string(),
  isPure: z.boolean(),
  probability: ConfidenceSchema.optional()
});
var PayoffEntrySchema = z.object({
  strategyProfile: z.array(z.string()),
  payoffs: z.array(z.number())
});
var PayoffMatrixSchema = z.object({
  players: z.array(z.string()),
  dimensions: z.array(z.number()),
  payoffs: z.array(PayoffEntrySchema)
});
var StrategicSchema = BaseThoughtSchema.extend({
  mode: z.enum(["gametheory", "optimization"]),
  // Game theory specific
  players: z.array(PlayerSchema).optional(),
  strategies: z.array(StrategySchema).optional(),
  payoffMatrix: PayoffMatrixSchema.optional()
});

// src/tools/schemas/modes/analytical.ts
init_esm_shims();
var AnalyticalSchema = BaseThoughtSchema.extend({
  mode: z.enum(["analogical", "firstprinciples", "metareasoning"])
});

// src/tools/schemas/modes/scientific.ts
init_esm_shims();
var ScientificSchema = BaseThoughtSchema.extend({
  mode: z.enum(["scientificmethod", "systemsthinking", "formallogic"])
});
var toolList = jsonSchemas;
var toolSchemas = {
  deepthinking_core: CoreModeSchema,
  deepthinking_standard: StandardSchema,
  deepthinking_math: MathSchema,
  deepthinking_temporal: TemporalSchema,
  deepthinking_probabilistic: ProbabilisticSchema,
  deepthinking_causal: CausalSchema,
  deepthinking_strategic: StrategicSchema,
  deepthinking_analytical: AnalyticalSchema,
  deepthinking_scientific: ScientificSchema,
  deepthinking_session: SessionActionSchema
};
var modeToToolMap = {
  // Core reasoning modes (fundamental)
  inductive: "deepthinking_core",
  deductive: "deepthinking_core",
  abductive: "deepthinking_core",
  // Standard workflow modes
  sequential: "deepthinking_standard",
  shannon: "deepthinking_standard",
  hybrid: "deepthinking_standard",
  // Math/Physics modes
  mathematics: "deepthinking_math",
  physics: "deepthinking_math",
  // Temporal mode
  temporal: "deepthinking_temporal",
  // Probabilistic modes
  bayesian: "deepthinking_probabilistic",
  evidential: "deepthinking_probabilistic",
  // Causal modes (abductive moved to core)
  causal: "deepthinking_causal",
  counterfactual: "deepthinking_causal",
  // Strategic modes
  gametheory: "deepthinking_strategic",
  optimization: "deepthinking_strategic",
  // Analytical modes
  analogical: "deepthinking_analytical",
  firstprinciples: "deepthinking_analytical",
  metareasoning: "deepthinking_analytical",
  // Scientific modes
  scientificmethod: "deepthinking_scientific",
  systemsthinking: "deepthinking_scientific",
  formallogic: "deepthinking_scientific"
};
function isValidTool(toolName) {
  return toolName in toolSchemas;
}

// src/index.ts
init_thinking();
var __filename2 = fileURLToPath(import.meta.url);
var __dirname2 = dirname(__filename2);
var packageJson = JSON.parse(
  readFileSync(join(__dirname2, "../package.json"), "utf-8")
);
var server = new Server(
  {
    name: packageJson.name,
    version: packageJson.version
  },
  {
    capabilities: {
      tools: {}
    }
  }
);
var _sessionManager = null;
var _thoughtFactory = null;
var _exportService = null;
var _modeRouter = null;
async function getSessionManager() {
  if (!_sessionManager) {
    const { SessionManager: SessionManager2 } = await Promise.resolve().then(() => (init_session2(), session_exports));
    _sessionManager = new SessionManager2();
  }
  return _sessionManager;
}
async function getThoughtFactory() {
  if (!_thoughtFactory) {
    const { ThoughtFactory: ThoughtFactory2 } = await Promise.resolve().then(() => (init_services(), services_exports));
    _thoughtFactory = new ThoughtFactory2();
  }
  return _thoughtFactory;
}
async function getExportService() {
  if (!_exportService) {
    const { ExportService: ExportService2 } = await Promise.resolve().then(() => (init_services(), services_exports));
    _exportService = new ExportService2();
  }
  return _exportService;
}
async function getModeRouter() {
  if (!_modeRouter) {
    const { ModeRouter: ModeRouter2 } = await Promise.resolve().then(() => (init_services(), services_exports));
    const sessionManager = await getSessionManager();
    _modeRouter = new ModeRouter2(sessionManager);
  }
  return _modeRouter;
}
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      ...toolList,
      // 9 new focused tools
      thinkingTool
      // Legacy tool for backward compatibility
    ]
  };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    if (isValidTool(name)) {
      const schema = toolSchemas[name];
      const input = schema.parse(args);
      if (name === "deepthinking_session") {
        return await handleSessionAction(input);
      }
      return await handleAddThought(input, name);
    }
    if (name === "deepthinking") {
      const { ThinkingToolSchema: ThinkingToolSchema2 } = await Promise.resolve().then(() => (init_thinking(), thinking_exports));
      const input = ThinkingToolSchema2.parse(args);
      const deprecationWarning = '\u26A0\uFE0F DEPRECATED: The "deepthinking" tool is deprecated. Use the focused tools instead: deepthinking_core, deepthinking_math, deepthinking_temporal, deepthinking_probabilistic, deepthinking_causal, deepthinking_strategic, deepthinking_analytical, deepthinking_scientific, deepthinking_session. See docs/migration/v4.0-tool-splitting.md for details.\n\n';
      switch (input.action) {
        case "add_thought": {
          const result = await handleAddThought(input, modeToToolMap[input.mode || "hybrid"] || "deepthinking_core");
          return prependWarning(result, deprecationWarning);
        }
        case "summarize":
        case "export":
        case "switch_mode":
        case "get_session":
        case "recommend_mode": {
          const result = await handleSessionAction(input);
          return prependWarning(result, deprecationWarning);
        }
        default:
          throw new Error(`Unknown action: ${input.action}`);
      }
    }
    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  }
});
function prependWarning(result, warning) {
  if (result.content && result.content[0] && result.content[0].type === "text") {
    result.content[0].text = warning + result.content[0].text;
  }
  return result;
}
async function handleAddThought(input, _toolName) {
  const sessionManager = await getSessionManager();
  const thoughtFactory = await getThoughtFactory();
  let sessionId = input.sessionId;
  let mode = input.mode || "hybrid" /* HYBRID */;
  if (!sessionId) {
    const session2 = await sessionManager.createSession({
      mode,
      title: `Thinking Session ${(/* @__PURE__ */ new Date()).toISOString()}`
    });
    sessionId = session2.id;
  }
  const thought = thoughtFactory.createThought({ ...input, mode }, sessionId);
  const session = await sessionManager.addThought(sessionId, thought);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          sessionId: session.id,
          thoughtId: thought.id,
          thoughtNumber: thought.thoughtNumber,
          mode: thought.mode,
          nextThoughtNeeded: thought.nextThoughtNeeded,
          sessionComplete: session.isComplete,
          totalThoughts: session.thoughts.length
        }, null, 2)
      }
    ]
  };
}
async function handleSessionAction(input) {
  const action = input.action;
  switch (action) {
    case "summarize":
      return await handleSummarize(input);
    case "export":
      return await handleExport(input);
    case "switch_mode":
      return await handleSwitchMode(input);
    case "get_session":
      return await handleGetSession(input);
    case "recommend_mode":
      return await handleRecommendMode(input);
    default:
      throw new Error(`Unknown session action: ${action}`);
  }
}
async function handleSummarize(input) {
  if (!input.sessionId) {
    throw new Error("sessionId required for summarize action");
  }
  const sessionManager = await getSessionManager();
  const summary = await sessionManager.generateSummary(input.sessionId);
  return {
    content: [
      {
        type: "text",
        text: summary
      }
    ]
  };
}
async function handleExport(input) {
  if (!input.sessionId) {
    throw new Error("sessionId required for export action");
  }
  const sessionManager = await getSessionManager();
  const exportService = await getExportService();
  const session = await sessionManager.getSession(input.sessionId);
  if (!session) {
    throw new Error(`Session ${input.sessionId} not found`);
  }
  const format = input.exportFormat || "json";
  const exported = exportService.exportSession(session, format);
  return {
    content: [{
      type: "text",
      text: exported
    }]
  };
}
async function handleSwitchMode(input) {
  if (!input.sessionId || !input.newMode) {
    throw new Error("sessionId and newMode required for switch_mode action");
  }
  const modeRouter = await getModeRouter();
  const session = await modeRouter.switchMode(
    input.sessionId,
    input.newMode,
    "User requested mode switch"
  );
  return {
    content: [
      {
        type: "text",
        text: `Switched session ${session.id} to ${session.mode} mode`
      }
    ]
  };
}
async function handleGetSession(input) {
  if (!input.sessionId) {
    throw new Error("sessionId required for get_session action");
  }
  const sessionManager = await getSessionManager();
  const session = await sessionManager.getSession(input.sessionId);
  if (!session) {
    throw new Error(`Session ${input.sessionId} not found`);
  }
  const metricsWithCustom = {
    ...session.metrics,
    customMetrics: Object.fromEntries(session.metrics.customMetrics)
  };
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          id: session.id,
          title: session.title,
          mode: session.mode,
          thoughtCount: session.thoughts.length,
          isComplete: session.isComplete,
          metrics: metricsWithCustom
        }, null, 2)
      }
    ]
  };
}
async function handleRecommendMode(input) {
  const modeRouter = await getModeRouter();
  if (input.problemType && !input.problemCharacteristics) {
    const recommendedMode = modeRouter.quickRecommend(input.problemType);
    const response = modeRouter.formatQuickRecommendation(input.problemType, recommendedMode);
    return {
      content: [{
        type: "text",
        text: response
      }],
      isError: false
    };
  }
  if (input.problemCharacteristics) {
    const response = modeRouter.getRecommendations(
      input.problemCharacteristics,
      input.includeCombinations || false
    );
    return {
      content: [{
        type: "text",
        text: response
      }],
      isError: false
    };
  }
  return {
    content: [{
      type: "text",
      text: "Error: Please provide either problemType or problemCharacteristics for mode recommendations."
    }],
    isError: true
  };
}
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DeepThinking MCP server running on stdio");
}
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map