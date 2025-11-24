/**
 * Taxonomy Navigator and Query System (v3.4.0)
 * Phase 4D Task 7.2: Navigate and query the reasoning taxonomy
 */

import {
  REASONING_TAXONOMY,
  getReasoningTypesByCategory,
  searchReasoningTypes,
  getTaxonomyStats,
  type ReasoningType,
  type ReasoningCategory,
} from './reasoning-types.js';

/**
 * Query filter for reasoning types
 */
export interface TaxonomyQuery {
  categories?: ReasoningCategory[];
  difficulties?: Array<'beginner' | 'intermediate' | 'advanced' | 'expert'>;
  frequencies?: Array<'rare' | 'uncommon' | 'common' | 'very_common'>;
  keywords?: string[];
  applications?: string[];
  hasPrerequisites?: boolean;
  hasFormalDefinition?: boolean;
  searchText?: string;
}

/**
 * Query result with ranking
 */
export interface QueryResult {
  type: ReasoningType;
  relevanceScore: number;
  matchReasons: string[];
}

/**
 * Navigation path through taxonomy
 */
export interface NavigationPath {
  steps: NavigationStep[];
  totalDistance: number;
}

/**
 * Single step in navigation
 */
export interface NavigationStep {
  from: ReasoningType;
  to: ReasoningType;
  relationship: 'prerequisite' | 'related' | 'same_category' | 'application_overlap';
  distance: number;
}

/**
 * Taxonomy explorer
 */
export interface TaxonomyExploration {
  startType: ReasoningType;
  neighborhood: {
    prerequisites: ReasoningType[];
    related: ReasoningType[];
    sameCategory: ReasoningType[];
    similarApplications: ReasoningType[];
  };
  learningPath: ReasoningType[]; // Suggested order to learn
  dependencies: Map<string, string[]>; // Type ID -> prerequisite IDs
}

/**
 * Taxonomy Navigator for querying and exploring reasoning types
 */
export class TaxonomyNavigator {
  private index: Map<string, ReasoningType>;
  private keywordIndex: Map<string, Set<string>>; // Keyword -> Type IDs
  private applicationIndex: Map<string, Set<string>>; // Application -> Type IDs
  private categoryIndex: Map<ReasoningCategory, Set<string>>; // Category -> Type IDs

  constructor() {
    this.index = new Map();
    this.keywordIndex = new Map();
    this.applicationIndex = new Map();
    this.categoryIndex = new Map();
    this.buildIndices();
  }

  /**
   * Build search indices
   */
  private buildIndices(): void {
    for (const type of REASONING_TAXONOMY) {
      // Main index
      this.index.set(type.id, type);

      // Keyword index
      for (const keyword of type.keywords) {
        const lowerKeyword = keyword.toLowerCase();
        if (!this.keywordIndex.has(lowerKeyword)) {
          this.keywordIndex.set(lowerKeyword, new Set());
        }
        this.keywordIndex.get(lowerKeyword)!.add(type.id);
      }

      // Application index
      for (const application of type.applications) {
        const lowerApp = application.toLowerCase();
        if (!this.applicationIndex.has(lowerApp)) {
          this.applicationIndex.set(lowerApp, new Set());
        }
        this.applicationIndex.get(lowerApp)!.add(type.id);
      }

      // Category index
      if (!this.categoryIndex.has(type.category)) {
        this.categoryIndex.set(type.category, new Set());
      }
      this.categoryIndex.get(type.category)!.add(type.id);
    }
  }

