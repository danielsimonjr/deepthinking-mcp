# Phase 12 Client-Side Test Plan

## Overview

This document provides a comprehensive test plan for verifying Phase 12 features through the MCP client interface. All tests should be executed manually through Claude Code or another MCP-compatible client.

**Total Test Cases**: 104
**Estimated Execution Time**: 5-7 hours
**Prerequisites**: deepthinking-mcp server running and connected

---

## Test Environment Setup

### Prerequisites
1. deepthinking-mcp v8.3.2+ installed and configured
2. MCP client (Claude Code) connected to the server
3. Access to all 13 MCP tools:
   - `deepthinking_core`
   - `deepthinking_standard`
   - `deepthinking_mathematics`
   - `deepthinking_temporal`
   - `deepthinking_probabilistic`
   - `deepthinking_causal`
   - `deepthinking_strategic`
   - `deepthinking_analytical`
   - `deepthinking_scientific`
   - `deepthinking_engineering`
   - `deepthinking_academic`
   - `deepthinking_session`
   - `deepthinking_analyze`

### Verification
Before testing, verify connection:
```
Use deepthinking_session with action: "recommend_mode" and problemType: "test"
```
Expected: Returns mode recommendations without error.

---

## Sprint 1: Foundation & Infrastructure (Type Verification)

Sprint 1 implemented foundational types. Client-side testing verifies these types are properly used by the tools.

### T-S1-001: Proof Branch Types Available
**Tool**: `deepthinking_mathematics`
**Input**:
```json
{
  "mode": "mathematics",
  "thought": "Prove that the sum of two even numbers is even",
  "thoughtNumber": 1,
  "totalThoughts": 3,
  "nextThoughtNeeded": true,
  "proofStrategy": {
    "type": "direct",
    "steps": ["Let a = 2m and b = 2n", "Then a + b = 2(m+n)", "Which is even by definition"]
  }
}
```
**Expected**: Response includes proof strategy validation, no type errors.
**Pass Criteria**: Tool accepts proofStrategy with type and steps fields.

### T-S1-002: Multi-Mode Combination Types
**Tool**: `deepthinking_analyze`
**Input**:
```json
{
  "problem": "Should we expand into the European market?",
  "preset": "decision_making"
}
```
**Expected**: Returns merged analysis from multiple modes.
**Pass Criteria**: Response contains primaryInsights, conflicts, and synthesizedConclusion.

### T-S1-003: Monte Carlo Types Integration
**Tool**: `deepthinking_probabilistic`
**Input**:
```json
{
  "mode": "bayesian",
  "thought": "Estimating the probability of project success given limited data",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "priorProbability": 0.3,
  "likelihood": 0.7,
  "evidence": ["Team has relevant experience", "Market timing is favorable"]
}
```
**Expected**: Response includes posterior calculation.
**Pass Criteria**: posteriorProbability field present and mathematically correct.

### T-S1-004: Enhanced Graph Types
**Tool**: `deepthinking_causal`
**Input**:
```json
{
  "mode": "causal",
  "thought": "Analyzing factors affecting customer churn",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "nodes": [
    {"id": "price", "name": "Price"},
    {"id": "satisfaction", "name": "Customer Satisfaction"},
    {"id": "churn", "name": "Churn Rate"}
  ],
  "edges": [
    {"from": "price", "to": "satisfaction"},
    {"from": "satisfaction", "to": "churn"}
  ]
}
```
**Expected**: Response includes graph analysis with enhanced fields.
**Pass Criteria**: Graph structure accepted, response includes node/edge validation.

---

## Sprint 2: Advanced Proof Decomposition

### T-S2-001: Branch Analysis Basic
**Tool**: `deepthinking_mathematics`
**Input**:
```json
{
  "mode": "mathematics",
  "thought": "Prove: If n is odd, then n^2 is odd. Consider: n = 2k+1, so n^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1",
  "thoughtNumber": 1,
  "totalThoughts": 3,
  "nextThoughtNeeded": true,
  "proofSteps": [
    {"stepNumber": 1, "statement": "Let n be odd", "justification": "Given"},
    {"stepNumber": 2, "statement": "n = 2k + 1 for some integer k", "justification": "Definition of odd"},
    {"stepNumber": 3, "statement": "n^2 = (2k+1)^2 = 4k^2 + 4k + 1", "justification": "Algebra"},
    {"stepNumber": 4, "statement": "n^2 = 2(2k^2 + 2k) + 1", "justification": "Factoring"},
    {"stepNumber": 5, "statement": "n^2 is odd", "justification": "Definition of odd"}
  ],
  "analysisDepth": "deep"
}
```
**Expected**: Branch analysis identifies proof steps and dependencies.
**Pass Criteria**: Response acknowledges proof steps, no validation errors.

### T-S2-002: Strategy Recommendation - Induction
**Tool**: `deepthinking_mathematics`
**Input**:
```json
{
  "mode": "mathematics",
  "thought": "Prove: For all n >= 1, 1 + 2 + 3 + ... + n = n(n+1)/2",
  "thoughtNumber": 1,
  "totalThoughts": 5,
  "nextThoughtNeeded": true,
  "theorem": "Sum of first n natural numbers equals n(n+1)/2",
  "proofStrategy": {
    "type": "induction",
    "steps": ["Base case: n=1", "Inductive hypothesis", "Inductive step"]
  }
}
```
**Expected**: System recognizes induction as appropriate strategy.
**Pass Criteria**: Proof strategy accepted, induction steps validated.

### T-S2-003: Strategy Recommendation - Contradiction
**Tool**: `deepthinking_mathematics`
**Input**:
```json
{
  "mode": "mathematics",
  "thought": "Prove that sqrt(2) is irrational",
  "thoughtNumber": 1,
  "totalThoughts": 4,
  "nextThoughtNeeded": true,
  "proofStrategy": {
    "type": "contradiction",
    "steps": ["Assume sqrt(2) = a/b in lowest terms", "Derive contradiction", "Conclude irrationality"]
  }
}
```
**Expected**: System accepts contradiction proof structure.
**Pass Criteria**: Strategy validated, steps accepted.

### T-S2-004: Hierarchical Proof Structure
**Tool**: `deepthinking_mathematics`
**Input**:
```json
{
  "mode": "mathematics",
  "thought": "Prove the Fundamental Theorem of Calculus Part 1",
  "thoughtNumber": 1,
  "totalThoughts": 6,
  "nextThoughtNeeded": true,
  "hypotheses": [
    "f is continuous on [a,b]",
    "F(x) = integral from a to x of f(t)dt"
  ],
  "theorem": "F'(x) = f(x) for all x in (a,b)"
}
```
**Expected**: Accepts hierarchical proof with lemmas.
**Pass Criteria**: Response structured, hypotheses tracked.

### T-S2-005: Proof Verification - Valid Proof
**Tool**: `deepthinking_mathematics`
**Input**:
```json
{
  "mode": "mathematics",
  "thought": "Verifying a simple modus ponens proof",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "proofSteps": [
    {"stepNumber": 1, "statement": "If P then Q", "justification": "Premise"},
    {"stepNumber": 2, "statement": "P", "justification": "Premise"},
    {"stepNumber": 3, "statement": "Q", "justification": "Modus ponens from 1, 2", "referencesSteps": [1, 2]}
  ],
  "includeConsistencyCheck": true
}
```
**Expected**: Verification passes, no errors.
**Pass Criteria**: Proof accepted as valid.

