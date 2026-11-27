# Knowledge Pack: analysis

**Mode**: `analysis`
**Category skill**: `think-academic`
**Source doc**: `docs/modes/ANALYSIS.md`

## Overview

Analysis mode provides **rigorous qualitative analysis** methodologies including thematic analysis, grounded theory, discourse analysis, and content analysis. Designed for PhD-level qualitative research, it supports the full cycle from data familiarization through coding to theme development.

This mode captures the structure of qualitative inquiry - systematic coding, constant comparison, memo-writing, and reflexive analysis.

## When to Use

Use analysis mode when you need to:

- **Code qualitative data** - Systematically code interviews/documents
- **Develop themes** - Build themes from coded data
- **Apply grounded theory** - Theory development from data
- **Analyze discourse** - Study language and power
- **Document analysis process** - Maintain analytical audit trail

## Core Concepts

(no 'core concepts' section in source doc)

## Thought Type (TypeScript Interface)

```typescript
interface AnalysisThought extends BaseThought {
mode: ThinkingMode.ANALYSIS;
  thoughtType: AnalysisThoughtType;
  methodology: AnalysisMethodology;

  // Data
  dataSources: DataSource[];
  dataSegments?: DataSegment[];
  totalSegments?: number;

  // Coding
  codebook?: Codebook;
  currentCodes?: Code[];
  codingProgress?: {
    segmentsCoded: number;
    totalSegments: number;
    percentComplete: number;
}
```

## Supporting Interfaces

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
  quality: number;               // 0-1 data quality assessment
}

interface DataSegment {
id: string;
  sourceId: string;
  text: string;
  startPosition?: number;
  endPosition?: number;
  context?: string;              // Surrounding context
  participantId?: string;
  codes: string[];               // Code IDs applied
  memos?: string[];              // Memo IDs attached
}

interface Code {
id: string;
  label: string;
  definition: string;
  type: CodeType;
  examples: string[];            // Example quotes
  dataSegmentIds: string[];      // Segments coded with this
  frequency: number;             // How many times applied
  parentCodeId?: string;         // For hierarchical coding
  childCodeIds?: string[];
  relatedCodeIds?: string[];
  createdAt: Date;
  modifiedAt?: Date;
  memoIds?: string[];
}

interface CodeCooccurrence {
codeId1: string;
  codeId2: string;
  frequency: number;
  segmentIds: string[];          // Where they co-occur
  relationship?: string;         // Nature of relationship
}

interface Codebook {
id: string;
  name: string;
  version: number;
  codes: Code[];
  codeHierarchy: {
    rootCodeIds: string[];
    parentChildMap: Record<string, string[]>;
}

interface QualitativeTheme {
id: string;
  name: string;
  definition: string;
  level: ThemeLevel;
  codeIds: string[];             // Codes contributing to theme
  dataSegmentIds: string[];      // Supporting data
  subthemeIds?: string[];
  parentThemeId?: string;
  prevalence: number;            // 0-1 how prevalent in data
  richness: number;              // 0-1 depth of data
  keyQuotes: {
    quote: string;
    sourceId: string;
    significance: string;
}

interface ThematicMap {
id: string;
  name: string;
  themes: QualitativeTheme[];
  relationships: {
    themeId1: string;
    themeId2: string;
    type: 'hierarchical' | 'associative' | 'causal' | 'temporal' | 'contrast';
    description: string;
}

interface AnalyticalMemo {
id: string;
  type: MemoType;
  title: string;
  content: string;
  linkedCodes?: string[];
  linkedThemes?: string[];
  linkedSegments?: string[];
  date: Date;
  stage: AnalysisThoughtType;    // Analysis stage when written
  insights: string[];
  questions: string[];           // Questions raised
  nextSteps?: string[];
}

```

## Worked Example (from source doc)

```typescript
// Step 1: Data familiarization
const familiarization = await deepthinking_academic({
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
const initialCoding = await deepthinking_academic({
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
        type: 'descripti

---

*Generated by RLM extraction pass on 2026-04-12*
