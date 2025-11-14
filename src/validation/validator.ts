/**
 * Validation engine for DeepThinking MCP
 * Validates thoughts based on mode and provides feedback
 */

import {
  Thought,
  SequentialThought,
  ShannonThought,
  MathematicsThought,
  PhysicsThought,
  HybridThought,
  isSequentialThought,
  isShannonThought,
  isMathematicsThought,
  isPhysicsThought,
  isHybridThought,
} from '../types/core.js';
import { ValidationResult, ValidationIssue } from '../types/session.js';

/**
 * Main validator class
 */
export class ThoughtValidator {
  /**
   * Validate a thought based on its mode
   */
  async validate(thought: Thought, context: ValidationContext = {}): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Mode-specific validation
    if (isSequentialThought(thought)) {
      issues.push(...this.validateSequential(thought, context));
    } else if (isShannonThought(thought)) {
      issues.push(...this.validateShannon(thought, context));
    } else if (isMathematicsThought(thought)) {
      issues.push(...this.validateMathematics(thought, context));
    } else if (isPhysicsThought(thought)) {
      issues.push(...this.validatePhysics(thought, context));
    } else if (isHybridThought(thought)) {
      issues.push(...this.validateHybrid(thought, context));
    }

    // Calculate validation result
    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');

    return {
      isValid: errors.length === 0,
      confidence: this.calculateConfidence(thought, issues),
      issues,
      strengthMetrics: this.calculateStrengthMetrics(thought, issues),
      suggestions: this.generateSuggestions(issues),
    };
  }

  /**
   * Common validation for all thought types
   */
  private validateCommon(thought: Thought): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check content is not empty
    if (!thought.content || thought.content.trim().length === 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Thought content cannot be empty',
        suggestion: 'Provide meaningful content for the thought',
        category: 'structural',
      });
    }

    // Check thought numbers are valid
    if (thought.thoughtNumber < 1) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Thought number must be positive',
        suggestion: 'Start thought numbering from 1',
        category: 'structural',
      });
    }

    if (thought.thoughtNumber > thought.totalThoughts) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Thought number exceeds total thoughts estimate',
        suggestion: 'Update totalThoughts estimate',
        category: 'structural',
      });
    }

    // Check content length is reasonable
    if (thought.content.length > 10000) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Thought content is very long (>10000 characters)',
        suggestion: 'Consider breaking into multiple thoughts',
        category: 'structural',
      });
    }

    return issues;
  }

  /**
   * Validate sequential-mode thoughts
   */
  private validateSequential(thought: SequentialThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check revision logic
    if (thought.isRevision && !thought.revisesThought) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Revision thought should specify which thought it revises',
        suggestion: 'Provide revisesThought ID',
        category: 'logical',
      });
    }

    if (thought.isRevision && context.existingThoughts) {
      const revisedThought = context.existingThoughts.get(thought.revisesThought || '');
      if (!revisedThought) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Cannot revise non-existent thought: ${thought.revisesThought}`,
          suggestion: 'Verify the thought ID being revised exists',
          category: 'logical',
        });
      }
    }

    return issues;
  }

  /**
   * Validate Shannon-mode thoughts
   */
  private validateShannon(thought: ShannonThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validate uncertainty is in range
    if (thought.uncertainty < 0 || thought.uncertainty > 1) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Uncertainty must be between 0 and 1',
        suggestion: 'Provide uncertainty as a decimal (e.g., 0.2 for 20%)',
        category: 'structural',
      });
    }

    // Validate dependencies exist
    if (context.existingThoughts) {
      for (const depId of thought.dependencies) {
        if (!context.existingThoughts.has(depId)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Dependency on non-existent thought: ${depId}`,
            suggestion: 'Verify all dependency IDs exist',
            category: 'logical',
          });
        }
      }
    }

    // Warn if model stage has no assumptions
    if (thought.stage === 'model' && thought.assumptions.length === 0) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: 'Model stage typically includes explicit assumptions',
        suggestion: 'Consider listing key assumptions for the model',
        category: 'structural',
      });
    }

    // Check uncertainty calibration
    if (thought.uncertainty < 0.1 && thought.assumptions.length > 3) {
      issues.push({
        severity: 'info',
        thoughtNumber: thought.thoughtNumber,
        description: 'Very low uncertainty despite multiple assumptions',
        suggestion: 'Consider if uncertainty should be higher',
        category: 'logical',
      });
    }

    return issues;
  }

  /**
   * Validate mathematics-mode thoughts
   */
  private validateMathematics(thought: MathematicsThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check proof strategy completeness
    if (thought.proofStrategy) {
      if (thought.proofStrategy.completeness < 0 || thought.proofStrategy.completeness > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Proof completeness must be between 0 and 1',
          suggestion: 'Provide completeness as decimal (e.g., 0.8 for 80% complete)',
          category: 'mathematical',
        });
      }

      if (thought.proofStrategy.type === 'induction' && !thought.proofStrategy.baseCase) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Induction proof should include base case',
          suggestion: 'Specify the base case for induction',
          category: 'mathematical',
        });
      }
    }

    // Validate mathematical model
    if (thought.mathematicalModel) {
      if (!thought.mathematicalModel.latex && !thought.mathematicalModel.symbolic) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Mathematical model should have LaTeX or symbolic representation',
          suggestion: 'Provide at least one representation format',
          category: 'mathematical',
        });
      }
    }

    // Check logical form
    if (thought.logicalForm) {
      if (thought.logicalForm.premises.length === 0) {
        issues.push({
          severity: 'info',
          thoughtNumber: thought.thoughtNumber,
          description: 'Logical form has no premises',
          suggestion: 'Consider adding premises for the logical argument',
          category: 'logical',
        });
      }
    }

    return issues;
  }

  /**
   * Validate physics-mode thoughts
   */
  private validatePhysics(thought: PhysicsThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validate tensor properties
    if (thought.tensorProperties) {
      const [contravariant, covariant] = thought.tensorProperties.rank;

      if (contravariant < 0 || covariant < 0) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Tensor rank components must be non-negative',
          suggestion: 'Provide valid tensor rank [contravariant, covariant]',
          category: 'physical',
        });
      }

      // Check symmetries are appropriate for rank
      const totalRank = contravariant + covariant;
      if (thought.tensorProperties.symmetries.includes('antisymmetric') && totalRank < 2) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Antisymmetric tensors must have rank ≥ 2',
          suggestion: 'Verify tensor rank and symmetry properties',
          category: 'physical',
        });
      }
    }

    // Validate dimensional analysis
    if (thought.dimensionalAnalysis && !thought.dimensionalAnalysis.isConsistent) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Dimensional analysis shows inconsistency',
        suggestion: 'Check units and dimensions of all quantities',
        category: 'physical',
      });
    }

    // Validate physical interpretation
    if (thought.physicalInterpretation) {
      if (!thought.physicalInterpretation.units) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Physical quantity should have units specified',
          suggestion: 'Specify the physical units (SI, natural, etc.)',
          category: 'physical',
        });
      }
    }

    return issues;
  }

  /**
   * Validate hybrid-mode thoughts
   */
  private validateHybrid(thought: HybridThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Hybrid thoughts can use features from any mode
    // Validate based on what features are present

    if (thought.stage || thought.uncertainty !== undefined) {
      // Has Shannon features
      if (thought.uncertainty !== undefined && (thought.uncertainty < 0 || thought.uncertainty > 1)) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Uncertainty must be between 0 and 1',
          suggestion: 'Provide uncertainty as decimal',
          category: 'structural',
        });
      }
    }

    if (thought.tensorProperties) {
      // Has physics features - validate tensor
      const [contravariant, covariant] = thought.tensorProperties.rank;
      if (contravariant < 0 || covariant < 0) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Tensor rank components must be non-negative',
          suggestion: 'Provide valid tensor rank',
          category: 'physical',
        });
      }
    }

    return issues;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(thought: Thought, issues: ValidationIssue[]): number {
    let confidence = 1.0;

    // Reduce confidence for each issue
    for (const issue of issues) {
      if (issue.severity === 'error') {
        confidence -= 0.3;
      } else if (issue.severity === 'warning') {
        confidence -= 0.1;
      } else if (issue.severity === 'info') {
        confidence -= 0.05;
      }
    }

    // Adjust for thought-specific factors
    if ('uncertainty' in thought) {
      const uncertainty = (thought as any).uncertainty;
      confidence *= (1 - uncertainty);
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Calculate strength metrics
   */
  private calculateStrengthMetrics(thought: Thought, issues: ValidationIssue[]) {
    const logicalIssues = issues.filter(i => i.category === 'logical');
    const mathIssues = issues.filter(i => i.category === 'mathematical');
    const physicalIssues = issues.filter(i => i.category === 'physical');

    return {
      logicalSoundness: 1 - (logicalIssues.length * 0.2),
      empiricalSupport: 0.8, // Would need actual evidence checking
      mathematicalRigor: 1 - (mathIssues.length * 0.2),
      physicalConsistency: 1 - (physicalIssues.length * 0.2),
    };
  }

  /**
   * Generate suggestions from issues
   */
  private generateSuggestions(issues: ValidationIssue[]): string[] {
    return issues
      .filter(i => i.severity === 'error' || i.severity === 'warning')
      .map(i => i.suggestion);
  }
}

/**
 * Validation context
 */
export interface ValidationContext {
  existingThoughts?: Map<string, Thought>;
  strictMode?: boolean;
}
