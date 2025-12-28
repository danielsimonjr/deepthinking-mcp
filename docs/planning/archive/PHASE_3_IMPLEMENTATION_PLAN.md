# DeepThinking MCP - Phase 3 Implementation Plan (v2.1 - v2.6)

## Overview

Phase 3 extends DeepThinking MCP with 3 new reasoning modes and critical infrastructure enhancements for visualization and specialized exports. This phase focuses on expanding reasoning capabilities while improving the user experience through visual representations and format compatibility.

**Timeline**: 6 weeks (v2.1 through v2.6)
**Total Effort**: ~180 hours

## Phase Breakdown

### Phase 3A: Temporal Reasoning (v2.1) - Weeks 1-2
**Effort**: 40 hours

### Phase 3B: Game-Theoretic Mode (v2.2) - Weeks 2-3
**Effort**: 35 hours

### Phase 3C: Evidential Reasoning Mode (v2.3) - Weeks 3-4
**Effort**: 30 hours

### Phase 3D: Mode Combination Recommendations (v2.4) - Week 4
**Effort**: 25 hours

### Phase 3E: Visual Output Formats (v2.5) - Week 5
**Effort**: 30 hours

### Phase 3F: Specialized Format Export (v2.6) - Week 6
**Effort**: 20 hours

---

## Feature 1: Temporal Reasoning Extensions (v2.1)

### Overview
Add temporal reasoning capabilities to track events, intervals, constraints, and causal relationships over time.

### Type Definitions

```typescript
// src/types/modes/temporal.ts

export interface TemporalThought extends BaseThought {
  mode: 'temporal';
  thoughtType:
    | 'event_definition'
    | 'interval_analysis'
    | 'temporal_constraint'
    | 'sequence_construction'
    | 'causality_timeline';

  timeline?: Timeline;
  events?: TemporalEvent[];
  intervals?: TimeInterval[];
  constraints?: TemporalConstraint[];
  relations?: TemporalRelation[];
}

export interface Timeline {
  id: string;
  name: string;
  timeUnit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years';
  startTime?: number;
  endTime?: number;
  events: string[]; // Event IDs
}

export interface TemporalEvent {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  duration?: number;
  type: 'instant' | 'interval';
  properties: Record<string, any>;
}

export interface TimeInterval {
  id: string;
  name: string;
  start: number;
  end: number;
  overlaps?: string[]; // IDs of overlapping intervals
  contains?: string[]; // IDs of contained intervals
}

export interface TemporalConstraint {
  id: string;
  type: 'before' | 'after' | 'during' | 'overlaps' | 'meets' | 'starts' | 'finishes' | 'equals';
  subject: string; // Event/Interval ID
  object: string; // Event/Interval ID
  confidence: number; // 0-1
}

export interface TemporalRelation {
  id: string;
  from: string; // Event ID
  to: string; // Event ID
  relationType: 'causes' | 'enables' | 'prevents' | 'precedes' | 'follows';
  strength: number; // 0-1
  delay?: number; // Time delay between events
}
```

### Validation

```typescript
// src/validation/modes/temporal.ts

export function validateTemporal(thought: TemporalThought): ValidationResult {
  const errors: string[] = [];

  // Validate timeline
  if (thought.timeline) {
    if (!thought.timeline.timeUnit) {
      errors.push('Timeline must specify timeUnit');
    }
    if (thought.timeline.startTime !== undefined &&
        thought.timeline.endTime !== undefined &&
        thought.timeline.startTime >= thought.timeline.endTime) {
      errors.push('Timeline startTime must be before endTime');
    }
  }

  // Validate events
  if (thought.events) {
    for (const event of thought.events) {
      if (event.type === 'interval' && !event.duration) {
        errors.push(`Interval event ${event.id} must have duration`);
      }
      if (event.timestamp < 0) {
        errors.push(`Event ${event.id} has negative timestamp`);
      }
    }
  }

  // Validate intervals
  if (thought.intervals) {
    for (const interval of thought.intervals) {
      if (interval.start >= interval.end) {
        errors.push(`Interval ${interval.id} start must be before end`);
      }
    }
  }

  // Validate constraints
  if (thought.constraints) {
    const eventIds = new Set(thought.events?.map(e => e.id) || []);
    const intervalIds = new Set(thought.intervals?.map(i => i.id) || []);

    for (const constraint of thought.constraints) {
      if (!eventIds.has(constraint.subject) && !intervalIds.has(constraint.subject)) {
        errors.push(`Constraint subject ${constraint.subject} not found`);
      }
      if (!eventIds.has(constraint.object) && !intervalIds.has(constraint.object)) {
        errors.push(`Constraint object ${constraint.object} not found`);
      }
      if (constraint.confidence < 0 || constraint.confidence > 1) {
        errors.push(`Constraint ${constraint.id} confidence must be 0-1`);
      }
    }
  }

  // Validate temporal relations
  if (thought.relations) {
    const eventIds = new Set(thought.events?.map(e => e.id) || []);

    for (const relation of thought.relations) {
      if (!eventIds.has(relation.from)) {
        errors.push(`Relation from event ${relation.from} not found`);
      }
      if (!eventIds.has(relation.to)) {
        errors.push(`Relation to event ${relation.to} not found`);
      }
      if (relation.strength < 0 || relation.strength > 1) {
        errors.push(`Relation ${relation.id} strength must be 0-1`);
      }
      if (relation.delay !== undefined && relation.delay < 0) {
        errors.push(`Relation ${relation.id} delay cannot be negative`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Use Cases
- Event sequencing and timeline construction
- Process modeling with temporal constraints
- Root cause analysis with temporal causality
- Performance debugging with event timelines
- Business process analysis

---

## Feature 2: Game-Theoretic Mode (v2.2)

### Overview
Add game-theoretic reasoning for strategic decision-making, equilibrium analysis, and multi-agent interactions.

### Type Definitions

```typescript
// src/types/modes/gametheory.ts

