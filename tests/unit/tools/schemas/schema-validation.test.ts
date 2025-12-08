/**
 * JSON Schema Validation Tests (v5.0.0)
 * Comprehensive tests for hand-written JSON Schema draft 2020-12 compatibility
 *
 * Purpose: Verify hand-written schemas are valid and complete
 * Critical: These tests verify the structure of our hand-written schemas
 */

import { describe, it, expect } from 'vitest';
import {
  toolList,
  tools,
  toolSchemas,
} from '../../../../src/tools/definitions.js';

/**
 * JSON Schema 2020-12 Compliance Tests
 * These tests verify MCP protocol compatibility
 */
describe('JSON Schema 2020-12 Compliance', () => {
  describe('All Tools Schema Generation', () => {
    it('should generate valid JSON schemas for all 12 tools', () => {
      expect(toolList).toHaveLength(12);

      for (const tool of toolList) {
        const schema = (tool as any).inputSchema;

        // Schema must exist
        expect(schema).toBeDefined();
        expect(schema).not.toBeNull();

        // Schema must be an object
        expect(typeof schema).toBe('object');

        // Schema must have type: "object"
        expect(schema.type).toBe('object');

        // Schema must have properties
        expect(schema.properties).toBeDefined();
        expect(typeof schema.properties).toBe('object');
        expect(Object.keys(schema.properties).length).toBeGreaterThan(0);

        // Schema should NOT have $schema property (MCP doesn't support it)
        expect(schema).not.toHaveProperty('$schema');
      }
    });

    it('should have valid property definitions', () => {
      for (const tool of toolList) {
        const schema = (tool as any).inputSchema;
        const properties = schema.properties;

        for (const [propName, propDef] of Object.entries(properties)) {
          // Each property must be an object
          expect(typeof propDef).toBe('object');

          // Each property should have a type or anyOf/oneOf/allOf
          const prop = propDef as any;
          const hasType = 'type' in prop || 'anyOf' in prop || 'oneOf' in prop || 'allOf' in prop;
          expect(hasType).toBe(true);
        }
      }
    });

    it('should have required fields specified', () => {
      for (const tool of toolList) {
        const schema = (tool as any).inputSchema;

        // Required can be an array or undefined, but must be consistent
        if (schema.required) {
          expect(Array.isArray(schema.required)).toBe(true);

          // All required fields must exist in properties
          for (const reqField of schema.required) {
            expect(schema.properties).toHaveProperty(reqField);
          }
        }
      }
    });
  });

  describe('Individual Tool Schema Structure', () => {
    it('deepthinking_standard should have complete schema', () => {
      const tool = tools.deepthinking_standard;
      const schema = (tool as any).inputSchema;

      expect(schema.type).toBe('object');
      expect(schema.properties).toHaveProperty('thought');
      expect(schema.properties).toHaveProperty('thoughtNumber');
      expect(schema.properties).toHaveProperty('totalThoughts');
      expect(schema.properties).toHaveProperty('nextThoughtNeeded');
      expect(schema.properties).toHaveProperty('mode');

      // Should have at least 10+ properties for all optional fields
      expect(Object.keys(schema.properties).length).toBeGreaterThanOrEqual(10);
    });

    it('deepthinking_mathematics should have mathematics-specific fields', () => {
      const tool = tools.deepthinking_mathematics;
      const schema = (tool as any).inputSchema;

      expect(schema.type).toBe('object');
      expect(schema.properties).toHaveProperty('thought');
      expect(schema.properties).toHaveProperty('mode');

      // Math-specific fields (actual property names from mathematics.ts)
      expect(schema.properties).toHaveProperty('proofStrategy');
      expect(schema.properties).toHaveProperty('mathematicalModel');
      expect(schema.properties).toHaveProperty('tensorProperties');

      // Should have 15+ properties
      expect(Object.keys(schema.properties).length).toBeGreaterThanOrEqual(15);
    });

    it('deepthinking_temporal should have temporal fields', () => {
      const tool = tools.deepthinking_temporal;
      const schema = (tool as any).inputSchema;

      expect(schema.type).toBe('object');
      expect(schema.properties).toHaveProperty('timeline');
      expect(schema.properties).toHaveProperty('events');
      expect(schema.properties).toHaveProperty('constraints'); // Matches Zod schema
      expect(schema.properties).toHaveProperty('intervals'); // Temporal intervals
      expect(schema.properties).toHaveProperty('relations'); // Temporal relations

      // Should have 15+ properties (base + temporal-specific: timeline, events, constraints, intervals, relations)
      expect(Object.keys(schema.properties).length).toBeGreaterThanOrEqual(15);
    });

    it('deepthinking_probabilistic should have probability fields', () => {
      const tool = tools.deepthinking_probabilistic;
      const schema = (tool as any).inputSchema;

      expect(schema.type).toBe('object');
      expect(schema.properties).toHaveProperty('mode');
      expect(schema.properties).toHaveProperty('thought');

      // Probabilistic-specific fields (Bayesian or Evidential)
      expect(schema.properties).toHaveProperty('frameOfDiscernment');
      expect(schema.properties).toHaveProperty('massFunction'); // Updated: was 'beliefMasses'
      expect(schema.properties).toHaveProperty('priorProbability'); // Bayesian mode
      expect(schema.properties).toHaveProperty('posteriorProbability'); // Bayesian mode

      // Should have 12+ properties
      expect(Object.keys(schema.properties).length).toBeGreaterThanOrEqual(12);
    });

    it('deepthinking_causal should have base fields', () => {
      const tool = tools.deepthinking_causal;
      const schema = (tool as any).inputSchema;

      expect(schema.type).toBe('object');
      expect(schema.properties).toHaveProperty('mode');
      expect(schema.properties).toHaveProperty('thought');
      expect(schema.properties).toHaveProperty('thoughtNumber');

      // Causal schema extends base with mode enum (abductive moved to core in v5.0.0)
      const modeProp = schema.properties.mode as any;
      expect(modeProp.enum).toContain('causal');
      expect(modeProp.enum).toContain('counterfactual');

      // Should have 10+ properties
      expect(Object.keys(schema.properties).length).toBeGreaterThanOrEqual(10);
    });

    it('deepthinking_session should have action field', () => {
      const tool = tools.deepthinking_session;
      const schema = (tool as any).inputSchema;

      expect(schema.type).toBe('object');
      expect(schema.properties).toHaveProperty('action');
      expect(schema.properties).toHaveProperty('sessionId');

      // Action should have enum of valid actions
      const actionProp = schema.properties.action as any;
      expect(actionProp).toHaveProperty('enum');
    });
  });

  // Note: Property count test removed - hand-written schemas may have different counts
  // What matters is that all required properties are present, not exact counts
});

