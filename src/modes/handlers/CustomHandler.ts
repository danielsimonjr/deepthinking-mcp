/**
 * CustomHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Custom reasoning mode with:
 * - User-defined reasoning structures
 * - Flexible field definitions
 * - Custom validation rules
 * - Extensible thought types
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, BaseThought } from '../../types/core.js';
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
 * Custom field definition
 */
interface CustomField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  value: unknown;
  description?: string;
  required?: boolean;
}

/**
 * Custom validation rule
 */
interface CustomValidationRule {
  field: string;
  rule: string;
  message: string;
}

/**
 * Custom stage definition
 */
interface CustomStage {
  id: string;
  name: string;
  description: string;
  order: number;
  completed: boolean;
}

/**
 * Custom thought extending base thought
 */
export interface CustomThought extends BaseThought {
  mode: ThinkingMode.CUSTOM;
  thoughtType: string;

  // Custom configuration
  customModeName: string;
  customModeDescription?: string;

  // User-defined fields
  customFields: CustomField[];

  // Custom stages
  stages?: CustomStage[];
  currentStage?: string;

  // Custom validation
  validationRules?: CustomValidationRule[];

  // Extension data
  metadata: Record<string, unknown>;

  // Related modes for suggestions
  basedOnModes?: ThinkingMode[];
}

/**
 * CustomHandler - Specialized handler for custom user-defined reasoning
 *
 * Provides:
 * - Flexible structure for user-defined reasoning patterns
 * - Custom field definitions and validation
 * - Stage-based progress tracking
 * - Metadata support for extensibility
 */
export class CustomHandler implements ModeHandler {
  readonly mode = ThinkingMode.CUSTOM;
  readonly modeName = 'Custom Reasoning';
  readonly description =
    'User-defined reasoning patterns with flexible structure and custom validation';

