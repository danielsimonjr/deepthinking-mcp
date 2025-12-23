/**
 * Branch Analyzer - Phase 12 Sprint 2
 *
 * Analyzes proof structures to identify independent branches that
 * can potentially be verified in parallel.
 */

import { randomUUID } from 'crypto';
import type { ProofStep } from './decomposer.js';
import type {
  ProofBranch,
  BranchAnalysisResult,
} from './branch-types.js';

/**
 * Options for branch analysis
 */
export interface BranchAnalyzerOptions {
  /** Minimum steps for a branch to be considered meaningful */
  minBranchSize?: number;
  /** Include complexity estimation */
  estimateComplexity?: boolean;
  /** Include metadata extraction */
  extractMetadata?: boolean;
}

/**
 * Internal graph representation for dependency analysis
 */
interface DependencyNode {
  stepIndex: number;
  step: ProofStep;
  dependencies: Set<number>;
  dependents: Set<number>;
}

/**
 * BranchAnalyzer - Identifies independent proof branches
 */
export class BranchAnalyzer {
  private options: Required<BranchAnalyzerOptions>;

  constructor(options: BranchAnalyzerOptions = {}) {
    this.options = {
      minBranchSize: options.minBranchSize ?? 1,
      estimateComplexity: options.estimateComplexity ?? true,
      extractMetadata: options.extractMetadata ?? true,
    };
  }

  /**
   * Analyze a proof and identify independent branches
   *
   * @param steps - The proof steps to analyze
   * @returns BranchAnalysisResult with identified branches
   */
  analyze(steps: ProofStep[]): BranchAnalysisResult {
    if (steps.length === 0) {
      return {
        branches: [],
        executionLevels: [],
        independentCount: 0,
        totalComplexity: 0,
        canParallelize: false,
      };
    }

    // Build dependency graph
    const graph = this.buildDependencyGraph(steps);

    // Partition into branches using connected components
    const branches = this.partitionIntoBranches(graph, steps);

    // Mark independent branches
    this.markIndependentBranches(branches);

    // Get execution order (topological levels)
    const executionLevels = this.getExecutionOrder(branches);

    // Estimate complexity for each branch
    if (this.options.estimateComplexity) {
      for (const branch of branches) {
        branch.estimatedComplexity = this.estimateComplexity(branch);
      }
    }

    // Extract metadata if enabled
    if (this.options.extractMetadata) {
      for (const branch of branches) {
        branch.metadata = this.extractBranchMetadata(branch);
      }
    }

    const independentCount = branches.filter((b) => b.isIndependent).length;
    const totalComplexity = branches.reduce((sum, b) => sum + b.estimatedComplexity, 0);

    return {
      branches,
      executionLevels,
      independentCount,
      totalComplexity,
      canParallelize: independentCount > 1 || executionLevels.some((level) => level.length > 1),
    };
  }

  /**
   * Build a dependency graph from proof steps
   */
  buildDependencyGraph(steps: ProofStep[]): Map<number, DependencyNode> {
    const graph = new Map<number, DependencyNode>();

    // Initialize nodes
    for (let i = 0; i < steps.length; i++) {
      graph.set(i, {
        stepIndex: i,
        step: steps[i],
        dependencies: new Set(),
        dependents: new Set(),
      });
    }

    // Build dependency relationships by analyzing justifications
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const node = graph.get(i)!;

      // Parse justification to find dependencies
      const deps = this.parseDependencies(step, i, steps);
      for (const depIdx of deps) {
        node.dependencies.add(depIdx);
        graph.get(depIdx)?.dependents.add(i);
      }
    }

