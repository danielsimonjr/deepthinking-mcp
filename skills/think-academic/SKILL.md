---
name: think-academic
description: Academic research reasoning methods — Synthesis (integrating sources, literature review, multi-source coherence), Argumentation (Toulmin model with claim/warrant/backing/qualifier/rebuttal), Critique (peer-review style evaluation, strengths/weaknesses, Socratic questions), and Analysis (systematic decomposition, coverage tracking, layered examination). Use when the user invokes `/think synthesis`, `/think argumentation`, `/think critique`, or `/think analysis`, or asks about literature review, building an argument, evaluating work, or systematic analysis.
argument-hint: "[synthesis|argumentation|critique|analysis] <problem>"
---

# think-academic — Academic Research Reasoning Methods

## User Invocation

```
$ARGUMENTS
```

Parse these arguments. The first word should be `synthesis`, `argumentation`, `critique`, or `analysis`. The rest is the problem to reason about. If invoked via the `think` router, `$ARGUMENTS` is the same string the user originally typed after `/think`.

This category skill contains four academic reasoning methods: **Synthesis** (integrate sources, track coverage, identify convergence and divergence), **Argumentation** (Toulmin model with claim, grounds, warrant, backing, qualifier, rebuttal), **Critique** (peer-review evaluation with strengths, weaknesses, and Socratic questions), and **Analysis** (layered systematic decomposition with coverage tracking).

---

## Synthesis

Synthesis reasoning integrates knowledge from multiple sources into a coherent position. It tracks which sources have been examined, where they agree (convergence), where they conflict (divergence), and what gaps remain. Unlike mere summary, synthesis builds a new understanding that is more than any individual source.

The key discipline: **every synthesized claim must cite the sources that support it, and every divergence must be acknowledged rather than hidden.** A synthesis that papers over contradictions is not integration — it is selective quotation.

### When to Use

- You have multiple sources (papers, studies, reports, perspectives) and need to build a unified position
- Literature review: what does the field collectively say about X?
- Reconciling conflicting findings before drawing a conclusion
- Tracking coverage: have I examined enough of the space to support this claim?
- Building a conceptual framework from disparate threads

**Do not use Synthesis** when:
- You have a single source — summarize or analyze it directly instead
- You need to evaluate the quality of one source — use Critique
- You are building an argument for a position you already hold — use Argumentation

### How to Reason Synthetically

1. **Inventory your sources.** For each source, record its key claim, type (empirical, theoretical, review, expert), quality, and the specific position it takes on your topic.
2. **Extract concepts and themes.** What terms and constructs appear across sources? Note how frequently each appears and which sources use it.
3. **Map convergence.** Where do sources agree? A finding supported by multiple independent sources is stronger — note the degree of consensus (strong / moderate / weak / contested).
4. **Surface divergence.** Where do sources disagree? Classify the nature of the conflict: different populations, different methodologies, different time periods, fundamentally different theoretical frameworks.
5. **Track coverage.** What percentage of the relevant space have you examined? What important perspectives are missing?
6. **Identify gaps.** What questions do the sources collectively leave unanswered? Classify each gap: empirical (no data), theoretical (no framework), methodological (inadequate methods), or contextual (wrong setting).
7. **Construct the synthesis.** A single coherent statement of what the sources collectively establish, including qualifications where convergence is weak or absent.

### Output Format

See `reference/output-formats/synthesis.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "synthesis",
  "topic": "<the question being synthesized>",
  "sources": [
    {
      "id": "s1",
      "title": "<source title>",
      "type": "empirical|theoretical|review|expert|case_study",
      "year": 0,
      "keyPosition": "<what this source claims about the topic>",
      "quality": 0.0
    }
  ],
  "themes": [
    {
      "id": "t1",
      "name": "<theme name>",
      "sourceIds": ["s1"],
      "consensus": "strong|moderate|weak|contested",
      "description": "<what this theme asserts>"
    }
  ],
  "convergence": [
    {
      "claim": "<claim supported by multiple sources>",
      "sourceIds": ["s1", "s2"],
      "strength": "strong|moderate|weak"
    }
  ],
  "divergence": [
    {
      "dimension": "<what sources disagree about>",
      "positions": [
        { "sourceIds": ["s1"], "position": "<what these sources say>" },
        { "sourceIds": ["s2"], "position": "<what these sources say>" }
      ],
      "nature": "methodological|theoretical|population|temporal|definitional"
    }
  ],
  "gaps": [
    {
      "description": "<what is unknown or unaddressed>",
      "type": "empirical|theoretical|methodological|contextual",
      "importance": "critical|significant|moderate|minor"
    }
  ],
  "coverage": {
    "sourcesExamined": 0,
    "estimatedRelevantTotal": 0,
    "coverageRatio": 0.0,
    "missingPerspectives": ["<perspective not yet examined>"]
  },
  "synthesisStatement": "<the integrated conclusion across all sources>",
  "confidence": 0.0
}
```

### Verification Before Emitting

- `mode` is exactly `"synthesis"`
- `sources` has at least two entries — synthesis of a single source is summary, not synthesis
- Every `convergence[*].sourceIds` references real source `id` values
- Every `divergence` entry names the `nature` of the conflict — not just "they disagree"
- `gaps` is non-empty — if you believe there are no gaps, state that explicitly as a coverage claim, not silence
- `synthesisStatement` integrates the convergence and divergence; it does not just repeat the strongest source
- `confidence` is lower when `coverage.coverageRatio` is low or when `divergence` is unresolved
- `coverage.coverageRatio` is below 1.0 unless you have genuinely exhausted the relevant literature

