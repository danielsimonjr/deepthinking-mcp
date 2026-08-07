/**
 * Mode Reachability Tests
 *
 * A `ThinkingMode` is only real if an MCP client can SELECT it. Four modes --
 * stochastic, constraint, modal, recursive -- shipped for several versions with
 * a full handler, a registered validator and a place in FULLY_IMPLEMENTED_MODES
 * while NO tool accepted the value. `recommend_mode` would answer "stochastic"
 * for a Monte Carlo problem and there was no tool that would take it.
 *
 * Nothing caught that, because every existing test asked "does the handler
 * work?" and none asked "can anyone reach the handler?". This file asks the
 * second question, as a class:
 *
 *  1. every fully-implemented mode appears in some tool's advertised enum;
 *  2. a fully-populated payload for each newly-wired mode survives Zod (Zod
 *     strips unknown keys silently, so an accepted mode with stripped fields is
 *     still useless);
 *  3. the real handler then reads those exact fields off the parsed input;
 *  4. the MAX_LENGTHS caps apply to every field added;
 *  5. validation stays ADVISORY -- an unrecognised vocabulary value warns, it
 *     does not reject.
 */

import { describe, it, expect } from 'vitest';
import { toolList, toolSchemas, modeToToolMap } from '../../../src/tools/definitions.js';
import { FULLY_IMPLEMENTED_MODES, ThinkingMode } from '../../../src/types/core.js';
import { MAX_LENGTHS } from '../../../src/utils/sanitization.js';
import { StochasticHandler } from '../../../src/modes/handlers/StochasticHandler.js';
import { ConstraintHandler } from '../../../src/modes/handlers/ConstraintHandler.js';
import { ModalHandler } from '../../../src/modes/handlers/ModalHandler.js';
import { RecursiveHandler } from '../../../src/modes/handlers/RecursiveHandler.js';

/** Minimal valid base thought; mode-specific fields are the only variable. */
const BASE = {
  thought: 'reachability probe',
  thoughtNumber: 1,
  totalThoughts: 1,
  nextThoughtNeeded: false,
};

/** mode value -> tool name, read from the ADVERTISED enums, not from any map. */
const advertisedModeToTool = new Map<string, string>();
for (const tool of toolList) {
  const name = (tool as any).name as string;
  const modeProp = (tool as any).inputSchema?.properties?.mode;
  if (!Array.isArray(modeProp?.enum)) continue;
  for (const mode of modeProp.enum as string[]) advertisedModeToTool.set(mode, name);
}

/** Parse a payload through the tool that owns the mode. */
function parseForMode(mode: string, payload: Record<string, unknown>) {
  const toolName = advertisedModeToTool.get(mode);
  expect(toolName, `no tool advertises mode "${mode}"`).toBeDefined();
  const schema = (toolSchemas as any)[toolName!];
  return schema.parse(payload) as Record<string, any>;
}

// ===========================================================================
// 1. Class guard: no fully-implemented mode is stranded
// ===========================================================================

describe('mode reachability: every implemented mode is selectable', () => {
  it('advertises every mode in FULLY_IMPLEMENTED_MODES through some tool', () => {
    const stranded = FULLY_IMPLEMENTED_MODES.filter(
      (mode) => !advertisedModeToTool.has(mode)
    );
    expect(stranded, 'implemented but unreachable through tools/list').toEqual([]);
  });

  it('routes every advertised mode to the tool that advertises it', () => {
    const mismatched: string[] = [];
    for (const [mode, tool] of advertisedModeToTool) {
      if (modeToToolMap[mode] !== tool) {
        mismatched.push(`${mode}: advertised on ${tool}, mapped to ${modeToToolMap[mode]}`);
      }
    }
    expect(mismatched, 'modeToToolMap disagrees with the advertised enums').toEqual([]);
  });

  /**
   * `custom` is the ONE mode deliberately left off the MCP surface, and the
   * repo says so itself: it is the only ThinkingMode absent from
   * FULLY_IMPLEMENTED_MODES. Its payload (`customFields[].value`, `metadata`)
   * is arbitrary user data that the MAX_LENGTHS caps cannot bound, so exposing
   * it is a decision, not an oversight. Pinned here so a future "all modes"
   * sweep does not add it by reflex.
   */
  it('keeps custom off the tool surface, matching its absence from FULLY_IMPLEMENTED_MODES', () => {
    expect(FULLY_IMPLEMENTED_MODES).not.toContain(ThinkingMode.CUSTOM);
    expect(advertisedModeToTool.has('custom')).toBe(false);
    expect(modeToToolMap.custom).toBeUndefined();
  });

  it.each([
    ['stochastic', 'deepthinking_probabilistic'],
    ['constraint', 'deepthinking_strategic'],
    ['modal', 'deepthinking_scientific'],
    ['recursive', 'deepthinking_engineering'],
  ])('places %s on %s', (mode, tool) => {
    expect(advertisedModeToTool.get(mode)).toBe(tool);
  });
});

