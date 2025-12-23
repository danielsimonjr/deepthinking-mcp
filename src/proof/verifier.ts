/**
 * Proof Verifier - Phase 12 Sprint 2
 *
 * Verifies proof steps have valid justifications and checks for
 * common proof errors.
 */

import type { ProofStep } from './decomposer.js';
import type {
  StepJustification,
  VerificationResult,
  VerificationError,
  VerificationWarning,
  VerificationCoverage,
} from './branch-types.js';

/**
 * Configuration for proof verification
 */
export interface ProofVerifierConfig {
  /** Check for circular references */
  checkCircular?: boolean;
  /** Check for undefined terms */
  checkUndefinedTerms?: boolean;
  /** Strict mode (treat warnings as errors) */
  strict?: boolean;
  /** Custom inference rules to accept */
  customRules?: string[];
}

/**
 * Parsed proof step with extracted justification
 */
interface ParsedStep {
  index: number;
  content: string;
  latex?: string;
  justification: StepJustification | null;
  referencedSteps: number[];
  introducedTerms: string[];
  usedTerms: string[];
}

/**
 * ProofVerifier - Validates proof step justifications
 */
export class ProofVerifier {
  private config: Required<ProofVerifierConfig>;
  private knownRules: Set<string>;

  constructor(config: ProofVerifierConfig = {}) {
    this.config = {
      checkCircular: config.checkCircular ?? true,
      checkUndefinedTerms: config.checkUndefinedTerms ?? true,
      strict: config.strict ?? false,
      customRules: config.customRules ?? [],
    };

    this.knownRules = new Set([
      'axiom',
      'definition',
      'hypothesis',
      'assumption',
      'previous',
      'modus_ponens',
      'modus_tollens',
      'universal_instantiation',
      'universal_generalization',
      'existential_instantiation',
      'existential_generalization',
      'conjunction',
      'conjunction_elimination',
      'disjunction',
      'disjunction_elimination',
      'substitution',
      'algebraic',
      'arithmetic',
      'by_cases',
      'case_analysis',
      'contradiction',
      'contrapositive',
      'induction_base',
      'induction_hypothesis',
      'induction_step',
      'strong_induction',
      'lemma',
      'theorem',
      'corollary',
      'direct_implication',
      'biconditional',
      ...this.config.customRules,
    ]);
  }

