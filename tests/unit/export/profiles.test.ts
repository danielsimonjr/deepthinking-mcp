/**
 * Export Profiles Tests - Phase 12 Sprint 4
 *
 * Tests for the export profile system.
 */

import { describe, it, expect } from 'vitest';
import {
  EXPORT_PROFILES,
  getExportProfile,
  getAllExportProfiles,
  getExportProfilesByTag,
  getExportProfilesByFormat,
  isValidExportProfileId,
  listExportProfileIds,
  getExportProfileMetadata,
  combineExportProfiles,
  recommendExportProfile,
  type ExportProfileId,
  type ExportFormatType,
} from '../../../src/export/profiles.js';

describe('Export Profiles', () => {
  describe('EXPORT_PROFILES constant', () => {
    it('should have 5 predefined profiles', () => {
      const profileIds = Object.keys(EXPORT_PROFILES);
      expect(profileIds).toHaveLength(5);
    });

    it('should include academic profile', () => {
      expect(EXPORT_PROFILES.academic).toBeDefined();
      expect(EXPORT_PROFILES.academic.name).toBe('Academic');
    });

    it('should include presentation profile', () => {
      expect(EXPORT_PROFILES.presentation).toBeDefined();
      expect(EXPORT_PROFILES.presentation.name).toBe('Presentation');
    });

    it('should include documentation profile', () => {
      expect(EXPORT_PROFILES.documentation).toBeDefined();
      expect(EXPORT_PROFILES.documentation.name).toBe('Documentation');
    });

    it('should include archive profile', () => {
      expect(EXPORT_PROFILES.archive).toBeDefined();
      expect(EXPORT_PROFILES.archive.name).toBe('Archive');
    });

    it('should include minimal profile', () => {
      expect(EXPORT_PROFILES.minimal).toBeDefined();
      expect(EXPORT_PROFILES.minimal.name).toBe('Minimal');
    });
  });

  describe('academic profile', () => {
    const profile = EXPORT_PROFILES.academic;

    it('should include latex format', () => {
      expect(profile.formats).toContain('latex');
    });

    it('should include markdown format', () => {
      expect(profile.formats).toContain('markdown');
    });

    it('should include json format', () => {
      expect(profile.formats).toContain('json');
    });

    it('should have citations enabled', () => {
      expect(profile.options.includeCitations).toBe(true);
    });

    it('should have metadata enabled', () => {
      expect(profile.options.includeMetadata).toBe(true);
    });

    it('should have academic tags', () => {
      expect(profile.tags).toContain('academic');
      expect(profile.tags).toContain('latex');
    });

    it('should have a use case description', () => {
      expect(profile.useCase).toBeDefined();
      expect(profile.useCase.length).toBeGreaterThan(0);
    });
  });

  describe('presentation profile', () => {
    const profile = EXPORT_PROFILES.presentation;

    it('should include mermaid format', () => {
      expect(profile.formats).toContain('mermaid');
    });

    it('should include svg format', () => {
      expect(profile.formats).toContain('svg');
    });

    it('should have simplifyDiagrams enabled', () => {
      expect(profile.options.simplifyDiagrams).toBe(true);
    });

    it('should have abbreviateModeNames enabled', () => {
      expect(profile.options.abbreviateModeNames).toBe(true);
    });

    it('should have maxDiagramNodes set', () => {
      expect(profile.options.maxDiagramNodes).toBe(15);
    });
  });

  describe('documentation profile', () => {
    const profile = EXPORT_PROFILES.documentation;

    it('should include markdown format', () => {
      expect(profile.formats).toContain('markdown');
    });

    it('should include mermaid format', () => {
      expect(profile.formats).toContain('mermaid');
    });

    it('should include ascii format', () => {
      expect(profile.formats).toContain('ascii');
    });

    it('should have table of contents enabled', () => {
      expect(profile.options.includeTableOfContents).toBe(true);
    });
  });

  describe('archive profile', () => {
    const profile = EXPORT_PROFILES.archive;

    it('should have most formats for comprehensive backup', () => {
      expect(profile.formats.length).toBeGreaterThanOrEqual(4);
    });

    it('should include jupyter format', () => {
      expect(profile.formats).toContain('jupyter');
    });

    it('should have all metadata enabled', () => {
      expect(profile.options.includeMetadata).toBe(true);
      expect(profile.options.includeTimestamps).toBe(true);
      expect(profile.options.includeStatistics).toBe(true);
    });
  });

  describe('minimal profile', () => {
    const profile = EXPORT_PROFILES.minimal;

    it('should have few formats', () => {
      expect(profile.formats.length).toBeLessThanOrEqual(3);
    });

    it('should have metadata disabled', () => {
      expect(profile.options.includeMetadata).toBe(false);
    });

    it('should have timestamps disabled', () => {
      expect(profile.options.includeTimestamps).toBe(false);
    });
  });

  describe('getExportProfile', () => {
    it('should return profile for valid ID', () => {
      const profile = getExportProfile('academic');
      expect(profile).toBeDefined();
      expect(profile?.name).toBe('Academic');
    });

    it('should return undefined for invalid ID', () => {
      const profile = getExportProfile('invalid' as ExportProfileId);
      expect(profile).toBeUndefined();
    });

    it('should return all profile types', () => {
      const ids: ExportProfileId[] = [
        'academic',
        'presentation',
        'documentation',
        'archive',
        'minimal',
      ];

      ids.forEach((id) => {
        expect(getExportProfile(id)).toBeDefined();
      });
    });
  });

  describe('getAllExportProfiles', () => {
    it('should return all profiles as array', () => {
      const profiles = getAllExportProfiles();
      expect(Array.isArray(profiles)).toBe(true);
      expect(profiles).toHaveLength(5);
    });

    it('should return profiles with required properties', () => {
      const profiles = getAllExportProfiles();

      profiles.forEach((profile) => {
        expect(profile.id).toBeDefined();
        expect(profile.name).toBeDefined();
        expect(profile.formats).toBeDefined();
        expect(profile.options).toBeDefined();
        expect(profile.tags).toBeDefined();
      });
    });
  });

  describe('getExportProfilesByTag', () => {
    it('should find profiles with academic tag', () => {
      const profiles = getExportProfilesByTag('academic');
      expect(profiles.length).toBeGreaterThan(0);
      profiles.forEach((p) => {
        expect(p.tags).toContain('academic');
      });
    });

    it('should find profiles with visual tag', () => {
      const profiles = getExportProfilesByTag('visual');
      expect(profiles.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const lower = getExportProfilesByTag('academic');
      const upper = getExportProfilesByTag('ACADEMIC');
      expect(lower.length).toBe(upper.length);
    });

    it('should return empty array for non-existent tag', () => {
      const profiles = getExportProfilesByTag('nonexistent');
      expect(profiles).toHaveLength(0);
    });
  });

  describe('getExportProfilesByFormat', () => {
    it('should find profiles containing markdown', () => {
      const profiles = getExportProfilesByFormat('markdown');
      expect(profiles.length).toBeGreaterThan(0);
      profiles.forEach((p) => {
        expect(p.formats).toContain('markdown');
      });
    });

    it('should find profiles containing latex', () => {
      const profiles = getExportProfilesByFormat('latex');
      expect(profiles.length).toBeGreaterThan(0);
    });

    it('should find profiles containing mermaid', () => {
      const profiles = getExportProfilesByFormat('mermaid');
      expect(profiles.length).toBeGreaterThan(0);
    });

    it('should handle format not in any profile', () => {
      // All profiles should have at least json or markdown
      const profiles = getExportProfilesByFormat('json');
      expect(Array.isArray(profiles)).toBe(true);
    });
  });

  describe('isValidExportProfileId', () => {
    it('should return true for valid profile IDs', () => {
      expect(isValidExportProfileId('academic')).toBe(true);
      expect(isValidExportProfileId('presentation')).toBe(true);
      expect(isValidExportProfileId('documentation')).toBe(true);
      expect(isValidExportProfileId('archive')).toBe(true);
      expect(isValidExportProfileId('minimal')).toBe(true);
    });

    it('should return false for invalid profile IDs', () => {
      expect(isValidExportProfileId('invalid')).toBe(false);
      expect(isValidExportProfileId('')).toBe(false);
      expect(isValidExportProfileId('ACADEMIC')).toBe(false);
    });
  });

  describe('listExportProfileIds', () => {
    it('should return all profile IDs', () => {
      const ids = listExportProfileIds();

      expect(ids).toContain('academic');
      expect(ids).toContain('presentation');
      expect(ids).toContain('documentation');
      expect(ids).toContain('archive');
      expect(ids).toContain('minimal');
    });

    it('should return exactly 5 IDs', () => {
      const ids = listExportProfileIds();
      expect(ids).toHaveLength(5);
    });

    it('should return valid profile IDs', () => {
      const ids = listExportProfileIds();
      ids.forEach((id) => {
        expect(isValidExportProfileId(id)).toBe(true);
      });
    });
  });

  describe('getExportProfileMetadata', () => {
    it('should return metadata for valid profile', () => {
      const metadata = getExportProfileMetadata('academic');

      expect(metadata).toBeDefined();
      expect(metadata?.id).toBe('academic');
      expect(metadata?.name).toBe('Academic');
      expect(metadata?.formatCount).toBeGreaterThan(0);
      expect(metadata?.formats).toBeDefined();
      expect(metadata?.tags).toBeDefined();
    });

    it('should return undefined for invalid profile', () => {
      const metadata = getExportProfileMetadata('invalid' as ExportProfileId);
      expect(metadata).toBeUndefined();
    });

    it('should include all metadata fields', () => {
      const metadata = getExportProfileMetadata('presentation');

      expect(metadata).toHaveProperty('id');
      expect(metadata).toHaveProperty('name');
      expect(metadata).toHaveProperty('description');
      expect(metadata).toHaveProperty('formatCount');
      expect(metadata).toHaveProperty('formats');
      expect(metadata).toHaveProperty('tags');
    });
  });

  describe('combineExportProfiles', () => {
    it('should combine formats from multiple profiles', () => {
      const combined = combineExportProfiles(
        ['academic', 'presentation'],
        'Combined Export'
      );

      expect(combined.name).toBe('Combined Export');
      expect(combined.formats.length).toBeGreaterThan(0);
    });

    it('should deduplicate formats', () => {
      const combined = combineExportProfiles(
        ['academic', 'documentation'],
        'Combined'
      );

      const uniqueFormats = new Set(combined.formats);
      expect(combined.formats.length).toBe(uniqueFormats.size);
    });

    it('should add custom tag', () => {
      const combined = combineExportProfiles(
        ['academic', 'presentation'],
        'Combined'
      );

      expect(combined.tags).toContain('custom');
    });

    it('should use specified merge strategy', () => {
      const union = combineExportProfiles(
        ['academic', 'presentation'],
        'Combined',
        'union'
      );

      const intersection = combineExportProfiles(
        ['academic', 'documentation'],
        'Combined',
        'intersection'
      );

      // Union should have more formats than intersection
      expect(union.formats.length).toBeGreaterThanOrEqual(intersection.formats.length);
    });

    it('should handle single profile', () => {
      const combined = combineExportProfiles(['academic'], 'Single');
      expect(combined.formats.length).toBeGreaterThan(0);
    });

    it('should handle non-existent profile gracefully', () => {
      const combined = combineExportProfiles(
        ['academic', 'nonexistent' as ExportProfileId],
        'Partial'
      );
      expect(combined.formats.length).toBeGreaterThan(0);
    });

    it('should generate unique ID for combined profile', () => {
      const combined = combineExportProfiles(['academic', 'archive'], 'Combined');
      expect(combined.id).toContain('custom');
    });
  });

  describe('recommendExportProfile', () => {
    it('should recommend academic for paper keywords', () => {
      expect(recommendExportProfile(['paper'])).toBe('academic');
      expect(recommendExportProfile(['thesis'])).toBe('academic');
      expect(recommendExportProfile(['publication'])).toBe('academic');
      expect(recommendExportProfile(['latex'])).toBe('academic');
    });

    it('should recommend presentation for slide keywords', () => {
      expect(recommendExportProfile(['slide'])).toBe('presentation');
      expect(recommendExportProfile(['presentation'])).toBe('presentation');
      expect(recommendExportProfile(['visual'])).toBe('presentation');
      expect(recommendExportProfile(['diagram'])).toBe('presentation');
    });

    it('should recommend documentation for doc keywords', () => {
      expect(recommendExportProfile(['documentation'])).toBe('documentation');
      expect(recommendExportProfile(['readme'])).toBe('documentation');
      expect(recommendExportProfile(['technical'])).toBe('documentation');
    });

    it('should recommend archive for backup keywords', () => {
      expect(recommendExportProfile(['archive'])).toBe('archive');
      expect(recommendExportProfile(['backup'])).toBe('archive');
      expect(recommendExportProfile(['comprehensive'])).toBe('archive');
    });

    it('should default to minimal for unknown keywords', () => {
      expect(recommendExportProfile(['unknown'])).toBe('minimal');
      expect(recommendExportProfile([])).toBe('minimal');
    });

    it('should be case insensitive', () => {
      expect(recommendExportProfile(['PAPER'])).toBe('academic');
      expect(recommendExportProfile(['Slide'])).toBe('presentation');
    });
  });

  describe('profile options', () => {
    it('should have valid option types in all profiles', () => {
      const profiles = getAllExportProfiles();

      profiles.forEach((profile) => {
        const opts = profile.options;

        if (opts.includeCitations !== undefined) {
          expect(typeof opts.includeCitations).toBe('boolean');
        }
        if (opts.simplifyDiagrams !== undefined) {
          expect(typeof opts.simplifyDiagrams).toBe('boolean');
        }
        if (opts.maxDiagramNodes !== undefined) {
          expect(typeof opts.maxDiagramNodes).toBe('number');
        }
        if (opts.latexDocumentClass !== undefined) {
          expect(['article', 'report', 'book']).toContain(opts.latexDocumentClass);
        }
      });
    });
  });

  describe('format arrays', () => {
    it('should have valid format types in all profiles', () => {
      const validFormats: ExportFormatType[] = [
        'markdown',
        'latex',
        'json',
        'html',
        'jupyter',
        'mermaid',
        'dot',
        'ascii',
        'svg',
      ];

      const profiles = getAllExportProfiles();

      profiles.forEach((profile) => {
        profile.formats.forEach((format) => {
          expect(validFormats).toContain(format);
        });
      });
    });

    it('should have at least one format in each profile', () => {
      const profiles = getAllExportProfiles();

      profiles.forEach((profile) => {
        expect(profile.formats.length).toBeGreaterThan(0);
      });
    });
  });
});
