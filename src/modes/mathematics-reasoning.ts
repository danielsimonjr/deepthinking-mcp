/**
 * Mathematics Reasoning Engine - Phase 8 Sprint 3
 *
 * Orchestrates proof decomposition, gap analysis, assumption tracking,
 * inconsistency detection, and circular reasoning detection for
 * mathematical proof analysis.
 */

import type {
  MathematicsThought,
  MathematicsThoughtType,
  ProofDecomposition,
  ConsistencyReport,
  GapAnalysis,
  AssumptionAnalysis,
} from '../types/modes/mathematics.js';
import { ProofDecomposer, type ProofStep } from '../proof/decomposer.js';
import { GapAnalyzer, type GapAnalyzerConfig } from '../proof/gap-analyzer.js';
import { AssumptionTracker } from '../proof/assumption-tracker.js';
import { InconsistencyDetector, type InconsistencyDetectorConfig } from '../proof/inconsistency-detector.js';
import { CircularReasoningDetector } from '../proof/circular-detector.js';

/**
 * Configuration for MathematicsReasoningEngine
 */
export interface MathematicsReasoningEngineConfig {
  /** Enable proof decomposition */
  enableDecomposition: boolean;
  /** Enable gap analysis */
  enableGapAnalysis: boolean;
  /** Enable assumption tracking */
  enableAssumptionTracking: boolean;
  /** Enable inconsistency detection */
  enableInconsistencyDetection: boolean;
  /** Enable circular reasoning detection */
  enableCircularDetection: boolean;
  /** Gap analyzer configuration */
  gapAnalyzerConfig?: Partial<GapAnalyzerConfig>;
  /** Inconsistency detector configuration */
  inconsistencyConfig?: Partial<InconsistencyDetectorConfig>;
}

const DEFAULT_CONFIG: MathematicsReasoningEngineConfig = {
  enableDecomposition: true,
  enableGapAnalysis: true,
  enableAssumptionTracking: true,
  enableInconsistencyDetection: true,
  enableCircularDetection: true,
};

/**
 * Complete proof analysis result
 */
export interface ProofAnalysisResult {
  decomposition?: ProofDecomposition;
  consistencyReport?: ConsistencyReport;
  gapAnalysis?: GapAnalysis;
  assumptionAnalysis?: AssumptionAnalysis;
  overallScore: number;
  recommendations: string[];
  isValid: boolean;
}

/**
 * MathematicsReasoningEngine - Main orchestrator for proof analysis
 */
export class MathematicsReasoningEngine {
  private config: MathematicsReasoningEngineConfig;
  private decomposer: ProofDecomposer;
  private gapAnalyzer: GapAnalyzer;
  private assumptionTracker: AssumptionTracker;
  private inconsistencyDetector: InconsistencyDetector;
  private circularDetector: CircularReasoningDetector;

  constructor(config: Partial<MathematicsReasoningEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.decomposer = new ProofDecomposer();
    this.gapAnalyzer = new GapAnalyzer(this.config.gapAnalyzerConfig);
    this.assumptionTracker = new AssumptionTracker();
    this.inconsistencyDetector = new InconsistencyDetector(this.config.inconsistencyConfig);
    this.circularDetector = new CircularReasoningDetector();
  }