/**
 * NOTE: v4.4.0+ uses hand-written JSON schemas following the pattern of
 * working MCP servers (memory-mcp, sequential-thinking-mcp).
 * Tests for zod-to-json-schema generation and lazy-loading removed as they
 * are no longer relevant.
 */

/**
 * MCP Protocol Compliance Tests
 * Verify schemas meet MCP server requirements
 */
describe('MCP Protocol Compliance', () => {
  it('should have valid tool names', () => {
    for (const tool of toolList) {
      const name = (tool as any).name;
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
      expect(name).toMatch(/^deepthinking_[a-z]+$/);
    }
  });

  it('should have descriptions', () => {
    for (const tool of toolList) {
      const description = (tool as any).description;
      expect(typeof description).toBe('string');
      expect(description.length).toBeGreaterThan(0);
    }
  });

  it('should have inputSchema field', () => {
    for (const tool of toolList) {
      expect(tool).toHaveProperty('inputSchema');
      expect((tool as any).inputSchema).toBeDefined();
    }
  });

  it('should not have additional unexpected fields', () => {
    for (const tool of toolList) {
      const keys = Object.keys(tool);
      expect(keys).toContain('name');
      expect(keys).toContain('description');
      expect(keys).toContain('inputSchema');

      // MCP tools should only have these 3 fields
      expect(keys.length).toBe(3);
    }
  });
});
