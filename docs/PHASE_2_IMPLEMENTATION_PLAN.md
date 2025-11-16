# DeepThinking MCP v2.0 - Advanced Reasoning Modes Implementation Plan

## Overview
This document outlines the plan to expand DeepThinking MCP from 5 to 10 reasoning modes, adding powerful new capabilities for abductive, causal, Bayesian, counterfactual, and analogical reasoning.

## Current State (v1.0.0)
- **5 Modes**: Sequential, Shannon, Mathematics, Physics, Hybrid
- **Architecture**: Type system in `src/types/core.ts`, session management, validation engine
- **Testing**: 25 unit tests covering all current modes
- **Published**: npm package + GitHub repository

## Target State (v2.0.0)
- **10 Modes**: Add Abductive, Causal, Bayesian, Counterfactual, Analogical
- **Backward Compatible**: Existing modes continue to work unchanged
- **Enhanced Validation**: New validation rules for each reasoning mode
- **Comprehensive Tests**: 50+ unit tests covering all modes

---

## Phase 3A: Abductive Reasoning Mode

### Purpose
Inference to the best explanation - generate and evaluate hypotheses to explain observations.

### Type Definition
```typescript
export interface AbductiveThought extends BaseThought {
  mode: ThinkingMode.ABDUCTIVE;

  // Observations requiring explanation
  observations: Observation[];

  // Generated hypotheses
  hypotheses: Hypothesis[];

  // Current hypothesis being evaluated
  currentHypothesis?: Hypothesis;

  // Evaluation criteria
  evaluationCriteria: {
    parsimony: number;      // Simplicity score (0-1)
    explanatoryPower: number; // How well it explains observations (0-1)
    plausibility: number;   // Prior probability (0-1)
    testability: boolean;   // Can it be tested?
  };

  // Evidence for/against hypotheses
  evidence: Evidence[];

  // Selected best explanation
  bestExplanation?: Hypothesis;
}

interface Observation {
  id: string;
  description: string;
  timestamp?: string;
  confidence: number; // How certain we are about this observation
}

interface Hypothesis {
  id: string;
  explanation: string;
  assumptions: string[];
  predictions: string[];
  score: number; // Overall ranking score
}

interface Evidence {
  hypothesisId: string;
  type: 'supporting' | 'contradicting' | 'neutral';
  description: string;
  strength: number; // 0-1
}
```

### Use Cases
- Debugging: "Why is the system behaving this way?"
- Medical diagnosis: "What explains these symptoms?"
- Root cause analysis: "What caused this failure?"
- Detective work: "What happened here?"

### Validation Rules
- At least one observation required
- Hypotheses must have unique IDs
- Evaluation criteria scores must be 0-1
- Best explanation must be from hypotheses list

---

## Phase 3B: Causal Reasoning Mode

### Purpose
Identify and analyze cause-effect relationships, build causal models.

### Type Definition
```typescript
export interface CausalThought extends BaseThought {
  mode: ThinkingMode.CAUSAL;

  // Causal graph structure
  causalGraph: {
    nodes: CausalNode[];
    edges: CausalEdge[];
  };

  // Interventions being considered
  interventions?: Intervention[];

  // Counterfactual scenarios
  counterfactuals?: CounterfactualScenario[];

  // Causal mechanisms
  mechanisms: CausalMechanism[];

  // Confounding factors
  confounders?: Confounder[];
}

interface CausalNode {
  id: string;
  name: string;
  type: 'cause' | 'effect' | 'mediator' | 'confounder';
  description: string;
}

interface CausalEdge {
  from: string; // node id
  to: string;   // node id
  strength: number; // -1 to 1 (negative = inhibitory)
  confidence: number; // 0-1
  mechanism?: string;
}

interface Intervention {
  nodeId: string;
  action: string;
  expectedEffects: {
    nodeId: string;
    expectedChange: string;
    confidence: number;
  }[];
}

interface CausalMechanism {
  from: string;
  to: string;
  description: string;
  type: 'direct' | 'indirect' | 'feedback';
}

interface Confounder {
  nodeId: string;
  affects: string[]; // node ids
  description: string;
}
```

### Use Cases
- Impact analysis: "What will happen if we change X?"
- Dependency tracking: "What depends on this component?"
- System design: "How do these parts interact?"
- Policy analysis: "What are the consequences?"

### Validation Rules
- Causal graph must be acyclic (no circular dependencies) OR mark as feedback loop
- All edge references must point to existing nodes
- Strength values must be -1 to 1
- Intervention effects must reference existing nodes

---

## Phase 3C: Bayesian Reasoning Mode

### Purpose
Update beliefs based on evidence using probabilistic reasoning.

