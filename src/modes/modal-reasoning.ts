/**
 * Modal Reasoning Mode (v3.4.0)
 * Phase 4E Task 8.2 (File Task 25): Reasoning about necessity, possibility, and impossibility
 */

import type { Thought } from '../types/index.js';

/**
 * Modal operator
 */
export type ModalOperator =
  | 'necessary' // □ (box) - must be true
  | 'possible' // ◇ (diamond) - could be true
  | 'impossible' // ¬◇ - cannot be true
  | 'contingent' // neither necessary nor impossible
  | 'actual' // true in actual world
  | 'epistemic_necessary' // known to be necessary
  | 'epistemic_possible' // known to be possible
  | 'deontic_obligatory' // ought to be
  | 'deontic_permitted' // may be
  | 'deontic_forbidden'; // must not be

/**
 * Modal proposition
 */
export interface ModalProposition {
  id: string;
  content: string;
  modality: ModalOperator;
  confidence: number; // 0-1
  justification: string[];
  dependencies: string[]; // Other proposition IDs
  world?: string; // Possible world where this holds
}

/**
 * Possible world
 */
export interface PossibleWorld {
  id: string;
  name: string;
  description: string;
  propositions: ModalProposition[];
  accessibility: string[]; // IDs of accessible worlds
  distance: number; // Similarity to actual world (0 = actual, higher = more distant)
  properties: string[];
}

/**
 * Modal inference
 */
export interface ModalInference {
  premises: ModalProposition[];
  conclusion: ModalProposition;
  rule: string;
  validity: 'valid' | 'invalid' | 'uncertain';
  explanation: string;
}

/**
 * Necessity type
 */
export type NecessityType =
  | 'logical' // Logical necessity (tautology)
  | 'metaphysical' // Metaphysically necessary
  | 'physical' // Physical/natural necessity (laws of nature)
  | 'conceptual' // Conceptually necessary (by definition)
  | 'nomological' // Necessary given laws of nature
  | 'epistemic' // Epistemically necessary (known a priori)
  | 'deontic' // Morally/legally necessary
  | 'temporal'; // Temporally necessary (given past)

/**
 * Modal analysis
 */
export interface ModalAnalysis {
  proposition: string;
  necessityType?: NecessityType;
  isNecessary: boolean;
  isPossible: boolean;
  isImpossible: boolean;
  isContingent: boolean;
  reasoning: string[];
  counterexamples: string[];
  supportingWorlds: PossibleWorld[];
  contradictingWorlds: PossibleWorld[];
}

/**
 * Modal thought
 */
export interface ModalReasoningThought extends Thought {
  mode: 'modal';
  propositions: ModalProposition[];
  worlds: PossibleWorld[];
  inferences: ModalInference[];
  analyses: ModalAnalysis[];
}

/**
 * Modal inference rules
 */
const MODAL_RULES = {
  necessitation: {
    name: 'Necessitation',
    description: 'If P is a theorem, then □P is a theorem',
    pattern: (p: ModalProposition) => p.modality === 'actual',
    apply: (p: ModalProposition): ModalProposition => ({
      ...p,
      id: `nec_${p.id}`,
      modality: 'necessary',
      justification: [...p.justification, 'Necessitation rule applied'],
    }),
  },
  distribution: {
    name: 'Distribution (K)',
    description: '□(P → Q) → (□P → □Q)',
    pattern: (p1: ModalProposition, p2: ModalProposition) =>
      p1.modality === 'necessary' && p1.content.includes('→'),
    apply: (p1: ModalProposition, p2: ModalProposition): ModalProposition | null => {
      // Simplified: if □(P→Q) and □P, infer □Q
      return {
        id: `dist_${p1.id}_${p2.id}`,
        content: 'Consequent of ' + p1.content,
        modality: 'necessary',
        confidence: Math.min(p1.confidence, p2.confidence),
        justification: ['Distribution rule', ...p1.justification, ...p2.justification],
        dependencies: [p1.id, p2.id],
      };
    },
  },
  possibility: {
    name: 'Possibility from Negation',
    description: '¬□¬P → ◇P (if not necessarily not-P, then possibly P)',
    pattern: (p: ModalProposition) => p.modality === 'necessary' && p.content.startsWith('¬'),
    apply: (p: ModalProposition): ModalProposition => ({
      id: `poss_${p.id}`,
      content: p.content.substring(1), // Remove negation
      modality: 'possible',
      confidence: p.confidence,
      justification: [...p.justification, 'Possibility from negation'],
      dependencies: [p.id],
    }),
  },
  duality: {
    name: 'Duality',
    description: '◇P ↔ ¬□¬P (possible P iff not necessarily not-P)',
    pattern: (p: ModalProposition) => true,
    apply: (p: ModalProposition): ModalProposition => {
      if (p.modality === 'possible') {
        return {
          id: `dual_${p.id}`,
          content: `¬□¬${p.content}`,
          modality: 'necessary',
          confidence: p.confidence,
          justification: [...p.justification, 'Duality'],
          dependencies: [p.id],
        };
      }
      return p;
    },
  },
};

