/**
 * H-2 remediation tests (2026-08-03 audit)
 *
 * Audit finding: sanitization/length bounds were applied in exactly one place
 * (SessionManager), and zero of the 37 mode handlers / tool schemas enforced
 * any limit. Confirmed live PoC: `deepthinking_probabilistic` accepted a 5 MB
 * `hypotheses[0].description` and a 50,000-element `evidence` array
 * unmodified.
 *
 * These tests reproduce that PoC against the Zod schemas that actually gate
 * `deepthinking_*` tool calls (`schema.parse(args)` in src/index.ts), and
 * spot-check that the same class of bound is applied across the other mode
 * schemas. They also confirm legitimate-sized input is unaffected.
 */

import { describe, it, expect } from "vitest";
import { toolSchemas } from "../../../../src/tools/definitions.js";
import { ProbabilisticSchema } from "../../../../src/tools/schemas/modes/probabilistic.js";
import { CausalSchema } from "../../../../src/tools/schemas/modes/causal.js";
import { AcademicSchema } from "../../../../src/tools/schemas/modes/academic.js";
import { EngineeringSchema } from "../../../../src/tools/schemas/modes/engineering.js";
import { StrategicSchema } from "../../../../src/tools/schemas/modes/strategic.js";
import { TemporalSchema } from "../../../../src/tools/schemas/modes/temporal.js";
import { ScientificSchema } from "../../../../src/tools/schemas/modes/scientific.js";
import { AnalyticalSchema } from "../../../../src/tools/schemas/modes/analytical.js";
import { CoreModeSchema } from "../../../../src/tools/schemas/modes/core.js";
import { MathSchema } from "../../../../src/tools/schemas/modes/mathematics.js";
import { BaseThoughtSchema } from "../../../../src/tools/schemas/base.js";
import { analyzeInputSchema } from "../../../../src/tools/schemas/analyze.js";
import { ThinkingToolSchema } from "../../../../src/tools/thinking.js";
import { MAX_LENGTHS } from "../../../../src/utils/sanitization.js";

function baseThought(overrides: Record<string, unknown> = {}) {
  return {
    thought: "Analyzing probabilities",
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    ...overrides,
  };
}

