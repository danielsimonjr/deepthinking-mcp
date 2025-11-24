/**
 * Reasoning State Chart Diagrams (v3.3.0)
 * Phase 4B Task 3.4: State machine visualizations for reasoning modes
 */

import type { ThinkingSession } from '../types/session.js';
import type { Thought } from '../types/index.js';
import { MermaidGenerator, type StateNode, type StateTransition } from './mermaid.js';

/**
 * State chart generator for reasoning processes
 */
export class ReasoningStateChart {
  private generator: MermaidGenerator;

  constructor() {
    this.generator = new MermaidGenerator({ type: 'stateDiagram' });
  }

  /**
   * Generate state diagram from thinking session
   */
  generateSessionStateDiagram(session: ThinkingSession): string {
    const states = this.extractStates(session);
    const transitions = this.extractTransitions(session);

    return this.generator.generateStateDiagram(states, transitions);
  }

  /**
   * Extract states from session
   */
  private extractStates(session: ThinkingSession): StateNode[] {
    const states: StateNode[] = [];

    // Start state
    states.push({
      id: 'Init',
      label: 'Initialize',
      type: 'start',
    });

    // Mode states
    const modesUsed = new Set(session.thoughts.map(t => t.mode));
    for (const mode of modesUsed) {
      const stateId = this.getModeStateId(mode);
      states.push({
        id: stateId,
        label: this.formatModeName(mode),
        type: 'normal',
        description: `Active reasoning in ${this.formatModeName(mode)} mode`,
      });
    }

    // Special states for revisions and branches
    if (session.thoughts.some(t => t.isRevision)) {
      states.push({
        id: 'Revising',
        label: 'Revising',
        type: 'normal',
        description: 'Reconsidering previous thoughts',
      });
    }

    if (session.thoughts.some(t => (t as any).branchId)) {
      states.push({
        id: 'Branching',
        label: 'Branching',
        type: 'normal',
        description: 'Exploring alternative reasoning paths',
      });
    }

    // End states
    if (session.isComplete) {
      states.push({
        id: 'Complete',
        label: 'Complete',
        type: 'end',
      });
    } else {
      states.push({
        id: 'Paused',
        label: 'Paused',
        type: 'normal',
        description: 'Session in progress',
      });
    }

    return states;
  }

  /**
   * Extract state transitions from session
   */
  private extractTransitions(session: ThinkingSession): StateTransition[] {
    const transitions: StateTransition[] = [];

    if (session.thoughts.length === 0) {
      return transitions;
    }

    // Initial transition
    const firstMode = this.getModeStateId(session.thoughts[0].mode);
    transitions.push({
      from: 'Init',
      to: firstMode,
      condition: 'Start reasoning',
    });

    // Process thought transitions
    for (let i = 0; i < session.thoughts.length - 1; i++) {
      const current = session.thoughts[i];
      const next = session.thoughts[i + 1];

      const fromState = this.getModeStateId(current.mode);
      let toState = this.getModeStateId(next.mode);

      // Handle revisions
      if (next.isRevision) {
        transitions.push({
          from: fromState,
          to: 'Revising',
          condition: `Revise thought ${next.revisesThought}`,
        });

        transitions.push({
          from: 'Revising',
          to: toState,
          condition: 'Revision complete',
        });
      }
      // Handle branches
      else if ((next as any).branchId) {
        transitions.push({
          from: fromState,
          to: 'Branching',
          condition: `Branch: ${(next as any).branchId}`,
        });

        transitions.push({
          from: 'Branching',
          to: toState,
          condition: 'Explore branch',
        });
      }
      // Normal transition
      else {
        const condition = fromState === toState ? 'Continue' : 'Switch mode';
        transitions.push({
          from: fromState,
          to: toState,
          condition,
        });
      }
    }

    // Final transition
    const lastMode = this.getModeStateId(session.thoughts[session.thoughts.length - 1].mode);
    const endState = session.isComplete ? 'Complete' : 'Paused';
    transitions.push({
      from: lastMode,
      to: endState,
      condition: session.isComplete ? 'Finish' : 'Pause',
    });

    return transitions;
  }

