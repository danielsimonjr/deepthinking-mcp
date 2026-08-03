# Reasoning Mode Taxonomy

This file is the canonical reference for which mode applies to which problem shape.

## How to Read This File

When a category skill is loaded, the skill can read from this taxonomy to (a) confirm the problem fits its mode, and (b) recommend switching to a different mode if it does not fit.

## v0.2.0 Modes (all 38 available)

---

### Standard Modes (`think-standard`)

### Sequential (`sequential`)
- **Category:** `think-standard`
- **Shape:** Iterative planning with revision
- **Signals:** "plan", "break down", "steps to", "how to approach"
- **Anti-signals:** Formal logical inference (use deductive), pattern-from-cases (use inductive)

### Shannon (`shannon`)
- **Category:** `think-standard`
- **Shape:** Information-theoretic problem decomposition tracking uncertainty across 5 stages
- **Signals:** "uncertainty", "information content", "entropy", "what do we know at each stage"
- **Anti-signals:** Deterministic step-by-step planning (use sequential), probabilistic belief update (use bayesian)

### Hybrid (`hybrid`)
- **Category:** `think-standard`
- **Shape:** Multi-mode composition for cross-cutting multidimensional problems
- **Signals:** "combine approaches", "this needs both X and Y reasoning", explicitly multidimensional problems
- **Anti-signals:** Single-dimension problems that fit cleanly into one mode

---

### Core Modes (`think-core`)

### Inductive (`inductive`)
- **Category:** `think-core`
- **Shape:** Observations → pattern → generalization
- **Signals:** Multiple specific examples, "pattern", "trend", "in general", "these all..."
- **Anti-signals:** Premise-driven inference (use deductive), single-case analysis (use sequential)

### Deductive (`deductive`)
- **Category:** `think-core`
- **Shape:** Premises → logical inference → conclusion
- **Signals:** "if X then Y", explicit rules, syllogisms, "can we conclude"
- **Anti-signals:** Uncertain premises (use bayesian), observation-driven reasoning (use inductive)

### Abductive (`abductive`)
- **Category:** `think-core`
- **Shape:** Surprising observation → competing hypotheses → best explanation
- **Signals:** "best explanation", "most likely cause", one unexplained phenomenon with multiple candidate causes
- **Anti-signals:** Data-driven generalization (use inductive), established premises (use deductive)

---

### Mathematics Modes (`think-mathematics`)

### Mathematics (`mathematics`)
- **Category:** `think-mathematics`
- **Shape:** Formal proof, algebraic reasoning, mathematical modeling
- **Signals:** "prove", "theorem", "derive", "algebraic", formal mathematical notation present
- **Anti-signals:** Physical intuition without formal proof (use physics), computational complexity (use computability)

### Physics (`physics`)
- **Category:** `think-mathematics`
- **Shape:** Physical models, conservation laws, tensor analysis, symmetries
- **Signals:** "force", "energy", "conservation", "field", "tensor", physical units present
- **Anti-signals:** Pure mathematical proof (use mathematics), computational theory (use computability)

### Computability (`computability`)
- **Category:** `think-mathematics`
- **Shape:** Decidability, complexity classes, Turing machines, reductions
- **Signals:** "decidable", "NP-hard", "reduction", "Turing machine", "P vs NP", complexity class notation
- **Anti-signals:** Practical algorithm choice (use algorithmic), physical computation (use physics)

---

### Temporal Modes (`think-temporal`)

### Temporal (`temporal`)
- **Category:** `think-temporal`
- **Shape:** Event ordering, time intervals, Allen relations, sequence vs. causation
- **Signals:** "before", "after", "during", "overlaps", "timeline", "sequence of events", Allen interval relations
- **Anti-signals:** Causal mechanism (use causal), historical patterns (use historical)

### Historical (`historical`)
- **Category:** `think-temporal`
- **Shape:** Source reliability, precedent analysis, patterns across historical episodes
- **Signals:** "historical precedent", "source reliability", "what happened in past cases", primary/secondary sources
- **Anti-signals:** Formal time-interval reasoning (use temporal), current-events causation (use causal)

---

### Probabilistic Modes (`think-probabilistic`)

### Bayesian (`bayesian`)
- **Category:** `think-probabilistic`
- **Shape:** Prior → likelihood × evidence → posterior belief update
- **Signals:** "probability", "prior", "likelihood", "update belief", "given evidence", "posterior"
- **Anti-signals:** Multi-source fusion without single prior (use evidential), deterministic rules (use deductive)

