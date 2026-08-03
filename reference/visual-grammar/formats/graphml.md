# Format Grammar: GraphML

How to encode a deepthinking-plugin thought into GraphML (XML-based graph exchange format).

## Format Overview

GraphML is a standardized XML format for representing directed and undirected graphs with typed attributes. It is supported by a rich ecosystem of tools including:

- **yEd** (free desktop graph editor)
- **Gephi** (open-source network analysis platform)
- **Cytoscape** (biology-focused but general-purpose graph visualization)
- **Graphistry** (large-scale graph analytics)
- **NetworkX** (Python library with native GraphML support)

GraphML is particularly well-suited for deepthinking thoughts because:

1. **Typed attributes** (`<data>` elements) can encode probabilities, confidence scores, mechanism labels, and mode-specific metadata
2. **Standard node/edge format** allows any consumer tool to visualize without custom parsing
3. **Persistent on disk** — ideal for archiving reasoning artifacts in a standardized format
4. **Hierarchical support** — allows clustering related nodes into subgraphs (useful for complex causal models or proof decomposition)

## Encoding Rules

### Document Structure

All GraphML files must begin with the XML declaration and GraphML root element:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
```

### Key Definitions

Define custom attributes at the top of the document using `<key>` elements. Each key has:

- `id` — unique identifier (e.g., `"probability"`, `"mechanism"`, `"confidence"`)
- `for` — applies to `"node"`, `"edge"`, or `"graph"` scopes
- `attr.name` — human-readable attribute name
- `attr.type` — data type: `string`, `boolean`, `int`, `long`, `float`, `double`
- `default` — optional default value

**Example key definitions:**

```xml
<key id="label" for="node" attr.name="label" attr.type="string"/>
<key id="probability" for="node" attr.name="probability" attr.type="double"/>
<key id="confidence" for="node" attr.name="confidence" attr.type="double"/>
<key id="mechanism" for="edge" attr.name="mechanism" attr.type="string"/>
<key id="strength" for="edge" attr.name="strength" attr.type="double"/>
<key id="mode" for="graph" attr.name="mode" attr.type="string"/>
```

### Graph Element

The `<graph>` element wraps all nodes and edges:

```xml
<graph id="g1" edgedefault="directed">
  <!-- nodes and edges go here -->
</graph>
```

Use `edgedefault="directed"` for all reasoning modes (causal, evidential, etc.). Use `edgedefault="undirected"` only for bidirectional relationships (rare).

### Node Encoding

Each node is represented as:

```xml
<node id="n1">
  <data key="label">Node Label</data>
  <data key="probability">0.85</data>
  <data key="confidence">0.90</data>
</node>
```

**Rules:**
- `id` attribute must be unique within the graph (e.g., `"n1"`, `"n2"`, `"hypothesis_1"`)
- Node labels are stored in a `<data>` element with `key="label"`
- Mode-specific attributes (probability, confidence, type) go in additional `<data>` elements
- All numeric values must be valid XML numbers (no special characters except `-` and `.` for decimals)

### Edge Encoding

Each edge is represented as:

```xml
<edge id="e1" source="n1" target="n2">
  <data key="mechanism">supports</data>
  <data key="strength">0.85</data>
</edge>
```

**Rules:**
- `id` attribute is optional but recommended (e.g., `"e1"`, `"e2"`)
- `source` and `target` must reference existing node IDs
- Edge semantics (mechanism, strength, confidence) go in `<data>` elements
- Edge labels use the same key-value structure as nodes

### Semantic Color Encoding

While GraphML is format-agnostic about rendering, you may optionally encode visual hints using extended attributes:

```xml
<key id="fillcolor" for="node" attr.name="fillcolor" attr.type="string"/>
<key id="edgecolor" for="edge" attr.name="edgecolor" attr.type="string"/>

<!-- Then in nodes and edges -->
<node id="n1">
  <data key="label">Supporting Evidence</data>
  <data key="fillcolor">#22c55e</data>
</node>

<edge id="e1" source="n1" target="n2">
  <data key="edgecolor">#22c55e</data>