### T-S2-006: Proof Verification - Invalid Step
**Tool**: `deepthinking_mathematics`
**Input**:
```json
{
  "mode": "mathematics",
  "thought": "Testing detection of invalid proof step",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "proofSteps": [
    {"stepNumber": 1, "statement": "P implies Q", "justification": "Given"},
    {"stepNumber": 2, "statement": "Q", "justification": "Given"},
    {"stepNumber": 3, "statement": "P", "justification": "From 1 and 2"}
  ],
  "includeConsistencyCheck": true
}
```
**Expected**: System identifies affirming the consequent fallacy.
**Pass Criteria**: Warning or error about invalid inference.

### T-S2-007: Circular Reference Detection
**Tool**: `deepthinking_mathematics`
**Input**:
```json
{
  "mode": "mathematics",
  "thought": "Testing circular dependency detection",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "proofSteps": [
    {"stepNumber": 1, "statement": "A follows from B", "justification": "See step 2", "referencesSteps": [2]},
    {"stepNumber": 2, "statement": "B follows from A", "justification": "See step 1", "referencesSteps": [1]}
  ],
  "includeConsistencyCheck": true
}
```
**Expected**: Circular reference detected and reported.
**Pass Criteria**: Response indicates circular dependency.

---

## Sprint 3: Multi-Mode Analysis & Synthesis

### T-S3-001: Preset - Comprehensive Analysis
**Tool**: `deepthinking_analyze`
**Input**:
```json
{
  "problem": "Our startup is experiencing rapid growth but team morale is declining. How should we address this?",
  "preset": "comprehensive_analysis"
}
```
**Expected**: Uses causal, bayesian, systemsthinking modes.
**Pass Criteria**: Returns insights from multiple perspectives, identifies systemic factors.

### T-S3-002: Preset - Hypothesis Testing
**Tool**: `deepthinking_analyze`
**Input**:
```json
{
  "problem": "Hypothesis: Remote work reduces productivity. Evidence: Some teams report lower output, others report higher output.",
  "preset": "hypothesis_testing"
}
```
**Expected**: Uses deductive, inductive, abductive modes.
**Pass Criteria**: Evaluates hypothesis from multiple logical perspectives.

### T-S3-003: Preset - Decision Making
**Tool**: `deepthinking_analyze`
**Input**:
```json
{
  "problem": "Should we acquire Company X for $50M? They have strong tech but weak revenue.",
  "preset": "decision_making"
}
```
**Expected**: Uses gametheory, optimization, firstprinciples modes.
**Pass Criteria**: Strategic analysis with stakeholder considerations.

### T-S3-004: Preset - Root Cause
**Tool**: `deepthinking_analyze`
**Input**:
```json
{
  "problem": "Customer complaints have increased 40% this quarter. What's causing this?",
  "preset": "root_cause"
}
```
**Expected**: Uses causal, counterfactual, firstprinciples modes.
**Pass Criteria**: Identifies causal chains and root causes.

### T-S3-005: Preset - Future Planning
**Tool**: `deepthinking_analyze`
**Input**:
```json
{
  "problem": "How should we position our product for the next 5 years given AI disruption in our industry?",
  "preset": "future_planning"
}
```
**Expected**: Uses temporal, bayesian, counterfactual modes.
**Pass Criteria**: Scenario analysis with probability assessments.

### T-S3-006: Custom Mode Selection
**Tool**: `deepthinking_analyze`
**Input**:
```json
{
  "problem": "Design a new pricing strategy for our SaaS product",
  "modes": ["optimization", "gametheory", "bayesian"],
  "mergeStrategy": "weighted"
}
```
**Expected**: Uses specified modes with weighted merge.
**Pass Criteria**: All three modes contribute to analysis.

### T-S3-007: Conflict Detection
**Tool**: `deepthinking_analyze`
**Input**:
```json
{
  "problem": "Should we prioritize growth or profitability?",
  "preset": "decision_making"
}
```
**Expected**: Detects conflicting recommendations between modes.
**Pass Criteria**: Response includes conflicts array with resolution.

### T-S3-008: Insight Merging - Union Strategy
**Tool**: `deepthinking_analyze`
**Input**:
```json
{
  "problem": "What factors affect employee retention?",
  "modes": ["causal", "systemsthinking"],
  "mergeStrategy": "union"
}
```
**Expected**: Combines all insights from both modes.
**Pass Criteria**: No insights filtered out.

### T-S3-009: Insight Merging - Intersection Strategy
**Tool**: `deepthinking_analyze`
**Input**:
```json
{
  "problem": "What are the key risks in this investment?",
  "modes": ["bayesian", "gametheory", "causal"],
  "mergeStrategy": "intersection"
}
```
**Expected**: Only shows insights agreed upon by all modes.
**Pass Criteria**: Fewer insights but higher confidence.

### T-S3-010: Insight Merging - Dialectical Strategy
**Tool**: `deepthinking_analyze`
**Input**:
```json
{
  "problem": "Is centralization or decentralization better for our organization?",
  "modes": ["firstprinciples", "systemsthinking"],
  "mergeStrategy": "dialectical"
}
```
**Expected**: Thesis/antithesis/synthesis structure.
**Pass Criteria**: Response shows opposing views and synthesis.

### T-S3-011: Progress Tracking
**Tool**: `deepthinking_analyze`
**Input**:
```json
{
  "problem": "Complex multi-factor analysis of market entry strategy",
  "preset": "comprehensive_analysis"
}
```
**Expected**: Execution completes within timeout.
**Pass Criteria**: All modes execute, results merged.

### T-S3-012: Empty/Minimal Problem
**Tool**: `deepthinking_analyze`
**Input**:
```json
{
  "problem": "x",
  "preset": "comprehensive_analysis"
}
```
**Expected**: Graceful handling of minimal input.
**Pass Criteria**: Returns response (possibly noting limited input).

---

## Sprint 4: Comprehensive Export System

### T-S4-001: Export All Formats
**Setup**: Create a session with at least one thought first.
**Tool**: `deepthinking_session`
**Input**:
```json
{
  "action": "export_all",
  "sessionId": "<session_id_from_setup>"
}
```
**Expected**: Returns all 8 formats: markdown, latex, json, html, jupyter, mermaid, dot, ascii.
**Pass Criteria**: All 8 formats present in response, no failures.

### T-S4-002: Export with Academic Profile
**Tool**: `deepthinking_session`
**Input**:
```json
{
  "action": "export_all",
  "sessionId": "<session_id>",
  "profile": "academic"
}
```
**Expected**: Exports formats suitable for academic use.
**Pass Criteria**: Includes latex, markdown, json at minimum.

### T-S4-003: Export with Presentation Profile
**Tool**: `deepthinking_session`
**Input**:
```json
{
  "action": "export_all",
  "sessionId": "<session_id>",
  "profile": "presentation"
}
```
**Expected**: Exports formats suitable for presentations.
**Pass Criteria**: Includes mermaid, markdown.

### T-S4-004: Export with Minimal Profile
**Tool**: `deepthinking_session`
**Input**:
```json
{
  "action": "export_all",
  "sessionId": "<session_id>",
  "profile": "minimal"
}
```
**Expected**: Exports minimal set of formats.
**Pass Criteria**: Only json and markdown.