  /**
   * Query taxonomy with filters
   */
  query(filters: TaxonomyQuery): QueryResult[] {
    let candidates = Array.from(this.index.values());
    const results: QueryResult[] = [];

    // Apply filters
    if (filters.categories && filters.categories.length > 0) {
      candidates = candidates.filter(t => filters.categories!.includes(t.category));
    }

    if (filters.difficulties && filters.difficulties.length > 0) {
      candidates = candidates.filter(t => filters.difficulties!.includes(t.difficulty));
    }

    if (filters.frequencies && filters.frequencies.length > 0) {
      candidates = candidates.filter(t => filters.frequencies!.includes(t.usageFrequency));
    }

    if (filters.hasPrerequisites !== undefined) {
      candidates = candidates.filter(t => (t.prerequisites.length > 0) === filters.hasPrerequisites);
    }

    if (filters.hasFormalDefinition !== undefined) {
      candidates = candidates.filter(t => (t.formalDefinition !== undefined) === filters.hasFormalDefinition);
    }

    // Keyword filter
    if (filters.keywords && filters.keywords.length > 0) {
      candidates = candidates.filter(t => filters.keywords!.some(k => t.keywords.includes(k.toLowerCase())));
    }

    // Application filter
    if (filters.applications && filters.applications.length > 0) {
      candidates = candidates.filter(t =>
        filters.applications!.some(app =>
          t.applications.some(tApp => tApp.toLowerCase().includes(app.toLowerCase()))
        )
      );
    }

    // Text search
    if (filters.searchText) {
      const searchResults = searchReasoningTypes(filters.searchText);
      const searchIds = new Set(searchResults.map(r => r.id));
      candidates = candidates.filter(t => searchIds.has(t.id));
    }

    // Calculate relevance scores
    for (const type of candidates) {
      const matchReasons: string[] = [];
      let score = 0;

      if (filters.categories?.includes(type.category)) {
        score += 10;
        matchReasons.push(`Category: ${type.category}`);
      }

      if (filters.difficulties?.includes(type.difficulty)) {
        score += 5;
        matchReasons.push(`Difficulty: ${type.difficulty}`);
      }

      if (filters.frequencies?.includes(type.usageFrequency)) {
        score += 3;
        matchReasons.push(`Frequency: ${type.usageFrequency}`);
      }

      if (filters.keywords) {
        const matchedKeywords = filters.keywords.filter(k =>
          type.keywords.some(tk => tk.toLowerCase().includes(k.toLowerCase()))
        );
        score += matchedKeywords.length * 7;
        if (matchedKeywords.length > 0) {
          matchReasons.push(`Keywords: ${matchedKeywords.join(', ')}`);
        }
      }

      if (filters.applications) {
        const matchedApps = filters.applications.filter(app =>
          type.applications.some(tApp => tApp.toLowerCase().includes(app.toLowerCase()))
        );
        score += matchedApps.length * 8;
        if (matchedApps.length > 0) {
          matchReasons.push(`Applications: ${matchedApps.join(', ')}`);
        }
      }

      if (filters.searchText) {
        const lowerSearch = filters.searchText.toLowerCase();
        if (type.name.toLowerCase().includes(lowerSearch)) {
          score += 20;
          matchReasons.push('Name match');
        } else if (type.description.toLowerCase().includes(lowerSearch)) {
          score += 10;
          matchReasons.push('Description match');
        }
      }

      results.push({
        type,
        relevanceScore: score || 1, // Minimum score 1
        matchReasons,
      });
    }

    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return results;
  }

  /**
   * Find reasoning types by keyword
   */
  findByKeyword(keyword: string): ReasoningType[] {
    const lowerKeyword = keyword.toLowerCase();
    const typeIds = this.keywordIndex.get(lowerKeyword);

    if (!typeIds) return [];

    return Array.from(typeIds)
      .map(id => this.index.get(id))
      .filter(Boolean) as ReasoningType[];
  }

  /**
   * Find reasoning types by application
   */
  findByApplication(application: string): ReasoningType[] {
    const results: ReasoningType[] = [];
    const lowerApp = application.toLowerCase();

    for (const [app, typeIds] of this.applicationIndex) {
      if (app.includes(lowerApp)) {
        for (const id of typeIds) {
          const type = this.index.get(id);
          if (type) results.push(type);
        }
      }
    }

    return results;
  }