</edge>
```

Use the color palette from `visual-grammar.md`:
- Green: `#22c55e` (supporting, proven)
- Red: `#ef4444` (contradicting, refuted)
- Blue: `#3b82f6` (neutral, informational)
- Orange: `#f59e0b` (uncertain, partial)
- Purple: `#a855f7` (meta-reasoning)
- Gray: `#6b7280` (deferred, background)

## Template

```xml
<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
  <key id="label" for="node" attr.name="label" attr.type="string"/>
  <key id="probability" for="node" attr.name="probability" attr.type="double"/>
  <key id="confidence" for="node" attr.name="confidence" attr.type="double"/>
  <key id="type" for="node" attr.name="type" attr.type="string"/>
  <key id="mechanism" for="edge" attr.name="mechanism" attr.type="string"/>
  <key id="strength" for="edge" attr.name="strength" attr.type="double"/>
  <key id="mode" for="graph" attr.name="mode" attr.type="string"/>
  
  <graph id="thought1" edgedefault="directed">
    <data key="mode">causal</data>
    
    <node id="n1">
      <data key="label">Cause</data>
      <data key="type">root</data>
      <data key="probability">1.0</data>
      <data key="confidence">1.0</data>
    </node>
    
    <node id="n2">
      <data key="label">Effect</data>
      <data key="type">terminal</data>
      <data key="probability">0.75</data>
      <data key="confidence">0.85</data>
    </node>
    
    <edge id="e1" source="n1" target="n2">
      <data key="mechanism">direct causal link</data>
      <data key="strength">0.8</data>
    </edge>
  </graph>
</graphml>
```

## Worked Example

A causal thought with three nodes (cause, mediator, effect) and one confounder:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
  <key id="label" for="node" attr.name="label" attr.type="string"/>
  <key id="type" for="node" attr.name="type" attr.type="string"/>
  <key id="probability" for="node" attr.name="probability" attr.type="double"/>
  <key id="confidence" for="node" attr.name="confidence" attr.type="double"/>
  <key id="fillcolor" for="node" attr.name="fillcolor" attr.type="string"/>
  <key id="mechanism" for="edge" attr.name="mechanism" attr.type="string"/>
  <key id="strength" for="edge" attr.name="strength" attr.type="double"/>
  <key id="edgecolor" for="edge" attr.name="edgecolor" attr.type="string"/>
  <key id="mode" for="graph" attr.name="mode" attr.type="string"/>
  
  <graph id="cache-eviction-causal" edgedefault="directed">
    <data key="mode">causal</data>
    
    <node id="cause">
      <data key="label">Cache Eviction Policy (LRU → LFU)</data>
      <data key="type">root_cause</data>
      <data key="probability">1.0</data>
      <data key="confidence">1.0</data>
      <data key="fillcolor">#3b82f6</data>
    </node>
    
    <node id="mediator">
      <data key="label">Cache Hit Rate (%)</data>
      <data key="type">mediator</data>
      <data key="probability">0.75</data>
      <data key="confidence">0.85</data>
      <data key="fillcolor">#10b981</data>
    </node>
    
    <node id="confounder">
      <data key="label">Server Memory (confounder)</data>
      <data key="type">confounder</data>
      <data key="probability">1.0</data>
      <data key="confidence">0.9</data>
      <data key="fillcolor">#f97316</data>
    </node>
    
    <node id="effect">
      <data key="label">p99 Latency (ms)</data>
      <data key="type">terminal_effect</data>
      <data key="probability">0.68</data>
      <data key="confidence">0.80</data>
      <data key="fillcolor">#ef4444</data>
    </node>
    
    <edge id="e1" source="cause" target="mediator">
      <data key="mechanism">direct: less memory pressure → higher hit rate</data>
      <data key="strength">-0.6</data>
      <data key="edgecolor">#3b82f6</data>
    </edge>
    
    <edge id="e2" source="confounder" target="mediator">
      <data key="mechanism">confounder: reduced memory → higher hit rate</data>
      <data key="strength">-0.5</data>
      <data key="edgecolor">#f97316</data>
    </edge>
    
    <edge id="e3" source="mediator" target="effect">
      <data key="mechanism">indirect: higher hit rate → fewer DB queries → lower latency</data>
      <data key="strength">-0.9</data>
      <data key="edgecolor">#10b981</data>
    </edge>
    
    <edge id="e4" source="confounder" target="effect">
      <data key="mechanism">confounder: reduced memory increases latency directly</data>
      <data key="strength">0.4</data>
      <data key="edgecolor">#f97316</data>
    </edge>
  </graph>