export interface GameTheoryThought extends BaseThought {
  mode: 'gametheory';
  thoughtType:
    | 'game_definition'
    | 'strategy_analysis'
    | 'equilibrium_computation'
    | 'payoff_evaluation'
    | 'mechanism_design';

  game?: Game;
  players?: Player[];
  strategies?: Strategy[];
  payoffs?: PayoffMatrix;
  equilibria?: Equilibrium[];
  analysis?: GameAnalysis;
}

export interface Game {
  id: string;
  name: string;
  type: 'normal-form' | 'extensive-form' | 'repeated' | 'cooperative' | 'Bayesian';
  players: string[]; // Player IDs
  informationStructure: 'perfect' | 'imperfect' | 'complete' | 'incomplete';
  simultaneousMoves: boolean;
}

export interface Player {
  id: string;
  name: string;
  type: 'rational' | 'bounded-rational' | 'adversarial' | 'cooperative';
  preferences?: Record<string, number>; // Outcome → utility
  beliefs?: Record<string, number>; // State → probability
}

export interface Strategy {
  id: string;
  playerId: string;
  name: string;
  description: string;
  type: 'pure' | 'mixed' | 'behavioral';
  actions: Action[];
  probability?: number; // For mixed strategies
}

export interface Action {
  id: string;
  name: string;
  description: string;
  conditions?: Record<string, any>;
}

export interface PayoffMatrix {
  dimensions: number; // Number of players
  entries: PayoffEntry[];
}

export interface PayoffEntry {
  strategyProfile: string[]; // Strategy ID for each player
  payoffs: number[]; // Payoff for each player
  probability?: number; // For stochastic outcomes
}

export interface Equilibrium {
  id: string;
  type: 'Nash' | 'subgame-perfect' | 'Bayesian-Nash' | 'correlated' | 'dominant-strategy';
  strategyProfile: string[]; // Strategy ID for each player
  payoffs: number[];
  stability: number; // 0-1, how stable the equilibrium is
  reasoning: string;
}

export interface GameAnalysis {
  dominantStrategies?: Record<string, string>; // Player ID → Strategy ID
  paretoOptimal?: string[]; // Strategy profile IDs
  socialWelfare?: number;
  efficiency?: number; // 0-1
  fairness?: number; // 0-1
  recommendations: string[];
}
```

### Validation

```typescript
// src/validation/modes/gametheory.ts

