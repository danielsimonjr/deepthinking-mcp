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
  AbductiveThought,
  CausalThought,
  Thought,
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

    switch (input.mode) {
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
        return {
          ...baseThought,
          mode: ThinkingMode.CAUSAL,
          thoughtType: toExtendedThoughtType(input.thoughtType, 'problem_definition'),
          causalGraph: input.causalGraph,
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
