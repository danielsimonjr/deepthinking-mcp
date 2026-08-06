/**
 * Unit tests for the advisory taxonomy wrapper.
 *
 * The wrapper is the only entry point the live request path uses for
 * `src/taxonomy/`. It must never throw, must bound its payload, and must
 * signal truncation explicitly.
 */

import { describe, it, expect } from 'vitest';
import {
  suggestReasoningTypesAdvisory,
  renderReasoningTypeAdvice,
  toTaxonomyCharacteristics,
  MAX_TAXONOMY_SUGGESTIONS,
  MAX_TAXONOMY_RATIONALE,
  MAX_TAXONOMY_WARNINGS,
  MAX_TAXONOMY_KEYWORDS,
  type TaxonomyAdvice,
} from '../../../src/taxonomy/advisory.js';
import type { ProblemCharacteristics } from '../../../src/types/modes/recommendations.js';

const CHARACTERISTICS: ProblemCharacteristics = {
  domain: 'mathematics',
  complexity: 'high',
  uncertainty: 'medium',
  timeDependent: false,
  multiAgent: false,
  requiresProof: true,
  requiresQuantification: true,
  hasIncompleteInfo: false,
  requiresExplanation: true,
  hasAlternatives: false,
};

function available(advice: TaxonomyAdvice) {
  if (!advice.available) {
    throw new Error(`expected available advice, got: ${advice.reason}`);
  }
  return advice;
}

describe('suggestReasoningTypesAdvisory', () => {
  it('suggests reasoning types for a structured problem', () => {
    const advice = available(
      suggestReasoningTypesAdvisory({ characteristics: CHARACTERISTICS }),
    );

    expect(advice.suggestions.length).toBeGreaterThan(0);
    for (const suggestion of advice.suggestions) {
      expect(typeof suggestion.id).toBe('string');
      expect(typeof suggestion.name).toBe('string');
      expect(typeof suggestion.category).toBe('string');
      expect(suggestion.successProbability).toBeGreaterThanOrEqual(0);
      expect(suggestion.successProbability).toBeLessThanOrEqual(1);
    }
  });

  it('bounds the suggestion list and signals truncation', () => {
    const advice = available(
      suggestReasoningTypesAdvisory({ characteristics: CHARACTERISTICS }),
    );

    expect(advice.suggestions.length).toBeLessThanOrEqual(
      MAX_TAXONOMY_SUGGESTIONS,
    );
    expect(advice.totals.suggestions).toBeGreaterThanOrEqual(
      advice.suggestions.length,
    );
    expect(advice.truncated.suggestions).toBe(
      advice.totals.suggestions > advice.suggestions.length,
    );
    expect(advice.truncated.any).toBe(
      advice.truncated.suggestions ||
        advice.suggestions.some((s) => s.rationaleTruncated) ||
        advice.suggestions.some((s) => s.warningsTruncated),
    );
  });

  it('bounds rationale and warnings on every suggestion', () => {
    const advice = available(
      suggestReasoningTypesAdvisory({ characteristics: CHARACTERISTICS }),
    );

    for (const suggestion of advice.suggestions) {
      expect(suggestion.rationale.length).toBeLessThanOrEqual(
        MAX_TAXONOMY_RATIONALE,
      );
      expect(suggestion.warnings.length).toBeLessThanOrEqual(
        MAX_TAXONOMY_WARNINGS,
      );
    }
  });

  it('projects each suggestion instead of returning the whole ReasoningType', () => {
    const advice = available(
      suggestReasoningTypesAdvisory({ characteristics: CHARACTERISTICS }),
    );

    const suggestion = advice.suggestions[0] as Record<string, unknown>;
    // The raw ReasoningType carries keywords/examples/aliases/strengths, and
    // the raw metadata carries eight quality metrics. None belong in a
    // per-request payload.
    expect(suggestion.keywords).toBeUndefined();
    expect(suggestion.examples).toBeUndefined();
    expect(suggestion.aliases).toBeUndefined();
    expect(suggestion.qualityMetrics).toBeUndefined();
    expect(suggestion.reasoningType).toBeUndefined();
    expect(suggestion.metadata).toBeUndefined();
  });

  it('classifies a free-text problem description with no characteristics', () => {
    const advice = available(
      suggestReasoningTypesAdvisory({
        problemType: 'prove the theorem that this lemma follows from the axiom',
      }),
    );

    expect(advice.classification).toBeDefined();
    expect(advice.classification!.primaryTypeId).toBeTruthy();
    expect(advice.classification!.confidence).toBeGreaterThanOrEqual(0);
    expect(advice.classification!.confidence).toBeLessThanOrEqual(1);
    expect(advice.classification!.matchedKeywords.length).toBeLessThanOrEqual(
      MAX_TAXONOMY_KEYWORDS,
    );
    expect(
      advice.classification!.secondaryTypeNames.length,
    ).toBeLessThanOrEqual(MAX_TAXONOMY_SUGGESTIONS);
  });

  it('reports the taxonomy size so the advice can be audited', () => {
    const advice = available(
      suggestReasoningTypesAdvisory({ characteristics: CHARACTERISTICS }),
    );

    expect(advice.totals.taxonomyTypes).toBeGreaterThan(0);
    expect(advice.totals.categories).toBeGreaterThan(0);
  });

  it('is unavailable, not thrown, when there is nothing to describe', () => {
    const advice = suggestReasoningTypesAdvisory({});
    expect(advice.available).toBe(false);
    if (!advice.available) {
      expect(advice.reason).toMatch(/problem/i);
    }
  });

  it('degrades to unavailable when the suggestion engine throws', () => {
    const advice = suggestReasoningTypesAdvisory(
      { characteristics: CHARACTERISTICS },
      {
        engine: {
          suggestForProblem() {
            throw new Error('engine exploded');
          },
        },
      },
    );

    expect(advice.available).toBe(false);
    if (!advice.available) {
      expect(advice.reason).toContain('engine exploded');
    }
  });

  it('keeps suggestions when only the classifier throws', () => {
    const advice = suggestReasoningTypesAdvisory(
      { problemType: 'design a bridge', characteristics: CHARACTERISTICS },
      {
        classifier: {
          classifyText() {
            throw new Error('classifier exploded');
          },
        },
      },
    );

    expect(advice.available).toBe(true);
    if (advice.available) {
      expect(advice.classification).toBeUndefined();
      expect(advice.suggestions.length).toBeGreaterThan(0);
    }
  });

  it('survives an engine that returns a malformed suggestion', () => {
    const advice = suggestReasoningTypesAdvisory(
      { characteristics: CHARACTERISTICS },
      {
        engine: {
          suggestForProblem() {
            return [undefined, null, {}] as never;
          },
        },
      },
    );

    expect(advice.available).toBe(true);
    if (advice.available) {
      expect(advice.suggestions).toEqual([]);
    }
  });
});