### Worked Example

Input: "Synthesizing three conflicting studies on remote work productivity into a coherent position."

Three sources have been identified:
- **s1** (Stanford, 2015): Call center workers at home showed 13% productivity gain — controlled experiment
- **s2** (Microsoft, 2021): Remote work fragmented collaboration networks, weakening cross-team ties
- **s3** (Bloom et al., 2022): Hybrid work (2-3 days remote) outperforms fully remote or fully in-office

```json
{
  "mode": "synthesis",
  "topic": "Does remote work improve or harm employee productivity?",
  "sources": [
    {
      "id": "s1",
      "title": "Does Working from Home Work? Evidence from a Chinese Experiment",
      "type": "empirical",
      "year": 2015,
      "keyPosition": "Remote work increases individual productivity by ~13% for structured, measurable tasks",
      "quality": 0.92
    },
    {
      "id": "s2",
      "title": "The Effects of Remote Work on Collaboration Among Information Workers",
      "type": "empirical",
      "year": 2021,
      "keyPosition": "Fully remote work narrows collaboration networks and reduces spontaneous cross-team communication",
      "quality": 0.88
    },
    {
      "id": "s3",
      "title": "How Well-Designed Hybrid Work Benefits Employees and Companies",
      "type": "empirical",
      "year": 2022,
      "keyPosition": "Hybrid arrangements (2-3 days remote) maximize both individual output and collaborative quality",
      "quality": 0.85
    }
  ],
  "themes": [
    {
      "id": "t1",
      "name": "Task type moderates remote work benefit",
      "sourceIds": ["s1", "s2", "s3"],
      "consensus": "moderate",
      "description": "Individual, structured tasks benefit from remote work; collaborative, unstructured tasks are harmed by it"
    },
    {
      "id": "t2",
      "name": "Hybrid as reconciliation",
      "sourceIds": ["s2", "s3"],
      "consensus": "moderate",
      "description": "Hybrid arrangements preserve both individual productivity gains and collaboration quality"
    }
  ],
  "convergence": [
    {
      "claim": "Remote work is not universally good or bad — its effect depends on task type",
      "sourceIds": ["s1", "s2", "s3"],
      "strength": "strong"
    }
  ],
  "divergence": [
    {
      "dimension": "Whether fully remote is net positive or negative",
      "positions": [
        { "sourceIds": ["s1"], "position": "Fully remote increases productivity in structured-task roles" },
        { "sourceIds": ["s2"], "position": "Fully remote weakens collaborative networks in knowledge-worker roles" }
      ],
      "nature": "population"
    }
  ],
  "gaps": [
    {
      "description": "Long-run career development and promotion equity for remote workers vs. in-office workers",
      "type": "empirical",
      "importance": "significant"
    },
    {
      "description": "Effects on junior employees who rely more heavily on informal mentoring",
      "type": "contextual",
      "importance": "significant"
    }
  ],
  "coverage": {
    "sourcesExamined": 3,
    "estimatedRelevantTotal": 40,
    "coverageRatio": 0.08,
    "missingPerspectives": ["Employee mental health outcomes", "Long-run career equity", "Non-knowledge-worker populations", "Managerial effectiveness remotely"]
  },
  "synthesisStatement": "Remote work increases individual productivity for structured tasks but reduces spontaneous collaboration in knowledge-work contexts. These findings are reconciled by hybrid arrangements (2-3 remote days) which preserve individual output gains while maintaining collaborative network density. The productivity debate is not 'remote vs. in-office' but 'which tasks belong in which setting' — a question every team must answer for its specific work profile.",
  "confidence": 0.72
}
```

Natural-language summary: "The three studies are not contradictory — they study different populations and tasks. s1 examines structured call-center work (remote wins); s2 examines cross-team knowledge work (in-person wins); s3 finds hybrid as the synthesis point. The integrated position: task type is the moderating variable that resolves the apparent conflict. Coverage is low (3/~40 relevant studies), so confidence is 0.72 — the synthesisStatement would be more robust with more corroborating literature, particularly on non-knowledge-worker populations."

---

## Argumentation

Argumentation reasoning constructs rigorous arguments using the **Toulmin model**: a claim supported by grounds (data/evidence), connected by a warrant (the logical bridge), backed by backing (support for the warrant itself), qualified by qualifiers (degree of certainty), and anticipated against rebuttals (objections and their responses). This is the structure of academic argument — not just "premise plus conclusion."

The key discipline: **warrants must be made explicit.** Most weak arguments fail not because the evidence is wrong but because the connection between evidence and claim is unstated and contestable. Making the warrant explicit forces you to defend it — or discover that it is indefensible.

### When to Use

- Constructing an argument you intend to defend (academic writing, proposals, debates)
- Evaluating whether an existing argument holds — does the warrant actually connect evidence to claim?
- Anticipating objections before presenting a position
- Making the logical structure of a persuasive case fully explicit

**Do not use Argumentation** when:
- You need to synthesize multiple sources into a position — use Synthesis first, then Argumentation
- You are evaluating someone else's work holistically — use Critique
- You have premises and just want to derive a conclusion — use Deductive

