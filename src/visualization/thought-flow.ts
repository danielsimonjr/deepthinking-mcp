/**
 * Thought Flow Visualization (v3.3.0)
 * Phase 4B Task 3.3: Sequence diagrams for thought progression
 */

import type { ThinkingSession } from '../types/session.js';
import type { Thought } from '../types/index.js';
import { MermaidGenerator, type SequenceInteraction } from './mermaid.js';

/**
 * Thought flow analyzer and visualizer
 */
export class ThoughtFlowVisualizer {
  private generator: MermaidGenerator;

  constructor() {
    this.generator = new MermaidGenerator({ type: 'sequence' });
  }

  /**
   * Generate sequence diagram showing thought progression
   */
  generateThoughtFlowDiagram(session: ThinkingSession): string {
    const participants = this.extractParticipants(session);
    const interactions = this.buildInteractions(session);

    return this.generator.generateSequenceDiagram(participants, interactions);
  }

  /**
   * Extract participants from session (thinking modes, user, system)
   */
  private extractParticipants(session: ThinkingSession): string[] {
    const participants = new Set<string>();

    // Add user and system
    participants.add('User');
    participants.add('System');

    // Add thinking modes used in session
    for (const thought of session.thoughts) {
      const modeName = this.formatModeName(thought.mode);
      participants.add(modeName);
    }

    return Array.from(participants);
  }

  /**
   * Build sequence interactions from thoughts
   */
  private buildInteractions(session: ThinkingSession): SequenceInteraction[] {
    const interactions: SequenceInteraction[] = [];

    // Session initiation
    interactions.push({
      from: 'User',
      to: 'System',
      message: `Start ${this.formatModeName(session.mode)} session`,
      type: 'solid',
    });

    interactions.push({
      from: 'System',
      to: this.formatModeName(session.mode),
      message: 'Initialize reasoning',
      type: 'solid',
      activate: true,
    });

    // Process each thought
    for (let i = 0; i < session.thoughts.length; i++) {
      const thought = session.thoughts[i];
      const modeName = this.formatModeName(thought.mode);

      // Thought generation
      interactions.push({
        from: modeName,
        to: 'System',
        message: `Thought ${thought.thoughtNumber}: ${this.truncate(thought.content, 40)}`,
        type: 'solid',
      });

      // Check for revisions
      if (thought.isRevision) {
        interactions.push({
          from: 'System',
          to: modeName,
          message: 'Revision requested',
          type: 'dotted',
        });

        interactions.push({
          from: modeName,
          to: 'System',
          message: `Revised: ${this.truncate(thought.content, 30)}`,
          type: 'solid',
        });
      }

      // Check for branch points
      if (thought.branchId) {
        interactions.push({
          from: 'System',
          to: modeName,
          message: `Branch: ${thought.branchId}`,
          type: 'dotted',
        });
      }

      // Check for dependencies
      if (thought.dependencies && thought.dependencies.length > 0) {
        for (const depId of thought.dependencies) {
          interactions.push({
            from: modeName,
            to: 'System',
            message: `Depends on ${depId}`,
            type: 'dotted',
          });
        }
      }

      // Next thought decision
      if (thought.nextThoughtNeeded && i < session.thoughts.length - 1) {
        const nextThought = session.thoughts[i + 1];
        const nextMode = this.formatModeName(nextThought.mode);

        if (nextMode !== modeName) {
          // Mode switch
          interactions.push({
            from: 'System',
            to: nextMode,
            message: 'Switch mode',
            type: 'dotted',
            activate: true,
          });
        } else {
          interactions.push({
            from: modeName,
            to: 'System',
            message: 'Continue reasoning',
            type: 'dotted',
          });
        }
      }
    }

    // Session completion
    const finalMode = this.formatModeName(session.thoughts[session.thoughts.length - 1].mode);
    interactions.push({
      from: finalMode,
      to: 'System',
      message: 'Reasoning complete',
      type: 'solid',
    });

    interactions.push({
      from: 'System',
      to: 'User',
      message: `Session complete (${session.thoughts.length} thoughts)`,
      type: 'solid',
    });

    return interactions;
  }

  /**
   * Generate detailed thought progression flowchart
   */
  generateDetailedFlowchart(session: ThinkingSession): string {
    this.generator = new MermaidGenerator({ type: 'flowchart', direction: 'TB' });

    const nodes = this.buildFlowchartNodes(session);
    const edges = this.buildFlowchartEdges(session);

    return this.generator.generateFlowchart(nodes, edges);
  }

