/**
 * Mode-name resolution
 *
 * CustomHandler (basedOnModes) and HybridHandler (activeModes) accept mode names
 * as strings from the client. This lookup turns one name into a ThinkingMode.
 */

import { ThinkingMode } from "../../types/core.js";

const MODES_BY_NAME: ReadonlyMap<string, ThinkingMode> = new Map(
  Object.values(ThinkingMode).map((mode) => [mode, mode]),
);

/**
 * Resolve a mode name, ignoring case. An unknown name resolves to sequential.
 */
export function resolveMode(name: string): ThinkingMode {
  return MODES_BY_NAME.get(name.toLowerCase()) ?? ThinkingMode.SEQUENTIAL;
}
