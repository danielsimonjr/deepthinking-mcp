# Knowledge Pack: synthesis

**Mode**: `synthesis`
**Category skill**: `think-academic`
**Source doc**: `docs/modes/SYNTHESIS.md`

## Overview

Synthesis mode provides **literature review and knowledge integration** capabilities. Designed for PhD students and researchers, it supports the full cycle of systematic literature review - from source identification through theme extraction to conceptual framework development.

This mode captures the structure of academic synthesis - identifying sources, extracting concepts, building themes, finding gaps, and constructing integrated understanding.

## When to Use

Use synthesis mode when you need to:

- **Review literature** - Systematically review academic sources
- **Synthesize knowledge** - Integrate findings across sources
- **Identify themes** - Extract common themes from multiple works
- **Find gaps** - Discover gaps in existing knowledge
- **Build frameworks** - Develop conceptual frameworks

## Core Concepts

(no 'core concepts' section in source doc)

## Thought Type (TypeScript Interface)

```typescript
interface SynthesisThought extends BaseThought {
mode: ThinkingMode.SYNTHESIS;
  thoughtType: SynthesisThoughtType;

  // Sources and review metadata
  sources: Source[];
  reviewMetadata?: ReviewMetadata;

  // Extracted knowledge structures
  concepts?: Concept[];
  themes?: Theme[];
  findings?: Finding[];
  patterns?: Pattern[];
  relations?: ConceptRelation[];

  // Gaps and contradictions
  gaps?: LiteratureGap[];
  contradictions?: Contradiction[];

  // Synthesis outputs
  framework?: ConceptualFramework;
  conclusions?: SynthesisConclusion[];

  // Standard fields
  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  keyInsight?: string;
}
```

## Supporting Interfaces

```typescript
interface SourceQuality {
peerReviewed: boolean;
  impactFactor?: number;
  citationCount?: number;
  methodologicalRigor: number;      // 0-1
  relevance: number;                 // 0-1
  recency: number;                   // 0-1 (based on publication date)
  authorCredibility: number;         // 0-1
  overallQuality: number;            // 0-1 weighted average
}

interface Source {
id: string;
  type: SourceType;
  title: string;
  authors: string[];
  year: number;
  venue?: string;                    // Journal, conference, publisher
  doi?: string;
  url?: string;
  abstract?: string;
  keywords?: string[];
  quality: SourceQuality;
  notes?: string;
}

interface Concept {
id: string;
  term: string;
  definition: string;
  sourceIds: string[];               // Which sources define/use this
  frequency: number;                 // How often mentioned
  importance: number;                // 0-1 centrality to the topic
  relatedConcepts?: string[];        // IDs of related concepts
  variations?: string[];             // Alternative terms/synonyms
}

interface Theme {
id: string;
  name: string;
  description: string;
  sourceIds: string[];               // Sources contributing to this theme
  concepts: string[];                // Concept IDs within this theme
  strength: number;                  // 0-1 how well-supported
  consensus: 'strong' | 'moderate' | 'weak' | 'contested';
  evolution?: string;                // How theme developed over time
  subthemes?: Theme[];               // Nested themes
}

interface Finding {
id: string;
  statement: string;
  sourceIds: string[];
  evidenceStrength: 'strong' | 'moderate' | 'weak' | 'conflicting';
  methodology?: string;              // How finding was derived
  limitations?: string[];
  implications?: string[];
  replicationStatus?: 'replicated' | 'partial' | 'not_replicated' | 'unknown';
}

interface Pattern {
id: string;
  name: string;
  description: string;
  type: 'trend' | 'correlation' | 'causal' | 'methodological' | 'theoretical';
  sourceIds: string[];
  confidence: number;                // 0-1
  exceptions?: string[];             // Cases where pattern doesn't hold
  conditions?: string[];             // Conditions under which pattern holds
}

interface ConceptRelation {
id: string;
  fromId: string;                    // Concept or Theme ID
  toId: string;                      // Concept or Theme ID
  type: 'causes' | 'correlates' | 'contradicts' | 'supports' | 'extends' | 'refines' | 'subsumes';
  strength: number;                  // 0-1
  evidence: string[];                // Source IDs supporting this relation
  description?: string;
}

interface LiteratureGap {
id: string;
  description: string;
  type: 'empirical' | 'theoretical' | 'methodological' | 'population' | 'contextual';
  importance: 'critical' | 'significant' | 'moderate' | 'minor';
  relatedThemes: string[];           // Theme IDs
  suggestedResearch?: string[];      // Potential research directions
  barriers?: string[];               // Why gap exists
}

```

## Worked Example (from source doc)

```typescript
// Step 1: Identify and evaluate sources
const sources = await deepthinking_academic({
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
const concepts = await deepthinking_academic({
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
const themes = await deepthinking_academic({
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
          significance:

---

*Generated by RLM extraction pass on 2026-04-12*
