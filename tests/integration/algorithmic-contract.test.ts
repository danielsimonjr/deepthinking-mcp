/**
 * Algorithmic mode: the contract the handler reads
 *
 * AlgorithmicHandler reads algorithm, clrsCategory, clrsAlgorithm, designPattern,
 * timeComplexity, spaceComplexity, recurrence, correctnessProof, loopInvariants,
 * dpFormulation, greedyProof, graphContext, dataStructure, amortizedAnalysis,
 * comparison, pseudocode, executionTrace and keyInsight. The Zod schema of the
 * tool declared none of them, so Zod stripped each one before the handler ran,
 * and it rejected the spelling of `designPattern` that the handler expects.
 *
 * Every assertion here goes through the real server over an in-memory
 * transport and reads the answer or the stored thought that a client reads. A
 * handler-level test cannot see a field that Zod strips before the handler.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { server } from "../../src/index.js";
import { omittedPaths } from "../unit/tools/schemas/advertised-omissions.js";

let client: Client;

beforeAll(async () => {
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  client = new Client(
    { name: "algorithmic-contract", version: "1.0.0" },
    { capabilities: {} },
  );
  await Promise.all([
    client.connect(clientTransport),
    server.connect(serverTransport),
  ]);
});

afterAll(async () => {
  await client.close();
});

interface Issue {
  severity: string;
  description: string;
  category: string;
}

/** Call deepthinking_engineering in a given mode and return the parsed answer, failing on a tool error. */
async function addIn(
  mode: string,
  args: Record<string, unknown>,
): Promise<any> {
  const result: any = await client.callTool({
    name: "deepthinking_engineering",
    arguments: {
      mode,
      thought: "analyse merge sort",
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      ...args,
    },
  });
  expect(
    result.isError,
    `tool call errored: ${result.content?.[0]?.text}`,
  ).toBeFalsy();
  return JSON.parse(result.content[0].text);
}

const add = (args: Record<string, unknown>) => addIn("algorithmic", args);

const issuesOf = (answer: any): Issue[] => answer.validation.issues;
const textsOf = (answer: any): string[] =>
  issuesOf(answer).map((i) => i.description);

/** Export a session in one format through the session tool and return the text. */
async function exportAs(sessionId: string, format: string): Promise<string> {
  const result: any = await client.callTool({
    name: "deepthinking_session",
    arguments: { action: "export", sessionId, exportFormat: format },
  });
  expect(
    result.isError,
    `export ${format} errored: ${result.content?.[0]?.text}`,
  ).toBeFalsy();
  return result.content[0].text;
}

/** The thought as the session stored it. */
async function stored(answer: any): Promise<any> {
  const exported: any = JSON.parse(await exportAs(answer.sessionId, "json"));
  return exported.thoughts[0];
}

const LOOP_INVARIANT = {
  id: "li-1",
  description: "A[1..j-1] is sorted",
  initialization: { statement: "j = 2", proof: "one element is sorted" },
  maintenance: {
    statement: "insert A[j] into A[1..j-1]",
    proof: "shift the larger elements right",
  },
  termination: {
    statement: "j = n + 1",
    proof: "the loop exits",
    conclusionFollows: "A[1..n] is sorted",
  },
  loopVariable: "j",
  loopBounds: "2..n",
};