describe("H-2: schema-layer input bounding", () => {
  describe("confirmed live PoC — deepthinking_probabilistic", () => {
    it("rejects a 5 MB hypotheses[0].description", () => {
      const oversizedDescription = "A".repeat(5 * 1024 * 1024); // 5 MB
      const input = baseThought({
        mode: "bayesian",
        hypotheses: [
          { id: "h1", description: oversizedDescription, probability: 0.5 },
        ],
      });

      expect(() => ProbabilisticSchema.parse(input)).toThrow();
      // Also verify via the exact tool-dispatch path used by src/index.ts
      expect(() =>
        toolSchemas.deepthinking_probabilistic.parse(input),
      ).toThrow();
    });

    it("rejects a 50,000-element evidence array", () => {
      const evidence = Array.from({ length: 50000 }, (_, i) => `evidence-${i}`);
      const input = baseThought({ mode: "bayesian", evidence });

      expect(() => ProbabilisticSchema.parse(input)).toThrow();
    });

    it("accepts a legitimately-sized hypothesis and evidence list", () => {
      const input = baseThought({
        mode: "bayesian",
        hypotheses: [
          {
            id: "h1",
            description: "A reasonably detailed hypothesis description.",
            probability: 0.5,
          },
        ],
        evidence: ["Observation A", "Observation B", "Observation C"],
      });

      expect(() => ProbabilisticSchema.parse(input)).not.toThrow();
    });
  });

  describe("base thought fields", () => {
    it("rejects an oversized `thought` field beyond THOUGHT_CONTENT", () => {
      const oversized = "x".repeat(MAX_LENGTHS.THOUGHT_CONTENT + 1);
      expect(() =>
        BaseThoughtSchema.parse(
          baseThought({ thought: oversized, mode: undefined }),
        ),
      ).toThrow();
    });

    it("accepts a thought at the THOUGHT_CONTENT boundary", () => {
      const atLimit = "x".repeat(MAX_LENGTHS.THOUGHT_CONTENT);
      expect(() =>
        BaseThoughtSchema.parse(baseThought({ thought: atLimit })),
      ).not.toThrow();
    });

    it("rejects an oversized dependencies array", () => {
      const dependencies = Array.from(
        { length: MAX_LENGTHS.ARRAY_ITEMS + 1 },
        (_, i) => `dep-${i}`,
      );
      expect(() =>
        BaseThoughtSchema.parse(baseThought({ dependencies })),
      ).toThrow();
    });
  });

  describe("spot-check across other mode schemas", () => {
    it("CausalSchema rejects an oversized node description", () => {
      const input = baseThought({
        mode: "causal",
        nodes: [
          {
            id: "n1",
            name: "n1",
            description: "d".repeat(MAX_LENGTHS.DESCRIPTION + 1),
          },
        ],
      });
      expect(() => CausalSchema.parse(input)).toThrow();
    });

    it("CausalSchema rejects an oversized observations array", () => {
      const observations = Array.from(
        { length: MAX_LENGTHS.ARRAY_ITEMS + 1 },
        (_, i) => `obs-${i}`,
      );
      expect(() => CausalSchema.parse(baseThought({ mode: "causal", observations }))).toThrow();
    });

    it("AcademicSchema rejects an oversized source title / oversized sources array", () => {
      const oversizedTitle = baseThought({
        mode: "synthesis",
        sources: [{ id: "s1", title: "t".repeat(MAX_LENGTHS.TITLE + 1) }],
      });
      expect(() => AcademicSchema.parse(oversizedTitle)).toThrow();

      const tooManySources = baseThought({
        mode: "synthesis",
        sources: Array.from({ length: MAX_LENGTHS.NESTED_ARRAY_ITEMS + 1 }, (_, i) => ({
          id: `s${i}`,
          title: `Source ${i}`,
        })),
      });
      expect(() => AcademicSchema.parse(tooManySources)).toThrow();
    });

    it("EngineeringSchema rejects an oversized algorithmName", () => {
      const input = baseThought({
        mode: "algorithmic",
        algorithmName: "n".repeat(MAX_LENGTHS.TITLE + 1),
      });
      expect(() => EngineeringSchema.parse(input)).toThrow();
    });

    it("StrategicSchema rejects an oversized constraints array", () => {
      const constraints = Array.from(
        { length: MAX_LENGTHS.ARRAY_ITEMS + 1 },
        (_, i) => `c-${i}`,
      );
      expect(() =>
        StrategicSchema.parse(baseThought({ mode: "optimization", constraints })),
      ).toThrow();
    });

    it("TemporalSchema rejects an oversized historicalEvents array and description", () => {
      const tooMany = baseThought({
        mode: "historical",
        historicalEvents: Array.from(
          { length: MAX_LENGTHS.NESTED_ARRAY_ITEMS + 1 },
          (_, i) => ({
            id: `e${i}`,
            name: `Event ${i}`,
            date: "2020",
            significance: "minor",
          }),
        ),
      });
      expect(() => TemporalSchema.parse(tooMany)).toThrow();
    });

    it("ScientificSchema rejects an oversized hypothesis field", () => {
      const input = baseThought({
        mode: "scientificmethod",
        hypothesis: "h".repeat(MAX_LENGTHS.DESCRIPTION + 1),
      });
      expect(() => ScientificSchema.parse(input)).toThrow();
    });

    it("AnalyticalSchema rejects an oversized fundamentals array", () => {
      const fundamentals = Array.from(
        { length: MAX_LENGTHS.ARRAY_ITEMS + 1 },
        (_, i) => `f-${i}`,
      );
      expect(() =>
        AnalyticalSchema.parse(baseThought({ mode: "firstprinciples", fundamentals })),
      ).toThrow();
    });

    it("CoreModeSchema rejects an oversized premises array and generalization text", () => {
      const premises = Array.from(
        { length: MAX_LENGTHS.ARRAY_ITEMS + 1 },
        (_, i) => `p-${i}`,
      );
      expect(() =>
        CoreModeSchema.parse(baseThought({ mode: "deductive", premises })),
      ).toThrow();

      expect(() =>
        CoreModeSchema.parse(
          baseThought({
            mode: "inductive",
            generalization: "g".repeat(MAX_LENGTHS.DESCRIPTION + 1),
          }),
        ),
      ).toThrow();
    });

    it("MathSchema rejects an oversized theorem field", () => {
      const input = baseThought({
        mode: "mathematics",
        theorem: "t".repeat(MAX_LENGTHS.DESCRIPTION + 1),
      });
      expect(() => MathSchema.parse(input)).toThrow();
    });

    it("analyzeInputSchema rejects an oversized thought/context field", () => {
      expect(() =>
        analyzeInputSchema.parse({
          thought: "x".repeat(MAX_LENGTHS.THOUGHT_CONTENT + 1),
        }),
      ).toThrow();

      expect(() =>
        analyzeInputSchema.parse({
          thought: "valid thought",
          context: "c".repeat(MAX_LENGTHS.DESCRIPTION + 1),
        }),
      ).toThrow();
    });
  });

  describe("residual gap: the legacy 'deepthinking' tool (ThinkingToolSchema)", () => {
    // The legacy tool (src/index.ts, name === "deepthinking") is kept live for
    // back-compat after L-2 hid it from tools/list. It validates against a
    // SEPARATE schema (ThinkingToolSchema in src/tools/thinking.ts) that was
    // found to have the exact same gap (316 z.string() vs 40 .max() before
    // this fix) — an attacker could bypass every bound above just by calling
    // the old tool name. These tests confirm that back door is closed too.
    function legacyThought(overrides: Record<string, unknown> = {}) {
      return {
        thought: "Analyzing probabilities",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: "hybrid",
        ...overrides,
      };
    }

    it("rejects a 5 MB `thought` field", () => {
      expect(() =>
        ThinkingToolSchema.parse(
          legacyThought({ thought: "A".repeat(5 * 1024 * 1024) }),
        ),
      ).toThrow();
    });

    it("accepts a thought at the THOUGHT_CONTENT boundary", () => {
      expect(() =>
        ThinkingToolSchema.parse(
          legacyThought({ thought: "x".repeat(MAX_LENGTHS.THOUGHT_CONTENT) }),
        ),
      ).not.toThrow();
    });

    it("rejects an oversized nested hypotheses[].description field", () => {
      expect(() =>
        ThinkingToolSchema.parse(
          legacyThought({
            mode: "evidential",
            hypotheses: [
              {
                id: "h1",
                description: "d".repeat(MAX_LENGTHS.DESCRIPTION + 1),
              },
            ],
          }),
        ),
      ).toThrow();
    });

    it("rejects a 50,000-element evidence-like array (dependencies)", () => {
      const dependencies = Array.from({ length: 50000 }, (_, i) => `d${i}`);
      expect(() =>
        ThinkingToolSchema.parse(legacyThought({ dependencies })),
      ).toThrow();
    });

    it("accepts legitimately-sized legacy input", () => {
      expect(() =>
        ThinkingToolSchema.parse(
          legacyThought({
            hypotheses: [{ id: "h1", description: "A normal hypothesis." }],
            dependencies: ["a", "b", "c"],
          }),
        ),
      ).not.toThrow();
    });
  });
});
