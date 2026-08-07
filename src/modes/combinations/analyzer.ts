/**
 * Multi-Mode Analyzer - Phase 12 Sprint 3
 *
 * Orchestrates multi-mode analysis by executing multiple reasoning modes
 * in parallel, collecting insights, detecting conflicts, and merging results.
 *
 * This is the main entry point for multi-mode analysis workflows.
 */

import { randomUUID } from "crypto";
import { ThinkingMode, type Thought } from "../../types/core.js";
import type { ThinkingToolInput } from "../../tools/thinking.js";
import { ThoughtFactory } from "../../services/ThoughtFactory.js";
import type { ValidationResult } from "../handlers/ModeHandler.js";
import type {
  MultiModeAnalysisRequest,
  MultiModeAnalysisResponse,
  ModeAnalysisResult,
  MergedAnalysis,
  Insight,
  ModeError,
  MergeStatistics,
  ConfidenceBasis,
} from "./combination-types.js";
import { UNSCORED_INSIGHT_WEIGHT } from "./combination-types.js";
import { InsightMerger, MergeResult } from "./merger.js";
import { ConflictResolver } from "./conflict-resolver.js";
import { getPreset, isValidPresetId, PresetId } from "./presets.js";
import type { ModeCombination } from "./combination-types.js";

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

  /**
   * Factory used to run each mode's real handler.
   *
   * Injectable so a test can substitute one and prove the analyzer's output
   * actually comes from it. Defaults to a `ThoughtFactory` with all handlers
   * registered.
   */
  thoughtFactory?: ThoughtFactory;
}

/**
 * Default configuration values
 */
/**
 * Constants for multi-mode analysis
 */
const ANALYZER_CONSTANTS = {
  /** Default timeout per mode in milliseconds */
  DEFAULT_TIMEOUT_MS: 30000,
  /** Maximum parallel mode execution */
  MAX_PARALLEL_MODES: 5,
  /** Minimum confidence threshold for insights */
  MIN_CONFIDENCE_THRESHOLD: 0.3,
  /** Most mode-specific fields named in one insight before truncating. */
  MAX_FIELDS_LISTED: 8,
  /** Most handler advisories quoted in one insight before truncating. */
  MAX_ADVISORIES_LISTED: 3,
  /** Hard cap on a derived insight's content length. */
  MAX_INSIGHT_CONTENT: 600,
} as const;

/**
 * `BaseThought` keys. Everything else on a created thought is mode-specific,
 * which is how a derived insight reports what a handler actually populated
 * without a per-mode switch that would drift as modes are added.
 */
const BASE_THOUGHT_KEYS: ReadonlySet<string> = new Set([
  "id",
  "sessionId",
  "thoughtNumber",
  "totalThoughts",
  "content",
  "timestamp",
  "mode",
  "nextThoughtNeeded",
  "isRevision",
  "revisesThought",
  "revisionReason",
  "branchFrom",
  "branchId",
  "uncertainty",
  "dependencies",
  "assumptions",
  "tags",
  "importance",
  "validation",
  "proofAnalysis",
]);

/**
 * Why no mode can report a confidence on this path.
 *
 * `deepthinking_analyze` accepts `thought`, `preset`, `customModes`,
 * `mergeStrategy`, `sessionId`, `context` and `timeoutPerMode` — and no
 * mode-specific field. A handler computes a confidence FROM mode data (a
 * Bayesian posterior from a prior and a likelihood, an inductive confidence
 * from observations, an evidential belief from masses). Given only a problem
 * statement there is nothing to compute from, so any number emitted here would
 * be invented. Callers wanting a real confidence must run the mode through its
 * own focused tool with that mode's inputs.
 */
const NO_CONFIDENCE_NOTE =
  "No confidence was computed. deepthinking_analyze supplies only the problem " +
  "statement, and this mode's handler derives confidence from mode-specific " +
  "inputs it was not given. Run the mode through its own tool with those " +
  "inputs to obtain a real confidence.";

const DEFAULT_CONFIG: Omit<
  Required<MultiModeAnalyzerConfig>,
  "thoughtFactory"
