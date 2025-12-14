/**
 * FRAMEWORK-ALIGNED DEEPTHINKING MCP IMPROVEMENTS
 * 
 * This implementation directly maps the "How to Understand Anything" framework
 * to concrete improvements in the DeepThinking MCP server.
 * 
 * SOURCE DOCUMENTS:
 * - HOW_TO_UNDERSTAND_ANYTHING.md (The 7 sections of thinking frameworks)
 * - HOW_TO_UNDERSTAND_ANYTHING___TOOLKIT.md (Decision tree, quick-fire questions, archetypes)
 * 
 * MAPPING STRATEGY:
 * Each section of the framework maps to either:
 * 1. A new thinking mode
 * 2. An enhancement to an existing mode
 * 3. A meta-feature (like autopilot or session guidance)
 */

import { ThinkingMode } from '../types/index.js';

// ============================================================================
// PART 1: THE SEVEN PILLARS → MODE ORGANIZATION
// ============================================================================

/**
 * The Seven Pillars of Understanding from the Toolkit map to mode categories.
 * This provides a user-friendly way to organize and discover modes.
 */
export const SEVEN_PILLARS = {
  // Pillar 1: FOUNDATIONS → "Break it down, build it up"
  FOUNDATIONS: {
    description: 'Break it down, build it up',
    modes: [
      ThinkingMode.FIRSTPRINCIPLES,  // "Reduce to basic elements"
      ThinkingMode.SEQUENTIAL,        // Decomposition step-by-step
      ThinkingMode.ENGINEERING,       // Structural decomposition
    ],
    keyQuestions: [
      'What are the fundamental components?',
      'What are the key drivers (20% that explain 80%)?',
      'What\'s the structure? Can I draw it?',
      'Am I at the right level of abstraction?',
    ],
  },

  // Pillar 2: PATTERNS → "What's this like? What usually happens?"
  PATTERNS: {
    description: 'What\'s this like? What usually happens?',
    modes: [
      ThinkingMode.ANALOGICAL,        // "What is this like?"
      ThinkingMode.INDUCTIVE,         // Pattern recognition
      ThinkingMode.SYSTEMSTHINKING,   // System archetypes
    ],
    keyQuestions: [
      'What is this like? What does it remind me of?',
      'What usually happens in cases like this? (base rate)',
      'What system archetype is at play here?',
      'Is this signal or noise?',
    ],
  },

  // Pillar 3: QUESTIONS → "Invert, challenge, reframe"
  QUESTIONS: {
    description: 'Invert, challenge, reframe',
    modes: [
      ThinkingMode.CRITIQUE,          // Challenge assumptions
      ThinkingMode.COUNTERFACTUAL,    // "What if?" scenarios
      ThinkingMode.METAREASONING,     // Question the question
    ],
    keyQuestions: [
      'What if I inverted this?',
      'Why? (Ask 5 times)',
      'What am I assuming? Is it true?',
      'How else could this be framed?',
    ],
  },

  // Pillar 4: SYNTHESIS → "Weave knowledge across domains"
  SYNTHESIS: {
    description: 'Weave knowledge across domains',
    modes: [
      ThinkingMode.SYNTHESIS,         // Literature/idea synthesis
      ThinkingMode.ANALOGICAL,        // Cross-domain transfer
      ThinkingMode.HYBRID,            // Multi-mode integration
    ],
    keyQuestions: [
      'How does this connect to what I already know?',
      'What would different perspectives reveal?',
      'What\'s the general principle here?',
      'Where else could this apply?',
    ],
  },

  // Pillar 5: VALIDATION → "Test against reality"
  VALIDATION: {
    description: 'Test against reality',
    modes: [
      ThinkingMode.SCIENTIFICMETHOD,  // Hypothesis testing
      ThinkingMode.BAYESIAN,          // Update beliefs with evidence
      ThinkingMode.DEDUCTIVE,         // Logical validation
    ],
    keyQuestions: [
      'How could I test this?',
      'What would prove me wrong?',
      'What feedback am I getting?',
      'How confident am I, and is that calibrated?',
    ],
  },

  // Pillar 6: TOOLS → "Visualize, teach, write"
  TOOLS: {
    description: 'Visualize, teach, write',
    modes: [
      ThinkingMode.MATHEMATICS,       // Formal notation
      ThinkingMode.FORMALLOGIC,       // Logical structure
      // Note: Visualization is handled by export system, not a mode
    ],
    keyQuestions: [
      'Can I draw this as a diagram?',
      'Can I explain this simply (Feynman technique)?',
      'What would change if I wrote this down?',
    ],
  },

  // Pillar 7: MINDSET → "Stay curious, humble, aware"
  MINDSET: {
    description: 'Stay curious, humble, aware',
    modes: [
      ThinkingMode.METAREASONING,     // Self-awareness of thinking
      ThinkingMode.CRITIQUE,          // Intellectual humility
    ],
    keyQuestions: [
      'Am I actually understanding or just going through motions?',
      'What assumption was challenged or confirmed?',
      'What question emerged that I want to explore?',
    ],
  },
} as const;