### T-S4-005: Export Individual Format - Markdown
**Tool**: `deepthinking_session`
**Input**:
```json
{
  "action": "export",
  "sessionId": "<session_id>",
  "exportFormat": "markdown"
}
```
**Expected**: Returns markdown export.
**Pass Criteria**: Valid markdown with headers and content.

### T-S4-006: Export Individual Format - LaTeX
**Tool**: `deepthinking_session`
**Input**:
```json
{
  "action": "export",
  "sessionId": "<session_id>",
  "exportFormat": "latex"
}
```
**Expected**: Returns LaTeX export.
**Pass Criteria**: Valid LaTeX with document structure.

### T-S4-007: Export Individual Format - Jupyter
**Tool**: `deepthinking_session`
**Input**:
```json
{
  "action": "export",
  "sessionId": "<session_id>",
  "exportFormat": "jupyter"
}
```
**Expected**: Returns Jupyter notebook JSON.
**Pass Criteria**: Valid nbformat with cells array.

### T-S4-008: Export Individual Format - Mermaid
**Tool**: `deepthinking_session`
**Input**:
```json
{
  "action": "export",
  "sessionId": "<session_id>",
  "exportFormat": "mermaid"
}
```
**Expected**: Returns Mermaid diagram syntax.
**Pass Criteria**: Valid mermaid graph/flowchart syntax.

### T-S4-009: Export Individual Format - DOT
**Tool**: `deepthinking_session`
**Input**:
```json
{
  "action": "export",
  "sessionId": "<session_id>",
  "exportFormat": "dot"
}
```
**Expected**: Returns Graphviz DOT format.
**Pass Criteria**: Valid DOT syntax with digraph/graph.

### T-S4-010: Export Individual Format - ASCII
**Tool**: `deepthinking_session`
**Input**:
```json
{
  "action": "export",
  "sessionId": "<session_id>",
  "exportFormat": "ascii"
}
```
**Expected**: Returns ASCII art representation.
**Pass Criteria**: Text-based visual representation.

### T-S4-011: Export Empty Session
**Tool**: `deepthinking_session`
**Input**:
```json
{
  "action": "export_all",
  "sessionId": "<empty_session_id>"
}
```
**Expected**: Graceful handling of empty session.
**Pass Criteria**: Returns valid exports (possibly noting empty session).

### T-S4-012: Export Invalid Session ID
**Tool**: `deepthinking_session`
**Input**:
```json
{
  "action": "export_all",
  "sessionId": "invalid-session-12345"
}
```
**Expected**: Clear error message.
**Pass Criteria**: Error indicates session not found.

### T-S4-013: Export Mode-Specific Content - Causal
**Setup**: Create session with causal mode thought including nodes/edges.
**Tool**: `deepthinking_session`
**Input**:
```json
{
  "action": "export",
  "sessionId": "<causal_session_id>",
  "exportFormat": "markdown"
}
```
**Expected**: Export includes causal graph details.
**Pass Criteria**: Nodes and edges visible in markdown export.

### T-S4-014: Export Mode-Specific Content - Bayesian
**Setup**: Create session with bayesian thought including probabilities.
**Tool**: `deepthinking_session`
**Input**:
```json
{
  "action": "export",
  "sessionId": "<bayesian_session_id>",
  "exportFormat": "latex"
}
```
**Expected**: Export includes probability calculations.
**Pass Criteria**: Prior, likelihood, posterior visible in LaTeX.

---

## Sprint 5: Monte Carlo & Stochastic Reasoning

### T-S5-001: Bayesian Analysis Basic
**Tool**: `deepthinking_probabilistic`
**Input**:
```json
{
  "mode": "bayesian",
  "thought": "Estimating probability of disease given positive test",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "priorProbability": 0.01,
  "likelihood": 0.95,
  "evidence": ["Positive test result", "No symptoms"]
}
```
**Expected**: Posterior probability calculated.
**Pass Criteria**: posteriorProbability present and mathematically consistent.

### T-S5-002: Bayesian with Multiple Evidence
**Tool**: `deepthinking_probabilistic`
**Input**:
```json
{
  "mode": "bayesian",
  "thought": "Updating belief about market trend",
  "thoughtNumber": 1,
  "totalThoughts": 3,
  "nextThoughtNeeded": true,
  "priorProbability": 0.5,
  "likelihood": 0.8,
  "evidence": ["Q1 revenue up 20%", "Competitor launched new product", "Customer sentiment positive", "Economic indicators mixed"]
}
```
**Expected**: Multiple evidence items processed.
**Pass Criteria**: Response incorporates all evidence.

### T-S5-003: Bayesian Hypothesis Comparison
**Tool**: `deepthinking_probabilistic`
**Input**:
```json
{
  "mode": "bayesian",
  "thought": "Comparing two hypotheses about user behavior",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "hypotheses": [
    {"id": "h1", "description": "Users prefer feature A", "probability": 0.6},
    {"id": "h2", "description": "Users prefer feature B", "probability": 0.4}
  ],
  "evidence": ["A/B test shows 55% chose A"]
}
```
**Expected**: Hypothesis probabilities updated.
**Pass Criteria**: Both hypotheses have updated probabilities.

### T-S5-004: Evidential Reasoning Basic
**Tool**: `deepthinking_probabilistic`
**Input**:
```json
{
  "mode": "evidential",
  "thought": "Assessing evidence for product-market fit",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "frameOfDiscernment": ["strong_fit", "weak_fit", "no_fit"],
  "massFunction": {
    "strong_fit": 0.4,
    "weak_fit": 0.3,
    "no_fit": 0.1
  }
}
```
**Expected**: Dempster-Shafer belief functions calculated.
**Pass Criteria**: beliefFunction and plausibilityFunction present.

### T-S5-005: Stochastic Model Definition
**Tool**: `deepthinking_probabilistic`
**Input**:
```json
{
  "mode": "bayesian",
  "thought": "Modeling uncertain project completion time",
  "thoughtNumber": 1,
  "totalThoughts": 3,
  "nextThoughtNeeded": true,
  "priorProbability": 0.7,
  "likelihood": 0.6,
  "evidence": ["Team velocity stable", "No major blockers identified"]
}
```
**Expected**: Accepts stochastic model parameters.
**Pass Criteria**: Model processed, uncertainty reflected in response.

### T-S5-006: Convergence Indication
**Tool**: `deepthinking_probabilistic`
**Input**:
```json
{
  "mode": "bayesian",
  "thought": "Final analysis after multiple updates",
  "thoughtNumber": 5,
  "totalThoughts": 5,
  "nextThoughtNeeded": false,
  "priorProbability": 0.85,
  "posteriorProbability": 0.87,
  "evidence": ["Final validation complete"]
}
```
**Expected**: Session shows convergence.
**Pass Criteria**: Response indicates stable probability.

### T-S5-007: Edge Case - Zero Probability
**Tool**: `deepthinking_probabilistic`
**Input**:
```json
{
  "mode": "bayesian",
  "thought": "Testing with edge case probabilities",
  "thoughtNumber": 1,
  "totalThoughts": 1,
  "nextThoughtNeeded": false,
  "priorProbability": 0.0,
  "likelihood": 0.9
}
```
**Expected**: Handles zero probability gracefully.
**Pass Criteria**: No crash, appropriate response.

