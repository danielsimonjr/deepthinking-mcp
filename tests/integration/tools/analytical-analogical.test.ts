/**
 * Analytical Mode Integration Tests - Analogical Reasoning
 *
 * Tests T-ANL-001 through T-ANL-012: Comprehensive integration tests
 * for the deepthinking_analytical tool with analogical mode.
 *
 * Phase 11 Sprint 6: Analytical & Scientific Modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type AnalogicalThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Analytical Mode Integration - Analogical Reasoning', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * Helper to create basic analogical input
   */
  function createAnalogicalInput(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Analogical reasoning step',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'analogical',
      ...overrides,
    } as ThinkingToolInput;
  }

  /**
   * T-ANL-001: Basic analogical thought creation
   */
  describe('T-ANL-001: Basic Analogical Thought', () => {
    it('should create a basic analogical thought with minimal params', () => {
      const input = createAnalogicalInput({
        thought: 'Drawing analogy between systems',
      });

      const thought = factory.createThought(input, 'session-anl-001');

      expect(thought.mode).toBe(ThinkingMode.ANALOGICAL);
      expect(thought.content).toBe('Drawing analogy between systems');
      expect(thought.sessionId).toBe('session-anl-001');
    });

    it('should assign unique IDs to analogical thoughts', () => {
      const input1 = createAnalogicalInput({ thought: 'First analogy' });
      const input2 = createAnalogicalInput({ thought: 'Second analogy' });

      const thought1 = factory.createThought(input1, 'session-anl-001');
      const thought2 = factory.createThought(input2, 'session-anl-001');

      expect(thought1.id).not.toBe(thought2.id);
    });
  });

  /**
   * T-ANL-002: Analogical with sourceAnalogy.domain
   */
  describe('T-ANL-002: Source Analogy Domain', () => {
    it('should include source domain in thought', () => {
      const input = createAnalogicalInput({
        thought: 'Identifying source domain',
        sourceAnalogy: {
          domain: 'biology',
          elements: [],
          relations: [],
        },
      });

      const thought = factory.createThought(input, 'session-anl-002') as AnalogicalThought;

      expect(thought.sourceDomain).toBeDefined();
      expect(thought.sourceDomain.name).toBeDefined();
    });

    it('should handle complex source domain', () => {
      const input = createAnalogicalInput({
        thought: 'Complex source domain',
        sourceDomain: {
          id: 'bio-1',
          name: 'Cellular Biology',
          description: 'Study of cell structures and functions',
          entities: [
            { id: 'cell', name: 'Cell', type: 'structure', description: 'Basic unit of life' },
          ],
          relations: [],
          properties: [],
        },
      });

      const thought = factory.createThought(input, 'session-anl-002') as AnalogicalThought;

      expect(thought.sourceDomain.name).toBe('Cellular Biology');
    });
  });

  /**
   * T-ANL-003: Analogical with sourceAnalogy.elements
   */
  describe('T-ANL-003: Source Analogy Elements', () => {
    it('should include source domain elements', () => {
      const input = createAnalogicalInput({
        thought: 'Mapping source elements',
        sourceDomain: {
          id: 'comp-1',
          name: 'Computer Systems',
          description: 'Digital computing systems',
          entities: [
            { id: 'cpu', name: 'CPU', type: 'component', description: 'Central processing unit' },
            { id: 'memory', name: 'Memory', type: 'component', description: 'Storage unit' },
            { id: 'bus', name: 'System Bus', type: 'connector', description: 'Data pathway' },
          ],
          relations: [],
          properties: [],
        },
      });

      const thought = factory.createThought(input, 'session-anl-003') as AnalogicalThought;

      expect(thought.sourceDomain.entities).toHaveLength(3);
      expect(thought.sourceDomain.entities[0].name).toBe('CPU');
    });
  });

  /**
   * T-ANL-004: Analogical with sourceAnalogy.relations
   */
  describe('T-ANL-004: Source Analogy Relations', () => {
    it('should include source domain relations', () => {
      const input = createAnalogicalInput({
        thought: 'Identifying source relations',
        sourceDomain: {
          id: 'org-1',
          name: 'Organization',
          description: 'Corporate structure',
          entities: [
            { id: 'manager', name: 'Manager', type: 'role', description: 'Leadership role' },
            { id: 'employee', name: 'Employee', type: 'role', description: 'Staff member' },
          ],
          relations: [
            {
              id: 'rel-1',
              type: 'supervises',
              from: 'manager',
              to: 'employee',
              description: 'Management relationship',
            },
          ],
          properties: [],
        },
      });

      const thought = factory.createThought(input, 'session-anl-004') as AnalogicalThought;

      expect(thought.sourceDomain.relations).toHaveLength(1);
      expect(thought.sourceDomain.relations[0].type).toBe('supervises');
    });
  });

  /**
   * T-ANL-005: Analogical with targetAnalogy.domain
   */
  describe('T-ANL-005: Target Analogy Domain', () => {
    it('should include target domain in thought', () => {
      const input = createAnalogicalInput({
        thought: 'Identifying target domain',
        targetDomain: {
          id: 'software-1',
          name: 'Software Architecture',
          description: 'Structure of software systems',
          entities: [],
          relations: [],
          properties: [],
        },
      });

      const thought = factory.createThought(input, 'session-anl-005') as AnalogicalThought;

      expect(thought.targetDomain).toBeDefined();
      expect(thought.targetDomain.name).toBe('Software Architecture');
    });
  });

  /**
   * T-ANL-006: Analogical with targetAnalogy.elements
   */
  describe('T-ANL-006: Target Analogy Elements', () => {
    it('should include target domain elements', () => {
      const input = createAnalogicalInput({
        thought: 'Mapping target elements',
        targetDomain: {
          id: 'neuro-1',
          name: 'Neural Networks',
          description: 'Artificial neural systems',
          entities: [
            { id: 'neuron', name: 'Neuron', type: 'node', description: 'Processing unit' },
            { id: 'layer', name: 'Layer', type: 'structure', description: 'Group of neurons' },
            { id: 'synapse', name: 'Synapse', type: 'connection', description: 'Weighted connection' },
          ],
          relations: [],
          properties: [],
        },
      });

      const thought = factory.createThought(input, 'session-anl-006') as AnalogicalThought;

      expect(thought.targetDomain.entities).toHaveLength(3);
    });
  });

  /**
   * T-ANL-007: Analogical with targetAnalogy.relations
   */
  describe('T-ANL-007: Target Analogy Relations', () => {
    it('should include target domain relations', () => {
      const input = createAnalogicalInput({
        thought: 'Mapping target relations',
        targetDomain: {
          id: 'eco-1',
          name: 'Ecosystem',
          description: 'Natural ecosystem',
          entities: [
            { id: 'producer', name: 'Producer', type: 'organism', description: 'Autotroph' },
            { id: 'consumer', name: 'Consumer', type: 'organism', description: 'Heterotroph' },
          ],
          relations: [
            {
              id: 'rel-1',
              type: 'feeds_on',
              from: 'consumer',
              to: 'producer',
              description: 'Trophic relationship',
            },
          ],
          properties: [],
        },
      });

      const thought = factory.createThought(input, 'session-anl-007') as AnalogicalThought;

      expect(thought.targetDomain.relations).toHaveLength(1);
    });
  });

  /**
   * T-ANL-008: Analogical with mappings array
   */
  describe('T-ANL-008: Mappings Array', () => {
    it('should include mappings between domains', () => {
      const input = createAnalogicalInput({
        thought: 'Creating domain mappings',
        sourceDomain: {
          id: 'atom-1',
          name: 'Atomic Structure',
          description: 'Structure of atoms',
          entities: [
            { id: 'nucleus', name: 'Nucleus', type: 'core', description: 'Center of atom' },
            { id: 'electron', name: 'Electron', type: 'particle', description: 'Orbiting particle' },
          ],
          relations: [],
          properties: [],
        },
        targetDomain: {
          id: 'solar-1',
          name: 'Solar System',
          description: 'Planetary system',
          entities: [
            { id: 'sun', name: 'Sun', type: 'star', description: 'Central star' },
            { id: 'planet', name: 'Planet', type: 'body', description: 'Orbiting body' },
          ],
          relations: [],
          properties: [],
        },
        mapping: [
          {
            sourceEntityId: 'nucleus',
            targetEntityId: 'sun',
            justification: 'Both are central, massive bodies',
            confidence: 0.85,
          },
          {
            sourceEntityId: 'electron',
            targetEntityId: 'planet',
            justification: 'Both orbit the central body',
            confidence: 0.7,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-anl-008') as AnalogicalThought;

      expect(thought.mapping).toHaveLength(2);
      expect(thought.mapping[0].sourceEntityId).toBe('nucleus');
      expect(thought.mapping[0].targetEntityId).toBe('sun');
    });
  });

  /**
   * T-ANL-009: Analogical with mappings[].confidence
   */
  describe('T-ANL-009: Mapping Confidence', () => {
    it('should include confidence scores in mappings', () => {
      const input = createAnalogicalInput({
        thought: 'Evaluating mapping confidence',
        mapping: [
          {
            sourceEntityId: 'brain',
            targetEntityId: 'cpu',
            justification: 'Both process information',
            confidence: 0.9,
          },
          {
            sourceEntityId: 'memory-bio',
            targetEntityId: 'ram',
            justification: 'Both store information temporarily',
            confidence: 0.75,
          },
          {
            sourceEntityId: 'spine',
            targetEntityId: 'bus',
            justification: 'Both transmit signals',
            confidence: 0.5,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-anl-009') as AnalogicalThought;

      expect(thought.mapping[0].confidence).toBe(0.9);
      expect(thought.mapping[1].confidence).toBe(0.75);
      expect(thought.mapping[2].confidence).toBe(0.5);
    });

    it('should validate confidence is between 0 and 1', () => {
      const input = createAnalogicalInput({
        thought: 'Testing confidence bounds',
        mapping: [
          {
            sourceEntityId: 'a',
            targetEntityId: 'b',
            justification: 'Test mapping',
            confidence: 0.0,
          },
          {
            sourceEntityId: 'c',
            targetEntityId: 'd',
            justification: 'Test mapping',
            confidence: 1.0,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-anl-009') as AnalogicalThought;

      expect(thought.mapping[0].confidence).toBeGreaterThanOrEqual(0);
      expect(thought.mapping[1].confidence).toBeLessThanOrEqual(1);
    });
  });

  /**
   * T-ANL-010: Analogical cross-domain mapping
   */
  describe('T-ANL-010: Cross-Domain Mapping', () => {
    it('should support complex cross-domain analogies', () => {
      const input = createAnalogicalInput({
        thought: 'Water flow as electricity analogy',
        sourceDomain: {
          id: 'hydraulic',
          name: 'Hydraulic System',
          description: 'Water flow system',
          entities: [
            { id: 'pump', name: 'Pump', type: 'device', description: 'Creates pressure' },
            { id: 'pipe', name: 'Pipe', type: 'conduit', description: 'Carries water' },
            { id: 'valve', name: 'Valve', type: 'controller', description: 'Controls flow' },
            { id: 'water', name: 'Water', type: 'medium', description: 'Flowing substance' },
          ],
          relations: [
            { id: 'r1', type: 'contains', from: 'pipe', to: 'water', description: 'Pipe contains water' },
          ],
          properties: [],
        },
        targetDomain: {
          id: 'electrical',
          name: 'Electrical Circuit',
          description: 'Electrical system',
          entities: [
            { id: 'battery', name: 'Battery', type: 'device', description: 'Creates voltage' },
            { id: 'wire', name: 'Wire', type: 'conduit', description: 'Carries current' },
            { id: 'switch', name: 'Switch', type: 'controller', description: 'Controls current' },
            { id: 'electrons', name: 'Electrons', type: 'medium', description: 'Flowing particles' },
          ],
          relations: [
            { id: 'r1', type: 'contains', from: 'wire', to: 'electrons', description: 'Wire contains electrons' },
          ],
          properties: [],
        },
        mapping: [
          { sourceEntityId: 'pump', targetEntityId: 'battery', justification: 'Both create driving force', confidence: 0.95 },
          { sourceEntityId: 'pipe', targetEntityId: 'wire', justification: 'Both carry the medium', confidence: 0.9 },
          { sourceEntityId: 'valve', targetEntityId: 'switch', justification: 'Both control flow', confidence: 0.85 },
          { sourceEntityId: 'water', targetEntityId: 'electrons', justification: 'Both are the flowing medium', confidence: 0.8 },
        ],
        insights: [
          {
            description: 'Pressure corresponds to voltage',
            sourceEvidence: 'Pump creates pressure differential',
            targetApplication: 'Battery creates voltage differential',
            novelty: 0.7,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-anl-010') as AnalogicalThought;

      expect(thought.sourceDomain.entities).toHaveLength(4);
      expect(thought.targetDomain.entities).toHaveLength(4);
      expect(thought.mapping).toHaveLength(4);
      expect(thought.insights).toHaveLength(1);
    });
  });

  /**
   * T-ANL-011: Analogical structural alignment
   */
  describe('T-ANL-011: Structural Alignment', () => {
    it('should support structural alignment between domains', () => {
      const input = createAnalogicalInput({
        thought: 'Structural alignment analysis',
        sourceDomain: {
          id: 'hierarchy-1',
          name: 'Military Hierarchy',
          description: 'Command structure',
          entities: [
            { id: 'general', name: 'General', type: 'rank', description: 'Top commander' },
            { id: 'colonel', name: 'Colonel', type: 'rank', description: 'Field commander' },
            { id: 'soldier', name: 'Soldier', type: 'rank', description: 'Ground troops' },
          ],
          relations: [
            { id: 'r1', type: 'commands', from: 'general', to: 'colonel', description: 'Command chain' },
            { id: 'r2', type: 'commands', from: 'colonel', to: 'soldier', description: 'Command chain' },
          ],
          properties: [],
        },
        targetDomain: {
          id: 'hierarchy-2',
          name: 'Corporate Hierarchy',
          description: 'Business structure',
          entities: [
            { id: 'ceo', name: 'CEO', type: 'role', description: 'Chief executive' },
            { id: 'manager', name: 'Manager', type: 'role', description: 'Department head' },
            { id: 'employee', name: 'Employee', type: 'role', description: 'Staff member' },
          ],
          relations: [
            { id: 'r1', type: 'manages', from: 'ceo', to: 'manager', description: 'Management chain' },
            { id: 'r2', type: 'manages', from: 'manager', to: 'employee', description: 'Management chain' },
          ],
          properties: [],
        },
        analogyStrength: 0.85,
      });

      const thought = factory.createThought(input, 'session-anl-011') as AnalogicalThought;

      expect(thought.sourceDomain.relations).toHaveLength(2);
      expect(thought.targetDomain.relations).toHaveLength(2);
      expect(thought.analogyStrength).toBe(0.85);
    });

    it('should capture analogy strength', () => {
      const input = createAnalogicalInput({
        thought: 'Evaluating analogy strength',
        analogyStrength: 0.72,
      });

      const thought = factory.createThought(input, 'session-anl-011') as AnalogicalThought;

      expect(thought.analogyStrength).toBe(0.72);
    });
  });

  /**
   * T-ANL-012: Analogical multi-thought mapping session
   */
  describe('T-ANL-012: Multi-Thought Mapping Session', () => {
    it('should support multi-thought analogical reasoning session', () => {
      const sessionId = 'session-anl-012-multi';

      // Step 1: Identify source domain
      const step1Input = createAnalogicalInput({
        thought: 'Step 1: Identifying source domain - Evolution',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        sourceDomain: {
          id: 'evolution',
          name: 'Biological Evolution',
          description: 'Natural selection and adaptation',
          entities: [
            { id: 'species', name: 'Species', type: 'organism', description: 'Group of organisms' },
            { id: 'mutation', name: 'Mutation', type: 'process', description: 'Genetic change' },
            { id: 'selection', name: 'Natural Selection', type: 'process', description: 'Survival pressure' },
          ],
          relations: [],
          properties: [],
        },
      });
      const step1 = factory.createThought(step1Input, sessionId) as AnalogicalThought;
      expect(step1.sourceDomain.name).toBe('Biological Evolution');

      // Step 2: Identify target domain
      const step2Input = createAnalogicalInput({
        thought: 'Step 2: Identifying target domain - Genetic Algorithms',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        targetDomain: {
          id: 'genetic-algo',
          name: 'Genetic Algorithms',
          description: 'Optimization using evolutionary principles',
          entities: [
            { id: 'solution', name: 'Solution', type: 'candidate', description: 'Potential solution' },
            { id: 'crossover', name: 'Crossover', type: 'operator', description: 'Combination operation' },
            { id: 'fitness', name: 'Fitness Function', type: 'evaluator', description: 'Quality measure' },
          ],
          relations: [],
          properties: [],
        },
      });
      const step2 = factory.createThought(step2Input, sessionId) as AnalogicalThought;
      expect(step2.targetDomain.name).toBe('Genetic Algorithms');

      // Step 3: Create mappings
      const step3Input = createAnalogicalInput({
        thought: 'Step 3: Creating mappings between domains',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mapping: [
          { sourceEntityId: 'species', targetEntityId: 'solution', justification: 'Both represent candidates', confidence: 0.9 },
          { sourceEntityId: 'mutation', targetEntityId: 'crossover', justification: 'Both introduce variation', confidence: 0.75 },
          { sourceEntityId: 'selection', targetEntityId: 'fitness', justification: 'Both determine survival', confidence: 0.85 },
        ],
      });
      const step3 = factory.createThought(step3Input, sessionId) as AnalogicalThought;
      expect(step3.mapping).toHaveLength(3);

      // Step 4: Draw insights and inferences
      const step4Input = createAnalogicalInput({
        thought: 'Step 4: Drawing insights and inferences',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        insights: [
          {
            description: 'Population diversity is crucial for avoiding local optima',
            sourceEvidence: 'Biodiversity enables adaptation to new challenges',
            targetApplication: 'Maintain diverse solution pool in GA',
            novelty: 0.8,
          },
        ],
        inferences: [
          {
            sourcePattern: 'Gradual adaptation works better than sudden change',
            targetPrediction: 'Small mutation rates may improve GA convergence',
            confidence: 0.7,
            needsVerification: true,
          },
        ],
        limitations: [
          'Biological evolution has no goal; GAs have explicit objective',
          'Time scales differ enormously',
        ],
        analogyStrength: 0.82,
      });
      const step4 = factory.createThought(step4Input, sessionId) as AnalogicalThought;
      expect(step4.insights).toHaveLength(1);
      expect(step4.inferences).toHaveLength(1);
      expect(step4.limitations).toHaveLength(2);
      expect(step4.nextThoughtNeeded).toBe(false);
    });
  });
});
