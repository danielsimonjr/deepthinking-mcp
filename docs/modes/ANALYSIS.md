# Analysis Mode (Qualitative)

**Version**: 7.4.0
**Tool**: `deepthinking_analytical`
**Status**: Experimental (Phase 13, v7.4.0)
**Source**: `src/types/modes/analysis.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `AnalysisThoughtType`, `AnalysisMethodology`, `CodeType`, `ThemeLevel`, `MemoType`
- **Interfaces**: `DataSource`, `DataSegment`, `Code`, `CodeCooccurrence`, `Codebook`, `QualitativeTheme`, `ThematicMap`, `AnalyticalMemo`, `GTCategory`, `TheoreticalSampling`, `DiscoursePattern`, `QualitativeRigor`, `AnalysisThought`
- **Functions**: `isAnalysisThought`

---

## Overview

Analysis mode provides **rigorous qualitative analysis** methodologies including thematic analysis, grounded theory, discourse analysis, and content analysis. Designed for PhD-level qualitative research, it supports the full cycle from data familiarization through coding to theme development.

This mode captures the structure of qualitative inquiry - systematic coding, constant comparison, memo-writing, and reflexive analysis.

## Supported Methodologies

| Methodology | Description | Key Features |
|-------------|-------------|--------------|
| `thematic_analysis` | Braun & Clarke approach | Theme development from codes |
| `grounded_theory` | Glaser/Strauss/Charmaz | Theoretical saturation, constant comparison |
| `discourse_analysis` | Foucauldian, Critical | Power relations, interpretive repertoires |
| `content_analysis` | Qualitative CA | Systematic categorization |
| `phenomenological` | IPA, Descriptive | Lived experience |
| `narrative_analysis` | Narrative inquiry | Story structures |
| `framework_analysis` | Ritchie & Spencer | Applied research |
| `template_analysis` | King's template | A priori and emergent codes |

## Thought Types

| Type | Description |
|------|-------------|
| `data_familiarization` | Initial engagement with data |
| `initial_coding` | Generate initial codes |
| `focused_coding` | Develop focused/selective codes |
| `theme_development` | Develop themes from codes |
| `theme_refinement` | Refine and review themes |
| `theoretical_integration` | Integrate into theoretical framework |
| `memo_writing` | Analytical memo documentation |
| `saturation_assessment` | Assess theoretical saturation |

## When to Use Analysis Mode

Use analysis mode when you need to:

- **Code qualitative data** - Systematically code interviews/documents
- **Develop themes** - Build themes from coded data
- **Apply grounded theory** - Theory development from data
- **Analyze discourse** - Study language and power
- **Document analysis process** - Maintain analytical audit trail

### Problem Types Well-Suited for Analysis Mode

- **Interview analysis** - Analyzing interview transcripts
- **Document analysis** - Analyzing text documents
- **Observation notes** - Field notes analysis
- **Open-ended surveys** - Qualitative survey responses
- **Social media analysis** - Qualitative content analysis

## Core Concepts

### Data Source

```typescript
interface DataSource {
  id: string;
  type: 'interview' | 'focus_group' | 'observation' | 'document' | 'artifact' | 'field_notes' | 'survey_open_ended' | 'social_media' | 'other';
  description: string;
  participantId?: string;
  dateCollected?: Date;
  duration?: number;             // minutes
  wordCount?: number;
  context: string;
  quality: number;               // 0-1
}
```

### Code

```typescript
type CodeType =
  | 'descriptive'     // Describes content
  | 'in_vivo'         // Participant's own words
  | 'process'         // Actions/processes
  | 'initial'         // Open/initial coding
  | 'focused'         // Selective/focused
  | 'axial'           // Grounded theory axial
  | 'theoretical'     // Theoretical coding
  | 'emotion'         // Emotional expressions
  | 'value'           // Values/beliefs
  | 'versus'          // Comparisons
  | 'evaluation';     // Evaluative statements

interface Code {
  id: string;
  label: string;
  definition: string;
  type: CodeType;
  examples: string[];            // Example quotes
  dataSegmentIds: string[];
  frequency: number;
  parentCodeId?: string;         // For hierarchical coding
  childCodeIds?: string[];
  relatedCodeIds?: string[];
  createdAt: Date;
  modifiedAt?: Date;
  memoIds?: string[];
}
```

### Qualitative Theme

```typescript
type ThemeLevel = 'initial' | 'candidate' | 'refined' | 'final';

