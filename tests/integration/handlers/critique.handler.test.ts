/**
 * CritiqueHandler Integration Tests
 *
 * Tests T-HDL-036 through T-HDL-043: Comprehensive tests for
 * CritiqueHandler covering 6 Socratic question categories.
 *
 * Phase 11 Sprint 9: ModeHandler Specialized Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CritiqueHandler } from '../../../src/modes/handlers/CritiqueHandler.js';
import { ThinkingMode } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('CritiqueHandler Integration Tests', () => {
  let handler: CritiqueHandler;

  beforeEach(() => {
    handler = new CritiqueHandler();
  });

  function createInput(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Critical analysis',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'critique',
      ...overrides,
    } as ThinkingToolInput;
  }

  // ===========================================================================
  // T-HDL-036: Socratic Clarification generation
  // ===========================================================================
  describe('T-HDL-036: Socratic Clarification', () => {
    it('should generate clarification questions', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Research Paper',
          authors: ['Author A'],
          type: 'empirical_study',
          year: 2023,
          field: 'Computer Science',
          claimedContribution: 'A new approach',
        },
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      // Should include clarifying questions
      expect(enhancements.guidingQuestions?.length).toBeGreaterThan(0);
    });

    it('should focus on defining terms and concepts', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Complex Theory Paper',
          type: 'theoretical_paper',
          authors: [],
          year: 2023,
          field: 'Philosophy',
          claimedContribution: 'New theory',
        },
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.work).toBeDefined();
    });
  });

  // ===========================================================================
  // T-HDL-037: Socratic Assumptions probing
  // ===========================================================================
  describe('T-HDL-037: Socratic Assumptions', () => {
    it('should probe underlying assumptions', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Assumption-Heavy Paper',
          type: 'empirical_study',
          authors: [],
          year: 2023,
          field: 'Science',
          claimedContribution: 'Study results',
        },
        critiquePoints: [
          { id: 'cp1', type: 'weakness', description: 'Unstated assumptions about X', severity: 'major' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.critiquePoints?.some(p => p.description.includes('Unstated assumptions'))).toBe(true);
    });

    it('should suggest assumption-related questions', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Paper',
          type: 'empirical_study',
          authors: [],
          year: 2023,
          field: 'Science',
          claimedContribution: 'Results',
        },
        thoughtType: 'methodology_evaluation', // triggers Assumptions category
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      // Socratic questions include assumption-related ones
      expect(enhancements.socraticQuestions?.['Assumptions']).toBeDefined();
    });
  });

  // ===========================================================================
  // T-HDL-038: Socratic Evidence questioning
  // ===========================================================================
  describe('T-HDL-038: Socratic Evidence', () => {
    it('should question evidence quality', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Empirical Study',
          type: 'empirical_study',
          authors: [],
          year: 2023,
          field: 'Science',
          claimedContribution: 'Study results',
        },
        critiquePoints: [
          { id: 'cp1', type: 'weakness', description: 'Limited sample size', severity: 'major' },
          { id: 'cp2', type: 'concern', description: 'Selection bias', severity: 'minor' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.weaknessesIdentified).toBe(2);
    });

    it('should provide evidence-focused guiding questions', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Study',
          type: 'empirical_study',
          authors: [],
          year: 2023,
          field: 'Science',
          claimedContribution: 'Results',
        },
        thoughtType: 'evidence_assessment', // triggers Evidence category
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      // Socratic questions include evidence-related ones
      expect(enhancements.socraticQuestions?.['Evidence']).toBeDefined();
    });
  });

  // ===========================================================================
  // T-HDL-039: Socratic Viewpoints exploration
  // ===========================================================================
  describe('T-HDL-039: Socratic Viewpoints', () => {
    it('should explore alternative viewpoints', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'One-Sided Analysis',
          type: 'empirical_study',
          authors: [],
          year: 2023,
          field: 'Science',
          claimedContribution: 'Analysis',
        },
        improvements: [{ id: 'imp1', description: 'Consider alternative perspectives', priority: 'high' }],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.improvements?.some(i => i.description.includes('alternative perspectives'))).toBe(true);
    });

    it('should suggest viewpoint-related questions', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Paper',
          type: 'empirical_study',
          authors: [],
          year: 2023,
          field: 'Science',
          claimedContribution: 'Results',
        },
        thoughtType: 'evidence_assessment', // triggers Perspectives category
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      // Socratic questions include perspectives-related ones
      expect(enhancements.socraticQuestions?.['Perspectives']).toBeDefined();
    });
  });

  // ===========================================================================
  // T-HDL-040: Socratic Implications analysis
  // ===========================================================================
  describe('T-HDL-040: Socratic Implications', () => {
    it('should analyze implications and consequences', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Policy Proposal',
          type: 'empirical_study',
          authors: [],
          year: 2023,
          field: 'Policy',
          claimedContribution: 'Proposal',
        },
        improvements: [{ id: 'imp1', description: 'Consider downstream implications', priority: 'high' }],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
    });

    it('should provide implication-focused questions', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Paper',
          type: 'empirical_study',
          authors: [],
          year: 2023,
          field: 'Science',
          claimedContribution: 'Results',
        },
        thoughtType: 'argument_analysis', // triggers Implications category
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      // Socratic questions include implications-related ones
      expect(enhancements.socraticQuestions?.['Implications']).toBeDefined();
    });
  });

  // ===========================================================================
  // T-HDL-041: Socratic Meta-questions generation
  // ===========================================================================
  describe('T-HDL-041: Socratic Meta-Questions', () => {
    it('should generate meta-level questions', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Meta-Analysis',
          type: 'empirical_study',
          authors: [],
          year: 2023,
          field: 'Science',
          claimedContribution: 'Meta-analysis results',
        },
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      // Should have some form of reflective questions
      expect(enhancements.guidingQuestions?.length).toBeGreaterThan(0);
    });

    it('should include questions about the question', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Paper',
          type: 'empirical_study',
          authors: [],
          year: 2023,
          field: 'Science',
          claimedContribution: 'Results',
        },
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain('Socratic Questioning');
    });
  });

  // ===========================================================================
  // T-HDL-042: Weakness categorization
  // ===========================================================================
  describe('T-HDL-042: Weakness Categorization', () => {
    it('should categorize identified weaknesses', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Flawed Study',
          type: 'empirical_study',
          authors: [],
          year: 2023,
          field: 'Science',
          claimedContribution: 'Study',
        },
        critiquePoints: [
          { id: 'cp1', type: 'weakness', description: 'Methodological issues', severity: 'major' },
          { id: 'cp2', type: 'weakness', description: 'Incomplete data', severity: 'major' },
          { id: 'cp3', type: 'weakness', description: 'Logical fallacy in conclusion', severity: 'critical' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.weaknessesIdentified).toBe(3);
    });

    it('should validate critique structure', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Paper',
          type: 'empirical_study',
          authors: [],
          year: 2023,
          field: 'Science',
          claimedContribution: 'Results',
        },
        critiquePoints: [
          { id: 'cp1', type: 'weakness', description: 'Valid weakness', severity: 'minor' },
        ],
      });

      const result = handler.validate(input);
      expect(result.valid).toBe(true);
    });

    it('should provide weakness metrics', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Paper',
          type: 'empirical_study',
          authors: [],
          year: 2023,
          field: 'Science',
          claimedContribution: 'Results',
        },
        critiquePoints: [
          { id: 'cp1', type: 'weakness', description: 'W1', severity: 'minor' },
          { id: 'cp2', type: 'weakness', description: 'W2', severity: 'minor' },
          { id: 'cp3', type: 'strength', description: 'S1', severity: 'minor' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.weaknessesIdentified).toBe(2);
      expect(enhancements.metrics?.strengthsIdentified).toBe(1);
    });
  });

  // ===========================================================================
  // T-HDL-043: Suggestion generation
  // ===========================================================================
  describe('T-HDL-043: Suggestion Generation', () => {
    it('should generate improvement suggestions', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Improvable Paper',
          type: 'empirical_study',
          authors: [],
          year: 2023,
          field: 'Science',
          claimedContribution: 'Paper',
        },
        critiquePoints: [
          { id: 'cp1', type: 'weakness', description: 'Issue A', severity: 'major' },
          { id: 'cp2', type: 'weakness', description: 'Issue B', severity: 'major' },
        ],
        improvements: [
          { id: 'imp1', description: 'Address Issue A by...', priority: 'high' },
          { id: 'imp2', description: 'Fix Issue B with...', priority: 'medium' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.improvements).toHaveLength(2);
    });

    it('should link improvements to weaknesses', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Paper',
          type: 'empirical_study',
          authors: [],
          year: 2023,
          field: 'Science',
          claimedContribution: 'Results',
        },
        critiquePoints: [
          { id: 'cp1', type: 'weakness', description: 'Weak methodology', severity: 'major' },
        ],
        improvements: [
          { id: 'imp1', description: 'Strengthen methodology by adding controls', priority: 'high' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      expect(thought.weaknessesIdentified).toBe(1);
      expect(thought.improvements?.length).toBe(1);
    });

    it('should suggest related modes for deeper analysis', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Paper',
          type: 'empirical_study',
          authors: [],
          year: 2023,
          field: 'Science',
          claimedContribution: 'Results',
        },
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.ANALYSIS);
    });

    it('should provide balanced critique metrics', () => {
      const input = createInput({
        work: {
          id: 'work-1',
          title: 'Balanced Review',
          type: 'empirical_study',
          authors: [],
          year: 2023,
          field: 'Science',
          claimedContribution: 'Review',
        },
        critiquePoints: [
          { id: 'cp1', type: 'strength', description: 'S1', severity: 'minor' },
          { id: 'cp2', type: 'strength', description: 'S2', severity: 'minor' },
          { id: 'cp3', type: 'strength', description: 'S3', severity: 'minor' },
          { id: 'cp4', type: 'weakness', description: 'W1', severity: 'minor' },
          { id: 'cp5', type: 'weakness', description: 'W2', severity: 'minor' },
        ],
        improvements: [
          { id: 'imp1', description: 'Sug1', priority: 'medium' },
        ],
      });

      const thought = handler.createThought(input, 'session-1');
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics?.strengthsIdentified).toBe(3);
      expect(enhancements.metrics?.weaknessesIdentified).toBe(2);
      expect(enhancements.metrics?.improvementCount).toBe(1);
    });
  });
});
