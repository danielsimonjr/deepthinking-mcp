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

    // Core reasoning modes - prioritize for philosophical/metaphysical domains
    const isPhilosophical = characteristics.domain.toLowerCase().includes('metaphysics') ||
                           characteristics.domain.toLowerCase().includes('theology') ||
                           characteristics.domain.toLowerCase().includes('philosophy') ||
                           characteristics.domain.toLowerCase().includes('epistemology') ||
                           characteristics.domain.toLowerCase().includes('ethics');

    // Hybrid mode - for complex multi-faceted problems
    if (characteristics.complexity === 'high' &&
        (characteristics.requiresExplanation || characteristics.hasAlternatives || isPhilosophical)) {
      recommendations.push({
        mode: ThinkingMode.HYBRID,
        score: 0.92,
        reasoning: 'Complex problem benefits from multi-modal synthesis combining inductive, deductive, and abductive reasoning',
        strengths: ['Comprehensive analysis', 'Combines empirical and logical approaches', 'Maximum evidential strength', 'Convergent validation'],
        limitations: ['Time-intensive', 'Requires understanding of multiple reasoning types'],
        examples: ['Philosophical arguments', 'Scientific theories', 'Complex decision-making', 'Metaphysical questions'],
      });
    }

    // Inductive reasoning - pattern recognition and generalization
    if (!characteristics.requiresProof &&
        (characteristics.requiresQuantification || characteristics.hasIncompleteInfo || isPhilosophical)) {
      recommendations.push({
        mode: ThinkingMode.INDUCTIVE,
        score: isPhilosophical ? 0.85 : 0.80,
        reasoning: 'Problem requires pattern recognition and generalization from observations',
        strengths: ['Empirical grounding', 'Pattern detection', 'Probabilistic reasoning', 'Scientific discovery'],
        limitations: ['Cannot prove with certainty', 'Vulnerable to black swans', 'Sample size dependent'],
        examples: ['Scientific hypotheses', 'Trend analysis', 'Empirical arguments', 'Data-driven insights'],
      });
    }

    // Deductive reasoning - logical derivation from principles
    if (characteristics.requiresProof || isPhilosophical) {
      recommendations.push({
        mode: ThinkingMode.DEDUCTIVE,
        score: characteristics.requiresProof ? 0.90 : 0.75,
        reasoning: 'Problem requires logical derivation from general principles to specific conclusions',
        strengths: ['Logical validity', 'Rigorous inference', 'Exposes contradictions', 'Formal reasoning'],
        limitations: ['Soundness depends on premise truth', 'Vulnerable to definitional disputes', 'May not handle uncertainty well'],
        examples: ['Logical proofs', 'Mathematical theorems', 'Philosophical arguments', 'Formal verification'],
      });
    }

    // Abductive reasoning - inference to best explanation
    if (characteristics.requiresExplanation || isPhilosophical) {
      recommendations.push({
        mode: ThinkingMode.ABDUCTIVE,
        score: isPhilosophical ? 0.90 : 0.87,
        reasoning: 'Problem requires finding best explanations through comparative hypothesis evaluation',
        strengths: ['Hypothesis generation', 'Comparative evaluation', 'Explanatory power assessment', 'Handles competing theories'],
        limitations: ['May miss non-obvious explanations', 'Explanatory power is subjective'],
        examples: ['Scientific explanation', 'Debugging', 'Diagnosis', 'Theory selection', 'Metaphysical arguments'],
      });
    }

    // Meta-reasoning - reasoning about reasoning itself
    if (characteristics.complexity === 'high' ||
        (characteristics.hasAlternatives && characteristics.uncertainty === 'high')) {
      recommendations.push({
        mode: ThinkingMode.METAREASONING,
        score: characteristics.complexity === 'high' ? 0.88 : 0.82,
        reasoning: 'Complex or uncertain problems benefit from strategic monitoring and adaptive reasoning',
        strengths: ['Strategy evaluation', 'Mode switching recommendations', 'Quality monitoring', 'Resource allocation', 'Self-reflection'],
        limitations: ['Meta-level overhead', 'Requires understanding of other modes', 'May not directly solve the problem'],
        examples: ['Strategy selection', 'Debugging stuck reasoning', 'Quality assessment', 'Adaptive problem-solving'],
      });
    }

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
    if (characteristics.hasIncompleteInfo && characteristics.uncertainty === 'high' && !isPhilosophical) {
      recommendations.push({
        mode: ThinkingMode.EVIDENTIAL,
        score: 0.82,
        reasoning: 'Problem has incomplete information and high uncertainty requiring Dempster-Shafer belief functions',
        strengths: ['Handles ignorance', 'Evidence combination', 'Uncertainty intervals'],
        limitations: ['Computational complexity', 'Requires careful mass assignment', 'Better for sensor fusion than philosophical reasoning'],
        examples: ['Sensor fusion', 'Diagnostic reasoning', 'Intelligence analysis'],
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

    const isPhilosophical = characteristics.domain.toLowerCase().includes('metaphysics') ||
                           characteristics.domain.toLowerCase().includes('theology') ||
                           characteristics.domain.toLowerCase().includes('philosophy') ||
                           characteristics.domain.toLowerCase().includes('epistemology') ||
                           characteristics.domain.toLowerCase().includes('ethics');

    // Inductive + Deductive + Abductive (Hybrid) - for philosophical/complex problems
    if (isPhilosophical || (characteristics.complexity === 'high' && characteristics.requiresExplanation && characteristics.hasAlternatives)) {
      combinations.push({
        modes: [ThinkingMode.INDUCTIVE, ThinkingMode.DEDUCTIVE, ThinkingMode.ABDUCTIVE],
        sequence: 'hybrid',
        rationale: 'Synthesize empirical patterns, logical derivations, and explanatory hypotheses for maximum evidential strength',
        benefits: ['Convergent validation from three independent methods', 'Empirical grounding + logical rigor + explanatory power', 'Highest achievable confidence through multi-modal synthesis', 'Exposes both empirical patterns and logical contradictions'],
        synergies: ['Inductive patterns inform abductive hypotheses', 'Deductive logic tests hypothesis validity', 'Abductive explanations guide inductive search', 'All three methods converge on same conclusion'],
      });
    }

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
      // Core reasoning modes
      'explanation': ThinkingMode.ABDUCTIVE,
      'hypothesis': ThinkingMode.ABDUCTIVE,
      'inference': ThinkingMode.ABDUCTIVE,
      'pattern': ThinkingMode.INDUCTIVE,
      'generalization': ThinkingMode.INDUCTIVE,
      'empirical': ThinkingMode.INDUCTIVE,
      'logic': ThinkingMode.DEDUCTIVE,
      'proof': ThinkingMode.DEDUCTIVE,
      'derivation': ThinkingMode.DEDUCTIVE,
      'complex': ThinkingMode.HYBRID,
      'synthesis': ThinkingMode.HYBRID,
      'philosophical': ThinkingMode.HYBRID,
      'metaphysical': ThinkingMode.HYBRID,
      // Meta-reasoning
      'meta': ThinkingMode.METAREASONING,
      'strategy-selection': ThinkingMode.METAREASONING,
      'quality-assessment': ThinkingMode.METAREASONING,
      'reflection': ThinkingMode.METAREASONING,
      // Specialized modes
      'debugging': ThinkingMode.ABDUCTIVE,
      'mathematical': ThinkingMode.MATHEMATICS,
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
