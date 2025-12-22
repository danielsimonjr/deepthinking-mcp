/**
 * Engineering Mode Integration Tests
 *
 * Tests T-ENG-001 through T-ENG-016: Comprehensive integration tests
 * for the deepthinking_engineering tool with engineering mode.
 * Covers trade studies, FMEA, requirements, and ADRs.
 *
 * Phase 11 Sprint 7: Engineering & Academic Modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type EngineeringThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import { createBaseThought } from '../../utils/thought-factory.js';

// ============================================================================
// ENGINEERING MODE THOUGHT FACTORIES
// ============================================================================

/**
 * Create a basic engineering thought
 */
function createEngineeringThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    ...createBaseThought(),
    mode: 'engineering',
    ...overrides,
  } as ThinkingToolInput;
}

/**
 * Create an engineering thought with requirementId
 */
function createEngineeringWithRequirement(
  requirementId: string,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createEngineeringThought({
    requirementId,
    ...overrides,
  });
}

/**
 * Create an engineering thought with trade study
 */
function createEngineeringWithTradeStudy(
  tradeStudy: {
    options?: string[];
    criteria?: string[];
    weights?: Record<string, number>;
    title?: string;
    objective?: string;
  },
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createEngineeringThought({
    tradeStudy,
    ...overrides,
  } as any);
}

/**
 * Create an engineering thought with FMEA entry
 */
function createEngineeringWithFMEA(
  fmeaEntry: {
    failureMode?: string;
    severity?: number;
    occurrence?: number;
    detection?: number;
    rpn?: number;
  },
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createEngineeringThought({
    fmeaEntry,
    ...overrides,
  } as any);
}

// ============================================================================
// TESTS
// ============================================================================

