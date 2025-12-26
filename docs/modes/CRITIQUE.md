# Critique Mode

**Version**: 7.4.0 | **Handler**: v8.4.0 (Specialized - 6 Socratic Categories)
**Tool**: `deepthinking_academic`
**Status**: Stable (Fully Implemented)
**Source**: `src/types/modes/critique.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `CritiqueThoughtType`, `WorkType`
- **Interfaces**: `CritiquedWork`, `DesignAssessment`, `SampleAssessment`, `AnalysisAssessment`, `MethodologyEvaluation`, `ValidityAssessment`, `LogicalStructure`, `ArgumentCritique`, `EvidenceQuality`, `EvidenceUseCritique`, `NoveltyAssessment`, `ImpactAssessment`, `ContributionEvaluation`, `CritiquePoint`, `ImprovementSuggestion`, `CritiqueVerdict`, `CritiqueThought`
- **Functions**: `isCritiqueThought`

---

## Overview

Critique mode provides **critical analysis and evaluation** of academic work. Designed for peer review, thesis examination, and scholarly critique, it supports systematic assessment of methodology, arguments, evidence, and contributions.

This mode captures the structure of academic critique - from work characterization through multi-dimensional evaluation to balanced verdict.

## Thought Types

| Type | Description |
|------|-------------|
| `work_characterization` | Characterize the work being critiqued |
| `methodology_evaluation` | Evaluate research methodology |
| `argument_analysis` | Analyze logical structure of arguments |
| `evidence_assessment` | Assess quality and use of evidence |
| `contribution_evaluation` | Evaluate scholarly contribution |
| `limitation_identification` | Identify limitations and weaknesses |
| `strength_recognition` | Recognize strengths and merits |
| `improvement_suggestion` | Suggest improvements |

## When to Use Critique Mode

Use critique mode when you need to:

- **Review papers** - Peer review for journals
- **Evaluate theses** - Dissertation examination
- **Analyze arguments** - Logical critique
- **Assess evidence** - Evidence quality evaluation
- **Provide feedback** - Constructive criticism

### Problem Types Well-Suited for Critique Mode

- **Peer review** - Journal manuscript review
- **Thesis examination** - PhD thesis critique
- **Research evaluation** - Grant proposal assessment
- **Literature critique** - Analyzing existing work
- **Self-review** - Improving own research

## Core Concepts

### Critiqued Work

```typescript
interface CritiquedWork {
  id: string;
  title: string;
  authors: string[];
  year: number;
  type: WorkType;               // empirical_study, theoretical_paper, etc.
  venue?: string;
  field: string;
  subfield?: string;
  claimedContribution: string;
  researchQuestion?: string;
  abstract?: string;
}
```

### Methodology Evaluation

```typescript
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
```

### Validity Assessment

```typescript
interface ValidityAssessment {
  internal: {
    rating: number;              // 0-1
    threats: string[];
    mitigations: string[];
  };
  external: {
    rating: number;
    generalizability: string;
    limitations: string[];
  };
  construct: {
    rating: number;
    operationalization: string;
    concerns: string[];
  };
  statistical?: {
    rating: number;
    powerAnalysis: boolean;
    effectSizes: boolean;
    concerns: string[];
  };
}
```

### Argument Critique

```typescript
interface ArgumentCritique {
  id: string;
  logicalStructure: LogicalStructure;
  fallaciesIdentified: {
    name: string;
    location: string;
    severity: 'critical' | 'significant' | 'minor';
  }[];
  unsupportedClaims: string[];
  overinterpretations: string[];
  strengths: string[];
  rating: number;                // 0-1
}
```

### Critique Verdict

```typescript
interface CritiqueVerdict {
  recommendation: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
  confidence: number;            // 0-1
  summary: string;
  majorStrengths: string[];
  majorWeaknesses: string[];
  keyImprovements: string[];
}
```

## Usage Example

```typescript
// Step 1: Characterize the work
const work = await deepthinking_analytical({
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
const methodology = await deepthinking_analytical({
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
        limitations: ['Single university', 'Specific demographic', 'One time period']
      },
      construct: {
        rating: 0.7,
        operationalization: 'Dropout defined as non-enrollment after 2 terms',
        concerns: ['May miss transfer students', 'Leave of absence cases unclear']
      },
      statistical: {
        rating: 0.8,
        powerAnalysis: false,
        effectSizes: true,
        concerns: ['No power analysis for sample size justification']
      }
    },
    overallRating: 0.68,
    majorConcerns: ['Single institution limits external validity', 'Reproducibility concerns'],
    minorConcerns: ['Missing power analysis', 'Partial hyperparameter reporting']
  },
  critiquePoints: [
    {
      id: 'cp1',
      type: 'concern',
      category: 'methodology',
      severity: 'major',
      description: 'Study limited to single institution, limiting generalizability',
      recommendation: 'Validate on multi-institutional dataset'
    }
  ]
});

