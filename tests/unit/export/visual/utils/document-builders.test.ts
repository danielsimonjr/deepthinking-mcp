/**
 * Unit tests for Document Builder classes (Phase 13 Sprint 3)
 * Tests UMLBuilder, HTMLDocBuilder, MarkdownBuilder, ModelicaBuilder, and JSONExportBuilder fluent APIs
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  UMLBuilder,
  UMLClassDef,
  UMLInterfaceDef,
  UMLRelationDef,
  UMLNoteDef,
} from '../../../../../src/export/visual/utils/uml.js';
import {
  HTMLDocBuilder,
  HTMLDocBuilderOptions,
} from '../../../../../src/export/visual/utils/html.js';
import {
  MarkdownBuilder,
  MarkdownBuilderOptions,
} from '../../../../../src/export/visual/utils/markdown.js';
import {
  ModelicaBuilder,
  ModelicaParameterDef,
  ModelicaVariableDef,
  ModelicaEquationDef,
  ModelicaConnectionDef,
} from '../../../../../src/export/visual/utils/modelica.js';
import {
  JSONExportBuilder,
  JSONSectionDef,
  JSONExportBuilderOptions,
} from '../../../../../src/export/visual/utils/json.js';

// =============================================================================
// UMLBuilder Tests
// =============================================================================

describe('UMLBuilder', () => {
  let builder: UMLBuilder;

  beforeEach(() => {
    builder = new UMLBuilder();
  });

  describe('constructor and initialization', () => {
    it('should create an empty builder', () => {
      const result = builder.render();
      expect(result).toContain('@startuml');
      expect(result).toContain('@enduml');
    });
  });

  describe('setTitle', () => {
    it('should set the diagram title', () => {
      builder.setTitle('My Diagram');
      const result = builder.render();
      expect(result).toContain('title My Diagram');
    });

    it('should return this for chaining', () => {
      const result = builder.setTitle('Test');
      expect(result).toBe(builder);
    });
  });

  describe('setTheme', () => {
    it('should set a non-default theme', () => {
      builder.setTheme('sketchy');
      const result = builder.render();
      expect(result).toContain('!theme sketchy');
    });

    it('should not include theme line for default theme', () => {
      builder.setTheme('default');
      const result = builder.render();
      expect(result).not.toContain('!theme');
    });
  });

  describe('setDirection', () => {
    it('should set left to right direction', () => {
      builder.setDirection('left to right');
      const result = builder.render();
      expect(result).toContain('left to right direction');
    });

    it('should set top to bottom direction', () => {
      builder.setDirection('top to bottom');
      const result = builder.render();
      expect(result).toContain('top to bottom direction');
    });
  });

  describe('setScale', () => {
    it('should set the scale', () => {
      builder.setScale(1.5);
      const result = builder.render();
      expect(result).toContain('scale 1.5');
    });
  });

  describe('addSkinparam', () => {
    it('should add skinparam settings', () => {
      builder.addSkinparam('backgroundColor', 'white');
      const result = builder.render();
      expect(result).toContain('skinparam backgroundColor white');
    });
  });

  describe('addClass', () => {
    it('should add a class', () => {
      builder.addClass({ name: 'MyClass' });
      const result = builder.render();
      expect(result).toContain('class "MyClass"');
      expect(result).toContain('{');
      expect(result).toContain('}');
    });

    it('should add a class with members and methods', () => {
      builder.addClass({
        name: 'Person',
        members: ['+name: string', '-age: number'],
        methods: ['+getName(): string', '+setAge(age: number): void'],
      });
      const result = builder.render();
      expect(result).toContain('+name: string');
      expect(result).toContain('-age: number');
      expect(result).toContain('+getName(): string');
      expect(result).toContain('--'); // Divider between members and methods
    });

    it('should add an abstract class', () => {
      builder.addClass({ name: 'AbstractEntity', abstract: true });
      const result = builder.render();
      expect(result).toContain('abstract class "AbstractEntity"');
    });

    it('should add a class with stereotype', () => {
      builder.addClass({ name: 'UserService', stereotype: 'service' });
      const result = builder.render();
      expect(result).toContain('<<service>>');
    });

    it('should return this for chaining', () => {
      const result = builder.addClass({ name: 'Test' });
      expect(result).toBe(builder);
    });
  });

  describe('addClasses', () => {
    it('should add multiple classes at once', () => {
      builder.addClasses([
        { name: 'ClassA' },
        { name: 'ClassB' },
        { name: 'ClassC' },
      ]);
      const result = builder.render();
      expect(result).toContain('class "ClassA"');
      expect(result).toContain('class "ClassB"');
      expect(result).toContain('class "ClassC"');
    });
  });

  describe('addInterface', () => {
    it('should add an interface', () => {
      builder.addInterface({ name: 'IRepository', methods: ['+find(): void'] });
      const result = builder.render();
      expect(result).toContain('interface "IRepository"');
      expect(result).toContain('+find(): void');
    });
  });

  describe('addRelation', () => {
    it('should add an inheritance relation', () => {
      builder.addRelation({ from: 'Dog', to: 'Animal', type: 'inheritance' });
      const result = builder.render();
      expect(result).toContain('Dog --|> Animal');
    });

    it('should add an implementation relation', () => {
      builder.addRelation({ from: 'UserRepo', to: 'IRepository', type: 'implementation' });
      const result = builder.render();
      expect(result).toContain('UserRepo ..|> IRepository');
    });

    it('should add a composition relation', () => {
      builder.addRelation({ from: 'Car', to: 'Engine', type: 'composition' });
      const result = builder.render();
      expect(result).toContain('Car *-- Engine');
    });

    it('should add a relation with label', () => {
      builder.addRelation({ from: 'A', to: 'B', type: 'dependency', label: 'uses' });
      const result = builder.render();
      expect(result).toContain('A ..> B : uses');
    });
  });

  describe('addNote', () => {
    it('should add a floating note', () => {
      builder.addNote({ text: 'Important note' });
      const result = builder.render();
      expect(result).toContain('note "Important note"');
    });

    it('should add a note attached to a class', () => {
      builder.addClass({ name: 'MyClass' });
      builder.addNote({ text: 'Class note', attachTo: 'MyClass', position: 'right' });
      const result = builder.render();
      expect(result).toContain('note right of MyClass: Class note');
    });
  });

  describe('beginPackage and endPackage', () => {
    it('should create a package block', () => {
      builder.beginPackage('com.example').endPackage();
      const result = builder.render();
      expect(result).toContain('package "com.example"');
      expect(result).toContain('{');
      expect(result).toContain('}');
    });
  });

  describe('addRaw', () => {
    it('should add raw PlantUML content', () => {
      builder.addRaw('hide empty members');
      const result = builder.render();
      expect(result).toContain('hide empty members');
    });

    it('should accept an array of lines', () => {
      builder.addRaw(['line1', 'line2']);
      const result = builder.render();
      expect(result).toContain('line1');
      expect(result).toContain('line2');
    });
  });

  describe('reset', () => {
    it('should reset the builder state', () => {
      builder
        .setTitle('Test')
        .addClass({ name: 'MyClass' })
        .reset();
      const result = builder.render();
      expect(result).not.toContain('Test');
      expect(result).not.toContain('MyClass');
    });
  });

  describe('complete diagram', () => {
    it('should generate a complete class diagram', () => {
      const result = builder
        .setTitle('Class Diagram')
        .setDirection('top to bottom')
        .addClass({ name: 'Animal', members: ['+name: string'], methods: ['+speak(): void'] })
        .addClass({ name: 'Dog', methods: ['+bark(): void'] })
        .addRelation({ from: 'Dog', to: 'Animal', type: 'inheritance' })
        .render();

      expect(result).toContain('@startuml');
      expect(result).toContain('title Class Diagram');
      expect(result).toContain('top to bottom direction');
      expect(result).toContain('class "Animal"');
      expect(result).toContain('class "Dog"');
      expect(result).toContain('Dog --|> Animal');
      expect(result).toContain('@enduml');
    });
  });
});

// =============================================================================
// HTMLDocBuilder Tests
// =============================================================================

describe('HTMLDocBuilder', () => {
  let builder: HTMLDocBuilder;

  beforeEach(() => {
    builder = new HTMLDocBuilder();
  });

  describe('constructor and initialization', () => {
    it('should create a default HTML document', () => {
      const result = builder.render();
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html');
      expect(result).toContain('</html>');
    });
  });

  describe('setTitle', () => {
    it('should set the document title', () => {
      builder.setTitle('My Page');
      const result = builder.render();
      expect(result).toContain('<title>My Page</title>');
    });

    it('should return this for chaining', () => {
      const result = builder.setTitle('Test');
      expect(result).toBe(builder);
    });
  });

  describe('setTheme', () => {
    it('should set light theme', () => {
      builder.setTheme('light');
      const result = builder.render();
      expect(result).toContain('data-theme="light"');
    });

    it('should set dark theme', () => {
      builder.setTheme('dark');
      const result = builder.render();
      expect(result).toContain('data-theme="dark"');
    });
  });

  describe('setStandalone', () => {
    it('should generate fragment when standalone is false', () => {
      builder.setStandalone(false);
      const result = builder.render();
      expect(result).toContain('<div class="visual-export"');
      expect(result).not.toContain('<!DOCTYPE html>');
    });
  });

  describe('addStyle', () => {
    it('should add custom CSS styles', () => {
      builder.addStyle('.custom { color: red; }');
      const result = builder.render();
      expect(result).toContain('.custom { color: red; }');
    });
  });

  describe('addHeading', () => {
    it('should add headings at different levels', () => {
      builder.addHeading(1, 'Title');
      builder.addHeading(2, 'Subtitle');
      builder.addHeading(3, 'Section');
      const result = builder.render();
      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<h2>Subtitle</h2>');
      expect(result).toContain('<h3>Section</h3>');
    });
  });

  describe('addParagraph', () => {
    it('should add a paragraph', () => {
      builder.addParagraph('Hello World');
      const result = builder.render();
      expect(result).toContain('<p>Hello World</p>');
    });

    it('should add a paragraph with class', () => {
      builder.addParagraph('Styled text', 'highlight');
      const result = builder.render();
      expect(result).toContain('<p class="highlight">Styled text</p>');
    });

    it('should escape HTML entities', () => {
      builder.addParagraph('<script>alert("xss")</script>');
      const result = builder.render();
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });
  });

  describe('addList', () => {
    it('should add an unordered list', () => {
      builder.addList(['Item 1', 'Item 2', 'Item 3']);
      const result = builder.render();
      expect(result).toContain('<ul');
      expect(result).toContain('<li>Item 1</li>');
      expect(result).toContain('<li>Item 2</li>');
      expect(result).toContain('<li>Item 3</li>');
    });

    it('should add an ordered list', () => {
      builder.addList(['First', 'Second'], true);
      const result = builder.render();
      expect(result).toContain('<ol');
      expect(result).toContain('<li>First</li>');
    });
  });

  describe('addTable', () => {
    it('should add a table', () => {
      builder.addTable(['Name', 'Age'], [['Alice', '25'], ['Bob', '30']]);
      const result = builder.render();
      expect(result).toContain('<table>');
      expect(result).toContain('<th>Name</th>');
      expect(result).toContain('<th>Age</th>');
      expect(result).toContain('<td>Alice</td>');
      expect(result).toContain('<td>25</td>');
    });

    it('should add a table with caption', () => {
      builder.addTable(['Col1'], [['Val']], 'My Table');
      const result = builder.render();
      expect(result).toContain('<caption>My Table</caption>');
    });
  });

  describe('addDiv', () => {
    it('should add a div container', () => {
      builder.addDiv('Content here', 'container');
      const result = builder.render();
      expect(result).toContain('<div class="container">Content here</div>');
    });
  });

  describe('addSection', () => {
    it('should add a section with header', () => {
      builder.addSection('Section Title', 'Section content');
      const result = builder.render();
      expect(result).toContain('class="section"');
      expect(result).toContain('<h3>Section Title</h3>');
      expect(result).toContain('Section content');
    });
  });

  describe('addMetricCard', () => {
    it('should add a metric card', () => {
      builder.addMetricCard('Total Users', 1000);
      const result = builder.render();
      expect(result).toContain('class="metric-card"');
      expect(result).toContain('1000');
      expect(result).toContain('Total Users');
    });
  });

  describe('addProgressBar', () => {
    it('should add a progress bar', () => {
      builder.addProgressBar(75);
      const result = builder.render();
      expect(result).toContain('class="progress-bar"');
      expect(result).toContain('width: 75%');
    });
  });

  describe('addBadge', () => {
    it('should add a badge', () => {
      builder.addBadge('Success', 'success');
      const result = builder.render();
      expect(result).toContain('class="badge badge-success"');
      expect(result).toContain('Success');
    });
  });

  describe('beginMetricsGrid and endMetricsGrid', () => {
    it('should create a metrics grid container', () => {
      builder.beginMetricsGrid().addMetricCard('A', 1).endMetricsGrid();
      const result = builder.render();
      expect(result).toContain('class="metrics-grid"');
    });
  });

  describe('addCard', () => {
    it('should add a card', () => {
      builder.addCard('Card Title', '<p>Card content</p>');
      const result = builder.render();
      expect(result).toContain('class="card"');
      expect(result).toContain('Card Title');
      expect(result).toContain('Card content');
    });
  });

  describe('addRaw', () => {
    it('should add raw HTML content', () => {
      builder.addRaw('<custom-element>Test</custom-element>');
      const result = builder.render();
      expect(result).toContain('<custom-element>Test</custom-element>');
    });
  });

  describe('reset', () => {
    it('should reset the builder state', () => {
      builder.setTitle('Test').addHeading(1, 'Header').reset();
      const result = builder.render();
      expect(result).toContain('<title>Document</title>');
      expect(result).not.toContain('Header');
    });
  });
});

// =============================================================================
// MarkdownBuilder Tests
// =============================================================================

describe('MarkdownBuilder', () => {
  let builder: MarkdownBuilder;

  beforeEach(() => {
    builder = new MarkdownBuilder();
  });

  describe('constructor and initialization', () => {
    it('should create an empty document', () => {
      const result = builder.render();
      expect(result).toBe('');
    });
  });

  describe('setTitle', () => {
    it('should set the document title as h1', () => {
      builder.setTitle('My Document');
      const result = builder.render();
      expect(result).toContain('# My Document');
    });

    it('should return this for chaining', () => {
      const result = builder.setTitle('Test');
      expect(result).toBe(builder);
    });
  });

  describe('enableFrontmatter', () => {
    it('should add YAML frontmatter', () => {
      builder.setTitle('Doc').enableFrontmatter();
      const result = builder.render();
      expect(result).toContain('---');
      expect(result).toContain('title: "Doc"');
    });

    it('should include custom metadata', () => {
      builder.enableFrontmatter({ author: 'John', tags: ['test', 'demo'] });
      const result = builder.render();
      expect(result).toContain('author: "John"');
      expect(result).toContain('- test');
      expect(result).toContain('- demo');
    });
  });

  describe('enableTableOfContents', () => {
    it('should add TOC placeholder', () => {
      builder.enableTableOfContents();
      const result = builder.render();
      expect(result).toContain('[TOC]');
    });
  });

  describe('addHeading', () => {
    it('should add headings at different levels', () => {
      builder.addHeading(1, 'H1');
      builder.addHeading(2, 'H2');
      builder.addHeading(3, 'H3');
      const result = builder.render();
      expect(result).toContain('# H1');
      expect(result).toContain('## H2');
      expect(result).toContain('### H3');
    });
  });

  describe('addParagraph', () => {
    it('should add a paragraph', () => {
      builder.addParagraph('Hello World');
      const result = builder.render();
      expect(result).toContain('Hello World');
    });
  });

  describe('addBulletList', () => {
    it('should add a bullet list', () => {
      builder.addBulletList(['Item 1', 'Item 2', 'Item 3']);
      const result = builder.render();
      expect(result).toContain('- Item 1');
      expect(result).toContain('- Item 2');
      expect(result).toContain('- Item 3');
    });
  });

  describe('addNumberedList', () => {
    it('should add a numbered list', () => {
      builder.addNumberedList(['First', 'Second', 'Third']);
      const result = builder.render();
      expect(result).toContain('1. First');
      expect(result).toContain('2. Second');
      expect(result).toContain('3. Third');
    });
  });

  describe('addTaskList', () => {
    it('should add a task list', () => {
      builder.addTaskList([
        { text: 'Todo', completed: false },
        { text: 'Done', completed: true },
      ]);
      const result = builder.render();
      expect(result).toContain('- [ ] Todo');
      expect(result).toContain('- [x] Done');
    });
  });

  describe('addCodeBlock', () => {
    it('should add a code block', () => {
      builder.addCodeBlock('console.log("hello");', 'javascript');
      const result = builder.render();
      expect(result).toContain('```javascript');
      expect(result).toContain('console.log("hello");');
      expect(result).toContain('```');
    });

    it('should add code block without language', () => {
      builder.addCodeBlock('plain text');
      const result = builder.render();
      expect(result).toContain('```\n');
    });
  });

  describe('addTable', () => {
    it('should add a table', () => {
      builder.addTable(['Name', 'Value'], [['A', '1'], ['B', '2']]);
      const result = builder.render();
      expect(result).toContain('| Name | Value |');
      expect(result).toContain('| :--- | :--- |');
      expect(result).toContain('| A | 1 |');
    });

    it('should support alignment options', () => {
      builder.addTable(['Left', 'Center', 'Right'], [['a', 'b', 'c']], ['left', 'center', 'right']);
      const result = builder.render();
      expect(result).toContain(':---');
      expect(result).toContain(':---:');
      expect(result).toContain('---:');
    });
  });

  describe('addBlockquote', () => {
    it('should add a blockquote', () => {
      builder.addBlockquote('This is a quote');
      const result = builder.render();
      expect(result).toContain('> This is a quote');
    });
  });

  describe('addHorizontalRule', () => {
    it('should add a horizontal rule', () => {
      builder.addHorizontalRule();
      const result = builder.render();
      expect(result).toContain('---');
    });
  });

  describe('addLink', () => {
    it('should add a link', () => {
      builder.addLink('Click here', 'https://example.com');
      const result = builder.render();
      expect(result).toContain('[Click here](https://example.com)');
    });

    it('should add a link with title', () => {
      builder.addLink('Link', 'https://example.com', 'Example Title');
      const result = builder.render();
      expect(result).toContain('[Link](https://example.com "Example Title")');
    });
  });

  describe('addImage', () => {
    it('should add an image', () => {
      builder.addImage('Alt text', 'https://example.com/image.png');
      const result = builder.render();
      expect(result).toContain('![Alt text](https://example.com/image.png)');
    });
  });

  describe('addMermaidDiagram', () => {
    it('should add a mermaid code block', () => {
      builder.addMermaidDiagram('graph TD\n  A --> B');
      const result = builder.render();
      expect(result).toContain('```mermaid');
      expect(result).toContain('graph TD');
    });
  });

  describe('addCollapsible', () => {
    it('should add a collapsible section', () => {
      builder.addCollapsible('Summary', 'Detail content');
      const result = builder.render();
      expect(result).toContain('<details>');
      expect(result).toContain('<summary>Summary</summary>');
      expect(result).toContain('Detail content');
      expect(result).toContain('</details>');
    });
  });

  describe('addKeyValueSection', () => {
    it('should add key-value pairs', () => {
      builder.addKeyValueSection({ name: 'Test', count: 42, active: true });
      const result = builder.render();
      expect(result).toContain('**name**: Test');
      expect(result).toContain('**count**: 42');
      expect(result).toContain('**active**: true');
    });
  });

  describe('addSection', () => {
    it('should add a section with heading', () => {
      builder.addSection('Section Title', 'Content here', 2);
      const result = builder.render();
      expect(result).toContain('## Section Title');
      expect(result).toContain('Content here');
    });
  });

  describe('addBadge', () => {
    it('should add a shield.io badge', () => {
      builder.addBadge('version', '1.0.0', 'green');
      const result = builder.render();
      expect(result).toContain('![version]');
      expect(result).toContain('shields.io/badge');
      expect(result).toContain('1.0.0');
      expect(result).toContain('green');
    });
  });

  describe('addProgressBar', () => {
    it('should add a text progress bar', () => {
      builder.addProgressBar(50, 100, 10);
      const result = builder.render();
      expect(result).toContain('█████░░░░░ 50%');
    });
  });

  describe('reset', () => {
    it('should reset the builder state', () => {
      builder.setTitle('Test').addHeading(2, 'Section').reset();
      const result = builder.render();
      expect(result).toBe('');
    });
  });
});

// =============================================================================
// ModelicaBuilder Tests
// =============================================================================

describe('ModelicaBuilder', () => {
  let builder: ModelicaBuilder;

  beforeEach(() => {
    builder = new ModelicaBuilder();
  });

  describe('constructor and initialization', () => {
    it('should create an empty builder', () => {
      const result = builder.render();
      expect(result).toBe('');
    });
  });

  describe('beginModel and endModel', () => {
    it('should create a model block', () => {
      builder.beginModel('TestModel', 'A test model').endModel();
      const result = builder.render();
      expect(result).toContain('model TestModel');
      expect(result).toContain('"A test model"');
      expect(result).toContain('end TestModel;');
    });

    it('should return this for chaining', () => {
      const result = builder.beginModel('Test', 'desc');
      expect(result).toBe(builder);
    });
  });

  describe('beginPackage and endPackage', () => {
    it('should create a package block', () => {
      builder.beginPackage('MyPackage', 'Package description').endPackage();
      const result = builder.render();
      expect(result).toContain('package MyPackage');
      expect(result).toContain('"Package description"');
      expect(result).toContain('end MyPackage;');
    });

    it('should include annotations by default', () => {
      builder.beginPackage('Test', 'desc').endPackage();
      const result = builder.render();
      expect(result).toContain('annotation(');
      expect(result).toContain('Documentation');
    });
  });

  describe('addParameter', () => {
    it('should add a Real parameter', () => {
      builder.beginModel('M', 'd').addParameter({
        name: 'temp',
        type: 'Real',
        value: 293.15,
        description: 'Temperature',
      }).endModel();
      const result = builder.render();
      expect(result).toContain('parameter Real temp');
      expect(result).toContain('= 293.15');
      expect(result).toContain('"Temperature"');
    });

    it('should add a String parameter', () => {
      builder.beginModel('M', 'd').addParameter({
        name: 'name',
        type: 'String',
        value: 'test',
      }).endModel();
      const result = builder.render();
      expect(result).toContain('parameter String name');
      expect(result).toContain('= "test"');
    });

    it('should add a parameter with unit', () => {
      builder.beginModel('M', 'd').addParameter({
        name: 'velocity',
        type: 'Real',
        value: 10.0,
        unit: 'm/s',
      }).endModel();
      const result = builder.render();
      expect(result).toContain('unit="m/s"');
    });
  });

  describe('addVariable', () => {
    it('should add a variable', () => {
      builder.beginModel('M', 'd').addVariable({
        name: 'x',
        type: 'Real',
        start: 0,
        description: 'Position',
      }).endModel();
      const result = builder.render();
      expect(result).toContain('Real x(start=0)');
      expect(result).toContain('"Position"');
    });
  });

  describe('addEquation', () => {
    it('should add an equation', () => {
      builder.beginModel('M', 'd').addEquation({
        equation: 'der(x) = v',
        comment: 'Position derivative',
      }).endModel();
      const result = builder.render();
      expect(result).toContain('equation');
      expect(result).toContain('der(x) = v;');
      expect(result).toContain('// Position derivative');
    });
  });

  describe('addConnection', () => {
    it('should add a connection', () => {
      builder.beginModel('M', 'd').addConnection({
        from: 'sensor',
        to: 'controller',
        comment: 'Signal link',
      }).endModel();
      const result = builder.render();
      expect(result).toContain('connect(sensor, controller);');
      expect(result).toContain('// Signal link');
    });
  });

  describe('addRaw', () => {
    it('should add raw Modelica code', () => {
      builder.addRaw('// Custom comment');
      const result = builder.render();
      expect(result).toContain('// Custom comment');
    });
  });

  describe('setOptions', () => {
    it('should disable annotations', () => {
      builder.setOptions({ includeAnnotations: false });
      builder.beginModel('M', 'd').endModel();
      const result = builder.render();
      expect(result).not.toContain('annotation(');
    });
  });

  describe('reset', () => {
    it('should reset the builder state', () => {
      builder.beginModel('Test', 'd').addParameter({ name: 'p', type: 'Real', value: 1 });
      builder.reset();
      const result = builder.render();
      expect(result).toBe('');
    });
  });

  describe('complete model', () => {
    it('should generate a complete Modelica model', () => {
      const result = builder
        .beginPackage('Thermal', 'Thermal models')
        .beginModel('HeatTransfer', 'Simple heat transfer model')
        .addParameter({ name: 'k', type: 'Real', value: 1.0, description: 'Thermal conductivity' })
        .addVariable({ name: 'T', type: 'Real', start: 293.15, description: 'Temperature' })
        .addEquation({ equation: 'der(T) = -k * (T - T_ambient)' })
        .endModel()
        .endPackage()
        .render();

      expect(result).toContain('package Thermal');
      expect(result).toContain('model HeatTransfer');
      expect(result).toContain('parameter Real k');
      expect(result).toContain('Real T(start=293.15)');
      expect(result).toContain('equation');
      expect(result).toContain('der(T) = -k * (T - T_ambient);');
      expect(result).toContain('end HeatTransfer;');
      expect(result).toContain('end Thermal;');
    });
  });
});

// =============================================================================
// JSONExportBuilder Tests
// =============================================================================

describe('JSONExportBuilder', () => {
  let builder: JSONExportBuilder;

  beforeEach(() => {
    builder = new JSONExportBuilder();
  });

  describe('constructor and initialization', () => {
    it('should create an empty JSON object', () => {
      const result = builder.render();
      expect(JSON.parse(result)).toEqual({});
    });
  });

  describe('setMetadata', () => {
    it('should set metadata with auto-generated fields', () => {
      builder.setMetadata({ title: 'Test Export', version: '1.0' });
      const result = JSON.parse(builder.render());
      expect(result.metadata.title).toBe('Test Export');
      expect(result.metadata.version).toBe('1.0');
      expect(result.metadata.exportedAt).toBeDefined();
      expect(result.metadata.generator).toContain('DeepThinking MCP');
    });

    it('should return this for chaining', () => {
      const result = builder.setMetadata({});
      expect(result).toBe(builder);
    });
  });

  describe('addSection', () => {
    it('should add a section', () => {
      builder.addSection('data', { count: 42 });
      const result = JSON.parse(builder.render());
      expect(result.data).toEqual({ count: 42 });
    });
  });

  describe('addArraySection', () => {
    it('should add an array section', () => {
      builder.addArraySection('items', ['a', 'b', 'c']);
      const result = JSON.parse(builder.render());
      expect(result.items).toEqual(['a', 'b', 'c']);
    });
  });

  describe('addObjectSection', () => {
    it('should add an object section', () => {
      builder.addObjectSection('config', { theme: 'dark', lang: 'en' });
      const result = JSON.parse(builder.render());
      expect(result.config).toEqual({ theme: 'dark', lang: 'en' });
    });
  });

  describe('addSections', () => {
    it('should add multiple sections at once', () => {
      builder.addSections([
        { key: 'a', value: 1 },
        { key: 'b', value: 2 },
        { key: 'c', value: 3 },
      ]);
      const result = JSON.parse(builder.render());
      expect(result.a).toBe(1);
      expect(result.b).toBe(2);
      expect(result.c).toBe(3);
    });
  });

  describe('setPath', () => {
    it('should set nested values by path', () => {
      builder.setPath('config.settings.theme', 'dark');
      const result = JSON.parse(builder.render());
      expect(result.config.settings.theme).toBe('dark');
    });

    it('should create intermediate objects', () => {
      builder.setPath('a.b.c.d', 'value');
      const result = JSON.parse(builder.render());
      expect(result.a.b.c.d).toBe('value');
    });
  });

  describe('addGraph', () => {
    it('should add nodes and edges', () => {
      const nodes = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }];
      const edges = [{ id: 'e1', source: 'a', target: 'b' }];
      builder.addGraph(nodes, edges);
      const result = JSON.parse(builder.render());
      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);
    });
  });

  describe('addLayout', () => {
    it('should add layout configuration', () => {
      builder.addLayout({ type: 'hierarchical', direction: 'TB' });
      const result = JSON.parse(builder.render());
      expect(result.layout.type).toBe('hierarchical');
      expect(result.layout.direction).toBe('TB');
    });
  });

  describe('addMetrics', () => {
    it('should add metrics', () => {
      builder.addMetrics({ count: 100, avg: 50.5 });
      const result = JSON.parse(builder.render());
      expect(result.metrics.count).toBe(100);
      expect(result.metrics.avg).toBe(50.5);
    });

    it('should merge metrics', () => {
      builder.addMetrics({ a: 1 }).addMetrics({ b: 2 });
      const result = JSON.parse(builder.render());
      expect(result.metrics.a).toBe(1);
      expect(result.metrics.b).toBe(2);
    });
  });

  describe('addLegend', () => {
    it('should add legend items', () => {
      builder.addLegend([
        { label: 'Node', color: '#fff', shape: 'circle' },
        { label: 'Edge', color: '#000' },
      ]);
      const result = JSON.parse(builder.render());
      expect(result.legend).toHaveLength(2);
      expect(result.legend[0].label).toBe('Node');
    });
  });

  describe('removeSection', () => {
    it('should remove a section', () => {
      builder.addSection('keep', 1).addSection('remove', 2).removeSection('remove');
      const result = JSON.parse(builder.render());
      expect(result.keep).toBe(1);
      expect(result.remove).toBeUndefined();
    });
  });

  describe('setFormatting', () => {
    it('should set pretty print and indent', () => {
      builder.setFormatting({ prettyPrint: true, indent: 4 });
      builder.addSection('test', 'value');
      const result = builder.render();
      expect(result).toContain('    '); // 4-space indent
    });

    it('should disable pretty print', () => {
      builder.setFormatting({ prettyPrint: false });
      builder.addSection('a', 1).addSection('b', 2);
      const result = builder.render();
      expect(result).toBe('{"a":1,"b":2}');
    });
  });

  describe('setOptions', () => {
    it('should set sort keys option', () => {
      builder.setOptions({ sortKeys: true });
      builder.addSection('z', 1).addSection('a', 2);
      const result = builder.render();
      const parsed = JSON.parse(result);
      const keys = Object.keys(parsed);
      expect(keys[0]).toBe('a');
      expect(keys[1]).toBe('z');
    });
  });

  describe('getData', () => {
    it('should return the raw data object', () => {
      builder.addSection('test', 123);
      const data = builder.getData();
      expect(data.test).toBe(123);
    });

    it('should return a copy, not the original', () => {
      builder.addSection('test', 123);
      const data = builder.getData();
      data.test = 456;
      const data2 = builder.getData();
      expect(data2.test).toBe(123);
    });
  });

  describe('reset', () => {
    it('should reset the builder state', () => {
      builder.addSection('test', 123).setFormatting({ indent: 4 });
      builder.reset();
      const result = JSON.parse(builder.render());
      expect(result).toEqual({});
    });
  });

  describe('complete export', () => {
    it('should generate a complete JSON export', () => {
      const result = builder
        .setMetadata({ title: 'Analysis Report', version: '1.0' })
        .addSection('summary', { total: 100, passed: 95 })
        .addArraySection('items', ['A', 'B', 'C'])
        .addMetrics({ successRate: 0.95 })
        .addLayout({ type: 'hierarchical', direction: 'TB' })
        .render();

      const parsed = JSON.parse(result);
      expect(parsed.metadata.title).toBe('Analysis Report');
      expect(parsed.summary.total).toBe(100);
      expect(parsed.items).toHaveLength(3);
      expect(parsed.metrics.successRate).toBe(0.95);
      expect(parsed.layout.type).toBe('hierarchical');
    });
  });
});
