# Cognitive Biases Framework: Complete Taxonomy and Mitigation Guide

## Overview

This framework provides a comprehensive taxonomy of cognitive biases organized by type, with explicit connections to the 110 reasoning types that can detect and mitigate each bias.

**Purpose**: Enable systematic identification and defeat of cognitive biases through structured reasoning approaches.

---

## Bias Categories

Based on the Cognitive Bias Codex and dual-process theory, biases arise from four fundamental problems:

1. **Too Much Information** → We filter aggressively
2. **Not Enough Meaning** → We fill in gaps
3. **Need to Act Fast** → We jump to conclusions
4. **What to Remember** → We edit and reinforce memories

---

## CATEGORY 1: Information Filtering Biases

*Problem: Overwhelmed by information, we notice only some things*

### 1.1 Confirmation Bias

**Definition**: Tendency to search for, interpret, and recall information that confirms pre-existing beliefs.

**Manifestation**:
- Seeking only supporting evidence
- Dismissing contradictory data
- Interpreting ambiguous evidence as confirmatory
- Remembering successes, forgetting failures

**Why It Occurs**: 
- Cognitive ease (confirming beliefs requires less mental effort)
- Identity protection (beliefs tied to self-concept)
- Consistency motivation (desire for coherent worldview)

**Vulnerable Reasoning Types**:
- Inductive (biased sampling)
- Abductive (premature best explanation)
- Analogical (cherry-picked analogies)

**Defeating Reasoning Types**:
- **Critical Reasoning** → Systematically seek disconfirming evidence
- **Adversarial Reasoning** → Argue against own position
- **Dialectical Reasoning** → Consider opposing viewpoints
- **Evidential Reasoning** → Weight all evidence fairly
- **Meta-reasoning** → Monitor for selective attention

**Detection Signals**:
- ⚠️ Only finding evidence that supports your view
- ⚠️ Quick dismissal of contrary evidence
- ⚠️ Interpreting ambiguous data as supportive
- ⚠️ Feeling defensive when challenged

**Mitigation Protocol**:
```
1. State hypothesis clearly
2. List predictions if hypothesis is TRUE
3. List predictions if hypothesis is FALSE
4. Actively seek disconfirming evidence
5. Consider: "What would change my mind?"
6. Use adversarial reasoning: Argue opposite view
```

**Example - Software Engineering**:
```markdown
Biased: "Our new framework is better than React"
→ Searches: "advantages of our framework"
→ Reads only positive reviews
→ Dismisses performance benchmarks showing React faster

Debiased: "Hypothesis: Our framework is better than React"
→ Define "better" (performance? DX? ecosystem?)
→ Systematically test: performance, learning curve, ecosystem
→ Seek negative reviews and failure cases
→ Compare against objective criteria
→ Conclusion: Better for X use case, worse for Y use case
```

---

### 1.2 Availability Heuristic / Availability Bias

**Definition**: Overweighting information that comes to mind easily (recent, vivid, emotional events).

**Manifestation**:
- Overestimating probability of dramatic events
- Judging based on recent examples
- Influenced by media coverage frequency
- Using easily recalled examples as base rates

**Why It Occurs**:
- Retrieval fluency mistaken for frequency
- Emotional/vivid memories more accessible
- Recency makes information easier to recall

**Vulnerable Reasoning Types**:
- Inductive (biased by memorable examples)
- Probabilistic (misjudging frequencies)
- Case-based (overweighting vivid cases)

**Defeating Reasoning Types**:
- **Statistical Reasoning** → Use actual frequencies, not memories
- **Systematic Reasoning** → Comprehensive data collection
- **Quantitative Reasoning** → Calculate actual probabilities
- **Evidential Reasoning** → Weight evidence by quality, not memorability
- **Bayesian Reasoning** → Update from base rates, not anecdotes

**Detection Signals**:
- ⚠️ Citing recent or dramatic examples
- ⚠️ "I know someone who..." as evidence
- ⚠️ Influenced by news coverage frequency
- ⚠️ Ignoring statistical base rates

**Mitigation Protocol**:
```
1. Ask: "What's the actual base rate?"
2. Gather comprehensive data, not just memorable cases
3. Weight by sample size, not vividness
4. Check: Am I influenced by recent news/events?
5. Use statistical reasoning to calculate actual probabilities
```

**Example - Product Management**:
```markdown
Biased: "Users hate our new feature - I saw 5 complaints on Twitter"
→ Availability: Complaints are vivid and recent
→ Ignores: 100,000 users had no issues
→ Decision: Rollback feature

Debiased: "Observed: 5 complaints on Twitter"
→ Statistical reasoning: 5 / 100,000 = 0.005% complaint rate
→ Check historical data: Previous features had 0.002% complaint rate
→ Analysis: Slightly elevated but within normal range
→ Decision: Monitor closely, but don't rollback yet
→ Follow-up: Investigate those 5 cases for legitimate issues
```

