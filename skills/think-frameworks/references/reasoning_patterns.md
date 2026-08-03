# Reasoning Patterns and Anti-Patterns

This reference document provides reusable reasoning patterns and common pitfalls to avoid.

## Reusable Reasoning Patterns

### Pattern 1: Scientific Investigation

**When to use**: Empirical questions, hypothesis testing, research

**Sequence**:
```
1. OBSERVE → Collect data systematically
2. INDUCE → Identify patterns in observations
3. ABDUCE → Generate hypothesis explaining patterns
4. DEDUCE → Derive testable predictions from hypothesis
5. TEST → Gather evidence through controlled experiments
6. BAYESIAN UPDATE → Revise confidence based on results
7. ITERATE → Refine hypothesis and repeat
```

**Example**:
```markdown
Question: Does code review reduce bug density?

1. Observe: Track bug rates in reviewed vs unreviewed code
2. Induce: Pattern shows reviewed code has fewer bugs
3. Abduce: Hypothesis: Code review catches bugs before deployment
4. Deduce: Prediction: Bug density should correlate with review thoroughness
5. Test: Measure correlation between review time/comments and bugs
6. Update: Strong correlation found → Increases confidence
7. Iterate: Test if specific review practices matter more
```

---

### Pattern 2: Root Cause Analysis (5 Whys + Fishbone)

**When to use**: System failures, persistent problems, incident analysis

**Sequence**:
```
1. DIAGNOSTIC → Identify the symptom/problem
2. DECOMPOSITIONAL → Break into potential categories (people, process, technology, etc.)
3. CAUSAL → For each category, ask "Why?" repeatedly
4. ABDUCTIVE → Identify most likely root cause
5. DEDUCTIVE → Predict: "If this is root cause, fixing it should eliminate problem"
6. EVIDENTIAL → Implement fix and monitor
```

**Template**:
```markdown
Problem: [Specific issue]

Categories of potential causes:
- People: Skills, training, communication
- Process: Procedures, workflows, documentation
- Technology: Tools, systems, infrastructure
- Environment: External factors, dependencies

5 Whys for most likely category:
1. Why did [problem] happen? → [immediate cause]
2. Why did [immediate cause] happen? → [underlying cause]
3. Why did [underlying cause] happen? → [deeper cause]
4. Why did [deeper cause] happen? → [systemic cause]
5. Why did [systemic cause] happen? → [root cause]

Root Cause: [Identified cause]
Verification: [How to confirm this is root cause]
Solution: [How to address root cause]
```

---

### Pattern 3: Architecture Decision Record (ADR)

**When to use**: Significant technical decisions, architecture choices

**Sequence**:
```
1. ANALYTICAL → Understand context and requirements
2. CONSTRAINT-BASED → Identify constraints and limitations
3. DIVERGENT → Generate alternative approaches
4. COMPARATIVE → Evaluate alternatives against criteria
5. GAME-THEORETIC → Consider long-term implications
6. DECISION → Select approach with justification
7. DOCUMENTED → Record decision and reasoning
```

**Template**:
```markdown
# ADR-[NUMBER]: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[What is the situation driving this decision?]
[Use ANALYTICAL reasoning to frame the problem]

## Constraints
[What limitations exist?]
[Use CONSTRAINT-BASED reasoning]
- Technical: [e.g., must integrate with existing system]
- Business: [e.g., budget limitations]
- Operational: [e.g., team expertise]

## Options Considered
[Use DIVERGENT reasoning to generate alternatives]

### Option 1: [Name]
**Description**: [Brief description]
**Pros**: [Advantages]
**Cons**: [Disadvantages]

### Option 2: [Name]
[Same structure]

### Option 3: [Name]
[Same structure]

## Decision
[Use COMPARATIVE + EVALUATIVE reasoning]
We will [chosen option] because [justification].

## Consequences
[Use HYPOTHETICAL + GAME-THEORETIC reasoning]
**Positive**: [Expected benefits]
**Negative**: [Trade-offs and costs]
**Risks**: [What could go wrong]
**Mitigation**: [How to address risks]

## Reasoning Type
[Name the primary reasoning types used]
```

---

### Pattern 4: Hypothesis-Driven Development

**When to use**: Feature development, optimization, A/B testing

**Sequence**:
```
1. ABDUCTIVE → Form hypothesis about what will improve metrics
2. DEDUCTIVE → Derive measurable predictions
3. EXPERIMENTAL → Design controlled test
4. EVIDENTIAL → Collect data
5. STATISTICAL → Analyze results
6. BAYESIAN → Update beliefs
7. DECISION → Ship, iterate, or abandon
```

