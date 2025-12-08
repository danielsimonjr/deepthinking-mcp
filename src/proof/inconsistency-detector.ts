/**
 * Inconsistency Detector - Phase 8 Sprint 3
 *
 * Detects logical inconsistencies, contradictions, and other
 * issues in mathematical proofs.
 */

import type {
  AtomicStatement,
  DependencyGraph,
  Inconsistency,
  ProofDecomposition,
} from '../types/modes/mathematics.js';

/**
 * Contradiction pattern for syntactic matching
 */
interface ContradictionPattern {
  positive: RegExp;
  negative: RegExp;
  description: string;
}

/**
 * Configuration for inconsistency detection
 */
export interface InconsistencyDetectorConfig {
  /** Enable strict type checking */
  strictTyping: boolean;
  /** Enable domain violation detection */
  checkDomains: boolean;
  /** Enable quantifier error detection */
  checkQuantifiers: boolean;
  /** Maximum statements to compare for contradictions */
  maxPairwiseComparisons: number;
}

const DEFAULT_CONFIG: InconsistencyDetectorConfig = {
  strictTyping: true,
  checkDomains: true,
  checkQuantifiers: true,
  maxPairwiseComparisons: 1000,
};

/**
 * InconsistencyDetector - Finds logical inconsistencies in proofs
 */
export class InconsistencyDetector {
  private config: InconsistencyDetectorConfig;
  private contradictionPatterns: ContradictionPattern[];

  constructor(config: Partial<InconsistencyDetectorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.contradictionPatterns = this.initializePatterns();
  }

  /**
   * Initialize contradiction patterns for syntactic matching
   */
  private initializePatterns(): ContradictionPattern[] {
    return [
      // Inequality contradictions
      {
        positive: /(\w+)\s*>\s*0/,
        negative: /(\w+)\s*(?:<=|≤)\s*0/,
        description: 'Positive and non-positive contradiction',
      },
      {
        positive: /(\w+)\s*<\s*0/,
        negative: /(\w+)\s*(?:>=|≥)\s*0/,
        description: 'Negative and non-negative contradiction',
      },
      {
        positive: /(\w+)\s*=\s*0/,
        negative: /(\w+)\s*(?:!=|≠|<>)\s*0/,
        description: 'Zero and non-zero contradiction',
      },
      // Boolean contradictions
      {
        positive: /(\w+)\s+is\s+true/i,
        negative: /(\w+)\s+is\s+false/i,
        description: 'True and false contradiction',
      },
      // Property contradictions
      {
        positive: /(\w+)\s+is\s+even/i,
        negative: /(\w+)\s+is\s+odd/i,
        description: 'Even and odd contradiction',
      },
      {
        positive: /(\w+)\s+is\s+positive/i,
        negative: /(\w+)\s+is\s+(?:negative|non-positive)/i,
        description: 'Positive property contradiction',
      },
      {
        positive: /(\w+)\s+is\s+rational/i,
        negative: /(\w+)\s+is\s+irrational/i,
        description: 'Rational and irrational contradiction',
      },
      {
        positive: /(\w+)\s+is\s+finite/i,
        negative: /(\w+)\s+is\s+infinite/i,
        description: 'Finite and infinite contradiction',
      },
      // Existence contradictions
      {
        positive: /(?:there\s+)?exists?\s+(\w+)/i,
        negative: /(?:no|does\s+not\s+exist|cannot\s+exist)\s+(\w+)/i,
        description: 'Existence contradiction',
      },
    ];
  }

