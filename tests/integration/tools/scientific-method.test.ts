/**
 * Scientific Mode Integration Tests - Scientific Method
 *
 * Tests T-SCI-001 through T-SCI-010: Comprehensive integration tests
 * for the deepthinking_scientific tool with scientificmethod mode.
 *
 * Phase 11 Sprint 6: Analytical & Scientific Modes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThoughtFactory } from '../../../src/services/ThoughtFactory.js';
import { ModeHandlerRegistry } from '../../../src/modes/registry.js';
import { ThinkingMode, type ScientificMethodThought } from '../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../src/tools/thinking.js';

describe('Scientific Mode Integration - Scientific Method', () => {
  let factory: ThoughtFactory;

  beforeEach(() => {
    ModeHandlerRegistry.resetInstance();
    factory = new ThoughtFactory({ autoRegisterHandlers: true });
  });

  afterEach(() => {
    ModeHandlerRegistry.resetInstance();
  });

  /**
   * Helper to create basic scientific method input
   */
  function createScientificMethodInput(overrides: Partial<ThinkingToolInput> = {}): ThinkingToolInput {
    return {
      thought: 'Scientific method reasoning step',
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      mode: 'scientificmethod',
      ...overrides,
    } as ThinkingToolInput;
  }

  /**
   * T-SCI-001: Basic scientificmethod thought
   */
  describe('T-SCI-001: Basic Scientific Method Thought', () => {
    it('should create a basic scientific method thought with minimal params', () => {
      const input = createScientificMethodInput({
        thought: 'Formulating research question',
      });

      const thought = factory.createThought(input, 'session-sci-001');

      expect(thought.mode).toBe(ThinkingMode.SCIENTIFICMETHOD);
      expect(thought.content).toBe('Formulating research question');
      expect(thought.sessionId).toBe('session-sci-001');
    });

    it('should assign unique IDs to scientific method thoughts', () => {
      const input1 = createScientificMethodInput({ thought: 'First hypothesis' });
      const input2 = createScientificMethodInput({ thought: 'Second hypothesis' });

      const thought1 = factory.createThought(input1, 'session-sci-001');
      const thought2 = factory.createThought(input2, 'session-sci-001');

      expect(thought1.id).not.toBe(thought2.id);
    });

    it('should include thoughtType for scientific method mode', () => {
      const input = createScientificMethodInput({
        thought: 'Formulating question',
        thoughtType: 'question_formulation',
      });

      const thought = factory.createThought(input, 'session-sci-001') as ScientificMethodThought;

      expect(thought.thoughtType).toBe('question_formulation');
    });
  });

  /**
   * T-SCI-002: ScientificMethod with hypothesis
   */
  describe('T-SCI-002: With Hypothesis', () => {
    it('should include scientific hypotheses', () => {
      const input = createScientificMethodInput({
        thought: 'Generating hypotheses',
        thoughtType: 'hypothesis_generation',
        scientificHypotheses: [
          {
            id: 'h1',
            type: 'null',
            statement: 'There is no significant difference between groups',
            prediction: 'Mean values will be equal within sampling error',
            rationale: 'Null hypothesis for statistical testing',
            testable: true,
            falsifiable: true,
          },
          {
            id: 'h2',
            type: 'alternative',
            statement: 'Treatment group shows improvement over control',
            prediction: 'Treatment mean > control mean',
            rationale: 'Based on prior research suggesting positive effect',
            testable: true,
            falsifiable: true,
            latex: 'H_1: \\mu_T > \\mu_C',
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sci-002') as ScientificMethodThought;

      expect(thought.scientificHypotheses).toHaveLength(2);
      expect(thought.scientificHypotheses![0].type).toBe('null');
      expect(thought.scientificHypotheses![1].type).toBe('alternative');
    });

    it('should validate hypothesis properties', () => {
      const input = createScientificMethodInput({
        thought: 'Validating hypothesis',
        scientificHypotheses: [
          {
            id: 'h-valid',
            type: 'directional',
            statement: 'Increasing temperature increases reaction rate',
            prediction: 'Reaction rate will be positively correlated with temperature',
            rationale: 'Arrhenius equation predicts exponential increase',
            testable: true,
            falsifiable: true,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sci-002') as ScientificMethodThought;

      expect(thought.scientificHypotheses![0].testable).toBe(true);
      expect(thought.scientificHypotheses![0].falsifiable).toBe(true);
    });
  });

  /**
   * T-SCI-003: ScientificMethod with predictions array
   */
  describe('T-SCI-003: With Predictions', () => {
    it('should include predictions from hypotheses', () => {
      const input = createScientificMethodInput({
        thought: 'Making testable predictions',
        scientificHypotheses: [
          {
            id: 'h1',
            type: 'alternative',
            statement: 'Exercise improves cognitive function',
            prediction: 'Exercise group will score 10% higher on cognitive tests',
            rationale: 'Based on neuroplasticity research',
            testable: true,
            falsifiable: true,
          },
        ],
      });

      const thought = factory.createThought(input, 'session-sci-003') as ScientificMethodThought;

      expect(thought.scientificHypotheses![0].prediction).toContain('10% higher');
    });
  });

  /**
   * T-SCI-004: ScientificMethod with experiments array
   */
  describe('T-SCI-004: With Experiments', () => {
    it('should include experiment design', () => {
      const input = createScientificMethodInput({
        thought: 'Designing experiment',
        thoughtType: 'experiment_design',
        experiment: {
          id: 'exp-1',
          type: 'experimental',
          design: 'Randomized controlled trial',
          independentVariables: [
            {
              id: 'iv1',
              name: 'Treatment',
              type: 'independent',
              description: 'Drug vs placebo',
              measurementScale: 'nominal',
              operationalDefinition: 'Active drug (100mg) or placebo tablet',
              levels: ['drug', 'placebo'],
            },
          ],
          dependentVariables: [
            {
              id: 'dv1',
              name: 'Symptom Score',
              type: 'dependent',
              description: 'Self-reported symptom severity',
              measurementScale: 'interval',
              operationalDefinition: 'Score on validated symptom questionnaire (0-100)',
              range: [0, 100],
            },
          ],
          controlVariables: [
            {
              id: 'cv1',
              name: 'Age',
              type: 'control',
              description: 'Participant age',
              measurementScale: 'ratio',
              operationalDefinition: 'Age in years at enrollment',
            },
          ],
          sampleSize: 200,
          sampleSizeJustification: 'Power analysis: 80% power to detect medium effect size',
          randomization: true,
          blinding: 'double',
          controls: ['Placebo control', 'Age matching'],
          procedure: [
            'Recruit participants',
            'Random assignment to groups',
            'Administer treatment for 8 weeks',
            'Measure outcomes at baseline and week 8',
          ],
        },
      });

      const thought = factory.createThought(input, 'session-sci-004') as ScientificMethodThought;

      expect(thought.experiment).toBeDefined();
      expect(thought.experiment!.type).toBe('experimental');
      expect(thought.experiment!.sampleSize).toBe(200);
      expect(thought.experiment!.blinding).toBe('double');
    });
  });

  /**
   * T-SCI-005: ScientificMethod with experiments[].result
   */
  describe('T-SCI-005: Experiment Results', () => {
    it('should include data collection results', () => {
      const input = createScientificMethodInput({
        thought: 'Collecting and analyzing data',
        thoughtType: 'data_collection',
        data: {
          id: 'data-1',
          method: ['Survey', 'Biomarker assay'],
          instruments: ['Validated questionnaire', 'ELISA kit'],
          observations: [
            {
              id: 'obs-1',
              condition: 'treatment',
              values: { score: 75, biomarker: 2.5 },
              notes: 'Participant reported improvement',
            },
          ],
          measurements: [
            {
              variableId: 'dv1',
              values: [75, 82, 68, 91, 77, 84, 79, 88],
              descriptiveStats: {
                mean: 80.5,
                median: 80,
                stdDev: 7.2,
                min: 68,
                max: 91,
                n: 8,
              },
            },
          ],
          dataQuality: {
            completeness: 0.95,
            reliability: 0.88,
            validity: 0.9,
          },
          limitations: ['Small sample size for pilot study'],
        },
      });

      const thought = factory.createThought(input, 'session-sci-005') as ScientificMethodThought;

      expect(thought.data).toBeDefined();
      expect(thought.data!.measurements[0].descriptiveStats!.mean).toBe(80.5);
      expect(thought.data!.dataQuality.completeness).toBe(0.95);
    });
  });

  /**
   * T-SCI-006: ScientificMethod hypothesis testing session
   */
  describe('T-SCI-006: Hypothesis Testing Session', () => {
    it('should include statistical analysis', () => {
      const input = createScientificMethodInput({
        thought: 'Performing statistical analysis',
        thoughtType: 'analysis',
        analysis: {
          id: 'analysis-1',
          tests: [
            {
              id: 'test-1',
              name: 'Independent samples t-test',
              hypothesisTested: 'h1',
              testStatistic: 2.85,
              pValue: 0.005,
              confidenceInterval: [3.2, 12.8],
              alpha: 0.05,
              result: 'reject_null',
              interpretation: 'Treatment group showed significantly higher scores',
              latex: 't(198) = 2.85, p = .005',
            },
          ],
          summary: 'Significant difference found between treatment and control groups',
          assumptions: [
            { assumption: 'Normal distribution', met: true, evidence: 'Shapiro-Wilk p > 0.05' },
            { assumption: 'Equal variances', met: true, evidence: 'Levene test p > 0.05' },
          ],
          effectSize: {
            type: 'Cohen\'s d',
            value: 0.45,
            interpretation: 'Medium effect size',
          },
          powerAnalysis: {
            power: 0.82,
            alpha: 0.05,
            interpretation: 'Adequate statistical power achieved',
          },
        },
      });

      const thought = factory.createThought(input, 'session-sci-006') as ScientificMethodThought;

      expect(thought.analysis).toBeDefined();
      expect(thought.analysis!.tests[0].result).toBe('reject_null');
      expect(thought.analysis!.effectSize!.value).toBe(0.45);
    });
  });

  /**
   * T-SCI-007: ScientificMethod falsification attempt
   */
  describe('T-SCI-007: Falsification Attempt', () => {
    it('should handle failed hypothesis (falsification)', () => {
      const input = createScientificMethodInput({
        thought: 'Hypothesis falsified by data',
        thoughtType: 'conclusion',
        conclusion: {
          id: 'conclusion-1',
          statement: 'The hypothesis was not supported by the data',
          supportedHypotheses: [],
          rejectedHypotheses: ['h1'],
          confidence: 0.95,
          limitations: ['Sample may not be representative'],
          alternativeExplanations: ['Effect may be too small to detect', 'Measurement error'],
          futureDirections: ['Increase sample size', 'Use more sensitive measures'],
          replicationConsiderations: ['Pre-register hypothesis', 'Multi-site replication needed'],
        },
      });

      const thought = factory.createThought(input, 'session-sci-007') as ScientificMethodThought;

      expect(thought.conclusion!.rejectedHypotheses).toContain('h1');
      expect(thought.conclusion!.supportedHypotheses).toHaveLength(0);
    });
  });

  /**
   * T-SCI-008: ScientificMethod multi-experiment validation
   */
  describe('T-SCI-008: Multi-Experiment Validation', () => {
    it('should support conclusions across multiple experiments', () => {
      const input = createScientificMethodInput({
        thought: 'Synthesizing results across experiments',
        thoughtType: 'conclusion',
        conclusion: {
          id: 'meta-conclusion',
          statement: 'Across three experiments, the effect was consistently observed',
          supportedHypotheses: ['h1', 'h2'],
          rejectedHypotheses: ['h3'],
          confidence: 0.9,
          limitations: ['All studies in Western populations', 'Limited age range'],
          futureDirections: ['Cross-cultural replication', 'Longitudinal follow-up'],
          replicationConsiderations: ['Effect size for power calculations available', 'Materials and protocols shared'],
          practicalImplications: ['Intervention may be cost-effective', 'Training required for implementation'],
          theoreticalImplications: ['Supports cognitive load theory', 'Extends prior models'],
        },
      });

      const thought = factory.createThought(input, 'session-sci-008') as ScientificMethodThought;

      expect(thought.conclusion!.supportedHypotheses).toHaveLength(2);
      expect(thought.conclusion!.practicalImplications).toBeDefined();
    });
  });

  /**
   * T-SCI-009: ScientificMethod with revision on results
   */
  describe('T-SCI-009: Revision on Results', () => {
    it('should support hypothesis revision based on results', () => {
      const sessionId = 'session-sci-009-rev';

      // Original hypothesis
      const originalInput = createScientificMethodInput({
        thought: 'Original hypothesis: Linear relationship',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
        scientificHypotheses: [
          {
            id: 'h-original',
            type: 'directional',
            statement: 'Linear relationship between X and Y',
            prediction: 'Y = aX + b',
            rationale: 'Simple linear model',
            testable: true,
            falsifiable: true,
          },
        ],
      });
      const original = factory.createThought(originalInput, sessionId) as ScientificMethodThought;

      // Revised hypothesis after data analysis
      const revisionInput = createScientificMethodInput({
        thought: 'Revising hypothesis: Curvilinear relationship observed',
        thoughtNumber: 2,
        totalThoughts: 2,
        nextThoughtNeeded: false,
        isRevision: true,
        revisesThought: original.id,
        revisionReason: 'Data showed significant quadratic component',
        scientificHypotheses: [
          {
            id: 'h-revised',
            type: 'directional',
            statement: 'Curvilinear (quadratic) relationship between X and Y',
            prediction: 'Y = aX^2 + bX + c',
            rationale: 'Residual analysis revealed quadratic pattern',
            testable: true,
            falsifiable: true,
            latex: 'Y = aX^2 + bX + c',
          },
        ],
      });
      const revision = factory.createThought(revisionInput, sessionId) as ScientificMethodThought;

      expect(revision.isRevision).toBe(true);
      expect(revision.revisesThought).toBe(original.id);
      expect(revision.scientificHypotheses![0].latex).toContain('X^2');
    });
  });

  /**
   * T-SCI-010: ScientificMethod reproducibility check
   */
  describe('T-SCI-010: Reproducibility Check', () => {
    it('should include replication considerations in conclusions', () => {
      const input = createScientificMethodInput({
        thought: 'Assessing reproducibility requirements',
        thoughtType: 'conclusion',
        conclusion: {
          id: 'repro-conclusion',
          statement: 'Effect is robust and reproducible',
          supportedHypotheses: ['h1'],
          rejectedHypotheses: [],
          confidence: 0.85,
          limitations: ['Single lab study'],
          futureDirections: ['Multi-lab replication', 'Pre-registration of replication'],
          replicationConsiderations: [
            'All materials available on OSF',
            'Analysis code published on GitHub',
            'Effect size (d = 0.5) adequate for replication power',
            'Sample size of 50 per group recommended',
            'Key moderators identified for heterogeneity analysis',
          ],
        },
      });

      const thought = factory.createThought(input, 'session-sci-010') as ScientificMethodThought;

      expect(thought.conclusion!.replicationConsiderations).toHaveLength(5);
      expect(thought.conclusion!.replicationConsiderations.some(r => r.includes('OSF'))).toBe(true);
    });

    it('should support full scientific method workflow', () => {
      const sessionId = 'session-sci-010-full';

      // Step 1: Question formulation
      const step1 = factory.createThought(createScientificMethodInput({
        thought: 'Research question: Does meditation reduce stress?',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        thoughtType: 'question_formulation',
        researchQuestion: {
          id: 'rq-1',
          question: 'Does daily meditation practice reduce stress levels?',
          background: 'Prior studies suggest mindfulness may affect stress hormones',
          rationale: 'Chronic stress is a major health concern',
          significance: 'Could provide low-cost intervention for stress management',
          variables: {
            independent: ['Meditation practice (20 min daily vs no meditation)'],
            dependent: ['Cortisol levels', 'Self-reported stress'],
            control: ['Age', 'Baseline stress', 'Sleep quality'],
          },
        },
      }), sessionId) as ScientificMethodThought;
      expect(step1.researchQuestion!.question).toContain('meditation');

      // Step 2: Hypothesis generation
      const step2 = factory.createThought(createScientificMethodInput({
        thought: 'Generating testable hypotheses',
        thoughtNumber: 2,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        thoughtType: 'hypothesis_generation',
        scientificHypotheses: [
          {
            id: 'h0',
            type: 'null',
            statement: 'No difference in stress between groups',
            prediction: 'Mean cortisol equal in both groups',
            rationale: 'Null hypothesis',
            testable: true,
            falsifiable: true,
          },
          {
            id: 'h1',
            type: 'alternative',
            statement: 'Meditation reduces cortisol levels',
            prediction: 'Meditation group cortisol < control',
            rationale: 'Based on relaxation response literature',
            testable: true,
            falsifiable: true,
          },
        ],
      }), sessionId) as ScientificMethodThought;
      expect(step2.scientificHypotheses).toHaveLength(2);

      // Step 3: Experiment design
      const step3 = factory.createThought(createScientificMethodInput({
        thought: 'Designing experiment',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        thoughtType: 'experiment_design',
        experiment: {
          id: 'exp-meditation',
          type: 'experimental',
          design: 'Randomized controlled trial',
          independentVariables: [
            { id: 'iv1', name: 'Meditation', type: 'independent', description: '20 min daily meditation vs waitlist control', measurementScale: 'nominal', operationalDefinition: 'Guided meditation app usage' },
          ],
          dependentVariables: [
            { id: 'dv1', name: 'Cortisol', type: 'dependent', description: 'Salivary cortisol', measurementScale: 'ratio', operationalDefinition: 'Morning cortisol (nmol/L)', unit: 'nmol/L' },
          ],
          controlVariables: [
            { id: 'cv1', name: 'Age', type: 'control', description: 'Participant age', measurementScale: 'ratio', operationalDefinition: 'Years' },
          ],
          sampleSize: 100,
          randomization: true,
          blinding: 'single',
          controls: ['Waitlist control'],
          procedure: ['Baseline assessment', '8-week intervention', 'Post-test'],
        },
      }), sessionId) as ScientificMethodThought;
      expect(step3.experiment!.sampleSize).toBe(100);

      // Step 4: Data analysis
      const step4 = factory.createThought(createScientificMethodInput({
        thought: 'Analyzing collected data',
        thoughtNumber: 4,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        thoughtType: 'analysis',
        analysis: {
          id: 'analysis-main',
          tests: [
            {
              id: 't1',
              name: 'ANCOVA',
              hypothesisTested: 'h1',
              testStatistic: 8.5,
              pValue: 0.004,
              alpha: 0.05,
              result: 'reject_null',
              interpretation: 'Significant reduction in cortisol for meditation group',
            },
          ],
          summary: 'Meditation group showed 15% lower cortisol',
          assumptions: [
            { assumption: 'Normality', met: true, evidence: 'Visual inspection and tests OK' },
          ],
          effectSize: { type: 'eta-squared', value: 0.08, interpretation: 'Medium effect' },
        },
      }), sessionId) as ScientificMethodThought;
      expect(step4.analysis!.tests[0].result).toBe('reject_null');

      // Step 5: Conclusion
      const step5 = factory.createThought(createScientificMethodInput({
        thought: 'Drawing conclusions',
        thoughtNumber: 5,
        totalThoughts: 5,
        nextThoughtNeeded: false,
        thoughtType: 'conclusion',
        conclusion: {
          id: 'final',
          statement: 'Daily meditation significantly reduces cortisol levels',
          supportedHypotheses: ['h1'],
          rejectedHypotheses: ['h0'],
          confidence: 0.85,
          limitations: ['Single site', 'Self-selected sample'],
          futureDirections: ['Longer follow-up', 'Active control'],
          replicationConsiderations: ['Protocol on OSF', 'Effect size d=0.4'],
          practicalImplications: ['Meditation apps may help stress management'],
        },
      }), sessionId) as ScientificMethodThought;
      expect(step5.conclusion!.supportedHypotheses).toContain('h1');
      expect(step5.nextThoughtNeeded).toBe(false);
    });
  });
});
