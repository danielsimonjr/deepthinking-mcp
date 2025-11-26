/**
 * Tool Definitions Tests (v4.0.0)
 * Sprint 6: Testing for new tool split architecture
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  tools,
  toolList,
  toolSchemas,
  modeToToolMap,
  getToolForMode,
  isValidTool,
  getSchemaForTool,
} from '../../../../src/tools/definitions.js';
import {
  getSchema,
  getToolDefinition,
  getLoadedTools,
  getAvailableTools,
  preloadSchemas,
  clearSchemaCache,
  getSchemaStats,
} from '../../../../src/tools/lazy-loader.js';
import { SCHEMA_VERSION, schemaMetadata, getDeprecationWarning } from '../../../../src/tools/schemas/version.js';

describe('Tool Definitions', () => {
  describe('tools object', () => {
    it('should have all 9 tools defined', () => {
      expect(Object.keys(tools)).toHaveLength(9);
    });

    it('should have correct tool names', () => {
      const expectedTools = [
        'deepthinking_core',
        'deepthinking_math',
        'deepthinking_temporal',
        'deepthinking_probabilistic',
        'deepthinking_causal',
        'deepthinking_strategic',
        'deepthinking_analytical',
        'deepthinking_scientific',
        'deepthinking_session',
      ];
      expect(Object.keys(tools)).toEqual(expectedTools);
    });

    it('should have valid tool definitions', () => {
      for (const [name, tool] of Object.entries(tools)) {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect((tool as { name: string }).name).toBe(name);
      }
    });
  });

  describe('toolList', () => {
    it('should contain all tools as array', () => {
      expect(toolList).toHaveLength(9);
    });

    it('should have valid MCP tool format', () => {
      for (const tool of toolList) {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(typeof (tool as { name: string }).name).toBe('string');
        expect(typeof (tool as { description: string }).description).toBe('string');
      }
    });
  });

  describe('toolSchemas', () => {
    it('should have schemas for all tools', () => {
      expect(Object.keys(toolSchemas)).toHaveLength(9);
    });

    it('should have parse method on each schema', () => {
      for (const schema of Object.values(toolSchemas)) {
        expect(typeof schema.parse).toBe('function');
      }
    });
  });

  describe('modeToToolMap', () => {
    it('should map all 18 modes', () => {
      const modes = [
        'sequential', 'shannon', 'hybrid',
        'mathematics', 'physics',
        'temporal',
        'bayesian', 'evidential',
        'causal', 'counterfactual', 'abductive',
        'gametheory', 'optimization',
        'analogical', 'firstprinciples',
        'scientificmethod', 'systemsthinking', 'formallogic',
      ];

      for (const mode of modes) {
        expect(modeToToolMap[mode]).toBeDefined();
      }
    });

    it('should map core modes correctly', () => {
      expect(modeToToolMap.sequential).toBe('deepthinking_core');
      expect(modeToToolMap.shannon).toBe('deepthinking_core');
      expect(modeToToolMap.hybrid).toBe('deepthinking_core');
    });

    it('should map math modes correctly', () => {
      expect(modeToToolMap.mathematics).toBe('deepthinking_math');
      expect(modeToToolMap.physics).toBe('deepthinking_math');
    });
  });

  describe('getToolForMode', () => {
    it('should return correct tool for each mode', () => {
      expect(getToolForMode('sequential')).toBe('deepthinking_core');
      expect(getToolForMode('temporal')).toBe('deepthinking_temporal');
      expect(getToolForMode('bayesian')).toBe('deepthinking_probabilistic');
    });

    it('should default to core for unknown modes', () => {
      expect(getToolForMode('unknown')).toBe('deepthinking_core');
    });
  });

  describe('isValidTool', () => {
    it('should return true for valid tools', () => {
      expect(isValidTool('deepthinking_core')).toBe(true);
      expect(isValidTool('deepthinking_temporal')).toBe(true);
    });

    it('should return false for invalid tools', () => {
      expect(isValidTool('invalid_tool')).toBe(false);
      expect(isValidTool('deepthinking')).toBe(false);
    });
  });

  describe('getSchemaForTool', () => {
    it('should return schema for valid tool', () => {
      const schema = getSchemaForTool('deepthinking_core');
      expect(schema).toBeDefined();
      expect(typeof schema.parse).toBe('function');
    });

    it('should throw for invalid tool', () => {
      expect(() => getSchemaForTool('invalid')).toThrow('Unknown tool: invalid');
    });
  });
});

describe('Lazy Schema Loader', () => {
  beforeEach(() => {
    clearSchemaCache();
  });

  describe('getAvailableTools', () => {
    it('should return all 9 tools', () => {
      const available = getAvailableTools();
      expect(available).toHaveLength(9);
    });
  });

  describe('getLoadedTools', () => {
    it('should start empty', () => {
      expect(getLoadedTools()).toHaveLength(0);
    });

    it('should track loaded tools', async () => {
      await getSchema('deepthinking_core');
      expect(getLoadedTools()).toContain('deepthinking_core');
    });
  });

  describe('getSchema', () => {
    it('should load schema on demand', async () => {
      const { schema, tool } = await getSchema('deepthinking_temporal');
      expect(schema).toBeDefined();
      expect(tool).toBeDefined();
      expect(typeof schema.parse).toBe('function');
    });

    it('should throw for unknown tool', async () => {
      await expect(getSchema('unknown')).rejects.toThrow('Unknown tool: unknown');
    });

    it('should cache loaded schemas', async () => {
      await getSchema('deepthinking_core');
      await getSchema('deepthinking_core');
      expect(getLoadedTools().filter(t => t === 'deepthinking_core')).toHaveLength(1);
    });
  });

  describe('getToolDefinition', () => {
    it('should return tool definition', async () => {
      const tool = await getToolDefinition('deepthinking_math');
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('inputSchema');
    });
  });

  describe('preloadSchemas', () => {
    it('should preload specified schemas', async () => {
      await preloadSchemas(['deepthinking_core', 'deepthinking_math']);
      expect(getLoadedTools()).toContain('deepthinking_core');
      expect(getLoadedTools()).toContain('deepthinking_math');
    });
  });

  describe('getSchemaStats', () => {
    it('should return correct stats', async () => {
      await getSchema('deepthinking_core');
      await getSchema('deepthinking_temporal');

      const stats = getSchemaStats();
      expect(stats.loaded).toBe(2);
      expect(stats.available).toBe(9);
      expect(stats.loadedNames).toContain('deepthinking_core');
      expect(stats.loadedNames).toContain('deepthinking_temporal');
    });
  });
});

describe('Schema Versioning', () => {
  describe('SCHEMA_VERSION', () => {
    it('should be version 4.0.0', () => {
      expect(SCHEMA_VERSION).toBe('4.0.0');
    });
  });

  describe('schemaMetadata', () => {
    it('should have correct structure', () => {
      expect(schemaMetadata).toHaveProperty('version');
      expect(schemaMetadata).toHaveProperty('breakingChanges');
      expect(schemaMetadata).toHaveProperty('deprecated');
      expect(schemaMetadata).toHaveProperty('tools');
    });

    it('should list all tools', () => {
      expect(schemaMetadata.tools).toHaveLength(9);
    });

    it('should have deprecation for old tool', () => {
      const deprecated = schemaMetadata.deprecated.find(d => d.tool === 'deepthinking');
      expect(deprecated).toBeDefined();
      expect(deprecated?.replacement).toBe('deepthinking_*');
    });
  });

  describe('getDeprecationWarning', () => {
    it('should return warning for deprecated tool', () => {
      const warning = getDeprecationWarning('deepthinking');
      expect(warning).toContain('DEPRECATED');
      expect(warning).toContain('deepthinking_*');
    });

    it('should return null for non-deprecated tool', () => {
      const warning = getDeprecationWarning('deepthinking_core');
      expect(warning).toBeNull();
    });
  });
});

describe('Schema Validation', () => {
  describe('CoreSchema', () => {
    it('should validate valid core input', async () => {
      const { schema } = await getSchema('deepthinking_core');
      const input = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'sequential',
      };
      expect(() => schema.parse(input)).not.toThrow();
    });

    it('should reject invalid mode', async () => {
      const { schema } = await getSchema('deepthinking_core');
      const input = {
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        mode: 'temporal', // wrong mode for core schema
      };
      expect(() => schema.parse(input)).toThrow();
    });
  });

  describe('TemporalSchema', () => {
    it('should validate temporal input with timeline', async () => {
      const { schema } = await getSchema('deepthinking_temporal');
      const input = {
        thought: 'Analyzing timeline',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'temporal',
        timeline: {
          id: 'timeline-1',
          name: 'Project Timeline',
          timeUnit: 'days',
          events: ['start', 'end'],
        },
      };
      expect(() => schema.parse(input)).not.toThrow();
    });
  });

  describe('SessionActionSchema', () => {
    it('should validate session action', async () => {
      const { schema } = await getSchema('deepthinking_session');
      const input = {
        action: 'summarize',
        sessionId: 'test-session',
      };
      expect(() => schema.parse(input)).not.toThrow();
    });

    it('should validate export action with format', async () => {
      const { schema } = await getSchema('deepthinking_session');
      const input = {
        action: 'export',
        sessionId: 'test-session',
        exportFormat: 'markdown',
      };
      expect(() => schema.parse(input)).not.toThrow();
    });
  });
});
