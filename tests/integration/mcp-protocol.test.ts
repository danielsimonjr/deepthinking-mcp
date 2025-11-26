/**
 * MCP Protocol Compliance Integration Tests
 * Tests DeepThinking MCP server compliance with MCP protocol specification
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { SessionManager } from '../../src/session/index.js';
import { ThinkingToolSchema, thinkingTool } from '../../src/tools/thinking.js';
import { ThinkingMode } from '../../src/types/index.js';

describe('MCP Protocol Compliance', () => {
  describe('Tool Schema Compliance', () => {
    it('should export thinkingTool with valid MCP tool structure', () => {
      expect(thinkingTool).toBeDefined();
      expect(thinkingTool.name).toBe('deepthinking');
      expect(thinkingTool.description).toBeDefined();
      expect(typeof thinkingTool.description).toBe('string');
      expect(thinkingTool.inputSchema).toBeDefined();
      expect(thinkingTool.inputSchema.type).toBe('object');
      expect(thinkingTool.inputSchema.properties).toBeDefined();
      expect(thinkingTool.inputSchema.required).toBeDefined();
      expect(Array.isArray(thinkingTool.inputSchema.required)).toBe(true);
    });

    it('should have all required properties in inputSchema', () => {
      const required = thinkingTool.inputSchema.required || [];
      expect(required).toContain('thought');
      expect(required).toContain('thoughtNumber');
      expect(required).toContain('totalThoughts');
      expect(required).toContain('nextThoughtNeeded');
    });

    it('should define all action enum values correctly', () => {
      const properties = thinkingTool.inputSchema.properties || {};
      expect(properties.action).toBeDefined();
      expect(properties.action.enum).toBeDefined();
      expect(properties.action.enum).toContain('add_thought');
      expect(properties.action.enum).toContain('summarize');
      expect(properties.action.enum).toContain('export');
      expect(properties.action.enum).toContain('switch_mode');
      expect(properties.action.enum).toContain('get_session');
      expect(properties.action.enum).toContain('recommend_mode');
    });

    it('should define all 18 thinking modes in mode enum', () => {
      const properties = thinkingTool.inputSchema.properties || {};
      expect(properties.mode).toBeDefined();
      expect(properties.mode.enum).toBeDefined();
      expect(properties.mode.enum).toHaveLength(18);
      expect(properties.mode.enum).toContain('sequential');
      expect(properties.mode.enum).toContain('shannon');
      expect(properties.mode.enum).toContain('mathematics');
      expect(properties.mode.enum).toContain('physics');
      expect(properties.mode.enum).toContain('hybrid');
      expect(properties.mode.enum).toContain('abductive');
      expect(properties.mode.enum).toContain('causal');
      expect(properties.mode.enum).toContain('bayesian');
      expect(properties.mode.enum).toContain('counterfactual');
      expect(properties.mode.enum).toContain('analogical');
      expect(properties.mode.enum).toContain('temporal');
      expect(properties.mode.enum).toContain('gametheory');
      expect(properties.mode.enum).toContain('evidential');
      expect(properties.mode.enum).toContain('firstprinciples');
      expect(properties.mode.enum).toContain('systemsthinking');
      expect(properties.mode.enum).toContain('scientificmethod');
      expect(properties.mode.enum).toContain('optimization');
      expect(properties.mode.enum).toContain('formallogic');
    });

    it('should define all 8 export formats correctly', () => {
      const properties = thinkingTool.inputSchema.properties || {};
      expect(properties.exportFormat).toBeDefined();
      expect(properties.exportFormat.enum).toBeDefined();
      expect(properties.exportFormat.enum).toHaveLength(8);
      expect(properties.exportFormat.enum).toContain('json');
      expect(properties.exportFormat.enum).toContain('markdown');
      expect(properties.exportFormat.enum).toContain('latex');
      expect(properties.exportFormat.enum).toContain('html');
      expect(properties.exportFormat.enum).toContain('jupyter');
      expect(properties.exportFormat.enum).toContain('mermaid');
      expect(properties.exportFormat.enum).toContain('dot');
      expect(properties.exportFormat.enum).toContain('ascii');
    });
  });

  describe('Parameter Validation', () => {
    it('should accept valid add_thought request', () => {
      const input = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'sequential',
      };

      const result = ThinkingToolSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject missing required field (thought)', () => {
      const input = {
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
      };

      const result = ThinkingToolSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject missing required field (thoughtNumber)', () => {
      const input = {
        thought: 'Test',
        totalThoughts: 5,
        nextThoughtNeeded: true,
      };

      const result = ThinkingToolSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject missing required field (totalThoughts)', () => {
      const input = {
        thought: 'Test',
        thoughtNumber: 1,
        nextThoughtNeeded: true,
      };

      const result = ThinkingToolSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject missing required field (nextThoughtNeeded)', () => {
      const input = {
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 5,
      };

      const result = ThinkingToolSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject invalid mode value', () => {
      const input = {
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mode: 'invalid_mode',
      };

      const result = ThinkingToolSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject thoughtNumber less than 1', () => {
      const input = {
        thought: 'Test',
        thoughtNumber: 0,
        totalThoughts: 5,
        nextThoughtNeeded: true,
      };

      const result = ThinkingToolSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject negative thoughtNumber', () => {
      const input = {
        thought: 'Test',
        thoughtNumber: -1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
      };

      const result = ThinkingToolSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject uncertainty below 0', () => {
      const input = {
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        uncertainty: -0.1,
      };

      const result = ThinkingToolSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject uncertainty above 1', () => {
      const input = {
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        uncertainty: 1.1,
      };

      const result = ThinkingToolSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept uncertainty at boundary values (0 and 1)', () => {
      const input1 = {
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        uncertainty: 0,
      };
      const result1 = ThinkingToolSchema.safeParse(input1);
      expect(result1.success).toBe(true);

      const input2 = {
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        uncertainty: 1,
      };
      const result2 = ThinkingToolSchema.safeParse(input2);
      expect(result2.success).toBe(true);
    });

    it('should accept valid Shannon stage values', () => {
      const stages = ['problem_definition', 'constraints', 'model', 'proof', 'implementation'];

      for (const stage of stages) {
        const input = {
          thought: 'Test',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          stage,
        };
        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid Shannon stage value', () => {
      const input = {
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        stage: 'invalid_stage',
      };

      const result = ThinkingToolSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept valid mathematicalModel structure', () => {
      const input = {
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mathematicalModel: {
          latex: 'x^2 + y^2 = z^2',
          symbolic: 'pythagoras',
          ascii: 'x^2 + y^2 = z^2',
        },
      };

      const result = ThinkingToolSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject mathematicalModel missing required field', () => {
      const input = {
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        mathematicalModel: {
          latex: 'x^2 + y^2 = z^2',
          // Missing symbolic field
        },
      };

      const result = ThinkingToolSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept valid proofStrategy structure', () => {
      const input = {
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        proofStrategy: {
          type: 'direct',
          steps: ['Step 1', 'Step 2', 'Step 3'],
        },
      };

      const result = ThinkingToolSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept all proof strategy types', () => {
      const types = ['direct', 'contradiction', 'induction', 'construction', 'contrapositive'];

      for (const type of types) {
        const input = {
          thought: 'Test',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          proofStrategy: {
            type,
            steps: ['Step 1'],
          },
        };
        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });

    it('should accept valid tensorProperties structure', () => {
      const input = {
        thought: 'Test',
        thoughtNumber: 1,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        tensorProperties: {
          rank: [2, 0],
          components: 'T^{μν}',
          latex: 'T^{\\mu\\nu}',
          symmetries: ['symmetric'],
          invariants: ['trace'],
          transformation: 'contravariant',
        },
      };

      const result = ThinkingToolSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept all transformation types', () => {
      const transformations = ['covariant', 'contravariant', 'mixed'];

      for (const transformation of transformations) {
        const input = {
          thought: 'Test',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
          tensorProperties: {
            rank: [2, 0],
            components: 'T',
            latex: 'T',
            symmetries: [],
            invariants: [],
            transformation,
          },
        };
        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Action-Specific Parameter Validation', () => {
    describe('switch_mode action', () => {
      it('should accept valid switch_mode parameters', () => {
        const input = {
          thought: 'Switching mode',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          sessionId: 'test-session',
          newMode: 'sequential',
        };

        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept all valid newMode values', () => {
        const modes = [
          'sequential',
          'shannon',
          'mathematics',
          'physics',
          'hybrid',
          'abductive',
          'causal',
          'bayesian',
          'counterfactual',
          'analogical',
          'temporal',
          'gametheory',
          'evidential',
        ];

        for (const newMode of modes) {
          const input = {
            thought: 'Switching mode',
            thoughtNumber: 1,
            totalThoughts: 1,
            nextThoughtNeeded: false,
            newMode,
          };
          const result = ThinkingToolSchema.safeParse(input);
          expect(result.success).toBe(true);
        }
      });
    });

    describe('export action', () => {
      it('should accept valid export parameters', () => {
        const input = {
          thought: 'Exporting session',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          sessionId: 'test-session',
          exportFormat: 'json',
        };

        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    describe('recommend_mode action', () => {
      it('should accept problemType for quick recommendations', () => {
        const input = {
          thought: 'Recommending mode',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          problemType: 'debugging',
        };

        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept problemCharacteristics for comprehensive recommendations', () => {
        const input = {
          thought: 'Recommending mode',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          problemCharacteristics: {
            domain: 'software',
            complexity: 'medium',
            uncertainty: 'high',
            timeDependent: false,
            multiAgent: false,
            requiresProof: false,
            requiresQuantification: false,
            hasIncompleteInfo: true,
            requiresExplanation: true,
            hasAlternatives: true,
          },
        };

        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept includeCombinations flag', () => {
        const input = {
          thought: 'Recommending mode',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          problemType: 'strategy',
          includeCombinations: true,
        };

        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Mode-Specific Parameter Validation', () => {
    describe('Causal mode', () => {
      it('should accept valid causalGraph structure', () => {
        const input = {
          thought: 'Causal analysis',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          mode: 'causal',
          causalGraph: {
            nodes: [
              { id: 'node1', name: 'Node 1', type: 'cause', description: 'A cause' },
              { id: 'node2', name: 'Node 2', type: 'effect', description: 'An effect' },
            ],
            edges: [
              { from: 'node1', to: 'node2', strength: 0.8, confidence: 0.9 },
            ],
          },
        };

        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should reject edge confidence outside range (0 to 1)', () => {
        const input = {
          thought: 'Causal analysis',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          mode: 'causal',
          causalGraph: {
            nodes: [
              { id: 'node1', name: 'Node 1', type: 'cause', description: 'A cause' },
              { id: 'node2', name: 'Node 2', type: 'effect', description: 'An effect' },
            ],
            edges: [
              { from: 'node1', to: 'node2', strength: 0.8, confidence: 1.5 },
            ],
          },
        };

        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });

    describe('Bayesian mode', () => {
      it('should accept valid prior and posterior probability structures', () => {
        const input = {
          thought: 'Bayesian update',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          mode: 'bayesian',
          prior: {
            probability: 0.3,
            justification: 'Prior knowledge',
          },
          posterior: {
            probability: 0.7,
            calculation: 'Bayesian update calculation',
          },
        };

        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should reject prior probability values outside 0-1 range', () => {
        const input = {
          thought: 'Bayesian update',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          mode: 'bayesian',
          prior: {
            probability: 1.5,
            justification: 'Invalid probability',
          },
        };

        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });

    describe('Temporal mode', () => {
      it('should accept valid timeline structure', () => {
        const input = {
          thought: 'Temporal analysis',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          mode: 'temporal',
          timeline: {
            id: 'timeline1',
            name: 'Test Timeline',
            timeUnit: 'seconds',
            events: ['event1', 'event2'],
            startTime: 0,
            endTime: 100,
          },
        };

        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept all valid time units', () => {
        const timeUnits = ['milliseconds', 'seconds', 'minutes', 'hours', 'days', 'months', 'years'];

        for (const timeUnit of timeUnits) {
          const input = {
            thought: 'Temporal analysis',
            thoughtNumber: 1,
            totalThoughts: 1,
            nextThoughtNeeded: false,
            mode: 'temporal',
            timeline: {
              id: 'timeline1',
              name: 'Test Timeline',
              timeUnit,
              events: [],
            },
          };
          const result = ThinkingToolSchema.safeParse(input);
          expect(result.success).toBe(true);
        }
      });
    });

    describe('Game Theory mode', () => {
      it('should accept valid players structure', () => {
        const input = {
          thought: 'Game theory analysis',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          mode: 'gametheory',
          players: [
            {
              id: 'player1',
              name: 'Player 1',
              isRational: true,
              availableStrategies: ['strategy1', 'strategy2'],
            },
          ],
        };

        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept valid payoff matrix', () => {
        const input = {
          thought: 'Game theory analysis',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          mode: 'gametheory',
          payoffMatrix: {
            players: ['player1', 'player2'],
            dimensions: [2, 2],
            payoffs: [
              { strategyProfile: ['s1', 's1'], payoffs: [3, 3] },
              { strategyProfile: ['s1', 's2'], payoffs: [0, 5] },
            ],
          },
        };

        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    describe('Evidential mode', () => {
      it('should accept valid frame of discernment', () => {
        const input = {
          thought: 'Evidential reasoning',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          mode: 'evidential',
          frameOfDiscernment: ['h1', 'h2', 'h3'],
        };

        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should accept valid belief functions with mass assignments', () => {
        const input = {
          thought: 'Evidential reasoning',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          mode: 'evidential',
          beliefFunctions: [
            {
              id: 'bf1',
              source: 'evidence1',
              massAssignments: [
                {
                  hypothesisSet: ['h1'],
                  mass: 0.6,
                  justification: 'Strong evidence for h1',
                },
                {
                  hypothesisSet: ['h2'],
                  mass: 0.3,
                  justification: 'Moderate evidence for h2',
                },
              ],
            },
          ],
        };

        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(true);
      });

      it('should reject belief mass outside 0-1 range', () => {
        const input = {
          thought: 'Evidential reasoning',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
          mode: 'evidential',
          beliefFunctions: [
            {
              id: 'bf1',
              source: 'evidence1',
              massAssignments: [
                {
                  hypothesisSet: ['h1'],
                  mass: 1.5,
                  justification: 'Invalid mass',
                },
              ],
            },
          ],
        };

        const result = ThinkingToolSchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('MCP Response Format Compliance', () => {
    let sessionManager: SessionManager;

    beforeEach(() => {
      sessionManager = new SessionManager();
    });

    it('should return MCP-compliant response for successful operation', async () => {
      const session = await sessionManager.createSession({
        mode: ThinkingMode.SEQUENTIAL,
        title: 'Test Session',
      });

      // Check session response structure
      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(typeof session.id).toBe('string');
      expect(session.mode).toBe(ThinkingMode.SEQUENTIAL);
    });

    it('should return null for non-existent session', async () => {
      const result = await sessionManager.getSession('non-existent-session');
      expect(result).toBeNull();
    });
  });
});
