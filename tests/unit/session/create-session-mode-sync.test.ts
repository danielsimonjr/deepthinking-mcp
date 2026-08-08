/**
 * `createSession({ mode })` must set the session's mode in BOTH places.
 *
 * A session carries its mode twice: `session.mode` and
 * `session.config.modeConfig.mode`. `switchMode` updates both. `createSession`
 * updated only the first, leaving `config.modeConfig.mode` at the
 * `DEFAULT_CONFIG` value of `hybrid` — so a session created as `bayesian`
 * reported itself as `bayesian` at the top level and `hybrid` in its own
 * config, until an unrelated `switchMode` call happened to repair it.
 *
 * Two fields that disagree about the same fact are worse than one wrong field:
 * which one a consumer reads decides what it does, and both look authoritative.
 */
import { describe, it, expect } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThinkingMode } from '../../../src/types/core.js';

describe('createSession mode synchronisation', () => {
  it('sets config.modeConfig.mode to the requested mode, not the default', async () => {
    const manager = new SessionManager();
    const session = await manager.createSession({ mode: ThinkingMode.BAYESIAN });

    expect(session.mode).toBe(ThinkingMode.BAYESIAN);
    expect(session.config.modeConfig.mode).toBe(ThinkingMode.BAYESIAN);
  });

  it('leaves the default in place when no mode is requested', async () => {
    const manager = new SessionManager();
    const session = await manager.createSession();

    expect(session.mode).toBe(ThinkingMode.HYBRID);
    expect(session.config.modeConfig.mode).toBe(ThinkingMode.HYBRID);
  });

  it('does not discard the caller\'s other modeConfig settings', async () => {
    // The fix must set one field, not replace the whole object.
    const manager = new SessionManager();
    const session = await manager.createSession({
      mode: ThinkingMode.CAUSAL,
      config: {
        modeConfig: {
          mode: ThinkingMode.HYBRID, // deliberately contradicts `mode` above
          strictValidation: true,
          allowModeSwitch: false,
        },
      },
    });

    // The explicit `mode` argument is the one the caller acted on, so it wins.
    expect(session.mode).toBe(ThinkingMode.CAUSAL);
    expect(session.config.modeConfig.mode).toBe(ThinkingMode.CAUSAL);
    // ...but the rest of their config survives.
    expect(session.config.modeConfig.strictValidation).toBe(true);
    expect(session.config.modeConfig.allowModeSwitch).toBe(false);
  });

  it('agrees with switchMode, which already synchronised both', async () => {
    const manager = new SessionManager();
    const session = await manager.createSession({ mode: ThinkingMode.BAYESIAN });
    const switched = await manager.switchMode(session.id, ThinkingMode.CAUSAL);

    expect(switched.mode).toBe(ThinkingMode.CAUSAL);
    expect(switched.config.modeConfig.mode).toBe(ThinkingMode.CAUSAL);
  });
});
