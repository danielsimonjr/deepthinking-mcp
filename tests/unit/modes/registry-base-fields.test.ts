/**
 * The base thought fields reach the stored thought in every mode.
 *
 * Every tool accepts `revisionReason`, `branchFrom`, `branchId`, `uncertainty`,
 * `dependencies` and `assumptions`, and `BaseThought` declares them. Each mode
 * handler builds its thought by hand, and most handlers copy only some of the
 * six, so the rest were accepted and then dropped without an error. The registry
 * now carries them over for every handler. This test is derived from the enum, so
 * a new mode that drops one fails here.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  ModeHandlerRegistry,
  registerAllHandlers,
} from "../../../src/modes/index.js";
import { ThinkingMode } from "../../../src/types/core.js";
import type { ThinkingToolInput } from "../../../src/tools/thinking.js";

const ALL_MODES = Object.values(ThinkingMode) as ThinkingMode[];

const BASE_FIELDS = {
  revisionReason: "the first estimate used the wrong unit",
  branchFrom: "thought-1",
  branchId: "branch-a",
  uncertainty: 0.25,
  dependencies: ["thought-0"],
  assumptions: ["the sensor is calibrated"],
} as const;

function inputFor(mode: ThinkingMode): ThinkingToolInput {
  return {
    action: "add_thought",
    mode,
    thought: "carry the base fields",
    thoughtNumber: 2,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    ...BASE_FIELDS,
  } as unknown as ThinkingToolInput;
}

describe("registry carries the base thought fields", () => {
  let registry: ModeHandlerRegistry;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    registerAllHandlers();
    registry = ModeHandlerRegistry.getInstance();
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  it.each(ALL_MODES)("%s keeps all six base fields", (mode) => {
    const thought = registry.createThought(inputFor(mode), "session-1");
    const carried = Object.fromEntries(
      Object.keys(BASE_FIELDS).map((key) => [
        key,
        (thought as unknown as Record<string, unknown>)[key],
      ]),
    );
    expect(carried).toEqual(BASE_FIELDS);
  });

  it("leaves a value the handler computed itself alone", () => {
    const handler = registry.getHandler(ThinkingMode.SEQUENTIAL);
    const original = handler.createThought.bind(handler);
    handler.createThought = (input, sessionId) => ({
      ...original(input, sessionId),
      uncertainty: 0.9,
    });
    const thought = registry.createThought(
      inputFor(ThinkingMode.SEQUENTIAL),
      "session-1",
    );
    expect(thought.uncertainty).toBe(0.9);
  });

  it.each(ALL_MODES)(
    "%s: adds no key when the input carries none of the six",
    (mode) => {
      const plain = {
        action: "add_thought",
        mode,
        thought: "plain",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      } as unknown as ThinkingToolInput;
      const viaHandler = registry
        .getHandler(mode)
        .createThought(plain, "session-1") as unknown as Record<
        string,
        unknown
      >;
      const viaRegistry = registry.createThought(
        plain,
        "session-1",
      ) as unknown as Record<string, unknown>;
      // toEqual ignores a key whose value is undefined, so compare the key sets:
      // a carried `uncertainty: undefined` would still change what a spread or an
      // `in` check sees.
      expect(Object.keys(viaRegistry).sort()).toEqual(
        Object.keys(viaHandler).sort(),
      );
      for (const key of Object.keys(BASE_FIELDS)) {
        expect(viaRegistry[key]).toEqual(viaHandler[key]);
      }
    },
  );
});
