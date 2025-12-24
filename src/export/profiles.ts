/**
 * Export Profiles Module - Phase 12 Sprint 4
 *
 * Provides pre-defined export profile bundles for common use cases.
 * Each profile defines a set of formats and profile-specific options.
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Available export format types
 */
export type ExportFormatType =
  | 'markdown'
  | 'latex'
  | 'json'
  | 'html'
  | 'jupyter'
  | 'mermaid'
  | 'dot'
  | 'ascii'
  | 'svg';

/**
 * Profile-specific export options
 */
export interface ProfileExportOptions {
  /** Include citations in academic formats */
  includeCitations?: boolean;

  /** Simplify diagrams for presentations */
  simplifyDiagrams?: boolean;

  /** Include metadata in output */
  includeMetadata?: boolean;

  /** Include timestamps */
  includeTimestamps?: boolean;

  /** Include session statistics */
  includeStatistics?: boolean;

  /** Use abbreviated mode names */
  abbreviateModeNames?: boolean;

  /** Maximum diagram complexity (nodes) */
  maxDiagramNodes?: number;

  /** Include table of contents */
  includeTableOfContents?: boolean;

  /** LaTeX document class */
  latexDocumentClass?: 'article' | 'report' | 'book';

  /** Jupyter notebook kernel */
  jupyterKernel?: string;
}

/**
 * An export profile definition
 */
export interface ExportProfile {
  /** Unique identifier */
  id: ExportProfileId;

  /** Display name */
  name: string;

  /** Description of the profile's purpose */
  description: string;

  /** Formats included in this profile */
  formats: ExportFormatType[];

  /** Profile-specific options */
  options: ProfileExportOptions;

  /** Use case description */
  useCase: string;

  /** Tags for categorization */
  tags: string[];
}

/**
 * Valid profile identifiers
 */
export type ExportProfileId =
  | 'academic'
  | 'presentation'
  | 'documentation'
  | 'archive'
  | 'minimal';

// ============================================================================
// PROFILE DEFINITIONS
// ============================================================================

/**
 * Academic profile - optimized for papers and publications
 */
const ACADEMIC_PROFILE: ExportProfile = {
  id: 'academic',
  name: 'Academic',
  description: 'Optimized for academic papers, theses, and publications',
  formats: ['latex', 'markdown', 'json'],
  options: {
    includeCitations: true,
    includeMetadata: true,
    includeTimestamps: true,
    includeStatistics: true,
    includeTableOfContents: true,
    latexDocumentClass: 'article',
  },
  useCase:
    'Use for generating content for academic papers, research documentation, or formal publications.',
  tags: ['academic', 'formal', 'citations', 'latex'],
};

/**
 * Presentation profile - optimized for slides and visual presentations
 */
const PRESENTATION_PROFILE: ExportProfile = {
  id: 'presentation',
  name: 'Presentation',
  description: 'Optimized for slides, visual presentations, and diagrams',
  formats: ['mermaid', 'svg', 'markdown'],
  options: {
    simplifyDiagrams: true,
    abbreviateModeNames: true,
    maxDiagramNodes: 15,
    includeMetadata: false,
    includeStatistics: false,
  },
  useCase:
    'Use for creating visual content for presentations, slides, or dashboards.',
  tags: ['presentation', 'visual', 'diagrams', 'slides'],
};

/**
 * Documentation profile - optimized for technical documentation
 */
const DOCUMENTATION_PROFILE: ExportProfile = {
  id: 'documentation',
  name: 'Documentation',
  description: 'Optimized for technical documentation and READMEs',
  formats: ['markdown', 'mermaid', 'ascii'],
  options: {
    includeMetadata: true,
    includeTimestamps: true,
    includeTableOfContents: true,
    includeStatistics: true,
    simplifyDiagrams: false,
  },
  useCase:
    'Use for creating technical documentation, README files, or knowledge base articles.',
  tags: ['documentation', 'technical', 'readme', 'markdown'],
};

/**
 * Archive profile - comprehensive export for long-term storage
 */
const ARCHIVE_PROFILE: ExportProfile = {
  id: 'archive',
  name: 'Archive',
  description: 'Comprehensive export for long-term storage and backup',
  formats: ['json', 'markdown', 'latex', 'jupyter'],
  options: {
    includeCitations: true,
    includeMetadata: true,
    includeTimestamps: true,
    includeStatistics: true,
    includeTableOfContents: true,
    jupyterKernel: 'python3',
  },
  useCase:
    'Use for creating comprehensive backups or archiving reasoning sessions.',
  tags: ['archive', 'backup', 'comprehensive', 'storage'],
};

/**
 * Minimal profile - lightweight export with essential content only
 */
const MINIMAL_PROFILE: ExportProfile = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Lightweight export with essential content only',
  formats: ['json', 'markdown'],
  options: {
    includeMetadata: false,
    includeTimestamps: false,
    includeStatistics: false,
    simplifyDiagrams: true,
    abbreviateModeNames: true,
  },
  useCase: 'Use for quick exports or when storage/bandwidth is limited.',
  tags: ['minimal', 'lightweight', 'quick'],
};

