# DeepThinking MCP v2.0 - Detailed Implementation Tasks

## Task Breakdown by File

### 1. `src/types/core.ts` - Type System Updates

#### Task 1.1: Update ThinkingMode Enum
**File**: `src/types/core.ts:9-16`
**Change**: Add 5 new mode values
```typescript
export enum ThinkingMode {
  SEQUENTIAL = 'sequential',
  SHANNON = 'shannon',
  MATHEMATICS = 'mathematics',
  PHYSICS = 'physics',
  HYBRID = 'hybrid',
  ABDUCTIVE = 'abductive',      // NEW
  CAUSAL = 'causal',             // NEW
  BAYESIAN = 'bayesian',         // NEW
  COUNTERFACTUAL = 'counterfactual', // NEW
  ANALOGICAL = 'analogical',     // NEW
  CUSTOM = 'custom'
}
```

#### Task 1.2: Add Abductive Supporting Types
**Location**: After existing thought types (~line 200)
**Add**:
```typescript
// Abductive Reasoning Types
export interface Observation {
  id: string;
  description: string;
  timestamp?: string;
  confidence: number;
}

export interface Hypothesis {
  id: string;
  explanation: string;
  assumptions: string[];
  predictions: string[];
  score: number;
}

export interface Evidence {
  hypothesisId: string;
  type: 'supporting' | 'contradicting' | 'neutral';
  description: string;
  strength: number;
}

export interface EvaluationCriteria {
  parsimony: number;
  explanatoryPower: number;
  plausibility: number;
  testability: boolean;
}

export interface AbductiveThought extends BaseThought {
  mode: ThinkingMode.ABDUCTIVE;
  observations: Observation[];
  hypotheses: Hypothesis[];
  currentHypothesis?: Hypothesis;
  evaluationCriteria: EvaluationCriteria;
  evidence: Evidence[];
  bestExplanation?: Hypothesis;
}
```

#### Task 1.3: Add Causal Supporting Types
**Add**:
```typescript
// Causal Reasoning Types
export interface CausalNode {
  id: string;
  name: string;
  type: 'cause' | 'effect' | 'mediator' | 'confounder';
  description: string;
}

export interface CausalEdge {
  from: string;
  to: string;
  strength: number;
  confidence: number;
  mechanism?: string;
}

export interface CausalGraph {
  nodes: CausalNode[];
  edges: CausalEdge[];
}

export interface Intervention {
  nodeId: string;
  action: string;
  expectedEffects: {
    nodeId: string;
    expectedChange: string;
    confidence: number;
  }[];
}

export interface CausalMechanism {
  from: string;
  to: string;
  description: string;
  type: 'direct' | 'indirect' | 'feedback';
}

export interface Confounder {
  nodeId: string;
  affects: string[];
  description: string;
}

export interface CounterfactualScenario {
  description: string;
  modifiedNodes: { nodeId: string; newValue: string }[];
  predictedOutcome: string;
}

export interface CausalThought extends BaseThought {
  mode: ThinkingMode.CAUSAL;
  causalGraph: CausalGraph;
  interventions?: Intervention[];
  counterfactuals?: CounterfactualScenario[];
  mechanisms: CausalMechanism[];
  confounders?: Confounder[];
}
```

#### Task 1.4: Add Bayesian Supporting Types
**Add**:
```typescript
// Bayesian Reasoning Types
export interface BayesianHypothesis {
  id: string;
  statement: string;
  alternatives?: string[];
}

export interface PriorProbability {
  probability: number;
  justification: string;
}

export interface Likelihood {
  probability: number;
  description: string;
}

export interface BayesianEvidence {
  id: string;
  description: string;
  likelihoodGivenHypothesis: number;
  likelihoodGivenNotHypothesis: number;
  timestamp?: string;
}

export interface PosteriorProbability {
  probability: number;
  calculation: string;
}

export interface SensitivityAnalysis {
  priorRange: [number, number];
  posteriorRange: [number, number];
}

export interface BayesianThought extends BaseThought {
  mode: ThinkingMode.BAYESIAN;
  hypothesis: BayesianHypothesis;
  prior: PriorProbability;
  likelihood: Likelihood;
  evidence: BayesianEvidence[];
  posterior: PosteriorProbability;
  bayesFactor?: number;
  sensitivity?: SensitivityAnalysis;
}
```

