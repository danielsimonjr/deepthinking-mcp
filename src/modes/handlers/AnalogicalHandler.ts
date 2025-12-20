/**
 * AnalogicalHandler - Phase 15 (v8.4.0)
 *
 * Specialized handler for Analogical reasoning:
 * - Domain mapping validation
 * - Structural alignment checking
 * - Analogy strength scoring
 * - Transfer inference suggestions
 */

import { randomUUID } from 'crypto';
import { ThinkingMode } from '../../types/core.js';
import {
  AnalogicalThought,
  Domain,
  Entity,
  Relation,
  Property,
  Mapping,
  Insight,
  Inference,
} from '../../types/modes/analogical.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ValidationWarning,
  ModeEnhancements,
  validationSuccess,
  createValidationWarning,
} from './ModeHandler.js';

/**
 * AnalogicalHandler - Specialized handler for analogical reasoning
 *
 * Provides semantic validation and enhancement:
 * - Validates structural alignment between domains
 * - Scores analogy strength based on mapping coverage
 * - Identifies potential negative transfer
 * - Suggests additional mappings
 */
export class AnalogicalHandler implements ModeHandler {
  readonly mode = ThinkingMode.ANALOGICAL;
  readonly modeName = 'Analogical Reasoning';
  readonly description = 'Cross-domain reasoning through structural mapping and analogy transfer';

  /**
   * Create an analogical thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): AnalogicalThought {
    const inputAny = input as any;

    // Process source domain
    const sourceDomain = this.processDomain(
      inputAny.sourceDomain || inputAny.sourceAnalogy,
      'source'
    );

    // Process target domain
    const targetDomain = this.processDomain(
      inputAny.targetDomain || inputAny.targetAnalogy,
      'target'
    );

    // Process mappings
    const mapping = this.processMappings(inputAny.mapping || inputAny.mappings || []);

    // Process insights
    const insights = this.processInsights(inputAny.insights || inputAny.inferredProperties || []);

    // Process inferences
    const inferences = this.processInferences(inputAny.inferences || []);

    // Process limitations
    const limitations = inputAny.limitations || this.identifyLimitations(mapping);

    // Calculate analogy strength if not provided
    const analogyStrength = inputAny.analogyStrength ?? this.calculateAnalogyStrength(
      sourceDomain,
      targetDomain,
      mapping
    );

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
      mode: ThinkingMode.ANALOGICAL,
      sourceDomain,
      targetDomain,
      mapping,
      insights,
      inferences,
      limitations,
      analogyStrength,
    };
  }

  /**
   * Validate analogical-specific input
   */
  validate(input: ThinkingToolInput): ValidationResult {
    const warnings: ValidationWarning[] = [];
    const inputAny = input as any;

    // Check source domain
    const source = inputAny.sourceDomain || inputAny.sourceAnalogy;
    if (!source || !source.name) {
      warnings.push(
        createValidationWarning(
          'sourceDomain',
          'Source domain not fully specified',
          'Define the source domain with name, entities, and relations'
        )
      );
    }

    // Check target domain
    const target = inputAny.targetDomain || inputAny.targetAnalogy;
    if (!target || !target.name) {
      warnings.push(
        createValidationWarning(
          'targetDomain',
          'Target domain not fully specified',
          'Define the target domain with name, entities, and relations'
        )
      );
    }

    // Check mappings
    const mappings = inputAny.mapping || inputAny.mappings;
    if (!mappings || mappings.length === 0) {
      warnings.push(
        createValidationWarning(
          'mapping',
          'No explicit mappings provided',
          'Specify mappings between source and target entities'
        )
      );
    }

    // Warn about low-confidence mappings
    if (mappings) {
      const lowConfidence = mappings.filter((m: any) => (m.confidence || 0) < 0.5);
      if (lowConfidence.length > 0) {
        warnings.push(
          createValidationWarning(
            'mapping',
            `${lowConfidence.length} mapping(s) have low confidence`,
            'Review and strengthen weak mappings or acknowledge limitations'
          )
        );
      }
    }

    return validationSuccess(warnings);
  }

