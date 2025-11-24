/**
 * Template Manager (v3.4.0)
 * Phase 4 Task 9.3: Template management and instantiation
 */

import type {
  SessionTemplate,
  TemplateQuery,
  TemplateStats,
  TemplateInstantiationOptions,
} from './types.js';
import type { ThinkingSession } from '../types/index.js';
import { BUILT_IN_TEMPLATES } from './built-in.js';

/**
 * Template manager
 */
export class TemplateManager {
  private templates: Map<string, SessionTemplate>;
  private stats: Map<string, TemplateStats>;
  private customTemplates: Map<string, SessionTemplate>;

  constructor() {
    this.templates = new Map();
    this.stats = new Map();
    this.customTemplates = new Map();

    // Load built-in templates
    for (const template of BUILT_IN_TEMPLATES) {
      this.templates.set(template.id, template);
      this.stats.set(template.id, {
        templateId: template.id,
        usageCount: 0,
        averageCompletionRate: 0,
        averageThoughts: 0,
        averageConfidence: 0,
        successRate: 0,
      });
    }
  }

  /**
   * Get all templates
   */
  getAllTemplates(): SessionTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): SessionTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Search templates
   */
  searchTemplates(query: TemplateQuery): SessionTemplate[] {
    let results = Array.from(this.templates.values());

    // Filter by built-in only
    if (query.builtInOnly) {
      results = results.filter(t => t.builtIn);
    }

    // Filter by categories
    if (query.categories && query.categories.length > 0) {
      const categorySet = new Set(query.categories);
      results = results.filter(t => categorySet.has(t.category));
    }

    // Filter by modes
    if (query.modes && query.modes.length > 0) {
      const modeSet = new Set(query.modes);
      results = results.filter(t => modeSet.has(t.mode));
    }

    // Filter by difficulties
    if (query.difficulties && query.difficulties.length > 0) {
      const difficultySet = new Set(query.difficulties);
      results = results.filter(t => difficultySet.has(t.difficulty));
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      const tagSet = new Set(query.tags.map(t => t.toLowerCase()));
      results = results.filter(t =>
        t.tags.some(tag => tagSet.has(tag.toLowerCase()))
      );
    }

    // Text search
    if (query.text && query.text.trim() !== '') {
      const searchText = query.text.toLowerCase();
      results = results.filter(t =>
        t.name.toLowerCase().includes(searchText) ||
        t.description.toLowerCase().includes(searchText) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchText))
      );
    }

    // Sort results
    const sortBy = query.sortBy || 'name';
    results.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);

        case 'popularity': {
          const statsA = this.stats.get(a.id);
          const statsB = this.stats.get(b.id);
          return (statsB?.usageCount || 0) - (statsA?.usageCount || 0);
        }

        case 'recent': {
          const statsA = this.stats.get(a.id);
          const statsB = this.stats.get(b.id);
          const timeA = statsA?.lastUsed?.getTime() || 0;
          const timeB = statsB?.lastUsed?.getTime() || 0;
          return timeB - timeA;
        }

        case 'difficulty': {
          const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        }

        default:
          return 0;
      }
    });

    return results;
  }

  /**
   * Instantiate a template into a session
   */
  instantiateTemplate(
    optionsOrTemplateId: TemplateInstantiationOptions | string,
    additionalOptions?: Partial<TemplateInstantiationOptions>
  ): Partial<ThinkingSession> {
    // Handle both signatures: (options) or (templateId, options)
    const options: TemplateInstantiationOptions =
      typeof optionsOrTemplateId === 'string'
        ? { templateId: optionsOrTemplateId, ...additionalOptions }
        : optionsOrTemplateId;

    const template = this.templates.get(options.templateId);

    if (!template) {
      throw new Error(`Template not found: ${options.templateId}`);
    }

    // Update usage stats
    const stats = this.stats.get(template.id);
    if (stats) {
      stats.usageCount++;
      stats.lastUsed = new Date();
    }

    // Build session structure
    const title = options.title || `${template.name} Session`;
    const domain = options.domain || template.domains?.[0];

    // Calculate estimated total thoughts
    let estimatedThoughts = template.structure.setup.estimatedThoughts || 0;
    for (const step of template.structure.steps) {
      if (!options.skipOptional || !step.optional) {
        estimatedThoughts += step.estimatedThoughts || 0;
      }
    }
    estimatedThoughts += template.structure.conclusion.estimatedThoughts || 0;

    // Create session metadata
    const session: Partial<ThinkingSession> = {
      title,
      mode: template.mode,
      domain,
      author: options.author,
      thoughts: [],
      tags: [...template.tags, 'template', `template:${template.id}`],
        // @ts-expect-error - metadata not in type
      metadata: {
        templateId: template.id,
        templateName: template.name,
        estimatedThoughts,
        context: options.context,
      },
    };

    return session;
  }

  /**
   * Get template guidance for a step
   */
  getStepGuidance(templateId: string, stepNumber: number): string[] {
    const template = this.templates.get(templateId);
    if (!template) {
      return [];
    }

    // Find the step
    if (stepNumber === 1) {
      return template.structure.setup.prompts;
    }

    const stepIndex = stepNumber - 2;
    if (stepIndex >= 0 && stepIndex < template.structure.steps.length) {
      return template.structure.steps[stepIndex].prompts;
    }

    // Conclusion
    if (stepNumber === template.structure.steps.length + 2) {
      return template.structure.conclusion.prompts;
    }

    return [];
  }

  /**
   * Get template statistics
   */
  getTemplateStats(templateId: string): TemplateStats | undefined {
    return this.stats.get(templateId);
  }

  /**
   * Update template statistics from completed session
   */
  updateStatsFromSession(templateId: string, session: ThinkingSession): void {
    const stats = this.stats.get(templateId);
    if (!stats) {
      return;
    }

    // Update averages (simplified - would need proper running average)
    const thoughtCount = session.thoughts.length;
    const completed = session.thoughts.length > 0 && session.isComplete;
    const confidence = (session as any).confidence || 0;

    stats.averageThoughts = (stats.averageThoughts * (stats.usageCount - 1) + thoughtCount) / stats.usageCount;
    stats.averageConfidence = (stats.averageConfidence * (stats.usageCount - 1) + confidence) / stats.usageCount;

    if (completed) {
      stats.successRate = ((stats.successRate * (stats.usageCount - 1)) + 1) / stats.usageCount;
    } else {
      stats.successRate = (stats.successRate * (stats.usageCount - 1)) / stats.usageCount;
    }
  }

  /**
   * Add custom template
   */
  addCustomTemplate(template: SessionTemplate): void {
    template.builtIn = false;
    this.templates.set(template.id, template);
    this.customTemplates.set(template.id, template);

    this.stats.set(template.id, {
      templateId: template.id,
      usageCount: 0,
      averageCompletionRate: 0,
      averageThoughts: 0,
      averageConfidence: 0,
      successRate: 0,
    });
  }

  /**
   * Remove custom template
   */
  removeCustomTemplate(templateId: string): boolean {
    const template = this.templates.get(templateId);
    if (!template || template.builtIn) {
      return false;
    }

    this.templates.delete(templateId);
    this.customTemplates.delete(templateId);
    this.stats.delete(templateId);
    return true;
  }

  /**
   * Get recommended templates based on session history
   */
  getRecommendations(recentModes?: string[], limit: number = 5): SessionTemplate[] {
    const templates = Array.from(this.templates.values());

    // Sort by popularity and relevance
    templates.sort((a, b) => {
      const statsA = this.stats.get(a.id)!;
      const statsB = this.stats.get(b.id)!;

      // Boost score if mode matches recent usage
      let scoreA = statsA.usageCount * 10 + statsA.successRate * 100;
      let scoreB = statsB.usageCount * 10 + statsB.successRate * 100;

      if (recentModes) {
        if (recentModes.includes(a.mode)) scoreA += 50;
        if (recentModes.includes(b.mode)) scoreB += 50;
      }

      return scoreB - scoreA;
    });

    return templates.slice(0, limit);
  }

  /**
   * Export template to JSON
   */
  exportTemplate(templateId: string): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return JSON.stringify(template, null, 2);
  }

  /**
   * Import template from JSON
   */
  importTemplate(json: string): SessionTemplate {
    const template = JSON.parse(json) as SessionTemplate;
    template.builtIn = false;
    this.addCustomTemplate(template);
    return template;
  }

  /**
   * List templates with optional filters (alias for searchTemplates)
   */
  listTemplates(options?: {
    category?: string;
    difficulty?: string;
    mode?: string;
  }): SessionTemplate[] {
    if (!options) {
      return this.getAllTemplates();
    }

    const query: TemplateQuery = {};
    if (options.category) {
      // @ts-expect-error - String to TemplateCategory conversion
      query.categories = [options.category];
    }
    if (options.difficulty) {
      // @ts-expect-error - String to difficulty literal conversion
      query.difficulties = [options.difficulty];
    }
    if (options.mode) {
      // @ts-expect-error - String to ThinkingMode conversion
      query.modes = [options.mode];
    }

    return this.searchTemplates(query);
  }
}
