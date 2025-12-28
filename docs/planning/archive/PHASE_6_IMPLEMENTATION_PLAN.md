# Phase 6: Meta-Reasoning Mode Implementation (v6.0.0)

## Executive Summary

**Goal**: Implement Meta-Reasoning mode to provide strategic oversight, self-monitoring, and adaptive mode selection across all existing reasoning modes.

**What is Meta-Reasoning?**
Meta-reasoning is "reasoning about reasoning itself" - reflecting on cognitive processes, strategies, and the quality of one's own thinking. It operates at a higher level, monitoring and controlling fundamental reasoning processes.

**Value Proposition**:
1. **Strategic Oversight**: Monitors reasoning quality and recommends strategy switches
2. **Adaptive Intelligence**: Recognizes when current approach isn't working and suggests alternatives
3. **Mode Orchestration**: Intelligently combines multiple modes for complex problems
4. **Self-Improvement**: Tracks reasoning effectiveness and learns from past sessions
5. **Enhanced Recommendations**: Improves existing ModeRecommender with meta-level insights

**Approach**: Two-sprint implementation with full runtime support
- **Sprint 1**: Core meta-reasoning infrastructure and mode monitoring
- **Sprint 2**: Integration with existing modes, testing, and v6.0.0 release

**Total Effort**: 24-36 developer hours across 2 sprints

---

## Why Meta-Reasoning Now?

**Complements Existing Modes**: We have 20 reasoning modes. Meta-reasoning provides the "executive function" to orchestrate them intelligently.

**Addresses User Pain Points**:
- "How do I know if I'm using the right mode?"
- "When should I switch strategies?"
- "Can the system help me choose better?"

**Technical Benefits**:
- Enhances mode recommendation system
- Enables dynamic mode switching during sessions
- Provides reasoning quality metrics
- Supports learning from session history

**Strategic Positioning**: Meta-reasoning is the capstone that ties all other modes together, making DeepThinking MCP truly intelligent.

---

## Sprint Structure

### Sprint 1: Core Meta-Reasoning Infrastructure (Week 1)
**Effort**: 14-20 hours | **Result**: Functional meta-reasoning mode with monitoring capabilities

**Overview**: Create the foundational meta-reasoning mode that can monitor reasoning processes, evaluate strategy effectiveness, and recommend mode switches.

**Key Features**:
1. **Strategy Monitoring**: Track which modes are being used and why
2. **Effectiveness Evaluation**: Assess whether current approach is working
3. **Mode Recommendations**: Suggest mode switches when appropriate
4. **Session Reflection**: Analyze reasoning session quality
5. **Resource Allocation**: Decide when to invest more cognitive effort

**Tasks**:

#### Type System (4-6 hours)
1. Create `src/types/modes/metareasoning.ts` - Define MetaReasoningThought type
   ```typescript
   interface MetaReasoningThought {
     mode: ThinkingMode.METAREASONING;
     // Core meta-reasoning fields
     currentStrategy: string; // What strategy is being used
     strategyEvaluation: StrategyEvaluation; // How well is it working
     alternativeStrategies: AlternativeStrategy[]; // Other options
     recommendation: StrategyRecommendation; // What to do next
     // Monitoring fields
     resourceAllocation: ResourceAllocation; // Time/effort assessment
     qualityMetrics: QualityMetrics; // Reasoning quality indicators
     sessionContext: SessionContext; // Session history and patterns
   }
   ```

2. Update `src/types/core.ts` - Add METAREASONING to ThinkingMode enum
3. Update `src/types/core.ts` - Add MetaReasoningThought to Thought union type
4. Update `src/types/core.ts` - Add type guard `isMetaReasoningThought()`
5. Add METAREASONING to FULLY_IMPLEMENTED_MODES list

#### Validation & Schemas (3-4 hours)
6. Create `src/validation/validators/modes/metareasoning.ts` - Validator for meta-reasoning
   - Validate strategy evaluation completeness
   - Ensure recommendations are actionable
   - Check quality metrics are reasonable
