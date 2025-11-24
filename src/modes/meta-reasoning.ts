/**
 * Meta-Reasoning Mode (v3.4.0)
 * Phase 4E Task 8.1 (File Task 24): Reasoning about reasoning itself
 */
// @ts-nocheck - Type definitions need refactoring

import type { ThinkingSession, Thought } from '../types/index.js';
import type { ThinkingMode } from '../types/core.js';

/**
 * Meta-reasoning focus
 */
export type MetaReasoningFocus =
  | 'mode_selection' // Choosing reasoning approaches
  | 'quality_assessment' // Evaluating reasoning quality
  | 'strategy_evaluation' // Assessing problem-solving strategies
  | 'bias_detection' // Identifying cognitive biases
  | 'assumption_examination' // Questioning assumptions
  | 'reasoning_repair' // Fixing reasoning errors
  | 'learning_reflection' // Reflecting on learning
  | 'metacognitive_monitoring'; // Monitoring own thinking

/**
 * Metacognitive judgment
 */
export interface MetacognitiveJudgment {
  aspect: string; // What aspect is being judged
  judgment: 'effective' | 'ineffective' | 'uncertain' | 'needs_improvement';
  confidence: number; // 0-1
  evidence: string[];
  implications: string[];
  recommendations: string[];
}

/**
 * Reasoning strategy
 */
export interface ReasoningStrategy {
  name: string;
  description: string;
  applicability: string[];
  strengths: string[];
  weaknesses: string[];
  prerequisites: string[];
  alternatives: string[];
}

/**
 * Cognitive bias identification
 */
export interface CognitiveBias {
  name: string;
  description: string;
  evidence: string[];
  severity: 'low' | 'moderate' | 'high' | 'critical';
  mitigation: string[];
}

/**
 * Meta-reasoning thought
 */
export interface MetaReasoningThought extends Thought {
  mode: 'metareasoning';
  focus: MetaReasoningFocus;
  judgments: MetacognitiveJudgment[];
  strategies: ReasoningStrategy[];
  biases: CognitiveBias[];
  recommendations: string[];
  reflections: string[];
}

/**
 * Known cognitive biases
 */
const COGNITIVE_BIASES = [
  {
    name: 'Confirmation Bias',
    description: 'Tendency to search for, interpret, and recall information that confirms pre-existing beliefs',
    indicators: ['selective evidence', 'ignoring counter-evidence', 'motivated reasoning'],
    severity: 'high',
    mitigation: ['Actively seek disconfirming evidence', 'Consider alternative hypotheses', 'Pre-commit to acceptance criteria'],
  },
  {
    name: 'Anchoring Bias',
    description: 'Over-reliance on first piece of information encountered',
    indicators: ['insufficient adjustment', 'first impression dominance', 'initial estimate fixation'],
    severity: 'moderate',
    mitigation: ['Consider multiple starting points', 'Work backwards from goal', 'Blind evaluation'],
  },
  {
    name: 'Availability Heuristic',
    description: 'Overestimating likelihood of events that are easily recalled',
    indicators: ['recent event emphasis', 'vivid example bias', 'media influence'],
    severity: 'moderate',
    mitigation: ['Consult base rates', 'Systematic data collection', 'Statistical thinking'],
  },
  {
    name: 'Hindsight Bias',
    description: 'Seeing past events as more predictable than they were',
    indicators: ['knew it all along', 'inevitability perception', 'outcome knowledge'],
    severity: 'low',
    mitigation: ['Document predictions beforehand', 'Consider alternative outcomes', 'Probabilistic thinking'],
  },
  {
    name: 'Sunk Cost Fallacy',
    description: 'Continuing investment due to prior investment despite poor prospects',
    indicators: ['past investment emphasis', 'reluctance to abandon', 'escalation of commitment'],
    severity: 'high',
    mitigation: ['Focus on future costs/benefits', 'Ignore sunk costs', 'Exit strategy planning'],
  },
  {
    name: 'Dunning-Kruger Effect',
    description: 'Overestimating competence when lacking expertise',
    indicators: ['overconfidence', 'expertise underestimation', 'lack of metacognition'],
    severity: 'high',
    mitigation: ['Seek expert feedback', 'Test knowledge', 'Calibration exercises'],
  },
  {
    name: 'Representativeness Heuristic',
    description: 'Judging probability by resemblance to stereotypes',
    indicators: ['stereotype matching', 'ignoring base rates', 'conjunction fallacy'],
    severity: 'moderate',
    mitigation: ['Consider base rates', 'Statistical reasoning', 'Multiple perspectives'],
  },
  {
    name: 'Framing Effect',
    description: 'Drawing different conclusions based on how information is presented',
    indicators: ['presentation dependency', 'equivalent option preference reversal', 'loss aversion'],
    severity: 'moderate',
    mitigation: ['Reframe problems', 'Multiple framings', 'Invariant formulation'],
  },
];

