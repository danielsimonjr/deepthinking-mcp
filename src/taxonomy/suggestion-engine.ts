/**
 * Reasoning Type Suggestion Engine with Enhanced Metadata (v3.4.0)
 * Phase 4D Task 7.3 (File Task 20): Enhanced metadata and suggestion system
 */

import { TaxonomyNavigator } from './navigator.js';
import { getReasoningType, type ReasoningType, type ReasoningCategory } from './reasoning-types.js';
import type { ThinkingSession } from '../types/index.js';

/**
 * Cognitive load level
 */
export type CognitiveLoad = 'minimal' | 'low' | 'moderate' | 'high' | 'very_high';

/**
 * Dual-process theory classification
 */
export type DualProcessType =
  | 'system1' // Fast, intuitive, automatic
  | 'system2' // Slow, deliberate, analytical
  | 'hybrid'; // Mix of both

/**
 * Quality metrics for reasoning
 */
export interface QualityMetrics {
  rigor: number; // 0-1: Logical rigor
  creativity: number; // 0-1: Creative thinking
  practicality: number; // 0-1: Practical applicability
  completeness: number; // 0-1: Thoroughness
  clarity: number; // 0-1: Clear communication
  efficiency: number; // 0-1: Time/resource efficiency
  reliability: number; // 0-1: Consistency and reproducibility
  scalability: number; // 0-1: Handles complexity growth
}

/**
 * Enhanced metadata for reasoning types
 */
export interface EnhancedMetadata {
  cognitiveLoad: CognitiveLoad;
  dualProcess: DualProcessType;
  qualityMetrics: QualityMetrics;
  timeComplexity: string; // e.g., "O(n)", "O(n log n)"
  typicalDuration: string; // e.g., "seconds", "minutes", "hours"
  prerequisiteKnowledge: string[];
  commonPitfalls: string[];
  bestPractices: string[];
  contraindications: string[]; // When NOT to use this reasoning type
  synergies: string[]; // Reasoning types that work well together
}

/**
 * Problem characteristics for suggestion
 */
export interface ProblemCharacteristics {
  domain: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
  uncertainty: 'low' | 'medium' | 'high';
  timeConstraints: 'none' | 'loose' | 'moderate' | 'tight' | 'critical';
  stakeholders: number;
  novelty: 'routine' | 'familiar' | 'novel' | 'unprecedented';
  dataAvailability: 'abundant' | 'adequate' | 'limited' | 'scarce';
  reversibility: 'reversible' | 'partially_reversible' | 'irreversible';
  ethicalImplications: 'none' | 'minor' | 'moderate' | 'significant' | 'critical';
}

/**
 * Reasoning suggestion with metadata
 */
export interface ReasoningSuggestion {
  reasoningType: ReasoningType;
  metadata: EnhancedMetadata;
  relevanceScore: number;
  rationale: string[];
  warnings: string[];
  alternatives: string[]; // Alternative reasoning type IDs
  estimatedEffort: string;
  successProbability: number; // 0-1
}

/**
 * Session analysis result
 */
export interface SessionAnalysis {
  session: ThinkingSession;
  totalThoughts: number;
  uniqueModes: number;
  cognitiveLoadProfile: Map<CognitiveLoad, number>;
  dualProcessDistribution: Map<DualProcessType, number>;
  averageQualityMetrics: QualityMetrics;
  modeEffectiveness: Map<string, number>;
  suggestions: ReasoningSuggestion[];
  bottlenecks: string[];
  improvements: string[];
}

/**
 * Enhanced metadata database
 */
