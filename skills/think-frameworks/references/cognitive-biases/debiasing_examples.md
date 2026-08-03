# Debiasing Examples: Worked Cases Across Domains

## Overview

This file provides detailed, real-world examples of detecting and correcting cognitive biases across different domains. Each example shows the full reasoning process: initial biased thinking, bias identification, debiasing technique application, and improved outcome.

---

## SOFTWARE ENGINEERING EXAMPLES

### Example 1: The Sunk Cost Architecture

**Scenario**: Legacy system replacement decision

**Initial Biased Reasoning**:
```
Context: Team has spent 18 months building custom microservices architecture

Biased Thought Process:
"We've invested 18 months into this architecture. The team has put in 
countless hours. We can't just abandon it now. Sure, there are some issues,
but we're 80% done. Just need a few more months to iron out the bugs.

Yes, I know that new framework X would solve our problems faster, but we
can't throw away all this work. That would mean admitting we made a mistake.
The team would be demoralized. Management would question our competence.

Decision: Continue with current architecture."
```

**Bias Identification**:
```
Red Flags Detected:
⚠️ "We've invested 18 months" → Sunk cost fallacy
⚠️ "Can't throw away all this work" → Sunk cost language
⚠️ "Admitting we made a mistake" → Choice-supportive bias
⚠️ "Team would be demoralized" → Rationalization
⚠️ Emotional resistance to changing course → Loss aversion

Biases Present:
1. Sunk Cost Fallacy (primary)
2. Choice-Supportive Bias
3. Loss Aversion  
4. Status Quo Bias
5. Escalation of Commitment
```

**Debiasing Process**:

**Step 1: Reframe as Fresh Decision**
```
Question: "If starting from scratch TODAY, knowing what we know now, 
           would we choose this architecture?"

Honest Answer: No. We'd use Framework X because:
- Solves our core problems out of the box
- Better community support
- Team is already familiar with it from side projects
- Industry best practice for our use case
```

**Step 2: Forward-Looking Cost-Benefit Analysis**
```
Ignore sunk costs (18 months). Consider ONLY future costs/benefits:

Option A: Continue Current Architecture
- Time to MVP: 4-6 months (optimistic)
- Ongoing maintenance: High (custom, complex, few docs)
- Technical debt: Accumulating
- Team satisfaction: Low (frustration evident)
- Risk: High (many unknowns remaining)

Option B: Switch to Framework X
- Time to MVP: 2 months (rewrite core using framework)
- Ongoing maintenance: Low (well-supported, documented)
- Technical debt: Minimal (industry standard patterns)
- Team satisfaction: High (excited about Framework X)
- Risk: Low (proven at scale)

Future-Focused Decision: Switch to Framework X
Sunk 18 months is irrelevant to this decision.
```

**Step 3: Opportunity Cost Analysis**
```
Cost of continuing with Option A:
- 4-6 more months + high ongoing maintenance = WORSE than
- 2 months + low ongoing maintenance

Opportunity cost of NOT switching:
- Missing 4 months of faster development
- Years of higher maintenance burden
- Team burnout and turnover
- Competitive disadvantage

Real cost isn't switching (2 months). 
Real cost is NOT switching (years of inefficiency).
```

**Step 4: Pre-Mortem on Both Options**
```
Pre-Mortem: Continue Current Architecture
"It's 1 year from now. The project failed."
Reasons:
- Took 8 months instead of 4-6 (planning fallacy)
- Technical debt made changes expensive
- Key team members left due to frustration
- Couldn't compete with faster-moving competitors
- Management lost confidence in team

Pre-Mortem: Switch to Framework X
"It's 1 year from now. The switch failed."
Reasons:
- Framework had limitations we didn't foresee (2-week spike to validate)
- Team struggled with learning curve (offer training)
- Lost 2 months of progress (but gained on maintenance)
  
Verdict: Risks of continuing > Risks of switching
```

