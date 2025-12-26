/**
 * Unit tests for Visual Format Builder classes (Phase 13 Sprint 2)
 * Tests ASCIIDocBuilder, SVGBuilder, and TikZBuilder fluent APIs
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ASCIIDocBuilder,
  AsciiBoxStyle,
  AsciiNode,
  AsciiEdge,
  AsciiTreeNode,
  generateAsciiHeader,
  generateAsciiBox,
  generateAsciiBulletList,
  generateAsciiTable,
} from '../../../../../src/export/visual/utils/ascii.js';
import {
  SVGBuilder,
  SVGGroupBuilder,
  SVGShapeOptions,
  SVGTextOptions,
  escapeSVGText,
} from '../../../../../src/export/visual/utils/svg.js';
import {
  TikZBuilder,
  TikZNodeOptions,
  TikZEdgeOptions,
  escapeLatex,
} from '../../../../../src/export/visual/utils/tikz.js';

// =============================================================================
// ASCIIDocBuilder Tests
// =============================================================================

describe('ASCIIDocBuilder', () => {
  let builder: ASCIIDocBuilder;

  beforeEach(() => {
    builder = new ASCIIDocBuilder();
  });

  describe('constructor and initialization', () => {
    it('should create an empty builder', () => {
      expect(builder.sectionCount).toBe(0);
      expect(builder.lineCount).toBe(0);
    });
  });

  describe('addHeader', () => {
    it('should add a header with equals underline by default', () => {
      builder.addHeader('My Title');
      const output = builder.render();
      expect(output).toContain('My Title');
      expect(output).toContain('========');
    });

    it('should support different header styles', () => {
      builder.addHeader('Double', 'double');
      const output = builder.render();
      expect(output).toContain('══════');
    });

    it('should return this for chaining', () => {
      const result = builder.addHeader('Title');
      expect(result).toBe(builder);
    });
  });

  describe('addSection', () => {
    it('should add a section header', () => {
      builder.addSection('Section Title');
      const output = builder.render();
      expect(output).toContain('Section Title:');
      expect(output).toContain('-');
    });

    it('should support icons', () => {
      builder.addSection('Section', '📋');
      const output = builder.render();
      expect(output).toContain('📋 Section:');
    });
  });

  describe('addBulletList', () => {
    it('should add a bullet list', () => {
      builder.addBulletList(['Item 1', 'Item 2', 'Item 3']);
      const output = builder.render();
      expect(output).toContain('• Item 1');
      expect(output).toContain('• Item 2');
      expect(output).toContain('• Item 3');
    });

    it('should support different bullet styles', () => {
      builder.addBulletList(['Item'], 'filledSquare');
      const output = builder.render();
      expect(output).toContain('■ Item');
    });
  });

  describe('addNumberedList', () => {
    it('should add a numbered list', () => {
      builder.addNumberedList(['First', 'Second', 'Third']);
      const output = builder.render();
      expect(output).toContain('1. First');
      expect(output).toContain('2. Second');
      expect(output).toContain('3. Third');
    });

    it('should support custom start number', () => {
      builder.addNumberedList(['Item'], undefined, 5);
      const output = builder.render();
      expect(output).toContain('5. Item');
    });
  });

  describe('addBox', () => {
    it('should add a box around content', () => {
      builder.addBox('Content');
      const output = builder.render();
      expect(output).toContain('┌');
      expect(output).toContain('┐');
      expect(output).toContain('└');
      expect(output).toContain('┘');
      expect(output).toContain('Content');
    });

    it('should support title', () => {
      builder.addBox('Content', { title: 'Box Title' });
      const output = builder.render();
      expect(output).toContain('Box Title');
    });

    it('should support different box styles', () => {
      builder.addBox('Content', { style: 'double' });
      const output = builder.render();
      expect(output).toContain('╔');
      expect(output).toContain('╗');
    });
  });

  describe('addTable', () => {
    it('should add a table', () => {
      builder.addTable(['Name', 'Age'], [['Alice', '30'], ['Bob', '25']]);
      const output = builder.render();
      expect(output).toContain('Name');
      expect(output).toContain('Age');
      expect(output).toContain('Alice');
      expect(output).toContain('30');
    });
  });

  describe('addTree', () => {
    it('should add a tree structure', () => {
      const tree: AsciiTreeNode = {
        label: 'Root',
        children: [
          { label: 'Child 1' },
          { label: 'Child 2', children: [{ label: 'Grandchild' }] },
        ],
      };
      builder.addTree(tree);
      const output = builder.render();
      expect(output).toContain('Root');
      expect(output).toContain('Child 1');
      expect(output).toContain('Child 2');
      expect(output).toContain('Grandchild');
    });
  });

  describe('addFlowDiagram', () => {
    it('should add a flow diagram', () => {
      builder.addFlowDiagram(['Step 1', 'Step 2', 'Step 3']);
      const output = builder.render();
      expect(output).toContain('Step 1');
      expect(output).toContain('Step 2');
      expect(output).toContain('Step 3');
      expect(output).toContain('↓');
    });

    it('should support horizontal direction', () => {
      builder.addFlowDiagram(['A', 'B'], 'horizontal');
      const output = builder.render();
      expect(output).toContain('→');
    });
  });

  describe('addProgressBar', () => {
    it('should add a progress bar', () => {
      builder.addProgressBar(50, 100);
      const output = builder.render();
      expect(output).toContain('[');
      expect(output).toContain(']');
      expect(output).toContain('50%');
    });
  });

  describe('addMetricsPanel', () => {
    it('should add a metrics panel', () => {
      builder.addMetricsPanel([
        { label: 'Count', value: 42 },
        { label: 'Status', value: 'OK' },
      ]);
      const output = builder.render();
      expect(output).toContain('Count');
      expect(output).toContain('42');
      expect(output).toContain('Status');
      expect(output).toContain('OK');
    });
  });

  describe('addGraph', () => {
    it('should add a graph representation', () => {
      const nodes: AsciiNode[] = [
        { id: 'a', label: 'Node A' },
        { id: 'b', label: 'Node B' },
      ];
      const edges: AsciiEdge[] = [
        { source: 'a', target: 'b' },
      ];
      builder.addGraph(nodes, edges);
      const output = builder.render();
      expect(output).toContain('Node A');
      expect(output).toContain('Node B');
      expect(output).toContain('→');
    });
  });

  describe('addText and addEmptyLine', () => {
    it('should add raw text', () => {
      builder.addText('Raw text content');
      const output = builder.render();
      expect(output).toBe('Raw text content');
    });

    it('should add empty lines', () => {
      builder.addText('Line 1').addEmptyLine(2).addText('Line 2');
      const output = builder.render();
      expect(output).toContain('Line 1');
      expect(output).toContain('Line 2');
      expect(output.split('\n').length).toBeGreaterThan(2);
    });
  });

  describe('addHorizontalRule', () => {
    it('should add a horizontal rule', () => {
      builder.addHorizontalRule(20, '-');
      const output = builder.render();
      expect(output).toBe('--------------------');
    });
  });

  describe('setOptions and static methods', () => {
    it('should set box style', () => {
      builder.setBoxStyle('double').addBox('Content');
      const output = builder.render();
      expect(output).toContain('╔');
    });

    it('should include timestamp when enabled', () => {
      builder.setOptions({ includeTimestamp: true }).addText('Content');
      const output = builder.render();
      expect(output).toContain('Generated:');
    });

    it('should create builder with options', () => {
      const b = ASCIIDocBuilder.withOptions({ boxStyle: 'rounded' });
      b.addBox('Content');
      const output = b.render();
      expect(output).toContain('╭');
    });
  });

  describe('clear and reset', () => {
    it('should clear all content', () => {
      builder.addHeader('Title').addText('Content').clear();
      expect(builder.sectionCount).toBe(0);
    });

    it('should reset options', () => {
      builder.setBoxStyle('double').resetOptions();
      builder.addBox('Content');
      const output = builder.render();
      expect(output).toContain('┌'); // Back to single style
    });
  });

  describe('chaining', () => {
    it('should support method chaining', () => {
      const output = builder
        .addHeader('Document')
        .addEmptyLine()
        .addSection('Overview')
        .addBulletList(['Point 1', 'Point 2'])
        .addEmptyLine()
        .addTable(['A', 'B'], [['1', '2']])
        .render();

      expect(output).toContain('Document');
      expect(output).toContain('Overview');
      expect(output).toContain('Point 1');
    });
  });
});

// =============================================================================
// SVGBuilder Tests
// =============================================================================

describe('SVGBuilder', () => {
  let builder: SVGBuilder;

  beforeEach(() => {
    builder = new SVGBuilder();
  });

  describe('constructor and initialization', () => {
    it('should create a builder with default dimensions', () => {
      const output = builder.render();
      expect(output).toContain('width="800"');
      expect(output).toContain('height="600"');
    });

    it('should include default defs and styles', () => {
      const output = builder.render();
      expect(output).toContain('<defs>');
      expect(output).toContain('arrowhead');
      expect(output).toContain('<style>');
    });
  });

  describe('setDimensions', () => {
    it('should set width and height', () => {
      builder.setDimensions(1024, 768);
      const output = builder.render();
      expect(output).toContain('width="1024"');
      expect(output).toContain('height="768"');
      expect(output).toContain('viewBox="0 0 1024 768"');
    });
  });

  describe('setTitle', () => {
    it('should add a title element', () => {
      builder.setTitle('My Diagram');
      const output = builder.render();
      expect(output).toContain('My Diagram');
      expect(output).toContain('class="title"');
    });
  });

  describe('setBackground', () => {
    it('should set background color', () => {
      builder.setBackground('#ffffff');
      const output = builder.render();
      expect(output).toContain('fill="#ffffff"');
    });
  });

  describe('addRect', () => {
    it('should add a rectangle', () => {
      builder.addRect(10, 20, 100, 50);
      const output = builder.render();
      expect(output).toContain('<rect');
      expect(output).toContain('x="10"');
      expect(output).toContain('y="20"');
      expect(output).toContain('width="100"');
      expect(output).toContain('height="50"');
    });

    it('should support options', () => {
      builder.addRect(0, 0, 100, 50, {
        fill: '#ff0000',
        stroke: '#000000',
        strokeWidth: 2,
        rx: 5,
      });
      const output = builder.render();
      expect(output).toContain('fill="#ff0000"');
      expect(output).toContain('stroke="#000000"');
      expect(output).toContain('stroke-width="2"');
      expect(output).toContain('rx="5"');
    });
  });

  describe('addCircle', () => {
    it('should add a circle', () => {
      builder.addCircle(100, 100, 50);
      const output = builder.render();
      expect(output).toContain('<circle');
      expect(output).toContain('cx="100"');
      expect(output).toContain('cy="100"');
      expect(output).toContain('r="50"');
    });
  });

  describe('addEllipse', () => {
    it('should add an ellipse', () => {
      builder.addEllipse(100, 100, 75, 50);
      const output = builder.render();
      expect(output).toContain('<ellipse');
      expect(output).toContain('rx="75"');
      expect(output).toContain('ry="50"');
    });
  });

  describe('addLine', () => {
    it('should add a line', () => {
      builder.addLine(0, 0, 100, 100, { stroke: '#333' });
      const output = builder.render();
      expect(output).toContain('<line');
      expect(output).toContain('x1="0"');
      expect(output).toContain('y1="0"');
      expect(output).toContain('x2="100"');
      expect(output).toContain('y2="100"');
    });

    it('should support marker-end', () => {
      builder.addLine(0, 0, 100, 100, { markerEnd: 'arrowhead' });
      const output = builder.render();
      expect(output).toContain('marker-end="url(#arrowhead)"');
    });
  });

  describe('addPolyline', () => {
    it('should add a polyline', () => {
      builder.addPolyline([[0, 0], [50, 50], [100, 0]]);
      const output = builder.render();
      expect(output).toContain('<polyline');
      expect(output).toContain('points="0,0 50,50 100,0"');
    });
  });

  describe('addPolygon', () => {
    it('should add a polygon', () => {
      builder.addPolygon([[0, 0], [50, 100], [100, 0]], { fill: '#00ff00' });
      const output = builder.render();
      expect(output).toContain('<polygon');
      expect(output).toContain('fill="#00ff00"');
    });
  });

  describe('addPath', () => {
    it('should add a path', () => {
      builder.addPath('M 0 0 L 100 100', { stroke: '#000', fill: 'none' });
      const output = builder.render();
      expect(output).toContain('<path');
      expect(output).toContain('d="M 0 0 L 100 100"');
    });
  });

  describe('addText', () => {
    it('should add text', () => {
      builder.addText(100, 50, 'Hello World');
      const output = builder.render();
      expect(output).toContain('<text');
      expect(output).toContain('Hello World');
    });

    it('should escape special characters', () => {
      builder.addText(0, 0, '<script>alert("XSS")</script>');
      const output = builder.render();
      expect(output).toContain('&lt;script&gt;');
      expect(output).not.toContain('<script>');
    });

    it('should support text options', () => {
      builder.addText(100, 50, 'Centered', {
        textAnchor: 'middle',
        fontSize: 14,
      });
      const output = builder.render();
      expect(output).toContain('text-anchor="middle"');
      expect(output).toContain('font-size="14"');
    });
  });

  describe('addComment', () => {
    it('should add an SVG comment', () => {
      builder.addComment('This is a comment');
      const output = builder.render();
      expect(output).toContain('<!-- This is a comment -->');
    });
  });

  describe('addDef and addStyle', () => {
    it('should add custom definitions', () => {
      builder.addDef('<linearGradient id="grad1"></linearGradient>');
      const output = builder.render();
      expect(output).toContain('linearGradient');
      expect(output).toContain('grad1');
    });

    it('should add custom styles', () => {
      builder.addStyle('.custom { fill: red; }');
      const output = builder.render();
      expect(output).toContain('.custom { fill: red; }');
    });
  });

  describe('SVGGroupBuilder', () => {
    it('should create groups', () => {
      const group = builder.addGroup('myGroup');
      group
        .addRect(0, 0, 50, 50)
        .addCircle(25, 25, 10);
      const output = builder.render();
      expect(output).toContain('<g id="myGroup">');
      expect(output).toContain('</g>');
    });

    it('should support transform', () => {
      const group = new SVGGroupBuilder('test');
      group.setTransform('translate(100, 100)');
      const output = group.render();
      expect(output).toContain('transform="translate(100, 100)"');
    });
  });

  describe('addRenderedGroup', () => {
    it('should add a pre-rendered group', () => {
      const group = new SVGGroupBuilder('prebuilt');
      group.addRect(0, 0, 100, 100);
      builder.addRenderedGroup(group);
      const output = builder.render();
      expect(output).toContain('id="prebuilt"');
    });
  });

  describe('clear and reset', () => {
    it('should clear all elements', () => {
      builder.addRect(0, 0, 100, 100).clear();
      expect(builder.elementCount).toBe(0);
    });

    it('should reset to defaults', () => {
      builder.setDimensions(1024, 768).setTitle('Test').reset();
      const output = builder.render();
      expect(output).toContain('width="800"');
      expect(output).not.toContain('Test');
    });
  });

  describe('static methods', () => {
    it('should create builder with preset dimensions', () => {
      const b = SVGBuilder.withDimensions(640, 480);
      const output = b.render();
      expect(output).toContain('width="640"');
      expect(output).toContain('height="480"');
    });
  });

  describe('setIncludeDefaultDefs', () => {
    it('should exclude default defs when disabled', () => {
      builder.setIncludeDefaultDefs(false);
      const output = builder.render();
      // Should still have defs section if custom defs added
      expect(output).not.toContain('arrowhead');
    });
  });

  describe('chaining', () => {
    it('should support complex method chaining', () => {
      const output = builder
        .setDimensions(400, 300)
        .setTitle('Complex Diagram')
        .setBackground('#f0f0f0')
        .addRect(10, 10, 100, 50, { fill: '#blue' })
        .addCircle(200, 100, 30, { fill: '#red' })
        .addLine(110, 35, 170, 100, { markerEnd: 'arrowhead' })
        .addText(200, 100, 'Node')
        .render();

      expect(output).toContain('Complex Diagram');
      expect(output).toContain('<rect');
      expect(output).toContain('<circle');
      expect(output).toContain('<line');
      expect(output).toContain('<text');
    });
  });
});

// =============================================================================
// TikZBuilder Tests
// =============================================================================

describe('TikZBuilder', () => {
  let builder: TikZBuilder;

  beforeEach(() => {
    builder = new TikZBuilder();
  });

  describe('constructor and initialization', () => {
    it('should create an empty builder', () => {
      expect(builder.nodeCount).toBe(0);
      expect(builder.edgeCount).toBe(0);
      expect(builder.styleCount).toBe(0);
    });
  });

  describe('setStandalone', () => {
    it('should create standalone document when enabled', () => {
      builder.setStandalone(true);
      const output = builder.render();
      expect(output).toContain('\\documentclass');
      expect(output).toContain('\\begin{document}');
      expect(output).toContain('\\end{document}');
    });

    it('should create only tikzpicture when disabled', () => {
      builder.setStandalone(false);
      const output = builder.render();
      expect(output).not.toContain('\\documentclass');
      expect(output).toContain('\\begin{tikzpicture}');
      expect(output).toContain('\\end{tikzpicture}');
    });
  });

  describe('setTitle', () => {
    it('should add a title', () => {
      builder.setTitle('My Diagram');
      const output = builder.render();
      expect(output).toContain('My Diagram');
      expect(output).toContain('\\node[font=\\large\\bfseries]');
    });
  });

  describe('setScale', () => {
    it('should set the scale', () => {
      builder.setScale(0.5);
      const output = builder.render();
      expect(output).toContain('scale=0.5');
    });
  });

  describe('addNode', () => {
    it('should add a node with absolute position', () => {
      builder.addNode('a', 'Node A', { position: { x: 0, y: 0 } });
      expect(builder.nodeCount).toBe(1);
      const output = builder.render();
      expect(output).toContain('(a)');
      expect(output).toContain('Node A');
    });

    it('should add a node with relative position', () => {
      builder.addNode('a', 'Node A', { position: { x: 0, y: 0 } });
      builder.addNode('b', 'Node B', {
        relativePosition: { direction: 'right', of: 'a' },
      });
      expect(builder.nodeCount).toBe(2);
      const output = builder.render();
      expect(output).toContain('right=');
      expect(output).toContain('of a');
    });

    it('should support different node shapes', () => {
      builder.addNode('c', 'Circle', {
        shape: 'circle',
        position: { x: 0, y: 0 },
      });
      const output = builder.render();
      expect(output).toContain('circle node');
    });
  });

  describe('addNodes', () => {
    it('should add multiple nodes at once', () => {
      builder.addNodes([
        { id: 'a', label: 'A', options: { position: { x: 0, y: 0 } } },
        { id: 'b', label: 'B', options: { position: { x: 3, y: 0 } } },
      ]);
      expect(builder.nodeCount).toBe(2);
    });
  });

  describe('addEdge', () => {
    it('should add an edge', () => {
      builder.addEdge('a', 'b');
      expect(builder.edgeCount).toBe(1);
      const output = builder.render();
      expect(output).toContain('(a)');
      expect(output).toContain('(b)');
    });

    it('should add an edge with label', () => {
      builder.addEdge('a', 'b', { label: 'connects' });
      const output = builder.render();
      expect(output).toContain('connects');
    });

    it('should support different edge styles', () => {
      builder.addEdge('a', 'b', { style: 'dashed' });
      const output = builder.render();
      expect(output).toContain('dashed');
    });

    it('should support bend option', () => {
      builder.addEdge('a', 'b', { bend: 'left' });
      const output = builder.render();
      expect(output).toContain('bend left');
    });
  });

  describe('addEdges', () => {
    it('should add multiple edges at once', () => {
      builder.addEdges([
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
      ]);
      expect(builder.edgeCount).toBe(2);
    });
  });

  describe('addStyle', () => {
    it('should add a custom style', () => {
      builder.addStyle('highlight', 'fill=yellow, draw=red, thick');
      expect(builder.styleCount).toBe(1);
      const output = builder.render();
      expect(output).toContain('highlight/.style');
      expect(output).toContain('fill=yellow');
    });
  });

  describe('beginScope and endScope', () => {
    it('should add scope blocks', () => {
      builder
        .beginScope({ xshift: '2cm' })
        .addRaw('  \\node at (0,0) {Inside};')
        .endScope();
      const output = builder.render();
      expect(output).toContain('\\begin{scope}[xshift=2cm]');
      expect(output).toContain('\\end{scope}');
    });

    it('should support multiple scope options', () => {
      builder.beginScope({ xshift: '1cm', yshift: '2cm', scale: 0.5 });
      builder.endScope();
      const output = builder.render();
      expect(output).toContain('xshift=1cm');
      expect(output).toContain('yshift=2cm');
      expect(output).toContain('scale=0.5');
    });
  });

  describe('addCoordinate', () => {
    it('should add a coordinate', () => {
      builder.addCoordinate('origin', 0, 0);
      const output = builder.render();
      expect(output).toContain('\\coordinate (origin) at (0, 0);');
    });
  });

  describe('addBackground', () => {
    it('should add a background rectangle', () => {
      builder.addBackground(-1, -1, 5, 5, 'blue!10');
      const output = builder.render();
      expect(output).toContain('\\fill[blue!10]');
      expect(output).toContain('rectangle');
    });
  });

  describe('addMetrics', () => {
    it('should add a metrics panel', () => {
      builder.addMetrics(8, 0, [
        { label: 'Count', value: 42 },
      ]);
      const output = builder.render();
      expect(output).toContain('Count');
      expect(output).toContain('42');
    });
  });

  describe('addLegend', () => {
    it('should add a legend', () => {
      builder.addLegend(8, -2, [
        { label: 'Primary', color: { fill: 'blue!20', stroke: 'blue!60' } },
      ]);
      const output = builder.render();
      expect(output).toContain('Primary');
      expect(output).toContain('blue!20');
    });
  });

  describe('addComment', () => {
    it('should add a LaTeX comment', () => {
      builder.addComment('This is a comment');
      const output = builder.render();
      expect(output).toContain('% This is a comment');
    });
  });

  describe('addRaw', () => {
    it('should add raw TikZ content', () => {
      builder.addRaw('  \\draw[thick] (0,0) -- (1,1);');
      const output = builder.render();
      expect(output).toContain('\\draw[thick] (0,0) -- (1,1);');
    });
  });

  describe('clear and resetOptions', () => {
    it('should clear all content', () => {
      builder
        .addNode('a', 'A', { position: { x: 0, y: 0 } })
        .addEdge('a', 'b')
        .addStyle('custom', 'fill=red')
        .clear();
      expect(builder.nodeCount).toBe(0);
      expect(builder.edgeCount).toBe(0);
      expect(builder.styleCount).toBe(0);
    });

    it('should reset options', () => {
      builder.setStandalone(true).setScale(2).resetOptions();
      const output = builder.render();
      expect(output).not.toContain('\\documentclass');
      expect(output).not.toContain('scale=2');
    });
  });

  describe('static methods', () => {
    it('should create builder with options', () => {
      const b = TikZBuilder.withOptions({ colorScheme: 'pastel' });
      b.addNode('a', 'A', { position: { x: 0, y: 0 } });
      const output = b.render();
      // Pastel colors should be applied
      expect(output).toContain('(a)');
    });

    it('should create standalone builder', () => {
      const b = TikZBuilder.standalone();
      const output = b.render();
      expect(output).toContain('\\documentclass');
    });
  });

  describe('escapeLatex', () => {
    it('should escape special LaTeX characters', () => {
      expect(escapeLatex('$100')).toContain('\\$');
      expect(escapeLatex('100%')).toContain('\\%');
      expect(escapeLatex('A & B')).toContain('\\&');
      expect(escapeLatex('item #1')).toContain('\\#');
      expect(escapeLatex('under_score')).toContain('\\_');
    });
  });

  describe('chaining', () => {
    it('should support complex method chaining', () => {
      const output = builder
        .setStandalone(true)
        .setTitle('Graph')
        .setColorScheme('pastel')
        .addStyle('important', 'fill=red!30, draw=red, thick')
        .addNode('a', 'Start', { position: { x: 0, y: 0 }, type: 'primary' })
        .addNode('b', 'End', { relativePosition: { direction: 'right', of: 'a' }, type: 'success' })
        .addEdge('a', 'b', { label: 'flow' })
        .render();

      expect(output).toContain('\\documentclass');
      expect(output).toContain('Graph');
      expect(output).toContain('Start');
      expect(output).toContain('End');
      expect(output).toContain('flow');
      expect(output).toContain('important/.style');
    });
  });
});

// =============================================================================
// Integration Tests
// =============================================================================

describe('Visual Builders Integration', () => {
  describe('ASCIIDocBuilder complex document', () => {
    it('should create a complete document', () => {
      const doc = new ASCIIDocBuilder()
        .addBoxedTitle('Project Report', 'double')
        .addEmptyLine()
        .addSection('Summary', '📋')
        .addBulletList(['Task 1 complete', 'Task 2 in progress', 'Task 3 pending'])
        .addEmptyLine()
        .addSection('Metrics')
        .addTable(['Metric', 'Value'], [['Coverage', '85%'], ['Tests', '150']])
        .addEmptyLine()
        .addSection('Progress')
        .addProgressBar(85)
        .render();

      expect(doc.length).toBeGreaterThan(100);
      expect(doc).toContain('Project Report');
      expect(doc).toContain('Summary');
      expect(doc).toContain('Metrics');
      expect(doc).toContain('Coverage');
    });
  });

  describe('SVGBuilder complex diagram', () => {
    it('should create a complete diagram', () => {
      const svg = new SVGBuilder()
        .setDimensions(600, 400)
        .setTitle('System Architecture')
        .setBackground('#f5f5f5')
        .addRect(50, 100, 120, 60, { fill: '#64b5f6', stroke: '#1976d2', rx: 8 })
        .addText(110, 135, 'Client', { textAnchor: 'middle' })
        .addRect(250, 100, 120, 60, { fill: '#81c784', stroke: '#388e3c', rx: 8 })
        .addText(310, 135, 'Server', { textAnchor: 'middle' })
        .addRect(450, 100, 120, 60, { fill: '#ffb74d', stroke: '#f57c00', rx: 8 })
        .addText(510, 135, 'Database', { textAnchor: 'middle' })
        .addLine(170, 130, 250, 130, { stroke: '#333', markerEnd: 'arrowhead' })
        .addLine(370, 130, 450, 130, { stroke: '#333', markerEnd: 'arrowhead' })
        .render();

      expect(svg).toContain('<?xml version="1.0"');
      expect(svg).toContain('<svg');
      expect(svg).toContain('System Architecture');
      expect(svg).toContain('Client');
      expect(svg).toContain('Server');
      expect(svg).toContain('Database');
    });
  });

  describe('TikZBuilder complete diagram', () => {
    it('should create a complete TikZ diagram', () => {
      const tikz = TikZBuilder.standalone()
        .setTitle('State Machine')
        .setColorScheme('default')
        .addNode('s0', 'Initial', { position: { x: 0, y: 0 }, type: 'primary', shape: 'circle' })
        .addNode('s1', 'Processing', { position: { x: 3, y: 0 }, type: 'secondary' })
        .addNode('s2', 'Complete', { position: { x: 6, y: 0 }, type: 'success', shape: 'circle' })
        .addEdge('s0', 's1', { label: 'start' })
        .addEdge('s1', 's2', { label: 'finish' })
        .addEdge('s1', 's1', { label: 'retry', bend: 'left' })
        .render();

      expect(tikz).toContain('\\documentclass');
      expect(tikz).toContain('\\begin{tikzpicture}');
      expect(tikz).toContain('State Machine');
      expect(tikz).toContain('Initial');
      expect(tikz).toContain('Processing');
      expect(tikz).toContain('Complete');
      expect(tikz).toContain('\\end{document}');
    });
  });
});
