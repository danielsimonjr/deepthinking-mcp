/**
 * Lazy Loader Unit Tests
 * Sprint 5 Task 5.5: Verify lazy schema loading functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSchema,
  getToolDefinition,
  getLoadedTools,
  getAvailableTools,
  preloadSchemas,
  clearSchemaCache,
  getSchemaStats,
  getAllToolDefinitions,
  validateInput,
  isValidTool,
} from '../../../src/tools/lazy-loader.js';

describe('LazyLoader', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearSchemaCache();
  });

  describe('getAvailableTools', () => {
    it('should return all 9 tool names', () => {
      const tools = getAvailableTools();
      expect(tools).toHaveLength(9);
      expect(tools).toContain('deepthinking_core');
      expect(tools).toContain('deepthinking_math');
      expect(tools).toContain('deepthinking_temporal');
      expect(tools).toContain('deepthinking_probabilistic');
      expect(tools).toContain('deepthinking_causal');
      expect(tools).toContain('deepthinking_strategic');
      expect(tools).toContain('deepthinking_analytical');
      expect(tools).toContain('deepthinking_scientific');
      expect(tools).toContain('deepthinking_session');
    });
  });

  describe('lazy loading behavior', () => {
    it('should start with no schemas loaded', () => {
      const stats = getSchemaStats();
      expect(stats.loaded).toBe(0);
      expect(stats.available).toBe(9);
    });

    it('should load schema only when requested', async () => {
      // Before loading
      expect(getLoadedTools()).toHaveLength(0);

      // Load one schema
      await getSchema('deepthinking_core');

      // Only one should be loaded
      const stats = getSchemaStats();
      expect(stats.loaded).toBe(1);
      expect(stats.loadedNames).toContain('deepthinking_core');
    });

    it('should cache schema after first load', async () => {
      // Load twice
      const first = await getSchema('deepthinking_math');
      const second = await getSchema('deepthinking_math');

      // Should be the same object (cached)
      expect(first).toBe(second);

      // Still only one loaded
      expect(getSchemaStats().loaded).toBe(1);
    });

    it('should load multiple schemas independently', async () => {
      await getSchema('deepthinking_core');
      await getSchema('deepthinking_temporal');

      const stats = getSchemaStats();
      expect(stats.loaded).toBe(2);
      expect(stats.loadedNames).toContain('deepthinking_core');
      expect(stats.loadedNames).toContain('deepthinking_temporal');
    });
  });

  describe('getToolDefinition', () => {
    it('should return tool with name, description, and inputSchema', async () => {
      const tool = await getToolDefinition('deepthinking_core') as {
        name: string;
        description: string;
        inputSchema: object;
      };

      expect(tool).toHaveProperty('name', 'deepthinking_core');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('inputSchema');
      expect(tool.description).toContain('sequential');
    });

    it('should throw for unknown tool', async () => {
      await expect(getToolDefinition('unknown_tool')).rejects.toThrow('Unknown tool');
    });
  });

  describe('getAllToolDefinitions', () => {
    it('should return all 9 tool definitions', async () => {
      const definitions = await getAllToolDefinitions();
      expect(definitions).toHaveLength(9);

      // All schemas should now be loaded
      expect(getSchemaStats().loaded).toBe(9);
    });

    it('should return valid MCP tool structures', async () => {
      const definitions = await getAllToolDefinitions();

      for (const tool of definitions) {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
      }
    });
  });

  describe('validateInput', () => {
    it('should validate correct input', async () => {
      const result = await validateInput('deepthinking_core', {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'sequential',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject invalid input', async () => {
      const result = await validateInput('deepthinking_core', {
        // Missing required fields
        thought: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should lazy load schema for validation', async () => {
      // Start fresh
      clearSchemaCache();
      expect(getSchemaStats().loaded).toBe(0);

      // Validate (triggers load)
      await validateInput('deepthinking_session', {
        action: 'summarize',
      });

      // Schema should now be loaded
      expect(getSchemaStats().loaded).toBe(1);
      expect(getLoadedTools()).toContain('deepthinking_session');
    });
  });

  describe('preloadSchemas', () => {
    it('should preload specified schemas', async () => {
      await preloadSchemas(['deepthinking_core', 'deepthinking_math']);

      const stats = getSchemaStats();
      expect(stats.loaded).toBe(2);
      expect(stats.loadedNames).toContain('deepthinking_core');
      expect(stats.loadedNames).toContain('deepthinking_math');
    });
  });

  describe('isValidTool', () => {
    it('should return true for valid tools', () => {
      expect(isValidTool('deepthinking_core')).toBe(true);
      expect(isValidTool('deepthinking_session')).toBe(true);
    });

    it('should return false for invalid tools', () => {
      expect(isValidTool('unknown')).toBe(false);
      expect(isValidTool('')).toBe(false);
    });
  });

  describe('clearSchemaCache', () => {
    it('should clear all cached schemas', async () => {
      // Load some schemas
      await getSchema('deepthinking_core');
      await getSchema('deepthinking_math');
      expect(getSchemaStats().loaded).toBe(2);

      // Clear
      clearSchemaCache();
      expect(getSchemaStats().loaded).toBe(0);
    });
  });
});
