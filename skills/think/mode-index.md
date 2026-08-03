# Mode Index — Auto-Recommendation Decision Tree (v0.2.0)

When the user invokes `/think` without specifying a mode, use this decision tree to pick the most appropriate one.

## Decision Tree

Ask yourself in this order:

### 1. Do you have multiple specific observations in the prompt, asking for a pattern?
Concrete cases, not references to cases that would need gathering.
→ **inductive**

### 2. Do you have a surprising observation and need the best explanation?
One unexplained phenomenon, multiple candidate explanations, you want to pick the most plausible.
→ **abductive**

### 3. Does the prompt contain explicit premises and ask whether a conclusion follows?
Formal "if X then Y, and X, so Y?" shape, or applying rules to a case.
→ **deductive** (for intuitive formal inference) or **formallogic** (for strict natural-deduction or predicate-calculus proofs)

### 4. Does the problem involve probability, evidence, or belief revision?
- Single-hypothesis belief update from new evidence → **bayesian**
- Multi-source evidence fusion with Dempster-Shafer or similar → **evidential**
- Modeling a stochastic process (distributions, sampling, expected value) → **stochastic**

### 5. Does the problem involve cause-and-effect?
- Tracing the actual causal mechanism → **causal**
- "What would have happened if X had been different?" → **counterfactual**

### 6. Does the problem involve strategy, optimization, or constraints?
- Multi-agent strategic interaction with interdependent payoffs → **gametheory**
- Finding the best allocation given an objective function → **optimization**
- Finding ANY feasible solution satisfying hard rules → **constraint**

### 7. Is this time-based reasoning?
- Event ordering, time intervals, causation across time → **temporal**
- Historical precedent, source reliability, patterns across episodes → **historical**

### 8. Is this a mathematical, physical, or computational question?
- Formal proof or algebraic reasoning → **mathematics**
- Physical models, tensors, conservation laws → **physics**
- Decidability, complexity classes, computability → **computability**

### 9. Does the problem require an engineering/algorithmic decision?
- Design trade-offs, FMEA, trade studies → **engineering**
- Algorithm selection and complexity analysis → **algorithmic**

### 10. Is this academic or research-style reasoning?
- Literature review with coverage tracking → **synthesis**
- Building an argument (Toulmin structure) → **argumentation**
- Peer-review evaluation → **critique**
- Layered systematic analysis → **analysis**

### 11. Is this scientific method or systems reasoning?
- Hypothesis + experiment + falsifiability → **scientificmethod**
- Feedback loops and systems archetypes → **systemsthinking**
- Formal proof structure (natural deduction) → **formallogic**

### 12. Is this an advanced reasoning pattern?
- Self-referential / recursive decomposition → **recursive**
- Possibility/necessity (alethic, epistemic, deontic) → **modal**
- Strategic oversight of reasoning process itself → **metareasoning**
- Cross-domain structural analogy → **analogical**
- First-principles decomposition to axioms → **firstprinciples**
- Signal-from-noise pattern extraction (Decibans) → **cryptanalytic**
- Shannon-style information-theoretic decomposition → **shannon**
- Multi-mode composition → **hybrid**

### 13. Does the problem call for a named analytical framework?
- Need to fully scope/define a problem before analysis? → **5w1h**
- Assessing strategic position (internal + external factors)? → **swot**
- Drilling from a symptom to a single root cause? → **fivewhys** (or **fishbone** for multi-category causes)
- Cause analysis needing multiple cause CATEGORIES? → **fishbone**
- Scanning the external/macro environment? → **pestle**
- Weighing forces for/against a change? → **forcefield**
- Comparing options against weighted criteria? → **decisionmatrix**
- Prioritizing the vital few from the trivial many? → **pareto**
- Mapping stakeholders by power and interest? → **stakeholder**
- Weighing quantified costs against benefits? → **costbenefit**
- Rating risks by probability × impact? → **riskassessment**
- Mapping current vs. desired state with an action plan? → **gapanalysis**

### Fallback

If none of the above clearly fit OR the prompt references observations that aren't actually in the prompt → **sequential** with a data-gathering thought as step 1 (and possibly a mode handoff in a later thought once data is known).

## Example Mappings

| User prompt | Recommended mode | Reason |
|---|---|---|
| "Break down the steps to migrate this database" | sequential | Explicit "break down" and multi-step workflow |
| "Given these three incidents (A, B, C), what pattern do they share?" | inductive | Multiple concrete observations IN the prompt, asking for a pattern |
| "If all users in admin can edit posts and Alice is in admin, can Alice edit posts?" | deductive | Explicit premises, formal inference |
| "Why did the last three deployments fail?" | sequential | References observations but doesn't provide them — start with a data-gathering thought |
| "What should our caching strategy be for this API?" | sequential | Multi-step design decision |
| "Plan the refactor of the auth module" | sequential | Explicit "plan" and multi-step work |
| "Update my belief the service is down given 40% error rate" | bayesian | Belief update from new evidence |
| "Why did latency spike after the config change?" | causal | Cause-effect tracing |
| "What if we had used a different load balancer?" | counterfactual | Hypothetical alternative history |
| "How should player A bid given player B's likely strategy?" | gametheory | Multi-agent interdependent payoffs |
| "Is this proof of P=NP valid?" | formallogic | Formal proof structure evaluation |
| "Synthesize these 5 papers on transformer attention" | synthesis | Multi-source literature integration |

## Explain Your Choice

When auto-recommending, always start your response with one sentence naming the chosen mode and why. Example:

> "Using inductive reasoning to identify a pattern across the three deployment failures."

This transparency lets the user override you with `/think <mode>` if they prefer a different frame.
