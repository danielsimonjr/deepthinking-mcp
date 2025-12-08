/**
 * Recursive Reasoning Mode (v3.4.0)
 * Phase 4E Task 8.6 (File Task 29): Reasoning with recursion and self-reference
 */

import type { BaseThought, ThinkingMode } from '../types/index.js';

/**
 * Recursion type
 */
export type RecursionType =
  | 'direct' // Direct recursion: f calls f
  | 'indirect' // Indirect recursion: f calls g calls f
  | 'tail' // Tail recursion (optimizable)
  | 'tree' // Tree recursion (multiple branches)
  | 'mutual' // Mutual recursion between functions
  | 'nested' // Nested recursion
  | 'structural' // Structural recursion on data structures
  | 'generative' // Generative recursion
  | 'corecursion'; // Corecursion (produces infinite structures)

/**
 * Recursion strategy
 */
export type RecursionStrategy =
  | 'divide_and_conquer' // Split problem into subproblems
  | 'decrease_and_conquer' // Reduce problem size by constant
  | 'dynamic_programming' // Memoization/tabulation
  | 'backtracking' // Backtracking with recursion
  | 'branch_and_bound' // Branch and bound
  | 'exhaustive_search' // Exhaustive recursive search
  | 'greedy_recursive' // Greedy with recursion
  | 'transformation'; // Transform and recurse

/**
 * Recursive problem
 */
export interface RecursiveProblem {
  id: string;
  name: string;
  description: string;
  baseCase: BaseCase;
  recursiveCase: RecursiveCase;
  type: RecursionType;
  strategy: RecursionStrategy;
  input: any;
  expectedOutput?: any;
}

/**
 * Base case
 */
export interface BaseCase {
  condition: string;
  value: any;
  description: string;
  check: (input: any) => boolean;
  compute: (input: any) => any;
}

/**
 * Recursive case
 */
export interface RecursiveCase {
  decomposition: string;
  description: string;
  decompose: (input: any) => any[];
  combine: (results: any[]) => any;
}

/**
 * Recursive call
 */
export interface RecursiveCall {
  id: string;
  depth: number;
  input: any;
  output?: any;
  parentId?: string;
  children: string[];
  timestamp: number;
  memoized: boolean;
}

/**
 * Call tree node
 */
export interface CallTreeNode {
  call: RecursiveCall;
  children: CallTreeNode[];
  subtreeSize: number;
  subtreeHeight: number;
}

/**
 * Recursion trace
 */
export interface RecursionTrace {
  calls: Map<string, RecursiveCall>;
  callTree: CallTreeNode;
  maxDepth: number;
  totalCalls: number;
  memoizedHits: number;
  executionTime: number;
}

/**
 * Recurrence relation
 */
export interface RecurrenceRelation {
  formula: string;
  variables: string[];
  baseConditions: Map<string, any>;
  recursiveFormula: string;
  closedForm?: string; // Analytical solution if known
  complexity?: string; // Time complexity
}

/**
 * Recursive solution
 */
export interface RecursiveSolution {
  problem: RecursiveProblem;
  result: any;
  trace: RecursionTrace;
  recurrence: RecurrenceRelation;
  analysis: RecursionAnalysis;
  optimized: boolean;
  memoizationUsed: boolean;
}

/**
 * Recursion analysis
 */
export interface RecursionAnalysis {
  recursionType: RecursionType;
  strategy: RecursionStrategy;
  terminates: boolean | 'unknown';
  terminationProof?: string;
  maxDepth: number;
  averageBranchingFactor: number;
  timeComplexity: string;
  spaceComplexity: string;
  optimizationOpportunities: string[];
  potentialIssues: string[];
}

/**
 * Recursive reasoning thought
 */
export interface RecursiveReasoningThought extends BaseThought {
  mode: ThinkingMode.RECURSIVE;
  problem: RecursiveProblem;
  solution: RecursiveSolution;
  callTree: CallTreeNode;
  recurrenceRelations: RecurrenceRelation[];
  analysis: RecursionAnalysis;
}

/**
 * Memoization cache
 */
class MemoizationCache {
  private cache: Map<string, any>;
  private hits: number;
  private misses: number;

