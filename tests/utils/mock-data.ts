/**
 * Mock Data - Test Utilities for Phase 11
 *
 * Reusable test data for deepthinking-mcp testing.
 * Provides realistic mock data for inductive, deductive, and abductive modes.
 */

// ============================================================================
// INDUCTIVE MODE MOCK DATA
// ============================================================================

/**
 * Sample observations for inductive reasoning tests
 */
export const SAMPLE_OBSERVATIONS = {
  few: ['Observation 1', 'Observation 2', 'Observation 3'],
  many: [
    'Observation 1', 'Observation 2', 'Observation 3', 'Observation 4', 'Observation 5',
    'Observation 6', 'Observation 7', 'Observation 8', 'Observation 9', 'Observation 10',
    'Observation 11', 'Observation 12',
  ],
  scientific: [
    'Swan 1 is white',
    'Swan 2 is white',
    'Swan 3 is white',
    'Swan 4 is white',
    'Swan 5 is white',
  ],
  behavioral: [
    'Customer A bought product after seeing ad',
    'Customer B bought product after seeing ad',
    'Customer C bought product after seeing ad',
    'Customer D bought product after seeing ad',
  ],
};

/**
 * Sample patterns for inductive reasoning
 */
export const SAMPLE_PATTERNS = {
  simple: 'All observed items share property X',
  scientific: 'All observed swans are white',
  behavioral: 'Customers who see ads tend to purchase',
  statistical: 'Values cluster around the mean with standard deviation 2.5',
};

/**
 * Sample generalizations for inductive reasoning
 */
export const SAMPLE_GENERALIZATIONS = {
  simple: 'All items have property X',
  scientific: 'All swans are white',
  qualified: 'Most instances exhibit behavior Y under conditions Z',
  probabilistic: 'There is a 95% probability that future observations will match the pattern',
};

/**
 * Sample counterexamples
 */
export const SAMPLE_COUNTEREXAMPLES = {
  single: ['Exception found in case Y'],
  multiple: ['Black swan found in Australia', 'Gray swan found in zoo', 'Albino variant noted'],
  edge: ['Edge case: null value observed', 'Edge case: negative number found'],
};

/**
 * Confidence levels for testing
 */
export const CONFIDENCE_LEVELS = {
  zero: 0.0,
  low: 0.25,
  medium: 0.5,
  high: 0.75,
  full: 1.0,
};

/**
 * Sample sizes for inductive testing
 */
export const SAMPLE_SIZES = {
  tiny: 5,
  small: 10,
  medium: 50,
  large: 100,
  xlarge: 1000,
};

// ============================================================================
// DEDUCTIVE MODE MOCK DATA
// ============================================================================

/**
 * Classic syllogism premises and conclusions
 */
export const CLASSIC_SYLLOGISMS = {
  mortality: {
    premises: ['All men are mortal', 'Socrates is a man'],
    conclusion: 'Socrates is mortal',
    logicForm: 'modus_ponens',
    isValid: true,
    isSound: true,
  },
  animals: {
    premises: ['All mammals are animals', 'All dogs are mammals'],
    conclusion: 'All dogs are animals',
    logicForm: 'hypothetical_syllogism',
    isValid: true,
    isSound: true,
  },
  modusTollens: {
    premises: ['If it is raining, the ground is wet', 'The ground is not wet'],
    conclusion: 'It is not raining',
    logicForm: 'modus_tollens',
    isValid: true,
    isSound: true,
  },
  disjunctive: {
    premises: ['Either it is day or it is night', 'It is not day'],
    conclusion: 'It is night',
    logicForm: 'disjunctive_syllogism',
    isValid: true,
    isSound: true,
  },
  invalid: {
    premises: ['Some cats are black', 'Some black things are lucky'],
    conclusion: 'Some cats are lucky',
    logicForm: 'invalid_syllogism',
    isValid: false,
    isSound: false,
  },
};

/**
 * Logic forms for deductive reasoning
 */
export const LOGIC_FORMS = {
  MODUS_PONENS: 'modus_ponens',
  MODUS_TOLLENS: 'modus_tollens',
  HYPOTHETICAL_SYLLOGISM: 'hypothetical_syllogism',
  DISJUNCTIVE_SYLLOGISM: 'disjunctive_syllogism',
  CONJUNCTION: 'conjunction',
  SIMPLIFICATION: 'simplification',
  ADDITION: 'addition',
  CONTRAPOSITION: 'contraposition',
};

/**
 * Sample premises for deductive reasoning
 */
export const SAMPLE_PREMISES = {
  simple: ['All A are B', 'X is A'],
  chain: ['If P then Q', 'If Q then R', 'If R then S', 'P'],
  complex: [
    'All software engineers write code',
    'All people who write code understand logic',
    'John is a software engineer',
  ],
  mathematical: [
    'All even numbers are divisible by 2',
    '4 is an even number',
  ],
};

/**
 * Sample conclusions for deductive reasoning
 */
export const SAMPLE_CONCLUSIONS = {
  simple: 'X is B',
  chain: 'Therefore S',
  complex: 'John understands logic',
  mathematical: '4 is divisible by 2',
};

// ============================================================================
// ABDUCTIVE MODE MOCK DATA
// ============================================================================

/**
 * Sample hypotheses for abductive reasoning
 */