// ============================================================================
// PART 2: PROBLEM-SOLVING DECISION TREE → AUTOPILOT LOGIC
// ============================================================================

/**
 * Direct implementation of the Problem-Solving Decision Tree from the Toolkit.
 * 
 * The tree has this structure:
 * 
 * START: I need to understand something / solve a problem
 *    │
 *    ▼
 * Is this familiar?
 *    │
 *  YES → Use pattern matching
 *   NO → Break it down (decomposition)
 *         → Search for analogies
 *         → Identify key drivers
 *    │
 *    ▼
 * HYPOTHESIZE
 *    │
 *    ▼
 * Try to falsify (What would prove me wrong?)
 *    │
 * SURVIVES → Increase confidence, Apply solution
 * FALSIFIED → Reframe problem, Challenge assumptions, Loop back
 */

export interface DecisionTreeResult {
  /** Current node in the decision tree */
  currentNode: DecisionTreeNode;
  /** Recommended thinking mode for this node */
  recommendedMode: ThinkingMode;
  /** Sequence of modes to use if following the full tree */
  modeSequence: ThinkingMode[];
  /** Key question to ask at this stage */
  keyQuestion: string;
  /** What to do next based on the answer */
  nextSteps: {
    ifYes: string;
    ifNo: string;
  };
  /** Relevant pillar from the Seven Pillars */
  pillar: keyof typeof SEVEN_PILLARS;
}

export type DecisionTreeNode =
  | 'START'
  | 'IS_FAMILIAR'
  | 'PATTERN_MATCHING'
  | 'DECOMPOSITION'
  | 'SEARCH_ANALOGIES'
  | 'IDENTIFY_DRIVERS'
  | 'HYPOTHESIZE'
  | 'FALSIFY'
  | 'APPLY_SOLUTION'
  | 'REFRAME';

/**
 * Walk the decision tree based on problem characteristics.
 * This is the core autopilot logic.
 */
export function walkDecisionTree(
  problemDescription: string,
  previousAnswers: Map<DecisionTreeNode, boolean> = new Map()
): DecisionTreeResult {
  
  // Analyze problem to determine familiarity
  const familiarity = assessFamiliarity(problemDescription);
  
  // START → IS_FAMILIAR
  if (!previousAnswers.has('IS_FAMILIAR')) {
    return {
      currentNode: 'IS_FAMILIAR',
      recommendedMode: ThinkingMode.ANALOGICAL,
      modeSequence: [],
      keyQuestion: 'Is this problem familiar? Have you seen something like this before?',
      nextSteps: {
        ifYes: 'Use pattern matching - apply what worked before',
        ifNo: 'Break it down - decompose into smaller parts',
      },
      pillar: 'PATTERNS',
    };
  }
  
  const isFamiliar = previousAnswers.get('IS_FAMILIAR');
  
  // YES branch → PATTERN_MATCHING
  if (isFamiliar) {
    if (!previousAnswers.has('PATTERN_MATCHING')) {
      return {
        currentNode: 'PATTERN_MATCHING',
        recommendedMode: ThinkingMode.ANALOGICAL,
        modeSequence: [ThinkingMode.ANALOGICAL, ThinkingMode.DEDUCTIVE],
        keyQuestion: 'What pattern does this match? What worked in similar cases?',
        nextSteps: {
          ifYes: 'Form a hypothesis based on the pattern',
          ifNo: 'The pattern may not apply - try decomposition instead',
        },
        pillar: 'PATTERNS',
      };
    }
  }
  
  // NO branch → DECOMPOSITION → ANALOGIES → KEY_DRIVERS
  if (!isFamiliar) {
    if (!previousAnswers.has('DECOMPOSITION')) {
      return {
        currentNode: 'DECOMPOSITION',
        recommendedMode: ThinkingMode.FIRSTPRINCIPLES,
        modeSequence: [
          ThinkingMode.FIRSTPRINCIPLES,
          ThinkingMode.ANALOGICAL,
          ThinkingMode.INDUCTIVE,
        ],
        keyQuestion: 'What are the fundamental components? Can you break this down?',
        nextSteps: {
          ifYes: 'Good - now search for analogies',
          ifNo: 'Try a different angle - what do you know for certain?',
        },
        pillar: 'FOUNDATIONS',
      };
    }
    
    if (!previousAnswers.has('SEARCH_ANALOGIES')) {
      return {
        currentNode: 'SEARCH_ANALOGIES',
        recommendedMode: ThinkingMode.ANALOGICAL,
        modeSequence: [ThinkingMode.ANALOGICAL, ThinkingMode.INDUCTIVE],
        keyQuestion: 'What is this like? What does it remind you of from other domains?',
        nextSteps: {
          ifYes: 'Use the analogy to identify key drivers',
          ifNo: 'Focus on identifying key drivers directly',
        },
        pillar: 'PATTERNS',
      };
    }
    
    if (!previousAnswers.has('IDENTIFY_DRIVERS')) {
      return {
        currentNode: 'IDENTIFY_DRIVERS',
        recommendedMode: ThinkingMode.CAUSAL,
        modeSequence: [ThinkingMode.CAUSAL, ThinkingMode.SYSTEMSTHINKING],
        keyQuestion: 'What are the key drivers? What 20% explains 80% of the outcome?',
        nextSteps: {
          ifYes: 'Form a hypothesis about how these drivers interact',
          ifNo: 'Decompose further until you find the drivers',
        },
        pillar: 'FOUNDATIONS',
      };
    }
  }
  
  // Both branches converge → HYPOTHESIZE
  if (!previousAnswers.has('HYPOTHESIZE')) {
    return {
      currentNode: 'HYPOTHESIZE',
      recommendedMode: ThinkingMode.ABDUCTIVE,
      modeSequence: [ThinkingMode.ABDUCTIVE, ThinkingMode.DEDUCTIVE],
      keyQuestion: 'What is your best hypothesis? What explanation fits the evidence?',
      nextSteps: {
        ifYes: 'Try to falsify it - what would prove you wrong?',
        ifNo: 'Go back and gather more information',
      },
      pillar: 'VALIDATION',
    };
  }
  
  // HYPOTHESIZE → FALSIFY
  if (!previousAnswers.has('FALSIFY')) {
    return {
      currentNode: 'FALSIFY',
      recommendedMode: ThinkingMode.SCIENTIFICMETHOD,
      modeSequence: [ThinkingMode.SCIENTIFICMETHOD, ThinkingMode.CRITIQUE],
      keyQuestion: 'What would prove this hypothesis wrong? Can you find counter-evidence?',
      nextSteps: {
        ifYes: 'Hypothesis falsified - reframe the problem',
        ifNo: 'Hypothesis survives - increase confidence and apply',
      },
      pillar: 'VALIDATION',
    };
  }
  
  const wasFalsified = previousAnswers.get('FALSIFY');
  
  // FALSIFIED → REFRAME
  if (wasFalsified) {
    return {
      currentNode: 'REFRAME',
      recommendedMode: ThinkingMode.CRITIQUE,
      modeSequence: [ThinkingMode.CRITIQUE, ThinkingMode.FIRSTPRINCIPLES],
      keyQuestion: 'How else could you frame this problem? What assumptions should you challenge?',
      nextSteps: {
        ifYes: 'Good - loop back to decomposition with new frame',
        ifNo: 'Consider if you\'re solving the right problem',
      },
      pillar: 'QUESTIONS',
    };
  }
  
  // SURVIVES → APPLY
  return {
    currentNode: 'APPLY_SOLUTION',
    recommendedMode: ThinkingMode.ENGINEERING,
    modeSequence: [ThinkingMode.ENGINEERING, ThinkingMode.OPTIMIZATION],
    keyQuestion: 'How will you implement this solution? What\'s the action plan?',
    nextSteps: {
      ifYes: 'Execute and monitor for feedback',
      ifNo: 'Consider what\'s blocking implementation',
    },
    pillar: 'VALIDATION',
  };
}

