/**
 * Field reach
 *
 * A tool schema that accepts a field promises that the field matters. Each mode
 * handler builds its thought by hand, so a field can pass the Zod schema and
 * then reach nothing: no stored value, no computed result. The caller gets no
 * error and no effect.
 *
 * This test derives a JSON Schema from the Zod schema of every thought tool and
 * changes one leaf of an input at a time. A leaf reaches the stored thought when
 * the thought differs from the one made from the unchanged input. It checks two
 * inputs, because some fields replace others (a handler that takes `causalGraph`
 * ignores a top-level `nodes`): one input that sets every leaf, and one that
 * sets only the required fields and the leaf's own top-level field. It checks
 * every mode of the tool, because the modes of one tool share one set of
 * fields. A leaf passes when at least one mode and one input let it reach the
 * thought. An enum leaf passes when any member other than the first changes it.
 *
 * `KNOWN_UNREACHED` lists the leaves that no mode stores yet. The test compares
 * that list with the measured one in both directions: a new dropped field fails,
 * and so does a fixed field that is still listed. The list shrinks as fields are
 * stored or removed from the schema. It must never grow to hide a new gap.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { z } from "zod";
import { toolSchemas } from "../../../../src/tools/definitions.js";
import { ThoughtFactory } from "../../../../src/services/ThoughtFactory.js";
import { ModeHandlerRegistry } from "../../../../src/modes/index.js";
import type { ThinkingMode } from "../../../../src/types/core.js";

type Json = Record<string, any>;

interface Leaf {
  path: string;
  /** The first value is in the unchanged input; the others are tried one by one. */
  variants: unknown[] | undefined;
}

interface Variation {
  path: string;
  value: unknown;
}

/** Tools that create no thought: they manage sessions or run an analysis. */
const NOT_THOUGHT_TOOLS = new Set([
  "deepthinking_session",
  "deepthinking_analyze",
]);

/**
 * `sessionId` is the one base field that a thought cannot carry: the session
 * manager takes the id of the session that stores the thought and ignores the
 * one in the input (`handleAddThought` reads it to choose the session).
 */
const SELECTS_SESSION = ["sessionId"];

const SESSION_ID = "00000000-0000-4000-8000-000000000000";
const PINNED_TIME = new Date("2026-01-01T00:00:00.000Z");
const SAFE_LIMIT = Number.MAX_SAFE_INTEGER;

/**
 * Accepted leaves that no mode of the tool stores, per tool.
 * Each entry is a path in the derived JSON Schema: `.` enters an object, `[]`
 * an array item, `{}` a record value.
 */
const KNOWN_UNREACHED: Record<string, string[]> = {
  deepthinking_academic: [
    "argumentStrength",
    "codes[].definition",
    "codes[].examples[]",
    "codes[].frequency",
    "codes[].id",
    "codes[].label",
    "codes[].type",
    "critiquedWork.authors[]",
    "critiquedWork.field",
    "critiquedWork.id",
    "critiquedWork.title",
    "critiquedWork.type",
    "critiquedWork.year",
    "saturationReached",
    "strengths[]",
    "suggestions[]",
    "weaknesses[]",
  ],
  deepthinking_analytical: ["derivedInsights[]", "fundamentals[]"],
  deepthinking_causal: [
    "counterfactual.actual",
    "counterfactual.consequence",
    "counterfactual.hypothetical",
    "explanations[].hypothesis",
    "explanations[].plausibility",
    "observations[]",
  ],
  deepthinking_core: [],
  deepthinking_engineering: [
    "algorithmName",
    "complexityAnalysis.averageCase",
    "complexityAnalysis.bestCase",
    "complexityAnalysis.spaceComplexity",
    "complexityAnalysis.timeComplexity",
    "complexityAnalysis.worstCase",
    "correctnessProof.correctness",
    "correctnessProof.invariant",
    "correctnessProof.termination",
  ],
  deepthinking_mathematics: [
    "analysisDepth",
    "hypotheses[]",
    "includeConsistencyCheck",
    "proofSteps[].justification",
    "proofSteps[].latex",
    "proofSteps[].referencesSteps[]",
    "proofSteps[].statement",
    "proofSteps[].stepNumber",
    "theorem",
    "traceAssumptions",
  ],
  deepthinking_probabilistic: ["beliefFunction{}", "plausibilityFunction{}"],
  deepthinking_scientific: [
    "experiments[].description",
    "experiments[].id",
    "experiments[].result",
    "hypothesis",
    "inference",
    "interactions[].from",
    "interactions[].to",
    "interactions[].type",
    "predictions[]",
    "premises[]",
    "systemComponents[].id",
    "systemComponents[].name",
    "systemComponents[].role",
  ],
  deepthinking_standard: [],
  deepthinking_strategic: [
    "constraints[]",
    "objectiveFunction",
    "optimizationMethod",
    "solution.value",
    "solution.variables{}",
  ],
  deepthinking_temporal: [],
};

