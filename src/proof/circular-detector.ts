/**
 * Circular Reasoning Detector - Phase 8 Sprint 3
 *
 * Detects circular reasoning, self-referential statements,
 * begging the question, and tautological arguments.
 */

import type {
  AtomicStatement,
  DependencyGraph,
  CircularPath,
  ProofDecomposition,
} from '../types/modes/mathematics.js';

/**
 * Circular reasoning result
 */
export interface CircularReasoningResult {
  hasCircularReasoning: boolean;
  cycles: CircularPath[];
  selfReferentialStatements: string[];
  beggingTheQuestion: string[];
  tautologies: string[];
  summary: string;
}

/**
 * CircularReasoningDetector - Finds circular reasoning in proofs
 */
export class CircularReasoningDetector {
  /**
   * Detect all forms of circular reasoning in a proof
   */
  detectCircularReasoning(decomposition: ProofDecomposition): CircularReasoningResult {
    const { atoms, dependencies } = decomposition;

    // Find dependency cycles
    const cycles = this.findReasoningCycles(dependencies);

    // Find self-referential statements
    const selfReferential = this.findSelfReferential(atoms);

    // Find begging the question
    const begging = this.findBeggingTheQuestion(atoms, dependencies);

    // Find tautologies
    const tautologies = this.findTautologies(atoms);

    const hasCircularReasoning =
      cycles.length > 0 ||
      selfReferential.length > 0 ||
      begging.length > 0;

    return {
      hasCircularReasoning,
      cycles,
      selfReferentialStatements: selfReferential,
      beggingTheQuestion: begging,
      tautologies,
      summary: this.generateSummary(cycles, selfReferential, begging, tautologies),
    };
  }

  /**
   * Check if a single statement is self-referential
   */
  isSelfReferential(statement: AtomicStatement): boolean {
    // Check if derivedFrom includes its own ID
    if (statement.derivedFrom?.includes(statement.id)) {
      return true;
    }

    // Check for self-referential language patterns
    const selfRefPatterns = [
      /this\s+(?:statement|proposition|claim)\s+(?:is|implies)/i,
      /(?:the\s+)?above\s+(?:statement|claim)\s+proves\s+itself/i,
      /by\s+definition\s+of\s+itself/i,
    ];

    return selfRefPatterns.some((p) => p.test(statement.statement));
  }

  /**
   * Find all reasoning cycles using Tarjan's algorithm results
   */
  findReasoningCycles(graph: DependencyGraph): CircularPath[] {
    const cycles: CircularPath[] = [];

    if (!graph.hasCycles) {
      return cycles;
    }

    // Use strongly connected components if available
    if (graph.stronglyConnectedComponents) {
      for (const scc of graph.stronglyConnectedComponents) {
        if (scc.length > 1) {
          cycles.push(this.createCircularPath(scc, graph));
        }
      }
    } else {
      // Fallback: Find cycles manually using DFS
      const visited = new Set<string>();
      const recStack = new Set<string>();
      const parent = new Map<string, string>();

      for (const [nodeId] of graph.nodes) {
        if (!visited.has(nodeId)) {
          this.findCyclesDFS(nodeId, graph, visited, recStack, parent, cycles);
        }
      }
    }

    return cycles;
  }

  /**
   * DFS helper for finding cycles
   */
  private findCyclesDFS(
    nodeId: string,
    graph: DependencyGraph,
    visited: Set<string>,
    recStack: Set<string>,
    parent: Map<string, string>,
    cycles: CircularPath[]
  ): void {
    visited.add(nodeId);
    recStack.add(nodeId);

    // Find children
    for (const edge of graph.edges) {
      if (edge.from === nodeId) {
        const childId = edge.to;

        if (!visited.has(childId)) {
          parent.set(childId, nodeId);
          this.findCyclesDFS(childId, graph, visited, recStack, parent, cycles);
        } else if (recStack.has(childId)) {
          // Found a cycle
          const cyclePath = this.extractCyclePath(childId, nodeId, parent);
          cycles.push(this.createCircularPath(cyclePath, graph));
        }
      }
    }

    recStack.delete(nodeId);
  }

  /**
   * Extract the cycle path from parent map
   */
  private extractCyclePath(
    cycleStart: string,
    cycleEnd: string,
    parent: Map<string, string>
  ): string[] {
    const path: string[] = [cycleEnd];
    let current = cycleEnd;

    while (current !== cycleStart && parent.has(current)) {
      current = parent.get(current)!;
      path.push(current);
    }

    path.push(cycleStart);
    return path.reverse();
  }