7. Create `src/validation/schemas.ts` - Add MetaReasoningSchema (Zod)
8. Update `src/validation/validator.ts` - Register metareasoning validator

#### Tool Schema & Routing (2-3 hours)
9. Update `src/tools/json-schemas.ts` - Add metareasoning to deepthinking_analytical_schema
   - OR create new deepthinking_meta_schema if more appropriate
10. Update `src/tools/definitions.ts` - Route metareasoning mode appropriately
11. Update `src/services/ModeRouter.ts` - Add metareasoning routing logic

#### Core Implementation (5-7 hours)
12. Create `src/modes/metareasoning.ts` - Meta-reasoning logic implementation
    - Strategy evaluation algorithms
    - Mode switching recommendations
    - Quality assessment heuristics
13. Update `src/services/ThoughtFactory.ts` - Add metareasoning case
14. Create `src/services/MetaMonitor.ts` - Session monitoring service
    - Track mode usage patterns
    - Evaluate reasoning effectiveness
    - Suggest improvements

#### Testing Infrastructure (2-3 hours)
15. Run typecheck - verify no errors
16. Create basic unit test - `tests/unit/metareasoning.test.ts`
17. Run full test suite - all tests must pass

**Success Criteria**:
- ✅ Meta-reasoning type system complete
- ✅ Validation and schemas in place
- ✅ Tool routing configured
- ✅ Basic meta-reasoning logic works
- ✅ All 740+ tests passing
- ✅ Can monitor and evaluate reasoning strategies

**Files Created**:
- `src/types/modes/metareasoning.ts`
- `src/validation/validators/modes/metareasoning.ts`
- `src/modes/metareasoning.ts`
- `src/services/MetaMonitor.ts`
- `tests/unit/metareasoning.test.ts`

**Files Modified**:
- `src/types/core.ts`
- `src/validation/schemas.ts`
- `src/validation/validator.ts`
- `src/tools/json-schemas.ts`
- `src/tools/definitions.ts`
- `src/services/ModeRouter.ts`
- `src/services/ThoughtFactory.ts`

---

### Sprint 2: Integration, Enhancement & Release v6.0.0 (Week 2)
**Effort**: 10-16 hours | **Result**: Production-ready v6.0.0 with meta-reasoning

**Overview**: Integrate meta-reasoning with existing infrastructure, enhance mode recommendation system, comprehensive testing, and release.

**Key Enhancements**:
1. **Dynamic Mode Switching**: Enable mid-session mode changes based on meta-reasoning
2. **Enhanced Recommendations**: Improve ModeRecommender with meta-level insights
3. **Session Analytics**: Provide reasoning quality reports
4. **Learning System**: Track which modes work best for which problems

**Tasks**:

#### Integration & Enhancement (4-6 hours)
1. Enhance `src/types/modes/recommendations.ts` - Integrate meta-reasoning insights
   - Add meta-reasoning factors to recommendation scoring
   - Include session history in recommendations
2. Update `src/services/ModeRouter.ts` - Enable dynamic mode switching
   - Add switch_mode capability triggered by meta-reasoning
   - Track mode transition history
3. Create `src/services/SessionAnalytics.ts` - Reasoning quality analytics
   - Strategy effectiveness scoring
   - Mode usage patterns
   - Quality trend analysis
4. Update `src/session/manager.ts` - Add meta-reasoning session tracking
   - Store strategy evaluations
   - Track mode switches
   - Calculate session quality metrics

#### Export & Visualization (2-3 hours)
5. Update `src/export/markdown.ts` - Add meta-reasoning formatting
   - Strategy evaluation sections
   - Mode recommendation explanations
   - Quality metrics visualization
6. Update `src/export/mermaid.ts` - Add meta-reasoning flow diagrams
   - Strategy evaluation flowcharts
   - Mode switching decision trees

