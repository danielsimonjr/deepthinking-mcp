/**
 * HybridHandler Unit Tests - Phase 10 Sprint 3
 *
 * Tests for the specialized HybridHandler:
 * - Multi-mode combination based on recommendation engine
 * - Convergent validation across reasoning approaches
 * - 97% confidence target through multi-modal synthesis
 * - Problem characteristics inference
 * - Mode recommendation integration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HybridHandler } from '../../../../src/modes/handlers/HybridHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('HybridHandler', () => {
  let handler: HybridHandler;

  beforeEach(() => {
    handler = new HybridHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.HYBRID);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Hybrid Multi-Mode Reasoning');
    });

    it('should have a description mentioning multi-modal', () => {
      expect(handler.description).toBeTruthy();
      expect(handler.description).toContain('multi-modal');
    });
  });

  describe('createThought', () => {
    it('should create a basic hybrid thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Analyzing complex problem',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
      };

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.mode).toBe(ThinkingMode.HYBRID);
      expect(thought.content).toBe('Analyzing complex problem');
      expect(thought.sessionId).toBe('session-1');
    });

    it('should infer problem characteristics from input', () => {
      const input: ThinkingToolInput = {
        thought: 'Analyzing time-dependent sequence with multiple agents',
        thoughtNumber: 1,
        totalThoughts: 8,
        nextThoughtNeeded: true,
        mode: 'hybrid',
      };

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.problemCharacteristics).toBeDefined();
      expect(thought.problemCharacteristics.timeDependent).toBe(true);
      expect(thought.problemCharacteristics.multiAgent).toBe(true);
      expect(thought.problemCharacteristics.complexity).toBe('high'); // 8 > 5
    });

    it('should use provided problem characteristics', () => {
      const input: ThinkingToolInput = {
        thought: 'Complex analysis',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        problemCharacteristics: {
          domain: 'philosophy',
          complexity: 'high',
          uncertainty: 'high',
          requiresExplanation: true,
        },
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.problemCharacteristics.domain).toBe('philosophy');
      expect(thought.problemCharacteristics.complexity).toBe('high');
    });

    it('should select top 3 recommended modes', () => {
      const input: ThinkingToolInput = {
        thought: 'Complex multi-faceted problem',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
      };

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.activeModes).toBeDefined();
      expect(thought.activeModes.length).toBeGreaterThanOrEqual(1);
      expect(thought.selectedRecommendations).toBeDefined();
      expect(thought.selectedRecommendations.length).toBeLessThanOrEqual(3);
    });

    it('should use provided active modes', () => {
      const input: ThinkingToolInput = {
        thought: 'Using specific modes',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        activeModes: ['inductive', 'deductive', 'abductive'],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.activeModes).toContain(ThinkingMode.INDUCTIVE);
      expect(thought.activeModes).toContain(ThinkingMode.DEDUCTIVE);
      expect(thought.activeModes).toContain(ThinkingMode.ABDUCTIVE);
    });

    it('should initialize mode contributions', () => {
      const input: ThinkingToolInput = {
        thought: 'Multi-mode reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        activeModes: ['causal', 'bayesian'],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.modeContributions).toBeDefined();
      expect(thought.modeContributions.length).toBe(2);
      expect(thought.modeContributions[0].mode).toBe(ThinkingMode.CAUSAL);
      expect(thought.modeContributions[0].confidence).toBe(0.5);
    });

    it('should accept provided mode contributions', () => {
      const input: ThinkingToolInput = {
        thought: 'With contributions',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        modeContributions: [
          { mode: 'causal', confidence: 0.8, insights: ['Found causal link'], evidence: ['Data supports'], agreementWithOthers: 0.7 },
          { mode: 'bayesian', confidence: 0.75, insights: ['Updated probability'], evidence: ['Prior + likelihood'], agreementWithOthers: 0.8 },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.modeContributions[0].confidence).toBe(0.8);
      expect(thought.modeContributions[0].insights).toContain('Found causal link');
    });

    it('should calculate convergence status', () => {
      const input: ThinkingToolInput = {
        thought: 'Convergent analysis',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        modeContributions: [
          { mode: 'inductive', confidence: 0.9, insights: [], evidence: [], agreementWithOthers: 0.85 },
          { mode: 'deductive', confidence: 0.85, insights: [], evidence: [], agreementWithOthers: 0.85 },
          { mode: 'abductive', confidence: 0.88, insights: [], evidence: [], agreementWithOthers: 0.9 },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.convergenceStatus).toBeDefined();
      expect(thought.convergenceStatus.totalModes).toBe(3);
      expect(thought.convergenceStatus.modesAgreeing).toBeGreaterThan(0);
      expect(thought.convergenceStatus.targetConfidence).toBe(0.97);
    });

    it('should set default synthesis strategy to parallel', () => {
      const input: ThinkingToolInput = {
        thought: 'Default strategy',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
      };

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.synthesisStrategy).toBe('parallel');
    });

    it('should accept provided synthesis strategy', () => {
      const strategies = ['parallel', 'sequential', 'weighted'] as const;

      for (const strategy of strategies) {
        const input: ThinkingToolInput = {
          thought: 'Custom strategy',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          mode: 'hybrid',
          synthesisStrategy: strategy,
        } as any;

        const thought = handler.createThought(input, 'session-1') as any;
        expect(thought.synthesisStrategy).toBe(strategy);
      }
    });

    it('should calculate overall confidence', () => {
      const input: ThinkingToolInput = {
        thought: 'High confidence analysis',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        modeContributions: [
          { mode: 'causal', confidence: 0.9, insights: [], evidence: [], agreementWithOthers: 0.9 },
          { mode: 'bayesian', confidence: 0.85, insights: [], evidence: [], agreementWithOthers: 0.85 },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.overallConfidence).toBeDefined();
      expect(thought.overallConfidence).toBeGreaterThan(0);
      expect(thought.overallConfidence).toBeLessThanOrEqual(1);
    });

    it('should derive uncertainty from overall confidence', () => {
      const input: ThinkingToolInput = {
        thought: 'Uncertainty derivation',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        overallConfidence: 0.8,
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.uncertainty).toBeCloseTo(0.2, 1); // 1 - 0.8
    });
  });

  describe('validate', () => {
    it('should pass validation for valid input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid hybrid reasoning',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for empty thought', () => {
      const input: ThinkingToolInput = {
        thought: '',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should fail when thoughtNumber exceeds totalThoughts', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 10,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_THOUGHT_NUMBER')).toBe(true);
    });

    it('should warn for unknown thought type', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        thoughtType: 'unknown_type',
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'thoughtType')).toBe(true);
    });

    it('should warn for unknown synthesis strategy', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        synthesisStrategy: 'unknown_strategy',
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'synthesisStrategy')).toBe(true);
    });

    it('should warn when fewer than 2 active modes', () => {
      const input: ThinkingToolInput = {
        thought: 'Single mode',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        activeModes: ['causal'],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'activeModes')).toBe(true);
    });

    it('should warn when more than 5 active modes', () => {
      const input: ThinkingToolInput = {
        thought: 'Many modes',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        activeModes: ['causal', 'bayesian', 'temporal', 'counterfactual', 'abductive', 'deductive'],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'activeModes' && w.message.includes('Many'))).toBe(true);
    });

    it('should warn for mode contribution confidence out of range', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        modeContributions: [
          { mode: 'causal', confidence: 1.5, insights: [], evidence: [], agreementWithOthers: 0.5 },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field?.includes('confidence'))).toBe(true);
    });

    it('should warn for low convergence', () => {
      const input: ThinkingToolInput = {
        thought: 'Low convergence',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        convergenceStatus: {
          currentConfidence: 0.4,
          modesAgreeing: 1,
          totalModes: 3,
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.field === 'convergenceStatus')).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide related modes from active modes', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        activeModes: ['causal', 'bayesian', 'temporal'],
      } as any, 'session-1') as any;

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.CAUSAL);
      expect(enhancements.relatedModes).toContain(ThinkingMode.BAYESIAN);
      expect(enhancements.relatedModes).toContain(ThinkingMode.TEMPORAL);
    });

    it('should provide mental models', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
      }, 'session-1') as any;

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain('Convergent Validation');
      expect(enhancements.mentalModels).toContain('Multi-Modal Synthesis');
      expect(enhancements.mentalModels).toContain('Triangulation');
    });

    it('should add strategy-specific mental models', () => {
      const thought = handler.createThought({
        thought: 'Sequential strategy',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        synthesisStrategy: 'sequential',
      } as any, 'session-1') as any;

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain('Bayesian Updating');
    });

    it('should provide metrics', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        activeModes: ['causal', 'bayesian'],
        overallConfidence: 0.75,
      } as any, 'session-1') as any;

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.activeModeCount).toBe(2);
      expect(enhancements.metrics!.overallConfidence).toBe(0.75);
      expect(enhancements.metrics!.targetConfidence).toBe(0.97);
    });

    it('should warn when convergence not achieved', () => {
      const thought = handler.createThought({
        thought: 'Low convergence',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        modeContributions: [
          { mode: 'causal', confidence: 0.4, insights: [], evidence: [], agreementWithOthers: 0.3 },
          { mode: 'bayesian', confidence: 0.5, insights: [], evidence: [], agreementWithOthers: 0.4 },
        ],
      } as any, 'session-1') as any;

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some(w => w.includes('Convergence not'))).toBe(true);
    });

    it('should note high confidence modes', () => {
      const thought = handler.createThought({
        thought: 'High confidence modes',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        modeContributions: [
          { mode: 'causal', confidence: 0.85, insights: [], evidence: [], agreementWithOthers: 0.8 },
        ],
      } as any, 'session-1') as any;

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('causal') && s.includes('high confidence'))).toBe(true);
    });

    it('should warn about low confidence modes', () => {
      const thought = handler.createThought({
        thought: 'Low confidence mode',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        modeContributions: [
          { mode: 'temporal', confidence: 0.3, insights: [], evidence: [], agreementWithOthers: 0.5 },
        ],
      } as any, 'session-1') as any;

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some(w => w.includes('temporal') && w.includes('low confidence'))).toBe(true);
    });

    it('should provide thought type-specific guidance for mode_selection', () => {
      const thought = handler.createThought({
        thought: 'Selecting modes',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        thoughtType: 'mode_selection',
      } as any, 'session-1') as any;

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some(q => q.includes('modes'))).toBe(true);
    });

    it('should provide thought type-specific guidance for convergence_check', () => {
      const thought = handler.createThought({
        thought: 'Checking convergence',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        thoughtType: 'convergence_check',
      } as any, 'session-1') as any;

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some(q => q.includes('conclusion') || q.includes('agree'))).toBe(true);
    });

    it('should suggest adding mode when confidence gap is large', () => {
      const thought = handler.createThought({
        thought: 'Low confidence',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        overallConfidence: 0.6,
      } as any, 'session-1') as any;

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some(s => s.includes('complementary mode'))).toBe(true);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support mode_selection', () => {
      expect(handler.supportsThoughtType('mode_selection')).toBe(true);
    });

    it('should support parallel_analysis', () => {
      expect(handler.supportsThoughtType('parallel_analysis')).toBe(true);
    });

    it('should support sequential_analysis', () => {
      expect(handler.supportsThoughtType('sequential_analysis')).toBe(true);
    });

    it('should support convergence_check', () => {
      expect(handler.supportsThoughtType('convergence_check')).toBe(true);
    });

    it('should support synthesis', () => {
      expect(handler.supportsThoughtType('synthesis')).toBe(true);
    });

    it('should support confidence_assessment', () => {
      expect(handler.supportsThoughtType('confidence_assessment')).toBe(true);
    });

    it('should support mode_switching', () => {
      expect(handler.supportsThoughtType('mode_switching')).toBe(true);
    });

    it('should not support unknown thought type', () => {
      expect(handler.supportsThoughtType('unknown_type')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete hybrid reasoning session', () => {
      // Step 1: Mode selection
      const step1 = handler.createThought({
        thought: 'Analyzing: What caused the system outage and how to prevent future occurrences?',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        thoughtType: 'mode_selection',
        problemCharacteristics: {
          domain: 'engineering',
          complexity: 'high',
          uncertainty: 'medium',
          timeDependent: true,
          requiresExplanation: true,
          hasAlternatives: true,
        },
      } as any, 'session-1') as any;

      expect(step1.mode).toBe(ThinkingMode.HYBRID);
      expect(step1.activeModes.length).toBeGreaterThanOrEqual(1);

      // Step 2: Parallel analysis with multiple modes
      const step2 = handler.createThought({
        thought: 'Applying causal, temporal, and engineering reasoning in parallel',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        thoughtType: 'parallel_analysis',
        activeModes: ['causal', 'temporal', 'engineering'],
        modeContributions: [
          { mode: 'causal', confidence: 0.7, insights: ['Database connection pool exhausted'], evidence: ['Connection logs'], agreementWithOthers: 0.6 },
          { mode: 'temporal', confidence: 0.65, insights: ['Load spike at 3:00 AM'], evidence: ['Traffic graphs'], agreementWithOthers: 0.7 },
          { mode: 'engineering', confidence: 0.75, insights: ['Pool size undersized'], evidence: ['Configuration review'], agreementWithOthers: 0.8 },
        ],
      } as any, 'session-1') as any;

      expect(step2.modeContributions.length).toBe(3);

      // Step 3: Convergence check
      const step3 = handler.createThought({
        thought: 'Checking if modes agree on root cause',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        thoughtType: 'convergence_check',
        activeModes: ['causal', 'temporal', 'engineering'],
        modeContributions: [
          { mode: 'causal', confidence: 0.85, insights: ['Connection pool is root cause'], evidence: [], agreementWithOthers: 0.85 },
          { mode: 'temporal', confidence: 0.80, insights: ['Timing correlates with pool exhaustion'], evidence: [], agreementWithOthers: 0.85 },
          { mode: 'engineering', confidence: 0.88, insights: ['Pool size is the issue'], evidence: [], agreementWithOthers: 0.9 },
        ],
      } as any, 'session-1') as any;

      expect(step3.convergenceStatus.modesAgreeing).toBeGreaterThan(0);

      // Step 4: Synthesis
      const step4 = handler.createThought({
        thought: 'Root cause: Undersized connection pool exhausted during scheduled batch job at 3 AM',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        thoughtType: 'synthesis',
        synthesisStrategy: 'weighted',
        overallConfidence: 0.92,
      } as any, 'session-1') as any;

      expect(step4.synthesisStrategy).toBe('weighted');
      expect(step4.overallConfidence).toBe(0.92);

      // Step 5: Final confidence assessment
      const step5 = handler.createThought({
        thought: 'Solution: Increase pool size from 50 to 200, add monitoring alerts',
        thoughtNumber: 5,
        totalThoughts: 5,
        nextThoughtNeeded: false,
        mode: 'hybrid',
        thoughtType: 'confidence_assessment',
        overallConfidence: 0.95,
        convergenceStatus: {
          achieved: true,
          modesAgreeing: 3,
          totalModes: 3,
          convergenceScore: 0.9,
        },
      } as any, 'session-1') as any;

      expect(step5.nextThoughtNeeded).toBe(false);
      expect(step5.overallConfidence).toBe(0.95);
    });

    it('should handle mode switching during analysis', () => {
      // Start with initial modes
      const initial = handler.createThought({
        thought: 'Initial analysis with default modes',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        activeModes: ['inductive', 'deductive'],
      } as any, 'session-1') as any;

      expect(initial.activeModes).toContain(ThinkingMode.INDUCTIVE);

      // Switch modes based on problem evolution
      const switched = handler.createThought({
        thought: 'Problem requires probabilistic reasoning, switching modes',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        mode: 'hybrid',
        thoughtType: 'mode_switching',
        activeModes: ['bayesian', 'causal', 'counterfactual'],
        switchReason: 'Discovered uncertainty requires probabilistic approach',
      } as any, 'session-1') as any;

      expect(switched.activeModes).toContain(ThinkingMode.BAYESIAN);
      expect(switched.activeModes).toContain(ThinkingMode.CAUSAL);
      expect(switched.switchReason).toBe('Discovered uncertainty requires probabilistic approach');
    });
  });

  describe('problem characteristics inference', () => {
    it('should infer timeDependent from content', () => {
      const input: ThinkingToolInput = {
        thought: 'Analyzing the sequence of events over time',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
      };

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.problemCharacteristics.timeDependent).toBe(true);
    });

    it('should infer multiAgent from content', () => {
      const input: ThinkingToolInput = {
        thought: 'Considering how multiple agents interact in this system',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
      };

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.problemCharacteristics.multiAgent).toBe(true);
    });

    it('should infer requiresProof from content', () => {
      const input: ThinkingToolInput = {
        thought: 'We need to prove this theorem holds for all cases',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'hybrid',
      };

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.problemCharacteristics.requiresProof).toBe(true);
    });

    it('should infer high complexity from many thoughts', () => {
      const input: ThinkingToolInput = {
        thought: 'Complex analysis',
        thoughtNumber: 1,
        totalThoughts: 10,
        nextThoughtNeeded: true,
        mode: 'hybrid',
      };

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.problemCharacteristics.complexity).toBe('high');
    });

    it('should default requiresExplanation to true', () => {
      const input: ThinkingToolInput = {
        thought: 'Simple thought',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'hybrid',
      };

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.problemCharacteristics.requiresExplanation).toBe(true);
    });
  });
});
