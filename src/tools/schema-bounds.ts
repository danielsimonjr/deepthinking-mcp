/**
 * Advertised-schema bounds
 *
 * The JSON Schema that `tools/list` returns is written by hand (see
 * `json-schemas.ts`); the limits that `tools/call` enforces live in the Zod
 * schemas, in one place (`MAX_LENGTHS`). Restating each limit by hand in the
 * advertisement would repeat it more than five hundred times and let the copies
 * drift, so the advertisement takes its length, count and numeric bounds from the
 * Zod schema. Everything else (property names, `required`, enums, descriptions)
 * stays hand-written, and `advertised-schema-conformance.test.ts` checks it.
 */

import { z } from "zod";

type JsonNode = Record<string, unknown>;

const BOUND_KEYS = [
  "maxLength",
  "minLength",
  "maxItems",
  "minItems",
  "minimum",
  "maximum",
] as const;

function isNode(value: unknown): value is JsonNode {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Fold a Zod union into one node. A nullable field derives as
 * `anyOf: [x, { type: "null" }]`, which folds to `x`. A true union
 * (`string | number`) folds to one node whose bounds, `items` and `properties`
 * come from the arm that states them, because the hand-written schema describes
 * such a field as one node with a list of types.
 */
function foldUnion(node: JsonNode): JsonNode {
  const arms = node.anyOf ?? node.oneOf;
  if (!Array.isArray(arms)) return node;
  const nodes = arms.filter(isNode);
  const live = nodes.filter((arm) => arm.type !== "null");
  if (live.length === 1 && nodes.length === 2) return foldUnion(live[0]);
  const folded: JsonNode = {};
  for (const arm of nodes.map(foldUnion)) {
    for (const key of [
      ...BOUND_KEYS,
      "items",
      "properties",
      "additionalProperties",
    ]) {
      if (folded[key] === undefined && arm[key] !== undefined)
        folded[key] = arm[key];
    }
  }
  return folded;
}

/**
 * Copy the bounds of `derived` onto `target` wherever `target` states none.
 * A bound that the hand-written schema already states is left alone, so a
 * disagreement stays visible to the conformance test instead of being hidden.
 */
function copyBounds(target: unknown, derived: unknown): void {
  if (!isNode(target) || !isNode(derived)) return;
  const source = foldUnion(derived);

  for (const key of BOUND_KEYS) {
    const value = source[key];
    // Zod writes the safe-integer limits for `.int()`; they are not real bounds.
    if (
      target[key] === undefined &&
      typeof value === "number" &&
      Math.abs(value) < Number.MAX_SAFE_INTEGER
    ) {
      target[key] = value;
    }
  }

  if (isNode(target.properties) && isNode(source.properties)) {
    for (const [name, child] of Object.entries(target.properties)) {
      copyBounds(child, source.properties[name]);
    }
  }
  // A hand-written union lists its arms; each arm takes the bounds of the Zod arm of the same type.
  const targetArms = target.oneOf ?? target.anyOf;
  const derivedArms = derived.anyOf ?? derived.oneOf;
  if (Array.isArray(targetArms) && Array.isArray(derivedArms)) {
    for (const arm of targetArms) {
      if (!isNode(arm)) continue;
      copyBounds(
        arm,
        derivedArms.find((d) => isNode(d) && d.type === arm.type),
      );
    }
  }
  copyBounds(target.items, source.items);
  copyBounds(target.additionalProperties, source.additionalProperties);
}

/**
 * Return a copy of an advertised tool definition whose `inputSchema` carries the
 * bounds of the Zod schema that enforces it.
 */
export function withZodBounds<T extends { inputSchema: unknown }>(
  tool: T,
  zodSchema: z.ZodType,
): T {
  const copy = structuredClone(tool);
  const derived = z.toJSONSchema(zodSchema, {
    io: "input",
    unrepresentable: "any",
    reused: "inline",
    cycles: "ref",
  } as never);
  copyBounds(copy.inputSchema, derived);
  return copy;
}
