/**
 * Advisory reasoning-type wrapper
 *
 * `src/taxonomy/` is 69 reasoning types across 12 categories plus a
 * classifier, a navigator and a suggestion engine that, until v9.4.0, nothing
 * outside `src/taxonomy/` imported — while the README and CLAUDE.md advertised
 * "taxonomy-based classification" as a shipped feature. This wrapper is the
 * only entry point the live request path uses, and it mirrors
 * `src/validation/advisory.ts` and `src/proof/advisory.ts`:
 *
 * - it never throws (a broken engine degrades to `available: false`)
 * - it never rejects a request and never alters the `ModeRecommender` verdict
 * - the payload it returns is bounded, and says so when it truncates
 *
 * It degrades in two independent steps. A classifier failure loses only the
 * classification; the suggestions survive it.
 */

import { REASONING_TAXONOMY } from "./reasoning-types.js";
import {
  TaxonomyClassifier,
  type ThoughtClassification,
} from "./classifier.js";
import {
  SuggestionEngine,
  type ProblemCharacteristics as TaxonomyProblemCharacteristics,
  type ReasoningSuggestion,
} from "./suggestion-engine.js";
import type { ProblemCharacteristics as ModeProblemCharacteristics } from "../types/modes/recommendations.js";

/** Maximum reasoning types returned for one request. */
export const MAX_TAXONOMY_SUGGESTIONS = 5;

/** Maximum rationale lines returned per suggested reasoning type. */
export const MAX_TAXONOMY_RATIONALE = 3;

/** Maximum warnings returned per suggested reasoning type. */
export const MAX_TAXONOMY_WARNINGS = 3;

/** Maximum matched keywords echoed back from the classifier. */
export const MAX_TAXONOMY_KEYWORDS = 8;

/**
 * A suggested reasoning type, projected down to what a client can act on.
 *
 * The raw `ReasoningType` carries keywords, aliases, examples, strengths and
 * limitations, and the raw metadata carries eight quality metrics and five
 * further string lists. Returning five of those per request would dwarf the
 * mode recommendation this advice is attached to.
 */
export interface SuggestedReasoningType {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  relevanceScore: number;
  successProbability: number;
  estimatedEffort: string;
  cognitiveLoad: string;
  rationale: string[];
  rationaleTruncated: boolean;
  warnings: string[];
  warningsTruncated: boolean;
}

/** What the classifier made of the free-text problem description. */
export interface ProblemClassification {
  primaryTypeId: string;
  primaryTypeName: string;
  primaryCategory: string;
  confidence: number;
  matchedKeywords: string[];
  secondaryTypeNames: string[];
}

export interface TaxonomyAdviceAvailable {
  available: true;
  classification?: ProblemClassification;
  suggestions: SuggestedReasoningType[];
  totals: {
    suggestions: number;
    taxonomyTypes: number;
    categories: number;
  };
  truncated: {
    suggestions: boolean;
    any: boolean;
  };
}

export interface TaxonomyAdviceUnavailable {
  available: false;
  reason: string;
}

export type TaxonomyAdvice =
  TaxonomyAdviceAvailable | TaxonomyAdviceUnavailable;

/** The problem description, in whichever form `recommend_mode` received it. */
export interface TaxonomyAdviceInput {
  problemType?: string;
  characteristics?: ModeProblemCharacteristics;
}

/**
 * The parts of `src/taxonomy/` this wrapper depends on. Narrow on purpose so
 * tests can substitute an engine without constructing the real taxonomy.
 */
export interface TaxonomyAdviceDeps {
  classifier?: { classifyText(text: string): ThoughtClassification };
  engine?: {
    suggestForProblem(
      characteristics: Partial<TaxonomyProblemCharacteristics>,
    ): ReasoningSuggestion[];
  };
}

const defaultClassifier = new TaxonomyClassifier();
const defaultEngine = new SuggestionEngine();

const CATEGORY_COUNT = new Set(REASONING_TAXONOMY.map((t) => t.category)).size;

/**
 * `ModeRecommender` and the taxonomy describe a problem with different
 * vocabularies. Only four fields have an honest correspondence; the rest of
 * the taxonomy shape is left unset so `suggestForProblem` applies its own
 * defaults rather than a value invented here.
 *
 * @param characteristics - The mode-shaped characteristics `recommend_mode` received
 * @returns The taxonomy-shaped subset that is genuinely known
 */
export function toTaxonomyCharacteristics(
  characteristics: ModeProblemCharacteristics,
): Partial<TaxonomyProblemCharacteristics> {
  const complexity: TaxonomyProblemCharacteristics["complexity"] =
    characteristics.complexity === "low"
      ? "simple"
      : characteristics.complexity === "high"
        ? "complex"
        : "moderate";

  return {
    domain: characteristics.domain,
    complexity,
    // Both shapes use the same low/medium/high scale for uncertainty.
    uncertainty: characteristics.uncertainty,
    dataAvailability: characteristics.hasIncompleteInfo
      ? "limited"
      : "adequate",
  };
}

/** Text the classifier can work from, or `undefined` when there is none. */
function classifiableText(input: TaxonomyAdviceInput): string | undefined {
  const parts = [input.problemType, input.characteristics?.domain].filter(
    (part): part is string =>
      typeof part === "string" && part.trim().length > 0,
  );
  return parts.length > 0 ? parts.join(" ") : undefined;
}