### T-S5-008: Edge Case - Probability Near 1
**Tool**: `deepthinking_probabilistic`
**Input**:
```json
{
  "mode": "bayesian",
  "thought": "Testing with near-certain probability",
  "thoughtNumber": 1,
  "totalThoughts": 1,
  "nextThoughtNeeded": false,
  "priorProbability": 0.99,
  "likelihood": 0.99
}
```
**Expected**: Handles high probability correctly.
**Pass Criteria**: posteriorProbability <= 1.0.

---

## Sprint 6: Enhanced Graph Analysis

### T-S6-001: Causal Graph with Centrality Analysis
**Tool**: `deepthinking_causal`
**Input**:
```json
{
  "mode": "causal",
  "thought": "Analyzing organizational factors affecting productivity",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "nodes": [
    {"id": "training", "name": "Training Quality"},
    {"id": "tools", "name": "Development Tools"},
    {"id": "culture", "name": "Team Culture"},
    {"id": "productivity", "name": "Productivity"},
    {"id": "satisfaction", "name": "Job Satisfaction"}
  ],
  "edges": [
    {"from": "training", "to": "productivity"},
    {"from": "tools", "to": "productivity"},
    {"from": "culture", "to": "satisfaction"},
    {"from": "culture", "to": "productivity"},
    {"from": "satisfaction", "to": "productivity"}
  ]
}
```
**Expected**: Centrality analysis identifies key nodes.
**Pass Criteria**: Response includes centrality insights (e.g., "productivity" has high in-degree).

### T-S6-002: Star Graph Centrality
**Tool**: `deepthinking_causal`
**Input**:
```json
{
  "mode": "causal",
  "thought": "Analyzing hub-and-spoke influence pattern",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "nodes": [
    {"id": "leader", "name": "Team Leader"},
    {"id": "dev1", "name": "Developer 1"},
    {"id": "dev2", "name": "Developer 2"},
    {"id": "dev3", "name": "Developer 3"},
    {"id": "dev4", "name": "Developer 4"}
  ],
  "edges": [
    {"from": "leader", "to": "dev1"},
    {"from": "leader", "to": "dev2"},
    {"from": "leader", "to": "dev3"},
    {"from": "leader", "to": "dev4"}
  ]
}
```
**Expected**: Leader identified as most central.
**Pass Criteria**: "leader" has highest centrality measure.

### T-S6-003: Chain Graph Betweenness
**Tool**: `deepthinking_causal`
**Input**:
```json
{
  "mode": "causal",
  "thought": "Analyzing information flow in linear process",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "nodes": [
    {"id": "A", "name": "Step A"},
    {"id": "B", "name": "Step B"},
    {"id": "C", "name": "Step C"},
    {"id": "D", "name": "Step D"},
    {"id": "E", "name": "Step E"}
  ],
  "edges": [
    {"from": "A", "to": "B"},
    {"from": "B", "to": "C"},
    {"from": "C", "to": "D"},
    {"from": "D", "to": "E"}
  ]
}
```
**Expected**: Middle node (C) has highest betweenness.
**Pass Criteria**: Analysis identifies C as critical path node.

### T-S6-004: D-Separation Basic
**Tool**: `deepthinking_causal`
**Input**:
```json
{
  "mode": "causal",
  "thought": "Testing conditional independence: Is A independent of C given B?",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "nodes": [
    {"id": "A", "name": "Cause"},
    {"id": "B", "name": "Mediator"},
    {"id": "C", "name": "Effect"}
  ],
  "edges": [
    {"from": "A", "to": "B"},
    {"from": "B", "to": "C"}
  ]
}
```
**Expected**: A and C are d-separated given B.
**Pass Criteria**: Response indicates conditional independence.

### T-S6-005: D-Separation Collider (V-Structure)
**Tool**: `deepthinking_causal`
**Input**:
```json
{
  "mode": "causal",
  "thought": "Testing collider structure: Rain and Sprinkler both cause Wet Grass",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "nodes": [
    {"id": "rain", "name": "Rain"},
    {"id": "sprinkler", "name": "Sprinkler"},
    {"id": "wet", "name": "Wet Grass"}
  ],
  "edges": [
    {"from": "rain", "to": "wet"},
    {"from": "sprinkler", "to": "wet"}
  ]
}
```
**Expected**: Rain and Sprinkler are marginally independent but conditionally dependent given Wet Grass.
**Pass Criteria**: Collider behavior correctly identified.

### T-S6-006: Backdoor Criterion
**Tool**: `deepthinking_causal`
**Input**:
```json
{
  "mode": "causal",
  "thought": "Finding adjustment set for causal effect of X on Y",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "nodes": [
    {"id": "X", "name": "Treatment"},
    {"id": "Y", "name": "Outcome"},
    {"id": "Z", "name": "Confounder"}
  ],
  "edges": [
    {"from": "Z", "to": "X"},
    {"from": "Z", "to": "Y"},
    {"from": "X", "to": "Y"}
  ]
}
```
**Expected**: Z identified as valid adjustment variable.
**Pass Criteria**: Backdoor criterion mentioned, Z as adjustment set.

### T-S6-007: Intervention (Do-Calculus)
**Tool**: `deepthinking_causal`
**Input**:
```json
{
  "mode": "causal",
  "thought": "What is the effect of do(X=1) on Y?",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "nodes": [
    {"id": "X", "name": "Intervention Variable"},
    {"id": "Y", "name": "Outcome"},
    {"id": "Z", "name": "Confounder"}
  ],
  "edges": [
    {"from": "Z", "to": "X"},
    {"from": "Z", "to": "Y"},
    {"from": "X", "to": "Y"}
  ],
  "interventions": [
    {"node": "X", "value": "1"}
  ]
}
```
**Expected**: Intervention effect calculated using adjustment.
**Pass Criteria**: Response describes intervention effect estimation.

### T-S6-008: Counterfactual Analysis
**Tool**: `deepthinking_causal`
**Input**:
```json
{
  "mode": "counterfactual",
  "thought": "What would have happened if we had not launched the marketing campaign?",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "counterfactual": {
    "actual": "Marketing campaign launched, sales increased 30%",
    "hypothetical": "No marketing campaign",
    "consequence": "Estimate sales without campaign"
  }
}
```
**Expected**: Counterfactual reasoning applied.
**Pass Criteria**: Response includes counterfactual analysis.

### T-S6-009: Complex Graph - Multiple Paths
**Tool**: `deepthinking_causal`
**Input**:
```json
{
  "mode": "causal",
  "thought": "Analyzing complex causal structure with multiple paths",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "nodes": [
    {"id": "A", "name": "A"},
    {"id": "B", "name": "B"},
    {"id": "C", "name": "C"},
    {"id": "D", "name": "D"},
    {"id": "E", "name": "E"}
  ],
  "edges": [
    {"from": "A", "to": "B"},
    {"from": "A", "to": "C"},
    {"from": "B", "to": "D"},
    {"from": "C", "to": "D"},
    {"from": "D", "to": "E"}
  ]
}
```
**Expected**: Multiple causal paths identified.
**Pass Criteria**: Analysis recognizes convergent structure at D.