  constructor() {
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  get(key: string): any | undefined {
    if (this.cache.has(key)) {
      this.hits++;
      return this.cache.get(key);
    }
    this.misses++;
    return undefined;
  }

  set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  getHits(): number {
    return this.hits;
  }

  getMisses(): number {
    return this.misses;
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

/**
 * Recursive reasoning engine
 */
export class RecursiveReasoningEngine {
  private memoCache: MemoizationCache;
  private callStack: RecursiveCall[];
  private allCalls: Map<string, RecursiveCall>;
  private callCounter: number;

  constructor() {
    this.memoCache = new MemoizationCache();
    this.callStack = [];
    this.allCalls = new Map();
    this.callCounter = 0;
  }

  /**
   * Create recursive problem
   */
  createProblem(
    name: string,
    description: string,
    baseCase: BaseCase,
    recursiveCase: RecursiveCase,
    type: RecursionType,
    strategy: RecursionStrategy
  ): RecursiveProblem {
    return {
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name,
      description,
      baseCase,
      recursiveCase,
      type,
      strategy,
      input: null,
    };
  }

  /**
   * Solve recursive problem
   */
  solveRecursive(problem: RecursiveProblem, input: any, useMemoization: boolean = true): RecursiveSolution {
    const startTime = Date.now();

    // Reset state
    this.memoCache.clear();
    this.callStack = [];
    this.allCalls.clear();
    this.callCounter = 0;

    // Solve recursively
    const result = this.recursiveHelper(problem, input, useMemoization);

    const executionTime = Date.now() - startTime;

    // Build call tree
    const rootCall = Array.from(this.allCalls.values()).find(c => c.depth === 0)!;
    const callTree = this.buildCallTree(rootCall);

    // Compute max depth
    const maxDepth = Math.max(...Array.from(this.allCalls.values()).map(c => c.depth));

    // Build trace
    const trace: RecursionTrace = {
      calls: this.allCalls,
      callTree,
      maxDepth,
      totalCalls: this.allCalls.size,
      memoizedHits: this.memoCache.getHits(),
      executionTime,
    };

    // Analyze
    const analysis = this.analyzeRecursion(problem, trace);

    // Derive recurrence relation
    const recurrence = this.deriveRecurrence(problem);

    return {
      problem,
      result,
      trace,
      recurrence,
      analysis,
      optimized: useMemoization && this.memoCache.getHits() > 0,
      memoizationUsed: useMemoization,
    };
  }

  /**
   * Recursive helper with tracing
   */
  private recursiveHelper(problem: RecursiveProblem, input: any, useMemoization: boolean): any {
    const depth = this.callStack.length;
    const callId = `call_${this.callCounter++}`;
    const parentId = this.callStack.length > 0 ? this.callStack[this.callStack.length - 1].id : undefined;

    // Create call record
    const call: RecursiveCall = {
      id: callId,
      depth,
      input,
      parentId,
      children: [],
      timestamp: Date.now(),
      memoized: false,
    };

    this.allCalls.set(callId, call);
    if (parentId) {
      const parent = this.allCalls.get(parentId);
      if (parent) parent.children.push(callId);
    }

    this.callStack.push(call);

    // Check memoization
    if (useMemoization) {
      const key = JSON.stringify(input);
      if (this.memoCache.has(key)) {
        call.output = this.memoCache.get(key);
        call.memoized = true;
        this.callStack.pop();
        return call.output;
      }
    }

    // Base case
    if (problem.baseCase.check(input)) {
      call.output = problem.baseCase.compute(input);
      this.callStack.pop();
      return call.output;
    }

    // Recursive case
    const subproblems = problem.recursiveCase.decompose(input);
    const subresults = subproblems.map(sub => this.recursiveHelper(problem, sub, useMemoization));
    const result = problem.recursiveCase.combine(subresults);

    call.output = result;
    this.callStack.pop();

    // Memoize
    if (useMemoization) {
      const key = JSON.stringify(input);
      this.memoCache.set(key, result);
    }

    return result;
  }

  /**
   * Build call tree from calls
   */
  private buildCallTree(root: RecursiveCall): CallTreeNode {
    const children = root.children.map(childId => {
      const childCall = this.allCalls.get(childId)!;
      return this.buildCallTree(childCall);
    });

    const subtreeSize = 1 + children.reduce((sum, child) => sum + child.subtreeSize, 0);
    const subtreeHeight = children.length > 0 ? 1 + Math.max(...children.map(c => c.subtreeHeight)) : 1;

    return {
      call: root,
      children,
      subtreeSize,
      subtreeHeight,
    };
  }

  /**
   * Analyze recursion
   */
  private analyzeRecursion(problem: RecursiveProblem, trace: RecursionTrace): RecursionAnalysis {
    const totalCalls = trace.totalCalls;
    const maxDepth = trace.maxDepth;

    // Compute average branching factor
    let totalChildren = 0;
    let nonLeafNodes = 0;
    for (const call of trace.calls.values()) {
      if (call.children.length > 0) {
        totalChildren += call.children.length;
        nonLeafNodes++;
      }
    }
    const averageBranchingFactor = nonLeafNodes > 0 ? totalChildren / nonLeafNodes : 1;

    // Estimate complexity
    let timeComplexity = 'O(?)';
    let spaceComplexity = `O(${maxDepth})`;

    if (problem.strategy === 'divide_and_conquer') {
      if (averageBranchingFactor === 2) {
        timeComplexity = 'O(n log n)';
      } else {
        timeComplexity = `O(n^${Math.log2(averageBranchingFactor)})`;
      }
    } else if (problem.strategy === 'dynamic_programming') {
      timeComplexity = 'O(n)';
    } else if (problem.type === 'tail') {
      timeComplexity = 'O(n)';
      spaceComplexity = 'O(1)'; // With tail call optimization
    }

    // Check termination
    const terminates: boolean | 'unknown' = maxDepth < 10000 ? true : 'unknown';

    // Optimization opportunities
    const optimizationOpportunities: string[] = [];
    if (problem.type !== 'tail') {
      optimizationOpportunities.push('Convert to tail recursion');
    }
    const firstCall = trace.calls.values().next().value;
    if (firstCall && !firstCall.memoized && problem.strategy !== 'dynamic_programming') {
      optimizationOpportunities.push('Add memoization');
    }
    if (averageBranchingFactor > 2) {
      optimizationOpportunities.push('Consider iterative approach');
    }

    // Potential issues
    const potentialIssues: string[] = [];
    if (maxDepth > 1000) {
      potentialIssues.push('Risk of stack overflow');
    }
    if (totalCalls > 10000) {
      potentialIssues.push('High computational cost');
    }
    if (trace.memoizedHits === 0 && totalCalls > 100) {
      potentialIssues.push('Redundant computation without memoization');
    }

    return {
      recursionType: problem.type,
      strategy: problem.strategy,
      terminates,
      maxDepth,
      averageBranchingFactor,
      timeComplexity,
      spaceComplexity,
      optimizationOpportunities,
      potentialIssues,
    };
  }

  /**
   * Derive recurrence relation
   */
  private deriveRecurrence(problem: RecursiveProblem): RecurrenceRelation {
    // This is simplified - in practice would need more sophisticated analysis
    let formula = 'T(n)';
    let recursiveFormula = '';

    if (problem.strategy === 'divide_and_conquer') {
      recursiveFormula = 'T(n) = 2·T(n/2) + O(n)';
      formula = 'T(n)';
    } else if (problem.strategy === 'decrease_and_conquer') {
      recursiveFormula = 'T(n) = T(n-1) + O(1)';
      formula = 'T(n)';
    } else if (problem.strategy === 'dynamic_programming') {
      recursiveFormula = 'T(n) = T(n-1) + O(1) with memoization';
      formula = 'T(n)';
    }

    const baseConditions = new Map<string, any>();
    baseConditions.set('T(0)', problem.baseCase.value);
    baseConditions.set('T(1)', problem.baseCase.value);

    return {
      formula,
      variables: ['n'],
      baseConditions,
      recursiveFormula,
      complexity: 'O(n)',
    };
  }

  /**
   * Generate call tree visualization (DOT format)
   */
  generateCallTreeDot(callTree: CallTreeNode): string {
    let dot = 'digraph CallTree {\n';
    dot += '  node [shape=box, style=rounded];\n';
    dot += '  rankdir=TB;\n\n';

    const traverse = (node: CallTreeNode) => {
      const label = `${node.call.id}\\nDepth: ${node.call.depth}\\nInput: ${JSON.stringify(node.call.input)}\\nOutput: ${JSON.stringify(node.call.output)}`;
      const color = node.call.memoized ? 'lightblue' : 'white';
      dot += `  ${node.call.id} [label="${label}", fillcolor="${color}", style=filled];\n`;

      for (const child of node.children) {
        dot += `  ${node.call.id} -> ${child.call.id};\n`;
        traverse(child);
      }
    };

    traverse(callTree);
    dot += '}\n';

    return dot;
  }

  /**
   * Generate summary
   */
  generateSummary(solution: RecursiveSolution): string {
    const report: string[] = [];

    report.push('# Recursive Reasoning Summary');
    report.push('');

    report.push('## Problem Definition');
    report.push(`- **Name:** ${solution.problem.name}`);
    report.push(`- **Description:** ${solution.problem.description}`);
    report.push(`- **Type:** ${solution.analysis.recursionType}`);
    report.push(`- **Strategy:** ${solution.analysis.strategy}`);
    report.push('');

    report.push('## Base Case');
    report.push(`- **Condition:** ${solution.problem.baseCase.condition}`);
    report.push(`- **Value:** ${solution.problem.baseCase.value}`);
    report.push('');

    report.push('## Recursive Case');
    report.push(`- **Decomposition:** ${solution.problem.recursiveCase.decomposition}`);
    report.push(`- **Description:** ${solution.problem.recursiveCase.description}`);
    report.push('');

    report.push('## Solution');
    report.push(`- **Result:** ${JSON.stringify(solution.result)}`);
    report.push(`- **Total Calls:** ${solution.trace.totalCalls}`);
    report.push(`- **Max Depth:** ${solution.trace.maxDepth}`);
    report.push(`- **Execution Time:** ${solution.trace.executionTime}ms`);
    if (solution.memoizationUsed) {
      report.push(`- **Memoization Hits:** ${solution.trace.memoizedHits}`);
    }
    report.push('');

    report.push('## Complexity Analysis');
    report.push(`- **Time Complexity:** ${solution.analysis.timeComplexity}`);
    report.push(`- **Space Complexity:** ${solution.analysis.spaceComplexity}`);
    report.push(`- **Average Branching Factor:** ${solution.analysis.averageBranchingFactor.toFixed(2)}`);
    report.push('');

    report.push('## Recurrence Relation');
    report.push(`- **Recursive Formula:** ${solution.recurrence.recursiveFormula}`);
    if (solution.recurrence.closedForm) {
      report.push(`- **Closed Form:** ${solution.recurrence.closedForm}`);
    }
    report.push('');

    if (solution.analysis.optimizationOpportunities.length > 0) {
      report.push('## Optimization Opportunities');
      for (const opp of solution.analysis.optimizationOpportunities) {
        report.push(`- ${opp}`);
      }
      report.push('');
    }

    if (solution.analysis.potentialIssues.length > 0) {
      report.push('## Potential Issues');
      for (const issue of solution.analysis.potentialIssues) {
        report.push(`- ⚠️ ${issue}`);
      }
      report.push('');
    }

    report.push('## Termination');
    report.push(
      `- **Terminates:** ${solution.analysis.terminates === true ? 'Yes' : solution.analysis.terminates === false ? 'No' : 'Unknown'}`
    );
    if (solution.analysis.terminationProof) {
      report.push(`- **Proof:** ${solution.analysis.terminationProof}`);
    }

    return report.join('\n');
  }

  /**
   * Classic examples factory
   */
  createFactorialProblem(): RecursiveProblem {
    return this.createProblem(
      'Factorial',
      'Compute n! = n × (n-1) × ... × 1',
      {
        condition: 'n === 0 || n === 1',
        value: 1,
        description: 'Base case: 0! = 1, 1! = 1',
        check: (n: number) => n === 0 || n === 1,
        compute: () => 1,
      },
      {
        decomposition: 'n! = n × (n-1)!',
        description: 'Recursive case: multiply n by factorial of (n-1)',
        decompose: (n: number) => [n - 1],
        combine: (results: number[]) => (this.callStack[this.callStack.length - 1].input as number) * results[0],
      },
      'direct',
      'decrease_and_conquer'
    );
  }

  createFibonacciProblem(): RecursiveProblem {
    return this.createProblem(
      'Fibonacci',
      'Compute nth Fibonacci number: F(n) = F(n-1) + F(n-2)',
      {
        condition: 'n === 0 || n === 1',
        value: 1,
        description: 'Base case: F(0) = 0, F(1) = 1',
        check: (n: number) => n === 0 || n === 1,
        compute: (n: number) => n,
      },
      {
        decomposition: 'F(n) = F(n-1) + F(n-2)',
        description: 'Recursive case: sum of two previous Fibonacci numbers',
        decompose: (n: number) => [n - 1, n - 2],
        combine: (results: number[]) => results[0] + results[1],
      },
      'tree',
      'dynamic_programming'
    );
  }
}