// ===========================================================================
// 2 + 3. Fields survive Zod, then the handler reads them
// ===========================================================================

describe('mode reachability: stochastic', () => {
  const payload = {
    ...BASE,
    mode: 'stochastic',
    thoughtType: 'monte_carlo_simulation',
    processType: 'discrete_time',
    stepCount: 3,
    currentState: 's1',
    stateHistory: ['s0', 's1'],
    markovChain: {
      id: 'mc1',
      name: 'weather',
      states: [
        { id: 's0', name: 'sunny', description: 'clear', isAbsorbing: false },
        { id: 's1', name: 'rainy', description: 'wet', isAbsorbing: true },
      ],
      transitions: [{ id: 't0', fromState: 's0', toState: 's1', probability: 1 }],
      initialDistribution: { s0: 1 },
      isIrreducible: false,
      period: 1,
    },
    randomVariables: [
      {
        id: 'rv1',
        name: 'X',
        distribution: 'normal',
        parameters: { mean: 0, stdDev: 1 },
        samples: [1, 2, 3],
      },
    ],
    simulations: [
      {
        id: 'sim1',
        iterations: 1000,
        mean: 0.5,
        variance: 0.1,
        confidenceInterval: [0.4, 0.6],
        samples: [0.4, 0.5, 0.6],
      },
    ],
    simulationResults: [{ id: 'sr1', iterations: 50 }],
  };

  it('survives Zod with every field StochasticHandler reads', () => {
    const parsed = parseForMode('stochastic', payload);
    for (const key of [
      'thoughtType',
      'processType',
      'stepCount',
      'currentState',
      'stateHistory',
      'markovChain',
      'randomVariables',
      'simulations',
      'simulationResults',
    ]) {
      expect(parsed, `${key} was stripped`).toHaveProperty(key);
    }
    expect(parsed.markovChain.transitions[0].fromState).toBe('s0');
    expect(parsed.randomVariables[0].samples).toEqual([1, 2, 3]);
    expect(parsed.simulations[0].confidenceInterval).toEqual([0.4, 0.6]);
  });

  it('reaches StochasticHandler, which carries the fields onto the thought', () => {
    const parsed = parseForMode('stochastic', payload);
    const thought = new StochasticHandler().createThought(parsed as never, 'sess-1') as any;

    expect(thought.mode).toBe(ThinkingMode.STOCHASTIC);
    expect(thought.thoughtType).toBe('monte_carlo_simulation');
    expect(thought.processType).toBe('discrete_time');
    expect(thought.stepCount).toBe(3);
    expect(thought.currentState).toBe('s1');
    expect(thought.stateHistory).toEqual(['s0', 's1']);
    expect(thought.markovChain.states).toHaveLength(2);
    expect(thought.markovChain.transitions[0].toState).toBe('s1');
    expect(thought.markovChain.initialDistribution).toEqual({ s0: 1 });
    expect(thought.randomVariables[0].distribution).toBe('normal');
    expect(thought.simulations[0].iterations).toBe(1000);
  });
});