/**
 * Modal reasoning engine
 */
export class ModalReasoningEngine {
  private worlds: Map<string, PossibleWorld>;
  private actualWorldId: string;

  constructor() {
    this.worlds = new Map();
    this.actualWorldId = 'actual';
    this.initializeActualWorld();
  }

  /**
   * Initialize actual world
   */
  private initializeActualWorld(): void {
    const actualWorld: PossibleWorld = {
      id: this.actualWorldId,
      name: 'Actual World',
      description: 'The actual state of affairs',
      propositions: [],
      accessibility: [], // Will be populated with accessible worlds
      distance: 0,
      properties: ['actual', 'complete', 'consistent'],
    };
    this.worlds.set(this.actualWorldId, actualWorld);
  }

  /**
   * Add possible world
   */
  addWorld(world: PossibleWorld): void {
    this.worlds.set(world.id, world);
  }

  /**
   * Add proposition to world
   */
  addProposition(worldId: string, proposition: ModalProposition): void {
    const world = this.worlds.get(worldId);
    if (world) {
      world.propositions.push(proposition);
    }
  }

  /**
   * Check if proposition is necessary
   */
  isNecessary(proposition: string): ModalAnalysis {
    const supportingWorlds: PossibleWorld[] = [];
    const contradictingWorlds: PossibleWorld[] = [];

    // Check in all accessible worlds
    for (const world of this.worlds.values()) {
      const holds = world.propositions.some(p => p.content === proposition);
      if (holds) {
        supportingWorlds.push(world);
      } else {
        contradictingWorlds.push(world);
      }
    }

    const isNecessary = contradictingWorlds.length === 0 && supportingWorlds.length > 0;
    const isPossible = supportingWorlds.length > 0;
    const isImpossible = supportingWorlds.length === 0;
    const isContingent = supportingWorlds.length > 0 && contradictingWorlds.length > 0;

    const reasoning: string[] = [];
    if (isNecessary) {
      reasoning.push(`Proposition holds in all ${supportingWorlds.length} accessible worlds`);
      reasoning.push('Therefore, it is necessary');
    } else if (isImpossible) {
      reasoning.push('Proposition holds in no accessible worlds');
      reasoning.push('Therefore, it is impossible');
    } else if (isContingent) {
      reasoning.push(`Proposition holds in ${supportingWorlds.length} worlds`);
      reasoning.push(`But fails in ${contradictingWorlds.length} worlds`);
      reasoning.push('Therefore, it is contingent');
    } else if (isPossible) {
      reasoning.push(`Proposition holds in ${supportingWorlds.length} worlds`);
      reasoning.push('Therefore, it is possible');
    }

    const counterexamples = contradictingWorlds.slice(0, 3).map(w => w.description);

    return {
      proposition,
      isNecessary,
      isPossible,
      isImpossible,
      isContingent,
      reasoning,
      counterexamples,
      supportingWorlds,
      contradictingWorlds,
    };
  }

