/**
 * Physics Mode Integration Tests
 *
 * Tests T-MTH-028 through T-MTH-045: Comprehensive integration tests
 * for the deepthinking_mathematics tool with physics mode.
 *
 * Phase 11 Sprint 3: Mathematics, Physics & Computability Modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type PhysicsThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import { createBaseThought } from '../../utils/thought-factory.js';
import {
  assertValidBaseThought,
  assertThoughtMode,
  assertValidationPassed,
} from '../../utils/assertion-helpers.js';

// ============================================================================
// PHYSICS MODE THOUGHT FACTORIES
// ============================================================================

/**
 * Create a basic physics thought with required params only
 */
function createPhysicsThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    ...createBaseThought(),
    mode: 'physics',
    ...overrides,
  } as ThinkingToolInput;
}

/**
 * Create a physics thought with tensor properties
 */
function createPhysicsWithTensor(
  rank: [number, number],
  components: string,
  latex: string,
  transformation: 'covariant' | 'contravariant' | 'mixed',
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createPhysicsThought({
    tensorProperties: {
      rank,
      components,
      latex,
      transformation,
      symmetries: [],
      invariants: [],
    },
    ...overrides,
  });
}

/**
 * Create a physics thought with physical interpretation
 */
function createPhysicsWithInterpretation(
  quantity: string,
  units: string,
  conservationLaws: string[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createPhysicsThought({
    physicalInterpretation: {
      quantity,
      units,
      conservationLaws,
    },
    ...overrides,
  });
}

describe('Physics Mode Integration', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-MTH-028: Basic physics thought
   */
  describe('T-MTH-028: Basic Physics Thought Creation', () => {
    it('should create a basic physics thought with minimal params', () => {
      const input = createPhysicsThought({
        thought: 'Analyzing the electromagnetic field tensor',
      });

      const thought = factory.createThought(input, 'session-phy-028');

      expect(thought.mode).toBe(ThinkingMode.PHYSICS);
      expect(thought.content).toBe('Analyzing the electromagnetic field tensor');
      expect(thought.sessionId).toBe('session-phy-028');
    });

    it('should assign unique IDs to physics thoughts', () => {
      const input1 = createPhysicsThought({ thought: 'First physics thought' });
      const input2 = createPhysicsThought({ thought: 'Second physics thought' });

      const thought1 = factory.createThought(input1, 'session-phy-028');
      const thought2 = factory.createThought(input2, 'session-phy-028');

      expect(thought1.id).not.toBe(thought2.id);
    });

    it('should set timestamp correctly', () => {
      const before = new Date();
      const input = createPhysicsThought();
      const thought = factory.createThought(input, 'session-phy-028');
      const after = new Date();

      expect(thought.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(thought.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  /**
   * T-MTH-029: Physics with tensorProperties.rank = [0, 0] (scalar)
   */
  describe('T-MTH-029: Scalar Tensor (Rank [0,0])', () => {
    it('should create thought with scalar tensor', () => {
      const input = createPhysicsWithTensor(
        [0, 0],
        'T = 300',
        'T = 300\\,\\text{K}',
        'covariant',
        { thought: 'Temperature as a scalar field' }
      );

      const thought = factory.createThought(input, 'session-phy-029') as PhysicsThought;

      expect(thought.tensorProperties).toBeDefined();
      expect(thought.tensorProperties!.rank).toEqual([0, 0]);
      expect(thought.tensorProperties!.transformation).toBe('covariant');
    });

    it('should handle scalar invariant quantity', () => {
      const input = createPhysicsWithTensor(
        [0, 0],
        'phi',
        '\\phi',
        'covariant',
        { thought: 'Scalar potential' }
      );

      const thought = factory.createThought(input, 'session-phy-029') as PhysicsThought;

      expect(thought.tensorProperties!.rank[0]).toBe(0);
      expect(thought.tensorProperties!.rank[1]).toBe(0);
    });
  });

  /**
   * T-MTH-030: Physics with tensorProperties.rank = [1, 0] (vector/contravariant)
   */
  describe('T-MTH-030: Vector Tensor (Rank [1,0])', () => {
    it('should create thought with contravariant vector', () => {
      const input = createPhysicsWithTensor(
        [1, 0],
        'v^mu = (v^0, v^1, v^2, v^3)',
        'v^\\mu = (v^0, v^1, v^2, v^3)',
        'contravariant',
        { thought: 'Four-velocity vector' }
      );

      const thought = factory.createThought(input, 'session-phy-030') as PhysicsThought;

      expect(thought.tensorProperties!.rank).toEqual([1, 0]);
      expect(thought.tensorProperties!.transformation).toBe('contravariant');
    });
  });

  /**
   * T-MTH-031: Physics with tensorProperties.rank = [0, 1] (covector)
   */
  describe('T-MTH-031: Covector Tensor (Rank [0,1])', () => {
    it('should create thought with covariant covector', () => {
      const input = createPhysicsWithTensor(
        [0, 1],
        'p_mu = (E/c, -p_x, -p_y, -p_z)',
        'p_\\mu = (E/c, -p_x, -p_y, -p_z)',
        'covariant',
        { thought: 'Four-momentum covector' }
      );

      const thought = factory.createThought(input, 'session-phy-031') as PhysicsThought;

      expect(thought.tensorProperties!.rank).toEqual([0, 1]);
      expect(thought.tensorProperties!.transformation).toBe('covariant');
    });
  });

  /**
   * T-MTH-032: Physics with tensorProperties.rank = [2, 0] (matrix/contravariant)
   */
  describe('T-MTH-032: Matrix Tensor (Rank [2,0])', () => {
    it('should create thought with rank-2 contravariant tensor', () => {
      const input = createPhysicsWithTensor(
        [2, 0],
        'T^{mu nu}',
        'T^{\\mu\\nu}',
        'contravariant',
        { thought: 'Stress-energy tensor in contravariant form' }
      );

      const thought = factory.createThought(input, 'session-phy-032') as PhysicsThought;

      expect(thought.tensorProperties!.rank).toEqual([2, 0]);
    });
  });

  /**
   * T-MTH-033: Physics with tensorProperties.rank = [1, 1] (mixed)
   */
  describe('T-MTH-033: Mixed Tensor (Rank [1,1])', () => {
    it('should create thought with mixed tensor', () => {
      const input = createPhysicsWithTensor(
        [1, 1],
        'delta^mu_nu = diag(1,1,1,1)',
        '\\delta^\\mu_\\nu = \\text{diag}(1,1,1,1)',
        'mixed',
        { thought: 'Kronecker delta as mixed tensor' }
      );

      const thought = factory.createThought(input, 'session-phy-033') as PhysicsThought;

      expect(thought.tensorProperties!.rank).toEqual([1, 1]);
      expect(thought.tensorProperties!.transformation).toBe('mixed');
    });
  });

  /**
   * T-MTH-034: Physics with tensorProperties.components
   */
  describe('T-MTH-034: Tensor Components', () => {
    it('should preserve tensor component representation', () => {
      const components = 'F^{mu nu} = [[0, -E_x, -E_y, -E_z], [E_x, 0, -B_z, B_y], [E_y, B_z, 0, -B_x], [E_z, -B_y, B_x, 0]]';
      const input = createPhysicsWithTensor(
        [2, 0],
        components,
        'F^{\\mu\\nu}',
        'contravariant',
        { thought: 'Electromagnetic field tensor components' }
      );

      const thought = factory.createThought(input, 'session-phy-034') as PhysicsThought;

      expect(thought.tensorProperties!.components).toBe(components);
    });
  });

  /**
   * T-MTH-035: Physics with tensorProperties.latex
   */
  describe('T-MTH-035: Tensor LaTeX Representation', () => {
    it('should preserve LaTeX representation of tensor', () => {
      const latex = 'g_{\\mu\\nu} = \\text{diag}(1, -1, -1, -1)';
      const input = createPhysicsWithTensor(
        [0, 2],
        'g_munu = diag(1,-1,-1,-1)',
        latex,
        'covariant',
        { thought: 'Minkowski metric tensor' }
      );

      const thought = factory.createThought(input, 'session-phy-035') as PhysicsThought;

      expect(thought.tensorProperties!.latex).toBe(latex);
    });
  });

  /**
   * T-MTH-036: Physics with tensorProperties.transformation = covariant
   */
  describe('T-MTH-036: Covariant Transformation', () => {
    it('should create thought with covariant transformation', () => {
      const input = createPhysicsWithTensor(
        [0, 2],
        'g_munu',
        'g_{\\mu\\nu}',
        'covariant',
        { thought: 'Metric tensor with covariant indices' }
      );

      const thought = factory.createThought(input, 'session-phy-036') as PhysicsThought;

      expect(thought.tensorProperties!.transformation).toBe('covariant');
    });
  });

  /**
   * T-MTH-037: Physics with tensorProperties.transformation = contravariant
   */
  describe('T-MTH-037: Contravariant Transformation', () => {
    it('should create thought with contravariant transformation', () => {
      const input = createPhysicsWithTensor(
        [2, 0],
        'g^munu',
        'g^{\\mu\\nu}',
        'contravariant',
        { thought: 'Inverse metric tensor with contravariant indices' }
      );

      const thought = factory.createThought(input, 'session-phy-037') as PhysicsThought;

      expect(thought.tensorProperties!.transformation).toBe('contravariant');
    });
  });

  /**
   * T-MTH-038: Physics with tensorProperties.transformation = mixed
   */
  describe('T-MTH-038: Mixed Transformation', () => {
    it('should create thought with mixed transformation', () => {
      const input = createPhysicsWithTensor(
        [1, 3],
        'R^rho_sigma_mu_nu',
        'R^\\rho_{\\sigma\\mu\\nu}',
        'mixed',
        { thought: 'Riemann curvature tensor' }
      );

      const thought = factory.createThought(input, 'session-phy-038') as PhysicsThought;

      expect(thought.tensorProperties!.transformation).toBe('mixed');
      expect(thought.tensorProperties!.rank).toEqual([1, 3]);
    });
  });

  /**
   * T-MTH-039: Physics with tensorProperties.symmetries
   */
  describe('T-MTH-039: Tensor Symmetries', () => {
    it('should preserve tensor symmetry properties', () => {
      const input = createPhysicsThought({
        thought: 'Analyzing symmetries of the Riemann tensor',
        tensorProperties: {
          rank: [0, 4],
          components: 'R_abcd',
          latex: 'R_{\\alpha\\beta\\gamma\\delta}',
          transformation: 'covariant',
          symmetries: [
            'R_abcd = -R_bacd',
            'R_abcd = -R_abdc',
            'R_abcd = R_cdab',
            'R_abcd + R_acdb + R_adbc = 0',
          ],
          invariants: [],
        },
      });

      const thought = factory.createThought(input, 'session-phy-039') as PhysicsThought;

      expect(thought.tensorProperties!.symmetries).toHaveLength(4);
      expect(thought.tensorProperties!.symmetries![0]).toContain('R_abcd');
    });
  });

  /**
   * T-MTH-040: Physics with tensorProperties.invariants
   */
  describe('T-MTH-040: Tensor Invariants', () => {
    it('should preserve tensor invariants', () => {
      const input = createPhysicsThought({
        thought: 'Computing curvature invariants',
        tensorProperties: {
          rank: [0, 4],
          components: 'R_abcd',
          latex: 'R_{\\alpha\\beta\\gamma\\delta}',
          transformation: 'covariant',
          symmetries: [],
          invariants: [
            'R = g^{mu nu} R_{mu nu} (Ricci scalar)',
            'R_{mu nu} R^{mu nu}',
            'R_{abcd} R^{abcd} (Kretschmann scalar)',
          ],
        },
      });

      const thought = factory.createThought(input, 'session-phy-040') as PhysicsThought;

      expect(thought.tensorProperties!.invariants).toHaveLength(3);
      expect(thought.tensorProperties!.invariants![2]).toContain('Kretschmann');
    });
  });

  /**
   * T-MTH-041: Physics with physicalInterpretation.quantity
   */
  describe('T-MTH-041: Physical Quantity Interpretation', () => {
    it('should create thought with physical quantity', () => {
      const input = createPhysicsWithInterpretation(
        'Electric field strength',
        'V/m',
        ['Gauss law'],
        { thought: 'Electric field as a physical quantity' }
      );

      const thought = factory.createThought(input, 'session-phy-041') as PhysicsThought;

      expect(thought.physicalInterpretation).toBeDefined();
      expect(thought.physicalInterpretation!.quantity).toBe('Electric field strength');
    });
  });

  /**
   * T-MTH-042: Physics with physicalInterpretation.units
   */
  describe('T-MTH-042: Physical Units', () => {
    it('should preserve physical units', () => {
      const input = createPhysicsWithInterpretation(
        'Stress-energy density',
        'J/m^3 = kg/(m*s^2)',
        [],
        { thought: 'Energy density in stress-energy tensor' }
      );

      const thought = factory.createThought(input, 'session-phy-042') as PhysicsThought;

      expect(thought.physicalInterpretation!.units).toBe('J/m^3 = kg/(m*s^2)');
    });
  });

  /**
   * T-MTH-043: Physics with physicalInterpretation.conservationLaws
   */
  describe('T-MTH-043: Conservation Laws', () => {
    it('should preserve conservation laws', () => {
      const conservationLaws = [
        'Conservation of energy',
        'Conservation of momentum',
        'Conservation of angular momentum',
        'Conservation of charge',
      ];
      const input = createPhysicsWithInterpretation(
        'Stress-energy tensor',
        'kg/(m*s^2)',
        conservationLaws,
        { thought: 'Stress-energy tensor and its conservation laws' }
      );

      const thought = factory.createThought(input, 'session-phy-043') as PhysicsThought;

      expect(thought.physicalInterpretation!.conservationLaws).toEqual(conservationLaws);
      expect(thought.physicalInterpretation!.conservationLaws).toHaveLength(4);
    });
  });

  /**
   * T-MTH-044: Physics multi-thought tensor derivation
   */
  describe('T-MTH-044: Multi-Thought Tensor Derivation', () => {
    it('should handle complete tensor derivation session', () => {
      const sessionId = 'session-phy-044-multistep';

      // Step 1: Define the metric
      const step1 = factory.createThought(createPhysicsThought({
        thought: 'Start with the Schwarzschild metric in spherical coordinates',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        tensorProperties: {
          rank: [0, 2],
          components: 'g_munu = diag(1-2M/r, -1/(1-2M/r), -r^2, -r^2*sin^2(theta))',
          latex: 'ds^2 = (1-\\frac{2M}{r})dt^2 - \\frac{dr^2}{1-\\frac{2M}{r}} - r^2(d\\theta^2 + \\sin^2\\theta d\\phi^2)',
          transformation: 'covariant',
          symmetries: ['Spherically symmetric', 'Static'],
          invariants: ['M (ADM mass)'],
        },
      }), sessionId) as PhysicsThought;

      expect(step1.tensorProperties!.rank).toEqual([0, 2]);

      // Step 2: Compute Christoffel symbols
      const step2 = factory.createThought(createPhysicsThought({
        thought: 'Calculate the Christoffel symbols from the metric',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        tensorProperties: {
          rank: [1, 2],
          components: 'Gamma^rho_munu = (1/2)*g^rho sigma*(partial_mu g_nu sigma + partial_nu g_mu sigma - partial_sigma g_mu nu)',
          latex: '\\Gamma^\\rho_{\\mu\\nu} = \\frac{1}{2}g^{\\rho\\sigma}(\\partial_\\mu g_{\\nu\\sigma} + \\partial_\\nu g_{\\mu\\sigma} - \\partial_\\sigma g_{\\mu\\nu})',
          transformation: 'mixed',
          symmetries: ['Symmetric in lower indices'],
          invariants: [],
        },
      }), sessionId) as PhysicsThought;

      expect(step2.tensorProperties!.transformation).toBe('mixed');

      // Step 3: Compute Riemann tensor
      const step3 = factory.createThought(createPhysicsThought({
        thought: 'Derive the Riemann curvature tensor',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        tensorProperties: {
          rank: [1, 3],
          components: 'R^rho_sigma_mu_nu',
          latex: 'R^\\rho_{\\sigma\\mu\\nu} = \\partial_\\mu\\Gamma^\\rho_{\\nu\\sigma} - \\partial_\\nu\\Gamma^\\rho_{\\mu\\sigma} + \\Gamma^\\rho_{\\mu\\lambda}\\Gamma^\\lambda_{\\nu\\sigma} - \\Gamma^\\rho_{\\nu\\lambda}\\Gamma^\\lambda_{\\mu\\sigma}',
          transformation: 'mixed',
          symmetries: ['Antisymmetric in last two indices', 'First Bianchi identity'],
          invariants: ['Kretschmann scalar'],
        },
      }), sessionId) as PhysicsThought;

      expect(step3.tensorProperties!.rank).toEqual([1, 3]);

      // Step 4: Physical interpretation
      const step4 = factory.createThought(createPhysicsThought({
        thought: 'Interpret the curvature as describing the gravitational field of a spherical mass',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        physicalInterpretation: {
          quantity: 'Spacetime curvature around a spherical mass',
          units: '1/m^2',
          conservationLaws: ['Einstein field equations', 'Contracted Bianchi identity'],
        },
      }), sessionId) as PhysicsThought;

      expect(step4.physicalInterpretation!.quantity).toContain('curvature');
      expect(step4.nextThoughtNeeded).toBe(false);
    });
  });

  /**
   * T-MTH-045: Physics with mathematical model integration
   */
  describe('T-MTH-045: Mathematical Model Integration', () => {
    it('should integrate physics with mathematical model', () => {
      const input = createPhysicsThought({
        thought: 'Combining tensor analysis with mathematical formulation',
        tensorProperties: {
          rank: [2, 0],
          components: 'T^munu',
          latex: 'T^{\\mu\\nu}',
          transformation: 'contravariant',
          symmetries: ['Symmetric'],
          invariants: ['Trace: T^mu_mu'],
        },
        physicalInterpretation: {
          quantity: 'Stress-energy tensor',
          units: 'kg/(m*s^2)',
          conservationLaws: ['nabla_mu T^munu = 0'],
        },
        mathematicalModel: {
          latex: 'G_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}',
          symbolic: 'Einstein(g) == (8*pi*G/c^4) * T',
          ascii: 'G_munu = (8*pi*G/c^4) * T_munu',
        },
      });

      const thought = factory.createThought(input, 'session-phy-045') as PhysicsThought;

      expect(thought.tensorProperties).toBeDefined();
      expect(thought.physicalInterpretation).toBeDefined();
      assertValidBaseThought(thought);
      assertThoughtMode(thought, ThinkingMode.PHYSICS);
    });

    it('should validate physics input correctly', () => {
      const input = createPhysicsThought({
        thought: 'Valid physics thought',
        tensorProperties: {
          rank: [0, 2],
          components: 'g_munu',
          latex: 'g_{\\mu\\nu}',
          transformation: 'covariant',
          symmetries: [],
          invariants: [],
        },
      });

      const result = factory.validate(input);

      assertValidationPassed(result);
    });
  });
});
