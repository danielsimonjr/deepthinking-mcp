/**
 * Input warnings
 *
 * A mode handler that replaces or ignores a value of the request records a
 * sentence about it in `inputWarnings` on the thought it builds. `validateCommon`
 * runs for every mode, so it turns each sentence into a warning issue, and the
 * issue reaches the client through the `validation` field of the add_thought
 * answer, the one channel that already carries feedback.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { validateCommon } from "../../../src/validation/validators/validation-utils.js";
import { ThoughtValidator } from "../../../src/validation/validator.js";
import { validationCache } from "../../../src/validation/cache.js";
import { ThinkingMode } from "../../../src/types/index.js";
import type { Thought } from "../../../src/types/core.js";

const WARNING = "analysisType 'bogus' is not recognised; using 'comprehensive'";

function makeThought(overrides: Record<string, unknown> = {}): Thought {
  return {
    id: `id-${Math.random()}`,
    sessionId: `session-${Math.random()}`,
    mode: ThinkingMode.ENGINEERING,
    content: "pick a bearing",
    thoughtNumber: 1,
    totalThoughts: 3,
    timestamp: new Date(),
    nextThoughtNeeded: true,
    analysisType: "comprehensive",
    designChallenge: "choose a bearing",
    ...overrides,
  } as unknown as Thought;
}

describe("validateCommon and inputWarnings", () => {
  it("turns each input warning into one warning issue", () => {
    const issues = validateCommon(
      makeThought({ inputWarnings: [WARNING, "second sentence"] }),
    );
    const warned = issues.filter((i) => i.description === WARNING);
    expect(warned).toHaveLength(1);
    expect(warned[0]).toMatchObject({
      severity: "warning",
      thoughtNumber: 1,
      category: "structural",
    });
    expect(issues.some((i) => i.description === "second sentence")).toBe(true);
  });

  it("adds nothing when the field is absent or empty", () => {
    const base = validateCommon(makeThought());
    expect(validateCommon(makeThought({ inputWarnings: [] }))).toEqual(base);
    expect(base.some((i) => i.description === WARNING)).toBe(false);
  });

  it("control: the warning text is not in the issues of a thought without the field", () => {
    expect(
      validateCommon(makeThought()).map((i) => i.description),
    ).not.toContain(WARNING);
  });
});

describe("validation cache and inputWarnings", () => {
  let validator: ThoughtValidator;

  beforeEach(() => {
    validator = new ThoughtValidator();
    validationCache.clear();
  });

  const texts = async (thought: Thought) =>
    (await validator.validate(thought)).issues.map((i) => i.description);

  it("a warned thought and then a clean one: the clean one has no warning", async () => {
    const content = "order warned-first";
    expect(
      await texts(makeThought({ content, inputWarnings: [WARNING] })),
    ).toContain(WARNING);
    expect(await texts(makeThought({ content }))).not.toContain(WARNING);
  });

  it("a clean thought and then a warned one: the warned one has the warning", async () => {
    const content = "order clean-first";
    expect(await texts(makeThought({ content }))).not.toContain(WARNING);
    expect(
      await texts(makeThought({ content, inputWarnings: [WARNING] })),
    ).toContain(WARNING);
  });
});
