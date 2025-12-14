/**
 * CritiqueHandler - Phase 10 Sprint 2B (v8.2.0)
 *
 * Specialized handler for Critique reasoning mode with:
 * - Socratic question framework (6 categories)
 * - Balanced critique tracking (strengths vs weaknesses)
 * - Methodology evaluation validation
 * - Argument structure analysis
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, CritiqueThought } from '../../types/core.js';
import type {
  CritiqueThoughtType,
  CritiquedWork,
  CritiquePoint,
  MethodologyEvaluation,
  ArgumentCritique,
  CritiqueVerdict,
} from '../../types/modes/critique.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

/**
 * Socratic Question Categories
 * Based on Richard Paul's taxonomy of Socratic questioning
 */
interface SocraticCategory {
  name: string;
  description: string;
  purpose: string;
  exampleQuestions: string[];
}

const SOCRATIC_CATEGORIES: SocraticCategory[] = [
  {
    name: 'Clarification',
    description: 'Questions that probe for clarity and understanding',
    purpose: 'Ensure clear understanding before critique',
    exampleQuestions: [
      'What do you mean by...?',
      'Could you put that another way?',
      'What is your main point?',
      'Could you give me an example?',
      'Can you explain that term?',
    ],
  },
  {
    name: 'Assumptions',
    description: 'Questions that probe underlying assumptions',
    purpose: 'Uncover hidden assumptions that may be flawed',
    exampleQuestions: [
      'What are you assuming here?',
      'Is that always the case?',
      'Why would you assume that?',
      'What could we assume instead?',
      'What if the opposite were true?',
    ],
  },
  {
    name: 'Evidence',
    description: 'Questions that probe reasons and evidence',
    purpose: 'Evaluate the quality and relevance of evidence',
    exampleQuestions: [
      'What evidence supports this?',
      'How do you know this is true?',
      'What would change your mind?',
      'Is there counter-evidence?',
      'How reliable is this source?',
    ],
  },
  {
    name: 'Perspectives',
    description: 'Questions that probe viewpoints and perspectives',
    purpose: 'Consider alternative viewpoints',
    exampleQuestions: [
      'What would X say about this?',
      'How might others view this?',
      'What is an alternative interpretation?',
      'Who benefits from this view?',
      'What perspective is missing?',
    ],
  },
  {
    name: 'Implications',
    description: 'Questions that probe implications and consequences',
    purpose: 'Explore logical consequences of claims',
    exampleQuestions: [
      'What follows from this?',
      'What are the consequences?',
      'How does this affect...?',
      'If this is true, what else must be true?',
      'What are the risks?',
    ],
  },
  {
    name: 'Meta',
    description: 'Questions about the question itself',
    purpose: 'Examine the reasoning process',
    exampleQuestions: [
      'Why is this question important?',
      'What makes this hard to answer?',
      'What do we need to know to answer this?',
      'How can we find out?',
      'What assumptions underlie this question?',
    ],
  },
];

/**
 * CritiqueHandler - Specialized handler for critical analysis
 *
 * Provides semantic validation beyond schema validation:
 * - Validates critique balance (strengths vs weaknesses)
 * - Generates Socratic questions based on critique type
 * - Validates methodology evaluation ratings
 * - Checks argument structure for completeness
 */
export class CritiqueHandler implements ModeHandler {
  readonly mode = ThinkingMode.CRITIQUE;
  readonly modeName = 'Critical Analysis';
  readonly description = 'Scholarly critique with Socratic questioning, balanced evaluation, and methodology assessment';

  /**
   * Supported thought types for critique mode
   */
  private readonly supportedThoughtTypes: CritiqueThoughtType[] = [
    'work_characterization',
    'methodology_evaluation',
    'argument_analysis',
    'evidence_assessment',
    'contribution_evaluation',
    'limitation_identification',
    'strength_recognition',
    'improvement_suggestion',
  ];

