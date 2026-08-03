# Visual Grammar: Algorithmic

How to render an `algorithmic` thought as a diagram.

## Node Structure

Algorithmic thoughts are rendered as left-to-right pipeline diagrams:
- **Input** (rectangle, left): the data or problem instance
- **Algorithm** (ellipse or rounded rectangle, center): the core operation with CLRS category tag (e.g., "Divide & Conquer", "Greedy", "DP")
- **Data structures** (cylinder or database icon, attached to algorithm): structures used during computation (e.g., heap, hash table, array)
- **Complexity annotation** (label on algorithm node): time and space complexity (e.g., O(n log k), O(1) space)
- **Output** (rectangle, right): the result

## Edge Semantics

- **Solid arrow** (`→`) — Main pipeline: input → algorithm → output
- **Dashed arrow** (`⇢`) — Data structure usage: algorithm node to supporting data structures
- **Bold annotation** — Complexity class: labeled on the algorithm node

## Mermaid Template

```mermaid
graph LR
    Input["Input:<br/>Array of N items"]
    Algo["Algorithm<br/>(Divide & Conquer)<br/>O(n log n)<br/>O(log n) space"]
    DS["Data Structure:<br/>Recursion Stack"]
    Output["Output:<br/>Sorted array"]
    
    Input --> Algo
    Algo --> DS
    Algo --> Output
    
    style Input fill:#b3d9ff,stroke:#0066cc,color:#000
    style Algo fill:#ffe6b3,stroke:#ff9900,color:#000
    style DS fill:#e6f2ff,stroke:#0066cc,color:#000
    style Output fill:#b3ffb3,stroke:#00aa00,color:#000
```

## DOT Template

```dot
digraph Algorithmic {
    rankdir=LR;
    node [style="filled"];
    
    Input [label="Input:\nArray of N items", shape=box, fillcolor="#b3d9ff"];
    Algo [label="Algorithm\n(Divide & Conquer)\nO(n log n)\nO(log n) space", shape=ellipse, fillcolor="#ffe6b3"];
    DS [label="Data Structure:\nRecursion Stack", shape=cylinder, fillcolor="#e6f2ff"];
    Output [label="Output:\nSorted array", shape=box, fillcolor="#b3ffb3"];
    
    Input -> Algo [penwidth=2, color="#0066cc"];
    Algo -> Output [penwidth=2, color="#00aa00"];
    Algo -> DS [style=dashed, color="#ff9900"];
}
```

## Worked Example

Based on the top-K most recent items with min-heap from `reference/output-formats/algorithmic.md`:

### Mermaid

```mermaid
graph LR
    Input["Input:<br/>Stream of N events<br/>with timestamps<br/>k=100"]
    Algo["Algorithm<br/>(Greedy + Heap)<br/>O(n log k)<br/>O(k) space"]
    Heap["Data Structure:<br/>Min-Heap<br/>(size k)"]
    Output["Output:<br/>Top-k events<br/>by recency"]
    
    Input --> Algo
    Algo --> Heap
    Algo --> Output
    
    style Input fill:#b3d9ff,stroke:#0066cc
    style Algo fill:#ffe6b3,stroke:#ff9900
    style Heap fill:#e6f2ff,stroke:#0066cc
    style Output fill:#b3ffb3,stroke:#00aa00
```

### DOT

```dot
digraph TopKHeap {
    rankdir=LR;
    node [style="filled"];
    
    Input [label="Input:\nStream of N events\nwith timestamps\nk=100", shape=box, fillcolor="#b3d9ff"];
    Algo [label="Algorithm\n(Greedy + Heap)\nO(n log k)\nO(k) space", shape=ellipse, fillcolor="#ffe6b3"];
    Heap [label="Data Structure:\nMin-Heap\n(size k)", shape=cylinder, fillcolor="#e6f2ff"];
    Output [label="Output:\nTop-k events\nby recency", shape=box, fillcolor="#b3ffb3"];
    
    Input -> Algo [penwidth=2, color="#0066cc"];
    Algo -> Output [penwidth=2, color="#00aa00"];
    Algo -> Heap [style=dashed, color="#ff9900"];
}
```

## Special Cases

- **Multiple passes**: If the algorithm makes multiple passes over the input, show multiple arrows from input to algorithm or label the input node "Input (Pass 1, 2, ...)", or draw separate boxes for each pass.
- **Recursive structure**: If the algorithm is recursive, show a curved arrow from the algorithm to itself, labeled with the recurrence relation (e.g., "T(n) = 2T(n/2) + O(n)").
- **CLRS category tag**: Display prominently in the algorithm node (e.g., "Divide & Conquer", "Greedy", "Dynamic Programming", "Graph Traversal").
- **Multiple data structures**: If the algorithm uses several supporting structures, draw separate cylinders for each with dashed edges.
- **Space vs. time trade-off**: Annotate separate complexity values (e.g., "Time: O(n log k)", "Space: O(k)") on the algorithm node.
- **Pseudocode callout**: For complex algorithms, attach a small code box as a callout to the algorithm node.

