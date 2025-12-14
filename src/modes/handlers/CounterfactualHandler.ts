/**
 * CounterfactualHandler - Phase 10 Sprint 2B (v8.2.0)
 *
 * Specialized handler for Counterfactual reasoning mode with:
 * - World state tracking and validation
 * - Divergence point identification
 * - Outcome comparison between actual and hypothetical scenarios
 * - Causal chain validation
 */

import { randomUUID } from 'crypto';
import {
  ThinkingMode,
  CounterfactualThought,
  Scenario,
  Condition,
  CounterfactualComparison,
  InterventionPoint,
  CausalChain,
  Difference,
} from '../../types/core.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

/**
 * Thought types specific to counterfactual mode
 */
type CounterfactualThoughtType =
  | 'problem_definition'
  | 'scenario_construction'
  | 'divergence_analysis'
  | 'outcome_comparison'
  | 'intervention_identification'
  | 'causal_chain_analysis';

/**
 * CounterfactualHandler - Specialized handler for counterfactual reasoning
 *
 * Provides semantic validation beyond schema validation:
 * - Validates that actual scenario has required fields
 * - Validates counterfactual scenarios have interventions marked
 * - Detects missing divergence points
 * - Validates outcome probability ranges
 */
export class CounterfactualHandler implements ModeHandler {
  readonly mode = ThinkingMode.COUNTERFACTUAL;
  readonly modeName = 'Counterfactual Analysis';
  readonly description = 'What-if analysis with world state tracking and divergence point identification';

  /**
   * Supported thought types for counterfactual mode
   */
  private readonly supportedThoughtTypes: CounterfactualThoughtType[] = [
    'problem_definition',
    'scenario_construction',
    'divergence_analysis',
    'outcome_comparison',
    'intervention_identification',
    'causal_chain_analysis',
  ];

