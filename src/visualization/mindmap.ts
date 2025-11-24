/**
 * Knowledge Mind Map Generator (v3.3.0)
 * Phase 4B Task 3.5: Mind map visualizations for knowledge structures
 */

import type { ThinkingSession } from '../types/session.js';
import type { Thought, MathematicsThought, CausalThought, FirstPrinciplesThought } from '../types/index.js';
import { MermaidGenerator, type MindmapNode } from './mermaid.js';

/**
 * Knowledge node for mind mapping
 */
export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'root' | 'concept' | 'fact' | 'relation' | 'insight' | 'question';
  children: KnowledgeNode[];
  metadata?: {
    source?: string;
    confidence?: number;
    tags?: string[];
  };
}

/**
 * Mind map generator for knowledge structures
 */
export class KnowledgeMindMap {
  private generator: MermaidGenerator;

  constructor() {
    this.generator = new MermaidGenerator({ type: 'mindmap' });
  }

  /**
   * Generate comprehensive knowledge mind map from session
   */
  generateSessionMindMap(session: ThinkingSession): string {
    const knowledgeTree = this.extractKnowledgeTree(session);
    const mermaidNode = this.convertToMermaidNode(knowledgeTree);

    return this.generator.generateMindmap(mermaidNode);
  }

  /**
   * Extract knowledge tree from session
   */
  private extractKnowledgeTree(session: ThinkingSession): KnowledgeNode {
    const root: KnowledgeNode = {
      id: 'root',
      label: session.title || 'Knowledge Map',
      type: 'root',
      children: [],
    };

    // Group thoughts by mode
    const modeGroups = this.groupThoughtsByMode(session);

    for (const [mode, thoughts] of modeGroups) {
      const modeNode: KnowledgeNode = {
        id: `mode_${mode}`,
        label: this.formatModeName(mode),
        type: 'concept',
        children: [],
      };

      // Extract knowledge from each thought in this mode
      for (const thought of thoughts) {
        const thoughtNodes = this.extractThoughtKnowledge(thought);
        modeNode.children.push(...thoughtNodes);
      }

      if (modeNode.children.length > 0) {
        root.children.push(modeNode);
      }
    }

    // Add insights node
    const insights = this.extractInsights(session);
    if (insights.children.length > 0) {
      root.children.push(insights);
    }

    // Add questions node
    const questions = this.extractQuestions(session);
    if (questions.children.length > 0) {
      root.children.push(questions);
    }

    return root;
  }

  /**
   * Group thoughts by reasoning mode
   */
  private groupThoughtsByMode(session: ThinkingSession): Map<string, Thought[]> {
    const groups = new Map<string, Thought[]>();

    for (const thought of session.thoughts) {
      if (!groups.has(thought.mode)) {
        groups.set(thought.mode, []);
      }
      groups.get(thought.mode)!.push(thought);
    }

    return groups;
  }

  /**
   * Extract knowledge nodes from a single thought
   */
  private extractThoughtKnowledge(thought: Thought): KnowledgeNode[] {
    const nodes: KnowledgeNode[] = [];

    // Mode-specific extraction
    switch (thought.mode) {
      case 'mathematics':
        nodes.push(...this.extractMathKnowledge(thought as MathematicsThought));
        break;
      case 'causal':
        nodes.push(...this.extractCausalKnowledge(thought as CausalThought));
        break;
          // @ts-expect-error - ThinkingMode type issue
      case ThinkingMode.FIRSTPRINCIPLES:
        nodes.push(...this.extractFirstPrincipleKnowledge(thought as FirstPrinciplesThought));
        break;
      default:
        // Generic extraction
        nodes.push(this.createGenericNode(thought));
        break;
    }

    return nodes;
  }

