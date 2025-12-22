/**
 * Analytical Mode Integration Tests - Meta-Reasoning
 *
 * Tests T-ANL-021 through T-ANL-028: Comprehensive integration tests
 * for the deepthinking_analytical tool with metareasoning mode.
 *
 * Phase 11 Sprint 6: Analytical & Scientific Modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type MetaReasoningThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Analytical Mode Integration - Meta-Reasoning', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * Helper to create basic meta-reasoning input
   */
  function createMetaReasoningInput(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Meta-reasoning step',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'metareasoning',
      ...overrides,
    } as ThinkingToolInput;
  }

  /**
   * T-ANL-021: Basic metareasoning thought
   */
  describe('T-ANL-021: Basic MetaReasoning Thought', () => {
    it('should create a basic meta-reasoning thought with minimal params', () => {
      const input = createMetaReasoningInput({
        thought: 'Reflecting on the reasoning process',
      });

      const thought = factory.createThought(input, 'session-meta-021');

      expect(thought.mode).toBe(ThinkingMode.METAREASONING);
      expect(thought.content).toBe('Reflecting on the reasoning process');
      expect(thought.sessionId).toBe('session-meta-021');
    });

    it('should assign unique IDs to meta-reasoning thoughts', () => {
      const input1 = createMetaReasoningInput({ thought: 'First reflection' });
      const input2 = createMetaReasoningInput({ thought: 'Second reflection' });

      const thought1 = factory.createThought(input1, 'session-meta-021');
      const thought2 = factory.createThought(input2, 'session-meta-021');

      expect(thought1.id).not.toBe(thought2.id);
    });

    it('should include default strategy and evaluation', () => {
      const input = createMetaReasoningInput();

      const thought = factory.createThought(input, 'session-meta-021') as MetaReasoningThought;

      expect(thought.currentStrategy).toBeDefined();
      expect(thought.strategyEvaluation).toBeDefined();
    });
  });

  /**
   * T-ANL-022: MetaReasoning strategy evaluation
   */
  describe('T-ANL-022: Strategy Evaluation', () => {
    it('should include detailed strategy evaluation', () => {
      const input = createMetaReasoningInput({
        thought: 'Evaluating current reasoning strategy',
        currentStrategy: {
          mode: ThinkingMode.DEDUCTIVE,
          approach: 'Formal proof construction',
          startedAt: new Date(),
          thoughtsSpent: 5,
          progressIndicators: ['Premises established', 'Intermediate conclusions drawn'],
        },
        strategyEvaluation: {
          effectiveness: 0.8,
          efficiency: 0.7,
          confidence: 0.85,
          progressRate: 0.6,
          qualityScore: 0.75,
          issues: ['Some premises may be incomplete'],
          strengths: ['Clear logical structure', 'Verifiable steps'],
        },
      });

      const thought = factory.createThought(input, 'session-meta-022') as MetaReasoningThought;

      expect(thought.strategyEvaluation.effectiveness).toBe(0.8);
      expect(thought.strategyEvaluation.efficiency).toBe(0.7);
      expect(thought.strategyEvaluation.issues).toHaveLength(1);
      expect(thought.strategyEvaluation.strengths).toHaveLength(2);
    });

    it('should capture quality scores', () => {
      const input = createMetaReasoningInput({
        thought: 'Assessing quality metrics',
        qualityMetrics: {
          logicalConsistency: 0.9,
          evidenceQuality: 0.75,
          completeness: 0.6,
          originality: 0.5,
          clarity: 0.85,
          overallQuality: 0.72,
        },
      });

      const thought = factory.createThought(input, 'session-meta-022') as MetaReasoningThought;

      expect(thought.qualityMetrics.logicalConsistency).toBe(0.9);
      expect(thought.qualityMetrics.completeness).toBe(0.6);
    });
  });

  /**
   * T-ANL-023: MetaReasoning mode switching recommendation
   */
  describe('T-ANL-023: Mode Switching Recommendation', () => {
    it('should recommend mode switching when appropriate', () => {
      const input = createMetaReasoningInput({
        thought: 'Current approach is ineffective, recommending switch',
        currentStrategy: {
          mode: ThinkingMode.DEDUCTIVE,
          approach: 'Attempting formal proof',
          startedAt: new Date(),
          thoughtsSpent: 10,
          progressIndicators: ['Limited progress'],
        },
        strategyEvaluation: {
          effectiveness: 0.3,
          efficiency: 0.2,
          confidence: 0.4,
          progressRate: 0.1,
          qualityScore: 0.35,
          issues: ['Premises are uncertain', 'Problem may be better suited for empirical approach'],
          strengths: [],
        },
        alternativeStrategies: [
          {
            mode: ThinkingMode.INDUCTIVE,
            reasoning: 'Problem involves pattern recognition from observations',
            expectedBenefit: 'Better suited for uncertain premises',
            switchingCost: 0.3,
            recommendationScore: 0.85,
          },
          {
            mode: ThinkingMode.SCIENTIFICMETHOD,
            reasoning: 'Could formulate testable hypotheses',
            expectedBenefit: 'Empirical validation possible',
            switchingCost: 0.4,
            recommendationScore: 0.7,
          },
        ],
        recommendation: {
          action: 'SWITCH',
          targetMode: ThinkingMode.INDUCTIVE,
          justification: 'Current deductive approach struggling with uncertain premises',
          confidence: 0.8,
          expectedImprovement: 'Better handle uncertainty through pattern recognition',
        },
      });

      const thought = factory.createThought(input, 'session-meta-023') as MetaReasoningThought;

      expect(thought.recommendation.action).toBe('SWITCH');
      expect(thought.recommendation.targetMode).toBe(ThinkingMode.INDUCTIVE);
      expect(thought.alternativeStrategies).toHaveLength(2);
    });

    it('should recommend continuing when strategy is effective', () => {
      const input = createMetaReasoningInput({
        thought: 'Current strategy is working well',
        recommendation: {
          action: 'CONTINUE',
          justification: 'Making good progress with current approach',
          confidence: 0.9,
          expectedImprovement: 'Maintain current trajectory',
        },
      });

      const thought = factory.createThought(input, 'session-meta-023') as MetaReasoningThought;

      expect(thought.recommendation.action).toBe('CONTINUE');
    });
  });

  /**
   * T-ANL-024: MetaReasoning quality monitoring
   */
  describe('T-ANL-024: Quality Monitoring', () => {
    it('should monitor reasoning quality metrics', () => {
      const input = createMetaReasoningInput({
        thought: 'Monitoring quality of reasoning process',
        qualityMetrics: {
          logicalConsistency: 0.95,
          evidenceQuality: 0.8,
          completeness: 0.7,
          originality: 0.65,
          clarity: 0.9,
          overallQuality: 0.8,
        },
      });

      const thought = factory.createThought(input, 'session-meta-024') as MetaReasoningThought;

      expect(thought.qualityMetrics.logicalConsistency).toBeGreaterThan(0.9);
      expect(thought.qualityMetrics.overallQuality).toBe(0.8);
    });

    it('should identify quality issues', () => {
      const input = createMetaReasoningInput({
        thought: 'Identifying quality issues',
        qualityMetrics: {
          logicalConsistency: 0.5,
          evidenceQuality: 0.4,
          completeness: 0.3,
          originality: 0.6,
          clarity: 0.7,
          overallQuality: 0.5,
        },
        strategyEvaluation: {
          effectiveness: 0.4,
          efficiency: 0.5,
          confidence: 0.4,
          progressRate: 0.3,
          qualityScore: 0.5,
          issues: [
            'Logical gaps detected',
            'Evidence is weak or missing',
            'Analysis is incomplete',
          ],
          strengths: ['Novel approach'],
        },
      });

      const thought = factory.createThought(input, 'session-meta-024') as MetaReasoningThought;

      expect(thought.strategyEvaluation.issues).toHaveLength(3);
      expect(thought.qualityMetrics.completeness).toBeLessThan(0.5);
    });
  });

  /**
   * T-ANL-025: MetaReasoning resource allocation
   */
  describe('T-ANL-025: Resource Allocation', () => {
    it('should assess resource allocation', () => {
      const input = createMetaReasoningInput({
        thought: 'Assessing cognitive resource allocation',
        resourceAllocation: {
          timeSpent: 300000, // 5 minutes
          thoughtsRemaining: 7,
          complexityLevel: 'high',
          urgency: 'medium',
          recommendation: 'Allocate more depth to core analysis, reduce tangential exploration',
        },
      });

      const thought = factory.createThought(input, 'session-meta-025') as MetaReasoningThought;

      expect(thought.resourceAllocation.timeSpent).toBe(300000);
      expect(thought.resourceAllocation.thoughtsRemaining).toBe(7);
      expect(thought.resourceAllocation.complexityLevel).toBe('high');
    });

    it('should handle urgency levels', () => {
      const highUrgency = createMetaReasoningInput({
        thought: 'High urgency assessment',
        resourceAllocation: {
          timeSpent: 60000,
          thoughtsRemaining: 2,
          complexityLevel: 'medium',
          urgency: 'high',
          recommendation: 'Focus on key conclusions, skip detailed exploration',
        },
      });

      const thought = factory.createThought(highUrgency, 'session-meta-025') as MetaReasoningThought;

      expect(thought.resourceAllocation.urgency).toBe('high');
    });
  });

  /**
   * T-ANL-026: MetaReasoning self-reflection session
   */
  describe('T-ANL-026: Self-Reflection Session', () => {
    it('should support multi-thought self-reflection session', () => {
      const sessionId = 'session-meta-026-reflect';

      // Step 1: Initial assessment
      const step1Input = createMetaReasoningInput({
        thought: 'Step 1: Assessing current reasoning state',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        sessionContext: {
          sessionId,
          totalThoughts: 5,
          modesUsed: [ThinkingMode.DEDUCTIVE, ThinkingMode.INDUCTIVE],
          modeSwitches: 1,
          problemType: 'analytical',
        },
      });
      const step1 = factory.createThought(step1Input, sessionId) as MetaReasoningThought;
      expect(step1.sessionContext.modesUsed).toContain(ThinkingMode.DEDUCTIVE);

      // Step 2: Strategy evaluation
      const step2Input = createMetaReasoningInput({
        thought: 'Step 2: Evaluating strategy effectiveness',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        strategyEvaluation: {
          effectiveness: 0.7,
          efficiency: 0.6,
          confidence: 0.75,
          progressRate: 0.5,
          qualityScore: 0.65,
          issues: ['Could benefit from more structured approach'],
          strengths: ['Good coverage of perspectives'],
        },
      });
      const step2 = factory.createThought(step2Input, sessionId) as MetaReasoningThought;
      expect(step2.strategyEvaluation.effectiveness).toBe(0.7);

      // Step 3: Quality assessment
      const step3Input = createMetaReasoningInput({
        thought: 'Step 3: Assessing reasoning quality',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        qualityMetrics: {
          logicalConsistency: 0.85,
          evidenceQuality: 0.7,
          completeness: 0.6,
          originality: 0.55,
          clarity: 0.8,
          overallQuality: 0.7,
        },
      });
      const step3 = factory.createThought(step3Input, sessionId) as MetaReasoningThought;
      expect(step3.qualityMetrics.clarity).toBe(0.8);

      // Step 4: Recommendation
      const step4Input = createMetaReasoningInput({
        thought: 'Step 4: Final recommendations',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
        recommendation: {
          action: 'REFINE',
          justification: 'Current approach is working but could be more structured',
          confidence: 0.75,
          expectedImprovement: 'Add more systematic validation of conclusions',
        },
      });
      const step4 = factory.createThought(step4Input, sessionId) as MetaReasoningThought;
      expect(step4.recommendation.action).toBe('REFINE');
      expect(step4.nextThoughtNeeded).toBe(false);
    });
  });

  /**
   * T-ANL-027: MetaReasoning with uncertainty assessment
   */
  describe('T-ANL-027: Uncertainty Assessment', () => {
    it('should assess uncertainty in reasoning process', () => {
      const input = createMetaReasoningInput({
        thought: 'Assessing uncertainty across reasoning chain',
        uncertainty: 0.35,
        strategyEvaluation: {
          effectiveness: 0.75,
          efficiency: 0.7,
          confidence: 0.65,
          progressRate: 0.5,
          qualityScore: 0.7,
          issues: ['Some premises have uncertain truth values'],
          strengths: ['Uncertainty is being tracked'],
        },
        qualityMetrics: {
          logicalConsistency: 0.9,
          evidenceQuality: 0.6,
          completeness: 0.7,
          originality: 0.5,
          clarity: 0.8,
          overallQuality: 0.7,
        },
      });

      const thought = factory.createThought(input, 'session-meta-027') as MetaReasoningThought;

      // uncertainty is an input parameter, not on output; check actual output properties
      expect(thought.mode).toBe(ThinkingMode.METAREASONING);
      expect(thought.strategyEvaluation.confidence).toBe(0.65);
    });

    it('should handle high uncertainty scenarios', () => {
      const input = createMetaReasoningInput({
        thought: 'High uncertainty situation analysis',
        uncertainty: 0.8,
        recommendation: {
          action: 'SWITCH',
          targetMode: ThinkingMode.BAYESIAN,
          justification: 'High uncertainty suggests probabilistic reasoning may be more appropriate',
          confidence: 0.6,
          expectedImprovement: 'Better handling of uncertain evidence',
        },
      });

      const thought = factory.createThought(input, 'session-meta-027') as MetaReasoningThought;

      // uncertainty is an input parameter, not on output; check actual output properties
      expect(thought.mode).toBe(ThinkingMode.METAREASONING);
      expect(thought.recommendation.targetMode).toBe(ThinkingMode.BAYESIAN);
    });
  });

  /**
   * T-ANL-028: MetaReasoning multi-thought monitoring
   */
  describe('T-ANL-028: Multi-Thought Monitoring', () => {
    it('should track reasoning across multiple thoughts', () => {
      const sessionId = 'session-meta-028-monitor';

      // First monitoring point
      const monitor1 = createMetaReasoningInput({
        thought: 'Monitoring point 1: Initial analysis',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        sessionContext: {
          sessionId,
          totalThoughts: 3,
          modesUsed: [ThinkingMode.SEQUENTIAL],
          modeSwitches: 0,
          problemType: 'complex-analysis',
        },
        strategyEvaluation: {
          effectiveness: 0.5,
          efficiency: 0.6,
          confidence: 0.55,
          progressRate: 0.4,
          qualityScore: 0.52,
          issues: ['Still early in analysis'],
          strengths: ['Good start'],
        },
      });
      const m1 = factory.createThought(monitor1, sessionId) as MetaReasoningThought;
      expect(m1.strategyEvaluation.effectiveness).toBe(0.5);

      // Second monitoring point
      const monitor2 = createMetaReasoningInput({
        thought: 'Monitoring point 2: Mid-session check',
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        sessionContext: {
          sessionId,
          totalThoughts: 6,
          modesUsed: [ThinkingMode.SEQUENTIAL, ThinkingMode.DEDUCTIVE],
          modeSwitches: 1,
          problemType: 'complex-analysis',
        },
        strategyEvaluation: {
          effectiveness: 0.7,
          efficiency: 0.65,
          confidence: 0.7,
          progressRate: 0.6,
          qualityScore: 0.68,
          issues: ['Some branches need more exploration'],
          strengths: ['Good logical progress', 'Mode switch was effective'],
        },
      });
      const m2 = factory.createThought(monitor2, sessionId) as MetaReasoningThought;
      expect(m2.strategyEvaluation.effectiveness).toBeGreaterThan(m1.strategyEvaluation.effectiveness);
      expect(m2.sessionContext.modeSwitches).toBe(1);

      // Final monitoring point
      const monitor3 = createMetaReasoningInput({
        thought: 'Monitoring point 3: Final assessment',
        thoughtNumber: 3,
        totalThoughts: 3,
        nextThoughtNeeded: false,
        sessionContext: {
          sessionId,
          totalThoughts: 10,
          modesUsed: [ThinkingMode.SEQUENTIAL, ThinkingMode.DEDUCTIVE, ThinkingMode.INDUCTIVE],
          modeSwitches: 2,
          problemType: 'complex-analysis',
          historicalEffectiveness: 0.75,
        },
        strategyEvaluation: {
          effectiveness: 0.85,
          efficiency: 0.8,
          confidence: 0.82,
          progressRate: 0.75,
          qualityScore: 0.8,
          issues: [],
          strengths: ['Comprehensive analysis', 'Multiple perspectives considered', 'Strong conclusions'],
        },
        recommendation: {
          action: 'CONTINUE',
          justification: 'Analysis is complete and comprehensive',
          confidence: 0.85,
          expectedImprovement: 'Ready for conclusion',
        },
      });
      const m3 = factory.createThought(monitor3, sessionId) as MetaReasoningThought;
      expect(m3.strategyEvaluation.effectiveness).toBeGreaterThan(m2.strategyEvaluation.effectiveness);
      expect(m3.sessionContext.modesUsed).toHaveLength(3);
      expect(m3.nextThoughtNeeded).toBe(false);
    });
  });
});