/**
 * Values that a handler accepts for a field the schema types as a free string.
 * A handler replaces any other string with a default, so the test cannot find
 * these by itself. `thoughtType` takes the list a handler keeps in its
 * `supportedThoughtTypes`; the two handlers that keep none are listed here.
 */
const ACCEPTED_VALUES: Record<string, string[]> = {
  thoughtType: [
    // MathematicsHandler
    "axiom_definition",
    "theorem_statement",
    "proof_construction",
    // PhysicsHandler
    "symmetry_analysis",
    "gauge_theory",
    "field_equations",
  ],
  processType: ["discrete_time", "continuous_time"],
  solutionStatus: ["searching", "found", "infeasible", "timeout"],
  modalLogicType: ["K", "S5"],
  modalDomain: ["alethic", "epistemic"],
  strategy: ["divide_and_conquer", "dynamic_programming"],
  "activeModes[]": ["sequential", "deductive"],
  "cspConstraints[].type": ["unary", "binary"],
  "cspConstraints[].priority": ["required", "soft"],
};

function derive(schema: z.ZodType): Json {
  return z.toJSONSchema(schema, {
    io: "input",
    unrepresentable: "any",
    reused: "inline",
    cycles: "ref",
  } as never) as Json;
}

/** Values the leaf accepts, the first one for the unchanged input; undefined when the schema leaves no choice. */
function variantsOf(node: Json, index: number): unknown[] | undefined {
  if (node.enum) {
    return node.enum.length > 1 ? [...node.enum] : undefined;
  }
  switch (node.type) {
    case "string": {
      const pad = (v: string) =>
        v.length < (node.minLength ?? 0)
          ? v + "x".repeat(node.minLength - v.length)
          : v;
      return [pad(`first-${index}`), pad(`other-${index}`)];
    }
    case "boolean":
      return [true, false];
    case "number":
    case "integer": {
      const lo = limit(node, "minimum", "exclusiveMinimum", -Infinity);
      const hi = limit(node, "maximum", "exclusiveMaximum", Infinity);
      const fits = [0.25, 0.75, 1, 2, 3, 10, 100].filter(
        (v) =>
          v >= lo.value &&
          v <= hi.value &&
          (!lo.exclusive || v > lo.value) &&
          (!hi.exclusive || v < hi.value) &&
          (node.type !== "integer" || Number.isInteger(v)),
      );
      return fits.length > 1 ? fits.slice(0, 2) : undefined;
    }
    default:
      return undefined;
  }
}

function limit(
  node: Json,
  inclusiveKey: string,
  exclusiveKey: string,
  none: number,
): { value: number; exclusive: boolean } {
  const exclusive = node[exclusiveKey];
  if (typeof exclusive === "number" && Math.abs(exclusive) < SAFE_LIMIT) {
    return { value: exclusive, exclusive: true };
  }
  const inclusive = node[inclusiveKey];
  if (typeof inclusive === "number" && Math.abs(inclusive) < SAFE_LIMIT) {
    return { value: inclusive, exclusive: false };
  }
  return { value: none, exclusive: false };
}

