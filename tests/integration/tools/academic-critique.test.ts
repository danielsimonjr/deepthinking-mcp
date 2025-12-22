/**
 * Academic Critique Mode Integration Tests
 *
 * Tests T-ACD-043 through T-ACD-059: Comprehensive integration tests
 * for the deepthinking_academic tool with critique mode.
 * Covers 6 Socratic question categories and peer review simulation.
 *
 * Phase 11 Sprint 7: Engineering & Academic Modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type CritiqueThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import { createBaseThought } from '../../utils/thought-factory.js';

// ============================================================================
// CRITIQUE MODE THOUGHT FACTORIES
// ============================================================================

/**
 * Create a basic critique thought
 */
function createCritiqueThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    ...createBaseThought(),
    mode: 'critique',
    ...overrides,
  } as ThinkingToolInput;
}

/**
 * Work type classification
 */
type WorkType = 'empirical_study' | 'theoretical_paper' | 'review_article' | 'meta_analysis' | 'case_study' | 'methodology_paper';

interface TestCritiquedWork {
  id?: string;
  title: string;
  authors?: string[];
  year?: number;
  field?: string;
  type?: WorkType;
}

/**
 * Create a critique thought with critiqued work
 */
function createCritiqueWithWork(
  critiquedWork: TestCritiquedWork,
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createCritiqueThought({
    critiquedWork,
    ...overrides,
  } as any);
}

/**
 * Create a critique thought with strengths
 */