const GROUPS: Record<string, Record<string, unknown>> = {
  "identity: designPattern, algorithm, clrs, pseudocode, keyInsight": {
    designPattern: "divide_and_conquer",
    algorithm: {
      name: "Merge sort",
      description: "Sorts by merging two sorted halves",
      category: "Sorting",
    },
    clrsCategory: "sorting_comparison",
    clrsAlgorithm: "merge_sort",
    pseudocode: "MERGE-SORT(A, p, r)",
    keyInsight: "Merging two sorted runs takes linear time",
  },
  "complexity: timeComplexity, spaceComplexity": {
    thoughtType: "complexity_analysis",
    timeComplexity: {
      bestCase: "Ω(n log n)",
      averageCase: "Θ(n log n)",
      worstCase: "O(n log n)",
      amortized: "O(n log n)",
      recurrence: "T(n) = 2T(n/2) + O(n)",
      closedForm: "Θ(n log n)",
      masterTheorem: { a: 2, b: 2, f: "n", case: 2 },
      inputSensitive: { parameter: "number of runs", complexity: "O(n log k)" },
    },
    spaceComplexity: {
      auxiliary: "O(n)",
      total: "O(n)",
      inPlace: false,
      stackDepth: "O(log n)",
      cacheEfficiency: {
        cacheOblivious: true,
        cacheComplexity: "O((n/B) log n)",
      },
    },
  },
  "recurrence: the algorithmic members": {
    thoughtType: "recurrence_solving",
    recurrence: {
      id: "rec-1",
      formula: "T(n) = 2T(n/2) + n",
      baseCase: "T(1) = 1",
      solutionMethod: "master_theorem",
      solution: "Θ(n log n)",
      solutionProof: "Case 2 of the master theorem",
      recursionTree: { levelWork: "n", levels: "log n", totalWork: "n log n" },
    },
  },
  "correctness: correctnessProof and loopInvariants": {
    thoughtType: "correctness_proof",
    correctnessProof: {
      id: "cp-1",
      algorithm: "Insertion sort",
      method: "loop_invariant",
      preconditions: ["A is an array of numbers"],
      postconditions: ["A is sorted"],
      invariants: [LOOP_INVARIANT],
      inductionBase: "n = 1",
      inductionStep: "n to n + 1",
      terminationArgument: {
        decreasingQuantity: "n - j",
        lowerBound: "0",
        proof: "j grows on every pass",
      },
      proofSteps: ["initialise", "maintain", "terminate"],
      keyInsights: ["the prefix stays sorted"],
    },
    loopInvariants: [LOOP_INVARIANT],
  },
  "dynamic programming: dpFormulation": {
    thoughtType: "dynamic_programming",
    dpFormulation: {
      id: "dp-1",
      problem: "Longest common subsequence",
      characterization: {
        optimalSubstructure: "an LCS contains an LCS of the prefixes",
        subproblemDefinition: "L[i][j] for the prefixes x[1..i], y[1..j]",
      },
      recursiveDefinition: {
        stateSpace: "L[i][j] is the LCS length of two prefixes",
        recurrence: "L[i][j] = L[i-1][j-1] + 1 if x[i] = y[j]",
        baseCases: ["L[0][j] = 0", "L[i][0] = 0"],
      },
      computationOrder: { direction: "bottom_up", fillOrder: "row by row" },
      reconstruction: { method: "traceback", traceback: "follow the arrows" },
      complexity: { states: "O(mn)", transitionCost: "O(1)", total: "O(mn)" },
      optimizations: {
        spaceOptimization: "keep two rows",
        memoization: false,
        monotonicity: "none",
      },
    },
  },
  "greedy: greedyProof": {
    thoughtType: "greedy_choice",
    greedyProof: {
      id: "gp-1",
      problem: "Activity selection",
      greedyChoice: {
        description: "pick the activity that finishes first",
        localOptimum: "a1",
        globalOptimumProof: "exchange argument",
      },
      optimalSubstructure: {
        description: "the remaining activities form a subproblem",
        proof: "cut and paste",
      },
      exchangeArgument: {
        assumption: "an optimum omits a1",
        modification: "swap its first activity for a1",
        noWorse: "a1 finishes no later",
        conclusion: "some optimum contains a1",
      },
      matroid: {
        groundSet: "activities",
        independentSets: "compatible subsets",
        proof: "hereditary and exchange properties",
      },
    },
  },
  "secondary: graphContext, dataStructure, amortizedAnalysis, comparison, executionTrace":
    {
      thoughtType: "shortest_path",
      graphContext: {
        graphType: "directed",
        weighted: true,
        properties: {
          connected: true,
          acyclic: false,
          bipartite: false,
          planar: false,
          sparse: true,
          dense: false,
        },
        representation: "adjacency_list",
        source: "s",
        sink: "t",
        weightProperty: "non_negative",
      },
      dataStructure: {
        id: "ds-1",
        name: "Binary heap",
        description: "An array that keeps heap order",
        operations: [
          {
            name: "insert",
            description: "add a key",
            worstCase: "O(log n)",
            amortized: "O(1)",
            averageCase: "O(1)",
          },
        ],
        spaceUsage: "O(n)",
        representation: "array",
        invariants: ["parent <= child"],
        augmentation: {
          additionalData: "subtree size",
          purpose: "order statistics",
          maintenanceCost: "O(1)",
        },
        tradeoffs: [
          {
            versus: "binary search tree",
            advantages: ["cache friendly"],
            disadvantages: ["no ordered search"],
          },
        ],
      },
      amortizedAnalysis: {
        id: "am-1",
        dataStructure: "dynamic array",
        operation: "append",
        method: "potential",
        aggregate: { totalCost: "O(n)", perOperation: "O(1)" },
        accounting: {
          actualCost: "1",
          amortizedCost: "3",
          credit: "stored on the element",
          creditInvariant: "credit >= 0",
        },
        potential: {
          potentialFunction: "2 * num - size",
          initialPotential: "0",
          amortizedCost: "3",
          proof: "the potential never drops below 0",
        },
        result: "O(1) amortized",
      },
      comparison: {
        algorithms: ["merge sort", "quicksort"],
        criteria: [
          {
            criterion: "worst case",
            values: { "merge sort": "O(n log n)", quicksort: "O(n^2)" },
            winner: "merge sort",
          },
        ],
        recommendation: [
          {
            useCase: "stable sort",
            bestAlgorithm: "merge sort",
            reasoning: "it is stable",
          },
        ],
      },
      executionTrace: {
        input: "[3, 1, 2]",
        steps: [{ step: 1, state: "[3, 1, 2]", action: "split" }],
        output: "[1, 2, 3]",
      },
    },
};

