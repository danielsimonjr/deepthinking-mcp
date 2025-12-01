# Meta-Reasoning Mode

**Version**: 6.0.0
**Tool**: `deepthinking_analytical`
**Status**: Stable

## Overview

Meta-reasoning provides **strategic oversight** of your reasoning process. Unlike other modes that focus on solving problems directly, meta-reasoning monitors and evaluates **how** you're thinking, recommending when to switch strategies, assessing quality, and managing cognitive resources.

Think of it as the "executive function" of your reasoning system - it doesn't do the math or build the arguments, but it decides *which* mode to use, *when* to switch, and *whether* you're making progress.

## When to Use Meta-Reasoning

Use meta-reasoning when you need to:

- **Evaluate current strategy effectiveness** - "Is my current approach working?"
- **Decide when to switch modes** - "Should I try a different reasoning method?"
- **Monitor reasoning quality** - "Is my thinking logically sound and well-evidenced?"
- **Allocate cognitive resources** - "How many more thoughts should I spend on this?"
- **Assess uncertainty and confidence** - "How sure am I about this conclusion?"
- **Get unstuck** - "I'm not making progress - what should I try instead?"

### Problem Types Well-Suited for Meta-Reasoning

- **Complex, multi-faceted problems** - High complexity requiring strategic planning
- **Problems with uncertain approaches** - Multiple valid strategies, unclear which is best
- **Long reasoning chains** - Need to monitor progress over many steps
- **Collaborative reasoning** - Coordinating multiple modes or perspectives
- **Adaptive problem-solving** - Requirements changing mid-session

## Core Concepts

### Strategy Monitoring

Meta-reasoning tracks your current strategy:
- **Mode**: Which reasoning mode you're using
- **Approach**: High-level description of the strategy
- **Thoughts Spent**: How many reasoning steps you've taken
- **Progress Indicators**: Signs of forward movement
- **Started At**: When this strategy began

### Strategy Evaluation

Four key metrics assess strategy effectiveness:

1. **Effectiveness** (0-1): Progress relative to effort
   - Formula: `min(1.0, progressMade / thoughtsSpent)`
   - High = making good progress per thought
   - Low = spinning wheels, not advancing

2. **Efficiency** (0-1): Progress per unit time
   - Formula: `min(1.0, progressMade / (timeElapsed / 60000))`
   - High = rapid insights
   - Low = slow, laborious thinking

3. **Confidence** (0-1): Certainty minus issues
   - Formula: `max(0.1, 1.0 - issuesCount * 0.15)`
   - High = few contradictions or problems
   - Low = many issues encountered

4. **Quality Score** (0-1): Weighted combination
   - Formula: `effectiveness * 0.4 + efficiency * 0.2 + confidence * 0.4`
   - Overall assessment of strategy performance

### Recommendations

Meta-reasoning provides four types of recommendations:

- **CONTINUE**: Current strategy is working, keep going
- **SWITCH**: Effectiveness too low, try a different mode
- **REFINE**: Making progress but inefficiently, adjust approach
- **COMBINE**: Use multiple modes in parallel or sequence

Each recommendation includes:
- **Justification**: Why this action is recommended
- **Confidence**: How certain the recommendation is (0-1)
- **Expected Improvement**: What you'll gain from following it

### Alternative Strategies

When current approach is struggling, meta-reasoning suggests alternatives:
- **Mode**: Which reasoning mode to switch to
- **Reasoning**: Why this alternative might work better
- **Expected Benefit**: What this mode offers
- **Switching Cost**: Cognitive overhead of changing (0-1)
- **Recommendation Score**: Overall suitability (0-1)

### Quality Metrics

Six dimensions assess reasoning quality:

1. **Logical Consistency** (0-1): Few contradictions
2. **Evidence Quality** (0-1): Well-supported claims (1 - avgUncertainty)
3. **Completeness** (0-1): Thorough coverage (normalized to 5 thoughts)
4. **Originality** (0-1): Mode diversity (normalized to 3 unique modes)
5. **Clarity** (0-1): Clear progress indicators
6. **Overall Quality** (0-1): Weighted average of above

## Usage Example