  /**
   * Analyze a proof completely
   *
   * @param proof - Proof text or structured steps
   * @param theorem - Optional theorem being proven
   * @returns Complete analysis result
   */
  analyzeProof(proof: string | ProofStep[], theorem?: string): ProofAnalysisResult {
    const recommendations: string[] = [];
    let overallScore = 1.0;

    // Step 1: Decompose the proof
    let decomposition: ProofDecomposition | undefined;
    if (this.config.enableDecomposition) {
      decomposition = this.decomposer.decompose(proof, theorem);
      overallScore *= decomposition.completeness;
    }

    if (!decomposition) {
      return {
        overallScore: 0,
        recommendations: ['Unable to decompose proof. Please provide proof content.'],
        isValid: false,
      };
    }

    // Step 2: Gap analysis
    let gapAnalysis: GapAnalysis | undefined;
    if (this.config.enableGapAnalysis) {
      gapAnalysis = this.gapAnalyzer.analyzeGaps(decomposition);
      overallScore *= gapAnalysis.completeness;
      recommendations.push(...gapAnalysis.suggestions);
    }

    // Step 3: Assumption analysis
    let assumptionAnalysis: AssumptionAnalysis | undefined;
    if (this.config.enableAssumptionTracking) {
      assumptionAnalysis = this.assumptionTracker.analyzeAssumptions(decomposition);
      const assumptionSuggestions = this.assumptionTracker.getSuggestions(assumptionAnalysis);
      recommendations.push(...assumptionSuggestions);

      // Penalize for unused assumptions
      if (assumptionAnalysis.unusedAssumptions.length > 0) {
        overallScore *= 0.95;
      }
    }

    // Step 4: Inconsistency detection
    let consistencyReport: ConsistencyReport | undefined;
    if (this.config.enableInconsistencyDetection) {
      const inconsistencies = this.inconsistencyDetector.analyze(decomposition);
      const summary = this.inconsistencyDetector.getSummary(inconsistencies);

      // Step 5: Circular reasoning detection
      let circularReasoning: ReturnType<CircularReasoningDetector['detectCircularReasoning']> | undefined;
      if (this.config.enableCircularDetection) {
        circularReasoning = this.circularDetector.detectCircularReasoning(decomposition);
      }

      consistencyReport = {
        isConsistent: summary.isConsistent && !circularReasoning?.hasCircularReasoning,
        overallScore: summary.isConsistent ? overallScore : overallScore * 0.5,
        inconsistencies,
        warnings: inconsistencies
          .filter((i) => i.severity === 'warning')
          .map((i) => i.explanation),
        circularReasoning: circularReasoning?.cycles || [],
        summary: this.generateConsistencySummary(summary, circularReasoning),
      };

      if (!consistencyReport.isConsistent) {
        overallScore *= 0.3;
        recommendations.unshift(consistencyReport.summary);
      }
    }

    const isValid = (consistencyReport?.isConsistent ?? true) && overallScore > 0.5;

    return {
      decomposition,
      consistencyReport,
      gapAnalysis,
      assumptionAnalysis,
      overallScore: Math.max(0, Math.min(1, overallScore)),
      recommendations: this.deduplicateRecommendations(recommendations),
      isValid,
    };
  }

  /**
   * Analyze a specific thought type
   */
  analyzeForThoughtType(
    proof: string | ProofStep[],
    thoughtType: MathematicsThoughtType,
    theorem?: string
  ): Partial<ProofAnalysisResult> {
    switch (thoughtType) {
      case 'proof_decomposition':
        return {
          decomposition: this.decomposer.decompose(proof, theorem),
        };

      case 'dependency_analysis':
        const decomp = this.decomposer.decompose(proof, theorem);
        return {
          decomposition: decomp,
          recommendations: [
            `Proof depth: ${decomp.maxDependencyDepth}`,
            `Atomic statements: ${decomp.atomCount}`,
            `Has cycles: ${decomp.dependencies.hasCycles}`,
          ],
        };

      case 'consistency_check':
        return this.checkConsistency(proof, theorem);

      case 'gap_identification':
        const gapDecomp = this.decomposer.decompose(proof, theorem);
        return {
          gapAnalysis: this.gapAnalyzer.analyzeGaps(gapDecomp),
        };

      case 'assumption_trace':
        const assumptionDecomp = this.decomposer.decompose(proof, theorem);
        return {
          assumptionAnalysis: this.assumptionTracker.analyzeAssumptions(assumptionDecomp),
        };

      default:
        // For other thought types, do full analysis
        return this.analyzeProof(proof, theorem);
    }
  }

  /**
   * Perform only consistency check
   */
  checkConsistency(proof: string | ProofStep[], theorem?: string): Partial<ProofAnalysisResult> {
    const decomposition = this.decomposer.decompose(proof, theorem);
    const inconsistencies = this.inconsistencyDetector.analyze(decomposition);
    const summary = this.inconsistencyDetector.getSummary(inconsistencies);
    const circularReasoning = this.circularDetector.detectCircularReasoning(decomposition);

    const consistencyReport: ConsistencyReport = {
      isConsistent: summary.isConsistent && !circularReasoning.hasCircularReasoning,
      overallScore: summary.isConsistent ? 1 - (summary.warningCount * 0.05) : 0.3,
      inconsistencies,
      warnings: inconsistencies
        .filter((i) => i.severity === 'warning')
        .map((i) => i.explanation),
      circularReasoning: circularReasoning.cycles,
      summary: this.generateConsistencySummary(summary, circularReasoning),
    };

    return {
      decomposition,
      consistencyReport,
      isValid: consistencyReport.isConsistent,
      overallScore: consistencyReport.overallScore,
    };
  }

