/**
 * Reasoning State Chart Diagrams (v3.4.0)
 * Phase 4B Task 3.4: Add reasoning state chart diagrams
 *
 * Generates state diagrams showing reasoning states and transitions
 */

import type { ThinkingSession, Thought } from '../types/index.js';
import { MermaidGenerator } from './mermaid-generator.js';

/**
 * Reasoning state
 */
export type ReasoningState =
  | 'initializing' // Starting state
  | 'exploring' // Exploring solution space
  | 'analyzing' // Analyzing information
  | 'hypothesizing' // Forming hypotheses
  | 'validating' // Validating conclusions
  | 'revising' // Revising approach
  | 'converging' // Converging to solution
  | 'completed' // Final state
  | 'stalled' // Progress stalled
  | 'branching'; // Creating alternative paths

/**
 * State transition trigger
 */
export type TransitionTrigger =
  | 'insight' // New insight gained
  | 'evidence' // New evidence found
  | 'contradiction' // Contradiction detected
  | 'uncertainty' // High uncertainty
  | 'completion' // Task completed
  | 'iteration' // Iterative refinement
  | 'mode_switch' // Reasoning mode changed
  | 'revision_needed'; // Revision required

/**
 * Reasoning state info
 */
export interface ReasoningStateInfo {
  state: ReasoningState;
  thoughtNumbers: number[];
  duration: number; // Number of thoughts in this state
  entryCondition?: string;
  exitCondition?: string;
  actions?: string[];
}

/**
 * State transition
 */
export interface StateTransition {
  from: ReasoningState;
  to: ReasoningState;
  trigger: TransitionTrigger;
  thoughtNumber: number;
  condition?: string;
  probability?: number; // For probabilistic transitions
}

/**
 * State machine
 */
export interface StateMachine {
  states: Map<ReasoningState, ReasoningStateInfo>;
  transitions: StateTransition[];
  currentState: ReasoningState;
  initialState: ReasoningState;
  finalStates: ReasoningState[];
}

/**
 * State chart diagram generator
 */
export class StateChartDiagramGenerator {
  private mermaidGenerator: MermaidGenerator;

  constructor() {
    this.mermaidGenerator = new MermaidGenerator();
  }

  /**
   * Analyze session and extract state machine
   */
  analyzeStateMachine(session: ThinkingSession): StateMachine {
    const states = new Map<ReasoningState, ReasoningStateInfo>();
    const transitions: StateTransition[] = [];

    let currentState: ReasoningState = 'initializing';
    const initialState: ReasoningState = 'initializing';
    const finalStates: ReasoningState[] = ['completed'];

    // Track state info
    const stateThoughts = new Map<ReasoningState, number[]>();

    // Analyze each thought
    for (let i = 0; i < session.thoughts.length; i++) {
      const thought = session.thoughts[i];
      const nextThought = session.thoughts[i + 1];

      const thoughtState = this.determineState(thought, i, session.thoughts.length);

      // Track thoughts in this state
      if (!stateThoughts.has(thoughtState)) {
        stateThoughts.set(thoughtState, []);
      }
      stateThoughts.get(thoughtState)!.push(thought.thoughtNumber);

      // State transition
      if (nextThought) {
        const nextState = this.determineState(nextThought, i + 1, session.thoughts.length);

        if (nextState !== thoughtState) {
          const trigger = this.determineTrigger(thought, nextThought);
          transitions.push({
            from: thoughtState,
            to: nextState,
            trigger,
            thoughtNumber: nextThought.thoughtNumber,
          });
        }
      }

      currentState = thoughtState;
    }

    // Build state info
    for (const [state, thoughts] of stateThoughts) {
      states.set(state, {
        state,
        thoughtNumbers: thoughts,
        duration: thoughts.length,
        entryCondition: this.getEntryCondition(state),
        exitCondition: this.getExitCondition(state),
        actions: this.getStateActions(state),
      });
    }

    return {
      states,
      transitions,
      currentState,
      initialState,
      finalStates,
    };
  }

