# Scientific Method Mode

**Version**: 7.3.0
**Tool**: `deepthinking_scientific`
**Status**: Experimental
**Source**: `src/types/modes/scientificmethod.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Interfaces**: `ResearchQuestion`, `Hypothesis`, `ExperimentDesign`, `Variable`, `DataCollection`, `Observation`, `Measurement`, `StatisticalAnalysis`, `StatisticalTest`, `ScientificConclusion`, `ScientificMethodThought`
- **Functions**: `isScientificMethodThought`

---

## Overview

Scientific Method mode provides **hypothesis-driven experimentation** and rigorous analysis. It supports the full scientific cycle from question formulation through experimental design, data collection, statistical analysis, to conclusions.

This mode captures the structure of scientific inquiry - from observation through hypothesis to verification.

## Thought Types

| Type | Description |
|------|-------------|
| `question_formulation` | Formulate research questions |
| `hypothesis_generation` | Generate testable hypotheses |
| `experiment_design` | Design experiments |
| `data_collection` | Collect and record data |
| `analysis` | Perform statistical analysis |
| `conclusion` | Draw conclusions |

## When to Use Scientific Method Mode

Use scientific method mode when you need to:

- **Test hypotheses rigorously** - Formal hypothesis testing
- **Design experiments** - Controlled experimentation
- **Analyze data statistically** - Statistical inference
- **Draw valid conclusions** - Evidence-based conclusions
- **Document research** - Reproducible research

### Problem Types Well-Suited for Scientific Method Mode

- **A/B testing** - Comparing treatments
- **Performance analysis** - Measuring system performance
- **User research** - Understanding user behavior
- **Debugging** - Hypothesis-driven debugging
- **Optimization** - Testing optimization hypotheses

## Core Concepts

### Research Question

```typescript
interface ResearchQuestion {
  id: string;
  question: string;
  background: string;
  rationale: string;
  significance: string;
  variables: {
    independent: string[];
    dependent: string[];
    control: string[];
  };
}
```

### Hypothesis

```typescript
interface Hypothesis {
  id: string;
  type: 'null' | 'alternative' | 'directional' | 'non_directional';
  statement: string;
  prediction: string;
  rationale: string;
  testable: boolean;
  falsifiable: boolean;
  latex?: string;
}
```

### Experiment Design

```typescript
interface ExperimentDesign {
  id: string;
  type: 'experimental' | 'quasi_experimental' | 'observational' | 'correlational';
  design: string;  // e.g., "randomized controlled trial"
  independentVariables: Variable[];
  dependentVariables: Variable[];
  controlVariables: Variable[];
  sampleSize: number;
  sampleSizeJustification?: string;
  randomization: boolean;
  blinding?: 'none' | 'single' | 'double' | 'triple';
  controls: string[];
  procedure: string[];
  materials?: string[];
  duration?: string;
  ethicalConsiderations?: string[];
}
```

### Variables

```typescript
interface Variable {
  id: string;
  name: string;
  type: 'independent' | 'dependent' | 'control' | 'confounding';
  description: string;
  measurementScale: 'nominal' | 'ordinal' | 'interval' | 'ratio';
  unit?: string;
  operationalDefinition: string;
  range?: [number, number];
  levels?: string[] | number[];
}
```

### Statistical Analysis

```typescript
interface StatisticalAnalysis {
  id: string;
  tests: StatisticalTest[];
  summary: string;
  assumptions: {
    assumption: string;
    met: boolean;
    evidence: string;
  }[];
  effectSize?: {
    type: string;  // "Cohen's d", "r", "eta-squared"
    value: number;
    interpretation: string;
  };
  powerAnalysis?: {
    power: number;
    alpha: number;
    interpretation: string;
  };
}

interface StatisticalTest {
  id: string;
  name: string;  // "t-test", "ANOVA", "chi-square"
  hypothesisTested: string;
  testStatistic: number;
  pValue: number;
  confidenceInterval?: [number, number];
  alpha: number;  // typically 0.05
  result: 'reject_null' | 'fail_to_reject_null';
  interpretation: string;
  latex?: string;
}
```

### Scientific Conclusion

```typescript
interface ScientificConclusion {
  id: string;
  statement: string;
  supportedHypotheses: string[];
  rejectedHypotheses: string[];
  confidence: number;
  limitations: string[];
  alternativeExplanations?: string[];
  futureDirections: string[];
  replicationConsiderations: string[];
  practicalImplications?: string[];
  theoreticalImplications?: string[];
}
```

## Usage Example

```typescript
// Formulate research question
const question = await deepthinking_scientific({
  mode: 'scientificmethod',
  thought: 'Define the research question for cache performance',
  thoughtNumber: 1,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'question_formulation',
  researchQuestion: {
    id: 'rq1',
    question: 'Does increasing cache size from 1GB to 4GB reduce API response latency?',
    background: 'Current API p99 latency is 200ms, which is above our SLA target of 150ms',
    rationale: 'Cache misses account for 40% of slow requests based on profiling data',
    significance: 'Meeting SLA could retain enterprise customers worth $500K ARR',
    variables: {
      independent: ['Cache size'],
      dependent: ['API p99 latency', 'Cache hit rate'],
      control: ['Traffic load', 'Query complexity', 'Server hardware']
    }
  }
});

