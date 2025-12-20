/**
 * ScientificMethodHandler - Phase 15 (v8.4.0)
 *
 * Specialized handler for Scientific Method reasoning:
 * - Hypothesis formulation validation
 * - Experiment design checking
 * - Falsifiability assessment
 * - Result interpretation analysis
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, ScientificMethodThought } from '../../types/core.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ValidationWarning,
  ModeEnhancements,
  validationSuccess,
  createValidationWarning,
} from './ModeHandler.js';

type ScientificMethodThoughtType = 'question_formulation' | 'hypothesis_generation' | 'experiment_design' | 'data_collection' | 'analysis' | 'conclusion';

/**
 * ScientificMethodHandler - Specialized handler for scientific method reasoning
 *
 * Provides semantic validation and enhancement:
 * - Validates hypothesis falsifiability
 * - Checks experiment design quality
 * - Analyzes prediction specificity
 * - Suggests control variables
 */
export class ScientificMethodHandler implements ModeHandler {
  readonly mode = ThinkingMode.SCIENTIFICMETHOD;
  readonly modeName = 'Scientific Method';
  readonly description = 'Hypothesis testing with experimental design and falsifiability analysis';

  private readonly supportedThoughtTypes: ScientificMethodThoughtType[] = [
    'question_formulation',
    'hypothesis_generation',
    'experiment_design',
    'data_collection',
    'analysis',
    'conclusion',
  ];

  /**
   * Create a scientific method thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): ScientificMethodThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

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
      mode: ThinkingMode.SCIENTIFICMETHOD,
      thoughtType,
      researchQuestion: inputAny.researchQuestion,
      scientificHypotheses: inputAny.scientificHypotheses || [],
      experiment: inputAny.experiment,
      data: inputAny.data,
      analysis: inputAny.analysis,
      conclusion: inputAny.conclusion,
    };
  }

  /**
   * Validate scientific method-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const warnings: ValidationWarning[] = [];
    const inputAny = input as any;

    // Check for research question
    if (!inputAny.researchQuestion) {
      warnings.push(
        createValidationWarning(
          'researchQuestion',
          'No research question defined',
          'Formulate a clear research question'
        )
      );
    }

    // Check hypothesis formulation
    if (inputAny.scientificHypotheses && inputAny.scientificHypotheses.length > 0) {
      for (const hyp of inputAny.scientificHypotheses) {
        if (!hyp.testable) {
          warnings.push(
            createValidationWarning(
              'scientificHypotheses',
              `Hypothesis "${hyp.statement?.slice(0, 30)}..." may not be testable`,
              'Ensure hypotheses are empirically testable'
            )
          );
        }
        if (!hyp.falsifiable) {
          warnings.push(
            createValidationWarning(
              'scientificHypotheses',
              `Hypothesis "${hyp.statement?.slice(0, 30)}..." may not be falsifiable`,
              'Ensure hypotheses can be proven false'
            )
          );
        }
      }
    } else {
      warnings.push(
        createValidationWarning(
          'scientificHypotheses',
          'No hypotheses defined',
          'Formulate testable hypotheses based on your research question'
        )
      );
    }

    // Check experiment design
    if (inputAny.experiment) {
      if (!inputAny.experiment.controls || inputAny.experiment.controls.length === 0) {
        warnings.push(
          createValidationWarning(
            'experiment.controls',
            'No control conditions specified',
            'Define control conditions for valid comparison'
          )
        );
      }
      if (!inputAny.experiment.sampleSize || inputAny.experiment.sampleSize < 10) {
        warnings.push(
          createValidationWarning(
            'experiment.sampleSize',
            'Sample size may be insufficient',
            'Consider power analysis for adequate sample size'
          )
        );
      }
    }

    return validationSuccess(warnings);
  }

  /**
   * Get mode-specific enhancements
   */
  getEnhancements(thought: ScientificMethodThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.ABDUCTIVE, ThinkingMode.INDUCTIVE, ThinkingMode.BAYESIAN],
      metrics: {},
      guidingQuestions: [],
      mentalModels: [
        'Popperian Falsificationism',
        'Hypothetico-Deductive Method',
        'Control Variables',
        'Reproducibility',
        'Statistical Significance',
        'Null Hypothesis Testing',
      ],
    };

    const hypotheses = thought.scientificHypotheses || [];
    const hasExperiment = !!thought.experiment;
    const hasData = !!thought.data;
    const hasAnalysis = !!thought.analysis;
    const hasConclusion = !!thought.conclusion;

    // Calculate metrics
    enhancements.metrics = {
      hypothesisCount: hypotheses.length,
      hasResearchQuestion: thought.researchQuestion ? 1 : 0,
      hasExperiment: hasExperiment ? 1 : 0,
      hasData: hasData ? 1 : 0,
      hasAnalysis: hasAnalysis ? 1 : 0,
      hasConclusion: hasConclusion ? 1 : 0,
    };

    // Stage-specific suggestions
    if (!thought.researchQuestion) {
      enhancements.suggestions!.push('Start by formulating a clear research question');
    } else if (hypotheses.length === 0) {
      enhancements.suggestions!.push('Derive specific, testable hypotheses from your research question');
    } else if (!hasExperiment) {
      enhancements.suggestions!.push('Design an experiment to test your hypotheses');
    } else if (!hasData) {
      enhancements.suggestions!.push('Collect data according to your experimental design');
    } else if (!hasAnalysis) {
      enhancements.suggestions!.push('Analyze data using appropriate statistical methods');
    } else if (!hasConclusion) {
      enhancements.suggestions!.push('Draw conclusions based on your analysis results');
    }

    // Guiding questions
    enhancements.guidingQuestions = [
      'What would falsify this hypothesis?',
      'Are there confounding variables to control for?',
      'Is the experiment reproducible by others?',
      'What is the null hypothesis?',
      'How large a sample size is needed for significance?',
      'Are there alternative hypotheses that explain the same observations?',
    ];

    return enhancements;
  }

  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as ScientificMethodThoughtType);
  }

  /**
   * Resolve thought type to valid ScientificMethodThoughtType
   */
  private resolveThoughtType(inputType: string | undefined): ScientificMethodThoughtType {
    if (inputType && this.supportedThoughtTypes.includes(inputType as ScientificMethodThoughtType)) {
      return inputType as ScientificMethodThoughtType;
    }
    return 'question_formulation';
  }
}
