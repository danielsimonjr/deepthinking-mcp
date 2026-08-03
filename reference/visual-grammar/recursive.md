# Visual Grammar: Recursive

How to render a `recursive` thought as a diagram.

## Node Structure

Recursive diagrams show decomposition of problems into smaller subproblems:
- **Root problem** (top rectangle): the original problem of size n
- **Recursive calls** (rectangles, branching downward): subproblems at reduced size (n/2, n-1, etc.)
- **Base case** (green rectangle at bottom): the minimal problem that returns a solution directly
- **Halting condition** (diamond decision node on each call): check that problem size strictly decreases
- **Problem size labels** (edge annotations): show size reduction (n → n/2 or n → n-1)

## Edge Semantics

- **Solid arrow** (`→`) — Recursive call: problem subdivides into smaller subproblems
- **Bold arrow to base case** (`⟹`) — Reaches base case and terminates
- **Halting condition label** (on diamond): e.g., "if n <= 1" or "if size == 0"
- **Size annotation** (on edge): e.g., "n/2" or "n-1" showing the recurrence relation

## Mermaid Template

```mermaid
graph TD
    Root["Problem(n)<br/>Size: n"]
    Sub1["Problem(n/2)<br/>Size: n/2"]
    Sub2["Problem(n/2)<br/>Size: n/2"]
    Halt{"n <= 1?"}
    Base["Base Case<br/>Return solution"]
    
    Root --> Sub1
    Root --> Sub2
    Sub1 --> Halt
    Sub2 --> Halt
    Halt -->|Yes| Base
    Halt -->|No| Root
    
    style Root fill:#b3d9ff,stroke:#0066cc
    style Sub1 fill:#b3d9ff,stroke:#0066cc
    style Sub2 fill:#b3d9ff,stroke:#0066cc
    style Halt fill:#ffd699,stroke:#ff9500
    style Base fill:#99ff99,stroke:#00aa00
```

## DOT Template

```dot
digraph Recursive {
    rankdir=TD;
    Root [label="Problem(n)\nSize: n", fillcolor="#b3d9ff"];
    Sub1 [label="Problem(n/2)\nSize: n/2", fillcolor="#b3d9ff"];
    Sub2 [label="Problem(n/2)\nSize: n/2", fillcolor="#b3d9ff"];
    Halt [label="n <= 1?", shape=diamond, fillcolor="#ffd699"];
    Base [label="Base Case\nReturn solution", fillcolor="#99ff99"];
    
    Root -> Sub1;
    Root -> Sub2;
    Sub1 -> Halt;
    Sub2 -> Halt;
    Halt -> Base [label="Yes"];
}
```

## Worked Example

Nested config validation recursion with problem size tracking.

### Mermaid

```mermaid
graph TD
    Root["Validate(config)<br/>depth: 3"]
    L1a["Validate(section A)<br/>depth: 2"]
    L1b["Validate(section B)<br/>depth: 2"]
    L2a["Validate(key1)<br/>depth: 1"]
    L2b["Validate(key2)<br/>depth: 1"]
    Halt{"depth <= 0?"}
    Base["Return value"]
    
    Root --> L1a
    Root --> L1b
    L1a --> L2a
    L1a --> L2b
    L2a --> Halt
    L2b --> Halt
    Halt -->|Yes| Base
    Halt -->|No| Root
    
    style Root fill:#b3d9ff
    style L1a fill:#b3d9ff
    style L1b fill:#b3d9ff
    style L2a fill:#b3d9ff
    style L2b fill:#b3d9ff
    style Halt fill:#ffd699
    style Base fill:#99ff99
```

### DOT

```dot
digraph ConfigValidation {
    rankdir=TD;
    Root [label="Validate(config)\ndepth: 3", fillcolor="#b3d9ff"];
    L1a [label="Validate(sect A)\ndepth: 2", fillcolor="#b3d9ff"];
    L2a [label="Validate(key1)\ndepth: 1", fillcolor="#b3d9ff"];
    Halt [label="depth <= 0?", shape=diamond, fillcolor="#ffd699"];
    Base [label="Return value", fillcolor="#99ff99"];
    
    Root -> L1a;
    L1a -> L2a;
    L2a -> Halt;
    Halt -> Base [label="Yes"];
}
```

## Special Cases

- **Multiple base cases**: Use separate green nodes for different termination conditions.
- **Non-trivial combining step**: Annotate edges showing how results are combined (e.g., "merge left and right").
- **Logarithmic depth tree**: Problem size reduces by constant factor (e.g., n/2) creating balanced tree.
- **Linear depth chain**: Problem size reduces by constant (e.g., n-1) creating a chain, not tree.
- **Constraint violation**: Highlight nodes where the halting condition is violated in red.
