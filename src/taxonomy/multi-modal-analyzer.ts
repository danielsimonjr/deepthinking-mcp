/**
 * Multi-Modal Reasoning Analyzer (v3.4.0)
 * Phase 4D Task 7.4 (File Task 21): Analyze combined reasoning approaches
 */
// @ts-nocheck - Uses string literals instead of ThinkingMode enum (requires refactoring)

import type { ThinkingSession } from '../types/index.js';
import type { ThinkingMode } from '../types/core.js';
import { type ReasoningCategory } from './reasoning-types.js';
import { SuggestionEngine } from './suggestion-engine.js';

/**
 * Mode transition
 */
export interface ModeTransition {
  from: ThinkingMode;
  to: ThinkingMode;
  thoughtNumber: number;
  reason?: string;
  effectiveness: number; // 0-1
}

/**
 * Mode combination pattern
 */
export interface ModeCombination {
  modes: ThinkingMode[];
  frequency: number;
  effectiveness: number; // 0-1
  typicalSequence: ThinkingMode[];
  synergy: number; // 0-1 (how well modes work together)
  examples: string[]; // Thought IDs
}

/**
 * Reasoning flow analysis
 */
export interface ReasoningFlow {
  session: ThinkingSession;
  transitions: ModeTransition[];
  combinations: ModeCombination[];
  dominantMode: ThinkingMode;
  modeDistribution: Map<ThinkingMode, number>;
  categoryDistribution: Map<ReasoningCategory, number>;
  flowComplexity: number; // 0-1 (how complex the mode switching is)
  coherence: number; // 0-1 (how well modes connect)
  adaptability: number; // 0-1 (how well modes adapt to problem)
}

/**
 * Multi-modal pattern
 */
export interface MultiModalPattern {
  id: string;
  name: string;
  description: string;
  modeSequence: ThinkingMode[];
  useCases: string[];
  effectiveness: number;
  examples: string[];
  prerequisites: string[];
  alternatives: string[];
}

/**
 * Mode synergy analysis
 */
export interface ModeSynergy {
  mode1: ThinkingMode;
  mode2: ThinkingMode;
  synergyScore: number; // 0-1
  complementarity: string[];
  conflicts: string[];
  optimalTransition: string; // When to switch from mode1 to mode2
  examples: string[];
}

/**
 * Multi-modal recommendation
 */
export interface MultiModalRecommendation {
  pattern: MultiModalPattern;
  relevanceScore: number;
  rationale: string[];
  adaptations: string[];
  estimatedBenefit: number; // 0-1
}

/**
 * Known effective multi-modal patterns
 */
