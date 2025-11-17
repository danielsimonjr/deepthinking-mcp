/**
 * Tests for logger utility
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Logger, LogLevel, createLogger } from '../../src/utils/logger.js';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = createLogger({ enableConsole: false }); // Disable console output in tests
  });

  describe('Logging Levels', () => {
    it('should log debug messages', () => {
      logger.debug('Debug message', { key: 'value' });

      const logs = logger.getLogs();
      expect(logs).toHaveLength(0); // Default min level is INFO, so DEBUG is filtered
    });

    it('should log info messages', () => {
      logger.info('Info message', { key: 'value' });

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.INFO);
      expect(logs[0].message).toBe('Info message');
      expect(logs[0].context).toEqual({ key: 'value' });
    });

    it('should log warning messages', () => {
      logger.warn('Warning message');

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.WARN);
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error, { userId: '123' });

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].error).toBe(error);
      expect(logs[0].context).toEqual({ userId: '123' });
    });
  });

  describe('Log Level Filtering', () => {
    it('should respect minimum log level', () => {
      logger.setLevel(LogLevel.WARN);

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      const logs = logger.getLogs();
      expect(logs).toHaveLength(2); // Only WARN and ERROR
      expect(logs[0].level).toBe(LogLevel.WARN);
      expect(logs[1].level).toBe(LogLevel.ERROR);
    });

    it('should filter logs by minimum level', () => {
      logger.setLevel(LogLevel.DEBUG); // Allow all

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      const errorLogs = logger.getLogs(LogLevel.ERROR);
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].message).toBe('Error');
    });
  });

  describe('Log Management', () => {
    it('should clear logs', () => {
      logger.info('Message 1');
      logger.info('Message 2');

      expect(logger.getLogs()).toHaveLength(2);

      logger.clearLogs();

      expect(logger.getLogs()).toHaveLength(0);
    });

    it('should export logs as JSON', () => {
      logger.info('Test message');

      const json = logger.exportLogs();
      const parsed = JSON.parse(json);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].message).toBe('Test message');
      expect(parsed[0].level).toBe('INFO');
      expect(parsed[0].timestamp).toBeDefined();
    });
  });

  describe('Logger Configuration', () => {
    it('should use custom configuration', () => {
      const customLogger = createLogger({
        minLevel: LogLevel.DEBUG,
        enableConsole: false,
        prettyPrint: false,
      });

      customLogger.debug('Debug message');

      const logs = customLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.DEBUG);
    });

    it('should create logger with SILENT level', () => {
      const silentLogger = createLogger({ minLevel: LogLevel.SILENT });

      silentLogger.debug('Debug');
      silentLogger.info('Info');
      silentLogger.warn('Warn');
      silentLogger.error('Error');

      expect(silentLogger.getLogs()).toHaveLength(0);
    });
  });

  describe('Timestamps', () => {
    it('should add timestamps to log entries', () => {
      logger.info('Test');

      const logs = logger.getLogs();
      expect(logs[0].timestamp).toBeInstanceOf(Date);
      expect(logs[0].timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });
});