### Toulmin Model Components

| Component | Role | Key Question |
|-----------|------|--------------|
| **Claim** | The thesis — what you are asserting | What are you claiming to be true? |
| **Grounds** | The data/evidence supporting the claim | What do you base this on? |
| **Warrant** | The logical principle connecting grounds to claim | How does the evidence justify the claim? |
| **Backing** | Support for the warrant itself | Why should we accept the warrant? |
| **Qualifier** | The degree of certainty | How strongly / in what circumstances? |
| **Rebuttal** | Anticipated objections and your responses | What could challenge this, and how do you respond? |

### How to Reason Argumentatively

1. **Formulate the claim.** State precisely what you are asserting. Classify its type: fact, value, policy, definition, or causal claim. Note its scope (universal / general / particular) and whether it is contested.
2. **Gather grounds.** Collect the evidence. For each piece: what type of evidence is it (empirical, statistical, testimonial, analogical, logical)? How reliable is it? Is it sufficient to support the claim alone, or only in combination?
3. **Construct the warrant.** The warrant answers "why does this evidence justify this claim?" It is a general principle — a rule of inference — not another piece of evidence. Example: "Meta-analyses are reliable guides to population-level effects." Make implicit warrants explicit.
4. **Provide backing.** Why should the warrant be accepted? Cite theoretical foundations, historical precedents, definitional constraints, or authoritative sources that support the warrant itself.
5. **Apply a qualifier.** What is the degree of certainty? Qualifiers like "probably," "in most cases," or "under normal conditions" limit the claim's scope appropriately. An unqualified claim is usually overreach.
6. **Anticipate rebuttals.** For each rebuttal, state: the objection, its type (factual, logical, ethical, practical), its strength, what it targets (claim, grounds, warrant, or backing), and your response strategy (refute, concede, qualify, reframe, or outweigh).
7. **Assess overall argument strength.** A number in [0, 1]. A strong argument (>0.8) has sufficient and reliable grounds, an explicit and well-backed warrant, appropriate qualifiers, and credible responses to strong rebuttals.

### Output Format

See `reference/output-formats/argumentation.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "argumentation",
  "claim": {
    "id": "c1",
    "statement": "<what you are asserting>",
    "type": "fact|value|policy|definition|cause",
    "scope": "universal|general|particular",
    "strength": "strong|moderate|tentative",
    "contested": true
  },
  "grounds": [
    {
      "id": "g1",
      "type": "empirical|statistical|testimonial|analogical|logical",
      "content": "<the evidence>",
      "source": "<citation or origin>",
      "reliability": 0.0,
      "relevance": 0.0,
      "sufficiency": "sufficient|partial|insufficient"
    }
  ],
  "warrants": [
    {
      "id": "w1",
      "statement": "<the logical bridge from grounds to claim>",
      "type": "generalization|analogy|causal|authority|principle|definition",
      "implicit": false,
      "strength": 0.0,
      "groundsIds": ["g1"],
      "claimId": "c1"
    }
  ],
  "backings": [
    {
      "id": "b1",
      "content": "<why the warrant should be accepted>",
      "type": "theoretical|empirical|authoritative|definitional|precedent",
      "warrantId": "w1",
      "credibility": 0.0
    }
  ],
  "qualifiers": [
    {
      "id": "q1",
      "term": "probably|likely|generally|in most cases|certainly",
      "certainty": 0.0,
      "conditions": ["<conditions under which the claim holds>"]
    }
  ],
  "rebuttals": [
    {
      "id": "r1",
      "objection": "<the counterargument>",
      "type": "factual|logical|ethical|practical|definitional",
      "strength": "strong|moderate|weak",
      "targetElement": "claim|grounds|warrant|backing",
      "targetId": "c1",
      "response": {
        "strategy": "refute|concede|qualify|reframe|outweigh",
        "content": "<how you respond>",
        "effectiveness": 0.0
      }
    }
  ],
  "argumentStrength": 0.0,
  "keyInsight": "<the non-obvious insight this argument reveals>"
}
```

### Verification Before Emitting

- `mode` is exactly `"argumentation"`
- `claim` has all required fields including `type`, `scope`, `strength`, and `contested`
- `grounds` has at least one entry — an argument without evidence is an assertion
- `warrants` is non-empty — the warrant must be explicit; if you find yourself omitting it, you have an assumption, not an argument
- Every `warrant[*].groundsIds` references real grounds `id` values
- `backings` is non-empty — at least one warrant must be backed
- `qualifiers` is non-empty — an unqualified claim is usually overreach
- `rebuttals` is non-empty — if you cannot think of any objection, you have not thought hard enough
- Each rebuttal has a `response` — acknowledging an objection without responding is conceding the point
- `argumentStrength` is consistent with the reliability of grounds and the coverage of rebuttals

### Worked Example

Input: "Argue that we should adopt feature flags for all new releases, using the Toulmin structure."

