/**
 * withZodBounds unit tests
 *
 * The advertised JSON Schema is written by hand and takes its length, count and
 * numeric bounds from the Zod schema. These tests pin the rules of that copy on
 * small schemas, so a change to the copy fails here and not only in the
 * conformance test, which compares the already-bounded result with a model
 * built by the same fold:
 *
 * - a bound that the hand-written schema states is kept, even when it differs
 * - a bound that it omits is copied, at every depth
 * - the safe-integer limits that Zod writes for `.int()` are not bounds
 * - the input tool and the module-level schemas are never changed
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { withZodBounds } from '../../../src/tools/schema-bounds.js';
import { toolList } from '../../../src/tools/definitions.js';
import { jsonSchemas } from '../../../src/tools/json-schemas.js';

function tool(properties: Record<string, unknown>) {
  return {
    name: 'probe',
    inputSchema: { type: 'object', properties },
  };
}

function props(result: { inputSchema: unknown }): Record<string, any> {
  return (result.inputSchema as any).properties;
}

describe('withZodBounds', () => {
  it('copies string, array and number bounds onto a node that states none', () => {
    const result = withZodBounds(
      tool({
        text: { type: 'string' },
        list: { type: 'array', items: { type: 'string' } },
        score: { type: 'number' },
      }),
      z.object({
        text: z.string().min(2).max(50),
        list: z.array(z.string()).min(1).max(7),
        score: z.number().min(0).max(1),
      }),
    );

    expect(props(result).text).toMatchObject({ minLength: 2, maxLength: 50 });
    expect(props(result).list).toMatchObject({ minItems: 1, maxItems: 7 });
    expect(props(result).score).toMatchObject({ minimum: 0, maximum: 1 });
  });

  it('keeps a bound that the hand-written schema already states', () => {
    const result = withZodBounds(
      tool({ text: { type: 'string', maxLength: 10 } }),
      z.object({ text: z.string().max(50) }),
    );

    // The disagreement stays visible to the conformance test.
    expect(props(result).text.maxLength).toBe(10);
  });

  it('copies a bound that is missing next to one that is stated', () => {
    const result = withZodBounds(
      tool({ text: { type: 'string', maxLength: 10 } }),
      z.object({ text: z.string().min(3).max(50) }),
    );

    expect(props(result).text).toMatchObject({ minLength: 3, maxLength: 10 });
  });

  it('copies bounds at every depth: object, array item, nullable and union', () => {
    const result = withZodBounds(
      tool({
        outer: {
          type: 'object',
          properties: { inner: { type: 'string' } },
        },
        rows: {
          type: 'array',
          items: {
            type: 'object',
            properties: { cell: { type: 'string' } },
          },
        },
        maybe: { type: 'string' },
        either: { type: ['string', 'number'] },
      }),
      z.object({
        outer: z.object({ inner: z.string().max(11) }),
        rows: z.array(z.object({ cell: z.string().max(12) })).max(5),
        maybe: z.string().max(13).nullable(),
        either: z.union([z.string().max(14), z.number()]),
      }),
    );
    const p = props(result);

    expect(p.outer.properties.inner.maxLength).toBe(11);
    expect(p.rows.maxItems).toBe(5);
    expect(p.rows.items.properties.cell.maxLength).toBe(12);
    expect(p.maybe.maxLength).toBe(13);
    expect(p.either.maxLength).toBe(14);
  });

  it('does not copy the safe-integer limits that Zod writes for .int()', () => {
    const result = withZodBounds(
      tool({ count: { type: 'integer' } }),
      z.object({ count: z.number().int() }),
    );

    expect(props(result).count.minimum).toBeUndefined();
    expect(props(result).count.maximum).toBeUndefined();
  });

  it('copies a real bound on an .int() field', () => {
    const result = withZodBounds(
      tool({ count: { type: 'integer' } }),
      z.object({ count: z.number().int().min(1000).max(120000) }),
    );

    expect(props(result).count).toMatchObject({ minimum: 1000, maximum: 120000 });
  });

  it('leaves the input tool unchanged and returns a separate object', () => {
    const input = tool({ text: { type: 'string' } });
    const before = JSON.stringify(input);
    const result = withZodBounds(input, z.object({ text: z.string().max(5) }));

    expect(JSON.stringify(input)).toBe(before);
    expect(result).not.toBe(input);
    expect(props(result).text.maxLength).toBe(5);
    expect(props(input).text.maxLength).toBeUndefined();
  });

  it('leaves the module-level hand-written schemas unchanged', () => {
    // toolList is built with withZodBounds from jsonSchemas at load. A copy that
    // wrote into its input would add bounds to jsonSchemas, and the conformance
    // test could then no longer tell a copied bound from a stated one.
    const advertised = toolList.map((t) => (t as any).inputSchema);
    const hand = jsonSchemas.map((t) => (t as any).inputSchema);

    expect(hand.length).toBe(advertised.length);
    expect(JSON.stringify(hand)).not.toBe(JSON.stringify(advertised));
    // The thought text has a bound in the advertisement and none by hand.
    const handThought = hand.find((s) => s.properties?.thought)?.properties.thought;
    const advThought = advertised.find((s) => s.properties?.thought)?.properties
      .thought;
    expect(handThought.maxLength).toBeUndefined();
    expect(advThought.maxLength).toBeGreaterThan(0);
  });
});
