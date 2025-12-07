/**
 * Assumption Tracker - Phase 8 Sprint 2
 *
 * Traces conclusions back to their foundational assumptions,
 * identifies minimal assumption sets, and detects unused assumptions.
 */

import type {
  DependencyGraph,
  AssumptionChain,
  AssumptionAnalysis,
  ImplicitAssumption,
  ProofDecomposition,
} from '../types/modes/mathematics.js';

/**
 * Assumption discharge status
 */
interface DischargeStatus {
  assumptionId: string;
  isDischarged: boolean;
  dischargedAt?: string;
  dischargeReason?: string;
}

/**
 * AssumptionTracker - Traces and analyzes proof assumptions
 */
export class AssumptionTracker {
  /**
   * Trace a conclusion back to its foundational assumptions
   *
   * @param conclusionId - The statement ID to trace
   * @param graph - The dependency graph
   * @returns AssumptionChain with full derivation path
   */
  traceToAssumptions(conclusionId: string, graph: DependencyGraph): AssumptionChain {
    const assumptions: string[] = [];
    const path: string[] = [];
    const implicitAssumptions: ImplicitAssumption[] = [];
    const visited = new Set<string>();

    // DFS to trace back to roots
    const trace = (id: string): void => {
      if (visited.has(id)) return;
      visited.add(id);

      const node = graph.nodes.get(id);
      if (!node) return;

      path.push(id);

      // Check if this is a foundational statement
      if (node.type === 'axiom' || node.type === 'definition' || node.type === 'hypothesis') {
        assumptions.push(id);
        return;
      }

      // Trace dependencies
      if (node.derivedFrom && node.derivedFrom.length > 0) {
        for (const depId of node.derivedFrom) {
          trace(depId);
        }
      } else {
        // No explicit dependencies - this might be an implicit assumption
        implicitAssumptions.push({
          id: `impl-trace-${id}`,
          statement: node.statement,
          type: 'existence_assumption',
          usedInStep: id,
          shouldBeExplicit: true,
          suggestedFormulation: `Make explicit: "${node.statement.substring(0, 50)}..."`,
        });
      }
    };

    trace(conclusionId);

    // Check if all assumptions are explicit
    const allAssumptionsExplicit = implicitAssumptions.length === 0;

    return {
      conclusion: conclusionId,
      assumptions: [...new Set(assumptions)],
      path: path.reverse(), // Start from assumptions, end at conclusion
      allAssumptionsExplicit,
      implicitAssumptions,
    };
  }

  /**
   * Perform comprehensive assumption analysis
   *
   * @param decomposition - The proof decomposition to analyze
   * @returns AssumptionAnalysis with detailed findings
   */
  analyzeAssumptions(decomposition: ProofDecomposition): AssumptionAnalysis {
    const { atoms, dependencies } = decomposition;

    // Categorize explicit assumptions
    const explicitAssumptions = atoms.filter(
      (a) => a.type === 'axiom' || a.type === 'definition' || a.type === 'hypothesis'
    );

    // Collect all implicit assumptions from assumption chains
    const allImplicitAssumptions: ImplicitAssumption[] = [];
    const conclusionDependencies = new Map<string, string[]>();

    // Find conclusions and trace their dependencies
    const conclusions = atoms.filter((a) => a.type === 'conclusion');
    for (const conclusion of conclusions) {
      const chain = this.traceToAssumptions(conclusion.id, dependencies);
      conclusionDependencies.set(conclusion.id, chain.assumptions);
      allImplicitAssumptions.push(...chain.implicitAssumptions);
    }

    // If no explicit conclusions, treat leaves as conclusions
    if (conclusions.length === 0) {
      for (const leafId of dependencies.leaves) {
        const chain = this.traceToAssumptions(leafId, dependencies);
        conclusionDependencies.set(leafId, chain.assumptions);
        allImplicitAssumptions.push(...chain.implicitAssumptions);
      }
    }

    // Find unused assumptions
    const usedAssumptions = new Set<string>();
    for (const deps of conclusionDependencies.values()) {
      for (const dep of deps) {
        usedAssumptions.add(dep);
      }
    }

    const unusedAssumptions = explicitAssumptions
      .filter((a) => !usedAssumptions.has(a.id))
      .map((a) => a.id);

    // Compute minimal assumption sets
    const minimalSets = this.findMinimalAssumptions(conclusionDependencies, dependencies);

    // Deduplicate implicit assumptions
    const uniqueImplicit = this.deduplicateImplicit(allImplicitAssumptions);

    return {
      explicitAssumptions,
      implicitAssumptions: uniqueImplicit,
      unusedAssumptions,
      conclusionDependencies,
      minimalSets,
    };
  }