  /**
   * Extract knowledge from mathematics thought
   */
  private extractMathKnowledge(thought: MathematicsThought): KnowledgeNode[] {
    const nodes: KnowledgeNode[] = [];

    // Theorems
    if (thought.theorems && thought.theorems.length > 0) {
      const theoremsNode: KnowledgeNode = {
        id: `theorems_${thought.id}`,
        label: 'Theorems',
        type: 'concept',
        children: thought.theorems.map(thm => ({
          id: `thm_${thought.id}_${thm.name}`,
          label: thm.name,
          type: 'fact',
          children: [],
          metadata: { source: `Thought ${thought.thoughtNumber}` },
        })),
      };
      nodes.push(theoremsNode);
    }

    // Mathematical model
    if (thought.mathematicalModel) {
      nodes.push({
        id: `model_${thought.id}`,
        label: 'Model',
        type: 'concept',
        children: [{
          id: `model_eq_${thought.id}`,
          label: thought.mathematicalModel.symbolic || 'Equation',
          type: 'fact',
          children: [],
        }],
      });
    }

    return nodes;
  }

  /**
   * Extract knowledge from causal thought
   */
  private extractCausalKnowledge(thought: CausalThought): KnowledgeNode[] {
    const nodes: KnowledgeNode[] = [];

    if (thought.causalGraph) {
      const graph = thought.causalGraph;

      // Causes
      const causes = graph.nodes.filter(n => n.type === 'cause');
      if (causes.length > 0) {
        nodes.push({
          id: `causes_${thought.id}`,
          label: 'Causes',
          type: 'concept',
          children: causes.map(c => ({
            id: `cause_${c.id}`,
            label: c.name,
            type: 'fact',
            children: [],
          })),
        });
      }

      // Effects
      const effects = graph.nodes.filter(n => n.type === 'effect');
      if (effects.length > 0) {
        nodes.push({
          id: `effects_${thought.id}`,
          label: 'Effects',
          type: 'concept',
          children: effects.map(e => ({
            id: `effect_${e.id}`,
            label: e.name,
            type: 'fact',
            children: [],
          })),
        });
      }

      // Relations
      if (graph.edges && graph.edges.length > 0) {
        nodes.push({
          id: `relations_${thought.id}`,
          label: 'Relations',
          type: 'relation',
          children: graph.edges.map(edge => ({
            id: `rel_${(edge as any).id}`,
            label: `${this.getNodeName(graph.nodes, edge.from)} → ${this.getNodeName(graph.nodes, edge.to)}`,
            type: 'relation',
            children: [],
            metadata: { confidence: edge.strength },
          })),
        });
      }
    }

    return nodes;
  }

  /**
   * Extract knowledge from first-principle thought
   */
  private extractFirstPrincipleKnowledge(thought: FirstPrinciplesThought): KnowledgeNode[] {
    const nodes: KnowledgeNode[] = [];

    // Fundamental principles
    if ((thought as any).fundamentalPrinciples && (thought as any).fundamentalPrinciples.length > 0) {
      nodes.push({
        id: `principles_${thought.id}`,
        label: 'Principles',
        type: 'concept',
// @ts-ignore - Dynamic property access
        children: (thought as any).fundamentalPrinciples.map(p => ({
          id: `principle_${thought.id}_${p.name}`,
          label: p.name,
          type: 'fact',
          children: [],
        })),
      });
    }

    // Assumptions
    if ((thought as any).assumptions && (thought as any).assumptions.length > 0) {
      nodes.push({
        id: `assumptions_${thought.id}`,
        label: 'Assumptions',
        type: 'concept',
// @ts-ignore - Map callback types
        children: (thought as any).assumptions.map((a, i) => ({
          id: `assumption_${thought.id}_${i}`,
          label: this.truncate(a, 40),
          type: 'fact',
          children: [],
        })),
      });
    }

    return nodes;
  }

  /**
   * Create generic node for unsupported thought types
   */
  private createGenericNode(thought: Thought): KnowledgeNode {
    return {
      id: `thought_${thought.id}`,
      label: `T${thought.thoughtNumber}`,
      type: 'concept',
      children: [{
        id: `content_${thought.id}`,
        label: this.truncate(thought.content, 30),
        type: 'fact',
        children: [],
      }],
    };
  }

