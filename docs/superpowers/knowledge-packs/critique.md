# Knowledge Pack: critique

**Mode**: `critique`
**Category skill**: `think-academic`
**Source doc**: `docs/modes/CRITIQUE.md`

## Overview

Critique mode provides **critical analysis and evaluation** of academic work. Designed for peer review, thesis examination, and scholarly critique, it supports systematic assessment of methodology, arguments, evidence, and contributions.

This mode captures the structure of academic critique - from work characterization through multi-dimensional evaluation to balanced verdict.

## When to Use

Use critique mode when you need to:

- **Review papers** - Peer review for journals
- **Evaluate theses** - Dissertation examination
- **Analyze arguments** - Logical critique
- **Assess evidence** - Evidence quality evaluation
- **Provide feedback** - Constructive criticism

## Core Concepts

(no 'core concepts' section in source doc)

## Thought Type (TypeScript Interface)

```typescript
interface CritiqueThought extends BaseThought {
mode: ThinkingMode.CRITIQUE;
  thoughtType: CritiqueThoughtType;

  // Work being critiqued
  work: CritiquedWork;

  // Evaluation components
  methodologyEvaluation?: MethodologyEvaluation;
  argumentCritique?: ArgumentCritique;
  evidenceCritique?: EvidenceUseCritique;
  contributionEvaluation?: ContributionEvaluation;

  // Critique results
  critiquePoints: CritiquePoint[];
  improvements?: ImprovementSuggestion[];
  verdict?: CritiqueVerdict;

  // Balance indicators
  strengthsIdentified: number;
  weaknessesIdentified: number;
  balanceRatio: number;          // Aim for balanced critique

  // Standard fields
  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  keyInsight?: string;
}
```

## Supporting Interfaces

```typescript
interface CritiquedWork {
id: string;
  title: string;
  authors: string[];
  year: number;
  type: WorkType;
  venue?: string;
  field: string;
  subfield?: string;
  claimedContribution: string;
  researchQuestion?: string;
  abstract?: string;
}

interface DesignAssessment {
designType: string;            // e.g., "randomized controlled trial", "case study"
  appropriateness: 'appropriate' | 'somewhat_appropriate' | 'inappropriate';
  justification: string;
  alternatives?: string[];
  rating: number;                // 0-1
}

interface SampleAssessment {
sampleSize?: number;
  sampleType: string;
  representativeness: 'representative' | 'limited' | 'biased' | 'unclear';
  selectionMethod?: string;
  adequacy: 'adequate' | 'marginal' | 'inadequate';
  concerns: string[];
  rating: number;                // 0-1
}

interface AnalysisAssessment {
methods: string[];
  appropriateness: 'appropriate' | 'somewhat_appropriate' | 'inappropriate';
  rigor: 'rigorous' | 'adequate' | 'inadequate';
  transparency: 'transparent' | 'partial' | 'opaque';
  reproducibility: 'reproducible' | 'partially' | 'not_reproducible';
  concerns: string[];
  rating: number;                // 0-1
}

interface MethodologyEvaluation {
id: string;
  design: DesignAssessment;
  sample: SampleAssessment;
  analysis: AnalysisAssessment;
  validity: ValidityAssessment;
  overallRating: number;         // 0-1
  majorConcerns: string[];
  minorConcerns: string[];
}

interface ValidityAssessment {
internal: {
    rating: number;              // 0-1
    threats: string[];
    mitigations: string[];
}

interface LogicalStructure {
premises: {
    stated: string[];
    unstated: string[];
    questionable: string[];
}

interface ArgumentCritique {
id: string;
  logicalStructure: LogicalStructure;
  fallaciesIdentified: {
    name: string;
    location: string;
    severity: 'critical' | 'significant' | 'minor';
}

```

## Worked Example (from source doc)

```typescript
// Step 1: Characterize the work
const work = await deepthinking_academic({
  mode: 'critique',
  thought: 'Characterize the paper being reviewed',
  thoughtNumber: 1,
  totalThoughts: 8,
  nextThoughtNeeded: true,

  thoughtType: 'work_characterization',
  work: {
    id: 'paper1',
    title: 'Neural Networks for Predicting Student Dropout',
    authors: ['Smith, J.', 'Chen, L.'],
    year: 2024,
    type: 'empirical_study',
    venue: 'Computers & Education',
    field: 'Educational Data Mining',
    subfield: 'Predictive Analytics',
    claimedContribution: 'Novel deep learning architecture achieving 92% dropout prediction accuracy',
    researchQuestion: 'Can deep learning outperform traditional ML for dropout prediction?'
  },
  critiquePoints: [],
  strengthsIdentified: 0,
  weaknessesIdentified: 0,
  balanceRatio: 0
});

// Step 2: Evaluate methodology
const methodology = await deepthinking_academic({
  mode: 'critique',
  thought: 'Evaluate the research methodology',
  thoughtNumber: 2,
  totalThoughts: 8,
  nextThoughtNeeded: true,

  thoughtType: 'methodology_evaluation',
  work: work.work,
  methodologyEvaluation: {
    id: 'meth1',
    design: {
      designType: 'Retrospective cohort study with train/test split',
      appropriateness: 'appropriate',
      justification: 'Appropriate for predictive modeling',
      alternatives: ['Prospective validation', 'Cross-institutional validation'],
      rating: 0.75
    },
    sample: {
      sampleSize: 50000,
      sampleType: 'Convenience sample from single university',
      representativeness: 'limited',
      selectionMethod: 'All students enrolled 2018-2022',
      adequacy: 'adequate',
      concerns: ['Single institution limits generalizability', 'Selection bias possible'],
      rating: 0.65
    },
    analysis: {
      methods: ['Deep neural network', 'Cross-validation', 'AUC-ROC evaluation'],
      appropriateness: 'appropriate',
      rigor: 'adequate',
      transparency: 'partial',
      reproducibility: 'partially',
      concerns: ['Hyperparameters not fully specified', 'No code availability'],
      rating: 0.7
    },
    validity: {
      internal: {
        rating: 0.75,
        threats: ['Data leakage risk', 'Temporal confounds'],
        mitigations: ['Proper train/test split', 'Time-based validation']
      },
      external: {
        rating: 0.5,
        generalizability: 'Limited to similar institutions',
        limitations: ['Single university', 'Specific 

---

*Generated by RLM extraction pass on 2026-04-12*