/**
 * Assess problem familiarity based on description.
 * Uses indicators from the framework.
 */
function assessFamiliarity(problemDescription: string): number {
  const text = problemDescription.toLowerCase();
  let familiarityScore = 0.5; // Start neutral
  
  // Indicators of familiarity (user knows something about it)
  const familiarIndicators = [
    /i've (seen|dealt with|encountered|tried)/i,
    /similar to (before|last time|what we did)/i,
    /reminds me of/i,
    /like when/i,
    /we (usually|always|typically)/i,
    /standard|normal|typical|common/i,
  ];
  
  // Indicators of unfamiliarity
  const unfamiliarIndicators = [
    /never (seen|encountered|dealt)/i,
    /completely new/i,
    /no idea (how|what|why)/i,
    /confused|puzzled|stumped/i,
    /don't understand/i,
    /first time/i,
    /unfamiliar|unknown|strange/i,
  ];
  
  for (const pattern of familiarIndicators) {
    if (pattern.test(text)) familiarityScore += 0.15;
  }
  
  for (const pattern of unfamiliarIndicators) {
    if (pattern.test(text)) familiarityScore -= 0.15;
  }
  
  return Math.max(0, Math.min(1, familiarityScore));
}

// ============================================================================
// PART 3: THE 12 SYSTEMS ARCHETYPES → SYSTEMSTHINKING MODE ENHANCEMENT
// ============================================================================

/**
 * The 12 Systems Archetypes from the Toolkit.
 * These should be integrated into the SystemsThinking mode handler.
 */
