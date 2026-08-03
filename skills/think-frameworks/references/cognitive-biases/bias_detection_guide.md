# Bias Detection Guide: Real-Time Identification Methods

## Overview

This guide provides practical, real-time methods for detecting cognitive biases as they occur in your reasoning process. Unlike the framework which catalogues biases, this guide focuses on *catching yourself* in the act of biased thinking.

**Philosophy**: You cannot eliminate biases (they're hardwired), but you can detect and correct them systematically.

---

## The Three-Layer Detection System

### Layer 1: Automatic Warning Signs (System 1 Alerts)
Physical/emotional signals that bias may be present

### Layer 2: Structured Questioning (System 2 Checks)
Deliberate protocols to check for specific biases

### Layer 3: External Validation (Social/Environmental)
Outside perspectives and forcing functions

---

## LAYER 1: Automatic Warning Signs

### Emotional Red Flags

**Strong Emotional Response**
- ⚠️ **What it signals**: Confirmation bias, motivated reasoning, identity-protective cognition
- **Detection**: Notice when you feel defensive, angry, or euphoric about a conclusion
- **Action**: Pause and ask: "Am I reasoning to the truth or to my desired conclusion?"

**Immediate Certainty**
- ⚠️ **What it signals**: Overconfidence, premature closure, anchoring
- **Detection**: Notice "I'm absolutely certain" feelings without analysis
- **Action**: Force yourself to generate alternative explanations

**Discomfort with Dissent**
- ⚠️ **What it signals**: Groupthink, authority bias, conformity pressure
- **Detection**: Notice irritation when someone disagrees
- **Action**: Actively seek out disagreement; thank dissenters

**"Aha!" Feeling Too Soon**
- ⚠️ **What it signals**: Apophenia, narrative fallacy, premature pattern recognition
- **Detection**: Pattern recognition feels satisfying before adequate testing
- **Action**: Generate null hypothesis; test rigorously

**Reluctance to Change Course**
- ⚠️ **What it signals**: Sunk cost fallacy, choice-supportive bias, escalation of commitment
- **Detection**: Notice attachment to failing course of action
- **Action**: Reframe as fresh decision ignoring sunk costs

---

### Linguistic Red Flags

**Absolute Language**
- ⚠️ **Phrases**: "Always", "Never", "Everyone knows", "Obviously"
- **Signals**: Overconfidence, false consensus
- **Correction**: Add probabilistic language: "Usually", "Typically", "Evidence suggests"

**Defensive Justification**
- ⚠️ **Phrases**: "Yes, but...", "That's different because...", "You don't understand..."
- **Signals**: Confirmation bias, rationalization
- **Correction**: Steel-man the opposing view before defending

**Retrospective Certainty**
- ⚠️ **Phrases**: "I knew that would happen", "It was obvious", "Predictable"
- **Signals**: Hindsight bias
- **Correction**: Check contemporaneous predictions

**Authority Appeals**
- ⚠️ **Phrases**: "Expert X said so", "Studies show", "Everyone agrees"
- **Signals**: Authority bias, bandwagon effect
- **Correction**: Evaluate the evidence, not the source's prestige

**Status Quo Defense**
- ⚠️ **Phrases**: "We've always done it this way", "If it ain't broke...", "That's how things are"
- **Signals**: Status quo bias, inertia
- **Correction**: Reframe as fresh choice

---

### Cognitive Red Flags

**Single Data Point Influence**
- ⚠️ **What it signals**: Availability bias, recency bias, anecdotal reasoning
- **Detection**: One example strongly influences judgment
- **Action**: Seek comprehensive data; calculate base rates

**Speed of Conclusion**
- ⚠️ **What it signals**: Multiple biases (depends on context)
- **Detection**: Arriving at conclusion without deliberate analysis
- **Action**: Force System 2 engagement; deliberate reasoning

**Selective Attention**
- ⚠️ **What it signals**: Confirmation bias, attentional bias
- **Detection**: Noticing only evidence that fits narrative
- **Action**: Systematic evidence review; seek disconfirming evidence

**Coherent Story**
- ⚠️ **What it signals**: Narrative fallacy, hindsight bias
- **Detection**: Explanation fits too perfectly; no loose ends
- **Action**: Look for disconfirming evidence; consider chance factors

---

## LAYER 2: Structured Questioning Protocols

### Pre-Decision Bias Check

**Before making any significant decision, run this checklist:**

#### Information Processing
```
□ Have I actively sought disconfirming evidence? (Confirmation bias)
□ Am I overweighting recent/vivid information? (Availability, recency)
□ Is my judgment anchored on the first number I heard? (Anchoring)
□ Have I considered the base rate? (Base rate neglect)
□ Am I seeing patterns in potentially random data? (Apophenia)
```

#### Alternative Generation
```
□ Have I generated at least 3 alternatives? (Premature closure)
□ Have I considered "do nothing" as an option? (Action bias)
□ Would I choose this if starting fresh? (Sunk cost, status quo)
□ What would change my mind? (Confirmation bias)
□ What could go wrong? (Optimism bias)
```

#### Probability & Uncertainty
```
□ Have I expressed uncertainty probabilistically? (Overconfidence)
□ Are my confidence intervals wide enough? (Overconfidence)
□ Am I confusing correlation with causation? (Causal reasoning)
□ Have I considered regression to the mean? (Statistical reasoning)
□ What role could luck/chance play? (Narrative fallacy)
```

#### Social Influences
```
□ Am I going along with the group? (Groupthink)
□ Am I deferring to authority beyond their expertise? (Authority bias)
□ Would I reach this conclusion independently? (Conformity)
□ Is there social pressure affecting my view? (Social desirability)
□ Am I favoring my in-group? (In-group bias)
```

#### Time & Context
```
□ How would I view this in 10 years? (Temporal discounting)
□ Am I accounting for situational factors? (Attribution error)
□ Is this decision reversible? (Risk assessment)
□ What's my mental/emotional state? (Mood effects)
□ Am I rushed or under pressure? (Time pressure effects)
```

---

### The "Consider the Opposite" Technique

**Protocol**: Force consideration of opposite conclusion

**Steps**:
1. **State your current belief/conclusion**
   Example: "This feature will increase user engagement"

2. **Generate opposite conclusion**
   Example: "This feature will decrease user engagement"

3. **List evidence that would support opposite**
   - Users find feature confusing
   - Feature increases friction
   - Similar features failed elsewhere
   - User testing shows negative response

4. **Actively seek that evidence**
   - Run user tests specifically looking for confusion
   - Check analytics for friction points
   - Research similar feature failures
   - Interview users with negative feedback

5. **Bayesian update**
   - How strong is evidence for original view?
   - How strong is evidence for opposite?
   - What's the most accurate probabilistic belief?

---

### The "Pre-Mortem" Technique

**Protocol**: Assume failure, work backward

**When to use**: Before major decisions or projects

**Steps**:
1. **Assume project has failed spectacularly**
   "It's one year from now. The project was a disaster."

2. **Generate failure reasons**
   - What went wrong?
   - Why did it fail?
   - What did we miss?
   - Who/what is responsible?

3. **Identify preventable failures**
   Which failure modes could we prevent?

4. **Build mitigation strategies**
   For each preventable failure, what safeguard?

5. **Revise plan**
   Incorporate mitigation strategies

**Example - Software Launch**:
```
Assumption: "Launch was disastrous"

Failure reasons generated:
- Performance problems at scale (didn't load test adequately)
- Critical security vulnerability (inadequate security review)
- Users couldn't figure out core feature (no usability testing)
- Database corruption on rollout (no backup/rollback plan)
- Key dependency failed (single point of failure)

Mitigations:
- Add load testing to pre-launch checklist
- External security audit required
- Mandatory usability testing with 10+ users
- Document rollback procedure; practice it
- Identify and eliminate single points of failure
```

---

### The "Outside View" Technique

**Protocol**: Reference class forecasting

**When to use**: Planning, estimation, prediction

**Steps**:
1. **Identify reference class**
   Find similar past cases/projects

2. **Gather base rate data**
   What happened in similar cases?
   - Typical outcomes
   - Success/failure rates
   - Time/cost overruns

3. **Your inside view**
   Your specific plan/estimate

4. **Adjust inside view by base rate**
   Blend your estimate with reference class
   - If base rate shows 2x overrun, apply to your estimate
   - If reference class fails 50%, adjust confidence

5. **Identify why you'd be different**
   What makes your case unusual?
   Are reasons convincing?

**Example - Project Estimation**:
```
Inside view: "This will take 4 weeks"

Reference class: Similar projects in our org
- Average duration: 8 weeks
- Median: 7 weeks
- Range: 5-14 weeks
- Success rate (on-time): 20%

Adjusted estimate:
- 50% confidence: 7 weeks (median)
- 70% confidence: 9 weeks
- 90% confidence: 12 weeks

Communicate: "Likely 7-9 weeks, could be up to 12"
```

---

### The "Red Team" Technique

**Protocol**: Adversarial review

**When to use**: Major decisions, strategies, designs

**Steps**:
1. **Assign red team role**
   Specific person(s) argue against decision

2. **Red team prepares**
   - Find weakest points in reasoning
   - Generate counterarguments
   - Identify risks and problems
   - Challenge assumptions

3. **Structured critique**
   Red team presents findings formally

4. **Blue team responds**
   Defenders address each critique

5. **Synthesis**
   - Which critiques are valid?
   - How to address them?
   - Does decision still make sense?

**Important**: Rotate red team role; make it prestigious, not punishing

---

### The "Think-Aloud" Technique

**Protocol**: Externalize reasoning process

**When to use**: Complex decisions, problem-solving

**Steps**:
1. **Verbalize (or write) all thoughts**
   Don't filter; stream of consciousness

2. **Record reasoning**
   Audio, text, or video

3. **Review recording**
   Look for:
   - Logical jumps
   - Unstated assumptions
   - Biased language
   - Emotional influences
   - Premature conclusions

4. **Identify biases**
   Which biases are present?

5. **Re-reason**
   Address identified biases

**Example**:
```
Think-aloud transcript:
"Okay, user engagement is down. Must be the new UI changes. Everyone knows users hate change. Let's roll back."

Review reveals:
- Jumping to conclusion (premature)
- Availability bias (recent UI change salient)
- False consensus ("everyone knows")
- Not considering alternatives

Re-reasoning:
"User engagement down 10%. Changes occurred:
1. New UI (3 days ago)
2. Competitor launched feature (5 days ago)
3. Seasonal trend? (check historical)

Test hypotheses:
- A/B test: Roll back UI for 50% of users
- Survey: Why are users churning?
- Analytics: Which specific metrics down?
- Historical: Is this seasonal pattern?"
```

---

## LAYER 3: External Validation

### Social Checks

**Diverse Perspectives**
- **Method**: Consult people with different backgrounds/viewpoints
- **Defeats**: In-group bias, groupthink, blind spots
- **Implementation**: 
  - Intentionally seek dissimilar viewpoints
  - Include outsiders in decisions
  - Anonymous feedback channels

**Disagreement Seeking**
- **Method**: Explicitly ask people to disagree
- **Defeats**: Confirmation bias, groupthink, authority bias
- **Implementation**:
  - "What am I missing?"
  - "Why might I be wrong?"
  - "What would you do differently?"
  - Reward dissent

**Anonymous Input**
- **Method**: Collect opinions before group discussion
- **Defeats**: Groupthink, authority bias, cascade effects
- **Implementation**:
  - Anonymous surveys
  - Written input before meeting
  - Blind voting

---

### Environmental Forcing Functions

**Decision Journals**
- **Method**: Record decisions, reasoning, and predictions before outcomes known
- **Defeats**: Hindsight bias, choice-supportive bias, rosy retrospection
- **Template**:
```
Date: [Today]
Decision: [What was decided]
Alternatives Considered: [Other options]
Key Factors: [What mattered most]
Prediction: [What I expect to happen]
Confidence: [Probability/range]
Key Uncertainties: [What I don't know]
Decision Process: [How I decided]
Review Date: [When to check back]
```

**Commitment Devices**
- **Method**: Pre-commit to debiasing practices
- **Defeats**: Various (depending on commitment)
- **Examples**:
  - "I will seek 3 disconfirming pieces of evidence before deciding"
  - "I will wait 24 hours before important decisions"
  - "I will explain my reasoning to a skeptic"

**Checklists**
- **Method**: Mandatory checks before actions
- **Defeats**: Attentional bias, premature closure, systematic errors
- **Implementation**:
  - Pre-decision checklist (see above)
  - Pre-launch checklist
  - Post-mortem checklist

**Structured Processes**
- **Method**: Follow defined decision-making process
- **Defeats**: Various biases through systematization
- **Examples**:
  - Architecture Decision Records (ADRs)
  - Post-mortems
  - A/B testing protocols
  - Code review processes

---

## Bias-Specific Detection Protocols

### Detecting Confirmation Bias

**Real-time check**:
1. What evidence would **dis**prove my hypothesis?
2. Am I actively seeking that evidence?
3. When I find contrary evidence, how do I react?
4. Am I interpreting ambiguous evidence as confirmatory?

**Test**: Generate opposite conclusion and find evidence for it

**Correction**: Use critical reasoning; adversarial reasoning

---

### Detecting Availability Bias

**Real-time check**:
1. Is this example coming to mind because it's representative or because it's vivid/recent?
2. What's the actual base rate?
3. Am I being influenced by news coverage?
4. How many cases am I actually considering?

**Test**: Calculate actual frequencies/probabilities

**Correction**: Use statistical reasoning; systematic data collection

---

### Detecting Anchoring

**Real-time check**:
1. What was the first number I heard?
2. Is my estimate close to that number?
3. Did I adjust sufficiently from the anchor?
4. Would I reach a different conclusion starting from a different anchor?

**Test**: Estimate from multiple starting points

**Correction**: Independent estimation; multiple reference points

---

### Detecting Sunk Cost Fallacy

**Real-time check**:
1. Am I justifying this decision based on past investment?
2. Would I choose this option if starting fresh today?
3. Am I ignoring opportunity costs?
4. Is emotional attachment influencing my decision?

**Test**: Reframe as fresh decision

**Correction**: Forward-looking reasoning; opportunity cost analysis

---

### Detecting Overconfidence

**Real-time check**:
1. How often am I surprised by outcomes?
2. Are my confidence intervals too narrow?
3. Am I underestimating task difficulty/duration?
4. What could go wrong that I'm not considering?

**Test**: Track calibration (are you right as often as you think?)

**Correction**: Probabilistic reasoning; reference class forecasting

---

### Detecting Groupthink

**Real-time check**:
1. Is there too much agreement too quickly?
2. Are dissenters being suppressed?
3. Am I self-censoring doubts?
4. Is the group stereotyping out-groups?
5. Do I feel social pressure to agree?

**Test**: Anonymous voting vs. group discussion

**Correction**: Adversarial reasoning; devil's advocate; diverse input

---

## The Daily Bias Awareness Practice

### Morning Intention Setting
```
Today I will watch for:
1. [Specific bias you're working on]
2. [Emotional red flag to monitor]
3. [Situation likely to trigger bias]

I will use:
- [Specific detection technique]
- [Specific correction technique]
```

### Evening Review
```
Today I noticed:
1. [Instance of biased thinking]
2. [How I detected it]
3. [What I did about it]
4. [Outcome]

Tomorrow I will:
1. [Adjustment to practice]
```

---

## Integration with Reasoning Types

When applying any reasoning type from the main skill:

### Before Reasoning
1. Check emotional state (Layer 1 signals)
2. Run relevant bias checklist (Layer 2)
3. Set up forcing functions if major decision (Layer 3)

### During Reasoning
1. Monitor for linguistic red flags
2. Use think-aloud for complex reasoning
3. Apply specific bias detection protocols

### After Reasoning
1. External validation (social checks)
2. Document reasoning (decision journal)
3. Review for biases missed

---

## Meta-Detection: Detecting Blind Spot Bias

**The Meta-Problem**: We're biased about our biases
- We see others' biases easily
- We think we're less biased than we are
- We believe "knowing about bias" makes us immune

**Detection**:
- Ask: "Am I underestimating my own susceptibility?"
- Assume you ARE biased (default position)
- Track: How often do you find biases in yourself vs. others?

**Correction**:
- Meta-reasoning about your reasoning
- Systematic external checks
- Humility about cognitive limits

---

## Quick Reference: Situation-to-Detection-Method

| Situation | Likely Biases | Detection Method |
|-----------|---------------|------------------|
| Group decision | Groupthink, authority | Anonymous input, red team |
| Project planning | Planning fallacy, optimism | Reference class, outside view |
| Hypothesis testing | Confirmation | Consider opposite |
| Pattern recognition | Apophenia | Statistical testing |
| Learning from failure | Hindsight | Decision journal |
| Estimation | Anchoring, overconfidence | Multiple anchors, calibration |
| Continuing project | Sunk cost | Reframe as fresh |
| Quick decision | Various | Pre-decision checklist |
| Evaluating options | Status quo, loss aversion | Forced comparison |
| Post-success | Rosy retrospection, outcome bias | Process evaluation |

---

## Remember

**Bias detection is a skill that improves with practice**

Start with:
1. One bias to focus on this week
2. One detection technique to practice
3. One situation where you'll apply it

**You won't catch every bias**
- That's impossible
- Goal is progressive improvement
- Each detected bias is a victory

**External systems beat willpower**
- Don't rely on remembering to check
- Build forcing functions
- Make debiasing the default

**Feedback is essential**
- Track decisions and outcomes
- Review for biases
- Calibrate your detection
- Iterate and improve

---

**Next**: See bias_mitigation_strategies.md for what to do once you've detected a bias.
