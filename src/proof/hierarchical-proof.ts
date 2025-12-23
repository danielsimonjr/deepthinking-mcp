/**
 * Hierarchical Proof Manager - Phase 12 Sprint 2
 *
 * Manages nested proof structures with lemmas, sub-theorems, and
 * dependency tracking between proof elements.
 */

import { randomUUID } from 'crypto';
import type { ProofStep } from './decomposer.js';
import type {
  HierarchicalProof,
  HierarchicalProofType,
  ProofTree,
} from './branch-types.js';

/**
 * Options for hierarchical proof parsing
 */
export interface HierarchicalProofOptions {
  /** Automatically extract lemmas from proof */
  autoExtractLemmas?: boolean;
  /** Maximum nesting depth */
  maxDepth?: number;
  /** Include metadata extraction */
  extractMetadata?: boolean;
}

/**
 * Input for creating a hierarchical proof element
 */
export interface ProofElementInput {
  type: HierarchicalProofType;
  statement: string;
  name?: string;
  proof: ProofStep[];
  dependencies?: string[];
}

/**
 * Lemma extraction result
 */
interface ExtractedLemma {
  name: string;
  statement: string;
  startIndex: number;
  endIndex: number;
  type: HierarchicalProofType;
}

/**
 * HierarchicalProofManager - Manages nested proof structures
 */
export class HierarchicalProofManager {
  private options: Required<HierarchicalProofOptions>;

  constructor(options: HierarchicalProofOptions = {}) {
    this.options = {
      autoExtractLemmas: options.autoExtractLemmas ?? true,
      maxDepth: options.maxDepth ?? 10,
      extractMetadata: options.extractMetadata ?? true,
    };
  }

  /**
   * Create a hierarchical proof from a statement and proof steps
   *
   * @param statement - The theorem statement
   * @param steps - The proof steps
   * @param name - Optional name for the theorem
   * @returns HierarchicalProof with extracted sub-proofs
   */
  createProof(
    statement: string,
    steps: ProofStep[],
    name?: string
  ): HierarchicalProof {
    const id = randomUUID();

    // Extract lemmas if enabled
    const subProofs = this.options.autoExtractLemmas
      ? this.extractSubProofs(steps)
      : [];

    // Determine completeness
    const isComplete = this.checkCompleteness(steps, subProofs);

    // Extract dependencies
    const dependencies = this.extractDependencies(steps);

    const proof: HierarchicalProof = {
      id,
      type: 'theorem',
      statement,
      name,
      proof: steps,
      subProofs,
      dependencies,
      isComplete,
    };

    if (this.options.extractMetadata) {
      proof.metadata = this.extractMetadata(statement, steps);
    }

    return proof;
  }

  /**
   * Create a proof element (lemma, corollary, etc.)
   */
  createElement(input: ProofElementInput): HierarchicalProof {
    const id = randomUUID();

    // Recursively extract sub-proofs
    const subProofs = this.options.autoExtractLemmas
      ? this.extractSubProofs(input.proof)
      : [];

    const isComplete = this.checkCompleteness(input.proof, subProofs);

    const proof: HierarchicalProof = {
      id,
      type: input.type,
      statement: input.statement,
      name: input.name,
      proof: input.proof,
      subProofs,
      dependencies: input.dependencies || [],
      isComplete,
    };

    if (this.options.extractMetadata) {
      proof.metadata = this.extractMetadata(input.statement, input.proof);
    }

    return proof;
  }

  /**
   * Build a proof tree from a hierarchical proof
   */
  buildTree(root: HierarchicalProof): ProofTree {
    const lemmas = new Map<string, HierarchicalProof>();
    // Collect all proof elements (DFS)
    const allElements: HierarchicalProof[] = [];
    const collect = (proof: HierarchicalProof, depth: number) => {
      if (depth > this.options.maxDepth) {
        return;
      }

      allElements.push(proof);
      if (proof.type !== 'theorem') {
        lemmas.set(proof.id, proof);
      }

      for (const sub of proof.subProofs) {
        collect(sub, depth + 1);
      }
    };

    collect(root, 0);

    // Compute dependency order (topological sort)
    const dependencyOrder = this.computeDependencyOrder(allElements);

    // Calculate statistics
    const statistics = this.calculateStatistics(root);

    return {
      root,
      lemmas,
      dependencyOrder,
      statistics,
    };
  }

