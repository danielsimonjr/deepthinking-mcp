/**
 * Strategy Recommender - Phase 12 Sprint 2
 *
 * Analyzes theorem statements to recommend appropriate proof strategies
 * and generate proof templates.
 */

import type {
  ProofStrategyType,
  ProofTemplate,
  StrategyRecommendation,
  TheoremFeatures,
} from './branch-types.js';

/**
 * Configuration for strategy recommendations
 */
export interface StrategyRecommenderConfig {
  /** Maximum number of recommendations to return */
  maxRecommendations?: number;
  /** Minimum confidence threshold for recommendations */
  minConfidence?: number;
  /** Include proof templates in recommendations */
  includeTemplates?: boolean;
}

/**
 * Feature weights for strategy matching
 */
interface StrategyFeatureWeights {
  strategy: ProofStrategyType;
  weights: Partial<Record<keyof TheoremFeatures, number>>;
  baseScore: number;
  description: string;
}

/**
 * StrategyRecommender - Recommends proof strategies based on theorem analysis
 */
export class StrategyRecommender {
  private config: Required<StrategyRecommenderConfig>;
  private strategyWeights: StrategyFeatureWeights[];
  private templates: Map<ProofStrategyType, ProofTemplate>;

  constructor(config: StrategyRecommenderConfig = {}) {
    this.config = {
      maxRecommendations: config.maxRecommendations ?? 3,
      minConfidence: config.minConfidence ?? 0.3,
      includeTemplates: config.includeTemplates ?? true,
    };

    this.strategyWeights = this.initializeStrategyWeights();
    this.templates = this.initializeTemplates();
  }

  /**
   * Recommend proof strategies for a theorem
   *
   * @param theorem - The theorem statement to analyze
   * @returns Array of strategy recommendations sorted by confidence
   */
  recommend(theorem: string): StrategyRecommendation[] {
    // Extract features from the theorem
    const features = this.extractFeatures(theorem);

    // Match strategies against features
    const scored = this.matchStrategies(features);

    // Sort by score and filter
    const recommendations = scored
      .filter((s) => s.score >= this.config.minConfidence)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxRecommendations)
      .map((s) => this.createRecommendation(s, features));