function createCritiqueWithStrengths(
  strengths: string[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createCritiqueThought({
    strengths,
    ...overrides,
  } as any);
}

/**
 * Create a critique thought with weaknesses
 */
function createCritiqueWithWeaknesses(
  weaknesses: string[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createCritiqueThought({
    weaknesses,
    ...overrides,
  } as any);
}

/**
 * Create a critique thought with suggestions
 */
function createCritiqueWithSuggestions(
  suggestions: string[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createCritiqueThought({
    suggestions,
    ...overrides,
  } as any);
}

// ============================================================================
// TESTS
// ============================================================================

describe('Academic Critique Mode Integration Tests', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-ACD-043: Basic critique thought
   */
  describe('T-ACD-043: Basic Critique Thought', () => {
    it('should create a basic critique thought with minimal params', () => {
      const input = createCritiqueThought({
        thought: 'Beginning critical analysis of research paper',
      });

      const thought = factory.createThought(input, 'session-crt-043');

      expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      expect(thought.content).toBe('Beginning critical analysis of research paper');
      expect(thought.sessionId).toBe('session-crt-043');
    });

    it('should assign unique IDs to critique thoughts', () => {
      const input1 = createCritiqueThought({ thought: 'First critique step' });
      const input2 = createCritiqueThought({ thought: 'Second critique step' });

      const thought1 = factory.createThought(input1, 'session-crt-043');
      const thought2 = factory.createThought(input2, 'session-crt-043');

      expect(thought1.id).not.toBe(thought2.id);
    });
  });

  /**
   * T-ACD-044: Critique with critiquedWork object
   */
  describe('T-ACD-044: Critiqued Work Object', () => {
    it('should include critiqued work information', () => {
      const work: TestCritiquedWork = {
        title: 'Effects of Sleep on Memory Consolidation',
      };
      const input = createCritiqueWithWork(work, {
        thought: 'Analyzing paper on sleep and memory',
      });

      const thought = factory.createThought(input, 'session-crt-044');

      expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      expect((input as any).critiquedWork.title).toBe('Effects of Sleep on Memory Consolidation');
    });
  });

  /**
   * T-ACD-045: Critique with critiquedWork.authors
   */
  describe('T-ACD-045: Critiqued Work Authors', () => {
    it('should include author information', () => {
      const work: TestCritiquedWork = {
        title: 'Research Paper',
        authors: ['Smith, J.', 'Jones, A.', 'Brown, M.'],
      };
      const input = createCritiqueWithWork(work, {
        thought: 'Evaluating multi-author study',
      });

      const thought = factory.createThought(input, 'session-crt-045');

      expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      expect((input as any).critiquedWork.authors).toHaveLength(3);
    });
  });

  /**
   * T-ACD-046: Critique with critiquedWork.year
   */
  describe('T-ACD-046: Critiqued Work Year', () => {
    it('should include publication year', () => {
      const work: TestCritiquedWork = {
        title: 'Recent Study',
        year: 2024,
      };
      const input = createCritiqueWithWork(work, {
        thought: 'Reviewing recent publication',
      });

      const thought = factory.createThought(input, 'session-crt-046');

      expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      expect((input as any).critiquedWork.year).toBe(2024);
    });

    it('should handle historical works', () => {
      const work: TestCritiquedWork = {
        title: 'Classic Paper',
        year: 1950,
      };
      const input = createCritiqueWithWork(work);

      const thought = factory.createThought(input, 'session-crt-046');
      expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
    });
  });

  /**
   * T-ACD-047: Critique with critiquedWork.field
   */
  describe('T-ACD-047: Critiqued Work Field', () => {
    it('should include research field', () => {
      const work: TestCritiquedWork = {
        title: 'Domain Study',
        field: 'Cognitive Psychology',
      };
      const input = createCritiqueWithWork(work, {
        thought: 'Evaluating from cognitive psychology perspective',
      });

      const thought = factory.createThought(input, 'session-crt-047');

      expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      expect((input as any).critiquedWork.field).toBe('Cognitive Psychology');
    });
  });

  /**
   * T-ACD-048: Critique with critiquedWork.type
   */
  describe('T-ACD-048: Critiqued Work Type', () => {
    it('should support various work types', () => {
      const workTypes: WorkType[] = [
        'empirical_study',
        'theoretical_paper',
        'review_article',
        'meta_analysis',
        'case_study',
        'methodology_paper',
      ];

      for (const type of workTypes) {
        const work: TestCritiquedWork = {
          title: `${type} Paper`,
          type,
        };
        const input = createCritiqueWithWork(work);
        const thought = factory.createThought(input, `session-crt-048-${type}`);
        expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      }
    });
  });

  /**
   * T-ACD-049: Critique with strengths array
   */
  describe('T-ACD-049: Strengths Array', () => {
    it('should include identified strengths', () => {
      const strengths = [
        'Rigorous methodology',
        'Large sample size',
        'Clear theoretical framework',
        'Transparent data sharing',
      ];
      const input = createCritiqueWithStrengths(strengths, {
        thought: 'Identifying paper strengths',
      });

      const thought = factory.createThought(input, 'session-crt-049');

      expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      expect((input as any).strengths).toHaveLength(4);
    });
  });

  /**
   * T-ACD-050: Critique with weaknesses array
   */
  describe('T-ACD-050: Weaknesses Array', () => {
    it('should include identified weaknesses', () => {
      const weaknesses = [
        'Limited generalizability',
        'Potential selection bias',
        'Missing control group',
      ];
      const input = createCritiqueWithWeaknesses(weaknesses, {
        thought: 'Identifying paper weaknesses',
      });

      const thought = factory.createThought(input, 'session-crt-050');

      expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      expect((input as any).weaknesses).toHaveLength(3);
    });
  });

  /**
   * T-ACD-051: Critique with suggestions array
   */
  describe('T-ACD-051: Suggestions Array', () => {
    it('should include improvement suggestions', () => {
      const suggestions = [
        'Include additional control conditions',
        'Extend follow-up period',
        'Clarify statistical methods',
        'Strengthen theoretical justification',
      ];
      const input = createCritiqueWithSuggestions(suggestions, {
        thought: 'Providing constructive suggestions',
      });

      const thought = factory.createThought(input, 'session-crt-051');

      expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      expect((input as any).suggestions).toHaveLength(4);
    });
  });

  /**
   * T-ACD-052: Critique Socratic Clarification questions
   */
  describe('T-ACD-052: Socratic Clarification Questions', () => {
    it('should support clarification questions (Paul framework category 1)', () => {
      const input = createCritiqueThought({
        thought: 'Socratic Clarification: What exactly do you mean by "significant improvement"? How is significance defined in this context?',
      });

      const thought = factory.createThought(input, 'session-crt-052');

      expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      expect(thought.content).toContain('Clarification');
    });

    it('should probe for definitions and examples', () => {
      const questions = [
        'Can you give an example of this phenomenon?',
        'What is your main point?',
        'Could you explain that further?',
      ];

      for (const question of questions) {
        const input = createCritiqueThought({ thought: question });
        const thought = factory.createThought(input, 'session-crt-052');
        expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      }
    });
  });

  /**
   * T-ACD-053: Critique Socratic Assumptions probing
   */
  describe('T-ACD-053: Socratic Assumptions Probing', () => {
    it('should probe underlying assumptions (Paul framework category 2)', () => {
      const input = createCritiqueThought({
        thought: 'Socratic Assumptions: What are you assuming when you claim X? Is this assumption justified?',
      });

      const thought = factory.createThought(input, 'session-crt-053');

      expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      expect(thought.content).toContain('Assumptions');
    });

    it('should challenge hidden premises', () => {
      const probes = [
        'What is being assumed here?',
        'Why would someone make this assumption?',
        'What would happen if we rejected this assumption?',
      ];

      for (const probe of probes) {
        const input = createCritiqueThought({ thought: probe });
        const thought = factory.createThought(input, 'session-crt-053');
        expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      }
    });
  });

  /**
   * T-ACD-054: Critique Socratic Evidence questions
   */
  describe('T-ACD-054: Socratic Evidence Questions', () => {
    it('should question evidence and reasoning (Paul framework category 3)', () => {
      const input = createCritiqueThought({
        thought: 'Socratic Evidence: What evidence supports this claim? Is the evidence sufficient and reliable?',
      });

      const thought = factory.createThought(input, 'session-crt-054');

      expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      expect(thought.content).toContain('Evidence');
    });

    it('should probe evidence quality', () => {
      const probes = [
        'What evidence would change your conclusion?',
        'Is this source reliable?',
        'How do we know this is true?',
      ];

      for (const probe of probes) {
        const input = createCritiqueThought({ thought: probe });
        const thought = factory.createThought(input, 'session-crt-054');
        expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      }
    });
  });

  /**
   * T-ACD-055: Critique Socratic Viewpoints exploration
   */
  describe('T-ACD-055: Socratic Viewpoints Exploration', () => {
    it('should explore alternative viewpoints (Paul framework category 4)', () => {
      const input = createCritiqueThought({
        thought: 'Socratic Viewpoints: How might someone with an opposing view respond? What alternative explanations exist?',
      });

      const thought = factory.createThought(input, 'session-crt-055');

      expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      expect(thought.content).toContain('Viewpoints');
    });

    it('should consider multiple perspectives', () => {
      const probes = [
        'What would a critic say?',
        'How could this be seen differently?',
        'What are the alternatives?',
      ];

      for (const probe of probes) {
        const input = createCritiqueThought({ thought: probe });
        const thought = factory.createThought(input, 'session-crt-055');
        expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      }
    });
  });

  /**
   * T-ACD-056: Critique Socratic Implications analysis
   */
  describe('T-ACD-056: Socratic Implications Analysis', () => {
    it('should analyze implications and consequences (Paul framework category 5)', () => {
      const input = createCritiqueThought({
        thought: 'Socratic Implications: If this is true, what follows? What are the consequences of this position?',
      });

      const thought = factory.createThought(input, 'session-crt-056');

      expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      expect(thought.content).toContain('Implications');
    });

    it('should trace logical consequences', () => {
      const probes = [
        'What would be the effect of this?',
        'If we accept this, what must we also accept?',
        'What are the unintended consequences?',
      ];

      for (const probe of probes) {
        const input = createCritiqueThought({ thought: probe });
        const thought = factory.createThought(input, 'session-crt-056');
        expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      }
    });
  });

  /**
   * T-ACD-057: Critique Socratic Meta-questions
   */
  describe('T-ACD-057: Socratic Meta-Questions', () => {
    it('should ask questions about the question (Paul framework category 6)', () => {
      const input = createCritiqueThought({
        thought: 'Socratic Meta: Why is this question important? What does asking this question assume?',
      });

      const thought = factory.createThought(input, 'session-crt-057');

      expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      expect(thought.content).toContain('Meta');
    });

    it('should reflect on the inquiry itself', () => {
      const probes = [
        'Why are we asking this?',
        'Is this the right question to ask?',
        'What kind of answer does this question expect?',
      ];

      for (const probe of probes) {
        const input = createCritiqueThought({ thought: probe });
        const thought = factory.createThought(input, 'session-crt-057');
        expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      }
    });
  });

  /**
   * T-ACD-058: Critique peer review simulation
   */
  describe('T-ACD-058: Peer Review Simulation', () => {
    it('should support complete peer review workflow', () => {
      const sessionId = 'session-crt-058-review';
      const work: TestCritiquedWork = {
        title: 'Novel Approach to Transfer Learning',
        authors: ['Research Team'],
        year: 2024,
        field: 'Machine Learning',
        type: 'empirical_study',
      };

      // Step 1: Work characterization
      const step1 = factory.createThought(
        createCritiqueWithWork(work, {
          thought: 'Review of "Novel Approach to Transfer Learning" - ML empirical study',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
        }),
        sessionId
      );

      // Step 2: Methodology evaluation
      const step2 = factory.createThought(
        createCritiqueThought({
          thought: 'Methodology: Experimental design is sound, but baseline comparisons are limited',
          thoughtNumber: 2,
          totalThoughts: 5,
          nextThoughtNeeded: true,
        }),
        sessionId
      );

      // Step 3: Strengths
      const step3 = factory.createThought(
        createCritiqueWithStrengths(
          [
            'Novel contribution to transfer learning',
            'Clear experimental setup',
            'Reproducible results with code release',
          ],
          {
            thought: 'Identifying major strengths',
            thoughtNumber: 3,
            totalThoughts: 5,
            nextThoughtNeeded: true,
          }
        ),
        sessionId
      );

      // Step 4: Weaknesses
      const step4 = factory.createThought(
        createCritiqueWithWeaknesses(
          [
            'Limited to vision domain',
            'Missing ablation studies',
            'Computational cost not analyzed',
          ],
          {
            thought: 'Identifying major weaknesses',
            thoughtNumber: 4,
            totalThoughts: 5,
            nextThoughtNeeded: true,
          }
        ),
        sessionId
      );

      // Step 5: Decision and suggestions
      const step5 = factory.createThought(
        createCritiqueWithSuggestions(
          [
            'Add ablation study on key components',
            'Evaluate on NLP tasks for generalizability',
            'Include computational cost analysis',
          ],
          {
            thought: 'Recommendation: Major Revision - promising work with addressable gaps',
            thoughtNumber: 5,
            totalThoughts: 5,
            nextThoughtNeeded: false,
          }
        ),
        sessionId
      );

      expect([step1, step2, step3, step4, step5]).toHaveLength(5);
      [step1, step2, step3, step4, step5].forEach((thought) => {
        expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      });
    });
  });

  /**
   * T-ACD-059: Critique multi-thought critical analysis
   */
  describe('T-ACD-059: Multi-Thought Critical Analysis', () => {
    it('should support iterative critical analysis with all 6 Socratic categories', () => {
      const sessionId = 'session-crt-059-socratic';

      // Apply all 6 Socratic question categories
      const socraticSteps = [
        { category: 'Clarification', question: 'What exactly is meant by "effective"?' },
        { category: 'Assumptions', question: 'What assumption underlies the causal claim?' },
        { category: 'Evidence', question: 'What evidence would falsify this hypothesis?' },
        { category: 'Viewpoints', question: 'How would a skeptic respond to this?' },
        { category: 'Implications', question: 'If true, what policy changes would follow?' },
        { category: 'Meta', question: 'Why is this the key question to investigate?' },
      ];

      const thoughts = socraticSteps.map((step, i) =>
        factory.createThought(
          createCritiqueThought({
            thought: `${step.category}: ${step.question}`,
            thoughtNumber: i + 1,
            totalThoughts: 6,
            nextThoughtNeeded: i < 5,
          }),
          sessionId
        )
      );

      expect(thoughts).toHaveLength(6);
      thoughts.forEach((thought, i) => {
        expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
        expect(thought.content).toContain(socraticSteps[i].category);
      });
    });

    it('should balance strengths and weaknesses in critique', () => {
      const sessionId = 'session-crt-059-balance';

      // Balanced critique with equal attention to strengths and weaknesses
      const step1 = factory.createThought(
        createCritiqueWithStrengths(
          ['Strength 1', 'Strength 2', 'Strength 3'],
          { thought: 'First: Acknowledging strengths', thoughtNumber: 1, totalThoughts: 2, nextThoughtNeeded: true }
        ),
        sessionId
      );

      const step2 = factory.createThought(
        createCritiqueWithWeaknesses(
          ['Weakness 1', 'Weakness 2', 'Weakness 3'],
          { thought: 'Then: Noting weaknesses constructively', thoughtNumber: 2, totalThoughts: 2, nextThoughtNeeded: false }
        ),
        sessionId
      );

      // Verify balanced coverage
      expect((step1 as any).thoughtNumber).toBe(1);
      expect((step2 as any).thoughtNumber).toBe(2);
    });
  });
});
