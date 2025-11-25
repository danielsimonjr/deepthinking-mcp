/**
 * Taxonomy Classifier (v3.4.0)
 * Sprint 4 Task 4.4: Enable taxonomy-based search classification
 */

import type { Thought } from '../types/index.js';
import { REASONING_TAXONOMY, type ReasoningType, type ReasoningCategory } from './reasoning-types.js';

/**
 * Classification result for a thought
 */
export interface ThoughtClassification {
  primaryCategory: ReasoningCategory;
  primaryType: ReasoningType;
  secondaryTypes: ReasoningType[];
  confidence: number;
  matchedKeywords: string[];
}

/**
 * Classifier for identifying reasoning types in thoughts
 */
export class TaxonomyClassifier {
  private taxonomy: ReasoningType[];
  private keywordIndex: Map<string, Set<string>>; // keyword -> reasoning type IDs

  constructor() {
    this.taxonomy = REASONING_TAXONOMY;
    this.keywordIndex = this.buildKeywordIndex();
  }

  /**
   * Build keyword index for fast lookup
   */
  private buildKeywordIndex(): Map<string, Set<string>> {
    const index = new Map<string, Set<string>>();

    for (const type of this.taxonomy) {
      // Index keywords
      for (const keyword of type.keywords) {
        const normalized = keyword.toLowerCase();
        if (!index.has(normalized)) {
          index.set(normalized, new Set());
        }
        index.get(normalized)!.add(type.id);
      }

      // Index aliases
      for (const alias of type.aliases) {
        const normalized = alias.toLowerCase();
        if (!index.has(normalized)) {
          index.set(normalized, new Set());
        }
        index.get(normalized)!.add(type.id);
      }

      // Index name tokens
      const nameTokens = type.name.toLowerCase().split(/\s+/);
      for (const token of nameTokens) {
        if (token.length > 3) { // Skip short words
          if (!index.has(token)) {
            index.set(token, new Set());
          }
          index.get(token)!.add(type.id);
        }
      }
    }

    return index;
  }

  /**
   * Classify a thought by analyzing its content
   */
  classifyThought(thought: Thought): ThoughtClassification {
    const content = thought.content.toLowerCase();
    const tokens = this.tokenize(content);

    // Find matching reasoning types
    const matches = new Map<string, { type: ReasoningType; score: number; keywords: string[] }>();

    // Score each reasoning type based on keyword matches
    for (const token of tokens) {
      const typeIds = this.keywordIndex.get(token);
      if (typeIds) {
        for (const typeId of typeIds) {
          const type = this.taxonomy.find(t => t.id === typeId);
          if (!type) continue;

          if (!matches.has(typeId)) {
            matches.set(typeId, { type, score: 0, keywords: [] });
          }

          const match = matches.get(typeId)!;
          match.score += this.calculateKeywordScore(token, type);
          match.keywords.push(token);
        }
      }
    }

    // Boost scores based on context patterns
    for (const match of matches.values()) {
      match.score += this.calculateContextScore(content, match.type);
    }

    // Sort by score
    const sortedMatches = Array.from(matches.values())
      .sort((a, b) => b.score - a.score);

    if (sortedMatches.length === 0) {
      // Default to practical reasoning if no matches
      const defaultType = this.taxonomy.find(t => t.id === 'practical_common_sense')
        || this.taxonomy[0];
      return {
        primaryCategory: defaultType.category,
        primaryType: defaultType,
        secondaryTypes: [],
        confidence: 0.3,
        matchedKeywords: [],
      };
    }

    const primaryMatch = sortedMatches[0];
    const secondaryTypes = sortedMatches.slice(1, 4).map(m => m.type);

    // Calculate confidence (0-1 scale)
    const maxScore = primaryMatch.score;
    const confidence = Math.min(1, maxScore / 10); // Normalize to 0-1

    return {
      primaryCategory: primaryMatch.type.category,
      primaryType: primaryMatch.type,
      secondaryTypes,
      confidence,
      matchedKeywords: primaryMatch.keywords,
    };
  }

  /**
   * Tokenize content for analysis
   */
  private tokenize(text: string): string[] {
    // Split on word boundaries, convert to lowercase, filter short words
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(token => token.length > 2);
  }

  /**
   * Calculate keyword match score
   */
  private calculateKeywordScore(keyword: string, type: ReasoningType): number {
    // Exact keyword match
    if (type.keywords.some(k => k.toLowerCase() === keyword)) {
      return 2.0;
    }

    // Alias match
    if (type.aliases.some(a => a.toLowerCase() === keyword)) {
      return 1.5;
    }

    // Name token match
    if (type.name.toLowerCase().includes(keyword)) {
      return 1.0;
    }

    return 0.5;
  }

