---
name: think-analytical
description: Advanced analytical reasoning methods — Analogical (cross-domain mapping, structural similarity), FirstPrinciples (fundamental decomposition, axiom derivation), MetaReasoning (strategic oversight of your own reasoning process), and Cryptanalytic (code-breaking, pattern extraction, weighted Decibans evidence). Use when the user invokes `/think analogical`, `/think firstprinciples`, `/think metareasoning`, or `/think cryptanalytic`, or asks to map one domain to another, decompose to fundamentals, reason about reasoning, or extract signal from noise.
argument-hint: "[analogical|firstprinciples|metareasoning|cryptanalytic] <problem>"
---

# think-analytical — Advanced Analytical Reasoning Methods

## User Invocation

```
$ARGUMENTS
```

Parse these arguments. The first word should be `analogical`, `firstprinciples`, `metareasoning`, or `cryptanalytic`. The rest is the problem to reason about. If invoked via the `think` router, `$ARGUMENTS` is the same string the user originally typed after `/think`.

This category skill contains four advanced analytical reasoning methods: **Analogical** (cross-domain structural mapping), **First Principles** (axiom-up derivation), **Meta-Reasoning** (strategic oversight of reasoning itself), and **Cryptanalytic** (Deciban-weighted evidence accumulation).

---

## Analogical Reasoning

Analogical reasoning transfers knowledge from a well-understood **source domain** to a less-understood **target domain** by identifying structural similarities — entities, relations, and properties that map across. It is the cognitive engine behind metaphor, learning by example, and cross-disciplinary innovation.

The key move is **mapping**: not just saying "A is like B" but specifying exactly which entity in the source corresponds to which entity in the target, why, and how confident you are in each mapping. Strong analogies make explicit where they break down.

### When to Use

- Explaining an unfamiliar system using a familiar one (teaching)
- Adapting a known solution to a new problem (engineering)
- Generating design options by asking "what domain already solved this?"
- Validating a design by checking if the analogy's failure modes are mitigated

**Do not use Analogical** when:
- The source and target share surface features only (same vocabulary, different structure) — this produces misleading mappings
- You have enough information to reason directly about the target — the analogy adds noise
- The analogy's limitations are severe enough that transferred insights would be wrong in practice

### How to Reason Analogically

1. **Identify the source domain.** Choose a domain you understand well. Name its key entities, the relations between them, and any notable properties.
2. **Describe the target domain.** Name what you know. Do the same entity/relation inventory — even if incomplete.
3. **Map entities systematically.** For each source entity, find its structural counterpart in the target. Write the justification. Assign a confidence score in [0, 1]. A confidence below 0.5 means the mapping is speculative.
4. **Generate insights.** What does the source domain teach you about the target? These are concrete, non-obvious transfers — not just restatements of the mapping.
5. **Derive inferences.** What predictions does the source domain's behavior generate for the target? Mark each `needsVerification: true` unless already confirmed.
6. **State limitations explicitly.** Where does the analogy fail? Asymmetries between source and target — scale, mechanism, feedback loops — are where the analogy will mislead you. Every strong analogy has real limitations.
7. **Score the analogy.** `analogyStrength` in [0, 1]. High strength (>0.85) requires most entities mapping with confidence >0.8 and few severe limitations. Do not assign high strength if the analogy only works at a surface level.

### Output Format

See `reference/output-formats/analogical.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "analogical",
  "sourceDomain": {
    "name": "<well-understood domain>",
    "description": "<brief description>",
    "entities": [
      { "id": "e1", "name": "<entity>", "type": "<role>", "description": "<what it does>" }
    ],
    "relations": [],
    "properties": []
  },
  "targetDomain": {
    "name": "<domain to understand>",
    "description": "<brief description>",
    "entities": [
      { "id": "t1", "name": "<entity>", "type": "<role>", "description": "<what it does>" }
    ],
    "relations": [],
    "properties": []
  },
  "mappings": [
    {
      "sourceEntityId": "e1",
      "targetEntityId": "t1",
      "justification": "<why these correspond structurally>",
      "confidence": 0.0
    }
  ],
  "insights": [],
  "inferences": [],
  "limitations": ["<where the analogy breaks down>"],
  "analogyStrength": 0.0
}
```