    return graph;
  }

  /**
   * Parse step justification to find dependencies
   */
  private parseDependencies(step: ProofStep, currentIdx: number, allSteps: ProofStep[]): number[] {
    const deps: number[] = [];
    const justification = step.justification?.toLowerCase() || '';
    const content = step.content.toLowerCase();

    // Check for explicit step references (e.g., "by step 1", "from (1) and (2)")
    const stepRefPattern = /(?:step|(?:\()?)\s*(\d+)(?:\))?/gi;
    let match;
    while ((match = stepRefPattern.exec(justification)) !== null) {
      const refIdx = parseInt(match[1], 10) - 1; // Convert 1-based to 0-based
      if (refIdx >= 0 && refIdx < currentIdx) {
        deps.push(refIdx);
      }
    }

    // Check for labeled references (Lemma 1, Axiom 2, etc.)
    const labelPattern = /(?:lemma|axiom|theorem|claim|hypothesis)\s*(\d+)/gi;
    while ((match = labelPattern.exec(justification)) !== null) {
      // Find the step with this label
      const label = match[0].toLowerCase();
      for (let i = 0; i < currentIdx; i++) {
        if (allSteps[i].content.toLowerCase().includes(label)) {
          deps.push(i);
          break;
        }
      }
    }

    // Check for implicit dependencies (by previous step patterns)
    if (
      justification.includes('previous') ||
      justification.includes('above') ||
      content.includes('therefore') ||
      content.includes('thus') ||
      content.includes('hence')
    ) {
      if (currentIdx > 0 && deps.length === 0) {
        deps.push(currentIdx - 1);
      }
    }

    // Check for "by definition of" or "by axiom" patterns
    if (justification.includes('definition') || justification.includes('axiom')) {
      // Find matching definitions/axioms
      for (let i = 0; i < currentIdx; i++) {
        const stepContent = allSteps[i].content.toLowerCase();
        if (
          (justification.includes('definition') && stepContent.includes('definition')) ||
          (justification.includes('axiom') && stepContent.includes('axiom'))
        ) {
          deps.push(i);
        }
      }
    }

    // If no dependencies found and not a root statement, assume previous step
    if (deps.length === 0 && currentIdx > 0) {
      const contentLower = step.content.toLowerCase();
      if (
        !contentLower.startsWith('axiom') &&
        !contentLower.startsWith('definition') &&
        !contentLower.startsWith('assume') &&
        !contentLower.startsWith('suppose') &&
        !contentLower.startsWith('given') &&
        !contentLower.startsWith('let')
      ) {
        deps.push(currentIdx - 1);
      }
    }

    return [...new Set(deps)];
  }

  /**
   * Partition graph into branches using connected components
   */
  partitionIntoBranches(
    graph: Map<number, DependencyNode>,
    steps: ProofStep[]
  ): ProofBranch[] {
    const visited = new Set<number>();
    const branches: ProofBranch[] = [];

    // Find connected components considering bidirectional connectivity
    const findComponent = (start: number): Set<number> => {
      const component = new Set<number>();
      const stack = [start];

      while (stack.length > 0) {
        const idx = stack.pop()!;
        if (visited.has(idx)) continue;
        visited.add(idx);
        component.add(idx);

        const node = graph.get(idx)!;
        // Add dependencies and dependents to explore
        for (const dep of node.dependencies) {
          if (!visited.has(dep)) stack.push(dep);
        }
        for (const dependent of node.dependents) {
          if (!visited.has(dependent)) stack.push(dependent);
        }
      }

      return component;
    };

    // Process all nodes
    for (let i = 0; i < steps.length; i++) {
      if (visited.has(i)) continue;

      const component = findComponent(i);
      if (component.size >= this.options.minBranchSize) {
        const branchSteps = [...component]
          .sort((a, b) => a - b)
          .map((idx) => steps[idx]);

        const dependencies: string[] = [];
        const dependents: string[] = [];

        // Find external dependencies (to other branches)
        for (const idx of component) {
          const n = graph.get(idx)!;
          for (const dep of n.dependencies) {
            if (!component.has(dep)) {
              dependencies.push(`branch-containing-step-${dep + 1}`);
            }
          }
          for (const dep of n.dependents) {
            if (!component.has(dep)) {
              dependents.push(`branch-containing-step-${dep + 1}`);
            }
          }
        }

        branches.push({
          id: randomUUID(),
          name: `Branch ${branches.length + 1}`,
          steps: branchSteps,
          dependencies: [...new Set(dependencies)],
          dependents: [...new Set(dependents)],
          isIndependent: false, // Will be set later
          estimatedComplexity: 0, // Will be computed later
        });
      }
    }

    // Update branch dependencies to use actual branch IDs
    this.resolveBranchDependencies(branches, graph, steps);

    return branches;
  }

  /**
   * Resolve branch dependencies to use actual branch IDs
   */
  private resolveBranchDependencies(
    branches: ProofBranch[],
    graph: Map<number, DependencyNode>,
    steps: ProofStep[]
  ): void {
    // Build step-to-branch map
    const stepToBranch = new Map<number, string>();
    for (const branch of branches) {
      for (let i = 0; i < steps.length; i++) {
        if (branch.steps.includes(steps[i])) {
          stepToBranch.set(i, branch.id);
        }
      }
    }

    // Update dependencies to use branch IDs
    for (const branch of branches) {
      const newDeps: string[] = [];
      const newDependents: string[] = [];

      // Find all step indices in this branch
      const branchStepIndices: number[] = [];
      for (let i = 0; i < steps.length; i++) {
        if (branch.steps.includes(steps[i])) {
          branchStepIndices.push(i);
        }
      }

      // Check each step's dependencies
      for (const stepIdx of branchStepIndices) {
        const node = graph.get(stepIdx)!;
        for (const depIdx of node.dependencies) {
          const depBranchId = stepToBranch.get(depIdx);
          if (depBranchId && depBranchId !== branch.id) {
            newDeps.push(depBranchId);
          }
        }
        for (const depIdx of node.dependents) {
          const depBranchId = stepToBranch.get(depIdx);
          if (depBranchId && depBranchId !== branch.id) {
            newDependents.push(depBranchId);
          }
        }
      }

      branch.dependencies = [...new Set(newDeps)];
      branch.dependents = [...new Set(newDependents)];
    }
  }

  /**
   * Mark branches that have no dependencies as independent
   */
  markIndependentBranches(branches: ProofBranch[]): void {
    for (const branch of branches) {
      branch.isIndependent = branch.dependencies.length === 0;
    }
  }

  /**
   * Get execution order as topological levels (branches at same level can run in parallel)
   */
  getExecutionOrder(branches: ProofBranch[]): ProofBranch[][] {
    if (branches.length === 0) return [];

    const levels: ProofBranch[][] = [];
    const assigned = new Set<string>();

    // Kahn's algorithm for topological sort with level grouping
    while (assigned.size < branches.length) {
      const currentLevel: ProofBranch[] = [];

      for (const branch of branches) {
        if (assigned.has(branch.id)) continue;

        // Check if all dependencies are already assigned
        const depsAssigned = branch.dependencies.every((depId) => assigned.has(depId));
        if (depsAssigned) {
          currentLevel.push(branch);
        }
      }

      if (currentLevel.length === 0) {
        // Cycle detected or remaining branches have unresolved dependencies
        // Add remaining branches to final level
        for (const branch of branches) {
          if (!assigned.has(branch.id)) {
            currentLevel.push(branch);
          }
        }
      }

      for (const branch of currentLevel) {
        assigned.add(branch.id);
      }

      if (currentLevel.length > 0) {
        levels.push(currentLevel);
      }
    }

    return levels;
  }

  /**
   * Estimate complexity of a branch for load balancing
   */
  estimateComplexity(branch: ProofBranch): number {
    let complexity = 0;

    for (const step of branch.steps) {
      // Base complexity per step
      complexity += 1;

      // Add complexity for step length
      complexity += step.content.length / 100;

      // Add complexity for mathematical notation (heuristic)
      if (step.latex) {
        complexity += step.latex.length / 50;
      }

      // Add complexity for certain keywords
      const content = step.content.toLowerCase();
      if (content.includes('induction')) complexity += 3;
      if (content.includes('contradiction')) complexity += 2;
      if (content.includes('cases')) complexity += 2;
      if (content.includes('limit')) complexity += 2;
      if (content.includes('integral')) complexity += 3;
      if (content.includes('derivative')) complexity += 2;
      if (content.includes('converge')) complexity += 2;
    }

    return Math.round(complexity * 10) / 10;
  }

  /**
   * Extract metadata from a branch
   */
  private extractBranchMetadata(branch: ProofBranch): ProofBranch['metadata'] {
    const assumptions: string[] = [];
    let reasoningType = 'direct';

    for (const step of branch.steps) {
      const content = step.content.toLowerCase();

      // Extract assumptions
      if (
        content.startsWith('assume') ||
        content.startsWith('suppose') ||
        content.startsWith('given')
      ) {
        assumptions.push(step.content);
      }

      // Detect reasoning type
      if (content.includes('induction')) {
        reasoningType = 'induction';
      } else if (content.includes('contradiction') || content.includes('absurd')) {
        reasoningType = 'contradiction';
      } else if (content.includes('case') && content.includes(':')) {
        reasoningType = 'case_analysis';
      } else if (content.includes('contrapositive')) {
        reasoningType = 'contrapositive';
      }
    }

    return {
      reasoningType,
      assumptions: assumptions.length > 0 ? assumptions : undefined,
      depth: 0, // Can be set by external context
    };
  }

  /**
   * Get statistics about branch analysis
   */
  getStatistics(result: BranchAnalysisResult): {
    totalBranches: number;
    independentBranches: number;
    maxParallelism: number;
    totalSteps: number;
    avgBranchSize: number;
    avgComplexity: number;
  } {
    const totalSteps = result.branches.reduce((sum, b) => sum + b.steps.length, 0);
    const maxParallelism = Math.max(...result.executionLevels.map((l) => l.length), 0);
    const avgComplexity =
      result.branches.length > 0 ? result.totalComplexity / result.branches.length : 0;

    return {
      totalBranches: result.branches.length,
      independentBranches: result.independentCount,
      maxParallelism,
      totalSteps,
      avgBranchSize: result.branches.length > 0 ? totalSteps / result.branches.length : 0,
      avgComplexity: Math.round(avgComplexity * 10) / 10,
    };
  }
}
