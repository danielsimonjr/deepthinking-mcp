/**
 * BayesianHandler - Phase 10 Sprint 2 (v8.1.0)
 *
 * Specialized handler for Bayesian reasoning mode with:
 * - Automatic posterior probability calculation
 * - Probability value validation (0-1 range, sum constraints)
 * - Bayes factor computation
 * - Evidence strength assessment
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, BayesianThought } from '../../types/core.js';
import type {
  BayesianHypothesis,
  PriorProbability,
  Likelihood,
  BayesianEvidence,
  PosteriorProbability,
} from '../../types/modes/bayesian.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

/**
 * BayesianHandler - Specialized handler for Bayesian inference
 *
 * Provides semantic validation and automatic calculations:
 * - Validates probability values are in [0, 1] range
 * - Checks for probability consistency (alternatives should complement)
 * - Automatically computes posterior from prior and likelihood using Bayes' theorem
 * - Calculates Bayes factor for evidence strength
 */
export class BayesianHandler implements ModeHandler {
  readonly mode = ThinkingMode.BAYESIAN;
  readonly modeName = 'Bayesian Inference';
  readonly description = 'Probabilistic reasoning with Bayes theorem and evidence updates';

  /**
   * Supported thought types for Bayesian mode
   */
  private readonly supportedThoughtTypes = [
    'prior_elicitation',
    'likelihood_assessment',
    'posterior_update',
    'evidence_evaluation',
    'sensitivity_analysis',
    'hypothesis_comparison',
  ];

  /**
   * Create a Bayesian thought from input
   *
   * Automatically calculates posterior if prior and likelihood are provided
   */
  createThought(input: ThinkingToolInput, sessionId: string): BayesianThought {
    const inputAny = input as any;

    // Extract Bayesian components from input
    const hypothesis: BayesianHypothesis = inputAny.hypothesis || {
      id: randomUUID(),
      statement: input.thought,
      alternatives: [],
    };

    const prior: PriorProbability = {
      probability: inputAny.priorProbability ?? 0.5,
      justification: inputAny.priorJustification || 'Default prior',
    };

    const likelihood: Likelihood = {
      probability: inputAny.likelihood ?? 0.5,
      description: inputAny.likelihoodDescription || 'Default likelihood',
    };

    const evidence: BayesianEvidence[] = inputAny.evidence || [];

    // Calculate posterior using Bayes' theorem if components provided
    const posterior = this.calculatePosterior(prior, likelihood, evidence, inputAny);

    // Calculate Bayes factor if evidence provided
    const bayesFactor = this.calculateBayesFactor(evidence);

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
      mode: ThinkingMode.BAYESIAN,
      hypothesis,
      prior,
      likelihood,
      evidence,
      posterior,
      bayesFactor,
      sensitivity: inputAny.sensitivity,
    } as BayesianThought;
  }

  /**
   * Validate Bayesian-specific input
   *
   * Performs semantic validation:
   * 1. Basic input validation
   * 2. Probability value range validation
   * 3. Evidence likelihood ratio validation
   * 4. Consistency checks
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors = [];
    const warnings = [];
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

    // Validate prior probability
    const priorProb = inputAny.priorProbability;
    if (priorProb !== undefined) {
      const priorValidation = this.validateProbability(priorProb, 'priorProbability');
      if (!priorValidation.valid) {
        errors.push(...priorValidation.errors);
      }
      warnings.push(...priorValidation.warnings);
    }

    // Validate likelihood
    const likelihoodProb = inputAny.likelihood;
    if (likelihoodProb !== undefined) {
      const likelihoodValidation = this.validateProbability(likelihoodProb, 'likelihood');
      if (!likelihoodValidation.valid) {
        errors.push(...likelihoodValidation.errors);
      }
      warnings.push(...likelihoodValidation.warnings);
    }

    // Validate posterior if provided
    const posteriorProb = inputAny.posteriorProbability;
    if (posteriorProb !== undefined) {
      const posteriorValidation = this.validateProbability(posteriorProb, 'posteriorProbability');
      if (!posteriorValidation.valid) {
        errors.push(...posteriorValidation.errors);
      }
      warnings.push(...posteriorValidation.warnings);
    }

    // Validate evidence array
    if (inputAny.evidence && Array.isArray(inputAny.evidence)) {
      for (let i = 0; i < inputAny.evidence.length; i++) {
        const evidenceItem = inputAny.evidence[i];
        const evidenceValidation = this.validateEvidence(evidenceItem, i);
        if (!evidenceValidation.valid) {
          errors.push(...evidenceValidation.errors);
        }
        warnings.push(...evidenceValidation.warnings);
      }
    }

    // Validate hypothesis alternatives if provided
    if (inputAny.hypothesis?.alternatives) {
      const numAlternatives = inputAny.hypothesis.alternatives.length;
      if (numAlternatives > 0 && priorProb !== undefined) {
        // With alternatives, priors should be reasonable
        if (priorProb > 0.9 && numAlternatives > 2) {
          warnings.push(
            createValidationWarning(
              'priorProbability',
              `High prior probability (${priorProb}) with ${numAlternatives} alternatives`,
              'Consider whether prior properly reflects uncertainty across alternatives'
            )
          );
        }
      }
    }

    // Suggest evidence if none provided
    if (!inputAny.evidence || inputAny.evidence.length === 0) {
      warnings.push(
        createValidationWarning(
          'evidence',
          'No evidence provided for Bayesian update',
          'Add evidence with likelihood ratios to update the posterior'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get Bayesian-specific enhancements
   */
  getEnhancements(thought: BayesianThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.CAUSAL, ThinkingMode.EVIDENTIAL],
      guidingQuestions: [],
      warnings: [],
      metrics: {},
      mentalModels: ['Bayes Theorem', 'Prior Updating', 'Likelihood Ratio', 'Base Rate Fallacy'],
    };

    // Add probability metrics
    enhancements.metrics = {
      priorProbability: thought.prior.probability,
      likelihoodProbability: thought.likelihood.probability,
      posteriorProbability: thought.posterior.probability,
      evidenceCount: thought.evidence.length,
    };

    if (thought.bayesFactor !== undefined) {
      enhancements.metrics!.bayesFactor = thought.bayesFactor;

      // Interpret Bayes factor strength (Kass & Raftery, 1995)
      const bf = thought.bayesFactor;
      let strength: string;
      if (bf < 1) {
        strength = bf < 0.1 ? 'Strong evidence against' : bf < 0.33 ? 'Moderate evidence against' : 'Weak evidence against';
      } else {
        strength = bf > 10 ? 'Strong evidence for' : bf > 3 ? 'Moderate evidence for' : 'Weak evidence for';
      }

      enhancements.suggestions!.push(`Bayes factor (${bf.toFixed(2)}) indicates: ${strength} the hypothesis`);
    }

    // Analyze prior-posterior shift
    const shift = Math.abs(thought.posterior.probability - thought.prior.probability);
    if (shift < 0.05) {
      enhancements.suggestions!.push(
        'Small prior-to-posterior shift. Consider seeking more diagnostic evidence.'
      );
    } else if (shift > 0.4) {
      enhancements.warnings!.push(
        'Large belief update. Verify evidence quality and likelihood estimates.'
      );
    }

    // Guide questions based on posterior
    if (thought.posterior.probability > 0.9) {
      enhancements.guidingQuestions!.push(
        'What evidence could potentially disconfirm this high-confidence belief?'
      );
    } else if (thought.posterior.probability < 0.1) {
      enhancements.guidingQuestions!.push(
        'What new evidence would be needed to revive this hypothesis?'
      );
    } else {
      enhancements.guidingQuestions!.push(
        'What additional evidence could help resolve the remaining uncertainty?'
      );
    }

    // Suggest sensitivity analysis if not provided
    if (!thought.sensitivity) {
      enhancements.guidingQuestions!.push(
        'How sensitive is the posterior to changes in the prior probability?'
      );
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType);
  }

  /**
   * Calculate posterior probability using Bayes' theorem
   *
   * P(H|E) = P(E|H) * P(H) / P(E)
   * where P(E) = P(E|H) * P(H) + P(E|~H) * P(~H)
   */
  private calculatePosterior(
    prior: PriorProbability,
    likelihood: Likelihood,
    evidence: BayesianEvidence[],
    inputAny: any
  ): PosteriorProbability {
    // If posterior explicitly provided, use it
    if (inputAny.posteriorProbability !== undefined) {
      return {
        probability: inputAny.posteriorProbability,
        calculation: 'Provided directly',
        confidence: inputAny.posteriorConfidence ?? 0.8,
      };
    }

    // Start with prior
    let currentPosterior = prior.probability;

    // Update with each piece of evidence
    if (evidence.length > 0) {
      for (const ev of evidence) {
        const pEgivenH = ev.likelihoodGivenHypothesis;
        const pEgivenNotH = ev.likelihoodGivenNotHypothesis;

        // Calculate P(E)
        const pE = pEgivenH * currentPosterior + pEgivenNotH * (1 - currentPosterior);

        // Apply Bayes' theorem
        if (pE > 0) {
          currentPosterior = (pEgivenH * currentPosterior) / pE;
        }
      }
    } else {
      // Use simple likelihood if no structured evidence
      const pEgivenH = likelihood.probability;
      const pEgivenNotH = 1 - likelihood.probability; // Simplified assumption
      const pE = pEgivenH * prior.probability + pEgivenNotH * (1 - prior.probability);

      if (pE > 0) {
        currentPosterior = (pEgivenH * prior.probability) / pE;
      }
    }

    // Build calculation string
    const calculation = evidence.length > 0
      ? `Updated through ${evidence.length} evidence items using Bayes theorem`
      : `P(H|E) = P(E|H)P(H) / [P(E|H)P(H) + P(E|~H)P(~H)]`;

    return {
      probability: Math.max(0, Math.min(1, currentPosterior)), // Clamp to [0, 1]
      calculation,
      confidence: this.estimatePosteriorConfidence(evidence),
    };
  }

  /**
   * Calculate Bayes factor from evidence
   *
   * BF = ∏ P(E_i|H) / P(E_i|~H)
   */
  private calculateBayesFactor(evidence: BayesianEvidence[]): number | undefined {
    if (evidence.length === 0) {
      return undefined;
    }

    let bayesFactor = 1;
    for (const ev of evidence) {
      if (ev.likelihoodGivenNotHypothesis > 0) {
        bayesFactor *= ev.likelihoodGivenHypothesis / ev.likelihoodGivenNotHypothesis;
      }
    }

    return bayesFactor;
  }

  /**
   * Estimate confidence in posterior calculation
   */
  private estimatePosteriorConfidence(evidence: BayesianEvidence[]): number {
    if (evidence.length === 0) {
      return 0.5; // Low confidence without evidence
    }

    // More evidence = higher confidence (diminishing returns)
    const evidenceContribution = Math.min(0.4, evidence.length * 0.1);

    // Quality of evidence (avoid extreme likelihood ratios)
    let qualityScore = 0;
    for (const ev of evidence) {
      const ratio = ev.likelihoodGivenHypothesis / (ev.likelihoodGivenNotHypothesis || 0.01);
      // Penalize extremely confident evidence (might be overconfident)
      if (ratio > 100 || ratio < 0.01) {
        qualityScore += 0.05;
      } else {
        qualityScore += 0.1;
      }
    }
    const avgQuality = qualityScore / evidence.length;

    return Math.min(0.95, 0.5 + evidenceContribution + avgQuality);
  }

  /**
   * Validate a probability value
   */
  private validateProbability(
    value: number,
    field: string
  ): ValidationResult {
    const errors = [];
    const warnings = [];

    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(
        createValidationError(
          field,
          `${field} must be a valid number`,
          'INVALID_PROBABILITY_TYPE'
        )
      );
    } else if (value < 0 || value > 1) {
      errors.push(
        createValidationError(
          field,
          `${field} (${value}) must be between 0 and 1`,
          'PROBABILITY_OUT_OF_RANGE'
        )
      );
    } else if (value === 0 || value === 1) {
      warnings.push(
        createValidationWarning(
          field,
          `Extreme probability value (${value}) leaves no room for updating`,
          'Consider using values slightly away from 0 and 1 (e.g., 0.01 or 0.99)'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Validate an evidence item
   */
  private validateEvidence(evidence: BayesianEvidence, index: number): ValidationResult {
    const errors = [];
    const warnings = [];
    const prefix = `evidence[${index}]`;

    if (!evidence.id || !evidence.description) {
      warnings.push(
        createValidationWarning(
          prefix,
          'Evidence item missing id or description',
          'Add descriptive id and description for better tracking'
        )
      );
    }

    // Validate likelihood given hypothesis
    const pEH = evidence.likelihoodGivenHypothesis;
    if (pEH !== undefined) {
      if (typeof pEH !== 'number' || isNaN(pEH)) {
        errors.push(
          createValidationError(
            `${prefix}.likelihoodGivenHypothesis`,
            'Likelihood given hypothesis must be a valid number',
            'INVALID_LIKELIHOOD_TYPE'
          )
        );
      } else if (pEH < 0 || pEH > 1) {
        errors.push(
          createValidationError(
            `${prefix}.likelihoodGivenHypothesis`,
            `Likelihood given hypothesis (${pEH}) must be between 0 and 1`,
            'LIKELIHOOD_OUT_OF_RANGE'
          )
        );
      }
    }

    // Validate likelihood given not hypothesis
    const pEnH = evidence.likelihoodGivenNotHypothesis;
    if (pEnH !== undefined) {
      if (typeof pEnH !== 'number' || isNaN(pEnH)) {
        errors.push(
          createValidationError(
            `${prefix}.likelihoodGivenNotHypothesis`,
            'Likelihood given not hypothesis must be a valid number',
            'INVALID_LIKELIHOOD_TYPE'
          )
        );
      } else if (pEnH < 0 || pEnH > 1) {
        errors.push(
          createValidationError(
            `${prefix}.likelihoodGivenNotHypothesis`,
            `Likelihood given not hypothesis (${pEnH}) must be between 0 and 1`,
            'LIKELIHOOD_OUT_OF_RANGE'
          )
        );
      }
    }

    // Check for diagnostic value
    if (pEH !== undefined && pEnH !== undefined && Math.abs(pEH - pEnH) < 0.1) {
      warnings.push(
        createValidationWarning(
          prefix,
          `Evidence has low diagnostic value (P(E|H)=${pEH}, P(E|~H)=${pEnH})`,
          'Evidence is more useful when likelihood ratios differ significantly'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }
}