### Verification Before Emitting

- `mode` is exactly `"analogical"`
- Both domains have at least one entity with `id`, `name`, `type`, and `description`
- Every mapping references real entity `id` values from the corresponding domain
- `limitations` is present and non-empty — omitting limitations is a reasoning failure
- `analogyStrength` is consistent with the distribution of mapping `confidence` values
- `needsVerification: true` on any inference not yet empirically confirmed

### Worked Example

Input: "Designing our caching layer — is it more like a CPU cache (LRU) or a CDN (geographic distribution)?"

The source domain is CPU Cache (L1/L2/L3 hardware). The target is our application Redis cache.

```json
{
  "mode": "analogical",
  "sourceDomain": {
    "name": "CPU Cache",
    "description": "Hardware L1/L2/L3 cache sitting between CPU registers and RAM",
    "entities": [
      { "id": "e1", "name": "Cache Miss", "type": "event", "description": "Data not found — fetch from slower memory tier" },
      { "id": "e2", "name": "LRU Eviction", "type": "policy", "description": "Least-recently-used entry evicted when cache is full" },
      { "id": "e3", "name": "Hit Rate", "type": "metric", "description": "Fraction of requests served from cache; high = low latency" },
      { "id": "e4", "name": "Cache Line", "type": "unit", "description": "Fixed-size block fetched atomically; locality of reference boosts efficiency" }
    ],
    "relations": [
      { "id": "r1", "type": "triggers", "from": "e1", "to": "e2", "description": "Miss may trigger eviction if space is needed" }
    ],
    "properties": []
  },
  "targetDomain": {
    "name": "Application Cache (Redis)",
    "description": "Redis layer between application servers and the primary database",
    "entities": [
      { "id": "t1", "name": "Cache Miss", "type": "event", "description": "Key not in Redis — falls through to database" },
      { "id": "t2", "name": "allkeys-lru Eviction", "type": "policy", "description": "LRU eviction under memory pressure" },
      { "id": "t3", "name": "Hit Rate", "type": "metric", "description": "Percentage of requests answered without a database round-trip" },
      { "id": "t4", "name": "Object Granularity", "type": "unit", "description": "Size of cached values; oversized objects waste memory" }
    ],
    "relations": [
      { "id": "tr1", "type": "triggers", "from": "t1", "to": "t2", "description": "Miss under memory pressure triggers LRU eviction" }
    ],
    "properties": []
  },
  "mappings": [
    { "sourceEntityId": "e1", "targetEntityId": "t1", "justification": "Both represent failure to find data in the fast tier, forcing a fallback to the slow tier", "confidence": 0.97 },
    { "sourceEntityId": "e2", "targetEntityId": "t2", "justification": "Both use LRU policy to decide which data to discard under capacity pressure", "confidence": 0.90 },
    { "sourceEntityId": "e3", "targetEntityId": "t3", "justification": "Hit rate is the primary performance indicator in both; high rate means low latency overhead", "confidence": 0.95 },
    { "sourceEntityId": "e4", "targetEntityId": "t4", "justification": "Both have a fundamental unit of storage; locality-of-reference benefits translate across domains", "confidence": 0.72 }
  ],
  "insights": [
    {
      "description": "Cache warm-up after a Redis restart is the application-layer equivalent of a CPU cold-start after power-on",
      "sourceEvidence": "CPUs pay full memory-access penalty on first access — every line is cold after boot",
      "targetApplication": "Route a pre-heat script before live traffic after Redis restarts or failovers",
      "novelty": 0.65
    }
  ],
  "inferences": [
    {
      "sourcePattern": "Prefetching adjacent cache lines improves throughput for sequential access patterns",
      "targetPrediction": "Pre-warming related keys (e.g., next page of paginated results) should reduce P99 latency for browsing users",
      "confidence": 0.70,
      "needsVerification": true
    }
  ],
  "limitations": [
    "CPU caches are hardware-managed and deterministic; Redis eviction is heuristic and approximate — do not rely on the analogy for precision capacity planning",
    "CPU cache size is fixed at design time; Redis can scale horizontally — the analogy breaks for multi-node setups",
    "A CDN analogy would be better for geographic distribution concerns — this analogy focuses on eviction and granularity, not topology"
  ],
  "analogyStrength": 0.88
}
```

