/**
 * Mode Combination Presets - Phase 12 Sprint 3
 *
 * Pre-defined combinations of reasoning modes optimized for
 * common analysis scenarios.
 */

import { ThinkingMode } from '../../types/core.js';
import type {
  ModeCombination,
  MergeStrategy,
  WeightedMergeConfig,
  HierarchicalMergeConfig,
  DialecticalMergeConfig,
} from './combination-types.js';

/**
 * Preset identifiers
 */
export type PresetId =
  | 'comprehensive_analysis'
  | 'hypothesis_testing'
  | 'decision_making'
  | 'root_cause'
  | 'future_planning';

/**
 * Comprehensive Analysis preset
 * Uses multiple modes to provide a thorough analysis from different perspectives
 */
const comprehensiveAnalysis: ModeCombination = {
  id: 'comprehensive_analysis',
  name: 'Comprehensive Analysis',
  description:
    'Analyzes a problem from multiple perspectives using deductive, inductive, and abductive reasoning along with systems thinking',
  modes: [
    ThinkingMode.DEDUCTIVE,
    ThinkingMode.INDUCTIVE,
    ThinkingMode.ABDUCTIVE,
    ThinkingMode.SYSTEMSTHINKING,
    ThinkingMode.FIRSTPRINCIPLES,
  ],
  mergeStrategy: 'weighted',
  useCase:
    'Use when you need a thorough understanding of a complex problem from multiple angles',
  mergeConfig: {
    weights: new Map<ThinkingMode, number>([
      [ThinkingMode.DEDUCTIVE, 0.9],
      [ThinkingMode.INDUCTIVE, 0.8],
      [ThinkingMode.ABDUCTIVE, 0.7],
      [ThinkingMode.SYSTEMSTHINKING, 0.85],
      [ThinkingMode.FIRSTPRINCIPLES, 0.9],
    ]),
    threshold: 0.5,
    defaultWeight: 0.6,
  } as WeightedMergeConfig,
  tags: ['analysis', 'comprehensive', 'multi-perspective'],
};

/**
 * Hypothesis Testing preset
 * Combines scientific method with Bayesian updating for rigorous hypothesis evaluation
 */
const hypothesisTesting: ModeCombination = {
  id: 'hypothesis_testing',
  name: 'Hypothesis Testing',
  description:
    'Evaluates hypotheses using scientific method, Bayesian reasoning, and evidential analysis',
  modes: [
    ThinkingMode.SCIENTIFICMETHOD,
    ThinkingMode.BAYESIAN,
    ThinkingMode.EVIDENTIAL,
    ThinkingMode.DEDUCTIVE,
  ],
  mergeStrategy: 'hierarchical',
  useCase:
    'Use when evaluating hypotheses with evidence, updating beliefs based on new data',
  mergeConfig: {
    primaryMode: ThinkingMode.SCIENTIFICMETHOD,
    supportingModes: [
      ThinkingMode.BAYESIAN,
      ThinkingMode.EVIDENTIAL,
      ThinkingMode.DEDUCTIVE,
    ],
    allowOverride: true,
    overrideThreshold: 2,
  } as HierarchicalMergeConfig,
  tags: ['scientific', 'hypothesis', 'evidence-based'],
};

/**
 * Decision Making preset
 * Uses game theory, optimization, and counterfactual reasoning for decision analysis
 */
const decisionMaking: ModeCombination = {
  id: 'decision_making',
  name: 'Decision Making',
  description:
    'Analyzes decisions using game theory, optimization, and counterfactual analysis',
  modes: [
    ThinkingMode.GAMETHEORY,
    ThinkingMode.OPTIMIZATION,
    ThinkingMode.COUNTERFACTUAL,
    ThinkingMode.BAYESIAN,
  ],
  mergeStrategy: 'weighted',
  useCase:
    'Use when making strategic decisions, evaluating options, or analyzing competitive scenarios',
  mergeConfig: {
    weights: new Map<ThinkingMode, number>([
      [ThinkingMode.GAMETHEORY, 0.9],
      [ThinkingMode.OPTIMIZATION, 0.85],
      [ThinkingMode.COUNTERFACTUAL, 0.8],
      [ThinkingMode.BAYESIAN, 0.75],
    ]),
    threshold: 0.6,
    defaultWeight: 0.5,
  } as WeightedMergeConfig,
  tags: ['decision', 'strategy', 'optimization'],
};

/**
 * Root Cause Analysis preset
 * Combines causal reasoning with systems thinking to identify root causes
 */
