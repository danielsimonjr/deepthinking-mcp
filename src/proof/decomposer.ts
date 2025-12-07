/**
 * Proof Decomposer - Phase 8 Sprint 2
 *
 * Decomposes mathematical proofs into atomic statements and
 * extracts their logical dependencies.
 */

import { randomUUID } from 'crypto';
import type {
  AtomicStatement,
  InferenceRule,
  ProofDecomposition,
  DependencyGraph,
  ProofGap,
  ImplicitAssumption,
  AssumptionChain,
} from '../types/modes/mathematics.js';
import { DependencyGraphBuilder } from './dependency-graph.js';

/**
 * Proof step input format
 */
export interface ProofStep {
  content: string;
  justification?: string;
  latex?: string;
}

/**
 * Statement pattern for extraction
 */
interface StatementPattern {
  pattern: RegExp;
  type: AtomicStatement['type'];
  extractStatement: (match: RegExpMatchArray) => string;
  extractJustification?: (match: RegExpMatchArray) => string | undefined;
}

/**
 * Dependency pattern for inference
 */
interface DependencyPattern {
  pattern: RegExp;
  inferenceRule: InferenceRule;
  extractDependencies: (match: RegExpMatchArray, statementIds: Map<string, string>) => string[];
}

/**
 * ProofDecomposer - Breaks proofs into atomic components
 */
export class ProofDecomposer {
  private statementPatterns: StatementPattern[];
  private dependencyPatterns: DependencyPattern[];

  constructor() {
    this.statementPatterns = this.initializeStatementPatterns();
    this.dependencyPatterns = this.initializeDependencyPatterns();
  }

  /**
   * Initialize patterns for extracting statements from proof text
   */
  private initializeStatementPatterns(): StatementPattern[] {
    return [
      // Axiom patterns
      {
        pattern: /^(?:Axiom|Postulate)\s*(?:\d+)?[:\.]?\s*(.+)$/i,
        type: 'axiom',
        extractStatement: (m) => m[1].trim(),
      },
      // Definition patterns
      {
        pattern: /^(?:Definition|Def\.?)\s*(?:\d+)?[:\.]?\s*(.+)$/i,
        type: 'definition',
        extractStatement: (m) => m[1].trim(),
      },
      {
        pattern: /^(?:Let|Define)\s+(.+?)(?:\s+be\s+|\s*:=\s*|\s*=\s*)(.+)$/i,
        type: 'definition',
        extractStatement: (m) => `${m[1]} be ${m[2]}`.trim(),
      },
      // Hypothesis/Assumption patterns
      {
        pattern: /^(?:Assume|Suppose|Given|Hypothesis|Let)\s+(?:that\s+)?(.+)$/i,
        type: 'hypothesis',
        extractStatement: (m) => m[1].trim(),
      },
      // Lemma patterns
      {
        pattern: /^(?:Lemma|Claim)\s*(?:\d+)?[:\.]?\s*(.+)$/i,
        type: 'lemma',
        extractStatement: (m) => m[1].trim(),
      },
      // Conclusion patterns
      {
        pattern: /^(?:Therefore|Thus|Hence|So|Consequently|It follows that|We conclude|QED|∴)\s*[,:]?\s*(.+)$/i,
        type: 'conclusion',
        extractStatement: (m) => m[1].trim(),
      },
      // Derived statement patterns
      {
        pattern: /^(?:By|From|Using|Since)\s+(.+?)[,\s]+(?:we have|we get|we obtain|it follows|this gives)\s+(.+)$/i,
        type: 'derived',
        extractStatement: (m) => m[2].trim(),
        extractJustification: (m) => m[1].trim(),
      },
      {
        pattern: /^(?:This|Which)\s+(?:implies|gives|yields|means|shows)\s+(?:that\s+)?(.+)$/i,
        type: 'derived',
        extractStatement: (m) => m[1].trim(),
      },
      // General derived (fallback)
      {
        pattern: /^(.+)$/,
        type: 'derived',
        extractStatement: (m) => m[1].trim(),
      },
    ];
  }

