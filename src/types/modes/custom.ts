/**
 * Custom Reasoning Mode - Type Definitions
 * Phase 10 Sprint 3 (v8.4.0) - User-defined reasoning patterns
 */

import { BaseThought, ThinkingMode } from '../core.js';

/**
 * Custom thought extends base thought with flexible user-defined structures
 */
export interface CustomThought extends BaseThought {
  mode: ThinkingMode.CUSTOM;
  thoughtType: string;

  /** Name of the custom reasoning mode */
  customModeName: string;

  /** Description of the custom mode */
  customModeDescription?: string;

  /** User-defined fields */
  customFields: CustomField[];

  /** Custom processing stages */
  stages?: CustomStage[];

  /** Current stage identifier */
  currentStage?: string;

  /** Custom validation rules */
  validationRules?: CustomValidationRule[];

  /** Extension metadata */
  metadata: Record<string, unknown>;

  /** Modes this custom mode is based on */
  basedOnModes?: ThinkingMode[];
}

/**
 * A custom field definition
 */
export interface CustomField {
  name: string;
  type: CustomFieldType;
  value: unknown;
  description?: string;
  required?: boolean;
}

/**
 * Custom field types
 */
export type CustomFieldType = 'string' | 'number' | 'boolean' | 'array' | 'object';

/**
 * A custom stage in the reasoning process
 */
export interface CustomStage {
  id: string;
  name: string;
  description: string;
  order: number;
  completed: boolean;
}

/**
 * A custom validation rule
 */
export interface CustomValidationRule {
  field: string;
  rule: string;
  message: string;
}

/**
 * Type guard for Custom thoughts
 */
export function isCustomThought(thought: BaseThought): thought is CustomThought {
  return thought.mode === ThinkingMode.CUSTOM;
}