### Type Definition
```typescript
export interface BayesianThought extends BaseThought {
  mode: ThinkingMode.BAYESIAN;

  // Hypothesis being evaluated
  hypothesis: BayesianHypothesis;

  // Prior probability
  prior: {
    probability: number;
    justification: string;
  };

  // Likelihood of evidence given hypothesis
  likelihood: {
    probability: number;
    description: string;
  };

  // Evidence observed
  evidence: BayesianEvidence[];

  // Posterior probability (updated belief)
  posterior: {
    probability: number;
    calculation: string; // Show the math
  };

  // Bayes factor (strength of evidence)
  bayesFactor?: number;

  // Sensitivity analysis
  sensitivity?: {
    priorRange: [number, number];
    posteriorRange: [number, number];
  };
}

interface BayesianHypothesis {
  id: string;
  statement: string;
  alternatives?: string[]; // Competing hypotheses
}

interface BayesianEvidence {
  id: string;
  description: string;
  likelihoodGivenHypothesis: number; // P(E|H)
  likelihoodGivenNotHypothesis: number; // P(E|¬H)
  timestamp?: string;
}
```

### Use Cases
- Risk assessment: "How likely is this threat?"
- Diagnostic reasoning: "Does this test result change my diagnosis?"
- A/B testing: "How confident should we be in these results?"
- Fraud detection: "Is this transaction suspicious?"

### Validation Rules
- All probabilities must be 0-1
- Prior + P(not prior) should ≈ 1
- Posterior calculation must be shown
- Bayes factor > 1 means evidence supports hypothesis

---

## Phase 4A: Counterfactual Reasoning Mode

### Purpose
Explore "what if" scenarios and alternative histories.

### Type Definition
```typescript
export interface CounterfactualThought extends BaseThought {
  mode: ThinkingMode.COUNTERFACTUAL;

  // Actual scenario (what happened)
  actual: Scenario;

  // Counterfactual scenarios (what if)
  counterfactuals: Scenario[];

  // Comparison analysis
  comparison: {
    differences: Difference[];
    insights: string[];
    lessons: string[];
  };

  // Intervention point
  interventionPoint: {
    description: string;
    timestamp?: string;
    alternatives: string[];
  };

  // Causal chains
  causalChains?: CausalChain[];
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  conditions: Condition[];
  outcomes: Outcome[];
  likelihood?: number; // How plausible is this scenario?
}

interface Condition {
  factor: string;
  value: string;
  isIntervention?: boolean; // Was this changed from actual?
}

interface Outcome {
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  magnitude?: number; // 0-1
}

interface Difference {
  aspect: string;
  actual: string;
  counterfactual: string;
  significance: 'high' | 'medium' | 'low';
}

interface CausalChain {
  intervention: string;
  steps: string[];
  finalOutcome: string;
}
```

### Use Cases
- Post-mortem analysis: "What if we had done X instead?"
- Strategic planning: "What are the alternative futures?"
- Learning from failures: "How could we have prevented this?"
- Decision review: "Was this the right choice?"

### Validation Rules
- Must have at least one actual scenario
- Must have at least one counterfactual scenario
- Intervention point must be specified
- Differences must reference both actual and counterfactual

---

## Phase 4B: Analogical Reasoning Mode

### Purpose
Transfer knowledge across domains by identifying structural similarities.

### Type Definition
```typescript
export interface AnalogicalThought extends BaseThought {
  mode: ThinkingMode.ANALOGICAL;

  // Source domain (known)
  sourceDomain: Domain;

  // Target domain (being analyzed)
  targetDomain: Domain;

  // Structural mapping
  mapping: Mapping[];

  // Transferred insights
  insights: Insight[];

  // Analogical inference
  inferences: Inference[];

  // Limitations of analogy
  limitations: string[];

  // Confidence in analogy
  analogyStrength: number; // 0-1
}

interface Domain {
  id: string;
  name: string;
  description: string;
  entities: Entity[];
  relations: Relation[];
  properties: Property[];
}

interface Entity {
  id: string;
  name: string;
  type: string;
  description: string;
}

interface Relation {
  id: string;
  type: string;
  from: string; // entity id
  to: string;   // entity id
  description: string;
}

interface Property {
  entityId: string;
  name: string;
  value: string;
}

interface Mapping {
  sourceEntityId: string;
  targetEntityId: string;
  justification: string;
  confidence: number; // 0-1
}

interface Insight {
  description: string;
  sourceEvidence: string;
  targetApplication: string;
}

interface Inference {
  sourcePattern: string;
  targetPrediction: string;
  confidence: number;
  needsVerification: boolean;
}
```

