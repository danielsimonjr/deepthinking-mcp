/**
 * PhysicsHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Physics reasoning mode with:
 * - Tensor property validation
 * - Physical interpretation tracking
 * - Conservation law checking
 * - Dimensional analysis support
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, PhysicsThought } from '../../types/core.js';
import type {
  PhysicsThoughtType,
  TensorProperties,
  PhysicalInterpretation,
  FieldTheoryContext,
} from '../../types/modes/physics.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

/**
 * Valid physics thought types
 */
const VALID_THOUGHT_TYPES: PhysicsThoughtType[] = [
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

/**
 * Valid tensor transformation types
 */
const VALID_TRANSFORMATIONS = ['covariant', 'contravariant', 'mixed'];

/**
 * PhysicsHandler - Specialized handler for physics reasoning
 *
 * Provides:
 * - Tensor mathematics support
 * - Conservation law tracking
 * - Dimensional analysis validation
 * - Field theory context
 */
export class PhysicsHandler implements ModeHandler {
  readonly mode = ThinkingMode.PHYSICS;
  readonly modeName = 'Physics Modeling';
  readonly description = 'Physical modeling with tensor mathematics, conservation laws, and field theory';

  /**
   * Create a physics thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): PhysicsThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

    // Normalize tensor properties
    const tensorProperties = this.normalizeTensor(input.tensorProperties);

    // Normalize physical interpretation
    const physicalInterpretation = this.normalizeInterpretation(input.physicalInterpretation);

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.PHYSICS,

      // Core physics fields
      thoughtType,
      tensorProperties,
      physicalInterpretation,
      dependencies: input.dependencies || [],
      assumptions: input.assumptions || [],
      uncertainty: input.uncertainty ?? 0.5,

      // Extended fields
      fieldTheoryContext: inputAny.fieldTheoryContext,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };
  }

  /**
   * Validate physics-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors = [];
    const warnings = [];
    const inputAny = input as any;

    // Basic validation
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError('thought', 'Thought content is required', 'EMPTY_THOUGHT'),
      ]);
    }

    if (input.thoughtNumber > input.totalThoughts) {
      return validationFailure([
        createValidationError(
          'thoughtNumber',
          `Thought number (${input.thoughtNumber}) exceeds total thoughts (${input.totalThoughts})`,
          'INVALID_THOUGHT_NUMBER'
        ),
      ]);
    }

    // Validate thought type
    if (inputAny.thoughtType && !VALID_THOUGHT_TYPES.includes(inputAny.thoughtType)) {
      warnings.push(
        createValidationWarning(
          'thoughtType',
          `Unknown thought type: ${inputAny.thoughtType}`,
          `Valid types: ${VALID_THOUGHT_TYPES.join(', ')}`
        )
      );
    }

    // Validate uncertainty
    if (input.uncertainty !== undefined) {
      if (input.uncertainty < 0 || input.uncertainty > 1) {
        errors.push(
          createValidationError(
            'uncertainty',
            `Uncertainty (${input.uncertainty}) must be between 0 and 1`,
            'UNCERTAINTY_OUT_OF_RANGE'
          )
        );
      }
    }

    // Validate tensor properties
    if (input.tensorProperties) {
      const tensorValidation = this.validateTensor(input.tensorProperties);
      errors.push(...tensorValidation.errors);
      warnings.push(...tensorValidation.warnings);
    }

    // Validate physical interpretation
    if (input.physicalInterpretation) {
      const interpValidation = this.validateInterpretation(input.physicalInterpretation);
      errors.push(...interpValidation.errors);
      warnings.push(...interpValidation.warnings);
    }

    // Validate field theory context
    if (inputAny.fieldTheoryContext) {
      const fieldValidation = this.validateFieldTheory(inputAny.fieldTheoryContext);
      errors.push(...fieldValidation.errors);
      warnings.push(...fieldValidation.warnings);
    }

    // Suggest tensor for appropriate thought types
    if (!input.tensorProperties) {
      const tensorTypes: PhysicsThoughtType[] = ['tensor_formulation', 'gauge_theory', 'differential_geometry'];
      if (tensorTypes.includes(inputAny.thoughtType)) {
        warnings.push(
          createValidationWarning(
            'tensorProperties',
            `${inputAny.thoughtType} typically involves tensor mathematics`,
            'Consider adding tensorProperties for formal representation'
          )
        );
      }
    }

    // Suggest conservation laws for physical interpretation
    if (input.physicalInterpretation &&
        (!input.physicalInterpretation.conservationLaws ||
         input.physicalInterpretation.conservationLaws.length === 0)) {
      warnings.push(
        createValidationWarning(
          'physicalInterpretation.conservationLaws',
          'No conservation laws specified',
          'Document relevant conservation laws (energy, momentum, charge, etc.)'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get physics-specific enhancements
   */
  getEnhancements(thought: PhysicsThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.MATHEMATICS, ThinkingMode.ENGINEERING, ThinkingMode.SYSTEMSTHINKING],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        dependencyCount: thought.dependencies?.length || 0,
        assumptionCount: thought.assumptions?.length || 0,
        uncertainty: thought.uncertainty,
      },
      mentalModels: [
        'Tensor Analysis',
        'Conservation Principles',
        'Symmetry and Invariance',
        'Dimensional Analysis',
        'Lagrangian Mechanics',
      ],
    };

    // Thought type-specific guidance
    switch (thought.thoughtType) {
      case 'symmetry_analysis':
        enhancements.guidingQuestions!.push(
          'What symmetries are present in the system?',
          'What conservation laws follow from these symmetries (Noether)?'
        );
        enhancements.suggestions!.push(
          "Apply Noether's theorem to derive conservation laws from symmetries"
        );
        break;

      case 'gauge_theory':
        enhancements.guidingQuestions!.push(
          'What is the gauge group?',
          'What are the gauge fields and their transformations?'
        );
        enhancements.relatedModes = [ThinkingMode.MATHEMATICS, ThinkingMode.FORMALLOGIC];
        break;

      case 'field_equations':
        enhancements.guidingQuestions!.push(
          'What are the sources in these field equations?',
          'Are the equations linear or nonlinear?'
        );
        break;

      case 'lagrangian':
        enhancements.guidingQuestions!.push(
          'What are the generalized coordinates?',
          'Are there any constraints on the system?'
        );
        enhancements.suggestions!.push(
          'Derive equations of motion using Euler-Lagrange equations'
        );
        break;

      case 'hamiltonian':
        enhancements.guidingQuestions!.push(
          'What are the canonical coordinates and momenta?',
          'Is the Hamiltonian time-independent (energy conserved)?'
        );
        break;

      case 'conservation_law':
        enhancements.guidingQuestions!.push(
          'What quantity is conserved?',
          'What symmetry gives rise to this conservation law?'
        );
        enhancements.suggestions!.push(
          'Express the conservation law in both differential and integral forms'
        );
        break;

      case 'dimensional_analysis':
        enhancements.guidingQuestions!.push(
          'What are the fundamental dimensions involved?',
          'Are all terms dimensionally consistent?'
        );
        enhancements.suggestions!.push(
          'Use the Buckingham π theorem for non-dimensionalization'
        );
        break;

      case 'tensor_formulation':
        enhancements.guidingQuestions!.push(
          'What is the tensor rank and index structure?',
          'Is the tensor covariant under the required transformations?'
        );
        break;

      case 'differential_geometry':
        enhancements.guidingQuestions!.push(
          'What is the manifold structure?',
          'What are the relevant curvature invariants?'
        );
        enhancements.relatedModes = [ThinkingMode.MATHEMATICS];
        break;
    }

    // Tensor analysis
    if (thought.tensorProperties) {
      const tp = thought.tensorProperties;
      enhancements.metrics!.tensorRank = tp.rank[0] + tp.rank[1];
      enhancements.metrics!.symmetryCount = tp.symmetries?.length || 0;
      enhancements.metrics!.invariantCount = tp.invariants?.length || 0;

      if (tp.symmetries && tp.symmetries.length > 0) {
        enhancements.suggestions!.push(
          `Tensor has ${tp.symmetries.length} symmetr${tp.symmetries.length > 1 ? 'ies' : 'y'}: ${tp.symmetries.slice(0, 3).join(', ')}`
        );
      }
    }

    // Physical interpretation analysis
    if (thought.physicalInterpretation) {
      const pi = thought.physicalInterpretation;
      enhancements.metrics!.conservationLawCount = pi.conservationLaws?.length || 0;

      if (pi.conservationLaws && pi.conservationLaws.length > 0) {
        enhancements.suggestions!.push(
          `Conservation laws: ${pi.conservationLaws.join(', ')}`
        );
      }

      if (pi.constraints && pi.constraints.length > 0) {
        enhancements.metrics!.constraintCount = pi.constraints.length;
      }
    }

    // Field theory context
    if (thought.fieldTheoryContext) {
      const ft = thought.fieldTheoryContext;
      enhancements.metrics!.fieldCount = ft.fields?.length || 0;
      enhancements.metrics!.interactionCount = ft.interactions?.length || 0;

      if (ft.symmetryGroup) {
        enhancements.suggestions!.push(`Symmetry group: ${ft.symmetryGroup}`);
      }
    }

    // High uncertainty warning
    if (thought.uncertainty > 0.7) {
      enhancements.warnings!.push(
        'High uncertainty - consider reviewing assumptions or adding constraints'
      );
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return VALID_THOUGHT_TYPES.includes(thoughtType as PhysicsThoughtType);
  }

  /**
   * Resolve thought type
   */
  private resolveThoughtType(inputType: string | undefined): PhysicsThoughtType {
    if (inputType && VALID_THOUGHT_TYPES.includes(inputType as PhysicsThoughtType)) {
      return inputType as PhysicsThoughtType;
    }
    return 'symmetry_analysis';
  }

  /**
   * Normalize tensor properties
   */
  private normalizeTensor(tensor: TensorProperties | undefined): TensorProperties | undefined {
    if (!tensor) return undefined;

    return {
      rank: tensor.rank || [0, 0],
      components: tensor.components || '',
      latex: tensor.latex || '',
      symmetries: tensor.symmetries || [],
      invariants: tensor.invariants || [],
      transformation: VALID_TRANSFORMATIONS.includes(tensor.transformation)
        ? tensor.transformation
        : 'mixed',
      indexStructure: tensor.indexStructure,
      coordinateSystem: tensor.coordinateSystem,
    };
  }

  /**
   * Normalize physical interpretation
   */
  private normalizeInterpretation(interp: PhysicalInterpretation | undefined): PhysicalInterpretation | undefined {
    if (!interp) return undefined;

    return {
      quantity: interp.quantity || '',
      units: interp.units || '',
      conservationLaws: interp.conservationLaws || [],
      constraints: interp.constraints,
      observables: interp.observables,
    };
  }

  /**
   * Validate tensor properties
   */
  private validateTensor(tensor: TensorProperties): ValidationResult {
    const errors = [];
    const warnings = [];

    // Validate rank
    if (!tensor.rank || !Array.isArray(tensor.rank) || tensor.rank.length !== 2) {
      errors.push(
        createValidationError(
          'tensorProperties.rank',
          'Tensor rank must be a tuple [contravariant, covariant]',
          'INVALID_TENSOR_RANK'
        )
      );
    } else {
      if (tensor.rank[0] < 0 || tensor.rank[1] < 0) {
        errors.push(
          createValidationError(
            'tensorProperties.rank',
            'Tensor rank indices must be non-negative',
            'NEGATIVE_TENSOR_RANK'
          )
        );
      }
    }

    // Validate transformation type
    if (tensor.transformation && !VALID_TRANSFORMATIONS.includes(tensor.transformation)) {
      warnings.push(
        createValidationWarning(
          'tensorProperties.transformation',
          `Unknown transformation type: ${tensor.transformation}`,
          `Valid types: ${VALID_TRANSFORMATIONS.join(', ')}`
        )
      );
    }

    // Suggest LaTeX representation
    if (!tensor.latex) {
      warnings.push(
        createValidationWarning(
          'tensorProperties.latex',
          'No LaTeX representation provided',
          'Add LaTeX for clear mathematical presentation'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Validate physical interpretation
   */
  private validateInterpretation(interp: PhysicalInterpretation): ValidationResult {
    const warnings = [];

    if (!interp.quantity) {
      warnings.push(
        createValidationWarning(
          'physicalInterpretation.quantity',
          'No physical quantity specified',
          'Identify what physical quantity this represents'
        )
      );
    }

    if (!interp.units) {
      warnings.push(
        createValidationWarning(
          'physicalInterpretation.units',
          'No units specified',
          'Specify units for dimensional consistency'
        )
      );
    }

    return validationSuccess(warnings);
  }

  /**
   * Validate field theory context
   */
  private validateFieldTheory(context: FieldTheoryContext): ValidationResult {
    const warnings = [];

    if (!context.fields || context.fields.length === 0) {
      warnings.push(
        createValidationWarning(
          'fieldTheoryContext.fields',
          'No fields specified',
          'List the fields involved in the theory'
        )
      );
    }

    if (!context.symmetryGroup) {
      warnings.push(
        createValidationWarning(
          'fieldTheoryContext.symmetryGroup',
          'No symmetry group specified',
          'Identify the symmetry group (e.g., U(1), SU(2), etc.)'
        )
      );
    }

    return validationSuccess(warnings);
  }
}
