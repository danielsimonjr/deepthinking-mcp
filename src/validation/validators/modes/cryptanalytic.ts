/**
 * Cryptanalytic Mode Validator (v9.0.0)
 * Phase 15A Sprint 3: Uses composition with utility functions
 *
 * Validates:
 * - Evidence chain consistency
 * - Deciban calculations
 * - Key space analysis
 * - Frequency analysis validity
 *
 * Inspired by Alan Turing's work at Bletchley Park (1939-1945)
 */

import type { ValidationIssue } from '../../../types/index.js';
import type { CryptanalyticThought, EvidenceChain, DecibanEvidence } from '../../../types/modes/cryptanalytic.js';
import type { ValidationContext } from '../../validator.js';
import type { ModeValidator } from '../base.js';
import { validateCommon } from '../validation-utils.js';

/**
 * Validator for Cryptanalytic reasoning mode using Turing's deciban system
 */
export class CryptanalyticValidator implements ModeValidator<CryptanalyticThought> {
  getMode(): string {
    return 'cryptanalytic';
  }

  validate(thought: CryptanalyticThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...validateCommon(thought));

    // Validate thought type
    const validTypes = [
      'hypothesis_formation',
      'evidence_accumulation',
      'frequency_analysis',
      'key_elimination',
      'banburismus',
      'crib_analysis',
      'isomorphism_detection',
    ];
    if (!validTypes.includes(thought.thoughtType)) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Invalid cryptanalytic thought type: ${thought.thoughtType}`,
        suggestion: `Use one of: ${validTypes.join(', ')}`,
        category: 'structural',
      });
    }

    // Validate evidence chains
    if (thought.evidenceChains) {
      for (const chain of thought.evidenceChains) {
        issues.push(...validateEvidenceChain(thought, chain));
      }
    }

    // Validate key space analysis
    if (thought.keySpaceAnalysis) {
      issues.push(...validateKeySpaceAnalysis(thought));
    }

    // Validate frequency analysis
    if (thought.frequencyAnalysis) {
      issues.push(...validateFrequencyAnalysis(thought));
    }

    // Validate hypotheses
    if (thought.hypotheses) {
      issues.push(...validateHypotheses(thought));
    }

    // Validate crib analysis
    if (thought.cribAnalysis) {
      issues.push(...validateCribAnalysis(thought));
    }

    return issues;
  }
}

function validateEvidenceChain(thought: CryptanalyticThought, chain: EvidenceChain): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check hypothesis is specified
    if (!chain.hypothesis || chain.hypothesis.trim() === '') {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Evidence chain lacks hypothesis',
        suggestion: 'Specify the hypothesis being tested',
        category: 'structural',
      });
    }

    // Calculate expected total decibans
    const calculatedTotal = chain.observations.reduce((sum, obs) => sum + obs.decibans, 0);
    if (Math.abs(calculatedTotal - chain.totalDecibans) > 0.01) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Evidence chain total decibans (${chain.totalDecibans}) doesn't match sum of observations (${calculatedTotal.toFixed(2)})`,
        suggestion: 'Recalculate totalDecibans from observation contributions',
        category: 'mathematical',
      });
    }

    // Validate odds ratio calculation
    const expectedOddsRatio = Math.pow(10, chain.totalDecibans / 10);
    if (Math.abs(expectedOddsRatio - chain.oddsRatio) > 0.01) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: `Odds ratio (${chain.oddsRatio}) doesn't match expected (${expectedOddsRatio.toFixed(2)}) from decibans`,
        suggestion: 'oddsRatio should equal 10^(totalDecibans/10)',
        category: 'mathematical',
      });
    }

    // Validate conclusion against thresholds
    const expectedConclusion = chain.totalDecibans >= chain.confirmationThreshold
      ? 'confirmed'
      : chain.totalDecibans <= chain.refutationThreshold
        ? 'refuted'
        : 'inconclusive';

    if (chain.conclusion !== expectedConclusion) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: `Conclusion "${chain.conclusion}" doesn't match expected "${expectedConclusion}" based on thresholds`,
        suggestion: `With ${chain.totalDecibans} decibans, conclusion should be "${expectedConclusion}"`,
        category: 'logical',
      });
    }

    // Validate individual observations
    for (const obs of chain.observations) {
      issues.push(...validateDecibanEvidence(thought, obs));
    }

    return issues;
}

function validateDecibanEvidence(thought: CryptanalyticThought, evidence: DecibanEvidence): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check likelihood ratio and decibans consistency
    // decibans = 10 * log10(likelihoodRatio)
    const expectedDecibans = 10 * Math.log10(evidence.likelihoodRatio);
    if (Math.abs(expectedDecibans - evidence.decibans) > 0.1) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: `Decibans (${evidence.decibans}) inconsistent with likelihood ratio (${evidence.likelihoodRatio})`,
        suggestion: `Expected decibans: ${expectedDecibans.toFixed(2)} (10 × log₁₀(${evidence.likelihoodRatio}))`,
        category: 'mathematical',
      });
    }

    // Check likelihood ratio is positive
    if (evidence.likelihoodRatio <= 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Likelihood ratio must be positive, got ${evidence.likelihoodRatio}`,
        suggestion: 'Likelihood ratio = P(E|H) / P(E|¬H) must be > 0',
        category: 'mathematical',
      });
    }

    // Check confidence is in valid range
    if (evidence.confidence < 0 || evidence.confidence > 1) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Evidence confidence (${evidence.confidence}) must be between 0 and 1`,
        suggestion: 'Confidence should be a probability between 0 and 1',
        category: 'structural',
      });
    }

    // Validate source
    const validSources = ['frequency', 'pattern', 'crib', 'statistical', 'structural'];
    if (!validSources.includes(evidence.source)) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: `Unknown evidence source: ${evidence.source}`,
        suggestion: `Use one of: ${validSources.join(', ')}`,
        category: 'structural',
      });
    }

    return issues;
}

