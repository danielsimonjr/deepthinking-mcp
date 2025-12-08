/**
 * Dependency Graph Builder (Phase 8 - v7.0.0)
 *
 * Builds and analyzes dependency graphs for mathematical proof decomposition.
 * Includes Tarjan's algorithm for cycle detection (circular reasoning).
 */

import { randomUUID } from 'crypto';
import type {
  AtomicStatement,
  DependencyEdge,
  DependencyGraph,
  InferenceRule,
} from '../types/modes/mathematics.js';

/**
 * Builder for creating and analyzing dependency graphs
 */
export class DependencyGraphBuilder {
  private nodes: Map<string, AtomicStatement>;
  private edges: DependencyEdge[];
  private adjacencyList: Map<string, string[]>; // node -> nodes it points to
  private reverseAdjacencyList: Map<string, string[]>; // node -> nodes pointing to it

  constructor() {
    this.nodes = new Map();
    this.edges = [];
    this.adjacencyList = new Map();
    this.reverseAdjacencyList = new Map();
  }

  /**
   * Add a statement to the graph
   */
  addStatement(statement: AtomicStatement): void {
    this.nodes.set(statement.id, statement);
    if (!this.adjacencyList.has(statement.id)) {
      this.adjacencyList.set(statement.id, []);
    }
    if (!this.reverseAdjacencyList.has(statement.id)) {
      this.reverseAdjacencyList.set(statement.id, []);
    }
  }

  /**
   * Create and add a new statement
   */
  createStatement(
    statement: string,
    type: AtomicStatement['type'],
    options?: Partial<Omit<AtomicStatement, 'id' | 'statement' | 'type'>>
  ): AtomicStatement {
    const newStatement: AtomicStatement = {
      id: randomUUID(),
      statement,
      type,
      confidence: options?.confidence ?? 1.0,
      isExplicit: options?.isExplicit ?? true,
      ...options,
    };
    this.addStatement(newStatement);
    return newStatement;
  }

  /**
   * Add a dependency edge between two statements
   *
   * @param from - ID of the source statement (prerequisite)
   * @param to - ID of the target statement (depends on source)
   * @param type - Type of dependency
   * @param options - Additional edge options
   */
  addDependency(
    from: string,
    to: string,
    type: DependencyEdge['type'] = 'logical',
    options?: { strength?: number; inferenceRule?: InferenceRule }
  ): void {
    if (!this.nodes.has(from)) {
      throw new Error(`Source node '${from}' not found in graph`);
    }
    if (!this.nodes.has(to)) {
      throw new Error(`Target node '${to}' not found in graph`);
    }

    const edge: DependencyEdge = {
      from,
      to,
      type,
      strength: options?.strength ?? 1.0,
      inferenceRule: options?.inferenceRule,
    };

    this.edges.push(edge);

    // Update adjacency lists
    const adj = this.adjacencyList.get(from) || [];
    adj.push(to);
    this.adjacencyList.set(from, adj);

    const revAdj = this.reverseAdjacencyList.get(to) || [];
    revAdj.push(from);
    this.reverseAdjacencyList.set(to, revAdj);
  }

  /**
   * Find root nodes (axioms/hypotheses with no incoming edges)
   */
  findRoots(): string[] {
    const roots: string[] = [];
    for (const [nodeId] of this.nodes) {
      const incoming = this.reverseAdjacencyList.get(nodeId) || [];
      if (incoming.length === 0) {
        roots.push(nodeId);
      }
    }
    return roots;
  }

  /**
   * Find leaf nodes (conclusions with no outgoing edges)
   */
  findLeaves(): string[] {
    const leaves: string[] = [];
    for (const [nodeId] of this.nodes) {
      const outgoing = this.adjacencyList.get(nodeId) || [];
      if (outgoing.length === 0) {
        leaves.push(nodeId);
      }
    }
    return leaves;
  }

