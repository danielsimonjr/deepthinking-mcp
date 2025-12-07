/**
 * Adaptive Mode Selector with Taxonomy Insights (v3.4.0)
 * Phase 4D Task 7.5 (File Task 22): Intelligent mode selection
 */

import { SuggestionEngine, type ProblemCharacteristics, type EnhancedMetadata } from './suggestion-engine.js';
import { MultiModalAnalyzer } from './multi-modal-analyzer.js';
import { ThinkingMode } from '../types/core.js';
import type { ThinkingSession, Thought } from '../types/index.js';

/**
 * Selection context
 */
export interface SelectionContext {
  problem: string;
  characteristics?: Partial<ProblemCharacteristics>;
  currentSession?: ThinkingSession;
  constraints?: {
    maxCognitiveLoad?: 'low' | 'moderate' | 'high' | 'very_high';
    timeLimit?: number; // minutes
    requireRigor?: boolean;
    allowCreative?: boolean;
    mustBeReliable?: boolean;
  };
  userPreferences?: {
    preferredModes?: ThinkingMode[];
    avoidModes?: ThinkingMode[];
    experienceLevel?: 'novice' | 'intermediate' | 'expert';
  };
  history?: {
    recentModes?: ThinkingMode[];
    successfulPatterns?: string[];
    failedApproaches?: string[];
  };
}

/**
 * Mode recommendation
 */
export interface ModeRecommendation {
  mode: ThinkingMode;
  confidence: number; // 0-1
  reasoning: string[];
  expectedBenefits: string[];
  potentialRisks: string[];
  prerequisites: string[];
  alternatives: ThinkingMode[];
  estimatedDuration: string;
  cognitiveLoad: string;
}

/**
 * Selection strategy
 */
export type SelectionStrategy =
  | 'best_match' // Single best mode for problem
  | 'multi_modal' // Sequence of modes
  | 'adaptive' // Dynamic based on progress
  | 'conservative' // Safe, reliable choice
  | 'exploratory' // Novel, creative approach
  | 'balanced'; // Mix of rigor and creativity

/**
 * Adaptation trigger
 */
export interface AdaptationTrigger {
  condition: string;
  threshold: number;
  newMode: ThinkingMode;
  reason: string;
}

/**
 * Learning from session
 */
export interface SessionLearning {
  session: ThinkingSession;
  effectiveModes: ThinkingMode[];
  ineffectiveModes: ThinkingMode[];
  optimalTransitions: Array<{ from: ThinkingMode; to: ThinkingMode }>;
  insights: string[];
  futureRecommendations: string[];
}

/**
 * Adaptive mode selector
 */
export class AdaptiveModeSelector {
  private suggestionEngine: SuggestionEngine;
  private multiModalAnalyzer: MultiModalAnalyzer;
  private sessionHistory: Map<string, SessionLearning>;

  constructor() {
    this.suggestionEngine = new SuggestionEngine();
    this.multiModalAnalyzer = new MultiModalAnalyzer();
    this.sessionHistory = new Map();
  }

  /**
   * Select mode for context
   */
  selectMode(context: SelectionContext, strategy: SelectionStrategy = 'best_match'): ModeRecommendation[] {
    switch (strategy) {
      case 'best_match':
        return this.selectBestMatch(context);
      case 'multi_modal':
        return this.selectMultiModal(context);
      case 'adaptive':
        return this.selectAdaptive(context);
      case 'conservative':
        return this.selectConservative(context);
      case 'exploratory':
        return this.selectExploratory(context);
      case 'balanced':
        return this.selectBalanced(context);
      default:
        return this.selectBestMatch(context);
    }
  }

  /**
   * Select best matching mode
   */
  private selectBestMatch(context: SelectionContext): ModeRecommendation[] {
    const characteristics = this.buildCharacteristics(context);
    const suggestions = this.suggestionEngine.suggestForProblem(characteristics);

    const recommendations: ModeRecommendation[] = [];

    for (const suggestion of suggestions.slice(0, 5)) {
      const mode = this.mapReasoningTypeToMode(suggestion.reasoningType.id);
      if (!mode) continue;

      // Apply constraints
      if (!this.satisfiesConstraints(suggestion.metadata, context.constraints)) continue;

      // Check user preferences
      if (!this.matchesPreferences(mode, context.userPreferences)) continue;

      recommendations.push({
        mode,
        confidence: suggestion.successProbability,
        reasoning: suggestion.rationale,
        expectedBenefits: this.extractBenefits(suggestion),
        potentialRisks: suggestion.warnings,
        prerequisites: suggestion.metadata.prerequisiteKnowledge,
        alternatives: suggestion.alternatives.map(id => this.mapReasoningTypeToMode(id)!).filter(Boolean),
        estimatedDuration: suggestion.metadata.typicalDuration,
        cognitiveLoad: suggestion.metadata.cognitiveLoad,
      });
    }

    return recommendations;
  }