</graphml>
```

## Per-Mode Considerations

### Causal & Counterfactual Modes

Include a `type` attribute with values: `root_cause`, `mediator`, `confounder`, `effect`, `intervention_point`. Use confounder nodes with special `type="confounder"` for clarity.

### Bayesian & Evidential Modes

Add node attributes for `prior_probability`, `posterior_probability`, and `likelihood`. Include edge attributes for evidence type and source reliability.

**Example:**
```xml
<key id="prior" for="node" attr.name="prior_probability" attr.type="double"/>
<key id="posterior" for="node" attr.name="posterior_probability" attr.type="double"/>
<key id="source_reliability" for="edge" attr.name="source_reliability" attr.type="double"/>

<node id="hypothesis1">
  <data key="label">Hypothesis A</data>
  <data key="prior">0.5</data>
  <data key="posterior">0.78</data>
</node>

<edge source="evidence1" target="hypothesis1">
  <data key="source_reliability">0.92</data>
</edge>
```

### Game Theory Mode

Include node attributes for payoff values and strategy type. Use edge attributes for game relationships.

**Example:**
```xml
<key id="payoff" for="node" attr.name="payoff" attr.type="double"/>
<key id="strategy" for="node" attr.name="strategy" attr.type="string"/>

<node id="player1_cooperate">
  <data key="label">Player 1: Cooperate</data>
  <data key="strategy">cooperative</data>
  <data key="payoff">3.0</data>
</node>
```

### Systems Thinking Mode

Use subgraphs (`<graph>` nested within `<graph>`) to represent feedback loops and system archetypes. Assign each subsystem a unique ID and use edge attributes for loop type (reinforcing, balancing).

**Example:**
```xml
<graph id="system1" edgedefault="directed">
  <data key="mode">systemsthinking</data>
  
  <graph id="reinforcing_loop" edgedefault="directed">
    <data key="loop_type">reinforcing</data>
    <!-- nodes and edges for this loop -->
  </graph>
</graph>
```

### Analysis & Synthesis Modes

These are more linear than graph-shaped. Represent as sequential chains with argument type annotations:

```xml
<key id="argument_type" for="node" attr.name="argument_type" attr.type="string"/>

<node id="premise1">
  <data key="label">Premise A</data>
  <data key="argument_type">premise</data>
</node>

<node id="conclusion1">
  <data key="label">Conclusion</data>
  <data key="argument_type">conclusion</data>
</node>
```

## Rendering Tools

### Desktop

- **yEd** (Windows, macOS, Linux) — Free, powerful graph editor. Import `.graphml` files directly. File → Open → select `.graphml`.
- **Gephi** (Windows, macOS, Linux) — Open-source network analysis. File → Open → select `.graphml`. Supports layout algorithms, community detection.
- **Cytoscape** (Windows, macOS, Linux) — Originally for biological networks but works for any graph. File → Import Network → select `.graphml`.

### Python

```python
import networkx as nx

# Load GraphML
G = nx.read_graphml("thought.graphml")

# Inspect nodes and attributes
for node in G.nodes(data=True):
    print(f"Node {node[0]}: {node[1]}")

# Export to other formats
nx.write_gexf(G, "thought.gexf")  # GEXF format
```

### Web-Based

- **Graphistry** — Cloud platform for large-scale graph analytics. Upload `.graphml` files for interactive exploration.
- **Sigma.js** (JavaScript library) — Parse GraphML with a Python converter, then render with Sigma in the browser.

---

**Last Updated:** 2026-04-11  
**Status:** Stable  
**Audience:** deepthinking-plugin developers, visual grammar maintainers
