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
  AbductiveThought,
  CausalThought,
  BayesianThought,
  CounterfactualThought,
  AnalogicalThought,
  isSequentialThought,
  isShannonThought,
  isMathematicsThought,
  isPhysicsThought,
  isHybridThought,
  isAbductiveThought,
  isCausalThought,
  isBayesianThought,
  isCounterfactualThought,
  isAnalogicalThought,
} from '../types/core.js';
import { TemporalThought, isTemporalThought } from '../types/modes/temporal.js';
import { GameTheoryThought, isGameTheoryThought } from '../types/modes/gametheory.js';
import { EvidentialThought, isEvidentialThought } from '../types/modes/evidential.js';
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
    } else if (isAbductiveThought(thought)) {
      issues.push(...this.validateAbductive(thought, context));
    } else if (isCausalThought(thought)) {
      issues.push(...this.validateCausal(thought, context));
    } else if (isBayesianThought(thought)) {
      issues.push(...this.validateBayesian(thought, context));
    } else if (isCounterfactualThought(thought)) {
      issues.push(...this.validateCounterfactual(thought, context));
    } else if (isAnalogicalThought(thought)) {
      issues.push(...this.validateAnalogical(thought, context));
    } else if (isTemporalThought(thought)) {
      issues.push(...this.validateTemporal(thought, context));
    } else if (isGameTheoryThought(thought)) {
      issues.push(...this.validateGameTheory(thought, context));
    } else if (isEvidentialThought(thought)) {
      issues.push(...this.validateEvidential(thought, context));
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
   * Validate abductive-mode thoughts
   */
  private validateAbductive(thought: AbductiveThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // At least one observation required
    if (!thought.observations || thought.observations.length === 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Abductive reasoning requires at least one observation',
        suggestion: 'Provide observations that need explanation',
        category: 'structural',
      });
    }

    // Validate observation confidence values
    if (thought.observations) {
      for (const obs of thought.observations) {
        if (obs.confidence < 0 || obs.confidence > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Observation "${obs.description}" has invalid confidence: ${obs.confidence}`,
            suggestion: 'Confidence must be between 0 and 1',
            category: 'structural',
          });
        }
      }
    }

    // Validate hypothesis uniqueness
    if (thought.hypotheses) {
      const hypothesisIds = new Set<string>();
      for (const hyp of thought.hypotheses) {
        if (hypothesisIds.has(hyp.id)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Duplicate hypothesis ID: ${hyp.id}`,
            suggestion: 'Each hypothesis must have a unique ID',
            category: 'logical',
          });
        }
        hypothesisIds.add(hyp.id);
      }
    }

    // Validate evaluation criteria
    if (thought.evaluationCriteria) {
      const { parsimony, explanatoryPower, plausibility } = thought.evaluationCriteria;

      if (parsimony < 0 || parsimony > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Parsimony score must be between 0 and 1',
          suggestion: 'Provide parsimony as decimal',
          category: 'structural',
        });
      }

      if (explanatoryPower < 0 || explanatoryPower > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Explanatory power must be between 0 and 1',
          suggestion: 'Provide explanatory power as decimal',
          category: 'structural',
        });
      }

      if (plausibility < 0 || plausibility > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Plausibility must be between 0 and 1',
          suggestion: 'Provide plausibility as decimal',
          category: 'structural',
        });
      }
    }

    // Validate best explanation references existing hypothesis
    if (thought.bestExplanation && thought.hypotheses) {
      const hypothesisIds = thought.hypotheses.map(h => h.id);
      if (!hypothesisIds.includes(thought.bestExplanation.id)) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Best explanation must be from the hypotheses list',
          suggestion: 'Ensure bestExplanation references an existing hypothesis',
          category: 'logical',
        });
      }
    }

    return issues;
  }

  /**
   * Validate causal-mode thoughts
   */
  private validateCausal(thought: CausalThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validate causal graph structure
    if (thought.causalGraph) {
      const { nodes, edges } = thought.causalGraph;

      // Create node ID set for validation
      const nodeIds = new Set(nodes.map(n => n.id));

      // Validate all edge references point to existing nodes
      for (const edge of edges) {
        if (!nodeIds.has(edge.from)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Causal edge references non-existent source node: ${edge.from}`,
            suggestion: 'Ensure all edge sources reference existing nodes',
            category: 'structural',
          });
        }

        if (!nodeIds.has(edge.to)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Causal edge references non-existent target node: ${edge.to}`,
            suggestion: 'Ensure all edge targets reference existing nodes',
            category: 'structural',
          });
        }

        // Validate strength range
        if (edge.strength < -1 || edge.strength > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Causal edge strength must be between -1 and 1, got ${edge.strength}`,
            suggestion: 'Use -1 for strong inhibitory, 0 for no effect, +1 for strong causal',
            category: 'structural',
          });
        }

        // Validate confidence range
        if (edge.confidence < 0 || edge.confidence > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Causal edge confidence must be between 0 and 1, got ${edge.confidence}`,
            suggestion: 'Provide confidence as decimal',
            category: 'structural',
          });
        }
      }

      // Check for cycles (unless marked as feedback)
      const hasCycle = this.detectCausalCycle(nodes, edges);
      if (hasCycle) {
        const hasFeedback = thought.mechanisms?.some(m => m.type === 'feedback');
        if (!hasFeedback) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: 'Causal graph contains cycles',
            suggestion: 'Mark feedback mechanisms or ensure graph is acyclic',
            category: 'logical',
          });
        }
      }
    }

    // Validate interventions reference existing nodes
    if (thought.interventions && thought.causalGraph) {
      const nodeIds = new Set(thought.causalGraph.nodes.map(n => n.id));

      for (const intervention of thought.interventions) {
        if (!nodeIds.has(intervention.nodeId)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Intervention references non-existent node: ${intervention.nodeId}`,
            suggestion: 'Ensure interventions reference existing nodes',
            category: 'logical',
          });
        }

        // Validate expected effects
        for (const effect of intervention.expectedEffects) {
          if (!nodeIds.has(effect.nodeId)) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Intervention effect references non-existent node: ${effect.nodeId}`,
              suggestion: 'Ensure effect nodes exist in causal graph',
              category: 'logical',
            });
          }

          if (effect.confidence < 0 || effect.confidence > 1) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: 'Intervention effect confidence must be between 0 and 1',
              suggestion: 'Provide confidence as decimal',
              category: 'structural',
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Validate Bayesian-mode thoughts
   */
  private validateBayesian(thought: BayesianThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validate prior probability
    if (thought.prior) {
      if (thought.prior.probability < 0 || thought.prior.probability > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Prior probability must be between 0 and 1',
          suggestion: 'Provide prior as decimal (e.g., 0.3 for 30%)',
          category: 'structural',
        });
      }
    }

    // Validate likelihood probability
    if (thought.likelihood) {
      if (thought.likelihood.probability < 0 || thought.likelihood.probability > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Likelihood probability must be between 0 and 1',
          suggestion: 'Provide likelihood as decimal',
          category: 'structural',
        });
      }
    }

    // Validate posterior probability
    if (thought.posterior) {
      if (thought.posterior.probability < 0 || thought.posterior.probability > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Posterior probability must be between 0 and 1',
          suggestion: 'Provide posterior as decimal',
          category: 'structural',
        });
      }

      // Posterior calculation must be shown
      if (!thought.posterior.calculation || thought.posterior.calculation.trim().length === 0) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Posterior calculation should be shown',
          suggestion: 'Show the Bayes rule calculation',
          category: 'mathematical',
        });
      }
    }

    // Validate evidence likelihoods
    if (thought.evidence) {
      for (const ev of thought.evidence) {
        if (ev.likelihoodGivenHypothesis < 0 || ev.likelihoodGivenHypothesis > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Evidence "${ev.description}" has invalid P(E|H): ${ev.likelihoodGivenHypothesis}`,
            suggestion: 'Likelihood must be between 0 and 1',
            category: 'structural',
          });
        }

        if (ev.likelihoodGivenNotHypothesis < 0 || ev.likelihoodGivenNotHypothesis > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Evidence "${ev.description}" has invalid P(E|¬H): ${ev.likelihoodGivenNotHypothesis}`,
            suggestion: 'Likelihood must be between 0 and 1',
            category: 'structural',
          });
        }
      }
    }

    // Validate Bayes factor if present
    if (thought.bayesFactor !== undefined) {
      if (thought.bayesFactor < 0) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Bayes factor must be non-negative',
          suggestion: 'Bayes factor = P(E|H) / P(E|¬H)',
          category: 'mathematical',
        });
      }

      if (thought.bayesFactor > 1) {
        issues.push({
          severity: 'info',
          thoughtNumber: thought.thoughtNumber,
          description: 'Bayes factor > 1: evidence supports hypothesis',
          suggestion: 'This is good - the evidence favors your hypothesis',
          category: 'mathematical',
        });
      } else if (thought.bayesFactor < 1) {
        issues.push({
          severity: 'info',
          thoughtNumber: thought.thoughtNumber,
          description: 'Bayes factor < 1: evidence contradicts hypothesis',
          suggestion: 'Consider revising or rejecting the hypothesis',
          category: 'mathematical',
        });
      }
    }

    return issues;
  }

  /**
   * Validate counterfactual-mode thoughts
   */
  private validateCounterfactual(thought: CounterfactualThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Must have actual scenario
    if (!thought.actual) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Counterfactual reasoning requires an actual scenario',
        suggestion: 'Provide the scenario that actually occurred',
        category: 'structural',
      });
    }

    // Must have at least one counterfactual scenario
    if (!thought.counterfactuals || thought.counterfactuals.length === 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Must have at least one counterfactual scenario',
        suggestion: 'Provide "what if" alternative scenarios',
        category: 'structural',
      });
    }

    // Intervention point must be specified
    if (!thought.interventionPoint || !thought.interventionPoint.description) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Intervention point must be specified',
        suggestion: 'Specify where/when the alternative scenario diverges',
        category: 'structural',
      });
    }

    // Validate scenario likelihood if present
    const allScenarios = [thought.actual, ...(thought.counterfactuals || [])];
    for (const scenario of allScenarios) {
      if (scenario?.likelihood !== undefined) {
        if (scenario.likelihood < 0 || scenario.likelihood > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Scenario "${scenario.name}" has invalid likelihood: ${scenario.likelihood}`,
            suggestion: 'Likelihood must be between 0 and 1',
            category: 'structural',
          });
        }
      }
    }

    // Validate comparison references both actual and counterfactual
    if (thought.comparison && thought.comparison.differences) {
      for (const diff of thought.comparison.differences) {
        if (!diff.actual || !diff.counterfactual) {
          issues.push({
            severity: 'warning',
            thoughtNumber: thought.thoughtNumber,
            description: `Difference "${diff.aspect}" should reference both actual and counterfactual`,
            suggestion: 'Provide both values for meaningful comparison',
            category: 'logical',
          });
        }
      }
    }

    return issues;
  }

  /**
   * Validate analogical-mode thoughts
   */
  private validateAnalogical(thought: AnalogicalThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Must have source domain
    if (!thought.sourceDomain) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Analogical reasoning requires a source domain',
        suggestion: 'Provide the known domain for comparison',
        category: 'structural',
      });
    }

    // Must have target domain
    if (!thought.targetDomain) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Analogical reasoning requires a target domain',
        suggestion: 'Provide the domain being analyzed',
        category: 'structural',
      });
    }

    // Validate analogy strength
    if (thought.analogyStrength !== undefined) {
      if (thought.analogyStrength < 0 || thought.analogyStrength > 1) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Analogy strength must be between 0 and 1',
          suggestion: 'Provide strength as decimal',
          category: 'structural',
        });
      }
    }

    // Validate mappings reference existing entities
    if (thought.mapping && thought.sourceDomain && thought.targetDomain) {
      const sourceEntityIds = new Set(thought.sourceDomain.entities?.map(e => e.id) || []);
      const targetEntityIds = new Set(thought.targetDomain.entities?.map(e => e.id) || []);

      for (const mapping of thought.mapping) {
        if (!sourceEntityIds.has(mapping.sourceEntityId)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Mapping references non-existent source entity: ${mapping.sourceEntityId}`,
            suggestion: 'Ensure mappings reference existing entities',
            category: 'structural',
          });
        }

        if (!targetEntityIds.has(mapping.targetEntityId)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Mapping references non-existent target entity: ${mapping.targetEntityId}`,
            suggestion: 'Ensure mappings reference existing entities',
            category: 'structural',
          });
        }

        // Validate mapping confidence
        if (mapping.confidence < 0 || mapping.confidence > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: 'Mapping confidence must be between 0 and 1',
            suggestion: 'Provide confidence as decimal',
            category: 'structural',
          });
        }
      }
    }

    // Should identify at least one limitation
    if (!thought.limitations || thought.limitations.length === 0) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Good analogies acknowledge their limitations',
        suggestion: 'Identify where the analogy breaks down or doesn\'t apply',
        category: 'logical',
      });
    }

    // Validate inference confidence
    if (thought.inferences) {
      for (const inference of thought.inferences) {
        if (inference.confidence < 0 || inference.confidence > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: 'Inference confidence must be between 0 and 1',
            suggestion: 'Provide confidence as decimal',
            category: 'structural',
          });
        }
      }
    }

    return issues;
  }

  /**
   * Validate temporal reasoning thought
   */
  private validateTemporal(thought: TemporalThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validate timeline
    if (thought.timeline) {
      if (!thought.timeline.timeUnit) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Timeline must specify timeUnit',
          suggestion: 'Add timeUnit property (milliseconds, seconds, minutes, hours, days, months, years)',
          category: 'structural',
        });
      }

      if (thought.timeline.startTime !== undefined &&
          thought.timeline.endTime !== undefined &&
          thought.timeline.startTime >= thought.timeline.endTime) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Timeline startTime must be before endTime',
          suggestion: 'Ensure chronological order: startTime < endTime',
          category: 'logical',
        });
      }
    }

    // Validate events
    if (thought.events) {
      for (const event of thought.events) {
        if (event.type === 'interval' && !event.duration) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Interval event ${event.id} must have duration`,
            suggestion: 'Add duration property for interval events',
            category: 'structural',
          });
        }

        if (event.timestamp < 0) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Event ${event.id} has negative timestamp`,
            suggestion: 'Use non-negative timestamps',
            category: 'structural',
          });
        }
      }
    }

    // Validate intervals
    if (thought.intervals) {
      for (const interval of thought.intervals) {
        if (interval.start >= interval.end) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Interval ${interval.id} start must be before end`,
            suggestion: 'Ensure start < end for all intervals',
            category: 'logical',
          });
        }
      }
    }

    // Validate temporal constraints
    if (thought.constraints) {
      const eventIds = new Set(thought.events?.map(e => e.id) || []);
      const intervalIds = new Set(thought.intervals?.map(i => i.id) || []);

      for (const constraint of thought.constraints) {
        if (!eventIds.has(constraint.subject) && !intervalIds.has(constraint.subject)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Constraint subject ${constraint.subject} not found in events or intervals`,
            suggestion: 'Ensure constraint references exist',
            category: 'structural',
          });
        }

        if (!eventIds.has(constraint.object) && !intervalIds.has(constraint.object)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Constraint object ${constraint.object} not found in events or intervals`,
            suggestion: 'Ensure constraint references exist',
            category: 'structural',
          });
        }

        if (constraint.confidence < 0 || constraint.confidence > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Constraint ${constraint.id} confidence must be 0-1`,
            suggestion: 'Use decimal confidence values between 0 and 1',
            category: 'structural',
          });
        }
      }
    }

    // Validate temporal relations
    if (thought.relations) {
      const eventIds = new Set(thought.events?.map(e => e.id) || []);

      for (const relation of thought.relations) {
        if (!eventIds.has(relation.from)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Relation from event ${relation.from} not found`,
            suggestion: 'Ensure relations reference existing events',
            category: 'structural',
          });
        }

        if (!eventIds.has(relation.to)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Relation to event ${relation.to} not found`,
            suggestion: 'Ensure relations reference existing events',
            category: 'structural',
          });
        }

        if (relation.strength < 0 || relation.strength > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Relation ${relation.id} strength must be 0-1`,
            suggestion: 'Use decimal strength values between 0 and 1',
            category: 'structural',
          });
        }

        if (relation.delay !== undefined && relation.delay < 0) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Relation ${relation.id} delay cannot be negative`,
            suggestion: 'Use non-negative delay values',
            category: 'structural',
          });
        }
      }
    }

    return issues;
  }

  /**
   * Detect cycles in causal graph (simple DFS)
   */
  private detectCausalCycle(nodes: any[], edges: any[]): boolean {
    const adjacency = new Map<string, string[]>();

    // Build adjacency list
    for (const edge of edges) {
      if (!adjacency.has(edge.from)) {
        adjacency.set(edge.from, []);
      }
      adjacency.get(edge.from)!.push(edge.to);
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycleDFS = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = adjacency.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycleDFS(neighbor)) {
            return true;
          }
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycleDFS(node.id)) {
          return true;
        }
      }
    }

    return false;
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
  /**
   * Validate game theory thought
   */
  private validateGameTheory(thought: GameTheoryThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validate game definition
    if (thought.game) {
      if (thought.game.numPlayers < 2) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Game must have at least 2 players',
          suggestion: 'Set numPlayers to 2 or more',
          category: 'structural',
        });
      }
    }

    // Validate players match game
    if (thought.game && thought.players) {
      if (thought.players.length !== thought.game.numPlayers) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Number of players (${thought.players.length}) does not match game definition (${thought.game.numPlayers})`,
          suggestion: 'Ensure player list matches game.numPlayers',
          category: 'structural',
        });
      }

      // Validate each player has strategies
      for (const player of thought.players) {
        if (player.availableStrategies.length === 0) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Player ${player.id} has no available strategies`,
            suggestion: 'Add at least one strategy per player',
            category: 'structural',
          });
        }
      }
    }

    // Validate strategies reference valid players
    if (thought.strategies && thought.players) {
      const playerIds = new Set(thought.players.map(p => p.id));

      for (const strategy of thought.strategies) {
        if (!playerIds.has(strategy.playerId)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Strategy ${strategy.id} references non-existent player ${strategy.playerId}`,
            suggestion: 'Ensure all strategies reference valid player IDs',
            category: 'structural',
          });
        }

        // Validate mixed strategy probabilities
        if (!strategy.isPure) {
          if (strategy.probability === undefined) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Mixed strategy ${strategy.id} missing probability`,
              suggestion: 'Add probability (0-1) for mixed strategies',
              category: 'structural',
            });
          } else if (strategy.probability < 0 || strategy.probability > 1) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Strategy ${strategy.id} probability must be 0-1`,
              suggestion: 'Set probability between 0 and 1',
              category: 'structural',
            });
          }
        }
      }
    }

    // Validate payoff matrix dimensions
    if (thought.payoffMatrix && thought.players) {
      if (thought.payoffMatrix.players.length !== thought.players.length) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Payoff matrix player count does not match game',
          suggestion: 'Ensure payoffMatrix.players matches number of players',
          category: 'structural',
        });
      }

      // Validate payoff entries
      for (const entry of thought.payoffMatrix.payoffs) {
        if (entry.payoffs.length !== thought.players.length) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Payoff entry has ${entry.payoffs.length} payoffs but game has ${thought.players.length} players`,
            suggestion: 'Each payoff entry must have payoff for each player',
            category: 'structural',
          });
        }

        if (entry.strategyProfile.length !== thought.players.length) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Strategy profile has ${entry.strategyProfile.length} strategies but game has ${thought.players.length} players`,
            suggestion: 'Strategy profile must specify one strategy per player',
            category: 'structural',
          });
        }
      }
    }

    // Validate Nash equilibria
    if (thought.nashEquilibria && thought.players) {
      for (const equilibrium of thought.nashEquilibria) {
        if (equilibrium.strategyProfile.length !== thought.players.length) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Nash equilibrium ${equilibrium.id} strategy profile length mismatch`,
            suggestion: 'Equilibrium must specify one strategy per player',
            category: 'logical',
          });
        }

        if (equilibrium.payoffs.length !== thought.players.length) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Nash equilibrium ${equilibrium.id} payoffs length mismatch`,
            suggestion: 'Equilibrium must have payoff for each player',
            category: 'logical',
          });
        }

        if (equilibrium.stability < 0 || equilibrium.stability > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Nash equilibrium ${equilibrium.id} stability must be 0-1`,
            suggestion: 'Set stability value between 0 and 1',
            category: 'structural',
          });
        }
      }
    }

    // Validate dominant strategies reference valid players and strategies
    if (thought.dominantStrategies && thought.players && thought.strategies) {
      const playerIds = new Set(thought.players.map(p => p.id));
      const strategyIds = new Set(thought.strategies.map(s => s.id));

      for (const domStrategy of thought.dominantStrategies) {
        if (!playerIds.has(domStrategy.playerId)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Dominant strategy references non-existent player ${domStrategy.playerId}`,
            suggestion: 'Ensure dominant strategies reference valid player IDs',
            category: 'structural',
          });
        }

        if (!strategyIds.has(domStrategy.strategyId)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Dominant strategy references non-existent strategy ${domStrategy.strategyId}`,
            suggestion: 'Ensure dominant strategies reference valid strategy IDs',
            category: 'structural',
          });
        }
      }
    }

    // Validate game tree structure
    if (thought.gameTree) {
      const nodeIds = new Set(thought.gameTree.nodes.map(n => n.id));

      // Validate root node exists
      if (!nodeIds.has(thought.gameTree.rootNode)) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Game tree root node does not exist in node list',
          suggestion: 'Ensure rootNode ID matches a node in nodes array',
          category: 'structural',
        });
      }

      // Validate node references
      for (const node of thought.gameTree.nodes) {
        // Check parent exists
        if (node.parentNode && !nodeIds.has(node.parentNode)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Node ${node.id} references non-existent parent ${node.parentNode}`,
            suggestion: 'Ensure all parent node references are valid',
            category: 'structural',
          });
        }

        // Check children exist
        for (const childId of node.childNodes) {
          if (!nodeIds.has(childId)) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Node ${node.id} references non-existent child ${childId}`,
              suggestion: 'Ensure all child node references are valid',
              category: 'structural',
            });
          }
        }

        // Validate chance node probabilities
        if (node.type === 'chance' && node.probability !== undefined) {
          if (node.probability < 0 || node.probability > 1) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Chance node ${node.id} probability must be 0-1`,
              suggestion: 'Set probability between 0 and 1',
              category: 'structural',
            });
          }
        }

        // Validate terminal nodes have payoffs
        if (node.type === 'terminal' && !node.payoffs) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Terminal node ${node.id} missing payoffs`,
            suggestion: 'Add payoffs array for terminal nodes',
            category: 'structural',
          });
        }
      }
    }

    return issues;
  }

  private validateEvidential(thought: EvidentialThought, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validate hypotheses
    if (thought.hypotheses) {
      const hypothesisIds = new Set(thought.hypotheses.map(h => h.id));

      for (const hypothesis of thought.hypotheses) {
        if (hypothesis.subsets) {
          for (const subset of hypothesis.subsets) {
            if (!hypothesisIds.has(subset)) {
              issues.push({
                severity: 'error',
                thoughtNumber: thought.thoughtNumber,
                description: `Hypothesis ${hypothesis.id} references unknown subset ${subset}`,
                suggestion: 'Ensure all hypothesis subsets reference valid hypothesis IDs',
                category: 'structural',
              });
            }
          }
        }
      }
    }

    // Validate evidence
    if (thought.evidence) {
      const hypothesisIds = new Set(thought.hypotheses?.map(h => h.id) || []);

      for (const evidence of thought.evidence) {
        if (evidence.reliability < 0 || evidence.reliability > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Evidence ${evidence.id} reliability must be 0-1`,
            suggestion: 'Set reliability between 0 and 1',
            category: 'structural',
          });
        }

        for (const hypId of evidence.supports) {
          if (!hypothesisIds.has(hypId) && hypId !== 'unknown') {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Evidence ${evidence.id} supports unknown hypothesis ${hypId}`,
              suggestion: 'Ensure evidence only supports defined hypotheses',
              category: 'structural',
            });
          }
        }

        if (evidence.contradicts) {
          for (const hypId of evidence.contradicts) {
            if (!hypothesisIds.has(hypId)) {
              issues.push({
                severity: 'error',
                thoughtNumber: thought.thoughtNumber,
                description: `Evidence ${evidence.id} contradicts unknown hypothesis ${hypId}`,
                suggestion: 'Ensure evidence only contradicts defined hypotheses',
                category: 'structural',
              });
            }
          }
        }
      }
    }

    // Validate belief functions
    if (thought.beliefFunctions) {
      for (const bf of thought.beliefFunctions) {
        let totalMass = 0;

        for (const ma of bf.massAssignments) {
          if (ma.mass < 0 || ma.mass > 1) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Mass assignment in ${bf.id} must be 0-1`,
              suggestion: 'Set mass values between 0 and 1',
              category: 'structural',
            });
          }
          totalMass += ma.mass;

          if (ma.hypothesisSet.length === 0) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Mass assignment in ${bf.id} must assign to at least one hypothesis`,
              suggestion: 'Assign mass to at least one hypothesis',
              category: 'structural',
            });
          }
        }

        // Allow small tolerance for floating point
        if (Math.abs(totalMass - 1.0) > 0.01) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Belief function ${bf.id} mass assignments must sum to 1.0 (got ${totalMass})`,
            suggestion: 'Ensure mass assignments sum to 1.0',
            category: 'structural',
          });
        }
      }
    }

    // Validate plausibility function
    if (thought.plausibility) {
      for (const pa of thought.plausibility.assignments) {
        if (pa.belief < 0 || pa.belief > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Plausibility assignment belief must be 0-1`,
            suggestion: 'Set belief between 0 and 1',
            category: 'structural',
          });
        }
        if (pa.plausibility < 0 || pa.plausibility > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Plausibility assignment plausibility must be 0-1`,
            suggestion: 'Set plausibility between 0 and 1',
            category: 'structural',
          });
        }
        if (pa.belief > pa.plausibility) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Belief cannot exceed plausibility`,
            suggestion: 'Ensure belief ≤ plausibility',
            category: 'structural',
          });
        }
        if (pa.uncertaintyInterval[0] !== pa.belief ||
            pa.uncertaintyInterval[1] !== pa.plausibility) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Uncertainty interval must match [belief, plausibility]`,
            suggestion: 'Set uncertaintyInterval to [belief, plausibility]',
            category: 'structural',
          });
        }
      }
    }

    // Validate decisions
    if (thought.decisions) {
      const hypothesisIds = new Set(thought.hypotheses?.map(h => h.id) || []);

      for (const decision of thought.decisions) {
        if (decision.confidence < 0 || decision.confidence > 1) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Decision ${decision.id} confidence must be 0-1`,
            suggestion: 'Set confidence between 0 and 1',
            category: 'structural',
          });
        }

        for (const hypId of decision.selectedHypothesis) {
          if (!hypothesisIds.has(hypId)) {
            issues.push({
              severity: 'error',
              thoughtNumber: thought.thoughtNumber,
              description: `Decision ${decision.id} selects unknown hypothesis ${hypId}`,
              suggestion: 'Ensure decision only selects defined hypotheses',
              category: 'structural',
            });
          }
        }

        for (const alt of decision.alternatives) {
          for (const hypId of alt.hypothesis) {
            if (!hypothesisIds.has(hypId)) {
              issues.push({
                severity: 'error',
                thoughtNumber: thought.thoughtNumber,
                description: `Alternative in decision ${decision.id} references unknown hypothesis ${hypId}`,
                suggestion: 'Ensure alternatives only reference defined hypotheses',
                category: 'structural',
              });
            }
          }
        }
      }
    }

    return issues;
  }

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
