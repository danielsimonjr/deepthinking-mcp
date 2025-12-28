# Framework → DeepThinking MCP Mapping

## How "How to Understand Anything" Maps to Concrete Improvements

This document shows the direct mapping between each section of the framework documents and specific improvements to the DeepThinking MCP server.

---

## THE SEVEN PILLARS → Mode Organization

**Framework Source:** Toolkit, lines 9-22

```
┌─────────────────────────────────────────────────────────────────────────┐
│   1. FOUNDATIONS        → Break it down, build it up                    │
│   2. PATTERNS           → What's this like? What usually happens?       │
│   3. QUESTIONS          → Invert, challenge, reframe                    │
│   4. SYNTHESIS          → Weave knowledge across domains                │
│   5. VALIDATION         → Test against reality                          │
│   6. TOOLS              → Visualize, teach, write                       │
│   7. MINDSET            → Stay curious, humble, aware                   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Current State:** Your 29 modes are organized by tool (deepthinking_core, deepthinking_causal, etc.) which is technically convenient but not user-friendly.

**Improvement:** Reorganize modes under the Seven Pillars for discoverability:

| Pillar | Current Modes | Gap? |
|--------|---------------|------|
| FOUNDATIONS | `firstprinciples`, `sequential`, `engineering`, `algorithmic` | ✓ Good coverage |
| PATTERNS | `analogical`, `inductive`, `systemsthinking` | Need: Reference Class mode |
| QUESTIONS | `critique`, `counterfactual`, `metareasoning` | Need: Inversion mode |
| SYNTHESIS | `synthesis`, `hybrid` | ✓ Good coverage |
| VALIDATION | `scientificmethod`, `bayesian`, `deductive` | Need: Calibration tracking |
| TOOLS | `mathematics`, `formallogic` | Export system handles this |
| MINDSET | `metareasoning` | Need: Stuck detection |

---

## PROBLEM-SOLVING DECISION TREE → Autopilot Logic

**Framework Source:** Toolkit, lines 158-210

```
START: I need to understand something / solve a problem
           │
           ▼
    Is this familiar?
         │      
    ┌────┴────┐
   YES       NO
    │         │
    ▼         ▼
  Pattern   Decompose → Analogize → Key Drivers
  Matching
    │         │
    └────┬────┘
         ▼
    HYPOTHESIZE → FALSIFY
         │
    ┌────┴────┐
 SURVIVES   FALSIFIED
    │         │
  Apply    Reframe → Loop back
```

**Current State:** Your `quickRecommend()` and `recommendModes()` don't follow this structure.

**Improvement:** Implement `walkDecisionTree()` function that:
1. Asks "Is this familiar?" → Determines pattern-matching vs decomposition path
2. Guides through each node with the appropriate mode
3. Returns a mode sequence, not just a single recommendation

**Implementation:** See `framework-aligned-implementation.ts`, Part 2

---

## THE 12 SYSTEMS ARCHETYPES → SystemsThinking Enhancement

**Framework Source:** Toolkit, lines 68-83

| Archetype | Pattern | Warning Sign | Intervention |
|-----------|---------|--------------|--------------|
| Limits to Growth | Growth hits ceiling | Slowing returns | Remove constraint |
| Shifting the Burden | Quick fix weakens capacity | Dependency | Fundamental solution |
| Escalation | Competitive spiral | "Responding" | De-escalate |
| ... | ... | ... | ... |

**Current State:** Your `systemsthinking` mode exists but doesn't have:
- Archetype detection
- Warning sign identification
- Intervention suggestions

**Improvement:** Add to SystemsThinking mode handler:
```typescript
// Detect archetype from problem description
const archetype = detectSystemArchetype(problemDescription);

// Add to thought output
thought.detectedArchetype = archetype.name;
thought.warningSign = archetype.warningSign;
thought.suggestedIntervention = archetype.intervention;
```

**Implementation:** See `framework-aligned-implementation.ts`, Part 3

---

## QUICK-FIRE QUESTIONS → Session Guidance

**Framework Source:** Toolkit, lines 27-64

```
## The Decomposition Questions
- What are the fundamental components?
- What are the key drivers (20% that explain 80%)?

## The Pattern Questions  
- What is this like? What does it remind me of?
- What usually happens in cases like this? (base rate)

## The Challenge Questions
- What if I inverted this?
- Why? (Ask 5 times)

## The Synthesis Questions
- How does this connect to what I already know?
- What's the general principle here?

