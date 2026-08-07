/**
 * `deepthinking_analyze` must run real reasoning modes, and must never invent
 * a confidence.
 *
 * Until this was fixed, `MultiModeAnalyzer.executeModes()` called
 * `generateModeInsights()`, a `switch` over eleven modes returning a hardcoded
 * English sentence with the caller's own question spliced into it:
 *
 *     "Strategic analysis: Nash equilibrium considerations for <first 30 chars>..."
 *
 * No handler ran. `evidence` listed "Payoff matrix" for a game-theory insight
 * that had never seen a payoff matrix. `confidence` was `0.8` times a per-mode
 * literal, so the reported `confidenceScore` was **identical for two unrelated
 * problems** — it was a function of which modes were selected and nothing
 * else. Every mode outside the eleven cased ones got generic filler.
 *
 * These tests pin the two properties that make that impossible to reintroduce:
 * output must come from `ThoughtFactory`, and no number may be presented as a
 * confidence unless something computed it.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MultiModeAnalyzer } from '../../../../src/modes/combinations/analyzer.js';
import { UNSCORED_INSIGHT_WEIGHT } from '../../../../src/modes/combinations/combination-types.js';
import { ThoughtFactory } from '../../../../src/services/ThoughtFactory.js';
import { ThinkingMode } from '../../../../src/types/core.js';

const PROBLEM = 'Should we migrate the billing service to microservices?';

/** Phrases the placeholder generator emitted. None may reappear. */
const PLACEHOLDER_PHRASES = [
  'Logical deduction from premises:',
  'Pattern identified from analysis:',
  'Best explanation hypothesis:',
  'Causal relationship identified:',
  'Probability assessment:',
  'System dynamics:',
  'First principles analysis:',
  'Strategic analysis: Nash equilibrium considerations',
  'Counterfactual scenario:',
  'Temporal analysis:',
  'Optimization insight:',
  'Key observations about',
  'Context-aware insight:',
];

