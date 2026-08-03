# Quick Reference Guide

## Core Reasoning Types at a Glance

### When You Need Certainty
→ **Deductive Reasoning**
- Mathematical proofs
- Logical analysis
- Type checking
- Formal verification

### When Learning from Data
→ **Inductive Reasoning**
- Pattern recognition
- Machine learning
- Statistical inference
- Trend analysis

### When Explaining Observations
→ **Abductive Reasoning**
- Diagnosis
- Root cause analysis
- Hypothesis generation
- Troubleshooting

### When Choosing Between Options
→ **Comparative Reasoning**
- Algorithm selection
- Technology evaluation
- Design alternatives
- Trade-off analysis

### When Solving Complex Problems
→ **Decompositional Reasoning**
- Breaking down large problems
- Hierarchical analysis
- Modular design
- Step-by-step approaches

### When Working with Constraints
→ **Constraint-Based Reasoning**
- Scheduling
- Resource allocation
- Optimization under limits
- Design within boundaries

### When Predicting Competitor Actions
→ **Game-Theoretic Reasoning**
- Business strategy
- Negotiations
- Market dynamics
- Multi-agent systems

### When Understanding Systems
→ **Systems Reasoning**
- Architecture design
- Ecosystem analysis
- Feedback loops
- Emergent behavior

### When Dealing with Uncertainty
→ **Probabilistic/Bayesian Reasoning**
- Risk assessment
- Confidence estimation
- Belief updating
- Uncertain inference

### When Generating Ideas
→ **Divergent/Creative Reasoning**
- Brainstorming
- Innovation
- Problem reframing
- Novel solutions

## Reasoning Type Decision Tree

```
START: What's the nature of your task?

├─ Need to prove something definitely
│  └─→ DEDUCTIVE (formal logic, mathematics)
│
├─ Learning patterns from examples
│  └─→ INDUCTIVE (generalization, ML)
│
├─ Explaining why something happened
│  └─→ ABDUCTIVE (best explanation)
│     │
│     └─ Is it a technical problem?
│        ├─ Yes → DIAGNOSTIC (troubleshooting)
│        └─ No → CAUSAL (understanding causation)
│
├─ Comparing alternatives
│  └─→ COMPARATIVE + EVALUATIVE
│     │
│     └─ With numbers?
│        ├─ Yes → QUANTITATIVE + OPTIMIZATION
│        └─ No → QUALITATIVE + CRITERIA-BASED
│
├─ Planning for the future
│  └─→ STRATEGIC + SCENARIO
│     │
│     └─ Involves competition?
│        ├─ Yes → GAME-THEORETIC
│        └─ No → MEANS-END
│
├─ Dealing with complex system
│  └─→ SYSTEMS + HOLISTIC
│     │
│     └─ Need detailed understanding?
│        ├─ Yes → MECHANISTIC (how it works)
│        └─ No → EMERGENT (system-level properties)
│
└─ Need new ideas
   └─→ CREATIVE + DIVERGENT
      │
      └─ Then evaluate?
         └─ Yes → Follow with CONVERGENT + CRITICAL
```

## Common Combinations

### Scientific Method
```
OBSERVATION → INDUCTIVE (pattern)
             ↓
         ABDUCTIVE (hypothesis)
             ↓
         DEDUCTIVE (predictions)
             ↓
         EVIDENTIAL (testing)
             ↓
         BAYESIAN (update beliefs)
```

### Engineering Design
```
REQUIREMENTS → ANALYTICAL (understand)
                  ↓
            CONSTRAINT-BASED (limitations)
                  ↓
              DIVERGENT (generate options)
                  ↓
              COMPARATIVE (evaluate)
                  ↓
              OPTIMIZATION (refine)
```

### Debugging
```
SYMPTOM → DIAGNOSTIC (what's wrong)
             ↓
         ABDUCTIVE (why it's happening)
             ↓
         CAUSAL (root cause)
             ↓
         DEDUCTIVE (test fix)
             ↓
         EVIDENTIAL (verify)
```

### Business Strategy
```
SITUATION → ANALYTICAL (understand context)
               ↓
           STRATEGIC (set direction)
               ↓
           SCENARIO (possible futures)
               ↓
        GAME-THEORETIC (competitor response)
               ↓
           DECISION (choose path)
```

## Red Flags: Common Reasoning Errors

### 🚩 Hasty Generalization
**Error**: Too few examples → broad conclusion
**Fix**: Increase sample size, check representativeness

### 🚩 Affirming the Consequent
**Error**: "If P then Q. Q is true. Therefore P."
**Fix**: Remember multiple causes can produce same effect

### 🚩 Correlation ≠ Causation
**Error**: Things correlate → one causes other
**Fix**: Consider confounds, use causal reasoning

### 🚩 Circular Reasoning
**Error**: Conclusion assumes what it's trying to prove
**Fix**: Ensure premises are independent

### 🚩 False Dichotomy
**Error**: Only considering two options
**Fix**: Generate more alternatives (divergent reasoning)

### 🚩 Confirmation Bias
**Error**: Only seeking supporting evidence
**Fix**: Actively seek disconfirming evidence

### 🚩 Anchoring Bias
**Error**: Over-relying on first information
**Fix**: Consider multiple reference points

### 🚩 Analysis Paralysis
**Error**: Over-analyzing, never deciding
**Fix**: Set decision criteria and deadlines

### 🚩 Premature Closure
**Error**: Jumping to first explanation
**Fix**: Generate multiple hypotheses (abductive reasoning)

### 🚩 Base Rate Neglect
**Error**: Ignoring prior probabilities
**Fix**: Use Bayesian reasoning