describe('toTaxonomyCharacteristics', () => {
  it('maps only the fields with an honest correspondence', () => {
    const mapped = toTaxonomyCharacteristics(CHARACTERISTICS);

    expect(mapped.domain).toBe('mathematics');
    expect(mapped.complexity).toBe('complex');
    expect(mapped.uncertainty).toBe('medium');
    expect(mapped.dataAvailability).toBe('adequate');
    // The mode-shaped input has no counterpart for these; the engine's own
    // defaults must apply rather than an invented value.
    expect(mapped.stakeholders).toBeUndefined();
    expect(mapped.novelty).toBeUndefined();
    expect(mapped.ethicalImplications).toBeUndefined();
    expect(mapped.reversibility).toBeUndefined();
    expect(mapped.timeConstraints).toBeUndefined();
  });

  it('maps each complexity level', () => {
    expect(
      toTaxonomyCharacteristics({ ...CHARACTERISTICS, complexity: 'low' })
        .complexity,
    ).toBe('simple');
    expect(
      toTaxonomyCharacteristics({ ...CHARACTERISTICS, complexity: 'medium' })
        .complexity,
    ).toBe('moderate');
    expect(
      toTaxonomyCharacteristics({ ...CHARACTERISTICS, complexity: 'high' })
        .complexity,
    ).toBe('complex');
  });

  it('treats incomplete information as limited data availability', () => {
    expect(
      toTaxonomyCharacteristics({
        ...CHARACTERISTICS,
        hasIncompleteInfo: true,
      }).dataAvailability,
    ).toBe('limited');
  });
});

describe('renderReasoningTypeAdvice', () => {
  it('renders a markdown section naming the suggested types', () => {
    const advice = available(
      suggestReasoningTypesAdvisory({ characteristics: CHARACTERISTICS }),
    );
    const rendered = renderReasoningTypeAdvice(advice);

    expect(rendered).toContain('## Reasoning Types');
    expect(rendered).toContain(advice.suggestions[0].name);
  });

  it('says so plainly when the advice is unavailable', () => {
    const rendered = renderReasoningTypeAdvice({
      available: false,
      reason: 'Reasoning-type advice unavailable: engine exploded',
    });

    expect(rendered).toContain('unavailable');
    expect(rendered).toContain('engine exploded');
  });

  it('states that the section is advisory', () => {
    const advice = available(
      suggestReasoningTypesAdvisory({ characteristics: CHARACTERISTICS }),
    );
    expect(renderReasoningTypeAdvice(advice).toLowerCase()).toContain(
      'advisory',
    );
  });
});