export const SYSTEMS_ARCHETYPES = {
  BALANCING_WITH_DELAY: {
    name: 'Balancing Process with Delay',
    pattern: 'Oscillation around a goal',
    warningSign: 'Overcorrection, instability',
    intervention: 'Slow down responses; patience',
    keywords: ['oscillat', 'overcorrect', 'unstable', 'feedback delay', 'lag'],
  },
  LIMITS_TO_GROWTH: {
    name: 'Limits to Growth',
    pattern: 'Growth hits a ceiling',
    warningSign: 'Slowing returns on effort',
    intervention: 'Identify and remove/expand the constraint',
    keywords: ['plateau', 'ceiling', 'diminishing returns', 'saturat', 'limit'],
  },
  SHIFTING_THE_BURDEN: {
    name: 'Shifting the Burden',
    pattern: 'Quick fix weakens long-term capacity',
    warningSign: 'Dependency on symptom treatment',
    intervention: 'Invest in fundamental solution',
    keywords: ['quick fix', 'band-aid', 'workaround', 'dependency', 'symptom'],
  },
  ERODING_GOALS: {
    name: 'Eroding Goals',
    pattern: 'Standards gradually slip',
    warningSign: '"It\'s not that bad" rationalization',
    intervention: 'Lock in standards; resist compromise',
    keywords: ['slip', 'erode', 'lower standard', 'not that bad', 'compromise'],
  },
  ESCALATION: {
    name: 'Escalation',
    pattern: 'Competitive spiral',
    warningSign: 'Each side feels they\'re "responding"',
    intervention: 'Unilateral de-escalation; negotiate',
    keywords: ['arms race', 'escalat', 'retaliat', 'one-up', 'spiral'],
  },
  SUCCESS_TO_SUCCESSFUL: {
    name: 'Success to the Successful',
    pattern: 'Winner takes all',
    warningSign: 'Rich get richer dynamics',
    intervention: 'Rebalance resources; level playing field',
    keywords: ['winner take', 'rich get richer', 'matthew effect', 'monopol'],
  },
  TRAGEDY_OF_COMMONS: {
    name: 'Tragedy of the Commons',
    pattern: 'Shared resource depleted',
    warningSign: 'Individual incentives misaligned',
    intervention: 'Create feedback; governance; privatization',
    keywords: ['commons', 'shared resource', 'depletion', 'overuse', 'free rider'],
  },
  FIXES_THAT_FAIL: {
    name: 'Fixes that Fail',
    pattern: 'Solutions create new problems',
    warningSign: 'Unintended consequences mounting',
    intervention: 'Systems thinking; consider side effects',
    keywords: ['unintended', 'backfire', 'side effect', 'made it worse'],
  },
  GROWTH_AND_UNDERINVESTMENT: {
    name: 'Growth and Underinvestment',
    pattern: 'Growth outpaces infrastructure',
    warningSign: 'Quality declining; capacity stretched',
    intervention: 'Invest ahead of demand',
    keywords: ['outpace', 'infrastructure', 'capacity', 'scaling', 'growing pains'],
  },
  ACCIDENTAL_ADVERSARIES: {
    name: 'Accidental Adversaries',
    pattern: 'Allies become enemies',
    warningSign: 'Misunderstanding partner motivations',
    intervention: 'Communicate; clarify intentions',
    keywords: ['partner', 'ally', 'misunderstand', 'adversar', 'relationship'],
  },
  ATTRACTIVENESS_PRINCIPLE: {
    name: 'Attractiveness Principle',
    pattern: 'Success attracts more demand',
    warningSign: 'Overwhelmed by popularity',
    intervention: 'Manage growth; selective scaling',
    keywords: ['popular', 'demand', 'overwhelm', 'victim of success'],
  },
  RULE_BEATING: {
    name: 'Rule Beating',
    pattern: 'People game the metrics',
    warningSign: 'Letter-of-law compliance',
    intervention: 'Align metrics with actual goals',
    keywords: ['gaming', 'metric', 'loophole', 'letter of the law', 'goodhart'],
  },
} as const;

/**
 * Detect which system archetype best matches a problem description.
 * This should be called by the SystemsThinking mode handler.
 */
export function detectSystemArchetype(
  problemDescription: string
): {
  archetype: keyof typeof SYSTEMS_ARCHETYPES | null;
  confidence: number;
  intervention: string;
} {
  const text = problemDescription.toLowerCase();
  let bestMatch: keyof typeof SYSTEMS_ARCHETYPES | null = null;
  let bestScore = 0;
  
  for (const [key, archetype] of Object.entries(SYSTEMS_ARCHETYPES)) {
    let score = 0;
    for (const keyword of archetype.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = key as keyof typeof SYSTEMS_ARCHETYPES;
    }
  }
  
  const confidence = bestMatch ? Math.min(bestScore / 3, 1) : 0;
  const intervention = bestMatch 
    ? SYSTEMS_ARCHETYPES[bestMatch].intervention 
    : 'No clear archetype detected - analyze system structure first';
  
  return { archetype: bestMatch, confidence, intervention };
}

// ============================================================================
// PART 4: COGNITIVE BIAS QUICK-DEFENSE → VALIDATION ENHANCEMENT
// ============================================================================

/**
 * Cognitive biases from the Toolkit with countermeasures.
 * These should be surfaced during validation phases.
 */
