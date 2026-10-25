import { describe, it, expect } from "vitest";
import {
  droppedValueWarning,
  ignoredMembersWarning,
  inputWarningsField,
  unrecognisedValueWarning,
} from "../../../../src/modes/handlers/input-warnings.js";

const RECOGNISED = ["alpha", "beta"] as const;

describe("droppedValueWarning", () => {
  it("says nothing for an absent, empty or recognised value", () => {
    expect(droppedValueWarning("f", undefined, RECOGNISED)).toBeUndefined();
    expect(droppedValueWarning("f", null, RECOGNISED)).toBeUndefined();
    expect(droppedValueWarning("f", "", RECOGNISED)).toBeUndefined();
    expect(droppedValueWarning("f", "beta", RECOGNISED)).toBeUndefined();
  });

  it("says the value is not stored and lists the recognised ones", () => {
    expect(droppedValueWarning("f", "gamma", RECOGNISED)).toBe(
      'Unknown f "gamma"; it is not stored. Recognised values: alpha, beta.',
    );
  });

  it("quotes a value of another type as text and shortens a long value", () => {
    expect(droppedValueWarning("f", 7, RECOGNISED)).toContain('"7"');
    expect(droppedValueWarning("f", "y".repeat(61), RECOGNISED)).toContain(
      `"${"y".repeat(60)}..."`,
    );
  });
});

describe("unrecognisedValueWarning", () => {
  it("says nothing for an absent, empty or recognised value", () => {
    expect(unrecognisedValueWarning("f", undefined, RECOGNISED)).toBeUndefined();
    expect(unrecognisedValueWarning("f", null, RECOGNISED)).toBeUndefined();
    expect(unrecognisedValueWarning("f", "", RECOGNISED)).toBeUndefined();
    expect(unrecognisedValueWarning("f", "beta", RECOGNISED)).toBeUndefined();
  });

  it("names the default when the handler replaces the value", () => {
    expect(unrecognisedValueWarning("f", "gamma", RECOGNISED, "alpha")).toBe(
      'Unknown f "gamma"; using the default "alpha". Recognised values: alpha, beta.',
    );
  });

  it("says the value is kept when the handler keeps it as sent", () => {
    expect(unrecognisedValueWarning("f", "gamma", RECOGNISED)).toBe(
      'Unknown f "gamma"; it is kept as sent. Recognised values: alpha, beta.',
    );
  });

  it("treats a value of another type as unrecognised and quotes it as text", () => {
    expect(unrecognisedValueWarning("f", 7, RECOGNISED, "alpha")).toContain(
      '"7"',
    );
  });

  it("escapes quotes and shortens a long value", () => {
    expect(unrecognisedValueWarning("f", 'a"b', RECOGNISED, "alpha")).toContain(
      '"a\\"b"',
    );
    const long = unrecognisedValueWarning("f", "y".repeat(61), RECOGNISED, "alpha");
    expect(long).toContain(`"${"y".repeat(60)}..."`);
  });
});

describe("ignoredMembersWarning", () => {
  it("says nothing when the client sent no member that the mode ignores", () => {
    expect(
      ignoredMembersWarning("recursive", "recurrence", [], "algorithmic"),
    ).toBeUndefined();
  });

  it("names one member in the singular", () => {
    expect(
      ignoredMembersWarning("recursive", "recurrence", ["id"], "algorithmic"),
    ).toBe(
      "Recursive mode ignores recurrence.id; it is not stored (algorithmic mode reads it).",
    );
  });

  it("names two members with 'and' and no comma", () => {
    expect(
      ignoredMembersWarning(
        "recursive",
        "recurrence",
        ["id", "solution"],
        "algorithmic",
      ),
    ).toBe(
      "Recursive mode ignores recurrence.id and recurrence.solution; they are not stored (algorithmic mode reads them).",
    );
  });

  it("names more members with commas and 'and' before the last", () => {
    expect(
      ignoredMembersWarning(
        "recursive",
        "recurrence",
        ["id", "solution", "solutionProof"],
        "algorithmic",
      ),
    ).toBe(
      "Recursive mode ignores recurrence.id, recurrence.solution and recurrence.solutionProof; they are not stored (algorithmic mode reads them).",
    );
  });
});

describe("inputWarningsField", () => {
  it("is an empty object when there is no sentence, so the thought has no field", () => {
    expect(inputWarningsField([])).toEqual({});
    expect(inputWarningsField([undefined, undefined])).toEqual({});
    expect("inputWarnings" in inputWarningsField([undefined])).toBe(false);
  });

  it("keeps the sentences in order and skips the undefined entries", () => {
    expect(inputWarningsField(["one", undefined, "two"])).toEqual({
      inputWarnings: ["one", "two"],
    });
  });
});