  /**
   * Check if proposition is possible
   */
  isPossible(proposition: string): boolean {
    // A proposition is possible if true in at least one accessible world
    for (const world of this.worlds.values()) {
      if (world.propositions.some(p => p.content === proposition)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if proposition is impossible
   */
  isImpossible(proposition: string): boolean {
    return !this.isPossible(proposition);
  }

  /**
   * Classify necessity type
   */
  classifyNecessity(proposition: string): NecessityType | null {
    const analysis = this.isNecessary(proposition);
    if (!analysis.isNecessary) return null;

    // Heuristics for classification
    const lower = proposition.toLowerCase();

    // Logical necessity
    if (lower.includes('or not') || lower.includes('law of excluded middle')) {
      return 'logical';
    }

    // Conceptual necessity
    if (lower.includes('by definition') || lower.includes('concept')) {
      return 'conceptual';
    }

    // Physical necessity
    if (lower.includes('law of') || lower.includes('physics') || lower.includes('nature')) {
      return 'physical';
    }

    // Deontic necessity
    if (lower.includes('ought') || lower.includes('must') || lower.includes('obligation')) {
      return 'deontic';
    }

    return 'metaphysical'; // Default
  }

  /**
   * Generate counterfactual scenarios
   */
  generateCounterfactuals(proposition: string, count: number = 3): PossibleWorld[] {
    const counterfactuals: PossibleWorld[] = [];
    const actualWorld = this.worlds.get(this.actualWorldId)!;

    for (let i = 1; i <= count; i++) {
      const world: PossibleWorld = {
        id: `counterfactual_${i}`,
        name: `Counterfactual Scenario ${i}`,
        description: `World where ${proposition} holds`,
        propositions: [
          {
            id: `cf_prop_${i}`,
            content: proposition,
            modality: 'actual',
            confidence: 0.8,
            justification: ['Counterfactual assumption'],
            dependencies: [],
            world: `counterfactual_${i}`,
          },
        ],
        accessibility: [this.actualWorldId],
        distance: i,
        properties: ['counterfactual', 'hypothetical'],
      };

      counterfactuals.push(world);
      this.worlds.set(world.id, world);
    }

    return counterfactuals;
  }

  /**
   * Apply modal inference rule
   */
  applyInferenceRule(
    premises: ModalProposition[],
    ruleName: keyof typeof MODAL_RULES
  ): ModalInference | null {
    const rule = MODAL_RULES[ruleName];
    if (!rule) return null;

    // Simplified: apply rule to first premise
    if (premises.length === 0) return null;

    const premise = premises[0];
    let conclusion: ModalProposition | null = null;

    if (ruleName === 'necessitation' && rule.apply) {
      conclusion = (rule.apply as (p: ModalProposition) => ModalProposition)(premise);
    } else if (ruleName === 'possibility' && rule.apply) {
      conclusion = (rule.apply as (p: ModalProposition) => ModalProposition)(premise);
    } else if (ruleName === 'duality' && rule.apply) {
      conclusion = (rule.apply as (p: ModalProposition) => ModalProposition)(premise);
    }

    if (!conclusion) return null;

    return {
      premises,
      conclusion,
      rule: rule.name,
      validity: 'valid',
      explanation: rule.description,
    };
  }

  /**
   * Generate accessibility relation
   */
  generateAccessibilityRelation(type: 'reflexive' | 'symmetric' | 'transitive' | 'euclidean' = 'reflexive'): void {
    const worldIds = Array.from(this.worlds.keys());

    for (const worldId of worldIds) {
      const world = this.worlds.get(worldId)!;

      switch (type) {
        case 'reflexive':
          // Each world accesses itself
          if (!world.accessibility.includes(worldId)) {
            world.accessibility.push(worldId);
          }
          break;

        case 'symmetric':
          // If w1 accesses w2, then w2 accesses w1
          for (const accessedId of world.accessibility) {
            const accessedWorld = this.worlds.get(accessedId);
            if (accessedWorld && !accessedWorld.accessibility.includes(worldId)) {
              accessedWorld.accessibility.push(worldId);
            }
          }
          break;

        case 'transitive':
          // If w1 accesses w2 and w2 accesses w3, then w1 accesses w3
          const reachable = new Set<string>(world.accessibility);
          for (const accessedId of world.accessibility) {
            const accessedWorld = this.worlds.get(accessedId);
            if (accessedWorld) {
              for (const furtherId of accessedWorld.accessibility) {
                reachable.add(furtherId);
              }
            }
          }
          world.accessibility = Array.from(reachable);
          break;

        case 'euclidean':
          // If w1 accesses w2 and w1 accesses w3, then w2 accesses w3
          for (let i = 0; i < world.accessibility.length; i++) {
            for (let j = i + 1; j < world.accessibility.length; j++) {
              const world1 = this.worlds.get(world.accessibility[i]);
              const world2 = this.worlds.get(world.accessibility[j]);
              if (world1 && world2) {
                if (!world1.accessibility.includes(world.accessibility[j])) {
                  world1.accessibility.push(world.accessibility[j]);
                }
                if (!world2.accessibility.includes(world.accessibility[i])) {
                  world2.accessibility.push(world.accessibility[i]);
                }
              }
            }
          }
          break;
      }
    }
  }

  /**
   * Evaluate deontic proposition
   */
  evaluateDeontic(action: string, context: string): {
    obligatory: boolean;
    permitted: boolean;
    forbidden: boolean;
    reasoning: string[];
  } {
    // Simplified deontic evaluation
    const reasoning: string[] = [];
    let obligatory = false;
    let forbidden = false;

    const lowerAction = action.toLowerCase();
    const lowerContext = context.toLowerCase();

    // Heuristics for deontic evaluation
    if (lowerContext.includes('harm') || lowerContext.includes('danger')) {
      if (lowerAction.includes('prevent') || lowerAction.includes('help')) {
        obligatory = true;
        reasoning.push('Preventing harm is obligatory');
      } else if (lowerAction.includes('cause')) {
        forbidden = true;
        reasoning.push('Causing harm is forbidden');
      }
    }

    if (lowerContext.includes('promise') || lowerContext.includes('contract')) {
      if (lowerAction.includes('keep') || lowerAction.includes('fulfill')) {
        obligatory = true;
        reasoning.push('Keeping promises is obligatory');
      } else if (lowerAction.includes('break')) {
        forbidden = true;
        reasoning.push('Breaking promises is forbidden');
      }
    }

    const permitted = !forbidden;

    return { obligatory, permitted, forbidden, reasoning };
  }

  /**
   * Generate modal logic formula
   */
  generateFormula(proposition: ModalProposition): string {
    const operators: Record<ModalOperator, string> = {
      necessary: '□',
      possible: '◇',
      impossible: '¬◇',
      contingent: '',
      actual: '',
      epistemic_necessary: 'K□',
      epistemic_possible: 'K◇',
      deontic_obligatory: 'O',
      deontic_permitted: 'P',
      deontic_forbidden: 'F',
    };

    const op = operators[proposition.modality];
    return op ? `${op}(${proposition.content})` : proposition.content;
  }

  /**
   * Generate modal reasoning summary
   */
  generateSummary(propositions: ModalProposition[]): string {
    const report: string[] = [];

    report.push('# Modal Reasoning Analysis');
    report.push('');

    // Group by modality
    const byModality = new Map<ModalOperator, ModalProposition[]>();
    for (const prop of propositions) {
      if (!byModality.has(prop.modality)) {
        byModality.set(prop.modality, []);
      }
      byModality.get(prop.modality)!.push(prop);
    }

    report.push('## Propositions by Modality');
    for (const [modality, props] of byModality) {
      report.push(`### ${modality.toUpperCase()}`);
      for (const prop of props) {
        report.push(`- ${this.generateFormula(prop)}`);
        report.push(`  Confidence: ${(prop.confidence * 100).toFixed(0)}%`);
      }
      report.push('');
    }

    // Analyze necessity
    report.push('## Necessity Analysis');
    const necessaryProps = propositions.filter(p => p.modality === 'necessary');
    if (necessaryProps.length > 0) {
      report.push(`Found ${necessaryProps.length} necessary propositions:`);
      for (const prop of necessaryProps) {
        const type = this.classifyNecessity(prop.content);
        report.push(`- ${prop.content} (${type || 'unclassified'} necessity)`);
      }
    } else {
      report.push('No necessary propositions identified.');
    }
    report.push('');

    // Analyze possibility
    report.push('## Possibility Analysis');
    const possibleProps = propositions.filter(p => p.modality === 'possible');
    report.push(`Found ${possibleProps.length} possible propositions.`);
    report.push('');

    // World count
    report.push('## Possible Worlds');
    report.push(`Total worlds considered: ${this.worlds.size}`);
    for (const world of this.worlds.values()) {
      report.push(`- **${world.name}**: ${world.propositions.length} propositions, distance: ${world.distance}`);
    }

    return report.join('\n');
  }

  /**
   * Generate Kripke model diagram
   */
  generateKripkeModel(): string {
    let diagram = 'digraph KripkeModel {\n';
    diagram += '  rankdir=LR;\n';
    diagram += '  node [shape=circle];\n\n';

    // Add nodes for each world
    for (const world of this.worlds.values()) {
      const label = world.id === this.actualWorldId ? `${world.name}\\n(actual)` : world.name;
      const style = world.id === this.actualWorldId ? 'filled,bold' : 'filled';
      const color = world.id === this.actualWorldId ? 'lightblue' : 'white';
      diagram += `  ${world.id} [label="${label}", style="${style}", fillcolor="${color}"];\n`;
    }

    diagram += '\n';

    // Add edges for accessibility relation
    for (const world of this.worlds.values()) {
      for (const accessedId of world.accessibility) {
        diagram += `  ${world.id} -> ${accessedId};\n`;
      }
    }

    diagram += '}\n';
    return diagram;
  }
}