const ENHANCED_METADATA_DB: Map<string, EnhancedMetadata> = new Map([
  // DEDUCTIVE REASONING
  [
    'deductive_syllogism',
    {
      cognitiveLoad: 'low',
      dualProcess: 'system2',
      qualityMetrics: {
        rigor: 0.95,
        creativity: 0.2,
        practicality: 0.7,
        completeness: 0.8,
        clarity: 0.9,
        efficiency: 0.8,
        reliability: 0.95,
        scalability: 0.6,
      },
      timeComplexity: 'O(1)',
      typicalDuration: 'seconds',
      prerequisiteKnowledge: ['Basic logic', 'Categorical statements'],
      commonPitfalls: ['Invalid premises', 'Ambiguous middle term', 'Undistributed middle'],
      bestPractices: ['Verify premise truth', 'Check term distribution', 'Use standard forms'],
      contraindications: ['Probabilistic reasoning', 'Continuous variables', 'Uncertain premises'],
      synergies: ['deductive_modus_ponens', 'deductive_universal_instantiation'],
    },
  ],
  [
    'deductive_modus_ponens',
    {
      cognitiveLoad: 'minimal',
      dualProcess: 'system2',
      qualityMetrics: {
        rigor: 1.0,
        creativity: 0.1,
        practicality: 0.9,
        completeness: 0.7,
        clarity: 0.95,
        efficiency: 0.95,
        reliability: 1.0,
        scalability: 0.8,
      },
      timeComplexity: 'O(1)',
      typicalDuration: 'seconds',
      prerequisiteKnowledge: ['Propositional logic', 'Conditional statements'],
      commonPitfalls: ['Affirming the consequent', 'Invalid conditional'],
      bestPractices: ['Verify antecedent', 'Check conditional validity', 'Apply systematically'],
      contraindications: ['Uncertain conditionals', 'Probabilistic statements'],
      synergies: ['deductive_hypothetical', 'deductive_modus_tollens'],
    },
  ],
  [
    'deductive_reductio',
    {
      cognitiveLoad: 'high',
      dualProcess: 'system2',
      qualityMetrics: {
        rigor: 0.95,
        creativity: 0.7,
        practicality: 0.6,
        completeness: 0.9,
        clarity: 0.6,
        efficiency: 0.5,
        reliability: 0.9,
        scalability: 0.7,
      },
      timeComplexity: 'O(n)',
      typicalDuration: 'minutes to hours',
      prerequisiteKnowledge: ['Logic', 'Proof techniques', 'Contradiction recognition'],
      commonPitfalls: ['Weak contradictions', 'Invalid assumptions', 'Circular reasoning'],
      bestPractices: ['Clear assumption statement', 'Rigorous derivation', 'Explicit contradiction'],
      contraindications: ['Constructive proofs needed', 'Time constraints', 'Non-classical logic'],
      synergies: ['mathematical_proof_contradiction', 'deductive_contrapositive'],
    },
  ],

  // INDUCTIVE REASONING
  [
    'inductive_generalization',
    {
      cognitiveLoad: 'low',
      dualProcess: 'hybrid',
      qualityMetrics: {
        rigor: 0.5,
        creativity: 0.6,
        practicality: 0.9,
        completeness: 0.6,
        clarity: 0.8,
        efficiency: 0.9,
        reliability: 0.6,
        scalability: 0.7,
      },
      timeComplexity: 'O(n)',
      typicalDuration: 'minutes',
      prerequisiteKnowledge: ['Pattern recognition', 'Sampling concepts'],
      commonPitfalls: ['Overgeneralization', 'Small sample size', 'Biased samples', 'Hasty generalization'],
      bestPractices: ['Large diverse samples', 'Statistical validation', 'Acknowledge uncertainty'],
      contraindications: ['Deductive certainty needed', 'Small samples', 'High stakes decisions'],
      synergies: ['inductive_statistical', 'inductive_confirmation'],
    },
  ],
  [
    'inductive_statistical',
    {
      cognitiveLoad: 'high',
      dualProcess: 'system2',
      qualityMetrics: {
        rigor: 0.85,
        creativity: 0.3,
        practicality: 0.95,
        completeness: 0.8,
        clarity: 0.7,
        efficiency: 0.6,
        reliability: 0.85,
        scalability: 0.9,
      },
      timeComplexity: 'O(n)',
      typicalDuration: 'hours',
      prerequisiteKnowledge: ['Statistics', 'Sampling theory', 'Hypothesis testing'],
      commonPitfalls: ['Sampling bias', 'P-hacking', 'Confounding variables', 'Simpson\'s paradox'],
      bestPractices: ['Random sampling', 'Power analysis', 'Effect size reporting', 'Preregistration'],
      contraindications: ['Small populations', 'Unsamplable populations', 'Perfect precision needed'],
      synergies: ['probabilistic_bayesian', 'inductive_cross_validation'],
    },
  ],

  // ABDUCTIVE REASONING
  [
    'abductive_inference',
    {
      cognitiveLoad: 'moderate',
      dualProcess: 'hybrid',
      qualityMetrics: {
        rigor: 0.6,
        creativity: 0.8,
        practicality: 0.85,
        completeness: 0.7,
        clarity: 0.75,
        efficiency: 0.8,
        reliability: 0.65,
        scalability: 0.7,
      },
      timeComplexity: 'O(n log n)',
      typicalDuration: 'minutes to hours',
      prerequisiteKnowledge: ['Domain knowledge', 'Explanatory frameworks'],
      commonPitfalls: ['Multiple explanations', 'Confirmation bias', 'Ad hoc explanations'],
      bestPractices: ['Consider alternatives', 'Test explanations', 'Simplicity criterion'],
      contraindications: ['Deductive certainty needed', 'Well-established facts', 'Formal proofs'],
      synergies: ['abductive_diagnostic', 'causal_inference'],
    },
  ],
  [
    'abductive_diagnostic',
    {
      cognitiveLoad: 'moderate',
      dualProcess: 'hybrid',
      qualityMetrics: {
        rigor: 0.7,
        creativity: 0.7,
        practicality: 0.95,
        completeness: 0.75,
        clarity: 0.8,
        efficiency: 0.85,
        reliability: 0.75,
        scalability: 0.65,
      },
      timeComplexity: 'O(n)',
      typicalDuration: 'minutes',
      prerequisiteKnowledge: ['Domain expertise', 'Symptom-cause mappings', 'Differential diagnosis'],
      commonPitfalls: ['Anchoring bias', 'Premature closure', 'Zebras not horses'],
      bestPractices: ['Differential diagnosis', 'Bayesian updating', 'Test hypotheses'],
      contraindications: ['Emergency situations', 'Clear-cut cases', 'Automated diagnosis available'],
      synergies: ['abductive_multiple_hypotheses', 'probabilistic_bayesian'],
    },
  ],

  // ANALOGICAL REASONING
  [
    'analogical_structural',
    {
      cognitiveLoad: 'moderate',
      dualProcess: 'hybrid',
      qualityMetrics: {
        rigor: 0.6,
        creativity: 0.85,
        practicality: 0.8,
        completeness: 0.7,
        clarity: 0.75,
        efficiency: 0.75,
        reliability: 0.6,
        scalability: 0.7,
      },
      timeComplexity: 'O(n²)',
      typicalDuration: 'minutes to hours',
      prerequisiteKnowledge: ['Domain knowledge', 'Pattern recognition', 'Relational thinking'],
      commonPitfalls: ['Superficial similarities', 'Disanalogies', 'False mappings'],
      bestPractices: ['Deep structure focus', 'Multiple analogies', 'Test mappings'],
      contraindications: ['Unique problems', 'Precise solutions needed', 'No analogous domains'],
      synergies: ['analogical_cross_domain', 'creative_synthesis'],
    },
  ],

  // CAUSAL REASONING
  [
    'causal_counterfactual',
    {
      cognitiveLoad: 'high',
      dualProcess: 'system2',
      qualityMetrics: {
        rigor: 0.75,
        creativity: 0.7,
        practicality: 0.7,
        completeness: 0.65,
        clarity: 0.7,
        efficiency: 0.5,
        reliability: 0.7,
        scalability: 0.6,
      },
      timeComplexity: 'O(2^n)',
      typicalDuration: 'hours',
      prerequisiteKnowledge: ['Causal models', 'Modal logic', 'Intervention concepts'],
      commonPitfalls: ['Impossible counterfactuals', 'Nearest possible world ambiguity', 'Hindsight bias'],
      bestPractices: ['Structural causal models', 'Minimal changes', 'Multiple counterfactuals'],
      contraindications: ['Observable outcomes sufficient', 'Computational limits', 'Deterministic systems'],
      synergies: ['causal_inference', 'abductive_contrastive'],
    },
  ],

  // MATHEMATICAL REASONING
  [
    'mathematical_proof_induction',
    {
      cognitiveLoad: 'very_high',
      dualProcess: 'system2',
      qualityMetrics: {
        rigor: 1.0,
        creativity: 0.6,
        practicality: 0.5,
        completeness: 0.95,
        clarity: 0.8,
        efficiency: 0.7,
        reliability: 1.0,
        scalability: 0.8,
      },
      timeComplexity: 'O(1)',
      typicalDuration: 'hours to days',
      prerequisiteKnowledge: ['Mathematical logic', 'Proof techniques', 'Recursion'],
      commonPitfalls: ['Wrong base case', 'Weak inductive step', 'Assuming conclusion'],
      bestPractices: ['Clear base case', 'Strong inductive hypothesis', 'Rigorous step'],
      contraindications: ['Non-inductive structures', 'Continuous mathematics', 'Immediate proofs available'],
      synergies: ['mathematical_constructive', 'deductive_universal_generalization'],
    },
  ],

  // PROBABILISTIC REASONING
  [
    'probabilistic_bayesian',
    {
      cognitiveLoad: 'very_high',
      dualProcess: 'system2',
      qualityMetrics: {
        rigor: 0.95,
        creativity: 0.4,
        practicality: 0.9,
        completeness: 0.9,
        clarity: 0.65,
        efficiency: 0.5,
        reliability: 0.9,
        scalability: 0.7,
      },
      timeComplexity: 'O(n)',
      typicalDuration: 'hours',
      prerequisiteKnowledge: ['Probability theory', 'Conditional probability', 'Bayes theorem'],
      commonPitfalls: ['Prior specification', 'Base rate neglect', 'Computational intractability'],
      bestPractices: ['Sensitivity analysis', 'Conjugate priors', 'MCMC methods'],
      contraindications: ['No prior knowledge', 'Computational limits', 'Frequentist requirements'],
      synergies: ['probabilistic_conditional', 'abductive_probabilistic'],
    },
  ],

  // PRACTICAL REASONING
  [
    'practical_means_ends',
    {
      cognitiveLoad: 'low',
      dualProcess: 'hybrid',
      qualityMetrics: {
        rigor: 0.5,
        creativity: 0.7,
        practicality: 1.0,
        completeness: 0.7,
        clarity: 0.9,
        efficiency: 0.9,
        reliability: 0.7,
        scalability: 0.8,
      },
      timeComplexity: 'O(n)',
      typicalDuration: 'minutes',
      prerequisiteKnowledge: ['Goal setting', 'Planning', 'Resource awareness'],
      commonPitfalls: ['Suboptimal means', 'Unintended consequences', 'Goal displacement'],
      bestPractices: ['Multiple means', 'Cost-benefit analysis', 'Contingency planning'],
      contraindications: ['Ethical constraints', 'Ends unclear', 'Pure exploration'],
      synergies: ['practical_decision_theory', 'practical_strategic'],
    },
  ],

  // CREATIVE REASONING
  [
    'creative_divergent',
    {
      cognitiveLoad: 'moderate',
      dualProcess: 'system1',
      qualityMetrics: {
        rigor: 0.3,
        creativity: 1.0,
        practicality: 0.6,
        completeness: 0.5,
        clarity: 0.6,
        efficiency: 0.8,
        reliability: 0.5,
        scalability: 0.9,
      },
      timeComplexity: 'O(1)',
      typicalDuration: 'minutes',
      prerequisiteKnowledge: ['Open-mindedness', 'Domain knowledge helps'],
      commonPitfalls: ['Quantity over quality', 'Lack of follow-up', 'Premature convergence'],
      bestPractices: ['Defer judgment', 'Build on ideas', 'Wild ideas welcome'],
      contraindications: ['Time pressure', 'Single solution needed', 'Risk-averse environment'],
      synergies: ['creative_convergent', 'creative_synthesis'],
    },
  ],

  // CRITICAL REASONING
  [
    'critical_evaluation',
    {
      cognitiveLoad: 'high',
      dualProcess: 'system2',
      qualityMetrics: {
        rigor: 0.9,
        creativity: 0.5,
        practicality: 0.85,
        completeness: 0.85,
        clarity: 0.8,
        efficiency: 0.6,
        reliability: 0.85,
        scalability: 0.7,
      },
      timeComplexity: 'O(n)',
      typicalDuration: 'minutes to hours',
      prerequisiteKnowledge: ['Logic', 'Argumentation', 'Domain expertise'],
      commonPitfalls: ['Hypercritical', 'Missing forest for trees', 'Bias blind spot'],
      bestPractices: ['Systematic criteria', 'Charitable interpretation', 'Evidence-based'],
      contraindications: ['Creative brainstorming', 'Exploratory phase', 'Fragile relationships'],
      synergies: ['critical_fallacy_detection', 'critical_source_criticism'],
    },
  ],
]);