**Debiased Decision**:
```
Decision: Switch to Framework X

Reasoning:
1. Forward-looking analysis favors switch (2mo vs 4-6mo + maintenance)
2. Sunk cost (18mo) is irrelevant to optimal future path
3. Opportunity cost of NOT switching is massive
4. Pre-mortem shows higher risk in continuing
5. Team enthusiasm is a leading indicator

Communication to stakeholders:
"We've learned that our requirements are better served by Framework X.
Switching will take 2 months but save 4+ months to MVP and reduce 
long-term maintenance. The 18 months taught us what we need, which
informed this better decision."

Action Plan:
- Week 1: Validate framework with spike project
- Week 2: Architecture design using framework
- Weeks 3-8: Implementation
- Week 9: Launch

Expected outcome: MVP in 2 months, lower maintenance forever
```

**Outcome (3 months later)**:
```
Results:
- Switched in 9 weeks (close to estimate)
- Launched MVP on schedule
- Team satisfaction increased significantly
- Maintenance burden dropped 70%
- Velocity increased 2x post-switch
- Management praised decisive course correction

Lessons:
- Sunk costs really are irrelevant
- Emotional attachment to past work is powerful but misleading
- Forward-looking analysis provides clarity
- Team enthusiasm is a valuable signal
- Admitting mistakes and adapting is a strength, not weakness
```

---

### Example 2: The Availability Heuristic in Bug Prioritization

**Scenario**: Deciding which bugs to fix for release

**Initial Biased Reasoning**:
```
Context: Pre-release bug triage meeting

Biased Thought Process:
"We absolutely must fix the login flow issue. I just saw three users 
complaining about it on Twitter yesterday. It's clearly a major problem.

The analytics show this crash happens 10 times more frequently, but I
haven't personally seen users complain about it. It's probably not that big
of a deal. Let's focus on the login issue everyone's talking about.

Decision: Prioritize login issue over crash."
```

**Bias Identification**:
```
Red Flags:
⚠️ "I just saw three users on Twitter" → Availability bias
⚠️ "Everyone's talking about" → Exaggerating based on recent exposure
⚠️ "Haven't personally seen complaints" → Absence of evidence ≠ evidence of absence
⚠️ Vivid anecdotes > statistical data → Availability heuristic

Biases:
1. Availability Heuristic (primary)
2. Recency Bias
3. Anecdotal Reasoning
4. Neglecting Base Rates
```

**Debiasing Process**:

**Step 1: Gather Comprehensive Data**
```
Statistical Analysis:

Login Issue:
- Affected users: ~500 (0.05% of user base)
- Frequency: 0.5 occurrences per hour
- Impact: Annoying, but workaround exists
- Twitter mentions: 5 (highly visible)
- Support tickets: 12
- Revenue impact: Low (doesn't prevent usage)

Crash Issue:
- Affected users: ~5,000 (0.5% of user base) - 10x more
- Frequency: 5 occurrences per hour - 10x more
- Impact: Severe (complete app failure, data loss)
- Twitter mentions: 0 (silent failure)
- Support tickets: 3 (people quietly churned)
- Revenue impact: High (users immediately churn)

Base Rate Comparison:
- Crash affects 10x more users
- Happens 10x more frequently
- Has worse consequences
- But is invisible on social media
```

**Step 2: Understand Why Availability Differs**
```
Why is login issue more "available" to me?

Login Issue:
- Vocal users on Twitter (high social media presence)
- Multiple people discussing same issue (feels like many)
- Recent (saw it yesterday)
- Emotionally charged complaints (memorable)
- I use login flow daily (personal familiarity)

Crash Issue:
- Silent failure (app just closes)
- Users churn quietly without complaining
- Happens in feature I don't use personally
- No social media amplification
- Technical logs only (not narrative-friendly)

Insight: Social media loudness ≠ actual impact
Most severe problems may be silent because they cause immediate churn.
```

