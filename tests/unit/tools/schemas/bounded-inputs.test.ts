/**
 * Bounded inputs
 *
 * Sanitization used to run only inside SessionManager, so a tool call could carry
 * a 5 MB string or a 50,000-element array before anything looked at it (H-2
 * remediation, 2026-08-03 audit). The Zod schemas now bound every free-text
 * string and every array. This test holds that as a class: it derives a JSON
 * Schema from each schema that accepts tool input, the thirteen focused tools and
 * the legacy `deepthinking` tool, and fails on any string, array or value of
 * unknown type that has no bound.
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import { toolSchemas } from "../../../../src/tools/definitions.js";
import { ThinkingToolSchema } from "../../../../src/tools/thinking.js";

type Json = Record<string, any>;

/** Paths of unbounded nodes in a JSON Schema. */
function findUnbounded(
  node: Json | undefined,
  path: string,
  out: string[] = [],
): string[] {
  if (!node || typeof node !== "object") return out;
  const arms: Json[] | undefined = node.anyOf ?? node.oneOf;
  if (arms) {
    arms.forEach((arm) => findUnbounded(arm, path, out));
    return out;
  }
  if (node.allOf) {
    node.allOf.forEach((arm: Json) => findUnbounded(arm, path, out));
    return out;
  }
  if (
    node.type === undefined &&
    node.const === undefined &&
    node.enum === undefined
  ) {
    out.push(`${path}: value of unknown type`);
    return out;
  }
  if (
    node.type === "string" &&
    node.maxLength === undefined &&
    node.enum === undefined &&
    node.const === undefined
  ) {
    out.push(`${path}: string without maxLength`);
  }
  if (node.type === "array") {
    if (node.maxItems === undefined && node.prefixItems === undefined)
      out.push(`${path}: array without maxItems`);
    if (node.prefixItems)
      node.prefixItems.forEach((p: Json, i: number) =>
        findUnbounded(p, `${path}[${i}]`, out),
      );
    if (node.items) findUnbounded(node.items, `${path}[]`, out);
  }
  if (node.type === "object" || node.properties) {
    for (const [key, child] of Object.entries<Json>(node.properties ?? {})) {
      findUnbounded(child, path ? `${path}.${key}` : key, out);
    }
    if (typeof node.additionalProperties === "object") {
      findUnbounded(node.additionalProperties, `${path}{}`, out);
    }
    if (node.propertyNames)
      findUnbounded(node.propertyNames, `${path}<key>`, out);
  }
  return out;
}

function derive(schema: z.ZodType): Json {
  return z.toJSONSchema(schema, {
    io: "input",
    unrepresentable: "any",
    reused: "inline",
    cycles: "ref",
  } as never) as Json;
}

describe("every input a tool accepts is bounded", () => {
  const schemas: Array<[string, z.ZodType]> = [
    ...Object.entries(toolSchemas),
    ["deepthinking (legacy)", ThinkingToolSchema],
  ];

  it.each(schemas)(
    "%s has no unbounded string, array or untyped value",
    (_name, schema) => {
      const unbounded = findUnbounded(derive(schema), "");
      expect(unbounded, unbounded.join("\n")).toEqual([]);
    },
  );

  it("the finder reports each kind of unbounded node (control)", () => {
    const probe = derive(
      z.object({
        text: z.string(),
        list: z.array(z.number()),
        anything: z.unknown(),
        bag: z.record(z.string().max(5), z.any()),
        ok: z.array(z.string().max(5)).max(5),
      }),
    );
    expect(findUnbounded(probe, "")).toEqual([
      "text: string without maxLength",
      "list: array without maxItems",
      "anything: value of unknown type",
      "bag{}: value of unknown type",
    ]);
  });
});