```json
{
  "mode": "argumentation",
  "claim": {
    "id": "c1",
    "statement": "Engineering teams should gate all new production features behind feature flags rather than deploying them to all users simultaneously",
    "type": "policy",
    "scope": "general",
    "strength": "strong",
    "contested": true
  },
  "grounds": [
    {
      "id": "g1",
      "type": "statistical",
      "content": "Teams using feature flags reduce mean time to recovery (MTTR) by 60% on average compared to teams doing big-bang releases (LaunchDarkly State of Feature Management 2023)",
      "source": "LaunchDarkly State of Feature Management Report, 2023",
      "reliability": 0.78,
      "relevance": 0.95,
      "sufficiency": "partial"
    },
    {
      "id": "g2",
      "type": "empirical",
      "content": "Amazon, Netflix, and Google have all publicly documented progressive rollout as a core deployment practice that reduces blast radius of defects",
      "source": "Various engineering blog posts, 2018-2023",
      "reliability": 0.80,
      "relevance": 0.88,
      "sufficiency": "partial"
    },
    {
      "id": "g3",
      "type": "logical",
      "content": "A feature that is deployed but dark can be activated for 1% of users, then 10%, then 100% — allowing observation at each stage without a separate staging environment",
      "reliability": 0.95,
      "relevance": 0.90,
      "sufficiency": "partial"
    }
  ],
  "warrants": [
    {
      "id": "w1",
      "statement": "Practices that reduce MTTR and blast radius of defects should be adopted by teams that value production reliability",
      "type": "principle",
      "implicit": false,
      "strength": 0.88,
      "groundsIds": ["g1", "g2"],
      "claimId": "c1"
    },
    {
      "id": "w2",
      "statement": "Incremental rollout is a form of empirical validation — each stage is evidence before full commitment",
      "type": "causal",
      "implicit": true,
      "strength": 0.80,
      "groundsIds": ["g3"],
      "claimId": "c1"
    }
  ],
  "backings": [
    {
      "id": "b1",
      "content": "Site Reliability Engineering (SRE) literature (Beyer et al., Google SRE Book) establishes MTTR and blast-radius reduction as canonical reliability objectives",
      "type": "authoritative",
      "warrantId": "w1",
      "credibility": 0.90
    },
    {
      "id": "b2",
      "content": "The empirical cycle (hypothesis → test → observe → expand) is foundational to controlled experiment design; feature flags operationalize this cycle in production",
      "type": "theoretical",
      "warrantId": "w2",
      "credibility": 0.85
    }
  ],
  "qualifiers": [
    {
      "id": "q1",
      "term": "generally",
      "certainty": 0.78,
      "conditions": [
        "Team has a feature flag management system (not just ad hoc if/else checks)",
        "Flags are cleaned up after full rollout — flag debt is managed",
        "Feature is observable (metrics exist to evaluate each rollout stage)"
      ]
    }
  ],
  "rebuttals": [
    {
      "id": "r1",
      "objection": "Feature flags add code complexity — every flag is a branch, and stale flags become technical debt",
      "type": "practical",
      "strength": "strong",
      "targetElement": "claim",
      "targetId": "c1",
      "response": {
        "strategy": "qualify",
        "content": "Valid: flag debt is real and teams must enforce flag lifecycle discipline (expiry dates, automated staleness warnings). The qualifier already requires a flag management system. The complexity cost is real but lower than the cost of a full-traffic incident.",
        "effectiveness": 0.78
      }
    },
    {
      "id": "r2",
      "objection": "Small teams with low traffic may not benefit — they can monitor a full release in hours anyway",
      "type": "practical",
      "strength": "moderate",
      "targetElement": "warrant",
      "targetId": "w1",
      "response": {
        "strategy": "concede",
        "content": "Correct for very low-traffic applications where a full release is observable within one business hour. The policy should be scoped to teams with meaningful traffic volumes or high incident cost.",
        "effectiveness": 0.85
      }
    }
  ],
  "argumentStrength": 0.78,
  "keyInsight": "The non-obvious point: feature flags shift the risk model from binary (it works or it doesn't, at full blast) to graduated (observe failure signals at 1% before they become incidents at 100%). The warrant — that reliability teams should minimize blast radius — is the load-bearing premise; teams that dispute this are disputing a foundational SRE principle, not just the feature-flag tactic."
}
```

Natural-language summary: "The argument holds at strength 0.78. The strongest grounds are the MTTR reduction statistics (g1) and the big-tech precedent (g2), connected by a reliability principle warrant (w1) backed by SRE literature. The most serious rebuttal (r1: flag debt) is addressed by qualification rather than refutation — the policy requires flag lifecycle discipline. The concession to r2 (small teams) is honest and tightens the scope. The unresolved risk: flag debt management is a prerequisite, not a given — teams adopting this policy must budget for it."

---

## Critique

Critique reasoning evaluates a piece of work with the rigor and balance of peer review. It systematically identifies **strengths** (what the work does well), **weaknesses** (what it does poorly or where it fails), and generates **Socratic questions** — probing questions that expose assumptions, demand evidence, consider alternatives, or trace implications. Critique is not adversarial; it is calibrated.

The key discipline: **critique must be balanced.** A critique that lists only weaknesses is advocacy against the work, not evaluation. A critique that lists only strengths is praise, not analysis. The `balanceRatio` must reflect genuine examination of both.

The five types of Socratic questions are the engine of rigorous critique:
1. **Clarification** — What exactly do you mean by X?
2. **Assumptions** — What are you assuming that may not hold?
3. **Evidence** — What is the basis for this claim?
4. **Alternative viewpoints** — Could this be interpreted differently?
5. **Implications** — If this is true, what follows?

### When to Use

