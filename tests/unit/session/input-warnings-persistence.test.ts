/**
 * A thought that carries `inputWarnings` survives a save and a load.
 *
 * `inputWarnings` is a field of the stored thought, so a persisted session holds
 * it. The tests save a session through FileSessionStore, load it again, and
 * check three things: a thought with the field loads with the field, a thought
 * without it loads exactly as it was saved, and a session saved without any
 * such thought loads as before.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import * as path from "path";
import * as os from "os";
import { FileSessionStore } from "../../../src/session/storage/file-store.js";
import { EngineeringHandler } from "../../../src/modes/handlers/EngineeringHandler.js";
import { validateAdvisory } from "../../../src/validation/advisory.js";
import { ThinkingMode } from "../../../src/types/index.js";
import type { ThinkingSession } from "../../../src/types/index.js";
import type { ThinkingToolInput } from "../../../src/tools/thinking.js";

const WARNING =
  'Unknown analysisType "bogus"; using the default "comprehensive". Recognised values: requirements, trade-study, fmea, design-decision, comprehensive.';

function sessionWith(thoughts: unknown[]): ThinkingSession {
  return {
    id: randomUUID(),
    title: "Input warnings",
    mode: ThinkingMode.ENGINEERING,
    domain: "testing",
    config: {
      modeConfig: {
        mode: ThinkingMode.ENGINEERING,
        strictValidation: false,
        allowModeSwitch: true,
      },
      enableAutoSave: true,
      enableValidation: true,
      enableVisualization: true,
      integrations: {},
      exportFormats: ["json"],
      autoExportOnComplete: false,
      maxThoughtsInMemory: 1000,
      compressionThreshold: 500,
    },
    thoughts,
    createdAt: new Date(),
    updatedAt: new Date(),
    currentThoughtNumber: thoughts.length,
    isComplete: false,
    metrics: {
      totalThoughts: thoughts.length,
      thoughtsByType: {},
      averageUncertainty: 0,
      revisionCount: 0,
      timeSpent: 0,
      dependencyDepth: 0,
      customMetrics: new Map(),
    },
    collaborators: [],
    tags: [],
  } as unknown as ThinkingSession;
}

/** A thought made by the real handler, with the validation the session manager attaches. */
async function engineeringThought(
  thoughtNumber: number,
  extra: Record<string, unknown>,
) {
  const input = {
    thought: `engineering thought ${thoughtNumber}`,
    thoughtNumber,
    totalThoughts: 3,
    nextThoughtNeeded: true,
    mode: "engineering",
    designChallenge: "choose a bearing",
    ...extra,
  } as unknown as ThinkingToolInput;
  const thought = new EngineeringHandler().createThought(input, "s");
  thought.validation = await validateAdvisory(thought);
  return thought;
}

describe("FileSessionStore and inputWarnings", () => {
  let store: FileSessionStore;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `deepthinking-input-warnings-${randomUUID()}`);
    store = new FileSessionStore(tempDir);
    await store.initialize();
  });

  afterEach(async () => {
    await store.close();
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("loads a thought with inputWarnings with the field intact", async () => {
    const warned = await engineeringThought(1, { analysisType: "bogus" });
    expect(warned.inputWarnings).toEqual([WARNING]);
    const session = sessionWith([warned]);

    await store.saveSession(session);
    const loaded = await store.loadSession(session.id);

    const thought = loaded!.thoughts[0] as any;
    expect(thought.inputWarnings).toEqual([WARNING]);
    expect(thought.validation.issues.map((i: any) => i.description)).toContain(
      WARNING,
    );
  });

  it("loads a thought without inputWarnings exactly as it was saved, with no field added", async () => {
    const plain = await engineeringThought(1, { analysisType: "fmea" });
    expect("inputWarnings" in plain).toBe(false);
    const session = sessionWith([plain]);

    await store.saveSession(session);
    const loaded = await store.loadSession(session.id);

    const thought = loaded!.thoughts[0] as any;
    expect("inputWarnings" in thought).toBe(false);
    expect(JSON.stringify(thought)).toBe(JSON.stringify(plain));
  });

  it("loads a session that mixes the two kinds, each as saved", async () => {
    const warned = await engineeringThought(1, { analysisType: "bogus" });
    const plain = await engineeringThought(2, {});
    const session = sessionWith([warned, plain]);

    await store.saveSession(session);
    const loaded = await store.loadSession(session.id);

    expect(JSON.stringify(loaded!.thoughts)).toBe(
      JSON.stringify([warned, plain]),
    );
    expect(loaded!.thoughts).toHaveLength(2);
  });

  it("control: the round trip would notice a dropped field", async () => {
    const warned = await engineeringThought(1, { analysisType: "bogus" });
    const dropped = JSON.parse(JSON.stringify(warned));
    delete dropped.inputWarnings;
    expect(JSON.stringify(dropped)).not.toBe(JSON.stringify(warned));
  });
});