  /**
   * Get mode-specific enhancements
   */
  getEnhancements(thought: AnalogicalThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.ABDUCTIVE, ThinkingMode.INDUCTIVE, ThinkingMode.CAUSAL],
      metrics: {},
      guidingQuestions: [],
      mentalModels: [
        'Structure Mapping Theory (Gentner)',
        'Analogical Transfer',
        'Surface vs. Structural Similarity',
        'Negative Transfer Awareness',
        'Multi-constraint Theory',
      ],
    };

    const mapping = thought.mapping || [];
    const sourceDomain = thought.sourceDomain;
    const targetDomain = thought.targetDomain;

    // Calculate metrics
    enhancements.metrics = {
      mappingCount: mapping.length,
      avgConfidence: this.calculateAverageConfidence(mapping),
      sourceEntityCount: sourceDomain?.entities?.length || 0,
      targetEntityCount: targetDomain?.entities?.length || 0,
      insightCount: thought.insights?.length || 0,
      inferenceCount: thought.inferences?.length || 0,
      analogyStrength: thought.analogyStrength || 0,
    };

    // Generate suggestions
    if (sourceDomain?.entities && targetDomain?.entities) {
      const unmappedSource = this.findUnmappedEntities(sourceDomain.entities, mapping, 'source');
      const unmappedTarget = this.findUnmappedEntities(targetDomain.entities, mapping, 'target');

      if (unmappedSource.length > 0) {
        enhancements.suggestions!.push(
          `Consider mapping source entities: ${unmappedSource.slice(0, 3).join(', ')}`
        );
      }
      if (unmappedTarget.length > 0) {
        enhancements.suggestions!.push(
          `Target entities without mappings: ${unmappedTarget.slice(0, 3).join(', ')}`
        );
      }
    }

    // Check for potential negative transfer
    if ((thought.analogyStrength || 0) < 0.5) {
      enhancements.warnings = ['Low analogy strength - potential for negative transfer'];
    }

    // Guiding questions
    enhancements.guidingQuestions = [
      'What structural relations are preserved across domains?',
      'Are there systematic mappings or just surface similarities?',
      "What aspects of the source domain DON'T transfer?",
      'What new inferences can be drawn from the analogy?',
      'Are there competing analogies that might be more appropriate?',
    ];

    return enhancements;
  }

  /**
   * Process a domain from input
   */
  private processDomain(raw: any, type: string): Domain {
    if (!raw) {
      return {
        id: `${type}-domain`,
        name: '',
        description: '',
        entities: [],
        relations: [],
        properties: [],
      };
    }

    return {
      id: raw.id || `${type}-domain`,
      name: raw.name || raw.domain || '',
      description: raw.description || '',
      entities: this.processEntities(raw.entities || raw.elements || []),
      relations: this.processRelations(raw.relations || []),
      properties: this.processProperties(raw.properties || []),
    };
  }

  /**
   * Process entities
   */
  private processEntities(raw: any[]): Entity[] {
    return raw.map((e, index) => {
      if (typeof e === 'string') {
        return {
          id: `entity-${index}`,
          name: e,
          type: 'unknown',
          description: '',
        };
      }
      return {
        id: e.id || `entity-${index}`,
        name: e.name || '',
        type: e.type || 'unknown',
        description: e.description || '',
      };
    });
  }

  /**
   * Process relations
   */
  private processRelations(raw: any[]): Relation[] {
    return raw.map((r, index) => {
      if (typeof r === 'string') {
        return {
          id: `relation-${index}`,
          type: r,
          from: '',
          to: '',
          description: '',
        };
      }
      return {
        id: r.id || `relation-${index}`,
        type: r.type || 'related',
        from: r.from || '',
        to: r.to || '',
        description: r.description || '',
      };
    });
  }

  /**
   * Process properties
   */
  private processProperties(raw: any[]): Property[] {
    return raw.map((p) => ({
      entityId: p.entityId || '',
      name: p.name || '',
      value: p.value || '',
    }));
  }

  /**
   * Process mappings
   */
  private processMappings(raw: any[]): Mapping[] {
    return raw.map((m) => ({
      sourceEntityId: m.sourceEntityId || m.source || '',
      targetEntityId: m.targetEntityId || m.target || '',
      justification: m.justification || '',
      confidence: m.confidence ?? 0.5,
    }));
  }

  /**
   * Process insights
   */
  private processInsights(raw: any[]): Insight[] {
    return raw.map((i) => {
      if (typeof i === 'string') {
        return {
          description: i,
          sourceEvidence: '',
          targetApplication: '',
          novelty: 0.5,
        };
      }
      return {
        description: i.description || '',
        sourceEvidence: i.sourceEvidence || '',
        targetApplication: i.targetApplication || '',
        novelty: i.novelty ?? 0.5,
      };
    });
  }

  /**
   * Process inferences (using core.ts Inference type)
   */
  private processInferences(raw: any[]): Inference[] {
    return raw.map((inf) => ({
      sourcePattern: inf.sourcePattern || inf.description || '',
      targetPrediction: inf.targetPrediction || inf.basedOn || '',
      confidence: inf.confidence ?? 0.5,
      needsVerification: inf.needsVerification ?? (inf.testability ? true : false),
    }));
  }

  /**
   * Calculate analogy strength based on mappings
   */
  private calculateAnalogyStrength(source: Domain, target: Domain, mappings: Mapping[]): number {
    if (mappings.length === 0) return 0;

    const sourceCount = source.entities?.length || 1;
    const targetCount = target.entities?.length || 1;
    const coverage = mappings.length / Math.max(sourceCount, targetCount);

    const avgConfidence = this.calculateAverageConfidence(mappings);

    return Math.min(coverage * avgConfidence * 1.2, 1);
  }

  /**
   * Calculate average confidence of mappings
   */
  private calculateAverageConfidence(mappings: Mapping[]): number {
    if (mappings.length === 0) return 0;
    const sum = mappings.reduce((acc, m) => acc + (m.confidence || 0.5), 0);
    return sum / mappings.length;
  }

  /**
   * Find entities not yet mapped
   */
  private findUnmappedEntities(
    entities: Entity[],
    mappings: Mapping[],
    side: 'source' | 'target'
  ): string[] {
    const mappedIds = new Set(
      mappings.map((m) => (side === 'source' ? m.sourceEntityId : m.targetEntityId))
    );
    return entities.filter((e) => !mappedIds.has(e.id)).map((e) => e.name);
  }

  /**
   * Identify potential limitations of the analogy
   */
  private identifyLimitations(mappings: Mapping[]): string[] {
    const limitations: string[] = [];

    const lowConfidence = mappings.filter((m) => m.confidence < 0.5);
    if (lowConfidence.length > 0) {
      limitations.push('Some mappings have low confidence');
    }

    if (mappings.length === 0) {
      limitations.push('No mappings defined - analogy is undefined');
    }

    return limitations;
  }
}