---

### 1.3 Anchoring Bias

**Definition**: Over-relying on the first piece of information encountered (the "anchor") when making decisions.

**Manifestation**:
- Initial estimates influence final values
- First number suggested affects negotiations
- Price comparisons biased by initial price
- Even random numbers can anchor judgments

**Why It Occurs**:
- Adjustment from anchor is typically insufficient
- Anchors provide a cognitive starting point
- Even irrelevant anchors affect System 1 processing

**Vulnerable Reasoning Types**:
- Quantitative (influenced by first number)
- Comparative (biased comparison baseline)
- Estimative (insufficient adjustment)

**Defeating Reasoning Types**:
- **Multiple Reference Point Reasoning** → Use several anchors
- **Independent Reasoning** → Estimate without seeing others' estimates
- **Systematic Reasoning** → Use structured estimation (e.g., Fermi)
- **Critical Reasoning** → Question the anchor's relevance
- **Bayesian Reasoning** → Weight anchor by information quality

**Detection Signals**:
- ⚠️ Final estimate close to initial number
- ⚠️ Insufficient adjustment from starting point
- ⚠️ Negotiation influenced by first offer
- ⚠️ Using irrelevant numbers as reference

**Mitigation Protocol**:
```
1. Make own estimate BEFORE seeing others' estimates
2. Use multiple reference points
3. Estimate from different starting points (top-down and bottom-up)
4. Question: "Is this anchor relevant?"
5. Use structured estimation (Fermi, reference class)
```

**Example - Project Estimation**:
```markdown
Biased: 
Manager: "I think this will take 2 weeks"
Developer: "Hmm, maybe 2.5 weeks"
→ Anchored on manager's estimate
→ Insufficient adjustment upward
→ Actual: 6 weeks

Debiased:
1. Developer estimates independently: Break down tasks
   - API: 4 days
   - Frontend: 5 days  
   - Testing: 3 days
   - Integration: 2 days
   - Buffer (50%): 7 days
   - Total: ~4 weeks
   
2. Then sees manager's estimate: 2 weeks

3. Resolves discrepancy:
   - Manager's assumptions: Simpler scope
   - Developer's assumptions: Includes thorough testing
   
4. Discussion leads to realistic: 3-4 weeks with clear scope
```

---

### 1.4 Recency Bias

**Definition**: Overweighting recent events relative to earlier events.

**Manifestation**:
- Latest data point influences decision disproportionately
- Recent failures lead to overcorrection
- Recent successes lead to overconfidence
- Trend extrapolation from recent data

**Why It Occurs**:
- Recent information is most accessible (availability)
- Recent events feel more relevant
- Emotional impact of recent events stronger

**Vulnerable Reasoning Types**:
- Inductive (overweighting recent data)
- Temporal (misjudging time-weighted importance)
- Trend analysis (seeing trends in noise)

**Defeating Reasoning Types**:
- **Statistical Reasoning** → Equal weighting or proper time-discounting
- **Temporal Reasoning** → Consider full time series
- **Systematic Reasoning** → Comprehensive historical analysis
- **Trend Analysis** → Distinguish signal from noise
- **Moving Average Thinking** → Smooth over time periods

**Detection Signals**:
- ⚠️ Overreacting to latest data point
- ⚠️ Extrapolating recent trends indefinitely
- ⚠️ Ignoring historical patterns
- ⚠️ "This time is different" thinking

**Mitigation Protocol**:
```
1. Plot data over extended time period
2. Calculate moving averages
3. Check: Is recent data representative?
4. Look for cyclical patterns
5. Weight data appropriately by relevance, not recency
```

**Example - Algorithm Performance**:
```markdown
Biased:
Recent tests: Algorithm A faster than B
→ Switch to Algorithm A
→ Ignores: 6 months of data showing B superior overall
→ Reason for recent difference: Unusual data distribution

Debiased:
1. Plot performance over 6 months
2. Analyze: Recent spike in A's performance unusual
3. Investigate: Recent data had different characteristics
4. Consider: Is recent data representative of production?
5. Decision: Keep Algorithm B, but investigate when A performs better
6. Result: Use A for specific data types, B for general case
```

---

### 1.5 Attentional Bias / Selective Attention

**Definition**: Focusing on some aspects while ignoring others, often based on expectations or emotional salience.

**Manifestation**:
- Noticing evidence that fits narrative
- Missing contrary evidence "in plain sight"
- Attention drawn to emotionally charged information
- Gorilla in the basketball game phenomenon

**Why It Occurs**:
- Limited attentional capacity
- Expectations guide attention
- Emotional content captures attention

