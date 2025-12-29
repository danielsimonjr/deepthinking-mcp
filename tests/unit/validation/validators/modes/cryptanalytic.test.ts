/**
 * Cryptanalytic Validator Tests (Phase 14 Sprint 1)
 * Tests for src/validation/validators/modes/cryptanalytic.ts
 *
 * Target: >90% branch coverage for 356 lines of validation logic
 * Error paths: ~15, Warning paths: ~2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CryptanalyticValidator } from '../../../../../src/validation/validators/modes/cryptanalytic.js';
import { ThinkingMode } from '../../../../../src/types/core.js';
import type { CryptanalyticThought, EvidenceChain, DecibanEvidence, KeySpaceAnalysis, FrequencyAnalysis, CryptographicHypothesis, CribAnalysis } from '../../../../../src/types/modes/cryptanalytic.js';
import type { ValidationContext } from '../../../../../src/validation/validator.js';

describe('CryptanalyticValidator', () => {
  let validator: CryptanalyticValidator;
  let context: ValidationContext;

  // Helper to create valid deciban evidence
  const createValidEvidence = (overrides?: Partial<DecibanEvidence>): DecibanEvidence => ({
    observation: 'Letter E appears frequently',
    decibans: 3.0,
    likelihoodRatio: 2.0, // 10^(3/10) ≈ 2.0
    source: 'frequency',
    confidence: 0.8,
    ...overrides,
  });

  // Helper to create valid evidence chain
  const createValidEvidenceChain = (overrides?: Partial<EvidenceChain>): EvidenceChain => ({
    hypothesis: 'Caesar cipher with shift 3',
    observations: [createValidEvidence()],
    totalDecibans: 3.0,
    oddsRatio: 2.0, // 10^(3/10) ≈ 2.0
    conclusion: 'inconclusive',
    confirmationThreshold: 20,
    refutationThreshold: -20,
    ...overrides,
  });

  // Helper to create valid key space analysis
  const createValidKeySpaceAnalysis = (overrides?: Partial<KeySpaceAnalysis>): KeySpaceAnalysis => ({
    totalKeys: 26,
    eliminatedKeys: 10,
    remainingKeys: 16,
    reductionFactor: 1.625, // 26/16
    eliminationMethods: [{ method: 'frequency', keysEliminated: 10 }],
    ...overrides,
  });

  // Helper to create valid frequency analysis
  const createValidFrequencyAnalysis = (overrides?: Partial<FrequencyAnalysis>): FrequencyAnalysis => ({
    observed: { E: 10, T: 8 },
    expected: { E: 12, T: 9 },
    chiSquared: 5.0,
    degreesOfFreedom: 25,
    significantDeviations: [],
    indexOfCoincidence: 0.066,
    ...overrides,
  });

  // Helper to create valid hypothesis
  const createValidHypothesis = (id: string = 'hyp-1', overrides?: Partial<CryptographicHypothesis>): CryptographicHypothesis => ({
    id,
    description: 'Caesar cipher hypothesis',
    priorProbability: 0.5,
    posteriorProbability: 0.7,
    decibanScore: 3.0,
    evidence: [],
    status: 'active',
    ...overrides,
  });

  // Helper to create valid crib analysis
  const createValidCribAnalysis = (overrides?: Partial<CribAnalysis>): CribAnalysis => ({
    crib: 'HELLO',
    position: 0,
    ciphertext: 'KHOOR',
    constraints: [],
    contradictions: [],
    score: 0.8,
    isViable: true,
    ...overrides,
  });

  // Helper to create a minimal valid thought
  const createBaseThought = (overrides?: Partial<CryptanalyticThought>): CryptanalyticThought => ({
    id: 'thought-1',
    mode: ThinkingMode.CRYPTANALYTIC,
    thoughtType: 'hypothesis_formation',
    thought: 'Cryptanalysis in progress',
    thoughtNumber: 1,
    totalThoughts: 5,
    nextThoughtNeeded: true,
    dependencies: [],
    assumptions: [],
    uncertainty: 0.3,
    ...overrides,
  });

  beforeEach(() => {
    validator = new CryptanalyticValidator();
    context = {
      sessionId: 'test-session',
      existingThoughts: new Map(),
    };
  });

  describe('getMode', () => {
    it('should return cryptanalytic', () => {
      expect(validator.getMode()).toBe('cryptanalytic');
    });
  });

  describe('validate - main entry point', () => {
    it('should accept valid thought with all fields', () => {
      const thought = createBaseThought({
        evidenceChains: [createValidEvidenceChain()],
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('should reject invalid thoughtType', () => {
      const thought = createBaseThought({
        thoughtType: 'invalid_type' as any,
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid cryptanalytic thought type'))).toBe(true);
    });

    it('should accept all valid thought types', () => {
      const validTypes = [
        'hypothesis_formation',
        'evidence_accumulation',
        'frequency_analysis',
        'key_elimination',
        'banburismus',
        'crib_analysis',
        'isomorphism_detection',
      ];

      for (const type of validTypes) {
        const thought = createBaseThought({ thoughtType: type as any });
        const issues = validator.validate(thought, context);
        expect(issues.some(i => i.description.includes('Invalid cryptanalytic thought type'))).toBe(false);
      }
    });
  });

  describe('validateEvidenceChain', () => {
    it('should accept valid evidence chain', () => {
      const thought = createBaseThought({
        evidenceChains: [createValidEvidenceChain()],
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('should reject evidence chain without hypothesis', () => {
      const thought = createBaseThought({
        evidenceChains: [createValidEvidenceChain({ hypothesis: '' })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Evidence chain lacks hypothesis'))).toBe(true);
    });

    it('should reject evidence chain with whitespace-only hypothesis', () => {
      const thought = createBaseThought({
        evidenceChains: [createValidEvidenceChain({ hypothesis: '   ' })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Evidence chain lacks hypothesis'))).toBe(true);
    });

    it('should reject mismatched totalDecibans', () => {
      // observations: [evidence with 3 decibans], but totalDecibans: 10
      const thought = createBaseThought({
        evidenceChains: [createValidEvidenceChain({
          observations: [createValidEvidence({ decibans: 3.0 })],
          totalDecibans: 10.0,
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes("doesn't match sum of observations"))).toBe(true);
    });

    it('should accept matching totalDecibans', () => {
      const thought = createBaseThought({
        evidenceChains: [createValidEvidenceChain({
          observations: [
            createValidEvidence({ decibans: 3.0 }),
            createValidEvidence({ decibans: 2.0 }),
          ],
          totalDecibans: 5.0,
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes("doesn't match sum of observations"))).toBe(false);
    });

    it('should warn on mismatched odds ratio', () => {
      // totalDecibans: 10 → expected odds ratio: 10^(10/10) = 10
      // but oddsRatio: 2
      const thought = createBaseThought({
        evidenceChains: [createValidEvidenceChain({
          observations: [createValidEvidence({ decibans: 10.0 })],
          totalDecibans: 10.0,
          oddsRatio: 2.0, // Should be 10
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes("Odds ratio") && i.description.includes("doesn't match"))).toBe(true);
    });

    it('should warn on mismatched conclusion vs thresholds', () => {
      // totalDecibans: 25 > confirmationThreshold: 20 → should be 'confirmed'
      // but conclusion is 'inconclusive'
      const thought = createBaseThought({
        evidenceChains: [createValidEvidenceChain({
          observations: [createValidEvidence({ decibans: 25.0 })],
          totalDecibans: 25.0,
          oddsRatio: Math.pow(10, 25 / 10),
          conclusion: 'inconclusive',
          confirmationThreshold: 20,
          refutationThreshold: -20,
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes("Conclusion") && i.description.includes("doesn't match expected"))).toBe(true);
    });

    it('should accept correct conclusion based on thresholds - confirmed', () => {
      const thought = createBaseThought({
        evidenceChains: [createValidEvidenceChain({
          observations: [createValidEvidence({ decibans: 25.0 })],
          totalDecibans: 25.0,
          oddsRatio: Math.pow(10, 25 / 10),
          conclusion: 'confirmed',
          confirmationThreshold: 20,
          refutationThreshold: -20,
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes("doesn't match expected"))).toBe(false);
    });

    it('should accept correct conclusion based on thresholds - refuted', () => {
      const thought = createBaseThought({
        evidenceChains: [createValidEvidenceChain({
          observations: [createValidEvidence({ decibans: -25.0, likelihoodRatio: Math.pow(10, -25 / 10) })],
          totalDecibans: -25.0,
          oddsRatio: Math.pow(10, -25 / 10),
          conclusion: 'refuted',
          confirmationThreshold: 20,
          refutationThreshold: -20,
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes("doesn't match expected"))).toBe(false);
    });
  });

  describe('validateDecibanEvidence', () => {
    it('should accept valid evidence', () => {
      const thought = createBaseThought({
        evidenceChains: [createValidEvidenceChain({
          observations: [createValidEvidence()],
          totalDecibans: 3.0,
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('should warn on inconsistent decibans vs likelihood ratio', () => {
      // decibans = 10 * log10(likelihoodRatio)
      // If likelihoodRatio = 2, decibans ≈ 3.01
      // But we say decibans = 10, that's inconsistent
      const thought = createBaseThought({
        evidenceChains: [createValidEvidenceChain({
          observations: [createValidEvidence({
            decibans: 10.0,
            likelihoodRatio: 2.0, // Expected decibans: ~3.01
          })],
          totalDecibans: 10.0,
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('inconsistent with likelihood ratio'))).toBe(true);
    });

    it('should reject non-positive likelihood ratio', () => {
      const thought = createBaseThought({
        evidenceChains: [createValidEvidenceChain({
          observations: [createValidEvidence({ likelihoodRatio: 0 })],
          totalDecibans: 3.0,
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Likelihood ratio must be positive'))).toBe(true);
    });

    it('should reject negative likelihood ratio', () => {
      const thought = createBaseThought({
        evidenceChains: [createValidEvidenceChain({
          observations: [createValidEvidence({ likelihoodRatio: -1 })],
          totalDecibans: 3.0,
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Likelihood ratio must be positive'))).toBe(true);
    });

    it('should reject confidence below 0', () => {
      const thought = createBaseThought({
        evidenceChains: [createValidEvidenceChain({
          observations: [createValidEvidence({ confidence: -0.1 })],
          totalDecibans: 3.0,
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('confidence') && i.description.includes('must be between 0 and 1'))).toBe(true);
    });

    it('should reject confidence above 1', () => {
      const thought = createBaseThought({
        evidenceChains: [createValidEvidenceChain({
          observations: [createValidEvidence({ confidence: 1.5 })],
          totalDecibans: 3.0,
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('confidence') && i.description.includes('must be between 0 and 1'))).toBe(true);
    });

    it('should accept boundary confidence values', () => {
      const thought0 = createBaseThought({
        evidenceChains: [createValidEvidenceChain({
          observations: [createValidEvidence({ confidence: 0 })],
          totalDecibans: 3.0,
        })],
      });
      const thought1 = createBaseThought({
        evidenceChains: [createValidEvidenceChain({
          observations: [createValidEvidence({ confidence: 1 })],
          totalDecibans: 3.0,
        })],
      });
      expect(validator.validate(thought0, context).some(i => i.description.includes('confidence'))).toBe(false);
      expect(validator.validate(thought1, context).some(i => i.description.includes('confidence'))).toBe(false);
    });

    it('should warn on unknown evidence source', () => {
      const thought = createBaseThought({
        evidenceChains: [createValidEvidenceChain({
          observations: [createValidEvidence({ source: 'unknown' as any })],
          totalDecibans: 3.0,
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('Unknown evidence source'))).toBe(true);
    });

    it('should accept all valid evidence sources', () => {
      const validSources = ['frequency', 'pattern', 'crib', 'statistical', 'structural'];
      for (const source of validSources) {
        const thought = createBaseThought({
          evidenceChains: [createValidEvidenceChain({
            observations: [createValidEvidence({ source: source as any })],
            totalDecibans: 3.0,
          })],
        });
        const issues = validator.validate(thought, context);
        expect(issues.some(i => i.description.includes('Unknown evidence source'))).toBe(false);
      }
    });
  });

  describe('validateKeySpaceAnalysis', () => {
    it('should accept valid key space analysis', () => {
      const thought = createBaseThought({
        keySpaceAnalysis: createValidKeySpaceAnalysis(),
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error' && i.description.includes('Key space'))).toHaveLength(0);
    });

    it('should reject inconsistent key space arithmetic', () => {
      // total - eliminated should equal remaining
      // 26 - 10 = 16, but remaining is 20
      const thought = createBaseThought({
        keySpaceAnalysis: createValidKeySpaceAnalysis({
          totalKeys: 26,
          eliminatedKeys: 10,
          remainingKeys: 20, // Should be 16
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Key space arithmetic inconsistent'))).toBe(true);
    });

    it('should warn on inconsistent reduction factor', () => {
      // reductionFactor should be total / remaining = 26 / 16 = 1.625
      const thought = createBaseThought({
        keySpaceAnalysis: createValidKeySpaceAnalysis({
          totalKeys: 26,
          eliminatedKeys: 10,
          remainingKeys: 16,
          reductionFactor: 5.0, // Should be ~1.625
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('Reduction factor') && i.description.includes('inconsistent'))).toBe(true);
    });

    it('should info on no elimination methods', () => {
      const thought = createBaseThought({
        keySpaceAnalysis: createValidKeySpaceAnalysis({
          eliminationMethods: [],
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'info' && i.description.includes('No elimination methods documented'))).toBe(true);
    });
  });

  describe('validateFrequencyAnalysis', () => {
    it('should accept valid frequency analysis', () => {
      const thought = createBaseThought({
        frequencyAnalysis: createValidFrequencyAnalysis(),
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('should reject index of coincidence below 0', () => {
      const thought = createBaseThought({
        frequencyAnalysis: createValidFrequencyAnalysis({ indexOfCoincidence: -0.1 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Index of coincidence') && i.description.includes('must be between 0 and 1'))).toBe(true);
    });

    it('should reject index of coincidence above 1', () => {
      const thought = createBaseThought({
        frequencyAnalysis: createValidFrequencyAnalysis({ indexOfCoincidence: 1.5 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Index of coincidence') && i.description.includes('must be between 0 and 1'))).toBe(true);
    });

    it('should accept boundary IC values', () => {
      const thought0 = createBaseThought({
        frequencyAnalysis: createValidFrequencyAnalysis({ indexOfCoincidence: 0 }),
      });
      const thought1 = createBaseThought({
        frequencyAnalysis: createValidFrequencyAnalysis({ indexOfCoincidence: 1 }),
      });
      expect(validator.validate(thought0, context).some(i => i.description.includes('Index of coincidence'))).toBe(false);
      expect(validator.validate(thought1, context).some(i => i.description.includes('Index of coincidence'))).toBe(false);
    });

    it('should reject negative chi-squared', () => {
      const thought = createBaseThought({
        frequencyAnalysis: createValidFrequencyAnalysis({ chiSquared: -5 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Chi-squared') && i.description.includes('cannot be negative'))).toBe(true);
    });

    it('should accept zero chi-squared', () => {
      const thought = createBaseThought({
        frequencyAnalysis: createValidFrequencyAnalysis({ chiSquared: 0 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Chi-squared') && i.description.includes('cannot be negative'))).toBe(false);
    });

    it('should reject non-positive degrees of freedom', () => {
      const thought = createBaseThought({
        frequencyAnalysis: createValidFrequencyAnalysis({ degreesOfFreedom: 0 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Degrees of freedom') && i.description.includes('must be positive'))).toBe(true);
    });

    it('should reject negative degrees of freedom', () => {
      const thought = createBaseThought({
        frequencyAnalysis: createValidFrequencyAnalysis({ degreesOfFreedom: -5 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Degrees of freedom') && i.description.includes('must be positive'))).toBe(true);
    });
  });

  describe('validateHypotheses', () => {
    it('should accept valid hypotheses', () => {
      const thought = createBaseThought({
        hypotheses: [createValidHypothesis()],
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error' && i.description.includes('Hypothesis'))).toHaveLength(0);
    });

    it('should reject duplicate hypothesis IDs', () => {
      const thought = createBaseThought({
        hypotheses: [
          createValidHypothesis('hyp-1'),
          createValidHypothesis('hyp-1'),
        ],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Duplicate hypothesis IDs'))).toBe(true);
    });

    it('should reject prior probability below 0', () => {
      const thought = createBaseThought({
        hypotheses: [createValidHypothesis('hyp-1', { priorProbability: -0.1 })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('prior probability') && i.description.includes('must be between 0 and 1'))).toBe(true);
    });

    it('should reject prior probability above 1', () => {
      const thought = createBaseThought({
        hypotheses: [createValidHypothesis('hyp-1', { priorProbability: 1.5 })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('prior probability') && i.description.includes('must be between 0 and 1'))).toBe(true);
    });

    it('should reject posterior probability below 0', () => {
      const thought = createBaseThought({
        hypotheses: [createValidHypothesis('hyp-1', { posteriorProbability: -0.1 })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('posterior probability') && i.description.includes('must be between 0 and 1'))).toBe(true);
    });

    it('should reject posterior probability above 1', () => {
      const thought = createBaseThought({
        hypotheses: [createValidHypothesis('hyp-1', { posteriorProbability: 1.5 })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('posterior probability') && i.description.includes('must be between 0 and 1'))).toBe(true);
    });

    it('should accept boundary probability values', () => {
      const thought = createBaseThought({
        hypotheses: [createValidHypothesis('hyp-1', { priorProbability: 0, posteriorProbability: 1 })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('prior probability'))).toBe(false);
      expect(issues.some(i => i.description.includes('posterior probability'))).toBe(false);
    });

    it('should reject invalid hypothesis status', () => {
      const thought = createBaseThought({
        hypotheses: [createValidHypothesis('hyp-1', { status: 'invalid' as any })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid hypothesis status'))).toBe(true);
    });

    it('should accept all valid hypothesis statuses', () => {
      const validStatuses = ['active', 'confirmed', 'refuted', 'superseded'];
      for (const status of validStatuses) {
        const thought = createBaseThought({
          hypotheses: [createValidHypothesis('hyp-1', { status: status as any })],
        });
        const issues = validator.validate(thought, context);
        expect(issues.some(i => i.description.includes('Invalid hypothesis status'))).toBe(false);
      }
    });
  });

  describe('validateCribAnalysis', () => {
    it('should accept valid crib analysis', () => {
      const thought = createBaseThought({
        cribAnalysis: [createValidCribAnalysis()],
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error' && i.description.includes('Crib'))).toHaveLength(0);
    });

    it('should warn on crib/ciphertext length mismatch', () => {
      const thought = createBaseThought({
        cribAnalysis: [createValidCribAnalysis({
          crib: 'HELLO',
          ciphertext: 'KHO', // Shorter than crib
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes("Crib length") && i.description.includes("doesn't match"))).toBe(true);
    });

    it('should reject negative position', () => {
      const thought = createBaseThought({
        cribAnalysis: [createValidCribAnalysis({ position: -1 })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('position') && i.description.includes('cannot be negative'))).toBe(true);
    });

    it('should accept zero position', () => {
      const thought = createBaseThought({
        cribAnalysis: [createValidCribAnalysis({ position: 0 })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('position') && i.description.includes('cannot be negative'))).toBe(false);
    });

    it('should info on non-viable crib without contradictions', () => {
      const thought = createBaseThought({
        cribAnalysis: [createValidCribAnalysis({
          isViable: false,
          contradictions: [],
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'info' && i.description.includes('non-viable but no contradictions'))).toBe(true);
    });

    it('should not info on non-viable crib with contradictions', () => {
      const thought = createBaseThought({
        cribAnalysis: [createValidCribAnalysis({
          isViable: false,
          contradictions: ['E maps to both X and Y'],
        })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('non-viable but no contradictions'))).toBe(false);
    });

    it('should validate multiple cribs', () => {
      const thought = createBaseThought({
        cribAnalysis: [
          createValidCribAnalysis({ position: -1 }),
          createValidCribAnalysis({ crib: 'HELLO', ciphertext: 'K' }),
        ],
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.description.includes('position'))).toHaveLength(1);
      expect(issues.filter(i => i.description.includes("Crib length"))).toHaveLength(1);
    });
  });

  describe('validateCommon (inherited)', () => {
    it('should reject negative thoughtNumber', () => {
      const thought = createBaseThought({ thoughtNumber: -1 });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Thought number must be positive'))).toBe(true);
    });

    it('should reject thoughtNumber exceeding totalThoughts', () => {
      const thought = createBaseThought({ thoughtNumber: 10, totalThoughts: 5 });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('exceeds total'))).toBe(true);
    });
  });
});