  /**
   * Create a critique thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): CritiqueThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

    // Build work being critiqued
    const work: CritiquedWork = inputAny.work || {
      id: randomUUID().slice(0, 8),
      title: 'Untitled Work',
      authors: [],
      year: new Date().getFullYear(),
      type: 'empirical_study',
      field: 'Unknown',
      claimedContribution: '',
    };

    // Calculate balance metrics
    const critiquePoints = inputAny.critiquePoints || [];
    const strengthsIdentified = critiquePoints.filter(
      (p: CritiquePoint) => p.type === 'strength'
    ).length;
    const weaknessesIdentified = critiquePoints.filter(
      (p: CritiquePoint) => p.type === 'weakness' || p.type === 'concern'
    ).length;
    const balanceRatio = this.calculateBalanceRatio(strengthsIdentified, weaknessesIdentified);

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
      mode: ThinkingMode.CRITIQUE,
      thoughtType,
      work,
      methodologyEvaluation: inputAny.methodologyEvaluation,
      argumentCritique: inputAny.argumentCritique,
      evidenceCritique: inputAny.evidenceCritique,
      contributionEvaluation: inputAny.contributionEvaluation,
      critiquePoints,
      improvements: inputAny.improvements || [],
      verdict: inputAny.verdict,
      strengthsIdentified,
      weaknessesIdentified,
      balanceRatio,
      dependencies: inputAny.dependencies || [],
      assumptions: inputAny.assumptions || [],
      uncertainty: inputAny.uncertainty ?? 0.5,
      keyInsight: inputAny.keyInsight,
    } as CritiqueThought;
  }

  /**
   * Validate critique-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors = [];
    const warnings = [];
    const inputAny = input as any;

    // Basic validation
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError('thought', 'Thought content is required', 'EMPTY_THOUGHT'),
      ]);
    }

    if (input.thoughtNumber > input.totalThoughts) {
      return validationFailure([
        createValidationError(
          'thoughtNumber',
          `Thought number (${input.thoughtNumber}) exceeds total thoughts (${input.totalThoughts})`,
          'INVALID_THOUGHT_NUMBER'
        ),
      ]);
    }

    // Validate work
    if (inputAny.work) {
      const workValidation = this.validateWork(inputAny.work);
      warnings.push(...workValidation.warnings);
    }

    // Validate methodology evaluation
    if (inputAny.methodologyEvaluation) {
      const methValidation = this.validateMethodologyEvaluation(inputAny.methodologyEvaluation);
      errors.push(...methValidation.errors);
      warnings.push(...methValidation.warnings);
    }

    // Validate argument critique
    if (inputAny.argumentCritique) {
      const argValidation = this.validateArgumentCritique(inputAny.argumentCritique);
      warnings.push(...argValidation.warnings);
    }

    // Validate critique points
    if (inputAny.critiquePoints && Array.isArray(inputAny.critiquePoints)) {
      for (let i = 0; i < inputAny.critiquePoints.length; i++) {
        const point = inputAny.critiquePoints[i] as CritiquePoint;
        const pointValidation = this.validateCritiquePoint(point, i);
        warnings.push(...pointValidation.warnings);
      }

      // Check balance
      const strengths = inputAny.critiquePoints.filter(
        (p: CritiquePoint) => p.type === 'strength'
      ).length;
      const weaknesses = inputAny.critiquePoints.filter(
        (p: CritiquePoint) => p.type === 'weakness' || p.type === 'concern'
      ).length;

      if (inputAny.critiquePoints.length >= 3) {
        if (strengths === 0) {
          warnings.push(
            createValidationWarning(
              'critiquePoints',
              'No strengths identified in critique',
              'A balanced critique should acknowledge strengths as well as weaknesses'
            )
          );
        } else if (weaknesses === 0) {
          warnings.push(
            createValidationWarning(
              'critiquePoints',
              'No weaknesses or concerns identified',
              'A thorough critique should identify areas for improvement'
            )
          );
        }
      }
    }

    // Validate verdict
    if (inputAny.verdict) {
      const verdictValidation = this.validateVerdict(inputAny.verdict);
      warnings.push(...verdictValidation.warnings);
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get critique-specific enhancements with Socratic questions
   */
  getEnhancements(thought: CritiqueThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.ARGUMENTATION, ThinkingMode.SYNTHESIS, ThinkingMode.ANALYSIS],
      guidingQuestions: [],
      warnings: [],
      mentalModels: [
        'Socratic Questioning',
        'Peer Review Framework',
        'Toulmin Model',
        'Critical Thinking',
      ],
    };

    // Calculate metrics
    const critiquePointCount = thought.critiquePoints?.length || 0;
    const improvementCount = thought.improvements?.length || 0;

    enhancements.metrics = {
      strengthsIdentified: thought.strengthsIdentified,
      weaknessesIdentified: thought.weaknessesIdentified,
      balanceRatio: thought.balanceRatio,
      critiquePointCount,
      improvementCount,
      hasVerdict: thought.verdict ? 1 : 0,
    };

    // Add Socratic questions based on thought type
    const socraticCategories = this.getSocraticQuestions(thought.thoughtType);
    const socraticQuestionsRecord: Record<string, string[]> = {};
    for (const category of socraticCategories) {
      socraticQuestionsRecord[category.name] = category.exampleQuestions;
    }
    enhancements.socraticQuestions = socraticQuestionsRecord;

    // Add selected questions to guiding questions
    for (const category of socraticCategories.slice(0, 2)) {
      enhancements.guidingQuestions!.push(category.exampleQuestions[0]);
    }

    // Balance warnings
    if (thought.balanceRatio < 0.2) {
      enhancements.warnings!.push(
        'Critique appears heavily weighted toward weaknesses. Consider identifying strengths.'
      );
    } else if (thought.balanceRatio > 0.8) {
      enhancements.warnings!.push(
        'Critique appears heavily weighted toward strengths. Consider identifying limitations.'
      );
    }

    // Suggestions based on content
    if (!thought.methodologyEvaluation && thought.work?.type === 'empirical_study') {
      enhancements.suggestions!.push(
        'Consider adding methodology evaluation for empirical work'
      );
    }

    if (!thought.argumentCritique && thought.work?.type === 'theoretical_paper') {
      enhancements.suggestions!.push(
        'Consider adding argument structure analysis for theoretical work'
      );
    }

    if (critiquePointCount >= 5 && !thought.verdict) {
      enhancements.suggestions!.push(
        'Consider providing an overall verdict summarizing the critique'
      );
    }

    if (thought.weaknessesIdentified > 0 && improvementCount === 0) {
      enhancements.suggestions!.push(
        'Consider adding constructive improvement suggestions for identified weaknesses'
      );
    }

    // Check for common critique completeness
    if (thought.work) {
      if (!thought.work.researchQuestion && thought.work.type === 'empirical_study') {
        enhancements.guidingQuestions!.push(
          'What is the research question being addressed?'
        );
      }
    }

    // Severity distribution analysis
    if (thought.critiquePoints && thought.critiquePoints.length > 0) {
      const criticalCount = thought.critiquePoints.filter(
        p => p.severity === 'critical'
      ).length;
      const majorCount = thought.critiquePoints.filter(
        p => p.severity === 'major'
      ).length;

      if (criticalCount > 0 && thought.verdict?.recommendation === 'accept') {
        enhancements.warnings!.push(
          'Accept recommendation despite critical issues. Verify this is intentional.'
        );
      }

      if (criticalCount === 0 && majorCount === 0 && thought.verdict?.recommendation === 'reject') {
        enhancements.warnings!.push(
          'Reject recommendation with no critical/major issues. Consider revising verdict.'
        );
      }
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as CritiqueThoughtType);
  }

  /**
   * Resolve thought type to valid CritiqueThoughtType
   */
  private resolveThoughtType(inputType: string | undefined): CritiqueThoughtType {
    if (inputType && this.supportedThoughtTypes.includes(inputType as CritiqueThoughtType)) {
      return inputType as CritiqueThoughtType;
    }
    return 'work_characterization';
  }

  /**
   * Calculate balance ratio (0 = all weaknesses, 1 = all strengths, 0.5 = balanced)
   */
  private calculateBalanceRatio(strengths: number, weaknesses: number): number {
    const total = strengths + weaknesses;
    if (total === 0) return 0.5;
    return strengths / total;
  }

  /**
   * Validate work being critiqued
   */
  private validateWork(work: CritiquedWork): ValidationResult {
    const warnings = [];

    if (!work.title || work.title.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          'work.title',
          'Work has no title',
          'Add a title to identify the work being critiqued'
        )
      );
    }

    if (!work.authors || work.authors.length === 0) {
      warnings.push(
        createValidationWarning(
          'work.authors',
          'No authors specified',
          'Add author information for proper attribution'
        )
      );
    }

    if (!work.claimedContribution || work.claimedContribution.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          'work.claimedContribution',
          'No claimed contribution specified',
          'Identify what contribution the work claims to make'
        )
      );
    }

    return validationSuccess(warnings);
  }

  /**
   * Validate methodology evaluation
   */
  private validateMethodologyEvaluation(meth: MethodologyEvaluation): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate rating ranges
    if (meth.overallRating !== undefined && (meth.overallRating < 0 || meth.overallRating > 1)) {
      warnings.push(
        createValidationWarning(
          'methodologyEvaluation.overallRating',
          `overallRating (${meth.overallRating}) is outside [0, 1] range`,
          'Ratings should be normalized to [0, 1]'
        )
      );
    }

    // Validate sub-ratings
    const subRatings = ['design.rating', 'sample.rating', 'analysis.rating'];
    for (const path of subRatings) {
      const [parent, child] = path.split('.');
      const parentObj = (meth as any)[parent];
      if (parentObj && parentObj[child] !== undefined) {
        const value = parentObj[child];
        if (value < 0 || value > 1) {
          warnings.push(
            createValidationWarning(
              `methodologyEvaluation.${path}`,
              `${path} (${value}) is outside [0, 1] range`,
              'Ratings should be normalized to [0, 1]'
            )
          );
        }
      }
    }

    return errors.length > 0 ? validationFailure(errors, warnings) : validationSuccess(warnings);
  }

  /**
   * Validate argument critique
   */
  private validateArgumentCritique(arg: ArgumentCritique): ValidationResult {
    const warnings = [];

    if (arg.rating !== undefined && (arg.rating < 0 || arg.rating > 1)) {
      warnings.push(
        createValidationWarning(
          'argumentCritique.rating',
          `Argument rating (${arg.rating}) is outside [0, 1] range`,
          'Rating should be normalized to [0, 1]'
        )
      );
    }

    if (arg.logicalStructure) {
      if (arg.logicalStructure.overallCoherence !== undefined) {
        if (arg.logicalStructure.overallCoherence < 0 || arg.logicalStructure.overallCoherence > 1) {
          warnings.push(
            createValidationWarning(
              'argumentCritique.logicalStructure.overallCoherence',
              `Coherence (${arg.logicalStructure.overallCoherence}) is outside [0, 1] range`,
              'Coherence should be normalized to [0, 1]'
            )
          );
        }
      }

      if (arg.logicalStructure.circularReasoning) {
        warnings.push(
          createValidationWarning(
            'argumentCritique.logicalStructure',
            'Circular reasoning detected in the argument',
            'This is a significant logical flaw that should be addressed'
          )
        );
      }
    }

    return validationSuccess(warnings);
  }

  /**
   * Validate a critique point
   */
  private validateCritiquePoint(point: CritiquePoint, index: number): ValidationResult {
    const warnings = [];

    if (!point.description || point.description.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          `critiquePoints[${index}].description`,
          'Critique point has no description',
          'Add a detailed description of the critique'
        )
      );
    }

    if (point.type === 'weakness' || point.type === 'concern') {
      if (!point.recommendation) {
        warnings.push(
          createValidationWarning(
            `critiquePoints[${index}].recommendation`,
            'Weakness has no recommendation for improvement',
            'Consider adding a constructive suggestion'
          )
        );
      }
    }

    return validationSuccess(warnings);
  }

  /**
   * Validate verdict
   */
  private validateVerdict(verdict: CritiqueVerdict): ValidationResult {
    const warnings = [];

    if (verdict.confidence !== undefined && (verdict.confidence < 0 || verdict.confidence > 1)) {
      warnings.push(
        createValidationWarning(
          'verdict.confidence',
          `Verdict confidence (${verdict.confidence}) is outside [0, 1] range`,
          'Confidence should be between 0 and 1'
        )
      );
    }

    if (!verdict.summary || verdict.summary.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          'verdict.summary',
          'Verdict has no summary',
          'Add a summary explaining the recommendation'
        )
      );
    }

    return validationSuccess(warnings);
  }

  /**
   * Get Socratic questions based on thought type
   */
  private getSocraticQuestions(thoughtType: CritiqueThoughtType): SocraticCategory[] {
    // Map thought types to most relevant Socratic categories
    const typeToCategories: Record<CritiqueThoughtType, string[]> = {
      work_characterization: ['Clarification', 'Meta'],
      methodology_evaluation: ['Evidence', 'Assumptions'],
      argument_analysis: ['Assumptions', 'Implications'],
      evidence_assessment: ['Evidence', 'Perspectives'],
      contribution_evaluation: ['Implications', 'Perspectives'],
      limitation_identification: ['Assumptions', 'Evidence'],
      strength_recognition: ['Clarification', 'Implications'],
      improvement_suggestion: ['Perspectives', 'Meta'],
    };

    const categoryNames = typeToCategories[thoughtType] || ['Clarification', 'Evidence'];
    return SOCRATIC_CATEGORIES.filter(c => categoryNames.includes(c.name));
  }
}
