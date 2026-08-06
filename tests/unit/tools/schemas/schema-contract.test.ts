/**
 * Schema Contract Tests
 *
 * The advertised JSON Schema (returned by `tools/list`) and the Zod schema that
 * actually enforces the call are two hand-maintained descriptions of one contract.
 * When they drift, the failure is silent in both directions:
 *
 *  - A property advertised but absent from Zod is DISCARDED (Zod strips unknown
 *    keys by default). The caller gets no error and no effect.
 *  - A property Zod accepts but never advertises is undiscoverable.
 *  - A sub-field Zod requires but the JSON Schema marks optional makes a request
 *    that validates client-side fail the real call.
 *
 * The `divergence guard` block below walks every tool and enforces parity as a
 * class, so the next drift fails here instead of reaching a client.
 */

import { describe, it, expect } from 'vitest';
import { toolList, toolSchemas } from '../../../../src/tools/definitions.js';
import { AcademicSchema } from '../../../../src/tools/schemas/modes/academic.js';
import { CausalSchema } from '../../../../src/tools/schemas/modes/causal.js';
import { EngineeringSchema } from '../../../../src/tools/schemas/modes/engineering.js';
import { ProbabilisticSchema } from '../../../../src/tools/schemas/modes/probabilistic.js';

// ---------------------------------------------------------------------------
// Zod introspection helpers
// ---------------------------------------------------------------------------

/**
 * Wrapper node types that hold their subject in `def.innerType`.
 *
 * Descend ONLY through these. A generic `.unwrap()` loop is wrong here: in zod
 * v4 `ZodArray.unwrap()` returns the array's ELEMENT, so a greedy loop silently
 * walks past the array and reports the element's internals as the array's own.
 */
const WRAPPER_TYPES = new Set(['optional', 'nullable', 'default', 'readonly', 'catch']);

/** Strip optional/nullable/default wrappers to reach the underlying node. */
function core(field: unknown): any {
  let cur: any = field;
  for (let i = 0; i < 20 && cur?.def; i++) {
    if (WRAPPER_TYPES.has(cur.def.type) && cur.def.innerType) {
      cur = cur.def.innerType;
      continue;
    }
    break;
  }
  return cur;
}

/** Object shape of a field, or null if it is not an object schema. */
function objectShape(field: unknown): Record<string, any> | null {
  const c = core(field);
  return c?.def?.type === 'object' ? c.shape : null;
}

/** Element schema of an array field, or null if it is not an array schema. */
function arrayElement(field: unknown): any | null {
  const c = core(field);
  return c?.def?.type === 'array' ? c.def.element : null;
}

/** Enum values of a field, or null if it is not an enum schema. */
function enumValues(field: unknown): string[] | null {
  const c = core(field);
  return c?.def?.type === 'enum' ? (Object.values(c.def.entries ?? {}) as string[]) : null;
}

/** A field is optional iff it accepts `undefined`. */
function isOptional(field: any): boolean {
  return field.safeParse(undefined).success;
}

/** Keys of a Zod object shape that must be supplied. */
function requiredKeys(shape: Record<string, any>): string[] {
  return Object.keys(shape).filter((k) => !isOptional(shape[k]));
}

/** Every tool paired with its advertised properties and its enforcing Zod shape. */
const TOOL_PAIRS = toolList.map((tool) => {
  const name = (tool as any).name as string;
  const inputSchema = (tool as any).inputSchema;
  return {
    name,
    advertised: (inputSchema.properties ?? {}) as Record<string, any>,
    zodShape: (toolSchemas as any)[name]?.shape as Record<string, any> | undefined,
  };
});

/** Minimal valid base thought, so mode-specific fields are the only variable. */
const BASE = {
  thought: 'contract probe',
  thoughtNumber: 1,
  totalThoughts: 1,
  nextThoughtNeeded: false,
};

// ===========================================================================
// Per-defect regression tests
// ===========================================================================

