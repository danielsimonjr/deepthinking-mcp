/**
 * CustomHandler Unit Tests - Phase 15 (v8.4.0)
 *
 * Tests for the Custom reasoning handler:
 * - User-defined reasoning structures
 * - Flexible field definitions and validation
 * - Stage-based progress tracking
 * - Custom validation rules
 * - Mode composition
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CustomHandler } from '../../../../src/modes/handlers/CustomHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('CustomHandler', () => {
  let handler: CustomHandler;

  beforeEach(() => {
    handler = new CustomHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.CUSTOM);
    });

    it('should have correct modeName', () => {
      expect(handler.modeName).toBe('Custom Reasoning');
    });

    it('should have descriptive description', () => {
      expect(handler.description).toContain('User-defined');
      expect(handler.description).toContain('flexible');
    });
  });

  describe('createThought', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Custom analysis step',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'custom',
    };

    it('should create thought with default values', () => {
      const thought = handler.createThought(baseInput, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.CUSTOM);
      expect(thought.thoughtType).toBe('custom_analysis');
      expect(thought.customModeName).toBe('Custom Mode');
      expect(thought.customFields).toEqual([]);
      expect(thought.metadata).toEqual({});
    });

    it('should create thought with custom mode name', () => {
      const input = { ...baseInput, customModeName: 'Domain Analyzer' } as any;
      const thought = handler.createThought(input, 'session-123');

      expect(thought.customModeName).toBe('Domain Analyzer');
    });

    it('should include custom mode description', () => {
      const input = {
        ...baseInput,
        customModeName: 'Domain Analyzer',
        customModeDescription: 'Analyzes domain-specific patterns',
      } as any;
      const thought = handler.createThought(input, 'session-123');

      expect(thought.customModeDescription).toBe('Analyzes domain-specific patterns');
    });

    it('should process custom fields', () => {
      const input = {
        ...baseInput,
        customFields: [
          { name: 'priority', type: 'number', value: 5, description: 'Task priority' },
          { name: 'tags', type: 'array', value: ['urgent', 'review'] },
          { name: 'approved', type: 'boolean', value: true },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.customFields).toHaveLength(3);
      expect(thought.customFields[0].name).toBe('priority');
      expect(thought.customFields[0].type).toBe('number');
      expect(thought.customFields[0].value).toBe(5);
    });

    it('should normalize field types', () => {
      const input = {
        ...baseInput,
        customFields: [
          { name: 'unknown', type: 'invalid_type', value: 'test' },
          { name: 'noType', value: 'test' },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      // Invalid types default to 'string'
      expect(thought.customFields[0].type).toBe('string');
      expect(thought.customFields[1].type).toBe('string');
    });

    it('should process custom stages', () => {
      const input = {
        ...baseInput,
        stages: [
          { id: 'init', name: 'Initialization', description: 'Set up the analysis' },
          { id: 'process', name: 'Processing', description: 'Process the data', completed: true },
          { id: 'conclude', name: 'Conclusion', description: 'Draw conclusions' },
        ],
        currentStage: 'process',
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.stages).toHaveLength(3);
      expect(thought.stages![0].id).toBe('init');
      expect(thought.stages![1].completed).toBe(true);
      expect(thought.currentStage).toBe('process');
    });

    it('should assign default order to stages', () => {
      const input = {
        ...baseInput,
        stages: [
          { id: 'a', name: 'Stage A' },
          { id: 'b', name: 'Stage B' },
          { id: 'c', name: 'Stage C' },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.stages![0].order).toBe(0);
      expect(thought.stages![1].order).toBe(1);
      expect(thought.stages![2].order).toBe(2);
    });

    it('should process validation rules', () => {
      const input = {
        ...baseInput,
        validationRules: [
          { field: 'score', rule: 'min:0', message: 'Score must be non-negative' },
          { field: 'name', rule: 'required', message: 'Name is required' },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.validationRules).toHaveLength(2);
      expect(thought.validationRules![0].rule).toBe('min:0');
    });

    it('should process based-on modes', () => {
      const input = {
        ...baseInput,
        basedOnModes: ['bayesian', 'causal'],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.basedOnModes).toContain(ThinkingMode.BAYESIAN);
      expect(thought.basedOnModes).toContain(ThinkingMode.CAUSAL);
    });

    it('should resolve unknown modes to sequential', () => {
      const input = {
        ...baseInput,
        basedOnModes: ['unknown_mode', 'bayesian'],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.basedOnModes![0]).toBe(ThinkingMode.SEQUENTIAL);
      expect(thought.basedOnModes![1]).toBe(ThinkingMode.BAYESIAN);
    });

    it('should store metadata', () => {
      const input = {
        ...baseInput,
        metadata: {
          version: '1.0',
          author: 'test_user',
          customData: { nested: true },
        },
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.metadata.version).toBe('1.0');
      expect(thought.metadata.author).toBe('test_user');
      expect(thought.metadata.customData).toEqual({ nested: true });
    });
  });

  describe('validate', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Custom analysis',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'custom',
    };

    it('should return valid for well-formed input', () => {
      const input = { ...baseInput, customModeName: 'My Mode' } as any;
      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should fail for empty thought', () => {
      const input = { ...baseInput, thought: '' };
      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should fail when thought number exceeds total', () => {
      const input = { ...baseInput, thoughtNumber: 10, totalThoughts: 5 };
      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'INVALID_THOUGHT_NUMBER')).toBe(true);
    });

    it('should warn when no custom mode name provided', () => {
      const result = handler.validate(baseInput);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'customModeName')).toBe(true);
    });

    it('should warn about required fields without values', () => {
      const input = {
        ...baseInput,
        customFields: [{ name: 'required_field', type: 'string', required: true, value: undefined }],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('Required field'))).toBe(true);
    });

    it('should warn about type mismatch in custom fields', () => {
      const input = {
        ...baseInput,
        customFields: [{ name: 'count', type: 'number', value: 'not a number' }],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('type mismatch'))).toBe(true);
    });

    it('should warn about duplicate stage IDs', () => {
      const input = {
        ...baseInput,
        stages: [
          { id: 'stage1', name: 'First Stage' },
          { id: 'stage1', name: 'Duplicate Stage' },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('Duplicate stage ID'))).toBe(true);
    });

    it('should warn when current stage not found', () => {
      const input = {
        ...baseInput,
        stages: [{ id: 'stage1', name: 'First Stage' }],
        currentStage: 'nonexistent',
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('not found in stages'))).toBe(true);
    });

    describe('validation rules', () => {
      it('should validate required rule', () => {
        const input = {
          ...baseInput,
          customFields: [{ name: 'field1', type: 'string', value: '' }],
          validationRules: [{ field: 'field1', rule: 'required', message: 'Field is required' }],
        } as any;

        const result = handler.validate(input);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.message === 'Field is required')).toBe(true);
      });

      it('should validate min rule', () => {
        const input = {
          ...baseInput,
          customFields: [{ name: 'score', type: 'number', value: -5 }],
          validationRules: [{ field: 'score', rule: 'min:0', message: 'Score must be >= 0' }],
        } as any;

        const result = handler.validate(input);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.message === 'Score must be >= 0')).toBe(true);
      });

      it('should validate max rule', () => {
        const input = {
          ...baseInput,
          customFields: [{ name: 'rating', type: 'number', value: 15 }],
          validationRules: [{ field: 'rating', rule: 'max:10', message: 'Rating must be <= 10' }],
        } as any;

        const result = handler.validate(input);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.message === 'Rating must be <= 10')).toBe(true);
      });

      it('should validate minLength rule', () => {
        const input = {
          ...baseInput,
          customFields: [{ name: 'password', type: 'string', value: 'abc' }],
          validationRules: [
            { field: 'password', rule: 'minLength:8', message: 'Password too short' },
          ],
        } as any;

        const result = handler.validate(input);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.message === 'Password too short')).toBe(true);
      });

      it('should validate maxLength rule', () => {
        const input = {
          ...baseInput,
          customFields: [{ name: 'code', type: 'string', value: 'ABCDEFGHIJ' }],
          validationRules: [{ field: 'code', rule: 'maxLength:5', message: 'Code too long' }],
        } as any;

        const result = handler.validate(input);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.message === 'Code too long')).toBe(true);
      });

      it('should validate pattern rule', () => {
        const input = {
          ...baseInput,
          customFields: [{ name: 'email', type: 'string', value: 'not-an-email' }],
          validationRules: [
            { field: 'email', rule: 'pattern:^[^@]+@[^@]+$', message: 'Invalid email format' },
          ],
        } as any;

        const result = handler.validate(input);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.message === 'Invalid email format')).toBe(true);
      });

      it('should validate in rule', () => {
        const input = {
          ...baseInput,
          customFields: [{ name: 'status', type: 'string', value: 'unknown' }],
          validationRules: [
            { field: 'status', rule: 'in:active,inactive,pending', message: 'Invalid status' },
          ],
        } as any;

        const result = handler.validate(input);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.message === 'Invalid status')).toBe(true);
      });

      it('should validate positive rule', () => {
        const input = {
          ...baseInput,
          customFields: [{ name: 'quantity', type: 'number', value: 0 }],
          validationRules: [
            { field: 'quantity', rule: 'positive', message: 'Quantity must be positive' },
          ],
        } as any;

        const result = handler.validate(input);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.message === 'Quantity must be positive')).toBe(true);
      });

      it('should validate negative rule', () => {
        const input = {
          ...baseInput,
          customFields: [{ name: 'offset', type: 'number', value: 5 }],
          validationRules: [{ field: 'offset', rule: 'negative', message: 'Offset must be negative' }],
        } as any;

        const result = handler.validate(input);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.message === 'Offset must be negative')).toBe(true);
      });

      it('should validate integer rule', () => {
        const input = {
          ...baseInput,
          customFields: [{ name: 'count', type: 'number', value: 3.14 }],
          validationRules: [{ field: 'count', rule: 'integer', message: 'Count must be integer' }],
        } as any;

        const result = handler.validate(input);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.message === 'Count must be integer')).toBe(true);
      });

      it('should pass valid field values', () => {
        const input = {
          ...baseInput,
          customFields: [
            { name: 'score', type: 'number', value: 85 },
            { name: 'status', type: 'string', value: 'active' },
          ],
          validationRules: [
            { field: 'score', rule: 'min:0', message: 'Score must be >= 0' },
            { field: 'score', rule: 'max:100', message: 'Score must be <= 100' },
            { field: 'status', rule: 'in:active,inactive', message: 'Invalid status' },
          ],
        } as any;

        const result = handler.validate(input);

        expect(result.valid).toBe(true);
        // No warnings about validation rules since values are valid
        expect(result.warnings.some((w) => w.message.includes('Score'))).toBe(false);
        expect(result.warnings.some((w) => w.message.includes('status'))).toBe(false);
      });
    });
  });

  describe('getEnhancements', () => {
    const createThought = (overrides: any = {}) => {
      const baseInput: ThinkingToolInput = {
        thought: 'Custom reasoning step',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'custom',
        ...overrides,
      };
      return handler.createThought(baseInput, 'session-123');
    };

    it('should include mental models', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain('Domain-Specific Reasoning');
      expect(enhancements.mentalModels).toContain('Custom Frameworks');
    });

    it('should include related modes from basedOnModes', () => {
      const thought = createThought({
        basedOnModes: ['bayesian', 'temporal'],
      });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.BAYESIAN);
      expect(enhancements.relatedModes).toContain(ThinkingMode.TEMPORAL);
    });

    it('should default to sequential mode when no basedOnModes', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.SEQUENTIAL);
    });

    it('should include custom mode name in suggestions', () => {
      const thought = createThought({ customModeName: 'Business Analyzer' });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('Business Analyzer'))).toBe(true);
    });

    it('should include mode description in suggestions', () => {
      const thought = createThought({
        customModeName: 'Analyzer',
        customModeDescription: 'Analyzes business metrics',
      });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('business metrics'))).toBe(true);
    });

    it('should calculate stage progress', () => {
      const thought = createThought({
        stages: [
          { id: 's1', name: 'Stage 1', completed: true },
          { id: 's2', name: 'Stage 2', completed: true },
          { id: 's3', name: 'Stage 3', completed: false },
        ],
      });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('2/3'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('67%'))).toBe(true);
    });

    it('should identify current stage', () => {
      const thought = createThought({
        stages: [
          { id: 'init', name: 'Initialize' },
          { id: 'process', name: 'Processing' },
        ],
        currentStage: 'process',
      });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('Current stage: Processing'))).toBe(
        true
      );
    });

    it('should identify next incomplete stage', () => {
      const thought = createThought({
        stages: [
          { id: 's1', name: 'Stage 1', completed: true },
          { id: 's2', name: 'Stage 2', completed: false },
        ],
        currentStage: 's1',
      });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('Next stage: Stage 2'))).toBe(true);
    });

    it('should count custom fields', () => {
      const thought = createThought({
        customFields: [
          { name: 'field1', type: 'string', value: 'hello' },
          { name: 'field2', type: 'number', value: 42 },
          { name: 'field3', type: 'boolean', value: undefined },
        ],
      });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('2/3 populated'))).toBe(true);
      expect(enhancements.metrics!.fieldCount).toBe(3);
    });

    it('should warn about missing required fields', () => {
      const thought = createThought({
        customFields: [
          { name: 'optional', type: 'string', value: 'test' },
          { name: 'required_one', type: 'string', required: true, value: undefined },
          { name: 'required_two', type: 'number', required: true, value: null },
        ],
      });
      const enhancements = handler.getEnhancements(thought);

      expect(
        enhancements.warnings!.some((w) => w.includes('Missing required fields'))
      ).toBe(true);
      expect(enhancements.warnings!.some((w) => w.includes('required_one'))).toBe(true);
    });

    it('should provide guiding questions', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('fields defined'))).toBe(true);
      expect(enhancements.guidingQuestions!.some((q) => q.includes('predefined modes'))).toBe(
        true
      );
    });

    it('should provide current stage guiding questions', () => {
      const thought = createThought({
        stages: [{ id: 'analysis', name: 'Analysis Phase' }],
        currentStage: 'analysis',
      });
      const enhancements = handler.getEnhancements(thought);

      expect(
        enhancements.guidingQuestions!.some((q) => q.includes('Analysis Phase'))
      ).toBe(true);
    });

    it('should show based-on modes in suggestions', () => {
      const thought = createThought({
        basedOnModes: ['bayesian', 'causal', 'temporal'],
      });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('Based on:'))).toBe(true);
      expect(enhancements.mentalModels).toContain('Mode Composition');
    });

    it('should track metrics', () => {
      const thought = createThought({
        customFields: [{ name: 'f1', value: 1 }, { name: 'f2', value: 2 }],
        stages: [{ id: 's1', completed: true }, { id: 's2', completed: false }],
        metadata: { key1: 'value1', key2: 'value2', key3: 'value3' },
      });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.fieldCount).toBe(2);
      expect(enhancements.metrics!.stageCount).toBe(2);
      expect(enhancements.metrics!.completedStages).toBe(1);
      expect(enhancements.metrics!.metadataKeys).toBe(3);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support any thought type', () => {
      expect(handler.supportsThoughtType('custom_analysis')).toBe(true);
      expect(handler.supportsThoughtType('domain_specific')).toBe(true);
      expect(handler.supportsThoughtType('any_random_type')).toBe(true);
      expect(handler.supportsThoughtType('totally_made_up')).toBe(true);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle a complete custom reasoning workflow', () => {
      const sessionId = 'custom-workflow-session';

      // Define a custom project analysis mode
      const input = {
        thought: 'Analyzing project risks and opportunities',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'custom',
        customModeName: 'Project Risk Analyzer',
        customModeDescription: 'Evaluates project risks, opportunities, and provides recommendations',
        customFields: [
          { name: 'projectName', type: 'string', value: 'Phoenix Initiative', required: true },
          { name: 'riskLevel', type: 'number', value: 7, description: 'Risk level 1-10' },
          { name: 'opportunities', type: 'array', value: ['market expansion', 'new tech'] },
          { name: 'isApproved', type: 'boolean', value: false },
        ],
        stages: [
          { id: 'gather', name: 'Data Gathering', description: 'Collect project data', completed: true },
          { id: 'analyze', name: 'Risk Analysis', description: 'Analyze identified risks' },
          { id: 'report', name: 'Reporting', description: 'Generate final report' },
        ],
        currentStage: 'analyze',
        validationRules: [
          { field: 'riskLevel', rule: 'min:1', message: 'Risk level must be at least 1' },
          { field: 'riskLevel', rule: 'max:10', message: 'Risk level cannot exceed 10' },
        ],
        basedOnModes: ['bayesian', 'causal'],
        metadata: {
          projectId: 'PROJ-2024-001',
          analyst: 'system',
          version: '1.0',
        },
      } as any;

      const thought = handler.createThought(input, sessionId);
      const validation = handler.validate(input);
      const enhancements = handler.getEnhancements(thought);

      // Verify thought creation
      expect(thought.customModeName).toBe('Project Risk Analyzer');
      expect(thought.customFields).toHaveLength(4);
      expect(thought.stages).toHaveLength(3);
      expect(thought.basedOnModes).toContain(ThinkingMode.BAYESIAN);

      // Verify validation passes
      expect(validation.valid).toBe(true);

      // Verify enhancements
      expect(enhancements.metrics!.fieldCount).toBe(4);
      expect(enhancements.metrics!.stageCount).toBe(3);
      expect(enhancements.metrics!.completedStages).toBe(1);
      expect(enhancements.suggestions!.some((s) => s.includes('1/3'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('Risk Analysis'))).toBe(true);
    });

    it('should detect validation rule failures', () => {
      const sessionId = 'validation-test';

      const input = {
        thought: 'Testing validation',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
        mode: 'custom',
        customModeName: 'Validator Test',
        customFields: [
          { name: 'score', type: 'number', value: -5 },
          { name: 'name', type: 'string', value: '' },
          { name: 'code', type: 'string', value: 'ABCDEFGHIJ' },
        ],
        validationRules: [
          { field: 'score', rule: 'min:0', message: 'Score must be non-negative' },
          { field: 'name', rule: 'required', message: 'Name is required' },
          { field: 'code', rule: 'maxLength:5', message: 'Code too long' },
        ],
      } as any;

      const validation = handler.validate(input);

      expect(validation.valid).toBe(true); // Validation rules produce warnings, not errors
      expect(validation.warnings.some((w) => w.message === 'Score must be non-negative')).toBe(true);
      expect(validation.warnings.some((w) => w.message === 'Name is required')).toBe(true);
      expect(validation.warnings.some((w) => w.message === 'Code too long')).toBe(true);
    });

    it('should handle mode composition with multiple base modes', () => {
      const sessionId = 'composition-test';

      const input = {
        thought: 'Hybrid analysis combining multiple approaches',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'custom',
        customModeName: 'Multi-Modal Analyzer',
        basedOnModes: ['bayesian', 'causal', 'temporal', 'gametheory'],
        customFields: [
          { name: 'approach', type: 'string', value: 'integrated' },
        ],
      } as any;

      const thought = handler.createThought(input, sessionId);
      const enhancements = handler.getEnhancements(thought);

      expect(thought.basedOnModes).toHaveLength(4);
      expect(enhancements.relatedModes).toContain(ThinkingMode.BAYESIAN);
      expect(enhancements.relatedModes).toContain(ThinkingMode.GAMETHEORY);
      expect(enhancements.mentalModels).toContain('Mode Composition');
    });
  });
});