  /**
   * Extract insights from session
   */
  private extractInsights(session: ThinkingSession): KnowledgeNode {
    const insightsNode: KnowledgeNode = {
      id: 'insights',
      label: 'Insights',
      type: 'insight',
      children: [],
    };

    // Collect unique insights from different thought types
    for (const thought of session.thoughts) {
      if ('insights' in thought && Array.isArray((thought as any).insights)) {
        const insights = (thought as any).insights;
        for (const insight of insights) {
          insightsNode.children.push({
            id: `insight_${thought.id}_${insight.id || Math.random()}`,
            label: insight.description || this.truncate(insight.content || '', 40),
            type: 'insight',
            children: [],
            metadata: {
              source: `Thought ${thought.thoughtNumber}`,
              confidence: insight.novelty,
            },
          });
        }
      }
    }

    return insightsNode;
  }

  /**
   * Extract questions from session
   */
  private extractQuestions(session: ThinkingSession): KnowledgeNode {
    const questionsNode: KnowledgeNode = {
      id: 'questions',
      label: 'Open Questions',
      type: 'question',
      children: [],
    };

    // Identify incomplete thoughts as questions
    for (const thought of session.thoughts) {
      if (thought.nextThoughtNeeded && !session.isComplete) {
        questionsNode.children.push({
          id: `question_${thought.id}`,
          label: `Continue from T${thought.thoughtNumber}?`,
          type: 'question',
          children: [],
        });
      }

      // Extract explicit questions from content
      const contentQuestions = thought.content.match(/\?[^?]*$/g);
      if (contentQuestions) {
        for (const q of contentQuestions) {
          questionsNode.children.push({
            id: `q_${thought.id}_${Math.random()}`,
            label: this.truncate(q, 50),
            type: 'question',
            children: [],
          });
        }
      }
    }

    return questionsNode;
  }

  /**
   * Convert knowledge tree to Mermaid mindmap node
   */
  private convertToMermaidNode(node: KnowledgeNode): MindmapNode {
    return {
      label: node.label,
      children: node.children.map(child => this.convertToMermaidNode(child)),
    };
  }

  /**
   * Generate hierarchical knowledge structure
   */
  generateHierarchicalStructure(session: ThinkingSession): string {
    const lines: string[] = [];

    lines.push('%%{init: {\'theme\':\'base\', \'themeVariables\': {\'primaryColor\':\'#f0f0f0\'}}}%%');
    lines.push('graph TB');
    lines.push('');

    const knowledgeTree = this.extractKnowledgeTree(session);
    const nodeId = 0;

    this.addHierarchicalNodes(lines, knowledgeTree, 'root', nodeId);

    // Add styling
    lines.push('');
    lines.push('  classDef root fill:#667eea,stroke:#333,stroke-width:4px,color:#fff');
    lines.push('  classDef concept fill:#a8d5ff,stroke:#333,stroke-width:2px');
    lines.push('  classDef fact fill:#ffe1a8,stroke:#333,stroke-width:1px');
    lines.push('  classDef insight fill:#a8ffb4,stroke:#333,stroke-width:2px');
    lines.push('  classDef question fill:#ffa8d5,stroke:#333,stroke-width:2px');

    return lines.join('\n');
  }

  /**
   * Add hierarchical nodes to graph
   */
  private addHierarchicalNodes(
    lines: string[],
    node: KnowledgeNode,
    parentId: string,
    counter: number
  ): number {
    let nodeCounter = counter;
    const nodeId = `node_${nodeCounter++}`;

    // Add node
    lines.push(`  ${nodeId}["${node.label}"]:::${node.type}`);

    // Add edge from parent
    if (parentId !== 'root') {
      lines.push(`  ${parentId} --> ${nodeId}`);
    }

    // Add children recursively
    for (const child of node.children) {
      nodeCounter = this.addHierarchicalNodes(lines, child, nodeId, nodeCounter);
    }

    return nodeCounter;
  }

