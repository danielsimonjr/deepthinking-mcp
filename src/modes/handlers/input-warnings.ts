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
 * Describe a vocabulary value that the handler does not recognise and does not
 * store: the thought has no such field, and the sentence is the only trace.
 *
 * @param field - Name of the request field, as the client sends it
 * @param value - The value the client sent
 * @param recognised - The values the handler recognises
 * @returns One sentence, or `undefined` when the field is absent, empty or recognised
 */
export function droppedValueWarning(
  field: string,
  value: unknown,
  recognised: readonly string[],
): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "string" && recognised.includes(value)) return undefined;
  return `Unknown ${field} ${echo(value)}; it is not stored. Recognised values: ${recognised.join(", ")}.`;
}

/**
 * Describe members of an object that this mode does not read and does not
 * store, although the schema accepts them because another mode reads the same
 * object.
 *
 * @param mode - The mode that ignores the members, as the client names it
 * @param field - Name of the request field that holds the members
 * @param members - The members the client sent that this mode ignores
 * @param readBy - The mode that reads them
 * @returns One sentence, or `undefined` when `members` is empty
 */
export function ignoredMembersWarning(
  mode: string,
  field: string,
  members: readonly string[],
  readBy: string,
): string | undefined {
  if (members.length === 0) return undefined;
  const names = members.map((member) => `${field}.${member}`);
  const list =
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  const [subject, object] =
    names.length === 1 ? ["it is", "it"] : ["they are", "them"];
  return `${mode.charAt(0).toUpperCase()}${mode.slice(1)} mode ignores ${list}; ${subject} not stored (${readBy} mode reads ${object}).`;
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