**Step 3: Systematic Prioritization**
```
Objective Prioritization Framework:

Impact = Severity × Frequency × User Reach

Login Issue:
- Severity: 3/10 (annoying, has workaround)
- Frequency: 0.5/hour
- User Reach: 500 users
- Impact Score: 3 × 0.5 × 500 = 750

Crash Issue:
- Severity: 9/10 (complete failure, data loss)
- Frequency: 5/hour
- User Reach: 5,000 users
- Impact Score: 9 × 5 × 5,000 = 225,000

Ratio: Crash issue is 300x more impactful by objective measures
```

**Debiased Decision**:
```
Decision: Prioritize crash issue, then login issue

Reasoning:
1. Statistical analysis shows crash is 300x more impactful
2. Social media visibility is a poor proxy for actual impact
3. Silent problems often more severe (cause immediate churn)
4. Data > anecdotes for prioritization

Action Plan:
1. Fix crash issue (2 days)
2. Proactive communication: "We've identified and fixed a critical crash"
3. Fix login issue (1 day)
4. Improve crash reporting (so future crashes aren't silent)

Response to Twitter users:
"Thanks for reporting! We've prioritized a critical crash affecting 10x more
users, then will fix the login issue. Both in this release."
```

**Outcome**:
```
Results:
- Crash fix reduced churn by 15% in affected cohort
- Projected revenue saved: $50K/month
- Login fix well-received  
- Twitter users appreciated honest prioritization explanation

Lessons:
- Loudness ≠ importance
- Silent problems often most critical
- Systematic prioritization beats gut feel
- Data > anecdotes
- Explain prioritization rationale to build trust
```

---

## DATA SCIENCE EXAMPLES

### Example 3: P-Hacking and Multiple Comparisons

**Scenario**: Finding "significant" results in marketing experiment

**Initial Biased Reasoning**:
```
Context: A/B test for email marketing campaign didn't show expected results

Biased Thought Process:
"The overall conversion rate didn't change significantly (p=0.23), but
let me slice the data different ways to find what worked...

Interesting! For users aged 25-34, on mobile, who signed up on Tuesday,
conversion increased by 18% (p=0.04)! That's statistically significant!

Also, for users in California with income >$75K, conversion increased 22% (p=0.03)!

I'll report these findings: 'Email campaign successful for key demographics.'

Decision: Scale up campaign targeting these specific segments."
```

**Bias Identification**:
```
Red Flags:
⚠️ "Let me slice the data different ways" → P-hacking / data dredging
⚠️ Testing many hypotheses after seeing data → Multiple comparisons problem
⚠️ Cherry-picking significant results → Confirmation bias
⚠️ Ignoring non-significant overall result → Apophenia

Biases:
1. Multiple Comparisons Bias / P-hacking (primary)
2. Confirmation Bias (seeking positive results)
3. Apophenia (seeing patterns in noise)
4. Outcome Bias (working backward from desired conclusion)
```

**Debiasing Process**:

**Step 1: Recognize Multiple Testing Problem**
```
Reality Check:

Number of segment combinations tested:
- Age groups: 5
- Platform: 3  
- Signup day: 7
- Geography: 50 states
- Income brackets: 4

Total possible combinations: 5 × 3 × 7 × 50 × 4 = 21,000 combinations

Expected false positives at α=0.05:
- 21,000 × 0.05 = 1,050 "significant" results by pure chance

Found: 2 significant results
Expected by chance: 1,050

Conclusion: My "significant" findings are likely noise.
```

**Step 2: Bonferroni Correction**
```
Proper Statistical Approach:

If testing k=21,000 hypotheses, adjust significance threshold:

Corrected α = 0.05 / 21,000 = 0.0000024

Re-evaluate findings:
- Age 25-34, mobile, Tuesday (p=0.04) → NOT significant (p >> 0.0000024)
- California, income >$75K (p=0.03) → NOT significant

Conclusion: No segments show statistically significant effects
after multiple testing correction.
```