/**
 * Reasoning type suggestion engine
 */
export class SuggestionEngine {
  private navigator: TaxonomyNavigator;

  constructor() {
    this.navigator = new TaxonomyNavigator();
  }

  /**
   * Get enhanced metadata for reasoning type
   */
  getMetadata(typeId: string): EnhancedMetadata | null {
    return ENHANCED_METADATA_DB.get(typeId) || this.generateDefaultMetadata(typeId);
  }

  /**
   * Generate default metadata if not in database
   */
  private generateDefaultMetadata(typeId: string): EnhancedMetadata | null {
    const type = getReasoningType(typeId);
    if (!type) return null;

    // Heuristics based on category and difficulty
    const cognitiveLoad = this.estimateCognitiveLoad(type.difficulty);
    const dualProcess = this.estimateDualProcess(type.category);

    return {
      cognitiveLoad,
      dualProcess,
      qualityMetrics: this.estimateQualityMetrics(type),
      timeComplexity: 'O(n)',
      typicalDuration: this.estimateDuration(type.difficulty),
      prerequisiteKnowledge: [],
      commonPitfalls: [],
      bestPractices: [],
      contraindications: [],
      synergies: type.relatedTypes,
    };
  }

  /**
   * Estimate cognitive load from difficulty
   */
  private estimateCognitiveLoad(difficulty: string): CognitiveLoad {
    const mapping: Record<string, CognitiveLoad> = {
      beginner: 'low',
      intermediate: 'moderate',
      advanced: 'high',
      expert: 'very_high',
    };
    return mapping[difficulty] || 'moderate';
  }

