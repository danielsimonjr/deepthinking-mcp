/**
 * Knowledge Mind Map Generation (v3.4.0)
 * Phase 4B Task 3.5: Add knowledge mind map generation
 *
 * Generates mind maps from thinking sessions showing knowledge structure
 */

import type { ThinkingSession, Thought } from '../types/index.js';
import { MermaidGenerator } from './mermaid-generator.js';

/**
 * Mind map node
 */
export interface MindMapNode {
  id: string;
  label: string;
  type: 'root' | 'branch' | 'leaf';
  level: number;
  children: MindMapNode[];
  metadata?: {
    mode?: string;
    thoughtNumbers?: number[];
    importance?: number;
    keywords?: string[];
  };
}

/**
 * Knowledge cluster
 */
export interface KnowledgeCluster {
  id: string;
  topic: string;
  thoughts: Thought[];
  keywords: Set<string>;
  relatedClusters: string[];
}

/**
 * Mind map structure
 */
export interface MindMapStructure {
  root: MindMapNode;
  totalNodes: number;
  maxDepth: number;
  clusters: KnowledgeCluster[];
}

/**
 * Knowledge mind map generator
 */
export class KnowledgeMindMapGenerator {
  private mermaidGenerator: MermaidGenerator;

  constructor() {
    this.mermaidGenerator = new MermaidGenerator();
  }

  /**
   * Generate mind map from session
   */
  generateMindMap(session: ThinkingSession): string {
    const structure = this.analyzeKnowledgeStructure(session);
    return this.renderMindMap(structure.root);
  }

  /**
   * Analyze knowledge structure
   */
  analyzeKnowledgeStructure(session: ThinkingSession): MindMapStructure {
    const root: MindMapNode = {
      id: 'root',
      label: session.title || 'Thinking Session',
      type: 'root',
      level: 0,
      children: [],
      metadata: {
        thoughtNumbers: session.thoughts.map(t => t.thoughtNumber),
      },
    };

    // Group thoughts by mode
    const thoughtsByMode = this.groupThoughtsByMode(session.thoughts);

    // Create branches for each mode
    for (const [mode, thoughts] of thoughtsByMode) {
      const branch = this.createBranch(mode, thoughts, 1);
      root.children.push(branch);
    }

    // Calculate structure metrics
    const totalNodes = this.countNodes(root);
    const maxDepth = this.calculateDepth(root);

    // Create knowledge clusters
    const clusters = this.identifyKnowledgeClusters(session.thoughts);

    return {
      root,
      totalNodes,
      maxDepth,
      clusters,
    };
  }

  /**
   * Group thoughts by mode
   */
  private groupThoughtsByMode(thoughts: Thought[]): Map<string, Thought[]> {
    const groups = new Map<string, Thought[]>();

    for (const thought of thoughts) {
      if (!groups.has(thought.mode)) {
        groups.set(thought.mode, []);
      }
      groups.get(thought.mode)!.push(thought);
    }

    return groups;
  }

  /**
   * Create branch node
   */
  private createBranch(mode: string, thoughts: Thought[], level: number): MindMapNode {
    const branch: MindMapNode = {
      id: `branch_${mode}`,
      label: mode,
      type: 'branch',
      level,
      children: [],
      metadata: {
        mode,
        thoughtNumbers: thoughts.map(t => t.thoughtNumber),
      },
    };

    // Extract key concepts from thoughts
    const concepts = this.extractConcepts(thoughts);

    // Create leaf nodes for top concepts
    for (const concept of concepts.slice(0, 5)) {
      const leaf: MindMapNode = {
        id: `leaf_${mode}_${concept.replace(/\s+/g, '_')}`,
        label: concept,
        type: 'leaf',
        level: level + 1,
        children: [],
        metadata: {
          keywords: [concept],
        },
      };
      branch.children.push(leaf);
    }

    return branch;
  }

