/**
 * Word overlap shared by the proof decomposer, the gap analyzer and the circular reasoning
 * detector.
 */

/**
 * How wordOverlap counts the words of two texts.
 */
export interface WordOverlapOptions {
  /** A word counts only when it has more characters than this limit. */
  longerThan: number;
  /** Divide the shared words by the words of the smaller text or of the larger text. */
  denominator: "smaller" | "larger";
}

/**
 * Split a text on white space and keep each distinct word longer than the limit.
 */
function longWords(text: string, longerThan: number): Set<string> {
  return new Set(text.split(/\s+/).filter((w) => w.length > longerThan));
}

/**
 * Share of the words that two texts have in common, from 0 to 1. Words keep their case and
 * their punctuation, so a caller that wants a match without case lowercases the texts first.
 * A repeated word counts once. The result is 0 when either text has no word that counts.
 */
export function wordOverlap(
  a: string,
  b: string,
  { longerThan, denominator }: WordOverlapOptions,
): number {
  const wordsA = longWords(a, longerThan);
  const wordsB = longWords(b, longerThan);

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let shared = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) shared++;
  }

  const size =
    denominator === "smaller"
      ? Math.min(wordsA.size, wordsB.size)
      : Math.max(wordsA.size, wordsB.size);
  return shared / size;
}