### Use Cases
- Design patterns: "This is like the observer pattern"
- Problem solving: "How did they solve a similar problem?"
- Learning: "This concept is like something I already know"
- Innovation: "Can we apply this approach to a new domain?"

### Validation Rules
- Must have both source and target domains
- Mappings must reference existing entities
- Analogy strength must be 0-1
- Should identify at least one limitation

---

## Implementation Strategy

### Phase 3: Core Advanced Modes (Weeks 1-3)
1. **Week 1**: Abductive + Causal modes
   - Update type system
   - Implement validation
   - Write tests

2. **Week 2**: Bayesian mode
   - Implement probability calculations
   - Add validation for probability rules
   - Write comprehensive tests

3. **Week 3**: Integration & testing
   - Update tool schema
   - End-to-end testing
   - Documentation updates

### Phase 4: Scenario Analysis Modes (Weeks 4-5)
4. **Week 4**: Counterfactual + Analogical modes
   - Implement both modes
   - Validation rules
   - Unit tests

5. **Week 5**: Polish & release
   - Integration testing
   - Documentation
   - Version 2.0.0 release

---

## File Changes Required

### Core Types (`src/types/core.ts`)
- Add 5 new ThinkingMode enum values
- Add 5 new thought type interfaces
- Add supporting type definitions (Hypothesis, Evidence, CausalNode, etc.)
- Update type guards

### Tool Schema (`src/tools/thinking.ts`)
- Extend mode enum to include new modes
- Add new optional fields for each mode
- Update JSON Schema with new properties
- Keep backward compatibility

### Validation (`src/validation/validator.ts`)
- Add `validateAbductive()` method
- Add `validateCausal()` method
- Add `validateBayesian()` method
- Add `validateCounterfactual()` method
- Add `validateAnalogical()` method

### Tests (`tests/unit/`)
- Create `abductive.test.ts` (10 tests)
- Create `causal.test.ts` (10 tests)
- Create `bayesian.test.ts` (10 tests)
- Create `counterfactual.test.ts` (8 tests)
- Create `analogical.test.ts` (8 tests)
- Update `types.test.ts` with new type guards

### Documentation
- Update `README.md` with new modes
- Update `CLAUDE_CODE_SETUP.md` with examples
- Create `docs/REASONING_MODES.md` reference guide

---

## Backward Compatibility

### Guaranteed Compatibility
- All v1.0 modes work exactly as before
- Existing sessions can continue
- Tool parameters remain optional
- JSON Schema is additive only

### Migration Path
- No migration needed for existing code
- New modes are opt-in
- Validation engine handles both old and new

---

## Testing Strategy

### Unit Tests (50+ tests)
- Each new mode: 8-10 tests
- Type guards: 5 tests
- Validation: 25 tests
- Session management: 10 tests

### Integration Tests
- Mode switching between old and new modes
- Session persistence with new modes
- Tool schema validation
- End-to-end scenarios

### Manual Testing
- Use each mode with Claude Code
- Test hybrid combinations
- Verify tool responses
- Check error handling

---

## Success Criteria

### Functional
✅ All 10 modes implemented and working
✅ 50+ passing unit tests
✅ Validation engine covers all modes
✅ Tool schema properly exposes all modes
✅ Backward compatible with v1.0

### Quality
✅ Code coverage > 80%
✅ No TypeScript errors
✅ Passes all linting rules
✅ Documentation complete and accurate

### Deployment
✅ Published to npm as v2.0.0
✅ GitHub release with changelog
✅ README updated with examples
✅ Announced in discussions/releases

---

## Timeline

**Week 1 (Current)**: Planning & Design ✅
**Week 2**: Abductive + Causal modes
**Week 3**: Bayesian mode + Integration
**Week 4**: Counterfactual + Analogical modes
**Week 5**: Testing, documentation, release

**Target Release**: v2.0.0 by end of Week 5

---

## Risk Mitigation

### Risk: Complexity explosion
**Mitigation**: Keep modes independent, share validation utilities

### Risk: Breaking changes
**Mitigation**: Comprehensive testing, semantic versioning

### Risk: Type system becoming unwieldy
**Mitigation**: Shared base types, clear interfaces, good documentation

### Risk: Performance degradation
**Mitigation**: Benchmark tests, optimize validation

---

## Future Enhancements (v2.1+)

- Temporal reasoning extensions
- Game-theoretic mode
- Evidential reasoning mode
- Mode combination recommendations
- Visual output formats (graphs, trees)
- Export to specialized formats (GraphML for causal graphs)

---

**Document Version**: 1.0
**Author**: DeepThinking MCP Team
**Date**: 2025-11-14
**Status**: Approved for Implementation
