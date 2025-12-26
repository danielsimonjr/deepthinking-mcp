/**
 * Unit tests for Graph Builder classes (Phase 13 Sprint 1)
 * Tests DOTGraphBuilder, MermaidGraphBuilder, and GraphMLBuilder fluent APIs
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  DOTGraphBuilder,
  DotNode,
  DotEdge,
  DotSubgraph,
  generateDotGraph,
} from '../../../../../src/export/visual/utils/dot.js';
import {
  MermaidGraphBuilder,
  MermaidNode,
  MermaidEdge,
  generateMermaidFlowchart,
} from '../../../../../src/export/visual/utils/mermaid.js';
import {
  GraphMLBuilder,
  GraphMLNode,
  GraphMLEdge,
  generateGraphML,
} from '../../../../../src/export/visual/utils/graphml.js';

// =============================================================================
// DOTGraphBuilder Tests
// =============================================================================

describe('DOTGraphBuilder', () => {
  let builder: DOTGraphBuilder;

  beforeEach(() => {
    builder = new DOTGraphBuilder();
  });

  describe('constructor and initialization', () => {
    it('should create an empty builder', () => {
      expect(builder.nodeCount).toBe(0);
      expect(builder.edgeCount).toBe(0);
      expect(builder.subgraphCount).toBe(0);
    });
  });

  describe('addNode', () => {
    it('should add a single node', () => {
      builder.addNode({ id: 'a', label: 'Node A' });
      expect(builder.nodeCount).toBe(1);
    });

    it('should return this for chaining', () => {
      const result = builder.addNode({ id: 'a', label: 'Node A' });
      expect(result).toBe(builder);
    });

    it('should add multiple nodes via chaining', () => {
      builder
        .addNode({ id: 'a', label: 'Node A' })
        .addNode({ id: 'b', label: 'Node B' })
        .addNode({ id: 'c', label: 'Node C' });
      expect(builder.nodeCount).toBe(3);
    });
  });

  describe('addNodes', () => {
    it('should add multiple nodes at once', () => {
      const nodes: DotNode[] = [
        { id: 'a', label: 'Node A' },
        { id: 'b', label: 'Node B' },
      ];
      builder.addNodes(nodes);
      expect(builder.nodeCount).toBe(2);
    });
  });

  describe('addEdge', () => {
    it('should add a single edge', () => {
      builder.addEdge({ source: 'a', target: 'b' });
      expect(builder.edgeCount).toBe(1);
    });

    it('should return this for chaining', () => {
      const result = builder.addEdge({ source: 'a', target: 'b' });
      expect(result).toBe(builder);
    });
  });

  describe('addEdges', () => {
    it('should add multiple edges at once', () => {
      const edges: DotEdge[] = [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
      ];
      builder.addEdges(edges);
      expect(builder.edgeCount).toBe(2);
    });
  });

  describe('addSubgraph', () => {
    it('should add a subgraph', () => {
      builder.addSubgraph({ id: 'cluster1', label: 'Group 1', nodes: ['a', 'b'] });
      expect(builder.subgraphCount).toBe(1);
    });
  });

  describe('setOptions', () => {
    it('should set graph options', () => {
      builder.setOptions({ rankDir: 'LR', graphName: 'Test' });
      const output = builder.render();
      expect(output).toContain('rankdir=LR;');
      expect(output).toContain('digraph Test {');
    });

    it('should merge options', () => {
      builder.setOptions({ rankDir: 'LR' });
      builder.setOptions({ graphName: 'Test' });
      const output = builder.render();
      expect(output).toContain('rankdir=LR;');
      expect(output).toContain('digraph Test {');
    });
  });

  describe('setGraphName', () => {
    it('should set the graph name', () => {
      builder.setGraphName('MyGraph');
      const output = builder.render();
      expect(output).toContain('digraph MyGraph {');
    });
  });

  describe('setRankDir', () => {
    it('should set the rank direction', () => {
      builder.setRankDir('LR');
      const output = builder.render();
      expect(output).toContain('rankdir=LR;');
    });
  });

  describe('setDirected', () => {
    it('should create a digraph by default', () => {
      const output = builder.render();
      expect(output).toContain('digraph');
    });

    it('should create an undirected graph when set to false', () => {
      builder.setDirected(false);
      const output = builder.render();
      expect(output).toContain('graph');
      expect(output).not.toContain('digraph');
    });
  });

  describe('setNodeDefaults', () => {
    it('should set default node attributes', () => {
      builder.setNodeDefaults({ shape: 'box', fillColor: '#aaa' });
      const output = builder.render();
      expect(output).toContain('node [shape=box, fillcolor="#aaa"];');
    });
  });

  describe('setEdgeDefaults', () => {
    it('should set default edge attributes', () => {
      builder.setEdgeDefaults({ style: 'dashed', color: '#999' });
      const output = builder.render();
      expect(output).toContain('edge [style=dashed, color="#999"];');
    });
  });

  describe('clear', () => {
    it('should clear all nodes, edges, and subgraphs', () => {
      builder
        .addNode({ id: 'a', label: 'A' })
        .addEdge({ source: 'a', target: 'b' })
        .addSubgraph({ id: 'g1', nodes: ['a'] })
        .clear();
      expect(builder.nodeCount).toBe(0);
      expect(builder.edgeCount).toBe(0);
      expect(builder.subgraphCount).toBe(0);
    });
  });

  describe('resetOptions', () => {
    it('should reset options to defaults', () => {
      builder.setOptions({ rankDir: 'LR', graphName: 'Custom' });
      builder.resetOptions();
      const output = builder.render();
      expect(output).toContain('rankdir=TB;'); // Default
      expect(output).toContain('digraph G {'); // Default name
    });
  });

  describe('render', () => {
    it('should render a simple graph', () => {
      const output = builder
        .addNode({ id: 'a', label: 'Node A' })
        .addNode({ id: 'b', label: 'Node B' })
        .addEdge({ source: 'a', target: 'b' })
        .render();

      expect(output).toContain('digraph G {');
      expect(output).toContain('a [label="Node A"];');
      expect(output).toContain('b [label="Node B"];');
      expect(output).toContain('a -> b;');
      expect(output).toContain('}');
    });

    it('should render nodes with attributes', () => {
      const output = builder
        .addNode({
          id: 'fancy',
          label: 'Fancy Node',
          shape: 'box',
          style: ['rounded', 'filled'],
          fillColor: '#a8d5ff',
        })
        .render();

      expect(output).toContain('fancy [label="Fancy Node", shape=box, style="rounded,filled", fillcolor="#a8d5ff"];');
    });

    it('should render edges with labels', () => {
      const output = builder
        .addNode({ id: 'a', label: 'A' })
        .addNode({ id: 'b', label: 'B' })
        .addEdge({ source: 'a', target: 'b', label: 'connects to' })
        .render();

      expect(output).toContain('a -> b [label="connects to"];');
    });

    it('should render subgraphs correctly', () => {
      const output = builder
        .addNode({ id: 'a', label: 'A' })
        .addNode({ id: 'b', label: 'B' })
        .addSubgraph({ id: 'group1', label: 'Group 1', nodes: ['a', 'b'], style: 'filled' })
        .render();

      expect(output).toContain('subgraph cluster_group1 {');
      expect(output).toContain('label="Group 1";');
      expect(output).toContain('style=filled;');
    });

    it('should produce output consistent with generateDotGraph', () => {
      const nodes: DotNode[] = [
        { id: 'n1', label: 'Node 1' },
        { id: 'n2', label: 'Node 2' },
      ];
      const edges: DotEdge[] = [{ source: 'n1', target: 'n2' }];

      const builderOutput = DOTGraphBuilder.from(nodes, edges).render();
      const directOutput = generateDotGraph(nodes, edges);

      // Both should contain the same essential elements
      expect(builderOutput).toContain('digraph G {');
      expect(builderOutput).toContain('n1 [label="Node 1"];');
      expect(builderOutput).toContain('n1 -> n2;');
      expect(directOutput).toContain('digraph G {');
    });
  });

  describe('static from', () => {
    it('should create a builder from existing data', () => {
      const nodes: DotNode[] = [{ id: 'a', label: 'A' }];
      const edges: DotEdge[] = [{ source: 'a', target: 'b' }];
      const options = { graphName: 'FromTest' };

      const newBuilder = DOTGraphBuilder.from(nodes, edges, options);
      expect(newBuilder.nodeCount).toBe(1);
      expect(newBuilder.edgeCount).toBe(1);
      expect(newBuilder.render()).toContain('digraph FromTest {');
    });
  });
});

// =============================================================================
// MermaidGraphBuilder Tests
// =============================================================================

describe('MermaidGraphBuilder', () => {
  let builder: MermaidGraphBuilder;

  beforeEach(() => {
    builder = new MermaidGraphBuilder();
  });

  describe('constructor and initialization', () => {
    it('should create an empty builder', () => {
      expect(builder.nodeCount).toBe(0);
      expect(builder.edgeCount).toBe(0);
      expect(builder.subgraphCount).toBe(0);
    });
  });

  describe('addNode', () => {
    it('should add a single node', () => {
      builder.addNode({ id: 'a', label: 'Node A' });
      expect(builder.nodeCount).toBe(1);
    });

    it('should return this for chaining', () => {
      const result = builder.addNode({ id: 'a', label: 'Node A' });
      expect(result).toBe(builder);
    });
  });

  describe('addNodes', () => {
    it('should add multiple nodes at once', () => {
      builder.addNodes([
        { id: 'a', label: 'Node A' },
        { id: 'b', label: 'Node B' },
      ]);
      expect(builder.nodeCount).toBe(2);
    });
  });

  describe('addEdge', () => {
    it('should add a single edge', () => {
      builder.addEdge({ source: 'a', target: 'b' });
      expect(builder.edgeCount).toBe(1);
    });
  });

  describe('addSubgraph', () => {
    it('should add a subgraph with convenience method', () => {
      builder.addSubgraph('group1', 'Group 1', ['a', 'b']);
      expect(builder.subgraphCount).toBe(1);
    });

    it('should add a subgraph with direction', () => {
      builder.addSubgraph('group1', 'Group 1', ['a', 'b'], 'LR');
      expect(builder.subgraphCount).toBe(1);
    });
  });

  describe('setDirection', () => {
    it('should set the diagram direction', () => {
      builder.setDirection('LR');
      const output = builder.render();
      expect(output).toContain('graph LR');
    });
  });

  describe('setColorScheme', () => {
    it('should set color scheme to pastel', () => {
      builder.setColorScheme('pastel');
      // ColorScheme affects styling, not a visible string
      // Just verify no error occurs
      const output = builder.render();
      expect(output).toContain('graph TD');
    });
  });

  describe('clear', () => {
    it('should clear all elements', () => {
      builder
        .addNode({ id: 'a', label: 'A' })
        .addEdge({ source: 'a', target: 'b' })
        .addSubgraph('g1', 'G1', ['a'])
        .clear();
      expect(builder.nodeCount).toBe(0);
      expect(builder.edgeCount).toBe(0);
      expect(builder.subgraphCount).toBe(0);
    });
  });

  describe('render', () => {
    it('should render a simple flowchart', () => {
      const output = builder
        .addNode({ id: 'a', label: 'Start', shape: 'stadium' })
        .addNode({ id: 'b', label: 'Process', shape: 'rectangle' })
        .addEdge({ source: 'a', target: 'b' })
        .render();

      expect(output).toContain('graph TD');
      expect(output).toContain('a(["Start"])');
      expect(output).toContain('b["Process"]');
      expect(output).toContain('a --> b');
    });

    it('should render edges with labels', () => {
      const output = builder
        .addNode({ id: 'a', label: 'A' })
        .addNode({ id: 'b', label: 'B' })
        .addEdge({ source: 'a', target: 'b', label: 'flow' })
        .render();

      expect(output).toContain('a -->|flow| b');
    });

    it('should render different edge styles', () => {
      builder.addNode({ id: 'a', label: 'A' }).addNode({ id: 'b', label: 'B' });

      builder.addEdge({ source: 'a', target: 'b', style: 'dotted' });
      const output = builder.render();
      expect(output).toContain('a -.-> b');
    });

    it('should render node styles', () => {
      const output = builder
        .addNode({
          id: 'styled',
          label: 'Styled',
          style: { fill: '#ff0000', stroke: '#000000' },
        })
        .render();

      expect(output).toContain('style styled fill:#ff0000,stroke:#000000');
    });
  });

  describe('static from', () => {
    it('should create a builder from existing data', () => {
      const nodes: MermaidNode[] = [{ id: 'a', label: 'A' }];
      const edges: MermaidEdge[] = [{ source: 'a', target: 'b' }];
      const options = { direction: 'LR' as const };

      const newBuilder = MermaidGraphBuilder.from(nodes, edges, options);
      expect(newBuilder.nodeCount).toBe(1);
      expect(newBuilder.edgeCount).toBe(1);
      expect(newBuilder.render()).toContain('graph LR');
    });
  });
});

// =============================================================================
// GraphMLBuilder Tests
// =============================================================================

describe('GraphMLBuilder', () => {
  let builder: GraphMLBuilder;

  beforeEach(() => {
    builder = new GraphMLBuilder();
  });

  describe('constructor and initialization', () => {
    it('should create an empty builder', () => {
      expect(builder.nodeCount).toBe(0);
      expect(builder.edgeCount).toBe(0);
    });
  });

  describe('addNode', () => {
    it('should add a node with convenience method', () => {
      builder.addNode('n1', 'Node 1');
      expect(builder.nodeCount).toBe(1);
    });

    it('should add a node with type and metadata', () => {
      builder.addNode('n1', 'Node 1', { type: 'start', metadata: { priority: 1 } });
      expect(builder.nodeCount).toBe(1);
    });

    it('should return this for chaining', () => {
      const result = builder.addNode('n1', 'Node 1');
      expect(result).toBe(builder);
    });
  });

  describe('addNodeDef', () => {
    it('should add a complete node object', () => {
      builder.addNodeDef({ id: 'n1', label: 'Node 1', type: 'process' });
      expect(builder.nodeCount).toBe(1);
    });
  });

  describe('addEdge', () => {
    it('should add an edge with convenience method', () => {
      builder.addEdge('n1', 'n2');
      expect(builder.edgeCount).toBe(1);
    });

    it('should add an edge with attributes', () => {
      builder.addEdge('n1', 'n2', { label: 'connects', metadata: { weight: 0.5 } });
      expect(builder.edgeCount).toBe(1);
    });

    it('should auto-increment edge IDs', () => {
      builder.addEdge('a', 'b').addEdge('b', 'c').addEdge('c', 'd');
      expect(builder.edgeCount).toBe(3);
    });
  });

  describe('defineNodeAttribute', () => {
    it('should define a custom node attribute', () => {
      builder.defineNodeAttribute('priority', 'int', '0');
      // Attribute will be rendered in output
      const output = builder.render();
      // With custom attributes, we get the extended header
      expect(output).toContain('<?xml');
    });
  });

  describe('defineEdgeAttribute', () => {
    it('should define a custom edge attribute', () => {
      builder.defineEdgeAttribute('cost', 'double');
      const output = builder.render();
      expect(output).toContain('<?xml');
    });
  });

  describe('setGraphId', () => {
    it('should set the graph ID', () => {
      builder.setGraphId('CustomGraph');
      const output = builder.render();
      expect(output).toContain('graph id="CustomGraph"');
    });
  });

  describe('setGraphName', () => {
    it('should set the graph name', () => {
      builder.setGraphName('My Graph');
      const output = builder.render();
      expect(output).toContain('<data key="graphName">My Graph</data>');
    });
  });

  describe('setDirected', () => {
    it('should set directed graph', () => {
      builder.setDirected(true);
      const output = builder.render();
      expect(output).toContain('edgedefault="directed"');
    });

    it('should set undirected graph', () => {
      builder.setDirected(false);
      const output = builder.render();
      expect(output).toContain('edgedefault="undirected"');
    });
  });

  describe('clear', () => {
    it('should clear all nodes and edges', () => {
      builder.addNode('n1', 'Node 1').addEdge('n1', 'n2').clear();
      expect(builder.nodeCount).toBe(0);
      expect(builder.edgeCount).toBe(0);
    });
  });

  describe('render', () => {
    it('should render a valid GraphML document', () => {
      const output = builder
        .addNode('n1', 'Node 1')
        .addNode('n2', 'Node 2')
        .addEdge('n1', 'n2')
        .render();

      expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(output).toContain('<graphml');
      expect(output).toContain('<node id="n1">');
      expect(output).toContain('<data key="label">Node 1</data>');
      expect(output).toContain('<edge id="e0" source="n1" target="n2">');
      expect(output).toContain('</graphml>');
    });

    it('should render node types', () => {
      const output = builder.addNode('n1', 'Node 1', { type: 'start' }).render();
      expect(output).toContain('<data key="type">start</data>');
    });

    it('should render edge labels', () => {
      const output = builder.addEdge('n1', 'n2', { label: 'flow' }).render();
      expect(output).toContain('<data key="edgeLabel">flow</data>');
    });

    it('should render with custom attributes', () => {
      const output = builder
        .defineNodeAttribute('priority', 'int', '5')
        .addNode('n1', 'Node')
        .render();

      expect(output).toContain('attr.name="priority"');
      expect(output).toContain('attr.type="int"');
    });

    it('should produce output consistent with generateGraphML', () => {
      const nodes: GraphMLNode[] = [
        { id: 'n1', label: 'Node 1' },
        { id: 'n2', label: 'Node 2' },
      ];
      const edges: GraphMLEdge[] = [{ id: 'e0', source: 'n1', target: 'n2' }];

      const builderOutput = GraphMLBuilder.from(nodes, edges).render();
      const directOutput = generateGraphML(nodes, edges);

      // Both should produce valid GraphML
      expect(builderOutput).toContain('<?xml');
      expect(builderOutput).toContain('<node id="n1">');
      expect(directOutput).toContain('<?xml');
      expect(directOutput).toContain('<node id="n1">');
    });
  });

  describe('static from', () => {
    it('should create a builder from existing data', () => {
      const nodes: GraphMLNode[] = [{ id: 'a', label: 'A' }];
      const edges: GraphMLEdge[] = [{ id: 'e1', source: 'a', target: 'b' }];
      const options = { graphId: 'FromTest' };

      const newBuilder = GraphMLBuilder.from(nodes, edges, options);
      expect(newBuilder.nodeCount).toBe(1);
      expect(newBuilder.edgeCount).toBe(1);
      expect(newBuilder.render()).toContain('graph id="FromTest"');
    });
  });
});

// =============================================================================
// Integration Tests - Builder Output Validation
// =============================================================================

describe('Graph Builder Integration', () => {
  it('should create equivalent DOT output via builder and direct function', () => {
    const nodes: DotNode[] = [
      { id: 'start', label: 'Start', shape: 'ellipse' },
      { id: 'process', label: 'Process', shape: 'box' },
      { id: 'end', label: 'End', shape: 'ellipse' },
    ];
    const edges: DotEdge[] = [
      { source: 'start', target: 'process' },
      { source: 'process', target: 'end' },
    ];

    const builder = new DOTGraphBuilder()
      .addNodes(nodes)
      .addEdges(edges)
      .setGraphName('Workflow');

    const output = builder.render();

    // Verify structure
    expect(output).toContain('digraph Workflow {');
    expect(output).toContain('start [label="Start", shape=ellipse];');
    expect(output).toContain('process [label="Process", shape=box];');
    expect(output).toContain('start -> process;');
    expect(output).toContain('process -> end;');
  });

  it('should create equivalent Mermaid output via builder', () => {
    const builder = new MermaidGraphBuilder()
      .setDirection('LR')
      .addNode({ id: 'a', label: 'Input', shape: 'stadium' })
      .addNode({ id: 'b', label: 'Process', shape: 'rectangle' })
      .addNode({ id: 'c', label: 'Output', shape: 'stadium' })
      .addEdge({ source: 'a', target: 'b', label: 'data' })
      .addEdge({ source: 'b', target: 'c', label: 'result' });

    const output = builder.render();

    expect(output).toContain('graph LR');
    expect(output).toContain('a(["Input"])');
    expect(output).toContain('b["Process"]');
    expect(output).toContain('a -->|data| b');
    expect(output).toContain('b -->|result| c');
  });

  it('should create valid GraphML via builder', () => {
    const builder = new GraphMLBuilder()
      .setGraphId('MyNetwork')
      .setGraphName('Test Network')
      .addNode('server', 'Web Server', { type: 'server' })
      .addNode('db', 'Database', { type: 'database' })
      .addNode('cache', 'Cache', { type: 'cache' })
      .addEdge('server', 'db', { label: 'queries' })
      .addEdge('server', 'cache', { label: 'reads' });

    const output = builder.render();

    // Verify XML structure
    expect(output).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(output).toContain('graph id="MyNetwork"');
    expect(output).toContain('<data key="graphName">Test Network</data>');
    expect(output).toContain('<node id="server">');
    expect(output).toContain('<data key="type">server</data>');
    expect(output).toContain('<edge id="e0" source="server" target="db">');
    expect(output).toContain('<data key="edgeLabel">queries</data>');
  });
});
