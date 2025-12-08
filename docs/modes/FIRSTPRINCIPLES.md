# First Principles Reasoning Mode

**Version**: 7.3.0
**Tool**: `deepthinking_analytical`
**Status**: Experimental
**Source**: `src/types/modes/firstprinciples.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `PrincipleType`
- **Interfaces**: `FoundationalPrinciple`, `DerivationStep`, `Conclusion`, `FirstPrinciplesThought`
- **Functions**: `isFirstPrinciplesThought`

---

## Overview

First Principles mode provides **foundational reasoning** by building understanding from basic axioms, definitions, and observations. It enables reasoning from the ground up, questioning assumptions and deriving conclusions through explicit logical steps.

This mode captures the structure of first-principles thinking - from identifying foundational truths through derivation chains to conclusions.

## When to Use First Principles Mode

Use first principles mode when you need to:

- **Question assumptions** - Challenge what's taken for granted
- **Build from fundamentals** - Start from basic truths
- **Derive conclusions rigorously** - Explicit logical steps
- **Understand deeply** - Not just accept, but know why
- **Innovate** - Find non-obvious solutions

### Problem Types Well-Suited for First Principles Mode

- **Fundamental design** - Designing systems from scratch
- **Innovation** - Finding novel solutions
- **Teaching/explaining** - Building understanding step by step
- **Debugging** - Getting to the root cause
- **Strategic thinking** - Questioning industry assumptions

## Core Concepts

### Principle Types

```typescript
type PrincipleType =
  | 'axiom'            // Self-evident truth
  | 'definition'       // Definition of a concept
  | 'observation'      // Empirical observation
  | 'logical_inference' // Derived through logic
  | 'assumption';      // Stated assumption
```

### Foundational Principles

```typescript
interface FoundationalPrinciple {
  id: string;
  type: PrincipleType;
  statement: string;
  justification: string;
  dependsOn?: string[];    // IDs of other principles
  confidence?: number;     // 0-1, for observations and assumptions
  latex?: string;          // LaTeX for mathematical principles
}
```

### Derivation Steps

```typescript
interface DerivationStep {
  stepNumber: number;
  principle: string;       // ID of principle being applied
  inference: string;       // What is inferred
  logicalForm?: string;    // Formal logic representation
  confidence: number;      // 0-1
  latex?: string;          // LaTeX for mathematical derivations
}
```

### Conclusion

```typescript
interface Conclusion {
  statement: string;
  derivationChain: number[];  // Array of step numbers
  certainty: number;          // 0-1
  limitations?: string[];     // Known limitations
  latex?: string;             // LaTeX for mathematical conclusions
}
```

## Usage Example

```typescript
// Ask the fundamental question
const question = await deepthinking_analytical({
  mode: 'firstprinciples',
  thought: 'Why do we need a database for this application?',
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  question: 'What are the fundamental data storage requirements for this application?',
  principles: [],
  derivationSteps: [],
  conclusion: { statement: '', derivationChain: [], certainty: 0 }
});

// Identify foundational principles
const principles = await deepthinking_analytical({
  mode: 'firstprinciples',
  thought: 'Establish the foundational principles',
  thoughtNumber: 2,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  question: 'What are the fundamental data storage requirements?',
  principles: [
    {
      id: 'p1',
      type: 'axiom',
      statement: 'Data must persist beyond application runtime',
      justification: 'Users expect their data to be available across sessions'
    },
    {
      id: 'p2',
      type: 'observation',
      statement: 'Application handles ~1000 concurrent users at peak',
      justification: 'Based on current traffic metrics',
      confidence: 0.9
    },
    {
      id: 'p3',
      type: 'observation',
      statement: 'Data is read 100x more often than written',
      justification: 'Based on application analytics',
      confidence: 0.85
    },
    {
      id: 'p4',
      type: 'definition',
      statement: 'ACID transactions are not required for this data',
      justification: 'Data is eventually consistent by business requirement'
    },
    {
      id: 'p5',
      type: 'assumption',
      statement: 'Data schema may evolve significantly over time',
      justification: 'Product is in early stage, requirements will change',
      confidence: 0.8
    }
  ],
  derivationSteps: [],
  conclusion: { statement: '', derivationChain: [], certainty: 0 }
});