  /**
   * Estimate dual-process type from category
   */
  private estimateDualProcess(category: ReasoningCategory): DualProcessType {
    const system1Categories: ReasoningCategory[] = ['creative', 'practical'];
    const system2Categories: ReasoningCategory[] = ['deductive', 'mathematical', 'critical'];

    if (system1Categories.includes(category)) return 'system1';
    if (system2Categories.includes(category)) return 'system2';
    return 'hybrid';
  }

  /**
   * Estimate quality metrics
   */
  private estimateQualityMetrics(type: ReasoningType): QualityMetrics {
    const categoryMetrics: Record<ReasoningCategory, Partial<QualityMetrics>> = {
      deductive: { rigor: 0.95, creativity: 0.2, reliability: 0.95 },
      inductive: { rigor: 0.6, creativity: 0.5, practicality: 0.9 },
      abductive: { rigor: 0.6, creativity: 0.8, practicality: 0.85 },
      analogical: { rigor: 0.6, creativity: 0.85, practicality: 0.8 },
      causal: { rigor: 0.75, creativity: 0.6, practicality: 0.8 },
      mathematical: { rigor: 1.0, creativity: 0.5, reliability: 1.0 },
      scientific: { rigor: 0.9, creativity: 0.7, reliability: 0.85 },
      probabilistic: { rigor: 0.9, creativity: 0.4, practicality: 0.85 },
      dialectical: { rigor: 0.7, creativity: 0.7, clarity: 0.6 },
      practical: { rigor: 0.5, creativity: 0.7, practicality: 1.0 },
      creative: { rigor: 0.3, creativity: 1.0, efficiency: 0.8 },
      critical: { rigor: 0.9, creativity: 0.5, completeness: 0.85 },
    };

    const base: QualityMetrics = {
      rigor: 0.5,
      creativity: 0.5,
      practicality: 0.5,
      completeness: 0.5,
      clarity: 0.5,
      efficiency: 0.5,
      reliability: 0.5,
      scalability: 0.5,
    };

    const categoryOverride = categoryMetrics[type.category] || {};
    return { ...base, ...categoryOverride };
  }

