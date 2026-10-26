/**
 * resolveThoughtType and the handlers that use it.
 *
 * Twenty handlers pick the thought type of a new thought from the `thoughtType` of the input. A
 * type that the handler supports is kept. Any other value, such as a missing field, an empty
 * text, a type in another case or a value that is not a text, gives the default type of the
 * handler. The table below lists the supported types and the default of each handler as the
 * handlers had them before they shared the function, so a change to a list or a default
 * fails here.
 */

import { describe, it, expect } from 'vitest';
import { resolveThoughtType } from '../../../../src/modes/handlers/ModeHandler.js';
import { AlgorithmicHandler } from '../../../../src/modes/handlers/AlgorithmicHandler.js';
import { AnalysisHandler } from '../../../../src/modes/handlers/AnalysisHandler.js';
import { ArgumentationHandler } from '../../../../src/modes/handlers/ArgumentationHandler.js';
import { ComputabilityHandler } from '../../../../src/modes/handlers/ComputabilityHandler.js';
import { ConstraintHandler } from '../../../../src/modes/handlers/ConstraintHandler.js';
import { CritiqueHandler } from '../../../../src/modes/handlers/CritiqueHandler.js';
import { CryptanalyticHandler } from '../../../../src/modes/handlers/CryptanalyticHandler.js';
import { EvidentialHandler } from '../../../../src/modes/handlers/EvidentialHandler.js';
import { FormalLogicHandler } from '../../../../src/modes/handlers/FormalLogicHandler.js';
import { GameTheoryHandler } from '../../../../src/modes/handlers/GameTheoryHandler.js';
import { HistoricalHandler } from '../../../../src/modes/handlers/HistoricalHandler.js';
import { MathematicsHandler } from '../../../../src/modes/handlers/MathematicsHandler.js';
import { ModalHandler } from '../../../../src/modes/handlers/ModalHandler.js';
import { OptimizationHandler } from '../../../../src/modes/handlers/OptimizationHandler.js';
import { PhysicsHandler } from '../../../../src/modes/handlers/PhysicsHandler.js';
import { ScientificMethodHandler } from '../../../../src/modes/handlers/ScientificMethodHandler.js';
import { StochasticHandler } from '../../../../src/modes/handlers/StochasticHandler.js';
import { SynthesisHandler } from '../../../../src/modes/handlers/SynthesisHandler.js';
import { SystemsThinkingHandler } from '../../../../src/modes/handlers/SystemsThinkingHandler.js';
import { TemporalHandler } from '../../../../src/modes/handlers/TemporalHandler.js';
import type { ModeHandler } from '../../../../src/modes/handlers/ModeHandler.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('resolveThoughtType()', () => {
  const supported = ['alpha', 'beta'] as const;

  it('returns a supported type unchanged', () => {
    expect(resolveThoughtType('beta', supported, 'alpha')).toBe('beta');
  });

  it.each([undefined, '', 'gamma', 'ALPHA', ' alpha', 'alphas', 'alph', 'a', 'constructor', 'toString'])(
    'returns the default type for %j',
    (value) => {
      expect(resolveThoughtType(value, supported, 'beta')).toBe('beta');
    }
  );

  it('returns the default type when the list is empty', () => {
    expect(resolveThoughtType('alpha', [], 'beta')).toBe('beta');
  });

  it('treats an empty value as missing, even when the list holds it', () => {
    expect(resolveThoughtType('', ['', 'alpha'], 'beta')).toBe('beta');
  });
});