describe('schema contract: academic advertised-only properties', () => {
  const advertised = () =>
    Object.keys(
      (toolList.find((t) => (t as any).name === 'deepthinking_academic') as any).inputSchema
        .properties
    );

  /**
   * `researchGaps`, `analysisMethod` and `categories` were advertised but had no
   * Zod field, so Zod's strip mode discarded them. They are consumed nowhere in
   * `src/`; the canonical `gaps` / `methodology` are what the handlers read.
   */
  it.each(['researchGaps', 'analysisMethod', 'categories'])(
    'no longer advertises the phantom property %s',
    (phantom) => {
      expect(advertised()).not.toContain(phantom);
    }
  );

  it('discards a phantom property rather than honouring it (why it was removed)', () => {
    const parsed = AcademicSchema.parse({
      ...BASE,
      mode: 'synthesis',
      researchGaps: ['a gap that goes nowhere'],
    } as never);
    expect(parsed).not.toHaveProperty('researchGaps');
  });

  it('preserves the canonical gaps property that SynthesisHandler reads', () => {
    const parsed = AcademicSchema.parse({
      ...BASE,
      mode: 'synthesis',
      gaps: [{ id: 'g1', description: 'limited longitudinal data' }],
    });
    expect(parsed.gaps).toHaveLength(1);
    expect(parsed.gaps?.[0]?.description).toBe('limited longitudinal data');
  });

  it('preserves the canonical methodology property that AnalysisHandler reads', () => {
    const parsed = AcademicSchema.parse({
      ...BASE,
      mode: 'analysis',
      methodology: 'grounded_theory',
    });
    expect(parsed.methodology).toBe('grounded_theory');
  });

  /** Consumed by all four academic handlers via `resolveThoughtType`, never advertised. */
  it('advertises thoughtType, which every academic handler reads', () => {
    expect(advertised()).toContain('thoughtType');
  });
});

describe('schema contract: engineering optional sub-fields', () => {
  /**
   * The advertised schema declares no `required` array on these objects, so a
   * partial object validates client-side. Zod used to reject it.
   */
  it('accepts a partial tradeStudy, as advertised', () => {
    const parsed = EngineeringSchema.parse({
      ...BASE,
      mode: 'engineering',
      tradeStudy: { options: ['a', 'b'] },
    });
    expect(parsed.tradeStudy?.options).toEqual(['a', 'b']);
  });

  it('accepts a partial fmeaEntry, as advertised', () => {
    const parsed = EngineeringSchema.parse({
      ...BASE,
      mode: 'engineering',
      fmeaEntry: { failureMode: 'seal leak' },
    });
    expect(parsed.fmeaEntry?.failureMode).toBe('seal leak');
  });

  it('accepts a partial complexityAnalysis, as advertised', () => {
    const parsed = EngineeringSchema.parse({
      ...BASE,
      mode: 'algorithmic',
      complexityAnalysis: { spaceComplexity: 'O(n)' },
    });
    expect(parsed.complexityAnalysis?.spaceComplexity).toBe('O(n)');
  });

  it('accepts a partial correctnessProof, as advertised', () => {
    const parsed = EngineeringSchema.parse({
      ...BASE,
      mode: 'algorithmic',
      correctnessProof: { invariant: 'sorted prefix' },
    });
    expect(parsed.correctnessProof?.invariant).toBe('sorted prefix');
  });

  it('still enforces the documented bounds on fmeaEntry ratings', () => {
    const bad = EngineeringSchema.safeParse({
      ...BASE,
      mode: 'engineering',
      fmeaEntry: { failureMode: 'seal leak', severity: 11 },
    });
    expect(bad.success).toBe(false);
  });
});