  /**
   * Estimate duration from difficulty
   */
  private estimateDuration(difficulty: string): string {
    const mapping: Record<string, string> = {
      beginner: 'seconds to minutes',
      intermediate: 'minutes to hours',
      advanced: 'hours to days',
      expert: 'days to weeks',
    };
    return mapping[difficulty] || 'variable';
  }

  /**
   * Suggest reasoning types for problem
   */
  suggestForProblem(characteristics: Partial<ProblemCharacteristics>): ReasoningSuggestion[] {
    const domain = characteristics.domain || 'general';
    const complexity = characteristics.complexity || 'moderate';

    // Try to get recommendations from navigator
    let results = this.navigator.recommend(domain, {
      difficulty: this.mapComplexityToDifficulty(complexity),
      domain: domain,
    });

    // If no results, fall back to querying by difficulty
    if (results.length === 0) {
      results = this.navigator.query({
        difficulties: [this.mapComplexityToDifficulty(complexity)],
      });
    }

    // If still no results, get all types sorted by relevance
    if (results.length === 0) {
      results = this.navigator.query({});
    }

    const suggestions: ReasoningSuggestion[] = [];

    for (const result of results.slice(0, 10)) {
      const metadata = this.getMetadata(result.type.id);
      if (!metadata) continue;

      const fullCharacteristics: ProblemCharacteristics = {
        domain: domain,
        complexity: complexity,
        uncertainty: characteristics.uncertainty || 'medium',
        timeConstraints: characteristics.timeConstraints || 'moderate',
        stakeholders: characteristics.stakeholders || 1,
        novelty: characteristics.novelty || 'familiar',
        dataAvailability: characteristics.dataAvailability || 'adequate',
        reversibility: characteristics.reversibility || 'reversible',
        ethicalImplications: characteristics.ethicalImplications || 'none',
      };

      const rationale = this.buildRationale(result.type, fullCharacteristics, metadata);
      const warnings = this.buildWarnings(result.type, fullCharacteristics, metadata);
      const alternatives = result.type.relatedTypes.slice(0, 3);
      const effort = this.estimateEffort(metadata, fullCharacteristics);
      const successProb = this.estimateSuccessProbability(result.type, fullCharacteristics, metadata);

      suggestions.push({
        reasoningType: result.type,
        metadata,
        relevanceScore: result.relevanceScore,
        rationale,
        warnings,
        alternatives,
        estimatedEffort: effort,
        successProbability: successProb,
      });
    }

    // Sort by success probability
    suggestions.sort((a, b) => b.successProbability - a.successProbability);

    return suggestions;
  }

