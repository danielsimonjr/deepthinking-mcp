# Synthesis Mode

**Version**: 7.4.0
**Tool**: `deepthinking_analytical`
**Status**: Experimental (Phase 13, v7.4.0)
**Source**: `src/types/modes/synthesis.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `SynthesisThoughtType`, `SourceType`
- **Interfaces**: `SourceQuality`, `Source`, `Concept`, `Theme`, `Finding`, `Pattern`, `ConceptRelation`, `LiteratureGap`, `Contradiction`, `ConceptualFramework`, `SynthesisConclusion`, `ReviewMetadata`, `SynthesisThought`
- **Functions**: `isSynthesisThought`

---

## Overview

Synthesis mode provides **literature review and knowledge integration** capabilities. Designed for PhD students and researchers, it supports the full cycle of systematic literature review - from source identification through theme extraction to conceptual framework development.

This mode captures the structure of academic synthesis - identifying sources, extracting concepts, building themes, finding gaps, and constructing integrated understanding.

## Thought Types

| Type | Description |
|------|-------------|
| `source_identification` | Identify relevant sources for review |
| `source_evaluation` | Evaluate source quality and relevance |
| `theme_extraction` | Extract key themes across sources |
| `pattern_integration` | Integrate patterns across sources |
| `gap_identification` | Identify gaps in existing knowledge |
| `synthesis_construction` | Construct synthesized understanding |
| `framework_development` | Develop conceptual framework |

## When to Use Synthesis Mode

Use synthesis mode when you need to:

- **Review literature** - Systematically review academic sources
- **Synthesize knowledge** - Integrate findings across sources
- **Identify themes** - Extract common themes from multiple works
- **Find gaps** - Discover gaps in existing knowledge
- **Build frameworks** - Develop conceptual frameworks

### Problem Types Well-Suited for Synthesis Mode

- **Literature reviews** - Systematic and scoping reviews
- **Research synthesis** - Integrating multiple studies
- **Meta-synthesis** - Qualitative synthesis across studies
- **State-of-the-art reviews** - Understanding current knowledge
- **Gap analysis** - Identifying research opportunities

## Core Concepts

### Source

```typescript
interface Source {
  id: string;
  type: SourceType;           // journal_article, book, thesis, etc.
  title: string;
  authors: string[];
  year: number;
  venue?: string;
  doi?: string;
  quality: SourceQuality;
  notes?: string;
}
```

### Source Quality

```typescript
interface SourceQuality {
  peerReviewed: boolean;
  impactFactor?: number;
  citationCount?: number;
  methodologicalRigor: number;  // 0-1
  relevance: number;            // 0-1
  recency: number;              // 0-1
  authorCredibility: number;    // 0-1
  overallQuality: number;       // 0-1 weighted average
}
```

### Theme

```typescript
interface Theme {
  id: string;
  name: string;
  description: string;
  sourceIds: string[];         // Sources contributing
  concepts: string[];          // Concept IDs
  strength: number;            // 0-1 how well-supported
  consensus: 'strong' | 'moderate' | 'weak' | 'contested';
  subthemes?: Theme[];
}
```

### Literature Gap

```typescript
interface LiteratureGap {
  id: string;
  description: string;
  type: 'empirical' | 'theoretical' | 'methodological' | 'population' | 'contextual';
  importance: 'critical' | 'significant' | 'moderate' | 'minor';
  relatedThemes: string[];
  suggestedResearch?: string[];
  barriers?: string[];
}
```

### Conceptual Framework

```typescript
interface ConceptualFramework {
  id: string;
  name: string;
  description: string;
  coreConstructs: Concept[];
  relationships: ConceptRelation[];
  assumptions: string[];
  scope: string;
  limitations: string[];
  diagram?: string;             // Mermaid format
}
```

## Usage Example

```typescript
// Step 1: Identify and evaluate sources
const sources = await deepthinking_analytical({
  mode: 'synthesis',
  thought: 'Identify and evaluate key sources on machine learning in education',
  thoughtNumber: 1,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'source_identification',
  sources: [
    {
      id: 's1',
      type: 'journal_article',
      title: 'Deep Learning for Educational Analytics',
      authors: ['Smith, J.', 'Jones, M.'],
      year: 2023,
      venue: 'Computers & Education',
      quality: {
        peerReviewed: true,
        impactFactor: 12.8,
        citationCount: 45,
        methodologicalRigor: 0.85,
        relevance: 0.95,
        recency: 0.9,
        authorCredibility: 0.8,
        overallQuality: 0.87
      }
    },
    // ... more sources
  ],
  reviewMetadata: {
    searchStrategy: ['Scopus', 'Web of Science', 'ERIC'],
    inclusionCriteria: ['Peer-reviewed', 'ML in education', '2018-2024'],
    exclusionCriteria: ['Non-English', 'Opinion pieces'],
    dateRange: { from: 2018, to: 2024 },
    sourcesIncluded: 45,
    lastUpdated: new Date()
  }
});

