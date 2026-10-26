/**
 * Event order in the temporal timeline exporter.
 *
 * Ten of the eleven formats list the events of a thought in the order of their timestamps. The
 * Mermaid format keeps the order of the input. The sort works on a copy, so the list of the
 * thought is not changed, and the sort is stable, so events with the same timestamp keep the
 * order of the input. The GraphML and TikZ formats give the same output for a missing list, a
 * `null` list and an empty list.
 */

import { describe, expect, it } from "vitest";
import { exportTemporalTimeline } from "../../../../../src/export/visual/modes/index.js";
import type { VisualFormat } from "../../../../../src/export/visual/types.js";

const SORTED_FORMATS: VisualFormat[] = [
  "dot",
  "ascii",
  "svg",
  "graphml",
  "tikz",
  "modelica",
  "html",
  "uml",
  "json",
  "markdown",
];

const base = {
  sessionId: "s",
  thoughtNumber: 1,
  totalThoughts: 1,
  timestamp: new Date("2025-06-01T00:00:00Z"),
  nextThoughtNeeded: false,
  mode: "temporal",
  id: "temp-order",
  content: "Order of events",
};

const event = (id: string, name: string, timestamp: number) => ({
  id,
  name,
  description: `About ${name}`,
  timestamp,
  type: "instant" as const,
  properties: {},
});

const thoughtWith = (events: unknown, timeline?: unknown) =>
  ({ ...base, events, timeline }) as never;

const exportAs = (format: VisualFormat, thought: never): string =>
  exportTemporalTimeline(thought, { format });

/** The positions of the first occurrence of each name in the output, or -1. */
const positions = (output: string, names: string[]): number[] =>
  names.map((name) => output.indexOf(name));

const isAscending = (values: number[]): boolean =>
  values.every(
    (value, index) => value >= 0 && (index === 0 || value > values[index - 1]),
  );

describe("temporal timeline: event order", () => {
  const unordered = () => [
    event("e3", "NameThird", 300),
    event("e1", "NameFirst", 100),
    event("e2", "NameSecond", 200),
  ];
  const ordered = ["NameFirst", "NameSecond", "NameThird"];

  it.each(SORTED_FORMATS)("%s lists the events by timestamp", (format) => {
    const output = exportAs(format, thoughtWith(unordered()));
    expect(isAscending(positions(output, ordered))).toBe(true);
  });

  it("mermaid keeps the order of the input", () => {
    const output = exportAs("mermaid", thoughtWith(unordered()));
    const found = positions(output, ["NameThird", "NameFirst", "NameSecond"]);
    expect(isAscending(found)).toBe(true);
  });

  it.each(SORTED_FORMATS)(
    "%s keeps the input order of events with the same timestamp",
    (format) => {
      const same = ["SameA", "SameB", "SameC", "SameD"];
      const events = [
        event("s3", same[2], 50),
        event("s1", same[0], 50),
        event("s4", same[3], 50),
        event("s2", same[1], 50),
      ];
      // The input order is C, A, D, B and all timestamps are equal.
      const output = exportAs(format, thoughtWith(events));
      expect(
        isAscending(positions(output, ["SameC", "SameA", "SameD", "SameB"])),
      ).toBe(true);
    },
  );

  it.each(SORTED_FORMATS)(
    "%s does not change the list of the thought",
    (format) => {
      const events = unordered();
      const before = events.slice();
      exportAs(format, thoughtWith(events));
      expect(events).toHaveLength(before.length);
      events.forEach((item, index) => expect(item).toBe(before[index]));
    },
  );

  it.each(SORTED_FORMATS)(
    "%s orders negative and fractional timestamps as numbers",
    (format) => {
      const events = [
        event("a", "NameLate", 10),
        event("b", "NameEarly", -5),
        event("c", "NameMiddle", 2.5),
      ];
      const output = exportAs(format, thoughtWith(events));
      expect(
        isAscending(positions(output, ["NameEarly", "NameMiddle", "NameLate"])),
      ).toBe(true);
    },
  );
});

describe("temporal timeline: GraphML and TikZ without events", () => {
  const withEvents = [event("e2", "NameTwo", 2), event("e1", "NameOne", 1)];

  it.each(["graphml", "tikz"] as VisualFormat[])(
    "%s gives one output for a missing, null and empty list",
    (format) => {
      const missing = exportAs(
        format,
        thoughtWith(undefined, { name: "Launch" }),
      );
      expect(exportAs(format, thoughtWith(null, { name: "Launch" }))).toBe(
        missing,
      );
      expect(exportAs(format, thoughtWith([], { name: "Launch" }))).toBe(
        missing,
      );
      expect(missing).toContain("Launch");
    },
  );

  it.each(["graphml", "tikz"] as VisualFormat[])(
    '%s names the graph "Timeline" when the thought has no timeline',
    (format) => {
      expect(exportAs(format, thoughtWith([]))).toContain("Timeline");
      expect(exportAs(format, thoughtWith(withEvents))).toContain("Timeline");
    },
  );

  it.each(["graphml", "tikz"] as VisualFormat[])(
    "%s uses the name of the timeline also when events exist",
    (format) => {
      expect(
        exportAs(format, thoughtWith(withEvents, { name: "Launch" })),
      ).toContain("Launch");
    },
  );

  it("graphml writes one node for each event and none for an empty list", () => {
    const nodes = (output: string) => (output.match(/<node /g) ?? []).length;
    expect(nodes(exportAs("graphml", thoughtWith([])))).toBe(0);
    expect(nodes(exportAs("graphml", thoughtWith(withEvents)))).toBe(2);
  });

  it.each(["graphml", "tikz"] as VisualFormat[])(
    "%s lists the labels in timestamp order",
    (format) => {
      const output = exportAs(format, thoughtWith(withEvents));
      expect(isAscending(positions(output, ["NameOne", "NameTwo"]))).toBe(true);
    },
  );
});
