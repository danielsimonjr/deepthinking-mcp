/**
 * Thought Factory - Test Utilities for Phase 11
 *
 * Factory functions for creating mode-specific thoughts for testing.
 * Covers all parameters for inductive, deductive, and abductive modes.
 */

import type { ThinkingToolInput } from '../../src/tools/thinking.js';

/**
 * Base thought input with required fields
 */
export interface BaseThoughtInput {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  sessionId?: string;
}

/**
 * Create base thought input with defaults
 */
export function createBaseThought(
  overrides: Partial<BaseThoughtInput> = {}
): BaseThoughtInput {
  return {
    thought: 'Test thought content',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    ...overrides,
  };
}

// ============================================================================
// INDUCTIVE MODE THOUGHT FACTORIES
// ============================================================================

/**
 * Create a basic inductive thought with required params only
 */
export function createInductiveThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    ...createBaseThought(),
    mode: 'inductive',
    ...overrides,
  } as ThinkingToolInput;
}

/**
 * Create an inductive thought with observations
 */
export function createInductiveWithObservations(
  observations: string[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createInductiveThought({
    observations,
    ...overrides,
  });
}

/**
 * Create an inductive thought with pattern identification
 */
export function createInductiveWithPattern(
  pattern: string,
  observations: string[] = [],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createInductiveThought({
    observations,
    pattern,
    ...overrides,
  });
}

/**
 * Create an inductive thought with generalization
 */
export function createInductiveWithGeneralization(
  generalization: string,
  observations: string[] = [],
  pattern?: string,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createInductiveThought({
    observations,
    pattern,
    generalization,
    ...overrides,
  });
}

/**
 * Create an inductive thought with confidence score
 */
export function createInductiveWithConfidence(
  confidence: number,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createInductiveThought({
    confidence,
    ...overrides,
  });
}

/**
 * Create an inductive thought with counterexamples
 */
export function createInductiveWithCounterexamples(
  counterexamples: string[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createInductiveThought({
    counterexamples,
    ...overrides,
  });
}

/**
 * Create an inductive thought with sample size
 */
export function createInductiveWithSampleSize(
  sampleSize: number,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createInductiveThought({
    sampleSize,
    ...overrides,
  });
}

/**
 * Create a complete inductive thought with all optional params
 */
export function createCompleteInductiveThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createInductiveThought({
    observations: ['Observation 1', 'Observation 2', 'Observation 3'],
    pattern: 'All observations share property X',
    generalization: 'All instances have property X',
    confidence: 0.8,
    counterexamples: ['Exception found in case Y'],
    sampleSize: 100,
    assumptions: ['Assumption 1', 'Assumption 2'],
    uncertainty: 0.2,
    ...overrides,
  });
}

// ============================================================================
// DEDUCTIVE MODE THOUGHT FACTORIES
// ============================================================================

/**
 * Create a basic deductive thought with required params only
 */
export function createDeductiveThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    ...createBaseThought(),
    mode: 'deductive',
    ...overrides,
  } as ThinkingToolInput;
}

/**
 * Create a deductive thought with premises
 */
export function createDeductiveWithPremises(
  premises: string[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createDeductiveThought({
    premises,
    ...overrides,
  });
}

/**
 * Create a deductive thought with conclusion
 */
export function createDeductiveWithConclusion(
  conclusion: string,
  premises: string[] = [],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createDeductiveThought({
    premises,
    conclusion,
    ...overrides,
  });
}

/**
 * Create a deductive thought with logic form
 */
export function createDeductiveWithLogicForm(
  logicForm: string,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createDeductiveThought({
    logicForm,
    ...overrides,
  });
}

/**
 * Create a deductive thought with validity check
 */
export function createDeductiveWithValidityCheck(
  validityCheck: boolean,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createDeductiveThought({
    validityCheck,
    ...overrides,
  });
}

/**
 * Create a deductive thought with soundness check
 */
export function createDeductiveWithSoundnessCheck(
  soundnessCheck: boolean,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createDeductiveThought({
    soundnessCheck,
    ...overrides,
  });
}

/**
 * Create a complete deductive thought with all optional params
 */
export function createCompleteDeductiveThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createDeductiveThought({
    premises: ['All humans are mortal', 'Socrates is human'],
    conclusion: 'Socrates is mortal',
    logicForm: 'modus_ponens',
    validityCheck: true,
    soundnessCheck: true,
    assumptions: ['Premises are true'],
    uncertainty: 0.1,
    ...overrides,
  });
}

/**
 * Create a classic syllogism
 */
export function createClassicSyllogism(): ThinkingToolInput {
  return createDeductiveWithConclusion(
    'Socrates is mortal',
    ['All men are mortal', 'Socrates is a man'],
    { logicForm: 'modus_ponens', validityCheck: true }
  );
}

// ============================================================================
// ABDUCTIVE MODE THOUGHT FACTORIES
// ============================================================================

/**
 * Hypothesis for abductive reasoning
 */
export interface TestHypothesis {
  id: string;
  explanation: string;
  score?: number;
}

/**
 * Create a basic abductive thought with required params only
 */
export function createAbductiveThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    ...createBaseThought(),
    mode: 'abductive',
    ...overrides,
  } as ThinkingToolInput;
}

