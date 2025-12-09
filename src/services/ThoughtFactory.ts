/**
 * Thought Factory Service (v3.4.5)
 * Sprint 3 Task 3.3: Extract thought creation logic from index.ts
 * Sprint 3 Task 3.2: Added dependency injection support
 *
 * Centralizes thought creation logic for all thinking modes.
 * Provides type-safe thought construction based on mode-specific requirements.
 *
 * RESPONSIBILITY:
 * - Create properly typed thought objects for all 18 thinking modes
 * - Apply mode-specific defaults and transformations
 * - Ensure thought structure consistency across modes
 *
 * EXTRACTED FROM: src/index.ts (createThought function)
 */

import { randomUUID } from 'crypto';
import {
  ThinkingMode,
  ShannonStage,
  SequentialThought,
  ShannonThought,
  MathematicsThought,
  PhysicsThought,
  InductiveThought,
  DeductiveThought,
  AbductiveThought,
  CausalThought,
  Thought,
  EngineeringThought,
  ComputabilityThought,
  CryptanalyticThought,
  AlgorithmicThought,
  SystemsThinkingThought,
  ScientificMethodThought,
  FormalLogicThought,
  OptimizationThought,
  SynthesisThought,
  ArgumentationThought,
  CritiqueThought,
  AnalysisThought,
} from '../types/index.js';
import { ThinkingToolInput } from '../tools/thinking.js';
import { toExtendedThoughtType } from '../utils/type-guards.js';
import { ILogger } from '../interfaces/ILogger.js';
import { createLogger, LogLevel } from '../utils/logger.js';

/**
 * Thought Factory - Creates mode-specific thought objects
 *
 * Handles the complexity of creating properly structured thought objects
 * for all 18 thinking modes, applying defaults and mode-specific logic.
 *
 * @example
 * ```typescript
 * const factory = new ThoughtFactory();
 * const thought = factory.createThought(input, sessionId);
 * await sessionManager.addThought(sessionId, thought);
 * ```
 */
export class ThoughtFactory {
  private logger: ILogger;