### T-S6-010: Empty Graph Handling
**Tool**: `deepthinking_causal`
**Input**:
```json
{
  "mode": "causal",
  "thought": "Testing with minimal graph",
  "thoughtNumber": 1,
  "totalThoughts": 1,
  "nextThoughtNeeded": false,
  "nodes": [{"id": "A", "name": "Single Node"}],
  "edges": []
}
```
**Expected**: Graceful handling of single node graph.
**Pass Criteria**: No crash, appropriate response.

### T-S6-011: Cycle Detection
**Tool**: `deepthinking_causal`
**Input**:
```json
{
  "mode": "causal",
  "thought": "Testing with cyclic graph (feedback loop)",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "nodes": [
    {"id": "A", "name": "Variable A"},
    {"id": "B", "name": "Variable B"},
    {"id": "C", "name": "Variable C"}
  ],
  "edges": [
    {"from": "A", "to": "B"},
    {"from": "B", "to": "C"},
    {"from": "C", "to": "A"}
  ]
}
```
**Expected**: Cycle detected and reported.
**Pass Criteria**: Warning about cyclic structure or appropriate handling.

---

## Sprint 7: Historical Reasoning Mode (v9.1.0)

Historical mode provides comprehensive historical analysis with source evaluation, pattern recognition, causal chain analysis, and historiographical reasoning.

### T-S7-001: Event Analysis Basic
**Tool**: `deepthinking_temporal`
**Input**:
```json
{
  "mode": "historical",
  "thought": "Analyzing the causes and effects of the Industrial Revolution",
  "thoughtNumber": 1,
  "totalThoughts": 3,
  "nextThoughtNeeded": true,
  "thoughtType": "event_analysis",
  "events": [
    {
      "id": "evt-1",
      "name": "Agricultural Revolution",
      "date": {"start": "1700", "end": "1850"},
      "significance": "transformative",
      "effects": ["evt-2"],
      "sources": ["src-1"]
    },
    {
      "id": "evt-2",
      "name": "Urbanization",
      "date": {"start": "1750", "end": "1900"},
      "significance": "major",
      "causes": ["evt-1"]
    }
  ]
}
```
**Expected**: Response includes event analysis with cause-effect relationships.
**Pass Criteria**: Events accepted, temporal span calculated.

### T-S7-002: Source Evaluation
**Tool**: `deepthinking_temporal`
**Input**:
```json
{
  "mode": "historical",
  "thought": "Evaluating sources on the French Revolution",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "thoughtType": "source_evaluation",
  "sources": [
    {
      "id": "src-1",
      "title": "Memoirs of Madame Roland",
      "type": "primary",
      "subtype": "document",
      "author": "Madame Roland",
      "date": "1793",
      "reliability": 0.7,
      "bias": {
        "type": "political",
        "direction": "Girondin",
        "severity": 0.6
      },
      "limitations": ["Written while imprisoned", "Retrospective justification"]
    },
    {
      "id": "src-2",
      "title": "Citizens: A Chronicle of the French Revolution",
      "type": "secondary",
      "author": "Simon Schama",
      "date": "1989",
      "reliability": 0.85,
      "corroboratedBy": ["src-3"]
    }
  ]
}
```
**Expected**: Aggregate reliability calculated with source type weighting.
**Pass Criteria**: Sources evaluated, bias documented, reliability aggregated.

### T-S7-003: Source Type Weighting
**Tool**: `deepthinking_temporal`
**Input**:
```json
{
  "mode": "historical",
  "thought": "Testing source reliability weighting",
  "thoughtNumber": 1,
  "totalThoughts": 1,
  "nextThoughtNeeded": false,
  "thoughtType": "source_evaluation",
  "sources": [
    {"id": "s1", "title": "Primary Source", "type": "primary", "reliability": 0.8},
    {"id": "s2", "title": "Secondary Source", "type": "secondary", "reliability": 0.8},
    {"id": "s3", "title": "Tertiary Source", "type": "tertiary", "reliability": 0.8}
  ]
}
```
**Expected**: Primary sources weighted 2x, secondary 1.5x.
**Pass Criteria**: Aggregate reliability reflects weighting.

### T-S7-004: Corroboration Bonus
**Tool**: `deepthinking_temporal`
**Input**:
```json
{
  "mode": "historical",
  "thought": "Testing corroboration bonus calculation",
  "thoughtNumber": 1,
  "totalThoughts": 1,
  "nextThoughtNeeded": false,
  "thoughtType": "source_evaluation",
  "sources": [
    {"id": "s1", "title": "Source 1", "type": "primary", "reliability": 0.7, "corroboratedBy": ["s2", "s3"]},
    {"id": "s2", "title": "Source 2", "type": "secondary", "reliability": 0.8, "corroboratedBy": ["s1"]},
    {"id": "s3", "title": "Source 3", "type": "secondary", "reliability": 0.75}
  ]
}
```
**Expected**: Corroboration bonus (up to 0.1) applied.
**Pass Criteria**: Aggregate reliability higher than raw average.

### T-S7-005: Causal Chain Analysis
**Tool**: `deepthinking_temporal`
**Input**:
```json
{
  "mode": "historical",
  "thought": "Tracing causes of World War I",
  "thoughtNumber": 1,
  "totalThoughts": 3,
  "nextThoughtNeeded": true,
  "thoughtType": "causal_chain",
  "events": [
    {"id": "evt-1", "name": "Assassination of Franz Ferdinand", "date": "1914-06-28", "significance": "transformative"},
    {"id": "evt-2", "name": "Austrian Ultimatum", "date": "1914-07-23", "significance": "major"},
    {"id": "evt-3", "name": "Declaration of War", "date": "1914-07-28", "significance": "transformative"}
  ],
  "causalChains": [
    {
      "id": "chain-1",
      "name": "July Crisis Escalation",
      "confidence": 0.9,
      "links": [
        {"cause": "evt-1", "effect": "evt-2", "mechanism": "diplomatic pressure", "confidence": 0.95},
        {"cause": "evt-2", "effect": "evt-3", "mechanism": "alliance obligations", "confidence": 0.9}
      ]
    }
  ]
}
```
**Expected**: Causal chain validated for continuity.
**Pass Criteria**: Chain links validated, mechanism documented.

### T-S7-006: Causal Chain Continuity Check
**Tool**: `deepthinking_temporal`
**Input**:
```json
{
  "mode": "historical",
  "thought": "Testing broken causal chain",
  "thoughtNumber": 1,
  "totalThoughts": 1,
  "nextThoughtNeeded": false,
  "thoughtType": "causal_chain",
  "events": [
    {"id": "A", "name": "Event A", "date": "1900", "significance": "major"},
    {"id": "B", "name": "Event B", "date": "1910", "significance": "major"},
    {"id": "C", "name": "Event C", "date": "1920", "significance": "major"}
  ],
  "causalChains": [
    {
      "id": "broken",
      "name": "Broken Chain",
      "confidence": 0.8,
      "links": [
        {"cause": "A", "effect": "B", "confidence": 0.9},
        {"cause": "C", "effect": "A", "confidence": 0.7}
      ]
    }
  ]
}
```
**Expected**: Warning about chain discontinuity (effect B not cause of next link).
**Pass Criteria**: Validation identifies broken chain.