describe('schema contract: probabilistic beliefMasses', () => {
  /**
   * `beliefMasses` was superseded by `massFunction` (the only one EvidentialHandler
   * reads) but stayed in Zod, unadvertised and unconsumed: accepted, then ignored.
   */
  it('no longer accepts the superseded beliefMasses property', () => {
    const parsed = ProbabilisticSchema.parse({
      ...BASE,
      mode: 'evidential',
      beliefMasses: [{ hypothesis: 'h1', mass: 0.5 }],
    } as never);
    expect(parsed).not.toHaveProperty('beliefMasses');
  });

  it('preserves massFunction, the property EvidentialHandler reads', () => {
    const parsed = ProbabilisticSchema.parse({
      ...BASE,
      mode: 'evidential',
      massFunction: { h1: 0.5, h2: 0.5 },
    });
    expect(parsed.massFunction).toEqual({ h1: 0.5, h2: 0.5 });
  });
});

describe('schema contract: causal legacy surface', () => {
  /** CausalHandler reads `input.causalGraph` directly; it was never advertised. */
  it('advertises causalGraph, which CausalHandler reads', () => {
    const advertised = Object.keys(
      (toolList.find((t) => (t as any).name === 'deepthinking_causal') as any).inputSchema
        .properties
    );
    expect(advertised).toContain('causalGraph');
  });

  it('accepts and preserves a nested causalGraph', () => {
    const parsed = CausalSchema.parse({
      ...BASE,
      mode: 'causal',
      causalGraph: {
        nodes: [{ id: 'n1', name: 'rain' }],
        edges: [{ from: 'n1', to: 'n1' }],
      },
    });
    expect(parsed.causalGraph?.nodes).toHaveLength(1);
  });

  /**
   * The tool description states "abductive moved to core", and the advertised
   * enum is causal/counterfactual only. Zod still accepted the migrated value.
   */
  it('rejects the migrated abductive mode value', () => {
    const result = CausalSchema.safeParse({ ...BASE, mode: 'abductive' });
    expect(result.success).toBe(false);
  });

  it('still accepts the two modes this tool owns', () => {
    for (const mode of ['causal', 'counterfactual']) {
      expect(CausalSchema.safeParse({ ...BASE, mode }).success).toBe(true);
    }
  });
});

// ===========================================================================
// Class guard — catches the next divergence, not just the ones fixed above
// ===========================================================================