**Vulnerable Reasoning Types**:
- Observational (biased perception)
- Evidential (missing evidence)
- Diagnostic (missing symptoms)

**Defeating Reasoning Types**:
- **Systematic Reasoning** → Comprehensive checklists
- **Adversarial Reasoning** → "What am I missing?"
- **Meta-reasoning** → Monitor attention allocation
- **Decompositional Reasoning** → Break down problem to ensure coverage
- **Systematic Observation** → Structured data collection

**Detection Signals**:
- ⚠️ Surprised by "obvious" evidence later
- ⚠️ Focusing on expected findings
- ⚠️ Missing information others notice
- ⚠️ Attention captured by dramatic elements

**Mitigation Protocol**:
```
1. Use comprehensive checklists
2. Ask: "What am I not seeing?"
3. Have others review with fresh eyes
4. Systematic observation protocols
5. Document everything, not just expected findings
```

---

## CATEGORY 2: Meaning-Making Biases

*Problem: We construct meaning from limited information*

### 2.1 Pattern Recognition Bias (Apophenia)

**Definition**: Seeing patterns in random data; perceiving meaningful connections where none exist.

**Manifestation**:
- Finding "trends" in noise
- Seeing causal relationships in coincidences
- Over-interpreting small samples
- Conspiracy theories

**Why It Occurs**:
- Pattern detection was evolutionarily adaptive
- Type I error (false positive) was less costly than Type II
- Randomness feels wrong to human intuition

**Vulnerable Reasoning Types**:
- Inductive (overgeneralization from noise)
- Causal (spurious causation)
- Analogical (false pattern matching)

**Defeating Reasoning Types**:
- **Statistical Reasoning** → Significance testing
- **Probabilistic Reasoning** → Calculate coincidence probability
- **Skeptical Reasoning** → Null hypothesis testing
- **Systematic Reasoning** → Controlled experiments
- **Bayesian Reasoning** → Update conservatively

**Detection Signals**:
- ⚠️ Pattern based on small sample
- ⚠️ No plausible mechanism for pattern
- ⚠️ Pattern fails out-of-sample testing
- ⚠️ Retrofitting explanations to data

**Mitigation Protocol**:
```
1. Check sample size: Adequate for pattern detection?
2. Test out-of-sample: Does pattern hold on new data?
3. Consider null hypothesis: Could this be random?
4. Calculate p-value or Bayes factor
5. Require plausible causal mechanism
```

**Example - Data Science**:
```markdown
Biased:
"Sales increase when CEO wears red tie!"
→ Observed correlation in 5 instances
→ No causal mechanism
→ Small sample, likely coincidence

Debiased:
1. Null hypothesis: No relationship between tie color and sales
2. Calculate: With 10 tie colors and 50 observations, ~5 spurious correlations expected
3. Test: Prospective prediction (predict sales based on tie color)
4. Result: No predictive power
5. Conclusion: Coincidence, not pattern
6. Lesson: Beware multiple comparisons (p-hacking)
```

---

### 2.2 Clustering Illusion

**Definition**: Tendency to see clusters in random data.

**Manifestation**:
- "Hot hand" in basketball
- "Streaks" in gambling
- Cancer clusters near power lines
- Finding structure in random spatial data

**Why It Occurs**:
- Poor intuition for randomness
- Random distributions have apparent clusters
- Motivated reasoning to find patterns

**Vulnerable Reasoning Types**:
- Inductive (false pattern detection)
- Spatial reasoning (misinterpreting clusters)

**Defeating Reasoning Types**:
- **Statistical Reasoning** → Randomization tests
- **Probabilistic Reasoning** → Expected cluster size in random data
- **Simulation Reasoning** → Generate random data for comparison
- **Skeptical Reasoning** → Challenge cluster interpretation

**Detection Signals**:
- ⚠️ Cluster in spatial/temporal data
- ⚠️ No adjustment for multiple testing
- ⚠️ Small sample size
- ⚠️ Post-hoc pattern identification

**Mitigation Protocol**:
```
1. Generate random data with same properties
2. Compare observed clusters to random expectation
3. Adjust for multiple testing (many possible clusters)
4. Require independent confirmation
5. Check for plausible causal mechanism
```

---

### 2.3 Narrative Fallacy

**Definition**: Constructing coherent stories to explain past events, even when events were largely random.

**Manifestation**:
- Hindsight bias ("I knew it all along")
- Creating causal explanations for chance events
- Success/failure attribution to skill vs. luck
- Historical narratives that "explain" random walk

**Why It Occurs**:
- Humans are storytelling creatures
- Narratives are memorable and satisfying
- Coherence feels like truth

**Vulnerable Reasoning Types**:
- Narrative reasoning (overfitting stories)
- Causal reasoning (spurious causation)
- Historical reasoning (deterministic narratives)

