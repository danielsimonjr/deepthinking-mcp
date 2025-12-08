/**
 * MCP Protocol Compliance Tests
 *
 * Tests that the deepthinking MCP tools properly implement the MCP protocol:
 * - Tool definition structure (12 focused tools + 1 legacy)
 * - Schema validation
 * - Mode coverage (29 modes with dedicated thought types)
 * - Input/output contracts
 *
 * Note: v4.0.0 split the monolithic tool into 9 focused tools.
 * v5.0.0 added deepthinking_core (inductive, deductive, abductive).
 * v7.5.0 added deepthinking_engineering (engineering, algorithmic) and
 *        deepthinking_academic (synthesis, argumentation, critique, analysis).
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

    it('should have 12 focused tools in v7.5.0', () => {
      expect(toolList).toHaveLength(12);

      const toolNames = toolList.map((t: any) => t.name);
      expect(toolNames).toContain('deepthinking_core');
      expect(toolNames).toContain('deepthinking_standard');
      expect(toolNames).toContain('deepthinking_mathematics');
      expect(toolNames).toContain('deepthinking_temporal');
      expect(toolNames).toContain('deepthinking_probabilistic');
      expect(toolNames).toContain('deepthinking_causal');
      expect(toolNames).toContain('deepthinking_strategic');
      expect(toolNames).toContain('deepthinking_analytical');
      expect(toolNames).toContain('deepthinking_scientific');
      expect(toolNames).toContain('deepthinking_engineering');
      expect(toolNames).toContain('deepthinking_academic');
      expect(toolNames).toContain('deepthinking_session');
    });

    it('should document modes across focused tools', () => {
      // Standard workflow modes documented in deepthinking_standard
      expect(tools.deepthinking_standard.description).toContain('sequential');
      expect(tools.deepthinking_standard.description).toContain('shannon');
      expect(tools.deepthinking_standard.description).toContain('hybrid');

      // Math modes documented in deepthinking_mathematics
      expect(tools.deepthinking_mathematics.description.toLowerCase()).toContain('math');

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

      // Core required fields
      expect(props.thought.type).toBe('string');
      expect(props.thoughtNumber.type).toBe('integer');
      expect(props.totalThoughts.type).toBe('integer');
      expect(props.nextThoughtNeeded.type).toBe('boolean');

      // Optional fields for backward compatibility
      expect(props.sessionId).toBeDefined();
      expect(props.mode).toBeDefined();

      // Note: Legacy tool is simplified - action and detailed mode properties removed
      // Users should migrate to deepthinking_* focused tools
    });

    it('should define mode enum with all 20 modes', () => {
      const modeEnum = thinkingTool.inputSchema.properties.mode.enum;

      expect(Array.isArray(modeEnum)).toBe(true);
      expect(modeEnum).toHaveLength(20);

      const expectedModes = [
        'sequential',
        'shannon',
        'mathematics',
        'physics',
        'hybrid',
        'inductive',
        'deductive',
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

    // Note: Legacy tool simplified - action and mode-specific properties removed
    // Tests removed as they're no longer relevant for the deprecated legacy tool
    // Users should use deepthinking_* focused tools which have proper mode-specific schemas

    // Note: Detailed nested structure tests removed - legacy tool is simplified
    // Use deepthinking_* focused tools for mode-specific schemas
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

    // Note: exportFormat removed from legacy tool - use deepthinking_session instead
  });

  describe('Schema Completeness', () => {
    // Note: Phase 3 mode-specific properties removed from legacy tool
    // Use deepthinking_* focused tools which have proper mode-specific schemas

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