#### Task 1.5: Add Counterfactual Supporting Types
**Add**:
```typescript
// Counterfactual Reasoning Types
export interface Condition {
  factor: string;
  value: string;
  isIntervention?: boolean;
}

export interface Outcome {
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  magnitude?: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  conditions: Condition[];
  outcomes: Outcome[];
  likelihood?: number;
}

export interface Difference {
  aspect: string;
  actual: string;
  counterfactual: string;
  significance: 'high' | 'medium' | 'low';
}

export interface CausalChain {
  intervention: string;
  steps: string[];
  finalOutcome: string;
}

export interface InterventionPoint {
  description: string;
  timestamp?: string;
  alternatives: string[];
}

export interface CounterfactualComparison {
  differences: Difference[];
  insights: string[];
  lessons: string[];
}

export interface CounterfactualThought extends BaseThought {
  mode: ThinkingMode.COUNTERFACTUAL;
  actual: Scenario;
  counterfactuals: Scenario[];
  comparison: CounterfactualComparison;
  interventionPoint: InterventionPoint;
  causalChains?: CausalChain[];
}
```

#### Task 1.6: Add Analogical Supporting Types
**Add**:
```typescript
// Analogical Reasoning Types
export interface Entity {
  id: string;
  name: string;
  type: string;
  description: string;
}

export interface Relation {
  id: string;
  type: string;
  from: string;
  to: string;
  description: string;
}

export interface Property {
  entityId: string;
  name: string;
  value: string;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  entities: Entity[];
  relations: Relation[];
  properties: Property[];
}

export interface Mapping {
  sourceEntityId: string;
  targetEntityId: string;
  justification: string;
  confidence: number;
}

export interface Insight {
  description: string;
  sourceEvidence: string;
  targetApplication: string;
}

export interface Inference {
  sourcePattern: string;
  targetPrediction: string;
  confidence: number;
  needsVerification: boolean;
}

export interface AnalogicalThought extends BaseThought {
  mode: ThinkingMode.ANALOGICAL;
  sourceDomain: Domain;
  targetDomain: Domain;
  mapping: Mapping[];
  insights: Insight[];
  inferences: Inference[];
  limitations: string[];
  analogyStrength: number;
}
```

#### Task 1.7: Update Thought Union Type
**Location**: Find the `export type Thought` union (~line 300)
**Update**:
```typescript
export type Thought =
  | SequentialThought
  | ShannonThought
  | MathematicsThought
  | PhysicsThought
  | HybridThought
  | AbductiveThought     // NEW
  | CausalThought        // NEW
  | BayesianThought      // NEW
  | CounterfactualThought // NEW
  | AnalogicalThought;    // NEW
```

#### Task 1.8: Add Type Guards
**Location**: After existing type guards (~line 350)
**Add**:
```typescript
export function isAbductiveThought(thought: Thought): thought is AbductiveThought {
  return thought.mode === ThinkingMode.ABDUCTIVE;
}

export function isCausalThought(thought: Thought): thought is CausalThought {
  return thought.mode === ThinkingMode.CAUSAL;
}

export function isBayesianThought(thought: Thought): thought is BayesianThought {
  return thought.mode === ThinkingMode.BAYESIAN;
}

export function isCounterfactualThought(thought: Thought): thought is CounterfactualThought {
  return thought.mode === ThinkingMode.COUNTERFACTUAL;
}

export function isAnalogicalThought(thought: Thought): thought is AnalogicalThought {
  return thought.mode === ThinkingMode.ANALOGICAL;
}
```

---

### 2. `src/tools/thinking.ts` - Tool Schema Updates

#### Task 2.1: Update Mode Enum in JSON Schema
**Location**: Line ~75 (mode property)
**Update**:
```typescript
mode: {
  type: "string",
  enum: ["sequential", "shannon", "mathematics", "physics", "hybrid",
         "abductive", "causal", "bayesian", "counterfactual", "analogical"],
  description: "Thinking mode to use"
},
```

#### Task 2.2: Add Abductive Properties to JSON Schema
**Location**: After existing mode properties (~line 200)
**Add**:
```typescript
// Abductive mode fields
observations: {
  type: "array",
  items: {
    type: "object",
    properties: {
      id: { type: "string" },
      description: { type: "string" },
      timestamp: { type: "string" },
      confidence: { type: "number", minimum: 0, maximum: 1 }
    },
    required: ["id", "description", "confidence"]
  },
  description: "Observations requiring explanation"
},
hypotheses: {
  type: "array",
  items: {
    type: "object",
    properties: {
      id: { type: "string" },
      explanation: { type: "string" },
      assumptions: { type: "array", items: { type: "string" } },
      predictions: { type: "array", items: { type: "string" } },
      score: { type: "number" }
    },
    required: ["id", "explanation", "score"]
  },
  description: "Generated hypotheses"
},
evaluationCriteria: {
  type: "object",
  properties: {
    parsimony: { type: "number", minimum: 0, maximum: 1 },
    explanatoryPower: { type: "number", minimum: 0, maximum: 1 },
    plausibility: { type: "number", minimum: 0, maximum: 1 },
    testability: { type: "boolean" }
  },
  description: "Criteria for evaluating hypotheses"
},
```

#### Task 2.3: Add Causal Properties
**Add causal-specific fields to JSON Schema**