export const COGNITIVE_BIASES = {
  CONFIRMATION_BIAS: {
    name: 'Confirmation Bias',
    description: 'Seeing only supporting evidence',
    counter: 'Actively seek disconfirmation',
    checkQuestion: 'What evidence would change your mind?',
  },
  HINDSIGHT_BIAS: {
    name: 'Hindsight Bias',
    description: '"I knew it all along"',
    counter: 'Record predictions before outcomes',
    checkQuestion: 'Did you actually predict this, or does it just seem obvious now?',
  },
  AVAILABILITY_BIAS: {
    name: 'Availability Bias',
    description: 'Overweighting vivid/recent info',
    counter: 'Ask for base rates',
    checkQuestion: 'What usually happens in cases like this? (Not just memorable cases)',
  },
  ANCHORING: {
    name: 'Anchoring',
    description: 'Over-relying on first numbers',
    counter: 'Generate multiple anchors',
    checkQuestion: 'What other reference points could you use?',
  },
  SUNK_COST_FALLACY: {
    name: 'Sunk Cost Fallacy',
    description: 'Continuing due to past investment',
    counter: 'Ask: Would I start this today?',
    checkQuestion: 'If you were starting fresh, would you choose this path?',
  },
  DUNNING_KRUGER: {
    name: 'Dunning-Kruger Effect',
    description: 'Novices overconfident, experts under',
    counter: 'Seek calibration feedback',
    checkQuestion: 'How well calibrated have your past predictions been?',
  },
  FUNDAMENTAL_ATTRIBUTION_ERROR: {
    name: 'Fundamental Attribution Error',
    description: 'Blaming character vs. situation',
    counter: 'Ask: What situation might cause this?',
    checkQuestion: 'What circumstances could lead a reasonable person to this outcome?',
  },
  PLANNING_FALLACY: {
    name: 'Planning Fallacy',
    description: 'Underestimating time/cost',
    counter: 'Use reference class forecasting',
    checkQuestion: 'How long did similar projects actually take?',
  },
  SURVIVORSHIP_BIAS: {
    name: 'Survivorship Bias',
    description: 'Only seeing winners',
    counter: 'Ask: Where are the failures?',
    checkQuestion: 'What happened to all the others who tried this?',
  },
  STATUS_QUO_BIAS: {
    name: 'Status Quo Bias',
    description: 'Preferring current state',
    counter: 'Evaluate as if choosing fresh',
    checkQuestion: 'If you weren\'t already doing it this way, would you choose it?',
  },
} as const;

/**
 * Generate bias warnings relevant to a problem context.
 * This should be called during VALIDATION pillar modes.
 */
export function getBiasWarnings(problemDescription: string): Array<{
  bias: keyof typeof COGNITIVE_BIASES;
  relevance: number;
  checkQuestion: string;
}> {
  const text = problemDescription.toLowerCase();
  const warnings: Array<{
    bias: keyof typeof COGNITIVE_BIASES;
    relevance: number;
    checkQuestion: string;
  }> = [];
  
  // Check for planning/estimation context
  if (/how long|estimate|timeline|schedule|deadline|budget/i.test(text)) {
    warnings.push({
      bias: 'PLANNING_FALLACY',
      relevance: 0.9,
      checkQuestion: COGNITIVE_BIASES.PLANNING_FALLACY.checkQuestion,
    });
  }
  
  // Check for success story context
  if (/success|worked|effective|they did|example of/i.test(text)) {
    warnings.push({
      bias: 'SURVIVORSHIP_BIAS',
      relevance: 0.8,
      checkQuestion: COGNITIVE_BIASES.SURVIVORSHIP_BIAS.checkQuestion,
    });
  }
  
  // Check for attribution context
  if (/why did (they|he|she)|because (they|he|she)|fault|blame|responsible/i.test(text)) {
    warnings.push({
      bias: 'FUNDAMENTAL_ATTRIBUTION_ERROR',
      relevance: 0.85,
      checkQuestion: COGNITIVE_BIASES.FUNDAMENTAL_ATTRIBUTION_ERROR.checkQuestion,
    });
  }
  
  // Check for sunk cost context
  if (/invested|already spent|so far|continue|give up|abandon/i.test(text)) {
    warnings.push({
      bias: 'SUNK_COST_FALLACY',
      relevance: 0.9,
      checkQuestion: COGNITIVE_BIASES.SUNK_COST_FALLACY.checkQuestion,
    });
  }
  
  // Always warn about confirmation bias for hypothesis evaluation
  if (/hypothesis|believe|think that|evidence|support/i.test(text)) {
    warnings.push({
      bias: 'CONFIRMATION_BIAS',
      relevance: 0.75,
      checkQuestion: COGNITIVE_BIASES.CONFIRMATION_BIAS.checkQuestion,
    });
  }
  
  return warnings.sort((a, b) => b.relevance - a.relevance);
}

// ============================================================================
// PART 5: EMERGENCY THINKING PROTOCOLS → STUCK DETECTION
// ============================================================================

/**
 * Emergency protocols from the Toolkit for when thinking gets stuck.
 */