```typescript
// Using meta-reasoning through deepthinking_analytical tool
const response = await deepthinking_analytical({
  mode: 'metareasoning',
  thought: 'Evaluating current problem-solving approach for effectiveness',
  thoughtNumber: 5,
  totalThoughts: 10,
  nextThoughtNeeded: true,

  // Current strategy being evaluated
  currentStrategy: {
    mode: ThinkingMode.INDUCTIVE,
    approach: 'Building generalizations from observed patterns',
    startedAt: new Date(),
    thoughtsSpent: 4,
    progressIndicators: ['Found 3 patterns', 'Identified 2 exceptions']
  },

  // Evaluation of current strategy
  strategyEvaluation: {
    effectiveness: 0.65,  // Moderate progress per thought
    efficiency: 0.55,     // Somewhat slow
    confidence: 0.75,     // Fairly confident, few issues
    progressRate: 0.65,   // Decent insight rate
    qualityScore: 0.65,   // Overall moderate quality
    issues: ['Limited sample size', 'Potential selection bias'],
    strengths: ['Clear patterns emerging', 'Rigorous data collection']
  },

  // Recommended action
  recommendation: {
    action: 'REFINE',
    justification: 'Making progress but efficiency is low - consider more systematic sampling',
    confidence: 0.70,
    expectedImprovement: 'Faster pattern recognition with better data coverage'
  },

  // Quality assessment
  qualityMetrics: {
    logicalConsistency: 0.80,
    evidenceQuality: 0.70,
    completeness: 0.60,
    originality: 0.65,
    clarity: 0.75,
    overallQuality: 0.70
  }
});
```

## Auto-Switching Thresholds

Meta-reasoning integrates with `ModeRouter` for adaptive mode switching:

### Suggestion Threshold (effectiveness < 0.4)
- `evaluateAndSuggestSwitch()` recommends alternatives
- User decides whether to switch
- Conservative threshold - suggests when clearly struggling