/** The top-level field a leaf path belongs to. */
function rootOf(path: string): string {
  return path.split(/[.[{]/)[0];
}

/**
 * Build one input. With `only`, the input holds the required fields and the
 * top-level field `only`; without it, every leaf. The leaf named by `vary`
 * takes another of its values. `leaves` receives every leaf found, in a fixed
 * order.
 */
function buildInput(
  schema: Json,
  vary: Variation | null,
  leaves: Leaf[],
  only?: string,
): Record<string, unknown> {
  const required = new Set<string>(schema.required ?? []);

  function walk(node: Json, path: string): unknown {
    const arms: Json[] | undefined = node.anyOf ?? node.oneOf;
    if (arms) {
      return walk(arms.find((arm) => arm.type !== "null") ?? arms[0], path);
    }
    if (node.allOf) return walk(node.allOf[0], path);
    if (node.const !== undefined) return node.const;

    if (node.type === "object") {
      const out: Record<string, unknown> = {};
      for (const [key, child] of Object.entries<Json>(node.properties ?? {})) {
        const skip =
          path === "" &&
          only !== undefined &&
          key !== only &&
          !required.has(key);
        if (!skip) out[key] = walk(child, path ? `${path}.${key}` : key);
      }
      if (!node.properties && typeof node.additionalProperties === "object") {
        out.key1 = walk(node.additionalProperties, `${path}{}`);
      }
      return out;
    }
    if (node.type === "array") {
      if (Array.isArray(node.prefixItems)) {
        return node.prefixItems.map((item: Json, i: number) =>
          walk(item, `${path}[${i}]`),
        );
      }
      const item = walk(node.items ?? {}, `${path}[]`);
      return Array.from({ length: Math.max(1, node.minItems ?? 1) }, () =>
        structuredClone(item),
      );
    }

    const variants = variantsOf(node, leaves.length);
    leaves.push({ path, variants });
    if (!variants) return node.enum?.[0];
    return vary?.path === path ? vary.value : variants[0];
  }

  return walk(schema, "") as Record<string, unknown>;
}

/** Paths at which two JSON values differ. */
function differences(a: unknown, b: unknown): Set<string> {
  const out = new Set<string>();
  const visit = (x: unknown, y: unknown, at: string): void => {
    if (Object.is(x, y)) return;
    if (Array.isArray(x) && Array.isArray(y)) {
      for (let i = 0; i < Math.max(x.length, y.length); i++)
        visit(x[i], y[i], `${at}[${i}]`);
    } else if (
      x &&
      y &&
      typeof x === "object" &&
      typeof y === "object" &&
      !Array.isArray(x) &&
      !Array.isArray(y)
    ) {
      const keys = new Set([...Object.keys(x), ...Object.keys(y)]);
      for (const key of keys)
        visit((x as Json)[key], (y as Json)[key], at ? `${at}.${key}` : key);
    } else {
      out.add(at);
    }
  };
  visit(a, b, "");
  return out;
}

function plain(thought: unknown): unknown {
  return JSON.parse(JSON.stringify(thought));
}

interface Measurement {
  /** Leaves that no mode of the tool stores. */
  unreached: string[];
  /** Leaves that the schema accepts but this test cannot vary. */
  unvaried: string[];
  /** Inputs that the Zod schema refused. */
  refused: string[];
}

type MakeThought = (input: Record<string, unknown>) => unknown;

/** Other values a leaf may take in a mode, beyond what the schema shows. */
type ValuesFor = (mode: string, path: string) => readonly string[];

function measure(
  zodSchema: z.ZodType,
  makeThought: MakeThought,
  valuesFor: ValuesFor = () => [],
): Measurement {
  const schema = derive(zodSchema);
  const modes: string[] = schema.properties.mode.enum;

  const leaves: Leaf[] = [];
  buildInput(schema, null, leaves);
  const testable = leaves.filter((l) => l.path !== "mode" && l.variants);
  const roots = [...new Set(testable.map((l) => rootOf(l.path)))];

  const reached = new Set<string>();
  const refused: string[] = [];

  const create = (
    mode: string,
    vary: Variation | null,
    only?: string,
    offered = false,
  ): unknown => {
    const input = { ...buildInput(schema, vary, [], only), mode };
    const parsed = zodSchema.safeParse(input);
    if (!parsed.success) {
      // A value offered from outside the schema may be one the schema rejects: that is a rejection, not a gap.
      if (!offered)
        refused.push(`${mode} varying ${vary?.path ?? "nothing"} only ${only}`);
      return undefined;
    }
    return plain(makeThought(parsed.data as Record<string, unknown>));
  };

  for (const mode of modes) {
    for (const only of [undefined, ...roots]) {
      const unchanged = create(mode, null, only);
      if (unchanged === undefined) continue;
      // Values that differ between two runs of the same input (random ids) are not evidence.
      const noise = differences(unchanged, create(mode, null, only));
      for (const leaf of testable) {
        if (reached.has(leaf.path)) continue;
        if (only !== undefined && rootOf(leaf.path) !== only) continue;
        const values = [
          ...leaf
            .variants!.slice(1)
            .map((value) => ({ value, offered: false })),
          ...valuesFor(mode, leaf.path).map((value) => ({
            value,
            offered: true,
          })),
        ];
        for (const { value, offered } of values) {
          const changed = create(
            mode,
            { path: leaf.path, value },
            only,
            offered,
          );
          if (changed === undefined) continue;
          if ([...differences(unchanged, changed)].some((p) => !noise.has(p))) {
            reached.add(leaf.path);
            break;
          }
        }
      }
    }
  }

  return {
    unreached: testable
      .map((l) => l.path)
      .filter((p) => !reached.has(p) && !SELECTS_SESSION.includes(p))
      .sort(),
    unvaried: leaves
      .filter((l) => l.path !== "mode" && !l.variants)
      .map((l) => l.path),
    refused,
  };
}

describe("every accepted field reaches the stored thought", () => {
  beforeAll(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(PINNED_TIME);
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  const tools = Object.keys(toolSchemas).filter(
    (name) => !NOT_THOUGHT_TOOLS.has(name),
  );

  it("covers every thought tool", () => {
    expect(Object.keys(KNOWN_UNREACHED).sort()).toEqual([...tools].sort());
  });

  it.each(tools)("%s: the unreached leaves are the known ones", (name) => {
    const factory = new ThoughtFactory();
    const registry = ModeHandlerRegistry.getInstance();
    const result = measure(
      (toolSchemas as Record<string, z.ZodType>)[name],
      (input) =>
        factory.createThought(
          { ...input, action: "add_thought" } as never,
          SESSION_ID,
        ),
      (mode, path) => {
        const handler = registry.getHandler(mode as ThinkingMode) as {
          supportedThoughtTypes?: readonly string[];
        };
        return [
          ...(path === "thoughtType"
            ? (handler.supportedThoughtTypes ?? [])
            : []),
          ...(ACCEPTED_VALUES[path] ?? []),
        ];
      },
    );
    expect(result.refused, "inputs the schema refused").toEqual([]);
    expect(result.unvaried, "leaves the test cannot vary").toEqual([]);
    expect(result.unreached).toEqual([...(KNOWN_UNREACHED[name] ?? [])].sort());
  });

  it("reports a dropped field, a stored field and a computed one (control)", () => {
    const schema = z.object({
      mode: z.enum(["only", "second"]),
      kept: z.string(),
      dropped: z.string(),
      weight: z.number().min(0).max(1),
      nested: z.array(z.object({ label: z.string(), ignored: z.boolean() })),
    });
    // Stores `kept` and `nested[].label`, computes from `weight`, ignores the rest;
    // the id is random, as in a real handler.
    const result = measure(schema, (input: any) => ({
      id: Math.random(),
      kept: input.kept,
      doubled: input.weight * 2,
      labels: input.nested.map((n: any) => n.label),
    }));
    expect(result.unreached).toEqual(["dropped", "nested[].ignored"]);
    expect(result.refused).toEqual([]);
    expect(result.unvaried).toEqual([]);
  });

  it("finds a field that matters only while another is absent (control)", () => {
    const schema = z.object({
      mode: z.enum(["only"]),
      graph: z.object({ id: z.string() }).optional(),
      nodes: z.array(z.string()).optional(),
    });
    // Takes `graph` when present and `nodes` otherwise.
    const result = measure(schema, (input: any) => ({
      graph: input.graph ?? { id: input.nodes?.[0] },
    }));
    expect(result.unreached).toEqual([]);
  });

  it("finds an enum member that changes the thought when the first does not (control)", () => {
    const schema = z.object({
      mode: z.enum(["only"]),
      kind: z.enum(["unknown-a", "unknown-b", "known"]),
    });
    // Falls back to "generic" for every kind except "known".
    const result = measure(schema, (input: any) => ({
      kind: input.kind === "known" ? "known" : "generic",
    }));
    expect(result.unreached).toEqual([]);
  });

  it("reports a leaf the schema leaves no second value for (control)", () => {
    const result = measure(
      z.object({
        mode: z.enum(["only"]),
        single: z.number().int().min(1).max(1).optional(),
        free: z.string(),
      }),
      (input: any) => ({ free: input.free }),
    );
    expect(result.unvaried).toEqual(["single"]);
    expect(result.unreached).toEqual([]);
  });
});