#### Comprehensive Testing (3-5 hours)
7. Create `tests/unit/validation/validators/metareasoning.test.ts` - Validator tests
8. Create `tests/unit/services/MetaMonitor.test.ts` - Monitor service tests
9. Create `tests/integration/metareasoning-integration.test.ts` - End-to-end tests
   - Test meta-reasoning session lifecycle
   - Test mode switching recommendations
   - Test quality metrics calculation
10. Update `tests/unit/recommendations.test.ts` - Add meta-reasoning recommendation tests
11. Run full test suite 5 times - all must pass consistently

#### Documentation & Release (3-4 hours)
12. Create `docs/modes/METAREASONING.md` - Comprehensive mode documentation
    - What is meta-reasoning?
    - When to use it?
    - How it works
    - Examples and use cases
13. Update `README.md` - Add meta-reasoning to modes list
14. Update `CHANGELOG.md` - Add v6.0.0 entry
15. Update `CLAUDE.md` - Document meta-reasoning architecture
16. Create `docs/examples/meta-reasoning-examples.md` - Usage examples
17. Build and verify dist/ output
18. Commit and tag v6.0.0 release
19. Update memory with v6.0.0 completion

**Success Criteria**:
- ✅ Meta-reasoning fully integrated with existing modes
- ✅ Enhanced mode recommendation system
- ✅ Session analytics functional
- ✅ Dynamic mode switching works
- ✅ Comprehensive test coverage
- ✅ All 740+ tests passing consistently
- ✅ Documentation complete
- ✅ Ready for npm publish

**Files Created**:
- `src/services/SessionAnalytics.ts`
- `tests/unit/validation/validators/metareasoning.test.ts`
- `tests/unit/services/MetaMonitor.test.ts`
- `tests/integration/metareasoning-integration.test.ts`
- `docs/modes/METAREASONING.md`
- `docs/examples/meta-reasoning-examples.md`

**Files Modified**:
- `src/types/modes/recommendations.ts`
- `src/services/ModeRouter.ts`
- `src/session/manager.ts`
- `src/export/markdown.ts`
- `src/export/mermaid.ts`
- `tests/unit/recommendations.test.ts`
- `README.md`
- `CHANGELOG.md`
- `CLAUDE.md`

---

## Meta-Reasoning Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Meta-Reasoning Mode                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Strategy        │  │  Quality         │                │
│  │  Monitor         │  │  Evaluator       │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                     │                           │
│           v                     v                           │
│  ┌────────────────────────────────────────┐                │
│  │       Meta-Reasoning Engine             │                │
│  │  - Current strategy assessment          │                │
│  │  - Alternative strategy generation      │                │
│  │  - Mode switching recommendations       │                │
│  │  - Resource allocation decisions        │                │
│  └────────┬───────────────────────────────┘                │
│           │                                                  │
│           v                                                  │
│  ┌────────────────────────────────────────┐                │
│  │    Session Analytics Service            │                │
│  │  - Track mode usage patterns            │                │
│  │  - Calculate effectiveness scores       │                │
│  │  - Identify improvement opportunities   │                │
│  └─────────────────────────────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          v
          ┌───────────────────────────────┐
          │   Enhanced ModeRecommender    │
          │  + Meta-level insights        │
          └───────────────────────────────┘
