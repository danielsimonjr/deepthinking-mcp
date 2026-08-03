# Format Grammar: Markdown

How to encode a deepthinking-plugin thought into Markdown for human-readable documentation, issue comments, PR descriptions, and wiki pages.

## Format Overview

Markdown renders structured thoughts as human-readable documents using headings, bullet lists, tables, blockquotes, and optional collapsible sections. Universally supported across GitHub, GitLab, Obsidian, Typora, Discord, Slack, and email. Strong for documentation, issue comments, pull request descriptions, and knowledge bases. Balances readability with enough structure to preserve semantic information and enable parsing.

Markdown is the bridge format between machine JSON and human readers. Every semantic element has a clear markdown equivalent, and rendering is consistent across platforms.

## Encoding Rules

### Document Structure

- **Top-level heading** (`# <mode display name>`): One per thought, e.g. `# Bayesian Reasoning`
- **Field groups** (`## <field name>`): Each major field is a section, e.g. `## Hypothesis`, `## Evidence`, `## Posterior`
- **Subsections** (`### <detail>`): For nested structures (e.g. `### Evidence Item 1`, `### Alternative Hypotheses`)
- **Metadata section** (`## Metadata`): At end with tags, session ID, confidence, related modes

### Field Encoding

- **Simple scalar fields** (text, numbers): Bullet list with label
  ```markdown
  - **Prior Probability**: 0.30 (30%)
  - **Confidence**: 0.70 (70%)
  - **Bayes Factor**: 4.5
  ```

- **Arrays of objects** (evidence, hypotheses, trade studies, arguments): Markdown table with one row per element
  ```markdown
  | Claim | Prior | Support |
  |-------|-------|---------|
  | Cache leak | 0.30 | 30% historical rate |
  | Connection pool | 0.35 | Alternative |
  | Log accumulation | 0.35 | Alternative |
  ```

- **Nested objects**: Nested subheading with nested bullet list
  ```markdown
  ### Posterior Analysis
  - **Probability**: 0.66 (66%)
  - **Confidence**: 0.70
  - **Bayes Factor**: 4.5
  ```

- **Numerical probabilities**: Always show as `0.XX (XX%)` for readability
- **Ranges**: Use `[0.1 .. 0.8]` or `0.1–0.8` with plain text
- **Long `content` fields**: Use blockquote (`>`) to visually separate narrative
- **Proofs or step sequences**: Ordered list (`1.`, `2.`, `3.`)
- **Assumptions or axioms**: Bulleted list with `⚠️` or `🔑` emoji prefix

### Semantic Annotations

- **Supporting evidence/arguments**: Prefix with `✓` or `[GREEN]`
- **Contradicting evidence**: Prefix with `✗` or `[RED]`
- **Uncertain claims**: Prefix with `⚠️` or `[ORANGE]`
- **Neutral facts**: Prefix with `ℹ️` or `[BLUE]`
- **Meta/reasoning-about-reasoning**: Prefix with `◆` or `[PURPLE]`
- **Skipped/deferred**: Prefix with `—` or `[GRAY]`

### Collapsible Sections (Optional, GitHub/GitLab Only)

For long details or additional analysis, use HTML `<details>` tags:

```markdown
<details>
<summary>Sensitivity Analysis</summary>

- **Prior range**: [0.1, 0.5]
- **Posterior range**: [0.33, 0.82]
- **Conclusion**: Moderate sensitivity to prior belief

</details>
```

### Links and References

- **Internal**: Link to related modes, session notes, evidence sources
  ```markdown
  See also: [Causal Analysis](#), [Scientific Method](#)
  ```
- **External**: HTTP links with title
  ```markdown
  [Memory leak investigation log](https://example.com/logs)
  ```

## Template