- Peer review of a paper, design document, proposal, or technical plan
- Pre-mortem evaluation: what would a skeptical expert ask?
- Structured feedback on someone else's work
- Evaluating your own argument before publishing it

**Do not use Critique** when:
- You need to build an argument — use Argumentation
- You need to synthesize multiple sources — use Synthesis
- You are doing systematic decomposition — use Analysis

### How to Reason Critically

1. **Characterize the work.** Identify: what it claims to do, what type of work it is, who the intended audience is, and what its stated contribution is.
2. **Identify strengths.** What does the work do well? Be specific — "clear methodology" is weak; "the replication protocol in §3.2 explicitly states randomization seeds, enabling exact reproduction" is strong.
3. **Identify weaknesses.** What does the work fail to do, do poorly, or get wrong? Again be specific. Classify each weakness by severity: critical (undermines the main claim), significant (reduces confidence substantially), or minor (limited scope).
4. **Generate Socratic questions.** At least one from each of the five types. Questions should be probing — they should make the author think, not just confirm what is already on the page.
5. **Suggest improvements.** For each weakness, a concrete, actionable suggestion. Not "improve the methodology" but "run a power analysis to justify the sample size of n=15."
6. **Render a verdict.** An overall assessment: the work's strongest claim, its most critical limitation, and a recommendation (accept / accept with revisions / major revisions / reject / not applicable for non-paper contexts).
7. **Calibrate balance.** Count strengths and weaknesses. The balance ratio should be close to 1:1 unless the work is genuinely exceptional or fundamentally flawed.

### Output Format

See `reference/output-formats/critique.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "critique",
  "work": {
    "id": "w1",
    "title": "<title of the work being critiqued>",
    "type": "paper|proposal|design|plan|code|argument|other",
    "claimedContribution": "<what the work claims to achieve>",
    "audience": "<intended audience>"
  },
  "strengths": [
    {
      "id": "s1",
      "description": "<specific strength>",
      "significance": "high|medium|low",
      "evidence": "<where in the work this strength appears>"
    }
  ],
  "weaknesses": [
    {
      "id": "wk1",
      "description": "<specific weakness>",
      "severity": "critical|significant|minor",
      "evidence": "<where in the work this weakness appears>",
      "improvement": "<concrete actionable suggestion>"
    }
  ],
  "socraticQuestions": [
    {
      "type": "clarification|assumptions|evidence|alternative_viewpoints|implications",
      "question": "<the probing question>",
      "target": "<what aspect of the work this questions>"
    }
  ],
  "verdict": {
    "overallAssessment": "<one-sentence overall judgment>",
    "strongestClaim": "<what the work most convincingly establishes>",
    "criticalLimitation": "<the single most important limitation>",
    "recommendation": "accept|accept_with_revisions|major_revisions|reject|not_applicable"
  },
  "strengthsIdentified": 0,
  "weaknessesIdentified": 0,
  "balanceRatio": 0.0
}
```

### Verification Before Emitting

- `mode` is exactly `"critique"`
- `strengths` is non-empty — if you can find no strengths, the work is rejected on the spot; explain why
- `weaknesses` is non-empty — a critique with no weaknesses is praise, not evaluation
- `socraticQuestions` has at least five entries — one from each Socratic type
- All five question types are represented: `clarification`, `assumptions`, `evidence`, `alternative_viewpoints`, `implications`
- `strengthsIdentified` and `weaknessesIdentified` match the actual array lengths
- `balanceRatio` = `strengthsIdentified / (strengthsIdentified + weaknessesIdentified)` — aim for 0.35–0.65 unless work is exceptional or fundamentally flawed
- Every weakness has a concrete `improvement` — identifying a problem without suggesting improvement is incomplete critique
- `verdict.recommendation` is present

### Worked Example

Input: "Critique this proposed architecture — what would a skeptical senior engineer ask?"

Work: A microservices migration proposal that recommends decomposing a monolith into 47 services, all communicating via REST, with a shared PostgreSQL database, to be completed in 6 months by a team of 5.