interface QualitativeTheme {
  id: string;
  name: string;
  definition: string;
  level: ThemeLevel;
  codeIds: string[];             // Codes contributing
  dataSegmentIds: string[];      // Supporting data
  subthemeIds?: string[];
  parentThemeId?: string;
  prevalence: number;            // 0-1
  richness: number;              // 0-1 depth of data
  keyQuotes: {
    quote: string;
    sourceId: string;
    significance: string;
  }[];
  narrative: string;             // Thematic narrative
  boundaryConditions?: string[];
  memoIds?: string[];
}
```

### Analytical Memo

```typescript
type MemoType =
  | 'code_memo'         // About specific code
  | 'theoretical_memo'  // Theoretical ideas
  | 'operational_memo'  // Methodological decisions
  | 'analytical_memo'   // Analytical insights
  | 'reflective_memo';  // Researcher reflexivity

interface AnalyticalMemo {
  id: string;
  type: MemoType;
  title: string;
  content: string;
  linkedCodes?: string[];
  linkedThemes?: string[];
  linkedSegments?: string[];
  date: Date;
  stage: AnalysisThoughtType;
  insights: string[];
  questions: string[];
  nextSteps?: string[];
}
```

### Qualitative Rigor

```typescript
interface QualitativeRigor {
  credibility: {
    rating: number;              // 0-1
    strategies: string[];        // Member checking, triangulation
  };
  transferability: {
    rating: number;
    thickDescription: boolean;
    contextProvided: boolean;
  };
  dependability: {
    rating: number;
    auditTrail: boolean;
    codebookStability: number;
  };
  confirmability: {
    rating: number;
    reflexivity: boolean;
    peerDebriefing: boolean;
  };
  saturation: {
    achieved: boolean;
    evidence: string;
    newCodesLastN: number;
  };
}
```

## Usage Example

```typescript
// Step 1: Data familiarization
const familiarization = await deepthinking_analytical({
  mode: 'analysis',
  thought: 'Initial engagement with interview data',
  thoughtNumber: 1,
  totalThoughts: 8,
  nextThoughtNeeded: true,

  thoughtType: 'data_familiarization',
  methodology: 'thematic_analysis',
  dataSources: [
    {
      id: 'int1',
      type: 'interview',
      description: 'Semi-structured interview with PhD student 1',
      participantId: 'P001',
      dateCollected: new Date('2024-01-15'),
      duration: 45,
      wordCount: 5200,
      context: 'First-generation doctoral student, year 2',
      quality: 0.9
    },
    {
      id: 'int2',
      type: 'interview',
      description: 'Semi-structured interview with PhD student 2',
      participantId: 'P002',
      dateCollected: new Date('2024-01-16'),
      duration: 52,
      wordCount: 6100,
      context: 'Continuing-generation doctoral student, year 3',
      quality: 0.85
    }
  ],
  memos: [{
    id: 'memo1',
    type: 'analytical_memo',
    title: 'Initial Impressions',
    content: 'Striking contrast between P001 and P002 in discussing advisor relationships. P001 expresses uncertainty about "unwritten rules" while P002 seems to navigate expectations more easily.',
    date: new Date(),
    stage: 'data_familiarization',
    insights: ['Hidden curriculum appears important', 'Family background shapes expectations'],
    questions: ['How do students learn unwritten rules?', 'Role of peer networks?']
  }]
});