  constructor(logger?: ILogger) {
    this.logger = logger || createLogger({ minLevel: LogLevel.INFO, enableConsole: true });
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
  createThought(input: ThinkingToolInput, sessionId: string): Thought {
    this.logger.debug('Creating thought', {
      sessionId,
      mode: input.mode,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      isRevision: input.isRevision,
    });

    const baseThought = {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };

    switch (input.mode as string) {
      case 'sequential':
        return {
          ...baseThought,
          mode: ThinkingMode.SEQUENTIAL,
          revisionReason: input.revisionReason,
          branchFrom: input.branchFrom,
          branchId: input.branchId,
        } as SequentialThought;

      case 'shannon':
        return {
          ...baseThought,
          mode: ThinkingMode.SHANNON,
          stage: (input.stage as ShannonStage) || ShannonStage.PROBLEM_DEFINITION,
          uncertainty: input.uncertainty || 0.5,
          dependencies: input.dependencies || [],
          assumptions: input.assumptions || [],
        } as ShannonThought;

      case 'mathematics':
        return {
          ...baseThought,
          mode: ThinkingMode.MATHEMATICS,
          thoughtType: toExtendedThoughtType(input.thoughtType, 'model'),
          mathematicalModel: input.mathematicalModel,
          proofStrategy: input.proofStrategy,
          dependencies: input.dependencies || [],
          assumptions: input.assumptions || [],
          uncertainty: input.uncertainty || 0.5,
        } as MathematicsThought;

      case 'physics':
        return {
          ...baseThought,
          mode: ThinkingMode.PHYSICS,
          thoughtType: toExtendedThoughtType(input.thoughtType, 'model'),
          tensorProperties: input.tensorProperties,
          physicalInterpretation: input.physicalInterpretation,
          dependencies: input.dependencies || [],
          assumptions: input.assumptions || [],
          uncertainty: input.uncertainty || 0.5,
        } as PhysicsThought;

      case 'inductive':
        return {
          ...baseThought,
          mode: ThinkingMode.INDUCTIVE,
          observations: input.observations || [],
          pattern: input.pattern,
          generalization: input.generalization || '',
          confidence: input.confidence ?? 0.5,
          counterexamples: input.counterexamples || [],
          sampleSize: input.sampleSize,
        } as InductiveThought;

      case 'deductive':
        return {
          ...baseThought,
          mode: ThinkingMode.DEDUCTIVE,
          premises: input.premises || [],
          conclusion: input.conclusion || '',
          logicForm: input.logicForm,
          validityCheck: input.validityCheck ?? false,
          soundnessCheck: input.soundnessCheck,
        } as DeductiveThought;

      case 'abductive':
        return {
          ...baseThought,
          mode: ThinkingMode.ABDUCTIVE,
          thoughtType: toExtendedThoughtType(input.thoughtType, 'problem_definition'),
          observations: input.observations || [],
          hypotheses: input.hypotheses || [],
          evaluationCriteria: input.evaluationCriteria,
          evidence: input.evidence || [],
          bestExplanation: input.bestExplanation,
        } as AbductiveThought;

      case 'causal':
        // Build causalGraph from either input.causalGraph or top-level nodes/edges
        // (JSON schema sends nodes/edges at top level, Zod schema nests them in causalGraph)
        const inputAny = input as any;
        const causalGraph = input.causalGraph || {
          nodes: inputAny.nodes || [],
          edges: inputAny.edges || [],
        };
        return {
          ...baseThought,
          mode: ThinkingMode.CAUSAL,
          thoughtType: toExtendedThoughtType(input.thoughtType, 'problem_definition'),
          causalGraph,
          interventions: input.interventions || [],
          mechanisms: input.mechanisms || [],
          confounders: input.confounders || [],
        } as CausalThought;

      case 'bayesian':
        return {
          ...baseThought,
          mode: ThinkingMode.BAYESIAN,
          thoughtType: toExtendedThoughtType(input.thoughtType, 'problem_definition'),
          hypothesis: input.hypothesis,
          prior: input.prior,
          likelihood: input.likelihood,
          evidence: input.evidence || [],
          posterior: input.posterior,
          bayesFactor: input.bayesFactor,
        } as any;

      case 'counterfactual':
        return {
          ...baseThought,
          mode: ThinkingMode.COUNTERFACTUAL,
          thoughtType: toExtendedThoughtType(input.thoughtType, 'problem_definition'),
          actual: input.actual,
          counterfactuals: input.counterfactuals || [],
          comparison: input.comparison,
          interventionPoint: input.interventionPoint,
          causalChains: input.causalChains || [],
        } as any;

      case 'analogical':
        return {
          ...baseThought,
          mode: ThinkingMode.ANALOGICAL,
          thoughtType: toExtendedThoughtType(input.thoughtType, 'analogy'),
          sourceDomain: input.sourceDomain,
          targetDomain: input.targetDomain,
          mapping: input.mapping || [],
          insights: input.insights || [],
          inferences: input.inferences || [],
          limitations: input.limitations || [],
          analogyStrength: input.analogyStrength,
        } as any;

      case 'temporal':
        return {
          ...baseThought,
          mode: ThinkingMode.TEMPORAL,
          thoughtType: input.thoughtType || 'event_definition',
          timeline: input.timeline,
          events: input.events || [],
          intervals: input.intervals || [],
          constraints: input.constraints || [],
          relations: input.relations || [],
        } as any;

      case 'gametheory':
        return {
          ...baseThought,
          mode: ThinkingMode.GAMETHEORY,
          thoughtType: input.thoughtType || 'game_definition',
          game: input.game,
          players: input.players || [],
          strategies: input.strategies || [],
          payoffMatrix: input.payoffMatrix,
          nashEquilibria: input.nashEquilibria || [],
          dominantStrategies: input.dominantStrategies || [],
          gameTree: input.gameTree,
        } as any;

      case 'evidential':
        return {
          ...baseThought,
          mode: ThinkingMode.EVIDENTIAL,
          thoughtType: input.thoughtType || 'hypothesis_definition',
          frameOfDiscernment: input.frameOfDiscernment,
          hypotheses: input.hypotheses || [],
          evidence: input.evidence || [],
          beliefFunctions: input.beliefFunctions || [],
          combinedBelief: input.combinedBelief,
          plausibility: input.plausibility,
          decisions: input.decisions || [],
        } as any;

      case ThinkingMode.FIRSTPRINCIPLES:
        return {
          ...baseThought,
          mode: ThinkingMode.FIRSTPRINCIPLES,
          question: input.question || '',
          principles: input.principles || [],
          derivationSteps: input.derivationSteps || [],
          conclusion: input.conclusion || { statement: '', derivationChain: [], certainty: 0 },
          alternativeInterpretations: input.alternativeInterpretations || [],
        } as any;

      case 'metareasoning':
        {
          const metaInput = input as any;
          return {
            ...baseThought,
            mode: ThinkingMode.METAREASONING,
            currentStrategy: metaInput.currentStrategy || {
              mode: ThinkingMode.SEQUENTIAL,
              approach: 'Default sequential approach',
              startedAt: new Date(),
              thoughtsSpent: 0,
              progressIndicators: [],
            },
            strategyEvaluation: metaInput.strategyEvaluation || {
              effectiveness: 0.5,
              efficiency: 0.5,
              confidence: 0.5,
              progressRate: 0,
              qualityScore: 0.5,
              issues: [],
              strengths: [],
            },
            alternativeStrategies: metaInput.alternativeStrategies || [],
            recommendation: metaInput.recommendation || {
              action: 'CONTINUE',
              justification: 'No specific recommendation yet',
              confidence: 0.5,
              expectedImprovement: 'Monitor progress',
            },
            resourceAllocation: metaInput.resourceAllocation || {
              timeSpent: 0,
              thoughtsRemaining: input.totalThoughts - input.thoughtNumber,
              complexityLevel: 'medium',
              urgency: 'medium',
              recommendation: 'Continue with current approach',
            },
            qualityMetrics: metaInput.qualityMetrics || {
              logicalConsistency: 0.5,
              evidenceQuality: 0.5,
              completeness: 0.5,
              originality: 0.5,
              clarity: 0.5,
              overallQuality: 0.5,
            },
            sessionContext: metaInput.sessionContext || {
              sessionId,
              totalThoughts: input.thoughtNumber,
              modesUsed: [input.mode as ThinkingMode],
              modeSwitches: 0,
              problemType: 'general',
            },
          } as any;
        }

      case 'engineering':
        {
          const engInput = input as any;
          return {
            ...baseThought,
            mode: ThinkingMode.ENGINEERING,
            analysisType: engInput.analysisType || 'comprehensive',
            designChallenge: engInput.designChallenge || input.thought,
            requirements: engInput.requirements,
            tradeStudy: engInput.tradeStudy,
            fmea: engInput.fmea,
            designDecisions: engInput.designDecisions,
            assessment: engInput.assessment,
          } as EngineeringThought;
        }

      // ===== Phase 11 v7.2.0 - Turing's legacy =====
      case 'computability':
        {
          const compInput = input as any;
          return {
            ...baseThought,
            mode: ThinkingMode.COMPUTABILITY,
            thoughtType: compInput.thoughtType || 'machine_definition',
            machines: compInput.machines || [],
            currentMachine: compInput.currentMachine,
            computationTrace: compInput.computationTrace,
            problems: compInput.problems || [],
            currentProblem: compInput.currentProblem,
            reductions: compInput.reductions || [],
            reductionChain: compInput.reductionChain || [],
            decidabilityProof: compInput.decidabilityProof,
            diagonalization: compInput.diagonalization,
            complexityAnalysis: compInput.complexityAnalysis,
            oracleAnalysis: compInput.oracleAnalysis,
            dependencies: compInput.dependencies || [],
            assumptions: compInput.assumptions || [],
            uncertainty: compInput.uncertainty ?? 0.5,
            classicProblems: compInput.classicProblems || [],
            keyInsight: compInput.keyInsight,
          } as ComputabilityThought;
        }

      case 'cryptanalytic':
        {
          const cryptInput = input as any;
          return {
            ...baseThought,
            mode: ThinkingMode.CRYPTANALYTIC,
            thoughtType: cryptInput.thoughtType || 'hypothesis_formation',
            ciphertext: cryptInput.ciphertext,
            plaintext: cryptInput.plaintext,
            hypotheses: cryptInput.hypotheses || [],
            currentHypothesis: cryptInput.currentHypothesis,
            evidenceChains: cryptInput.evidenceChains || [],
            keySpaceAnalysis: cryptInput.keySpaceAnalysis,
            frequencyAnalysis: cryptInput.frequencyAnalysis,
            banburismusAnalysis: cryptInput.banburismusAnalysis || [],
            cribAnalysis: cryptInput.cribAnalysis || [],
            patterns: cryptInput.patterns || [],
            cipherType: cryptInput.cipherType,
            dependencies: cryptInput.dependencies || [],
            assumptions: cryptInput.assumptions || [],
            uncertainty: cryptInput.uncertainty ?? 0.5,
            keyInsight: cryptInput.keyInsight,
          } as CryptanalyticThought;
        }

      // ===== Phase 12 v7.3.0 - CLRS algorithms =====
      case 'algorithmic':
        {
          const algoInput = input as any;
          return {
            ...baseThought,
            mode: ThinkingMode.ALGORITHMIC,
            thoughtType: algoInput.thoughtType || 'algorithm_definition',
            algorithm: algoInput.algorithm,
            clrsCategory: algoInput.clrsCategory,
            clrsAlgorithm: algoInput.clrsAlgorithm,
            designPattern: algoInput.designPattern,
            timeComplexity: algoInput.timeComplexity,
            spaceComplexity: algoInput.spaceComplexity,
            recurrence: algoInput.recurrence,
            correctnessProof: algoInput.correctnessProof,
            loopInvariants: algoInput.loopInvariants || [],
            dpFormulation: algoInput.dpFormulation,
            greedyProof: algoInput.greedyProof,
            graphContext: algoInput.graphContext,
            dataStructure: algoInput.dataStructure,
            amortizedAnalysis: algoInput.amortizedAnalysis,
            comparison: algoInput.comparison,
            dependencies: algoInput.dependencies || [],
            assumptions: algoInput.assumptions || [],
            uncertainty: algoInput.uncertainty ?? 0.5,
            keyInsight: algoInput.keyInsight,
            pseudocode: algoInput.pseudocode,
            executionTrace: algoInput.executionTrace,
          } as AlgorithmicThought;
        }

      // ===== Phase 4 v3.2.0 - Scientific modes =====
      case 'systemsthinking':
        {
          const sysInput = input as any;
          return {
            ...baseThought,
            mode: ThinkingMode.SYSTEMSTHINKING,
            thoughtType: sysInput.thoughtType || 'system_definition',
            system: sysInput.system,
            components: sysInput.components || [],
            feedbackLoops: sysInput.feedbackLoops || [],
            leveragePoints: sysInput.leveragePoints || [],
            behaviors: sysInput.behaviors || [],
          } as SystemsThinkingThought;
        }

      case 'scientificmethod':
        {
          const sciInput = input as any;
          return {
            ...baseThought,
            mode: ThinkingMode.SCIENTIFICMETHOD,
            thoughtType: sciInput.thoughtType || 'question_formulation',
            researchQuestion: sciInput.researchQuestion,
            scientificHypotheses: sciInput.scientificHypotheses || [],
            experiment: sciInput.experiment,
            data: sciInput.data,
            analysis: sciInput.analysis,
            conclusion: sciInput.conclusion,
          } as ScientificMethodThought;
        }

      case 'formallogic':
        {
          const logicInput = input as any;
          return {
            ...baseThought,
            mode: ThinkingMode.FORMALLOGIC,
            thoughtType: logicInput.thoughtType || 'proposition_definition',
            propositions: logicInput.propositions || [],
            logicalInferences: logicInput.logicalInferences || [],
            proof: logicInput.proof,
            truthTable: logicInput.truthTable,
            satisfiability: logicInput.satisfiability,
          } as FormalLogicThought;
        }

      case 'optimization':
        {
          const optInput = input as any;
          return {
            ...baseThought,
            mode: ThinkingMode.OPTIMIZATION,
            thoughtType: optInput.thoughtType || 'problem_formulation',
            objectiveFunction: optInput.objectiveFunction,
            constraints: optInput.constraints || [],
            variables: optInput.variables || [],
            solution: optInput.solution,
            method: optInput.method,
            convergence: optInput.convergence,
            sensitivity: optInput.sensitivity,
          } as OptimizationThought;
        }

      // ===== Phase 13 v7.4.0 - Academic Research modes =====
      case 'synthesis':
        {
          const synthInput = input as any;
          return {
            ...baseThought,
            mode: ThinkingMode.SYNTHESIS,
            thoughtType: synthInput.thoughtType || 'source_identification',
            sources: synthInput.sources || [],
            reviewMetadata: synthInput.reviewMetadata,
            concepts: synthInput.concepts || [],
            themes: synthInput.themes || [],
            findings: synthInput.findings || [],
            patterns: synthInput.patterns || [],
            relations: synthInput.relations || [],
            gaps: synthInput.gaps || [],
            contradictions: synthInput.contradictions || [],
            framework: synthInput.framework,
            conclusions: synthInput.conclusions || [],
            dependencies: synthInput.dependencies || [],
            assumptions: synthInput.assumptions || [],
            uncertainty: synthInput.uncertainty ?? 0.5,
            keyInsight: synthInput.keyInsight,
          } as SynthesisThought;
        }

      case 'argumentation':
        {
          const argInput = input as any;
          return {
            ...baseThought,
            mode: ThinkingMode.ARGUMENTATION,
            thoughtType: argInput.thoughtType || 'claim_formulation',
            claims: argInput.claims || [],
            currentClaim: argInput.currentClaim,
            grounds: argInput.grounds || [],
            warrants: argInput.warrants || [],
            backings: argInput.backings || [],
            qualifiers: argInput.qualifiers || [],
            rebuttals: argInput.rebuttals || [],
            arguments: argInput.arguments || [],
            currentArgument: argInput.currentArgument,
            argumentChain: argInput.argumentChain,
            dialectic: argInput.dialectic,
            rhetoricalStrategies: argInput.rhetoricalStrategies || [],
            audienceConsideration: argInput.audienceConsideration,
            fallacies: argInput.fallacies || [],
            argumentStrength: argInput.argumentStrength ?? 0.5,
            dependencies: argInput.dependencies || [],
            assumptions: argInput.assumptions || [],
            uncertainty: argInput.uncertainty ?? 0.5,
            keyInsight: argInput.keyInsight,
          } as ArgumentationThought;
        }

      case 'critique':
        {
          const critInput = input as any;
          return {
            ...baseThought,
            mode: ThinkingMode.CRITIQUE,
            thoughtType: critInput.thoughtType || 'work_characterization',
            work: critInput.work || {
              id: randomUUID(),
              title: 'Untitled Work',
              authors: [],
              year: new Date().getFullYear(),
              type: 'empirical_study',
              field: 'Unknown',
              claimedContribution: '',
            },
            methodologyEvaluation: critInput.methodologyEvaluation,
            argumentCritique: critInput.argumentCritique,
            evidenceCritique: critInput.evidenceCritique,
            contributionEvaluation: critInput.contributionEvaluation,
            critiquePoints: critInput.critiquePoints || [],
            improvements: critInput.improvements || [],
            verdict: critInput.verdict,
            strengthsIdentified: critInput.strengthsIdentified ?? 0,
            weaknessesIdentified: critInput.weaknessesIdentified ?? 0,
            balanceRatio: critInput.balanceRatio ?? 1,
            dependencies: critInput.dependencies || [],
            assumptions: critInput.assumptions || [],
            uncertainty: critInput.uncertainty ?? 0.5,
            keyInsight: critInput.keyInsight,
          } as CritiqueThought;
        }

      case 'analysis':
        {
          const analInput = input as any;
          return {
            ...baseThought,
            mode: ThinkingMode.ANALYSIS,
            thoughtType: analInput.thoughtType || 'data_familiarization',
            methodology: analInput.methodology || 'thematic_analysis',
            dataSources: analInput.dataSources || [],
            dataSegments: analInput.dataSegments || [],
            totalSegments: analInput.totalSegments,
            codebook: analInput.codebook,
            currentCodes: analInput.currentCodes || [],
            codingProgress: analInput.codingProgress,
            themes: analInput.themes || [],
            thematicMap: analInput.thematicMap,
            memos: analInput.memos || [],
            gtCategories: analInput.gtCategories || [],
            theoreticalSampling: analInput.theoreticalSampling || [],
            discoursePatterns: analInput.discoursePatterns || [],
            rigorAssessment: analInput.rigorAssessment,
            dependencies: analInput.dependencies || [],
            assumptions: analInput.assumptions || [],
            uncertainty: analInput.uncertainty ?? 0.5,
            keyInsight: analInput.keyInsight,
          } as AnalysisThought;
        }

      case 'hybrid':
      default:
        return {
          ...baseThought,
          mode: ThinkingMode.HYBRID,
          thoughtType: toExtendedThoughtType(input.thoughtType, 'synthesis'),
          stage: input.stage as ShannonStage,
          uncertainty: input.uncertainty,
          dependencies: input.dependencies,
          assumptions: input.assumptions,
          mathematicalModel: input.mathematicalModel,
          tensorProperties: input.tensorProperties,
          physicalInterpretation: input.physicalInterpretation,
          primaryMode: (input.mode || ThinkingMode.HYBRID) as any,
          secondaryFeatures: [],
        } as any;
    }
  }
}

