/**
 * ModalHandler - Phase 10 Sprint 3 (v8.4.0)
 *
 * Specialized handler for Modal reasoning mode with:
 * - Possible worlds semantics
 * - Necessity and possibility operators
 * - Accessibility relations
 * - Multi-modal logic support (epistemic, deontic, alethic, temporal)
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, Thought } from '../../types/core.js';
import type {
  ModalThought,
  PossibleWorld,
  ModalProposition,
  AccessibilityRelation,
  ModalInference,
} from '../../types/modes/modal.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ValidationWarning,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

// Re-export for backwards compatibility
export type { ModalThought };

/**
 * Valid thought types for modal mode
 */
const VALID_THOUGHT_TYPES = [
  'world_definition',
  'proposition_analysis',
  'accessibility_analysis',
  'necessity_proof',
  'possibility_proof',
  'modal_inference',
  'countermodel',
] as const;

type ModalThoughtType = (typeof VALID_THOUGHT_TYPES)[number];

/**
 * Valid modal logic systems
 */
const VALID_LOGIC_SYSTEMS = ['K', 'T', 'S4', 'S5', 'D', 'B', 'custom'] as const;

/**
 * Valid modal domains
 */
const VALID_MODAL_DOMAINS = ['alethic', 'epistemic', 'deontic', 'temporal'] as const;

/**
 * ModalHandler - Specialized handler for modal reasoning
 *
 * Provides:
 * - Possible worlds model construction
 * - Necessity and possibility evaluation
 * - Modal inference validation
 * - Multi-modal logic support
 */
export class ModalHandler implements ModeHandler {
  readonly mode = ThinkingMode.MODAL;
  readonly modeName = 'Modal Reasoning';
  readonly description =
    'Reasoning about necessity, possibility, and possible worlds semantics';

  /**
   * Supported thought types for modal mode
   */
  private readonly supportedThoughtTypes = [...VALID_THOUGHT_TYPES];

