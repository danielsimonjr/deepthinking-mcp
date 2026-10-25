/**
 * `deepthinking_analyze` mode list pin.
 *
 * The `customModes` enum of `deepthinking_analyze` is its own list, kept apart
 * from the focused tools' `mode` enums. The analyzer runs the real handler of
 * every mode it receives, so a mode missing from the enum is a mode a caller
 * cannot ask for, and a name in the enum with no specialized handler is a mode
 * that silently runs through the generic `hybrid` fallback. This file pins the
 * list in both directions, for both forms of the schema (Zod and the advertised
 * JSON Schema):
 *
 * - every `ThinkingMode` except `custom` is accepted
 * - nothing else is accepted
 * - the analyzer has a specialized handler for every accepted mode
 *
 * `custom` stays out on purpose: it is the one `ThinkingMode` outside
 * `FULLY_IMPLEMENTED_MODES`.
 */

import { describe, it, expect } from 'vitest';
import { ThinkingMode } from '../../../../src/types/core.js';
import { tools } from '../../../../src/tools/definitions.js';
import { analyzeInputSchema } from '../../../../src/tools/schemas/analyze.js';
import { MultiModeAnalyzer } from '../../../../src/modes/combinations/analyzer.js';

const EXPECTED = (Object.values(ThinkingMode) as string[])
  .filter((mode) => mode !== ThinkingMode.CUSTOM)
  .sort();

/** Enum members of the Zod `customModes` array, read off the schema. */
function zodCustomModes(): string[] {
  const field = (analyzeInputSchema.shape.customModes as any).unwrap();
  return [...field.element.options].sort();
}

/** Enum members of the advertised `customModes` array. */
function advertisedCustomModes(): string[] {
  const property = (tools.deepthinking_analyze as any).inputSchema.properties
    .customModes;
  return [...property.items.enum].sort();
}

describe('deepthinking_analyze customModes', () => {
  it('lists every ThinkingMode except custom in the Zod schema', () => {
    expect(zodCustomModes()).toEqual(EXPECTED);
  });

  it('lists every ThinkingMode except custom in the advertised schema', () => {
    expect(advertisedCustomModes()).toEqual(EXPECTED);
  });

  it('names 34 modes', () => {
    expect(EXPECTED).toHaveLength(34);
  });

  it('has a specialized handler for every accepted mode, and only custom is extra', () => {
    const runnable = new MultiModeAnalyzer().getSupportedModes() as string[];
    const missing = EXPECTED.filter((mode) => !runnable.includes(mode));
    const extra = runnable.filter((mode) => !EXPECTED.includes(mode));

    expect(missing).toEqual([]);
    expect(extra).toEqual([ThinkingMode.CUSTOM]);
  });
});