// Step 3: Analyze arguments
const arguments = await deepthinking_analytical({
  mode: 'critique',
  thought: 'Analyze the logical structure of arguments',
  thoughtNumber: 3,
  totalThoughts: 8,
  nextThoughtNeeded: true,

  thoughtType: 'argument_analysis',
  work: work.work,
  argumentCritique: {
    id: 'arg1',
    logicalStructure: {
      premises: {
        stated: [
          'Deep learning can capture complex patterns',
          'Prior ML methods achieve ~80% accuracy',
          'Our model achieves 92% accuracy'
        ],
        unstated: [
          'Higher accuracy implies better predictions',
          'AUC is the appropriate metric'
        ],
        questionable: [
          'Higher accuracy necessarily leads to better student outcomes'
        ]
      },
      conclusions: {
        main: 'Deep learning outperforms traditional ML for dropout prediction',
        supporting: ['Our model captures temporal dynamics better'],
        overreaching: ['Institutions should adopt this approach immediately']
      },
      inferentialGaps: ['No direct comparison with intervention effectiveness'],
      circularReasoning: false,
      overallCoherence: 0.75
    },
    fallaciesIdentified: [
      {
        name: 'Appeal to novelty',
        location: 'Discussion section',
        severity: 'minor'
      }
    ],
    unsupportedClaims: ['Implementation cost-effectiveness'],
    overinterpretations: ['Claim that this will "solve" dropout problem'],
    strengths: ['Clear hypothesis stated', 'Results clearly presented'],
    rating: 0.7
  }
});

// Step 4: Assess evidence use
const evidence = await deepthinking_analytical({
  mode: 'critique',
  thought: 'Assess the quality and use of evidence',
  thoughtNumber: 4,
  totalThoughts: 8,
  nextThoughtNeeded: true,

  thoughtType: 'evidence_assessment',
  work: work.work,
  evidenceCritique: {
    id: 'ev1',
    evidenceProvided: [
      {
        description: 'Performance metrics (AUC, precision, recall)',
        quality: {
          type: 'primary',
          reliability: 0.85,
          validity: 0.8,
          relevance: 0.95,
          sufficiency: 0.7,
          concerns: ['No confidence intervals']
        }
      },
      {
        description: 'Comparison with baseline methods',
        quality: {
          type: 'primary',
          reliability: 0.8,
          validity: 0.75,
          relevance: 0.9,
          sufficiency: 0.8,
          concerns: ['Baselines may not be optimal']
        }
      }
    ],
    evidenceMissing: [
      'Real-world intervention outcomes',
      'Fairness analysis across subgroups',
      'Computational cost comparison'
    ],
    cherryPicking: false,
    misrepresentation: [],
    appropriateCitations: true,
    overallRating: 0.72
  }
});

// Step 5: Evaluate contribution
const contribution = await deepthinking_analytical({
  mode: 'critique',
  thought: 'Evaluate the scholarly contribution',
  thoughtNumber: 5,
  totalThoughts: 8,
  nextThoughtNeeded: true,

  thoughtType: 'contribution_evaluation',
  work: work.work,
  contributionEvaluation: {
    id: 'cont1',
    novelty: {
      theoreticalNovelty: 0.4,
      methodologicalNovelty: 0.6,
      empiricalNovelty: 0.7,
      overallNovelty: 0.57,
      comparisonToExisting: 'Applies existing architectures to new dataset',
      incrementalOrTransformative: 'incremental'
    },
    impact: {
      potentialImpact: 'moderate',
      targetAudience: ['Educational researchers', 'University administrators'],
      practicalImplications: ['Early warning systems', 'Targeted interventions'],
      theoreticalImplications: ['Temporal patterns in dropout behavior'],
      limitations: ['Implementation barriers not addressed']
    },
    clarity: 0.8,
    significance: 'moderate',
    positionInLiterature: 'Extends prior work with modern architecture'
  }
});

// Step 6: Identify limitations and strengths
const limitations = await deepthinking_analytical({
  mode: 'critique',
  thought: 'Identify limitations and recognize strengths',
  thoughtNumber: 6,
  totalThoughts: 8,
  nextThoughtNeeded: true,

  thoughtType: 'limitation_identification',
  work: work.work,
  critiquePoints: [
    // Strengths
    {
      id: 'str1',
      type: 'strength',
      category: 'methodology',
      severity: 'neutral',
      description: 'Large sample size (n=50,000) provides statistical power'
    },
    {
      id: 'str2',
      type: 'strength',
      category: 'contribution',
      severity: 'neutral',
      description: 'Addresses practical problem of student retention'
    },
    {
      id: 'str3',
      type: 'strength',
      category: 'writing',
      severity: 'neutral',
      description: 'Clear presentation of methods and results'
    },
    // Weaknesses
    {
      id: 'weak1',
      type: 'weakness',
      category: 'methodology',
      severity: 'major',
      description: 'Single institution limits generalizability',
      recommendation: 'Replicate on diverse institutions'
    },
    {
      id: 'weak2',
      type: 'weakness',
      category: 'evidence',
      severity: 'significant',
      description: 'No fairness analysis across demographic groups',
      recommendation: 'Add disaggregated analysis by race, gender, SES'
    },
    {
      id: 'weak3',
      type: 'weakness',
      category: 'contribution',
      severity: 'minor',
      description: 'Implementation guidance is limited',
      recommendation: 'Add practical deployment considerations'
    }
  ],
  strengthsIdentified: 3,
  weaknessesIdentified: 3,
  balanceRatio: 1.0  // Equal strengths and weaknesses = balanced
});