/**
 * Create an abductive thought with observations
 */
export function createAbductiveWithObservations(
  observations: string[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createAbductiveThought({
    observations,
    ...overrides,
  });
}

/**
 * Create an abductive thought with hypotheses
 */
export function createAbductiveWithHypotheses(
  hypotheses: TestHypothesis[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createAbductiveThought({
    hypotheses,
    ...overrides,
  });
}

/**
 * Create an abductive thought with best explanation
 */
export function createAbductiveWithBestExplanation(
  bestExplanation: TestHypothesis,
  hypotheses: TestHypothesis[] = [],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createAbductiveThought({
    hypotheses,
    bestExplanation,
    ...overrides,
  });
}

/**
 * Create an abductive thought with scored hypotheses
 */
export function createAbductiveWithScoredHypotheses(
  scores: number[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  const hypotheses = scores.map((score, i) => ({
    id: `h${i + 1}`,
    explanation: `Hypothesis ${i + 1}`,
    score,
  }));
  return createAbductiveWithHypotheses(hypotheses, overrides);
}

/**
 * Create a complete abductive thought with all optional params
 */
export function createCompleteAbductiveThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  const hypotheses: TestHypothesis[] = [
    { id: 'h1', explanation: 'Primary hypothesis', score: 0.8 },
    { id: 'h2', explanation: 'Alternative hypothesis', score: 0.6 },
    { id: 'h3', explanation: 'Unlikely hypothesis', score: 0.2 },
  ];

  return createAbductiveThought({
    observations: ['Observation A', 'Observation B'],
    hypotheses,
    bestExplanation: hypotheses[0],
    assumptions: ['Assumption 1'],
    uncertainty: 0.3,
    ...overrides,
  });
}

// ============================================================================
// COMMON BRANCHING AND REVISION FACTORIES
// ============================================================================

/**
 * Create a thought with branching
 */
export function createThoughtWithBranch(
  mode: 'inductive' | 'deductive' | 'abductive',
  branchFrom: string,
  branchId: string,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  const factory = mode === 'inductive' ? createInductiveThought :
                  mode === 'deductive' ? createDeductiveThought :
                  createAbductiveThought;
  return factory({
    branchFrom,
    branchId,
    ...overrides,
  });
}

/**
 * Create a revision thought
 */
export function createRevisionThought(
  mode: 'inductive' | 'deductive' | 'abductive',
  revisesThought: string,
  revisionReason: string,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  const factory = mode === 'inductive' ? createInductiveThought :
                  mode === 'deductive' ? createDeductiveThought :
                  createAbductiveThought;
  return factory({
    isRevision: true,
    revisesThought,
    revisionReason,
    ...overrides,
  });
}

/**
 * Create a thought with dependencies
 */
export function createThoughtWithDependencies(
  mode: 'inductive' | 'deductive' | 'abductive',
  dependencies: string[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  const factory = mode === 'inductive' ? createInductiveThought :
                  mode === 'deductive' ? createDeductiveThought :
                  createAbductiveThought;
  return factory({
    dependencies,
    ...overrides,
  });
}

// ============================================================================
// MULTI-THOUGHT SEQUENCE FACTORIES
// ============================================================================

/**
 * Create a sequence of inductive thoughts
 */
export function createInductiveSequence(
  count: number,
  baseOverrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput[] {
  return Array.from({ length: count }, (_, i) =>
    createInductiveThought({
      thought: `Inductive step ${i + 1}`,
      thoughtNumber: i + 1,
      totalThoughts: count,
      nextThoughtNeeded: i < count - 1,
      ...baseOverrides,
    })
  );
}

/**
 * Create a sequence of deductive thoughts (proof chain)
 */
export function createDeductiveProofChain(
  steps: Array<{ premises: string[]; conclusion: string }>
): ThinkingToolInput[] {
  return steps.map((step, i) =>
    createDeductiveWithConclusion(step.conclusion, step.premises, {
      thought: `Proof step ${i + 1}: ${step.conclusion}`,
      thoughtNumber: i + 1,
      totalThoughts: steps.length,
      nextThoughtNeeded: i < steps.length - 1,
      logicForm: 'modus_ponens',
      validityCheck: true,
    })
  );
}

/**
 * Create an abductive hypothesis refinement sequence
 */
export function createAbductiveRefinementSequence(
  observations: string[],
  hypotheses: TestHypothesis[]
): ThinkingToolInput[] {
  const thoughts: ThinkingToolInput[] = [];

  // Step 1: Initial observations
  thoughts.push(createAbductiveWithObservations(observations, {
    thought: 'Initial observations collected',
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
  }));

  // Step 2: Generate hypotheses
  thoughts.push(createAbductiveWithHypotheses(hypotheses, {
    thought: 'Hypotheses generated',
    thoughtNumber: 2,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    observations,
  }));

  // Step 3: Select best explanation
  const bestHypothesis = hypotheses.reduce((a, b) =>
    (a.score || 0) > (b.score || 0) ? a : b
  );
  thoughts.push(createAbductiveWithBestExplanation(bestHypothesis, hypotheses, {
    thought: 'Best explanation selected',
    thoughtNumber: 3,
    totalThoughts: 3,
    nextThoughtNeeded: false,
    observations,
  }));

  return thoughts;
}