```

### Key Algorithms

**Strategy Evaluation**:
1. **Effectiveness Score** = (Progress toward goal × Efficiency) / Resources used
2. **Confidence Level** = Consistency of results + Quality of evidence
3. **Switching Threshold** = When effectiveness < baseline AND alternatives exist

**Mode Recommendation Enhancement**:
- Current: Static problem characteristics → Mode scores
- Enhanced: Problem characteristics + Session history + Meta-insights → Better scores

**Resource Allocation**:
- Time pressure → Fast heuristics (System 1)
- High stakes → Deliberate analysis (System 2)
- Diminishing returns → Stop and switch

---

## Use Cases & Examples

### Use Case 1: Detecting Stuck Reasoning
**Scenario**: User trying to solve problem but making no progress

**Meta-Reasoning Response**:
```
Strategy Evaluation: Current approach (deductive) has made no progress in 5 thoughts.
Evidence: No new conclusions derived, premises questioned multiple times.
Recommendation: SWITCH to abductive reasoning to generate new hypotheses.
Confidence: 0.85
Alternative: Consider inductive approach if empirical data available.
```

### Use Case 2: Multi-Mode Orchestration
**Scenario**: Complex philosophical problem requiring multiple perspectives

**Meta-Reasoning Response**:
```
Strategy: Hybrid multi-modal approach recommended.
Phase 1: Inductive (gather empirical patterns) → COMPLETE
Phase 2: Deductive (test logical consistency) → IN PROGRESS
Phase 3: Abductive (find best explanation) → PENDING
Progress: 2/3 phases complete, 75% confidence so far.
Recommendation: Continue current deductive phase, then synthesis.
```

### Use Case 3: Quality Monitoring
**Scenario**: User solving mathematical proof

**Meta-Reasoning Response**:
```
Quality Metrics:
- Logical validity: HIGH (all steps follow from premises)
- Rigor: MEDIUM (some steps could use more justification)
- Completeness: LOW (base cases not addressed)
Recommendation: Before concluding, verify base cases and edge conditions.
Resource allocation: Invest 2-3 more thoughts in completeness checks.
```

---

## Meta-Reasoning vs. Existing Modes

| Mode | Purpose | Meta-Reasoning Adds |
|------|---------|-------------------|
| Hybrid | Combine multiple modes | Strategic decision on WHICH modes and WHEN |
| ModeRecommender | Suggest best mode | Incorporate session history and quality metrics |
| Sequential | Step-by-step thinking | Evaluate if steps are productive |
| All modes | Solve problems | Monitor if they're working, suggest improvements |

**Key Distinction**: Other modes DO reasoning. Meta-reasoning MONITORS and GUIDES reasoning.

---

## Timeline Summary

| Sprint | Week | Effort | Key Deliverable | Tests Added |
|--------|------|--------|----------------|-------------|
| 1 | 1 | 14-20h | Core meta-reasoning mode | Basic unit tests |
| 2 | 2 | 10-16h | Integration & v6.0.0 | Comprehensive coverage |
| **Total** | **1-2 weeks** | **24-36h** | **v6.0.0 production** | **740+ → 760+** |

---

## Breaking Changes (v6.0.0)

**None!** Meta-reasoning is a purely additive feature.

### New Capabilities:
- New mode: `metareasoning`
- Enhanced mode recommendations with meta-insights
- Dynamic mode switching capability
- Session quality analytics

### Backward Compatibility:
- All existing modes work exactly as before
- No API changes to existing tools
- Existing sessions compatible

---

## Success Metrics

### Quantitative:
- All 760+ tests passing (20 new tests added)
- Zero regressions in existing modes
- Meta-reasoning completes in < 2s per thought
- Mode recommendations 30% more accurate (measured by user satisfaction)

### Qualitative:
- Meta-reasoning provides actionable insights
- Users report improved problem-solving guidance
- Code follows existing architectural patterns
- Documentation is clear and comprehensive

---

## Risk Mitigation

### Medium Risk: Complexity Overhead
**Impact**: Meta-reasoning might slow down simple problems
**Mitigation**:
- Make meta-reasoning opt-in via mode selection
- Optimize for minimal overhead when not used
- Performance testing to ensure < 2s response time

### Low Risk: Recommendation Conflicts
**Impact**: Meta-reasoning might contradict static recommendations
**Mitigation**:
- Clear precedence rules (meta-insights enhance, not replace)
- Transparency in recommendation explanations
- A/B testing to validate improvements

### Low Risk: Over-Engineering
**Impact**: Too much meta-reasoning complexity
**Mitigation**:
- Start with core features, iterate based on usage
- Keep algorithms interpretable
- Regular code review for simplicity

---

## Post-Release Roadmap

### v6.1.0 (Enhancement Release)
- Learning from session history (pattern recognition)
- Personalized recommendations based on user preferences
- Advanced quality metrics (coherence, originality, etc.)

### v6.2.0 (Advanced Features)
- Automatic mode switching (opt-in)
- Real-time reasoning coaching
- Collaborative meta-reasoning (multi-agent)

### v7.0.0 (Future Major)
- Integration with external knowledge bases
- Federated learning from community reasoning sessions
- Meta-meta-reasoning (reasoning about meta-reasoning strategies)

---

## Next Steps

1. ✅ Plan approved and documented
2. ⏳ Await operator approval to start Sprint 1
3. ⏳ Execute Sprint 1: Core meta-reasoning infrastructure
4. ⏳ Execute Sprint 2: Integration, testing, release
5. ⏳ Update sprint JSON todos as tasks complete
6. ⏳ Commit changes and tag v6.0.0
7. ⏳ Publish to npm
8. ⏳ Update memory with completion

---

## Critical Files Reference

### Sprint 1 Must-Read:
1. `src/types/modes/` - Mode type patterns
2. `src/validation/validators/modes/` - Validator patterns
3. `src/modes/` - Mode implementation examples
4. `src/services/ThoughtFactory.ts` - Thought creation logic

### Sprint 2 Must-Read:
5. `src/types/modes/recommendations.ts` - Recommendation system
6. `src/services/ModeRouter.ts` - Mode routing logic
7. `src/session/manager.ts` - Session management
8. `src/export/` - Export formatters

### Documentation Templates:
9. `docs/modes/` - Mode documentation examples
10. `docs/examples/` - Example patterns
11. `CHANGELOG.md` - Version history format

---

## Appendix: Meta-Reasoning Thought Fields

### Core Fields
```typescript
currentStrategy: {
  mode: ThinkingMode;
  approach: string;
  startedAt: Date;
  thoughtsSpent: number;
  progressIndicators: string[];
}

