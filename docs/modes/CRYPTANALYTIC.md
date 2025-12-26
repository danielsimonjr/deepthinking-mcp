# Cryptanalytic Reasoning Mode

**Version**: 7.2.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_analytical`
**Status**: Stable (Phase 11, v7.2.0)
**Source**: `src/types/modes/cryptanalytic.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `CryptanalyticThoughtType`, `CipherType`
- **Interfaces**: `DecibanEvidence`, `EvidenceChain`, `KeySpaceAnalysis`, `FrequencyAnalysis`, `BanburismusAnalysis`, `CribAnalysis`, `CryptographicHypothesis`, `IsomorphismPattern`, `CryptanalyticThought`
- **Functions**: `isCryptanalyticThought`, `toDecibans`, `fromDecibans`, `decibansToOdds`, `decibansToProbability`, `accumulateEvidence`, `calculateIndexOfCoincidence`
- **Constants**: `LANGUAGE_IC`, `ENGLISH_FREQUENCIES`

---

## Overview

Cryptanalytic mode provides **Bayesian cryptanalysis** using **Alan Turing's deciban system**. Developed at Bletchley Park during WWII, the deciban is a unit for quantifying the weight of evidence for cryptographic hypotheses.

This mode captures the structure of cryptanalytic reasoning - from hypothesis formation through evidence accumulation to cipher breaking.

## The Deciban System

Turing invented the **ban** (and deciban) to quantify evidence strength:

- **1 ban** = log₁₀(10) = factor of 10 in odds
- **1 deciban** = 0.1 bans ≈ factor of 1.26 in odds
- **20 decibans** = 100:1 odds (sufficient for certainty)

$$\text{decibans} = 10 \times \log_{10}(\text{likelihood ratio})$$

## Thought Types

| Type | Description |
|------|-------------|
| `hypothesis_formation` | Formulate cryptographic hypotheses |
| `evidence_accumulation` | Accumulate evidence (decibans) |
| `frequency_analysis` | Statistical frequency analysis |
| `key_elimination` | Key space elimination |
| `banburismus` | Turing's Banburismus technique |
| `crib_analysis` | Known plaintext attack |
| `isomorphism_detection` | Pattern matching |

## When to Use Cryptanalytic Mode

Use cryptanalytic mode when you need to:

- **Analyze ciphers** - Break or analyze encryption
- **Accumulate evidence** - Build confidence incrementally
- **Eliminate key space** - Reduce possible keys
- **Apply frequency analysis** - Statistical attacks
- **Use cribs** - Known plaintext attacks

### Problem Types Well-Suited for Cryptanalytic Mode

- **Classical cryptanalysis** - Breaking historical ciphers
- **Pattern analysis** - Finding patterns in encrypted data
- **Key recovery** - Recovering encryption keys
- **Cipher identification** - Determining cipher type
- **Evidence-based analysis** - Any problem requiring evidence accumulation

## Core Concepts

### Deciban Evidence

```typescript
interface DecibanEvidence {
  observation: string;
  decibans: number;           // +ve supports, -ve refutes
  likelihoodRatio: number;    // P(E|H) / P(E|¬H)
  source: 'frequency' | 'pattern' | 'crib' | 'statistical' | 'structural';
  confidence: number;
  explanation?: string;
}
```

### Evidence Chain

```typescript
interface EvidenceChain {
  hypothesis: string;
  observations: DecibanEvidence[];
  totalDecibans: number;
  oddsRatio: number;          // 10^(decibans/10)
  conclusion: 'confirmed' | 'refuted' | 'inconclusive';
  confirmationThreshold: number;   // Typically 20 decibans
  refutationThreshold: number;     // Typically -20 decibans
}
```

### Key Space Analysis

```typescript
interface KeySpaceAnalysis {
  totalKeys: bigint | number;
  eliminatedKeys: bigint | number;
  remainingKeys: bigint | number;
  reductionFactor: number;
  eliminationMethods: {
    method: string;
    keysEliminated: bigint | number;
    explanation?: string;
  }[];
  estimatedWorkRemaining?: string;
}
```

### Frequency Analysis