  /**
   * Explore neighborhood of a reasoning type
   */
  explore(typeId: string): TaxonomyExploration | null {
    const startType = this.index.get(typeId);
    if (!startType) return null;

    // Prerequisites
    const prerequisites = startType.prerequisites
      .map(id => this.index.get(id))
      .filter(Boolean) as ReasoningType[];

    // Related types
    const related = startType.relatedTypes
      .map(id => this.index.get(id))
      .filter(Boolean) as ReasoningType[];

    // Same category
    const categoryTypeIds = this.categoryIndex.get(startType.category) || new Set();
    const sameCategory = Array.from(categoryTypeIds)
      .filter(id => id !== typeId)
      .map(id => this.index.get(id))
      .filter(Boolean) as ReasoningType[];

    // Similar applications
    const startApps = new Set(startType.applications.map(a => a.toLowerCase()));
    const similarApplications = Array.from(this.index.values())
      .filter(t => {
        if (t.id === typeId) return false;
        const overlap = t.applications.filter(app => startApps.has(app.toLowerCase()));
        return overlap.length > 0;
      })
      .slice(0, 10); // Limit to top 10

    // Build learning path (topological sort of prerequisites)
    const learningPath = this.computeLearningPath(typeId);

    // Build dependency graph
    const dependencies = this.buildDependencyGraph(typeId);

    return {
      startType,
      neighborhood: {
        prerequisites,
        related,
        sameCategory,
        similarApplications,
      },
      learningPath,
      dependencies,
    };
  }

  /**
   * Compute optimal learning path to reach a reasoning type
   */
  private computeLearningPath(targetId: string): ReasoningType[] {
    const path: ReasoningType[] = [];
    const visited = new Set<string>();

    const visit = (id: string) => {
      if (visited.has(id)) return;

      const type = this.index.get(id);
      if (!type) return;

      // Visit prerequisites first
      for (const prereqId of type.prerequisites) {
        visit(prereqId);
      }

      visited.add(id);
      path.push(type);
    };

    visit(targetId);
    return path;
  }

  /**
   * Build dependency graph around a reasoning type
   */
  private buildDependencyGraph(startId: string, depth: number = 2): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    const visited = new Set<string>();

    const traverse = (id: string, currentDepth: number) => {
      if (visited.has(id) || currentDepth > depth) return;

      visited.add(id);
      const type = this.index.get(id);
      if (!type) return;

      graph.set(id, type.prerequisites);

      // Traverse prerequisites
      for (const prereqId of type.prerequisites) {
        traverse(prereqId, currentDepth + 1);
      }

      // Traverse related
      for (const relatedId of type.relatedTypes) {
        traverse(relatedId, currentDepth + 1);
      }
    };