  /**
   * Select multi-modal sequence
   */
  private selectMultiModal(context: SelectionContext): ModeRecommendation[] {
    const currentModes = context.currentSession?.thoughts.map(t => t.mode) || [];
    const patterns = this.multiModalAnalyzer.recommendPatterns(context.problem, currentModes);

    if (patterns.length === 0) {
      return this.selectBestMatch(context);
    }

    const bestPattern = patterns[0].pattern;
    const recommendations: ModeRecommendation[] = [];

    for (const mode of bestPattern.modeSequence) {
      recommendations.push({
        mode: mode as ThinkingMode,
        confidence: bestPattern.effectiveness * patterns[0].relevanceScore,
        reasoning: [
          `Part of ${bestPattern.name} pattern`,
          bestPattern.description,
          ...patterns[0].rationale,
        ],
        expectedBenefits: [`Pattern effectiveness: ${(bestPattern.effectiveness * 100).toFixed(0)}%`],
        potentialRisks: [],
        prerequisites: bestPattern.prerequisites,
        alternatives: [],
        estimatedDuration: 'varies',
        cognitiveLoad: 'varies',
      });
    }

    return recommendations;
  }

  /**
   * Select adaptive mode (switches during session)
   */
  private selectAdaptive(context: SelectionContext): ModeRecommendation[] {
    if (!context.currentSession) {
      return this.selectBestMatch(context);
    }

    const flow = this.multiModalAnalyzer.analyzeFlow(context.currentSession);

    // Check if current mode is working
    const currentMode = context.currentSession.mode;
    const recentThoughts = context.currentSession.thoughts.slice(-3);
    const stagnation = this.detectStagnation(recentThoughts);

    if (stagnation) {
      // Suggest mode switch
      const alternatives = this.suggestAlternatives(currentMode, context);
      return alternatives;
    }

    // Check if pattern suggests next mode
    if (flow.combinations.length > 0) {
      const topPattern = flow.combinations[0];
      const currentIndex = topPattern.typicalSequence.indexOf(currentMode);

      if (currentIndex >= 0 && currentIndex < topPattern.typicalSequence.length - 1) {
        const nextMode = topPattern.typicalSequence[currentIndex + 1];
        return [
          {
            mode: nextMode,
            confidence: topPattern.synergy,
            reasoning: [`Natural progression in detected pattern`, `Current: ${currentMode} → Next: ${nextMode}`],
            expectedBenefits: ['Follows successful pattern', 'High synergy'],
            potentialRisks: [],
            prerequisites: [],
            alternatives: [],
            estimatedDuration: 'varies',
            cognitiveLoad: 'varies',
          },
        ];
      }
    }

    // Continue with current mode
    return [
      {
        mode: currentMode,
        confidence: 0.8,
        reasoning: ['Current mode is effective', 'No stagnation detected'],
        expectedBenefits: ['Consistency', 'Momentum'],
        potentialRisks: [],
        prerequisites: [],
        alternatives: [],
        estimatedDuration: 'varies',
        cognitiveLoad: 'varies',
      },
    ];
  }

  /**
   * Select conservative mode
   */
  private selectConservative(context: SelectionContext): ModeRecommendation[] {
    const characteristics = this.buildCharacteristics(context);
    const suggestions = this.suggestionEngine.suggestForProblem(characteristics);

    // Filter for high reliability and rigor
    const conservative = suggestions.filter(
      s => s.metadata.qualityMetrics.reliability > 0.8 && s.metadata.qualityMetrics.rigor > 0.8
    );

    if (conservative.length === 0) {
      return this.selectBestMatch(context);
    }

    const best = conservative[0];
    const mode = this.mapReasoningTypeToMode(best.reasoningType.id);

    if (!mode) return this.selectBestMatch(context);

    return [
      {
        mode,
        confidence: best.successProbability,
        reasoning: [
          'Conservative choice',
          `High reliability: ${(best.metadata.qualityMetrics.reliability * 100).toFixed(0)}%`,
          `High rigor: ${(best.metadata.qualityMetrics.rigor * 100).toFixed(0)}%`,
        ],
        expectedBenefits: ['Reliable results', 'Rigorous reasoning'],
        potentialRisks: ['May be slower', 'Less creative'],
        prerequisites: best.metadata.prerequisiteKnowledge,
        alternatives: [],
        estimatedDuration: best.metadata.typicalDuration,
        cognitiveLoad: best.metadata.cognitiveLoad,
      },
    ];
  }

