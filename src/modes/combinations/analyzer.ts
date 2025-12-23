/**
 * Multi-Mode Analyzer - Phase 12 Sprint 3
 *
 * Orchestrates multi-mode analysis by executing multiple reasoning modes
 * in parallel, collecting insights, detecting conflicts, and merging results.
 *
 * This is the main entry point for multi-mode analysis workflows.
 */

import { randomUUID } from 'crypto';
import { ThinkingMode } from '../../types/core.js';
import type {
  MultiModeAnalysisRequest,
  MultiModeAnalysisResponse,
  ModeAnalysisResult,
  MergedAnalysis,
  Insight,
  ModeError,
  MergeStatistics,
} from './combination-types.js';
import { InsightMerger, MergeResult } from './merger.js';
import { ConflictResolver } from './conflict-resolver.js';
import { getPreset, isValidPresetId, PresetId } from './presets.js';
import type { ModeCombination } from './combination-types.js';

/**
 * Configuration for MultiModeAnalyzer
 */
export interface MultiModeAnalyzerConfig {
  /** Default timeout per mode in milliseconds */
  defaultTimeoutPerMode?: number;

  /** Whether to continue analysis if some modes fail */
  continueOnError?: boolean;

  /** Maximum number of modes to run in parallel */
  maxParallelModes?: number;

  /** Minimum confidence threshold for insights */
  minConfidenceThreshold?: number;

  /** Enable verbose logging */
  verbose?: boolean;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<MultiModeAnalyzerConfig> = {
  defaultTimeoutPerMode: 30000,
  continueOnError: true,
  maxParallelModes: 5,
  minConfidenceThreshold: 0.3,
  verbose: false,
};

/**
 * Progress callback for tracking multi-mode analysis
 */
export type ProgressCallback = (progress: AnalysisProgress) => void;

/**
 * Progress information during analysis
 */
export interface AnalysisProgress {
  /** Current phase of analysis */
  phase: 'initializing' | 'executing_modes' | 'collecting_insights' | 'resolving_conflicts' | 'merging' | 'complete';

  /** Overall progress (0-100) */
  percentage: number;

  /** Modes completed so far */
  modesCompleted: number;

  /** Total modes to execute */
  totalModes: number;

  /** Current mode being executed (if applicable) */
  currentMode?: ThinkingMode;

  /** Message describing current activity */
  message: string;
}

/**
 * MultiModeAnalyzer - Orchestrates multi-mode reasoning analysis
 *
 * Provides a high-level interface for running multiple reasoning modes
 * on a problem, collecting and merging their insights, and resolving
 * any conflicts between different perspectives.
 *
 * @example
 * ```typescript
 * const analyzer = new MultiModeAnalyzer();
 *
 * // Using a preset
 * const response = await analyzer.analyze({
 *   thought: "What are the implications of AI in healthcare?",
 *   preset: "comprehensive_analysis"
 * });
 *
 * // Using custom modes
 * const response = await analyzer.analyze({
 *   thought: "Analyze this business decision",
 *   customModes: [ThinkingMode.GameTheory, ThinkingMode.Bayesian],
 *   mergeStrategy: "weighted"
 * });
 * ```
 */
export class MultiModeAnalyzer {
  private readonly config: Required<MultiModeAnalyzerConfig>;
  private readonly merger: InsightMerger;
  private readonly conflictResolver: ConflictResolver;

  constructor(config: MultiModeAnalyzerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.merger = new InsightMerger();
    this.conflictResolver = new ConflictResolver();
  }