Natural-language summary: "The CPU cache analogy is strong (0.88) for understanding eviction behavior, hit-rate optimization, and object granularity. It maps cleanly to Redis's LRU policy and miss/hit dynamics. It breaks down for geographic distribution (use a CDN analogy instead) and for multi-node scaling (different capacity model). The non-obvious transfer: plan for a post-restart warm-up period the same way a CPU takes time to fill its cache after power-on."

---

## First Principles Reasoning

First-principles reasoning builds understanding from the ground up by decomposing a question to its most fundamental truths — axioms, definitions, and confirmed observations — then deriving conclusions through explicit logical steps. It refuses to inherit received wisdom without examination.

The key discipline: **every step must cite a principle, and every principle must either be self-evident (axiom), definitionally true, empirically observed, or explicitly assumed.** Conclusions are only as certain as the weakest principle in the derivation chain.

This is the opposite of analogy-from-convention. Elon Musk's battery cost example is canonical: instead of accepting "batteries are expensive because they always have been," first-principles thinking asks "what are the raw material costs?" and builds from there.

### When to Use

- The inherited assumption is wrong or outdated and you suspect it
- You need to understand deeply, not just apply a known pattern
- Deriving a requirement or constraint from scratch (not from precedent)
- Innovating: non-obvious solutions emerge when you strip away convention

**Do not use First Principles** when:
- The inherited wisdom is well-validated and the problem is routine — it is wasteful to re-derive Newton's laws every time
- Speed matters more than depth and the assumption is harmless
- You are evaluating someone else's derivation (use Deductive or Critique instead)

### How to Reason from First Principles

1. **State the question sharply.** Frame it to invite decomposition: "What does X fundamentally require?" not "How do we do X?"
2. **Inventory principles.** List every foundational truth relevant to the question. Classify each:
   - **Axiom** — self-evident, requires no justification (no confidence score needed)
   - **Definition** — agreed meaning of a term (no confidence score needed)
   - **Observation** — empirically confirmed fact (add `confidence` reflecting measurement certainty)
   - **Assumption** — contextually plausible claim being treated as true (add `confidence` reflecting how sure you are)
3. **Challenge every received assumption.** For each thing that "everyone knows," ask: is it actually an axiom, or is it a convention that could be false?
4. **Derive step by step.** Each derivation step applies one principle and states the inference. Write the logical form if it helps make the step explicit.
5. **State the conclusion.** List the `derivationChain` (step numbers). The conclusion's `certainty` must not exceed the lowest confidence in any cited principle.
6. **Note limitations.** First-principles conclusions hold within the scope of their principles. State where the derivation's assumptions stop being valid.

### Output Format

See `reference/output-formats/firstprinciples.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "firstprinciples",
  "question": "<the fundamental question being asked>",
  "principles": [
    {
      "id": "p1",
      "type": "axiom|observation|definition|assumption",
      "statement": "<the principle>",
      "justification": "<why this is foundational>"
    }
  ],
  "derivationSteps": [
    {
      "stepNumber": 1,
      "principle": "p1",
      "inference": "<what is derived by applying this principle>",
      "logicalForm": "<optional: formal representation>",
      "confidence": 1.0
    }
  ],
  "conclusion": {
    "statement": "<derived conclusion>",
    "derivationChain": [1],
    "certainty": 0.0,
    "limitations": ["<where this conclusion stops applying>"]
  }
}
```

### Verification Before Emitting

- `mode` is exactly `"firstprinciples"`
- Every principle `id` is referenced in at least one `derivationSteps[*].principle`
- Every `derivationSteps[*].principle` references a real principle `id`
- No principle labeled `axiom` is actually a convention — if it could be false, it is an `assumption`
- `conclusion.certainty` does not exceed the lowest `confidence` in the cited principles
- `conclusion.limitations` is non-empty — every first-principles conclusion has scope boundaries
- The conclusion is genuinely *derived*, not just restated from the question