```markdown
# <Mode Display Name>

<1-sentence summary of the thought>

## Hypothesis / Claim

<main claim or hypothesis under consideration>

- **Key detail 1**: Value
- **Key detail 2**: Value

## Evidence / Arguments / Steps

### Evidence Item 1

<description>

- **Type**: <supporting/contradicting/neutral>
- **Strength**: <0.0–1.0>

### Evidence Item 2

<description>

- **Type**: <supporting/contradicting/neutral>
- **Strength**: <0.0–1.0>

## Analysis

<narrative explanation of reasoning>

### Sub-Analysis 1

<detailed breakdown>

- Point A
- Point B

## Conclusion / Result

<summary of findings>

- **Primary finding**: <result>
- **Confidence**: <0.XX (XX%)>
- **Caveats**: <limitations or qualifications>

## Metadata

- **Session ID**: <id>
- **Timestamp**: <ISO 8601>
- **Tags**: <comma-separated list>
- **Related Modes**: <list of related reasoning modes>
```

## Worked Example

### Input: Bayesian Memory Leak Scenario

```json
{
  "mode": "bayesian",
  "hypothesis": {
    "claim": "Caching layer is the cause of memory leak",
    "prior": 0.30,
    "justification": "30% of memory issues traced to caching over 18 months"
  },
  "alternatives": [
    {"claim": "Connection pool leak", "prior": 0.35},
    {"claim": "Log accumulation", "prior": 0.35}
  ],
  "evidence": [
    {
      "description": "Heap dump shows 40% memory in cache objects",
      "likelihood_given_h": 0.90,
      "likelihood_given_not_h": 0.20
    }
  ],
  "posterior": {
    "probability": 0.66,
    "confidence": 0.70,
    "bayes_factor": 4.5
  }
}
```

### Markdown Output

```markdown
# Bayesian Reasoning: Memory Leak Root Cause

Analysis of suspected memory leak root cause using Bayesian inference with heap dump evidence.

## Hypothesis

Caching layer is the cause of the memory leak.

- **Prior Probability**: 0.30 (30%)
- **Justification**: 30% of memory issues traced to caching over 18 months
- **Status**: Under evaluation

## Alternative Hypotheses

| Alternative | Prior | Basis |
|-------------|-------|-------|
| Connection pool leak | 0.35 (35%) | Pool exhaustion patterns |
| Log accumulation | 0.35 (35%) | Unbounded log growth |

## Evidence

### Evidence 1: Heap Dump Analysis

Heap dump collected from production environment shows memory distribution across object types.

- **Observation**: Cache objects occupy 40% of heap memory
- **Likelihood given hypothesis**: P(E \| H) = 0.90 (90%)
- **Likelihood given NOT hypothesis**: P(E \| ¬H) = 0.20 (20%)
- **Bayes Factor**: BF = 0.90 / 0.20 = 4.5 (moderate evidence)
- **Assessment**: ✓ Strongly consistent with caching hypothesis

## Bayesian Calculation

Using Bayes' theorem to update belief in light of evidence:

$$P(H|E) = \frac{P(E|H) \times P(H)}{P(E|H) \times P(H) + P(E|¬H) \times (1-P(H))}$$

**Substituting values:**
- P(E|H) = 0.90
- P(H) = 0.30
- P(E|¬H) = 0.20
- P(¬H) = 0.70

$$P(H|E) = \frac{0.90 \times 0.30}{(0.90 \times 0.30) + (0.20 \times 0.70)} = \frac{0.27}{0.41} = 0.66$$

## Posterior Belief

**Updated belief after observing evidence:**

- **Posterior Probability**: 0.66 (66%)
- **Confidence Level**: 0.70 (70%)
- **Bayes Factor**: 4.5
- **Conclusion**: ✓ Caching layer is the likely cause

**Interpretation**: The evidence increases our confidence from 30% (prior) to 66% (posterior). The moderate Bayes factor (4.5) indicates solid but not overwhelming support.

<details>
<summary>Sensitivity Analysis</summary>

How robust is the posterior to changes in the prior?

| Prior Range | Posterior Range | Sensitivity |
|-------------|-----------------|-------------|
| [0.10, 0.50] | [0.33, 0.82] | Moderate |

**Interpretation**: If the true prior were as low as 10%, the posterior would be 33%. If the prior were 50%, the posterior would be 82%. The posterior is moderately sensitive to the prior assumption, but stays in the "likely cause" territory across the plausible prior range.

</details>

## Recommended Next Steps

1. **Validate hypothesis**: Add instrumentation to caching layer to confirm object growth
2. **Test alternative**: Profile connection pool behavior under load
3. **Gather more evidence**: Analyze historical memory trends for caching patterns
4. **Implementation**: If confirmed, evaluate cache eviction policies or size limits

## Metadata

- **Mode**: Bayesian
- **Session ID**: session-12345
- **Timestamp**: 2026-04-11T15:30:00Z
- **Tags**: memory-leak, production-issue, high-priority, debugging
- **Related Modes**: Causal Analysis, Scientific Method
- **Confidence**: 0.70
```