describe('mode reachability: constraint', () => {
  const payload = {
    ...BASE,
    mode: 'constraint',
    thoughtType: 'solution_search',
    variables: [
      {
        id: 'v1',
        name: 'X',
        domain: [1, 2, 3],
        currentValue: 1,
        domainReduced: true,
        assignedAt: 0,
      },
      { id: 'v2', name: 'Y', domain: ['a', 'b'] },
    ],
    cspConstraints: [
      {
        id: 'c1',
        name: 'different',
        type: 'binary',
        variables: ['v1', 'v2'],
        expression: 'v1 != v2',
        satisfied: true,
        priority: 'required',
        weight: 1,
      },
    ],
    currentAssignments: { v1: 1, v2: 'a' },
    assignmentHistory: [{ variableId: 'v1', value: 1, step: 0, backtracked: false }],
    arcs: [{ from: 'v1', to: 'v2', constraintId: 'c1' }],
    backtracks: 2,
    searchStep: 5,
    isArcConsistent: true,
    solutionStatus: 'searching',
    solutionCount: 0,
  };

  it('survives Zod with every field ConstraintHandler reads', () => {
    const parsed = parseForMode('constraint', payload);
    for (const key of [
      'thoughtType',
      'variables',
      'cspConstraints',
      'currentAssignments',
      'assignmentHistory',
      'arcs',
      'backtracks',
      'searchStep',
      'isArcConsistent',
      'solutionStatus',
      'solutionCount',
    ]) {
      expect(parsed, `${key} was stripped`).toHaveProperty(key);
    }
    expect(parsed.variables[0].domain).toEqual([1, 2, 3]);
    expect(parsed.variables[1].domain).toEqual(['a', 'b']);
    expect(parsed.currentAssignments).toEqual({ v1: 1, v2: 'a' });
  });

  /**
   * The CSP objects ride `cspConstraints`, not `constraints`: `constraints` is
   * the optimization mode's array of STRINGS on this same tool and redefining
   * it would break every optimization caller. This pins that the optimization
   * meaning is untouched.
   */
  it('leaves the optimization meaning of `constraints` intact', () => {
    const parsed = parseForMode('optimization', {
      ...BASE,
      mode: 'optimization',
      objectiveFunction: 'minimise cost',
      constraints: ['x >= 0', 'y >= 0'],
    });
    expect(parsed.constraints).toEqual(['x >= 0', 'y >= 0']);
  });

  it('reaches ConstraintHandler, which carries the fields onto the thought', () => {
    const parsed = parseForMode('constraint', payload);
    const thought = new ConstraintHandler().createThought(parsed as never, 'sess-2') as any;

    expect(thought.mode).toBe(ThinkingMode.CONSTRAINT);
    expect(thought.thoughtType).toBe('solution_search');
    expect(thought.variables).toHaveLength(2);
    expect(thought.variables[0].domain).toEqual([1, 2, 3]);
    // cspConstraints is what the handler falls back to; the thought field is
    // named `constraints`.
    expect(thought.constraints).toHaveLength(1);
    expect(thought.constraints[0].expression).toBe('v1 != v2');
    expect(thought.currentAssignments).toEqual({ v1: 1, v2: 'a' });
    expect(thought.assignmentHistory).toHaveLength(1);
    expect(thought.arcs[0].constraintId).toBe('c1');
    expect(thought.backtracks).toBe(2);
    expect(thought.searchStep).toBe(5);
    expect(thought.isArcConsistent).toBe(true);
    expect(thought.solutionCount).toBe(0);
  });
});

describe('mode reachability: modal', () => {
  const payload = {
    ...BASE,
    mode: 'modal',
    thoughtType: 'necessity_proof',
    worlds: [
      {
        id: 'w1',
        name: 'actual',
        description: 'the world as it is',
        propositions: { p: true },
        isActual: true,
        accessibility: ['w1', 'w2'],
      },
      { id: 'w2', name: 'alternative', propositions: { p: false } },
    ],
    actualWorld: 'w1',
    propositions: [
      {
        id: 'p1',
        content: 'p',
        operator: 'necessary',
        truthValue: false,
      },
    ],
    accessibilityRelations: [
      { id: 'r1', fromWorld: 'w1', toWorld: 'w2', type: 'reflexive', modalType: 'alethic' },
    ],
    inferences: [
      {
        id: 'i1',
        premises: ['necessarily p'],
        conclusion: 'p',
        rule: 'T',
        valid: true,
        justification: 'axiom T',
      },
    ],
    modalLogicType: 'S5',
    modalDomain: 'alethic',
  };

  it('survives Zod with every field ModalHandler reads', () => {
    const parsed = parseForMode('modal', payload);
    for (const key of [
      'thoughtType',
      'worlds',
      'actualWorld',
      'propositions',
      'accessibilityRelations',
      'inferences',
      'modalLogicType',
      'modalDomain',
    ]) {
      expect(parsed, `${key} was stripped`).toHaveProperty(key);
    }
    expect(parsed.worlds[0].propositions).toEqual({ p: true });
  });

  /** `inference` (formal logic, a string) and `inferences` (modal) coexist. */
  it('does not disturb the formal-logic `inference` field', () => {
    const parsed = parseForMode('formallogic', {
      ...BASE,
      mode: 'formallogic',
      premises: ['all men are mortal'],
      conclusion: 'Socrates is mortal',
      inference: 'modus ponens',
    });
    expect(parsed.inference).toBe('modus ponens');
    expect(parsed.inferences).toBeUndefined();
  });

  it('reaches ModalHandler, which carries the fields onto the thought', () => {
    const parsed = parseForMode('modal', payload);
    const thought = new ModalHandler().createThought(parsed as never, 'sess-3') as any;

    expect(thought.mode).toBe(ThinkingMode.MODAL);
    expect(thought.thoughtType).toBe('necessity_proof');
    expect(thought.worlds).toHaveLength(2);
    expect(thought.actualWorld).toBe('w1');
    expect(thought.modalLogicType).toBe('S5');
    expect(thought.modalDomain).toBe('alethic');
    expect(thought.accessibilityRelations[0].toWorld).toBe('w2');
    expect(thought.inferences[0].rule).toBe('T');
    // The handler derives world membership from the worlds' truth assignments,
    // which only works because `worlds[].propositions` survived the schema.
    expect(thought.propositions[0].worldsTrue).toEqual(['w1']);
    expect(thought.propositions[0].worldsFalse).toEqual(['w2']);
  });
});