  /**
   * Initialize patterns for inferring dependencies
   */
  private initializeDependencyPatterns(): DependencyPattern[] {
    return [
      // Modus ponens: "By X, we have Y" or "From X, Y"
      {
        pattern: /(?:by|from|using)\s+(.+?)(?:,\s*(?:we have|we get|it follows|we obtain)|$)/i,
        inferenceRule: 'modus_ponens',
        extractDependencies: (match, statementIds) => {
          const referenced = match[1];
          return this.findMatchingStatements(referenced, statementIds);
        },
      },
      // Substitution: "Substituting X into Y"
      {
        pattern: /substitut(?:e|ing)\s+(.+?)\s+(?:into|in)\s+(.+)/i,
        inferenceRule: 'substitution',
        extractDependencies: (match, statementIds) => {
          const deps = [
            ...this.findMatchingStatements(match[1], statementIds),
            ...this.findMatchingStatements(match[2], statementIds),
          ];
          return [...new Set(deps)];
        },
      },
      // Definition expansion: "By definition of X"
      {
        pattern: /(?:by\s+)?(?:the\s+)?definition\s+(?:of\s+)?(.+)/i,
        inferenceRule: 'definition_expansion',
        extractDependencies: (match, statementIds) => {
          return this.findMatchingStatements(match[1], statementIds);
        },
      },
      // Contradiction: "contradicts" or "contradiction"
      {
        pattern: /(?:this\s+)?contradicts?\s+(.+)/i,
        inferenceRule: 'contradiction',
        extractDependencies: (match, statementIds) => {
          return this.findMatchingStatements(match[1], statementIds);
        },
      },
      // Mathematical induction
      {
        pattern: /by\s+(?:mathematical\s+)?induction/i,
        inferenceRule: 'mathematical_induction',
        extractDependencies: () => [],
      },
      // Hypothetical syllogism: "Since X implies Y, and Y implies Z"
      {
        pattern: /since\s+(.+?)\s+implies\s+(.+?),\s+and\s+(.+?)\s+implies\s+(.+)/i,
        inferenceRule: 'hypothetical_syllogism',
        extractDependencies: (match, statementIds) => {
          const deps = [
            ...this.findMatchingStatements(match[1], statementIds),
            ...this.findMatchingStatements(match[2], statementIds),
          ];
          return [...new Set(deps)];
        },
      },
    ];
  }

  /**
   * Find statements that match a reference
   */
  private findMatchingStatements(reference: string, statementIds: Map<string, string>): string[] {
    const matches: string[] = [];
    const refLower = reference.toLowerCase().trim();

    for (const [statement, id] of statementIds) {
      const stmtLower = statement.toLowerCase();
      // Check if the reference matches the statement or contains key terms
      if (
        stmtLower.includes(refLower) ||
        refLower.includes(stmtLower) ||
        this.hasSignificantOverlap(refLower, stmtLower)
      ) {
        matches.push(id);
      }
    }

    return matches;
  }

  /**
   * Check if two strings have significant word overlap
   */
  private hasSignificantOverlap(a: string, b: string): boolean {
    const wordsA = new Set(a.split(/\s+/).filter((w) => w.length > 2));
    const wordsB = new Set(b.split(/\s+/).filter((w) => w.length > 2));

    if (wordsA.size === 0 || wordsB.size === 0) return false;

    let overlap = 0;
    for (const word of wordsA) {
      if (wordsB.has(word)) overlap++;
    }

    return overlap / Math.min(wordsA.size, wordsB.size) > 0.5;
  }

  /**
   * Decompose a proof into atomic statements
   *
   * @param proof - The proof text or structured steps
   * @param theorem - Optional theorem being proven
   * @returns ProofDecomposition with atoms and dependencies
   */
  decompose(proof: string | ProofStep[], theorem?: string): ProofDecomposition {
    const id = randomUUID();
    const steps = typeof proof === 'string' ? this.parseProofText(proof) : proof;
    const originalProof = typeof proof === 'string' ? proof : steps.map((s) => s.content).join('\n');

    // Extract atomic statements
    const atoms = this.extractStatements(steps);

    // Build statement ID map for dependency inference
    const statementIds = new Map<string, string>();
    for (const atom of atoms) {
      statementIds.set(atom.statement, atom.id);
    }

    // Infer dependencies
    this.inferDependencies(atoms, steps, statementIds);

    // Build dependency graph
    const dependencies = this.buildDependencyGraph(atoms);

    // Create assumption chains
    const assumptionChains = this.traceAssumptionChains(atoms, dependencies);

    // Detect gaps (basic detection, enhanced in GapAnalyzer)
    const gaps = this.detectBasicGaps(atoms, dependencies);

    // Find implicit assumptions
    const implicitAssumptions = this.findImplicitAssumptions(atoms, steps);

    // Compute metrics
    const completeness = this.computeCompleteness(atoms, gaps);
    const rigorLevel = this.assessRigorLevel(atoms, gaps, implicitAssumptions);

    return {
      id,
      originalProof,
      theorem,
      atoms,
      dependencies,
      assumptionChains,
      gaps,
      implicitAssumptions,
      completeness,
      rigorLevel,
      atomCount: atoms.length,
      maxDependencyDepth: dependencies.depth,
    };
  }