**Step 3: Pre-Registration Approach**
```
What we SHOULD have done:

Before seeing data:
1. Pre-specify hypotheses: "We expect email to work better for mobile users"
2. Pre-register analysis plan
3. Test ONLY pre-specified hypotheses
4. Report all results (not just significant ones)

What we actually did (bad):
1. Looked at data first
2. Searched for significant results
3. Made up hypotheses post-hoc
4. Reported only significant findings

This is p-hacking, even if unintentional.
```

**Step 4: Proper Analysis**
```
Correct Interpretation:

Primary hypothesis: Email campaign increases conversions
Result: No significant effect (p=0.23)
Sample size: Adequate (powered for 5% lift)

Conclusion: Email campaign did not increase conversions overall.

Exploratory subgroup analyses found no robustly significant segments
after correcting for multiple comparisons.

Recommendation: Do not scale this campaign.
```

**Debiased Decision**:
```
Decision: Do not scale campaign; redesign and retest

Reasoning:
1. Overall effect was non-significant
2. Subgroup "findings" are likely false positives from p-hacking
3. Multiple comparisons create illusion of patterns in noise
4. Proper statistical correction shows no real effects

Next Steps:
1. Honest report: "Campaign did not increase conversions"
2. Hypothesis: Why didn't it work?
3. Redesign: Address identified issues
4. Pre-register: Next test with clear hypothesis
5. Retest: With proper methodology

Statistical Integrity:
- Report negative results honestly
- Don't torture data until it confesses
- Pre-specify hypotheses
- Correct for multiple testing
- Build long-term credibility over short-term wins
```

**Outcome**:
```
Results:
- Honestly reported negative result
- Team appreciated statistical rigor
- Redesigned campaign based on learnings
- Second campaign (pre-registered) showed genuine 8% lift
- Earned reputation for trustworthy analysis

Lessons:
- P-hacking is easy to do accidentally
- Multiple comparisons create false patterns
- Pre-registration prevents post-hoc reasoning
- Negative results are valuable
- Statistical integrity builds credibility
- Short-term pressure to find "wins" destroys long-term trust
```

---

### Example 4: Survivorship Bias in Model Evaluation

**Scenario**: Evaluating investment strategy using historical data

**Initial Biased Reasoning**:
```
Context: Backtesting investment algorithm

Biased Thought Process:
"I tested my algorithm on all companies currently in the S&P 500.
Results are incredible: 15% average annual return over 20 years!

The algorithm identifies growth companies early and holds them.
Looking at current S&P constituents, it would have picked Amazon,
Apple, Google, Netflix - all huge winners!

This proves the algorithm works. Ready to deploy with real money.

Decision: Invest using this algorithm."
```

**Bias Identification**:
```
Red Flags:
⚠️ "Companies currently in S&P 500" → Survivorship bias
⚠️ Testing only on survivors → Ignoring failures
⚠️ Looking at companies that succeeded → Selection bias
⚠️ Backward-looking validation → Hindsight bias

Biases:
1. Survivorship Bias (primary)
2. Selection Bias
3. Hindsight Bias
4. Optimism Bias
```

**Debiasing Process**:

**Step 1: Identify Survivorship Bias**
```
The Problem:

Current S&P 500 companies are SURVIVORS:
- They didn't go bankrupt (many others did)
- They succeeded (many others failed)
- They're still around to test on

Companies NOT in my test:
- Enron (bankrupt)
- Lehman Brothers (collapsed)
- Hundreds of companies that failed
- Thousands of companies that never made it to S&P

My Algorithm's "Success":
- Tested on survivors only
- Never saw the failures it would have invested in
- Like interviewing only living skydivers about parachute safety
- Massively inflated performance estimate
```

