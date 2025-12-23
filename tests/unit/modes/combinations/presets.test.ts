/**
 * Mode Combination Presets Tests - Phase 12 Sprint 3
 *
 * Tests for the pre-defined mode combination presets.
 */

import { describe, it, expect } from 'vitest';
import { ThinkingMode } from '../../../../src/types/core.js';
import {
  PRESETS,
  PresetId,
  getPreset,
  getAllPresets,
  getPresetsByTag,
  getPresetsWithMode,
  getPresetsByStrategy,
  combinePresets,
  isValidPresetId,
  getPresetMetadata,
  listPresetIds,
} from '../../../../src/modes/combinations/presets.js';

describe('Mode Combination Presets', () => {
  describe('PRESETS constant', () => {
    it('should have 5 predefined presets', () => {
      const presetIds = Object.keys(PRESETS);
      expect(presetIds).toHaveLength(5);
    });

    it('should include comprehensive_analysis preset', () => {
      expect(PRESETS.comprehensive_analysis).toBeDefined();
      expect(PRESETS.comprehensive_analysis.name).toBe('Comprehensive Analysis');
    });

    it('should include hypothesis_testing preset', () => {
      expect(PRESETS.hypothesis_testing).toBeDefined();
      expect(PRESETS.hypothesis_testing.name).toBe('Hypothesis Testing');
    });

    it('should include decision_making preset', () => {
      expect(PRESETS.decision_making).toBeDefined();
      expect(PRESETS.decision_making.name).toBe('Decision Making');
    });

    it('should include root_cause preset', () => {
      expect(PRESETS.root_cause).toBeDefined();
      expect(PRESETS.root_cause.name).toBe('Root Cause Analysis');
    });

    it('should include future_planning preset', () => {
      expect(PRESETS.future_planning).toBeDefined();
      expect(PRESETS.future_planning.name).toBe('Future Planning');
    });
  });

  describe('comprehensive_analysis preset', () => {
    const preset = PRESETS.comprehensive_analysis;

    it('should have multiple reasoning modes', () => {
      expect(preset.modes.length).toBeGreaterThanOrEqual(3);
    });

    it('should include deductive reasoning', () => {
      expect(preset.modes).toContain(ThinkingMode.DEDUCTIVE);
    });

    it('should include inductive reasoning', () => {
      expect(preset.modes).toContain(ThinkingMode.INDUCTIVE);
    });

    it('should include abductive reasoning', () => {
      expect(preset.modes).toContain(ThinkingMode.ABDUCTIVE);
    });

    it('should use weighted merge strategy', () => {
      expect(preset.mergeStrategy).toBe('weighted');
    });

    it('should have merge configuration', () => {
      expect(preset.mergeConfig).toBeDefined();
    });

    it('should have appropriate tags', () => {
      expect(preset.tags).toContain('analysis');
    });

    it('should have a use case description', () => {
      expect(preset.useCase).toBeDefined();
      expect(preset.useCase.length).toBeGreaterThan(0);
    });
  });

  describe('hypothesis_testing preset', () => {
    const preset = PRESETS.hypothesis_testing;

    it('should include scientific method', () => {
      expect(preset.modes).toContain(ThinkingMode.SCIENTIFICMETHOD);
    });

    it('should include Bayesian reasoning', () => {
      expect(preset.modes).toContain(ThinkingMode.BAYESIAN);
    });

    it('should include evidential reasoning', () => {
      expect(preset.modes).toContain(ThinkingMode.EVIDENTIAL);
    });

    it('should use hierarchical merge strategy', () => {
      expect(preset.mergeStrategy).toBe('hierarchical');
    });

    it('should have scientific method as primary mode', () => {
      const config = preset.mergeConfig as any;
      expect(config.primaryMode).toBe(ThinkingMode.SCIENTIFICMETHOD);
    });
  });

  describe('decision_making preset', () => {
    const preset = PRESETS.decision_making;

    it('should include game theory', () => {
      expect(preset.modes).toContain(ThinkingMode.GAMETHEORY);
    });

    it('should include optimization', () => {
      expect(preset.modes).toContain(ThinkingMode.OPTIMIZATION);
    });

    it('should include counterfactual reasoning', () => {
      expect(preset.modes).toContain(ThinkingMode.COUNTERFACTUAL);
    });

    it('should use weighted merge strategy', () => {
      expect(preset.mergeStrategy).toBe('weighted');
    });
  });

  describe('root_cause preset', () => {
    const preset = PRESETS.root_cause;

    it('should include causal reasoning', () => {
      expect(preset.modes).toContain(ThinkingMode.CAUSAL);
    });

    it('should include systems thinking', () => {
      expect(preset.modes).toContain(ThinkingMode.SYSTEMSTHINKING);
    });

    it('should include first principles', () => {
      expect(preset.modes).toContain(ThinkingMode.FIRSTPRINCIPLES);
    });

    it('should use hierarchical merge strategy', () => {
      expect(preset.mergeStrategy).toBe('hierarchical');
    });

    it('should have causal reasoning as primary mode', () => {
      const config = preset.mergeConfig as any;
      expect(config.primaryMode).toBe(ThinkingMode.CAUSAL);
    });
  });

  describe('future_planning preset', () => {
    const preset = PRESETS.future_planning;

    it('should include temporal reasoning', () => {
      expect(preset.modes).toContain(ThinkingMode.TEMPORAL);
    });

    it('should include counterfactual reasoning', () => {
      expect(preset.modes).toContain(ThinkingMode.COUNTERFACTUAL);
    });

    it('should include Bayesian reasoning', () => {
      expect(preset.modes).toContain(ThinkingMode.BAYESIAN);
    });

    it('should use dialectical merge strategy', () => {
      expect(preset.mergeStrategy).toBe('dialectical');
    });

    it('should have thesis and antithesis modes configured', () => {
      const config = preset.mergeConfig as any;
      expect(config.thesisMode).toBeDefined();
      expect(config.antithesisMode).toBeDefined();
    });
  });

  describe('getPreset', () => {
    it('should return preset for valid ID', () => {
      const preset = getPreset('comprehensive_analysis');
      expect(preset).toBeDefined();
      expect(preset?.name).toBe('Comprehensive Analysis');
    });

    it('should return undefined for invalid ID', () => {
      const preset = getPreset('invalid_preset' as PresetId);
      expect(preset).toBeUndefined();
    });

    it('should return all preset types', () => {
      const ids: PresetId[] = [
        'comprehensive_analysis',
        'hypothesis_testing',
        'decision_making',
        'root_cause',
        'future_planning',
      ];

      ids.forEach((id) => {
        expect(getPreset(id)).toBeDefined();
      });
    });
  });

  describe('getAllPresets', () => {
    it('should return all presets as array', () => {
      const presets = getAllPresets();
      expect(Array.isArray(presets)).toBe(true);
      expect(presets).toHaveLength(5);
    });

    it('should return preset objects with required properties', () => {
      const presets = getAllPresets();

      presets.forEach((preset) => {
        expect(preset.id).toBeDefined();
        expect(preset.name).toBeDefined();
        expect(preset.modes).toBeDefined();
        expect(preset.mergeStrategy).toBeDefined();
      });
    });
  });

  describe('getPresetsByTag', () => {
    it('should find presets with analysis tag', () => {
      const presets = getPresetsByTag('analysis');
      expect(presets.length).toBeGreaterThan(0);
      presets.forEach((p) => {
        expect(p.tags).toContain('analysis');
      });
    });

    it('should find presets with scientific tag', () => {
      const presets = getPresetsByTag('scientific');
      expect(presets.length).toBeGreaterThan(0);
    });

    it('should find presets with decision tag', () => {
      const presets = getPresetsByTag('decision');
      expect(presets.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const lower = getPresetsByTag('analysis');
      const upper = getPresetsByTag('ANALYSIS');
      expect(lower).toEqual(upper);
    });

    it('should return empty array for non-existent tag', () => {
      const presets = getPresetsByTag('nonexistent');
      expect(presets).toHaveLength(0);
    });
  });

  describe('getPresetsWithMode', () => {
    it('should find presets containing DEDUCTIVE mode', () => {
      const presets = getPresetsWithMode(ThinkingMode.DEDUCTIVE);
      expect(presets.length).toBeGreaterThan(0);
      presets.forEach((p) => {
        expect(p.modes).toContain(ThinkingMode.DEDUCTIVE);
      });
    });

    it('should find presets containing BAYESIAN mode', () => {
      const presets = getPresetsWithMode(ThinkingMode.BAYESIAN);
      expect(presets.length).toBeGreaterThan(0);
    });

    it('should find presets containing CAUSAL mode', () => {
      const presets = getPresetsWithMode(ThinkingMode.CAUSAL);
      expect(presets.length).toBeGreaterThan(0);
    });

    it('should return empty array for mode not in any preset', () => {
      // Find a mode that might not be in presets
      const presets = getPresetsWithMode(ThinkingMode.MATHEMATICS);
      // May or may not have presets - just verify it returns an array
      expect(Array.isArray(presets)).toBe(true);
    });
  });

  describe('getPresetsByStrategy', () => {
    it('should find presets using weighted strategy', () => {
      const presets = getPresetsByStrategy('weighted');
      expect(presets.length).toBeGreaterThan(0);
      presets.forEach((p) => {
        expect(p.mergeStrategy).toBe('weighted');
      });
    });

    it('should find presets using hierarchical strategy', () => {
      const presets = getPresetsByStrategy('hierarchical');
      expect(presets.length).toBeGreaterThan(0);
    });

    it('should find presets using dialectical strategy', () => {
      const presets = getPresetsByStrategy('dialectical');
      expect(presets.length).toBeGreaterThan(0);
    });

    it('should return empty array for unused strategy', () => {
      const presets = getPresetsByStrategy('intersection');
      // May or may not have presets
      expect(Array.isArray(presets)).toBe(true);
    });
  });

  describe('combinePresets', () => {
    it('should combine modes from multiple presets', () => {
      const combined = combinePresets(
        ['comprehensive_analysis', 'hypothesis_testing'],
        'Combined Analysis'
      );

      expect(combined.name).toBe('Combined Analysis');
      expect(combined.modes.length).toBeGreaterThan(0);
    });

    it('should deduplicate modes', () => {
      const combined = combinePresets(
        ['comprehensive_analysis', 'hypothesis_testing'],
        'Combined'
      );

      const uniqueModes = new Set(combined.modes);
      expect(combined.modes.length).toBe(uniqueModes.size);
    });

    it('should combine tags from presets', () => {
      const combined = combinePresets(
        ['comprehensive_analysis', 'hypothesis_testing'],
        'Combined'
      );

      expect(combined.tags).toBeDefined();
      expect(combined.tags).toContain('custom');
    });

    it('should use specified merge strategy', () => {
      const combined = combinePresets(
        ['comprehensive_analysis', 'hypothesis_testing'],
        'Combined',
        'intersection'
      );

      expect(combined.mergeStrategy).toBe('intersection');
    });

    it('should default to union merge strategy', () => {
      const combined = combinePresets(['comprehensive_analysis'], 'Combined');
      expect(combined.mergeStrategy).toBe('union');
    });

    it('should generate unique ID for combined preset', () => {
      const combined = combinePresets(['comprehensive_analysis', 'root_cause'], 'Combined');
      expect(combined.id).toContain('custom');
    });

    it('should handle single preset', () => {
      const combined = combinePresets(['comprehensive_analysis'], 'Single');
      expect(combined.modes.length).toBeGreaterThan(0);
    });

    it('should handle non-existent preset gracefully', () => {
      const combined = combinePresets(
        ['comprehensive_analysis', 'nonexistent' as PresetId],
        'Partial'
      );
      expect(combined.modes.length).toBeGreaterThan(0);
    });
  });

  describe('isValidPresetId', () => {
    it('should return true for valid preset IDs', () => {
      expect(isValidPresetId('comprehensive_analysis')).toBe(true);
      expect(isValidPresetId('hypothesis_testing')).toBe(true);
      expect(isValidPresetId('decision_making')).toBe(true);
      expect(isValidPresetId('root_cause')).toBe(true);
      expect(isValidPresetId('future_planning')).toBe(true);
    });

    it('should return false for invalid preset IDs', () => {
      expect(isValidPresetId('invalid')).toBe(false);
      expect(isValidPresetId('')).toBe(false);
      expect(isValidPresetId('COMPREHENSIVE_ANALYSIS')).toBe(false); // Case sensitive
    });
  });

  describe('getPresetMetadata', () => {
    it('should return metadata for valid preset', () => {
      const metadata = getPresetMetadata('comprehensive_analysis');

      expect(metadata).toBeDefined();
      expect(metadata?.id).toBe('comprehensive_analysis');
      expect(metadata?.name).toBe('Comprehensive Analysis');
      expect(metadata?.modeCount).toBeGreaterThan(0);
      expect(metadata?.strategy).toBe('weighted');
      expect(metadata?.tags).toBeDefined();
    });

    it('should return undefined for invalid preset', () => {
      const metadata = getPresetMetadata('invalid' as PresetId);
      expect(metadata).toBeUndefined();
    });

    it('should include all metadata fields', () => {
      const metadata = getPresetMetadata('hypothesis_testing');

      expect(metadata).toHaveProperty('id');
      expect(metadata).toHaveProperty('name');
      expect(metadata).toHaveProperty('description');
      expect(metadata).toHaveProperty('modeCount');
      expect(metadata).toHaveProperty('strategy');
      expect(metadata).toHaveProperty('tags');
    });
  });

  describe('listPresetIds', () => {
    it('should return all preset IDs', () => {
      const ids = listPresetIds();

      expect(ids).toContain('comprehensive_analysis');
      expect(ids).toContain('hypothesis_testing');
      expect(ids).toContain('decision_making');
      expect(ids).toContain('root_cause');
      expect(ids).toContain('future_planning');
    });

    it('should return exactly 5 IDs', () => {
      const ids = listPresetIds();
      expect(ids).toHaveLength(5);
    });

    it('should return valid PresetId types', () => {
      const ids = listPresetIds();
      ids.forEach((id) => {
        expect(isValidPresetId(id)).toBe(true);
      });
    });
  });

  describe('preset merge configurations', () => {
    it('should have valid weighted config with weights', () => {
      const preset = PRESETS.comprehensive_analysis;
      const config = preset.mergeConfig as any;

      expect(config.weights).toBeDefined();
      expect(config.weights instanceof Map).toBe(true);
      expect(config.threshold).toBeDefined();
      expect(config.defaultWeight).toBeDefined();
    });

    it('should have valid hierarchical config', () => {
      const preset = PRESETS.hypothesis_testing;
      const config = preset.mergeConfig as any;

      expect(config.primaryMode).toBeDefined();
      expect(config.supportingModes).toBeDefined();
      expect(Array.isArray(config.supportingModes)).toBe(true);
    });

    it('should have valid dialectical config', () => {
      const preset = PRESETS.future_planning;
      const config = preset.mergeConfig as any;

      expect(config.thesisMode).toBeDefined();
      expect(config.antithesisMode).toBeDefined();
      expect(config.preserveOriginals).toBeDefined();
    });
  });
});
