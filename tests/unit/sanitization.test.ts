/**
 * Tests for input sanitization utilities
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  sanitizeOptionalString,
  validateSessionId,
  sanitizeNumber,
  sanitizeStringArray,
  sanitizeThoughtContent,
  sanitizeTitle,
  sanitizeDomain,
  sanitizeAuthor,
  MAX_LENGTHS,
} from '../../src/utils/sanitization.js';

describe('Sanitization Utilities', () => {
  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should reject empty strings', () => {
      expect(() => sanitizeString('')).toThrow('cannot be empty');
      expect(() => sanitizeString('   ')).toThrow('cannot be empty');
    });

    it('should reject strings exceeding max length', () => {
      const longString = 'a'.repeat(1001);
      expect(() => sanitizeString(longString)).toThrow('exceeds maximum length');
    });

    it('should reject strings with null bytes', () => {
      expect(() => sanitizeString('hello\0world')).toThrow('invalid null bytes');
    });

    it('should accept valid strings', () => {
      expect(sanitizeString('valid string')).toBe('valid string');
    });
  });

  describe('sanitizeOptionalString', () => {
    it('should return undefined for empty inputs', () => {
      expect(sanitizeOptionalString(undefined)).toBeUndefined();
      expect(sanitizeOptionalString('')).toBeUndefined();
    });

    it('should sanitize non-empty strings', () => {
      expect(sanitizeOptionalString('  test  ')).toBe('test');
    });
  });

  describe('validateSessionId', () => {
    it('should accept valid UUID v4', () => {
      const validId = '550e8400-e29b-41d4-a716-446655440000';
      expect(validateSessionId(validId)).toBe(validId);
    });

    it('should reject invalid UUIDs', () => {
      expect(() => validateSessionId('invalid-id')).toThrow('Invalid session ID format');
      expect(() => validateSessionId('12345678-1234-1234-1234-123456789012')).toThrow('Invalid session ID format');
    });
  });

  describe('sanitizeNumber', () => {
    it('should accept valid numbers', () => {
      expect(sanitizeNumber(42)).toBe(42);
      expect(sanitizeNumber(3.14)).toBe(3.14);
    });

    it('should reject NaN', () => {
      expect(() => sanitizeNumber(NaN)).toThrow('must be a valid number');
    });

    it('should reject Infinity', () => {
      expect(() => sanitizeNumber(Infinity)).toThrow('must be a finite number');
      expect(() => sanitizeNumber(-Infinity)).toThrow('must be a finite number');
    });

    it('should enforce min/max bounds', () => {
      expect(() => sanitizeNumber(5, 0, 10)).not.toThrow();
      expect(() => sanitizeNumber(15, 0, 10)).toThrow('must be between');
      expect(() => sanitizeNumber(-5, 0, 10)).toThrow('must be between');
    });
  });

  describe('sanitizeStringArray', () => {
    it('should sanitize all elements', () => {
      const input = ['  a  ', '  b  ', '  c  '];
      const expected = ['a', 'b', 'c'];
      expect(sanitizeStringArray(input)).toEqual(expected);
    });

    it('should reject non-arrays', () => {
      expect(() => sanitizeStringArray('not an array' as any)).toThrow('must be an array');
    });

    it('should reject arrays exceeding max items', () => {
      const largeArray = Array(1001).fill('item');
      expect(() => sanitizeStringArray(largeArray)).toThrow('exceeds maximum');
    });
  });

  describe('sanitizeThoughtContent', () => {
    it('should accept large thought content', () => {
      const largeContent = 'a'.repeat(50000);
      expect(sanitizeThoughtContent(largeContent)).toBe(largeContent);
    });

    it('should reject excessive content', () => {
      const tooLarge = 'a'.repeat(MAX_LENGTHS.THOUGHT_CONTENT + 1);
      expect(() => sanitizeThoughtContent(tooLarge)).toThrow('exceeds maximum length');
    });
  });

  describe('sanitizeTitle', () => {
    it('should return default for undefined', () => {
      expect(sanitizeTitle(undefined)).toBe('Untitled Session');
    });

    it('should sanitize provided titles', () => {
      expect(sanitizeTitle('  My Session  ')).toBe('My Session');
    });

    it('should reject titles exceeding max length', () => {
      const longTitle = 'a'.repeat(MAX_LENGTHS.TITLE + 1);
      expect(() => sanitizeTitle(longTitle)).toThrow('exceeds maximum length');
    });
  });

  describe('sanitizeDomain', () => {
    it('should return undefined for empty input', () => {
      expect(sanitizeDomain(undefined)).toBeUndefined();
      expect(sanitizeDomain('')).toBeUndefined();
    });

    it('should sanitize valid domains', () => {
      expect(sanitizeDomain('  mathematics  ')).toBe('mathematics');
    });
  });

  describe('sanitizeAuthor', () => {
    it('should return undefined for empty input', () => {
      expect(sanitizeAuthor(undefined)).toBeUndefined();
    });

    it('should sanitize valid authors', () => {
      expect(sanitizeAuthor('  John Doe  ')).toBe('John Doe');
    });

    it('should reject author names exceeding max length', () => {
      const longAuthor = 'a'.repeat(MAX_LENGTHS.AUTHOR + 1);
      expect(() => sanitizeAuthor(longAuthor)).toThrow('exceeds maximum length');
    });
  });
});
