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
