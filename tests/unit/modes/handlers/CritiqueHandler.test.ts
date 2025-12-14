/**
 * CritiqueHandler Unit Tests - Phase 10 Sprint 2B
 *
 * Tests for the specialized CritiqueHandler:
 * - Thought creation
 * - Critique balance tracking
 * - Socratic questions
 * - Methodology validation
 * - Enhancements
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CritiqueHandler } from '../../../../src/modes/handlers/CritiqueHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('CritiqueHandler', () => {
  let handler: CritiqueHandler;

  beforeEach(() => {
    handler = new CritiqueHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.CRITIQUE);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Critical Analysis');
    });

    it('should have a description', () => {
      expect(handler.description).toBeTruthy();
      expect(handler.description.toLowerCase()).toContain('socratic');
    });
  });

  describe('createThought', () => {
    it('should create a basic critique thought', () => {
      const input: ThinkingToolInput = {
        thought: 'Critiquing the methodology',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
      };

      const thought = handler.createThought(input, 'session-1');

      expect(thought.mode).toBe(ThinkingMode.CRITIQUE);
      expect(thought.content).toBe('Critiquing the methodology');
      expect(thought.sessionId).toBe('session-1');
    });

    it('should create thought with work being critiqued', () => {
      const input: ThinkingToolInput = {
        thought: 'Analyzing the paper',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
        work: {
          id: 'work-1',
          title: 'Test Paper',
          authors: ['Author A', 'Author B'],
          year: 2024,
          type: 'empirical_study',
          field: 'Computer Science',
          claimedContribution: 'Novel algorithm',
        },
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.work).toBeDefined();
      expect(thought.work.title).toBe('Test Paper');
      expect(thought.work.authors).toHaveLength(2);
    });

    it('should create thought with critique points', () => {
      const input: ThinkingToolInput = {
        thought: 'Identifying issues',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
        critiquePoints: [
          {
            id: 'cp-1',
            type: 'strength',
            category: 'methodology',
            severity: 'neutral',
            description: 'Well-designed experiment',
          },
          {
            id: 'cp-2',
            type: 'weakness',
            category: 'evidence',
            severity: 'major',
            description: 'Small sample size',
            recommendation: 'Increase sample size',
          },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.critiquePoints).toHaveLength(2);
      expect(thought.strengthsIdentified).toBe(1);
      expect(thought.weaknessesIdentified).toBe(1);
    });

    it('should calculate balance ratio', () => {
      const input: ThinkingToolInput = {
        thought: 'Balanced critique',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
        critiquePoints: [
          { id: 'cp-1', type: 'strength', category: 'methodology', severity: 'neutral', description: 'S1' },
          { id: 'cp-2', type: 'strength', category: 'evidence', severity: 'neutral', description: 'S2' },
          { id: 'cp-3', type: 'weakness', category: 'argument', severity: 'minor', description: 'W1' },
          { id: 'cp-4', type: 'concern', category: 'contribution', severity: 'major', description: 'C1' },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.strengthsIdentified).toBe(2);
      expect(thought.weaknessesIdentified).toBe(2);
      expect(thought.balanceRatio).toBe(0.5); // 2/(2+2)
    });

    it('should create thought with verdict', () => {
      const input: ThinkingToolInput = {
        thought: 'Final verdict',
        thoughtNumber: 5,
        totalThoughts: 5,
        nextThoughtNeeded: false,
        mode: 'critique',
        verdict: {
          recommendation: 'minor_revision',
          confidence: 0.8,
          summary: 'Good paper with minor issues',
          majorStrengths: ['Novel approach'],
          majorWeaknesses: ['Limited evaluation'],
          keyImprovements: ['Expand experiments'],
        },
      } as any;

      const thought = handler.createThought(input, 'session-1') as any;

      expect(thought.verdict).toBeDefined();
      expect(thought.verdict.recommendation).toBe('minor_revision');
    });
  });

  describe('validate', () => {
    it('should pass validation for valid input', () => {
      const input: ThinkingToolInput = {
        thought: 'Valid critique',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for empty thought', () => {
      const input: ThinkingToolInput = {
        thought: '',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should warn when no strengths identified', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
        critiquePoints: [
          { id: 'cp-1', type: 'weakness', category: 'methodology', severity: 'major', description: 'W1' },
          { id: 'cp-2', type: 'weakness', category: 'evidence', severity: 'minor', description: 'W2' },
          { id: 'cp-3', type: 'concern', category: 'argument', severity: 'minor', description: 'C1' },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('strengths'))).toBe(true);
    });

    it('should warn when no weaknesses identified', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
        critiquePoints: [
          { id: 'cp-1', type: 'strength', category: 'methodology', severity: 'neutral', description: 'S1' },
          { id: 'cp-2', type: 'strength', category: 'evidence', severity: 'neutral', description: 'S2' },
          { id: 'cp-3', type: 'strength', category: 'argument', severity: 'neutral', description: 'S3' },
        ],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('weaknesses'))).toBe(true);
    });

    it('should validate methodology rating range', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
        methodologyEvaluation: {
          id: 'meth-1',
          design: { designType: 'RCT', appropriateness: 'appropriate', justification: 'Test', rating: 0.8 },
          sample: { sampleSize: 100, sampleType: 'Random', representativeness: 'representative', adequacy: 'adequate', concerns: [], rating: 0.7 },
          analysis: { methods: ['Stats'], appropriateness: 'appropriate', rigor: 'rigorous', transparency: 'transparent', reproducibility: 'reproducible', concerns: [], rating: 0.9 },
          validity: { internal: { rating: 0.8, threats: [], mitigations: [] }, external: { rating: 0.7, generalizability: 'Good', limitations: [] }, construct: { rating: 0.8, operationalization: 'Good', concerns: [] } },
          overallRating: 1.5, // Invalid
          majorConcerns: [],
          minorConcerns: [],
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('overallRating'))).toBe(true);
    });

    it('should warn when argument has circular reasoning', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
        argumentCritique: {
          id: 'arg-1',
          logicalStructure: {
            premises: { stated: [], unstated: [], questionable: [] },
            conclusions: { main: 'Conclusion', supporting: [] },
            inferentialGaps: [],
            circularReasoning: true,
            overallCoherence: 0.5,
          },
          fallaciesIdentified: [],
          unsupportedClaims: [],
          overinterpretations: [],
          strengths: [],
          rating: 0.6,
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('Circular'))).toBe(true);
    });

    it('should validate verdict confidence range', () => {
      const input: ThinkingToolInput = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
        verdict: {
          recommendation: 'accept',
          confidence: 1.5, // Invalid
          summary: 'Summary',
          majorStrengths: [],
          majorWeaknesses: [],
          keyImprovements: [],
        },
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('confidence'))).toBe(true);
    });
  });

  describe('getEnhancements', () => {
    it('should provide related modes', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.relatedModes).toContain(ThinkingMode.ARGUMENTATION);
      expect(enhancements.relatedModes).toContain(ThinkingMode.SYNTHESIS);
    });

    it('should provide mental models', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
      }, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.mentalModels).toContain('Socratic Questioning');
      expect(enhancements.mentalModels).toContain('Peer Review Framework');
    });

    it('should provide Socratic questions', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
        thoughtType: 'methodology_evaluation',
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.socraticQuestions).toBeDefined();
      expect(Object.keys(enhancements.socraticQuestions!).length).toBeGreaterThan(0);
      expect('Evidence' in enhancements.socraticQuestions!).toBe(true);
    });

    it('should warn about unbalanced critique weighted toward weaknesses', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
        critiquePoints: [
          { id: 'cp-1', type: 'weakness', category: 'methodology', severity: 'major', description: 'W1' },
          { id: 'cp-2', type: 'weakness', category: 'evidence', severity: 'major', description: 'W2' },
          { id: 'cp-3', type: 'weakness', category: 'argument', severity: 'minor', description: 'W3' },
          { id: 'cp-4', type: 'weakness', category: 'contribution', severity: 'minor', description: 'W4' },
          { id: 'cp-5', type: 'weakness', category: 'writing', severity: 'minor', description: 'W5' },
        ],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.warnings!.some(w => w.includes('weaknesses'))).toBe(true);
    });

    it('should warn about unbalanced critique weighted toward strengths', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
        critiquePoints: [
          { id: 'cp-1', type: 'strength', category: 'methodology', severity: 'neutral', description: 'S1' },
          { id: 'cp-2', type: 'strength', category: 'evidence', severity: 'neutral', description: 'S2' },
          { id: 'cp-3', type: 'strength', category: 'argument', severity: 'neutral', description: 'S3' },
          { id: 'cp-4', type: 'strength', category: 'contribution', severity: 'neutral', description: 'S4' },
          { id: 'cp-5', type: 'strength', category: 'writing', severity: 'neutral', description: 'S5' },
        ],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.warnings!.some(w => w.includes('strengths'))).toBe(true);
    });

    it('should warn about accept verdict with critical issues', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
        critiquePoints: [
          { id: 'cp-1', type: 'weakness', category: 'methodology', severity: 'critical', description: 'Critical flaw' },
        ],
        verdict: {
          recommendation: 'accept',
          confidence: 0.8,
          summary: 'Accepting despite issues',
          majorStrengths: [],
          majorWeaknesses: [],
          keyImprovements: [],
        },
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.warnings!.some(w => w.includes('critical'))).toBe(true);
    });

    it('should suggest adding improvements when weaknesses but no improvements', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
        critiquePoints: [
          { id: 'cp-1', type: 'weakness', category: 'methodology', severity: 'major', description: 'W1' },
        ],
        improvements: [],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.suggestions!.some(s => s.includes('improvement'))).toBe(true);
    });

    it('should calculate balance metrics', () => {
      const thought = handler.createThought({
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'critique',
        critiquePoints: [
          { id: 'cp-1', type: 'strength', category: 'methodology', severity: 'neutral', description: 'S1' },
          { id: 'cp-2', type: 'weakness', category: 'evidence', severity: 'major', description: 'W1' },
        ],
        improvements: [
          { id: 'imp-1', area: 'Evidence', current: 'Weak', suggested: 'Strong', rationale: 'Better evidence', priority: 'essential', feasibility: 'easy' },
        ],
      } as any, 'session-1');

      const enhancements = handler.getEnhancements(thought as any);

      expect(enhancements.metrics).toBeDefined();
      expect(enhancements.metrics!.strengthsIdentified).toBe(1);
      expect(enhancements.metrics!.weaknessesIdentified).toBe(1);
      expect(enhancements.metrics!.balanceRatio).toBe(0.5);
      expect(enhancements.metrics!.improvementCount).toBe(1);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support work_characterization', () => {
      expect(handler.supportsThoughtType!('work_characterization')).toBe(true);
    });

    it('should support methodology_evaluation', () => {
      expect(handler.supportsThoughtType!('methodology_evaluation')).toBe(true);
    });

    it('should support argument_analysis', () => {
      expect(handler.supportsThoughtType!('argument_analysis')).toBe(true);
    });

    it('should support improvement_suggestion', () => {
      expect(handler.supportsThoughtType!('improvement_suggestion')).toBe(true);
    });

    it('should not support unknown thought type', () => {
      expect(handler.supportsThoughtType!('unknown_type')).toBe(false);
    });
  });
});
