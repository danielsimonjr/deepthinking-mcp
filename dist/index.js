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
      "metacognition",
      // Phase 8: Proof Decomposition Types
      "proof_decomposition",
      "dependency_analysis",
      "consistency_check",
      "gap_identification",
      "assumption_trace"
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

// src/export/visual/svg-utils.ts
function getNodeColor(type, colorScheme = "default") {
  const palette = COLOR_PALETTES[colorScheme] || COLOR_PALETTES.default;
  return palette[type] || palette.neutral;
}
function escapeSVGText(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function truncateText(text, maxChars = 30) {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars - 3) + "...";
}
function generateSVGHeader(width, height, title) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#333"/>
    </marker>
    <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#e53935"/>
    </marker>
    <marker id="arrowhead-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#388e3c"/>
    </marker>
    <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#1976d2"/>
    </marker>
  </defs>

  <style>
    .title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; }
    .subtitle { font-family: Arial, sans-serif; font-size: 12px; fill: #666; font-style: italic; }
    .node-label { font-family: Arial, sans-serif; font-size: 12px; }
    .edge-label { font-family: Arial, sans-serif; font-size: 10px; fill: #666; }
    .metrics { font-family: Arial, sans-serif; font-size: 11px; fill: #444; }
    .legend-text { font-family: Arial, sans-serif; font-size: 10px; }
  </style>

  <!-- Background -->
  <rect width="100%" height="100%" fill="#fafafa"/>
${title ? `
  <!-- Title -->
  <text x="${width / 2}" y="25" text-anchor="middle" class="title">${escapeSVGText(truncateText(title, 60))}</text>
` : ""}`;
}
function generateSVGFooter() {
  return "</svg>";
}
function renderRectNode(pos, colors, rx = 8) {
  const escapedLabel = escapeSVGText(truncateText(pos.label, 25));
  return `
    <g class="node" data-id="${pos.id}">
      <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}"
            rx="${rx}" ry="${rx}" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 5}"
            text-anchor="middle" class="node-label">${escapedLabel}</text>
    </g>`;
}
function renderStadiumNode(pos, colors) {
  const escapedLabel = escapeSVGText(truncateText(pos.label, 25));
  return `
    <g class="node" data-id="${pos.id}">
      <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}"
            rx="20" ry="20" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 5}"
            text-anchor="middle" class="node-label">${escapedLabel}</text>
    </g>`;
}
function renderDiamondNode(pos, colors) {
  const cx = pos.x + pos.width / 2;
  const cy = pos.y + pos.height / 2;
  const escapedLabel = escapeSVGText(truncateText(pos.label, 20));
  return `
    <g class="node" data-id="${pos.id}">
      <polygon points="${cx},${pos.y} ${pos.x + pos.width},${cy} ${cx},${pos.y + pos.height} ${pos.x},${cy}"
               fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${cx}" y="${cy + 5}"
            text-anchor="middle" class="node-label">${escapedLabel}</text>
    </g>`;
}
function renderEllipseNode(pos, colors) {
  const cx = pos.x + pos.width / 2;
  const cy = pos.y + pos.height / 2;
  const escapedLabel = escapeSVGText(truncateText(pos.label, 20));
  return `
    <g class="node" data-id="${pos.id}">
      <ellipse cx="${cx}" cy="${cy}" rx="${pos.width / 2}" ry="${pos.height / 2}"
               fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${cx}" y="${cy + 5}"
            text-anchor="middle" class="node-label">${escapedLabel}</text>
    </g>`;
}
function renderEdge(fromPos, toPos, options = {}) {
  const { label, style = "solid", color = "#333333", markerEnd = "arrowhead" } = options;
  const fromX = fromPos.x + fromPos.width / 2;
  const fromY = fromPos.y + fromPos.height;
  const toX = toPos.x + toPos.width / 2;
  const toY = toPos.y;
  const midY = (fromY + toY) / 2;
  const path2 = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY - 8}`;
  const dashStyle = style === "dashed" ? 'stroke-dasharray="8,4"' : style === "dotted" ? 'stroke-dasharray="2,2"' : "";
  const labelElement = label ? `<text x="${(fromX + toX) / 2}" y="${midY - 5}" text-anchor="middle" class="edge-label">${escapeSVGText(label)}</text>` : "";
  return `
    <g class="edge">
      <path d="${path2}" fill="none" stroke="${color}" stroke-width="2" ${dashStyle} marker-end="url(#${markerEnd})"/>
      ${labelElement}
    </g>`;
}
function renderHorizontalEdge(fromPos, toPos, options = {}) {
  const { label, style = "solid", color = "#333333" } = options;
  const fromX = fromPos.x + fromPos.width;
  const fromY = fromPos.y + fromPos.height / 2;
  const toX = toPos.x;
  const toY = toPos.y + toPos.height / 2;
  const dashStyle = style === "dashed" ? 'stroke-dasharray="8,4"' : style === "dotted" ? 'stroke-dasharray="2,2"' : "";
  const labelElement = label ? `<text x="${(fromX + toX) / 2}" y="${(fromY + toY) / 2 - 8}" text-anchor="middle" class="edge-label">${escapeSVGText(label)}</text>` : "";
  return `
    <g class="edge">
      <line x1="${fromX}" y1="${fromY}" x2="${toX - 8}" y2="${toY}"
            stroke="${color}" stroke-width="2" ${dashStyle} marker-end="url(#arrowhead)"/>
      ${labelElement}
    </g>`;
}
function renderMetricsPanel(x, y, metrics) {
  const panelHeight = 30 + metrics.length * 16;
  let svg = `
  <g class="metrics-panel">
    <rect x="${x}" y="${y}" width="160" height="${panelHeight}" rx="8" fill="#f5f5f5" stroke="#ddd" stroke-width="1"/>
    <text x="${x + 10}" y="${y + 20}" class="metrics" font-weight="bold">Metrics</text>`;
  metrics.forEach((metric, i) => {
    svg += `
    <text x="${x + 10}" y="${y + 38 + i * 16}" class="metrics">${escapeSVGText(metric.label)}: ${escapeSVGText(String(metric.value))}</text>`;
  });
  svg += "\n  </g>";
  return svg;
}
function renderLegend(x, y, items) {
  let svg = `
  <g class="legend" transform="translate(${x}, ${y})">
    <text x="0" y="0" font-weight="bold" class="legend-text">Legend</text>`;
  items.forEach((item, i) => {
    const itemY = 12 + i * 18;
    let shapeEl;
    switch (item.shape) {
      case "diamond":
        shapeEl = `<polygon points="10,${itemY} 20,${itemY + 6} 10,${itemY + 12} 0,${itemY + 6}" fill="${item.color.fill}" stroke="${item.color.stroke}"/>`;
        break;
      case "ellipse":
        shapeEl = `<ellipse cx="10" cy="${itemY + 6}" rx="10" ry="6" fill="${item.color.fill}" stroke="${item.color.stroke}"/>`;
        break;
      case "stadium":
        shapeEl = `<rect x="0" y="${itemY}" width="20" height="12" rx="6" ry="6" fill="${item.color.fill}" stroke="${item.color.stroke}"/>`;
        break;
      default:
        shapeEl = `<rect x="0" y="${itemY}" width="20" height="12" rx="4" fill="${item.color.fill}" stroke="${item.color.stroke}"/>`;
    }
    svg += `
    ${shapeEl}
    <text x="25" y="${itemY + 10}" class="legend-text">${escapeSVGText(item.label)}</text>`;
  });
  svg += "\n  </g>";
  return svg;
}
function layoutNodesInLayers(layers, options = {}) {
  const opts = { ...DEFAULT_SVG_OPTIONS, ...options };
  const positions = /* @__PURE__ */ new Map();
  let currentY = opts.padding + (opts.title ? 40 : 0);
  for (const layer of layers) {
    if (layer.length === 0) continue;
    const layerWidth = layer.length * (opts.nodeWidth + opts.nodeSpacing) - opts.nodeSpacing;
    let startX = (opts.width - layerWidth) / 2;
    for (const node of layer) {
      positions.set(node.id, {
        id: node.id,
        x: startX,
        y: currentY,
        width: opts.nodeWidth,
        height: opts.nodeHeight,
        label: node.label,
        type: node.type
      });
      startX += opts.nodeWidth + opts.nodeSpacing;
    }
    currentY += opts.nodeHeight + opts.layerSpacing;
  }
  return positions;
}
function layoutNodesHorizontally(nodes, options = {}) {
  const opts = { ...DEFAULT_SVG_OPTIONS, ...options };
  const positions = /* @__PURE__ */ new Map();
  const totalWidth = nodes.length * (opts.nodeWidth + opts.nodeSpacing) - opts.nodeSpacing;
  let startX = Math.max(opts.padding, (opts.width - totalWidth) / 2);
  const y = opts.height / 2 - opts.nodeHeight / 2;
  for (const node of nodes) {
    positions.set(node.id, {
      id: node.id,
      x: startX,
      y,
      width: opts.nodeWidth,
      height: opts.nodeHeight,
      label: node.label,
      type: node.type
    });
    startX += opts.nodeWidth + opts.nodeSpacing;
  }
  return positions;
}
function calculateSVGHeight(positions, padding = 40, extraSpace = 120) {
  let maxY = 0;
  for (const pos of positions.values()) {
    maxY = Math.max(maxY, pos.y + pos.height);
  }
  return maxY + padding + extraSpace;
}
var DEFAULT_SVG_OPTIONS, COLOR_PALETTES;
var init_svg_utils = __esm({
  "src/export/visual/svg-utils.ts"() {
    init_esm_shims();
    DEFAULT_SVG_OPTIONS = {
      width: 800,
      height: 600,
      nodeWidth: 150,
      nodeHeight: 40,
      nodeSpacing: 20,
      layerSpacing: 100,
      padding: 40,
      colorScheme: "default",
      includeLabels: true,
      includeMetrics: true,
      title: ""
    };
    COLOR_PALETTES = {
      default: {
        primary: { fill: "#64b5f6", stroke: "#1976d2" },
        secondary: { fill: "#81c784", stroke: "#388e3c" },
        tertiary: { fill: "#ffb74d", stroke: "#f57c00" },
        quaternary: { fill: "#ba68c8", stroke: "#7b1fa2" },
        neutral: { fill: "#bdbdbd", stroke: "#616161" },
        success: { fill: "#81c784", stroke: "#388e3c" },
        warning: { fill: "#ffb74d", stroke: "#f57c00" },
        error: { fill: "#e57373", stroke: "#d32f2f" },
        info: { fill: "#64b5f6", stroke: "#1976d2" },
        highlight: { fill: "#fff176", stroke: "#fbc02d" }
      },
      pastel: {
        primary: { fill: "#bbdefb", stroke: "#2196f3" },
        secondary: { fill: "#c8e6c9", stroke: "#4caf50" },
        tertiary: { fill: "#ffe0b2", stroke: "#ff9800" },
        quaternary: { fill: "#e1bee7", stroke: "#9c27b0" },
        neutral: { fill: "#e0e0e0", stroke: "#757575" },
        success: { fill: "#c8e6c9", stroke: "#4caf50" },
        warning: { fill: "#fff9c4", stroke: "#ffc107" },
        error: { fill: "#ffcdd2", stroke: "#e53935" },
        info: { fill: "#bbdefb", stroke: "#2196f3" },
        highlight: { fill: "#fff9c4", stroke: "#fbc02d" }
      },
      monochrome: {
        primary: { fill: "#ffffff", stroke: "#333333" },
        secondary: { fill: "#f5f5f5", stroke: "#333333" },
        tertiary: { fill: "#eeeeee", stroke: "#333333" },
        quaternary: { fill: "#e0e0e0", stroke: "#333333" },
        neutral: { fill: "#fafafa", stroke: "#333333" },
        success: { fill: "#ffffff", stroke: "#333333" },
        warning: { fill: "#f5f5f5", stroke: "#333333" },
        error: { fill: "#eeeeee", stroke: "#333333" },
        info: { fill: "#ffffff", stroke: "#333333" },
        highlight: { fill: "#e0e0e0", stroke: "#333333" }
      }
    };
  }
});

