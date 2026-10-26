/**
 * Mode-name resolution
 *
 * CustomHandler (basedOnModes) and HybridHandler (activeModes) accept mode names.
 * The names are strings from the client.
 * This lookup maps a name to a ThinkingMode.
 */

import { ThinkingMode } from "../../types/core.js";
import { unrecognisedValueWarning } from "./input-warnings.js";

const MODES_BY_NAME: ReadonlyMap<string, ThinkingMode> = new Map(
  Object.values(ThinkingMode).map((mode) => [mode, mode]),
);

const MODE_NAMES: readonly string[] = [...MODES_BY_NAME.keys()];

/**
 * Resolve a mode name, ignoring case. An unknown name resolves to sequential.
 */
export function resolveMode(name: string): ThinkingMode {
  return MODES_BY_NAME.get(name.toLowerCase()) ?? ThinkingMode.SEQUENTIAL;
}

/**
 * Describe each name in a client list that `resolveMode` replaces with sequential.
 *
 * @param field - Name of the request field that holds the list, as the client sends it
 * @param names - The names the client sent
 * @returns One sentence for each name that is not a mode, in the order of first use.
 *   The list is empty when the list is absent or every name is a mode.
 */
export function unknownModeWarnings(
  field: string,
  names: readonly string[] | undefined,
): string[] {
  if (!Array.isArray(names)) return [];
  const sentences: string[] = [];
  const seen = new Set<string>();
  for (const name of names) {
    if (seen.has(name) || MODES_BY_NAME.has(name.toLowerCase())) continue;
    seen.add(name);
    const sentence = unrecognisedValueWarning(
      field,
      name,
      MODE_NAMES,
      ThinkingMode.SEQUENTIAL,
    );
    if (sentence !== undefined) sentences.push(sentence);
  }
  return sentences;
}