**Defeating Reasoning Types**:
- **Probabilistic Reasoning** → Acknowledge role of chance
- **Counterfactual Reasoning** → "What if differently?"
- **Statistical Reasoning** → Variance decomposition (skill vs. luck)
- **Meta-reasoning** → Recognize narrative construction
- **Skeptical Reasoning** → Question coherent explanations

**Detection Signals**:
- ⚠️ Story explains everything perfectly
- ⚠️ No acknowledgment of chance/luck
- ⚠️ Deterministic language ("had to happen")
- ⚠️ Ignoring near-misses and alternatives

**Mitigation Protocol**:
```
1. Decompose outcome: skill vs. luck components
2. Consider: "What role did chance play?"
3. Identify alternative paths that nearly happened
4. Resist "single cause" explanations
5. Acknowledge uncertainty and randomness
```

**Example - Startup Success**:
```markdown
Biased:
"We succeeded because of our brilliant strategy"
→ Narrative: Strategy → Success
→ Ignores: Market timing, luck, survivor bias

Debiased:
"Our success resulted from:
- Strategy (estimated 30% contribution)
- Market timing (30% - entered during boom)
- Luck (40% - key competitor failed due to founder conflict)
  
Evidence: 10 similar startups with similar strategies; only 2 succeeded.
Success had large luck component."

Lesson: Beware attributing outcomes entirely to decisions.
Success may not be replicable; failure may not indicate poor decisions.
```

---

### 2.4 Stereotyping / Base Rate Neglect

**Definition**: Ignoring statistical base rates in favor of individuating information or stereotypes.

**Manifestation**:
- Judging probability by representativeness, not base rate
- Ignoring prevalence when assessing likelihood
- Overweighting specific details vs. general probabilities
- "Linda problem" (conjunction fallacy)

**Why It Occurs**:
- Specific details are more concrete and available
- System 1 judges by similarity, not probability
- Base rates are abstract and less salient

**Vulnerable Reasoning Types**:
- Probabilistic (ignoring priors)
- Diagnostic (false positive/negative rates)
- Inductive (overgeneralizing from cases)

**Defeating Reasoning Types**:
- **Bayesian Reasoning** → Always start with base rate
- **Statistical Reasoning** → Calculate actual probabilities
- **Systematic Reasoning** → Force consideration of base rates
- **Quantitative Reasoning** → Run the numbers
- **Critical Reasoning** → Challenge intuitive probabilities

**Detection Signals**:
- ⚠️ Intuitive probability contradicts calculation
- ⚠️ Focusing on details, ignoring prevalence
- ⚠️ Conjunction fallacy (A&B seems more likely than A)
- ⚠️ Diagnostic thinking without base rates

**Mitigation Protocol**:
```
1. ALWAYS start with base rate: "What's the prevalence?"
2. Calculate: P(A|B) using Bayes theorem
3. Consider: False positive and false negative rates
4. Compare intuition to calculation
5. Update from base rate proportional to evidence quality
```

**Example - Medical Testing**:
```markdown
Biased:
Test positive for rare disease → "I probably have it"
→ Ignores base rate (disease is rare)
→ Ignores false positive rate

Debiased:
Disease prevalence: 1 in 10,000
Test sensitivity: 99% (true positive rate)
Test specificity: 95% (true negative rate)

Bayesian calculation:
Prior: 0.0001 (base rate)
P(positive | disease) = 0.99
P(positive | no disease) = 0.05

P(disease | positive) = (0.99 × 0.0001) / [(0.99 × 0.0001) + (0.05 × 0.9999)]
                     = 0.000099 / 0.050094
                     = 0.002 = 0.2%

Conclusion: Even with positive test, only 0.2% chance of disease
due to low base rate and false positive rate.
```

---

### 2.5 Fundamental Attribution Error

**Definition**: Overattributing others' behavior to personality while underweighting situational factors.

**Manifestation**:
- "They failed because they're incompetent" (vs. difficult situation)
- "They succeeded because they're talented" (vs. lucky/easy task)
- Judging others by actions, self by intentions
- Underestimating situational constraints

**Why It Occurs**:
- Person is salient, situation is invisible
- Cognitive ease (personality explanations are simple)
- Actor-observer asymmetry