### Evidential (`evidential`)
- **Category:** `think-probabilistic`
- **Shape:** Multi-source evidence fusion with Dempster-Shafer belief/plausibility
- **Signals:** "multiple sources", "conflicting evidence", "belief function", "plausibility", "mass assignment"
- **Anti-signals:** Single-prior update (use bayesian), stochastic process modeling (use stochastic)

---

### Causal Modes (`think-causal`)

### Causal (`causal`)
- **Category:** `think-causal`
- **Shape:** Cause-effect mechanisms, confounders, causal graphs
- **Signals:** "caused by", "mechanism", "confounder", "causal graph", "intervention effect", "why did X happen"
- **Anti-signals:** Hypothetical alternative histories (use counterfactual), temporal ordering only (use temporal)

### Counterfactual (`counterfactual`)
- **Category:** `think-causal`
- **Shape:** What-if reasoning, interventions, alternative histories
- **Signals:** "what if", "had we done X instead", "alternative scenario", "would have", "could have prevented"
- **Anti-signals:** Actual cause tracing (use causal), future planning (use sequential or optimization)

---

### Strategic Modes (`think-strategic`)

### Game Theory (`gametheory`)
- **Category:** `think-strategic`
- **Shape:** Multi-agent strategic interaction, Nash equilibria, payoff matrices
- **Signals:** "player", "strategy", "payoff", "Nash equilibrium", "dominant strategy", multiple rational agents
- **Anti-signals:** Single-agent optimization (use optimization), physical constraints only (use constraint)

### Optimization (`optimization`)
- **Category:** `think-strategic`
- **Shape:** Finding the best allocation given an objective function and constraints
- **Signals:** "maximize", "minimize", "optimal", "objective function", "trade-off", "best allocation"
- **Anti-signals:** Feasibility only (use constraint), multi-agent interdependence (use gametheory)

### Constraint (`constraint`)
- **Category:** `think-strategic`
- **Shape:** Satisfying a set of hard rules (feasibility, not optimality)
- **Signals:** "must satisfy", "hard constraints", "feasible", "compliance", "rules that cannot be violated"
- **Anti-signals:** Optimizing a value (use optimization), agent strategy (use gametheory)

---

### Analytical Modes (`think-analytical`)

### Analogical (`analogical`)
- **Category:** `think-analytical`
- **Shape:** Structural similarity mapping between source and target domains
- **Signals:** "analogous to", "similar to", "this is like", "maps to", cross-domain transfer
- **Anti-signals:** First-principles decomposition (use firstprinciples), formal proof (use mathematics)

### First Principles (`firstprinciples`)
- **Category:** `think-analytical`
- **Shape:** Decomposing to fundamental truths and rebuilding from axioms
- **Signals:** "from scratch", "fundamentals", "axioms", "why is this true at the base level", "ignore assumptions"
- **Anti-signals:** Analogy-based reasoning (use analogical), surface-level analysis (use analysis)

### Meta-Reasoning (`metareasoning`)
- **Category:** `think-analytical`
- **Shape:** Reasoning about the reasoning process itself — monitoring and switching modes
- **Signals:** "which approach should I use", "is my reasoning sound", "am I using the right method", meta-level questions
- **Anti-signals:** Object-level domain questions that fit another mode directly

### Cryptanalytic (`cryptanalytic`)
- **Category:** `think-analytical`
- **Shape:** Signal-from-noise extraction, Decibans-weighted evidence, pattern breaking
- **Signals:** "hidden signal", "noise", "Decibans", "weight of evidence", "pattern in cipher", statistical anomaly detection
- **Anti-signals:** Straightforward evidence evaluation (use evidential), clear causal chain (use causal)

---

### Scientific Modes (`think-scientific`)

### Scientific Method (`scientificmethod`)
- **Category:** `think-scientific`
- **Shape:** Hypothesis → prediction → experiment → observation → revision (falsifiability)
- **Signals:** "hypothesis", "experiment", "falsifiable", "test", "prediction", "null hypothesis"
- **Anti-signals:** Deductive proof (use formallogic), systems-level feedback (use systemsthinking)