  /**
   * Map complexity to difficulty
   */
  private mapComplexityToDifficulty(
    complexity: string
  ): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    const mapping: Record<string, 'beginner' | 'intermediate' | 'advanced' | 'expert'> = {
      simple: 'beginner',
      moderate: 'intermediate',
      complex: 'advanced',
      very_complex: 'expert',
    };
    return mapping[complexity] || 'intermediate';
  }

  /**
   * Build rationale for suggestion
   */
  private buildRationale(
    type: ReasoningType,
    characteristics: ProblemCharacteristics,
    metadata: EnhancedMetadata
  ): string[] {
    const rationale: string[] = [];

    // Category fit
    rationale.push(`${type.category} reasoning suitable for ${characteristics.domain}`);

    // Complexity match
    if (metadata.cognitiveLoad === 'low' && characteristics.timeConstraints === 'tight') {
      rationale.push('Low cognitive load fits tight time constraints');
    }

    // Uncertainty handling
    if (characteristics.uncertainty === 'high' && ['probabilistic', 'abductive'].includes(type.category)) {
      rationale.push('Handles uncertainty well');
    }

    // Quality metrics
    if (metadata.qualityMetrics.practicality > 0.8) {
      rationale.push('High practicality for real-world application');
    }

    return rationale;
  }

  /**
   * Build warnings for suggestion
   */
  private buildWarnings(
    type: ReasoningType,
    characteristics: ProblemCharacteristics,
    metadata: EnhancedMetadata
  ): string[] {
    const warnings: string[] = [];

    if (metadata.cognitiveLoad === 'very_high' && characteristics.timeConstraints === 'tight') {
      warnings.push('High cognitive load may be problematic with tight time constraints');
    }

    if (metadata.qualityMetrics.reliability < 0.7 && characteristics.reversibility === 'irreversible') {
      warnings.push('Low reliability risky for irreversible decisions');
    }

    if (type.difficulty === 'expert' && characteristics.novelty === 'unprecedented') {
      warnings.push('Expert-level reasoning may be challenging for novel problems');
    }

    return warnings;
  }

  /**
   * Estimate effort
   */
  private estimateEffort(metadata: EnhancedMetadata, characteristics: ProblemCharacteristics): string {
    const loadMultiplier = { minimal: 1, low: 2, moderate: 3, high: 4, very_high: 5 };
    const complexityMultiplier = { simple: 1, moderate: 2, complex: 3, very_complex: 4 };

    const effort =
      loadMultiplier[metadata.cognitiveLoad] * complexityMultiplier[characteristics.complexity];

    if (effort <= 2) return 'minimal';
    if (effort <= 6) return 'low';
    if (effort <= 12) return 'moderate';
    if (effort <= 18) return 'high';
    return 'very high';
  }

  /**
   * Estimate success probability
   */
  private estimateSuccessProbability(
    type: ReasoningType,
    characteristics: ProblemCharacteristics,
    metadata: EnhancedMetadata
  ): number {
    let prob = 0.5; // Base probability

    // Difficulty match
    const difficultyMatch = this.mapComplexityToDifficulty(characteristics.complexity) === type.difficulty;
    if (difficultyMatch) prob += 0.2;

    // Quality metrics
    prob += metadata.qualityMetrics.reliability * 0.2;
    prob += metadata.qualityMetrics.practicality * 0.1;

    // Time constraints
    if (metadata.cognitiveLoad === 'minimal' && characteristics.timeConstraints === 'tight') {
      prob += 0.1;
    }

    // Cap at 0.95
    return Math.min(prob, 0.95);
  }

  /**
   * Analyze session
   */
  analyzeSession(session: ThinkingSession): SessionAnalysis {
    const cognitiveLoadProfile = new Map<CognitiveLoad, number>();
    const dualProcessDistribution = new Map<DualProcessType, number>();
    const qualitySum: QualityMetrics = {
      rigor: 0,
      creativity: 0,
      practicality: 0,
      completeness: 0,
      clarity: 0,
      efficiency: 0,
      reliability: 0,
      scalability: 0,
    };

    let count = 0;

    for (const thought of session.thoughts) {
      // Try to map thought mode to reasoning type
      const typeId = this.mapModeToType(thought.mode);
      const metadata = typeId ? this.getMetadata(typeId) : null;

      if (metadata) {
        cognitiveLoadProfile.set(
          metadata.cognitiveLoad,
          (cognitiveLoadProfile.get(metadata.cognitiveLoad) || 0) + 1
        );
        dualProcessDistribution.set(
          metadata.dualProcess,
          (dualProcessDistribution.get(metadata.dualProcess) || 0) + 1
        );

        // Accumulate quality metrics
        for (const key in qualitySum) {
          qualitySum[key as keyof QualityMetrics] += metadata.qualityMetrics[key as keyof QualityMetrics];
        }
        count++;
      }
    }

    // Average quality metrics
    const averageQualityMetrics = { ...qualitySum };
    if (count > 0) {
      for (const key in averageQualityMetrics) {
        averageQualityMetrics[key as keyof QualityMetrics] /= count;
      }
    }

    // Calculate unique modes
    const uniqueModes = new Set(session.thoughts.map(t => t.mode)).size;

    return {
      session,
      totalThoughts: session.thoughts.length,
      uniqueModes,
      cognitiveLoadProfile,
      dualProcessDistribution,
      averageQualityMetrics,
      modeEffectiveness: new Map(),
      suggestions: [],
      bottlenecks: this.identifyBottlenecks(session, cognitiveLoadProfile),
      improvements: this.suggestImprovements(session, averageQualityMetrics),
    };
  }

  /**
   * Map thinking mode to reasoning type
   * Supports all 28 reasoning modes (v7.2.0)
   */
  private mapModeToType(mode: string): string | null {
    const mapping: Record<string, string> = {
      // Core modes
      sequential: 'deductive_modus_ponens',
      shannon: 'scientific_hypothesis_testing',
      mathematics: 'mathematical_proof_induction',
      physics: 'mathematical_constructive_proof',
      hybrid: 'creative_synthesis',

      // Phase 10-11 modes
      engineering: 'practical_means_ends',
      computability: 'mathematical_proof_induction',
      cryptanalytic: 'probabilistic_bayesian',

      // Advanced runtime modes
      metareasoning: 'critical_evaluation',
      recursive: 'deductive_reductio_ad_absurdum',
      modal: 'deductive_hypothetical_syllogism',
      stochastic: 'probabilistic_bayesian',
      constraint: 'practical_means_ends',
      optimization: 'practical_cost_benefit',

      // Fundamental modes
      inductive: 'inductive_generalization',
      deductive: 'deductive_modus_ponens',

      // Experimental modes
      abductive: 'abductive_inference',
      causal: 'causal_counterfactual',
      bayesian: 'probabilistic_bayesian',
      counterfactual: 'causal_counterfactual',
      analogical: 'analogical_structural',
      temporal: 'temporal_sequence_analysis',
      gametheory: 'practical_strategic',
      evidential: 'probabilistic_bayesian',
      firstprinciples: 'deductive_reductio_ad_absurdum',
      systemsthinking: 'creative_synthesis',
      scientificmethod: 'scientific_hypothesis_testing',
      formallogic: 'deductive_modus_ponens',
    };
    return mapping[mode] || null;
  }

  /**
   * Identify bottlenecks
   */
  private identifyBottlenecks(
    session: ThinkingSession,
    cognitiveLoadProfile: Map<CognitiveLoad, number>
  ): string[] {
    const bottlenecks: string[] = [];

    const veryHighCount = cognitiveLoadProfile.get('very_high') || 0;
    if (veryHighCount > session.thoughts.length * 0.5) {
      bottlenecks.push('Over 50% of reasoning has very high cognitive load');
    }

    return bottlenecks;
  }

  /**
   * Suggest improvements
   */
  private suggestImprovements(_session: ThinkingSession, metrics: QualityMetrics): string[] {
    const improvements: string[] = [];

    if (metrics.rigor < 0.6) {
      improvements.push('Consider more rigorous reasoning methods');
    }

    if (metrics.creativity < 0.5) {
      improvements.push('Incorporate creative reasoning techniques');
    }

    if (metrics.efficiency < 0.6) {
      improvements.push('Look for more efficient reasoning approaches');
    }

    return improvements;
  }
}
