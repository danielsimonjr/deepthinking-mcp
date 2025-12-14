/**
 * SystemsThinkingHandler - Phase 10 Sprint 2B (v8.2.0)
 *
 * Specialized handler for Systems Thinking mode with:
 * - Systems Archetypes detection (8 classic archetypes)
 * - Feedback loop analysis
 * - Leverage point identification
 * - Warning signs and intervention suggestions
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, SystemsThinkingThought } from '../../types/core.js';
import type {
  SystemDefinition,
  SystemComponent,
  FeedbackLoop,
  LeveragePoint,
} from '../../types/modes/systemsthinking.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ModeEnhancements,
  DetectedArchetype,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';

/**
 * Systems Archetype definitions
 * Based on Peter Senge's "The Fifth Discipline" and other systems thinking literature
 */
interface SystemArchetype {
  name: string;
  description: string;
  pattern: string;
  warningSigns: string[];
  interventions: string[];
  loopSignature: {
    reinforcingCount?: number;
    balancingCount?: number;
    hasDelay?: boolean;
  };
}

const SYSTEMS_ARCHETYPES: SystemArchetype[] = [
  {
    name: 'Fixes that Fail',
    description: 'A quick fix creates unintended consequences that make the problem worse',
    pattern: 'Solution → Short-term relief → Unintended consequences → Original problem worsened',
    warningSigns: [
      'Quick fixes that keep recurring',
      'Side effects appearing after solution',
      'Escalating interventions required',
    ],
    interventions: [
      'Address root cause instead of symptoms',
      'Consider long-term consequences before acting',
      'Monitor for unintended side effects',
    ],
    loopSignature: { reinforcingCount: 1, balancingCount: 1, hasDelay: true },
  },
  {
    name: 'Shifting the Burden',
    description: 'A symptomatic solution undermines the fundamental solution',
    pattern: 'Symptom → Quick fix AND Fundamental solution, Quick fix erodes capacity for fundamental solution',
    warningSigns: [
      'Increasing dependence on quick fixes',
      'Atrophying fundamental capabilities',
      'Growing gap between symptoms and root causes',
    ],
    interventions: [
      'Strengthen the fundamental solution',
      'Reduce reliance on symptomatic solutions',
      'Build capacity while managing symptoms',
    ],
    loopSignature: { reinforcingCount: 1, balancingCount: 2, hasDelay: true },
  },
  {
    name: 'Limits to Growth',
    description: 'Growth approaches a limit which slows or stops further growth',
    pattern: 'Growth process → Success → Limiting condition activated → Growth slows/stops',
    warningSigns: [
      'Initial rapid growth',
      'Gradual slowdown despite continued effort',
      'Diminishing returns on investment',
    ],
    interventions: [
      'Identify and address limiting factors early',
      'Prepare for growth constraints',
      'Shift focus from pushing growth to removing limits',
    ],
    loopSignature: { reinforcingCount: 1, balancingCount: 1, hasDelay: false },
  },
  {
    name: 'Success to the Successful',
    description: 'Success breeds more success, starving other activities',
    pattern: 'Initial advantage → More resources allocated → Greater success → Competitors starved',
    warningSigns: [
      'Winner-take-all dynamics',
      'Declining diversity of options',
      'Concentration of resources',
    ],
    interventions: [
      'Ensure fair resource allocation',
      'Support weaker parties',
      'Maintain diverse options',
    ],
    loopSignature: { reinforcingCount: 2, balancingCount: 0, hasDelay: false },
  },
  {
    name: 'Tragedy of the Commons',
    description: 'Individual overuse depletes a shared resource',
    pattern: 'Shared resource → Individual exploitation → Resource depletion → Harm to all',
    warningSigns: [
      'Declining shared resource',
      'Increasing individual consumption',
      'Rational individual behavior leading to collective harm',
    ],
    interventions: [
      'Establish governance mechanisms',
      'Create feedback on individual impact',
      'Align individual incentives with collective good',
    ],
    loopSignature: { reinforcingCount: 1, balancingCount: 1, hasDelay: true },
  },
  {
    name: 'Escalation',
    description: 'Two parties compete, each responding to the other\'s actions',
    pattern: 'Party A acts → Party B perceives threat → Party B responds → Party A perceives threat → Cycle',
    warningSigns: [
      'Competitive actions and reactions',
      'Each side feeling justified',
      'Escalating intensity over time',
    ],
    interventions: [
      'Break the cycle unilaterally',
      'Establish communication channels',
      'Find mutual benefit solutions',
    ],
    loopSignature: { reinforcingCount: 2, balancingCount: 0, hasDelay: false },
  },
  {
    name: 'Growth and Underinvestment',
    description: 'Growth is limited by underinvestment in capacity',
    pattern: 'Demand grows → Capacity stretched → Performance drops → Investment deferred → Limits growth',
    warningSigns: [
      'Quality declining with growth',
      'Deferred investment in capacity',
      'Performance standards lowered',
    ],
    interventions: [
      'Invest in capacity ahead of demand',
      'Maintain performance standards',
      'Plan for growth requirements',
    ],
    loopSignature: { reinforcingCount: 1, balancingCount: 2, hasDelay: true },
  },
  {
    name: 'Eroding Goals',
    description: 'Under pressure, goals are lowered rather than addressing the gap',
    pattern: 'Gap between goals and reality → Pressure → Goals lowered → Gap closed artificially',
    warningSigns: [
      'Gradual lowering of standards',
      'Rationalization of declining performance',
      'Short-term pressure driving decisions',
    ],
    interventions: [
      'Hold firm on essential goals',
      'Address root causes of gaps',
      'Distinguish essential from negotiable goals',
    ],
    loopSignature: { reinforcingCount: 1, balancingCount: 1, hasDelay: false },
  },
];

