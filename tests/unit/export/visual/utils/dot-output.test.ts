/**
 * Exact-output tests for the DOT graph writers.
 *
 * `generateDotGraph` and `DOTGraphBuilder.render` write the same header,
 * defaults, nodes and edges. These tests pin every line of their output, so a
 * change to how one writer builds the text shows up as a changed line.
 */

import { describe, it, expect } from 'vitest';
import {
  DOTGraphBuilder,
  generateDotGraph,
  type DotEdge,
  type DotNode,
  type DotOptions,
} from '../../../../../src/export/visual/utils/dot.js';

const fullOptions: DotOptions = {
  graphType: 'graph',
  graphName: 'my graph',
  rankDir: 'LR',
  splines: 'ortho',
  overlap: false,
  concentrate: true,
  compound: true,
  bgcolor: 'white',
  fontName: 'Arial',
  fontSize: 12,
  nodeDefaults: {
    shape: 'box',
    style: ['rounded', 'filled'],
    fillColor: '#eee',
    fontName: 'Courier',
    fontSize: 9,
  },
  edgeDefaults: { style: 'dashed', color: 'red', arrowHead: 'vee' },
};

const fullNodes: DotNode[] = [
  { id: 'a b', label: 'say "hi"\nnow' },
  { id: 'c', shape: 'diamond' },
];

const fullEdges: DotEdge[] = [
  { source: 'a b', target: 'c', label: 'x', style: 'bold', penWidth: 2 },
];

const fullOutput = [
  'graph "my graph" {',
  '  rankdir=LR;',
  '  splines=ortho;',
  '  overlap=false;',
  '  concentrate=true;',
  '  compound=true;',
  '  bgcolor="white";',
  '  fontname="Arial";',
  '  fontsize=12;',
  '  node [shape=box, style="rounded,filled", fillcolor="#eee", fontname="Courier", fontsize=9];',
  '  edge [style=dashed, color="red", arrowhead=vee];',
  '',
  '  "a b" [label="say \\"hi\\"\\nnow"];',
  '  c [shape=diamond];',
  '',
  '  "a b" -- c [label="x", style=bold, penwidth=2];',
  '}',
].join('\n');

describe('generateDotGraph output', () => {
  it('writes a directed graph with one node and no edges', () => {
    expect(generateDotGraph([{ id: 'a' }], [])).toBe(
      ['digraph G {', '  rankdir=TB;', '', '  a;', '}'].join('\n')
    );
  });

  it('writes the header and the blank line for an empty graph', () => {
    expect(generateDotGraph([], [])).toBe(['digraph G {', '  rankdir=TB;', '', '}'].join('\n'));
  });

  it('writes every graph attribute, both default lines, the nodes and the edges', () => {
    expect(generateDotGraph(fullNodes, fullEdges, fullOptions)).toBe(fullOutput);
  });

  it('writes the arrow of a directed graph as ->', () => {
    expect(
      generateDotGraph([{ id: 'a' }, { id: 'b' }], [{ source: 'a', target: 'b' }])
    ).toBe(['digraph G {', '  rankdir=TB;', '', '  a;', '  b;', '', '  a -> b;', '}'].join('\n'));
  });

  it('leaves out a default line whose attributes are all empty', () => {
    expect(
      generateDotGraph([], [], { nodeDefaults: {}, edgeDefaults: {}, fontSize: 0, bgcolor: '' })
    ).toBe(['digraph G {', '  rankdir=TB;', '', '}'].join('\n'));
  });
});

describe('DOTGraphBuilder.render output', () => {
  it('gives the same text as generateDotGraph when the graph has no subgraph', () => {
    const rendered = new DOTGraphBuilder()
      .setOptions(fullOptions)
      .addNodes(fullNodes)
      .addEdges(fullEdges)
      .render();

    expect(rendered).toBe(fullOutput);
    expect(rendered).toBe(generateDotGraph(fullNodes, fullEdges, fullOptions));
  });

  it('writes a subgraph after the nodes that are outside it and before the edges', () => {
    const rendered = new DOTGraphBuilder()
      .addNode({ id: 'a', label: 'A', shape: 'box' })
      .addNode({ id: 'b' })
      .addSubgraph({
        id: 's1',
        label: 'Group',
        style: 'filled',
        fillColor: '#eee',
        color: 'red',
        rank: 'same',
        nodes: ['a', 'ghost'],
      })
      .addEdge({ source: 'b', target: 'a' })
      .render();

    expect(rendered).toBe(
      [
        'digraph G {',
        '  rankdir=TB;',
        '',
        '  b;',
        '',
        '  subgraph cluster_s1 {',
        '    label="Group";',
        '    style=filled;',
        '    fillcolor="#eee";',
        '    color="red";',
        '    rank=same;',
        '    a [label="A", shape=box];',
        '    ghost;',
        '  }',
        '',
        '  b -> a;',
        '}',
      ].join('\n')
    );
  });

  it('gives the same text on every call', () => {
    const builder = new DOTGraphBuilder().addNodes(fullNodes).addEdges(fullEdges).setOptions(fullOptions);

    expect(builder.render()).toBe(builder.render());
  });
});