  /**
   * Create a CircularPath object from a list of statement IDs
   */
  private createCircularPath(statementIds: string[], graph: DependencyGraph): CircularPath {
    const statements = statementIds.map((id) => graph.nodes.get(id)?.statement || id);

    // Create visual path representation
    const visualPath = statementIds.join(' → ') + ' → ' + statementIds[0];

    // Assess severity based on cycle length and types
    let severity: CircularPath['severity'] = 'minor';
    const conclusionInCycle = statementIds.some((id) => {
      const node = graph.nodes.get(id);
      return node?.type === 'conclusion';
    });
    const hypothesisInCycle = statementIds.some((id) => {
      const node = graph.nodes.get(id);
      return node?.type === 'hypothesis';
    });

    if (conclusionInCycle) {
      severity = 'critical';
    } else if (hypothesisInCycle || statementIds.length > 3) {
      severity = 'significant';
    }

    return {
      statements: statementIds,
      cycleLength: statementIds.length,
      explanation: `Circular reasoning detected: ${statements.map((s) => s.substring(0, 20) + '...').join(' depends on ')} which depends on the first statement`,
      visualPath,
      severity,
    };
  }

  /**
   * Find self-referential statements
   */
  private findSelfReferential(atoms: AtomicStatement[]): string[] {
    return atoms.filter((a) => this.isSelfReferential(a)).map((a) => a.id);
  }

  /**
   * Find instances of begging the question
   * (assuming what needs to be proved)
   */
  findBeggingTheQuestion(
    atoms: AtomicStatement[],
    graph: DependencyGraph
  ): string[] {
    const begging: string[] = [];
    const conclusions = atoms.filter((a) => a.type === 'conclusion');
    const hypotheses = atoms.filter((a) => a.type === 'hypothesis');

    for (const conclusion of conclusions) {
      // Check if the conclusion appears as an assumption
      for (const hypothesis of hypotheses) {
        if (this.statementsEquivalent(conclusion.statement, hypothesis.statement)) {
          begging.push(conclusion.id);
          break;
        }
      }

      // Check if the conclusion is used to derive itself
      if (conclusion.derivedFrom) {
        for (const depId of conclusion.derivedFrom) {
          const dep = graph.nodes.get(depId);
          if (dep && this.statementsEquivalent(conclusion.statement, dep.statement)) {
            begging.push(conclusion.id);
            break;
          }
        }
      }
    }

    return [...new Set(begging)];
  }

  /**
   * Check if two statements are semantically equivalent
   */
  private statementsEquivalent(a: string, b: string): boolean {
    const normalizeStatement = (s: string) => {
      return s
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[.,;:!?]/g, '')
        .trim();
    };

    const normA = normalizeStatement(a);
    const normB = normalizeStatement(b);

    if (normA === normB) return true;

    // Check for equivalent forms by extracting and comparing content
    const checkEquivalence = (a: string, b: string): boolean => {
      // "therefore X" vs "thus X"
      const thereforeMatch = a.match(/therefore\s+(.+)/);
      const thusMatch = b.match(/thus\s+(.+)/);
      if (thereforeMatch && thusMatch && thereforeMatch[1] === thusMatch[1]) return true;

      // "X is true" vs "X"
      const isTrueMatch = a.match(/(.+)\s+is\s+true/);
      if (isTrueMatch && isTrueMatch[1] === b) return true;

      // "it follows that X" vs "X"
      const followsMatch = a.match(/it follows that\s+(.+)/);
      if (followsMatch && followsMatch[1] === b) return true;

      return false;
    };

    if (checkEquivalence(normA, normB) || checkEquivalence(normB, normA)) return true;

    // Check word overlap for near-equivalence
    const wordsA = new Set(normA.split(/\s+/).filter((w) => w.length > 3));
    const wordsB = new Set(normB.split(/\s+/).filter((w) => w.length > 3));

    if (wordsA.size === 0 || wordsB.size === 0) return false;

    let overlap = 0;
    for (const word of wordsA) {
      if (wordsB.has(word)) overlap++;
    }

