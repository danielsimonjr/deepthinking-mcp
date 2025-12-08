# Argumentation Mode

**Version**: 7.4.0
**Tool**: `deepthinking_analytical`
**Status**: Experimental (Phase 13, v7.4.0)
**Source**: `src/types/modes/argumentation.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `ArgumentationThoughtType`, `RhetoricalAppeal`
- **Interfaces**: `Claim`, `Grounds`, `Warrant`, `Backing`, `Qualifier`, `Rebuttal`, `RebuttalResponse`, `ToulminArgument`, `ArgumentChain`, `DialecticPosition`, `DialecticAnalysis`, `RhetoricalStrategy`, `AudienceConsideration`, `LogicalFallacy`, `ArgumentationThought`
- **Functions**: `isArgumentationThought`

---

## Overview

Argumentation mode provides **Toulmin model argumentation** and dialectical reasoning. Designed for academic writing and scholarly debate, it supports constructing rigorous arguments with explicit claims, evidence, warrants, and anticipation of counterarguments.

This mode captures the structure of academic argumentation - from thesis formulation through evidence marshaling to addressing objections.

## The Toulmin Model

Stephen Toulmin's model of argumentation identifies six components:

1. **Claim** - The conclusion being argued for
2. **Grounds** - The evidence supporting the claim
3. **Warrant** - The reasoning connecting grounds to claim
4. **Backing** - Support for the warrant itself
5. **Qualifier** - Degree of certainty (probably, likely, etc.)
6. **Rebuttal** - Potential counterarguments or exceptions

## Thought Types

| Type | Description |
|------|-------------|
| `claim_formulation` | Formulate the central claim/thesis |
| `grounds_identification` | Identify supporting evidence |
| `warrant_construction` | Construct warrants linking evidence to claim |
| `backing_provision` | Provide backing for warrants |
| `rebuttal_anticipation` | Anticipate counterarguments |
| `qualifier_specification` | Specify qualifications/limitations |
| `argument_assembly` | Assemble complete argument structure |
| `dialectic_analysis` | Analyze thesis-antithesis-synthesis |

## When to Use Argumentation Mode

Use argumentation mode when you need to:

- **Construct arguments** - Build scholarly arguments
- **Defend a thesis** - Support a position systematically
- **Anticipate objections** - Prepare for counterarguments
- **Analyze debates** - Examine dialectical positions
- **Write persuasively** - Academic rhetoric

### Problem Types Well-Suited for Argumentation Mode

- **Academic papers** - Research papers and dissertations
- **Thesis defense** - Defending research claims
- **Policy arguments** - Evidence-based policy recommendations
- **Literature critique** - Arguing against existing positions
- **Conceptual analysis** - Philosophical arguments

## Core Concepts

### Claim

```typescript
interface Claim {
  id: string;
  statement: string;
  type: 'fact' | 'value' | 'policy' | 'definition' | 'cause';
  scope: 'universal' | 'general' | 'particular';
  strength: 'strong' | 'moderate' | 'tentative';
  contested: boolean;
  latex?: string;
}
```

### Grounds

```typescript
interface Grounds {
  id: string;
  type: 'empirical' | 'statistical' | 'testimonial' | 'analogical' | 'logical' | 'textual';
  content: string;
  source?: string;
  reliability: number;           // 0-1
  relevance: number;             // 0-1
  sufficiency: 'sufficient' | 'partial' | 'insufficient';
  verifiable: boolean;
}
```

### Warrant

```typescript
interface Warrant {
  id: string;
  statement: string;
  type: 'generalization' | 'analogy' | 'causal' | 'authority' | 'principle' | 'definition';
  implicit: boolean;
  strength: number;              // 0-1
  assumptions: string[];
  groundsIds: string[];          // Which grounds this connects
  claimId: string;
}
```

### Rebuttal

```typescript
interface Rebuttal {
  id: string;
  objection: string;
  type: 'factual' | 'logical' | 'ethical' | 'practical' | 'definitional';
  strength: 'strong' | 'moderate' | 'weak';
  targetElement: 'claim' | 'grounds' | 'warrant' | 'backing';
  targetId: string;
  response?: RebuttalResponse;
}