**Template**:
```markdown
## Hypothesis
We believe that [change] will result in [outcome] for [users].

## Reasoning
[Use ABDUCTIVE reasoning to explain why]
Based on [observations/data], we hypothesize that [mechanism].

## Predictions
[Use DEDUCTIVE reasoning]
If our hypothesis is correct, we expect to see:
- Metric 1: [specific prediction with target]
- Metric 2: [specific prediction with target]

## Experiment Design
[Use SYSTEMATIC reasoning]
- Control: [current experience]
- Treatment: [modified experience]
- Sample size: [calculated from power analysis]
- Duration: [time needed for significance]
- Success criteria: [what constitutes validation]

## Results
[Use STATISTICAL + EVIDENTIAL reasoning]
- Metric 1: [actual vs predicted]
- Metric 2: [actual vs predicted]
- Statistical significance: [p-value]
- Effect size: [practical significance]

## Conclusion
[Use BAYESIAN reasoning]
- Hypothesis: [Supported | Refuted | Inconclusive]
- Confidence: [Low | Medium | High]
- Next steps: [Ship | Iterate | Abandon]
```

---

### Pattern 5: Trade-off Analysis

**When to use**: Choosing between imperfect alternatives, resource allocation

**Sequence**:
```
1. COMPARATIVE → Identify options
2. ANALYTICAL → Define evaluation criteria
3. QUANTITATIVE → Score options on criteria
4. WEIGHTED → Apply importance weights
5. EVALUATIVE → Calculate overall scores
6. SENSITIVITY → Test robustness of decision
7. DECISION → Select with acknowledgment of trade-offs
```

**Template**:
```markdown
## Options
- Option A: [description]
- Option B: [description]
- Option C: [description]

## Evaluation Criteria
[Use ANALYTICAL reasoning to identify what matters]

| Criterion | Weight | Why Important |
|-----------|--------|---------------|
| [Criterion 1] | 30% | [justification] |
| [Criterion 2] | 25% | [justification] |
| [Criterion 3] | 25% | [justification] |
| [Criterion 4] | 20% | [justification] |

## Scoring
[Use COMPARATIVE + QUANTITATIVE reasoning]

| Option | Crit1 | Crit2 | Crit3 | Crit4 | Weighted Score |
|--------|-------|-------|-------|-------|----------------|
| A | 8/10 | 6/10 | 7/10 | 9/10 | 7.5/10 |
| B | 7/10 | 9/10 | 6/10 | 7/10 | 7.35/10 |
| C | 9/10 | 7/10 | 8/10 | 6/10 | 7.6/10 |

## Sensitivity Analysis
[Use ANALYTICAL reasoning]
"What if we got the weights wrong?"

If Criterion 2 is actually most important:
- Option B becomes best choice

## Decision
[Use DECISION reasoning with uncertainty acknowledgment]
Select Option [X] based on current understanding of priorities.

Acknowledge:
- Close scores suggest no clearly dominant option
- Decision sensitive to criterion weights
- Should revisit if priorities change
```

---

### Pattern 6: Debugging Systematic Method

**When to use**: Complex bugs, intermittent issues, system failures

**Sequence**:
```
1. DIAGNOSTIC → Reproduce and characterize the bug
2. DECOMPOSITIONAL → Isolate the problem space
3. ABDUCTIVE → Generate hypotheses
4. DEDUCTIVE → Derive testable implications
5. EVIDENTIAL → Test hypotheses systematically
6. CAUSAL → Identify root cause
7. VERIFICATION → Confirm fix resolves issue
```

**Template**:
```markdown
## Bug Report
**Symptom**: [What's going wrong]
**Frequency**: [Always | Sometimes | Rare]
**Impact**: [Severity and scope]

## Step 1: Reproduce (DIAGNOSTIC)
**Steps to reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected**: [What should happen]
**Actual**: [What happens instead]

## Step 2: Isolate (DECOMPOSITIONAL)
**Binary search through system layers**:
- Frontend? [Test result]
- API? [Test result]
- Business logic? [Test result]
- Database? [Test result]

**Narrowed to**: [Specific component]

## Step 3: Hypothesize (ABDUCTIVE)
**Possible causes**:
1. [Hypothesis 1] - Probability: High/Med/Low
2. [Hypothesis 2] - Probability: High/Med/Low
3. [Hypothesis 3] - Probability: High/Med/Low

## Step 4: Predict (DEDUCTIVE)
**For each hypothesis, what else should be true?**

If Hypothesis 1:
- Should see [X] in logs
- Should fail when [Y]
- Should succeed when [Z]

## Step 5: Test (EVIDENTIAL)
**Hypothesis 1**: [Test results and conclusion]
**Hypothesis 2**: [Test results and conclusion]

## Step 6: Root Cause (CAUSAL)
**Identified cause**: [Specific issue]
**Why it causes the symptom**: [Causal chain]

## Step 7: Fix and Verify (VERIFICATION)
**Fix applied**: [Description]
**Verification**:
- Bug no longer reproduces: ✓
- Regression tests pass: ✓
- Related scenarios tested: ✓
```

