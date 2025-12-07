/**
 * Cryptanalytic Reasoning Mode - Type Definitions
 * Phase 11 (v7.2.0) - Bayesian cryptanalysis with Turing's deciban system
 *
 * Historical Note: Alan Turing developed the "ban" and "deciban" units at
 * Bletchley Park during WWII to quantify the weight of evidence for
 * cryptographic hypotheses. This work predates much of modern Bayesian
 * inference notation.
 *
 * A "ban" is log₁₀ of the likelihood ratio (odds ratio)
 * A "deciban" is 1/10 of a ban (hence 10 decibans = 1 ban = factor of 10 in odds)
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Cryptanalytic thought types
 */
export type CryptanalyticThoughtType =
  | 'hypothesis_formation'     // Formulate cryptographic hypothesis
  | 'evidence_accumulation'    // Accumulate evidence (decibans)
  | 'frequency_analysis'       // Statistical frequency analysis
  | 'key_elimination'          // Key space elimination
  | 'banburismus'             // Turing's Banburismus technique
  | 'crib_analysis'           // Known plaintext attack
  | 'isomorphism_detection';  // Pattern matching

/**
 * Evidence unit (Turing's deciban system)
 *
 * 1 ban = log₁₀(10) = factor of 10 in odds
 * 1 deciban = 0.1 bans = log₁₀(10^0.1) ≈ factor of 1.26 in odds
 *
 * Turing considered 20 decibans (2 bans = 100:1 odds) sufficient for certainty.
 */
export interface DecibanEvidence {
  /** Description of the observation */
  observation: string;

  /** Deciban contribution (+ve supports hypothesis, -ve refutes) */
  decibans: number;

  /** The likelihood ratio P(E|H) / P(E|¬H) */
  likelihoodRatio: number;

  /** Source of this evidence */
  source: 'frequency' | 'pattern' | 'crib' | 'statistical' | 'structural';

  /** Confidence in this measurement */
  confidence: number;

  /** Explanation of the evidence */
  explanation?: string;
}

/**
 * Evidence chain (accumulative)
 */
export interface EvidenceChain {
  /** Hypothesis being tested */
  hypothesis: string;

  /** Individual pieces of evidence */
  observations: DecibanEvidence[];

  /** Running total of decibans */
  totalDecibans: number;

  /** Equivalent odds ratio (10^(decibans/10)) */
  oddsRatio: number;

  /** Conclusion based on threshold */
  conclusion: 'confirmed' | 'refuted' | 'inconclusive';

  /** Threshold for confirmation (typically 20 decibans) */
  confirmationThreshold: number;

  /** Threshold for refutation (typically -20 decibans) */
  refutationThreshold: number;
}

/**
 * Key space analysis
 */
export interface KeySpaceAnalysis {
  /** Total number of possible keys */
  totalKeys: bigint | number;

  /** Keys eliminated so far */
  eliminatedKeys: bigint | number;

  /** Remaining candidate keys */
  remainingKeys: bigint | number;

  /** Reduction factor (total / remaining) */
  reductionFactor: number;

  /** Methods used for elimination */
  eliminationMethods: {
    method: string;
    keysEliminated: bigint | number;
    explanation?: string;
  }[];

  /** Estimated work remaining */
  estimatedWorkRemaining?: string;
}

/**
 * Frequency analysis results
 */
export interface FrequencyAnalysis {
  /** Observed frequencies (character -> count) */
  observed: Map<string, number> | Record<string, number>;

  /** Expected frequencies for target language */
  expected: Map<string, number> | Record<string, number>;

  /** Chi-squared statistic */
  chiSquared: number;

  /** Degrees of freedom */
  degreesOfFreedom: number;

  /** P-value for the test */
  pValue?: number;

  /** Significant deviations from expected */
  significantDeviations: {
    character: string;
    observed: number;
    expected: number;
    deviation: number;
    isSignificant: boolean;
  }[];

  /** Index of coincidence */
  indexOfCoincidence: number;

  /** Expected IC for different languages */
  expectedIC?: {
    language: string;
    ic: number;
  }[];
}

/**
 * Banburismus analysis (Turing's technique for Enigma)
 *
 * Named after Banbury sheets used at Bletchley Park.
 * Used to determine Enigma wheel order and find "tetragram" hits.
 */
export interface BanburismusAnalysis {
  /** Messages being compared */
  messageA: string;
  messageB: string;

  /** Relative offset being tested */
  offset: number;

  /** Number of letter coincidences at this offset */
  coincidences: number;

  /** Expected coincidences for random text */
  expectedCoincidences: number;

  /** Deciban score for this offset */
  decibanScore: number;

  /** Whether this offset is significant */
  isSignificant: boolean;

  /** Inferred relationship if significant */
  inference?: string;
}

/**
 * Crib analysis (known plaintext attack)
 */
export interface CribAnalysis {
  /** The known plaintext (crib) */
  crib: string;

  /** Position of crib in message */
  position: number;

  /** Corresponding ciphertext segment */
  ciphertext: string;

  /** Constraints derived from crib */
  constraints: {
    plaintextChar: string;
    ciphertextChar: string;
    possibleMappings: string[];
  }[];

  /** Contradictions found (if any) */
  contradictions: string[];

  /** Score for this crib position */
  score: number;

  /** Whether this position is viable */
  isViable: boolean;
}

/**
 * Cipher classification
 */