// Step 7: Suggest improvements
const improvements = await deepthinking_analytical({
  mode: 'critique',
  thought: 'Suggest improvements for revision',
  thoughtNumber: 7,
  totalThoughts: 8,
  nextThoughtNeeded: true,

  thoughtType: 'improvement_suggestion',
  work: work.work,
  improvements: [
    {
      id: 'imp1',
      area: 'External validity',
      current: 'Single institution sample',
      suggested: 'Include 2-3 additional institutions with different demographics',
      rationale: 'Dramatically improve generalizability claims',
      priority: 'essential',
      feasibility: 'moderate'
    },
    {
      id: 'imp2',
      area: 'Fairness',
      current: 'No subgroup analysis',
      suggested: 'Add analysis disaggregated by protected attributes',
      rationale: 'Ethical requirement for predictive systems',
      priority: 'essential',
      feasibility: 'easy'
    },
    {
      id: 'imp3',
      area: 'Reproducibility',
      current: 'Partial code/data availability',
      suggested: 'Release code and (anonymized) data on OSF',
      rationale: 'Enables replication and builds trust',
      priority: 'recommended',
      feasibility: 'easy'
    }
  ]
});

// Step 8: Final verdict
const verdict = await deepthinking_analytical({
  mode: 'critique',
  thought: 'Provide overall verdict and recommendation',
  thoughtNumber: 8,
  totalThoughts: 8,
  nextThoughtNeeded: false,

  thoughtType: 'strength_recognition',
  work: work.work,
  verdict: {
    recommendation: 'major_revision',
    confidence: 0.8,
    summary: 'Technically competent study addressing an important problem, but limited by single-institution design and missing fairness analysis. Major revision addressing external validity and equity concerns would make this publishable.',
    majorStrengths: [
      'Large sample size with proper validation',
      'Addresses practical educational problem',
      'Clear methodology and presentation'
    ],
    majorWeaknesses: [
      'Single institution limits generalizability',
      'No fairness/equity analysis',
      'Reproducibility concerns'
    ],
    keyImprovements: [
      'Multi-institutional validation',
      'Disaggregated fairness analysis',
      'Code and data release'
    ]
  },
  strengthsIdentified: 3,
  weaknessesIdentified: 3,
  balanceRatio: 1.0,
  keyInsight: 'Solid work needing external validity and fairness improvements before publication'
});
```

## Best Practices

### Work Characterization

**Do:**
- Identify the work type accurately
- Note the claimed contribution
- State the research question

**Don't:**
- Misrepresent the work's aims
- Evaluate a straw man
- Ignore context

### Methodology Evaluation

**Do:**
- Assess all validity types
- Note both threats and mitigations
- Rate systematically

**Don't:**
- Apply wrong standards for work type
- Ignore field conventions
- Demand perfection

### Balanced Critique

**Do:**
- Recognize genuine strengths
- Prioritize concerns by severity
- Maintain 1:1 strength:weakness ratio when possible

**Don't:**
- Focus only on weaknesses
- Invent strengths to seem balanced
- Let minor issues overshadow major

### Constructive Feedback

**Do:**
- Provide actionable suggestions
- Assess feasibility of changes
- Prioritize improvements

**Don't:**
- Make vague recommendations
- Suggest impossible changes
- Ignore resource constraints

## CritiqueThought Interface

```typescript
interface CritiqueThought extends BaseThought {
  mode: ThinkingMode.CRITIQUE;
  thoughtType: CritiqueThoughtType;

  work: CritiquedWork;

  methodologyEvaluation?: MethodologyEvaluation;
  argumentCritique?: ArgumentCritique;
  evidenceCritique?: EvidenceUseCritique;
  contributionEvaluation?: ContributionEvaluation;

  critiquePoints: CritiquePoint[];
  improvements?: ImprovementSuggestion[];
  verdict?: CritiqueVerdict;

  strengthsIdentified: number;
  weaknessesIdentified: number;
  balanceRatio: number;

  dependencies: string[];
  assumptions: string[];
  uncertainty: number;
  keyInsight?: string;
}
```

## Integration with Other Modes

Critique mode integrates with:

- **Synthesis Mode** - Evaluating sources in review
- **Argumentation Mode** - Analyzing argument structure
- **Scientific Method Mode** - Methodology evaluation
- **Evidential Mode** - Evidence assessment

## Related Modes

- [Synthesis Mode](./SYNTHESIS.md) - Literature review
- [Argumentation Mode](./ARGUMENTATION.md) - Argument construction
- [Scientific Method Mode](./SCIENTIFICMETHOD.md) - Research methodology
- [Evidential Mode](./EVIDENTIAL.md) - Evidence evaluation

## Limitations

- **No automated analysis** - Manual evaluation required
- **Subjectivity** - Ratings require expertise
- **Field-specific** - Standards vary by discipline

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