interface RebuttalResponse {
  strategy: 'refute' | 'concede' | 'qualify' | 'reframe' | 'outweigh';
  content: string;
  effectiveness: number;         // 0-1
}
```

### Toulmin Argument

```typescript
interface ToulminArgument {
  id: string;
  name?: string;
  claim: Claim;
  grounds: Grounds[];
  warrants: Warrant[];
  backings: Backing[];
  qualifiers: Qualifier[];
  rebuttals: Rebuttal[];
  overallStrength: number;       // 0-1
  validity: 'valid' | 'invalid' | 'questionable';
  soundness: 'sound' | 'unsound' | 'questionable';
}
```

### Dialectic Analysis

```typescript
interface DialecticAnalysis {
  id: string;
  topic: string;
  thesis: DialecticPosition;
  antithesis: DialecticPosition;
  synthesis?: DialecticPosition;
  resolution: 'thesis_prevails' | 'antithesis_prevails' | 'synthesis_achieved' | 'unresolved';
  resolutionReasoning: string;
}
```

## Usage Example

```typescript
// Step 1: Formulate the central claim
const claim = await deepthinking_analytical({
  mode: 'argumentation',
  thought: 'Formulate thesis about AI in education',
  thoughtNumber: 1,
  totalThoughts: 7,
  nextThoughtNeeded: true,

  thoughtType: 'claim_formulation',
  currentClaim: {
    id: 'c1',
    statement: 'AI-powered personalized learning significantly improves student outcomes compared to traditional instruction',
    type: 'fact',
    scope: 'general',
    strength: 'moderate',
    contested: true
  },
  argumentStrength: 0.0,
  dependencies: [],
  assumptions: ['Define "significantly" as effect size > 0.5'],
  uncertainty: 0.4
});

// Step 2: Identify grounds (evidence)
const grounds = await deepthinking_analytical({
  mode: 'argumentation',
  thought: 'Identify supporting evidence for the claim',
  thoughtNumber: 2,
  totalThoughts: 7,
  nextThoughtNeeded: true,

  thoughtType: 'grounds_identification',
  currentClaim: claim.currentClaim,
  grounds: [
    {
      id: 'g1',
      type: 'empirical',
      content: 'Meta-analysis of 32 studies found mean effect size of 0.67 (Kulik & Fletcher, 2016)',
      source: 'Kulik, J.A. & Fletcher, J.D. (2016). Effectiveness of intelligent tutoring systems',
      reliability: 0.9,
      relevance: 0.95,
      sufficiency: 'sufficient',
      verifiable: true
    },
    {
      id: 'g2',
      type: 'statistical',
      content: 'Randomized controlled trial with n=5,000 showed 23% improvement in test scores',
      source: 'Pane et al. (2017). Algebra randomized trial',
      reliability: 0.85,
      relevance: 0.9,
      sufficiency: 'partial',
      verifiable: true
    },
    {
      id: 'g3',
      type: 'testimonial',
      content: 'Bill Gates Foundation reports consistent positive results across 200 school implementations',
      reliability: 0.7,
      relevance: 0.8,
      sufficiency: 'partial',
      verifiable: true
    }
  ],
  argumentStrength: 0.4
});

// Step 3: Construct warrants
const warrants = await deepthinking_analytical({
  mode: 'argumentation',
  thought: 'Construct warrants connecting evidence to claim',
  thoughtNumber: 3,
  totalThoughts: 7,
  nextThoughtNeeded: true,

  thoughtType: 'warrant_construction',
  warrants: [
    {
      id: 'w1',
      statement: 'Meta-analyses synthesizing multiple studies provide strong evidence of effect',
      type: 'generalization',
      implicit: false,
      strength: 0.85,
      assumptions: ['Studies are methodologically sound', 'Sample is representative'],
      groundsIds: ['g1'],
      claimId: 'c1'
    },
    {
      id: 'w2',
      statement: 'Randomized controlled trials establish causal relationships',
      type: 'causal',
      implicit: false,
      strength: 0.9,
      assumptions: ['Randomization was effective', 'No significant confounds'],
      groundsIds: ['g2'],
      claimId: 'c1'
    }
  ],
  argumentStrength: 0.55
});