  /**
   * Get all ancestors of a node (all nodes that lead to this node)
   */
  getAncestors(nodeId: string): string[] {
    const ancestors = new Set<string>();
    const visited = new Set<string>();
    const stack = [nodeId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const parents = this.reverseAdjacencyList.get(current) || [];
      for (const parent of parents) {
        ancestors.add(parent);
        stack.push(parent);
      }
    }

    return Array.from(ancestors);
  }

  /**
   * Get all descendants of a node (all nodes that depend on this node)
   */
  getDescendants(nodeId: string): string[] {
    const descendants = new Set<string>();
    const visited = new Set<string>();
    const stack = [nodeId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const children = this.adjacencyList.get(current) || [];
      for (const child of children) {
        descendants.add(child);
        stack.push(child);
      }
    }

    return Array.from(descendants);
  }

  /**
   * Compute the depth of the graph (longest path from any root to any leaf)
   */
  computeDepth(): number {
    const roots = this.findRoots();
    if (roots.length === 0) return 0;

    let maxDepth = 0;
    const memo = new Map<string, number>();

    const dfs = (nodeId: string, visited: Set<string>): number => {
      if (memo.has(nodeId)) return memo.get(nodeId)!;
      if (visited.has(nodeId)) return 0; // Cycle detected, don't count

      visited.add(nodeId);
      const children = this.adjacencyList.get(nodeId) || [];

      if (children.length === 0) {
        memo.set(nodeId, 1);
        return 1;
      }

      let maxChildDepth = 0;
      for (const child of children) {
        maxChildDepth = Math.max(maxChildDepth, dfs(child, new Set(visited)));
      }

      const depth = 1 + maxChildDepth;
      memo.set(nodeId, depth);
      return depth;
    };

    for (const root of roots) {
      maxDepth = Math.max(maxDepth, dfs(root, new Set()));
    }

    return maxDepth;
  }

  /**
   * Compute the width of the graph (maximum nodes at any level)
   */
  computeWidth(): number {
    const roots = this.findRoots();
    if (roots.length === 0) return 0;

    const levels = new Map<string, number>();
    const queue: { nodeId: string; level: number }[] = roots.map((r) => ({
      nodeId: r,
      level: 0,
    }));
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { nodeId, level } = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      levels.set(nodeId, level);

      const children = this.adjacencyList.get(nodeId) || [];
      for (const child of children) {
        if (!visited.has(child)) {
          queue.push({ nodeId: child, level: level + 1 });
        }
      }
    }

    // Count nodes at each level
    const levelCounts = new Map<number, number>();
    for (const [, level] of levels) {
      levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
    }

