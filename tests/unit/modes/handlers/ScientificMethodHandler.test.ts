/**
 * ScientificMethodHandler Unit Tests - Phase 15 (v8.4.0)
 *
 * Tests for Scientific Method reasoning handler including:
 * - Hypothesis formulation validation
 * - Experiment design checking
 * - Falsifiability assessment
 * - Stage-specific guidance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ScientificMethodHandler } from '../../../../src/modes/handlers/ScientificMethodHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('ScientificMethodHandler', () => {
  let handler: ScientificMethodHandler;

  beforeEach(() => {
    handler = new ScientificMethodHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.SCIENTIFICMETHOD);
    });

    it('should have correct mode name', () => {
      expect(handler.modeName).toBe('Scientific Method');
    });

    it('should have a description', () => {
      expect(handler.description).toBeDefined();
      expect(handler.description).toContain('Hypothesis');
    });
  });

  describe('createThought', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Does caffeine consumption affect reaction time?',
      thoughtNumber: 1,
      totalThoughts: 6,
      nextThoughtNeeded: true,
      mode: 'scientificmethod',
    };
    const sessionId = 'test-session-scientific';

    it('should create a scientific method thought with default thought type', () => {
      const thought = handler.createThought(baseInput, sessionId);

      expect(thought.id).toBeDefined();
      expect(thought.sessionId).toBe(sessionId);
      expect(thought.mode).toBe(ThinkingMode.SCIENTIFICMETHOD);
      expect(thought.thoughtType).toBe('question_formulation');
      expect(thought.content).toBe(baseInput.thought);
    });

    it('should create thought with hypothesis_generation type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'hypothesis_generation',
        researchQuestion: 'Does caffeine affect reaction time?',
        scientificHypotheses: [
          {
            id: 'h1',
            statement: 'Caffeine consumption reduces reaction time',
            testable: true,
            falsifiable: true,
            predictions: ['Subjects who consume caffeine will react faster'],
          },
        ],
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('hypothesis_generation');
      expect(thought.researchQuestion).toBe(input.researchQuestion);
      expect(thought.scientificHypotheses).toHaveLength(1);
      expect(thought.scientificHypotheses![0].testable).toBe(true);
    });

    it('should create thought with experiment_design type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'experiment_design',
        researchQuestion: 'Does caffeine affect reaction time?',
        experiment: {
          design: 'double-blind randomized controlled trial',
          variables: {
            independent: 'caffeine dose',
            dependent: 'reaction time',
            controlled: ['sleep', 'age', 'time of day'],
          },
          controls: ['placebo group'],
          sampleSize: 100,
        },
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('experiment_design');
      expect(thought.experiment).toBeDefined();
      expect(thought.experiment!.sampleSize).toBe(100);
      expect(thought.experiment!.controls).toContain('placebo group');
    });

    it('should create thought with data_collection type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'data_collection',
        data: {
          measurements: [
            { subject: 1, caffeine: 200, reactionTime: 245 },
            { subject: 2, caffeine: 0, reactionTime: 312 },
          ],
          sampleSize: 100,
          collectionMethod: 'computer-based reaction test',
        },
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('data_collection');
      expect(thought.data).toBeDefined();
    });

    it('should create thought with analysis type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'analysis',
        analysis: {
          statisticalTest: 't-test',
          pValue: 0.003,
          effectSize: 0.45,
          significant: true,
        },
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('analysis');
      expect(thought.analysis).toBeDefined();
    });

    it('should create thought with conclusion type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'conclusion',
        conclusion: {
          summary: 'Caffeine significantly reduces reaction time',
          hypothesisSupported: true,
          limitations: ['Sample was university students only'],
          futureResearch: ['Test with different caffeine doses'],
        },
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('conclusion');
      expect(thought.conclusion).toBeDefined();
      expect(thought.conclusion!.hypothesisSupported).toBe(true);
    });

    it('should default to question_formulation for invalid thought type', () => {
      const input = {
        ...baseInput,
        thoughtType: 'invalid_type',
      };
      const thought = handler.createThought(input as any, sessionId);

      expect(thought.thoughtType).toBe('question_formulation');
    });
  });

  describe('validate', () => {
    it('should warn when no research question is defined', () => {
      const input: ThinkingToolInput = {
        thought: 'Starting research',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'scientificmethod',
      };

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'researchQuestion')).toBe(true);
    });

    it('should warn when no hypotheses are defined', () => {
      const input = {
        thought: 'Defining research question',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'scientificmethod',
        researchQuestion: 'Does X affect Y?',
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'scientificHypotheses')).toBe(true);
    });

    it('should warn about non-testable hypotheses', () => {
      const input = {
        thought: 'Hypothesis formulation',
        thoughtNumber: 2,
        totalThoughts: 6,
        nextThoughtNeeded: true,
        mode: 'scientificmethod',
        researchQuestion: 'Does X affect Y?',
        scientificHypotheses: [
          {
            id: 'h1',
            statement: 'A supernatural force determines outcomes',
            testable: false,
            falsifiable: false,
          },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('not be testable'))).toBe(true);
    });

    it('should warn about non-falsifiable hypotheses', () => {
      const input = {
        thought: 'Hypothesis formulation',
        thoughtNumber: 2,
        totalThoughts: 6,
        nextThoughtNeeded: true,
        mode: 'scientificmethod',
        researchQuestion: 'Does X affect Y?',
        scientificHypotheses: [
          {
            id: 'h1',
            statement: 'X causes Y in ways we cannot detect',
            testable: true,
            falsifiable: false,
          },
        ],
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('not be falsifiable'))).toBe(true);
    });

    it('should warn about missing controls in experiment', () => {
      const input = {
        thought: 'Designing experiment',
        thoughtNumber: 3,
        totalThoughts: 6,
        nextThoughtNeeded: true,
        mode: 'scientificmethod',
        researchQuestion: 'Does X affect Y?',
        scientificHypotheses: [{ id: 'h1', statement: 'X increases Y', testable: true, falsifiable: true }],
        experiment: {
          design: 'randomized',
          controls: [],
          sampleSize: 50,
        },
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'experiment.controls')).toBe(true);
    });

    it('should warn about insufficient sample size', () => {
      const input = {
        thought: 'Designing experiment',
        thoughtNumber: 3,
        totalThoughts: 6,
        nextThoughtNeeded: true,
        mode: 'scientificmethod',
        researchQuestion: 'Does X affect Y?',
        scientificHypotheses: [{ id: 'h1', statement: 'X increases Y', testable: true, falsifiable: true }],
        experiment: {
          design: 'randomized',
          controls: ['placebo'],
          sampleSize: 5,
        },
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'experiment.sampleSize')).toBe(true);
    });

    it('should pass validation with well-designed study', () => {
      const input = {
        thought: 'Well-designed experiment',
        thoughtNumber: 3,
        totalThoughts: 6,
        nextThoughtNeeded: true,
        mode: 'scientificmethod',
        researchQuestion: 'Does caffeine affect reaction time?',
        scientificHypotheses: [
          {
            id: 'h1',
            statement: 'Caffeine reduces reaction time',
            testable: true,
            falsifiable: true,
            predictions: ['Subjects with caffeine will be faster'],
          },
        ],
        experiment: {
          design: 'double-blind RCT',
          controls: ['placebo group', 'no-intervention group'],
          sampleSize: 100,
        },
      };

      const result = handler.validate(input as any);

      expect(result.valid).toBe(true);
      // Only checking there are no major warnings for these specific fields
      expect(result.warnings.filter((w) => w.field === 'experiment.controls').length).toBe(0);
      expect(result.warnings.filter((w) => w.field === 'experiment.sampleSize').length).toBe(0);
    });
  });

  describe('getEnhancements', () => {
    it('should provide suggestions when no research question', () => {
      const thought = handler.createThought(
        {
          thought: 'Starting investigation',
          thoughtNumber: 1,
          totalThoughts: 6,
          nextThoughtNeeded: true,
          mode: 'scientificmethod',
        },
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('research question'))).toBe(true);
    });

    it('should suggest hypothesis formulation when question exists', () => {
      const thought = handler.createThought(
        {
          thought: 'Research question defined',
          thoughtNumber: 1,
          totalThoughts: 6,
          nextThoughtNeeded: true,
          mode: 'scientificmethod',
          researchQuestion: 'Does X affect Y?',
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.toLowerCase().includes('hypothes'))).toBe(true);
    });

    it('should suggest experiment design when hypotheses exist', () => {
      const thought = handler.createThought(
        {
          thought: 'Hypotheses defined',
          thoughtNumber: 2,
          totalThoughts: 6,
          nextThoughtNeeded: true,
          mode: 'scientificmethod',
          researchQuestion: 'Does X affect Y?',
          scientificHypotheses: [{ id: 'h1', statement: 'X increases Y', testable: true, falsifiable: true }],
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.toLowerCase().includes('experiment'))).toBe(true);
    });

    it('should include scientific method mental models', () => {
      const thought = handler.createThought(
        {
          thought: 'Testing',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'scientificmethod',
        },
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toBeDefined();
      expect(enhancements.mentalModels!.some((m) => m.includes('Falsification'))).toBe(true);
      expect(enhancements.mentalModels!.some((m) => m.includes('Hypothetico-Deductive'))).toBe(true);
    });

    it('should include guiding questions about falsifiability', () => {
      const thought = handler.createThought(
        {
          thought: 'Testing',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'scientificmethod',
        },
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('falsify'))).toBe(true);
    });

    it('should suggest related modes', () => {
      const thought = handler.createThought(
        {
          thought: 'Testing',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
          mode: 'scientificmethod',
        },
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.ABDUCTIVE);
      expect(enhancements.relatedModes).toContain(ThinkingMode.INDUCTIVE);
      expect(enhancements.relatedModes).toContain(ThinkingMode.BAYESIAN);
    });

    it('should calculate metrics correctly', () => {
      const thought = handler.createThought(
        {
          thought: 'Complete study',
          thoughtNumber: 5,
          totalThoughts: 6,
          nextThoughtNeeded: true,
          mode: 'scientificmethod',
          researchQuestion: 'Does X affect Y?',
          scientificHypotheses: [
            { id: 'h1', statement: 'H1', testable: true, falsifiable: true },
            { id: 'h2', statement: 'H2', testable: true, falsifiable: true },
          ],
          experiment: { design: 'RCT', controls: ['placebo'], sampleSize: 100 },
          data: { measurements: [] },
          analysis: { pValue: 0.01 },
        } as any,
        'session'
      );

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.hypothesisCount).toBe(2);
      expect(enhancements.metrics!.hasResearchQuestion).toBe(1);
      expect(enhancements.metrics!.hasExperiment).toBe(1);
      expect(enhancements.metrics!.hasData).toBe(1);
      expect(enhancements.metrics!.hasAnalysis).toBe(1);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support question_formulation', () => {
      expect(handler.supportsThoughtType('question_formulation')).toBe(true);
    });

    it('should support hypothesis_generation', () => {
      expect(handler.supportsThoughtType('hypothesis_generation')).toBe(true);
    });

    it('should support experiment_design', () => {
      expect(handler.supportsThoughtType('experiment_design')).toBe(true);
    });

    it('should support data_collection', () => {
      expect(handler.supportsThoughtType('data_collection')).toBe(true);
    });

    it('should support analysis', () => {
      expect(handler.supportsThoughtType('analysis')).toBe(true);
    });

    it('should support conclusion', () => {
      expect(handler.supportsThoughtType('conclusion')).toBe(true);
    });

    it('should not support unknown types', () => {
      expect(handler.supportsThoughtType('unknown_type')).toBe(false);
      expect(handler.supportsThoughtType('bayesian_update')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle complete scientific method workflow', () => {
      const sessionId = 'e2e-scientific';

      // Step 1: Research question
      const step1 = handler.createThought(
        {
          thought: 'Does exposure to blue light before sleep affect sleep quality?',
          thoughtNumber: 1,
          totalThoughts: 6,
          nextThoughtNeeded: true,
          mode: 'scientificmethod',
          thoughtType: 'question_formulation',
          researchQuestion: 'Does exposure to blue light before sleep affect sleep quality?',
        } as any,
        sessionId
      );
      expect(step1.thoughtType).toBe('question_formulation');
      expect(step1.researchQuestion).toBeDefined();

      // Step 2: Hypothesis
      const step2Input = {
        thought: 'Hypothesis: Blue light exposure reduces sleep quality',
        thoughtNumber: 2,
        totalThoughts: 6,
        nextThoughtNeeded: true,
        mode: 'scientificmethod',
        thoughtType: 'hypothesis_generation',
        researchQuestion: step1.researchQuestion,
        scientificHypotheses: [
          {
            id: 'h1',
            statement: 'Blue light exposure in the hour before sleep reduces REM sleep duration',
            testable: true,
            falsifiable: true,
            predictions: ['REM sleep duration will be lower in blue light group'],
          },
        ],
      };
      const step2 = handler.createThought(step2Input as any, sessionId);
      const validation2 = handler.validate(step2Input as any);
      expect(validation2.valid).toBe(true);
      expect(step2.scientificHypotheses![0].testable).toBe(true);

      // Step 3: Experiment design
      const step3Input = {
        thought: 'Designing double-blind RCT',
        thoughtNumber: 3,
        totalThoughts: 6,
        nextThoughtNeeded: true,
        mode: 'scientificmethod',
        thoughtType: 'experiment_design',
        researchQuestion: step1.researchQuestion,
        scientificHypotheses: step2.scientificHypotheses,
        experiment: {
          design: 'double-blind randomized controlled trial',
          controls: ['amber light control', 'no light control'],
          sampleSize: 60,
          duration: '4 weeks',
        },
      };
      const step3 = handler.createThought(step3Input as any, sessionId);
      const validation3 = handler.validate(step3Input as any);
      expect(validation3.valid).toBe(true);
      expect(validation3.warnings.filter((w) => w.field === 'experiment.controls').length).toBe(0);

      // Step 4: Data collection
      const step4 = handler.createThought(
        {
          thought: 'Collecting sleep data',
          thoughtNumber: 4,
          totalThoughts: 6,
          nextThoughtNeeded: true,
          mode: 'scientificmethod',
          thoughtType: 'data_collection',
          data: {
            collectionMethod: 'polysomnography',
            sampleSize: 60,
          },
        } as any,
        sessionId
      );
      expect(step4.thoughtType).toBe('data_collection');

      // Step 5: Analysis
      const step5 = handler.createThought(
        {
          thought: 'Statistical analysis',
          thoughtNumber: 5,
          totalThoughts: 6,
          nextThoughtNeeded: true,
          mode: 'scientificmethod',
          thoughtType: 'analysis',
          analysis: {
            statisticalTest: 'ANOVA',
            pValue: 0.002,
            effectSize: 0.52,
            significant: true,
          },
        } as any,
        sessionId
      );
      expect(step5.thoughtType).toBe('analysis');

      // Step 6: Conclusion
      const step6 = handler.createThought(
        {
          thought: 'Drawing conclusions',
          thoughtNumber: 6,
          totalThoughts: 6,
          nextThoughtNeeded: false,
          mode: 'scientificmethod',
          thoughtType: 'conclusion',
          conclusion: {
            summary: 'Blue light exposure significantly reduces REM sleep duration',
            hypothesisSupported: true,
            limitations: ['Only tested adults 20-30 years old'],
            futureResearch: ['Test different wavelengths', 'Test different exposure durations'],
          },
        } as any,
        sessionId
      );
      expect(step6.thoughtType).toBe('conclusion');
      expect(step6.conclusion!.hypothesisSupported).toBe(true);

      // Final enhancements should recognize complete workflow
      const finalEnhancements = handler.getEnhancements(step6);
      expect(finalEnhancements.metrics!.hasConclusion).toBe(1);
    });
  });
});