  /**
   * Analyze a thought using multiple reasoning modes
   *
   * @param request - The analysis request
   * @param onProgress - Optional callback for progress updates
   * @returns The multi-mode analysis response
   */
  async analyze(
    request: MultiModeAnalysisRequest,
    onProgress?: ProgressCallback
  ): Promise<MultiModeAnalysisResponse> {
    const startTime = Date.now();
    const errors: ModeError[] = [];

    // Phase 1: Initialize
    this.reportProgress(onProgress, {
      phase: 'initializing',
      percentage: 0,
      modesCompleted: 0,
      totalModes: 0,
      message: 'Initializing multi-mode analysis...',
    });

    // Resolve which modes to use
    const { modes, combination } = this.resolveModes(request);

    if (modes.length === 0) {
      return this.createEmptyResponse(startTime, 'No modes specified or preset not found');
    }

    const totalModes = modes.length;

    // Phase 2: Execute modes
    this.reportProgress(onProgress, {
      phase: 'executing_modes',
      percentage: 10,
      modesCompleted: 0,
      totalModes,
      message: `Executing ${totalModes} reasoning modes...`,
    });

    const modeResults = await this.executeModes(
      modes,
      request,
      errors,
      (completed, current) => {
        const percentage = 10 + Math.floor((completed / totalModes) * 50);
        this.reportProgress(onProgress, {
          phase: 'executing_modes',
          percentage,
          modesCompleted: completed,
          totalModes,
          currentMode: current,
          message: `Executing ${current} (${completed}/${totalModes})...`,
        });
      }
    );

    // Phase 3: Collect insights
    this.reportProgress(onProgress, {
      phase: 'collecting_insights',
      percentage: 60,
      modesCompleted: totalModes,
      totalModes,
      message: 'Collecting insights from all modes...',
    });

    const insightsByMode = this.collectInsights(modeResults);
    const allInsights = this.flattenInsights(insightsByMode);

    // Phase 4: Detect and resolve conflicts
    this.reportProgress(onProgress, {
      phase: 'resolving_conflicts',
      percentage: 70,
      modesCompleted: totalModes,
      totalModes,
      message: 'Detecting and resolving conflicts...',
    });

    const conflicts = this.conflictResolver.detectConflicts(allInsights);
    const resolutions = this.conflictResolver.resolveAll(conflicts);
    const resolvedInsights = this.conflictResolver.applyResolutions(allInsights, resolutions);

    // Phase 5: Merge insights
    this.reportProgress(onProgress, {
      phase: 'merging',
      percentage: 85,
      modesCompleted: totalModes,
      totalModes,
      message: 'Merging insights using selected strategy...',
    });

    const mergeStrategy = request.mergeStrategy || combination?.mergeStrategy || 'union';
    const mergeConfig = combination?.mergeConfig;

    // Rebuild insights by mode after conflict resolution
    const resolvedByMode = this.groupInsightsByMode(resolvedInsights);
    const mergeResult = this.merger.merge(resolvedByMode, mergeStrategy, mergeConfig);

    // Phase 6: Create final analysis
    this.reportProgress(onProgress, {
      phase: 'complete',
      percentage: 100,
      modesCompleted: totalModes,
      totalModes,
      message: 'Analysis complete',
    });

    const analysis = this.createMergedAnalysis(
      mergeResult,
      conflicts,
      modes,
      mergeStrategy,
      startTime
    );

    return {
      analysis,
      modeResults,
      success: errors.filter((e) => !e.recoverable).length === 0,
      errors: errors.length > 0 ? errors : undefined,
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Analyze using a specific preset
   *
   * @param thought - The thought to analyze
   * @param presetId - The preset ID to use
   * @param onProgress - Optional progress callback
   */
  async analyzeWithPreset(
    thought: string,
    presetId: PresetId,
    onProgress?: ProgressCallback
  ): Promise<MultiModeAnalysisResponse> {
    return this.analyze({ thought, preset: presetId }, onProgress);
  }

  /**
   * Analyze using custom modes
   *
   * @param thought - The thought to analyze
   * @param modes - The modes to use
   * @param mergeStrategy - The merge strategy
   * @param onProgress - Optional progress callback
   */
  async analyzeWithModes(
    thought: string,
    modes: ThinkingMode[],
    mergeStrategy: 'union' | 'intersection' | 'weighted' | 'hierarchical' | 'dialectical' = 'union',
    onProgress?: ProgressCallback
  ): Promise<MultiModeAnalysisResponse> {
    return this.analyze({ thought, customModes: modes, mergeStrategy }, onProgress);
  }

  /**
   * Get available presets for analysis
   */
  getAvailablePresets(): string[] {
    return ['comprehensive_analysis', 'hypothesis_testing', 'decision_making', 'root_cause', 'future_planning'];
  }

  /**
   * Get supported modes for analysis
   */
  getSupportedModes(): ThinkingMode[] {
    return [
      ThinkingMode.SEQUENTIAL,
      ThinkingMode.SHANNON,
      ThinkingMode.MATHEMATICS,
      ThinkingMode.PHYSICS,
      ThinkingMode.HYBRID,
      ThinkingMode.INDUCTIVE,
      ThinkingMode.DEDUCTIVE,
      ThinkingMode.ABDUCTIVE,
      ThinkingMode.CAUSAL,
      ThinkingMode.BAYESIAN,
      ThinkingMode.COUNTERFACTUAL,
      ThinkingMode.TEMPORAL,
      ThinkingMode.GAMETHEORY,
      ThinkingMode.EVIDENTIAL,
      ThinkingMode.ANALOGICAL,
      ThinkingMode.FIRSTPRINCIPLES,
      ThinkingMode.SYSTEMSTHINKING,
      ThinkingMode.SCIENTIFICMETHOD,
      ThinkingMode.FORMALLOGIC,
      ThinkingMode.OPTIMIZATION,
      ThinkingMode.ENGINEERING,
      ThinkingMode.COMPUTABILITY,
      ThinkingMode.CRYPTANALYTIC,
      ThinkingMode.ALGORITHMIC,
      ThinkingMode.SYNTHESIS,
      ThinkingMode.ARGUMENTATION,
      ThinkingMode.CRITIQUE,
      ThinkingMode.ANALYSIS,
      ThinkingMode.METAREASONING,
    ];
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Resolve which modes to use from request
   */
  private resolveModes(request: MultiModeAnalysisRequest): {
    modes: ThinkingMode[];
    combination: ModeCombination | undefined;
  } {
    // Custom modes take precedence
    if (request.customModes && request.customModes.length > 0) {
      return { modes: request.customModes, combination: undefined };
    }

    // Try preset
    if (request.preset && isValidPresetId(request.preset)) {
      const combination = getPreset(request.preset);
      if (combination) {
        return { modes: combination.modes, combination };
      }
    }

    // Default: comprehensive analysis
    const defaultCombination = getPreset('comprehensive_analysis');
    return {
      modes: defaultCombination?.modes || [ThinkingMode.DEDUCTIVE, ThinkingMode.INDUCTIVE],
      combination: defaultCombination,
    };
  }

  /**
   * Execute all modes and collect results
   */
  private async executeModes(
    modes: ThinkingMode[],
    request: MultiModeAnalysisRequest,
    errors: ModeError[],
    onModeComplete?: (completed: number, current: ThinkingMode) => void
  ): Promise<Map<ThinkingMode, ModeAnalysisResult>> {
    const results = new Map<ThinkingMode, ModeAnalysisResult>();
    let completed = 0;

    // Execute modes in batches for controlled parallelism
    const batches = this.createBatches(modes, this.config.maxParallelModes);

    for (const batch of batches) {
      const batchPromises = batch.map(async (mode) => {
        const modeStartTime = Date.now();

        try {
          onModeComplete?.(completed, mode);

          // Simulate mode execution - in real implementation, this would call ThoughtFactory
          // For now, we generate representative insights for each mode
          const insights = this.generateModeInsights(mode, request.thought, request.context);

          const result: ModeAnalysisResult = {
            mode,
            insights,
            success: true,
            executionTime: Date.now() - modeStartTime,
          };

          results.set(mode, result);
          completed++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);

          errors.push({
            mode,
            message: errorMessage,
            recoverable: this.config.continueOnError,
          });

          results.set(mode, {
            mode,
            insights: [],
            success: false,
            error: errorMessage,
            executionTime: Date.now() - modeStartTime,
          });

          completed++;

          if (!this.config.continueOnError) {
            throw error;
          }
        }
      });

      await Promise.all(batchPromises);
    }

    return results;
  }

  /**
   * Generate representative insights for a mode
   * This is a placeholder - in production, this would integrate with ThoughtFactory
   */
  private generateModeInsights(mode: ThinkingMode, thought: string, context?: string): Insight[] {
    const baseConfidence = 0.7 + Math.random() * 0.2;
    const timestamp = new Date();

    // Generate mode-appropriate insights
    const insights: Insight[] = [];

    switch (mode) {
      case ThinkingMode.DEDUCTIVE:
        insights.push({
          id: randomUUID(),
          content: `Logical deduction from premises: ${thought.substring(0, 50)}...`,
          sourceMode: mode,
          confidence: baseConfidence,
          evidence: ['Premise analysis', 'Logical inference'],
          timestamp,
          category: 'deductive_conclusion',
          priority: 8,
        });
        break;

      case ThinkingMode.INDUCTIVE:
        insights.push({
          id: randomUUID(),
          content: `Pattern identified from analysis: Generalizing observations about ${thought.substring(0, 30)}...`,
          sourceMode: mode,
          confidence: baseConfidence * 0.9,
          evidence: ['Pattern recognition', 'Statistical inference'],
          timestamp,
          category: 'inductive_generalization',
          priority: 7,
        });
        break;

      case ThinkingMode.ABDUCTIVE:
        insights.push({
          id: randomUUID(),
          content: `Best explanation hypothesis: Most likely cause for ${thought.substring(0, 30)}...`,
          sourceMode: mode,
          confidence: baseConfidence * 0.85,
          evidence: ['Inference to best explanation'],
          timestamp,
          category: 'abductive_hypothesis',
          priority: 6,
        });
        break;

      case ThinkingMode.CAUSAL:
        insights.push({
          id: randomUUID(),
          content: `Causal relationship identified: Factors influencing ${thought.substring(0, 30)}...`,
          sourceMode: mode,
          confidence: baseConfidence,
          evidence: ['Causal graph analysis', 'Intervention analysis'],
          timestamp,
          category: 'causal_mechanism',
          priority: 8,
        });
        break;

      case ThinkingMode.BAYESIAN:
        insights.push({
          id: randomUUID(),
          content: `Probability assessment: Updated belief about ${thought.substring(0, 30)}...`,
          sourceMode: mode,
          confidence: baseConfidence,
          evidence: ['Prior probability', 'Evidence likelihood', 'Posterior calculation'],
          timestamp,
          category: 'probabilistic_assessment',
          priority: 7,
        });
        break;

      case ThinkingMode.SYSTEMSTHINKING:
        insights.push({
          id: randomUUID(),
          content: `System dynamics: Feedback loops and interactions in ${thought.substring(0, 30)}...`,
          sourceMode: mode,
          confidence: baseConfidence * 0.9,
          evidence: ['Feedback loop analysis', 'Stock-flow modeling'],
          timestamp,
          category: 'systems_insight',
          priority: 7,
        });
        break;

      case ThinkingMode.FIRSTPRINCIPLES:
        insights.push({
          id: randomUUID(),
          content: `First principles analysis: Core assumptions about ${thought.substring(0, 30)}...`,
          sourceMode: mode,
          confidence: baseConfidence,
          evidence: ['Fundamental axioms', 'Deconstruction analysis'],
          timestamp,
          category: 'foundational_insight',
          priority: 9,
        });
        break;

      case ThinkingMode.GAMETHEORY:
        insights.push({
          id: randomUUID(),
          content: `Strategic analysis: Nash equilibrium considerations for ${thought.substring(0, 30)}...`,
          sourceMode: mode,
          confidence: baseConfidence * 0.95,
          evidence: ['Payoff matrix', 'Equilibrium analysis'],
          timestamp,
          category: 'strategic_insight',
          priority: 7,
        });
        break;

      case ThinkingMode.COUNTERFACTUAL:
        insights.push({
          id: randomUUID(),
          content: `Counterfactual scenario: Alternative outcomes if ${thought.substring(0, 30)}...`,
          sourceMode: mode,
          confidence: baseConfidence * 0.8,
          evidence: ['World state modeling', 'Alternative history analysis'],
          timestamp,
          category: 'counterfactual_scenario',
          priority: 6,
        });
        break;

      case ThinkingMode.TEMPORAL:
        insights.push({
          id: randomUUID(),
          content: `Temporal analysis: Timeline and sequencing for ${thought.substring(0, 30)}...`,
          sourceMode: mode,
          confidence: baseConfidence,
          evidence: ['Event sequencing', 'Allen interval analysis'],
          timestamp,
          category: 'temporal_insight',
          priority: 7,
        });
        break;

      case ThinkingMode.OPTIMIZATION:
        insights.push({
          id: randomUUID(),
          content: `Optimization insight: Optimal approach for ${thought.substring(0, 30)}...`,
          sourceMode: mode,
          confidence: baseConfidence,
          evidence: ['Constraint satisfaction', 'Objective optimization'],
          timestamp,
          category: 'optimization_result',
          priority: 8,
        });
        break;

      default:
        // Generic insight for other modes
        insights.push({
          id: randomUUID(),
          content: `Analysis via ${mode}: Key observations about ${thought.substring(0, 40)}...`,
          sourceMode: mode,
          confidence: baseConfidence * 0.85,
          evidence: [`${mode} methodology`],
          timestamp,
          category: 'general_insight',
          priority: 5,
        });
    }

    // Add context-based insight if context provided
    if (context) {
      insights.push({
        id: randomUUID(),
        content: `Context-aware insight: Considering ${context.substring(0, 30)} in relation to the problem...`,
        sourceMode: mode,
        confidence: baseConfidence * 0.9,
        evidence: ['Contextual analysis'],
        timestamp,
        category: 'contextual_insight',
        priority: 6,
      });
    }

    return insights;
  }

  /**
   * Collect insights from mode results into a map
   */
  private collectInsights(results: Map<ThinkingMode, ModeAnalysisResult>): Map<ThinkingMode, Insight[]> {
    const insightsByMode = new Map<ThinkingMode, Insight[]>();

    for (const [mode, result] of results) {
      if (result.success && result.insights.length > 0) {
        insightsByMode.set(mode, result.insights);
      }
    }

    return insightsByMode;
  }

  /**
   * Flatten insights map to array
   */
  private flattenInsights(insightsByMode: Map<ThinkingMode, Insight[]>): Insight[] {
    const allInsights: Insight[] = [];
    for (const insights of insightsByMode.values()) {
      allInsights.push(...insights);
    }
    return allInsights;
  }

  /**
   * Group insights by their source mode
   */
  private groupInsightsByMode(insights: Insight[]): Map<ThinkingMode, Insight[]> {
    const grouped = new Map<ThinkingMode, Insight[]>();

    for (const insight of insights) {
      const existing = grouped.get(insight.sourceMode) || [];
      existing.push(insight);
      grouped.set(insight.sourceMode, existing);
    }

    return grouped;
  }

  /**
   * Create the final merged analysis result
   */
  private createMergedAnalysis(
    mergeResult: MergeResult,
    conflicts: ReturnType<ConflictResolver['detectConflicts']>,
    modes: ThinkingMode[],
    mergeStrategy: 'union' | 'intersection' | 'weighted' | 'hierarchical' | 'dialectical',
    _startTime: number
  ): MergedAnalysis {
    const statistics: MergeStatistics = {
      ...mergeResult.statistics,
      conflictsDetected: conflicts.length,
      conflictsResolved: conflicts.filter((c) => c.resolution !== undefined).length,
    };

    // Build supporting evidence map
    const supportingEvidence = new Map<string, ThinkingMode[]>();
    for (const insight of mergeResult.insights) {
      const existing = supportingEvidence.get(insight.id) || [];
      existing.push(insight.sourceMode);
      supportingEvidence.set(insight.id, existing);
    }

    // Create synthesized conclusion
    const synthesizedConclusion = this.synthesizeConclusion(mergeResult.insights, conflicts);

    return {
      id: randomUUID(),
      primaryInsights: mergeResult.insights,
      supportingEvidence,
      conflicts,
      synthesizedConclusion,
      confidenceScore: mergeResult.insights.reduce((acc, i) => acc + i.confidence, 0) / Math.max(mergeResult.insights.length, 1),
      contributingModes: modes,
      mergeStrategy,
      statistics,
      timestamp: new Date(),
    };
  }

  /**
   * Synthesize a conclusion from merged insights
   */
  private synthesizeConclusion(
    insights: Insight[],
    conflicts: ReturnType<ConflictResolver['detectConflicts']>
  ): string {
    if (insights.length === 0) {
      return 'No insights generated from the analysis.';
    }

    // Sort by priority and confidence
    const sortedInsights = [...insights].sort((a, b) => {
      const priorityDiff = (b.priority || 5) - (a.priority || 5);
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });

    // Take top insights
    const topInsights = sortedInsights.slice(0, 3);

    // Build synthesis
    let conclusion = 'Multi-mode analysis reveals: ';
    conclusion += topInsights.map((i) => i.content).join(' Furthermore, ');

    if (conflicts.length > 0) {
      conclusion += ` Note: ${conflicts.length} conflict(s) were detected and resolved during synthesis.`;
    }

    return conclusion;
  }

  /**
   * Create batches for parallel execution
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Report progress to callback
   */
  private reportProgress(callback: ProgressCallback | undefined, progress: AnalysisProgress): void {
    if (callback) {
      callback(progress);
    }

    if (this.config.verbose) {
      console.log(`[MultiModeAnalyzer] ${progress.phase}: ${progress.message} (${progress.percentage}%)`);
    }
  }

  /**
   * Create empty response for error cases
   */
  private createEmptyResponse(startTime: number, errorMessage: string): MultiModeAnalysisResponse {
    return {
      analysis: {
        id: randomUUID(),
        primaryInsights: [],
        supportingEvidence: new Map(),
        conflicts: [],
        synthesizedConclusion: errorMessage,
        confidenceScore: 0,
        contributingModes: [],
        mergeStrategy: 'union',
        statistics: {
          totalInsightsBefore: 0,
          totalInsightsAfter: 0,
          duplicatesRemoved: 0,
          conflictsDetected: 0,
          conflictsResolved: 0,
          averageConfidence: 0,
          mergeTime: 0,
        },
        timestamp: new Date(),
      },
      modeResults: new Map(),
      success: false,
      errors: [{ mode: ThinkingMode.HYBRID, message: errorMessage, recoverable: false }],
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Convenience function to create and run analysis
 */
export async function analyzeMultiMode(
  request: MultiModeAnalysisRequest,
  config?: MultiModeAnalyzerConfig
): Promise<MultiModeAnalysisResponse> {
  const analyzer = new MultiModeAnalyzer(config);
  return analyzer.analyze(request);
}
