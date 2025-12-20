/**
 * ArgumentationHandler - Phase 15 (v8.4.0)
 *
 * Specialized handler for Argumentation reasoning:
 * - Toulmin model validation
 * - Argument strength calculation
 * - Fallacy detection
 * - Dialectic analysis
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, ArgumentationThought } from '../../types/core.js';
import type {
  ArgumentationThoughtType,
  ToulminArgument,
  Warrant,
  LogicalFallacy,
  DialecticAnalysis,
} from '../../types/modes/argumentation.js';
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
 * Common logical fallacies to detect
 */
const COMMON_FALLACIES: { name: string; category: 'formal' | 'informal'; patterns: string[] }[] = [
  { name: 'Ad Hominem', category: 'informal', patterns: ['attacks the person', 'character of'] },
  { name: 'Straw Man', category: 'informal', patterns: ['misrepresents', 'exaggerated version'] },
  { name: 'False Dilemma', category: 'informal', patterns: ['either/or', 'only two options'] },
  { name: 'Circular Reasoning', category: 'formal', patterns: ['because it is', 'self-evident'] },
  { name: 'Appeal to Authority', category: 'informal', patterns: ['expert says', 'authority claims'] },
  { name: 'Hasty Generalization', category: 'informal', patterns: ['always', 'never', 'all', 'none'] },
  { name: 'Red Herring', category: 'informal', patterns: ['but what about', 'changing subject'] },
  { name: 'Slippery Slope', category: 'informal', patterns: ['will lead to', 'eventually'] },
  { name: 'Appeal to Emotion', category: 'informal', patterns: ['feel', 'fear', 'outrage'] },
  { name: 'False Cause', category: 'formal', patterns: ['caused by', 'therefore'] },
];

/**
 * ArgumentationHandler - Specialized handler for academic argumentation
 *
 * Provides semantic validation and enhancement:
 * - Validates Toulmin argument structure
 * - Calculates argument strength from components
 * - Detects common logical fallacies
 * - Analyzes dialectic positions
 */
export class ArgumentationHandler implements ModeHandler {
  readonly mode = ThinkingMode.ARGUMENTATION;
  readonly modeName = 'Academic Argumentation';
  readonly description = 'Toulmin model argumentation with dialectic analysis and fallacy detection';

  private readonly supportedThoughtTypes: ArgumentationThoughtType[] = [
    'claim_formulation',
    'grounds_identification',
    'warrant_construction',
    'backing_provision',
    'rebuttal_anticipation',
    'qualifier_specification',
    'argument_assembly',
    'dialectic_analysis',
  ];