## Reasoning Quality Checklist

### Before You Begin
- [ ] Identified the type of problem
- [ ] Selected appropriate reasoning type(s)
- [ ] Understood what information is available
- [ ] Recognized constraints and limitations
- [ ] Set clear goals for reasoning task

### During Reasoning
- [ ] Making assumptions explicit
- [ ] Showing intermediate steps
- [ ] Checking for logical validity
- [ ] Considering alternative explanations
- [ ] Using appropriate level of precision
- [ ] Acknowledging uncertainty appropriately

### After Reasoning
- [ ] Conclusion follows from premises
- [ ] Limitations acknowledged
- [ ] Confidence level appropriate
- [ ] Key assumptions stated
- [ ] Alternative views considered
- [ ] Reasoning process documentable

## Domain Quick Reference

### Software Development
**Primary**: Algorithmic, Systematic, Decompositional, Diagnostic
**Secondary**: Comparative, Constraint-based, Optimization
**Common**: Code reviews, debugging, architecture, performance

### Data Science
**Primary**: Statistical, Probabilistic, Inductive, Evidential
**Secondary**: Creative (feature engineering), Comparative (model selection)
**Common**: Analysis, modeling, interpretation, validation

### Scientific Research
**Primary**: Inductive, Abductive, Deductive, Evidential
**Secondary**: Bayesian, Statistical, Systematic
**Common**: Hypothesis testing, experimentation, theory development

### Business Strategy
**Primary**: Strategic, Game-theoretic, Scenario, Comparative
**Secondary**: Quantitative, Optimization, Risk-based
**Common**: Planning, competition analysis, investment decisions

### Product Design
**Primary**: Creative, Divergent/Convergent, Systems, User-centered
**Secondary**: Constraint-based, Comparative, Evaluative
**Common**: Ideation, prototyping, testing, iteration

### Legal Analysis
**Primary**: Analogical (precedent), Evidential, Normative
**Secondary**: Deductive (rule application), Dialectical
**Common**: Case analysis, argumentation, interpretation

### Medical Practice
**Primary**: Diagnostic, Abductive, Probabilistic, Evidential
**Secondary**: Bayesian, Risk-based, Case-based
**Common**: Diagnosis, treatment planning, prognosis

## Reasoning Tools and Techniques

### For Deductive Reasoning
- Truth tables
- Formal proofs
- Symbolic logic
- Type systems
- Verification tools

### For Inductive Reasoning
- Statistical tests
- Sample size calculations
- Cross-validation
- Trend analysis
- Pattern recognition tools

### For Abductive Reasoning
- 5 Whys
- Fishbone diagrams
- Hypothesis matrices
- Differential diagnosis
- Root cause analysis

### For Creative Reasoning
- Brainstorming
- Mind mapping
- SCAMPER technique
- Random input
- Analogical thinking

### For Analytical Reasoning
- Decomposition trees
- SWOT analysis
- Decision matrices
- Force field analysis
- Pareto analysis

### For Systems Reasoning
- Causal loop diagrams
- Stock-and-flow models
- System archetypes
- Leverage points analysis
- Feedback loop identification

## Emergency Quick Guide

### "I'm Stuck - What Should I Do?"

1. **Identify where you're stuck**
   - Don't understand the problem? → Use ANALYTICAL reasoning
   - Can't generate ideas? → Switch to DIVERGENT reasoning
   - Too many options? → Use COMPARATIVE + EVALUATIVE reasoning
   - Don't know if solution is correct? → Use CRITICAL reasoning

2. **Try a different reasoning mode**
   - Been using deductive? Try inductive.
   - Been analyzing? Try synthesizing.
   - Been thinking convergently? Try divergent.

3. **Step back and meta-reason**
   - Am I using the right approach?
   - What assumptions am I making?
   - Am I missing something obvious?
   - Would a different perspective help?

4. **Consult examples**
   - Find similar problems in reference files
   - See how they were approached
   - Adapt the reasoning pattern

5. **Break down the problem**
   - Use DECOMPOSITIONAL reasoning
   - Solve parts independently
   - Integrate solutions

## Practical Tips

### Communicate Your Reasoning
```
BAD:  "The answer is X."
GOOD: "Using deductive reasoning from premises A and B, 
       the conclusion must be X because..."
```

### Make Assumptions Explicit
```
BAD:  "This will work."
GOOD: "This will work, assuming:
       1. Users have modern browsers
       2. Network latency < 100ms
       3. Database can handle 1000 QPS"
```

### Qualify Uncertainty
```
BAD:  "This is the cause."
GOOD: "This is the most likely cause (80% confidence) because
       it explains symptoms A, B, and C. Alternative explanations
       include..."
```

### Show Your Work
```
BAD:  [Jump to answer]
GOOD: Step 1: [reasoning type used]
      Step 2: [reasoning type used]
      Step 3: [reasoning type used]
      Therefore: [conclusion]
```

## Final Reminders

1. **No single reasoning type is always best** - Match the type to the task
2. **Combine types for complex problems** - Real problems need multiple approaches
3. **Be explicit about your reasoning** - Makes it easier to find errors
4. **Practice identifying reasoning types** - Improves both analysis and communication
5. **Stay flexible** - Be ready to switch approaches if one isn't working
6. **Remember limitations** - Every reasoning type has weaknesses
7. **Verify your conclusions** - Good reasoning includes self-checking

## Getting Help

If you need more information:
- Detailed examples → `examples/` directory
- Reasoning patterns → `references/reasoning_patterns.md`
- Domain mappings → `references/domain_mappings.md`
- Main framework → `SKILL.md`