> = {
  defaultTimeoutPerMode: ANALYZER_CONSTANTS.DEFAULT_TIMEOUT_MS,
  continueOnError: true,
  maxParallelModes: ANALYZER_CONSTANTS.MAX_PARALLEL_MODES,
  minConfidenceThreshold: ANALYZER_CONSTANTS.MIN_CONFIDENCE_THRESHOLD,
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
  phase:
    | "initializing"
    | "executing_modes"
    | "collecting_insights"
    | "resolving_conflicts"
    | "merging"
    | "complete";

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
  private readonly config: Omit<
    Required<MultiModeAnalyzerConfig>,
    "thoughtFactory"
  >;
  private readonly merger: InsightMerger;
  private readonly conflictResolver: ConflictResolver;
  private readonly factory: ThoughtFactory;

  constructor(config: MultiModeAnalyzerConfig = {}) {
    const { thoughtFactory, ...rest } = config;
    this.config = { ...DEFAULT_CONFIG, ...rest };
    this.merger = new InsightMerger();
    this.conflictResolver = new ConflictResolver();
    // Registers every handler on construction, so each mode below runs the
    // same code path a single-mode tool call runs.
    this.factory = thoughtFactory ?? new ThoughtFactory();
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
    onProgress?: ProgressCallback,
  ): Promise<MultiModeAnalysisResponse> {
    const startTime = Date.now();
    const errors: ModeError[] = [];

    // Phase 1: Initialize
    this.reportProgress(onProgress, {
      phase: "initializing",
      percentage: 0,
      modesCompleted: 0,
      totalModes: 0,
      message: "Initializing multi-mode analysis...",
    });

    // Resolve which modes to use
    const { modes, combination } = this.resolveModes(request);

    if (modes.length === 0) {
      return this.createEmptyResponse(
        startTime,
        "No modes specified or preset not found",
      );
    }

    const totalModes = modes.length;

    // Phase 2: Execute modes
    this.reportProgress(onProgress, {
      phase: "executing_modes",
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
          phase: "executing_modes",
          percentage,
          modesCompleted: completed,
          totalModes,
          currentMode: current,
          message: `Executing ${current} (${completed}/${totalModes})...`,
        });
      },
    );

    // Phase 3: Collect insights
    this.reportProgress(onProgress, {
      phase: "collecting_insights",
      percentage: 60,
      modesCompleted: totalModes,
      totalModes,
      message: "Collecting insights from all modes...",
    });

    const insightsByMode = this.collectInsights(modeResults);
    const allInsights = this.flattenInsights(insightsByMode);

    // Phase 4: Detect and resolve conflicts
    this.reportProgress(onProgress, {
      phase: "resolving_conflicts",
      percentage: 70,
      modesCompleted: totalModes,
      totalModes,
      message: "Detecting and resolving conflicts...",
    });

    const conflicts = this.conflictResolver.detectConflicts(allInsights);
    const resolutions = this.conflictResolver.resolveAll(conflicts);
    const resolvedInsights = this.conflictResolver.applyResolutions(
      allInsights,
      resolutions,
    );

    // Phase 5: Merge insights
    this.reportProgress(onProgress, {
      phase: "merging",
      percentage: 85,
      modesCompleted: totalModes,
      totalModes,
      message: "Merging insights using selected strategy...",
    });

    const mergeStrategy =
      request.mergeStrategy || combination?.mergeStrategy || "union";
    const mergeConfig = combination?.mergeConfig;

    // Rebuild insights by mode after conflict resolution
    const resolvedByMode = this.groupInsightsByMode(resolvedInsights);
    const mergeResult = this.merger.merge(
      resolvedByMode,
      mergeStrategy,
      mergeConfig,
    );

    // Phase 6: Create final analysis
    this.reportProgress(onProgress, {
      phase: "complete",
      percentage: 100,
      modesCompleted: totalModes,
      totalModes,
      message: "Analysis complete",
    });

    const analysis = this.createMergedAnalysis(
      mergeResult,
      conflicts,
      modes,
      mergeStrategy,
      startTime,
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
    onProgress?: ProgressCallback,
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
    mergeStrategy:
      | "union"
      | "intersection"
      | "weighted"
      | "hierarchical"
      | "dialectical" = "union",
    onProgress?: ProgressCallback,
  ): Promise<MultiModeAnalysisResponse> {
    return this.analyze(
      { thought, customModes: modes, mergeStrategy },
      onProgress,
    );
  }

  /**
   * Get available presets for analysis
   */
  getAvailablePresets(): string[] {
    return [
      "comprehensive_analysis",
      "hypothesis_testing",
      "decision_making",
      "root_cause",
      "future_planning",
    ];
  }

  /**
   * Modes this analyzer can execute.
   *
   * Derived from the handler registry, not from a list. The former hardcoded
   * list named 29 modes and omitted `historical`, `recursive`, `modal`,
   * `stochastic`, `constraint` and `custom` — all of which have registered
   * handlers and all of which the analyzer executes, so the list understated
   * what the code does.
   *
   * NOTE: `deepthinking_analyze`'s own `customModes` enum in
   * `src/tools/schemas/analyze.ts` still lists the same 29. Widening it is a
   * separate, deliberate change in `src/tools/`.
   */
  getSupportedModes(): ThinkingMode[] {
    return this.factory.getRegistry().getRegisteredModes();
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
    const defaultCombination = getPreset("comprehensive_analysis");
    return {
      modes: defaultCombination?.modes || [
        ThinkingMode.DEDUCTIVE,
        ThinkingMode.INDUCTIVE,
      ],
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
    onModeComplete?: (completed: number, current: ThinkingMode) => void,
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

          const insights = this.runMode(mode, request);

          const result: ModeAnalysisResult = {
            mode,
            insights,
            success: true,
            executionTime: Date.now() - modeStartTime,
          };

          results.set(mode, result);
          completed++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);

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
   * Run one reasoning mode for real and derive insights from what it produced.
   *
   * This used to be `generateModeInsights`, which returned a hardcoded English
   * sentence per mode with the caller's own question spliced into it, plus a
   * fabricated confidence (`0.8 x <a per-mode literal>`). No handler ran. The
   * confidence was identical for two unrelated problems, because it was a
   * function of which modes were selected and nothing else.
   *
   * Now the mode's real handler runs through `ThoughtFactory`, and every field
   * below is read back off what it produced.
   */
  private runMode(
    mode: ThinkingMode,
    request: MultiModeAnalysisRequest,
  ): Insight[] {
    const input = this.buildModeInput(mode, request);
    const sessionId = request.sessionId ?? `analysis-${randomUUID()}`;

    // The real handler, via ModeHandlerRegistry.
    const thought = this.factory.createThought(input, sessionId);
    // The handler's own advisory feedback. Advisory throughout: it is reported,
    // never used to reject a mode or fail the analysis.
    const validation = this.factory.validate(input);

    return [this.deriveInsight(mode, thought, validation)];
  }

  /**
   * Build the handler input for one mode.
   *
   * `context` is folded into the thought text rather than passed as a field:
   * `ThinkingToolInput` has no context field, and inventing one would put data
   * somewhere no handler reads.
   */
  private buildModeInput(
    mode: ThinkingMode,
    request: MultiModeAnalysisRequest,
  ): ThinkingToolInput {
    const text = request.context
      ? `${request.thought}

Context: ${request.context}`
      : request.thought;

    return {
      thought: text,
      thoughtNumber: 1,
      totalThoughts: 1,
      nextThoughtNeeded: false,
      mode,
    } as ThinkingToolInput;
  }

  /**
   * Turn one handler's output into an insight, inventing nothing.
   *
   * Content comes from two real sources: the mode-specific fields the handler
   * populated, and the handler's own advisories, which name exactly what the
   * mode would need to reason about this problem. Where the old code asserted
   * "Nash equilibrium considerations for ...", this reports that the game
   * theory handler ran, populated no game, and says players and payoffs are
   * required — which is true, and actionable.
   */
  private deriveInsight(
    mode: ThinkingMode,
    thought: Thought,
    validation: ValidationResult,
  ): Insight {
    const populated = this.populatedModeFields(thought);
    const advisories = validation.warnings ?? [];

    const parts: string[] = [];

    if (populated.names.length > 0) {
      parts.push(
        `${mode}: handler populated ${this.describeList(populated.names, populated.truncated)}.`,
      );
    } else {
      parts.push(
        `${mode}: handler ran and populated no mode-specific field from the problem statement alone.`,
      );
    }

    if (advisories.length > 0) {
      const shown = advisories.slice(
        0,
        ANALYZER_CONSTANTS.MAX_ADVISORIES_LISTED,
      );
      const missing = shown
        .map((w) => w.suggestion ?? w.message)
        .filter((t): t is string => Boolean(t));
      const overflow = advisories.length - shown.length;
      parts.push(
        `To reason about this problem it needs: ${missing.join("; ")}` +
          (overflow > 0 ? ` (+${overflow} more)` : "") +
          ".",
      );
    } else {
      parts.push("The handler reported no missing inputs.");
    }

    const content = this.truncate(
      parts.join(" "),
      ANALYZER_CONSTANTS.MAX_INSIGHT_CONTENT,
    );

    // Evidence is the provenance of the two sources above - not prose about
    // what the mode is for. The old code listed "Payoff matrix" as evidence
    // for a game theory insight that had never seen a payoff matrix.
    const evidence = [
      `handler: ${thought.mode}`,
      `populated fields: ${populated.names.length}`,
      `handler advisories: ${advisories.length}`,
    ];

    return {
      id: randomUUID(),
      content,
      sourceMode: mode,
      // Nothing computed a confidence. See NO_CONFIDENCE_NOTE.
      confidence: UNSCORED_INSIGHT_WEIGHT,
      confidenceBasis: "unavailable",
      confidenceNote: NO_CONFIDENCE_NOTE,
      evidence,
      timestamp: new Date(),
      category: this.deriveCategory(mode, thought),
    };
  }

  /**
   * The mode-specific fields a handler actually filled in.
   *
   * Derived by subtracting the `BaseThought` keys, so a new mode needs no
   * change here. Empty arrays, empty objects and empty strings do not count as
   * populated: a handler that defaults a field to `[]` has not analysed
   * anything.
   */
  private populatedModeFields(thought: Thought): {
    names: string[];
    truncated: number;
  } {
    const all = Object.entries(thought as unknown as Record<string, unknown>)
      .filter(([key, value]) => {
        if (BASE_THOUGHT_KEYS.has(key)) return false;
        if (value === undefined || value === null || value === "") return false;
        if (Array.isArray(value)) return value.length > 0;
        if (value instanceof Date) return true;
        if (typeof value === "object") {
          return Object.keys(value as Record<string, unknown>).length > 0;
        }
        return true;
      })
      .map(([key]) => key);

    const shown = all.slice(0, ANALYZER_CONSTANTS.MAX_FIELDS_LISTED);
    return { names: shown, truncated: all.length - shown.length };
  }

  /**
   * Category from the thought's own `thoughtType` where the handler set one,
   * falling back to the mode name. Never invented.
   */
  private deriveCategory(mode: ThinkingMode, thought: Thought): string {
    const thoughtType = (thought as unknown as Record<string, unknown>)
      .thoughtType;
    return typeof thoughtType === "string" && thoughtType.length > 0
      ? thoughtType
      : `${mode}_thought`;
  }

  private describeList(names: string[], truncated: number): string {
    const joined = names.join(", ");
    return truncated > 0 ? `${joined} (+${truncated} more)` : joined;
  }

  private truncate(text: string, max: number): string {
    return text.length <= max ? text : `${text.slice(0, max - 3)}...`;
  }

  /**
   * Collect insights from mode results into a map
   */
  private collectInsights(
    results: Map<ThinkingMode, ModeAnalysisResult>,
  ): Map<ThinkingMode, Insight[]> {
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
  private flattenInsights(
    insightsByMode: Map<ThinkingMode, Insight[]>,
  ): Insight[] {
    const allInsights: Insight[] = [];
    for (const insights of insightsByMode.values()) {
      allInsights.push(...insights);
    }
    return allInsights;
  }

  /**
   * Group insights by their source mode
   */
  private groupInsightsByMode(
    insights: Insight[],
  ): Map<ThinkingMode, Insight[]> {
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
    conflicts: ReturnType<ConflictResolver["detectConflicts"]>,
    modes: ThinkingMode[],
    mergeStrategy:
      "union" | "intersection" | "weighted" | "hierarchical" | "dialectical",
    _startTime: number,
  ): MergedAnalysis {
    const statistics: MergeStatistics = {
      ...mergeResult.statistics,
      conflictsDetected: conflicts.length,
      conflictsResolved: conflicts.filter((c) => c.resolution !== undefined)
        .length,
    };

    // Build supporting evidence map
    const supportingEvidence = new Map<string, ThinkingMode[]>();
    for (const insight of mergeResult.insights) {
      const existing = supportingEvidence.get(insight.id) || [];
      existing.push(insight.sourceMode);
      supportingEvidence.set(insight.id, existing);
    }

    // An overall confidence exists only if some contributing insight has a
    // derived one. Otherwise the mean below is exactly UNSCORED_INSIGHT_WEIGHT
    // and is reported as unavailable rather than dressed up as a score.
    //
    // On today's tool surface `derived` never occurs: `deepthinking_analyze`
    // accepts no mode-specific input, so no handler has anything to compute a
    // confidence from. The branch is the contract for when it does - a mode
    // run with a real prior and likelihood can report a real posterior - and
    // keeping it means that change needs no rework here.
    const derived = mergeResult.insights.filter(
      (i) => i.confidenceBasis === "derived",
    );
    const confidenceBasis: ConfidenceBasis =
      derived.length > 0 ? "derived" : "unavailable";

    // Create synthesized conclusion
    const synthesizedConclusion = this.synthesizeConclusion(
      mergeResult.insights,
      conflicts,
      confidenceBasis,
    );

    return {
      id: randomUUID(),
      primaryInsights: mergeResult.insights,
      supportingEvidence,
      conflicts,
      synthesizedConclusion,
      confidenceScore:
        mergeResult.insights.reduce((acc, i) => acc + i.confidence, 0) /
        Math.max(mergeResult.insights.length, 1),
      confidenceBasis,
      ...(confidenceBasis === "unavailable"
        ? { confidenceNote: NO_CONFIDENCE_NOTE }
        : {}),
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
    conflicts: ReturnType<ConflictResolver["detectConflicts"]>,
    confidenceBasis: ConfidenceBasis = "unavailable",
  ): string {
    if (insights.length === 0) {
      return "No insights generated from the analysis.";
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
    let conclusion = "Multi-mode analysis reveals: ";
    conclusion += topInsights.map((i) => i.content).join(" Furthermore, ");

    if (conflicts.length > 0) {
      conclusion += ` Note: ${conflicts.length} conflict(s) were detected and resolved during synthesis.`;
    }

    // Stated in the conclusion, not only in a sibling field, because this is
    // the string a caller reads. `confidenceScore` is required by the tool's
    // output schema and so is still emitted; without this sentence a caller
    // would read that number as a confidence.
    if (confidenceBasis === "unavailable") {
      conclusion += ` ${NO_CONFIDENCE_NOTE} Treat the reported confidenceScore as unset.`;
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
  private reportProgress(
    callback: ProgressCallback | undefined,
    progress: AnalysisProgress,
  ): void {
    if (callback) {
      callback(progress);
    }

    if (this.config.verbose) {
      console.log(
        `[MultiModeAnalyzer] ${progress.phase}: ${progress.message} (${progress.percentage}%)`,
      );
    }
  }

  /**
   * Create empty response for error cases
   */
  private createEmptyResponse(
    startTime: number,
    errorMessage: string,
  ): MultiModeAnalysisResponse {
    return {
      analysis: {
        id: randomUUID(),
        primaryInsights: [],
        supportingEvidence: new Map(),
        conflicts: [],
        synthesizedConclusion: errorMessage,
        confidenceScore: 0,
        confidenceBasis: "unavailable",
        confidenceNote: "No modes ran, so nothing could be scored.",
        contributingModes: [],
        mergeStrategy: "union",
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
      errors: [
        {
          mode: ThinkingMode.HYBRID,
          message: errorMessage,
          recoverable: false,
        },
      ],
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Convenience function to create and run analysis
 */
export async function analyzeMultiMode(
  request: MultiModeAnalysisRequest,
  config?: MultiModeAnalyzerConfig,
): Promise<MultiModeAnalysisResponse> {
  const analyzer = new MultiModeAnalyzer(config);
  return analyzer.analyze(request);
}