  /**
   * Build flowchart nodes from thoughts
   */
  private buildFlowchartNodes(session: ThinkingSession): any[] {
    const nodes: any[] = [];

    // Start node
    nodes.push({
      id: 'start',
      label: 'Start Session',
      shape: 'stadium',
      cssClass: 'startNode',
    });

    // Thought nodes
    for (const thought of session.thoughts) {
      const nodeId = `thought_${thought.thoughtNumber}`;

      let shape: string;
      if (thought.isRevision) {
        shape = 'hexagon';
      } else if (thought.branchId) {
        shape = 'diamond';
      } else {
        shape = 'rectangle';
      }

      nodes.push({
        id: nodeId,
        label: `T${thought.thoughtNumber}: ${this.formatModeName(thought.mode)}`,
        shape,
        cssClass: this.getModeClass(thought.mode),
        tooltip: this.truncate(thought.content, 100),
      });
    }

    // End node
    nodes.push({
      id: 'end',
      label: session.isComplete ? 'Complete' : 'In Progress',
      shape: 'stadium',
      cssClass: session.isComplete ? 'endNode' : 'progressNode',
    });

    return nodes;
  }

  /**
   * Build flowchart edges from thought relationships
   */
  private buildFlowchartEdges(session: ThinkingSession): any[] {
    const edges: any[] = [];

    // Connect start to first thought
    if (session.thoughts.length > 0) {
      edges.push({
        from: 'start',
        to: `thought_${session.thoughts[0].thoughtNumber}`,
        label: 'Initialize',
        type: 'solid',
      });
    }

    // Connect thoughts sequentially
    for (let i = 0; i < session.thoughts.length - 1; i++) {
      const current = session.thoughts[i];
      const next = session.thoughts[i + 1];

      const edgeType = current.nextThoughtNeeded ? 'solid' : 'dotted';
      const label = next.isRevision ? 'Revise' : next.branchId ? 'Branch' : '';

      edges.push({
        from: `thought_${current.thoughtNumber}`,
        to: `thought_${next.thoughtNumber}`,
        label,
        type: edgeType,
      });
    }

    // Add dependency edges
    for (const thought of session.thoughts) {
      if (thought.dependencies && thought.dependencies.length > 0) {
        for (const depId of thought.dependencies) {
          edges.push({
            from: depId,
            to: `thought_${thought.thoughtNumber}`,
            label: 'depends on',
            type: 'dotted',
            thickness: 'normal',
          });
        }
      }
    }

    // Connect last thought to end
    if (session.thoughts.length > 0) {
      const lastThought = session.thoughts[session.thoughts.length - 1];
      edges.push({
        from: `thought_${lastThought.thoughtNumber}`,
        to: 'end',
        label: session.isComplete ? 'Finish' : 'Pause',
        type: 'solid',
      });
    }

    return edges;
  }

  /**
   * Generate timeline diagram showing thought progression over time
   */
  generateTimelineDiagram(session: ThinkingSession): string {
    const title = `Thinking Timeline: ${session.title}`;
    const tasks: any[] = [];

    for (const thought of session.thoughts) {
      const duration = this.estimateThoughtDuration(thought, session);

      tasks.push({
        id: `t${thought.thoughtNumber}`,
        name: `T${thought.thoughtNumber}: ${this.formatModeName(thought.mode)}`,
        section: this.formatModeName(thought.mode),
        status: 'done',
        startDate: this.formatDate(thought.timestamp),
        duration: `${duration}d`,
      });
    }

    return this.generator.generateGantt(title, tasks);
  }

  /**
   * Estimate thought duration for timeline
   */
  private estimateThoughtDuration(thought: Thought, session: ThinkingSession): number {
    // Find next thought timestamp to calculate duration
    const thoughtIndex = session.thoughts.findIndex(t => t.id === thought.id);
    if (thoughtIndex < session.thoughts.length - 1) {
      const nextThought = session.thoughts[thoughtIndex + 1];
      const diffMs = nextThought.timestamp.getTime() - thought.timestamp.getTime();
      const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      return diffDays;
    }

    return 1; // Default duration
  }

