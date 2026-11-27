# Knowledge Pack: cryptanalytic

**Mode**: `cryptanalytic`
**Category skill**: `think-analytical`
**Source doc**: `docs/modes/CRYPTANALYTIC.md`

## Overview

Cryptanalytic mode provides **Bayesian cryptanalysis** using **Alan Turing's deciban system**. Developed at Bletchley Park during WWII, the deciban is a unit for quantifying the weight of evidence for cryptographic hypotheses.

This mode captures the structure of cryptanalytic reasoning - from hypothesis formation through evidence accumulation to cipher breaking.

## When to Use

Use cryptanalytic mode when you need to:

- **Analyze ciphers** - Break or analyze encryption
- **Accumulate evidence** - Build confidence incrementally
- **Eliminate key space** - Reduce possible keys
- **Apply frequency analysis** - Statistical attacks
- **Use cribs** - Known plaintext attacks

## Core Concepts

(no 'core concepts' section in source doc)

## Thought Type (TypeScript Interface)

```typescript
interface CryptanalyticThought extends BaseThought {
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
```

## Supporting Interfaces

```typescript
interface DecibanEvidence {
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

interface EvidenceChain {
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

interface KeySpaceAnalysis {
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
}

interface FrequencyAnalysis {
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
}

interface BanburismusAnalysis {
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

interface CribAnalysis {
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
}

interface CryptographicHypothesis {
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

interface IsomorphismPattern {
/** Pattern found */
  pattern: string;

  /** Positions in text */
  positions: number[];

  /** What this pattern suggests */
  suggestion: string;

  /** Deciban contribution */
  decibanContribution: number;
}

```

## Worked Example (from source doc)

```typescript
// Form initial hypothesis
const hypothesis = await deepthinking_analytical({
  mode: 'cryptanalytic',
  thought: 'Form hypothesis about the cipher type',
  thoughtNumber: 1,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'hypothesis_formation',
  ciphertext: 'WKLV LV D WHVW',
  hypotheses: [{
    id: 'h1',
    description: 'Simple substitution cipher (Caesar variant)',
    cipherType: 'substitution_simple',
    parameters: { shift: 'unknown' },
    priorProbability: 0.3,
    posteriorProbability: 0.3,
    decibanScore: 0,
    evidence: [],
    status: 'active'
  }],
  dependencies: [],
  assumptions: ['Text is English'],
  uncertainty: 0.7
});

// Perform frequency analysis
const frequency = await deepthinking_analytical({
  mode: 'cryptanalytic',
  thought: 'Analyze letter frequencies',
  thoughtNumber: 2,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'frequency_analysis',
  ciphertext: 'WKLV LV D WHVW',
  frequencyAnalysis: {
    observed: { W: 3, L: 2, V: 3, K: 1, D: 1, H: 1 },
    expected: { E: 0.127, T: 0.091, A: 0.082 },  // English
    chiSquared: 45.2,
    degreesOfFreedom: 25,
    significantDeviations: [
      { character: 'W', observed: 0.25, expected: 0.024, deviation: 0.226, isSignificant: true }
    ],
    indexOfCoincidence: 0.068  // Close to English (0.067)
  },
  dependencies: ['hypothesis_formation'],
  assumptions: ['English plaintext'],
  uncertainty: 0.4
});

// Accumulate evidence
const evidence = await deepthinking_analytical({
  mode: 'cryptanalytic',
  thought: 'Accumulate evidence for Caesar cipher with shift 3',
  thoughtNumber: 3,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'evidence_accumulation',
  ciphertext: 'WKLV LV D WHVW',
  currentHypothesis: {
    id: 'h1_shift3',
    description: 'Caesar cipher with shift 3',
    cipherType: 'substitution_simple',
    parameters: { shift: 3 },
    priorProbability: 0.1,
    posteriorProbability: 0.0,  // Will be updated
    decibanScore: 0,
    evidence: [],
    status: 'active'
  },
  evidenceChains: [{
    hypothesis: 'Caesar cipher with shift 3',
    observations: [
      {
        observation: 'W decrypts to T (common letter)',
        decibans: 3,
        likelihoodRatio: 2.0,
        source: 'frequency',
        confidence: 0.9,
        explanation: 'T is the 2nd most common English letter'
      },
      {
        observation: 'K decrypts to H',
        decibans: 2,
        likelihoodRatio: 1.6,
        source: 'freq

---

*Generated by RLM extraction pass on 2026-04-12*
