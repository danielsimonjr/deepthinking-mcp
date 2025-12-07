/**
 * Gap Analyzer - Phase 8 Sprint 2
 *
 * Analyzes proof decompositions to find gaps, missing steps,
 * unjustified leaps, and implicit assumptions.
 */

import type {
  AtomicStatement,
  DependencyGraph,
  ProofGap,
  ImplicitAssumption,
  GapAnalysis,
  ProofDecomposition,
} from '../types/modes/mathematics.js';

/**
 * Transition validity result
 */
interface TransitionValidation {
  isValid: boolean;
  reason?: string;
  suggestedFix?: string;
  missingSteps?: string[];
}

/**
 * Gap detection configuration
 */
export interface GapAnalyzerConfig {
  /** Strictness level for gap detection */
  strictness: 'lenient' | 'standard' | 'strict';
  /** Whether to detect implicit domain assumptions */
  checkDomainAssumptions: boolean;
  /** Whether to verify inference rule applications */
  verifyInferenceRules: boolean;
  /** Maximum allowed leap distance between statements */
  maxLeapDistance: number;
}

const DEFAULT_CONFIG: GapAnalyzerConfig = {
  strictness: 'standard',
  checkDomainAssumptions: true,
  verifyInferenceRules: true,
  maxLeapDistance: 2,
};

/**
 * GapAnalyzer - Identifies missing steps and implicit assumptions
 */
export class GapAnalyzer {
  private config: GapAnalyzerConfig;

