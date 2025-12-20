/**
 * Thought Factory Service (v8.4.0)
 * Phase 10 Sprint 3: Full ModeHandler Integration
 *
 * Centralizes thought creation logic for all thinking modes.
 * Provides type-safe thought construction based on mode-specific requirements.
 *
 * RESPONSIBILITY:
 * - Create properly typed thought objects for all 33 thinking modes
 * - Delegate to specialized ModeHandlers via registry
 * - Apply mode-specific defaults and transformations
 * - Ensure thought structure consistency across modes
 *
 * ARCHITECTURE:
 * - Uses ModeHandlerRegistry for all mode handling (v8.4.0)
 * - All 33 modes have dedicated handlers
 * - Legacy switch statement kept for backward compatibility (deprecated)
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
import {
  ModeHandlerRegistry,
  ModeStatus,
  ValidationResult,
  registerAllHandlers,
} from '../modes/index.js';

/**
 * Configuration for ThoughtFactory
 */
export interface ThoughtFactoryConfig {
  /**
   * Whether to use the registry for all modes (true)
   * or fall back to switch statement for non-migrated modes (false)
   *
   * Default: true (v8.4.0 - all 33 modes have handlers)
   */
  useRegistryForAll?: boolean;

  /**
   * Whether to automatically register specialized handlers on construction
   *
   * Default: true
   */
  autoRegisterHandlers?: boolean;

  /**
   * Logger instance
   */
  logger?: ILogger;
}

/**
 * Thought Factory - Creates mode-specific thought objects
 *
 * Handles the complexity of creating properly structured thought objects
 * for all 33 thinking modes via the ModeHandler registry.
 *
 * As of v8.4.0, all modes have dedicated handlers:
 * - Core (5): Sequential, Shannon, Mathematics, Physics, Hybrid
 * - Fundamental Triad (3): Inductive, Deductive, Abductive
 * - Causal/Probabilistic (6): Causal, Bayesian, Counterfactual, Temporal, GameTheory, Evidential
 * - Analogical/First Principles (2): Analogical, FirstPrinciples
 * - Systems/Scientific (3): SystemsThinking, ScientificMethod, FormalLogic
 * - Academic (4): Synthesis, Argumentation, Critique, Analysis
 * - Engineering (4): Engineering, Computability, Cryptanalytic, Algorithmic
 * - Advanced Runtime (6): MetaReasoning, Recursive, Modal, Stochastic, Constraint, Optimization
 * - User-Defined (1): Custom
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
  private registry: ModeHandlerRegistry;
  private useRegistryForAll: boolean;

  constructor(config: ThoughtFactoryConfig = {}) {
    this.logger = config.logger || createLogger({ minLevel: LogLevel.INFO, enableConsole: true });
    this.registry = ModeHandlerRegistry.getInstance();
    this.useRegistryForAll = config.useRegistryForAll ?? true; // v8.4.0: all 33 modes have handlers

    // Auto-register all 33 handlers (Phase 10 Sprint 3)
    if (config.autoRegisterHandlers !== false) {
      this.registerAllModeHandlers();
    }
  }

  /**
   * Register all 33 mode handlers (Phase 10 Sprint 3 v8.4.0)
   *
   * Uses the centralized registerAllHandlers() function from modes/index.ts
   * which registers handlers for all ThinkingModes:
   * - Core (5): Sequential, Shannon, Mathematics, Physics, Hybrid
   * - Fundamental Triad (3): Inductive, Deductive, Abductive
   * - Causal/Probabilistic (6): Causal, Bayesian, Counterfactual, Temporal, GameTheory, Evidential
   * - Analogical/First Principles (2): Analogical, FirstPrinciples
   * - Systems/Scientific (3): SystemsThinking, ScientificMethod, FormalLogic
   * - Academic (4): Synthesis, Argumentation, Critique, Analysis
   * - Engineering (4): Engineering, Computability, Cryptanalytic, Algorithmic
   * - Advanced Runtime (6): MetaReasoning, Recursive, Modal, Stochastic, Constraint, Optimization
   * - User-Defined (1): Custom
   */
  private registerAllModeHandlers(): void {
    registerAllHandlers();

    const stats = this.registry.getStats();
    this.logger.debug('All mode handlers registered', {
      count: stats.specializedHandlers,
      categories: [
        'Core (5)',
        'Fundamental Triad (3)',
        'Causal/Probabilistic (6)',
        'Analogical/First Principles (2)',
        'Systems/Scientific (3)',
        'Academic (4)',
        'Engineering (4)',
        'Advanced Runtime (6)',
        'User-Defined (1)',
      ],
    });
  }

  // @deprecated registerSpecializedHandlers() - use registerAllModeHandlers() instead

  /**
   * Check if a mode has a specialized handler
   */
  hasSpecializedHandler(mode: ThinkingMode): boolean {
    return this.registry.hasSpecializedHandler(mode);
  }

  /**
   * Get stats about registered handlers
   */
  getStats(): { specializedHandlers: number; modesWithHandlers: ThinkingMode[] } {
    const stats = this.registry.getStats();
    return {
      specializedHandlers: stats.specializedHandlers,
      modesWithHandlers: stats.modesWithHandlers,
    };
  }

  /**
   * Validate input using appropriate handler
   *
   * @param input - Tool input to validate
   * @returns Validation result
   */
  validate(input: ThinkingToolInput): ValidationResult {
    return this.registry.validate(input);
  }

  /**
   * Get mode status for API response
   *
   * @param mode - The thinking mode
   * @returns Mode status information
   */
  getModeStatus(mode: ThinkingMode): ModeStatus {
    return this.registry.getModeStatus(mode);
  }

  /**
   * Get the underlying registry for direct access
   *
   * Use this to register new handlers or access registry stats.
   *
   * @returns The ModeHandlerRegistry instance
   */
  getRegistry(): ModeHandlerRegistry {
    return this.registry;
  }

  /**
   * Determine if registry should be used for a mode
   */
  private shouldUseRegistry(mode: ThinkingMode): boolean {
    // Always use registry if specialized handler exists
    if (this.registry.hasSpecializedHandler(mode)) {
      return true;
    }

    // Use registry for all modes if configured
    if (this.useRegistryForAll) {
      return true;
    }

    // Otherwise fall back to switch statement
    return false;
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
    const mode = (input.mode as ThinkingMode) || ThinkingMode.HYBRID;

    this.logger.debug('Creating thought', {
      sessionId,
      mode,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      isRevision: input.isRevision,
      hasSpecializedHandler: this.registry.hasSpecializedHandler(mode),
      useRegistryForAll: this.useRegistryForAll,
    });

    // Use registry handler if appropriate (Phase 10 Sprint 2/2B)
    if (this.shouldUseRegistry(mode)) {
      this.logger.debug('Using registry handler', { mode });
      return this.registry.createThought(input, sessionId);
    }

    // @deprecated: Legacy switch statement (v8.4.0 - should never be reached)
    // All 33 modes now have handlers. This code path only runs if:
    // 1. useRegistryForAll is explicitly set to false, AND
    // 2. A mode somehow lacks a handler
    // Kept for backward compatibility only.
    this.logger.warn('Using legacy switch statement - mode handler not found', { mode });
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