  /**
   * Select exploratory mode
   */
  private selectExploratory(context: SelectionContext): ModeRecommendation[] {
    const characteristics = this.buildCharacteristics(context);
    const suggestions = this.suggestionEngine.suggestForProblem(characteristics);

    // Filter for high creativity
    const exploratory = suggestions.filter(s => s.metadata.qualityMetrics.creativity > 0.7);

    if (exploratory.length === 0) {
      // Default to creative mode
      return [
        {
          mode: 'creative' as ThinkingMode,
          confidence: 0.7,
          reasoning: ['Exploratory approach', 'Encourages novel solutions'],
          expectedBenefits: ['Novel insights', 'Unconventional approaches'],
          potentialRisks: ['Less reliable', 'May need validation'],
          prerequisites: [],
          alternatives: [],
          estimatedDuration: 'minutes',
          cognitiveLoad: 'moderate',
        },
      ];
    }

    const best = exploratory[0];
    const mode = this.mapReasoningTypeToMode(best.reasoningType.id);

    if (!mode) return this.selectBestMatch(context);

    return [
      {
        mode,
        confidence: best.successProbability,
        reasoning: [
          'Exploratory choice',
          `High creativity: ${(best.metadata.qualityMetrics.creativity * 100).toFixed(0)}%`,
        ],
        expectedBenefits: ['Creative solutions', 'Novel approaches'],
        potentialRisks: ['May need refinement', 'Lower reliability'],
        prerequisites: best.metadata.prerequisiteKnowledge,
        alternatives: [],
        estimatedDuration: best.metadata.typicalDuration,
        cognitiveLoad: best.metadata.cognitiveLoad,
      },
    ];
  }

  /**
   * Select balanced mode
   */
  private selectBalanced(context: SelectionContext): ModeRecommendation[] {
    const characteristics = this.buildCharacteristics(context);
    const suggestions = this.suggestionEngine.suggestForProblem(characteristics);

    // Find modes with balanced metrics
    const balanced = suggestions.filter(
      s =>
        Math.abs(s.metadata.qualityMetrics.rigor - 0.7) < 0.2 &&
        Math.abs(s.metadata.qualityMetrics.creativity - 0.6) < 0.2
    );

    if (balanced.length > 0) {
      const best = balanced[0];
      const mode = this.mapReasoningTypeToMode(best.reasoningType.id);

      if (mode) {
        return [
          {
            mode,
            confidence: best.successProbability,
            reasoning: ['Balanced approach', 'Combines rigor and creativity'],
            expectedBenefits: ['Versatile', 'Reliable yet creative'],
            potentialRisks: [],
            prerequisites: best.metadata.prerequisiteKnowledge,
            alternatives: [],
            estimatedDuration: best.metadata.typicalDuration,
            cognitiveLoad: best.metadata.cognitiveLoad,
          },
        ];
      }
    }

    // Fallback: return best match
    return this.selectBestMatch(context);
  }

  /**
   * Build problem characteristics from context
   */
  private buildCharacteristics(context: SelectionContext): ProblemCharacteristics {
    const defaults: ProblemCharacteristics = {
      domain: 'general',
      complexity: 'moderate',
      uncertainty: 'medium',
      timeConstraints: 'moderate',
      stakeholders: 1,
      novelty: 'familiar',
      dataAvailability: 'adequate',
      reversibility: 'reversible',
      ethicalImplications: 'minor',
    };

    return { ...defaults, ...context.characteristics };
  }