  /**
   * Find minimal sets of assumptions needed for each conclusion
   *
   * Uses a greedy approach to find approximately minimal sets.
   * For exact minimal sets, a SAT solver would be needed.
   */
  findMinimalAssumptions(
    conclusionDependencies: Map<string, string[]>,
    graph: DependencyGraph
  ): Map<string, string[]> {
    const minimalSets = new Map<string, string[]>();

    for (const [conclusion, assumptions] of conclusionDependencies) {
      // Try to find a minimal subset
      const minimal = this.computeMinimalSet(conclusion, assumptions, graph);
      minimalSets.set(conclusion, minimal);
    }

    return minimalSets;
  }

  /**
   * Compute a minimal assumption set for a conclusion
   *
   * Uses backward elimination: try removing each assumption and
   * check if the conclusion is still reachable.
   */
  private computeMinimalSet(
    conclusion: string,
    assumptions: string[],
    graph: DependencyGraph
  ): string[] {
    if (assumptions.length <= 1) return [...assumptions];

    // Start with all assumptions
    let current = [...assumptions];

    // Try removing each assumption
    for (let i = 0; i < current.length; i++) {
      const testSet = [...current.slice(0, i), ...current.slice(i + 1)];

      // Check if conclusion is still reachable from testSet
      if (this.isReachable(testSet, conclusion, graph)) {
        current = testSet;
        i--; // Re-check this index since array shifted
      }
    }

    return current;
  }

  /**
   * Check if a conclusion is reachable from a set of assumptions
   */
  private isReachable(assumptions: string[], conclusion: string, graph: DependencyGraph): boolean {
    const reachable = new Set<string>(assumptions);
    let changed = true;

    while (changed) {
      changed = false;
      for (const [id, node] of graph.nodes) {
        if (reachable.has(id)) continue;

        // Check if all dependencies are reachable
        if (node.derivedFrom && node.derivedFrom.length > 0) {
          const allDepsReachable = node.derivedFrom.every((d) => reachable.has(d));
          if (allDepsReachable) {
            reachable.add(id);
            changed = true;

            if (id === conclusion) return true;
          }
        }
      }
    }

    return reachable.has(conclusion);
  }

  /**
   * Find assumptions that are not used in any derivation
   */
  findUnusedAssumptions(decomposition: ProofDecomposition): string[] {
    const { atoms, dependencies } = decomposition;

    // Find all assumption IDs
    const assumptionIds = new Set(
      atoms
        .filter((a) => a.type === 'axiom' || a.type === 'definition' || a.type === 'hypothesis')
        .map((a) => a.id)
    );

    // Find all referenced assumptions
    const referenced = new Set<string>();
    for (const atom of atoms) {
      if (atom.derivedFrom) {
        for (const depId of atom.derivedFrom) {
          referenced.add(depId);
        }
      }
    }

    // Also check edges
    for (const edge of dependencies.edges) {
      referenced.add(edge.from);
    }

    // Return unused
    return [...assumptionIds].filter((id) => !referenced.has(id));
  }

  /**
   * Check if assumptions are properly discharged in proof by contradiction
   *
   * In proof by contradiction, we assume ¬P to derive a contradiction,
   * then discharge ¬P to conclude P.
   */
  checkAssumptionDischarge(decomposition: ProofDecomposition): DischargeStatus[] {
    const { atoms } = decomposition;
    const statuses: DischargeStatus[] = [];

    // Find hypothetical assumptions (those that should be discharged)
    const hypotheticals = atoms.filter((a) => a.type === 'hypothesis');

    // Find contradiction statements
    const contradictions = atoms.filter(
      (a) =>
        a.statement.toLowerCase().includes('contradiction') ||
        a.statement.includes('⊥') ||
        a.usedInferenceRule === 'contradiction'
    );

    for (const hyp of hypotheticals) {
      // Check if this hypothesis is involved in a contradiction
      const isDischargedByContradiction = contradictions.some(
        (c) => c.derivedFrom?.some((d) => this.dependsOn(d, hyp.id, decomposition.dependencies))
      );

      if (isDischargedByContradiction) {
        statuses.push({
          assumptionId: hyp.id,
          isDischarged: true,
          dischargedAt: contradictions[0]?.id,
          dischargeReason: 'Used in proof by contradiction',
        });
      } else {
        // Check if discharged by implication introduction
        const conclusions = atoms.filter((a) => a.type === 'conclusion');
        const impliesDischarged = conclusions.some(
          (c) =>
            c.statement.toLowerCase().includes('implies') ||
            c.statement.includes('⇒') ||
            c.statement.includes('→')
        );

        if (impliesDischarged) {
          statuses.push({
            assumptionId: hyp.id,
            isDischarged: true,
            dischargedAt: conclusions[0]?.id,
            dischargeReason: 'Used in implication introduction',
          });
        } else {
          statuses.push({
            assumptionId: hyp.id,
            isDischarged: false,
            dischargeReason: 'Hypothesis not discharged - may need attention',
          });
        }
      }
    }

    return statuses;
  }