// Generate hypotheses
const hypotheses = await deepthinking_scientific({
  mode: 'scientificmethod',
  thought: 'Generate testable hypotheses',
  thoughtNumber: 2,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'hypothesis_generation',
  scientificHypotheses: [
    {
      id: 'h0',
      type: 'null',
      statement: 'Increasing cache size has no effect on p99 latency',
      prediction: 'p99_4GB = p99_1GB',
      rationale: 'Default assumption of no effect',
      testable: true,
      falsifiable: true,
      latex: 'H_0: \\mu_{4GB} = \\mu_{1GB}'
    },
    {
      id: 'h1',
      type: 'directional',
      statement: 'Increasing cache size reduces p99 latency by at least 25%',
      prediction: 'p99_4GB < 150ms (25% improvement from 200ms)',
      rationale: 'Based on cache hit rate analysis and expected improvement',
      testable: true,
      falsifiable: true,
      latex: 'H_1: \\mu_{4GB} < 0.75 \\times \\mu_{1GB}'
    }
  ]
});

// Design experiment
const experiment = await deepthinking_scientific({
  mode: 'scientificmethod',
  thought: 'Design the experiment',
  thoughtNumber: 3,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'experiment_design',
  experiment: {
    id: 'exp1',
    type: 'experimental',
    design: 'A/B test with random traffic assignment',
    independentVariables: [{
      id: 'cache_size',
      name: 'Cache Size',
      type: 'independent',
      description: 'Redis cache memory allocation',
      measurementScale: 'ratio',
      unit: 'GB',
      operationalDefinition: 'maxmemory setting in Redis config',
      levels: [1, 4]
    }],
    dependentVariables: [{
      id: 'p99_latency',
      name: 'P99 Latency',
      type: 'dependent',
      description: '99th percentile response time',
      measurementScale: 'ratio',
      unit: 'ms',
      operationalDefinition: 'Server-side response time from request received to response sent'
    }],
    controlVariables: [{
      id: 'traffic_load',
      name: 'Traffic Load',
      type: 'control',
      description: 'Request rate',
      measurementScale: 'ratio',
      unit: 'req/s',
      operationalDefinition: 'Maintain 1000 req/s via load balancer'
    }],
    sampleSize: 100000,
    sampleSizeJustification: 'Power analysis: 80% power to detect 10% difference at α=0.05',
    randomization: true,
    blinding: 'single',
    controls: ['Same hardware', 'Same query distribution', 'Same time period'],
    procedure: [
      'Deploy 1GB cache to control cluster',
      'Deploy 4GB cache to treatment cluster',
      'Enable random traffic splitting (50/50)',
      'Run for 7 days to capture weekly patterns',
      'Collect latency metrics every minute'
    ],
    duration: '7 days'
  }
});

// Collect data
const data = await deepthinking_scientific({
  mode: 'scientificmethod',
  thought: 'Record collected data',
  thoughtNumber: 4,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'data_collection',
  data: {
    id: 'data1',
    method: ['Automated metric collection', 'APM integration'],
    instruments: ['Prometheus', 'Grafana', 'Custom logging'],
    observations: [
      { id: 'obs1', condition: '1GB cache', values: { p99: 198, hitRate: 0.72 } },
      { id: 'obs2', condition: '4GB cache', values: { p99: 142, hitRate: 0.89 } }
    ],
    measurements: [
      {
        variableId: 'p99_latency_1GB',
        values: [198, 201, 195, 203, 199, 197, 200], // Daily p99s
        descriptiveStats: { mean: 199, stdDev: 2.7, n: 50000 }
      },
      {
        variableId: 'p99_latency_4GB',
        values: [142, 145, 139, 143, 141, 144, 140],
        descriptiveStats: { mean: 142, stdDev: 2.1, n: 50000 }
      }
    ],
    dataQuality: { completeness: 0.99, reliability: 0.95, validity: 0.9 }
  }
});