---

## Anti-Patterns (Common Reasoning Errors)

### Anti-Pattern 1: Hasty Generalization

**Error**: Drawing broad conclusions from insufficient evidence

**Example**:
```markdown
❌ Bad:
"I tested the function with one input and it worked, 
therefore it works for all inputs."

✓ Good:
"I tested the function with:
- Normal case: ✓
- Edge case (empty input): ✓
- Edge case (null): ✓
- Edge case (max size): ✓
- Invalid input: ✓
Therefore, I have reasonable confidence it handles common scenarios."
```

**How to avoid**:
- Use INDUCTIVE reasoning properly: adequate sample size
- Test edge cases systematically
- Consider what you haven't tested

---

### Anti-Pattern 2: Affirming the Consequent

**Error**: "If P then Q. Q is true. Therefore P is true."

**Example**:
```markdown
❌ Bad Logic:
"If the server is down, API calls fail.
API calls are failing.
Therefore, the server is down."

(Ignores: network issues, authentication problems, rate limiting, etc.)

✓ Good Logic:
"If the server is down, API calls fail.
API calls are failing.
Possible causes: server down, network issue, auth problem, rate limit.
Test each: [systematic diagnosis]"
```

**How to avoid**:
- Use ABDUCTIVE reasoning: generate multiple explanations
- Use DIAGNOSTIC reasoning: test each possibility
- Remember: multiple causes can produce same effect

---

### Anti-Pattern 3: Correlation-Causation Confusion

**Error**: Assuming correlation implies causation

**Example**:
```markdown
❌ Bad:
"Users who have premium accounts spend more time on site.
Therefore, upgrading users to premium will increase engagement."

(Ignores: Maybe engaged users choose premium, not vice versa)

✓ Good:
"Correlation observed between premium status and engagement.
Possible explanations:
1. Premium features increase engagement (causation)
2. Engaged users upgrade to premium (reverse causation)
3. Power users are both engaged and willing to pay (common cause)

Test: Randomly upgrade some users, measure engagement change.
If engagement increases → Evidence for causation (1)
If no change → Evidence against causation (2 or 3 more likely)"
```

**How to avoid**:
- Use CAUSAL reasoning properly
- Consider alternative explanations
- Use experiments to test causal hypotheses

---

### Anti-Pattern 4: Circular Reasoning (Begging the Question)

**Error**: Conclusion assumes what it's trying to prove

**Example**:
```markdown
❌ Bad:
"This is the best architecture because it's optimal, 
and we know it's optimal because it's the best."

✓ Good:
"This architecture is best for our needs because:
1. Meets performance requirements (< 100ms latency)
2. Fits team expertise (everyone knows Python)
3. Lowest total cost of ownership over 3 years
4. Proven at similar scale (references: X, Y, Z)"
```

**How to avoid**:
- Ensure premises are independent of conclusion
- Provide external evidence
- Build arguments from first principles

---

### Anti-Pattern 5: False Dichotomy (Black-and-White Thinking)

**Error**: Assuming only two options exist

**Example**:
```markdown
❌ Bad:
"We can either build it ourselves or buy a commercial solution."

✓ Good:
"Options include:
1. Build entirely in-house
2. Buy commercial off-the-shelf
3. Open source with customization
4. Hybrid: commercial core + custom extensions
5. Start with commercial, migrate to custom later
6. Partner with vendor for customized version

Evaluate each based on cost, time, fit, flexibility..."
```

**How to avoid**:
- Use DIVERGENT reasoning to generate alternatives
- Challenge assumptions about what's possible
- Ask "What else?"

---

### Anti-Pattern 6: Confirmation Bias

**Error**: Seeking only evidence that confirms existing beliefs

**Example**:
```markdown
❌ Bad:
Hypothesis: "React is better than Vue"
Search: "reasons React is better than Vue"
Result: Biased confirmation

✓ Good:
Hypothesis: "React might be better than Vue for our use case"
Search both:
- "React advantages over Vue"
- "Vue advantages over React"
- "React vs Vue for [our specific needs]"
- "React disadvantages"
- "Vue disadvantages"
Evaluate all evidence fairly
```

**How to avoid**:
- Actively seek disconfirming evidence
- Use CRITICAL reasoning to challenge your own arguments
- Consider alternative viewpoints seriously

---

### Anti-Pattern 7: Sunk Cost Fallacy

**Error**: Continuing investment because of past investment