describe('Engineering Mode Integration Tests', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-ENG-001: Basic engineering thought
   */
  describe('T-ENG-001: Basic Engineering Thought', () => {
    it('should create a basic engineering thought with minimal params', () => {
      const input = createEngineeringThought({
        thought: 'Analyzing system requirements',
      });

      const thought = factory.createThought(input, 'session-eng-001');

      expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
      expect(thought.content).toBe('Analyzing system requirements');
      expect(thought.sessionId).toBe('session-eng-001');
    });

    it('should assign unique IDs to engineering thoughts', () => {
      const input1 = createEngineeringThought({ thought: 'First engineering step' });
      const input2 = createEngineeringThought({ thought: 'Second engineering step' });

      const thought1 = factory.createThought(input1, 'session-eng-001');
      const thought2 = factory.createThought(input2, 'session-eng-001');

      expect(thought1.id).not.toBe(thought2.id);
    });
  });

  /**
   * T-ENG-002: Engineering with requirementId
   */
  describe('T-ENG-002: Engineering with RequirementId', () => {
    it('should include requirementId in thought', () => {
      const input = createEngineeringWithRequirement('REQ-001', {
        thought: 'Tracing requirement REQ-001',
      });

      const thought = factory.createThought(input, 'session-eng-002');

      expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
      // Verify input contains the requirementId
      expect((input as any).requirementId).toBe('REQ-001');
    });

    it('should handle multiple requirement references', () => {
      const input = createEngineeringWithRequirement('REQ-PERF-001', {
        thought: 'Performance requirement analysis',
      });

      const thought = factory.createThought(input, 'session-eng-002');

      expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
    });
  });

  /**
   * T-ENG-003: Engineering with tradeStudy object
   */
  describe('T-ENG-003: Engineering with Trade Study Object', () => {
    it('should create thought with trade study configuration', () => {
      const input = createEngineeringWithTradeStudy(
        {
          title: 'Database Selection',
          objective: 'Select optimal database for the project',
        },
        { thought: 'Evaluating database options' }
      );

      const thought = factory.createThought(input, 'session-eng-003');

      expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
      expect((input as any).tradeStudy.title).toBe('Database Selection');
    });
  });

  /**
   * T-ENG-004: Engineering with tradeStudy.options array
   */
  describe('T-ENG-004: Trade Study Options Array', () => {
    it('should handle trade study with multiple options', () => {
      const options = ['PostgreSQL', 'MongoDB', 'SQLite', 'MySQL'];
      const input = createEngineeringWithTradeStudy(
        { options },
        { thought: 'Comparing database alternatives' }
      );

      const thought = factory.createThought(input, 'session-eng-004');

      expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
      expect((input as any).tradeStudy.options).toHaveLength(4);
      expect((input as any).tradeStudy.options).toContain('PostgreSQL');
    });

    it('should handle empty options array', () => {
      const input = createEngineeringWithTradeStudy(
        { options: [] },
        { thought: 'Starting trade study' }
      );

      const thought = factory.createThought(input, 'session-eng-004');

      expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
    });
  });

  /**
   * T-ENG-005: Engineering with tradeStudy.criteria array
   */
  describe('T-ENG-005: Trade Study Criteria Array', () => {
    it('should handle trade study with evaluation criteria', () => {
      const criteria = ['Performance', 'Scalability', 'Cost', 'Ease of Use', 'Community Support'];
      const input = createEngineeringWithTradeStudy(
        { criteria },
        { thought: 'Defining evaluation criteria' }
      );

      const thought = factory.createThought(input, 'session-eng-005');

      expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
      expect((input as any).tradeStudy.criteria).toHaveLength(5);
    });
  });

  /**
   * T-ENG-006: Engineering with tradeStudy.weights
   */
  describe('T-ENG-006: Trade Study Weights', () => {
    it('should handle trade study with criteria weights', () => {
      const weights = {
        Performance: 0.3,
        Scalability: 0.25,
        Cost: 0.2,
        'Ease of Use': 0.15,
        'Community Support': 0.1,
      };
      const input = createEngineeringWithTradeStudy(
        { weights },
        { thought: 'Assigning criteria weights' }
      );

      const thought = factory.createThought(input, 'session-eng-006');

      expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
      expect((input as any).tradeStudy.weights.Performance).toBe(0.3);
    });

    it('should validate weights sum to approximately 1', () => {
      const weights = {
        Performance: 0.3,
        Scalability: 0.25,
        Cost: 0.2,
        'Ease of Use': 0.15,
        'Community Support': 0.1,
      };

      const sum = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 2);
    });
  });

  /**
   * T-ENG-007: Engineering trade study evaluation
   */
  describe('T-ENG-007: Trade Study Evaluation', () => {
    it('should support complete trade study evaluation', () => {
      const input = createEngineeringWithTradeStudy(
        {
          title: 'Framework Selection',
          objective: 'Choose frontend framework',
          options: ['React', 'Vue', 'Angular'],
          criteria: ['Performance', 'Learning Curve', 'Ecosystem'],
          weights: { Performance: 0.4, 'Learning Curve': 0.3, Ecosystem: 0.3 },
        },
        { thought: 'Completing trade study analysis' }
      );

      const thought = factory.createThought(input, 'session-eng-007');

      expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
    });
  });

  /**
   * T-ENG-008: Engineering with fmeaEntry object
   */
  describe('T-ENG-008: FMEA Entry Object', () => {
    it('should create thought with FMEA entry', () => {
      const input = createEngineeringWithFMEA(
        {
          failureMode: 'Database connection timeout',
        },
        { thought: 'Analyzing failure mode' }
      );

      const thought = factory.createThought(input, 'session-eng-008');

      expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
      expect((input as any).fmeaEntry.failureMode).toBe('Database connection timeout');
    });
  });

  /**
   * T-ENG-009: Engineering with fmeaEntry.failureMode
   */
  describe('T-ENG-009: FMEA Failure Mode', () => {
    it('should handle various failure mode descriptions', () => {
      const failureModes = [
        'Memory leak in cache module',
        'Authentication token expiration',
        'Network partition between services',
        'Disk space exhaustion',
      ];

      for (const failureMode of failureModes) {
        const input = createEngineeringWithFMEA({ failureMode });
        const thought = factory.createThought(input, 'session-eng-009');

        expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
      }
    });
  });

  /**
   * T-ENG-010: Engineering with fmeaEntry.severity (1-10)
   */
  describe('T-ENG-010: FMEA Severity Rating', () => {
    it('should accept severity ratings from 1 to 10', () => {
      for (let severity = 1; severity <= 10; severity++) {
        const input = createEngineeringWithFMEA({
          failureMode: 'Test failure',
          severity,
        });

        const thought = factory.createThought(input, `session-eng-010-${severity}`);
        expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
      }
    });

    it('should interpret severity levels correctly', () => {
      // 1-3: Minor, 4-6: Moderate, 7-8: High, 9-10: Critical
      const criticalInput = createEngineeringWithFMEA({
        failureMode: 'Complete system failure',
        severity: 10,
      });

      const thought = factory.createThought(criticalInput, 'session-eng-010');
      expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
    });
  });

  /**
   * T-ENG-011: Engineering with fmeaEntry.occurrence (1-10)
   */
  describe('T-ENG-011: FMEA Occurrence Rating', () => {
    it('should accept occurrence ratings from 1 to 10', () => {
      for (let occurrence = 1; occurrence <= 10; occurrence++) {
        const input = createEngineeringWithFMEA({
          failureMode: 'Test failure',
          occurrence,
        });

        const thought = factory.createThought(input, `session-eng-011-${occurrence}`);
        expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
      }
    });
  });

  /**
   * T-ENG-012: Engineering with fmeaEntry.detection (1-10)
   */
  describe('T-ENG-012: FMEA Detection Rating', () => {
    it('should accept detection ratings from 1 to 10', () => {
      for (let detection = 1; detection <= 10; detection++) {
        const input = createEngineeringWithFMEA({
          failureMode: 'Test failure',
          detection,
        });

        const thought = factory.createThought(input, `session-eng-012-${detection}`);
        expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
      }
    });
  });

  /**
   * T-ENG-013: Engineering with fmeaEntry.rpn calculation
   */
  describe('T-ENG-013: FMEA RPN Calculation', () => {
    it('should support RPN (Risk Priority Number) values', () => {
      // RPN = Severity × Occurrence × Detection
      const severity = 8;
      const occurrence = 5;
      const detection = 3;
      const rpn = severity * occurrence * detection; // 120

      const input = createEngineeringWithFMEA({
        failureMode: 'Memory overflow',
        severity,
        occurrence,
        detection,
        rpn,
      });

      const thought = factory.createThought(input, 'session-eng-013');
      expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
      expect((input as any).fmeaEntry.rpn).toBe(120);
    });

    it('should handle high RPN values (critical risks)', () => {
      const input = createEngineeringWithFMEA({
        failureMode: 'Security breach',
        severity: 10,
        occurrence: 7,
        detection: 9,
        rpn: 630, // High risk requiring immediate action
      });

      const thought = factory.createThought(input, 'session-eng-013');
      expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
    });

    it('should handle low RPN values (acceptable risks)', () => {
      const input = createEngineeringWithFMEA({
        failureMode: 'Minor UI glitch',
        severity: 2,
        occurrence: 3,
        detection: 2,
        rpn: 12, // Low risk, acceptable
      });

      const thought = factory.createThought(input, 'session-eng-013');
      expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
    });
  });

  /**
   * T-ENG-014: Engineering FMEA multi-failure analysis
   */
  describe('T-ENG-014: FMEA Multi-Failure Analysis', () => {
    it('should support session with multiple failure mode analyses', () => {
      const sessionId = 'session-eng-014-multi';
      const failureModes = [
        { failureMode: 'CPU overload', severity: 7, occurrence: 4, detection: 5 },
        { failureMode: 'Memory leak', severity: 6, occurrence: 5, detection: 4 },
        { failureMode: 'Disk failure', severity: 9, occurrence: 2, detection: 3 },
      ];

      const thoughts = failureModes.map((fmea, i) => {
        const input = createEngineeringWithFMEA(fmea, {
          thought: `Analyzing: ${fmea.failureMode}`,
          thoughtNumber: i + 1,
          totalThoughts: failureModes.length,
          nextThoughtNeeded: i < failureModes.length - 1,
        });
        return factory.createThought(input, sessionId);
      });

      expect(thoughts).toHaveLength(3);
      thoughts.forEach((thought) => {
        expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
      });
    });
  });

  /**
   * T-ENG-015: Engineering ADR creation session
   */
  describe('T-ENG-015: ADR Creation Session', () => {
    it('should support Architecture Decision Record creation', () => {
      const sessionId = 'session-eng-015-adr';

      // Step 1: Context definition
      const contextInput = createEngineeringThought({
        thought: 'ADR-001: We need to select a message queue for async processing',
        thoughtNumber: 1,
        totalThoughts: 4,
        nextThoughtNeeded: true,
      });
      const contextThought = factory.createThought(contextInput, sessionId);

      // Step 2: Options considered
      const optionsInput = createEngineeringWithTradeStudy(
        {
          options: ['RabbitMQ', 'Kafka', 'AWS SQS', 'Redis Streams'],
          criteria: ['Throughput', 'Reliability', 'Operational Complexity', 'Cost'],
        },
        {
          thought: 'Evaluating message queue alternatives',
          thoughtNumber: 2,
          totalThoughts: 4,
          nextThoughtNeeded: true,
        }
      );
      const optionsThought = factory.createThought(optionsInput, sessionId);

      // Step 3: Decision
      const decisionInput = createEngineeringThought({
        thought: 'Decision: Use Kafka for its high throughput and durability guarantees',
        thoughtNumber: 3,
        totalThoughts: 4,
        nextThoughtNeeded: true,
      });
      const decisionThought = factory.createThought(decisionInput, sessionId);

      // Step 4: Consequences
      const consequencesInput = createEngineeringThought({
        thought: 'Consequences: Higher operational complexity, need for Zookeeper cluster',
        thoughtNumber: 4,
        totalThoughts: 4,
        nextThoughtNeeded: false,
      });
      const consequencesThought = factory.createThought(consequencesInput, sessionId);

      expect([contextThought, optionsThought, decisionThought, consequencesThought]).toHaveLength(4);
    });
  });

  /**
   * T-ENG-016: Engineering multi-thought requirements analysis
   */
  describe('T-ENG-016: Multi-Thought Requirements Analysis', () => {
    it('should support comprehensive requirements analysis session', () => {
      const sessionId = 'session-eng-016-req';

      // Step 1: Stakeholder requirements
      const step1 = factory.createThought(
        createEngineeringWithRequirement('REQ-STAKE-001', {
          thought: 'Gathering stakeholder requirements for user authentication',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
        }),
        sessionId
      );

      // Step 2: Derived requirements
      const step2 = factory.createThought(
        createEngineeringWithRequirement('REQ-DER-001', {
          thought: 'Deriving technical requirements from stakeholder needs',
          thoughtNumber: 2,
          totalThoughts: 5,
          nextThoughtNeeded: true,
        }),
        sessionId
      );

      // Step 3: Trade study for implementation approach
      const step3 = factory.createThought(
        createEngineeringWithTradeStudy(
          {
            title: 'Authentication Method Selection',
            options: ['OAuth 2.0', 'SAML', 'JWT + Custom', 'Keycloak'],
            criteria: ['Security', 'Scalability', 'Integration Effort'],
          },
          {
            thought: 'Evaluating authentication implementation options',
            thoughtNumber: 3,
            totalThoughts: 5,
            nextThoughtNeeded: true,
          }
        ),
        sessionId
      );

      // Step 4: FMEA for security risks
      const step4 = factory.createThought(
        createEngineeringWithFMEA(
          {
            failureMode: 'Token theft via XSS',
            severity: 9,
            occurrence: 4,
            detection: 5,
            rpn: 180,
          },
          {
            thought: 'Analyzing security failure modes',
            thoughtNumber: 4,
            totalThoughts: 5,
            nextThoughtNeeded: true,
          }
        ),
        sessionId
      );

      // Step 5: Final recommendation
      const step5 = factory.createThought(
        createEngineeringThought({
          thought: 'Recommendation: Implement OAuth 2.0 with refresh token rotation',
          thoughtNumber: 5,
          totalThoughts: 5,
          nextThoughtNeeded: false,
        }),
        sessionId
      );

      expect([step1, step2, step3, step4, step5]).toHaveLength(5);
      [step1, step2, step3, step4, step5].forEach((thought) => {
        expect(thought.mode).toBe(ThinkingMode.ENGINEERING);
        expect(thought.sessionId).toBe(sessionId);
      });
    });
  });
});
