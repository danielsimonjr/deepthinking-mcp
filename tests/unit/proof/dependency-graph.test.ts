/**
 * Unit tests for DependencyGraphBuilder
 *
 * Tests graph construction, cycle detection (Tarjan's algorithm),
 * topological sorting, and path finding.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DependencyGraphBuilder } from '../../../src/proof/dependency-graph.js';
import type { AtomicStatement } from '../../../src/types/modes/mathematics.js';

describe('DependencyGraphBuilder', () => {
  let builder: DependencyGraphBuilder;

  beforeEach(() => {
    builder = new DependencyGraphBuilder();
  });

  describe('Statement Management', () => {
    it('should add statements to the graph', () => {
      const statement: AtomicStatement = {
        id: 'stmt-1',
        statement: 'Assume √2 is rational',
        type: 'hypothesis',
        confidence: 1.0,
        isExplicit: true,
      };

      builder.addStatement(statement);
      expect(builder.nodeCount).toBe(1);
      expect(builder.hasNode('stmt-1')).toBe(true);
      expect(builder.getNode('stmt-1')).toEqual(statement);
    });

    it('should create statements with default values', () => {
      const statement = builder.createStatement('Test statement', 'axiom');

      expect(statement.statement).toBe('Test statement');
      expect(statement.type).toBe('axiom');
      expect(statement.confidence).toBe(1.0);
      expect(statement.isExplicit).toBe(true);
      expect(statement.id).toBeDefined();
    });

    it('should create statements with custom options', () => {
      const statement = builder.createStatement('Test', 'derived', {
        confidence: 0.8,
        isExplicit: false,
        latex: '\\sqrt{2}',
        justification: 'By definition',
      });

      expect(statement.confidence).toBe(0.8);
      expect(statement.isExplicit).toBe(false);
      expect(statement.latex).toBe('\\sqrt{2}');
      expect(statement.justification).toBe('By definition');
    });

    it('should get all nodes', () => {
      builder.createStatement('A', 'axiom');
      builder.createStatement('B', 'derived');
      builder.createStatement('C', 'conclusion');

      const nodes = builder.getAllNodes();
      expect(nodes).toHaveLength(3);
    });

    it('should clear the graph', () => {
      builder.createStatement('A', 'axiom');
      builder.createStatement('B', 'derived');

      builder.clear();

      expect(builder.nodeCount).toBe(0);
      expect(builder.edgeCount).toBe(0);
    });
  });

  describe('Dependency Management', () => {
    it('should add dependencies between statements', () => {
      const a = builder.createStatement('A', 'axiom');
      const b = builder.createStatement('B', 'derived');

      builder.addDependency(a.id, b.id, 'logical');

      expect(builder.edgeCount).toBe(1);
      const edges = builder.getAllEdges();
      expect(edges[0].from).toBe(a.id);
      expect(edges[0].to).toBe(b.id);
      expect(edges[0].type).toBe('logical');
    });

    it('should add dependencies with inference rules', () => {
      const a = builder.createStatement('A', 'axiom');
      const b = builder.createStatement('B', 'derived');

      builder.addDependency(a.id, b.id, 'logical', {
        strength: 0.9,
        inferenceRule: 'modus_ponens',
      });

      const edges = builder.getAllEdges();
      expect(edges[0].strength).toBe(0.9);
      expect(edges[0].inferenceRule).toBe('modus_ponens');
    });

    it('should throw error for invalid source node', () => {
      const b = builder.createStatement('B', 'derived');

      expect(() => {
        builder.addDependency('invalid-id', b.id, 'logical');
      }).toThrow("Source node 'invalid-id' not found in graph");
    });

    it('should throw error for invalid target node', () => {
      const a = builder.createStatement('A', 'axiom');

      expect(() => {
        builder.addDependency(a.id, 'invalid-id', 'logical');
      }).toThrow("Target node 'invalid-id' not found in graph");
    });
  });

  describe('Graph Structure Analysis', () => {
    it('should find root nodes (no incoming edges)', () => {
      const a = builder.createStatement('A', 'axiom');
      const b = builder.createStatement('B', 'axiom');
      const c = builder.createStatement('C', 'derived');

      builder.addDependency(a.id, c.id, 'logical');
      builder.addDependency(b.id, c.id, 'logical');

      const roots = builder.findRoots();
      expect(roots).toHaveLength(2);
      expect(roots).toContain(a.id);
      expect(roots).toContain(b.id);
      expect(roots).not.toContain(c.id);
    });

    it('should find leaf nodes (no outgoing edges)', () => {
      const a = builder.createStatement('A', 'axiom');
      const b = builder.createStatement('B', 'derived');
      const c = builder.createStatement('C', 'conclusion');

      builder.addDependency(a.id, b.id, 'logical');
      builder.addDependency(b.id, c.id, 'logical');

      const leaves = builder.findLeaves();
      expect(leaves).toHaveLength(1);
      expect(leaves).toContain(c.id);
    });

    it('should compute graph depth correctly', () => {
      // Linear chain: A → B → C → D
      const a = builder.createStatement('A', 'axiom');
      const b = builder.createStatement('B', 'derived');
      const c = builder.createStatement('C', 'derived');
      const d = builder.createStatement('D', 'conclusion');

      builder.addDependency(a.id, b.id, 'logical');
      builder.addDependency(b.id, c.id, 'logical');
      builder.addDependency(c.id, d.id, 'logical');

      expect(builder.computeDepth()).toBe(4);
    });

    it('should compute graph width correctly', () => {
      // Diamond: A → B, A → C, B → D, C → D
      const a = builder.createStatement('A', 'axiom');
      const b = builder.createStatement('B', 'derived');
      const c = builder.createStatement('C', 'derived');
      const d = builder.createStatement('D', 'conclusion');

      builder.addDependency(a.id, b.id, 'logical');
      builder.addDependency(a.id, c.id, 'logical');
      builder.addDependency(b.id, d.id, 'logical');
      builder.addDependency(c.id, d.id, 'logical');

      expect(builder.computeWidth()).toBe(2); // B and C at level 1
    });
  });

  describe('Ancestor and Descendant Traversal', () => {
    it('should find all ancestors of a node', () => {
      const a = builder.createStatement('A', 'axiom');
      const b = builder.createStatement('B', 'axiom');
      const c = builder.createStatement('C', 'derived');
      const d = builder.createStatement('D', 'conclusion');

      builder.addDependency(a.id, c.id, 'logical');
      builder.addDependency(b.id, c.id, 'logical');
      builder.addDependency(c.id, d.id, 'logical');

      const ancestors = builder.getAncestors(d.id);
      expect(ancestors).toHaveLength(3);
      expect(ancestors).toContain(a.id);
      expect(ancestors).toContain(b.id);
      expect(ancestors).toContain(c.id);
    });

    it('should find all descendants of a node', () => {
      const a = builder.createStatement('A', 'axiom');
      const b = builder.createStatement('B', 'derived');
      const c = builder.createStatement('C', 'derived');
      const d = builder.createStatement('D', 'conclusion');

      builder.addDependency(a.id, b.id, 'logical');
      builder.addDependency(a.id, c.id, 'logical');
      builder.addDependency(b.id, d.id, 'logical');
      builder.addDependency(c.id, d.id, 'logical');

      const descendants = builder.getDescendants(a.id);
      expect(descendants).toHaveLength(3);
      expect(descendants).toContain(b.id);
      expect(descendants).toContain(c.id);
      expect(descendants).toContain(d.id);
    });
  });

  describe('Cycle Detection (Tarjan Algorithm)', () => {
    it('should detect no cycles in acyclic graph', () => {
      const a = builder.createStatement('A', 'axiom');
      const b = builder.createStatement('B', 'derived');
      const c = builder.createStatement('C', 'conclusion');

      builder.addDependency(a.id, b.id, 'logical');
      builder.addDependency(b.id, c.id, 'logical');

      expect(builder.hasCycles()).toBe(false);
      expect(builder.detectCycles()).toHaveLength(0);
    });

    it('should detect simple cycle (A → B → C → A)', () => {
      const a = builder.createStatement('A', 'derived');
      const b = builder.createStatement('B', 'derived');
      const c = builder.createStatement('C', 'derived');

      builder.addDependency(a.id, b.id, 'logical');
      builder.addDependency(b.id, c.id, 'logical');
      builder.addDependency(c.id, a.id, 'logical');

      expect(builder.hasCycles()).toBe(true);
      const cycles = builder.detectCycles();
      expect(cycles).toHaveLength(1);
      expect(cycles[0]).toHaveLength(3);
    });

    it('should detect self-loop', () => {
      const a = builder.createStatement('A', 'derived');

      builder.addDependency(a.id, a.id, 'logical');

      expect(builder.hasCycles()).toBe(true);
      const cycles = builder.detectCycles();
      expect(cycles).toHaveLength(1);
      expect(cycles[0]).toContain(a.id);
    });

    it('should detect multiple cycles', () => {
      // Two separate cycles
      const a = builder.createStatement('A', 'derived');
      const b = builder.createStatement('B', 'derived');
      const c = builder.createStatement('C', 'derived');
      const d = builder.createStatement('D', 'derived');

      // Cycle 1: A → B → A
      builder.addDependency(a.id, b.id, 'logical');
      builder.addDependency(b.id, a.id, 'logical');

      // Cycle 2: C → D → C
      builder.addDependency(c.id, d.id, 'logical');
      builder.addDependency(d.id, c.id, 'logical');

      expect(builder.hasCycles()).toBe(true);
      const cycles = builder.detectCycles();
      expect(cycles).toHaveLength(2);
    });

    it('should not flag legitimate proof by contradiction as circular', () => {
      // Proof by contradiction structure (not circular)
      const hypothesis = builder.createStatement('Assume P', 'hypothesis');
      const derivation = builder.createStatement('Derive Q from P', 'derived');
      const contradiction = builder.createStatement('Q contradicts known fact', 'derived');
      const conclusion = builder.createStatement('Therefore not P', 'conclusion');

      builder.addDependency(hypothesis.id, derivation.id, 'logical');
      builder.addDependency(derivation.id, contradiction.id, 'logical');
      builder.addDependency(hypothesis.id, conclusion.id, 'logical');
      builder.addDependency(contradiction.id, conclusion.id, 'logical');

      expect(builder.hasCycles()).toBe(false);
    });
  });

  describe('Topological Sorting', () => {
    it('should return topological order for acyclic graph', () => {
      const a = builder.createStatement('A', 'axiom');
      const b = builder.createStatement('B', 'derived');
      const c = builder.createStatement('C', 'derived');
      const d = builder.createStatement('D', 'conclusion');

      builder.addDependency(a.id, b.id, 'logical');
      builder.addDependency(a.id, c.id, 'logical');
      builder.addDependency(b.id, d.id, 'logical');
      builder.addDependency(c.id, d.id, 'logical');

      const order = builder.getTopologicalOrder();
      expect(order).not.toBeNull();
      expect(order).toHaveLength(4);

      // A must come before B, C, D
      const aIndex = order!.indexOf(a.id);
      const bIndex = order!.indexOf(b.id);
      const cIndex = order!.indexOf(c.id);
      const dIndex = order!.indexOf(d.id);

      expect(aIndex).toBeLessThan(bIndex);
      expect(aIndex).toBeLessThan(cIndex);
      expect(bIndex).toBeLessThan(dIndex);
      expect(cIndex).toBeLessThan(dIndex);
    });

    it('should return null for graph with cycles', () => {
      const a = builder.createStatement('A', 'derived');
      const b = builder.createStatement('B', 'derived');

      builder.addDependency(a.id, b.id, 'logical');
      builder.addDependency(b.id, a.id, 'logical');

      expect(builder.getTopologicalOrder()).toBeNull();
    });
  });

  describe('Path Finding', () => {
    it('should find path between connected nodes', () => {
      const a = builder.createStatement('A', 'axiom');
      const b = builder.createStatement('B', 'derived');
      const c = builder.createStatement('C', 'conclusion');

      builder.addDependency(a.id, b.id, 'logical');
      builder.addDependency(b.id, c.id, 'logical');

      const path = builder.findPath(a.id, c.id);
      expect(path).not.toBeNull();
      expect(path).toEqual([a.id, b.id, c.id]);
    });

    it('should return null for disconnected nodes', () => {
      const a = builder.createStatement('A', 'axiom');
      const b = builder.createStatement('B', 'axiom');

      const path = builder.findPath(a.id, b.id);
      expect(path).toBeNull();
    });

    it('should return null for non-existent nodes', () => {
      const a = builder.createStatement('A', 'axiom');

      expect(builder.findPath(a.id, 'non-existent')).toBeNull();
      expect(builder.findPath('non-existent', a.id)).toBeNull();
    });

    it('should find all paths between nodes', () => {
      // Diamond shape: A → B → D and A → C → D
      const a = builder.createStatement('A', 'axiom');
      const b = builder.createStatement('B', 'derived');
      const c = builder.createStatement('C', 'derived');
      const d = builder.createStatement('D', 'conclusion');

      builder.addDependency(a.id, b.id, 'logical');
      builder.addDependency(a.id, c.id, 'logical');
      builder.addDependency(b.id, d.id, 'logical');
      builder.addDependency(c.id, d.id, 'logical');

      const paths = builder.findAllPaths(a.id, d.id);
      expect(paths).toHaveLength(2);
    });
  });

  describe('Build Complete Graph', () => {
    it('should build complete dependency graph', () => {
      const a = builder.createStatement('Axiom A', 'axiom');
      const b = builder.createStatement('Derived B', 'derived');
      const c = builder.createStatement('Conclusion C', 'conclusion');

      builder.addDependency(a.id, b.id, 'logical');
      builder.addDependency(b.id, c.id, 'logical');

      const graph = builder.build();

      expect(graph.nodes.size).toBe(3);
      expect(graph.edges).toHaveLength(2);
      expect(graph.roots).toContain(a.id);
      expect(graph.leaves).toContain(c.id);
      expect(graph.depth).toBe(3);
      expect(graph.hasCycles).toBe(false);
      expect(graph.topologicalOrder).toBeDefined();
      expect(graph.stronglyConnectedComponents).toBeUndefined();
    });

    it('should build graph with cycle information', () => {
      const a = builder.createStatement('A', 'derived');
      const b = builder.createStatement('B', 'derived');

      builder.addDependency(a.id, b.id, 'logical');
      builder.addDependency(b.id, a.id, 'logical');

      const graph = builder.build();

      expect(graph.hasCycles).toBe(true);
      expect(graph.stronglyConnectedComponents).toBeDefined();
      expect(graph.stronglyConnectedComponents).toHaveLength(1);
      expect(graph.topologicalOrder).toBeUndefined();
    });
  });

  describe('Real-World Proof Structure', () => {
    it('should handle √2 irrationality proof structure', () => {
      // Model the classic √2 irrationality proof
      const assume = builder.createStatement('Assume √2 is rational', 'hypothesis');
      const pq = builder.createStatement('√2 = p/q for coprime p, q', 'derived', {
        derivedFrom: [assume.id],
        usedInferenceRule: 'definition_expansion',
      });
      const squared = builder.createStatement('2 = p²/q²', 'derived', {
        derivedFrom: [pq.id],
        usedInferenceRule: 'algebraic_manipulation',
      });
      const pSquaredEven = builder.createStatement('p² is even', 'derived', {
        derivedFrom: [squared.id],
      });
      const pEven = builder.createStatement('p is even', 'derived', {
        derivedFrom: [pSquaredEven.id],
      });
      const qSquaredEven = builder.createStatement('q² is even', 'derived', {
        derivedFrom: [squared.id, pEven.id],
      });
      const qEven = builder.createStatement('q is even', 'derived', {
        derivedFrom: [qSquaredEven.id],
      });
      const contradiction = builder.createStatement('p,q both even contradicts coprimality', 'derived', {
        derivedFrom: [pq.id, pEven.id, qEven.id],
        usedInferenceRule: 'contradiction',
      });
      const conclusion = builder.createStatement('√2 is irrational', 'conclusion', {
        derivedFrom: [assume.id, contradiction.id],
      });

      builder.addDependency(assume.id, pq.id, 'logical');
      builder.addDependency(pq.id, squared.id, 'computational');
      builder.addDependency(squared.id, pSquaredEven.id, 'logical');
      builder.addDependency(pSquaredEven.id, pEven.id, 'logical');
      builder.addDependency(squared.id, qSquaredEven.id, 'logical');
      builder.addDependency(pEven.id, qSquaredEven.id, 'logical');
      builder.addDependency(qSquaredEven.id, qEven.id, 'logical');
      builder.addDependency(pq.id, contradiction.id, 'logical');
      builder.addDependency(pEven.id, contradiction.id, 'logical');
      builder.addDependency(qEven.id, contradiction.id, 'logical');
      builder.addDependency(assume.id, conclusion.id, 'logical');
      builder.addDependency(contradiction.id, conclusion.id, 'logical');

      const graph = builder.build();

      expect(graph.hasCycles).toBe(false);
      expect(graph.roots).toHaveLength(1);
      expect(graph.roots[0]).toBe(assume.id);
      expect(graph.leaves).toHaveLength(1);
      expect(graph.leaves[0]).toBe(conclusion.id);
      expect(graph.depth).toBeGreaterThan(4);

      // Verify conclusion depends on all prior statements
      const ancestors = builder.getAncestors(conclusion.id);
      expect(ancestors.length).toBeGreaterThan(5);
    });
  });
});