  constructor(config: Partial<GapAnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Analyze a proof decomposition for gaps
   */
  analyzeGaps(decomposition: ProofDecomposition): GapAnalysis {
    const { atoms, dependencies } = decomposition;

    // Find all types of gaps
    const unjustifiedLeaps = this.findUnjustifiedLeaps(atoms, dependencies);
    const missingSteps = this.findMissingSteps(atoms, dependencies);
    const scopeErrors = this.findScopeErrors(atoms);
    const undefinedTerms = this.findUndefinedTerms(atoms);

    // Combine all gaps
    const gaps = [...unjustifiedLeaps, ...missingSteps, ...scopeErrors, ...undefinedTerms];

    // Find implicit assumptions
    const implicitAssumptions = this.findImplicitAssumptions(atoms, gaps);

    // Find unjustified steps
    const unjustifiedSteps = this.findUnjustifiedSteps(atoms);

    // Generate suggestions
    const suggestions = this.generateSuggestions(gaps, implicitAssumptions, unjustifiedSteps);

    // Compute completeness score
    const completeness = this.computeCompleteness(atoms, gaps, implicitAssumptions);

    return {
      completeness,
      gaps,
      implicitAssumptions,
      unjustifiedSteps,
      suggestions,
    };
  }

  /**
   * Check if a transition between two statements is valid
   */
  isValidTransition(from: AtomicStatement, to: AtomicStatement): TransitionValidation {
    // Axioms, definitions, and hypotheses need no justification
    if (to.type === 'axiom' || to.type === 'definition' || to.type === 'hypothesis') {
      return { isValid: true };
    }

    // Check if derivedFrom includes the from statement
    if (to.derivedFrom && to.derivedFrom.includes(from.id)) {
      // Check inference rule validity (basic check)
      if (to.usedInferenceRule && this.config.verifyInferenceRules) {
        const ruleCheck = this.verifyInferenceRule(from, to);
        if (!ruleCheck.isValid) {
          return ruleCheck;
        }
      }
      return { isValid: true };
    }

    // Check if the logical connection is reasonable
    const impliedConnection = this.checkImpliedConnection(from, to);
    if (impliedConnection.isValid) {
      return impliedConnection;
    }

    return {
      isValid: false,
      reason: `No clear logical connection from "${from.statement.substring(0, 30)}..." to "${to.statement.substring(0, 30)}..."`,
      suggestedFix: 'Add explicit derivation step or justification',
    };
  }

  /**
   * Verify that an inference rule is correctly applied
   */
  private verifyInferenceRule(
    from: AtomicStatement,
    to: AtomicStatement
  ): TransitionValidation {
    const rule = to.usedInferenceRule;
    if (!rule) return { isValid: true };

    // Basic pattern matching for common rules
    const fromText = from.statement.toLowerCase();
    const toText = to.statement.toLowerCase();

    switch (rule) {
      case 'modus_ponens':
        // Check for "if X then Y" pattern followed by X → Y
        if (fromText.includes('if') && fromText.includes('then')) {
          return { isValid: true };
        }
        if (fromText.includes('implies') || fromText.includes('⇒')) {
          return { isValid: true };
        }
        break;

      case 'modus_tollens':
        // Check for negation in conclusion
        if (toText.includes('not') || toText.includes('¬') || toText.includes('false')) {
          return { isValid: true };
        }
        break;

      case 'contradiction':
        // Check for contradiction keywords
        if (
          toText.includes('contradiction') ||
          toText.includes('impossible') ||
          toText.includes('false')
        ) {
          return { isValid: true };
        }
        break;

      case 'substitution':
        // Substitution is usually valid if there's equality involved
        if (fromText.includes('=') || fromText.includes('equals')) {
          return { isValid: true };
        }
        break;

      case 'universal_instantiation':
        // Check for universal quantifier in premise
        if (
          fromText.includes('for all') ||
          fromText.includes('∀') ||
          fromText.includes('every')
        ) {
          return { isValid: true };
        }
        break;

      case 'existential_generalization':
        // Check for existential quantifier in conclusion
        if (
          toText.includes('exists') ||
          toText.includes('∃') ||
          toText.includes('there is')
        ) {
          return { isValid: true };
        }
        break;

      case 'mathematical_induction':
        // Induction requires base case and inductive step
        // This is a complex check, defer to specialized analyzer
        return { isValid: true };

      default:
        // Other rules pass by default
        return { isValid: true };
    }

    // If we reach here, the rule application might be questionable
    return {
      isValid: true, // Don't be too strict
      reason: `Inference rule ${rule} application may need review`,
    };
  }

  /**
   * Check for implied logical connection between statements
   */
  private checkImpliedConnection(
    from: AtomicStatement,
    to: AtomicStatement
  ): TransitionValidation {
    const fromWords = new Set(from.statement.toLowerCase().split(/\s+/));
    const toWords = new Set(to.statement.toLowerCase().split(/\s+/));

    // Count meaningful word overlap
    const meaningfulWords = [...fromWords].filter(
      (w) => w.length > 3 && toWords.has(w)
    );

    // High overlap suggests related statements
    if (meaningfulWords.length >= 2) {
      return {
        isValid: true,
        reason: 'Implied connection through shared concepts',
      };
    }

    // Check for explicit reference
    if (to.justification && to.justification.toLowerCase().includes(from.id.toLowerCase())) {
      return { isValid: true };
    }

    return { isValid: false };
  }

  /**
   * Find unjustified leaps in reasoning
   */
  findUnjustifiedLeaps(atoms: AtomicStatement[], graph: DependencyGraph): ProofGap[] {
    const gaps: ProofGap[] = [];
    let gapId = 0;

    for (const atom of atoms) {
      // Skip foundational statements
      if (atom.type === 'axiom' || atom.type === 'definition' || atom.type === 'hypothesis') {
        continue;
      }

      // Check if derived statement has proper justification
      if (atom.type === 'derived' || atom.type === 'conclusion' || atom.type === 'lemma') {
        // Must have at least one dependency
        if (!atom.derivedFrom || atom.derivedFrom.length === 0) {
          gaps.push({
            id: `gap-leap-${++gapId}`,
            type: 'unjustified_leap',
            location: { from: 'unknown', to: atom.id },
            description: `Statement "${atom.statement.substring(0, 50)}..." appears without justification`,
            severity: this.assessGapSeverity(atom),
            suggestedFix: this.suggestJustification(atom, atoms),
          });
          continue;
        }

        // Check if dependencies are too distant
        if (this.config.strictness !== 'lenient') {
          const leapDistance = this.computeLeapDistance(atom, graph);
          if (leapDistance > this.config.maxLeapDistance) {
            gaps.push({
              id: `gap-leap-${++gapId}`,
              type: 'unjustified_leap',
              location: {
                from: atom.derivedFrom[0],
                to: atom.id,
              },
              description: `Large logical leap (distance ${leapDistance}) to reach this statement`,
              severity: 'significant',
              suggestedFix: 'Add intermediate steps to bridge the logical gap',
            });
          }
        }
      }
    }

    return gaps;
  }

  /**
   * Compute the "leap distance" - how many implicit steps are skipped
   */
  private computeLeapDistance(atom: AtomicStatement, graph: DependencyGraph): number {
    if (!atom.derivedFrom || atom.derivedFrom.length === 0) return 0;

    // Estimate based on statement complexity difference
    const deps = atom.derivedFrom.map((id) => graph.nodes.get(id)).filter(Boolean);
    if (deps.length === 0) return 0;

    const atomComplexity = this.estimateStatementComplexity(atom.statement);
    const avgDepComplexity =
      deps.reduce((sum, d) => sum + this.estimateStatementComplexity(d!.statement), 0) /
      deps.length;

    // Higher complexity jump suggests larger leap
    return Math.max(0, Math.floor((atomComplexity - avgDepComplexity) / 10));
  }

  /**
   * Estimate statement complexity based on length and symbols
   */
  private estimateStatementComplexity(statement: string): number {
    let complexity = statement.length;

    // Mathematical symbols add complexity
    const mathSymbols = /[∀∃∈∉⊆⊇∩∪∧∨¬⇒⇔∫∑∏√≤≥≠±∞]/g;
    const matches = statement.match(mathSymbols);
    if (matches) complexity += matches.length * 5;

    // Nested structures add complexity
    const nestingLevel = (statement.match(/[\(\[\{]/g) || []).length;
    complexity += nestingLevel * 3;

    return complexity;
  }

  /**
   * Find missing intermediate steps
   */
  findMissingSteps(atoms: AtomicStatement[], graph: DependencyGraph): ProofGap[] {
    const gaps: ProofGap[] = [];
    let gapId = 0;

    // Check each derived statement
    for (const atom of atoms) {
      if (!atom.derivedFrom) continue;

      for (const depId of atom.derivedFrom) {
        const dep = graph.nodes.get(depId);
        if (!dep) continue;

        // Check if the transition is valid
        const validation = this.isValidTransition(dep, atom);
        if (!validation.isValid) {
          gaps.push({
            id: `gap-step-${++gapId}`,
            type: 'missing_step',
            location: { from: depId, to: atom.id },
            description: validation.reason || 'Missing intermediate step',
            severity: 'minor',
            suggestedFix: validation.suggestedFix,
          });
        }
      }
    }

    // Check for gaps in the topological order
    if (graph.topologicalOrder) {
      for (let i = 1; i < graph.topologicalOrder.length; i++) {
        const prev = graph.nodes.get(graph.topologicalOrder[i - 1]);
        const curr = graph.nodes.get(graph.topologicalOrder[i]);

        if (prev && curr && curr.derivedFrom?.includes(prev.id)) {
          // Direct dependency - check if it needs intermediate steps
          if (this.needsIntermediateStep(prev, curr)) {
            gaps.push({
              id: `gap-step-${++gapId}`,
              type: 'missing_step',
              location: { from: prev.id, to: curr.id },
              description: `Step from "${prev.statement.substring(0, 30)}..." to "${curr.statement.substring(0, 30)}..." may need clarification`,
              severity: 'minor',
              suggestedFix: 'Consider adding an intermediate derivation step',
            });
          }
        }
      }
    }

    return gaps;
  }

  /**
   * Check if an intermediate step is needed between two statements
   */
  private needsIntermediateStep(from: AtomicStatement, to: AtomicStatement): boolean {
    if (this.config.strictness === 'lenient') return false;

    // Check if there's a significant change in the mathematical objects
    const fromSymbols = this.extractMathSymbols(from.statement);
    const toSymbols = this.extractMathSymbols(to.statement);

    // If completely different symbols, might need intermediate step
    const commonSymbols = fromSymbols.filter((s) => toSymbols.includes(s));
    if (commonSymbols.length === 0 && fromSymbols.length > 0 && toSymbols.length > 0) {
      return true;
    }

    // If strict mode, check for large statement length difference
    if (this.config.strictness === 'strict') {
      const lengthRatio = to.statement.length / Math.max(1, from.statement.length);
      if (lengthRatio > 2 || lengthRatio < 0.5) {
        return true;
      }
    }

    return false;
  }

  /**
   * Extract mathematical symbols from a statement
   */
  private extractMathSymbols(statement: string): string[] {
    const symbols: string[] = [];

    // Variable-like patterns
    const vars = statement.match(/\b[a-zA-Z](?:_\d+)?\b/g);
    if (vars) symbols.push(...vars);

    // Mathematical operators
    const ops = statement.match(/[+\-*/=<>≤≥≠∈∉⊆⊇]/g);
    if (ops) symbols.push(...ops);

    return symbols;
  }

  /**
   * Find scope errors (variables used out of scope)
   */
  findScopeErrors(atoms: AtomicStatement[]): ProofGap[] {
    const gaps: ProofGap[] = [];
    let gapId = 0;

    // Track variable introductions
    const variableScope = new Map<string, string>(); // variable → introducing statement

    for (const atom of atoms) {
      // Extract "let X" or "for all X" introductions
      const introMatch = atom.statement.match(
        /(?:let|for\s+(?:all|any|every)|∀)\s+([a-zA-Z](?:_\d+)?)/i
      );
      if (introMatch) {
        variableScope.set(introMatch[1], atom.id);
      }

      // Check for variable usage
      const varMatches = atom.statement.match(/\b([a-zA-Z](?:_\d+)?)\b/g);
      if (varMatches) {
        for (const v of varMatches) {
          // Skip common words
          if (['a', 'an', 'the', 'if', 'is', 'or', 'be', 'to', 'in', 'of'].includes(v.toLowerCase())) {
            continue;
          }

          // Check if this is a mathematical variable not in scope
          // This is a simplified check - real implementation would need type info
          if (v.length === 1 && !variableScope.has(v) && atom.type === 'derived') {
            // Only flag if it looks like an unintroduced variable
            const previouslyUsed = atoms.some(
              (a) =>
                a.id !== atom.id &&
                atoms.indexOf(a) < atoms.indexOf(atom) &&
                a.statement.includes(v)
            );
            if (!previouslyUsed) {
              gaps.push({
                id: `gap-scope-${++gapId}`,
                type: 'scope_error',
                location: { from: 'introduction', to: atom.id },
                description: `Variable "${v}" appears without explicit introduction`,
                severity: 'minor',
                suggestedFix: `Introduce ${v} with "Let ${v}..." or specify its domain`,
              });
            }
          }
        }
      }
    }

    return gaps;
  }

  /**
   * Find undefined terms
   */
  findUndefinedTerms(atoms: AtomicStatement[]): ProofGap[] {
    const gaps: ProofGap[] = [];
    let gapId = 0;

    // Track defined terms
    const definedTerms = new Set<string>();

    for (const atom of atoms) {
      if (atom.type === 'definition') {
        // Extract the term being defined
        const defMatch = atom.statement.match(
          /(?:define|let)\s+(\w+)|(\w+)\s+(?:is|are|be)\s+defined/i
        );
        if (defMatch) {
          definedTerms.add((defMatch[1] || defMatch[2]).toLowerCase());
        }
      }
    }

    // Check for usage of undefined custom terms
    for (const atom of atoms) {
      // Look for "by definition of X" where X is not defined
      const byDefMatch = atom.statement.match(/by\s+(?:the\s+)?definition\s+of\s+(\w+)/i);
      if (byDefMatch) {
        const term = byDefMatch[1].toLowerCase();
        if (!definedTerms.has(term) && !this.isStandardMathTerm(term)) {
          gaps.push({
            id: `gap-undef-${++gapId}`,
            type: 'undefined_term',
            location: { from: 'definition', to: atom.id },
            description: `Term "${byDefMatch[1]}" is used but not defined`,
            severity: 'significant',
            suggestedFix: `Add a definition for "${byDefMatch[1]}"`,
          });
        }
      }
    }

    return gaps;
  }

  /**
   * Check if a term is a standard mathematical term
   */
  private isStandardMathTerm(term: string): boolean {
    const standardTerms = new Set([
      'integer',
      'integers',
      'real',
      'reals',
      'natural',
      'naturals',
      'rational',
      'rationals',
      'complex',
      'prime',
      'even',
      'odd',
      'positive',
      'negative',
      'zero',
      'function',
      'continuous',
      'differentiable',
      'derivative',
      'integral',
      'limit',
      'sequence',
      'series',
      'set',
      'subset',
      'superset',
      'union',
      'intersection',
      'element',
      'member',
      'domain',
      'range',
      'codomain',
      'bijection',
      'injection',
      'surjection',
      'isomorphism',
      'homomorphism',
    ]);

    return standardTerms.has(term);
  }

  /**
   * Find implicit assumptions
   */
  findImplicitAssumptions(atoms: AtomicStatement[], gaps: ProofGap[]): ImplicitAssumption[] {
    const implicitAssumptions: ImplicitAssumption[] = [];
    let count = 0;

    // Implicit assumptions from gaps
    for (const gap of gaps) {
      if (gap.type === 'implicit_assumption') {
        implicitAssumptions.push({
          id: `impl-${++count}`,
          statement: gap.description,
          type: 'existence_assumption',
          usedInStep: gap.location.to,
          shouldBeExplicit: gap.severity !== 'minor',
          suggestedFormulation: gap.suggestedFix || 'Make assumption explicit',
        });
      }
    }

    // Check for common implicit assumptions in atoms
    for (const atom of atoms) {
      // Division operations imply non-zero divisor
      if (/\/\s*([a-zA-Z_]\w*|\([^)]+\))/.test(atom.statement)) {
        implicitAssumptions.push({
          id: `impl-${++count}`,
          statement: 'Division operation implies non-zero divisor',
          type: 'domain_assumption',
          usedInStep: atom.id,
          shouldBeExplicit: true,
          suggestedFormulation: 'State that the divisor is non-zero',
        });
      }

      // Square roots imply non-negative argument (for real numbers)
      if (/√|\\sqrt/.test(atom.statement)) {
        implicitAssumptions.push({
          id: `impl-${++count}`,
          statement: 'Square root implies non-negative argument',
          type: 'domain_assumption',
          usedInStep: atom.id,
          shouldBeExplicit: true,
          suggestedFormulation: 'State that the argument is non-negative',
        });
      }

      // Logarithms imply positive argument
      if (/log|ln|\\log/.test(atom.statement)) {
        implicitAssumptions.push({
          id: `impl-${++count}`,
          statement: 'Logarithm implies positive argument',
          type: 'domain_assumption',
          usedInStep: atom.id,
          shouldBeExplicit: true,
          suggestedFormulation: 'State that the argument is positive',
        });
      }
    }

    return implicitAssumptions;
  }

  /**
   * Find unjustified steps (steps with low confidence)
   */
  findUnjustifiedSteps(atoms: AtomicStatement[]): string[] {
    return atoms
      .filter(
        (a) =>
          (a.type === 'derived' || a.type === 'conclusion') &&
          (!a.derivedFrom || a.derivedFrom.length === 0) &&
          !a.justification
      )
      .map((a) => a.id);
  }

  /**
   * Assess severity of a gap
   */
  private assessGapSeverity(atom: AtomicStatement): ProofGap['severity'] {
    if (atom.type === 'conclusion') return 'critical';
    if (atom.type === 'lemma') return 'significant';
    return 'minor';
  }

  /**
   * Suggest justification for an unjustified statement
   */
  private suggestJustification(atom: AtomicStatement, allAtoms: AtomicStatement[]): string {
    // Find potentially related statements
    const related = allAtoms.filter((a) => {
      if (a.id === atom.id) return false;
      const overlap = this.computeWordOverlap(a.statement, atom.statement);
      return overlap > 0.3;
    });

    if (related.length > 0) {
      const relatedIds = related.map((r) => r.id).join(', ');
      return `Consider deriving from: ${relatedIds}`;
    }

    return 'Add explicit justification or reference to supporting statements';
  }

  /**
   * Compute word overlap between two statements
   */
  private computeWordOverlap(a: string, b: string): number {
    const wordsA = new Set(
      a
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );
    const wordsB = new Set(
      b
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

    if (wordsA.size === 0 || wordsB.size === 0) return 0;

    let overlap = 0;
    for (const w of wordsA) {
      if (wordsB.has(w)) overlap++;
    }

    return overlap / Math.max(wordsA.size, wordsB.size);
  }

  /**
   * Generate improvement suggestions
   */
  generateSuggestions(
    gaps: ProofGap[],
    implicitAssumptions: ImplicitAssumption[],
    unjustifiedSteps: string[]
  ): string[] {
    const suggestions: string[] = [];

    // Prioritize by severity
    const criticalGaps = gaps.filter((g) => g.severity === 'critical');
    const significantGaps = gaps.filter((g) => g.severity === 'significant');
    const minorGaps = gaps.filter((g) => g.severity === 'minor');

    if (criticalGaps.length > 0) {
      suggestions.push(
        `CRITICAL: Address ${criticalGaps.length} critical gap(s) in the proof - conclusions lack proper justification`
      );
    }

    if (significantGaps.length > 0) {
      suggestions.push(
        `Add intermediate steps to bridge ${significantGaps.length} significant logical gap(s)`
      );
    }

    if (implicitAssumptions.filter((a) => a.shouldBeExplicit).length > 0) {
      suggestions.push(
        `Make ${implicitAssumptions.filter((a) => a.shouldBeExplicit).length} implicit assumption(s) explicit`
      );
    }

    if (unjustifiedSteps.length > 0) {
      suggestions.push(`Provide justification for ${unjustifiedSteps.length} unjustified step(s)`);
    }

    if (minorGaps.length > 0 && this.config.strictness !== 'lenient') {
      suggestions.push(
        `Consider clarifying ${minorGaps.length} minor gap(s) for improved rigor`
      );
    }

    if (suggestions.length === 0) {
      suggestions.push('The proof appears complete with no significant gaps identified');
    }

    return suggestions;
  }

  /**
   * Compute overall completeness score
   */
  computeCompleteness(
    atoms: AtomicStatement[],
    gaps: ProofGap[],
    implicitAssumptions: ImplicitAssumption[]
  ): number {
    if (atoms.length === 0) return 0;

    let score = 1.0;

    // Deduct for gaps
    for (const gap of gaps) {
      switch (gap.severity) {
        case 'critical':
          score -= 0.25;
          break;
        case 'significant':
          score -= 0.1;
          break;
        case 'minor':
          score -= 0.02;
          break;
      }
    }

    // Deduct for important implicit assumptions
    const criticalImplicit = implicitAssumptions.filter((a) => a.shouldBeExplicit).length;
    score -= criticalImplicit * 0.05;

    // Ensure score is in valid range
    return Math.max(0, Math.min(1, score));
  }
}
