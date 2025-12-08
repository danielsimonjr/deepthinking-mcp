/**
 * Scientific Method Mode Validator
 */

import { ScientificMethodThought, ValidationIssue } from '../../../types/index.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class ScientificMethodValidator extends BaseValidator<ScientificMethodThought> {
  getMode(): string {
    return 'scientificmethod';
  }

  validate(thought: ScientificMethodThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate research question
    if (thought.researchQuestion) {
      if (!thought.researchQuestion.question || thought.researchQuestion.question.trim() === '') {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Research question must be specified',
          suggestion: 'Provide a clear research question',
          category: 'structural',
        });
      }

      // Validate variables are defined
      if (thought.researchQuestion.variables) {
        if (!thought.researchQuestion.variables.independent ||
            thought.researchQuestion.variables.independent.length === 0) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: 'Research question should specify independent variables',
            suggestion: 'Identify the independent variables being manipulated',
            category: 'structural',
          });
        }

        if (!thought.researchQuestion.variables.dependent ||
            thought.researchQuestion.variables.dependent.length === 0) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: 'Research question should specify dependent variables',
            suggestion: 'Identify the dependent variables being measured',
            category: 'structural',
          });
        }
      }
    }

    // Validate hypotheses
    if (thought.scientificHypotheses && thought.scientificHypotheses.length > 0) {
      let hasNull = false;
      let hasAlternative = false;

      for (const hypothesis of thought.scientificHypotheses) {
        if (hypothesis.type === 'null') hasNull = true;
        if (hypothesis.type === 'alternative') hasAlternative = true;

        if (!hypothesis.statement || hypothesis.statement.trim() === '') {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Hypothesis ${hypothesis.id} must have a statement`,
            suggestion: 'Provide a clear hypothesis statement',
            category: 'structural',
          });
        }

        if (!hypothesis.testable) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Hypothesis ${hypothesis.id} is marked as not testable`,
            suggestion: 'Consider reformulating to make hypothesis testable',
            category: 'logical',
          });
        }

        if (!hypothesis.falsifiable) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Hypothesis ${hypothesis.id} is not falsifiable`,
            suggestion: 'Scientific hypotheses should be falsifiable',
            category: 'logical',
          });
        }
      }

      if (!hasNull && !hasAlternative) {
        issues.push({
          severity: 'info',
          thoughtNumber: thought.thoughtNumber,
          description: 'Consider specifying both null and alternative hypotheses',
          suggestion: 'Standard scientific practice includes null hypothesis',
          category: 'structural',
        });
      }
    }

    // Validate experiment design
    if (thought.experiment) {
      if (thought.experiment.sampleSize <= 0) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Sample size must be positive',
          suggestion: 'Specify a valid sample size',
          category: 'structural',
        });
      }

      if (thought.experiment.sampleSize < 30) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Sample size is small (< 30)',
          suggestion: 'Consider if sample size is adequate for statistical power',
          category: 'logical',
        });
      }

      // Validate variables
      if (!thought.experiment.independentVariables ||
          thought.experiment.independentVariables.length === 0) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Experiment should specify independent variables',
          suggestion: 'Define the variables being manipulated',
          category: 'structural',
        });
      }

      if (!thought.experiment.dependentVariables ||
          thought.experiment.dependentVariables.length === 0) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Experiment should specify dependent variables',
          suggestion: 'Define the outcome variables being measured',
          category: 'structural',
        });
      }
    }

    // Validate data collection
    if (thought.data) {
      if (thought.data.dataQuality) {
        if (thought.data.dataQuality.completeness < 0 || thought.data.dataQuality.completeness > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: 'Data completeness must be 0-1',
            suggestion: 'Use decimal values between 0 and 1',
            category: 'structural',
          });
        }

        if (thought.data.dataQuality.reliability < 0 || thought.data.dataQuality.reliability > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: 'Data reliability must be 0-1',
            suggestion: 'Use decimal values between 0 and 1',
            category: 'structural',
          });
        }

        if (thought.data.dataQuality.validity < 0 || thought.data.dataQuality.validity > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: 'Data validity must be 0-1',
            suggestion: 'Use decimal values between 0 and 1',
            category: 'structural',
          });
        }

        // Warn about low data quality
        if (thought.data.dataQuality.completeness < 0.7) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: 'Data completeness is low (< 70%)',
            suggestion: 'Consider implications of missing data',
            category: 'logical',
          });
        }
      }
    }

    // Validate statistical analysis
    if (thought.analysis) {
      if (thought.analysis.tests && thought.analysis.tests.length > 0) {
        const hypothesisIds = new Set(thought.scientificHypotheses?.map(h => h.id) || []);

        for (const test of thought.analysis.tests) {
          // Validate p-value range
          if (test.pValue < 0 || test.pValue > 1) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Test ${test.id} p-value must be 0-1`,
              suggestion: 'Ensure p-value is a valid probability',
              category: 'structural',
            });
          }

          // Validate alpha range
          if (test.alpha < 0 || test.alpha > 1) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Test ${test.id} alpha must be 0-1`,
              suggestion: 'Use standard alpha levels (e.g., 0.05, 0.01)',
              category: 'structural',
            });
          }

          // Check for hypothesis reference
          if (!hypothesisIds.has(test.hypothesisTested)) {
            issues.push({
              severity: 'warning',
              thoughtNumber: thought.thoughtNumber,
              description: `Test ${test.id} references non-existent hypothesis ${test.hypothesisTested}`,
              suggestion: 'Ensure test references defined hypotheses',
              category: 'logical',
            });
          }

          // Validate result consistency
          if (test.pValue <= test.alpha && test.result !== 'reject_null') {
            issues.push({
              severity: 'warning',
              thoughtNumber: thought.thoughtNumber,
              description: `Test ${test.id} p-value (${test.pValue}) ≤ alpha (${test.alpha}) but null not rejected`,
              suggestion: 'Check result interpretation',
              category: 'logical',
            });
          }
        }
      }

      // Check effect size
      if (thought.analysis.effectSize) {
        if (typeof thought.analysis.effectSize.value !== 'number') {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: 'Effect size value must be numeric',
            suggestion: 'Provide valid effect size calculation',
            category: 'structural',
          });
        }
      }

      // Check power analysis
      if (thought.analysis.powerAnalysis) {
        if (thought.analysis.powerAnalysis.power < 0 || thought.analysis.powerAnalysis.power > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: 'Statistical power must be 0-1',
            suggestion: 'Use decimal power values between 0 and 1',
            category: 'structural',
          });
        }

        if (thought.analysis.powerAnalysis.power < 0.8) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: 'Statistical power is low (< 0.8)',
            suggestion: 'Consider increasing sample size for adequate power',
            category: 'logical',
          });
        }
      }
    }

    // Validate conclusion
    if (thought.conclusion) {
      if (!thought.conclusion.statement || thought.conclusion.statement.trim() === '') {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Conclusion must have a statement',
          suggestion: 'Provide a clear conclusion statement',
          category: 'structural',
        });
      }

      if (thought.conclusion.confidence < 0 || thought.conclusion.confidence > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Conclusion confidence must be 0-1',
          suggestion: 'Use decimal confidence values between 0 and 1',
          category: 'structural',
        });
      }

      const hypothesisIds = new Set(thought.scientificHypotheses?.map(h => h.id) || []);

      // Validate supported hypotheses
      if (thought.conclusion.supportedHypotheses) {
        for (const hypId of thought.conclusion.supportedHypotheses) {
          if (!hypothesisIds.has(hypId)) {
            issues.push({
              severity: 'warning',
              thoughtNumber: thought.thoughtNumber,
              description: `Conclusion references non-existent hypothesis ${hypId}`,
              suggestion: 'Ensure conclusion references defined hypotheses',
              category: 'logical',
            });
          }
        }
      }
    }

    return issues;
  }
}