    traverse(startId, 0);
    return graph;
  }

  /**
   * Find path between two reasoning types
   */
  findPath(fromId: string, toId: string): NavigationPath | null {
    const fromType = this.index.get(fromId);
    const toType = this.index.get(toId);

    if (!fromType || !toType) return null;

    // BFS to find shortest path
    const queue: Array<{ id: string; path: NavigationStep[] }> = [{ id: fromId, path: [] }];
    const visited = new Set<string>([fromId]);

    while (queue.length > 0) {
      const { id, path } = queue.shift()!;

      if (id === toId) {
        const totalDistance = path.reduce((sum, step) => sum + step.distance, 0);
        return { steps: path, totalDistance };
      }

      const current = this.index.get(id)!;

      // Explore neighbors
      const neighbors: Array<{ id: string; relationship: NavigationStep['relationship']; distance: number }> = [];

      // Prerequisites
      for (const prereqId of current.prerequisites) {
        if (!visited.has(prereqId)) {
          neighbors.push({ id: prereqId, relationship: 'prerequisite', distance: 1 });
        }
      }

      // Related types
      for (const relatedId of current.relatedTypes) {
        if (!visited.has(relatedId)) {
          neighbors.push({ id: relatedId, relationship: 'related', distance: 2 });
        }
      }

      // Same category
      const categoryTypeIds = this.categoryIndex.get(current.category) || new Set();
      for (const catId of categoryTypeIds) {
        if (!visited.has(catId) && catId !== id) {
          neighbors.push({ id: catId, relationship: 'same_category', distance: 3 });
        }
      }

      for (const neighbor of neighbors) {
        if (visited.has(neighbor.id)) continue;

        visited.add(neighbor.id);
        const neighborType = this.index.get(neighbor.id)!;

        const step: NavigationStep = {
          from: current,
          to: neighborType,
          relationship: neighbor.relationship,
          distance: neighbor.distance,
        };

        queue.push({
          id: neighbor.id,
          path: [...path, step],
        });
      }
    }

    return null; // No path found
  }

  /**
   * Get recommended reasoning types for a problem
   */
  recommend(problemDescription: string, context?: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    domain?: string;
    constraints?: string[];
  }): QueryResult[] {
    // Extract keywords from problem description
    const words = problemDescription.toLowerCase().split(/\s+/);
    const keywords: string[] = [];

    // Check against taxonomy keywords
    for (const word of words) {
      if (this.keywordIndex.has(word)) {
        keywords.push(word);
      }
    }

    // Build query
    const query: TaxonomyQuery = {
      keywords,
      searchText: problemDescription,
    };

    if (context?.difficulty) {
      query.difficulties = [context.difficulty];
    }

    if (context?.domain) {
      query.applications = [context.domain];
    }

    return this.query(query).slice(0, 10); // Top 10 recommendations
  }

  /**
   * Compare two reasoning types
   */
  compare(id1: string, id2: string): {
    type1: ReasoningType;
    type2: ReasoningType;
    commonalities: string[];
    differences: string[];
    relatedPath: NavigationPath | null;
  } | null {
    const type1 = this.index.get(id1);
    const type2 = this.index.get(id2);

    if (!type1 || !type2) return null;

    const commonalities: string[] = [];
    const differences: string[] = [];

    // Category
    if (type1.category === type2.category) {
      commonalities.push(`Both are ${type1.category} reasoning`);
    } else {
      differences.push(`Different categories: ${type1.category} vs ${type2.category}`);
    }

    // Difficulty
    if (type1.difficulty === type2.difficulty) {
      commonalities.push(`Same difficulty: ${type1.difficulty}`);
    } else {
      differences.push(`Different difficulty: ${type1.difficulty} vs ${type2.difficulty}`);
    }

    // Shared applications
    const sharedApps = type1.applications.filter(app => type2.applications.includes(app));
    if (sharedApps.length > 0) {
      commonalities.push(`Shared applications: ${sharedApps.join(', ')}`);
    }

    // Shared keywords
    const sharedKeywords = type1.keywords.filter(kw => type2.keywords.includes(kw));
    if (sharedKeywords.length > 0) {
      commonalities.push(`Shared keywords: ${sharedKeywords.join(', ')}`);
    }

    // Related?
    if (type1.relatedTypes.includes(id2) || type2.relatedTypes.includes(id1)) {
      commonalities.push('Directly related types');
    }

    // Find path
    const relatedPath = this.findPath(id1, id2);

    return {
      type1,
      type2,
      commonalities,
      differences,
      relatedPath,
    };
  }

  /**
   * Get taxonomy overview
   */
  getOverview(): {
    total: number;
    categories: Array<{ name: ReasoningCategory; count: number; types: string[] }>;
    difficulties: Map<string, number>;
    popularTypes: ReasoningType[];
  } {
    const stats = getTaxonomyStats();

    const categories = Array.from(stats.byCategory.entries())
      .map(([category, count]) => {
        const types = getReasoningTypesByCategory(category).map(t => t.name);
        return { name: category, count, types };
      })
      .sort((a, b) => b.count - a.count);

    const popularTypes = Array.from(this.index.values())
      .filter(t => t.usageFrequency === 'very_common')
      .slice(0, 20);

    return {
      total: stats.total,
      categories,
      difficulties: stats.byDifficulty,
      popularTypes,
    };
  }

  /**
   * Generate query report
   */
  generateQueryReport(results: QueryResult[]): string {
    const report: string[] = [];

    report.push('# Taxonomy Query Results');
    report.push('');
    report.push(`Found ${results.length} matching reasoning types`);
    report.push('');

    for (let i = 0; i < Math.min(results.length, 20); i++) {
      const result = results[i];
      const type = result.type;

      report.push(`## ${i + 1}. ${type.name}`);
      report.push(`**Category:** ${type.category}`);
      report.push(`**Difficulty:** ${type.difficulty}`);
      report.push(`**Relevance Score:** ${result.relevanceScore}`);
      report.push('');
      report.push(`**Description:** ${type.description}`);
      report.push('');

      if (result.matchReasons.length > 0) {
        report.push('**Match Reasons:**');
        for (const reason of result.matchReasons) {
          report.push(`- ${reason}`);
        }
        report.push('');
      }

      report.push(`**Applications:** ${type.applications.join(', ')}`);
      report.push('');

      if (type.examples.length > 0) {
        report.push('**Example:**');
        report.push(`> ${type.examples[0]}`);
        report.push('');
      }
    }

    return report.join('\n');
  }
}