  /**
   * Generate comprehensive mode transition diagram
   */
  generateModeTransitionDiagram(session: ThinkingSession): string {
    const lines: string[] = [];

    lines.push('%%{init: {\'theme\':\'default\'}}%%');
    lines.push('stateDiagram-v2');
    lines.push('');

    // Define all possible modes
    const allModes = ['sequential', 'shannon', 'mathematics', 'physics', 'hybrid',
                     'abductive', 'causal', 'bayesian', 'counterfactual', 'analogical',
                     'temporal', 'gametheory', 'evidential', 'firstprinciple'];

    // Track modes used in session
    const modesUsed = new Set(session.thoughts.map(t => t.mode));

    // Add state definitions
    for (const mode of allModes) {
      const stateId = this.getModeStateId(mode);
      const label = this.formatModeName(mode);
      const used = modesUsed.has(mode as any);

      lines.push(`  state "${label}" as ${stateId} {`);
      if (used) {
        lines.push(`    note right: ${this.getModeCount(session, mode)} thoughts`);
      } else {
        lines.push(`    note right: Not used`);
      }
      lines.push(`  }`);
    }

    lines.push('');

    // Add transitions based on actual mode switches
    const modeTransitions = this.analyzeModeTransitions(session);
    for (const [from, toList] of modeTransitions) {
      for (const to of toList) {
        const fromId = this.getModeStateId(from);
        const toId = this.getModeStateId(to);
        lines.push(`  ${fromId} --> ${toId}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Analyze mode transitions in session
   */
  private analyzeModeTransitions(session: ThinkingSession): Map<string, Set<string>> {
    const transitions = new Map<string, Set<string>>();

    for (let i = 0; i < session.thoughts.length - 1; i++) {
      const from = session.thoughts[i].mode;
      const to = session.thoughts[i + 1].mode;

      if (from !== to) {
        if (!transitions.has(from)) {
          transitions.set(from, new Set());
        }
        transitions.get(from)!.add(to);
      }
    }

    return transitions;
  }

  /**
   * Get count of thoughts for a specific mode
   */
  private getModeCount(session: ThinkingSession, mode: string): number {
    return session.thoughts.filter(t => t.mode === mode).length;
  }

  /**
   * Generate thought-level state diagram (micro view)
   */
  generateThoughtStateDiagram(thought: Thought): string {
    const lines: string[] = [];

    lines.push('%%{init: {\'theme\':\'default\'}}%%');
    lines.push('stateDiagram-v2');
    lines.push('');

    // Thought lifecycle states
    lines.push('  [*] --> Created');
    lines.push('  Created --> Processing: Initialize');
    lines.push('  Processing --> Evaluating: Generate content');
    lines.push('  Evaluating --> Valid: Passes validation');
    lines.push('  Evaluating --> Revising: Needs revision');
    lines.push('  Revising --> Processing: Revise content');
    lines.push('  Valid --> Branching: Explore alternatives');
    lines.push('  Branching --> Processing: New branch');
    lines.push('  Valid --> Complete: Finalize');
    lines.push('  Complete --> [*]');

    lines.push('');

    // Add current state annotation
    if (thought.isRevision) {
      lines.push('  note right of Revising: Current thought is revision');
    } else if ((thought as any).branchId) {
      lines.push('  note right of Branching: Current thought is branch');
    } else {
      lines.push('  note right of Complete: Thought complete');
    }

    return lines.join('\n');
  }

  /**
   * Generate mode decision tree
   */
  generateModeDecisionTree(): string {
    const lines: string[] = [];

    lines.push('%%{init: {\'theme\':\'forest\'}}%%');
    lines.push('graph TD');
    lines.push('');

    lines.push('  Start[Start Reasoning]');
    lines.push('  Start --> Q1{Need formal<br/>proof?}');
    lines.push('  Q1 -->|Yes| Math[Mathematics Mode]');
    lines.push('  Q1 -->|No| Q2{Analyzing<br/>cause-effect?}');
    lines.push('  Q2 -->|Yes| Causal[Causal Mode]');
    lines.push('  Q2 -->|No| Q3{Updating<br/>beliefs?}');
    lines.push('  Q3 -->|Yes| Bayesian[Bayesian Mode]');
    lines.push('  Q3 -->|No| Q4{Time-based<br/>analysis?}');
    lines.push('  Q4 -->|Yes| Temporal[Temporal Mode]');
    lines.push('  Q4 -->|No| Q5{Strategic<br/>interaction?}');
    lines.push('  Q5 -->|Yes| Game[Game Theory Mode]');
    lines.push('  Q5 -->|No| Q6{Uncertain<br/>evidence?}');
    lines.push('  Q6 -->|Yes| Evidential[Evidential Mode]');
    lines.push('  Q6 -->|No| Q7{Cross-domain<br/>patterns?}');
    lines.push('  Q7 -->|Yes| Analogical[Analogical Mode]');
    lines.push('  Q7 -->|No| Q8{Fundamental<br/>principles?}');
    lines.push('  Q8 -->|Yes| FirstP[First Principles Mode]');
    lines.push('  Q8 -->|No| Sequential[Sequential Mode]');

    lines.push('');

    // Add styling
    lines.push('  style Math fill:#e1f5ff');
    lines.push('  style Causal fill:#ffe1e1');
    lines.push('  style Bayesian fill:#e1ffe1');
    lines.push('  style Temporal fill:#fff3e1');
    lines.push('  style Game fill:#f3e1ff');
    lines.push('  style Evidential fill:#e1ffff');
    lines.push('  style Analogical fill:#ffe1ff');
    lines.push('  style FirstP fill:#ffffe1');
    lines.push('  style Sequential fill:#e1e1e1');

    return lines.join('\n');
  }

  /**
   * Generate complete state chart HTML page
   */
  generateStateChartPage(session: ThinkingSession): string {
    const sessionDiagram = this.generateSessionStateDiagram(session);
    const modeDiagram = this.generateModeTransitionDiagram(session);
    const decisionTree = this.generateModeDecisionTree();

    // Generate thought state examples
    const exampleThoughts = session.thoughts.slice(0, 3);
    const thoughtDiagrams = exampleThoughts.map(t =>
      `<div class="diagram-section">
        <h3>Thought ${t.thoughtNumber} State Lifecycle</h3>
        <div class="mermaid">
${this.generateThoughtStateDiagram(t)}
        </div>
      </div>`
    ).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>State Charts: ${session.title}</title>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
  </script>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      max-width: 1600px;
      margin: 0 auto;
    }
    h1 {
      color: white;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      margin-bottom: 30px;
    }
    h2 {
      color: #333;
      border-left: 4px solid #667eea;
      padding-left: 15px;
      margin-top: 0;
    }
    .diagram-section {
      background: white;
      margin: 20px 0;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .mermaid {
      text-align: center;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
      margin: 15px 0;
    }
    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 0;
    }
    .tab {
      padding: 12px 24px;
      background: rgba(255,255,255,0.7);
      border: none;
      border-radius: 8px 8px 0 0;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
      color: #333;
    }
    .tab.active {
      background: white;
      box-shadow: 0 -3px 10px rgba(0,0,0,0.1);
    }
    .tab:hover {
      background: rgba(255,255,255,0.9);
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
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
      border-radius: 8px;
      text-align: center;
    }
    .stat-value {
      font-size: 36px;
      font-weight: bold;
      margin: 10px 0;
    }
    .stat-label {
      font-size: 14px;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔄 Reasoning State Charts: ${session.title}</h1>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">Total Thoughts</div>
        <div class="stat-value">${session.thoughts.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Modes Used</div>
        <div class="stat-value">${new Set(session.thoughts.map(t => t.mode)).size}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Revisions</div>
        <div class="stat-value">${session.thoughts.filter(t => t.isRevision).length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Branches</div>
        <div class="stat-value">${session.thoughts.filter(t => (t as any).branchId).length}</div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab active" onclick="showTab('session')">Session States</button>
      <button class="tab" onclick="showTab('modes')">Mode Transitions</button>
      <button class="tab" onclick="showTab('decision')">Decision Tree</button>
      <button class="tab" onclick="showTab('thoughts')">Thought States</button>
    </div>

    <div id="session" class="tab-content active">
      <div class="diagram-section">
        <h2>Session State Diagram</h2>
        <p>This diagram shows the high-level state transitions during the reasoning session.</p>
        <div class="mermaid">
${sessionDiagram}
        </div>
      </div>
    </div>

    <div id="modes" class="tab-content">
      <div class="diagram-section">
        <h2>Mode Transition Network</h2>
        <p>Visualizes all possible reasoning modes and the transitions that occurred in this session.</p>
        <div class="mermaid">
${modeDiagram}
        </div>
      </div>
    </div>

    <div id="decision" class="tab-content">
      <div class="diagram-section">
        <h2>Mode Selection Decision Tree</h2>
        <p>A decision tree showing how to select the appropriate reasoning mode for different problem types.</p>
        <div class="mermaid">
${decisionTree}
        </div>
      </div>
    </div>

    <div id="thoughts" class="tab-content">
      <div class="diagram-section">
        <h2>Individual Thought State Lifecycles</h2>
        <p>Each thought goes through its own state lifecycle from creation to completion.</p>
        ${thoughtDiagrams}
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
   * Get mode state ID
   */
  private getModeStateId(mode: string): string {
    return `Mode${mode.charAt(0).toUpperCase()}${mode.slice(1)}`;
  }

  /**
   * Format mode name for display
   */
  private formatModeName(mode: string): string {
    return mode.charAt(0).toUpperCase() + mode.slice(1).replace(/_/g, ' ');
  }
}