  /**
   * Extract sub-proofs (lemmas, claims) from proof steps
   */
  private extractSubProofs(steps: ProofStep[]): HierarchicalProof[] {
    const extracted: HierarchicalProof[] = [];
    const lemmas = this.findLemmas(steps);

    for (const lemma of lemmas) {
      const lemmaSteps = steps.slice(lemma.startIndex, lemma.endIndex + 1);

      // Skip if lemma has no actual proof steps
      if (lemmaSteps.length <= 1) continue;

      const subProof: HierarchicalProof = {
        id: randomUUID(),
        type: lemma.type,
        statement: lemma.statement,
        name: lemma.name,
        proof: lemmaSteps,
        subProofs: [], // Could recurse here for nested lemmas
        dependencies: this.extractDependencies(lemmaSteps),
        isComplete: this.checkStepCompleteness(lemmaSteps),
      };

      extracted.push(subProof);
    }

    return extracted;
  }

  /**
   * Find lemmas and claims in proof steps
   */
  private findLemmas(steps: ProofStep[]): ExtractedLemma[] {
    const lemmas: ExtractedLemma[] = [];
    let currentLemma: ExtractedLemma | null = null;
    let lemmaCount = 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const content = step.content.toLowerCase();

      // Check for lemma/claim start
      const lemmaMatch = step.content.match(/^(?:Lemma|Claim|Sublemma)\s*(\d+)?[:\.]?\s*(.+)$/i);
      if (lemmaMatch) {
        // End previous lemma if exists
        if (currentLemma) {
          currentLemma.endIndex = i - 1;
          if (currentLemma.endIndex >= currentLemma.startIndex) {
            lemmas.push(currentLemma);
          }
        }

        lemmaCount++;
        currentLemma = {
          name: lemmaMatch[1] ? `Lemma ${lemmaMatch[1]}` : `Lemma ${lemmaCount}`,
          statement: lemmaMatch[2].trim(),
          startIndex: i,
          endIndex: steps.length - 1, // Will be updated
          type: content.startsWith('claim') ? 'claim' : 'lemma',
        };
        continue;
      }

      // Check for corollary
      const corollaryMatch = step.content.match(/^Corollary\s*(\d+)?[:\.]?\s*(.+)$/i);
      if (corollaryMatch) {
        if (currentLemma) {
          currentLemma.endIndex = i - 1;
          if (currentLemma.endIndex >= currentLemma.startIndex) {
            lemmas.push(currentLemma);
          }
        }

        lemmaCount++;
        currentLemma = {
          name: corollaryMatch[1] ? `Corollary ${corollaryMatch[1]}` : `Corollary ${lemmaCount}`,
          statement: corollaryMatch[2].trim(),
          startIndex: i,
          endIndex: steps.length - 1,
          type: 'corollary',
        };
        continue;
      }

      // Check for proposition
      const propMatch = step.content.match(/^Proposition\s*(\d+)?[:\.]?\s*(.+)$/i);
      if (propMatch) {
        if (currentLemma) {
          currentLemma.endIndex = i - 1;
          if (currentLemma.endIndex >= currentLemma.startIndex) {
            lemmas.push(currentLemma);
          }
        }

        lemmaCount++;
        currentLemma = {
          name: propMatch[1] ? `Proposition ${propMatch[1]}` : `Proposition ${lemmaCount}`,
          statement: propMatch[2].trim(),
          startIndex: i,
          endIndex: steps.length - 1,
          type: 'proposition',
        };
        continue;
      }

      // Check for lemma end (QED, □, "this completes", etc.)
      if (
        currentLemma &&
        (/(?:QED|□|∎|this\s+(?:completes|proves)\s+(?:the\s+)?(?:lemma|claim))/i.test(content) ||
          content.includes('end of lemma') ||
          content.includes('end of proof'))
      ) {
        currentLemma.endIndex = i;
        lemmas.push(currentLemma);
        currentLemma = null;
      }
    }

    // Handle unclosed lemma
    if (currentLemma) {
      lemmas.push(currentLemma);
    }