// Step 4: Provide backing for warrants
const backing = await deepthinking_analytical({
  mode: 'argumentation',
  thought: 'Provide backing for the warrants',
  thoughtNumber: 4,
  totalThoughts: 7,
  nextThoughtNeeded: true,

  thoughtType: 'backing_provision',
  backings: [
    {
      id: 'b1',
      content: 'Cochrane Collaboration standards consider meta-analyses the highest form of evidence',
      type: 'authoritative',
      source: 'Cochrane Handbook for Systematic Reviews',
      warrantId: 'w1',
      credibility: 0.95
    },
    {
      id: 'b2',
      content: 'RCT methodology is gold standard in medical and educational research per CONSORT guidelines',
      type: 'theoretical',
      source: 'CONSORT Statement (2010)',
      warrantId: 'w2',
      credibility: 0.9
    }
  ],
  argumentStrength: 0.65
});

// Step 5: Anticipate rebuttals
const rebuttals = await deepthinking_analytical({
  mode: 'argumentation',
  thought: 'Anticipate and address counterarguments',
  thoughtNumber: 5,
  totalThoughts: 7,
  nextThoughtNeeded: true,

  thoughtType: 'rebuttal_anticipation',
  rebuttals: [
    {
      id: 'r1',
      objection: 'Studies may have publication bias favoring positive results',
      type: 'factual',
      strength: 'moderate',
      targetElement: 'grounds',
      targetId: 'g1',
      response: {
        strategy: 'refute',
        content: 'Kulik meta-analysis included fail-safe N analysis showing 234 null studies needed to invalidate findings',
        effectiveness: 0.8
      }
    },
    {
      id: 'r2',
      objection: 'Effect sizes may not translate to meaningful real-world improvements',
      type: 'practical',
      strength: 'strong',
      targetElement: 'claim',
      targetId: 'c1',
      response: {
        strategy: 'qualify',
        content: 'Effect size of 0.67 translates to approximately one grade level improvement, which is educationally meaningful',
        effectiveness: 0.75
      }
    },
    {
      id: 'r3',
      objection: 'AI personalization may widen achievement gaps for disadvantaged students',
      type: 'ethical',
      strength: 'moderate',
      targetElement: 'claim',
      targetId: 'c1',
      response: {
        strategy: 'concede',
        content: 'Valid concern - implementation must address digital divide. Studies show equitable access can prevent this.',
        effectiveness: 0.7
      }
    }
  ],
  argumentStrength: 0.75
});

// Step 6: Add qualifiers
const qualifiers = await deepthinking_analytical({
  mode: 'argumentation',
  thought: 'Specify appropriate qualifications',
  thoughtNumber: 6,
  totalThoughts: 7,
  nextThoughtNeeded: true,

  thoughtType: 'qualifier_specification',
  qualifiers: [
    {
      id: 'q1',
      term: 'In well-implemented contexts',
      certainty: 0.8,
      conditions: ['Adequate teacher training', 'Reliable technology infrastructure', 'Proper integration with curriculum'],
      scope: 'K-12 mathematics and literacy'
    }
  ],
  argumentStrength: 0.8
});