describe('mode reachability: recursive', () => {
  const payload = {
    ...BASE,
    mode: 'recursive',
    thoughtType: 'problem_decomposition',
    subproblems: [
      {
        id: 'sp1',
        name: 'left half',
        description: 'sort the left half',
        size: 'n/2',
        depth: 1,
        parentId: 'root',
        status: 'pending',
      },
      { id: 'sp2', description: 'sort the right half', size: 4, depth: 1 },
    ],
    baseCases: [{ id: 'bc1', condition: 'n <= 1', result: 'return the input', verified: true }],
    baseCaseReached: true,
    currentDepth: 1,
    maxDepth: 10,
    recurrence: {
      formula: 'T(n) = 2T(n/2) + O(n)',
      baseCase: 'T(1) = O(1)',
      closedForm: 'n log n',
      complexity: 'O(n log n)',
    },
    strategy: 'divide_and_conquer',
    divisionFactor: 2,
  };

  it('survives Zod with every field RecursiveHandler reads', () => {
    const parsed = parseForMode('recursive', payload);
    for (const key of [
      'thoughtType',
      'subproblems',
      'baseCases',
      'baseCaseReached',
      'currentDepth',
      'maxDepth',
      'recurrence',
      'strategy',
      'divisionFactor',
    ]) {
      expect(parsed, `${key} was stripped`).toHaveProperty(key);
    }
    expect(parsed.subproblems[0].size).toBe('n/2');
    expect(parsed.subproblems[1].size).toBe(4);
  });

  it('reaches RecursiveHandler, which carries the fields onto the thought', () => {
    const parsed = parseForMode('recursive', payload);
    const thought = new RecursiveHandler().createThought(parsed as never, 'sess-4') as any;

    expect(thought.mode).toBe(ThinkingMode.RECURSIVE);
    expect(thought.thoughtType).toBe('problem_decomposition');
    expect(thought.subproblems).toHaveLength(2);
    expect(thought.subproblems[0].parentId).toBe('root');
    expect(thought.baseCases[0].verified).toBe(true);
    expect(thought.baseCaseReached).toBe(true);
    expect(thought.currentDepth).toBe(1);
    expect(thought.maxDepth).toBe(10);
    expect(thought.recurrence.complexity).toBe('O(n log n)');
    expect(thought.strategy).toBe('divide_and_conquer');
    expect(thought.divisionFactor).toBe(2);
  });
});

// ===========================================================================
// 4. The H-2 input caps apply to everything added
// ===========================================================================