const rootCause: ModeCombination = {
  id: 'root_cause',
  name: 'Root Cause Analysis',
  description:
    'Identifies root causes using causal inference, systems thinking, and first principles',
  modes: [
    ThinkingMode.CAUSAL,
    ThinkingMode.SYSTEMSTHINKING,
    ThinkingMode.FIRSTPRINCIPLES,
    ThinkingMode.ABDUCTIVE,
  ],
  mergeStrategy: 'hierarchical',
  useCase:
    'Use when diagnosing problems, finding root causes, or understanding causal chains',
  mergeConfig: {
    primaryMode: ThinkingMode.CAUSAL,
    supportingModes: [
      ThinkingMode.SYSTEMSTHINKING,
      ThinkingMode.FIRSTPRINCIPLES,
      ThinkingMode.ABDUCTIVE,
    ],
    allowOverride: false,
    overrideThreshold: 3,
  } as HierarchicalMergeConfig,
  tags: ['causal', 'diagnosis', 'root-cause'],
};

/**
 * Future Planning preset
 * Uses temporal reasoning with counterfactual analysis for planning
 */
const futurePlanning: ModeCombination = {
  id: 'future_planning',
  name: 'Future Planning',
  description:
    'Plans future scenarios using temporal reasoning, counterfactuals, and Bayesian prediction',
  modes: [
    ThinkingMode.TEMPORAL,
    ThinkingMode.COUNTERFACTUAL,
    ThinkingMode.BAYESIAN,
    ThinkingMode.OPTIMIZATION,
  ],
  mergeStrategy: 'dialectical',
  useCase:
    'Use when planning for the future, scenario analysis, or forecasting',
  mergeConfig: {
    thesisMode: ThinkingMode.TEMPORAL,
    antithesisMode: ThinkingMode.COUNTERFACTUAL,
    synthesisModes: [ThinkingMode.BAYESIAN],
    preserveOriginals: true,
  } as DialecticalMergeConfig,
  tags: ['planning', 'future', 'temporal', 'scenarios'],
};

/**
 * All available presets
 */
export const PRESETS: Record<PresetId, ModeCombination> = {
  comprehensive_analysis: comprehensiveAnalysis,
  hypothesis_testing: hypothesisTesting,
  decision_making: decisionMaking,
  root_cause: rootCause,
  future_planning: futurePlanning,
};

/**
 * Get a preset by ID
 */
export function getPreset(id: PresetId): ModeCombination | undefined {
  return PRESETS[id];
}

/**
 * Get all presets
 */
export function getAllPresets(): ModeCombination[] {
  return Object.values(PRESETS);
}

/**
 * Get presets by tag
 */
export function getPresetsByTag(tag: string): ModeCombination[] {
  return Object.values(PRESETS).filter((preset) =>
    preset.tags?.includes(tag.toLowerCase())
  );
}

/**
 * Get presets containing a specific mode
 */
export function getPresetsWithMode(mode: ThinkingMode): ModeCombination[] {
  return Object.values(PRESETS).filter((preset) =>
    preset.modes.includes(mode)
  );
}

/**
 * Get presets using a specific merge strategy
 */
export function getPresetsByStrategy(strategy: MergeStrategy): ModeCombination[] {
  return Object.values(PRESETS).filter(
    (preset) => preset.mergeStrategy === strategy
  );
}

/**
 * Create a custom combination from existing presets
 */
export function combinePresets(
  presetIds: PresetId[],
  name: string,
  mergeStrategy: MergeStrategy = 'union'
): ModeCombination {
  const modes = new Set<ThinkingMode>();
  const tags = new Set<string>();

  for (const id of presetIds) {
    const preset = PRESETS[id];
    if (preset) {
      preset.modes.forEach((m) => modes.add(m));
      preset.tags?.forEach((t) => tags.add(t));
    }
  }

  return {
    id: `custom_${presetIds.join('_')}`,
    name,
    description: `Custom combination of ${presetIds.join(', ')}`,
    modes: [...modes],
    mergeStrategy,
    useCase: 'Custom combination for specialized analysis',
    tags: [...tags, 'custom'],
  };
}

/**
 * Validate a preset ID
 */
export function isValidPresetId(id: string): id is PresetId {
  return id in PRESETS;
}

/**
 * Get preset metadata (without full config)
 */
export function getPresetMetadata(id: PresetId): {
  id: string;
  name: string;
  description: string;
  modeCount: number;
  strategy: MergeStrategy;
  tags: string[];
} | undefined {
  const preset = PRESETS[id];
  if (!preset) return undefined;

  return {
    id: preset.id,
    name: preset.name,
    description: preset.description,
    modeCount: preset.modes.length,
    strategy: preset.mergeStrategy,
    tags: preset.tags || [],
  };
}

/**
 * List all preset IDs
 */
export function listPresetIds(): PresetId[] {
  return Object.keys(PRESETS) as PresetId[];
}