  /**
   * Create a modal thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): ModalThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

    // Process worlds
    const worlds = (inputAny.worlds || []).map((w: any) => this.normalizeWorld(w));

    // Ensure at least one world exists
    if (worlds.length === 0) {
      worlds.push(this.createDefaultWorld());
    }

    // Determine actual world
    const actualWorld = inputAny.actualWorld || worlds.find((w: PossibleWorld) => w.isActual)?.id || worlds[0].id;

    // Process propositions
    const propositions = (inputAny.propositions || []).map((p: any) =>
      this.normalizeProposition(p, worlds)
    );

    // Process accessibility relations
    const accessibilityRelations = (inputAny.accessibilityRelations || []).map((r: any) =>
      this.normalizeAccessibilityRelation(r, inputAny.modalDomain || 'alethic')
    );

    // Process inferences
    const inferences = inputAny.inferences
      ? inputAny.inferences.map((i: any) => this.normalizeInference(i))
      : undefined;

    // Resolve modal logic type and domain
    const modalLogicType = this.resolveLogicSystem(inputAny.modalLogicType);
    const modalDomain = this.resolveModalDomain(inputAny.modalDomain);

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      mode: ThinkingMode.MODAL,

      // Core modal fields
      thoughtType,
      worlds,
      actualWorld,
      propositions,
      accessibilityRelations,
      modalLogicType,
      modalDomain,
      inferences,

      // Revision tracking
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
    };
  }

  /**
   * Validate modal-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors: { field: string; message: string; code: string }[] = [];
    const warnings: ValidationWarning[] = [];
    const inputAny = input as any;

    // Basic validation
    if (!input.thought || input.thought.trim().length === 0) {
      return validationFailure([
        createValidationError('thought', 'Thought content is required', 'EMPTY_THOUGHT'),
      ]);
    }

    if (input.thoughtNumber > input.totalThoughts) {
      return validationFailure([
        createValidationError(
          'thoughtNumber',
          `Thought number (${input.thoughtNumber}) exceeds total thoughts (${input.totalThoughts})`,
          'INVALID_THOUGHT_NUMBER'
        ),
      ]);
    }

    // Validate thought type
    if (inputAny.thoughtType && !VALID_THOUGHT_TYPES.includes(inputAny.thoughtType)) {
      warnings.push(
        createValidationWarning(
          'thoughtType',
          `Unknown thought type: ${inputAny.thoughtType}`,
          `Valid types: ${VALID_THOUGHT_TYPES.join(', ')}`
        )
      );
    }

    // Validate logic system
    if (inputAny.modalLogicType && !VALID_LOGIC_SYSTEMS.includes(inputAny.modalLogicType)) {
      warnings.push(
        createValidationWarning(
          'modalLogicType',
          `Unknown logic system: ${inputAny.modalLogicType}`,
          `Valid systems: ${VALID_LOGIC_SYSTEMS.join(', ')}`
        )
      );
    }

    // Validate modal domain
    if (inputAny.modalDomain && !VALID_MODAL_DOMAINS.includes(inputAny.modalDomain)) {
      warnings.push(
        createValidationWarning(
          'modalDomain',
          `Unknown modal domain: ${inputAny.modalDomain}`,
          `Valid domains: ${VALID_MODAL_DOMAINS.join(', ')}`
        )
      );
    }

    // Check for worlds in proof types
    if (
      (inputAny.thoughtType === 'necessity_proof' ||
        inputAny.thoughtType === 'possibility_proof') &&
      (!inputAny.worlds || inputAny.worlds.length === 0)
    ) {
      warnings.push(
        createValidationWarning(
          'worlds',
          'Modal proof without defined worlds',
          'Define possible worlds for modal evaluation'
        )
      );
    }

    // Validate accessibility relation consistency
    if (inputAny.accessibilityRelations) {
      const worldIds = new Set((inputAny.worlds || []).map((w: any) => w.id));
      for (const rel of inputAny.accessibilityRelations) {
        if (rel.fromWorld && !worldIds.has(rel.fromWorld)) {
          warnings.push(
            createValidationWarning(
              'accessibilityRelations',
              `Relation references unknown world: ${rel.fromWorld}`,
              'Ensure all relation endpoints reference defined worlds'
            )
          );
        }
        if (rel.toWorld && !worldIds.has(rel.toWorld)) {
          warnings.push(
            createValidationWarning(
              'accessibilityRelations',
              `Relation references unknown world: ${rel.toWorld}`,
              'Ensure all relation endpoints reference defined worlds'
            )
          );
        }
      }
    }

    // Validate S5 requires all worlds to be mutually accessible
    if (inputAny.modalLogicType === 'S5' && inputAny.worlds && inputAny.worlds.length > 1) {
      if (!inputAny.accessibilityRelations || inputAny.accessibilityRelations.length === 0) {
        warnings.push(
          createValidationWarning(
            'accessibilityRelations',
            'S5 logic requires universal accessibility',
            'All worlds should be mutually accessible in S5'
          )
        );
      }
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get modal-specific enhancements
   */
  getEnhancements(thought: Thought): ModeEnhancements {
    const modalThought = thought as ModalThought;
    const worlds = modalThought.worlds || [];
    const propositions = modalThought.propositions || [];
    const accessibilityRelations = modalThought.accessibilityRelations || [];

    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.FORMALLOGIC, ThinkingMode.COUNTERFACTUAL, ThinkingMode.DEDUCTIVE],
      guidingQuestions: [],
      warnings: [],
      metrics: {
        worldCount: worlds.length,
        propositionCount: propositions.length,
        relationCount: accessibilityRelations.length,
        inferenceCount: modalThought.inferences?.length || 0,
      },
      mentalModels: [
        'Possible Worlds Semantics',
        'Kripke Frames',
        'Necessity vs Possibility',
        'Accessibility Relations',
        'Modal Validity',
      ],
    };

    // Logic system info
    const logicType = modalThought.modalLogicType || modalThought.logicSystem || 'K';
    enhancements.suggestions!.push(
      `Logic system: ${logicType} (${modalThought.modalDomain})`
    );

    // Add logic system properties
    const systemProperties = this.getLogicSystemProperties(logicType);
    if (systemProperties.length > 0) {
      enhancements.suggestions!.push(`Properties: ${systemProperties.join(', ')}`);
    }

    // Thought type-specific guidance
    switch (modalThought.thoughtType) {
      case 'world_definition':
        enhancements.guidingQuestions!.push(
          'What propositions are true in each world?',
          'Which world represents the actual state of affairs?',
          'How are the worlds related (accessibility)?'
        );
        enhancements.suggestions!.push(`Defined ${worlds.length} possible world(s)`);
        break;

      case 'proposition_analysis':
        enhancements.guidingQuestions!.push(
          'Is the proposition necessarily true (true in all accessible worlds)?',
          'Is the proposition possibly true (true in some accessible world)?',
          'Is the proposition contingent (could be true or false)?'
        );
        const necessaryCount = propositions.filter(
          (p) => p.operator === 'necessary'
        ).length;
        const possibleCount = propositions.filter(
          (p) => p.operator === 'possible'
        ).length;
        enhancements.suggestions!.push(
          `Propositions: ${necessaryCount} necessary, ${possibleCount} possible`
        );
        break;

      case 'accessibility_analysis':
        enhancements.guidingQuestions!.push(
          'Is the accessibility relation reflexive (every world accesses itself)?',
          'Is the relation symmetric (if w1 accesses w2, does w2 access w1)?',
          'Is the relation transitive (if w1→w2→w3, does w1→w3)?'
        );
        break;

      case 'necessity_proof':
        enhancements.guidingQuestions!.push(
          'Is the proposition true in ALL accessible worlds?',
          'Are there any counterexample worlds?',
          'Does necessity hold under the current logic system?'
        );
        break;

      case 'possibility_proof':
        enhancements.guidingQuestions!.push(
          'Is the proposition true in AT LEAST ONE accessible world?',
          'Can we construct a world where it holds?',
          'What makes this possibility genuine vs. merely apparent?'
        );
        break;

      case 'modal_inference':
        enhancements.guidingQuestions!.push(
          'Is the inference valid in the current modal logic?',
          'Does the rule preserve truth across all frames?',
          'Are there countermodels to this inference?'
        );
        if (modalThought.inferences) {
          const validCount = modalThought.inferences.filter((i) => i.valid).length;
          enhancements.suggestions!.push(
            `Inferences: ${validCount}/${modalThought.inferences.length} valid`
          );
        }
        break;

      case 'countermodel':
        enhancements.guidingQuestions!.push(
          'What world/truth-value assignment falsifies the claim?',
          'Are the accessibility relations satisfied?',
          'Is this a minimal countermodel?'
        );
        break;
    }

    // Domain-specific guidance
    switch (modalThought.modalDomain) {
      case 'epistemic':
        enhancements.suggestions!.push('Epistemic: □p = agent knows p, ◇p = p is compatible with knowledge');
        enhancements.mentalModels!.push('Knowledge States', 'Belief Revision');
        break;
      case 'deontic':
        enhancements.suggestions!.push('Deontic: □p = p is obligatory, ◇p = p is permissible');
        enhancements.mentalModels!.push('Moral Obligations', 'Permission Logic');
        break;
      case 'temporal':
        enhancements.suggestions!.push('Temporal: □p = always p, ◇p = eventually p');
        enhancements.mentalModels!.push('Temporal Ordering', 'Future Possibilities');
        break;
      case 'alethic':
        enhancements.suggestions!.push('Alethic: □p = necessarily p, ◇p = possibly p');
        break;
    }

    // Check for common issues
    if (worlds.length === 1) {
      enhancements.warnings!.push(
        'Only one world defined - modal distinctions may collapse'
      );
    }

    // Validate accessibility matches logic system
    if (logicType === 'S5' && accessibilityRelations.length > 0) {
      const hasUniversalAccess = this.checkUniversalAccessibility(modalThought);
      if (!hasUniversalAccess) {
        enhancements.warnings!.push(
          'S5 requires universal accessibility - not all worlds are connected'
        );
      }
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as ModalThoughtType);
  }

  /**
   * Resolve thought type from input
   */
  private resolveThoughtType(inputType: string | undefined): ModalThoughtType {
    if (inputType && VALID_THOUGHT_TYPES.includes(inputType as ModalThoughtType)) {
      return inputType as ModalThoughtType;
    }
    return 'proposition_analysis';
  }

  /**
   * Resolve logic system
   */
  private resolveLogicSystem(system: string | undefined): ModalThought['modalLogicType'] {
    if (system && VALID_LOGIC_SYSTEMS.includes(system as any)) {
      return system as ModalThought['modalLogicType'];
    }
    return 'K';
  }

  /**
   * Resolve modal domain
   */
  private resolveModalDomain(domain: string | undefined): ModalThought['modalDomain'] {
    if (domain && VALID_MODAL_DOMAINS.includes(domain as any)) {
      return domain as ModalThought['modalDomain'];
    }
    return 'alethic';
  }

  /**
   * Get properties of a logic system
   */
  private getLogicSystemProperties(system: string): string[] {
    const properties: Record<string, string[]> = {
      K: ['basic modal logic'],
      T: ['reflexive'],
      S4: ['reflexive', 'transitive'],
      S5: ['reflexive', 'symmetric', 'transitive'],
      D: ['serial'],
      B: ['reflexive', 'symmetric'],
      custom: ['user-defined'],
    };
    return properties[system] || [];
  }

  /**
   * Create a default world
   */
  private createDefaultWorld(): PossibleWorld {
    return {
      id: randomUUID(),
      name: 'w0',
      description: 'Actual world',
      propositions: {},
      isActual: true,
      accessibility: [],
    };
  }

  /**
   * Normalize world
   */
  private normalizeWorld(world: any): PossibleWorld {
    return {
      id: world.id || randomUUID(),
      name: world.name || '',
      description: world.description || '',
      propositions: world.propositions || {},
      isActual: world.isActual ?? false,
      accessibility: world.accessibility || [],
    };
  }

  /**
   * Normalize proposition
   */
  private normalizeProposition(prop: any, worlds: PossibleWorld[]): ModalProposition {
    // Determine which worlds the proposition is true/false in
    const worldsTrue: string[] = [];
    const worldsFalse: string[] = [];

    for (const world of worlds) {
      if (world.propositions?.[prop.content] === true) {
        worldsTrue.push(world.id);
      } else if (world.propositions?.[prop.content] === false) {
        worldsFalse.push(world.id);
      }
    }

    return {
      id: prop.id || randomUUID(),
      content: prop.content || '',
      operator: prop.operator || 'contingent',
      truthValue: prop.truthValue,
      worldsTrue: prop.worldsTrue || worldsTrue,
      worldsFalse: prop.worldsFalse || worldsFalse,
    };
  }

  /**
   * Normalize accessibility relation
   */
  private normalizeAccessibilityRelation(rel: any, defaultModalType: string): AccessibilityRelation {
    return {
      id: rel.id || randomUUID(),
      fromWorld: rel.fromWorld || '',
      toWorld: rel.toWorld || '',
      type: rel.type || 'reflexive',
      modalType: rel.modalType || defaultModalType,
    };
  }

  /**
   * Normalize inference
   */
  private normalizeInference(inf: any): ModalInference {
    return {
      id: inf.id || randomUUID(),
      premises: inf.premises || [],
      conclusion: inf.conclusion || '',
      rule: inf.rule || '',
      valid: inf.valid ?? false,
      justification: inf.justification || '',
    };
  }

  /**
   * Check if all worlds are mutually accessible (for S5)
   */
  private checkUniversalAccessibility(thought: ModalThought): boolean {
    const worlds = thought.worlds || [];
    const relations = thought.accessibilityRelations || [];

    const worldIds = new Set(worlds.map((w) => w.id));
    const accessMap = new Map<string, Set<string>>();

    // Initialize access map with self-loops (reflexive)
    for (const id of worldIds) {
      accessMap.set(id, new Set([id]));
    }

    // Add explicit relations
    for (const rel of relations) {
      const fromWorld = rel.fromWorld || '';
      const toWorld = rel.toWorld || '';
      if (fromWorld && accessMap.has(fromWorld)) {
        accessMap.get(fromWorld)!.add(toWorld);
      }
      // For S5, make symmetric
      if (toWorld && accessMap.has(toWorld)) {
        accessMap.get(toWorld)!.add(fromWorld);
      }
    }

    // Check if all pairs are connected
    for (const w1 of worldIds) {
      for (const w2 of worldIds) {
        if (!accessMap.get(w1)?.has(w2)) {
          return false;
        }
      }
    }

    return true;
  }
}