// src/export/visual/graphml-utils.ts
function escapeXML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function generateGraphMLHeader(options = {}) {
  const { graphId = "G", directed = true, graphName } = options;
  let header = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns
         http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">

  <!-- Node attributes -->
  <key id="label" for="node" attr.name="label" attr.type="string"/>
  <key id="type" for="node" attr.name="type" attr.type="string"/>
  <key id="description" for="node" attr.name="description" attr.type="string"/>

  <!-- Edge attributes -->
  <key id="edgeLabel" for="edge" attr.name="label" attr.type="string"/>
  <key id="weight" for="edge" attr.name="weight" attr.type="double"/>
  <key id="edgeType" for="edge" attr.name="type" attr.type="string"/>

  <!-- Graph attributes -->
  <key id="graphName" for="graph" attr.name="name" attr.type="string"/>

  <graph id="${escapeXML(graphId)}" edgedefault="${directed ? "directed" : "undirected"}">`;
  if (graphName) {
    header += `
    <data key="graphName">${escapeXML(graphName)}</data>`;
  }
  return header;
}
function generateGraphMLFooter() {
  return `
  </graph>
</graphml>`;
}
function renderGraphMLNode(node, options = {}) {
  const { includeLabels = true, includeMetadata = true } = options;
  let nodeXML = `
    <node id="${escapeXML(node.id)}">`;
  if (includeLabels && node.label) {
    nodeXML += `
      <data key="label">${escapeXML(node.label)}</data>`;
  }
  if (node.type) {
    nodeXML += `
      <data key="type">${escapeXML(node.type)}</data>`;
  }
  if (includeMetadata && node.metadata) {
    if (node.metadata.description) {
      nodeXML += `
      <data key="description">${escapeXML(String(node.metadata.description))}</data>`;
    }
  }
  nodeXML += `
    </node>`;
  return nodeXML;
}
function renderGraphMLEdge(edge, options = {}) {
  const { includeLabels = true, includeMetadata = true } = options;
  let edgeXML = `
    <edge id="${escapeXML(edge.id)}" source="${escapeXML(edge.source)}" target="${escapeXML(edge.target)}">`;
  if (includeLabels && edge.label) {
    edgeXML += `
      <data key="edgeLabel">${escapeXML(edge.label)}</data>`;
  }
  if (includeMetadata && edge.metadata) {
    if (edge.metadata.weight !== void 0) {
      edgeXML += `
      <data key="weight">${edge.metadata.weight}</data>`;
    }
    if (edge.metadata.type) {
      edgeXML += `
      <data key="edgeType">${escapeXML(String(edge.metadata.type))}</data>`;
    }
  }
  edgeXML += `
    </edge>`;
  return edgeXML;
}
function generateGraphML(nodes, edges, options = {}) {
  const mergedOptions = { ...DEFAULT_GRAPHML_OPTIONS, ...options };
  let graphml = generateGraphMLHeader(mergedOptions);
  graphml += "\n\n    <!-- Nodes -->";
  for (const node of nodes) {
    graphml += renderGraphMLNode(node, mergedOptions);
  }
  graphml += "\n\n    <!-- Edges -->";
  for (const edge of edges) {
    graphml += renderGraphMLEdge(edge, mergedOptions);
  }
  graphml += generateGraphMLFooter();
  return graphml;
}
function createLinearGraphML(nodeLabels, options = {}) {
  const nodes = nodeLabels.map((label, i) => ({
    id: `n${i}`,
    label,
    type: "step"
  }));
  const edges = [];
  for (let i = 0; i < nodeLabels.length - 1; i++) {
    edges.push({
      id: `e${i}`,
      source: `n${i}`,
      target: `n${i + 1}`
    });
  }
  return generateGraphML(nodes, edges, options);
}
function createTreeGraphML(root, options = {}) {
  const nodes = [];
  const edges = [];
  let edgeCount = 0;
  function traverse(node, depth = 0) {
    nodes.push({
      id: node.id,
      label: node.label,
      type: depth === 0 ? "root" : "node",
      metadata: { depth }
    });
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        edges.push({
          id: `e${edgeCount++}`,
          source: node.id,
          target: child.id
        });
        traverse(child, depth + 1);
      }
    }
  }
  traverse(root);
  return generateGraphML(nodes, edges, options);
}
var DEFAULT_GRAPHML_OPTIONS;
var init_graphml_utils = __esm({
  "src/export/visual/graphml-utils.ts"() {
    init_esm_shims();
    DEFAULT_GRAPHML_OPTIONS = {
      directed: true,
      includeMetadata: true,
      includeLabels: true,
      graphId: "G",
      graphName: "Graph"
    };
  }
});

// src/export/visual/tikz-utils.ts
function getTikZColor(nodeType, colorScheme = "default") {
  const palette = COLOR_PALETTES2[colorScheme] || COLOR_PALETTES2.default;
  const colorMap = {
    primary: "primary",
    secondary: "secondary",
    tertiary: "tertiary",
    neutral: "neutral",
    success: "success",
    warning: "warning",
    danger: "danger",
    info: "info",
    cause: "primary",
    effect: "tertiary",
    mediator: "secondary",
    confounder: "warning",
    root: "primary",
    current: "primary",
    terminal: "success",
    hypothesis: "info",
    evidence: "secondary",
    conclusion: "success"
  };
  const key = colorMap[nodeType] || "neutral";
  return palette[key];
}
function escapeLatex2(str) {
  return str.replace(/\\/g, "\\textbackslash{}").replace(/%/g, "\\%").replace(/\$/g, "\\$").replace(/&/g, "\\&").replace(/#/g, "\\#").replace(/_/g, "\\_").replace(/{/g, "\\{").replace(/}/g, "\\}").replace(/\^/g, "\\textasciicircum{}").replace(/~/g, "\\textasciitilde{}");
}
function generateTikZHeader(options = {}) {
  const { standalone = false, title, scale = 1 } = options;
  let header = "";
  if (standalone) {
    header += `\\documentclass[tikz,border=10pt]{standalone}
\\usepackage{tikz}
\\usetikzlibrary{shapes,arrows,positioning,calc,backgrounds,fit}
\\begin{document}
`;
  }
  header += `\\begin{tikzpicture}[
  scale=${scale},
  every node/.style={font=\\small},
  box/.style={rectangle, draw, rounded corners=3pt, minimum width=2cm, minimum height=0.8cm, text centered},
  circle node/.style={circle, draw, minimum size=0.8cm, text centered},
  ellipse node/.style={ellipse, draw, minimum width=2cm, minimum height=0.8cm, text centered},
  diamond node/.style={diamond, draw, aspect=2, minimum width=1.5cm, text centered},
  stadium node/.style={rectangle, draw, rounded corners=0.4cm, minimum width=2cm, minimum height=0.8cm, text centered},
  arrow/.style={->, >=stealth, thick},
  dashed arrow/.style={->, >=stealth, thick, dashed},
  dotted arrow/.style={->, >=stealth, thick, dotted},
  edge label/.style={font=\\footnotesize, fill=white, inner sep=1pt}
]`;
  if (title) {
    header += `

% Title
\\node[font=\\large\\bfseries] at (4, 0.5) {${escapeLatex2(title)}};`;
  }
  return header;
}
function generateTikZFooter(options = {}) {
  const { standalone = false } = options;
  let footer = "\n\\end{tikzpicture}";
  if (standalone) {
    footer += "\n\\end{document}";
  }
  return footer;
}
function getShapeStyle(shape) {
  switch (shape) {
    case "circle":
      return "circle node";
    case "ellipse":
      return "ellipse node";
    case "diamond":
      return "diamond node";
    case "stadium":
    case "rounded":
      return "stadium node";
    case "rectangle":
    default:
      return "box";
  }
}
function renderTikZNode(node, options = {}) {
  const { colorScheme = "default", includeLabels = true } = options;
  const colors = getTikZColor(node.type || "neutral", colorScheme);
  const shapeStyle = getShapeStyle(node.shape);
  const label = includeLabels ? escapeLatex2(node.label) : escapeLatex2(node.id);
  const position = node.x !== void 0 && node.y !== void 0 ? `at (${node.x}, ${node.y})` : "";
  return `
  \\node[${shapeStyle}, fill=${colors.fill}, draw=${colors.stroke}] (${node.id}) ${position} {${label}};`;
}
function renderTikZEdge(edge, options = {}) {
  const { includeLabels = true } = options;
  let style = "arrow";
  if (edge.style === "dashed") style = "dashed arrow";
  if (edge.style === "dotted") style = "dotted arrow";
  if (edge.directed === false) style = style.replace("->", "-");
  let bendOption = "";
  if (edge.bend) {
    if (typeof edge.bend === "number") {
      bendOption = `, bend ${edge.bend > 0 ? "left" : "right"}=${Math.abs(edge.bend)}`;
    } else {
      bendOption = `, bend ${edge.bend}`;
    }
  }
  let labelOption = "";
  if (includeLabels && edge.label) {
    labelOption = ` node[edge label, midway] {${escapeLatex2(edge.label)}}`;
  }
  return `
  \\draw[${style}${bendOption}] (${edge.source}) --${labelOption} (${edge.target});`;
}
function renderTikZMetrics(x, y, metrics) {
  let tikz = `

  % Metrics Panel
  \\node[draw, fill=white, rounded corners, align=left, font=\\footnotesize] at (${x}, ${y}) {`;
  const lines = metrics.map((m) => `${escapeLatex2(m.label)}: ${escapeLatex2(String(m.value))}`);
  tikz += lines.join(" \\\\ ");
  tikz += "};";
  return tikz;
}
function renderTikZLegend(x, y, items) {
  let tikz = "\n\n  % Legend";
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemY = y - i * 0.5;
    const shapeStyle = getShapeStyle(item.shape);
    tikz += `
  \\node[${shapeStyle}, fill=${item.color.fill}, draw=${item.color.stroke}, minimum width=0.5cm, minimum height=0.3cm] at (${x}, ${itemY}) {};`;
    tikz += `
  \\node[right, font=\\footnotesize] at (${x + 0.4}, ${itemY}) {${escapeLatex2(item.label)}};`;
  }
  return tikz;
}
function generateTikZ(nodes, edges, options = {}) {
  const mergedOptions = { ...DEFAULT_TIKZ_OPTIONS, ...options };
  let tikz = generateTikZHeader(mergedOptions);
  tikz += "\n\n  % Nodes";
  for (const node of nodes) {
    tikz += renderTikZNode(node, mergedOptions);
  }
  tikz += "\n\n  % Edges";
  for (const edge of edges) {
    tikz += renderTikZEdge(edge, mergedOptions);
  }
  tikz += generateTikZFooter(mergedOptions);
  return tikz;
}
function createLinearTikZ(nodeLabels, options = {}) {
  const nodes = nodeLabels.map((label, i) => ({
    id: `n${i}`,
    label,
    x: i * 3,
    y: 0,
    type: i === 0 ? "primary" : i === nodeLabels.length - 1 ? "success" : "neutral",
    shape: "rectangle"
  }));
  const edges = [];
  for (let i = 0; i < nodeLabels.length - 1; i++) {
    edges.push({
      source: `n${i}`,
      target: `n${i + 1}`,
      directed: true
    });
  }
  return generateTikZ(nodes, edges, options);
}
function createTreeTikZ(root, options = {}) {
  const nodes = [];
  const edges = [];
  function traverse(node, x, y, width) {
    nodes.push({
      id: node.id,
      label: node.label,
      x,
      y,
      type: y === 0 ? "primary" : "neutral",
      shape: "rectangle"
    });
    if (node.children && Array.isArray(node.children)) {
      const children = node.children;
      const childWidth = width / children.length;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const childX = x - width / 2 + childWidth / 2 + i * childWidth;
        edges.push({
          source: node.id,
          target: child.id,
          directed: true
        });
        traverse(child, childX, y - 2, childWidth);
      }
    }
  }
  traverse(root, 4, 0, 8);
  return generateTikZ(nodes, edges, options);
}
var DEFAULT_TIKZ_OPTIONS, COLOR_PALETTES2;
var init_tikz_utils = __esm({
  "src/export/visual/tikz-utils.ts"() {
    init_esm_shims();
    DEFAULT_TIKZ_OPTIONS = {
      standalone: false,
      includeLabels: true,
      includeMetrics: true,
      colorScheme: "default",
      scale: 1,
      nodeDistance: "2cm",
      levelDistance: "1.5cm"
    };
    COLOR_PALETTES2 = {
      default: {
        primary: { fill: "blue!20", stroke: "blue!60" },
        secondary: { fill: "green!20", stroke: "green!60" },
        tertiary: { fill: "orange!20", stroke: "orange!60" },
        neutral: { fill: "gray!20", stroke: "gray!60" },
        success: { fill: "green!30", stroke: "green!70" },
        warning: { fill: "yellow!30", stroke: "yellow!70" },
        danger: { fill: "red!20", stroke: "red!60" },
        info: { fill: "cyan!20", stroke: "cyan!60" }
      },
      pastel: {
        primary: { fill: "blue!10", stroke: "blue!40" },
        secondary: { fill: "green!10", stroke: "green!40" },
        tertiary: { fill: "orange!10", stroke: "orange!40" },
        neutral: { fill: "gray!10", stroke: "gray!40" },
        success: { fill: "green!15", stroke: "green!50" },
        warning: { fill: "yellow!15", stroke: "yellow!50" },
        danger: { fill: "red!10", stroke: "red!40" },
        info: { fill: "cyan!10", stroke: "cyan!40" }
      },
      monochrome: {
        primary: { fill: "black!10", stroke: "black!60" },
        secondary: { fill: "black!15", stroke: "black!70" },
        tertiary: { fill: "black!20", stroke: "black!80" },
        neutral: { fill: "black!5", stroke: "black!50" },
        success: { fill: "black!10", stroke: "black!60" },
        warning: { fill: "black!15", stroke: "black!70" },
        danger: { fill: "black!20", stroke: "black!80" },
        info: { fill: "black!10", stroke: "black!60" }
      }
    };
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
    case "svg":
      return causalGraphToSVG(thought, options);
    case "graphml":
      return causalGraphToGraphML(thought, options);
    case "tikz":
      return causalGraphToTikZ(thought, options);
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
function causalGraphToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width
  } = options;
  if (!thought.causalGraph || !thought.causalGraph.nodes) {
    return generateSVGHeader(svgWidth, 200, "Causal Graph") + '\n  <text x="400" y="100" text-anchor="middle" class="subtitle">No causal graph data</text>\n' + generateSVGFooter();
  }
  const causes = thought.causalGraph.nodes.filter((n) => n.type === "cause");
  const mediators = thought.causalGraph.nodes.filter((n) => n.type === "mediator");
  const confounders = thought.causalGraph.nodes.filter((n) => n.type === "confounder");
  const effects = thought.causalGraph.nodes.filter((n) => n.type === "effect");
  const layers = [
    causes.map((n) => ({ id: n.id, label: includeLabels ? n.name : n.id, type: "cause" })),
    [...mediators, ...confounders].map((n) => ({ id: n.id, label: includeLabels ? n.name : n.id, type: n.type })),
    effects.map((n) => ({ id: n.id, label: includeLabels ? n.name : n.id, type: "effect" }))
  ].filter((layer) => layer.length > 0);
  const positions = layoutNodesInLayers(layers, { width: svgWidth, title: "Causal Graph" });
  const actualHeight = calculateSVGHeight(positions);
  let svg = generateSVGHeader(svgWidth, actualHeight, "Causal Graph");
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  for (const edge of thought.causalGraph.edges) {
    const fromPos = positions.get(edge.from);
    const toPos = positions.get(edge.to);
    if (fromPos && toPos) {
      const label = includeMetrics && edge.strength !== void 0 ? edge.strength.toFixed(2) : void 0;
      svg += renderEdge(fromPos, toPos, { label });
    }
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  for (const [, pos] of positions) {
    const colors = getNodeColor(pos.type === "cause" ? "primary" : pos.type === "effect" ? "tertiary" : "neutral", colorScheme);
    switch (pos.type) {
      case "cause":
        svg += renderStadiumNode(pos, colors);
        break;
      case "effect":
        svg += renderEllipseNode(pos, colors);
        break;
      case "confounder":
        svg += renderDiamondNode(pos, colors);
        break;
      default:
        svg += renderRectNode(pos, colors);
    }
  }
  svg += "\n  </g>";
  if (includeMetrics) {
    const metrics = [
      { label: "Nodes", value: thought.causalGraph.nodes.length },
      { label: "Edges", value: thought.causalGraph.edges.length },
      { label: "Causes", value: causes.length },
      { label: "Effects", value: effects.length }
    ];
    svg += renderMetricsPanel(svgWidth - 180, actualHeight - 110, metrics);
  }
  const legendItems = [
    { label: "Cause", color: getNodeColor("primary", colorScheme) },
    { label: "Mediator", color: getNodeColor("neutral", colorScheme) },
    { label: "Confounder", color: getNodeColor("neutral", colorScheme), shape: "diamond" },
    { label: "Effect", color: getNodeColor("tertiary", colorScheme), shape: "ellipse" }
  ];
  svg += renderLegend(20, actualHeight - 100, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function causalGraphToGraphML(thought, options) {
  const { includeMetrics = true } = options;
  if (!thought.causalGraph || !thought.causalGraph.nodes) {
    const emptyNodes = [
      { id: "no_data", label: "No causal graph data", type: "message" }
    ];
    return generateGraphML(emptyNodes, [], { graphName: "Causal Graph" });
  }
  const nodes = thought.causalGraph.nodes.map((node) => ({
    id: node.id,
    label: node.name,
    type: node.type
  }));
  const edges = thought.causalGraph.edges.map((edge, index) => {
    const edgeData = {
      id: `e${index}`,
      source: edge.from,
      target: edge.to
    };
    if (includeMetrics && edge.strength !== void 0) {
      edgeData.metadata = { weight: edge.strength };
    }
    return edgeData;
  });
  const graphmlOptions = {
    graphName: "Causal Graph"
  };
  return generateGraphML(nodes, edges, graphmlOptions);
}
function causalGraphToTikZ(thought, options) {
  const { includeLabels = true, includeMetrics = true } = options;
  if (!thought.causalGraph || !thought.causalGraph.nodes) {
    const emptyNodes = [
      { id: "no_data", x: 0, y: 0, label: "No causal graph data", shape: "rectangle" }
    ];
    return generateTikZ(emptyNodes, [], { title: "Causal Graph" });
  }
  const causes = thought.causalGraph.nodes.filter((n) => n.type === "cause");
  const mediators = thought.causalGraph.nodes.filter((n) => n.type === "mediator");
  const confounders = thought.causalGraph.nodes.filter((n) => n.type === "confounder");
  const effects = thought.causalGraph.nodes.filter((n) => n.type === "effect");
  const nodes = [];
  causes.forEach((node, index) => {
    const spacing = 3;
    const offset = (causes.length - 1) * spacing / 2;
    nodes.push({
      id: node.id,
      x: index * spacing - offset,
      y: 0,
      label: includeLabels ? node.name : node.id,
      shape: "stadium",
      type: node.type
    });
  });
  const middleNodes = [...mediators, ...confounders];
  middleNodes.forEach((node, index) => {
    const spacing = 3;
    const offset = (middleNodes.length - 1) * spacing / 2;
    nodes.push({
      id: node.id,
      x: index * spacing - offset,
      y: -2,
      label: includeLabels ? node.name : node.id,
      shape: node.type === "confounder" ? "diamond" : "rectangle",
      type: node.type
    });
  });
  effects.forEach((node, index) => {
    const spacing = 3;
    const offset = (effects.length - 1) * spacing / 2;
    nodes.push({
      id: node.id,
      x: index * spacing - offset,
      y: -4,
      label: includeLabels ? node.name : node.id,
      shape: "ellipse",
      type: node.type
    });
  });
  const edges = thought.causalGraph.edges.map((edge) => {
    const edgeData = {
      source: edge.from,
      target: edge.to
    };
    if (includeMetrics && edge.strength !== void 0) {
      edgeData.label = edge.strength.toFixed(2);
    }
    return edgeData;
  });
  const tikzOptions = {
    title: "Causal Graph"
  };
  return generateTikZ(nodes, edges, tikzOptions);
}
var init_causal = __esm({
  "src/export/visual/causal.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return timelineToSVG(thought, options);
    case "graphml":
      return timelineToGraphML(thought);
    case "tikz":
      return timelineToTikZ(thought);
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
function timelineToGraphML(thought, _options) {
  if (!thought.events || thought.events.length === 0) {
    return createLinearGraphML([], {
      graphName: thought.timeline?.name || "Timeline",
      directed: true
    });
  }
  const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);
  const labels = sortedEvents.map((event) => event.name);
  return createLinearGraphML(labels, {
    graphName: thought.timeline?.name || "Timeline",
    directed: true
  });
}
function timelineToTikZ(thought, _options) {
  if (!thought.events || thought.events.length === 0) {
    return createLinearTikZ([], {
      title: thought.timeline?.name || "Timeline"
    });
  }
  const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);
  const labels = sortedEvents.map((event) => event.name);
  return createLinearTikZ(labels, {
    title: thought.timeline?.name || "Timeline"
  });
}
function timelineToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = 300
  } = options;
  const title = thought.timeline?.name || "Timeline";
  if (!thought.events || thought.events.length === 0) {
    return generateSVGHeader(svgWidth, 200, title) + '\n  <text x="400" y="100" text-anchor="middle" class="subtitle">No events</text>\n' + generateSVGFooter();
  }
  const sortedEvents = [...thought.events].sort((a, b) => a.timestamp - b.timestamp);
  const nodes = sortedEvents.map((event) => ({
    id: event.id,
    label: includeLabels ? event.name : event.id,
    type: event.type
  }));
  const positions = layoutNodesHorizontally(nodes, {
    width: svgWidth,
    height: svgHeight,
    nodeWidth: 120,
    nodeHeight: 40,
    nodeSpacing: 30
  });
  let svg = generateSVGHeader(svgWidth, svgHeight, title);
  const axisY = svgHeight / 2 + 40;
  svg += `
  <!-- Timeline Axis -->
  <line x1="40" y1="${axisY}" x2="${svgWidth - 40}" y2="${axisY}" stroke="#333" stroke-width="2" marker-end="url(#arrowhead)"/>`;
  svg += '\n\n  <!-- Edges -->\n  <g class="edges">';
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const fromPos = positions.get(sortedEvents[i].id);
    const toPos = positions.get(sortedEvents[i + 1].id);
    if (fromPos && toPos) {
      svg += renderHorizontalEdge(fromPos, toPos, {});
    }
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  for (const event of sortedEvents) {
    const pos = positions.get(event.id);
    if (pos) {
      const colors = event.type === "instant" ? getNodeColor("primary", colorScheme) : getNodeColor("secondary", colorScheme);
      if (event.type === "instant") {
        svg += renderEllipseNode(pos, colors);
      } else {
        svg += renderRectNode(pos, colors);
      }
      svg += `
    <text x="${pos.x}" y="${pos.y + pos.height + 15}" text-anchor="middle" class="edge-label">t=${event.timestamp}</text>`;
    }
  }
  svg += "\n  </g>";
  const legendItems = [
    { label: "Instant", color: getNodeColor("primary", colorScheme), shape: "ellipse" },
    { label: "Interval", color: getNodeColor("secondary", colorScheme) }
  ];
  svg += renderLegend(20, svgHeight - 60, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
var init_temporal = __esm({
  "src/export/visual/temporal.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return gameTreeToSVG(thought, options);
    case "graphml":
      return gameTreeToGraphML(thought, options);
    case "tikz":
      return gameTreeToTikZ(thought, options);
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
function gameTreeToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = 500
  } = options;
  const title = thought.game?.name || "Game Tree";
  if (!thought.game) {
    return generateSVGHeader(svgWidth, 200, title) + '\n  <text x="400" y="100" text-anchor="middle" class="subtitle">No game defined</text>\n' + generateSVGFooter();
  }
  const positions = /* @__PURE__ */ new Map();
  const nodeWidth = 120;
  const nodeHeight = 40;
  if (thought.gameTree && thought.gameTree.nodes) {
    const nodeDepths = /* @__PURE__ */ new Map();
    const rootNodes = thought.gameTree.nodes.filter((n) => !n.parentNode);
    const queue = rootNodes.map((n) => ({ nodeId: n.id, depth: 0 }));
    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift();
      nodeDepths.set(nodeId, depth);
      const node = thought.gameTree.nodes.find((n) => n.id === nodeId);
      if (node) {
        for (const childId of node.childNodes) {
          queue.push({ nodeId: childId, depth: depth + 1 });
        }
      }
    }
    const nodesByDepth = /* @__PURE__ */ new Map();
    for (const node of thought.gameTree.nodes) {
      const depth = nodeDepths.get(node.id) || 0;
      if (!nodesByDepth.has(depth)) {
        nodesByDepth.set(depth, []);
      }
      nodesByDepth.get(depth).push(node);
    }
    const depths = Array.from(nodesByDepth.keys()).sort((a, b) => a - b);
    const verticalSpacing = 100;
    let currentY = 60;
    for (const depth of depths) {
      const nodesAtDepth = nodesByDepth.get(depth);
      const layerWidth = nodesAtDepth.length * (nodeWidth + 20) - 20;
      let startX = (svgWidth - layerWidth) / 2;
      for (const node of nodesAtDepth) {
        const label = includeLabels ? node.action || node.id : sanitizeId(node.id);
        positions.set(node.id, {
          id: node.id,
          x: startX,
          y: currentY,
          width: nodeWidth,
          height: nodeHeight,
          label,
          type: node.type
        });
        startX += nodeWidth + 20;
      }
      currentY += verticalSpacing;
    }
  } else if (thought.strategies) {
    positions.set("root", {
      id: "root",
      x: svgWidth / 2 - nodeWidth / 2,
      y: 60,
      width: nodeWidth,
      height: nodeHeight,
      label: "Game",
      type: "root"
    });
    const stratCount = Math.min(thought.strategies.length, 5);
    const layerWidth = stratCount * (nodeWidth + 20) - 20;
    let startX = (svgWidth - layerWidth) / 2;
    for (let i = 0; i < stratCount; i++) {
      const strategy = thought.strategies[i];
      positions.set(strategy.id, {
        id: strategy.id,
        x: startX,
        y: 180,
        width: nodeWidth,
        height: nodeHeight,
        label: strategy.name,
        type: "strategy"
      });
      startX += nodeWidth + 20;
    }
  }
  let svg = generateSVGHeader(svgWidth, svgHeight, title);
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  if (thought.gameTree && thought.gameTree.nodes) {
    for (const node of thought.gameTree.nodes) {
      if (node.childNodes) {
        for (const childId of node.childNodes) {
          const fromPos = positions.get(node.id);
          const toPos = positions.get(childId);
          if (fromPos && toPos) {
            svg += renderEdge(fromPos, toPos, {});
          }
        }
      }
    }
  } else if (thought.strategies) {
    const rootPos = positions.get("root");
    if (rootPos) {
      for (const strategy of thought.strategies.slice(0, 5)) {
        const stratPos = positions.get(strategy.id);
        if (stratPos) {
          svg += renderEdge(rootPos, stratPos, {});
        }
      }
    }
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  for (const [, pos] of positions) {
    const colors = pos.type === "terminal" ? getNodeColor("success", colorScheme) : pos.type === "root" ? getNodeColor("primary", colorScheme) : getNodeColor("neutral", colorScheme);
    if (pos.type === "terminal") {
      svg += renderEllipseNode(pos, colors);
    } else {
      svg += renderRectNode(pos, colors);
    }
  }
  svg += "\n  </g>";
  if (includeMetrics && thought.nashEquilibria) {
    const metrics = [
      { label: "Equilibria", value: thought.nashEquilibria.length },
      { label: "Strategies", value: thought.strategies?.length || 0 }
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 80, metrics);
  }
  const legendItems = [
    { label: "Decision", color: getNodeColor("neutral", colorScheme) },
    { label: "Terminal", color: getNodeColor("success", colorScheme), shape: "ellipse" }
  ];
  svg += renderLegend(20, svgHeight - 60, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function gameTreeToGraphML(thought, options) {
  const { includeLabels = true } = options;
  if (!thought.game) {
    const nodes2 = [{ id: "root", label: "No game defined", type: "root" }];
    return generateGraphML(nodes2, [], { graphName: "Empty Game Tree" });
  }
  if (thought.gameTree && thought.gameTree.nodes && thought.gameTree.nodes.length > 0) {
    const nodes2 = thought.gameTree.nodes.map((node) => ({
      id: sanitizeId(node.id),
      label: includeLabels ? node.action || node.id : node.id,
      type: node.type || "node",
      metadata: {
        action: node.action,
        player: node.playerId
      }
    }));
    const edges = [];
    let edgeCount = 0;
    for (const node of thought.gameTree.nodes) {
      if (node.childNodes && node.childNodes.length > 0) {
        for (const childId of node.childNodes) {
          const childNode = thought.gameTree.nodes.find((n) => n.id === childId);
          edges.push({
            id: `e${edgeCount++}`,
            source: sanitizeId(node.id),
            target: sanitizeId(childId),
            label: includeLabels && childNode?.action ? childNode.action : void 0,
            directed: true
          });
        }
      }
    }
    return generateGraphML(nodes2, edges, { graphName: thought.game?.name || "Game Tree" });
  } else if (thought.strategies && thought.strategies.length > 0) {
    const root = {
      id: "root",
      label: "Game",
      children: thought.strategies.slice(0, 5).map((strategy) => ({
        id: sanitizeId(strategy.id),
        label: strategy.name
      }))
    };
    return createTreeGraphML(root, { graphName: thought.game?.name || "Game Tree" });
  }
  const nodes = [{ id: "root", label: "No game tree", type: "root" }];
  return generateGraphML(nodes, [], { graphName: thought.game?.name || "Game Tree" });
}
function gameTreeToTikZ(thought, options) {
  const { includeLabels = true, colorScheme = "default" } = options;
  if (!thought.game) {
    const nodes2 = [{ id: "root", label: "No game defined", x: 4, y: 0, type: "root", shape: "rectangle" }];
    return generateTikZ(nodes2, [], { title: "Empty Game Tree", colorScheme });
  }
  if (thought.gameTree && thought.gameTree.nodes && thought.gameTree.nodes.length > 0) {
    const nodeDepths = /* @__PURE__ */ new Map();
    const rootNodes = thought.gameTree.nodes.filter((n) => !n.parentNode);
    const queue = rootNodes.map((n) => ({ nodeId: n.id, depth: 0 }));
    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift();
      nodeDepths.set(nodeId, depth);
      const node = thought.gameTree.nodes.find((n) => n.id === nodeId);
      if (node && node.childNodes) {
        for (const childId of node.childNodes) {
          queue.push({ nodeId: childId, depth: depth + 1 });
        }
      }
    }
    const nodesByDepth = /* @__PURE__ */ new Map();
    for (const node of thought.gameTree.nodes) {
      const depth = nodeDepths.get(node.id) || 0;
      if (!nodesByDepth.has(depth)) {
        nodesByDepth.set(depth, []);
      }
      nodesByDepth.get(depth).push(node);
    }
    const nodes2 = [];
    const depths = Array.from(nodesByDepth.keys()).sort((a, b) => a - b);
    for (const depth of depths) {
      const nodesAtDepth = nodesByDepth.get(depth);
      const layerWidth = nodesAtDepth.length * 3;
      const startX = (8 - layerWidth) / 2 + 1.5;
      for (let i = 0; i < nodesAtDepth.length; i++) {
        const node = nodesAtDepth[i];
        nodes2.push({
          id: sanitizeId(node.id),
          label: includeLabels ? node.action || node.id : node.id,
          x: startX + i * 3,
          y: -depth * 2,
          // y decreases by 2 per level
          type: node.type || "neutral",
          shape: node.type === "terminal" ? "ellipse" : "rectangle"
          // Use 'ellipse' for terminal nodes
        });
      }
    }
    const edges = [];
    for (const node of thought.gameTree.nodes) {
      if (node.childNodes && node.childNodes.length > 0) {
        for (const childId of node.childNodes) {
          const childNode = thought.gameTree.nodes.find((n) => n.id === childId);
          edges.push({
            source: sanitizeId(node.id),
            target: sanitizeId(childId),
            label: includeLabels && childNode?.action ? childNode.action : void 0,
            directed: true
          });
        }
      }
    }
    return generateTikZ(nodes2, edges, { title: thought.game?.name || "Game Tree", colorScheme });
  } else if (thought.strategies && thought.strategies.length > 0) {
    const root = {
      id: "root",
      label: "Game",
      children: thought.strategies.slice(0, 5).map((strategy) => ({
        id: sanitizeId(strategy.id),
        label: strategy.name
      }))
    };
    return createTreeTikZ(root, { title: thought.game?.name || "Game Tree", colorScheme });
  }
  const nodes = [{ id: "root", label: "No game tree", x: 4, y: 0, type: "root", shape: "rectangle" }];
  return generateTikZ(nodes, [], { title: thought.game?.name || "Game Tree", colorScheme });
}
var init_game_theory = __esm({
  "src/export/visual/game-theory.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return bayesianToSVG(thought, options);
    case "graphml":
      return bayesianToGraphML(thought, options);
    case "tikz":
      return bayesianToTikZ(thought, options);
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
function bayesianToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = 400
  } = options;
  const nodeWidth = 140;
  const nodeHeight = 50;
  const centerX = svgWidth / 2;
  const positions = /* @__PURE__ */ new Map();
  positions.set("prior", {
    id: "prior",
    x: centerX - 200,
    y: 80,
    width: nodeWidth,
    height: nodeHeight,
    label: `Prior: ${includeMetrics ? thought.prior.probability.toFixed(3) : "?"}`,
    type: "prior"
  });
  positions.set("evidence", {
    id: "evidence",
    x: centerX + 60,
    y: 80,
    width: nodeWidth,
    height: nodeHeight,
    label: "Evidence",
    type: "evidence"
  });
  positions.set("hypothesis", {
    id: "hypothesis",
    x: centerX - nodeWidth / 2,
    y: 180,
    width: nodeWidth,
    height: nodeHeight,
    label: "Hypothesis",
    type: "hypothesis"
  });
  positions.set("posterior", {
    id: "posterior",
    x: centerX - nodeWidth / 2,
    y: 280,
    width: nodeWidth,
    height: nodeHeight,
    label: `Posterior: ${includeMetrics ? thought.posterior.probability.toFixed(3) : "?"}`,
    type: "posterior"
  });
  let svg = generateSVGHeader(svgWidth, svgHeight, "Bayesian Network");
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  svg += renderEdge(positions.get("prior"), positions.get("hypothesis"), {});
  svg += renderEdge(positions.get("evidence"), positions.get("hypothesis"), {});
  svg += renderEdge(positions.get("hypothesis"), positions.get("posterior"), {});
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  svg += renderStadiumNode(positions.get("prior"), getNodeColor("primary", colorScheme));
  svg += renderRectNode(positions.get("evidence"), getNodeColor("info", colorScheme));
  svg += renderEllipseNode(positions.get("hypothesis"), getNodeColor("neutral", colorScheme));
  svg += renderStadiumNode(positions.get("posterior"), getNodeColor("success", colorScheme));
  svg += "\n  </g>";
  if (includeMetrics) {
    const metrics = [
      { label: "Prior", value: thought.prior.probability.toFixed(3) },
      { label: "Posterior", value: thought.posterior.probability.toFixed(3) },
      { label: "Bayes Factor", value: thought.bayesFactor?.toFixed(2) || "N/A" }
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 100, metrics);
  }
  const legendItems = [
    { label: "Prior", color: getNodeColor("primary", colorScheme) },
    { label: "Evidence", color: getNodeColor("info", colorScheme) },
    { label: "Hypothesis", color: getNodeColor("neutral", colorScheme), shape: "ellipse" },
    { label: "Posterior", color: getNodeColor("success", colorScheme) }
  ];
  svg += renderLegend(20, svgHeight - 100, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function bayesianToGraphML(thought, options) {
  const { includeLabels = true, includeMetrics = true } = options;
  const nodes = [
    { id: "prior", label: includeLabels ? `Prior: ${thought.prior.probability.toFixed(3)}` : "Prior", type: "prior" },
    { id: "hypothesis", label: "Hypothesis", type: "hypothesis" },
    { id: "evidence", label: "Evidence", type: "evidence" },
    { id: "posterior", label: includeLabels ? `Posterior: ${thought.posterior.probability.toFixed(3)}` : "Posterior", type: "posterior" }
  ];
  const edges = [
    { id: "e1", source: "prior", target: "hypothesis" },
    { id: "e2", source: "evidence", target: "hypothesis" },
    { id: "e3", source: "hypothesis", target: "posterior" }
  ];
  return generateGraphML(nodes, edges, {
    graphName: "Bayesian Network",
    includeLabels,
    includeMetadata: includeMetrics
  });
}
function bayesianToTikZ(thought, options) {
  const { includeLabels = true, includeMetrics = true, colorScheme = "default" } = options;
  const nodes = [
    { id: "prior", label: includeLabels ? `Prior: ${thought.prior.probability.toFixed(3)}` : "Prior", x: 0, y: 0, type: "primary", shape: "stadium" },
    { id: "evidence", label: "Evidence", x: 4, y: 0, type: "info", shape: "rectangle" },
    { id: "hypothesis", label: "Hypothesis", x: 2, y: -2, type: "neutral", shape: "ellipse" },
    { id: "posterior", label: includeLabels ? `Posterior: ${thought.posterior.probability.toFixed(3)}` : "Posterior", x: 2, y: -4, type: "success", shape: "stadium" }
  ];
  const edges = [
    { source: "prior", target: "hypothesis", directed: true },
    { source: "evidence", target: "hypothesis", directed: true },
    { source: "hypothesis", target: "posterior", directed: true }
  ];
  return generateTikZ(nodes, edges, {
    title: "Bayesian Network",
    includeLabels,
    includeMetrics,
    colorScheme
  });
}
var init_bayesian = __esm({
  "src/export/visual/bayesian.ts"() {
    init_esm_shims();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return sequentialToSVG(thought, options);
    case "graphml":
      return sequentialToGraphML(thought, options);
    case "tikz":
      return sequentialToTikZ(thought, options);
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
function sequentialToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width
  } = options;
  const nodeWidth = 160;
  const nodeHeight = 50;
  const padding = 40;
  const verticalSpacing = 80;
  const positions = /* @__PURE__ */ new Map();
  let currentY = padding + 40;
  const mainNodeId = sanitizeId(thought.id);
  const mainLabel = includeLabels ? thought.content.substring(0, 40) + "..." : mainNodeId;
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    const depWidth = thought.buildUpon.length * (nodeWidth + 20) - 20;
    let startX = (svgWidth - depWidth) / 2;
    for (const depId of thought.buildUpon) {
      const depNodeId = sanitizeId(depId);
      positions.set(depId, {
        id: depId,
        x: startX,
        y: currentY,
        width: nodeWidth,
        height: nodeHeight,
        label: depNodeId,
        type: "dependency"
      });
      startX += nodeWidth + 20;
    }
    currentY += nodeHeight + verticalSpacing;
  }
  positions.set(thought.id, {
    id: thought.id,
    x: (svgWidth - nodeWidth) / 2,
    y: currentY,
    width: nodeWidth,
    height: nodeHeight,
    label: mainLabel,
    type: thought.isRevision ? "revision" : "main"
  });
  currentY += nodeHeight + padding;
  const actualHeight = currentY + 80;
  let svg = generateSVGHeader(svgWidth, actualHeight, "Sequential Dependency Graph");
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  if (thought.buildUpon) {
    for (const depId of thought.buildUpon) {
      const fromPos = positions.get(depId);
      const toPos = positions.get(thought.id);
      if (fromPos && toPos) {
        svg += renderEdge(fromPos, toPos, {});
      }
    }
  }
  if (thought.branchFrom) {
    const branchLabel = "branch";
    svg += `
    <text x="${svgWidth / 2 - 100}" y="${padding + 20}" class="edge-label">${branchLabel} from: ${thought.branchFrom}</text>`;
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  for (const [, pos] of positions) {
    const colors = pos.type === "revision" ? getNodeColor("warning", colorScheme) : pos.type === "main" ? getNodeColor("primary", colorScheme) : getNodeColor("neutral", colorScheme);
    if (pos.type === "main" || pos.type === "revision") {
      svg += renderStadiumNode(pos, colors);
    } else {
      svg += renderRectNode(pos, colors);
    }
  }
  svg += "\n  </g>";
  const legendItems = [
    { label: "Current", color: getNodeColor("primary", colorScheme) },
    { label: "Revision", color: getNodeColor("warning", colorScheme) },
    { label: "Dependency", color: getNodeColor("neutral", colorScheme) }
  ];
  svg += renderLegend(20, actualHeight - 80, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function sequentialToGraphML(thought, options) {
  const { includeLabels = true } = options;
  const nodes = [];
  const edges = [];
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    thought.buildUpon.forEach((depId, index) => {
      nodes.push({
        id: sanitizeId(depId),
        label: includeLabels ? `Step ${index + 1}: ${depId}` : sanitizeId(depId),
        type: "dependency"
      });
    });
    nodes.push({
      id: sanitizeId(thought.id),
      label: includeLabels ? `Step ${nodes.length + 1}: ${thought.content.substring(0, 50)}...` : sanitizeId(thought.id),
      type: "current"
    });
    thought.buildUpon.forEach((depId, index) => {
      const sourceId = sanitizeId(depId);
      const targetId = index < thought.buildUpon.length - 1 ? sanitizeId(thought.buildUpon[index + 1]) : sanitizeId(thought.id);
      edges.push({
        id: `e${index}`,
        source: sourceId,
        target: targetId,
        directed: true
      });
    });
  } else {
    nodes.push({
      id: sanitizeId(thought.id),
      label: includeLabels ? thought.content.substring(0, 100) : sanitizeId(thought.id),
      type: "current"
    });
  }
  return generateGraphML(nodes, edges, {
    graphName: "Sequential Dependency Graph",
    directed: true,
    includeLabels
  });
}
function sequentialToTikZ(thought, options) {
  const { includeLabels = true, colorScheme = "default" } = options;
  const nodes = [];
  const edges = [];
  if (thought.buildUpon && thought.buildUpon.length > 0) {
    thought.buildUpon.forEach((depId, index) => {
      nodes.push({
        id: sanitizeId(depId),
        label: includeLabels ? `Step ${index + 1}` : sanitizeId(depId),
        x: index * 3,
        y: 0,
        type: "success",
        // Completed steps
        shape: "rectangle"
      });
    });
    nodes.push({
      id: sanitizeId(thought.id),
      label: includeLabels ? `Step ${nodes.length + 1}` : sanitizeId(thought.id),
      x: nodes.length * 3,
      y: 0,
      type: "primary",
      // Current step
      shape: "rectangle"
    });
    thought.buildUpon.forEach((depId, index) => {
      const sourceId = sanitizeId(depId);
      const targetId = index < thought.buildUpon.length - 1 ? sanitizeId(thought.buildUpon[index + 1]) : sanitizeId(thought.id);
      edges.push({
        source: sourceId,
        target: targetId,
        directed: true
      });
    });
  } else {
    nodes.push({
      id: sanitizeId(thought.id),
      label: includeLabels ? "Current" : sanitizeId(thought.id),
      x: 0,
      y: 0,
      type: "primary",
      shape: "rectangle"
    });
  }
  return generateTikZ(nodes, edges, {
    title: "Sequential Dependency Graph",
    colorScheme,
    includeLabels
  });
}
var init_sequential = __esm({
  "src/export/visual/sequential.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return shannonToSVG(thought, options);
    case "graphml":
      return shannonToGraphML(thought, options);
    case "tikz":
      return shannonToTikZ(thought, options);
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
function shannonToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = 300
  } = options;
  const nodes = stages.map((stage) => ({
    id: sanitizeId(stage),
    label: includeLabels ? stageLabels[stage] : sanitizeId(stage),
    type: stage === thought.stage ? "current" : "stage"
  }));
  const positions = layoutNodesHorizontally(nodes, {
    width: svgWidth,
    height: svgHeight,
    nodeWidth: 130,
    nodeHeight: 45,
    nodeSpacing: 25
  });
  let svg = generateSVGHeader(svgWidth, svgHeight, "Shannon Stage Flow");
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  for (let i = 0; i < stages.length - 1; i++) {
    const fromPos = positions.get(sanitizeId(stages[i]));
    const toPos = positions.get(sanitizeId(stages[i + 1]));
    if (fromPos && toPos) {
      svg += renderHorizontalEdge(fromPos, toPos, {});
    }
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    const pos = positions.get(sanitizeId(stage));
    if (pos) {
      const isCurrent = stage === thought.stage;
      const colors = isCurrent ? getNodeColor("primary", colorScheme) : getNodeColor("neutral", colorScheme);
      if (isCurrent) {
        svg += renderStadiumNode(pos, colors);
      } else {
        svg += renderRectNode(pos, colors);
      }
    }
  }
  svg += "\n  </g>";
  if (includeMetrics && thought.uncertainty !== void 0) {
    const metrics = [
      { label: "Stage", value: stageLabels[thought.stage] },
      { label: "Uncertainty", value: thought.uncertainty.toFixed(2) }
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 80, metrics);
  }
  const legendItems = [
    { label: "Current", color: getNodeColor("primary", colorScheme) },
    { label: "Stage", color: getNodeColor("neutral", colorScheme) }
  ];
  svg += renderLegend(20, svgHeight - 60, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function shannonToGraphML(_thought, options) {
  const { includeLabels = true } = options;
  const labels = stages.map(
    (stage) => includeLabels ? stageLabels[stage] : sanitizeId(stage)
  );
  return createLinearGraphML(labels, {
    graphName: "Shannon Stage Flow",
    directed: true
  });
}
function shannonToTikZ(thought, options) {
  const { includeLabels = true, includeMetrics = true } = options;
  const nodes = stages.map((stage, i) => ({
    id: sanitizeId(stage),
    label: includeLabels ? stageLabels[stage] : sanitizeId(stage),
    x: i * 3,
    y: 0,
    shape: stage === thought.stage ? "stadium" : "rectangle",
    type: stage === thought.stage ? "primary" : "neutral"
  }));
  const edges = [];
  for (let i = 0; i < stages.length - 1; i++) {
    edges.push({
      source: sanitizeId(stages[i]),
      target: sanitizeId(stages[i + 1]),
      label: ""
    });
  }
  return generateTikZ(nodes, edges, {
    title: "Shannon Stage Flow",
    includeLabels,
    includeMetrics
  });
}
var stages, stageLabels;
var init_shannon = __esm({
  "src/export/visual/shannon.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return abductiveToSVG(thought, options);
    case "graphml":
      return abductiveToGraphML(thought, options);
    case "tikz":
      return abductiveToTikZ(thought, options);
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
function abductiveToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = 450
  } = options;
  const positions = /* @__PURE__ */ new Map();
  const nodeWidth = 180;
  const nodeHeight = 50;
  const centerX = svgWidth / 2;
  positions.set("observations", {
    id: "observations",
    x: centerX - nodeWidth / 2,
    y: 60,
    width: nodeWidth,
    height: nodeHeight,
    label: "Observations",
    type: "observations"
  });
  const hypCount = thought.hypotheses.length;
  const layerWidth = hypCount * (nodeWidth + 20) - 20;
  let startX = (svgWidth - layerWidth) / 2;
  for (const hypothesis of thought.hypotheses) {
    const hypId = sanitizeId(hypothesis.id);
    const label = includeLabels ? hypothesis.explanation.substring(0, 30) + "..." : hypId;
    const scoreLabel = includeMetrics ? ` (${hypothesis.score.toFixed(2)})` : "";
    positions.set(hypothesis.id, {
      id: hypothesis.id,
      x: startX,
      y: 180,
      width: nodeWidth,
      height: nodeHeight,
      label: label + scoreLabel,
      type: thought.bestExplanation?.id === hypothesis.id ? "best" : "hypothesis"
    });
    startX += nodeWidth + 20;
  }
  let svg = generateSVGHeader(svgWidth, svgHeight, "Abductive Hypotheses");
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  const obsPos = positions.get("observations");
  for (const hypothesis of thought.hypotheses) {
    const hypPos = positions.get(hypothesis.id);
    if (obsPos && hypPos) {
      svg += renderEdge(obsPos, hypPos, {});
    }
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  svg += renderEllipseNode(positions.get("observations"), getNodeColor("info", colorScheme));
  for (const hypothesis of thought.hypotheses) {
    const pos = positions.get(hypothesis.id);
    const isBest = thought.bestExplanation?.id === hypothesis.id;
    const colors = isBest ? getNodeColor("success", colorScheme) : getNodeColor("neutral", colorScheme);
    if (isBest) {
      svg += renderStadiumNode(pos, colors);
    } else {
      svg += renderRectNode(pos, colors);
    }
  }
  svg += "\n  </g>";
  if (includeMetrics) {
    const metrics = [
      { label: "Hypotheses", value: thought.hypotheses.length },
      { label: "Observations", value: thought.observations.length },
      { label: "Best Score", value: thought.bestExplanation?.score.toFixed(2) || "N/A" }
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 100, metrics);
  }
  const legendItems = [
    { label: "Observations", color: getNodeColor("info", colorScheme), shape: "ellipse" },
    { label: "Hypothesis", color: getNodeColor("neutral", colorScheme) },
    { label: "Best", color: getNodeColor("success", colorScheme) }
  ];
  svg += renderLegend(20, svgHeight - 80, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function abductiveToGraphML(thought, options) {
  const { includeLabels = true, includeMetrics = true } = options;
  const nodes = thought.hypotheses.map((hypothesis) => ({
    id: sanitizeId(hypothesis.id),
    label: includeLabels ? hypothesis.explanation.substring(0, 50) + "..." : hypothesis.id,
    type: "hypothesis",
    metadata: includeMetrics ? {
      description: hypothesis.explanation,
      score: hypothesis.score,
      assumptions: hypothesis.assumptions.join(", ")
    } : void 0
  }));
  if (thought.observations && thought.observations.length > 0) {
    for (const obs of thought.observations) {
      nodes.push({
        id: sanitizeId(`obs_${obs.id}`),
        label: includeLabels ? obs.description : `obs_${obs.id}`,
        type: "observation",
        metadata: includeMetrics ? {
          description: obs.description,
          confidence: obs.confidence
        } : void 0
      });
    }
  }
  const edges = [];
  let edgeId = 0;
  if (thought.observations && thought.observations.length > 0) {
    for (const obs of thought.observations) {
      for (const hypothesis of thought.hypotheses) {
        edges.push({
          id: `e${edgeId++}`,
          source: sanitizeId(`obs_${obs.id}`),
          target: sanitizeId(hypothesis.id),
          metadata: includeMetrics ? { weight: obs.confidence } : void 0
        });
      }
    }
  }
  return generateGraphML(nodes, edges, {
    graphName: "Abductive Hypotheses",
    includeLabels,
    includeMetadata: includeMetrics
  });
}
function abductiveToTikZ(thought, options) {
  const { includeLabels = true, includeMetrics = true, colorScheme = "default" } = options;
  const nodes = [];
  const edges = [];
  const hypCount = thought.hypotheses.length;
  const spacing = 3;
  const totalWidth = (hypCount - 1) * spacing;
  const startX = 4 - totalWidth / 2;
  for (let i = 0; i < thought.hypotheses.length; i++) {
    const hypothesis = thought.hypotheses[i];
    const isBest = thought.bestExplanation?.id === hypothesis.id;
    const label = includeLabels ? hypothesis.explanation.substring(0, 30) + "..." : hypothesis.id;
    const scoreLabel = includeMetrics ? ` (${hypothesis.score.toFixed(2)})` : "";
    nodes.push({
      id: sanitizeId(hypothesis.id),
      label: label + scoreLabel,
      x: startX + i * spacing,
      y: -2,
      type: isBest ? "success" : "hypothesis",
      shape: "ellipse"
    });
  }
  if (thought.observations && thought.observations.length > 0) {
    const obsCount = thought.observations.length;
    const obsSpacing = Math.min(spacing, totalWidth / Math.max(1, obsCount - 1));
    const obsStartX = 4 - (obsCount - 1) * obsSpacing / 2;
    for (let i = 0; i < thought.observations.length; i++) {
      const obs = thought.observations[i];
      nodes.push({
        id: sanitizeId(`obs_${obs.id}`),
        label: includeLabels ? obs.description.substring(0, 30) + "..." : `obs_${obs.id}`,
        x: obsStartX + i * obsSpacing,
        y: 0,
        type: "info",
        shape: "rectangle"
      });
      for (const hypothesis of thought.hypotheses) {
        edges.push({
          source: sanitizeId(`obs_${obs.id}`),
          target: sanitizeId(hypothesis.id),
          directed: true
        });
      }
    }
  }
  return generateTikZ(nodes, edges, {
    title: "Abductive Hypotheses",
    includeLabels,
    includeMetrics,
    colorScheme
  });
}
var init_abductive = __esm({
  "src/export/visual/abductive.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return counterfactualToSVG(thought, options);
    case "graphml":
      return counterfactualToGraphML(thought, options);
    case "tikz":
      return counterfactualToTikZ(thought, options);
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
function counterfactualToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width
  } = options;
  const positions = /* @__PURE__ */ new Map();
  const nodeWidth = 150;
  const nodeHeight = 40;
  const interventionId = "intervention";
  positions.set(interventionId, {
    id: interventionId,
    label: includeLabels ? thought.interventionPoint.description : interventionId,
    x: svgWidth / 2,
    y: 80,
    width: nodeWidth,
    height: nodeHeight,
    type: "intervention"
  });
  const actualId = thought.actual.id;
  const actualLabel = includeLabels ? `Actual: ${thought.actual.name}` : actualId;
  positions.set(actualId, {
    id: actualId,
    label: actualLabel,
    x: svgWidth / 4,
    y: 200,
    width: nodeWidth,
    height: nodeHeight,
    type: "actual"
  });
  const cfCount = thought.counterfactuals.length;
  const cfStartY = 200;
  const cfSpacing = 120;
  thought.counterfactuals.forEach((scenario, index) => {
    const cfLabel = includeLabels ? `CF: ${scenario.name}` : scenario.id;
    positions.set(scenario.id, {
      id: scenario.id,
      label: cfLabel,
      x: svgWidth * 3 / 4,
      y: cfStartY + index * cfSpacing,
      width: nodeWidth,
      height: nodeHeight,
      type: "counterfactual"
    });
  });
  const actualHeight = Math.max(DEFAULT_SVG_OPTIONS.height, cfStartY + (cfCount - 1) * cfSpacing + 150);
  let svg = generateSVGHeader(svgWidth, actualHeight, "Counterfactual Scenarios");
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  const interventionPos = positions.get(interventionId);
  const actualPos = positions.get(actualId);
  svg += renderEdge(interventionPos, actualPos, { label: "no change" });
  for (const scenario of thought.counterfactuals) {
    const cfPos = positions.get(scenario.id);
    if (cfPos) {
      const label = includeMetrics && scenario.likelihood ? `${scenario.likelihood.toFixed(2)}` : "intervene";
      svg += renderEdge(interventionPos, cfPos, { label });
    }
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  const interventionColors = getNodeColor("warning", colorScheme);
  svg += `
    <polygon points="${interventionPos.x},${interventionPos.y - 30} ${interventionPos.x + 40},${interventionPos.y} ${interventionPos.x},${interventionPos.y + 30} ${interventionPos.x - 40},${interventionPos.y}" fill="${interventionColors.fill}" stroke="${interventionColors.stroke}" stroke-width="2"/>`;
  svg += `
    <text x="${interventionPos.x}" y="${interventionPos.y + 5}" text-anchor="middle" class="node-label">${interventionPos.label}</text>`;
  const actualColors = getNodeColor("tertiary", colorScheme);
  svg += renderRectNode(actualPos, actualColors);
  const cfColors = getNodeColor("primary", colorScheme);
  for (const [id, pos] of positions) {
    if (id !== interventionId && id !== actualId) {
      svg += renderStadiumNode(pos, cfColors);
    }
  }
  svg += "\n  </g>";
  if (includeMetrics) {
    const metrics = [
      { label: "Counterfactuals", value: thought.counterfactuals.length },
      { label: "Feasibility", value: thought.interventionPoint.feasibility.toFixed(2) }
    ];
    svg += renderMetricsPanel(svgWidth - 180, actualHeight - 110, metrics);
  }
  const legendItems = [
    { label: "Intervention", color: interventionColors, shape: "diamond" },
    { label: "Actual", color: actualColors },
    { label: "Counterfactual", color: cfColors, shape: "stadium" }
  ];
  svg += renderLegend(20, actualHeight - 110, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function counterfactualToGraphML(thought, options) {
  const { includeLabels = true, includeMetrics = true } = options;
  const nodes = [];
  nodes.push({
    id: "intervention",
    label: includeLabels ? thought.interventionPoint.description : "intervention",
    type: "intervention",
    metadata: {
      timing: thought.interventionPoint.timing,
      feasibility: thought.interventionPoint.feasibility
    }
  });
  nodes.push({
    id: thought.actual.id,
    label: includeLabels ? `Actual: ${thought.actual.name}` : thought.actual.id,
    type: "actual",
    metadata: {
      description: thought.actual.description
    }
  });
  for (const scenario of thought.counterfactuals) {
    nodes.push({
      id: scenario.id,
      label: includeLabels ? `CF: ${scenario.name}` : scenario.id,
      type: "counterfactual",
      metadata: {
        description: scenario.description,
        likelihood: scenario.likelihood
      }
    });
  }
  const edges = [];
  edges.push({
    id: "e_intervention_actual",
    source: "intervention",
    target: thought.actual.id,
    label: "no change"
  });
  for (let i = 0; i < thought.counterfactuals.length; i++) {
    const scenario = thought.counterfactuals[i];
    edges.push({
      id: `e_intervention_cf${i}`,
      source: "intervention",
      target: scenario.id,
      label: "intervene",
      metadata: includeMetrics && scenario.likelihood !== void 0 ? { weight: scenario.likelihood } : void 0
    });
  }
  const graphmlOptions = {
    graphName: "Counterfactual Scenarios"
  };
  return generateGraphML(nodes, edges, graphmlOptions);
}
function counterfactualToTikZ(thought, options) {
  const { includeLabels = true, includeMetrics = true } = options;
  const nodes = [];
  nodes.push({
    id: "intervention",
    label: includeLabels ? thought.interventionPoint.description : "intervention",
    x: 4,
    y: 0,
    type: "intervention",
    shape: "diamond"
  });
  nodes.push({
    id: thought.actual.id,
    label: includeLabels ? `Actual: ${thought.actual.name}` : thought.actual.id,
    x: 2,
    y: -2,
    type: "actual",
    shape: "rectangle"
  });
  const cfCount = thought.counterfactuals.length;
  const cfSpacing = 1.5;
  const cfStartY = -2;
  thought.counterfactuals.forEach((scenario, index) => {
    const yOffset = (cfCount - 1) * cfSpacing / 2;
    nodes.push({
      id: scenario.id,
      label: includeLabels ? `CF: ${scenario.name}` : scenario.id,
      x: 6,
      y: cfStartY - index * cfSpacing + yOffset,
      type: "counterfactual",
      shape: "ellipse"
    });
  });
  const edges = [];
  edges.push({
    source: "intervention",
    target: thought.actual.id,
    label: "no change",
    directed: true
  });
  for (const scenario of thought.counterfactuals) {
    edges.push({
      source: "intervention",
      target: scenario.id,
      label: includeMetrics && scenario.likelihood !== void 0 ? scenario.likelihood.toFixed(2) : "intervene",
      directed: true
    });
  }
  const tikzOptions = {
    title: "Counterfactual Scenarios"
  };
  return generateTikZ(nodes, edges, tikzOptions);
}
var init_counterfactual = __esm({
  "src/export/visual/counterfactual.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return analogicalToSVG(thought, options);
    case "graphml":
      return analogicalToGraphML(thought, options);
    case "tikz":
      return analogicalToTikZ(thought, options);
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
function analogicalToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width
  } = options;
  const positions = /* @__PURE__ */ new Map();
  const sourceY = 100;
  const entitySpacing = 100;
  const nodeWidth = 150;
  const nodeHeight = 40;
  thought.sourceDomain.entities.forEach((entity, index) => {
    const srcId = "src_" + entity.id;
    positions.set(srcId, {
      id: srcId,
      label: includeLabels ? entity.name : srcId,
      x: 150,
      y: sourceY + index * entitySpacing,
      width: nodeWidth,
      height: nodeHeight,
      type: "source"
    });
  });
  const targetY = 100;
  thought.targetDomain.entities.forEach((entity, index) => {
    const tgtId = "tgt_" + entity.id;
    positions.set(tgtId, {
      id: tgtId,
      label: includeLabels ? entity.name : tgtId,
      x: svgWidth - 150,
      y: targetY + index * entitySpacing,
      width: nodeWidth,
      height: nodeHeight,
      type: "target"
    });
  });
  const actualHeight = Math.max(
    DEFAULT_SVG_OPTIONS.height,
    Math.max(thought.sourceDomain.entities.length, thought.targetDomain.entities.length) * entitySpacing + 150
  );
  let svg = generateSVGHeader(svgWidth, actualHeight, "Analogical Domain Mapping");
  svg += '\n  <!-- Mappings -->\n  <g class="edges">';
  for (const mapping of thought.mapping) {
    const srcPos = positions.get("src_" + mapping.sourceEntityId);
    const tgtPos = positions.get("tgt_" + mapping.targetEntityId);
    if (srcPos && tgtPos) {
      const label = includeMetrics ? mapping.confidence.toFixed(2) : void 0;
      svg += renderEdge(srcPos, tgtPos, { label, style: "dashed" });
    }
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  const sourceColors = getNodeColor("tertiary", colorScheme);
  const targetColors = getNodeColor("primary", colorScheme);
  for (const [, pos] of positions) {
    if (pos.type === "source") {
      svg += renderRectNode(pos, sourceColors);
    } else {
      svg += renderRectNode(pos, targetColors);
    }
  }
  svg += "\n  </g>";
  if (includeMetrics) {
    const metrics = [
      { label: "Analogy Strength", value: thought.analogyStrength.toFixed(2) },
      { label: "Mappings", value: thought.mapping.length },
      { label: "Source Entities", value: thought.sourceDomain.entities.length },
      { label: "Target Entities", value: thought.targetDomain.entities.length }
    ];
    svg += renderMetricsPanel(svgWidth - 180, actualHeight - 140, metrics);
  }
  const legendItems = [
    { label: "Source Domain", color: sourceColors },
    { label: "Target Domain", color: targetColors }
  ];
  svg += renderLegend(20, actualHeight - 80, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function analogicalToGraphML(thought, options) {
  const { includeMetrics = true } = options;
  const nodes = [];
  for (const entity of thought.sourceDomain.entities) {
    nodes.push({
      id: "src_" + entity.id,
      label: entity.name,
      type: "source",
      metadata: {
        description: entity.description,
        domain: thought.sourceDomain.name
      }
    });
  }
  for (const entity of thought.targetDomain.entities) {
    nodes.push({
      id: "tgt_" + entity.id,
      label: entity.name,
      type: "target",
      metadata: {
        description: entity.description,
        domain: thought.targetDomain.name
      }
    });
  }
  const edges = thought.mapping.map((mapping, index) => {
    const edge = {
      id: `mapping_${index}`,
      source: "src_" + mapping.sourceEntityId,
      target: "tgt_" + mapping.targetEntityId
    };
    if (includeMetrics) {
      edge.metadata = {
        weight: mapping.confidence,
        type: "mapping"
      };
      edge.label = mapping.confidence.toFixed(2);
    }
    return edge;
  });
  const graphmlOptions = {
    graphName: "Analogical Mapping"
  };
  return generateGraphML(nodes, edges, graphmlOptions);
}
function analogicalToTikZ(thought, options) {
  const { includeLabels = true, includeMetrics = true, colorScheme = "default" } = options;
  const nodes = [];
  thought.sourceDomain.entities.forEach((entity, index) => {
    nodes.push({
      id: "src_" + entity.id,
      x: -3,
      y: -index * 1.5,
      label: includeLabels ? entity.name : entity.id,
      shape: "rectangle",
      type: "tertiary"
    });
  });
  thought.targetDomain.entities.forEach((entity, index) => {
    nodes.push({
      id: "tgt_" + entity.id,
      x: 3,
      y: -index * 1.5,
      label: includeLabels ? entity.name : entity.id,
      shape: "rectangle",
      type: "primary"
    });
  });
  const edges = thought.mapping.map((mapping) => {
    const edge = {
      source: "src_" + mapping.sourceEntityId,
      target: "tgt_" + mapping.targetEntityId,
      style: "dashed"
    };
    if (includeMetrics) {
      edge.label = mapping.confidence.toFixed(2);
    }
    return edge;
  });
  const tikzOptions = {
    title: "Analogical Mapping",
    colorScheme,
    includeLabels,
    includeMetrics
  };
  let tikz = generateTikZ(nodes, edges, tikzOptions);
  if (includeMetrics) {
    const metrics = [
      { label: "Analogy Strength", value: thought.analogyStrength.toFixed(2) },
      { label: "Mappings", value: thought.mapping.length.toString() },
      { label: "Source Entities", value: thought.sourceDomain.entities.length.toString() },
      { label: "Target Entities", value: thought.targetDomain.entities.length.toString() }
    ];
    tikz = tikz.replace(
      /\\end\{tikzpicture\}/,
      renderTikZMetrics(6, -6, metrics) + "\n\\end{tikzpicture}"
    );
  }
  const sourceColors = getTikZColor("tertiary", colorScheme);
  const targetColors = getTikZColor("primary", colorScheme);
  const legendItems = [
    { label: "Source Domain", color: sourceColors },
    { label: "Target Domain", color: targetColors }
  ];
  tikz = tikz.replace(
    /\\end\{tikzpicture\}/,
    renderTikZLegend(-3, -6, legendItems) + "\n\\end{tikzpicture}"
  );
  return tikz;
}
var init_analogical = __esm({
  "src/export/visual/analogical.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return evidentialToSVG(thought, options);
    case "graphml":
      return evidentialToGraphML(thought, options);
    case "tikz":
      return evidentialToTikZ(thought, options);
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
function evidentialToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width
  } = options;
  if (!thought.frameOfDiscernment || thought.frameOfDiscernment.length === 0) {
    return generateSVGHeader(svgWidth, 200, "Evidential Beliefs") + '\n  <text x="400" y="100" text-anchor="middle" class="subtitle">No frame of discernment defined</text>\n' + generateSVGFooter();
  }
  const positions = /* @__PURE__ */ new Map();
  const nodeWidth = 150;
  const nodeHeight = 40;
  positions.set("frame", {
    id: "frame",
    label: "Frame of Discernment",
    x: svgWidth / 2,
    y: 80,
    width: nodeWidth,
    height: nodeHeight,
    type: "frame"
  });
  const hypSpacing = Math.min(200, svgWidth / (thought.frameOfDiscernment.length + 1));
  const hypStartX = (svgWidth - (thought.frameOfDiscernment.length - 1) * hypSpacing) / 2;
  thought.frameOfDiscernment.forEach((hypothesis, index) => {
    const hypId = sanitizeId(hypothesis);
    positions.set(hypId, {
      id: hypId,
      label: includeLabels ? hypothesis : hypId,
      x: hypStartX + index * hypSpacing,
      y: 200,
      width: nodeWidth,
      height: nodeHeight,
      type: "hypothesis"
    });
  });
  const actualHeight = 400;
  let svg = generateSVGHeader(svgWidth, actualHeight, "Evidential Beliefs");
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  const framePos = positions.get("frame");
  for (const hypothesis of thought.frameOfDiscernment) {
    const hypPos = positions.get(sanitizeId(hypothesis));
    if (hypPos) {
      svg += renderEdge(framePos, hypPos);
    }
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  const frameColors = getNodeColor("warning", colorScheme);
  const hypColors = getNodeColor("primary", colorScheme);
  svg += renderEllipseNode(framePos, frameColors);
  for (const [id, pos] of positions) {
    if (id !== "frame") {
      svg += renderRectNode(pos, hypColors);
    }
  }
  svg += "\n  </g>";
  if (includeMetrics) {
    const metrics = [
      { label: "Hypotheses", value: thought.frameOfDiscernment.length },
      { label: "Belief Functions", value: thought.beliefFunctions?.length || 0 }
    ];
    svg += renderMetricsPanel(svgWidth - 180, actualHeight - 110, metrics);
  }
  const legendItems = [
    { label: "Frame", color: frameColors, shape: "ellipse" },
    { label: "Hypothesis", color: hypColors }
  ];
  svg += renderLegend(20, actualHeight - 80, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function evidentialToGraphML(thought, options) {
  const { includeLabels = true, includeMetrics = true } = options;
  const nodes = [];
  const edges = [];
  let edgeId = 0;
  if (thought.evidence && thought.evidence.length > 0) {
    for (const evidence of thought.evidence) {
      nodes.push({
        id: evidence.id,
        label: includeLabels ? evidence.description : evidence.id,
        type: "evidence",
        metadata: {
          source: evidence.source,
          reliability: evidence.reliability,
          description: evidence.description
        }
      });
    }
  }
  if (thought.beliefFunctions && thought.beliefFunctions.length > 0) {
    for (const belief of thought.beliefFunctions) {
      const label = includeLabels ? `Belief: ${belief.source}` : belief.id;
      nodes.push({
        id: belief.id,
        label,
        type: "belief",
        metadata: belief.conflictMass !== void 0 ? { conflictMass: belief.conflictMass } : void 0
      });
      if (thought.evidence && thought.evidence.length > 0) {
        const sourceEvidence = thought.evidence.find((e) => e.id === belief.source);
        if (sourceEvidence) {
          edges.push({
            id: `e${edgeId++}`,
            source: sourceEvidence.id,
            target: belief.id,
            label: includeMetrics ? `strength: ${sourceEvidence.reliability.toFixed(3)}` : void 0,
            metadata: includeMetrics ? { weight: sourceEvidence.reliability } : void 0
          });
        }
      }
    }
  }
  if (nodes.length === 0 && thought.frameOfDiscernment && thought.frameOfDiscernment.length > 0) {
    nodes.push({
      id: "frame",
      label: "Frame of Discernment",
      type: "frame"
    });
    for (const hypothesis of thought.frameOfDiscernment) {
      const hypId = sanitizeId(hypothesis);
      nodes.push({
        id: hypId,
        label: includeLabels ? hypothesis : hypId,
        type: "hypothesis"
      });
      edges.push({
        id: `e${edgeId++}`,
        source: "frame",
        target: hypId
      });
    }
  }
  return generateGraphML(nodes, edges, {
    graphName: "Evidential Beliefs",
    includeLabels,
    includeMetadata: includeMetrics
  });
}
function evidentialToTikZ(thought, options) {
  const { includeLabels = true, includeMetrics = true, colorScheme = "default" } = options;
  const nodes = [];
  const edges = [];
  if (thought.evidence && thought.evidence.length > 0) {
    const evidenceCount = thought.evidence.length;
    const evidenceSpacing = Math.min(3, 8 / evidenceCount);
    const startX = (8 - (evidenceCount - 1) * evidenceSpacing) / 2;
    for (let i = 0; i < thought.evidence.length; i++) {
      const evidence = thought.evidence[i];
      const label = includeLabels ? `${evidence.description.substring(0, 20)}${evidence.description.length > 20 ? "..." : ""}` : evidence.id;
      nodes.push({
        id: evidence.id,
        label,
        x: startX + i * evidenceSpacing,
        y: 0,
        type: "evidence",
        shape: "rectangle"
      });
    }
  }
  if (thought.beliefFunctions && thought.beliefFunctions.length > 0) {
    const beliefCount = thought.beliefFunctions.length;
    const beliefSpacing = Math.min(3, 8 / beliefCount);
    const startX = (8 - (beliefCount - 1) * beliefSpacing) / 2;
    for (let i = 0; i < thought.beliefFunctions.length; i++) {
      const belief = thought.beliefFunctions[i];
      const label = includeLabels ? `Belief: ${belief.source}` : belief.id;
      nodes.push({
        id: belief.id,
        label,
        x: startX + i * beliefSpacing,
        y: -3,
        type: "primary",
        shape: "ellipse"
      });
      if (thought.evidence && thought.evidence.length > 0) {
        const sourceEvidence = thought.evidence.find((e) => e.id === belief.source);
        if (sourceEvidence) {
          edges.push({
            source: sourceEvidence.id,
            target: belief.id,
            label: includeMetrics ? sourceEvidence.reliability.toFixed(3) : void 0,
            directed: true
          });
        }
      }
    }
  }
  if (nodes.length === 0 && thought.frameOfDiscernment && thought.frameOfDiscernment.length > 0) {
    nodes.push({
      id: "frame",
      label: "Frame of Discernment",
      x: 4,
      y: 0,
      type: "warning",
      shape: "ellipse"
    });
    const hypCount = thought.frameOfDiscernment.length;
    const hypSpacing = Math.min(2.5, 8 / hypCount);
    const startX = (8 - (hypCount - 1) * hypSpacing) / 2;
    for (let i = 0; i < thought.frameOfDiscernment.length; i++) {
      const hypothesis = thought.frameOfDiscernment[i];
      const hypId = sanitizeId(hypothesis);
      nodes.push({
        id: hypId,
        label: includeLabels ? hypothesis : hypId,
        x: startX + i * hypSpacing,
        y: -2.5,
        type: "info",
        shape: "rectangle"
      });
      edges.push({
        source: "frame",
        target: hypId,
        directed: true
      });
    }
  }
  return generateTikZ(nodes, edges, {
    title: "Evidential Beliefs",
    includeLabels,
    includeMetrics,
    colorScheme
  });
}
var init_evidential = __esm({
  "src/export/visual/evidential.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return firstPrinciplesToSVG(thought, options);
    case "graphml":
      return firstPrinciplesToGraphML(thought, options);
    case "tikz":
      return firstPrinciplesToTikZ(thought, options);
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
function firstPrinciplesToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width
  } = options;
  const positions = /* @__PURE__ */ new Map();
  const nodeWidth = 150;
  const nodeHeight = 40;
  const principleY = 100;
  const principleSpacing = Math.min(180, svgWidth / (thought.principles.length + 1));
  const principleStartX = (svgWidth - (thought.principles.length - 1) * principleSpacing) / 2;
  thought.principles.forEach((p, index) => {
    positions.set(p.id, {
      id: p.id,
      label: includeLabels ? `${p.type}: ${p.statement.substring(0, 30)}...` : p.id,
      x: principleStartX + index * principleSpacing,
      y: principleY,
      width: nodeWidth,
      height: nodeHeight,
      type: p.type
    });
  });
  const stepY = 250;
  thought.derivationSteps.forEach((step, index) => {
    const stepId = `Step${step.stepNumber}`;
    positions.set(stepId, {
      id: stepId,
      label: includeLabels ? `Step ${step.stepNumber}` : stepId,
      x: 150 + index * 200,
      y: stepY,
      width: nodeWidth,
      height: nodeHeight,
      type: "step"
    });
  });
  positions.set("conclusion", {
    id: "conclusion",
    label: includeLabels ? `Conclusion: ${thought.conclusion.statement.substring(0, 30)}...` : "Conclusion",
    x: svgWidth / 2,
    y: stepY + 150,
    width: nodeWidth,
    height: nodeHeight,
    type: "conclusion"
  });
  const actualHeight = calculateSVGHeight(positions);
  let svg = generateSVGHeader(svgWidth, actualHeight, "First Principles Derivation");
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  for (const step of thought.derivationSteps) {
    const principlePos = positions.get(step.principle);
    const stepPos = positions.get(`Step${step.stepNumber}`);
    if (principlePos && stepPos) {
      svg += renderEdge(principlePos, stepPos, { style: "dashed", label: "applies" });
    }
  }
  const conclusionPos = positions.get("conclusion");
  for (const stepNum of thought.conclusion.derivationChain) {
    const stepPos = positions.get(`Step${stepNum}`);
    if (stepPos) {
      svg += renderEdge(stepPos, conclusionPos);
    }
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  const axiomColors = getNodeColor("primary", colorScheme);
  const stepColors = getNodeColor("neutral", colorScheme);
  const conclusionColors = getNodeColor("success", colorScheme);
  for (const [id, pos] of positions) {
    if (id === "conclusion") {
      svg += renderStadiumNode(pos, conclusionColors);
    } else if (id.startsWith("Step")) {
      svg += renderRectNode(pos, stepColors);
    } else {
      svg += renderEllipseNode(pos, axiomColors);
    }
  }
  svg += "\n  </g>";
  if (includeMetrics) {
    const metrics = [
      { label: "Principles", value: thought.principles.length },
      { label: "Steps", value: thought.derivationSteps.length },
      { label: "Certainty", value: thought.conclusion.certainty.toFixed(2) }
    ];
    svg += renderMetricsPanel(svgWidth - 180, actualHeight - 110, metrics);
  }
  const legendItems = [
    { label: "Principle", color: axiomColors, shape: "ellipse" },
    { label: "Derivation Step", color: stepColors },
    { label: "Conclusion", color: conclusionColors, shape: "stadium" }
  ];
  svg += renderLegend(20, actualHeight - 100, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function firstPrinciplesToGraphML(thought, options) {
  const { includeLabels = true } = options;
  const nodes = [];
  const edges = [];
  let edgeCount = 0;
  nodes.push({
    id: "question",
    label: includeLabels ? `Question: ${thought.question}` : "Question",
    type: "question"
  });
  for (const principle of thought.principles) {
    const principleId = sanitizeId(principle.id);
    nodes.push({
      id: principleId,
      label: includeLabels ? `${principle.type.toUpperCase()}: ${principle.statement.substring(0, 60)}...` : principleId,
      type: principle.type,
      metadata: {
        justification: principle.justification,
        confidence: principle.confidence
      }
    });
    if (principle.dependsOn) {
      for (const depId of principle.dependsOn) {
        const sanitizedDepId = sanitizeId(depId);
        edges.push({
          id: `e${edgeCount++}`,
          source: sanitizedDepId,
          target: principleId,
          label: "depends on",
          directed: true
        });
      }
    }
  }
  for (const step of thought.derivationSteps) {
    const stepId = `Step${step.stepNumber}`;
    nodes.push({
      id: stepId,
      label: includeLabels ? `Step ${step.stepNumber}: ${step.inference.substring(0, 60)}...` : stepId,
      type: "derivation_step",
      metadata: {
        logicalForm: step.logicalForm,
        confidence: step.confidence
      }
    });
    const principleId = sanitizeId(step.principle);
    edges.push({
      id: `e${edgeCount++}`,
      source: principleId,
      target: stepId,
      label: "applies",
      directed: true
    });
  }
  nodes.push({
    id: "conclusion",
    label: includeLabels ? `Conclusion: ${thought.conclusion.statement.substring(0, 60)}...` : "Conclusion",
    type: "conclusion",
    metadata: {
      certainty: thought.conclusion.certainty,
      limitations: thought.conclusion.limitations
    }
  });
  for (const stepNum of thought.conclusion.derivationChain) {
    edges.push({
      id: `e${edgeCount++}`,
      source: `Step${stepNum}`,
      target: "conclusion",
      directed: true
    });
  }
  return generateGraphML(nodes, edges, {
    graphName: "First Principles Derivation",
    directed: true,
    includeLabels
  });
}
function firstPrinciplesToTikZ(thought, options) {
  const { includeLabels = true, colorScheme = "default" } = options;
  const nodes = [];
  const edges = [];
  const principleCount = thought.principles.length;
  thought.principles.forEach((principle, index) => {
    const principleId = sanitizeId(principle.id);
    nodes.push({
      id: principleId,
      label: includeLabels ? `${principle.type}: ${principle.statement.substring(0, 25)}...` : principleId,
      x: index * 3,
      y: 0,
      type: principle.type === "axiom" ? "primary" : "secondary",
      shape: "stadium"
    });
    if (principle.dependsOn) {
      for (const depId of principle.dependsOn) {
        const sanitizedDepId = sanitizeId(depId);
        edges.push({
          source: sanitizedDepId,
          target: principleId,
          directed: true,
          style: "dashed"
        });
      }
    }
  });
  const stepY = -2;
  thought.derivationSteps.forEach((step, index) => {
    const stepId = `Step${step.stepNumber}`;
    const principleId = sanitizeId(step.principle);
    nodes.push({
      id: stepId,
      label: includeLabels ? `Step ${step.stepNumber}` : stepId,
      x: index * 3,
      y: stepY,
      type: "neutral",
      shape: "rectangle"
    });
    edges.push({
      source: principleId,
      target: stepId,
      label: "applies",
      directed: true,
      style: "dashed"
    });
  });
  const conclusionX = (principleCount - 1) * 3 / 2;
  nodes.push({
    id: "conclusion",
    label: includeLabels ? "Conclusion" : "C",
    x: conclusionX,
    y: -4,
    type: "success",
    shape: "stadium"
  });
  for (const stepNum of thought.conclusion.derivationChain) {
    edges.push({
      source: `Step${stepNum}`,
      target: "conclusion",
      directed: true
    });
  }
  return generateTikZ(nodes, edges, {
    title: "First Principles Derivation",
    colorScheme,
    includeLabels
  });
}
var init_first_principles = __esm({
  "src/export/visual/first-principles.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return systemsThinkingToSVG(thought, options);
    case "graphml":
      return systemsThinkingToGraphML(thought, options);
    case "tikz":
      return systemsThinkingToTikZ(thought, options);
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
function systemsThinkingToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = DEFAULT_SVG_OPTIONS.height
  } = options;
  if (!thought.components || thought.components.length === 0) {
    return generateSVGHeader(svgWidth, 200, "Systems Thinking") + '\n  <text x="400" y="100" text-anchor="middle" class="subtitle">No system components defined</text>\n' + generateSVGFooter();
  }
  const positions = /* @__PURE__ */ new Map();
  const nodeWidth = 150;
  const nodeHeight = 40;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  const radius = Math.min(centerX, centerY) - 100;
  thought.components.forEach((component, index) => {
    const angle = 2 * Math.PI * index / (thought.components?.length || 1);
    const x = centerX + radius * Math.cos(angle - Math.PI / 2);
    const y = centerY + radius * Math.sin(angle - Math.PI / 2);
    positions.set(component.id, {
      id: component.id,
      label: includeLabels ? component.name : component.id,
      x,
      y,
      width: nodeWidth,
      height: nodeHeight,
      type: component.type
    });
  });
  let svg = generateSVGHeader(svgWidth, svgHeight, "Systems Thinking Model");
  svg += '\n  <!-- Feedback Loops -->\n  <g class="edges">';
  if (thought.feedbackLoops) {
    for (const loop of thought.feedbackLoops) {
      for (let i = 0; i < loop.components.length; i++) {
        const fromId = loop.components[i];
        const toId = loop.components[(i + 1) % loop.components.length];
        const fromPos = positions.get(fromId);
        const toPos = positions.get(toId);
        if (fromPos && toPos) {
          const label = includeMetrics ? `${loop.type[0].toUpperCase()} (${loop.strength.toFixed(1)})` : void 0;
          const style = loop.type === "reinforcing" ? "solid" : "dashed";
          svg += renderEdge(fromPos, toPos, { label, style });
        }
      }
    }
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Components -->\n  <g class="nodes">';
  const stockColors = getNodeColor("primary", colorScheme);
  const flowColors = getNodeColor("secondary", colorScheme);
  for (const [, pos] of positions) {
    if (pos.type === "stock") {
      svg += renderRectNode(pos, stockColors);
    } else {
      svg += renderEllipseNode(pos, flowColors);
    }
  }
  svg += "\n  </g>";
  if (includeMetrics) {
    const metrics = [
      { label: "Components", value: thought.components.length },
      { label: "Feedback Loops", value: thought.feedbackLoops?.length || 0 },
      { label: "Leverage Points", value: thought.leveragePoints?.length || 0 }
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 110, metrics);
  }
  const legendItems = [
    { label: "Stock", color: stockColors },
    { label: "Flow", color: flowColors, shape: "ellipse" }
  ];
  svg += renderLegend(20, svgHeight - 80, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function systemsThinkingToGraphML(thought, options) {
  const { includeLabels = true, includeMetrics = true } = options;
  const nodes = [];
  const edges = [];
  if (thought.components && thought.components.length > 0) {
    for (const component of thought.components) {
      nodes.push({
        id: sanitizeId(component.id),
        label: component.name,
        type: component.type,
        metadata: {
          description: component.description,
          unit: component.unit,
          initialValue: component.initialValue
        }
      });
    }
  }
  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    let edgeCount = 0;
    for (const loop of thought.feedbackLoops) {
      const loopComponents = loop.components;
      for (let i = 0; i < loopComponents.length; i++) {
        const fromId = sanitizeId(loopComponents[i]);
        const toId = sanitizeId(loopComponents[(i + 1) % loopComponents.length]);
        const label = includeLabels && includeMetrics ? `${loop.type} (${loop.strength.toFixed(2)})` : includeLabels ? loop.type : void 0;
        edges.push({
          id: `e${edgeCount++}`,
          source: fromId,
          target: toId,
          label,
          directed: true,
          metadata: {
            type: loop.type,
            weight: loop.strength,
            polarity: loop.polarity,
            loopName: loop.name
          }
        });
      }
    }
  }
  return generateGraphML(nodes, edges, {
    graphName: "Systems Thinking Causal Loops",
    directed: true,
    includeLabels,
    includeMetadata: includeMetrics
  });
}
function systemsThinkingToTikZ(thought, options) {
  const { colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  const nodes = [];
  const edges = [];
  if (thought.components && thought.components.length > 0) {
    const numComponents = thought.components.length;
    const radius = 4;
    thought.components.forEach((component, index) => {
      const angle = 2 * Math.PI * index / numComponents;
      const x = 4 + radius * Math.cos(angle - Math.PI / 2);
      const y = -2 + radius * Math.sin(angle - Math.PI / 2);
      nodes.push({
        id: sanitizeId(component.id),
        label: component.name,
        x,
        y,
        type: component.type === "stock" ? "primary" : "secondary",
        shape: component.type === "stock" ? "rectangle" : "ellipse"
      });
    });
  }
  if (thought.feedbackLoops && thought.feedbackLoops.length > 0) {
    for (const loop of thought.feedbackLoops) {
      const loopComponents = loop.components;
      for (let i = 0; i < loopComponents.length; i++) {
        const fromId = sanitizeId(loopComponents[i]);
        const toId = sanitizeId(loopComponents[(i + 1) % loopComponents.length]);
        const label = includeLabels && includeMetrics ? `${loop.type[0].toUpperCase()} (${loop.strength.toFixed(2)})` : includeLabels ? loop.type[0].toUpperCase() : void 0;
        const style = loop.type === "reinforcing" ? "solid" : "dashed";
        const bend = loop.type === "reinforcing" ? "left" : "right";
        edges.push({
          source: fromId,
          target: toId,
          label,
          style,
          directed: true,
          bend
        });
      }
    }
  }
  return generateTikZ(nodes, edges, {
    title: "Systems Thinking Causal Loops",
    colorScheme,
    includeLabels,
    includeMetrics
  });
}
var init_systems_thinking = __esm({
  "src/export/visual/systems-thinking.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return scientificMethodToSVG(thought, options);
    case "graphml":
      return scientificMethodToGraphML(thought, options);
    case "tikz":
      return scientificMethodToTikZ(thought, options);
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
function scientificMethodToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width
  } = options;
  const positions = /* @__PURE__ */ new Map();
  const nodeWidth = 150;
  const nodeHeight = 40;
  const nodeSpacing = 120;
  let currentY = 80;
  if (thought.researchQuestion) {
    positions.set("RQ", {
      id: "RQ",
      label: includeLabels ? `RQ: ${thought.researchQuestion.question.substring(0, 40)}...` : "Research Question",
      x: svgWidth / 2,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: "question"
    });
    currentY += nodeSpacing;
  }
  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    thought.scientificHypotheses.forEach((hypothesis) => {
      positions.set(hypothesis.id, {
        id: hypothesis.id,
        label: includeLabels ? `H: ${hypothesis.statement.substring(0, 30)}...` : hypothesis.id,
        x: svgWidth / 2,
        y: currentY,
        width: nodeWidth,
        height: nodeHeight,
        type: "hypothesis"
      });
      currentY += nodeSpacing;
    });
  }
  if (thought.experiment) {
    positions.set("Exp", {
      id: "Exp",
      label: "Experiment",
      x: svgWidth / 2,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: "experiment"
    });
    currentY += nodeSpacing;
  }
  if (thought.data) {
    positions.set("Data", {
      id: "Data",
      label: "Data Collection",
      x: svgWidth / 2,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: "data"
    });
    currentY += nodeSpacing;
  }
  if (thought.analysis) {
    positions.set("Stats", {
      id: "Stats",
      label: "Statistical Analysis",
      x: svgWidth / 2,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: "analysis"
    });
    currentY += nodeSpacing;
  }
  if (thought.conclusion) {
    positions.set("Conclusion", {
      id: "Conclusion",
      label: includeLabels ? `Conclusion: ${thought.conclusion.statement.substring(0, 30)}...` : "Conclusion",
      x: svgWidth / 2,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: "conclusion"
    });
  }
  const actualHeight = Math.max(DEFAULT_SVG_OPTIONS.height, currentY + 100);
  let svg = generateSVGHeader(svgWidth, actualHeight, "Scientific Method Process");
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  const nodeIds = ["RQ", ...thought.scientificHypotheses?.map((h) => h.id) || [], "Exp", "Data", "Stats", "Conclusion"];
  for (let i = 0; i < nodeIds.length - 1; i++) {
    const fromPos = positions.get(nodeIds[i]);
    const toPos = positions.get(nodeIds[i + 1]);
    if (fromPos && toPos) {
      svg += renderEdge(fromPos, toPos);
    }
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  const questionColors = getNodeColor("tertiary", colorScheme);
  const hypothesisColors = getNodeColor("primary", colorScheme);
  const conclusionColors = getNodeColor("success", colorScheme);
  const neutralColors = getNodeColor("neutral", colorScheme);
  for (const [, pos] of positions) {
    if (pos.type === "question") {
      svg += renderEllipseNode(pos, questionColors);
    } else if (pos.type === "hypothesis") {
      svg += renderRectNode(pos, hypothesisColors);
    } else if (pos.type === "conclusion") {
      svg += renderStadiumNode(pos, conclusionColors);
    } else {
      svg += renderRectNode(pos, neutralColors);
    }
  }
  svg += "\n  </g>";
  if (includeMetrics) {
    const metrics = [
      { label: "Hypotheses", value: thought.scientificHypotheses?.length || 0 },
      { label: "Confidence", value: thought.conclusion?.confidence?.toFixed(2) || "N/A" }
    ];
    svg += renderMetricsPanel(svgWidth - 180, actualHeight - 110, metrics);
  }
  const legendItems = [
    { label: "Research Question", color: questionColors, shape: "ellipse" },
    { label: "Hypothesis", color: hypothesisColors },
    { label: "Conclusion", color: conclusionColors, shape: "stadium" }
  ];
  svg += renderLegend(20, actualHeight - 110, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function scientificMethodToGraphML(thought, options) {
  const { includeLabels = true } = options;
  const nodes = [];
  const edges = [];
  let edgeIndex = 0;
  const stages2 = [];
  if (thought.researchQuestion) {
    stages2.push({
      id: "RQ",
      label: includeLabels ? `Research Question: ${thought.researchQuestion.question.substring(0, 60)}...` : "Research Question",
      type: "question",
      exists: true
    });
  }
  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    const hypLabel = includeLabels ? `Hypothesis: ${thought.scientificHypotheses[0].statement.substring(0, 60)}...` : "Hypothesis";
    stages2.push({
      id: "Hypothesis",
      label: hypLabel,
      type: "hypothesis",
      exists: true
    });
  }
  if (thought.experiment) {
    stages2.push({
      id: "Experiment",
      label: includeLabels ? `Experiment: ${thought.experiment.design}` : "Experiment",
      type: "experiment",
      exists: true
    });
  }
  if (thought.data) {
    const sampleSize = thought.experiment?.sampleSize || 0;
    stages2.push({
      id: "Data",
      label: includeLabels ? `Data Collection: ${sampleSize} samples` : "Data Collection",
      type: "data",
      exists: true
    });
  }
  if (thought.analysis) {
    stages2.push({
      id: "Analysis",
      label: "Statistical Analysis",
      type: "analysis",
      exists: true
    });
  }
  if (thought.conclusion) {
    const confLabel = thought.conclusion.confidence ? ` (confidence: ${thought.conclusion.confidence.toFixed(2)})` : "";
    stages2.push({
      id: "Conclusion",
      label: includeLabels ? `Conclusion: ${thought.conclusion.statement.substring(0, 60)}...${confLabel}` : "Conclusion",
      type: "conclusion",
      exists: true
    });
  }
  for (const stage of stages2) {
    nodes.push({
      id: stage.id,
      label: stage.label,
      type: stage.type
    });
  }
  for (let i = 0; i < stages2.length - 1; i++) {
    edges.push({
      id: `e${edgeIndex++}`,
      source: stages2[i].id,
      target: stages2[i + 1].id,
      directed: true
    });
  }
  return generateGraphML(nodes, edges, {
    graphName: "Scientific Method Experiment",
    directed: true,
    includeLabels
  });
}
function scientificMethodToTikZ(thought, options) {
  const { includeLabels = true, colorScheme = "default" } = options;
  const nodes = [];
  const edges = [];
  let xPosition = 0;
  const xSpacing = 3;
  const stages2 = [];
  if (thought.researchQuestion) {
    stages2.push({
      id: "RQ",
      label: includeLabels ? "Research\nQuestion" : "RQ",
      type: "tertiary",
      shape: "ellipse"
    });
  }
  if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
    stages2.push({
      id: "Hypothesis",
      label: includeLabels ? `Hypothesis
(${thought.scientificHypotheses.length})` : "H",
      type: "info",
      shape: "rectangle"
    });
  }
  if (thought.experiment) {
    stages2.push({
      id: "Experiment",
      label: "Experiment",
      type: "neutral",
      shape: "rectangle"
    });
  }
  if (thought.data) {
    stages2.push({
      id: "Data",
      label: "Data\nCollection",
      type: "neutral",
      shape: "rectangle"
    });
  }
  if (thought.analysis) {
    stages2.push({
      id: "Analysis",
      label: "Statistical\nAnalysis",
      type: "primary",
      shape: "rectangle"
    });
  }
  if (thought.conclusion) {
    stages2.push({
      id: "Conclusion",
      label: "Conclusion",
      type: "success",
      shape: "stadium"
    });
  }
  for (const stage of stages2) {
    nodes.push({
      id: stage.id,
      label: stage.label,
      x: xPosition,
      y: 0,
      type: stage.type,
      shape: stage.shape || "rectangle"
    });
    xPosition += xSpacing;
  }
  for (let i = 0; i < stages2.length - 1; i++) {
    edges.push({
      source: stages2[i].id,
      target: stages2[i + 1].id,
      directed: true
    });
  }
  return generateTikZ(nodes, edges, {
    title: "Scientific Method Experiment",
    colorScheme,
    includeLabels
  });
}
var init_scientific_method = __esm({
  "src/export/visual/scientific-method.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return optimizationToSVG(thought, options);
    case "graphml":
      return optimizationToGraphML(thought, options);
    case "tikz":
      return optimizationToTikZ(thought, options);
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
function optimizationToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = DEFAULT_SVG_OPTIONS.height
  } = options;
  const positions = /* @__PURE__ */ new Map();
  const nodeWidth = 150;
  const nodeHeight = 40;
  if (thought.problem) {
    positions.set("Problem", {
      id: "Problem",
      label: includeLabels ? thought.problem.name : "Problem",
      x: svgWidth / 2,
      y: 80,
      width: nodeWidth,
      height: nodeHeight,
      type: "problem"
    });
  }
  if (thought.variables) {
    thought.variables.forEach((variable, index) => {
      positions.set(variable.id, {
        id: variable.id,
        label: includeLabels ? variable.name : variable.id,
        x: 150,
        y: 200 + index * 80,
        width: nodeWidth,
        height: nodeHeight,
        type: "variable"
      });
    });
  }
  if (thought.objectives) {
    thought.objectives.forEach((objective, index) => {
      positions.set(objective.id, {
        id: objective.id,
        label: includeLabels ? `${objective.type}: ${objective.name}` : objective.id,
        x: svgWidth - 150,
        y: 200 + index * 80,
        width: nodeWidth,
        height: nodeHeight,
        type: "objective"
      });
    });
  }
  if (thought.solution) {
    positions.set("Solution", {
      id: "Solution",
      label: "Solution",
      x: svgWidth / 2,
      y: svgHeight - 100,
      width: nodeWidth,
      height: nodeHeight,
      type: "solution"
    });
  }
  let svg = generateSVGHeader(svgWidth, svgHeight, "Optimization Problem");
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  if (thought.objectives && thought.solution) {
    for (const objective of thought.objectives) {
      const objPos = positions.get(objective.id);
      const solPos = positions.get("Solution");
      if (objPos && solPos) {
        svg += renderEdge(objPos, solPos);
      }
    }
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  const problemColors = getNodeColor("warning", colorScheme);
  const variableColors = getNodeColor("neutral", colorScheme);
  const objectiveColors = getNodeColor("primary", colorScheme);
  const solutionColors = getNodeColor("success", colorScheme);
  for (const [, pos] of positions) {
    if (pos.type === "problem") {
      svg += renderEllipseNode(pos, problemColors);
    } else if (pos.type === "variable") {
      svg += renderRectNode(pos, variableColors);
    } else if (pos.type === "objective") {
      svg += renderRectNode(pos, objectiveColors);
    } else if (pos.type === "solution") {
      svg += renderStadiumNode(pos, solutionColors);
    }
  }
  svg += "\n  </g>";
  if (includeMetrics) {
    const metrics = [
      { label: "Variables", value: thought.variables?.length || 0 },
      { label: "Constraints", value: thought.optimizationConstraints?.length || 0 },
      { label: "Objectives", value: thought.objectives?.length || 0 },
      { label: "Quality", value: thought.solution?.quality?.toFixed(2) || "N/A" }
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 150, metrics);
  }
  const legendItems = [
    { label: "Problem", color: problemColors, shape: "ellipse" },
    { label: "Variable", color: variableColors },
    { label: "Objective", color: objectiveColors },
    { label: "Solution", color: solutionColors, shape: "stadium" }
  ];
  svg += renderLegend(20, svgHeight - 140, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function optimizationToGraphML(thought, options) {
  const { includeLabels = true, includeMetrics = true } = options;
  const nodes = [];
  const edges = [];
  let edgeCount = 0;
  if (thought.objectives && thought.objectives.length > 0) {
    for (const objective of thought.objectives) {
      nodes.push({
        id: sanitizeId(objective.id),
        label: includeLabels ? `${objective.type}: ${objective.name}` : objective.id,
        type: "objective",
        metadata: {
          description: objective.formula,
          objectiveType: objective.type
        }
      });
    }
  }
  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    for (const constraint of thought.optimizationConstraints) {
      nodes.push({
        id: sanitizeId(constraint.id),
        label: includeLabels ? constraint.name : constraint.id,
        type: "constraint",
        metadata: {
          description: constraint.formula,
          constraintType: constraint.type
        }
      });
      if (thought.objectives) {
        for (const objective of thought.objectives) {
          edges.push({
            id: `e${edgeCount++}`,
            source: sanitizeId(constraint.id),
            target: sanitizeId(objective.id),
            label: "constrains"
          });
        }
      }
    }
  }
  if (thought.solution) {
    nodes.push({
      id: "solution",
      label: includeMetrics && thought.solution.quality ? `Solution (quality: ${thought.solution.quality.toFixed(2)})` : "Solution",
      type: "solution",
      metadata: {
        status: thought.solution.status,
        optimalValue: thought.solution.optimalValue,
        quality: thought.solution.quality
      }
    });
    if (thought.objectives) {
      for (const objective of thought.objectives) {
        edges.push({
          id: `e${edgeCount++}`,
          source: sanitizeId(objective.id),
          target: "solution",
          label: "optimizes"
        });
      }
    }
  }
  return generateGraphML(nodes, edges, {
    graphName: "Optimization Solution",
    includeLabels,
    includeMetadata: includeMetrics
  });
}
function optimizationToTikZ(thought, options) {
  const { colorScheme = "default", includeLabels = true, includeMetrics = true } = options;
  const nodes = [];
  const edges = [];
  let yOffset = 0;
  if (thought.objectives && thought.objectives.length > 0) {
    const startX = thought.objectives.length > 1 ? 0 : 4;
    const spacing = thought.objectives.length > 1 ? 8 / thought.objectives.length : 0;
    for (let i = 0; i < thought.objectives.length; i++) {
      const objective = thought.objectives[i];
      const x = thought.objectives.length === 1 ? startX : startX + i * spacing + spacing / 2;
      nodes.push({
        id: sanitizeId(objective.id),
        label: includeLabels ? `${objective.type}: ${objective.name}` : objective.id,
        x,
        y: yOffset,
        type: "primary",
        shape: "rectangle"
      });
    }
    yOffset -= 2;
  }
  if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
    const startX = thought.optimizationConstraints.length > 1 ? 0 : 4;
    const spacing = thought.optimizationConstraints.length > 1 ? 8 / thought.optimizationConstraints.length : 0;
    for (let i = 0; i < thought.optimizationConstraints.length; i++) {
      const constraint = thought.optimizationConstraints[i];
      const x = thought.optimizationConstraints.length === 1 ? startX : startX + i * spacing + spacing / 2;
      const constraintId = sanitizeId(constraint.id);
      nodes.push({
        id: constraintId,
        label: includeLabels ? constraint.name : constraint.id,
        x,
        y: yOffset,
        type: "warning",
        shape: "diamond"
      });
      if (thought.objectives) {
        for (const objective of thought.objectives) {
          edges.push({
            source: constraintId,
            target: sanitizeId(objective.id),
            directed: true
          });
        }
      }
    }
    yOffset -= 2;
  }
  if (thought.solution) {
    const solutionLabel = includeMetrics && thought.solution.quality ? `Solution (${thought.solution.quality.toFixed(2)})` : "Solution";
    nodes.push({
      id: "solution",
      label: solutionLabel,
      x: 4,
      y: yOffset,
      type: "success",
      shape: "ellipse"
    });
    if (thought.objectives) {
      for (const objective of thought.objectives) {
        edges.push({
          source: sanitizeId(objective.id),
          target: "solution",
          directed: true
        });
      }
    }
  }
  return generateTikZ(nodes, edges, {
    title: "Optimization Solution",
    colorScheme,
    includeLabels,
    includeMetrics
  });
}
var init_optimization = __esm({
  "src/export/visual/optimization.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return formalLogicToSVG(thought, options);
    case "graphml":
      return formalLogicToGraphML(thought, options);
    case "tikz":
      return formalLogicToTikZ(thought, options);
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
function formalLogicToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = DEFAULT_SVG_OPTIONS.height
  } = options;
  const positions = /* @__PURE__ */ new Map();
  const nodeWidth = 150;
  const nodeHeight = 40;
  if (thought.propositions) {
    const propSpacing = Math.min(180, svgWidth / (thought.propositions.length + 1));
    const propStartX = (svgWidth - (thought.propositions.length - 1) * propSpacing) / 2;
    thought.propositions.forEach((prop, index) => {
      positions.set(prop.id, {
        id: prop.id,
        label: includeLabels ? `${prop.symbol}: ${prop.statement.substring(0, 20)}...` : prop.symbol,
        x: propStartX + index * propSpacing,
        y: 80,
        width: nodeWidth,
        height: nodeHeight,
        type: prop.type
      });
    });
  }
  if (thought.proof && thought.proof.steps) {
    thought.proof.steps.forEach((step, index) => {
      const stepId = `Step${step.stepNumber}`;
      positions.set(stepId, {
        id: stepId,
        label: includeLabels ? `${step.stepNumber}. ${step.statement.substring(0, 25)}...` : `Step ${step.stepNumber}`,
        x: 150 + index * 180,
        y: 250,
        width: nodeWidth,
        height: nodeHeight,
        type: "step"
      });
    });
  }
  if (thought.proof) {
    positions.set("Theorem", {
      id: "Theorem",
      label: "Theorem",
      x: svgWidth / 2,
      y: 420,
      width: nodeWidth,
      height: nodeHeight,
      type: "theorem"
    });
  }
  let svg = generateSVGHeader(svgWidth, svgHeight, "Formal Logic Proof");
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  if (thought.proof && thought.proof.steps) {
    const theoremPos = positions.get("Theorem");
    for (const step of thought.proof.steps) {
      const stepPos = positions.get(`Step${step.stepNumber}`);
      if (stepPos && theoremPos) {
        svg += renderEdge(stepPos, theoremPos);
      }
      if (step.referencesSteps) {
        for (const refStepNum of step.referencesSteps) {
          const refStepPos = positions.get(`Step${refStepNum}`);
          if (refStepPos && stepPos) {
            svg += renderEdge(refStepPos, stepPos, { style: "dashed" });
          }
        }
      }
    }
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  const atomicColors = getNodeColor("primary", colorScheme);
  const compoundColors = getNodeColor("secondary", colorScheme);
  const stepColors = getNodeColor("neutral", colorScheme);
  const theoremColors = getNodeColor("success", colorScheme);
  for (const [, pos] of positions) {
    if (pos.type === "theorem") {
      svg += renderStadiumNode(pos, theoremColors);
    } else if (pos.type === "step") {
      svg += renderRectNode(pos, stepColors);
    } else if (pos.type === "atomic") {
      svg += renderEllipseNode(pos, atomicColors);
    } else {
      svg += renderRectNode(pos, compoundColors);
    }
  }
  svg += "\n  </g>";
  if (includeMetrics) {
    const metrics = [
      { label: "Propositions", value: thought.propositions?.length || 0 },
      { label: "Proof Steps", value: thought.proof?.steps?.length || 0 },
      { label: "Completeness", value: thought.proof ? `${(thought.proof.completeness * 100).toFixed(0)}%` : "N/A" }
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 110, metrics);
  }
  const legendItems = [
    { label: "Atomic", color: atomicColors, shape: "ellipse" },
    { label: "Compound", color: compoundColors },
    { label: "Proof Step", color: stepColors },
    { label: "Theorem", color: theoremColors, shape: "stadium" }
  ];
  svg += renderLegend(20, svgHeight - 130, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function formalLogicToGraphML(thought, options) {
  const { includeLabels = true } = options;
  const nodes = [];
  const edges = [];
  let edgeCount = 0;
  if (thought.propositions && thought.propositions.length > 0) {
    for (const proposition of thought.propositions) {
      nodes.push({
        id: sanitizeId(proposition.id),
        label: includeLabels ? `${proposition.symbol}: ${proposition.statement}` : proposition.symbol,
        type: "premise",
        metadata: {
          propositionType: proposition.type,
          description: proposition.statement
        }
      });
    }
  }
  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    for (const inference of thought.logicalInferences) {
      const infId = sanitizeId(inference.id);
      nodes.push({
        id: infId,
        label: includeLabels ? inference.rule : infId,
        type: "inference",
        metadata: {
          rule: inference.rule,
          valid: inference.valid
        }
      });
      if (inference.premises) {
        for (const premiseId of inference.premises) {
          edges.push({
            id: `e${edgeCount++}`,
            source: sanitizeId(premiseId),
            target: infId,
            directed: true,
            metadata: { type: "premise-to-inference" }
          });
        }
      }
      edges.push({
        id: `e${edgeCount++}`,
        source: infId,
        target: sanitizeId(inference.conclusion),
        directed: true,
        metadata: { type: "inference-to-conclusion" }
      });
    }
  }
  if (thought.proof && thought.proof.steps && thought.proof.steps.length > 0) {
    for (const step of thought.proof.steps) {
      const stepId = `Step${step.stepNumber}`;
      nodes.push({
        id: stepId,
        label: includeLabels ? `${step.stepNumber}. ${step.statement}` : `Step ${step.stepNumber}`,
        type: "proof-step",
        metadata: {
          stepNumber: step.stepNumber,
          justification: step.justification,
          rule: step.rule
        }
      });
      if (step.referencesSteps && step.referencesSteps.length > 0) {
        for (const refStep of step.referencesSteps) {
          edges.push({
            id: `e${edgeCount++}`,
            source: `Step${refStep}`,
            target: stepId,
            directed: true,
            metadata: { type: "step-reference" }
          });
        }
      }
    }
    nodes.push({
      id: "Theorem",
      label: includeLabels ? thought.proof.theorem : "Theorem",
      type: "conclusion",
      metadata: {
        theorem: thought.proof.theorem,
        valid: thought.proof.valid,
        completeness: thought.proof.completeness
      }
    });
    const lastStep = thought.proof.steps[thought.proof.steps.length - 1];
    edges.push({
      id: `e${edgeCount++}`,
      source: `Step${lastStep.stepNumber}`,
      target: "Theorem",
      directed: true,
      metadata: { type: "step-to-theorem" }
    });
  }
  return generateGraphML(nodes, edges, {
    graphName: "Formal Logic Proof",
    directed: true,
    includeLabels
  });
}
function formalLogicToTikZ(thought, options) {
  const { includeLabels = true, colorScheme = "default" } = options;
  const nodes = [];
  const edges = [];
  let currentY = 0;
  if (thought.propositions && thought.propositions.length > 0) {
    thought.propositions.forEach((proposition, index) => {
      nodes.push({
        id: sanitizeId(proposition.id),
        label: includeLabels ? `${proposition.symbol}: ${proposition.statement.substring(0, 30)}...` : proposition.symbol,
        x: index * 3,
        y: currentY,
        type: "premise",
        shape: "stadium"
      });
    });
    currentY -= 2.5;
  }
  if (thought.logicalInferences && thought.logicalInferences.length > 0) {
    thought.logicalInferences.forEach((inference, index) => {
      const infId = sanitizeId(inference.id);
      nodes.push({
        id: infId,
        label: includeLabels ? inference.rule : infId,
        x: index * 3,
        y: currentY,
        type: "inference",
        shape: "rectangle"
      });
      if (inference.premises) {
        for (const premiseId of inference.premises) {
          edges.push({
            source: sanitizeId(premiseId),
            target: infId,
            directed: true
          });
        }
      }
      edges.push({
        source: infId,
        target: sanitizeId(inference.conclusion),
        directed: true
      });
    });
    currentY -= 2.5;
  }
  if (thought.proof && thought.proof.steps && thought.proof.steps.length > 0) {
    thought.proof.steps.forEach((step, index) => {
      const stepId = `Step${step.stepNumber}`;
      nodes.push({
        id: stepId,
        label: includeLabels ? `${step.stepNumber}. ${step.statement.substring(0, 20)}...` : `Step ${step.stepNumber}`,
        x: index * 3,
        y: currentY,
        type: "neutral",
        shape: "rectangle"
      });
      if (step.referencesSteps && step.referencesSteps.length > 0) {
        for (const refStep of step.referencesSteps) {
          edges.push({
            source: `Step${refStep}`,
            target: stepId,
            directed: true,
            style: "dashed"
          });
        }
      }
    });
    currentY -= 2.5;
    nodes.push({
      id: "Theorem",
      label: includeLabels ? "Theorem" : "T",
      x: (thought.proof.steps.length - 1) * 1.5,
      y: currentY,
      type: "conclusion",
      shape: "ellipse"
    });
    const lastStep = thought.proof.steps[thought.proof.steps.length - 1];
    edges.push({
      source: `Step${lastStep.stepNumber}`,
      target: "Theorem",
      directed: true
    });
  }
  return generateTikZ(nodes, edges, {
    title: "Formal Logic Proof",
    colorScheme,
    includeLabels
  });
}
var init_formal_logic = __esm({
  "src/export/visual/formal-logic.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return mathematicsToSVG(thought, options);
    case "graphml":
      return mathematicsToGraphML(thought, options);
    case "tikz":
      return mathematicsToTikZ(thought, options);
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
function mathematicsToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width
  } = options;
  const positions = /* @__PURE__ */ new Map();
  const nodeWidth = 150;
  const nodeHeight = 40;
  let currentY = 80;
  const typeId = "type";
  positions.set(typeId, {
    id: typeId,
    label: includeLabels ? (thought.thoughtType || "Proof").replace(/_/g, " ") : typeId,
    x: svgWidth / 2,
    y: currentY,
    width: nodeWidth,
    height: nodeHeight,
    type: "type"
  });
  currentY += 120;
  if (thought.proofStrategy) {
    positions.set("strategy", {
      id: "strategy",
      label: thought.proofStrategy.type,
      x: svgWidth / 2,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: "strategy"
    });
    currentY += 100;
    thought.proofStrategy.steps.forEach((step, index) => {
      const stepId = `step_${index}`;
      positions.set(stepId, {
        id: stepId,
        label: includeLabels ? `${index + 1}. ${step.substring(0, 25)}...` : `Step ${index + 1}`,
        x: 150 + index % 3 * 200,
        y: currentY + Math.floor(index / 3) * 80,
        width: nodeWidth,
        height: nodeHeight,
        type: "step"
      });
    });
    currentY += Math.ceil(thought.proofStrategy.steps.length / 3) * 80 + 40;
  }
  if (thought.theorems && thought.theorems.length > 0) {
    thought.theorems.forEach((theorem, index) => {
      const theoremId = `theorem_${index}`;
      positions.set(theoremId, {
        id: theoremId,
        label: theorem.name || `Theorem ${index + 1}`,
        x: svgWidth / 2,
        y: currentY,
        width: nodeWidth,
        height: nodeHeight,
        type: "theorem"
      });
      currentY += 80;
    });
  }
  const actualHeight = Math.max(DEFAULT_SVG_OPTIONS.height, currentY + 100);
  let svg = generateSVGHeader(svgWidth, actualHeight, "Mathematics Derivation");
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  if (thought.proofStrategy) {
    const typePos = positions.get("type");
    const strategyPos = positions.get("strategy");
    if (typePos && strategyPos) {
      svg += renderEdge(typePos, strategyPos);
    }
    const stratPos = positions.get("strategy");
    thought.proofStrategy.steps.forEach((_, index) => {
      const stepPos = positions.get(`step_${index}`);
      if (stratPos && stepPos) {
        svg += renderEdge(stratPos, stepPos);
      }
    });
  }
  if (thought.theorems) {
    const typePos = positions.get("type");
    thought.theorems.forEach((_, index) => {
      const theoremPos = positions.get(`theorem_${index}`);
      if (typePos && theoremPos) {
        svg += renderEdge(typePos, theoremPos);
      }
    });
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  const typeColors = getNodeColor("primary", colorScheme);
  const strategyColors = getNodeColor("secondary", colorScheme);
  const stepColors = getNodeColor("neutral", colorScheme);
  const theoremColors = getNodeColor("tertiary", colorScheme);
  for (const [, pos] of positions) {
    if (pos.type === "type") {
      svg += renderStadiumNode(pos, typeColors);
    } else if (pos.type === "strategy") {
      svg += renderEllipseNode(pos, strategyColors);
    } else if (pos.type === "step") {
      svg += renderRectNode(pos, stepColors);
    } else if (pos.type === "theorem") {
      svg += renderRectNode(pos, theoremColors);
    }
  }
  svg += "\n  </g>";
  if (includeMetrics) {
    const metrics = [
      { label: "Uncertainty", value: `${(thought.uncertainty * 100).toFixed(1)}%` },
      { label: "Theorems", value: thought.theorems?.length || 0 },
      { label: "Assumptions", value: thought.assumptions?.length || 0 }
    ];
    svg += renderMetricsPanel(svgWidth - 180, actualHeight - 110, metrics);
  }
  const legendItems = [
    { label: "Type", color: typeColors, shape: "stadium" },
    { label: "Strategy", color: strategyColors, shape: "ellipse" },
    { label: "Step", color: stepColors },
    { label: "Theorem", color: theoremColors }
  ];
  svg += renderLegend(20, actualHeight - 130, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function mathematicsToGraphML(thought, options) {
  const { includeLabels = true } = options;
  const nodes = [];
  const edges = [];
  let edgeCount = 0;
  const typeId = sanitizeId(`type_${thought.thoughtType || "proof"}`);
  nodes.push({
    id: typeId,
    label: includeLabels ? (thought.thoughtType || "Proof").replace(/_/g, " ") : typeId,
    type: "type"
  });
  if (thought.theorems && thought.theorems.length > 0) {
    thought.theorems.forEach((theorem, index) => {
      const theoremId = sanitizeId(`theorem_${index}`);
      nodes.push({
        id: theoremId,
        label: theorem.name || `Theorem ${index + 1}`,
        type: "axiom",
        metadata: {
          description: theorem.statement
        }
      });
      edges.push({
        id: `e${edgeCount++}`,
        source: typeId,
        target: theoremId,
        directed: true
      });
    });
  }
  if (thought.proofStrategy) {
    const strategyId = sanitizeId("strategy");
    nodes.push({
      id: strategyId,
      label: thought.proofStrategy.type,
      type: "strategy"
    });
    edges.push({
      id: `e${edgeCount++}`,
      source: typeId,
      target: strategyId,
      directed: true
    });
    let prevStepId = strategyId;
    thought.proofStrategy.steps.forEach((step, index) => {
      const stepId = sanitizeId(`step_${index}`);
      nodes.push({
        id: stepId,
        label: includeLabels ? step.slice(0, 40) + (step.length > 40 ? "..." : "") : `Step ${index + 1}`,
        type: "step",
        metadata: {
          description: step
        }
      });
      edges.push({
        id: `e${edgeCount++}`,
        source: prevStepId,
        target: stepId,
        directed: true
      });
      prevStepId = stepId;
    });
  }
  if (thought.mathematicalModel) {
    const modelId = sanitizeId("model");
    nodes.push({
      id: modelId,
      label: thought.mathematicalModel.symbolic || "Mathematical Model",
      type: "model",
      metadata: {
        description: thought.mathematicalModel.latex
      }
    });
    edges.push({
      id: `e${edgeCount++}`,
      source: typeId,
      target: modelId,
      directed: true
    });
  }
  return generateGraphML(nodes, edges, {
    graphName: "Mathematics Derivation",
    directed: true,
    includeLabels
  });
}
function mathematicsToTikZ(thought, options) {
  const { includeLabels = true, colorScheme = "default" } = options;
  const nodes = [];
  const edges = [];
  let yPos = 0;
  const typeId = sanitizeId(`type_${thought.thoughtType || "proof"}`);
  nodes.push({
    id: typeId,
    label: includeLabels ? (thought.thoughtType || "Proof").replace(/_/g, " ") : typeId,
    x: 4,
    y: yPos,
    type: "primary",
    shape: "stadium"
  });
  yPos -= 2;
  if (thought.theorems && thought.theorems.length > 0) {
    thought.theorems.forEach((theorem, index) => {
      const theoremId = sanitizeId(`theorem_${index}`);
      const xPos = 1 + index * 3;
      nodes.push({
        id: theoremId,
        label: theorem.name || `Theorem ${index + 1}`,
        x: xPos,
        y: yPos,
        type: "secondary",
        shape: "stadium"
      });
      edges.push({
        source: typeId,
        target: theoremId,
        directed: true
      });
    });
    yPos -= 2;
  }
  if (thought.proofStrategy) {
    const strategyId = sanitizeId("strategy");
    nodes.push({
      id: strategyId,
      label: thought.proofStrategy.type,
      x: 4,
      y: yPos,
      type: "secondary",
      shape: "ellipse"
    });
    edges.push({
      source: typeId,
      target: strategyId,
      directed: true
    });
    yPos -= 2;
    let prevStepId = strategyId;
    thought.proofStrategy.steps.forEach((step, index) => {
      const stepId = sanitizeId(`step_${index}`);
      const xPos = 1 + index % 3 * 2.5;
      const stepYPos = yPos - Math.floor(index / 3) * 1.5;
      nodes.push({
        id: stepId,
        label: includeLabels ? `${index + 1}. ${step.substring(0, 20)}...` : `Step ${index + 1}`,
        x: xPos,
        y: stepYPos,
        type: "neutral",
        shape: "rectangle"
      });
      edges.push({
        source: prevStepId,
        target: stepId,
        directed: true
      });
      prevStepId = stepId;
    });
  }
  return generateTikZ(nodes, edges, {
    title: "Mathematics Derivation",
    colorScheme,
    includeLabels
  });
}
var init_mathematics = __esm({
  "src/export/visual/mathematics.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return physicsToSVG(thought, options);
    case "graphml":
      return physicsToGraphML(thought, options);
    case "tikz":
      return physicsToTikZ(thought, options);
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
function physicsToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = DEFAULT_SVG_OPTIONS.height
  } = options;
  const positions = /* @__PURE__ */ new Map();
  const nodeWidth = 150;
  const nodeHeight = 40;
  positions.set("type", {
    id: "type",
    label: includeLabels ? (thought.thoughtType || "Physics").replace(/_/g, " ") : "Physics",
    x: svgWidth / 2,
    y: 80,
    width: nodeWidth,
    height: nodeHeight,
    type: "type"
  });
  if (thought.tensorProperties) {
    positions.set("tensor", {
      id: "tensor",
      label: `Tensor (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`,
      x: 150,
      y: 220,
      width: nodeWidth,
      height: nodeHeight,
      type: "tensor"
    });
  }
  if (thought.physicalInterpretation) {
    positions.set("interpretation", {
      id: "interpretation",
      label: thought.physicalInterpretation.quantity,
      x: svgWidth - 150,
      y: 220,
      width: nodeWidth,
      height: nodeHeight,
      type: "interpretation"
    });
  }
  if (thought.fieldTheoryContext) {
    positions.set("field", {
      id: "field",
      label: "Field Theory",
      x: svgWidth / 2,
      y: 360,
      width: nodeWidth,
      height: nodeHeight,
      type: "field"
    });
  }
  let svg = generateSVGHeader(svgWidth, svgHeight, "Physics Analysis");
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  const typePos = positions.get("type");
  const tensorPos = positions.get("tensor");
  const interpPos = positions.get("interpretation");
  const fieldPos = positions.get("field");
  if (typePos && tensorPos) {
    svg += renderEdge(typePos, tensorPos);
  }
  if (typePos && interpPos) {
    svg += renderEdge(typePos, interpPos);
  }
  if (typePos && fieldPos) {
    svg += renderEdge(typePos, fieldPos);
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  const typeColors = getNodeColor("primary", colorScheme);
  const tensorColors = getNodeColor("secondary", colorScheme);
  const interpColors = getNodeColor("tertiary", colorScheme);
  const fieldColors = getNodeColor("neutral", colorScheme);
  for (const [, pos] of positions) {
    if (pos.type === "type") {
      svg += renderStadiumNode(pos, typeColors);
    } else if (pos.type === "tensor") {
      svg += renderEllipseNode(pos, tensorColors);
    } else if (pos.type === "interpretation") {
      svg += renderRectNode(pos, interpColors);
    } else if (pos.type === "field") {
      svg += renderRectNode(pos, fieldColors);
    }
  }
  svg += "\n  </g>";
  if (includeMetrics) {
    const metrics = [
      { label: "Uncertainty", value: `${(thought.uncertainty * 100).toFixed(1)}%` },
      { label: "Assumptions", value: thought.assumptions?.length || 0 }
    ];
    svg += renderMetricsPanel(svgWidth - 180, svgHeight - 110, metrics);
  }
  const legendItems = [
    { label: "Type", color: typeColors, shape: "stadium" },
    { label: "Tensor", color: tensorColors, shape: "ellipse" },
    { label: "Interpretation", color: interpColors },
    { label: "Field Theory", color: fieldColors }
  ];
  svg += renderLegend(20, svgHeight - 130, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function physicsToGraphML(thought, options) {
  const { includeLabels = true, includeMetrics = true } = options;
  const nodes = [];
  const edges = [];
  let edgeCount = 0;
  const typeId = "type";
  nodes.push({
    id: typeId,
    label: includeLabels ? (thought.thoughtType || "Physics").replace(/_/g, " ") : "Physics",
    type: "primary"
  });
  if (thought.tensorProperties) {
    const tensorId = "tensor";
    nodes.push({
      id: tensorId,
      label: `Tensor Rank (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`,
      type: "tensor",
      metadata: {
        description: `Components: ${thought.tensorProperties.components}`
      }
    });
    edges.push({
      id: `e${edgeCount++}`,
      source: typeId,
      target: tensorId,
      label: "has tensor"
    });
    const componentsId = "components";
    nodes.push({
      id: componentsId,
      label: "Components",
      type: "property",
      metadata: {
        description: thought.tensorProperties.components
      }
    });
    edges.push({
      id: `e${edgeCount++}`,
      source: tensorId,
      target: componentsId
    });
    if (thought.tensorProperties.symmetries.length > 0) {
      thought.tensorProperties.symmetries.forEach((sym, index) => {
        const symId = `symmetry_${index}`;
        nodes.push({
          id: symId,
          label: includeLabels ? sym : `Symmetry ${index + 1}`,
          type: "symmetry"
        });
        edges.push({
          id: `e${edgeCount++}`,
          source: tensorId,
          target: symId,
          label: "symmetry"
        });
      });
    }
    if (thought.tensorProperties.invariants.length > 0) {
      thought.tensorProperties.invariants.forEach((inv, index) => {
        const invId = `invariant_${index}`;
        nodes.push({
          id: invId,
          label: includeLabels ? inv : `Invariant ${index + 1}`,
          type: "invariant"
        });
        edges.push({
          id: `e${edgeCount++}`,
          source: tensorId,
          target: invId,
          label: "invariant"
        });
      });
    }
  }
  if (thought.physicalInterpretation) {
    const interpId = "interpretation";
    nodes.push({
      id: interpId,
      label: thought.physicalInterpretation.quantity,
      type: "interpretation",
      metadata: {
        description: `Units: ${thought.physicalInterpretation.units}`
      }
    });
    edges.push({
      id: `e${edgeCount++}`,
      source: typeId,
      target: interpId,
      label: "physical meaning"
    });
    const unitsId = "units";
    nodes.push({
      id: unitsId,
      label: thought.physicalInterpretation.units,
      type: "units"
    });
    edges.push({
      id: `e${edgeCount++}`,
      source: interpId,
      target: unitsId,
      label: "measured in"
    });
    if (thought.physicalInterpretation.conservationLaws.length > 0) {
      thought.physicalInterpretation.conservationLaws.forEach((law, index) => {
        const lawId = `conservation_${index}`;
        nodes.push({
          id: lawId,
          label: includeLabels ? law : `Law ${index + 1}`,
          type: "conservation_law"
        });
        edges.push({
          id: `e${edgeCount++}`,
          source: interpId,
          target: lawId,
          label: "conserves"
        });
      });
    }
  }
  if (thought.fieldTheoryContext) {
    const fieldId = "field_theory";
    nodes.push({
      id: fieldId,
      label: "Field Theory",
      type: "field_theory",
      metadata: {
        description: `Symmetry Group: ${thought.fieldTheoryContext.symmetryGroup}`
      }
    });
    edges.push({
      id: `e${edgeCount++}`,
      source: typeId,
      target: fieldId,
      label: "context"
    });
    thought.fieldTheoryContext.fields.forEach((field, index) => {
      const fId = `field_${index}`;
      nodes.push({
        id: fId,
        label: field,
        type: "field"
      });
      edges.push({
        id: `e${edgeCount++}`,
        source: fieldId,
        target: fId,
        label: "includes field"
      });
    });
    const symGroupId = "symmetry_group";
    nodes.push({
      id: symGroupId,
      label: thought.fieldTheoryContext.symmetryGroup,
      type: "symmetry_group"
    });
    edges.push({
      id: `e${edgeCount++}`,
      source: fieldId,
      target: symGroupId,
      label: "has symmetry"
    });
  }
  if (includeMetrics) {
    const metricsId = "metrics";
    nodes.push({
      id: metricsId,
      label: `Uncertainty: ${(thought.uncertainty * 100).toFixed(1)}%`,
      type: "metric",
      metadata: {
        description: `Assumptions: ${thought.assumptions?.length || 0}`
      }
    });
  }
  const graphmlOptions = {
    graphName: "Physics Visualization"
  };
  return generateGraphML(nodes, edges, graphmlOptions);
}
function physicsToTikZ(thought, options) {
  const { includeLabels = true, includeMetrics = true, colorScheme = "default" } = options;
  const nodes = [];
  const edges = [];
  const typeId = "type";
  nodes.push({
    id: typeId,
    x: 0,
    y: 0,
    label: includeLabels ? (thought.thoughtType || "Physics").replace(/_/g, " ") : "Physics",
    shape: "stadium",
    type: "primary"
  });
  let leftColumn = -4;
  let rightColumn = 4;
  let currentRow = -2;
  if (thought.tensorProperties) {
    const tensorId = "tensor";
    nodes.push({
      id: tensorId,
      x: leftColumn,
      y: currentRow,
      label: `Tensor (${thought.tensorProperties.rank[0]},${thought.tensorProperties.rank[1]})`,
      shape: "ellipse",
      type: "tensor"
    });
    edges.push({
      source: typeId,
      target: tensorId
    });
    const componentsId = "components";
    nodes.push({
      id: componentsId,
      x: leftColumn,
      y: currentRow - 1.5,
      label: "Components",
      shape: "rectangle",
      type: "property"
    });
    edges.push({
      source: tensorId,
      target: componentsId,
      style: "dashed"
    });
    if (thought.tensorProperties.symmetries.length > 0) {
      const symId = "symmetries";
      nodes.push({
        id: symId,
        x: leftColumn - 2,
        y: currentRow - 3,
        label: `Symmetries (${thought.tensorProperties.symmetries.length})`,
        shape: "diamond",
        type: "symmetry"
      });
      edges.push({
        source: tensorId,
        target: symId
      });
    }
    if (thought.tensorProperties.invariants.length > 0) {
      const invId = "invariants";
      nodes.push({
        id: invId,
        x: leftColumn + 2,
        y: currentRow - 3,
        label: `Invariants (${thought.tensorProperties.invariants.length})`,
        shape: "diamond",
        type: "invariant"
      });
      edges.push({
        source: tensorId,
        target: invId
      });
    }
  }
  if (thought.physicalInterpretation) {
    const interpId = "interpretation";
    nodes.push({
      id: interpId,
      x: rightColumn,
      y: currentRow,
      label: thought.physicalInterpretation.quantity,
      shape: "rounded",
      type: "interpretation"
    });
    edges.push({
      source: typeId,
      target: interpId
    });
    const unitsId = "units";
    nodes.push({
      id: unitsId,
      x: rightColumn,
      y: currentRow - 1.5,
      label: thought.physicalInterpretation.units,
      shape: "ellipse",
      type: "units"
    });
    edges.push({
      source: interpId,
      target: unitsId,
      style: "dashed"
    });
    if (thought.physicalInterpretation.conservationLaws.length > 0) {
      thought.physicalInterpretation.conservationLaws.forEach((law, index) => {
        const lawId = `conservation_${index}`;
        const offset = (index - (thought.physicalInterpretation.conservationLaws.length - 1) / 2) * 2;
        nodes.push({
          id: lawId,
          x: rightColumn + offset,
          y: currentRow - 3,
          label: includeLabels ? law.substring(0, 20) : `Law ${index + 1}`,
          shape: "rectangle",
          type: "conservation_law"
        });
        edges.push({
          source: interpId,
          target: lawId
        });
      });
    }
  }
  if (thought.fieldTheoryContext) {
    const fieldId = "field_theory";
    nodes.push({
      id: fieldId,
      x: 0,
      y: currentRow - 5,
      label: "Field Theory",
      shape: "stadium",
      type: "field_theory"
    });
    edges.push({
      source: typeId,
      target: fieldId
    });
    thought.fieldTheoryContext.fields.forEach((field, index) => {
      const fId = `field_${index}`;
      const offset = (index - (thought.fieldTheoryContext.fields.length - 1) / 2) * 2.5;
      nodes.push({
        id: fId,
        x: offset,
        y: currentRow - 6.5,
        label: field,
        shape: "rectangle",
        type: "field"
      });
      edges.push({
        source: fieldId,
        target: fId
      });
    });
    const symGroupId = "symmetry_group";
    nodes.push({
      id: symGroupId,
      x: 0,
      y: currentRow - 8,
      label: thought.fieldTheoryContext.symmetryGroup,
      shape: "diamond",
      type: "symmetry_group"
    });
    edges.push({
      source: fieldId,
      target: symGroupId,
      style: "dashed"
    });
  }
  const tikzOptions = {
    title: "Physics Visualization",
    colorScheme
  };
  let tikz = generateTikZ(nodes, edges, tikzOptions);
  if (includeMetrics) {
    const metrics = [
      { label: "Uncertainty", value: `${(thought.uncertainty * 100).toFixed(1)}%` },
      { label: "Assumptions", value: thought.assumptions?.length || 0 }
    ];
    tikz = tikz.replace("\\end{tikzpicture}", renderTikZMetrics(8, -8, metrics) + "\n\\end{tikzpicture}");
  }
  return tikz;
}
var init_physics = __esm({
  "src/export/visual/physics.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return hybridToSVG(thought, options);
    case "graphml":
      return hybridToGraphML(thought, options);
    case "tikz":
      return hybridToTikZ(thought, options);
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
function hybridToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = DEFAULT_SVG_OPTIONS.height
  } = options;
  const positions = /* @__PURE__ */ new Map();
  const nodeWidth = 150;
  const nodeHeight = 40;
  positions.set("hybrid", {
    id: "hybrid",
    label: "Hybrid Mode",
    x: svgWidth / 2,
    y: 100,
    width: nodeWidth,
    height: nodeHeight,
    type: "hybrid"
  });
  positions.set("primary", {
    id: "primary",
    label: thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1),
    x: svgWidth / 2,
    y: 240,
    width: nodeWidth,
    height: nodeHeight,
    type: "primary"
  });
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    thought.secondaryFeatures.forEach((feature, index) => {
      positions.set(`feature_${index}`, {
        id: `feature_${index}`,
        label: includeLabels ? feature.substring(0, 30) + (feature.length > 30 ? "..." : "") : `Feature ${index + 1}`,
        x: 150 + index * 180,
        y: 380,
        width: nodeWidth,
        height: nodeHeight,
        type: "feature"
      });
    });
  }
  let svg = generateSVGHeader(svgWidth, svgHeight, "Hybrid Mode Orchestration");
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  const hybridPos = positions.get("hybrid");
  const primaryPos = positions.get("primary");
  if (hybridPos && primaryPos) {
    svg += renderEdge(hybridPos, primaryPos, { style: "solid" });
  }
  if (thought.secondaryFeatures) {
    thought.secondaryFeatures.forEach((_, index) => {
      const featurePos = positions.get(`feature_${index}`);
      if (hybridPos && featurePos) {
        svg += renderEdge(hybridPos, featurePos);
      }
    });
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  const hybridColors = getNodeColor("success", colorScheme);
  const primaryColors = getNodeColor("primary", colorScheme);
  const featureColors = getNodeColor("secondary", colorScheme);
  for (const [, pos] of positions) {
    if (pos.type === "hybrid") {
      svg += renderEllipseNode(pos, hybridColors);
    } else if (pos.type === "primary") {
      svg += renderStadiumNode(pos, primaryColors);
    } else if (pos.type === "feature") {
      svg += renderRectNode(pos, featureColors);
    }
  }
  svg += "\n  </g>";
  if (includeMetrics) {
    const metrics = [
      { label: "Primary Mode", value: thought.primaryMode },
      { label: "Secondary Features", value: thought.secondaryFeatures?.length || 0 },
      { label: "Uncertainty", value: thought.uncertainty !== void 0 ? `${(thought.uncertainty * 100).toFixed(1)}%` : "N/A" }
    ];
    svg += renderMetricsPanel(svgWidth - 200, svgHeight - 120, metrics);
  }
  const legendItems = [
    { label: "Hybrid Mode", color: hybridColors, shape: "ellipse" },
    { label: "Primary Mode", color: primaryColors, shape: "stadium" },
    { label: "Secondary Feature", color: featureColors }
  ];
  svg += renderLegend(20, svgHeight - 110, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function hybridToGraphML(thought, options) {
  const { includeLabels = true } = options;
  const nodes = [];
  const edges = [];
  nodes.push({
    id: sanitizeId("hybrid_mode"),
    label: includeLabels ? "Hybrid Mode" : "hybrid",
    type: "hybrid"
  });
  const primaryId = sanitizeId(`primary_${thought.primaryMode}`);
  nodes.push({
    id: primaryId,
    label: includeLabels ? thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1) : thought.primaryMode,
    type: "primary"
  });
  edges.push({
    id: "e_hybrid_primary",
    source: sanitizeId("hybrid_mode"),
    target: primaryId,
    directed: true
  });
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    thought.secondaryFeatures.forEach((feature, index) => {
      const featureId = sanitizeId(`feature_${index}`);
      nodes.push({
        id: featureId,
        label: includeLabels ? feature.substring(0, 50) + (feature.length > 50 ? "..." : "") : `Feature ${index + 1}`,
        type: "secondary"
      });
      edges.push({
        id: `e_hybrid_feature_${index}`,
        source: sanitizeId("hybrid_mode"),
        target: featureId,
        directed: true
      });
    });
  }
  if (thought.stage) {
    const stageId = sanitizeId(`stage_${thought.stage}`);
    nodes.push({
      id: stageId,
      label: includeLabels ? thought.stage.replace(/_/g, " ") : "stage",
      type: "stage"
    });
    edges.push({
      id: "e_primary_stage",
      source: primaryId,
      target: stageId,
      directed: true
    });
  }
  return generateGraphML(nodes, edges, {
    graphName: "Hybrid Orchestration",
    directed: true,
    includeLabels
  });
}
function hybridToTikZ(thought, options) {
  const { includeLabels = true, colorScheme = "default" } = options;
  const nodes = [];
  const edges = [];
  nodes.push({
    id: sanitizeId("hybrid_mode"),
    label: includeLabels ? "Hybrid Mode" : "hybrid",
    x: 4,
    y: 0,
    type: "success",
    shape: "ellipse"
  });
  const primaryId = sanitizeId(`primary_${thought.primaryMode}`);
  nodes.push({
    id: primaryId,
    label: includeLabels ? thought.primaryMode.charAt(0).toUpperCase() + thought.primaryMode.slice(1) : thought.primaryMode,
    x: 4,
    y: -2,
    type: "primary",
    shape: "stadium"
  });
  edges.push({
    source: sanitizeId("hybrid_mode"),
    target: primaryId,
    directed: true
  });
  if (thought.secondaryFeatures && thought.secondaryFeatures.length > 0) {
    const featureCount = thought.secondaryFeatures.length;
    const spacing = 3;
    const totalWidth = (featureCount - 1) * spacing;
    const startX = 4 - totalWidth / 2;
    thought.secondaryFeatures.forEach((feature, index) => {
      const featureId = sanitizeId(`feature_${index}`);
      nodes.push({
        id: featureId,
        label: includeLabels ? feature.length > 20 ? feature.substring(0, 20) + "..." : feature : `F${index + 1}`,
        x: startX + index * spacing,
        y: -4,
        type: "secondary",
        shape: "rectangle"
      });
      edges.push({
        source: primaryId,
        target: featureId,
        directed: true
      });
    });
  }
  if (thought.stage) {
    const stageId = sanitizeId(`stage_${thought.stage}`);
    nodes.push({
      id: stageId,
      label: includeLabels ? thought.stage.replace(/_/g, " ") : "stage",
      x: 7,
      y: -2,
      type: "info",
      shape: "diamond"
    });
    edges.push({
      source: primaryId,
      target: stageId,
      directed: true,
      style: "dashed"
    });
  }
  return generateTikZ(nodes, edges, {
    title: "Hybrid Orchestration",
    colorScheme,
    includeLabels
  });
}
var init_hybrid = __esm({
  "src/export/visual/hybrid.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    case "svg":
      return metaReasoningToSVG(thought, options);
    case "graphml":
      return metaReasoningToGraphML(thought, options);
    case "tikz":
      return metaReasoningToTikZ(thought, options);
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
function metaReasoningToSVG(thought, options) {
  const {
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
    svgWidth = DEFAULT_SVG_OPTIONS.width,
    svgHeight = DEFAULT_SVG_OPTIONS.height
  } = options;
  const positions = /* @__PURE__ */ new Map();
  const nodeWidth = 150;
  const nodeHeight = 40;
  positions.set("meta", {
    id: "meta",
    label: "Meta-Reasoning",
    x: svgWidth / 2,
    y: 80,
    width: nodeWidth,
    height: nodeHeight,
    type: "meta"
  });
  positions.set("current", {
    id: "current",
    label: includeLabels ? thought.currentStrategy.approach : "Current Strategy",
    x: 200,
    y: 220,
    width: nodeWidth,
    height: nodeHeight,
    type: "current"
  });
  positions.set("recommendation", {
    id: "recommendation",
    label: thought.recommendation.action,
    x: svgWidth - 200,
    y: 220,
    width: nodeWidth,
    height: nodeHeight,
    type: "recommendation"
  });
  if (thought.alternativeStrategies && thought.alternativeStrategies.length > 0) {
    thought.alternativeStrategies.forEach((alt, index) => {
      positions.set(`alt_${index}`, {
        id: `alt_${index}`,
        label: includeLabels ? `${alt.mode}: ${(alt.recommendationScore * 100).toFixed(0)}%` : `Alt ${index + 1}`,
        x: 150 + index * 180,
        y: 380,
        width: nodeWidth,
        height: nodeHeight,
        type: "alternative"
      });
    });
  }
  let svg = generateSVGHeader(svgWidth, svgHeight, "Meta-Reasoning Analysis");
  svg += '\n  <!-- Edges -->\n  <g class="edges">';
  const metaPos = positions.get("meta");
  const currentPos = positions.get("current");
  const recPos = positions.get("recommendation");
  if (metaPos && currentPos) {
    svg += renderEdge(metaPos, currentPos, { style: "solid" });
  }
  if (metaPos && recPos) {
    svg += renderEdge(metaPos, recPos, { style: "solid" });
  }
  if (thought.alternativeStrategies) {
    thought.alternativeStrategies.forEach((_, index) => {
      const altPos = positions.get(`alt_${index}`);
      if (metaPos && altPos) {
        svg += renderEdge(metaPos, altPos, { style: "dashed" });
      }
    });
  }
  svg += "\n  </g>";
  svg += '\n\n  <!-- Nodes -->\n  <g class="nodes">';
  const metaColors = getNodeColor("warning", colorScheme);
  const currentColors = getNodeColor("primary", colorScheme);
  const recColors = getNodeColor("success", colorScheme);
  const altColors = getNodeColor("secondary", colorScheme);
  for (const [, pos] of positions) {
    if (pos.type === "meta") {
      svg += renderEllipseNode(pos, metaColors);
    } else if (pos.type === "current") {
      svg += renderStadiumNode(pos, currentColors);
    } else if (pos.type === "recommendation") {
      svg += renderStadiumNode(pos, recColors);
    } else if (pos.type === "alternative") {
      svg += renderRectNode(pos, altColors);
    }
  }
  svg += "\n  </g>";
  if (includeMetrics) {
    const metrics = [
      { label: "Effectiveness", value: `${(thought.strategyEvaluation.effectiveness * 100).toFixed(0)}%` },
      { label: "Quality", value: `${(thought.qualityMetrics.overallQuality * 100).toFixed(0)}%` },
      { label: "Alternatives", value: thought.alternativeStrategies.length },
      { label: "Rec Confidence", value: `${(thought.recommendation.confidence * 100).toFixed(0)}%` }
    ];
    svg += renderMetricsPanel(svgWidth - 190, svgHeight - 140, metrics);
  }
  const legendItems = [
    { label: "Meta-Reasoning", color: metaColors, shape: "ellipse" },
    { label: "Current Strategy", color: currentColors, shape: "stadium" },
    { label: "Recommendation", color: recColors, shape: "stadium" },
    { label: "Alternative", color: altColors }
  ];
  svg += renderLegend(20, svgHeight - 140, legendItems);
  svg += "\n" + generateSVGFooter();
  return svg;
}
function metaReasoningToGraphML(thought, options) {
  const { includeLabels = true, includeMetrics = true } = options;
  const nodes = [];
  const edges = [];
  nodes.push({
    id: "meta",
    label: "Meta-Reasoning",
    type: "meta"
  });
  const currentLabel = includeLabels ? thought.currentStrategy.approach : "Current Strategy";
  nodes.push({
    id: "current_strategy",
    label: currentLabel,
    type: "current",
    metadata: {
      mode: thought.currentStrategy.mode,
      thoughtsSpent: thought.currentStrategy.thoughtsSpent
    }
  });
  edges.push({
    id: "e_meta_current",
    source: "meta",
    target: "current_strategy",
    directed: true
  });
  if (includeMetrics) {
    nodes.push({
      id: "evaluation",
      label: `Effectiveness: ${(thought.strategyEvaluation.effectiveness * 100).toFixed(0)}%`,
      type: "evaluation",
      metadata: {
        effectiveness: thought.strategyEvaluation.effectiveness,
        efficiency: thought.strategyEvaluation.efficiency,
        confidence: thought.strategyEvaluation.confidence,
        progressRate: thought.strategyEvaluation.progressRate,
        qualityScore: thought.strategyEvaluation.qualityScore
      }
    });
    edges.push({
      id: "e_current_eval",
      source: "current_strategy",
      target: "evaluation",
      directed: true
    });
    if (thought.strategyEvaluation.issues.length > 0) {
      nodes.push({
        id: "issues",
        label: `Issues: ${thought.strategyEvaluation.issues.length}`,
        type: "issue",
        metadata: {
          issues: thought.strategyEvaluation.issues
        }
      });
      edges.push({
        id: "e_eval_issues",
        source: "evaluation",
        target: "issues",
        directed: true
      });
    }
    if (thought.strategyEvaluation.strengths.length > 0) {
      nodes.push({
        id: "strengths",
        label: `Strengths: ${thought.strategyEvaluation.strengths.length}`,
        type: "strength",
        metadata: {
          strengths: thought.strategyEvaluation.strengths
        }
      });
      edges.push({
        id: "e_eval_strengths",
        source: "evaluation",
        target: "strengths",
        directed: true
      });
    }
  }
  if (thought.alternativeStrategies.length > 0) {
    thought.alternativeStrategies.forEach((alt, index) => {
      const altLabel = includeLabels ? `${alt.mode}: ${(alt.recommendationScore * 100).toFixed(0)}%` : `Alternative ${index + 1}`;
      nodes.push({
        id: `alt_${index}`,
        label: altLabel,
        type: "alternative",
        metadata: {
          mode: alt.mode,
          reasoning: alt.reasoning,
          expectedBenefit: alt.expectedBenefit,
          switchingCost: alt.switchingCost,
          recommendationScore: alt.recommendationScore
        }
      });
      edges.push({
        id: `e_meta_alt_${index}`,
        source: "meta",
        target: `alt_${index}`,
        directed: true
      });
    });
  }
  const recLabel = `${thought.recommendation.action}${thought.recommendation.targetMode ? ` \u2192 ${thought.recommendation.targetMode}` : ""}`;
  nodes.push({
    id: "recommendation",
    label: recLabel,
    type: "recommendation",
    metadata: {
      action: thought.recommendation.action,
      targetMode: thought.recommendation.targetMode,
      justification: thought.recommendation.justification,
      confidence: thought.recommendation.confidence,
      expectedImprovement: thought.recommendation.expectedImprovement
    }
  });
  edges.push({
    id: "e_meta_rec",
    source: "meta",
    target: "recommendation",
    directed: true
  });
  if (includeMetrics) {
    nodes.push({
      id: "quality",
      label: `Quality: ${(thought.qualityMetrics.overallQuality * 100).toFixed(0)}%`,
      type: "quality",
      metadata: {
        logicalConsistency: thought.qualityMetrics.logicalConsistency,
        evidenceQuality: thought.qualityMetrics.evidenceQuality,
        completeness: thought.qualityMetrics.completeness,
        originality: thought.qualityMetrics.originality,
        clarity: thought.qualityMetrics.clarity,
        overallQuality: thought.qualityMetrics.overallQuality
      }
    });
    edges.push({
      id: "e_meta_quality",
      source: "meta",
      target: "quality",
      directed: true
    });
  }
  const graphmlOptions = {
    graphName: "MetaReasoning Visualization",
    directed: true,
    includeLabels
  };
  return generateGraphML(nodes, edges, graphmlOptions);
}
function metaReasoningToTikZ(thought, options) {
  const { includeLabels = true, includeMetrics = true, colorScheme = "default" } = options;
  const nodes = [];
  const edges = [];
  nodes.push({
    id: "meta",
    label: "Meta-Reasoning",
    x: 0,
    y: 0,
    shape: "ellipse",
    type: "meta"
  });
  const currentLabel = includeLabels ? thought.currentStrategy.approach : "Current Strategy";
  nodes.push({
    id: "current_strategy",
    label: currentLabel.substring(0, 30),
    // Truncate for readability
    x: -4,
    y: -2,
    shape: "stadium",
    type: "current"
  });
  edges.push({
    source: "meta",
    target: "current_strategy",
    directed: true
  });
  const recLabel = `${thought.recommendation.action}${thought.recommendation.targetMode ? ` \u2192 ${thought.recommendation.targetMode}` : ""}`;
  nodes.push({
    id: "recommendation",
    label: recLabel.substring(0, 30),
    x: 4,
    y: -2,
    shape: "stadium",
    type: "recommendation"
  });
  edges.push({
    source: "meta",
    target: "recommendation",
    directed: true
  });
  if (includeMetrics) {
    nodes.push({
      id: "evaluation",
      label: `Eff: ${(thought.strategyEvaluation.effectiveness * 100).toFixed(0)}%`,
      x: -4,
      y: -4,
      shape: "diamond",
      type: "evaluation"
    });
    edges.push({
      source: "current_strategy",
      target: "evaluation",
      directed: true
    });
  }
  if (thought.alternativeStrategies.length > 0) {
    const altCount = thought.alternativeStrategies.length;
    const spacing = 2.5;
    const totalWidth = (altCount - 1) * spacing;
    const offset = totalWidth / 2;
    thought.alternativeStrategies.forEach((alt, index) => {
      const altLabel = includeLabels ? `${alt.mode}: ${(alt.recommendationScore * 100).toFixed(0)}%` : `Alt ${index + 1}`;
      nodes.push({
        id: `alt_${index}`,
        label: altLabel,
        x: index * spacing - offset,
        y: -5,
        shape: "rectangle",
        type: "alternative"
      });
      edges.push({
        source: "meta",
        target: `alt_${index}`,
        directed: true,
        style: "dashed"
      });
    });
  }
  if (includeMetrics) {
    nodes.push({
      id: "quality",
      label: `Quality: ${(thought.qualityMetrics.overallQuality * 100).toFixed(0)}%`,
      x: 4,
      y: -4,
      shape: "diamond",
      type: "quality"
    });
    edges.push({
      source: "meta",
      target: "quality",
      directed: true,
      style: "dashed"
    });
  }
  const tikzOptions = {
    title: "MetaReasoning Visualization",
    colorScheme,
    includeLabels
  };
  return generateTikZ(nodes, edges, tikzOptions);
}
var init_metareasoning = __esm({
  "src/export/visual/metareasoning.ts"() {
    init_esm_shims();
    init_utils();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
  }
});

// src/export/visual/proof-decomposition.ts
function exportProofDecomposition(decomposition, options) {
  const {
    format,
    colorScheme = "default",
    includeLabels = true,
    includeMetrics = true,
    svgWidth = 800,
    svgHeight = 600,
    nodeSpacing = 120
  } = options;
  switch (format) {
    case "mermaid":
      return proofDecompositionToMermaid(decomposition, colorScheme, includeLabels, includeMetrics);
    case "dot":
      return proofDecompositionToDOT(decomposition, includeLabels, includeMetrics);
    case "ascii":
      return proofDecompositionToASCII(decomposition);
    case "svg":
      return proofDecompositionToSVG(decomposition, colorScheme, includeLabels, includeMetrics, svgWidth, svgHeight, nodeSpacing);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
function getMermaidShape(type) {
  switch (type) {
    case "axiom":
      return ["([", "])"];
    // Stadium/rounded
    case "definition":
      return ["[[", "]]"];
    // Subroutine
    case "hypothesis":
      return ["[", "]"];
    // Rectangle
    case "lemma":
      return ["{{", "}}"];
    // Hexagon
    case "derived":
      return ["(", ")"];
    // Default rounded
    case "conclusion":
      return ["{", "}"];
    // Diamond shape via styling
    default:
      return ["(", ")"];
  }
}
function getNodeColor2(type, colorScheme) {
  if (colorScheme === "monochrome") return "#ffffff";
  const colors = colorScheme === "pastel" ? {
    axiom: "#c8e6c9",
    // Light green
    definition: "#e1bee7",
    // Light purple
    hypothesis: "#bbdefb",
    // Light blue
    lemma: "#fff9c4",
    // Light yellow
    derived: "#e0e0e0",
    // Light gray
    conclusion: "#d1c4e9"
    // Light purple
  } : {
    axiom: "#81c784",
    // Green
    definition: "#ba68c8",
    // Purple
    hypothesis: "#64b5f6",
    // Blue
    lemma: "#ffd54f",
    // Yellow
    derived: "#bdbdbd",
    // Gray
    conclusion: "#9575cd"
    // Purple
  };
  return colors[type] || colors.derived;
}
function proofDecompositionToMermaid(decomposition, colorScheme, includeLabels, includeMetrics) {
  let mermaid = "graph TD\n";
  if (decomposition.theorem) {
    mermaid += `  title["Proof: ${decomposition.theorem.substring(0, 50)}..."]
`;
    mermaid += "  style title fill:#f5f5f5,stroke:#333\n\n";
  }
  const axioms = decomposition.atoms.filter((a) => a.type === "axiom");
  const hypotheses = decomposition.atoms.filter((a) => a.type === "hypothesis");
  const derived = decomposition.atoms.filter((a) => a.type === "derived" || a.type === "lemma");
  const conclusions = decomposition.atoms.filter((a) => a.type === "conclusion");
  if (axioms.length > 0) {
    mermaid += '  subgraph Axioms["Axioms"]\n';
    for (const atom of axioms) {
      const nodeId = sanitizeId(atom.id);
      const label = includeLabels ? atom.statement.substring(0, 40) + (atom.statement.length > 40 ? "..." : "") : atom.id;
      const [open, close] = getMermaidShape(atom.type);
      mermaid += `    ${nodeId}${open}"${label}"${close}
`;
    }
    mermaid += "  end\n\n";
  }
  if (hypotheses.length > 0) {
    mermaid += '  subgraph Hypotheses["Hypotheses"]\n';
    for (const atom of hypotheses) {
      const nodeId = sanitizeId(atom.id);
      const label = includeLabels ? atom.statement.substring(0, 40) + (atom.statement.length > 40 ? "..." : "") : atom.id;
      const [open, close] = getMermaidShape(atom.type);
      mermaid += `    ${nodeId}${open}"${label}"${close}
`;
    }
    mermaid += "  end\n\n";
  }
  for (const atom of derived) {
    const nodeId = sanitizeId(atom.id);
    const label = includeLabels ? atom.statement.substring(0, 40) + (atom.statement.length > 40 ? "..." : "") : atom.id;
    const [open, close] = getMermaidShape(atom.type);
    mermaid += `  ${nodeId}${open}"${label}"${close}
`;
  }
  if (conclusions.length > 0) {
    mermaid += '\n  subgraph Conclusions["Conclusions"]\n';
    for (const atom of conclusions) {
      const nodeId = sanitizeId(atom.id);
      const label = includeLabels ? atom.statement.substring(0, 40) + (atom.statement.length > 40 ? "..." : "") : atom.id;
      mermaid += `    ${nodeId}{"${label}"}
`;
    }
    mermaid += "  end\n\n";
  }
  if (decomposition.dependencies && decomposition.dependencies.edges) {
    for (const edge of decomposition.dependencies.edges) {
      const fromId = sanitizeId(edge.from);
      const toId = sanitizeId(edge.to);
      const edgeLabel = edge.inferenceRule ? ` -->|${edge.inferenceRule}| ` : " --> ";
      mermaid += `  ${fromId}${edgeLabel}${toId}
`;
    }
  }
  if (decomposition.gaps && decomposition.gaps.length > 0) {
    mermaid += '\n  subgraph Gaps["Identified Gaps"]\n';
    for (const gap of decomposition.gaps) {
      const gapId = sanitizeId(gap.id);
      const label = gap.description.substring(0, 30) + "...";
      mermaid += `    ${gapId}["${label}"]
`;
      mermaid += `    ${sanitizeId(gap.location.from)} -.->|gap| ${gapId}
`;
      mermaid += `    ${gapId} -.-> ${sanitizeId(gap.location.to)}
`;
    }
    mermaid += "  end\n";
  }
  if (includeMetrics) {
    mermaid += '\n  subgraph Metrics["Metrics"]\n';
    mermaid += `    m1["Completeness: ${(decomposition.completeness * 100).toFixed(0)}%"]
`;
    mermaid += `    m2["Rigor: ${decomposition.rigorLevel}"]
`;
    mermaid += `    m3["Atoms: ${decomposition.atomCount}"]
`;
    mermaid += `    m4["Depth: ${decomposition.maxDependencyDepth}"]
`;
    mermaid += "  end\n";
  }
  if (colorScheme !== "monochrome") {
    mermaid += "\n";
    for (const atom of decomposition.atoms) {
      const nodeId = sanitizeId(atom.id);
      const color = getNodeColor2(atom.type, colorScheme);
      mermaid += `  style ${nodeId} fill:${color}
`;
    }
    if (decomposition.gaps) {
      for (const gap of decomposition.gaps) {
        const gapId = sanitizeId(gap.id);
        mermaid += `  style ${gapId} fill:#ffcdd2,stroke:#e53935,stroke-dasharray: 5 5
`;
      }
    }
  }
  return mermaid;
}
function getDOTShape(type) {
  switch (type) {
    case "axiom":
      return "ellipse";
    case "definition":
      return "box3d";
    case "hypothesis":
      return "box";
    case "lemma":
      return "hexagon";
    case "derived":
      return "box";
    case "conclusion":
      return "diamond";
    default:
      return "box";
  }
}
function proofDecompositionToDOT(decomposition, includeLabels, includeMetrics) {
  let dot = "digraph ProofDecomposition {\n";
  dot += "  rankdir=TB;\n";
  dot += "  compound=true;\n";
  dot += '  node [style="rounded,filled", fontname="Arial"];\n';
  dot += '  edge [fontname="Arial", fontsize=10];\n\n';
  if (decomposition.theorem) {
    dot += `  label="Proof: ${decomposition.theorem.substring(0, 60)}...";
`;
    dot += "  labelloc=t;\n";
    dot += "  fontsize=14;\n\n";
  }
  const axioms = decomposition.atoms.filter((a) => a.type === "axiom");
  const hypotheses = decomposition.atoms.filter((a) => a.type === "hypothesis");
  const conclusions = decomposition.atoms.filter((a) => a.type === "conclusion");
  if (axioms.length > 0) {
    dot += "  subgraph cluster_axioms {\n";
    dot += '    label="Axioms";\n';
    dot += "    style=filled;\n";
    dot += '    color="#e8f5e9";\n';
    for (const atom of axioms) {
      const nodeId = sanitizeId(atom.id);
      const label = includeLabels ? atom.statement.substring(0, 40).replace(/"/g, '\\"') : atom.id;
      dot += `    ${nodeId} [label="${label}", shape=${getDOTShape(atom.type)}, fillcolor="#81c784"];
`;
    }
    dot += "  }\n\n";
  }
  if (hypotheses.length > 0) {
    dot += "  subgraph cluster_hypotheses {\n";
    dot += '    label="Hypotheses";\n';
    dot += "    style=filled;\n";
    dot += '    color="#e3f2fd";\n';
    for (const atom of hypotheses) {
      const nodeId = sanitizeId(atom.id);
      const label = includeLabels ? atom.statement.substring(0, 40).replace(/"/g, '\\"') : atom.id;
      dot += `    ${nodeId} [label="${label}", shape=${getDOTShape(atom.type)}, fillcolor="#64b5f6"];
`;
    }
    dot += "  }\n\n";
  }
  const derived = decomposition.atoms.filter((a) => a.type === "derived" || a.type === "lemma");
  for (const atom of derived) {
    const nodeId = sanitizeId(atom.id);
    const label = includeLabels ? atom.statement.substring(0, 40).replace(/"/g, '\\"') : atom.id;
    const color = atom.type === "lemma" ? "#ffd54f" : "#bdbdbd";
    dot += `  ${nodeId} [label="${label}", shape=${getDOTShape(atom.type)}, fillcolor="${color}"];
`;
  }
  dot += "\n";
  if (conclusions.length > 0) {
    dot += "  subgraph cluster_conclusions {\n";
    dot += '    label="Conclusions";\n';
    dot += "    style=filled;\n";
    dot += '    color="#ede7f6";\n';
    for (const atom of conclusions) {
      const nodeId = sanitizeId(atom.id);
      const label = includeLabels ? atom.statement.substring(0, 40).replace(/"/g, '\\"') : atom.id;
      dot += `    ${nodeId} [label="${label}", shape=${getDOTShape(atom.type)}, fillcolor="#9575cd"];
`;
    }
    dot += "  }\n\n";
  }
  if (decomposition.dependencies && decomposition.dependencies.edges) {
    for (const edge of decomposition.dependencies.edges) {
      const fromId = sanitizeId(edge.from);
      const toId = sanitizeId(edge.to);
      const edgeLabel = edge.inferenceRule ? ` [label="${edge.inferenceRule}"]` : "";
      dot += `  ${fromId} -> ${toId}${edgeLabel};
`;
    }
  }
  if (decomposition.gaps && decomposition.gaps.length > 0) {
    dot += "\n  // Gaps (dashed red)\n";
    for (const gap of decomposition.gaps) {
      const gapId = sanitizeId(gap.id);
      const label = gap.description.substring(0, 30).replace(/"/g, '\\"');
      dot += `  ${gapId} [label="${label}", shape=note, fillcolor="#ffcdd2", style="dashed,filled"];
`;
      dot += `  ${sanitizeId(gap.location.from)} -> ${gapId} [style=dashed, color=red];
`;
      dot += `  ${gapId} -> ${sanitizeId(gap.location.to)} [style=dashed, color=red];
`;
    }
  }
  if (includeMetrics) {
    dot += "\n  // Metrics\n";
    dot += "  subgraph cluster_metrics {\n";
    dot += '    label="Metrics";\n';
    dot += "    style=filled;\n";
    dot += '    color="#f5f5f5";\n';
    dot += `    metrics [label="Completeness: ${(decomposition.completeness * 100).toFixed(0)}%\\nRigor: ${decomposition.rigorLevel}\\nAtoms: ${decomposition.atomCount}\\nDepth: ${decomposition.maxDependencyDepth}", shape=note];
`;
    dot += "  }\n";
  }
  dot += "}\n";
  return dot;
}
function proofDecompositionToASCII(decomposition) {
  let ascii = "";
  ascii += "\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n";
  ascii += "\u2551                    PROOF DECOMPOSITION                         \u2551\n";
  ascii += "\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n\n";
  if (decomposition.theorem) {
    ascii += `Theorem: ${decomposition.theorem}

`;
  }
  ascii += "\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n";
  ascii += "\u2502 METRICS                                                         \u2502\n";
  ascii += "\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n";
  ascii += `\u2502 Completeness: ${(decomposition.completeness * 100).toFixed(0)}%`.padEnd(66) + "\u2502\n";
  ascii += `\u2502 Rigor Level:  ${decomposition.rigorLevel}`.padEnd(66) + "\u2502\n";
  ascii += `\u2502 Atom Count:   ${decomposition.atomCount}`.padEnd(66) + "\u2502\n";
  ascii += `\u2502 Max Depth:    ${decomposition.maxDependencyDepth}`.padEnd(66) + "\u2502\n";
  ascii += "\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\n";
  const axioms = decomposition.atoms.filter((a) => a.type === "axiom");
  if (axioms.length > 0) {
    ascii += "\u250C\u2500 AXIOMS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n";
    for (const atom of axioms) {
      const marker = "\u25C9";
      const line = `\u2502 ${marker} [${atom.id}] ${atom.statement}`;
      ascii += line.substring(0, 65).padEnd(66) + "\u2502\n";
    }
    ascii += "\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\n";
  }
  const hypotheses = decomposition.atoms.filter((a) => a.type === "hypothesis");
  if (hypotheses.length > 0) {
    ascii += "\u250C\u2500 HYPOTHESES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n";
    for (const atom of hypotheses) {
      const marker = "\u25C6";
      const line = `\u2502 ${marker} [${atom.id}] ${atom.statement}`;
      ascii += line.substring(0, 65).padEnd(66) + "\u2502\n";
    }
    ascii += "\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\n";
  }
  const derived = decomposition.atoms.filter((a) => a.type === "derived" || a.type === "lemma");
  if (derived.length > 0) {
    ascii += "\u250C\u2500 DERIVATION CHAIN \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n";
    for (const atom of derived) {
      const marker = atom.type === "lemma" ? "\u25C7" : "\u25CB";
      const deps = atom.derivedFrom && atom.derivedFrom.length > 0 ? ` \u2190 [${atom.derivedFrom.join(", ")}]` : "";
      const line = `\u2502 ${marker} [${atom.id}] ${atom.statement}${deps}`;
      ascii += line.substring(0, 65).padEnd(66) + "\u2502\n";
      if (atom.usedInferenceRule) {
        ascii += `\u2502   \u2514\u2500 Rule: ${atom.usedInferenceRule}`.padEnd(66) + "\u2502\n";
      }
    }
    ascii += "\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\n";
  }
  const conclusions = decomposition.atoms.filter((a) => a.type === "conclusion");
  if (conclusions.length > 0) {
    ascii += "\u250C\u2500 CONCLUSIONS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n";
    for (const atom of conclusions) {
      const marker = "\u2605";
      const deps = atom.derivedFrom && atom.derivedFrom.length > 0 ? ` \u2190 [${atom.derivedFrom.join(", ")}]` : "";
      const line = `\u2502 ${marker} [${atom.id}] ${atom.statement}${deps}`;
      ascii += line.substring(0, 65).padEnd(66) + "\u2502\n";
    }
    ascii += "\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\n";
  }
  if (decomposition.gaps && decomposition.gaps.length > 0) {
    ascii += "\u250C\u2500 GAPS (Missing Steps) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n";
    for (const gap of decomposition.gaps) {
      const severityIcon = gap.severity === "critical" ? "\u26A0" : gap.severity === "significant" ? "!" : "?";
      ascii += `\u2502 ${severityIcon} [${gap.type}] ${gap.description}`.substring(0, 65).padEnd(66) + "\u2502\n";
      ascii += `\u2502   Between: ${gap.location.from} \u2192 ${gap.location.to}`.padEnd(66) + "\u2502\n";
      if (gap.suggestedFix) {
        ascii += `\u2502   Fix: ${gap.suggestedFix}`.substring(0, 65).padEnd(66) + "\u2502\n";
      }
    }
    ascii += "\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\n";
  }
  if (decomposition.implicitAssumptions && decomposition.implicitAssumptions.length > 0) {
    ascii += "\u250C\u2500 IMPLICIT ASSUMPTIONS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n";
    for (const assumption of decomposition.implicitAssumptions) {
      ascii += `\u2502 \u2022 [${assumption.type}]`.padEnd(66) + "\u2502\n";
      ascii += `\u2502   ${assumption.statement}`.substring(0, 65).padEnd(66) + "\u2502\n";
      if (assumption.shouldBeExplicit) {
        ascii += `\u2502   \u26A0 Should be explicit`.padEnd(66) + "\u2502\n";
      }
    }
    ascii += "\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n\n";
  }
  if (decomposition.dependencies && decomposition.dependencies.edges.length > 0) {
    ascii += "\u250C\u2500 DEPENDENCY TREE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n";
    ascii += "\u2502                                                                    \u2502\n";
    const roots = decomposition.dependencies.roots || [];
    for (const rootId of roots) {
      ascii += buildASCIITree(rootId, decomposition, 0, /* @__PURE__ */ new Set());
    }
    ascii += "\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n";
  }
  return ascii;
}
function buildASCIITree(nodeId, decomposition, depth, visited) {
  if (visited.has(nodeId) || depth > 10) {
    return "";
  }
  visited.add(nodeId);
  const indent = "\u2502   ".repeat(depth);
  const atom = decomposition.atoms.find((a) => a.id === nodeId);
  if (!atom) return "";
  const typeMarker = {
    axiom: "\u25C9",
    hypothesis: "\u25C6",
    definition: "\u25A3",
    lemma: "\u25C7",
    derived: "\u25CB",
    conclusion: "\u2605"
  }[atom.type] || "?";
  let result = `\u2502 ${indent}${typeMarker} ${atom.id}
`;
  const children = decomposition.dependencies.edges.filter((e) => e.from === nodeId).map((e) => e.to);
  for (const childId of children) {
    result += buildASCIITree(childId, decomposition, depth + 1, visited);
  }
  return result;
}
function getSVGColors(type, colorScheme) {
  if (colorScheme === "monochrome") {
    return { fill: "#ffffff", stroke: "#333333" };
  }
  const colors = colorScheme === "pastel" ? {
    axiom: { fill: "#c8e6c9", stroke: "#4caf50" },
    definition: { fill: "#e1bee7", stroke: "#9c27b0" },
    hypothesis: { fill: "#bbdefb", stroke: "#2196f3" },
    lemma: { fill: "#fff9c4", stroke: "#ffc107" },
    derived: { fill: "#e0e0e0", stroke: "#757575" },
    conclusion: { fill: "#d1c4e9", stroke: "#673ab7" }
  } : {
    axiom: { fill: "#81c784", stroke: "#388e3c" },
    definition: { fill: "#ba68c8", stroke: "#7b1fa2" },
    hypothesis: { fill: "#64b5f6", stroke: "#1976d2" },
    lemma: { fill: "#ffd54f", stroke: "#ffa000" },
    derived: { fill: "#bdbdbd", stroke: "#616161" },
    conclusion: { fill: "#9575cd", stroke: "#512da8" }
  };
  return colors[type] || colors.derived;
}
function escapeSVGText2(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function truncateText2(text, maxChars) {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars - 3) + "...";
}
function renderSVGNode(pos, colorScheme) {
  const colors = getSVGColors(pos.type, colorScheme);
  const escapedLabel = escapeSVGText2(truncateText2(pos.label, 30));
  switch (pos.type) {
    case "axiom":
      return `
    <g class="node node-axiom" data-id="${sanitizeId(pos.id)}">
      <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}"
            rx="20" ry="20" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 5}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="12">${escapedLabel}</text>
    </g>`;
    case "hypothesis":
      return `
    <g class="node node-hypothesis" data-id="${sanitizeId(pos.id)}">
      <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}"
            rx="4" ry="4" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 5}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="12">${escapedLabel}</text>
    </g>`;
    case "conclusion": {
      const cx = pos.x + pos.width / 2;
      const cy = pos.y + pos.height / 2;
      return `
    <g class="node node-conclusion" data-id="${sanitizeId(pos.id)}">
      <polygon points="${cx},${pos.y} ${pos.x + pos.width},${cy} ${cx},${pos.y + pos.height} ${pos.x},${cy}"
               fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${cx}" y="${cy + 5}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="12">${escapedLabel}</text>
    </g>`;
    }
    case "lemma": {
      const hx = pos.x + pos.width / 2;
      const hy = pos.y + pos.height / 2;
      const w = pos.width;
      const h = pos.height;
      return `
    <g class="node node-lemma" data-id="${sanitizeId(pos.id)}">
      <polygon points="${pos.x + w * 0.25},${pos.y} ${pos.x + w * 0.75},${pos.y} ${pos.x + w},${hy} ${pos.x + w * 0.75},${pos.y + h} ${pos.x + w * 0.25},${pos.y + h} ${pos.x},${hy}"
               fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${hx}" y="${hy + 5}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="12">${escapedLabel}</text>
    </g>`;
    }
    case "definition":
      return `
    <g class="node node-definition" data-id="${sanitizeId(pos.id)}">
      <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}"
            rx="4" ry="4" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <rect x="${pos.x + 4}" y="${pos.y + 4}" width="${pos.width - 8}" height="${pos.height - 8}"
            rx="2" ry="2" fill="none" stroke="${colors.stroke}" stroke-width="1"/>
      <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 5}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="12">${escapedLabel}</text>
    </g>`;
    default:
      return `
    <g class="node node-derived" data-id="${sanitizeId(pos.id)}">
      <rect x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}"
            rx="8" ry="8" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"/>
      <text x="${pos.x + pos.width / 2}" y="${pos.y + pos.height / 2 + 5}"
            text-anchor="middle" font-family="Arial, sans-serif" font-size="12">${escapedLabel}</text>
    </g>`;
  }
}
function renderSVGEdge(fromPos, toPos, label, isDashed = false, color = "#333333") {
  const fromX = fromPos.x + fromPos.width / 2;
  const fromY = fromPos.y + fromPos.height;
  const toX = toPos.x + toPos.width / 2;
  const toY = toPos.y;
  const midY = (fromY + toY) / 2;
  const path2 = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY - 8}`;
  const dashStyle = isDashed ? 'stroke-dasharray="5,5"' : "";
  const labelElement = label ? `<text x="${(fromX + toX) / 2}" y="${midY - 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#666">${escapeSVGText2(label)}</text>` : "";
  return `
    <g class="edge">
      <path d="${path2}" fill="none" stroke="${color}" stroke-width="2" ${dashStyle} marker-end="url(#arrowhead)"/>
      ${labelElement}
    </g>`;
}
function proofDecompositionToSVG(decomposition, colorScheme, includeLabels, includeMetrics, width, height, nodeSpacing) {
  const nodeWidth = 150;
  const nodeHeight = 40;
  const padding = 40;
  const layerSpacing = nodeSpacing;
  const axioms = decomposition.atoms.filter((a) => a.type === "axiom");
  const hypotheses = decomposition.atoms.filter((a) => a.type === "hypothesis");
  const derived = decomposition.atoms.filter((a) => a.type === "derived" || a.type === "lemma");
  const conclusions = decomposition.atoms.filter((a) => a.type === "conclusion");
  const nodePositions = /* @__PURE__ */ new Map();
  let currentY = padding;
  const layer1 = [...axioms, ...hypotheses];
  const layer1Width = layer1.length * (nodeWidth + 20) - 20;
  let startX = (width - layer1Width) / 2;
  for (const atom of layer1) {
    const label = includeLabels ? atom.statement : atom.id;
    nodePositions.set(atom.id, {
      id: atom.id,
      x: startX,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: atom.type,
      label
    });
    startX += nodeWidth + 20;
  }
  currentY += nodeHeight + layerSpacing;
  const derivedWidth = derived.length * (nodeWidth + 20) - 20;
  startX = (width - derivedWidth) / 2;
  for (const atom of derived) {
    const label = includeLabels ? atom.statement : atom.id;
    nodePositions.set(atom.id, {
      id: atom.id,
      x: startX,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: atom.type,
      label
    });
    startX += nodeWidth + 20;
  }
  currentY += nodeHeight + layerSpacing;
  const conclusionsWidth = conclusions.length * (nodeWidth + 20) - 20;
  startX = (width - conclusionsWidth) / 2;
  for (const atom of conclusions) {
    const label = includeLabels ? atom.statement : atom.id;
    nodePositions.set(atom.id, {
      id: atom.id,
      x: startX,
      y: currentY,
      width: nodeWidth,
      height: nodeHeight,
      type: atom.type,
      label
    });
    startX += nodeWidth + 20;
  }
  currentY += nodeHeight + padding;
  const actualHeight = Math.max(height, currentY);
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${actualHeight}" width="${width}" height="${actualHeight}">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#333"/>
    </marker>
    <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#e53935"/>
    </marker>
  </defs>

  <style>
    .title { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; }
    .section-label { font-family: Arial, sans-serif; font-size: 12px; fill: #666; font-style: italic; }
    .metrics { font-family: Arial, sans-serif; font-size: 11px; fill: #444; }
  </style>

  <!-- Background -->
  <rect width="100%" height="100%" fill="#fafafa"/>
`;
  if (decomposition.theorem) {
    svg += `
  <!-- Title -->
  <text x="${width / 2}" y="25" text-anchor="middle" class="title">Proof: ${escapeSVGText2(truncateText2(decomposition.theorem, 60))}</text>
`;
  }
  if (decomposition.dependencies && decomposition.dependencies.edges) {
    svg += '\n  <!-- Edges -->\n  <g class="edges">';
    for (const edge of decomposition.dependencies.edges) {
      const fromPos = nodePositions.get(edge.from);
      const toPos = nodePositions.get(edge.to);
      if (fromPos && toPos) {
        svg += renderSVGEdge(fromPos, toPos, edge.inferenceRule);
      }
    }
    svg += "\n  </g>\n";
  }
  if (decomposition.gaps && decomposition.gaps.length > 0) {
    svg += '\n  <!-- Gap Edges -->\n  <g class="gap-edges">';
    for (const gap of decomposition.gaps) {
      const fromPos = nodePositions.get(gap.location.from);
      const toPos = nodePositions.get(gap.location.to);
      if (fromPos && toPos) {
        svg += renderSVGEdge(fromPos, toPos, "GAP: " + truncateText2(gap.description, 20), true, "#e53935");
      }
    }
    svg += "\n  </g>\n";
  }
  svg += '\n  <!-- Nodes -->\n  <g class="nodes">';
  for (const [, pos] of nodePositions) {
    svg += renderSVGNode(pos, colorScheme);
  }
  svg += "\n  </g>\n";
  if (includeMetrics) {
    const metricsX = width - 180;
    const metricsY = actualHeight - 100;
    svg += `
  <!-- Metrics -->
  <g class="metrics-panel">
    <rect x="${metricsX}" y="${metricsY}" width="160" height="90" rx="8" fill="#f5f5f5" stroke="#ddd" stroke-width="1"/>
    <text x="${metricsX + 10}" y="${metricsY + 20}" class="metrics" font-weight="bold">Metrics</text>
    <text x="${metricsX + 10}" y="${metricsY + 38}" class="metrics">Completeness: ${(decomposition.completeness * 100).toFixed(0)}%</text>
    <text x="${metricsX + 10}" y="${metricsY + 54}" class="metrics">Rigor: ${decomposition.rigorLevel}</text>
    <text x="${metricsX + 10}" y="${metricsY + 70}" class="metrics">Atoms: ${decomposition.atomCount}</text>
    <text x="${metricsX + 10}" y="${metricsY + 86}" class="metrics">Depth: ${decomposition.maxDependencyDepth}</text>
  </g>
`;
  }
  svg += `
  <!-- Legend -->
  <g class="legend" transform="translate(20, ${actualHeight - 100})">
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="11" font-weight="bold">Legend</text>
    <rect x="0" y="10" width="20" height="12" rx="6" fill="${getSVGColors("axiom", colorScheme).fill}" stroke="${getSVGColors("axiom", colorScheme).stroke}"/>
    <text x="25" y="20" font-family="Arial, sans-serif" font-size="10">Axiom</text>
    <rect x="0" y="28" width="20" height="12" rx="2" fill="${getSVGColors("hypothesis", colorScheme).fill}" stroke="${getSVGColors("hypothesis", colorScheme).stroke}"/>
    <text x="25" y="38" font-family="Arial, sans-serif" font-size="10">Hypothesis</text>
    <rect x="0" y="46" width="20" height="12" rx="4" fill="${getSVGColors("derived", colorScheme).fill}" stroke="${getSVGColors("derived", colorScheme).stroke}"/>
    <text x="25" y="56" font-family="Arial, sans-serif" font-size="10">Derived</text>
    <polygon points="10,64 20,70 10,76 0,70" fill="${getSVGColors("conclusion", colorScheme).fill}" stroke="${getSVGColors("conclusion", colorScheme).stroke}"/>
    <text x="25" y="74" font-family="Arial, sans-serif" font-size="10">Conclusion</text>
  </g>
`;
  svg += "</svg>";
  return svg;
}
var init_proof_decomposition = __esm({
  "src/export/visual/proof-decomposition.ts"() {
    init_esm_shims();
    init_utils();
  }
});

// src/export/visual/index.ts
var VisualExporter;
var init_visual = __esm({
  "src/export/visual/index.ts"() {
    init_esm_shims();
    init_svg_utils();
    init_graphml_utils();
    init_tikz_utils();
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
    init_proof_decomposition();
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
      // Phase 8: Proof decomposition visual export
      exportProofDecomposition(decomposition, options) {
        return exportProofDecomposition(decomposition, options);
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
        if (format === "mermaid" || format === "dot" || format === "ascii" || format === "svg" || format === "graphml" || format === "tikz") {
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
var DependencyGraphBuilder;
var init_dependency_graph = __esm({
  "src/proof/dependency-graph.ts"() {
    init_esm_shims();
    DependencyGraphBuilder = class {
      nodes;
      edges;
      adjacencyList;
      // node -> nodes it points to
      reverseAdjacencyList;
      // node -> nodes pointing to it
      constructor() {
        this.nodes = /* @__PURE__ */ new Map();
        this.edges = [];
        this.adjacencyList = /* @__PURE__ */ new Map();
        this.reverseAdjacencyList = /* @__PURE__ */ new Map();
      }
      /**
       * Add a statement to the graph
       */
      addStatement(statement) {
        this.nodes.set(statement.id, statement);
        if (!this.adjacencyList.has(statement.id)) {
          this.adjacencyList.set(statement.id, []);
        }
        if (!this.reverseAdjacencyList.has(statement.id)) {
          this.reverseAdjacencyList.set(statement.id, []);
        }
      }
      /**
       * Create and add a new statement
       */
      createStatement(statement, type, options) {
        const newStatement = {
          id: randomUUID(),
          statement,
          type,
          confidence: options?.confidence ?? 1,
          isExplicit: options?.isExplicit ?? true,
          ...options
        };
        this.addStatement(newStatement);
        return newStatement;
      }
      /**
       * Add a dependency edge between two statements
       *
       * @param from - ID of the source statement (prerequisite)
       * @param to - ID of the target statement (depends on source)
       * @param type - Type of dependency
       * @param options - Additional edge options
       */
      addDependency(from, to, type = "logical", options) {
        if (!this.nodes.has(from)) {
          throw new Error(`Source node '${from}' not found in graph`);
        }
        if (!this.nodes.has(to)) {
          throw new Error(`Target node '${to}' not found in graph`);
        }
        const edge = {
          from,
          to,
          type,
          strength: options?.strength ?? 1,
          inferenceRule: options?.inferenceRule
        };
        this.edges.push(edge);
        const adj = this.adjacencyList.get(from) || [];
        adj.push(to);
        this.adjacencyList.set(from, adj);
        const revAdj = this.reverseAdjacencyList.get(to) || [];
        revAdj.push(from);
        this.reverseAdjacencyList.set(to, revAdj);
      }
      /**
       * Find root nodes (axioms/hypotheses with no incoming edges)
       */
      findRoots() {
        const roots = [];
        for (const [nodeId] of this.nodes) {
          const incoming = this.reverseAdjacencyList.get(nodeId) || [];
          if (incoming.length === 0) {
            roots.push(nodeId);
          }
        }
        return roots;
      }
      /**
       * Find leaf nodes (conclusions with no outgoing edges)
       */
      findLeaves() {
        const leaves = [];
        for (const [nodeId] of this.nodes) {
          const outgoing = this.adjacencyList.get(nodeId) || [];
          if (outgoing.length === 0) {
            leaves.push(nodeId);
          }
        }
        return leaves;
      }
      /**
       * Get all ancestors of a node (all nodes that lead to this node)
       */
      getAncestors(nodeId) {
        const ancestors = /* @__PURE__ */ new Set();
        const visited = /* @__PURE__ */ new Set();
        const stack = [nodeId];
        while (stack.length > 0) {
          const current = stack.pop();
          if (visited.has(current)) continue;
          visited.add(current);
          const parents = this.reverseAdjacencyList.get(current) || [];
          for (const parent of parents) {
            ancestors.add(parent);
            stack.push(parent);
          }
        }
        return Array.from(ancestors);
      }
      /**
       * Get all descendants of a node (all nodes that depend on this node)
       */
      getDescendants(nodeId) {
        const descendants = /* @__PURE__ */ new Set();
        const visited = /* @__PURE__ */ new Set();
        const stack = [nodeId];
        while (stack.length > 0) {
          const current = stack.pop();
          if (visited.has(current)) continue;
          visited.add(current);
          const children = this.adjacencyList.get(current) || [];
          for (const child of children) {
            descendants.add(child);
            stack.push(child);
          }
        }
        return Array.from(descendants);
      }
      /**
       * Compute the depth of the graph (longest path from any root to any leaf)
       */
      computeDepth() {
        const roots = this.findRoots();
        if (roots.length === 0) return 0;
        let maxDepth = 0;
        const memo = /* @__PURE__ */ new Map();
        const dfs = (nodeId, visited) => {
          if (memo.has(nodeId)) return memo.get(nodeId);
          if (visited.has(nodeId)) return 0;
          visited.add(nodeId);
          const children = this.adjacencyList.get(nodeId) || [];
          if (children.length === 0) {
            memo.set(nodeId, 1);
            return 1;
          }
          let maxChildDepth = 0;
          for (const child of children) {
            maxChildDepth = Math.max(maxChildDepth, dfs(child, new Set(visited)));
          }
          const depth = 1 + maxChildDepth;
          memo.set(nodeId, depth);
          return depth;
        };
        for (const root of roots) {
          maxDepth = Math.max(maxDepth, dfs(root, /* @__PURE__ */ new Set()));
        }
        return maxDepth;
      }
      /**
       * Compute the width of the graph (maximum nodes at any level)
       */
      computeWidth() {
        const roots = this.findRoots();
        if (roots.length === 0) return 0;
        const levels = /* @__PURE__ */ new Map();
        const queue = roots.map((r) => ({
          nodeId: r,
          level: 0
        }));
        const visited = /* @__PURE__ */ new Set();
        while (queue.length > 0) {
          const { nodeId, level } = queue.shift();
          if (visited.has(nodeId)) continue;
          visited.add(nodeId);
          levels.set(nodeId, level);
          const children = this.adjacencyList.get(nodeId) || [];
          for (const child of children) {
            if (!visited.has(child)) {
              queue.push({ nodeId: child, level: level + 1 });
            }
          }
        }
        const levelCounts = /* @__PURE__ */ new Map();
        for (const [, level] of levels) {
          levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
        }
        return Math.max(...levelCounts.values(), 0);
      }
      /**
       * Detect cycles using Tarjan's algorithm for strongly connected components
       * Returns arrays of node IDs that form cycles
       */
      detectCycles() {
        const index = /* @__PURE__ */ new Map();
        const lowlink = /* @__PURE__ */ new Map();
        const onStack = /* @__PURE__ */ new Set();
        const stack = [];
        const sccs = [];
        let currentIndex = 0;
        const strongConnect = (nodeId) => {
          index.set(nodeId, currentIndex);
          lowlink.set(nodeId, currentIndex);
          currentIndex++;
          stack.push(nodeId);
          onStack.add(nodeId);
          const neighbors = this.adjacencyList.get(nodeId) || [];
          for (const neighbor of neighbors) {
            if (!index.has(neighbor)) {
              strongConnect(neighbor);
              lowlink.set(nodeId, Math.min(lowlink.get(nodeId), lowlink.get(neighbor)));
            } else if (onStack.has(neighbor)) {
              lowlink.set(nodeId, Math.min(lowlink.get(nodeId), index.get(neighbor)));
            }
          }
          if (lowlink.get(nodeId) === index.get(nodeId)) {
            const scc = [];
            let w;
            do {
              w = stack.pop();
              onStack.delete(w);
              scc.push(w);
            } while (w !== nodeId);
            if (scc.length > 1) {
              sccs.push(scc);
            } else if (scc.length === 1) {
              const selfLoops = this.adjacencyList.get(scc[0]) || [];
              if (selfLoops.includes(scc[0])) {
                sccs.push(scc);
              }
            }
          }
        };
        for (const [nodeId] of this.nodes) {
          if (!index.has(nodeId)) {
            strongConnect(nodeId);
          }
        }
        return sccs;
      }
      /**
       * Check if the graph has any cycles
       */
      hasCycles() {
        return this.detectCycles().length > 0;
      }
      /**
       * Get topological order of nodes (only valid if no cycles)
       * Returns null if cycles exist
       */
      getTopologicalOrder() {
        if (this.hasCycles()) {
          return null;
        }
        const inDegree = /* @__PURE__ */ new Map();
        for (const [nodeId] of this.nodes) {
          inDegree.set(nodeId, 0);
        }
        for (const edge of this.edges) {
          inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
        }
        const queue = [];
        for (const [nodeId, degree] of inDegree) {
          if (degree === 0) {
            queue.push(nodeId);
          }
        }
        const result = [];
        while (queue.length > 0) {
          const current = queue.shift();
          result.push(current);
          const neighbors = this.adjacencyList.get(current) || [];
          for (const neighbor of neighbors) {
            const newDegree = (inDegree.get(neighbor) || 0) - 1;
            inDegree.set(neighbor, newDegree);
            if (newDegree === 0) {
              queue.push(neighbor);
            }
          }
        }
        return result.length === this.nodes.size ? result : null;
      }
      /**
       * Find a path between two nodes
       * Returns null if no path exists
       */
      findPath(from, to) {
        if (!this.nodes.has(from) || !this.nodes.has(to)) {
          return null;
        }
        const visited = /* @__PURE__ */ new Set();
        const parent = /* @__PURE__ */ new Map();
        const queue = [from];
        visited.add(from);
        while (queue.length > 0) {
          const current = queue.shift();
          if (current === to) {
            const path2 = [];
            let node = to;
            while (node !== void 0) {
              path2.unshift(node);
              node = parent.get(node);
            }
            return path2;
          }
          const neighbors = this.adjacencyList.get(current) || [];
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              parent.set(neighbor, current);
              queue.push(neighbor);
            }
          }
        }
        return null;
      }
      /**
       * Find all paths between two nodes
       */
      findAllPaths(from, to, maxPaths = 100) {
        if (!this.nodes.has(from) || !this.nodes.has(to)) {
          return [];
        }
        const paths = [];
        const dfs = (current, path2, visited2) => {
          if (paths.length >= maxPaths) return;
          if (current === to) {
            paths.push([...path2]);
            return;
          }
          const neighbors = this.adjacencyList.get(current) || [];
          for (const neighbor of neighbors) {
            if (!visited2.has(neighbor)) {
              visited2.add(neighbor);
              path2.push(neighbor);
              dfs(neighbor, path2, visited2);
              path2.pop();
              visited2.delete(neighbor);
            }
          }
        };
        const visited = /* @__PURE__ */ new Set([from]);
        dfs(from, [from], visited);
        return paths;
      }
      /**
       * Build the complete dependency graph
       */
      build() {
        const cycles = this.detectCycles();
        const hasCycles = cycles.length > 0;
        const topologicalOrder = hasCycles ? void 0 : this.getTopologicalOrder() ?? void 0;
        return {
          nodes: new Map(this.nodes),
          edges: [...this.edges],
          roots: this.findRoots(),
          leaves: this.findLeaves(),
          depth: this.computeDepth(),
          width: this.computeWidth(),
          hasCycles,
          stronglyConnectedComponents: hasCycles ? cycles : void 0,
          topologicalOrder
        };
      }
      /**
       * Get the number of nodes in the graph
       */
      get nodeCount() {
        return this.nodes.size;
      }
      /**
       * Get the number of edges in the graph
       */
      get edgeCount() {
        return this.edges.length;
      }
      /**
       * Check if a node exists
       */
      hasNode(nodeId) {
        return this.nodes.has(nodeId);
      }
      /**
       * Get a node by ID
       */
      getNode(nodeId) {
        return this.nodes.get(nodeId);
      }
      /**
       * Get all nodes
       */
      getAllNodes() {
        return Array.from(this.nodes.values());
      }
      /**
       * Get all edges
       */
      getAllEdges() {
        return [...this.edges];
      }
      /**
       * Clear the graph
       */
      clear() {
        this.nodes.clear();
        this.edges = [];
        this.adjacencyList.clear();
        this.reverseAdjacencyList.clear();
      }
    };
  }
});
var ProofDecomposer;
var init_decomposer = __esm({
  "src/proof/decomposer.ts"() {
    init_esm_shims();
    init_dependency_graph();
    ProofDecomposer = class {
      statementPatterns;
      dependencyPatterns;
      constructor() {
        this.statementPatterns = this.initializeStatementPatterns();
        this.dependencyPatterns = this.initializeDependencyPatterns();
      }
      /**
       * Initialize patterns for extracting statements from proof text
       */
      initializeStatementPatterns() {
        return [
          // Axiom patterns
          {
            pattern: /^(?:Axiom|Postulate)\s*(?:\d+)?[:\.]?\s*(.+)$/i,
            type: "axiom",
            extractStatement: (m) => m[1].trim()
          },
          // Definition patterns
          {
            pattern: /^(?:Definition|Def\.?)\s*(?:\d+)?[:\.]?\s*(.+)$/i,
            type: "definition",
            extractStatement: (m) => m[1].trim()
          },
          {
            pattern: /^(?:Let|Define)\s+(.+?)(?:\s+be\s+|\s*:=\s*|\s*=\s*)(.+)$/i,
            type: "definition",
            extractStatement: (m) => `${m[1]} be ${m[2]}`.trim()
          },
          // Hypothesis/Assumption patterns
          {
            pattern: /^(?:Assume|Suppose|Given|Hypothesis|Let)\s+(?:that\s+)?(.+)$/i,
            type: "hypothesis",
            extractStatement: (m) => m[1].trim()
          },
          // Lemma patterns
          {
            pattern: /^(?:Lemma|Claim)\s*(?:\d+)?[:\.]?\s*(.+)$/i,
            type: "lemma",
            extractStatement: (m) => m[1].trim()
          },
          // Conclusion patterns
          {
            pattern: /^(?:Therefore|Thus|Hence|So|Consequently|It follows that|We conclude|QED|∴)\s*[,:]?\s*(.+)$/i,
            type: "conclusion",
            extractStatement: (m) => m[1].trim()
          },
          // Derived statement patterns
          {
            pattern: /^(?:By|From|Using|Since)\s+(.+?)[,\s]+(?:we have|we get|we obtain|it follows|this gives)\s+(.+)$/i,
            type: "derived",
            extractStatement: (m) => m[2].trim(),
            extractJustification: (m) => m[1].trim()
          },
          {
            pattern: /^(?:This|Which)\s+(?:implies|gives|yields|means|shows)\s+(?:that\s+)?(.+)$/i,
            type: "derived",
            extractStatement: (m) => m[1].trim()
          },
          // General derived (fallback)
          {
            pattern: /^(.+)$/,
            type: "derived",
            extractStatement: (m) => m[1].trim()
          }
        ];
      }
      /**
       * Initialize patterns for inferring dependencies
       */
      initializeDependencyPatterns() {
        return [
          // Modus ponens: "By X, we have Y" or "From X, Y"
          {
            pattern: /(?:by|from|using)\s+(.+?)(?:,\s*(?:we have|we get|it follows|we obtain)|$)/i,
            inferenceRule: "modus_ponens",
            extractDependencies: (match, statementIds) => {
              const referenced = match[1];
              return this.findMatchingStatements(referenced, statementIds);
            }
          },
          // Substitution: "Substituting X into Y"
          {
            pattern: /substitut(?:e|ing)\s+(.+?)\s+(?:into|in)\s+(.+)/i,
            inferenceRule: "substitution",
            extractDependencies: (match, statementIds) => {
              const deps = [
                ...this.findMatchingStatements(match[1], statementIds),
                ...this.findMatchingStatements(match[2], statementIds)
              ];
              return [...new Set(deps)];
            }
          },
          // Definition expansion: "By definition of X"
          {
            pattern: /(?:by\s+)?(?:the\s+)?definition\s+(?:of\s+)?(.+)/i,
            inferenceRule: "definition_expansion",
            extractDependencies: (match, statementIds) => {
              return this.findMatchingStatements(match[1], statementIds);
            }
          },
          // Contradiction: "contradicts" or "contradiction"
          {
            pattern: /(?:this\s+)?contradicts?\s+(.+)/i,
            inferenceRule: "contradiction",
            extractDependencies: (match, statementIds) => {
              return this.findMatchingStatements(match[1], statementIds);
            }
          },
          // Mathematical induction
          {
            pattern: /by\s+(?:mathematical\s+)?induction/i,
            inferenceRule: "mathematical_induction",
            extractDependencies: () => []
          },
          // Hypothetical syllogism: "Since X implies Y, and Y implies Z"
          {
            pattern: /since\s+(.+?)\s+implies\s+(.+?),\s+and\s+(.+?)\s+implies\s+(.+)/i,
            inferenceRule: "hypothetical_syllogism",
            extractDependencies: (match, statementIds) => {
              const deps = [
                ...this.findMatchingStatements(match[1], statementIds),
                ...this.findMatchingStatements(match[2], statementIds)
              ];
              return [...new Set(deps)];
            }
          }
        ];
      }
      /**
       * Find statements that match a reference
       */
      findMatchingStatements(reference, statementIds) {
        const matches = [];
        const refLower = reference.toLowerCase().trim();
        for (const [statement, id] of statementIds) {
          const stmtLower = statement.toLowerCase();
          if (stmtLower.includes(refLower) || refLower.includes(stmtLower) || this.hasSignificantOverlap(refLower, stmtLower)) {
            matches.push(id);
          }
        }
        return matches;
      }
      /**
       * Check if two strings have significant word overlap
       */
      hasSignificantOverlap(a, b) {
        const wordsA = new Set(a.split(/\s+/).filter((w) => w.length > 2));
        const wordsB = new Set(b.split(/\s+/).filter((w) => w.length > 2));
        if (wordsA.size === 0 || wordsB.size === 0) return false;
        let overlap = 0;
        for (const word of wordsA) {
          if (wordsB.has(word)) overlap++;
        }
        return overlap / Math.min(wordsA.size, wordsB.size) > 0.5;
      }
      /**
       * Decompose a proof into atomic statements
       *
       * @param proof - The proof text or structured steps
       * @param theorem - Optional theorem being proven
       * @returns ProofDecomposition with atoms and dependencies
       */
      decompose(proof, theorem) {
        const id = randomUUID();
        const steps = typeof proof === "string" ? this.parseProofText(proof) : proof;
        const originalProof = typeof proof === "string" ? proof : steps.map((s) => s.content).join("\n");
        const atoms = this.extractStatements(steps);
        const statementIds = /* @__PURE__ */ new Map();
        for (const atom of atoms) {
          statementIds.set(atom.statement, atom.id);
        }
        this.inferDependencies(atoms, steps, statementIds);
        const dependencies = this.buildDependencyGraph(atoms);
        const assumptionChains = this.traceAssumptionChains(atoms, dependencies);
        const gaps = this.detectBasicGaps(atoms, dependencies);
        const implicitAssumptions = this.findImplicitAssumptions(atoms, steps);
        const completeness = this.computeCompleteness(atoms, gaps);
        const rigorLevel = this.assessRigorLevel(atoms, gaps, implicitAssumptions);
        return {
          id,
          originalProof,
          theorem,
          atoms,
          dependencies,
          assumptionChains,
          gaps,
          implicitAssumptions,
          completeness,
          rigorLevel,
          atomCount: atoms.length,
          maxDependencyDepth: dependencies.depth
        };
      }
      /**
       * Parse proof text into structured steps
       */
      parseProofText(text) {
        const sentences = text.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter((s) => s.length > 0);
        return sentences.map((content) => ({ content }));
      }
      /**
       * Extract atomic statements from proof steps
       */
      extractStatements(steps) {
        const atoms = [];
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          const atom = this.classifyStatement(step, i);
          if (atom) {
            atoms.push(atom);
          }
        }
        return atoms;
      }
      /**
       * Classify a proof step into an atomic statement
       */
      classifyStatement(step, stepNumber) {
        const content = step.content.trim();
        if (!content) return null;
        for (const pattern of this.statementPatterns) {
          const match = content.match(pattern.pattern);
          if (match) {
            const statement = pattern.extractStatement(match);
            const justification = pattern.extractJustification?.(match) || step.justification;
            return {
              id: `stmt-${stepNumber + 1}`,
              statement,
              latex: step.latex,
              type: pattern.type,
              justification,
              confidence: this.computeConfidence(pattern.type, justification),
              isExplicit: true,
              sourceLocation: { stepNumber: stepNumber + 1 }
            };
          }
        }
        return {
          id: `stmt-${stepNumber + 1}`,
          statement: content,
          latex: step.latex,
          type: "derived",
          justification: step.justification,
          confidence: 0.7,
          isExplicit: true,
          sourceLocation: { stepNumber: stepNumber + 1 }
        };
      }
      /**
       * Compute confidence based on statement type and justification
       */
      computeConfidence(type, justification) {
        const baseConfidence = {
          axiom: 1,
          definition: 1,
          hypothesis: 1,
          lemma: 0.9,
          derived: 0.8,
          conclusion: 0.85
        };
        let confidence = baseConfidence[type];
        if (justification) {
          confidence = Math.min(1, confidence + 0.1);
        }
        return confidence;
      }
      /**
       * Infer dependencies between statements
       */
      inferDependencies(atoms, steps, statementIds) {
        for (let i = 0; i < atoms.length; i++) {
          const atom = atoms[i];
          const step = steps[i];
          if (atom.type === "axiom" || atom.type === "definition" || atom.type === "hypothesis") {
            continue;
          }
          const fullText = `${step.content} ${step.justification || ""}`;
          const dependencies = [];
          let inferenceRule;
          for (const depPattern of this.dependencyPatterns) {
            const match = fullText.match(depPattern.pattern);
            if (match) {
              const deps = depPattern.extractDependencies(match, statementIds);
              dependencies.push(...deps);
              if (!inferenceRule) {
                inferenceRule = depPattern.inferenceRule;
              }
            }
          }
          if (dependencies.length === 0 && i > 0) {
            for (let j = i - 1; j >= 0; j--) {
              if (atoms[j].type !== "conclusion") {
                dependencies.push(atoms[j].id);
                break;
              }
            }
          }
          if (dependencies.length > 0) {
            atom.derivedFrom = [...new Set(dependencies)];
            atom.usedInferenceRule = inferenceRule || "direct_implication";
          }
        }
      }
      /**
       * Build dependency graph from atoms
       */
      buildDependencyGraph(atoms) {
        const builder = new DependencyGraphBuilder();
        for (const atom of atoms) {
          builder.addStatement(atom);
        }
        for (const atom of atoms) {
          if (atom.derivedFrom) {
            for (const depId of atom.derivedFrom) {
              builder.addDependency(depId, atom.id, "logical", {
                inferenceRule: atom.usedInferenceRule
              });
            }
          }
        }
        return builder.build();
      }
      /**
       * Trace assumption chains from conclusions to axioms
       */
      traceAssumptionChains(atoms, graph) {
        const chains = [];
        const conclusions = atoms.filter((a) => a.type === "conclusion");
        for (const conclusion of conclusions) {
          const assumptions = [];
          const path2 = [];
          const visited = /* @__PURE__ */ new Set();
          const trace = (id) => {
            if (visited.has(id)) return;
            visited.add(id);
            const atom = graph.nodes.get(id);
            if (!atom) return;
            path2.push(id);
            if (atom.type === "axiom" || atom.type === "definition" || atom.type === "hypothesis") {
              assumptions.push(id);
              return;
            }
            if (atom.derivedFrom) {
              for (const depId of atom.derivedFrom) {
                trace(depId);
              }
            }
          };
          trace(conclusion.id);
          chains.push({
            conclusion: conclusion.id,
            assumptions,
            path: path2.reverse(),
            allAssumptionsExplicit: true,
            // Will be updated by AssumptionTracker
            implicitAssumptions: []
          });
        }
        return chains;
      }
      /**
       * Detect basic gaps in the proof
       */
      detectBasicGaps(atoms, graph) {
        const gaps = [];
        let gapCount = 0;
        for (const atom of atoms) {
          if ((atom.type === "derived" || atom.type === "conclusion") && (!atom.derivedFrom || atom.derivedFrom.length === 0)) {
            gaps.push({
              id: `gap-${++gapCount}`,
              type: "unjustified_leap",
              location: {
                from: "unknown",
                to: atom.id
              },
              description: `Statement "${atom.statement.substring(0, 50)}..." lacks explicit justification`,
              severity: atom.type === "conclusion" ? "significant" : "minor",
              suggestedFix: "Add explicit derivation steps or reference to supporting statements"
            });
          }
        }
        const reachable = /* @__PURE__ */ new Set();
        const stack = [...graph.roots];
        while (stack.length > 0) {
          const id = stack.pop();
          if (reachable.has(id)) continue;
          reachable.add(id);
          for (const edge of graph.edges) {
            if (edge.from === id && !reachable.has(edge.to)) {
              stack.push(edge.to);
            }
          }
        }
        for (const atom of atoms) {
          if (!reachable.has(atom.id) && atom.type !== "axiom" && atom.type !== "definition" && atom.type !== "hypothesis") {
            gaps.push({
              id: `gap-${++gapCount}`,
              type: "missing_step",
              location: {
                from: "root",
                to: atom.id
              },
              description: `Statement "${atom.statement.substring(0, 50)}..." is disconnected from the proof structure`,
              severity: "significant",
              suggestedFix: "Connect this statement to the main proof chain"
            });
          }
        }
        return gaps;
      }
      /**
       * Find implicit assumptions in the proof
       */
      findImplicitAssumptions(atoms, steps) {
        const implicitAssumptions = [];
        let count = 0;
        const implicitPatterns = [
          {
            pattern: /(?:clearly|obviously|trivially|it is clear that)/i,
            type: "existence_assumption",
            suggestedFormulation: (text) => `Explicitly state and justify: "${text.substring(0, 50)}..."`
          },
          {
            pattern: /(?:for\s+(?:all|any|every)|∀)\s+([a-zA-Z_]\w*)/i,
            type: "domain_assumption",
            suggestedFormulation: (_text, match) => `Specify the domain of ${match[1]}`
          },
          {
            pattern: /(?:there\s+exists?|∃)\s+([a-zA-Z_]\w*)/i,
            type: "existence_assumption",
            suggestedFormulation: (_text, match) => `Prove existence of ${match[1]} or cite a theorem`
          },
          {
            pattern: /(?:unique|the\s+only)/i,
            type: "uniqueness_assumption",
            suggestedFormulation: () => "Prove uniqueness or cite a uniqueness theorem"
          },
          {
            pattern: /(?:continuous|differentiable|integrable)/i,
            type: "continuity_assumption",
            suggestedFormulation: () => "State continuity/differentiability assumptions explicitly"
          },
          {
            pattern: /(?:finite|bounded)/i,
            type: "finiteness_assumption",
            suggestedFormulation: () => "State finiteness/boundedness assumptions explicitly"
          }
        ];
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          const atom = atoms[i];
          if (!atom) continue;
          for (const { pattern, type, suggestedFormulation } of implicitPatterns) {
            const match = step.content.match(pattern);
            if (match) {
              implicitAssumptions.push({
                id: `impl-${++count}`,
                statement: step.content.substring(0, 100),
                type,
                usedInStep: atom.id,
                shouldBeExplicit: true,
                suggestedFormulation: suggestedFormulation(step.content, match)
              });
              break;
            }
          }
        }
        return implicitAssumptions;
      }
      /**
       * Compute proof completeness score
       */
      computeCompleteness(atoms, gaps) {
        if (atoms.length === 0) return 0;
        let score = 1;
        for (const gap of gaps) {
          switch (gap.severity) {
            case "critical":
              score -= 0.25;
              break;
            case "significant":
              score -= 0.1;
              break;
            case "minor":
              score -= 0.03;
              break;
          }
        }
        const justifiedCount = atoms.filter(
          (a) => a.type === "axiom" || a.type === "definition" || a.type === "hypothesis" || a.derivedFrom && a.derivedFrom.length > 0
        ).length;
        const justificationScore = justifiedCount / atoms.length;
        score = score * 0.7 + justificationScore * 0.3;
        return Math.max(0, Math.min(1, score));
      }
      /**
       * Assess the rigor level of the proof
       */
      assessRigorLevel(atoms, gaps, implicitAssumptions) {
        const criticalGaps = gaps.filter((g) => g.severity === "critical").length;
        const significantGaps = gaps.filter((g) => g.severity === "significant").length;
        const implicitCount = implicitAssumptions.filter((a) => a.shouldBeExplicit).length;
        const allJustified = atoms.every(
          (a) => a.type === "axiom" || a.type === "definition" || a.type === "hypothesis" || a.derivedFrom && a.derivedFrom.length > 0 && a.usedInferenceRule
        );
        if (criticalGaps > 0) return "informal";
        if (significantGaps > 2 || implicitCount > 3) return "informal";
        if (significantGaps > 0 || implicitCount > 1) return "textbook";
        if (!allJustified || implicitCount > 0) return "textbook";
        if (allJustified && implicitCount === 0 && gaps.length === 0) return "rigorous";
        const hasFormalNotation = atoms.some(
          (a) => a.latex && (a.latex.includes("\\forall") || a.latex.includes("\\exists") || a.latex.includes("\\vdash") || a.latex.includes("\\Rightarrow"))
        );
        return hasFormalNotation ? "formal" : "rigorous";
      }
      /**
       * Get decomposition metrics
       */
      computeMetrics(decomposition) {
        const { atoms, dependencies, gaps, implicitAssumptions, completeness } = decomposition;
        const totalDeps = atoms.reduce((sum, a) => sum + (a.derivedFrom?.length || 0), 0);
        const avgDependencies = atoms.length > 0 ? totalDeps / atoms.length : 0;
        return {
          atomCount: atoms.length,
          rootCount: dependencies.roots.length,
          leafCount: dependencies.leaves.length,
          avgDependencies,
          maxDependencyDepth: dependencies.depth,
          completeness,
          gapCount: gaps.length,
          implicitAssumptionCount: implicitAssumptions.length
        };
      }
    };
  }
});

// src/proof/gap-analyzer.ts
var DEFAULT_CONFIG3, GapAnalyzer;
var init_gap_analyzer = __esm({
  "src/proof/gap-analyzer.ts"() {
    init_esm_shims();
    DEFAULT_CONFIG3 = {
      strictness: "standard",
      checkDomainAssumptions: true,
      verifyInferenceRules: true,
      maxLeapDistance: 2
    };
    GapAnalyzer = class {
      config;
      constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG3, ...config };
      }
      /**
       * Analyze a proof decomposition for gaps
       */
      analyzeGaps(decomposition) {
        const { atoms, dependencies } = decomposition;
        const unjustifiedLeaps = this.findUnjustifiedLeaps(atoms, dependencies);
        const missingSteps = this.findMissingSteps(atoms, dependencies);
        const scopeErrors = this.findScopeErrors(atoms);
        const undefinedTerms = this.findUndefinedTerms(atoms);
        const gaps = [...unjustifiedLeaps, ...missingSteps, ...scopeErrors, ...undefinedTerms];
        const implicitAssumptions = this.findImplicitAssumptions(atoms, gaps);
        const unjustifiedSteps = this.findUnjustifiedSteps(atoms);
        const suggestions = this.generateSuggestions(gaps, implicitAssumptions, unjustifiedSteps);
        const completeness = this.computeCompleteness(atoms, gaps, implicitAssumptions);
        return {
          completeness,
          gaps,
          implicitAssumptions,
          unjustifiedSteps,
          suggestions
        };
      }
      /**
       * Check if a transition between two statements is valid
       */
      isValidTransition(from, to) {
        if (to.type === "axiom" || to.type === "definition" || to.type === "hypothesis") {
          return { isValid: true };
        }
        if (to.derivedFrom && to.derivedFrom.includes(from.id)) {
          if (to.usedInferenceRule && this.config.verifyInferenceRules) {
            const ruleCheck = this.verifyInferenceRule(from, to);
            if (!ruleCheck.isValid) {
              return ruleCheck;
            }
          }
          return { isValid: true };
        }
        const impliedConnection = this.checkImpliedConnection(from, to);
        if (impliedConnection.isValid) {
          return impliedConnection;
        }
        return {
          isValid: false,
          reason: `No clear logical connection from "${from.statement.substring(0, 30)}..." to "${to.statement.substring(0, 30)}..."`,
          suggestedFix: "Add explicit derivation step or justification"
        };
      }
      /**
       * Verify that an inference rule is correctly applied
       */
      verifyInferenceRule(from, to) {
        const rule = to.usedInferenceRule;
        if (!rule) return { isValid: true };
        const fromText = from.statement.toLowerCase();
        const toText = to.statement.toLowerCase();
        switch (rule) {
          case "modus_ponens":
            if (fromText.includes("if") && fromText.includes("then")) {
              return { isValid: true };
            }
            if (fromText.includes("implies") || fromText.includes("\u21D2")) {
              return { isValid: true };
            }
            break;
          case "modus_tollens":
            if (toText.includes("not") || toText.includes("\xAC") || toText.includes("false")) {
              return { isValid: true };
            }
            break;
          case "contradiction":
            if (toText.includes("contradiction") || toText.includes("impossible") || toText.includes("false")) {
              return { isValid: true };
            }
            break;
          case "substitution":
            if (fromText.includes("=") || fromText.includes("equals")) {
              return { isValid: true };
            }
            break;
          case "universal_instantiation":
            if (fromText.includes("for all") || fromText.includes("\u2200") || fromText.includes("every")) {
              return { isValid: true };
            }
            break;
          case "existential_generalization":
            if (toText.includes("exists") || toText.includes("\u2203") || toText.includes("there is")) {
              return { isValid: true };
            }
            break;
          case "mathematical_induction":
            return { isValid: true };
          default:
            return { isValid: true };
        }
        return {
          isValid: true,
          // Don't be too strict
          reason: `Inference rule ${rule} application may need review`
        };
      }
      /**
       * Check for implied logical connection between statements
       */
      checkImpliedConnection(from, to) {
        const fromWords = new Set(from.statement.toLowerCase().split(/\s+/));
        const toWords = new Set(to.statement.toLowerCase().split(/\s+/));
        const meaningfulWords = [...fromWords].filter(
          (w) => w.length > 3 && toWords.has(w)
        );
        if (meaningfulWords.length >= 2) {
          return {
            isValid: true,
            reason: "Implied connection through shared concepts"
          };
        }
        if (to.justification && to.justification.toLowerCase().includes(from.id.toLowerCase())) {
          return { isValid: true };
        }
        return { isValid: false };
      }
      /**
       * Find unjustified leaps in reasoning
       */
      findUnjustifiedLeaps(atoms, graph) {
        const gaps = [];
        let gapId = 0;
        for (const atom of atoms) {
          if (atom.type === "axiom" || atom.type === "definition" || atom.type === "hypothesis") {
            continue;
          }
          if (atom.type === "derived" || atom.type === "conclusion" || atom.type === "lemma") {
            if (!atom.derivedFrom || atom.derivedFrom.length === 0) {
              gaps.push({
                id: `gap-leap-${++gapId}`,
                type: "unjustified_leap",
                location: { from: "unknown", to: atom.id },
                description: `Statement "${atom.statement.substring(0, 50)}..." appears without justification`,
                severity: this.assessGapSeverity(atom),
                suggestedFix: this.suggestJustification(atom, atoms)
              });
              continue;
            }
            if (this.config.strictness !== "lenient") {
              const leapDistance = this.computeLeapDistance(atom, graph);
              if (leapDistance > this.config.maxLeapDistance) {
                gaps.push({
                  id: `gap-leap-${++gapId}`,
                  type: "unjustified_leap",
                  location: {
                    from: atom.derivedFrom[0],
                    to: atom.id
                  },
                  description: `Large logical leap (distance ${leapDistance}) to reach this statement`,
                  severity: "significant",
                  suggestedFix: "Add intermediate steps to bridge the logical gap"
                });
              }
            }
          }
        }
        return gaps;
      }
      /**
       * Compute the "leap distance" - how many implicit steps are skipped
       */
      computeLeapDistance(atom, graph) {
        if (!atom.derivedFrom || atom.derivedFrom.length === 0) return 0;
        const deps = atom.derivedFrom.map((id) => graph.nodes.get(id)).filter(Boolean);
        if (deps.length === 0) return 0;
        const atomComplexity = this.estimateStatementComplexity(atom.statement);
        const avgDepComplexity = deps.reduce((sum, d) => sum + this.estimateStatementComplexity(d.statement), 0) / deps.length;
        return Math.max(0, Math.floor((atomComplexity - avgDepComplexity) / 10));
      }
      /**
       * Estimate statement complexity based on length and symbols
       */
      estimateStatementComplexity(statement) {
        let complexity = statement.length;
        const mathSymbols = /[∀∃∈∉⊆⊇∩∪∧∨¬⇒⇔∫∑∏√≤≥≠±∞]/g;
        const matches = statement.match(mathSymbols);
        if (matches) complexity += matches.length * 5;
        const nestingLevel = (statement.match(/[\(\[\{]/g) || []).length;
        complexity += nestingLevel * 3;
        return complexity;
      }
      /**
       * Find missing intermediate steps
       */
      findMissingSteps(atoms, graph) {
        const gaps = [];
        let gapId = 0;
        for (const atom of atoms) {
          if (!atom.derivedFrom) continue;
          for (const depId of atom.derivedFrom) {
            const dep = graph.nodes.get(depId);
            if (!dep) continue;
            const validation = this.isValidTransition(dep, atom);
            if (!validation.isValid) {
              gaps.push({
                id: `gap-step-${++gapId}`,
                type: "missing_step",
                location: { from: depId, to: atom.id },
                description: validation.reason || "Missing intermediate step",
                severity: "minor",
                suggestedFix: validation.suggestedFix
              });
            }
          }
        }
        if (graph.topologicalOrder) {
          for (let i = 1; i < graph.topologicalOrder.length; i++) {
            const prev = graph.nodes.get(graph.topologicalOrder[i - 1]);
            const curr = graph.nodes.get(graph.topologicalOrder[i]);
            if (prev && curr && curr.derivedFrom?.includes(prev.id)) {
              if (this.needsIntermediateStep(prev, curr)) {
                gaps.push({
                  id: `gap-step-${++gapId}`,
                  type: "missing_step",
                  location: { from: prev.id, to: curr.id },
                  description: `Step from "${prev.statement.substring(0, 30)}..." to "${curr.statement.substring(0, 30)}..." may need clarification`,
                  severity: "minor",
                  suggestedFix: "Consider adding an intermediate derivation step"
                });
              }
            }
          }
        }
        return gaps;
      }
      /**
       * Check if an intermediate step is needed between two statements
       */
      needsIntermediateStep(from, to) {
        if (this.config.strictness === "lenient") return false;
        const fromSymbols = this.extractMathSymbols(from.statement);
        const toSymbols = this.extractMathSymbols(to.statement);
        const commonSymbols = fromSymbols.filter((s) => toSymbols.includes(s));
        if (commonSymbols.length === 0 && fromSymbols.length > 0 && toSymbols.length > 0) {
          return true;
        }
        if (this.config.strictness === "strict") {
          const lengthRatio = to.statement.length / Math.max(1, from.statement.length);
          if (lengthRatio > 2 || lengthRatio < 0.5) {
            return true;
          }
        }
        return false;
      }
      /**
       * Extract mathematical symbols from a statement
       */
      extractMathSymbols(statement) {
        const symbols = [];
        const vars = statement.match(/\b[a-zA-Z](?:_\d+)?\b/g);
        if (vars) symbols.push(...vars);
        const ops = statement.match(/[+\-*/=<>≤≥≠∈∉⊆⊇]/g);
        if (ops) symbols.push(...ops);
        return symbols;
      }
      /**
       * Find scope errors (variables used out of scope)
       */
      findScopeErrors(atoms) {
        const gaps = [];
        let gapId = 0;
        const variableScope = /* @__PURE__ */ new Map();
        for (const atom of atoms) {
          const introMatch = atom.statement.match(
            /(?:let|for\s+(?:all|any|every)|∀)\s+([a-zA-Z](?:_\d+)?)/i
          );
          if (introMatch) {
            variableScope.set(introMatch[1], atom.id);
          }
          const varMatches = atom.statement.match(/\b([a-zA-Z](?:_\d+)?)\b/g);
          if (varMatches) {
            for (const v of varMatches) {
              if (["a", "an", "the", "if", "is", "or", "be", "to", "in", "of"].includes(v.toLowerCase())) {
                continue;
              }
              if (v.length === 1 && !variableScope.has(v) && atom.type === "derived") {
                const previouslyUsed = atoms.some(
                  (a) => a.id !== atom.id && atoms.indexOf(a) < atoms.indexOf(atom) && a.statement.includes(v)
                );
                if (!previouslyUsed) {
                  gaps.push({
                    id: `gap-scope-${++gapId}`,
                    type: "scope_error",
                    location: { from: "introduction", to: atom.id },
                    description: `Variable "${v}" appears without explicit introduction`,
                    severity: "minor",
                    suggestedFix: `Introduce ${v} with "Let ${v}..." or specify its domain`
                  });
                }
              }
            }
          }
        }
        return gaps;
      }
      /**
       * Find undefined terms
       */
      findUndefinedTerms(atoms) {
        const gaps = [];
        let gapId = 0;
        const definedTerms = /* @__PURE__ */ new Set();
        for (const atom of atoms) {
          if (atom.type === "definition") {
            const defMatch = atom.statement.match(
              /(?:define|let)\s+(\w+)|(\w+)\s+(?:is|are|be)\s+defined/i
            );
            if (defMatch) {
              definedTerms.add((defMatch[1] || defMatch[2]).toLowerCase());
            }
          }
        }
        for (const atom of atoms) {
          const byDefMatch = atom.statement.match(/by\s+(?:the\s+)?definition\s+of\s+(\w+)/i);
          if (byDefMatch) {
            const term = byDefMatch[1].toLowerCase();
            if (!definedTerms.has(term) && !this.isStandardMathTerm(term)) {
              gaps.push({
                id: `gap-undef-${++gapId}`,
                type: "undefined_term",
                location: { from: "definition", to: atom.id },
                description: `Term "${byDefMatch[1]}" is used but not defined`,
                severity: "significant",
                suggestedFix: `Add a definition for "${byDefMatch[1]}"`
              });
            }
          }
        }
        return gaps;
      }
      /**
       * Check if a term is a standard mathematical term
       */
      isStandardMathTerm(term) {
        const standardTerms = /* @__PURE__ */ new Set([
          "integer",
          "integers",
          "real",
          "reals",
          "natural",
          "naturals",
          "rational",
          "rationals",
          "complex",
          "prime",
          "even",
          "odd",
          "positive",
          "negative",
          "zero",
          "function",
          "continuous",
          "differentiable",
          "derivative",
          "integral",
          "limit",
          "sequence",
          "series",
          "set",
          "subset",
          "superset",
          "union",
          "intersection",
          "element",
          "member",
          "domain",
          "range",
          "codomain",
          "bijection",
          "injection",
          "surjection",
          "isomorphism",
          "homomorphism"
        ]);
        return standardTerms.has(term);
      }
      /**
       * Find implicit assumptions
       */
      findImplicitAssumptions(atoms, gaps) {
        const implicitAssumptions = [];
        let count = 0;
        for (const gap of gaps) {
          if (gap.type === "implicit_assumption") {
            implicitAssumptions.push({
              id: `impl-${++count}`,
              statement: gap.description,
              type: "existence_assumption",
              usedInStep: gap.location.to,
              shouldBeExplicit: gap.severity !== "minor",
              suggestedFormulation: gap.suggestedFix || "Make assumption explicit"
            });
          }
        }
        for (const atom of atoms) {
          if (/\/\s*([a-zA-Z_]\w*|\([^)]+\))/.test(atom.statement)) {
            implicitAssumptions.push({
              id: `impl-${++count}`,
              statement: "Division operation implies non-zero divisor",
              type: "domain_assumption",
              usedInStep: atom.id,
              shouldBeExplicit: true,
              suggestedFormulation: "State that the divisor is non-zero"
            });
          }
          if (/√|\\sqrt/.test(atom.statement)) {
            implicitAssumptions.push({
              id: `impl-${++count}`,
              statement: "Square root implies non-negative argument",
              type: "domain_assumption",
              usedInStep: atom.id,
              shouldBeExplicit: true,
              suggestedFormulation: "State that the argument is non-negative"
            });
          }
          if (/log|ln|\\log/.test(atom.statement)) {
            implicitAssumptions.push({
              id: `impl-${++count}`,
              statement: "Logarithm implies positive argument",
              type: "domain_assumption",
              usedInStep: atom.id,
              shouldBeExplicit: true,
              suggestedFormulation: "State that the argument is positive"
            });
          }
        }
        return implicitAssumptions;
      }
      /**
       * Find unjustified steps (steps with low confidence)
       */
      findUnjustifiedSteps(atoms) {
        return atoms.filter(
          (a) => (a.type === "derived" || a.type === "conclusion") && (!a.derivedFrom || a.derivedFrom.length === 0) && !a.justification
        ).map((a) => a.id);
      }
      /**
       * Assess severity of a gap
       */
      assessGapSeverity(atom) {
        if (atom.type === "conclusion") return "critical";
        if (atom.type === "lemma") return "significant";
        return "minor";
      }
      /**
       * Suggest justification for an unjustified statement
       */
      suggestJustification(atom, allAtoms) {
        const related = allAtoms.filter((a) => {
          if (a.id === atom.id) return false;
          const overlap = this.computeWordOverlap(a.statement, atom.statement);
          return overlap > 0.3;
        });
        if (related.length > 0) {
          const relatedIds = related.map((r) => r.id).join(", ");
          return `Consider deriving from: ${relatedIds}`;
        }
        return "Add explicit justification or reference to supporting statements";
      }
      /**
       * Compute word overlap between two statements
       */
      computeWordOverlap(a, b) {
        const wordsA = new Set(
          a.toLowerCase().split(/\s+/).filter((w) => w.length > 2)
        );
        const wordsB = new Set(
          b.toLowerCase().split(/\s+/).filter((w) => w.length > 2)
        );
        if (wordsA.size === 0 || wordsB.size === 0) return 0;
        let overlap = 0;
        for (const w of wordsA) {
          if (wordsB.has(w)) overlap++;
        }
        return overlap / Math.max(wordsA.size, wordsB.size);
      }
      /**
       * Generate improvement suggestions
       */
      generateSuggestions(gaps, implicitAssumptions, unjustifiedSteps) {
        const suggestions = [];
        const criticalGaps = gaps.filter((g) => g.severity === "critical");
        const significantGaps = gaps.filter((g) => g.severity === "significant");
        const minorGaps = gaps.filter((g) => g.severity === "minor");
        if (criticalGaps.length > 0) {
          suggestions.push(
            `CRITICAL: Address ${criticalGaps.length} critical gap(s) in the proof - conclusions lack proper justification`
          );
        }
        if (significantGaps.length > 0) {
          suggestions.push(
            `Add intermediate steps to bridge ${significantGaps.length} significant logical gap(s)`
          );
        }
        if (implicitAssumptions.filter((a) => a.shouldBeExplicit).length > 0) {
          suggestions.push(
            `Make ${implicitAssumptions.filter((a) => a.shouldBeExplicit).length} implicit assumption(s) explicit`
          );
        }
        if (unjustifiedSteps.length > 0) {
          suggestions.push(`Provide justification for ${unjustifiedSteps.length} unjustified step(s)`);
        }
        if (minorGaps.length > 0 && this.config.strictness !== "lenient") {
          suggestions.push(
            `Consider clarifying ${minorGaps.length} minor gap(s) for improved rigor`
          );
        }
        if (suggestions.length === 0) {
          suggestions.push("The proof appears complete with no significant gaps identified");
        }
        return suggestions;
      }
      /**
       * Compute overall completeness score
       */
      computeCompleteness(atoms, gaps, implicitAssumptions) {
        if (atoms.length === 0) return 0;
        let score = 1;
        for (const gap of gaps) {
          switch (gap.severity) {
            case "critical":
              score -= 0.25;
              break;
            case "significant":
              score -= 0.1;
              break;
            case "minor":
              score -= 0.02;
              break;
          }
        }
        const criticalImplicit = implicitAssumptions.filter((a) => a.shouldBeExplicit).length;
        score -= criticalImplicit * 0.05;
        return Math.max(0, Math.min(1, score));
      }
    };
  }
});

// src/proof/assumption-tracker.ts
var AssumptionTracker;
var init_assumption_tracker = __esm({
  "src/proof/assumption-tracker.ts"() {
    init_esm_shims();
    AssumptionTracker = class {
      /**
       * Trace a conclusion back to its foundational assumptions
       *
       * @param conclusionId - The statement ID to trace
       * @param graph - The dependency graph
       * @returns AssumptionChain with full derivation path
       */
      traceToAssumptions(conclusionId, graph) {
        const assumptions = [];
        const path2 = [];
        const implicitAssumptions = [];
        const visited = /* @__PURE__ */ new Set();
        const trace = (id) => {
          if (visited.has(id)) return;
          visited.add(id);
          const node = graph.nodes.get(id);
          if (!node) return;
          path2.push(id);
          if (node.type === "axiom" || node.type === "definition" || node.type === "hypothesis") {
            assumptions.push(id);
            return;
          }
          if (node.derivedFrom && node.derivedFrom.length > 0) {
            for (const depId of node.derivedFrom) {
              trace(depId);
            }
          } else {
            implicitAssumptions.push({
              id: `impl-trace-${id}`,
              statement: node.statement,
              type: "existence_assumption",
              usedInStep: id,
              shouldBeExplicit: true,
              suggestedFormulation: `Make explicit: "${node.statement.substring(0, 50)}..."`
            });
          }
        };
        trace(conclusionId);
        const allAssumptionsExplicit = implicitAssumptions.length === 0;
        return {
          conclusion: conclusionId,
          assumptions: [...new Set(assumptions)],
          path: path2.reverse(),
          // Start from assumptions, end at conclusion
          allAssumptionsExplicit,
          implicitAssumptions
        };
      }
      /**
       * Perform comprehensive assumption analysis
       *
       * @param decomposition - The proof decomposition to analyze
       * @returns AssumptionAnalysis with detailed findings
       */
      analyzeAssumptions(decomposition) {
        const { atoms, dependencies } = decomposition;
        const explicitAssumptions = atoms.filter(
          (a) => a.type === "axiom" || a.type === "definition" || a.type === "hypothesis"
        );
        const allImplicitAssumptions = [];
        const conclusionDependencies = /* @__PURE__ */ new Map();
        const conclusions = atoms.filter((a) => a.type === "conclusion");
        for (const conclusion of conclusions) {
          const chain = this.traceToAssumptions(conclusion.id, dependencies);
          conclusionDependencies.set(conclusion.id, chain.assumptions);
          allImplicitAssumptions.push(...chain.implicitAssumptions);
        }
        if (conclusions.length === 0) {
          for (const leafId of dependencies.leaves) {
            const chain = this.traceToAssumptions(leafId, dependencies);
            conclusionDependencies.set(leafId, chain.assumptions);
            allImplicitAssumptions.push(...chain.implicitAssumptions);
          }
        }
        const usedAssumptions = /* @__PURE__ */ new Set();
        for (const deps of conclusionDependencies.values()) {
          for (const dep of deps) {
            usedAssumptions.add(dep);
          }
        }
        const unusedAssumptions = explicitAssumptions.filter((a) => !usedAssumptions.has(a.id)).map((a) => a.id);
        const minimalSets = this.findMinimalAssumptions(conclusionDependencies, dependencies);
        const uniqueImplicit = this.deduplicateImplicit(allImplicitAssumptions);
        return {
          explicitAssumptions,
          implicitAssumptions: uniqueImplicit,
          unusedAssumptions,
          conclusionDependencies,
          minimalSets
        };
      }
      /**
       * Find minimal sets of assumptions needed for each conclusion
       *
       * Uses a greedy approach to find approximately minimal sets.
       * For exact minimal sets, a SAT solver would be needed.
       */
      findMinimalAssumptions(conclusionDependencies, graph) {
        const minimalSets = /* @__PURE__ */ new Map();
        for (const [conclusion, assumptions] of conclusionDependencies) {
          const minimal = this.computeMinimalSet(conclusion, assumptions, graph);
          minimalSets.set(conclusion, minimal);
        }
        return minimalSets;
      }
      /**
       * Compute a minimal assumption set for a conclusion
       *
       * Uses backward elimination: try removing each assumption and
       * check if the conclusion is still reachable.
       */
      computeMinimalSet(conclusion, assumptions, graph) {
        if (assumptions.length <= 1) return [...assumptions];
        let current = [...assumptions];
        for (let i = 0; i < current.length; i++) {
          const testSet = [...current.slice(0, i), ...current.slice(i + 1)];
          if (this.isReachable(testSet, conclusion, graph)) {
            current = testSet;
            i--;
          }
        }
        return current;
      }
      /**
       * Check if a conclusion is reachable from a set of assumptions
       */
      isReachable(assumptions, conclusion, graph) {
        const reachable = new Set(assumptions);
        let changed = true;
        while (changed) {
          changed = false;
          for (const [id, node] of graph.nodes) {
            if (reachable.has(id)) continue;
            if (node.derivedFrom && node.derivedFrom.length > 0) {
              const allDepsReachable = node.derivedFrom.every((d) => reachable.has(d));
              if (allDepsReachable) {
                reachable.add(id);
                changed = true;
                if (id === conclusion) return true;
              }
            }
          }
        }
        return reachable.has(conclusion);
      }
      /**
       * Find assumptions that are not used in any derivation
       */
      findUnusedAssumptions(decomposition) {
        const { atoms, dependencies } = decomposition;
        const assumptionIds = new Set(
          atoms.filter((a) => a.type === "axiom" || a.type === "definition" || a.type === "hypothesis").map((a) => a.id)
        );
        const referenced = /* @__PURE__ */ new Set();
        for (const atom of atoms) {
          if (atom.derivedFrom) {
            for (const depId of atom.derivedFrom) {
              referenced.add(depId);
            }
          }
        }
        for (const edge of dependencies.edges) {
          referenced.add(edge.from);
        }
        return [...assumptionIds].filter((id) => !referenced.has(id));
      }
      /**
       * Check if assumptions are properly discharged in proof by contradiction
       *
       * In proof by contradiction, we assume ¬P to derive a contradiction,
       * then discharge ¬P to conclude P.
       */
      checkAssumptionDischarge(decomposition) {
        const { atoms } = decomposition;
        const statuses = [];
        const hypotheticals = atoms.filter((a) => a.type === "hypothesis");
        const contradictions = atoms.filter(
          (a) => a.statement.toLowerCase().includes("contradiction") || a.statement.includes("\u22A5") || a.usedInferenceRule === "contradiction"
        );
        for (const hyp of hypotheticals) {
          const isDischargedByContradiction = contradictions.some(
            (c) => c.derivedFrom?.some((d) => this.dependsOn(d, hyp.id, decomposition.dependencies))
          );
          if (isDischargedByContradiction) {
            statuses.push({
              assumptionId: hyp.id,
              isDischarged: true,
              dischargedAt: contradictions[0]?.id,
              dischargeReason: "Used in proof by contradiction"
            });
          } else {
            const conclusions = atoms.filter((a) => a.type === "conclusion");
            const impliesDischarged = conclusions.some(
              (c) => c.statement.toLowerCase().includes("implies") || c.statement.includes("\u21D2") || c.statement.includes("\u2192")
            );
            if (impliesDischarged) {
              statuses.push({
                assumptionId: hyp.id,
                isDischarged: true,
                dischargedAt: conclusions[0]?.id,
                dischargeReason: "Used in implication introduction"
              });
            } else {
              statuses.push({
                assumptionId: hyp.id,
                isDischarged: false,
                dischargeReason: "Hypothesis not discharged - may need attention"
              });
            }
          }
        }
        return statuses;
      }
      /**
       * Check if statement A depends on statement B (transitively)
       */
      dependsOn(aId, bId, graph) {
        const visited = /* @__PURE__ */ new Set();
        const check = (id) => {
          if (id === bId) return true;
          if (visited.has(id)) return false;
          visited.add(id);
          const node = graph.nodes.get(id);
          if (!node || !node.derivedFrom) return false;
          return node.derivedFrom.some((depId) => check(depId));
        };
        return check(aId);
      }
      /**
       * Get the dependency chain for a specific assumption
       *
       * Shows which statements depend on this assumption.
       */
      getAssumptionImpact(assumptionId, graph) {
        const dependents = [];
        const visited = /* @__PURE__ */ new Set();
        const queue = [assumptionId];
        while (queue.length > 0) {
          const current = queue.shift();
          if (visited.has(current)) continue;
          visited.add(current);
          for (const [id, node] of graph.nodes) {
            if (node.derivedFrom?.includes(current) && !visited.has(id)) {
              dependents.push(id);
              queue.push(id);
            }
          }
        }
        return dependents;
      }
      /**
       * Deduplicate implicit assumptions based on content similarity
       */
      deduplicateImplicit(assumptions) {
        const seen = /* @__PURE__ */ new Map();
        for (const assumption of assumptions) {
          const key = `${assumption.type}:${assumption.statement.toLowerCase().trim()}`;
          if (!seen.has(key)) {
            seen.set(key, assumption);
          }
        }
        return [...seen.values()];
      }
      /**
       * Suggest how to strengthen a proof by making assumptions explicit
       */
      getSuggestions(analysis) {
        const suggestions = [];
        if (analysis.unusedAssumptions.length > 0) {
          suggestions.push(
            `Consider removing ${analysis.unusedAssumptions.length} unused assumption(s): ${analysis.unusedAssumptions.join(", ")}`
          );
        }
        const criticalImplicit = analysis.implicitAssumptions.filter((a) => a.shouldBeExplicit);
        if (criticalImplicit.length > 0) {
          suggestions.push(
            `Make ${criticalImplicit.length} implicit assumption(s) explicit for improved rigor`
          );
          for (const imp of criticalImplicit.slice(0, 3)) {
            suggestions.push(`  - ${imp.suggestedFormulation}`);
          }
        }
        for (const [conclusion, minimal] of analysis.minimalSets) {
          const full = analysis.conclusionDependencies.get(conclusion) || [];
          if (minimal.length < full.length) {
            const redundant = full.filter((a) => !minimal.includes(a));
            if (redundant.length > 0) {
              suggestions.push(
                `For conclusion ${conclusion}: ${redundant.length} assumption(s) may be redundant`
              );
            }
          }
        }
        if (suggestions.length === 0) {
          suggestions.push("Assumption structure appears sound");
        }
        return suggestions;
      }
      /**
       * Validate the assumption structure of a proof
       *
       * Returns true if the proof has a valid assumption structure:
       * - At least one foundational assumption
       * - All conclusions traceable to assumptions
       * - No circular dependencies involving assumptions
       */
      validateStructure(decomposition) {
        const issues = [];
        const { atoms, dependencies } = decomposition;
        const foundations = atoms.filter(
          (a) => a.type === "axiom" || a.type === "definition" || a.type === "hypothesis"
        );
        if (foundations.length === 0) {
          issues.push("No foundational assumptions (axioms, definitions, or hypotheses) found");
        }
        for (const rootId of dependencies.roots) {
          const root = dependencies.nodes.get(rootId);
          if (root && root.type !== "axiom" && root.type !== "definition" && root.type !== "hypothesis") {
            issues.push(
              `Root statement "${root.statement.substring(0, 30)}..." is not a foundational type`
            );
          }
        }
        if (dependencies.hasCycles) {
          const cycleNodes = new Set(
            (dependencies.stronglyConnectedComponents || []).filter((scc) => scc.length > 1).flat()
          );
          for (const foundation of foundations) {
            if (cycleNodes.has(foundation.id)) {
              issues.push(
                `Assumption "${foundation.statement.substring(0, 30)}..." is involved in circular reasoning`
              );
            }
          }
        }
        const conclusions = atoms.filter((a) => a.type === "conclusion");
        for (const conclusion of conclusions) {
          const chain = this.traceToAssumptions(conclusion.id, dependencies);
          if (chain.assumptions.length === 0 && !chain.allAssumptionsExplicit) {
            issues.push(
              `Conclusion "${conclusion.statement.substring(0, 30)}..." cannot be traced to any assumption`
            );
          }
        }
        return {
          isValid: issues.length === 0,
          issues
        };
      }
    };
  }
});

// src/proof/inconsistency-detector.ts
var DEFAULT_CONFIG4, InconsistencyDetector;
var init_inconsistency_detector = __esm({
  "src/proof/inconsistency-detector.ts"() {
    init_esm_shims();
    DEFAULT_CONFIG4 = {
      strictTyping: true,
      checkDomains: true,
      checkQuantifiers: true,
      maxPairwiseComparisons: 1e3
    };
    InconsistencyDetector = class {
      config;
      contradictionPatterns;
      constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG4, ...config };
        this.contradictionPatterns = this.initializePatterns();
      }
      /**
       * Initialize contradiction patterns for syntactic matching
       */
      initializePatterns() {
        return [
          // Inequality contradictions
          {
            positive: /(\w+)\s*>\s*0/,
            negative: /(\w+)\s*(?:<=|≤)\s*0/,
            description: "Positive and non-positive contradiction"
          },
          {
            positive: /(\w+)\s*<\s*0/,
            negative: /(\w+)\s*(?:>=|≥)\s*0/,
            description: "Negative and non-negative contradiction"
          },
          {
            positive: /(\w+)\s*=\s*0/,
            negative: /(\w+)\s*(?:!=|≠|<>)\s*0/,
            description: "Zero and non-zero contradiction"
          },
          // Boolean contradictions
          {
            positive: /(\w+)\s+is\s+true/i,
            negative: /(\w+)\s+is\s+false/i,
            description: "True and false contradiction"
          },
          // Property contradictions
          {
            positive: /(\w+)\s+is\s+even/i,
            negative: /(\w+)\s+is\s+odd/i,
            description: "Even and odd contradiction"
          },
          {
            positive: /(\w+)\s+is\s+positive/i,
            negative: /(\w+)\s+is\s+(?:negative|non-positive)/i,
            description: "Positive property contradiction"
          },
          {
            positive: /(\w+)\s+is\s+rational/i,
            negative: /(\w+)\s+is\s+irrational/i,
            description: "Rational and irrational contradiction"
          },
          {
            positive: /(\w+)\s+is\s+finite/i,
            negative: /(\w+)\s+is\s+infinite/i,
            description: "Finite and infinite contradiction"
          },
          // Existence contradictions
          {
            positive: /(?:there\s+)?exists?\s+(\w+)/i,
            negative: /(?:no|does\s+not\s+exist|cannot\s+exist)\s+(\w+)/i,
            description: "Existence contradiction"
          }
        ];
      }
      /**
       * Analyze a proof decomposition for inconsistencies
       */
      analyze(decomposition) {
        const { atoms, dependencies } = decomposition;
        const inconsistencies = [];
        let inconsistencyCount = 0;
        const contradictions = this.detectContradictions(atoms);
        inconsistencies.push(
          ...contradictions.map((c) => ({
            ...c,
            id: `inc-${++inconsistencyCount}`
          }))
        );
        if (this.config.strictTyping) {
          const typeMismatches = this.detectTypeMismatches(atoms);
          inconsistencies.push(
            ...typeMismatches.map((t) => ({
              ...t,
              id: `inc-${++inconsistencyCount}`
            }))
          );
        }
        if (this.config.checkDomains) {
          const domainViolations = this.detectDomainViolations(atoms);
          inconsistencies.push(
            ...domainViolations.map((d) => ({
              ...d,
              id: `inc-${++inconsistencyCount}`
            }))
          );
        }
        const undefinedOps = this.detectUndefinedOperations(atoms);
        inconsistencies.push(
          ...undefinedOps.map((u) => ({
            ...u,
            id: `inc-${++inconsistencyCount}`
          }))
        );
        const axiomConflicts = this.detectAxiomConflicts(atoms);
        inconsistencies.push(
          ...axiomConflicts.map((a) => ({
            ...a,
            id: `inc-${++inconsistencyCount}`
          }))
        );
        if (this.config.checkQuantifiers) {
          const quantifierErrors = this.detectQuantifierErrors(atoms, dependencies);
          inconsistencies.push(
            ...quantifierErrors.map((q) => ({
              ...q,
              id: `inc-${++inconsistencyCount}`
            }))
          );
        }
        return inconsistencies;
      }
      /**
       * Detect direct contradictions (P and ¬P)
       */
      detectContradictions(atoms) {
        const contradictions = [];
        const limit = Math.min(atoms.length, Math.sqrt(this.config.maxPairwiseComparisons));
        for (let i = 0; i < Math.min(atoms.length, limit); i++) {
          for (let j = i + 1; j < Math.min(atoms.length, limit); j++) {
            const stmtA = atoms[i];
            const stmtB = atoms[j];
            if (this.isSyntacticNegation(stmtA.statement, stmtB.statement)) {
              contradictions.push({
                type: "direct_contradiction",
                involvedStatements: [stmtA.id, stmtB.id],
                explanation: `Statement "${stmtA.statement.substring(0, 40)}..." directly contradicts "${stmtB.statement.substring(0, 40)}..."`,
                severity: "critical",
                suggestedResolution: "Review the derivation of both statements to find the error"
              });
            }
            for (const pattern of this.contradictionPatterns) {
              const matchA = stmtA.statement.match(pattern.positive);
              const matchB = stmtB.statement.match(pattern.negative);
              if (matchA && matchB && matchA[1] === matchB[1]) {
                contradictions.push({
                  type: "direct_contradiction",
                  involvedStatements: [stmtA.id, stmtB.id],
                  explanation: `${pattern.description}: "${matchA[1]}" has conflicting properties`,
                  severity: "critical",
                  suggestedResolution: "Check the assumptions about the variable"
                });
              }
              const matchA2 = stmtA.statement.match(pattern.negative);
              const matchB2 = stmtB.statement.match(pattern.positive);
              if (matchA2 && matchB2 && matchA2[1] === matchB2[1]) {
                contradictions.push({
                  type: "direct_contradiction",
                  involvedStatements: [stmtA.id, stmtB.id],
                  explanation: `${pattern.description}: "${matchA2[1]}" has conflicting properties`,
                  severity: "critical",
                  suggestedResolution: "Check the assumptions about the variable"
                });
              }
            }
          }
        }
        return contradictions;
      }
      /**
       * Check if two statements are syntactic negations
       */
      isSyntacticNegation(a, b) {
        const normalA = a.toLowerCase().trim();
        const normalB = b.toLowerCase().trim();
        if (normalB === `not ${normalA}` || normalA === `not ${normalB}`) {
          return true;
        }
        if (normalB === `\xAC ${normalA}` || normalB === `\xAC${normalA}`) {
          return true;
        }
        if (normalA === `\xAC ${normalB}` || normalA === `\xAC${normalB}`) {
          return true;
        }
        const trueMatch = normalA.match(/^(.+) is true$/);
        const falseMatch = normalB.match(/^(.+) is false$/);
        if (trueMatch && falseMatch && trueMatch[1] === falseMatch[1]) {
          return true;
        }
        const trueMatch2 = normalB.match(/^(.+) is true$/);
        const falseMatch2 = normalA.match(/^(.+) is false$/);
        if (trueMatch2 && falseMatch2 && trueMatch2[1] === falseMatch2[1]) {
          return true;
        }
        const holdsMatch = normalA.match(/^(.+) holds$/);
        const notHoldsMatch = normalB.match(/^(.+) does not hold$/);
        if (holdsMatch && notHoldsMatch && holdsMatch[1] === notHoldsMatch[1]) {
          return true;
        }
        const itTrueMatch = normalA.match(/^it is true that (.+)$/);
        const itFalseMatch = normalB.match(/^it is false that (.+)$/);
        if (itTrueMatch && itFalseMatch && itTrueMatch[1] === itFalseMatch[1]) {
          return true;
        }
        return false;
      }
      /**
       * Detect type mismatches
       */
      detectTypeMismatches(atoms) {
        const mismatches = [];
        const variableTypes = /* @__PURE__ */ new Map();
        for (const atom of atoms) {
          const typePatterns = [
            { pattern: /let\s+(\w+)\s+be\s+an?\s+(\w+)/i, extractor: (m) => ({ var: m[1], type: m[2] }) },
            { pattern: /(\w+)\s+is\s+an?\s+(\w+)/i, extractor: (m) => ({ var: m[1], type: m[2] }) },
            { pattern: /for\s+(?:all|any|every)\s+(\w+)\s+in\s+(\w+)/i, extractor: (m) => ({ var: m[1], type: m[2] }) },
            { pattern: /(\w+)\s*∈\s*(\w+)/i, extractor: (m) => ({ var: m[1], type: m[2] }) }
          ];
          for (const { pattern, extractor } of typePatterns) {
            const match = atom.statement.match(pattern);
            if (match) {
              const { var: varName, type: varType } = extractor(match);
              const existing = variableTypes.get(varName);
              if (existing && !this.areTypesCompatible(existing.type, varType)) {
                mismatches.push({
                  type: "type_mismatch",
                  involvedStatements: [existing.sourceId, atom.id],
                  explanation: `Variable "${varName}" is declared as both "${existing.type}" and "${varType}"`,
                  severity: "error",
                  suggestedResolution: `Clarify the type of "${varName}"`
                });
              } else {
                variableTypes.set(varName, { type: varType, sourceId: atom.id });
              }
            }
          }
        }
        return mismatches;
      }
      /**
       * Check if two types are compatible
       */
      areTypesCompatible(type1, type2) {
        const t1 = type1.toLowerCase();
        const t2 = type2.toLowerCase();
        if (t1 === t2) return true;
        const subtypes = {
          natural: ["integer", "real", "complex"],
          integer: ["real", "complex"],
          rational: ["real", "complex"],
          real: ["complex"],
          positive: ["real", "integer"],
          negative: ["real", "integer"]
        };
        return subtypes[t1]?.includes(t2) || subtypes[t2]?.includes(t1);
      }
      /**
       * Detect domain violations
       */
      detectDomainViolations(atoms) {
        const violations = [];
        const domainPatterns = [
          {
            pattern: /sqrt\s*\(\s*(-[\d.]+|negative)/i,
            violation: "Square root of negative number",
            domain: "real numbers"
          },
          {
            pattern: /log\s*\(\s*(-[\d.]+|0|zero|non-?positive)/i,
            violation: "Logarithm of non-positive number",
            domain: "positive real numbers"
          },
          {
            pattern: /arcsin\s*\(\s*([\d.]+)/,
            violation: "Arcsin of value outside [-1, 1]",
            domain: "[-1, 1]",
            validator: (match) => {
              const val = parseFloat(match[1]);
              return Math.abs(val) > 1;
            }
          },
          {
            pattern: /(\w+)\s*\/\s*0(?![.\d])/,
            violation: "Division by zero",
            domain: "non-zero divisor"
          }
        ];
        for (const atom of atoms) {
          for (const { pattern, violation, domain, validator } of domainPatterns) {
            const match = atom.statement.match(pattern);
            if (match && (!validator || validator(match))) {
              violations.push({
                type: "domain_violation",
                involvedStatements: [atom.id],
                explanation: `${violation} in "${atom.statement.substring(0, 50)}..."`,
                severity: "error",
                suggestedResolution: `Ensure the argument is in the valid domain: ${domain}`
              });
            }
          }
        }
        return violations;
      }
      /**
       * Detect undefined operations
       */
      detectUndefinedOperations(atoms) {
        const undefined2 = [];
        const undefinedPatterns = [
          {
            pattern: /0\s*\/\s*0/,
            operation: "0/0 - indeterminate form"
          },
          {
            pattern: /∞\s*[-/]\s*∞/,
            operation: "\u221E - \u221E or \u221E/\u221E - indeterminate form"
          },
          {
            pattern: /0\s*\*\s*∞|∞\s*\*\s*0/,
            operation: "0 \xD7 \u221E - indeterminate form"
          },
          {
            pattern: /0\s*\^\s*0/,
            operation: "0^0 - undefined/context-dependent"
          },
          {
            pattern: /(\w+)\s*\^\s*\(?\s*-\d+\s*\)?.*\1\s*=\s*0/i,
            operation: "Negative power of zero"
          }
        ];
        for (const atom of atoms) {
          for (const { pattern, operation } of undefinedPatterns) {
            if (pattern.test(atom.statement)) {
              undefined2.push({
                type: "undefined_operation",
                involvedStatements: [atom.id],
                explanation: `Undefined operation: ${operation}`,
                severity: "critical",
                suggestedResolution: "This operation is mathematically undefined or indeterminate"
              });
            }
          }
        }
        return undefined2;
      }
      /**
       * Detect axiom conflicts
       */
      detectAxiomConflicts(atoms) {
        const conflicts = [];
        const axioms = atoms.filter((a) => a.type === "axiom");
        for (let i = 0; i < axioms.length; i++) {
          for (let j = i + 1; j < axioms.length; j++) {
            if (this.axiomsMayConflict(axioms[i], axioms[j])) {
              conflicts.push({
                type: "axiom_conflict",
                involvedStatements: [axioms[i].id, axioms[j].id],
                explanation: `Axioms may be in conflict: "${axioms[i].statement.substring(0, 30)}..." and "${axioms[j].statement.substring(0, 30)}..."`,
                severity: "warning",
                suggestedResolution: "Verify that these axioms are consistent in the intended model"
              });
            }
          }
        }
        return conflicts;
      }
      /**
       * Check if two axioms may conflict
       */
      axiomsMayConflict(a, b) {
        if (this.isSyntacticNegation(a.statement, b.statement)) {
          return true;
        }
        const universalA = /(?:for\s+all|∀)\s+(\w+).*?(\w+)\s+is\s+(\w+)/i.exec(a.statement);
        const universalB = /(?:for\s+all|∀)\s+(\w+).*?(\w+)\s+is\s+not\s+(\w+)/i.exec(b.statement);
        if (universalA && universalB && universalA[2] === universalB[2] && universalA[3] === universalB[3]) {
          return true;
        }
        return false;
      }
      /**
       * Detect quantifier errors
       */
      detectQuantifierErrors(atoms, graph) {
        const errors = [];
        const scopedVariables = /* @__PURE__ */ new Map();
        for (const atom of atoms) {
          const universalMatch = atom.statement.match(/(?:for\s+all|∀)\s+(\w+)/i);
          if (universalMatch) {
            scopedVariables.set(universalMatch[1], { quantifier: "universal", scope: atom.id });
          }
          const existentialMatch = atom.statement.match(/(?:there\s+exists?|∃)\s+(\w+)/i);
          if (existentialMatch) {
            scopedVariables.set(existentialMatch[1], { quantifier: "existential", scope: atom.id });
          }
          const variableUses = atom.statement.match(/\b([a-zA-Z])\b/g);
          if (variableUses) {
            for (const varName of variableUses) {
              const scopeInfo = scopedVariables.get(varName);
              if (scopeInfo) {
                const inScope = this.isInScope(atom.id, scopeInfo.scope, graph);
                if (!inScope) {
                  errors.push({
                    type: "quantifier_error",
                    involvedStatements: [scopeInfo.scope, atom.id],
                    explanation: `Variable "${varName}" used outside its quantifier scope`,
                    severity: "error",
                    suggestedResolution: `Ensure "${varName}" is properly bound in the current context`
                  });
                }
              }
            }
          }
          const uniExiPattern = /∀\s*(\w+).*∃\s*(\w+).*\1.*\2/;
          const exiUniPattern = /∃\s*(\w+).*∀\s*(\w+).*\1.*\2/;
          const uniExiMatch = atom.statement.match(uniExiPattern);
          const exiUniMatch = atom.statement.match(exiUniPattern);
          if (uniExiMatch && exiUniMatch) {
            errors.push({
              type: "quantifier_error",
              involvedStatements: [atom.id],
              explanation: "Ambiguous quantifier order may lead to different meanings",
              severity: "warning",
              suggestedResolution: "Clarify the intended quantifier order (\u2200\u2203 vs \u2203\u2200 has different meaning)"
            });
          }
        }
        return errors;
      }
      /**
       * Check if a statement is in the scope of another
       */
      isInScope(stmtId, scopeId, graph) {
        const visited = /* @__PURE__ */ new Set();
        const queue = [scopeId];
        while (queue.length > 0) {
          const current = queue.shift();
          if (current === stmtId) return true;
          if (visited.has(current)) continue;
          visited.add(current);
          for (const edge of graph.edges) {
            if (edge.from === current && !visited.has(edge.to)) {
              queue.push(edge.to);
            }
          }
        }
        return false;
      }
      /**
       * Get a summary of all inconsistencies
       */
      getSummary(inconsistencies) {
        const criticalCount = inconsistencies.filter((i) => i.severity === "critical").length;
        const errorCount = inconsistencies.filter((i) => i.severity === "error").length;
        const warningCount = inconsistencies.filter((i) => i.severity === "warning").length;
        let summary;
        if (criticalCount > 0) {
          summary = `CRITICAL: ${criticalCount} critical inconsistencies found. The proof is invalid.`;
        } else if (errorCount > 0) {
          summary = `ERROR: ${errorCount} errors found that need to be addressed.`;
        } else if (warningCount > 0) {
          summary = `WARNING: ${warningCount} potential issues found. Review recommended.`;
        } else {
          summary = "No inconsistencies detected. The proof appears to be consistent.";
        }
        return {
          isConsistent: criticalCount === 0 && errorCount === 0,
          criticalCount,
          errorCount,
          warningCount,
          summary
        };
      }
    };
  }
});

// src/proof/circular-detector.ts
var CircularReasoningDetector;
var init_circular_detector = __esm({
  "src/proof/circular-detector.ts"() {
    init_esm_shims();
    CircularReasoningDetector = class {
      /**
       * Detect all forms of circular reasoning in a proof
       */
      detectCircularReasoning(decomposition) {
        const { atoms, dependencies } = decomposition;
        const cycles = this.findReasoningCycles(dependencies);
        const selfReferential = this.findSelfReferential(atoms);
        const begging = this.findBeggingTheQuestion(atoms, dependencies);
        const tautologies = this.findTautologies(atoms);
        const hasCircularReasoning = cycles.length > 0 || selfReferential.length > 0 || begging.length > 0;
        return {
          hasCircularReasoning,
          cycles,
          selfReferentialStatements: selfReferential,
          beggingTheQuestion: begging,
          tautologies,
          summary: this.generateSummary(cycles, selfReferential, begging, tautologies)
        };
      }
      /**
       * Check if a single statement is self-referential
       */
      isSelfReferential(statement) {
        if (statement.derivedFrom?.includes(statement.id)) {
          return true;
        }
        const selfRefPatterns = [
          /this\s+(?:statement|proposition|claim)\s+(?:is|implies)/i,
          /(?:the\s+)?above\s+(?:statement|claim)\s+proves\s+itself/i,
          /by\s+definition\s+of\s+itself/i
        ];
        return selfRefPatterns.some((p) => p.test(statement.statement));
      }
      /**
       * Find all reasoning cycles using Tarjan's algorithm results
       */
      findReasoningCycles(graph) {
        const cycles = [];
        if (!graph.hasCycles) {
          return cycles;
        }
        if (graph.stronglyConnectedComponents) {
          for (const scc of graph.stronglyConnectedComponents) {
            if (scc.length > 1) {
              cycles.push(this.createCircularPath(scc, graph));
            }
          }
        } else {
          const visited = /* @__PURE__ */ new Set();
          const recStack = /* @__PURE__ */ new Set();
          const parent = /* @__PURE__ */ new Map();
          for (const [nodeId] of graph.nodes) {
            if (!visited.has(nodeId)) {
              this.findCyclesDFS(nodeId, graph, visited, recStack, parent, cycles);
            }
          }
        }
        return cycles;
      }
      /**
       * DFS helper for finding cycles
       */
      findCyclesDFS(nodeId, graph, visited, recStack, parent, cycles) {
        visited.add(nodeId);
        recStack.add(nodeId);
        for (const edge of graph.edges) {
          if (edge.from === nodeId) {
            const childId = edge.to;
            if (!visited.has(childId)) {
              parent.set(childId, nodeId);
              this.findCyclesDFS(childId, graph, visited, recStack, parent, cycles);
            } else if (recStack.has(childId)) {
              const cyclePath = this.extractCyclePath(childId, nodeId, parent);
              cycles.push(this.createCircularPath(cyclePath, graph));
            }
          }
        }
        recStack.delete(nodeId);
      }
      /**
       * Extract the cycle path from parent map
       */
      extractCyclePath(cycleStart, cycleEnd, parent) {
        const path2 = [cycleEnd];
        let current = cycleEnd;
        while (current !== cycleStart && parent.has(current)) {
          current = parent.get(current);
          path2.push(current);
        }
        path2.push(cycleStart);
        return path2.reverse();
      }
      /**
       * Create a CircularPath object from a list of statement IDs
       */
      createCircularPath(statementIds, graph) {
        const statements = statementIds.map((id) => graph.nodes.get(id)?.statement || id);
        const visualPath = statementIds.join(" \u2192 ") + " \u2192 " + statementIds[0];
        let severity = "minor";
        const conclusionInCycle = statementIds.some((id) => {
          const node = graph.nodes.get(id);
          return node?.type === "conclusion";
        });
        const hypothesisInCycle = statementIds.some((id) => {
          const node = graph.nodes.get(id);
          return node?.type === "hypothesis";
        });
        if (conclusionInCycle) {
          severity = "critical";
        } else if (hypothesisInCycle || statementIds.length > 3) {
          severity = "significant";
        }
        return {
          statements: statementIds,
          cycleLength: statementIds.length,
          explanation: `Circular reasoning detected: ${statements.map((s) => s.substring(0, 20) + "...").join(" depends on ")} which depends on the first statement`,
          visualPath,
          severity
        };
      }
      /**
       * Find self-referential statements
       */
      findSelfReferential(atoms) {
        return atoms.filter((a) => this.isSelfReferential(a)).map((a) => a.id);
      }
      /**
       * Find instances of begging the question
       * (assuming what needs to be proved)
       */
      findBeggingTheQuestion(atoms, graph) {
        const begging = [];
        const conclusions = atoms.filter((a) => a.type === "conclusion");
        const hypotheses = atoms.filter((a) => a.type === "hypothesis");
        for (const conclusion of conclusions) {
          for (const hypothesis of hypotheses) {
            if (this.statementsEquivalent(conclusion.statement, hypothesis.statement)) {
              begging.push(conclusion.id);
              break;
            }
          }
          if (conclusion.derivedFrom) {
            for (const depId of conclusion.derivedFrom) {
              const dep = graph.nodes.get(depId);
              if (dep && this.statementsEquivalent(conclusion.statement, dep.statement)) {
                begging.push(conclusion.id);
                break;
              }
            }
          }
        }
        return [...new Set(begging)];
      }
      /**
       * Check if two statements are semantically equivalent
       */
      statementsEquivalent(a, b) {
        const normalizeStatement = (s) => {
          return s.toLowerCase().replace(/\s+/g, " ").replace(/[.,;:!?]/g, "").trim();
        };
        const normA = normalizeStatement(a);
        const normB = normalizeStatement(b);
        if (normA === normB) return true;
        const checkEquivalence = (a2, b2) => {
          const thereforeMatch = a2.match(/therefore\s+(.+)/);
          const thusMatch = b2.match(/thus\s+(.+)/);
          if (thereforeMatch && thusMatch && thereforeMatch[1] === thusMatch[1]) return true;
          const isTrueMatch = a2.match(/(.+)\s+is\s+true/);
          if (isTrueMatch && isTrueMatch[1] === b2) return true;
          const followsMatch = a2.match(/it follows that\s+(.+)/);
          if (followsMatch && followsMatch[1] === b2) return true;
          return false;
        };
        if (checkEquivalence(normA, normB) || checkEquivalence(normB, normA)) return true;
        const wordsA = new Set(normA.split(/\s+/).filter((w) => w.length > 3));
        const wordsB = new Set(normB.split(/\s+/).filter((w) => w.length > 3));
        if (wordsA.size === 0 || wordsB.size === 0) return false;
        let overlap = 0;
        for (const word of wordsA) {
          if (wordsB.has(word)) overlap++;
        }
        return overlap / Math.max(wordsA.size, wordsB.size) > 0.8;
      }
      /**
       * Find tautological statements
       * (statements that are trivially true)
       */
      findTautologies(atoms) {
        const tautologies = [];
        const tautologyPatterns = [
          /(.+)\s+is\s+\1/i,
          // "X is X"
          /if\s+(.+)\s+then\s+\1/i,
          // "if P then P"
          /(.+)\s+or\s+not\s+\1/i,
          // "P or not P"
          /(.+)\s+implies\s+\1/i,
          // "P implies P"
          /(?:it is |)true\s+that\s+(.+)\s+is\s+(?:true|the case)/i,
          // "it is true that X is true"
          /either\s+(.+)\s+or\s+\1/i,
          // "either P or P"
          /all\s+(\w+)\s+are\s+\1/i
          // "all X are X"
        ];
        for (const atom of atoms) {
          for (const pattern of tautologyPatterns) {
            if (pattern.test(atom.statement)) {
              tautologies.push(atom.id);
              break;
            }
          }
          if (this.isLogicalTautology(atom.statement)) {
            tautologies.push(atom.id);
          }
        }
        return [...new Set(tautologies)];
      }
      /**
       * Check if a statement is a logical tautology
       */
      isLogicalTautology(statement) {
        const normalized = statement.toLowerCase();
        const orNotPattern = /(\b\w+\b)\s+or\s+not\s+\1/;
        if (orNotPattern.test(normalized)) return true;
        const orSamePattern = /(\b\w+\b)\s+or\s+\1\b/;
        if (orSamePattern.test(normalized)) return true;
        const impliesSelf = /if\s+(\b\w+\b).*then\s+\1/;
        if (impliesSelf.test(normalized)) return true;
        return false;
      }
      /**
       * Generate a summary of circular reasoning findings
       */
      generateSummary(cycles, selfReferential, begging, tautologies) {
        const parts = [];
        if (cycles.length > 0) {
          const criticalCycles = cycles.filter((c) => c.severity === "critical").length;
          if (criticalCycles > 0) {
            parts.push(`CRITICAL: ${criticalCycles} circular reasoning cycle(s) involving conclusions`);
          } else {
            parts.push(`${cycles.length} circular reasoning cycle(s) detected`);
          }
        }
        if (selfReferential.length > 0) {
          parts.push(`${selfReferential.length} self-referential statement(s)`);
        }
        if (begging.length > 0) {
          parts.push(`${begging.length} instance(s) of begging the question`);
        }
        if (tautologies.length > 0) {
          parts.push(`${tautologies.length} tautological statement(s) (may be intentional)`);
        }
        if (parts.length === 0) {
          return "No circular reasoning detected. The proof structure appears sound.";
        }
        return parts.join(". ") + ".";
      }
      /**
       * Get detailed analysis of a specific cycle
       */
      analyzeCycle(cycle, graph) {
        const involvedStatements = [];
        const breakPoints = [];
        for (const id of cycle.statements) {
          const node = graph.nodes.get(id);
          if (node) {
            involvedStatements.push(node);
            if (node.type === "derived" && node.derivedFrom && node.derivedFrom.length > 1) {
              breakPoints.push(id);
            }
          }
        }
        let suggestedFix;
        if (breakPoints.length > 0) {
          suggestedFix = `Consider independently justifying statement(s) ${breakPoints.join(", ")} to break the cycle`;
        } else if (involvedStatements.some((s) => s.type === "hypothesis")) {
          suggestedFix = "Review the hypothesis - it may be assuming what needs to be proved";
        } else {
          suggestedFix = "Add independent justification for one of the statements in the cycle";
        }
        return {
          involvedStatements,
          breakPoints,
          suggestedFix
        };
      }
      /**
       * Check if proof uses circular argument to establish a conclusion
       */
      conclusionDependsOnItself(conclusionId, graph) {
        const conclusion = graph.nodes.get(conclusionId);
        if (!conclusion) return false;
        const visited = /* @__PURE__ */ new Set();
        const queue = conclusion.derivedFrom ? [...conclusion.derivedFrom] : [];
        while (queue.length > 0) {
          const current = queue.shift();
          if (current === conclusionId) return true;
          if (visited.has(current)) continue;
          visited.add(current);
          const node = graph.nodes.get(current);
          if (node?.derivedFrom) {
            queue.push(...node.derivedFrom.filter((d) => !visited.has(d)));
          }
        }
        return false;
      }
    };
  }
});

// src/modes/mathematics-reasoning.ts
var mathematics_reasoning_exports = {};
__export(mathematics_reasoning_exports, {
  MathematicsReasoningEngine: () => MathematicsReasoningEngine
});
var DEFAULT_CONFIG5, MathematicsReasoningEngine;
var init_mathematics_reasoning = __esm({
  "src/modes/mathematics-reasoning.ts"() {
    init_esm_shims();
    init_decomposer();
    init_gap_analyzer();
    init_assumption_tracker();
    init_inconsistency_detector();
    init_circular_detector();
    DEFAULT_CONFIG5 = {
      enableDecomposition: true,
      enableGapAnalysis: true,
      enableAssumptionTracking: true,
      enableInconsistencyDetection: true,
      enableCircularDetection: true
    };
    MathematicsReasoningEngine = class {
      config;
      decomposer;
      gapAnalyzer;
      assumptionTracker;
      inconsistencyDetector;
      circularDetector;
      constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG5, ...config };
        this.decomposer = new ProofDecomposer();
        this.gapAnalyzer = new GapAnalyzer(this.config.gapAnalyzerConfig);
        this.assumptionTracker = new AssumptionTracker();
        this.inconsistencyDetector = new InconsistencyDetector(this.config.inconsistencyConfig);
        this.circularDetector = new CircularReasoningDetector();
      }
      /**
       * Analyze a proof completely
       *
       * @param proof - Proof text or structured steps
       * @param theorem - Optional theorem being proven
       * @returns Complete analysis result
       */
      analyzeProof(proof, theorem) {
        const recommendations = [];
        let overallScore = 1;
        let decomposition;
        if (this.config.enableDecomposition) {
          decomposition = this.decomposer.decompose(proof, theorem);
          overallScore *= decomposition.completeness;
        }
        if (!decomposition) {
          return {
            overallScore: 0,
            recommendations: ["Unable to decompose proof. Please provide proof content."],
            isValid: false
          };
        }
        let gapAnalysis;
        if (this.config.enableGapAnalysis) {
          gapAnalysis = this.gapAnalyzer.analyzeGaps(decomposition);
          overallScore *= gapAnalysis.completeness;
          recommendations.push(...gapAnalysis.suggestions);
        }
        let assumptionAnalysis;
        if (this.config.enableAssumptionTracking) {
          assumptionAnalysis = this.assumptionTracker.analyzeAssumptions(decomposition);
          const assumptionSuggestions = this.assumptionTracker.getSuggestions(assumptionAnalysis);
          recommendations.push(...assumptionSuggestions);
          if (assumptionAnalysis.unusedAssumptions.length > 0) {
            overallScore *= 0.95;
          }
        }
        let consistencyReport;
        if (this.config.enableInconsistencyDetection) {
          const inconsistencies = this.inconsistencyDetector.analyze(decomposition);
          const summary = this.inconsistencyDetector.getSummary(inconsistencies);
          let circularReasoning;
          if (this.config.enableCircularDetection) {
            circularReasoning = this.circularDetector.detectCircularReasoning(decomposition);
          }
          consistencyReport = {
            isConsistent: summary.isConsistent && !circularReasoning?.hasCircularReasoning,
            overallScore: summary.isConsistent ? overallScore : overallScore * 0.5,
            inconsistencies,
            warnings: inconsistencies.filter((i) => i.severity === "warning").map((i) => i.explanation),
            circularReasoning: circularReasoning?.cycles || [],
            summary: this.generateConsistencySummary(summary, circularReasoning)
          };
          if (!consistencyReport.isConsistent) {
            overallScore *= 0.3;
            recommendations.unshift(consistencyReport.summary);
          }
        }
        const isValid = (consistencyReport?.isConsistent ?? true) && overallScore > 0.5;
        return {
          decomposition,
          consistencyReport,
          gapAnalysis,
          assumptionAnalysis,
          overallScore: Math.max(0, Math.min(1, overallScore)),
          recommendations: this.deduplicateRecommendations(recommendations),
          isValid
        };
      }
      /**
       * Analyze a specific thought type
       */
      analyzeForThoughtType(proof, thoughtType, theorem) {
        switch (thoughtType) {
          case "proof_decomposition":
            return {
              decomposition: this.decomposer.decompose(proof, theorem)
            };
          case "dependency_analysis":
            const decomp = this.decomposer.decompose(proof, theorem);
            return {
              decomposition: decomp,
              recommendations: [
                `Proof depth: ${decomp.maxDependencyDepth}`,
                `Atomic statements: ${decomp.atomCount}`,
                `Has cycles: ${decomp.dependencies.hasCycles}`
              ]
            };
          case "consistency_check":
            return this.checkConsistency(proof, theorem);
          case "gap_identification":
            const gapDecomp = this.decomposer.decompose(proof, theorem);
            return {
              gapAnalysis: this.gapAnalyzer.analyzeGaps(gapDecomp)
            };
          case "assumption_trace":
            const assumptionDecomp = this.decomposer.decompose(proof, theorem);
            return {
              assumptionAnalysis: this.assumptionTracker.analyzeAssumptions(assumptionDecomp)
            };
          default:
            return this.analyzeProof(proof, theorem);
        }
      }
      /**
       * Perform only consistency check
       */
      checkConsistency(proof, theorem) {
        const decomposition = this.decomposer.decompose(proof, theorem);
        const inconsistencies = this.inconsistencyDetector.analyze(decomposition);
        const summary = this.inconsistencyDetector.getSummary(inconsistencies);
        const circularReasoning = this.circularDetector.detectCircularReasoning(decomposition);
        const consistencyReport = {
          isConsistent: summary.isConsistent && !circularReasoning.hasCircularReasoning,
          overallScore: summary.isConsistent ? 1 - summary.warningCount * 0.05 : 0.3,
          inconsistencies,
          warnings: inconsistencies.filter((i) => i.severity === "warning").map((i) => i.explanation),
          circularReasoning: circularReasoning.cycles,
          summary: this.generateConsistencySummary(summary, circularReasoning)
        };
        return {
          decomposition,
          consistencyReport,
          isValid: consistencyReport.isConsistent,
          overallScore: consistencyReport.overallScore
        };
      }
      /**
       * Generate a comprehensive report
       */
      generateReport(analysisResult) {
        const lines = [];
        lines.push("# Proof Analysis Report");
        lines.push("");
        lines.push("## Overall Assessment");
        lines.push(`- **Valid**: ${analysisResult.isValid ? "Yes" : "No"}`);
        lines.push(`- **Score**: ${(analysisResult.overallScore * 100).toFixed(1)}%`);
        lines.push("");
        if (analysisResult.decomposition) {
          const d = analysisResult.decomposition;
          lines.push("## Proof Structure");
          lines.push(`- **Atomic Statements**: ${d.atomCount}`);
          lines.push(`- **Maximum Depth**: ${d.maxDependencyDepth}`);
          lines.push(`- **Rigor Level**: ${d.rigorLevel}`);
          lines.push(`- **Completeness**: ${(d.completeness * 100).toFixed(1)}%`);
          lines.push("");
        }
        if (analysisResult.consistencyReport) {
          const c = analysisResult.consistencyReport;
          lines.push("## Consistency Analysis");
          lines.push(`- **Consistent**: ${c.isConsistent ? "Yes" : "No"}`);
          lines.push(`- **Inconsistencies Found**: ${c.inconsistencies.length}`);
          lines.push(`- **Circular Reasoning**: ${c.circularReasoning.length > 0 ? "Detected" : "None"}`);
          if (c.inconsistencies.length > 0) {
            lines.push("");
            lines.push("### Inconsistencies");
            for (const inc of c.inconsistencies.slice(0, 5)) {
              lines.push(`- [${inc.severity.toUpperCase()}] ${inc.explanation}`);
            }
          }
          lines.push("");
        }
        if (analysisResult.gapAnalysis) {
          const g = analysisResult.gapAnalysis;
          lines.push("## Gap Analysis");
          lines.push(`- **Gaps Found**: ${g.gaps.length}`);
          lines.push(`- **Implicit Assumptions**: ${g.implicitAssumptions.length}`);
          lines.push(`- **Unjustified Steps**: ${g.unjustifiedSteps.length}`);
          lines.push("");
        }
        if (analysisResult.recommendations.length > 0) {
          lines.push("## Recommendations");
          for (const rec of analysisResult.recommendations.slice(0, 10)) {
            lines.push(`- ${rec}`);
          }
          lines.push("");
        }
        return lines.join("\n");
      }
      /**
       * Generate consistency summary from analysis results
       */
      generateConsistencySummary(inconsistencySummary, circularResult) {
        const parts = [];
        if (!inconsistencySummary.isConsistent) {
          parts.push(inconsistencySummary.summary);
        }
        if (circularResult?.hasCircularReasoning) {
          parts.push(circularResult.summary);
        }
        if (parts.length === 0) {
          return "The proof is logically consistent with no circular reasoning detected.";
        }
        return parts.join(" ");
      }
      /**
       * Deduplicate recommendations
       */
      deduplicateRecommendations(recommendations) {
        const seen = /* @__PURE__ */ new Set();
        const result = [];
        for (const rec of recommendations) {
          const normalized = rec.toLowerCase().trim();
          if (!seen.has(normalized)) {
            seen.add(normalized);
            result.push(rec);
          }
        }
        return result;
      }
      /**
       * Enhance a MathematicsThought with analysis results
       */
      enhanceThought(thought, proof) {
        const analysisResult = this.analyzeForThoughtType(
          proof,
          thought.thoughtType,
          thought.content
        );
        return {
          ...thought,
          decomposition: analysisResult.decomposition,
          consistencyReport: analysisResult.consistencyReport,
          gapAnalysis: analysisResult.gapAnalysis,
          assumptionAnalysis: analysisResult.assumptionAnalysis
        };
      }
      /**
       * Get engine statistics
       */
      getStats() {
        return {
          features: {
            decomposition: this.config.enableDecomposition,
            gapAnalysis: this.config.enableGapAnalysis,
            assumptionTracking: this.config.enableAssumptionTracking,
            inconsistencyDetection: this.config.enableInconsistencyDetection,
            circularDetection: this.config.enableCircularDetection
          },
          version: "7.0.0"
          // Phase 8
        };
      }
    };
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
  description: "Math/physics: proofs, proof decomposition, consistency checking, tensors, LaTeX, conservation laws",
  inputSchema: {
    type: "object",
    properties: {
      ...baseThoughtProperties,
      mode: {
        type: "string",
        enum: ["mathematics", "physics"],
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
var ProofStepInputSchema = z.object({
  stepNumber: z.number().int().positive(),
  statement: z.string(),
  justification: z.string().optional(),
  latex: z.string().optional(),
  referencesSteps: z.array(z.number()).optional()
});
var MathSchema = BaseThoughtSchema.extend({
  mode: z.enum(["mathematics", "physics"]),
  thoughtType: z.string().optional(),
  proofStrategy: ProofStrategySchema.optional(),
  mathematicalModel: MathematicalModelSchema.optional(),
  tensorProperties: TensorPropertiesSchema.optional(),
  physicalInterpretation: PhysicalInterpretationSchema.optional(),
  // Phase 8: Proof decomposition fields
  proofSteps: z.array(ProofStepInputSchema).optional(),
  theorem: z.string().optional(),
  hypotheses: z.array(z.string()).optional(),
  analysisDepth: z.enum(["shallow", "standard", "deep"]).optional(),
  includeConsistencyCheck: z.boolean().optional(),
  traceAssumptions: z.boolean().optional()
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
function isDecompositionThoughtType(thoughtType) {
  return [
    "proof_decomposition",
    "dependency_analysis",
    "consistency_check",
    "gap_identification",
    "assumption_trace"
  ].includes(thoughtType || "");
}
var _mathEngine = null;
async function getMathematicsReasoningEngine() {
  if (!_mathEngine) {
    const { MathematicsReasoningEngine: MathematicsReasoningEngine2 } = await Promise.resolve().then(() => (init_mathematics_reasoning(), mathematics_reasoning_exports));
    _mathEngine = new MathematicsReasoningEngine2();
  }
  return _mathEngine;
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
  if (mode === "mathematics" /* MATHEMATICS */ && isDecompositionThoughtType(input.thoughtType)) {
    try {
      const mathEngine = await getMathematicsReasoningEngine();
      const proofInput = input.proofSteps || input.thought;
      const analysisResult = mathEngine.analyzeForThoughtType(
        proofInput,
        input.thoughtType,
        input.theorem
      );
      thought.decomposition = analysisResult.decomposition;
      thought.consistencyReport = analysisResult.consistencyReport;
      thought.gapAnalysis = analysisResult.gapAnalysis;
      thought.assumptionAnalysis = analysisResult.assumptionAnalysis;
    } catch (error) {
      console.error("Proof analysis failed:", error);
    }
  }
  const session = await sessionManager.addThought(sessionId, thought);
  const response = {
    sessionId: session.id,
    thoughtId: thought.id,
    thoughtNumber: thought.thoughtNumber,
    mode: thought.mode,
    nextThoughtNeeded: thought.nextThoughtNeeded,
    sessionComplete: session.isComplete,
    totalThoughts: session.thoughts.length
  };
  if (thought.decomposition) {
    response.decomposition = thought.decomposition;
  }
  if (thought.consistencyReport) {
    response.consistencyReport = thought.consistencyReport;
  }
  if (thought.gapAnalysis) {
    response.gapAnalysis = thought.gapAnalysis;
  }
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response, null, 2)
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