export const EMERGENCY_PROTOCOLS = {
  WHEN_STUCK: {
    name: 'When Stuck on a Problem',
    steps: [
      { action: 'Step away', detail: 'Take a 10-minute break; let diffuse mode work' },
      { action: 'Change representation', detail: 'Draw it, talk it out, write it differently' },
      { action: 'Invert', detail: 'What would make this worse? Avoid that' },
      { action: 'Analogize', detail: 'What similar problem has been solved elsewhere?' },
      { action: 'Decompose further', detail: 'What\'s the smallest piece I can tackle?' },
      { action: 'Question the question', detail: 'Am I solving the right problem?' },
    ],
    suggestedModes: [
      ThinkingMode.COUNTERFACTUAL,  // Invert
      ThinkingMode.ANALOGICAL,      // Analogize
      ThinkingMode.FIRSTPRINCIPLES, // Decompose
      ThinkingMode.METAREASONING,   // Question the question
    ],
  },
  
  WHEN_WRONG: {
    name: 'When You Realize You\'re Wrong',
    steps: [
      { action: 'Celebrate', detail: 'You\'ve upgraded your model of reality' },
      { action: 'Document', detail: 'What did I believe? What\'s the new evidence?' },
      { action: 'Diagnose', detail: 'Why was I wrong? What led me astray?' },
      { action: 'Update', detail: 'How should my beliefs change?' },
      { action: 'Propagate', detail: 'What else might need updating given this?' },
      { action: 'Prevent', detail: 'How can I catch this error type sooner?' },
    ],
    suggestedModes: [
      ThinkingMode.BAYESIAN,        // Update beliefs
      ThinkingMode.CRITIQUE,        // Diagnose
      ThinkingMode.METAREASONING,   // Prevent
    ],
  },
  
  WHEN_OVERWHELMED: {
    name: 'When Overwhelmed by Complexity',
    steps: [
      { action: 'Zoom out', detail: 'What\'s the 50,000-foot view?' },
      { action: 'Find the MVP', detail: 'What\'s the simplest version I need to understand?' },
      { action: 'Identify anchors', detail: 'What do I know for certain?' },
      { action: 'Build from there', detail: 'One step at a time from solid ground' },
      { action: 'Accept incompleteness', detail: 'Partial understanding beats paralysis' },
    ],
    suggestedModes: [
      ThinkingMode.FIRSTPRINCIPLES, // MVP, anchors
      ThinkingMode.SEQUENTIAL,      // Step at a time
    ],
  },
} as const;

/**
 * Detect if a session appears stuck and suggest emergency protocol.
 * This should be called by MetaMonitor during session evaluation.
 */
export function detectStuckState(
  sessionThoughts: Array<{ content: string; thoughtNumber: number }>,
  currentThought: string
): {
  isStuck: boolean;
  stuckType: keyof typeof EMERGENCY_PROTOCOLS | null;
  protocol: typeof EMERGENCY_PROTOCOLS[keyof typeof EMERGENCY_PROTOCOLS] | null;
} {
  // Detect repetition (saying the same thing)
  const recentContents = sessionThoughts.slice(-3).map(t => t.content.toLowerCase());
  const currentLower = currentThought.toLowerCase();
  const repetitionScore = recentContents.filter(c => 
    similarity(c, currentLower) > 0.7
  ).length;
  
  if (repetitionScore >= 2) {
    return {
      isStuck: true,
      stuckType: 'WHEN_STUCK',
      protocol: EMERGENCY_PROTOCOLS.WHEN_STUCK,
    };
  }
  
  // Detect overwhelm indicators
  const overwhelmIndicators = /too complex|overwhelming|don't know where to start|confused|lost/i;
  if (overwhelmIndicators.test(currentThought)) {
    return {
      isStuck: true,
      stuckType: 'WHEN_OVERWHELMED',
      protocol: EMERGENCY_PROTOCOLS.WHEN_OVERWHELMED,
    };
  }
  
  // Detect realization of error
  const errorIndicators = /was wrong|incorrect|mistake|need to revise|actually/i;
  if (errorIndicators.test(currentThought)) {
    return {
      isStuck: false, // Not stuck, but triggered
      stuckType: 'WHEN_WRONG',
      protocol: EMERGENCY_PROTOCOLS.WHEN_WRONG,
    };
  }
  
  return { isStuck: false, stuckType: null, protocol: null };
}

/**
 * Simple string similarity (Jaccard on words)
 */
function similarity(a: string, b: string): number {
  const wordsA = new Set(a.split(/\s+/));
  const wordsB = new Set(b.split(/\s+/));
  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.size / union.size;
}

// ============================================================================
// PART 6: FEYNMAN TECHNIQUE → UNDERSTANDING VALIDATION MODE
// ============================================================================

/**
 * The Feynman Technique steps from the Toolkit.
 * This could be a new mode or a session type.
 */
export interface FeynmanSession {
  concept: string;
  simpleExplanation: string;
  identifiedGaps: string[];
  studiedGaps: string[];
  analogies: string[];
  finalExplanation: string;
  couldOthersUnderstand: boolean;
}

/**
 * Feynman technique prompts for each step.
 */
