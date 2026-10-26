/**
 * wordOverlap and the three proof checks that use it.
 *
 * ProofDecomposer, GapAnalyzer and CircularReasoningDetector each count the long words two
 * statements share. They differ in the shortest word they count, in the text size they divide
 * by (the smaller text or the larger text), and in what they do with the ratio. The helper
 * holds the counting; each caller keeps the rest.
 */

import { describe, it, expect } from 'vitest';
import { wordOverlap } from '../../../src/proof/word-overlap.js';
import { ProofDecomposer } from '../../../src/proof/decomposer.js';
import { GapAnalyzer } from '../../../src/proof/gap-analyzer.js';
import { CircularReasoningDetector } from '../../../src/proof/circular-detector.js';

describe('wordOverlap', () => {
  const smaller = { longerThan: 2, denominator: 'smaller' } as const;
  const larger = { longerThan: 2, denominator: 'larger' } as const;

  it('divides the shared words by the words of the smaller text', () => {
    expect(wordOverlap('alpha beta', 'alpha beta gamma delta', smaller)).toBe(1);
    expect(wordOverlap('alpha beta gamma', 'alpha beta delta epsilon', smaller)).toBe(2 / 3);
  });

  it('divides the shared words by the words of the larger text', () => {
    expect(wordOverlap('alpha beta', 'alpha beta gamma delta', larger)).toBe(0.5);
    expect(wordOverlap('alpha beta gamma', 'alpha beta delta epsilon', larger)).toBe(0.5);
  });

  it('gives the same ratio when the two texts swap', () => {
    const a = 'alpha beta gamma';
    const b = 'beta gamma delta epsilon zeta';
    expect(wordOverlap(a, b, smaller)).toBe(wordOverlap(b, a, smaller));
    expect(wordOverlap(a, b, larger)).toBe(wordOverlap(b, a, larger));
  });

  it('gives 1 for the same text and 0 for texts with no shared word', () => {
    expect(wordOverlap('alpha beta', 'alpha beta', larger)).toBe(1);
    expect(wordOverlap('alpha beta', 'gamma delta', larger)).toBe(0);
    expect(wordOverlap('alpha beta', 'gamma delta', smaller)).toBe(0);
  });

  it('counts a repeated word once', () => {
    expect(wordOverlap('alpha alpha alpha beta', 'alpha gamma', larger)).toBe(0.5);
  });

  it('ignores a word that is not longer than the limit and keeps a word one longer', () => {
    expect(wordOverlap('of an to by', 'of an to by', smaller)).toBe(0);
    expect(wordOverlap('the cat sat', 'the cat sat', smaller)).toBe(1);
    expect(wordOverlap('the cat sat', 'the cat sat', { longerThan: 3, denominator: 'smaller' })).toBe(0);
    expect(wordOverlap('iota zeta', 'iota zeta', { longerThan: 3, denominator: 'smaller' })).toBe(1);
    expect(wordOverlap('iota zeta', 'iota zeta', { longerThan: 4, denominator: 'smaller' })).toBe(0);
  });

  it('does not count a short word in the size of either text', () => {
    // 'of' and 'an' are not counted, so the larger text has 2 words and shares both.
    expect(wordOverlap('alpha beta of an', 'alpha beta', larger)).toBe(1);
  });

  it('returns 0 when one text or both texts have no long word', () => {
    expect(wordOverlap('', 'alpha', smaller)).toBe(0);
    expect(wordOverlap('alpha', '', smaller)).toBe(0);
    expect(wordOverlap('', '', larger)).toBe(0);
    expect(wordOverlap('of an', 'alpha', larger)).toBe(0);
    expect(wordOverlap('   ', 'alpha', larger)).toBe(0);
  });

  it('splits on any run of white space and ignores the white space at the ends', () => {
    expect(wordOverlap('  alpha\tbeta\n\ngamma  ', 'gamma beta alpha', larger)).toBe(1);
    expect(wordOverlap('alpha beta', 'alpha beta', larger)).toBe(1);
  });

  it('keeps case and punctuation', () => {
    expect(wordOverlap('Alpha Beta', 'alpha beta', larger)).toBe(0);
    expect(wordOverlap('theorem.', 'theorem', larger)).toBe(0);
  });
});

