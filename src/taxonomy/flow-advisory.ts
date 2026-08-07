/**
 * Advisory multi-modal reasoning-flow wrapper
 *
 * `src/taxonomy/multi-modal-analyzer.ts` — mode transitions, mode
 * combinations, flow complexity, coherence and adaptability — was reachable
 * only from the test suite. The 2026-08-06 taxonomy wiring covered
 * `classifier`, `suggestion-engine` and `reasoning-types` through
 * `recommend_mode`, but that path takes a problem description, not a session,
 * so it had no use for a session-level analyser.
 *
 * `deepthinking_session` action `summarize` does have a session, and it
 * returns markdown, which is exactly what `generateFlowReport` produces. That
 * is the home this analyser needed.
 *
 * Same three rules as the other advisory wrappers: it never throws, it never
 * changes what the summary already said, and its output is bounded with an
 * explicit marker when capped.
 */

import type { ThinkingSession } from "../types/index.js";
import {
  MultiModalAnalyzer,
  type ReasoningFlow,
} from "./multi-modal-analyzer.js";

/**
 * Fewest thoughts a session needs before a flow report says anything. With
 * one thought there is no transition, no combination, and every metric is a
 * constant — a section that adds nothing is worse than no section.
 */
export const MIN_FLOW_THOUGHTS = 2;

/**
 * Maximum characters of flow report appended to a summary.
 *
 * `generateFlowReport` caps its transition list at 10 and its pattern list at
 * 5, but the mode-distribution list is one line per distinct mode, so the
 * report grows with mode variety. This is the hard stop.
 */
export const MAX_FLOW_REPORT_CHARS = 4000;

/** Appended when the report is cut, so a truncated section reads as one. */
export const FLOW_TRUNCATION_MARKER = "\n\n_(reasoning-flow report truncated)_";

/**
 * The part of `src/taxonomy/` this wrapper depends on. Narrow on purpose so a
 * test can substitute an analyser without constructing the real one.
 */
export interface FlowAdvisoryDeps {
  analyzer?: {
    analyzeFlow(session: ThinkingSession): ReasoningFlow;
    generateFlowReport(flow: ReasoningFlow): string;
  };
}

const defaultAnalyzer = new MultiModalAnalyzer();

/**
 * Produce a bounded markdown reasoning-flow report for a session.
 *
 * @param session - The session to analyse
 * @param deps - Analyser to use (defaults to the shared `MultiModalAnalyzer`)
 * @returns Markdown section, or `undefined` when the session is too short to
 *   say anything or the analyser failed. A failure is silent by design: the
 *   summary a client asked for must still be returned.
 */
export function summarizeReasoningFlow(
  session: ThinkingSession,
  deps: FlowAdvisoryDeps = {},
): string | undefined {
  if (!session?.thoughts || session.thoughts.length < MIN_FLOW_THOUGHTS) {
    return undefined;
  }

  try {
    const analyzer = deps.analyzer ?? defaultAnalyzer;
    const flow = analyzer.analyzeFlow(session);
    const report = analyzer.generateFlowReport(flow);

    if (typeof report !== "string" || report.trim().length === 0) {
      return undefined;
    }

    return report.length > MAX_FLOW_REPORT_CHARS
      ? report.slice(0, MAX_FLOW_REPORT_CHARS) + FLOW_TRUNCATION_MARKER
      : report;
  } catch {
    // Advisory: a broken analyser costs the section, never the summary.
    return undefined;
  }
}