  /**
   * Verify a proof's validity
   *
   * @param steps - The proof steps to verify
   * @returns VerificationResult with errors, warnings, and coverage
   */
  verify(steps: ProofStep[]): VerificationResult {
    const startTime = Date.now();

    if (steps.length === 0) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        coverage: { stepsVerified: 0, totalSteps: 0, percentage: 100, unverifiedSteps: [] },
        verificationTime: Date.now() - startTime,
        justificationTypes: [],
      };
    }

    // Parse all steps
    const parsedSteps = steps.map((step, idx) => this.parseStep(step, idx));

    // Collect errors and warnings
    const errors: VerificationError[] = [];
    const warnings: VerificationWarning[] = [];
    const justificationTypes = new Set<string>();
    const verifiedSteps: number[] = [];
    const unverifiedSteps: string[] = [];

    // Check each step
    for (const parsed of parsedSteps) {
      const stepErrors = this.checkStep(parsed, parsedSteps);
      errors.push(...stepErrors);

      if (stepErrors.length === 0 && parsed.justification) {
        verifiedSteps.push(parsed.index);
        justificationTypes.add(parsed.justification.type);
      } else if (stepErrors.length === 0) {
        // No justification but also no error (might be a root statement)
        if (this.isRootStatement(parsed)) {
          verifiedSteps.push(parsed.index);
        } else {
          unverifiedSteps.push(`step-${parsed.index + 1}`);
        }
      } else {
        unverifiedSteps.push(`step-${parsed.index + 1}`);
      }

      // Generate warnings
      const stepWarnings = this.generateWarnings(parsed, parsedSteps);
      warnings.push(...stepWarnings);
    }

    // Check for circular references if enabled
    if (this.config.checkCircular) {
      const circularErrors = this.checkCircularReferences(parsedSteps);
      errors.push(...circularErrors);
    }

    // Check for undefined terms if enabled
    if (this.config.checkUndefinedTerms) {
      const undefinedErrors = this.checkUndefinedTerms(parsedSteps);
      errors.push(...undefinedErrors);
    }

    // Calculate coverage
    const coverage: VerificationCoverage = {
      stepsVerified: verifiedSteps.length,
      totalSteps: steps.length,
      percentage: Math.round((verifiedSteps.length / steps.length) * 100),
      unverifiedSteps,
    };

    // In strict mode, treat warnings as errors
    if (this.config.strict) {
      for (const warning of warnings) {
        if (warning.severity === 'warning') {
          errors.push({
            stepId: warning.stepId,
            type: 'invalid_justification',
            message: warning.message,
            severity: 'error',
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      coverage,
      verificationTime: Date.now() - startTime,
      justificationTypes: [...justificationTypes],
    };
  }

  /**
   * Parse a proof step to extract its justification
   */
  private parseStep(step: ProofStep, index: number): ParsedStep {
    const justification = this.extractJustification(step);
    const referencedSteps = this.extractReferences(step, index);
    const introducedTerms = this.extractIntroducedTerms(step);
    const usedTerms = this.extractUsedTerms(step);

    return {
      index,
      content: step.content,
      latex: step.latex,
      justification,
      referencedSteps,
      introducedTerms,
      usedTerms,
    };
  }

  /**
   * Extract justification from a proof step
   */
  private extractJustification(step: ProofStep): StepJustification | null {
    const content = step.content.toLowerCase();
    const justification = (step.justification || '').toLowerCase();
    const fullText = `${content} ${justification}`;

    // Check for axiom
    if (/(?:^|\s)axiom\s*(?:\d+)?/i.test(fullText) || content.startsWith('axiom')) {
      return { type: 'axiom', references: [], rule: 'axiom' };
    }

    // Check for definition
    if (/(?:by\s+)?definition/i.test(fullText) || content.startsWith('definition') || content.startsWith('let')) {
      return { type: 'definition', references: [], rule: 'definition' };
    }

    // Check for hypothesis/assumption
    if (/(?:^|\s)(?:assume|suppose|given|hypothesis)/i.test(content)) {
      return { type: 'hypothesis', references: [], rule: 'hypothesis' };
    }

    // Check for modus ponens
    if (/(?:by|from)\s+.+(?:implies|if\s+.+\s+then)/i.test(fullText)) {
      return { type: 'modus_ponens', references: [], rule: 'modus_ponens' };
    }

    // Check for induction
    if (/base\s*case/i.test(content)) {
      return { type: 'induction_base', references: [], rule: 'induction_base' };
    }
    if (/induct(?:ive|ion)\s*(?:hypothesis|step)/i.test(content)) {
      return { type: 'induction_step', references: [], rule: 'induction_step' };
    }

    // Check for case analysis
    if (/(?:case\s*\d+|case\s*:)/i.test(content)) {
      return { type: 'by_cases', references: [], rule: 'case_analysis' };
    }

    // Check for contradiction
    if (/(?:contradiction|contradicts)/i.test(fullText)) {
      return { type: 'contradiction', references: [], rule: 'contradiction' };
    }

    // Check for substitution
    if (/substitut/i.test(fullText)) {
      return { type: 'substitution', references: [], rule: 'substitution' };
    }

    // Check for algebraic manipulation
    if (/(?:algebra|simplif|expand|factor)/i.test(fullText)) {
      return { type: 'algebraic', references: [], rule: 'algebraic' };
    }

    // Check for lemma/theorem reference
    if (/(?:by|from)\s+(?:lemma|theorem)\s*\d*/i.test(fullText)) {
      return { type: 'lemma', references: [], rule: 'lemma_reference' };
    }

    // Check for "by previous step" or step references
    if (/(?:by|from)\s+(?:step\s*)?\d+/i.test(fullText) || /(?:by|from)\s+(?:above|previous)/i.test(fullText)) {
      return { type: 'previous_step', references: [], rule: 'previous_step' };
    }

    // Check for conclusion indicators (should have a source)
    if (/(?:therefore|thus|hence|so|consequently)/i.test(content)) {
      return { type: 'previous_step', references: [], rule: 'direct_implication' };
    }

    // No explicit justification found
    return null;
  }

  /**
   * Extract step references from content
   */
  private extractReferences(step: ProofStep, currentIndex: number): number[] {
    const refs: number[] = [];
    const text = `${step.content} ${step.justification || ''}`;

    // Match "step N", "(N)", "by N"
    const patterns = [
      /step\s*(\d+)/gi,
      /\((\d+)\)/g,
      /by\s+(\d+)/gi,
      /from\s+(\d+)/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const ref = parseInt(match[1], 10) - 1; // Convert to 0-indexed
        if (ref >= 0 && ref < currentIndex) {
          refs.push(ref);
        }
      }
    }

    return [...new Set(refs)];
  }

  /**
   * Extract terms introduced in a step
   */
  private extractIntroducedTerms(step: ProofStep): string[] {
    const terms: string[] = [];
    const content = step.content;

    // Match "let X", "define X", "set X :="
    const letMatch = content.match(/(?:let|define|set)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi);
    if (letMatch) {
      for (const m of letMatch) {
        const term = m.replace(/(?:let|define|set)\s+/i, '');
        terms.push(term);
      }
    }

    return terms;
  }

  /**
   * Extract terms used in a step
   */
  private extractUsedTerms(step: ProofStep): string[] {
    // Extract variables (single letters or letter followed by numbers)
    const matches = step.content.match(/\b[a-zA-Z][a-zA-Z0-9]*\b/g) || [];

    // Filter out common words
    const commonWords = new Set([
      'let', 'define', 'set', 'assume', 'suppose', 'given', 'then', 'therefore',
      'thus', 'hence', 'so', 'if', 'and', 'or', 'not', 'for', 'all', 'every',
      'some', 'any', 'the', 'that', 'this', 'is', 'are', 'be', 'by', 'from',
      'have', 'has', 'we', 'it', 'to', 'of', 'in', 'on', 'with', 'as', 'at',
      'case', 'step', 'proof', 'axiom', 'lemma', 'theorem', 'definition',
    ]);

    return matches.filter((m) => !commonWords.has(m.toLowerCase()));
  }

  /**
   * Check if a step is a root statement (axiom, definition, hypothesis)
   */
  private isRootStatement(parsed: ParsedStep): boolean {
    const content = parsed.content.toLowerCase();
    return (
      content.startsWith('axiom') ||
      content.startsWith('definition') ||
      content.startsWith('let') ||
      content.startsWith('assume') ||
      content.startsWith('suppose') ||
      content.startsWith('given') ||
      content.startsWith('hypothesis')
    );
  }

  /**
   * Check a single step for errors
   */
  private checkStep(parsed: ParsedStep, _allSteps: ParsedStep[]): VerificationError[] {
    const errors: VerificationError[] = [];
    const stepId = `step-${parsed.index + 1}`;

    // Root statements don't need justification
    if (this.isRootStatement(parsed)) {
      return errors;
    }

    // Check if step has justification
    if (!parsed.justification) {
      errors.push({
        stepId,
        type: 'invalid_justification',
        message: `Step ${parsed.index + 1} lacks explicit justification`,
        suggestion: 'Add justification (e.g., "by step N", "by definition", "by modus ponens")',
        severity: 'warning',
      });
      return errors;
    }

    // Check if referenced steps exist
    for (const ref of parsed.referencedSteps) {
      if (ref < 0 || ref >= parsed.index) {
        errors.push({
          stepId,
          type: 'missing_step',
          message: `Step ${parsed.index + 1} references non-existent step ${ref + 1}`,
          suggestion: 'Check step number references',
          severity: 'error',
        });
      }
    }

    // Check if justification type is recognized
    if (parsed.justification.rule && !this.knownRules.has(parsed.justification.rule)) {
      errors.push({
        stepId,
        type: 'unsupported_rule',
        message: `Unrecognized inference rule: "${parsed.justification.rule}"`,
        suggestion: `Use a standard rule like: axiom, definition, modus_ponens, substitution, etc.`,
        severity: 'warning',
      });
    }

    return errors;
  }

  /**
   * Generate warnings for a step
   */
  private generateWarnings(parsed: ParsedStep, allSteps: ParsedStep[]): VerificationWarning[] {
    const warnings: VerificationWarning[] = [];
    const stepId = `step-${parsed.index + 1}`;
    const content = parsed.content.toLowerCase();

    // Warn about "clearly", "obviously", etc.
    if (/(?:clearly|obviously|trivially|it is clear)/i.test(content)) {
      warnings.push({
        stepId,
        message: 'Phrases like "clearly" or "obviously" may hide implicit assumptions',
        category: 'implicit_assumption',
        severity: 'info',
      });
    }

    // Warn about large logical leaps
    if (content.length > 100 && !parsed.justification) {
      warnings.push({
        stepId,
        message: 'Complex statement without explicit justification may contain multiple steps',
        category: 'potential_gap',
        severity: 'warning',
      });
    }

    // Warn about potential type mismatches (heuristic)
    if (/(?:integer|real|natural|rational)/i.test(content) && parsed.referencedSteps.length > 0) {
      const referencedTypes = parsed.referencedSteps
        .map((idx) => allSteps[idx]?.content || '')
        .join(' ')
        .toLowerCase();

      if (
        (content.includes('integer') && referencedTypes.includes('real') && !referencedTypes.includes('integer')) ||
        (content.includes('natural') && referencedTypes.includes('integer') && !referencedTypes.includes('natural'))
      ) {
        warnings.push({
          stepId,
          message: 'Potential type mismatch between referenced statements',
          category: 'type_mismatch',
          severity: 'warning',
        });
      }
    }

    return warnings;
  }

  /**
   * Check for circular references in the proof
   */
  private checkCircularReferences(steps: ParsedStep[]): VerificationError[] {
    const errors: VerificationError[] = [];

    // Build adjacency list
    const graph = new Map<number, Set<number>>();
    for (const step of steps) {
      graph.set(step.index, new Set(step.referencedSteps));
    }

    // DFS to detect cycles
    const visited = new Set<number>();
    const recursionStack = new Set<number>();

    const hasCycle = (node: number, path: number[]): number[] | null => {
      visited.add(node);
      recursionStack.add(node);

      const neighbors = graph.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const cyclePath = hasCycle(neighbor, [...path, neighbor]);
          if (cyclePath) return cyclePath;
        } else if (recursionStack.has(neighbor)) {
          return [...path, neighbor];
        }
      }

      recursionStack.delete(node);
      return null;
    };

    for (const step of steps) {
      if (!visited.has(step.index)) {
        const cyclePath = hasCycle(step.index, [step.index]);
        if (cyclePath) {
          const cycleStr = cyclePath.map((i) => `step ${i + 1}`).join(' → ');
          errors.push({
            stepId: `step-${step.index + 1}`,
            type: 'circular_reference',
            message: `Circular reference detected: ${cycleStr}`,
            suggestion: 'Break the circular dependency by reordering steps or removing a reference',
            severity: 'error',
          });
          break; // Only report first cycle found
        }
      }
    }

    return errors;
  }

  /**
   * Check for undefined terms
   */
  private checkUndefinedTerms(steps: ParsedStep[]): VerificationError[] {
    const errors: VerificationError[] = [];
    const definedTerms = new Set<string>();

    for (const step of steps) {
      // Add introduced terms to defined set
      for (const term of step.introducedTerms) {
        definedTerms.add(term.toLowerCase());
      }

      // Skip root statements for undefined term checking
      if (this.isRootStatement(step)) {
        continue;
      }

      // Check if used terms are defined
      for (const term of step.usedTerms) {
        const termLower = term.toLowerCase();
        // Skip single letters (common variables)
        if (term.length <= 1) continue;
        // Skip if it looks like a standard math term
        if (/^(sin|cos|tan|log|ln|exp|lim|sum|prod|max|min)$/i.test(term)) continue;

        if (!definedTerms.has(termLower)) {
          // Only warn if the term appears significant
          if (step.content.split(term).length > 2) {
            errors.push({
              stepId: `step-${step.index + 1}`,
              type: 'undefined_term',
              message: `Term "${term}" may be used before being defined`,
              suggestion: `Define "${term}" before using it, or ensure it's a known constant`,
              severity: 'warning',
            });
          }
        }
      }
    }

    return errors;
  }

  /**
   * Verify a single step (convenience method)
   */
  verifyStep(step: ProofStep, context: ProofStep[] = []): VerificationError[] {
    const parsed = this.parseStep(step, context.length);
    const parsedContext = context.map((s, i) => this.parseStep(s, i));

    return this.checkStep(parsed, [...parsedContext, parsed]);
  }

  /**
   * Check if a justification type is valid
   */
  isValidJustification(justification: string): boolean {
    return this.knownRules.has(justification.toLowerCase());
  }

  /**
   * Get all known inference rules
   */
  getKnownRules(): string[] {
    return [...this.knownRules];
  }

  /**
   * Add a custom inference rule
   */
  addCustomRule(rule: string): void {
    this.knownRules.add(rule.toLowerCase());
  }
}