function validateKeySpaceAnalysis(thought: CryptanalyticThought): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const analysis = thought.keySpaceAnalysis!;

    // Convert to numbers for comparison
    const total = Number(analysis.totalKeys);
    const eliminated = Number(analysis.eliminatedKeys);
    const remaining = Number(analysis.remainingKeys);

    // Check remaining = total - eliminated
    if (Math.abs((total - eliminated) - remaining) > 1) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Key space arithmetic inconsistent: remaining ≠ total - eliminated',
        suggestion: `${total} - ${eliminated} = ${total - eliminated}, but remaining shows ${remaining}`,
        category: 'mathematical',
      });
    }

    // Check reduction factor
    const expectedFactor = total / remaining;
    if (remaining > 0 && Math.abs(expectedFactor - analysis.reductionFactor) / expectedFactor > 0.01) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: `Reduction factor (${analysis.reductionFactor}) inconsistent with key counts`,
        suggestion: `Expected: ${expectedFactor.toExponential(2)}`,
        category: 'mathematical',
      });
    }

    // Warn if no elimination methods specified
    if (analysis.eliminationMethods.length === 0) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: 'No elimination methods documented',
        suggestion: 'Document the methods used to eliminate keys',
        category: 'structural',
      });
    }

    return issues;
}

function validateFrequencyAnalysis(thought: CryptanalyticThought): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const analysis = thought.frequencyAnalysis!;

    // Check index of coincidence is reasonable
    if (analysis.indexOfCoincidence < 0 || analysis.indexOfCoincidence > 1) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Index of coincidence (${analysis.indexOfCoincidence}) must be between 0 and 1`,
        suggestion: 'IC = Σ(f_i × (f_i - 1)) / (N × (N - 1))',
        category: 'mathematical',
      });
    }

    // Check chi-squared is non-negative
    if (analysis.chiSquared < 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Chi-squared statistic (${analysis.chiSquared}) cannot be negative`,
        suggestion: 'Chi-squared = Σ((O - E)² / E) is always ≥ 0',
        category: 'mathematical',
      });
    }

    // Check degrees of freedom is positive
    if (analysis.degreesOfFreedom <= 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Degrees of freedom (${analysis.degreesOfFreedom}) must be positive`,
        suggestion: 'DoF = (number of categories - 1)',
        category: 'mathematical',
      });
    }

    return issues;
}

function validateHypotheses(thought: CryptanalyticThought): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const hypotheses = thought.hypotheses!;

    // Check for duplicate IDs
    const ids = hypotheses.map(h => h.id);
    const duplicates = ids.filter((id, idx) => ids.indexOf(id) !== idx);
    if (duplicates.length > 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Duplicate hypothesis IDs: ${[...new Set(duplicates)].join(', ')}`,
        suggestion: 'Each hypothesis should have a unique ID',
        category: 'structural',
      });
    }

    // Validate each hypothesis
    for (const h of hypotheses) {
      // Check probabilities are valid
      if (h.priorProbability < 0 || h.priorProbability > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Hypothesis ${h.id} prior probability (${h.priorProbability}) must be between 0 and 1`,
          suggestion: 'Prior probability should be a value between 0 and 1',
          category: 'mathematical',
        });
      }

      if (h.posteriorProbability < 0 || h.posteriorProbability > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Hypothesis ${h.id} posterior probability (${h.posteriorProbability}) must be between 0 and 1`,
          suggestion: 'Posterior probability should be a value between 0 and 1',
          category: 'mathematical',
        });
      }

      // Check status is valid
      const validStatuses = ['active', 'confirmed', 'refuted', 'superseded'];
      if (!validStatuses.includes(h.status)) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Invalid hypothesis status: ${h.status}`,
          suggestion: `Use one of: ${validStatuses.join(', ')}`,
          category: 'structural',
        });
      }
    }

    return issues;
}

function validateCribAnalysis(thought: CryptanalyticThought): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const cribAnalyses = thought.cribAnalysis!;

    for (const crib of cribAnalyses) {
      // Check crib and ciphertext lengths match at the position
      if (crib.crib.length !== crib.ciphertext.length) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: `Crib length (${crib.crib.length}) doesn't match ciphertext segment (${crib.ciphertext.length})`,
          suggestion: 'Crib and corresponding ciphertext should have the same length',
          category: 'structural',
        });
      }

      // Check position is valid
      if (crib.position < 0) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Crib position (${crib.position}) cannot be negative`,
          suggestion: 'Position should be a non-negative integer',
          category: 'structural',
        });
      }

      // If not viable but no contradictions, that's odd
      if (!crib.isViable && crib.contradictions.length === 0) {
        issues.push({
          severity: 'info',
          thoughtNumber: thought.thoughtNumber,
          description: 'Crib marked as non-viable but no contradictions documented',
          suggestion: 'Document why this crib position was rejected',
          category: 'structural',
        });
      }
    }

    return issues;
}
