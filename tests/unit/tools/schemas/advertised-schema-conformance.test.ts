/**
 * Advertised JSON Schema conformance
 *
 * `tools/list` returns a hand-written JSON Schema for each tool; `tools/call` is
 * enforced by a Zod schema. They are two descriptions of one contract, and a
 * client that follows the first can be refused by the second (a required `mode`
 * the advertisement omits, an enum value Zod does not accept), or can be told
 * nothing about a limit that Zod enforces (a 10,000-character cap, a 500-item cap).
 *
 * This test derives a JSON Schema from every Zod schema with `z.toJSONSchema` and
 * compares it with the advertised one, at every depth: property names, required
 * names, types, enum members, and numeric/length/count bounds. The advertisement
 * stays hand-written for Claude Desktop compatibility (see the v4.4.0 CHANGELOG
 * entry); only the comparison is generated.
 *
 * `schema-contract.test.ts` holds the per-defect regressions; this file holds the
 * class-wide guard.
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import { toolList, toolSchemas } from "../../../../src/tools/definitions.js";

type Json = Record<string, any>;

const SAFE_LIMIT = Number.MAX_SAFE_INTEGER;
const BOUND_KEYS = [
  "maxLength",
  "minLength",
  "maxItems",
  "minItems",
  "minimum",
  "maximum",
] as const;

/** Types of a node: its `type` (string or list) or the `type`s of its union members. */
function typeSet(node: Json): string[] {
  const members: Json[] = node.anyOf ?? node.oneOf ?? [node];
  const out = new Set<string>();
  for (const m of members) {
    for (const t of Array.isArray(m.type)
      ? m.type
      : [m.type ?? (m.const !== undefined ? "const" : "any")]) {
      out.add(String(t));
    }
  }
  return [...out].sort();
}

/**
 * Fold a union into one node: a nullable field folds to its non-null arm; a true
 * union folds to the union of its types, with the bounds, `items` and
 * `properties` of whichever arm states them. The advertisement describes such a
 * field as one node with a list of types.
 */
function fold(node: Json): Json {
  const arms: Json[] | undefined = node.anyOf ?? node.oneOf;
  if (!arms) return node;
  const live = arms.filter((a) => a.type !== "null");
  if (live.length === 1 && arms.length === 2) return fold(live[0]);
  const out: Json = {
    type: [...new Set(arms.flatMap((a) => typeSet(fold(a))))].sort(),
  };
  for (const arm of arms.map(fold)) {
    for (const key of [
      ...BOUND_KEYS,
      "items",
      "properties",
      "required",
      "additionalProperties",
    ]) {
      if (out[key] === undefined && arm[key] !== undefined) out[key] = arm[key];
    }
  }
  return out;
}

/** The effective numeric bound: Zod's safe-integer limits on `.int()` are not real bounds. */
function bound(
  node: Json,
  key: (typeof BOUND_KEYS)[number],
): number | undefined {
  const v = node[key];
  if (typeof v === "number" && Math.abs(v) < SAFE_LIMIT) return v;
  if (
    key === "minimum" &&
    typeof node.exclusiveMinimum === "number" &&
    node.type === "integer"
  ) {
    return node.exclusiveMinimum + 1;
  }
  return undefined;
}

function compare(
  advertised: Json | undefined,
  derived: Json | undefined,
  path: string,
  diffs: string[],
): void {
  if (!advertised || !derived) {
    diffs.push(
      `${path}: absent from the ${advertised ? "Zod schema" : "advertised schema"}`,
    );
    return;
  }
  const a = fold(advertised);
  const d = fold(derived);

  const at = typeSet(a).join("|");
  const dt = typeSet(d).join("|");
  if (at !== dt) diffs.push(`${path}: type ${at} advertised, ${dt} in Zod`);

  const ae = a.enum ? [...a.enum].sort().join(",") : undefined;
  const de = d.enum ? [...d.enum].sort().join(",") : undefined;
  if (ae !== de) diffs.push(`${path}: enum [${ae}] advertised, [${de}] in Zod`);

  for (const key of BOUND_KEYS) {
    const av = bound(a, key);
    const dv = bound(d, key);
    if (av !== dv) diffs.push(`${path}: ${key} ${av} advertised, ${dv} in Zod`);
  }

  if (d.prefixItems) {
    // A Zod tuple is a fixed-length list; the advertisement states that as minItems = maxItems.
    const n = d.prefixItems.length;
    if (a.minItems !== n || a.maxItems !== n)
      diffs.push(
        `${path}: tuple of ${n} not advertised as minItems = maxItems = ${n}`,
      );
    return;
  }

  if (a.properties || d.properties) {
    const ap: Json = a.properties ?? {};
    const dp: Json = d.properties ?? {};
    for (const key of new Set([...Object.keys(ap), ...Object.keys(dp)])) {
      if (!(key in ap)) diffs.push(`${path}.${key}: in Zod, not advertised`);
      else if (!(key in dp))
        diffs.push(`${path}.${key}: advertised, not in Zod`);
      else compare(ap[key], dp[key], `${path}.${key}`, diffs);
    }
    const ar = [...(a.required ?? [])].sort().join(",");
    const dr = [...(d.required ?? [])].sort().join(",");
    if (ar !== dr)
      diffs.push(`${path}: required [${ar}] advertised, [${dr}] in Zod`);
  } else if (typeof d.additionalProperties === "object") {
    // A Zod record: the advertisement must type its values, not just allow them.
    if (typeof a.additionalProperties === "object") {
      compare(
        a.additionalProperties,
        d.additionalProperties,
        `${path}{}`,
        diffs,
      );
    } else {
      diffs.push(
        `${path}: record values are typed in Zod, advertised additionalProperties is ${JSON.stringify(a.additionalProperties)}`,
      );
    }
  }

  if (a.items || d.items) compare(a.items, d.items, `${path}[]`, diffs);
}

function deriveJsonSchema(schema: z.ZodType): Json {
  return z.toJSONSchema(schema, {
    io: "input",
    unrepresentable: "any",
    reused: "inline",
    cycles: "ref",
  } as never) as Json;
}

describe("advertised JSON Schema conforms to the Zod schema that enforces the call", () => {
  it("covers every advertised tool", () => {
    const advertised = toolList.map((t) => (t as Json).name).sort();
    expect(advertised).toEqual(Object.keys(toolSchemas).sort());
  });

  it.each(
    toolList.map((t) => [(t as Json).name as string, t as Json] as const),
  )("%s agrees with its Zod schema at every depth", (name, tool) => {
    const zod = (toolSchemas as Record<string, z.ZodType>)[name];
    const diffs: string[] = [];
    compare(tool.inputSchema, deriveJsonSchema(zod), name, diffs);
    expect(diffs, diffs.join("\n")).toEqual([]);
  });

  it("the comparison itself reports a difference (control)", () => {
    const diffs: string[] = [];
    compare(
      { type: "object", properties: { a: { type: "string" } }, required: [] },
      {
        type: "object",
        properties: { a: { type: "string", maxLength: 5 } },
        required: ["a"],
      },
      "probe",
      diffs,
    );
    expect(diffs).toEqual([
      "probe.a: maxLength undefined advertised, 5 in Zod",
      "probe: required [] advertised, [a] in Zod",
    ]);
  });
});