### T-S7-007: Periodization
**Tool**: `deepthinking_temporal`
**Input**:
```json
{
  "mode": "historical",
  "thought": "Defining periods of Roman history",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "thoughtType": "periodization",
  "periods": [
    {
      "id": "period-1",
      "name": "Roman Republic",
      "startDate": "-509",
      "endDate": "-27",
      "characteristics": ["Senate rule", "Expansion", "Civil conflicts"],
      "keyEvents": ["evt-punic-wars", "evt-caesar-assassination"]
    },
    {
      "id": "period-2",
      "name": "Roman Empire",
      "startDate": "-27",
      "endDate": "476",
      "characteristics": ["Imperial rule", "Pax Romana", "Decline"],
      "transitions": [{
        "fromPeriod": "period-1",
        "toPeriod": "period-2",
        "transitionType": "revolutionary",
        "catalysts": ["Civil wars", "Augustus consolidation"]
      }]
    }
  ]
}
```
**Expected**: Periods defined with transitions.
**Pass Criteria**: Period chronology validated.

### T-S7-008: Pattern Identification
**Tool**: `deepthinking_temporal`
**Input**:
```json
{
  "mode": "historical",
  "thought": "Identifying cyclical patterns in economic history",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "thoughtType": "pattern_identification",
  "events": [
    {"id": "panic-1873", "name": "Panic of 1873", "date": "1873", "significance": "major"},
    {"id": "panic-1893", "name": "Panic of 1893", "date": "1893", "significance": "major"},
    {"id": "panic-1907", "name": "Panic of 1907", "date": "1907", "significance": "major"},
    {"id": "crash-1929", "name": "Wall Street Crash", "date": "1929", "significance": "transformative"}
  ],
  "patterns": [
    {
      "id": "pat-1",
      "name": "Financial Panic Cycle",
      "type": "cyclical",
      "instances": ["panic-1873", "panic-1893", "panic-1907", "crash-1929"],
      "description": "Recurring financial crises approximately every 15-20 years",
      "confidence": 0.75
    }
  ]
}
```
**Expected**: Pattern recognized with instances.
**Pass Criteria**: Pattern type and instances validated.

### T-S7-009: Auto-Detect Revolutionary Period
**Tool**: `deepthinking_temporal`
**Input**:
```json
{
  "mode": "historical",
  "thought": "Analyzing the French Revolutionary period",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "thoughtType": "event_analysis",
  "events": [
    {"id": "e1", "name": "Storming of Bastille", "date": "1789-07-14", "significance": "transformative"},
    {"id": "e2", "name": "Declaration of Rights of Man", "date": "1789-08-26", "significance": "transformative"},
    {"id": "e3", "name": "Execution of Louis XVI", "date": "1793-01-21", "significance": "transformative"},
    {"id": "e4", "name": "Reign of Terror Begins", "date": "1793-09", "significance": "transformative"},
    {"id": "e5", "name": "Fall of Robespierre", "date": "1794-07-27", "significance": "transformative"}
  ]
}
```
**Expected**: Auto-detects "Revolutionary Period" pattern (40%+ transformative events).
**Pass Criteria**: Pattern auto-detected and added.

### T-S7-010: Historical Actor Analysis
**Tool**: `deepthinking_temporal`
**Input**:
```json
{
  "mode": "historical",
  "thought": "Analyzing key actors in the American Revolution",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "thoughtType": "event_analysis",
  "actors": [
    {
      "id": "actor-1",
      "name": "George Washington",
      "type": "individual",
      "roles": ["Military Commander", "Political Leader"],
      "significance": "transformative"
    },
    {
      "id": "actor-2",
      "name": "Continental Congress",
      "type": "institution",
      "roles": ["Legislative Body"],
      "significance": "major"
    },
    {
      "id": "actor-3",
      "name": "Sons of Liberty",
      "type": "movement",
      "roles": ["Protest Movement"],
      "significance": "major"
    }
  ],
  "events": [
    {
      "id": "evt-1",
      "name": "Declaration of Independence",
      "date": "1776-07-04",
      "significance": "transformative",
      "actors": ["actor-1", "actor-2"]
    }
  ]
}
```
**Expected**: Actors linked to events.
**Pass Criteria**: Actor-event relationships validated.

### T-S7-011: Historiographical Methodology
**Tool**: `deepthinking_temporal`
**Input**:
```json
{
  "mode": "historical",
  "thought": "Applying Annales school methodology to analyze medieval economy",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "thoughtType": "pattern_identification",
  "methodology": {
    "approach": "annales",
    "techniques": ["Long-term structural analysis", "Mentalities study", "Geographic factors"],
    "limitations": ["May underemphasize individual agency"],
    "strengths": ["Reveals long-term trends", "Interdisciplinary approach"]
  }
}
```
**Expected**: Methodology recognized and documented.
**Pass Criteria**: Approach validated as one of 8 schools.

### T-S7-012: Empty Events Handling
**Tool**: `deepthinking_temporal`
**Input**:
```json
{
  "mode": "historical",
  "thought": "Testing with no events",
  "thoughtNumber": 1,
  "totalThoughts": 1,
  "nextThoughtNeeded": false,
  "thoughtType": "event_analysis",
  "events": []
}
```
**Expected**: Graceful handling of empty events.
**Pass Criteria**: No crash, appropriate response.

### T-S7-013: Low Reliability Warning
**Tool**: `deepthinking_temporal`
**Input**:
```json
{
  "mode": "historical",
  "thought": "Testing low reliability source warning",
  "thoughtNumber": 1,
  "totalThoughts": 1,
  "nextThoughtNeeded": false,
  "thoughtType": "source_evaluation",
  "sources": [
    {"id": "s1", "title": "Dubious Source", "type": "tertiary", "reliability": 0.3}
  ]
}
```
**Expected**: Warning about low reliability source.
**Pass Criteria**: Warning issued for reliability < 0.5.

### T-S7-014: Export Historical to Mermaid
**Setup**: Create session with historical thought.
**Tool**: `deepthinking_session`
**Input**:
```json
{
  "action": "export",
  "sessionId": "<historical_session>",
  "exportFormat": "mermaid"
}
```
**Expected**: Gantt timeline or flowchart output.
**Pass Criteria**: Valid Mermaid syntax with events/periods.

### T-S7-015: Historical Integration with Causal Mode
**Tool**: `deepthinking_temporal`
**Input**:
```json
{
  "mode": "historical",
  "thought": "Combining historical events with causal analysis",
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "thoughtType": "causal_chain",
  "events": [
    {"id": "e1", "name": "Treaty of Versailles", "date": "1919", "significance": "transformative", "effects": ["e2"]},
    {"id": "e2", "name": "German Economic Crisis", "date": "1923", "significance": "major", "causes": ["e1"], "effects": ["e3"]},
    {"id": "e3", "name": "Rise of Nazism", "date": "1933", "significance": "transformative", "causes": ["e2"]}
  ],
  "causalChains": [
    {
      "id": "chain-1",
      "name": "Versailles to WWII",
      "confidence": 0.85,
      "links": [
        {"cause": "e1", "effect": "e2", "mechanism": "war reparations", "confidence": 0.9},
        {"cause": "e2", "effect": "e3", "mechanism": "economic desperation", "confidence": 0.8}
      ],
      "alternativeExplanations": ["Political instability", "Weimar weakness"]
    }
  ]
}
```
**Expected**: Historical causal chain with alternative explanations.
**Pass Criteria**: Chain validated, alternatives documented.