// Step 2: Initial coding
const initialCoding = await deepthinking_analytical({
  mode: 'analysis',
  thought: 'Generate initial codes from data',
  thoughtNumber: 2,
  totalThoughts: 8,
  nextThoughtNeeded: true,

  thoughtType: 'initial_coding',
  methodology: 'thematic_analysis',
  dataSources: familiarization.dataSources,
  codebook: {
    id: 'cb1',
    name: 'PhD Experience Codebook v1',
    version: 1,
    codes: [
      {
        id: 'c1',
        label: 'Not knowing the rules',
        definition: 'Expressions of uncertainty about implicit expectations',
        type: 'in_vivo',
        examples: ['"I didn\'t know I was supposed to..."', '"Nobody tells you that..."'],
        dataSegmentIds: ['seg1', 'seg3', 'seg7'],
        frequency: 8,
        createdAt: new Date()
      },
      {
        id: 'c2',
        label: 'Advisor as gatekeeper',
        definition: 'Perceptions of advisor controlling access to resources/opportunities',
        type: 'descriptive',
        examples: ['"She decides who gets funding"', '"He has to approve everything"'],
        dataSegmentIds: ['seg2', 'seg5'],
        frequency: 5,
        createdAt: new Date()
      },
      {
        id: 'c3',
        label: 'Peer learning',
        definition: 'Learning from other students rather than formal channels',
        type: 'process',
        examples: ['"The older students told me"', '"I only found out through friends"'],
        dataSegmentIds: ['seg4', 'seg6', 'seg8'],
        frequency: 7,
        createdAt: new Date()
      },
      {
        id: 'c4',
        label: 'Imposter feelings',
        definition: 'Feeling like fraud or not belonging in academia',
        type: 'emotion',
        examples: ['"I felt like I didn\'t deserve to be here"'],
        dataSegmentIds: ['seg9', 'seg10'],
        frequency: 4,
        createdAt: new Date()
      }
    ],
    codeHierarchy: {
      rootCodeIds: ['c1', 'c2', 'c3', 'c4'],
      parentChildMap: {}
    },
    cooccurrences: [
      {
        codeId1: 'c1',
        codeId2: 'c4',
        frequency: 3,
        segmentIds: ['seg9', 'seg10', 'seg12'],
        relationship: 'Not knowing rules contributes to imposter feelings'
      }
    ],
    lastUpdated: new Date()
  },
  codingProgress: {
    segmentsCoded: 45,
    totalSegments: 120,
    percentComplete: 37.5
  }
});

// Step 3: Focused coding
const focusedCoding = await deepthinking_analytical({
  mode: 'analysis',
  thought: 'Develop focused codes through constant comparison',
  thoughtNumber: 3,
  totalThoughts: 8,
  nextThoughtNeeded: true,

  thoughtType: 'focused_coding',
  methodology: 'thematic_analysis',
  codebook: {
    ...initialCoding.codebook,
    version: 2,
    codes: [
      ...initialCoding.codebook.codes,
      {
        id: 'c5',
        label: 'Hidden curriculum navigation',
        definition: 'Higher-order category for learning implicit rules of academia',
        type: 'focused',
        examples: [],
        dataSegmentIds: [],
        frequency: 0,
        childCodeIds: ['c1', 'c3'],
        createdAt: new Date()
      },
      {
        id: 'c6',
        label: 'Power dynamics',
        definition: 'Power relations between students and faculty/institution',
        type: 'focused',
        examples: [],
        dataSegmentIds: [],
        frequency: 0,
        childCodeIds: ['c2'],
        createdAt: new Date()
      }
    ]
  },
  memos: [{
    id: 'memo2',
    type: 'theoretical_memo',
    title: 'Hidden Curriculum Emerging',
    content: 'Multiple codes are pointing to the concept of hidden curriculum in doctoral education. The tacit knowledge required seems to be transmitted informally through peer networks. First-gen students appear disadvantaged in accessing these networks.',
    linkedCodes: ['c1', 'c3', 'c5'],
    date: new Date(),
    stage: 'focused_coding',
    insights: ['Hidden curriculum is major construct', 'Social capital mediates access'],
    questions: ['Is this a class issue or institutional issue?']
  }]
});

// Step 4: Theme development
const themeDevelopment = await deepthinking_analytical({
  mode: 'analysis',
  thought: 'Develop initial themes from codes',
  thoughtNumber: 4,
  totalThoughts: 8,
  nextThoughtNeeded: true,

  thoughtType: 'theme_development',
  methodology: 'thematic_analysis',
  themes: [
    {
      id: 't1',
      name: 'The Hidden Curriculum of Doctoral Education',
      definition: 'Implicit expectations and unwritten rules that students must learn to succeed',
      level: 'candidate',
      codeIds: ['c1', 'c3', 'c5'],
      dataSegmentIds: ['seg1', 'seg3', 'seg4', 'seg6', 'seg7', 'seg8'],
      prevalence: 0.85,
      richness: 0.8,
      keyQuotes: [
        {
          quote: 'Nobody tells you that you need to go to the departmental social events. I only found out after a year that this is where networking happens.',
          sourceId: 'int1',
          significance: 'Illustrates invisibility of important norms'
        },
        {
          quote: 'The older PhD students basically saved me. They told me everything the handbook doesn\'t say.',
          sourceId: 'int1',
          significance: 'Shows peer network importance'
        }
      ],
      narrative: 'Doctoral programs contain significant implicit expectations that are not formally communicated. Success requires learning these unwritten rules, which first-generation students often learn later or not at all.'
    },
    {
      id: 't2',
      name: 'Navigating Power Asymmetries',
      definition: 'Managing relationships with advisors and faculty who hold significant power',
      level: 'candidate',
      codeIds: ['c2', 'c6'],
      dataSegmentIds: ['seg2', 'seg5', 'seg11'],
      prevalence: 0.6,
      richness: 0.7,
      keyQuotes: [
        {
          quote: 'My advisor basically controls my career. If she doesn\'t write a strong letter, I\'m done.',
          sourceId: 'int2',
          significance: 'Illustrates advisor dependency'
        }
      ],
      narrative: 'Doctoral students navigate significant power imbalances with advisors who control access to funding, opportunities, and career advancement.'
    }
  ]
});