// Perform analysis
const analysis = await deepthinking_scientific({
  mode: 'scientificmethod',
  thought: 'Analyze results statistically',
  thoughtNumber: 5,
  totalThoughts: 6,
  nextThoughtNeeded: true,

  thoughtType: 'analysis',
  analysis: {
    id: 'analysis1',
    tests: [{
      id: 'ttest1',
      name: 'Independent samples t-test',
      hypothesisTested: 'h0',
      testStatistic: 45.2,
      pValue: 0.0001,
      confidenceInterval: [54, 60],
      alpha: 0.05,
      result: 'reject_null',
      interpretation: 'The 57ms difference is statistically significant (p < 0.001)',
      latex: 't(99998) = 45.2, p < .001'
    }],
    summary: 'Strong evidence that cache size affects p99 latency',
    assumptions: [
      { assumption: 'Independence', met: true, evidence: 'Random assignment' },
      { assumption: 'Normality', met: true, evidence: 'Large sample size (CLT)' },
      { assumption: 'Homogeneity of variance', met: true, evidence: 'Levene test p=0.42' }
    ],
    effectSize: {
      type: "Cohen's d",
      value: 2.1,
      interpretation: 'Very large effect size'
    },
    powerAnalysis: {
      power: 0.99,
      alpha: 0.05,
      interpretation: 'Adequate power to detect observed effect'
    }
  }
});

// Draw conclusion
const conclusion = await deepthinking_scientific({
  mode: 'scientificmethod',
  thought: 'Draw conclusions from the experiment',
  thoughtNumber: 6,
  totalThoughts: 6,
  nextThoughtNeeded: false,

  thoughtType: 'conclusion',
  conclusion: {
    id: 'conclusion1',
    statement: 'Increasing cache from 1GB to 4GB reduces p99 latency by 29% (199ms to 142ms)',
    supportedHypotheses: ['h1'],
    rejectedHypotheses: [],
    confidence: 0.95,
    limitations: [
      'Single traffic pattern tested',
      '7-day window may not capture monthly patterns',
      'Other cache sizes not tested'
    ],
    alternativeExplanations: [
      'Effect could be partially due to reduced GC pressure'
    ],
    futureDirections: [
      'Test intermediate cache sizes (2GB, 3GB) for cost optimization',
      'Extend test duration to capture monthly patterns',
      'A/B test with production traffic on subset of users'
    ],
    replicationConsiderations: [
      'Document exact Redis configuration',
      'Ensure same traffic distribution methodology',
      'Use same monitoring infrastructure'
    ],
    practicalImplications: [
      'Deploy 4GB cache to production',
      'Expected to meet 150ms SLA',
      'Cost increase: $200/month for additional RAM'
    ]
  }
});
```

## Best Practices

### Hypothesis Formulation

✅ **Do:**
- State null and alternative hypotheses
- Make hypotheses testable and falsifiable
- Predict expected outcomes

❌ **Don't:**
- Use vague hypotheses
- Skip null hypothesis
- Make untestable claims

### Experiment Design

✅ **Do:**
- Control confounding variables
- Use randomization when possible
- Document procedure completely

❌ **Don't:**
- Ignore confounds
- Skip sample size justification
- Leave procedure ambiguous

### Statistical Analysis

✅ **Do:**
- Check assumptions before testing
- Report effect sizes with p-values
- Use appropriate tests

❌ **Don't:**
- P-hack or data dredge
- Ignore effect size
- Misinterpret statistical significance

### Conclusions

✅ **Do:**
- State limitations clearly
- Consider alternative explanations
- Suggest future directions

❌ **Don't:**
- Overstate conclusions
- Ignore limitations
- Confuse correlation with causation

## ScientificMethodThought Interface

```typescript
interface ScientificMethodThought extends BaseThought {
  mode: ThinkingMode.SCIENTIFICMETHOD;
  thoughtType:
    | 'question_formulation'
    | 'hypothesis_generation'
    | 'experiment_design'
    | 'data_collection'
    | 'analysis'
    | 'conclusion';

  researchQuestion?: ResearchQuestion;
  scientificHypotheses?: Hypothesis[];
  experiment?: ExperimentDesign;
  data?: DataCollection;
  analysis?: StatisticalAnalysis;
  conclusion?: ScientificConclusion;
}
```

## Integration with Other Modes

Scientific Method mode integrates with:

- **Bayesian Mode** - Bayesian hypothesis testing
- **Causal Mode** - Establishing causation
- **Mathematics Mode** - Statistical foundations
- **First Principles** - Deriving hypotheses

## Related Modes

- [Bayesian Mode](./BAYESIAN.md) - Probabilistic inference
- [Causal Mode](./CAUSAL.md) - Causal reasoning
- [Mathematics Mode](./MATHEMATICS.md) - Statistical math
- [First Principles Mode](./FIRSTPRINCIPLES.md) - Fundamental reasoning

## Limitations

- **No automated statistics** - Manual analysis required
- **Design expertise needed** - Good design requires knowledge
- **Time intensive** - Rigorous method takes effort

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight
