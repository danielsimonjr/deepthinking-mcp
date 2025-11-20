/**
 * Templates Module Exports (v3.4.0)
 * Phase 4 Task 9.3: Session templates system
 */

export { TemplateManager } from './manager.js';
export {
  BUILT_IN_TEMPLATES,
  getTemplateById,
  getTemplateIds,
  getTemplatesByCategory,
  getTemplatesByMode,
} from './built-in.js';

export type {
  SessionTemplate,
  TemplateCategory,
  TemplateStructure,
  TemplateStep,
  TemplateStats,
  TemplateQuery,
  TemplateInstantiationOptions,
} from './types.js';
