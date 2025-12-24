/**
 * CausalHandler - Phase 12 Sprint 6 Enhanced (v8.3.0)
 *
 * Specialized handler for Causal reasoning mode with:
 * - Semantic validation of causal graph structure
 * - Cycle detection in causal graphs
 * - Intervention propagation analysis
 * - Confounder identification suggestions
 * - Centrality analysis (PageRank, Betweenness, Closeness)
 * - D-separation analysis
 * - Do-calculus identifiability checking
 */

import { randomUUID } from 'crypto';
import { ThinkingMode, CausalThought } from '../../types/core.js';
import type { CausalGraph, Intervention } from '../../types/modes/causal.js';
import type { ThinkingToolInput } from '../../tools/thinking.js';
import {
  ModeHandler,
  ValidationResult,
  ModeEnhancements,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './ModeHandler.js';
import { toExtendedThoughtType } from '../../utils/type-guards.js';
import {
  computeDegreeCentrality,
  getMostCentralNode,
} from '../causal/graph/algorithms/centrality.js';
import {
  findVStructures,
} from '../causal/graph/algorithms/d-separation.js';
import {
  isIdentifiable,
  findAllBackdoorSets,
} from '../causal/graph/algorithms/intervention.js';
import type { CausalGraph as GraphCausalGraph } from '../causal/graph/types.js';

/**
 * CausalHandler - Specialized handler for causal reasoning
 *
 * Provides semantic validation beyond schema validation:
 * - Validates that all edge references point to existing nodes
 * - Detects cycles in causal graphs (which may indicate feedback loops)
 * - Validates intervention targets exist in the graph
 * - Suggests potential confounders based on graph structure
 */
export class CausalHandler implements ModeHandler {
  readonly mode = ThinkingMode.CAUSAL;
  readonly modeName = 'Causal Analysis';
  readonly description = 'Causal graph analysis with intervention reasoning and cycle detection';

  /**
   * Supported thought types for causal mode
   */
  private readonly supportedThoughtTypes = [
    'problem_definition',
    'causal_graph_construction',
    'intervention_analysis',
    'counterfactual_analysis',
    'confounder_identification',
    'mechanism_discovery',
  ];

  /**
   * Create a causal thought from input
   */
  createThought(input: ThinkingToolInput, sessionId: string): CausalThought {
    const inputAny = input as any;

    // Build causal graph from input
    const causalGraph: CausalGraph = input.causalGraph || {
      nodes: inputAny.nodes || [],
      edges: inputAny.edges || [],
    };

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
      mode: ThinkingMode.CAUSAL,
      thoughtType: toExtendedThoughtType(input.thoughtType, 'problem_definition'),
      causalGraph,
      interventions: input.interventions || [],
      mechanisms: input.mechanisms || [],
      confounders: input.confounders || [],
    } as CausalThought;
  }

  /**
   * Validate causal-specific input
   *
   * Performs semantic validation:
   * 1. Basic input validation
   * 2. Causal graph structure validation
   * 3. Cycle detection (warns, doesn't fail - cycles may be intentional feedback loops)
   * 4. Intervention target validation
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

    // Build causal graph from input
    const causalGraph: CausalGraph = input.causalGraph || {
      nodes: inputAny.nodes || [],
      edges: inputAny.edges || [],
    };

    // Validate graph structure if provided
    if (causalGraph.nodes.length > 0 || causalGraph.edges.length > 0) {
      const graphValidation = this.validateCausalGraph(causalGraph);
      errors.push(...graphValidation.errors);
      warnings.push(...graphValidation.warnings);
    }

    // Validate interventions reference existing nodes
    if (input.interventions && input.interventions.length > 0) {
      const interventionValidation = this.validateInterventions(
        input.interventions,
        causalGraph
      );
      errors.push(...interventionValidation.errors);
      warnings.push(...interventionValidation.warnings);
    }

    // Check for cycles (warn, don't fail - might be intentional feedback loops)
    if (causalGraph.edges.length > 0) {
      const cycles = this.detectCycles(causalGraph);
      if (cycles.length > 0) {
        warnings.push(
          createValidationWarning(
            'causalGraph',
            `Detected ${cycles.length} cycle(s) in causal graph: ${cycles.map(c => c.join(' -> ')).join('; ')}`,
            'Cycles may indicate feedback loops. Verify this is intentional.'
          )
        );
      }
    }

    // Suggest confounders if not provided
    if ((!input.confounders || input.confounders.length === 0) && causalGraph.nodes.length >= 3) {
      warnings.push(
        createValidationWarning(
          'confounders',
          'No confounders specified in the causal model',
          'Consider identifying potential confounders that might affect multiple nodes'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Get causal-specific enhancements
   */
  getEnhancements(thought: CausalThought): ModeEnhancements {
    const enhancements: ModeEnhancements = {
      suggestions: [],
      relatedModes: [ThinkingMode.BAYESIAN, ThinkingMode.COUNTERFACTUAL],
      guidingQuestions: [],
      warnings: [],
      mentalModels: ['Causal Diagrams', 'Do-Calculus', 'Structural Equation Models'],
    };

    // Suggest based on graph complexity
    if (thought.causalGraph) {
      const nodeCount = thought.causalGraph.nodes.length;
      const edgeCount = thought.causalGraph.edges.length;

      if (nodeCount > 0 && edgeCount === 0) {
        enhancements.suggestions!.push(
          'Add causal edges to connect your nodes and establish causal relationships'
        );
      }

      if (edgeCount > nodeCount * 2) {
        enhancements.suggestions!.push(
          'Graph is densely connected. Consider identifying the most significant causal paths'
        );
      }

      // Calculate graph metrics
      enhancements.metrics = {
        nodeCount,
        edgeCount,
        density: nodeCount > 1 ? edgeCount / (nodeCount * (nodeCount - 1)) : 0,
      };

      // Identify potential entry and exit points
      const entryNodes = this.findEntryNodes(thought.causalGraph);
      const exitNodes = this.findExitNodes(thought.causalGraph);

      if (entryNodes.length > 0) {
        enhancements.guidingQuestions!.push(
          `What external factors influence the root causes: ${entryNodes.join(', ')}?`
        );
      }

      if (exitNodes.length > 0) {
        enhancements.guidingQuestions!.push(
          `What are the downstream consequences of ${exitNodes.join(', ')}?`
        );
      }

      // Enhanced analysis using Sprint 6 algorithms
      if (nodeCount >= 2 && edgeCount >= 1) {
        const advancedAnalysis = this.performAdvancedGraphAnalysis(thought.causalGraph);

        if (advancedAnalysis.centralNode) {
          enhancements.suggestions!.push(
            `Node "${advancedAnalysis.centralNode}" is most central (highest PageRank). Consider its importance in causal pathways.`
          );
        }

        if (advancedAnalysis.vStructures.length > 0) {
          enhancements.warnings!.push(
            `Detected ${advancedAnalysis.vStructures.length} v-structure(s)/collider(s) that affect d-separation analysis.`
          );
        }

        if (advancedAnalysis.identifiability && entryNodes.length > 0 && exitNodes.length > 0) {
          if (advancedAnalysis.identifiability.identifiable) {
            enhancements.suggestions!.push(
              `Causal effect is identifiable via ${advancedAnalysis.identifiability.method || 'standard methods'}.`
            );
          } else {
            enhancements.warnings!.push(
              `Causal effect may not be identifiable: ${advancedAnalysis.identifiability.reason}`
            );
          }
        }

        if (advancedAnalysis.backdoorSets && advancedAnalysis.backdoorSets.length > 0) {
          const setDescription = advancedAnalysis.backdoorSets[0].length === 0
            ? 'No adjustment needed'
            : `Adjust for: ${advancedAnalysis.backdoorSets[0].join(', ')}`;
          enhancements.suggestions!.push(
            `Valid backdoor adjustment set found. ${setDescription}`
          );
        }

        // Add centrality metrics
        if (advancedAnalysis.centralityMetrics) {
          enhancements.metrics = {
            ...enhancements.metrics,
            ...advancedAnalysis.centralityMetrics,
          };
        }
      }
    }

    // Suggest interventions if none provided
    if (!thought.interventions || thought.interventions.length === 0) {
      enhancements.guidingQuestions!.push(
        'What interventions could be tested to verify causal relationships?'
      );
    }

    // Add confounders suggestion
    if (!thought.confounders || thought.confounders.length === 0) {
      enhancements.guidingQuestions!.push(
        'Are there any hidden common causes (confounders) that might affect multiple variables?'
      );
    }

    return enhancements;
  }

  /**
   * Perform advanced graph analysis using Sprint 6 algorithms
   */
  private performAdvancedGraphAnalysis(graph: CausalGraph): {
    centralNode: string | null;
    vStructures: Array<{ parent1: string; collider: string; parent2: string }>;
    identifiability: { identifiable: boolean; reason: string; method?: string } | null;
    backdoorSets: string[][] | null;
    centralityMetrics: Record<string, number> | null;
  } {
    // Convert to graph types format
    const graphForAnalysis = this.toGraphAnalysisFormat(graph);

    // Find central node using PageRank
    let centralNode: string | null = null;
    let centralityMetrics: Record<string, number> | null = null;

    try {
      const mostCentral = getMostCentralNode(graphForAnalysis, 'pagerank');
      if (mostCentral) {
        centralNode = mostCentral.nodeId;

        // Also compute degree centrality for metrics
        const { degree } = computeDegreeCentrality(graphForAnalysis);

        centralityMetrics = {
          maxDegree: Math.max(...Array.from(degree.values())),
          maxPageRank: mostCentral.score,
          avgDegree: Array.from(degree.values()).reduce((a, b) => a + b, 0) / degree.size,
        };
      }
    } catch {
      // Centrality computation is optional enrichment - proceed without it
      // Common causes: malformed graph, empty node set, numerical issues
    }

    // Find v-structures (colliders)
    let vStructures: Array<{ parent1: string; collider: string; parent2: string }> = [];
    try {
      vStructures = findVStructures(graphForAnalysis);
    } catch {
      // V-structure detection is optional - graph may not have proper structure
    }

    // Check identifiability if we have clear treatment and outcome
    let identifiability: { identifiable: boolean; reason: string; method?: string } | null = null;
    let backdoorSets: string[][] | null = null;

    const entryNodes = this.findEntryNodes(graph);
    const exitNodes = this.findExitNodes(graph);

    if (entryNodes.length > 0 && exitNodes.length > 0) {
      const treatment = graph.nodes.find(n => n.name === entryNodes[0] || n.id === entryNodes[0])?.id;
      const outcome = graph.nodes.find(n => n.name === exitNodes[0] || n.id === exitNodes[0])?.id;

      if (treatment && outcome) {
        try {
          identifiability = isIdentifiable(graphForAnalysis, treatment, outcome);
          backdoorSets = findAllBackdoorSets(graphForAnalysis, treatment, outcome, 3);
        } catch {
          // Identifiability analysis is optional - may fail for complex/cyclic graphs
        }
      }
    }

    return {
      centralNode,
      vStructures,
      identifiability,
      backdoorSets,
      centralityMetrics,
    };
  }

  /**
   * Convert internal CausalGraph to graph analysis format
   */
  private toGraphAnalysisFormat(graph: CausalGraph): GraphCausalGraph {
    return {
      id: 'analysis-graph',
      nodes: graph.nodes.map(n => ({
        id: n.id,
        name: n.name || n.id,
        description: n.description,
        // Map internal type to graph analysis type
        type: this.mapNodeType(n.type),
      })),
      edges: graph.edges.map(e => ({
        from: e.from,
        to: e.to,
        type: 'directed' as const, // CausalEdge doesn't have type, assume directed
        weight: e.strength,
      })),
    };
  }

  /**
   * Map internal node type to graph analysis type
   */
  private mapNodeType(type: string): 'observed' | 'latent' | 'intervention' | 'outcome' | undefined {
    switch (type) {
      case 'cause':
        return 'observed';
      case 'effect':
        return 'outcome';
      case 'mediator':
        return 'observed';
      case 'confounder':
        return 'latent';
      default:
        return undefined;
    }
  }

  /**
   * Check if this handler supports a specific thought type
   */
  supportsThoughtType(thoughtType: string): boolean {
    return this.supportedThoughtTypes.includes(thoughtType);
  }

  /**
   * Validate causal graph structure
   */
  private validateCausalGraph(graph: CausalGraph): ValidationResult {
    const errors = [];
    const warnings = [];
    const nodeIds = new Set(graph.nodes.map(n => n.id));

    // Check for duplicate node IDs
    if (nodeIds.size !== graph.nodes.length) {
      errors.push(
        createValidationError(
          'causalGraph.nodes',
          'Duplicate node IDs detected in causal graph',
          'DUPLICATE_NODE_IDS'
        )
      );
    }

    // Validate each edge references existing nodes
    for (const edge of graph.edges) {
      if (!nodeIds.has(edge.from)) {
        errors.push(
          createValidationError(
            'causalGraph.edges',
            `Edge references non-existent source node: ${edge.from}`,
            'INVALID_EDGE_SOURCE'
          )
        );
      }

      if (!nodeIds.has(edge.to)) {
        errors.push(
          createValidationError(
            'causalGraph.edges',
            `Edge references non-existent target node: ${edge.to}`,
            'INVALID_EDGE_TARGET'
          )
        );
      }

      // Validate edge strength and confidence
      if (edge.strength !== undefined && (edge.strength < -1 || edge.strength > 1)) {
        warnings.push(
          createValidationWarning(
            'causalGraph.edges',
            `Edge strength ${edge.strength} is outside [-1, 1] range`,
            'Normalize edge strength to [-1, 1] where negative indicates inhibitory effects'
          )
        );
      }

      if (edge.confidence !== undefined && (edge.confidence < 0 || edge.confidence > 1)) {
        warnings.push(
          createValidationWarning(
            'causalGraph.edges',
            `Edge confidence ${edge.confidence} is outside [0, 1] range`,
            'Confidence should be a probability between 0 and 1'
          )
        );
      }
    }

    // Check for self-loops
    const selfLoops = graph.edges.filter(e => e.from === e.to);
    if (selfLoops.length > 0) {
      warnings.push(
        createValidationWarning(
          'causalGraph.edges',
          `${selfLoops.length} self-loop(s) detected: ${selfLoops.map(e => e.from).join(', ')}`,
          'Self-loops may indicate self-reinforcing effects. Verify this is intentional.'
        )
      );
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Validate interventions reference existing nodes
   */
  private validateInterventions(
    interventions: Intervention[],
    graph: CausalGraph
  ): ValidationResult {
    const errors = [];
    const warnings = [];
    const nodeIds = new Set(graph.nodes.map(n => n.id));

    for (const intervention of interventions) {
      // Check intervention target exists
      if (!nodeIds.has(intervention.nodeId)) {
        errors.push(
          createValidationError(
            'interventions',
            `Intervention targets non-existent node: ${intervention.nodeId}`,
            'INVALID_INTERVENTION_TARGET'
          )
        );
      }

      // Check expected effects reference existing nodes
      if (intervention.expectedEffects) {
        for (const effect of intervention.expectedEffects) {
          if (!nodeIds.has(effect.nodeId)) {
            warnings.push(
              createValidationWarning(
                'interventions.expectedEffects',
                `Expected effect references non-existent node: ${effect.nodeId}`,
                'Ensure all expected effect nodes are in the causal graph'
              )
            );
          }

          // Validate effect confidence
          if (effect.confidence !== undefined && (effect.confidence < 0 || effect.confidence > 1)) {
            warnings.push(
              createValidationWarning(
                'interventions.expectedEffects',
                `Effect confidence ${effect.confidence} is outside [0, 1] range`,
                'Confidence should be a probability between 0 and 1'
              )
            );
          }
        }
      }
    }

    if (errors.length > 0) {
      return validationFailure(errors, warnings);
    }

    return validationSuccess(warnings);
  }

  /**
   * Detect cycles in the causal graph using DFS
   *
   * Returns list of cycles found, where each cycle is a list of node IDs
   */
  private detectCycles(graph: CausalGraph): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    // Build adjacency list
    const adjacencyList = new Map<string, string[]>();
    for (const node of graph.nodes) {
      adjacencyList.set(node.id, []);
    }
    for (const edge of graph.edges) {
      const neighbors = adjacencyList.get(edge.from);
      if (neighbors) {
        neighbors.push(edge.to);
      }
    }

    // DFS from each unvisited node
    const dfs = (nodeId: string): void => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        } else if (recursionStack.has(neighbor)) {
          // Found a cycle - extract it from the path
          const cycleStart = path.indexOf(neighbor);
          const cycle = path.slice(cycleStart);
          cycle.push(neighbor); // Close the cycle
          cycles.push(cycle);
        }
      }

      path.pop();
      recursionStack.delete(nodeId);
    };

    // Run DFS from all nodes
    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    }

    return cycles;
  }

  /**
   * Find entry nodes (nodes with no incoming edges)
   */
  private findEntryNodes(graph: CausalGraph): string[] {
    const hasIncoming = new Set(graph.edges.map(e => e.to));
    return graph.nodes
      .filter(n => !hasIncoming.has(n.id))
      .map(n => n.name || n.id);
  }

  /**
   * Find exit nodes (nodes with no outgoing edges)
   */
  private findExitNodes(graph: CausalGraph): string[] {
    const hasOutgoing = new Set(graph.edges.map(e => e.from));
    return graph.nodes
      .filter(n => !hasOutgoing.has(n.id))
      .map(n => n.name || n.id);
  }
}