**Step 2: Proper Historical Simulation**
```
Correct Backtesting Approach:

Point-in-Time Data:
- For each historical date, use ONLY companies that existed then
- Include companies that later failed
- Include companies that were later removed from S&P
- Don't use future information (what we know now)

Comprehensive Universe:
Year 2000 test:
- Include all public companies (not just current S&P)
- Include companies that went bankrupt 2001-2024
- Include companies that were acquired
- Include companies that delisted

Re-run algorithm on complete historical universe...
```

**Step 3: Reality Check**
```
Results with Survivorship Bias Corrected:

Original (survivors only): 15% annual return
Corrected (all companies): 4% annual return

Why the huge difference?

Algorithm invested in:
- Companies that became Amazon (huge gain) âœ" VISIBLE
- Companies that became Pets.com (total loss) âœ— INVISIBLE IN ORIGINAL TEST
- Companies that became Webvan (bankrupt) âœ— INVISIBLE
- Companies acquired at loss (gone from data) âœ— INVISIBLE

Real Performance:
- Some huge wins (Amazon, Google)
- Many total losses (bankruptcies)
- Net result: 4% (barely beats index)

Survivorship bias inflated returns 3.75x (15% vs 4%)
```

**Step 4: Additional Biases Addressed**
```
Look-Ahead Bias:
- Was I using data not available at the time?
- E.g., "Growth companies" based on future success?
- Corrected: Only use information available on that historical date

Selection Bias:
- Why only S&P 500? That's pre-selected winners
- Corrected: Test on full investable universe

Hindsight Bias:
- "Obviously Amazon would succeed"
- Corrected: In 2000, Amazon was risky; many similar companies failed

Optimism Bias:
- Extraordinary returns should be highly suspicious
- Markets are efficient; easy money doesn't exist
- Corrected: Skepticism toward amazing backtests
```

**Debiased Decision**:
```
Decision: Do not deploy algorithm; returns do not justify risk

Reasoning:
1. Survivorship bias inflated apparent performance 3.75x
2. Actual historical performance: 4% (barely exceeds index)
3. After accounting for:
   - Transaction costs (~0.5%)
   - Taxes on gains (~1%)
   - Execution slippage (~0.5%)
   - Real return: ~2%
4. Index fund would beat this after costs
5. Higher risk (concentrated bets) for lower return

Lessons Learned:
- Always test on complete historical universe
- Include all failed companies
- Use point-in-time data only
- Be deeply skeptical of amazing backtest results
- Survivorship bias is pervasive in financial data
- If it looks too good to be true, check for bias

New Approach:
- Build algorithm with survivorship-corrected data
- Use walk-forward testing
- Paper trade before real money
- Expect modest, not extraordinary, returns
```

**Outcome**:
```
Results:
- Avoided losing real money on flawed algorithm
- Redesigned with proper methodology
- Found genuine edge with 7% return (after costs)
- Deployed cautiously with small position
- Built reputation for rigorous methodology

Lessons:
- Survivorship bias is huge in financial data (and elsewhere)
- Amazing results are usually methodological flaws
- Proper testing is hard but essential
- Skepticism protects capital
- Integrity in methodology matters more than impressive backtests
```

---

## BUSINESS STRATEGY EXAMPLES

### Example 5: Planning Fallacy in Product Launch

**Scenario**: Planning major product launch timeline

**Initial Biased Reasoning**:
```
Context: Planning v2.0 product launch

Biased Thought Process:
"We've broken down all the tasks. It's straightforward:
- Backend API: 3 weeks
- Frontend: 4 weeks
- Integration: 1 week
- Testing: 2 weeks
- Documentation: 1 week
Total: 11 weeks

We have 5 engineers, so maybe we can parallelize and do it in 8 weeks?
Let's commit to 10 weeks to be safe.

Our previous launch took longer, but that had unexpected complications.
This time we know what we're doing. 10 weeks is realistic.

Decision: Announce launch date 10 weeks from now."
```