**Vulnerable Reasoning Types**:
- Causal reasoning (misattribution of causation)
- Social reasoning (misjudging others' motivations)
- Analogical reasoning (false analogies between situations)

**Defeating Reasoning Types**:
- **Contextual Reasoning** → Consider full situation
- **Empathetic Reasoning** → Imagine in their situation
- **Systems Reasoning** → Identify situational constraints
- **Counterfactual Reasoning** → "Would I behave differently?"
- **Systematic Reasoning** → Check base rate of behavior in situation

**Detection Signals**:
- ⚠️ Personality-based explanations without considering situation
- ⚠️ Different standards for self vs. others
- ⚠️ Quick judgments about competence
- ⚠️ Ignoring environmental factors

**Mitigation Protocol**:
```
1. Ask: "What situational factors might explain this?"
2. Consider: "Would I behave differently in that situation?"
3. Look for: Constraints, incentives, information asymmetries
4. Check: Is this person's behavior typical for this situation?
5. Reserve judgment until understanding full context
```

---

## CATEGORY 3: Fast Decision Biases

*Problem: Need to act quickly, we jump to conclusions*

### 3.1 Sunk Cost Fallacy

**Definition**: Continuing investment because of past investment, rather than based on future costs/benefits.

**Manifestation**:
- "We've already spent $1M, can't stop now"
- Continuing failed projects due to past effort
- Throwing good money after bad
- "Waste not, want not" reasoning

**Why It Occurs**:
- Loss aversion (hate to admit loss)
- Desire for consistency
- Honor past commitments/decisions
- Emotional attachment to past investment

**Vulnerable Reasoning Types**:
- Economic (ignoring opportunity costs)
- Decision-making (past-weighted rather than future-weighted)
- Strategic (escalation of commitment)

**Defeating Reasoning Types**:
- **Forward-Looking Reasoning** → Only consider future costs/benefits
- **Opportunity Cost Reasoning** → "What else could we do?"
- **Rational Economic Reasoning** → Sunk costs are irrelevant
- **Strategic Reasoning** → Evaluate based on current situation
- **Counterfactual Reasoning** → "If starting fresh, would we do this?"

**Detection Signals**:
- ⚠️ Justifying continuation by past investment
- ⚠️ "We've come too far to quit"
- ⚠️ Emotional attachment to failing project
- ⚠️ Ignoring opportunity costs

**Mitigation Protocol**:
```
1. State decision problem from current position
2. Ignore all sunk costs (past investment)
3. Consider ONLY future costs and benefits
4. Ask: "If starting fresh today, would we pursue this?"
5. Consider opportunity cost of continuation
6. Make decision based on forward-looking analysis
```

**Example - Software Project**:
```markdown
Biased:
"We've spent 6 months building this architecture, we can't abandon it now"
→ Sunk cost: 6 months
→ Continuing despite better alternatives emerging

Debiased:
Current situation:
- Existing architecture: 80% complete
- Estimated time to finish: 4 months
- Ongoing maintenance: High (complex, hard to debug)

Alternative:
- New framework emerged: Better design
- Time to implement: 2 months
- Ongoing maintenance: Low (simpler, well-supported)

Forward-looking analysis:
Option A (finish current): 4 months + high maintenance forever
Option B (switch): 2 months + low maintenance forever

Decision: Switch to new framework
Reasoning: Sunk cost (6 months) is irrelevant. Future costs/benefits favor switching.
```

---

### 3.2 Overconfidence Bias

**Definition**: Overestimating one's abilities, knowledge, or the accuracy of one's beliefs.

**Manifestation**:
- Narrow confidence intervals
- Overestimating prediction accuracy
- Underestimating task difficulty/time
- Illusion of control

**Why It Occurs**:
- Ignorance of ignorance (Dunning-Kruger)
- Confirmation bias reinforcement
- Evolutionary advantage of confidence
- Asymmetric feedback (don't learn from near-misses)

**Vulnerable Reasoning Types**:
- Predictive (overconfident forecasts)
- Estimative (too narrow ranges)
- Planning (planning fallacy)

**Defeating Reasoning Types**:
- **Probabilistic Reasoning** → Express uncertainty quantitatively
- **Reference Class Forecasting** → Compare to similar past cases
- **Meta-reasoning** → Assess one's own knowledge limits
- **Statistical Reasoning** → Track calibration
- **Bayesian Reasoning** → Update conservatively

**Detection Signals**:
- ⚠️ Narrow confidence intervals
- ⚠️ Surprised by outcomes frequently
- ⚠️ "I'm sure" statements without uncertainty
- ⚠️ Underestimating time/difficulty consistently

**Mitigation Protocol**:
```
1. Make probabilistic predictions (not binary)
2. Track calibration: Am I right as often as I think?
3. Reference class: How accurate are experts in this domain?
4. Widen confidence intervals (add uncertainty)
5. Consider: "What could go wrong?"
6. Use outside view: Base rates for similar situations
```

**Example - Project Estimation**:
```markdown
Biased:
"This will take 2 weeks, I'm certain"
→ Overconfidence in estimate
→ Doesn't account for unknowns
→ Actual: 6 weeks

Debiased:
1. Reference class: Past similar projects took 4-8 weeks
2. Inside view: Breaking down tasks suggests 3 weeks
3. Consider unknowns: Integration issues, requirement changes
4. Probabilistic estimate:
   - 10% confidence: 2 weeks (if everything perfect)
   - 50% confidence: 4 weeks (median outcome)
   - 90% confidence: 7 weeks (accounts for problems)
   
5. Communicate: "4 weeks is most likely, but could range 3-7 weeks depending on integration issues"

Result: More accurate, allows for planning buffer
```

---

### 3.3 Planning Fallacy

**Definition**: Underestimating time, costs, and risks of future actions while overestimating benefits.

**Manifestation**:
- Projects consistently over budget and late
- Underestimating task duration
- Optimistic scenario planning
- "This time will be different"

**Why It Occurs**:
- Inside view focuses on specific plan
- Ignores base rates (reference class)
- Optimism bias
- Neglecting unknown unknowns

**Vulnerable Reasoning Types**:
- Planning (unrealistic optimism)
- Temporal (misjudging duration)
- Strategic (underestimating obstacles)

**Defeating Reasoning Types**:
- **Reference Class Forecasting** → Use similar past projects
- **Systematic Reasoning** → Break down into subtasks
- **Statistical Reasoning** → Apply historical adjustment factors
- **Pessimistic Reasoning** → Consider what could go wrong
- **Outside View Reasoning** → Step back from specific plan

**Detection Signals**:
- ⚠️ Estimates consistently too optimistic
- ⚠️ Ignoring past similar projects
- ⚠️ Assuming everything will go right
- ⚠️ No buffer for unknowns

**Mitigation Protocol**:
```
1. Reference class: Find similar past projects
2. Calculate typical overrun: E.g., 1.5x-2x time estimates
3. Inside view: Break down specific tasks
4. Combine: Adjust inside view by reference class factor
5. Add explicit buffer for unknowns (20-50%)
6. Track: Build calibration dataset
```

---

### 3.4 Status Quo Bias

**Definition**: Preference for current state; resistance to change even when change would be beneficial.

**Manifestation**:
- Defaulting to existing approach
- Loss aversion (change feels risky)
- Endowment effect (overvaluing what we have)
- "If it ain't broke..." reasoning

**Why It Occurs**:
- Loss aversion (losses loom larger than gains)
- Regret avoidance (change creates responsibility)
- Cognitive ease (current state requires no thought)

**Vulnerable Reasoning Types**:
- Decision-making (defaulting to status quo)
- Comparative (biased toward current option)
- Risk assessment (overweighting change risk)

**Defeating Reasoning Types**:
- **Comparative Reasoning** → Fair comparison of alternatives
- **Counterfactual Reasoning** → "If starting fresh, what would we choose?"
- **Opportunity Cost Reasoning** → Cost of NOT changing
- **Forward-Looking Reasoning** → Future-oriented analysis
- **Systematic Reasoning** → Structured evaluation

**Detection Signals**:
- ⚠️ "We've always done it this way"
- ⚠️ Asymmetric standards (change must prove itself, status quo doesn't)
- ⚠️ Focusing on risks of change, ignoring risks of no change
- ⚠️ Default option not properly evaluated

**Mitigation Protocol**:
```
1. Frame as fresh decision: "If choosing today, what would we pick?"
2. Evaluate status quo with same rigor as alternatives
3. Consider opportunity cost: "What are we giving up by not changing?"
4. Assess risks of BOTH changing and not changing
5. Set decision criteria independent of current state
```

---

## CATEGORY 4: Memory Biases

*Problem: We distort and reinforce some memories*

### 4.1 Hindsight Bias ("I Knew It All Along")

**Definition**: After an event, believing you predicted it before it happened.

**Manifestation**:
- "I knew that would happen"
- Outcome seems inevitable in retrospect
- Inability to reconstruct pre-outcome beliefs
- Judging past decisions by outcomes, not process

**Why It Occurs**:
- Memory reconstruction integrates outcome knowledge
- Coherence bias (mind creates consistent narrative)
- Outcome knowledge automatically influences memory

**Vulnerable Reasoning Types**:
- Historical reasoning (deterministic narratives)
- Evaluative reasoning (outcome-based evaluation)
- Narrative reasoning (retrofitting stories)

**Defeating Reasoning Types**:
- **Counterfactual Reasoning** → "What else could have happened?"
- **Prospective Recording** → Document predictions in advance
- **Process-Based Evaluation** → Judge decisions by process, not outcome
- **Probabilistic Reasoning** → Remember multiple possible outcomes existed
- **Meta-reasoning** → Recognize hindsight bias operation

**Detection Signals**:
- ⚠️ "It was obvious" statements after the fact
- ⚠️ Inability to remember past uncertainty
- ⚠️ Judging decisions by outcomes alone
- ⚠️ Deterministic language about past

**Mitigation Protocol**:
```
1. Document predictions/beliefs BEFORE outcomes known
2. Keep decision journal with reasoning
3. Evaluate decisions by PROCESS (info available, reasoning quality)
4. Remember: Multiple outcomes were possible
5. Ask: "What probability did I assign beforehand?"
```

**Example - Investment Decision**:
```markdown
Biased (post-market crash):
"I knew the market was overvalued, should have sold"
→ Hindsight bias: Before crash, was uncertain
→ Outcome knowledge distorts memory of prior beliefs

Debiased:
Pre-crash decision journal entry:
"Market at all-time high. Valuation metrics elevated.
Could continue up (40% probability) or correct (60% probability).
Decision: Reduce position by 30%, maintain 70% exposure.
Reasoning: Balance risk of missing further gains vs. drawdown protection."

Post-crash evaluation:
"My assessment of 60% probability of correction was reasonable.
Decision to reduce by only 30% was conservative given uncertainty.
Process was sound even though outcome was negative.
Learning: Consider larger position reduction when valuations extreme."

Avoids: Claiming I "knew" crash would happen
Focuses: On quality of reasoning process, not outcome
```

---

### 4.2 Rosy Retrospection

**Definition**: Remembering past events more positively than they were experienced.

**Manifestation**:
- "Good old days" thinking
- Underestimating past difficulties
- Nostalgia bias
- Memory fading for negative experiences

**Why It Occurs**:
- Negative emotions fade faster than positive (fading affect bias)
- Peak-end rule (remember peaks and end, not average)
- Meaning-making smooths rough edges

**Vulnerable Reasoning Types**:
- Historical reasoning (biased historical assessment)
- Comparative reasoning (unfair comparisons to past)

**Defeating Reasoning Types**:
- **Evidential Reasoning** → Consult contemporary records
- **Systematic Reasoning** → Documented assessment
- **Critical Reasoning** → Challenge rosy memories
- **Quantitative Reasoning** → Check objective metrics from past

**Detection Signals**:
- ⚠️ "Back in my day..." narratives
- ⚠️ Idealized past vs. problematic present
- ⚠️ Surprise when checking old records
- ⚠️ Nostalgia influencing decisions

**Mitigation Protocol**:
```
1. Consult contemporary documents, not memory
2. Check objective metrics from the time
3. Remember: Negative experiences fade faster
4. Ask others who were there
5. Question whether past was really better
```

---

### 4.3 Choice-Supportive Bias

**Definition**: Remembering chosen options more positively and rejected options more negatively than they actually were.

**Manifestation**:
- Retroactive justification
- Misremembering features of chosen vs. rejected options
- Cognitive dissonance reduction
- "I made the right choice" bias

**Why It Occurs**:
- Cognitive dissonance reduction
- Self-justification
- Memory reconstruction favors consistency

**Vulnerable Reasoning Types**:
- Evaluative (biased evaluation of past choices)
- Comparative (unfair retrospective comparisons)

**Defeating Reasoning Types**:
- **Evidential Reasoning** → Check contemporaneous records
- **Critical Reasoning** → Honest post-mortem
- **Counterfactual Reasoning** → "What if I'd chosen differently?"
- **Meta-reasoning** → Recognize self-justification

**Detection Signals**:
- ⚠️ Remembering chosen option as better than it was
- ⚠️ Forgetting problems with choice
- ⚠️ Retroactive rationalization
- ⚠️ Inability to admit mistakes

**Mitigation Protocol**:
```
1. Document pros/cons of ALL options before deciding
2. Conduct honest post-decision review
3. Track: Did benefits/costs match expectations?
4. Be willing to admit: "I would choose differently now"
5. Learn from decisions without self-justification
```

---

## CATEGORY 5: Social/Group Biases

*Problem: Group dynamics distort individual reasoning*

### 5.1 Groupthink

**Definition**: Desire for harmony/conformity results in irrational or dysfunctional decision-making.

**Manifestation**:
- Suppression of dissenting views
- Illusion of unanimity
- Pressure to conform
- Self-censorship
- Collective rationalization

**Why It Occurs**:
- Social cohesion desire
- Authority deference
- Fear of ostracism
- Cascade effects

**Vulnerable Reasoning Types**:
- Group reasoning (conformity pressure)
- Social reasoning (valuing harmony over truth)
- Decision-making (premature consensus)

**Defeating Reasoning Types**:
- **Adversarial Reasoning** → Institutionalized devil's advocate
- **Dialectical Reasoning** → Structured debate
- **Critical Reasoning** → Encourage criticism
- **Independent Reasoning** → Anonymous voting/input
- **Meta-reasoning** → Monitor group dynamics

**Detection Signals**:
- ⚠️ Rapid consensus without debate
- ⚠️ Illusion of unanimity
- ⚠️ Suppression of doubts
- ⚠️ Stereotyping of out-groups
- ⚠️ Self-censorship

**Mitigation Protocol**:
```
1. Assign devil's advocate role (rotate)
2. Leader withholds opinion until after discussion
3. Anonymous idea submission/voting
4. Bring in outside perspectives
5. Break into subgroups, then reconvene
6. Encourage dissent explicitly
7. Second-chance meeting after initial decision
```

---

### 5.2 Authority Bias

**Definition**: Tendency to attribute greater accuracy/weight to opinions of authority figures.

**Manifestation**:
- Deferring to experts beyond their expertise
- Following orders without questioning
- Overweighting senior person's opinion
- Milgram experiment effects

**Why It Occurs**:
- Evolutionary adaptation (hierarchies)
- Cognitive ease (defer rather than evaluate)
- Social consequences of challenging authority

**Vulnerable Reasoning Types**:
- Social reasoning (inappropriate deference)
- Evidential reasoning (authority as evidence)

**Defeating Reasoning Types**:
- **Critical Reasoning** → Evaluate argument, not source
- **Evidential Reasoning** → Weigh evidence quality directly
- **Independent Reasoning** → Form own view first
- **Meta-reasoning** → Notice authority influence
- **Adversarial Reasoning** → Challenge authority view

**Detection Signals**:
- ⚠️ "Expert said so" without evaluating reasoning
- ⚠️ Deference beyond domain of expertise
- ⚠️ Inability to disagree with senior person
- ⚠️ Not checking authority's evidence

**Mitigation Protocol**:
```
1. Evaluate argument quality, not source authority
2. Check: Is authority actually expert in THIS domain?
3. Form independent view before hearing authority
4. Ask authority to explain reasoning
5. Remember: Experts can be wrong
6. Check authority's track record on similar questions
```

---

## Bias-to-Reasoning Type Mapping Summary

| Bias | Primary Defeating Reasoning Types |
|------|----------------------------------|
| Confirmation | Critical, Adversarial, Dialectical, Evidential |
| Availability | Statistical, Systematic, Quantitative, Bayesian |
| Anchoring | Multiple Reference Points, Independent, Systematic |
| Recency | Statistical, Temporal, Systematic, Moving Average |
| Attentional | Systematic, Adversarial, Meta-reasoning, Decompositional |
| Apophenia | Statistical, Probabilistic, Skeptical, Bayesian |
| Clustering Illusion | Statistical, Probabilistic, Simulation |
| Narrative Fallacy | Probabilistic, Counterfactual, Statistical, Meta-reasoning |
| Base Rate Neglect | Bayesian, Statistical, Systematic, Quantitative |
| Attribution Error | Contextual, Empathetic, Systems, Counterfactual |
| Sunk Cost | Forward-Looking, Opportunity Cost, Rational Economic |
| Overconfidence | Probabilistic, Reference Class, Meta-reasoning, Statistical |
| Planning Fallacy | Reference Class, Systematic, Statistical, Outside View |
| Status Quo | Comparative, Counterfactual, Opportunity Cost, Systematic |
| Hindsight | Counterfactual, Prospective Recording, Process-Based |
| Rosy Retrospection | Evidential, Systematic, Critical, Quantitative |
| Choice-Supportive | Evidential, Critical, Counterfactual, Meta-reasoning |
| Groupthink | Adversarial, Dialectical, Critical, Independent |
| Authority | Critical, Evidential, Independent, Adversarial |

---

## Integration with Reasoning Skill

This cognitive bias framework integrates with the existing 110 reasoning types by:

1. **Identifying which reasoning types are vulnerable** to each bias
2. **Specifying which reasoning types counteract** each bias
3. **Providing detection protocols** for each bias
4. **Offering mitigation strategies** using specific reasoning types

**Usage**: When applying any reasoning type, consult this framework to:
- Check for biases that might affect that reasoning type
- Apply countermeasure reasoning types
- Use detection protocols proactively
- Implement mitigation strategies systematically

**Remember**: Bias defeat is not about being perfect, but about:
- **Awareness**: Knowing biases exist and how they operate
- **Detection**: Catching biases in real-time
- **Mitigation**: Systematic reduction through reasoning techniques
- **Calibration**: Improving over time through feedback

---

## Next Steps

1. **Read**: bias_detection_guide.md for real-time detection methods
2. **Study**: bias_mitigation_strategies.md for detailed techniques  
3. **Practice**: debiasing_examples.md for worked examples
4. **Reference**: cognitive_bias_checklist.md before major decisions
5. **Apply**: bias_reasoning_mapping.md for systematic bias-reasoning connections

**The goal**: Make biased reasoning increasingly difficult and debiased reasoning systematically easier.