export const FEYNMAN_STEPS = [
  {
    step: 1,
    name: 'Choose concept',
    prompt: 'Write the topic name on a blank page. What concept are you trying to understand?',
    mode: ThinkingMode.SEQUENTIAL,
  },
  {
    step: 2,
    name: 'Explain simply',
    prompt: 'Write an explanation as if teaching a 12-year-old. No jargon allowed.',
    mode: ThinkingMode.SYNTHESIS,
  },
  {
    step: 3,
    name: 'Identify gaps',
    prompt: 'Circle anything you struggled to simplify. These are your gaps.',
    mode: ThinkingMode.CRITIQUE,
  },
  {
    step: 4,
    name: 'Return to source',
    prompt: 'Study those gaps specifically. What did you learn?',
    mode: ThinkingMode.FIRSTPRINCIPLES,
  },
  {
    step: 5,
    name: 'Simplify & Analogize',
    prompt: 'Create metaphors, examples, and connections. What is this like?',
    mode: ThinkingMode.ANALOGICAL,
  },
  {
    step: 6,
    name: 'Review & Refine',
    prompt: 'Can someone else understand your explanation? Test it.',
    mode: ThinkingMode.CRITIQUE,
  },
] as const;

// ============================================================================
// PART 7: QUICK-FIRE QUESTIONS → SESSION GUIDANCE
// ============================================================================

/**
 * Quick-fire question sets from the Toolkit.
 * These should be surfaced at appropriate points in a session.
 */
export const QUICK_FIRE_QUESTIONS = {
  decomposition: [
    'What are the fundamental components?',
    'What are the key drivers (20% that explain 80%)?',
    'What\'s the structure? Can I draw it?',
    'Am I at the right level of abstraction?',
  ],
  patterns: [
    'What is this like? What does it remind me of?',
    'What usually happens in cases like this? (base rate)',
    'What system archetype is at play here?',
    'Is this signal or noise?',
  ],
  challenge: [
    'What if I inverted this?',
    'Why? (Ask 5 times)',
    'What am I assuming? Is it true?',
    'How else could this be framed?',
  ],
  synthesis: [
    'How does this connect to what I already know?',
    'What would different perspectives reveal?',
    'What\'s the general principle here?',
    'Where else could this apply?',
  ],
  validation: [
    'How could I test this?',
    'What would prove me wrong?',
    'What feedback am I getting?',
    'How confident am I, and is that calibrated?',
  ],
} as const;

/**
 * Get relevant questions based on current mode and session state.
 */
export function getGuidingQuestions(
  mode: ThinkingMode,
  thoughtNumber: number,
  totalThoughts: number
): string[] {
  const questions: string[] = [];
  
  // Early in session → decomposition questions
  if (thoughtNumber <= 2) {
    questions.push(...QUICK_FIRE_QUESTIONS.decomposition.slice(0, 2));
  }
  
  // Mode-specific questions
  switch (mode) {
    case ThinkingMode.FIRSTPRINCIPLES:
    case ThinkingMode.SEQUENTIAL:
      questions.push(...QUICK_FIRE_QUESTIONS.decomposition);
      break;
    case ThinkingMode.ANALOGICAL:
    case ThinkingMode.INDUCTIVE:
      questions.push(...QUICK_FIRE_QUESTIONS.patterns);
      break;
    case ThinkingMode.CRITIQUE:
    case ThinkingMode.COUNTERFACTUAL:
      questions.push(...QUICK_FIRE_QUESTIONS.challenge);
      break;
    case ThinkingMode.SYNTHESIS:
    case ThinkingMode.HYBRID:
      questions.push(...QUICK_FIRE_QUESTIONS.synthesis);
      break;
    case ThinkingMode.SCIENTIFICMETHOD:
    case ThinkingMode.BAYESIAN:
    case ThinkingMode.DEDUCTIVE:
      questions.push(...QUICK_FIRE_QUESTIONS.validation);
      break;
  }
  
  // Late in session → validation questions
  if (thoughtNumber >= totalThoughts - 2) {
    questions.push(...QUICK_FIRE_QUESTIONS.validation.slice(0, 2));
  }
  
  // Deduplicate
  return [...new Set(questions)];
}

// ============================================================================
// PART 8: NEW MODE DEFINITIONS (Based on Framework Gaps)
// ============================================================================

/**
 * NEW MODE: Inversion
 * From "Framing & Questioning Heuristics" section
 * 
 * "Consider the opposite of what you want, or solve backward from the goal state."
 */
export interface InversionModeInput {
  goal: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  
  // Inversion-specific
  failureModes?: Array<{
    description: string;
    likelihood: number;
    severity: number;
  }>;
  antiPatterns?: string[];  // What to avoid
  mitigations?: Array<{
    failureMode: string;
    mitigation: string;
  }>;
  derivedActions?: string[];  // Actions derived by avoiding failures
}

/**
 * NEW MODE: Reference Class
 * From "Pattern Recognition" section - Reference Class Reasoning
 * 
 * "What usually happens in cases like this?"
 */