  /**
   * Create an argumentation thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): ArgumentationThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

    // Process arguments and calculate strength
    const arguments_ = this.processArguments(inputAny.arguments || []);
    const argumentStrength = this.calculateOverallStrength(arguments_, inputAny);

    // Detect fallacies
    const detectedFallacies = inputAny.fallacies || this.detectFallacies(inputAny);

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
      mode: ThinkingMode.ARGUMENTATION,
      thoughtType,
      claims: inputAny.claims || [],
      currentClaim: inputAny.currentClaim,
      grounds: inputAny.grounds || [],
      warrants: inputAny.warrants || [],
      backings: inputAny.backings || [],
      qualifiers: inputAny.qualifiers || [],
      rebuttals: inputAny.rebuttals || [],
      arguments: arguments_,
      currentArgument: inputAny.currentArgument,
      argumentChain: inputAny.argumentChain,
      dialectic: inputAny.dialectic,
      rhetoricalStrategies: inputAny.rhetoricalStrategies || [],
      audienceConsideration: inputAny.audienceConsideration,
      fallacies: detectedFallacies,
      argumentStrength,
      dependencies: inputAny.dependencies || [],
      assumptions: input.assumptions || [],
      uncertainty: inputAny.uncertainty ?? 0.5,
      keyInsight: inputAny.keyInsight,
    } as ArgumentationThought;
  }

  /**
   * Validate argumentation-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const inputAny = input as any;

    // Check for claims
    if ((!inputAny.claims || inputAny.claims.length === 0) && !inputAny.currentClaim) {
      warnings.push(
        createValidationWarning(
          'claims',
          'No claims specified',
          'Formulate a clear claim or thesis for your argument'
        )
      );
    }

    // Validate Toulmin structure completeness
    if (inputAny.currentArgument || (inputAny.arguments && inputAny.arguments.length > 0)) {
      const args = inputAny.arguments || [inputAny.currentArgument];
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const argValidation = this.validateToulminArgument(arg, i);
        warnings.push(...argValidation.warnings);
        errors.push(...argValidation.errors);
      }
    }

    // Check grounds-to-claim ratio
    const groundsCount = inputAny.grounds?.length || 0;
    const claimsCount = inputAny.claims?.length || (inputAny.currentClaim ? 1 : 0);
    if (claimsCount > 0 && groundsCount === 0) {
      warnings.push(
        createValidationWarning(
          'grounds',
          'Claims lack supporting grounds/evidence',
          'Provide evidence or data to support your claims'
        )
      );
    }

    // Check for warrants
    if (groundsCount > 0 && (!inputAny.warrants || inputAny.warrants.length === 0)) {
      warnings.push(
        createValidationWarning(
          'warrants',
          'No warrants connecting grounds to claims',
          'Explain how your evidence supports your claim'
        )
      );
    }

    // Check warrant strength
    if (inputAny.warrants) {
      const weakWarrants = inputAny.warrants.filter((w: Warrant) => w.strength < 0.5);
      if (weakWarrants.length > inputAny.warrants.length / 2) {
        warnings.push(
          createValidationWarning(
            'warrants',
            'Many warrants have low strength',
            'Consider strengthening warrants with additional backing'
          )
        );
      }
    }

    // Check for rebuttals (thorough argumentation considers counter-arguments)
    if (inputAny.arguments?.length > 0 && (!inputAny.rebuttals || inputAny.rebuttals.length === 0)) {
      warnings.push(
        createValidationWarning(
          'rebuttals',
          'No counter-arguments addressed',
          'Anticipate and address potential rebuttals for stronger argumentation'
        )
      );
    }

    // Check dialectic completeness
    if (inputAny.dialectic) {
      const dialecticValidation = this.validateDialectic(inputAny.dialectic);
      warnings.push(...dialecticValidation.warnings);
    }

    // Check for detected fallacies
    if (inputAny.fallacies && inputAny.fallacies.length > 0) {
      const criticalFallacies = inputAny.fallacies.filter((f: LogicalFallacy) => f.severity === 'critical');
      if (criticalFallacies.length > 0) {
        warnings.push(
          createValidationWarning(
            'fallacies',
            `${criticalFallacies.length} critical fallacies detected`,
            'Address critical logical fallacies before finalizing argument'
          )
        );
      }
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }
    return validationSuccess(warnings);
  }

  /**
   * Get mode-specific enhancements
   */
  getEnhancements(thought: ArgumentationThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.FORMALLOGIC, ThinkingMode.DEDUCTIVE, ThinkingMode.CRITIQUE],
      metrics: {},
      guidingQuestions: [],
      mentalModels: [
        'Toulmin Model',
        'Dialectic Method',
        'Rhetorical Triangle (Ethos, Pathos, Logos)',
        'Logical Validity',
        'Counter-argument Analysis',
      ],
    };

    const claims = thought.claims || [];
    const grounds = thought.grounds || [];
    const warrants = thought.warrants || [];
    const rebuttals = thought.rebuttals || [];
    const arguments_ = thought.arguments || [];
    const fallacies = thought.fallacies || [];

    // Calculate metrics
    const groundsToClaimRatio = claims.length > 0 ? grounds.length / claims.length : 0;
    const warrantsPerClaim = claims.length > 0 ? warrants.length / claims.length : 0;
    const rebuttalCoverage = arguments_.length > 0 ? rebuttals.length / arguments_.length : 0;
    const avgGroundsReliability = grounds.length > 0
      ? grounds.reduce((sum, g) => sum + (g.reliability || 0), 0) / grounds.length
      : 0;

    enhancements.metrics = {
      claimCount: claims.length,
      groundsCount: grounds.length,
      warrantsCount: warrants.length,
      rebuttalCount: rebuttals.length,
      argumentCount: arguments_.length,
      fallacyCount: fallacies.length,
      argumentStrength: thought.argumentStrength,
      groundsToClaimRatio,
      warrantsPerClaim,
      rebuttalCoverage,
      avgGroundsReliability,
    };

    // Stage-specific suggestions
    const thoughtType = thought.thoughtType;

    if (thoughtType === 'claim_formulation') {
      enhancements.suggestions!.push('Ensure claim is specific, debatable, and significant');
      enhancements.guidingQuestions!.push('Is this claim falsifiable and not self-evident?');
    }

    if (thoughtType === 'grounds_identification') {
      enhancements.suggestions!.push('Gather diverse types of evidence: empirical, statistical, testimonial');
      if (avgGroundsReliability < 0.6) {
        enhancements.suggestions!.push('Consider strengthening evidence reliability');
      }
    }

    if (thoughtType === 'warrant_construction') {
      const implicitWarrants = warrants.filter((w) => w.implicit);
      if (implicitWarrants.length > warrants.length * 0.5) {
        enhancements.suggestions!.push('Many warrants are implicit - consider making them explicit');
      }
    }

    if (thoughtType === 'rebuttal_anticipation') {
      enhancements.suggestions!.push('Consider rebuttals targeting each Toulmin element');
      enhancements.guidingQuestions!.push('What would a skeptic say about this argument?');
    }

    if (thoughtType === 'dialectic_analysis' && thought.dialectic) {
      if (!thought.dialectic.synthesis) {
        enhancements.suggestions!.push('Develop a synthesis that transcends thesis and antithesis');
      }
    }

    // Fallacy warnings
    if (fallacies.length > 0) {
      enhancements.warnings = enhancements.warnings || [];
      for (const fallacy of fallacies) {
        enhancements.warnings.push(`${fallacy.severity} fallacy: ${fallacy.name} - ${fallacy.description}`);
      }
    }

    // Argument strength assessment
    if (thought.argumentStrength < 0.5) {
      enhancements.suggestions!.push('Argument strength is low - consider adding more grounds or strengthening warrants');
    } else if (thought.argumentStrength > 0.8) {
      enhancements.suggestions!.push('Strong argument - consider addressing potential rebuttals');
    }

    // Guiding questions
    enhancements.guidingQuestions!.push(
      'Is the evidence sufficient and relevant to the claim?',
      'Are there unstated assumptions in the warrants?',
      'What are the strongest counter-arguments?',
      'Does the qualifier appropriately limit the claim\'s scope?'
    );

    return enhancements;
  }

  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as ArgumentationThoughtType);
  }

  /**
   * Resolve thought type to valid ArgumentationThoughtType
   */
  private resolveThoughtType(inputType: string | undefined): ArgumentationThoughtType {
    if (inputType && this.supportedThoughtTypes.includes(inputType as ArgumentationThoughtType)) {
      return inputType as ArgumentationThoughtType;
    }
    return 'claim_formulation';
  }

  /**
   * Process arguments with defaults
   */
  private processArguments(arguments_: ToulminArgument[]): ToulminArgument[] {
    return arguments_.map((arg) => ({
      id: arg.id || randomUUID(),
      name: arg.name,
      claim: arg.claim,
      grounds: arg.grounds || [],
      warrants: arg.warrants || [],
      backings: arg.backings || [],
      qualifiers: arg.qualifiers || [],
      rebuttals: arg.rebuttals || [],
      overallStrength: arg.overallStrength ?? this.calculateArgumentStrength(arg),
      validity: arg.validity || 'questionable',
      soundness: arg.soundness || 'questionable',
    }));
  }

  /**
   * Calculate strength of a single Toulmin argument
   */
  private calculateArgumentStrength(arg: ToulminArgument): number {
    let strength = 0.5;

    // Grounds contribution
    if (arg.grounds && arg.grounds.length > 0) {
      const avgReliability = arg.grounds.reduce((sum, g) => sum + (g.reliability || 0.5), 0) / arg.grounds.length;
      const avgRelevance = arg.grounds.reduce((sum, g) => sum + (g.relevance || 0.5), 0) / arg.grounds.length;
      strength += (avgReliability + avgRelevance) * 0.15;
    }

    // Warrants contribution
    if (arg.warrants && arg.warrants.length > 0) {
      const avgWarrantStrength = arg.warrants.reduce((sum, w) => sum + (w.strength || 0.5), 0) / arg.warrants.length;
      strength += avgWarrantStrength * 0.15;
    }

    // Backing contribution
    if (arg.backings && arg.backings.length > 0) {
      strength += 0.1;
    }

    // Rebuttals addressed
    if (arg.rebuttals && arg.rebuttals.length > 0) {
      const addressedRebuttals = arg.rebuttals.filter((r) => r.response).length;
      strength += (addressedRebuttals / arg.rebuttals.length) * 0.1;
    }

    return Math.min(Math.max(strength, 0), 1);
  }

  /**
   * Calculate overall argument strength for the thought
   */
  private calculateOverallStrength(arguments_: ToulminArgument[], input: any): number {
    if (arguments_.length > 0) {
      return arguments_.reduce((sum, arg) => sum + arg.overallStrength, 0) / arguments_.length;
    }

    // Calculate from individual components if no complete arguments
    let strength = 0.3;

    if (input.grounds?.length > 0) strength += 0.15;
    if (input.warrants?.length > 0) strength += 0.15;
    if (input.backings?.length > 0) strength += 0.1;
    if (input.qualifiers?.length > 0) strength += 0.1;
    if (input.rebuttals?.length > 0) strength += 0.1;

    return Math.min(strength, 1);
  }

  /**
   * Detect potential logical fallacies
   */
  private detectFallacies(input: any): LogicalFallacy[] {
    const fallacies: LogicalFallacy[] = [];
    const content = input.thought?.toLowerCase() || '';

    // Simple pattern-based fallacy detection
    for (const fallacy of COMMON_FALLACIES) {
      for (const pattern of fallacy.patterns) {
        if (content.includes(pattern.toLowerCase())) {
          fallacies.push({
            id: randomUUID(),
            name: fallacy.name,
            category: fallacy.category,
            description: `Potential ${fallacy.name} detected based on language patterns`,
            location: 'thought content',
            severity: 'minor',
          });
          break;
        }
      }
    }

    // Check for circular reasoning in warrants
    if (input.warrants && input.claims) {
      for (const warrant of input.warrants) {
        for (const claim of input.claims) {
          if (warrant.statement?.toLowerCase().includes(claim.statement?.toLowerCase().slice(0, 20))) {
            fallacies.push({
              id: randomUUID(),
              name: 'Circular Reasoning',
              category: 'formal',
              description: 'Warrant appears to restate the claim',
              location: `warrant ${warrant.id}`,
              severity: 'significant',
            });
          }
        }
      }
    }

    return fallacies;
  }

  /**
   * Validate Toulmin argument structure
   */
  private validateToulminArgument(arg: ToulminArgument, index: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!arg.claim) {
      errors.push(
        createValidationError(
          `arguments[${index}].claim`,
          'Argument has no claim',
          'MISSING_CLAIM'
        )
      );
    }

    if (!arg.grounds || arg.grounds.length === 0) {
      warnings.push(
        createValidationWarning(
          `arguments[${index}].grounds`,
          'Argument has no grounds/evidence',
          'Add supporting evidence for the claim'
        )
      );
    }

    if (!arg.warrants || arg.warrants.length === 0) {
      warnings.push(
        createValidationWarning(
          `arguments[${index}].warrants`,
          'Argument has no warrants',
          'Explain the reasoning connecting evidence to claim'
        )
      );
    }

    // Check for weak warrants without backing
    if (arg.warrants) {
      const weakWithoutBacking = arg.warrants.filter(
        (w) => w.strength < 0.6 && !arg.backings?.some((b) => b.warrantId === w.id)
      );
      if (weakWithoutBacking.length > 0) {
        warnings.push(
          createValidationWarning(
            `arguments[${index}].warrants`,
            'Some weak warrants lack backing',
            'Strengthen weak warrants with additional support'
          )
        );
      }
    }

    return errors.length > 0 ? validationFailure(errors, warnings) : validationSuccess(warnings);
  }

  /**
   * Validate dialectic analysis
   */
  private validateDialectic(dialectic: DialecticAnalysis): ValidationResult {
    const warnings: ValidationWarning[] = [];

    if (!dialectic.thesis) {
      warnings.push(
        createValidationWarning(
          'dialectic.thesis',
          'No thesis position defined',
          'Define the initial thesis position'
        )
      );
    }

    if (!dialectic.antithesis) {
      warnings.push(
        createValidationWarning(
          'dialectic.antithesis',
          'No antithesis position defined',
          'Define the opposing antithesis position'
        )
      );
    }

    if (dialectic.resolution === 'synthesis_achieved' && !dialectic.synthesis) {
      warnings.push(
        createValidationWarning(
          'dialectic.synthesis',
          'Resolution claims synthesis but no synthesis defined',
          'Provide the synthesis that transcends both positions'
        )
      );
    }

    return validationSuccess(warnings);
  }
}