  /**
   * Create a custom thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): CustomThought {
    const inputAny = input as any;

    // Process custom fields
    const customFields = inputAny.customFields
      ? inputAny.customFields.map((f: any) => this.normalizeField(f))
      : [];

    // Process stages
    const stages = inputAny.stages
      ? inputAny.stages.map((s: any, idx: number) => this.normalizeStage(s, idx))
      : undefined;

    // Process validation rules
    const validationRules = inputAny.validationRules
      ? inputAny.validationRules.map((r: any) => this.normalizeValidationRule(r))
      : undefined;

    // Process based-on modes
    const basedOnModes = inputAny.basedOnModes
      ? inputAny.basedOnModes.map((m: string) => this.resolveMode(m))
      : undefined;

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.CUSTOM,

      // Custom configuration
      thoughtType: inputAny.thoughtType || 'custom_analysis',
      customModeName: inputAny.customModeName || 'Custom Mode',
      customModeDescription: inputAny.customModeDescription,

      // User-defined fields
      customFields,

      // Custom stages
      stages,
      currentStage: inputAny.currentStage,

      // Custom validation
      validationRules,

      // Extension data
      metadata: inputAny.metadata || {},

      // Related modes
      basedOnModes,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };
  }

  /**
   * Validate custom-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors: { field: string; message: string; code: string }[] = [];
    const warnings: ReturnType<typeof createValidationWarning>[] = [];
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

    // Suggest providing custom mode name
    if (!inputAny.customModeName) {
      warnings.push(
        createValidationWarning(
          'customModeName',
          'No custom mode name provided',
          'Define a name for your custom reasoning mode'
        )
      );
    }

    // Validate custom fields
    if (inputAny.customFields) {
      for (let i = 0; i < inputAny.customFields.length; i++) {
        const field = inputAny.customFields[i];

        // Check required fields have values
        if (field.required && (field.value === undefined || field.value === null)) {
          warnings.push(
            createValidationWarning(
              `customFields[${i}]`,
              `Required field "${field.name}" has no value`,
              'Provide a value for required fields'
            )
          );
        }

        // Type validation
        if (field.type && field.value !== undefined) {
          const actualType = Array.isArray(field.value) ? 'array' : typeof field.value;
          if (actualType !== field.type && field.type !== 'object') {
            warnings.push(
              createValidationWarning(
                `customFields[${i}].value`,
                `Field "${field.name}" type mismatch: expected ${field.type}, got ${actualType}`,
                'Ensure field value matches declared type'
              )
            );
          }
        }
      }
    }

    // Validate stages
    if (inputAny.stages) {
      const stageIds = new Set<string>();
      for (let i = 0; i < inputAny.stages.length; i++) {
        const stage = inputAny.stages[i];
        if (stageIds.has(stage.id)) {
          warnings.push(
            createValidationWarning(
              `stages[${i}].id`,
              `Duplicate stage ID: ${stage.id}`,
              'Each stage should have a unique ID'
            )
          );
        }
        stageIds.add(stage.id);
      }

      // Check current stage exists
      if (inputAny.currentStage && !stageIds.has(inputAny.currentStage)) {
        warnings.push(
          createValidationWarning(
            'currentStage',
            `Current stage "${inputAny.currentStage}" not found in stages`,
            'Set currentStage to a valid stage ID'
          )
        );
      }
    }

    // Run custom validation rules
    if (inputAny.validationRules && inputAny.customFields) {
      const fieldMap = new Map<string, unknown>(
        inputAny.customFields.map((f: any) => [f.name, f.value])
      );

      for (const rule of inputAny.validationRules) {
        const value = fieldMap.get(rule.field);
        if (!this.evaluateRule(rule.rule, value, fieldMap)) {
          warnings.push(
            createValidationWarning(
              rule.field,
              rule.message || `Validation failed: ${rule.rule}`,
              'Check field value against rule'
            )
          );
        }
      }
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get custom-specific enhancements
   */
  getEnhancements(thought: CustomThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: thought.basedOnModes || [ThinkingMode.SEQUENTIAL],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        fieldCount: thought.customFields.length,
        stageCount: thought.stages?.length || 0,
        completedStages: thought.stages?.filter((s) => s.completed).length || 0,
        metadataKeys: Object.keys(thought.metadata).length,
      },
      mentalModels: [
        'Domain-Specific Reasoning',
        'Custom Frameworks',
        'Flexible Analysis',
        'User-Defined Logic',
      ],
    };

    // Mode info
    enhancements.suggestions!.push(`Custom mode: ${thought.customModeName}`);
    if (thought.customModeDescription) {
      enhancements.suggestions!.push(`Description: ${thought.customModeDescription}`);
    }

    // Stage progress
    if (thought.stages && thought.stages.length > 0) {
      const completed = thought.stages.filter((s) => s.completed).length;
      const total = thought.stages.length;
      const progress = ((completed / total) * 100).toFixed(0);
      enhancements.suggestions!.push(`Stage progress: ${completed}/${total} (${progress}%)`);

      // Current stage info
      if (thought.currentStage) {
        const current = thought.stages.find((s) => s.id === thought.currentStage);
        if (current) {
          enhancements.suggestions!.push(`Current stage: ${current.name}`);
          enhancements.guidingQuestions!.push(`What is needed to complete "${current.name}"?`);
        }
      }

      // Next incomplete stage
      const nextStage = thought.stages.find((s) => !s.completed);
      if (nextStage && nextStage.id !== thought.currentStage) {
        enhancements.suggestions!.push(`Next stage: ${nextStage.name}`);
      }
    }

    // Custom field summary
    if (thought.customFields.length > 0) {
      const filledFields = thought.customFields.filter(
        (f) => f.value !== undefined && f.value !== null
      ).length;
      enhancements.suggestions!.push(`Fields: ${filledFields}/${thought.customFields.length} populated`);

      // Warn about required fields without values
      const missingRequired = thought.customFields.filter(
        (f) => f.required && (f.value === undefined || f.value === null)
      );
      if (missingRequired.length > 0) {
        enhancements.warnings!.push(
          `Missing required fields: ${missingRequired.map((f) => f.name).join(', ')}`
        );
      }
    }

    // Guiding questions for custom mode
    enhancements.guidingQuestions!.push(
      'Are all necessary fields defined?',
      'Does the custom structure fit the problem?',
      'Would predefined modes work better?'
    );

    // Based-on modes suggestions
    if (thought.basedOnModes && thought.basedOnModes.length > 0) {
      enhancements.suggestions!.push(
        `Based on: ${thought.basedOnModes.join(', ')}`
      );
      enhancements.mentalModels!.push('Mode Composition');
    }

    // Metadata info
    if (Object.keys(thought.metadata).length > 0) {
      enhancements.metrics!.metadataKeys = Object.keys(thought.metadata).length;
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   * Custom handler supports any thought type
   */
  supportsThoughtType(_thoughtType: string): boolean {
    return true; // Custom mode supports any thought type
  }

  /**
   * Normalize custom field
   */
  private normalizeField(field: any): CustomField {
    return {
      name: field.name || 'unnamed',
      type: this.resolveFieldType(field.type),
      value: field.value,
      description: field.description,
      required: field.required ?? false,
    };
  }

  /**
   * Resolve field type
   */
  private resolveFieldType(type: string | undefined): CustomField['type'] {
    const validTypes = ['string', 'number', 'boolean', 'array', 'object'];
    if (type && validTypes.includes(type)) {
      return type as CustomField['type'];
    }
    return 'string';
  }

  /**
   * Normalize custom stage
   */
  private normalizeStage(stage: any, defaultOrder: number): CustomStage {
    return {
      id: stage.id || randomUUID(),
      name: stage.name || `Stage ${defaultOrder + 1}`,
      description: stage.description || '',
      order: stage.order ?? defaultOrder,
      completed: stage.completed ?? false,
    };
  }

  /**
   * Normalize validation rule
   */
  private normalizeValidationRule(rule: any): CustomValidationRule {
    return {
      field: rule.field || '',
      rule: rule.rule || '',
      message: rule.message || 'Validation failed',
    };
  }

  /**
   * Resolve mode from string
   */
  private resolveMode(mode: string): ThinkingMode {
    const modeMap: Record<string, ThinkingMode> = {
      sequential: ThinkingMode.SEQUENTIAL,
      shannon: ThinkingMode.SHANNON,
      mathematics: ThinkingMode.MATHEMATICS,
      physics: ThinkingMode.PHYSICS,
      hybrid: ThinkingMode.HYBRID,
      inductive: ThinkingMode.INDUCTIVE,
      deductive: ThinkingMode.DEDUCTIVE,
      abductive: ThinkingMode.ABDUCTIVE,
      causal: ThinkingMode.CAUSAL,
      bayesian: ThinkingMode.BAYESIAN,
      counterfactual: ThinkingMode.COUNTERFACTUAL,
      temporal: ThinkingMode.TEMPORAL,
      gametheory: ThinkingMode.GAMETHEORY,
      evidential: ThinkingMode.EVIDENTIAL,
      analogical: ThinkingMode.ANALOGICAL,
      firstprinciples: ThinkingMode.FIRSTPRINCIPLES,
      systemsthinking: ThinkingMode.SYSTEMSTHINKING,
      scientificmethod: ThinkingMode.SCIENTIFICMETHOD,
      formallogic: ThinkingMode.FORMALLOGIC,
      metareasoning: ThinkingMode.METAREASONING,
      optimization: ThinkingMode.OPTIMIZATION,
      engineering: ThinkingMode.ENGINEERING,
      algorithmic: ThinkingMode.ALGORITHMIC,
      computability: ThinkingMode.COMPUTABILITY,
      cryptanalytic: ThinkingMode.CRYPTANALYTIC,
      synthesis: ThinkingMode.SYNTHESIS,
      argumentation: ThinkingMode.ARGUMENTATION,
      critique: ThinkingMode.CRITIQUE,
      analysis: ThinkingMode.ANALYSIS,
      custom: ThinkingMode.CUSTOM,
    };

    return modeMap[mode.toLowerCase()] || ThinkingMode.SEQUENTIAL;
  }

  /**
   * Evaluate a simple validation rule
   */
  private evaluateRule(
    rule: string,
    value: unknown,
    _allFields: Map<string, unknown>
  ): boolean {
    try {
      // Simple rule evaluation (for safety, only support basic operations)
      if (rule === 'required') {
        return value !== undefined && value !== null && value !== '';
      }

      if (rule.startsWith('min:')) {
        const min = parseFloat(rule.substring(4));
        return typeof value === 'number' && value >= min;
      }

      if (rule.startsWith('max:')) {
        const max = parseFloat(rule.substring(4));
        return typeof value === 'number' && value <= max;
      }

      if (rule.startsWith('minLength:')) {
        const min = parseInt(rule.substring(10));
        return typeof value === 'string' && value.length >= min;
      }

      if (rule.startsWith('maxLength:')) {
        const max = parseInt(rule.substring(10));
        return typeof value === 'string' && value.length <= max;
      }

      if (rule.startsWith('pattern:')) {
        const pattern = rule.substring(8);
        return typeof value === 'string' && new RegExp(pattern).test(value);
      }

      if (rule.startsWith('in:')) {
        const options = rule.substring(3).split(',');
        return options.includes(String(value));
      }

      if (rule === 'positive') {
        return typeof value === 'number' && value > 0;
      }

      if (rule === 'negative') {
        return typeof value === 'number' && value < 0;
      }

      if (rule === 'integer') {
        return typeof value === 'number' && Number.isInteger(value);
      }

      // Default to true for unknown rules
      return true;
    } catch {
      return true; // Don't fail on rule evaluation errors
    }
  }
}