**Example**:
```markdown
❌ Bad:
"We've already spent 6 months building this architecture,
we can't switch now."

✓ Good:
"We've spent 6 months, but facing 2 more years of maintenance pain.
Analysis:
- Continuing current path: High ongoing cost
- Switching: One-time migration cost + lower ongoing cost
- NPV comparison: Switch saves $X over 3 years
Decision: Switch, sunk costs are irrelevant to future decision"
```

**How to avoid**:
- Use FORWARD-LOOKING reasoning (future costs/benefits only)
- Ignore sunk costs in decision-making
- Evaluate alternatives on future merits

---

### Anti-Pattern 8: Analysis Paralysis

**Error**: Over-analyzing, never deciding

**Example**:
```markdown
❌ Bad:
"Before choosing a database, let's:
- Benchmark 15 different systems
- Test on 50 different workload patterns
- Read all documentation
- Wait for next versions
- Get more information..."
[Never decide]

✓ Good:
"For choosing a database:
- Identify top 3 candidates based on requirements
- Benchmark on our specific workload
- Check documentation for critical features
- Set decision deadline: End of week
- Decision criteria: Meet 80% of needs, proven at our scale"
[Decide with available information]
```

**How to avoid**:
- Set decision deadlines
- Define "good enough" criteria
- Use satisficing instead of optimizing
- Remember: perfect information is impossible

---

### Anti-Pattern 9: Premature Optimization

**Error**: Optimizing before understanding the problem

**Example**:
```markdown
❌ Bad:
"Let's use a complex distributed architecture with caching,
sharding, and CDN from day one."
(For app with 10 users)

✓ Good:
"Start simple:
- Monolithic architecture
- Standard database
- Profile actual usage
- Optimize based on actual bottlenecks
- Scale as needed"
```

**How to avoid**:
- Use EVIDENTIAL reasoning: measure before optimizing
- Follow "make it work, make it right, make it fast"
- Optimize based on data, not speculation

---

### Anti-Pattern 10: Anchoring Bias

**Error**: Over-relying on first piece of information

**Example**:
```markdown
❌ Bad:
First estimate: "This will take 2 weeks"
[Never reconsider despite new information]

✓ Good:
Initial estimate: "Roughly 2 weeks"
After requirements clarification: "Actually 3-4 weeks"
After discovering complexity: "More like 5-6 weeks"
[Update estimates as you learn more]
```

**How to avoid**:
- Question initial assumptions
- Update estimates with new information
- Use multiple reference points
- Practice BAYESIAN reasoning (update beliefs)

---

## Reasoning Quality Checklist

Use this checklist to evaluate reasoning quality:

### Structural Quality
- [ ] Reasoning type(s) identified and named
- [ ] Appropriate to the problem type
- [ ] Steps shown explicitly
- [ ] Logic is valid (deductive) or sound (inductive/abductive)

### Evidential Quality
- [ ] Evidence cited appropriately
- [ ] Sources evaluated for reliability
- [ ] Disconfirming evidence considered
- [ ] Alternative explanations explored

### Assumption Management
- [ ] Key assumptions stated explicitly
- [ ] Assumptions justified or tested
- [ ] Impact of assumptions assessed
- [ ] Sensitivity analysis performed (when critical)

### Uncertainty Handling
- [ ] Confidence levels stated appropriately
- [ ] Limitations acknowledged
- [ ] Probabilistic reasoning used when appropriate
- [ ] Conclusions qualified properly

### Cognitive Bias Awareness
- [ ] Confirmation bias checked
- [ ] Anchoring bias considered
- [ ] Availability bias assessed
- [ ] Sunk cost fallacy avoided

### Metacognitive Quality
- [ ] Reasoning approach justified
- [ ] Alternative approaches considered
- [ ] Self-correction present when needed
- [ ] Learning captured for future

---

## Pattern Selection Guide

**Use this to choose appropriate reasoning pattern:**

### For Empirical Questions
→ Scientific Investigation Pattern

### For System Problems
→ Root Cause Analysis Pattern

### For Technical Decisions
→ Architecture Decision Record Pattern

### For Product Features
→ Hypothesis-Driven Development Pattern

### For Choosing Between Options
→ Trade-off Analysis Pattern

### For Bug Fixing
→ Debugging Systematic Method Pattern

### For Creative Problems
→ Design Thinking Pattern (see examples)

### For Strategic Decisions
→ Scenario Planning Pattern (see examples)

---

## Conclusion

**Good reasoning is:**
- Systematic (follows patterns)
- Explicit (shows steps)
- Aware (recognizes biases)
- Adaptive (switches approaches when needed)
- Honest (acknowledges limitations)

**Bad reasoning:**
- Jumps to conclusions
- Hides assumptions
- Ignores alternatives
- Persists despite evidence
- Claims false certainty

Master these patterns and avoid these anti-patterns to reason more effectively across all domains.