// [handler name, handler class, default type, supported types]
const HANDLERS: Array<[string, new () => ModeHandler, string, string[]]> = [
  [
    'AlgorithmicHandler',
    AlgorithmicHandler,
    'algorithm_definition',
    ['algorithm_definition', 'complexity_analysis', 'recurrence_solving', 'correctness_proof', 'invariant_identification', 'divide_and_conquer', 'dynamic_programming', 'greedy_choice', 'backtracking', 'branch_and_bound', 'randomized_analysis', 'amortized_analysis', 'data_structure_design', 'data_structure_analysis', 'augmentation', 'graph_traversal', 'shortest_path', 'minimum_spanning_tree', 'network_flow', 'matching', 'string_matching', 'computational_geometry', 'number_theoretic', 'approximation', 'online_algorithm', 'parallel_algorithm'],
  ],
  [
    'AnalysisHandler',
    AnalysisHandler,
    'initial_coding',
    ['data_familiarization', 'initial_coding', 'focused_coding', 'theme_development', 'theme_refinement', 'theoretical_integration', 'memo_writing', 'saturation_assessment'],
  ],
  [
    'ArgumentationHandler',
    ArgumentationHandler,
    'claim_formulation',
    ['claim_formulation', 'grounds_identification', 'warrant_construction', 'backing_provision', 'rebuttal_anticipation', 'qualifier_specification', 'argument_assembly', 'dialectic_analysis'],
  ],
  [
    'ComputabilityHandler',
    ComputabilityHandler,
    'machine_definition',
    ['machine_definition', 'computation_trace', 'decidability_proof', 'reduction_construction', 'complexity_analysis', 'oracle_reasoning', 'diagonalization'],
  ],
  [
    'ConstraintHandler',
    ConstraintHandler,
    'problem_formulation',
    ['problem_formulation', 'variable_definition', 'constraint_definition', 'domain_reduction', 'arc_consistency', 'propagation', 'solution_search', 'backtracking', 'feasibility_check'],
  ],
  [
    'CritiqueHandler',
    CritiqueHandler,
    'work_characterization',
    ['work_characterization', 'methodology_evaluation', 'argument_analysis', 'evidence_assessment', 'contribution_evaluation', 'limitation_identification', 'strength_recognition', 'improvement_suggestion'],
  ],
  [
    'CryptanalyticHandler',
    CryptanalyticHandler,
    'hypothesis_formation',
    ['hypothesis_formation', 'evidence_accumulation', 'frequency_analysis', 'key_elimination', 'banburismus', 'crib_analysis', 'isomorphism_detection'],
  ],
  [
    'EvidentialHandler',
    EvidentialHandler,
    'hypothesis_definition',
    ['hypothesis_definition', 'evidence_collection', 'belief_assignment', 'evidence_combination', 'decision_analysis'],
  ],
  [
    'FormalLogicHandler',
    FormalLogicHandler,
    'proposition_definition',
    ['proposition_definition', 'inference_derivation', 'proof_construction', 'satisfiability_check', 'validity_verification'],
  ],
  [
    'GameTheoryHandler',
    GameTheoryHandler,
    'game_definition',
    ['game_definition', 'strategy_analysis', 'equilibrium_finding', 'payoff_computation', 'dominance_analysis', 'minimax_analysis', 'cooperative_analysis', 'coalition_formation', 'shapley_value', 'core_analysis'],
  ],
  [
    'HistoricalHandler',
    HistoricalHandler,
    'event_analysis',
    ['event_analysis', 'source_evaluation', 'pattern_identification', 'causal_chain', 'periodization'],
  ],
  [
    'MathematicsHandler',
    MathematicsHandler,
    'axiom_definition',
    ['axiom_definition', 'theorem_statement', 'proof_construction', 'lemma_derivation', 'corollary', 'counterexample', 'algebraic_manipulation', 'symbolic_computation', 'numerical_analysis', 'proof_decomposition', 'dependency_analysis', 'consistency_check', 'gap_identification', 'assumption_trace'],
  ],
  [
    'ModalHandler',
    ModalHandler,
    'proposition_analysis',
    ['world_definition', 'proposition_analysis', 'accessibility_analysis', 'necessity_proof', 'possibility_proof', 'modal_inference', 'countermodel'],
  ],
  [
    'OptimizationHandler',
    OptimizationHandler,
    'problem_formulation',
    ['problem_formulation', 'variable_definition', 'constraint_identification', 'objective_setting', 'solution_search', 'sensitivity_analysis'],
  ],
  [
    'PhysicsHandler',
    PhysicsHandler,
    'symmetry_analysis',
    ['symmetry_analysis', 'gauge_theory', 'field_equations', 'lagrangian', 'hamiltonian', 'conservation_law', 'dimensional_analysis', 'tensor_formulation', 'differential_geometry'],
  ],
  [
    'ScientificMethodHandler',
    ScientificMethodHandler,
    'question_formulation',
    ['question_formulation', 'hypothesis_generation', 'experiment_design', 'data_collection', 'analysis', 'conclusion'],
  ],
  [
    'StochasticHandler',
    StochasticHandler,
    'process_definition',
    ['process_definition', 'transition_analysis', 'steady_state_analysis', 'random_variable_definition', 'monte_carlo_simulation', 'convergence_analysis', 'hitting_time_analysis'],
  ],
  [
    'SynthesisHandler',
    SynthesisHandler,
    'source_identification',
    ['source_identification', 'source_evaluation', 'theme_extraction', 'pattern_integration', 'gap_identification', 'synthesis_construction', 'framework_development'],
  ],
  [
    'SystemsThinkingHandler',
    SystemsThinkingHandler,
    'system_definition',
    ['system_definition', 'component_analysis', 'feedback_identification', 'leverage_analysis', 'behavior_prediction'],
  ],
  [
    'TemporalHandler',
    TemporalHandler,
    'event_definition',
    ['event_definition', 'interval_analysis', 'temporal_constraint', 'sequence_construction', 'causality_timeline'],
  ],
];

describe.each(HANDLERS)('%s thought type', (_name, Handler, fallback, supported) => {
  const typeOf = (thoughtType: unknown): unknown => {
    const input = {
      mode: 'any',
      thought: 'a thought',
      thoughtNumber: 1,
      totalThoughts: 2,
      nextThoughtNeeded: false,
      thoughtType,
    } as unknown as ThinkingToolInput;
    return (new Handler().createThought(input, 'session-1') as unknown as { thoughtType: unknown })
      .thoughtType;
  };

  it('keeps every supported type', () => {
    expect(supported.map(typeOf)).toEqual(supported);
  });

  it('gives the default type for a value that is not supported', () => {
    const values = [undefined, null, '', ' ', 'bogus', 'constructor', 'toString', 7, true, ['x']];
    expect(values.map(typeOf)).toEqual(values.map(() => fallback));
  });

  it('does not match a supported type in another case', () => {
    expect(supported.map((type) => typeOf(type.toUpperCase()))).toEqual(supported.map(() => fallback));
  });
});