export const SAMPLE_HYPOTHESES = {
  simple: [
    { id: 'h1', explanation: 'Hypothesis A is the cause', score: 0.8 },
    { id: 'h2', explanation: 'Hypothesis B is the cause', score: 0.5 },
  ],
  multiple: [
    { id: 'h1', explanation: 'System overload', score: 0.9 },
    { id: 'h2', explanation: 'Memory leak', score: 0.7 },
    { id: 'h3', explanation: 'Network issue', score: 0.6 },
    { id: 'h4', explanation: 'Database bottleneck', score: 0.4 },
    { id: 'h5', explanation: 'Hardware failure', score: 0.2 },
  ],
  medical: [
    { id: 'h1', explanation: 'Common cold', score: 0.7 },
    { id: 'h2', explanation: 'Influenza', score: 0.5 },
    { id: 'h3', explanation: 'Allergies', score: 0.3 },
  ],
  debugging: [
    { id: 'h1', explanation: 'Null pointer exception', score: 0.85 },
    { id: 'h2', explanation: 'Race condition', score: 0.6 },
    { id: 'h3', explanation: 'Memory overflow', score: 0.4 },
  ],
};

/**
 * Sample observations for abductive reasoning
 */
export const ABDUCTIVE_OBSERVATIONS = {
  system: [
    'Server response time increased by 200%',
    'Memory usage at 95%',
    'CPU usage spiking to 100%',
  ],
  medical: [
    'Patient has fever',
    'Patient has cough',
    'Patient has fatigue',
  ],
  debugging: [
    'Application crashes intermittently',
    'Error occurs during peak hours',
    'No error in logs',
  ],
};

/**
 * Best explanation examples
 */
export const BEST_EXPLANATIONS = {
  system: { id: 'h1', explanation: 'System overload', score: 0.9 },
  medical: { id: 'h1', explanation: 'Common cold', score: 0.7 },
  debugging: { id: 'h1', explanation: 'Null pointer exception', score: 0.85 },
};

// ============================================================================
// COMMON TEST DATA
// ============================================================================

/**
 * Sample assumptions for any mode
 */
export const SAMPLE_ASSUMPTIONS = {
  simple: ['Assumption 1', 'Assumption 2'],
  detailed: [
    'The data is representative of the population',
    'Observations are independent',
    'No confounding variables present',
    'Measurement error is negligible',
  ],
};

/**
 * Sample dependencies for thought chains
 */
export const SAMPLE_DEPENDENCIES = {
  single: ['thought-1'],
  chain: ['thought-1', 'thought-2', 'thought-3'],
  complex: ['thought-1', 'thought-2', 'thought-4'],
};

/**
 * Branching test data
 */
export const BRANCH_DATA = {
  simple: {
    branchFrom: 'thought-2',
    branchId: 'branch-a',
  },
  alternative: {
    branchFrom: 'thought-3',
    branchId: 'branch-b',
  },
};

/**
 * Revision test data
 */
export const REVISION_DATA = {
  simple: {
    revisesThought: 'thought-1',
    revisionReason: 'Found error in logic',
  },
  correction: {
    revisesThought: 'thought-2',
    revisionReason: 'New evidence contradicts original conclusion',
  },
  refinement: {
    revisesThought: 'thought-3',
    revisionReason: 'Improved understanding of the problem',
  },
};

/**
 * Uncertainty levels for testing
 */
export const UNCERTAINTY_LEVELS = {
  none: 0.0,
  low: 0.1,
  medium: 0.3,
  high: 0.5,
  veryHigh: 0.8,
  maximum: 1.0,
};

// ============================================================================
// MULTI-THOUGHT SEQUENCE DATA
// ============================================================================

/**
 * Data for multi-thought inductive session
 */
export const INDUCTIVE_SEQUENCE_DATA = {
  steps: [
    {
      thought: 'Collecting initial observations',
      observations: ['Obs 1', 'Obs 2', 'Obs 3'],
    },
    {
      thought: 'Identifying patterns in data',
      pattern: 'Common property X observed',
      observations: ['Obs 1', 'Obs 2', 'Obs 3', 'Obs 4', 'Obs 5'],
    },
    {
      thought: 'Forming tentative generalization',
      generalization: 'All instances exhibit property X',
      confidence: 0.7,
    },
    {
      thought: 'Testing with additional observations',
      sampleSize: 50,
      confidence: 0.85,
    },
    {
      thought: 'Final generalization with confidence assessment',
      generalization: 'Property X is universal with 95% confidence',
      confidence: 0.95,
    },
  ],
};

/**
 * Data for multi-thought deductive proof chain
 */
export const DEDUCTIVE_PROOF_CHAIN_DATA = {
  steps: [
    {
      premises: ['All A are B'],
      conclusion: 'X is B',
      logicForm: 'universal_instantiation',
    },
    {
      premises: ['All B are C', 'X is B'],
      conclusion: 'X is C',
      logicForm: 'modus_ponens',
    },
    {
      premises: ['All C are D', 'X is C'],
      conclusion: 'X is D',
      logicForm: 'modus_ponens',
    },
    {
      premises: ['If X is D then X is E', 'X is D'],
      conclusion: 'X is E',
      logicForm: 'modus_ponens',
    },
  ],
};

/**
 * Data for abductive hypothesis refinement
 */
export const ABDUCTIVE_REFINEMENT_DATA = {
  observations: [
    'System is slow',
    'High memory usage',
    'Recent deployment',
  ],
  initialHypotheses: [
    { id: 'h1', explanation: 'Memory leak in new code', score: 0.6 },
    { id: 'h2', explanation: 'Database query issue', score: 0.5 },
    { id: 'h3', explanation: 'Infrastructure problem', score: 0.3 },
  ],
  refinedHypotheses: [
    { id: 'h1', explanation: 'Memory leak in new code', score: 0.85 },
    { id: 'h2', explanation: 'Database query issue', score: 0.4 },
    { id: 'h3', explanation: 'Infrastructure problem', score: 0.1 },
  ],
  bestExplanation: { id: 'h1', explanation: 'Memory leak in new code', score: 0.85 },
};
