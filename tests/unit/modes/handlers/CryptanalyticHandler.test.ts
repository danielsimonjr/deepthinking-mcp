/**
 * CryptanalyticHandler Unit Tests
 *
 * Tests for Cryptanalytic reasoning mode handler including:
 * - Turing's deciban evidence system
 * - Bayesian hypothesis evaluation
 * - Frequency analysis support
 * - Key space elimination tracking
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CryptanalyticHandler } from '../../../../src/modes/handlers/CryptanalyticHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('CryptanalyticHandler', () => {
  let handler: CryptanalyticHandler;

  beforeEach(() => {
    handler = new CryptanalyticHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.CRYPTANALYTIC);
    });

    it('should have descriptive mode name', () => {
      expect(handler.modeName).toBe('Cryptanalytic Reasoning');
    });

    it('should have meaningful description', () => {
      expect(handler.description).toContain('deciban');
      expect(handler.description).toContain('Bayesian');
    });
  });

  describe('createThought', () => {
    it('should create basic cryptanalytic thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Analyzing cipher text',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.CRYPTANALYTIC);
      expect(thought.content).toBe('Analyzing cipher text');
      expect(thought.sessionId).toBe('session-123');
      expect(thought.thoughtType).toBe('hypothesis_formation'); // Default
    });

    it('should include hypotheses with deciban scores', () => {
      const input: any = {
        thought: 'Forming hypotheses',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'hypothesis_formation',
        hypotheses: [
          {
            id: 'h1',
            description: 'Simple substitution cipher',
            cipherType: 'substitution_simple',
            priorProbability: 0.3,
            evidence: [
              { observation: 'High letter frequency variation', decibans: 5 },
              { observation: 'No repeated digraphs', decibans: 3 },
            ],
          },
          {
            id: 'h2',
            description: 'Vigenère cipher',
            cipherType: 'substitution_polyalphabetic',
            priorProbability: 0.5,
            evidence: [
              { observation: 'Flat frequency distribution', decibans: -3 },
            ],
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.hypotheses?.length).toBe(2);
      expect(thought.hypotheses?.[0].decibanScore).toBe(8); // 5 + 3
      expect(thought.currentHypothesis).toBeDefined();
    });

    it('should include evidence chains', () => {
      const input: any = {
        thought: 'Accumulating evidence',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'evidence_accumulation',
        evidenceChains: [
          {
            hypothesis: 'substitution',
            observations: [
              { observation: 'E frequency matches', decibans: 4 },
              { observation: 'T frequency matches', decibans: 3 },
              { observation: 'A frequency matches', decibans: 2 },
            ],
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.evidenceChains?.length).toBe(1);
      expect(thought.evidenceChains?.[0].totalDecibans).toBe(9);
      expect(thought.evidenceChains?.[0].conclusion).toBe('inconclusive');
    });

    it('should handle all valid thought types', () => {
      const thoughtTypes = [
        'hypothesis_formation',
        'evidence_accumulation',
        'frequency_analysis',
        'key_elimination',
        'banburismus',
        'crib_analysis',
        'isomorphism_detection',
      ];

      for (const thoughtType of thoughtTypes) {
        const input: any = {
          thought: `Testing ${thoughtType}`,
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          mode: 'cryptanalytic',
          thoughtType,
        };

        const thought = handler.createThought(input, 'session-123');
        expect(thought.thoughtType).toBe(thoughtType);
      }
    });

    it('should default to hypothesis_formation for unknown type', () => {
      const input: any = {
        thought: 'Unknown type',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: 'cryptanalytic',
        thoughtType: 'invalid_type',
      };

      const thought = handler.createThought(input, 'session-123');
      expect(thought.thoughtType).toBe('hypothesis_formation');
    });

    it('should include frequency analysis', () => {
      const input: any = {
        thought: 'Frequency analysis',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'frequency_analysis',
        frequencyAnalysis: {
          letterFrequencies: { E: 12.7, T: 9.1, A: 8.2 },
          indexOfCoincidence: 0.065,
          chiSquared: 45.2,
          expectedLanguage: 'English',
          deviation: 0.12,
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.frequencyAnalysis?.indexOfCoincidence).toBe(0.065);
    });

    it('should include key space analysis', () => {
      const input: any = {
        thought: 'Key elimination',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'key_elimination',
        keySpaceAnalysis: {
          originalSize: 403291461126605635584000000n,
          currentSize: 720n,
          reductionFactor: 5.6e23,
          eliminationMethods: ['Frequency analysis', 'Crib dragging'],
          remainingCandidates: ['HELLO', 'WORLD', 'CIPHER'],
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.keySpaceAnalysis?.reductionFactor).toBeGreaterThan(0);
    });

    it('should include banburismus analysis', () => {
      const input: any = {
        thought: 'Banburismus test',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'banburismus',
        banburismusAnalysis: [
          {
            offset: 0,
            coincidences: 5,
            expected: 2.5,
            decibanScore: 7.5,
            isSignificant: true,
          },
          {
            offset: 1,
            coincidences: 2,
            expected: 2.5,
            decibanScore: -1.0,
            isSignificant: false,
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.banburismusAnalysis?.length).toBe(2);
    });

    it('should include crib analysis', () => {
      const input: any = {
        thought: 'Crib analysis',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'crib_analysis',
        cribAnalysis: [
          {
            crib: 'HEIL',
            position: 5,
            isViable: true,
            contradictions: [],
            constraints: ['A maps to X', 'B maps to Y'],
          },
          {
            crib: 'HEIL',
            position: 10,
            isViable: false,
            contradictions: ['Self-mapping at position 12'],
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.cribAnalysis?.length).toBe(2);
    });

    it('should include patterns', () => {
      const input: any = {
        thought: 'Pattern detection',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'isomorphism_detection',
        patterns: [
          {
            pattern: 'ABCABC',
            positions: [0, 100, 200],
            significance: 0.95,
            interpretation: 'Likely repeated word',
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.patterns?.length).toBe(1);
    });

    it('should track revision information', () => {
      const input: ThinkingToolInput = {
        thought: 'Revised hypothesis',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        isRevision: true,
        revisesThought: 'thought-1',
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('thought-1');
    });
  });

  describe('validate', () => {
    it('should validate basic cryptanalytic input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid cryptanalytic thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should reject empty thought', () => {
      const input: ThinkingToolInput = {
        thought: '',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('EMPTY_THOUGHT');
    });

    it('should reject invalid thought number', () => {
      const input: ThinkingToolInput = {
        thought: 'Cryptanalysis',
        thoughtNumber: 10,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_THOUGHT_NUMBER');
    });

    it('should reject uncertainty out of range', () => {
      const input: ThinkingToolInput = {
        thought: 'Cryptanalysis',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        uncertainty: 1.5,
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('UNCERTAINTY_OUT_OF_RANGE');
    });

    it('should warn about unknown thought type', () => {
      const input: any = {
        thought: 'Cryptanalysis',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'unknown_type',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'thoughtType')).toBe(true);
    });

    it('should warn about unknown cipher type', () => {
      const input: any = {
        thought: 'Cryptanalysis',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        cipherType: 'unknown_cipher',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'cipherType')).toBe(true);
    });

    it('should warn about hypothesis without description', () => {
      const input: any = {
        thought: 'Hypothesis',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        hypotheses: [
          { id: 'h1', priorProbability: 0.5 },
        ],
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field.includes('description'))).toBe(true);
    });

    it('should warn about invalid prior probability', () => {
      const input: any = {
        thought: 'Hypothesis',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        hypotheses: [
          { id: 'h1', description: 'Test', priorProbability: 1.5 },
        ],
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field.includes('priorProbability'))).toBe(true);
    });

    it('should warn about evidence chain without hypothesis', () => {
      const input: any = {
        thought: 'Evidence',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        evidenceChains: [
          { observations: [{ observation: 'Test', decibans: 5 }] },
        ],
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field.includes('hypothesis'))).toBe(true);
    });

    it('should warn about evidence chain without observations', () => {
      const input: any = {
        thought: 'Evidence',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        evidenceChains: [
          { hypothesis: 'h1', observations: [] },
        ],
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field.includes('observations'))).toBe(true);
    });

    it('should warn about missing ciphertext for analysis', () => {
      const input: any = {
        thought: 'Frequency analysis',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'frequency_analysis',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'ciphertext')).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide base enhancements', () => {
      const input: ThinkingToolInput = {
        thought: 'Cryptanalysis',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.BAYESIAN);
      expect(enhancements.mentalModels).toContain("Turing's Deciban System");
      expect(enhancements.mentalModels).toContain('Frequency Analysis');
    });

    it('should provide hypothesis formation guidance', () => {
      const input: any = {
        thought: 'Forming hypotheses',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'hypothesis_formation',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('cipher system')
      );
    });

    it('should provide evidence accumulation guidance', () => {
      const input: any = {
        thought: 'Accumulating evidence',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'evidence_accumulation',
        evidenceChains: [
          {
            hypothesis: 'substitution',
            observations: [
              { observation: 'E matches', decibans: 5 },
            ],
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('likelihood ratio')
      );
    });

    it('should provide frequency analysis guidance', () => {
      const input: any = {
        thought: 'Frequency analysis',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'frequency_analysis',
        frequencyAnalysis: {
          indexOfCoincidence: 0.065,
          chiSquared: 45.2,
        },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('frequency distribution')
      );
      expect(enhancements.metrics?.indexOfCoincidence).toBe(0.065);
    });

    it('should provide key elimination guidance', () => {
      const input: any = {
        thought: 'Key elimination',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'key_elimination',
        keySpaceAnalysis: {
          reductionFactor: 1e10,
        },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('key space')
      );
      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('reduced')
      );
    });

    it('should provide banburismus guidance', () => {
      const input: any = {
        thought: 'Banburismus',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'banburismus',
        banburismusAnalysis: [
          { offset: 5, decibanScore: 8, isSignificant: true },
        ],
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('coincidences')
      );
      expect(enhancements.metrics?.significantOffsets).toBe(1);
    });

    it('should provide crib analysis guidance', () => {
      const input: any = {
        thought: 'Crib analysis',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'crib_analysis',
        cribAnalysis: [
          { crib: 'HEIL', position: 5, isViable: true },
          { crib: 'HEIL', position: 10, isViable: false },
        ],
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('crib position')
      );
      expect(enhancements.metrics?.viablePositions).toBe(1);
    });

    it('should provide isomorphism detection guidance', () => {
      const input: any = {
        thought: 'Pattern detection',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'isomorphism_detection',
        patterns: [{}, {}],
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('patterns')
      );
      expect(enhancements.metrics?.patternCount).toBe(2);
    });

    it('should indicate confirmed hypothesis', () => {
      const input: any = {
        thought: 'Confirmed hypothesis',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        currentHypothesis: {
          description: 'Simple substitution',
          priorProbability: 0.5,
          evidence: [
            { observation: 'Strong frequency match', decibans: 15 },
            { observation: 'Pattern confirmation', decibans: 10 },
          ], // Sum = 25, above 20 threshold
        },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('CONFIRMED')
      );
    });

    it('should indicate refuted hypothesis', () => {
      const input: any = {
        thought: 'Refuted hypothesis',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        currentHypothesis: {
          description: 'Rotor machine',
          priorProbability: 0.5,
          evidence: [
            { observation: 'Frequency mismatch', decibans: -15 },
            { observation: 'Pattern contradiction', decibans: -10 },
          ], // Sum = -25, below -20 threshold
        },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings).toContainEqual(
        expect.stringContaining('REFUTED')
      );
    });

    it('should warn about high uncertainty', () => {
      const input: ThinkingToolInput = {
        thought: 'Uncertain analysis',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        uncertainty: 0.85,
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings).toContainEqual(
        expect.stringContaining('High uncertainty')
      );
    });
  });

  describe('supportsThoughtType', () => {
    it('should support all valid cryptanalytic thought types', () => {
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
        expect(handler.supportsThoughtType(type)).toBe(true);
      }
    });

    it('should not support invalid thought types', () => {
      expect(handler.supportsThoughtType('invalid_type')).toBe(false);
      expect(handler.supportsThoughtType('mathematics')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete cryptanalysis session', () => {
      // Step 1: Form hypotheses
      const step1: any = {
        thought: 'Initial cipher analysis - forming hypotheses',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'hypothesis_formation',
        ciphertext: 'XYZABC...',
        hypotheses: [
          {
            id: 'h1',
            description: 'Caesar cipher',
            cipherType: 'substitution_simple',
            priorProbability: 0.3,
            evidence: [],
          },
          {
            id: 'h2',
            description: 'Monoalphabetic substitution',
            cipherType: 'substitution_simple',
            priorProbability: 0.5,
            evidence: [],
          },
        ],
      };

      const thought1 = handler.createThought(step1, 'crypto-session');
      expect(thought1.hypotheses?.length).toBe(2);

      // Step 2: Frequency analysis
      const step2: any = {
        thought: 'Performing frequency analysis',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'frequency_analysis',
        ciphertext: 'XYZABC...',
        frequencyAnalysis: {
          letterFrequencies: { X: 12.5, Y: 9.0, Z: 8.0 },
          indexOfCoincidence: 0.065,
          chiSquared: 42.5,
          expectedLanguage: 'English',
        },
        hypotheses: [
          {
            id: 'h1',
            description: 'Caesar cipher',
            priorProbability: 0.3,
            evidence: [
              { observation: 'High IoC suggests monoalphabetic', decibans: 5 },
            ],
          },
          {
            id: 'h2',
            description: 'Monoalphabetic substitution',
            priorProbability: 0.5,
            evidence: [
              { observation: 'Frequency distribution matches English', decibans: 8 },
            ],
          },
        ],
      };

      const thought2 = handler.createThought(step2, 'crypto-session');
      expect(thought2.frequencyAnalysis?.indexOfCoincidence).toBe(0.065);

      // Step 3: Evidence accumulation
      const step3: any = {
        thought: 'Accumulating evidence for monoalphabetic hypothesis',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'cryptanalytic',
        thoughtType: 'evidence_accumulation',
        ciphertext: 'XYZABC...',
        currentHypothesis: {
          id: 'h2',
          description: 'Monoalphabetic substitution',
          priorProbability: 0.5,
          evidence: [
            { observation: 'Frequency distribution matches English', decibans: 8 },
            { observation: 'E->X mapping confirmed by THE pattern', decibans: 7 },
            { observation: 'Word boundaries match English', decibans: 6 },
          ],
        },
        evidenceChains: [
          {
            hypothesis: 'h2',
            observations: [
              { observation: 'E->X mapping', decibans: 7 },
              { observation: 'T->Y mapping', decibans: 5 },
              { observation: 'A->Z mapping', decibans: 4 },
            ],
          },
        ],
      };

      const thought3 = handler.createThought(step3, 'crypto-session');
      expect(thought3.currentHypothesis?.decibanScore).toBe(21); // 8+7+6
      expect(thought3.evidenceChains?.[0].totalDecibans).toBe(16);

      // Step 4: Conclusion
      const step4: any = {
        thought: 'Cipher broken - monoalphabetic substitution confirmed',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        mode: 'cryptanalytic',
        thoughtType: 'evidence_accumulation',
        ciphertext: 'XYZABC...',
        plaintext: 'HELLO...',
        currentHypothesis: {
          id: 'h2',
          description: 'Monoalphabetic substitution',
          priorProbability: 0.5,
          evidence: [
            { observation: 'All mappings confirmed', decibans: 25 },
          ],
        },
        keyInsight: 'Key is DEFGHIJKLMNOPQRSTUVWXYZABC',
        cipherType: 'substitution_simple',
        uncertainty: 0.05,
      };

      const thought4 = handler.createThought(step4, 'crypto-session');
      expect(thought4.currentHypothesis?.decibanScore).toBe(25);
      expect(thought4.plaintext).toBe('HELLO...');
      expect(thought4.nextThoughtNeeded).toBe(false);

      // Validate all steps
      const validations = [step1, step2, step3, step4].map((s) => handler.validate(s));
      for (const v of validations) {
        expect(v.valid).toBe(true);
      }

      // Check final enhancements
      const enhancements = handler.getEnhancements(thought4);
      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('CONFIRMED')
      );
    });
  });
});
