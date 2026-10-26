/**
 * Graph utility unit tests.
 *
 * The d-separation and intervention analyzers share these helpers.
 */

import { describe, it, expect } from 'vitest';
import {
  getAncestors,
  getDescendants,
  combinations,
} from '../../../../../src/modes/causal/graph/algorithms/graph-utils.js';
import type { CausalGraph } from '../../../../../src/modes/causal/graph/types.js';

// A -> B -> D, A -> C -> D, D -> E; F is isolated
function createDiamondGraph(): CausalGraph {
  return {
    id: 'diamond',
    nodes: ['A', 'B', 'C', 'D', 'E', 'F'].map((id) => ({ id, name: id })),
    edges: [
      { from: 'A', to: 'B', type: 'directed' },
      { from: 'A', to: 'C', type: 'directed' },
      { from: 'B', to: 'D', type: 'directed' },
      { from: 'C', to: 'D', type: 'directed' },
      { from: 'D', to: 'E', type: 'directed' },
    ],
  };
}

describe('getDescendants', () => {
  it('returns every node reachable along edge direction', () => {
    expect([...getDescendants(createDiamondGraph(), 'A')].sort()).toEqual(['B', 'C', 'D', 'E']);
  });

  it('excludes the start node and returns an empty set for a leaf', () => {
    expect(getDescendants(createDiamondGraph(), 'E').size).toBe(0);
    expect(getDescendants(createDiamondGraph(), 'F').size).toBe(0);
  });

  it('terminates on a cycle and does not list the start node twice', () => {
    const graph: CausalGraph = {
      id: 'cycle',
      nodes: [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }],
      edges: [
        { from: 'A', to: 'B', type: 'directed' },
        { from: 'B', to: 'A', type: 'directed' },
      ],
    };
    expect([...getDescendants(graph, 'A')].sort()).toEqual(['A', 'B']);
  });
});

describe('getAncestors', () => {
  it('returns every node that reaches the start node', () => {
    expect([...getAncestors(createDiamondGraph(), 'E')].sort()).toEqual(['A', 'B', 'C', 'D']);
  });

  it('returns an empty set for a root and for an isolated node', () => {
    expect(getAncestors(createDiamondGraph(), 'A').size).toBe(0);
    expect(getAncestors(createDiamondGraph(), 'F').size).toBe(0);
  });
});

// Both functions walk the edges with one stack. The set lists the nodes in the order that the walk
// reaches them, so a change of the walk shows in the order.
function graphOf(nodes: string[], edges: Array<[string, string, CausalGraph['edges'][number]['type']?]>): CausalGraph {
  return {
    id: 'g',
    nodes: nodes.map((id) => ({ id, name: id })),
    edges: edges.map(([from, to, type]) => ({ from, to, type: type ?? 'directed' })),
  };
}

describe('getDescendants and getAncestors: order and edge cases', () => {
  it('list the nodes in the order of the walk', () => {
    const diamond = createDiamondGraph();
    expect([...getDescendants(diamond, 'A')]).toEqual(['B', 'C', 'D', 'E']);
    expect([...getAncestors(diamond, 'E')]).toEqual(['D', 'B', 'C', 'A']);
  });

  it('take the branch that was reached last first (a stack, not a queue)', () => {
    const fork = graphOf(['A', 'B', 'C', 'X', 'Y'], [['A', 'B'], ['A', 'C'], ['B', 'X'], ['C', 'Y']]);
    expect([...getDescendants(fork, 'A')]).toEqual(['B', 'C', 'Y', 'X']);
    const join = graphOf(['D', 'P1', 'P2', 'G1', 'G2'], [['G1', 'P1'], ['G2', 'P2'], ['P1', 'D'], ['P2', 'D']]);
    expect([...getAncestors(join, 'D')]).toEqual(['P1', 'P2', 'G2', 'G1']);
  });

  it('do not depend on the order of the edge list for the set, and follow it for the walk', () => {
    const chain = graphOf(['A', 'B', 'C', 'D'], [['B', 'C'], ['A', 'B'], ['C', 'D']]);
    expect([...getDescendants(chain, 'A')]).toEqual(['B', 'C', 'D']);
    expect([...getAncestors(chain, 'D')]).toEqual(['C', 'B', 'A']);
  });

  it('list a node once for parallel edges', () => {
    const parallel = graphOf(['A', 'B'], [['A', 'B'], ['A', 'B']]);
    expect([...getDescendants(parallel, 'A')]).toEqual(['B']);
    expect([...getAncestors(parallel, 'B')]).toEqual(['A']);
  });

  it('list the start node for a self-loop', () => {
    const loop = graphOf(['A'], [['A', 'A']]);
    expect([...getDescendants(loop, 'A')]).toEqual(['A']);
    expect([...getAncestors(loop, 'A')]).toEqual(['A']);
  });

  it('walk a cycle once in each direction', () => {
    const cycle = graphOf(['A', 'B', 'C'], [['A', 'B'], ['B', 'C'], ['C', 'A']]);
    expect([...getDescendants(cycle, 'A')]).toEqual(['B', 'C', 'A']);
    expect([...getAncestors(cycle, 'A')]).toEqual(['C', 'B', 'A']);
  });

  it('follow an edge of any type and name nodes that the graph does not list', () => {
    const odd = graphOf(['A'], [['A', 'Z', 'bidirected'], ['Z', 'Y'], ['Q', 'A']]);
    expect([...getDescendants(odd, 'A')]).toEqual(['Z', 'Y']);
    expect([...getAncestors(odd, 'A')]).toEqual(['Q']);
  });

  it('give an empty set for a start node that no edge names', () => {
    const chain = graphOf(['A', 'B'], [['A', 'B']]);
    expect(getDescendants(chain, 'missing').size).toBe(0);
    expect(getAncestors(chain, 'missing').size).toBe(0);
  });

  it('give each call its own set', () => {
    const chain = graphOf(['A', 'B'], [['A', 'B']]);
    expect(getDescendants(chain, 'A')).not.toBe(getDescendants(chain, 'A'));
    expect(getAncestors(chain, 'B')).not.toBe(getAncestors(chain, 'B'));
  });
});

describe('combinations', () => {
  it('yields the single empty set for k = 0', () => {
    expect([...combinations(['a', 'b'], 0)]).toEqual([[]]);
  });

  it('yields every k-subset in input order', () => {
    expect([...combinations(['a', 'b', 'c'], 2)]).toEqual([
      ['a', 'b'],
      ['a', 'c'],
      ['b', 'c'],
    ]);
  });

  it('yields nothing when k exceeds the input length', () => {
    expect([...combinations(['a', 'b'], 3)]).toEqual([]);
  });

  it('yields C(5, 3) = 10 subsets', () => {
    expect([...combinations(['a', 'b', 'c', 'd', 'e'], 3)]).toHaveLength(10);
  });
});