---

## Integration Tests

### T-INT-001: Full Session Workflow
**Scenario**: Create session, add multiple thoughts, export all formats.

1. **Create Session**:
   ```json
   Tool: deepthinking_standard
   {"mode": "sequential", "thought": "Starting analysis of project risks", "thoughtNumber": 1, "totalThoughts": 3, "nextThoughtNeeded": true}
   ```

2. **Add Second Thought**:
   ```json
   Tool: deepthinking_standard
   {"mode": "sequential", "sessionId": "<from_step_1>", "thought": "Identified three main risk categories", "thoughtNumber": 2, "totalThoughts": 3, "nextThoughtNeeded": true}
   ```

3. **Add Final Thought**:
   ```json
   Tool: deepthinking_standard
   {"mode": "sequential", "sessionId": "<from_step_1>", "thought": "Recommended mitigation strategies", "thoughtNumber": 3, "totalThoughts": 3, "nextThoughtNeeded": false}
   ```

4. **Export All**:
   ```json
   Tool: deepthinking_session
   {"action": "export_all", "sessionId": "<from_step_1>"}
   ```

**Pass Criteria**: All 4 steps complete successfully, exports contain all 3 thoughts.

### T-INT-002: Multi-Mode Then Export
**Scenario**: Use analyze tool, then export results.

1. **Run Analysis**:
   ```json
   Tool: deepthinking_analyze
   {"problem": "How to improve customer retention?", "preset": "comprehensive_analysis"}
   ```

2. **Export Results**:
   ```json
   Tool: deepthinking_session
   {"action": "export_all", "sessionId": "<from_analysis>"}
   ```

**Pass Criteria**: Export includes insights from all modes in analysis.

### T-INT-003: Mode Switching Mid-Session
**Scenario**: Start with one mode, switch to another.

1. **Start with Causal**:
   ```json
   Tool: deepthinking_causal
   {"mode": "causal", "thought": "Mapping causal factors", ...}
   ```

2. **Switch to Bayesian**:
   ```json
   Tool: deepthinking_session
   {"action": "switch_mode", "sessionId": "<session>", "newMode": "bayesian"}
   ```

3. **Continue with Bayesian**:
   ```json
   Tool: deepthinking_probabilistic
   {"mode": "bayesian", "sessionId": "<session>", "thought": "Estimating probabilities", ...}
   ```

**Pass Criteria**: Mode switch successful, session maintains continuity.

### T-INT-004: Session Summarize After Complex Analysis
**Scenario**: Run complex analysis, then summarize.

1. **Complex Analysis**:
   ```json
   Tool: deepthinking_analyze
   {"problem": "Strategic planning for next fiscal year", "preset": "decision_making"}
   ```

2. **Summarize**:
   ```json
   Tool: deepthinking_session
   {"action": "summarize", "sessionId": "<session>"}
   ```

**Pass Criteria**: Summary captures key insights from all modes.

### T-INT-005: Proof Analysis Then Export
**Scenario**: Mathematical proof with verification, then export.

1. **Proof Steps**:
   ```json
   Tool: deepthinking_mathematics
   {"mode": "mathematics", "thought": "Proving theorem", "proofSteps": [...], "includeConsistencyCheck": true, ...}
   ```

2. **Export to LaTeX**:
   ```json
   Tool: deepthinking_session
   {"action": "export", "sessionId": "<session>", "exportFormat": "latex"}
   ```

**Pass Criteria**: LaTeX export includes proof structure.

---

## Edge Cases & Error Handling

### T-ERR-001: Invalid Mode Name
**Tool**: `deepthinking_standard`
**Input**:
```json
{
  "mode": "invalid_mode_name",
  "thought": "Test",
  "thoughtNumber": 1,
  "totalThoughts": 1,
  "nextThoughtNeeded": false
}
```
**Expected**: Clear error message about invalid mode.
**Pass Criteria**: Error mentions valid mode options.

### T-ERR-002: Missing Required Field
**Tool**: `deepthinking_core`
**Input**:
```json
{
  "mode": "deductive",
  "thoughtNumber": 1,
  "totalThoughts": 1
}
```
**Expected**: Error about missing "thought" field.
**Pass Criteria**: Validation error with field name.

### T-ERR-003: Invalid Session ID Format
**Tool**: `deepthinking_session`
**Input**:
```json
{
  "action": "get_session",
  "sessionId": "not-a-valid-uuid"
}
```
**Expected**: Error about invalid session ID.
**Pass Criteria**: Clear error message.

### T-ERR-004: Negative Thought Number
**Tool**: `deepthinking_standard`
**Input**:
```json
{
  "mode": "sequential",
  "thought": "Test",
  "thoughtNumber": -1,
  "totalThoughts": 3,
  "nextThoughtNeeded": true
}
```
**Expected**: Validation error.
**Pass Criteria**: Error about invalid thoughtNumber.

### T-ERR-005: Probability Out of Range
**Tool**: `deepthinking_probabilistic`
**Input**:
```json
{
  "mode": "bayesian",
  "thought": "Test",
  "thoughtNumber": 1,
  "totalThoughts": 1,
  "nextThoughtNeeded": false,
  "priorProbability": 1.5
}
```
**Expected**: Validation error about probability range.
**Pass Criteria**: Error mentions 0-1 range.

### T-ERR-006: Empty Preset Name
**Tool**: `deepthinking_analyze`
**Input**:
```json
{
  "problem": "Test problem",
  "preset": ""
}
```
**Expected**: Error about invalid preset.
**Pass Criteria**: Error lists valid presets.

### T-ERR-007: Invalid Export Format
**Tool**: `deepthinking_session`
**Input**:
```json
{
  "action": "export",
  "sessionId": "<valid_session>",
  "exportFormat": "pdf"
}
```
**Expected**: Error about unsupported format.
**Pass Criteria**: Error lists supported formats.

### T-ERR-008: Circular Edge Reference
**Tool**: `deepthinking_causal`
**Input**:
```json
{
  "mode": "causal",
  "thought": "Test",
  "thoughtNumber": 1,
  "totalThoughts": 1,
  "nextThoughtNeeded": false,
  "nodes": [{"id": "A", "name": "A"}],
  "edges": [{"from": "A", "to": "A"}]
}
```
**Expected**: Warning about self-loop.
**Pass Criteria**: Handled gracefully (warning or processed).

---

## Performance Tests

### T-PERF-001: Large Thought Content
**Tool**: `deepthinking_standard`
**Input**: Thought content with 10,000+ characters.
**Expected**: Processes within reasonable time (<30s).
**Pass Criteria**: Response received, no timeout.

### T-PERF-002: Large Graph (50+ Nodes)
**Tool**: `deepthinking_causal`
**Input**: Graph with 50 nodes and 100+ edges.
**Expected**: Centrality analysis completes.
**Pass Criteria**: Response received with analysis.

### T-PERF-003: Multi-Mode Analysis Timeout
**Tool**: `deepthinking_analyze`
**Input**: Complex problem with comprehensive_analysis preset.
**Expected**: Completes within configured timeout.
**Pass Criteria**: All modes execute, results merged.