### Worked Example

Input: "From first principles, what does 'authentication' actually require?"

```json
{
  "mode": "firstprinciples",
  "question": "From first principles, what does 'authentication' actually require?",
  "principles": [
    { "id": "p1", "type": "definition", "statement": "Authentication is the process of verifying that an entity is who or what it claims to be", "justification": "Standard definitional baseline — not a technical assumption" },
    { "id": "p2", "type": "axiom", "statement": "A verifier can only distinguish identities it has prior knowledge of", "justification": "Without prior record, confirmation is logically impossible" },
    { "id": "p3", "type": "axiom", "statement": "Proof of identity requires presenting something the verifier can check against stored knowledge", "justification": "Without a checkable artifact, the claim is unfalsifiable and therefore unverifiable" },
    { "id": "p4", "type": "observation", "statement": "Verifiable artifacts fall into three categories: something you know, something you have, or something you are", "justification": "Exhaustive classification validated across decades of identity literature", "confidence": 0.95 },
    { "id": "p5", "type": "assumption", "statement": "The channel between prover and verifier may be adversarial", "justification": "Network threat model — not guaranteed but must be handled in production", "confidence": 0.90 }
  ],
  "derivationSteps": [
    { "stepNumber": 1, "principle": "p1", "inference": "Authentication is a binary decision: claimed identity either matches or it does not", "confidence": 1.0 },
    { "stepNumber": 2, "principle": "p2", "inference": "Authentication requires prior enrollment — the verifier must hold a reference before the attempt", "logicalForm": "verify(claim) requires stored(reference)", "confidence": 1.0 },
    { "stepNumber": 3, "principle": "p3", "inference": "The prover must present a checkable artifact; claims without artifacts cannot be verified", "logicalForm": "verify(claim) requires present(artifact) ∧ check(artifact, stored_reference)", "confidence": 1.0 },
    { "stepNumber": 4, "principle": "p4", "inference": "The artifact must be a secret, token, or biometric — any scheme is a combination of these three", "confidence": 0.95 },
    { "stepNumber": 5, "principle": "p5", "inference": "The artifact must be presented with a freshness proof to prevent replay attacks", "logicalForm": "secure_auth requires artifact ∧ freshness_proof (nonce, challenge-response)", "confidence": 0.90 }
  ],
  "conclusion": {
    "statement": "Authentication minimally requires: (1) prior enrollment of a reference, (2) presentation of a checkable artifact in one of the three canonical categories, and (3) a freshness mechanism to prevent replay. Anything labeled 'authentication' that omits any of these three is not verifying identity — it is accepting a claim on trust.",
    "derivationChain": [1, 2, 3, 4, 5],
    "certainty": 0.90,
    "limitations": [
      "Physical presence proofs bypass the replay concern but are out of scope for network protocols",
      "Zero-knowledge proofs satisfy these requirements without revealing identity — the framework holds, but the implementation differs"
    ]
  },
  "alternativeInterpretations": [
    "Authorization ('what are you allowed to do') is a separate problem excluded from this derivation",
    "Continuous re-authentication extends step 5 but does not change the fundamental requirements"
  ]
}
```

Natural-language summary: "Starting from the definition of authentication and two axioms about verification, three requirements emerge necessarily: enrollment, artifact presentation, and freshness. These are not design choices — they are logical necessities. Any 'authentication' scheme missing one of them is relying on trust, not verification. The insight: passwords without a nonce or challenge-response mechanism are vulnerable to replay by design — this is a structural gap, not an implementation bug."

---

## Meta-Reasoning

Meta-reasoning is reasoning **about** reasoning. While every other mode focuses on the problem, meta-reasoning focuses on the **reasoning process itself** — evaluating whether the current mode is working, deciding when to switch, and managing how cognitive effort is allocated across a session.

Think of it as the executive function of your reasoning system. It does not solve the problem directly; it asks: "Am I using the right approach to solve the problem? Am I making progress? What should I try instead?"

Meta-reasoning should be triggered explicitly — it is a costly mode that pays off when the primary reasoning has stalled or gone off-track.

### When to Use