// Step 5: Theme refinement
const themeRefinement = await deepthinking_analytical({
  mode: 'analysis',
  thought: 'Refine themes through review and testing',
  thoughtNumber: 5,
  totalThoughts: 8,
  nextThoughtNeeded: true,

  thoughtType: 'theme_refinement',
  methodology: 'thematic_analysis',
  themes: [
    {
      ...themeDevelopment.themes[0],
      level: 'refined',
      subthemeIds: ['t1a', 't1b'],
      boundaryConditions: ['Applies most strongly to first-generation students', 'May vary by discipline']
    }
  ],
  thematicMap: {
    id: 'tm1',
    name: 'Doctoral Socialization Thematic Map',
    themes: themeDevelopment.themes,
    relationships: [
      {
        themeId1: 't1',
        themeId2: 't2',
        type: 'associative',
        description: 'Hidden curriculum often involves learning power dynamics'
      }
    ],
    overarchingNarrative: 'Doctoral education involves navigating implicit expectations and power relations, with first-generation students facing additional barriers.',
    diagramNotation: `graph TD
      T1[Hidden Curriculum] --> T1a[Unwritten Rules]
      T1 --> T1b[Peer Learning]
      T2[Power Dynamics] --> T2a[Advisor Dependency]
      T1 -.-> T2`
  }
});

// Step 6: Memo writing
const memoWriting = await deepthinking_analytical({
  mode: 'analysis',
  thought: 'Write analytical and reflective memos',
  thoughtNumber: 6,
  totalThoughts: 8,
  nextThoughtNeeded: true,

  thoughtType: 'memo_writing',
  methodology: 'thematic_analysis',
  memos: [
    {
      id: 'memo3',
      type: 'theoretical_memo',
      title: 'Connection to Cultural Capital Theory',
      content: 'The hidden curriculum theme connects strongly to Bourdieu\'s concept of cultural capital. Students from academic families arrive with cultural capital that helps them navigate implicit expectations. First-generation students must acquire this capital during the program, often through peer networks. This aligns with Stephens et al. (2012) on class-based hidden curriculum.',
      linkedThemes: ['t1'],
      date: new Date(),
      stage: 'memo_writing',
      insights: ['Bourdieu framework fits well', 'Class-based cultural capital is key'],
      questions: ['How do we operationalize cultural capital?'],
      nextSteps: ['Review Bourdieu literature', 'Look for counter-examples']
    },
    {
      id: 'memo4',
      type: 'reflective_memo',
      title: 'Researcher Positionality',
      content: 'As a first-generation PhD myself, I need to be cautious about over-identifying with participants\' experiences. I notice I am particularly drawn to quotes about "not knowing the rules" - this may reflect my own experience. I am using peer debriefing to check my interpretations.',
      date: new Date(),
      stage: 'memo_writing',
      insights: ['Personal experience shapes interpretation'],
      questions: ['Am I finding what I expect to find?'],
      nextSteps: ['Peer debrief scheduled', 'Actively seek disconfirming cases']
    }
  ]
});

// Step 7: Saturation assessment
const saturationAssessment = await deepthinking_analytical({
  mode: 'analysis',
  thought: 'Assess whether theoretical saturation is reached',
  thoughtNumber: 7,
  totalThoughts: 8,
  nextThoughtNeeded: true,

  thoughtType: 'saturation_assessment',
  methodology: 'thematic_analysis',
  rigorAssessment: {
    credibility: {
      rating: 0.8,
      strategies: ['Member checking with 3 participants', 'Peer debriefing', 'Prolonged engagement']
    },
    transferability: {
      rating: 0.7,
      thickDescription: true,
      contextProvided: true
    },
    dependability: {
      rating: 0.75,
      auditTrail: true,
      codebookStability: 0.85
    },
    confirmability: {
      rating: 0.7,
      reflexivity: true,
      peerDebriefing: true
    },
    saturation: {
      achieved: true,
      evidence: 'Last 3 interviews produced no new codes; themes stable',
      newCodesLastN: 0
    }
  }
});

