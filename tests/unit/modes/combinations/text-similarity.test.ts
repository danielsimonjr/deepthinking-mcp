/**
 * Word-overlap similarity tests.
 *
 * ConflictResolver and InsightMerger share this score.
 */

import { describe, it, expect } from 'vitest';
import { wordSimilarity } from '../../../../src/modes/combinations/text-similarity.js';

describe('wordSimilarity', () => {
  it('returns 1 for identical texts', () => {
    expect(wordSimilarity('the cat sat', 'the cat sat')).toBe(1);
  });

  it('returns 0 for texts with no shared word', () => {
    expect(wordSimilarity('alpha beta', 'gamma delta')).toBe(0);
  });

  it('ignores case', () => {
    expect(wordSimilarity('The Cat', 'the cat')).toBe(1);
  });

  it('divides the shared words by the distinct words of both texts', () => {
    // shared: the, cat (2); distinct: the, cat, sat, ran (4)
    expect(wordSimilarity('the cat sat', 'the cat ran')).toBeCloseTo(2 / 4, 12);
  });

  it('counts a repeated word once', () => {
    // sets: {a, b} and {a}; shared 1, distinct 2
    expect(wordSimilarity('a a a b', 'a')).toBeCloseTo(1 / 2, 12);
  });

  it('is symmetric', () => {
    const a = 'we should adopt the new policy now';
    const b = 'the old policy should stay';
    expect(wordSimilarity(a, b)).toBe(wordSimilarity(b, a));
  });
});