**Bias Identification**:
```
Red Flags:
⚠️ "This time we know what we're doing" → Optimism bias, planning fallacy
⚠️ "Previous launch had unexpected complications" → Every project does!
⚠️ Simple addition of estimates → Ignores compounding delays
⚠️ "10 weeks to be safe" → Insufficient buffer
⚠️ "Straightforward" → Underestimating complexity
⚠️ Not learning from past underestimates → Planning fallacy

Biases:
1. Planning Fallacy (primary)
2. Optimism Bias
3. "This Time Is Different" Fallacy
4. Neglecting Unknown Unknowns
```

**Debiasing Process**:

**Step 1: Reference Class Forecasting**
```
Historical Data - OUR Past Launches:

Launch 1:
- Estimated: 8 weeks
- Actual: 16 weeks (2.0x overrun)

Launch 2:
- Estimated: 12 weeks  
- Actual: 20 weeks (1.67x overrun)

Launch 3:
- Estimated: 10 weeks
- Actual: 18 weeks (1.8x overrun)

Average overrun: 1.82x
Median overrun: 1.8x

Current estimate: 10 weeks
Reference class adjustment: 10 × 1.8 = 18 weeks

Reality Check: We consistently underestimate by ~80%
```

**Step 2: Outside View Analysis**
```
Industry Benchmarks:

Surveyed 50 similar companies:
- Average product launch: 20 weeks
- 50th percentile: 18 weeks
- 70th percentile: 24 weeks
- 90th percentile: 32 weeks

Our track record: 
- We're slightly better than median
- But still consistent underestimators

Conclusion: 18 weeks is MORE realistic than 10 weeks
```

**Step 3: Unknown Unknowns Analysis**
```
What Could Go Wrong? (Pre-Mortem)

"It's 10 weeks from now. We missed the launch date badly."

Failure Reasons Generated:
- Key engineer got sick (happened on Launch 2)
- Major security vulnerability found (happened on Launch 1)
- Database migration more complex than expected (always happens)
- Integration issues with third-party API (happened on Launch 3)
- Customer feedback during beta required changes (happened on all)
- QA found critical bugs late (happened on Launch 2 and 3)
- Documentation took longer (happened on all - always underestimated)
- Deployment issues (happened on Launch 1)
- Marketing not ready (happened on Launch 3)

Pattern: Every launch had "unexpected" complications
Reality: They're not unexpected - they're NORMAL

Buffer needed for normal complications: +80%
```

**Step 4: Probabilistic Estimation**
```
Realistic Estimates with Uncertainty:

Best Case (10% probability):
- Everything goes perfectly
- No sick days, no bugs, no delays
- 12 weeks

Most Likely (50% probability):
- Normal complications
- Some discoveries during integration
- 18 weeks

Worst Case (90% probability):
- Major complications (but not disaster)
- Multiple issues compound
- 28 weeks

Recommendation: 
- Internal target: 18 weeks (median)
- Public commitment: 22 weeks (70th percentile)
- Worst case planning: 28 weeks (have contingency)
```

**Debiased Decision**:
```
Decision: Commit to 22-week launch date publicly

Reasoning:
1. Reference class shows we underestimate by 1.8x consistently
2. Industry benchmark aligns with reference-adjusted estimate
3. Pre-mortem identified normal complications we'll face
4. Probabilistic thinking: 70% confidence of hitting 22 weeks
5. Buffer for unknowns explicitly included

Communication Strategy:
Internal: "We're targeting 18 weeks, but publicizing 22 weeks"
External: "Launch in 22 weeks, with regular updates"

Advantages of Realistic Timeline:
- Builds credibility (much better to deliver early than late)
- Reduces team stress
- Allows time for quality
- Better stakeholder relationships

Risk Management:
- Track progress weekly
- Identify delays early
- Have contingency plans
- Communicate proactively if issues arise
```