// Step 7: Assemble complete argument
const argument = await deepthinking_analytical({
  mode: 'argumentation',
  thought: 'Assemble the complete Toulmin argument',
  thoughtNumber: 7,
  totalThoughts: 7,
  nextThoughtNeeded: false,

  thoughtType: 'argument_assembly',
  currentArgument: {
    id: 'arg1',
    name: 'AI Personalization Effectiveness Argument',
    claim: claim.currentClaim,
    grounds: grounds.grounds,
    warrants: warrants.warrants,
    backings: backing.backings,
    qualifiers: qualifiers.qualifiers,
    rebuttals: rebuttals.rebuttals,
    overallStrength: 0.8,
    validity: 'valid',
    soundness: 'sound'
  },
  argumentStrength: 0.8,
  keyInsight: 'Strong empirical support with appropriate qualifications and addressed objections'
});
```

## Rhetorical Appeals (Aristotle)

The mode also supports classical rhetorical analysis:

| Appeal | Description | Example Use |
|--------|-------------|-------------|
| **Ethos** | Credibility/character | Citing authoritative sources |
| **Pathos** | Emotional appeal | Compelling case studies |
| **Logos** | Logical reasoning | Statistical evidence |

## Common Fallacies Detected

```typescript
interface LogicalFallacy {
  name: string;       // e.g., "ad hominem", "straw man"
  category: 'formal' | 'informal';
  description: string;
  location: string;
  severity: 'critical' | 'significant' | 'minor';
  correction?: string;
}
```

Common fallacies:
- **Ad hominem** - Attacking the person instead of the argument
- **Straw man** - Misrepresenting the opposing position
- **Appeal to authority** - Relying solely on authority without evidence
- **False dichotomy** - Presenting only two options when more exist
- **Hasty generalization** - Generalizing from insufficient evidence

## Best Practices

### Claim Formulation

**Do:**
- State claims clearly and specifically
- Identify claim type (fact, value, policy)
- Acknowledge when claims are contested

**Don't:**
- Make vague or ambiguous claims
- Overstate certainty
- Conflate different claim types

### Evidence (Grounds)

**Do:**
- Use multiple types of evidence
- Assess reliability and relevance
- Cite sources properly

**Don't:**
- Rely on single evidence types
- Ignore evidence quality
- Cherry-pick evidence

### Warrants

**Do:**
- Make reasoning explicit
- Identify underlying assumptions
- Choose appropriate warrant types

**Don't:**
- Leave reasoning implicit
- Ignore warrant limitations
- Assume audience shares assumptions

### Rebuttals

**Do:**
- Anticipate strong objections
- Respond substantively
- Acknowledge valid concerns

**Don't:**
- Ignore counterarguments
- Dismiss objections without reason
- Create straw man rebuttals

## ArgumentationThought Interface

```typescript
interface ArgumentationThought extends BaseThought {
  mode: ThinkingMode.ARGUMENTATION;
  thoughtType: ArgumentationThoughtType;

  claims?: Claim[];
  currentClaim?: Claim;
  grounds?: Grounds[];
  warrants?: Warrant[];
  backings?: Backing[];
  qualifiers?: Qualifier[];
  rebuttals?: Rebuttal[];

  arguments?: ToulminArgument[];
  currentArgument?: ToulminArgument;
  argumentChain?: ArgumentChain;

  dialectic?: DialecticAnalysis;
  rhetoricalStrategies?: RhetoricalStrategy[];
  audienceConsideration?: AudienceConsideration;

  fallacies?: LogicalFallacy[];
  argumentStrength: number;

  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  keyInsight?: string;
}
```

## Integration with Other Modes

Argumentation mode integrates with:

- **Formal Logic Mode** - Logical validity checking
- **Critique Mode** - Evaluating opposing arguments
- **Deductive Mode** - Deductive reasoning
- **Evidential Mode** - Evidence evaluation

## Related Modes

- [Formal Logic Mode](./FORMALLOGIC.md) - Logical proofs
- [Critique Mode](./CRITIQUE.md) - Critical analysis
- [Deductive Mode](./DEDUCTIVE.md) - Deductive reasoning
- [Synthesis Mode](./SYNTHESIS.md) - Literature review

## Limitations

- **No automated fallacy detection** - Manual identification required
- **Qualitative assessment** - Strength scores are subjective
- **Western argumentation focus** - Toulmin model is culturally specific

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
