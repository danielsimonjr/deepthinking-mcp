/**
 * AbductiveHandler - Phase 15 (v8.4.0)
 *
 * Specialized handler for Abductive reasoning (inference to best explanation):
 * - Hypothesis plausibility scoring
 * - Evidence coverage analysis
 * - Competing hypothesis comparison
 * - Occam's razor evaluation
 */

import { randomUUID } from 'crypto';
import {
  ThinkingMode,
  AbductiveThought,
  Observation,
  Hypothesis,
  Evidence,
  EvaluationCriteria,
} from '../../types/core.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ValidationWarning,
  ModeEnhancements,
  validationSuccess,
  createValidationWarning,
} from './ModeHandler.js';

/**
 * AbductiveHandler - Specialized handler for abductive reasoning
 *
 * Provides semantic validation and enhancement:
 * - Evaluates hypothesis plausibility based on evidence coverage
 * - Applies Occam's razor (simpler explanations preferred)
 * - Identifies gaps in evidence coverage
 * - Suggests additional observations to differentiate hypotheses
 */
export class AbductiveHandler implements ModeHandler {
  readonly mode = ThinkingMode.ABDUCTIVE;
  readonly modeName = 'Abductive Reasoning';
  readonly description = 'Inference to best explanation with hypothesis evaluation and evidence coverage';