const MULTI_MODAL_PATTERNS: MultiModalPattern[] = [
  {
    id: 'hypothesis_testing',
    name: 'Hypothesis Testing Pattern',
    description: 'Generate hypotheses abductively, test deductively, update bayesian',
    modeSequence: ['abductive', 'deductive', 'bayesian'],
    useCases: ['Scientific research', 'Debugging', 'Medical diagnosis'],
    effectiveness: 0.9,
    examples: [],
    prerequisites: ['Domain knowledge', 'Data availability'],
    alternatives: ['pure_experimental', 'pure_theoretical'],
  },
  {
    id: 'design_thinking',
    name: 'Design Thinking Pattern',
    description: 'Diverge creatively, converge critically, implement practically',
    modeSequence: ['creative', 'critical', 'practical'],
    useCases: ['Product design', 'Innovation', 'Problem-solving'],
    effectiveness: 0.85,
    examples: [],
    prerequisites: ['Open-mindedness', 'Stakeholder input'],
    alternatives: ['pure_creative', 'pure_analytical'],
  },
  {
    id: 'mathematical_discovery',
    name: 'Mathematical Discovery Pattern',
    description: 'Conjecture inductively, prove deductively, generalize mathematically',
    modeSequence: ['inductive', 'deductive', 'mathematical'],
    useCases: ['Mathematics research', 'Theory development', 'Pattern discovery'],
    effectiveness: 0.88,
    examples: [],
    prerequisites: ['Mathematical background', 'Pattern recognition'],
    alternatives: ['pure_deductive', 'computational'],
  },
  {
    id: 'causal_discovery',
    name: 'Causal Discovery Pattern',
    description: 'Correlate inductively, hypothesize causally, test experimentally',
    modeSequence: ['inductive', 'causal', 'scientific'],
    useCases: ['Epidemiology', 'Social science', 'Economics'],
    effectiveness: 0.82,
    examples: [],
    prerequisites: ['Data collection', 'Experimental capability'],
    alternatives: ['pure_observational', 'pure_experimental'],
  },
  {
    id: 'analogical_transfer',
    name: 'Analogical Transfer Pattern',
    description: 'Find analogy, map structure, adapt practically',
    modeSequence: ['analogical', 'deductive', 'practical'],
    useCases: ['Problem-solving', 'Learning', 'Innovation'],
    effectiveness: 0.78,
    examples: [],
    prerequisites: ['Broad knowledge', 'Pattern recognition'],
    alternatives: ['direct_solution', 'trial_error'],
  },
  {
    id: 'dialectical_synthesis',
    name: 'Dialectical Synthesis Pattern',
    description: 'Present thesis, develop antithesis, synthesize dialectically',
    modeSequence: ['deductive', 'critical', 'dialectical'],
    useCases: ['Philosophy', 'Conflict resolution', 'Theory integration'],
    effectiveness: 0.75,
    examples: [],
    prerequisites: ['Multiple perspectives', 'Logical reasoning'],
    alternatives: ['pure_logical', 'pure_rhetorical'],
  },
  {
    id: 'strategic_planning',
    name: 'Strategic Planning Pattern',
    description: 'Analyze situation, generate options, decide practically',
    modeSequence: ['causal', 'creative', 'practical'],
    useCases: ['Business strategy', 'Military planning', 'Policy-making'],
    effectiveness: 0.83,
    examples: [],
    prerequisites: ['Situational awareness', 'Resources'],
    alternatives: ['intuitive', 'algorithmic'],
  },
  {
    id: 'probabilistic_decision',
    name: 'Probabilistic Decision Pattern',
    description: 'Assess probabilities, model uncertainly, decide rationally',
    modeSequence: ['probabilistic', 'bayesian', 'practical'],
    useCases: ['Risk management', 'Investment', 'Medical decisions'],
    effectiveness: 0.87,
    examples: [],
    prerequisites: ['Probability knowledge', 'Decision criteria'],
    alternatives: ['heuristic', 'deterministic'],
  },
];

/**
 * Mode synergy database
 */
const MODE_SYNERGIES: ModeSynergy[] = [
  {
    mode1: 'abductive',
    mode2: 'bayesian',
    synergyScore: 0.9,
    complementarity: [
      'Abduction generates hypotheses',
      'Bayesian quantifies belief',
      'Natural progression from generation to evaluation',
    ],
    conflicts: [],
    optimalTransition: 'After generating explanations, use Bayesian to assign probabilities',
    examples: [],
  },
  {
    mode1: 'inductive',
    mode2: 'deductive',
    synergyScore: 0.85,
    complementarity: [
      'Induction discovers patterns',
      'Deduction tests them rigorously',
      'Complements discovery with verification',
    ],
    conflicts: ['Different certainty levels'],
    optimalTransition: 'After pattern discovery, switch to deductive testing',
    examples: [],
  },
  {
    mode1: 'creative',
    mode2: 'critical',
    synergyScore: 0.95,
    complementarity: [
      'Creative generates options',
      'Critical evaluates them',
      'Classic divergent-convergent pattern',
    ],
    conflicts: ['Can inhibit each other if applied simultaneously'],
    optimalTransition: 'After creative phase completes, switch to critical evaluation',
    examples: [],
  },
  {
    mode1: 'analogical',
    mode2: 'deductive',
    synergyScore: 0.75,
    complementarity: ['Analogy suggests structure', 'Deduction verifies mapping', 'Tests analogical inferences'],
    conflicts: ['Analogy imprecise, deduction precise'],
    optimalTransition: 'After finding analogy, use deduction to check validity',
    examples: [],
  },
  {
    mode1: 'causal',
    mode2: 'counterfactual',
    synergyScore: 0.88,
    complementarity: [
      'Causal identifies mechanisms',
      'Counterfactual tests necessity',
      'Both work with causal structures',
    ],
    conflicts: [],
    optimalTransition: 'After causal model, use counterfactuals to test interventions',
    examples: [],
  },
  {
    mode1: 'mathematical',
    mode2: 'practical',
    synergyScore: 0.65,
    complementarity: ['Math provides rigor', 'Practical enables application'],
    conflicts: ['Abstract vs concrete', 'Precision vs approximation'],
    optimalTransition: 'After mathematical solution, apply practically with approximations',
    examples: [],
  },
];