```typescript
interface FrequencyAnalysis {
  observed: Map<string, number> | Record<string, number>;
  expected: Map<string, number> | Record<string, number>;
  chiSquared: number;
  degreesOfFreedom: number;
  pValue?: number;
  significantDeviations: {
    character: string;
    observed: number;
    expected: number;
    deviation: number;
    isSignificant: boolean;
  }[];
  indexOfCoincidence: number;
  expectedIC?: { language: string; ic: number }[];
}
```

### Cryptographic Hypothesis

```typescript
interface CryptographicHypothesis {
  id: string;
  description: string;
  cipherType?: CipherType;
  parameters?: Record<string, string | number>;
  priorProbability: number;
  posteriorProbability: number;
  decibanScore: number;
  evidence: DecibanEvidence[];
  status: 'active' | 'confirmed' | 'refuted' | 'superseded';
}
```

### Cipher Types

```typescript
type CipherType =
  | 'substitution_simple'         // Caesar, Atbash
  | 'substitution_polyalphabetic' // Vigenère
  | 'substitution_polygraphic'    // Playfair, Hill
  | 'transposition'               // Rail fence, columnar
  | 'rotor'                       // Enigma, SIGABA
  | 'stream'                      // One-time pad, RC4
  | 'block'                       // DES, AES
  | 'unknown';
```

## Usage Example

```typescript
// Form initial hypothesis
const hypothesis = await deepthinking_standard({
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
const frequency = await deepthinking_standard({
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
const evidence = await deepthinking_standard({
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
        source: 'frequency',
        confidence: 0.85
      },
      {
        observation: 'L decrypts to I',
        decibans: 2.5,
        likelihoodRatio: 1.8,
        source: 'frequency',
        confidence: 0.88
      },
      {
        observation: 'Decrypted text "THIS IS A TEST" is coherent English',
        decibans: 15,
        likelihoodRatio: 31.6,
        source: 'structural',
        confidence: 0.98,
        explanation: 'Coherent English is very unlikely by chance'
      }
    ],
    totalDecibans: 22.5,
    oddsRatio: 178,  // 10^(22.5/10) ≈ 178:1 odds
    conclusion: 'confirmed',
    confirmationThreshold: 20,
    refutationThreshold: -20
  }],
  dependencies: ['frequency_analysis'],
  assumptions: [],
  uncertainty: 0.05
});

// Key space analysis
const keyspace = await deepthinking_standard({
  mode: 'cryptanalytic',
  thought: 'Analyze remaining key space',
  thoughtNumber: 4,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'key_elimination',
  keySpaceAnalysis: {
    totalKeys: 26,  // Caesar cipher has 26 possible shifts
    eliminatedKeys: 25,
    remainingKeys: 1,
    reductionFactor: 26,
    eliminationMethods: [
      { method: 'Frequency analysis', keysEliminated: 20, explanation: 'Only 6 shifts produce plausible frequency distributions' },
      { method: 'Coherent text check', keysEliminated: 5, explanation: 'Only shift=3 produces readable English' }
    ],
    estimatedWorkRemaining: 'None - key found'
  },
  dependencies: ['evidence_accumulation'],
  assumptions: [],
  uncertainty: 0.02
});

// Crib analysis (for more complex ciphers)
const crib = await deepthinking_standard({
  mode: 'cryptanalytic',
  thought: 'Apply crib analysis if known plaintext available',
  thoughtNumber: 5,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'crib_analysis',
  ciphertext: 'WKLV LV D WHVW',
  plaintext: 'THIS IS A TEST',
  cribAnalysis: [{
    crib: 'THIS',
    position: 0,
    ciphertext: 'WKLV',
    constraints: [
      { plaintextChar: 'T', ciphertextChar: 'W', possibleMappings: ['shift+3'] },
      { plaintextChar: 'H', ciphertextChar: 'K', possibleMappings: ['shift+3'] },
      { plaintextChar: 'I', ciphertextChar: 'L', possibleMappings: ['shift+3'] },
      { plaintextChar: 'S', ciphertextChar: 'V', possibleMappings: ['shift+3'] }
    ],
    contradictions: [],
    score: 1.0,
    isViable: true
  }],
  dependencies: ['key_elimination'],
  assumptions: ['Crib is correctly positioned'],
  uncertainty: 0.01
});

// Final conclusion
const conclusion = await deepthinking_standard({
  mode: 'cryptanalytic',
  thought: 'Conclude the cipher analysis',
  thoughtNumber: 6,
  totalThoughts: 6,
  nextThoughtNeeded: false,

  thoughtType: 'hypothesis_formation',
  ciphertext: 'WKLV LV D WHVW',
  plaintext: 'THIS IS A TEST',
  currentHypothesis: {
    id: 'h1_shift3',
    description: 'Caesar cipher with shift 3 (confirmed)',
    cipherType: 'substitution_simple',
    parameters: { shift: 3 },
    priorProbability: 0.1,
    posteriorProbability: 0.995,
    decibanScore: 22.5,
    evidence: [/* accumulated evidence */],
    status: 'confirmed'
  },
  cipherType: 'substitution_simple',
  dependencies: ['crib_analysis'],
  assumptions: [],
  uncertainty: 0.005,
  keyInsight: 'Simple Caesar cipher with shift 3, trivially broken by frequency analysis'
});
```