// Step 2: Extract concepts
const concepts = await deepthinking_analytical({
  mode: 'synthesis',
  thought: 'Extract key concepts from the literature',
  thoughtNumber: 2,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'theme_extraction',
  sources: sources.sources,
  concepts: [
    {
      id: 'c1',
      term: 'Personalized Learning',
      definition: 'Tailoring instruction to individual learner needs using AI',
      sourceIds: ['s1', 's3', 's5'],
      frequency: 23,
      importance: 0.9,
      relatedConcepts: ['c2', 'c4'],
      variations: ['adaptive learning', 'individualized instruction']
    },
    // ... more concepts
  ]
});

// Step 3: Develop themes
const themes = await deepthinking_analytical({
  mode: 'synthesis',
  thought: 'Develop major themes from concepts',
  thoughtNumber: 3,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'theme_extraction',
  themes: [
    {
      id: 't1',
      name: 'AI-Enabled Personalization',
      description: 'Using machine learning to adapt educational content to individual learners',
      sourceIds: ['s1', 's3', 's5', 's7', 's12'],
      concepts: ['c1', 'c2', 'c4'],
      strength: 0.85,
      consensus: 'strong',
      keyQuotes: [
        {
          quote: 'ML algorithms can reduce time to mastery by 40%',
          sourceId: 's3',
          significance: 'Quantifies personalization benefit'
        }
      ],
      narrative: 'The literature strongly supports AI personalization in education...'
    }
  ]
});

// Step 4: Identify gaps
const gaps = await deepthinking_analytical({
  mode: 'synthesis',
  thought: 'Identify gaps in the literature',
  thoughtNumber: 4,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'gap_identification',
  gaps: [
    {
      id: 'g1',
      description: 'Lack of longitudinal studies on ML-based personalization',
      type: 'empirical',
      importance: 'critical',
      relatedThemes: ['t1'],
      suggestedResearch: [
        'Multi-year cohort study tracking learning outcomes',
        'Randomized controlled trials across diverse populations'
      ],
      barriers: ['Funding', 'Ethical approval complexity', 'Technology changes']
    }
  ],
  contradictions: [
    {
      id: 'con1',
      description: 'Disagreement on student data privacy approaches',
      position1: {
        statement: 'Extensive data collection enables better personalization',
        sourceIds: ['s3', 's7'],
        reasoning: 'More data improves model accuracy'
      },
      position2: {
        statement: 'Minimal data collection protects student privacy',
        sourceIds: ['s5', 's12'],
        reasoning: 'Privacy is a fundamental right; alternative approaches exist'
      },
      possibleResolution: 'Federated learning and differential privacy techniques'
    }
  ]
});