/**
 * Multi-modal reasoning analyzer
 */
export class MultiModalAnalyzer {
  private suggestionEngine: SuggestionEngine;

  constructor() {
    this.suggestionEngine = new SuggestionEngine();
  }

  /**
   * Analyze reasoning flow in session
   */
  analyzeFlow(session: ThinkingSession): ReasoningFlow {
    // Extract transitions
    const transitions: ModeTransition[] = [];
    for (let i = 1; i < session.thoughts.length; i++) {
      const prevThought = session.thoughts[i - 1];
      const currThought = session.thoughts[i];

      if (prevThought.mode !== currThought.mode) {
        transitions.push({
          from: prevThought.mode,
          to: currThought.mode,
          thoughtNumber: currThought.thoughtNumber,
          effectiveness: this.estimateTransitionEffectiveness(prevThought, currThought),
        });
      }
    }

    // Mode distribution
    const modeDistribution = new Map<ThinkingMode, number>();
    const categoryDistribution = new Map<ReasoningCategory, number>();

    for (const thought of session.thoughts) {
      modeDistribution.set(thought.mode, (modeDistribution.get(thought.mode) || 0) + 1);

      // Map mode to category
      const category = this.mapModeToCategory(thought.mode);
      if (category) {
        categoryDistribution.set(category, (categoryDistribution.get(category) || 0) + 1);
      }
    }

    // Find dominant mode
    let dominantMode = session.mode;
    let maxCount = 0;
    for (const [mode, count] of modeDistribution) {
      if (count > maxCount) {
        maxCount = count;
        dominantMode = mode;
      }
    }

    // Detect combinations
    const combinations = this.detectCombinations(session);

    // Calculate metrics
    const flowComplexity = this.calculateFlowComplexity(transitions, session.thoughts.length);
    const coherence = this.calculateCoherence(transitions, combinations);
    const adaptability = this.calculateAdaptability(transitions, session);

    return {
      session,
      transitions,
      combinations,
      dominantMode,
      modeDistribution,
      categoryDistribution,
      flowComplexity,
      coherence,
      adaptability,
    };
  }

  /**
   * Estimate transition effectiveness
   */
  private estimateTransitionEffectiveness(prevThought: Thought, currThought: Thought): number {
    // Check if transition is in known synergies
    const synergy = MODE_SYNERGIES.find(s => s.mode1 === prevThought.mode && s.mode2 === currThought.mode);

    if (synergy) {
      return synergy.synergyScore;
    }

    // Default heuristic
    if (prevThought.mode === currThought.mode) {
      return 0.8; // Consistency
    }

    // Check category similarity
    const prevCategory = this.mapModeToCategory(prevThought.mode);
    const currCategory = this.mapModeToCategory(currThought.mode);

    if (prevCategory === currCategory) {
      return 0.7; // Related modes
    }

    return 0.5; // Neutral
  }

  /**
   * Map mode to category
   */
  private mapModeToCategory(mode: ThinkingMode): ReasoningCategory | null {
    const mapping: Partial<Record<ThinkingMode, ReasoningCategory>> = {
      sequential: 'deductive',
      shannon: 'deductive',
      mathematics: 'mathematical',
      physics: 'mathematical',
      causal: 'causal',
      bayesian: 'probabilistic',
      abductive: 'abductive',
      analogical: 'analogical',
      temporal: 'causal',
      gametheory: 'practical',
      evidential: 'probabilistic',
      counterfactual: 'causal',
    };
    return mapping[mode] || null;
  }

