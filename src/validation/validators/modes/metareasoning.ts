/**
 * Meta-Reasoning Mode Validator
 * Validates reasoning about reasoning - strategy monitoring, evaluation, and recommendations
 */

import { MetaReasoningThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class MetaReasoningValidator extends BaseValidator<MetaReasoningThought> {
  getMode(): string {
    return 'metareasoning';
  }

  validate(thought: MetaReasoningThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate current strategy
    this.validateCurrentStrategy(thought, issues);

    // Validate strategy evaluation
    this.validateStrategyEvaluation(thought, issues);

    // Validate alternative strategies
    this.validateAlternativeStrategies(thought, issues);

    // Validate recommendation
    this.validateRecommendation(thought, issues);

    // Validate resource allocation
    this.validateResourceAllocation(thought, issues);

    // Validate quality metrics
    this.validateQualityMetrics(thought, issues);

    // Validate session context
    this.validateSessionContext(thought, issues);

    return issues;
  }

  private validateCurrentStrategy(
    thought: MetaReasoningThought,
    issues: ValidationIssue[]
  ): void {
    const { currentStrategy } = thought;

    if (!currentStrategy) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Current strategy is required for meta-reasoning',
        suggestion: 'Provide details about the current reasoning strategy being used',
        category: 'structural',
      });
      return;
    }

    if (!currentStrategy.approach || currentStrategy.approach.trim().length === 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Current strategy must describe the approach being used',
        suggestion: 'Describe what reasoning strategy is currently employed',
        category: 'structural',
      });
    }

    if (currentStrategy.thoughtsSpent < 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Thoughts spent cannot be negative',
        suggestion: 'Provide valid count of thoughts used for current strategy',
        category: 'structural',
      });
    }
  }

  private validateStrategyEvaluation(
    thought: MetaReasoningThought,
    issues: ValidationIssue[]
  ): void {
    const { strategyEvaluation } = thought;

    if (!strategyEvaluation) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Strategy evaluation is required for meta-reasoning',
        suggestion: 'Provide assessment of current strategy effectiveness',
        category: 'structural',
      });
      return;
    }

    // Validate metric ranges (all should be 0-1)
    const metrics = [
      { name: 'effectiveness', value: strategyEvaluation.effectiveness },
      { name: 'efficiency', value: strategyEvaluation.efficiency },
      { name: 'confidence', value: strategyEvaluation.confidence },
      { name: 'qualityScore', value: strategyEvaluation.qualityScore },
    ];

    for (const metric of metrics) {
      if (metric.value < 0 || metric.value > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Invalid ${metric.name}: ${metric.value}`,
          suggestion: `${metric.name} must be between 0 and 1`,
          category: 'structural',
        });
      }
    }

    if (strategyEvaluation.progressRate < 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Progress rate cannot be negative',
        suggestion: 'Provide valid progress rate (insights per thought)',
        category: 'structural',
      });
    }

    // Warning if evaluation identifies issues but effectiveness is high
    if (
      strategyEvaluation.issues &&
      strategyEvaluation.issues.length > 0 &&
      strategyEvaluation.effectiveness > 0.8
    ) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'High effectiveness rating despite identified issues',
        suggestion: 'Consider whether effectiveness rating accounts for all identified problems',
        category: 'logical',
      });
    }
  }

  private validateAlternativeStrategies(
    thought: MetaReasoningThought,
    issues: ValidationIssue[]
  ): void {
    const { alternativeStrategies } = thought;

    if (!alternativeStrategies || alternativeStrategies.length === 0) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'No alternative strategies identified',
        suggestion: 'Consider identifying alternative approaches even if current strategy is working',
        category: 'structural',
      });
      return;
    }

    for (const alt of alternativeStrategies) {
      if (alt.switchingCost < 0 || alt.switchingCost > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Invalid switching cost: ${alt.switchingCost}`,
          suggestion: 'Switching cost must be between 0 and 1',
          category: 'structural',
        });
      }

      if (alt.recommendationScore < 0 || alt.recommendationScore > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Invalid recommendation score: ${alt.recommendationScore}`,
          suggestion: 'Recommendation score must be between 0 and 1',
          category: 'structural',
        });
      }
    }
  }

  private validateRecommendation(
    thought: MetaReasoningThought,
    issues: ValidationIssue[]
  ): void {
    const { recommendation } = thought;

    if (!recommendation) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Strategy recommendation is required',
        suggestion: 'Provide actionable recommendation (CONTINUE, SWITCH, REFINE, or COMBINE)',
        category: 'structural',
      });
      return;
    }

    const validActions = ['CONTINUE', 'SWITCH', 'REFINE', 'COMBINE'];
    if (!validActions.includes(recommendation.action)) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Invalid recommendation action: ${recommendation.action}`,
        suggestion: 'Action must be one of: CONTINUE, SWITCH, REFINE, COMBINE',
        category: 'structural',
      });
    }

    if (recommendation.action === 'SWITCH' && !recommendation.targetMode) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'SWITCH action requires targetMode',
        suggestion: 'Specify which mode to switch to',
        category: 'structural',
      });
    }

    if (recommendation.confidence < 0 || recommendation.confidence > 1) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Invalid recommendation confidence: ${recommendation.confidence}`,
        suggestion: 'Confidence must be between 0 and 1',
        category: 'structural',
      });
    }

    if (!recommendation.justification || recommendation.justification.trim().length === 0) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Recommendation lacks justification',
        suggestion: 'Provide reasoning for the recommended action',
        category: 'structural',
      });
    }
  }

  private validateResourceAllocation(
    thought: MetaReasoningThought,
    issues: ValidationIssue[]
  ): void {
    const { resourceAllocation } = thought;

    if (!resourceAllocation) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Resource allocation assessment missing',
        suggestion: 'Consider adding resource allocation guidance',
        category: 'structural',
      });
      return;
    }

    if (resourceAllocation.timeSpent < 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Time spent cannot be negative',
        suggestion: 'Provide valid time spent in milliseconds',
        category: 'structural',
      });
    }

    if (resourceAllocation.thoughtsRemaining < 0) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Thoughts remaining estimate is negative',
        suggestion: 'Provide reasonable estimate of thoughts remaining',
        category: 'logical',
      });
    }
  }

  private validateQualityMetrics(
    thought: MetaReasoningThought,
    issues: ValidationIssue[]
  ): void {
    const { qualityMetrics } = thought;

    if (!qualityMetrics) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Quality metrics missing',
        suggestion: 'Consider assessing reasoning quality metrics',
        category: 'structural',
      });
      return;
    }

    const metrics = [
      { name: 'logicalConsistency', value: qualityMetrics.logicalConsistency },
      { name: 'evidenceQuality', value: qualityMetrics.evidenceQuality },
      { name: 'completeness', value: qualityMetrics.completeness },
      { name: 'originality', value: qualityMetrics.originality },
      { name: 'clarity', value: qualityMetrics.clarity },
      { name: 'overallQuality', value: qualityMetrics.overallQuality },
    ];

    for (const metric of metrics) {
      if (metric.value < 0 || metric.value > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Invalid quality metric ${metric.name}: ${metric.value}`,
          suggestion: `${metric.name} must be between 0 and 1`,
          category: 'structural',
        });
      }
    }

    // Info if overall quality diverges significantly from component metrics
    const componentAvg =
      (qualityMetrics.logicalConsistency +
        qualityMetrics.evidenceQuality +
        qualityMetrics.completeness +
        qualityMetrics.originality +
        qualityMetrics.clarity) /
      5;

    if (Math.abs(qualityMetrics.overallQuality - componentAvg) > 0.3) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: 'Overall quality differs significantly from component average',
        suggestion: 'Ensure overall quality reflects all component metrics appropriately',
        category: 'logical',
      });
    }
  }

  private validateSessionContext(
    thought: MetaReasoningThought,
    issues: ValidationIssue[]
  ): void {
    const { sessionContext } = thought;

    if (!sessionContext) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Session context is required',
        suggestion: 'Provide session context for meta-reasoning',
        category: 'structural',
      });
      return;
    }

    if (sessionContext.totalThoughts < 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Total thoughts cannot be negative',
        suggestion: 'Provide valid count of total thoughts in session',
        category: 'structural',
      });
    }

    if (sessionContext.modeSwitches < 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Mode switches cannot be negative',
        suggestion: 'Provide valid count of mode switches',
        category: 'structural',
      });
    }

    if (
      sessionContext.historicalEffectiveness !== undefined &&
      (sessionContext.historicalEffectiveness < 0 || sessionContext.historicalEffectiveness > 1)
    ) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Historical effectiveness must be between 0 and 1',
        suggestion: 'Provide valid historical effectiveness score',
        category: 'structural',
      });
    }
  }
}