  /**
   * Extract key concepts from thoughts
   */
  private extractConcepts(thoughts: Thought[]): string[] {
    const concepts: string[] = [];

    for (const thought of thoughts) {
      // Extract from thought content (simplified)
      const words = thought.content.split(/\s+/);

      // Look for capitalized words or important terms
      for (const word of words) {
        if (word.length > 5 && /^[A-Z]/.test(word)) {
          concepts.push(word);
        }
      }

      // Extract from specific thought types
      if ('equation' in thought && typeof thought.equation === 'string') {
        concepts.push('Equation');
      }

      if ('graph' in thought) {
        concepts.push('Graph Analysis');
      }

      if ('network' in thought) {
        concepts.push('Network');
      }
    }

    // Return unique concepts
    return Array.from(new Set(concepts));
  }

  /**
   * Count total nodes
   */
  private countNodes(node: MindMapNode): number {
    let count = 1;
    for (const child of node.children) {
      count += this.countNodes(child);
    }
    return count;
  }

  /**
   * Calculate max depth
   */
  private calculateDepth(node: MindMapNode): number {
    if (node.children.length === 0) {
      return 1;
    }

    let maxChildDepth = 0;
    for (const child of node.children) {
      maxChildDepth = Math.max(maxChildDepth, this.calculateDepth(child));
    }

    return 1 + maxChildDepth;
  }

