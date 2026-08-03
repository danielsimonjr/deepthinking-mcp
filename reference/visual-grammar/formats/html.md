# Format Grammar: HTML

How to encode a deepthinking-plugin thought into static semantic HTML5.

## Format Overview

HTML is used to produce static, browser-renderable representations of deepthinking thoughts suitable for:

- **Documentation sites** — Embedding thought visualizations in project wikis, runbooks, or technical blogs
- **README previews** — Inline HTML thought summaries with collapsible sections
- **Reporting systems** — Automated HTML reports of reasoning artifacts for stakeholders
- **Email digest** — Self-contained HTML emails with inline styling (no external CSS dependencies)
- **Archive & playback** — Long-term storage of reasoning artifacts with zero external dependencies

This is **not** the interactive dashboard format (see `dashboard.md` for that). HTML format here is **static and read-only**.

## Encoding Rules

### Root Container

Wrap the entire thought in an `<article>` element with semantic attributes:

```html
<article class="deepthinking-thought" data-mode="causal" data-session-id="session-123" data-timestamp="2026-04-11T10:30:00Z">
  <!-- Content here -->
</article>
```

**Attributes:**
- `class="deepthinking-thought"` — Standard class for styling and selection
- `data-mode="<slug>"` — Reasoning mode slug (causal, abductive, synthesis, etc.)
- `data-session-id` — Optional session identifier
- `data-timestamp` — ISO 8601 creation timestamp

### Styling Block

Include a minimal `<style>` block in the document head or at the top of the HTML. Use CSS custom properties so consumers can override:

```html
<style>
  :root {
    --dt-primary: #3b82f6;
    --dt-success: #22c55e;
    --dt-danger: #ef4444;
    --dt-warning: #f59e0b;
    --dt-meta: #a855f7;
    --dt-neutral: #6b7280;
    --dt-font-family: system-ui, -apple-system, sans-serif;
    --dt-border-radius: 0.5rem;
    --dt-padding: 1rem;
    --dt-text-color: #111827;
  }
  
  .deepthinking-thought {
    font-family: var(--dt-font-family);
    color: var(--dt-text-color);
    line-height: 1.6;
    max-width: 900px;
    margin: 0 auto;
    padding: var(--dt-padding);
  }
  
  .deepthinking-thought section {
    margin: 1.5rem 0;
    padding: 1rem;
    border-left: 4px solid var(--dt-primary);
    background: #f9fafb;
    border-radius: var(--dt-border-radius);
  }
  
  .deepthinking-thought h3 {
    margin-top: 0;
    color: var(--dt-primary);
  }
  
  .deepthinking-thought table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
  }
  
  .deepthinking-thought th {
    background: var(--dt-primary);
    color: white;
    padding: 0.75rem;
    text-align: left;
  }
  
  .deepthinking-thought td {
    padding: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .deepthinking-thought tbody tr:hover {
    background: #f3f4f6;
  }
  
  .deepthinking-thought meter {
    height: 1.5rem;
    width: 100%;
  }
  
  .deepthinking-thought details {
    margin: 1rem 0;
  }
  
  .deepthinking-thought summary {
    cursor: pointer;
    font-weight: 600;
    color: var(--dt-primary);
    padding: 0.5rem;
  }
  
  .deepthinking-thought summary:hover {
    background: #f3f4f6;
    border-radius: var(--dt-border-radius);
  }
  
  .deepthinking-thought dl {
    margin: 1rem 0;
  }
  
  .deepthinking-thought dt {
    font-weight: 600;
    margin-top: 0.5rem;
  }
  
  .deepthinking-thought dd {
    margin-left: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .deepthinking-thought mark {
    background: #fef3c7;
    padding: 0.1rem 0.3rem;
    border-radius: 0.25rem;
  }
</style>
```

### Top-Level Field Groups

Organize content into semantic `<section>` elements, each with an `<h3>` heading:

```html
<article class="deepthinking-thought" data-mode="abductive">
  <section id="summary">
    <h3>Summary</h3>
    <p>Brief overview of the reasoning or conclusion.</p>
  </section>
  
  <section id="hypotheses">
    <h3>Candidate Hypotheses</h3>
    <!-- hypothesis list here -->
  </section>
  
  <section id="evidence">
    <h3>Evidence</h3>
    <!-- evidence table here -->
  </section>
</article>
```

### Arrays of Objects as Tables

Use semantic HTML `<table>` with `<thead>` and `<tbody>` for lists of objects:

```html
<section id="evidence">
  <h3>Evidence</h3>
  <table>
    <thead>
      <tr>
        <th>Source</th>
        <th>Finding</th>
        <th>Strength</th>
        <th>Confidence</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Lab Test A</td>
        <td>Positive result</td>
        <td>0.92</td>
        <td><meter value="0.92" min="0" max="1"></meter></td>
      </tr>
    </tbody>
  </table>
</section>
```

### Numbered Steps & Lists

Use semantic `<ol>` for ordered reasoning steps or ranked hypotheses:

```html
<section id="hypotheses-ranked">
  <h3>Hypotheses (by likelihood)</h3>
  <ol>
    <li><strong>Hypothesis A:</strong> <meter value="0.78" min="0" max="1"></meter> (78% likely)</li>
    <li><strong>Hypothesis B:</strong> <meter value="0.15" min="0" max="1"></meter> (15% likely)</li>
    <li><strong>Hypothesis C:</strong> <meter value="0.07" min="0" max="1"></meter> (7% likely)</li>
  </ol>
</section>
```

### Key-Value Pairs

Use `<dl>` (definition list) for structured key-value metadata:

```html
<section id="metadata">
  <h3>Metadata</h3>
  <dl>
    <dt>Mode</dt>
    <dd>Abductive Reasoning</dd>
    <dt>Timestamp</dt>
    <dd>2026-04-11T10:30:00Z</dd>
    <dt>Confidence Level</dt>
    <dd>High (0.85)</dd>
  </dl>
</section>
```

### Probabilities as Meter Elements

Always render probability or confidence values as HTML `<meter>` elements when possible:

```html
<p>Likelihood: <meter value="0.75" min="0" max="1"></meter> 75%</p>
```

The `<meter>` element provides a visual bar that automatically colors based on value:
- Low values: orange/red
- Medium values: yellow
- High values: green

Combine with a text label for clarity.

### Collapsible Long Content

Use `<details>` and `<summary>` for verbose sections (evidence details, proof steps, long explanations):

```html
<section id="detailed-analysis">
  <h3>Detailed Analysis</h3>
  <details>
    <summary>Expand for full reasoning steps</summary>
    <p>Step 1: Observe phenomenon X...</p>
    <p>Step 2: Test hypothesis Y...</p>
    <p>Step 3: Evaluate confidence...</p>
  </details>
</section>
```

### Highlights & Emphasis

Use `<mark>` for highlights and `<strong>` for emphasis:

```html
<p>The best explanation is <mark>Hypothesis A</mark>, which explains <strong>92%</strong> of observed data.</p>
```

## Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DeepThinking Thought: [Mode]</title>
  <style>
    :root {
      --dt-primary: #3b82f6;
      --dt-success: #22c55e;
      --dt-danger: #ef4444;
      --dt-warning: #f59e0b;
      --dt-meta: #a855f7;
      --dt-neutral: #6b7280;
      --dt-font-family: system-ui, -apple-system, sans-serif;
      --dt-border-radius: 0.5rem;
      --dt-padding: 1rem;
    }
    
    .deepthinking-thought {
      font-family: var(--dt-font-family);
      color: #111827;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: var(--dt-padding);
    }
    
    .deepthinking-thought section {
      margin: 1.5rem 0;
      padding: 1rem;
      border-left: 4px solid var(--dt-primary);
      background: #f9fafb;
      border-radius: var(--dt-border-radius);
    }
    
    .deepthinking-thought h3 {
      margin-top: 0;
      color: var(--dt-primary);
    }
    
    .deepthinking-thought table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    
    .deepthinking-thought th {
      background: var(--dt-primary);
      color: white;
      padding: 0.75rem;
      text-align: left;
    }
    
    .deepthinking-thought td {
      padding: 0.75rem;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .deepthinking-thought tbody tr:hover {
      background: #f3f4f6;
    }
  </style>
</head>
<body>
  <article class="deepthinking-thought" data-mode="[mode]" data-timestamp="[ISO-8601]">
    <h1>[Thought Title]</h1>
    
    <section id="summary">
      <h3>Summary</h3>
      <p>[Brief overview]</p>
    </section>
    
    <section id="content">
      <h3>[Content Section]</h3>
      <p>[Content here]</p>
    </section>
  </article>
</body>
</html>
```

## Worked Example

An abductive reasoning thought with ranked hypotheses, evidence table, and highlighted conclusion:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Abductive Thought: Server Outage Root Cause</title>
  <style>
    :root {
      --dt-primary: #3b82f6;
      --dt-success: #22c55e;
      --dt-danger: #ef4444;
      --dt-warning: #f59e0b;
      --dt-meta: #a855f7;
      --dt-font-family: system-ui, -apple-system, sans-serif;
    }
    
    .deepthinking-thought {
      font-family: var(--dt-font-family);
      color: #111827;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 1rem;
    }
    
    .deepthinking-thought section {
      margin: 1.5rem 0;
      padding: 1rem;
      border-left: 4px solid var(--dt-primary);
      background: #f9fafb;
      border-radius: 0.5rem;
    }
    
    .deepthinking-thought h3 {
      margin-top: 0;
      color: var(--dt-primary);
    }
    
    .deepthinking-thought table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    
    .deepthinking-thought th {
      background: var(--dt-primary);
      color: white;
      padding: 0.75rem;
      text-align: left;
    }
    
    .deepthinking-thought td {
      padding: 0.75rem;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .deepthinking-thought tbody tr:hover {
      background: #f3f4f6;
    }
    
    .deepthinking-thought mark {
      background: #fef3c7;
      padding: 0.1rem 0.3rem;
      border-radius: 0.25rem;
    }
    
    .deepthinking-thought ol {
      padding-left: 1.5rem;
    }
    
    .deepthinking-thought li {
      margin: 0.5rem 0;
    }
  </style>
</head>
<body>
  <article class="deepthinking-thought" data-mode="abductive" data-timestamp="2026-04-11T10:30:00Z">
    <h1>Server Outage: Root Cause Analysis</h1>
    
    <section id="summary">
      <h3>Summary</h3>
      <p>Evaluating three candidate hypotheses for the 30-minute API server outage on 2026-04-10 15:45 UTC.</p>
    </section>
    
    <section id="hypotheses">
      <h3>Candidate Hypotheses (ranked by likelihood)</h3>
      <ol>
        <li>
          <strong>Database Connection Pool Exhaustion:</strong>
          <meter value="0.78" min="0" max="1"></meter> 78% likely
          <details>
            <summary>Expand for details</summary>
            <p>Connection pool was misconfigured after recent migration. Pool size: 50 (should be 200).</p>
          </details>
        </li>
        <li>
          <strong>Memory Leak in Worker Process:</strong>
          <meter value="0.15" min="0" max="1"></meter> 15% likely
          <details>
            <summary>Expand for details</summary>
            <p>Worker processes accumulate memory over time. Heap snapshots inconclusive.</p>
          </details>
        </li>
        <li>
          <strong>Malformed Caching Header:</strong>
          <meter value="0.07" min="0" max="1"></meter> 7% likely
          <details>
            <summary>Expand for details</summary>
            <p>Recent CDN config change. Low probability given request logs show correct headers.</p>
          </details>
        </li>
      </ol>
    </section>
    
    <section id="evidence">
      <h3>Supporting Evidence</h3>
      <table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Finding</th>
            <th>Strength</th>
            <th>Hypothesis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Database Monitoring</td>
            <td>Connection count peaked at 52 (pool limit 50)</td>
            <td><meter value="0.92" min="0" max="1"></meter></td>
            <td>Connection Pool</td>
          </tr>
          <tr>
            <td>Application Logs</td>
            <td>"java.sql.SQLException: Connection pool exhausted" × 847 errors</td>
            <td><meter value="0.98" min="0" max="1"></meter></td>
            <td>Connection Pool</td>
          </tr>
          <tr>
            <td>Memory Telemetry</td>
            <td>Heap usage stable at 4.2GB throughout outage</td>
            <td><meter value="0.85" min="0" max="1"></meter></td>
            <td>✗ Rules out memory leak</td>
          </tr>
          <tr>
            <td>CDN Logs</td>
            <td>Cache-Control headers present and correct</td>
            <td><meter value="0.80" min="0" max="1"></meter></td>
            <td>✗ Rules out caching issue</td>
          </tr>
        </tbody>
      </table>
    </section>
    
    <section id="conclusion">
      <h3>Best Explanation</h3>
      <p>
        <mark>Database Connection Pool Exhaustion</mark> is the best explanation. It explains:
      </p>
      <ul>
        <li><strong>Direct cause:</strong> Misconfigured pool size after migration</li>
        <li><strong>Symptom match:</strong> Sudden connection failures, exactly matching pool limit</li>
        <li><strong>Log evidence:</strong> 847 explicit SQLException entries in application logs</li>
        <li><strong>Exclusion of alternatives:</strong> Memory stable (rules out leak), cache headers correct (rules out CDN issue)</li>
      </ul>
      <p><strong>Confidence:</strong> <meter value="0.88" min="0" max="1"></meter> 88% confident in this explanation.</p>
      <p><strong>Recommended action:</strong> Increase pool size to 200 and roll back recent migration settings.</p>
    </section>
  </article>
</body>
</html>
```

## Per-Mode Considerations

### Abductive & Inductive Modes

Hypotheses should be presented as a ranked `<ol>` with `<meter>` elements showing likelihood. Use `<details>` for hypothesis details. Evidence should be a `<table>` with source, finding, strength, and applicability columns.

### Causal & Counterfactual Modes

Use `<section>` elements for root causes, mediators, and effects. Represent causal chains with `<ol>` for step-by-step explanation. Include `<meter>` elements for strength and confidence.

### Synthesis & Analysis Modes

Organize by logical structure: premises → intermediate conclusions → final synthesis. Use `<dl>` for key terms and definitions. Highlight final synthesis with `<mark>`.

### Argumentation & Critique Modes

Represent claims and rebuttals using nested `<section>` elements. Use `<strong>` for key arguments, `<em>` for counterarguments. Include `<meter>` for argument strength.

### Scientific Method & Engineering Modes

Use `<ol>` for step-by-step method application (hypothesis → experiment → observation → conclusion). Include `<table>` for experimental results.

## Rendering Tools

### Browser

- Any modern browser (Chrome, Firefox, Safari, Edge) can directly open `.html` files or render embedded HTML
- Use `File → Print to PDF` for archival or distribution as PDF

### Static Site Generators

- **Hugo** — Embed HTML in markdown using raw shortcode: `{{< rawhtml >}}...{{< /rawhtml >}}`
- **Jekyll** — Embed directly in markdown (Jekyll processes raw HTML)
- **11ty** — Flexible HTML/markdown mixing with zero config
- **Astro** — Framework for embedding HTML components

### Documentation Systems

- **MkDocs** — Add `!!! html` block for embedding
- **Sphinx** — Use `:html:` role or `raw::html` directive
- **ReadTheDocs** — Auto-renders embedded HTML

### Email

For email digests, ensure all styles are **inline** (no external stylesheets):

```html
<article style="font-family: system-ui; max-width: 900px; margin: 0 auto;">
  <section style="margin: 1.5rem 0; padding: 1rem; border-left: 4px solid #3b82f6;">
    <h3 style="margin-top: 0; color: #3b82f6;">Section Title</h3>
    <p>Content here</p>
  </section>
</article>
```

---

**Last Updated:** 2026-04-11  
**Status:** Stable  
**Audience:** deepthinking-plugin developers, documentation maintainers