strategyEvaluation: {
  effectiveness: number;      // 0-1 scale
  efficiency: number;         // 0-1 scale
  confidence: number;         // 0-1 scale
  progressRate: number;       // thoughts/insight ratio
  qualityScore: number;       // overall quality 0-1
  issues: string[];           // problems identified
  strengths: string[];        // what's working
}

alternativeStrategies: Array<{
  mode: ThinkingMode;
  reasoning: string;
  expectedBenefit: string;
  switchingCost: number;      // effort to switch
  recommendation: number;     // 0-1 score
}>

recommendation: {
  action: 'CONTINUE' | 'SWITCH' | 'REFINE' | 'COMBINE';
  targetMode?: ThinkingMode;
  justification: string;
  confidence: number;
  expectedImprovement: string;
}

resourceAllocation: {
  timeSpent: number;          // milliseconds
  thoughtsRemaining: number;  // estimated
  complexityLevel: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  recommendation: string;     // how to allocate effort
}

qualityMetrics: {
  logicalConsistency: number; // 0-1
  evidenceQuality: number;    // 0-1
  completeness: number;       // 0-1
  originality: number;        // 0-1
  clarity: number;            // 0-1
  overallQuality: number;     // 0-1
}

sessionContext: {
  sessionId: string;
  totalThoughts: number;
  modesUsed: ThinkingMode[];
  modeSwitches: number;
  problemType: string;
  historicalEffectiveness?: number; // from past sessions
}
```

---

## References

- [Types of Reasoning - Comprehensive Edition v3.0](../reference/Types%20of%20Thinking%20and%20Reasonings%20-%20Expanded%203.0.md) - Lines 373-377 (Meta-Reasoning definition)
- Phase 5 Implementation (Core restructuring) - Template for major version changes
- Existing ModeRecommender (`src/types/modes/recommendations.ts`) - Foundation to enhance
