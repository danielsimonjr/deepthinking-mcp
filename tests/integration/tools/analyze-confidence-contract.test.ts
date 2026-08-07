/**
 * `deepthinking_analyze` must not report a confidence it did not compute.
 *
 * History: the analyser emitted `0.8 x <a per-mode literal>` with no handler
 * running, so the same score came back for two unrelated problems. v9.4.0
 * stopped fabricating it and marks each insight `confidenceBasis: "unavailable"`
 * with a note — but `analyzeOutputSchema` still REQUIRED `confidenceScore`, so
 * a constant `0.5` kept reaching clients through the MCP response while the
 * explanation stayed behind in the analysis object.
 *
 * A required numeric field is not a neutral default: a client reading
 * `confidenceScore: 0.5` cannot tell "half confident" from "nothing computed
 * this". The number must be able to be ABSENT, and the basis must travel with
 * the response.
 */
import { describe, it, expect } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { server } from '../../../src/index.js';

const IMPORT_GRAPH_TIMEOUT_MS = 60_000;

async function analyze(args: Record<string, unknown>) {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'confidence-contract', version: '1.0.0' }, { capabilities: {} });
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  try {
    const res = await client.callTool({ name: 'deepthinking_analyze', arguments: args });
    const text = (res as { content: { text: string }[] }).content[0].text;
    return JSON.parse(text);
  } finally {
    await client.close();
  }
}

describe('deepthinking_analyze confidence contract', () => {
  it(
    'omits confidenceScore rather than reporting a number nothing derived',
    async () => {
      const out = await analyze({
        thought: 'Should we migrate the monolith to microservices?',
        preset: 'comprehensive_analysis',
      });

      // Nothing in the analyze path can derive a confidence: the input schema
      // accepts no mode-specific field, so no handler has a prior, likelihood
      // or payoff matrix to compute from.
      expect(out.confidenceScore).toBeUndefined();
      expect(out.confidenceBasis).toBe('unavailable');
      expect(typeof out.confidenceNote).toBe('string');
      expect(out.confidenceNote.length).toBeGreaterThan(0);
    },
    IMPORT_GRAPH_TIMEOUT_MS,
  );

  it(
    'carries the basis onto every insight, and omits per-insight confidence',
    async () => {
      const out = await analyze({
        thought: 'How should we model queue wait times under bursty arrivals?',
        customModes: ['stochastic', 'modal'],
      });

      expect(out.primaryInsights.length).toBeGreaterThan(0);
      for (const insight of out.primaryInsights) {
        expect(insight.confidence).toBeUndefined();
        expect(insight.confidenceBasis).toBe('unavailable');
      }
    },
    IMPORT_GRAPH_TIMEOUT_MS,
  );

  it(
    'still returns insights — the preset must not be emptied by an unscored analysis',
    async () => {
      // Regression guard: removing the fabricated 0.8 once emptied the default
      // preset, because mergeWeighted multiplies before thresholding and only
      // the fake number ever cleared the 0.5 cut.
      const out = await analyze({
        thought: 'Should we migrate the monolith to microservices?',
        preset: 'comprehensive_analysis',
      });

      expect(out.primaryInsights.length).toBeGreaterThan(0);
      expect(out.contributingModes.length).toBeGreaterThan(0);
    },
    IMPORT_GRAPH_TIMEOUT_MS,
  );
});