  /**
   * Determine reasoning state from thought
   */
  private determineState(thought: Thought, index: number, total: number): ReasoningState {
    // First thought
    if (index === 0) {
      return 'initializing';
    }

    // Last thought
    if (index === total - 1 && !thought.nextThoughtNeeded) {
      return 'completed';
    }

    // Check for revision
    if ('isRevision' in thought && thought.isRevision) {
      return 'revising';
    }

    // Check for branching
    if ('branchId' in thought && thought.branchId) {
      return 'branching';
    }

    // Check uncertainty
    if ('uncertainty' in thought && typeof thought.uncertainty === 'number') {
      if (thought.uncertainty > 0.7) {
        return 'exploring';
      }
    }

    // Check if needs more thoughts (stalled or iterating)
    if ('needsMoreThoughts' in thought && thought.needsMoreThoughts) {
      if (thought.thoughtNumber > total * 0.8) {
        return 'stalled';
      }
      return 'converging';
    }

    // Determine by mode and position
    switch (thought.mode) {
      case 'abductive':
      case 'analogical':
        return 'hypothesizing';

      case 'sequential':
      case 'shannon':
        if (index < total * 0.3) {
          return 'exploring';
        } else if (index < total * 0.7) {
          return 'analyzing';
        }
        return 'converging';

      case 'mathematics':
      case 'physics':
        return 'validating';

      case 'bayesian':
      case 'causal':
        return 'analyzing';

      default:
        if (index < total * 0.5) {
          return 'exploring';
        }
        return 'analyzing';
    }
  }

  /**
   * Determine transition trigger
   */
  private determineTrigger(current: Thought, next: Thought): TransitionTrigger {
    // Mode changed
    if (current.mode !== next.mode) {
      return 'mode_switch';
    }

    // Revision
    if ('isRevision' in next && next.isRevision) {
      return 'revision_needed';
    }

    // Check uncertainty changes
    if ('uncertainty' in current && 'uncertainty' in next &&
        typeof current.uncertainty === 'number' && typeof next.uncertainty === 'number') {
      if (Math.abs(current.uncertainty - next.uncertainty) > 0.3) {
        return 'uncertainty';
      }
    }

    // Completion
    if (!next.nextThoughtNeeded) {
      return 'completion';
    }

    // Default to iteration
    return 'iteration';
  }

  /**
   * Get entry condition for state
   */
  private getEntryCondition(state: ReasoningState): string {
    const conditions: Record<ReasoningState, string> = {
      initializing: 'Session started',
      exploring: 'Low confidence or early stage',
      analyzing: 'Data collected, analysis mode',
      hypothesizing: 'Generating explanations',
      validating: 'Testing hypotheses',
      revising: 'Error detected or revision needed',
      converging: 'Approaching solution',
      completed: 'Solution found and validated',
      stalled: 'Progress blocked',
      branching: 'Exploring alternatives',
    };
    return conditions[state];
  }

  /**
   * Get exit condition for state
   */
  private getExitCondition(state: ReasoningState): string {
    const conditions: Record<ReasoningState, string> = {
      initializing: 'Problem defined',
      exploring: 'Sufficient information gathered',
      analyzing: 'Analysis complete',
      hypothesizing: 'Hypothesis formed',
      validating: 'Validation complete',
      revising: 'Revision applied',
      converging: 'Solution validated',
      completed: 'N/A',
      stalled: 'Unstuck',
      branching: 'Branch evaluated',
    };
    return conditions[state];
  }

  /**
   * Get actions for state
   */
  private getStateActions(state: ReasoningState): string[] {
    const actions: Record<ReasoningState, string[]> = {
      initializing: ['Define problem', 'Set objectives', 'Choose mode'],
      exploring: ['Gather information', 'Explore solution space', 'Generate ideas'],
      analyzing: ['Process data', 'Identify patterns', 'Build models'],
      hypothesizing: ['Form hypotheses', 'Generate explanations', 'Make predictions'],
      validating: ['Test hypotheses', 'Check consistency', 'Verify results'],
      revising: ['Identify errors', 'Adjust approach', 'Refine solution'],
      converging: ['Synthesize findings', 'Refine solution', 'Optimize'],
      completed: ['Document results', 'Summarize findings'],
      stalled: ['Seek new information', 'Try alternative approach'],
      branching: ['Explore alternative', 'Evaluate branch', 'Compare paths'],
    };
    return actions[state];
  }

  /**
   * Generate state diagram
   */
  generateStateDiagram(session: ThinkingSession): string {
    const machine = this.analyzeStateMachine(session);

    const states: Array<{ id: string; label?: string }> = [];
    const transitions: Array<{ from: string; to: string; label?: string }> = [];

    // Add states
    for (const [state, info] of machine.states) {
      states.push({
        id: state,
        label: `${state}\\n(${info.duration} thoughts)`,
      });
    }

    // Add transitions
    for (const transition of machine.transitions) {
      transitions.push({
        from: transition.from,
        to: transition.to,
        label: `${transition.trigger}\\n(T${transition.thoughtNumber})`,
      });
    }

    return this.mermaidGenerator.generateStateDiagram(states, transitions);
  }