describe('analyze executes real modes through ThoughtFactory', () => {
  let analyzer: MultiModeAnalyzer;

  beforeEach(() => {
    analyzer = new MultiModeAnalyzer();
  });

  it('calls the factory once per requested mode, with that mode', async () => {
    const factory = new ThoughtFactory();
    const spy = vi.spyOn(factory, 'createThought');
    const withSpy = new MultiModeAnalyzer({ thoughtFactory: factory });

    const modes = [
      ThinkingMode.DEDUCTIVE,
      ThinkingMode.BAYESIAN,
      ThinkingMode.GAMETHEORY,
    ];
    await withSpy.analyze({ thought: PROBLEM, customModes: modes });

    expect(spy).toHaveBeenCalledTimes(modes.length);
    const modesPassed = spy.mock.calls.map((call) => call[0].mode);
    expect([...modesPassed].sort()).toEqual([...modes].sort());
  });

  it('passes the caller problem to the handler, not a truncation of it', async () => {
    const factory = new ThoughtFactory();
    const spy = vi.spyOn(factory, 'createThought');
    const withSpy = new MultiModeAnalyzer({ thoughtFactory: factory });

    await withSpy.analyze({
      thought: PROBLEM,
      customModes: [ThinkingMode.DEDUCTIVE, ThinkingMode.CAUSAL],
    });

    for (const call of spy.mock.calls) {
      expect(call[0].thought).toContain(PROBLEM);
    }
  });

  it('folds context into the text the handler sees', async () => {
    const factory = new ThoughtFactory();
    const spy = vi.spyOn(factory, 'createThought');
    const withSpy = new MultiModeAnalyzer({ thoughtFactory: factory });

    await withSpy.analyze({
      thought: PROBLEM,
      context: 'The team has six engineers and a hard Q3 deadline.',
      customModes: [ThinkingMode.DEDUCTIVE, ThinkingMode.CAUSAL],
    });

    for (const call of spy.mock.calls) {
      expect(call[0].thought).toContain('six engineers');
    }
  });

  it('emits none of the placeholder phrases', async () => {
    const response = await analyzer.analyze({
      thought: PROBLEM,
      customModes: [
        ThinkingMode.DEDUCTIVE,
        ThinkingMode.INDUCTIVE,
        ThinkingMode.GAMETHEORY,
        ThinkingMode.HISTORICAL,
      ],
    });

    const text =
      response.analysis.primaryInsights.map((i) => i.content).join('\n') +
      '\n' +
      response.analysis.synthesizedConclusion;

    for (const phrase of PLACEHOLDER_PHRASES) {
      expect(text, `placeholder phrase reappeared: ${phrase}`).not.toContain(
        phrase,
      );
    }
  });

  it('reports what the handler actually populated', async () => {
    const response = await analyzer.analyze({
      thought: PROBLEM,
      customModes: [ThinkingMode.BAYESIAN, ThinkingMode.GAMETHEORY],
    });

    const bayesian = response.analysis.primaryInsights.find(
      (i) => i.sourceMode === ThinkingMode.BAYESIAN,
    );

    // BayesianHandler builds a hypothesis/prior/likelihood/posterior structure.
    // Naming those is only possible by reading the thought it produced.
    expect(bayesian).toBeDefined();
    expect(bayesian!.content).toContain('posterior');
  });

  it('carries the handler advisory that names what the mode needs', async () => {
    const response = await analyzer.analyze({
      thought: PROBLEM,
      customModes: [ThinkingMode.GAMETHEORY, ThinkingMode.DEDUCTIVE],
    });

    const game = response.analysis.primaryInsights.find(
      (i) => i.sourceMode === ThinkingMode.GAMETHEORY,
    );

    // GameTheoryHandler's own advisory. The old code asserted Nash equilibrium
    // findings for an input that defined no game at all.
    expect(game!.content).toContain('players');
  });

  it('gives each mode a different result', async () => {
    const response = await analyzer.analyze({
      thought: PROBLEM,
      customModes: [
        ThinkingMode.DEDUCTIVE,
        ThinkingMode.BAYESIAN,
        ThinkingMode.GAMETHEORY,
        ThinkingMode.HISTORICAL,
      ],
    });

    const contents = response.analysis.primaryInsights.map((i) => i.content);
    expect(new Set(contents).size).toBe(contents.length);
  });

  it('takes the category from the thought, not from a constant', async () => {
    const response = await analyzer.analyze({
      thought: PROBLEM,
      customModes: [ThinkingMode.GAMETHEORY, ThinkingMode.HISTORICAL],
    });

    // Both handlers set `thoughtType` on the thought they build.
    const categories = response.analysis.primaryInsights.map((i) => i.category);
    expect(categories).toContain('game_definition');
    expect(categories).not.toContain('general_insight');
  });

  it('runs every registered mode, not a hardcoded subset', async () => {
    // The old `getSupportedModes()` list named 29 and omitted `historical`,
    // `recursive`, `modal`, `stochastic`, `constraint` and `custom`, all of
    // which have registered handlers.
    const supported = analyzer.getSupportedModes();

    expect(supported).toContain(ThinkingMode.HISTORICAL);
    expect(supported).toContain(ThinkingMode.STOCHASTIC);
    expect(supported).toContain(ThinkingMode.CONSTRAINT);
    expect(supported).toContain(ThinkingMode.MODAL);
    expect(supported).toContain(ThinkingMode.RECURSIVE);
    expect(supported.length).toBe(Object.values(ThinkingMode).length);
  });

  it('produces an insight for a mode the old switch never cased', async () => {
    const response = await analyzer.analyze({
      thought: PROBLEM,
      customModes: [ThinkingMode.HISTORICAL, ThinkingMode.STOCHASTIC],
    });

    const modes = response.analysis.primaryInsights.map((i) => i.sourceMode);
    expect(modes).toContain(ThinkingMode.HISTORICAL);
    expect(modes).toContain(ThinkingMode.STOCHASTIC);
  });
});