  /**
   * Check if metadata satisfies constraints
   */
  private satisfiesConstraints(
    metadata: EnhancedMetadata,
    constraints?: SelectionContext['constraints']
  ): boolean {
    if (!constraints) return true;

    if (constraints.maxCognitiveLoad) {
      const loadLevels = ['minimal', 'low', 'moderate', 'high', 'very_high'];
      const maxIndex = loadLevels.indexOf(constraints.maxCognitiveLoad);
      const actualIndex = loadLevels.indexOf(metadata.cognitiveLoad);
      if (actualIndex > maxIndex) return false;
    }

    if (constraints.requireRigor && metadata.qualityMetrics.rigor < 0.8) {
      return false;
    }

    if (constraints.mustBeReliable && metadata.qualityMetrics.reliability < 0.8) {
      return false;
    }

    if (constraints.allowCreative === false && metadata.qualityMetrics.creativity > 0.7) {
      return false;
    }

    return true;
  }

  /**
   * Check if mode matches user preferences
   */
  private matchesPreferences(mode: ThinkingMode, preferences?: SelectionContext['userPreferences']): boolean {
    if (!preferences) return true;

    if (preferences.avoidModes?.includes(mode)) {
      return false;
    }

    if (preferences.preferredModes && preferences.preferredModes.length > 0) {
      return preferences.preferredModes.includes(mode);
    }

    return true;
  }

  /**
   * Extract benefits from suggestion
   */
  private extractBenefits(suggestion: any): string[] {
    const benefits: string[] = [];

    if (suggestion.metadata.qualityMetrics.rigor > 0.8) {
      benefits.push('High rigor');
    }

    if (suggestion.metadata.qualityMetrics.creativity > 0.8) {
      benefits.push('High creativity');
    }

    if (suggestion.metadata.qualityMetrics.practicality > 0.8) {
      benefits.push('Highly practical');
    }

    if (suggestion.metadata.qualityMetrics.efficiency > 0.8) {
      benefits.push('Efficient');
    }

    return benefits;
  }

