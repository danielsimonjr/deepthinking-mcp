/**
 * Tool Definitions Tests (v8.4.0)
 * Testing for hand-written schema architecture
 * Phase 12 Sprint 3: Added deepthinking_analyze (13 total tools)
 */

import { describe, it, expect } from 'vitest';
import {
  tools,
  toolList,
  toolSchemas,
  modeToToolMap,
  getToolForMode,
  isValidTool,
  getSchemaForTool,
} from '../../../../src/tools/definitions.js';
describe('Tool Definitions', () => {
  describe('tools object', () => {
    it('should have all 13 tools defined', () => {
      expect(Object.keys(tools)).toHaveLength(13);
    });

    it('should have correct tool names', () => {
      const expectedTools = [
        'deepthinking_core',
        'deepthinking_standard',
        'deepthinking_mathematics',
        'deepthinking_temporal',
        'deepthinking_probabilistic',
        'deepthinking_causal',
        'deepthinking_strategic',
        'deepthinking_analytical',
        'deepthinking_scientific',
        'deepthinking_engineering',
        'deepthinking_academic',
        'deepthinking_session',
        'deepthinking_analyze',
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
      expect(toolList).toHaveLength(13);
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
      expect(Object.keys(toolSchemas)).toHaveLength(13);
    });

    it('should have parse method on each schema', () => {
      for (const schema of Object.values(toolSchemas)) {
        expect(typeof schema.parse).toBe('function');
      }
    });
  });

  describe('modeToToolMap', () => {
    it('should map all 29 modes with dedicated thought types', () => {
      const modes = [
        'sequential', 'shannon', 'hybrid',
        'mathematics', 'physics', 'computability',
        'inductive', 'deductive', 'abductive',
        'temporal',
        'bayesian', 'evidential',
        'causal', 'counterfactual',
        'gametheory', 'optimization',
        'analogical', 'firstprinciples', 'metareasoning', 'cryptanalytic',
        'scientificmethod', 'systemsthinking', 'formallogic',
        'engineering', 'algorithmic',
        'synthesis', 'argumentation', 'critique', 'analysis',
      ];

      for (const mode of modes) {
        expect(modeToToolMap[mode]).toBeDefined();
      }
    });

    it('should map standard workflow modes correctly', () => {
      expect(modeToToolMap.sequential).toBe('deepthinking_standard');
      expect(modeToToolMap.shannon).toBe('deepthinking_standard');
      expect(modeToToolMap.hybrid).toBe('deepthinking_standard');
    });

    it('should map core reasoning modes correctly', () => {
      expect(modeToToolMap.inductive).toBe('deepthinking_core');
      expect(modeToToolMap.deductive).toBe('deepthinking_core');
      expect(modeToToolMap.abductive).toBe('deepthinking_core');
    });

    it('should map math modes correctly', () => {
      expect(modeToToolMap.mathematics).toBe('deepthinking_mathematics');
      expect(modeToToolMap.physics).toBe('deepthinking_mathematics');
    });

    it('should map engineering modes correctly', () => {
      expect(modeToToolMap.engineering).toBe('deepthinking_engineering');
      expect(modeToToolMap.algorithmic).toBe('deepthinking_engineering');
    });

    it('should map academic modes correctly', () => {
      expect(modeToToolMap.synthesis).toBe('deepthinking_academic');
      expect(modeToToolMap.argumentation).toBe('deepthinking_academic');
      expect(modeToToolMap.critique).toBe('deepthinking_academic');
      expect(modeToToolMap.analysis).toBe('deepthinking_academic');
    });
  });

  describe('getToolForMode', () => {
    it('should return correct tool for each mode', () => {
      expect(getToolForMode('sequential')).toBe('deepthinking_standard');
      expect(getToolForMode('temporal')).toBe('deepthinking_temporal');
      expect(getToolForMode('bayesian')).toBe('deepthinking_probabilistic');
    });

    it('should default to standard for unknown modes', () => {
      expect(getToolForMode('unknown')).toBe('deepthinking_standard');
    });
  });

  describe('isValidTool', () => {
    it('should return true for valid tools', () => {
      expect(isValidTool('deepthinking_standard')).toBe(true);
      expect(isValidTool('deepthinking_temporal')).toBe(true);
      expect(isValidTool('deepthinking_engineering')).toBe(true);
      expect(isValidTool('deepthinking_academic')).toBe(true);
    });

    it('should return false for invalid tools', () => {
      expect(isValidTool('invalid_tool')).toBe(false);
      expect(isValidTool('deepthinking')).toBe(false);
    });

    it('should return true for deepthinking_analyze', () => {
      expect(isValidTool('deepthinking_analyze')).toBe(true);
    });
  });

  describe('getSchemaForTool', () => {
    it('should return schema for valid tool', () => {
      const schema = getSchemaForTool('deepthinking_standard');
      expect(schema).toBeDefined();
      expect(typeof schema.parse).toBe('function');
    });

    it('should throw for invalid tool', () => {
      expect(() => getSchemaForTool('invalid')).toThrow('Unknown tool: invalid');
    });
  });
});

describe('Schema Validation', () => {
  describe('CoreSchema', () => {
    it('should validate valid core input', () => {
      const schema = getSchemaForTool('deepthinking_standard');
      const input = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'sequential',
      };
      expect(() => schema.parse(input)).not.toThrow();
    });

    it('should reject invalid mode', () => {
      const schema = getSchemaForTool('deepthinking_standard');
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
    it('should validate temporal input with timeline', () => {
      const schema = getSchemaForTool('deepthinking_temporal');
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
    it('should validate session action', () => {
      const schema = getSchemaForTool('deepthinking_session');
      const input = {
        action: 'summarize',
        sessionId: 'test-session',
      };
      expect(() => schema.parse(input)).not.toThrow();
    });

    it('should validate export action with format', () => {
      const schema = getSchemaForTool('deepthinking_session');
      const input = {
        action: 'export',
        sessionId: 'test-session',
        exportFormat: 'markdown',
      };
      expect(() => schema.parse(input)).not.toThrow();
    });
  });

  describe('AcademicSchema', () => {
    it('should validate synthesis input', () => {
      const schema = getSchemaForTool('deepthinking_academic');
      const input = {
        thought: 'Synthesizing literature on AI safety',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'synthesis',
        sources: [{ id: 'src-1', title: 'AI Safety Survey' }],
      };
      expect(() => schema.parse(input)).not.toThrow();
    });

    it('should validate argumentation input', () => {
      const schema = getSchemaForTool('deepthinking_academic');
      const input = {
        thought: 'Building argument for thesis',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'argumentation',
        claims: [{ id: 'claim-1', statement: 'AI systems require safety constraints' }],
      };
      expect(() => schema.parse(input)).not.toThrow();
    });
  });

  describe('AnalyzeSchema', () => {
    it('should validate analyze input with preset', () => {
      const schema = getSchemaForTool('deepthinking_analyze');
      const input = {
        thought: 'Analyzing complex problem from multiple perspectives',
        preset: 'comprehensive_analysis',
      };
      expect(() => schema.parse(input)).not.toThrow();
    });

    it('should validate analyze input with custom modes', () => {
      const schema = getSchemaForTool('deepthinking_analyze');
      const input = {
        thought: 'Multi-mode analysis test',
        customModes: ['deductive', 'inductive', 'abductive'],
        mergeStrategy: 'weighted',
      };
      expect(() => schema.parse(input)).not.toThrow();
    });

    it('should reject analyze input with too few custom modes', () => {
      const schema = getSchemaForTool('deepthinking_analyze');
      const input = {
        thought: 'Multi-mode analysis test',
        customModes: ['deductive'], // needs at least 2
      };
      expect(() => schema.parse(input)).toThrow();
    });

    it('should validate all preset options', () => {
      const schema = getSchemaForTool('deepthinking_analyze');
      const presets = ['comprehensive_analysis', 'hypothesis_testing', 'decision_making', 'root_cause', 'future_planning'];
      for (const preset of presets) {
        const input = {
          thought: `Testing ${preset}`,
          preset,
        };
        expect(() => schema.parse(input)).not.toThrow();
      }
    });

    it('should validate all merge strategies', () => {
      const schema = getSchemaForTool('deepthinking_analyze');
      const strategies = ['union', 'intersection', 'weighted', 'hierarchical', 'dialectical'];
      for (const mergeStrategy of strategies) {
        const input = {
          thought: `Testing ${mergeStrategy}`,
          preset: 'comprehensive_analysis',
          mergeStrategy,
        };
        expect(() => schema.parse(input)).not.toThrow();
      }
    });
  });
});