```json
{
  "mode": "critique",
  "work": {
    "id": "w1",
    "title": "Microservices Migration Proposal v1.2",
    "type": "proposal",
    "claimedContribution": "Decompose the legacy monolith into 47 microservices to improve scalability and team velocity, delivering by Q3 2026",
    "audience": "Engineering leadership and the 5-person migration team"
  },
  "strengths": [
    {
      "id": "s1",
      "description": "The proposal correctly identifies that the monolith's shared-state coupling is the root cause of deployment bottlenecks — this diagnosis is accurate and well-evidenced with incident data",
      "significance": "high",
      "evidence": "Section 2.1 cites 14 deployment incidents caused by shared-state race conditions in Q1 2026"
    },
    {
      "id": "s2",
      "description": "Domain boundaries are clearly drawn using Domain-Driven Design bounded contexts — this is better methodology than the typical 'one service per table' decomposition",
      "significance": "medium",
      "evidence": "Appendix A contains the domain map with bounded context definitions for each of the 47 services"
    },
    {
      "id": "s3",
      "description": "The rollback plan (§6) identifies specific circuit-breaker trigger conditions, which is more rigorous than most migration proposals",
      "significance": "medium",
      "evidence": "Section 6.3 specifies error-rate thresholds that trigger automated rollback"
    }
  ],
  "weaknesses": [
    {
      "id": "wk1",
      "description": "The shared PostgreSQL database negates most of the decoupling benefit — services with shared tables are not truly independent; a schema change in any service requires coordinated deployment across all services that touch that table",
      "severity": "critical",
      "evidence": "Architecture diagram in §4.1 shows all 47 services pointing to one database cluster",
      "improvement": "Either introduce per-service databases (with eventual consistency where needed) or reduce scope to a subset of genuinely independent services that can have their own data stores"
    },
    {
      "id": "wk2",
      "description": "47 services decomposed by a team of 5 in 6 months is 9.4 service-completions per engineer — no velocity data justifies this pace; industry benchmarks suggest 2-4 services per engineer per quarter for greenfield",
      "severity": "critical",
      "evidence": "Section 3 (timeline) assumes parallel progress with no dependency graph or critical path",
      "improvement": "Build a dependency graph of the 47 services and identify the minimum viable decomposition (the 8-10 services that provide the most coupling relief) — deliver those first and re-evaluate"
    },
    {
      "id": "wk3",
      "description": "No observability strategy is included — 47 services communicating via REST generates distributed tracing requirements that the current monitoring stack (single-host metrics) cannot meet",
      "severity": "significant",
      "evidence": "Section 5 (operations) mentions 'logging remains unchanged' with no mention of distributed tracing",
      "improvement": "Add a phase-zero observability sprint: instrument OpenTelemetry traces before migrating any service, so you can see cross-service call graphs from day one"
    }
  ],
  "socraticQuestions": [
    {
      "type": "clarification",
      "question": "What exactly do you mean by '47 microservices'? Are these all independently deployable, or do some share a release cycle? The definition of 'microservice' is doing a lot of work in the scope estimate.",
      "target": "Service count and independence claim in §1"
    },
    {
      "type": "assumptions",
      "question": "You assume the 5-person team can operate 47 services in production — what is the operational burden per service, and have you modeled the steady-state on-call load for a 47-service distributed system?",
      "target": "Team capacity assumption in §3"
    },
    {
      "type": "evidence",
      "question": "The proposal claims that decomposition will 'improve team velocity' — what is the current measured velocity, and which specific deployment bottlenecks in the post-decomposition architecture will no longer exist?",
      "target": "Velocity improvement claim in §1"
    },
    {
      "type": "alternative_viewpoints",
      "question": "Have you considered the Strangler Fig pattern as an alternative to big-bang decomposition — extract one domain boundary at a time over 18 months rather than 47 simultaneously over 6 months?",
      "target": "Migration strategy in §3"
    },
    {
      "type": "implications",
      "question": "If the shared PostgreSQL database remains in place, what happens when Service A's schema migration breaks Service B's read queries — how does your rollback plan handle a cascading schema failure across 47 services?",
      "target": "Shared database assumption in §4"
    }
  ],
  "verdict": {
    "overallAssessment": "The problem diagnosis is correct but the proposed solution has two critical structural flaws (shared database, unrealistic scope) that must be resolved before the plan is actionable",
    "strongestClaim": "The DDD-based domain decomposition is methodologically sound and provides a defensible service boundary model",
    "criticalLimitation": "A shared PostgreSQL database among 47 services reproduces the coupling problem in data-layer form, defeating the primary motivation for decomposition",
    "recommendation": "major_revisions"
  },
  "strengthsIdentified": 3,
  "weaknessesIdentified": 3,
  "balanceRatio": 0.5
}
```

Natural-language summary: "The diagnosis is correct and the DDD methodology is commendable — those are genuine strengths worth acknowledging. But the two critical flaws (shared database, scope unrealism) are not implementation details; they undermine the core value proposition. A senior engineer would reject this not because the idea is wrong but because it will fail in execution: the shared database means you get microservices complexity without microservices independence, and the 47-service/5-engineer/6-month plan has no existence proof in industry at this scale. The Socratic question about Strangler Fig is the most useful one — it opens the path to a feasible alternative."

---

## Analysis

Analysis reasoning systematically examines a subject through layered decomposition rather than sequential steps. Where Sequential reasoning follows an ordered procedure (step 1, then step 2, then step 3), Analysis moves through **examination layers**: surface observation, structural decomposition, pattern identification, and synthesis of insights. Each layer reveals what the previous layer missed.

The key discipline: **coverage tracking.** Analysis is not complete when you run out of time — it is complete when you have examined enough layers to support a defensible conclusion. Coverage tracking forces you to state how much of the subject you have examined and what you have deliberately left out.

### Examination Layers

| Layer | Question | What It Reveals |
|-------|----------|-----------------|
| **Surface** | What is observable? | Symptoms, behaviors, outputs |
| **Structural** | What components and relationships underlie this? | Architecture, dependencies, interfaces |
| **Pattern** | What regularities or anomalies emerge across the structure? | Trends, failure modes, design decisions |
| **Synthesis** | What do these patterns collectively imply? | Root causes, systemic insights, recommendations |

These layers are not always strictly sequential — sometimes a surface observation points directly to a structural feature that reveals a pattern. Move between layers as the analysis demands, but track which layers you have covered.

### When to Use

- Systematic examination of a complex artifact, system, or situation
- Failure mode analysis: what could go wrong, and at which layer?
- Design review: what does this design imply at each level of abstraction?
- Root cause investigation that requires understanding structure, not just symptoms
- "What have I missed?" — use coverage tracking to surface blind spots