export type CipherType =
  | 'substitution_simple'      // Caesar, Atbash
  | 'substitution_polyalphabetic'  // Vigenère
  | 'substitution_polygraphic' // Playfair, Hill
  | 'transposition'            // Rail fence, columnar
  | 'rotor'                    // Enigma, SIGABA
  | 'stream'                   // One-time pad, RC4
  | 'block'                    // DES, AES
  | 'unknown';

/**
 * Cryptographic hypothesis
 */
export interface CryptographicHypothesis {
  /** Hypothesis ID */
  id: string;

  /** Description of the hypothesis */
  description: string;

  /** What cipher type is hypothesized */
  cipherType?: CipherType;

  /** Specific parameters hypothesized */
  parameters?: Record<string, string | number>;

  /** Prior probability (subjective) */
  priorProbability: number;

  /** Current posterior probability */
  posteriorProbability: number;

  /** Current deciban score */
  decibanScore: number;

  /** Evidence supporting/refuting this hypothesis */
  evidence: DecibanEvidence[];

  /** Status of the hypothesis */
  status: 'active' | 'confirmed' | 'refuted' | 'superseded';
}

/**
 * Isomorphism pattern
 */
export interface IsomorphismPattern {
  /** Pattern found */
  pattern: string;

  /** Positions in text */
  positions: number[];

  /** What this pattern suggests */
  suggestion: string;

  /** Deciban contribution */
  decibanContribution: number;
}

/**
 * Cryptanalytic thought
 */
export interface CryptanalyticThought extends BaseThought {
  mode: ThinkingMode.CRYPTANALYTIC;
  thoughtType: CryptanalyticThoughtType;

  /** The ciphertext being analyzed */
  ciphertext?: string;

  /** Known or suspected plaintext */
  plaintext?: string;

  /** Active hypotheses */
  hypotheses?: CryptographicHypothesis[];

  /** Current best hypothesis */
  currentHypothesis?: CryptographicHypothesis;

  /** Evidence chains */
  evidenceChains?: EvidenceChain[];

  /** Key space analysis */
  keySpaceAnalysis?: KeySpaceAnalysis;

  /** Frequency analysis results */
  frequencyAnalysis?: FrequencyAnalysis;

  /** Banburismus analysis (for Enigma-type ciphers) */
  banburismusAnalysis?: BanburismusAnalysis[];

  /** Crib analysis results */
  cribAnalysis?: CribAnalysis[];

  /** Isomorphism patterns found */
  patterns?: IsomorphismPattern[];

  /** Cipher type determination */
  cipherType?: CipherType;

  /** Dependencies */
  dependencies: string[];

  /** Assumptions */
  assumptions: string[];

  /** Uncertainty (lower when evidence is strong) */
  uncertainty: number;

  /** Key insight from this analysis */
  keyInsight?: string;
}

/**
 * Type guard for Cryptanalytic thoughts
 */
export function isCryptanalyticThought(thought: BaseThought): thought is CryptanalyticThought {
  return thought.mode === ThinkingMode.CRYPTANALYTIC;
}

/**
 * Convert likelihood ratio to decibans
 * decibans = 10 × log₁₀(likelihood ratio)
 */
export function toDecibans(likelihoodRatio: number): number {
  return 10 * Math.log10(likelihoodRatio);
}

/**
 * Convert decibans to likelihood ratio
 * likelihood ratio = 10^(decibans/10)
 */
export function fromDecibans(decibans: number): number {
  return Math.pow(10, decibans / 10);
}

/**
 * Convert decibans to odds ratio
 */
export function decibansToOdds(decibans: number): number {
  return fromDecibans(decibans);
}

/**
 * Convert decibans to probability (assuming prior of 0.5)
 */
export function decibansToProbability(decibans: number, priorProbability: number = 0.5): number {
  const priorOdds = priorProbability / (1 - priorProbability);
  const posteriorOdds = priorOdds * fromDecibans(decibans);
  return posteriorOdds / (1 + posteriorOdds);
}

/**
 * Accumulate evidence and get total decibans
 */
export function accumulateEvidence(observations: DecibanEvidence[]): number {
  return observations.reduce((total, obs) => total + obs.decibans, 0);
}

/**
 * Calculate index of coincidence for a text
 * IC = Σ(f_i × (f_i - 1)) / (N × (N - 1))
 */
export function calculateIndexOfCoincidence(text: string): number {
  const cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');
  const n = cleanText.length;
  if (n <= 1) return 0;

  const frequencies: Record<string, number> = {};
  for (const char of cleanText) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  let sum = 0;
  for (const count of Object.values(frequencies)) {
    sum += count * (count - 1);
  }

  return sum / (n * (n - 1));
}

/**
 * Expected index of coincidence for different languages
 */
export const LANGUAGE_IC: Record<string, number> = {
  english: 0.0667,
  german: 0.0762,
  french: 0.0778,
  spanish: 0.0775,
  italian: 0.0738,
  random: 0.0385, // 1/26 for uniform distribution
};

/**
 * Standard English letter frequencies (for frequency analysis)
 */
export const ENGLISH_FREQUENCIES: Record<string, number> = {
  E: 0.127, T: 0.091, A: 0.082, O: 0.075, I: 0.070,
  N: 0.067, S: 0.063, H: 0.061, R: 0.060, D: 0.043,
  L: 0.040, C: 0.028, U: 0.028, M: 0.024, W: 0.024,
  F: 0.022, G: 0.020, Y: 0.020, P: 0.019, B: 0.015,
  V: 0.010, K: 0.008, J: 0.002, X: 0.002, Q: 0.001,
  Z: 0.001,
};