#### Task 2.4: Add Bayesian Properties
**Add Bayesian-specific fields to JSON Schema**

#### Task 2.5: Add Counterfactual Properties
**Add counterfactual-specific fields to JSON Schema**

#### Task 2.6: Add Analogical Properties
**Add analogical-specific fields to JSON Schema**

---

### 3. `src/validation/validator.ts` - Validation Updates

#### Task 3.1: Add validateAbductive Method
**Location**: After existing validation methods
**Add**:
```typescript
private validateAbductive(thought: AbductiveThought): ValidationResult {
  const issues: string[] = [];

  // Must have at least one observation
  if (!thought.observations || thought.observations.length === 0) {
    issues.push('Abductive reasoning requires at least one observation');
  }

  // Validate observation confidence values
  thought.observations?.forEach((obs, idx) => {
    if (obs.confidence < 0 || obs.confidence > 1) {
      issues.push(`Observation ${idx} confidence must be 0-1, got ${obs.confidence}`);
    }
  });

  // Hypotheses must have unique IDs
  if (thought.hypotheses) {
    const ids = thought.hypotheses.map(h => h.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      issues.push('Hypotheses must have unique IDs');
    }
  }

  // Validate evaluation criteria
  const criteria = thought.evaluationCriteria;
  if (criteria) {
    if (criteria.parsimony < 0 || criteria.parsimony > 1) {
      issues.push('Parsimony score must be 0-1');
    }
    if (criteria.explanatoryPower < 0 || criteria.explanatoryPower > 1) {
      issues.push('Explanatory power must be 0-1');
    }
    if (criteria.plausibility < 0 || criteria.plausibility > 1) {
      issues.push('Plausibility must be 0-1');
    }
  }

  // Best explanation must be from hypotheses list
  if (thought.bestExplanation) {
    const found = thought.hypotheses?.find(h => h.id === thought.bestExplanation?.id);
    if (!found) {
      issues.push('Best explanation must reference a hypothesis from the list');
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    confidence: issues.length === 0 ? 0.9 : 0.3,
    strengthMetrics: {
      logicalSoundness: issues.length === 0 ? 0.9 : 0.4,
      completeness: thought.hypotheses?.length > 0 ? 0.8 : 0.2,
      clarity: 0.8
    }
  };
}
```

#### Task 3.2: Add validateCausal Method
**Implement causal graph validation** including:
- Check for valid node references in edges
- Verify strength values are -1 to 1
- Detect circular dependencies (warn only if not marked as feedback)
- Validate intervention references

#### Task 3.3: Add validateBayesian Method
**Implement Bayesian validation** including:
- All probabilities 0-1
- Posterior calculation check
- Bayes factor interpretation
- Evidence likelihood validation

#### Task 3.4: Add validateCounterfactual Method
**Implement counterfactual validation** including:
- Must have actual scenario
- At least one counterfactual
- Intervention point specified
- Differences properly referenced

#### Task 3.5: Add validateAnalogical Method
**Implement analogical validation** including:
- Both domains present
- Mappings reference existing entities
- Analogy strength 0-1
- At least one limitation identified

#### Task 3.6: Update Main validate() Method
**Location**: Main `validate()` method
**Update switch statement**:
```typescript
public validate(thought: Thought): ValidationResult {
  switch (thought.mode) {
    case ThinkingMode.SEQUENTIAL:
      return this.validateSequential(thought as SequentialThought);
    case ThinkingMode.SHANNON:
      return this.validateShannon(thought as ShannonThought);
    case ThinkingMode.MATHEMATICS:
      return this.validateMathematics(thought as MathematicsThought);
    case ThinkingMode.PHYSICS:
      return this.validatePhysics(thought as PhysicsThought);
    case ThinkingMode.HYBRID:
      return this.validateHybrid(thought as HybridThought);
    case ThinkingMode.ABDUCTIVE:
      return this.validateAbductive(thought as AbductiveThought);  // NEW
    case ThinkingMode.CAUSAL:
      return this.validateCausal(thought as CausalThought);        // NEW
    case ThinkingMode.BAYESIAN:
      return this.validateBayesian(thought as BayesianThought);    // NEW
    case ThinkingMode.COUNTERFACTUAL:
      return this.validateCounterfactual(thought as CounterfactualThought); // NEW
    case ThinkingMode.ANALOGICAL:
      return this.validateAnalogical(thought as AnalogicalThought); // NEW
    default:
      return { isValid: true, issues: [], confidence: 0.5 };
  }
}
```

---

### 4. Testing Files - New Test Suites