  /**
   * Identify knowledge clusters
   */
  private identifyKnowledgeClusters(thoughts: Thought[]): KnowledgeCluster[] {
    const clusters: KnowledgeCluster[] = [];

    // Group by mode
    const modeGroups = this.groupThoughtsByMode(thoughts);

    for (const [mode, modeThoughts] of modeGroups) {
      const cluster: KnowledgeCluster = {
        id: `cluster_${mode}`,
        topic: mode,
        thoughts: modeThoughts,
        keywords: new Set(this.extractConcepts(modeThoughts)),
        relatedClusters: [],
      };

      clusters.push(cluster);
    }

    // Find related clusters (simplified - based on shared concepts)
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const sharedKeywords = this.findSharedKeywords(
          clusters[i].keywords,
          clusters[j].keywords
        );

        if (sharedKeywords.size > 0) {
          clusters[i].relatedClusters.push(clusters[j].id);
          clusters[j].relatedClusters.push(clusters[i].id);
        }
      }
    }

    return clusters;
  }

  /**
   * Find shared keywords
   */
  private findSharedKeywords(set1: Set<string>, set2: Set<string>): Set<string> {
    const shared = new Set<string>();

    for (const keyword of set1) {
      if (set2.has(keyword)) {
        shared.add(keyword);
      }
    }

    return shared;
  }

  /**
   * Render mind map in Mermaid format
   */
  private renderMindMap(root: MindMapNode): string {
    return this.mermaidGenerator.generateMindmap({
      id: root.id,
      label: root.label,
      children: this.convertChildren(root.children),
    });
  }

  /**
   * Convert children to mindmap format
   */
  private convertChildren(children: MindMapNode[]): any[] {
    return children.map(child => ({
      id: child.id,
      label: child.label,
      children: child.children.length > 0 ? this.convertChildren(child.children) : undefined,
    }));
  }

  /**
   * Generate hierarchical mind map
   */
  generateHierarchicalMindMap(session: ThinkingSession): string {
    const structure = this.analyzeKnowledgeStructure(session);

    const lines: string[] = [];

    lines.push('%%{init: { \'theme\': \'default\' }}%%');
    lines.push('mindmap');
    lines.push(`  root((${structure.root.label}))`);

    // Add branches
    for (const branch of structure.root.children) {
      lines.push(`    ${branch.label}`);

      // Add leaves
      for (const leaf of branch.children) {
        lines.push(`      ${leaf.label}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate concept map (flowchart style)
   */
  generateConceptMap(session: ThinkingSession): string {
    const structure = this.analyzeKnowledgeStructure(session);

    const nodes: Array<{ id: string; label: string; shape: any; class?: string }> = [];
    const edges: Array<{ from: string; to: string; label?: string; type?: any }> = [];

    // Add root
    nodes.push({
      id: structure.root.id,
      label: structure.root.label,
      shape: 'stadium' as const,
      class: 'root',
    });

    // Add branches and leaves
    for (const branch of structure.root.children) {
      nodes.push({
        id: branch.id,
        label: branch.label,
        shape: 'rounded' as const,
        class: 'branch',
      });

      edges.push({
        from: structure.root.id,
        to: branch.id,
        type: 'arrow' as const,
      });

      for (const leaf of branch.children) {
        nodes.push({
          id: leaf.id,
          label: leaf.label,
          shape: 'rectangle' as const,
          class: 'leaf',
        });

        edges.push({
          from: branch.id,
          to: leaf.id,
          type: 'arrow' as const,
        });
      }
    }

    const styleClasses = [
      { name: 'root', fill: '#e3f2fd', stroke: '#1976d2', strokeWidth: '3px', fontSize: '16px' },
      { name: 'branch', fill: '#fff3e0', stroke: '#f57c00', strokeWidth: '2px', fontSize: '14px' },
      { name: 'leaf', fill: '#f3e5f5', stroke: '#7b1fa2', strokeWidth: '1px', fontSize: '12px' },
    ];

    return this.mermaidGenerator.generateFlowchart(nodes, edges, 'TB', styleClasses);
  }

  /**
   * Generate knowledge cluster diagram
   */
  generateClusterDiagram(session: ThinkingSession): string {
    const structure = this.analyzeKnowledgeStructure(session);

    const nodes: Array<{ id: string; label: string; shape: any }> = [];
    const edges: Array<{ from: string; to: string; label?: string; type?: any }> = [];

    // Add cluster nodes
    for (const cluster of structure.clusters) {
      const label = `${cluster.topic}\\n${cluster.thoughts.length} thoughts`;
      nodes.push({
        id: cluster.id,
        label,
        shape: 'rounded' as const,
      });
    }

    // Add relationships
    for (const cluster of structure.clusters) {
      for (const relatedId of cluster.relatedClusters) {
        // Avoid duplicate edges
        const existingEdge = edges.find(
          e => (e.from === cluster.id && e.to === relatedId) ||
               (e.from === relatedId && e.to === cluster.id)
        );

        if (!existingEdge) {
          edges.push({
            from: cluster.id,
            to: relatedId,
            type: 'open' as const,
            label: 'related',
          });
        }
      }
    }

    return this.mermaidGenerator.generateFlowchart(nodes, edges, 'LR');
  }

  /**
   * Generate knowledge summary
   */
  generateKnowledgeSummary(session: ThinkingSession): string {
    const structure = this.analyzeKnowledgeStructure(session);

    const report: string[] = [];

    report.push('# Knowledge Structure Summary');
    report.push('');

    report.push('## Overview');
    report.push(`- **Total Nodes:** ${structure.totalNodes}`);
    report.push(`- **Max Depth:** ${structure.maxDepth}`);
    report.push(`- **Knowledge Clusters:** ${structure.clusters.length}`);
    report.push('');

    report.push('## Knowledge by Mode');
    for (const branch of structure.root.children) {
      const mode = branch.metadata?.mode || branch.label;
      const thoughtCount = branch.metadata?.thoughtNumbers?.length || 0;

      report.push(`### ${mode}`);
      report.push(`- **Thoughts:** ${thoughtCount}`);
      report.push(`- **Key Concepts:** ${branch.children.map(c => c.label).join(', ')}`);
      report.push('');
    }

    report.push('## Knowledge Clusters');
    for (const cluster of structure.clusters) {
      report.push(`### ${cluster.topic}`);
      report.push(`- **Thoughts:** ${cluster.thoughts.length}`);
      report.push(`- **Keywords:** ${Array.from(cluster.keywords).slice(0, 5).join(', ')}`);
      report.push(`- **Related Clusters:** ${cluster.relatedClusters.length}`);
      report.push('');
    }

    return report.join('\n');
  }

  /**
   * Generate all mind maps
   */
  generateAllMindMaps(session: ThinkingSession): {
    basic: string;
    hierarchical: string;
    conceptMap: string;
    clusterDiagram: string;
    summary: string;
  } {
    return {
      basic: this.generateMindMap(session),
      hierarchical: this.generateHierarchicalMindMap(session),
      conceptMap: this.generateConceptMap(session),
      clusterDiagram: this.generateClusterDiagram(session),
      summary: this.generateKnowledgeSummary(session),
    };
  }
}