  /**
   * Generate a comprehensive report
   */
  generateReport(analysisResult: ProofAnalysisResult): string {
    const lines: string[] = [];
    lines.push('# Proof Analysis Report');
    lines.push('');

    // Overall status
    lines.push('## Overall Assessment');
    lines.push(`- **Valid**: ${analysisResult.isValid ? 'Yes' : 'No'}`);
    lines.push(`- **Score**: ${(analysisResult.overallScore * 100).toFixed(1)}%`);
    lines.push('');

    // Decomposition summary
    if (analysisResult.decomposition) {
      const d = analysisResult.decomposition;
      lines.push('## Proof Structure');
      lines.push(`- **Atomic Statements**: ${d.atomCount}`);
      lines.push(`- **Maximum Depth**: ${d.maxDependencyDepth}`);
      lines.push(`- **Rigor Level**: ${d.rigorLevel}`);
      lines.push(`- **Completeness**: ${(d.completeness * 100).toFixed(1)}%`);
      lines.push('');
    }

    // Consistency report
    if (analysisResult.consistencyReport) {
      const c = analysisResult.consistencyReport;
      lines.push('## Consistency Analysis');
      lines.push(`- **Consistent**: ${c.isConsistent ? 'Yes' : 'No'}`);
      lines.push(`- **Inconsistencies Found**: ${c.inconsistencies.length}`);
      lines.push(`- **Circular Reasoning**: ${c.circularReasoning.length > 0 ? 'Detected' : 'None'}`);

      if (c.inconsistencies.length > 0) {
        lines.push('');
        lines.push('### Inconsistencies');
        for (const inc of c.inconsistencies.slice(0, 5)) {
          lines.push(`- [${inc.severity.toUpperCase()}] ${inc.explanation}`);
        }
      }
      lines.push('');
    }

    // Gap analysis
    if (analysisResult.gapAnalysis) {
      const g = analysisResult.gapAnalysis;
      lines.push('## Gap Analysis');
      lines.push(`- **Gaps Found**: ${g.gaps.length}`);
      lines.push(`- **Implicit Assumptions**: ${g.implicitAssumptions.length}`);
      lines.push(`- **Unjustified Steps**: ${g.unjustifiedSteps.length}`);
      lines.push('');
    }

    // Recommendations
    if (analysisResult.recommendations.length > 0) {
      lines.push('## Recommendations');
      for (const rec of analysisResult.recommendations.slice(0, 10)) {
        lines.push(`- ${rec}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Generate consistency summary from analysis results
   */
  private generateConsistencySummary(
    inconsistencySummary: ReturnType<InconsistencyDetector['getSummary']>,
    circularResult?: ReturnType<CircularReasoningDetector['detectCircularReasoning']>
  ): string {
    const parts: string[] = [];

    if (!inconsistencySummary.isConsistent) {
      parts.push(inconsistencySummary.summary);
    }

    if (circularResult?.hasCircularReasoning) {
      parts.push(circularResult.summary);
    }

    if (parts.length === 0) {
      return 'The proof is logically consistent with no circular reasoning detected.';
    }

    return parts.join(' ');
  }

  /**
   * Deduplicate recommendations
   */
  private deduplicateRecommendations(recommendations: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const rec of recommendations) {
      const normalized = rec.toLowerCase().trim();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        result.push(rec);
      }
    }

    return result;
  }

  /**
   * Enhance a MathematicsThought with analysis results
   */
  enhanceThought(
    thought: MathematicsThought,
    proof: string | ProofStep[]
  ): MathematicsThought {
    const analysisResult = this.analyzeForThoughtType(
      proof,
      thought.thoughtType,
      thought.content
    );

    return {
      ...thought,
      decomposition: analysisResult.decomposition,
      consistencyReport: analysisResult.consistencyReport,
      gapAnalysis: analysisResult.gapAnalysis,
      assumptionAnalysis: analysisResult.assumptionAnalysis,
    };
  }

  /**
   * Get engine statistics
   */
  getStats(): {
    features: {
      decomposition: boolean;
      gapAnalysis: boolean;
      assumptionTracking: boolean;
      inconsistencyDetection: boolean;
      circularDetection: boolean;
    };
    version: string;
  } {
    return {
      features: {
        decomposition: this.config.enableDecomposition,
        gapAnalysis: this.config.enableGapAnalysis,
        assumptionTracking: this.config.enableAssumptionTracking,
        inconsistencyDetection: this.config.enableInconsistencyDetection,
        circularDetection: this.config.enableCircularDetection,
      },
      version: '7.0.0', // Phase 8
    };
  }
}