describe('mode reachability: added fields respect MAX_LENGTHS', () => {
  const tooManyObjects = MAX_LENGTHS.NESTED_ARRAY_ITEMS + 1;
  const tooManyStrings = MAX_LENGTHS.ARRAY_ITEMS + 1;

  function rejects(mode: string, payload: Record<string, unknown>) {
    const schema = (toolSchemas as any)[advertisedModeToTool.get(mode)!];
    return schema.safeParse({ ...BASE, mode, ...payload }).success === false;
  }

  it('caps stochastic object arrays and state history', () => {
    expect(
      rejects('stochastic', {
        randomVariables: Array.from({ length: tooManyObjects }, (_, i) => ({ id: `rv${i}` })),
      })
    ).toBe(true);
    expect(
      rejects('stochastic', { stateHistory: Array.from({ length: tooManyStrings }, () => 's') })
    ).toBe(true);
    expect(
      rejects('stochastic', {
        markovChain: {
          states: Array.from({ length: tooManyObjects }, (_, i) => ({ id: `s${i}` })),
        },
      })
    ).toBe(true);
  });

  it('caps constraint object arrays and the assignment record', () => {
    expect(
      rejects('constraint', {
        cspConstraints: Array.from({ length: tooManyObjects }, (_, i) => ({ id: `c${i}` })),
      })
    ).toBe(true);
    expect(
      rejects('constraint', {
        currentAssignments: Object.fromEntries(
          Array.from({ length: tooManyStrings }, (_, i) => [`v${i}`, i])
        ),
      })
    ).toBe(true);
  });

  it('caps modal object arrays and the per-world truth assignment', () => {
    expect(
      rejects('modal', {
        worlds: Array.from({ length: tooManyObjects }, (_, i) => ({ id: `w${i}` })),
      })
    ).toBe(true);
    expect(
      rejects('modal', {
        worlds: [
          {
            id: 'w1',
            propositions: Object.fromEntries(
              Array.from({ length: tooManyStrings }, (_, i) => [`p${i}`, true])
            ),
          },
        ],
      })
    ).toBe(true);
  });

  it('caps recursive object arrays', () => {
    expect(
      rejects('recursive', {
        subproblems: Array.from({ length: tooManyObjects }, (_, i) => ({ id: `sp${i}` })),
      })
    ).toBe(true);
  });

  it('caps the free-text fields on the added objects', () => {
    const huge = 'x'.repeat(MAX_LENGTHS.DESCRIPTION + 1);
    expect(rejects('recursive', { recurrence: { formula: huge } })).toBe(true);
    expect(rejects('modal', { propositions: [{ id: 'p1', content: huge }] })).toBe(true);
  });

  it('still accepts a payload exactly at the cap', () => {
    const schema = (toolSchemas as any).deepthinking_engineering;
    const atCap = schema.safeParse({
      ...BASE,
      mode: 'recursive',
      subproblems: Array.from({ length: MAX_LENGTHS.NESTED_ARRAY_ITEMS }, (_, i) => ({
        id: `sp${i}`,
      })),
    });
    expect(atCap.success).toBe(true);
  });
});

// ===========================================================================
// 5. Validation stays advisory
// ===========================================================================

describe('mode reachability: vocabulary values warn, they never reject', () => {
  /**
   * `thoughtType` / `processType` / `strategy` / `modalLogicType` are bounded
   * STRINGS, not Zod enums, precisely so an unrecognised value reaches the
   * handler and comes back as a warning. Making them enums would convert every
   * one of these warnings into a hard call failure.
   */
  it('accepts an unrecognised stochastic thoughtType and processType, then warns', () => {
    const parsed = parseForMode('stochastic', {
      ...BASE,
      mode: 'stochastic',
      thoughtType: 'not_a_real_type',
      processType: 'not_a_real_process',
    });
    const result = new StochasticHandler().validate(parsed as never);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings.map((w) => w.field)).toEqual(
      expect.arrayContaining(['thoughtType', 'processType'])
    );
  });

  it('warns rather than rejects when Markov transitions do not sum to 1', () => {
    const parsed = parseForMode('stochastic', {
      ...BASE,
      mode: 'stochastic',
      markovChain: {
        states: [{ id: 's0' }, { id: 's1' }],
        transitions: [{ fromState: 's0', toState: 's1', probability: 0.5 }],
        initialDistribution: { s0: 0.5 },
      },
    });
    const result = new StochasticHandler().validate(parsed as never);
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it.each([
    ['modal', 'modalLogicType', 'Z9'],
    ['recursive', 'strategy', 'guess_and_check'],
    ['constraint', 'solutionStatus', 'somewhere_in_between'],
  ])('accepts an unrecognised %s %s without a Zod error', (mode, field, value) => {
    const schema = (toolSchemas as any)[advertisedModeToTool.get(mode)!];
    const result = schema.safeParse({ ...BASE, mode, [field]: value });
    expect(result.success).toBe(true);
    expect(result.data[field]).toBe(value);
  });
});