### Auto-Switch Threshold (effectiveness < 0.3)
- `autoSwitchIfNeeded()` automatically switches modes
- Prevents thrashing (doesn't switch if already switching frequently)
- Emergency fallback when strategy is clearly failing

## Integration with Other Modes

Meta-reasoning works alongside all 20 reasoning modes:

### Monitoring
- Tracks which modes you've used (`modesUsed`)
- Counts mode switches (`modeSwitches`)
- Records mode transition history

### Coordination
- **Hybrid Mode**: Meta-reasoning orchestrates which sub-modes to use
- **Sequential Combinations**: Suggests mode sequences (e.g., Temporal → Causal)
- **Parallel Combinations**: Recommends using multiple modes simultaneously

### Quality Control
- Validates mode-switching decisions
- Prevents premature switching (thrashing)
- Ensures each mode gets sufficient effort before giving up

## Best Practices

### When to Meta-Reason

✅ **Do use meta-reasoning:**
- At decision points (should I continue or switch?)
- When feeling stuck or uncertain
- After completing major reasoning steps
- For complex, multi-stage problems
- When coordinating multiple modes

❌ **Don't overuse meta-reasoning:**
- On every single thought (creates overhead)
- For simple, straightforward problems
- When you're making clear progress
- As a substitute for actual reasoning

### Interpreting Metrics

**Effectiveness < 0.4**: Strong signal to consider alternatives
**Efficiency < 0.5**: Strategy works but is slow - consider refinements
**Confidence < 0.6**: Many issues encountered - review assumptions
**Quality Score < 0.5**: Overall poor performance - switch strategies

### Resource Allocation

Meta-reasoning tracks:
- **Time Spent**: Elapsed time on current strategy
- **Thoughts Remaining**: Budget for completion
- **Complexity Level**: Problem difficulty (low/medium/high)
- **Urgency**: Time pressure (low/medium/high)

Use this to decide:
- How many more thoughts to allocate
- Whether to switch to faster (but less thorough) mode
- When to accept "good enough" vs. pursuing perfection

## Example: Debugging a Stuck Problem

```typescript
// Thought 1: Initial approach with Deductive reasoning
{
  mode: ThinkingMode.DEDUCTIVE,
  thought: 'Attempting to derive solution from first principles...',
  // ... making no progress after 3 thoughts
}

// Thought 4: Meta-reasoning evaluation
{
  mode: ThinkingMode.METAREASONING,
  thought: 'Evaluating deductive approach - low effectiveness detected',
  currentStrategy: {
    mode: ThinkingMode.DEDUCTIVE,
    approach: 'Logical derivation from axioms',
    thoughtsSpent: 3,
    progressIndicators: []  // No progress!
  },
  strategyEvaluation: {
    effectiveness: 0.25,  // Very low
    confidence: 0.60,
    qualityScore: 0.35
  },
  recommendation: {
    action: 'SWITCH',
    justification: 'Deductive approach not yielding results - problem may require empirical investigation',
    confidence: 0.80,
    expectedImprovement: 'Inductive pattern recognition could reveal insights'
  },
  alternativeStrategies: [
    {
      mode: ThinkingMode.INDUCTIVE,
      reasoning: 'Gather empirical observations and build patterns',
      recommendationScore: 0.85
    },
    {
      mode: ThinkingMode.ABDUCTIVE,
      reasoning: 'Generate hypotheses and test explanatory power',
      recommendationScore: 0.75
    }
  ]
}

// Thought 5: Switch to Inductive based on recommendation
{
  mode: ThinkingMode.INDUCTIVE,
  thought: 'Collecting specific examples to identify patterns...',
  // ... now making progress
}
```

## API Reference

### MetaReasoningThought Type

```typescript
interface MetaReasoningThought extends BaseThought {
  mode: ThinkingMode.METAREASONING;
  currentStrategy: CurrentStrategy;
  strategyEvaluation: StrategyEvaluation;
  alternativeStrategies: AlternativeStrategy[];
  recommendation: StrategyRecommendation;
  resourceAllocation: ResourceAllocation;
  qualityMetrics: QualityMetrics;
  sessionContext: SessionContext;
}
```

### CurrentStrategy

```typescript
interface CurrentStrategy {
  mode: ThinkingMode;
  approach: string;
  startedAt: Date;
  thoughtsSpent: number;
  progressIndicators: string[];
}
```

### StrategyEvaluation

```typescript
interface StrategyEvaluation {
  effectiveness: number;      // 0-1: progress per effort
  efficiency: number;          // 0-1: progress per time
  confidence: number;          // 0-1: certainty level
  progressRate: number;        // insights per thought
  qualityScore: number;        // 0-1: weighted overall
  issues: string[];            // Problems encountered
  strengths: string[];         // What's working well
}
```

### StrategyRecommendation

```typescript
interface StrategyRecommendation {
  action: 'CONTINUE' | 'SWITCH' | 'REFINE' | 'COMBINE';
  justification: string;
  confidence: number;          // 0-1
  expectedImprovement: string;
}
```

### AlternativeStrategy

```typescript
interface AlternativeStrategy {
  mode: ThinkingMode;
  reasoning: string;           // Why this alternative
  expectedBenefit: string;     // What it offers
  switchingCost: number;       // 0-1: overhead
  recommendationScore: number; // 0-1: suitability
}
```

### QualityMetrics

```typescript
interface QualityMetrics {
  logicalConsistency: number;  // 0-1
  evidenceQuality: number;     // 0-1
  completeness: number;        // 0-1
  originality: number;         // 0-1
  clarity: number;             // 0-1
  overallQuality: number;      // 0-1: weighted average
}
```

## Related Modes

- **Hybrid Mode**: Meta-reasoning helps orchestrate which sub-modes to use
- **All 20 Modes**: Meta-reasoning can monitor and recommend any mode
- **ModeRecommender**: Provides initial mode suggestions based on problem characteristics

## Limitations

- **Overhead**: Meta-reasoning adds cognitive overhead - use judiciously
- **Requires Context**: Needs sufficient thought history to evaluate effectively
- **Subjective Metrics**: Quality assessment involves judgment calls
- **No Magic Bullet**: Won't solve problems for you - only advises on strategy

## See Also

- [ModeRouter API](../api/MODE_ROUTER.md) - Adaptive mode switching
- [Hybrid Mode](./HYBRID.md) - Multi-modal reasoning coordination
- [Session Management](../api/SESSION_MANAGER.md) - Thought tracking and metrics