describe("fields the handler reads now reach the stored thought", () => {
  it.each(Object.entries(GROUPS))("%s", async (_label, fields) => {
    const answer = await add(fields);
    expect(await stored(answer)).toMatchObject(fields);
  });

  it("the thought without these fields stores none of them (control)", async () => {
    const thought = await stored(await add({}));
    for (const group of Object.values(GROUPS)) {
      for (const field of Object.keys(group)) {
        if (field === "thoughtType") continue;
        expect(thought).not.toHaveProperty(field);
      }
    }
  });
});

describe("recurrence is one shape for algorithmic and recursive", () => {
  const RECURSIVE_SHAPE = {
    formula: "T(n) = T(n/2) + 1",
    baseCase: "T(1) = 1",
    closedForm: "log n",
    complexity: "O(log n)",
  };

  it("an existing recursive input is stored unchanged", async () => {
    const thought = await stored(
      await addIn("recursive", { recurrence: RECURSIVE_SHAPE }),
    );
    expect(thought.recurrence).toEqual(RECURSIVE_SHAPE);
  });

  it("an algorithmic input with solution, solutionMethod, solutionProof and recursionTree is accepted", async () => {
    const recurrence = GROUPS["recurrence: the algorithmic members"]
      .recurrence as Record<string, unknown>;
    const thought = await stored(await add({ recurrence }));
    expect(thought.recurrence).toMatchObject(recurrence);
  });

  it("the recursive shape in algorithmic mode keeps closedForm and complexity", async () => {
    const thought = await stored(await add({ recurrence: RECURSIVE_SHAPE }));
    expect(thought.recurrence).toMatchObject(RECURSIVE_SHAPE);
  });
});