  /**
   * Create an abductive thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): AbductiveThought {
    const inputAny = input as any;

    // Process observations into proper format
    const observations = this.processObservations(inputAny.observations || []);

    // Process hypotheses into proper format
    const hypotheses = this.processHypotheses(inputAny.hypotheses || []);

    // Score hypotheses if we have observations
    if (observations.length > 0 && hypotheses.length > 0) {
      this.scoreHypotheses(hypotheses, observations);
    }

    // Auto-select best explanation if not provided
    const bestExplanation = inputAny.bestExplanation
      ? this.processHypothesis(inputAny.bestExplanation)
      : this.selectBestExplanation(hypotheses);

    // Process evidence
    const evidence = this.processEvidence(inputAny.evidence || []);

    // Process or create evaluation criteria
    const evaluationCriteria = inputAny.evaluationCriteria
      ? this.processEvaluationCriteria(inputAny.evaluationCriteria)
      : this.getDefaultCriteria();

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
      mode: ThinkingMode.ABDUCTIVE,
      observations,
      hypotheses,
      currentHypothesis: hypotheses[0],
      evaluationCriteria,
      evidence,
      bestExplanation,
    };
  }

  /**
   * Validate abductive-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const warnings: ValidationWarning[] = [];
    const inputAny = input as any;

    // Warn if no observations provided
    if (!inputAny.observations || inputAny.observations.length === 0) {
      warnings.push(
        createValidationWarning(
          'observations',
          'No observations provided',
          'Add observations to ground hypothesis generation'
        )
      );
    }

    // Warn if hypotheses lack explanations
    if (inputAny.hypotheses) {
      const incompleteHypotheses = inputAny.hypotheses.filter(
        (h: any) => !h.explanation || h.explanation.trim() === ''
      );
      if (incompleteHypotheses.length > 0) {
        warnings.push(
          createValidationWarning(
            'hypotheses',
            `${incompleteHypotheses.length} hypothesis/hypotheses lack explanations`,
            'Provide clear explanations for each hypothesis'
          )
        );
      }
    }

    // Warn if only one hypothesis (no comparison possible)
    if (inputAny.hypotheses && inputAny.hypotheses.length === 1) {
      warnings.push(
        createValidationWarning(
          'hypotheses',
          'Only one hypothesis provided',
          'Consider alternative explanations for robust abductive reasoning'
        )
      );
    }

    return validationSuccess(warnings);
  }

  /**
   * Get mode-specific enhancements
   */
  getEnhancements(thought: AbductiveThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.INDUCTIVE, ThinkingMode.BAYESIAN, ThinkingMode.CAUSAL],
      metrics: {},
      guidingQuestions: [],
      mentalModels: [
        "Occam's Razor - prefer simpler explanations",
        'Inference to Best Explanation (IBE)',
        "Peirce's abductive logic",
        'Consilience of inductions',
      ],
    };

    // Calculate metrics
    const hypotheses = thought.hypotheses || [];
    const observations = thought.observations || [];
    const evidence = thought.evidence || [];

    enhancements.metrics = {
      hypothesisCount: hypotheses.length,
      observationCount: observations.length,
      evidenceCount: evidence.length,
      avgScore: this.calculateAverageScore(hypotheses),
      parsimony: thought.evaluationCriteria?.parsimony || 0,
      explanatoryPower: thought.evaluationCriteria?.explanatoryPower || 0,
    };

    // Generate suggestions
    if (hypotheses.length < 2) {
      enhancements.suggestions!.push('Generate alternative hypotheses to compare explanatory power');
    }

    if (observations.length < 3) {
      enhancements.suggestions!.push('Gather more observations to differentiate between hypotheses');
    }

    if (evidence.length === 0) {
      enhancements.suggestions!.push('Collect evidence to support or refute hypotheses');
    }

    // Guiding questions
    enhancements.guidingQuestions = [
      'Which hypothesis best explains ALL observations?',
      'Are there observations that rule out any hypothesis?',
      'What additional evidence would differentiate the hypotheses?',
      'Is the simplest explanation sufficient, or is complexity warranted?',
      'Could multiple hypotheses be combined into a unified explanation?',
    ];

    return enhancements;
  }

  /**
   * Process raw observations into Observation[] format
   */
  private processObservations(raw: any[]): Observation[] {
    return raw.map((obs, index) => {
      if (typeof obs === 'string') {
        return {
          id: `obs-${index}`,
          description: obs,
          confidence: 1.0,
        };
      }
      return {
        id: obs.id || `obs-${index}`,
        description: obs.description || obs.content || String(obs),
        timestamp: obs.timestamp,
        confidence: obs.confidence ?? 1.0,
      };
    });
  }

  /**
   * Process a single hypothesis
   */
  private processHypothesis(raw: any): Hypothesis {
    return {
      id: raw.id || randomUUID(),
      explanation: raw.explanation || raw.description || '',
      assumptions: raw.assumptions || [],
      predictions: raw.predictions || [],
      score: raw.score ?? raw.plausibility ?? 0.5,
    };
  }

  /**
   * Process raw hypotheses into Hypothesis[] format
   */
  private processHypotheses(raw: any[]): Hypothesis[] {
    return raw.map((h) => this.processHypothesis(h));
  }

  /**
   * Process raw evidence into Evidence[] format
   */
  private processEvidence(raw: any[]): Evidence[] {
    return raw.map((e) => ({
      hypothesisId: e.hypothesisId || e.hypothesis || '',
      type: e.type || 'neutral',
      description: e.description || e.content || '',
      strength: e.strength ?? 0.5,
    }));
  }

  /**
   * Process or create evaluation criteria
   */
  private processEvaluationCriteria(raw: any): EvaluationCriteria {
    if (Array.isArray(raw)) {
      // Convert array of criteria to object
      return this.getDefaultCriteria();
    }
    return {
      parsimony: raw.parsimony ?? 0.5,
      explanatoryPower: raw.explanatoryPower ?? 0.5,
      plausibility: raw.plausibility ?? 0.5,
      testability: raw.testability ?? true,
    };
  }

  /**
   * Score hypotheses based on observations
   */
  private scoreHypotheses(hypotheses: Hypothesis[], observations: Observation[]): void {
    for (const h of hypotheses) {
      const coverage = this.calculateCoverage(h, observations);
      const complexity = this.estimateComplexity(h);
      // Score = coverage * (1 - complexity/2)
      h.score = coverage * (1 - complexity / 2);
    }
  }

  /**
   * Calculate how well a hypothesis covers observations
   */
  private calculateCoverage(hypothesis: Hypothesis, observations: Observation[]): number {
    if (observations.length === 0) return 0;
    const explanation = hypothesis.explanation.toLowerCase();
    let covered = 0;
    for (const obs of observations) {
      const terms = obs.description.toLowerCase().split(/\s+/);
      if (terms.some((term) => term.length > 3 && explanation.includes(term))) {
        covered++;
      }
    }
    return covered / observations.length;
  }

  /**
   * Estimate hypothesis complexity (Occam's razor)
   */
  private estimateComplexity(hypothesis: Hypothesis): number {
    const wordCount = hypothesis.explanation.split(/\s+/).length;
    const assumptionCount = hypothesis.assumptions.length;
    return Math.min((wordCount / 100) + (assumptionCount * 0.1), 1);
  }

  /**
   * Select the best explanation based on scores
   */
  private selectBestExplanation(hypotheses: Hypothesis[]): Hypothesis | undefined {
    if (hypotheses.length === 0) return undefined;
    return hypotheses.reduce((a, b) => (a.score > b.score ? a : b));
  }

  /**
   * Calculate average score across hypotheses
   */
  private calculateAverageScore(hypotheses: Hypothesis[]): number {
    if (hypotheses.length === 0) return 0;
    const sum = hypotheses.reduce((acc, h) => acc + h.score, 0);
    return sum / hypotheses.length;
  }

  /**
   * Get default evaluation criteria
   */
  private getDefaultCriteria(): EvaluationCriteria {
    return {
      parsimony: 0.5,
      explanatoryPower: 0.5,
      plausibility: 0.5,
      testability: true,
    };
  }
}