describe('schema contract: divergence guard', () => {
  it('covers every tool with an introspectable Zod object schema', () => {
    expect(TOOL_PAIRS).toHaveLength(13);
    for (const { name, zodShape } of TOOL_PAIRS) {
      expect(zodShape, `${name} has no introspectable Zod shape`).toBeDefined();
    }
  });

  /** Advertised but unenforced => silently discarded on every call. */
  it('advertises no property that the Zod schema would discard', () => {
    const drift: string[] = [];
    for (const { name, advertised, zodShape } of TOOL_PAIRS) {
      if (!zodShape) continue;
      for (const key of Object.keys(advertised)) {
        if (!(key in zodShape)) drift.push(`${name}.${key}`);
      }
    }
    expect(drift, 'advertised in tools/list but stripped by Zod').toEqual([]);
  });

  /** Enforced but unadvertised => undiscoverable to any client reading tools/list. */
  it('accepts no property that it fails to advertise', () => {
    const drift: string[] = [];
    for (const { name, advertised, zodShape } of TOOL_PAIRS) {
      if (!zodShape) continue;
      for (const key of Object.keys(zodShape)) {
        if (!(key in advertised)) drift.push(`${name}.${key}`);
      }
    }
    expect(drift, 'accepted by Zod but absent from tools/list').toEqual([]);
  });

  /**
   * A sub-field Zod requires but the JSON Schema marks optional makes a request
   * that passes client-side validation fail the real call.
   */
  it('requires no object sub-field that it advertises as optional', () => {
    const drift: string[] = [];
    for (const { name, advertised, zodShape } of TOOL_PAIRS) {
      if (!zodShape) continue;
      for (const [key, prop] of Object.entries(advertised)) {
        if (prop?.type !== 'object' || !prop.properties) continue;
        const shape = objectShape(zodShape[key]);
        if (!shape) continue;
        const advertisedRequired: string[] = prop.required ?? [];
        for (const req of requiredKeys(shape)) {
          if (!advertisedRequired.includes(req)) drift.push(`${name}.${key}.${req}`);
        }
      }
    }
    expect(drift, 'Zod-required but advertised as optional').toEqual([]);
  });

  /** Same failure, one level deeper: inside the items of an advertised array. */
  it('requires no array-item sub-field that it advertises as optional', () => {
    const drift: string[] = [];
    for (const { name, advertised, zodShape } of TOOL_PAIRS) {
      if (!zodShape) continue;
      for (const [key, prop] of Object.entries(advertised)) {
        if (prop?.type !== 'array' || prop.items?.type !== 'object' || !prop.items.properties)
          continue;
        const element = arrayElement(zodShape[key]);
        const shape = element ? objectShape(element) : null;
        if (!shape) continue;
        const advertisedRequired: string[] = prop.items.required ?? [];
        for (const req of requiredKeys(shape)) {
          if (!advertisedRequired.includes(req)) drift.push(`${name}.${key}[].${req}`);
        }
      }
    }
    expect(drift, 'Zod-required but advertised as optional').toEqual([]);
  });

  /** An enum value in one layer but not the other is a routing bug in waiting. */
  it('enforces exactly the enum values it advertises', () => {
    const drift: string[] = [];
    for (const { name, advertised, zodShape } of TOOL_PAIRS) {
      if (!zodShape) continue;
      for (const [key, prop] of Object.entries(advertised)) {
        if (!Array.isArray(prop?.enum)) continue;
        const values = enumValues(zodShape[key]);
        if (!values) continue;
        for (const v of prop.enum) {
          if (!values.includes(v)) drift.push(`${name}.${key}: advertised "${v}" not enforced`);
        }
        for (const v of values) {
          if (!prop.enum.includes(v)) drift.push(`${name}.${key}: enforced "${v}" not advertised`);
        }
      }
    }
    expect(drift, 'enum value parity').toEqual([]);
  });
});

// ===========================================================================
// Guard self-check — proves the guard's introspection actually sees structure
// ===========================================================================

describe('schema contract: guard introspection self-check', () => {
  /**
   * Every assertion above is vacuously true if the helpers silently return null.
   * These pin the helpers to known structure so a zod upgrade that changes the
   * internals fails loudly here instead of quietly disarming the guard.
   */
  it('resolves an optional object field to its shape', () => {
    const shape = objectShape(EngineeringSchema.shape.tradeStudy);
    expect(Object.keys(shape ?? {})).toEqual(
      expect.arrayContaining(['options', 'criteria', 'weights'])
    );
  });

  it('resolves an optional array field to its element shape, not past it', () => {
    const element = arrayElement(AcademicSchema.shape.gaps);
    expect(Object.keys(objectShape(element) ?? {})).toEqual(
      expect.arrayContaining(['id', 'description'])
    );
  });

  it('resolves an enum field to its values', () => {
    expect(enumValues(CausalSchema.shape.mode)).toEqual(['causal', 'counterfactual']);
  });

  it('distinguishes required from optional keys', () => {
    const shape = objectShape(AcademicSchema.shape.critiquedWork)!;
    expect(requiredKeys(shape)).toEqual(['title']);
  });

  it('finds object and array properties to check in the advertised schemas', () => {
    let objects = 0;
    let arrays = 0;
    for (const { advertised } of TOOL_PAIRS) {
      for (const prop of Object.values(advertised)) {
        if (prop?.type === 'object' && prop.properties) objects++;
        if (prop?.type === 'array' && prop.items?.type === 'object') arrays++;
      }
    }
    expect(objects).toBeGreaterThan(5);
    expect(arrays).toBeGreaterThan(20);
  });
});
