/**
 * MetaReasoningHandler Unit Tests
 *
 * Tests for Meta-Reasoning mode handler including:
 * - Strategy evaluation and monitoring
 * - Mode switching recommendations
 * - Resource allocation assessment
 * - Quality metrics tracking
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MetaReasoningHandler } from '../../../../src/modes/handlers/MetaReasoningHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('MetaReasoningHandler', () => {
  let handler: MetaReasoningHandler;

  beforeEach(() => {
    handler = new MetaReasoningHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.METAREASONING);
    });

    it('should have descriptive mode name', () => {
      expect(handler.modeName).toBe('Meta-Reasoning');
    });

    it('should have meaningful description', () => {
      expect(handler.description).toContain('reasoning');
      expect(handler.description).toContain('strategy');
    });
  });

  describe('createThought', () => {
    it('should create basic meta-reasoning thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Evaluating current reasoning strategy',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.METAREASONING);
      expect(thought.content).toBe('Evaluating current reasoning strategy');
      expect(thought.sessionId).toBe('session-123');
    });

    it('should include current strategy', () => {
      const input: any = {
        thought: 'Evaluating sequential approach',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        currentStrategy: {
          mode: ThinkingMode.SEQUENTIAL,
          approach: 'step-by-step analysis',
          thoughtsSpent: 3,
          progressIndicators: ['Problem defined', 'Data gathered'],
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.currentStrategy.mode).toBe(ThinkingMode.SEQUENTIAL);
      expect(thought.currentStrategy.thoughtsSpent).toBe(3);
    });

    it('should include strategy evaluation', () => {
      const input: any = {
        thought: 'Assessing effectiveness',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        strategyEvaluation: {
          effectiveness: 0.7,
          efficiency: 0.6,
          confidence: 0.8,
          qualityScore: 0.75,
          issues: ['Slow progress'],
          strengths: ['Thorough analysis'],
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.strategyEvaluation.effectiveness).toBe(0.7);
      expect(thought.strategyEvaluation.issues).toContain('Slow progress');
      expect(thought.strategyEvaluation.strengths).toContain('Thorough analysis');
    });

    it('should include alternative strategies', () => {
      const input: any = {
        thought: 'Considering alternatives',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        alternativeStrategies: [
          {
            mode: ThinkingMode.CAUSAL,
            reasoning: 'Problem has causal structure',
            expectedBenefit: 'Better capture of dependencies',
            switchingCost: 0.2,
            recommendationScore: 0.8,
          },
          {
            mode: ThinkingMode.BAYESIAN,
            reasoning: 'High uncertainty present',
            expectedBenefit: 'Better uncertainty quantification',
            switchingCost: 0.3,
            recommendationScore: 0.6,
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.alternativeStrategies.length).toBe(2);
      expect(thought.alternativeStrategies[0].mode).toBe(ThinkingMode.CAUSAL);
    });

    it('should include recommendation', () => {
      const input: any = {
        thought: 'Making recommendation',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        recommendation: {
          action: 'SWITCH',
          targetMode: ThinkingMode.CAUSAL,
          justification: 'Causal analysis is more appropriate',
          confidence: 0.85,
          expectedImprovement: '25% better accuracy',
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.recommendation.action).toBe('SWITCH');
      expect(thought.recommendation.targetMode).toBe(ThinkingMode.CAUSAL);
    });

    it('should generate recommendation automatically', () => {
      const input: any = {
        thought: 'Auto recommendation',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        strategyEvaluation: {
          effectiveness: 0.3, // Low effectiveness
          efficiency: 0.4,
        },
        alternativeStrategies: [
          {
            mode: ThinkingMode.HYBRID,
            recommendationScore: 0.8,
            expectedBenefit: 'Better multi-perspective',
          },
        ],
      };

      const thought = handler.createThought(input, 'session-123');

      // Should recommend SWITCH because effectiveness is low
      expect(thought.recommendation.action).toBe('SWITCH');
    });

    it('should include resource allocation', () => {
      const input: any = {
        thought: 'Resource assessment',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        resourceAllocation: {
          timeSpent: 300,
          thoughtsRemaining: 3,
          complexityLevel: 'high',
          urgency: 'medium',
          recommendation: 'Focus on critical path',
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.resourceAllocation.complexityLevel).toBe('high');
      expect(thought.resourceAllocation.thoughtsRemaining).toBe(3);
    });

    it('should include quality metrics', () => {
      const input: any = {
        thought: 'Quality assessment',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        qualityMetrics: {
          logicalConsistency: 0.9,
          evidenceQuality: 0.7,
          completeness: 0.6,
          originality: 0.8,
          clarity: 0.85,
          overallQuality: 0.77,
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.qualityMetrics.logicalConsistency).toBe(0.9);
      expect(thought.qualityMetrics.overallQuality).toBe(0.77);
    });

    it('should include session context', () => {
      const input: any = {
        thought: 'Session context',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        sessionContext: {
          totalThoughts: 10,
          modesUsed: [ThinkingMode.SEQUENTIAL, ThinkingMode.CAUSAL],
          modeSwitches: 1,
          problemType: 'optimization',
        },
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.sessionContext.modeSwitches).toBe(1);
      expect(thought.sessionContext.modesUsed.length).toBe(2);
    });

    it('should track revision information', () => {
      const input: ThinkingToolInput = {
        thought: 'Revised evaluation',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        isRevision: true,
        revisesThought: 'thought-2',
      };

      const thought = handler.createThought(input, 'session-123');

      expect(thought.isRevision).toBe(true);
      expect(thought.revisesThought).toBe('thought-2');
    });
  });

  describe('validate', () => {
    it('should validate basic meta-reasoning input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid meta-reasoning thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should reject empty thought', () => {
      const input: ThinkingToolInput = {
        thought: '',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('EMPTY_THOUGHT');
    });

    it('should reject invalid thought number', () => {
      const input: ThinkingToolInput = {
        thought: 'Meta-reasoning',
        thoughtNumber: 10,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_THOUGHT_NUMBER');
    });

    it('should warn about missing current strategy', () => {
      const input: ThinkingToolInput = {
        thought: 'Meta-reasoning without strategy',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'currentStrategy')).toBe(true);
    });

    it('should warn about out of range scores', () => {
      const input: any = {
        thought: 'Meta-reasoning with bad scores',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        strategyEvaluation: {
          effectiveness: 1.5, // Out of range
          efficiency: -0.1, // Out of range
        },
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field.includes('effectiveness'))).toBe(true);
    });

    it('should warn about unknown action', () => {
      const input: any = {
        thought: 'Unknown action',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        recommendation: {
          action: 'UNKNOWN_ACTION',
        },
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'recommendation.action')).toBe(true);
    });

    it('should warn about SWITCH without alternatives', () => {
      const input: any = {
        thought: 'Switch without alternatives',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        recommendation: {
          action: 'SWITCH',
        },
      };

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'alternativeStrategies')).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide base enhancements', () => {
      const input: any = {
        thought: 'Meta-reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        currentStrategy: { mode: ThinkingMode.SEQUENTIAL, approach: 'linear' },
        strategyEvaluation: { effectiveness: 0.5, efficiency: 0.5, confidence: 0.5, issues: [], strengths: [] },
        recommendation: { action: 'CONTINUE', confidence: 0.5 },
        alternativeStrategies: [],
        resourceAllocation: { thoughtsRemaining: 4 },
        qualityMetrics: { logicalConsistency: 0.7, completeness: 0.5 },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.HYBRID);
      expect(enhancements.mentalModels).toContain('Metacognition');
      expect(enhancements.mentalModels).toContain('Strategy Selection');
    });

    it('should include metrics', () => {
      const input: any = {
        thought: 'Meta-reasoning with metrics',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        currentStrategy: { mode: ThinkingMode.SEQUENTIAL, approach: 'linear', thoughtsSpent: 2 },
        strategyEvaluation: {
          effectiveness: 0.8,
          efficiency: 0.7,
          confidence: 0.9,
          qualityScore: 0.85,
          issues: [],
          strengths: [],
        },
        alternativeStrategies: [{}, {}],
        recommendation: { action: 'CONTINUE', confidence: 0.9 },
        resourceAllocation: { thoughtsRemaining: 3, complexityLevel: 'medium', urgency: 'low' },
        qualityMetrics: { overallQuality: 0.8, logicalConsistency: 0.9, completeness: 0.7 },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.effectiveness).toBe(0.8);
      expect(enhancements.metrics?.alternativeCount).toBe(2);
      expect(enhancements.metrics?.thoughtsSpent).toBe(2);
    });

    it('should warn about low effectiveness', () => {
      const input: any = {
        thought: 'Low effectiveness',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        currentStrategy: { mode: ThinkingMode.SEQUENTIAL, approach: 'linear' },
        strategyEvaluation: {
          effectiveness: 0.3, // Low
          efficiency: 0.5,
          confidence: 0.5,
          issues: [],
          strengths: [],
        },
        alternativeStrategies: [],
        recommendation: { action: 'REFINE', confidence: 0.6 },
        resourceAllocation: { thoughtsRemaining: 3 },
        qualityMetrics: { logicalConsistency: 0.7, completeness: 0.5 },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings).toContainEqual(
        expect.stringContaining('Low effectiveness')
      );
    });

    it('should indicate highly effective strategy', () => {
      const input: any = {
        thought: 'High effectiveness',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        currentStrategy: { mode: ThinkingMode.CAUSAL, approach: 'graph-based' },
        strategyEvaluation: {
          effectiveness: 0.9, // High
          efficiency: 0.8,
          confidence: 0.85,
          issues: [],
          strengths: ['Clear causal paths'],
        },
        alternativeStrategies: [],
        recommendation: { action: 'CONTINUE', confidence: 0.9 },
        resourceAllocation: { thoughtsRemaining: 3 },
        qualityMetrics: { logicalConsistency: 0.9, completeness: 0.8 },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('highly effective')
      );
    });

    it('should warn about low efficiency', () => {
      const input: any = {
        thought: 'Low efficiency',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        currentStrategy: { mode: ThinkingMode.SEQUENTIAL, approach: 'linear' },
        strategyEvaluation: {
          effectiveness: 0.6,
          efficiency: 0.3, // Low
          confidence: 0.5,
          issues: [],
          strengths: [],
        },
        alternativeStrategies: [],
        recommendation: { action: 'REFINE', confidence: 0.5 },
        resourceAllocation: { thoughtsRemaining: 3 },
        qualityMetrics: { logicalConsistency: 0.7, completeness: 0.5 },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings).toContainEqual(
        expect.stringContaining('Low efficiency')
      );
    });

    it('should warn about few remaining thoughts', () => {
      const input: any = {
        thought: 'Few thoughts left',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        currentStrategy: { mode: ThinkingMode.SEQUENTIAL, approach: 'linear' },
        strategyEvaluation: {
          effectiveness: 0.6,
          efficiency: 0.6,
          confidence: 0.5,
          issues: [],
          strengths: [],
        },
        alternativeStrategies: [],
        recommendation: { action: 'CONTINUE', confidence: 0.5 },
        resourceAllocation: { thoughtsRemaining: 1 },
        qualityMetrics: { logicalConsistency: 0.7, completeness: 0.5 },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings).toContainEqual(
        expect.stringContaining('Few thoughts remaining')
      );
    });

    it('should warn about low logical consistency', () => {
      const input: any = {
        thought: 'Low consistency',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        currentStrategy: { mode: ThinkingMode.SEQUENTIAL, approach: 'linear' },
        strategyEvaluation: {
          effectiveness: 0.6,
          efficiency: 0.6,
          confidence: 0.5,
          issues: [],
          strengths: [],
        },
        alternativeStrategies: [],
        recommendation: { action: 'CONTINUE', confidence: 0.5 },
        resourceAllocation: { thoughtsRemaining: 3 },
        qualityMetrics: { logicalConsistency: 0.4, completeness: 0.5 },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings).toContainEqual(
        expect.stringContaining('Low logical consistency')
      );
    });

    it('should include guiding questions', () => {
      const input: any = {
        thought: 'Meta-reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        currentStrategy: { mode: ThinkingMode.SEQUENTIAL, approach: 'linear' },
        strategyEvaluation: { effectiveness: 0.5, efficiency: 0.5, confidence: 0.5, issues: [], strengths: [] },
        recommendation: { action: 'CONTINUE', confidence: 0.5 },
        alternativeStrategies: [],
        resourceAllocation: { thoughtsRemaining: 4 },
        qualityMetrics: { logicalConsistency: 0.7, completeness: 0.5 },
      };

      const thought = handler.createThought(input, 'session-123');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions?.length).toBeGreaterThan(0);
      expect(enhancements.guidingQuestions).toContainEqual(
        expect.stringContaining('progress')
      );
    });
  });

  describe('supportsThoughtType', () => {
    it('should support all valid meta-reasoning thought types', () => {
      const validTypes = [
        'strategy_evaluation',
        'mode_switch',
        'resource_allocation',
        'quality_assessment',
        'progress_monitoring',
        'strategy_recommendation',
      ];

      for (const type of validTypes) {
        expect(handler.supportsThoughtType(type)).toBe(true);
      }
    });

    it('should not support invalid thought types', () => {
      expect(handler.supportsThoughtType('invalid_type')).toBe(false);
      expect(handler.supportsThoughtType('mathematics')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete meta-reasoning session', () => {
      // Step 1: Initial strategy evaluation
      const step1: any = {
        thought: 'Evaluating the current sequential reasoning strategy',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        currentStrategy: {
          mode: ThinkingMode.SEQUENTIAL,
          approach: 'step-by-step analysis',
          thoughtsSpent: 5,
          progressIndicators: ['Problem defined', 'Initial data gathered'],
        },
        strategyEvaluation: {
          effectiveness: 0.4,
          efficiency: 0.3,
          confidence: 0.5,
          qualityScore: 0.4,
          issues: ['Slow progress', 'Missing causal connections'],
          strengths: ['Thorough coverage'],
        },
      };

      const thought1 = handler.createThought(step1, 'meta-session');
      expect(thought1.strategyEvaluation.effectiveness).toBe(0.4);

      // Step 2: Consider alternatives
      const step2: any = {
        thought: 'Considering alternative reasoning strategies',
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'metareasoning',
        currentStrategy: step1.currentStrategy,
        strategyEvaluation: step1.strategyEvaluation,
        alternativeStrategies: [
          {
            mode: ThinkingMode.CAUSAL,
            reasoning: 'Problem has clear causal structure',
            expectedBenefit: 'Better capture dependencies',
            switchingCost: 0.2,
            recommendationScore: 0.8,
          },
          {
            mode: ThinkingMode.HYBRID,
            reasoning: 'Could benefit from multiple perspectives',
            expectedBenefit: 'Comprehensive analysis',
            switchingCost: 0.3,
            recommendationScore: 0.7,
          },
        ],
        qualityMetrics: {
          logicalConsistency: 0.6,
          evidenceQuality: 0.5,
          completeness: 0.4,
          overallQuality: 0.5,
        },
      };

      const thought2 = handler.createThought(step2, 'meta-session');
      expect(thought2.alternativeStrategies.length).toBe(2);

      // Step 3: Make recommendation
      const step3: any = {
        thought: 'Recommending strategy switch to causal reasoning',
        thoughtNumber: 3,
        totalThoughts: 3,
        nextThoughtNeeded: false,
        mode: 'metareasoning',
        currentStrategy: step1.currentStrategy,
        strategyEvaluation: step1.strategyEvaluation,
        alternativeStrategies: step2.alternativeStrategies,
        recommendation: {
          action: 'SWITCH',
          targetMode: ThinkingMode.CAUSAL,
          justification: 'Causal reasoning better suited for dependency analysis',
          confidence: 0.85,
          expectedImprovement: 'Better capture of cause-effect relationships',
        },
        resourceAllocation: {
          thoughtsRemaining: 0,
          complexityLevel: 'medium',
          urgency: 'medium',
        },
        qualityMetrics: step2.qualityMetrics,
      };

      const thought3 = handler.createThought(step3, 'meta-session');
      expect(thought3.recommendation.action).toBe('SWITCH');
      expect(thought3.recommendation.targetMode).toBe(ThinkingMode.CAUSAL);
      expect(thought3.nextThoughtNeeded).toBe(false);

      // Validate all steps
      const validations = [step1, step2, step3].map((s) => handler.validate(s));
      for (const v of validations) {
        expect(v.valid).toBe(true);
      }

      // Check final enhancements
      const enhancements = handler.getEnhancements(thought3);
      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('SWITCH')
      );
      expect(enhancements.suggestions).toContainEqual(
        expect.stringContaining('causal')
      );
    });
  });
});