## The Validation Questions
- How could I test this?
- What would prove me wrong?
```

**Current State:** No session guidance or prompting questions.

**Improvement:** Add `getGuidingQuestions(mode, thoughtNumber, totalThoughts)` that returns relevant questions based on:
- Current mode (maps to question category)
- Progress through session (early = decomposition, late = validation)

**Usage:** Include in API response:
```json
{
  "sessionId": "...",
  "thoughtId": "...",
  "guidingQuestions": [
    "What are the fundamental components?",
    "What are the key drivers?"
  ]
}
```

**Implementation:** See `framework-aligned-implementation.ts`, Part 7

---

## COGNITIVE BIAS QUICK-DEFENSE → Validation Warnings

**Framework Source:** Toolkit, lines 261-275

| Bias | How to Counter |
|------|----------------|
| Confirmation Bias | Actively seek disconfirmation |
| Planning Fallacy | Use reference class forecasting |
| Survivorship Bias | Ask: Where are the failures? |

**Current State:** No bias awareness in the system.

**Improvement:** Add `getBiasWarnings(problemDescription)` that:
1. Detects context (planning → planning fallacy warning)
2. Returns relevant bias warnings with counter-questions
3. Includes in session output during validation phases

**Implementation:** See `framework-aligned-implementation.ts`, Part 4

---

## EMERGENCY THINKING PROTOCOLS → Stuck Detection

**Framework Source:** Toolkit, lines 388-414

```
## When Stuck on a Problem
1. Step away
2. Change representation
3. Invert
4. Analogize
5. Decompose further
6. Question the question

