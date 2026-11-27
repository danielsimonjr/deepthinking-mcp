# Knowledge Pack: argumentation

**Mode**: `argumentation`
**Category skill**: `think-academic`
**Source doc**: `docs/modes/ARGUMENTATION.md`

## Overview

Argumentation mode provides **Toulmin model argumentation** and dialectical reasoning. Designed for academic writing and scholarly debate, it supports constructing rigorous arguments with explicit claims, evidence, warrants, and anticipation of counterarguments.

This mode captures the structure of academic argumentation - from thesis formulation through evidence marshaling to addressing objections.

## When to Use

Use argumentation mode when you need to:

- **Construct arguments** - Build scholarly arguments
- **Defend a thesis** - Support a position systematically
- **Anticipate objections** - Prepare for counterarguments
- **Analyze debates** - Examine dialectical positions
- **Write persuasively** - Academic rhetoric

## Core Concepts

(no 'core concepts' section in source doc)

## Thought Type (TypeScript Interface)

```typescript
interface ArgumentationThought extends BaseThought {
mode: ThinkingMode.ARGUMENTATION;
  thoughtType: ArgumentationThoughtType;

  // Toulmin model elements
  claims?: Claim[];
  currentClaim?: Claim;
  grounds?: Grounds[];
  warrants?: Warrant[];
  backings?: Backing[];
  qualifiers?: Qualifier[];
  rebuttals?: Rebuttal[];

  // Complete arguments
  arguments?: ToulminArgument[];
  currentArgument?: ToulminArgument;
  argumentChain?: ArgumentChain;

  // Dialectic analysis
  dialectic?: DialecticAnalysis;

  // Rhetorical elements
  rhetoricalStrategies?: RhetoricalStrategy[];
  audienceConsideration?: AudienceConsideration;

  // Quality checks
  fallacies?: LogicalFallacy[];
  argumentStrength: number;      // 0-1

  // Standard fields
  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  keyInsight?: string;
}
```

## Supporting Interfaces

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

interface Warrant {
id: string;
  statement: string;
  type: 'generalization' | 'analogy' | 'causal' | 'authority' | 'principle' | 'definition';
  implicit: boolean;             // Was it unstated?
  strength: number;              // 0-1
  assumptions: string[];
  groundsIds: string[];          // Which grounds this warrant connects
  claimId: string;               // Which claim this warrant supports
}

interface Backing {
id: string;
  content: string;
  type: 'theoretical' | 'empirical' | 'authoritative' | 'definitional' | 'precedent';
  source?: string;
  warrantId: string;             // Which warrant this backs
  credibility: number;           // 0-1
}

interface Qualifier {
id: string;
  term: string;                  // "probably", "likely", "certainly", etc.
  certainty: number;             // 0-1 (0 = possible, 1 = certain)
  conditions?: string[];         // Conditions under which claim holds
  scope?: string;                // Scope of applicability
}

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

## Worked Example (from source doc)

```typescript
// Step 1: Formulate the central claim
const claim = await deepthinking_academic({
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
const grounds = await deepthinking_academic({
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
const warrants = await deepthinking_academic({
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
      assumptions: ['Studies are methodologically sound

---

*Generated by RLM extraction pass on 2026-04-12*