export function validateGameTheory(thought: GameTheoryThought): ValidationResult {
  const errors: string[] = [];

  // Validate game structure
  if (thought.game) {
    if (!thought.game.players || thought.game.players.length === 0) {
      errors.push('Game must have at least one player');
    }
  }

  // Validate players
  if (thought.players) {
    for (const player of thought.players) {
      if (player.beliefs) {
        const totalProb = Object.values(player.beliefs).reduce((a, b) => a + b, 0);
        if (Math.abs(totalProb - 1.0) > 0.01) {
          errors.push(`Player ${player.id} beliefs must sum to 1.0`);
        }
      }
    }
  }

  // Validate strategies
  if (thought.strategies) {
    const playerIds = new Set(thought.players?.map(p => p.id) || []);

    for (const strategy of thought.strategies) {
      if (!playerIds.has(strategy.playerId)) {
        errors.push(`Strategy ${strategy.id} references unknown player ${strategy.playerId}`);
      }
      if (strategy.type === 'mixed' && !strategy.probability) {
        errors.push(`Mixed strategy ${strategy.id} must have probability`);
      }
      if (strategy.probability !== undefined &&
          (strategy.probability < 0 || strategy.probability > 1)) {
        errors.push(`Strategy ${strategy.id} probability must be 0-1`);
      }
    }
  }

  // Validate payoff matrix
  if (thought.payoffs) {
    const numPlayers = thought.game?.players.length || 0;

    for (const entry of thought.payoffs.entries) {
      if (entry.strategyProfile.length !== numPlayers) {
        errors.push(`Payoff entry strategy profile must match number of players`);
      }
      if (entry.payoffs.length !== numPlayers) {
        errors.push(`Payoff entry must have payoff for each player`);
      }
      if (entry.probability !== undefined &&
          (entry.probability < 0 || entry.probability > 1)) {
        errors.push(`Payoff entry probability must be 0-1`);
      }
    }
  }

  // Validate equilibria
  if (thought.equilibria) {
    const numPlayers = thought.game?.players.length || 0;

    for (const eq of thought.equilibria) {
      if (eq.strategyProfile.length !== numPlayers) {
        errors.push(`Equilibrium ${eq.id} strategy profile must match number of players`);
      }
      if (eq.payoffs.length !== numPlayers) {
        errors.push(`Equilibrium ${eq.id} must have payoff for each player`);
      }
      if (eq.stability < 0 || eq.stability > 1) {
        errors.push(`Equilibrium ${eq.id} stability must be 0-1`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Use Cases
- Strategic business decisions
- Competitive analysis
- Auction and mechanism design
- Negotiation strategy
- Multi-agent system design

---

## Feature 3: Evidential Reasoning Mode (v2.3)

### Overview
Add evidential reasoning based on Dempster-Shafer theory for handling uncertainty with belief functions and evidence combination.

### Type Definitions

```typescript
// src/types/modes/evidential.ts

export interface EvidentialThought extends BaseThought {
  mode: 'evidential';
  thoughtType:
    | 'hypothesis_definition'
    | 'evidence_collection'
    | 'belief_assignment'
    | 'evidence_combination'
    | 'decision_analysis';

  frameOfDiscernment?: Set<string>; // All possible hypotheses
  hypotheses?: Hypothesis[];
  evidence?: Evidence[];
  beliefFunctions?: BeliefFunction[];
  combinedBelief?: BeliefFunction;
  plausibility?: PlausibilityFunction;
  decisions?: Decision[];
}

export interface Hypothesis {
  id: string;
  name: string;
  description: string;
  mutuallyExclusive: boolean;
  subsets?: string[]; // For composite hypotheses
}

export interface Evidence {
  id: string;
  description: string;
  source: string;
  reliability: number; // 0-1
  timestamp: number;
  supports: string[]; // Hypothesis IDs or subsets
  contradicts?: string[]; // Hypothesis IDs or subsets
}

export interface BeliefFunction {
  id: string;
  source: string; // Evidence ID or 'combined'
  massAssignments: MassAssignment[];
  conflictMass?: number; // Normalization factor
}

export interface MassAssignment {
  hypothesisSet: string[]; // Hypothesis IDs (singleton or composite)
  mass: number; // 0-1, basic probability assignment
  justification: string;
}

export interface PlausibilityFunction {
  id: string;
  assignments: PlausibilityAssignment[];
}

export interface PlausibilityAssignment {
  hypothesisSet: string[];
  plausibility: number; // 0-1
  belief: number; // 0-1
  uncertaintyInterval: [number, number]; // [belief, plausibility]
}

export interface Decision {
  id: string;
  name: string;
  selectedHypothesis: string[];
  confidence: number; // Based on belief/plausibility
  reasoning: string;
  alternatives: Alternative[];
}

export interface Alternative {
  hypothesis: string[];
  expectedUtility: number;
  risk: number;
}
```

### Validation

```typescript
// src/validation/modes/evidential.ts

export function validateEvidential(thought: EvidentialThought): ValidationResult {
  const errors: string[] = [];

  // Validate hypotheses
  if (thought.hypotheses) {
    const hypothesisIds = new Set(thought.hypotheses.map(h => h.id));

    for (const hypothesis of thought.hypotheses) {
      if (hypothesis.subsets) {
        for (const subset of hypothesis.subsets) {
          if (!hypothesisIds.has(subset)) {
            errors.push(`Hypothesis ${hypothesis.id} references unknown subset ${subset}`);
          }
        }
      }
    }
  }

  // Validate evidence
  if (thought.evidence) {
    const hypothesisIds = new Set(thought.hypotheses?.map(h => h.id) || []);

    for (const evidence of thought.evidence) {
      if (evidence.reliability < 0 || evidence.reliability > 1) {
        errors.push(`Evidence ${evidence.id} reliability must be 0-1`);
      }

      for (const hypId of evidence.supports) {
        if (!hypothesisIds.has(hypId) && hypId !== 'unknown') {
          errors.push(`Evidence ${evidence.id} supports unknown hypothesis ${hypId}`);
        }
      }
    }
  }

  // Validate belief functions
  if (thought.beliefFunctions) {
    for (const bf of thought.beliefFunctions) {
      let totalMass = 0;

      for (const ma of bf.massAssignments) {
        if (ma.mass < 0 || ma.mass > 1) {
          errors.push(`Mass assignment in ${bf.id} must be 0-1`);
        }
        totalMass += ma.mass;

        if (ma.hypothesisSet.length === 0) {
          errors.push(`Mass assignment in ${bf.id} must assign to at least one hypothesis`);
        }
      }

      // Allow small tolerance for floating point
      if (Math.abs(totalMass - 1.0) > 0.01) {
        errors.push(`Belief function ${bf.id} mass assignments must sum to 1.0 (got ${totalMass})`);
      }
    }
  }

  // Validate plausibility function
  if (thought.plausibility) {
    for (const pa of thought.plausibility.assignments) {
      if (pa.belief < 0 || pa.belief > 1) {
        errors.push(`Plausibility assignment belief must be 0-1`);
      }
      if (pa.plausibility < 0 || pa.plausibility > 1) {
        errors.push(`Plausibility assignment plausibility must be 0-1`);
      }
      if (pa.belief > pa.plausibility) {
        errors.push(`Belief cannot exceed plausibility`);
      }
      if (pa.uncertaintyInterval[0] !== pa.belief ||
          pa.uncertaintyInterval[1] !== pa.plausibility) {
        errors.push(`Uncertainty interval must match [belief, plausibility]`);
      }
    }
  }

  // Validate decisions
  if (thought.decisions) {
    const hypothesisIds = new Set(thought.hypotheses?.map(h => h.id) || []);

    for (const decision of thought.decisions) {
      if (decision.confidence < 0 || decision.confidence > 1) {
        errors.push(`Decision ${decision.id} confidence must be 0-1`);
      }

      for (const hypId of decision.selectedHypothesis) {
        if (!hypothesisIds.has(hypId)) {
          errors.push(`Decision ${decision.id} selects unknown hypothesis ${hypId}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Use Cases
- Sensor fusion and data integration
- Diagnostic reasoning with uncertain evidence
- Risk assessment with incomplete information
- Intelligence analysis
- Medical diagnosis

---

## Feature 4: Mode Combination Recommendations (v2.4)

### Overview
Intelligent system to recommend which reasoning modes to use based on problem characteristics and suggest mode combinations.

### Type Definitions

```typescript
// src/modes/recommendations.ts

export interface ProblemCharacteristics {
  domain: string;
  complexity: 'low' | 'medium' | 'high';
  uncertainty: 'low' | 'medium' | 'high';
  timeDependent: boolean;
  multiAgent: boolean;
  requiresProof: boolean;
  requiresQuantification: boolean;
  hasIncompleteInfo: boolean;
  requiresExplanation: boolean;
  hasAlternatives: boolean;
}

export interface ModeRecommendation {
  mode: ThinkingMode;
  score: number; // 0-1, how well suited
  reasoning: string;
  strengths: string[];
  limitations: string[];
  examples: string[];
}

export interface CombinationRecommendation {
  modes: ThinkingMode[];
  sequence: 'parallel' | 'sequential' | 'hybrid';
  rationale: string;
  benefits: string[];
  synergies: string[];
}

export class ModeRecommender {
  recommendModes(characteristics: ProblemCharacteristics): ModeRecommendation[] {
    const recommendations: ModeRecommendation[] = [];

    // Temporal reasoning
    if (characteristics.timeDependent) {
      recommendations.push({
        mode: 'temporal',
        score: 0.9,
        reasoning: 'Problem involves time-dependent events and sequences',
        strengths: ['Event sequencing', 'Temporal causality', 'Timeline construction'],
        limitations: ['Limited strategic reasoning'],
        examples: ['Process modeling', 'Event correlation', 'Timeline debugging']
      });
    }

    // Game theory
    if (characteristics.multiAgent) {
      recommendations.push({
        mode: 'gametheory',
        score: 0.85,
        reasoning: 'Problem involves strategic interactions between agents',
        strengths: ['Equilibrium analysis', 'Strategic reasoning', 'Multi-agent dynamics'],
        limitations: ['Assumes rationality', 'Complex computations'],
        examples: ['Competitive analysis', 'Auction design', 'Negotiation']
      });
    }

    // Evidential reasoning
    if (characteristics.hasIncompleteInfo && characteristics.uncertainty === 'high') {
      recommendations.push({
        mode: 'evidential',
        score: 0.88,
        reasoning: 'Problem has incomplete information and high uncertainty',
        strengths: ['Handles ignorance', 'Evidence combination', 'Uncertainty intervals'],
        limitations: ['Computational complexity', 'Requires careful mass assignment'],
        examples: ['Sensor fusion', 'Diagnostic reasoning', 'Intelligence analysis']
      });
    }

    // Abductive reasoning
    if (characteristics.requiresExplanation) {
      recommendations.push({
        mode: 'abductive',
        score: 0.87,
        reasoning: 'Problem requires finding best explanations',
        strengths: ['Hypothesis generation', 'Root cause analysis', 'Explanation quality'],
        limitations: ['May miss non-obvious explanations'],
        examples: ['Debugging', 'Diagnosis', 'Scientific discovery']
      });
    }

    // Causal reasoning
    if (characteristics.timeDependent && characteristics.requiresExplanation) {
      recommendations.push({
        mode: 'causal',
        score: 0.86,
        reasoning: 'Problem requires understanding cause-effect relationships',
        strengths: ['Intervention analysis', 'Causal graphs', 'Impact assessment'],
        limitations: ['Requires domain knowledge', 'Difficult to identify confounders'],
        examples: ['Impact analysis', 'System design', 'Policy evaluation']
      });
    }

    // Bayesian reasoning
    if (characteristics.requiresQuantification && characteristics.uncertainty !== 'low') {
      recommendations.push({
        mode: 'bayesian',
        score: 0.84,
        reasoning: 'Problem requires probabilistic reasoning with evidence updates',
        strengths: ['Principled uncertainty', 'Evidence integration', 'Prior knowledge'],
        limitations: ['Requires probability estimates', 'Computationally intensive'],
        examples: ['A/B testing', 'Risk assessment', 'Predictive modeling']
      });
    }

    // Counterfactual reasoning
    if (characteristics.hasAlternatives) {
      recommendations.push({
        mode: 'counterfactual',
        score: 0.82,
        reasoning: 'Problem benefits from analyzing alternative scenarios',
        strengths: ['What-if analysis', 'Post-mortem insights', 'Decision comparison'],
        limitations: ['Speculative', 'Difficult to validate'],
        examples: ['Post-mortems', 'Strategic planning', 'Architecture decisions']
      });
    }

    // Mathematical reasoning
    if (characteristics.requiresProof) {
      recommendations.push({
        mode: 'mathematics',
        score: 0.95,
        reasoning: 'Problem requires formal proofs and symbolic reasoning',
        strengths: ['Rigorous proofs', 'Symbolic computation', 'Theorem proving'],
        limitations: ['Limited to mathematical domains'],
        examples: ['Algorithm correctness', 'Complexity analysis', 'Formal verification']
      });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  recommendCombinations(characteristics: ProblemCharacteristics): CombinationRecommendation[] {
    const combinations: CombinationRecommendation[] = [];

    // Temporal + Causal
    if (characteristics.timeDependent && characteristics.requiresExplanation) {
      combinations.push({
        modes: ['temporal', 'causal'],
        sequence: 'sequential',
        rationale: 'Build timeline first, then analyze causal relationships',
        benefits: ['Complete temporal-causal model', 'Root cause with timeline context'],
        synergies: ['Temporal events inform causal nodes', 'Causal edges explain temporal sequences']
      });
    }

    // Abductive + Bayesian
    if (characteristics.requiresExplanation && characteristics.requiresQuantification) {
      combinations.push({
        modes: ['abductive', 'bayesian'],
        sequence: 'sequential',
        rationale: 'Generate hypotheses, then quantify with probabilities',
        benefits: ['Systematic hypothesis generation', 'Quantified belief updates'],
        synergies: ['Abductive hypotheses become Bayesian hypotheses', 'Bayesian updates refine explanations']
      });
    }

    // Game Theory + Counterfactual
    if (characteristics.multiAgent && characteristics.hasAlternatives) {
      combinations.push({
        modes: ['gametheory', 'counterfactual'],
        sequence: 'hybrid',
        rationale: 'Analyze equilibria, then explore alternative strategies',
        benefits: ['Strategic analysis + scenario exploration', 'Robustness testing'],
        synergies: ['Equilibria as actual scenarios', 'Strategy changes as interventions']
      });
    }

    // Evidential + Causal
    if (characteristics.hasIncompleteInfo && characteristics.timeDependent) {
      combinations.push({
        modes: ['evidential', 'causal'],
        sequence: 'parallel',
        rationale: 'Combine uncertain evidence while modeling causal structure',
        benefits: ['Handles uncertainty and causality', 'Evidence fusion with causal reasoning'],
        synergies: ['Belief functions inform causal strengths', 'Causal structure guides evidence combination']
      });
    }

    return combinations;
  }
}
```

### Use Cases
- Helping users select appropriate reasoning modes
- Optimizing thinking strategies
- Educational tool for learning reasoning patterns
- Automated mode selection for hybrid mode

---

## Feature 5: Visual Output Formats (v2.5)

### Overview
Generate visual representations (graphs, trees, diagrams) for reasoning outputs using ASCII art, Mermaid, and DOT formats.

### Type Definitions

```typescript
// src/export/visual.ts

export interface VisualExportOptions {
  format: 'ascii' | 'mermaid' | 'dot';
  includeLabels: boolean;
  includeMetrics: boolean;
  colorScheme?: 'default' | 'monochrome' | 'colorblind-safe';
  layoutDirection?: 'TB' | 'LR' | 'BT' | 'RL'; // Top-Bottom, Left-Right, etc.
}

export class VisualExporter {
  exportCausalGraph(thought: CausalThought, options: VisualExportOptions): string {
    switch (options.format) {
      case 'mermaid':
        return this.causalToMermaid(thought, options);
      case 'dot':
        return this.causalToDot(thought, options);
      case 'ascii':
        return this.causalToAscii(thought, options);
    }
  }

  private causalToMermaid(thought: CausalThought, options: VisualExportOptions): string {
    const direction = options.layoutDirection || 'TB';
    let output = `graph ${direction}\n`;

    // Add nodes
    if (thought.causalGraph?.nodes) {
      for (const node of thought.causalGraph.nodes) {
        const shape = this.getNodeShape(node.type);
        const label = options.includeLabels ? node.name : node.id;
        output += `  ${node.id}${shape[0]}${label}${shape[1]}\n`;

        // Add styling based on type
        const style = this.getNodeStyle(node.type);
        output += `  style ${node.id} ${style}\n`;
      }
    }

    // Add edges
    if (thought.causalGraph?.edges) {
      for (const edge of thought.causalGraph.edges) {
        const strength = edge.strength || 0;
        const label = options.includeMetrics ?
          `|${strength.toFixed(2)}| ` : '';
        const arrow = strength > 0 ? '-->' : '-.->'; // Solid for positive, dashed for negative
        output += `  ${edge.from} ${arrow} ${label}${edge.to}\n`;
      }
    }

    return output;
  }

  private getNodeShape(type: string): [string, string] {
    switch (type) {
      case 'cause': return ['([', '])'];
      case 'effect': return ['[[', ']]'];
      case 'mediator': return ['[', ']'];
      case 'confounder': return ['{', '}'];
      default: return ['(', ')'];
    }
  }

  private getNodeStyle(type: string): string {
    switch (type) {
      case 'cause': return 'fill:#e1f5ff,stroke:#01579b';
      case 'effect': return 'fill:#fff3e0,stroke:#e65100';
      case 'mediator': return 'fill:#f3e5f5,stroke:#4a148c';
      case 'confounder': return 'fill:#ffebee,stroke:#b71c1c';
      default: return 'fill:#f5f5f5,stroke:#424242';
    }
  }

  exportTemporalTimeline(thought: TemporalThought, options: VisualExportOptions): string {
    if (options.format === 'mermaid') {
      return this.temporalToMermaidGantt(thought, options);
    } else if (options.format === 'ascii') {
      return this.temporalToAsciiTimeline(thought, options);
    }
    return '';
  }

  private temporalToMermaidGantt(thought: TemporalThought, options: VisualExportOptions): string {
    let output = 'gantt\n';
    output += `  title ${thought.timeline?.name || 'Timeline'}\n`;
    output += `  dateFormat X\n`; // Numeric timestamps
    output += `  axisFormat %H:%M\n`;

    if (thought.events) {
      // Group by event type if needed
      const sections = new Map<string, TemporalEvent[]>();

      for (const event of thought.events) {
        const section = event.properties?.category || 'Events';
        if (!sections.has(section)) {
          sections.set(section, []);
        }
        sections.get(section)!.push(event);
      }

      for (const [section, events] of sections) {
        output += `  section ${section}\n`;

        for (const event of events) {
          const duration = event.duration || 1;
          const end = event.timestamp + duration;
          output += `  ${event.name} :${event.timestamp}, ${end}\n`;
        }
      }
    }

    return output;
  }

  exportGameTree(thought: GameTheoryThought, options: VisualExportOptions): string {
    if (options.format === 'mermaid') {
      return this.gameToMermaidTree(thought, options);
    } else if (options.format === 'dot') {
      return this.gameToDotTree(thought, options);
    }
    return '';
  }

  private gameToMermaidTree(thought: GameTheoryThought, options: VisualExportOptions): string {
    let output = 'graph TD\n';

    // Create decision nodes for each player
    if (thought.players && thought.strategies) {
      const strategyMap = new Map<string, Strategy[]>();

      for (const strategy of thought.strategies) {
        if (!strategyMap.has(strategy.playerId)) {
          strategyMap.set(strategy.playerId, []);
        }
        strategyMap.get(strategy.playerId)!.push(strategy);
      }

      let nodeId = 0;
      for (const [playerId, strategies] of strategyMap) {
        const player = thought.players.find(p => p.id === playerId);
        const playerName = player?.name || playerId;

        output += `  P${nodeId}[${playerName}]\n`;

        for (const strategy of strategies) {
          const stratNodeId = nodeId + 1;
          output += `  S${stratNodeId}[${strategy.name}]\n`;
          output += `  P${nodeId} --> S${stratNodeId}\n`;
          nodeId++;
        }
      }
    }

    // Add equilibria as highlighted nodes
    if (thought.equilibria) {
      for (let i = 0; i < thought.equilibria.length; i++) {
        const eq = thought.equilibria[i];
        output += `  E${i}{{${eq.type}}}\n`;
        output += `  style E${i} fill:#4caf50,stroke:#1b5e20\n`;
      }
    }

    return output;
  }
}
```

### Supported Visualizations
- **Causal Graphs**: Mermaid flowcharts, DOT graphs
- **Temporal Timelines**: Mermaid Gantt charts, ASCII timelines
- **Game Trees**: Mermaid decision trees, DOT trees
- **Bayesian Networks**: Mermaid graphs with probabilities
- **Hypothesis Trees**: Abductive reasoning visualizations

---

## Feature 6: Specialized Format Export (v2.6)

### Overview
Export reasoning outputs to specialized formats like GraphML (for graph analysis tools), GeoJSON (for spatial reasoning), and PDDL (for planning).

### Type Definitions

```typescript
// src/export/specialized.ts

export interface SpecializedExportOptions {
  format: 'graphml' | 'geojson' | 'pddl' | 'prolog';
  includeMetadata: boolean;
  validate: boolean;
}

export class SpecializedExporter {
  exportCausalToGraphML(thought: CausalThought, options: SpecializedExportOptions): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<graphml xmlns="http://graphml.graphdrawing.org/xmlns"\n';
    xml += '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
    xml += '  xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns\n';
    xml += '  http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n';

    // Define keys for attributes
    xml += '  <key id="nodeType" for="node" attr.name="type" attr.type="string"/>\n';
    xml += '  <key id="edgeStrength" for="edge" attr.name="strength" attr.type="double"/>\n';
    xml += '  <key id="edgeConfidence" for="edge" attr.name="confidence" attr.type="double"/>\n';

    xml += '  <graph id="G" edgedefault="directed">\n';

    // Add nodes
    if (thought.causalGraph?.nodes) {
      for (const node of thought.causalGraph.nodes) {
        xml += `    <node id="${node.id}">\n`;
        xml += `      <data key="nodeType">${node.type}</data>\n`;
        xml += `    </node>\n`;
      }
    }

    // Add edges
    if (thought.causalGraph?.edges) {
      for (let i = 0; i < thought.causalGraph.edges.length; i++) {
        const edge = thought.causalGraph.edges[i];
        xml += `    <edge id="e${i}" source="${edge.from}" target="${edge.to}">\n`;
        xml += `      <data key="edgeStrength">${edge.strength || 0}</data>\n`;
        xml += `      <data key="edgeConfidence">${edge.confidence || 1}</data>\n`;
        xml += `    </edge>\n`;
      }
    }

    xml += '  </graph>\n';
    xml += '</graphml>\n';

    return xml;
  }

  exportGameToPDDL(thought: GameTheoryThought, options: SpecializedExportOptions): string {
    let pddl = '(define (domain game-theory)\n';
    pddl += '  (:requirements :strips :typing :conditional-effects)\n';
    pddl += '  (:types player strategy action)\n\n';

    // Define predicates
    pddl += '  (:predicates\n';
    pddl += '    (player-turn ?p - player)\n';
    pddl += '    (strategy-available ?s - strategy ?p - player)\n';
    pddl += '    (strategy-chosen ?s - strategy ?p - player)\n';
    pddl += '    (action-executed ?a - action)\n';
    pddl += '    (equilibrium-reached)\n';
    pddl += '  )\n\n';

    // Define actions
    if (thought.strategies) {
      for (const strategy of thought.strategies) {
        pddl += `  (:action choose-${strategy.id}\n`;
        pddl += `    :parameters (?p - player)\n`;
        pddl += `    :precondition (and\n`;
        pddl += `      (player-turn ?p)\n`;
        pddl += `      (strategy-available ${strategy.id} ?p)\n`;
        pddl += `    )\n`;
        pddl += `    :effect (and\n`;
        pddl += `      (strategy-chosen ${strategy.id} ?p)\n`;
        pddl += `      (not (player-turn ?p))\n`;
        pddl += `    )\n`;
        pddl += `  )\n\n`;
      }
    }

    pddl += ')\n';

    return pddl;
  }
}
```

### Supported Formats
- **GraphML**: For Gephi, Cytoscape, yEd (causal graphs, game trees)
- **GeoJSON**: For spatial/geographic reasoning (future)
- **PDDL**: For automated planning tools (game theory, temporal)
- **Prolog**: For logic programming integration (evidential, abductive)

---

## Testing Strategy

### Test Coverage Goals
- **v2.1 (Temporal)**: 15 new tests → 92 total
- **v2.2 (Game Theory)**: 15 new tests → 107 total
- **v2.3 (Evidential)**: 12 new tests → 119 total
- **v2.4 (Recommendations)**: 8 new tests → 127 total
- **v2.5 (Visual)**: 10 new tests → 137 total
- **v2.6 (Specialized)**: 8 new tests → 145 total

### Integration Tests
- Mode combinations
- Export pipeline end-to-end
- Visualization rendering
- Format validation

---

## Documentation Updates

### README.md
- Add 3 new modes to features section
- Update mode count from 10 to 13
- Add visualization and export capabilities
- Include new examples for each mode

### Examples
- One comprehensive example per new mode
- Visual output examples (Mermaid code + rendered)
- Export format samples
- Mode combination workflows

---

## Success Criteria

### Phase 3A (v2.1)
- ✅ Temporal mode fully implemented
- ✅ Timeline and event validation
- ✅ 15 passing tests
- ✅ Example documentation

### Phase 3B (v2.2)
- ✅ Game theory mode complete
- ✅ Nash equilibrium computation
- ✅ 15 passing tests
- ✅ Strategic analysis examples

### Phase 3C (v2.3)
- ✅ Evidential reasoning mode working
- ✅ Dempster-Shafer combination
- ✅ 12 passing tests
- ✅ Uncertainty handling examples

### Phase 3D (v2.4)
- ✅ Mode recommender functional
- ✅ Combination suggestions working
- ✅ 8 passing tests
- ✅ Integration with hybrid mode

### Phase 3E (v2.5)
- ✅ Visual exports for all applicable modes
- ✅ Mermaid, DOT, ASCII support
- ✅ 10 passing tests
- ✅ Rendered examples in docs

### Phase 3F (v2.6)
- ✅ GraphML export working
- ✅ PDDL generation functional
- ✅ 8 passing tests
- ✅ Tool compatibility verified

---

## Risk Mitigation

### Complexity Risk
- **Risk**: New modes are complex (game theory, evidential)
- **Mitigation**: Start with simplified versions, iterate based on feedback

### Visualization Risk
- **Risk**: Mermaid/DOT rendering may be complex
- **Mitigation**: Use well-tested libraries, provide ASCII fallback

### Export Format Risk
- **Risk**: GraphML/PDDL specs may be hard to implement correctly
- **Mitigation**: Use schema validation, test with actual tools (Gephi, planners)

### Performance Risk
- **Risk**: Complex computations (Nash equilibria, Dempster-Shafer)
- **Mitigation**: Implement efficient algorithms, add computation timeouts

---

## Timeline Summary

| Phase | Version | Features | Weeks | Tests |
|-------|---------|----------|-------|-------|
| 3A | v2.1 | Temporal Reasoning | 1-2 | 15 |
| 3B | v2.2 | Game Theory | 2-3 | 15 |
| 3C | v2.3 | Evidential | 3-4 | 12 |
| 3D | v2.4 | Recommendations | 4 | 8 |
| 3E | v2.5 | Visual Exports | 5 | 10 |
| 3F | v2.6 | Specialized Exports | 6 | 8 |

**Total**: 6 weeks, 68 new tests, 3 new modes, 2 infrastructure features

---

## Next Steps After Phase 3

1. Gather user feedback on new modes
2. Performance optimization
3. Begin Phase 4 planning (infrastructure enhancements)
4. Community contribution guidelines
5. Academic paper on reasoning mode framework