export interface ReferenceClassModeInput {
  prediction: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  
  // Reference class specific
  referenceClasses?: Array<{
    name: string;
    description: string;
    baseRate: number;  // What % succeed/fail in this class
    sampleSize: number;
    relevance: number;  // How similar to current case
  }>;
  selectedClass?: string;
  distinguishingFeatures?: Array<{
    feature: string;
    direction: 'better' | 'worse' | 'neutral';
    magnitude: number;
  }>;
  adjustedForecast?: {
    baseRate: number;
    adjustment: number;
    finalForecast: number;
    confidence: number;
  };
}

/**
 * NEW MODE: Abstraction Ladder
 * From "Synthesis & Integration" section - Abstraction & Generalization
 * 
 * "Elevate specific insights to more general principles"
 */
export interface AbstractionLadderModeInput {
  observation: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  
  // Abstraction ladder specific
  ladder?: Array<{
    level: 'raw_observation' | 'specific_instance' | 'category' | 'general_rule' | 'universal_principle';
    statement: string;
  }>;
  currentLevel?: string;
  targetLevel?: string;
  transferApplications?: string[];  // Where else this principle applies
}

// ============================================================================
// PART 9: INTEGRATED AUTOPILOT (Using Decision Tree)
// ============================================================================

/**
 * The complete autopilot that uses the framework's decision tree.
 */
export class FrameworkAlignedAutopilot {
  private decisionHistory: Map<DecisionTreeNode, boolean> = new Map();
  
  /**
   * Start a new problem analysis session.
   */
  startSession(problemDescription: string): DecisionTreeResult {
    this.decisionHistory.clear();
    return walkDecisionTree(problemDescription, this.decisionHistory);
  }
  
  /**
   * Answer the current decision point and get next step.
   */
  answerAndProceed(
    problemDescription: string,
    currentNode: DecisionTreeNode,
    answer: boolean
  ): DecisionTreeResult {
    this.decisionHistory.set(currentNode, answer);
    return walkDecisionTree(problemDescription, this.decisionHistory);
  }
  
  /**
   * Get full recommended mode sequence without interactive questions.
   * Uses heuristics to auto-answer the decision tree.
   */
  getFullRecommendation(problemDescription: string): {
    modeSequence: ThinkingMode[];
    reasoning: string[];
    pillarsCovered: Array<keyof typeof SEVEN_PILLARS>;
    biasWarnings: ReturnType<typeof getBiasWarnings>;
    systemArchetype: ReturnType<typeof detectSystemArchetype>;
  } {
    const familiarity = assessFamiliarity(problemDescription);
    const modeSequence: ThinkingMode[] = [];
    const reasoning: string[] = [];
    const pillarsCovered = new Set<keyof typeof SEVEN_PILLARS>();
    
    // Phase 1: Foundation (based on familiarity)
    if (familiarity > 0.6) {
      modeSequence.push(ThinkingMode.ANALOGICAL);
      reasoning.push('Problem seems familiar - starting with pattern matching');
      pillarsCovered.add('PATTERNS');
    } else {
      modeSequence.push(ThinkingMode.FIRSTPRINCIPLES);
      reasoning.push('Problem is unfamiliar - starting with decomposition');
      pillarsCovered.add('FOUNDATIONS');
      
      modeSequence.push(ThinkingMode.ANALOGICAL);
      reasoning.push('Searching for analogies after decomposition');
      pillarsCovered.add('PATTERNS');
    }
    
    // Phase 2: Analysis (based on detected patterns)
    const archetype = detectSystemArchetype(problemDescription);
    if (archetype.archetype && archetype.confidence > 0.5) {
      modeSequence.push(ThinkingMode.SYSTEMSTHINKING);
      reasoning.push(`Detected ${SYSTEMS_ARCHETYPES[archetype.archetype].name} archetype`);
      pillarsCovered.add('PATTERNS');
    }
    
    // Check for causal language
    if (/cause|effect|because|leads to|results in/i.test(problemDescription)) {
      modeSequence.push(ThinkingMode.CAUSAL);
      reasoning.push('Causal relationships detected - adding causal analysis');
      pillarsCovered.add('FOUNDATIONS');
    }
    
    // Phase 3: Hypothesis formation
    modeSequence.push(ThinkingMode.ABDUCTIVE);
    reasoning.push('Forming hypothesis from analysis');
    pillarsCovered.add('SYNTHESIS');
    
    // Phase 4: Validation
    modeSequence.push(ThinkingMode.CRITIQUE);
    reasoning.push('Challenging assumptions and seeking disconfirmation');
    pillarsCovered.add('QUESTIONS');
    pillarsCovered.add('VALIDATION');
    
    // Get bias warnings
    const biasWarnings = getBiasWarnings(problemDescription);
    
    return {
      modeSequence,
      reasoning,
      pillarsCovered: [...pillarsCovered],
      biasWarnings,
      systemArchetype: archetype,
    };
  }
}

// ============================================================================
// PART 10: EXPORTS
// ============================================================================

export {
  walkDecisionTree,
  assessFamiliarity,
  detectSystemArchetype,
  getBiasWarnings,
  detectStuckState,
  getGuidingQuestions,
};