    // High overlap suggests equivalence
    return overlap / Math.max(wordsA.size, wordsB.size) > 0.8;
  }

  /**
   * Find tautological statements
   * (statements that are trivially true)
   */
  findTautologies(atoms: AtomicStatement[]): string[] {
    const tautologies: string[] = [];

    const tautologyPatterns = [
      /(.+)\s+is\s+\1/i, // "X is X"
      /if\s+(.+)\s+then\s+\1/i, // "if P then P"
      /(.+)\s+or\s+not\s+\1/i, // "P or not P"
      /(.+)\s+implies\s+\1/i, // "P implies P"
      /(?:it is |)true\s+that\s+(.+)\s+is\s+(?:true|the case)/i, // "it is true that X is true"
      /either\s+(.+)\s+or\s+\1/i, // "either P or P"
      /all\s+(\w+)\s+are\s+\1/i, // "all X are X"
    ];

    for (const atom of atoms) {
      for (const pattern of tautologyPatterns) {
        if (pattern.test(atom.statement)) {
          tautologies.push(atom.id);
          break;
        }
      }

      // Check for logical tautologies like "A or not A"
      if (this.isLogicalTautology(atom.statement)) {
        tautologies.push(atom.id);
      }
    }

    return [...new Set(tautologies)];
  }

  /**
   * Check if a statement is a logical tautology
   */
  private isLogicalTautology(statement: string): boolean {
    const normalized = statement.toLowerCase();

    // Check for "P or not P" pattern
    const orNotPattern = /(\b\w+\b)\s+or\s+not\s+\1/;
    if (orNotPattern.test(normalized)) return true;

    // Check for "P or P" (trivially true when P is true)
    const orSamePattern = /(\b\w+\b)\s+or\s+\1\b/;
    if (orSamePattern.test(normalized)) return true;

    // Check for "if P then P"
    const impliesSelf = /if\s+(\b\w+\b).*then\s+\1/;
    if (impliesSelf.test(normalized)) return true;

    return false;
  }

  /**
   * Generate a summary of circular reasoning findings
   */
  private generateSummary(
    cycles: CircularPath[],
    selfReferential: string[],
    begging: string[],
    tautologies: string[]
  ): string {
    const parts: string[] = [];

    if (cycles.length > 0) {
      const criticalCycles = cycles.filter((c) => c.severity === 'critical').length;
      if (criticalCycles > 0) {
        parts.push(`CRITICAL: ${criticalCycles} circular reasoning cycle(s) involving conclusions`);
      } else {
        parts.push(`${cycles.length} circular reasoning cycle(s) detected`);
      }
    }

    if (selfReferential.length > 0) {
      parts.push(`${selfReferential.length} self-referential statement(s)`);
    }

    if (begging.length > 0) {
      parts.push(`${begging.length} instance(s) of begging the question`);
    }

    if (tautologies.length > 0) {
      parts.push(`${tautologies.length} tautological statement(s) (may be intentional)`);
    }

    if (parts.length === 0) {
      return 'No circular reasoning detected. The proof structure appears sound.';
    }

    return parts.join('. ') + '.';
  }

  /**
   * Get detailed analysis of a specific cycle
   */
  analyzeCycle(cycle: CircularPath, graph: DependencyGraph): {
    involvedStatements: AtomicStatement[];
    breakPoints: string[];
    suggestedFix: string;
  } {
    const involvedStatements: AtomicStatement[] = [];
    const breakPoints: string[] = [];

    for (const id of cycle.statements) {
      const node = graph.nodes.get(id);
      if (node) {
        involvedStatements.push(node);

        // A break point is a derived statement that could be independently justified
        if (node.type === 'derived' && node.derivedFrom && node.derivedFrom.length > 1) {
          breakPoints.push(id);
        }
      }
    }

    let suggestedFix: string;
    if (breakPoints.length > 0) {
      suggestedFix = `Consider independently justifying statement(s) ${breakPoints.join(', ')} to break the cycle`;
    } else if (involvedStatements.some((s) => s.type === 'hypothesis')) {
      suggestedFix = 'Review the hypothesis - it may be assuming what needs to be proved';
    } else {
      suggestedFix = 'Add independent justification for one of the statements in the cycle';
    }

    return {
      involvedStatements,
      breakPoints,
      suggestedFix,
    };
  }

  /**
   * Check if proof uses circular argument to establish a conclusion
   */
  conclusionDependsOnItself(
    conclusionId: string,
    graph: DependencyGraph
  ): boolean {
    const conclusion = graph.nodes.get(conclusionId);
    if (!conclusion) return false;

    // BFS to check if conclusion appears in its own derivation
    const visited = new Set<string>();
    const queue = conclusion.derivedFrom ? [...conclusion.derivedFrom] : [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === conclusionId) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const node = graph.nodes.get(current);
      if (node?.derivedFrom) {
        queue.push(...node.derivedFrom.filter((d) => !visited.has(d)));
      }
    }

    return false;
  }
}
