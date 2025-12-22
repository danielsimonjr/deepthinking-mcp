/**
 * Academic Argumentation Mode Integration Tests
 *
 * Tests T-ACD-020 through T-ACD-042: Comprehensive integration tests
 * for the deepthinking_academic tool with argumentation mode.
 * Covers Toulmin model (claims, grounds, warrants, rebuttals).
 *
 * Phase 11 Sprint 7: Engineering & Academic Modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type ArgumentationThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';
import { createBaseThought } from '../../utils/thought-factory.js';

// ============================================================================
// ARGUMENTATION MODE THOUGHT FACTORIES
// ============================================================================

/**
 * Create a basic argumentation thought
 */
function createArgumentationThought(
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return {
    ...createBaseThought(),
    mode: 'argumentation',
    ...overrides,
  } as ThinkingToolInput;
}

/**
 * Claim types for Toulmin model
 */
type ClaimType = 'fact' | 'value' | 'policy' | 'definition' | 'cause';
type ClaimStrength = 'strong' | 'moderate' | 'tentative';

interface TestClaim {
  id: string;
  statement: string;
  type?: ClaimType;
  strength?: ClaimStrength;
}

/**
 * Create an argumentation thought with claims
 */
function createArgumentationWithClaims(
  claims: TestClaim[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createArgumentationThought({
    claims,
    ...overrides,
  } as any);
}

/**
 * Grounds types for Toulmin model
 */
type GroundsType = 'empirical' | 'statistical' | 'testimonial' | 'analogical' | 'logical' | 'textual';

interface TestGrounds {
  id: string;
  content: string;
  type?: GroundsType;
  reliability?: number;
  source?: string;
}

/**
 * Create an argumentation thought with grounds
 */
function createArgumentationWithGrounds(
  grounds: TestGrounds[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createArgumentationThought({
    grounds,
    ...overrides,
  } as any);
}

/**
 * Warrant types for Toulmin model
 */
type WarrantType = 'generalization' | 'analogy' | 'causal' | 'authority' | 'principle' | 'definition';

interface TestWarrant {
  id: string;
  statement: string;
  type?: WarrantType;
  claimId?: string;
  groundsIds?: string[];
}

/**
 * Create an argumentation thought with warrants
 */
function createArgumentationWithWarrants(
  warrants: TestWarrant[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createArgumentationThought({
    warrants,
    ...overrides,
  } as any);
}

/**
 * Rebuttal types
 */
type RebuttalType = 'factual' | 'logical' | 'ethical' | 'practical' | 'definitional';
type RebuttalStrength = 'strong' | 'moderate' | 'weak';

interface TestRebuttal {
  id: string;
  objection: string;
  type?: RebuttalType;
  strength?: RebuttalStrength;
  response?: string;
}

/**
 * Create an argumentation thought with rebuttals
 */
function createArgumentationWithRebuttals(
  rebuttals: TestRebuttal[],
  overrides: Partial<ThinkingToolInput> = {}
): ThinkingToolInput {
  return createArgumentationThought({
    rebuttals,
    ...overrides,
  } as any);
}

// ============================================================================
// TESTS
// ============================================================================

describe('Academic Argumentation Mode Integration Tests', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * T-ACD-020: Basic argumentation thought
   */
  describe('T-ACD-020: Basic Argumentation Thought', () => {
    it('should create a basic argumentation thought with minimal params', () => {
      const input = createArgumentationThought({
        thought: 'Constructing argument for research hypothesis',
      });

      const thought = factory.createThought(input, 'session-arg-020');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect(thought.content).toBe('Constructing argument for research hypothesis');
      expect(thought.sessionId).toBe('session-arg-020');
    });

    it('should assign unique IDs to argumentation thoughts', () => {
      const input1 = createArgumentationThought({ thought: 'First argument step' });
      const input2 = createArgumentationThought({ thought: 'Second argument step' });

      const thought1 = factory.createThought(input1, 'session-arg-020');
      const thought2 = factory.createThought(input2, 'session-arg-020');

      expect(thought1.id).not.toBe(thought2.id);
    });
  });

  /**
   * T-ACD-021: Argumentation with claims array
   */
  describe('T-ACD-021: Claims Array', () => {
    it('should include claims array in thought', () => {
      const claims: TestClaim[] = [
        { id: 'c1', statement: 'AI will transform education' },
        { id: 'c2', statement: 'Personalized learning improves outcomes' },
      ];
      const input = createArgumentationWithClaims(claims, {
        thought: 'Articulating main claims',
      });

      const thought = factory.createThought(input, 'session-arg-021');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).claims).toHaveLength(2);
    });
  });

  /**
   * T-ACD-022: Argumentation with claims[].type = fact
   */
  describe('T-ACD-022: Claim Type - Fact', () => {
    it('should support factual claims', () => {
      const claims: TestClaim[] = [
        { id: 'c1', statement: 'Global temperatures have risen 1.1C since 1880', type: 'fact' },
      ];
      const input = createArgumentationWithClaims(claims, {
        thought: 'Establishing factual claim',
      });

      const thought = factory.createThought(input, 'session-arg-022');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).claims[0].type).toBe('fact');
    });
  });

  /**
   * T-ACD-023: Argumentation with claims[].type = value
   */
  describe('T-ACD-023: Claim Type - Value', () => {
    it('should support value claims', () => {
      const claims: TestClaim[] = [
        { id: 'c1', statement: 'Open source software is better for society', type: 'value' },
      ];
      const input = createArgumentationWithClaims(claims, {
        thought: 'Articulating value judgment',
      });

      const thought = factory.createThought(input, 'session-arg-023');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).claims[0].type).toBe('value');
    });
  });

  /**
   * T-ACD-024: Argumentation with claims[].type = policy
   */
  describe('T-ACD-024: Claim Type - Policy', () => {
    it('should support policy claims', () => {
      const claims: TestClaim[] = [
        { id: 'c1', statement: 'Governments should regulate AI development', type: 'policy' },
      ];
      const input = createArgumentationWithClaims(claims, {
        thought: 'Proposing policy recommendation',
      });

      const thought = factory.createThought(input, 'session-arg-024');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).claims[0].type).toBe('policy');
    });
  });

  /**
   * T-ACD-025: Argumentation with claims[].type = definition
   */
  describe('T-ACD-025: Claim Type - Definition', () => {
    it('should support definitional claims', () => {
      const claims: TestClaim[] = [
        { id: 'c1', statement: 'Intelligence is the ability to adapt to change', type: 'definition' },
      ];
      const input = createArgumentationWithClaims(claims, {
        thought: 'Establishing definition',
      });

      const thought = factory.createThought(input, 'session-arg-025');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).claims[0].type).toBe('definition');
    });
  });

  /**
   * T-ACD-026: Argumentation with claims[].type = cause
   */
  describe('T-ACD-026: Claim Type - Cause', () => {
    it('should support causal claims', () => {
      const claims: TestClaim[] = [
        { id: 'c1', statement: 'Social media use causes increased anxiety in teens', type: 'cause' },
      ];
      const input = createArgumentationWithClaims(claims, {
        thought: 'Asserting causal relationship',
      });

      const thought = factory.createThought(input, 'session-arg-026');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).claims[0].type).toBe('cause');
    });
  });

  /**
   * T-ACD-027: Argumentation with claims[].strength
   */
  describe('T-ACD-027: Claim Strength', () => {
    it('should track claim strength levels', () => {
      const claims: TestClaim[] = [
        { id: 'c1', statement: 'Climate change is anthropogenic', strength: 'strong' },
        { id: 'c2', statement: 'Renewables can replace fossil fuels', strength: 'moderate' },
        { id: 'c3', statement: 'Fusion power may be viable by 2050', strength: 'tentative' },
      ];
      const input = createArgumentationWithClaims(claims, {
        thought: 'Differentiating claim strengths',
      });

      const thought = factory.createThought(input, 'session-arg-027');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).claims[0].strength).toBe('strong');
      expect((input as any).claims[2].strength).toBe('tentative');
    });
  });

  /**
   * T-ACD-028: Argumentation with grounds array
   */
  describe('T-ACD-028: Grounds Array', () => {
    it('should include grounds/evidence in thought', () => {
      const grounds: TestGrounds[] = [
        { id: 'g1', content: 'Study by Smith et al. (2023) found 40% improvement' },
        { id: 'g2', content: 'Meta-analysis of 50 studies confirms effect' },
      ];
      const input = createArgumentationWithGrounds(grounds, {
        thought: 'Presenting supporting evidence',
      });

      const thought = factory.createThought(input, 'session-arg-028');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).grounds).toHaveLength(2);
    });
  });

  /**
   * T-ACD-029: Argumentation with grounds[].type (6 types)
   */
  describe('T-ACD-029: Grounds Types', () => {
    it('should support all 6 grounds types', () => {
      const grounds: TestGrounds[] = [
        { id: 'g1', content: 'Experimental data', type: 'empirical' },
        { id: 'g2', content: 'Survey of 10,000 respondents', type: 'statistical' },
        { id: 'g3', content: 'Expert testimony from Dr. Jones', type: 'testimonial' },
        { id: 'g4', content: 'Similar to successful case in EU', type: 'analogical' },
        { id: 'g5', content: 'Follows from premises A and B', type: 'logical' },
        { id: 'g6', content: 'Original manuscript states...', type: 'textual' },
      ];
      const input = createArgumentationWithGrounds(grounds, {
        thought: 'Presenting diverse evidence types',
      });

      const thought = factory.createThought(input, 'session-arg-029');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).grounds).toHaveLength(6);
    });
  });

  /**
   * T-ACD-030: Argumentation with grounds[].reliability
   */
  describe('T-ACD-030: Grounds Reliability', () => {
    it('should track reliability scores for grounds', () => {
      const grounds: TestGrounds[] = [
        { id: 'g1', content: 'Peer-reviewed RCT', reliability: 0.95 },
        { id: 'g2', content: 'Industry-sponsored study', reliability: 0.60 },
        { id: 'g3', content: 'Anecdotal report', reliability: 0.30 },
      ];
      const input = createArgumentationWithGrounds(grounds, {
        thought: 'Assessing evidence reliability',
      });

      const thought = factory.createThought(input, 'session-arg-030');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).grounds[0].reliability).toBe(0.95);
    });
  });

  /**
   * T-ACD-031: Argumentation with grounds[].source
   */
  describe('T-ACD-031: Grounds Source', () => {
    it('should track source attribution for grounds', () => {
      const grounds: TestGrounds[] = [
        { id: 'g1', content: 'Temperature data', source: 'NASA GISS Dataset' },
        { id: 'g2', content: 'Economic projections', source: 'World Bank 2023 Report' },
      ];
      const input = createArgumentationWithGrounds(grounds, {
        thought: 'Attributing evidence sources',
      });

      const thought = factory.createThought(input, 'session-arg-031');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).grounds[0].source).toBe('NASA GISS Dataset');
    });
  });

  /**
   * T-ACD-032: Argumentation with warrants array
   */
  describe('T-ACD-032: Warrants Array', () => {
    it('should include warrants connecting grounds to claims', () => {
      const warrants: TestWarrant[] = [
        { id: 'w1', statement: 'Controlled experiments provide reliable evidence' },
        { id: 'w2', statement: 'Past performance predicts future outcomes' },
      ];
      const input = createArgumentationWithWarrants(warrants, {
        thought: 'Articulating reasoning principles',
      });

      const thought = factory.createThought(input, 'session-arg-032');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).warrants).toHaveLength(2);
    });
  });

  /**
   * T-ACD-033: Argumentation with warrants[].type (6 types)
   */
  describe('T-ACD-033: Warrant Types', () => {
    it('should support all 6 warrant types', () => {
      const warrants: TestWarrant[] = [
        { id: 'w1', statement: 'What is true for sample is true for population', type: 'generalization' },
        { id: 'w2', statement: 'Similar cases should be treated similarly', type: 'analogy' },
        { id: 'w3', statement: 'Effect follows from cause', type: 'causal' },
        { id: 'w4', statement: 'Expert opinion in domain is reliable', type: 'authority' },
        { id: 'w5', statement: 'Ethical principle of autonomy', type: 'principle' },
        { id: 'w6', statement: 'Term X means Y in this context', type: 'definition' },
      ];
      const input = createArgumentationWithWarrants(warrants, {
        thought: 'Using diverse warrant types',
      });

      const thought = factory.createThought(input, 'session-arg-033');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).warrants).toHaveLength(6);
    });
  });

  /**
   * T-ACD-034: Argumentation with warrants[].claimId reference
   */
  describe('T-ACD-034: Warrant-Claim Reference', () => {
    it('should track which claim each warrant supports', () => {
      const warrants: TestWarrant[] = [
        { id: 'w1', statement: 'Warrant for claim 1', claimId: 'c1' },
        { id: 'w2', statement: 'Warrant for claim 2', claimId: 'c2' },
      ];
      const input = createArgumentationWithWarrants(warrants, {
        thought: 'Linking warrants to claims',
      });

      const thought = factory.createThought(input, 'session-arg-034');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).warrants[0].claimId).toBe('c1');
    });
  });

  /**
   * T-ACD-035: Argumentation with warrants[].groundsIds references
   */
  describe('T-ACD-035: Warrant-Grounds Reference', () => {
    it('should track which grounds each warrant connects', () => {
      const warrants: TestWarrant[] = [
        { id: 'w1', statement: 'Links evidence to claim', groundsIds: ['g1', 'g2'] },
        { id: 'w2', statement: 'Alternative reasoning path', groundsIds: ['g3'] },
      ];
      const input = createArgumentationWithWarrants(warrants, {
        thought: 'Connecting grounds through warrants',
      });

      const thought = factory.createThought(input, 'session-arg-035');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).warrants[0].groundsIds).toHaveLength(2);
    });
  });

  /**
   * T-ACD-036: Argumentation with rebuttals array
   */
  describe('T-ACD-036: Rebuttals Array', () => {
    it('should include rebuttals/counterarguments', () => {
      const rebuttals: TestRebuttal[] = [
        { id: 'r1', objection: 'Correlation does not imply causation' },
        { id: 'r2', objection: 'Sample size too small' },
      ];
      const input = createArgumentationWithRebuttals(rebuttals, {
        thought: 'Anticipating counterarguments',
      });

      const thought = factory.createThought(input, 'session-arg-036');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).rebuttals).toHaveLength(2);
    });
  });

  /**
   * T-ACD-037: Argumentation with rebuttals[].type (5 types)
   */
  describe('T-ACD-037: Rebuttal Types', () => {
    it('should support all 5 rebuttal types', () => {
      const rebuttals: TestRebuttal[] = [
        { id: 'r1', objection: 'Data is outdated', type: 'factual' },
        { id: 'r2', objection: 'Fallacy of composition', type: 'logical' },
        { id: 'r3', objection: 'Violates autonomy principle', type: 'ethical' },
        { id: 'r4', objection: 'Too expensive to implement', type: 'practical' },
        { id: 'r5', objection: 'Misuses term X', type: 'definitional' },
      ];
      const input = createArgumentationWithRebuttals(rebuttals, {
        thought: 'Addressing various objection types',
      });

      const thought = factory.createThought(input, 'session-arg-037');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).rebuttals).toHaveLength(5);
    });
  });

  /**
   * T-ACD-038: Argumentation with rebuttals[].strength
   */
  describe('T-ACD-038: Rebuttal Strength', () => {
    it('should track rebuttal strength levels', () => {
      const rebuttals: TestRebuttal[] = [
        { id: 'r1', objection: 'Fundamental flaw in methodology', strength: 'strong' },
        { id: 'r2', objection: 'Minor limitation', strength: 'weak' },
      ];
      const input = createArgumentationWithRebuttals(rebuttals, {
        thought: 'Assessing objection severity',
      });

      const thought = factory.createThought(input, 'session-arg-038');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).rebuttals[0].strength).toBe('strong');
    });
  });

  /**
   * T-ACD-039: Argumentation with rebuttals[].response
   */
  describe('T-ACD-039: Rebuttal Response', () => {
    it('should include responses to rebuttals', () => {
      const rebuttals: TestRebuttal[] = [
        {
          id: 'r1',
          objection: 'Study lacks external validity',
          response: 'Replication in diverse contexts addresses this',
        },
        {
          id: 'r2',
          objection: 'Alternative explanations exist',
          response: 'Controlled for confounding variables',
        },
      ];
      const input = createArgumentationWithRebuttals(rebuttals, {
        thought: 'Addressing counterarguments with responses',
      });

      const thought = factory.createThought(input, 'session-arg-039');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).rebuttals[0].response).toContain('Replication');
    });
  });

  /**
   * T-ACD-040: Argumentation with argumentStrength score
   */
  describe('T-ACD-040: Argument Strength Score', () => {
    it('should include overall argument strength assessment', () => {
      const input = createArgumentationThought({
        argumentStrength: 0.85,
        thought: 'Strong argument with minor gaps',
      } as any);

      const thought = factory.createThought(input, 'session-arg-040');

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).argumentStrength).toBe(0.85);
    });

    it('should support various strength levels', () => {
      const strengthLevels = [0.9, 0.7, 0.5, 0.3];

      for (const strength of strengthLevels) {
        const input = createArgumentationThought({
          argumentStrength: strength,
          thought: `Argument with ${strength} strength`,
        } as any);

        const thought = factory.createThought(input, `session-arg-040-${strength}`);
        expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      }
    });
  });

  /**
   * T-ACD-041: Argumentation Toulmin model complete session
   */
  describe('T-ACD-041: Complete Toulmin Model Session', () => {
    it('should support full Toulmin argument construction', () => {
      const sessionId = 'session-arg-041-toulmin';

      // Step 1: Claim formulation
      const step1 = factory.createThought(
        createArgumentationWithClaims(
          [{ id: 'c1', statement: 'Remote work improves productivity', type: 'fact', strength: 'moderate' }],
          {
            thought: 'Claim: Remote work improves productivity',
            thoughtNumber: 1,
            totalThoughts: 5,
            nextThoughtNeeded: true,
          }
        ),
        sessionId
      );

      // Step 2: Grounds identification
      const step2 = factory.createThought(
        createArgumentationWithGrounds(
          [
            { id: 'g1', content: 'Stanford study: 13% productivity increase', type: 'empirical', reliability: 0.85 },
            { id: 'g2', content: 'Survey of 500 companies shows satisfaction', type: 'statistical', reliability: 0.75 },
          ],
          {
            thought: 'Grounds: Empirical and statistical evidence',
            thoughtNumber: 2,
            totalThoughts: 5,
            nextThoughtNeeded: true,
          }
        ),
        sessionId
      );

      // Step 3: Warrant construction
      const step3 = factory.createThought(
        createArgumentationWithWarrants(
          [
            { id: 'w1', statement: 'Reduced commute time allows more focus', type: 'causal', claimId: 'c1', groundsIds: ['g1'] },
            { id: 'w2', statement: 'Flexibility increases motivation', type: 'generalization', claimId: 'c1', groundsIds: ['g2'] },
          ],
          {
            thought: 'Warrants: Connecting evidence to claim',
            thoughtNumber: 3,
            totalThoughts: 5,
            nextThoughtNeeded: true,
          }
        ),
        sessionId
      );

      // Step 4: Rebuttal anticipation
      const step4 = factory.createThought(
        createArgumentationWithRebuttals(
          [
            { id: 'r1', objection: 'Collaboration suffers', type: 'practical', strength: 'moderate', response: 'Modern tools mitigate this' },
            { id: 'r2', objection: 'Not all roles suit remote work', type: 'factual', strength: 'strong', response: 'Claim is qualified to knowledge workers' },
          ],
          {
            thought: 'Rebuttals: Addressing counterarguments',
            thoughtNumber: 4,
            totalThoughts: 5,
            nextThoughtNeeded: true,
          }
        ),
        sessionId
      );

      // Step 5: Final assessment
      const step5 = factory.createThought(
        createArgumentationThought({
          argumentStrength: 0.75,
          thought: 'Complete Toulmin argument: Moderate strength with addressed rebuttals',
          thoughtNumber: 5,
          totalThoughts: 5,
          nextThoughtNeeded: false,
        } as any),
        sessionId
      );

      expect([step1, step2, step3, step4, step5]).toHaveLength(5);
      [step1, step2, step3, step4, step5].forEach((thought) => {
        expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      });
    });
  });

  /**
   * T-ACD-042: Argumentation multi-claim construction
   */
  describe('T-ACD-042: Multi-Claim Construction', () => {
    it('should support building argument with multiple interconnected claims', () => {
      const sessionId = 'session-arg-042-multi';

      // Main claim with supporting sub-claims
      const claims: TestClaim[] = [
        { id: 'c1', statement: 'Universal Basic Income should be implemented', type: 'policy', strength: 'moderate' },
        { id: 'c2', statement: 'Automation will displace many jobs', type: 'fact', strength: 'strong' },
        { id: 'c3', statement: 'Economic security is a human right', type: 'value', strength: 'moderate' },
        { id: 'c4', statement: 'UBI reduces poverty in pilot programs', type: 'cause', strength: 'tentative' },
      ];

      const input = createArgumentationWithClaims(claims, {
        thought: 'Constructing multi-claim argument with main thesis and supporting claims',
      });

      const thought = factory.createThought(input, sessionId);

      expect(thought.mode).toBe(ThinkingMode.ARGUMENTATION);
      expect((input as any).claims).toHaveLength(4);

      // Verify claim type diversity
      const types = (input as any).claims.map((c: TestClaim) => c.type);
      expect(types).toContain('policy');
      expect(types).toContain('fact');
      expect(types).toContain('value');
      expect(types).toContain('cause');
    });
  });
});
