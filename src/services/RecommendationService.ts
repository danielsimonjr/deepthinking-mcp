/**
 * Recommendation service
 *
 * Builds the `recommend_mode` response. Extracted from `src/index.ts` so the
 * response can be tested: `src/index.ts` calls `main()` at module scope, so
 * importing it from a test starts an MCP server on stdio. That untestability
 * is why the taxonomy could sit unreferenced behind this action for so long.
 *
 * The `ModeRecommender` verdict is authoritative and unchanged. Reasoning-type
 * advice from `src/taxonomy/` is APPENDED to it, never substituted for it, and
 * a caller can opt out with `includeReasoningTypes: false`.
 */

import {
  ModeRecommender,
  type ProblemCharacteristics,
} from "../types/modes/recommendations.js";
import {
  renderReasoningTypeAdvice,
  suggestReasoningTypesAdvisory,
} from "../taxonomy/advisory.js";

const modeRecommender = new ModeRecommender();

/** The `recommend_mode` inputs this service reads. */
export interface RecommendModeInput {
  problemType?: string;
  problemCharacteristics?: ProblemCharacteristics;
  includeCombinations?: boolean;
  /** Defaults to true; `false` returns the pre-taxonomy response verbatim. */
  includeReasoningTypes?: boolean;
}

/**
 * Append advisory reasoning-type advice to a recommendation.
 *
 * Advice is additive: on any failure the recommendation is returned unchanged.
 */
function withReasoningTypes(
  response: string,
  input: RecommendModeInput,
): string {
  if (input.includeReasoningTypes === false) return response;

  const advice = suggestReasoningTypesAdvisory({
    problemType: input.problemType,
    characteristics: input.problemCharacteristics,
  });

  return `${response}\n${renderReasoningTypeAdvice(advice)}`;
}

/**
 * Build the `recommend_mode` response text.
 *
 * @param input - The validated session-action input
 * @returns Markdown describing the recommended modes
 * @throws When neither `problemType` nor `problemCharacteristics` is supplied
 */
export function buildModeRecommendation(input: RecommendModeInput): string {
  const { problemType, problemCharacteristics, includeCombinations } = input;

  // Quick recommendation based on problem type
  if (problemType && !problemCharacteristics) {
    const recommendedMode = modeRecommender.quickRecommend(problemType);
    const response = `Quick recommendation for "${problemType}":\n\n**Recommended Mode**: ${recommendedMode}\n\nFor more detailed recommendations, provide problemCharacteristics.`;

    return withReasoningTypes(response, input);
  }

  // Comprehensive recommendations based on problem characteristics
  if (problemCharacteristics) {
    const modeRecs = modeRecommender.recommendModes(problemCharacteristics);
    const combinationRecs = includeCombinations
      ? modeRecommender.recommendCombinations(problemCharacteristics)
      : [];

    let response = "# Mode Recommendations\n\n";

    // Single mode recommendations
    response += "## Individual Modes\n\n";
    for (const rec of modeRecs) {
      response += `### ${rec.mode} (Score: ${rec.score})\n`;
      response += `**Reasoning**: ${rec.reasoning}\n\n`;
      response += `**Strengths**:\n`;
      for (const strength of rec.strengths) {
        response += `- ${strength}\n`;
      }
      response += `\n**Limitations**:\n`;
      for (const limitation of rec.limitations) {
        response += `- ${limitation}\n`;
      }
      response += `\n**Examples**: ${rec.examples.join(", ")}\n\n`;
      response += "---\n\n";
    }

    // Mode combinations
    if (combinationRecs.length > 0) {
      response += "## Recommended Mode Combinations\n\n";
      for (const combo of combinationRecs) {
        response += `### ${combo.modes.join(" + ")} (${combo.sequence})\n`;
        response += `**Rationale**: ${combo.rationale}\n\n`;
        response += `**Benefits**:\n`;
        for (const benefit of combo.benefits) {
          response += `- ${benefit}\n`;
        }
        response += `\n**Synergies**:\n`;
        for (const synergy of combo.synergies) {
          response += `- ${synergy}\n`;
        }
        response += "\n---\n\n";
      }
    }

    return withReasoningTypes(response, input);
  }

  // No valid input provided - throw error for consistent error handling
  throw new Error(
    "Please provide either problemType or problemCharacteristics for mode recommendations.",
  );
}