  /**
   * Analyze a proof decomposition for inconsistencies
   */
  analyze(decomposition: ProofDecomposition): Inconsistency[] {
    const { atoms, dependencies } = decomposition;
    const inconsistencies: Inconsistency[] = [];
    let inconsistencyCount = 0;

    // Direct contradictions (P and ¬P)
    const contradictions = this.detectContradictions(atoms);
    inconsistencies.push(
      ...contradictions.map((c) => ({
        ...c,
        id: `inc-${++inconsistencyCount}`,
      }))
    );

    // Type mismatches
    if (this.config.strictTyping) {
      const typeMismatches = this.detectTypeMismatches(atoms);
      inconsistencies.push(
        ...typeMismatches.map((t) => ({
          ...t,
          id: `inc-${++inconsistencyCount}`,
        }))
      );
    }

    // Domain violations
    if (this.config.checkDomains) {
      const domainViolations = this.detectDomainViolations(atoms);
      inconsistencies.push(
        ...domainViolations.map((d) => ({
          ...d,
          id: `inc-${++inconsistencyCount}`,
        }))
      );
    }

    // Undefined operations
    const undefinedOps = this.detectUndefinedOperations(atoms);
    inconsistencies.push(
      ...undefinedOps.map((u) => ({
        ...u,
        id: `inc-${++inconsistencyCount}`,
      }))
    );

    // Axiom conflicts
    const axiomConflicts = this.detectAxiomConflicts(atoms);
    inconsistencies.push(
      ...axiomConflicts.map((a) => ({
        ...a,
        id: `inc-${++inconsistencyCount}`,
      }))
    );

    // Quantifier errors
    if (this.config.checkQuantifiers) {
      const quantifierErrors = this.detectQuantifierErrors(atoms, dependencies);
      inconsistencies.push(
        ...quantifierErrors.map((q) => ({
          ...q,
          id: `inc-${++inconsistencyCount}`,
        }))
      );
    }

    return inconsistencies;
  }

  /**
   * Detect direct contradictions (P and ¬P)
   */
  detectContradictions(atoms: AtomicStatement[]): Omit<Inconsistency, 'id'>[] {
    const contradictions: Omit<Inconsistency, 'id'>[] = [];

    // Limit pairwise comparisons
    const limit = Math.min(atoms.length, Math.sqrt(this.config.maxPairwiseComparisons));

    for (let i = 0; i < Math.min(atoms.length, limit); i++) {
      for (let j = i + 1; j < Math.min(atoms.length, limit); j++) {
        const stmtA = atoms[i];
        const stmtB = atoms[j];

        // Check syntactic negation
        if (this.isSyntacticNegation(stmtA.statement, stmtB.statement)) {
          contradictions.push({
            type: 'direct_contradiction',
            involvedStatements: [stmtA.id, stmtB.id],
            explanation: `Statement "${stmtA.statement.substring(0, 40)}..." directly contradicts "${stmtB.statement.substring(0, 40)}..."`,
            severity: 'critical',
            suggestedResolution: 'Review the derivation of both statements to find the error',
          });
        }

        // Check pattern-based contradictions
        for (const pattern of this.contradictionPatterns) {
          const matchA = stmtA.statement.match(pattern.positive);
          const matchB = stmtB.statement.match(pattern.negative);

          if (matchA && matchB && matchA[1] === matchB[1]) {
            contradictions.push({
              type: 'direct_contradiction',
              involvedStatements: [stmtA.id, stmtB.id],
              explanation: `${pattern.description}: "${matchA[1]}" has conflicting properties`,
              severity: 'critical',
              suggestedResolution: 'Check the assumptions about the variable',
            });
          }

          // Also check reverse order
          const matchA2 = stmtA.statement.match(pattern.negative);
          const matchB2 = stmtB.statement.match(pattern.positive);

          if (matchA2 && matchB2 && matchA2[1] === matchB2[1]) {
            contradictions.push({
              type: 'direct_contradiction',
              involvedStatements: [stmtA.id, stmtB.id],
              explanation: `${pattern.description}: "${matchA2[1]}" has conflicting properties`,
              severity: 'critical',
              suggestedResolution: 'Check the assumptions about the variable',
            });
          }
        }
      }
    }

    return contradictions;
  }