### T-PERF-004: Export Large Session
**Setup**: Session with 20+ thoughts.
**Tool**: `deepthinking_session`
**Input**: `{"action": "export_all", "sessionId": "<large_session>"}`
**Expected**: All formats generated.
**Pass Criteria**: All 8 exports returned.

---

## Test Execution Checklist

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| **Sprint 1** |
| T-S1-001 | Proof Branch Types | [ ] | |
| T-S1-002 | Multi-Mode Combination | [ ] | |
| T-S1-003 | Monte Carlo Types | [ ] | |
| T-S1-004 | Enhanced Graph Types | [ ] | |
| **Sprint 2** |
| T-S2-001 | Branch Analysis Basic | [ ] | |
| T-S2-002 | Strategy - Induction | [ ] | |
| T-S2-003 | Strategy - Contradiction | [ ] | |
| T-S2-004 | Hierarchical Proof | [ ] | |
| T-S2-005 | Verification Valid | [ ] | |
| T-S2-006 | Verification Invalid | [ ] | |
| T-S2-007 | Circular Detection | [ ] | |
| **Sprint 3** |
| T-S3-001 | Comprehensive Analysis | [ ] | |
| T-S3-002 | Hypothesis Testing | [ ] | |
| T-S3-003 | Decision Making | [ ] | |
| T-S3-004 | Root Cause | [ ] | |
| T-S3-005 | Future Planning | [ ] | |
| T-S3-006 | Custom Mode Selection | [ ] | |
| T-S3-007 | Conflict Detection | [ ] | |
| T-S3-008 | Merge - Union | [ ] | |
| T-S3-009 | Merge - Intersection | [ ] | |
| T-S3-010 | Merge - Dialectical | [ ] | |
| T-S3-011 | Progress Tracking | [ ] | |
| T-S3-012 | Empty Problem | [ ] | |
| **Sprint 4** |
| T-S4-001 | Export All Formats | [ ] | |
| T-S4-002 | Academic Profile | [ ] | |
| T-S4-003 | Presentation Profile | [ ] | |
| T-S4-004 | Minimal Profile | [ ] | |
| T-S4-005 | Export Markdown | [ ] | |
| T-S4-006 | Export LaTeX | [ ] | |
| T-S4-007 | Export Jupyter | [ ] | |
| T-S4-008 | Export Mermaid | [ ] | |
| T-S4-009 | Export DOT | [ ] | |
| T-S4-010 | Export ASCII | [ ] | |
| T-S4-011 | Export Empty Session | [ ] | |
| T-S4-012 | Export Invalid Session | [ ] | |
| T-S4-013 | Export Causal Content | [ ] | |
| T-S4-014 | Export Bayesian Content | [ ] | |
| **Sprint 5** |
| T-S5-001 | Bayesian Basic | [ ] | |
| T-S5-002 | Bayesian Multi-Evidence | [ ] | |
| T-S5-003 | Hypothesis Comparison | [ ] | |
| T-S5-004 | Evidential Basic | [ ] | |
| T-S5-005 | Stochastic Model | [ ] | |
| T-S5-006 | Convergence | [ ] | |
| T-S5-007 | Zero Probability | [ ] | |
| T-S5-008 | Near-One Probability | [ ] | |
| **Sprint 6** |
| T-S6-001 | Centrality Analysis | [ ] | |
| T-S6-002 | Star Graph | [ ] | |
| T-S6-003 | Chain Betweenness | [ ] | |
| T-S6-004 | D-Separation Basic | [ ] | |
| T-S6-005 | Collider Structure | [ ] | |
| T-S6-006 | Backdoor Criterion | [ ] | |
| T-S6-007 | Do-Calculus | [ ] | |
| T-S6-008 | Counterfactual | [ ] | |
| T-S6-009 | Multiple Paths | [ ] | |
| T-S6-010 | Empty Graph | [ ] | |
| T-S6-011 | Cycle Detection | [ ] | |
| **Sprint 7 - Historical** |
| T-S7-001 | Event Analysis Basic | [ ] | |
| T-S7-002 | Source Evaluation | [ ] | |
| T-S7-003 | Source Type Weighting | [ ] | |
| T-S7-004 | Corroboration Bonus | [ ] | |
| T-S7-005 | Causal Chain Analysis | [ ] | |
| T-S7-006 | Causal Chain Continuity | [ ] | |
| T-S7-007 | Periodization | [ ] | |
| T-S7-008 | Pattern Identification | [ ] | |
| T-S7-009 | Auto-Detect Revolutionary | [ ] | |
| T-S7-010 | Historical Actor Analysis | [ ] | |
| T-S7-011 | Historiographical Methodology | [ ] | |
| T-S7-012 | Empty Events Handling | [ ] | |
| T-S7-013 | Low Reliability Warning | [ ] | |
| T-S7-014 | Export Historical Mermaid | [ ] | |
| T-S7-015 | Historical + Causal Integration | [ ] | |
| **Integration** |
| T-INT-001 | Full Workflow | [ ] | |
| T-INT-002 | Multi-Mode Export | [ ] | |
| T-INT-003 | Mode Switching | [ ] | |
| T-INT-004 | Summarize After Analysis | [ ] | |
| T-INT-005 | Proof Export | [ ] | |
| **Error Handling** |
| T-ERR-001 | Invalid Mode | [ ] | |
| T-ERR-002 | Missing Field | [ ] | |
| T-ERR-003 | Invalid Session ID | [ ] | |
| T-ERR-004 | Negative Thought | [ ] | |
| T-ERR-005 | Probability Range | [ ] | |
| T-ERR-006 | Empty Preset | [ ] | |
| T-ERR-007 | Invalid Export | [ ] | |
| T-ERR-008 | Self-Loop Edge | [ ] | |
| **Performance** |
| T-PERF-001 | Large Content | [ ] | |
| T-PERF-002 | Large Graph | [ ] | |
| T-PERF-003 | Analysis Timeout | [ ] | |
| T-PERF-004 | Large Session Export | [ ] | |

---

## Honest Assessment & Limitations

### What This Test Plan Covers
- All 13 MCP tools functionality
- Phase 12 features (Sprints 1-6)
- Input validation and error handling
- Basic integration scenarios
- Edge cases for common operations

### What This Test Plan Does NOT Cover
1. **Internal Implementation Details**: Cannot verify internal algorithm correctness (e.g., actual PageRank values, exact convergence diagnostics)
2. **File System Operations**: FileExporter writes to disk cannot be tested through MCP client
3. **Concurrent Access**: Multi-instance scenarios require separate testing
4. **Memory/Resource Usage**: Performance characteristics beyond timeout behavior
5. **Visual Output Quality**: Cannot verify Mermaid/DOT rendering correctness
6. **Statistical Accuracy**: Monte Carlo convergence properties require specialized validation

### Known Gaps
1. **StochasticHandler**: Not directly exposed via MCP tools (internal to bayesian/evidential modes)
2. **Proof Decomposition Internal APIs**: BranchAnalyzer, StrategyRecommender, ProofVerifier are internal services
3. **Export Progress Callbacks**: Not observable through client interface
4. **Centrality Metrics Precision**: Cannot verify exact numerical values

### Recommendations
1. Run unit tests (`npm test`) for internal implementation verification
2. Use integration tests for automated regression testing
3. Manually verify visual exports (Mermaid, DOT) in appropriate renderers
4. Consider load testing for production deployments