## Helper Functions

```typescript
// Convert likelihood ratio to decibans
function toDecibans(likelihoodRatio: number): number {
  return 10 * Math.log10(likelihoodRatio);
}

// Convert decibans to likelihood ratio
function fromDecibans(decibans: number): number {
  return Math.pow(10, decibans / 10);
}

// Calculate index of coincidence
function calculateIndexOfCoincidence(text: string): number {
  // IC = Σ(f_i × (f_i - 1)) / (N × (N - 1))
}

// Language IC values
const LANGUAGE_IC = {
  english: 0.0667,
  german: 0.0762,
  random: 0.0385  // 1/26
};
```

## Best Practices

### Hypothesis Formation

✅ **Do:**
- Start with multiple competing hypotheses
- Assign reasonable prior probabilities
- Consider all cipher types

❌ **Don't:**
- Commit to a hypothesis too early
- Ignore alternative explanations
- Forget about modern ciphers

### Evidence Accumulation

✅ **Do:**
- Calculate likelihood ratios carefully
- Use deciban thresholds consistently
- Track cumulative evidence

❌ **Don't:**
- Double-count evidence
- Ignore negative evidence
- Set arbitrary thresholds

### Frequency Analysis

✅ **Do:**
- Compare to expected frequencies
- Calculate index of coincidence
- Consider language differences

❌ **Don't:**
- Assume English plaintext
- Ignore short-text effects
- Skip statistical tests

## CryptanalyticThought Interface

```typescript
interface CryptanalyticThought extends BaseThought {
  mode: ThinkingMode.CRYPTANALYTIC;
  thoughtType: CryptanalyticThoughtType;
  ciphertext?: string;
  plaintext?: string;
  hypotheses?: CryptographicHypothesis[];
  currentHypothesis?: CryptographicHypothesis;
  evidenceChains?: EvidenceChain[];
  keySpaceAnalysis?: KeySpaceAnalysis;
  frequencyAnalysis?: FrequencyAnalysis;
  banburismusAnalysis?: BanburismusAnalysis[];
  cribAnalysis?: CribAnalysis[];
  patterns?: IsomorphismPattern[];
  cipherType?: CipherType;
  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  keyInsight?: string;
}
```

## Historical Note

**Alan Turing** developed the deciban system at Bletchley Park during WWII to quantify evidence in Enigma cryptanalysis. The "Banburismus" technique, named after the Banbury sheets used, helped determine Enigma wheel orders.

## Integration with Other Modes

Cryptanalytic mode integrates with:

- **Bayesian Mode** - Probabilistic reasoning
- **Computability Mode** - Computational limits
- **Mathematics Mode** - Statistical foundations
- **Algorithmic Mode** - Attack complexity

## Related Modes

- [Bayesian Mode](./BAYESIAN.md) - Probability theory
- [Computability Mode](./COMPUTABILITY.md) - Computational theory
- [Mathematics Mode](./MATHEMATICS.md) - Statistics
- [Algorithmic Mode](./ALGORITHMIC.md) - Complexity

## Limitations

- **Classical focus** - Modern cryptography needs different tools
- **No automated attacks** - Manual analysis required
- **Educational purpose** - Not for real cryptanalysis

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