- You have spent N thoughts without converging on a conclusion (rule of thumb: N ≥ 4 for simple, N ≥ 6 for complex problems)
- Two competing hypotheses have been open for multiple thoughts without resolution
- Confidence is declining rather than increasing with each additional thought
- The problem type does not obviously match the current mode's strengths
- You want to audit the overall quality of a reasoning session before presenting results

**Do not use Meta-Reasoning** when:
- The current mode is visibly converging — interrupting it adds overhead
- You are in the first 2–3 thoughts of any mode — not enough data to evaluate
- The question itself is what to think about (use Sequential or Shannon for scoping)

### How to Reason Meta-Analytically

1. **Describe the current strategy.** Name the mode, the approach, how many thoughts you have spent, and concrete progress indicators.
2. **Evaluate it honestly.** Score effectiveness, efficiency, confidence, progress rate, and overall quality (each in [0, 1]). List specific issues and specific strengths — not vague assessments.
3. **Generate alternatives.** For each plausible alternative mode, explain why it would help, what benefit to expect, and what it would cost to switch.
4. **Make a recommendation.** Choose one of five actions: `CONTINUE`, `SWITCH`, `REFINE`, `ABANDON`, or `COMBINE`. Name the target mode if switching. Justify with specifics.
5. **Allocate resources.** How many thoughts remain? What complexity and urgency warrant which allocation strategy?
6. **Score quality.** Assess the session on six dimensions: logical consistency, evidence quality, completeness, originality, clarity, and overall quality.
7. **Capture session context.** Record which modes have been used, how many mode switches have occurred, and the problem type.

### Output Format

See `reference/output-formats/metareasoning.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "metareasoning",
  "currentStrategy": {
    "mode": "<current ThinkingMode>",
    "approach": "<description of the current approach>",
    "thoughtsSpent": 0,
    "progressIndicators": ["<concrete evidence of progress or stalling>"]
  },
  "strategyEvaluation": {
    "effectiveness": 0.0,
    "efficiency": 0.0,
    "confidence": 0.0,
    "progressRate": 0.0,
    "qualityScore": 0.0,
    "issues": ["<what is not working>"],
    "strengths": ["<what is working>"]
  },
  "alternativeStrategies": [
    {
      "mode": "<candidate mode>",
      "reasoning": "<why this mode would help>",
      "expectedBenefit": "<concrete improvement>",
      "switchingCost": 0.0,
      "recommendationScore": 0.0
    }
  ],
  "recommendation": {
    "action": "CONTINUE|SWITCH|REFINE|ABANDON|COMBINE",
    "targetMode": "<mode to switch to, if SWITCH>",
    "justification": "<specific reasoning>",
    "confidence": 0.0,
    "expectedImprovement": "<what will get better>"
  },
  "resourceAllocation": {
    "thoughtsRemaining": 0,
    "complexityLevel": "low|medium|high",
    "urgency": "low|medium|high",
    "recommendation": "<how to allocate remaining effort>"
  },
  "qualityMetrics": {
    "logicalConsistency": 0.0,
    "evidenceQuality": 0.0,
    "completeness": 0.0,
    "originality": 0.0,
    "clarity": 0.0,
    "overallQuality": 0.0
  },
  "sessionContext": {
    "sessionId": "<session id>",
    "totalThoughts": 0,
    "modesUsed": [],
    "modeSwitches": 0,
    "problemType": "<problem classification>"
  }
}
```

### Verification Before Emitting

- `mode` is exactly `"metareasoning"`
- `recommendation.action` is one of the five valid enum values
- If `action` is `SWITCH`, `targetMode` is present and names a valid mode
- `strategyEvaluation` has all 7 fields with numeric values in [0, 1]
- `qualityMetrics` has all 6 fields with numeric values in [0, 1]
- `alternativeStrategies` is non-empty if the action is `SWITCH` or `COMBINE`
- `progressIndicators` contains concrete evidence, not vague claims like "making progress"
- The natural-language summary answers: "why is the current mode failing?" and "what will the switch achieve?"

### Worked Example

Input: "Am I using the right reasoning approach for this problem? I've been in sequential mode for 6 thoughts with no convergence."