**Outcome (22 weeks later)**:
```
Results:
- Launched in week 20 (2 weeks EARLY)
- Stakeholders thrilled with early delivery
- Team not stressed by unrealistic deadlines
- Quality was higher (time for proper testing)
- Marketing properly prepared
- Builds credibility: "They deliver when promised"

What Actually Happened:
- Integration took 2 weeks (estimated 1) - predicted
- Security review added 1 week - predicted
- QA found critical bugs requiring fixes - predicted
- Database migration more complex - predicted
- But: Good buffer meant we still finished early

Lessons:
- Reference class forecasting works
- Outside view beats inside view
- Unknown unknowns are predictable in aggregate
- Buffer is not "padding" - it's realistic
- Delivering early >> delivering late
- Planning fallacy is real and consistent
- Probabilistic estimates > point estimates
```

---

## Key Patterns Across All Examples

### Common Debiasing Steps

1. **Recognize Emotional/Linguistic Red Flags**
   - Strong attachment → Sunk cost
   - Absolute certainty → Overconfidence
   - Recent examples → Availability
   - "Obvious" in hindsight → Hindsight bias

2. **Apply Specific Debiasing Technique**
   - Sunk cost → Reframe as fresh decision
   - Availability → Gather comprehensive data
   - P-hacking → Pre-register hypotheses
   - Survivorship → Include failures in data
   - Planning fallacy → Reference class forecasting

3. **Use Systematic Reasoning**
   - Quantify rather than rely on gut
   - Document assumptions
   - Check historical data
   - Apply statistical corrections

4. **Seek External Validation**
   - Outside view
   - Reference classes
   - Pre-mortem
   - Red team

5. **Make Probabilistic Predictions**
   - Not "it will happen" but "X% likely"
   - Not point estimates but ranges
   - Track calibration

### Universal Lessons

1. **Biases are systematic, not random**
   - You'll make same errors repeatedly
   - Track your personal bias patterns
   - Build compensating systems

2. **Data beats intuition**
   - When data conflicts with gut, trust data
   - But ensure data isn't biased (survivorship, selection)
   - Use systematic reasoning

3. **Outside view beats inside view**
   - Reference classes provide reality check
   - Your situation is rarely as unique as it feels
   - Statistical base rates are powerful

4. **Process matters more than outcomes**
   - Good process can have bad outcomes (due to luck)
   - Bad process can have good outcomes (also luck)
   - Evaluate reasoning quality, not results

5. **Systematic beats willpower**
   - You can't remember to check for bias
   - Build forcing functions
   - Use checklists
   - Create decision protocols

---

## Practice Exercises

For each scenario below, identify:
1. Which biases are likely present
2. What detection signals appear
3. Which debiasing technique to apply
4. What the debiased decision should be

### Exercise 1: The Hot Product Manager
"Sarah's last three features were huge successes. Let's give her the most important project."

### Exercise 2: The Complicated Refactor  
"We're halfway through this refactoring. Yes, it's taking longer than expected and creating more bugs, but we need to see it through."

### Exercise 3: The Unanimous Vote
"Everyone agrees this is the right strategy. Let's move forward immediately."

### Exercise 4: The Confident Prediction
"I'm certain this feature will increase engagement by 25%. All the signs point to it."

### Exercise 5: The Pattern
"Sales always spike in Q4. We should hire 10 more people before Q4."

**Answers and detailed analyses available in the appendix.**

---

## Integration with Main Reasoning Skill

These debiasing examples demonstrate how to combine:

**From Main Skill** + **Bias Awareness** = **Robust Reasoning**

- Systematic Reasoning + Availability Check = Comprehensive data gathering
- Strategic Reasoning + Overconfidence Check = Realistic planning
- Analytical Reasoning + Confirmation Check = Fair evidence evaluation  
- Statistical Reasoning + P-hacking Check = Valid inference

**Remember**: Every reasoning type has associated biases. The skill is recognizing which biases threaten which reasoning types, then applying appropriate countermeasures.

---

**Next**: See organizational_debiasing.md for team and institutional approaches to bias mitigation.