// Derive from principles
const derivation = await deepthinking_analytical({
  mode: 'firstprinciples',
  thought: 'Derive storage requirements from principles',
  thoughtNumber: 3,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  question: 'What storage solution fits our fundamental needs?',
  principles: [ /* same as above */ ],
  derivationSteps: [
    {
      stepNumber: 1,
      principle: 'p1',
      inference: 'We need persistent storage of some kind (file, database, or cloud)',
      confidence: 1.0,
      logicalForm: 'Persistence required → Storage mechanism needed'
    },
    {
      stepNumber: 2,
      principle: 'p2',
      inference: 'Storage must handle concurrent access from ~1000 users',
      confidence: 0.9,
      logicalForm: 'Concurrency requirement → Need concurrent access support'
    },
    {
      stepNumber: 3,
      principle: 'p3',
      inference: 'Read optimization is more important than write optimization',
      confidence: 0.85,
      logicalForm: 'Read >> Write → Optimize for reads'
    },
    {
      stepNumber: 4,
      principle: 'p4',
      inference: 'NoSQL or simpler solutions are acceptable (no ACID requirement)',
      confidence: 0.95,
      logicalForm: '¬ACID required → SQL not mandatory'
    },
    {
      stepNumber: 5,
      principle: 'p5',
      inference: 'Schemaless or schema-flexible storage preferred',
      confidence: 0.8,
      logicalForm: 'Schema evolution → Flexible schema beneficial'
    }
  ],
  conclusion: { statement: '', derivationChain: [], certainty: 0 }
});

// Reach conclusion
const conclusion = await deepthinking_analytical({
  mode: 'firstprinciples',
  thought: 'Conclude on optimal storage solution',
  thoughtNumber: 4,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  question: 'What storage solution fits our fundamental needs?',
  principles: [ /* same */ ],
  derivationSteps: [ /* same */ ],
  conclusion: {
    statement: 'A document database (MongoDB, DynamoDB) or Redis would satisfy all fundamental requirements better than a traditional RDBMS',
    derivationChain: [1, 2, 3, 4, 5],
    certainty: 0.85,
    limitations: [
      'If ACID requirements change, this conclusion needs revisiting',
      'At scale beyond 10K users, architecture may need adjustment',
      'Specific product choice depends on team expertise'
    ]
  }
});

// Consider alternatives
const alternatives = await deepthinking_analytical({
  mode: 'firstprinciples',
  thought: 'Consider alternative interpretations',
  thoughtNumber: 5,
  totalThoughts: 5,
  nextThoughtNeeded: false,

  question: 'What storage solution fits our fundamental needs?',
  principles: [ /* same */ ],
  derivationSteps: [ /* same */ ],
  conclusion: { /* same */ },
  alternativeInterpretations: [
    'If we weight future ACID needs higher, PostgreSQL with JSONB offers flexibility',
    'If we expect 10x growth, a managed cloud solution reduces operational burden',
    'If budget is constrained, SQLite could work for single-server deployments'
  ]
});
```

## The Elon Musk Method

First principles thinking is famously used by Elon Musk:

1. **Identify assumptions** - What do we assume is true?
2. **Break down to fundamentals** - What are the basic truths?
3. **Reason up from there** - Build new conclusions
4. **Question conventional wisdom** - Industry "best practices" may be wrong

## Best Practices

### Principle Identification

✅ **Do:**
- Distinguish axioms from assumptions
- State principles explicitly
- Assess confidence for uncertain principles

❌ **Don't:**
- Accept industry norms as axioms
- Hide assumptions
- Assume principles without justification

### Derivation

✅ **Do:**
- Make each step explicit
- Note the principle being applied
- Track confidence through the chain

❌ **Don't:**
- Skip logical steps
- Derive without citing principles
- Ignore uncertainty propagation

### Conclusions

✅ **Do:**
- State limitations clearly
- Consider alternatives
- Connect to derivation chain

❌ **Don't:**
- Overstate certainty
- Ignore inconvenient principles
- Skip alternative interpretations

## FirstPrinciplesThought Interface

```typescript
interface FirstPrinciplesThought extends BaseThought {
  mode: ThinkingMode.FIRSTPRINCIPLES;
  question: string;
  principles: FoundationalPrinciple[];
  derivationSteps: DerivationStep[];
  conclusion: Conclusion;
  alternativeInterpretations?: string[];
}
```

## Integration with Other Modes

First Principles mode integrates with:

- **Mathematics Mode** - Axiomatic mathematical reasoning
- **Formal Logic Mode** - Logical derivation
- **Scientific Method** - Hypothesis from fundamentals
- **Shannon Mode** - Problem definition stage

## Related Modes

- [Mathematics Mode](./MATHEMATICS.md) - Formal proofs
- [Formal Logic Mode](./FORMALLOGIC.md) - Logical reasoning
- [Scientific Method Mode](./SCIENTIFICMETHOD.md) - Hypothesis testing
- [Shannon Mode](./SHANNON.md) - Problem-solving methodology

## Limitations

- **Time-intensive** - Deep analysis takes effort
- **Requires expertise** - Identifying true fundamentals is hard
- **May challenge consensus** - Conclusions may differ from convention

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
