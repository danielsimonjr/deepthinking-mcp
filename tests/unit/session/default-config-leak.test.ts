import { describe, it, expect } from 'vitest';
import { SessionManager } from '../../../src/session/manager.js';
import { ThinkingMode } from '../../../src/types/core.js';

describe('DEFAULT_CONFIG must not be mutated by a session', () => {
  it('switchMode on one session does not change the default for the next', async () => {
    const manager = new SessionManager();
    const a = await manager.createSession();
    await manager.switchMode(a.id, ThinkingMode.CAUSAL);

    // A brand-new session with no mode requested must still be hybrid.
    const b = await manager.createSession();
    expect(b.config.modeConfig.mode).toBe(ThinkingMode.HYBRID);
  });
});