```json
{
  "mode": "metareasoning",
  "currentStrategy": {
    "mode": "sequential",
    "approach": "Step-by-step decomposition of microservice latency degradation over the past week",
    "thoughtsSpent": 6,
    "progressIndicators": [
      "Eliminated GC pause via heap metrics (concrete progress)",
      "Two live hypotheses remain — DB saturation vs. network degradation — no discriminating evidence collected",
      "No convergence after 6 thoughts: diminishing returns detected"
    ]
  },
  "strategyEvaluation": {
    "effectiveness": 0.45,
    "efficiency": 0.40,
    "confidence": 0.55,
    "progressRate": 0.35,
    "qualityScore": 0.50,
    "issues": [
      "Six thoughts without convergence — sequential enumeration is too broad for this problem",
      "Two live hypotheses need direct comparison, not more enumeration",
      "Sequential mode does not naturally generate rival hypotheses for scoring"
    ],
    "strengths": [
      "GC hypothesis correctly eliminated early using objective heap data",
      "Comprehensive cause inventory completed — no candidate was missed"
    ]
  },
  "alternativeStrategies": [
    {
      "mode": "abductive",
      "reasoning": "Two live hypotheses (DB vs. network) are exactly the setup abductive mode is designed for: competing explanations requiring discriminating predictions",
      "expectedBenefit": "Forces generation of testable predictions per hypothesis and explicit scoring — should converge in 3-4 thoughts",
      "switchingCost": 0.25,
      "recommendationScore": 0.88
    },
    {
      "mode": "causal",
      "reasoning": "DB slowdown and network degradation may not be independent — causal graph would reveal whether one causes the other",
      "expectedBenefit": "Reveals hidden dependencies before isolating root cause",
      "switchingCost": 0.45,
      "recommendationScore": 0.62
    }
  ],
  "recommendation": {
    "action": "SWITCH",
    "targetMode": "abductive",
    "justification": "Six sequential thoughts without convergence is the canonical failure signal. Two competing hypotheses are present and need direct comparison with discriminating predictions. Abductive mode is designed exactly for this structure.",
    "confidence": 0.82,
    "expectedImprovement": "Root cause identified within 3-4 abductive thoughts rather than continuing to enumerate in sequential mode"
  },
  "resourceAllocation": {
    "thoughtsRemaining": 6,
    "complexityLevel": "medium",
    "urgency": "high",
    "recommendation": "Switch to abductive immediately. Do not invest more sequential thoughts — diminishing returns confirmed past thought 4."
  },
  "qualityMetrics": {
    "logicalConsistency": 0.75,
    "evidenceQuality": 0.60,
    "completeness": 0.45,
    "originality": 0.40,
    "clarity": 0.70,
    "overallQuality": 0.58
  },
  "sessionContext": {
    "sessionId": "sess-latency-debug-2026-04-11",
    "totalThoughts": 6,
    "modesUsed": ["sequential"],
    "modeSwitches": 0,
    "problemType": "incident-root-cause-analysis"
  }
}
```

Natural-language summary: "The current sequential mode has spent 6 thoughts without converging — a clear stall. The problem now has exactly two competing hypotheses, which is the ideal setup for abductive reasoning. Switching to abductive will force discriminating predictions (what would we observe if DB saturation were the cause? what if network degradation?) and explicit scoring. Expected convergence: 3-4 thoughts. Cost of switching is low (0.25) because the candidate inventory is already complete from sequential enumeration."

---

## Cryptanalytic Reasoning

Cryptanalytic reasoning applies **Alan Turing's deciban system** — a unit for quantifying the weight of evidence — to hypothesis testing in any domain where signal must be extracted from noise. Originally developed at Bletchley Park to break the Enigma cipher, the deciban framework is a general-purpose Bayesian evidence accumulator.

The core idea: each piece of evidence is assigned a **likelihood ratio** (how much more likely is this observation if the hypothesis is true vs. false?) and converted to **decibans** (10 × log₁₀ of the likelihood ratio). Decibans are additive across independent observations. The running total determines how close you are to confirmation (+20 decibans, ~100:1 odds) or refutation (−20 decibans).