describe("designPattern: underscore is the spelling that is stored", () => {
  const HYPHEN_WARNING =
    'designPattern "divide-and-conquer" uses hyphens; it is read as "divide_and_conquer", the spelling that is stored.';
  const patternIssues = (answer: any) =>
    textsOf(answer).filter((t) => /designPattern|design pattern/i.test(t));

  it("the underscore spelling is stored and gives no warning", async () => {
    const answer = await add({ designPattern: "divide_and_conquer" });
    expect((await stored(answer)).designPattern).toBe("divide_and_conquer");
    expect(patternIssues(answer)).toEqual([]);
  });

  it("the hyphen spelling is read as the underscore one, stored so, and warned once with both spellings", async () => {
    const answer = await add({ designPattern: "divide-and-conquer" });
    expect((await stored(answer)).designPattern).toBe("divide_and_conquer");
    expect(patternIssues(answer)).toEqual([HYPHEN_WARNING]);
  });

  it("every value the old enum advertised is read and stored in the underscore form", async () => {
    for (const hyphen of [
      "divide-and-conquer",
      "dynamic-programming",
      "greedy",
      "backtracking",
      "branch-and-bound",
      "randomized",
      "approximation",
    ]) {
      const answer = await add({ designPattern: hyphen });
      expect((await stored(answer)).designPattern).toBe(
        hyphen.replace(/-/g, "_"),
      );
    }
  });

  it("an unknown value is not stored, and one sentence lists the twelve values", async () => {
    const answer = await add({ designPattern: "bogus" });
    expect(await stored(answer)).not.toHaveProperty("designPattern");
    expect(patternIssues(answer)).toEqual([
      'Unknown designPattern "bogus"; it is not stored. Recognised values: brute_force, divide_and_conquer, dynamic_programming, greedy, backtracking, branch_and_bound, randomized, approximation, online, parallel, incremental, prune_and_search.',
    ]);
  });

  it("an absent value gives no warning and stores none", async () => {
    const answer = await add({});
    expect(await stored(answer)).not.toHaveProperty("designPattern");
    expect(patternIssues(answer)).toEqual([]);
  });
});

describe("thoughtType: an unknown value keeps the default and is reported", () => {
  const WARNING =
    /^Unknown thoughtType "bogus"; using the default "algorithm_definition"\. Recognised values: algorithm_definition, complexity_analysis, /;

  it("warns, and the thought is stored as algorithm_definition", async () => {
    const answer = await add({ thoughtType: "bogus" });
    expect(textsOf(answer).filter((t) => WARNING.test(t))).toHaveLength(1);
    expect((await stored(answer)).thoughtType).toBe("algorithm_definition");
  });

  it("a recognised value gives no such warning", async () => {
    const answer = await add({ thoughtType: "shortest_path" });
    expect(textsOf(answer).join("\n")).not.toMatch(/Unknown thoughtType/);
    expect((await stored(answer)).thoughtType).toBe("shortest_path");
  });
});

