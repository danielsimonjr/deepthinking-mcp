/**
 * The causal fields of a causal thought.
 *
 * CausalHandler and GenericModeHandler (in causal mode) build the same six fields. Each handler
 * spreads the result after its base fields and its revision fields. CausalHandler.validate reads
 * the graph of the input in the same way.
 */

import { ThinkingMode } from "../../types/core.js";
import type { CausalThought, ExtendedThoughtType } from "../../types/core.js";
import type { CausalGraph } from "../../types/modes/causal.js";
import type { ThinkingToolInput } from "../../tools/thinking.js";
import { toExtendedThoughtType } from "../../utils/type-guards.js";

/**
 * The six fields that a causal thought takes from the input.
 */
type CausalFields = Pick<
  CausalThought,
  "mode" | "causalGraph" | "interventions" | "mechanisms" | "confounders"
> & { thoughtType: ExtendedThoughtType };

/**
 * Read the causal graph of the input.
 *
 * The graph is `input.causalGraph` when that is set. Otherwise it is built from `input.nodes` and
 * `input.edges`, each of which defaults to an empty list. A graph that is set stays as it is, and
 * a list that is set is not copied.
 */
export function readCausalGraph(input: ThinkingToolInput): CausalGraph {
  const { nodes, edges } = input as {
    nodes?: CausalGraph["nodes"];
    edges?: CausalGraph["edges"];
  };
  return (
    input.causalGraph || {
      nodes: nodes || [],
      edges: edges || [],
    }
  );
}

/**
 * Build the six causal fields of a thought, in this order: `mode`, `thoughtType`, `causalGraph`,
 * `interventions`, `mechanisms` and `confounders`.
 *
 * The mode is always causal. A `thoughtType` that is not a thought type becomes
 * `problem_definition`. The graph comes from `readCausalGraph`. The three other fields default to
 * an empty list. A value that is set stays as it is, and no list is copied.
 */
export function createCausalFields(input: ThinkingToolInput): CausalFields {
  return {
    mode: ThinkingMode.CAUSAL,
    thoughtType: toExtendedThoughtType(input.thoughtType, "problem_definition"),
    causalGraph: readCausalGraph(input),
    interventions: input.interventions || [],
    mechanisms: input.mechanisms || [],
    confounders: input.confounders || [],
  } as CausalFields;
}