describe('ProofDecomposer.hasSignificantOverlap', () => {
  const check = (a: string, b: string): boolean =>
    (new ProofDecomposer() as unknown as { hasSignificantOverlap(a: string, b: string): boolean })
      .hasSignificantOverlap(a, b);

  it('is true when more than half of the words of the smaller text are shared', () => {
    expect(check('alpha beta gamma', 'alpha beta delta')).toBe(true);
  });

  it('is false at exactly half', () => {
    expect(check('alpha beta', 'alpha gamma')).toBe(false);
  });

  it('is true a little above half', () => {
    // 4 of 7 shared words, about 57 percent.
    expect(check('alpha beta gamma delta epsilon zeta theta', 'alpha beta gamma delta iota kappa lambda')).toBe(true);
  });

  it('divides by the smaller text', () => {
    expect(check('alpha beta', 'alpha beta gamma delta epsilon zeta')).toBe(true);
  });

  it('counts words of 3 letters and ignores words of 2 letters', () => {
    expect(check('the cat sat', 'the cat sat')).toBe(true);
    expect(check('of an to by', 'of an to by')).toBe(false);
  });

  it('keeps case, so the caller must lowercase', () => {
    expect(check('Alpha Beta', 'alpha beta')).toBe(false);
  });

  it('is false when either text has no long word', () => {
    expect(check('', 'alpha')).toBe(false);
    expect(check('alpha', '')).toBe(false);
  });
});

describe('GapAnalyzer.computeWordOverlap', () => {
  const overlap = (a: string, b: string): number =>
    (new GapAnalyzer() as unknown as { computeWordOverlap(a: string, b: string): number })
      .computeWordOverlap(a, b);

  it('divides the shared words by the words of the larger text', () => {
    expect(overlap('alpha beta', 'alpha beta gamma delta')).toBe(0.5);
    expect(overlap('alpha beta gamma delta', 'alpha beta')).toBe(0.5);
  });

  it('lowercases both texts', () => {
    expect(overlap('ALPHA Beta', 'alpha BETA')).toBe(1);
  });

  it('counts words of 3 letters and ignores words of 2 letters', () => {
    expect(overlap('the cat', 'the dog')).toBe(0.5);
    expect(overlap('of it', 'of it')).toBe(0);
  });

  it('returns 0 when either text has no long word', () => {
    expect(overlap('', 'alpha')).toBe(0);
    expect(overlap('alpha', '')).toBe(0);
    expect(overlap('', '')).toBe(0);
  });

  it('counts a repeated word once', () => {
    expect(overlap('alpha alpha alpha beta', 'alpha gamma')).toBe(0.5);
  });
});

describe('CircularReasoningDetector.statementsEquivalent (word overlap)', () => {
  const equivalent = (a: string, b: string): boolean =>
    (new CircularReasoningDetector() as unknown as { statementsEquivalent(a: string, b: string): boolean })
      .statementsEquivalent(a, b);

  const ten = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'theta', 'iota', 'kappa', 'lambda'];
  const text = (words: string[]) => words.join(' ');

  it('is true when more than 80 percent of the words are shared', () => {
    expect(equivalent(text(ten), text([...ten.slice(0, 9), 'omega']))).toBe(true);
  });

  it('is false at exactly 80 percent', () => {
    expect(equivalent(text(ten), text([...ten.slice(0, 8), 'omega', 'sigma']))).toBe(false);
  });

  it('divides by the larger text', () => {
    // Both words of the short text are in the long text; the smaller text would give 1.
    expect(equivalent('alpha beta', text(ten))).toBe(false);
  });

  it('counts words of 4 letters and ignores words of 3 letters', () => {
    // 4-letter words are counted: 4 of 4 shared. If they were not, both texts would have no word.
    expect(equivalent('iota zeta beta kuhn', 'iota zeta beta kuhn cat')).toBe(true);
    // 3-letter words are not counted: 4 of 4 shared. If they were, 4 of 5 is 80 percent: false.
    expect(equivalent('alpha beta gamma delta cat', 'alpha beta gamma delta dog')).toBe(true);
  });

  it('ignores case and the punctuation . , ; : ! ?', () => {
    expect(equivalent('Alpha, Beta; Gamma: Delta!', 'delta alpha beta gamma cat')).toBe(true);
  });

  it('is false when a text has no word longer than 3 letters', () => {
    expect(equivalent('of an to by', 'to by of an')).toBe(false);
  });
});