/**
 * Reasoning quality criteria
 */
const QUALITY_CRITERIA = [
  {
    criterion: 'Logical Validity',
    description: 'Conclusions follow from premises',
    indicators: ['valid inference rules', 'no logical fallacies', 'deductive soundness'],
  },
  {
    criterion: 'Empirical Adequacy',
    description: 'Consistent with observations and data',
    indicators: ['data support', 'no contradictions', 'explanatory power'],
  },
  {
    criterion: 'Internal Coherence',
    description: 'No self-contradictions',
    indicators: ['consistency', 'no conflicts', 'unified framework'],
  },
  {
    criterion: 'Completeness',
    description: 'All relevant aspects addressed',
    indicators: ['comprehensive', 'no major gaps', 'thorough'],
  },
  {
    criterion: 'Clarity',
    description: 'Clear and understandable',
    indicators: ['explicit statements', 'well-defined terms', 'unambiguous'],
  },
  {
    criterion: 'Parsimony',
    description: 'Simplicity without sacrificing adequacy',
    indicators: ['Occam\'s razor', 'minimal assumptions', 'elegant'],
  },
  {
    criterion: 'Practical Applicability',
    description: 'Can be applied to real problems',
    indicators: ['actionable', 'implementable', 'useful'],
  },
];

/**
 * Meta-reasoning engine
 */
export class MetaReasoningEngine {
  /**
   * Analyze reasoning quality of session
   */
  analyzeReasoningQuality(session: ThinkingSession): MetacognitiveJudgment[] {
    const judgments: MetacognitiveJudgment[] = [];

    // Assess each quality criterion
    for (const criterion of QUALITY_CRITERIA) {
      const judgment = this.assessCriterion(session, criterion);
      judgments.push(judgment);
    }

    return judgments;
  }

  /**
   * Assess specific quality criterion
   */
  private assessCriterion(session: ThinkingSession, criterion: any): MetacognitiveJudgment {
    const evidence: string[] = [];
    let score = 0;

    // Simple heuristics for assessment
    if (criterion.criterion === 'Logical Validity') {
      // Check for explicit logical reasoning
      const logicalThoughts = session.thoughts.filter(t =>
        t.content.toLowerCase().includes('therefore') ||
        t.content.toLowerCase().includes('thus') ||
        t.content.toLowerCase().includes('hence')
      );
      if (logicalThoughts.length > session.thoughts.length * 0.3) {
        score += 0.5;
        evidence.push('Significant use of logical connectives');
      }
    }

    if (criterion.criterion === 'Completeness') {
      // Check thought count and depth
      if (session.thoughts.length >= 10) {
        score += 0.3;
        evidence.push('Sufficient number of thoughts');
      }
      if (session.isComplete) {
        score += 0.2;
        evidence.push('Session marked as complete');
      }
    }

    if (criterion.criterion === 'Internal Coherence') {
      // Check for revisions (suggests self-correction)
      const revisions = session.thoughts.filter(t => t.isRevision);
      if (revisions.length > 0) {
        score += 0.3;
        evidence.push('Self-corrections present');
      }
    }

    // Determine judgment
    let judgment: 'effective' | 'ineffective' | 'uncertain' | 'needs_improvement';
    if (score >= 0.7) judgment = 'effective';
    else if (score >= 0.5) judgment = 'uncertain';
    else if (score >= 0.3) judgment = 'needs_improvement';
    else judgment = 'ineffective';

    const implications: string[] = [];
    const recommendations: string[] = [];

    if (judgment === 'ineffective' || judgment === 'needs_improvement') {
      implications.push(`${criterion.criterion} is below optimal`);
      recommendations.push(`Improve ${criterion.criterion}: ${criterion.description}`);
    }

    return {
      aspect: criterion.criterion,
      judgment,
      confidence: Math.min(evidence.length * 0.3, 0.9),
      evidence: evidence.length > 0 ? evidence : ['Limited evidence available'],
      implications,
      recommendations,
    };
  }

  /**
   * Detect cognitive biases in reasoning
   */
  detectBiases(session: ThinkingSession): CognitiveBias[] {
    const detected: CognitiveBias[] = [];

    for (const bias of COGNITIVE_BIASES) {
      const evidence = this.findBiasEvidence(session, bias);

      if (evidence.length > 0) {
        detected.push({
          name: bias.name,
          description: bias.description,
          evidence,
          severity: bias.severity as 'low' | 'moderate' | 'high' | 'critical',
          mitigation: bias.mitigation,
        });
      }
    }

    return detected;
  }

