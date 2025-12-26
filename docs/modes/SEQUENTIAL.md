# Sequential Reasoning Mode

**Version**: 7.3.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_standard`
**Status**: Stable (Fully Implemented)
**Source**: `src/types/modes/sequential.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Interfaces**: `SequentialThought`
- **Functions**: `isSequentialThought`

---

## Overview

Sequential reasoning is the **general-purpose iterative thinking mode** that forms the foundation of the DeepThinking system. It provides structured step-by-step reasoning with support for **revision**, **branching**, and **dependency tracking**.

Think of it as the "default" reasoning mode - flexible enough to handle most problems without specialized domain knowledge, while providing the core infrastructure for organizing thoughts.

## When to Use Sequential Mode

Use sequential reasoning when you need to:

- **Break down complex problems** step by step
- **Iterate on ideas** with revision support
- **Track dependencies** between thoughts
- **Explore alternative paths** through branching
- **General problem-solving** without specialized domain requirements

### Problem Types Well-Suited for Sequential Reasoning

- **Multi-step tasks** - Tasks requiring ordered progression
- **Exploratory analysis** - When the best approach isn't clear upfront
- **Iterative refinement** - Problems requiring multiple passes
- **Dependency-heavy reasoning** - Where conclusions build on previous steps
- **Any problem** where specialized modes aren't clearly better suited

## Core Concepts

### Revision Tracking

Sequential thoughts support revision of previous thinking:
- **isRevision**: Whether this thought revises previous thinking
- **revisionReason**: Why the revision was needed

### Dependency Tracking

Track how thoughts build upon each other:
- **buildUpon**: Array of thought IDs this thought builds upon
- **dependencies**: Dependencies on other thoughts or information

### Branching Support

Explore alternative reasoning paths:
- **branchFrom**: Thought ID to branch from
- **branchId**: Unique identifier for this branch
- **branchFromThought**: The thought number where branching occurred

### Iteration Control

- **needsMoreThoughts**: Flag indicating whether additional iteration is needed

## Usage Example

```typescript
// Using sequential reasoning through deepthinking_standard tool
const response = await deepthinking_standard({
  mode: 'sequential',
  thought: 'Breaking down the problem into manageable components',
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  // Building on previous thoughts
  buildUpon: ['thought_001', 'thought_002'],

  // Indicate more iteration needed
  needsMoreThoughts: true
});

// Revising a previous thought
const revision = await deepthinking_standard({
  mode: 'sequential',
  thought: 'Upon further analysis, the initial assumption was incorrect',
  thoughtNumber: 3,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  isRevision: true,
  revisionReason: 'New information contradicts original premise'
});

// Creating a branch to explore alternative
const branch = await deepthinking_standard({
  mode: 'sequential',
  thought: 'Exploring an alternative approach to the problem',
  thoughtNumber: 4,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  branchFrom: 'thought_002',
  branchId: 'alternative_approach_1'
});
```

## Best Practices

### When to Use Sequential Mode

✅ **Do use sequential mode:**
- As your starting point for most problems
- When other modes don't clearly apply
- For general problem decomposition
- When building iterative chains of reasoning
- For exploratory analysis

❌ **Consider other modes when:**
- The problem clearly fits a specialized domain (math, physics, etc.)
- You need specific analytical frameworks (Bayesian, causal, etc.)
- Domain-specific structures would be more valuable

### Effective Revision

- Use revisions when new information changes conclusions
- Always provide a `revisionReason` for clarity
- Don't overuse revisions - some iteration is normal

### Effective Branching

- Branch when exploring genuinely different approaches
- Keep branch IDs descriptive and meaningful
- Merge insights from branches back to main reasoning line

### Managing Dependencies

- Explicitly track which thoughts build on others
- Keep dependency chains manageable (not too deep)
- Use dependencies to establish logical flow

## SequentialThought Interface

```typescript
interface SequentialThought extends BaseThought {
  mode: ThinkingMode.SEQUENTIAL;

  // Revision tracking
  revisionReason?: string;
  isRevision?: boolean;

  // Dependency tracking
  buildUpon?: string[];
  dependencies?: string[];

  // Branching support
  branchFrom?: string;
  branchId?: string;
  branchFromThought?: number;

  // Iteration control
  needsMoreThoughts?: boolean;
}
```

## Integration with Other Modes

Sequential mode works well as a **companion** to specialized modes:

- **Start with Sequential** to decompose the problem
- **Switch to specialized modes** (Mathematics, Physics, etc.) for domain-specific analysis
- **Return to Sequential** to synthesize findings
- **Use Meta-Reasoning** to decide when to switch

## Related Modes

- **Meta-Reasoning** - For deciding when to switch from Sequential
- **Hybrid Mode** - For combining Sequential with other modes
- **All specialized modes** - Sequential can be used alongside any mode

## Limitations

- **No domain-specific structures** - Lacks specialized interfaces for math, physics, etc.
- **Generic output** - Doesn't provide domain-specific formatting or validation
- **Manual integration** - Building complex analysis requires explicit structuring

## See Also

- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
- [Hybrid Mode](./HYBRID.md) - Multi-modal reasoning
- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
