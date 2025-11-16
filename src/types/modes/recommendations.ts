/**
 * Mode Recommendation System (v2.4)
 * Intelligent system to recommend which reasoning modes to use based on problem characteristics
 */

import { ThinkingMode } from '../core.js';

export interface ProblemCharacteristics {
  domain: string;
  complexity: 'low' | 'medium' | 'high';
  uncertainty: 'low' | 'medium' | 'high';
  timeDependent: boolean;
  multiAgent: boolean;
  requiresProof: boolean;
  requiresQuantification: boolean;
  hasIncompleteInfo: boolean;
  requiresExplanation: boolean;
  hasAlternatives: boolean;
}

export interface ModeRecommendation {
  mode: ThinkingMode;
  score: number; // 0-1, how well suited
  reasoning: string;
  strengths: string[];
  limitations: string[];
  examples: string[];
}

export interface CombinationRecommendation {
  modes: ThinkingMode[];
  sequence: 'parallel' | 'sequential' | 'hybrid';
  rationale: string;
  benefits: string[];
  synergies: string[];
}

export class ModeRecommender {
  /**
   * Recommends reasoning modes based on problem characteristics
   * Returns modes ranked by suitability score
   */
  recommendModes(characteristics: ProblemCharacteristics): ModeRecommendation[] {
    const recommendations: ModeRecommendation[] = [];

    // Temporal reasoning
    if (characteristics.timeDependent) {
      recommendations.push({
        mode: ThinkingMode.TEMPORAL,
        score: 0.9,
        reasoning: 'Problem involves time-dependent events and sequences',
        strengths: ['Event sequencing', 'Temporal causality', 'Timeline construction'],
        limitations: ['Limited strategic reasoning'],
        examples: ['Process modeling', 'Event correlation', 'Timeline debugging'],
      });
    }

    // Game theory
    if (characteristics.multiAgent) {
      recommendations.push({
        mode: ThinkingMode.GAMETHEORY,
        score: 0.85,
        reasoning: 'Problem involves strategic interactions between agents',
        strengths: ['Equilibrium analysis', 'Strategic reasoning', 'Multi-agent dynamics'],
        limitations: ['Assumes rationality', 'Complex computations'],
        examples: ['Competitive analysis', 'Auction design', 'Negotiation'],
      });
    }

    // Evidential reasoning
    if (characteristics.hasIncompleteInfo && characteristics.uncertainty === 'high') {
      recommendations.push({
        mode: ThinkingMode.EVIDENTIAL,
        score: 0.88,
        reasoning: 'Problem has incomplete information and high uncertainty',
        strengths: ['Handles ignorance', 'Evidence combination', 'Uncertainty intervals'],
        limitations: ['Computational complexity', 'Requires careful mass assignment'],
        examples: ['Sensor fusion', 'Diagnostic reasoning', 'Intelligence analysis'],
      });
    }

    // Abductive reasoning
    if (characteristics.requiresExplanation) {
      recommendations.push({
        mode: ThinkingMode.ABDUCTIVE,
        score: 0.87,
        reasoning: 'Problem requires finding best explanations',
        strengths: ['Hypothesis generation', 'Root cause analysis', 'Explanation quality'],
        limitations: ['May miss non-obvious explanations'],
        examples: ['Debugging', 'Diagnosis', 'Scientific discovery'],
      });
    }

    // Causal reasoning
    if (characteristics.timeDependent && characteristics.requiresExplanation) {
      recommendations.push({
        mode: ThinkingMode.CAUSAL,
        score: 0.86,
        reasoning: 'Problem requires understanding cause-effect relationships',
        strengths: ['Intervention analysis', 'Causal graphs', 'Impact assessment'],
        limitations: ['Requires domain knowledge', 'Difficult to identify confounders'],
        examples: ['Impact analysis', 'System design', 'Policy evaluation'],
      });
    }

    // Bayesian reasoning
    if (characteristics.requiresQuantification && characteristics.uncertainty !== 'low') {
      recommendations.push({
        mode: ThinkingMode.BAYESIAN,
        score: 0.84,
        reasoning: 'Problem requires probabilistic reasoning with evidence updates',
        strengths: ['Principled uncertainty', 'Evidence integration', 'Prior knowledge'],
        limitations: ['Requires probability estimates', 'Computationally intensive'],
        examples: ['A/B testing', 'Risk assessment', 'Predictive modeling'],
      });
    }

    // Counterfactual reasoning
    if (characteristics.hasAlternatives) {
      recommendations.push({
        mode: ThinkingMode.COUNTERFACTUAL,
        score: 0.82,
        reasoning: 'Problem benefits from analyzing alternative scenarios',
        strengths: ['What-if analysis', 'Post-mortem insights', 'Decision comparison'],
        limitations: ['Speculative', 'Difficult to validate'],
        examples: ['Post-mortems', 'Strategic planning', 'Architecture decisions'],
      });
    }

    // Analogical reasoning
    if (characteristics.complexity === 'high' && characteristics.requiresExplanation) {
      recommendations.push({
        mode: ThinkingMode.ANALOGICAL,
        score: 0.80,
        reasoning: 'Problem can benefit from cross-domain analogies',
        strengths: ['Creative insights', 'Knowledge transfer', 'Pattern recognition'],
        limitations: ['Analogies may be superficial', 'Requires diverse knowledge'],
        examples: ['Novel problem solving', 'Design thinking', 'Innovation'],
      });
    }

    // Mathematical reasoning
    if (characteristics.requiresProof) {
      recommendations.push({
        mode: ThinkingMode.MATHEMATICS,
        score: 0.95,
        reasoning: 'Problem requires formal proofs and symbolic reasoning',
        strengths: ['Rigorous proofs', 'Symbolic computation', 'Theorem proving'],
        limitations: ['Limited to mathematical domains'],
        examples: ['Algorithm correctness', 'Complexity analysis', 'Formal verification'],
      });
    }

    // Physics reasoning
    if (characteristics.domain === 'physics' || characteristics.domain === 'engineering') {
      recommendations.push({
        mode: ThinkingMode.PHYSICS,
        score: 0.90,
        reasoning: 'Problem involves physical systems or tensor mathematics',
        strengths: ['Field theory', 'Conservation laws', 'Tensor analysis'],
        limitations: ['Specialized to physics domains'],
        examples: ['Physical modeling', 'System dynamics', 'Engineering analysis'],
      });
    }

    // Shannon methodology
    if (characteristics.complexity === 'high' && characteristics.requiresProof) {
      recommendations.push({
        mode: ThinkingMode.SHANNON,
        score: 0.88,
        reasoning: 'Complex problem requiring systematic decomposition',
        strengths: ['Systematic approach', 'Problem decomposition', 'Rigorous analysis'],
        limitations: ['Time-intensive', 'Requires discipline'],
        examples: ['Complex system design', 'Research problems', 'Novel algorithms'],
      });
    }

    // Sequential reasoning (default fallback)
    if (recommendations.length === 0) {
      recommendations.push({
        mode: ThinkingMode.SEQUENTIAL,
        score: 0.70,
        reasoning: 'General-purpose iterative reasoning',
        strengths: ['Flexible', 'Adaptable', 'Iterative refinement'],
        limitations: ['May lack structure for complex problems'],
        examples: ['General problem solving', 'Exploration', 'Brainstorming'],
      });
    }

    // Sort by score (highest first)
    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Recommends combinations of reasoning modes that work well together
   */
  recommendCombinations(characteristics: ProblemCharacteristics): CombinationRecommendation[] {
    const combinations: CombinationRecommendation[] = [];

    // Temporal + Causal
    if (characteristics.timeDependent && characteristics.requiresExplanation) {
      combinations.push({
        modes: [ThinkingMode.TEMPORAL, ThinkingMode.CAUSAL],
        sequence: 'sequential',
        rationale: 'Build timeline first, then analyze causal relationships',
        benefits: ['Complete temporal-causal model', 'Root cause with timeline context'],
        synergies: ['Temporal events inform causal nodes', 'Causal edges explain temporal sequences'],
      });
    }

    // Abductive + Bayesian
    if (characteristics.requiresExplanation && characteristics.requiresQuantification) {
      combinations.push({
        modes: [ThinkingMode.ABDUCTIVE, ThinkingMode.BAYESIAN],
        sequence: 'sequential',
        rationale: 'Generate hypotheses, then quantify with probabilities',
        benefits: ['Systematic hypothesis generation', 'Quantified belief updates'],
        synergies: ['Abductive hypotheses become Bayesian hypotheses', 'Bayesian updates refine explanations'],
      });
    }

    // Game Theory + Counterfactual
    if (characteristics.multiAgent && characteristics.hasAlternatives) {
      combinations.push({
        modes: [ThinkingMode.GAMETHEORY, ThinkingMode.COUNTERFACTUAL],
        sequence: 'hybrid',
        rationale: 'Analyze equilibria, then explore alternative strategies',
        benefits: ['Strategic analysis + scenario exploration', 'Robustness testing'],
        synergies: ['Equilibria as actual scenarios', 'Strategy changes as interventions'],
      });
    }

    // Evidential + Causal
    if (characteristics.hasIncompleteInfo && characteristics.timeDependent) {
      combinations.push({
        modes: [ThinkingMode.EVIDENTIAL, ThinkingMode.CAUSAL],
        sequence: 'parallel',
        rationale: 'Combine uncertain evidence while modeling causal structure',
        benefits: ['Handles uncertainty and causality', 'Evidence fusion with causal reasoning'],
        synergies: ['Belief functions inform causal strengths', 'Causal structure guides evidence combination'],
      });
    }

    // Temporal + Game Theory
    if (characteristics.timeDependent && characteristics.multiAgent) {
      combinations.push({
        modes: [ThinkingMode.TEMPORAL, ThinkingMode.GAMETHEORY],
        sequence: 'sequential',
        rationale: 'Model event sequences, then analyze strategic interactions over time',
        benefits: ['Dynamic game analysis', 'Time-dependent strategies'],
        synergies: ['Temporal events as game stages', 'Strategies evolve over timeline'],
      });
    }

    // Analogical + Abductive
    if (characteristics.requiresExplanation && characteristics.complexity === 'high') {
      combinations.push({
        modes: [ThinkingMode.ANALOGICAL, ThinkingMode.ABDUCTIVE],
        sequence: 'parallel',
        rationale: 'Use analogies to inspire hypotheses while systematically generating explanations',
        benefits: ['Creative hypothesis generation', 'Cross-domain insights'],
        synergies: ['Analogies suggest hypotheses', 'Hypotheses validated by analogical reasoning'],
      });
    }

    // Mathematics + Shannon (for complex proofs)
    if (characteristics.requiresProof && characteristics.complexity === 'high') {
      combinations.push({
        modes: [ThinkingMode.SHANNON, ThinkingMode.MATHEMATICS],
        sequence: 'hybrid',
        rationale: 'Use Shannon methodology to structure complex mathematical proofs',
        benefits: ['Systematic proof construction', 'Clear problem decomposition'],
        synergies: ['Shannon stages guide proof strategy', 'Mathematical rigor validates each stage'],
      });
    }

    return combinations;
  }

  /**
   * Get a simple mode recommendation based on a few key characteristics
   * Simplified version for quick recommendations
   */
  quickRecommend(problemType: string): ThinkingMode {
    const typeMap: Record<string, ThinkingMode> = {
      'debugging': ThinkingMode.ABDUCTIVE,
      'proof': ThinkingMode.MATHEMATICS,
      'timeline': ThinkingMode.TEMPORAL,
      'strategy': ThinkingMode.GAMETHEORY,
      'uncertainty': ThinkingMode.EVIDENTIAL,
      'causality': ThinkingMode.CAUSAL,
      'probability': ThinkingMode.BAYESIAN,
      'what-if': ThinkingMode.COUNTERFACTUAL,
      'analogy': ThinkingMode.ANALOGICAL,
      'physics': ThinkingMode.PHYSICS,
      'systematic': ThinkingMode.SHANNON,
    };

    return typeMap[problemType.toLowerCase()] || ThinkingMode.SEQUENTIAL;
  }
}