  /**
   * Generate comprehensive thought flow report
   */
  generateFlowReport(session: ThinkingSession): string {
    const report: string[] = [];

    report.push('# Thought Flow Analysis');
    report.push('');
    report.push(`**Session:** ${session.title}`);
    report.push(`**Mode:** ${this.formatModeName(session.mode)}`);
    report.push(`**Total Thoughts:** ${session.thoughts.length}`);
    report.push('');

    // Flow statistics
    const revisions = session.thoughts.filter(t => t.isRevision).length;
    const branches = session.thoughts.filter(t => t.branchId).length;
    const modesUsed = new Set(session.thoughts.map(t => t.mode)).size;

    report.push('## Flow Statistics');
    report.push(`- **Revisions:** ${revisions}`);
    report.push(`- **Branches:** ${branches}`);
    report.push(`- **Modes Used:** ${modesUsed}`);
    report.push(`- **Completion:** ${session.isComplete ? 'Complete' : 'In Progress'}`);
    report.push('');

    // Thought progression
    report.push('## Thought Progression');
    for (const thought of session.thoughts) {
      const prefix = thought.isRevision ? '🔄' : thought.branchId ? '🌿' : '→';
      const mode = this.formatModeName(thought.mode);
      report.push(`${prefix} **T${thought.thoughtNumber}** [${mode}]: ${this.truncate(thought.content, 60)}`);

      if (thought.dependencies && thought.dependencies.length > 0) {
        report.push(`  ↳ Depends on: ${thought.dependencies.join(', ')}`);
      }
    }

    report.push('');

    // Mode distribution
    report.push('## Mode Distribution');
    const modeCount = new Map<string, number>();
    for (const thought of session.thoughts) {
      const mode = this.formatModeName(thought.mode);
      modeCount.set(mode, (modeCount.get(mode) || 0) + 1);
    }

    for (const [mode, count] of modeCount) {
      const percentage = ((count / session.thoughts.length) * 100).toFixed(1);
      report.push(`- **${mode}:** ${count} thoughts (${percentage}%)`);
    }

    return report.join('\n');
  }

  /**
   * Format mode name for display
   */
  private formatModeName(mode: string): string {
    return mode.charAt(0).toUpperCase() + mode.slice(1).replace(/_/g, ' ');
  }

  /**
   * Get CSS class for mode
   */
  private getModeClass(mode: string): string {
    const classMap: Record<string, string> = {
      sequential: 'modeSequential',
      shannon: 'modeShannon',
      mathematics: 'modeMath',
      physics: 'modePhysics',
      causal: 'modeCausal',
      bayesian: 'modeBayesian',
      temporal: 'modeTemporal',
      gametheory: 'modeGame',
      evidential: 'modeEvidential',
      firstprinciple: 'modeFirstPrinciple',
    };

    return classMap[mode] || 'modeDefault';
  }

  /**
   * Truncate text to specified length
   */
  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Format date for Gantt chart
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Create interactive thought flow HTML page
 */
export function createThoughtFlowPage(session: ThinkingSession): string {
  const visualizer = new ThoughtFlowVisualizer();

  const sequenceDiagram = visualizer.generateThoughtFlowDiagram(session);
  const flowchart = visualizer.generateDetailedFlowchart(session);
  const timeline = visualizer.generateTimelineDiagram(session);
  const report = visualizer.generateFlowReport(session);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thought Flow: ${session.title}</title>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
  </script>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1600px;
      margin: 0 auto;
    }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    .diagram-section {
      background: white;
      margin: 20px 0;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .mermaid {
      text-align: center;
      padding: 20px;
    }
    .report {
      background: #f9f9f9;
      padding: 20px;
      border-left: 4px solid #4CAF50;
      font-family: monospace;
      white-space: pre-wrap;
    }
    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    .tab {
      padding: 10px 20px;
      background: #ddd;
      border: none;
      border-radius: 5px 5px 0 0;
      cursor: pointer;
      transition: background 0.3s;
    }
    .tab.active {
      background: white;
      border-bottom: 3px solid #4CAF50;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Thought Flow Analysis: ${session.title}</h1>

    <div class="tabs">
      <button class="tab active" onclick="showTab('sequence')">Sequence Diagram</button>
      <button class="tab" onclick="showTab('flowchart')">Flowchart</button>
      <button class="tab" onclick="showTab('timeline')">Timeline</button>
      <button class="tab" onclick="showTab('report')">Report</button>
    </div>

    <div id="sequence" class="tab-content active">
      <div class="diagram-section">
        <h2>Thought Progression Sequence</h2>
        <div class="mermaid">
${sequenceDiagram}
        </div>
      </div>
    </div>

    <div id="flowchart" class="tab-content">
      <div class="diagram-section">
        <h2>Detailed Thought Flowchart</h2>
        <div class="mermaid">
${flowchart}
        </div>
      </div>
    </div>

    <div id="timeline" class="tab-content">
      <div class="diagram-section">
        <h2>Timeline View</h2>
        <div class="mermaid">
${timeline}
        </div>
      </div>
    </div>

    <div id="report" class="tab-content">
      <div class="diagram-section">
        <h2>Flow Analysis Report</h2>
        <div class="report">${report}</div>
      </div>
    </div>
  </div>

  <script>
    function showTab(tabName) {
      // Hide all tabs
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });

      // Show selected tab
      document.getElementById(tabName).classList.add('active');
      event.target.classList.add('active');
    }
  </script>
</body>
</html>`;
}
