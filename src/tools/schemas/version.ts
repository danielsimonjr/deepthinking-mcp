/**
 * Schema Versioning (v4.0.0)
 * Sprint 5 Task 5.9: Version tracking for schema migrations
 */

export const SCHEMA_VERSION = '4.0.0';

export interface BreakingChange {
  version: string;
  description: string;
}

export interface Deprecation {
  tool: string;
  replacement: string;
  removeIn: string;
}

export const schemaMetadata = {
  version: SCHEMA_VERSION,

  breakingChanges: [
    {
      version: '4.0.0',
      description: 'Split monolithic deepthinking tool into 9 focused tools',
    },
  ] as BreakingChange[],

  deprecated: [
    {
      tool: 'deepthinking',
      replacement: 'deepthinking_*',
      removeIn: '5.0.0',
    },
  ] as Deprecation[],

  tools: [
    { name: 'deepthinking_core', modes: ['sequential', 'shannon', 'hybrid'] },
    { name: 'deepthinking_mathematics', modes: ['mathematics', 'physics'] },
    { name: 'deepthinking_temporal', modes: ['temporal'] },
    { name: 'deepthinking_probabilistic', modes: ['bayesian', 'evidential'] },
    { name: 'deepthinking_causal', modes: ['causal', 'counterfactual', 'abductive'] },
    { name: 'deepthinking_strategic', modes: ['gametheory', 'optimization'] },
    { name: 'deepthinking_analytical', modes: ['analogical', 'firstprinciples'] },
    {
      name: 'deepthinking_scientific',
      modes: ['scientificmethod', 'systemsthinking', 'formallogic'],
    },
    { name: 'deepthinking_session', modes: [] },
  ],
};

/**
 * Check if a version is compatible
 */
export function isCompatibleVersion(version: string): boolean {
  const [major] = version.split('.').map(Number);
  const [currentMajor] = SCHEMA_VERSION.split('.').map(Number);
  return major === currentMajor;
}

/**
 * Get deprecation warning for a tool
 */
export function getDeprecationWarning(tool: string): string | null {
  const deprecation = schemaMetadata.deprecated.find((d) => d.tool === tool);
  if (!deprecation) return null;
  return `DEPRECATED: '${tool}' will be removed in v${deprecation.removeIn}. Use '${deprecation.replacement}' instead.`;
}