    return Math.max(...levelCounts.values(), 0);
  }

  /**
   * Detect cycles using Tarjan's algorithm for strongly connected components
   * Returns arrays of node IDs that form cycles
   */
  detectCycles(): string[][] {
    const index = new Map<string, number>();
    const lowlink = new Map<string, number>();
    const onStack = new Set<string>();
    const stack: string[] = [];
    const sccs: string[][] = [];
    let currentIndex = 0;

    const strongConnect = (nodeId: string): void => {
      index.set(nodeId, currentIndex);
      lowlink.set(nodeId, currentIndex);
      currentIndex++;
      stack.push(nodeId);
      onStack.add(nodeId);

      const neighbors = this.adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!index.has(neighbor)) {
          // Neighbor hasn't been visited
          strongConnect(neighbor);
          lowlink.set(nodeId, Math.min(lowlink.get(nodeId)!, lowlink.get(neighbor)!));
        } else if (onStack.has(neighbor)) {
          // Neighbor is on stack, so it's part of current SCC
          lowlink.set(nodeId, Math.min(lowlink.get(nodeId)!, index.get(neighbor)!));
        }
      }

      // If nodeId is a root node, pop the stack to get the SCC
      if (lowlink.get(nodeId) === index.get(nodeId)) {
        const scc: string[] = [];
        let w: string;
        do {
          w = stack.pop()!;
          onStack.delete(w);
          scc.push(w);
        } while (w !== nodeId);

        // Only include SCCs with more than one node (actual cycles)
        // or self-loops
        if (scc.length > 1) {
          sccs.push(scc);
        } else if (scc.length === 1) {
          // Check for self-loop
          const selfLoops = this.adjacencyList.get(scc[0]) || [];
          if (selfLoops.includes(scc[0])) {
            sccs.push(scc);
          }
        }
      }
    };

    // Run Tarjan's algorithm on all nodes
    for (const [nodeId] of this.nodes) {
      if (!index.has(nodeId)) {
        strongConnect(nodeId);
      }
    }

    return sccs;
  }

  /**
   * Check if the graph has any cycles
   */
  hasCycles(): boolean {
    return this.detectCycles().length > 0;
  }

  /**
   * Get topological order of nodes (only valid if no cycles)
   * Returns null if cycles exist
   */
  getTopologicalOrder(): string[] | null {
    if (this.hasCycles()) {
      return null;
    }

    const inDegree = new Map<string, number>();
    for (const [nodeId] of this.nodes) {
      inDegree.set(nodeId, 0);
    }

    for (const edge of this.edges) {
      inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
    }

    const queue: string[] = [];
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    const result: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      const neighbors = this.adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    return result.length === this.nodes.size ? result : null;
  }

  /**
   * Find a path between two nodes
   * Returns null if no path exists
   */
  findPath(from: string, to: string): string[] | null {
    if (!this.nodes.has(from) || !this.nodes.has(to)) {
      return null;
    }

    const visited = new Set<string>();
    const parent = new Map<string, string>();
    const queue = [from];
    visited.add(from);

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current === to) {
        // Reconstruct path
        const path: string[] = [];
        let node: string | undefined = to;
        while (node !== undefined) {
          path.unshift(node);
          node = parent.get(node);
        }
        return path;
      }

      const neighbors = this.adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent.set(neighbor, current);
          queue.push(neighbor);
        }
      }
    }

    return null;
  }

  /**
   * Find all paths between two nodes
   */
  findAllPaths(from: string, to: string, maxPaths: number = 100): string[][] {
    if (!this.nodes.has(from) || !this.nodes.has(to)) {
      return [];
    }

    const paths: string[][] = [];

    const dfs = (current: string, path: string[], visited: Set<string>): void => {
      if (paths.length >= maxPaths) return;

      if (current === to) {
        paths.push([...path]);
        return;
      }

      const neighbors = this.adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          path.push(neighbor);
          dfs(neighbor, path, visited);
          path.pop();
          visited.delete(neighbor);
        }
      }
    };

    const visited = new Set<string>([from]);
    dfs(from, [from], visited);

    return paths;
  }

  /**
   * Build the complete dependency graph
   */
  build(): DependencyGraph {
    const cycles = this.detectCycles();
    const hasCycles = cycles.length > 0;
    const topologicalOrder = hasCycles ? undefined : (this.getTopologicalOrder() ?? undefined);

    return {
      nodes: new Map(this.nodes),
      edges: [...this.edges],
      roots: this.findRoots(),
      leaves: this.findLeaves(),
      depth: this.computeDepth(),
      width: this.computeWidth(),
      hasCycles,
      stronglyConnectedComponents: hasCycles ? cycles : undefined,
      topologicalOrder,
    };
  }

  /**
   * Get the number of nodes in the graph
   */
  get nodeCount(): number {
    return this.nodes.size;
  }

  /**
   * Get the number of edges in the graph
   */
  get edgeCount(): number {
    return this.edges.length;
  }

  /**
   * Check if a node exists
   */
  hasNode(nodeId: string): boolean {
    return this.nodes.has(nodeId);
  }

  /**
   * Get a node by ID
   */
  getNode(nodeId: string): AtomicStatement | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes
   */
  getAllNodes(): AtomicStatement[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get all edges
   */
  getAllEdges(): DependencyEdge[] {
    return [...this.edges];
  }

  /**
   * Clear the graph
   */
  clear(): void {
    this.nodes.clear();
    this.edges = [];
    this.adjacencyList.clear();
    this.reverseAdjacencyList.clear();
  }
}