  /**
   * Check if two statements are syntactic negations
   */
  private isSyntacticNegation(a: string, b: string): boolean {
    const normalA = a.toLowerCase().trim();
    const normalB = b.toLowerCase().trim();

    // Check for "P" and "not P" pattern
    if (normalB === `not ${normalA}` || normalA === `not ${normalB}`) {
      return true;
    }

    // Check for "P" and "¬P" pattern
    if (normalB === `¬ ${normalA}` || normalB === `¬${normalA}`) {
      return true;
    }
    if (normalA === `¬ ${normalB}` || normalA === `¬${normalB}`) {
      return true;
    }

    // Check "P is true" vs "P is false"
    const trueMatch = normalA.match(/^(.+) is true$/);
    const falseMatch = normalB.match(/^(.+) is false$/);
    if (trueMatch && falseMatch && trueMatch[1] === falseMatch[1]) {
      return true;
    }

    // Check reverse
    const trueMatch2 = normalB.match(/^(.+) is true$/);
    const falseMatch2 = normalA.match(/^(.+) is false$/);
    if (trueMatch2 && falseMatch2 && trueMatch2[1] === falseMatch2[1]) {
      return true;
    }

    // Check "P holds" vs "P does not hold"
    const holdsMatch = normalA.match(/^(.+) holds$/);
    const notHoldsMatch = normalB.match(/^(.+) does not hold$/);
    if (holdsMatch && notHoldsMatch && holdsMatch[1] === notHoldsMatch[1]) {
      return true;
    }

    // Check "it is true that P" vs "it is false that P"
    const itTrueMatch = normalA.match(/^it is true that (.+)$/);
    const itFalseMatch = normalB.match(/^it is false that (.+)$/);
    if (itTrueMatch && itFalseMatch && itTrueMatch[1] === itFalseMatch[1]) {
      return true;
    }

    return false;
  }

  /**
   * Detect type mismatches
   */
  detectTypeMismatches(atoms: AtomicStatement[]): Omit<Inconsistency, 'id'>[] {
    const mismatches: Omit<Inconsistency, 'id'>[] = [];

    // Track variable types
    const variableTypes = new Map<string, { type: string; sourceId: string }>();

    for (const atom of atoms) {
      // Extract type declarations
      const typePatterns = [
        { pattern: /let\s+(\w+)\s+be\s+an?\s+(\w+)/i, extractor: (m: RegExpMatchArray) => ({ var: m[1], type: m[2] }) },
        { pattern: /(\w+)\s+is\s+an?\s+(\w+)/i, extractor: (m: RegExpMatchArray) => ({ var: m[1], type: m[2] }) },
        { pattern: /for\s+(?:all|any|every)\s+(\w+)\s+in\s+(\w+)/i, extractor: (m: RegExpMatchArray) => ({ var: m[1], type: m[2] }) },
        { pattern: /(\w+)\s*∈\s*(\w+)/i, extractor: (m: RegExpMatchArray) => ({ var: m[1], type: m[2] }) },
      ];

      for (const { pattern, extractor } of typePatterns) {
        const match = atom.statement.match(pattern);
        if (match) {
          const { var: varName, type: varType } = extractor(match);
          const existing = variableTypes.get(varName);

          if (existing && !this.areTypesCompatible(existing.type, varType)) {
            mismatches.push({
              type: 'type_mismatch',
              involvedStatements: [existing.sourceId, atom.id],
              explanation: `Variable "${varName}" is declared as both "${existing.type}" and "${varType}"`,
              severity: 'error',
              suggestedResolution: `Clarify the type of "${varName}"`,
            });
          } else {
            variableTypes.set(varName, { type: varType, sourceId: atom.id });
          }
        }
      }
    }

    return mismatches;
  }

  /**
   * Check if two types are compatible
   */
  private areTypesCompatible(type1: string, type2: string): boolean {
    const t1 = type1.toLowerCase();
    const t2 = type2.toLowerCase();

    if (t1 === t2) return true;

    // Subtype relationships
    const subtypes: Record<string, string[]> = {
      natural: ['integer', 'real', 'complex'],
      integer: ['real', 'complex'],
      rational: ['real', 'complex'],
      real: ['complex'],
      positive: ['real', 'integer'],
      negative: ['real', 'integer'],
    };

    return subtypes[t1]?.includes(t2) || subtypes[t2]?.includes(t1);
  }

