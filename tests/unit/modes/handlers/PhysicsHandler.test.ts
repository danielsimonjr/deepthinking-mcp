/**
 * PhysicsHandler Unit Tests
 *
 * Tests for Physics reasoning mode handler including:
 * - Tensor property validation
 * - Physical interpretation tracking
 * - Conservation law checking
 * - Field theory context
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PhysicsHandler } from '../../../../src/modes/handlers/PhysicsHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('PhysicsHandler', () => {
  let handler: PhysicsHandler;

  beforeEach(() => {
    handler = new PhysicsHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.PHYSICS);
    });

    it('should have descriptive mode name', () => {
      expect(handler.modeName).toBe('Physics Modeling');
    });

    it('should have meaningful description', () => {
      expect(handler.description).toContain('tensor');
      expect(handler.description).toContain('conservation');
    });
  });

  describe('createThought', () => {
    it('should create basic physics thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Analyzing symmetry properties',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'physics',
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.PHYSICS);
      expect(thought.content).toBe('Analyzing symmetry properties');
      expect(thought.sessionId).toBe('session-123');
      expect(thought.thoughtType).toBe('symmetry_analysis'); // Default
    });

    it('should include tensor properties', () => {
      const input: ThinkingToolInput = {
        thought: 'Defining stress-energy tensor',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        tensorProperties: {
          rank: [0, 2],
          components: 'T_{\\mu\\nu}',
          latex: 'T_{\\mu\\nu} = (\\rho + p)u_\\mu u_\\nu + p g_{\\mu\\nu}',
          transformation: 'covariant',
          symmetries: ['symmetric'],
          invariants: ['trace'],
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.tensorProperties).toBeDefined();
      expect(thought.tensorProperties?.rank).toEqual([0, 2]);
      expect(thought.tensorProperties?.transformation).toBe('covariant');
      expect(thought.tensorProperties?.symmetries).toContain('symmetric');
    });

    it('should include physical interpretation', () => {
      const input: ThinkingToolInput = {
        thought: 'Energy-momentum in flat spacetime',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        physicalInterpretation: {
          quantity: 'energy density',
          units: 'J/m^3',
          conservationLaws: ['energy', 'momentum'],
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.physicalInterpretation).toBeDefined();
      expect(thought.physicalInterpretation?.quantity).toBe('energy density');
      expect(thought.physicalInterpretation?.units).toBe('J/m^3');
      expect(thought.physicalInterpretation?.conservationLaws).toContain('energy');
    });

    it('should include field theory context', () => {
      const input: any = {
        thought: 'Gauge field analysis',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'physics',
        thoughtType: 'gauge_theory',
        fieldTheoryContext: {
          fields: ['A_mu', 'psi'],
          symmetryGroup: 'U(1)',
          interactions: ['electromagnetic'],
          lagrangianDensity: '-1/4 F_{\\mu\\nu}F^{\\mu\\nu}',
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.fieldTheoryContext).toBeDefined();
      expect(thought.fieldTheoryContext?.symmetryGroup).toBe('U(1)');
      expect(thought.fieldTheoryContext?.fields).toContain('A_mu');
    });

    it('should handle all valid thought types', () => {
      const thoughtTypes = [
        'symmetry_analysis',
        'gauge_theory',
        'field_equations',
        'lagrangian',
        'hamiltonian',
        'conservation_law',
        'dimensional_analysis',
        'tensor_formulation',
        'differential_geometry',
      ];

      for (const thoughtType of thoughtTypes) {
        const input: any = {
          thought: `Testing ${thoughtType}`,
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          mode: 'physics',
          thoughtType,
        };

        const thought = handler.createThought(input, 'session-123');
        expect(thought.thoughtType).toBe(thoughtType);
      }
    });

    it('should default to symmetry_analysis for unknown thought type', () => {
      const input: any = {
        thought: 'Unknown type',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: 'physics',
        thoughtType: 'invalid_type',
      };

      const thought = handler.createThought(input, 'session-123');
      expect(thought.thoughtType).toBe('symmetry_analysis');
    });

    it('should normalize invalid tensor transformation', () => {
      const input: ThinkingToolInput = {
        thought: 'Tensor with invalid transformation',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: 'physics',
        tensorProperties: {
          rank: [1, 1],
          components: 'T^a_b',
          latex: 'T^a_b',
          transformation: 'invalid' as any,
        },
      };

      const thought = handler.createThought(input, 'session-123');
      expect(thought.tensorProperties?.transformation).toBe('mixed');
    });

    it('should track revision information', () => {
      const input: ThinkingToolInput = {
        thought: 'Revised analysis',
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        isRevision: true,
        revisesThought: 'thought-1',
      };

      const thought = handler.createThought(input, 'session-123');
      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('thought-1');
    });
  });

  describe('validate', () => {
    it('should validate basic physics input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid physics thought',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should reject empty thought', () => {
      const input: ThinkingToolInput = {
        thought: '',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('EMPTY_THOUGHT');
    });

    it('should reject invalid thought number', () => {
      const input: ThinkingToolInput = {
        thought: 'Physics analysis',
        thoughtNumber: 10,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'physics',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_THOUGHT_NUMBER');
    });

    it('should reject uncertainty out of range', () => {
      const input: ThinkingToolInput = {
        thought: 'Physics analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        uncertainty: 1.5,
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('UNCERTAINTY_OUT_OF_RANGE');
    });

    it('should warn about unknown thought type', () => {
      const input: any = {
        thought: 'Physics analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        thoughtType: 'unknown_type',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].field).toBe('thoughtType');
    });

    it('should validate tensor rank format', () => {
      const input: ThinkingToolInput = {
        thought: 'Tensor analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        tensorProperties: {
          rank: [2] as any, // Invalid - should be tuple
          components: 'T',
          latex: 'T',
          transformation: 'covariant',
        },
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_TENSOR_RANK');
    });

    it('should reject negative tensor rank', () => {
      const input: ThinkingToolInput = {
        thought: 'Tensor analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        tensorProperties: {
          rank: [-1, 0],
          components: 'T',
          latex: 'T',
          transformation: 'covariant',
        },
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('NEGATIVE_TENSOR_RANK');
    });

    it('should warn about invalid tensor transformation', () => {
      const input: ThinkingToolInput = {
        thought: 'Tensor analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        tensorProperties: {
          rank: [1, 1],
          components: 'T',
          latex: 'T',
          transformation: 'invalid' as any,
        },
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'tensorProperties.transformation')).toBe(true);
    });

    it('should warn about missing tensor LaTeX', () => {
      const input: ThinkingToolInput = {
        thought: 'Tensor analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        tensorProperties: {
          rank: [2, 0],
          components: 'T^{ab}',
          transformation: 'contravariant',
        } as any,
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'tensorProperties.latex')).toBe(true);
    });

    it('should warn about missing physical quantity', () => {
      const input: ThinkingToolInput = {
        thought: 'Physical interpretation',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        physicalInterpretation: {
          units: 'kg',
          conservationLaws: [],
        } as any,
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'physicalInterpretation.quantity')).toBe(true);
    });

    it('should warn about missing conservation laws', () => {
      const input: ThinkingToolInput = {
        thought: 'Physical interpretation',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        physicalInterpretation: {
          quantity: 'energy',
          units: 'J',
          conservationLaws: [],
        },
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(
        result.warnings.some((w) => w.field === 'physicalInterpretation.conservationLaws')
      ).toBe(true);
    });

    it('should suggest tensor for tensor-related thought types', () => {
      const input: any = {
        thought: 'Gauge theory analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        thoughtType: 'gauge_theory',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'tensorProperties')).toBe(true);
    });

    it('should validate field theory context fields', () => {
      const input: any = {
        thought: 'Field theory',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        fieldTheoryContext: {
          fields: [],
        },
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'fieldTheoryContext.fields')).toBe(true);
    });

    it('should warn about missing symmetry group in field theory', () => {
      const input: any = {
        thought: 'Field theory',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        fieldTheoryContext: {
          fields: ['phi'],
        },
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'fieldTheoryContext.symmetryGroup')).toBe(
        true
      );
    });
  });

  describe('getEnhancements', () => {
    it('should provide base enhancements', () => {
      const input: ThinkingToolInput = {
        thought: 'Physics analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.MATHEMATICS);
      expect(enhancements.mentalModels).toContain('Tensor Analysis');
      expect(enhancements.mentalModels).toContain('Conservation Principles');
    });

    it('should provide symmetry analysis guidance', () => {
      const input: any = {
        thought: 'Symmetry analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        thoughtType: 'symmetry_analysis',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('symmetries')
      );
      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('Noether')
      );
    });

    it('should provide gauge theory guidance', () => {
      const input: any = {
        thought: 'Gauge theory',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        thoughtType: 'gauge_theory',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('gauge group')
      );
      expect(enhancements.relatedModes).toContain(ThinkingMode.FORMALLOGIC);
    });

    it('should provide lagrangian guidance', () => {
      const input: any = {
        thought: 'Lagrangian mechanics',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        thoughtType: 'lagrangian',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('generalized coordinates')
      );
      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('Euler-Lagrange')
      );
    });

    it('should provide hamiltonian guidance', () => {
      const input: any = {
        thought: 'Hamiltonian mechanics',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        thoughtType: 'hamiltonian',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('canonical coordinates')
      );
    });

    it('should provide conservation law guidance', () => {
      const input: any = {
        thought: 'Conservation laws',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        thoughtType: 'conservation_law',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('conserved')
      );
      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('differential and integral')
      );
    });

    it('should provide dimensional analysis guidance', () => {
      const input: any = {
        thought: 'Dimensional analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        thoughtType: 'dimensional_analysis',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('fundamental dimensions')
      );
      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('Buckingham')
      );
    });

    it('should provide tensor formulation guidance', () => {
      const input: any = {
        thought: 'Tensor formulation',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        thoughtType: 'tensor_formulation',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('tensor rank')
      );
    });

    it('should provide differential geometry guidance', () => {
      const input: any = {
        thought: 'Differential geometry',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        thoughtType: 'differential_geometry',
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('manifold')
      );
      expect(enhancements.relatedModes).toContain(ThinkingMode.MATHEMATICS);
    });

    it('should include tensor metrics', () => {
      const input: ThinkingToolInput = {
        thought: 'Tensor analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        tensorProperties: {
          rank: [1, 2],
          components: 'T^a_{bc}',
          latex: 'T^a_{bc}',
          transformation: 'mixed',
          symmetries: ['antisymmetric_lower'],
          invariants: ['contraction'],
        },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.tensorRank).toBe(3);
      expect(enhancements.metrics?.symmetryCount).toBe(1);
      expect(enhancements.metrics?.invariantCount).toBe(1);
    });

    it('should include physical interpretation metrics', () => {
      const input: ThinkingToolInput = {
        thought: 'Physical interpretation',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        physicalInterpretation: {
          quantity: 'energy',
          units: 'J',
          conservationLaws: ['energy', 'momentum', 'angular momentum'],
        },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.conservationLawCount).toBe(3);
      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('Conservation laws')
      );
    });

    it('should include field theory metrics', () => {
      const input: any = {
        thought: 'Field theory analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        fieldTheoryContext: {
          fields: ['A_mu', 'psi', 'phi'],
          symmetryGroup: 'SU(3)',
          interactions: ['strong', 'weak'],
        },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.fieldCount).toBe(3);
      expect(enhancements.metrics?.interactionCount).toBe(2);
      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('SU(3)')
      );
    });

    it('should warn about high uncertainty', () => {
      const input: ThinkingToolInput = {
        thought: 'Uncertain analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'physics',
        uncertainty: 0.9,
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings).toContainEqual(
        expect.stringContaining('High uncertainty')
      );
    });
  });

  describe('supportsThoughtType', () => {
    it('should support all valid physics thought types', () => {
      const validTypes = [
        'symmetry_analysis',
        'gauge_theory',
        'field_equations',
        'lagrangian',
        'hamiltonian',
        'conservation_law',
        'dimensional_analysis',
        'tensor_formulation',
        'differential_geometry',
      ];

      for (const type of validTypes) {
        expect(handler.supportsThoughtType(type)).toBe(true);
      }
    });

    it('should not support invalid thought types', () => {
      expect(handler.supportsThoughtType('invalid_type')).toBe(false);
      expect(handler.supportsThoughtType('mathematics')).toBe(false);
      expect(handler.supportsThoughtType('')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete physics reasoning session', () => {
      // Step 1: Problem setup with tensor formulation
      const step1: ThinkingToolInput = {
        thought: 'Setting up the electromagnetic field tensor F_μν',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'physics',
        tensorProperties: {
          rank: [0, 2],
          components: 'F_{μν}',
          latex: 'F_{\\mu\\nu} = \\partial_\\mu A_\\nu - \\partial_\\nu A_\\mu',
          transformation: 'covariant',
          symmetries: ['antisymmetric'],
        },
      };
      (step1 as any).thoughtType = 'tensor_formulation';

      const thought1 = handler.createThought(step1, 'physics-session');
      expect(thought1.thoughtType).toBe('tensor_formulation');
      expect(thought1.tensorProperties?.symmetries).toContain('antisymmetric');

      // Step 2: Symmetry analysis
      const step2: any = {
        thought: 'Analyzing gauge symmetry U(1)',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'physics',
        thoughtType: 'symmetry_analysis',
        fieldTheoryContext: {
          fields: ['A_mu'],
          symmetryGroup: 'U(1)',
          interactions: ['electromagnetic'],
        },
        dependencies: [thought1.id],
      };

      const thought2 = handler.createThought(step2, 'physics-session');
      expect(thought2.thoughtType).toBe('symmetry_analysis');
      expect(thought2.fieldTheoryContext?.symmetryGroup).toBe('U(1)');

      // Step 3: Conservation law
      const step3: any = {
        thought: 'Deriving charge conservation from gauge invariance',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'physics',
        thoughtType: 'conservation_law',
        physicalInterpretation: {
          quantity: 'electric charge',
          units: 'C',
          conservationLaws: ['charge'],
        },
        dependencies: [thought1.id, thought2.id],
      };

      const thought3 = handler.createThought(step3, 'physics-session');
      expect(thought3.thoughtType).toBe('conservation_law');
      expect(thought3.physicalInterpretation?.conservationLaws).toContain('charge');

      // Step 4: Field equations
      const step4: any = {
        thought: 'Maxwell equations in covariant form',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        mode: 'physics',
        thoughtType: 'field_equations',
        tensorProperties: {
          rank: [0, 2],
          components: '∂_μ F^μν = J^ν',
          latex: '\\partial_\\mu F^{\\mu\\nu} = J^\\nu',
          transformation: 'mixed',
        },
        dependencies: [thought1.id, thought2.id, thought3.id],
        uncertainty: 0.1,
      };

      const thought4 = handler.createThought(step4, 'physics-session');
      expect(thought4.thoughtType).toBe('field_equations');
      expect(thought4.nextThoughtNeeded).toBe(false);

      // Validate all steps
      const validations = [step1, step2, step3, step4].map((s) => handler.validate(s));
      for (const v of validations) {
        expect(v.valid).toBe(true);
      }

      // Check enhancements
      const enhancements = handler.getEnhancements(thought4);
      expect(enhancements.metrics?.tensorRank).toBe(2);
      expect(enhancements.metrics?.uncertainty).toBe(0.1);
    });

    it('should handle general relativity session', () => {
      // Einstein tensor
      const input: any = {
        thought: 'Constructing Einstein field equations',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
        mode: 'physics',
        thoughtType: 'differential_geometry',
        tensorProperties: {
          rank: [0, 2],
          components: 'G_{μν} = R_{μν} - ½g_{μν}R',
          latex: 'G_{\\mu\\nu} = R_{\\mu\\nu} - \\frac{1}{2}g_{\\mu\\nu}R = 8\\pi G T_{\\mu\\nu}',
          transformation: 'covariant',
          symmetries: ['symmetric', 'Bianchi identity'],
          invariants: ['Ricci scalar'],
        },
        physicalInterpretation: {
          quantity: 'spacetime curvature',
          units: 'm^{-2}',
          conservationLaws: ['energy-momentum'],
        },
      };

      const validation = handler.validate(input);
      expect(validation.valid).toBe(true);

      const thought = handler.createThought(input, 'gr-session');
      expect(thought.tensorProperties?.symmetries).toContain('symmetric');

      const enhancements = handler.getEnhancements(thought);
      expect(enhancements.relatedModes).toContain(ThinkingMode.MATHEMATICS);
    });
  });
});
