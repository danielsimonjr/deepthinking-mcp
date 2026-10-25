/**
 * Recursive mode: the contract the handler reads
 *
 * RecursiveHandler reads thoughtType, strategy, subproblems, baseCases,
 * baseCaseReached, currentDepth, maxDepth, recurrence and divisionFactor. Every
 * one of them is declared in the Zod schema of deepthinking_engineering and
 * advertised by the tool. The handler stores a value that it recognises as
 * sent. It replaces, keeps or ignores any other value, and the answer says so
 * in one sentence. It stores a depth limit only when the client sent one.
 *
 * Every assertion here goes through the real server over an in-memory
 * transport and reads the answer or the stored thought that a client reads.
 */

import { readFileSync } from "node:fs";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { server } from "../../src/index.js";

let client: Client;

beforeAll(async () => {
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  client = new Client(
    { name: "recursive-contract", version: "1.0.0" },
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

/** Call deepthinking_engineering in recursive mode and return the parsed answer, failing on a tool error. */
async function add(args: Record<string, unknown>): Promise<any> {
  const result: any = await client.callTool({
    name: "deepthinking_engineering",
    arguments: {
      mode: "recursive",
      thought: "decompose merge sort",
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

const THOUGHT_TYPES = [
  "problem_decomposition",
  "base_case_identification",
  "recursive_case_definition",
  "recurrence_formulation",
  "recursive_step",
  "subproblem_solution",
  "solution_combination",
  "termination_analysis",
];

const STRATEGIES = [
  "divide_and_conquer",
  "decrease_and_conquer",
  "transform_and_conquer",
  "dynamic_programming",
];

const GROUPS: Record<string, Record<string, unknown>> = {
  "vocabulary: thoughtType and strategy": {
    thoughtType: "recurrence_formulation",
    strategy: "transform_and_conquer",
  },
  "subproblems: every member": {
    subproblems: [
      {
        id: "sp-1",
        name: "left half",
        description: "A[1..n/2]",
        size: 8,
        depth: 1,
        parentId: "sp-0",
        status: "solved",
        result: "sorted",
      },
    ],
  },
  "baseCases: every member": {
    baseCases: [
      { id: "bc-1", condition: "n = 1", result: "return A", verified: true },
    ],
  },
  "depth: baseCaseReached, currentDepth and maxDepth": {
    baseCaseReached: true,
    currentDepth: 3,
    maxDepth: 12,
  },
  "recurrence: the four members that recursive mode reads": {
    recurrence: {
      formula: "T(n) = 2T(n/2) + n",
      baseCase: "T(1) = 1",
      closedForm: "n log n",
      complexity: "O(n log n)",
    },
  },
  "divisionFactor: the number of parts": { divisionFactor: 2 },
};

describe("fields the handler reads reach the stored thought", () => {
  it.each(Object.entries(GROUPS))("%s", async (_label, fields) => {
    const answer = await add(fields);
    expect(await stored(answer)).toMatchObject(fields);
  });

  it("the thought without these fields stores none of the optional ones (control)", async () => {
    const thought = await stored(await add({}));
    for (const field of [
      "subproblems",
      "baseCases",
      "recurrence",
      "divisionFactor",
      "maxDepth",
    ]) {
      expect(thought).not.toHaveProperty(field);
    }
  });

  it("a bare thought still gets the inferred values: depth 0, no base case reached, the default type and strategy", async () => {
    const thought = await stored(await add({}));
    expect(thought).toMatchObject({
      thoughtType: "problem_decomposition",
      strategy: "divide_and_conquer",
      currentDepth: 0,
      baseCaseReached: false,
    });
  });

  it("the depth is inferred from the subproblems when the client sends none", async () => {
    const thought = await stored(
      await add({ subproblems: [{ depth: 2 }, { depth: 3 }, { depth: 1 }] }),
    );
    expect(thought.currentDepth).toBe(4);
  });

  it("a verified base case sets baseCaseReached when the client sends none", async () => {
    const thought = await stored(
      await add({ baseCases: [{ condition: "n = 1", verified: true }] }),
    );
    expect(thought.baseCaseReached).toBe(true);
  });

  it("a base case that is not verified leaves baseCaseReached false", async () => {
    const thought = await stored(
      await add({
        baseCases: [
          { condition: "n = 1" },
          { condition: "n = 0", verified: false },
        ],
      }),
    );
    expect(thought.baseCaseReached).toBe(false);
  });

  it("an empty subproblem, base case and recurrence are completed, not left to print 'undefined'", async () => {
    const thought = await stored(
      await add({ subproblems: [{}], baseCases: [{}], recurrence: {} }),
    );
    expect(thought.subproblems).toEqual([
      {
        id: expect.any(String),
        name: "",
        description: "",
        size: "unknown",
        depth: 0,
        status: "pending",
      },
    ]);
    expect(thought.baseCases).toEqual([
      { id: expect.any(String), condition: "", result: "", verified: false },
    ]);
    expect(thought.recurrence).toEqual({ formula: "", baseCase: "" });
    expect(thought.currentDepth).toBe(1);
  });
});

describe("thoughtType: the eight recognised values are stored as sent", () => {
  it.each(THOUGHT_TYPES)(
    "%s is stored as sent and gives no sentence",
    async (thoughtType) => {
      const answer = await add({ thoughtType });
      expect(textsOf(answer).join("\n")).not.toMatch(/Unknown thoughtType/);
      expect((await stored(answer)).thoughtType).toBe(thoughtType);
    },
  );

  it("an unknown value becomes problem_decomposition, and one sentence lists the eight values in order", async () => {
    const answer = await add({ thoughtType: "bogus" });
    const sentences = textsOf(answer).filter((t) =>
      t.startsWith("Unknown thoughtType"),
    );
    expect(sentences).toEqual([
      'Unknown thoughtType "bogus"; using the default "problem_decomposition". Recognised values: ' +
        THOUGHT_TYPES.join(", ") +
        ".",
    ]);
    expect((await stored(answer)).thoughtType).toBe("problem_decomposition");
  });
});

describe("strategy: an unknown value keeps the default and is reported", () => {
  it.each(STRATEGIES)(
    "%s is stored as sent and gives no sentence",
    async (strategy) => {
      const answer = await add({ strategy });
      expect(textsOf(answer).join("\n")).not.toMatch(/Unknown strategy/);
      expect((await stored(answer)).strategy).toBe(strategy);
    },
  );

  it.each(["memoization", "backtracking"])(
    "%s is not a strategy: the default is stored and one sentence lists the four",
    async (strategy) => {
      const answer = await add({ strategy });
      const sentences = textsOf(answer).filter((t) =>
        t.startsWith("Unknown strategy"),
      );
      expect(sentences).toEqual([
        `Unknown strategy "${strategy}"; using the default "divide_and_conquer". Recognised values: ` +
          STRATEGIES.join(", ") +
          ".",
      ]);
      expect((await stored(answer)).strategy).toBe("divide_and_conquer");
    },
  );
});

describe("subproblems[].status: an unknown value is kept as sent and reported once", () => {
  const WARNING =
    /^Unknown subproblems\[\]\.status "stuck"; it is kept as sent\. Recognised values: pending, in_progress, solving, solved\.$/;

  it("keeps the value and says so", async () => {
    const answer = await add({ subproblems: [{ id: "a", status: "stuck" }] });
    expect(textsOf(answer).filter((t) => WARNING.test(t))).toHaveLength(1);
    expect((await stored(answer)).subproblems[0].status).toBe("stuck");
  });

  it("says it once when two subproblems carry the same unknown value", async () => {
    const answer = await add({
      subproblems: [{ status: "stuck" }, { status: "stuck" }],
    });
    expect(textsOf(answer).filter((t) => WARNING.test(t))).toHaveLength(1);
  });

  it("an absent status is pending and gives no sentence", async () => {
    const answer = await add({ subproblems: [{ id: "a" }] });
    expect(textsOf(answer).join("\n")).not.toMatch(/subproblems\[\]\.status/);
    expect((await stored(answer)).subproblems[0].status).toBe("pending");
  });

  it.each(["pending", "in_progress", "solving", "solved"])(
    "%s is a recognised status and gives no sentence",
    async (status) => {
      const answer = await add({ subproblems: [{ status }] });
      expect(textsOf(answer).join("\n")).not.toMatch(/subproblems\[\]\.status/);
      expect((await stored(answer)).subproblems[0].status).toBe(status);
    },
  );
});

describe("maxDepth: a limit that the client did not send is not stored", () => {
  it("stores no maxDepth for a deep thought without a limit", async () => {
    const thought = await stored(await add({ currentDepth: 25 }));
    expect(thought).not.toHaveProperty("maxDepth");
    expect(thought.currentDepth).toBe(25);
  });

  it("stores no maxDepth when the depth comes from the subproblems", async () => {
    const thought = await stored(
      await add({ subproblems: [{ name: "deep", depth: 30 }] }),
    );
    expect(thought).not.toHaveProperty("maxDepth");
    expect(thought.currentDepth).toBe(31);
  });

  it("stores a limit that the client sent as sent, zero included", async () => {
    expect((await stored(await add({ maxDepth: 12 }))).maxDepth).toBe(12);
    expect((await stored(await add({ maxDepth: 0 }))).maxDepth).toBe(0);
  });

  it("stores a current depth beyond a limit that the client sent, as sent", async () => {
    const thought = await stored(await add({ currentDepth: 15, maxDepth: 10 }));
    expect(thought).toMatchObject({ currentDepth: 15, maxDepth: 10 });
  });
});

describe("recurrence: recursive mode reads four members and says so about the others", () => {
  const READ = {
    formula: "T(n) = 2T(n/2) + n",
    baseCase: "T(1) = 1",
    closedForm: "n log n",
    complexity: "O(n log n)",
  };
  const IGNORED = {
    id: "rec-1",
    solutionMethod: "master_theorem",
    solution: "Θ(n log n)",
    solutionProof: "Case 2 of the master theorem",
    recursionTree: { levelWork: "n", levels: "log n", totalWork: "n log n" },
  };

  it("stores the four members that it reads, and no sentence", async () => {
    const answer = await add({ recurrence: READ });
    expect((await stored(answer)).recurrence).toEqual(READ);
    expect(textsOf(answer).join("\n")).not.toMatch(/Recursive mode ignores/);
  });

  it("does not store the five members of the algorithmic shape, and one sentence names them", async () => {
    const answer = await add({ recurrence: { ...READ, ...IGNORED } });
    expect((await stored(answer)).recurrence).toEqual(READ);
    expect(
      textsOf(answer).filter((t) => t.startsWith("Recursive mode ignores")),
    ).toEqual([
      "Recursive mode ignores recurrence.id, recurrence.solutionMethod, recurrence.solution, recurrence.solutionProof and recurrence.recursionTree; they are not stored (algorithmic mode reads them).",
    ]);
  });

  it("names only the members that the client sent", async () => {
    const answer = await add({
      recurrence: { ...READ, solution: "n log n" },
    });
    expect(
      textsOf(answer).filter((t) => t.startsWith("Recursive mode ignores")),
    ).toEqual([
      "Recursive mode ignores recurrence.solution; it is not stored (algorithmic mode reads it).",
    ]);
  });
});

describe("divisionFactor: stored as sent", () => {
  it.each([1, 2, 3])("stores %d as sent", async (divisionFactor) => {
    const thought = await stored(await add({ divisionFactor }));
    expect(thought.divisionFactor).toBe(divisionFactor);
  });
});

describe("the advertisement names every field the handler reads", () => {
  async function engineeringTool(): Promise<any> {
    const { tools } = await client.listTools();
    return tools.find((t: any) => t.name === "deepthinking_engineering");
  }

  it("lists the nine fields, and the recurrence members that recursive mode ignores", async () => {
    const tool = await engineeringTool();
    const properties = tool.inputSchema.properties;
    for (const field of [
      "thoughtType",
      "strategy",
      "subproblems",
      "baseCases",
      "baseCaseReached",
      "currentDepth",
      "maxDepth",
      "recurrence",
      "divisionFactor",
    ]) {
      expect(properties, field).toHaveProperty(field);
    }
    expect(Object.keys(properties.recurrence.properties).sort()).toEqual(
      [
        "id",
        "formula",
        "baseCase",
        "closedForm",
        "complexity",
        "solutionMethod",
        "solution",
        "solutionProof",
        "recursionTree",
      ].sort(),
    );
  });

  it("the thoughtType description names the eight recursive values and the recursive default", async () => {
    const description = (await engineeringTool()).inputSchema.properties
      .thoughtType.description as string;
    for (const value of THOUGHT_TYPES) {
      expect(description, value).toContain(`'${value}'`);
    }
    expect(description).toContain(
      "recursive mode uses 'problem_decomposition'",
    );
  });

  it("the strategy description names the four strategies and no other", async () => {
    const description = (await engineeringTool()).inputSchema.properties
      .strategy.description as string;
    const named = [...description.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
    expect(named).toEqual(STRATEGIES);
  });

  it("the recurrence description says which members recursive mode reads", async () => {
    const description = (await engineeringTool()).inputSchema.properties
      .recurrence.description as string;
    expect(description).toContain(
      "Recursive mode reads formula, baseCase, closedForm and complexity",
    );
    expect(description).toContain("algorithmic mode reads every member");
  });

  it("the maxDepth description says that an omitted limit means no limit", async () => {
    const description = (await engineeringTool()).inputSchema.properties
      .maxDepth.description as string;
    expect(description).toMatch(/omitted means no limit/);
  });
});

describe("what the contract accepts also exports", () => {
  // Every declared field is optional, so a client can send a sparse block. A
  // visual or text exporter that reads a missing member would turn an accepted
  // call into an error, or print the word "undefined".
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

  const EVERYTHING = Object.assign({}, ...Object.values(GROUPS));

  const SPARSE: Record<string, Record<string, unknown>> = {
    "empty subproblem": { subproblems: [{}] },
    "empty base case": { baseCases: [{}] },
    "empty recurrence": { recurrence: {} },
    "recurrence with a formula only": {
      recurrence: { formula: "T(n) = T(n-1) + 1" },
    },
    "depth without a limit": { currentDepth: 25 },
    "a status that no list holds": { subproblems: [{ status: "stuck" }] },
    "every member sent": EVERYTHING,
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

describe("the example in docs/modes/RECURSIVE.md", () => {
  // The page shows one request. A reader copies it, so the server must accept it
  // under the tool name that the page gives, store what it sends and record no
  // sentence about a replaced, kept or ignored value. The answer may still carry
  // issues of the general validator, which reads the text of the thought.
  const page = readFileSync(
    new URL("../../docs/modes/RECURSIVE.md", import.meta.url),
    "utf8",
  );
  const block = /```json\n([\s\S]*?)\n```/.exec(page);
  if (!block) throw new Error("docs/modes/RECURSIVE.md has no json example");
  const example = JSON.parse(block[1]);

  it("names the tool that carries recursive mode", () => {
    expect(example.tool).toBe("deepthinking_engineering");
    expect(page).toContain("**Tool**: `deepthinking_engineering`");
  });

  it("is accepted, stored as sent and gives no sentence about a value", async () => {
    const { mode: _mode, thought, ...fields } = example.arguments;
    const answer = await add({ thought, ...fields });
    const thoughtStored = await stored(answer);
    expect(thoughtStored).toMatchObject(fields);
    expect(thoughtStored.inputWarnings).toBeUndefined();
    expect(
      textsOf(answer).filter((t) => /^Unknown |mode ignores/.test(t)),
    ).toEqual([]);
  });
});