  /**
   * Map reasoning type ID to thinking mode
   * Supports all 29 reasoning modes (v7.3.0)
   */
  private mapReasoningTypeToMode(typeId: string): ThinkingMode | null {
    // Explicit mapping for known types
    const mapping: Record<string, ThinkingMode> = {
      // Deductive reasoning types
      deductive_syllogism: ThinkingMode.DEDUCTIVE,
      deductive_modus_ponens: ThinkingMode.DEDUCTIVE,
      deductive_modus_tollens: ThinkingMode.DEDUCTIVE,
      deductive_disjunctive_syllogism: ThinkingMode.DEDUCTIVE,
      deductive_hypothetical_syllogism: ThinkingMode.MODAL,
      deductive_categorical_syllogism: ThinkingMode.DEDUCTIVE,
      deductive_conditional_proof: ThinkingMode.FORMALLOGIC,
      deductive_proof_by_cases: ThinkingMode.FORMALLOGIC,
      deductive_reductio_ad_absurdum: ThinkingMode.MATHEMATICS,

      // Mathematical reasoning types
      mathematical_proof_induction: ThinkingMode.MATHEMATICS,
      mathematical_axiom_system: ThinkingMode.FORMALLOGIC,
      mathematical_formal_verification: ThinkingMode.FORMALLOGIC,
      mathematical_constructive_proof: ThinkingMode.MATHEMATICS,
      mathematical_nonconstructive_proof: ThinkingMode.MATHEMATICS,
      mathematical_recursive: ThinkingMode.RECURSIVE,
      mathematical_symbolic: ThinkingMode.MATHEMATICS,

      // Probabilistic reasoning types
      probabilistic_bayesian: ThinkingMode.BAYESIAN,
      probabilistic_frequentist: ThinkingMode.BAYESIAN,
      probabilistic_maximum_likelihood: ThinkingMode.BAYESIAN,
      probabilistic_monte_carlo: ThinkingMode.STOCHASTIC,
      probabilistic_markov: ThinkingMode.STOCHASTIC,
      probabilistic_independence: ThinkingMode.BAYESIAN,
      probabilistic_sampling: ThinkingMode.STOCHASTIC,

      // Causal reasoning types
      causal_counterfactual: ThinkingMode.COUNTERFACTUAL,
      causal_intervention: ThinkingMode.CAUSAL,
      causal_mechanism: ThinkingMode.CAUSAL,
      causal_graph: ThinkingMode.CAUSAL,
      causal_discovery: ThinkingMode.CAUSAL,
      causal_inference: ThinkingMode.CAUSAL,

      // Abductive reasoning types
      abductive_inference: ThinkingMode.ABDUCTIVE,
      abductive_hypothesis: ThinkingMode.ABDUCTIVE,
      abductive_explanation: ThinkingMode.ABDUCTIVE,
      abductive_diagnostic: ThinkingMode.ABDUCTIVE,
      abductive_multiple_hypotheses: ThinkingMode.ABDUCTIVE,

      // Analogical reasoning types
      analogical_structural: ThinkingMode.ANALOGICAL,
      analogical_case_based: ThinkingMode.ANALOGICAL,
      analogical_metaphorical: ThinkingMode.ANALOGICAL,
      analogical_cross_domain: ThinkingMode.ANALOGICAL,
      analogical_functional: ThinkingMode.ANALOGICAL,

      // Inductive reasoning types
      inductive_generalization: ThinkingMode.INDUCTIVE,
      inductive_statistical: ThinkingMode.INDUCTIVE,
      inductive_enumerative: ThinkingMode.INDUCTIVE,
      inductive_prediction: ThinkingMode.INDUCTIVE,
      inductive_confirmation: ThinkingMode.INDUCTIVE,

      // Scientific reasoning
      scientific_hypothesis_testing: ThinkingMode.SCIENTIFICMETHOD,
      scientific_experimental: ThinkingMode.SCIENTIFICMETHOD,
      scientific_falsification: ThinkingMode.SCIENTIFICMETHOD,
      scientific_reproducibility: ThinkingMode.SCIENTIFICMETHOD,
      scientific_research_design: ThinkingMode.SCIENTIFICMETHOD,

      // Practical reasoning
      practical_means_ends: ThinkingMode.ENGINEERING,
      practical_cost_benefit: ThinkingMode.OPTIMIZATION,
      practical_strategic: ThinkingMode.GAMETHEORY,
      practical_decision_theory: ThinkingMode.OPTIMIZATION,
      practical_constraint_satisfaction: ThinkingMode.CONSTRAINT,

      // Temporal reasoning
      temporal_planning: ThinkingMode.TEMPORAL,
      temporal_scheduling: ThinkingMode.TEMPORAL,
      temporal_sequence_analysis: ThinkingMode.TEMPORAL,

      // Critical reasoning
      critical_evaluation: ThinkingMode.METAREASONING,
      critical_fallacy_detection: ThinkingMode.FORMALLOGIC,
      critical_source_criticism: ThinkingMode.EVIDENTIAL,
      critical_logical_analysis: ThinkingMode.FORMALLOGIC,

      // Creative reasoning
      creative_divergent: ThinkingMode.HYBRID,
      creative_convergent: ThinkingMode.HYBRID,
      creative_synthesis: ThinkingMode.SYSTEMSTHINKING,
      creative_lateral: ThinkingMode.FIRSTPRINCIPLES,
    };

    // Direct mapping first
    if (mapping[typeId]) {
      return mapping[typeId];
    }

    // Pattern-based fallback - map based on ID prefix
    const prefixMappings: Record<string, ThinkingMode> = {
      deductive: ThinkingMode.DEDUCTIVE,
      mathematical: ThinkingMode.MATHEMATICS,
      probabilistic: ThinkingMode.BAYESIAN,
      causal: ThinkingMode.CAUSAL,
      abductive: ThinkingMode.ABDUCTIVE,
      analogical: ThinkingMode.ANALOGICAL,
      inductive: ThinkingMode.INDUCTIVE,
      temporal: ThinkingMode.TEMPORAL,
      scientific: ThinkingMode.SCIENTIFICMETHOD,
      practical: ThinkingMode.ENGINEERING,
      dialectical: ThinkingMode.HYBRID,
      creative: ThinkingMode.HYBRID,
      critical: ThinkingMode.METAREASONING,
      optimization: ThinkingMode.OPTIMIZATION,
      constraint: ThinkingMode.CONSTRAINT,
      stochastic: ThinkingMode.STOCHASTIC,
      modal: ThinkingMode.MODAL,
      recursive: ThinkingMode.RECURSIVE,
      game: ThinkingMode.GAMETHEORY,
      evidential: ThinkingMode.EVIDENTIAL,
      formal: ThinkingMode.FORMALLOGIC,
      systems: ThinkingMode.SYSTEMSTHINKING,
      first_principles: ThinkingMode.FIRSTPRINCIPLES,
      engineering: ThinkingMode.ENGINEERING,
      computability: ThinkingMode.COMPUTABILITY,
      cryptanalytic: ThinkingMode.CRYPTANALYTIC,
      algorithmic: ThinkingMode.ALGORITHMIC, // Phase 12 v7.3.0
      algorithm: ThinkingMode.ALGORITHMIC,
    };

    for (const [prefix, mode] of Object.entries(prefixMappings)) {
      if (typeId.startsWith(prefix)) {
        return mode;
      }
    }

    // Last resort: return a reasonable default
    return ThinkingMode.SEQUENTIAL;
  }

