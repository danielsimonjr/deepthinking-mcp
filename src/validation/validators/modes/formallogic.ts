/**
 * Formal Logic Mode Validator
 */

import { FormalLogicThought, ValidationIssue } from '../../../types/index.js';
import { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class FormalLogicValidator extends BaseValidator<FormalLogicThought> {
  getMode(): string {
    return 'formallogic';
  }

  validate(thought: FormalLogicThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate propositions
    if (thought.propositions && thought.propositions.length > 0) {
      const propositionIds = new Set<string>();
      const symbols = new Set<string>();

      for (const proposition of thought.propositions) {
        // Check for duplicate IDs
        if (propositionIds.has(proposition.id)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Duplicate proposition ID: ${proposition.id}`,
            suggestion: 'Ensure all proposition IDs are unique',
            category: 'structural',
          });
        }
        propositionIds.add(proposition.id);

        // Check for duplicate symbols
        if (symbols.has(proposition.symbol)) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Duplicate proposition symbol: ${proposition.symbol}`,
            suggestion: 'Use unique symbols for different propositions',
            category: 'structural',
          });
        }
        symbols.add(proposition.symbol);

        // Validate statement
        if (!proposition.statement || proposition.statement.trim() === '') {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Proposition ${proposition.id} must have a statement`,
            suggestion: 'Provide a clear statement for each proposition',
            category: 'structural',
          });
        }

        // Validate compound propositions have formulas
        if (proposition.type === 'compound' && !proposition.formula) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Compound proposition ${proposition.id} should have a formula`,
            suggestion: 'Specify how atomic propositions combine',
            category: 'structural',
          });
        }
      }
    }

    // Validate inferences
    if (thought.logicalInferences && thought.logicalInferences.length > 0) {
      const propositionIds = new Set(thought.propositions?.map(p => p.id) || []);

      for (const inference of thought.logicalInferences) {
        // Validate premises exist
        if (inference.premises && inference.premises.length > 0) {
          for (const premiseId of inference.premises) {
            if (!propositionIds.has(premiseId)) {
              issues.push({
                severity: 'error',
                thoughtNumber: thought.thoughtNumber,
                description: `Inference ${inference.id} references non-existent premise ${premiseId}`,
                suggestion: 'Ensure inferences reference defined propositions',
                category: 'logical',
              });
            }
          }
        } else {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Inference ${inference.id} has no premises`,
            suggestion: 'Inferences should have at least one premise',
            category: 'structural',
          });
        }

        // Validate conclusion exists
        if (!propositionIds.has(inference.conclusion)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Inference ${inference.id} references non-existent conclusion ${inference.conclusion}`,
            suggestion: 'Ensure conclusion references a defined proposition',
            category: 'logical',
          });
        }

        // Warn about invalid inferences
        if (!inference.valid) {
          issues.push({
            severity: 'info',
            thoughtNumber: thought.thoughtNumber,
            description: `Inference ${inference.id} is marked as invalid`,
            suggestion: 'Review inference rule application',
            category: 'logical',
          });
        }
      }
    }

    // Validate proof
    if (thought.proof) {
      if (!thought.proof.theorem || thought.proof.theorem.trim() === '') {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Proof must state the theorem being proved',
          suggestion: 'Provide clear theorem statement',
          category: 'structural',
        });
      }

      if (!thought.proof.steps || thought.proof.steps.length === 0) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Proof must have at least one step',
          suggestion: 'Add proof steps showing the derivation',
          category: 'structural',
        });
      }

      // Validate proof steps
      if (thought.proof.steps) {
        const stepNumbers = new Set<number>();

        for (const step of thought.proof.steps) {
          // Check for duplicate step numbers
          if (stepNumbers.has(step.stepNumber)) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Duplicate proof step number: ${step.stepNumber}`,
              suggestion: 'Ensure all step numbers are unique and sequential',
              category: 'structural',
            });
          }
          stepNumbers.add(step.stepNumber);

          // Validate step statement
          if (!step.statement || step.statement.trim() === '') {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Proof step ${step.stepNumber} must have a statement`,
              suggestion: 'Provide statement for each proof step',
              category: 'structural',
            });
          }

          // Validate justification
          if (!step.justification || step.justification.trim() === '') {
            issues.push({
              severity: 'warning',
              thoughtNumber: thought.thoughtNumber,
              description: `Proof step ${step.stepNumber} should have justification`,
              suggestion: 'Explain the reasoning for each step',
              category: 'structural',
            });
          }

          // Validate referenced steps exist
          if (step.referencesSteps) {
            for (const refStep of step.referencesSteps) {
              if (!stepNumbers.has(refStep) && refStep < step.stepNumber) {
                // Only error if referenced step should have been seen by now
                issues.push({
                  severity: 'error',
                  thoughtNumber: thought.thoughtNumber,
                  description: `Step ${step.stepNumber} references non-existent step ${refStep}`,
                  suggestion: 'Ensure referenced steps exist and come before current step',
                  category: 'logical',
                });
              }
            }
          }

          // Validate assumption discharge
          if (step.dischargesAssumption !== undefined) {
            if (!stepNumbers.has(step.dischargesAssumption)) {
              issues.push({
                severity: 'error',
                thoughtNumber: thought.thoughtNumber,
                description: `Step ${step.stepNumber} discharges non-existent assumption ${step.dischargesAssumption}`,
                suggestion: 'Ensure discharged assumption exists',
                category: 'logical',
              });
            }
          }
        }
      }

      // Validate proof validity
      if (!thought.proof.valid) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Proof is marked as invalid',
          suggestion: 'Review proof steps and logical derivation',
          category: 'logical',
        });
      }

      // Validate completeness
      if (thought.proof.completeness < 0 || thought.proof.completeness > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Proof completeness must be 0-1',
          suggestion: 'Use decimal completeness values between 0 and 1',
          category: 'structural',
        });
      }

      if (thought.proof.completeness < 1.0) {
        issues.push({
          severity: 'info',
          thoughtNumber: thought.thoughtNumber,
          description: `Proof is incomplete (${(thought.proof.completeness * 100).toFixed(0)}%)`,
          suggestion: 'Consider adding missing steps to complete the proof',
          category: 'logical',
        });
      }
    }

    // Validate truth table
    if (thought.truthTable) {
      if (!thought.truthTable.propositions || thought.truthTable.propositions.length === 0) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Truth table must have at least one proposition',
          suggestion: 'Specify propositions for truth table',
          category: 'structural',
        });
      }

      const propositionIds = new Set(thought.propositions?.map(p => p.id) || []);

      // Validate proposition references
      if (thought.truthTable.propositions) {
        for (const propId of thought.truthTable.propositions) {
          if (!propositionIds.has(propId)) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Truth table references non-existent proposition ${propId}`,
              suggestion: 'Ensure truth table references defined propositions',
              category: 'logical',
            });
          }
        }
      }

      // Validate number of rows
      const expectedRows = Math.pow(2, thought.truthTable.propositions?.length || 0);
      if (thought.truthTable.rows && thought.truthTable.rows.length !== expectedRows) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: `Truth table has ${thought.truthTable.rows.length} rows, expected ${expectedRows}`,
          suggestion: 'Truth table should have 2^n rows for n propositions',
          category: 'logical',
        });
      }

      // Check for tautology/contradiction consistency
      if (thought.truthTable.rows) {
        const allTrue = thought.truthTable.rows.every(row => row.result === true);
        const allFalse = thought.truthTable.rows.every(row => row.result === false);

        if (allTrue && !thought.truthTable.isTautology) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: 'All rows evaluate to true but not marked as tautology',
            suggestion: 'Mark as tautology if all evaluations are true',
            category: 'logical',
          });
        }

        if (allFalse && !thought.truthTable.isContradiction) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: 'All rows evaluate to false but not marked as contradiction',
            suggestion: 'Mark as contradiction if all evaluations are false',
            category: 'logical',
          });
        }

        if (!allTrue && !allFalse && !thought.truthTable.isContingent) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: 'Formula has mixed truth values but not marked as contingent',
            suggestion: 'Mark as contingent if not tautology or contradiction',
            category: 'logical',
          });
        }
      }
    }

    // Validate satisfiability result
    if (thought.satisfiability) {
      if (!thought.satisfiability.formula || thought.satisfiability.formula.trim() === '') {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Satisfiability check must specify formula',
          suggestion: 'Provide formula being checked for satisfiability',
          category: 'structural',
        });
      }

      // If satisfiable, should have model
      if (thought.satisfiability.satisfiable && !thought.satisfiability.model) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Satisfiable formula should provide satisfying assignment',
          suggestion: 'Include model (truth assignment) that satisfies the formula',
          category: 'structural',
        });
      }

      // If not satisfiable, should not have model
      if (!thought.satisfiability.satisfiable && thought.satisfiability.model) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Unsatisfiable formula should not have a model',
          suggestion: 'Remove model from unsatisfiable result',
          category: 'logical',
          });
      }
    }

    return issues;
  }
}