// ============================================================================
// PROFILE REGISTRY
// ============================================================================

/**
 * All available export profiles
 */
export const EXPORT_PROFILES: Record<ExportProfileId, ExportProfile> = {
  academic: ACADEMIC_PROFILE,
  presentation: PRESENTATION_PROFILE,
  documentation: DOCUMENTATION_PROFILE,
  archive: ARCHIVE_PROFILE,
  minimal: MINIMAL_PROFILE,
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get an export profile by ID
 */
export function getExportProfile(id: ExportProfileId): ExportProfile | undefined {
  return EXPORT_PROFILES[id];
}

/**
 * Get all export profiles as an array
 */
export function getAllExportProfiles(): ExportProfile[] {
  return Object.values(EXPORT_PROFILES);
}

/**
 * Get profiles by tag
 */
export function getExportProfilesByTag(tag: string): ExportProfile[] {
  const lowerTag = tag.toLowerCase();
  return getAllExportProfiles().filter((p) =>
    p.tags.some((t) => t.toLowerCase() === lowerTag)
  );
}

/**
 * Get profiles that include a specific format
 */
export function getExportProfilesByFormat(format: ExportFormatType): ExportProfile[] {
  return getAllExportProfiles().filter((p) => p.formats.includes(format));
}

/**
 * Check if a profile ID is valid
 */
export function isValidExportProfileId(id: string): id is ExportProfileId {
  return id in EXPORT_PROFILES;
}

/**
 * List all profile IDs
 */
export function listExportProfileIds(): ExportProfileId[] {
  return Object.keys(EXPORT_PROFILES) as ExportProfileId[];
}

/**
 * Get profile metadata (without full options)
 */
export interface ExportProfileMetadata {
  id: ExportProfileId;
  name: string;
  description: string;
  formatCount: number;
  formats: ExportFormatType[];
  tags: string[];
}

export function getExportProfileMetadata(
  id: ExportProfileId
): ExportProfileMetadata | undefined {
  const profile = EXPORT_PROFILES[id];
  if (!profile) return undefined;

  return {
    id: profile.id,
    name: profile.name,
    description: profile.description,
    formatCount: profile.formats.length,
    formats: profile.formats,
    tags: profile.tags,
  };
}

/**
 * Create a custom profile by combining existing profiles
 */
export function combineExportProfiles(
  profileIds: ExportProfileId[],
  name: string,
  mergeOptions: 'union' | 'intersection' = 'union'
): ExportProfile {
  const profiles = profileIds
    .map((id) => EXPORT_PROFILES[id])
    .filter((p): p is ExportProfile => p !== undefined);

  if (profiles.length === 0) {
    return {
      id: 'minimal' as ExportProfileId,
      name,
      description: 'Custom combined profile',
      formats: ['json', 'markdown'],
      options: {},
      useCase: 'Custom profile',
      tags: ['custom'],
    };
  }

  // Merge formats
  let formats: ExportFormatType[];
  if (mergeOptions === 'union') {
    const formatSet = new Set<ExportFormatType>();
    profiles.forEach((p) => p.formats.forEach((f) => formatSet.add(f)));
    formats = Array.from(formatSet);
  } else {
    // Intersection - only formats present in all profiles
    formats = profiles[0].formats.filter((f) =>
      profiles.every((p) => p.formats.includes(f))
    );
    if (formats.length === 0) {
      formats = ['json', 'markdown']; // Default fallback
    }
  }

  // Merge options (union of all options, later profiles override earlier)
  const mergedOptions: ProfileExportOptions = {};
  profiles.forEach((p) => Object.assign(mergedOptions, p.options));

  // Merge tags
  const tagSet = new Set<string>();
  profiles.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  tagSet.add('custom');

  return {
    id: `custom_${Date.now()}` as ExportProfileId,
    name,
    description: `Combined profile from: ${profileIds.join(', ')}`,
    formats,
    options: mergedOptions,
    useCase: 'Custom combined profile',
    tags: Array.from(tagSet),
  };
}

/**
 * Get recommended profile based on use case keywords
 */
export function recommendExportProfile(keywords: string[]): ExportProfileId {
  const lowerKeywords = keywords.map((k) => k.toLowerCase());

  // Check for academic keywords
  if (
    lowerKeywords.some((k) =>
      ['paper', 'thesis', 'publication', 'academic', 'research', 'latex', 'citation'].includes(k)
    )
  ) {
    return 'academic';
  }

  // Check for presentation keywords
  if (
    lowerKeywords.some((k) =>
      ['slide', 'presentation', 'visual', 'diagram', 'dashboard'].includes(k)
    )
  ) {
    return 'presentation';
  }

  // Check for documentation keywords
  if (
    lowerKeywords.some((k) =>
      ['documentation', 'readme', 'technical', 'doc', 'wiki'].includes(k)
    )
  ) {
    return 'documentation';
  }

  // Check for archive keywords
  if (
    lowerKeywords.some((k) =>
      ['archive', 'backup', 'storage', 'comprehensive', 'full'].includes(k)
    )
  ) {
    return 'archive';
  }

  // Default to minimal
  return 'minimal';
}