## Per-Mode Considerations

### Excellent in Markdown

- **Bayesian**: Tables for evidence items, posterior, and sensitivity analysis. Blockquote for narrative. Good semantic flow.
- **Abductive**: Table for ranked hypotheses. List for supporting observations. Clear comparison of alternatives.
- **Engineering**: Trade-study table with columns for each option (cost, performance, reliability). Pros/cons bullets.
- **Argumentation**: Toulmin layout with claim, evidence, warrant, backing columns in a table. Counterargument subsections.
- **Critique**: Main argument as claim, weaknesses as subsections with severity indicators (✗, ⚠️).
- **Analysis**: Systematic breakdown with main findings as headings, supporting details as bullets. Clear narrative flow.
- **Sequential/Synthesis**: Ordered list for steps; thesis/antithesis/synthesis as major sections.

### Moderate in Markdown

- **Causal**: Can work with boxes and arrows in ASCII or diagram, but markdown alone is limited. Use Mermaid syntax block within markdown instead.
- **Scientific Method**: Hypothesis/Method/Results/Conclusion structure maps well, but experimental designs with multiple variables clutter list format. Consider table for variables.
- **Formal Logic**: Proof steps as ordered list; axioms as blockquote. Readable but dense for complex proofs.

### Challenging in Markdown

- **SystemsThinking**: 8 archetypes with feedback loops difficult to represent; use Mermaid diagram block instead.
- **GameTheory**: Payoff matrices need tables (workable), but strategic reasoning across multiple rounds is hard to show linearly.
- **Recursive**: Deeply nested structures; markdown tables get unwieldy. Use code block with indentation or Mermaid tree instead.
- **Modal/Stochastic**: Multiple possible worlds or probability distributions hard to show in flat markdown. Use JSON block or diagram.

## Rendering Tools

### Universal Support

- **GitHub**: Full markdown rendering (tables, collapsible sections with `<details>`)
- **GitLab**: Markdown + Mermaid diagram support
- **Obsidian**: Markdown with LaTeX math support
- **Typora**: WYSIWYG markdown editor with live preview
- **Discord**: Basic markdown (no tables or collapsible, but bold/italic/code work)
- **Slack**: Markdown subset (bold, italic, code, blockquote, lists)
- **Email**: Most mail clients support markdown if HTML is enabled
- **VS Code**: Preview with `Ctrl+Shift+V` (built-in)

### Conversion Tools

- **Pandoc**: Convert markdown to docx, PDF, LaTeX, HTML
  ```bash
  pandoc thought.md -o thought.pdf
  pandoc thought.md -o thought.docx
  ```
- **mdtopdf**: Markdown to PDF with styling
- **Markdown Lint**: Validate markdown syntax

### Embedding in Other Formats

- **HTML**: `<pre><code>` or direct HTML rendering with `--from markdown --to html5`
- **LaTeX**: Pandoc conversion for academic papers
- **Confluence**: Paste markdown; Confluence auto-converts to JIRA markup

### Recommended Workflow

1. **Generate markdown** from thought object template
2. **Render in browser** or editor for human review
3. **Embed in issue/PR/wiki**: Copy-paste rendered markdown
4. **Archive**: Export to PDF if needed for long-term storage
5. **Integrate with documentation**: Include in project README or docs folder

---

**Last Updated**: 2026-04-11  
**Format Stability**: Stable  
**Target Audience**: Documentation writers, issue reporters, knowledge base maintainers, technical communicators
