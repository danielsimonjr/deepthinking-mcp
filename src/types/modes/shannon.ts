/**
 * Shannon Methodology Mode - Type Definitions
 * Systematic 5-stage problem-solving approach inspired by Claude Shannon
 */

import { BaseThought, ThinkingMode, ShannonStage } from "../core.js";

// Re-export for convenience
export { ShannonStage };

/**
 * A thought in Shannon mode.
 * It records the stage, uncertainty and assumptions of the step.
 */
export interface ShannonThought extends BaseThought {
  mode: ThinkingMode.SHANNON;
  stage: ShannonStage;
  uncertainty: number; // 0-1
  dependencies: string[]; // Dependencies on other thoughts or information
  assumptions: string[]; // Explicit assumptions made

  // Rechecking and validation
  recheckStep?: {
    stepToRecheck: string;
    reason: string;
    newInformation?: string;
  };

  // Confidence assessment
  confidenceFactors?: {
    dataQuality: number; // 0-1
    methodologyRobustness: number; // 0-1
    assumptionValidity: number; // 0-1
  };

  // Alternative exploration
  alternativeApproaches?: string[];
  knownLimitations?: string[];
}

/**
 * Check whether a thought is in Shannon mode.
 * Returns true when the mode field is shannon.
 */
export function isShannonThought(
  thought: BaseThought,
): thought is ShannonThought {
  return thought.mode === "shannon";
}