  /**
   * Check if statement A depends on statement B (transitively)
   */
  private dependsOn(aId: string, bId: string, graph: DependencyGraph): boolean {
    const visited = new Set<string>();

    const check = (id: string): boolean => {
      if (id === bId) return true;
      if (visited.has(id)) return false;
      visited.add(id);

      const node = graph.nodes.get(id);
      if (!node || !node.derivedFrom) return false;

      return node.derivedFrom.some((depId) => check(depId));
    };

    return check(aId);
  }

  /**
   * Get the dependency chain for a specific assumption
   *
   * Shows which statements depend on this assumption.
   */
  getAssumptionImpact(assumptionId: string, graph: DependencyGraph): string[] {
    const dependents: string[] = [];
    const visited = new Set<string>();

    // BFS from assumption to find all dependents
    const queue = [assumptionId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      // Find statements that depend on this one
      for (const [id, node] of graph.nodes) {
        if (node.derivedFrom?.includes(current) && !visited.has(id)) {
          dependents.push(id);
          queue.push(id);
        }
      }
    }

    return dependents;
  }

  /**
   * Deduplicate implicit assumptions based on content similarity
   */
  private deduplicateImplicit(assumptions: ImplicitAssumption[]): ImplicitAssumption[] {
    const seen = new Map<string, ImplicitAssumption>();

    for (const assumption of assumptions) {
      // Use type + normalized statement as key
      const key = `${assumption.type}:${assumption.statement.toLowerCase().trim()}`;
      if (!seen.has(key)) {
        seen.set(key, assumption);
      }
    }

    return [...seen.values()];
  }

  /**
   * Suggest how to strengthen a proof by making assumptions explicit
   */
  getSuggestions(analysis: AssumptionAnalysis): string[] {
    const suggestions: string[] = [];

    // Unused assumptions
    if (analysis.unusedAssumptions.length > 0) {
      suggestions.push(
        `Consider removing ${analysis.unusedAssumptions.length} unused assumption(s): ${analysis.unusedAssumptions.join(', ')}`
      );
    }

    // Implicit assumptions that should be explicit
    const criticalImplicit = analysis.implicitAssumptions.filter((a) => a.shouldBeExplicit);
    if (criticalImplicit.length > 0) {
      suggestions.push(
        `Make ${criticalImplicit.length} implicit assumption(s) explicit for improved rigor`
      );
      for (const imp of criticalImplicit.slice(0, 3)) {
        suggestions.push(`  - ${imp.suggestedFormulation}`);
      }
    }

    // Check for potentially redundant assumptions
    for (const [conclusion, minimal] of analysis.minimalSets) {
      const full = analysis.conclusionDependencies.get(conclusion) || [];
      if (minimal.length < full.length) {
        const redundant = full.filter((a) => !minimal.includes(a));
        if (redundant.length > 0) {
          suggestions.push(
            `For conclusion ${conclusion}: ${redundant.length} assumption(s) may be redundant`
          );
        }
      }
    }

    if (suggestions.length === 0) {
      suggestions.push('Assumption structure appears sound');
    }

    return suggestions;
  }

  /**
   * Validate the assumption structure of a proof
   *
   * Returns true if the proof has a valid assumption structure:
   * - At least one foundational assumption
   * - All conclusions traceable to assumptions
   * - No circular dependencies involving assumptions
   */
  validateStructure(decomposition: ProofDecomposition): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    const { atoms, dependencies } = decomposition;

    // Check for foundational assumptions
    const foundations = atoms.filter(
      (a) => a.type === 'axiom' || a.type === 'definition' || a.type === 'hypothesis'
    );
    if (foundations.length === 0) {
      issues.push('No foundational assumptions (axioms, definitions, or hypotheses) found');
    }

    // Check if roots match foundations
    for (const rootId of dependencies.roots) {
      const root = dependencies.nodes.get(rootId);
      if (
        root &&
        root.type !== 'axiom' &&
        root.type !== 'definition' &&
        root.type !== 'hypothesis'
      ) {
        issues.push(
          `Root statement "${root.statement.substring(0, 30)}..." is not a foundational type`
        );
      }
    }

    // Check for cycles involving assumptions
    if (dependencies.hasCycles) {
      // Check if any assumption is in a cycle
      const cycleNodes = new Set(
        (dependencies.stronglyConnectedComponents || [])
          .filter((scc) => scc.length > 1)
          .flat()
      );

      for (const foundation of foundations) {
        if (cycleNodes.has(foundation.id)) {
          issues.push(
            `Assumption "${foundation.statement.substring(0, 30)}..." is involved in circular reasoning`
          );
        }
      }
    }

    // Check if conclusions are reachable from assumptions
    const conclusions = atoms.filter((a) => a.type === 'conclusion');
    for (const conclusion of conclusions) {
      const chain = this.traceToAssumptions(conclusion.id, dependencies);
      if (chain.assumptions.length === 0 && !chain.allAssumptionsExplicit) {
        issues.push(
          `Conclusion "${conclusion.statement.substring(0, 30)}..." cannot be traced to any assumption`
        );
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }
}
