/**
 * MetaReasoning Validator Tests (Phase 14 Sprint 1)
 * Tests for src/validation/validators/modes/metareasoning.ts
 *
 * Target: >90% branch coverage for 370 lines of validation logic
 * Error paths: ~20, Warning paths: ~2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MetaReasoningValidator } from '../../../../../src/validation/validators/modes/metareasoning.js';
import { ThinkingMode } from '../../../../../src/types/core.js';
import type { MetaReasoningThought, CurrentStrategy, StrategyEvaluation, AlternativeStrategy, StrategyRecommendation, ResourceAllocation, QualityMetrics, SessionContext } from '../../../../../src/types/modes/metareasoning.js';
import type { ValidationContext } from '../../../../../src/validation/validator.js';

describe('MetaReasoningValidator', () => {
  let validator: MetaReasoningValidator;
  let context: ValidationContext;

  // Helper to create valid current strategy
  const createValidCurrentStrategy = (overrides?: Partial<CurrentStrategy>): CurrentStrategy => ({
    mode: ThinkingMode.SEQUENTIAL,
    approach: 'Step-by-step analysis',
    startedAt: new Date(),
    thoughtsSpent: 5,
    progressIndicators: ['Made progress on analysis'],
    ...overrides,
  });

  // Helper to create valid strategy evaluation
  const createValidStrategyEvaluation = (overrides?: Partial<StrategyEvaluation>): StrategyEvaluation => ({
    effectiveness: 0.75,
    efficiency: 0.8,
    confidence: 0.7,
    progressRate: 0.5,
    qualityScore: 0.8,
    issues: [],
    strengths: ['Good logical flow'],
    ...overrides,
  });

  // Helper to create valid alternative strategy
  const createValidAlternativeStrategy = (overrides?: Partial<AlternativeStrategy>): AlternativeStrategy => ({
    mode: ThinkingMode.CAUSAL,
    reasoning: 'Might benefit from causal analysis',
    expectedBenefit: 'Better understanding of cause-effect',
    switchingCost: 0.3,
    recommendationScore: 0.6,
    ...overrides,
  });

  // Helper to create valid recommendation
  const createValidRecommendation = (overrides?: Partial<StrategyRecommendation>): StrategyRecommendation => ({
    action: 'CONTINUE',
    justification: 'Current approach is working well',
    confidence: 0.8,
    expectedImprovement: 'Steady progress expected',
    ...overrides,
  });

  // Helper to create valid resource allocation
  const createValidResourceAllocation = (overrides?: Partial<ResourceAllocation>): ResourceAllocation => ({
    timeSpent: 5000,
    thoughtsRemaining: 10,
    complexityLevel: 'medium',
    urgency: 'low',
    recommendation: 'Continue at current pace',
    ...overrides,
  });

  // Helper to create valid quality metrics
  const createValidQualityMetrics = (overrides?: Partial<QualityMetrics>): QualityMetrics => ({
    logicalConsistency: 0.9,
    evidenceQuality: 0.8,
    completeness: 0.7,
    originality: 0.6,
    clarity: 0.85,
    overallQuality: 0.77,
    ...overrides,
  });

  // Helper to create valid session context
  const createValidSessionContext = (overrides?: Partial<SessionContext>): SessionContext => ({
    sessionId: 'session-123',
    totalThoughts: 10,
    modesUsed: [ThinkingMode.SEQUENTIAL, ThinkingMode.CAUSAL],
    modeSwitches: 2,
    problemType: 'analysis',
    ...overrides,
  });

  // Helper to create a minimal valid thought
  const createBaseThought = (overrides?: Partial<MetaReasoningThought>): MetaReasoningThought => ({
    id: 'thought-1',
    mode: ThinkingMode.METAREASONING,
    thought: 'Meta-reasoning analysis',
    thoughtNumber: 1,
    totalThoughts: 5,
    nextThoughtNeeded: true,
    currentStrategy: createValidCurrentStrategy(),
    strategyEvaluation: createValidStrategyEvaluation(),
    alternativeStrategies: [createValidAlternativeStrategy()],
    recommendation: createValidRecommendation(),
    resourceAllocation: createValidResourceAllocation(),
    qualityMetrics: createValidQualityMetrics(),
    sessionContext: createValidSessionContext(),
    ...overrides,
  });

  beforeEach(() => {
    validator = new MetaReasoningValidator();
    context = {
      sessionId: 'test-session',
      existingThoughts: new Map(),
    };
  });

  describe('getMode', () => {
    it('should return metareasoning', () => {
      expect(validator.getMode()).toBe('metareasoning');
    });
  });

  describe('validate - main entry point', () => {
    it('should accept valid thought with all fields', () => {
      const thought = createBaseThought();
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });
  });

  describe('validateCurrentStrategy', () => {
    it('should accept valid current strategy', () => {
      const thought = createBaseThought();
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error' && i.description.includes('Current strategy'))).toHaveLength(0);
    });

    it('should reject missing currentStrategy', () => {
      const thought = createBaseThought({ currentStrategy: undefined as any });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Current strategy is required'))).toBe(true);
    });

    it('should reject empty approach string', () => {
      const thought = createBaseThought({
        currentStrategy: createValidCurrentStrategy({ approach: '' }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('must describe the approach'))).toBe(true);
    });

    it('should reject whitespace-only approach', () => {
      const thought = createBaseThought({
        currentStrategy: createValidCurrentStrategy({ approach: '   ' }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('must describe the approach'))).toBe(true);
    });

    it('should reject negative thoughtsSpent', () => {
      const thought = createBaseThought({
        currentStrategy: createValidCurrentStrategy({ thoughtsSpent: -1 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Thoughts spent cannot be negative'))).toBe(true);
    });

    it('should accept zero thoughtsSpent', () => {
      const thought = createBaseThought({
        currentStrategy: createValidCurrentStrategy({ thoughtsSpent: 0 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Thoughts spent cannot be negative'))).toBe(false);
    });
  });

  describe('validateStrategyEvaluation', () => {
    it('should accept valid strategy evaluation', () => {
      const thought = createBaseThought();
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error' && i.description.includes('Strategy evaluation'))).toHaveLength(0);
    });

    it('should reject missing strategyEvaluation', () => {
      const thought = createBaseThought({ strategyEvaluation: undefined as any });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Strategy evaluation is required'))).toBe(true);
    });

    it('should reject effectiveness below 0', () => {
      const thought = createBaseThought({
        strategyEvaluation: createValidStrategyEvaluation({ effectiveness: -0.1 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid effectiveness'))).toBe(true);
    });

    it('should reject effectiveness above 1', () => {
      const thought = createBaseThought({
        strategyEvaluation: createValidStrategyEvaluation({ effectiveness: 1.1 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid effectiveness'))).toBe(true);
    });

    it('should reject efficiency below 0', () => {
      const thought = createBaseThought({
        strategyEvaluation: createValidStrategyEvaluation({ efficiency: -0.5 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid efficiency'))).toBe(true);
    });

    it('should reject efficiency above 1', () => {
      const thought = createBaseThought({
        strategyEvaluation: createValidStrategyEvaluation({ efficiency: 2.0 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid efficiency'))).toBe(true);
    });

    it('should reject confidence below 0', () => {
      const thought = createBaseThought({
        strategyEvaluation: createValidStrategyEvaluation({ confidence: -0.1 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid confidence'))).toBe(true);
    });

    it('should reject confidence above 1', () => {
      const thought = createBaseThought({
        strategyEvaluation: createValidStrategyEvaluation({ confidence: 1.5 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid confidence'))).toBe(true);
    });

    it('should reject qualityScore below 0', () => {
      const thought = createBaseThought({
        strategyEvaluation: createValidStrategyEvaluation({ qualityScore: -0.2 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid qualityScore'))).toBe(true);
    });

    it('should reject qualityScore above 1', () => {
      const thought = createBaseThought({
        strategyEvaluation: createValidStrategyEvaluation({ qualityScore: 1.2 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid qualityScore'))).toBe(true);
    });

    it('should reject negative progressRate', () => {
      const thought = createBaseThought({
        strategyEvaluation: createValidStrategyEvaluation({ progressRate: -0.5 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Progress rate cannot be negative'))).toBe(true);
    });

    it('should accept boundary values (0 and 1)', () => {
      const thought = createBaseThought({
        strategyEvaluation: createValidStrategyEvaluation({
          effectiveness: 0,
          efficiency: 1,
          confidence: 0,
          qualityScore: 1,
          progressRate: 0,
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error')).toHaveLength(0);
    });

    it('should warn on high effectiveness despite issues', () => {
      const thought = createBaseThought({
        strategyEvaluation: createValidStrategyEvaluation({
          effectiveness: 0.85,
          issues: ['Issue 1', 'Issue 2'],
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('High effectiveness rating despite identified issues'))).toBe(true);
    });

    it('should not warn when effectiveness <= 0.8 with issues', () => {
      const thought = createBaseThought({
        strategyEvaluation: createValidStrategyEvaluation({
          effectiveness: 0.8,
          issues: ['Issue 1'],
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('High effectiveness rating despite identified issues'))).toBe(false);
    });
  });

  describe('validateAlternativeStrategies', () => {
    it('should accept valid alternative strategies', () => {
      const thought = createBaseThought();
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error' && i.description.includes('alternative'))).toHaveLength(0);
    });

    it('should warn on empty alternatives array', () => {
      const thought = createBaseThought({ alternativeStrategies: [] });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('No alternative strategies identified'))).toBe(true);
    });

    it('should warn on missing alternatives', () => {
      const thought = createBaseThought({ alternativeStrategies: undefined as any });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('No alternative strategies identified'))).toBe(true);
    });

    it('should reject switchingCost below 0', () => {
      const thought = createBaseThought({
        alternativeStrategies: [createValidAlternativeStrategy({ switchingCost: -0.1 })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid switching cost'))).toBe(true);
    });

    it('should reject switchingCost above 1', () => {
      const thought = createBaseThought({
        alternativeStrategies: [createValidAlternativeStrategy({ switchingCost: 1.5 })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid switching cost'))).toBe(true);
    });

    it('should reject recommendationScore below 0', () => {
      const thought = createBaseThought({
        alternativeStrategies: [createValidAlternativeStrategy({ recommendationScore: -0.5 })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid recommendation score'))).toBe(true);
    });

    it('should reject recommendationScore above 1', () => {
      const thought = createBaseThought({
        alternativeStrategies: [createValidAlternativeStrategy({ recommendationScore: 1.2 })],
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid recommendation score'))).toBe(true);
    });

    it('should validate multiple alternative strategies', () => {
      const thought = createBaseThought({
        alternativeStrategies: [
          createValidAlternativeStrategy({ switchingCost: -0.1 }),
          createValidAlternativeStrategy({ recommendationScore: 1.5 }),
        ],
      });
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.description.includes('Invalid switching cost'))).toHaveLength(1);
      expect(issues.filter(i => i.description.includes('Invalid recommendation score'))).toHaveLength(1);
    });
  });

  describe('validateRecommendation', () => {
    it('should accept valid recommendation', () => {
      const thought = createBaseThought();
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error' && i.description.includes('recommendation'))).toHaveLength(0);
    });

    it('should reject missing recommendation', () => {
      const thought = createBaseThought({ recommendation: undefined as any });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Strategy recommendation is required'))).toBe(true);
    });

    it('should reject invalid action', () => {
      const thought = createBaseThought({
        recommendation: createValidRecommendation({ action: 'INVALID' as any }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid recommendation action'))).toBe(true);
    });

    it('should accept all valid actions', () => {
      const validActions = ['CONTINUE', 'SWITCH', 'REFINE', 'COMBINE'];
      for (const action of validActions) {
        const thought = createBaseThought({
          recommendation: createValidRecommendation({
            action: action as any,
            targetMode: action === 'SWITCH' ? ThinkingMode.CAUSAL : undefined,
          }),
        });
        const issues = validator.validate(thought, context);
        expect(issues.some(i => i.description.includes('Invalid recommendation action'))).toBe(false);
      }
    });

    it('should reject SWITCH without targetMode', () => {
      const thought = createBaseThought({
        recommendation: createValidRecommendation({
          action: 'SWITCH',
          targetMode: undefined,
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('SWITCH action requires targetMode'))).toBe(true);
    });

    it('should accept SWITCH with targetMode', () => {
      const thought = createBaseThought({
        recommendation: createValidRecommendation({
          action: 'SWITCH',
          targetMode: ThinkingMode.CAUSAL,
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('SWITCH action requires targetMode'))).toBe(false);
    });

    it('should reject confidence below 0', () => {
      const thought = createBaseThought({
        recommendation: createValidRecommendation({ confidence: -0.1 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid recommendation confidence'))).toBe(true);
    });

    it('should reject confidence above 1', () => {
      const thought = createBaseThought({
        recommendation: createValidRecommendation({ confidence: 1.5 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid recommendation confidence'))).toBe(true);
    });

    it('should warn on missing justification', () => {
      const thought = createBaseThought({
        recommendation: createValidRecommendation({ justification: '' }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('lacks justification'))).toBe(true);
    });

    it('should warn on whitespace-only justification', () => {
      const thought = createBaseThought({
        recommendation: createValidRecommendation({ justification: '   ' }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('lacks justification'))).toBe(true);
    });
  });

  describe('validateResourceAllocation', () => {
    it('should accept valid resource allocation', () => {
      const thought = createBaseThought();
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error' && i.description.includes('resource'))).toHaveLength(0);
    });

    it('should warn on missing resourceAllocation', () => {
      const thought = createBaseThought({ resourceAllocation: undefined as any });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('Resource allocation assessment missing'))).toBe(true);
    });

    it('should reject negative timeSpent', () => {
      const thought = createBaseThought({
        resourceAllocation: createValidResourceAllocation({ timeSpent: -100 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Time spent cannot be negative'))).toBe(true);
    });

    it('should warn on negative thoughtsRemaining', () => {
      const thought = createBaseThought({
        resourceAllocation: createValidResourceAllocation({ thoughtsRemaining: -5 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('Thoughts remaining estimate is negative'))).toBe(true);
    });

    it('should accept zero timeSpent', () => {
      const thought = createBaseThought({
        resourceAllocation: createValidResourceAllocation({ timeSpent: 0 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Time spent cannot be negative'))).toBe(false);
    });
  });

  describe('validateQualityMetrics', () => {
    it('should accept valid quality metrics', () => {
      const thought = createBaseThought();
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error' && i.description.includes('quality metric'))).toHaveLength(0);
    });

    it('should warn on missing qualityMetrics', () => {
      const thought = createBaseThought({ qualityMetrics: undefined as any });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'warning' && i.description.includes('Quality metrics missing'))).toBe(true);
    });

    it('should reject logicalConsistency below 0', () => {
      const thought = createBaseThought({
        qualityMetrics: createValidQualityMetrics({ logicalConsistency: -0.1 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid quality metric logicalConsistency'))).toBe(true);
    });

    it('should reject evidenceQuality above 1', () => {
      const thought = createBaseThought({
        qualityMetrics: createValidQualityMetrics({ evidenceQuality: 1.5 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid quality metric evidenceQuality'))).toBe(true);
    });

    it('should reject completeness below 0', () => {
      const thought = createBaseThought({
        qualityMetrics: createValidQualityMetrics({ completeness: -0.5 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid quality metric completeness'))).toBe(true);
    });

    it('should reject originality above 1', () => {
      const thought = createBaseThought({
        qualityMetrics: createValidQualityMetrics({ originality: 2.0 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid quality metric originality'))).toBe(true);
    });

    it('should reject clarity below 0', () => {
      const thought = createBaseThought({
        qualityMetrics: createValidQualityMetrics({ clarity: -1.0 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid quality metric clarity'))).toBe(true);
    });

    it('should reject overallQuality above 1', () => {
      const thought = createBaseThought({
        qualityMetrics: createValidQualityMetrics({ overallQuality: 1.1 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Invalid quality metric overallQuality'))).toBe(true);
    });

    it('should info on significant divergence between overallQuality and component average', () => {
      // Component average: (0.9 + 0.8 + 0.7 + 0.6 + 0.85) / 5 = 0.77
      // Overall quality: 0.2 (diverges by more than 0.3)
      const thought = createBaseThought({
        qualityMetrics: createValidQualityMetrics({ overallQuality: 0.2 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.severity === 'info' && i.description.includes('differs significantly from component average'))).toBe(true);
    });

    it('should not warn when overallQuality is close to component average', () => {
      // Component average: (0.8 + 0.8 + 0.8 + 0.8 + 0.8) / 5 = 0.8
      // Overall quality: 0.8 (no divergence)
      const thought = createBaseThought({
        qualityMetrics: createValidQualityMetrics({
          logicalConsistency: 0.8,
          evidenceQuality: 0.8,
          completeness: 0.8,
          originality: 0.8,
          clarity: 0.8,
          overallQuality: 0.8,
        }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('differs significantly from component average'))).toBe(false);
    });
  });

  describe('validateSessionContext', () => {
    it('should accept valid session context', () => {
      const thought = createBaseThought();
      const issues = validator.validate(thought, context);
      expect(issues.filter(i => i.severity === 'error' && i.description.includes('session'))).toHaveLength(0);
    });

    it('should reject missing sessionContext', () => {
      const thought = createBaseThought({ sessionContext: undefined as any });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Session context is required'))).toBe(true);
    });

    it('should reject negative totalThoughts', () => {
      const thought = createBaseThought({
        sessionContext: createValidSessionContext({ totalThoughts: -1 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Total thoughts cannot be negative'))).toBe(true);
    });

    it('should reject negative modeSwitches', () => {
      const thought = createBaseThought({
        sessionContext: createValidSessionContext({ modeSwitches: -5 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Mode switches cannot be negative'))).toBe(true);
    });

    it('should accept zero totalThoughts and modeSwitches', () => {
      const thought = createBaseThought({
        sessionContext: createValidSessionContext({ totalThoughts: 0, modeSwitches: 0 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Total thoughts cannot be negative'))).toBe(false);
      expect(issues.some(i => i.description.includes('Mode switches cannot be negative'))).toBe(false);
    });

    it('should reject historicalEffectiveness below 0', () => {
      const thought = createBaseThought({
        sessionContext: createValidSessionContext({ historicalEffectiveness: -0.1 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Historical effectiveness must be between 0 and 1'))).toBe(true);
    });

    it('should reject historicalEffectiveness above 1', () => {
      const thought = createBaseThought({
        sessionContext: createValidSessionContext({ historicalEffectiveness: 1.5 }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Historical effectiveness must be between 0 and 1'))).toBe(true);
    });

    it('should accept undefined historicalEffectiveness', () => {
      const thought = createBaseThought({
        sessionContext: createValidSessionContext({ historicalEffectiveness: undefined }),
      });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Historical effectiveness must be between 0 and 1'))).toBe(false);
    });

    it('should accept boundary values for historicalEffectiveness', () => {
      const thought0 = createBaseThought({
        sessionContext: createValidSessionContext({ historicalEffectiveness: 0 }),
      });
      const thought1 = createBaseThought({
        sessionContext: createValidSessionContext({ historicalEffectiveness: 1 }),
      });
      expect(validator.validate(thought0, context).some(i => i.description.includes('Historical effectiveness'))).toBe(false);
      expect(validator.validate(thought1, context).some(i => i.description.includes('Historical effectiveness'))).toBe(false);
    });
  });

  describe('validateCommon (inherited)', () => {
    it('should reject negative thoughtNumber', () => {
      const thought = createBaseThought({ thoughtNumber: -1 });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('Thought number must be positive'))).toBe(true);
    });

    it('should reject thoughtNumber exceeding totalThoughts', () => {
      const thought = createBaseThought({ thoughtNumber: 10, totalThoughts: 5 });
      const issues = validator.validate(thought, context);
      expect(issues.some(i => i.description.includes('exceeds total'))).toBe(true);
    });
  });
});