// Step 8: Theoretical integration
const integration = await deepthinking_analytical({
  mode: 'analysis',
  thought: 'Integrate findings into theoretical framework',
  thoughtNumber: 8,
  totalThoughts: 8,
  nextThoughtNeeded: false,

  thoughtType: 'theoretical_integration',
  methodology: 'thematic_analysis',
  thematicMap: {
    ...themeRefinement.thematicMap,
    overarchingNarrative: 'Doctoral education operates as a site of cultural reproduction, where implicit expectations (hidden curriculum) favor students with pre-existing academic cultural capital. First-generation students must acquire this capital through peer networks, facing additional barriers in navigating power dynamics with advisors.'
  },
  rigorAssessment: saturationAssessment.rigorAssessment,
  keyInsight: 'Hidden curriculum and power dynamics are mediated by cultural capital, disadvantaging first-generation students'
});
```

## Grounded Theory Specifics

For grounded theory analysis, the mode supports:

### GTCategory

```typescript
interface GTCategory {
  id: string;
  name: string;
  definition: string;
  properties: {
    name: string;
    dimensions: [string, string]; // Dimensional range
  }[];
  codes: string[];
  isCore: boolean;               // Core category?
  saturation: 'saturated' | 'developing' | 'sparse';
  relationships: {
    categoryId: string;
    type: 'causal' | 'contextual' | 'consequential' | 'strategy';
    description: string;
  }[];
}
```

### Theoretical Sampling

```typescript
interface TheoreticalSampling {
  id: string;
  currentGaps: string[];
  samplingDecision: string;
  rationale: string;
  categoryTargeted: string;
  dateDecided: Date;
  outcome?: string;
}
```

## Best Practices

### Coding

**Do:**
- Code close to the data initially
- Use in vivo codes where appropriate
- Define codes clearly
- Track code evolution

**Don't:**
- Force data into preconceived codes
- Skip memo-writing
- Code inconsistently
- Over-abstract too early

### Theme Development

**Do:**
- Ground themes in codes
- Document theme evolution
- Test themes against data
- Define theme boundaries

**Don't:**
- Create themes without supporting codes
- Ignore negative cases
- Skip member checking
- Conflate themes

### Rigor

**Do:**
- Maintain audit trail
- Practice reflexivity
- Use multiple rigor strategies
- Document decisions

**Don't:**
- Claim objectivity
- Skip saturation assessment
- Ignore researcher positionality
- Neglect peer debriefing

## AnalysisThought Interface

```typescript
interface AnalysisThought extends BaseThought {
  mode: ThinkingMode.ANALYSIS;
  thoughtType: AnalysisThoughtType;
  methodology: AnalysisMethodology;

  dataSources: DataSource[];
  dataSegments?: DataSegment[];
  totalSegments?: number;

  codebook?: Codebook;
  currentCodes?: Code[];
  codingProgress?: {
    segmentsCoded: number;
    totalSegments: number;
    percentComplete: number;
  };

  themes?: QualitativeTheme[];
  thematicMap?: ThematicMap;

  memos?: AnalyticalMemo[];

  gtCategories?: GTCategory[];
  theoreticalSampling?: TheoreticalSampling[];
  discoursePatterns?: DiscoursePattern[];

  rigorAssessment?: QualitativeRigor;

  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  keyInsight?: string;
}
```

## Integration with Other Modes

Analysis mode integrates with:

- **Synthesis Mode** - Analyzing sources for synthesis
- **Scientific Method Mode** - Qualitative methodology
- **First Principles Mode** - Grounding in data
- **Inductive Mode** - Building from observations

## Related Modes

- [Synthesis Mode](./SYNTHESIS.md) - Literature review
- [Scientific Method Mode](./SCIENTIFICMETHOD.md) - Research methodology
- [First Principles Mode](./FIRSTPRINCIPLES.md) - Foundational reasoning
- [Inductive Mode](./INDUCTIVE.md) - Inductive inference

## Limitations

- **No automated coding** - Manual coding required
- **Expertise needed** - Requires methodology training
- **Time intensive** - Rigorous qualitative analysis is slow

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