describe('analyze never presents a confidence it did not compute', () => {
  let analyzer: MultiModeAnalyzer;

  beforeEach(() => {
    analyzer = new MultiModeAnalyzer();
  });

  it('marks every insight unavailable, with a reason', async () => {
    const response = await analyzer.analyze({
      thought: PROBLEM,
      customModes: [
        ThinkingMode.DEDUCTIVE,
        ThinkingMode.BAYESIAN,
        ThinkingMode.GAMETHEORY,
      ],
    });

    for (const insight of response.analysis.primaryInsights) {
      expect(insight.confidenceBasis, insight.sourceMode).toBe('unavailable');
      expect(insight.confidenceNote, insight.sourceMode).toBeTruthy();
      expect(insight.confidence).toBe(UNSCORED_INSIGHT_WEIGHT);
    }
  });

  it('marks the overall score unavailable, with a reason', async () => {
    const response = await analyzer.analyze({
      thought: PROBLEM,
      customModes: [ThinkingMode.DEDUCTIVE, ThinkingMode.BAYESIAN],
    });

    expect(response.analysis.confidenceBasis).toBe('unavailable');
    expect(response.analysis.confidenceNote).toBeTruthy();
  });

  it('says so in the conclusion, the field a caller reads', async () => {
    // `confidenceScore` is required by the tool's output schema and so is still
    // emitted. Without this sentence a caller reads that number as a
    // confidence, which is the whole defect.
    const response = await analyzer.analyze({
      thought: PROBLEM,
      customModes: [ThinkingMode.DEDUCTIVE, ThinkingMode.BAYESIAN],
    });

    expect(response.analysis.synthesizedConclusion).toContain(
      'No confidence was computed',
    );
  });

  it('gives the same unscored weight regardless of mode', async () => {
    // The old confidences ranged 0.68-0.8 by mode, which read as a measurement.
    const response = await analyzer.analyze({
      thought: PROBLEM,
      customModes: [
        ThinkingMode.DEDUCTIVE,
        ThinkingMode.COUNTERFACTUAL,
        ThinkingMode.HISTORICAL,
      ],
    });

    const values = new Set(
      response.analysis.primaryInsights.map((i) => i.confidence),
    );
    expect(values.size).toBe(1);
  });

  it('does not drop an unscored insight through a confidence threshold', async () => {
    // Every merge strategy filtered on `confidence`, and `weighted` multiplied
    // by a mode weight first. The placeholder 0.8 was what cleared those
    // thresholds; the unscored weight does not, so `comprehensive_analysis`
    // (a weighted preset) returned an EMPTY analysis until the merger learned
    // that unscored is not the same as low-confidence.
    const weighted = await analyzer.analyze({
      thought: PROBLEM,
      preset: 'comprehensive_analysis',
    });

    expect(weighted.analysis.primaryInsights.length).toBeGreaterThan(0);

    // `intersection` is excluded on purpose: it keeps only insights two modes
    // agree on, so an empty result there is the correct answer, not a dropped
    // one. It gets its own assertion below.
    for (const strategy of [
      'union',
      'weighted',
      'hierarchical',
      'dialectical',
    ] as const) {
      const response = await analyzer.analyze({
        thought: PROBLEM,
        customModes: [ThinkingMode.DEDUCTIVE, ThinkingMode.BAYESIAN],
        mergeStrategy: strategy,
      });

      expect(
        response.analysis.primaryInsights.length,
        `strategy ${strategy} dropped every unscored insight`,
      ).toBeGreaterThan(0);
    }
  });

  it('empties an intersection by disagreement, not by confidence', async () => {
    const response = await analyzer.analyze({
      thought: PROBLEM,
      customModes: [ThinkingMode.DEDUCTIVE, ThinkingMode.BAYESIAN],
      mergeStrategy: 'intersection',
    });

    // The insights reached the merger and were discarded for not overlapping,
    // which is what intersection means. Had a confidence threshold eaten them,
    // `totalInsightsBefore` would be zero too.
    expect(response.analysis.statistics.totalInsightsBefore).toBeGreaterThan(0);
    expect(response.analysis.primaryInsights).toHaveLength(0);
  });
});