## When Overwhelmed by Complexity
1. Zoom out
2. Find the MVP
3. Identify anchors
4. Build from there
5. Accept incompleteness
```

**Current State:** MetaMonitor tracks effectiveness but doesn't detect "stuck" states.

**Improvement:** Add `detectStuckState(sessionThoughts, currentThought)` that:
1. Detects repetition (same content multiple times)
2. Detects overwhelm language ("too complex", "confused")
3. Returns appropriate emergency protocol with suggested modes

**Integration:** Call from `handleAddThought()`:
```typescript
const stuckCheck = detectStuckState(session.thoughts, thought.content);
if (stuckCheck.isStuck) {
  response.emergencyProtocol = stuckCheck.protocol;
  response.suggestedModes = stuckCheck.protocol.suggestedModes;
}
```

**Implementation:** See `framework-aligned-implementation.ts`, Part 5

---

## FEYNMAN TECHNIQUE → Understanding Validation

**Framework Source:** Toolkit, lines 302-309

```
1. Choose concept
2. Explain simply (as if to a 12-year-old)
3. Identify gaps (what you couldn't simplify)
4. Return to source (study the gaps)
5. Simplify & Analogize
6. Review & Refine
```

**Current State:** No Feynman-style validation process.

**Improvement Options:**
1. **New Mode:** `feynman` mode that guides through the 6 steps
2. **Session Type:** A Feynman session that chains: Sequential → Synthesis → Critique → FirstPrinciples → Analogical → Critique

**Implementation:** See `framework-aligned-implementation.ts`, Part 6

---

## INVERSION THINKING → New Mode

**Framework Source:** Main doc, lines 198-226 (Section 3: Framing & Questioning)

> "Consider the opposite of what you want, or solve backward from the goal state. Ask 'How could this fail?' and then avoid those paths."

**Current State:** `counterfactual` mode exists but focuses on "what if" scenarios, not systematic failure mode identification.

**New Mode: `inversion`**

```typescript
interface InversionThought extends BaseThought {
  mode: ThinkingMode.INVERSION;
  goal: string;
  failureModes: Array<{
    description: string;
    likelihood: number;
    severity: number;
  }>;
  antiPatterns: string[];
  mitigations: Array<{
    failureMode: string;
    mitigation: string;
  }>;
  derivedActions: string[];  // What to do (by avoiding failures)
}
```

**Implementation:** See `framework-aligned-implementation.ts`, Part 8

---

## REFERENCE CLASS REASONING → New Mode

**Framework Source:** Main doc, lines 164-184 (Section 2: Pattern Recognition)

> "What usually happens in cases like this? Base your judgment on how similar situations have played out, instead of pretending yours is entirely unique."

**Current State:** `bayesian` mode handles probability updates but not reference class identification.

**New Mode: `referenceclass`**

```typescript
interface ReferenceClassThought extends BaseThought {
  mode: ThinkingMode.REFERENCECLASS;
  prediction: string;
  referenceClasses: Array<{
    name: string;
    baseRate: number;
    sampleSize: number;
    relevance: number;
  }>;
  selectedClass: string;
  distinguishingFeatures: Array<{
    feature: string;
    direction: 'better' | 'worse' | 'neutral';
  }>;
  adjustedForecast: {
    baseRate: number;
    adjustment: number;
    finalForecast: number;
  };
}
```

**Implementation:** See `framework-aligned-implementation.ts`, Part 8

---

## ABSTRACTION LADDER → New Mode

**Framework Source:** Toolkit, lines 343-365

```
MOST ABSTRACT    │  Universal principle
                 │       ↑
                 │  General rule
                 │       ↑
                 │  Category/type
                 │       ↑
                 │  Specific instance
                 │       ↑
MOST CONCRETE    │  Raw observation
```

**Current State:** No explicit support for climbing/descending the abstraction ladder.

**New Mode: `abstraction`**

```typescript
interface AbstractionLadderThought extends BaseThought {
  mode: ThinkingMode.ABSTRACTION;
  observation: string;
  ladder: Array<{
    level: 'raw_observation' | 'specific_instance' | 'category' | 'general_rule' | 'universal_principle';
    statement: string;
  }>;
  transferApplications: string[];  // Where the principle applies elsewhere
}
```

---

## SOCRATIC QUESTIONING → Critique Enhancement

**Framework Source:** Toolkit, lines 213-257

```
## Opening Questions (Clarify)
- What exactly do you mean by ___?

## Assumption Questions (Probe)
- What are you assuming here?

## Evidence Questions (Examine)
- How do you know this?

## Perspective Questions (Explore)
- What would someone who disagrees say?

## Implication Questions (Follow)
- If that's true, what follows?

## Meta-Questions (Question the Question)
- Why is this question important?
```

**Current State:** `critique` mode exists but doesn't structure questioning.

**Improvement:** Add Socratic question categories to Critique mode:
```typescript
interface CritiqueThought extends BaseThought {
  // ... existing fields
  socraticQuestions: {
    clarification: string[];
    assumptions: string[];
    evidence: string[];
    perspectives: string[];
    implications: string[];
    metaQuestions: string[];
  };
}
```

---

## MENTAL MODEL STARTER PACK → Mode Prompts

**Framework Source:** Toolkit, lines 87-127

The 25 mental models across 5 domains (Economics, Psychology, Systems, Math, Biology) should be integrated as prompts/suggestions within relevant modes:

| Domain | Models | Relevant Mode |
|--------|--------|---------------|
| Economics | Opportunity Cost, Incentives, Compound Interest | `optimization`, `gametheory` |
| Psychology | Confirmation Bias, Loss Aversion, Anchoring | `critique`, `bayesian` |
| Systems | Feedback Loops, Bottlenecks, Network Effects | `systemsthinking`, `causal` |
| Math | Regression to Mean, Bayes' Theorem, Power Laws | `bayesian`, `inductive` |
| Biology | Natural Selection, Adaptation, Red Queen Effect | `analogical` |

**Implementation:** Add `relevantMentalModels` to mode handlers:
```typescript
class SystemsThinkingHandler {
  relevantMentalModels = [
    'Feedback Loops: Outputs become inputs',
    'Bottlenecks: Throughput limited by slowest component',
    'Network Effects: Value increases with each user',
  ];
}
```

---

## CALIBRATION CHECK → Session Metrics Enhancement

**Framework Source:** Toolkit, lines 369-384

```
## Calibration Check
- Of predictions where I said 90% confident, how many came true? (Should be ~90%)
- Of predictions where I said 70% confident, how many came true? (Should be ~70%)
```

**Current State:** Sessions have `metrics` but no calibration tracking.

**Improvement:** Track predictions across sessions:
```typescript
interface CalibrationMetrics {
  predictions: Array<{
    prediction: string;
    statedConfidence: number;
    outcome: boolean | null;
    timestamp: Date;
  }>;
  calibrationScore: {
    bucket90: { correct: number; total: number };
    bucket70: { correct: number; total: number };
    bucket50: { correct: number; total: number };
  };
}
```

---

## Summary: Priority Implementation Order

Based on the framework mapping, here's the implementation priority:

### Tier 1: High Impact, Direct Framework Mapping
1. **Decision Tree Autopilot** - Direct implementation of the Problem-Solving Decision Tree
2. **Inversion Mode** - New mode from Framing & Questioning section
3. **Systems Archetypes** - Enhancement to SystemsThinking mode
4. **Guiding Questions** - Quick-fire questions integrated into session flow

### Tier 2: Enhance Existing Capabilities
5. **Reference Class Mode** - New mode from Pattern Recognition section
6. **Bias Warnings** - Cognitive Bias Quick-Defense integrated into validation
7. **Stuck Detection** - Emergency Protocols for stuck sessions
8. **Socratic Enhancement** - Structured questioning in Critique mode

### Tier 3: Polish & Completeness
9. **Abstraction Ladder Mode** - New mode from Synthesis section
10. **Feynman Session Type** - Understanding validation workflow
11. **Mental Model Prompts** - Domain-specific suggestions per mode
12. **Calibration Tracking** - Cross-session prediction tracking

---

*This mapping was created by directly analyzing:*
- `HOW_TO_UNDERSTAND_ANYTHING.md` (753 lines)
- `HOW_TO_UNDERSTAND_ANYTHING___TOOLKIT.md` (448 lines)
- `deepthinking-mcp-master/src/` (actual implementation)
