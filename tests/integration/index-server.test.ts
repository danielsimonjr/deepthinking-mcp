/**
 * Entry-Point Dispatch Tests
 *
 * This file exists because of a specific, expensive failure: `src/index.ts`
 * called `main()` at module scope, so importing it started a stdio server.
 * Nothing could import it -- verified by grep, ZERO files in `src/` or `tests/`
 * referenced it -- and so its 973 lines, holding all 13 tool handlers and the
 * whole `CallToolRequestSchema` dispatch, had no test that ran them.
 *
 * `tests/integration/index-handlers.test.ts` (1,087 lines) papered over the gap
 * by RE-IMPLEMENTING the handlers against `SessionManager`. That is worse than
 * no coverage: it goes green whether or not the real handler still exists, so
 * the real one can rot, be bypassed, or silently drop a field, and the suite
 * never notices. That is how ~62 files went dead behind a green build.
 *
 * These tests drive the REAL server object over an in-memory transport, using a
 * real MCP `Client`. Every assertion below travels the actual production path:
 *   Client -> transport -> CallToolRequestSchema handler -> isValidTool ->
 *   Zod parse -> handleAddThought/handleSessionAction -> ThoughtFactory ->
 *   ModeHandlerRegistry -> SessionManager
 * Nothing is re-implemented. If a handler is deleted or unregistered, these
 * fail.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

// The import that was impossible before the entry-point guard.
import { server } from '../../src/index.js';

let client: Client;

beforeAll(async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: 'dispatch-test', version: '1.0.0' }, { capabilities: {} });
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
});

afterAll(async () => {
  await client.close();
});

/** Parse the JSON payload out of an MCP tool result's first text block. */
function payloadOf(result: any): any {
  expect(result.isError, `tool call errored: ${result.content?.[0]?.text}`).toBeFalsy();
  return JSON.parse(result.content[0].text);
}

// ===========================================================================
// The import itself is the first assertion
// ===========================================================================

describe('entry point: the module can be imported without starting a server', () => {
  /**
   * If the entry-point guard regressed to starting unconditionally, this file
   * would not reach `beforeAll` at all: the module-scope `main()` would claim
   * the server first and `beforeAll` would die with "Already connected to a
   * transport". A whole-file setup failure is therefore the EXPECTED signal for
   * that regression, not a flake -- verified by mutation. Reaching a connected
   * client at all proves the guard holds under an import.
   */
  it('imported src/index.ts and reached a live client', () => {
    expect(server).toBeDefined();
    expect(client).toBeDefined();
  });

  it('did not attach the server to this process stdio', () => {
    // A StdioServerTransport puts stdin into flowing mode. Under vitest the
    // process stdin must still be paused/unreferenced.
    expect(process.stdin.readableFlowing).not.toBe(true);
  });
});

// ===========================================================================
// tools/list -- the real ListToolsRequestSchema handler
// ===========================================================================

describe('entry point: tools/list over a real transport', () => {
  it('returns exactly the 13 focused tools', async () => {
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(13);
  });

  it('hides the deprecated legacy tool from the listing', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).not.toContain('deepthinking');
  });

  it('advertises every tool with a usable input schema', async () => {
    const { tools } = await client.listTools();
    for (const tool of tools) {
      expect(tool.inputSchema, `${tool.name} has no inputSchema`).toBeDefined();
      expect((tool.inputSchema as any).type).toBe('object');
    }
  });
});

// ===========================================================================
// tools/call -- the real CallToolRequestSchema dispatch
// ===========================================================================

