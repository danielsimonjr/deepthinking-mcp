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

    // ===== NEW MODES (v7.2.0) =====

    // Engineering reasoning - for design, systems, and implementation problems
    if (characteristics.domain === 'engineering' ||
        characteristics.domain === 'software' ||
        characteristics.domain === 'systems' ||
        (characteristics.requiresQuantification && !characteristics.requiresProof)) {
      recommendations.push({
        mode: ThinkingMode.ENGINEERING,
        score: characteristics.domain === 'engineering' ? 0.92 : 0.85,
        reasoning: 'Problem requires systematic engineering analysis with trade-offs and constraints',
        strengths: ['Requirements analysis', 'Trade-off evaluation', 'System design', 'Failure mode analysis', 'Implementation planning'],
        limitations: ['May over-engineer simple problems', 'Requires domain expertise'],
        examples: ['System architecture', 'Design decisions', 'Performance optimization', 'Reliability analysis', 'Technical debt assessment'],
      });
    }

    // Computability reasoning - for computational limits and algorithmic decidability
    if (characteristics.domain === 'computer science' ||
        characteristics.domain === 'computation' ||
        (characteristics.requiresProof && characteristics.domain.includes('algorithm'))) {
      recommendations.push({
        mode: ThinkingMode.COMPUTABILITY,
        score: 0.88,
        reasoning: 'Problem involves computational complexity, decidability, or algorithmic analysis',
        strengths: ['Turing machine analysis', 'Decidability proofs', 'Complexity classification', 'Halting problem variants'],
        limitations: ['Highly theoretical', 'Requires formal CS background'],
        examples: ['Algorithm decidability', 'Complexity bounds', 'Reduction proofs', 'Computational limits'],
      });
    }

    // Cryptanalytic reasoning - for security, cryptography, and information analysis
    if (characteristics.domain === 'security' ||
        characteristics.domain === 'cryptography' ||
        characteristics.domain.includes('crypto')) {
      recommendations.push({
        mode: ThinkingMode.CRYPTANALYTIC,
        score: 0.90,
        reasoning: 'Problem involves cryptographic analysis, security assessment, or information-theoretic reasoning',
        strengths: ['Statistical analysis', 'Pattern detection', 'Deciban calculations', 'Key space analysis', 'Attack surface evaluation'],
        limitations: ['Specialized domain', 'Requires mathematical background'],
        examples: ['Cipher analysis', 'Protocol security', 'Key management', 'Attack vectors', 'Information leakage'],
      });
    }

    // Recursive reasoning - for self-referential and decomposable problems
    if (characteristics.complexity === 'high' &&
        (characteristics.hasAlternatives || characteristics.requiresExplanation)) {
      recommendations.push({
        mode: ThinkingMode.RECURSIVE,
        score: 0.82,
        reasoning: 'Problem has recursive structure or can be decomposed into smaller similar subproblems',
        strengths: ['Problem decomposition', 'Self-similar analysis', 'Base case identification', 'Recursive patterns'],
        limitations: ['Stack overflow risk in deep recursion', 'May miss non-recursive solutions'],
        examples: ['Divide and conquer', 'Tree traversal', 'Fractal analysis', 'Self-referential problems'],
      });
    }

    // Modal reasoning - for possibility, necessity, and possible worlds
    if (characteristics.hasAlternatives && characteristics.uncertainty === 'high') {
      recommendations.push({
        mode: ThinkingMode.MODAL,
        score: 0.80,
        reasoning: 'Problem involves possibility, necessity, or reasoning about alternative scenarios',
        strengths: ['Possible worlds analysis', 'Necessity vs possibility', 'Epistemic reasoning', 'Deontic analysis'],
        limitations: ['Abstract and theoretical', 'May overcomplicate simple choices'],
        examples: ['Modal logic proofs', 'Necessity analysis', 'Epistemic uncertainty', 'Deontic obligations'],
      });
    }

    // Stochastic reasoning - for probabilistic processes and random events
    if (characteristics.uncertainty === 'high' && characteristics.requiresQuantification) {
      recommendations.push({
        mode: ThinkingMode.STOCHASTIC,
        score: 0.84,
        reasoning: 'Problem involves random processes, probabilistic transitions, or stochastic modeling',
        strengths: ['Markov chains', 'Random process modeling', 'Probabilistic state transitions', 'Monte Carlo methods'],
        limitations: ['Requires probability theory', 'Computationally intensive'],
        examples: ['Queueing systems', 'Random walks', 'Stochastic optimization', 'Process simulation'],
      });
    }

    // Constraint reasoning - for constraint satisfaction and optimization
    if (characteristics.hasAlternatives && characteristics.requiresQuantification) {
      recommendations.push({
        mode: ThinkingMode.CONSTRAINT,
        score: 0.83,
        reasoning: 'Problem involves multiple constraints that must be satisfied simultaneously',
        strengths: ['Constraint propagation', 'Feasibility analysis', 'SAT solving', 'CSP formulation'],
        limitations: ['NP-hard in general', 'May have no solution'],
        examples: ['Scheduling', 'Resource allocation', 'Configuration', 'Puzzle solving'],
      });
    }

    // Optimization reasoning - for finding optimal solutions
    if (characteristics.requiresQuantification && characteristics.hasAlternatives) {
      recommendations.push({
        mode: ThinkingMode.OPTIMIZATION,
        score: 0.86,
        reasoning: 'Problem requires finding optimal or near-optimal solutions from alternatives',
        strengths: ['Objective function formulation', 'Gradient methods', 'Convex optimization', 'Meta-heuristics'],
        limitations: ['Local optima', 'Computational complexity', 'May require relaxation'],
        examples: ['Resource optimization', 'Parameter tuning', 'Portfolio optimization', 'Route planning'],
      });
    }

    // First Principles reasoning - for fundamental analysis from ground truth
    if (isPhilosophical ||
        (characteristics.complexity === 'high' && characteristics.requiresExplanation)) {
      recommendations.push({
        mode: ThinkingMode.FIRSTPRINCIPLES,
        score: isPhilosophical ? 0.88 : 0.82,
        reasoning: 'Problem benefits from breaking down to fundamental truths and building up from there',
        strengths: ['Assumption identification', 'Foundational analysis', 'Novel solutions', 'Deep understanding'],
        limitations: ['Time-intensive', 'May rediscover known solutions', 'Requires broad knowledge'],
        examples: ['Innovation challenges', 'Paradigm shifts', 'Root cause analysis', 'Foundational questions'],
      });
    }

    // Systems Thinking reasoning - for complex interconnected systems
    if (characteristics.complexity === 'high' &&
        (characteristics.timeDependent || characteristics.multiAgent)) {
      recommendations.push({
        mode: ThinkingMode.SYSTEMSTHINKING,
        score: 0.85,
        reasoning: 'Problem involves complex systems with interconnected components and feedback loops',
        strengths: ['Holistic view', 'Feedback loop analysis', 'Emergence detection', 'Leverage point identification'],
        limitations: ['Can be overwhelming', 'Requires system boundaries definition'],
        examples: ['Organizational change', 'Ecosystem analysis', 'Market dynamics', 'Social systems'],
      });
    }

    // Scientific Method reasoning - for empirical investigation
    if (characteristics.hasIncompleteInfo &&
        (characteristics.requiresExplanation || characteristics.requiresQuantification)) {
      recommendations.push({
        mode: ThinkingMode.SCIENTIFICMETHOD,
        score: 0.84,
        reasoning: 'Problem requires systematic empirical investigation and hypothesis testing',
        strengths: ['Hypothesis formulation', 'Experimental design', 'Falsification', 'Reproducibility'],
        limitations: ['Requires data collection', 'Time for experiments', 'May not apply to all domains'],
        examples: ['Research questions', 'A/B testing', 'Empirical studies', 'Data-driven decisions'],
      });
    }

    // Formal Logic reasoning - for rigorous logical analysis
    if (characteristics.requiresProof && !characteristics.requiresQuantification) {
      recommendations.push({
        mode: ThinkingMode.FORMALLOGIC,
        score: 0.87,
        reasoning: 'Problem requires rigorous formal logical analysis and proof construction',
        strengths: ['Propositional logic', 'Predicate logic', 'Proof systems', 'Logical completeness'],
        limitations: ['May be overly formal', 'Limited expressiveness for some domains'],
        examples: ['Formal verification', 'Logical puzzles', 'Argument validity', 'Theorem proving'],
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

    // ===== NEW MODE COMBINATIONS (v7.2.0) =====

    // Engineering + Optimization (for system design with optimal solutions)
    if ((characteristics.domain === 'engineering' || characteristics.domain === 'software') &&
        characteristics.hasAlternatives) {
      combinations.push({
        modes: [ThinkingMode.ENGINEERING, ThinkingMode.OPTIMIZATION],
        sequence: 'sequential',
        rationale: 'Design system architecture, then optimize for performance/cost',
        benefits: ['Structured design', 'Optimal trade-offs', 'Measurable improvements'],
        synergies: ['Engineering constraints feed optimization', 'Optimization validates design choices'],
      });
    }

    // Engineering + Constraint (for constrained design problems)
    if (characteristics.requiresQuantification && characteristics.hasAlternatives &&
        (characteristics.domain === 'engineering' || characteristics.domain === 'software')) {
      combinations.push({
        modes: [ThinkingMode.CONSTRAINT, ThinkingMode.ENGINEERING],
        sequence: 'sequential',
        rationale: 'Identify constraints first, then design within those boundaries',
        benefits: ['Feasibility guaranteed', 'Requirements satisfaction', 'Clear boundaries'],
        synergies: ['Constraints define engineering solution space', 'Engineering validates constraint satisfaction'],
      });
    }

    // First Principles + Systems Thinking (for complex systemic problems)
    if (characteristics.complexity === 'high' && characteristics.requiresExplanation) {
      combinations.push({
        modes: [ThinkingMode.FIRSTPRINCIPLES, ThinkingMode.SYSTEMSTHINKING],
        sequence: 'sequential',
        rationale: 'Build from fundamental truths, then analyze systemic interactions',
        benefits: ['Deep understanding', 'Holistic view', 'Novel insights'],
        synergies: ['First principles reveal core elements', 'Systems thinking shows interconnections'],
      });
    }

    // Scientific Method + Bayesian (for empirical research with uncertainty)
    if (characteristics.hasIncompleteInfo && characteristics.requiresQuantification) {
      combinations.push({
        modes: [ThinkingMode.SCIENTIFICMETHOD, ThinkingMode.BAYESIAN],
        sequence: 'hybrid',
        rationale: 'Design experiments and update beliefs with Bayesian inference',
        benefits: ['Rigorous methodology', 'Quantified uncertainty', 'Evidence integration'],
        synergies: ['Experiments generate evidence', 'Bayesian updates refine hypotheses'],
      });
    }

    // Formal Logic + Deductive (for rigorous proofs)
    if (characteristics.requiresProof && !characteristics.hasIncompleteInfo) {
      combinations.push({
        modes: [ThinkingMode.FORMALLOGIC, ThinkingMode.DEDUCTIVE],
        sequence: 'hybrid',
        rationale: 'Use formal logic systems with deductive derivation',
        benefits: ['Maximum rigor', 'Logically valid conclusions', 'Formal verification'],
        synergies: ['Formal logic provides structure', 'Deduction ensures valid inference'],
      });
    }

    // Recursive + Optimization (for divide-and-conquer optimization)
    if (characteristics.complexity === 'high' && characteristics.hasAlternatives) {
      combinations.push({
        modes: [ThinkingMode.RECURSIVE, ThinkingMode.OPTIMIZATION],
        sequence: 'hybrid',
        rationale: 'Decompose problem recursively, optimize at each level',
        benefits: ['Scalable solutions', 'Local and global optimization', 'Manageable complexity'],
        synergies: ['Recursion breaks down problem', 'Optimization solves subproblems optimally'],
      });
    }

    // Stochastic + Bayesian (for probabilistic modeling)
    if (characteristics.uncertainty === 'high' && characteristics.requiresQuantification) {
      combinations.push({
        modes: [ThinkingMode.STOCHASTIC, ThinkingMode.BAYESIAN],
        sequence: 'parallel',
        rationale: 'Model random processes while updating beliefs probabilistically',
        benefits: ['Complete uncertainty model', 'Dynamic belief updates', 'Probabilistic predictions'],
        synergies: ['Stochastic models generate distributions', 'Bayesian reasoning integrates evidence'],
      });
    }

    // Computability + Formal Logic (for theoretical computer science)
    if (characteristics.domain === 'computer science' && characteristics.requiresProof) {
      combinations.push({
        modes: [ThinkingMode.COMPUTABILITY, ThinkingMode.FORMALLOGIC],
        sequence: 'hybrid',
        rationale: 'Analyze computational limits with formal logical proofs',
        benefits: ['Decidability analysis', 'Rigorous complexity proofs', 'Theoretical foundations'],
        synergies: ['Computability defines limits', 'Formal logic proves properties'],
      });
    }

    // Cryptanalytic + Stochastic (for probabilistic security analysis)
    if (characteristics.domain === 'security' && characteristics.uncertainty === 'high') {
      combinations.push({
        modes: [ThinkingMode.CRYPTANALYTIC, ThinkingMode.STOCHASTIC],
        sequence: 'parallel',
        rationale: 'Analyze cryptographic systems with probabilistic attack modeling',
        benefits: ['Security assessment', 'Attack probability estimation', 'Key space analysis'],
        synergies: ['Cryptanalysis identifies vulnerabilities', 'Stochastic models attack success rates'],
      });
    }

    // Systems Thinking + Engineering (for complex system design)
    if (characteristics.complexity === 'high' &&
        (characteristics.multiAgent || characteristics.timeDependent)) {
      combinations.push({
        modes: [ThinkingMode.SYSTEMSTHINKING, ThinkingMode.ENGINEERING],
        sequence: 'sequential',
        rationale: 'Understand system dynamics holistically, then engineer solutions',
        benefits: ['Holistic design', 'Feedback-aware engineering', 'Emergent behavior consideration'],
        synergies: ['Systems view informs design', 'Engineering implements systemic solutions'],
      });
    }

    // Modal + Counterfactual (for possibility analysis)
    if (characteristics.hasAlternatives && characteristics.uncertainty === 'high') {
      combinations.push({
        modes: [ThinkingMode.MODAL, ThinkingMode.COUNTERFACTUAL],
        sequence: 'parallel',
        rationale: 'Analyze possible worlds and counterfactual scenarios together',
        benefits: ['Complete possibility space', 'What-if analysis', 'Robust decision making'],
        synergies: ['Modal logic structures possibilities', 'Counterfactuals explore specific alternatives'],
      });
    }

    // Metareasoning + Optimization (for strategy optimization)
    if (characteristics.complexity === 'high' && characteristics.hasAlternatives) {
      combinations.push({
        modes: [ThinkingMode.METAREASONING, ThinkingMode.OPTIMIZATION],
        sequence: 'hybrid',
        rationale: 'Monitor reasoning strategies and optimize approach selection',
        benefits: ['Adaptive reasoning', 'Resource optimization', 'Strategy refinement'],
        synergies: ['Metareasoning evaluates strategies', 'Optimization selects best approach'],
      });
    }

    // Metareasoning + Formal Logic + Abductive (for cognitive bias detection and counter-arguments)
    if (characteristics.requiresExplanation && characteristics.hasAlternatives) {
      combinations.push({
        modes: [ThinkingMode.METAREASONING, ThinkingMode.FORMALLOGIC, ThinkingMode.ABDUCTIVE],
        sequence: 'sequential',
        rationale: 'Detect cognitive biases through meta-analysis, identify logical fallacies, and generate alternative explanations as counter-arguments',
        benefits: ['Comprehensive bias detection', 'Fallacy identification', 'Counter-argument generation', 'Critical analysis'],
        synergies: ['Metareasoning identifies reasoning flaws', 'Formal logic validates argument structure', 'Abductive generates alternative explanations'],
      });
    }

    // Metareasoning + Counterfactual (for bias mitigation and alternative perspectives)
    if (characteristics.hasAlternatives && characteristics.uncertainty !== 'low') {
      combinations.push({
        modes: [ThinkingMode.METAREASONING, ThinkingMode.COUNTERFACTUAL],
        sequence: 'parallel',
        rationale: 'Self-reflect on reasoning while exploring alternative scenarios to counter biases',
        benefits: ['Bias awareness', 'Alternative perspective generation', 'Decision robustness'],
        synergies: ['Metareasoning detects bias patterns', 'Counterfactual explores what-if scenarios'],
      });
    }

    return combinations;
  }

  /**
   * Get a simple mode recommendation based on a few key characteristics
   * Simplified version for quick recommendations
   * Supports all 28 reasoning modes (v7.2.0)
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
      'self-evaluation': ThinkingMode.METAREASONING,
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

      // ===== NEW MODES (v7.2.0) =====
      // Engineering reasoning
      'engineering': ThinkingMode.ENGINEERING,
      'design': ThinkingMode.ENGINEERING,
      'architecture': ThinkingMode.ENGINEERING,
      'trade-off': ThinkingMode.ENGINEERING,
      'tradeoff': ThinkingMode.ENGINEERING,
      'system-design': ThinkingMode.ENGINEERING,
      'implementation': ThinkingMode.ENGINEERING,
      'reliability': ThinkingMode.ENGINEERING,
      'scalability': ThinkingMode.ENGINEERING,
      'performance': ThinkingMode.ENGINEERING,

      // Computability reasoning
      'computability': ThinkingMode.COMPUTABILITY,
      'decidability': ThinkingMode.COMPUTABILITY,
      'turing': ThinkingMode.COMPUTABILITY,
      'halting': ThinkingMode.COMPUTABILITY,
      'complexity-class': ThinkingMode.COMPUTABILITY,
      'algorithm-analysis': ThinkingMode.COMPUTABILITY,
      'reduction': ThinkingMode.COMPUTABILITY,
      'np-complete': ThinkingMode.COMPUTABILITY,
      'undecidable': ThinkingMode.COMPUTABILITY,

      // Cryptanalytic reasoning
      'cryptanalysis': ThinkingMode.CRYPTANALYTIC,
      'cryptography': ThinkingMode.CRYPTANALYTIC,
      'security': ThinkingMode.CRYPTANALYTIC,
      'cipher': ThinkingMode.CRYPTANALYTIC,
      'encryption': ThinkingMode.CRYPTANALYTIC,
      'decryption': ThinkingMode.CRYPTANALYTIC,
      'attack-vector': ThinkingMode.CRYPTANALYTIC,
      'key-analysis': ThinkingMode.CRYPTANALYTIC,
      'protocol-security': ThinkingMode.CRYPTANALYTIC,

      // Recursive reasoning
      'recursive': ThinkingMode.RECURSIVE,
      'recursion': ThinkingMode.RECURSIVE,
      'divide-conquer': ThinkingMode.RECURSIVE,
      'self-similar': ThinkingMode.RECURSIVE,
      'decomposition': ThinkingMode.RECURSIVE,
      'fractal': ThinkingMode.RECURSIVE,
      'tree-traversal': ThinkingMode.RECURSIVE,

      // Modal reasoning
      'modal': ThinkingMode.MODAL,
      'possibility': ThinkingMode.MODAL,
      'necessity': ThinkingMode.MODAL,
      'possible-worlds': ThinkingMode.MODAL,
      'epistemic': ThinkingMode.MODAL,
      'deontic': ThinkingMode.MODAL,
      'alethic': ThinkingMode.MODAL,

      // Stochastic reasoning
      'stochastic': ThinkingMode.STOCHASTIC,
      'random-process': ThinkingMode.STOCHASTIC,
      'markov': ThinkingMode.STOCHASTIC,
      'monte-carlo': ThinkingMode.STOCHASTIC,
      'probabilistic-process': ThinkingMode.STOCHASTIC,
      'queueing': ThinkingMode.STOCHASTIC,
      'random-walk': ThinkingMode.STOCHASTIC,

      // Constraint reasoning
      'constraint': ThinkingMode.CONSTRAINT,
      'constraints': ThinkingMode.CONSTRAINT,
      'csp': ThinkingMode.CONSTRAINT,
      'sat': ThinkingMode.CONSTRAINT,
      'scheduling': ThinkingMode.CONSTRAINT,
      'allocation': ThinkingMode.CONSTRAINT,
      'feasibility': ThinkingMode.CONSTRAINT,
      'satisfiability': ThinkingMode.CONSTRAINT,

      // Optimization reasoning
      'optimization': ThinkingMode.OPTIMIZATION,
      'optimize': ThinkingMode.OPTIMIZATION,
      'optimal': ThinkingMode.OPTIMIZATION,
      'minimize': ThinkingMode.OPTIMIZATION,
      'maximize': ThinkingMode.OPTIMIZATION,
      'gradient': ThinkingMode.OPTIMIZATION,
      'convex': ThinkingMode.OPTIMIZATION,
      'heuristic': ThinkingMode.OPTIMIZATION,
      'search': ThinkingMode.OPTIMIZATION,

      // First Principles reasoning
      'first-principles': ThinkingMode.FIRSTPRINCIPLES,
      'fundamental': ThinkingMode.FIRSTPRINCIPLES,
      'foundational': ThinkingMode.FIRSTPRINCIPLES,
      'axiom': ThinkingMode.FIRSTPRINCIPLES,
      'ground-truth': ThinkingMode.FIRSTPRINCIPLES,
      'from-scratch': ThinkingMode.FIRSTPRINCIPLES,
      'basic-principles': ThinkingMode.FIRSTPRINCIPLES,
      'root-cause': ThinkingMode.FIRSTPRINCIPLES,

      // Systems Thinking reasoning
      'systems-thinking': ThinkingMode.SYSTEMSTHINKING,
      'systems': ThinkingMode.SYSTEMSTHINKING,
      'holistic': ThinkingMode.SYSTEMSTHINKING,
      'feedback-loop': ThinkingMode.SYSTEMSTHINKING,
      'emergence': ThinkingMode.SYSTEMSTHINKING,
      'interconnected': ThinkingMode.SYSTEMSTHINKING,
      'ecosystem': ThinkingMode.SYSTEMSTHINKING,
      'leverage-point': ThinkingMode.SYSTEMSTHINKING,

      // Scientific Method reasoning
      'scientific': ThinkingMode.SCIENTIFICMETHOD,
      'experiment': ThinkingMode.SCIENTIFICMETHOD,
      'research': ThinkingMode.SCIENTIFICMETHOD,
      'falsification': ThinkingMode.SCIENTIFICMETHOD,
      'hypothesis-testing': ThinkingMode.SCIENTIFICMETHOD,
      'a/b-testing': ThinkingMode.SCIENTIFICMETHOD,
      'reproducibility': ThinkingMode.SCIENTIFICMETHOD,
      'control-group': ThinkingMode.SCIENTIFICMETHOD,

      // Formal Logic reasoning
      'formal-logic': ThinkingMode.FORMALLOGIC,
      'propositional': ThinkingMode.FORMALLOGIC,
      'predicate': ThinkingMode.FORMALLOGIC,
      'theorem-proving': ThinkingMode.FORMALLOGIC,
      'formal-proof': ThinkingMode.FORMALLOGIC,
      'validity': ThinkingMode.FORMALLOGIC,
      'soundness': ThinkingMode.FORMALLOGIC,
      'completeness': ThinkingMode.FORMALLOGIC,

      // Bias detection and critical analysis
      'bias': ThinkingMode.METAREASONING,
      'bias-detection': ThinkingMode.METAREASONING,
      'cognitive-bias': ThinkingMode.METAREASONING,
      'fallacy': ThinkingMode.FORMALLOGIC,
      'fallacies': ThinkingMode.FORMALLOGIC,
      'logical-fallacy': ThinkingMode.FORMALLOGIC,
      'counter-argument': ThinkingMode.COUNTERFACTUAL,
      'counterargument': ThinkingMode.COUNTERFACTUAL,
      'rebuttal': ThinkingMode.COUNTERFACTUAL,
      'critique': ThinkingMode.METAREASONING,
      'critical-analysis': ThinkingMode.METAREASONING,
      'fact-check': ThinkingMode.EVIDENTIAL,
      'misinformation': ThinkingMode.EVIDENTIAL,
      'disinformation': ThinkingMode.EVIDENTIAL,
      'reasoning-flaw': ThinkingMode.METAREASONING,
      'argument-analysis': ThinkingMode.FORMALLOGIC,
    };

    return typeMap[problemType.toLowerCase()] || ThinkingMode.SEQUENTIAL;
  }
}