  /**
   * Calculate contextual score based on content patterns
   */
  private calculateContextScore(content: string, type: ReasoningType): number {
    let score = 0;

    // Check for formal definitions or notation
    if (type.formalDefinition && content.includes('∀') || content.includes('∃') || content.includes('⊢')) {
      score += 1.5;
    }

    // Check for category-specific patterns
    switch (type.category) {
      case 'deductive':
        if (/therefore|thus|hence|consequently|it follows that/i.test(content)) {
          score += 1.0;
        }
        if (/premise|conclusion|valid|sound/i.test(content)) {
          score += 0.5;
        }
        break;

      case 'inductive':
        if (/pattern|observe|generalize|probably|likely/i.test(content)) {
          score += 1.0;
        }
        if (/sample|evidence|data/i.test(content)) {
          score += 0.5;
        }
        break;

      case 'abductive':
        if (/explain|best explanation|hypothesis|account for/i.test(content)) {
          score += 1.0;
        }
        if (/inference to the best|why|because/i.test(content)) {
          score += 0.5;
        }
        break;

      case 'analogical':
        if (/similar|like|analogous|compare|parallel/i.test(content)) {
          score += 1.0;
        }
        if (/metaphor|correspond/i.test(content)) {
          score += 0.5;
        }
        break;

      case 'causal':
        if (/cause|effect|because|due to|result/i.test(content)) {
          score += 1.0;
        }
        if (/mechanism|influence|impact/i.test(content)) {
          score += 0.5;
        }
        break;

      case 'mathematical':
        if (/proof|theorem|lemma|corollary|axiom/i.test(content)) {
          score += 1.0;
        }
        if (/equation|formula|calculate|derive/i.test(content)) {
          score += 0.5;
        }
        break;

      case 'scientific':
        if (/experiment|hypothesis|test|observe|measure/i.test(content)) {
          score += 1.0;
        }
        if (/theory|model|predict|verify/i.test(content)) {
          score += 0.5;
        }
        break;

      case 'probabilistic':
        if (/probability|chance|likelihood|odds|risk/i.test(content)) {
          score += 1.0;
        }
        if (/uncertain|random|stochastic|distribution/i.test(content)) {
          score += 0.5;
        }
        break;

      case 'dialectical':
        if (/thesis|antithesis|synthesis|contradict/i.test(content)) {
          score += 1.0;
        }
        if (/argue|debate|oppose|counter/i.test(content)) {
          score += 0.5;
        }
        break;

      case 'practical':
        if (/practical|pragmatic|useful|apply|implement/i.test(content)) {
          score += 1.0;
        }
        if (/solution|approach|strategy|method/i.test(content)) {
          score += 0.5;
        }
        break;

      case 'creative':
        if (/imagine|invent|create|novel|original/i.test(content)) {
          score += 1.0;
        }
        if (/brainstorm|innovate|generate|explore/i.test(content)) {
          score += 0.5;
        }
        break;

      case 'critical':
        if (/critique|evaluate|assess|analyze|examine/i.test(content)) {
          score += 1.0;
        }
        if (/weakness|strength|flaw|valid/i.test(content)) {
          score += 0.5;
        }
        break;
    }

    return score;
  }

  /**
   * Get a reasoning type by ID
   */
  getType(typeId: string): ReasoningType | undefined {
    return this.taxonomy.find(t => t.id === typeId);
  }

  /**
   * Get all types in a category
   */
  getTypesByCategory(category: ReasoningCategory): ReasoningType[] {
    return this.taxonomy.filter(t => t.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): ReasoningCategory[] {
    return Array.from(new Set(this.taxonomy.map(t => t.category)));
  }

  /**
   * Get taxonomy statistics
   */
  getStatistics() {
    const stats = {
      totalTypes: this.taxonomy.length,
      categories: new Map<ReasoningCategory, number>(),
      difficulties: new Map<string, number>(),
      frequencies: new Map<string, number>(),
    };

    for (const type of this.taxonomy) {
      // Count by category
      stats.categories.set(
        type.category,
        (stats.categories.get(type.category) || 0) + 1
      );

      // Count by difficulty
      stats.difficulties.set(
        type.difficulty,
        (stats.difficulties.get(type.difficulty) || 0) + 1
      );

      // Count by frequency
      stats.frequencies.set(
        type.usageFrequency,
        (stats.frequencies.get(type.usageFrequency) || 0) + 1
      );
    }

    return stats;
  }
}