describe("a vocabulary member the handler cannot place is kept and reported", () => {
  const CASES: [string, Record<string, unknown>, string, string][] = [
    [
      "correctnessProof.method",
      { correctnessProof: { method: "bogus" } },
      "correctnessProof.method",
      "loop_invariant, induction, contradiction, direct, structural",
    ],
    [
      "amortizedAnalysis.method",
      { amortizedAnalysis: { method: "bogus" } },
      "amortizedAnalysis.method",
      "aggregate, accounting, potential",
    ],
    [
      "graphContext.graphType",
      { graphContext: { graphType: "bogus" } },
      "graphContext.graphType",
      "directed, undirected, mixed",
    ],
    [
      "graphContext.representation",
      { graphContext: { representation: "bogus" } },
      "graphContext.representation",
      "adjacency_list, adjacency_matrix, edge_list, implicit",
    ],
    [
      "graphContext.weightProperty",
      { graphContext: { weightProperty: "bogus" } },
      "graphContext.weightProperty",
      "non_negative, positive, arbitrary, unit",
    ],
    [
      "recurrence.solutionMethod",
      { recurrence: { solutionMethod: "bogus" } },
      "recurrence.solutionMethod",
      "master_theorem, substitution, recursion_tree, generating_function",
    ],
    [
      "dpFormulation.computationOrder.direction",
      { dpFormulation: { computationOrder: { direction: "bogus" } } },
      "dpFormulation.computationOrder.direction",
      "bottom_up, top_down, bidirectional",
    ],
  ];

  it.each(CASES)("%s", async (_label, fields, field, recognised) => {
    const answer = await add(fields);
    expect(
      textsOf(answer).filter((t) => t.startsWith(`Unknown ${field} "bogus"`)),
    ).toEqual([
      `Unknown ${field} "bogus"; it is kept as sent. Recognised values: ${recognised}.`,
    ]);
  });

  it("a recognised value gives no such warning", async () => {
    const answer = await add({
      correctnessProof: { method: "induction" },
      graphContext: { graphType: "undirected" },
    });
    expect(textsOf(answer).join("\n")).not.toMatch(/^Unknown /m);
  });
});

describe("a member that is a choice from a list is stored only when the client sent it", () => {
  // A sparse block must not claim a choice the client did not make. These four
  // members have a list of values and no default; `correctnessProof.method` and
  // `dpFormulation.computationOrder.direction` keep the first value of their
  // list because master already stored it.
  it("graphContext without graphType or representation stores neither", async () => {
    const thought = await stored(
      await add({ thoughtType: "graph_traversal", graphContext: { weighted: true } }),
    );
    expect(thought.graphContext).not.toHaveProperty("graphType");
    expect(thought.graphContext).not.toHaveProperty("representation");
    expect(thought.graphContext.weighted).toBe(true);
  });

  it("amortizedAnalysis without method stores none", async () => {
    const thought = await stored(
      await add({
        thoughtType: "amortized_analysis",
        amortizedAnalysis: { operation: "push" },
      }),
    );
    expect(thought.amortizedAnalysis).not.toHaveProperty("method");
    expect(thought.amortizedAnalysis.operation).toBe("push");
  });

  it("recurrence without solutionMethod stores none", async () => {
    const thought = await stored(
      await add({
        thoughtType: "recurrence_solving",
        recurrence: { formula: "T(n) = T(n/2) + 1" },
      }),
    );
    expect(thought.recurrence).not.toHaveProperty("solutionMethod");
    expect(thought.recurrence.formula).toBe("T(n) = T(n/2) + 1");
  });

  it("a value that the client sent is stored as sent and gives no sentence", async () => {
    const answer = await add({
      graphContext: { graphType: "mixed", representation: "implicit" },
      amortizedAnalysis: { method: "accounting" },
      recurrence: { solutionMethod: "recursion_tree" },
    });
    const thought = await stored(answer);
    expect(thought.graphContext).toMatchObject({
      graphType: "mixed",
      representation: "implicit",
    });
    expect(thought.amortizedAnalysis.method).toBe("accounting");
    expect(thought.recurrence.solutionMethod).toBe("recursion_tree");
    expect(textsOf(answer).join("\n")).not.toMatch(/^Unknown /m);
  });
});