/** Project one engine suggestion, or `undefined` when it is unusable. */
function project(
  suggestion: ReasoningSuggestion,
): SuggestedReasoningType | undefined {
  const type = suggestion?.reasoningType;
  if (!type?.id) return undefined;

  const rationale = suggestion.rationale ?? [];
  const warnings = suggestion.warnings ?? [];

  return {
    id: type.id,
    name: type.name,
    category: type.category,
    difficulty: type.difficulty,
    relevanceScore: suggestion.relevanceScore,
    successProbability: suggestion.successProbability,
    estimatedEffort: suggestion.estimatedEffort,
    cognitiveLoad: suggestion.metadata?.cognitiveLoad ?? "moderate",
    rationale: rationale.slice(0, MAX_TAXONOMY_RATIONALE),
    rationaleTruncated: rationale.length > MAX_TAXONOMY_RATIONALE,
    warnings: warnings.slice(0, MAX_TAXONOMY_WARNINGS),
    warningsTruncated: warnings.length > MAX_TAXONOMY_WARNINGS,
  };
}

/**
 * Suggest reasoning types for a problem and return bounded, non-throwing
 * advice.
 *
 * @param input - The problem description `recommend_mode` received
 * @param deps - Taxonomy engines to use (defaults to the shared instances)
 * @returns Advisory reasoning-type advice; `available: false` if it could not
 *   be produced. Never throws.
 */
export function suggestReasoningTypesAdvisory(
  input: TaxonomyAdviceInput,
  deps: TaxonomyAdviceDeps = {},
): TaxonomyAdvice {
  const text = classifiableText(input);

  if (!input.characteristics && !text) {
    return {
      available: false,
      reason:
        "Reasoning-type advice unavailable: no problem description was supplied.",
    };
  }

  const classifier = deps.classifier ?? defaultClassifier;
  const engine = deps.engine ?? defaultEngine;

  // Classification is best-effort and independently guarded: losing it must
  // not cost the caller the suggestions as well.
  let classification: ProblemClassification | undefined;
  if (text) {
    try {
      const result = classifier.classifyText(text);
      classification = {
        primaryTypeId: result.primaryType.id,
        primaryTypeName: result.primaryType.name,
        primaryCategory: result.primaryCategory,
        confidence: result.confidence,
        matchedKeywords: Array.from(
          new Set(result.matchedKeywords ?? []),
        ).slice(0, MAX_TAXONOMY_KEYWORDS),
        secondaryTypeNames: (result.secondaryTypes ?? [])
          .slice(0, MAX_TAXONOMY_SUGGESTIONS)
          .map((t) => t.name),
      };
    } catch {
      classification = undefined;
    }
  }

  try {
    const characteristics = input.characteristics
      ? toTaxonomyCharacteristics(input.characteristics)
      : { domain: input.problemType };

    const raw = engine.suggestForProblem(characteristics) ?? [];
    const projected = raw
      .map(project)
      .filter((s): s is SuggestedReasoningType => s !== undefined);
    const suggestions = projected.slice(0, MAX_TAXONOMY_SUGGESTIONS);

    const suggestionsTruncated = projected.length > suggestions.length;

    return {
      available: true,
      classification,
      suggestions,
      totals: {
        suggestions: projected.length,
        taxonomyTypes: REASONING_TAXONOMY.length,
        categories: CATEGORY_COUNT,
      },
      truncated: {
        suggestions: suggestionsTruncated,
        any:
          suggestionsTruncated ||
          suggestions.some((s) => s.rationaleTruncated || s.warningsTruncated),
      },
    };
  } catch (error) {
    return {
      available: false,
      reason: `Reasoning-type advice unavailable: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Render the advice as a markdown section for the `recommend_mode` response.
 *
 * @param advice - The advice to render
 * @returns A markdown section, always labelled advisory
 */
export function renderReasoningTypeAdvice(advice: TaxonomyAdvice): string {
  let out = "## Reasoning Types (advisory)\n\n";

  if (!advice.available) {
    return `${out}_${advice.reason}_\n`;
  }

  out +=
    `_Advisory only — this does not change the mode recommendation above. ` +
    `Drawn from ${advice.totals.taxonomyTypes} reasoning types across ` +
    `${advice.totals.categories} categories._\n\n`;

  if (advice.classification) {
    const c = advice.classification;
    out += `**Closest reasoning type**: ${c.primaryTypeName} (${c.primaryCategory}, confidence ${c.confidence.toFixed(2)})\n\n`;
    if (c.secondaryTypeNames.length > 0) {
      out += `**Also implicated**: ${c.secondaryTypeNames.join(", ")}\n\n`;
    }
  }

  if (advice.suggestions.length === 0) {
    out += "_No reasoning type scored above the engine's threshold._\n";
    return out;
  }

  for (const s of advice.suggestions) {
    out += `### ${s.name} (${s.category}, ${s.difficulty})\n`;
    out += `**Success probability**: ${s.successProbability.toFixed(2)} | **Effort**: ${s.estimatedEffort} | **Cognitive load**: ${s.cognitiveLoad}\n\n`;
    for (const line of s.rationale) {
      out += `- ${line}\n`;
    }
    if (s.rationaleTruncated) out += `- _(further rationale omitted)_\n`;
    for (const warning of s.warnings) {
      out += `- ⚠ ${warning}\n`;
    }
    if (s.warningsTruncated) out += `- _(further warnings omitted)_\n`;
    out += "\n";
  }

  if (advice.truncated.suggestions) {
    out += `_Showing ${advice.suggestions.length} of ${advice.totals.suggestions} suggested reasoning types._\n`;
  }

  return out;
}
