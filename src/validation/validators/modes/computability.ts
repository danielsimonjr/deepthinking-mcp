/**
 * Computability Mode Validator (v7.2.0)
 * Phase 11: Validates computability theory thoughts
 *
 * Validates:
 * - Turing machine well-formedness
 * - Reduction correctness structure
 * - Decidability proof completeness
 * - Diagonalization argument validity
 *
 * Inspired by Alan Turing's foundational work on computability (1936)
 */

import { ValidationIssue } from '../../../types/index.js';
import type { ComputabilityThought, TuringMachine, Reduction, DecidabilityProof, DiagonalizationArgument } from '../../../types/modes/computability.js';
import type { ValidationContext } from '../../validator.js';
import { BaseValidator } from '../base.js';

export class ComputabilityValidator extends BaseValidator<ComputabilityThought> {
  getMode(): string {
    return 'computability';
  }

  validate(thought: ComputabilityThought, _context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Common validation
    issues.push(...this.validateCommon(thought));

    // Validate thought type
    const validTypes = [
      'machine_definition',
      'computation_trace',
      'decidability_proof',
      'reduction_construction',
      'complexity_analysis',
      'oracle_reasoning',
      'diagonalization',
    ];
    if (!validTypes.includes(thought.thoughtType)) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Invalid computability thought type: ${thought.thoughtType}`,
        suggestion: `Use one of: ${validTypes.join(', ')}`,
        category: 'structural',
      });
    }

    // Validate Turing machines
    if (thought.machines) {
      for (const machine of thought.machines) {
        issues.push(...this.validateTuringMachine(thought, machine));
      }
    }
    if (thought.currentMachine) {
      issues.push(...this.validateTuringMachine(thought, thought.currentMachine));
    }

    // Validate reductions
    if (thought.reductions) {
      for (const reduction of thought.reductions) {
        issues.push(...this.validateReduction(thought, reduction));
      }
    }

    // Validate decidability proof
    if (thought.decidabilityProof) {
      issues.push(...this.validateDecidabilityProof(thought, thought.decidabilityProof));
    }

    // Validate diagonalization argument
    if (thought.diagonalization) {
      issues.push(...this.validateDiagonalization(thought, thought.diagonalization));
    }

    // Validate computation trace
    if (thought.computationTrace) {
      issues.push(...this.validateComputationTrace(thought));
    }

    // Validate complexity analysis
    if (thought.complexityAnalysis) {
      issues.push(...this.validateComplexityAnalysis(thought));
    }

    return issues;
  }

  private validateTuringMachine(thought: ComputabilityThought, machine: TuringMachine): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check states are non-empty
    if (machine.states.length === 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Turing machine ${machine.name} has no states`,
        suggestion: 'Define at least one state for the machine',
        category: 'structural',
      });
    }

    // Check initial state is in states
    if (!machine.states.includes(machine.initialState)) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Initial state "${machine.initialState}" not in state set for machine ${machine.name}`,
        suggestion: 'Initial state must be one of the defined states',
        category: 'structural',
      });
    }

    // Check accept states are valid
    for (const acceptState of machine.acceptStates) {
      if (!machine.states.includes(acceptState)) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Accept state "${acceptState}" not in state set for machine ${machine.name}`,
          suggestion: 'All accept states must be defined states',
          category: 'structural',
        });
      }
    }

    // Check reject states are valid
    for (const rejectState of machine.rejectStates) {
      if (!machine.states.includes(rejectState)) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Reject state "${rejectState}" not in state set for machine ${machine.name}`,
          suggestion: 'All reject states must be defined states',
          category: 'structural',
        });
      }
    }

    // Check accept and reject states don't overlap
    const overlap = machine.acceptStates.filter(s => machine.rejectStates.includes(s));
    if (overlap.length > 0) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `States [${overlap.join(', ')}] are both accept and reject states`,
        suggestion: 'A state cannot be both accepting and rejecting',
        category: 'logical',
      });
    }

    // Check blank symbol is in tape alphabet
    if (!machine.tapeAlphabet.includes(machine.blankSymbol)) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Blank symbol "${machine.blankSymbol}" not in tape alphabet`,
        suggestion: 'Blank symbol must be part of the tape alphabet',
        category: 'structural',
      });
    }

    // Check input alphabet is subset of tape alphabet
    for (const symbol of machine.inputAlphabet) {
      if (!machine.tapeAlphabet.includes(symbol)) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Input symbol "${symbol}" not in tape alphabet`,
          suggestion: 'Input alphabet must be a subset of tape alphabet',
          category: 'structural',
        });
      }
    }

    // Validate transitions
    for (const transition of machine.transitions) {
      // Check states in transition are valid
      if (!machine.states.includes(transition.fromState)) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Transition from unknown state "${transition.fromState}"`,
          suggestion: 'All transition states must be defined states',
          category: 'structural',
        });
      }
      if (!machine.states.includes(transition.toState)) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Transition to unknown state "${transition.toState}"`,
          suggestion: 'All transition states must be defined states',
          category: 'structural',
        });
      }

      // Check symbols in transition are valid
      if (!machine.tapeAlphabet.includes(transition.readSymbol)) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Transition reads unknown symbol "${transition.readSymbol}"`,
          suggestion: 'Read symbols must be in tape alphabet',
          category: 'structural',
        });
      }
      if (!machine.tapeAlphabet.includes(transition.writeSymbol)) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: `Transition writes unknown symbol "${transition.writeSymbol}"`,
          suggestion: 'Write symbols must be in tape alphabet',
          category: 'structural',
        });
      }
    }

    // Check for determinism (if deterministic machine)
    if (machine.type === 'deterministic') {
      const transitionKeys = new Set<string>();
      for (const transition of machine.transitions) {
        const key = `${transition.fromState}:${transition.readSymbol}`;
        if (transitionKeys.has(key)) {
          issues.push({
            severity: 'error',
            thoughtNumber: thought.thoughtNumber,
            description: `Non-deterministic transition from (${transition.fromState}, ${transition.readSymbol})`,
            suggestion: 'Deterministic machines must have unique transitions per (state, symbol) pair',
            category: 'logical',
          });
        }
        transitionKeys.add(key);
      }
    }

    // Warn if no transitions defined
    if (machine.transitions.length === 0) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: `Turing machine ${machine.name} has no transitions`,
        suggestion: 'Define transitions for the machine to perform computation',
        category: 'structural',
      });
    }

    return issues;
  }

  private validateReduction(thought: ComputabilityThought, reduction: Reduction): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check reduction function has required components
    if (!reduction.reductionFunction.inputTransformation) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Reduction ${reduction.id} lacks input transformation specification`,
        suggestion: 'Describe how inputs are transformed in the reduction',
        category: 'structural',
      });
    }

    // Check correctness proof has both directions
    if (!reduction.correctnessProof.forwardDirection) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Reduction ${reduction.id} lacks forward direction proof (x ∈ A ⟹ f(x) ∈ B)`,
        suggestion: 'Prove that positive instances map to positive instances',
        category: 'structural',
      });
    }
    if (!reduction.correctnessProof.backwardDirection) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Reduction ${reduction.id} lacks backward direction proof (f(x) ∈ B ⟹ x ∈ A)`,
        suggestion: 'Prove that the reduction preserves answers in both directions',
        category: 'structural',
      });
    }

    // Check valid reduction type
    const validTypes = ['many_one', 'turing', 'polynomial_time', 'log_space'];
    if (!validTypes.includes(reduction.type)) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Invalid reduction type: ${reduction.type}`,
        suggestion: `Use one of: ${validTypes.join(', ')}`,
        category: 'structural',
      });
    }

    return issues;
  }

  private validateDecidabilityProof(thought: ComputabilityThought, proof: DecidabilityProof): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check proof method is valid
    const validMethods = ['direct_machine', 'reduction', 'diagonalization', 'rice_theorem', 'oracle'];
    if (!validMethods.includes(proof.method)) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Invalid proof method: ${proof.method}`,
        suggestion: `Use one of: ${validMethods.join(', ')}`,
        category: 'structural',
      });
    }

    // For direct proofs of decidability, require a deciding machine
    if (proof.conclusion === 'decidable' && proof.method === 'direct_machine') {
      if (!proof.decidingMachine) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Direct decidability proof requires a deciding machine',
          suggestion: 'Provide a Turing machine that decides the problem',
          category: 'structural',
        });
      }
    }

    // For reduction proofs of undecidability, require reduction and known undecidable problem
    if (proof.conclusion === 'undecidable' && proof.method === 'reduction') {
      if (!proof.reduction) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Reduction-based undecidability proof requires a reduction',
          suggestion: 'Provide the reduction from a known undecidable problem',
          category: 'structural',
        });
      }
      if (!proof.knownUndecidableProblem) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: 'Reduction proof should specify the known undecidable problem',
          suggestion: 'Identify the undecidable problem being reduced from (e.g., halting problem)',
          category: 'structural',
        });
      }
    }

    // For diagonalization proofs, require diagonalization argument
    if (proof.method === 'diagonalization' && !proof.diagonalization) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Diagonalization proof requires diagonalization argument',
        suggestion: 'Provide the diagonal construction and contradiction',
        category: 'structural',
      });
    }

    // For Rice's theorem applications
    if (proof.method === 'rice_theorem' && proof.riceApplication) {
      if (!proof.riceApplication.isNontrivial) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Rice\'s theorem only applies to non-trivial properties',
          suggestion: 'Verify the property is non-trivial (some TMs have it, some don\'t)',
          category: 'logical',
        });
      }
      if (!proof.riceApplication.isSemantic) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Rice\'s theorem only applies to semantic (language) properties',
          suggestion: 'Verify the property is about the language, not the machine structure',
          category: 'logical',
        });
      }
    }

    // Check proof has steps
    if (!proof.proofSteps || proof.proofSteps.length === 0) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Decidability proof has no steps',
        suggestion: 'Break down the proof into logical steps',
        category: 'structural',
      });
    }

    return issues;
  }

  private validateDiagonalization(thought: ComputabilityThought, diag: DiagonalizationArgument): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check enumeration is specified
    if (!diag.enumeration.description) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Diagonalization argument lacks enumeration description',
        suggestion: 'Describe what is being enumerated (e.g., all Turing machines)',
        category: 'structural',
      });
    }

    // Check diagonal construction is specified
    if (!diag.diagonalConstruction.rule) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Diagonalization argument lacks diagonal construction rule',
        suggestion: 'Specify how the diagonal element differs at each position',
        category: 'structural',
      });
    }

    // Check contradiction is specified
    if (!diag.contradiction.assumption) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Diagonalization argument lacks initial assumption',
        suggestion: 'State the assumption being contradicted',
        category: 'structural',
      });
    }
    if (!diag.contradiction.impossibility) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Diagonalization argument lacks impossibility statement',
        suggestion: 'Explain why the contradiction proves impossibility',
        category: 'structural',
      });
    }

    // Validate pattern
    const validPatterns = ['cantor', 'turing', 'godel', 'rice', 'custom'];
    if (!validPatterns.includes(diag.pattern)) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: `Unknown diagonalization pattern: ${diag.pattern}`,
        suggestion: `Consider classifying as one of: ${validPatterns.join(', ')}`,
        category: 'structural',
      });
    }

    return issues;
  }

  private validateComputationTrace(thought: ComputabilityThought): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const trace = thought.computationTrace!;

    // Check steps are sequential
    for (let i = 0; i < trace.steps.length; i++) {
      if (trace.steps[i].stepNumber !== i) {
        issues.push({
          severity: 'warning',
          thoughtNumber: thought.thoughtNumber,
          description: `Computation step numbering inconsistent at index ${i}`,
          suggestion: 'Steps should be numbered sequentially starting from 0',
          category: 'structural',
        });
        break;
      }
    }

    // Check total steps matches
    if (trace.totalSteps !== trace.steps.length) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Total steps count does not match actual steps',
        suggestion: 'Update totalSteps to reflect actual computation length',
        category: 'logical',
      });
    }

    // Check result validity
    const validResults = ['accept', 'reject', 'loop', 'running'];
    if (!validResults.includes(trace.result)) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: `Invalid computation result: ${trace.result}`,
        suggestion: `Use one of: ${validResults.join(', ')}`,
        category: 'structural',
      });
    }

    // Check consistency between result and isTerminating
    if ((trace.result === 'accept' || trace.result === 'reject') && !trace.isTerminating) {
      issues.push({
        severity: 'error',
        thoughtNumber: thought.thoughtNumber,
        description: 'Computation that accepts/rejects should be marked as terminating',
        suggestion: 'Set isTerminating to true for halting computations',
        category: 'logical',
      });
    }

    return issues;
  }

  private validateComplexityAnalysis(thought: ComputabilityThought): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const analysis = thought.complexityAnalysis!;

    // Check complexity class is specified
    if (!analysis.complexityClass) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Complexity analysis lacks complexity class',
        suggestion: 'Specify the complexity class (P, NP, PSPACE, etc.)',
        category: 'structural',
      });
    }

    // Check justification is provided
    if (!analysis.classJustification) {
      issues.push({
        severity: 'warning',
        thoughtNumber: thought.thoughtNumber,
        description: 'Complexity classification lacks justification',
        suggestion: 'Explain why the problem belongs to this complexity class',
        category: 'structural',
      });
    }

    // If hardness results are claimed, check for completeness consistency
    if (analysis.hardnessResults) {
      if (analysis.hardnessResults.completeFor && !analysis.hardnessResults.hardFor) {
        issues.push({
          severity: 'error',
          thoughtNumber: thought.thoughtNumber,
          description: 'Problem marked complete but not hard',
          suggestion: 'A problem that is complete for a class must also be hard for that class',
          category: 'logical',
        });
      }
    }

    return issues;
  }
}
