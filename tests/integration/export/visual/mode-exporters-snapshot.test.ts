/**
 * Snapshot Tests for Mode Visual Exporters (Phase 13 Sprint 4)
 *
 * These tests validate the structure of outputs from mode exporters
 * without requiring full thought fixtures.
 */

import { describe, it, expect } from 'vitest';
import {
  // Graph builders
  DOTGraphBuilder,
  MermaidGraphBuilder,
  GraphMLBuilder,
} from '../../../../src/export/visual/utils/index.js';
import {
  ASCIIDocBuilder,
} from '../../../../src/export/visual/utils/ascii.js';
import {
  SVGBuilder,
} from '../../../../src/export/visual/utils/svg.js';
import {
  TikZBuilder,
} from '../../../../src/export/visual/utils/tikz.js';
import {
  UMLBuilder,
} from '../../../../src/export/visual/utils/uml.js';
import {
  HTMLDocBuilder,
} from '../../../../src/export/visual/utils/html.js';
import {
  MarkdownBuilder,
} from '../../../../src/export/visual/utils/markdown.js';
import {
  ModelicaBuilder,
} from '../../../../src/export/visual/utils/modelica.js';
import {
  JSONExportBuilder,
} from '../../../../src/export/visual/utils/json.js';

// ============================================================================
// Snapshot Tests - DOT Builder Output
// ============================================================================

describe('DOT Builder Output Snapshots', () => {
  it('should generate consistent DOT output for sequential flow', () => {
    const result = new DOTGraphBuilder()
      .setGraphName('SequentialFlow')
      .setRankDir('LR')
      .addNode({ id: 'step1', label: 'Identify Problem', shape: 'ellipse', color: 'lightblue' })
      .addNode({ id: 'step2', label: 'Analyze', shape: 'box' })
      .addNode({ id: 'step3', label: 'Solve', shape: 'box' })
      .addNode({ id: 'step4', label: 'Verify', shape: 'doubleoctagon', color: 'lightgreen' })
      .addEdge({ source: 'step1', target: 'step2' })
      .addEdge({ source: 'step2', target: 'step3' })
      .addEdge({ source: 'step3', target: 'step4' })
      .render();

    expect(result).toContain('digraph SequentialFlow');
    expect(result).toContain('rankdir=LR');
    expect(result).toContain('step1');
    expect(result).toContain('->');
    expect(result).toMatchSnapshot();
  });

  it('should generate consistent DOT output with subgraphs', () => {
    const result = new DOTGraphBuilder()
      .setGraphName('CausalNetwork')
      .addSubgraph({
        id: 'cluster_causes',
        label: 'Causes',
        nodes: ['c1', 'c2'],
        style: { fillcolor: 'lightpink' },
      })
      .addNode({ id: 'c1', label: 'Cause 1' })
      .addNode({ id: 'c2', label: 'Cause 2' })
      .addNode({ id: 'e1', label: 'Effect' })
      .addEdge({ source: 'c1', target: 'e1' })
      .addEdge({ source: 'c2', target: 'e1' })
      .render();

    expect(result).toContain('subgraph');
    expect(result).toContain('Causes');
    expect(result).toContain('c1');
    expect(result).toContain('e1');
  });
});

// ============================================================================
// Snapshot Tests - Mermaid Builder Output
// ============================================================================

