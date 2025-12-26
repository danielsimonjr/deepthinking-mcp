/**
 * Integration Tests for Visual Export Builders (Phase 13 Sprint 4)
 *
 * These tests demonstrate real-world usage patterns for the fluent builder APIs,
 * showing how they can be used to refactor existing visual exporter code.
 */

import { describe, it, expect } from 'vitest';
import {
  // Graph builders
  DOTGraphBuilder,
  MermaidGraphBuilder,
  GraphMLBuilder,
} from '../../../../src/export/visual/utils/index.js';
import {
  // Visual format builders
  ASCIIDocBuilder,
} from '../../../../src/export/visual/utils/ascii.js';
import {
  SVGBuilder,
  SVGGroupBuilder,
} from '../../../../src/export/visual/utils/svg.js';
import {
  TikZBuilder,
} from '../../../../src/export/visual/utils/tikz.js';
import {
  // Document builders
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

describe('Builder Integration Tests', () => {
  // ============================================================================
  // DOTGraphBuilder Integration
  // ============================================================================
  describe('DOTGraphBuilder - Real-world usage patterns', () => {
    it('should build a sequential reasoning flow diagram', () => {
      const thoughts = [
        { id: 'step1', content: 'Identify problem' },
        { id: 'step2', content: 'Analyze causes' },
        { id: 'step3', content: 'Propose solution' },
        { id: 'step4', content: 'Evaluate outcome' },
      ];

      const builder = new DOTGraphBuilder()
        .setGraphName('SequentialReasoning')
        .setRankDir('LR');

      // Add nodes for each thought
      thoughts.forEach((thought, index) => {
        builder.addNode({
          id: thought.id,
          label: thought.content,
          shape: index === 0 ? 'ellipse' : index === thoughts.length - 1 ? 'doubleoctagon' : 'box',
          color: index === 0 ? 'lightblue' : index === thoughts.length - 1 ? 'lightgreen' : 'white',
        });
      });

      // Add edges between consecutive thoughts
      for (let i = 0; i < thoughts.length - 1; i++) {
        builder.addEdge({
          source: thoughts[i].id,
          target: thoughts[i + 1].id,
          label: `step ${i + 1}`,
        });
      }

      const result = builder.render();

      expect(result).toContain('digraph SequentialReasoning');
      expect(result).toContain('rankdir=LR');
      expect(result).toContain('step1');
      expect(result).toContain('step4');
      expect(result).toContain('->');
    });

    it('should build a causal network with subgraphs', () => {
      const builder = new DOTGraphBuilder()
        .setGraphName('CausalNetwork')
        .setRankDir('TB')
        .addSubgraph({
          id: 'causes',
          label: 'Root Causes',
          nodes: ['cause1', 'cause2'],
          style: { fillcolor: 'lightpink' },
        })
        .addSubgraph({
          id: 'effects',
          label: 'Effects',
          nodes: ['effect1', 'effect2'],
          style: { fillcolor: 'lightblue' },
        })
        .addNode({ id: 'cause1', label: 'Root Cause 1' })
        .addNode({ id: 'cause2', label: 'Root Cause 2' })
        .addNode({ id: 'effect1', label: 'Effect 1' })
        .addNode({ id: 'effect2', label: 'Effect 2' })
        .addEdge({ source: 'cause1', target: 'effect1', label: 'leads to' })
        .addEdge({ source: 'cause2', target: 'effect2', label: 'causes' });

      const result = builder.render();

      expect(result).toContain('cluster_causes');
      expect(result).toContain('cluster_effects');
      expect(result).toContain('Root Causes');
      expect(result).toContain('Effects');
    });
  });

  // ============================================================================
  // MermaidGraphBuilder Integration
  // ============================================================================
  describe('MermaidGraphBuilder - Real-world usage patterns', () => {
    it('should build a Bayesian reasoning flow', () => {
      const builder = new MermaidGraphBuilder()
        .setDirection('TD')
        .addNode({ id: 'prior', label: 'Prior P(H) = 0.3', shape: 'stadium' })
        .addNode({ id: 'evidence', label: 'Evidence E', shape: 'rectangle' })
        .addNode({ id: 'likelihood', label: 'P(E|H) = 0.8', shape: 'rectangle' })
        .addNode({ id: 'posterior', label: 'Posterior P(H|E) = 0.63', shape: 'stadium' })
        .addEdge({ source: 'prior', target: 'posterior', style: 'arrow' })
        .addEdge({ source: 'evidence', target: 'likelihood', style: 'arrow' })
        .addEdge({ source: 'likelihood', target: 'posterior', style: 'arrow' });

      const result = builder.render();

      expect(result).toContain('graph TD');
      expect(result).toContain('prior');
      expect(result).toContain('posterior');
      expect(result).toContain('-->');
    });

    it('should build a workflow with subgraphs', () => {
      const builder = new MermaidGraphBuilder()
        .setDirection('LR')
        .addSubgraph('input', 'Input Processing', ['read', 'validate'])
        .addSubgraph('output', 'Output Generation', ['transform', 'write'])
        .addNode({ id: 'read', label: 'Read Data', shape: 'rectangle' })
        .addNode({ id: 'validate', label: 'Validate', shape: 'diamond' })
        .addNode({ id: 'transform', label: 'Transform', shape: 'rectangle' })
        .addNode({ id: 'write', label: 'Write Output', shape: 'stadium' })
        .addEdge({ source: 'read', target: 'validate', style: 'arrow' })
        .addEdge({ source: 'validate', target: 'transform', style: 'arrow' })
        .addEdge({ source: 'transform', target: 'write', style: 'arrow' });

      const result = builder.render();

      expect(result).toContain('subgraph input');
      expect(result).toContain('subgraph output');
      expect(result).toContain('Input Processing');
    });
  });

  // ============================================================================
  // GraphMLBuilder Integration
  // ============================================================================
  describe('GraphMLBuilder - Real-world usage patterns', () => {
    it('should build a dependency graph for analysis mode', () => {
      const builder = new GraphMLBuilder()
        .addNode('hypothesis', 'Main Hypothesis')
        .addNode('evidence1', 'Evidence 1')
        .addNode('evidence2', 'Evidence 2')
        .addEdge('evidence1', 'hypothesis', { label: 'supports' })
        .addEdge('evidence2', 'hypothesis', { label: 'supports' });

      const result = builder.render();

      expect(result).toContain('<?xml version="1.0"');
      expect(result).toContain('<graphml');
      expect(result).toContain('hypothesis');
      expect(result).toContain('evidence1');
      expect(result).toContain('evidence2');
      expect(result).toContain('supports');
    });
  });

  // ============================================================================
  // ASCIIDocBuilder Integration
  // ============================================================================
  describe('ASCIIDocBuilder - Real-world usage patterns', () => {
    it('should build a reasoning summary document', () => {
      const builder = new ASCIIDocBuilder()
        .addHeader('Reasoning Analysis Report')
        .addSection('Summary')
        .addText('This document summarizes the reasoning process and conclusions.')
        .addSection('Key Findings')
        .addBulletList([
          'Finding 1: Primary cause identified',
          'Finding 2: Secondary effects observed',
          'Finding 3: Mitigation strategy proposed',
        ]);

      const result = builder.render();

      expect(result).toContain('Reasoning Analysis Report');
      expect(result).toContain('Summary');
      expect(result).toContain('Key Findings');
      expect(result).toContain('Finding 1');
    });
  });

  // ============================================================================
  // SVGBuilder Integration
  // ============================================================================
  describe('SVGBuilder - Real-world usage patterns', () => {
    it('should build a visual reasoning diagram', () => {
      const builder = new SVGBuilder()
        .setDimensions(800, 400)
        .setTitle('Reasoning Flow')
        .addStyle('.node { fill: #e0e0e0; stroke: #333; stroke-width: 2; }')
        .addRect(50, 100, 120, 60, { class: 'node', rx: 10 })
        .addText(110, 135, 'Start', { textAnchor: 'middle' })
        .addRect(250, 100, 120, 60, { rx: 10 })
        .addText(310, 135, 'Process', { textAnchor: 'middle' })
        .addRect(450, 100, 120, 60, { rx: 10 })
        .addText(510, 135, 'End', { textAnchor: 'middle' })
        .addLine(170, 130, 250, 130)
        .addLine(370, 130, 450, 130);

      const result = builder.render();

      expect(result).toContain('<svg');
      expect(result).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(result).toContain('<rect');
      expect(result).toContain('<text');
      expect(result).toContain('<line');
      expect(result).toContain('</svg>');
    });

    it('should build SVG with groups using SVGGroupBuilder', () => {
      const nodeGroup = new SVGGroupBuilder('nodes')
        .setClassName('node-group')
        .addRect(10, 10, 80, 40, { fill: 'lightblue' })
        .addText(50, 35, 'Node 1', { textAnchor: 'middle' })
        .render();

      const svgBuilder = new SVGBuilder()
        .setDimensions(200, 100)
        .addRaw(nodeGroup);

      const result = svgBuilder.render();

      expect(result).toContain('<g id="nodes"');
      expect(result).toContain('class="node-group"');
    });
  });

  // ============================================================================
  // TikZBuilder Integration
  // ============================================================================
  describe('TikZBuilder - Real-world usage patterns', () => {
    it('should build a LaTeX-compatible reasoning diagram', () => {
      const builder = new TikZBuilder()
        .setStandalone(false)
        .setScale(0.9)
        .setColorScheme('default')
        .addNode('premise', 'Premise', { position: { x: 0, y: 0 }, type: 'primary' })
        .addNode('inference', 'Inference', {
          relativePosition: { direction: 'right', of: 'premise', distance: '3cm' },
          type: 'secondary',
        })
        .addNode('conclusion', 'Conclusion', {
          relativePosition: { direction: 'right', of: 'inference', distance: '3cm' },
          type: 'success',
        })
        .addEdge('premise', 'inference', { label: 'supports' })
        .addEdge('inference', 'conclusion', { label: 'leads to' });

      const result = builder.render();

      expect(result).toContain('\\begin{tikzpicture}');
      expect(result).toContain('\\end{tikzpicture}');
      expect(result).toContain('premise');
      expect(result).toContain('conclusion');
      expect(result).not.toContain('\\documentclass'); // Not standalone
    });

    it('should build a standalone TikZ document', () => {
      const builder = TikZBuilder.standalone()
        .setTitle('Analysis Diagram')
        .addNode('root', 'Root', { position: { x: 4, y: 0 } })
        .addNode('child1', 'Child 1', { position: { x: 2, y: -2 } })
        .addNode('child2', 'Child 2', { position: { x: 6, y: -2 } })
        .addEdge('root', 'child1')
        .addEdge('root', 'child2');

      const result = builder.render();

      expect(result).toContain('\\documentclass[tikz,border=10pt]{standalone}');
      expect(result).toContain('\\begin{document}');
      expect(result).toContain('\\end{document}');
    });
  });

  // ============================================================================
  // UMLBuilder Integration
  // ============================================================================
  describe('UMLBuilder - Real-world usage patterns', () => {
    it('should build a reasoning architecture class diagram', () => {
      const builder = new UMLBuilder()
        .setTitle('Reasoning Mode Architecture')
        .setDirection('top to bottom')
        .addClass({
          name: 'ModeHandler',
          members: ['-mode: ThinkingMode', '-registry: ModeHandlerRegistry'],
          methods: ['+createThought(input): Thought', '+validate(input): boolean'],
          abstract: true,
        })
        .addClass({
          name: 'SequentialHandler',
          methods: ['+createThought(input): SequentialThought'],
        })
        .addClass({
          name: 'BayesianHandler',
          methods: ['+createThought(input): BayesianThought', '+computePosterior(): number'],
        })
        .addRelation({ from: 'SequentialHandler', to: 'ModeHandler', type: 'inheritance' })
        .addRelation({ from: 'BayesianHandler', to: 'ModeHandler', type: 'inheritance' });

      const result = builder.render();

      expect(result).toContain('@startuml');
      expect(result).toContain('@enduml');
      expect(result).toContain('abstract class');
      expect(result).toContain('ModeHandler');
      expect(result).toContain('--|>');
    });
  });

  // ============================================================================
  // HTMLDocBuilder Integration
  // ============================================================================
  describe('HTMLDocBuilder - Real-world usage patterns', () => {
    it('should build an analysis report HTML document', () => {
      const builder = new HTMLDocBuilder()
        .setTitle('Reasoning Analysis Report')
        .setTheme('light')
        .addHeading(1, 'Analysis Results')
        .addParagraph('This report summarizes the reasoning analysis performed.')
        .beginMetricsGrid()
        .addMetricCard('Confidence', '0.85', 'primary')
        .addMetricCard('Coverage', '0.72', 'info')
        .addMetricCard('Steps', '12', 'success')
        .endMetricsGrid()
        .addHeading(2, 'Detailed Findings')
        .addTable(
          ['Finding', 'Impact', 'Priority'],
          [
            ['Root cause identified', 'High', 'P1'],
            ['Side effect detected', 'Medium', 'P2'],
          ]
        )
        .addProgressBar(85, 'success');

      const result = builder.render();

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<title>Reasoning Analysis Report</title>');
      expect(result).toContain('class="metrics-grid"');
      expect(result).toContain('metric-card');
      expect(result).toContain('progress-bar');
    });
  });

  // ============================================================================
  // MarkdownBuilder Integration
  // ============================================================================
  describe('MarkdownBuilder - Real-world usage patterns', () => {
    it('should build a reasoning session summary', () => {
      const builder = new MarkdownBuilder()
        .setTitle('Reasoning Session Summary')
        .enableFrontmatter({ author: 'DeepThinking MCP', version: '8.5.0' })
        .addHeading(2, 'Overview')
        .addParagraph('This session analyzed the root cause of the system failure.')
        .addHeading(2, 'Key Insights')
        .addBulletList([
          'Primary cause: Memory leak in worker process',
          'Secondary factor: Inadequate error handling',
          'Recommendation: Implement circuit breaker pattern',
        ])
        .addHeading(2, 'Metrics')
        .addTable(
          ['Metric', 'Value'],
          [
            ['Thoughts', '15'],
            ['Branches', '3'],
            ['Confidence', '0.87'],
          ]
        )
        .addHeading(2, 'Progress')
        .addProgressBar(87);

      const result = builder.render();

      expect(result).toContain('---');
      expect(result).toContain('title: "Reasoning Session Summary"');
      expect(result).toContain('author: "DeepThinking MCP"');
      expect(result).toContain('## Overview');
      expect(result).toContain('- Primary cause');
      expect(result).toContain('| Metric | Value |');
      expect(result).toContain('87%');
    });
  });

  // ============================================================================
  // ModelicaBuilder Integration
  // ============================================================================
  describe('ModelicaBuilder - Real-world usage patterns', () => {
    it('should build a system dynamics model', () => {
      const builder = new ModelicaBuilder()
        .setOptions({ includeAnnotations: true, version: '8.5.0' })
        .beginPackage('ReasoningDynamics', 'System dynamics model for reasoning analysis')
        .beginModel('ConfidenceFlow', 'Models confidence propagation through reasoning steps')
        .addParameter({
          name: 'initialConfidence',
          type: 'Real',
          value: 0.5,
          description: 'Initial confidence level',
        })
        .addParameter({
          name: 'evidenceWeight',
          type: 'Real',
          value: 0.1,
          description: 'Weight of each piece of evidence',
        })
        .addVariable({
          name: 'confidence',
          type: 'Real',
          start: 0.5,
          description: 'Current confidence level',
        })
        .addEquation({ equation: 'der(confidence) = evidenceWeight * (1 - confidence)' })
        .endModel()
        .endPackage();

      const result = builder.render();

      expect(result).toContain('package ReasoningDynamics');
      expect(result).toContain('model ConfidenceFlow');
      expect(result).toContain('parameter Real initialConfidence');
      expect(result).toContain('der(confidence)');
      expect(result).toContain('end ConfidenceFlow');
      expect(result).toContain('end ReasoningDynamics');
    });
  });

  // ============================================================================
  // JSONExportBuilder Integration
  // ============================================================================
  describe('JSONExportBuilder - Real-world usage patterns', () => {
    it('should build a complete reasoning session export', () => {
      const builder = new JSONExportBuilder()
        .setMetadata({
          title: 'Reasoning Session Export',
          mode: 'bayesian',
          version: '1.0.0',
        })
        .addSection('summary', {
          totalThoughts: 15,
          branches: 3,
          confidence: 0.87,
        })
        .addGraph(
          [
            { id: 'prior', label: 'Prior', type: 'input' },
            { id: 'evidence', label: 'Evidence', type: 'data' },
            { id: 'posterior', label: 'Posterior', type: 'output' },
          ],
          [
            { id: 'e1', source: 'prior', target: 'posterior', directed: true },
            { id: 'e2', source: 'evidence', target: 'posterior', directed: true },
          ]
        )
        .addMetrics({
          prior: 0.3,
          posterior: 0.87,
          bayesFactor: 3.2,
        })
        .addLegend([
          { label: 'Input', color: '#a8d5ff' },
          { label: 'Data', color: '#81c784' },
          { label: 'Output', color: '#4caf50' },
        ])
        .setFormatting({ prettyPrint: true, indent: 2 });

      const result = builder.render();
      const parsed = JSON.parse(result);

      expect(parsed.metadata.title).toBe('Reasoning Session Export');
      expect(parsed.metadata.mode).toBe('bayesian');
      expect(parsed.summary.totalThoughts).toBe(15);
      expect(parsed.nodes).toHaveLength(3);
      expect(parsed.edges).toHaveLength(2);
      expect(parsed.metrics.bayesFactor).toBe(3.2);
      expect(parsed.legend).toHaveLength(3);
    });

    it('should support nested path setting', () => {
      const builder = new JSONExportBuilder()
        .setPath('config.display.theme', 'dark')
        .setPath('config.display.showMetrics', true)
        .setPath('config.export.format', 'json');

      const result = builder.render();
      const parsed = JSON.parse(result);

      expect(parsed.config.display.theme).toBe('dark');
      expect(parsed.config.display.showMetrics).toBe(true);
      expect(parsed.config.export.format).toBe('json');
    });
  });

  // ============================================================================
  // Builder Chaining and Composition Patterns
  // ============================================================================
  describe('Builder composition patterns', () => {
    it('should demonstrate builder reuse with clear()', () => {
      const builder = new DOTGraphBuilder()
        .setGraphName('Graph1')
        .addNode({ id: 'a', label: 'Node A' });

      const result1 = builder.render();
      expect(result1).toContain('Graph1');

      builder.clear();
      builder.setGraphName('Graph2').addNode({ id: 'b', label: 'Node B' });

      const result2 = builder.render();
      expect(result2).toContain('Graph2');
      expect(result2).not.toContain('Graph1');
      expect(result2).not.toContain('Node A');
    });

    it('should demonstrate builder reset with separate instances', () => {
      const config = { direction: 'LR' as const };

      const builder1 = new MermaidGraphBuilder()
        .setDirection(config.direction)
        .addNode({ id: 'a', label: 'Start' });

      const builder2 = new MermaidGraphBuilder()
        .setDirection(config.direction)
        .addNode({ id: 'z', label: 'End' });

      expect(builder1.render()).toContain('Start');
      expect(builder2.render()).toContain('End');
      expect(builder1.render()).not.toContain('End');
    });
  });
});