describe("fields that nothing read are no longer advertised and are still accepted", () => {
  const REMOVED_TOP = ["algorithmName", "complexityAnalysis"];
  const REMOVED_PROOF = ["invariant", "termination", "correctness"];

  it("tools/list no longer lists them", async () => {
    const { tools } = await client.listTools();
    const tool: any = tools.find((t) => t.name === "deepthinking_engineering");
    for (const name of REMOVED_TOP) {
      expect(tool.inputSchema.properties).not.toHaveProperty(name);
    }
    for (const name of REMOVED_PROOF) {
      expect(
        tool.inputSchema.properties.correctnessProof.properties,
      ).not.toHaveProperty(name);
    }
  });

  it("a call that still sends them succeeds, and the fields change nothing", async () => {
    const without = await add({ thought: "removed fields" });
    const withRemoved = await add({
      thought: "removed fields",
      algorithmName: "Merge sort",
      complexityAnalysis: { timeComplexity: "O(n log n)", worstCase: "O(n)" },
    });
    expect(issuesOf(withRemoved)).toEqual(issuesOf(without));
    const thought = await stored(withRemoved);
    expect(thought).not.toHaveProperty("algorithmName");
    expect(thought).not.toHaveProperty("complexityAnalysis");
  });

  it("the three dead members of correctnessProof change nothing", async () => {
    const proof = { method: "induction", preconditions: ["x"] };
    const without = await stored(await add({ correctnessProof: proof }));
    const withDead = await stored(
      await add({
        correctnessProof: {
          ...proof,
          invariant: "i",
          termination: "t",
          correctness: "c",
        },
      }),
    );
    const bare = (t: any) => ({ ...t.correctnessProof, id: undefined });
    expect(bare(withDead)).toEqual(bare(without));
  });
});

describe("fields that the advertisement leaves out are still accepted", () => {
  it("tools/list does not list them, and the description names them", async () => {
    const { tools } = await client.listTools();
    const tool: any = tools.find((t) => t.name === "deepthinking_engineering");
    for (const path of omittedPaths("deepthinking_engineering")) {
      let node: any = tool.inputSchema;
      const parts = path.split(".");
      for (const part of parts.slice(0, -1)) node = node?.properties?.[part];
      expect(node?.properties ?? {}, path).not.toHaveProperty(
        parts[parts.length - 1],
      );
    }
    expect(tool.description).toMatch(
      / See https:\/\/github\.com\/danielsimonjr\/deepthinking-mcp\/blob\/master\/docs\/modes\/ALGORITHMIC\.md$/,
    );
  });

  it("each omitted top-level field reaches the stored thought", async () => {
    for (const [label, fields] of Object.entries(GROUPS)) {
      const omitted = Object.keys(fields).filter((f) =>
        omittedPaths("deepthinking_engineering").includes(f),
      );
      if (omitted.length === 0) continue;
      const thought = await stored(await add(fields));
      for (const field of omitted) {
        expect(thought, `${label}: ${field}`).toHaveProperty(field);
      }
    }
  });
});

describe("a complexity block stores only what the client sent", () => {
  it("a time complexity with one case keeps the other cases empty", async () => {
    const answer = await add({ timeComplexity: { bestCase: "Ω(n log n)" } });
    expect((await stored(answer)).timeComplexity).toMatchObject({
      bestCase: "Ω(n log n)",
      averageCase: "",
      worstCase: "",
    });
  });

  it("the validator still says that a time complexity has no worst case", async () => {
    const answer = await add({ timeComplexity: { averageCase: "O(n log n)" } });
    expect(textsOf(answer)).toContain(
      "Complexity analysis should include worst-case analysis",
    );
  });

  it("a space complexity with a total keeps the auxiliary space empty", async () => {
    const answer = await add({ spaceComplexity: { total: "O(n^2)" } });
    expect((await stored(answer)).spaceComplexity).toMatchObject({
      auxiliary: "",
      total: "O(n^2)",
      inPlace: false,
    });
  });

  it("a time complexity with a worst case keeps the best and the average case empty", async () => {
    const answer = await add({ timeComplexity: { worstCase: "O(n^2)" } });
    expect((await stored(answer)).timeComplexity).toMatchObject({
      bestCase: "",
      averageCase: "",
      worstCase: "O(n^2)",
    });
  });

  it("a flag block that the handler keeps as sent holds only the members the client sent", async () => {
    const thought = await stored(
      await add({
        timeComplexity: {
          masterTheorem: { a: 2 },
          inputSensitive: { parameter: "runs" },
        },
        spaceComplexity: { cacheEfficiency: { cacheComplexity: "O(n/B)" } },
        algorithm: { practical: { stable: true }, clrsReference: { chapter: 2 } },
      }),
    );
    expect(thought.timeComplexity.masterTheorem).toEqual({ a: 2 });
    expect(thought.timeComplexity.inputSensitive).toEqual({ parameter: "runs" });
    expect(thought.spaceComplexity.cacheEfficiency).toEqual({
      cacheComplexity: "O(n/B)",
    });
    expect(thought.algorithm.practical).toEqual({ stable: true });
    expect(thought.algorithm.clrsReference).toEqual({ chapter: 2 });
  });

  it("a space complexity with an auxiliary space keeps the total empty", async () => {
    const answer = await add({ spaceComplexity: { auxiliary: "O(1)" } });
    expect((await stored(answer)).spaceComplexity).toMatchObject({
      auxiliary: "O(1)",
      total: "",
      inPlace: false,
    });
  });
});