// Step 5: Build conceptual framework
const framework = await deepthinking_analytical({
  mode: 'synthesis',
  thought: 'Develop conceptual framework integrating findings',
  thoughtNumber: 5,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'framework_development',
  framework: {
    id: 'f1',
    name: 'ML-Enhanced Educational Personalization Framework',
    description: 'A framework for understanding how ML enables personalized education',
    coreConstructs: concepts.concepts,
    relationships: [
      {
        id: 'r1',
        fromId: 'c1',
        toId: 'c2',
        type: 'causes',
        strength: 0.8,
        evidence: ['s1', 's3'],
        description: 'Personalization leads to improved engagement'
      }
    ],
    assumptions: [
      'Learners have sufficient digital access',
      'Teachers are trained in ML tools',
      'Data infrastructure exists'
    ],
    scope: 'K-12 and higher education in developed contexts',
    limitations: [
      'May not apply to low-resource settings',
      'Assumes standard curriculum structures'
    ],
    diagram: `graph TD
      A[ML Algorithm] --> B[Student Data]
      B --> C[Personalized Content]
      C --> D[Learning Outcomes]
      D --> E[Feedback Loop]
      E --> A`
  }
});

// Step 6: Synthesize conclusions
const conclusions = await deepthinking_analytical({
  mode: 'synthesis',
  thought: 'Synthesize overall conclusions',
  thoughtNumber: 6,
  totalThoughts: 6,
  nextThoughtNeeded: false,

  thoughtType: 'synthesis_construction',
  conclusions: [
    {
      statement: 'ML-based personalization shows consistent positive effects on learning outcomes across 45 studies',
      confidence: 0.85,
      supportingSources: ['s1', 's3', 's5', 's7'],
      qualifications: ['Effects vary by subject domain', 'Implementation quality matters'],
      implications: [
        'Schools should invest in ML-based adaptive systems',
        'Teacher training is essential for effective implementation'
      ],
      futureDirections: ['Longitudinal studies needed', 'Privacy-preserving approaches']
    }
  ],
  keyInsight: 'Strong evidence for ML personalization, but significant gaps in long-term and privacy research'
});
```

## Best Practices

### Source Evaluation

**Do:**
- Assess multiple quality dimensions
- Document inclusion/exclusion criteria
- Track source provenance

**Don't:**
- Accept sources without evaluation
- Ignore methodological quality
- Overlook publication bias

### Theme Development

**Do:**
- Ground themes in data
- Document theme evolution
- Assess theme strength and consensus

**Don't:**
- Force themes onto data
- Ignore contradictory evidence
- Skip saturation checking

### Gap Identification

**Do:**
- Link gaps to themes
- Assess gap importance
- Suggest research directions

**Don't:**
- Ignore methodological gaps
- Overlook theoretical gaps
- Skip population/context gaps

### Framework Development

**Do:**
- Define clear constructs
- Specify relationships
- State scope and limitations

**Don't:**
- Over-generalize from limited data
- Ignore contradictions
- Skip assumption documentation

## SynthesisThought Interface

```typescript
interface SynthesisThought extends BaseThought {
  mode: ThinkingMode.SYNTHESIS;
  thoughtType: SynthesisThoughtType;

  sources: Source[];
  reviewMetadata?: ReviewMetadata;
  concepts?: Concept[];
  themes?: Theme[];
  findings?: Finding[];
  patterns?: Pattern[];
  relations?: ConceptRelation[];
  gaps?: LiteratureGap[];
  contradictions?: Contradiction[];
  framework?: ConceptualFramework;
  conclusions?: SynthesisConclusion[];

  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  keyInsight?: string;
}
```

## Integration with Other Modes

Synthesis mode integrates with:

- **Critique Mode** - Critical evaluation of sources
- **Analysis Mode** - Qualitative coding of source content
- **Scientific Method Mode** - Systematic review methodology
- **Systems Thinking Mode** - Complex system understanding

## Related Modes

- [Critique Mode](./CRITIQUE.md) - Critical analysis
- [Analysis Mode](./ANALYSIS.md) - Qualitative analysis
- [Scientific Method Mode](./SCIENTIFICMETHOD.md) - Research methodology
- [Systems Thinking Mode](./SYSTEMSTHINKING.md) - System dynamics

## Limitations

- **No automated search** - Manual source identification required
- **Qualitative focus** - Limited quantitative synthesis support
- **Domain expertise needed** - Requires subject matter knowledge

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