describe('Mermaid Builder Output Snapshots', () => {
  it('should generate consistent Mermaid flowchart', () => {
    const result = new MermaidGraphBuilder()
      .setDirection('TD')
      .addNode({ id: 'a', label: 'Start', shape: 'stadium' })
      .addNode({ id: 'b', label: 'Process', shape: 'rectangle' })
      .addNode({ id: 'c', label: 'Decision', shape: 'diamond' })
      .addNode({ id: 'd', label: 'End', shape: 'stadium' })
      .addEdge({ source: 'a', target: 'b', style: 'arrow' })
      .addEdge({ source: 'b', target: 'c', style: 'arrow' })
      .addEdge({ source: 'c', target: 'd', label: 'yes', style: 'arrow' })
      .render();

    expect(result).toContain('graph TD');
    expect(result).toContain('-->');
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Snapshot Tests - GraphML Builder Output
// ============================================================================

describe('GraphML Builder Output Snapshots', () => {
  it('should generate valid GraphML structure', () => {
    const result = new GraphMLBuilder()
      .addNode('n1', 'Node 1')
      .addNode('n2', 'Node 2')
      .addEdge('n1', 'n2', { label: 'connects' })
      .render();

    expect(result).toContain('<?xml version="1.0"');
    expect(result).toContain('<graphml');
    expect(result).toContain('</graphml>');
    expect(result).toContain('Node 1');
    expect(result).toContain('Node 2');
  });
});

// ============================================================================
// Snapshot Tests - SVG Builder Output
// ============================================================================

describe('SVG Builder Output Snapshots', () => {
  it('should generate valid SVG structure', () => {
    const result = new SVGBuilder()
      .setDimensions(400, 200)
      .setTitle('Test Diagram')
      .addStyle('.node { fill: #e0e0e0; }')
      .addRect(50, 50, 100, 50, { class: 'node', rx: 5 })
      .addText(100, 80, 'Node 1', { textAnchor: 'middle' })
      .addLine(150, 75, 200, 75, { stroke: '#333' })
      .addRect(200, 50, 100, 50, { class: 'node', rx: 5 })
      .addText(250, 80, 'Node 2', { textAnchor: 'middle' })
      .render();

    expect(result).toContain('<svg');
    expect(result).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(result).toContain('</svg>');
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Snapshot Tests - TikZ Builder Output
// ============================================================================

describe('TikZ Builder Output Snapshots', () => {
  it('should generate valid TikZ output', () => {
    const result = new TikZBuilder()
      .setStandalone(false)
      .setScale(1)
      .addNode('a', 'Node A', { position: { x: 0, y: 0 }, type: 'primary' })
      .addNode('b', 'Node B', {
        relativePosition: { direction: 'right', of: 'a', distance: '3cm' },
        type: 'neutral',
      })
      .addEdge('a', 'b', { label: 'connects' })
      .render();

    expect(result).toContain('\\begin{tikzpicture}');
    expect(result).toContain('\\end{tikzpicture}');
    expect(result).toMatchSnapshot();
  });

  it('should generate standalone TikZ document', () => {
    const result = TikZBuilder.standalone()
      .setTitle('Diagram')
      .addNode('root', 'Root', { position: { x: 0, y: 0 } })
      .render();

    expect(result).toContain('\\documentclass');
    expect(result).toContain('\\begin{document}');
    expect(result).toContain('\\end{document}');
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Snapshot Tests - UML Builder Output
// ============================================================================

describe('UML Builder Output Snapshots', () => {
  it('should generate valid PlantUML class diagram', () => {
    const result = new UMLBuilder()
      .setTitle('Class Diagram')
      .setDirection('top to bottom')
      .addClass({
        name: 'BaseClass',
        members: ['-field: string'],
        methods: ['+method(): void'],
        abstract: true,
      })
      .addClass({
        name: 'DerivedClass',
        methods: ['+specialMethod(): number'],
      })
      .addRelation({ from: 'DerivedClass', to: 'BaseClass', type: 'inheritance' })
      .render();

    expect(result).toContain('@startuml');
    expect(result).toContain('@enduml');
    expect(result).toContain('abstract class');
    expect(result).toContain('--|>');
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Snapshot Tests - HTML Builder Output
// ============================================================================

describe('HTML Builder Output Snapshots', () => {
  it('should generate valid HTML document', () => {
    const result = new HTMLDocBuilder()
      .setTitle('Test Report')
      .setTheme('light')
      .addHeading(1, 'Report Title')
      .addParagraph('This is a test paragraph.')
      .addTable(['Column A', 'Column B'], [['Value 1', 'Value 2']])
      .render();

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<html');
    expect(result).toContain('</html>');
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Snapshot Tests - Markdown Builder Output
// ============================================================================

describe('Markdown Builder Output Snapshots', () => {
  it('should generate valid Markdown document', () => {
    const result = new MarkdownBuilder()
      .setTitle('Test Document')
      .addHeading(2, 'Section One')
      .addParagraph('This is a paragraph.')
      .addBulletList(['Item 1', 'Item 2', 'Item 3'])
      .addCodeBlock('const x = 1;', 'typescript')
      .render();

    expect(result).toContain('# Test Document');
    expect(result).toContain('## Section One');
    expect(result).toContain('- Item 1');
    expect(result).toContain('```typescript');
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Snapshot Tests - Modelica Builder Output
// ============================================================================

describe('Modelica Builder Output Snapshots', () => {
  it('should generate valid Modelica package', () => {
    const result = new ModelicaBuilder()
      .beginPackage('TestPackage', 'A test package')
      .beginModel('TestModel', 'A test model')
      .addParameter({ name: 'x', type: 'Real', value: 1.0, description: 'Parameter x' })
      .addVariable({ name: 'y', type: 'Real', start: 0, description: 'Variable y' })
      .addEquation({ equation: 'der(y) = x' })
      .endModel()
      .endPackage()
      .render();

    expect(result).toContain('package TestPackage');
    expect(result).toContain('model TestModel');
    expect(result).toContain('end TestModel');
    expect(result).toContain('end TestPackage');
    expect(result).toMatchSnapshot();
  });
});

// ============================================================================
// Snapshot Tests - JSON Builder Output
// ============================================================================

describe('JSON Builder Output Snapshots', () => {
  it('should generate valid JSON structure', () => {
    const result = new JSONExportBuilder()
      .setMetadata({ title: 'Test Export', version: '1.0.0' })
      .addSection('summary', { total: 100, passed: 95 })
      .addArraySection('items', ['A', 'B', 'C'])
      .setFormatting({ prettyPrint: true, indent: 2 })
      .render();

    const parsed = JSON.parse(result);
    expect(parsed.metadata.title).toBe('Test Export');
    expect(parsed.metadata.version).toBe('1.0.0');
    expect(parsed.metadata.generator).toContain('DeepThinking MCP');
    expect(parsed.metadata.exportedAt).toBeDefined();
    expect(parsed.summary.total).toBe(100);
    expect(parsed.items).toEqual(['A', 'B', 'C']);
    // Don't use snapshot since timestamp varies
  });
});

// ============================================================================
// Cross-Builder Consistency Tests
// ============================================================================

describe('Cross-Builder Format Consistency', () => {
  const testNodes = [
    { id: 'a', label: 'Node A' },
    { id: 'b', label: 'Node B' },
    { id: 'c', label: 'Node C' },
  ];
  const testEdges = [
    { source: 'a', target: 'b' },
    { source: 'b', target: 'c' },
  ];

  it('should produce DOT with correct node count', () => {
    const builder = new DOTGraphBuilder();
    testNodes.forEach(n => builder.addNode(n));
    testEdges.forEach(e => builder.addEdge(e));

    expect(builder.nodeCount).toBe(3);
    expect(builder.edgeCount).toBe(2);
  });

  it('should produce Mermaid with correct structure', () => {
    const builder = new MermaidGraphBuilder();
    testNodes.forEach(n => builder.addNode({ ...n, shape: 'rectangle' }));
    testEdges.forEach(e => builder.addEdge({ ...e, style: 'arrow' }));

    const result = builder.render();
    expect(result).toContain('Node A');
    expect(result).toContain('Node B');
    expect(result).toContain('Node C');
  });

  it('should produce GraphML with valid XML', () => {
    const builder = new GraphMLBuilder()
      .addNode('a', 'Node A')
      .addNode('b', 'Node B')
      .addNode('c', 'Node C')
      .addEdge('a', 'b', { label: 'edge 1' })
      .addEdge('b', 'c', { label: 'edge 2' });

    const result = builder.render();
    expect(result).toMatch(/^<\?xml/);
    expect(result).toContain('</graphml>');
  });
});
