/**
 * Accepted fields that tools/list does not advertise
 *
 * A tool definition is one JSON document that a client reads in full. The
 * server holds each advertised tool to a size cap (`MAX_TOOL_BYTES`). A mode
 * whose handler reads more fields than fit under the cap lists its main path
 * and names the rest in one sentence of the tool description. The Zod schema
 * still accepts, bounds and passes on every field the handler reads: the cap
 * limits what the server advertises, never what it accepts.
 *
 * Each entry is a path in the JSON Schema that `z.toJSONSchema` derives from the
 * Zod schema, without the tool name: `.` enters an object. The paths name the
 * property that the advertisement leaves out, not its children.
 *
 * Add a path here only for the reason `OMISSION_REASON` states. A new omission
 * must change this list, so that it is never silent. `advertised-schema-
 * conformance.test.ts` fails when the list differs from the measured difference
 * in either direction.
 */

/** The one reason a path may be listed. */
export const OMISSION_REASON = "tool size cap";

/** Largest size, in bytes, of one advertised tool definition. */
export const MAX_TOOL_BYTES = 16_000;

/** Omitted paths per tool and per mode of that tool. */
export const ADVERTISED_OMISSIONS: Record<
  string,
  Record<string, readonly string[]>
> = {
  deepthinking_engineering: {
    engineering: [],
    recursive: [],
    algorithmic: [
      "algorithm.advantages",
      "algorithm.alternatives",
      "algorithm.clrsReference",
      "algorithm.disadvantages",
      "algorithm.id",
      "algorithm.input",
      "algorithm.output",
      "algorithm.practical",
      "algorithm.pseudocode",
      "amortizedAnalysis",
      "comparison",
      "correctnessProof.invariants",
      "dataStructure",
      "dpFormulation",
      "executionTrace",
      "graphContext",
      "greedyProof",
      "loopInvariants",
    ],
  },
};

/** Every omitted path of a tool, for all of its modes, sorted. */
export function omittedPaths(tool: string): string[] {
  return [
    ...new Set(Object.values(ADVERTISED_OMISSIONS[tool] ?? {}).flat()),
  ].sort();
}

/** The top-level field that a path belongs to. */
export function topLevelOf(path: string): string {
  return path.split(".")[0];
}
