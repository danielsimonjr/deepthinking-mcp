/**
 * ModalHandler Unit Tests - Phase 15 (v8.4.0)
 *
 * Tests for the Modal reasoning handler:
 * - Possible worlds semantics
 * - Necessity and possibility operators
 * - Accessibility relations
 * - Multi-modal logic support
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ModalHandler } from '../../../../src/modes/handlers/ModalHandler.js';
import { ThinkingMode } from '../../../../src/types/core.js';
import type { ThinkingToolInput } from '../../../../src/tools/thinking.js';

describe('ModalHandler', () => {
  let handler: ModalHandler;

  beforeEach(() => {
    handler = new ModalHandler();
  });

  describe('properties', () => {
    it('should have correct mode', () => {
      expect(handler.mode).toBe(ThinkingMode.MODAL);
    });

    it('should have correct modeName', () => {
      expect(handler.modeName).toBe('Modal Reasoning');
    });

    it('should have descriptive description', () => {
      expect(handler.description).toContain('necessity');
      expect(handler.description).toContain('possibility');
      expect(handler.description).toContain('possible worlds');
    });
  });

  describe('createThought', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Analyzing modal proposition',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'modal',
    };

    it('should create thought with default thought type', () => {
      const thought = handler.createThought(baseInput, 'session-123');

      expect(thought.mode).toBe(ThinkingMode.MODAL);
      expect(thought.thoughtType).toBe('proposition_analysis');
      expect(thought.content).toBe(baseInput.thought);
    });

    it('should create thought with specified thought type', () => {
      const input = { ...baseInput, thoughtType: 'necessity_proof' } as any;
      const thought = handler.createThought(input, 'session-123');

      expect(thought.thoughtType).toBe('necessity_proof');
    });

    it('should create default world when none provided', () => {
      const thought = handler.createThought(baseInput, 'session-123');

      expect(thought.worlds).toHaveLength(1);
      expect(thought.worlds[0].name).toBe('w0');
      expect(thought.worlds[0].isActual).toBe(true);
    });

    it('should process provided worlds', () => {
      const input = {
        ...baseInput,
        worlds: [
          { id: 'w1', name: 'Actual World', isActual: true, propositions: { p: true, q: false } },
          { id: 'w2', name: 'Alternative', isActual: false, propositions: { p: false, q: true } },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.worlds).toHaveLength(2);
      expect(thought.worlds[0].propositions.p).toBe(true);
      expect(thought.actualWorld).toBe('w1');
    });

    it('should process propositions', () => {
      const input = {
        ...baseInput,
        worlds: [
          { id: 'w1', propositions: { p: true } },
          { id: 'w2', propositions: { p: false } },
        ],
        propositions: [
          { content: 'p', operator: 'contingent' },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.propositions).toHaveLength(1);
      expect(thought.propositions[0].worldsTrue).toContain('w1');
      expect(thought.propositions[0].worldsFalse).toContain('w2');
    });

    it('should process accessibility relations', () => {
      const input = {
        ...baseInput,
        worlds: [
          { id: 'w1', name: 'World 1' },
          { id: 'w2', name: 'World 2' },
        ],
        accessibilityRelations: [
          { fromWorld: 'w1', toWorld: 'w2', type: 'reflexive' },
          { fromWorld: 'w2', toWorld: 'w1', type: 'symmetric' },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.accessibilityRelations).toHaveLength(2);
      expect(thought.accessibilityRelations[0].fromWorld).toBe('w1');
    });

    it('should use default logic system K', () => {
      const thought = handler.createThought(baseInput, 'session-123');

      expect(thought.modalLogicType).toBe('K');
    });

    it('should use specified logic system', () => {
      const input = { ...baseInput, modalLogicType: 'S5' } as any;
      const thought = handler.createThought(input, 'session-123');

      expect(thought.modalLogicType).toBe('S5');
    });

    it('should use default modal domain alethic', () => {
      const thought = handler.createThought(baseInput, 'session-123');

      expect(thought.modalDomain).toBe('alethic');
    });

    it('should use specified modal domain', () => {
      const input = { ...baseInput, modalDomain: 'epistemic' } as any;
      const thought = handler.createThought(input, 'session-123');

      expect(thought.modalDomain).toBe('epistemic');
    });

    it('should process modal inferences', () => {
      const input = {
        ...baseInput,
        inferences: [
          {
            premises: ['□p', 'p → q'],
            conclusion: '□q',
            rule: 'K axiom',
            valid: true,
            justification: 'Distribution axiom',
          },
        ],
      } as any;

      const thought = handler.createThought(input, 'session-123');

      expect(thought.inferences).toHaveLength(1);
      expect(thought.inferences![0].valid).toBe(true);
    });
  });

  describe('validate', () => {
    const baseInput: ThinkingToolInput = {
      thought: 'Modal reasoning',
      thoughtNumber: 1,
      totalThoughts: 5,
      nextThoughtNeeded: true,
      mode: 'modal',
    };

    it('should return valid for well-formed input', () => {
      const result = handler.validate(baseInput);
      expect(result.valid).toBe(true);
    });

    it('should fail for empty thought', () => {
      const input = { ...baseInput, thought: '' };
      const result = handler.validate(input);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'EMPTY_THOUGHT')).toBe(true);
    });

    it('should warn for unknown thought type', () => {
      const input = { ...baseInput, thoughtType: 'invalid' } as any;
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'thoughtType')).toBe(true);
    });

    it('should warn for unknown logic system', () => {
      const input = { ...baseInput, modalLogicType: 'S99' } as any;
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'modalLogicType')).toBe(true);
    });

    it('should warn for unknown modal domain', () => {
      const input = { ...baseInput, modalDomain: 'unknown_domain' } as any;
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.field === 'modalDomain')).toBe(true);
    });

    it('should warn about modal proofs without worlds', () => {
      const input = { ...baseInput, thoughtType: 'necessity_proof' } as any;
      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('without defined worlds'))).toBe(true);
    });

    it('should warn about accessibility relation referencing unknown world', () => {
      const input = {
        ...baseInput,
        worlds: [{ id: 'w1' }],
        accessibilityRelations: [{ fromWorld: 'w1', toWorld: 'nonexistent' }],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('unknown world'))).toBe(true);
    });

    it('should warn about S5 requiring universal accessibility', () => {
      const input = {
        ...baseInput,
        modalLogicType: 'S5',
        worlds: [{ id: 'w1' }, { id: 'w2' }],
      } as any;

      const result = handler.validate(input);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.message.includes('universal accessibility'))).toBe(true);
    });

    it('should accept all valid logic systems', () => {
      const systems = ['K', 'T', 'S4', 'S5', 'D', 'B', 'custom'];

      for (const system of systems) {
        const input = { ...baseInput, modalLogicType: system } as any;
        const result = handler.validate(input);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.field === 'modalLogicType')).toBe(false);
      }
    });

    it('should accept all valid modal domains', () => {
      const domains = ['alethic', 'epistemic', 'deontic', 'temporal'];

      for (const domain of domains) {
        const input = { ...baseInput, modalDomain: domain } as any;
        const result = handler.validate(input);

        expect(result.valid).toBe(true);
        expect(result.warnings.some((w) => w.field === 'modalDomain')).toBe(false);
      }
    });
  });

  describe('getEnhancements', () => {
    const createThought = (overrides: any = {}) => {
      const baseInput: ThinkingToolInput = {
        thought: 'Modal analysis',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'modal',
        ...overrides,
      };
      return handler.createThought(baseInput, 'session-123');
    };

    it('should include related modes', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.relatedModes).toContain(ThinkingMode.FORMALLOGIC);
      expect(enhancements.relatedModes).toContain(ThinkingMode.COUNTERFACTUAL);
      expect(enhancements.relatedModes).toContain(ThinkingMode.DEDUCTIVE);
    });

    it('should include mental models', () => {
      const thought = createThought();
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.mentalModels).toContain('Possible Worlds Semantics');
      expect(enhancements.mentalModels).toContain('Kripke Frames');
      expect(enhancements.mentalModels).toContain('Accessibility Relations');
    });

    it('should calculate metrics', () => {
      const thought = createThought({
        worlds: [{ id: 'w1' }, { id: 'w2' }, { id: 'w3' }],
        propositions: [{ content: 'p' }, { content: 'q' }],
        accessibilityRelations: [{ fromWorld: 'w1', toWorld: 'w2' }],
        inferences: [{ premises: ['p'], conclusion: 'q', valid: true }],
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.metrics!.worldCount).toBe(3);
      expect(enhancements.metrics!.propositionCount).toBe(2);
      expect(enhancements.metrics!.relationCount).toBe(1);
      expect(enhancements.metrics!.inferenceCount).toBe(1);
    });

    it('should provide logic system properties', () => {
      const thought = createThought({ modalLogicType: 'S5' });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('S5'))).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('reflexive'))).toBe(true);
    });

    it('should provide world definition guidance', () => {
      const thought = createThought({ thoughtType: 'world_definition' });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('propositions are true'))).toBe(true);
    });

    it('should provide necessity proof guidance', () => {
      const thought = createThought({ thoughtType: 'necessity_proof' });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('ALL accessible worlds'))).toBe(true);
    });

    it('should provide possibility proof guidance', () => {
      const thought = createThought({ thoughtType: 'possibility_proof' });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.guidingQuestions!.some((q) => q.includes('AT LEAST ONE'))).toBe(true);
    });

    it('should provide epistemic domain guidance', () => {
      const thought = createThought({ modalDomain: 'epistemic' });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('agent knows'))).toBe(true);
      expect(enhancements.mentalModels).toContain('Knowledge States');
    });

    it('should provide deontic domain guidance', () => {
      const thought = createThought({ modalDomain: 'deontic' });
      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.suggestions!.some((s) => s.includes('obligatory'))).toBe(true);
      expect(enhancements.mentalModels).toContain('Moral Obligations');
    });

    it('should warn about single world collapsing distinctions', () => {
      const thought = createThought({
        worlds: [{ id: 'w1', isActual: true }],
      });

      const enhancements = handler.getEnhancements(thought);

      expect(enhancements.warnings!.some((w) => w.includes('Only one world'))).toBe(true);
    });
  });

  describe('supportsThoughtType', () => {
    it('should support world_definition', () => {
      expect(handler.supportsThoughtType('world_definition')).toBe(true);
    });

    it('should support proposition_analysis', () => {
      expect(handler.supportsThoughtType('proposition_analysis')).toBe(true);
    });

    it('should support accessibility_analysis', () => {
      expect(handler.supportsThoughtType('accessibility_analysis')).toBe(true);
    });

    it('should support necessity_proof', () => {
      expect(handler.supportsThoughtType('necessity_proof')).toBe(true);
    });

    it('should support possibility_proof', () => {
      expect(handler.supportsThoughtType('possibility_proof')).toBe(true);
    });

    it('should support modal_inference', () => {
      expect(handler.supportsThoughtType('modal_inference')).toBe(true);
    });

    it('should support countermodel', () => {
      expect(handler.supportsThoughtType('countermodel')).toBe(true);
    });

    it('should not support unknown types', () => {
      expect(handler.supportsThoughtType('unknown')).toBe(false);
    });
  });

  describe('end-to-end flow', () => {
    it('should handle S5 necessity proof', () => {
      const sessionId = 's5-proof-session';

      const input = {
        thought: 'Proving necessarily p in S5 logic with universal accessibility',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'modal',
        thoughtType: 'necessity_proof',
        modalLogicType: 'S5',
        modalDomain: 'alethic',
        worlds: [
          { id: 'w1', name: 'Actual', isActual: true, propositions: { p: true } },
          { id: 'w2', name: 'World 2', isActual: false, propositions: { p: true } },
          { id: 'w3', name: 'World 3', isActual: false, propositions: { p: true } },
        ],
        accessibilityRelations: [
          { fromWorld: 'w1', toWorld: 'w2' },
          { fromWorld: 'w1', toWorld: 'w3' },
          { fromWorld: 'w2', toWorld: 'w1' },
          { fromWorld: 'w2', toWorld: 'w3' },
          { fromWorld: 'w3', toWorld: 'w1' },
          { fromWorld: 'w3', toWorld: 'w2' },
        ],
        propositions: [{ content: 'p', operator: 'necessary' }],
      } as any;

      const thought = handler.createThought(input, sessionId);
      const validation = handler.validate(input);
      const enhancements = handler.getEnhancements(thought);

      expect(thought.modalLogicType).toBe('S5');
      expect(thought.worlds).toHaveLength(3);
      expect(validation.valid).toBe(true);
      expect(enhancements.suggestions!.some((s) => s.includes('S5'))).toBe(true);
    });

    it('should handle epistemic reasoning', () => {
      const sessionId = 'epistemic-session';

      const input = {
        thought: 'Agent knows that p but is uncertain about q',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
        mode: 'modal',
        thoughtType: 'proposition_analysis',
        modalLogicType: 'S5',
        modalDomain: 'epistemic',
        worlds: [
          { id: 'w1', name: 'Actual', isActual: true, propositions: { p: true, q: true } },
          { id: 'w2', name: 'Epistemic alternative', isActual: false, propositions: { p: true, q: false } },
        ],
        accessibilityRelations: [
          { fromWorld: 'w1', toWorld: 'w2' },
          { fromWorld: 'w2', toWorld: 'w1' },
        ],
        propositions: [
          { content: 'p', operator: 'necessary' },
          { content: 'q', operator: 'contingent' },
        ],
      } as any;

      const thought = handler.createThought(input, sessionId);
      const enhancements = handler.getEnhancements(thought);

      expect(thought.modalDomain).toBe('epistemic');
      expect(enhancements.suggestions!.some((s) => s.includes('agent knows'))).toBe(true);
      expect(enhancements.mentalModels).toContain('Knowledge States');
    });

    it('should handle countermodel construction', () => {
      const sessionId = 'countermodel-session';

      const input = {
        thought: 'Constructing countermodel to show ◇p → □◇p fails in K',
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        mode: 'modal',
        thoughtType: 'countermodel',
        modalLogicType: 'K',
        modalDomain: 'alethic',
        worlds: [
          { id: 'w0', name: 'w0', isActual: true, propositions: {} },
          { id: 'w1', name: 'w1', isActual: false, propositions: { p: true } },
          { id: 'w2', name: 'w2', isActual: false, propositions: { p: false } },
        ],
        accessibilityRelations: [
          { fromWorld: 'w0', toWorld: 'w1' },
          { fromWorld: 'w1', toWorld: 'w2' },
        ],
      } as any;

      const thought = handler.createThought(input, sessionId);
      const enhancements = handler.getEnhancements(thought);

      expect(thought.thoughtType).toBe('countermodel');
      expect(thought.modalLogicType).toBe('K');
      expect(enhancements.guidingQuestions!.some((q) => q.includes('falsifies'))).toBe(true);
    });
  });
});
