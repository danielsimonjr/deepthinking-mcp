import { describe, it, expect } from 'vitest';
import { ThoughtValidator } from '../../src/validation/validator.js';
import { EvidentialThought, isEvidentialThought } from '../../src/types/modes/evidential.js';

describe('Evidential Reasoning', () => {
  const validator = new ThoughtValidator();

  describe('Type guard validation', () => {
    it('should correctly identify evidential thoughts', async () => {
      const thought: EvidentialThought = {
        id: 'ev-1',
        sessionId: 'session-1',
        mode: 'evidential',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Test evidential thought',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'hypothesis_definition',
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Hypothesis validation', () => {
    it('should accept valid hypothesis definitions', async () => {
      const thought: EvidentialThought = {
        id: 'ev-2',
        sessionId: 'session-1',
        mode: 'evidential',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Define hypotheses',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'hypothesis_definition',
        hypotheses: [
          {
            id: 'h1',
            name: 'System overload',
            description: 'CPU is overloaded',
            mutuallyExclusive: true,
          },
          {
            id: 'h2',
            name: 'Memory leak',
            description: 'Application has memory leak',
            mutuallyExclusive: true,
          },
        ],
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });

    it('should reject hypothesis with invalid subset reference', async () => {
      const thought: EvidentialThought = {
        id: 'ev-3',
        sessionId: 'session-1',
        mode: 'evidential',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Invalid subset',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'hypothesis_definition',
        hypotheses: [
          {
            id: 'h1',
            name: 'Composite',
            description: 'Composite hypothesis',
            mutuallyExclusive: false,
            subsets: ['h-nonexistent'],
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('unknown subset'))).toBe(true);
    });
  });

  describe('Evidence validation', () => {
    it('should accept valid evidence with proper reliability', async () => {
      const thought: EvidentialThought = {
        id: 'ev-4',
        sessionId: 'session-1',
        mode: 'evidential',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Collect evidence',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'evidence_collection',
        hypotheses: [
          { id: 'h1', name: 'H1', description: 'Hypothesis 1', mutuallyExclusive: true },
        ],
        evidence: [
          {
            id: 'e1',
            description: 'CPU usage at 95%',
            source: 'monitoring',
            reliability: 0.9,
            timestamp: Date.now(),
            supports: ['h1'],
          },
        ],
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });

    it('should reject evidence with invalid reliability', async () => {
      const thought: EvidentialThought = {
        id: 'ev-5',
        sessionId: 'session-1',
        mode: 'evidential',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Invalid reliability',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'evidence_collection',
        evidence: [
          {
            id: 'e1',
            description: 'Test evidence',
            source: 'test',
            reliability: 1.5, // Invalid: > 1
            timestamp: Date.now(),
            supports: ['h1'],
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      // Check for reliability validation error - matches both old and new message formats
      expect(errors.some(e => e.description.toLowerCase().includes('reliability') &&
        (e.description.includes('0') || e.description.includes('1')))).toBe(true);
    });

    it('should reject evidence supporting unknown hypothesis', async () => {
      const thought: EvidentialThought = {
        id: 'ev-6',
        sessionId: 'session-1',
        mode: 'evidential',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Invalid hypothesis reference',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'evidence_collection',
        hypotheses: [
          { id: 'h1', name: 'H1', description: 'Hypothesis 1', mutuallyExclusive: true },
        ],
        evidence: [
          {
            id: 'e1',
            description: 'Test evidence',
            source: 'test',
            reliability: 0.8,
            timestamp: Date.now(),
            supports: ['h-nonexistent'],
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('unknown hypothesis'))).toBe(true);
    });
  });

  describe('Belief function validation', () => {
    it('should accept valid belief function with mass assignments', async () => {
      const thought: EvidentialThought = {
        id: 'ev-7',
        sessionId: 'session-1',
        mode: 'evidential',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Belief assignment',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'belief_assignment',
        beliefFunctions: [
          {
            id: 'bf1',
            source: 'e1',
            massAssignments: [
              {
                hypothesisSet: ['h1'],
                mass: 0.7,
                justification: 'Strong evidence for h1',
              },
              {
                hypothesisSet: ['h2'],
                mass: 0.3,
                justification: 'Weak evidence for h2',
              },
            ],
          },
        ],
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });

    it('should reject belief function with invalid mass values', async () => {
      const thought: EvidentialThought = {
        id: 'ev-8',
        sessionId: 'session-1',
        mode: 'evidential',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Invalid mass',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'belief_assignment',
        beliefFunctions: [
          {
            id: 'bf1',
            source: 'e1',
            massAssignments: [
              {
                hypothesisSet: ['h1'],
                mass: 1.5, // Invalid: > 1
                justification: 'Test',
              },
            ],
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      // Check for mass/probability validation error - matches both old and new message formats
      expect(errors.some(e => e.description.toLowerCase().includes('mass') &&
        (e.description.includes('0') || e.description.includes('1')))).toBe(true);
    });

    it('should reject belief function with mass not summing to 1', async () => {
      const thought: EvidentialThought = {
        id: 'ev-9',
        sessionId: 'session-1',
        mode: 'evidential',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Mass sum validation',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'belief_assignment',
        beliefFunctions: [
          {
            id: 'bf1',
            source: 'e1',
            massAssignments: [
              {
                hypothesisSet: ['h1'],
                mass: 0.3,
                justification: 'Partial evidence',
              },
              {
                hypothesisSet: ['h2'],
                mass: 0.2,
                justification: 'Weak evidence',
              },
              // Sum is 0.5, not 1.0
            ],
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('must sum to 1.0'))).toBe(true);
    });

    it('should reject empty hypothesis set in mass assignment', async () => {
      const thought: EvidentialThought = {
        id: 'ev-10',
        sessionId: 'session-1',
        mode: 'evidential',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Empty hypothesis set',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'belief_assignment',
        beliefFunctions: [
          {
            id: 'bf1',
            source: 'e1',
            massAssignments: [
              {
                hypothesisSet: [], // Invalid: empty
                mass: 1.0,
                justification: 'Test',
              },
            ],
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      // Check for hypothesis set validation error - matches both old and new message formats
      expect(errors.some(e => e.description.toLowerCase().includes('hypothesis') &&
        (e.description.includes('at least') || e.description.includes('empty')))).toBe(true);
    });
  });

  describe('Plausibility validation', () => {
    it('should accept valid plausibility function', async () => {
      const thought: EvidentialThought = {
        id: 'ev-11',
        sessionId: 'session-1',
        mode: 'evidential',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Plausibility calculation',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'evidence_combination',
        plausibility: {
          id: 'pl1',
          assignments: [
            {
              hypothesisSet: ['h1'],
              plausibility: 0.9,
              belief: 0.6,
              uncertaintyInterval: [0.6, 0.9],
            },
          ],
        },
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });

    it('should reject belief exceeding plausibility', async () => {
      const thought: EvidentialThought = {
        id: 'ev-12',
        sessionId: 'session-1',
        mode: 'evidential',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Invalid plausibility',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'evidence_combination',
        plausibility: {
          id: 'pl1',
          assignments: [
            {
              hypothesisSet: ['h1'],
              plausibility: 0.5,
              belief: 0.9, // Invalid: belief > plausibility
              uncertaintyInterval: [0.9, 0.5],
            },
          ],
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('cannot exceed plausibility'))).toBe(true);
    });

    it('should reject mismatched uncertainty interval', async () => {
      const thought: EvidentialThought = {
        id: 'ev-13',
        sessionId: 'session-1',
        mode: 'evidential',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Mismatched interval',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'evidence_combination',
        plausibility: {
          id: 'pl1',
          assignments: [
            {
              hypothesisSet: ['h1'],
              plausibility: 0.9,
              belief: 0.6,
              uncertaintyInterval: [0.5, 0.8], // Should be [0.6, 0.9]
            },
          ],
        },
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('Uncertainty interval'))).toBe(true);
    });
  });

  describe('Decision validation', () => {
    it('should accept valid decision with confidence', async () => {
      const thought: EvidentialThought = {
        id: 'ev-14',
        sessionId: 'session-1',
        mode: 'evidential',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Decision analysis',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'decision_analysis',
        hypotheses: [
          { id: 'h1', name: 'H1', description: 'Hypothesis 1', mutuallyExclusive: true },
        ],
        decisions: [
          {
            id: 'd1',
            name: 'Select primary hypothesis',
            selectedHypothesis: ['h1'],
            confidence: 0.85,
            reasoning: 'Highest belief and plausibility',
            alternatives: [],
          },
        ],
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });

    it('should reject decision selecting unknown hypothesis', async () => {
      const thought: EvidentialThought = {
        id: 'ev-15',
        sessionId: 'session-1',
        mode: 'evidential',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Invalid decision',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'decision_analysis',
        hypotheses: [
          { id: 'h1', name: 'H1', description: 'Hypothesis 1', mutuallyExclusive: true },
        ],
        decisions: [
          {
            id: 'd1',
            name: 'Select unknown',
            selectedHypothesis: ['h-nonexistent'],
            confidence: 0.8,
            reasoning: 'Test',
            alternatives: [],
          },
        ],
      };

      const result = await validator.validate(thought);
      expect(result.isValid).toBe(false);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.some(e => e.description.includes('unknown hypothesis'))).toBe(true);
    });
  });

  describe('Complete evidential scenario', () => {
    it('should accept comprehensive sensor fusion example', async () => {
      const thought: EvidentialThought = {
        id: 'ev-complete',
        sessionId: 'session-1',
        mode: 'evidential',
        thoughtNumber: 1,
        totalThoughts: 1,
        content: 'Sensor fusion for obstacle detection',
        timestamp: new Date(),
        nextThoughtNeeded: false,
        thoughtType: 'evidence_combination',
        frameOfDiscernment: ['obstacle', 'no-obstacle'],
        hypotheses: [
          {
            id: 'obstacle',
            name: 'Obstacle present',
            description: 'Object detected in path',
            mutuallyExclusive: true,
          },
          {
            id: 'no-obstacle',
            name: 'No obstacle',
            description: 'Path is clear',
            mutuallyExclusive: true,
          },
        ],
        evidence: [
          {
            id: 'radar',
            description: 'Radar sensor reading',
            source: 'radar-unit-1',
            reliability: 0.9,
            timestamp: Date.now(),
            supports: ['obstacle'],
          },
          {
            id: 'lidar',
            description: 'LIDAR sensor reading',
            source: 'lidar-unit-1',
            reliability: 0.95,
            timestamp: Date.now(),
            supports: ['obstacle'],
          },
          {
            id: 'camera',
            description: 'Camera visual',
            source: 'camera-front',
            reliability: 0.85,
            timestamp: Date.now(),
            supports: ['no-obstacle'],
          },
        ],
        beliefFunctions: [
          {
            id: 'bf-radar',
            source: 'radar',
            massAssignments: [
              {
                hypothesisSet: ['obstacle'],
                mass: 0.8,
                justification: 'Strong radar return signal',
              },
              {
                hypothesisSet: ['obstacle', 'no-obstacle'],
                mass: 0.2,
                justification: 'Uncertainty in radar reading',
              },
            ],
          },
          {
            id: 'bf-lidar',
            source: 'lidar',
            massAssignments: [
              {
                hypothesisSet: ['obstacle'],
                mass: 0.9,
                justification: 'Clear LIDAR point cloud',
              },
              {
                hypothesisSet: ['obstacle', 'no-obstacle'],
                mass: 0.1,
                justification: 'Minor uncertainty',
              },
            ],
          },
          {
            id: 'bf-camera',
            source: 'camera',
            massAssignments: [
              {
                hypothesisSet: ['no-obstacle'],
                mass: 0.6,
                justification: 'No visual obstruction detected',
              },
              {
                hypothesisSet: ['obstacle', 'no-obstacle'],
                mass: 0.4,
                justification: 'Possible lighting interference',
              },
            ],
          },
        ],
        combinedBelief: {
          id: 'combined-sensors',
          source: 'combined',
          massAssignments: [
            {
              hypothesisSet: ['obstacle'],
              mass: 0.85,
              justification: 'Dempster combination of radar and LIDAR',
            },
            {
              hypothesisSet: ['obstacle', 'no-obstacle'],
              mass: 0.15,
              justification: 'Residual uncertainty',
            },
          ],
          conflictMass: 0.05,
        },
        plausibility: {
          id: 'pl-combined',
          assignments: [
            {
              hypothesisSet: ['obstacle'],
              plausibility: 1.0,
              belief: 0.85,
              uncertaintyInterval: [0.85, 1.0],
            },
            {
              hypothesisSet: ['no-obstacle'],
              plausibility: 0.15,
              belief: 0.0,
              uncertaintyInterval: [0.0, 0.15],
            },
          ],
        },
        decisions: [
          {
            id: 'brake-decision',
            name: 'Apply emergency brakes',
            selectedHypothesis: ['obstacle'],
            confidence: 0.85,
            reasoning: 'High belief in obstacle presence justifies braking',
            alternatives: [
              {
                hypothesis: ['no-obstacle'],
                expectedUtility: -0.2,
                risk: 0.9,
              },
            ],
          },
        ],
      };

      const result = await validator.validate(thought);
      const errors = result.issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });
  });
});