    return lemmas;
  }

  /**
   * Extract dependencies from proof steps
   */
  private extractDependencies(steps: ProofStep[]): string[] {
    const deps = new Set<string>();

    for (const step of steps) {
      const text = `${step.content} ${step.justification || ''}`;

      // Match "by Lemma X", "from Theorem Y", etc.
      const refPatterns = [
        /(?:by|from|using)\s+(Lemma|Theorem|Corollary|Proposition|Claim)\s*(\d+|[A-Z])?/gi,
        /\[([^\]]+)\]/g, // Bracket references
      ];

      for (const pattern of refPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const ref = match[0].replace(/^(?:by|from|using)\s+/i, '').trim();
          if (ref && ref.length > 0) {
            deps.add(ref);
          }
        }
      }
    }

    return [...deps];
  }

  /**
   * Check if a proof is complete
   */
  private checkCompleteness(
    steps: ProofStep[],
    subProofs: HierarchicalProof[]
  ): boolean {
    // Check main proof
    if (steps.length === 0) return false;

    const lastStep = steps[steps.length - 1].content.toLowerCase();
    const hasConclusion =
      lastStep.includes('therefore') ||
      lastStep.includes('thus') ||
      lastStep.includes('hence') ||
      lastStep.includes('qed') ||
      lastStep.includes('□') ||
      lastStep.includes('∎') ||
      lastStep.includes('proven') ||
      lastStep.includes('completed');

    // Check all sub-proofs are complete
    const allSubProofsComplete = subProofs.every((sp) => sp.isComplete);

    return hasConclusion && allSubProofsComplete;
  }

  /**
   * Check if a sequence of steps is complete
   */
  private checkStepCompleteness(steps: ProofStep[]): boolean {
    if (steps.length === 0) return false;

    const lastContent = steps[steps.length - 1].content.toLowerCase();
    return (
      lastContent.includes('qed') ||
      lastContent.includes('□') ||
      lastContent.includes('∎') ||
      lastContent.includes('therefore') ||
      lastContent.includes('this proves') ||
      lastContent.includes('this completes')
    );
  }

  /**
   * Compute topological order for proof elements
   */
  private computeDependencyOrder(elements: HierarchicalProof[]): string[] {
    const order: string[] = [];
    const visited = new Set<string>();
    const elementByName = new Map<string, HierarchicalProof>();

    // Build name-to-element map
    for (const elem of elements) {
      if (elem.name) {
        elementByName.set(elem.name.toLowerCase(), elem);
      }
    }

    // DFS for topological sort
    const visit = (elem: HierarchicalProof) => {
      if (visited.has(elem.id)) return;
      visited.add(elem.id);

      // Visit dependencies first
      for (const depName of elem.dependencies) {
        const depElem = elementByName.get(depName.toLowerCase());
        if (depElem && !visited.has(depElem.id)) {
          visit(depElem);
        }
      }

      order.push(elem.id);
    };

    // Process all elements
    for (const elem of elements) {
      visit(elem);
    }

    return order;
  }

  /**
   * Calculate statistics for a proof tree
   */
  private calculateStatistics(root: HierarchicalProof): ProofTree['statistics'] {
    let totalElements = 0;
    let maxDepth = 0;
    let totalSteps = 0;

    const traverse = (proof: HierarchicalProof, depth: number) => {
      totalElements++;
      maxDepth = Math.max(maxDepth, depth);
      totalSteps += proof.proof.length;

      for (const sub of proof.subProofs) {
        traverse(sub, depth + 1);
      }
    };

    traverse(root, 0);

    return {
      totalElements,
      maxDepth,
      totalSteps,
    };
  }

  /**
   * Extract metadata from a proof
   */
  private extractMetadata(
    statement: string,
    steps: ProofStep[]
  ): HierarchicalProof['metadata'] {
    const tags: string[] = [];

    // Extract tags from content
    const fullText = `${statement} ${steps.map((s) => s.content).join(' ')}`;

    if (/induction/i.test(fullText)) tags.push('induction');
    if (/contradiction/i.test(fullText)) tags.push('contradiction');
    if (/cases?/i.test(fullText)) tags.push('case-analysis');
    if (/continuous|continuous/i.test(fullText)) tags.push('analysis');
    if (/prime|divisible/i.test(fullText)) tags.push('number-theory');
    if (/group|ring|field/i.test(fullText)) tags.push('algebra');
    if (/graph|vertex|edge/i.test(fullText)) tags.push('graph-theory');
    if (/probability|random/i.test(fullText)) tags.push('probability');

    return {
      tags: tags.length > 0 ? tags : undefined,
      createdAt: new Date(),
    };
  }

  /**
   * Add a lemma to an existing proof
   */
  addLemma(
    proof: HierarchicalProof,
    lemma: ProofElementInput
  ): HierarchicalProof {
    const newLemma = this.createElement({
      ...lemma,
      type: 'lemma',
    });

    return {
      ...proof,
      subProofs: [...proof.subProofs, newLemma],
    };
  }

  /**
   * Add a corollary to an existing proof
   */
  addCorollary(
    proof: HierarchicalProof,
    corollary: ProofElementInput
  ): HierarchicalProof {
    const newCorollary = this.createElement({
      ...corollary,
      type: 'corollary',
    });

    return {
      ...proof,
      subProofs: [...proof.subProofs, newCorollary],
    };
  }

  /**
   * Find a proof element by ID
   */
  findById(tree: ProofTree, id: string): HierarchicalProof | undefined {
    if (tree.root.id === id) return tree.root;
    return tree.lemmas.get(id);
  }

  /**
   * Find proof elements by type
   */
  findByType(tree: ProofTree, type: HierarchicalProofType): HierarchicalProof[] {
    const results: HierarchicalProof[] = [];

    const traverse = (proof: HierarchicalProof) => {
      if (proof.type === type) {
        results.push(proof);
      }
      for (const sub of proof.subProofs) {
        traverse(sub);
      }
    };

    traverse(tree.root);
    return results;
  }

  /**
   * Get all incomplete proof elements
   */
  findIncomplete(tree: ProofTree): HierarchicalProof[] {
    const results: HierarchicalProof[] = [];

    const traverse = (proof: HierarchicalProof) => {
      if (!proof.isComplete) {
        results.push(proof);
      }
      for (const sub of proof.subProofs) {
        traverse(sub);
      }
    };

    traverse(tree.root);
    return results;
  }

  /**
   * Generate a summary of the proof structure
   */
  generateSummary(tree: ProofTree): string {
    const lines: string[] = [];

    const traverse = (proof: HierarchicalProof, indent: number) => {
      const prefix = '  '.repeat(indent);
      const status = proof.isComplete ? '✓' : '○';
      const name = proof.name || proof.type;
      const statement =
        proof.statement.length > 50
          ? proof.statement.substring(0, 50) + '...'
          : proof.statement;

      lines.push(`${prefix}${status} ${name}: ${statement}`);

      for (const sub of proof.subProofs) {
        traverse(sub, indent + 1);
      }
    };

    traverse(tree.root, 0);

    lines.push('');
    lines.push(`Statistics:`);
    lines.push(`  Total elements: ${tree.statistics.totalElements}`);
    lines.push(`  Max depth: ${tree.statistics.maxDepth}`);
    lines.push(`  Total steps: ${tree.statistics.totalSteps}`);

    return lines.join('\n');
  }

  /**
   * Export proof tree to Mermaid diagram
   */
  toMermaid(tree: ProofTree): string {
    const lines: string[] = ['graph TD'];
    let nodeId = 0;
    const idMap = new Map<string, string>();

    const traverse = (proof: HierarchicalProof, parentMermaidId?: string) => {
      const mermaidId = `N${nodeId++}`;
      idMap.set(proof.id, mermaidId);

      const label = proof.name || `${proof.type}`;
      const shape = proof.type === 'theorem' ? `((${label}))` : `[${label}]`;
      lines.push(`  ${mermaidId}${shape}`);

      if (parentMermaidId) {
        lines.push(`  ${parentMermaidId} --> ${mermaidId}`);
      }

      for (const sub of proof.subProofs) {
        traverse(sub, mermaidId);
      }
    };

    traverse(tree.root);

    // Add dependency edges
    const addDependencies = (proof: HierarchicalProof) => {
      const mermaidId = idMap.get(proof.id);
      if (!mermaidId) return;

      for (const depName of proof.dependencies) {
        // Try to find the dependency by name
        for (const [id, elem] of tree.lemmas) {
          if (elem.name?.toLowerCase() === depName.toLowerCase()) {
            const depMermaidId = idMap.get(id);
            if (depMermaidId) {
              lines.push(`  ${depMermaidId} -.-> ${mermaidId}`);
            }
            break;
          }
        }
      }

      for (const sub of proof.subProofs) {
        addDependencies(sub);
      }
    };

    addDependencies(tree.root);

    return lines.join('\n');
  }
}