describe("masterTheorem.case is one of 1, 2 and 3", () => {
  const withCase = (value: number) =>
    client.callTool({
      name: "deepthinking_engineering",
      arguments: {
        mode: "algorithmic",
        thought: "master theorem",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        timeComplexity: { masterTheorem: { a: 2, b: 2, f: "n", case: value } },
      },
    }) as Promise<any>;

  it("accepts each of the three cases", async () => {
    for (const value of [1, 2, 3]) {
      expect((await withCase(value)).isError, `case ${value}`).toBeFalsy();
    }
  });

  it("refuses a case outside 1 to 3", async () => {
    for (const value of [0, 4]) {
      expect((await withCase(value)).isError, `case ${value}`).toBe(true);
    }
  });
});

describe("what the contract accepts also exports", () => {
  // Every declared field is optional, so a client can send a sparse block. The
  // handler fills what the thought type requires; an exporter or a suggestion
  // that reads a missing member would turn an accepted call into an error, or
  // print the word "undefined".
  const FORMATS = [
    "markdown",
    "latex",
    "json",
    "html",
    "jupyter",
    "mermaid",
    "dot",
    "ascii",
  ];

  const SPARSE: Record<string, Record<string, unknown>> = {
    "empty algorithm": { algorithm: {} },
    "empty complexity blocks": {
      thoughtType: "complexity_analysis",
      timeComplexity: {},
      spaceComplexity: {},
    },
    "recurrence with a formula only": {
      thoughtType: "recurrence_solving",
      recurrence: { formula: "T(n) = T(n/2) + 1" },
    },
    "correctness proof with an empty invariant": {
      thoughtType: "correctness_proof",
      correctnessProof: { invariants: [{}] },
      loopInvariants: [{}],
    },
    "empty dpFormulation and greedyProof": {
      thoughtType: "dynamic_programming",
      dpFormulation: {},
      greedyProof: {},
    },
    "empty graphContext": { thoughtType: "graph_traversal", graphContext: {} },
    "empty dataStructure": { dataStructure: { operations: [{}] } },
    "empty amortizedAnalysis": {
      thoughtType: "amortized_analysis",
      amortizedAnalysis: {},
    },
    "empty comparison": { comparison: {} },
    "empty executionTrace": { executionTrace: { steps: [{}] } },
  };

  for (const [label, fields] of Object.entries(SPARSE)) {
    it(`${label}: every format exports and prints no 'undefined'`, async () => {
      const answer = await add({ thought: label, ...fields });
      for (const format of FORMATS) {
        const text = await exportAs(answer.sessionId, format);
        if (format !== "json" && format !== "jupyter") {
          expect(text, `${label} as ${format}`).not.toMatch(/undefined|NaN/);
        }
      }
    });
  }
});