### Systems Thinking (`systemsthinking`)
- **Category:** `think-scientific`
- **Shape:** Feedback loops, systems archetypes, leverage points, emergent behavior
- **Signals:** "feedback loop", "emergent", "archetype", "leverage point", "unintended consequence", "whole system"
- **Anti-signals:** Single-agent optimization (use optimization), linear cause-effect (use causal)

### Formal Logic (`formallogic`)
- **Category:** `think-scientific`
- **Shape:** Propositional and predicate logic, formal proof structures, natural deduction
- **Signals:** "∀", "∃", "natural deduction", "predicate calculus", "proof system", strict formal notation
- **Anti-signals:** Intuitive inference (use deductive), empirical testing (use scientificmethod)

---

### Engineering Modes (`think-engineering`)

### Engineering (`engineering`)
- **Category:** `think-engineering`
- **Shape:** Design trade-offs, FMEA, trade studies, constraint-driven decisions
- **Signals:** "design decision", "trade study", "FMEA", "failure mode", "requirements", engineering constraints
- **Anti-signals:** Pure algorithm analysis (use algorithmic), mathematical proof (use mathematics)

### Algorithmic (`algorithmic`)
- **Category:** `think-engineering`
- **Shape:** CLRS algorithm selection, complexity analysis, data structure choice
- **Signals:** "algorithm", "time complexity", "data structure", "Big-O", "sorting", "graph traversal"
- **Anti-signals:** Theoretical computability (use computability), system design trade-offs (use engineering)

---

### Academic Modes (`think-academic`)

### Synthesis (`synthesis`)
- **Category:** `think-academic`
- **Shape:** Integrating multiple sources with coverage tracking (literature review)
- **Signals:** "synthesize", "literature review", "multiple papers", "integrate sources", "coverage"
- **Anti-signals:** Single-source critique (use critique), original argument building (use argumentation)

### Argumentation (`argumentation`)
- **Category:** `think-academic`
- **Shape:** Building arguments using the Toulmin model (claim/warrant/backing/rebuttal)
- **Signals:** "argument", "claim", "warrant", "backing", "rebuttal", "Toulmin", persuasive structure
- **Anti-signals:** Evidence synthesis (use synthesis), formal logical proof (use formallogic)

### Critique (`critique`)
- **Category:** `think-academic`
- **Shape:** Peer-review evaluation with Socratic questions and strengths/weaknesses
- **Signals:** "evaluate", "review", "critique", "strengths and weaknesses", "Socratic", "assess this"
- **Anti-signals:** Building an argument (use argumentation), synthesizing sources (use synthesis)

### Analysis (`analysis`)
- **Category:** `think-academic`
- **Shape:** Layered systematic decomposition (surface → structure → patterns → synthesis)
- **Signals:** "analyze", "break down", "decompose", "layers", "systematic examination", multi-layer structure
- **Anti-signals:** Step-by-step planning (use sequential), formal proof (use formallogic)

---

### Advanced Modes (`think-advanced`)

### Recursive (`recursive`)
- **Category:** `think-advanced`
- **Shape:** Self-referential problem decomposition (base case + recursive case + halting)
- **Signals:** "recursive", "self-similar", "base case", "sub-problem", "fractal structure", "solve by reduction"
- **Anti-signals:** Non-self-similar sequential planning (use sequential), computability theory (use computability)

### Modal (`modal`)
- **Category:** `think-advanced`
- **Shape:** Possibility/necessity reasoning (alethic, epistemic, deontic modalities)
- **Signals:** "necessarily", "possibly", "must", "might", "ought to", modal operators, possible worlds
- **Anti-signals:** Deterministic deduction (use deductive), empirical probability (use bayesian)

### Stochastic (`stochastic`)
- **Category:** `think-advanced`
- **Shape:** Probability distributions, random processes, Monte Carlo analysis
- **Signals:** "distribution", "random variable", "Monte Carlo", "expected value", "variance", stochastic process
- **Anti-signals:** Single belief update (use bayesian), deterministic optimization (use optimization)

---

### Framework Modes (`think-frameworks`)

### 5W1H (`5w1h`)
- **Category:** `think-frameworks`
- **Shape:** Problem scoped across Who/What/When/Where/Why/How
- **Signals:** "who/what/when/where/why/how", "define the problem", "5W1H", "scope this incident"
- **Anti-signals:** Already-scoped root-cause drilling (use fivewhys/fishbone), strategic assessment (use swot)