  /**
   * Parse proof text into structured steps
   */
  private parseProofText(text: string): ProofStep[] {
    // Split by sentence-ending punctuation or newlines
    const sentences = text
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return sentences.map((content) => ({ content }));
  }

  /**
   * Extract atomic statements from proof steps
   */
  extractStatements(steps: ProofStep[]): AtomicStatement[] {
    const atoms: AtomicStatement[] = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const atom = this.classifyStatement(step, i);
      if (atom) {
        atoms.push(atom);
      }
    }

    return atoms;
  }

  /**
   * Classify a proof step into an atomic statement
   */
  classifyStatement(step: ProofStep, stepNumber: number): AtomicStatement | null {
    const content = step.content.trim();
    if (!content) return null;

    for (const pattern of this.statementPatterns) {
      const match = content.match(pattern.pattern);
      if (match) {
        const statement = pattern.extractStatement(match);
        const justification = pattern.extractJustification?.(match) || step.justification;

        return {
          id: `stmt-${stepNumber + 1}`,
          statement,
          latex: step.latex,
          type: pattern.type,
          justification,
          confidence: this.computeConfidence(pattern.type, justification),
          isExplicit: true,
          sourceLocation: { stepNumber: stepNumber + 1 },
        };
      }
    }

    // Fallback: treat as derived statement
    return {
      id: `stmt-${stepNumber + 1}`,
      statement: content,
      latex: step.latex,
      type: 'derived',
      justification: step.justification,
      confidence: 0.7,
      isExplicit: true,
      sourceLocation: { stepNumber: stepNumber + 1 },
    };
  }

  /**
   * Compute confidence based on statement type and justification
   */
  private computeConfidence(type: AtomicStatement['type'], justification?: string): number {
    const baseConfidence: Record<AtomicStatement['type'], number> = {
      axiom: 1.0,
      definition: 1.0,
      hypothesis: 1.0,
      lemma: 0.9,
      derived: 0.8,
      conclusion: 0.85,
    };

    let confidence = baseConfidence[type];

    // Boost confidence if justification is provided
    if (justification) {
      confidence = Math.min(1.0, confidence + 0.1);
    }

    return confidence;
  }

  /**
   * Infer dependencies between statements
   */
  inferDependencies(
    atoms: AtomicStatement[],
    steps: ProofStep[],
    statementIds: Map<string, string>
  ): void {
    for (let i = 0; i < atoms.length; i++) {
      const atom = atoms[i];
      const step = steps[i];

      if (atom.type === 'axiom' || atom.type === 'definition' || atom.type === 'hypothesis') {
        // These are roots, no dependencies
        continue;
      }

      // Try to infer dependencies from the step content
      const fullText = `${step.content} ${step.justification || ''}`;
      const dependencies: string[] = [];
      let inferenceRule: InferenceRule | undefined;

      for (const depPattern of this.dependencyPatterns) {
        const match = fullText.match(depPattern.pattern);
        if (match) {
          const deps = depPattern.extractDependencies(match, statementIds);
          dependencies.push(...deps);
          if (!inferenceRule) {
            inferenceRule = depPattern.inferenceRule;
          }
        }
      }

      // If no explicit dependencies found, assume it depends on previous statements
      if (dependencies.length === 0 && i > 0) {
        // Find the most recent non-conclusion statement
        for (let j = i - 1; j >= 0; j--) {
          if (atoms[j].type !== 'conclusion') {
            dependencies.push(atoms[j].id);
            break;
          }
        }
      }

      if (dependencies.length > 0) {
        atom.derivedFrom = [...new Set(dependencies)];
        atom.usedInferenceRule = inferenceRule || 'direct_implication';
      }
    }
  }

  /**
   * Build dependency graph from atoms
   */
  private buildDependencyGraph(atoms: AtomicStatement[]): DependencyGraph {
    const builder = new DependencyGraphBuilder();

    // Add all statements
    for (const atom of atoms) {
      builder.addStatement(atom);
    }

    // Add dependencies
    for (const atom of atoms) {
      if (atom.derivedFrom) {
        for (const depId of atom.derivedFrom) {
          builder.addDependency(depId, atom.id, 'logical', {
            inferenceRule: atom.usedInferenceRule,
          });
        }
      }
    }

    return builder.build();
  }

  /**
   * Trace assumption chains from conclusions to axioms
   */
  private traceAssumptionChains(
    atoms: AtomicStatement[],
    graph: DependencyGraph
  ): AssumptionChain[] {
    const chains: AssumptionChain[] = [];
    const conclusions = atoms.filter((a) => a.type === 'conclusion');

    for (const conclusion of conclusions) {
      const assumptions: string[] = [];
      const path: string[] = [];
      const visited = new Set<string>();

      // DFS to trace back to assumptions
      const trace = (id: string) => {
        if (visited.has(id)) return;
        visited.add(id);

        const atom = graph.nodes.get(id);
        if (!atom) return;

        path.push(id);

        if (atom.type === 'axiom' || atom.type === 'definition' || atom.type === 'hypothesis') {
          assumptions.push(id);
          return;
        }

        if (atom.derivedFrom) {
          for (const depId of atom.derivedFrom) {
            trace(depId);
          }
        }
      };

      trace(conclusion.id);

      chains.push({
        conclusion: conclusion.id,
        assumptions,
        path: path.reverse(),
        allAssumptionsExplicit: true, // Will be updated by AssumptionTracker
        implicitAssumptions: [],
      });
    }

    return chains;
  }

  /**
   * Detect basic gaps in the proof
   */
  private detectBasicGaps(atoms: AtomicStatement[], graph: DependencyGraph): ProofGap[] {
    const gaps: ProofGap[] = [];
    let gapCount = 0;

    // Check for unjustified derived statements
    for (const atom of atoms) {
      if (
        (atom.type === 'derived' || atom.type === 'conclusion') &&
        (!atom.derivedFrom || atom.derivedFrom.length === 0)
      ) {
        gaps.push({
          id: `gap-${++gapCount}`,
          type: 'unjustified_leap',
          location: {
            from: 'unknown',
            to: atom.id,
          },
          description: `Statement "${atom.statement.substring(0, 50)}..." lacks explicit justification`,
          severity: atom.type === 'conclusion' ? 'significant' : 'minor',
          suggestedFix: 'Add explicit derivation steps or reference to supporting statements',
        });
      }
    }

    // Check for disconnected components (orphan statements)
    const reachable = new Set<string>();
    const stack = [...graph.roots];
    while (stack.length > 0) {
      const id = stack.pop()!;
      if (reachable.has(id)) continue;
      reachable.add(id);

      for (const edge of graph.edges) {
        if (edge.from === id && !reachable.has(edge.to)) {
          stack.push(edge.to);
        }
      }
    }

    for (const atom of atoms) {
      if (
        !reachable.has(atom.id) &&
        atom.type !== 'axiom' &&
        atom.type !== 'definition' &&
        atom.type !== 'hypothesis'
      ) {
        gaps.push({
          id: `gap-${++gapCount}`,
          type: 'missing_step',
          location: {
            from: 'root',
            to: atom.id,
          },
          description: `Statement "${atom.statement.substring(0, 50)}..." is disconnected from the proof structure`,
          severity: 'significant',
          suggestedFix: 'Connect this statement to the main proof chain',
        });
      }
    }

    return gaps;
  }

  /**
   * Find implicit assumptions in the proof
   */
  private findImplicitAssumptions(
    atoms: AtomicStatement[],
    steps: ProofStep[]
  ): ImplicitAssumption[] {
    const implicitAssumptions: ImplicitAssumption[] = [];
    let count = 0;

    const implicitPatterns = [
      {
        pattern: /(?:clearly|obviously|trivially|it is clear that)/i,
        type: 'existence_assumption' as const,
        suggestedFormulation: (text: string) =>
          `Explicitly state and justify: "${text.substring(0, 50)}..."`,
      },
      {
        pattern: /(?:for\s+(?:all|any|every)|∀)\s+([a-zA-Z_]\w*)/i,
        type: 'domain_assumption' as const,
        suggestedFormulation: (_text: string, match: RegExpMatchArray) =>
          `Specify the domain of ${match[1]}`,
      },
      {
        pattern: /(?:there\s+exists?|∃)\s+([a-zA-Z_]\w*)/i,
        type: 'existence_assumption' as const,
        suggestedFormulation: (_text: string, match: RegExpMatchArray) =>
          `Prove existence of ${match[1]} or cite a theorem`,
      },
      {
        pattern: /(?:unique|the\s+only)/i,
        type: 'uniqueness_assumption' as const,
        suggestedFormulation: () => 'Prove uniqueness or cite a uniqueness theorem',
      },
      {
        pattern: /(?:continuous|differentiable|integrable)/i,
        type: 'continuity_assumption' as const,
        suggestedFormulation: () => 'State continuity/differentiability assumptions explicitly',
      },
      {
        pattern: /(?:finite|bounded)/i,
        type: 'finiteness_assumption' as const,
        suggestedFormulation: () => 'State finiteness/boundedness assumptions explicitly',
      },
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const atom = atoms[i];
      if (!atom) continue;

      for (const { pattern, type, suggestedFormulation } of implicitPatterns) {
        const match = step.content.match(pattern);
        if (match) {
          implicitAssumptions.push({
            id: `impl-${++count}`,
            statement: step.content.substring(0, 100),
            type,
            usedInStep: atom.id,
            shouldBeExplicit: true,
            suggestedFormulation: suggestedFormulation(step.content, match),
          });
          break; // One implicit assumption per step for now
        }
      }
    }

    return implicitAssumptions;
  }

  /**
   * Compute proof completeness score
   */
  computeCompleteness(atoms: AtomicStatement[], gaps: ProofGap[]): number {
    if (atoms.length === 0) return 0;

    // Start with 100% and deduct based on gaps
    let score = 1.0;

    for (const gap of gaps) {
      switch (gap.severity) {
        case 'critical':
          score -= 0.25;
          break;
        case 'significant':
          score -= 0.1;
          break;
        case 'minor':
          score -= 0.03;
          break;
      }
    }

    // Also consider justification coverage
    const justifiedCount = atoms.filter(
      (a) =>
        a.type === 'axiom' ||
        a.type === 'definition' ||
        a.type === 'hypothesis' ||
        (a.derivedFrom && a.derivedFrom.length > 0)
    ).length;

    const justificationScore = justifiedCount / atoms.length;
    score = score * 0.7 + justificationScore * 0.3;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Assess the rigor level of the proof
   */
  private assessRigorLevel(
    atoms: AtomicStatement[],
    gaps: ProofGap[],
    implicitAssumptions: ImplicitAssumption[]
  ): 'informal' | 'textbook' | 'rigorous' | 'formal' {
    const criticalGaps = gaps.filter((g) => g.severity === 'critical').length;
    const significantGaps = gaps.filter((g) => g.severity === 'significant').length;
    const implicitCount = implicitAssumptions.filter((a) => a.shouldBeExplicit).length;

    // All statements have justification and no gaps
    const allJustified = atoms.every(
      (a) =>
        a.type === 'axiom' ||
        a.type === 'definition' ||
        a.type === 'hypothesis' ||
        (a.derivedFrom && a.derivedFrom.length > 0 && a.usedInferenceRule)
    );

    if (criticalGaps > 0) return 'informal';
    if (significantGaps > 2 || implicitCount > 3) return 'informal';
    if (significantGaps > 0 || implicitCount > 1) return 'textbook';
    if (!allJustified || implicitCount > 0) return 'textbook';
    if (allJustified && implicitCount === 0 && gaps.length === 0) return 'rigorous';

    // Check for formal logic notation
    const hasFormalNotation = atoms.some(
      (a) =>
        a.latex &&
        (a.latex.includes('\\forall') ||
          a.latex.includes('\\exists') ||
          a.latex.includes('\\vdash') ||
          a.latex.includes('\\Rightarrow'))
    );

    return hasFormalNotation ? 'formal' : 'rigorous';
  }

  /**
   * Get decomposition metrics
   */
  computeMetrics(decomposition: ProofDecomposition): {
    atomCount: number;
    rootCount: number;
    leafCount: number;
    avgDependencies: number;
    maxDependencyDepth: number;
    completeness: number;
    gapCount: number;
    implicitAssumptionCount: number;
  } {
    const { atoms, dependencies, gaps, implicitAssumptions, completeness } = decomposition;

    const totalDeps = atoms.reduce((sum, a) => sum + (a.derivedFrom?.length || 0), 0);
    const avgDependencies = atoms.length > 0 ? totalDeps / atoms.length : 0;

    return {
      atomCount: atoms.length,
      rootCount: dependencies.roots.length,
      leafCount: dependencies.leaves.length,
      avgDependencies,
      maxDependencyDepth: dependencies.depth,
      completeness,
      gapCount: gaps.length,
      implicitAssumptionCount: implicitAssumptions.length,
    };
  }
}