/**
 * Thought types specific to systems thinking mode
 */
type SystemsThinkingThoughtType =
  | 'system_definition'
  | 'component_analysis'
  | 'feedback_identification'
  | 'leverage_analysis'
  | 'behavior_prediction';

/**
 * SystemsThinkingHandler - Specialized handler for systems thinking
 *
 * Provides semantic validation beyond schema validation:
 * - Validates component references in feedback loops
 * - Detects potential systems archetypes based on structure
 * - Identifies leverage points
 * - Suggests warning signs based on detected patterns
 */
export class SystemsThinkingHandler implements ModeHandler {
  readonly mode = ThinkingMode.SYSTEMSTHINKING;
  readonly modeName = 'Systems Thinking';
  readonly description = 'Systems analysis with archetype detection, feedback loops, and leverage point identification';

  /**
   * Supported thought types for systems thinking mode
   */
  private readonly supportedThoughtTypes: SystemsThinkingThoughtType[] = [
    'system_definition',
    'component_analysis',
    'feedback_identification',
    'leverage_analysis',
    'behavior_prediction',
  ];

  /**
   * Create a systems thinking thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): SystemsThinkingThought {
    const inputAny = input as any;

    // Resolve thought type
    const thoughtType = this.resolveThoughtType(inputAny.thoughtType);

    return {
      id: randomUUID(),
      sessionId,
      thoughtNumber: input.thoughtNumber,
      totalThoughts: input.totalThoughts,
      content: input.thought,
      timestamp: new Date(),
      nextThoughtNeeded: input.nextThoughtNeeded,
      isRevision: input.isRevision,
      revisesThought: input.revisesThought,
      mode: ThinkingMode.SYSTEMSTHINKING,
      thoughtType,
      system: inputAny.system,
      components: inputAny.components || [],
      feedbackLoops: inputAny.feedbackLoops || [],
      leveragePoints: inputAny.leveragePoints || [],
      behaviors: inputAny.behaviors || [],
    } as SystemsThinkingThought;
  }

  /**
   * Validate systems thinking-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const errors = [];
    const warnings = [];
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

    // Collect component IDs for validation
    const componentIds = new Set<string>();
    if (inputAny.components && Array.isArray(inputAny.components)) {
      for (const component of inputAny.components as SystemComponent[]) {
        if (component.id) componentIds.add(component.id);
      }

      // Validate components
      for (let i = 0; i < inputAny.components.length; i++) {
        const component = inputAny.components[i] as SystemComponent;
        const compValidation = this.validateComponent(component, i, componentIds);
        errors.push(...compValidation.errors);
        warnings.push(...compValidation.warnings);
      }
    }

    // Validate feedback loops
    if (inputAny.feedbackLoops && Array.isArray(inputAny.feedbackLoops)) {
      for (let i = 0; i < inputAny.feedbackLoops.length; i++) {
        const loop = inputAny.feedbackLoops[i] as FeedbackLoop;
        const loopValidation = this.validateFeedbackLoop(loop, i, componentIds);
        errors.push(...loopValidation.errors);
        warnings.push(...loopValidation.warnings);
      }
    }

    // Validate leverage points
    if (inputAny.leveragePoints && Array.isArray(inputAny.leveragePoints)) {
      for (let i = 0; i < inputAny.leveragePoints.length; i++) {
        const lp = inputAny.leveragePoints[i] as LeveragePoint;
        const lpValidation = this.validateLeveragePoint(lp, i, componentIds);
        errors.push(...lpValidation.errors);
        warnings.push(...lpValidation.warnings);
      }
    }

    // Validate system definition
    if (inputAny.system) {
      const sysValidation = this.validateSystem(inputAny.system);
      warnings.push(...sysValidation.warnings);
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get systems thinking-specific enhancements
   */
  getEnhancements(thought: SystemsThinkingThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.CAUSAL, ThinkingMode.OPTIMIZATION, ThinkingMode.SCIENTIFICMETHOD],
      guidingQuestions: [],
      warnings: [],
      mentalModels: [
        'Feedback Loops',
        'Stock and Flow',
        'Systems Archetypes',
        'Leverage Points',
        'Emergence',
      ],
    };

    // Calculate metrics
    const componentCount = thought.components?.length || 0;
    const feedbackLoopCount = thought.feedbackLoops?.length || 0;
    const leveragePointCount = thought.leveragePoints?.length || 0;
    const behaviorCount = thought.behaviors?.length || 0;

    // Count loop types
    const reinforcingLoops = (thought.feedbackLoops || []).filter(l => l.type === 'reinforcing').length;
    const balancingLoops = (thought.feedbackLoops || []).filter(l => l.type === 'balancing').length;

    enhancements.metrics = {
      componentCount,
      feedbackLoopCount,
      reinforcingLoops,
      balancingLoops,
      leveragePointCount,
      behaviorCount,
    };

    // Detect archetypes
    const detectedArchetypesResult = this.detectArchetypes(thought);
    if (detectedArchetypesResult.length > 0) {
      enhancements.detectedArchetypes = detectedArchetypesResult.map(a => ({
        name: a.name,
        confidence: a.confidence,
        matchedPatterns: a.archetype.warningSigns,
      } as DetectedArchetype));

      // Add archetype-specific warnings
      for (const detected of detectedArchetypesResult) {
        if (detected.confidence > 0.5) {
          enhancements.warnings!.push(
            `Potential "${detected.name}" archetype detected. Watch for: ${detected.archetype.warningSigns[0]}`
          );
        }
      }
    }

    // Suggestions based on content
    if (componentCount === 0) {
      enhancements.suggestions!.push(
        'Define system components (stocks, flows, variables) to model the system'
      );
    }

    if (componentCount >= 2 && feedbackLoopCount === 0) {
      enhancements.suggestions!.push(
        'Identify feedback loops connecting your components'
      );
    }

    if (reinforcingLoops > 0 && balancingLoops === 0) {
      enhancements.warnings!.push(
        'Only reinforcing loops detected. System may be unstable without balancing feedback.'
      );
    }

    if (feedbackLoopCount >= 2 && leveragePointCount === 0) {
      enhancements.suggestions!.push(
        'Identify leverage points where small changes could have large effects'
      );
    }

    // Guiding questions
    if (thought.system) {
      enhancements.guidingQuestions!.push(
        'What is the system optimizing for? Is that the intended goal?'
      );
    }

    if (feedbackLoopCount > 0) {
      enhancements.guidingQuestions!.push(
        'Which feedback loop is currently dominant in the system behavior?'
      );
    }

    const delayedLoops = (thought.feedbackLoops || []).filter(l => l.delay && l.delay > 0);
    if (delayedLoops.length > 0) {
      enhancements.guidingQuestions!.push(
        'How do delays in feedback affect system predictability?'
      );
    }

    if (componentCount >= 3 && behaviorCount === 0) {
      enhancements.guidingQuestions!.push(
        'What emergent behaviors arise from the interaction of these components?'
      );
    }

    return enhancements;
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType as SystemsThinkingThoughtType);
  }

  /**
   * Resolve thought type to valid SystemsThinkingThoughtType
   */
  private resolveThoughtType(inputType: string | undefined): SystemsThinkingThoughtType {
    if (inputType && this.supportedThoughtTypes.includes(inputType as SystemsThinkingThoughtType)) {
      return inputType as SystemsThinkingThoughtType;
    }
    return 'system_definition';
  }

  /**
   * Validate a system component
   */
  private validateComponent(
    component: SystemComponent,
    index: number,
    existingIds: Set<string>
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!component.id || component.id.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          `components[${index}].id`,
          'Component has no ID',
          'Add an ID to reference this component in loops'
        )
      );
    }

    if (!component.name || component.name.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          `components[${index}].name`,
          'Component has no name',
          'Add a descriptive name'
        )
      );
    }

    // Validate influencedBy references
    if (component.influencedBy) {
      for (const refId of component.influencedBy) {
        if (!existingIds.has(refId)) {
          warnings.push(
            createValidationWarning(
              `components[${index}].influencedBy`,
              `References non-existent component: ${refId}`,
              'Ensure all component references exist'
            )
          );
        }
      }
    }

    return errors.length > 0 ? validationFailure(errors, warnings) : validationSuccess(warnings);
  }

  /**
   * Validate a feedback loop
   */
  private validateFeedbackLoop(
    loop: FeedbackLoop,
    index: number,
    componentIds: Set<string>
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!loop.id || loop.id.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          `feedbackLoops[${index}].id`,
          'Feedback loop has no ID',
          'Add an ID to track this loop'
        )
      );
    }

    // Validate component references
    if (loop.components && loop.components.length > 0) {
      for (const compId of loop.components) {
        if (!componentIds.has(compId)) {
          warnings.push(
            createValidationWarning(
              `feedbackLoops[${index}].components`,
              `Loop references non-existent component: ${compId}`,
              'Ensure all components in the loop exist'
            )
          );
        }
      }

      // Check for minimum loop size
      if (loop.components.length < 2) {
        warnings.push(
          createValidationWarning(
            `feedbackLoops[${index}].components`,
            'Feedback loop has fewer than 2 components',
            'A feedback loop needs at least 2 components to form a cycle'
          )
        );
      }
    } else {
      warnings.push(
        createValidationWarning(
          `feedbackLoops[${index}].components`,
          'Feedback loop has no components',
          'Add components that form the feedback loop'
        )
      );
    }

    // Validate strength
    if (loop.strength !== undefined && (loop.strength < 0 || loop.strength > 1)) {
      warnings.push(
        createValidationWarning(
          `feedbackLoops[${index}].strength`,
          `Loop strength (${loop.strength}) is outside [0, 1] range`,
          'Strength should be normalized to [0, 1]'
        )
      );
    }

    return errors.length > 0 ? validationFailure(errors, warnings) : validationSuccess(warnings);
  }

  /**
   * Validate a leverage point
   */
  private validateLeveragePoint(
    lp: LeveragePoint,
    index: number,
    componentIds: Set<string>
  ): ValidationResult {
    const warnings = [];

    if (!lp.location || lp.location.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          `leveragePoints[${index}].location`,
          'Leverage point has no location',
          'Specify which component or loop this leverage point targets'
        )
      );
    } else if (!componentIds.has(lp.location)) {
      // Location might reference a loop ID, so just warn
      warnings.push(
        createValidationWarning(
          `leveragePoints[${index}].location`,
          `Leverage point location "${lp.location}" not found in components`,
          'Ensure the location references an existing component or loop'
        )
      );
    }

    // Validate effectiveness and difficulty
    if (lp.effectiveness !== undefined && (lp.effectiveness < 0 || lp.effectiveness > 1)) {
      warnings.push(
        createValidationWarning(
          `leveragePoints[${index}].effectiveness`,
          `Effectiveness (${lp.effectiveness}) is outside [0, 1] range`,
          'Effectiveness should be normalized to [0, 1]'
        )
      );
    }

    if (lp.difficulty !== undefined && (lp.difficulty < 0 || lp.difficulty > 1)) {
      warnings.push(
        createValidationWarning(
          `leveragePoints[${index}].difficulty`,
          `Difficulty (${lp.difficulty}) is outside [0, 1] range`,
          'Difficulty should be normalized to [0, 1]'
        )
      );
    }

    return validationSuccess(warnings);
  }

  /**
   * Validate system definition
   */
  private validateSystem(system: SystemDefinition): ValidationResult {
    const warnings = [];

    if (!system.boundary || system.boundary.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          'system.boundary',
          'System has no boundary defined',
          'Define what is inside and outside the system'
        )
      );
    }

    if (!system.purpose || system.purpose.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          'system.purpose',
          'System has no purpose defined',
          'Define what the system is designed to achieve'
        )
      );
    }

    return validationSuccess(warnings);
  }

  /**
   * Detect systems archetypes based on structure
   */
  private detectArchetypes(
    thought: SystemsThinkingThought
  ): { name: string; confidence: number; archetype: SystemArchetype }[] {
    const detected: { name: string; confidence: number; archetype: SystemArchetype }[] = [];
    const loops = thought.feedbackLoops || [];

    const reinforcingCount = loops.filter(l => l.type === 'reinforcing').length;
    const balancingCount = loops.filter(l => l.type === 'balancing').length;
    const hasDelay = loops.some(l => l.delay && l.delay > 0);

    for (const archetype of SYSTEMS_ARCHETYPES) {
      let confidence = 0;
      const sig = archetype.loopSignature;

      // Match loop counts (fuzzy matching)
      if (sig.reinforcingCount !== undefined) {
        if (reinforcingCount === sig.reinforcingCount) {
          confidence += 0.4;
        } else if (Math.abs(reinforcingCount - sig.reinforcingCount) === 1) {
          confidence += 0.2;
        }
      }

      if (sig.balancingCount !== undefined) {
        if (balancingCount === sig.balancingCount) {
          confidence += 0.4;
        } else if (Math.abs(balancingCount - sig.balancingCount) === 1) {
          confidence += 0.2;
        }
      }

      if (sig.hasDelay !== undefined) {
        if (hasDelay === sig.hasDelay) {
          confidence += 0.2;
        }
      }

      // Only report if confidence is meaningful
      if (confidence >= 0.4) {
        detected.push({
          name: archetype.name,
          confidence: Math.min(confidence, 1),
          archetype,
        });
      }
    }

    // Sort by confidence
    detected.sort((a, b) => b.confidence - a.confidence);

    // Return top 3
    return detected.slice(0, 3);
  }
}