  /**
   * Find evidence of specific bias
   */
  private findBiasEvidence(session: ThinkingSession, bias: any): string[] {
    const evidence: string[] = [];

    if (bias.name === 'Confirmation Bias') {
      // Check if all thoughts support same conclusion
      const contents = session.thoughts.map(t => t.content.toLowerCase());
      const hasCounterEvidence = contents.some(c =>
        c.includes('however') || c.includes('but') || c.includes('alternative')
      );
      if (!hasCounterEvidence && session.thoughts.length > 5) {
        evidence.push('No counter-evidence considered');
      }
    }

    if (bias.name === 'Anchoring Bias') {
      // Check if first thought dominates
      if (session.thoughts.length > 3) {
        const firstThought = session.thoughts[0].content;
        const laterThoughts = session.thoughts.slice(1).map(t => t.content);
        const references = laterThoughts.filter(t =>
          t.includes(firstThought.substring(0, 20))
        );
        if (references.length > laterThoughts.length * 0.7) {
          evidence.push('Excessive reference to initial thought');
        }
      }
    }

    if (bias.name === 'Sunk Cost Fallacy') {
      // Check for past investment mentions
      const hasSunkCost = session.thoughts.some(t =>
        t.content.toLowerCase().includes('already invested') ||
        t.content.toLowerCase().includes('already spent') ||
        t.content.toLowerCase().includes('so far')
      );
      if (hasSunkCost) {
        evidence.push('References to prior investment');
      }
    }

    return evidence;
  }

