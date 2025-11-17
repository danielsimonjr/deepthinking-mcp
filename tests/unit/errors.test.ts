/**
 * Tests for custom error classes
 */

import { describe, it, expect } from 'vitest';
import {
  DeepThinkingError,
  SessionError,
  SessionNotFoundError,
  ValidationError,
  InputValidationError,
  InvalidModeError,
  ResourceLimitError,
  ErrorFactory,
} from '../../src/utils/errors.js';

describe('Error Classes', () => {
  describe('DeepThinkingError', () => {
    it('should create error with message and code', () => {
      const error = new DeepThinkingError('Test error', 'TEST_ERROR');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('DeepThinkingError');
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should include context', () => {
      const context = { userId: '123', action: 'test' };
      const error = new DeepThinkingError('Test error', 'TEST_ERROR', context);

      expect(error.context).toEqual(context);
    });

    it('should serialize to JSON', () => {
      const error = new DeepThinkingError('Test error', 'TEST_ERROR', { key: 'value' });
      const json = error.toJSON();

      expect(json.name).toBe('DeepThinkingError');
      expect(json.message).toBe('Test error');
      expect(json.code).toBe('TEST_ERROR');
      expect(json.context).toEqual({ key: 'value' });
      expect(json.timestamp).toBeDefined();
    });
  });

  describe('SessionNotFoundError', () => {
    it('should create session not found error', () => {
      const error = new SessionNotFoundError('session-123');

      expect(error.message).toContain('session-123');
      expect(error.code).toBe('SESSION_NOT_FOUND');
      expect(error.context).toEqual({ sessionId: 'session-123' });
    });
  });

  describe('InputValidationError', () => {
    it('should create input validation error', () => {
      const error = new InputValidationError('username', 'must be alphanumeric', 'user@123');

      expect(error.message).toContain('username');
      expect(error.message).toContain('must be alphanumeric');
      expect(error.code).toBe('INPUT_VALIDATION_ERROR');
      expect(error.context?.fieldName).toBe('username');
      expect(error.context?.reason).toBe('must be alphanumeric');
    });

    it('should handle object values', () => {
      const error = new InputValidationError('config', 'invalid format', { invalid: true });

      expect(error.context?.value).toBe('[object]');
    });
  });

  describe('InvalidModeError', () => {
    it('should create invalid mode error', () => {
      const validModes = ['sequential', 'hybrid', 'mathematics'];
      const error = new InvalidModeError('invalid-mode', validModes);

      expect(error.message).toContain('invalid-mode');
      expect(error.code).toBe('INVALID_MODE');
      expect(error.context?.validModes).toEqual(validModes);
    });
  });

  describe('ResourceLimitError', () => {
    it('should create resource limit error', () => {
      const error = new ResourceLimitError('thoughts', 1000, 1500);

      expect(error.message).toContain('thoughts');
      expect(error.message).toContain('1500');
      expect(error.message).toContain('1000');
      expect(error.code).toBe('RESOURCE_LIMIT_EXCEEDED');
      expect(error.context?.resource).toBe('thoughts');
      expect(error.context?.limit).toBe(1000);
      expect(error.context?.actual).toBe(1500);
    });
  });

  describe('ErrorFactory', () => {
    it('should create session not found error', () => {
      const error = ErrorFactory.sessionNotFound('test-id');

      expect(error).toBeInstanceOf(SessionNotFoundError);
      expect(error.message).toContain('test-id');
    });

    it('should create invalid input error', () => {
      const error = ErrorFactory.invalidInput('email', 'invalid format');

      expect(error).toBeInstanceOf(InputValidationError);
      expect(error.message).toContain('email');
    });

    it('should create invalid mode error', () => {
      const error = ErrorFactory.invalidMode('bad', ['good1', 'good2']);

      expect(error).toBeInstanceOf(InvalidModeError);
      expect(error.message).toContain('bad');
    });

    it('should create resource limit error', () => {
      const error = ErrorFactory.resourceLimit('memory', 1024, 2048);

      expect(error).toBeInstanceOf(ResourceLimitError);
      expect(error.message).toContain('memory');
    });

    it('should create export error', () => {
      const error = ErrorFactory.exportFailed('pdf', 'conversion failed');

      expect(error.message).toContain('conversion failed');
      expect(error.context?.format).toBe('pdf');
    });
  });
});
