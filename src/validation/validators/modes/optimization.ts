/**
 * Optimization Mode Validator
 */

import { OptimizationThought, ValidationIssue } from '../../../types/index.js';
import { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class OptimizationValidator extends BaseValidator<OptimizationThought> {
  getMode(): string {
    return 'optimization';
  }

  validate(thought: OptimizationThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate problem definition
    if (thought.problem) {
      if (!thought.problem.name || thought.problem.name.trim() === '') {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Optimization problem must have a name',
          suggestion: 'Provide a descriptive problem name',
          category: 'structural',
        });
      }
    }

    // Validate variables
    if (thought.variables && thought.variables.length > 0) {
      const variableIds = new Set<string>();

      for (const variable of thought.variables) {
        if (variableIds.has(variable.id)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Duplicate variable ID: ${variable.id}`,
            suggestion: 'Ensure all variable IDs are unique',
            category: 'structural',
          });
        }
        variableIds.add(variable.id);

        // Validate variable name
        if (!variable.name || variable.name.trim() === '') {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Variable ${variable.id} must have a name`,
            suggestion: 'Provide descriptive variable names',
            category: 'structural',
          });
        }

        // Validate domain
        if (variable.domain) {
          if (variable.domain.type === 'continuous' || variable.domain.type === 'integer') {
            if ('lowerBound' in variable.domain && 'upperBound' in variable.domain) {
              if (variable.domain.lowerBound >= variable.domain.upperBound) {
                issues.push({
                  severity: 'error',
                  thoughtNumber: thought.thoughtNumber,
                  description: `Variable ${variable.id} lower bound must be less than upper bound`,
                  suggestion: 'Ensure domain bounds are correctly specified',
                  category: 'logical',
                });
              }
            }
          }

          if (variable.domain.type === 'discrete' && 'values' in variable.domain) {
            if (!variable.domain.values || variable.domain.values.length === 0) {
              issues.push({
                severity: 'error',
                thoughtNumber: thought.thoughtNumber,
                description: `Discrete variable ${variable.id} must have at least one value`,
                suggestion: 'Provide domain values for discrete variables',
                category: 'structural',
              });
            }
          }

          if (variable.domain.type === 'categorical' && 'categories' in variable.domain) {
            if (!variable.domain.categories || variable.domain.categories.length === 0) {
              issues.push({
                severity: 'error',
                thoughtNumber: thought.thoughtNumber,
                description: `Categorical variable ${variable.id} must have at least one category`,
                suggestion: 'Provide categories for categorical variables',
                category: 'structural',
              });
            }
          }
        }
      }
    } else {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Optimization problem should define decision variables',
        suggestion: 'Add variables to be optimized',
        category: 'structural',
      });
    }

    // Validate constraints
    if (thought.optimizationConstraints && thought.optimizationConstraints.length > 0) {
      const variableIds = new Set(thought.variables?.map(v => v.id) || []);

      for (const constraint of thought.optimizationConstraints) {
        // Validate constraint formula
        if (!constraint.formula || constraint.formula.trim() === '') {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Constraint ${constraint.id} must have a formula`,
            suggestion: 'Provide mathematical expression for constraint',
            category: 'structural',
          });
        }

        // Validate soft constraint penalty
        if (constraint.type === 'soft' && constraint.penalty === undefined) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Soft constraint ${constraint.id} should have a penalty`,
            suggestion: 'Specify penalty weight for soft constraint violation',
            category: 'structural',
          });
        }

        if (constraint.penalty !== undefined && constraint.penalty < 0) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Constraint ${constraint.id} penalty cannot be negative`,
            suggestion: 'Use non-negative penalty values',
            category: 'structural',
          });
        }

        // Validate variables reference
        if (constraint.variables) {
          for (const varId of constraint.variables) {
            if (!variableIds.has(varId)) {
              issues.push({
                severity: 'error',
                thoughtNumber: thought.thoughtNumber,
                description: `Constraint ${constraint.id} references non-existent variable ${varId}`,
                suggestion: 'Ensure constraints reference defined variables',
                category: 'logical',
              });
            }
          }
        }

        // Validate priority range
        if (constraint.priority !== undefined && constraint.priority < 0) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Constraint ${constraint.id} priority cannot be negative`,
            suggestion: 'Use non-negative priority values',
            category: 'structural',
          });
        }
      }
    }

    // Validate objectives
    if (thought.objectives && thought.objectives.length > 0) {
      const variableIds = new Set(thought.variables?.map(v => v.id) || []);
      let totalWeight = 0;

      for (const objective of thought.objectives) {
        // Validate objective formula
        if (!objective.formula || objective.formula.trim() === '') {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Objective ${objective.id} must have a formula`,
            suggestion: 'Provide mathematical expression for objective function',
            category: 'structural',
          });
        }

        // Validate variables reference
        if (objective.variables) {
          for (const varId of objective.variables) {
            if (!variableIds.has(varId)) {
              issues.push({
                severity: 'error',
                thoughtNumber: thought.thoughtNumber,
                description: `Objective ${objective.id} references non-existent variable ${varId}`,
                suggestion: 'Ensure objectives reference defined variables',
                category: 'logical',
              });
            }
          }
        }

        // Validate weight for multi-objective
        if (objective.weight !== undefined) {
          if (objective.weight < 0 || objective.weight > 1) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Objective ${objective.id} weight must be 0-1`,
              suggestion: 'Use decimal weight values between 0 and 1',
              category: 'structural',
            });
          }
          totalWeight += objective.weight;
        }
      }

      // Check if weights sum to 1 for multi-objective
      if (thought.objectives.length > 1 && totalWeight > 0 && Math.abs(totalWeight - 1.0) > 0.01) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: `Objective weights sum to ${totalWeight.toFixed(2)}, not 1.0`,
          suggestion: 'For multi-objective optimization, weights should sum to 1',
          category: 'logical',
        });
      }
    } else {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Optimization problem must have at least one objective',
        suggestion: 'Define what is being optimized (objective function)',
        category: 'structural',
      });
    }

    // Validate solution
    if (thought.solution) {
      const variableIds = new Set(thought.variables?.map(v => v.id) || []);
      const constraintIds = new Set(thought.optimizationConstraints?.map(c => c.id) || []);
      const objectiveIds = new Set(thought.objectives?.map(o => o.id) || []);

      // Validate quality range
      if (thought.solution.quality < 0 || thought.solution.quality > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Solution quality must be 0-1',
          suggestion: 'Use decimal quality values between 0 and 1',
          category: 'structural',
        });
      }

      // Check if solution assigns values to all variables
      const assignedVars = Object.keys(thought.solution.variableValues);
      for (const varId of variableIds) {
        if (!assignedVars.includes(varId)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Solution does not assign value to variable ${varId}`,
            suggestion: 'Ensure solution assigns values to all decision variables',
            category: 'structural',
          });
        }
      }

      // Validate objective values
      for (const objId of Object.keys(thought.solution.objectiveValues)) {
        if (!objectiveIds.has(objId)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Solution includes non-existent objective ${objId}`,
            suggestion: 'Ensure solution references defined objectives',
            category: 'logical',
          });
        }
      }

      // Validate constraint satisfaction
      if (thought.solution.constraintSatisfaction) {
        for (const cs of thought.solution.constraintSatisfaction) {
          if (!constraintIds.has(cs.constraintId)) {
            issues.push({
              severity: 'warning',
              thoughtNumber: thought.thoughtNumber,
              description: `Solution references non-existent constraint ${cs.constraintId}`,
              suggestion: 'Ensure solution references defined constraints',
              category: 'logical',
            });
          }

          if (cs.violation !== undefined && cs.violation < 0) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Constraint ${cs.constraintId} violation cannot be negative`,
              suggestion: 'Use non-negative violation amounts',
              category: 'structural',
            });
          }
        }
      }

      // Check computation time
      if (thought.solution.computationTime !== undefined && thought.solution.computationTime < 0) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Computation time cannot be negative',
          suggestion: 'Use non-negative time values in milliseconds',
          category: 'structural',
        });
      }
    }

    // Validate sensitivity analysis
    if (thought.analysis) {
      if (thought.analysis.robustness < 0 || thought.analysis.robustness > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Solution robustness must be 0-1',
          suggestion: 'Use decimal robustness values between 0 and 1',
          category: 'structural',
        });
      }

      // Validate parameter sensitivity
      if (thought.analysis.parameters) {
        for (const param of thought.analysis.parameters) {
          if (param.allowableIncrease !== undefined && param.allowableIncrease < 0) {
            issues.push({
              severity: 'warning',
              thoughtNumber: thought.thoughtNumber,
              description: `Parameter ${param.parameterId} allowable increase should be non-negative`,
              suggestion: 'Use non-negative increase values',
              category: 'structural',
            });
          }

          if (param.allowableDecrease !== undefined && param.allowableDecrease < 0) {
            issues.push({
              severity: 'warning',
              thoughtNumber: thought.thoughtNumber,
              description: `Parameter ${param.parameterId} allowable decrease should be non-negative`,
              suggestion: 'Use non-negative decrease values',
              category: 'structural',
            });
          }
        }
      }
    }

    return issues;
  }
}