This mode is not only for cipher-breaking. It applies to any situation where you must accumulate evidence methodically: security incident analysis, root cause investigation, fraud detection, diagnostic reasoning.

### When to Use

- Multiple hypotheses exist and you have quantifiable evidence to weigh
- Evidence arrives incrementally and you need to track how the balance of evidence shifts
- You need to separate signal from noise with an explicit, auditable method
- You want to know exactly when you have enough evidence to act (threshold reasoning)
- Historical pattern analysis where frequency deviations are meaningful

**Do not use Cryptanalytic** when:
- Only one hypothesis exists (you are not comparing — use Abductive to generate alternatives first)
- The evidence is purely qualitative with no way to estimate likelihood ratios
- The problem requires causal understanding rather than pattern matching

### How to Reason Cryptanalytically

1. **Form hypotheses.** Assign prior probabilities. Every hypothesis must be falsifiable — if no observation could count against it, it is not a hypothesis.
2. **Identify evidence types.** For cryptanalytic problems: frequency, pattern, crib (known plaintext), statistical, structural. For general problems, map these to your domain.
3. **Compute likelihood ratios.** For each piece of evidence E and hypothesis H: `LR = P(E|H) / P(E|¬H)`. This forces explicit reasoning about the base rate.
4. **Convert to decibans.** `decibans = 10 × log₁₀(LR)`. Positive: supports the hypothesis. Negative: refutes it. Zero: neutral.
5. **Sum the decibans.** Each independent observation's decibans add to the running total. This is the power of the system: evidence accumulates quantitatively.
6. **Check thresholds.** Confirmation threshold: +20 decibans (odds ~100:1). Refutation threshold: −20 decibans. Between them: inconclusive — gather more evidence.
7. **Update posterior probabilities.** The posterior reflects the prior shifted by the accumulated evidence.
8. **State the key insight.** What does the evidence chain say? What action does it recommend? What single observation would push you over a threshold?

### Output Format

See `reference/output-formats/cryptanalytic.md` for the authoritative JSON schema.

### Quick Template

```json
{
  "mode": "cryptanalytic",
  "thoughtType": "hypothesis_formation|frequency_analysis|evidence_accumulation|key_space_reduction|crib_analysis|banburismus|pattern_recognition|conclusion",
  "ciphertext": "<data or signal being analyzed, optional>",
  "assumptions": ["<what is assumed to be true>"],
  "dependencies": ["<prior analysis steps this builds on>"],
  "uncertainty": 0.0,
  "hypotheses": [
    {
      "id": "h1",
      "description": "<what this hypothesis claims>",
      "priorProbability": 0.0,
      "posteriorProbability": 0.0,
      "decibanScore": 0,
      "evidence": [],
      "status": "active"
    }
  ],
  "evidenceChains": [
    {
      "hypothesis": "<hypothesis description>",
      "observations": [
        {
          "observation": "<what was observed>",
          "decibans": 0,
          "likelihoodRatio": 1.0,
          "source": "frequency|pattern|crib|statistical|structural",
          "confidence": 0.0,
          "explanation": "<why this observation has this deciban value>"
        }
      ],
      "totalDecibans": 0,
      "oddsRatio": 1.0,
      "conclusion": "inconclusive",
      "confirmationThreshold": 20,
      "refutationThreshold": -20
    }
  ],
  "keyInsight": "<the actionable finding from this thought>"
}
```

### Verification Before Emitting

- `mode` is exactly `"cryptanalytic"`
- `thoughtType` is one of the eight valid values
- `assumptions` is non-empty — cryptanalytic reasoning always rests on assumptions; an empty list is a reasoning error
- `dependencies` correctly lists prior `thoughtType` values that this step builds on
- `uncertainty` decreases as evidence accumulates across thoughts
- All `decibans` values have a corresponding `likelihoodRatio` (linked: `decibans = 10 × log₁₀(LR)`)
- `evidenceChains[*].conclusion` is `"confirmed"` only if `totalDecibans ≥ confirmationThreshold`
- `keyInsight` answers "so what?" — not just a description of the computation

### Worked Example