  /**
   * Detect domain violations
   */
  detectDomainViolations(atoms: AtomicStatement[]): Omit<Inconsistency, 'id'>[] {
    const violations: Omit<Inconsistency, 'id'>[] = [];

    // Common domain violations
    const domainPatterns = [
      {
        pattern: /sqrt\s*\(\s*(-[\d.]+|negative)/i,
        violation: 'Square root of negative number',
        domain: 'real numbers',
      },
      {
        pattern: /log\s*\(\s*(-[\d.]+|0|zero|non-?positive)/i,
        violation: 'Logarithm of non-positive number',
        domain: 'positive real numbers',
      },
      {
        pattern: /arcsin\s*\(\s*([\d.]+)/,
        violation: 'Arcsin of value outside [-1, 1]',
        domain: '[-1, 1]',
        validator: (match: RegExpMatchArray) => {
          const val = parseFloat(match[1]);
          return Math.abs(val) > 1;
        },
      },
      {
        pattern: /(\w+)\s*\/\s*0(?![.\d])/,
        violation: 'Division by zero',
        domain: 'non-zero divisor',
      },
    ];

    for (const atom of atoms) {
      for (const { pattern, violation, domain, validator } of domainPatterns) {
        const match = atom.statement.match(pattern);
        if (match && (!validator || validator(match))) {
          violations.push({
            type: 'domain_violation',
            involvedStatements: [atom.id],
            explanation: `${violation} in "${atom.statement.substring(0, 50)}..."`,
            severity: 'error',
            suggestedResolution: `Ensure the argument is in the valid domain: ${domain}`,
          });
        }
      }
    }

    return violations;
  }

  /**
   * Detect undefined operations
   */
  detectUndefinedOperations(atoms: AtomicStatement[]): Omit<Inconsistency, 'id'>[] {
    const undefined: Omit<Inconsistency, 'id'>[] = [];

    const undefinedPatterns = [
      {
        pattern: /0\s*\/\s*0/,
        operation: '0/0 - indeterminate form',
      },
      {
        pattern: /∞\s*[-/]\s*∞/,
        operation: '∞ - ∞ or ∞/∞ - indeterminate form',
      },
      {
        pattern: /0\s*\*\s*∞|∞\s*\*\s*0/,
        operation: '0 × ∞ - indeterminate form',
      },
      {
        pattern: /0\s*\^\s*0/,
        operation: '0^0 - undefined/context-dependent',
      },
      {
        pattern: /(\w+)\s*\^\s*\(?\s*-\d+\s*\)?.*\1\s*=\s*0/i,
        operation: 'Negative power of zero',
      },
    ];

    for (const atom of atoms) {
      for (const { pattern, operation } of undefinedPatterns) {
        if (pattern.test(atom.statement)) {
          undefined.push({
            type: 'undefined_operation',
            involvedStatements: [atom.id],
            explanation: `Undefined operation: ${operation}`,
            severity: 'critical',
            suggestedResolution: 'This operation is mathematically undefined or indeterminate',
          });
        }
      }
    }

    return undefined;
  }

  /**
   * Detect axiom conflicts
   */
  detectAxiomConflicts(atoms: AtomicStatement[]): Omit<Inconsistency, 'id'>[] {
    const conflicts: Omit<Inconsistency, 'id'>[] = [];
    const axioms = atoms.filter((a) => a.type === 'axiom');

    // Check for potentially conflicting axioms
    for (let i = 0; i < axioms.length; i++) {
      for (let j = i + 1; j < axioms.length; j++) {
        // Check for obvious conflicts in axioms
        if (this.axiomsMayConflict(axioms[i], axioms[j])) {
          conflicts.push({
            type: 'axiom_conflict',
            involvedStatements: [axioms[i].id, axioms[j].id],
            explanation: `Axioms may be in conflict: "${axioms[i].statement.substring(0, 30)}..." and "${axioms[j].statement.substring(0, 30)}..."`,
            severity: 'warning',
            suggestedResolution: 'Verify that these axioms are consistent in the intended model',
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Check if two axioms may conflict
   */
  private axiomsMayConflict(a: AtomicStatement, b: AtomicStatement): boolean {
    // Check for direct negation patterns
    if (this.isSyntacticNegation(a.statement, b.statement)) {
      return true;
    }

    // Check for conflicting universal statements
    const universalA = /(?:for\s+all|∀)\s+(\w+).*?(\w+)\s+is\s+(\w+)/i.exec(a.statement);
    const universalB = /(?:for\s+all|∀)\s+(\w+).*?(\w+)\s+is\s+not\s+(\w+)/i.exec(b.statement);

    if (universalA && universalB && universalA[2] === universalB[2] && universalA[3] === universalB[3]) {
      return true;
    }

    return false;
  }

  /**
   * Detect quantifier errors
   */
  detectQuantifierErrors(
    atoms: AtomicStatement[],
    graph: DependencyGraph
  ): Omit<Inconsistency, 'id'>[] {
    const errors: Omit<Inconsistency, 'id'>[] = [];

    // Track quantifier scopes
    const scopedVariables = new Map<string, { quantifier: string; scope: string }>();

    for (const atom of atoms) {
      // Universal quantifier introduction
      const universalMatch = atom.statement.match(/(?:for\s+all|∀)\s+(\w+)/i);
      if (universalMatch) {
        scopedVariables.set(universalMatch[1], { quantifier: 'universal', scope: atom.id });
      }

      // Existential quantifier introduction
      const existentialMatch = atom.statement.match(/(?:there\s+exists?|∃)\s+(\w+)/i);
      if (existentialMatch) {
        scopedVariables.set(existentialMatch[1], { quantifier: 'existential', scope: atom.id });
      }

      // Check for scope violations
      const variableUses = atom.statement.match(/\b([a-zA-Z])\b/g);
      if (variableUses) {
        for (const varName of variableUses) {
          const scopeInfo = scopedVariables.get(varName);
          if (scopeInfo) {
            // Check if the use is in scope
            const inScope = this.isInScope(atom.id, scopeInfo.scope, graph);
            if (!inScope) {
              errors.push({
                type: 'quantifier_error',
                involvedStatements: [scopeInfo.scope, atom.id],
                explanation: `Variable "${varName}" used outside its quantifier scope`,
                severity: 'error',
                suggestedResolution: `Ensure "${varName}" is properly bound in the current context`,
              });
            }
          }
        }
      }

      // Check for universal-existential order issues
      const uniExiPattern = /∀\s*(\w+).*∃\s*(\w+).*\1.*\2/;
      const exiUniPattern = /∃\s*(\w+).*∀\s*(\w+).*\1.*\2/;
      const uniExiMatch = atom.statement.match(uniExiPattern);
      const exiUniMatch = atom.statement.match(exiUniPattern);

      if (uniExiMatch && exiUniMatch) {
        // Both patterns matched - possible order confusion
        errors.push({
          type: 'quantifier_error',
          involvedStatements: [atom.id],
          explanation: 'Ambiguous quantifier order may lead to different meanings',
          severity: 'warning',
          suggestedResolution: 'Clarify the intended quantifier order (∀∃ vs ∃∀ has different meaning)',
        });
      }
    }

    return errors;
  }

  /**
   * Check if a statement is in the scope of another
   */
  private isInScope(stmtId: string, scopeId: string, graph: DependencyGraph): boolean {
    // A statement is in scope if there's a path from the scope to the statement
    const visited = new Set<string>();
    const queue = [scopeId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === stmtId) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      // Find children (statements that depend on current)
      for (const edge of graph.edges) {
        if (edge.from === current && !visited.has(edge.to)) {
          queue.push(edge.to);
        }
      }
    }

    return false;
  }

  /**
   * Get a summary of all inconsistencies
   */
  getSummary(inconsistencies: Inconsistency[]): {
    isConsistent: boolean;
    criticalCount: number;
    errorCount: number;
    warningCount: number;
    summary: string;
  } {
    const criticalCount = inconsistencies.filter((i) => i.severity === 'critical').length;
    const errorCount = inconsistencies.filter((i) => i.severity === 'error').length;
    const warningCount = inconsistencies.filter((i) => i.severity === 'warning').length;

    let summary: string;
    if (criticalCount > 0) {
      summary = `CRITICAL: ${criticalCount} critical inconsistencies found. The proof is invalid.`;
    } else if (errorCount > 0) {
      summary = `ERROR: ${errorCount} errors found that need to be addressed.`;
    } else if (warningCount > 0) {
      summary = `WARNING: ${warningCount} potential issues found. Review recommended.`;
    } else {
      summary = 'No inconsistencies detected. The proof appears to be consistent.';
    }

    return {
      isConsistent: criticalCount === 0 && errorCount === 0,
      criticalCount,
      errorCount,
      warningCount,
      summary,
    };
  }
}