**Do not use Analysis** when:
- You have a sequence of steps to follow — use Sequential
- You have multiple sources to reconcile — use Synthesis
- You need to evaluate the quality of a specific piece of work — use Critique
- You need to build an argument for a position — use Argumentation

### How to Reason Analytically

1. **State the subject and scope.** What are you analyzing? What is explicitly in scope and out of scope?
2. **Surface observation.** Describe what is directly observable — behaviors, symptoms, outputs, stated properties. Do not interpret yet. Just observe.
3. **Structural decomposition.** Break the subject into components and identify relationships between them. What are the major parts? How do they depend on each other? What are the boundaries?
4. **Pattern identification.** Across the structure, what regularities or anomalies appear? What design choices recur? What failure modes cluster? What is conspicuously absent?
5. **Synthesis.** What do the identified patterns collectively imply? Produce actionable insights — not just observations, but conclusions that follow from the pattern layer.
6. **Track coverage.** For each layer: what did you examine, what did you skip, and why? Estimate the proportion of the subject you have covered.
7. **Identify what is missing.** What would change your analysis if you knew it? What blind spots remain?

### Output Format

See `reference/output-formats/analysis.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "analysis",
  "subject": "<what is being analyzed>",
  "scope": {
    "inScope": ["<aspects included>"],
    "outOfScope": ["<aspects explicitly excluded>"],
    "justification": "<why this scope was chosen>"
  },
  "layers": {
    "surface": {
      "observations": ["<directly observable fact or behavior>"],
      "coverage": 0.0
    },
    "structural": {
      "components": [
        {
          "id": "c1",
          "name": "<component name>",
          "role": "<what it does>",
          "dependencies": ["<id of components it depends on>"]
        }
      ],
      "relationships": [
        {
          "from": "c1",
          "to": "c2",
          "type": "depends_on|calls|owns|produces|consumes|controls",
          "description": "<nature of the relationship>"
        }
      ],
      "coverage": 0.0
    },
    "patterns": [
      {
        "id": "p1",
        "name": "<pattern name>",
        "description": "<what the pattern is>",
        "type": "trend|failure_mode|design_choice|anomaly|absence",
        "evidence": ["<component or observation ids supporting this pattern>"],
        "significance": "high|medium|low"
      }
    ],
    "synthesis": {
      "insights": [
        {
          "id": "i1",
          "insight": "<the actionable conclusion>",
          "basis": ["<pattern ids this is based on>"],
          "confidence": 0.0
        }
      ],
      "recommendations": ["<concrete action or next step>"]
    }
  },
  "coverage": {
    "layersCovered": ["surface", "structural", "patterns", "synthesis"],
    "estimatedCompleteness": 0.0,
    "blindSpots": ["<what is missing from this analysis>"],
    "wouldChangeAnalysisIf": ["<what unknown information would materially alter the conclusions>"]
  }
}
```

### Verification Before Emitting

- `mode` is exactly `"analysis"`
- All four layers are present: `surface`, `structural`, `patterns`, `synthesis`
- `layers.structural.components` has at least two entries — a single component is not a structural analysis
- `layers.patterns` is non-empty — if no patterns emerge, state that explicitly as a pattern-absence finding
- `layers.synthesis.insights` is non-empty — an analysis that ends at pattern identification without synthesis is incomplete
- Every insight in `synthesis.insights` cites `basis` pattern ids
- `coverage.blindSpots` is non-empty — acknowledge what you did not examine
- `coverage.wouldChangeAnalysisIf` is non-empty — identifies the high-value unknown information
- `coverage.estimatedCompleteness` is honest — do not claim 0.9 if you covered only the surface layer
- Analysis is distinguished from Sequential by the presence of all four layers; Sequential produces ordered steps, Analysis produces layered examination

### Worked Example

Input: "Analyze the failure mode of our authentication service — what layers must I examine and what have I missed?"