  /**
   * Generate enhanced state diagram with nested states
   */
  generateEnhancedStateDiagram(session: ThinkingSession): string {
    const machine = this.analyzeStateMachine(session);

    const lines: string[] = [];

    lines.push('%%{init: { \'theme\': \'default\' }}%%');
    lines.push('stateDiagram-v2');
    lines.push('  [*] --> initializing');

    // Add states with descriptions
    for (const [state, info] of machine.states) {
      lines.push(`  ${state}: ${state}\\n${info.duration} thoughts`);

      // Add nested actions
      if (info.actions && info.actions.length > 0) {
        lines.push(`  state ${state} {`);
        for (const action of info.actions.slice(0, 3)) {
          lines.push(`    [*] --> ${action.replace(/\s+/g, '_')}`);
        }
        lines.push('  }');
      }
    }

    // Add transitions
    for (const transition of machine.transitions) {
      const label = `${transition.trigger} (T${transition.thoughtNumber})`;
      lines.push(`  ${transition.from} --> ${transition.to}: ${label}`);
    }

    // End state
    if (machine.states.has('completed')) {
      lines.push('  completed --> [*]');
    }

    return lines.join('\n');
  }

  /**
   * Generate state transition table
   */
  generateTransitionTable(session: ThinkingSession): string {
    const machine = this.analyzeStateMachine(session);

    const report: string[] = [];

    report.push('# State Transition Table');
    report.push('');

    report.push('| From State | To State | Trigger | Thought # | Condition |');
    report.push('|------------|----------|---------|-----------|-----------|');

    for (const transition of machine.transitions) {
      const condition = transition.condition || 'N/A';
      report.push(
        `| ${transition.from} | ${transition.to} | ${transition.trigger} | T${transition.thoughtNumber} | ${condition} |`
      );
    }

    return report.join('\n');
  }

  /**
   * Generate state duration analysis
   */
  generateStateDurationAnalysis(session: ThinkingSession): string {
    const machine = this.analyzeStateMachine(session);

    const report: string[] = [];

    report.push('# State Duration Analysis');
    report.push('');

    // Sort states by duration
    const sortedStates = Array.from(machine.states.entries()).sort(
      (a, b) => b[1].duration - a[1].duration
    );

    report.push('## States by Duration');
    report.push('');

    for (const [state, info] of sortedStates) {
      const percentage = ((info.duration / session.thoughts.length) * 100).toFixed(1);
      report.push(`- **${state}**: ${info.duration} thoughts (${percentage}%)`);
      report.push(`  - Entry: ${info.entryCondition}`);
      report.push(`  - Exit: ${info.exitCondition}`);
      report.push('');
    }

    // State statistics
    report.push('## Statistics');
    report.push(`- **Total States:** ${machine.states.size}`);
    report.push(`- **Total Transitions:** ${machine.transitions.length}`);
    report.push(`- **Average State Duration:** ${(session.thoughts.length / machine.states.size).toFixed(1)} thoughts`);

    return report.join('\n');
  }

  /**
   * Generate state transition graph (for analysis)
   */
  generateTransitionGraph(session: ThinkingSession): string {
    const machine = this.analyzeStateMachine(session);

    const nodes = Array.from(machine.states.entries()).map(([state, info]) => ({
      id: state,
      label: `${state}\\n${info.duration}T`,
      shape: state === 'completed' ? 'stadium' as const : 'rounded' as const,
    }));

    const edges = machine.transitions.map(t => ({
      from: t.from,
      to: t.to,
      label: `${t.trigger}\\nT${t.thoughtNumber}`,
      type: 'arrow' as const,
    }));

    // Style classes by state type
    const styleClasses = [
      { name: 'initializing', fill: '#e3f2fd', stroke: '#1976d2', strokeWidth: '2px' },
      { name: 'exploring', fill: '#fff3e0', stroke: '#f57c00', strokeWidth: '2px' },
      { name: 'analyzing', fill: '#f3e5f5', stroke: '#7b1fa2', strokeWidth: '2px' },
      { name: 'converging', fill: '#e8f5e9', stroke: '#388e3c', strokeWidth: '2px' },
      { name: 'completed', fill: '#c8e6c9', stroke: '#2e7d32', strokeWidth: '3px' },
      { name: 'stalled', fill: '#ffebee', stroke: '#c62828', strokeWidth: '2px' },
    ];

    return this.mermaidGenerator.generateFlowchart(nodes, edges, 'TB', styleClasses);
  }

  /**
   * Generate all state diagrams
   */
  generateAllStateDiagrams(session: ThinkingSession): {
    basic: string;
    enhanced: string;
    transitionTable: string;
    durationAnalysis: string;
    transitionGraph: string;
  } {
    return {
      basic: this.generateStateDiagram(session),
      enhanced: this.generateEnhancedStateDiagram(session),
      transitionTable: this.generateTransitionTable(session),
      durationAnalysis: this.generateStateDurationAnalysis(session),
      transitionGraph: this.generateTransitionGraph(session),
    };
  }
}