describe('entry point: tools/call reaches the real handlers', () => {
  it('creates a session and a thought through deepthinking_standard', async () => {
    const result = await client.callTool({
      name: 'deepthinking_standard',
      arguments: {
        mode: 'sequential',
        thought: 'first step of the argument',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
      },
    });

    const payload = payloadOf(result);
    expect(payload.sessionId).toBeTruthy();
    expect(payload.thoughtId).toBeTruthy();
    expect(payload.mode).toBe('sequential');
    expect(payload.thoughtNumber).toBe(1);
    expect(payload.totalThoughts).toBe(1);
    expect(payload.modeStatus.hasSpecializedHandler).toBe(true);
  });

  /**
   * Ties the four modes wired in `ae440ab` to the real dispatch. The schema
   * tests prove Zod accepts them; this proves a CLIENT can actually call one
   * and that the mode-specific payload reaches the handler through the server.
   */
  it.each([
    ['deepthinking_probabilistic', 'stochastic'],
    ['deepthinking_strategic', 'constraint'],
    ['deepthinking_scientific', 'modal'],
    ['deepthinking_engineering', 'recursive'],
  ])('accepts a %s call in mode %s', async (name, mode) => {
    const result = await client.callTool({
      name,
      arguments: {
        mode,
        thought: `probing ${mode} through the real dispatch`,
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      },
    });

    const payload = payloadOf(result);
    expect(payload.mode).toBe(mode);
    expect(payload.modeStatus.hasSpecializedHandler).toBe(true);
    expect(payload.modeStatus.isFullyImplemented).toBe(true);
  });

  it('carries mode-specific fields all the way to the stored thought', async () => {
    const created = await client.callTool({
      name: 'deepthinking_probabilistic',
      arguments: {
        mode: 'stochastic',
        thought: 'a two-state weather chain',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        processType: 'discrete_time',
        currentState: 's0',
        stepCount: 7,
        markovChain: {
          id: 'mc1',
          states: [{ id: 's0', name: 'sunny' }, { id: 's1', name: 'rainy' }],
          transitions: [{ fromState: 's0', toState: 's1', probability: 1 }],
          initialDistribution: { s0: 1 },
        },
      },
    });
    const { sessionId } = payloadOf(created);

    // Read it back through a SECOND real handler. `get_session` deliberately
    // returns a summary (id/title/mode/thoughtCount/metrics) with no thoughts,
    // so the JSON export is the only client-reachable path to a stored
    // thought's mode-specific content.
    const fetched: any = await client.callTool({
      name: 'deepthinking_session',
      arguments: { action: 'export', sessionId, exportFormat: 'json' },
    });
    expect(fetched.isError).toBeFalsy();
    const session = JSON.parse(fetched.content[0].text);
    const thought = session.thoughts[0];

    expect(thought.mode).toBe('stochastic');
    expect(thought.processType).toBe('discrete_time');
    expect(thought.currentState).toBe('s0');
    expect(thought.stepCount).toBe(7);
    expect(thought.markovChain.states).toHaveLength(2);
    expect(thought.markovChain.transitions[0].toState).toBe('s1');
  });

  it('appends to an existing session rather than starting a new one', async () => {
    const first = payloadOf(
      await client.callTool({
        name: 'deepthinking_core',
        arguments: {
          mode: 'deductive',
          thought: 'all ravens are birds',
          thoughtNumber: 1,
          totalThoughts: 2,
          nextThoughtNeeded: true,
        },
      })
    );

    const second = payloadOf(
      await client.callTool({
        name: 'deepthinking_core',
        arguments: {
          sessionId: first.sessionId,
          mode: 'deductive',
          thought: 'this is a raven, therefore it is a bird',
          thoughtNumber: 2,
          totalThoughts: 2,
          nextThoughtNeeded: false,
        },
      })
    );

    expect(second.sessionId).toBe(first.sessionId);
    expect(second.totalThoughts).toBe(2);
    expect(second.sessionComplete).toBe(true);
  });

  it('exports a session through the real export path', async () => {
    const { sessionId } = payloadOf(
      await client.callTool({
        name: 'deepthinking_standard',
        arguments: {
          mode: 'sequential',
          thought: 'something worth exporting',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
        },
      })
    );

    const result = await client.callTool({
      name: 'deepthinking_session',
      arguments: { action: 'export', sessionId, exportFormat: 'markdown' },
    });

    expect(result.isError).toBeFalsy();
    expect((result as any).content[0].text).toContain('something worth exporting');
  });
});

// ===========================================================================
// Error paths -- also unreachable before this file existed
// ===========================================================================

describe('entry point: error handling in the real dispatch', () => {
  it('reports an unknown tool as a tool error, not a transport crash', async () => {
    const result: any = await client.callTool({
      name: 'deepthinking_does_not_exist',
      arguments: { thought: 'x', thoughtNumber: 1, totalThoughts: 1, nextThoughtNeeded: false },
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Unknown tool');
  });

  it('surfaces a Zod rejection as a tool error rather than throwing', async () => {
    const result: any = await client.callTool({
      name: 'deepthinking_standard',
      arguments: {
        mode: 'sequential',
        thought: 'missing required counters',
        nextThoughtNeeded: false,
      },
    });
    expect(result.isError).toBe(true);
  });

  it('rejects a mode the tool does not own', async () => {
    const result: any = await client.callTool({
      name: 'deepthinking_standard',
      arguments: {
        mode: 'bayesian',
        thought: 'wrong tool for this mode',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      },
    });
    expect(result.isError).toBe(true);
  });

  it('keeps serving after an error', async () => {
    const result = await client.callTool({
      name: 'deepthinking_standard',
      arguments: {
        mode: 'sequential',
        thought: 'still alive',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      },
    });
    expect(payloadOf(result).sessionId).toBeTruthy();
  });
});

// ===========================================================================
// The legacy tool -- hidden from tools/list but still callable
// ===========================================================================

describe('entry point: the hidden legacy tool still answers', () => {
  /**
   * `CLAUDE.md` claims the legacy `deepthinking` handler is retained for callers
   * that hardcode the name. Nothing verified that claim; the tool is absent from
   * `tools/list`, so only a direct call can prove it.
   */
  it('still handles a call to the unlisted "deepthinking" name', async () => {
    const result: any = await client.callTool({
      name: 'deepthinking',
      arguments: {
        action: 'add_thought',
        mode: 'sequential',
        thought: 'via the deprecated surface',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
      },
    });

    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('DEPRECATED');
  });
});