### SWOT (`swot`)
- **Category:** `think-frameworks`
- **Shape:** 2x2 grid — Strengths/Weaknesses (internal) x Opportunities/Threats (external)
- **Signals:** "SWOT", "strengths/weaknesses", "strategic position", "should we pursue this"
- **Anti-signals:** Root-cause analysis (use fivewhys/fishbone), problem scoping with no strategic dimension (use 5w1h)

### 5 Whys (`fivewhys`)
- **Category:** `think-frameworks`
- **Shape:** Linear chain: problem → why1 → why2 → ... → root cause
- **Signals:** "5 whys", "root cause", "why did this happen", single expected causal chain
- **Anti-signals:** Multiple independent cause categories (use fishbone), strategic assessment (use swot)

### Fishbone / Ishikawa (`fishbone`)
- **Category:** `think-frameworks`
- **Shape:** Spine to effect with category "ribs" (6Ms or domain-specific categories) branching off
- **Signals:** "fishbone", "Ishikawa", "categorize causes", "6Ms", multiple contributing categories
- **Anti-signals:** Single linear causal chain (use fivewhys), problem not yet scoped (use 5w1h)

### PESTLE (`pestle`)
- **Category:** `think-frameworks`
- **Shape:** Six-lane external macro-environment scan — Political, Economic, Social, Technological, Legal, Environmental
- **Signals:** "PESTLE", "environmental scan", "macro factors", "regulatory landscape", market-entry/expansion assessment
- **Anti-signals:** Internal capability assessment alongside external factors (use swot), root-cause analysis (use fivewhys/fishbone)

### Force Field Analysis (`forcefield`)
- **Category:** `think-frameworks`
- **Shape:** Driving forces vs. restraining forces, each strength-rated 1-5, opposing a proposed change
- **Signals:** "force field", "driving/restraining forces", "change readiness", "why isn't this change happening"
- **Anti-signals:** Root-cause analysis (use fivewhys/fishbone), general strategic assessment with no named change (use swot)

### Decision Matrix (`decisionmatrix`)
- **Category:** `think-frameworks`
- **Shape:** Scored grid — options (rows) x weighted criteria (columns), weighted-sum totals
- **Signals:** "decision matrix", "weighted criteria", "compare options", "which option should we pick"
- **Anti-signals:** Open-ended option generation (matrix needs options already named), single-criterion ranking (no weighting needed)

### Pareto / 80-20 (`pareto`)
- **Category:** `think-frameworks`
- **Shape:** Sorted contributors by value with a cumulative-percentage "vital few" cutoff
- **Signals:** "Pareto", "80/20", "vital few", "prioritize", ranked contributors by volume/impact
- **Anti-signals:** No meaningful value/volume to rank by, comparing a small fixed option set on multiple criteria (use decisionmatrix)

### Stakeholder Analysis (`stakeholder`)
- **Category:** `think-frameworks`
- **Shape:** Power/interest 2x2 grid — Manage Closely, Keep Satisfied, Keep Informed, Monitor
- **Signals:** "stakeholder", "power/interest", "manage stakeholders", "who do we need to bring along"
- **Anti-signals:** Comparing options rather than people (use decisionmatrix), general strategic assessment with no named stakeholders (use swot)

### Cost-Benefit Analysis (`costbenefit`)
- **Category:** `think-frameworks`
- **Shape:** Itemized costs vs. itemized benefits for one option, with ROI/NPV/payback
- **Signals:** "cost-benefit", "ROI", "NPV", "payback", justify a single investment in dollar terms
- **Anti-signals:** Comparing multiple options against each other (use decisionmatrix), non-quantifiable tradeoffs (use swot/forcefield)

### Risk Assessment (`riskassessment`)
- **Category:** `think-frameworks`
- **Shape:** Risks scored by probability × impact, ranked for mitigation priority
- **Signals:** "risk assessment", "probability × impact", "risk matrix", "what could go wrong"
- **Anti-signals:** Weighing forces for/against a change in general (use forcefield), root-causing something that already happened (use fivewhys/fishbone)

### Gap Analysis (`gapanalysis`)
- **Category:** `think-frameworks`
- **Shape:** Current state vs. desired state across dimensions, each with a delta and closing action, rolling up into an action plan
- **Signals:** "gap analysis", "current vs desired", "capability gap", maturity assessment against a target state
- **Anti-signals:** No meaningful current-vs-desired framing (use swot), comparing discrete options (use decisionmatrix)