    return recommendations;
  }

  /**
   * Extract features from a theorem statement
   */
  extractFeatures(theorem: string): TheoremFeatures {
    // Universal quantifier detection
    const hasUniversalQuantifier =
      /(?:for\s+all|for\s+every|for\s+any|∀|\\forall)/i.test(theorem);

    // Existential quantifier detection
    const hasExistentialQuantifier =
      /(?:there\s+exist|there\s+is|∃|\\exists)/i.test(theorem);

    // Inequality detection
    const involvesInequality =
      /(?:[<>≤≥]|less\s+than|greater\s+than|at\s+least|at\s+most)/i.test(theorem);

    // Recursive/inductive structure detection
    const hasRecursiveStructure =
      /(?:recursive|induct|successor|predecessor|n\s*\+\s*1|n\s*-\s*1|f\s*\(\s*n\s*\))/i.test(
        theorem
      );

    // Domain type detection
    const domainType = this.detectDomainType(theorem);

    // Negation detection
    const involvesNegation =
      /(?:not|never|no\s+|isn't|doesn't|cannot|¬|\\neg|\\lnot)/i.test(theorem);

    // Conditional detection (if-then)
    const isConditional =
      /(?:if\s+.+\s+then|implies|⟹|⇒|\\implies|\\Rightarrow)/i.test(theorem);

    // Biconditional detection
    const isBiconditional =
      /(?:if\s+and\s+only\s+if|iff|⟺|⇔|\\iff|\\Leftrightarrow)/i.test(theorem);

    // Finite sets/counting detection
    const involvesFiniteSets =
      /(?:finite|count|number\s+of|cardinality|\|[A-Z]\||pigeonhole)/i.test(theorem);

    // Additional features
    const additionalFeatures = this.detectAdditionalFeatures(theorem);

    return {
      hasUniversalQuantifier,
      hasExistentialQuantifier,
      involvesInequality,
      hasRecursiveStructure,
      domainType,
      involvesNegation,
      isConditional,
      isBiconditional,
      involvesFiniteSets,
      additionalFeatures,
    };
  }

  /**
   * Detect the mathematical domain type
   */
  private detectDomainType(theorem: string): string {
    if (/(?:natural\s+number|positive\s+integer|ℕ|\\mathbb\{N\})/i.test(theorem)) {
      return 'natural_numbers';
    }
    if (/(?:integer|ℤ|\\mathbb\{Z\})/i.test(theorem)) {
      return 'integers';
    }
    if (/(?:rational|ℚ|\\mathbb\{Q\})/i.test(theorem)) {
      return 'rationals';
    }
    if (/(?:real|ℝ|\\mathbb\{R\})/i.test(theorem)) {
      return 'reals';
    }
    if (/(?:complex|ℂ|\\mathbb\{C\})/i.test(theorem)) {
      return 'complex';
    }
    if (/(?:set|subset|∈|∅|union|intersection)/i.test(theorem)) {
      return 'sets';
    }
    if (/(?:group|ring|field|module|vector\s+space)/i.test(theorem)) {
      return 'algebra';
    }
    if (/(?:graph|vertex|edge|path|cycle)/i.test(theorem)) {
      return 'graphs';
    }
    if (/(?:continuous|differentiable|integrable|limit)/i.test(theorem)) {
      return 'analysis';
    }
    if (/(?:prime|divisible|factor|gcd|lcm)/i.test(theorem)) {
      return 'number_theory';
    }

    return 'general';
  }

  /**
   * Detect additional theorem features
   */
  private detectAdditionalFeatures(theorem: string): string[] {
    const features: string[] = [];

    if (/(?:prime|composite)/i.test(theorem)) features.push('involves_primes');
    if (/(?:even|odd)/i.test(theorem)) features.push('parity');
    if (/(?:converge|diverge|limit)/i.test(theorem)) features.push('convergence');
    if (/(?:continuous|discontinuous)/i.test(theorem)) features.push('continuity');
    if (/(?:injective|surjective|bijective)/i.test(theorem)) features.push('function_properties');
    if (/(?:maximum|minimum|supremum|infimum)/i.test(theorem)) features.push('extrema');
    if (/(?:unique|only\s+one)/i.test(theorem)) features.push('uniqueness');
    if (/(?:equal|equivalent)/i.test(theorem)) features.push('equality');
    if (/(?:construct|build|find)/i.test(theorem)) features.push('constructive');
    if (/(?:impossible|cannot|no\s+such)/i.test(theorem)) features.push('impossibility');
    if (/(?:either|or|case)/i.test(theorem)) features.push('disjunction');

    return features;
  }

  /**
   * Initialize strategy-feature weight mappings
   */
  private initializeStrategyWeights(): StrategyFeatureWeights[] {
    return [
      {
        strategy: 'direct',
        baseScore: 0.4,
        description: 'Direct proof by logical deduction',
        weights: {
          isConditional: 0.3,
          hasUniversalQuantifier: 0.1,
        },
      },
      {
        strategy: 'contradiction',
        baseScore: 0.3,
        description: 'Proof by assuming the negation and deriving a contradiction',
        weights: {
          involvesNegation: 0.4,
          hasExistentialQuantifier: 0.2,
        },
      },
      {
        strategy: 'induction',
        baseScore: 0.25,
        description: 'Mathematical induction for natural numbers',
        weights: {
          hasRecursiveStructure: 0.5,
          hasUniversalQuantifier: 0.2,
          involvesInequality: 0.1,
        },
      },
      {
        strategy: 'strong_induction',
        baseScore: 0.2,
        description: 'Strong induction using all previous cases',
        weights: {
          hasRecursiveStructure: 0.4,
          hasUniversalQuantifier: 0.2,
        },
      },
      {
        strategy: 'structural_induction',
        baseScore: 0.15,
        description: 'Structural induction on recursive data types',
        weights: {
          hasRecursiveStructure: 0.5,
        },
      },
      {
        strategy: 'case_analysis',
        baseScore: 0.35,
        description: 'Proof by exhaustive case analysis',
        weights: {
          involvesFiniteSets: 0.3,
          isBiconditional: 0.2,
        },
      },
      {
        strategy: 'contrapositive',
        baseScore: 0.3,
        description: 'Prove the contrapositive instead of direct implication',
        weights: {
          isConditional: 0.3,
          involvesNegation: 0.2,
        },
      },
      {
        strategy: 'construction',
        baseScore: 0.25,
        description: 'Constructive proof by building the required object',
        weights: {
          hasExistentialQuantifier: 0.5,
        },
      },
      {
        strategy: 'pigeonhole',
        baseScore: 0.15,
        description: 'Pigeonhole principle for counting arguments',
        weights: {
          involvesFiniteSets: 0.5,
          involvesInequality: 0.2,
        },
      },
      {
        strategy: 'diagonalization',
        baseScore: 0.1,
        description: 'Cantor diagonal argument for uncountability',
        weights: {
          hasExistentialQuantifier: 0.3,
          involvesNegation: 0.2,
        },
      },
      {
        strategy: 'well_ordering',
        baseScore: 0.15,
        description: 'Use the well-ordering principle',
        weights: {
          hasExistentialQuantifier: 0.3,
          involvesInequality: 0.2,
        },
      },
      {
        strategy: 'infinite_descent',
        baseScore: 0.15,
        description: 'Fermat\'s method of infinite descent',
        weights: {
          involvesNegation: 0.3,
          hasRecursiveStructure: 0.3,
        },
      },
    ];
  }

  /**
   * Match strategies against extracted features
   */
  matchStrategies(
    features: TheoremFeatures
  ): Array<{ strategy: ProofStrategyType; score: number; matchedFeatures: string[] }> {
    const results: Array<{ strategy: ProofStrategyType; score: number; matchedFeatures: string[] }> =
      [];

    for (const sw of this.strategyWeights) {
      let score = sw.baseScore;
      const matchedFeatures: string[] = [];

      for (const [feature, weight] of Object.entries(sw.weights)) {
        const featureKey = feature as keyof TheoremFeatures;
        const featureValue = features[featureKey];

        if (typeof featureValue === 'boolean' && featureValue) {
          score += weight;
          matchedFeatures.push(feature);
        } else if (Array.isArray(featureValue) && featureValue.length > 0) {
          score += weight * 0.5;
          matchedFeatures.push(feature);
        }
      }

      // Apply domain-specific bonuses
      score = this.applyDomainBonus(score, sw.strategy, features.domainType, matchedFeatures);

      // Apply additional feature bonuses
      score = this.applyAdditionalFeatureBonus(
        score,
        sw.strategy,
        features.additionalFeatures,
        matchedFeatures
      );

      // Normalize score to [0, 1]
      score = Math.min(1, Math.max(0, score));

      results.push({
        strategy: sw.strategy,
        score,
        matchedFeatures,
      });
    }

    return results;
  }

  /**
   * Apply domain-specific score bonuses
   */
  private applyDomainBonus(
    score: number,
    strategy: ProofStrategyType,
    domain: string,
    matchedFeatures: string[]
  ): number {
    const bonuses: Record<string, Partial<Record<ProofStrategyType, number>>> = {
      natural_numbers: { induction: 0.3, strong_induction: 0.2, well_ordering: 0.2 },
      integers: { induction: 0.2, contradiction: 0.1 },
      reals: { contradiction: 0.2, construction: 0.1 },
      sets: { contradiction: 0.2, construction: 0.2 },
      number_theory: { contradiction: 0.2, infinite_descent: 0.3 },
      graphs: { induction: 0.2, case_analysis: 0.2 },
    };

    const domainBonuses = bonuses[domain];
    if (domainBonuses && strategy in domainBonuses) {
      const bonus = domainBonuses[strategy]!;
      if (bonus > 0) {
        matchedFeatures.push(`domain:${domain}`);
      }
      return score + bonus;
    }

    return score;
  }

  /**
   * Apply bonuses based on additional features
   */
  private applyAdditionalFeatureBonus(
    score: number,
    strategy: ProofStrategyType,
    additionalFeatures: string[],
    matchedFeatures: string[]
  ): number {
    const featureBonuses: Record<string, Partial<Record<ProofStrategyType, number>>> = {
      impossibility: { contradiction: 0.3, infinite_descent: 0.2 },
      constructive: { construction: 0.4, direct: 0.2 },
      uniqueness: { contradiction: 0.2, direct: 0.1 },
      disjunction: { case_analysis: 0.3 },
      parity: { case_analysis: 0.2 },
      extrema: { well_ordering: 0.2, contradiction: 0.1 },
    };

    let bonus = 0;
    for (const feature of additionalFeatures) {
      const fb = featureBonuses[feature];
      if (fb && strategy in fb) {
        const b = fb[strategy]!;
        if (b > 0) {
          matchedFeatures.push(`feature:${feature}`);
          bonus += b;
        }
      }
    }

    return score + bonus;
  }

  /**
   * Create a recommendation from a scored strategy
   */
  private createRecommendation(
    scored: { strategy: ProofStrategyType; score: number; matchedFeatures: string[] },
    features: TheoremFeatures
  ): StrategyRecommendation {
    const template = this.templates.get(scored.strategy) || this.getDefaultTemplate(scored.strategy);
    const reasoning = this.generateReasoning(scored, features);

    return {
      strategy: scored.strategy,
      confidence: scored.score,
      reasoning,
      suggestedStructure: template,
      matchedFeatures: scored.matchedFeatures,
    };
  }

  /**
   * Generate reasoning explanation for a recommendation
   */
  private generateReasoning(
    scored: { strategy: ProofStrategyType; score: number; matchedFeatures: string[] },
    _features: TheoremFeatures
  ): string {
    const parts: string[] = [];

    // Base explanation
    const sw = this.strategyWeights.find((s) => s.strategy === scored.strategy);
    if (sw) {
      parts.push(sw.description);
    }

    // Feature-based reasoning
    if (scored.matchedFeatures.length > 0) {
      const featureExplanations: string[] = [];

      if (scored.matchedFeatures.includes('hasRecursiveStructure')) {
        featureExplanations.push('the theorem has recursive structure');
      }
      if (scored.matchedFeatures.includes('involvesNegation')) {
        featureExplanations.push('the statement involves negation');
      }
      if (scored.matchedFeatures.includes('hasExistentialQuantifier')) {
        featureExplanations.push('we need to prove existence');
      }
      if (scored.matchedFeatures.includes('hasUniversalQuantifier')) {
        featureExplanations.push('we need to prove for all cases');
      }
      if (scored.matchedFeatures.includes('involvesFiniteSets')) {
        featureExplanations.push('the domain is finite');
      }
      if (scored.matchedFeatures.includes('isConditional')) {
        featureExplanations.push('the statement is conditional');
      }

      // Domain-specific reasoning
      const domainFeature = scored.matchedFeatures.find((f) => f.startsWith('domain:'));
      if (domainFeature) {
        featureExplanations.push(`common approach for ${domainFeature.split(':')[1]}`);
      }

      if (featureExplanations.length > 0) {
        parts.push('This strategy is recommended because ' + featureExplanations.join(', ') + '.');
      }
    }

    return parts.join(' ');
  }

  /**
   * Initialize proof templates for each strategy
   */
  private initializeTemplates(): Map<ProofStrategyType, ProofTemplate> {
    const templates = new Map<ProofStrategyType, ProofTemplate>();

    templates.set('direct', {
      strategy: 'direct',
      description: 'Direct proof by logical deduction from hypotheses to conclusion',
      sections: [
        { name: 'Setup', description: 'State the hypotheses and goal', required: true, placeholder: 'Let ... Assume ...' },
        { name: 'Derivation', description: 'Chain of logical steps', required: true, placeholder: 'By [rule], we have ...' },
        { name: 'Conclusion', description: 'State the result', required: true, placeholder: 'Therefore, ...' },
      ],
      skeleton: 'Proof:\nLet [variables]. Assume [hypotheses].\n[Derivation steps]\nTherefore, [conclusion]. □',
    });

    templates.set('contradiction', {
      strategy: 'contradiction',
      description: 'Assume the negation and derive a logical contradiction',
      sections: [
        { name: 'Assumption', description: 'Assume the negation of the goal', required: true, placeholder: 'Suppose, for contradiction, that ...' },
        { name: 'Derivation', description: 'Derive consequences of the assumption', required: true, placeholder: 'Then, by [rule], ...' },
        { name: 'Contradiction', description: 'Identify the contradiction', required: true, placeholder: 'This contradicts ...' },
        { name: 'Conclusion', description: 'Conclude the original statement', required: true, placeholder: 'Therefore, our assumption was false, and ...' },
      ],
      skeleton: 'Proof by contradiction:\nSuppose, for contradiction, that [negation of goal].\n[Derivation]\nThis contradicts [earlier statement or known fact].\nTherefore, [goal]. □',
    });

    templates.set('induction', {
      strategy: 'induction',
      description: 'Mathematical induction: prove base case and inductive step',
      sections: [
        { name: 'Base Case', description: 'Prove the statement for n=0 or n=1', required: true, placeholder: 'Base case (n=0): ...' },
        { name: 'Inductive Hypothesis', description: 'Assume the statement for n=k', required: true, placeholder: 'Assume P(k) holds for some k ≥ 0.' },
        { name: 'Inductive Step', description: 'Prove the statement for n=k+1', required: true, placeholder: 'We must show P(k+1). ...' },
        { name: 'Conclusion', description: 'Conclude by induction', required: true, placeholder: 'By induction, P(n) holds for all n ≥ 0. □' },
      ],
      skeleton: 'Proof by induction:\n\nBase case (n=0): [proof for n=0]\n\nInductive step:\nAssume P(k) holds for some k ≥ 0.\nWe must show P(k+1).\n[proof using IH]\n\nBy induction, the result holds for all n ≥ 0. □',
    });

    templates.set('strong_induction', {
      strategy: 'strong_induction',
      description: 'Strong induction: use all cases ≤ k to prove k+1',
      sections: [
        { name: 'Base Case', description: 'Prove for initial value(s)', required: true, placeholder: 'Base case: ...' },
        { name: 'Strong IH', description: 'Assume for all m ≤ k', required: true, placeholder: 'Assume P(m) for all m with 0 ≤ m ≤ k.' },
        { name: 'Inductive Step', description: 'Prove for k+1 using any prior case', required: true, placeholder: 'We show P(k+1) ...' },
        { name: 'Conclusion', description: 'Conclude', required: true, placeholder: 'By strong induction, ...' },
      ],
      skeleton: 'Proof by strong induction:\n\nBase case: [proof]\n\nInductive step:\nAssume P(m) holds for all m with 0 ≤ m ≤ k.\n[proof of P(k+1) using P(m) for any m ≤ k as needed]\n\nBy strong induction, the result holds. □',
    });

    templates.set('case_analysis', {
      strategy: 'case_analysis',
      description: 'Prove by considering all possible cases',
      sections: [
        { name: 'Cases', description: 'Identify all cases', required: true, placeholder: 'We consider the following cases: ...' },
        { name: 'Case 1', description: 'Prove for first case', required: true, placeholder: 'Case 1: ...' },
        { name: 'Case 2', description: 'Prove for second case', required: true, placeholder: 'Case 2: ...' },
        { name: 'Exhaustive', description: 'Note cases are exhaustive', required: false, placeholder: 'Since these cases are exhaustive, ...' },
      ],
      skeleton: 'Proof by cases:\n\nCase 1 ([condition]): [proof]\n\nCase 2 ([condition]): [proof]\n\n[Additional cases as needed]\n\nSince these cases are exhaustive, the result follows. □',
    });

    templates.set('contrapositive', {
      strategy: 'contrapositive',
      description: 'Prove P → Q by proving ¬Q → ¬P',
      sections: [
        { name: 'Restatement', description: 'State the contrapositive', required: true, placeholder: 'We prove the contrapositive: ...' },
        { name: 'Assumption', description: 'Assume ¬Q', required: true, placeholder: 'Assume [negation of conclusion].' },
        { name: 'Derivation', description: 'Derive ¬P', required: true, placeholder: 'Then, ...' },
        { name: 'Conclusion', description: 'Conclude original statement', required: true, placeholder: 'Therefore, by contrapositive, ...' },
      ],
      skeleton: 'Proof by contrapositive:\nWe prove: ¬Q → ¬P.\nAssume [¬Q].\n[derivation]\nTherefore, [¬P].\nBy contrapositive, P → Q. □',
    });

    templates.set('construction', {
      strategy: 'construction',
      description: 'Prove existence by explicitly constructing the object',
      sections: [
        { name: 'Construction', description: 'Define the object', required: true, placeholder: 'Define [object] as follows: ...' },
        { name: 'Verification', description: 'Verify the required properties', required: true, placeholder: 'We verify that [object] satisfies ...' },
        { name: 'Conclusion', description: 'Conclude existence', required: true, placeholder: 'Therefore, there exists ...' },
      ],
      skeleton: 'Proof by construction:\nDefine [object] := [definition].\n\nVerification:\n- Property 1: [proof]\n- Property 2: [proof]\n\nTherefore, [object] is the required [type]. □',
    });

    templates.set('pigeonhole', {
      strategy: 'pigeonhole',
      description: 'If n+1 objects are in n boxes, some box has ≥2 objects',
      sections: [
        { name: 'Setup', description: 'Identify pigeons and holes', required: true, placeholder: 'Consider [n+1 objects] and [n categories].' },
        { name: 'Application', description: 'Apply the pigeonhole principle', required: true, placeholder: 'By the pigeonhole principle, ...' },
        { name: 'Conclusion', description: 'Draw the conclusion', required: true, placeholder: 'Therefore, ...' },
      ],
      skeleton: 'Proof using the pigeonhole principle:\n[n+1 objects] are placed into [n categories].\nBy the pigeonhole principle, at least two [objects] are in the same [category].\nTherefore, [conclusion]. □',
    });

    templates.set('well_ordering', {
      strategy: 'well_ordering',
      description: 'Use that every non-empty set of naturals has a minimum',
      sections: [
        { name: 'Setup', description: 'Define the set', required: true, placeholder: 'Let S = {n ∈ ℕ : ¬P(n)}.' },
        { name: 'Assumption', description: 'Assume S is non-empty', required: true, placeholder: 'Suppose S is non-empty.' },
        { name: 'Minimum', description: 'Take the minimum element', required: true, placeholder: 'By well-ordering, let m = min(S).' },
        { name: 'Contradiction', description: 'Derive a contradiction', required: true, placeholder: 'Then ... contradiction.' },
        { name: 'Conclusion', description: 'Conclude S is empty', required: true, placeholder: 'Therefore, S = ∅, so P(n) for all n.' },
      ],
      skeleton: 'Proof using well-ordering:\nLet S = {n ∈ ℕ : ¬P(n)}.\nSuppose S ≠ ∅.\nBy well-ordering, let m = min(S).\n[derive contradiction]\nThis contradicts the minimality of m.\nTherefore, S = ∅, so P(n) holds for all n ∈ ℕ. □',
    });

    templates.set('infinite_descent', {
      strategy: 'infinite_descent',
      description: 'Show a counterexample leads to infinite descent',
      sections: [
        { name: 'Assumption', description: 'Assume a minimal counterexample', required: true, placeholder: 'Suppose [statement] is false. Let (a, b) be a counterexample with a + b minimal.' },
        { name: 'Construction', description: 'Construct a smaller counterexample', required: true, placeholder: 'Then ... gives a smaller counterexample.' },
        { name: 'Contradiction', description: 'Contradict minimality', required: true, placeholder: 'This contradicts minimality.' },
        { name: 'Conclusion', description: 'Conclude', required: true, placeholder: 'Therefore, no counterexample exists.' },
      ],
      skeleton: 'Proof by infinite descent:\nSuppose [statement] is false.\nLet [example] be a counterexample with [measure] minimal.\n[show how to construct a smaller counterexample]\nThis contradicts the minimality of [example].\nTherefore, [statement] is true. □',
    });

    // Add remaining strategies with simpler templates
    templates.set('structural_induction', {
      strategy: 'structural_induction',
      description: 'Induction on the structure of a recursively defined type',
      sections: [
        { name: 'Base Cases', description: 'Prove for base constructors', required: true, placeholder: 'Base case: ...' },
        { name: 'Inductive Cases', description: 'Prove for recursive constructors', required: true, placeholder: 'Inductive case: ...' },
      ],
      skeleton: 'Proof by structural induction:\n\nBase case ([constructor]): [proof]\n\nInductive case ([recursive constructor]):\nAssume P(x) holds.\n[proof of P(f(x))]\n\nBy structural induction, the result holds. □',
    });

    templates.set('diagonalization', {
      strategy: 'diagonalization',
      description: 'Cantor diagonal argument',
      sections: [
        { name: 'Assumption', description: 'Assume enumeration exists', required: true, placeholder: 'Suppose we can enumerate ...' },
        { name: 'Diagonal', description: 'Construct diagonal element', required: true, placeholder: 'Define d by: d differs from the n-th element in position n.' },
        { name: 'Contradiction', description: 'Show d is not in enumeration', required: true, placeholder: 'd differs from every element, contradiction.' },
      ],
      skeleton: 'Proof by diagonalization:\nSuppose [set] is countable, enumerated as {a₁, a₂, a₃, ...}.\nDefine d by: [diagonal construction].\nThen d differs from aₙ in position n for all n.\nSo d is not in the enumeration, contradiction.\nTherefore, [set] is uncountable. □',
    });

    return templates;
  }

  /**
   * Get a default template for strategies without a specific one
   */
  private getDefaultTemplate(strategy: ProofStrategyType): ProofTemplate {
    return {
      strategy,
      description: `Proof using ${strategy.replace(/_/g, ' ')} strategy`,
      sections: [
        { name: 'Setup', description: 'State the problem', required: true, placeholder: '...' },
        { name: 'Main Argument', description: 'Core proof', required: true, placeholder: '...' },
        { name: 'Conclusion', description: 'Conclude', required: true, placeholder: 'Therefore, ...' },
      ],
      skeleton: `Proof (${strategy}):\n[Setup]\n[Main argument]\n[Conclusion] □`,
    };
  }

  /**
   * Get all available strategies
   */
  getStrategies(): ProofStrategyType[] {
    return this.strategyWeights.map((sw) => sw.strategy);
  }

  /**
   * Get template for a specific strategy
   */
  getTemplate(strategy: ProofStrategyType): ProofTemplate | undefined {
    return this.templates.get(strategy);
  }
}
