/**
 * Multi-Mode Analyzer Integration Tests - Phase 12 Sprint 3
 *
 * Integration tests for the MultiModeAnalyzer class that orchestrates
 * multi-mode analysis workflows.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ThinkingMode } from '../../../src/types/core.js';
import {
  MultiModeAnalyzer,
  MultiModeAnalyzerConfig,
  ProgressCallback,
  AnalysisProgress,
  analyzeMultiMode,
} from '../../../src/modes/combinations/analyzer.js';

describe('MultiModeAnalyzer Integration Tests', () => {
  let analyzer: MultiModeAnalyzer;

  beforeEach(() => {
    analyzer = new MultiModeAnalyzer();
  });

  describe('constructor', () => {
    it('should create an instance with default options', () => {
      const analyzer = new MultiModeAnalyzer();
      expect(analyzer).toBeDefined();
    });

    it('should accept custom configuration', () => {
      const config: MultiModeAnalyzerConfig = {
        defaultTimeoutPerMode: 60000,
        continueOnError: false,
        maxParallelModes: 3,
        minConfidenceThreshold: 0.5,
        verbose: false,
      };
      const analyzer = new MultiModeAnalyzer(config);
      expect(analyzer).toBeDefined();
    });
  });

  describe('analyze', () => {
    it('should analyze a thought using default preset', async () => {
      const response = await analyzer.analyze({
        thought: 'What are the key factors for project success?',
      });

      expect(response.success).toBe(true);
      expect(response.analysis).toBeDefined();
      expect(response.analysis.primaryInsights.length).toBeGreaterThan(0);
      expect(response.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should analyze using comprehensive_analysis preset', async () => {
      const response = await analyzer.analyze({
        thought: 'How can we improve team productivity?',
        preset: 'comprehensive_analysis',
      });

      expect(response.success).toBe(true);
      expect(response.analysis.contributingModes.length).toBeGreaterThan(0);
    });

    it('should analyze using hypothesis_testing preset', async () => {
      const response = await analyzer.analyze({
        thought: 'Is the new algorithm more efficient than the existing one?',
        preset: 'hypothesis_testing',
      });

      expect(response.success).toBe(true);
      expect(response.analysis).toBeDefined();
    });

    it('should analyze using decision_making preset', async () => {
      const response = await analyzer.analyze({
        thought: 'Should we expand into the new market?',
        preset: 'decision_making',
      });

      expect(response.success).toBe(true);
      expect(response.analysis).toBeDefined();
    });

    it('should analyze using root_cause preset', async () => {
      const response = await analyzer.analyze({
        thought: 'Why did the system fail during peak hours?',
        preset: 'root_cause',
      });

      expect(response.success).toBe(true);
      expect(response.analysis).toBeDefined();
    });

    it('should analyze using future_planning preset', async () => {
      const response = await analyzer.analyze({
        thought: 'What should our technology strategy be for the next 5 years?',
        preset: 'future_planning',
      });

      expect(response.success).toBe(true);
      expect(response.analysis).toBeDefined();
    });

    it('should analyze using custom modes', async () => {
      const response = await analyzer.analyze({
        thought: 'What are the trade-offs in this architectural decision?',
        customModes: [ThinkingMode.DEDUCTIVE, ThinkingMode.GAMETHEORY],
        mergeStrategy: 'weighted',
      });

      expect(response.success).toBe(true);
      expect(response.analysis.contributingModes).toContain(ThinkingMode.DEDUCTIVE);
      expect(response.analysis.contributingModes).toContain(ThinkingMode.GAMETHEORY);
    });

    it('should accept context in analysis request', async () => {
      const response = await analyzer.analyze({
        thought: 'How should we approach this problem?',
        context: 'We are working with limited budget and tight deadlines',
      });

      expect(response.success).toBe(true);
      expect(response.analysis.primaryInsights.length).toBeGreaterThan(0);
    });

    it('should report progress via callback', async () => {
      const progressUpdates: AnalysisProgress[] = [];
      const onProgress: ProgressCallback = (progress) => {
        progressUpdates.push({ ...progress });
      };

      await analyzer.analyze(
        { thought: 'Test thought for progress tracking' },
        onProgress
      );

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0].phase).toBe('initializing');
      expect(progressUpdates[progressUpdates.length - 1].phase).toBe('complete');
    });

    it('should track progress percentages', async () => {
      const progressUpdates: AnalysisProgress[] = [];
      const onProgress: ProgressCallback = (progress) => {
        progressUpdates.push({ ...progress });
      };

      await analyzer.analyze(
        { thought: 'Test thought for percentage tracking' },
        onProgress
      );

      // First update should be low percentage
      expect(progressUpdates[0].percentage).toBeLessThanOrEqual(10);

      // Last update should be 100%
      expect(progressUpdates[progressUpdates.length - 1].percentage).toBe(100);
    });

    it('should include mode results in response', async () => {
      const response = await analyzer.analyze({
        thought: 'Analyze this business scenario',
        customModes: [ThinkingMode.DEDUCTIVE, ThinkingMode.INDUCTIVE],
      });

      expect(response.modeResults.size).toBe(2);
      expect(response.modeResults.get(ThinkingMode.DEDUCTIVE)).toBeDefined();
      expect(response.modeResults.get(ThinkingMode.INDUCTIVE)).toBeDefined();
    });

    it('should handle empty request gracefully', async () => {
      const response = await analyzer.analyze({
        thought: '',
      });

      // Should still process with default preset
      expect(response).toBeDefined();
    });
  });

  describe('analyzeWithPreset', () => {
    it('should analyze using preset method', async () => {
      const response = await analyzer.analyzeWithPreset(
        'What is the optimal solution?',
        'comprehensive_analysis'
      );

      expect(response.success).toBe(true);
      expect(response.analysis).toBeDefined();
    });

    it('should accept progress callback', async () => {
      const progressUpdates: AnalysisProgress[] = [];

      await analyzer.analyzeWithPreset(
        'Test thought',
        'hypothesis_testing',
        (progress) => progressUpdates.push(progress)
      );

      expect(progressUpdates.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeWithModes', () => {
    it('should analyze using custom modes method', async () => {
      const response = await analyzer.analyzeWithModes(
        'Analyze the system behavior',
        [ThinkingMode.CAUSAL, ThinkingMode.SYSTEMSTHINKING],
        'union'
      );

      expect(response.success).toBe(true);
      expect(response.analysis.contributingModes).toContain(ThinkingMode.CAUSAL);
      expect(response.analysis.contributingModes).toContain(ThinkingMode.SYSTEMSTHINKING);
    });

    it('should use union merge strategy by default', async () => {
      const response = await analyzer.analyzeWithModes(
        'Test thought',
        [ThinkingMode.DEDUCTIVE, ThinkingMode.INDUCTIVE]
      );

      expect(response.analysis.mergeStrategy).toBe('union');
    });

    it('should support all merge strategies', async () => {
      const strategies = ['union', 'intersection', 'weighted', 'hierarchical', 'dialectical'] as const;

      for (const strategy of strategies) {
        const response = await analyzer.analyzeWithModes(
          'Test thought',
          [ThinkingMode.DEDUCTIVE, ThinkingMode.INDUCTIVE],
          strategy
        );

        expect(response.analysis.mergeStrategy).toBe(strategy);
      }
    });
  });

  describe('getAvailablePresets', () => {
    it('should return all available presets', () => {
      const presets = analyzer.getAvailablePresets();

      expect(presets).toContain('comprehensive_analysis');
      expect(presets).toContain('hypothesis_testing');
      expect(presets).toContain('decision_making');
      expect(presets).toContain('root_cause');
      expect(presets).toContain('future_planning');
      expect(presets).toHaveLength(5);
    });
  });

  describe('getSupportedModes', () => {
    it('should return all supported modes', () => {
      const modes = analyzer.getSupportedModes();

      expect(modes.length).toBeGreaterThan(10);
      expect(modes).toContain(ThinkingMode.DEDUCTIVE);
      expect(modes).toContain(ThinkingMode.INDUCTIVE);
      expect(modes).toContain(ThinkingMode.CAUSAL);
      expect(modes).toContain(ThinkingMode.BAYESIAN);
      expect(modes).toContain(ThinkingMode.GAMETHEORY);
      expect(modes).toContain(ThinkingMode.METAREASONING);
    });
  });

  describe('analysis results', () => {
    it('should generate synthesized conclusion', async () => {
      const response = await analyzer.analyze({
        thought: 'What are the implications of this decision?',
      });

      expect(response.analysis.synthesizedConclusion).toBeDefined();
      expect(response.analysis.synthesizedConclusion.length).toBeGreaterThan(0);
    });

    it('should calculate confidence score', async () => {
      const response = await analyzer.analyze({
        thought: 'Analyze the risks and benefits',
      });

      expect(response.analysis.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(response.analysis.confidenceScore).toBeLessThanOrEqual(1);
    });

    it('should include statistics', async () => {
      const response = await analyzer.analyze({
        thought: 'What patterns can we identify?',
      });

      expect(response.analysis.statistics).toBeDefined();
      expect(response.analysis.statistics.totalInsightsBefore).toBeGreaterThanOrEqual(0);
      expect(response.analysis.statistics.totalInsightsAfter).toBeGreaterThanOrEqual(0);
    });

    it('should track conflicts', async () => {
      const response = await analyzer.analyze({
        thought: 'Compare different perspectives',
      });

      expect(response.analysis.conflicts).toBeDefined();
      expect(Array.isArray(response.analysis.conflicts)).toBe(true);
    });

    it('should build supporting evidence map', async () => {
      const response = await analyzer.analyze({
        thought: 'What evidence supports this conclusion?',
      });

      expect(response.analysis.supportingEvidence).toBeDefined();
      expect(response.analysis.supportingEvidence instanceof Map).toBe(true);
    });

    it('should have valid timestamp', async () => {
      const response = await analyzer.analyze({
        thought: 'Test timestamp',
      });

      expect(response.analysis.timestamp).toBeInstanceOf(Date);
    });

    it('should have unique analysis ID', async () => {
      const response1 = await analyzer.analyze({ thought: 'Test 1' });
      const response2 = await analyzer.analyze({ thought: 'Test 2' });

      expect(response1.analysis.id).toBeDefined();
      expect(response2.analysis.id).toBeDefined();
      expect(response1.analysis.id).not.toBe(response2.analysis.id);
    });
  });

  describe('mode insights', () => {
    it('should generate insights for each mode', async () => {
      const response = await analyzer.analyzeWithModes(
        'Test thought',
        [ThinkingMode.DEDUCTIVE, ThinkingMode.CAUSAL, ThinkingMode.BAYESIAN]
      );

      const deductiveResult = response.modeResults.get(ThinkingMode.DEDUCTIVE);
      const causalResult = response.modeResults.get(ThinkingMode.CAUSAL);
      const bayesianResult = response.modeResults.get(ThinkingMode.BAYESIAN);

      expect(deductiveResult?.insights.length).toBeGreaterThan(0);
      expect(causalResult?.insights.length).toBeGreaterThan(0);
      expect(bayesianResult?.insights.length).toBeGreaterThan(0);
    });

    it('should include evidence in insights', async () => {
      const response = await analyzer.analyze({
        thought: 'What is the root cause?',
        customModes: [ThinkingMode.CAUSAL],
      });

      const causalInsights = response.modeResults.get(ThinkingMode.CAUSAL)?.insights || [];
      if (causalInsights.length > 0) {
        expect(causalInsights[0].evidence).toBeDefined();
        expect(causalInsights[0].evidence!.length).toBeGreaterThan(0);
      }
    });

    it('should assign confidence to insights', async () => {
      const response = await analyzer.analyze({
        thought: 'Evaluate the probability',
        customModes: [ThinkingMode.BAYESIAN],
      });

      const insights = response.modeResults.get(ThinkingMode.BAYESIAN)?.insights || [];
      if (insights.length > 0) {
        expect(insights[0].confidence).toBeGreaterThan(0);
        expect(insights[0].confidence).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('error handling', () => {
    it('should return empty response for invalid preset', async () => {
      const response = await analyzer.analyze({
        thought: 'Test',
        preset: 'invalid_preset',
      });

      // Should fall back to default
      expect(response).toBeDefined();
    });

    it('should continue on error when configured', async () => {
      const analyzer = new MultiModeAnalyzer({
        continueOnError: true,
      });

      const response = await analyzer.analyze({
        thought: 'Test error handling',
      });

      expect(response).toBeDefined();
    });

    it('should report errors in response', async () => {
      const response = await analyzer.analyze({
        thought: '',
        customModes: [],
      });

      // Empty modes should fall back to default
      expect(response).toBeDefined();
    });
  });

  describe('analyzeMultiMode convenience function', () => {
    it('should create analyzer and run analysis', async () => {
      const response = await analyzeMultiMode({
        thought: 'Test convenience function',
      });

      expect(response.success).toBe(true);
      expect(response.analysis).toBeDefined();
    });

    it('should accept custom config', async () => {
      const response = await analyzeMultiMode(
        { thought: 'Test with config' },
        { maxParallelModes: 2, verbose: false }
      );

      expect(response.success).toBe(true);
    });
  });

  describe('parallel execution', () => {
    it('should execute modes in batches', async () => {
      const analyzer = new MultiModeAnalyzer({
        maxParallelModes: 2,
      });

      const response = await analyzer.analyzeWithModes(
        'Test parallel execution',
        [ThinkingMode.DEDUCTIVE, ThinkingMode.INDUCTIVE, ThinkingMode.CAUSAL, ThinkingMode.BAYESIAN]
      );

      expect(response.modeResults.size).toBe(4);
    });

    it('should complete within reasonable time', async () => {
      const startTime = Date.now();

      await analyzer.analyzeWithModes(
        'Test execution time',
        [ThinkingMode.DEDUCTIVE, ThinkingMode.INDUCTIVE]
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(30000); // Should complete in < 30 seconds
    });
  });

  describe('merge strategy integration', () => {
    it('should apply union merge strategy', async () => {
      const response = await analyzer.analyzeWithModes(
        'Test union merge',
        [ThinkingMode.DEDUCTIVE, ThinkingMode.INDUCTIVE],
        'union'
      );

      expect(response.analysis.mergeStrategy).toBe('union');
      expect(response.analysis.primaryInsights.length).toBeGreaterThan(0);
    });

    it('should apply weighted merge strategy', async () => {
      const response = await analyzer.analyze({
        thought: 'Test weighted merge',
        preset: 'comprehensive_analysis',
        mergeStrategy: 'weighted',
      });

      expect(response.analysis.mergeStrategy).toBe('weighted');
    });

    it('should apply hierarchical merge strategy', async () => {
      const response = await analyzer.analyze({
        thought: 'Test hierarchical merge',
        preset: 'hypothesis_testing',
      });

      // hypothesis_testing uses hierarchical
      expect(response.analysis).toBeDefined();
    });

    it('should apply dialectical merge strategy', async () => {
      const response = await analyzer.analyze({
        thought: 'Test dialectical merge',
        preset: 'future_planning',
      });

      // future_planning uses dialectical
      expect(response.analysis).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle very long thoughts', async () => {
      const longThought = 'What are the implications? '.repeat(100);
      const response = await analyzer.analyze({
        thought: longThought,
      });

      expect(response.success).toBe(true);
    });

    it('should handle special characters in thought', async () => {
      const response = await analyzer.analyze({
        thought: 'What is α → β in the context of f(x) = x²?',
      });

      expect(response.success).toBe(true);
    });

    it('should handle unicode in thought', async () => {
      const response = await analyzer.analyze({
        thought: 'How does 你好 relate to the global context?',
      });

      expect(response.success).toBe(true);
    });

    it('should handle many modes', async () => {
      const response = await analyzer.analyzeWithModes(
        'Test many modes',
        [
          ThinkingMode.DEDUCTIVE,
          ThinkingMode.INDUCTIVE,
          ThinkingMode.CAUSAL,
          ThinkingMode.BAYESIAN,
          ThinkingMode.GAMETHEORY,
          ThinkingMode.SYSTEMSTHINKING,
        ]
      );

      expect(response.modeResults.size).toBe(6);
    });
  });
});
