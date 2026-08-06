/**
 * Regression guard: the reasoning-type taxonomy is wired into the live
 * request path.
 *
 * `src/taxonomy/` was five complete modules — 69 reasoning types across 12
 * categories, a classifier, a navigator and a suggestion engine — that nothing
 * outside `src/taxonomy/` ever imported, while the README and CLAUDE.md
 * advertised "taxonomy-based classification" as a shipped feature. These tests
 * fail the moment `recommend_mode` stops consulting it, which is the way it
 * became dead code the first time.
 *
 * The advice is ADVISORY. It is added to the `recommend_mode` response; it
 * never replaces or alters the `ModeRecommender` recommendation.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { buildModeRecommendation } from '../../../src/services/RecommendationService.js';
import type { ProblemCharacteristics } from '../../../src/types/modes/recommendations.js';

const CHARACTERISTICS: ProblemCharacteristics = {
  domain: 'engineering',
  complexity: 'high',
  uncertainty: 'high',
  timeDependent: true,
  multiAgent: false,
  requiresProof: false,
  requiresQuantification: true,
  hasIncompleteInfo: true,
  requiresExplanation: true,
  hasAlternatives: true,
};

describe('taxonomy wiring — recommend_mode', () => {
  it('adds reasoning-type advice to a characteristics-based recommendation', () => {
    const response = buildModeRecommendation({
      problemCharacteristics: CHARACTERISTICS,
    });

    expect(response).toContain('## Reasoning Types');
  });

  it('adds reasoning-type advice to a quick problemType recommendation', () => {
    const response = buildModeRecommendation({ problemType: 'optimization' });

    expect(response).toContain('## Reasoning Types');
  });

  it('leaves the existing mode recommendation intact', () => {
    const withAdvice = buildModeRecommendation({
      problemCharacteristics: CHARACTERISTICS,
    });
    const withoutAdvice = buildModeRecommendation({
      problemCharacteristics: CHARACTERISTICS,
      includeReasoningTypes: false,
    });

    expect(withoutAdvice).not.toContain('## Reasoning Types');
    expect(withAdvice.startsWith(withoutAdvice)).toBe(true);
    expect(withoutAdvice).toContain('# Mode Recommendations');
    expect(withoutAdvice).toContain('## Individual Modes');
  });

  it('leaves the quick recommendation intact', () => {
    const withoutAdvice = buildModeRecommendation({
      problemType: 'optimization',
      includeReasoningTypes: false,
    });

    expect(withoutAdvice).toContain('**Recommended Mode**');
    expect(withoutAdvice).not.toContain('## Reasoning Types');
    expect(
      buildModeRecommendation({ problemType: 'optimization' }).startsWith(
        withoutAdvice,
      ),
    ).toBe(true);
  });

  it('still includes mode combinations when asked', () => {
    const response = buildModeRecommendation({
      problemCharacteristics: CHARACTERISTICS,
      includeCombinations: true,
    });

    expect(response).toContain('## Recommended Mode Combinations');
    expect(response).toContain('## Reasoning Types');
  });

  it('rejects an empty request exactly as before', () => {
    expect(() => buildModeRecommendation({})).toThrow(
      /problemType or problemCharacteristics/,
    );
  });

  it('is reached from the live recommend_mode handler', () => {
    const indexSource = readFileSync(
      join(process.cwd(), 'src', 'index.ts'),
      'utf-8',
    );

    expect(indexSource).toMatch(/buildModeRecommendation/);
    expect(indexSource).toMatch(
      /RecommendationService|services\/RecommendationService\.js/,
    );
  });
});
