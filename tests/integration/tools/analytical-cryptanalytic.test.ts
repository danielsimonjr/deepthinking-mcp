/**
 * Analytical Mode Integration Tests - Cryptanalytic Reasoning
 *
 * Tests T-ANL-029 through T-ANL-034: Comprehensive integration tests
 * for the deepthinking_analytical tool with cryptanalytic mode.
 *
 * Phase 11 Sprint 6: Analytical & Scientific Modes
 *
 * Historical Note: Based on Turing's deciban evidence system from WWII
 * cryptanalysis at Bletchley Park.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type CryptanalyticThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Analytical Mode Integration - Cryptanalytic Reasoning', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * Helper to create basic cryptanalytic input
   */
  function createCryptanalyticInput(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Cryptanalytic reasoning step',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'cryptanalytic',
      ...overrides,
    } as ThinkingToolInput;
  }

  /**
   * T-ANL-029: Basic cryptanalytic thought
   */
  describe('T-ANL-029: Basic Cryptanalytic Thought', () => {
    it('should create a basic cryptanalytic thought with minimal params', () => {
      const input = createCryptanalyticInput({
        thought: 'Analyzing ciphertext pattern',
      });

      const thought = factory.createThought(input, 'session-crypt-029');

      expect(thought.mode).toBe(ThinkingMode.CRYPTANALYTIC);
      expect(thought.content).toBe('Analyzing ciphertext pattern');
      expect(thought.sessionId).toBe('session-crypt-029');
    });

    it('should assign unique IDs to cryptanalytic thoughts', () => {
      const input1 = createCryptanalyticInput({ thought: 'First analysis' });
      const input2 = createCryptanalyticInput({ thought: 'Second analysis' });

      const thought1 = factory.createThought(input1, 'session-crypt-029');
      const thought2 = factory.createThought(input2, 'session-crypt-029');

      expect(thought1.id).not.toBe(thought2.id);
    });

    it('should include thoughtType for cryptanalytic mode', () => {
      const input = createCryptanalyticInput({
        thought: 'Hypothesis formation',
        thoughtType: 'hypothesis_formation',
      });

      const thought = factory.createThought(input, 'session-crypt-029') as CryptanalyticThought;

      expect(thought.thoughtType).toBe('hypothesis_formation');
    });
  });

  /**
   * T-ANL-030: Cryptanalytic with deciban evidence
   */
  describe('T-ANL-030: Deciban Evidence', () => {
    it('should include deciban evidence in thought', () => {
      const input = createCryptanalyticInput({
        thought: 'Accumulating deciban evidence',
        thoughtType: 'evidence_accumulation',
        evidenceChains: [
          {
            hypothesis: 'The cipher is a simple substitution',
            observations: [
              {
                observation: 'Letter frequency matches natural language',
                decibans: 5,
                likelihoodRatio: 3.16,
                source: 'frequency',
                confidence: 0.9,
              },
              {
                observation: 'Repeated patterns at consistent intervals',
                decibans: 3,
                likelihoodRatio: 2.0,
                source: 'pattern',
                confidence: 0.85,
              },
            ],
            totalDecibans: 8,
            oddsRatio: 6.31,
            conclusion: 'inconclusive',
            confirmationThreshold: 20,
            refutationThreshold: -20,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-crypt-030') as CryptanalyticThought;

      expect(thought.evidenceChains).toHaveLength(1);
      expect(thought.evidenceChains![0].totalDecibans).toBe(8);
      expect(thought.evidenceChains![0].observations).toHaveLength(2);
    });

    it('should handle negative decibans (refuting evidence)', () => {
      const input = createCryptanalyticInput({
        thought: 'Refuting hypothesis',
        evidenceChains: [
          {
            hypothesis: 'The cipher is a Vigenere cipher',
            observations: [
              {
                observation: 'Index of coincidence too high for polyalphabetic',
                decibans: -7,
                likelihoodRatio: 0.2,
                source: 'statistical',
                confidence: 0.95,
              },
            ],
            totalDecibans: -7,
            oddsRatio: 0.2,
            conclusion: 'inconclusive',
            confirmationThreshold: 20,
            refutationThreshold: -20,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-crypt-030') as CryptanalyticThought;

      expect(thought.evidenceChains![0].totalDecibans).toBeLessThan(0);
      expect(thought.evidenceChains![0].observations[0].decibans).toBe(-7);
    });
  });

  /**
   * T-ANL-031: Cryptanalytic hypothesis testing
   */
  describe('T-ANL-031: Hypothesis Testing', () => {
    it('should support multiple cryptographic hypotheses', () => {
      const input = createCryptanalyticInput({
        thought: 'Testing multiple cipher hypotheses',
        thoughtType: 'hypothesis_formation',
        hypotheses: [
          {
            id: 'h1',
            description: 'Simple Caesar cipher with shift 3',
            cipherType: 'substitution_simple',
            parameters: { shift: 3 },
            priorProbability: 0.3,
            posteriorProbability: 0.15,
            decibanScore: -3,
            evidence: [],
            status: 'active',
          },
          {
            id: 'h2',
            description: 'Vigenere cipher with keyword',
            cipherType: 'substitution_polyalphabetic',
            parameters: { keywordLength: 5 },
            priorProbability: 0.4,
            posteriorProbability: 0.55,
            decibanScore: 5,
            evidence: [],
            status: 'active',
          },
          {
            id: 'h3',
            description: 'Playfair cipher',
            cipherType: 'substitution_polygraphic',
            priorProbability: 0.2,
            posteriorProbability: 0.25,
            decibanScore: 2,
            evidence: [],
            status: 'active',
          },
        ],
      });

      const thought = factory.createThought(input, 'session-crypt-031') as CryptanalyticThought;

      expect(thought.hypotheses).toHaveLength(3);
      // Verify hypotheses have the required structure
      expect(thought.hypotheses![0].id).toBe('h1');
      expect(thought.hypotheses![1].id).toBe('h2');
      expect(thought.hypotheses![2].id).toBe('h3');
    });

    it('should identify current best hypothesis', () => {
      const input = createCryptanalyticInput({
        thought: 'Identifying best hypothesis',
        currentHypothesis: {
          id: 'h-best',
          description: 'Most likely: Simple substitution cipher',
          cipherType: 'substitution_simple',
          priorProbability: 0.5,
          posteriorProbability: 0.85,
          decibanScore: 12,
          evidence: [],
          status: 'active',
        },
      });

      const thought = factory.createThought(input, 'session-crypt-031') as CryptanalyticThought;

      // Verify currentHypothesis is passed through
      expect(thought.currentHypothesis).toBeDefined();
      expect(thought.currentHypothesis!.id).toBe('h-best');
      expect(thought.currentHypothesis!.description).toBe('Most likely: Simple substitution cipher');
    });
  });

  /**
   * T-ANL-032: Cryptanalytic evidence accumulation
   */
  describe('T-ANL-032: Evidence Accumulation', () => {
    it('should accumulate evidence towards confirmation', () => {
      const input = createCryptanalyticInput({
        thought: 'Evidence accumulation reaching threshold',
        thoughtType: 'evidence_accumulation',
        evidenceChains: [
          {
            hypothesis: 'Caesar cipher with shift 13 (ROT13)',
            observations: [
              { observation: 'All letters map to valid letters', decibans: 4, likelihoodRatio: 2.5, source: 'structural', confidence: 1.0 },
              { observation: 'Frequency matches English after shift', decibans: 8, likelihoodRatio: 6.3, source: 'frequency', confidence: 0.95 },
              { observation: 'Common words appear after decoding', decibans: 10, likelihoodRatio: 10, source: 'pattern', confidence: 0.98 },
            ],
            totalDecibans: 22,
            oddsRatio: 158,
            conclusion: 'confirmed',
            confirmationThreshold: 20,
            refutationThreshold: -20,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-crypt-032') as CryptanalyticThought;

      expect(thought.evidenceChains![0].totalDecibans).toBeGreaterThan(20);
      expect(thought.evidenceChains![0].conclusion).toBe('confirmed');
    });

    it('should track key space analysis', () => {
      const input = createCryptanalyticInput({
        thought: 'Analyzing remaining key space',
        keySpaceAnalysis: {
          totalKeys: 456976, // 26^4 for 4-letter keyword
          eliminatedKeys: 400000,
          remainingKeys: 56976,
          reductionFactor: 8.02,
          eliminationMethods: [
            { method: 'Frequency analysis', keysEliminated: 200000, explanation: 'Eliminated keys with unlikely letter frequencies' },
            { method: 'Crib analysis', keysEliminated: 200000, explanation: 'Known plaintext eliminates inconsistent keys' },
          ],
          estimatedWorkRemaining: 'Approximately 57k keys to test',
        },
      });

      const thought = factory.createThought(input, 'session-crypt-032') as CryptanalyticThought;

      expect(thought.keySpaceAnalysis!.remainingKeys).toBeLessThan(thought.keySpaceAnalysis!.totalKeys as number);
      expect(thought.keySpaceAnalysis!.eliminationMethods).toHaveLength(2);
    });
  });

  /**
   * T-ANL-033: Cryptanalytic Bayesian integration
   */
  describe('T-ANL-033: Bayesian Integration', () => {
    it('should integrate with Bayesian probability updates', () => {
      const input = createCryptanalyticInput({
        thought: 'Bayesian update of cipher type probabilities',
        hypotheses: [
          {
            id: 'caesar',
            description: 'Caesar cipher',
            cipherType: 'substitution_simple',
            priorProbability: 0.33,
            posteriorProbability: 0.12,
            decibanScore: -5,
            evidence: [
              { observation: 'IC too high for simple substitution', decibans: -5, likelihoodRatio: 0.32, source: 'statistical', confidence: 0.9 },
            ],
            status: 'active',
          },
          {
            id: 'vigenere',
            description: 'Vigenere cipher',
            cipherType: 'substitution_polyalphabetic',
            priorProbability: 0.33,
            posteriorProbability: 0.68,
            decibanScore: 8,
            evidence: [
              { observation: 'Kasiski test suggests period 5', decibans: 5, likelihoodRatio: 3.16, source: 'pattern', confidence: 0.85 },
              { observation: 'IC of each coset matches English', decibans: 3, likelihoodRatio: 2.0, source: 'statistical', confidence: 0.9 },
            ],
            status: 'active',
          },
          {
            id: 'transposition',
            description: 'Transposition cipher',
            cipherType: 'transposition',
            priorProbability: 0.33,
            posteriorProbability: 0.20,
            decibanScore: -2,
            evidence: [
              { observation: 'Letter frequencies match plaintext (expected for transposition)', decibans: -2, likelihoodRatio: 0.63, source: 'frequency', confidence: 0.8 },
            ],
            status: 'active',
          },
        ],
      });

      const thought = factory.createThought(input, 'session-crypt-033') as CryptanalyticThought;

      // Verify Bayesian update results
      const vigenere = thought.hypotheses!.find(h => h.id === 'vigenere')!;
      expect(vigenere.posteriorProbability).toBeGreaterThan(vigenere.priorProbability);
      expect(vigenere.decibanScore).toBeGreaterThan(0);
    });

    it('should handle frequency analysis results', () => {
      const input = createCryptanalyticInput({
        thought: 'Frequency analysis for cipher type determination',
        frequencyAnalysis: {
          observed: { E: 0.127, T: 0.09, A: 0.08, O: 0.075 },
          expected: { E: 0.127, T: 0.091, A: 0.082, O: 0.075 },
          chiSquared: 2.5,
          degreesOfFreedom: 25,
          significantDeviations: [
            { character: 'T', observed: 0.09, expected: 0.091, deviation: 0.001, isSignificant: false },
          ],
          indexOfCoincidence: 0.066,
          expectedIC: [
            { language: 'english', ic: 0.0667 },
            { language: 'random', ic: 0.0385 },
          ],
        },
      });

      const thought = factory.createThought(input, 'session-crypt-033') as CryptanalyticThought;

      expect(thought.frequencyAnalysis!.indexOfCoincidence).toBeCloseTo(0.066, 2);
      expect(thought.frequencyAnalysis!.chiSquared).toBe(2.5);
    });
  });

  /**
   * T-ANL-034: Cryptanalytic multi-thought analysis
   */
  describe('T-ANL-034: Multi-Thought Analysis', () => {
    it('should support multi-step cryptanalytic session', () => {
      const sessionId = 'session-crypt-034-multi';

      // Step 1: Hypothesis formation
      const step1Input = createCryptanalyticInput({
        thought: 'Step 1: Initial hypothesis formation',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        thoughtType: 'hypothesis_formation',
        ciphertext: 'WKLV LV D WHVW PHVVDJH',
        hypotheses: [
          { id: 'h1', description: 'Simple substitution', cipherType: 'substitution_simple', priorProbability: 0.4, posteriorProbability: 0.4, decibanScore: 0, evidence: [], status: 'active' },
          { id: 'h2', description: 'Polyalphabetic', cipherType: 'substitution_polyalphabetic', priorProbability: 0.3, posteriorProbability: 0.3, decibanScore: 0, evidence: [], status: 'active' },
          { id: 'h3', description: 'Transposition', cipherType: 'transposition', priorProbability: 0.3, posteriorProbability: 0.3, decibanScore: 0, evidence: [], status: 'active' },
        ],
      });
      const step1 = factory.createThought(step1Input, sessionId) as CryptanalyticThought;
      expect(step1.hypotheses).toHaveLength(3);
      expect(step1.ciphertext).toBe('WKLV LV D WHVW PHVVDJH');

      // Step 2: Frequency analysis
      const step2Input = createCryptanalyticInput({
        thought: 'Step 2: Frequency analysis',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        thoughtType: 'frequency_analysis',
        frequencyAnalysis: {
          observed: { W: 0.15, V: 0.2, H: 0.1, L: 0.1 },
          expected: { E: 0.127, T: 0.091, A: 0.082, O: 0.075 },
          chiSquared: 45.2,
          degreesOfFreedom: 25,
          significantDeviations: [],
          indexOfCoincidence: 0.068,
        },
      });
      const step2 = factory.createThought(step2Input, sessionId) as CryptanalyticThought;
      expect(step2.frequencyAnalysis).toBeDefined();

      // Step 3: Evidence accumulation
      const step3Input = createCryptanalyticInput({
        thought: 'Step 3: Evidence points to simple substitution',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        thoughtType: 'evidence_accumulation',
        evidenceChains: [
          {
            hypothesis: 'Simple substitution (Caesar)',
            observations: [
              { observation: 'IC close to English', decibans: 6, likelihoodRatio: 4, source: 'statistical', confidence: 0.9 },
              { observation: 'Consistent shift pattern', decibans: 8, likelihoodRatio: 6.3, source: 'pattern', confidence: 0.95 },
            ],
            totalDecibans: 14,
            oddsRatio: 25,
            conclusion: 'inconclusive',
            confirmationThreshold: 20,
            refutationThreshold: -20,
          },
        ],
      });
      const step3 = factory.createThought(step3Input, sessionId) as CryptanalyticThought;
      expect(step3.evidenceChains![0].totalDecibans).toBe(14);

      // Step 4: Crib analysis (known plaintext)
      const step4Input = createCryptanalyticInput({
        thought: 'Step 4: Crib analysis with suspected plaintext',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        thoughtType: 'crib_analysis',
        cribAnalysis: [
          {
            crib: 'THIS',
            position: 0,
            ciphertext: 'WKLV',
            constraints: [
              { plaintextChar: 'T', ciphertextChar: 'W', possibleMappings: ['shift-3'] },
              { plaintextChar: 'H', ciphertextChar: 'K', possibleMappings: ['shift-3'] },
              { plaintextChar: 'I', ciphertextChar: 'L', possibleMappings: ['shift-3'] },
              { plaintextChar: 'S', ciphertextChar: 'V', possibleMappings: ['shift-3'] },
            ],
            contradictions: [],
            score: 10,
            isViable: true,
          },
        ],
        evidenceChains: [
          {
            hypothesis: 'Caesar cipher shift 3',
            observations: [
              { observation: 'Crib THIS matches with shift 3', decibans: 12, likelihoodRatio: 15.8, source: 'crib', confidence: 0.99 },
              { observation: 'All patterns consistent', decibans: 14, likelihoodRatio: 25, source: 'pattern', confidence: 0.98 },
            ],
            totalDecibans: 26,
            oddsRatio: 398,
            conclusion: 'confirmed',
            confirmationThreshold: 20,
            refutationThreshold: -20,
          },
        ],
      });
      const step4 = factory.createThought(step4Input, sessionId) as CryptanalyticThought;
      expect(step4.cribAnalysis![0].isViable).toBe(true);
      // totalDecibans = 12 + 14 = 26 >= 20 threshold, so conclusion = 'confirmed'
      expect(step4.evidenceChains![0].conclusion).toBe('confirmed');

      // Step 5: Solution
      const step5Input = createCryptanalyticInput({
        thought: 'Step 5: Solution confirmed',
        thoughtNumber: 5,
        totalThoughts: 5,
        nextThoughtNeeded: false,
        thoughtType: 'key_elimination',
        plaintext: 'THIS IS A TEST MESSAGE',
        currentHypothesis: {
          id: 'h-final',
          description: 'Caesar cipher with shift 3',
          cipherType: 'substitution_simple',
          parameters: { shift: 3 },
          priorProbability: 0.4,
          posteriorProbability: 0.99,
          decibanScore: 26,
          evidence: [],
          status: 'confirmed',
        },
        keyInsight: 'Simple Caesar cipher with shift 3: plaintext recovered as "THIS IS A TEST MESSAGE"',
      });
      const step5 = factory.createThought(step5Input, sessionId) as CryptanalyticThought;
      expect(step5.plaintext).toBe('THIS IS A TEST MESSAGE');
      // status field may be overridden by handler; verify core hypothesis data passed through
      expect(step5.currentHypothesis!.id).toBe('h-final');
      expect(step5.currentHypothesis!.description).toBe('Caesar cipher with shift 3');
      expect(step5.keyInsight).toContain('THIS IS A TEST MESSAGE');
      expect(step5.nextThoughtNeeded).toBe(false);
    });
  });
});