  /**
   * Generate complete mind map HTML page
   */
  generateMindMapPage(session: ThinkingSession): string {
    const mindmap = this.generateSessionMindMap(session);
    const hierarchical = this.generateHierarchicalStructure(session);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Knowledge Mind Map: ${session.title}</title>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      mindmap: { padding: 20 }
    });
  </script>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .container {
      max-width: 1800px;
      margin: 0 auto;
    }
    h1 {
      color: white;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      text-align: center;
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    .subtitle {
      color: rgba(255,255,255,0.9);
      text-align: center;
      font-size: 1.2em;
      margin-bottom: 30px;
    }
    .diagram-container {
      background: white;
      padding: 40px;
      border-radius: 15px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      margin: 20px 0;
    }
    h2 {
      color: #333;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
      margin-top: 0;
    }
    .mermaid {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      padding: 20px;
    }
    .tabs {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-bottom: 30px;
    }
    .tab {
      padding: 15px 30px;
      background: rgba(255,255,255,0.8);
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s;
      color: #333;
    }
    .tab.active {
      background: white;
      box-shadow: 0 5px 20px rgba(0,0,0,0.2);
      transform: translateY(-3px);
    }
    .tab:hover {
      background: white;
      transform: translateY(-2px);
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
    .legend {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 2px solid #333;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
    }
    .stat-value {
      font-size: 36px;
      font-weight: bold;
    }
    .stat-label {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧠 Knowledge Mind Map</h1>
    <div class="subtitle">${session.title}</div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${session.thoughts.length}</div>
        <div class="stat-label">Total Thoughts</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${new Set(session.thoughts.map(t => t.mode)).size}</div>
        <div class="stat-label">Knowledge Domains</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${this.countTotalNodes(this.extractKnowledgeTree(session))}</div>
        <div class="stat-label">Knowledge Nodes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${session.isComplete ? '✓' : '⋯'}</div>
        <div class="stat-label">${session.isComplete ? 'Complete' : 'In Progress'}</div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab active" onclick="showTab('mindmap')">Mind Map</button>
      <button class="tab" onclick="showTab('hierarchical')">Hierarchical</button>
    </div>

    <div id="mindmap" class="tab-content active">
      <div class="diagram-container">
        <h2>📋 Knowledge Mind Map</h2>
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color" style="background: #667eea;"></div>
            <span>Root Concept</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #a8d5ff;"></div>
            <span>Sub-Concept</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #ffe1a8;"></div>
            <span>Fact/Detail</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #a8ffb4;"></div>
            <span>Insight</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #ffa8d5;"></div>
            <span>Question</span>
          </div>
        </div>
        <div class="mermaid">
${mindmap}
        </div>
      </div>
    </div>

    <div id="hierarchical" class="tab-content">
      <div class="diagram-container">
        <h2>📊 Hierarchical Structure</h2>
        <p>A tree view showing the hierarchical relationships between knowledge elements.</p>
        <div class="mermaid">
${hierarchical}
        </div>
      </div>
    </div>
  </div>

  <script>
    function showTab(tabName) {
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });

      document.getElementById(tabName).classList.add('active');
      event.target.classList.add('active');
    }
  </script>
</body>
</html>`;
  }

  /**
   * Count total nodes in knowledge tree
   */
  private countTotalNodes(node: KnowledgeNode): number {
    let count = 1;
    for (const child of node.children) {
      count += this.countTotalNodes(child);
    }
    return count;
  }

  /**
   * Get node name from nodes array by ID
   */
  private getNodeName(nodes: any[], nodeId: string): string {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.name : nodeId;
  }

  /**
   * Format mode name
   */
  private formatModeName(mode: string): string {
    return mode.charAt(0).toUpperCase() + mode.slice(1).replace(/_/g, ' ');
  }

  /**
   * Truncate text
   */
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}