  /**
   * Detect mode combinations
   */
  private detectCombinations(session: ThinkingSession): ModeCombination[] {
    const combinations = new Map<string, ModeCombination>();

    // Use sliding window to detect patterns
    const windowSize = 3;
    for (let i = 0; i <= session.thoughts.length - windowSize; i++) {
      const window = session.thoughts.slice(i, i + windowSize);
      const modes = window.map(t => t.mode);
      const key = modes.join('->');

      if (!combinations.has(key)) {
        const synergy = this.calculateCombinationSynergy(modes);
        combinations.set(key, {
          modes,
          frequency: 1,
          effectiveness: synergy,
          typicalSequence: modes,
          synergy,
          examples: [window[0].id],
        });
      } else {
        const combo = combinations.get(key)!;
        combo.frequency++;
        combo.examples.push(window[0].id);
      }
    }

    return Array.from(combinations.values()).sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Calculate combination synergy
   */
  private calculateCombinationSynergy(modes: ThinkingMode[]): number {
    let totalSynergy = 0;
    let count = 0;

    for (let i = 0; i < modes.length - 1; i++) {
      const synergy = MODE_SYNERGIES.find(s => s.mode1 === modes[i] && s.mode2 === modes[i + 1]);
      if (synergy) {
        totalSynergy += synergy.synergyScore;
        count++;
      }
    }

    return count > 0 ? totalSynergy / count : 0.5;
  }

  /**
   * Calculate flow complexity
   */
  private calculateFlowComplexity(transitions: ModeTransition[], totalThoughts: number): number {
    if (totalThoughts === 0) return 0;

    // More transitions = higher complexity
    const transitionRatio = transitions.length / totalThoughts;

    // Unique modes = higher complexity
    const uniqueModes = new Set(transitions.flatMap(t => [t.from, t.to])).size;

    return Math.min((transitionRatio * 0.5 + uniqueModes * 0.05), 1.0);
  }

  /**
   * Calculate coherence
   */
  private calculateCoherence(transitions: ModeTransition[], combinations: ModeCombination[]): number {
    if (transitions.length === 0) return 1.0;

    // Average transition effectiveness
    const avgEffectiveness =
      transitions.reduce((sum, t) => sum + t.effectiveness, 0) / transitions.length;

    // High-frequency combinations suggest coherent patterns
    const maxFreq = Math.max(...combinations.map(c => c.frequency), 1);
    const patternStrength = combinations.length > 0 ? combinations[0].frequency / maxFreq : 0.5;

    return avgEffectiveness * 0.7 + patternStrength * 0.3;
  }

  /**
   * Calculate adaptability
   */
  private calculateAdaptability(transitions: ModeTransition[], session: ThinkingSession): number {
    if (transitions.length === 0) return 0.5;

    // More diverse modes = higher adaptability
    const uniqueModes = new Set(session.thoughts.map(t => t.mode)).size;
    const modeDiversity = uniqueModes / 14; // 14 total modes available

    // Effective transitions = good adaptability
    const effectiveTransitions = transitions.filter(t => t.effectiveness > 0.7).length;
    const transitionQuality = transitions.length > 0 ? effectiveTransitions / transitions.length : 0.5;

    return modeDiversity * 0.5 + transitionQuality * 0.5;
  }

  /**
   * Recommend multi-modal patterns
   */
  recommendPatterns(problemDescription: string, currentModes: ThinkingMode[]): MultiModalRecommendation[] {
    const recommendations: MultiModalRecommendation[] = [];

    for (const pattern of MULTI_MODAL_PATTERNS) {
      const relevance = this.calculatePatternRelevance(pattern, problemDescription, currentModes);

      if (relevance > 0.3) {
        const rationale = this.buildPatternRationale(pattern, currentModes);
        const adaptations = this.suggestPatternAdaptations(pattern, currentModes);
        const benefit = this.estimatePatternBenefit(pattern, currentModes);

        recommendations.push({
          pattern,
          relevanceScore: relevance,
          rationale,
          adaptations,
          estimatedBenefit: benefit,
        });
      }
    }

    recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return recommendations;
  }

  /**
   * Calculate pattern relevance
   */
  private calculatePatternRelevance(
    pattern: MultiModalPattern,
    problemDescription: string,
    currentModes: ThinkingMode[]
  ): number {
    let relevance = pattern.effectiveness * 0.3; // Base from pattern effectiveness

    // Check use case match
    const lowerProblem = (problemDescription || '').toLowerCase();
    for (const useCase of pattern.useCases) {
      if (lowerProblem.includes(useCase.toLowerCase())) {
        relevance += 0.3;
        break;
      }
    }

    // Check mode overlap
    const overlap = pattern.modeSequence.filter(m => currentModes.includes(m)).length;
    const overlapRatio = overlap / pattern.modeSequence.length;
    relevance += overlapRatio * 0.4;

    return Math.min(relevance, 1.0);
  }

  /**
   * Build pattern rationale
   */
  private buildPatternRationale(pattern: MultiModalPattern, currentModes: ThinkingMode[]): string[] {
    const rationale: string[] = [];

    rationale.push(`${pattern.name}: ${pattern.description}`);
    rationale.push(`Effectiveness: ${(pattern.effectiveness * 100).toFixed(0)}%`);

    const overlap = pattern.modeSequence.filter(m => currentModes.includes(m));
    if (overlap.length > 0) {
      rationale.push(`Already using: ${overlap.join(', ')}`);
    }

    return rationale;
  }

  /**
   * Suggest pattern adaptations
   */
  private suggestPatternAdaptations(pattern: MultiModalPattern, currentModes: ThinkingMode[]): string[] {
    const adaptations: string[] = [];

    const missing = pattern.modeSequence.filter(m => !currentModes.includes(m));
    if (missing.length > 0) {
      adaptations.push(`Add missing modes: ${missing.join(', ')}`);
    }

    const extra = currentModes.filter(m => !pattern.modeSequence.includes(m));
    if (extra.length > 0) {
      adaptations.push(`Consider removing: ${extra.join(', ')}`);
    }

    return adaptations;
  }

  /**
   * Estimate pattern benefit
   */
  private estimatePatternBenefit(pattern: MultiModalPattern, currentModes: ThinkingMode[]): number {
    const currentSynergy = this.calculateCombinationSynergy(currentModes);
    const patternSynergy = this.calculateCombinationSynergy(pattern.modeSequence);

    const improvement = patternSynergy - currentSynergy;
    return Math.max(0, Math.min(improvement, 1.0));
  }

  /**
   * Find mode synergy
   */
  findSynergy(mode1: ThinkingMode, mode2: ThinkingMode): ModeSynergy | null {
    return MODE_SYNERGIES.find(s => s.mode1 === mode1 && s.mode2 === mode2) || null;
  }

  /**
   * Generate flow report
   */
  generateFlowReport(flow: ReasoningFlow): string {
    const report: string[] = [];

    report.push('# Multi-Modal Reasoning Flow Analysis');
    report.push('');
    report.push(`**Session:** ${flow.session.title}`);
    report.push(`**Total Thoughts:** ${flow.session.thoughts.length}`);
    report.push(`**Dominant Mode:** ${flow.dominantMode}`);
    report.push('');

    report.push('## Flow Metrics');
    report.push(`- **Complexity:** ${(flow.flowComplexity * 100).toFixed(1)}%`);
    report.push(`- **Coherence:** ${(flow.coherence * 100).toFixed(1)}%`);
    report.push(`- **Adaptability:** ${(flow.adaptability * 100).toFixed(1)}%`);
    report.push('');

    report.push('## Mode Distribution');
    for (const [mode, count] of flow.modeDistribution) {
      const percentage = ((count / flow.session.thoughts.length) * 100).toFixed(1);
      report.push(`- **${mode}:** ${count} thoughts (${percentage}%)`);
    }
    report.push('');

    report.push('## Mode Transitions');
    report.push(`Total transitions: ${flow.transitions.length}`);
    for (const transition of flow.transitions.slice(0, 10)) {
      report.push(
        `- T${transition.thoughtNumber}: ${transition.from} → ${transition.to} (effectiveness: ${(transition.effectiveness * 100).toFixed(0)}%)`
      );
    }
    report.push('');

    report.push('## Detected Patterns');
    for (const combo of flow.combinations.slice(0, 5)) {
      report.push(`- **${combo.modes.join(' → ')}** (frequency: ${combo.frequency}, synergy: ${(combo.synergy * 100).toFixed(0)}%)`);
    }

    return report.join('\n');
  }
}
