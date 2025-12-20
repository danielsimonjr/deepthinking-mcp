/**
 * AnalogicalHandler Unit Tests
 *
 * Tests for Analogical reasoning mode handler including:
 * - Domain mapping validation
 * - Structural alignment checking
 * - Analogy strength scoring
 * - Transfer inference suggestions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AnalogicalHandler } from '../../../../src/modes/handlers/AnalogicalHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('AnalogicalHandler', () => {
  let handler: AnalogicalHandler;

  beforeEach(() => {
    handler = new AnalogicalHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.ANALOGICAL);
    });

    it('should have descriptive mode name', () => {
      expect(handler.modeName).toBe('Analogical Reasoning');
    });

    it('should have meaningful description', () => {
      expect(handler.description).toContain('mapping');
      expect(handler.description).toContain('analogy');
    });
  });

  describe('createThought', () => {
    it('should create basic analogical thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Drawing analogy between atom and solar system',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.ANALOGICAL);
      expect(thought.content).toBe('Drawing analogy between atom and solar system');
      expect(thought.sessionId).toBe('session-123');
    });

    it('should process source domain', () => {
      const input: any = {
        thought: 'Mapping domains',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        sourceDomain: {
          name: 'Solar System',
          entities: [
            { id: 'sun', name: 'Sun', type: 'star' },
            { id: 'planet', name: 'Planet', type: 'body' },
          ],
          relations: [
            { id: 'orbit', type: 'orbits', from: 'planet', to: 'sun' },
          ],
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.sourceDomain).toBeDefined();
      expect(thought.sourceDomain.name).toBe('Solar System');
      expect(thought.sourceDomain.entities?.length).toBe(2);
    });

    it('should process target domain', () => {
      const input: any = {
        thought: 'Mapping domains',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        targetDomain: {
          name: 'Atom',
          entities: [
            { id: 'nucleus', name: 'Nucleus', type: 'core' },
            { id: 'electron', name: 'Electron', type: 'particle' },
          ],
          relations: [
            { id: 'orbit', type: 'orbits', from: 'electron', to: 'nucleus' },
          ],
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.targetDomain).toBeDefined();
      expect(thought.targetDomain.name).toBe('Atom');
      expect(thought.targetDomain.entities?.length).toBe(2);
    });

    it('should process mappings', () => {
      const input: any = {
        thought: 'Mapping entities',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        mapping: [
          {
            sourceEntityId: 'sun',
            targetEntityId: 'nucleus',
            justification: 'Both are central bodies',
            confidence: 0.9,
          },
          {
            sourceEntityId: 'planet',
            targetEntityId: 'electron',
            justification: 'Both orbit the central body',
            confidence: 0.7,
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.mapping.length).toBe(2);
      expect(thought.mapping[0].confidence).toBe(0.9);
    });

    it('should process insights', () => {
      const input: any = {
        thought: 'Deriving insights',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        insights: [
          {
            description: 'Electrons may have quantized orbits like planets',
            sourceEvidence: 'Stable planetary orbits',
            targetApplication: 'Atomic energy levels',
            novelty: 0.8,
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.insights?.length).toBe(1);
      expect(thought.insights?.[0].novelty).toBe(0.8);
    });

    it('should process inferences', () => {
      const input: any = {
        thought: 'Drawing inferences',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        inferences: [
          {
            sourcePattern: 'Gravitational attraction',
            targetPrediction: 'Electrostatic attraction',
            confidence: 0.75,
            needsVerification: true,
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.inferences?.length).toBe(1);
      expect(thought.inferences?.[0].needsVerification).toBe(true);
    });

    it('should calculate analogy strength', () => {
      const input: any = {
        thought: 'Complete analogy',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        sourceDomain: {
          name: 'Source',
          entities: [{ id: 'e1', name: 'E1' }, { id: 'e2', name: 'E2' }],
        },
        targetDomain: {
          name: 'Target',
          entities: [{ id: 't1', name: 'T1' }, { id: 't2', name: 'T2' }],
        },
        mapping: [
          { sourceEntityId: 'e1', targetEntityId: 't1', confidence: 0.8 },
          { sourceEntityId: 'e2', targetEntityId: 't2', confidence: 0.9 },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.analogyStrength).toBeGreaterThan(0);
      expect(thought.analogyStrength).toBeLessThanOrEqual(1);
    });

    it('should accept alternative input formats', () => {
      const input: any = {
        thought: 'Alternative format',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        sourceAnalogy: {
          domain: 'Source',
          elements: ['A', 'B', 'C'],
        },
        targetAnalogy: {
          domain: 'Target',
          elements: ['X', 'Y', 'Z'],
        },
        mappings: [
          { source: 'A', target: 'X', confidence: 0.7 },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.sourceDomain.name).toBe('Source');
      expect(thought.targetDomain.name).toBe('Target');
      expect(thought.mapping.length).toBe(1);
    });

    it('should identify limitations', () => {
      const input: any = {
        thought: 'Weak analogy',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        mapping: [
          { sourceEntityId: 'a', targetEntityId: 'b', confidence: 0.3 },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.limitations).toBeDefined();
      expect(thought.limitations.length).toBeGreaterThan(0);
    });

    it('should track revision information', () => {
      const input: ThinkingToolInput = {
        thought: 'Revised analogy',
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        isRevision: true,
        revisesThought: 'thought-1',
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('thought-1');
    });
  });

  describe('validate', () => {
    it('should validate basic analogical input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid analogical thought',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should warn about missing source domain', () => {
      const input: any = {
        thought: 'Analogy without source',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        targetDomain: { name: 'Target' },
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'sourceDomain')).toBe(true);
    });

    it('should warn about missing target domain', () => {
      const input: any = {
        thought: 'Analogy without target',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        sourceDomain: { name: 'Source' },
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'targetDomain')).toBe(true);
    });

    it('should warn about missing mappings', () => {
      const input: any = {
        thought: 'Analogy without mappings',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        sourceDomain: { name: 'Source' },
        targetDomain: { name: 'Target' },
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'mapping')).toBe(true);
    });

    it('should warn about low confidence mappings', () => {
      const input: any = {
        thought: 'Weak mappings',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        mapping: [
          { sourceEntityId: 'a', targetEntityId: 'b', confidence: 0.2 },
          { sourceEntityId: 'c', targetEntityId: 'd', confidence: 0.3 },
        ],
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('low confidence'))).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide base enhancements', () => {
      const input: ThinkingToolInput = {
        thought: 'Analogical reasoning',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.ABDUCTIVE);
      expect(enhancements.mentalModels).toContain('Structure Mapping Theory (Gentner)');
    });

    it('should calculate metrics', () => {
      const input: any = {
        thought: 'Analogy with mappings',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        sourceDomain: {
          name: 'Source',
          entities: [{ id: 'e1', name: 'E1' }],
        },
        targetDomain: {
          name: 'Target',
          entities: [{ id: 't1', name: 'T1' }],
        },
        mapping: [
          { sourceEntityId: 'e1', targetEntityId: 't1', confidence: 0.8 },
        ],
        insights: [{ description: 'Insight 1' }],
        inferences: [{ sourcePattern: 'P1', targetPrediction: 'T1' }],
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.mappingCount).toBe(1);
      expect(enhancements.metrics?.avgConfidence).toBe(0.8);
      expect(enhancements.metrics?.sourceEntityCount).toBe(1);
      expect(enhancements.metrics?.insightCount).toBe(1);
      expect(enhancements.metrics?.inferenceCount).toBe(1);
    });

    it('should suggest unmapped entities', () => {
      const input: any = {
        thought: 'Partial mapping',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        sourceDomain: {
          name: 'Source',
          entities: [
            { id: 'e1', name: 'Entity1' },
            { id: 'e2', name: 'Entity2' },
          ],
        },
        targetDomain: {
          name: 'Target',
          entities: [
            { id: 't1', name: 'Target1' },
            { id: 't2', name: 'Target2' },
          ],
        },
        mapping: [
          { sourceEntityId: 'e1', targetEntityId: 't1', confidence: 0.9 },
        ],
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions?.some((s) => s.includes('mapping source entities'))).toBe(
        true
      );
    });

    it('should warn about negative transfer for weak analogies', () => {
      const input: any = {
        thought: 'Weak analogy',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        analogyStrength: 0.3,
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings).toContainEqual(
        expect.stringContaining('negative transfer')
      );
    });

    it('should include guiding questions', () => {
      const input: ThinkingToolInput = {
        thought: 'Analogical reasoning',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions?.length).toBeGreaterThan(0);
      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('structural relations')
      );
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete analogy reasoning session', () => {
      // Step 1: Identify source domain
      const step1: any = {
        thought: 'The solar system serves as our source domain',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        sourceDomain: {
          name: 'Solar System',
          entities: [
            { id: 'sun', name: 'Sun', type: 'star' },
            { id: 'planet', name: 'Planet', type: 'celestial_body' },
          ],
          relations: [
            { id: 'gravitational', type: 'attracts', from: 'sun', to: 'planet' },
            { id: 'orbital', type: 'orbits', from: 'planet', to: 'sun' },
          ],
        },
      };

      const thought1 = handler.createThought(step1, 'analogy-session');
      expect(thought1.sourceDomain.entities?.length).toBe(2);

      // Step 2: Map to target domain
      const step2: any = {
        thought: 'Mapping solar system structure to atomic structure',
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'analogical',
        sourceDomain: step1.sourceDomain,
        targetDomain: {
          name: 'Atom',
          entities: [
            { id: 'nucleus', name: 'Nucleus', type: 'core' },
            { id: 'electron', name: 'Electron', type: 'particle' },
          ],
          relations: [
            { id: 'electrostatic', type: 'attracts', from: 'nucleus', to: 'electron' },
            { id: 'orbital', type: 'orbits', from: 'electron', to: 'nucleus' },
          ],
        },
        mapping: [
          {
            sourceEntityId: 'sun',
            targetEntityId: 'nucleus',
            justification: 'Central massive body',
            confidence: 0.9,
          },
          {
            sourceEntityId: 'planet',
            targetEntityId: 'electron',
            justification: 'Orbiting body',
            confidence: 0.8,
          },
        ],
      };

      const thought2 = handler.createThought(step2, 'analogy-session');
      expect(thought2.mapping.length).toBe(2);
      expect(thought2.analogyStrength).toBeGreaterThan(0.5);

      // Step 3: Draw inferences
      const step3: any = {
        thought: 'Drawing inferences from the analogy',
        thoughtNumber: 3,
        totalThoughts: 3,
        nextThoughtNeeded: false,
        mode: 'analogical',
        sourceDomain: step2.sourceDomain,
        targetDomain: step2.targetDomain,
        mapping: step2.mapping,
        insights: [
          {
            description: 'Electrons follow orbital paths around nucleus',
            sourceEvidence: 'Planetary orbits are stable and predictable',
            targetApplication: 'Atomic structure predictions',
            novelty: 0.7,
          },
        ],
        inferences: [
          {
            sourcePattern: 'Inverse square law of gravity',
            targetPrediction: 'Electrostatic force follows inverse square law',
            confidence: 0.85,
            needsVerification: true,
          },
        ],
        limitations: [
          'Quantum effects not captured',
          'Wave-particle duality ignored',
        ],
      };

      const thought3 = handler.createThought(step3, 'analogy-session');
      expect(thought3.insights?.length).toBe(1);
      expect(thought3.inferences?.length).toBe(1);
      expect(thought3.limitations.length).toBe(2);

      // Validate all steps
      const validations = [step1, step2, step3].map((s) => handler.validate(s));
      for (const v of validations) {
        expect(v.valid).toBe(true);
      }

      // Check final enhancements
      const enhancements = handler.getEnhancements(thought3);
      expect(enhancements.metrics?.analogyStrength).toBeGreaterThan(0);
    });
  });
});