Input: "Given these 50 authentication failures over 24 hours, is there a pattern suggesting a credential-stuffing attack vs. user forgetfulness?"

Two hypotheses are formed:
- h1: Credential-stuffing attack (scripted, automated, targeting many accounts)
- h2: User-error cascade (many users confused by a recent change)

Evidence chain for h1:

| Observation | LR | Decibans |
|-------------|-----|----------|
| 47/50 failures from a /24 subnet | 6.3 | +8.0 |
| 38 distinct accounts hit 1-2 times each | 4.5 | +6.5 |
| Inter-request timing: 1.2s ± 0.08s (highly regular) | 3.2 | +5.0 |
| **Total** | | **+19.5** |

Evidence against h2:

| Observation | LR | Decibans |
|-------------|-----|----------|
| No deployment in prior 24 hours | 0.32 | −5.0 |
| Failures spread across 38 accounts with no common session | 0.57 | −2.4 |
| **Total** | | **−7.4** |

```json
{
  "mode": "cryptanalytic",
  "thoughtType": "evidence_accumulation",
  "assumptions": [
    "The 50 failures are a representative sample of the failure window",
    "A scripted credential-stuffing tool uses consistent timing behavior",
    "Normal user retry patterns are distributed across many IPs and focused on a small number of accounts"
  ],
  "dependencies": ["hypothesis_formation", "frequency_analysis"],
  "uncertainty": 0.25,
  "currentHypothesis": {
    "id": "h1",
    "description": "Credential-stuffing attack: automated tool cycling through a breached credential list",
    "priorProbability": 0.35,
    "posteriorProbability": 0.78,
    "decibanScore": 19.5,
    "evidence": [
      { "observation": "47/50 failures from a /24 subnet", "decibans": 8.0, "likelihoodRatio": 6.3, "source": "pattern", "confidence": 0.95, "explanation": "Random user errors are distributed across many IPs; /24 concentration is a strong automation signal" },
      { "observation": "38 distinct accounts hit 1-2 times each", "decibans": 6.5, "likelihoodRatio": 4.5, "source": "statistical", "confidence": 0.90, "explanation": "Users forgetting passwords retry the same account; credential stuffing iterates across accounts" },
      { "observation": "Inter-request timing 1.2s ± 0.08s (highly regular)", "decibans": 5.0, "likelihoodRatio": 3.2, "source": "pattern", "confidence": 0.88, "explanation": "0.08s standard deviation over 50 requests implies scripted rather than human behavior" }
    ],
    "status": "active"
  },
  "evidenceChains": [
    {
      "hypothesis": "Credential-stuffing attack (h1)",
      "observations": [
        { "observation": "47/50 failures from a /24 subnet", "decibans": 8.0, "likelihoodRatio": 6.3, "source": "pattern", "confidence": 0.95 },
        { "observation": "38 distinct accounts hit 1-2 times each", "decibans": 6.5, "likelihoodRatio": 4.5, "source": "statistical", "confidence": 0.90 },
        { "observation": "Inter-request timing 1.2s ± 0.08s", "decibans": 5.0, "likelihoodRatio": 3.2, "source": "pattern", "confidence": 0.88 }
      ],
      "totalDecibans": 19.5,
      "oddsRatio": 89.1,
      "conclusion": "inconclusive",
      "confirmationThreshold": 20,
      "refutationThreshold": -20
    }
  ],
  "keyInsight": "At 19.5 decibans (odds ~89:1), the credential-stuffing hypothesis is just below the 20-deciban confirmation threshold. One more independent signal — e.g., matching the 38 usernames against a known breached credential list — would cross the threshold. Immediate action without waiting for confirmation: rate-limit the three source /24 IPs and require MFA for the 38 affected accounts. The cost of waiting to confirm is higher than the cost of acting on 89:1 odds."
}
```

Natural-language summary: "Three independent signals — IP concentration, account breadth pattern, and timing regularity — together give 19.5 decibans for credential stuffing. The h2 (user-error) hypothesis is strongly refuted by the absence of any deployment trigger. The evidence chain is one signal short of formal confirmation, but at 89:1 odds the operational decision is clear: block the source subnet and force MFA on affected accounts while collecting the final confirming signal."