```json
{
  "mode": "analysis",
  "subject": "Authentication service failure modes",
  "scope": {
    "inScope": [
      "Login and token-issuance flow",
      "Session validation middleware",
      "Password reset flow",
      "Token expiry and refresh"
    ],
    "outOfScope": [
      "Authorization (what authenticated users can do)",
      "User registration flow",
      "Third-party OAuth provider reliability"
    ],
    "justification": "Scoping to authentication (identity verification) rather than authorization (permission enforcement) to keep the analysis tractable for a single session"
  },
  "layers": {
    "surface": {
      "observations": [
        "Login endpoint returns 200 with a valid JWT on successful authentication",
        "Failed logins return 401 with a generic error message",
        "Password reset sends an email link valid for 60 minutes",
        "JWT access tokens expire in 15 minutes; refresh tokens expire in 7 days",
        "No observable rate limiting on the login endpoint in the staging environment"
      ],
      "coverage": 0.75
    },
    "structural": {
      "components": [
        {
          "id": "c1",
          "name": "Login Handler",
          "role": "Validates credentials, issues JWT access token and refresh token",
          "dependencies": ["c2", "c3"]
        },
        {
          "id": "c2",
          "name": "User Store (PostgreSQL)",
          "role": "Stores hashed passwords and user metadata",
          "dependencies": []
        },
        {
          "id": "c3",
          "name": "Token Service",
          "role": "Signs and verifies JWTs using RS256",
          "dependencies": ["c4"]
        },
        {
          "id": "c4",
          "name": "Key Management (env var)",
          "role": "Holds the RSA private key for token signing",
          "dependencies": []
        },
        {
          "id": "c5",
          "name": "Session Middleware",
          "role": "Validates JWT on each protected request; rejects expired or tampered tokens",
          "dependencies": ["c3"]
        },
        {
          "id": "c6",
          "name": "Password Reset Flow",
          "role": "Generates a time-limited reset token, emails it, validates it on submission",
          "dependencies": ["c2", "c7"]
        },
        {
          "id": "c7",
          "name": "Email Service",
          "role": "Delivers password reset and verification emails",
          "dependencies": []
        }
      ],
      "relationships": [
        { "from": "c1", "to": "c2", "type": "calls", "description": "Login handler reads hashed password from user store to validate credentials" },
        { "from": "c1", "to": "c3", "type": "calls", "description": "Login handler calls token service to sign and return JWT" },
        { "from": "c3", "to": "c4", "type": "depends_on", "description": "Token signing requires access to the RSA private key" },
        { "from": "c5", "to": "c3", "type": "calls", "description": "Session middleware calls token service to verify each incoming JWT" },
        { "from": "c6", "to": "c7", "type": "calls", "description": "Password reset flow calls email service to deliver the reset link" }
      ],
      "coverage": 0.80
    },
    "patterns": [
      {
        "id": "p1",
        "name": "Key stored as environment variable",
        "description": "The RSA private key is stored in an environment variable (c4) rather than a secrets manager — this is a secret-sprawl pattern where the key is potentially logged, visible in process listings, and hard to rotate without a deployment",
        "type": "failure_mode",
        "evidence": ["c4"],
        "significance": "high"
      },
      {
        "id": "p2",
        "name": "No rate limiting on login endpoint",
        "description": "The login endpoint (c1) has no observable rate limiting in staging — credential stuffing and brute-force attacks can proceed unimpeded",
        "type": "absence",
        "evidence": ["c1"],
        "significance": "high"
      },
      {
        "id": "p3",
        "name": "Email as single authentication factor for reset",
        "description": "Password reset relies entirely on email deliverability (c7) — if the email service is down or the link is stolen (e.g., via email forwarding rules), account takeover is possible without any other control",
        "type": "failure_mode",
        "evidence": ["c6", "c7"],
        "significance": "high"
      },
      {
        "id": "p4",
        "name": "Token service is a single point of failure",
        "description": "Both login (c1) and session validation (c5) depend on the token service (c3) — if c3 fails or its key is rotated incorrectly, all authenticated sessions fail simultaneously",
        "type": "failure_mode",
        "evidence": ["c1", "c3", "c5"],
        "significance": "medium"
      }
    ],
    "synthesis": {
      "insights": [
        {
          "id": "i1",
          "insight": "Three of the four identified patterns are high-severity failure modes — this authentication service has a high concentration of risk in key management (p1), account takeover via brute force (p2), and account takeover via email compromise (p3)",
          "basis": ["p1", "p2", "p3"],
          "confidence": 0.85
        },
        {
          "id": "i2",
          "insight": "The key-in-env-var pattern (p1) and the single-point-of-failure pattern (p4) create correlated risk: an attacker who compromises the environment can both steal the signing key and disable all sessions simultaneously — these should be treated as a combined threat scenario, not two independent issues",
          "basis": ["p1", "p4"],
          "confidence": 0.78
        }
      ],
      "recommendations": [
        "Migrate RSA private key from environment variable to AWS Secrets Manager or HashiCorp Vault with automatic rotation",
        "Implement rate limiting on the login endpoint: 5 failed attempts per account per 15 minutes with exponential backoff",
        "Add a second factor (TOTP or magic link with a different channel) to the password reset flow for accounts flagged as sensitive",
        "Document and test token service failover: what happens when the token service is unavailable for 60 seconds during peak traffic?"
      ]
    }
  },
  "coverage": {
    "layersCovered": ["surface", "structural", "patterns", "synthesis"],
    "estimatedCompleteness": 0.65,
    "blindSpots": [
      "Session invalidation logic — what happens when a user logs out or when an admin forces a session revocation?",
      "Concurrent login handling — is there a race condition between session creation and token issuance under high concurrency?",
      "Audit logging — are failed authentication attempts logged with sufficient detail for incident investigation?"
    ],
    "wouldChangeAnalysisIf": [
      "Confirmation that rate limiting exists but is implemented at the infrastructure layer (e.g., WAF) rather than in the application — this would lower the severity of p2",
      "The key rotation procedure — if automated key rotation with zero-downtime is already implemented, p1 is significantly less severe"
    ]
  }
}
```

Natural-language summary: "The analysis covers four layers and identifies four patterns, three of which are high-severity. The non-obvious finding is i2: the key-in-env-var and the token-service SPOF are correlated risks — an attacker who compromises the environment gets both the ability to forge tokens and the ability to disrupt all existing sessions. The two most important blind spots are session invalidation (you can issue tokens but can you revoke them?) and concurrent login handling. Coverage is 0.65 — sufficient to surface the critical risks but not to certify the service as secure. The wouldChangeAnalysisIf items are the highest-value next investigative steps."
