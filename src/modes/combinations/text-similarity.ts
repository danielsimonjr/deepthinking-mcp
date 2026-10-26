/**
 * Text similarity shared by the conflict resolver and the insight merger.
 */

/**
 * Score the word overlap of two texts: the words they share divided by
 * the distinct words of both (Jaccard index over lowercase words).
 */
export function wordSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}