  /**
   * Detect stagnation in recent thoughts
   */
  private detectStagnation(thoughts: Thought[]): boolean {
    if (thoughts.length < 2) return false;

    // Check for repetitive content
    const contents = thoughts.map(t => t.content.toLowerCase());
    const uniqueContents = new Set(contents);

    if (uniqueContents.size < contents.length * 0.5) {
      return true; // Too repetitive
    }

    // Check for lack of progress (no new insights)
    // Simplified: check if thoughts are getting shorter
    const lengths = thoughts.map(t => t.content.length);
    const avgLength = lengths.reduce((sum, l) => sum + l, 0) / lengths.length;

    if (avgLength < 50) {
      return true; // Too brief, possible stagnation
    }

    return false;
  }

  /**
   * Suggest alternatives to current mode
   * Now considers all 29 reasoning modes with intelligent pairing (v7.3.0)
   */
  private suggestAlternatives(currentMode: ThinkingMode, context: SelectionContext): ModeRecommendation[] {
    // Mode affinity groups - modes that work well as alternatives to each other
    const modeAffinities: Record<ThinkingMode, ThinkingMode[]> = {
      // Logical/deductive modes suggest other analytical modes
      [ThinkingMode.SEQUENTIAL]: [ThinkingMode.DEDUCTIVE, ThinkingMode.INDUCTIVE, ThinkingMode.HYBRID],
      [ThinkingMode.DEDUCTIVE]: [ThinkingMode.FORMALLOGIC, ThinkingMode.MATHEMATICS, ThinkingMode.INDUCTIVE],
      [ThinkingMode.INDUCTIVE]: [ThinkingMode.BAYESIAN, ThinkingMode.DEDUCTIVE, ThinkingMode.SCIENTIFICMETHOD],
      [ThinkingMode.FORMALLOGIC]: [ThinkingMode.DEDUCTIVE, ThinkingMode.MATHEMATICS, ThinkingMode.MODAL],

      // Mathematical/computational modes
      [ThinkingMode.MATHEMATICS]: [ThinkingMode.FORMALLOGIC, ThinkingMode.PHYSICS, ThinkingMode.COMPUTABILITY],
      [ThinkingMode.PHYSICS]: [ThinkingMode.MATHEMATICS, ThinkingMode.ENGINEERING, ThinkingMode.SYSTEMSTHINKING],
      [ThinkingMode.COMPUTABILITY]: [ThinkingMode.MATHEMATICS, ThinkingMode.FORMALLOGIC, ThinkingMode.RECURSIVE],
      [ThinkingMode.SHANNON]: [ThinkingMode.ENGINEERING, ThinkingMode.FIRSTPRINCIPLES, ThinkingMode.SYSTEMSTHINKING],

      // Probabilistic modes
      [ThinkingMode.BAYESIAN]: [ThinkingMode.STOCHASTIC, ThinkingMode.EVIDENTIAL, ThinkingMode.SCIENTIFICMETHOD],
      [ThinkingMode.STOCHASTIC]: [ThinkingMode.BAYESIAN, ThinkingMode.OPTIMIZATION, ThinkingMode.GAMETHEORY],
      [ThinkingMode.EVIDENTIAL]: [ThinkingMode.BAYESIAN, ThinkingMode.ABDUCTIVE, ThinkingMode.SCIENTIFICMETHOD],

      // Causal/explanatory modes
      [ThinkingMode.CAUSAL]: [ThinkingMode.COUNTERFACTUAL, ThinkingMode.ABDUCTIVE, ThinkingMode.TEMPORAL],
      [ThinkingMode.COUNTERFACTUAL]: [ThinkingMode.CAUSAL, ThinkingMode.MODAL, ThinkingMode.GAMETHEORY],
      [ThinkingMode.ABDUCTIVE]: [ThinkingMode.CAUSAL, ThinkingMode.INDUCTIVE, ThinkingMode.FIRSTPRINCIPLES],

      // Creative/synthesis modes
      [ThinkingMode.HYBRID]: [ThinkingMode.SYSTEMSTHINKING, ThinkingMode.ANALOGICAL, ThinkingMode.FIRSTPRINCIPLES],
      [ThinkingMode.ANALOGICAL]: [ThinkingMode.HYBRID, ThinkingMode.ABDUCTIVE, ThinkingMode.FIRSTPRINCIPLES],
      [ThinkingMode.FIRSTPRINCIPLES]: [ThinkingMode.SYSTEMSTHINKING, ThinkingMode.ABDUCTIVE, ThinkingMode.ENGINEERING],
      [ThinkingMode.SYSTEMSTHINKING]: [ThinkingMode.FIRSTPRINCIPLES, ThinkingMode.ENGINEERING, ThinkingMode.HYBRID],

      // Engineering/practical modes
      [ThinkingMode.ENGINEERING]: [ThinkingMode.OPTIMIZATION, ThinkingMode.CONSTRAINT, ThinkingMode.SYSTEMSTHINKING],
      [ThinkingMode.OPTIMIZATION]: [ThinkingMode.CONSTRAINT, ThinkingMode.ENGINEERING, ThinkingMode.STOCHASTIC],
      [ThinkingMode.CONSTRAINT]: [ThinkingMode.OPTIMIZATION, ThinkingMode.ENGINEERING, ThinkingMode.FORMALLOGIC],

      // Advanced modes
      [ThinkingMode.RECURSIVE]: [ThinkingMode.MATHEMATICS, ThinkingMode.COMPUTABILITY, ThinkingMode.OPTIMIZATION],
      [ThinkingMode.MODAL]: [ThinkingMode.COUNTERFACTUAL, ThinkingMode.FORMALLOGIC, ThinkingMode.DEDUCTIVE],
      [ThinkingMode.METAREASONING]: [ThinkingMode.HYBRID, ThinkingMode.SYSTEMSTHINKING, ThinkingMode.FIRSTPRINCIPLES],

      // Specialized modes
      [ThinkingMode.TEMPORAL]: [ThinkingMode.CAUSAL, ThinkingMode.GAMETHEORY, ThinkingMode.SEQUENTIAL],
      [ThinkingMode.GAMETHEORY]: [ThinkingMode.OPTIMIZATION, ThinkingMode.COUNTERFACTUAL, ThinkingMode.STOCHASTIC],
      [ThinkingMode.SCIENTIFICMETHOD]: [ThinkingMode.BAYESIAN, ThinkingMode.INDUCTIVE, ThinkingMode.EVIDENTIAL],
      [ThinkingMode.CRYPTANALYTIC]: [ThinkingMode.STOCHASTIC, ThinkingMode.BAYESIAN, ThinkingMode.COMPUTABILITY],

      // Algorithmic mode (Phase 12 v7.3.0)
      [ThinkingMode.ALGORITHMIC]: [ThinkingMode.COMPUTABILITY, ThinkingMode.RECURSIVE, ThinkingMode.OPTIMIZATION],

      // Default fallback
      [ThinkingMode.CUSTOM]: [ThinkingMode.HYBRID, ThinkingMode.SEQUENTIAL, ThinkingMode.METAREASONING],
    };

    // Get mode-specific alternatives or fall back to general alternatives
    const alternatives = modeAffinities[currentMode] ||
      [ThinkingMode.BAYESIAN, ThinkingMode.CAUSAL, ThinkingMode.ABDUCTIVE, ThinkingMode.ANALOGICAL];

    const filteredAlternatives = alternatives.filter(m => m !== currentMode);

    // If context provides characteristics, prioritize modes that match
    const domain = context.characteristics?.domain || 'general';
    const scored = filteredAlternatives.map(mode => {
      let score = 0.6;
      // Boost score for domain-relevant modes
      if (domain.includes('math') && [ThinkingMode.MATHEMATICS, ThinkingMode.FORMALLOGIC].includes(mode)) score += 0.15;
      if (domain.includes('engineer') && [ThinkingMode.ENGINEERING, ThinkingMode.OPTIMIZATION].includes(mode)) score += 0.15;
      if (domain.includes('science') && [ThinkingMode.SCIENTIFICMETHOD, ThinkingMode.BAYESIAN].includes(mode)) score += 0.15;
      if (domain.includes('security') && [ThinkingMode.CRYPTANALYTIC, ThinkingMode.STOCHASTIC].includes(mode)) score += 0.15;
      if (domain.includes('algorithm') && [ThinkingMode.ALGORITHMIC, ThinkingMode.COMPUTABILITY].includes(mode)) score += 0.15;
      return { mode, score };
    });

    // Sort by score and take top 3
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 3).map(({ mode, score }) => ({
      mode,
      confidence: score,
      reasoning: ['Alternative approach to break stagnation', `Switch from ${currentMode} to ${mode}`],
      expectedBenefits: ['Fresh perspective', 'Different reasoning style'],
      potentialRisks: ['Learning curve', 'Context switch cost'],
      prerequisites: [],
      alternatives: [],
      estimatedDuration: 'varies',
      cognitiveLoad: 'varies',
    }));
  }

  /**
   * Learn from session
   */
  learnFromSession(session: ThinkingSession): SessionLearning {
    const flow = this.multiModalAnalyzer.analyzeFlow(session);

    // Identify effective modes (high coherence, low cognitive load)
    const effectiveModes: ThinkingMode[] = [];
    const ineffectiveModes: ThinkingMode[] = [];

    for (const [mode, count] of flow.modeDistribution) {
      // Heuristic: effective if used frequently and coherent
      if (count > 2 && flow.coherence > 0.7) {
        effectiveModes.push(mode);
      } else if (count > 2 && flow.coherence < 0.5) {
        ineffectiveModes.push(mode);
      }
    }

    // Identify optimal transitions
    const optimalTransitions = flow.transitions
      .filter(t => t.effectiveness > 0.8)
      .map(t => ({ from: t.from, to: t.to }));

    // Generate insights
    const insights: string[] = [];
    if (flow.coherence > 0.8) {
      insights.push('Session had high coherence - good mode selections');
    }
    if (flow.adaptability > 0.7) {
      insights.push('Good adaptability - effective mode switching');
    }
    if (effectiveModes.length > 0) {
      insights.push(`Effective modes: ${effectiveModes.join(', ')}`);
    }

    // Future recommendations
    const futureRecommendations: string[] = [];
    if (flow.flowComplexity > 0.8) {
      futureRecommendations.push('Consider simplifying mode usage - high complexity detected');
    }
    if (ineffectiveModes.length > 0) {
      futureRecommendations.push(`Avoid: ${ineffectiveModes.join(', ')}`);
    }

    const learning: SessionLearning = {
      session,
      effectiveModes,
      ineffectiveModes,
      optimalTransitions,
      insights,
      futureRecommendations,
    };

    this.sessionHistory.set(session.id, learning);
    return learning;
  }

  /**
   * Generate selection report
   */
  generateSelectionReport(recommendations: ModeRecommendation[]): string {
    const report: string[] = [];

    report.push('# Mode Selection Report');
    report.push('');

    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];

      report.push(`## ${i + 1}. ${rec.mode}`);
      report.push(`**Confidence:** ${(rec.confidence * 100).toFixed(0)}%`);
      report.push(`**Cognitive Load:** ${rec.cognitiveLoad}`);
      report.push(`**Estimated Duration:** ${rec.estimatedDuration}`);
      report.push('');

      report.push('**Reasoning:**');
      for (const reason of rec.reasoning) {
        report.push(`- ${reason}`);
      }
      report.push('');

      if (rec.expectedBenefits.length > 0) {
        report.push('**Expected Benefits:**');
        for (const benefit of rec.expectedBenefits) {
          report.push(`- ${benefit}`);
        }
        report.push('');
      }

      if (rec.potentialRisks.length > 0) {
        report.push('**Potential Risks:**');
        for (const risk of rec.potentialRisks) {
          report.push(`- ${risk}`);
        }
        report.push('');
      }

      if (rec.prerequisites.length > 0) {
        report.push('**Prerequisites:**');
        for (const prereq of rec.prerequisites) {
          report.push(`- ${prereq}`);
        }
        report.push('');
      }
    }

    return report.join('\n');
  }
}