  /**
   * Create a counterfactual thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): CounterfactualThought {
    const inputAny = input as any;

    // Build actual scenario (matching core.ts Scenario type)
    const actual: Scenario = inputAny.actual || {
      id: randomUUID().slice(0, 8),
      name: 'Actual Scenario',
      description: '',
      conditions: inputAny.actualConditions || [],
      outcomes: inputAny.actualOutcomes || [],
    };

    // Build counterfactual scenarios
    const counterfactuals: Scenario[] = inputAny.counterfactuals || [];

    // Build comparison (using Difference type from core.ts)
    const comparison: CounterfactualComparison = inputAny.comparison || {
      differences: [] as Difference[],
      insights: [],
      lessons: [],
    };

    // Build intervention point
    const interventionPoint: InterventionPoint = inputAny.interventionPoint || {
      description: '',
      timing: '',
      feasibility: 0.5,
      expectedImpact: 0.5,
    };

    const thought: CounterfactualThought = {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
      mode: ThinkingMode.COUNTERFACTUAL,
      actual,
      counterfactuals,
      comparison,
      interventionPoint,
      causalChains: inputAny.causalChains || [],
    };
    return thought;
  }

  /**
   * Validate counterfactual-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const inputAny = input as any;

    // Basic validation
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError('thought', 'Thought content is required', 'EMPTY_THOUGHT'),
      ]);
    }

    if (input.thoughtNumber > input.totalThoughts) {
      return validationFailure([
        createValidationError(
          'thoughtNumber',
          `Thought number (${input.thoughtNumber}) exceeds total thoughts (${input.totalThoughts})`,
          'INVALID_THOUGHT_NUMBER'
        ),
      ]);
    }

    // Validate actual scenario
    if (inputAny.actual) {
      const actualValidation = this.validateScenario(inputAny.actual, 'actual');
      errors.push(...actualValidation.errors);
      warnings.push(...actualValidation.warnings);
    }

    // Validate counterfactual scenarios
    if (inputAny.counterfactuals && Array.isArray(inputAny.counterfactuals)) {
      for (let i = 0; i < inputAny.counterfactuals.length; i++) {
        const cf = inputAny.counterfactuals[i];
        const cfValidation = this.validateScenario(cf, `counterfactuals[${i}]`);
        errors.push(...cfValidation.errors);
        warnings.push(...cfValidation.warnings);

        // Check for intervention markers
        if (cf.conditions && Array.isArray(cf.conditions)) {
          const hasIntervention = cf.conditions.some((c: Condition) => c.isIntervention === true);
          if (!hasIntervention) {
            warnings.push(
              createValidationWarning(
                `counterfactuals[${i}]`,
                'Counterfactual scenario has no conditions marked as interventions',
                'Mark changed conditions with isIntervention: true to track divergence points'
              )
            );
          }
        }
      }

      // Warn if no counterfactuals provided
      if (inputAny.counterfactuals.length === 0 && inputAny.actual) {
        warnings.push(
          createValidationWarning(
            'counterfactuals',
            'No counterfactual scenarios provided',
            'Add alternative scenarios to explore what-if possibilities'
          )
        );
      }
    }

    // Validate intervention point
    if (inputAny.interventionPoint) {
      const ipValidation = this.validateInterventionPoint(inputAny.interventionPoint);
      errors.push(...ipValidation.errors);
      warnings.push(...ipValidation.warnings);
    }

    // Validate causal chains
    if (inputAny.causalChains && Array.isArray(inputAny.causalChains)) {
      for (let i = 0; i < inputAny.causalChains.length; i++) {
        const chain = inputAny.causalChains[i];
        const chainValidation = this.validateCausalChain(chain, i);
        errors.push(...chainValidation.errors);
        warnings.push(...chainValidation.warnings);
      }
    }

    // Validate comparison if present
    if (inputAny.comparison) {
      const compValidation = this.validateComparison(inputAny.comparison);
      warnings.push(...compValidation.warnings);
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get counterfactual-specific enhancements
   */
  getEnhancements(thought: CounterfactualThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.CAUSAL, ThinkingMode.BAYESIAN, ThinkingMode.TEMPORAL],
      guidingQuestions: [],
      warnings: [],
      mentalModels: ['Possible Worlds', 'Nearest World Semantics', 'Intervention Calculus'],
    };

    // Calculate metrics
    const actualConditions = thought.actual?.conditions?.length || 0;
    const counterfactualCount = thought.counterfactuals?.length || 0;
    const totalInterventions = this.countInterventions(thought);

    enhancements.metrics = {
      actualConditions,
      counterfactualCount,
      totalInterventions,
      comparisonDepth: this.calculateComparisonDepth(thought.comparison),
    };

    // Suggest based on content
    if (counterfactualCount === 0) {
      enhancements.suggestions!.push(
        'Define at least one counterfactual scenario to explore alternatives'
      );
    } else if (counterfactualCount === 1) {
      enhancements.suggestions!.push(
        'Consider adding more counterfactual scenarios to explore the decision space'
      );
    }

    if (totalInterventions === 0 && counterfactualCount > 0) {
      enhancements.suggestions!.push(
        'Mark which conditions were changed from actual using isIntervention: true'
      );
    }

    // Add guiding questions
    if (thought.actual && thought.actual.outcomes && thought.actual.outcomes.length > 0) {
      enhancements.guidingQuestions!.push(
        'What single change would have most altered the actual outcome?'
      );
    }

    if (thought.interventionPoint && thought.interventionPoint.description) {
      enhancements.guidingQuestions!.push(
        `Is the intervention point "${thought.interventionPoint.description}" the earliest possible point of change?`
      );
    }

    if (!thought.causalChains || thought.causalChains.length === 0) {
      enhancements.guidingQuestions!.push(
        'What causal chain led from conditions to outcome?'
      );
    }

    // Check for common issues
    if (thought.comparison) {
      if (thought.comparison.insights.length === 0) {
        enhancements.warnings!.push(
          'No insights extracted from comparison. What did the counterfactual analysis reveal?'
        );
      }
      if (thought.comparison.lessons.length === 0) {
        enhancements.guidingQuestions!.push(
          'What actionable lessons can be drawn from this counterfactual analysis?'
        );
      }
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as CounterfactualThoughtType);
  }

  /**
   * Validate a scenario
   */
  private validateScenario(scenario: Scenario, path: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!scenario.name || scenario.name.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          `${path}.name`,
          'Scenario has no name',
          'Add a descriptive name to identify the scenario'
        )
      );
    }

    // Validate conditions
    if (scenario.conditions && Array.isArray(scenario.conditions)) {
      for (let i = 0; i < scenario.conditions.length; i++) {
        const condition = scenario.conditions[i];
        if (!condition.factor || condition.factor.trim().length === 0) {
          warnings.push(
            createValidationWarning(
              `${path}.conditions[${i}].factor`,
              'Condition has no factor specified',
              'Each condition should identify what factor is being set'
            )
          );
        }
      }
    }

    // Validate outcomes
    if (scenario.outcomes && scenario.outcomes.length > 0) {
      for (let i = 0; i < scenario.outcomes.length; i++) {
        const outcome = scenario.outcomes[i];
        if ((outcome as any).magnitude !== undefined) {
          const magnitude = (outcome as any).magnitude;
          if (magnitude < 0 || magnitude > 1) {
            warnings.push(
              createValidationWarning(
                `${path}.outcomes[${i}].magnitude`,
                `Outcome magnitude ${magnitude} is outside [0, 1] range`,
                'Magnitude should be normalized to [0, 1]'
              )
            );
          }
        }
      }
    }

    if (scenario.likelihood !== undefined) {
      if (scenario.likelihood < 0 || scenario.likelihood > 1) {
        warnings.push(
          createValidationWarning(
            `${path}.likelihood`,
            `Scenario likelihood ${scenario.likelihood} is outside [0, 1] range`,
            'Likelihood must be between 0 and 1'
          )
        );
      }
    }

    return errors.length > 0 ? validationFailure(errors, warnings) : validationSuccess(warnings);
  }

  /**
   * Validate intervention point
   */
  private validateInterventionPoint(ip: InterventionPoint): ValidationResult {
    const warnings = [];

    if (ip.feasibility !== undefined) {
      if (ip.feasibility < 0 || ip.feasibility > 1) {
        warnings.push(
          createValidationWarning(
            'interventionPoint.feasibility',
            `Feasibility ${ip.feasibility} is outside [0, 1] range`,
            'Feasibility should be a probability between 0 and 1'
          )
        );
      }
    }

    if (ip.expectedImpact !== undefined) {
      if (ip.expectedImpact < 0 || ip.expectedImpact > 1) {
        warnings.push(
          createValidationWarning(
            'interventionPoint.expectedImpact',
            `Expected impact ${ip.expectedImpact} is outside [0, 1] range`,
            'Expected impact should be normalized to [0, 1]'
          )
        );
      }
    }

    if (!ip.description || ip.description.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          'interventionPoint.description',
          'Intervention point has no description',
          'Describe what intervention would be made at this point'
        )
      );
    }

    if (!ip.timing || ip.timing.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          'interventionPoint.timing',
          'Intervention point has no timing specified',
          'Specify when the intervention would occur'
        )
      );
    }

    return validationSuccess(warnings);
  }

  /**
   * Validate causal chain
   */
  private validateCausalChain(chain: CausalChain, index: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!chain.id || chain.id.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          `causalChains[${index}].id`,
          'Causal chain has no ID',
          'Add an ID to track the causal chain'
        )
      );
    }

    if (!chain.events || chain.events.length === 0) {
      warnings.push(
        createValidationWarning(
          `causalChains[${index}].events`,
          'Causal chain has no events',
          'Add events to show the causal sequence'
        )
      );
    } else if (chain.events.length < 2) {
      warnings.push(
        createValidationWarning(
          `causalChains[${index}].events`,
          'Causal chain has only one event',
          'A causal chain should have at least two events to show causation'
        )
      );
    }

    if (!chain.branchingPoint || chain.branchingPoint.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          `causalChains[${index}].branchingPoint`,
          'Causal chain has no branching point',
          'Identify where actual and counterfactual paths diverge'
        )
      );
    }

    return errors.length > 0 ? validationFailure(errors, warnings) : validationSuccess(warnings);
  }

  /**
   * Validate comparison
   */
  private validateComparison(comparison: CounterfactualComparison): ValidationResult {
    const warnings: ValidationWarning[] = [];

    if (!comparison.differences || comparison.differences.length === 0) {
      warnings.push(
        createValidationWarning(
          'comparison.differences',
          'No differences identified between scenarios',
          'List key differences between actual and counterfactual scenarios'
        )
      );
    }

    return validationSuccess(warnings);
  }

  /**
   * Count total interventions across all counterfactual scenarios
   */
  private countInterventions(thought: CounterfactualThought): number {
    let count = 0;
    if (thought.counterfactuals) {
      for (const cf of thought.counterfactuals) {
        if (cf.conditions) {
          count += cf.conditions.filter(c => c.isIntervention === true).length;
        }
      }
    }
    return count;
  }

  /**
   * Calculate comparison depth based on fields populated
   */
  private calculateComparisonDepth(comparison?: CounterfactualComparison): number {
    if (!comparison) return 0;
    let depth = 0;
    if (comparison.differences && comparison.differences.length > 0) depth++;
    if (comparison.insights && comparison.insights.length > 0) depth++;
    if (comparison.lessons && comparison.lessons.length > 0) depth++;
    return depth;
  }
}
