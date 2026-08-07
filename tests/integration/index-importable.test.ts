/**
 * `src/index.ts` must be importable without starting the stdio server.
 *
 * This is the root cause of this repository's dead code. `main()` was invoked
 * at module scope, so importing the module started the server and no test
 * could import it. `tests/integration/index-handlers.test.ts` therefore
 * RE-IMPLEMENTS the handlers instead of exercising them: the real handlers
 * drift unobserved, anything reachable only from them dies, and the suite
 * stays green throughout. Roughly 62 files (28% of `src/`) went dead this way,
 * including four whole subsystems.
 *
 * The fix is an entry-point guard: `main()` runs when the file is executed as
 * a program, and not when it is imported. These tests pin that.
 *
 * The transport is mocked rather than timed. `main()` was called but never
 * awaited, so its startup log lands on a later tick — a test that merely
 * checked "nothing logged yet" would pass vacuously even with the bug present.
 * Asserting the transport constructor was never called is deterministic.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const transportConstructed = vi.fn();

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: class {
    constructor() {
      transportConstructed();
    }
  },
}));

/**
 * Importing this module pulls in the entire application graph, and the
 * one-time transform of it measured ~10s here — past vitest's 5s default, so
 * these tests timed out before reaching their assertions.
 *
 * This timeout is NOT a performance assertion and must never be read as one:
 * it is headroom for a transform, and nothing in this file gates on elapsed
 * time. The behaviour under test is asserted by mocking the transport.
 */
const IMPORT_GRAPH_TIMEOUT_MS = 60_000;

describe('src/index.ts entry-point guard', () => {
  beforeEach(() => {
    transportConstructed.mockClear();
  });

  it('does not construct a stdio transport when merely imported', async () => {
    vi.resetModules();
    transportConstructed.mockClear();

    await import('../../src/index.js');

    // Give any un-awaited module-scope promise a chance to run, so this
    // cannot pass just because the side effect had not happened yet.
    await new Promise((resolve) => setImmediate(resolve));

    expect(transportConstructed).not.toHaveBeenCalled();
  }, IMPORT_GRAPH_TIMEOUT_MS);

  it('exports main, so the entry point is explicit and reachable from a test', async () => {
    const mod = await import('../../src/index.js');
    expect(typeof (mod as { main?: unknown }).main).toBe('function');
  }, IMPORT_GRAPH_TIMEOUT_MS);

  it('exports the server instance so handlers can be exercised, not re-implemented', async () => {
    const mod = await import('../../src/index.js');
    expect((mod as { server?: unknown }).server).toBeDefined();
  }, IMPORT_GRAPH_TIMEOUT_MS);
});
