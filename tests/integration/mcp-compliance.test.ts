/**
 * MCP Protocol Compliance Tests
 *
 * Tests that the deepthinking MCP tools properly implement the MCP protocol:
 * - Tool definition structure (9 focused tools + 1 legacy)
 * - Schema validation
 * - Mode coverage (18 modes)
 * - Input/output contracts
 *
 * Note: v4.0.0 split the monolithic tool into 9 focused tools.
 * The legacy 'deepthinking' tool is deprecated but maintained for backward compatibility.
 */

import { describe, it, expect } from 'vitest';
import { thinkingTool, ThinkingToolSchema } from '../../src/tools/thinking.js';
import { toolList, tools } from '../../src/tools/definitions.js';

describe('MCP Protocol Compliance', () => {
  describe('Tool Definition', () => {
    it('should have required MCP tool properties', () => {
      expect(thinkingTool).toHaveProperty('name');
      expect(thinkingTool).toHaveProperty('description');
      expect(thinkingTool).toHaveProperty('inputSchema');

      expect(typeof thinkingTool.name).toBe('string');
      expect(typeof thinkingTool.description).toBe('string');
      expect(typeof thinkingTool.inputSchema).toBe('object');
    });

    it('should have descriptive name and description', () => {
      // Legacy tool is deprecated but still functional
      expect(thinkingTool.name).toBe('deepthinking');
      expect(thinkingTool.description.length).toBeGreaterThan(50);
      expect(thinkingTool.description).toContain('DEPRECATED');
    });

    it('should have 9 focused tools in v4.0.0', () => {
      expect(toolList).toHaveLength(9);

      const toolNames = toolList.map((t: any) => t.name);
      expect(toolNames).toContain('deepthinking_core');
      expect(toolNames).toContain('deepthinking_math');
      expect(toolNames).toContain('deepthinking_temporal');
      expect(toolNames).toContain('deepthinking_probabilistic');
      expect(toolNames).toContain('deepthinking_causal');
      expect(toolNames).toContain('deepthinking_strategic');
      expect(toolNames).toContain('deepthinking_analytical');
      expect(toolNames).toContain('deepthinking_scientific');
      expect(toolNames).toContain('deepthinking_session');
    });

    it('should document modes across focused tools', () => {
      // Core modes documented in deepthinking_core
      expect(tools.deepthinking_core.description).toContain('sequential');
      expect(tools.deepthinking_core.description).toContain('shannon');
      expect(tools.deepthinking_core.description).toContain('hybrid');

      // Math modes documented in deepthinking_math
      expect(tools.deepthinking_math.description.toLowerCase()).toContain('math');

      // Temporal mode
      expect(tools.deepthinking_temporal.description.toLowerCase()).toContain('temporal');
    });

    it('should document session actions in deepthinking_session', () => {
      const sessionDesc = tools.deepthinking_session.description.toLowerCase();
      expect(sessionDesc).toContain('summarize');
      expect(sessionDesc).toContain('export');
    });
  });

  describe('Input Schema Validation', () => {
    it('should have valid JSON Schema structure', () => {
      const schema = thinkingTool.inputSchema;

      expect(schema.type).toBe('object');
      expect(schema.properties).toBeDefined();
      expect(schema.required).toBeDefined();
      expect(Array.isArray(schema.required)).toBe(true);
    });

    it('should require essential fields', () => {
      const required = thinkingTool.inputSchema.required as string[];

      expect(required).toContain('thought');
      expect(required).toContain('thoughtNumber');
      expect(required).toContain('totalThoughts');
      expect(required).toContain('nextThoughtNeeded');
    });

    it('should define properties with correct types', () => {
      const props = thinkingTool.inputSchema.properties;

      // Core fields
      expect(props.thought.type).toBe('string');
      expect(props.thoughtNumber.type).toBe('integer');
      expect(props.totalThoughts.type).toBe('integer');
      expect(props.nextThoughtNeeded.type).toBe('boolean');

      // Optional fields
      expect(props.sessionId).toBeDefined();
      expect(props.mode).toBeDefined();
      expect(props.action).toBeDefined();
    });

    it('should define mode enum with all 18 modes', () => {
      const modeEnum = thinkingTool.inputSchema.properties.mode.enum;

      expect(Array.isArray(modeEnum)).toBe(true);
      expect(modeEnum).toHaveLength(18);

      const expectedModes = [
        'sequential',
        'shannon',
        'mathematics',
        'physics',
        'hybrid',
        'abductive',
        'causal',
        'bayesian',
        'counterfactual',
        'analogical',
        'temporal',
        'gametheory',
        'evidential',
        'firstprinciples',
        'systemsthinking',
        'scientificmethod',
        'optimization',
        'formallogic',
      ];

      for (const mode of expectedModes) {
        expect(modeEnum).toContain(mode);
      }
    });

    it('should define action enum with all actions', () => {
      const actionEnum = thinkingTool.inputSchema.properties.action.enum;

      expect(Array.isArray(actionEnum)).toBe(true);

      const expectedActions = [
        'add_thought',
        'summarize',
        'export',
        'switch_mode',
        'get_session',
        'recommend_mode',
      ];

      for (const action of expectedActions) {
        expect(actionEnum).toContain(action);
      }
    });

    it('should define mode-specific properties', () => {
      const props = thinkingTool.inputSchema.properties;

      // Shannon mode
      expect(props.stage).toBeDefined();
      expect(props.stage.enum).toContain('problem_definition');
      expect(props.stage.enum).toContain('constraints');
      expect(props.stage.enum).toContain('model');
      expect(props.stage.enum).toContain('proof');
      expect(props.stage.enum).toContain('implementation');

      // Mathematics mode
      expect(props.mathematicalModel).toBeDefined();
      expect(props.proofStrategy).toBeDefined();
      expect(props.thoughtType).toBeDefined();

      // Physics mode
      expect(props.tensorProperties).toBeDefined();
      expect(props.physicalInterpretation).toBeDefined();

      // Uncertainty (Shannon, Bayesian, etc.)
      expect(props.uncertainty).toBeDefined();
      expect(props.uncertainty.type).toBe('number');
    });

    it('should define complex nested structures', () => {
      const props = thinkingTool.inputSchema.properties;

      // Mathematical model structure
      expect(props.mathematicalModel.type).toBe('object');
      expect(props.mathematicalModel.properties.latex).toBeDefined();
      expect(props.mathematicalModel.properties.symbolic).toBeDefined();

      // Proof strategy structure
      expect(props.proofStrategy.type).toBe('object');
      expect(props.proofStrategy.properties.type).toBeDefined();
      expect(props.proofStrategy.properties.steps).toBeDefined();

      // Tensor properties structure
      expect(props.tensorProperties.type).toBe('object');
      expect(props.tensorProperties.properties.rank).toBeDefined();
      expect(props.tensorProperties.properties.components).toBeDefined();
    });
  });

  describe('Zod Schema Validation', () => {
    it('should accept valid sequential input', () => {
      const validInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'sequential',
      };

      const result = ThinkingToolSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should accept valid mathematics input', () => {
      const validInput = {
        thought: 'Theorem statement',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: 'mathematics',
        thoughtType: 'theorem_statement',
        mathematicalModel: {
          latex: '\\forall x \\in \\mathbb{R}, x^2 \\geq 0',
          symbolic: 'forall x: x^2 >= 0',
        },
      };

      const result = ThinkingToolSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidInput = {
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        // Missing 'thought' field
      };

      const result = ThinkingToolSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject invalid types', () => {
      const invalidInput = {
        thought: 'Test',
        thoughtNumber: 'not a number', // Wrong type
        totalThoughts: 1,
        nextThoughtNeeded: false,
      };

      const result = ThinkingToolSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should validate uncertainty range', () => {
      const validUncertainty = {
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        uncertainty: 0.5,
      };

      expect(ThinkingToolSchema.safeParse(validUncertainty).success).toBe(true);

      const invalidHigh = {
        ...validUncertainty,
        uncertainty: 1.5, // > 1
      };

      expect(ThinkingToolSchema.safeParse(invalidHigh).success).toBe(false);

      const invalidLow = {
        ...validUncertainty,
        uncertainty: -0.1, // < 0
      };

      expect(ThinkingToolSchema.safeParse(invalidLow).success).toBe(false);
    });

    it('should validate all 13 modes', () => {
      const modes = [
        'sequential',
        'shannon',
        'mathematics',
        'physics',
        'hybrid',
        'abductive',
        'causal',
        'bayesian',
        'counterfactual',
        'analogical',
        'temporal',
        'gametheory',
        'evidential',
      ];

      for (const mode of modes) {
        const input = {
          thought: `Test ${mode} mode`,
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          mode,
        };

        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Export Format Support', () => {
    it('should document export formats in session tool', () => {
      const description = tools.deepthinking_session.description.toLowerCase();
      expect(description).toContain('export');
    });

    it('should define exportFormat property', () => {
      const props = thinkingTool.inputSchema.properties;
      expect(props.exportFormat).toBeDefined();
      expect(props.exportFormat.enum).toBeDefined();
    });
  });

  describe('Schema Completeness', () => {
    it('should define all Phase 3 mode-specific properties', () => {
      const props = thinkingTool.inputSchema.properties;

      // Temporal reasoning
      expect(props.events).toBeDefined();
      expect(props.timeline).toBeDefined();
      expect(props.constraints).toBeDefined();

      // Game theory
      expect(props.players).toBeDefined();
      expect(props.strategies).toBeDefined();
      expect(props.payoffMatrix).toBeDefined();

      // Evidential reasoning (may be beliefFunctions in auto-generated schema)
      expect(props.beliefFunctions || props.beliefMasses).toBeDefined();
      expect(props.frameOfDiscernment).toBeDefined();
    });

    it('should maintain backward compatibility', () => {
      // All v1.0 fields should still be supported
      const v1Fields = ['thought', 'thoughtNumber', 'totalThoughts', 'nextThoughtNeeded', 'mode'];

      const props = thinkingTool.inputSchema.properties;
      for (const field of v1Fields) {
        expect(props[field]).toBeDefined();
      }
    });
  });
});
