/**
 * Input warnings
 *
 * A handler replaces or keeps a request value without telling the client. These
 * helpers build the sentence the handler records in `BaseThought.inputWarnings`.
 * `validateCommon()` turns each sentence into a warning issue in the
 * `validation` field of the add_thought answer.
 */

/** Longest part of a rejected value that a sentence repeats. */
const MAX_ECHO = 60;

/** Quote a client value for a sentence, shortened so one sentence stays short. */
function echo(value: unknown): string {
  const text = String(value);
  return JSON.stringify(
    text.length > MAX_ECHO ? `${text.slice(0, MAX_ECHO)}...` : text,
  );
}

/**
 * Describe a vocabulary value that the handler does not recognise.
 *
 * @param field - Name of the request field, as the client sends it
 * @param value - The value the client sent
 * @param recognised - The values the handler recognises
 * @param fallback - The default the handler uses instead; leave it out when the
 *   handler keeps the value as sent
 * @returns One sentence, or `undefined` when the field is absent, empty or recognised
 */
export function unrecognisedValueWarning(
  field: string,
  value: unknown,
  recognised: readonly string[],
  fallback?: string,
): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "string" && recognised.includes(value)) return undefined;
  const outcome =
    fallback === undefined
      ? "it is kept as sent"
      : `using the default ${JSON.stringify(fallback)}`;
  return `Unknown ${field} ${echo(value)}; ${outcome}. Recognised values: ${recognised.join(", ")}.`;
}

/**
 * Make the `inputWarnings` property of a thought.
 *
 * @param sentences - The sentences a handler collected; entries that are `undefined` are skipped
 * @returns `{ inputWarnings }` when there is a sentence, otherwise an empty object,
 *   so that a thought without a warning carries no field
 */
export function inputWarningsField(
  sentences: ReadonlyArray<string | undefined>,
): { inputWarnings?: string[] } {
  const kept = sentences.filter((s): s is string => s !== undefined);
  return kept.length > 0 ? { inputWarnings: kept } : {};
}
