/**
 * Unit tests for Analogical reasoning mode
 */

import { describe, it, expect } from 'vitest';
import {
  ThinkingMode,
  isAnalogicalThought,
  type AnalogicalThought,
  type Domain,
  type Mapping,
} from '../../src/types/core.js';
import { ThoughtValidator } from '../../src/validation/validator.js';

describe('Analogical Reasoning', () => {
  const validator = new ThoughtValidator();

  describe('isAnalogicalThought type guard', () => {
    it('should identify analogical thoughts correctly', () => {
      const thought: AnalogicalThought = {
        id: 'ana-1',
        sessionId: 'session-1',
        mode: ThinkingMode.ANALOGICAL,
        thoughtNumber: 1,
        totalThoughts: 3,
        content: 'Drawing analogy between domains',
        timestamp: new Date(),
        nextThoughtNeeded: true,
        sourceDomain: {
          id: 'source-1',
          name: 'Biology',
          description: 'Biological systems',
          entities: [
            { id: 'e1', name: 'Cell', type: 'organism', description: 'Basic unit' },
          ],
          relations: [],
          properties: [],
        },
        targetDomain: {
          id: 'target-1',
          name: 'Software',
          description: 'Software systems',
          entities: [
            { id: 'e2', name: 'Component', type: 'module', description: 'Basic unit' },
          ],
          relations: [],
          properties: [],
        },
        mapping: [],
        insights: [],
        inferences: [],
        limitations: ['Not all biological properties apply to software'],
        analogyStrength: 0.7,
      };

      expect(isAnalogicalThought(thought)).toBe(true);
    });
  });

  describe('Domain validation', () => {
    it('should require source domain', async () => {
      const thought: AnalogicalThought = {
        id: 'ana-2',
        sessionId: 'session-1',
        mode: ThinkingMode.ANALOGICAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        sourceDomain: undefined as any, // Missing
        targetDomain: {
          id: 'target',
          name: 'Target',
          description: 'Test',
          entities: [],
          relations: [],
          properties: [],
        },
        mapping: [],
        insights: [],
        inferences: [],
        limitations: [],
        analogyStrength: 0.5,
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('requires a source domain'))).toBe(true);
    });

    it('should require target domain', async () => {
      const thought: AnalogicalThought = {
        id: 'ana-3',
        sessionId: 'session-1',
        mode: ThinkingMode.ANALOGICAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        sourceDomain: {
          id: 'source',
          name: 'Source',
          description: 'Test',
          entities: [],
          relations: [],
          properties: [],
        },
        targetDomain: undefined as any, // Missing
        mapping: [],
        insights: [],
        inferences: [],
        limitations: [],
        analogyStrength: 0.5,
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('requires a target domain'))).toBe(true);
    });
  });

  describe('Analogy strength validation', () => {
    it('should validate analogy strength range', async () => {
      const thought: AnalogicalThought = {
        id: 'ana-4',
        sessionId: 'session-1',
        mode: ThinkingMode.ANALOGICAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        sourceDomain: {
          id: 'source',
          name: 'Source',
          description: 'Test',
          entities: [],
          relations: [],
          properties: [],
        },
        targetDomain: {
          id: 'target',
          name: 'Target',
          description: 'Test',
          entities: [],
          relations: [],
          properties: [],
        },
        mapping: [],
        insights: [],
        inferences: [],
        limitations: [],
        analogyStrength: 1.5, // Invalid
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('Analogy strength must be between 0 and 1'))).toBe(true);
    });
  });

  describe('Mapping validation', () => {
    it('should validate mappings reference existing source entities', async () => {
      const thought: AnalogicalThought = {
        id: 'ana-5',
        sessionId: 'session-1',
        mode: ThinkingMode.ANALOGICAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        sourceDomain: {
          id: 'source',
          name: 'Source',
          description: 'Test',
          entities: [
            { id: 'e1', name: 'Entity 1', type: 'test', description: 'Test' },
          ],
          relations: [],
          properties: [],
        },
        targetDomain: {
          id: 'target',
          name: 'Target',
          description: 'Test',
          entities: [
            { id: 'e2', name: 'Entity 2', type: 'test', description: 'Test' },
          ],
          relations: [],
          properties: [],
        },
        mapping: [
          {
            sourceEntityId: 'e999', // Non-existent
            targetEntityId: 'e2',
            justification: 'Test',
            confidence: 0.8,
          },
        ],
        insights: [],
        inferences: [],
        limitations: ['Test limitation'],
        analogyStrength: 0.7,
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('non-existent source entity'))).toBe(true);
    });

    it('should validate mappings reference existing target entities', async () => {
      const thought: AnalogicalThought = {
        id: 'ana-6',
        sessionId: 'session-1',
        mode: ThinkingMode.ANALOGICAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        sourceDomain: {
          id: 'source',
          name: 'Source',
          description: 'Test',
          entities: [
            { id: 'e1', name: 'Entity 1', type: 'test', description: 'Test' },
          ],
          relations: [],
          properties: [],
        },
        targetDomain: {
          id: 'target',
          name: 'Target',
          description: 'Test',
          entities: [
            { id: 'e2', name: 'Entity 2', type: 'test', description: 'Test' },
          ],
          relations: [],
          properties: [],
        },
        mapping: [
          {
            sourceEntityId: 'e1',
            targetEntityId: 'e999', // Non-existent
            justification: 'Test',
            confidence: 0.8,
          },
        ],
        insights: [],
        inferences: [],
        limitations: ['Test limitation'],
        analogyStrength: 0.7,
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('non-existent target entity'))).toBe(true);
    });

    it('should validate mapping confidence range', async () => {
      const thought: AnalogicalThought = {
        id: 'ana-7',
        sessionId: 'session-1',
        mode: ThinkingMode.ANALOGICAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        sourceDomain: {
          id: 'source',
          name: 'Source',
          description: 'Test',
          entities: [
            { id: 'e1', name: 'Entity 1', type: 'test', description: 'Test' },
          ],
          relations: [],
          properties: [],
        },
        targetDomain: {
          id: 'target',
          name: 'Target',
          description: 'Test',
          entities: [
            { id: 'e2', name: 'Entity 2', type: 'test', description: 'Test' },
          ],
          relations: [],
          properties: [],
        },
        mapping: [
          {
            sourceEntityId: 'e1',
            targetEntityId: 'e2',
            justification: 'Test',
            confidence: 1.5, // Invalid
          },
        ],
        insights: [],
        inferences: [],
        limitations: ['Test limitation'],
        analogyStrength: 0.7,
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.description.includes('Mapping confidence'))).toBe(true);
    });
  });

  describe('Limitations and completeness', () => {
    it('should warn if no limitations are identified', async () => {
      const thought: AnalogicalThought = {
        id: 'ana-8',
        sessionId: 'session-1',
        mode: ThinkingMode.ANALOGICAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Complete analogy',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        sourceDomain: {
          id: 'source',
          name: 'Physics',
          description: 'Physical systems',
          entities: [
            { id: 'e1', name: 'Force', type: 'concept', description: 'Pushing power' },
            { id: 'e2', name: 'Mass', type: 'property', description: 'Amount of matter' },
          ],
          relations: [
            { id: 'r1', type: 'affects', from: 'e1', to: 'e2', description: 'Force affects mass' },
          ],
          properties: [],
        },
        targetDomain: {
          id: 'target',
          name: 'Business',
          description: 'Business systems',
          entities: [
            { id: 'e3', name: 'Marketing', type: 'concept', description: 'Pushing sales' },
            { id: 'e4', name: 'Revenue', type: 'property', description: 'Amount of income' },
          ],
          relations: [
            { id: 'r2', type: 'affects', from: 'e3', to: 'e4', description: 'Marketing affects revenue' },
          ],
          properties: [],
        },
        mapping: [
          {
            sourceEntityId: 'e1',
            targetEntityId: 'e3',
            justification: 'Both push/drive systems',
            confidence: 0.8,
          },
          {
            sourceEntityId: 'e2',
            targetEntityId: 'e4',
            justification: 'Both measure magnitude',
            confidence: 0.7,
          },
        ],
        insights: [
          {
            description: 'Marketing force drives revenue like physical force drives mass',
            sourceEvidence: 'F = ma in physics',
            targetApplication: 'More marketing effort yields more revenue',
          },
        ],
        inferences: [
          {
            sourcePattern: 'Greater force yields greater acceleration',
            targetPrediction: 'Greater marketing yields greater revenue growth',
            confidence: 0.75,
            needsVerification: true,
          },
        ],
        limitations: [], // Empty - should warn
        analogyStrength: 0.8,
      };

      const result = await validator.validate(thought);
      expect(result.issues.some(i =>
        i.description.includes('acknowledge their limitations')
      )).toBe(true);
    });

    it('should accept valid complete analogical analysis', async () => {
      const thought: AnalogicalThought = {
        id: 'ana-9',
        sessionId: 'session-1',
        mode: ThinkingMode.ANALOGICAL,
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Complete analogical analysis',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        sourceDomain: {
          id: 'source',
          name: 'Immune System',
          description: 'Biological defense mechanism',
          entities: [
            { id: 'e1', name: 'Antibody', type: 'defender', description: 'Targets invaders' },
            { id: 'e2', name: 'Pathogen', type: 'threat', description: 'Foreign invader' },
          ],
          relations: [
            { id: 'r1', type: 'neutralizes', from: 'e1', to: 'e2', description: 'Antibody neutralizes pathogen' },
          ],
          properties: [],
        },
        targetDomain: {
          id: 'target',
          name: 'Cybersecurity',
          description: 'Digital defense system',
          entities: [
            { id: 'e3', name: 'Firewall', type: 'defender', description: 'Blocks threats' },
            { id: 'e4', name: 'Malware', type: 'threat', description: 'Malicious code' },
          ],
          relations: [
            { id: 'r2', type: 'blocks', from: 'e3', to: 'e4', description: 'Firewall blocks malware' },
          ],
          properties: [],
        },
        mapping: [
          {
            sourceEntityId: 'e1',
            targetEntityId: 'e3',
            justification: 'Both identify and neutralize threats',
            confidence: 0.85,
          },
          {
            sourceEntityId: 'e2',
            targetEntityId: 'e4',
            justification: 'Both are foreign threats to the system',
            confidence: 0.9,
          },
        ],
        insights: [
          {
            description: 'Layered defense strategy applies to both domains',
            sourceEvidence: 'Immune system has multiple layers (innate, adaptive)',
            targetApplication: 'Cybersecurity should have multiple defense layers',
          },
        ],
        inferences: [
          {
            sourcePattern: 'Immune system learns from past infections',
            targetPrediction: 'Firewalls should learn from past attacks',
            confidence: 0.8,
            needsVerification: false,
          },
        ],
        limitations: [
          'Biological systems are self-healing, digital systems are not',
          'Pathogens evolve biologically, malware is intentionally designed',
          'Immune response is distributed, firewalls are often centralized',
        ],
        analogyStrength: 0.75,
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });
  });
});