  /**
   * Evaluate problem-solving strategy
   */
  evaluateStrategy(session: ThinkingSession): ReasoningStrategy {
    // Analyze the strategy used in the session
    const modeDistribution = new Map<ThinkingMode, number>();

    for (const thought of session.thoughts) {
      modeDistribution.set(thought.mode, (modeDistribution.get(thought.mode) || 0) + 1);
    }

    const dominantMode = Array.from(modeDistribution.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || session.mode;

    return {
      name: `${dominantMode} Strategy`,
      description: `Primarily using ${dominantMode} mode reasoning`,
      applicability: this.getApplicability(dominantMode),
      strengths: this.getStrengths(dominantMode),
      weaknesses: this.getWeaknesses(dominantMode),
      prerequisites: this.getPrerequisites(dominantMode),
      alternatives: this.getAlternatives(dominantMode),
    };
  }

  /**
   * Get mode applicability
   */
  private getApplicability(mode: ThinkingMode): string[] {
    const mapping: Partial<Record<ThinkingMode, string[]>> = {
      sequential: ['Logical problems', 'Step-by-step reasoning', 'Proof construction'],
      mathematics: ['Mathematical proofs', 'Quantitative analysis', 'Formal systems'],
      causal: ['Cause-effect analysis', 'Intervention planning', 'Mechanism understanding'],
      bayesian: ['Uncertain reasoning', 'Belief updating', 'Probabilistic inference'],
      abductive: ['Hypothesis generation', 'Explanation', 'Diagnostic reasoning'],
      analogical: ['Transfer learning', 'Pattern mapping', 'Creative problem-solving'],
    };
    return mapping[mode] || ['General reasoning'];
  }

  /**
   * Get mode strengths
   */
  private getStrengths(mode: ThinkingMode): string[] {
    const mapping: Partial<Record<ThinkingMode, string[]>> = {
      sequential: ['Rigorous', 'Systematic', 'Reliable'],
      mathematics: ['Precise', 'Provable', 'Universal'],
      causal: ['Explanatory', 'Predictive', 'Actionable'],
      bayesian: ['Quantified uncertainty', 'Principled updating', 'Handles evidence'],
      abductive: ['Creative', 'Explanatory', 'Practical'],
      analogical: ['Insightful', 'Transfer knowledge', 'Novel solutions'],
    };
    return mapping[mode] || ['Versatile'];
  }

  /**
   * Get mode weaknesses
   */
  private getWeaknesses(mode: ThinkingMode): string[] {
    const mapping: Partial<Record<ThinkingMode, string[]>> = {
      sequential: ['Can be slow', 'May miss big picture', 'Rigid'],
      mathematics: ['Abstract', 'May be impractical', 'Requires formalization'],
      causal: ['Hard to establish causation', 'Confounders', 'Complexity'],
      bayesian: ['Requires priors', 'Computationally intensive', 'Prior sensitivity'],
      abductive: ['Not deductively valid', 'Multiple explanations', 'Confirmation bias risk'],
      analogical: ['Superficial similarities', 'Disanalogies', 'Limited rigor'],
    };
    return mapping[mode] || ['Context-dependent'];
  }

  /**
   * Get mode prerequisites
   */
  private getPrerequisites(mode: ThinkingMode): string[] {
    const mapping: Partial<Record<ThinkingMode, string[]>> = {
      sequential: ['Logic', 'Clear premises'],
      mathematics: ['Mathematical background', 'Formal notation'],
      causal: ['Domain knowledge', 'Data'],
      bayesian: ['Probability theory', 'Prior knowledge'],
      abductive: ['Domain knowledge', 'Explanatory frameworks'],
      analogical: ['Broad knowledge', 'Pattern recognition'],
    };
    return mapping[mode] || ['Basic reasoning skills'];
  }

  /**
   * Get mode alternatives
   */
  private getAlternatives(mode: ThinkingMode): string[] {
    const alternatives: Partial<Record<ThinkingMode, string[]>> = {
      sequential: ['mathematics', 'causal'],
      mathematics: ['sequential', 'bayesian'],
      causal: ['bayesian', 'counterfactual'],
      bayesian: ['causal', 'evidential'],
      abductive: ['bayesian', 'analogical'],
      analogical: ['abductive', 'causal'],
    };
    return alternatives[mode] || [];
  }

  /**
   * Generate meta-reasoning recommendations
   */
  generateRecommendations(
    judgments: MetacognitiveJudgment[],
    biases: CognitiveBias[],
    strategy: ReasoningStrategy
  ): string[] {
    const recommendations: string[] = [];

    // Based on quality judgments
    const ineffectiveAspects = judgments.filter(j => j.judgment === 'ineffective' || j.judgment === 'needs_improvement');
    for (const aspect of ineffectiveAspects) {
      recommendations.push(...aspect.recommendations);
    }

    // Based on biases
    if (biases.length > 0) {
      recommendations.push('Detected cognitive biases:');
      for (const bias of biases) {
        recommendations.push(`  - ${bias.name}: ${bias.mitigation[0]}`);
      }
    }

    // Based on strategy
    if (strategy.weaknesses.length > 0) {
      recommendations.push(`Consider addressing ${strategy.name} weaknesses:`);
      recommendations.push(`  - ${strategy.weaknesses[0]}`);
    }

    if (strategy.alternatives.length > 0) {
      recommendations.push(`Alternative approaches: ${strategy.alternatives.join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Generate reflection prompts
   */
  generateReflectionPrompts(_session: ThinkingSession): string[] {
    return [
      'What reasoning mode was most effective in this session?',
      'What assumptions did I make that should be questioned?',
      'Are there alternative perspectives I haven\'t considered?',
      'What evidence would change my conclusion?',
      'How confident am I in this reasoning?',
      'What could go wrong with this approach?',
      'Have I been thorough enough?',
      'Is my reasoning free from logical fallacies?',
      'Am I being influenced by cognitive biases?',
      'What would an expert in this domain think?',
    ];
  }

  /**
   * Generate meta-reasoning summary
   */
  generateMetaReasoningSummary(
    session: ThinkingSession,
    judgments: MetacognitiveJudgment[],
    biases: CognitiveBias[],
    strategy: ReasoningStrategy
  ): string {
    const report: string[] = [];

    report.push('# Meta-Reasoning Analysis');
    report.push('');
    report.push(`## Session: ${session.title}`);
    report.push('');

    report.push('## Quality Assessment');
    for (const judgment of judgments) {
      const icon = judgment.judgment === 'effective' ? '✓' : judgment.judgment === 'ineffective' ? '✗' : '?';
      report.push(`${icon} **${judgment.aspect}**: ${judgment.judgment} (confidence: ${(judgment.confidence * 100).toFixed(0)}%)`);
      if (judgment.evidence.length > 0) {
        report.push(`  Evidence: ${judgment.evidence[0]}`);
      }
    }
    report.push('');

    report.push('## Cognitive Biases');
    if (biases.length === 0) {
      report.push('No significant biases detected.');
    } else {
      for (const bias of biases) {
        report.push(`- **${bias.name}** (${bias.severity}): ${bias.description}`);
        report.push(`  Mitigation: ${bias.mitigation[0]}`);
      }
    }
    report.push('');

    report.push('## Strategy Evaluation');
    report.push(`**Strategy:** ${strategy.name}`);
    report.push(`**Description:** ${strategy.description}`);
    report.push(`**Strengths:** ${strategy.strengths.join(', ')}`);
    report.push(`**Weaknesses:** ${strategy.weaknesses.join(', ')}`);
    report.push('');

    const recommendations = this.generateRecommendations(judgments, biases, strategy);
    report.push('## Recommendations');
    for (const rec of recommendations) {
      report.push(`- ${rec}`);
    }

    return report.join('\n');
  }
}