#### Task 4.1: Create `tests/unit/abductive.test.ts`
**Tests to include**:
1. Type guard identifies abductive thoughts correctly
2. Observation validation catches invalid confidence
3. Hypothesis uniqueness validation
4. Evaluation criteria bounds checking
5. Best explanation must reference existing hypothesis
6. Empty observations array caught
7. Missing evaluation criteria handled
8. Evidence type validation
9. Hypothesis score validation
10. Complete abductive thought structure

#### Task 4.2: Create `tests/unit/causal.test.ts`
**Tests to include**:
1. Type guard for causal thoughts
2. Causal graph node validation
3. Edge strength bounds (-1 to 1)
4. Circular dependency detection
5. Intervention node references valid
6. Confounder validation
7. Mechanism type validation
8. Empty graph handled
9. Self-referencing edges
10. Complete causal thought structure

#### Task 4.3: Create `tests/unit/bayesian.test.ts`
**Tests to include**:
1. Type guard for Bayesian thoughts
2. Prior probability bounds (0-1)
3. Posterior calculation validation
4. Bayes factor interpretation
5. Evidence likelihood validation
6. Sensitivity analysis ranges
7. Missing hypothesis caught
8. Multiple evidence updates
9. Extreme probability handling (0, 1)
10. Complete Bayesian thought structure

#### Task 4.4: Create `tests/unit/counterfactual.test.ts`
**Tests to include**:
1. Type guard for counterfactual thoughts
2. Actual scenario required
3. At least one counterfactual required
4. Intervention point validation
5. Difference references validation
6. Scenario likelihood bounds
7. Outcome impact types
8. Complete counterfactual structure

#### Task 4.5: Create `tests/unit/analogical.test.ts`
**Tests to include**:
1. Type guard for analogical thoughts
2. Source domain required
3. Target domain required
4. Mapping entity references valid
5. Analogy strength bounds (0-1)
6. Limitations present
7. Inference confidence validation
8. Complete analogical structure

#### Task 4.6: Update `tests/unit/types.test.ts`
**Add tests for**:
- `isAbductiveThought()` type guard
- `isCausalThought()` type guard
- `isBayesianThought()` type guard
- `isCounterfactualThought()` type guard
- `isAnalogicalThought()` type guard

---

### 5. Documentation Updates

#### Task 5.1: Update `README.md`
**Sections to add**:
- New modes in feature list
- Brief description of each new mode
- Example use cases
- Updated installation instructions (v2.0.0)

#### Task 5.2: Create `docs/REASONING_MODES.md`
**Complete reference guide with**:
- Detailed explanation of each mode
- When to use each mode
- Examples for each mode
- Parameter reference
- Best practices

#### Task 5.3: Update `CLAUDE_CODE_SETUP.md`
**Add examples showing**:
- How to use new modes with Claude Code
- Configuration examples
- Sample sessions for each mode

---

### 6. Release Tasks

#### Task 6.1: Version Bump
**File**: `package.json`
**Change**: `"version": "1.0.0"` → `"version": "2.0.0"`

#### Task 6.2: Create CHANGELOG.md
**Add v2.0.0 section with**:
- New features (5 reasoning modes)
- Breaking changes (none - backward compatible)
- Migration guide (not needed)

#### Task 6.3: Git Commit
**Command**:
```bash
git add .
git commit -m "Release v2.0.0: Add 5 advanced reasoning modes

- Add Abductive reasoning for hypothesis generation
- Add Causal reasoning for cause-effect analysis
- Add Bayesian reasoning for probabilistic updates
- Add Counterfactual reasoning for scenario analysis
- Add Analogical reasoning for cross-domain insights

All 50+ tests passing. Fully backward compatible with v1.0.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### Task 6.4: GitHub Release
**Steps**:
1. Create tag: `git tag v2.0.0`
2. Push: `git push && git push --tags`
3. Create release on GitHub with changelog

#### Task 6.5: NPM Publish
**Command**: `npm publish`

---

## Estimated Effort

| Task Category | Estimated Time |
|--------------|---------------|
| Type definitions | 4 hours |
| Tool schema updates | 2 hours |
| Validation implementation | 6 hours |
| Test creation | 8 hours |
| Documentation | 3 hours |
| Testing & bug fixes | 4 hours |
| Release process | 1 hour |
| **Total** | **28 hours** (~3.5 days) |

---

## Dependencies Between Tasks

```
Types (1.1-1.8) → Tool Schema (2.1-2.6)
                → Validation (3.1-3.6)
                → Tests (4.1-4.6)

All implementation → Documentation (5.1-5.3)
                  → Release (6.1-6.5)
```

**Recommended Order**:
1. Complete all type definitions (1.1-1.8)
2. Update tool schema (2.1-2.6)
3. Implement validation (3.1-3.6)
4. Create tests (4.1-4.6)
5. Update documentation (5.1-5.3)
6. Release process (6.1-6.5)

---

**Document Version**: 1.0
**Status**: Ready for Implementation
**Last Updated**: 2025-11-14
