/**
 * CryptanalyticHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Cryptanalytic reasoning with:
 * - Turing's deciban evidence system
 * - Bayesian hypothesis evaluation
 * - Frequency analysis support
 * - Key space elimination tracking
 */

import { randomUUID } from 'crypto';
import { ThinkingMode } from '../../types/core.js';
import type {
  CryptanalyticThought,
  CryptanalyticThoughtType,
  DecibanEvidence,
  EvidenceChain,
  CryptographicHypothesis,
  CipherType,
} from '../../types/modes/cryptanalytic.js';
import { toDecibans, fromDecibans, decibansToProbability } from '../../types/modes/cryptanalytic.js';
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
 * Valid cryptanalytic thought types
 */
const VALID_THOUGHT_TYPES: CryptanalyticThoughtType[] = [
  'hypothesis_formation',
  'evidence_accumulation',
  'frequency_analysis',
  'key_elimination',
  'banburismus',
  'crib_analysis',
  'isomorphism_detection',
];

/**
 * Valid cipher types
 */
const VALID_CIPHER_TYPES: CipherType[] = [
  'substitution_simple',
  'substitution_polyalphabetic',
  'substitution_polygraphic',
  'transposition',
  'rotor',
  'stream',
  'block',
  'unknown',
];

/**
 * Turing's thresholds for certainty
 * 20 decibans = 100:1 odds (considered sufficient for certainty)
 */
const CONFIRMATION_THRESHOLD = 20;
const REFUTATION_THRESHOLD = -20;

/**
 * CryptanalyticHandler - Specialized handler for cryptanalytic reasoning
 *
 * Provides:
 * - Deciban evidence accumulation
 * - Hypothesis probability tracking
 * - Key space analysis
 * - Frequency analysis support
 */
export class CryptanalyticHandler implements ModeHandler {
  readonly mode = ThinkingMode.CRYPTANALYTIC;
  readonly modeName = 'Cryptanalytic Reasoning';
  readonly description = "Bayesian cryptanalysis with Turing's deciban evidence system";

  /**
   * Supported thought types for cryptanalytic mode
   */
  private readonly supportedThoughtTypes = [
    'hypothesis_formation',
    'evidence_accumulation',
    'frequency_analysis',
    'key_elimination',
    'banburismus',
    'crib_analysis',
    'isomorphism_detection',
  ];

  /**
   * Create a cryptanalytic thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): CryptanalyticThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

    // Process hypotheses
    const hypotheses = inputAny.hypotheses
      ? inputAny.hypotheses.map((h: any) => this.normalizeHypothesis(h))
      : undefined;

    // Process evidence chains
    const evidenceChains = inputAny.evidenceChains
      ? inputAny.evidenceChains.map((e: any) => this.normalizeEvidenceChain(e))
      : undefined;

    // Determine current hypothesis
    const currentHypothesis = inputAny.currentHypothesis
      ? this.normalizeHypothesis(inputAny.currentHypothesis)
      : hypotheses?.[0];

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.CRYPTANALYTIC,

      // Core cryptanalytic fields
      thoughtType,
      ciphertext: inputAny.ciphertext,
      plaintext: inputAny.plaintext,
      hypotheses,
      currentHypothesis,
      evidenceChains,
      keySpaceAnalysis: inputAny.keySpaceAnalysis,
      frequencyAnalysis: inputAny.frequencyAnalysis,
      banburismusAnalysis: inputAny.banburismusAnalysis,
      cribAnalysis: inputAny.cribAnalysis,
      patterns: inputAny.patterns,
      cipherType: inputAny.cipherType,
      keyInsight: inputAny.keyInsight,

      // Dependencies and assumptions
      dependencies: input.dependencies || [],
      assumptions: input.assumptions || [],
      uncertainty: input.uncertainty ?? 0.5,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };
  }

  /**
   * Validate cryptanalytic-specific input
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

    // Validate thought type
    if (inputAny.thoughtType && !VALID_THOUGHT_TYPES.includes(inputAny.thoughtType)) {
      warnings.push(
        createValidationWarning(
          'thoughtType',
          `Unknown thought type: ${inputAny.thoughtType}`,
          `Valid types: ${VALID_THOUGHT_TYPES.join(', ')}`
        )
      );
    }

    // Validate cipher type
    if (inputAny.cipherType && !VALID_CIPHER_TYPES.includes(inputAny.cipherType)) {
      warnings.push(
        createValidationWarning(
          'cipherType',
          `Unknown cipher type: ${inputAny.cipherType}`,
          `Valid types: ${VALID_CIPHER_TYPES.join(', ')}`
        )
      );
    }

    // Validate uncertainty
    if (input.uncertainty !== undefined) {
      if (input.uncertainty < 0 || input.uncertainty > 1) {
        errors.push(
          createValidationError(
            'uncertainty',
            `Uncertainty (${input.uncertainty}) must be between 0 and 1`,
            'UNCERTAINTY_OUT_OF_RANGE'
          )
        );
      }
    }

    // Validate hypotheses
    if (inputAny.hypotheses) {
      for (let i = 0; i < inputAny.hypotheses.length; i++) {
        const hypWarnings = this.validateHypothesis(inputAny.hypotheses[i], i);
        warnings.push(...hypWarnings);
      }
    }

    // Validate evidence chains
    if (inputAny.evidenceChains) {
      for (let i = 0; i < inputAny.evidenceChains.length; i++) {
        const chainWarnings = this.validateEvidenceChain(inputAny.evidenceChains[i], i);
        warnings.push(...chainWarnings);
      }
    }

    // Suggest ciphertext for analysis
    if (!inputAny.ciphertext && inputAny.thoughtType !== 'hypothesis_formation') {
      warnings.push(
        createValidationWarning(
          'ciphertext',
          'No ciphertext provided',
          'Include ciphertext for cryptanalysis'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get cryptanalytic-specific enhancements
   */
  getEnhancements(thought: CryptanalyticThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.BAYESIAN, ThinkingMode.EVIDENTIAL, ThinkingMode.INDUCTIVE],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        hypothesisCount: thought.hypotheses?.length || 0,
        evidenceChainCount: thought.evidenceChains?.length || 0,
        uncertainty: thought.uncertainty,
      },
      mentalModels: [
        "Turing's Deciban System",
        'Bayesian Hypothesis Testing',
        'Index of Coincidence',
        'Banburismus',
        'Frequency Analysis',
        'Known-Plaintext Attack',
      ],
    };

    // Thought type-specific guidance
    switch (thought.thoughtType) {
      case 'hypothesis_formation':
        enhancements.guidingQuestions!.push(
          'What cipher system is most likely?',
          'What are the prior probabilities for each hypothesis?',
          'What evidence would confirm or refute each hypothesis?'
        );
        break;

      case 'evidence_accumulation':
        enhancements.guidingQuestions!.push(
          'What is the likelihood ratio for this evidence?',
          'How many decibans does this evidence contribute?',
          'Have we reached the confirmation threshold?'
        );
        if (thought.evidenceChains) {
          for (const chain of thought.evidenceChains) {
            enhancements.metrics![`${chain.hypothesis}_decibans`] = chain.totalDecibans;
            if (chain.conclusion !== 'inconclusive') {
              enhancements.suggestions!.push(
                `Hypothesis "${chain.hypothesis}": ${chain.conclusion} (${chain.totalDecibans.toFixed(1)} db)`
              );
            }
          }
        }
        break;

      case 'frequency_analysis':
        enhancements.guidingQuestions!.push(
          'Does the frequency distribution match any known language?',
          'What is the index of coincidence?',
          'Are there significant deviations from expected frequencies?'
        );
        if (thought.frequencyAnalysis) {
          enhancements.metrics!.indexOfCoincidence = thought.frequencyAnalysis.indexOfCoincidence;
          enhancements.metrics!.chiSquared = thought.frequencyAnalysis.chiSquared;
        }
        break;

      case 'key_elimination':
        enhancements.guidingQuestions!.push(
          'What portion of the key space has been eliminated?',
          'What methods were used for elimination?',
          'How many candidate keys remain?'
        );
        if (thought.keySpaceAnalysis) {
          const ks = thought.keySpaceAnalysis;
          enhancements.metrics!.reductionFactor = ks.reductionFactor;
          enhancements.suggestions!.push(
            `Key space reduced by factor of ${ks.reductionFactor.toFixed(2)}`
          );
        }
        break;

      case 'banburismus':
        enhancements.guidingQuestions!.push(
          'Are there significant coincidences at any offset?',
          'What does this suggest about the wheel order?',
          'Can we chain multiple Banburismus results?'
        );
        if (thought.banburismusAnalysis) {
          const significant = thought.banburismusAnalysis.filter((b) => b.isSignificant);
          enhancements.metrics!.significantOffsets = significant.length;
          for (const b of significant) {
            enhancements.suggestions!.push(
              `Significant at offset ${b.offset}: ${b.decibanScore.toFixed(1)} db`
            );
          }
        }
        break;

      case 'crib_analysis':
        enhancements.guidingQuestions!.push(
          'Is the crib position viable?',
          'Are there any contradictions?',
          'What constraints does this crib impose?'
        );
        if (thought.cribAnalysis) {
          const viable = thought.cribAnalysis.filter((c) => c.isViable);
          enhancements.metrics!.viablePositions = viable.length;
        }
        break;

      case 'isomorphism_detection':
        enhancements.guidingQuestions!.push(
          'What patterns have been detected?',
          'Do patterns suggest repeated words?',
          'What deciban contribution do patterns provide?'
        );
        if (thought.patterns) {
          enhancements.metrics!.patternCount = thought.patterns.length;
        }
        break;
    }

    // Current hypothesis analysis
    if (thought.currentHypothesis) {
      const h = thought.currentHypothesis;
      enhancements.metrics!.currentDecibanScore = h.decibanScore;
      enhancements.metrics!.posteriorProbability = h.posteriorProbability;

      if (h.decibanScore >= CONFIRMATION_THRESHOLD) {
        enhancements.suggestions!.push(
          `✓ Hypothesis "${h.description}" CONFIRMED (${h.decibanScore.toFixed(1)} db)`
        );
      } else if (h.decibanScore <= REFUTATION_THRESHOLD) {
        enhancements.warnings!.push(
          `✗ Hypothesis "${h.description}" REFUTED (${h.decibanScore.toFixed(1)} db)`
        );
      } else {
        enhancements.suggestions!.push(
          `Hypothesis "${h.description}": ${h.decibanScore.toFixed(1)} db (inconclusive, need ±${CONFIRMATION_THRESHOLD} db)`
        );
      }
    }

    // Cipher type suggestion
    if (thought.cipherType) {
      enhancements.suggestions!.push(`Cipher type: ${thought.cipherType}`);
    }

    // Key insight
    if (thought.keyInsight) {
      enhancements.suggestions!.push(`Key insight: ${thought.keyInsight}`);
    }

    // High uncertainty warning
    if (thought.uncertainty > 0.7) {
      enhancements.warnings!.push(
        'High uncertainty - gather more evidence'
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
   * Resolve thought type from input
   */
  private resolveThoughtType(inputType: string | undefined): CryptanalyticThoughtType {
    if (inputType && VALID_THOUGHT_TYPES.includes(inputType as CryptanalyticThoughtType)) {
      return inputType as CryptanalyticThoughtType;
    }
    return 'hypothesis_formation';
  }

  /**
   * Normalize hypothesis
   */
  private normalizeHypothesis(h: any): CryptographicHypothesis {
    const evidence: DecibanEvidence[] = (h.evidence || []).map((e: any) => this.normalizeEvidence(e));
    const totalDecibans = evidence.reduce((sum, e) => sum + e.decibans, 0);
    const posteriorProbability = decibansToProbability(totalDecibans, h.priorProbability || 0.5);

    return {
      id: h.id || randomUUID(),
      description: h.description || '',
      cipherType: h.cipherType,
      parameters: h.parameters,
      priorProbability: h.priorProbability ?? 0.5,
      posteriorProbability,
      decibanScore: totalDecibans,
      evidence,
      status: this.determineHypothesisStatus(totalDecibans),
    };
  }

  /**
   * Normalize evidence
   */
  private normalizeEvidence(e: any): DecibanEvidence {
    const likelihoodRatio = e.likelihoodRatio ?? (e.decibans ? fromDecibans(e.decibans) : 1);
    const decibans = e.decibans ?? toDecibans(likelihoodRatio);

    return {
      observation: e.observation || '',
      decibans,
      likelihoodRatio,
      source: e.source || 'statistical',
      confidence: e.confidence ?? 1.0,
      explanation: e.explanation,
    };
  }

  /**
   * Normalize evidence chain
   */
  private normalizeEvidenceChain(chain: any): EvidenceChain {
    const observations: DecibanEvidence[] = (chain.observations || []).map((o: any) =>
      this.normalizeEvidence(o)
    );
    const totalDecibans = observations.reduce((sum, o) => sum + o.decibans, 0);
    const confirmationThreshold = chain.confirmationThreshold ?? CONFIRMATION_THRESHOLD;
    const refutationThreshold = chain.refutationThreshold ?? REFUTATION_THRESHOLD;

    let conclusion: 'confirmed' | 'refuted' | 'inconclusive';
    if (totalDecibans >= confirmationThreshold) {
      conclusion = 'confirmed';
    } else if (totalDecibans <= refutationThreshold) {
      conclusion = 'refuted';
    } else {
      conclusion = 'inconclusive';
    }

    return {
      hypothesis: chain.hypothesis || '',
      observations,
      totalDecibans,
      oddsRatio: fromDecibans(totalDecibans),
      conclusion,
      confirmationThreshold,
      refutationThreshold,
    };
  }

  /**
   * Determine hypothesis status based on deciban score
   */
  private determineHypothesisStatus(decibans: number): 'active' | 'confirmed' | 'refuted' | 'superseded' {
    if (decibans >= CONFIRMATION_THRESHOLD) {
      return 'confirmed';
    } else if (decibans <= REFUTATION_THRESHOLD) {
      return 'refuted';
    }
    return 'active';
  }

  /**
   * Validate hypothesis
   */
  private validateHypothesis(h: any, index: number): any[] {
    const warnings = [];

    if (!h.description) {
      warnings.push(
        createValidationWarning(
          `hypotheses[${index}].description`,
          'Hypothesis lacks description',
          'Describe what the hypothesis proposes'
        )
      );
    }

    if (h.priorProbability !== undefined && (h.priorProbability < 0 || h.priorProbability > 1)) {
      warnings.push(
        createValidationWarning(
          `hypotheses[${index}].priorProbability`,
          `Prior probability (${h.priorProbability}) out of range`,
          'Prior probability must be between 0 and 1'
        )
      );
    }

    return warnings;
  }

  /**
   * Validate evidence chain
   */
  private validateEvidenceChain(chain: any, index: number): any[] {
    const warnings = [];

    if (!chain.hypothesis) {
      warnings.push(
        createValidationWarning(
          `evidenceChains[${index}].hypothesis`,
          'Evidence chain lacks hypothesis reference',
          'Link evidence chain to a hypothesis'
        )
      );
    }

    if (!chain.observations || chain.observations.length === 0) {
      warnings.push(
        createValidationWarning(
          `evidenceChains[${index}].observations`,
          'Evidence chain has no observations',
          'Add deciban evidence observations'
        )
      );
    }

    return warnings;
  }
}
